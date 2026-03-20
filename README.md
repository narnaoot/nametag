# Nametag

A location-based social discovery app — a digital "Hello, My Name Is" badge. See who's nearby in real time, share your name and pronouns, and control your own visibility.

**Live app**:https://nametag-pi.vercel.app/· **API**: [nametag.onrender.com](https://nametag.onrender.com)

> **Resuming development?** See [RESTART_PROMPT.md](RESTART_PROMPT.md) for current state and what's next.

---

## Features

- **Register / sign in** with email and password
- **Forgot password** — reset link sent by email (or logged to console in dev)
- **Build your profile** — display name, pronouns, tagline, photo, nametag color, and up to 3 emoji stickers
- **Share your location** via Capacitor Geolocation (web + native iOS)
- **See the grid** — nearby people displayed as "Hello My Name Is" badge cards, sorted by distance
- **Control visibility** — always visible, or only show yourself when you choose
- **Auto-refresh** — location and nearby grid update every 60 seconds
- **iOS app** — runs natively via Capacitor 7

---

## Privacy design

Nametag treats the server as a **relay, not a data store**. User privacy is critical.  User data lives on the server only as long as strictly necessary:

- **Profile data (name, pronouns, tagline, color, stickers)** — the primary copy lives on-device in `@capacitor/preferences`. The server copy is populated only while you are visible to others, and is cleared (set to NULL) the moment you go invisible or your session goes stale. It is re-uploaded transparently from the on-device copy the next time you become active.
- **Photos** — same lifecycle as profile data. The primary copy lives on-device (Capacitor Filesystem). The server copy is deleted when you go invisible or inactive, and re-uploaded when you become visible again.
- **Location** — never stored as history. The server holds only your single most-recent position, and it is cleared when you go invisible or inactive.
- **Account deletion** — a hard delete: user record, profile, and photo file are removed immediately.
- **No persistent tracking** — there is no location history, no activity log, no analytics on user movement.

### Data storage at a glance

| Data | On your phone (permanent) | Server (temporary) |
|---|---|---|
| Name, pronouns, tagline, color, stickers | `@capacitor/preferences` | Only while active; NULLed on invisible/stale |
| Photo | Capacitor Filesystem | Only while active; deleted on invisible/stale |
| Other people's info | Not stored | Only while they're active |
| Location | Never | Current position only; NULLed on invisible/stale |

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4 |
| Backend | Node.js, Express 5 |
| Database | PostgreSQL (Neon) |
| Auth | JWT (30-day tokens, bcrypt passwords) |
| File uploads | Multer (photos stored on server disk) |
| iOS | Capacitor 7 |
| Hosting | Render (API) + Vercel (frontend) |

---

## Project structure

```
nametag/
├── client/                   # React + Vite frontend
│   ├── vercel.json           # Vercel rewrites → Render API
│   ├── vite.config.js        # Dev proxy → localhost:3001
│   └── src/
│       ├── App.jsx           # App shell + tab navigation
│       ├── AuthContext.jsx   # JWT token state (@capacitor/preferences)
│       ├── api.js            # Fetch wrapper + photoUrl() helper
│       ├── constants.js      # Brand tokens, shared colors, options, field limits
│       ├── index.css         # Tailwind v4 @theme tokens (color-brand, font-caveat, …)
│       ├── pages/
│       │   ├── AuthPage.jsx     # Login / register / forgot / reset password
│       │   ├── ProfilePage.jsx  # Edit profile
│       │   └── GridPage.jsx     # Nearby people grid
│       ├── hooks/
│       │   └── useNearbyPeople.js  # Location, nearby fetch, 60s auto-refresh
│       └── designs/
│           └── DesignE.jsx   # PersonCard + NavBar components
└── server/                   # Express API
    ├── index.js              # Entry point — runs migrations, starts server
    ├── app.js                # Express app (middleware + routes)
    ├── render.yaml           # Render deployment config
    ├── db/
    │   ├── index.js          # PostgreSQL connection pool
    │   ├── schema.sql        # Table definitions
    │   └── migrate.js        # Runtime migrations
    ├── middleware/
    │   └── auth.js           # JWT verification
    ├── routes/
    │   ├── auth.js           # /api/auth/* (register, login, forgot, reset)
    │   └── profile.js        # /api/profiles/* (me, location, visibility, nearby)
    └── __tests__/            # Jest + Supertest test suite
```

