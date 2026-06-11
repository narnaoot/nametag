// Design tokens — Nabil Arnaoot design system.
// Keep in sync with the token layer in index.css (@theme + :root/.theme-ink).

// ── Theme surfaces + text ──────────────────────────────────
// Cream is the default; Ink is the dark variant (deepened paintbox).
export const THEME_CREAM = {
  bg: '#FFFBF5', surface: '#FFFFFF', warm: '#FFF5E8', warm2: '#FDECD6',
  text: '#3D2B1F', muted: '#9A8070', border: '#E8DDD0', field: '#FFFFFF',
};
export const THEME_INK = {
  bg: '#271B12', surface: '#33251A', warm: '#3C2C20', warm2: '#46342650',
  text: '#FBF0E2', muted: '#C2A892', border: '#503D2D', field: '#2C2018',
};

// ── The paintbox ───────────────────────────────────────────
// Five brand accents; each person's badge tints to one. Ink uses deepened
// variants (same key). Canonical order matters — swatch rows + default
// assignment follow it. A bright green was deliberately dropped (too close
// to teal); rose fills the magenta gap. Green survives only as semantic
// success (COLOR_SAGE), never as a badge accent.
export const PAINTBOX = [
  { key: 'coral',    cream: '#FF4733', ink: '#E04330', label: 'Coral'    },
  { key: 'teal',     cream: '#06D6B8', ink: '#0ABFA6', label: 'Teal'     },
  { key: 'mustard',  cream: '#FFB300', ink: '#E0A000', label: 'Mustard'  },
  { key: 'rose',     cream: '#FF3D9A', ink: '#E83387', label: 'Rose'     },
  { key: 'lavender', cream: '#A86BFF', ink: '#955EE8', label: 'Lavender' },
];
export const ACCENT_ORDER = PAINTBOX.map(p => p.key);
export const ACCENT_HEX = Object.fromEntries(PAINTBOX.map(p => [p.key, p.cream]));

// ── Semantic colors (NOT paintbox accents) ─────────────────
export const COLOR_SAGE    = '#2ED573'; // success: wave sent / visible / saved
export const COLOR_DANGER  = '#FF5C47'; // destructive only (delete account)
export const COLOR_PRIMARY = ACCENT_HEX.teal; // brand — leads all chrome

// ── Type ───────────────────────────────────────────────────
export const FONT_DISPLAY = "'Playfair Display', Georgia, serif";
export const FONT_BODY    = "'Nunito', system-ui, -apple-system, sans-serif";

// ── Contrast helper ────────────────────────────────────────
// --on-primary is computed from the active primary's luminance: bright
// accents (mustard/sage) need dark text; teal/coral/lavender need white.
// Port this anywhere a paintbox color is a filled background with text on top.
const ON_PRIMARY_DARK  = '#23170E';
const ON_PRIMARY_LIGHT = '#FFFFFF';
export function lum(hex) {
  const h = String(hex).replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, c => c + c) : h.padEnd(6, '0');
  const n = parseInt(x.slice(0, 6), 16);
  if (Number.isNaN(n)) return 1;
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}
export function bestOn(hex) {
  return lum(hex) > 0.55 ? ON_PRIMARY_DARK : ON_PRIMARY_LIGHT;
}

// ── Back-compat aliases (existing pages still import these) ──
export const COLOR_BRAND = COLOR_PRIMARY;   // teal now leads (was red)
export const COLOR_PAGE  = THEME_CREAM.bg;
export const COLOR_INK   = THEME_CREAM.text;
export const COLOR_DIM   = THEME_CREAM.muted;
export const FONT_CAVEAT = FONT_DISPLAY;    // transitional: serif display

// Banner/accent color picker — now the paintbox (green dropped, rose added).
export const BANNER_COLORS = PAINTBOX.map(p => ({ hex: p.cream, label: p.label, key: p.key }));
export const BANNER_COLOR_HEXES = BANNER_COLORS.map(c => c.hex);

// ── App constants (unchanged) ──────────────────────────────
// Capacitor Filesystem path for the user's own profile photo (on-device copy)
export const LOCAL_PHOTO_PATH = 'profile_photo';

// Capacitor Preferences key for the user's full profile data (on-device copy)
export const LOCAL_PROFILE_KEY = 'profile_data';

export const STICKER_OPTIONS = [
  '👋', '🌟', '🎉', '🌈', '🦄', '🐉', '🌸', '🍕',
  '🎸', '📚', '🎨', '🏳️‍🌈', '🏳️‍⚧️', '🌍', '☕', '🤖',
  '🐱', '🐶',
];

export const PARTY_CODE_MAX = 20;

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
