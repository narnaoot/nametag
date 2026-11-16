const { test, expect } = require('@playwright/test');
const app = require('../support/app');

test.beforeEach(app.emptyRoom);

test('an edit is kept when you tap Done straight away', async ({ browser }) => {
  const ada = await app.device(browser);
  await app.join(ada, 'ada@example.com', 'Ada');
  await app.goTo(ada, 'My tag');
  await app.rename(ada, 'Ada Quick');
  await app.doneButton(ada).click();                 // inside the auto-save delay

  await app.onTheWall(ada);
  await expect(app.tagOf(ada, 'Ada Quick')).toBeVisible();
  expect((await app.serverCopy('ada@example.com')).name).toBe('Ada Quick');
});

test('an edit is kept when you switch tabs straight away', async ({ browser }) => {
  const ada = await app.device(browser);
  await app.join(ada, 'ada@example.com', 'Ada');
  await app.goTo(ada, 'My tag');
  await app.rename(ada, 'Ada Tab');
  await app.goTo(ada, 'Nearby');

  await expect(app.tagOf(ada, 'Ada Tab')).toBeVisible();
  expect((await app.serverCopy('ada@example.com')).name).toBe('Ada Tab');
});

test('Done with no name stays on the page and says why', async ({ browser }) => {
  const ada = await app.device(browser);
  await app.join(ada, 'ada@example.com', 'Ada');
  await app.goTo(ada, 'My tag');
  await app.rename(ada, '');
  await app.doneButton(ada).click();

  await expect(ada.getByText('Add your name and pronouns.')).toBeVisible();
  expect((await app.serverCopy('ada@example.com')).name).toBe('Ada');
});

test('a photo is cropped on the device and shown on the tag', async ({ browser }) => {
  const ada = await app.device(browser);
  await app.join(ada, 'ada@example.com', 'Ada');
  await app.goTo(ada, 'My tag');
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC', 'base64');
  await ada.locator('input[type=file]').setInputFiles({ name: 'me.png', mimeType: 'image/png', buffer: png });

  await expect.poll(async () => (await app.serverCopy('ada@example.com')).photo).toMatch(/^\/uploads\/[0-9a-f]{32}\.jpg$/);
});
