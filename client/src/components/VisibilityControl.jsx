// VisibilityControl.jsx — the app's one central control, and the only three-way
// one: invisible | nearby | party. It appears in four places (onboarding step 2,
// the top of the wall, My tag, and Privacy) and must be the same control in the
// same sage card everywhere. The card takes the colour of the chosen state:
// sage when you're visible, ink when you're invisible.

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
  onChange,
  label,
  note,               // { lead, rest } override
  place,
  partyCode,
  compact = false,
  stacked = false,    // desktop rail: three vertical rows instead of a segmented pill
}) {
  const p = palette(value);
  const copy = note || defaultNote(value, { place, partyCode });
  const segPad = compact ? '7px 4px' : '8px 4px';

  if (stacked) {
    return (
      <div style={{ background: p.cardBg, border: `1.5px solid ${p.cardBorder}`,
            borderRadius: 'var(--r)', padding: 11, transition: 'background .2s ease, border-color .2s ease' }}>
        {label && <div className="t-label" style={{ fontSize: 9.5, padding: '0 3px 8px', color: p.labelColor }}>{label}</div>}
        <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 12,
              padding: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {MODES.map(([mode, text]) => {
            const on = value === mode;
            return (
              <button key={mode} type="button" onClick={() => onChange && onChange(mode)} style={{
                border: 'none', cursor: 'pointer', borderRadius: 9, padding: '8px 11px', textAlign: 'left',
                fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 12,
                background: on ? p.activeBg : 'transparent', color: on ? '#fff' : 'var(--muted)',
                transition: 'background .15s ease, color .15s ease',
              }}>{text}</button>
            );
          })}
        </div>
        <div style={{ marginTop: 9, padding: '0 3px', fontSize: 11, lineHeight: 1.5, color: p.note }}>
          <span style={{ fontWeight: 800, color: p.lead }}>{copy.lead}</span>{copy.rest}
        </div>
      </div>
    );
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
            <button key={mode} type="button" onClick={() => onChange && onChange(mode)} style={{
              flex: 1, textAlign: 'center', border: 'none', cursor: 'pointer',
              borderRadius: 'var(--r-pill)', padding: segPad,
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
    </div>
  );
}
