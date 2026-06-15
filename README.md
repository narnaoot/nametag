# Handoff: Nametag — UI Redesign (Nabil Arnaoot design system)

## Overview
Nametag is a location-based social discovery app — a digital "Hello, My Name Is" badge. People who opt in become visible to others nearby; you can browse a grid of their nametags, tap any badge to see the full tag, and send a wave ("say hi"). This package redesigns the app's full surface — **Sign in, first-run onboarding, the Nearby grid, and My Tag (profile editor)** — in the **Nabil Arnaoot design system** (warm cream canvas, Playfair Display + Nunito, a bright five-color "paintbox," hairline borders, and a literal "hello my name is" sticker motif reinterpreted as the badge card).

The original app lives at `github.com/narnaoot/nametag` (React + Vite + Capacitor for iOS). This redesign targets that same stack.

## About the Design Files
The files in `design_files/` are **design references created in HTML/React-via-Babel** — runnable prototypes that show the intended look, layout, and behavior. **They are not production code to copy directly.** They use inline-Babel JSX, global `window.*` exports, and a self-contained iOS frame purely so the prototype runs standalone in a browser.

Your task is to **recreate these designs in the real `nametag` codebase** using its existing patterns: real React components/modules, the app's routing, its API layer (`src/api.js`), Capacitor Filesystem for the photo, and its CSS approach (the repo uses Tailwind v4 `@theme` tokens in `index.css` plus `src/constants.js`). Lift the exact visual values from this README and from `design_files/styles.css`, but wire them into components and state the way the rest of the app is built.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, radii, shadows, and interactions are all specified. Recreate the UI pixel-accurately using the codebase's libraries. The one liberty: seed data (people, taglines, distances) is placeholder — replace with real data from the app's nearby-people hook (`useNearbyPeople`).

---

## Design Tokens

All tokens are defined as CSS custom properties in `design_files/styles.css` under `:root, .theme-cream` (light) and `.theme-ink` (dark). Map these into the codebase's `index.css` `@theme` block / `src/constants.js`.

### Color — Cream theme (default)
| Token | Hex | Use |
|---|---|---|
| `--bg` | `#FFFBF5` | App background |
| `--surface` | `#FFFFFF` | Cards, fields, sheets |
| `--warm` | `#FFF5E8` | Subtle warm fill |
| `--warm2` | `#FDECD6` | Skeleton/placeholder fill |
| `--text` | `#3D2B1F` | Primary text (warm near-black) |
| `--muted` | `#9A8070` | Secondary text, labels |
| `--border` | `#E8DDD0` | Hairline borders |
| `--field` | `#FFFFFF` | Input background |

### Color — Ink theme (dark)
| Token | Hex |
|---|---|
| `--bg` | `#271B12` |
| `--surface` | `#33251A` |
| `--warm` | `#3C2C20` |
| `--warm2` | `#46342650` |
| `--text` | `#FBF0E2` |
| `--muted` | `#C2A892` |
| `--border` | `#503D2D` |
| `--field` | `#2C2018` |

### The Paintbox (accent colors)
Five brand hues. Each person has an `accent` key; badges tint to it. The Ink theme uses **deepened** variants of the same hues (same CSS var name, overridden inside `.theme-ink`) so badges glow less against dark.

| Key | Cream | Ink (deepened) |
|---|---|---|
| `coral` | `#FF4733` | `#E04330` |
| `teal` | `#06D6B8` | `#0ABFA6` |
| `mustard` | `#FFB300` | `#E0A000` |
| `rose` | `#FF3D9A` | `#E83387` |
| `lavender` | `#A86BFF` | `#955EE8` |

Canonical order: `['coral','teal','mustard','rose','lavender']`.

> A bright green was deliberately **dropped** from the paintbox — it read too close to teal in the grid. Rose fills the magenta gap so all five accents stay visually distinct. Green survives only as a **semantic success** color (next table), never as a badge accent.

### Semantic success green
| Token | Cream | Ink | Use |
|---|---|---|---|
| `--sage` | `#2ED573` | `#2BBD68` | Wave-sent chip, "You're visible" banner, "Saved ✓". Positive-state green only — **not** part of the paintbox. |

