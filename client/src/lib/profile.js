// profile.js — the client's single source of truth for the profile field-set
// that the server's `PUT /profiles/me` expects, plus the visibility-mode rule.
// The editor (ProfilePage), onboarding (OnboardingPage), and the visibility
// re-upload (useNearbyPeople) all build their request from here, so the client
// contract can't drift between the three call sites.
import { DEFAULT_RADIUS } from './constants';

// Canonical profile fields. Normalises types and applies defaults so every
// caller sends — and persists on-device — the same shape:
//   - tagline / party_code are trimmed
//   - stickers is always a JSON string (accepts an array or an existing string)
//   - radius_meters / always_visible / tag_color fall back to sane defaults
export function normalizeProfileFields(src = {}) {
  const { stickers } = src;
  return {
    display_name: src.display_name ?? '',
    pronouns: src.pronouns ?? '',
    tagline: (src.tagline ?? '').trim(),
    radius_meters: src.radius_meters ?? DEFAULT_RADIUS,
    always_visible: src.always_visible ?? true,
    tag_color: src.tag_color ?? '',
    stickers: typeof stickers === 'string' ? stickers : JSON.stringify(stickers ?? []),
    party_code: (src.party_code ?? '').trim(),
  };
}

// Serialise a fields object (and an optional photo File) to multipart FormData
// for the upload. Multipart is required because of the photo; the browser sets
// its own Content-Type + boundary.
export function toProfileFormData(fields, photoFile) {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
  if (photoFile) fd.append('photo', photoFile);
  return fd;
}

// The three-way visibility mode from a profile's flags: invisible | nearby |
// party. Invisible wins; otherwise a party code means 'party', else 'nearby'.
export function visibilityMode({ alwaysVisible, partyCode }) {
  if (!alwaysVisible) return 'invisible';
  return partyCode ? 'party' : 'nearby';
}
