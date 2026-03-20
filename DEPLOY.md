# Deployment Guide — Nametag

**Stack**: Neon (database) + Render (backend API) + Vercel (frontend)
**Total cost**: Free on all three services.
**Time to deploy**: ~15 minutes.

> Note: PostGIS has been removed. The app now uses standard Haversine SQL math,
> so any vanilla PostgreSQL works (Neon, Supabase, Railway, etc.)

---

## Step 1 — Database (Neon)

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project called `nametag`
3. Copy the **Connection string** (looks like `postgres://user:pass@ep-xxx.us-east-2.aws.neon.tech/nametag`)
4. Run the schema:
   ```bash
   psql "YOUR_CONNECTION_STRING" -f server/db/schema.sql
   ```
   Or paste the contents of `server/db/schema.sql` into the Neon SQL Editor.

---

## Step 2 — Backend (Render)

1. Go to [render.com](https://render.com) and sign in with GitHub
2. Click **New → Web Service**
3. Connect the `narnaoot/nametag` GitHub repo
4. Settings:
   - **Root directory**: `server`
   - **Build command**: `npm install`
   - **Start command**: `npm start`
   - **Plan**: Free
5. Add environment variables:
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | Your Neon connection string (Step 1) |
   | `JWT_SECRET` | Any long random string (e.g. generate with `openssl rand -hex 32`) |
   | `NODE_ENV` | `production` |
6. Click **Create Web Service**
7. Wait for deploy (~2 min). Copy your Render URL (e.g. `https://nametag-api.onrender.com`)

---

## Step 3 — Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New → Project**
3. Import `narnaoot/nametag`
4. Settings:
   - **Root directory**: `client`
   - **Framework**: Vite (auto-detected)
5. Before deploying, **update `client/vercel.json`**:
   Replace `https://nametag.onrender.com` with your actual Render URL from Step 2.
   Commit and push that change.
6. Add an **Environment Variable** in the Vercel project settings:
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | Your Render URL + `/api` (e.g. `https://nametag.onrender.com/api`) |

   > Without this, the frontend won't know where to send API requests.
7. Click **Deploy**

Your app will be live at `https://nametag-xxx.vercel.app` 🎉

---

## Photo uploads note

Render's free tier has ephemeral storage — uploaded photos will be lost on redeploy.
For persistent photos, the next step would be to add Cloudinary or S3 (free tiers available).
For testing purposes, the free Render disk (1GB) is configured in `render.yaml` and will persist between deploys.

---

## Local development

```bash
# Terminal 1 — server
cd server
cp .env.example .env   # fill in DATABASE_URL + JWT_SECRET
npm run dev

# Terminal 2 — client
cd client
npm run dev
# Open http://localhost:5173
```
