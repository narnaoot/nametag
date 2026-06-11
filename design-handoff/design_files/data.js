// data.js — seed people for the Nearby grid (global: window.NAMETAG_DATA)
// Accents are paintbox keys; avatars are initial-monograms except `you`.

window.NAMETAG_DATA = {
  you: {
    id: 'you',
    name: 'Nabil',
    pronouns: 'he/him',
    tagline: 'Curious about almost everything',
    accent: 'teal',
    stickers: ['📚', '🐱'],
    photo: 'assets/ProfilePicture.webp',
    distance: 0,
    you: true,
  },
  people: [
    { id: 1, name: 'Marisol',  pronouns: 'she/her',   tagline: 'Always chasing good light',  accent: 'teal',     stickers: ['📷', '🌸'], distance: 8,  wavedAtYou: true },
    { id: 2, name: 'Devin',    pronouns: 'he/him',    tagline: 'Here mostly for the coffee', accent: 'mustard',  stickers: ['☕', '📚'], distance: 21 },
    { id: 3, name: 'Priya',    pronouns: 'she/they',  tagline: 'Building tiny robots',       accent: 'lavender', stickers: ['🤖', '🎨'], distance: 34 },
    { id: 4, name: 'Theo',     pronouns: 'he/they',   tagline: 'Ask me about ferments',      accent: 'rose',     stickers: ['🍕', '🌍'], distance: 47 },
    { id: 5, name: 'Amara',    pronouns: 'they/them', tagline: 'Plant parent, loud laugher', accent: 'coral',    stickers: ['🌈', '🎉'], distance: 60 },
    { id: 6, name: 'Jonas',    pronouns: 'he/him',    tagline: 'Vinyl and very long walks',  accent: 'teal',     stickers: ['🎸'],       distance: 130 },
    { id: 7, name: 'Yuki',     pronouns: 'she/her',   tagline: 'Sketching strangers, kindly',accent: 'mustard',  stickers: ['🎨', '🌟'], distance: 210 },
  ],
};

// Paintbox lookup (hex). Mirrors colors_and_type.css.
window.NAMETAG_ACCENTS = {
  coral:    '#FF4733',
  teal:     '#06D6B8',
  mustard:  '#FFB300',
  rose:     '#FF3D9A',
  lavender: '#A86BFF',
};

// Deepened variants for the Ink theme — same hues, less glow on dark.
window.NAMETAG_ACCENTS_INK = {
  coral:    '#E04330',
  teal:     '#0ABFA6',
  mustard:  '#E0A000',
  rose:     '#E83387',
  lavender: '#955EE8',
};
window.NAMETAG_ACCENT_ORDER = ['coral', 'teal', 'mustard', 'rose', 'lavender'];
