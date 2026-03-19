import { useState, useEffect, useCallback } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { getNearby, updateLocation, setVisibility, getMyProfile } from '../api';

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
        console.error('[useNearbyPeople] background refresh:', err);
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, [shareLocation, loadNearby]);

  return { nearby, myProfile, locationError, loading, isActive, lastUpdated, refresh, toggleVisibility };
}
