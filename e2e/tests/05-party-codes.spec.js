const { test, expect } = require('@playwright/test');
const app = require('../support/app');

test.beforeEach(app.emptyRoom);

test('a party and everyone else can’t see each other; hyphens and capitals don’t matter', async ({ browser }) => {
  const ada = await app.device(browser);
  const bea = await app.device(browser);
  const otto = await app.device(browser);
  await app.join(ada, 'ada@example.com', 'Ada');
  await app.join(bea, 'bea@example.com', 'Bea');
  await app.join(otto, 'otto@example.com', 'Otto');

  await app.joinParty(ada, 'summer-42');
  await expect(ada.getByText('Visible in party SUMMER42.')).toBeVisible();
  await app.joinParty(bea, 'Summer 42');
  await expect(bea.getByText('Visible in party SUMMER42.')).toBeVisible();

  await app.sees(ada, 'Bea');
  await expect(app.tagOf(ada, 'Otto')).toHaveCount(0);
  await app.doesNotSee(otto, 'Ada');
  await expect(app.tagOf(otto, 'Bea')).toHaveCount(0);
});

test('you can join a party from a device that has never seen your tag', async ({ browser }) => {
  const phone = await app.device(browser);
  await app.join(phone, 'ada@example.com', 'Ada');
  const laptop = await app.device(browser);
  await app.signIn(laptop, 'ada@example.com');

  await app.joinParty(laptop, 'SUMMER42');
  await expect(laptop.getByText('Visible in party SUMMER42.')).toBeVisible();
  expect((await app.serverCopy('ada@example.com')).party).toBe('SUMMER42');
});

test('a party code runs out after four hours: you go invisible and your tag is deleted', async ({ browser }) => {
  const ada = await app.device(browser);
  const bea = await app.device(browser);
  await app.join(ada, 'ada@example.com', 'Ada');
  await app.join(bea, 'bea@example.com', 'Bea');
  await app.joinParty(ada, 'SUMMER42');
  await app.joinParty(bea, 'SUMMER42');
  await app.sees(bea, 'Ada');

  // five hours later, on Ada's device and on the server
  await ada.evaluate(() => {
    const key = 'CapacitorStorage.profile_data';
    const tag = JSON.parse(localStorage.getItem(key));
    tag.party_code_set_at = new Date(Date.now() - 5 * 3600e3).toISOString();
    localStorage.setItem(key, JSON.stringify(tag));
  });
  await app.backdate('ada@example.com', 'party_code_set_at', '5 hours');

  await app.doesNotSee(bea, 'Ada');
  await ada.getByRole('button', { name: 'Refresh' }).click();
  await expect(app.headline(ada, 'The party’s over')).toBeVisible();
  await expect.poll(() => app.serverCopy('ada@example.com')).toMatchObject({ ...app.WIPED, visible: false });
  // …and the device has recorded it too (the server hears first, by a moment)
  await expect.poll(() => app.deviceTag(ada)).toMatchObject({ always_visible: false, party_code: '' });

  await ada.reload();
  await expect(app.headline(ada, 'You’re invisible')).toBeVisible();
});

test('a restored tag keeps its original party start time', async ({ browser }) => {
  const ada = await app.device(browser);
  await app.join(ada, 'ada@example.com', 'Ada');
  await app.joinParty(ada, 'SUMMER42');
  await expect(ada.getByText('Visible in party SUMMER42.')).toBeVisible();
  const started = (await app.serverCopy('ada@example.com')).party_started;

  await ada.reload();                                // closing wipes the server copy; reopening restores it
  await app.onTheWall(ada);
  await expect.poll(async () => (await app.serverCopy('ada@example.com')).party).toBe('SUMMER42');
  expect((await app.serverCopy('ada@example.com')).party_started.getTime()).toBe(started.getTime());
});
