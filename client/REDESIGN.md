# Nametag — UI Redesign (Nabil Arnaoot design system)

This implements the handoff in `design_handoff_nametag_redesign/README.md`. The
HTML/Babel prototypes there were design references; this document records how
they were recreated as real components in the React + Vite + Capacitor app.

## Shipped decisions

Per the handoff's "State Management" defaults:

- **Theme:** Cream (default). The Ink (dark) theme is fully tokenized in
  `index.css` (`.theme-ink`) but not exposed as a user setting.
- **Brand color:** Teal (`--primary: var(--teal)`). `--on-primary` is computed
  at runtime from the brand color's luminance.
- **Badge:** Sticker variant, per-person ("mixed") accent colors.
- **Layout:** Nearby grid.
- **Sign in:** Badge composition (hero nametag badge above the form).

The prototype's Tweaks panel and iOS frame were scaffolding and were **not**
ported. The Editorial badge / Stacked / Radar layouts live in the prototype
only; the production `Badge` component still supports the editorial variant if
we ever want it, but the screens ship sticker + grid.

## Design system

- **`src/index.css`** — all tokens, type roles (`.t-display`, `.t-h2`,
  `.t-kicker`, …), primitives (`.na-btn`, `.na-field`, `.na-chip`), the
  `.dotgrid` texture, `.nt-tappable`, and the entrance/skeleton keyframes.
  Cream lives in `:root, .theme-cream`; Ink overrides in `.theme-ink`. Fonts
  (Playfair Display + Nunito) load via the Google Fonts `@import`.
- **`src/constants.js`** — the cream paintbox hex map (`PAINTBOX`),
  `ACCENT_ORDER`, sticker/pronoun/radius options, and length limits. The Ink
  palette and `--sage` live only in `index.css` (CSS vars are the source of
  truth — no JS mirror to drift).
- **`src/colors.js`** — pure helpers ported from the prototype:
  - `lum()` / `bestOn()` — the contrast helper that picks `#FFFFFF` vs
    `#23170E` for `--on-primary`. Applied on the app root in `App.jsx`.
  - `resolveAccent(person, index)` — returns a `var(--key)` reference so the
    Ink palette's deepened hues apply automatically. Falls back to a stable
    per-index paintbox color when a person has no (or a legacy) accent.
  - `distanceLabel(meters)` — `here` / `~N m` / `N min walk`.
  - `toBadgePerson(profile, …)` — maps a server profile row onto the design's
    person shape (see "Data mapping").

## Components & screens

| File | Recreates (prototype) | Notes |
|---|---|---|
| `components/Badge.jsx` | `badge.jsx` | `Avatar` (photo or initial monogram), `StickerBadge`, `EditorialCard`, `WaveChip`, `PersonCard`. |
| `components/DetailSheet.jsx` | `detail-sheet.jsx` | Slide-up person sheet + Say-hi / Wave-back / Edit-my-tag action. |
| `components/TabBar.jsx` | `screens-app.jsx → TabBar` | Fixed bottom tabs, primary underline. |
| `components/Toggle.jsx` | `screens-app.jsx → Toggle` | Pill switch (visibility banner + settings). |
| `pages/AuthPage.jsx` | `screens-auth.jsx → AuthScreen` (badge) | login / register / forgot / reset wired to `api.js`. Register → onboarding. |
| `pages/OnboardingPage.jsx` | `onboarding.jsx` | First-run "write your name"; live badge preview; saves to server + on-device. |
| `pages/GridPage.jsx` | `screens-app.jsx → Nearby` | Real data via `useNearbyPeople`; self badge first, nearest-first; skeleton/empty states; wave state. |
| `pages/ProfilePage.jsx` | `screens-app.jsx → MyTag` | Live preview, paintbox, chips, stickers, danger-only delete; keeps auto-save, Capacitor photo, party code, sign out. |
| `App.jsx` | `app.jsx` (assembly only) | Theme wrapper + `--on-primary` + register→onboarding→Nearby flow. |

## Data mapping

The prototype's seed shape `{ name, pronouns, tagline, accent, stickers[],
photo, distance, wavedAtYou }` maps onto the existing backend like so:

| Design field | Server field | Notes |
|---|---|---|
| `name` | `display_name` | |
| `pronouns` | `pronouns` | |
| `tagline` | `tagline` | |
| `accent` (paintbox key) | `tag_color` | **Now stores the key** (e.g. `"teal"`), not a hex. Legacy hex values no longer match a key and fall back to a per-index paintbox color — no migration needed. |
| `stickers[]` | `stickers` | JSON string in the DB; parsed in `toBadgePerson`. |
| `photo` | `photo_path` | Resolved via `photoUrl()`; the user's own photo also comes from Capacitor Filesystem (`profileStorage.loadLocalPhoto`). |
| `distance` | `distance_meters` | Nearby query only. |
| `wavedAtYou` | — | No backend yet. Waves are **optimistic client state** in `GridPage`; incoming waves are stubbed off. Back this with a real endpoint later. |

`src/profileStorage.js` centralizes the on-device persistence (Capacitor
Filesystem photo + Preferences profile JSON) shared by Onboarding and My Tag,
matching the existing privacy/restore flow in `useNearbyPeople`.

## App icon

`public/app-icon.svg` is the master icon — the dark "hello / my name is" sticker
on a teal halftone field — and is wired as the web favicon. iOS app-icon PNGs
are generated from the Xcode project, which is **not committed** (it's created
by `npx cap add ios`). To regenerate after adding the iOS platform:

```bash
cd client
npm run build
npx cap add ios            # if ios/ doesn't exist yet
# Produce a 1024×1024 PNG from the master, then run the assets tool:
npx @capacitor/assets generate --iconBackgroundColor '#06D6B8' --iconBackgroundColorDark '#271B12'
npx cap sync ios
```

(`@capacitor/assets` wants a PNG/larger raster at `assets/icon.png`; export
`public/app-icon.svg` at 1024×1024 first, e.g. with `rsvg-convert` or any
vector editor.)

## Not ported / follow-ups

- **Waves backend** — no messaging/notification endpoint exists; the wave UI is
  client-only for now.
- **Ink theme & brand-color switching** — fully tokenized but not surfaced as
  user settings (per the handoff, optional).
- **Editorial / Stacked / Radar** — prototype-only explorations; the sticker
  grid ships.
