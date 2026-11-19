# Your To-Do List

Things only you can do — accounts, settings, hardware, decisions. Claude keeps
this file up to date at the end of every session. How the app works today is in
`RESTART_PROMPT.md`; what it stores and why is in `PRIVACY_REVIEW.md`.

---

## ✅ Do soon

1. **Smoke-test the live app** at [nametag.n4bil.com](https://nametag.n4bil.com):
   - Create an account → "Check your email" → click the link → onboarding.
   - Make a tag with a photo, see the wall.
   - Go **Invisible**, reload: you should stay invisible.
   - Close the tab, reopen: your tag should come back.
   - Forgot password → reset by email → older sessions are signed out.
   - Delete the account, then register again with the same email: nothing
     carries over.
   If anything looks wrong, tell Claude what you see.
2. **Render: confirm the shutdown clean-up.** Render's free plan puts the server
   to sleep after ~15 quiet minutes — before the 30-minute delete would fire —
   so the server clears out leftover tags as it shuts down.
   - In the Render dashboard, set the service's **Start Command** to
     `node index.js` (it is probably `npm start`); otherwise the stop signal may
     not reach the server.
   - After a quiet spell, open **Logs** and look for `[shutdown] SIGTERM
     received` followed by `[shutdown] sweep finished`. If they never appear,
     tell Claude: the fallback is a free uptime monitor (UptimeRobot or
     cron-job.org pinging `https://nametag.onrender.com/api/health` every 5
     minutes) or a paid always-on instance.
3. **Read the privacy wording** — the Privacy tab and "Read the whole policy" in
   the app (same text as `PRIVACY_POLICY.md`). It's a public promise.
4. **Confirm the numbers** — 30 minutes (left the room), 4 hours (party code),
   2 days (sign-up never confirmed). They're constants at the top of
   `server/cleanup.js`; changing one changes the policy text too.

## ⚙️ Provider settings

5. **Turn retention down at each provider.** "Deleted" means deleted from the
   live database and disk; providers keep their own copies for a while. Set each
   to the shortest option offered:
   - **Neon** — history / point-in-time-restore window.
   - **Resend** — sent-email logs (they hold the address and the link).
   - **Render** and **Vercel** — request logs (they hold IP addresses).
6. **Check whether Render gave you a photo disk.** `server/render.yaml` asks for
   one on the free plan, which Render may not grant — look for a Disk on the
   service's page. Either answer is fine for privacy; without one, photos vanish
   on restart and the app re-uploads them.
7. **Set up `privacy@n4bil.com`** forwarding (Namecheap Email Forwarding) so the
   policy's contact address receives mail.

## 📜 Before real users

8. **A legal read** of `PRIVACY_POLICY.md`. The owner name, contact address,
   minimum age (16) and date are in `POLICY_META` at the top of
   `client/src/pages/PolicyDocument.jsx`.
9. *(Optional)* **A public policy URL** — an App Store listing needs one; the
   in-app screen covers the app itself.

## 🤔 Open design questions

From the redesign (`REDESIGN_QUESTIONS.md`), still running on best guesses:
- **Venue / place name** — the wall says "nearby"; there's no venue lookup.
- **Party hosting** — anyone can type any code; there's no "host" who creates one.
- **Radius** — fixed at 100 m with no control in the UI.

## ✔️ Decided (for reference)

- Visibility: Invisible is persistent until you choose Nearby or Party code.
- Party codes last 4 hours, then you go invisible.
- Closing the app deletes your tag from the server; it comes back when you return.
- No remembering or hiding people — the app keeps nothing about others.
- Pronoun "skip" in onboarding saves they/them.
- Sign in with Apple dropped for the web prototype; add it back when native.
- You pick your own tag colour (coral by default); the orchid ring marks you.

**Deploy note (CORS):** the API allowlists origins (`nametag.n4bil.com`,
`n4bil.com`, `www.n4bil.com`, `*.vercel.app` previews, native, localhost). If
the live app ever can't reach the API after a deploy, set `CORS_ORIGINS`
(comma-separated) on Render to the exact frontend origin.

---

## 🍎 Turn this into an iPhone app

### Step 1 — Apple Developer account ($99/year, takes 1–2 days)

1. Go to [developer.apple.com/programs](https://developer.apple.com/programs) and click **Enroll**
2. Sign in with your Apple ID (or create one)
3. Choose **Individual** (for solo dev) or **Organization** (for a company — requires a D-U-N-S number)
4. Pay the $99/year fee
5. Wait for approval email — usually same day, occasionally 24–48 hours
6. Once approved, you can sign apps and submit to the App Store

### Step 2 — Mac with Xcode

- You need a Mac (any Mac from ~2018 or newer is fine)
- Install **Xcode** from the Mac App Store — it's free but ~15 GB, takes a while
- After installing, open Xcode once so it installs additional components
- Also run: `sudo xcode-select --install` in Terminal

### Step 3 — Register your app's Bundle ID

1. Go to [developer.apple.com/account](https://developer.apple.com/account) → **Certificates, Identifiers & Profiles** → **Identifiers**
2. Click **+** → **App IDs** → **App**
3. Choose a Bundle ID — reverse-domain style, e.g. `com.yourname.nametag` — you can't change this later
4. Enable the capabilities you need:
   - **Location** (already in the Capacitor config)
   - **Push Notifications** (if you want them later)
   - **Associated Domains** (if you want Universal Links for password reset)
5. Register it

### Step 4 — First build on a real device

Once you have Xcode and the developer account:

```bash
cd /home/user/nametag/client
npx cap sync          # copies the web build into the iOS project
npx cap open ios      # opens Xcode
```

In Xcode:
- Select your project in the left panel → **Signing & Capabilities**
- Set **Team** to your developer account
- Check **Automatically manage signing** — Xcode will create the cert and profile for you
- Plug in your iPhone via USB, select it as the run destination
- Hit **▶ Run**

### Step 5 — Privacy permission strings (required before App Store)

Apple requires plain-English descriptions for any sensitive permission. These go in `client/ios/App/App/Info.plist`. Claude can add these — just ask. You'll need descriptions for:

- **Location** (`NSLocationWhenInUseUsageDescription`) — e.g. "Nametag uses your location to show you people nearby."
- **Camera** (`NSCameraUsageDescription`) — e.g. "Nametag uses your camera to take a profile photo."
- **Photo Library** (`NSPhotoLibraryUsageDescription`) — e.g. "Nametag lets you choose a profile photo from your library."

### Step 6 — TestFlight (beta testing before App Store)

1. In Xcode, set the scheme to **Release** and build for **Any iOS Device**
2. **Product → Archive** — creates a signed build
3. In the Organizer window, click **Distribute App** → **TestFlight & App Store**
4. Upload to App Store Connect
5. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com), add testers by email
6. Testers get an invite and install via the TestFlight app

### Step 7 — App Store submission

Once you're happy with TestFlight:
1. In App Store Connect, create a new app listing — icon, screenshots, description, category
2. App icon: must be 1024×1024 PNG, no alpha channel — Claude can help spec this out
3. Screenshots: required for each device size you support (iPhone 6.5" and 5.5" cover most)
4. Submit for review — Apple usually reviews within 24 hours

---

## 📧 Email — ✅ done (reference)

Verification and reset emails send in production via **Resend**. Render's free tier blocks
outbound SMTP, so the server calls Resend's **HTTPS API** directly
(`server/routes/auth.js`), reusing the Resend key. Verified sending domain:
`send.n4bil.com`. Verified end-to-end (a real reset email was received).

Relevant env vars on Render: `RESEND_API_KEY` (or the Resend key in `SMTP_PASS`),
`SMTP_FROM` = `Nametag <noreply@send.n4bil.com>` (the code also strips stray
quotes and defaults to this), and `APP_URL` = `https://nametag.n4bil.com` (used to
build the reset link).

---

## 📸 Photo storage

Photos live on Render's disk only while their owner is on the wall, so files
don't accumulate and a CDN/S3 setup isn't needed. If Render has no persistent
disk (item 6), a restart loses them and the app re-uploads from the device.

---

## 🔑 Decisions to make

- **Bundle ID** — pick it before Step 3 above; can't be changed later
- **App name in the App Store** — "Nametag" may already be taken; check App Store Connect when you create the listing
- **Background location** — do you want location to update when the app is backgrounded? Useful for always-visible mode but requires extra privacy justification for Apple review
