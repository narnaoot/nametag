import { useState, useEffect, useCallback, useRef } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { getNearby, updateLocation, setVisibility, getMyProfile } from '../lib/api';
import { getHiddenIds, patchLocalProfile } from '../lib/profileStorage';
import { normalizePartyCode, visibilityMode, profileSaveSettled } from '../lib/profile';
import { pushProfile } from '../lib/profileSync';

// The three-way visibility mode of a server profile row: invisible | nearby |
// party. A missing profile reads as 'nearby'.
function deriveMode(profile) {
  if (!profile) return 'nearby';
  return visibilityMode({
    alwaysVisible: profile.always_visible !== false || profile.is_active,
    partyCode: profile.party_code,
  });
}

// Why the room couldn't be read: 'denied' (location is off) or 'unavailable'.
function locationProblem(kind) {
  const err = new Error(`location ${kind}`);
  err.kind = kind;
  return err;
}

// Read the device's position and tell the server where we are.
async function shareLocation() {
  try {
    const perm = await Geolocation.requestPermissions();
    if (perm.location === 'denied') throw locationProblem('denied');
  } catch (err) {
    if (err.kind) throw err;
    // requestPermissions() isn't implemented on web — the browser prompts on
    // getCurrentPosition, so proceed.
  }
  let pos;
  try {
    pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
  } catch (err) {
    // GeolocationPositionError: 1 = denied, 2 = unavailable, 3 = timeout
    throw locationProblem(err?.code === 1 ? 'denied' : 'unavailable');
  }
  await updateLocation(pos.coords.latitude, pos.coords.longitude);
}

export function useNearbyPeople() {
  const [nearby, setNearby] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [profileChecked, setProfileChecked] = useState(false);
  const [locationErrorKind, setLocationErrorKind] = useState(null); // 'denied' | 'unavailable' | null
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('nearby');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [hiddenIds, setHiddenIds] = useState([]);
  const modeRef = useRef('nearby');   // kept in step with `mode` by applyMode

  const loadHidden = useCallback(async () => { setHiddenIds(await getHiddenIds()); }, []);

  // Set the mode in state AND in the ref at once. readRoom() runs right after
  // an await, before React has re-rendered; a stale 'nearby' there would
  // broadcast someone who chose to be invisible.
  const applyMode = useCallback((next) => { modeRef.current = next; setMode(next); }, []);

  const loadMyProfile = useCallback(async () => {
    try {
      await profileSaveSettled();   // don't read past an in-flight My-tag save
      let profile = await getMyProfile();
      let derived = deriveMode(profile);
      // Restore fields the privacy cleanup may have cleared — but never while
      // invisible: that would put the name and photo back on the server for
      // someone who asked to be off it.
      if (profile && derived !== 'invisible' && (!profile.display_name || !profile.photo_path)
          && await pushProfile()) {
        profile = (await getMyProfile()) ?? profile;
        derived = deriveMode(profile);
      }
      setMyProfile(profile);
      setProfileChecked(true);
      applyMode(derived);
    } catch (err) {
      console.error('[useNearbyPeople] loadMyProfile:', err);
    }
  }, [applyMode]);

  // Share where we are and read who else is here — unless invisible. The one
  // place location errors are turned into UI state.
  const readRoom = useCallback(async () => {
    if (modeRef.current === 'invisible') return;
    try {
      await shareLocation();
      setLastUpdated(new Date());
      try {
        setNearby(await getNearby());
      } catch (err) {
        // The server has no position for us, so it can't say who's near.
        if (err.message === 'Share your location first') throw locationProblem('denied');
        console.error('[useNearbyPeople] getNearby:', err);
      }
      setLocationErrorKind(null);
    } catch (err) {
      setLocationErrorKind(err.kind || 'unavailable');
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    await readRoom();
    setLoading(false);
  }, [readRoom]);

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
        setNearby([]);
        setMyProfile(prev => (prev ? { ...prev, is_active: false, always_visible: false, photo_path: null } : prev));
      } else {
        const code = next === 'party' ? normalizePartyCode(partyCode) : '';
        await pushProfile({ always_visible: true, party_code: code });
        await readRoom();
        await loadMyProfile();
      }
    } catch (err) {
      setLocationErrorKind(err.kind || 'unavailable');
    }
  }, [applyMode, readRoom, loadMyProfile]);

  useEffect(() => {
    (async () => {
      await loadHidden();
      await loadMyProfile();
      await readRoom();
      setLoading(false);
    })();
  }, [loadHidden, loadMyProfile, readRoom]);

  // Re-read the room every 60s while visible.
  useEffect(() => {
    const interval = setInterval(readRoom, 60_000);
    return () => clearInterval(interval);
  }, [readRoom]);

  return {
    nearby, myProfile, profileChecked, locationErrorKind, loading, lastUpdated, mode,
    hiddenIds, refresh, setVisibilityMode, reloadHidden: loadHidden,
  };
}
