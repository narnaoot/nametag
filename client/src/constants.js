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

export const RADIUS_OPTIONS = [
  { label: '50 m (same floor)', value: 50 },
  { label: '100 m (city block) — default', value: 100 },
  { label: '200 m (nearby block)', value: 200 },
  { label: '500 m (neighborhood)', value: 500 },
  { label: '1 km (wider area)', value: 1000 },
];
