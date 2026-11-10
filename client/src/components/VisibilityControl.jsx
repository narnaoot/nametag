// VisibilityControl.jsx — the app's one central control, and the only three-way
// one: invisible | nearby | party. It appears in three places (onboarding step 2,
// the top of the wall, and My tag) and must be the same control in the same sage
// card everywhere — so it also owns the party-code sheet that "Party code" opens.
// The card takes the colour of the chosen state: sage when you're visible, ink
// when you're invisible.
import { useState } from 'react';
import PartyCodeSheet from './PartyCodeSheet';

const MODES = [
  ['invisible', 'Invisible'],
  ['nearby', 'Nearby'],
  ['party', 'Party code'],
];

// Per-state palette. "The card turns to ink" for invisible (README).
function palette(value) {
  if (value === 'invisible') {
    return {
      cardBg: 'var(--text)', cardBorder: 'var(--text)',
      activeBg: 'var(--text)', lead: 'var(--bg)',
      note: 'rgba(255,251,245,.82)', labelColor: 'rgba(255,251,245,.7)',
    };
  }
  // nearby + party both live in the sage card
  return {
    cardBg: 'var(--sage-lt)', cardBorder: 'var(--sage)',
    activeBg: 'var(--sage-dk)', lead: 'var(--sage-dk)',
    note: 'var(--muted)', labelColor: 'var(--muted)',
  };
}

function defaultNote(value, { place, partyCode } = {}) {
  if (value === 'invisible') {
    return { lead: 'You’re invisible.', rest: ' Your tag has left the wall — no one nearby can see you.' };
  }
  if (value === 'party') {
    return {
      lead: partyCode ? `Visible in party ${partyCode}.` : 'Only people with the code see you.',
      rest: ' Everyone else nearby stops seeing you, and you stop seeing them.',
    };
  }
  return {
    lead: 'Visible to people nearby.',
    rest: place && place !== 'nearby'
      ? ` Anyone at ${place} with Nametag open sees your tag.`
      : ' Anyone nearby with Nametag open sees your tag.',
  };
}

export default function VisibilityControl({
  value = 'nearby',
  onChange,           // (mode, { partyCode }) — 'party' only fires once a code is entered
  label,
  note,               // { lead, rest } override
  place,
  partyCode,
}) {
  const [askCode, setAskCode] = useState(false);
  const p = palette(value);
  const copy = note || defaultNote(value, { place, partyCode });

  // Party can't take effect until a code exists, so that choice opens the sheet
  // first; every other choice applies straight away.
  function pick(mode) {
    if (mode === 'party') setAskCode(true);
    else onChange(mode, {});
  }

  return (
    <div style={{
      background: p.cardBg, border: `1.5px solid ${p.cardBorder}`,
      borderRadius: 'var(--r)', padding: label ? '12px 12px 13px' : '10px 11px 11px',
      transition: 'background .2s ease, border-color .2s ease',
    }}>
      {label && (
        <div className="t-label" style={{ fontSize: 9.5, padding: '0 4px 8px', color: p.labelColor }}>
          {label}
        </div>
      )}
      <div style={{ display: 'flex', gap: 4, background: 'var(--surface)',
                    border: '1.5px solid var(--border)', borderRadius: 'var(--r-pill)', padding: 3 }}>
        {MODES.map(([mode, text]) => {
          const on = value === mode;
          return (
            <button key={mode} type="button" onClick={() => pick(mode)} style={{
              flex: 1, textAlign: 'center', border: 'none', cursor: 'pointer',
              borderRadius: 'var(--r-pill)', padding: '8px 4px',
              fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 11.5,
              background: on ? p.activeBg : 'transparent',
              color: on ? '#fff' : 'var(--muted)',
              transition: 'background .15s ease, color .15s ease',
            }}>{text}</button>
          );
        })}
      </div>
      <div style={{ marginTop: 9, padding: '0 5px', fontSize: 11.5, lineHeight: 1.5,
                    color: p.note }}>
        <span style={{ fontWeight: 800, color: p.lead }}>{copy.lead}</span>{copy.rest}
      </div>

      {askCode && (
        <PartyCodeSheet initial={partyCode || ''}
          onJoin={(code) => { setAskCode(false); onChange('party', { partyCode: code }); }}
          onStayVisible={() => { setAskCode(false); onChange('nearby', {}); }}
          onClose={() => setAskCode(false)} />
      )}
    </div>
  );
}
