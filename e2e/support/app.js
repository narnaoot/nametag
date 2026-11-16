// What the tests need to act like people using Nametag: sign up, make a tag,
// move around the app — plus a way to look at (and nudge) the server's database,
// because half of what Nametag promises is about what the server does NOT keep.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { expect } = require('@playwright/test');
const { DATABASE_URL, TMP } = require('./env');

const server = path.join(__dirname, '../../server');
const { Pool } = require(require.resolve('pg', { paths: [server] }));
const pool = new Pool({ connectionString: DATABASE_URL });

const SAME_ROOM = { latitude: 37.774929512, longitude: -122.419415534 };

// ── the database ───────────────────────────────────────────────────────────
async function sql(text, params) { return (await pool.query(text, params)).rows; }

// Start each test with nobody in the room.
async function emptyRoom() { await sql('DELETE FROM users'); }

// What the server holds for one person, by email.
async function serverCopy(email) {
  const [row] = await sql(
    `SELECT p.display_name AS name, p.lat, p.photo_path AS photo, p.party_code AS party,
            p.always_visible AS visible, p.party_code_set_at AS party_started
       FROM profiles p JOIN users u ON u.id = p.user_id WHERE u.email = $1`, [email]);
  return row ?? null;
}
// A server copy with nothing personal in it.
const WIPED = { name: null, lat: null, photo: null, party: null };

// Pretend time has passed for someone ("their app last checked in 31 minutes ago").
function backdate(email, column, interval) {
  return sql(
    `UPDATE profiles SET ${column} = NOW() - $2::interval
      WHERE user_id = (SELECT id FROM users WHERE email = $1)`, [email, interval]);
}

// Run the server's clean-up sweep now, instead of waiting for its timer.
function sweep() {
  execFileSync('node', ['-e', "require('./cleanup').runCleanup().then(() => process.exit(0))"], {
    cwd: server, env: { ...process.env, DATABASE_URL },
  });
}

// The most recent emailed link of a kind ('verify' | 'reset'), from the server log.
async function emailedLink(kind) {
  let found;
  await expect.poll(() => {
    const all = fs.readFileSync(path.join(TMP, 'server.log'), 'utf8').match(new RegExp(`${kind}=[0-9a-f]+`, 'g'));
    found = all?.[all.length - 1].split('=')[1];
    return !!found;
  }).toBe(true);
  return found;
}

// ── people ─────────────────────────────────────────────────────────────────
// A new person on their own device (a fresh browser profile), standing in the room.
async function device(browser, { viewport, location = SAME_ROOM } = {}) {
  const context = await browser.newContext({
    geolocation: location, permissions: ['geolocation'], ...(viewport ? { viewport } : {}),
  });
  return context.newPage();
}

async function createAccount(page, email, password = 'password1') {
  const before = await emailedLinkCount('verify');
  await page.goto('/');
  await page.getByRole('button', { name: 'Continue with email' }).click();
  await page.getByRole('button', { name: 'Create account' }).first().click();
  await page.locator('input[type=email]').fill(email);
  await page.locator('input[type=password]').fill(password);
  await page.locator('form button[type=submit]').click();
  await expect(page.getByText('Check your email')).toBeVisible();
  await expect.poll(() => emailedLinkCount('verify')).toBeGreaterThan(before);
  return emailedLink('verify');
}
function emailedLinkCount(kind) {
  const log = fs.existsSync(path.join(TMP, 'server.log')) ? fs.readFileSync(path.join(TMP, 'server.log'), 'utf8') : '';
  return (log.match(new RegExp(`${kind}=[0-9a-f]+`, 'g')) || []).length;
}

// Create an account and click the emailed link: lands on onboarding step 1.
async function signUp(page, email) {
  const link = await createAccount(page, email);
  await page.goto(`/?verify=${link}`);
  await expect(page.getByText('Step 1 of 2')).toBeVisible();
}

// Sign up and go through onboarding to the wall.
async function join(page, email, name, { pronouns = 'she/her', line = '', visibility } = {}) {
  await signUp(page, email);
  await page.getByPlaceholder('Maya').fill(name);
  await page.locator('.na-chip', { hasText: pronouns }).click();
  if (line) await page.getByPlaceholder('Here for the oat cortado').fill(line);
  await page.getByRole('button', { name: 'Next → photo' }).click();
  await expect(page.getByText('Step 2 of 2')).toBeVisible();
  if (visibility) await choose(page, visibility);
  await page.getByRole('button', { name: 'Look around me' }).click();
  await onTheWall(page);
}

async function signIn(page, email, password = 'password1') {
  await page.goto('/');
  await page.getByRole('button', { name: 'Continue with email' }).click();
  await page.locator('input[type=email]').fill(email);
  await page.locator('input[type=password]').fill(password);
  await page.locator('form button[type=submit]').click();
  await onTheWall(page);
}

// ── getting around ─────────────────────────────────────────────────────────
// The wall has finished loading (its header stops saying "Reading the room…").
async function onTheWall(page) {
  await expect(page.locator('.t-display', { hasText: 'Nearby' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Refresh' })).toBeEnabled({ timeout: 20_000 });
}
async function goTo(page, tab) {   // 'Nearby' | 'My tag' | 'Privacy'
  await page.locator('nav button', { hasText: tab }).click();
  if (tab === 'Nearby') await onTheWall(page);
}
async function refresh(page) {
  await page.getByRole('button', { name: 'Refresh' }).click();
  await onTheWall(page);
}
// The three-way visibility control (its buttons, unlike the tabs, are type=button).
async function choose(page, mode) {   // 'Invisible' | 'Nearby' | 'Party code'
  await page.locator('button[type=button]', { hasText: new RegExp(`^${mode}$`) }).click();
}
async function joinParty(page, code) {
  await choose(page, 'Party code');
  await page.getByPlaceholder('SUMMER-42').fill(code);
  await page.getByRole('button', { name: 'Join the party' }).click();
}

// ── what's on screen ───────────────────────────────────────────────────────
const tagOf = (page, name) => page.locator('.nt-tappable', { hasText: name });
const headline = (page, text) => page.locator('.t-h2', { hasText: text });   // "You’re invisible", "The party’s over"…
// The copy of your own tag that the device keeps.
const deviceTag = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('CapacitorStorage.profile_data')));
const onDevice = (page) => page.evaluate(() => Object.keys(localStorage).map(k => k.replace('CapacitorStorage.', '')).sort());

// A name people nearby can see, re-reading the room until it shows (or doesn't).
async function sees(page, name) {
  await expect(async () => { await refresh(page); await expect(tagOf(page, name)).toBeVisible({ timeout: 1000 }); }).toPass({ timeout: 15_000 });
}
async function doesNotSee(page, name) {
  await refresh(page);
  await expect(tagOf(page, name)).toHaveCount(0);
}

// My tag: open the name row and type a new name.
async function rename(page, name) {
  await page.locator('.t-label', { hasText: /^Name$/ }).click();
  await page.getByPlaceholder('What people call you').fill(name);
}
const doneButton = (page) => page.getByRole('button', { name: /^(Done|Saved ✓|Saving…)$/ });

module.exports = {
  SAME_ROOM, WIPED, sql, emptyRoom, serverCopy, backdate, sweep, emailedLink,
  device, createAccount, signUp, join, signIn,
  onTheWall, goTo, refresh, choose, joinParty,
  tagOf, headline, deviceTag, onDevice, sees, doesNotSee, rename, doneButton,
};
