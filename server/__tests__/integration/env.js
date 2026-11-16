// Point the app at the throwaway test database before anything loads.
// These tests DROP and recreate every table, so refuse to run against anything
// that doesn't look like a test database.
const url = process.env.TEST_DATABASE_URL;
if (!url) {
  throw new Error('Set TEST_DATABASE_URL to a throwaway Postgres database (its name must contain "test").');
}
const dbName = new URL(url).pathname.slice(1);
if (!/test/i.test(dbName)) {
  throw new Error(`Refusing to run: database "${dbName}" does not have "test" in its name. These tests wipe the database.`);
}
process.env.DATABASE_URL = url;
process.env.JWT_SECRET = 'integration-test-secret';
process.env.NODE_ENV = 'test';          // rate limiters off; email links are logged, not sent
process.env.APP_URL = 'http://app.test';
