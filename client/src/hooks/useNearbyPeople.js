import { useState, useEffect, useCallback, useRef } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { getNearby, updateLocation, setVisibility, getMyProfile, updateProfile } from '../lib/api';
import { LOCAL_PHOTO_PATH, LOCAL_PROFILE_KEY } from '../lib/constants';
import { getHiddenIds, patchLocalProfile } from '../lib/profileStorage';
import {
  normalizeProfileFields, normalizePartyCode, toProfileFormData, visibilityMode, profileSaveSettled,
} from '../lib/profile';

// Derive the three-way visibility mode from a server profile row + live active
// flag: invisible | nearby | party. A missing profile reads as 'nearby'.
function deriveMode(profile, active) {
  if (!profile) return 'nearby';
  return visibilityMode({
    alwaysVisible: profile.always_visible !== false || active,
    partyCode: profile.party_code,
  });
}

// Push the full on-device profile back to the server (name, pronouns, photo,
// stickers, …), optionally overriding visibility fields. Used to restore a
// profile the privacy cleanup cleared, and to switch visibility state.
async function pushProfile(overrides = {}) {
  try {
    const { value } = await Preferences.get({ key: LOCAL_PROFILE_KEY });
    // No on-device copy (a new device or browser): fall back to what the server
    // still holds, so a visibility switch isn't silently dropped.
    const base = value ? JSON.parse(value) : await getMyProfile();
    if (!base) return false;
    const merged = { ...base, ...overrides };
    if (!merged.display_name || !merged.pronouns) return false;

    const fields = normalizeProfileFields(merged);

    let photoFile;
    try {
      const result = await Filesystem.readFile({
        path: LOCAL_PHOTO_PATH, directory: Directory.Data, encoding: Encoding.UTF8,
      });
      const blob = await fetch(result.data).then(r => r.blob());
      photoFile = new File([blob], 'photo.jpg', { type: blob.type });
    } catch { /* no local photo — send without it */ }

    // Also persist the merged fields on-device so future restores keep them.
    await Preferences.set({ key: LOCAL_PROFILE_KEY, value: JSON.stringify(fields) });
    await updateProfile(toProfileFormData(fields, photoFile));
    return true;
  } catch {
    return false;
  }
}

