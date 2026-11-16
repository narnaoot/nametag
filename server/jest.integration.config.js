// Integration tests: the real Express app against a real Postgres database.
// Run with `npm run test:integration` (needs TEST_DATABASE_URL — see TESTING.md).
// The default `npm test` suite mocks the database and never touches one.
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/integration/**/*.int.test.js'],
  setupFiles: ['./__tests__/integration/env.js'],
  testTimeout: 30000,
};
