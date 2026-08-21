// Design tokens — keep in sync with the :root block in index.css.
// The redesign has two colour rules: ORCHID is the app (chrome), CORAL is you
// (your own tag, always). Other people take an identity colour from the
// paintbox — see PERSON_ACCENTS and ACCENT_REMAP below.

// Every paintbox key. Each resolves to a CSS-var trio (--key / --key-lt /
// --key-dk) declared in index.css. Bright hue = lines/rings, -lt = tint fill,
// -dk = readable text.
export const PAINTBOX_KEYS = [
  'coral', 'lavender', 'mustard', 'sage', 'denim', 'blush', 'citron', 'orchid', 'teal',
];

// The -lt / -dk suffixes are irregular for a few keys, so map each paintbox key
// to its actual CSS-var trio.
export const ACCENT_VARS = {
  coral:    { hue: '--coral',    lt: '--coral-lt',  dk: '--coral-dk' },
  lavender: { hue: '--lavender', lt: '--lav-lt',    dk: '--lav-dk' },
  mustard:  { hue: '--mustard',  lt: '--must-lt',   dk: '--must-dk' },
  sage:     { hue: '--sage',     lt: '--sage-lt',   dk: '--sage-dk' },
  denim:    { hue: '--denim',    lt: '--denim-lt',  dk: '--denim-dk' },
  blush:    { hue: '--blush',    lt: '--blush-lt',  dk: '--blush-dk' },
  citron:   { hue: '--citron',   lt: '--citron-lt', dk: '--citron-dk' },
  orchid:   { hue: '--orchid',   lt: '--orchid-lt', dk: '--orchid-dk' },
  teal:     { hue: '--teal',     lt: '--teal-lt',   dk: '--teal-dk' },
};

// Colours a person can choose for their own tag. Coral is the default (and was
// once reserved for "you"); orchid is left out because it's the app's own
// colour. Everything else in the paintbox is fair game.
export const TAG_COLORS = ['coral', 'lavender', 'mustard', 'sage', 'denim', 'blush', 'citron', 'teal'];

// When someone hasn't chosen a colour, other people are auto-assigned one of
// these (a stable hash of their id), so the board stays varied.
export const PERSON_ACCENTS = ['lavender', 'citron', 'mustard', 'denim', 'blush', 'sage'];

// Orchid belongs to the app, so any stored/legacy orchid tag maps to citron.
export const ACCENT_REMAP = { orchid: 'citron' };

// The brightened orchid used for display-size accent words + your avatar ring.
export const BRAND_ACCENT = '#C462BC';

// Capacitor Filesystem path for the user's own profile photo (on-device copy).
export const LOCAL_PHOTO_PATH = 'profile_photo';
// Capacitor Preferences key for the user's full profile data (on-device copy).
export const LOCAL_PROFILE_KEY = 'profile_data';
// Names you remember are kept on the device only (Privacy screen promises this).
export const LOCAL_REMEMBERED_KEY = 'remembered_names';
// People you hide from are filtered client-side, persisted on the device.
export const LOCAL_HIDDEN_KEY = 'hidden_people';

// Stickers are Unicode emoji paired with a word, so a tag reads if the picture
// doesn't. Selection is stored as an array of emoji (compatible with the
// existing `stickers` JSON column); the word is looked up for display.
export const STICKER_OPTIONS = [
  { emoji: '🌸', word: 'quiet morning' },
  { emoji: '📚', word: 'reading' },
  { emoji: '☕', word: 'coffee' },
  { emoji: '🎸', word: 'playing tonight' },
  { emoji: '🌈', word: 'new in town' },
  { emoji: '🍕', word: 'hungry' },
  { emoji: '🎨', word: 'sketching' },
  { emoji: '🌍', word: 'wandering' },
  { emoji: '🌟', word: 'first time here' },
  { emoji: '🐱', word: 'cat person' },
  { emoji: '🦄', word: 'unicorn' },
];

export const STICKER_LABELS = Object.fromEntries(
  STICKER_OPTIONS.map(s => [s.emoji, s.word])
);

export const MAX_STICKERS = 3;

// Party code: "six to ten characters. Capitals and hyphens don't matter."
export const PARTY_CODE_MIN = 6;
export const PARTY_CODE_MAX = 10;

export const PRONOUN_OPTIONS = [
  'she/her', 'he/him', 'they/them', 'she/they', 'he/they', 'custom',
];

// Onboarding step 1 offers the single-select set + "write my own".
export const ONBOARDING_PRONOUNS = ['she/her', 'he/him', 'they/them', 'she/they'];

export const NAME_MAX = 40;
export const ONBOARDING_NAME_MAX = 24;
export const PRONOUNS_MAX = 30;
export const TAGLINE_MAX = 60;

// No venue lookup yet — the mock's "Ritual Coffee" becomes a generic label.
export const PLACE_FALLBACK = 'nearby';

// Radius is no longer a visible control in the redesign (My tag shows only
// Name / One line / Stickers). Kept as a stored default so the backend query
// still works.
export const DEFAULT_RADIUS = 100;
