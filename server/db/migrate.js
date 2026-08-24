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

  // Email verification. ADD COLUMN with DEFAULT TRUE backfills every EXISTING
  // user as verified (grandfathering accounts created before verification
  // existed), then we flip the default to FALSE so NEW registrations start
  // unverified. IF NOT EXISTS makes re-runs a no-op (existing rows untouched).
  await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT TRUE`);
  await db.query(`ALTER TABLE users ALTER COLUMN email_verified SET DEFAULT FALSE`);

  // Token revocation: every issued JWT carries the account's token_version;
  // the auth middleware rejects tokens whose version is stale. Bumping this
  // (on password reset) invalidates all previously issued tokens.
  await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version INTEGER NOT NULL DEFAULT 0`);

  await db.query(`
    CREATE TABLE IF NOT EXISTS email_verification_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  console.log('Migration complete');
}

module.exports = migrate;
