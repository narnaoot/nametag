import { useState, useEffect, useRef } from 'react';
import { getMyProfile, updateProfile, photoUrl } from '../api';
import { useAuth } from '../useAuth';
import { savePhotoLocally, loadLocalPhoto, persistProfileLocally, readLocalProfile } from '../profileStorage';
import { PersonCard, Avatar } from '../components/Badge';
import Toggle from '../components/Toggle';
import PaintboxPicker from '../components/PaintboxPicker';
import PronounChips from '../components/PronounChips';
import {
  PAINTBOX, STICKER_OPTIONS, PRONOUN_OPTIONS, RADIUS_OPTIONS,
  NAME_MAX, PRONOUNS_MAX, TAGLINE_MAX, PARTY_CODE_MAX, MAX_STICKERS, STICKER_TILT,
} from '../constants';

function Field({ label, count, max, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
        <span style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--text)' }}>{label}</span>
        {max != null && (
          <span className="t-label" style={{ color: count > max - 5 ? 'var(--primary)' : 'var(--muted)' }}>
            {count}/{max}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

export default function ProfilePage() {
  const { deleteAccount, signOut } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [pronounSelect, setPronounSelect] = useState('they/them');
  const [customPronouns, setCustomPronouns] = useState('');
  const [tagline, setTagline] = useState('');
  const [radius, setRadius] = useState(100);
  const [alwaysVisible, setAlwaysVisible] = useState(true);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [accentKey, setAccentKey] = useState('teal');
  const [selectedStickers, setSelectedStickers] = useState([]);
  const [partyCode, setPartyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef(null);
  const loadedRef = useRef(false);
  const autoSaveTimerRef = useRef(null);

  useEffect(() => {
    // Hydrate every editable field from a profile source (on-device or server).
    function applyProfile(src) {
      setDisplayName(src.display_name || '');
      const known = PRONOUN_OPTIONS.slice(0, -1).includes(src.pronouns);
      if (known) { setPronounSelect(src.pronouns); }
      else { setPronounSelect('custom'); setCustomPronouns(src.pronouns || ''); }
      setTagline(src.tagline || '');
      setRadius(src.radius_meters || 100);
      setAlwaysVisible(src.always_visible !== false);
      if (src.tag_color && PAINTBOX[src.tag_color]) setAccentKey(src.tag_color);
      if (src.stickers) { try { setSelectedStickers(JSON.parse(src.stickers)); } catch { /* ignore */ } }
      if (src.party_code !== undefined) setPartyCode(src.party_code || '');
    }

    async function load() {
      const localPhoto = await loadLocalPhoto();
      if (localPhoto) setPhotoPreview(localPhoto);

      // On-device copy is freshest; fall back to the server for first load.
      const p = await readLocalProfile();
      if (p) applyProfile(p);

      try {
        const profile = await getMyProfile();
        if (!profile) return;
        if (!p) applyProfile(profile);
        if (profile.photo_path && !localPhoto) setPhotoPreview(photoUrl(profile.photo_path));
      } catch {
        if (!p) setError('Failed to load your profile. Please refresh.');
      }
    }
    load().then(() => { loadedRef.current = true; });
  }, []);

  const pronouns = pronounSelect === 'custom' ? customPronouns.trim() : pronounSelect;

  function toggleSticker(s) {
    setSelectedStickers(prev =>
      prev.includes(s) ? prev.filter(x => x !== s)
        : prev.length < MAX_STICKERS ? [...prev, s] : prev
    );
  }

  function handlePickPhoto() { fileInputRef.current?.click(); }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;
      setPhotoPreview(dataUrl);
      await savePhotoLocally(dataUrl);
    };
    reader.readAsDataURL(file);
    setPhotoFile(file);
  }

  async function doSave({ silent = false } = {}) {
    const name = displayName.trim();
    if (!name || !pronouns) {
      if (!silent) setError('Please enter your name and pronouns.');
      return;
    }
    if (name.length > NAME_MAX) { if (!silent) setError(`Name must be ${NAME_MAX} characters or fewer.`); return; }
    if (pronouns.length > PRONOUNS_MAX) { if (!silent) setError(`Pronouns must be ${PRONOUNS_MAX} characters or fewer.`); return; }
    if (tagline.trim().length > TAGLINE_MAX) { if (!silent) setError(`Tagline must be ${TAGLINE_MAX} characters or fewer.`); return; }

    setError('');
    setLoading(true);

    const fields = {
      display_name: name,
      pronouns,
      tagline: tagline.trim(),
      radius_meters: radius,
      always_visible: alwaysVisible,
      tag_color: accentKey,
      stickers: JSON.stringify(selectedStickers),
      party_code: partyCode.trim(),
    };
    const fd = new FormData();
    Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
    if (photoFile) fd.append('photo', photoFile);

    try {
      await updateProfile(fd);
      await persistProfileLocally(fields);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Auto-save: debounce 700 ms after any field change, skip during initial load.
  useEffect(() => {
    if (!loadedRef.current) return;
    clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => doSave({ silent: true }), 700);
    return () => clearTimeout(autoSaveTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayName, pronounSelect, customPronouns, tagline, radius, alwaysVisible, accentKey, selectedStickers, partyCode, photoFile]);

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      await deleteAccount();
    } catch (err) {
      setError(err.message);
      setConfirmDelete(false);
      setDeleting(false);
    }
  }

  const preview = {
    name: displayName || ' ',
    pronouns: pronouns || ' ',
    tagline: tagline,
    accent: accentKey,
    stickers: selectedStickers,
    photo: photoPreview,
    distance: null,
  };
  const accentVar = `var(--${accentKey})`;

  return (
    <div className="no-sb na-screen" style={{ padding: '70px 22px 96px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
        <div className="t-display" style={{ fontSize: 38 }}>My <em>tag</em></div>
        {loading ? <span className="t-label">Saving…</span>
          : saved ? <span className="t-label" style={{ color: 'var(--sage)' }}>Saved ✓</span> : null}
      </div>

      {/* live preview */}
      <div style={{
        display: 'flex', justifyContent: 'center', padding: '22px 0 26px',
        background: 'var(--warm)', borderRadius: 'var(--r)',
        border: 'var(--hairline) solid var(--border)', marginBottom: 24,
      }}>
        <PersonCard person={preview} accent={accentVar} variant="sticker" tilt={STICKER_TILT} />
      </div>

      {/* photo */}
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 22 }}>
        <div onClick={handlePickPhoto} style={{ cursor: 'pointer' }}>
          <Avatar person={preview} size={88} accent={accentVar} />
        </div>
        <button type="button" onClick={handlePickPhoto} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontWeight: 800, fontSize: 13.5, color: 'var(--primary)',
        }}>
          {photoPreview ? 'Change photo' : 'Add a photo'}
        </button>
      </div>

      <Field label="Your name" count={displayName.length} max={NAME_MAX}>
        <input className="na-field" value={displayName} maxLength={NAME_MAX}
               onChange={e => setDisplayName(e.target.value)}
               placeholder="What should people call you?" />
      </Field>

      <Field label="Your pronouns">
        <PronounChips options={PRONOUN_OPTIONS} value={pronounSelect} onChange={setPronounSelect} />
        {pronounSelect === 'custom' && (
          <input className="na-field" style={{ marginTop: 10 }} value={customPronouns}
                 maxLength={PRONOUNS_MAX} onChange={e => setCustomPronouns(e.target.value)}
                 placeholder="e.g. xe/xem, fae/faer…" />
        )}
      </Field>

      <Field label="Tagline" count={tagline.length} max={TAGLINE_MAX}>
        <input className="na-field" value={tagline} maxLength={TAGLINE_MAX}
               onChange={e => setTagline(e.target.value)}
               placeholder="A short line about you…" />
      </Field>

      <Field label="Show me to people within">
        <div style={{ position: 'relative' }}>
          <select className="na-field" value={radius}
                  onChange={e => setRadius(Number(e.target.value))}
                  style={{ appearance: 'none', cursor: 'pointer' }}>
            {RADIUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                         pointerEvents: 'none', color: 'var(--muted)', fontWeight: 800 }}>▾</span>
        </div>
      </Field>

      {/* visibility */}
      <div style={{
        display: 'flex', gap: 13, alignItems: 'flex-start', padding: 16, marginBottom: 22,
        background: 'color-mix(in srgb, var(--primary) 8%, var(--surface))',
        border: 'var(--hairline) solid color-mix(in srgb, var(--primary) 26%, transparent)',
        borderRadius: 'var(--r)',
      }}>
        <Toggle on={alwaysVisible} onClick={() => setAlwaysVisible(v => !v)} />
        <div>
          <div style={{ fontWeight: 800, fontSize: 13.5 }}>
            {alwaysVisible ? 'Always visible when nearby' : 'Only visible when I choose'}
          </div>
          <div className="t-body" style={{ fontSize: 12.5, marginTop: 2 }}>
            {alwaysVisible
              ? 'People nearby see your name automatically.'
              : 'Hidden by default — flip visibility on from Nearby.'}
          </div>
        </div>
      </div>

      {/* nametag color — the paintbox */}
      <Field label="Nametag color">
        <PaintboxPicker value={accentKey} onChange={setAccentKey} />
      </Field>

      {/* stickers */}
      <Field label={`Stickers · pick up to ${MAX_STICKERS}`}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {STICKER_OPTIONS.map(s => {
            const on = selectedStickers.includes(s);
            return (
              <button key={s} type="button" onClick={() => toggleSticker(s)} style={{
                width: 42, height: 42, borderRadius: 'var(--r)', fontSize: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all .12s ease',
                background: on ? 'color-mix(in srgb, var(--primary) 14%, var(--surface))' : 'var(--surface)',
                border: `var(--hairline) solid ${on ? 'var(--primary)' : 'var(--border)'}`,
              }}>{s}</button>
            );
          })}
        </div>
      </Field>

      {/* party code — keeps the existing group-filter feature */}
      <Field label="Party code · optional" count={partyCode.length} max={PARTY_CODE_MAX}>
        <input className="na-field" value={partyCode} maxLength={PARTY_CODE_MAX}
               onChange={e => setPartyCode(e.target.value.slice(0, PARTY_CODE_MAX))}
               placeholder="Enter a code to see only your group…" />
        <div className="t-body" style={{ fontSize: 12, marginTop: 6 }}>
          When set, Nearby only shows people with the same code.
        </div>
      </Field>

      {error && <p style={{ color: 'var(--danger)', fontWeight: 700, fontSize: 13.5 }}>{error}</p>}

      {/* account actions — sign out + the lone danger zone */}
      <div style={{ marginTop: 14, paddingTop: 20, borderTop: 'var(--hairline) solid var(--border)' }}>
        {!confirmDelete ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <button type="button" onClick={signOut} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text)', fontWeight: 800, fontSize: 13.5, padding: 0 }}>
              Sign out
            </button>
            <button type="button" onClick={() => setConfirmDelete(true)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--muted)', fontWeight: 700, fontSize: 13.5, padding: 0 }}>
              Delete account
            </button>
          </div>
        ) : (
          <div style={{
            background: 'color-mix(in srgb, var(--danger) 9%, var(--surface))',
            border: 'var(--hairline) solid color-mix(in srgb, var(--danger) 30%, transparent)',
            borderRadius: 'var(--r)', padding: 16,
          }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--danger)' }}>Delete your account?</div>
            <div className="t-body" style={{ fontSize: 12.5, margin: '6px 0 12px' }}>
              This erases your profile, photo, and account immediately. There’s no undo.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="na-btn" style={{ flex: 1, padding: '11px', background: 'var(--danger)', color: '#fff' }}
                      disabled={deleting} onClick={handleDeleteAccount}>
                {deleting ? 'Deleting…' : 'Delete everything'}
              </button>
              <button className="na-btn na-btn--ghost" style={{ flex: 1, padding: '11px' }}
                      onClick={() => setConfirmDelete(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
