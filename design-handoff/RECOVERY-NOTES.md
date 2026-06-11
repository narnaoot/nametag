# Recovery notes — redesign handoff

The redesign handoff was first added to `main` (commit `c42fbb6`, "Add files via
upload") by dropping the unzipped files in loose, rather than as a folder. Because
the original package had nested folders, the flat upload **collided same-named
files and scrambled every filename against its contents** — e.g. the real
`app.jsx` arrived under the name `Monogram.svg`, and two image assets arrived
under `.jsx` names.

This folder is the reconstructed, correctly-named package. Each code file
self-identifies in its first-line header, and the entry point
(`design_files/Nametag Redesign.html`) loads a known set of script names — both
were used to verify the un-shuffle. The two photo assets were identified by
opening them.

## Filename mapping (uploaded name → true file)

| Uploaded as (in `c42fbb6`) | Recovered to |
|---|---|
| `Monogram.svg`     | `design_files/app.jsx` |
| `styles.css`       | `design_files/onboarding.jsx` |
| `screens-app.jsx`  | `design_files/detail-sheet.jsx` |
| `screens-auth.jsx` | `design_files/ios-frame.jsx` |
| `onboarding.jsx`   | `design_files/data.js` |
| `ios-frame.jsx`    | `design_files/badge.jsx` |
| `tweaks-panel.jsx` | `design_files/screens-app.jsx` |
| `app.jsx`          | `design_files/App Icon.html` |
| `CleoInspects.webp`| `design_files/Nametag Redesign.html` (entry point) |
| `data.js`          | `design_files/assets/Monogram.svg` |
| `detail-sheet.jsx` | `design_files/assets/ProfilePicture.webp` (560×373, person) |
| `badge.jsx`        | `design_files/assets/CleoInspects.webp` (200×200, cat) |
| `App Icon.html`    | `README.md` (the handoff doc) |

## Re-supplied separately

Three source files were lost entirely in the collision and were re-supplied by
Nabil directly:

- `design_files/styles.css` — all design tokens, primitives, animations
- `design_files/screens-auth.jsx` — `Wordmark` + `AuthScreen`
- `design_files/tweaks-panel.jsx` — prototype scaffolding (not ported)

The result matches the file list in `README.md` ("Files in `design_files/`").
