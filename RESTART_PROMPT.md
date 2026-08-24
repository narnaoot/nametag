# Nametag — Session Restart Prompt

Paste this into Claude Code at the start of a new session to get up to speed quickly.

**At the end of every session**, update this file and `NABIL_TODOS.md` (and, when relevant, `PRIVACY_REVIEW.md` / `client/REDESIGN.md`) to reflect what was done and what's next, then commit and push.

---

## ⚠️ Latest: Privacy, security & auth hardening — MERGED to `main` (Aug 2026)

The most recent session focused on privacy/security and the auth flow. All on
`main`, **105 server tests passing**:

- **Email works** (password reset + email verification) via **Resend's HTTPS
  API** — Render's free tier blocks outbound SMTP, so the server calls the API
  directly (`server/routes/auth.js`). Verified sending domain `send.n4bil.com`.
- **Email-verification signup flow** — registration no longer logs you in or
  reveals whether an email exists; it sends a verification link, and you're
  signed in only after clicking it (`?verify=<token>` → onboarding). Login is
  gated on `email_verified`; there's a "Check your email" + resend UI.
- **JWT revocation** — every token carries the account's `token_version`, checked
  in `middleware/auth.js`; a password reset bumps it (revoking all sessions), and
  the client auto-signs-out on a rejected token.
- **Privacy review complete** (`PRIVACY_REVIEW.md`) — every High + Medium fixed
  (H1 unguessable photo URLs, H2 email, M1 rate-limiting, M2 register
  enumeration, M3 revocation, M4 self-hosted fonts) plus L1 (hashed reset +
  verification tokens), L2 (CORS allowlist), L4 (helmet). Only L3 (coordinate
  precision) and a data-export endpoint remain, both optional.
- **Privacy policy live in-app** — `PRIVACY_POLICY.md` is written and rendered by
  `client/src/pages/PolicyDocument.jsx`, reached from the Privacy tab's "Read the
  whole policy" row. Owner: Nabil Arnaoot; contact: privacy@n4bil.com (alias
  still needs mail forwarding set up); min age 16.

### Earlier: UI redesign — MERGED (PR #16)

The client UI was rebuilt to the "nearby name tags" Claude Design canvas in
`redesign/` — Libre Caslon Text + Nunito (**self-hosted via `@fontsource`**),
colour rules (**orchid is the app**; user-pickable tag colours; your own tag
wears the orchid "you" ring), the wall of hand-tilted tags, a three-way
visibility control, a Privacy tab, two-step onboarding, the party-code sheet, and
responsive tablet/desktop layouts. It **supersedes** the earlier teal/Playfair
design. See **`client/REDESIGN.md`** and **`REDESIGN_QUESTIONS.md`**. The app is
**live at https://nametag.n4bil.com** (Namecheap CNAME → Vercel; Render `APP_URL`
set to match). Sections below describe the backend/stack accurately; older
frontend-UI details are historical.

---

## What is this?

**Nametag** is a location-based social discovery app — a digital "Hello, My Name Is" badge. Users share their name, pronouns, and a photo. When nearby people open the app, they see each other's badges — a wall of hand-tilted name tags.

- **Live app**: https://nametag.n4bil.com _(live — custom domain via Namecheap CNAME → Vercel; underlying Vercel URL: https://nametag-pi.vercel.app. Render `APP_URL` set to the custom domain so reset links use it.)_
- **API**: https://nametag.onrender.com
- **Repo**: https://github.com/narnaoot/nametag (cloned at `/home/user/nametag`)

---

## Core privacy principle — minimise server-side data

**The server is a relay, not a data store.** User photos and location must live on the server for the shortest time possible — only while actively needed — and be deleted as soon as they are not. This is non-negotiable: it's both a privacy commitment to users and a cost constraint.

What this means concretely:

- **Photos** — primary copy lives on-device (Capacitor Filesystem). The server copy exists only to serve nearby users while the owner is visible. It must be deleted when the user goes invisible, when their location hasn't been refreshed in X hours (TBD, probably 24h), or when they delete their account.
- **Location** — never stored as history. The DB holds only the single most-recent lat/lng, overwritten on each refresh. Already enforced by the schema (one row per user, no history table). Location should be cleared (set to NULL) when a user goes invisible or goes stale.
- **Account deletion** — must be a hard, immediate delete of everything: user row, profile row, photo file on disk. Cascade is already in the schema; the route needs to exist and the UI needs to expose it.
- **No server-side caching** of data beyond the immediate request.

