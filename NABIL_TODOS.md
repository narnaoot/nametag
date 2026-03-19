# Your To-Do List

Things that require you (not Claude) to act — accounts, hardware, credentials, decisions.
Updated at the end of every session.

> **Codebase status (March 2026):** Web app is feature-complete and cleaned up — consistent theme system, no magic values, proper error handling. Ready for native iOS work whenever you have a Mac + Apple Developer account.

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

## 📧 Set up real email (password reset)

Right now, reset links are logged to the Render console instead of emailed. To fix:

1. Sign up for a free transactional email service — [Resend](https://resend.com) is the easiest (free tier: 100 emails/day), [SendGrid](https://sendgrid.com) and [Mailgun](https://mailgun.com) also work
2. Verify your sending domain (or use their sandbox domain for testing)
3. Get your SMTP credentials and add these env vars in the Render dashboard:
   - `SMTP_HOST`
   - `SMTP_PORT` (usually `587`)
   - `SMTP_USER`
   - `SMTP_PASS`
   - `SMTP_FROM` — e.g. `Nametag <hello@yourdomain.com>`
   - `APP_URL` — `https://nametag.vercel.app`

---

## 📸 Photo storage (before scaling up)

Photos currently live on Render's disk. This is fine for now but free Render instances can lose files if the service is redeployed to a different instance.

When you're ready to harden this:
1. Sign up for [Cloudinary](https://cloudinary.com) (free tier is generous) or an S3-compatible service
2. Tell Claude — the upload logic in `server/routes/profile.js` is straightforward to swap out

---

## 🔑 Decisions to make

- **Bundle ID** — pick it before Step 3 above; can't be changed later
- **App name in the App Store** — "Nametag" may already be taken; check App Store Connect when you create the listing
- **Background location** — do you want location to update when the app is backgrounded? Useful for always-visible mode but requires extra privacy justification for Apple review