---

## API endpoints

All authenticated endpoints require `Authorization: Bearer <token>`.

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create account → returns JWT |
| POST | `/api/auth/login` | — | Sign in → returns JWT |
| POST | `/api/auth/forgot-password` | — | Send password reset email |
| POST | `/api/auth/reset-password` | — | Set new password via reset token |
| GET | `/api/profiles/me` | ✓ | Get your profile |
| PUT | `/api/profiles/me` | ✓ | Create / update profile (multipart) |
| POST | `/api/profiles/me/location` | ✓ | Update lat/lng |
| POST | `/api/profiles/me/visibility` | ✓ | Toggle is_active |
| GET | `/api/profiles/nearby` | ✓ | List nearby people (Haversine + bounding box) |
| GET | `/api/health` | — | Health check |

---

## Database schema

```sql
users
  id SERIAL PRIMARY KEY
  email TEXT UNIQUE NOT NULL
  password_hash TEXT NOT NULL
  created_at TIMESTAMPTZ DEFAULT NOW()

profiles
  id SERIAL PRIMARY KEY
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE
  display_name TEXT             -- NULLed while user is invisible/inactive
  pronouns TEXT                 -- NULLed while user is invisible/inactive
  tagline TEXT
  photo_path TEXT
  radius_meters INTEGER DEFAULT 100
  always_visible BOOLEAN DEFAULT TRUE
  is_active BOOLEAN DEFAULT FALSE
  lat DOUBLE PRECISION
  lng DOUBLE PRECISION
  location_updated_at TIMESTAMPTZ
  tag_color TEXT
  stickers TEXT          -- JSON array of emoji strings
  updated_at TIMESTAMPTZ DEFAULT NOW()

password_reset_tokens
  id SERIAL PRIMARY KEY
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
  token TEXT UNIQUE NOT NULL
  expires_at TIMESTAMPTZ NOT NULL
  used BOOLEAN DEFAULT FALSE
  created_at TIMESTAMPTZ DEFAULT NOW()
```

---

## Local development

**Prerequisites:** Node.js 18+, PostgreSQL

```bash
# 1. Database
createdb nametag
psql nametag -f server/db/schema.sql

# 2. Server  (Terminal 1)
cd server
cp .env.example .env   # fill in DATABASE_URL + JWT_SECRET
npm install
npm run dev            # starts on :3001 with --watch

# 3. Client  (Terminal 2)
cd client
npm install
npm run dev            # starts on :5173, proxies /api to :3001
```

Open [http://localhost:5173](http://localhost:5173)

### Environment variables (server/.env)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Long random string for signing tokens |
| `PORT` | Server port (default: `3001`) |
| `APP_URL` | Frontend URL used in reset-password links (default: `https://nametag.vercel.app`) |
| `SMTP_HOST` | SMTP server hostname (optional — omit to log reset links to console) |
| `SMTP_PORT` | SMTP port (default: `587`) |
| `SMTP_SECURE` | `true` for port 465 TLS |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `SMTP_FROM` | From address (default: `Nametag <no-reply@nametag.app>`) |

---

## Deployment

See [DEPLOY.md](DEPLOY.md) for full step-by-step instructions (Neon + Render + Vercel, all free).

**Quick summary:**
1. **Database** — create a free [Neon](https://neon.tech) project and run `server/db/schema.sql`
2. **Backend** — deploy `server/` to [Render](https://render.com), set `DATABASE_URL` and `JWT_SECRET`
3. **Frontend** — update the Render URL in `client/vercel.json`, deploy `client/` to [Vercel](https://vercel.com)

---

## Running tests

```bash
cd server
npm test
```

80 tests covering auth (register, login, forgot/reset password), profile CRUD, location, visibility, and nearby search — all with a mocked database.

---

## Photo uploads

Photos are stored on the Render server disk (`/uploads`). The `render.yaml` configures a 1GB persistent disk so photos survive redeployments. For production-scale storage, replace with Cloudinary or S3.
