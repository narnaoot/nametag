# Nametag — UI Redesign ("nearby name tags")

This implements the handoff in `redesign/README.md` and the Claude Design canvas
`redesign/Nametag Redesign.dc.html`. The HTML there is a design reference; this
document records how it was recreated as real components in the React + Vite +
Capacitor app. It **supersedes** the earlier Playfair/teal redesign (which was
built from `design_handoff_nametag_redesign/`).

Open questions and best-guess decisions are in `../REDESIGN_QUESTIONS.md`.

## The two colour rules

Everything follows from these:

1. **Orchid is the app.** Chrome uses orchid: the accent word in every screen
   title, the active tab, your avatar ring, primary buttons (`--orchid-dk` fill,
   white text). Display-size accent words and avatar rings use the **brightened
   orchid `#C462BC`** (`--brand`), because `--orchid` is too dark to read as an
   accent at 40px.
2. **The orchid ring is you.** Coral is the *default* tag colour, but people now
   **pick their own** (`PaintboxPicker`, on My tag + onboarding), so coral no
   longer means "you". Instead your own tag — on the wall and in the header —
   wears the brightened-orchid ring, so you can still find yourself at a glance
   in any colour.

   *(The canvas reserved coral for "you"; Nabil asked for free colour choice, so
   the "you" signal moved to the ring. Orchid stays out of the picker — it's the
   app's.)*

Other people take their chosen colour, or — if they haven't picked one — a stable
per-person colour derived from their id. One remap: **orchid → citron** (orchid
belongs to the app).

## Design system

- **`src/index.css`** — all tokens (`:root`), the type roles (`.t-display`,
  `.t-h2`, `.t-h3`, `.t-quote`, `.t-kicker`, `.t-label`, `.t-body`), primitives
  (`.na-btn`, `.na-btn--ghost`, `.na-field`, `.na-chip`, `.na-danger-card`), and
  the restrained motion keyframes. Fonts (Libre Caslon Text + Nunito) load from
  Google Fonts. `--primary` is `--orchid-dk`; `--brand` is `#C462BC`. There is
  **no dark theme** (the spec doesn't define one).
- **`src/constants.js`** — the paintbox key list and `ACCENT_VARS` trio map,
  `PERSON_ACCENTS` (the colours other people can take), `ACCENT_REMAP`,
  `BRAND_ACCENT`, the sticker vocabulary (`STICKER_OPTIONS` emoji + word,
  `STICKER_LABELS`), pronoun options, length limits, and the on-device storage
  keys (photo, profile, remembered names, hidden people).
- **`src/colors.js`** — pure helpers: `resolveAccentKey` (you → coral; others →
  stored `tag_color` remapped, else a stable hash of their id),
  `accentTrio`/`personTrio` (→ `{hue, tint, deep}` CSS-var refs),
  `visibleMinutes`/`visibleLabel` ("visible N min"), `initials`, and
  `toBadgePerson` (server row → tag "person" shape). Distance and waves are gone.

## Components

| File | What it is |
|---|---|
| `components/Avatar.jsx` | circular photo (or Caslon-initial fallback); white ring always, optional coloured ring reserved for you / an opened tag |
| `components/Tag.jsx` | a name tag on the wall — tint fill, hello-my-name-is, Caslon name, pronoun pill in the person's hue, footer strip that vanishes when they wrote no line |
| `components/VisibilityControl.jsx` | the one central three-way control (invisible \| nearby \| party) in the sage card; card turns to ink when invisible |
| `components/DetailSheet.jsx` | a tag opened into a bottom sheet — grows keeping its tint/ring; "visible N min", optional mutual-context row, Remember / Hide |
| `components/PartyCodeSheet.jsx` | the wide-tracked Caslon code entry |
| `components/MyTagPreview.jsx` | your own tag, always coral (My tag) |
| `components/StickerPicker.jsx` | square (radius 3px) emoji+word sticker chips, coral when picked |
| `components/PronounChips.jsx` | single-select pronoun chips (orchid-dk when selected) |
| `components/TabBar.jsx` | three tabs: Nearby / My tag / Privacy; active = orchid-lt pill + orchid underline |

## Screens

| File | Canvas id | Notes |
|---|---|---|
| `pages/AuthPage.jsx` | 12a | Sign in — "Put a name to the room." landing (hero tags + two buttons) → email/password flow. Keeps forgot/reset + `?reset=` deep link. |
| `pages/OnboardingPage.jsx` | 12b, 12c | Two steps with a two-dash indicator. Step 1: type onto the coral tag + pronouns + one line. Step 2: photo + stickers + who-can-see-you. |
| `pages/GridPage.jsx` | 12d, 12g, 12h | The wall — responsive by viewport (see below). Header ("N tags nearby/here", Nearby, Refresh, your orchid-ringed avatar), the visibility control, and the tilted tag wall. Opening a tag → DetailSheet (phone/tablet) or the right rail (desktop); choosing Party code → PartyCodeSheet. |
| `pages/ProfilePage.jsx` | 12f | My tag — coral preview, the visibility control above three tap-to-edit rows (Name+pronouns / One line / Stickers), auto-save, on-device photo, sign out + delete. |
| `pages/PrivacyPage.jsx` | 14a | Privacy tab — sage "Right now" card + four statement cards (rewritten to match the actual server behaviour) + "Read the whole policy". |

## Central state — visibility

`invisible | nearby | party` is the app's one three-way control, shown in four
places (onboarding step 2, the wall, My tag, Privacy) as the same sage card. It's
mapped onto the existing backend fields without a schema change:

- **nearby** → `always_visible = true`, `party_code = ''`, location shared.
- **party** → opens the code sheet first; on join, `party_code = <CODE>` (upper-
  cased so matching is case-insensitive), `always_visible = true`.
- **invisible** → `setVisibility(false)` (server NULLs photo + location + sets
  `is_active = false`) and `always_visible = false` so refreshes don't flip you
  back on. `useNearbyPeople` gates all location sharing on the mode.

`src/hooks/useNearbyPeople.js` owns the mode, derives it from the profile on
load, and exposes `setVisibilityMode(next, { partyCode })`.

## Remembered names & hidden people (replacing waves)

The old "wave" feature is gone. The detail sheet now offers **Remember the name**
(copied to the device — `profileStorage.rememberName`, a Privacy promise) and
**Hide from me** (`profileStorage.hidePerson`, filtered client-side). Both persist
via `@capacitor/preferences` (localStorage on web). No backend endpoint.

## Data mapping

The tag "person" shape `{ id, name, pronouns, tagline, accent, stickers[], photo,
visibleSince, you }` maps onto the backend:

| person field | server field | notes |
|---|---|---|
| name / pronouns / tagline | `display_name` / `pronouns` / `tagline` | |
| accent | `tag_color` | the colour you picked (coral by default); others derived from id if unset/legacy |
| stickers[] | `stickers` | emoji array in a JSON string; word looked up via `STICKER_LABELS` |
| photo | `photo_path` | via `photoUrl()`; your own also from Capacitor Filesystem |
| visibleSince | `location_updated_at` | drives "visible N min" |

Backend routes, schema, and tests are **unchanged**.

## Responsive — tablet (12g) & desktop (12h)

`useViewport()` picks phone (`<768`), tablet (`768–1179`), desktop (`≥1180`).
The wall (`components/Wall.jsx`) takes a column count that grows with width:
2 / 3 / 4. Everything else is the same anatomy and the same rules — "more room".

- **Tablet.** One wide centered board (max 820), the title at Caslon 56px, the
  visibility control in the header; the bottom tab bar stays.
- **Desktop.** A persistent left **nav rail** (`components/NavRail.jsx`, at the
  App level) replaces the bottom tab bar; the centre column carries the header +
  visibility + board; a right rail shows **Selected** — the opened tag as a
  panel (`components/TagDetail.jsx`, shared with the phone sheet) so selecting a
  tag never covers the room, plus the "nothing is kept once you leave" note.

  *Adaptation:* the canvas puts "where you are", the stacked visibility control,
  and your own tag in the desktop **left** rail. Because the left rail is
  App-level navigation (shared across tabs) and the visibility/your-tag data
  lives in the Nearby screen, those pieces sit in the Nearby **centre header**
  instead. `VisibilityControl` has a `stacked` variant ready if we later move it
  into the rail. My tag / Privacy / onboarding / auth stay centred at phone
  width on all sizes (they're forms; width doesn't help them).

## Not done yet / follow-ups

- **Privacy hardening** — the copy now matches reality, but two things are worth
  fixing before real users: photos aren't cropped client-side (the original is
  uploaded, shown in a circle via CSS), and photo files sit at public
  `/uploads/...` URLs. See `../REDESIGN_QUESTIONS.md`.
- **Venue detection, mutual context, party hosting, radius UI** — best-guess
  decisions / out of scope, all in `../REDESIGN_QUESTIONS.md`. Sign in with Apple
  was dropped for the web prototype (add it back with a native app + dev account).
- **Real photography** — the sign-in hero uses `public/sample-face.webp`
  (the canvas placeholder portrait) as decoration only.
