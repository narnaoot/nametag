const { test, expect } = require('@playwright/test');
const app = require('../support/app');

test.beforeEach(app.emptyRoom);

test('closing the app deletes your tag from the server; reopening puts it back', async ({ browser }) => {
  const ada = await app.device(browser);
  const otto = await app.device(browser);
  await app.join(ada, 'ada@example.com', 'Ada');
  await app.join(otto, 'otto@example.com', 'Otto');
  await expect(app.tagOf(otto, 'Ada')).toBeVisible();

  await ada.goto('about:blank');                     // the page closes
  await expect.poll(() => app.serverCopy('ada@example.com')).toMatchObject({ ...app.WIPED, visible: true });
  await app.doesNotSee(otto, 'Ada');

  await ada.goto('/');
  await app.onTheWall(ada);
  await expect.poll(async () => (await app.serverCopy('ada@example.com')).name).toBe('Ada');
  await app.sees(otto, 'Ada');
});

test('reloading leaves you on the wall', async ({ browser }) => {
  const ada = await app.device(browser);
  const otto = await app.device(browser);
  await app.join(ada, 'ada@example.com', 'Ada');
  await app.join(otto, 'otto@example.com', 'Otto');

  for (let i = 0; i < 3; i++) { await ada.reload(); await app.onTheWall(ada); }

  await expect.poll(async () => (await app.serverCopy('ada@example.com')).name).toBe('Ada');
  await app.sees(otto, 'Ada');
});

test('after 30 minutes away the server deletes your tag; the app restores it when you return', async ({ browser }) => {
  const ada = await app.device(browser);
  const otto = await app.device(browser);
  await app.join(ada, 'ada@example.com', 'Ada');
  await app.join(otto, 'otto@example.com', 'Otto');

  await app.backdate('ada@example.com', 'location_updated_at', '31 minutes');
  await app.doesNotSee(otto, 'Ada');                 // not shown from that moment
  app.sweep();
  expect(await app.serverCopy('ada@example.com')).toMatchObject({ ...app.WIPED, visible: true });

  await app.refresh(ada);                            // Ada comes back to the app
  await expect.poll(async () => (await app.serverCopy('ada@example.com')).name).toBe('Ada');
  await app.sees(otto, 'Ada');
});

test('lists left by removed features are deleted from the device on launch', async ({ browser }) => {
  const ada = await app.device(browser);
  await app.join(ada, 'ada@example.com', 'Ada');
  await ada.evaluate(() => {
    localStorage.setItem('CapacitorStorage.remembered_names', JSON.stringify([{ id: 1, name: 'Old Friend' }]));
    localStorage.setItem('CapacitorStorage.hidden_people', JSON.stringify([2, 3]));
  });
  await ada.reload();
  await app.onTheWall(ada);
  expect(await app.onDevice(ada)).toEqual(['nametag_token', 'profile_data', 'profile_owner']);
});
