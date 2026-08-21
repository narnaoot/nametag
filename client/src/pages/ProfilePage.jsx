import { useState, useEffect, useRef } from 'react';
import { getMyProfile, updateProfile, photoUrl, setVisibility } from '../api';
import { useAuth } from '../useAuth';
import {
  savePhotoLocally, loadLocalPhoto, persistProfileLocally, readLocalProfile,
} from '../profileStorage';
import MyTagPreview from '../components/MyTagPreview';
import VisibilityControl from '../components/VisibilityControl';
import PartyCodeSheet from '../components/PartyCodeSheet';
import StickerPicker from '../components/StickerPicker';
import PronounChips from '../components/PronounChips';
import PaintboxPicker from '../components/PaintboxPicker';
import {
  PRONOUN_OPTIONS, NAME_MAX, PRONOUNS_MAX, TAGLINE_MAX, MAX_STICKERS,
  DEFAULT_RADIUS, PLACE_FALLBACK, TAG_COLORS,
} from '../constants';

const COLOR_NAMES = {
  coral: 'Coral', lavender: 'Lavender', mustard: 'Mustard', sage: 'Sage',
  denim: 'Denim', blush: 'Blush', citron: 'Citron', teal: 'Teal',
};

// A tap-to-edit row: label + current value + →, expanding to an inline editor.
function EditRow({ label, value, open, onToggle, children }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)',
                  borderRadius: 'var(--r)', overflow: 'hidden' }}>
      <div onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 16px', cursor: 'pointer' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="t-label" style={{ fontSize: 9.5 }}>{label}</div>
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
  const [showParty, setShowParty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef(null);
  const loadedRef = useRef(false);
  const autoSaveTimerRef = useRef(null);

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
      const p = await readLocalProfile();
      if (p) applyProfile(p);
      try {
        const profile = await getMyProfile();
        if (!profile) return;
        if (!p) applyProfile(profile);
        if (profile.photo_path && !localPhoto) setPhotoPreview(photoUrl(profile.photo_path));
      } catch {
        if (!p) setError('Couldn’t load your tag. Pull to refresh.');
      }
    }
    load().then(() => { loadedRef.current = true; });
  }, []);

  const pronouns = pronounSelect === 'custom' ? customPronouns.trim() : pronounSelect;
  const visMode = !alwaysVisible ? 'invisible' : (partyCode ? 'party' : 'nearby');

  function handlePickPhoto() { fileInputRef.current?.click(); }
  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = async (ev) => { setPhotoPreview(ev.target.result); await savePhotoLocally(ev.target.result); };
    reader.readAsDataURL(file);
    setPhotoFile(file);
  }

  function handleVisibility(next) {
    if (next === 'party') { setShowParty(true); return; }
    if (next === 'invisible') {
      setAlwaysVisible(false);
      setVisibility(false).catch(() => {});   // clear server photo + location now
    } else {
      setAlwaysVisible(true);
      setPartyCode('');
    }
  }

  async function doSave({ silent = false } = {}) {
    const name = displayName.trim();
    if (!name || !pronouns) { if (!silent) setError('Add your name and pronouns.'); return; }
    if (name.length > NAME_MAX) { if (!silent) setError(`Name must be ${NAME_MAX} characters or fewer.`); return; }
    if (pronouns.length > PRONOUNS_MAX) { if (!silent) setError(`Pronouns must be ${PRONOUNS_MAX} characters or fewer.`); return; }
    if (tagline.trim().length > TAGLINE_MAX) { if (!silent) setError(`One line must be ${TAGLINE_MAX} characters or fewer.`); return; }

    setError(''); setLoading(true);
    const fields = {
      display_name: name, pronouns, tagline: tagline.trim(), radius_meters: radius,
      always_visible: alwaysVisible, tag_color: accentKey,
      stickers: JSON.stringify(selectedStickers), party_code: partyCode.trim(),
    };
    const fd = new FormData();
    Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
    if (photoFile) fd.append('photo', photoFile);
    try {
      await updateProfile(fd);
      await persistProfileLocally(fields);
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    if (!loadedRef.current) return;
    clearTimeout(autoSaveTimerRef.current);
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
          <div className="t-label" style={{ fontSize: 10 }}>
            {visMode === 'invisible' ? 'Hidden right now' : `Visible ${place && place !== 'nearby' ? `at ${place}` : 'nearby'}`}
          </div>
          <div className="t-display" style={{ fontSize: 40, letterSpacing: '-1.2px', marginTop: 6 }}>
            My <em>tag</em>
          </div>
        </div>
        <button onClick={onDone} style={{ background: 'none', border: 'none', cursor: 'pointer',
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
            ? { lead: 'Visible to people nearby.', rest: ' Turns itself off when you leave.' } : undefined} />
      </div>

      {/* edit rows */}
      <div style={{ padding: '12px 22px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <EditRow label="Name" value={displayName || 'Add your name'}
                 open={editing === 'name'} onToggle={() => setEditing(e => e === 'name' ? null : 'name')}>
          <input className="na-field" value={displayName} maxLength={NAME_MAX}
                 onChange={e => setDisplayName(e.target.value)} placeholder="What people call you"
                 style={{ marginTop: 12 }} />
          <div className="t-label" style={{ fontSize: 9.5, margin: '14px 0 8px' }}>Pronouns</div>
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
            <button type="button" onClick={signOut} style={{ background: 'none', border: 'none',
                  cursor: 'pointer', color: 'var(--text)', fontWeight: 800, fontSize: 13.5, padding: 0 }}>
              Sign out
            </button>
            <button type="button" onClick={() => setConfirmDelete(true)} style={{ background: 'none',
                  border: 'none', cursor: 'pointer', color: 'var(--muted)', fontWeight: 700, fontSize: 13.5, padding: 0 }}>
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

      {showParty && (
        <PartyCodeSheet initial={partyCode}
          onJoin={(code) => { setShowParty(false); setPartyCode(code.toUpperCase()); setAlwaysVisible(true); }}
          onStayVisible={() => { setShowParty(false); setAlwaysVisible(true); setPartyCode(''); }}
          onClose={() => setShowParty(false)} />
      )}
    </div>
  );
}
