# Nametag — Session Restart Prompt

Paste this into Claude Code at the start of a new session to get up to speed quickly.

**At the end of every session**, update this file, `README.md`, and `NABIL_TODOS.md` to reflect what was done and what's next, then commit and push.

---

## What is this?

**Nametag** is a location-based social discovery app — a digital "Hello, My Name Is" badge. Users share their name, pronouns, and a photo. When nearby people open the app, they see each other's badges in a grid sorted by distance.

- **Live app**: https://nametag.vercel.app
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

**Code that still needs updating to honour this:**
1. `server/routes/profile.js` — add a DELETE `/api/profiles/me` endpoint that removes the user, profile, and photo file
2. `server/routes/profile.js` — when a user sets `is_active = false` (goes invisible), delete their server-side photo and NULL their location
3. Add a server-side cron / cleanup job that NULLs location and deletes photo files for users whose `location_updated_at` is older than 24h
4. On iOS: store the photo in Capacitor Filesystem on-device; upload to server on each "go visible" action rather than once-and-keep

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + Tailwind CSS → Vercel |
| Backend | Node.js + Express 5 → Render |
| Database | PostgreSQL on Neon |
| Auth | JWT (30-day, stored in `@capacitor/preferences`) |
| iOS | Capacitor 7 (`client/ios/`) |
| File uploads | Multer — photos on Render persistent disk |

---

## Current state (as of last session)

Everything below is **done and on `main`**:

- Full auth flow: register, login, forgot password, reset password (email sends via SMTP if configured; logs to console in dev)
- Profile editor: display name, pronouns, tagline, photo, nametag color, emoji stickers (up to 3), radius, always-visible toggle
- Nearby grid: Haversine distance in SQL (no PostGIS), 30-min activity window, bounding-box pre-filter
- Location + visibility: `is_active` toggle on the grid screen; auto-refresh every 60s
- First-time UX: new users land on the profile tab automatically
- iOS / Capacitor: app builds and runs natively; `@capacitor/camera` and `@capacitor/geolocation` wired up; photo URLs work in both web and native builds
- Token sync: `AuthContext` exposes token via `setToken()` — `api.js` reads from memory, not `localStorage`
- Brand theme system: `index.css` has a Tailwind v4 `@theme` block (`--color-brand`, `--color-page`, `--color-ink`, `--color-dim`, `--font-caveat`) → utility classes throughout; `constants.js` exports matching JS values (`COLOR_BRAND`, `FONT_CAVEAT`, etc.) for computed/programmatic use
- Constants: `NAME_MAX`, `PRONOUNS_MAX`, `TAGLINE_MAX`, `BANNER_COLORS`, `PRONOUN_OPTIONS`, `STICKER_OPTIONS`, `RADIUS_OPTIONS` all in `client/src/constants.js`
- `PersonCard` accepts a single `person` prop object (not 8 individual props); sticker JSON is memoized with `useMemo`
- Error handling: background location refresh surfaces errors to the UI; profile load failure shows a message in the form; `api.js` URL stripping uses an end-anchored regex (`/\/api$/`)
- 70 tests passing (Jest + Supertest, mocked DB)

---

## What still needs doing

**Privacy / data minimisation (implement before any real users):**
1. **Account deletion** — add `DELETE /api/profiles/me` (removes user row, profile row, photo file); add a "Delete account" button in the app UI.
2. **Photo cleanup on invisible** — when `is_active` is set to `false`, delete the server-side photo file and NULL the location. Photo re-uploads on next "go visible".
3. **Stale-data cleanup** — server cron (or Render cron job) that NULLs location and deletes photo files for users whose `location_updated_at` is older than 24h.
4. **On-device photo (iOS)** — store the user's own photo in Capacitor Filesystem; upload fresh to server each time they go visible rather than storing permanently server-side.

**Everything else:**
5. **SMTP email** — reset links are logged to the Render console. Set `SMTP_HOST/PORT/USER/PASS/FROM` + `APP_URL` env vars on Render to send real emails.
6. **iOS build** — needs a Mac with Xcode. Run `cd client && npx cap sync && npx cap open ios`. Codebase is clean and ready.
7. **iOS Privacy strings** — `Info.plist` needs `NSLocationWhenInUseUsageDescription`, `NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription` before App Store submission.
8. **Loading state on profile page** — no skeleton/placeholder while the profile loads on first open.

---

## How to orient yourself

```bash
git log --oneline -10       # see recent commits
cd server && npm test       # run the 70-test suite
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
    AuthPage.jsx          — login / register / forgot / reset
    ProfilePage.jsx       — profile editor
    GridPage.jsx          — nearby people grid
  hooks/
    useNearbyPeople.js    — location, nearby fetch, 60s auto-refresh
  designs/
    DesignE.jsx           — PersonCard + NavBar components

server/
  index.js               — entry point (runs migrations, starts server)
  app.js                 — Express app (middleware + routes)
  routes/auth.js         — /api/auth/* (register, login, forgot, reset)
  routes/profile.js      — /api/profiles/* (me, location, visibility, nearby)
  db/schema.sql          — table definitions
  middleware/auth.js     — JWT verification
  __tests__/             — Jest + Supertest suite
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
