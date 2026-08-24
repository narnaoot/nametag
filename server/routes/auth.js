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
const VERIFY_SUBJECT = 'Verify your Nametag email';
const EXISTING_SUBJECT = 'You already have a Nametag account';

// Tokens (reset + verification) are stored only as a SHA-256 hash. The raw token
// lives only in the emailed link, so a database leak can't be turned into a
// working link (the attacker would still need the un-hashed value from the email).
function hashToken(t) {
  return crypto.createHash('sha256').update(t).digest('hex');
}

// Resolve the From address defensively: trim, strip a wrapping pair of quotes (a
// very common env-value mistake that Resend rejects with a 422 format error),
// and fall back to the verified sending domain.
function FROM() {
  let v = (process.env.SMTP_FROM || process.env.EMAIL_FROM || '').trim();
  if (v.length >= 2 && ((v[0] === '"' && v.endsWith('"')) || (v[0] === "'" && v.endsWith("'")))) {
    v = v.slice(1, -1).trim();
  }
  return v || 'Nametag <noreply@send.n4bil.com>';
}

// Email bodies.
const resetText = (url) => `Click the link below to reset your password. It expires in 1 hour.\n\n${url}\n\nIf you didn't request this, ignore this email.`;
const resetHtml = (url) => `<p>Click the link below to reset your Nametag password. It expires in 1 hour.</p>
           <p><a href="${url}">${url}</a></p>
           <p style="color:#999;font-size:12px">If you didn't request this, you can safely ignore this email.</p>`;
const verifyText = (url) => `Welcome to Nametag! Confirm your email to finish setting up your account. This link expires in 24 hours.\n\n${url}\n\nIf you didn't create a Nametag account, ignore this email.`;
const verifyHtml = (url) => `<p>Welcome to Nametag! Confirm your email to finish setting up your account. This link expires in 24 hours.</p>
           <p><a href="${url}">${url}</a></p>
           <p style="color:#999;font-size:12px">If you didn't create a Nametag account, you can safely ignore this email.</p>`;
const existingText = (url) => `Someone tried to create a Nametag account with this email, but you already have one. If it was you, just sign in — or reset your password if you've forgotten it.\n\n${url}`;
const existingHtml = (url) => `<p>Someone tried to create a Nametag account with this email, but you already have one.</p>
           <p>If it was you, just <a href="${url}">sign in</a> — or reset your password if you've forgotten it.</p>`;

// A Resend API key, from RESEND_API_KEY or (conveniently) the existing SMTP_PASS
// when it's a Resend key — so no new env var is needed if SMTP was set up first.
function resendKey() {
  if (process.env.RESEND_API_KEY) return process.env.RESEND_API_KEY;
  if ((process.env.SMTP_HOST || '').includes('resend') && (process.env.SMTP_PASS || '').startsWith('re_')) {
    return process.env.SMTP_PASS;
  }
  return null;
}

async function sendViaResendApi(key, toEmail, subject, text, html) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM(), to: toEmail, subject, text, html }),
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

// Generic delivery: Resend HTTPS API → SMTP → dev-log / prod-warn. Never logs a
// live link in production (a reset/verify link is a credential); logs in dev only
// so there's still a way to click through without a mail provider configured.
async function deliver(toEmail, subject, text, html, devLabel) {
  const key = resendKey();
  if (key) return sendViaResendApi(key, toEmail, subject, text, html);

  const transport = makeTransport();
  if (!transport) {
    if (process.env.NODE_ENV === 'production') {
      console.warn(`[auth] ${devLabel} requested but no email provider is configured; email not sent.`);
    } else {
      console.log(`[auth] ${devLabel} for ${toEmail}: ${text}`);
    }
    return;
  }
  await transport.sendMail({ from: FROM(), to: toEmail, subject, text, html });
}

const sendResetEmail = (toEmail, url) => deliver(toEmail, RESET_SUBJECT, resetText(url), resetHtml(url), 'Password reset link');
const sendVerificationEmail = (toEmail, url) => deliver(toEmail, VERIFY_SUBJECT, verifyText(url), verifyHtml(url), 'Email verification link');
const sendExistingAccountEmail = (toEmail, url) => deliver(toEmail, EXISTING_SUBJECT, existingText(url), existingHtml(url), 'Existing-account notice');

// A verification token: raw value for the email link, hash for the DB. 24h life.
async function issueVerificationToken(userId) {
  const raw = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await db.query(
    'INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [userId, hashToken(raw), expiresAt]
  );
  return raw;
}

const appBaseUrl = () => process.env.APP_URL || 'https://nametag.n4bil.com';

