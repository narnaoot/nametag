import { useState, useEffect, useCallback } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { getNearby, updateLocation, setVisibility, getMyProfile, updateProfile } from '../api';
import { LOCAL_PHOTO_PATH, LOCAL_PROFILE_KEY } from '../constants';

// Re-uploads the full profile (name, pronouns, photo, etc.) from on-device
// storage. Called when the server copy has been cleaned up (user went inactive
// or stale cleanup ran). Silent no-op if there's nothing stored locally.
async function reuploadFullProfile() {
  try {
    const { value } = await Preferences.get({ key: LOCAL_PROFILE_KEY });
    if (!value) return;
    const p = JSON.parse(value);
    if (!p.display_name || !p.pronouns) return; // incomplete — skip

    const fd = new FormData();
    fd.append('display_name', p.display_name);
    fd.append('pronouns', p.pronouns);
    fd.append('tagline', p.tagline || '');
    fd.append('radius_meters', p.radius_meters ?? 100);
    fd.append('always_visible', p.always_visible ?? true);
    fd.append('tag_color', p.tag_color || '');
    fd.append('stickers', p.stickers || '[]');

    // Include photo from Filesystem if available
    try {
      const result = await Filesystem.readFile({
        path: LOCAL_PHOTO_PATH,
        directory: Directory.Data,
        encoding: Encoding.UTF8,
      });
      const blob = await fetch(result.data).then(r => r.blob());
      fd.append('photo', new File([blob], 'photo.jpg', { type: blob.type }));
    } catch {
      // No local photo — upload profile data without it
    }

    await updateProfile(fd);
  } catch {
    // Preferences empty, parse error, or upload failed — proceed without restoring
  }
}

export function useNearbyPeople() {
  const [nearby, setNearby] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadMyProfile = useCallback(async () => {
    try {
      const profile = await getMyProfile();
      setMyProfile(profile);
      if (profile) {
        setIsActive(profile.always_visible || profile.is_active);
        // If sensitive fields were cleaned up server-side, restore from on-device data
        if (!profile.display_name) {
          await reuploadFullProfile();
        }
      }
    } catch (err) {
      console.error('[useNearbyPeople] loadMyProfile:', err);
    }
  }, []);

  const shareLocation = useCallback(async () => {
    const perm = await Geolocation.requestPermissions();
    if (perm.location === 'denied') {
      throw new Error('Location access denied. Please allow location access in Settings.');
    }
    const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
    await updateLocation(pos.coords.latitude, pos.coords.longitude);
    setLastUpdated(new Date());
  }, []);

  const loadNearby = useCallback(async () => {
    try {
      const people = await getNearby();
      setNearby(people);
    } catch (err) {
      if (err.message === 'Share your location first') {
        setLocationError("Share your location to see who's nearby.");
      } else {
        console.error('[useNearbyPeople] loadNearby:', err);
      }
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await shareLocation();
      await loadNearby();
      setLocationError('');
    } catch (err) {
      setLocationError(err.message);
    } finally {
      setLoading(false);
    }
  }, [shareLocation, loadNearby]);

  const toggleVisibility = useCallback(async (alwaysVisible) => {
    if (alwaysVisible) return;
    const newActive = !isActive;
    try {
      if (newActive) {
        // Going visible — restore full profile from on-device storage first
        await reuploadFullProfile();
      }
      await setVisibility(newActive);
      setIsActive(newActive);
    } catch (err) {
      console.error('[useNearbyPeople] toggleVisibility:', err);
    }
  }, [isActive]);

  // Initial load
  useEffect(() => {
    async function init() {
      setLoading(true);
      await loadMyProfile();
      try {
        await shareLocation();
        setLocationError('');
        await loadNearby();
      } catch (err) {
        setLocationError(err.message);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Refresh location + nearby every 60 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await shareLocation();
        await loadNearby();
      } catch (err) {
        setLocationError(err.message);
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, [shareLocation, loadNearby]);

  return { nearby, myProfile, locationError, loading, isActive, lastUpdated, refresh, toggleVisibility };
}
