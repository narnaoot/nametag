# Handoff: Nametag — nearby name tags

## Overview

Nametag shows you the people in the room you are standing in, as a wall of hand-tilted name tags. You wear a tag (photo, name, pronouns, one line about right now), you see everyone else's, and you go and say hello. There is no feed, no follows, and no messaging. The app is four places: **Nearby** (the wall), **My tag** (edit your own), **Privacy**, and a tag opened as a sheet.

This bundle covers the phone app end to end plus the same board at tablet and desktop width.

## About the design files

The files here are **design references created in HTML** — prototypes that show intended look and behavior. They are not production code to copy. The task is to **recreate these designs in the target codebase's existing environment** (React Native, SwiftUI, Flutter, whatever is in play) using its established patterns, components, and navigation. If no codebase exists yet, choose the framework appropriate to the product — this is a location-aware mobile app first — and implement the designs there.

`Nametag Redesign.dc.html` opens in any browser. It is a design canvas: pan and zoom, with each screen labeled by a badge (12A, 13A, 14A…).

## Fidelity

**High fidelity.** Colors, type, spacing, radii, shadows, and copy are final and specified below. Recreate the UI to match. The one deliberate placeholder is photography: all six people on the board use the same portrait file.

## What to build, and what to ignore

The canvas holds fifteen turns of exploration, newest at the top. **Only these screens are canonical:**

| Screen | Id in file | Notes |
|---|---|---|
| Sign in | `12a` | |
| Onboarding step 1 — name, pronouns, tagline | `12b` | keyboard state: `15a`, `15b` |
| Onboarding step 2 — photo, stickers, visibility | `12c` | |
| Nearby (the wall) | `12d` | |
| A tag, opened | `12e` | |
| My tag | `12f` | |
| Nearby — tablet | `12g` | |
| Nearby — desktop | `12h` | |
| Party code entry | `13a` | keyboard state: `15c` |
| Privacy | `14a` | see Open questions |

Turns 1 through 11 are superseded exploration. Do not build from them.

## Design tokens

From `_ds/…/colors_and_type.css`. Use these tokens rather than raw hexes where the target platform supports it.

### Surfaces and ink
| Token | Hex | Use |
|---|---|---|
| `--bg` | `#FFFBF5` | app background, warm cream |
| `--surface` | `#FFFFFF` | cards, tab bar, sheets, rails |
| `--text` | `#3D2B1F` | body and headings (never pure black) |
| `--muted` | `#7C6151` | secondary text, labels |
| `--border` | `#E8DDD0` | the 1.5px hairline on everything |

### Accents
Each accent is a trio: bright hue (lines, rings, 1.5px borders, large display emphasis), `-lt` tint (fills), `-dk` deep cut (readable text, button fills under white).

| Accent | hue | tint | deep |
|---|---|---|---|
| coral | `#F5563F` | `#FBD5CE` | `#9B3323` |
| lavender | `#9B6DE8` | `#E4D8F8` | `#5F4E9C` |
| mustard | `#F0A500` | `#FCE7B8` | `#7A5400` |
| sage | `#4FB870` | `#CDEBD6` | `#3C6349` |
| denim | `#4A82B0` | `#D5E4EF` | `#2E5B80` |
| blush | `#D56A92` | `#F7D8E4` | `#9E3D62` |
| citron | `#97A24E` | `#E6EAC7` | `#5D6626` |
| orchid | `#A75FA0` | `#EAD6E7` | `#7E3F78` |

**Two colour rules govern the whole app:**

1. **Orchid is the app.** Chrome uses orchid: the accent word in every screen title, the active tab, your own avatar ring, primary buttons (`--orchid-dk` fill, white text). Display-size accent words and avatar rings use a brightened orchid, **`#C462BC`**, not `--orchid` — the token was too dark to read as an accent at 40px.
2. **Coral is you.** Your own tag is always coral, everywhere it appears, so you can find yourself on a wall at a glance. Coral is never used for chrome.

Other people's tags take an accent from the paintbox as a per-person identity colour. Two remaps are deliberate: **orchid → citron** (orchid belongs to the app) and **teal → lavender** (teal clashed with the sage of the visibility card).

### Type
- **Libre Caslon Text** 400/700 — names, screen titles, taglines, statement headlines. Tight tracking, −0.7px to −1.6px at display sizes.
- **Nunito** 400–800 — all UI, labels, body, buttons. Line height 1.5–1.75.
- Emphasis is **colour plus weight**, never italic.
- Uppercase tracked labels: 9.5–11px, weight 700–800, letter-spacing `.12em`–`.18em`, `--muted`.

