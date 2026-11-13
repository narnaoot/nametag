# Nametag — Privacy Review

**Status:** current as of Nov 12, 2026 · **Scope:** the whole data path — client
(`client/src`), API (`server`), storage (Neon Postgres, Render disk), hosting
(Vercel, Render), email (Resend). An engineering audit, not a legal opinion.

**How it was checked.** Read end-to-end, then exercised: the real stack was run
locally (Postgres + API + a production client build) with two simulated users in
a browser, and the database was inspected after each action. What the hosting
providers keep on their side (backups, logs) could **not** be verified from the
code and is marked as such.

---

## 0. The goal, and the honest answer

**Goal:** nothing is saved in the cloud — everything is saved on the device.

**Reality:** the device is the home of your tag, but the app is **not**
cloud-free, and can't be with this design. For two phones to find each other
over the internet, a server has to know that both are in the same place. What
the code now guarantees is the next best thing: **the server holds a tag only
while its owner is on the wall, and deletes it within minutes of them leaving.**

What stays on the server permanently is deliberately tiny: an email, a password
hash, and a visibility setting.

The only way to reach a literal "nothing in the cloud" is a different design:
phones exchanging tags directly over Bluetooth, with no server and no accounts.
That is a native-app rewrite and would end the web version. It's the right
question to revisit when the iPhone app is built.

---

## 1. Data inventory

### On the server

| Data | Where | Kept until |
|---|---|---|
| Email | Neon `users.email` | Account deletion. Never-verified sign-ups: deleted after 2 days |
| Password | Neon `users.password_hash` (bcrypt) | Account deletion |
| Account flags | `users.email_verified`, `token_version`, `created_at` | Account deletion |
| Settings row | `profiles`: `always_visible` (did you choose invisible), `radius_meters`, `updated_at` | Account deletion — **this row persists even while invisible**, but holds nothing identifying |
| Name, pronouns, one line, stickers, colour | `profiles.*` | **Only while on the wall** (see §2) |
| Photo | Render disk, `/uploads/<32 random hex>.<ext>` | Same |
| Location | `profiles.lat/lng`, rounded to 4 decimals (~11 m); one point, overwritten each refresh, no history. Not stored at all while invisible | Same |
| `location_updated_at` | `profiles` | Same |
| Party code + when it was entered | `profiles.party_code`, `party_code_set_at` | Same, and never more than 4 hours |
| Email-link records | `password_reset_tokens`, `email_verification_tokens` (SHA-256 hash only, + expiry) | Deleted once used or expired |
| Request metadata (IP, user agent, paths) | Render + Vercel platform logs | Provider defaults — **not verified** |

### On the device only

| Data | Where |
|---|---|
| Your own tag (all fields, visibility, party code + start time) | Capacitor Preferences `profile_data` |
| Your own photo (cropped 320 px JPEG) | Capacitor Filesystem `profile_photo` |
| Sign-in token (JWT, 30 days, revocable) | Preferences `nametag_token` |
| Which account the above belongs to | Preferences `profile_owner` |

**Nothing about other people is kept on the device.** The "remember the name"
and "hide from me" features were removed in Nov 2026; the app deletes the lists
they left behind (`remembered_names`, `hidden_people`) on its next launch.

On the web, "the device" is the browser's own storage (localStorage /
IndexedDB), unencrypted. It is cleared on account deletion and when a different
account signs in on the same device.

**No analytics, ads, or tracking SDKs.** Fonts are self-hosted. The only outside
service the code calls is Resend, to send email.

---

## 2. When the server's copy of a tag is deleted

All six paths run the same wipe (`CLEAR_PROFILE_SET` in `server/cleanup.js`):
name, pronouns, one line, colour, stickers, photo (file and path), location,
timestamp, party code.

