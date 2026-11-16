const { test, expect } = require('@playwright/test');
const app = require('../support/app');

test.beforeEach(app.emptyRoom);

test('invisible deletes your tag from the server and sticks across tabs and reloads', async ({ browser }) => {
  const ada = await app.device(browser);
  const otto = await app.device(browser);
  await app.join(ada, 'ada@example.com', 'Ada');
  await app.join(otto, 'otto@example.com', 'Otto');
  await expect(app.tagOf(otto, 'Ada')).toBeVisible();

  await app.choose(ada, 'Invisible');
  await expect(app.headline(ada, 'You’re invisible')).toBeVisible();
  await expect.poll(() => app.serverCopy('ada@example.com')).toMatchObject({ ...app.WIPED, visible: false });
  await app.doesNotSee(otto, 'Ada');

  await app.goTo(ada, 'Privacy');
  await expect(ada.getByText('No one nearby can see your tag right now.')).toBeVisible();
  await app.goTo(ada, 'My tag');
  await expect(ada.getByText('Hidden right now')).toBeVisible();
  await ada.locator('nav button', { hasText: 'Nearby' }).click();
  await expect(app.headline(ada, 'You’re invisible')).toBeVisible();

  await ada.reload();
  await expect(app.headline(ada, 'You’re invisible')).toBeVisible();
  await ada.waitForTimeout(1500);                    // give a stray location share time to (wrongly) happen
  expect(await app.serverCopy('ada@example.com')).toMatchObject({ ...app.WIPED, visible: false });
  await app.doesNotSee(otto, 'Ada');
});

test('edits made while invisible stay on the device, and go up when you return', async ({ browser }) => {
  const ada = await app.device(browser);
  const otto = await app.device(browser);
  await app.join(ada, 'ada@example.com', 'Ada');
  await app.join(otto, 'otto@example.com', 'Otto');

  await app.choose(ada, 'Invisible');
  await expect(app.headline(ada, 'You’re invisible')).toBeVisible();
  await app.goTo(ada, 'My tag');
  await app.rename(ada, 'Ada B');
  await expect(app.doneButton(ada)).toHaveText('Saved ✓');
  expect(await app.serverCopy('ada@example.com')).toMatchObject(app.WIPED);

  await ada.locator('nav button', { hasText: 'Nearby' }).click();
  await app.choose(ada, 'Nearby');
  await app.onTheWall(ada);
  await expect.poll(async () => (await app.serverCopy('ada@example.com')).name).toBe('Ada B');
  await app.sees(otto, 'Ada B');
});

test('starting out invisible leaves nothing on the server', async ({ browser }) => {
  const ada = await app.device(browser);
  await app.signUp(ada, 'ada@example.com');
  await ada.getByPlaceholder('Maya').fill('Ada');
  await ada.getByRole('button', { name: 'Next → photo' }).click();
  await app.choose(ada, 'Invisible');
  await ada.getByRole('button', { name: 'Look around me' }).click();

  await expect(app.headline(ada, 'You’re invisible')).toBeVisible();
  await expect.poll(() => app.serverCopy('ada@example.com')).toMatchObject({ ...app.WIPED, visible: false });

  await app.choose(ada, 'Nearby');                   // …and the device can put it up later
  await expect.poll(async () => (await app.serverCopy('ada@example.com')).name).toBe('Ada');
});
