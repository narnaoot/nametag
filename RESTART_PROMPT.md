# Nametag — Session Restart Prompt

Paste this into Claude Code at the start of a new session to get up to speed quickly.

**At the end of every session**, update this file and `NABIL_TODOS.md` (and, when relevant, `PRIVACY_REVIEW.md` / `client/REDESIGN.md`) to reflect what was done and what's next, then commit and push.

---

## 🔒 Latest: privacy pass — minimal cloud (Nov 2026)

Goal from Nabil: nothing saved in the cloud, everything on the device. A server
is unavoidable for matching, so this pass makes it hold a tag only while its
owner is on the wall. Verified in a browser with two users against a real
Postgres (the DB was inspected after each step); 132 server tests.

- **Leave signal** — `POST /me/leave` on `pagehide` wipes the tag when the app is
  closed; the device restores it on return.
- **30 minutes, not 24 hours** — the stale wipe now matches the point at which
  others stop seeing you; the sweep runs every 5 minutes.
- **Location** rounded to 4 decimals at rest; not stored while invisible.
- **No distances** from `/nearby` (they allowed pinpointing).
- **Party codes expire after 4 hours** — members go invisible; the code is wiped
  with the tag. The device remembers the start time so restoring doesn't reset it.
- **Records purged** — spent/expired email links, never-verified sign-ups.
- **Photos** — an uncroppable photo is rejected rather than uploaded in full.
- **Keep-awake ping** — `.github/workflows/keep-awake.yml` hits `/api/health`
  every 5 minutes so the sweep runs on time on Render's free plan.
- **Privacy tab, in-app policy, `PRIVACY_POLICY.md`, `PRIVACY_REVIEW.md`**
  rewritten to match; `PRIVACY_REVIEW.md` §4 lists what is still imperfect.

## 🧽 Earlier: client simplification (Nov 2026)

Behaviour-preserving refactor, checked against before/after screenshots of every
screen at phone / tablet / desktop sizes plus the two-user browser scenarios:

- **`lib/profileSync.js`** — `saveProfile` (My tag, onboarding) and `pushProfile`
  (restore / visibility switch) are the only code that sends a tag to the
  server, so "the server holds it only while you're visible" lives in one place.
- **`useNearbyPeople`** — one `readRoom()` (share location → load nearby →
  error state) replaces three copies; unused state removed.
- **`GridPage`** — one render driven by the `BOARD` table instead of three
  near-identical phone / tablet / desktop blocks.
- **`VisibilityControl`** owns the party-code sheet (pages just get
  `onChange(mode, { partyCode })`); **`Sheet.jsx`** is the shared bottom sheet
  (`DetailSheet.jsx` is gone).
- Dead props/exports and stale comments removed.

**Not done, worth considering:** `PUT /profiles/me` could be a single upsert
(the tests are coupled to its three-query sequence); the two visibility flags
(`always_visible`, `is_active`) could become one `visibility` column; and
"visible N min" on an opened tag never shows because `/nearby` doesn't return
`location_updated_at`.

## 🐞 Earlier: hands-on bug sweep (Nov 2026)

Ran the real stack locally (Postgres + API + production client build) with
several simulated users in a browser. Fixed, with 11 new server tests (116 total):

- **Invisible now sticks.** It used to be undone by a tab switch or reload, and
  on a fresh load the UI could say "You're invisible" while location was still
  being shared (stale `modeRef` race in `useNearbyPeople`). Going invisible now
  records `always_visible = FALSE` on the server and on-device; while invisible
  nothing is restored or auto-saved to the server (edits stay on the device).
- **Party codes isolate both ways** (`IS NOT DISTINCT FROM`) — party members were
  visible to everyone not in a party. Codes are normalised (letters + digits,
  upper-case) on client and server, so hyphens/spaces/capitals really don't matter.
- **My tag edits are flushed on Done / tab switch** (were dropped if you left
  inside the 700 ms auto-save debounce); the wall waits for an in-flight save.
- **On-device data is tied to an account** (`profile_owner`): a second account
  on the same device no longer inherits the previous tag; delete-account clears it.
- **No-tag state**: skipping onboarding showed a bogus "Turn on location"; the
  wall now says "Make your tag first". Nameless rows are excluded from `/nearby`.
- **Server hardening**: upload extension comes from an image-type allowlist (an
  `.html`/`.svg` "photo" was served as a page from our origin); radius clamped
  to 10–1000 m (was unbounded → could list every user); field lengths enforced;
  coordinates validated; orphaned uploads deleted; never-located profiles age out.
- Long names/lines wrap instead of overflowing the tag; clearer copy for a
  reused verification link.

**Found but left for a decision** (see `NABIL_TODOS.md`): pronoun "skip" still
saves `they/them`; auth rate limit (50 / 15 min per IP) is easy to hit on shared
venue Wi-Fi; "Remember the name" has no list to view and "Hide from me" has no
undo; a password reset doesn't mark an unverified email as verified.