**All four items are now implemented** — see the commit "Implement privacy data-minimisation".

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + Tailwind CSS → Vercel |
| Backend | Node.js + Express 5 → Render |
| Database | PostgreSQL on Neon |
| Auth | JWT (30-day, stored in `@capacitor/preferences`); **revocable via `token_version`**; email-verified signup |
| Email | Resend (HTTPS API) — password reset + email verification |
| iOS | Capacitor 7 (`client/ios/`) |
| File uploads | Multer — photos on Render persistent disk |

---

## Current state (as of last session)

Everything below is **done and on `main`** (105 server tests passing):

- Full auth flow: register → **email verification** → login, forgot/reset password. Emails send via **Resend's HTTPS API** in production (logs the link to console in dev when no provider is set). Login is gated on `email_verified`; JWTs are revocable via `token_version` (a reset revokes existing sessions; client auto-signs-out on a 401).
- Privacy/security hardening: unguessable photo filenames, auth rate-limiting, self-hosted fonts, CORS allowlist, helmet headers, hashed reset/verification tokens. Full audit in `PRIVACY_REVIEW.md`; user-facing policy in `PRIVACY_POLICY.md` + the in-app `PolicyDocument.jsx`.
- Profile editor: display name, pronouns, tagline, photo, nametag color, emoji stickers (up to 3), radius, always-visible toggle
- Nearby grid: Haversine distance in SQL (no PostGIS), 30-min activity window, bounding-box pre-filter
- Location + visibility: `is_active` toggle on the grid screen; auto-refresh every 60s
- First-time UX: new users land on the profile tab automatically
- iOS / Capacitor: app builds and runs natively; `@capacitor/geolocation` wired up; photo URLs work in both web and native builds
- Photo upload: uses standard `<input type="file">` on web (Capacitor Camera removed from ProfilePage — was breaking in browsers); Capacitor Camera still available for native iOS if needed
- Show/hide password toggle on all auth forms (login, register, reset password)
- Geolocation on web fixed: `Geolocation.requestPermissions()` threw "Not implemented on web" in Capacitor on browsers; now caught so `getCurrentPosition()` proceeds and browser prompts naturally
- Nearby photo fix: `cleanup.js` can delete the server photo without NULLing `display_name`; `loadMyProfile` now triggers `reuploadFullProfile()` when either `display_name` or `photo_path` is missing
- Auto-save on ProfilePage: save button removed; any field change debounces a save (700ms); "Saving…" / "Saved ✓" status appears next to the page title (always visible, not below the fold)
- Token sync: `AuthContext` exposes token via `setToken()` — `api.js` reads from memory, not `localStorage`
- Brand theme system: `index.css` has a Tailwind v4 `@theme` block (`--color-brand`, `--color-page`, `--color-ink`, `--color-dim`, `--font-caveat`) → utility classes throughout; `constants.js` exports matching JS values (`COLOR_BRAND`, `FONT_CAVEAT`, etc.) for computed/programmatic use
- Constants: `NAME_MAX`, `PRONOUNS_MAX`, `TAGLINE_MAX`, `BANNER_COLORS`, `PRONOUN_OPTIONS`, `STICKER_OPTIONS`, `RADIUS_OPTIONS` all in `client/src/constants.js`
- `PersonCard` accepts a single `person` prop object (not 8 individual props); sticker JSON is memoized with `useMemo`
- Error handling: background location refresh surfaces errors to the UI; profile load failure shows a message in the form; `api.js` URL stripping uses an end-anchored regex (`/\/api$/`)
- Privacy data-minimisation implemented:
  - `server/cleanup.js` — `runCleanup()` runs hourly; finds profiles stale >24h, deletes photo files, NULLs location
  - `POST /me/visibility` going invisible: deletes server photo, NULLs location immediately
  - `DELETE /me`: hard-deletes user + profile (cascade) + photo file
  - `POST /me/photo`: standalone photo re-upload for going-visible flow
  - `ProfilePage`: saves photo to Capacitor Filesystem on-device; loads local copy on mount
  - `useNearbyPeople`: re-uploads local photo when going visible or when server copy is missing
  - "Delete account" UI in ProfilePage with two-step confirmation
- `@capacitor/filesystem` installed; `LOCAL_PHOTO_PATH` constant in `constants.js`
- 80 tests passing (Jest + Supertest, mocked DB + fs.promises.unlink)

---

## What still needs doing

**Privacy — remaining (all optional / lower priority):**
1. **L3 — coordinate precision** — truncate stored lat/lng to ~3–4 decimals at rest (still fine for "same room," less precise if the DB leaks).
2. **Data-export endpoint** — a formal GDPR/CCPA "access" request path (deletion already exists via `DELETE /me`).
3. **Harden photo serving (H1 residual, optional)** — photo files are unguessable random URLs now, but still public bearer capabilities; auth-gated or signed URLs are optional further hardening.

