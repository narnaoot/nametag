const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const db = require('../db');

// ---------------------------------------------------------------------------
// Email helper
// Prefers Resend's HTTPS API (works on hosts that block outbound SMTP, like
// Render's free tier). Falls back to SMTP (nodemailer) if only SMTP is set.
// With neither configured, logs the link in dev and stays silent in prod.
// ---------------------------------------------------------------------------
const RESET_SUBJECT = 'Reset your Nametag password';
const FROM = () => process.env.SMTP_FROM || process.env.EMAIL_FROM || 'Nametag <no-reply@nametag.app>';
const resetText = (url) => `Click the link below to reset your password. It expires in 1 hour.\n\n${url}\n\nIf you didn't request this, ignore this email.`;
const resetHtml = (url) => `<p>Click the link below to reset your Nametag password. It expires in 1 hour.</p>
           <p><a href="${url}">${url}</a></p>
           <p style="color:#999;font-size:12px">If you didn't request this, you can safely ignore this email.</p>`;

// A Resend API key, from RESEND_API_KEY or (conveniently) the existing SMTP_PASS
// when it's a Resend key — so no new env var is needed if SMTP was set up first.
function resendKey() {
  if (process.env.RESEND_API_KEY) return process.env.RESEND_API_KEY;
  if ((process.env.SMTP_HOST || '').includes('resend') && (process.env.SMTP_PASS || '').startsWith('re_')) {
    return process.env.SMTP_PASS;
  }
  return null;
}

async function sendViaResendApi(key, toEmail, resetUrl) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM(), to: toEmail, subject: RESET_SUBJECT, text: resetText(resetUrl), html: resetHtml(resetUrl) }),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Resend API ${res.status}: ${body.slice(0, 300)}`);
    }
  } finally {
    clearTimeout(timer);
  }
}

function makeTransport() {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    // Fail fast instead of hanging if the SMTP server/handshake stalls.
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

async function sendResetEmail(toEmail, resetUrl) {
  const key = resendKey();
  if (key) return sendViaResendApi(key, toEmail, resetUrl);

  const transport = makeTransport();
  if (!transport) {
    // Nothing configured. Never log reset links/emails in production (they'd sit
    // in the server logs and a reset link changes a password); log in dev only.
    if (process.env.NODE_ENV === 'production') {
      console.warn('[auth] Password reset requested but no email provider is configured; email not sent.');
    } else {
      console.log(`[auth] Password reset link for ${toEmail}: ${resetUrl}`);
    }
    return;
  }
  await transport.sendMail({ from: FROM(), to: toEmail, subject: RESET_SUBJECT, text: resetText(resetUrl), html: resetHtml(resetUrl) });
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
    // Send in the background: don't await it, so a slow or stuck SMTP server
    // can't hang the request. Failures are logged, never surfaced (a 500 here
    // only happens when the email IS registered, which would leak existence).
    sendResetEmail(email.toLowerCase().trim(), `${appUrl}?reset=${token}`)
      .catch((err) => console.error('[auth] Failed to send reset email:', err.message));
  }

  // Always 200 right away, whether or not the email exists — no enumeration,
  // no waiting on the mail server.
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
