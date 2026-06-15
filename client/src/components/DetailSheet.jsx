// DetailSheet.jsx — slide-up person detail sheet for the Nearby screen.
// Tapping a badge opens this. Includes the "Say hi" wave action; wave state
// lives in the Nearby screen so it persists across opens.
// Ported from the design handoff (detail-sheet.jsx).

import { Avatar } from './Badge';
import AccentPill from './AccentPill';
import { distanceLabel } from '../colors';

export default function DetailSheet({ person, accent, waved, onWave, onClose, onEditTag }) {
  if (!person) return null;
  const isYou = !!person.you;
  const dist = distanceLabel(person.distance);
  const incoming = !isYou && !!person.wavedAtYou;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60 }}>
      {/* scrim */}
      <div className="nt-scrim" onClick={onClose} style={{
        position: 'absolute', inset: 0,
        background: 'color-mix(in srgb, #1d130b 44%, transparent)',
      }} />
      {/* sheet */}
      <div className="nt-sheet" style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: 'var(--surface)',
        borderTop: 'var(--hairline) solid var(--border)',
        borderRadius: '22px 22px 0 0',
        boxShadow: '0 -12px 40px rgba(29,19,11,.25)',
        padding: '10px 24px calc(22px + env(safe-area-inset-bottom, 14px))',
        maxWidth: 520, margin: '0 auto',
      }}>
        {/* grabber */}
        <div onClick={onClose} style={{ display: 'flex', justifyContent: 'center', padding: '2px 0 12px', cursor: 'pointer' }}>
          <div style={{ width: 40, height: 4.5, borderRadius: 99, background: 'var(--border)' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <Avatar person={person} size={92} accent={accent} />

          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 900, letterSpacing: '-1px',
            fontSize: person.name.length > 11 ? 28 : 34, lineHeight: 1.05,
            color: 'var(--text)', marginTop: 12,
          }}>{person.name}</div>

          {/* pronouns + distance */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 9 }}>
            {person.pronouns && (
              <AccentPill accent={accent} fontSize={12} padding="5px 12px">{person.pronouns}</AccentPill>
            )}
            {dist && (
              <span className="t-label" style={{ fontSize: 10 }}>
                {isYou ? 'this is you' : dist === 'here' ? 'right here' : dist.includes('walk') ? dist : `${dist} away`}
              </span>
            )}
          </div>

          {person.tagline && (
            <div className="t-quote" style={{ fontSize: 16.5, color: 'var(--muted)', marginTop: 12, maxWidth: 250 }}>
              “{person.tagline}”
            </div>
          )}

          {/* stickers, big, with sticker-ish tilts */}
          {person.stickers?.length > 0 && (
            <div style={{ display: 'flex', gap: 14, marginTop: 14 }}>
              {person.stickers.map((s, i) => (
                <span key={i} style={{
                  fontSize: 30, lineHeight: 1, display: 'inline-block',
                  transform: `rotate(${i % 2 === 0 ? -6 : 6}deg)`,
                  filter: 'drop-shadow(0 2px 3px rgba(29,19,11,.18))',
                }}>{s}</span>
              ))}
            </div>
          )}

          {/* action */}
          <div style={{ width: '100%', marginTop: 20 }}>
            {incoming && (
              <div style={{
                fontWeight: 800, fontSize: 12.5, color: 'var(--text)', marginBottom: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <span style={{ fontSize: 15 }}>👋</span>
                {person.name} said hi to you
              </div>
            )}
            {isYou ? (
              <button className="na-btn" style={{ width: '100%' }} onClick={onEditTag}>
                Edit my tag
              </button>
            ) : waved ? (
              <div style={{
                width: '100%', padding: '13px', borderRadius: 'var(--r-pill)',
                background: 'color-mix(in srgb, var(--sage) 16%, var(--surface))',
                border: '1.5px solid color-mix(in srgb, var(--sage) 38%, transparent)',
                fontWeight: 800, fontSize: 14.5, color: 'var(--text)',
              }}>Wave sent <span style={{ fontSize: 16 }}>👋</span> — they’ll see it on their tag</div>
            ) : (
              <button className="na-btn" style={{ width: '100%' }} onClick={() => onWave(person.id)}>
                {incoming ? 'Wave back' : 'Say hi'} <span style={{ fontSize: 16, verticalAlign: '-2px' }}>👋</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
