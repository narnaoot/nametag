// profileSync.js — the two ways a tag travels between this device and the
// server. The device holds the lasting copy; the server holds one only while
// you're visible (it is wiped when you go invisible or go stale). Every screen
// that writes a tag goes through here, so that rule lives in one place.
import { getMyProfile, updateProfile, setVisibility } from './api';
import { normalizeProfileFields, toProfileFormData, stampPartyCode } from './profile';
import { persistProfileLocally, readLocalProfile, loadLocalPhotoFile } from './profileStorage';

// Save an edited tag (My tag, onboarding). `fields` come from
// normalizeProfileFields; `photoFile` is a newly picked photo, if any.
//   visible            → send it to the server
//   invisible          → keep it on the device only: sending it would put the
//                        name and photo back on the server for someone who
//                        asked to be off it
//   invisible, no row  → create the row so the choice is recorded, then take
//                        the tag straight back off the server
export async function saveProfile(edited, photoFile, { serverHasRow = true } = {}) {
  const fields = stampPartyCode(edited, await readLocalProfile());
  if (fields.always_visible) {
    await updateProfile(toProfileFormData(fields, photoFile));
  } else if (!serverHasRow) {
    await updateProfile(toProfileFormData(fields));
    await setVisibility(false);
  }
  await persistProfileLocally(fields);
}

// Put the on-device tag (with its photo) back on the server, optionally
// overriding fields — used to restore a tag the privacy cleanup cleared and to
// switch visibility from the wall. With no on-device copy (a new device) it
// falls back to what the server still holds, so a switch isn't silently
// dropped. Returns false when there's no usable tag to send.
export async function pushProfile(overrides = {}) {
  try {
    const base = (await readLocalProfile()) ?? (await getMyProfile());
    if (!base) return false;
    const merged = { ...base, ...overrides };
    if (!merged.display_name || !merged.pronouns) return false;

    const fields = stampPartyCode(normalizeProfileFields(merged), base);
    await persistProfileLocally(fields);
    await updateProfile(toProfileFormData(fields, await loadLocalPhotoFile()));
    return true;
  } catch {
    return false;
  }
}
