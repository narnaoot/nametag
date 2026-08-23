import { useState, useEffect, useCallback, useRef } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { getNearby, updateLocation, setVisibility, getMyProfile, updateProfile } from '../api';
import { LOCAL_PHOTO_PATH, LOCAL_PROFILE_KEY, DEFAULT_RADIUS } from '../constants';
import { getHiddenIds } from '../profileStorage';

// Derive the three-way visibility mode from a server profile row + live active
// flag: invisible | nearby | party.
function deriveMode(profile, active) {
  const visible = profile ? (profile.always_visible !== false || active) : true;
  if (!visible) return 'invisible';
  return profile?.party_code ? 'party' : 'nearby';
}

// Push the full on-device profile back to the server (name, pronouns, photo,
// stickers, …), optionally overriding visibility fields. Used to restore a
// profile the privacy cleanup cleared, and to switch visibility state.
async function pushProfile(overrides = {}) {
  try {
    const { value } = await Preferences.get({ key: LOCAL_PROFILE_KEY });
    if (!value) return false;
    const p = JSON.parse(value);
    const merged = { ...p, ...overrides };
    if (!merged.display_name || !merged.pronouns) return false;

    const fd = new FormData();
    fd.append('display_name', merged.display_name);
    fd.append('pronouns', merged.pronouns);
    fd.append('tagline', merged.tagline || '');
    fd.append('radius_meters', merged.radius_meters ?? DEFAULT_RADIUS);
    fd.append('always_visible', merged.always_visible ?? true);
    fd.append('tag_color', merged.tag_color || '');
    fd.append('stickers', merged.stickers || '[]');
    fd.append('party_code', merged.party_code || '');

    try {
      const result = await Filesystem.readFile({
        path: LOCAL_PHOTO_PATH, directory: Directory.Data, encoding: Encoding.UTF8,
      });
      const blob = await fetch(result.data).then(r => r.blob());
      fd.append('photo', new File([blob], 'photo.jpg', { type: blob.type }));
    } catch { /* no local photo — send without it */ }

    // Also persist the overrides on-device so future restores keep them.
    await Preferences.set({ key: LOCAL_PROFILE_KEY, value: JSON.stringify(merged) });
    await updateProfile(fd);
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
  const [lastUpdated, setLastUpdated] = useState(null);
  const [hiddenIds, setHiddenIds] = useState([]);
  const modeRef = useRef('nearby');
  modeRef.current = mode;

  const loadHidden = useCallback(async () => { setHiddenIds(await getHiddenIds()); }, []);

  const loadMyProfile = useCallback(async () => {
    try {
      const profile = await getMyProfile();
      setMyProfile(profile);
      if (profile) {
        const active = profile.always_visible || profile.is_active;
        setIsActive(active);
        setMode(deriveMode(profile, active));
        // Restore fields the privacy cleanup may have cleared.
        if (!profile.display_name || !profile.photo_path) {
          if (await pushProfile()) {
            const refreshed = await getMyProfile();
            if (refreshed) {
              setMyProfile(refreshed);
              const a2 = refreshed.always_visible || refreshed.is_active;
              setIsActive(a2);
              setMode(deriveMode(refreshed, a2));
            }
          }
        }
      }
    } catch (err) {
      console.error('[useNearbyPeople] loadMyProfile:', err);
    }
  }, []);

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
    setMode(next);
    try {
      if (next === 'invisible') {
        await setVisibility(false);   // clears server photo + location + is_active
        setIsActive(false);
        setNearby([]);
        setMyProfile(prev => (prev ? { ...prev, is_active: false, photo_path: null } : prev));
        // Don't re-upload the profile here: it would restore the photo we just
        // deleted, and reloading would re-derive the mode from the unchanged
        // always_visible flag. Invisibility is a session state — like the
        // design's "switches itself off when you leave", it isn't persisted.
      } else {
        const code = next === 'party' ? (partyCode || '').trim().toUpperCase() : '';
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
  }, [shareLocation, loadNearby, loadMyProfile]);

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
    nearby, myProfile, locationError, locationErrorKind, loading, isActive, lastUpdated, mode,
    hiddenIds, refresh, setVisibilityMode, reloadProfile: loadMyProfile, reloadHidden: loadHidden,
  };
}
