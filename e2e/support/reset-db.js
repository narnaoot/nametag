// Give the API an empty database to start from. Runs before the server boots
// (the server then applies its own migrations on top of the base schema).
const fs = require('fs');
const path = require('path');
const { DATABASE_URL } = require('./env');

const server = path.join(__dirname, '../../server');
const { Client } = require(require.resolve('pg', { paths: [server] }));

(async () => {
  const db = new Client({ connectionString: DATABASE_URL });
  await db.connect();
  await db.query('DROP TABLE IF EXISTS email_verification_tokens, password_reset_tokens, profiles, users CASCADE');
  await db.query(fs.readFileSync(path.join(server, 'db/schema.sql'), 'utf8'));
  await db.end();
})().catch((err) => { console.error(err); process.exit(1); });
