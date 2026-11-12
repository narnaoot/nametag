# Your To-Do List

Things that require you (not Claude) to act — accounts, hardware, credentials, decisions.
Updated at the end of every session.

> **Codebase status (March 2026):** Web app is feature-complete and cleaned up — consistent theme system, no magic values, proper error handling. Ready for native iOS work whenever you have a Mac + Apple Developer account.

---

## 🔒 Privacy pass (Nov 2026) — things only you can do

Your goal is "nothing saved in the cloud". The code now holds a tag on the
server only while you're on the wall (details: `PRIVACY_REVIEW.md`). What's left
is outside the code:

1. **Turn down retention at each provider.** "Deleted" only means deleted from
   the live database and disk. Set each of these to the shortest option offered:
   - **Neon** — history / point-in-time-restore window.
   - **Resend** — how long sent-email logs are kept (they hold the recipient
     address and the link).
   - **Render** and **Vercel** — request-log retention (they hold IP addresses).
2. **Decide whether to keep the server awake.** The "deleted after 30 minutes"
   sweep runs inside the API. Render's free plan puts it to sleep after ~15 quiet
   minutes, and the sweep then finishes on the next wake-up. Nobody can see the
   tag meanwhile, but it's still stored. To make 30 minutes a hard promise: a paid
   always-on instance, or a scheduled ping every ~10 minutes. The policy states
   the caveat until you choose. Tell Claude which you want.
3. **Check whether Render really has a photo disk.** `server/render.yaml` asks
   for one on the free plan, which Render may not grant. Look for a Disk on the
   service's page. Either answer is fine for privacy; it's about knowing.
4. **Confirm the numbers** — 30 minutes (left the room), 4 hours (party code),
   2 days (sign-up never confirmed). They're three constants at the top of
   `server/cleanup.js`; if you change one, the policy text changes with it.
5. **Read the new privacy wording** — the Privacy tab and "Read the whole
   policy" in the app (same text as `PRIVACY_POLICY.md`). It's a public promise.
6. Still open from before: **`privacy@n4bil.com` forwarding** and a **legal read**.

**What happens when this deploys:** every tag that hasn't checked in for 30
minutes is wiped from the server on the first sweep (people's devices put theirs
back when they next open the app); sign-ups older than 2 days that never
confirmed their email are deleted; existing party codes start their 4-hour clock.

---

## 🐞 Bug sweep (Nov 2026) — decisions needed from you

A hands-on test pass fixed the clear-cut bugs (summary at the top of
`RESTART_PROMPT.md`). These need your call before anything changes:

1. **Pronouns "skip" saves `they/them`.** Onboarding offers "skip", but the
   server requires pronouns, so skippers are labelled they/them. Allow a tag
   with no pronouns, or remove the skip chip?
2. **Sign-in rate limit vs. a room full of people.** `/api/auth/*` allows 50
   requests per 15 min per IP. Everyone on one venue Wi-Fi shares an IP, and a
   signup costs 2–4 requests — about 15 people signing up together get "Too
   many attempts". Raise it, or limit per email instead of per IP?
3. **"Remember the name" has nowhere to look.** Names are saved on the device
   but no screen lists them. **"Hide from me" is permanent** — no un-hide.
4. **Password reset on an unverified account** succeeds but sign-in still says
   "verify your email". Treat a completed reset as verification?
5. **Behaviour change to confirm:** Invisible is now persistent — you stay
   hidden across reloads/sessions until you pick Nearby or Party code again.

---

## 🎨 UI redesign — "nearby name tags" (Aug 2026, MERGED to `main` — PR #16)

The whole client was rebuilt to the Claude Design canvas (design source
formerly in `redesign/`, since removed — in git history)
(Libre Caslon + Nunito; orchid = the app; the wall of hand-tilted tags;
three-way visibility control; new Privacy tab; two-step onboarding; party
code sheet; responsive tablet/desktop; you pick your own tag colour, with the
orchid "you" ring marking your own tag). Backend untouched; 80 server tests still
pass. It's deployed and **live at https://nametag.n4bil.com** (custom domain via
Namecheap CNAME → Vercel; Render `APP_URL` set to match).
Details in `client/REDESIGN.md`.

**Follow-up pass done** (Aug 2026) — your three calls are handled:

- **Privacy copy rewritten to match what the code actually does.** (Rewritten
  again in Nov 2026 — see the privacy section at the top of this file and
  [`PRIVACY_REVIEW.md`](PRIVACY_REVIEW.md).)
