// Color + accent helpers ported from the design handoff (app.jsx + badge.jsx).
import { PAINTBOX, ACCENT_ORDER } from './constants';
import { photoUrl } from './api';

// ── Contrast helper (ported from app.jsx lum/bestOn) ──────────────────────
// --on-primary is computed from the active primary's relative luminance so
// overlaid text always has enough contrast. Bright accents (mustard) land on
// dark ink; the rest land on white — decided by the math, not by hand.
export function lum(hex) {
  const c = hex.replace('#', '');
  const ch = (i) => {
    const x = parseInt(c.slice(i, i + 2), 16) / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * ch(0) + 0.7152 * ch(2) + 0.0722 * ch(4);
}

export function bestOn(hex) {
  const L = lum(hex);
  const onWhite = 1.05 / (L + 0.05);
  const onDark = (L + 0.05) / (lum('#23170E') + 0.05);
  return onWhite >= onDark ? '#FFFFFF' : '#23170E';
}

// ── Accent resolution ─────────────────────────────────────────────────────
// Returns a CSS var reference (e.g. "var(--teal)") so the Ink theme's deepened
// paintbox applies automatically wherever the accent is used. Per-person
// "mixed" mode: use the person's own accent key, falling back to a stable
// per-index paintbox color when their key is missing/legacy.
export function resolveAccent(person, index = 0) {
  const key = person?.accent && PAINTBOX[person.accent]
    ? person.accent
    : ACCENT_ORDER[index % ACCENT_ORDER.length];
  return `var(--${key})`;
}

// First initial for the monogram avatar.
export function initials(name) {
  const parts = String(name || '').trim().split(/\s+/);
  return (parts[0]?.[0] || '?').toUpperCase();
}

// ── Distance label (ported from badge.jsx distanceLabel) ──────────────────
export function distanceLabel(d) {
  if (d == null) return null;
  if (d < 10) return 'here';
  if (d < 100) return `~${Math.round(d / 5) * 5} m`;
  return `${Math.max(1, Math.round(d / 80))} min walk`;
}

// ── Server profile → badge person shape ───────────────────────────────────
// Maps the app's profile rows (display_name, tag_color, stickers JSON, …) onto
// the design's person shape ({ name, accent, stickers[], photo, distance }).
export function toBadgePerson(profile, { selfPhoto, you = false } = {}) {
  if (!profile) return null;
  let stickers = [];
  try { stickers = profile.stickers ? JSON.parse(profile.stickers) : []; } catch { stickers = []; }
  return {
    id: profile.id ?? (you ? 'you' : undefined),
    name: profile.display_name || '',
    pronouns: profile.pronouns || '',
    tagline: profile.tagline || '',
    accent: profile.tag_color || null, // paintbox key stored in tag_color
    stickers,
    photo: selfPhoto || (profile.photo_path ? photoUrl(profile.photo_path) : null),
    distance: profile.distance_meters ?? (you ? 0 : null),
    wavedAtYou: !!profile.wavedAtYou,
    you,
  };
}
