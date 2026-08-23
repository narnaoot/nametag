const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const db = require('../db');

// ---------------------------------------------------------------------------
// Email helper
// If SMTP_HOST is configured, sends a real email.
// Otherwise logs the reset link to console (handy in dev / Render log tail).
// ---------------------------------------------------------------------------
function makeTransport() {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

async function sendResetEmail(toEmail, resetUrl) {
  const transport = makeTransport();
  if (!transport) {
    // No SMTP configured. In production, never log reset links or emails — they'd
    // sit in the server logs and a reset link lets someone change a password. In
    // dev, log it for convenience. (Production resets can't be delivered until
    // SMTP env vars are set — see NABIL_TODOS.md.)
    if (process.env.NODE_ENV === 'production') {
      console.warn('[auth] Password reset requested but SMTP is not configured; email not sent.');
    } else {
      console.log(`[auth] Password reset link for ${toEmail}: ${resetUrl}`);
    }
    return;
  }
  await transport.sendMail({
    from: process.env.SMTP_FROM || 'Nametag <no-reply@nametag.app>',
    to: toEmail,
    subject: 'Reset your Nametag password',
    text: `Click the link below to reset your password. It expires in 1 hour.\n\n${resetUrl}\n\nIf you didn't request this, ignore this email.`,
    html: `<p>Click the link below to reset your Nametag password. It expires in 1 hour.</p>
           <p><a href="${resetUrl}">${resetUrl}</a></p>
           <p style="color:#999;font-size:12px">If you didn't request this, you can safely ignore this email.</p>`,
  });
}

// ---------------------------------------------------------------------------
// POST /api/auth/register
// ---------------------------------------------------------------------------
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email.toLowerCase().trim(), hash]
    );
    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ token, userId: user.id });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email already in use' });
    throw err; // unexpected → handled by the global error handler (500)
  }
});

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const result = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
  const user = result.rows[0];
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, userId: user.id });
});

// ---------------------------------------------------------------------------
// POST /api/auth/forgot-password
// Always responds 200 to avoid leaking whether an email is registered.
// ---------------------------------------------------------------------------
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const result = await db.query(
    'SELECT id FROM users WHERE email = $1',
    [email.toLowerCase().trim()]
  );
  const user = result.rows[0];

  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, token, expiresAt]
    );

    const appUrl = process.env.APP_URL || 'https://nametag.vercel.app';
    // Never let an email-send failure change the response: a 500 here only
    // happens when the email IS registered, which would leak account existence
    // (and expose SMTP misconfig to users). Swallow + log; always return 200.
    try {
      await sendResetEmail(email.toLowerCase().trim(), `${appUrl}?reset=${token}`);
    } catch (err) {
      console.error('[auth] Failed to send reset email:', err.message);
    }
  }

  // Always 200, whether or not the email exists — no account enumeration.
  res.json({ ok: true });
});

// ---------------------------------------------------------------------------
// POST /api/auth/reset-password
// ---------------------------------------------------------------------------
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Token and password required' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

  const result = await db.query(
    `SELECT * FROM password_reset_tokens
     WHERE token = $1 AND used = FALSE AND expires_at > NOW()`,
    [token]
  );
  const row = result.rows[0];
  if (!row) return res.status(400).json({ error: 'Reset link is invalid or has expired' });

  const hash = await bcrypt.hash(password, 10);
  await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, row.user_id]);
  await db.query('UPDATE password_reset_tokens SET used = TRUE WHERE id = $1', [row.id]);

  res.json({ ok: true });
});

module.exports = router;
