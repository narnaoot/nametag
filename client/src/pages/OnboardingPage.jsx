import { useState, useRef } from 'react';
import { updateProfile } from '../api';
import { persistProfileLocally, savePhotoLocally } from '../profileStorage';
import { Avatar } from '../components/Avatar';
import VisibilityControl from '../components/VisibilityControl';
import PartyCodeSheet from '../components/PartyCodeSheet';
import StickerPicker from '../components/StickerPicker';
import {
  ONBOARDING_PRONOUNS, ONBOARDING_NAME_MAX, TAGLINE_MAX, DEFAULT_RADIUS, PLACE_FALLBACK,
} from '../constants';

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
      <button onClick={onBack} disabled={!canBack} style={{ background: 'none', border: 'none',
            cursor: canBack ? 'pointer' : 'default', fontSize: 20, color: 'var(--muted)',
            opacity: canBack ? 1 : 0.35, padding: 0 }}>←</button>
      <Dashes step={canBack ? 2 : 1} />
      <button onClick={onSkip} style={{ background: 'none', border: 'none', cursor: 'pointer',
            fontWeight: 800, fontSize: 12, color: 'var(--muted)', padding: 0 }}>Skip</button>
    </div>
  );
}

export default function OnboardingPage({ onDone }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [customOpen, setCustomOpen] = useState(false);
  const [tagline, setTagline] = useState('');
  const [stickers, setStickers] = useState([]);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [visMode, setVisMode] = useState('nearby');
  const [partyCode, setPartyCode] = useState('');
  const [showParty, setShowParty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const place = PLACE_FALLBACK;

  function pickPronoun(p) {
    setCustomOpen(false);
    setPronouns(prev => (prev === p ? '' : p));
  }
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
    setVisMode(next);
    if (next === 'nearby') setPartyCode('');
  }

  async function finish() {
    setSaving(true); setError('');
    const alwaysVisible = visMode !== 'invisible';
    const fields = {
      display_name: name.trim() || 'Someone', pronouns: pronouns || 'they/them',
      tagline: tagline.trim(), radius_meters: DEFAULT_RADIUS,
      always_visible: alwaysVisible, tag_color: 'coral',
      stickers: JSON.stringify(stickers), party_code: visMode === 'party' ? partyCode.trim() : '',
    };
    try {
      const fd = new FormData();
      Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
      if (photoFile) fd.append('photo', photoFile);
      await updateProfile(fd);
      await persistProfileLocally(fields);
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
          <div className="t-label" style={{ fontSize: 10 }}>Step 1 of 2</div>
          <div className="t-display" style={{ fontSize: 34, letterSpacing: '-1px', lineHeight: 1.05 }}>
            What should people <em>call you</em>?
          </div>
        </div>

        {/* type onto the coral tag */}
        <div style={{ marginTop: 26, background: 'var(--coral-lt)', border: '1.5px solid var(--border)',
              borderRadius: 'var(--r-tag)', boxShadow: 'var(--shadow-card)', transform: 'rotate(-1.4deg)',
              padding: '20px 18px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 9, letterSpacing: '.17em', textTransform: 'uppercase',
                color: 'var(--muted)' }}>hello my name is</div>
          <div style={{ width: '100%', borderBottom: '1.5px solid var(--coral)', paddingBottom: 6 }}>
            <input autoFocus value={name} maxLength={ONBOARDING_NAME_MAX}
              onChange={e => setName(e.target.value)} placeholder="Maya"
              style={{ width: '100%', textAlign: 'center', border: 'none', outline: 'none',
                background: 'none', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 42,
                letterSpacing: '-1.2px', color: 'var(--text)', caretColor: 'var(--coral)', lineHeight: 1.1 }} />
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
            First name or a nickname — whatever you’d say out loud.
          </div>
        </div>

        {/* pronouns */}
        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="t-label" style={{ fontSize: 10 }}>Pronouns</div>
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
          <div className="t-label" style={{ fontSize: 10 }}>One line about right now</div>
          <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)',
                borderRadius: 'var(--r)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
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
        <div className="t-label" style={{ fontSize: 10 }}>Step 2 of 2</div>
        <div className="t-display" style={{ fontSize: 34, letterSpacing: '-1px', lineHeight: 1.05 }}>
          Give them a <em>face</em> to find.
        </div>
      </div>

      <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 18 }}>
        <div onClick={() => fileInputRef.current?.click()} style={{ cursor: 'pointer' }}>
          <Avatar person={{ photo: photoPreview, name: name || '?' }} size={112} border={3}
                  ring="var(--coral)" shadow="var(--shadow-raise)" tint="var(--coral-lt)" deep="var(--coral-dk)" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button type="button" onClick={() => fileInputRef.current?.click()} style={{ background: 'var(--surface)',
                border: '1.5px solid var(--border)', borderRadius: 'var(--r-pill)', padding: '10px 16px',
                fontWeight: 800, fontSize: 13, color: 'var(--text)', cursor: 'pointer' }}>Take a photo</button>
          <button type="button" onClick={() => fileInputRef.current?.click()} style={{ background: 'var(--surface)',
                border: '1.5px solid var(--border)', borderRadius: 'var(--r-pill)', padding: '10px 16px',
                fontWeight: 800, fontSize: 13, color: 'var(--text)', cursor: 'pointer' }}>Choose from library</button>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.5 }}>A cropped circle, only ever this small.</div>
        </div>
      </div>

      <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="t-label" style={{ fontSize: 10 }}>Pick up to three stickers</div>
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

      {showParty && (
        <PartyCodeSheet initial={partyCode}
          onJoin={(code) => { setShowParty(false); setPartyCode(code.toUpperCase()); setVisMode('party'); }}
          onStayVisible={() => { setShowParty(false); setVisMode('nearby'); setPartyCode(''); }}
          onClose={() => setShowParty(false)} />
      )}
    </div>
  );
}
