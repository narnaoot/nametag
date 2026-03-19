import { useState, useEffect } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { getMyProfile, updateProfile, photoUrl } from '../api';
import { BANNER_COLORS, STICKER_OPTIONS, PRONOUN_OPTIONS, RADIUS_OPTIONS } from '../constants';

export default function ProfilePage({ onSaved }) {
  const [displayName, setDisplayName] = useState('');
  const [pronounSelect, setPronounSelect] = useState('they/them');
  const [customPronouns, setCustomPronouns] = useState('');
  const [tagline, setTagline] = useState('');
  const [radius, setRadius] = useState(100);
  const [alwaysVisible, setAlwaysVisible] = useState(true);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [tagColor, setTagColor] = useState('');
  const [selectedStickers, setSelectedStickers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      setTagline(profile.tagline || '');
      setRadius(profile.radius_meters || 100);
      setAlwaysVisible(profile.always_visible !== false);
      if (profile.photo_path) setPhotoPreview(photoUrl(profile.photo_path));
      if (profile.tag_color) setTagColor(profile.tag_color);
      if (profile.stickers) {
        try { setSelectedStickers(JSON.parse(profile.stickers)); } catch {}
      }
    }).catch(err => console.error('[ProfilePage] load profile:', err));
  }, []);

  function toggleSticker(sticker) {
    setSelectedStickers(prev =>
      prev.includes(sticker)
        ? prev.filter(s => s !== sticker)
        : prev.length < 3 ? [...prev, sticker] : prev
    );
  }

  async function handlePickPhoto() {
    try {
      const photo = await Camera.getPhoto({
        quality: 85,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt, // shows "Camera / Photo Library" action sheet on iOS
      });
      setPhotoPreview(photo.dataUrl);
      // Convert data URL → File for FormData upload
      const res = await fetch(photo.dataUrl);
      const blob = await res.blob();
      setPhotoFile(new File([blob], 'photo.jpg', { type: blob.type }));
    } catch {
      // User cancelled — do nothing
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!displayName.trim()) {
      setError('Please enter your name.');
      setLoading(false);
      return;
    }
    if (displayName.trim().length > 40) {
      setError('Name must be 40 characters or fewer.');
      setLoading(false);
      return;
    }

    const pronouns = pronounSelect === 'custom' ? customPronouns : pronounSelect;
    if (!pronouns.trim()) {
      setError('Please enter your pronouns.');
      setLoading(false);
      return;
    }
    if (pronouns.trim().length > 30) {
      setError('Pronouns must be 30 characters or fewer.');
      setLoading(false);
      return;
    }

    if (tagline.trim().length > 60) {
      setError('Tagline must be 60 characters or fewer.');
      setLoading(false);
      return;
    }

    const fd = new FormData();
    fd.append('display_name', displayName.trim());
    fd.append('pronouns', pronouns.trim());
    fd.append('tagline', tagline.trim());
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
            onClick={handlePickPhoto}
          >
            {photoPreview
              ? <img src={photoPreview} alt="Your photo" className="w-full h-full object-cover" />
              : <span className="text-4xl">📷</span>
            }
          </div>
          <button type="button" onClick={handlePickPhoto} className="text-sm font-semibold hover:underline" style={{ color: '#E63946', fontFamily: "'Caveat', cursive", fontSize: 16 }}>
            {photoPreview ? 'Change photo' : 'Add a photo'}
          </button>
        </div>

        {/* Name */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-slate-700">Your name</label>
            <span className="text-xs" style={{ color: displayName.length > 36 ? '#E63946' : '#aaa' }}>
              {displayName.length}/40
            </span>
          </div>
          <input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="What should people call you?"
            required
            maxLength={40}
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

        {/* Tagline */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-slate-700">
              Tagline <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <span className="text-xs" style={{ color: tagline.length > 50 ? '#E63946' : '#aaa' }}>
              {tagline.length}/60
            </span>
          </div>
          <input
            type="text"
            value={tagline}
            onChange={e => setTagline(e.target.value)}
            placeholder="A short line about you…"
            maxLength={60}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
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
