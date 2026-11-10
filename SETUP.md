# Nametag — Setup Guide

## Prerequisites
- Node.js 18+
- PostgreSQL (any standard install — PostGIS not required)

## 1. Database setup

```bash
createdb nametag
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
| APP_URL        | Base URL for reset/verification links (default `https://nametag.n4bil.com`) |
| RESEND_API_KEY | *(optional in dev)* Resend API key for real emails; without it, links are logged to the console |
| SMTP_FROM      | *(optional in dev)* From address, e.g. `Nametag <noreply@send.n4bil.com>` |

> The server applies its migrations automatically on startup (`db/migrate.js`), so
> the extra columns/tables (email verification, token revocation) are set up for
> you after the initial `schema.sql` load.

## How it works

1. **Register / sign in** with email + password
2. **Set up your profile** — name, pronouns, photo, and visibility radius
3. **Allow location access** when prompted
4. **See the grid** of nearby people with their names and pronouns
5. **Visibility** — by default you're always visible to nearby users. Toggle this off in your profile to control when you appear.

## Project structure

```
nametag/
├── client/               # React + Vite frontend
│   └── src/
│       ├── App.jsx       # App shell + tab navigation
│       ├── pages/        # Auth, Onboarding, Grid (the wall), Profile (My tag), Privacy, Policy
│       ├── components/   # Tag, Wall, VisibilityControl, Sheet, pickers…
│       ├── hooks/        # useNearbyPeople, useViewport
│       ├── auth/         # AuthContext + useAuth
│       └── lib/          # api, profile, profileSync, profileStorage, colors, constants, imageCrop
└── server/               # Node.js + Express backend
    ├── app.js            # Express app (security headers, CORS, rate limit, routes)
    ├── routes/           # auth.js (/api/auth/*), profile.js (/api/profiles/*)
    ├── middleware/       # JWT verification + revocation
    ├── db/               # Postgres pool, schema.sql, startup migrations
    ├── cleanup.js        # hourly stale-data cleanup
    └── uploads/          # Uploaded photos (gitignored)
```
