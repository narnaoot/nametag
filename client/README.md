# Nametag — client

React 19 + Vite frontend for Nametag, packaged for iOS with Capacitor 8. The UI
uses the Nabil Arnaoot design system — see [REDESIGN.md](REDESIGN.md) for the
design-system and component details, and the [root README](../README.md) for
the full stack, privacy model, API, and deployment.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173, proxies /api → http://localhost:3001
```

Run the backend separately (see `../server`). The dev proxy is configured in
`vite.config.js`.

## Build

```bash
npm run build    # → dist/
npm run preview  # serve the production build locally
npm run lint     # eslint (should be clean)
```

## Configuration

- **`VITE_API_URL`** — set in `.env.production` for native/hosted builds (e.g.
  `https://nametag.onrender.com/api`). On web, Vercel rewrites `/api` and
  `/uploads/*` to Render (`vercel.json`); on iOS these must be absolute URLs,
  which `src/lib/api.js` derives from `VITE_API_URL`.

## iOS (Capacitor)

The Xcode project (`ios/`) is generated, not committed. To build the native app:

```bash
npm run build
npx cap add ios          # first time only
npx cap sync ios
npx cap open ios         # build & run from Xcode
```

App icon: `public/app-icon.svg` is the master. Generate the iOS icon set with
`@capacitor/assets` after adding the platform — steps in [REDESIGN.md](REDESIGN.md).

## Layout

```
src/
├── App.jsx           # shell, theme wrapper, register→onboarding→nearby flow
├── main.jsx          # entry point, @fontsource imports
├── index.css         # design-system tokens, type roles, primitives
├── auth/             # AuthContext (JWT via @capacitor/preferences) + useAuth hook
├── lib/              # non-UI plumbing:
│   ├── api.js            # fetch wrapper + photoUrl()
│   ├── colors.js         # paintbox/accent + contrast helpers, profile→badge map
│   ├── constants.js      # design tokens, options, field limits
│   ├── imageCrop.js      # on-device square crop before upload
│   └── profileStorage.js # on-device profile + photo persistence
├── components/       # Avatar, Tag, DetailSheet, TabBar, VisibilityControl, …
├── pages/            # AuthPage, OnboardingPage, GridPage (Nearby), ProfilePage (My Tag)
└── hooks/            # useNearbyPeople, useViewport
```
