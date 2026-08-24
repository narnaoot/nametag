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

**H1 — Photos are served at public, unauthenticated URLs.** ✅ **FIXED (to the
sanctioned minimum).** Upload filenames are now a 128-bit random token with no
user id or timestamp (`server/routes/profile.js`), so photo URLs can't be
enumerated or guessed — you only learn one via the authenticated `/nearby` (or
your own profile), and files are deleted on invisible / after 24h.
→ *Residual / optional hardening:* the URL is still a bearer capability — anyone
it's shared with (or who finds it in logs/history) can view the photo while it
exists. For stronger control, move to an auth-gated photo route or object storage
with short-lived signed URLs. The policy does not claim photos are
access-controlled, so it's consistent either way.

**H2 — Password-reset links (with the email) are written to the server log.**
✅ **FIXED (code + delivery).** `sendResetEmail` no longer logs the link or email
in production — it logs only a non-sensitive "email not configured" warning; the
dev/test convenience log is gated to non-production (`server/routes/auth.js`).
Reset emails now send in production via **Resend's HTTPS API** (Render's free tier
blocks outbound SMTP, so we call the API directly with a defensive `From`), and
delivery is verified end-to-end.

### Medium

**M1 — No rate limiting.** ✅ **FIXED.** Added `express-rate-limit` to
`/api/auth` (50 req / 15 min / IP) plus `trust proxy` for correct client IPs
(`server/app.js`). The room APIs (`/api/profiles/*`) are deliberately **not**
IP-limited, because co-present users share a venue Wi-Fi/NAT and a per-IP limit
would throttle legitimate users. Per-account auth throttling is a future
improvement (see M3).

**M2 — Account enumeration via `/register`.** ✅ **FIXED.** Registration moved to
an **email-verification flow**: `/register` always returns `{ ok, pending }` and
sends an email (create + verify / resend / "you already have an account"),
revealing nothing about whether the address exists. Login is gated on
`email_verified`; verification tokens are hashed at rest (24h, single-use); a
non-enumerating `/resend-verification` exists. (`/forgot-password` was already
non-enumerating — always 200, with a regression test.)

**M3 — JWT is long-lived (30 days) and cannot be revoked.** It's stateless;
sign-out only deletes the token on the device. A leaked token stays valid until
expiry.
→ *Fix:* shorter access token + refresh token, or a token-version/denylist column
checked in `middleware/auth.js`. At minimum, document it.

**M4 — Google Fonts are loaded from Google's CDN.** ✅ **FIXED.** Libre Caslon
Text + Nunito are now self-hosted via `@fontsource/*` (WOFF2 bundled from npm and
served from our own origin, imported in `client/src/main.jsx`); the Google
`@import` and preconnects were removed. Verified: **zero** requests to
`fonts.googleapis.com` / `fonts.gstatic.com` at runtime.

### Low

**L1 — Reset tokens stored in plaintext.** ✅ **FIXED.** Only a SHA-256 hash of
the token is stored (`password_reset_tokens.token`); the raw value lives solely
in the emailed link. On reset, the incoming token is hashed and compared, so a DB
leak no longer yields usable reset links (`server/routes/auth.js`, `hashToken`).

**L2 — CORS is fully open** (`app.use(cors())`). ✅ **FIXED.** CORS is now an
allowlist (`server/app.js`): the production domain(s), Vercel preview builds
(`nametag-*.vercel.app`), the Capacitor native origins, and localhost dev; extra
origins can be added via `CORS_ORIGINS`. No-Origin requests (curl, health checks)
still pass. Any other browser origin gets no CORS headers.

**L3 — Exact coordinates stored at full precision.** Not exposed to other users
(good), but stored precisely.
→ *Consider:* truncating to ~3–4 decimals at rest — still enough for
"same room," less precise if the DB leaks.

**L4 — No API security headers** (no `helmet`). ✅ **FIXED.** `helmet` is applied
in `server/app.js` (nosniff, no `X-Powered-By`, frameguard, etc.). CSP is left off
(this is a JSON/image API, not an HTML origin — the frontend's CSP is Vercel's
job) and Cross-Origin-Resource-Policy is set to `cross-origin` so the frontend can
still load `/uploads` photo `<img>`s.

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
- **Auth is rate-limited** (M1) and **fonts are self-hosted** (M4) — no font CDN
  sees visitor IPs.

---

## 5. Subprocessors (third parties that touch data)

| Provider | Role | Data it sees |
|---|---|---|
| **Neon** | Postgres database | Account + profile + location + reset tokens |
| **Render** | API host, uploads disk, logs | Everything transiting the API; photo files; request logs; reset-link logs (until SMTP) |
| **Vercel** | Frontend hosting + edge | Request metadata / IPs for page loads |
| ~~Google Fonts~~ | ~~Font CDN~~ | **Removed** — fonts are now self-hosted (M4) |
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
- [x] **H1** — unguessable photo filenames (done; auth-gated/signed URLs optional further hardening)
- [x] **H2** — reset links no longer logged in prod (done in code; still set `SMTP_*` on Render to send emails)
- [x] **M1** — rate limiting on auth (done; room APIs intentionally exempt)
- [x] **M4** — self-host fonts (done; no more Google font requests)

Soon after:
- [x] **M2** — de-enumerate `/register` (done: email-verification signup flow)
- [ ] **M3** — shorten JWT / add revocation
- [x] **L1** — hash reset tokens · [x] **L2** — restrict CORS · [x] **L4** — add `helmet`

Nice to have:
- [ ] **L3** — truncate stored coordinate precision
- [ ] Data-export endpoint for access requests

---

*Companion document: `PRIVACY_POLICY.md` (the user-facing draft). Keep the two in
sync — every claim in the policy should be backed by behaviour verified here.*
