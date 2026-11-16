// Where the browser tests run. They wipe the database they are pointed at, so
// it has to be a throwaway one — the name must contain "test".
const fs = require('fs');
const path = require('path');

const DATABASE_URL = process.env.TEST_DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('Set TEST_DATABASE_URL to a throwaway Postgres database (its name must contain "test"). See TESTING.md.');
}
const dbName = new URL(DATABASE_URL).pathname.slice(1);
if (!/test/i.test(dbName)) {
  throw new Error(`Refusing to run: database "${dbName}" does not have "test" in its name. These tests wipe the database.`);
}

const TMP = path.join(__dirname, '../.tmp');
fs.mkdirSync(TMP, { recursive: true });

module.exports = { DATABASE_URL, TMP, API_PORT: 3101, WEB_PORT: 4273 };
