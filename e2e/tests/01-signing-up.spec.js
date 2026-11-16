const { test, expect } = require('@playwright/test');
const app = require('../support/app');

test.beforeEach(app.emptyRoom);

test('sign up by email link, make a tag, land on the wall', async ({ browser }) => {
  const ada = await app.device(browser);
  await app.signUp(ada, 'ada@example.com');
  await ada.getByPlaceholder('Maya').fill('Ada');
  await ada.locator('.na-chip', { hasText: 'she/her' }).click();
  await ada.getByPlaceholder('Here for the oat cortado').fill('Here for the coffee');
  await ada.getByRole('button', { name: 'Next → photo' }).click();
  await ada.getByRole('button', { name: 'Look around me' }).click();

  await app.onTheWall(ada);
  await expect(app.tagOf(ada, 'Ada')).toBeVisible();
  await expect.poll(async () => (await app.serverCopy('ada@example.com'))?.name).toBe('Ada');
});

test('a verification link works once; using it again says to sign in', async ({ browser }) => {
  const ada = await app.device(browser);
  const link = await app.createAccount(ada, 'ada@example.com');
  await ada.goto(`/?verify=${link}`);
  await expect(ada.getByText('Step 1 of 2')).toBeVisible();

  const elsewhere = await app.device(browser);
  await elsewhere.goto(`/?verify=${link}`);
  await expect(elsewhere.getByText('This link didn’t work')).toBeVisible();
  await expect(elsewhere.getByRole('button', { name: 'Sign in' })).toBeVisible();
});

test('skipping onboarding asks you to make a tag, not to turn on location', async ({ browser }) => {
  const ada = await app.device(browser);
  await app.signUp(ada, 'ada@example.com');
  await ada.locator('button', { hasText: /^Skip$/ }).click();

  await expect(app.headline(ada, 'Make your tag first')).toBeVisible();
  await expect(app.headline(ada, 'Turn on location')).toHaveCount(0);

  await ada.getByRole('button', { name: 'Make my tag' }).click();
  await app.rename(ada, 'Ada');
  await app.doneButton(ada).click();
  await app.onTheWall(ada);
  await expect(app.tagOf(ada, 'Ada')).toBeVisible();
});

test('a second account on the same device starts clean; deleting clears the device', async ({ browser }) => {
  const phone = await app.device(browser);
  await app.join(phone, 'first@example.com', 'First');
  await app.goTo(phone, 'My tag');
  await phone.getByRole('button', { name: 'Sign out' }).click();

  await app.signUp(phone, 'second@example.com');
  await phone.locator('button', { hasText: /^Skip$/ }).click();
  await phone.getByRole('button', { name: 'Make my tag' }).click();
  await expect(phone.getByText('Add your name')).toBeVisible();       // not "First"
  expect(await app.serverCopy('second@example.com')).toBeNull();

  await app.rename(phone, 'Second');
  await expect(app.doneButton(phone)).toHaveText('Saved ✓');
  await phone.getByRole('button', { name: 'Delete account' }).click();
  await phone.getByRole('button', { name: 'Delete everything' }).click();
  await expect(phone.getByRole('button', { name: 'Continue with email' })).toBeVisible();
  expect(await app.onDevice(phone)).toEqual([]);
  expect(await app.sql(`SELECT 1 FROM users WHERE email = 'second@example.com'`)).toEqual([]);
});

test('forgotten password: reset by email link, then sign in with the new one', async ({ browser }) => {
  const ada = await app.device(browser);
  await app.join(ada, 'ada@example.com', 'Ada');

  const other = await app.device(browser);
  await other.goto('/');
  await other.getByRole('button', { name: 'Continue with email' }).click();
  await other.getByRole('button', { name: 'Forgot password?' }).click();
  await other.locator('input[type=email]').fill('ada@example.com');
  await other.locator('form button[type=submit]').click();
  await expect(other.getByText('a reset link is on its way')).toBeVisible();

  await other.goto(`/?reset=${await app.emailedLink('reset')}`);
  await other.locator('input[type=password]').fill('brandnew99');
  await other.locator('form button[type=submit]').click();
  await expect(other.getByText('Password updated')).toBeVisible();

  await app.signIn(other, 'ada@example.com', 'brandnew99');
  // the session on the first device was signed out by the reset
  await ada.getByRole('button', { name: 'Refresh' }).click();
  await expect(ada.getByRole('button', { name: 'Continue with email' })).toBeVisible();
});
