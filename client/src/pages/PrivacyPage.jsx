import { useState, useEffect } from 'react';
import { getMyProfile } from '../api';
import { PLACE_FALLBACK } from '../constants';
import PolicyDocument from './PolicyDocument';

// Privacy is a top-level tab, not a settings row, so it can be read before
// anyone is asked to be visible. It opens with what is true right now (current
// visibility, with the way to change it in the same card) and answers with four
// plain statements about what is true always — no tint coding, because these
// are not categories and colouring them would imply a ranking.

// These four statements describe the app's ACTUAL behaviour (server routes +
// cleanup.js + on-device storage), not aspirations. If you change how data is
// stored, change these too. See REDESIGN_QUESTIONS.md for the audit.
const STATEMENTS = [
  {
    claim: 'Your tag only lives on our server while you’re visible',
    detail: 'Your name, one line, current location, and a photo — cropped to a small circle on your phone before it’s sent — are kept just long enough to show you to people nearby. Go invisible and they’re deleted right away; leave them a day without opening the app and they’re deleted for you.',
  },
  {
    claim: 'There’s no feed, no history, no messages',
    detail: 'Nametag doesn’t record where you’ve been, who you saw, or who saw you. There’s nothing to scroll back through — the room is only ever right now.',
  },
  {
    claim: 'Names you save stay on your phone',
    detail: 'When you remember a name, it’s copied to your device and never sent to us. The other person is never told.',
  },
  {
    claim: 'Your account is only an email and a password',
    detail: 'We keep your email and an encrypted password so you can sign back in. Delete your account and everything — your email, your tag, and your photo — is erased right away.',
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
  const [showPolicy, setShowPolicy] = useState(false);
  useEffect(() => { getMyProfile().then(setProfile).catch(() => {}); }, []);
  const place = PLACE_FALLBACK;
  const now = stateCopy(profile, place);

  if (showPolicy) return <PolicyDocument onBack={() => setShowPolicy(false)} />;

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
                  lineHeight: 1.3 }}>{s.claim}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4, lineHeight: 1.5 }}>{s.detail}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '16px 22px 0' }}>
        <div onClick={() => setShowPolicy(true)} className="nt-tappable" style={{ display: 'flex',
              alignItems: 'center', gap: 12, background: 'var(--surface)',
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