### Semantic roles
| Token | Value | Use |
|---|---|---|
| `--primary` | `var(--teal)` | **Brand color.** Drives all chrome: headers, buttons, focus rings, active tab, toggles, on-chips. User-swappable. |
| `--on-primary` | computed (`#23170E` or `#FFFFFF`) | Text/icon color on a filled `--primary`. **Computed at runtime** from the primary's luminance for contrast — see "Contrast helper." |
| `--danger` | `#FF5C47` | Destructive actions only (delete account). The **only** place red appears as chrome. |

> **Design intent — important:** Red is *not* a chrome color here. Teal leads everything by default; the paintbox is reserved for per-person badge accents; red means danger only. Keep this discipline.

### Type
- **Display / serif:** `'Playfair Display', Georgia, serif` — weights 700/900, plus italics. Used for names, headings, taglines (italic).
- **Body / sans:** `'Nunito', system-ui, -apple-system, sans-serif` — weights 400/600/700/800.
- Load via Google Fonts: `Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=Nunito:wght@400;600;700;800`.

Type roles (from `styles.css`):
| Class | Font | Weight | Size | Tracking | Notes |
|---|---|---|---|---|---|
| `.t-display` | Playfair | 900 | (per use) | `-1.5px` | `em` inside → italic, `var(--primary)` |
| `.t-h2` | Playfair | 900 | (per use) | `-0.8px` | line-height 1.08 |
| `.t-h3` | Playfair | 700 | (per use) | — | line-height 1.2 |
| `.t-quote` | Playfair | 700 italic | (per use) | — | taglines |
| `.t-kicker` | Nunito | 800 | 0.7rem | `.15em` | uppercase, `var(--primary)` |
| `.t-label` | Nunito | 800 | 0.64rem | `.14em` | uppercase, `var(--muted)` |
| `.t-body` | Nunito | 400 | (per use) | — | line-height 1.7, `--muted`; `strong`→`--text` |

### Spacing, radius, shadow
| Token | Value |
|---|---|
| `--r` | `14px` (cards, fields) |
| `--r-pill` | `99px` (buttons, chips) |
| `--r-sm` | `3px` |
| `--hairline` | `1.5px` (all borders) |
| `--shadow-card` | `0 3px 16px rgba(61,43,31,0.13)` |
| `--shadow-hover` | `0 12px 32px rgba(61,43,31,0.10)` |
| `--shadow-port` | `0 8px 32px rgba(61,43,31,0.16)` |

### Texture
`.dotgrid` — a faint dotted hero texture: `radial-gradient(var(--dot) 1.2px, transparent 1.2px)` at `background-size: 22px 22px`. `--dot` is `rgba(61,43,31,0.10)` (cream) / `rgba(255,243,226,0.10)` (ink). Used behind auth + onboarding.

### Contrast helper (must port)
`--on-primary` is computed in JS (`design_files/app.jsx`, `lum()` + `bestOn()`): relative luminance of the active primary hex decides whether overlaid text is `#FFFFFF` or `#23170E`. Bright accents like mustard/sage need dark text; teal/coral/lavender need white. Implement this anywhere a paintbox color is used as a filled background with text on top (primary buttons, on-state chips). In Ink theme, compute contrast from the *deepened* variant actually rendered.

---

## Primitives (shared components/classes)

From `styles.css`:
- **`.na-btn`** — pill button. Nunito 800, `padding: 14px 22px`, `font-size: 15px`, `border-radius: 99px`, `background: var(--primary)`, `color: var(--on-primary)`. Hover `opacity .88`; active `translateY(1px)`. Variant `.na-btn--ghost` = transparent bg, `--text`, hairline border.
- **`.na-field`** — input. Nunito 600, 15px, `padding: 13px 15px`, `border-radius: 14px`, hairline border, `background: var(--field)`. Focus: `border-color: var(--primary)` + `box-shadow: 0 0 0 3px color-mix(var(--primary) 22%, transparent)`.
- **`.na-chip`** — pill chip. Nunito 700, 13px, `padding: 7px 14px`, hairline border. On-state (`[data-on="true"]`): `background`/`border` = `var(--primary)`, `color: var(--on-primary)`.
- **`.no-sb`** — hides scrollbars (used inside the phone).
- **`.nt-tappable`** — hover `translateY(-2px)`, active `scale(.97)`.