export function useNearbyPeople() {
  const [nearby, setNearby] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [locationErrorKind, setLocationErrorKind] = useState(null); // 'denied' | 'unavailable' | null
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('nearby');
  const [profileChecked, setProfileChecked] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [hiddenIds, setHiddenIds] = useState([]);
  const modeRef = useRef('nearby');   // kept in step with `mode` by applyMode

  const loadHidden = useCallback(async () => { setHiddenIds(await getHiddenIds()); }, []);

  // Set the mode in state AND in the ref at once. Callers that go on to share
  // location right after an await read the ref before React has re-rendered;
  // a stale 'nearby' there would broadcast someone who chose to be invisible.
  const applyMode = useCallback((next) => { modeRef.current = next; setMode(next); }, []);

  const loadMyProfile = useCallback(async () => {
    try {
      await profileSaveSettled();   // don't read past an in-flight My-tag save
      const profile = await getMyProfile();
      setMyProfile(profile);
      setProfileChecked(true);
      if (profile) {
        const active = profile.always_visible || profile.is_active;
        setIsActive(active);
        const derived = deriveMode(profile, active);
        applyMode(derived);
        // Restore fields the privacy cleanup may have cleared — but never
        // while invisible: that would put the name and photo back on the
        // server for someone who asked to be off it.
        if (derived !== 'invisible' && (!profile.display_name || !profile.photo_path)) {
          if (await pushProfile()) {
            const refreshed = await getMyProfile();
            if (refreshed) {
              setMyProfile(refreshed);
              const a2 = refreshed.always_visible || refreshed.is_active;
              setIsActive(a2);
              applyMode(deriveMode(refreshed, a2));
            }
          }
        }
      }
    } catch (err) {
      console.error('[useNearbyPeople] loadMyProfile:', err);
    }
  }, [applyMode]);

  const shareLocation = useCallback(async () => {
    try {
      const perm = await Geolocation.requestPermissions();
      if (perm.location === 'denied') {
        const e = new Error('Location is off, so we can’t place you in the room.');
        e.kind = 'denied';
        throw e;
      }
    } catch (err) {
      if (err.kind === 'denied') throw err;
      // requestPermissions() isn't implemented on web — the browser prompts on
      // getCurrentPosition, so proceed.
    }
    let pos;
    try {
      pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
    } catch (err) {
      // GeolocationPositionError: 1 = denied, 2 = unavailable, 3 = timeout
      const e = new Error(
        err?.code === 1 ? 'Location is off, so we can’t place you in the room.'
          : err?.code === 3 ? 'Couldn’t get your location in time — try again.'
            : 'Couldn’t get your location — try again.'
      );
      e.kind = err?.code === 1 ? 'denied' : 'unavailable';
      throw e;
    }
    await updateLocation(pos.coords.latitude, pos.coords.longitude);
    setLastUpdated(new Date());
  }, []);

  const loadNearby = useCallback(async () => {
    try {
      const people = await getNearby();
      setNearby(people);
    } catch (err) {
      if (err.message === 'Share your location first') {
        setLocationError('Location is off, so we can’t place you in the room.');
        setLocationErrorKind('denied');
      } else {
        console.error('[useNearbyPeople] loadNearby:', err);
      }
    }
  }, []);

  const refresh = useCallback(async () => {
    if (modeRef.current === 'invisible') { setLoading(false); return; }
    setLoading(true);
    try {
      await shareLocation();
      await loadNearby();
      setLocationError(''); setLocationErrorKind(null);
    } catch (err) {
      setLocationError(err.message); setLocationErrorKind(err.kind || 'unavailable');
    } finally {
      setLoading(false);
    }
  }, [shareLocation, loadNearby]);

  // Switch the central visibility state. partyCode required for 'party'.
  const setVisibilityMode = useCallback(async (next, { partyCode } = {}) => {
    applyMode(next);
    try {
      if (next === 'invisible') {
        // Clears the server copy (name, photo, location) and records the
        // choice there; record it on-device too, so My tag and the next launch
        // agree. You stay invisible until you choose otherwise. Don't
        // re-upload the profile here: it would restore what we just deleted.
        await setVisibility(false);
        await patchLocalProfile({ always_visible: false });
        setIsActive(false);
        setNearby([]);
        setMyProfile(prev => (prev ? { ...prev, is_active: false, always_visible: false, photo_path: null } : prev));
      } else {
        const code = next === 'party' ? normalizePartyCode(partyCode) : '';
        await pushProfile({ always_visible: true, party_code: code });
        await shareLocation();
        await loadNearby();
        setIsActive(true);
        setLocationError(''); setLocationErrorKind(null);
        await loadMyProfile();
      }
    } catch (err) {
      setLocationError(err.message); setLocationErrorKind(err.kind || 'unavailable');
    }
  }, [applyMode, shareLocation, loadNearby, loadMyProfile]);

  useEffect(() => {
    async function init() {
      setLoading(true);
      await loadHidden();
      await loadMyProfile();
      if (modeRef.current === 'invisible') { setLoading(false); return; }
      try {
        await shareLocation();
        setLocationError(''); setLocationErrorKind(null);
        await loadNearby();
      } catch (err) {
        setLocationError(err.message); setLocationErrorKind(err.kind || 'unavailable');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [loadHidden, loadMyProfile, shareLocation, loadNearby]);

  // Re-read the room every 60s while visible.
  useEffect(() => {
    const interval = setInterval(async () => {
      if (modeRef.current === 'invisible') return;
      try { await shareLocation(); await loadNearby(); setLocationError(''); setLocationErrorKind(null); }
      catch (err) { setLocationError(err.message); setLocationErrorKind(err.kind || 'unavailable'); }
    }, 60_000);
    return () => clearInterval(interval);
  }, [shareLocation, loadNearby]);

  return {
    nearby, myProfile, profileChecked, locationError, locationErrorKind, loading, isActive, lastUpdated, mode,
    hiddenIds, refresh, setVisibilityMode, reloadProfile: loadMyProfile, reloadHidden: loadHidden,
  };
}