### Geometry and elevation
- Hairline border: **1.5px solid `--border`** — the structural signature, on cards, sheets, tab bars, rails, fields.
- Radii: 14px cards and sheets, 10px name tags, 99px pills, 3px sticker tags, 50% avatars, 28px sheet top corners.
- Shadows: `0 3px 16px rgba(0,0,0,.13)` resting, `0 8px 32px rgba(0,0,0,.16)` raised. Board cards get individually varied depths (below).
- The device frames on the canvas (390×812 with 40px radius, tablet 834×1000, desktop 1440×900 with window radius) are **mock chrome, not app UI**. Do not build them.

## Screens

### Nearby — `12d`

The wall. Phone frame 390×812.

**Header** — padding `34px 22px 0`, two columns, baseline-aligned.
- Left: label "7 tags at Ritual Coffee" (10px tracked, `--muted`), then "Nearby" in Caslon 700 40px, tracking −1.2px, with "by" in `#C462BC`.
- Right: "Refresh" pill (surface, 1.5px border, radius 99, padding `11px 15px`, 13px/800) and your avatar — 42px circle, 2px white border, ring `0 0 0 1.5px #C462BC`.

**Visibility control** — margin `14px 20px 0`. Card: `--sage-lt` fill, 1.5px `--sage`, radius 14, padding `10px 11px 11px`.
- Segmented control: surface, 1.5px border, radius 99, padding 3, three equal segments (`Invisible` / `Nearby` / `Party code`), each radius 99, padding `8px 4px`, 11.5px/800. Active segment: `--sage-dk` fill, white text. Inactive: `--muted`.
- Explanation line below, 11.5px, `--muted`, lead clause bold in `--sage-dk`: "**Visible to people nearby.** Anyone at Ritual Coffee with Nametag open sees your tag."
- The card takes the colour of the chosen state. Sage for Nearby.

**The board** — container padding `14px 20px 88px`, inner positioned box 350×620. Six tags, absolutely placed. This is a hand-laid composition, not a grid: no two tags share an edge or a baseline, and the bottom row is deliberately parked at the window edge so its photos and names read while the rest cuts off, cueing the scroll.

| # | Person | x | y | width | rotation | photo | name size | z | shadow |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Maya (coral, you) | 2 | 0 | 172 | 0° | 52 | 23 | 6 | `0 10px 28px rgba(0,0,0,.18)` |
| 2 | Theo (lavender) | 180 | 16 | 160 | 3.4° | 48 | 21 | 5 | `0 2px 10px rgba(0,0,0,.10)` |
| 3 | Priya (citron) | 10 | 178 | 164 | −3.0° | 52 | 21 | 4 | `0 6px 20px rgba(0,0,0,.14)` |
| 4 | Jonas (mustard) | 186 | 190 | 154 | 0.8° | 48 | 20 | 3 | `0 2px 11px rgba(0,0,0,.11)` |
| 5 | Lin (denim) | 0 | 372 | 168 | −2.0° | 54 | 23 | 2 | `0 12px 30px rgba(0,0,0,.19)` |
| 6 | Ruthie (blush) | 178 | 368 | 158 | 3.2° | 52 | 22 | 1 | `0 4px 14px rgba(0,0,0,.12)` |

Tilt, shadow depth, width, and photo size are all deliberately unequal, and two tags hang straight. Do not regularize them into a formula or a grid — the irregularity is the design. **There is no vertical slack left on this board:** the gap between a card's photo and the strip above it is 1–2px, so any change to type size or tilt needs the y positions re-tuned.

**The tag card** itself:
- Wrapper: person's `-lt` tint fill, 1.5px `--border`, radius 10, `overflow: hidden`, the rotation and shadow above.
- Body: padding `13px 12px 10px`, column, centre-aligned, gap 5.
- Photo: circle at the size above, 2.5px `--surface` border, shadow `0 3px 16px rgba(0,0,0,.13)`, **no coloured ring** — the ring is reserved for you, in the header.
- "hello my name is": 8px, 700, uppercase, `.17em`, `--muted`.
- Name: Caslon 700 at the size above, tracking −0.7px, `--text`.
- Pronoun pill: surface, 1.5px in the person's hue, radius 99, padding `3px 10px`, 11px/800, text in the person's `-dk`.
- Footer strip: surface fill, `border-top: 1.5px` in the person's hue, padding `8px 12px 9px`, the person's own line in Caslon 12px, colour = person's `-dk`. **If the person wrote no line, the strip is not rendered at all** (Jonas, in the mock). No distance, no sticker row, no wave button.

