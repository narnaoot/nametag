// PartyCodeSheet.jsx — reached by choosing "Party code" on the visibility
// control. The choice can't take effect until a code exists, so this opens
// first. The field is the only thing that can be typed; the code is set in wide
// Caslon so it reads as something said out loud, not a password. Backing out is
// worded as the state you land in, because the sheet arrives mid-decision.
import { useState } from 'react';
import { PARTY_CODE_MIN, PARTY_CODE_MAX } from '../lib/constants';
import { normalizePartyCode } from '../lib/profile';
import Sheet from './Sheet';

export default function PartyCodeSheet({ initial = '', onJoin, onStayVisible, onClose }) {
  const [code, setCode] = useState(initial.toUpperCase());
  const [focus, setFocus] = useState(false);
  // Hyphens and spaces are fine to type but don't count: SUMMER-42 = SUMMER42.
  const clean = normalizePartyCode(code);
  const ready = clean.length >= PARTY_CODE_MIN;

  return (
    <Sheet onClose={onClose}>
      <div className="t-label">Visibility</div>
      <div className="t-display" style={{ fontSize: 34, letterSpacing: '-1px', lineHeight: 1.05,
            marginTop: 12 }}>What’s the party code?</div>
      <div className="t-body" style={{ fontSize: 14.5, marginTop: 10 }}>
        Whoever is throwing the party picks one and tells the room. Type it exactly as they said it.
      </div>

      <div style={{ marginTop: 22, background: 'var(--surface)',
            border: `1.5px solid ${focus ? 'var(--brand)' : 'var(--border)'}`, borderRadius: 'var(--r)',
            padding: '20px 18px', textAlign: 'center', transition: 'border-color .15s ease' }}>
        <input
          autoFocus value={code} maxLength={PARTY_CODE_MAX}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          onChange={e => setCode(e.target.value.toUpperCase())}
          placeholder="SUMMER-42"
          style={{
            width: '100%', textAlign: 'center', border: 'none', outline: 'none', background: 'none',
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 30,
            letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--text)',
            caretColor: 'var(--brand)', lineHeight: 1,
          }}
        />
      </div>
      <div style={{ marginTop: 10, padding: '0 4px', fontSize: 11.5, lineHeight: 1.5, color: 'var(--muted)' }}>
        Six to ten characters. Capitals and hyphens don’t matter.
      </div>

      <div style={{ marginTop: 18, background: 'var(--sage-lt)',
            borderRadius: 'var(--r)', padding: '14.5px 16.5px' }}>
        <div style={{ fontSize: 12.5, lineHeight: 1.55, color: 'var(--muted)' }}>
          <span style={{ fontWeight: 800, color: 'var(--sage-dk)' }}>Only people who type the same code will see your tag.</span>
          {' '}Everyone else nearby stops seeing you, and you stop seeing them.
        </div>
      </div>

      <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="na-btn" disabled={!ready} onClick={() => onJoin(clean)}>Join the party</button>
        <button className="na-btn na-btn--ghost" onClick={onStayVisible}>
          Stay visible to everyone nearby
        </button>
      </div>
    </Sheet>
  );
}
