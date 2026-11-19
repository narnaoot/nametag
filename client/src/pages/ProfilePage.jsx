import { useState, useRef } from 'react';
import { useAuth } from '../auth/useAuth';
import { useTagEditor, pronounsOf } from '../hooks/useTagEditor';
import { visibilityMode } from '../lib/profile';
import MyTagPreview from '../components/MyTagPreview';
import VisibilityControl from '../components/VisibilityControl';
import StickerPicker from '../components/StickerPicker';
import PronounChips from '../components/PronounChips';
import PaintboxPicker from '../components/PaintboxPicker';
import {
  PRONOUN_OPTIONS, NAME_MAX, PRONOUNS_MAX, TAGLINE_MAX, MAX_STICKERS, PLACE_FALLBACK,
} from '../lib/constants';

// My tag — the editor for your own tag. Loading, editing and saving live in
// useTagEditor; this file is layout.
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
  const editor = useTagEditor();
  const { tag, edit } = editor;
  const [open, setOpen] = useState(null);        // the expanded row: 'name' | 'line' | 'stickers' | 'colour'
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const fileInputRef = useRef(null);

  if (!editor.ready) return null;   // reading the device's copy takes a moment

  const toggle = (row) => setOpen(o => (o === row ? null : row));
  const visMode = visibilityMode({ alwaysVisible: tag.visible, partyCode: tag.partyCode });
  const error = editor.error || deleteError;
  const place = PLACE_FALLBACK;
  const preview = {
    name: tag.name || ' ', pronouns: pronounsOf(tag), tagline: tag.tagline,
    stickers: tag.stickers, photo: editor.photoPreview, accent: tag.color, you: true,
  };

  async function handleDone() {
    if (await editor.finish()) onDone();
  }
  function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) editor.pickPhoto(file);
  }
  async function handleDeleteAccount() {
    setDeleting(true);
    try { await deleteAccount(); }
    catch (err) { setDeleteError(err.message); setConfirmDelete(false); setDeleting(false); }
  }

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
          {editor.saving ? 'Saving…' : editor.saved ? 'Saved ✓' : 'Done'}
        </button>
      </div>

      {/* live preview */}
      <div style={{ padding: '12px 26px 0' }}>
        <MyTagPreview person={preview} onPhotoClick={() => fileInputRef.current?.click()} />
        <div style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--muted)', marginTop: 8 }}>
          This is exactly what the room sees.
        </div>
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />

      {/* visibility control — above the rows, because it's the only control that
          changes who can see you */}
      <div style={{ padding: '14px 22px 0' }}>
        <VisibilityControl value={visMode} onChange={editor.setVisibilityMode} place={place}
          partyCode={tag.partyCode} note={visMode === 'nearby'
            ? { lead: 'Visible to people nearby.', rest: ' Close the app and your tag is deleted from our server within half an hour.' } : undefined} />
      </div>

      {/* edit rows */}
      <div style={{ padding: '12px 22px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <EditRow label="Name" value={tag.name || 'Add your name'} open={open === 'name'} onToggle={() => toggle('name')}>
          <input className="na-field" value={tag.name} maxLength={NAME_MAX}
                 onChange={e => edit({ name: e.target.value })} placeholder="What people call you"
                 style={{ marginTop: 12 }} />
          <div className="t-label" style={{ margin: '14px 0 8px' }}>Pronouns</div>
          <PronounChips options={PRONOUN_OPTIONS} value={tag.pronounChoice} onChange={p => edit({ pronounChoice: p })} />
          {tag.pronounChoice === 'custom' && (
            <input className="na-field" style={{ marginTop: 10 }} value={tag.customPronouns} maxLength={PRONOUNS_MAX}
                   onChange={e => edit({ customPronouns: e.target.value })} placeholder="e.g. xe/xem, fae/faer…" />
          )}
        </EditRow>

        <EditRow label="One line about right now" value={tag.tagline || 'Add a line'} open={open === 'line'} onToggle={() => toggle('line')}>
          <input className="na-field" value={tag.tagline} maxLength={TAGLINE_MAX} style={{ marginTop: 12 }}
                 onChange={e => edit({ tagline: e.target.value })} placeholder="Here for the oat cortado" />
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>
            {tag.tagline.length} of {TAGLINE_MAX} characters. This is the line under your name on the wall.
          </div>
        </EditRow>

        <EditRow label="Stickers" value={tag.stickers.length ? `${tag.stickers.length} of ${MAX_STICKERS} used` : 'None yet'}
                 open={open === 'stickers'} onToggle={() => toggle('stickers')}>
          <div style={{ marginTop: 12 }}>
            <StickerPicker value={tag.stickers} onChange={stickers => edit({ stickers })} />
          </div>
        </EditRow>

        <EditRow label="Tag colour" value={COLOR_NAMES[tag.color] || 'Coral'} open={open === 'colour'} onToggle={() => toggle('colour')}>
          <div style={{ marginTop: 14 }}>
            <PaintboxPicker value={tag.color} onChange={color => edit({ color })} />
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
