# Nametag — Session Restart Prompt

Read this at the start of a session to get up to speed. It describes the app
**as it is now**; history is in the git log and pull-request descriptions.

**At the end of every session**, update this file and `NABIL_TODOS.md` (and,
when relevant, the privacy documents — see "Privacy rules" below) so they stay
true, then commit and push.

---

## What Nametag is

A digital "Hello, my name is" badge for the room you're in. You make a tag —
name, pronouns, one line, up to three stickers, a colour, a photo — and people
physically near you who have the app open see it on a wall of hand-tilted tags,
so you can go and say hello. No feed, no follows, no messages, no history.

- **Live app:** https://nametag.n4bil.com (Namecheap CNAME → Vercel; also
  https://nametag-pi.vercel.app)
- **API:** https://nametag.onrender.com
- **Repo:** https://github.com/narnaoot/nametag

---

## Privacy rules (non-negotiable)

The owner's goal is "nothing saved in the cloud". Matching people in the same
place needs a server, so the rule is: **the device is the home of your tag; the
server holds a copy only while you're on the wall, and deletes it within
minutes of you leaving.** The rules live in one file, `server/cleanup.js`.

- **Kept permanently on the server:** email, password hash, the one visibility
  setting (`always_visible`), and a search radius. Nothing else.
- **The tag** (name, pronouns, line, stickers, colour, photo, location, party
  code) is wiped:
  - at once on going **invisible** (and the choice is remembered);
  - at once on **closing the app** (`POST /me/leave`, sent on web `pagehide`);
  - after **30 minutes** without a location refresh (`STALE_MINUTES`; 5 when
    the server is shutting down, `SHUTDOWN_STALE_MINUTES`);
  - when a **party code is 4 hours old** (`PARTY_CODE_HOURS`) — the member goes
    invisible, not public;
  - on **account deletion**.
- **Location:** one point, rounded to 4 decimals (~11 m), never a history, not
  stored at all while invisible. `/nearby` never returns coordinates or
  distances.