- **Sign in with Apple: dropped** for the web prototype (needs a paid Apple
  Developer account + domain/secret setup). Sign-in is now a single "Continue
  with email". Add Apple back when you go native.
- **Tag colour: people pick their own again** (coral default; your tag gets the
  orchid "you" ring on the wall so you can still spot yourself).

Still open (best-guess shipped, see the questions file): venue/place name,
mutual-context row, party hosting, and radius UI. (The "Read the whole policy"
link is now wired to a full in-app policy screen — done.)

### Privacy — status

Superseded by the **Privacy pass (Nov 2026)** section at the top of this file.
The earlier review fixes (unguessable photo URLs, email via Resend, auth rate
limiting, non-enumerating sign-up, revocable sessions, self-hosted fonts) are all
shipped; `PRIVACY_REVIEW.md` §6 lists them. The policy's owner, contact address,
minimum age and date are set in `POLICY_META` at the top of
`client/src/pages/PolicyDocument.jsx`.

Still optional: a **public policy URL** for an App Store listing (the in-app
screen covers the app itself).

**Deploy note (CORS):** the API now allowlists origins. Defaults cover
`nametag.n4bil.com`, `n4bil.com`, `www.n4bil.com`, `*.vercel.app` previews, and
native/localhost. If the live app ever can't reach the API after a deploy, set
`CORS_ORIGINS` (comma-separated) on Render to your exact frontend origin.

**Remaining lower-priority items:** a data-export endpoint, and refresh-token
rotation to shorten the 30-day sign-in token. Neither is a blocker.

---

## ✅ Test the live app (do this soon)

The codebase has had significant refactoring and new features added. Before going further, do a quick end-to-end smoke test on the live deployment:

1. Go to [nametag.n4bil.com](https://nametag.n4bil.com) (or the underlying [nametag-pi.vercel.app](https://nametag-pi.vercel.app))
2. Register a new account → you should land on a **"Check your email"** screen (registration no longer logs you straight in)
3. Open the **verification email** (from Resend) and click the link → you should be signed in and dropped into onboarding
4. Fill in your profile — name, pronouns, photo, color, stickers
5. Check the nearby grid loads (it'll be empty if no one else is around, that's fine)
6. Test forgot password — enter your email, receive the **reset email**, use the link. After resetting, confirm any older session is signed out (token revocation).
7. Test "Delete account" — the button is in the My tag page
8. **Account re-use after deletion** — register + verify, fill a profile, delete the account, then register again with the same email. Confirm no old data carries over.

If anything looks broken, tell Claude what you see.

---

## 🔒 Privacy decisions — settled

- **How long is "stale"?** 30 minutes without the app checking in (was 24 hours).
- **Going invisible** deletes your tag, photo, location and party code from the
  server at once, and you stay invisible until you choose otherwise. Your device
  keeps the tag and re-uploads it when you go visible.
- **Closing the app** deletes the server's copy straight away on the web.
- **Party codes** last 4 hours.
- **Privacy policy** — written, shown in the app, mirrored in `PRIVACY_POLICY.md`.
- **Right to erasure** — My tag → Delete account.

What still needs you is at the top of this file.

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

## 📧 Real email (password reset) — ✅ DONE (Aug 2026)

Reset emails now send in production via **Resend**. Render's free tier blocks
outbound SMTP, so the server calls Resend's **HTTPS API** directly
(`server/routes/auth.js`), reusing the Resend key. Verified sending domain:
`send.n4bil.com`. Verified end-to-end (a real reset email was received).

Relevant env vars on Render: `RESEND_API_KEY` (or the Resend key in `SMTP_PASS`),
`SMTP_FROM` = `Nametag <noreply@send.n4bil.com>` (the code also strips stray
quotes and defaults to this), and `APP_URL` = `https://nametag.n4bil.com` (used to
build the reset link).

---

## 📸 Photo storage

Photos currently live on Render's disk (`/uploads`). The privacy principle says server-side photos are temporary — deleted when you go invisible, close the app, or haven't checked in for 30 minutes. So a fancy CDN/S3 setup is less critical than it first appeared, since files shouldn't accumulate.

The main risk right now: free Render instances can lose disk contents on redeploy. This is acceptable during development. Once real users are involved, revisit — but the solution may simply be "upload fresh each time you go visible" rather than persistent cloud storage.

---

## 🔑 Decisions to make

- **Bundle ID** — pick it before Step 3 above; can't be changed later
- **App name in the App Store** — "Nametag" may already be taken; check App Store Connect when you create the listing
- **Background location** — do you want location to update when the app is backgrounded? Useful for always-visible mode but requires extra privacy justification for Apple review
