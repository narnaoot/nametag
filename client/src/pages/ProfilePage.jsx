import { useState, useEffect, useRef } from 'react';
import { getMyProfile, photoUrl, setVisibility } from '../lib/api';
import { useAuth } from '../auth/useAuth';
import { loadLocalPhoto, readLocalProfile, persistProfileLocally } from '../lib/profileStorage';
import { preparePickedPhoto } from '../lib/imageCrop';
import { normalizeProfileFields, visibilityMode, trackProfileSave, isPartyExpired } from '../lib/profile';
import { saveProfile } from '../lib/profileSync';
import MyTagPreview from '../components/MyTagPreview';
import VisibilityControl from '../components/VisibilityControl';
import StickerPicker from '../components/StickerPicker';
import PronounChips from '../components/PronounChips';
import PaintboxPicker from '../components/PaintboxPicker';
import {
  PRONOUN_OPTIONS, NAME_MAX, PRONOUNS_MAX, TAGLINE_MAX, MAX_STICKERS,
  DEFAULT_RADIUS, PLACE_FALLBACK, TAG_COLORS,
} from '../lib/constants';

const COLOR_NAMES = {
  coral: 'Coral', lavender: 'Lavender', mustard: 'Mustard', sage: 'Sage',
  denim: 'Denim', blush: 'Blush', citron: 'Citron', teal: 'Teal',
};

