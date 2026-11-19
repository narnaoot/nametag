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

test('a new photo is uploaded once, not again with every later edit', async ({ browser }) => {
  const ada = await app.device(browser);
  await app.join(ada, 'ada@example.com', 'Ada');
  await app.goTo(ada, 'My tag');
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC', 'base64');
  await ada.locator('input[type=file]').setInputFiles({ name: 'me.png', mimeType: 'image/png', buffer: png });
  await expect(app.doneButton(ada)).toHaveText('Saved ✓');
  const photo = (await app.serverCopy('ada@example.com')).photo;
  expect(photo).toBeTruthy();

  let photoUploads = 0;
  ada.on('request', (req) => {
    if (req.method() === 'PUT' && req.url().endsWith('/api/profiles/me') && (req.postData() || '').includes('name="photo"')) photoUploads++;
  });
  await app.rename(ada, 'Ada B');
  await expect(app.doneButton(ada)).toHaveText('Saved ✓');
  await expect.poll(async () => (await app.serverCopy('ada@example.com')).name).toBe('Ada B');

  expect(photoUploads).toBe(0);
  expect((await app.serverCopy('ada@example.com')).photo).toBe(photo);   // same file, still there
});

test('going invisible while a save is still on its way leaves nothing on the server', async ({ browser }) => {
  const ada = await app.device(browser);
  await app.join(ada, 'ada@example.com', 'Ada');
  await app.goTo(ada, 'My tag');

  // A slow connection: saving the tag takes a couple of seconds to arrive.
  await ada.route('**/api/profiles/me', async (route) => {
    if (route.request().method() === 'PUT') await new Promise(r => setTimeout(r, 2000));
    await route.continue();
  });
  await app.rename(ada, 'Ada B');
  await expect(app.doneButton(ada)).toHaveText('Saving…');   // the slow save is under way
  await app.choose(ada, 'Invisible');

  await expect(ada.getByText('Hidden right now')).toBeVisible();
  await ada.waitForTimeout(3500);                              // let the slow save arrive
  expect(await app.serverCopy('ada@example.com')).toMatchObject({ ...app.WIPED, visible: false });
});
