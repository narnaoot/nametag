import { useState, useEffect } from 'react';
import { getMyProfile } from '../api';
import { PLACE_FALLBACK } from '../constants';

// Privacy is a top-level tab, not a settings row, so it can be read before
// anyone is asked to be visible. It opens with what is true right now (current
// visibility, with the way to change it in the same card) and answers with four
// plain statements about what is true always — no tint coding, because these
// are not categories and colouring them would imply a ranking.

// NOTE: these claims are NOT signed off by engineering. The first card is a
// placeholder from the design and MUST be replaced with a verified statement
// before shipping. See redesign/README.md → "Open questions".
const STATEMENTS = [
  {
    claim: 'These points need to be modified to reflect actual privacy practices.',
    detail: null,
    placeholder: true,
  },
  {
    claim: 'Nothing is kept after you leave',
    detail: 'Visibility switches itself off, your tag disappears from the wall, and no record is kept that you were there.',
  },
  {
    claim: 'Names you remember stay on your phone',
    detail: 'Saving a name copies it to your device. The other person is never told that you did.',
  },
  {
    claim: 'Your photo is only ever a small circle',
    detail: 'It is cropped on your phone before it is sent, and never shown larger than it is on the tag.',
  },
];

function stateCopy(profile, place) {
  const active = profile ? (profile.always_visible !== false || profile.is_active) : true;
  if (!active) {
    return { title: 'Invisible', line: 'No one nearby can see your tag right now.' };
  }
  if (profile?.party_code) {
    return { title: `Visible in party ${profile.party_code}`, line: 'Only people who type the same code can see you.' };
  }
  const at = place && place !== 'nearby' ? `at ${place}` : 'nearby';
  return { title: 'Visible to people nearby', line: `People ${at} with Nametag open can see your tag.` };
}

export default function PrivacyPage({ onChangeVisibility }) {
  const [profile, setProfile] = useState(null);
  useEffect(() => { getMyProfile().then(setProfile).catch(() => {}); }, []);
  const place = PLACE_FALLBACK;
  const now = stateCopy(profile, place);

  return (
    <div className="no-sb na-screen" style={{ padding: '0 0 96px' }}>
      <div style={{ padding: '30px 22px 0' }}>
        <div className="t-label" style={{ fontSize: 10 }}>Nametag</div>
        <div className="t-display" style={{ fontSize: 40, letterSpacing: '-1.2px', marginTop: 6 }}>
          Priv<em>acy</em>
        </div>
      </div>

      {/* right now — sage, with the way to change it in the same card */}
      <div onClick={onChangeVisibility} className="nt-tappable" style={{ margin: '16px 22px 0',
            background: 'var(--sage-lt)', border: '1.5px solid var(--sage)', borderRadius: 'var(--r)',
            padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="t-label" style={{ fontSize: 9.5 }}>Right now</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--text)',
                marginTop: 4, lineHeight: 1.3 }}>{now.title}</div>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 3 }}>{now.line}</div>
        </div>
        <span style={{ color: 'var(--sage-dk)', fontSize: 16, fontWeight: 800 }}>→</span>
      </div>

      <div style={{ padding: '22px 22px 0' }}>
        <div className="t-label" style={{ fontSize: 10 }}>What is true always</div>
      </div>

      <div style={{ padding: '12px 22px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {STATEMENTS.map((s, i) => (
          <div key={i} style={{ background: 'var(--surface)', border: '1.5px solid var(--border)',
                borderRadius: 'var(--r)', padding: '13px 15px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16.5, color: 'var(--text)',
                  lineHeight: 1.3, fontStyle: s.placeholder ? 'italic' : 'normal',
                  opacity: s.placeholder ? 0.85 : 1 }}>{s.claim}</div>
            {s.detail && (
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4, lineHeight: 1.5 }}>{s.detail}</div>
            )}
          </div>
        ))}
      </div>

      <div style={{ padding: '16px 22px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface)',
              border: '1.5px solid var(--border)', borderRadius: 'var(--r)', padding: '12px 15px' }}>
          <div style={{ flex: 1, minWidth: 0, fontWeight: 800, fontSize: 13, color: 'var(--text)' }}>
            Read the whole policy
          </div>
          <span style={{ color: 'var(--muted)', fontSize: 16 }}>→</span>
        </div>
      </div>
    </div>
  );
}
