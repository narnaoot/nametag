require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();

// Render (and most PaaS) run behind a proxy, so the client IP is in
// X-Forwarded-For. Trust the first hop so rate limiting keys on the real IP.
app.set('trust proxy', 1);

// Security headers (defense-in-depth). This is a JSON API that also serves
// /uploads images to the separate frontend origin, so: no CSP (we render no
// HTML documents; the frontend's CSP is Vercel's job) and cross-origin
// resource policy so the frontend can load photo <img>s from this origin.
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS allowlist. The API is bearer-authenticated, but there's no reason for
// arbitrary sites to script calls against it, so restrict browser origins to
// our own frontends, Vercel preview builds, the native (Capacitor) origins,
// and local dev. Extra origins can be added via CORS_ORIGINS (comma-separated).
// Requests with no Origin (curl, health checks, native webviews that omit it)
// are allowed through.
const DEFAULT_ORIGINS = [
  'https://nametag.n4bil.com',
  'https://n4bil.com',
  'https://www.n4bil.com',
  'https://nametag-pi.vercel.app',
];
const ENV_ORIGINS = (process.env.CORS_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
const ALLOWED_ORIGINS = new Set([...DEFAULT_ORIGINS, ...ENV_ORIGINS]);
const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/nametag-[a-z0-9-]+\.vercel\.app$/, // Vercel preview deployments
  /^capacitor:\/\/localhost$/,                    // iOS/Android native shell
  /^ionic:\/\/localhost$/,
  /^http:\/\/localhost(:\d+)?$/,                   // local dev
];
function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (ALLOWED_ORIGINS.has(origin)) return true;
  return ALLOWED_ORIGIN_PATTERNS.some((re) => re.test(origin));
}
app.use(cors({
  origin: (origin, cb) => cb(null, isAllowedOrigin(origin)),
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Throttle auth to slow password brute-force and email-enumeration probing.
// NOTE: we deliberately do NOT IP-rate-limit the room APIs (/api/profiles/*):
// Nametag clusters many co-present users behind a single venue Wi-Fi/NAT, so a
// per-IP limit there would throttle legitimate users who share one public IP.
// Disabled under tests so the suite isn't tripped by the shared test IP.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  limit: 50,                  // per IP per window (generous enough for an event)
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: { error: 'Too many attempts. Please wait a few minutes and try again.' },
});

app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/profiles', require('./routes/profile'));

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Global error handler — catches multer errors and any other middleware errors
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Photo must be under 5 MB' });
  }
  if (err.message === 'Only images allowed') {
    return res.status(400).json({ error: 'Only image files are allowed' });
  }
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

module.exports = app;