| Trigger | When | Afterwards |
|---|---|---|
| **Go invisible** (`POST /me/visibility`) | Immediately | Stays invisible across reloads and sessions until the user chooses otherwise |
| **Close the app** (`POST /me/leave`, sent on `pagehide`) | Immediately — best-effort, web only | Visibility choice kept; the device restores the tag on return |
| **App not seen for 30 minutes** (sweep, every 5 min) | ≤ ~35 min after the last refresh | Same. Also the point at which others stop seeing the tag |
| **Server shutting down** (last sweep on SIGTERM) | Tags idle 5+ minutes, at shutdown | Same |
| **Party code is 4 hours old** (sweep, `/nearby`, and the app itself) | ≤ 4 h after entry | Moved to **invisible**, not to "visible to everyone" |
| **Delete account** (`DELETE /me`) | Immediately | User row, profile row (cascade), photo file, link records; device copy cleared |

While invisible, nothing puts the tag back: edits on My tag are saved on the
device only, and a location sent while invisible is not stored.

**How a tag comes back.** The device keeps the lasting copy. When the app is
opened (or returns to the foreground) it sends its location; the reply says
whether the server still holds the tag, and if not, the app re-uploads it from
the device. So leaving and returning is seamless — but a tag wiped from the
server with **no** device copy (a new browser, cleared storage) is gone, and the
person makes it again.

---

## 3. What other people can learn

- `/nearby` returns, for each person in range: profile id, name, pronouns, one
  line, stickers, colour, photo path. **No coordinates and no distance** — only
  an order, nearest first.
- Party mode is exclusive both ways: members see only members, non-members see
  no members.
- Someone invisible, or whose tag has been wiped, is never returned.

---

## 4. Residual risks

Ranked by how much they undercut the goal.

**R1 — The 30-minute delete depends on the server being awake.** The sweep is a
timer inside the API process, and Render's free plan stops the process after ~15
minutes with no traffic — before the 30-minute rule fires.
**Mitigated in code:** when the process is told to stop (SIGTERM) it runs a last
sweep that wipes every tag not refreshed in the previous 5 minutes
(`server/index.js`, `SHUTDOWN_STALE_MINUTES`), so nothing should sit in the
database while the server sleeps. It also sweeps on every start-up. Tested
locally with a real stop signal against Postgres.
What's left:
- **Unconfirmed on Render.** Render staff say the platform sends SIGTERM before
  stopping a service, but that is a forum reply, not documentation, and idle
  spin-down specifically isn't documented. Confirm by finding
  `[shutdown] SIGTERM received` / `[shutdown] sweep finished` in the Render logs
  after a quiet spell. The start command must be `node index.js` (not
  `npm start`) for the signal to reach the server.
- If the signal never arrives or the process is killed early, a stale tag stays
  stored until the next wake-up. Nobody can *see* it — `/nearby` filters on the
  same 30 minutes. The policy says this.
- A scheduled GitHub Action was tried as a keep-awake ping and removed: GitHub
  ran it 3 times in 24 hours instead of every 5 minutes.
→ *Stronger fix:* an always-on (paid) Render instance, or an external uptime
monitor pinging `/api/health` every 5 minutes.

**R2 — Provider backups and logs.** "Deleted" means deleted from the live
database and disk. Neon keeps point-in-time history, Resend keeps a log of sent
emails (recipient address and content, including the link), and Render/Vercel
keep request logs with IP addresses. Retention is set in each provider's
dashboard and was **not verified**.
→ *Fix:* set each to the shortest retention offered. Owner task.

**R3 — "Close the app" is immediate only on the web.** It relies on the
browser's `pagehide` event. A native (Capacitor) app that is backgrounded or
killed won't fire it, and falls back to the 30-minute rule.
→ *Fix (native build):* call `/me/leave` from the app-state listener.

**R4 — Presence can still be probed.** The API trusts whatever coordinates a
client sends, so someone can claim to be anywhere and ask who is visible there.
Distances are no longer returned, which removes the easy pinpointing, but by
moving a made-up position and watching a person drop in and out of range, a
determined attacker could still narrow down where they are. This is inherent to
any server that answers "who is near X".
→ *Mitigations:* limit how often and how far a client's position may jump; raise
the minimum search radius (currently 10 m) so the range edge is blunt.

