import { useState, useEffect, useRef } from 'react';
import { getMyProfile, updateProfile } from '../api';

const PRONOUN_OPTIONS = [
  'she/her',
  'he/him',
  'they/them',
  'she/they',
  'he/they',
  'custom',
];

const RADIUS_OPTIONS = [
  { label: '50 m (same floor)', value: 50 },
  { label: '100 m (city block) — default', value: 100 },
  { label: '200 m (nearby block)', value: 200 },
  { label: '500 m (neighborhood)', value: 500 },
  { label: '1 km (wider area)', value: 1000 },
];

export default function ProfilePage({ onSaved }) {
  const [displayName, setDisplayName] = useState('');
  const [pronounSelect, setPronounSelect] = useState('they/them');
  const [customPronouns, setCustomPronouns] = useState('');
  const [radius, setRadius] = useState(100);
  const [alwaysVisible, setAlwaysVisible] = useState(true);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileRef = useRef();

  useEffect(() => {
    getMyProfile().then(profile => {
      if (!profile) return;
      setDisplayName(profile.display_name || '');
      const knownPronoun = PRONOUN_OPTIONS.slice(0, -1).includes(profile.pronouns);
      if (knownPronoun) {
        setPronounSelect(profile.pronouns);
      } else {
        setPronounSelect('custom');
        setCustomPronouns(profile.pronouns || '');
      }
      setRadius(profile.radius_meters || 100);
      setAlwaysVisible(profile.always_visible !== false);
      if (profile.photo_path) setPhotoPreview(profile.photo_path);
    }).catch(() => {});
  }, []);

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const pronouns = pronounSelect === 'custom' ? customPronouns : pronounSelect;
    if (!pronouns.trim()) {
      setError('Please enter your pronouns.');
      setLoading(false);
      return;
    }

    const fd = new FormData();
    fd.append('display_name', displayName.trim());
    fd.append('pronouns', pronouns.trim());
    fd.append('radius_meters', radius);
    fd.append('always_visible', alwaysVisible);
    if (photoFile) fd.append('photo', photoFile);

    try {
      await updateProfile(fd);
      setSuccess('Profile saved!');
      if (onSaved) onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h2 className="text-xl font-bold text-slate-800 mb-6">Your Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Photo */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-28 h-28 rounded-full bg-slate-100 border-2 border-slate-200 overflow-hidden cursor-pointer flex items-center justify-center"
            onClick={() => fileRef.current.click()}
          >
            {photoPreview
              ? <img src={photoPreview} alt="Your photo" className="w-full h-full object-cover" />
              : <span className="text-4xl">📷</span>
            }
          </div>
          <button type="button" onClick={() => fileRef.current.click()} className="text-indigo-600 text-sm font-medium hover:underline">
            {photoPreview ? 'Change photo' : 'Add a photo'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Your name</label>
          <input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="What should people call you?"
            required
            className="w-full px-4 py-3 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* Pronouns */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Your pronouns</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {PRONOUN_OPTIONS.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => setPronounSelect(opt)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  pronounSelect === opt
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-400'
                }`}
              >
                {opt === 'custom' ? '+ custom' : opt}
              </button>
            ))}
          </div>
          {pronounSelect === 'custom' && (
            <input
              type="text"
              value={customPronouns}
              onChange={e => setCustomPronouns(e.target.value)}
              placeholder="e.g. xe/xem, fae/faer…"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          )}
        </div>

        {/* Radius */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Show me to people within</label>
          <select
            value={radius}
            onChange={e => setRadius(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          >
            {RADIUS_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Visibility */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <div
                className={`w-10 h-6 rounded-full cursor-pointer transition-colors ${alwaysVisible ? 'bg-indigo-600' : 'bg-slate-300'} relative`}
                onClick={() => setAlwaysVisible(v => !v)}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${alwaysVisible ? 'left-5' : 'left-1'}`} />
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {alwaysVisible ? 'Always visible when nearby' : 'Only visible when I choose'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {alwaysVisible
                  ? 'Others nearby will see your name and pronouns automatically. Toggle off to control when you appear.'
                  : 'You are hidden by default. Use the grid screen to turn visibility on when you want to be seen.'}
              </p>
            </div>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Save profile'}
        </button>
      </form>
    </div>
  );
}