**Tab bar** — absolute bottom, surface, `border-top: 1.5px`, padding `13px 0 26px`, three equal items: Nearby / My tag / Privacy. Active: label in an `--orchid-lt` pill (radius 99, padding `4px 13px`, 11.5px/800 uppercase `.12em`, `--orchid-dk`) above a 22×3px `--orchid` underline. Inactive: `--muted` label, invisible 22×3 spacer to keep baselines aligned.

### A tag, opened — `12e`

Scrim `rgba(61,43,31,.34)` over the wall. Sheet anchored to the bottom: height 724, `box-sizing: border-box`, radius `28px 28px 40px 40px`, `border-top: 1.5px`, padding `14px 24px 28px`. Grabber 44×4px `--border`, centred, 18px below.

The tapped tag grows into the sheet keeping its own tint and hue — same sticker, bigger. Priya, so citron: `--citron-lt` fill, 1.5px `--border`, radius 14, rotated −1.2°, padding `22px 22px 18px`. Photo 106px with a 3px white border and a citron ring. Name Caslon 700 42px. Pronoun pill as on the board but padding `6px 14px`. Tagline in Caslon 20px, centred, max-width 260. Sticker chips: surface, 1.5px citron, radius 99, padding `7px 13px`, 12px/800 citron-dk, emoji at 14px.

Context footer inside the card, above a 1.5px citron rule: **"visible 12 min"** only, 10px tracked uppercase `--muted`. Distance was removed deliberately — everyone on the board is within a room's width, so a metre count implied precision the product does not have.

Below the card: a mutual-context row (surface card, 40px avatar with a lavender ring, 13px body) — "Theo is here too — you were both at the same open mic last week."

Actions pinned to the bottom of the sheet: primary "Remember the name" (56px, radius 99, `--orchid-dk`, white, 16px/800), then "Hide from me" (48px, surface, 1.5px border, `--muted`, 14px/800).

### My tag — `12f`

Header: label "Visible at Ritual Coffee", title "My tag" with "tag" in `#C462BC`, and "Done" at 13px/800 in `--orchid-dk`.

Preview: your tag, always coral — `--coral-lt`, rotated −1.4°, radius 14, 74px photo with a coral ring, name Caslon 32px, pronoun pill, tagline in Caslon 15px, two sticker chips. Caption underneath, centred, 11.5px `--muted`: "This is exactly what the room sees."

