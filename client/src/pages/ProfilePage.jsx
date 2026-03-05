import { useState, useEffect, useRef } from 'react';
import { getMyProfile, updateProfile } from '../api';

const BANNER_COLORS = [
  { hex: '#E63946', label: 'Red' },
  { hex: '#2563EB', label: 'Blue' },
  { hex: '#16A34A', label: 'Green' },
  { hex: '#D97706', label: 'Amber' },
  { hex: '#7C3AED', label: 'Purple' },
  { hex: '#0891B2', label: 'Cyan' },
];

const STICKER_OPTIONS = [
  '👋', '🌟', '🎉', '🌈', '🦄', '🐉', '🌸', '🍕',
  '🎸', '📚', '🎨', '🏳️‍🌈', '🏳️‍⚧️', '🌍', '☕', '🤖',
];

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
  const [tagColor, setTagColor] = useState('');
  const [selectedStickers, setSelectedStickers] = useState([]);
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
      if (profile.tag_color) setTagColor(profile.tag_color);
      if (profile.stickers) setSelectedStickers(JSON.parse(profile.stickers));
    }).catch(() => {});
  }, []);

  function toggleSticker(sticker) {
    setSelectedStickers(prev =>
      prev.includes(sticker)
        ? prev.filter(s => s !== sticker)
        : prev.length < 3 ? [...prev, sticker] : prev
    );
  }

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
    fd.append('tag_color', tagColor);
    fd.append('stickers', JSON.stringify(selectedStickers));
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
      <h2
        className="font-bold mb-6"
        style={{ fontFamily: "'Caveat', cursive", fontSize: 28, color: '#1a1a1a' }}
      >
        Your Profile
      </h2>
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
          <button type="button" onClick={() => fileRef.current.click()} className="text-sm font-semibold hover:underline" style={{ color: '#E63946', fontFamily: "'Caveat', cursive", fontSize: 16 }}>
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
                className="px-3 py-1.5 rounded-full text-sm font-medium border transition-all"
                style={
                  pronounSelect === opt
                    ? { backgroundColor: '#E63946', color: '#fff', borderColor: '#E63946', fontFamily: "'Caveat', cursive", fontSize: 15 }
                    : { backgroundColor: '#fff', color: '#555', borderColor: '#e2e8f0', fontFamily: "'Caveat', cursive", fontSize: 15 }
                }
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
        <div className="rounded-xl p-4 border" style={{ backgroundColor: '#E6394610', borderColor: '#E6394630' }}>
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <div
                className="w-10 h-6 rounded-full cursor-pointer transition-colors relative"
                style={{ backgroundColor: alwaysVisible ? '#E63946' : '#cbd5e1' }}
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

        {/* Tag color */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Nametag color</label>
          <div className="flex gap-3 flex-wrap">
            {BANNER_COLORS.map(({ hex, label }) => (
              <button
                key={hex}
                type="button"
                title={label}
                onClick={() => setTagColor(hex)}
                className="w-8 h-8 rounded-full border-4 transition-all"
                style={{
                  backgroundColor: hex,
                  borderColor: tagColor === hex ? '#1a1a1a' : 'transparent',
                  boxShadow: tagColor === hex ? '0 0 0 2px #fff inset' : 'none',
                }}
              />
            ))}
          </div>
        </div>

        {/* Stickers */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Stickers <span className="text-slate-400 font-normal">(pick up to 3)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {STICKER_OPTIONS.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSticker(s)}
                className="w-10 h-10 rounded-xl text-xl flex items-center justify-center border-2 transition-all"
                style={{
                  borderColor: selectedStickers.includes(s) ? '#E63946' : '#e2e8f0',
                  backgroundColor: selectedStickers.includes(s) ? '#E6394615' : '#fff',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
          style={{ backgroundColor: '#E63946', fontFamily: "'Caveat', cursive", fontSize: 18 }}
        >
          {loading ? 'Saving…' : 'Save profile'}
        </button>
      </form>
    </div>
  );
}
