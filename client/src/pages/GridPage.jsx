import { useState, useEffect, useCallback } from 'react';
import { getNearby, updateLocation, setVisibility, getMyProfile } from '../api';

function PersonCard({ person }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex flex-col items-center gap-2 text-center">
      <div className="w-20 h-20 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center">
        {person.photo_path
          ? <img src={person.photo_path} alt={person.display_name} className="w-full h-full object-cover" />
          : <span className="text-3xl">👤</span>
        }
      </div>
      <p className="font-semibold text-slate-800 text-sm leading-tight">{person.display_name}</p>
      <span className="bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full">
        {person.pronouns}
      </span>
      {person.distance_meters != null && (
        <p className="text-xs text-slate-400">
          {person.distance_meters < 10 ? 'right here' : `${Math.round(person.distance_meters)} m away`}
        </p>
      )}
    </div>
  );
}

export default function GridPage() {
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
        setIsActive(profile.always_visible ? true : profile.is_active);
      }
    } catch {}
  }, []);

  const shareLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async pos => {
          try {
            await updateLocation(pos.coords.latitude, pos.coords.longitude);
            setLastUpdated(new Date());
            resolve();
          } catch (err) {
            reject(err);
          }
        },
        err => {
          reject(new Error('Location access denied. Please allow location access and refresh.'));
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }, []);

  const loadNearby = useCallback(async () => {
    try {
      const people = await getNearby();
      setNearby(people);
    } catch (err) {
      if (err.message === 'Share your location first') {
        setLocationError('Share your location to see who\'s nearby.');
      }
    }
  }, []);

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
      } catch {}
    }, 60_000);
    return () => clearInterval(interval);
  }, [shareLocation, loadNearby]);

  async function handleToggleVisibility() {
    if (myProfile?.always_visible) return; // always_visible users are always shown
    const newActive = !isActive;
    try {
      await setVisibility(newActive);
      setIsActive(newActive);
    } catch {}
  }

  async function handleRefresh() {
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
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Nearby</h2>
          {lastUpdated && (
            <p className="text-xs text-slate-400">Updated {lastUpdated.toLocaleTimeString()}</p>
          )}
        </div>
        <button
          onClick={handleRefresh}
          className="text-sm text-indigo-600 font-medium hover:underline"
        >
          Refresh
        </button>
      </div>

      {/* Visibility banner */}
      {myProfile && !myProfile.always_visible && (
        <div
          className={`mb-5 rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer border ${
            isActive
              ? 'bg-green-50 border-green-200'
              : 'bg-slate-100 border-slate-200'
          }`}
          onClick={handleToggleVisibility}
        >
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {isActive ? '✅ You are visible to others' : '🙈 You are hidden'}
            </p>
            <p className="text-xs text-slate-500">
              {isActive
                ? 'Tap to hide yourself from the grid.'
                : 'Tap to make your name and pronouns visible to nearby people.'}
            </p>
          </div>
          <div className={`w-10 h-6 rounded-full transition-colors ${isActive ? 'bg-green-500' : 'bg-slate-300'} relative flex-shrink-0`}>
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${isActive ? 'left-5' : 'left-1'}`} />
          </div>
        </div>
      )}

      {myProfile?.always_visible && (
        <div className="mb-5 rounded-xl px-4 py-3 bg-indigo-50 border border-indigo-100">
          <p className="text-sm text-indigo-700">
            <span className="font-semibold">You're always visible.</span> To change this, go to your profile settings.
          </p>
        </div>
      )}

      {/* Location error */}
      {locationError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {locationError}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">Looking for people nearby…</div>
      ) : nearby.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">👋</p>
          <p className="text-slate-600 font-medium">No one nearby right now</p>
          <p className="text-slate-400 text-sm mt-1">Check back when you're around others using Nametag.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {nearby.map(person => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      )}
    </div>
  );
}