Then the visibility control (identical to the board's, in its sage card), followed by three edit rows — Name / One line about right now / Stickers — each a surface card, 1.5px border, radius 14, padding `10px 16px`, with a 9.5px tracked label, the current value in Caslon 16px, and a `→` in `--muted`. The visibility card sits **above** the rows, not among them, because it is the only control that changes who can see you.

### Onboarding — `12b`, `12c`

Two steps, both skippable, with a two-dash progress indicator (26×4px, active `--orchid`, inactive `--border`).

**Step 1 (`12b`)** — you type onto the tag itself: a coral tag preview rotated −1.4° whose name sits on a 1.5px coral underline with a 2px caret. Below: pronoun chips (radius 99, padding `9px 15px`, 13px/800; selected = `--orchid-dk` fill, white), then the tagline field (surface card, Caslon 17px) with the helper "24 of 60 characters. This is the line under your name on the wall." Primary "Next → photo" pinned 38px from the bottom.

**Step 2 (`12c`)** — 112px photo circle with a coral ring beside "Take a photo" / "Choose from library" pills and the note "A cropped circle, only ever this small." Then "Pick up to three stickers": seven sticker tags at **radius 3px** (padding `8px 13px`, 13px/800, emoji at 15px; selected = `--coral-lt` fill with a 1.5px coral border and coral-dk text). Stickers are square-cornered on purpose — they are content you pick, not a control you press, and every other pill in the app is a control. Then the visibility control under the label "Who can see you", defaulting to Nearby. Primary "Look around me".

### Party code — `13a`

Reached by choosing **Party code** on the visibility control. The choice does not take effect until a code exists, so this sheet opens first.

Scrim as `12e`. Sheet height 576, `box-sizing: border-box`, padding `14px 24px 28px`. Label "Visibility", title "What's the party code?" (Caslon 34px, "code" in `#C462BC`), body "Whoever is throwing the party picks one and tells the room. Type it exactly as they said it."

The field: surface, 1.5px `--border`, radius 14, padding `20px 18px`, centred. Code set in **Caslon 700 30px, uppercase, letter-spacing `.16em`** with a 2px `#C462BC` caret — tracked wide so it reads as something said out loud and copied down, not a password. Helper: "Six to ten characters. Capitals and hyphens don't matter."

Consequence card (sage, as elsewhere): "**Only people who type the same code will see your tag.** Everyone else at Ritual Coffee stops seeing you, and you stop seeing them."

Actions: "Join the party" (orchid-dk), then "Stay visible to everyone nearby" as the way out — worded as the state you land in, because the sheet arrives mid-decision and "Cancel" would not say which state that is.

### Privacy — `14a`

A top-level tab, not a settings row, so it can be read before anyone is asked to be visible.

Header: label "Nametag", title "Privacy" with "acy" in `#C462BC`. Then a sage card, "Right now": current state in Caslon 17px, a supporting line ("Seven people at Ritual Coffee can see your tag."), and a `→` to the control.

Under the label "What is true always", four statement cards — plain surface, 1.5px border, radius 14, padding `13px 15px`, each a Caslon 16.5px claim over a 12px `--muted` detail sentence. No tint coding: these are not categories, and colouring them would imply a ranking. Then a "Read the whole policy" row with a `→`.

**The four statements are not signed off — see Open questions. The first card is currently a placeholder reading "These points need to be modified to reflect actual privacy practices."**

### Tablet — `12g` and desktop — `12h`

Same board, same card anatomy, same rules; more room.

**Tablet (834 wide).** Header padding `40px 44px 0`, title at Caslon 56px. The segmented control unrolls into the header as a sage pill (padding 4, segments `9px 15px`, 12.5px/800) with its explanation sentence on one line beneath the header. Board area padding `26px 44px 44px`, positioned box 800 tall. Six tags: x/y `(0,0) (252,34) (500,6) (20,372) (268,424) (512,388)`, widths 224/208/218/212/204/216, rotations `0° 2.2° −6.2° 0° −3.4° 1.4°`, photos 84/78/80/78/74/80, names 32/30/31/30/29/30, footer padding `9px 14px`, bio in Caslon 15px. No tab bar — the phone's bottom nav folds into the header.

**Desktop (1440×900).** Three columns.
- Left rail 250px, surface, `border-right: 1.5px`, padding `30px 22px`: wordmark label, nav (Nearby / My tag / Privacy / Names I saved — active in an `--orchid-lt` pill, radius 99, padding `11px 16px`, 14px/800 `--orchid-dk`), a "Where you are" block with the place in Caslon 18px, then the visibility control **stacked vertically** (sage card, inner surface box radius 12, three rows radius 9, padding `8px 11px`, 12px/800; active `--sage-dk` fill, white) because 206px cannot hold three segments side by side. Your own tag pinned at the bottom: 40px avatar with a `#C462BC` ring, name in Caslon 17px, pronouns 11px `--muted`.
- Centre: header ("7 tags here", title Caslon 48px, "Refresh" pill), board area padding `26px 40px 40px`, positioned box 740 tall. Tags at x/y `(0,0) (240,30) (470,4) (16,348) (248,392) (480,360)`, widths 212/198/206/200/194/204, rotations `0° −6.4° 1.6° 2.8° 0° −2.2°`, photos 76/70/72/70/68/72, names 29/27/28/27/26/28, footer padding `8px 13px`, bio in Caslon 13.5px.
- Right rail 360px, surface, `border-left: 1.5px`: "Selected" — the opened tag as a panel (citron for Priya, 116px photo, name Caslon 40px, tagline Caslon 17px, sticker chips, "visible 12 min"), then "Remember the name" (52px, orchid-dk), and a closing note in 12.5px `--muted`: "Nothing is kept once you leave — no messages, no history. Names you remember stay on your phone."

At desk width the board and the detail panel sit side by side, so selecting a tag never covers the room.

## Keyboard behavior — `15a`, `15b`, `15c`

Three text inputs: name, tagline, party code. Use the **system keyboard**, configured per field. On a 390×812 phone the keyboard occupies ~319px (~276px with the predictive row hidden), which covers anything pinned to the bottom edge.

**The rule: while the keyboard is up, the primary action rides an accessory bar directly above the keys; when the keyboard is dismissed it returns to the bottom edge.** Accessory bar: surface, `border-top: 1.5px --border`, padding `9px 16px 10px`, hint or counter on the left in 11.5px `--muted`, action pill on the right (`--orchid-dk`, radius 99, padding `10px 20px`, 14px/800).

| Field | Capitalization | Autocorrect | Predictive row | Return key |
|---|---|---|---|---|
| Name (`15a`) | words | **off** — autocorrect mangles names | shown | "Next" |
| Tagline (`15b`) | sentences | on | shown | "Done" |
| Party code (`15c`) | **locked to capitals** | off, and no smart punctuation so the hyphen survives | **hidden** | "Join" |

What stays visible:
- `15a` — the tag preview stays under the header, because you are typing onto the thing others will see. The pronoun row still clears the bar; only the tagline field falls under the keys.
- `15b` — pressing Next scrolls the tagline field into view and takes the tag's top edge off screen (~46px clipped). The character counter lives in the accessory bar, since it only matters while typing.
- `15c` — the sheet shrinks to sit above the accessory bar and keyboard, and the consequence sentence moves into the bar so it is still on screen at the moment of commitment.

## Interactions and state

**Navigation.** Three tabs: Nearby, My tag, Privacy. Tapping a tag on the wall opens the detail sheet over the board (a modal sheet on phone and tablet; the right rail on desktop, where nothing is covered).

**Visibility** is the app's central state, and the only three-way control: `invisible | nearby | party_code`. It appears in four places — onboarding step 2, the top of the board, My tag, and the Privacy screen — and must be the same control and the same sage card in all of them.
- `invisible` — your tag leaves the board; the card turns to ink.
- `nearby` — your tag is visible to co-present users.
- `party_code` — opens the code sheet first; takes effect only once a code is entered. While active you see and are seen by code-matching users **only**, and the header label becomes "Visible in party SUMMER-42".
- Visibility switches itself off when you leave the place.

**Other state:** your tag (name, pronouns, tagline, photo, up to three stickers); the nearby list (people, their tags, whether each wrote a bio line, and how long they have been visible); remembered names, stored on the device; the party code when set.

**Data shape used in the mock**, six people sorted nearest-first, each with `name`, `pronouns`, `tagline`, accent `key`, and stickers. Jonas has an empty tagline specifically to exercise the missing-footer case — keep an empty-bio fixture in whatever you build.

**Motion.** Restrained. Sheets rise from the bottom; the tapped tag grows into the sheet keeping its tint and ring so it reads as picking a sticker off the wall. Cards do not animate on the board. No spinners on the board — "Refresh" re-reads the room.

**Empty and error states are not designed yet.** At minimum you will need: nobody nearby, location permission denied, visibility off, and a code that matches nobody. Ask before inventing them.

## Assets

- `assets/ProfilePicture.webp` — placeholder portrait, currently used for **all six people and you**. Replace with real photography before any review; six identical faces make the board read as a template.
- Sticker glyphs are Unicode emoji (🌸 📚 ☕ 🎸 🌈 🍕 🎨 🌍 🌟 🐱 🦄), paired with a word so a tag still reads if the picture does not.
- No icon library. Functional arrows are the plain Unicode `→`.

## Open questions for the product owner

1. **The Privacy screen's claims are unverified.** The first statement is a placeholder. The remaining three assert (a) nothing is retained after you leave, including no record that you were there, (b) remembered names never leave the device and the other person is never notified, and (c) photos are cropped client-side before upload. Each needs engineering sign-off before shipping — ordinary request logs, crash reporting, and analytics all count as a record. Note the copy says photos are "sent", so the app is not purely on-device.
2. **No flow for creating a party code.** `13a` assumes a host tells you a code out loud. Hosting is undesigned.
3. **Empty, error, and permission states** as above.
4. **Tablet height** in the mock is a canvas frame, not a device: verify the board on real iPad dimensions.

## Files in this bundle

| File | What it is |
|---|---|
| `Nametag Redesign.dc.html` | the design canvas — all screens, open in a browser |
| `ios-frame.jsx` | iOS keyboard component used by the `15a`–`15c` keyboard states |
| `support.js`, `image-slot.js` | runtime for the canvas; not part of the app design |
| `_ds/…/colors_and_type.css` | the design tokens listed above |
| `_ds/…/styles.css`, `_ds/…/fonts/fonts.css`, `_ds/…/_ds_bundle.js` | design-system stylesheets and fonts (Libre Caslon Text, Nunito) |
| `assets/ProfilePicture.webp` | placeholder portrait |
