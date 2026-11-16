// The app's promises, checked against a real database. Each test is a short
// story about real people; nothing here is mocked.
const {
  db, HERE, resetDatabase, startCapturingLogs, stopCapturingLogs, lastLink,
  post, get, del, signUp, saveTag, share, nearbyNames, arrive, row, backdate, photoOnDisk, removeUploads,
} = require('./helpers');
const { runCleanup, SHUTDOWN_STALE_MINUTES } = require('../../cleanup');

beforeAll(async () => { await resetDatabase(); startCapturingLogs(); });
beforeEach(async () => { await db.query('DELETE FROM users'); });
afterAll(async () => { stopCapturingLogs(); removeUploads(); await db.end(); });

describe('accounts', () => {
  it('signs up by email link, and only then lets you sign in', async () => {
    const reg = await post('/api/auth/register', { email: 'Ada@Example.com ', password: 'password1' });
    expect(reg.body).toEqual({ ok: true, pending: true });

    const early = await post('/api/auth/login', { email: 'ada@example.com', password: 'password1' });
    expect(early.status).toBe(403);
    expect(early.body.needsVerification).toBe(true);

    const link = lastLink('verify');
    expect((await post('/api/auth/verify-email', { token: link })).status).toBe(200);
    expect((await post('/api/auth/verify-email', { token: link })).status).toBe(400);   // one use only
    expect((await post('/api/auth/login', { email: 'ada@example.com', password: 'password1' })).status).toBe(200);
  });

  it('answers the same whether or not the email already has an account', async () => {
    await signUp('taken@example.com');
    const again = await post('/api/auth/register', { email: 'taken@example.com', password: 'different1' });
    expect(again.body).toEqual({ ok: true, pending: true });
    // …and the original password still works: the second sign-up changed nothing
    expect((await post('/api/auth/login', { email: 'taken@example.com', password: 'password1' })).status).toBe(200);
  });

  it('a password reset signs out old sessions and confirms the email', async () => {
    await post('/api/auth/register', { email: 'unv@example.com', password: 'password1' });   // never verified
    await post('/api/auth/forgot-password', { email: 'unv@example.com' });
    expect((await post('/api/auth/reset-password', { token: lastLink('reset'), password: 'brandnew99' })).status).toBe(200);
    expect((await post('/api/auth/login', { email: 'unv@example.com', password: 'brandnew99' })).status).toBe(200);

    const ada = await signUp('ada@example.com');
    await post('/api/auth/forgot-password', { email: 'ada@example.com' });
    await post('/api/auth/reset-password', { token: lastLink('reset'), password: 'brandnew99' });
    expect((await get('/api/profiles/me', ada.token)).status).toBe(401);   // the old session is dead
  });

  it('deleting an account removes everything, including the photo file', async () => {
    const ada = await signUp('ada@example.com');
    await saveTag(ada, { display_name: 'Ada' }, {});
    const { photo_path } = await row(ada);
    expect(photoOnDisk(photo_path)).toBe(true);

    expect((await del('/api/profiles/me', ada.token)).status).toBe(200);

    expect(photoOnDisk(photo_path)).toBe(false);
    expect((await db.query('SELECT 1 FROM users WHERE id = $1', [ada.userId])).rowCount).toBe(0);
    expect((await db.query('SELECT 1 FROM profiles WHERE user_id = $1', [ada.userId])).rowCount).toBe(0);
    expect((await get('/api/profiles/me', ada.token)).status).toBe(401);
  });
});

describe('the wall', () => {
  it('shows people in the same room to each other — and nothing about where they are', async () => {
    const ada = await arrive('ada@example.com', 'Ada', { tagline: 'Here for the coffee' });
    await arrive('otto@example.com', 'Otto');

    const res = await get('/api/profiles/nearby', ada.token);
    expect(res.body.map(p => p.display_name)).toEqual(['Otto']);
    expect(Object.keys(res.body[0]).sort()).toEqual(
      ['display_name', 'id', 'photo_path', 'pronouns', 'stickers', 'tag_color', 'tagline']
    );
  });

  it('stores a rounded position, not the exact GPS fix', async () => {
    const ada = await arrive('ada@example.com', 'Ada');
    const { lat, lng } = await row(ada);
    expect([lat, lng]).toEqual([37.7749, -122.4194]);
  });

  it('does not show people who are somewhere else, however large a radius is asked for', async () => {
    const ada = await arrive('ada@example.com', 'Ada', { radius_meters: 30000000 });
    const far = await arrive('far@example.com', 'Faraway');
    await share(far, { latitude: 37.80, longitude: -122.42 });   // ~3 km away
    expect((await row(ada)).radius_meters).toBe(1000);
    expect(await nearbyNames(ada)).toEqual([]);
  });

  it('can save a tag again and again (create, then update)', async () => {
    const ada = await signUp('ada@example.com');
    expect((await saveTag(ada, { display_name: 'Ada' })).status).toBe(200);
    expect((await saveTag(ada, { display_name: 'Ada B', party_code: 'summer-42' })).status).toBe(200);
    expect((await saveTag(ada, { display_name: 'Ada C', party_code: '' })).status).toBe(200);
    expect(await row(ada)).toMatchObject({ display_name: 'Ada C', party_code: null, party_code_set_at: null });
  });

  it('only stores real images, under a name it chose itself', async () => {
    const ada = await signUp('ada@example.com');
    await saveTag(ada, { display_name: 'Ada' }, { filename: 'evil.html', type: 'image/png' });
    expect((await row(ada)).photo_path).toMatch(/^\/uploads\/[0-9a-f]{32}\.png$/);

    const svg = await saveTag(ada, {}, { buffer: Buffer.from('<svg onload="alert(1)"/>'), filename: 'x.svg', type: 'image/svg+xml' });
    expect(svg.status).toBe(400);
  });
});