**Non-code, on Nabil (see `NABIL_TODOS.md`):**
4. **`privacy@n4bil.com` forwarding** — set up mail forwarding for the policy contact alias so it actually receives mail (Namecheap Email Forwarding).
5. **Legal read** of `PRIVACY_POLICY.md` before real users.
6. **End-to-end test on live app** — register → verify email → onboarding → nearby → reset password, on nametag.n4bil.com.

**iOS / product:**
7. **iOS build** — needs a Mac with Xcode. `cd client && npx cap sync && npx cap open ios`.
8. **iOS Privacy strings** — `Info.plist` needs `NSLocationWhenInUseUsageDescription`, `NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription` before App Store submission.
9. **Deep link for password reset / verification** — links open the web app in Safari; wire a custom URL scheme / Universal Link for native.
10. **Homepage link** — add a "Try Nametag →" link to https://nametag.n4bil.com on the n4bil.com site (repo `narnaoot/narnaoot.github.io`).

**Future auth refinement:** refresh-token rotation to shorten the 30-day access token (revocation is already in place, so this is not a blocker).

---

## How to orient yourself

```bash
git log --oneline -10       # see recent commits
cd server && npm test       # run the 105-test suite
cd client && npm run build  # confirm the client builds
git status                  # check for anything uncommitted
```

---

## Key files

```
client/src/
  App.jsx               — shell, tab nav, first-time user redirect
  AuthContext.jsx        — JWT token state (@capacitor/preferences)
  api.js                 — fetch wrapper + photoUrl() helper
  constants.js           — shared field limits, colors, options
  pages/
    AuthPage.jsx          — landing / login / register / verify / forgot / reset
    OnboardingPage.jsx    — two-step first-run (tag, then photo + stickers)
    GridPage.jsx          — the nearby wall (empty/error/skeleton states)
    ProfilePage.jsx       — My tag editor (auto-save, on-device photo, delete)
    PrivacyPage.jsx       — Privacy tab (state + four statements + policy link)
    PolicyDocument.jsx    — the full in-app privacy policy screen
  hooks/
    useNearbyPeople.js    — location, nearby fetch, 60s auto-refresh, visibility
  AuthContext.jsx         — JWT state; auto sign-out on a rejected token

server/
  index.js               — entry point (runs migrations, starts server)
  app.js                 — Express app (helmet, CORS allowlist, rate limit, routes)
  routes/auth.js         — /api/auth/* (register, verify-email, resend-verification, login, forgot/reset)
  routes/profile.js      — /api/profiles/* (me, location, visibility, nearby, photo, delete)
  db/schema.sql          — table definitions (users, profiles, reset + verification tokens)
  db/migrate.js          — idempotent migrations run on startup
  middleware/auth.js     — JWT verification + token_version revocation check
  middleware/tokenVersion.js — the revocation lookup (mockable in tests)
  cleanup.js             — hourly stale-data + photo cleanup
  __tests__/             — Jest + Supertest suite (105 tests)
```

---

## iPhone app plans

The Capacitor scaffolding exists (`client/ios/`) but the native app isn't fully built out yet. Key design decision: **user photos and profile data should be stored on-device** (not just fetched from the server each time), so the app feels instant and works with poor connectivity.

Things to build / decide:

- [ ] **On-device storage** — cache own profile (name, pronouns, photo, stickers, colors) in `@capacitor/preferences` or SQLite so it loads instantly without a network round-trip
- [ ] **On-device photo storage** — when user picks a profile photo, store a local copy on the device (Capacitor Filesystem) in addition to uploading to the server; use the local copy for display to avoid a network load
- [ ] **First iOS build** — needs Mac + Xcode; run `cd client && npx cap sync && npx cap open ios`; test on a real device
- [ ] **Push notifications** — notify users when someone new shows up nearby (requires APNs setup)
- [ ] **Background location** — decide whether to update location in the background or only when the app is open (privacy + battery tradeoff)
- [ ] **App Store submission** — bundle ID, signing, privacy manifest (required for location + camera permissions)
- [ ] **Deep link for password reset** — currently the reset link opens the web app in Safari; wire up a custom URL scheme or Universal Link so it opens the native app instead

---

## Deployment

Push to `main` → Render auto-deploys backend, Vercel auto-deploys frontend.

Work on risky changes in a `claude/<description>` branch, then PR into main.