### Avatar (`badge.jsx`)
Circle. If `person.photo` → cover image. Else **initial-monogram**: first letter, Playfair 900 at `size*0.42`, color = accent, on a `color-mix(accent 20%, surface)` tint. Default ring: `4px solid var(--surface)` + `--shadow-card`. **No illustrated/fake faces** — monograms only.

### Distance label (`distanceLabel(meters)`)
`null`→none · `<10`→`"here"` · `<100`→`"~{rounded to 5} m"` · else→`"{round(d/80)} min walk"`.

---

## Screens / Views

The prototype renders inside a 402×874 iOS frame (`ios-frame.jsx`) — that frame is **prototype scaffolding only**; the real app already runs on device. Build the screens, not the bezel. Status bar shows 9:41.

### 1. Sign in (`screens-auth.jsx` → `AuthScreen`)
**Purpose:** authenticate or start registration. Sits on a `.dotgrid` cream/ink canvas.

The prototype offers three compositions via a tweak; **ship the `badge` composition** (the chosen default): a hero nametag badge sits above the form. Components:
- **Wordmark** — "Name" in `--text` + "tag" as Playfair italic in `--primary`.
- **Hero badge** — a demo `StickerBadge` (name "Nametag", pronouns "say hi! 👋", tagline "See who's nearby", stickers 👋🌟🎉) tilted ~ -2°.
- **AuthForm** — toggles `login` / `register` (two text tabs; active tab is `--primary` with a 22×3px underline). Fields: email, password (with show/hide), and on register a name field. Primary button reads **"Sign in"** or **"Create account"**. Includes a "forgot password?" affordance. Real wiring: `src/api.js` `login`/`register`/`forgotPassword`.
- **On "Create account" → go to Welcome (onboarding), not straight to Nearby.**

### 2. Welcome / First-run onboarding (`onboarding.jsx` → `OnboardingScreen`)
**Purpose:** the warm first-run moment — "write your name on your tag." Shown right after registration. `.dotgrid` canvas, scrollable, centered column, 70px top padding.

Layout top→bottom:
- `.t-label` kicker "One last thing" in `--primary`.
- `.t-display` heading (~30px): "Write your name on your **tag**" (em = primary italic).
- **Live badge preview** (`StickerBadge`) tilted -2°, wrapped in `.nt-pop` entrance — **fills in live as the user types** name / picks pronouns / picks color.
- **Name** input (`.na-field`, centered, weight 800, 17px, maxLength 20, autofocus).
- **Pronoun chips** (`.na-chip`, toggle): she/her · he/him · they/them · she/they · he/they (single-select, tap again to clear).
- **Paintbox swatches** — five 34px circles in canonical order; selected gets `3px solid var(--text)` ring + `scale(1.12)`.
- **Primary button "Stick it on →"** — disabled (opacity .45) until name is non-empty; on click writes name/pronouns/accent into the user and navigates to Nearby.
- Fine print: "You can add a photo & stickers later".

### 3. Nearby (`screens-app.jsx` → `Nearby`)
**Purpose:** browse people nearby; tap to open a tag; refresh; control your own visibility. Scroll container, `padding: 70px 18px 96px`.

**Header row:** `.t-display` "Near**by**" (em italic primary) + a status `.t-label` ("Updated 9:41 · N people", or "Scanning nearby…" while refreshing, or "· just you" when empty). Right side: a **"Refresh →"** chip that triggers a ~1.2s scan.

**Visibility banner:** a green-tinted card (`--sage`, semantic success) "You're visible nearby / Tap to slip out of view" with a `Toggle`. When off, **your own badge dims to 40%** in the grid but others stay. This maps to the app's existing visibility/opt-in state.

