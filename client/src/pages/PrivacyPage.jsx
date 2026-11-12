import { useState, useEffect } from 'react';
import { getMyProfile } from '../lib/api';
import { PLACE_FALLBACK, PARTY_CODE_HOURS } from '../lib/constants';
import { profileSaveSettled } from '../lib/profile';
import PolicyDocument from './PolicyDocument';

// Privacy is a top-level tab, not a settings row, so it can be read before
// anyone is asked to be visible. It opens with what is true right now (current
// visibility, with the way to change it in the same card) and answers with a few
// plain statements about what is true always — no tint coding, because these
// are not categories and colouring them would imply a ranking.

// These statements describe the app's ACTUAL behaviour (server routes +
// cleanup.js + on-device storage), not aspirations. If you change how data is
// stored, change these too — and PolicyDocument.jsx / PRIVACY_POLICY.md with
// them. The audit behind each claim is PRIVACY_REVIEW.md.
const STATEMENTS = [
  {
    claim: 'Your tag lives on your phone, and on our server only while you’re on the wall',
    detail: `Your name, one line, a photo — cropped to a small circle on your phone before it’s sent — and a rounded location are held on our server just long enough to show you to people nearby. Go invisible and they’re deleted at once. Close the app and they’re deleted straight away where we can, and otherwise within about half an hour. Your phone keeps your tag and puts it back when you return.`,
  },
  {
    claim: 'Nobody is told where you are',
    detail: 'Other people see your tag, never your location or how far away you are. We store one rounded position, good to about ten metres, and only while you’re visible — never a history of where you’ve been.',
  },
  {
    claim: 'There’s no feed, no history, no messages',
    detail: 'Nametag doesn’t record who you saw or who saw you — not on our server, and not on your phone. There’s no way to save someone’s tag, and nothing to scroll back through. The room is only ever right now.',
  },
  {
    claim: `A party code runs out after ${PARTY_CODE_HOURS} hours`,
    detail: 'When it does, the party is over: you go invisible and your tag is deleted from our server, rather than being shown to everyone nearby.',
  },
  {
    claim: 'Your account is only an email and a password',
    detail: 'We keep your email, a scrambled password we can’t read, and whether you last chose to be invisible, so you can sign back in. Delete your account and everything — your email, your tag, and your photo — is erased from our server and from this device.',
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
  useEffect(() => { profileSaveSettled().then(getMyProfile).then(setProfile).catch(() => {}); }, []);
  const place = PLACE_FALLBACK;
  const now = stateCopy(profile, place);

  if (showPolicy) return <PolicyDocument onBack={() => setShowPolicy(false)} />;

  return (
    <div className="no-sb na-screen" style={{ padding: '0 0 96px' }}>
      <div style={{ padding: '30px 22px 0' }}>
        <div className="t-display" style={{ fontSize: 40, letterSpacing: '-1.2px' }}>
          Privacy
        </div>
      </div>

      {/* right now — sage, with the way to change it in the same card */}
      <div onClick={onChangeVisibility} className="nt-tappable" style={{ margin: '16px 22px 0',
            background: 'var(--sage-lt)', borderRadius: 'var(--r)',
            padding: '14.5px 16.5px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="t-label">Right now</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--text)',
                marginTop: 4, lineHeight: 1.3 }}>{now.title}</div>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 3 }}>{now.line}</div>
        </div>
        <span style={{ color: 'var(--sage-dk)', fontSize: 16, fontWeight: 800 }}>→</span>
      </div>

      <div style={{ padding: '22px 22px 0' }}>
        <div className="t-label">What is true always</div>
      </div>

      <div style={{ padding: '12px 22px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {STATEMENTS.map((s, i) => (
          <div key={i} className="na-card" style={{ padding: '13px 15px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16.5, color: 'var(--text)',
                  lineHeight: 1.3 }}>{s.claim}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4, lineHeight: 1.5 }}>{s.detail}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '16px 22px 0' }}>
        <div onClick={() => setShowPolicy(true)} className="nt-tappable na-card" style={{ display: 'flex',
              alignItems: 'center', gap: 12, padding: '12px 15px' }}>
          <div style={{ flex: 1, minWidth: 0, fontWeight: 800, fontSize: 13, color: 'var(--text)' }}>
            Read the whole policy
          </div>
          <span style={{ color: 'var(--muted)', fontSize: 16 }}>→</span>
        </div>
      </div>
    </div>
  );
}
