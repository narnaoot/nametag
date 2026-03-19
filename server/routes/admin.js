const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/admin/reset
// Wipes all users and profiles. Requires the ADMIN_SECRET env var in the
// Authorization header: `Bearer <ADMIN_SECRET>`.
// Photos on disk are NOT deleted — restart the server or clear /uploads manually.
router.post('/reset', async (req, res) => {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    return res.status(503).json({ error: 'Admin reset not configured (ADMIN_SECRET not set)' });
  }

  const auth = req.headers.authorization || '';
  if (auth !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // CASCADE on profiles means deleting users wipes profiles too,
    // but TRUNCATE ... RESTART IDENTITY is cleaner for resetting sequences.
    await db.query('TRUNCATE profiles, users RESTART IDENTITY CASCADE');
    res.json({ ok: true, message: 'All users and profiles deleted.' });
  } catch (err) {
    console.error('[admin/reset]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