// ---------------------------------------------------------------------------
// POST /api/auth/register
// Email-verification flow. Registration never logs you in and never reveals
// whether an email already exists (no enumeration): it always responds
// { ok: true, pending: true } and sends an email. What the email says depends
// on the account's state:
//   - no account         → create it (unverified) + send a verification link
//   - unverified account → update the pending password + resend verification
//   - verified account   → send a "you already have an account" nudge instead
// You become logged-in only by clicking the verification link (POST /verify-email).
// ---------------------------------------------------------------------------
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

  const normEmail = email.toLowerCase().trim();
  const pending = { ok: true, pending: true }; // identical response in every case

  const existing = await db.query('SELECT id, email_verified FROM users WHERE email = $1', [normEmail]);
  const found = existing.rows[0];

  if (found && found.email_verified) {
    // Real account already exists — don't reveal that. Nudge the owner by email.
    sendExistingAccountEmail(normEmail, appBaseUrl())
      .catch((err) => console.error('[auth] Failed to send existing-account email:', err.message));
    return res.json(pending);
  }

  const hash = await bcrypt.hash(password, 10);
  try {
    let userId;
    if (found) {
      // Unverified account re-registering: last write wins on the pending
      // password (the account holds no data yet), then resend verification.
      userId = found.id;
      await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, userId]);
    } else {
      const inserted = await db.query(
        'INSERT INTO users (email, password_hash, email_verified) VALUES ($1, $2, FALSE) RETURNING id',
        [normEmail, hash]
      );
      userId = inserted.rows[0].id;
    }
    const rawToken = await issueVerificationToken(userId);
    sendVerificationEmail(normEmail, `${appBaseUrl()}?verify=${rawToken}`)
      .catch((err) => console.error('[auth] Failed to send verification email:', err.message));
    return res.json(pending);
  } catch (err) {
    if (err.code === '23505') {
      // Race: a concurrent request inserted this email between our check and
      // INSERT. Treat it as already-existing and stay non-enumerating.
      sendExistingAccountEmail(normEmail, appBaseUrl())
        .catch((e) => console.error('[auth] Failed to send existing-account email:', e.message));
      return res.json(pending);
    }
    throw err; // unexpected → global error handler (500)
  }
});

// ---------------------------------------------------------------------------
// POST /api/auth/verify-email
// Consumes a verification token and logs the user in (returns a JWT).
// ---------------------------------------------------------------------------
router.post('/verify-email', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token required' });

  const result = await db.query(
    `SELECT * FROM email_verification_tokens
     WHERE token = $1 AND used = FALSE AND expires_at > NOW()`,
    [hashToken(token)]
  );
  const row = result.rows[0];
  if (!row) return res.status(400).json({ error: 'Verification link is invalid or has expired' });

  await db.query('UPDATE users SET email_verified = TRUE WHERE id = $1', [row.user_id]);
  await db.query('UPDATE email_verification_tokens SET used = TRUE WHERE id = $1', [row.id]);

  const token2 = jwt.sign({ userId: row.user_id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.json({ token: token2, userId: row.user_id });
});

// ---------------------------------------------------------------------------
// POST /api/auth/resend-verification
// Always responds 200 (no enumeration). Only actually sends when the account
// exists and is still unverified.
// ---------------------------------------------------------------------------
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const normEmail = email.toLowerCase().trim();
  const result = await db.query('SELECT id, email_verified FROM users WHERE email = $1', [normEmail]);
  const user = result.rows[0];

  if (user && !user.email_verified) {
    const rawToken = await issueVerificationToken(user.id);
    sendVerificationEmail(normEmail, `${appBaseUrl()}?verify=${rawToken}`)
      .catch((err) => console.error('[auth] Failed to resend verification email:', err.message));
  }

  res.json({ ok: true });
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

  if (!user.email_verified) {
    // Correct credentials but unverified: safe to say so (the caller owns the
    // account) and let the client offer to resend the link.
    return res.status(403).json({
      error: 'Please verify your email before signing in — check your inbox for the link.',
      needsVerification: true,
    });
  }

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
    const token = crypto.randomBytes(32).toString('hex'); // raw value → email only
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, hashToken(token), expiresAt]
    );

    // Send in the background: don't await it, so a slow or stuck SMTP server
    // can't hang the request. Failures are logged, never surfaced (a 500 here
    // only happens when the email IS registered, which would leak existence).
    sendResetEmail(email.toLowerCase().trim(), `${appBaseUrl()}?reset=${token}`)
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
    [hashToken(token)]
  );
  const row = result.rows[0];
  if (!row) return res.status(400).json({ error: 'Reset link is invalid or has expired' });

  const hash = await bcrypt.hash(password, 10);
  await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, row.user_id]);
  await db.query('UPDATE password_reset_tokens SET used = TRUE WHERE id = $1', [row.id]);

  res.json({ ok: true });
});

module.exports = router;
