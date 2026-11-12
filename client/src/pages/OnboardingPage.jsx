import { useState, useRef } from 'react';
import { preparePickedPhoto } from '../lib/imageCrop';
import { normalizeProfileFields } from '../lib/profile';
import { saveProfile } from '../lib/profileSync';
import { Avatar } from '../components/Avatar';
import { Eyebrow } from '../components/TagBits';
import VisibilityControl from '../components/VisibilityControl';
import StickerPicker from '../components/StickerPicker';
import PaintboxPicker from '../components/PaintboxPicker';
import { accentTrio } from '../lib/colors';
import {
  ONBOARDING_PRONOUNS, ONBOARDING_NAME_MAX, TAGLINE_MAX, DEFAULT_RADIUS, PLACE_FALLBACK,
} from '../lib/constants';

// Two steps, both skippable. You type onto the tag itself in step 1; you give it
// a face and choose who sees you in step 2. Progress is a two-dash indicator.
function Dashes({ step }) {
  return (
    <div style={{ display: 'flex', gap: 5 }}>
      <div style={{ width: 26, height: 4, borderRadius: 99, background: 'var(--orchid)' }} />
      <div style={{ width: 26, height: 4, borderRadius: 99,
            background: step >= 2 ? 'var(--orchid)' : 'var(--border)' }} />
    </div>
  );
}

function TopBar({ onBack, onSkip, canBack }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <button onClick={onBack} disabled={!canBack} className="na-textbtn" style={{
            cursor: canBack ? 'pointer' : 'default', fontSize: 20, color: 'var(--muted)',
            opacity: canBack ? 1 : 0.35, padding: 0 }}>←</button>
      <Dashes step={canBack ? 2 : 1} />
      <button onClick={onSkip} className="na-textbtn" style={{
            fontWeight: 800, fontSize: 12, color: 'var(--muted)', padding: 0 }}>Skip</button>
    </div>
  );
}

