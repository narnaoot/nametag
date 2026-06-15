// Design tokens — keep in sync with the @theme / :root block in index.css.

// ── The paintbox (per-person badge accents) ──────────────────────────────
// Cream-theme hex values. Each person has an `accent` key; badges tint to it.
export const PAINTBOX = {
  coral:    '#FF4733',
  teal:     '#06D6B8',
  mustard:  '#FFB300',
  rose:     '#FF3D9A',
  lavender: '#A86BFF',
};

// The Ink theme's deepened paintbox + the semantic success green (--sage) live
// in index.css (.theme-ink / :root) as the single source of truth — they're
// applied via CSS vars, so there's no JS mirror to keep in sync here.

// Canonical order for swatch rows and rainbow fallback.
export const ACCENT_ORDER = ['coral', 'teal', 'mustard', 'rose', 'lavender'];

// Brand default: teal leads all chrome.
export const COLOR_PRIMARY = PAINTBOX.teal;

// Capacitor Filesystem path for the user's own profile photo (on-device copy)
export const LOCAL_PHOTO_PATH = 'profile_photo';

// Capacitor Preferences key for the user's full profile data (on-device copy)
export const LOCAL_PROFILE_KEY = 'profile_data';

export const STICKER_OPTIONS = [
  '👋', '🌟', '🎉', '🌈', '🦄', '🐉', '🌸', '🍕',
  '🎸', '📚', '🎨', '🌍', '☕', '🤖', '🐱', '🐶',
];

export const MAX_STICKERS = 3;

export const PARTY_CODE_MAX = 20;

export const PRONOUN_OPTIONS = [
  'she/her',
  'he/him',
  'they/them',
  'she/they',
  'he/they',
  'custom',
];

// Onboarding offers the single-select set without the "custom" affordance.
export const ONBOARDING_PRONOUNS = ['she/her', 'he/him', 'they/them', 'she/they', 'he/they'];

export const NAME_MAX = 40;
export const ONBOARDING_NAME_MAX = 20;
export const PRONOUNS_MAX = 30;
export const TAGLINE_MAX = 60;

export const RADIUS_OPTIONS = [
  { value: 50,   label: '50 m · same floor' },
  { value: 100,  label: '100 m · a city block' },
  { value: 200,  label: '200 m · nearby blocks' },
  { value: 500,  label: '500 m · the neighborhood' },
  { value: 1000, label: '1 km · wider area' },
];
