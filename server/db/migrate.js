const db = require('./index');

async function migrate() {
  await db.query(`
    ALTER TABLE profiles
      ADD COLUMN IF NOT EXISTS tag_color TEXT,
      ADD COLUMN IF NOT EXISTS stickers TEXT,
      ADD COLUMN IF NOT EXISTS tagline TEXT,
      ADD COLUMN IF NOT EXISTS party_code VARCHAR(20)
  `);

  // Allow sensitive profile fields to be NULLed when a user goes invisible,
  // so no identifying data sits on the server while they're not active.
  await db.query(`
    ALTER TABLE profiles
      ALTER COLUMN display_name DROP NOT NULL,
      ALTER COLUMN pronouns     DROP NOT NULL
  `);

  console.log('Migration complete');
}

module.exports = migrate;
