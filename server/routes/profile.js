const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const db = require('../db');
const auth = require('../middleware/auth');

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
  const { display_name, pronouns, radius_meters, always_visible } = req.body;
  if (!display_name || !pronouns) {
    return res.status(400).json({ error: 'Name and pronouns required' });
  }

  const photo_path = req.file ? `/uploads/${req.file.filename}` : undefined;
  const radius = parseInt(radius_meters) || 100;
  const alwaysVisible = always_visible !== 'false' && always_visible !== false;

  try {
    const existing = await db.query('SELECT id, photo_path FROM profiles WHERE user_id = $1', [req.user.userId]);

    if (existing.rows.length === 0) {
      await db.query(
        `INSERT INTO profiles (user_id, display_name, pronouns, photo_path, radius_meters, always_visible)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [req.user.userId, display_name, pronouns, photo_path || null, radius, alwaysVisible]
      );
    } else {
      const currentPhoto = existing.rows[0].photo_path;
      await db.query(
        `UPDATE profiles SET
          display_name = $2,
          pronouns = $3,
          photo_path = COALESCE($4, photo_path),
          radius_meters = $5,
          always_visible = $6,
          updated_at = NOW()
         WHERE user_id = $1`,
        [req.user.userId, display_name, pronouns, photo_path || null, radius, alwaysVisible]
      );
    }

    const result = await db.query('SELECT * FROM profiles WHERE user_id = $1', [req.user.userId]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update location
router.post('/me/location', auth, async (req, res) => {
  const { latitude, longitude } = req.body;
  if (latitude == null || longitude == null) {
    return res.status(400).json({ error: 'latitude and longitude required' });
  }

  try {
    await db.query(
      `UPDATE profiles
       SET location = ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography,
           location_updated_at = NOW(),
           is_active = TRUE
       WHERE user_id = $1`,
      [req.user.userId, longitude, latitude]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Set visibility (active/inactive)
router.post('/me/visibility', auth, async (req, res) => {
  const { is_active } = req.body;
  try {
    await db.query('UPDATE profiles SET is_active = $2 WHERE user_id = $1', [req.user.userId, !!is_active]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET nearby profiles
router.get('/nearby', auth, async (req, res) => {
  try {
    const myProfile = await db.query(
      'SELECT location, radius_meters FROM profiles WHERE user_id = $1',
      [req.user.userId]
    );
    if (!myProfile.rows[0]?.location) {
      return res.status(400).json({ error: 'Share your location first' });
    }

    const { location, radius_meters } = myProfile.rows[0];

    const result = await db.query(
      `SELECT
         p.id,
         p.display_name,
         p.pronouns,
         p.photo_path,
         ST_Distance(p.location, $1::geography) AS distance_meters
       FROM profiles p
       WHERE p.user_id != $2
         AND p.location IS NOT NULL
         AND (p.always_visible = TRUE OR p.is_active = TRUE)
         AND p.location_updated_at > NOW() - INTERVAL '30 minutes'
         AND ST_DWithin(p.location, $1::geography, $3)
       ORDER BY distance_meters ASC`,
      [location, req.user.userId, radius_meters]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