describe('party codes', () => {
  it('keep the party and everyone else apart, in both directions', async () => {
    const ada = await arrive('ada@example.com', 'Ada', { party_code: 'summer-42' });
    const bea = await arrive('bea@example.com', 'Bea', { party_code: 'SUMMER 42' });   // same code, said differently
    const otto = await arrive('otto@example.com', 'Otto');

    expect(await nearbyNames(ada)).toEqual(['Bea']);
    expect(await nearbyNames(bea)).toEqual(['Ada']);
    expect(await nearbyNames(otto)).toEqual([]);
  });

  it('run out after four hours: the member goes invisible, not public', async () => {
    const ada = await arrive('ada@example.com', 'Ada', { party_code: 'SUMMER42' });
    const bea = await arrive('bea@example.com', 'Bea', { party_code: 'SUMMER42' });
    await backdate(ada, 'party_code_set_at', '5 hours');

    expect(await nearbyNames(bea)).toEqual([]);                       // gone from the party at once
    const res = await get('/api/profiles/nearby', ada.token);
    expect(res.status).toBe(409);
    expect(res.body.partyExpired).toBe(true);
    expect(await row(ada)).toMatchObject({ display_name: null, lat: null, party_code: null, always_visible: false });
  });

  it('keep their original start time when a tag is restored from the device', async () => {
    const ada = await arrive('ada@example.com', 'Ada', { party_code: 'SUMMER42' });
    const started = (await row(ada)).party_code_set_at;
    await post('/api/profiles/me/leave', {}, ada.token);
    await saveTag(ada, { display_name: 'Ada', party_code: 'SUMMER42', party_code_set_at: started.toISOString() });
    expect((await row(ada)).party_code_set_at.getTime()).toBe(started.getTime());

    // …and a stale start time can't be used to rejoin a party that's over
    const late = await saveTag(ada, { party_code: 'SUMMER42', party_code_set_at: new Date(Date.now() - 5 * 3600e3).toISOString() });
    expect(late.status).toBe(409);
  });
});

describe('coming off the wall', () => {
  it('invisible deletes the tag, photo, location and party code at once — and sticks', async () => {
    const ada = await signUp('ada@example.com');
    await saveTag(ada, { display_name: 'Ada', party_code: 'SUMMER42' }, {});
    await share(ada);
    const { photo_path } = await row(ada);

    await post('/api/profiles/me/visibility', { is_active: false }, ada.token);

    expect(photoOnDisk(photo_path)).toBe(false);
    expect(await row(ada)).toMatchObject({
      display_name: null, pronouns: null, tagline: null, photo_path: null,
      lat: null, lng: null, location_updated_at: null, party_code: null,
      always_visible: false, is_active: false,
    });

    // a location sent while invisible is not stored at all
    const res = await share(ada);
    expect(res.body.has_tag).toBe(false);
    expect((await row(ada)).lat).toBeNull();
  });

  it('closing the app deletes the tag but remembers you chose to be visible', async () => {
    const ada = await arrive('ada@example.com', 'Ada');
    const otto = await arrive('otto@example.com', 'Otto');

    await post('/api/profiles/me/leave', {}, ada.token);

    expect(await row(ada)).toMatchObject({ display_name: null, lat: null, always_visible: true });
    expect(await nearbyNames(otto)).toEqual([]);

    // coming back: the server says it has no tag, the device puts it back
    expect((await share(ada)).body.has_tag).toBe(false);
    await saveTag(ada, { display_name: 'Ada' });
    expect((await share(ada)).body.has_tag).toBe(true);
    expect(await nearbyNames(otto)).toEqual(['Ada']);
  });
});

describe('the clean-up sweep', () => {
  it('deletes a tag 30 minutes after its owner was last seen', async () => {
    const ada = await arrive('ada@example.com', 'Ada');
    const otto = await arrive('otto@example.com', 'Otto');
    await backdate(ada, 'location_updated_at', '31 minutes');

    expect(await nearbyNames(otto)).toEqual([]);   // already not shown
    await runCleanup();

    expect(await row(ada)).toMatchObject({ display_name: null, lat: null, always_visible: true });
    expect((await row(otto)).display_name).toBe('Otto');
  });

  it('on shutdown, deletes everything that is not in active use', async () => {
    const idle = await arrive('idle@example.com', 'Idle');
    const active = await arrive('active@example.com', 'Active');
    await backdate(idle, 'location_updated_at', '16 minutes');

    await runCleanup({ staleMinutes: SHUTDOWN_STALE_MINUTES });

    expect((await row(idle)).display_name).toBeNull();
    expect((await row(active)).display_name).toBe('Active');
  });

  it('ends parties that are over, and clears out old sign-up records', async () => {
    const ada = await arrive('ada@example.com', 'Ada', { party_code: 'SUMMER42' });
    await backdate(ada, 'party_code_set_at', '5 hours');
    await post('/api/auth/register', { email: 'ghost@example.com', password: 'password1' });
    await db.query(`UPDATE users SET created_at = NOW() - INTERVAL '3 days' WHERE email = 'ghost@example.com'`);

    await runCleanup();

    expect(await row(ada)).toMatchObject({ display_name: null, party_code: null, always_visible: false });
    expect((await db.query(`SELECT 1 FROM users WHERE email = 'ghost@example.com'`)).rowCount).toBe(0);
    expect((await db.query('SELECT 1 FROM email_verification_tokens WHERE used = TRUE')).rowCount).toBe(0);
    expect((await db.query(`SELECT 1 FROM users WHERE email = 'ada@example.com'`)).rowCount).toBe(1);
  });
});
