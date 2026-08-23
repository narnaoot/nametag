# Nametag — Privacy Review

**Status:** Draft audit · **Date:** Aug 2026 · **Reviewed at commit:** `main`
**Scope:** the whole data path — client (`client/src`), API (`server`), storage
(Neon Postgres, Render disk), and hosting (Vercel, Render). Read end-to-end; this
is an engineering audit, not a legal opinion.

The product principle (from `RESTART_PROMPT.md`) is **"the server is a relay, not
a data store."** This review checks how well the code lives up to that, and what
to fix before real users.

---

## 1. Data inventory

| Data | Where it lives | Retained | Who can read it |
|---|---|---|---|
| Email | Neon `users.email` (lowercased) | Until account deletion | You; anyone with DB access; via `/register` an attacker can *test* if an email exists |
| Password | Neon `users.password_hash` (bcrypt, cost 10) | Until account deletion | Nobody in cleartext |
| Auth token (JWT) | **On device** (`@capacitor/preferences`) | 30 days (token expiry) | The device; anyone who exfiltrates it (valid till expiry) |
| Display name, pronouns, one line, stickers, tag colour | Neon `profiles.*` | **Only while visible** — NULLed on invisible; auto-cleared after 24h stale; deleted with account | You; co-present users in your radius (via `/nearby`); DB access |
| Photo | Render disk `/uploads/user_<id>_<ts>.<ext>` | Same as profile (deleted on invisible / 24h / account delete) | **Anyone with the URL** (public static, unauthenticated) |
| Location (lat/lng) | Neon `profiles.lat/lng` — single latest point, overwritten each refresh; **no history** | NULLed on invisible / 24h / account delete | Server + DB access. **Not exposed raw to other users** — `/nearby` returns only `distance_meters` |
| `location_updated_at` | Neon `profiles` | Same | You (own profile) |
| Party code | Neon `profiles.party_code` | Same as profile | Server; acts as a filter for `/nearby` |
| Password-reset token | Neon `password_reset_tokens` (plaintext, 1h, single-use) | Until used/expired; cascade-deleted with user | DB access; **also written to the Render log** when SMTP is unset |
| Remembered names | **On device only** (`@capacitor/preferences`) | Until the user clears it / uninstalls | The device only — never sent to the server |
| Hidden people | **On device only** | Same | The device only |
| Local profile + photo copy | **On device** (Preferences + Filesystem) | Until cleared/uninstall | The device (used to restore your tag after server cleanup) |
| Request metadata (IP, UA, paths) | Render + Vercel platform logs | Per provider defaults | The providers; dashboard users |

**No analytics, ads, or third-party tracking SDKs** are present in the client
(verified: no GA/Segment/Sentry/PostHog/Vercel-analytics). The app has **no feed,
no history table, no messaging** — presence is a single mutable row per user.

---

## 2. Data flow (how it moves)

- **Sign up / in** — email + password → `POST /auth/register|login` → bcrypt →
  JWT (30d) returned, stored on device. All traffic over HTTPS.
- **Go visible / refresh** — device sends lat/lng → `POST /me/location` (sets the
  single lat/lng + `is_active`). Profile fields + cropped photo are pushed via
  `PUT /me`.
- **See the room** — `GET /nearby` returns co-present users within your radius,
  active in the last 30 min, matching your party code — **name, pronouns, one
  line, stickers, colour, photo path, and distance only** (never their raw
  coordinates).
- **Go invisible** — `POST /me/visibility {is_active:false}` NULLs name,
  pronouns, tagline, colour, stickers, photo_path, lat, lng, and **deletes the
  photo file**.
- **Stale cleanup** — hourly job clears the same fields + deletes the photo for
  anyone not refreshed in 24h (`server/cleanup.js`).
- **Delete account** — `DELETE /me` hard-deletes the user (cascades to profile +
  reset tokens) and removes the photo file.
- **Photos on device** — cropped to a 320px square **before upload**
  (`client/src/imageCrop.js`); a local copy is kept to re-upload after cleanup.

---

## 3. Findings & recommendations

Ranked by what matters most before putting this in front of real people.

### High

**H1 — Photos are served at public, unauthenticated URLs.**
`server/app.js` serves `/uploads` via `express.static`, and filenames are
`user_<userId>_<timestamp>.<ext>` — guessable and shareable. A face photo can be
fetched by anyone with (or guessing) the URL while it exists, with no auth check.
→ *Fix:* serve photos through an authenticated route, or use object storage
(S3/R2) with short-lived signed URLs, or at minimum randomize filenames (UUID)
so they can't be enumerated. Until fixed, the privacy policy must **not** imply
photos are access-controlled.

**H2 — Password-reset links (with the email) are written to the server log.**
`server/routes/auth.js` logs `Password reset link for <email>: <url>` when SMTP
is unconfigured (the current state). Reset URLs let someone set a new password;
Render logs persist and are visible to anyone with dashboard access.
→ *Fix:* configure SMTP so links are emailed, and gate the console fallback to
non-production (`if (NODE_ENV !== 'production')`), or drop it entirely.

### Medium

