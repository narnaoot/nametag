const { test, expect } = require('@playwright/test');
const app = require('../support/app');

test.beforeEach(app.emptyRoom);

test('two people in the same room see each other', async ({ browser }) => {
  const ada = await app.device(browser);
  const otto = await app.device(browser);
  await app.join(ada, 'ada@example.com', 'Ada');
  await app.join(otto, 'otto@example.com', 'Otto', { pronouns: 'he/him', line: 'First time here' });

  await expect(app.tagOf(otto, 'Ada')).toBeVisible();
  await app.sees(ada, 'Otto');
  await expect(ada.getByText('1 tag nearby')).toBeVisible();
});

test('opening someone’s tag only shows it — nothing can be saved about them', async ({ browser }) => {
  const ada = await app.device(browser);
  const otto = await app.device(browser);
  await app.join(otto, 'otto@example.com', 'Otto', { pronouns: 'he/him', line: 'First time here' });
  await app.join(ada, 'ada@example.com', 'Ada');

  await app.tagOf(ada, 'Otto').click();
  const sheet = ada.locator('.nt-sheet');
  await expect(sheet.getByText('First time here')).toBeVisible();
  await expect(sheet.getByRole('button')).toHaveCount(0);

  await ada.mouse.click(5, 5);                       // tap outside to close
  await app.tagOf(ada, 'Ada').click();
  await expect(ada.locator('.nt-sheet').getByRole('button', { name: 'Edit my tag' })).toBeVisible();
  expect(await app.onDevice(ada)).toEqual(['nametag_token', 'profile_data', 'profile_owner']);
});

test('the server is told nothing about where people are', async ({ browser }) => {
  const ada = await app.device(browser);
  const otto = await app.device(browser);
  await app.join(otto, 'otto@example.com', 'Otto');
  await app.join(ada, 'ada@example.com', 'Ada');

  const people = await ada.evaluate(async () => {
    const token = localStorage.getItem('CapacitorStorage.nametag_token');
    return (await fetch('/api/profiles/nearby', { headers: { Authorization: `Bearer ${token}` } })).json();
  });
  expect(people.map(p => p.display_name)).toEqual(['Otto']);
  expect(Object.keys(people[0]).sort()).toEqual(['display_name', 'id', 'photo_path', 'pronouns', 'stickers', 'tag_color', 'tagline']);
  expect((await app.serverCopy('ada@example.com')).lat).toBe(37.7749);   // rounded, not the GPS fix
});

test('the wall works at tablet and desktop sizes, and long names stay inside the tag', async ({ browser }) => {
  const phone = await app.device(browser);
  await app.join(phone, 'long@example.com', 'Bartholomew', { line: 'Supercalifragilisticexpialidocious-and-then-some-more!!' });
  await app.goTo(phone, 'My tag');
  await app.rename(phone, 'Wolfeschlegelsteinhausenbergerdorffvoral');
  await app.doneButton(phone).click();
  await app.onTheWall(phone);
  await app.tagOf(phone, 'Wolfeschlegel').first().click();
  expect(await phone.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  for (const viewport of [{ width: 820, height: 1100 }, { width: 1280, height: 800 }]) {
    const big = await app.device(browser, { viewport });
    await app.signIn(big, 'long@example.com');
    await expect(app.tagOf(big, 'Wolfeschlegel').first()).toBeVisible();
    expect(await big.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await big.context().close();
  }
});
