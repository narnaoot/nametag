// useTagEditor.js — everything about editing your own tag on My tag: loading it
// (device first, then the server), the edits, the photo, and saving. The page
// itself is only layout.
//
// Saving: every edit schedules a save AUTOSAVE_DELAY_MS later, so typing doesn't
// send a request per keystroke. Leaving the page saves any edit still waiting
// (Done waits for it and stays put if the tag can't be saved; a tab switch saves
// it quietly). Saves run one at a time, in order (queueProfileSave), so an older
// edit can never land on the server after a newer one — or after "go invisible".
import { useState, useEffect, useRef, useCallback } from 'react';
import { getMyProfile, photoUrl, setVisibility } from '../lib/api';
import { loadLocalPhoto, readLocalProfile, persistProfileLocally } from '../lib/profileStorage';
import { preparePickedPhoto } from '../lib/imageCrop';
import { normalizeProfileFields, queueProfileSave, isPartyExpired } from '../lib/profile';
import { saveProfile } from '../lib/profileSync';
import {
  PRONOUN_OPTIONS, NAME_MAX, PRONOUNS_MAX, TAGLINE_MAX, DEFAULT_RADIUS, TAG_COLORS,
} from '../lib/constants';

const AUTOSAVE_DELAY_MS = 700;

// The editor's view of a tag. Pronouns are kept as the chip that's chosen plus
// whatever was typed for "custom".
const BLANK = {
  name: '', pronounChoice: 'they/them', customPronouns: '', tagline: '',
  radius: DEFAULT_RADIUS, color: 'coral', visible: true, partyCode: '', stickers: [],
};
const PRESET_PRONOUNS = PRONOUN_OPTIONS.filter(p => p !== 'custom');

export const pronounsOf = (tag) => (tag.pronounChoice === 'custom' ? tag.customPronouns.trim() : tag.pronounChoice);

// A stored profile (on the device or from the server) → the editor's shape.
function fromProfile(src) {
  const preset = PRESET_PRONOUNS.includes(src.pronouns);
  let stickers = [];
  try { stickers = src.stickers ? JSON.parse(src.stickers) : []; } catch { /* keep none */ }
  return {
    name: src.display_name || '',
    pronounChoice: preset ? src.pronouns : 'custom',
    customPronouns: preset ? '' : (src.pronouns || ''),
    tagline: src.tagline || '',
    radius: src.radius_meters || DEFAULT_RADIUS,
    color: TAG_COLORS.includes(src.tag_color) ? src.tag_color : 'coral',
    visible: src.always_visible !== false,
    partyCode: src.party_code || '',
    stickers: Array.isArray(stickers) ? stickers : [],
  };
}

// The editor's shape → the fields the server and the device store.
function toFields(tag) {
  return normalizeProfileFields({
    display_name: tag.name.trim(), pronouns: pronounsOf(tag), tagline: tag.tagline,
    radius_meters: tag.radius, always_visible: tag.visible, tag_color: tag.color,
    stickers: tag.stickers, party_code: tag.partyCode,
  });
}

// Why a tag can't be saved, in words — or '' when it can.
function problemWith(tag) {
  const name = tag.name.trim();
  const pronouns = pronounsOf(tag);
  if (!name || !pronouns) return 'Add your name and pronouns.';
  if (name.length > NAME_MAX) return `Name must be ${NAME_MAX} characters or fewer.`;
  if (pronouns.length > PRONOUNS_MAX) return `Pronouns must be ${PRONOUNS_MAX} characters or fewer.`;
  if (tag.tagline.trim().length > TAGLINE_MAX) return `One line must be ${TAGLINE_MAX} characters or fewer.`;
  return '';
}

