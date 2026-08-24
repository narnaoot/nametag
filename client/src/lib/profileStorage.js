// profileStorage.js — on-device persistence helpers for the user's own
// profile, shared by Onboarding and My Tag. The local copy lets the app
// restore the full profile after server-side privacy cleanup (see
// useNearbyPeople.pushProfile).
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import {
  LOCAL_PHOTO_PATH, LOCAL_PROFILE_KEY, LOCAL_REMEMBERED_KEY, LOCAL_HIDDEN_KEY,
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

// ── Remembered names — kept on the device only (a Privacy promise). ────────
async function readList(key) {
  try {
    const { value } = await Preferences.get({ key });
    const arr = value ? JSON.parse(value) : [];
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}
async function writeList(key, arr) {
  try { await Preferences.set({ key, value: JSON.stringify(arr) }); } catch { /* best-effort */ }
}

export function getRememberedNames() { return readList(LOCAL_REMEMBERED_KEY); }

export async function rememberName(person) {
  if (!person?.name) return;
  const list = await readList(LOCAL_REMEMBERED_KEY);
  const key = String(person.id ?? person.name);
  if (list.some(p => String(p.id ?? p.name) === key)) return;
  list.unshift({
    id: person.id ?? null, name: person.name, pronouns: person.pronouns || '',
    tagline: person.tagline || '', at: Date.now(),
  });
  await writeList(LOCAL_REMEMBERED_KEY, list);
}

// ── Hidden people — filtered client-side, remembered on the device. ────────
export function getHiddenIds() { return readList(LOCAL_HIDDEN_KEY); }

export async function hidePerson(id) {
  if (id == null) return;
  const list = await readList(LOCAL_HIDDEN_KEY);
  if (!list.includes(id)) { list.push(id); await writeList(LOCAL_HIDDEN_KEY, list); }
}
