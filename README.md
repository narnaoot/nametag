# Nametag

A location-based social discovery app — a digital "Hello, My Name Is" badge. See who's nearby in real time, share your name and pronouns, and control your own visibility.

**Live app**: [nametag.vercel.app](https://nametag.vercel.app) · **API**: [nametag.onrender.com](https://nametag.onrender.com)

---

## Features

- **Register / sign in** with email and password
- **Build your profile** — display name, pronouns, photo, nametag color, and up to 3 emoji stickers
- **Share your location** via the browser Geolocation API
- **See the grid** — nearby people displayed as physical "Hello My Name Is" badge cards, sorted by distance
- **Control visibility** — always visible, or only show yourself when you choose
- **Auto-refresh** — location and nearby grid update every 60 seconds

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS |
| Backend | Node.js, Express 5 |
| Database | PostgreSQL (Neon) |
| Auth | JWT (30-day tokens, bcrypt passwords) |
| File uploads | Multer (photos stored on server disk) |
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
│       ├── AuthContext.jsx   # JWT token state
│       ├── api.js            # Fetch wrapper (auto-injects Bearer token)
│       └── pages/
│           ├── AuthPage.jsx     # Login / register
│           ├── ProfilePage.jsx  # Edit profile
│           └── GridPage.jsx     # Nearby people grid
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
    │   ├── auth.js           # /api/auth/register, /login
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
  display_name TEXT NOT NULL
  pronouns TEXT NOT NULL
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

41 tests covering auth, profile CRUD, location, visibility, and nearby search — all with a mocked database.

---

## Photo uploads

Photos are stored on the Render server disk (`/uploads`). The `render.yaml` configures a 1GB persistent disk so photos survive redeployments. For production-scale storage, replace with Cloudinary or S3.
