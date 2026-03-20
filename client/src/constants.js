// Brand tokens — keep in sync with @theme in index.css
export const COLOR_BRAND = '#E63946';
export const COLOR_PAGE  = '#f5f5f0';
export const COLOR_INK   = '#1a1a1a';
export const COLOR_DIM   = '#aaa';
export const FONT_CAVEAT = "'Caveat', cursive";

// Capacitor Filesystem path for the user's own profile photo (on-device copy)
export const LOCAL_PHOTO_PATH = 'profile_photo';

// Capacitor Preferences key for the user's full profile data (on-device copy)
export const LOCAL_PROFILE_KEY = 'profile_data';

export const BANNER_COLORS = [
  { hex: '#E63946', label: 'Red' },
  { hex: '#2563EB', label: 'Blue' },
  { hex: '#16A34A', label: 'Green' },
  { hex: '#D97706', label: 'Amber' },
  { hex: '#7C3AED', label: 'Purple' },
  { hex: '#0891B2', label: 'Cyan' },
];

export const BANNER_COLOR_HEXES = BANNER_COLORS.map(c => c.hex);

export const STICKER_OPTIONS = [
  '👋', '🌟', '🎉', '🌈', '🦄', '🐉', '🌸', '🍕',
  '🎸', '📚', '🎨', '🏳️‍🌈', '🏳️‍⚧️', '🌍', '☕', '🤖',
];

export const PRONOUN_OPTIONS = [
  'she/her',
  'he/him',
  'they/them',
  'she/they',
  'he/they',
  'custom',
];

export const NAME_MAX = 40;
export const PRONOUNS_MAX = 30;
export const TAGLINE_MAX = 60;

export const RADIUS_OPTIONS = [
  { label: '50 m (same floor)', value: 50 },
  { label: '100 m (city block) — default', value: 100 },
  { label: '200 m (nearby block)', value: 200 },
  { label: '500 m (neighborhood)', value: 500 },
  { label: '1 km (wider area)', value: 1000 },
];
