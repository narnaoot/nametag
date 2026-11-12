// profileStorage.js — on-device persistence helpers for the user's own
// profile, shared by Onboarding and My Tag. Your own tag is the only thing the
// app keeps on the device (besides the sign-in token) — nothing about other people. The local copy lets the app
// restore the full profile after server-side privacy cleanup (see
// useNearbyPeople.pushProfile).
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import {
  LOCAL_PHOTO_PATH, LOCAL_PROFILE_KEY, RETIRED_LOCAL_KEYS,
} from './constants';

export async function savePhotoLocally(dataUrl) {
  try {
    await Filesystem.writeFile({
      path: LOCAL_PHOTO_PATH,
      data: dataUrl,
      directory: Directory.Data,
      encoding: Encoding.UTF8,
    });
  } catch { /* best-effort */ }
}

export async function loadLocalPhoto() {
  try {
    const result = await Filesystem.readFile({
      path: LOCAL_PHOTO_PATH,
      directory: Directory.Data,
      encoding: Encoding.UTF8,
    });
    return result.data; // data URL string
  } catch {
    return null;
  }
}

// The on-device photo as an uploadable File, or undefined when there isn't one.
export async function loadLocalPhotoFile() {
  const dataUrl = await loadLocalPhoto();
  if (!dataUrl) return undefined;
  try {
    const blob = await fetch(dataUrl).then(r => r.blob());
    return new File([blob], 'photo.jpg', { type: blob.type });
  } catch { return undefined; }
}

// Persists the profile fields (NOT the photo binary) to Preferences so the
// hook can re-upload them if the server copy is cleaned up.
export async function persistProfileLocally(fields) {
  try {
    await Preferences.set({ key: LOCAL_PROFILE_KEY, value: JSON.stringify(fields) });
  } catch { /* best-effort */ }
}

export async function readLocalProfile() {
  try {
    const { value } = await Preferences.get({ key: LOCAL_PROFILE_KEY });
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

// Merge a few fields into the on-device profile (no-op if there isn't one).
export async function patchLocalProfile(patch) {
  const current = await readLocalProfile();
  if (current) await persistProfileLocally({ ...current, ...patch });
}

// ── Whose data is on this device ───────────────────────────────────────────
// The on-device tag and photo belong to one account. Record which, so signing in as someone else on the same device
// starts clean instead of inheriting the previous person's tag.
const LOCAL_OWNER_KEY = 'profile_owner';

export async function clearLocalData() {
  try { await Filesystem.deleteFile({ path: LOCAL_PHOTO_PATH, directory: Directory.Data }); } catch { /* none */ }
  for (const key of [LOCAL_PROFILE_KEY, LOCAL_OWNER_KEY]) {
    try { await Preferences.remove({ key }); } catch { /* best-effort */ }
  }
  await purgeRetiredData();
}

// Delete what removed features left behind (saved names, hidden people). Run on
// every launch, so those lists disappear from devices that still hold them.
export async function purgeRetiredData() {
  for (const key of RETIRED_LOCAL_KEYS) {
    try { await Preferences.remove({ key }); } catch { /* best-effort */ }
  }
}

// Call when a session starts (sign-in or app launch with a stored token).
// `fresh` = an explicit sign-in: on-device data with no recorded owner can't be
// trusted to be this account's, so it's cleared too.
export async function claimLocalData(userId, { fresh = false } = {}) {
  if (userId == null) return;
  const id = String(userId);
  try {
    const { value: owner } = await Preferences.get({ key: LOCAL_OWNER_KEY });
    if (owner ? owner !== id : fresh) await clearLocalData();
    await Preferences.set({ key: LOCAL_OWNER_KEY, value: id });
  } catch { /* best-effort */ }
}
