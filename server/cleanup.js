// Stale-data cleanup — runs on startup and every hour.
// Finds profiles whose location hasn't been refreshed in STALE_HOURS,
// deletes their server-side photo file, and NULLs location + photo_path.

const fs = require('fs');
const path = require('path');
const db = require('./db');

const STALE_HOURS = 24;
const UPLOADS_DIR = path.join(__dirname, 'uploads');

async function deletePhotoFile(photo_path) {
  if (!photo_path) return;
  try {
    await fs.promises.unlink(path.join(UPLOADS_DIR, path.basename(photo_path)));
  } catch (err) {
    if (err.code !== 'ENOENT') console.error('[cleanup] deletePhotoFile:', err);
  }
}

async function runCleanup() {
  try {
    const stale = await db.query(
      `SELECT user_id, photo_path FROM profiles
       WHERE location_updated_at < NOW() - $1::interval
         AND (lat IS NOT NULL OR photo_path IS NOT NULL)`,
      [`${STALE_HOURS} hours`]
    );

    if (stale.rows.length === 0) return;

    for (const row of stale.rows) {
      await deletePhotoFile(row.photo_path);
    }

    const userIds = stale.rows.map(r => r.user_id);
    await db.query(
      `UPDATE profiles
       SET display_name = NULL, pronouns = NULL, tagline = NULL,
           tag_color = NULL, stickers = NULL, photo_path = NULL,
           lat = NULL, lng = NULL, location_updated_at = NULL,
           is_active = FALSE
       WHERE user_id = ANY($1)`,
      [userIds]
    );

    console.log(`[cleanup] Cleared ${stale.rows.length} stale profile(s)`);
  } catch (err) {
    console.error('[cleanup] runCleanup error:', err);
  }
}

module.exports = { runCleanup, deletePhotoFile };
