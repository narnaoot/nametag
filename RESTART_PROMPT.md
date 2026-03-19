# Nametag — Session Restart Prompt

Paste this into Claude Code at the start of a new session to get up to speed quickly.

---

## What is this?

**Nametag** is a location-based social discovery app — a digital "Hello, My Name Is" badge. Users share their name, pronouns, and a photo. When nearby people open the app, they see each other's badges in a grid sorted by distance.

- **Live app**: https://nametag.vercel.app
- **API**: https://nametag.onrender.com
- **Repo**: https://github.com/narnaoot/nametag (cloned at `/home/user/nametag`)

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
- Constants: `NAME_MAX`, `PRONOUNS_MAX`, `TAGLINE_MAX`, `BANNER_COLORS`, `PRONOUN_OPTIONS`, `STICKER_OPTIONS`, `RADIUS_OPTIONS` all in `client/src/constants.js`
- 70 tests passing (Jest + Supertest, mocked DB)

---

## What still needs doing

1. **SMTP email** — password reset links are working but only logged to the Render console right now. Need to set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, and `APP_URL` env vars on Render to send real emails.
2. **iOS build** — needs a Mac with Xcode. Run `cd client && npx cap sync && npx cap open ios` to build and test on device. Photo URL fix from last session should make photos load correctly in native.
3. **Photo storage** — currently stored on Render's disk (`/uploads`). Works fine for now but a free Render instance will lose files on redeploy. Consider Cloudinary or S3 for real persistence.
4. **Loading states** — the grid shows "Looking for people nearby…" during the initial location fetch, but there's no skeleton/placeholder for the profile page load.

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

## Deployment

Push to `main` → Render auto-deploys backend, Vercel auto-deploys frontend.

Work on risky changes in a `claude/<description>` branch, then PR into main.