- **While invisible nothing is uploaded** — edits stay on the device.
- **Nothing about other people is kept anywhere** — not on the server, not on
  the device. ("Remember the name" and "Hide from me" were removed on purpose;
  don't re-add them.)
- **Records:** spent/expired email links and never-verified sign-ups (after 2
  days) are deleted by the sweep.

**If you change any of this, update in the same change:** the Privacy tab
(`client/src/pages/PrivacyPage.jsx`), the in-app policy
(`client/src/pages/PolicyDocument.jsx`), `PRIVACY_POLICY.md` (mirrors the
in-app policy) and `PRIVACY_REVIEW.md` (the audit behind every claim) — and add
or update an integration or browser test (`TESTING.md`).

---

## How it works

**The tag's round trip.** The device keeps the lasting copy of your tag
(Capacitor Preferences + Filesystem; browser storage on the web) and which
account it belongs to. Every write to the server goes through
`client/src/lib/profileSync.js`: `saveProfile()` (My tag, onboarding — sends
only while visible) and `pushProfile()` (restores the tag, or switches
visibility from the wall). When the app returns, its location update gets
`has_tag: false` back if the server dropped the tag, and the app re-uploads it.

**The wall.** `client/src/hooks/useNearbyPeople.js` owns the visibility mode
(invisible / nearby / party) and `readRoom()`: share location → fetch
`/nearby` → handle errors. It runs on load, every 60 s, and when the app
returns to the foreground. `GridPage.jsx` renders one board for phone, tablet
and desktop from its `BOARD` table.

**My tag.** `client/src/hooks/useTagEditor.js` loads the tag (device first,
then the server, which is authoritative only on visibility), applies edits,
and auto-saves 700 ms after the last one. Saves go through
`queueProfileSave()` so they reach the server one at a time, in order.
`ProfilePage.jsx` is layout.

**Visibility.** One setting, `always_visible`: TRUE = on the wall (nearby or in
a party), FALSE = chose invisible. Whether someone is on the wall *right now*
is "has a tag and a location from the last 30 minutes". The three-way
`VisibilityControl` also owns the party-code sheet.

**Party codes.** Letters and digits only, upper-cased ("summer-42" =
"SUMMER42"). Members see only members, non-members see no members. The time a
code was entered travels with the tag (`party_code_set_at`), so restoring a tag
doesn't restart the 4-hour clock.

**Accounts.** Email + password. Sign-up sends a verification link and never
reveals whether an email exists; you're signed in only by clicking it. A
completed password reset also verifies the email and revokes every existing
session (`token_version` in the JWT). Rate limits suit a whole room on one
Wi-Fi: per-IP is a loose backstop (600 / 15 min); password guessing is limited
per IP + email (10 failed tries), emails per address (5).

**The sweep.** `runCleanup()` in `server/cleanup.js` runs on startup, every 5
minutes, and once more on SIGTERM (`server/index.js`) — because Render's free
plan stops the server after ~15 idle minutes, before the 30-minute rule fires.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + Tailwind 4 → Vercel (proxies `/api` and `/uploads` to Render) |
| Backend | Node.js + Express 5 → Render (free plan; start command `node index.js`, see `DEPLOY.md`) |
| Database | PostgreSQL on Neon; migrations run on startup (`server/db/migrate.js`) |
| Auth | JWT, 30 days, revocable via `token_version`; stored with `@capacitor/preferences` |
| Email | Resend HTTPS API (Render blocks SMTP); links are logged instead when no provider is set |
| Native | Capacitor 8 — the iOS project isn't in the repo yet (see `IPHONE_SETUP.txt`) |
| Photos | Cropped to 320 px on the device; Multer saves them under random names on Render |
| Tests | Jest + Supertest, real-Postgres integration tests, Playwright; CI on every PR |

---

## Repo map

```
client/src/
  App.jsx                 shell + tab navigation; sends /me/leave on pagehide
  auth/AuthContext.jsx    sign-in state; clears device data on account switch / delete
  lib/
    api.js                fetch wrapper, photoUrl(), leaveRoom()
    profile.js            field contract, visibilityMode(), party codes, queueProfileSave()
    profileSync.js        saveProfile() / pushProfile(): the only writes to the server
    profileStorage.js     on-device tag + photo, and which account owns them
    imageCrop.js          crop/downscale a picked photo (strips its metadata)
    colors.js, constants.js
  hooks/
    useNearbyPeople.js    the wall: visibility mode, readRoom(), 60 s refresh
    useTagEditor.js       My tag: load / edit / photo / queued auto-save
    useViewport.js        phone / tablet / desktop
  pages/                  AuthPage, OnboardingPage, GridPage (wall), ProfilePage (My tag),
                          PrivacyPage, PolicyDocument
  components/             Tag, Wall, TagDetail, Sheet, VisibilityControl, PartyCodeSheet, pickers…

server/
  index.js                start: migrate, listen, sweep; last sweep on SIGTERM
  app.js                  helmet, CORS allowlist, rate limits, routes
  routes/auth.js          /api/auth/*: register, verify-email, resend-verification,
                          login, forgot-password, reset-password
  routes/profile.js       /api/profiles/*: GET/PUT/DELETE /me, /me/location,
                          /me/leave, /me/visibility, /nearby
  cleanup.js              the retention rules and the sweep
  db/                     schema.sql, migrate.js, pool
  middleware/             JWT check + token_version revocation
  __tests__/              unit tests (mocked DB); integration/ (real Postgres)

e2e/                      Playwright: two people using the real app (TESTING.md)
.github/workflows/        tests.yml — unit, integration, lint/build, browser
```

---

## Working on it

```bash
cd server && npm test
```

```bash
cd client && npm run lint && npm run build
```

The real-database and browser suites need a throwaway Postgres; see
`TESTING.md`. Local setup is in `SETUP.md`, deployment in `DEPLOY.md`.

Conventions:
- Branch, open a PR, let CI go green, merge. Pushing to `main` deploys (Render
  for the API, Vercel for the client).
- A privacy-relevant change updates the four privacy surfaces listed above.
- Decisions already made — keep them unless the owner says otherwise:
  Invisible is persistent until you choose otherwise; pronoun "skip" in
  onboarding saves `they/them`; no remembering or hiding people; party codes
  last 4 hours.

---

## Open items (code)

Owner tasks (accounts, settings, decisions) are in `NABIL_TODOS.md`.

- **Confirm the shutdown sweep on Render** — whether Render sends SIGTERM on
  idle spin-down is undocumented; the owner checks the logs. If not, fall back
  to an uptime monitor or an always-on instance (`PRIVACY_REVIEW.md` R1).
- **Native app:** add the iOS project (`npx cap add ios`), send `/me/leave`
  from the app-state listener (web-only today, R3), keep the token in protected
  storage (R6), add the `Info.plist` usage strings, and deep links for the
  email links.
- **Optional hardening:** auth-gated or signed photo URLs (R5); limit how far a
  client's claimed position may jump (R4); a data-export endpoint (R8);
  refresh-token rotation to shorten the 30-day token.
- **Nice to have:** `PUT /profiles/me` as a single upsert.

---

## History (summary)

- **Aug 2026** — UI redesign (PR #16: the wall of tags, three-way visibility,
  Privacy tab, two-step onboarding); privacy & security review (unguessable
  photo names, rate limits, email verification, revocable sessions,
  self-hosted fonts, hashed tokens, CORS allowlist, helmet); in-app policy.
- **Nov 2026** — bug sweep from hands-on testing (#46); client simplification
  (#46); privacy pass: tag only on the server while on the wall, 30-minute
  wipe, rounded location, no distances, 4-hour party codes (#47); remember/hide
  removed, sign-in limits reworked (#48); shutdown sweep (#49); refactor:
  integration + browser tests and CI (#50), one visibility setting (#51), My
  tag untangled (#52), leftovers removed and this file rewritten (#53).