// A tap-to-edit row: label + current value + →, expanding to an inline editor.
function EditRow({ label, value, open, onToggle, children }) {
  return (
    <div className="na-card" style={{ overflow: 'hidden' }}>
      <div onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 16px', cursor: 'pointer' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="t-label">{label}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--text)',
                marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {value}
          </div>
        </div>
        <span style={{ color: 'var(--muted)', fontSize: 16, transform: open ? 'rotate(90deg)' : 'none',
              transition: 'transform .15s ease' }}>→</span>
      </div>
      {open && (
        <div style={{ padding: '4px 16px 16px', borderTop: '1.5px solid var(--border)' }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function ProfilePage({ onDone }) {
  const { deleteAccount, signOut } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [pronounSelect, setPronounSelect] = useState('they/them');
  const [customPronouns, setCustomPronouns] = useState('');
  const [tagline, setTagline] = useState('');
  const [radius, setRadius] = useState(DEFAULT_RADIUS);
  const [accentKey, setAccentKey] = useState('coral');
  const [alwaysVisible, setAlwaysVisible] = useState(true);
  const [partyCode, setPartyCode] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [selectedStickers, setSelectedStickers] = useState([]);
  const [editing, setEditing] = useState(null);        // 'name' | 'line' | 'stickers'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef(null);
  const loadedRef = useRef(false);
  const autoSaveTimerRef = useRef(null);
  const dirtyRef = useRef(false);        // an edit is waiting on the auto-save timer
  const saveRef = useRef(null);          // the latest doSave, for the unmount flush
  const hasServerRowRef = useRef(false); // a profile row exists on the server

  useEffect(() => {
    function applyProfile(src) {
      setDisplayName(src.display_name || '');
      const known = PRONOUN_OPTIONS.slice(0, -1).includes(src.pronouns);
      if (known) setPronounSelect(src.pronouns);
      else { setPronounSelect('custom'); setCustomPronouns(src.pronouns || ''); }
      setTagline(src.tagline || '');
      setRadius(src.radius_meters || DEFAULT_RADIUS);
      if (src.tag_color && TAG_COLORS.includes(src.tag_color)) setAccentKey(src.tag_color);
      setAlwaysVisible(src.always_visible !== false);
      if (src.stickers) { try { setSelectedStickers(JSON.parse(src.stickers)); } catch { /* ignore */ } }
      if (src.party_code !== undefined) setPartyCode(src.party_code || '');
    }
    async function load() {
      const localPhoto = await loadLocalPhoto();
      if (localPhoto) setPhotoPreview(localPhoto);
      let p = await readLocalProfile();
      if (isPartyExpired(p)) {
        // The party code ran out while the app was away: the party is over, so
        // come off the wall (the same thing the wall and the server do).
        p = { ...p, always_visible: false, party_code: '', party_code_set_at: '' };
        await persistProfileLocally(p);
        trackProfileSave(setVisibility(false)).catch(() => {});
      }
      if (p) applyProfile(p);
      try {
        const profile = await getMyProfile();
        if (!profile) return;
        hasServerRowRef.current = true;
        if (!p) applyProfile(profile);
        // Visibility is the one thing the server is the authority on: it may
        // have been changed on the wall or on another device.
        else setAlwaysVisible(profile.always_visible !== false);
        if (profile.photo_path && !localPhoto) setPhotoPreview(photoUrl(profile.photo_path));
      } catch {
        if (!p) setError('Couldn’t load your tag. Pull to refresh.');
      }
    }
    load().then(() => { loadedRef.current = true; });
  }, []);

  const pronouns = pronounSelect === 'custom' ? customPronouns.trim() : pronounSelect;
  const visMode = visibilityMode({ alwaysVisible, partyCode });

  function handlePickPhoto() { fileInputRef.current?.click(); }
  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    try {
      const { dataUrl, file: prepared } = await preparePickedPhoto(file);
      setPhotoPreview(dataUrl);
      setPhotoFile(prepared);
      setError('');
    } catch {
      setError('We couldn’t read that photo — try a different one.');
    }
  }

  function handleVisibility(next, { partyCode: code = '' }) {
    setAlwaysVisible(next !== 'invisible');
    if (next === 'invisible') {
      // delete the server's copy (name, photo, location, party code) now, and
      // record the choice
      setPartyCode('');
      trackProfileSave(setVisibility(false)).catch(() => {});
    } else {
      setPartyCode(code);
    }
  }

  // Returns true when the tag was saved (or there was nothing invalid to save).
  async function doSave({ silent = false } = {}) {
    dirtyRef.current = false;
    const name = displayName.trim();
    if (!name || !pronouns) { if (!silent) setError('Add your name and pronouns.'); return false; }
    if (name.length > NAME_MAX) { if (!silent) setError(`Name must be ${NAME_MAX} characters or fewer.`); return false; }
    if (pronouns.length > PRONOUNS_MAX) { if (!silent) setError(`Pronouns must be ${PRONOUNS_MAX} characters or fewer.`); return false; }
    if (tagline.trim().length > TAGLINE_MAX) { if (!silent) setError(`One line must be ${TAGLINE_MAX} characters or fewer.`); return false; }

    setError(''); setLoading(true);
    const fields = normalizeProfileFields({
      display_name: name, pronouns, tagline, radius_meters: radius,
      always_visible: alwaysVisible, tag_color: accentKey,
      stickers: selectedStickers, party_code: partyCode,
    });
    try {
      // While invisible this keeps the edit on the device only (see saveProfile).
      await trackProfileSave(saveProfile(fields, photoFile, { serverHasRow: hasServerRowRef.current }));
      hasServerRowRef.current = true;
      setSaved(true); setTimeout(() => setSaved(false), 2000);
      return true;
    } catch (err) { setError(err.message); return false; }
    finally { setLoading(false); }
  }
  saveRef.current = doSave;

  // Leaving the screen — Done, or a tab switch — must not drop an edit that's
  // still waiting on the auto-save timer.
  async function handleDone() {
    clearTimeout(autoSaveTimerRef.current);
    if (dirtyRef.current && !(await doSave())) return;   // stay to show what's wrong
    onDone();
  }
  useEffect(() => () => { if (dirtyRef.current) saveRef.current({ silent: true }); }, []);

  useEffect(() => {
    if (!loadedRef.current) return;
    clearTimeout(autoSaveTimerRef.current);
    dirtyRef.current = true;
    autoSaveTimerRef.current = setTimeout(() => doSave({ silent: true }), 700);
    return () => clearTimeout(autoSaveTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayName, pronounSelect, customPronouns, tagline, radius, accentKey, alwaysVisible, selectedStickers, partyCode, photoFile]);

  async function handleDeleteAccount() {
    setDeleting(true);
    try { await deleteAccount(); }
    catch (err) { setError(err.message); setConfirmDelete(false); setDeleting(false); }
  }

  const preview = {
    name: displayName || ' ', pronouns: pronouns || '', tagline,
    stickers: selectedStickers, photo: photoPreview, accent: accentKey, you: true,
  };
  const place = PLACE_FALLBACK;

  return (
    <div className="no-sb na-screen" style={{ padding: '0 0 96px' }}>
      {/* header */}
      <div style={{ padding: '28px 22px 0', display: 'flex', alignItems: 'flex-end',
                    justifyContent: 'space-between' }}>
        <div>
          <div className="t-label">
            {visMode === 'invisible' ? 'Hidden right now' : `Visible ${place && place !== 'nearby' ? `at ${place}` : 'nearby'}`}
          </div>
          <div className="t-display" style={{ fontSize: 40, letterSpacing: '-1.2px', marginTop: 6 }}>
            My tag
          </div>
        </div>
        <button onClick={handleDone} className="na-textbtn" style={{
              fontWeight: 800, fontSize: 13, color: 'var(--orchid-dk)',
              display: 'flex', alignItems: 'center', gap: 6 }}>
          {loading ? 'Saving…' : saved ? 'Saved ✓' : 'Done'}
        </button>
      </div>

      {/* live preview */}
      <div style={{ padding: '12px 26px 0' }}>
        <MyTagPreview person={preview} onPhotoClick={handlePickPhoto} />
        <div style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--muted)', marginTop: 8 }}>
          This is exactly what the room sees.
        </div>
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />

      {/* visibility control — above the rows, because it's the only control that
          changes who can see you */}
      <div style={{ padding: '14px 22px 0' }}>
        <VisibilityControl value={visMode} onChange={handleVisibility} place={place}
          partyCode={partyCode} note={visMode === 'nearby'
            ? { lead: 'Visible to people nearby.', rest: ' Close the app and your tag is deleted from our server within half an hour.' } : undefined} />
      </div>

      {/* edit rows */}
      <div style={{ padding: '12px 22px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <EditRow label="Name" value={displayName || 'Add your name'}
                 open={editing === 'name'} onToggle={() => setEditing(e => e === 'name' ? null : 'name')}>
          <input className="na-field" value={displayName} maxLength={NAME_MAX}
                 onChange={e => setDisplayName(e.target.value)} placeholder="What people call you"
                 style={{ marginTop: 12 }} />
          <div className="t-label" style={{ margin: '14px 0 8px' }}>Pronouns</div>
          <PronounChips options={PRONOUN_OPTIONS} value={pronounSelect} onChange={setPronounSelect} />
          {pronounSelect === 'custom' && (
            <input className="na-field" style={{ marginTop: 10 }} value={customPronouns} maxLength={PRONOUNS_MAX}
                   onChange={e => setCustomPronouns(e.target.value)} placeholder="e.g. xe/xem, fae/faer…" />
          )}
        </EditRow>

        <EditRow label="One line about right now" value={tagline || 'Add a line'}
                 open={editing === 'line'} onToggle={() => setEditing(e => e === 'line' ? null : 'line')}>
          <input className="na-field" value={tagline} maxLength={TAGLINE_MAX} style={{ marginTop: 12 }}
                 onChange={e => setTagline(e.target.value)} placeholder="Here for the oat cortado" />
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>
            {tagline.length} of {TAGLINE_MAX} characters. This is the line under your name on the wall.
          </div>
        </EditRow>

        <EditRow label="Stickers" value={selectedStickers.length ? `${selectedStickers.length} of ${MAX_STICKERS} used` : 'None yet'}
                 open={editing === 'stickers'} onToggle={() => setEditing(e => e === 'stickers' ? null : 'stickers')}>
          <div style={{ marginTop: 12 }}>
            <StickerPicker value={selectedStickers} onChange={setSelectedStickers} />
          </div>
        </EditRow>

        <EditRow label="Tag colour" value={COLOR_NAMES[accentKey] || 'Coral'}
                 open={editing === 'colour'} onToggle={() => setEditing(e => e === 'colour' ? null : 'colour')}>
          <div style={{ marginTop: 14 }}>
            <PaintboxPicker value={accentKey} onChange={setAccentKey} />
          </div>
        </EditRow>
      </div>

      {error && <p style={{ padding: '0 22px', color: 'var(--coral-dk)', fontWeight: 700, fontSize: 13.5 }}>{error}</p>}

      {/* account */}
      <div style={{ margin: '18px 22px 0', paddingTop: 18, borderTop: '1.5px solid var(--border)' }}>
        {!confirmDelete ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <button type="button" onClick={signOut} className="na-textbtn" style={{
                  color: 'var(--text)', fontWeight: 800, fontSize: 13.5, padding: 0 }}>
              Sign out
            </button>
            <button type="button" onClick={() => setConfirmDelete(true)} className="na-textbtn" style={{
                  color: 'var(--muted)', fontWeight: 700, fontSize: 13.5, padding: 0 }}>
              Delete account
            </button>
          </div>
        ) : (
          <div className="na-danger-card" style={{ padding: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--coral-dk)' }}>Delete your account?</div>
            <div className="t-body" style={{ fontSize: 12.5, margin: '6px 0 12px' }}>
              This erases your tag, photo, and account immediately. There’s no undo.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="na-btn" style={{ flex: 1, minHeight: 46, background: 'var(--coral-dk)' }}
                      disabled={deleting} onClick={handleDeleteAccount}>
                {deleting ? 'Deleting…' : 'Delete everything'}
              </button>
              <button className="na-btn na-btn--ghost" style={{ flex: 1, minHeight: 46 }}
                      onClick={() => setConfirmDelete(false)}>Keep it</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
