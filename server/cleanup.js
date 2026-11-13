// Data minimisation — the rules for what the server is allowed to keep, and
// the sweep that enforces them. Runs on startup and every few minutes.
//
// The server holds a tag only while its owner is in the room:
//   - a tag nobody has refreshed in STALE_MINUTES is wiped (you left) — and
//     sooner than that if the server itself is about to stop
//   - a party code is good for PARTY_CODE_HOURS; after that the party is over
//     and its members go invisible
//   - spent or expired email links, and accounts that never verified, are deleted
// The lasting copy of a tag lives on its owner's device, which restores it the
// next time they open the app.

const fs = require('fs');
const path = require('path');
const db = require('./db');

// A tag stops being shown to others after this long without a location refresh
// (the app refreshes every minute while open), and is deleted at the same point:
// there's no reason to keep what nobody can see.
const STALE_MINUTES = 30;
// When the server is shutting down (index.js) it can't wait out the 30 minutes,
// so it drops every tag that hasn't refreshed in this long. Anyone actively
// using the app refreshes every minute and is left alone.
const SHUTDOWN_STALE_MINUTES = 5;
const PARTY_CODE_HOURS = 4;
const UNVERIFIED_ACCOUNT_DAYS = 2;   // the verification link itself lasts 24h
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// The columns wiped when a tag comes off the server — going invisible, leaving
// the app, ageing out, or a party ending. Defined once and shared by every
// caller, so a new sensitive column added here can't be forgotten elsewhere.
const CLEAR_PROFILE_SET = `display_name = NULL, pronouns = NULL, tagline = NULL,
      tag_color = NULL, stickers = NULL, photo_path = NULL,
      lat = NULL, lng = NULL, location_updated_at = NULL,
      party_code = NULL, party_code_set_at = NULL,
      is_active = FALSE`;

// True for a row that still holds something CLEAR_PROFILE_SET would remove.
const HOLDS_TAG_DATA = `(display_name IS NOT NULL OR photo_path IS NOT NULL
      OR lat IS NOT NULL OR party_code IS NOT NULL)`;

async function deletePhotoFile(photo_path) {
  if (!photo_path) return;
  try {
    await fs.promises.unlink(path.join(UPLOADS_DIR, path.basename(photo_path)));
  } catch (err) {
    if (err.code !== 'ENOENT') console.error('[cleanup] deletePhotoFile:', err);
  }
}

// Wipe the tag data of every profile matching `where` (a SQL condition with
// $1.. params), deleting photo files first. `alsoSet` adds extra assignments.
// Returns how many profiles were cleared.
async function wipeProfiles(where, params = [], alsoSet = '') {
  const { rows } = await db.query(
    `SELECT user_id, photo_path FROM profiles WHERE ${where}`, params
  );
  if (rows.length === 0) return 0;
  for (const row of rows) await deletePhotoFile(row.photo_path);
  await db.query(
    `UPDATE profiles SET ${CLEAR_PROFILE_SET}${alsoSet} WHERE user_id = ANY($1)`,
    [rows.map(r => r.user_id)]
  );
  return rows.length;
}

// Take one user's tag off the server. `stayHidden` also records that they
// chose (or were moved) to invisible, so they stay off until they come back.
function wipeProfile(userId, { stayHidden = false } = {}) {
  return wipeProfiles('user_id = $1', [userId], stayHidden ? ', always_visible = FALSE' : '');
}

// `staleMinutes` is how long a tag may go without a refresh before it's wiped —
// 30 normally, much shorter for the last sweep before the server stops.
async function runCleanup({ staleMinutes = STALE_MINUTES } = {}) {
  const steps = {
    // People who left: no location refresh (or, if never located, no edit) lately.
    stale: () => wipeProfiles(
      `COALESCE(location_updated_at, updated_at) < NOW() - $1::interval AND ${HOLDS_TAG_DATA}`,
      [`${staleMinutes} minutes`]
    ),
    // Parties that are over: members go invisible rather than suddenly
    // becoming visible to the whole room.
    parties: () => wipeProfiles(
      `party_code IS NOT NULL AND party_code_set_at < NOW() - $1::interval`,
      [`${PARTY_CODE_HOURS} hours`], ', always_visible = FALSE'
    ),
    // Email links that are spent or expired — otherwise they pile up as a log
    // of when each account signed up or asked for a reset.
    resetLinks: async () => (await db.query(
      'DELETE FROM password_reset_tokens WHERE used = TRUE OR expires_at < NOW()'
    )).rowCount,
    verifyLinks: async () => (await db.query(
      'DELETE FROM email_verification_tokens WHERE used = TRUE OR expires_at < NOW()'
    )).rowCount,
    // Sign-ups that never confirmed their email: an address we have no reason to keep.
    unverified: async () => (await db.query(
      'DELETE FROM users WHERE email_verified = FALSE AND created_at < NOW() - $1::interval',
      [`${UNVERIFIED_ACCOUNT_DAYS} days`]
    )).rowCount,
  };

  for (const [name, step] of Object.entries(steps)) {
    try {
      const n = await step();
      if (n) console.log(`[cleanup] ${name}: ${n}`);
    } catch (err) {
      console.error(`[cleanup] ${name} failed:`, err);
    }
  }
}

module.exports = {
  runCleanup, deletePhotoFile, wipeProfile, CLEAR_PROFILE_SET,
  STALE_MINUTES, SHUTDOWN_STALE_MINUTES, PARTY_CODE_HOURS,
};
