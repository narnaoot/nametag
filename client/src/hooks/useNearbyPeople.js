import { useState, useEffect, useCallback, useRef } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { getNearby, updateLocation, setVisibility, getMyProfile } from '../lib/api';
import { getHiddenIds, patchLocalProfile, readLocalProfile } from '../lib/profileStorage';
import { normalizePartyCode, visibilityMode, profileSaveSettled, isPartyExpired } from '../lib/profile';
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

// What the device records when you come off the wall: invisible, and in no party.
const OFF_THE_WALL = { always_visible: false, party_code: '', party_code_set_at: '' };

// Read the device's position and tell the server where we are. Resolves false
// when the server no longer holds our tag (it drops a tag that hasn't been
// refreshed for a while), so the caller can put it back from the device.
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
  const { has_tag } = await updateLocation(pos.coords.latitude, pos.coords.longitude);
  return has_tag !== false;
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
  const [endedParty, setEndedParty] = useState(null);   // the code that just ran out, if one did
  const modeRef = useRef('nearby');   // kept in step with `mode` by applyMode

  const loadHidden = useCallback(async () => { setHiddenIds(await getHiddenIds()); }, []);

  // Set the mode in state AND in the ref at once. readRoom() runs right after
  // an await, before React has re-rendered; a stale 'nearby' there would
  // broadcast someone who chose to be invisible.
  const applyMode = useCallback((next) => { modeRef.current = next; setMode(next); }, []);

  // Come off the wall and stay off: the server deletes its copy of the tag
  // (name, photo, location, party code) and records the choice; the device
  // records it too, so My tag and the next launch agree. Nothing is re-uploaded
  // until you choose to be seen again.
  const goInvisible = useCallback(async () => {
    applyMode('invisible');
    setNearby([]);
    await setVisibility(false);
    await patchLocalProfile(OFF_THE_WALL);
    setMyProfile(prev => (prev
      ? { ...prev, is_active: false, always_visible: false, photo_path: null, party_code: null } : prev));
  }, [applyMode]);

  // A party code lasts a few hours. When it runs out the party is over, and
  // its members go invisible rather than suddenly being shown to the whole room.
  const endPartyIfOver = useCallback(async () => {
    const local = await readLocalProfile();
    if (!isPartyExpired(local)) return false;
    setEndedParty(local.party_code);
    await goInvisible();
    return true;
  }, [goInvisible]);

  const loadMyProfile = useCallback(async () => {
    try {
      await profileSaveSettled();   // don't read past an in-flight My-tag save
      await endPartyIfOver();
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
      // The server is the authority on being invisible (it may have been chosen
      // on another device); make sure this device's copy agrees.
      if (derived === 'invisible') await patchLocalProfile(OFF_THE_WALL);
      setMyProfile(profile);
      setProfileChecked(true);
      applyMode(derived);
    } catch (err) {
      console.error('[useNearbyPeople] loadMyProfile:', err);
    }
  }, [applyMode, endPartyIfOver]);

  // Share where we are and read who else is here — unless invisible. The one
  // place location errors are turned into UI state.
  const readRoom = useCallback(async () => {
    if (modeRef.current === 'invisible') return;
    try {
      if (await endPartyIfOver()) return;
      if (!(await shareLocation())) {
        // The server dropped our tag while we were away — put it back.
        await loadMyProfile();
        if (modeRef.current === 'invisible') return;
      }
      setLastUpdated(new Date());
      try {
        setNearby(await getNearby());
      } catch (err) {
        // The server has no position for us, so it can't say who's near.
        if (err.message === 'Share your location first') throw locationProblem('denied');
        // The server ended the party before this device noticed.
        if (err.data?.partyExpired) { await loadMyProfile(); return; }
        console.error('[useNearbyPeople] getNearby:', err);
      }
      setLocationErrorKind(null);
    } catch (err) {
      setLocationErrorKind(err.kind || 'unavailable');
    }
  }, [endPartyIfOver, loadMyProfile]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await readRoom();
    setLoading(false);
  }, [readRoom]);

  // Switch the central visibility state. partyCode required for 'party'.
  const setVisibilityMode = useCallback(async (next, { partyCode } = {}) => {
    applyMode(next);
    setEndedParty(null);
    try {
      if (next === 'invisible') {
        await goInvisible();
      } else {
        const code = next === 'party' ? normalizePartyCode(partyCode) : '';
        await pushProfile({ always_visible: true, party_code: code });
        await readRoom();
        await loadMyProfile();
      }
    } catch (err) {
      setLocationErrorKind(err.kind || 'unavailable');
    }
  }, [applyMode, goInvisible, readRoom, loadMyProfile]);

  useEffect(() => {
    (async () => {
      await loadHidden();
      await loadMyProfile();
      await readRoom();
      setLoading(false);
    })();
  }, [loadHidden, loadMyProfile, readRoom]);

  // Re-read the room every 60s while visible, and as soon as the app comes
  // back to the foreground (timers don't run reliably in the background).
  useEffect(() => {
    const interval = setInterval(readRoom, 60_000);
    const onResume = () => { if (document.visibilityState === 'visible') readRoom(); };
    document.addEventListener('visibilitychange', onResume);
    return () => { clearInterval(interval); document.removeEventListener('visibilitychange', onResume); };
  }, [readRoom]);

  return {
    nearby, myProfile, profileChecked, locationErrorKind, loading, lastUpdated, mode, endedParty,
    hiddenIds, refresh, setVisibilityMode, reloadHidden: loadHidden,
  };
}
