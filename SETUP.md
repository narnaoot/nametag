# Nametag — Setup Guide

## Prerequisites
- Node.js 18+
- PostgreSQL with the PostGIS extension

## 1. Database setup

```bash
createdb nametag
psql nametag -c "CREATE EXTENSION postgis;"
psql nametag -f server/db/schema.sql
```

## 2. Server setup

```bash
cd server
cp .env.example .env
# Edit .env — set DATABASE_URL and a strong JWT_SECRET
npm run dev
```

## 3. Client setup (in a separate terminal)

```bash
cd client
npm run dev
```

Open http://localhost:5173

## Environment variables (server/.env)

| Variable       | Description                              |
|----------------|------------------------------------------|
| DATABASE_URL   | Postgres connection string               |
| JWT_SECRET     | Long random string for signing JWTs      |
| PORT           | Server port (default: 3001)              |

## How it works

1. **Register / sign in** with email + password
2. **Set up your profile** — name, pronouns, photo, and visibility radius
3. **Allow location access** when prompted
4. **See the grid** of nearby people with their names and pronouns
5. **Visibility** — by default you're always visible to nearby users. Toggle this off in your profile to control when you appear.

## Project structure

```
nametag/
├── client/          # React + Vite frontend
│   └── src/
│       ├── pages/
│       │   ├── AuthPage.jsx    # Login / register
│       │   ├── ProfilePage.jsx # Edit your profile
│       │   └── GridPage.jsx    # Nearby people grid
│       ├── AuthContext.jsx     # Auth state
│       ├── api.js              # API calls
│       └── App.jsx             # App shell + nav
└── server/          # Node.js + Express backend
    ├── routes/
    │   ├── auth.js     # POST /api/auth/register, /login
    │   └── profile.js  # GET/PUT /api/profiles/me, /nearby
    ├── middleware/
    │   └── auth.js     # JWT verification
    ├── db/
    │   ├── index.js    # Postgres pool
    │   └── schema.sql  # Table definitions
    └── uploads/        # Uploaded photos (gitignored)
```