export default function OnboardingPage({ onDone }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [accentKey, setAccentKey] = useState('coral');
  const [customOpen, setCustomOpen] = useState(false);
  const [tagline, setTagline] = useState('');
  const [stickers, setStickers] = useState([]);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [visMode, setVisMode] = useState('nearby');
  const [partyCode, setPartyCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const place = PLACE_FALLBACK;
  const trio = accentTrio(accentKey);

  function pickPronoun(p) {
    setCustomOpen(false);
    setPronouns(prev => (prev === p ? '' : p));
  }
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
    setVisMode(next);
    if (next !== 'invisible') setPartyCode(code);
  }

  async function finish() {
    setSaving(true); setError('');
    const fields = normalizeProfileFields({
      display_name: name.trim() || 'Someone', pronouns: pronouns || 'they/them',
      tagline, radius_meters: DEFAULT_RADIUS,
      always_visible: visMode !== 'invisible', tag_color: accentKey,
      stickers, party_code: visMode === 'party' ? partyCode : '',
    });
    try {
      // A brand-new account has no profile row yet. Starting out invisible, the
      // tag stays on this device (saveProfile only records the choice).
      await saveProfile(fields, photoFile, { serverHasRow: false });
      onDone();
    } catch (err) { setError(err.message || 'Something went wrong — try again.'); setSaving(false); }
  }

  const frame = {
    minHeight: '100vh', maxWidth: 430, margin: '0 auto', position: 'relative',
    background: 'var(--bg)', display: 'flex', flexDirection: 'column',
    padding: '40px 26px 0',
  };
  const primaryBtn = {
    position: 'fixed', left: 26, right: 26, bottom: 'max(38px, env(safe-area-inset-bottom, 38px))',
    maxWidth: 378, margin: '0 auto',
  };

  if (step === 1) {
    const chips = [...ONBOARDING_PRONOUNS, 'write my own', 'skip'];
    return (
      <div className="no-sb" style={frame}>
        <TopBar canBack={false} onBack={() => {}} onSkip={onDone} />

        <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="t-label">Step 1 of 2</div>
          <div className="t-display" style={{ fontSize: 34, letterSpacing: '-1px', lineHeight: 1.05 }}>
            What should people <em>call you</em>?
          </div>
        </div>

        {/* type onto your tag, in the colour you pick */}
        <div style={{ marginTop: 26, background: trio.tint, border: '1.5px solid var(--border)',
              borderRadius: 'var(--r-tag)', boxShadow: 'var(--shadow-card)', transform: 'rotate(-1.4deg)',
              padding: '20px 18px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <Eyebrow style={{ fontSize: 9 }} />
          <div style={{ width: '100%', borderBottom: `1.5px solid ${trio.hue}`, paddingBottom: 6 }}>
            <input autoFocus value={name} maxLength={ONBOARDING_NAME_MAX}
              onChange={e => setName(e.target.value)} placeholder="Maya"
              style={{ width: '100%', textAlign: 'center', border: 'none', outline: 'none',
                background: 'none', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 42,
                letterSpacing: '-1.2px', color: 'var(--text)', caretColor: trio.hue, lineHeight: 1.1 }} />
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
            First name or a nickname — whatever you’d say out loud.
          </div>
        </div>

        {/* colour */}
        <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="t-label">Your tag colour</div>
          <PaintboxPicker value={accentKey} onChange={setAccentKey} />
        </div>

        {/* pronouns */}
        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="t-label">Pronouns</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {chips.map(opt => {
              const isCustom = opt === 'write my own';
              const isSkip = opt === 'skip';
              const on = isCustom ? customOpen : (!isSkip && pronouns === opt);
              return (
                <button key={opt} type="button" className="na-chip" data-on={on ? 'true' : 'false'}
                  onClick={() => isCustom ? (setCustomOpen(v => !v), setPronouns(''))
                    : isSkip ? (setPronouns(''), setCustomOpen(false))
                    : pickPronoun(opt)}
                  style={{ color: (isCustom || isSkip) && !on ? 'var(--muted)' : undefined }}>
                  {isCustom ? '+ write my own' : opt}
                </button>
              );
            })}
          </div>
          {customOpen && (
            <input className="na-field" autoFocus value={pronouns} maxLength={30}
              onChange={e => setPronouns(e.target.value)} placeholder="e.g. xe/xem" />
          )}
        </div>

        {/* one line */}
        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 120 }}>
          <div className="t-label">One line about right now</div>
          <div className="na-card" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input value={tagline} maxLength={TAGLINE_MAX} onChange={e => setTagline(e.target.value)}
              placeholder="Here for the oat cortado"
              style={{ border: 'none', outline: 'none', background: 'none', fontFamily: 'var(--font-display)',
                fontSize: 17, lineHeight: 1.4, color: 'var(--text)', width: '100%' }} />
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>
              {tagline.length} of {TAGLINE_MAX} characters. This is the line under your name on the wall.
            </div>
          </div>
        </div>

        <button className="na-btn" style={primaryBtn} onClick={() => setStep(2)}>Next → photo</button>
      </div>
    );
  }

  // step 2
  return (
    <div className="no-sb" style={frame}>
      <TopBar canBack onBack={() => setStep(1)} onSkip={finish} />
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />

      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="t-label">Step 2 of 2</div>
        <div className="t-display" style={{ fontSize: 34, letterSpacing: '-1px', lineHeight: 1.05 }}>
          Give them a <em>face</em> to find.
        </div>
      </div>

      <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 18 }}>
        <div onClick={() => fileInputRef.current?.click()} style={{ cursor: 'pointer' }}>
          <Avatar person={{ photo: photoPreview, name: name || '?' }} size={112} border={3}
                  ring={trio.hue} shadow="var(--shadow-raise)" tint={trio.tint} deep={trio.deep} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button type="button" onClick={() => fileInputRef.current?.click()} className="na-pill-btn" style={{ padding: '10px 16px' }}>Take a photo</button>
          <button type="button" onClick={() => fileInputRef.current?.click()} className="na-pill-btn" style={{ padding: '10px 16px' }}>Choose from library</button>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.5 }}>A cropped circle, only ever this small.</div>
        </div>
      </div>

      <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="t-label">Pick up to three stickers</div>
        <StickerPicker value={stickers} onChange={setStickers} />
      </div>

      <div style={{ marginTop: 24, marginBottom: 120 }}>
        <VisibilityControl value={visMode} onChange={handleVisibility} label="Who can see you"
          place={place} partyCode={partyCode}
          note={visMode === 'nearby'
            ? { lead: 'Visible to people nearby.', rest: ' You can change this from the wall at any time.' } : undefined} />
      </div>

      {error && <p style={{ color: 'var(--coral-dk)', fontWeight: 700, fontSize: 13.5, textAlign: 'center' }}>{error}</p>}

      <button className="na-btn" style={primaryBtn} disabled={saving} onClick={finish}>
        {saving ? 'Sticking it up…' : 'Look around me'}
      </button>
    </div>
  );
}
