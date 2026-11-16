// Browser tests for Nametag. They start the real API and a production build of
// the client, then drive them the way people do — usually two people at once.
// See ../TESTING.md.
const path = require('path');
const { defineConfig } = require('@playwright/test');
const { DATABASE_URL, API_PORT, WEB_PORT, TMP } = require('./support/env');

const server = path.join(__dirname, '../server');
const client = path.join(__dirname, '../client');

module.exports = defineConfig({
  testDir: './tests',
  // One database and one "room" shared by every test, so run them one at a time.
  workers: 1,
  fullyParallel: false,
  timeout: 90_000,
  expect: { timeout: 10_000 },
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${WEB_PORT}`,
    viewport: { width: 390, height: 844 },
    trace: 'off',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      // Wipe the test database, then run the API. Its log is kept so tests can
      // read the emailed links (with no mail provider, the server logs them).
      command: `node ${path.join(__dirname, 'support/reset-db.js')} && node index.js > ${path.join(TMP, 'server.log')} 2>&1`,
      cwd: server,
      url: `http://localhost:${API_PORT}/api/health`,
      reuseExistingServer: false,
      timeout: 60_000,
      env: {
        ...process.env,
        DATABASE_URL, PORT: String(API_PORT), JWT_SECRET: 'e2e-secret',
        APP_URL: `http://localhost:${WEB_PORT}`,
        NODE_ENV: 'test',     // sign-in limits off; email links logged instead of sent
      },
    },
    {
      // A production build (not the dev server): what actually ships, and
      // without React's development-only double effects.
      command: `npx vite build --outDir ${path.join(TMP, 'dist')} --emptyOutDir && npx vite preview --outDir ${path.join(TMP, 'dist')} --port ${WEB_PORT} --strictPort`,
      cwd: client,
      url: `http://localhost:${WEB_PORT}`,
      reuseExistingServer: false,
      timeout: 120_000,
      env: { ...process.env, VITE_API_URL: '/api', API_PROXY_TARGET: `http://localhost:${API_PORT}` },
    },
  ],
});
