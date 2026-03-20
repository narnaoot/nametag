const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const db = require('../db');
const auth = require('../middleware/auth');
const { deletePhotoFile } = require('../cleanup');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `user_${req.user.userId}_${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images allowed'));
  },
});

// GET own profile
router.get('/me', auth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM profiles WHERE user_id = $1', [req.user.userId]);
    res.json(result.rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// CREATE or UPDATE profile
router.put('/me', auth, upload.single('photo'), async (req, res) => {
  const { display_name, pronouns, radius_meters, always_visible, tag_color, stickers, tagline } = req.body;
  const cleanName = display_name?.trim();
  const cleanPronouns = pronouns?.trim();
  if (!cleanName || !cleanPronouns) {
    return res.status(400).json({ error: 'Name and pronouns required' });
  }

  const photo_path = req.file ? `/uploads/${req.file.filename}` : undefined;
  const radius = parseInt(radius_meters) || 100;
  const alwaysVisible = always_visible !== 'false' && always_visible !== false;
  const tagColor = tag_color || null;
  const stickersVal = stickers || null;
  const taglineVal = tagline ? tagline.slice(0, 60) : null;

  try {
    const existing = await db.query(
      'SELECT id, photo_path FROM profiles WHERE user_id = $1',
      [req.user.userId]
    );

    if (existing.rows.length === 0) {
      await db.query(
        `INSERT INTO profiles (user_id, display_name, pronouns, photo_path, radius_meters, always_visible, tag_color, stickers, tagline)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [req.user.userId, cleanName, cleanPronouns, photo_path || null, radius, alwaysVisible, tagColor, stickersVal, taglineVal]
      );
    } else {
      // Delete old photo from disk when a new one is uploaded
      if (req.file) {
        await deletePhotoFile(existing.rows[0].photo_path);
      }
      await db.query(
        `UPDATE profiles SET
          display_name = $2,
          pronouns = $3,
          photo_path = COALESCE($4, photo_path),
          radius_meters = $5,
          always_visible = $6,
          tag_color = $7,
          stickers = $8,
          tagline = $9,
          updated_at = NOW()
         WHERE user_id = $1`,
        [req.user.userId, cleanName, cleanPronouns, photo_path || null, radius, alwaysVisible, tagColor, stickersVal, taglineVal]
      );
    }

    const result = await db.query('SELECT * FROM profiles WHERE user_id = $1', [req.user.userId]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload or replace photo only — called when re-establishing visibility
router.post('/me/photo', auth, upload.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No photo provided' });
  const photo_path = `/uploads/${req.file.filename}`;
  try {
    const existing = await db.query(
      'SELECT photo_path FROM profiles WHERE user_id = $1',
      [req.user.userId]
    );
    await deletePhotoFile(existing.rows[0]?.photo_path);
    await db.query(
      'UPDATE profiles SET photo_path = $2, updated_at = NOW() WHERE user_id = $1',
      [req.user.userId, photo_path]
    );
    res.json({ photo_path });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update location (stores plain lat/lng — no PostGIS needed)
router.post('/me/location', auth, async (req, res) => {
  const { latitude, longitude } = req.body;
  if (latitude == null || longitude == null) {
    return res.status(400).json({ error: 'latitude and longitude required' });
  }

  try {
    await db.query(
      `UPDATE profiles
       SET lat = $2, lng = $3,
           location_updated_at = NOW(),
           is_active = TRUE
       WHERE user_id = $1`,
      [req.user.userId, latitude, longitude]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Set visibility — going invisible deletes photo and clears location
router.post('/me/visibility', auth, async (req, res) => {
  const { is_active } = req.body;
  const newActive = !!is_active;
  try {
    if (!newActive) {
      // Privacy: delete server-side photo and NULL location when going invisible
      const profile = await db.query(
        'SELECT photo_path FROM profiles WHERE user_id = $1',
        [req.user.userId]
      );
      await deletePhotoFile(profile.rows[0]?.photo_path);
      await db.query(
        `UPDATE profiles
         SET display_name = NULL, pronouns = NULL, tagline = NULL,
             tag_color = NULL, stickers = NULL, photo_path = NULL,
             lat = NULL, lng = NULL, location_updated_at = NULL,
             is_active = FALSE
         WHERE user_id = $1`,
        [req.user.userId]
      );
    } else {
      await db.query(
        'UPDATE profiles SET is_active = TRUE WHERE user_id = $1',
        [req.user.userId]
      );
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete account — hard delete of user, profile, and photo file
router.delete('/me', auth, async (req, res) => {
  try {
    const profile = await db.query(
      'SELECT photo_path FROM profiles WHERE user_id = $1',
      [req.user.userId]
    );
    // Delete user first (cascades to profile row), then clean up the file
    await db.query('DELETE FROM users WHERE id = $1', [req.user.userId]);
    await deletePhotoFile(profile.rows[0]?.photo_path);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET nearby profiles — Haversine distance, no PostGIS
router.get('/nearby', auth, async (req, res) => {
  try {
    const myProfile = await db.query(
      'SELECT lat, lng, radius_meters FROM profiles WHERE user_id = $1',
      [req.user.userId]
    );
    const me = myProfile.rows[0];
    if (me?.lat == null || me?.lng == null) {
      return res.status(400).json({ error: 'Share your location first' });
    }

    const { lat, lng, radius_meters } = me;

    // Bounding box in degrees (rough pre-filter, fast index scan)
    const latDelta = radius_meters / 111320.0;
    const lngDelta = radius_meters / (111320.0 * Math.cos((lat * Math.PI) / 180));

    // Haversine formula in SQL — exact distance in metres
    const result = await db.query(
      `SELECT * FROM (
         SELECT
           p.id,
           p.display_name,
           p.pronouns,
           p.photo_path,
           p.tag_color,
           p.stickers,
           p.tagline,
           6371000 * 2 * ASIN(SQRT(
             POWER(SIN(RADIANS((p.lat - $1) / 2)), 2) +
             COS(RADIANS($1)) * COS(RADIANS(p.lat)) *
             POWER(SIN(RADIANS((p.lng - $2) / 2)), 2)
           )) AS distance_meters
         FROM profiles p
         WHERE p.user_id != $3
           AND p.lat IS NOT NULL
           AND p.lng IS NOT NULL
           AND (p.always_visible = TRUE OR p.is_active = TRUE)
           AND p.location_updated_at > NOW() - INTERVAL '30 minutes'
           AND p.lat BETWEEN $4 AND $5
           AND p.lng BETWEEN $6 AND $7
       ) sub
       WHERE distance_meters <= $8
       ORDER BY distance_meters ASC`,
      [
        lat, lng,
        req.user.userId,
        lat - latDelta, lat + latDelta,
        lng - lngDelta, lng + lngDelta,
        radius_meters,
      ]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
