# Morning Restart Prompt

Paste this to Claude Code to resume where we left off:

---

We're working on **Nametag** — a location-based social discovery app. The repo is at `/home/user/nametag-repo` on GitHub at `narnaoot/nametag`.

**Stack:**
- Frontend: React 19 + Vite + Tailwind CSS → deployed on Vercel
- Backend: Node.js + Express 5 → deployed on Render at `https://nametag.onrender.com`
- Database: PostgreSQL on Neon

**Where we left off:**
Yesterday we reset the production database via a temporary `/api/admin/reset` endpoint (now removed and cleaned up). After that Claude worked overnight on:
1. Writing the README (done — pushed to main)
2. Refactoring the code (check git log to see what was done)
3. Testing — running the test suite, finding and fixing bugs, pushing fixes

**To get oriented, please:**
1. Run `git log --oneline -20` to see what was committed overnight
2. Run `cd server && npm test` to see the current test status
3. Check `git status` to see if anything is unstaged
4. Then give me a summary of what was done and what still needs attention

**Key files:**
- `server/index.js` — entry point
- `server/app.js` — Express app setup
- `server/routes/auth.js` — auth endpoints
- `server/routes/profile.js` — profile, location, visibility, nearby endpoints
- `server/db/schema.sql` — database schema
- `server/middleware/auth.js` — JWT middleware
- `client/src/pages/GridPage.jsx` — nearby grid UI
- `client/src/pages/ProfilePage.jsx` — profile editor UI
- `client/src/designs/DesignE.jsx` — main production design components
- `client/vercel.json` — Vercel rewrite rules (points to Render URL)

**Deployment:**
- Push to `main` branch → Render auto-deploys backend, Vercel auto-deploys frontend
- No separate branches needed unless doing risky changes

**Important context:**
- The app uses Haversine SQL math for distance (no PostGIS)
- Photos are stored on Render's persistent disk (1GB, configured in `render.yaml`)
- JWTs expire in 30 days, stored in localStorage as `nametag_token`
- All profile endpoints require `Authorization: Bearer <token>`
- The nearby query filters: active within 30 min, within user's radius, excludes self
