import { useState } from 'react';
import { updateProfile } from '../api';
import { persistProfileLocally } from '../profileStorage';
import { PersonCard } from '../components/Badge';
import PaintboxPicker from '../components/PaintboxPicker';
import PronounChips from '../components/PronounChips';
import { ONBOARDING_PRONOUNS, ONBOARDING_NAME_MAX, STICKER_TILT } from '../constants';

// First-run "write your name on your tag" moment, shown right after register.
// The badge preview fills in live as the user types.
// Ported from the design handoff (onboarding.jsx).
export default function OnboardingPage({ onDone }) {
  const [name, setName] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [accentKey, setAccentKey] = useState('teal');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const ready = name.trim().length > 0 && !saving;

  const draft = {
    name: name.trim() || ' ',
    pronouns: pronouns || ' ',
    tagline: '',
    stickers: [],
    distance: null,
    photo: null,
  };

  async function finish() {
    if (!ready) return;
    setSaving(true);
    setError('');
    const fields = {
      display_name: name.trim(),
      pronouns: pronouns || 'they/them',
      tagline: '',
      radius_meters: 100,
      always_visible: true,
      tag_color: accentKey,
      stickers: JSON.stringify([]),
      party_code: '',
    };
    try {
      const fd = new FormData();
      Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
      await updateProfile(fd);
      await persistProfileLocally(fields);
      onDone();
    } catch (err) {
      setError(err.message || 'Something went wrong — try again.');
      setSaving(false);
    }
  }

  return (
    <div className="dotgrid no-sb na-screen-hero" style={{ padding: '70px 26px 40px' }}>
      <div className="t-label" style={{ color: 'var(--primary)' }}>One last thing</div>
      <div className="t-display" style={{ fontSize: 30, textAlign: 'center', marginTop: 8, lineHeight: 1.1 }}>
        Write your name<br />on your <em>tag</em>
      </div>

      {/* live badge */}
      <div className="nt-pop" style={{ marginTop: 22, marginBottom: 26, transform: `rotate(-${STICKER_TILT}deg)` }}>
        <PersonCard person={draft} accent={`var(--${accentKey})`} variant="sticker" tilt={0} />
      </div>

      <div style={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <input className="na-field" autoFocus type="text" placeholder="Your name" maxLength={ONBOARDING_NAME_MAX}
               value={name} onChange={e => setName(e.target.value)}
               style={{ textAlign: 'center', fontWeight: 800, fontSize: 17 }} />

        {/* pronouns — tap again to clear */}
        <PronounChips options={ONBOARDING_PRONOUNS} value={pronouns} justify="center"
                      onChange={p => setPronouns(prev => prev === p ? '' : p)} />

        {/* paintbox */}
        <div style={{ marginTop: 2 }}>
          <PaintboxPicker value={accentKey} onChange={setAccentKey} justify="center" />
        </div>

        {error && <p style={{ color: 'var(--danger)', fontWeight: 700, fontSize: 13.5, textAlign: 'center', margin: 0 }}>{error}</p>}

        <button className="na-btn" disabled={!ready} onClick={finish} style={{
          marginTop: 6, opacity: ready ? 1 : 0.45,
          cursor: ready ? 'pointer' : 'default',
        }}>
          {saving ? 'Sticking…' : 'Stick it on →'}
        </button>
        <div className="t-label" style={{ textAlign: 'center', fontSize: 9.5 }}>
          You can add a photo &amp; stickers later
        </div>
      </div>
    </div>
  );
}