## 🧹 Earlier: iOS-readiness cleanup — dedup + dead code (Aug 2026)

Behaviour-preserving cleanup pass (105 server tests still green, client builds
+ lints clean):

- **One source of truth for the profile contract** — the "fields → FormData"
  serialization was written three times (ProfilePage, OnboardingPage,
  `useNearbyPeople.pushProfile`) and had started to drift. It now lives in
  `client/src/lib/profile.js` (`normalizeProfileFields`, `toProfileFormData`)
  with the visibility-mode rule (`visibilityMode`), reused by all three.
- **Shared photo pick** — the crop-or-fallback pick handler (duplicated in
  ProfilePage + OnboardingPage) is now `preparePickedPhoto()` in `lib/imageCrop.js`.
- **Server dedup** — the four routes that touch the on-disk photo share a
  `fetchProfilePhoto()` helper; the privacy field-wipe SQL used by both the
  visibility route and the stale cleanup is now one shared `CLEAR_PROFILE_SET`
  (exported from `cleanup.js`), so a new sensitive column can't be wiped in one
  place and forgotten in the other. Field limits are named constants.
- **Dead code removed** — `BRAND_ACCENT` (duplicated the `--brand` CSS var),
  and the unused `forgetName` / `unhidePerson` storage helpers. Kept
  intentionally: the tested `POST /me/photo` route + its `uploadPhoto()` client
  wrapper (a ready photo-only endpoint for native), currently caller-less.
- **Deferred:** the inline-style → CSS-token migration and the 4-way tag-card
  unification (visually sensitive; best done together, as a later pass).

## iOS-readiness cleanup — structural refactor (Aug 2026)

Pre-iOS tidy of the prototype (no behavior change):

- **Removed design artifacts** — `redesign/`, `design_handoff_nametag_redesign/`,
  and `temp/` (design snapshots + a stray export, not app code; in git history).
- **Regrouped `client/src/`** — the flat root's non-UI modules now live in
  `lib/` (`api`, `constants`, `colors`, `imageCrop`, `profileStorage`) and
  `auth/` (`AuthContext`, `useAuth`); `App.jsx`, `main.jsx`, `index.css`,
  `components/`, `pages/`, `hooks/` unchanged. Imports rewritten accordingly.
  Verified with `vite build` + `eslint`. Server untouched.

## ⚠️ Privacy, security & auth hardening — MERGED to `main` (Aug 2026)

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

The client UI was rebuilt to the "nearby name tags" Claude Design canvas
(design source formerly in `redesign/`, since removed — in git history) —
Libre Caslon Text + Nunito (**self-hosted via `@fontsource`**),
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

## Core privacy principle — the tag lives on the device

**The device is the home of your tag; the server is a relay.** The goal is
"nothing saved in the cloud". A server is unavoidable for matching people in the
same place, so the rule is: it holds a tag **only while its owner is on the
wall**, and deletes it within minutes of them leaving. This is non-negotiable.
The rules live in one file, `server/cleanup.js`:

- **What the server may keep permanently:** email, password hash, and the
  visibility setting. Nothing else.
- **The tag** (name, pronouns, line, stickers, colour, photo, location, party
  code) is wiped: at once on going invisible; at once on closing the app
  (`POST /me/leave`, web `pagehide`); after `STALE_MINUTES` = 30 without a
  location refresh; when a party code is `PARTY_CODE_HOURS` = 4 old (the member
  goes invisible); on account deletion.
- **Location** — one point, rounded to 4 decimals, never a history, not stored
  at all while invisible. `/nearby` never returns coordinates or distances.
- **While invisible nothing is re-uploaded** — edits stay on the device.
- **The device restores the tag** when the app returns (`pushProfile` in
  `client/src/lib/profileSync.js`); `/me/location` replies `has_tag: false` to
  tell it to.
- **Records** — spent/expired email links and never-verified sign-ups are deleted
  by the sweep.