**Body — three layouts (tweak `layout`; ship `grid` as default):**
- **Grid** — your badge first, then people sorted **nearest-first**. Sticker badges in a 2-col grid (`columnGap 14`, `rowGap 30`); editorial cards stack 1-col. Each badge wrapped in `.nt-tappable` and opens the detail sheet on tap.
- **Stacked** — single column, max-width 320, centered.
- **Radar** — a 320px dotted-grid mini-map: you at center (primary pin), others positioned by angle/distance as tappable avatar pins; caption "Tap a face to see their tag."

**Refresh → loading skeleton** (`SkeletonGrid`): pulsing placeholder badges (`@keyframes nt-pulse`, `.45→.95` opacity, staggered) matching the current variant/layout.

**Empty state** (`EmptyNearby`, when no people): your badge (tagged "YOU") beside a dashed ghost "this spot's free 👋" sticker, then `.t-h2` "No tags nearby **yet**" and a `.t-body` line: "You're the first one here. Stay visible — when someone arrives, their tag shows up right beside yours."

### 4. Person detail sheet (`detail-sheet.jsx` → `DetailSheet`)
**Purpose:** full view of one person + the wave action. A bottom sheet overlaying the Nearby screen.
- **Scrim** — `color-mix(#1d130b 44%, transparent)`, fades in (`.nt-scrim`), tap to close.
- **Sheet** — `--surface`, `border-radius: 22px 22px 0 0`, top hairline, `box-shadow: 0 -12px 40px rgba(29,19,11,.25)`, slides up (`.nt-sheet`, `cubic-bezier(.32,1.04,.42,1)`). Grabber handle at top (tap to close).
- **Content (centered):** 92px Avatar · name (Playfair 900, 34px / 28px if >11 chars) · pronoun pill + distance label ("right here" / "~20 m away" / "2 min walk") · italic tagline in quotes · stickers (30px, alternating ±6° tilt, drop-shadow).
- **Action:**
  - If it's **you** → "Edit my tag" (→ My Tag).
  - If they **waved at you** (`wavedAtYou`) → a "{name} said hi to you 👋" line + button **"Wave back 👋"**.
  - Else → **"Say hi 👋"**.
  - After waving → a green confirmation block (`--sage`): "Wave sent 👋 — they'll see it on their tag." (Wave state lives in app-level `waves`.)

**Wave indicator on badges** (`WaveChip` in `badge.jsx`): a small rotated (-4°) corner chip. **Sent** = filled green (`--sage`) "hi sent"; **incoming** (`wavedAtYou`) = surface chip "says hi!". Positioned top-left; offset differs for sticker vs editorial variant.