export function useTagEditor() {
  const [tag, setTag] = useState(BLANK);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [status, setStatus] = useState('loading');   // loading | idle | saving | saved
  const [error, setError] = useState('');

  // The newest version of the tag (render state lags behind by a tick), a
  // picked photo not yet uploaded, the pending auto-save (set = an edit is
  // waiting), and whether the server already has a row for this account.
  const latest = useRef(BLANK);
  const newPhoto = useRef(null);
  const timer = useRef(null);
  const serverHasRow = useRef(false);

  const apply = useCallback((patch) => {
    latest.current = { ...latest.current, ...patch };
    setTag(latest.current);
  }, []);

  // Save the newest version now. `silent` = an auto-save: don't nag about a
  // half-typed tag. Resolves to whether it was saved.
  const saveNow = useCallback(async ({ silent = false } = {}) => {
    clearTimeout(timer.current);
    timer.current = null;
    const current = latest.current;
    const problem = problemWith(current);
    if (problem) { if (!silent) setError(problem); return false; }

    const photo = newPhoto.current;
    setError(''); setStatus('saving');
    try {
      // While invisible this keeps the tag on the device only (see saveProfile).
      await queueProfileSave(() => saveProfile(toFields(current), photo, { serverHasRow: serverHasRow.current }));
      serverHasRow.current = true;
      if (newPhoto.current === photo) newPhoto.current = null;   // sent (or kept on the device): not again
      setStatus('saved');
      setTimeout(() => setStatus(s => (s === 'saved' ? 'idle' : s)), 2000);
      return true;
    } catch (err) {
      setError(err.message); setStatus('idle');
      return false;
    }
  }, []);

  const scheduleSave = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => saveNow({ silent: true }), AUTOSAVE_DELAY_MS);
  }, [saveNow]);

  // An edit from the page: show it, and save it shortly.
  const edit = useCallback((patch) => { apply(patch); scheduleSave(); }, [apply, scheduleSave]);

  // The visibility control. Going invisible also deletes the server's copy
  // straight away (name, photo, location, party code) and records the choice.
  const setVisibilityMode = useCallback((mode, { partyCode = '' } = {}) => {
    if (mode === 'invisible') {
      edit({ visible: false, partyCode: '' });
      queueProfileSave(() => setVisibility(false)).catch(() => {});
    } else {
      edit({ visible: true, partyCode });
    }
  }, [edit]);

  const pickPhoto = useCallback(async (file) => {
    try {
      const { dataUrl, file: prepared } = await preparePickedPhoto(file);
      setPhotoPreview(dataUrl);
      newPhoto.current = prepared;
      setError('');
      scheduleSave();
    } catch {
      setError('We couldn’t read that photo — try a different one.');
    }
  }, [scheduleSave]);

  // Leaving with Done: save an edit that's still waiting. False = stay on the
  // page so the problem can be shown.
  const finish = useCallback(async () => (timer.current ? saveNow() : true), [saveNow]);

  // Leaving any other way (a tab switch): save a waiting edit quietly.
  useEffect(() => () => { if (timer.current) saveNow({ silent: true }); }, [saveNow]);

  // Load: the device's copy first (instant, and the lasting one), then the
  // server's, which is the authority only on visibility. Loading never saves.
  useEffect(() => {
    (async () => {
      const localPhoto = await loadLocalPhoto();
      if (localPhoto) setPhotoPreview(localPhoto);

      let local = await readLocalProfile();
      if (isPartyExpired(local)) {
        // The party code ran out while the app was away: the party is over, so
        // come off the wall (as the wall and the server do).
        local = { ...local, always_visible: false, party_code: '', party_code_set_at: '' };
        await persistProfileLocally(local);
        queueProfileSave(() => setVisibility(false)).catch(() => {});
      }
      if (local) apply(fromProfile(local));
      setStatus('idle');

      try {
        const server = await getMyProfile();
        if (!server) return;
        serverHasRow.current = true;
        // Visibility may have changed on the wall or on another device.
        apply(local ? { visible: server.always_visible !== false } : fromProfile(server));
        if (server.photo_path && !localPhoto) setPhotoPreview(photoUrl(server.photo_path));
      } catch {
        if (!local) setError('Couldn’t load your tag. Pull to refresh.');
      }
    })();
  }, [apply]);

  return {
    tag, edit, setVisibilityMode, photoPreview, pickPhoto, finish, error,
    ready: status !== 'loading', saving: status === 'saving', saved: status === 'saved',
  };
}