**R5 — Photo addresses are unlisted, not locked.** A photo is served from a
128-bit random URL with no sign-in check. It can't be guessed or enumerated, but
anyone handed the URL can open it until the file is deleted. The policy says so.
→ *Fix:* an authenticated photo route or short-lived signed URLs.

**R6 — The device copy is plain browser storage on the web.** Anyone with access
to the unlocked browser profile can read the tag and the sign-in token. Expected for a web app; the native build should use the
platform's protected storage for the token.

**R7 — Photo storage on Render is unconfirmed.** `server/render.yaml` asks for a
persistent disk on the free plan, which Render may not provide. If there's no
disk, photos vanish on each restart (harmless for privacy, and the app
re-uploads them) — worth confirming which is true.

**R8 — No data-export path.** Deletion exists; a formal "send me my data"
request is handled by hand. Small, since the server holds so little.

**R9 — Sign-in throttling is per account, not per network.** A whole room shares
one Wi-Fi IP, so the per-IP limit is only a loose backstop (600 requests per 15
minutes). Password guessing is limited per IP + email (10 failed tries per 15
minutes) and emails per address (5 per 15 minutes). Someone spreading guesses
across many networks is slowed only by the password hashing.

---

## 5. Subprocessors

| Provider | Role | What it handles | To check in its dashboard |
|---|---|---|---|
| **Neon** | Postgres | Account; tag + location while visible | History / backup retention |
| **Render** | API host, photo disk | All API traffic; photo files while visible; request logs | Log retention; whether the disk exists (R7) |
| **Vercel** | Frontend host; proxies `/api` and `/uploads` | All requests to the web app, incl. IPs | Log retention |
| **Resend** | Email | Recipient address + message for confirmation, reset and "you already have an account" emails | Log retention |
| Namecheap | DNS | DNS queries only | — |

---

## 6. History — what earlier reviews fixed

- **Aug 2026:** unguessable photo filenames (H1); reset links no longer logged,
  email sending via Resend (H2); auth rate limiting (M1); non-enumerating
  sign-up with email verification (M2); revocable JWTs (M3); self-hosted fonts
  (M4); hashed reset/verification tokens (L1); CORS allowlist (L2); `helmet`
  headers (L4); photos cropped on-device before upload.
- **Nov 2026, bug sweep:** invisible actually persists and nothing is re-uploaded
  while invisible; party codes isolate both ways; on-device data tied to one
  account; upload types allowlisted (an HTML/SVG "photo" could be served from our
  origin); search radius bounded; nameless rows hidden from `/nearby`.
- **Nov 2026, this pass:**
  - `POST /me/leave` on closing the app.
  - Stale wipe cut from 24 hours to 30 minutes; sweep every 5 minutes (was hourly).
  - Stored location rounded to 4 decimals (the old L3); no location stored while
    invisible.
  - `/nearby` no longer returns distances.
  - Party codes expire after 4 hours and are wiped with the tag.
  - Spent/expired link records and never-verified sign-ups are deleted.
  - A photo that can't be cropped on the device is rejected instead of being
    uploaded at full size with its metadata.
  - "Remember the name" and "Hide from me" removed: the device now stores
    nothing about other people, and old lists are deleted on launch.
  - A completed password reset counts as verifying the email; sign-in limits
    reworked for shared networks (R9).
  - A last sweep on shutdown, so tags don't sit in the database while the
    server sleeps (R1).

---

## 7. Compliance notes (not legal advice)

- **Precise location** is sensitive under GDPR/CCPA and app-store rules. Consent
  comes from the OS location prompt; the policy states what is collected, why,
  and for how long.
- **Right to delete:** `DELETE /me`. **Right to access:** the app shows you your
  own data; no export endpoint (R8).
- **Minimum age:** 16, stated in the policy.
- **App Store:** the iOS build needs the `Info.plist` usage strings and a privacy
  label that matches the policy.

---

*Companion: `PRIVACY_POLICY.md` (user-facing) and its in-app twin
`client/src/pages/PolicyDocument.jsx`. Every claim there should be backed by
behaviour described here; the retention numbers are the constants at the top of
`server/cleanup.js`.*