### 5. My Tag (`screens-app.jsx` → `MyTag`)
**Purpose:** edit your own nametag. Scroll container. Sections (each a labeled `Field`):
- **Live badge preview** of yourself at top.
- **Photo** — circular avatar + "Change photo" affordance in `--primary` (real app: Capacitor Filesystem / camera, mirrors original `ProfilePage`).
- **Name** (`.na-field`).
- **Pronouns** — chip row (on-state uses `--primary`).
- **Tagline** (`.na-field`, with a remaining-count hint that turns `--primary` near the limit).
- **Nametag color** — paintbox swatch row (sets your `accent`).
- **Stickers** — emoji picker; keep emoji (they're deliberate category markers in this system).
- **Visibility / radius** settings — toggles styled with `--primary`.
- **Delete account** — the lone `--danger` (red) zone: a confirm step with a red "Delete everything" button.

### 6. Tab bar (`screens-app.jsx` → `TabBar`)
Two tabs: **Nearby** (grid) and **My tag** (profile). Active tab = `--primary` label + 22×3px underline; inactive = `--muted`. ~44px+ hit targets. Fixed to bottom inside the app.

### App icon (`App Icon.html`)
A nametag sticker mark: dark ink header band (keeps red off the brand surface) reading "hello / my name is" in Playfair italic, on a `--teal` rounded-square field with a faint halftone-dot texture. Shown at 512px and 120px. Recreate as real iOS icon assets.

---

## Interactions & Behavior
- **Tap badge → detail sheet** slides up (scrim fade `.22s`; sheet `.32s` spring). Tap scrim/grabber to dismiss.
- **Wave**: tap "Say hi" / "Wave back" → optimistic sent state → sage confirmation + persistent "hi sent" chip on that badge. Back this with the real messaging/notification endpoint.
- **Refresh**: ~1.2s scan showing skeletons, then refreshed list (replace timeout with the real nearby fetch).
- **Visibility toggle**: flips your discoverability; dims your own badge when off.
- **Onboarding**: badge preview updates live on every keystroke / selection; CTA gated on non-empty name.
- **Entrance animations** are gated behind `@media (prefers-reduced-motion: no-preference)` and use `both` fill so reduced-motion / SSR lands on the visible end-state. Preserve this.
- **Grid sort**: nearest-first by `distance`.
- All buttons: hover `opacity .88`, active `translateY(1px)`; cards: hover lift, active `scale(.97)`.

## State Management
Per the prototype (`app.jsx`) — map onto the app's real stores/hooks:
- `you` — current user profile (`name, pronouns, tagline, accent, stickers, photo, distance, radius, alwaysVisible`).
- `visible` — discoverability boolean (drives banner + self-dim).
- `waves` — map of `personId → 'sent'`; combine with incoming `wavedAtYou` flags from the server.
- `people` — nearby list (replace seed with `useNearbyPeople`); sorted by distance.
- Theme (`Cream`/`Ink`), brand color, badge variant, layout, auth composition — in the prototype these are **Tweaks** (design exploration controls). For production, the decided defaults are: **Cream theme, teal brand color, Sticker badge, mixed/per-person badge colors, Grid layout, Badge sign-in composition.** Theme + brand color *could* become real user settings if desired, but aren't required.

## Data shape (per person)
```js
{ id, name, pronouns, tagline, accent /* paintbox key */,
  stickers: ['📷','🌸'], photo /* url|null */, distance /* meters|null */,
  wavedAtYou /* bool, optional */ }
```
The "mixed" badge-color behavior: each person's badge uses **their own** `accent` key; if a single brand color is forced instead, all badges use that one. `resolveAccent()` returns a `var(--key)` reference so the Ink theme's deepened palette applies automatically.

## Assets
- `design_files/assets/ProfilePicture.webp` — the demo user photo. Replace with the real user's photo (Capacitor Filesystem) in production.
- Other files under `design_files/assets/` are design-system reference (monogram, etc.).
- Emoji are system emoji (no asset needed).
- Fonts: Google Fonts (Playfair Display, Nunito).

## Files (in `design_files/`)
| File | What it contains |
|---|---|
| `Nametag Redesign.html` | Entry point — open in a browser to run the full prototype. |
| `styles.css` | **All design tokens + primitives + animations.** The source of truth for values. |
| `data.js` | Seed people + paintbox hex maps + accent order. |
| `badge.jsx` | `Avatar`, `StickerBadge`, `EditorialCard`, `PersonCard`, `WaveChip`, `resolveAccent`, `distanceLabel`. |
| `screens-app.jsx` | `Nearby` (grid/stacked/radar), `SkeletonGrid`, `EmptyNearby`, `Radar`, `MyTag`, `TabBar`. |
| `screens-auth.jsx` | `Wordmark`, `AuthScreen` (card/editorial/badge), `AuthForm`. |
| `detail-sheet.jsx` | `DetailSheet` (person detail + wave action). |
| `onboarding.jsx` | `OnboardingScreen` (first-run "write your name"). |
| `app.jsx` | App assembly: state, theme/contrast logic (`lum`/`bestOn`), Tweaks panel. |
| `App Icon.html` | App-icon design at 512 & 120px. |
| `ios-frame.jsx`, `tweaks-panel.jsx` | Prototype scaffolding only — **do not port.** |

> To run the reference: open `design_files/Nametag Redesign.html` in a browser. The Tweaks panel (top toolbar) toggles every explored variation; the shipped defaults are listed under "State Management."