**M1 — No rate limiting.** `/auth/login`, `/register`, `/forgot-password`, and
the location/nearby writes have no throttling → password brute-force, email
enumeration probing, and location/write spam are all cheap.
→ *Fix:* add `express-rate-limit` (stricter on auth, looser on reads).

**M2 — Account enumeration via `/register`.** It returns `409 "Email already in
use"`, so an attacker can test which emails have accounts. (`/forgot-password` is
correctly non-enumerating — always 200.)
→ *Fix:* return a generic message, or move to an email-verification flow.

**M3 — JWT is long-lived (30 days) and cannot be revoked.** It's stateless;
sign-out only deletes the token on the device. A leaked token stays valid until
expiry.
→ *Fix:* shorter access token + refresh token, or a token-version/denylist column
checked in `middleware/auth.js`. At minimum, document it.

**M4 — Google Fonts are loaded from Google's CDN.** `index.html` preconnects and
`index.css` `@import`s from `fonts.googleapis.com` / `fonts.gstatic.com`, so
Google receives every visitor's IP + User-Agent on load. That undercuts the
"we don't let anyone track you" stance.
→ *Fix (easy):* self-host Libre Caslon Text + Nunito as local WOFF2 files.

### Low

**L1 — Reset tokens stored in plaintext.** `password_reset_tokens.token` is the
raw value. DB exposure could allow use of unexpired (≤1h, single-use) tokens.
→ *Fix:* store a SHA-256 hash; compare hashes.

**L2 — CORS is fully open** (`app.use(cors())`). Acceptable for a public
bearer-auth API, but any origin can call it.
→ *Fix:* allowlist `https://nametag.n4bil.com`, the Vercel URL, and the Capacitor
origin.

**L3 — Exact coordinates stored at full precision.** Not exposed to other users
(good), but stored precisely.
→ *Consider:* truncating to ~3–4 decimals at rest — still enough for
"same room," less precise if the DB leaks.

**L4 — No API security headers** (no `helmet`). Frontend headers are handled by
Vercel; the API could add `helmet` for defense-in-depth. (Low.)

**L5 — Photos live on Render's ephemeral disk** — an availability/robustness
issue (files can vanish on redeploy), not a privacy one. Already noted in
`NABIL_TODOS.md`.

---

## 4. What's already good

- **Data minimization by design.** Going invisible clears the profile + deletes
  the photo + NULLs location immediately; a 24h cleanup does the same for stale
  users; only the single latest location is stored (no history table).
- **Hard account deletion** including the photo file and cascade to profile +
  reset tokens.
- **No third-party analytics or tracking.**
- **Passwords** bcrypt-hashed; **JWT secret** generated by Render, never
  committed.
- **`/nearby` exposes distance, not coordinates.**
- **`/forgot-password` doesn't leak** whether an email is registered.
- **Photos cropped/downscaled on-device** before upload (320px, ~2 KB).
- **Remembered names and hidden people never leave the device.**
- **HTTPS everywhere** (Vercel + Render).

---

## 5. Subprocessors (third parties that touch data)

| Provider | Role | Data it sees |
|---|---|---|
| **Neon** | Postgres database | Account + profile + location + reset tokens |
| **Render** | API host, uploads disk, logs | Everything transiting the API; photo files; request logs; reset-link logs (until SMTP) |
| **Vercel** | Frontend hosting + edge | Request metadata / IPs for page loads |
| **Google Fonts** | Font CDN | Visitor IP + User-Agent on each load (until self-hosted) |
| **Email provider** (Resend/SendGrid/…) | Password-reset email | Email addresses — *only once SMTP is configured* |
| Namecheap | DNS for n4bil.com | DNS queries (not user account data) |

These should be listed in the privacy policy's "who we share with" section.

---

## 6. Compliance notes (not legal advice)

- **Precise location** is treated as sensitive under GDPR/CCPA and app-store
  rules. Consent is obtained via the OS location prompt; the policy must state
  clearly what's collected, why, and for how long.
- **Right to access / delete:** deletion exists (`DELETE /me`); "access" is
  effectively "the app shows your own data." A formal data-export could be added
  later.
- **Minimum age:** set one (e.g. 13+ / 16+ in the EU) and state it.
- **App Store:** the iOS build needs the `Info.plist` usage strings (already
  tracked) and a privacy-nutrition-label matching this policy.

---

## 7. Prioritized remediation checklist

Before real users:
- [ ] **H1** — lock down photo serving (signed URLs / auth route / at least UUID filenames)
- [ ] **H2** — configure SMTP; gate the reset-link console log to non-prod
- [ ] **M1** — add rate limiting to auth + write endpoints
- [ ] **M4** — self-host fonts (removes Google from the loop; quick win)

Soon after:
- [ ] **M2** — de-enumerate `/register`
- [ ] **M3** — shorten JWT / add revocation
- [ ] **L1** — hash reset tokens · **L2** — restrict CORS · **L4** — add `helmet`

Nice to have:
- [ ] **L3** — truncate stored coordinate precision
- [ ] Data-export endpoint for access requests

---

*Companion document: `PRIVACY_POLICY.md` (the user-facing draft). Keep the two in
sync — every claim in the policy should be backed by behaviour verified here.*
