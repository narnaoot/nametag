// Colour + accent helpers for the redesign.
//
// Two rules: your own tag is always CORAL; everyone else takes a stable
// identity colour from PERSON_ACCENTS. Orchid (the app) and teal (clashes with
// the sage visibility card) are remapped out via ACCENT_REMAP.
import {
  ACCENT_VARS, ACCENT_REMAP, PERSON_ACCENTS,
} from './constants';
import { photoUrl } from './api';

// Stable string hash → non-negative int, for deriving a per-person colour.
function hash(str) {
  let h = 0;
  const s = String(str || '');
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// Resolve a person to a paintbox key. Everyone can pick their own colour, so a
// stored tag_color wins (orchid maps to citron — orchid is the app's). With no
// choice, you default to coral and everyone else gets a stable colour derived
// from their identity, so the same person always looks the same.
export function resolveAccentKey(person, index = 0) {
  const stored = person?.accent;
  if (stored) {
    const remapped = ACCENT_REMAP[stored] || stored;
    if (ACCENT_VARS[remapped] && remapped !== 'orchid') return remapped;
  }
  if (person?.you) return 'coral';
  const seed = person?.id != null ? String(person.id) : (person?.name || String(index));
  return PERSON_ACCENTS[hash(seed) % PERSON_ACCENTS.length];
}

// A paintbox key → { hue, tint, deep } as CSS-var references.
export function accentTrio(key) {
  const v = ACCENT_VARS[key] || ACCENT_VARS.coral;
  return { hue: `var(${v.hue})`, tint: `var(${v.lt})`, deep: `var(${v.dk})` };
}

// Convenience: resolve a person straight to their trio.
export function personTrio(person, index = 0) {
  return accentTrio(resolveAccentKey(person, index));
}

// First initial, for the no-photo fallback avatar.
export function initials(name) {
  const parts = String(name || '').trim().split(/\s+/);
  return (parts[0]?.[0] || '?').toUpperCase();
}

// "visible 12 min" — the only honest number left on a tag (distance is gone,
// because everyone here is within a room's width). Derived from when the
// person's location was last refreshed.
export function visibleMinutes(since) {
  if (!since) return null;
  const t = typeof since === 'number' ? since : Date.parse(since);
  if (Number.isNaN(t)) return null;
  return Math.max(0, Math.floor((Date.now() - t) / 60000));
}

export function visibleLabel(since) {
  const m = visibleMinutes(since);
  if (m == null) return null;
  if (m < 1) return 'visible just now';
  if (m < 60) return `visible ${m} min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem ? `visible ${h} hr ${rem} min` : `visible ${h} hr`;
}

// ── Server profile row → tag "person" shape ───────────────────────────────
// { id, name, pronouns, tagline, accent (paintbox key), stickers[], photo,
//   visibleSince, you }. Distance and waves are gone in the redesign.
export function toBadgePerson(profile, { selfPhoto, you = false } = {}) {
  if (!profile) return null;
  let stickers = [];
  try { stickers = profile.stickers ? JSON.parse(profile.stickers) : []; } catch { stickers = []; }
  return {
    id: profile.id ?? (you ? 'you' : undefined),
    name: profile.display_name || '',
    pronouns: profile.pronouns || '',
    tagline: profile.tagline || '',
    accent: profile.tag_color || null,
    stickers,
    photo: selfPhoto || (profile.photo_path ? photoUrl(profile.photo_path) : null),
    visibleSince: profile.location_updated_at || null,
    you,
  };
}
