// Pure helpers for the nametag badge. Kept separate from Badge.jsx so the
// component file only exports components (Fast Refresh requirement).
import { ACCENT_HEX, ACCENT_ORDER } from '../constants';

const hasAccent = (k) => Object.prototype.hasOwnProperty.call(ACCENT_HEX, k);

// Returns a CSS var reference (e.g. "var(--teal)") so the Ink theme's
// deepened paintbox applies automatically wherever the accent is used.
// accentMode: undefined/'rainbow' → per-person; otherwise a forced key.
export function resolveAccent(person, index = 0, accentMode) {
  const key = (!accentMode || accentMode === 'rainbow')
    ? (hasAccent(person?.accent) ? person.accent : ACCENT_ORDER[index % ACCENT_ORDER.length])
    : (hasAccent(accentMode) ? accentMode : 'coral');
  return `var(--${key})`;
}

// First initial of a display name, for monogram avatars.
export function initials(name) {
  const parts = String(name).trim().split(/\s+/);
  return (parts[0]?.[0] || '?').toUpperCase();
}

// Human distance label. null → none · <10 → "here" · <100 → "~N m" · else walk.
export function distanceLabel(d) {
  if (d == null) return null;
  if (d < 10) return 'here';
  if (d < 100) return `~${Math.round(d / 5) * 5} m`;
  return `${Math.max(1, Math.round(d / 80))} min walk`;
}
