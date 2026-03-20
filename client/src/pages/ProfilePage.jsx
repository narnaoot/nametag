import { useState, useEffect } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { getMyProfile, updateProfile, photoUrl } from '../api';
import { useAuth } from '../AuthContext';
import {
  BANNER_COLORS, STICKER_OPTIONS, PRONOUN_OPTIONS, RADIUS_OPTIONS,
  NAME_MAX, PRONOUNS_MAX, TAGLINE_MAX, LOCAL_PHOTO_PATH, LOCAL_PROFILE_KEY,
} from '../constants';

async function savePhotoLocally(dataUrl) {
  try {
    await Filesystem.writeFile({
      path: LOCAL_PHOTO_PATH,
      data: dataUrl,
      directory: Directory.Data,
      encoding: Encoding.UTF8,
    });
  } catch {}
}

async function loadLocalPhoto() {
  try {
    const result = await Filesystem.readFile({
      path: LOCAL_PHOTO_PATH,
      directory: Directory.Data,
      encoding: Encoding.UTF8,
    });
    return result.data; // data URL string
  } catch {
    return null;
  }
}

export default function ProfilePage({ onSaved }) {
  const { deleteAccount } = useAuth();
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
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      // 1. Try on-device photo (always the freshest)
      const localPhoto = await loadLocalPhoto();
      if (localPhoto) setPhotoPreview(localPhoto);

      // 2. Try on-device profile data (name, pronouns, etc.)
      const { value } = await Preferences.get({ key: LOCAL_PROFILE_KEY });
      if (value) {
        try {
          const p = JSON.parse(value);
          setDisplayName(p.display_name || '');
          const knownPronoun = PRONOUN_OPTIONS.slice(0, -1).includes(p.pronouns);
          if (knownPronoun) {
            setPronounSelect(p.pronouns);
          } else {
            setPronounSelect('custom');
            setCustomPronouns(p.pronouns || '');
          }
          setTagline(p.tagline || '');
          setRadius(p.radius_meters || 100);
          setAlwaysVisible(p.always_visible !== false);
          if (p.tag_color) setTagColor(p.tag_color);
          if (p.stickers) {
            try { setSelectedStickers(JSON.parse(p.stickers)); } catch {}
          }
        } catch {}
      }

      // 3. Fall back to server for anything not in local storage
      try {
        const profile = await getMyProfile();
        if (!profile) return;
        // Only use server values if we had no local data
        if (!value) {
          setDisplayName(profile.display_name || '');
          const knownPronoun = PRONOUN_OPTIONS.slice(0, -1).includes(profile.pronouns);
          if (knownPronoun) {
            setPronounSelect(profile.pronouns || 'they/them');
          } else {
            setPronounSelect('custom');
            setCustomPronouns(profile.pronouns || '');
          }
          setTagline(profile.tagline || '');
          setRadius(profile.radius_meters || 100);
          setAlwaysVisible(profile.always_visible !== false);
          if (profile.tag_color) setTagColor(profile.tag_color);
          if (profile.stickers) {
            try { setSelectedStickers(JSON.parse(profile.stickers)); } catch {}
          }
        }
        // Server photo only if no local copy
        if (profile.photo_path && !localPhoto) setPhotoPreview(photoUrl(profile.photo_path));
      } catch {
        if (!value) setError('Failed to load your profile. Please refresh.');
      }
    }
    load();
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
        source: CameraSource.Prompt,
      });
      setPhotoPreview(photo.dataUrl);
      await savePhotoLocally(photo.dataUrl);
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
    if (displayName.trim().length > NAME_MAX) {
      setError(`Name must be ${NAME_MAX} characters or fewer.`);
      setLoading(false);
      return;
    }

    const pronouns = pronounSelect === 'custom' ? customPronouns : pronounSelect;
    if (!pronouns.trim()) {
      setError('Please enter your pronouns.');
      setLoading(false);
      return;
    }
    if (pronouns.trim().length > PRONOUNS_MAX) {
      setError(`Pronouns must be ${PRONOUNS_MAX} characters or fewer.`);
      setLoading(false);
      return;
    }

    if (tagline.trim().length > TAGLINE_MAX) {
      setError(`Tagline must be ${TAGLINE_MAX} characters or fewer.`);
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
      // Mirror to on-device storage so it survives server-side cleanup
      await Preferences.set({
        key: LOCAL_PROFILE_KEY,
        value: JSON.stringify({
          display_name: displayName.trim(),
          pronouns: pronouns.trim(),
          tagline: tagline.trim(),
          radius_meters: radius,
          always_visible: alwaysVisible,
          tag_color: tagColor,
          stickers: JSON.stringify(selectedStickers),
        }),
      });
      setSuccess('Profile saved!');
      if (onSaved) onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      await deleteAccount();
      // deleteAccount signs out — app re-renders to AuthPage
    } catch (err) {
      setError(err.message);
      setConfirmDelete(false);
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h2 className="font-caveat font-bold text-ink mb-6" style={{ fontSize: 28 }}>
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
          <button
            type="button"
            onClick={handlePickPhoto}
            className="font-caveat text-sm font-semibold text-brand hover:underline"
            style={{ fontSize: 16 }}
          >
            {photoPreview ? 'Change photo' : 'Add a photo'}
          </button>
        </div>

        {/* Name */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-slate-700">Your name</label>
            <span className={`text-xs ${displayName.length > NAME_MAX - 4 ? 'text-brand' : 'text-dim'}`}>
              {displayName.length}/{NAME_MAX}
            </span>
          </div>
          <input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="What should people call you?"
            required
            maxLength={NAME_MAX}
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
                className={`font-caveat px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  pronounSelect === opt
                    ? 'bg-brand text-white border-brand'
                    : 'bg-white text-slate-600 border-slate-200'
                }`}
                style={{ fontSize: 15 }}
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
            <span className={`text-xs ${tagline.length > TAGLINE_MAX - 10 ? 'text-brand' : 'text-dim'}`}>
              {tagline.length}/{TAGLINE_MAX}
            </span>
          </div>
          <input
            type="text"
            value={tagline}
            onChange={e => setTagline(e.target.value)}
            placeholder="A short line about you…"
            maxLength={TAGLINE_MAX}
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
                className={`w-10 h-6 rounded-full cursor-pointer transition-colors relative ${alwaysVisible ? 'bg-brand' : 'bg-slate-300'}`}
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
                className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border-2 transition-all ${
                  selectedStickers.includes(s) ? 'border-brand bg-brand/10' : 'border-slate-200 bg-white'
                }`}
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
          className="w-full py-3 text-white rounded-lg font-semibold font-caveat transition-colors disabled:opacity-50 bg-brand"
          style={{ fontSize: 18 }}
        >
          {loading ? 'Saving…' : 'Save profile'}
        </button>
      </form>

      {/* Delete account */}
      <div className="mt-10 pt-6 border-t border-slate-200">
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-sm text-slate-400 hover:text-red-500 transition-colors"
          >
            Delete account
          </button>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-red-700">Delete your account?</p>
            <p className="text-xs text-red-600">
              This permanently deletes your profile, photo, and account. There is no undo.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Yes, delete everything'}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
