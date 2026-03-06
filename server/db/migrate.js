const db = require('./index');

async function migrate() {
  await db.query(`
    ALTER TABLE profiles
      ADD COLUMN IF NOT EXISTS tag_color TEXT,
      ADD COLUMN IF NOT EXISTS stickers TEXT,
      ADD COLUMN IF NOT EXISTS tagline TEXT
  `);
  console.log('Migration complete');
}

module.exports = migrate;