If you change any of this, update the in-app Privacy tab
(`PrivacyPage.jsx`), the in-app policy (`PolicyDocument.jsx`),
`PRIVACY_POLICY.md` and `PRIVACY_REVIEW.md` in the same change.

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
- Nearby grid: Haversine distance in SQL (no PostGIS) used to filter and order only — never returned; 30-min activity window, bounding-box pre-filter
- Location + visibility: `is_active` toggle on the grid screen; auto-refresh every 60s
- First-time UX: new users land on the profile tab automatically
- iOS / Capacitor: app builds and runs natively; `@capacitor/geolocation` wired up; photo URLs work in both web and native builds
- Photo upload: uses standard `<input type="file">` on web (Capacitor Camera removed from ProfilePage — was breaking in browsers); Capacitor Camera still available for native iOS if needed
- Show/hide password toggle on all auth forms (login, register, reset password)
- Geolocation on web fixed: `Geolocation.requestPermissions()` threw "Not implemented on web" in Capacitor on browsers; now caught so `getCurrentPosition()` proceeds and browser prompts naturally
- Nearby photo fix: `cleanup.js` can delete the server photo without NULLing `display_name`; `loadMyProfile` now triggers `pushProfile()` (in `useNearbyPeople`) when either `display_name` or `photo_path` is missing
- Auto-save on ProfilePage: save button removed; any field change debounces a save (700ms); "Saving…" / "Saved ✓" status appears next to the page title (always visible, not below the fold)
- Token sync: `AuthContext` exposes token via `setToken()` — `api.js` reads from memory, not `localStorage`
- Brand theme system: `index.css` has a Tailwind v4 `@theme` block (`--color-brand`, `--color-page`, `--color-ink`, `--color-dim`, `--font-caveat`) → utility classes throughout; `constants.js` exports matching JS values (`COLOR_BRAND`, `FONT_CAVEAT`, etc.) for computed/programmatic use
- Constants: `NAME_MAX`, `PRONOUNS_MAX`, `TAGLINE_MAX`, `BANNER_COLORS`, `PRONOUN_OPTIONS`, `STICKER_OPTIONS`, `RADIUS_OPTIONS` all in `client/src/lib/constants.js`
- The tag components (`Tag`, `MyTagPreview`) accept a single `person` prop object built by `toBadgePerson` in `lib/colors.js` (not many individual props); sticker JSON is parsed there and memoized in `GridPage` with `useMemo`
- Error handling: background location refresh surfaces errors to the UI; profile load failure shows a message in the form; `api.js` URL stripping uses an end-anchored regex (`/\/api$/`)
- Privacy data-minimisation implemented:
  - `server/cleanup.js` — `runCleanup()` runs every 5 min: wipes tags not refreshed in 30 min, ends parties older than 4 h, deletes spent email links and never-verified sign-ups
  - `POST /me/visibility` going invisible: wipes the tag (incl. photo, location, party code) immediately and records the choice
  - `POST /me/leave`: wipes the tag when the app is closed, keeping the visibility choice
  - `DELETE /me`: hard-deletes user + profile (cascade) + photo file
  - `POST /me/photo`: standalone photo re-upload for going-visible flow
  - `ProfilePage`: saves photo to Capacitor Filesystem on-device; loads local copy on mount
  - `useNearbyPeople`: re-uploads local photo when going visible or when server copy is missing
  - "Delete account" UI in ProfilePage with two-step confirmation
- `@capacitor/filesystem` installed; `LOCAL_PHOTO_PATH` constant in `constants.js`
- 132 server tests passing (Jest + Supertest, mocked DB + fs.promises.unlink)

---

## What still needs doing

**Privacy — remaining (all optional / lower priority):**
1. **Residual privacy risks** — listed in `PRIVACY_REVIEW.md` §4. The 30-minute wipe only runs while the API process is awake; `.github/workflows/keep-awake.yml` pings it every 5 minutes to keep Render's free plan from sleeping.
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
  auth/
    AuthContext.jsx       — JWT token state (@capacitor/preferences); auto sign-out on a rejected token
    useAuth.js            — the context hook
  lib/
    api.js                — fetch wrapper + photoUrl() helper
    constants.js          — shared field limits, colors, options
    colors.js             — accent/paintbox resolution + toBadgePerson()
    profile.js            — profile field contract (normalize + FormData), visibilityMode(), party-code normalisation
    profileSync.js        — saveProfile() / pushProfile(): the only code that sends a tag to the server
    profileStorage.js     — on-device profile/photo persistence, which account owns it, remembered/hidden lists
    imageCrop.js          — on-device crop/downscale + preparePickedPhoto()
  pages/
    AuthPage.jsx          — landing / login / register / verify / forgot / reset
    OnboardingPage.jsx    — two-step first-run (tag, then photo + stickers)
    GridPage.jsx          — the nearby wall (empty/error/skeleton states)
    ProfilePage.jsx       — My tag editor (auto-save, on-device photo, delete)
    PrivacyPage.jsx       — Privacy tab (state + four statements + policy link)
    PolicyDocument.jsx    — the full in-app privacy policy screen
  hooks/
    useNearbyPeople.js    — readRoom() (location + nearby), 60s auto-refresh, visibility mode
    useViewport.js        — phone / tablet / desktop breakpoint

server/
  index.js               — entry point (runs migrations, starts server)
  app.js                 — Express app (helmet, CORS allowlist, rate limit, routes)
  routes/auth.js         — /api/auth/* (register, verify-email, resend-verification, login, forgot/reset)
  routes/profile.js      — /api/profiles/* (me, location, visibility, nearby, photo, delete)
  db/schema.sql          — table definitions (users, profiles, reset + verification tokens)
  db/migrate.js          — idempotent migrations run on startup
  middleware/auth.js     — JWT verification + token_version revocation check
  middleware/tokenVersion.js — the revocation lookup (mockable in tests)
  cleanup.js             — the data-retention rules + the 5-minute sweep that enforces them
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
