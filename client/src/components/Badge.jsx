// Badge.jsx — the nametag card, ported from the design handoff (badge.jsx).
// Two variants: 'sticker' (literal HELLO badge, reskinned) and 'editorial'
// (brand portrait card). Plus the Avatar and the wave corner chip.
//
// `accent` is a resolved CSS-var reference (e.g. "var(--teal)") — use
// resolveAccent(person, index) from ../colors to produce it.

import { initials, distanceLabel } from '../colors';
import AccentPill from './AccentPill';

export function Avatar({ person, size = 96, accent, ring = true }) {
  const common = {
    width: size, height: size, borderRadius: '50%',
    flexShrink: 0, overflow: 'hidden',
    border: ring ? '4px solid var(--surface)' : 'none',
    boxShadow: ring ? 'var(--shadow-card)' : 'none',
  };
  if (person.photo) {
    return (
      <div style={common}>
        <img src={person.photo} alt={person.name}
             style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    );
  }
  // initial-monogram avatar on an accent tint — bright + on-brand, no fake faces
  return (
    <div style={{
      ...common,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `color-mix(in srgb, ${accent} 20%, var(--surface))`,
    }}>
      <span style={{
        fontFamily: 'var(--font-display)', fontWeight: 900,
        fontSize: size * 0.42, color: accent, lineHeight: 1,
        letterSpacing: '-1px',
      }}>{initials(person.name)}</span>
    </div>
  );
}

/* ── Sticker variant — literal HELLO badge, brand-reskinned ── */
function StickerBadge({ person, accent, tilt = 0 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
      <div style={{ marginBottom: -16, zIndex: 2 }}>
        <Avatar person={person} size={72} accent={accent} />
      </div>
      <div style={{
        width: 168, background: 'var(--surface)',
        borderRadius: 8, overflow: 'hidden',
        border: 'var(--hairline) solid var(--border)',
        boxShadow: 'var(--shadow-card)',
        transform: `rotate(${tilt}deg)`, transformOrigin: 'center top',
        paddingTop: 18,
      }}>
        {/* header band */}
        <div style={{ background: accent, padding: '7px 14px 6px' }}>
          <div style={{
            fontWeight: 800, fontSize: 13, letterSpacing: '.2em',
            color: '#fff', lineHeight: 1.05,
          }}>HELLO</div>
          <div style={{
            fontWeight: 700, fontSize: 8, letterSpacing: '.16em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,.92)',
          }}>my name is</div>
        </div>
        {/* name */}
        <div style={{ padding: '12px 10px 8px', textAlign: 'center', minHeight: 56,
                      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: person.name.length > 11 ? 22 : person.name.length > 7 ? 26 : 30,
            color: 'var(--text)', lineHeight: 1.05, letterSpacing: '-0.5px',
            overflowWrap: 'normal', wordBreak: 'keep-all', maxWidth: '100%',
          }}>{person.name}</span>
        </div>
        {/* tagline */}
        {person.tagline && (
          <div style={{ padding: '0 12px 8px', textAlign: 'center' }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700,
              fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.3,
            }}>{person.tagline}</span>
          </div>
        )}
        {/* stickers */}
        {person.stickers?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', paddingBottom: 8 }}>
            {person.stickers.map((s, i) => <span key={i} style={{ fontSize: 17 }}>{s}</span>)}
          </div>
        )}
        {/* pronouns strip */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 14px',
          background: `color-mix(in srgb, ${accent} 13%, var(--surface))`,
          borderTop: `1.5px solid color-mix(in srgb, ${accent} 28%, transparent)`,
        }}>
          <span style={{ fontWeight: 800, fontSize: 12.5, color: accent }}>{person.pronouns}</span>
          {distanceLabel(person.distance) && (
            <span className="t-label" style={{ fontSize: 9.5, color: 'var(--muted)' }}>
              {distanceLabel(person.distance)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Editorial variant — brand portrait card, sticker spirit kept ── */
function EditorialCard({ person, accent }) {
  return (
    <div style={{
      display: 'flex', gap: 14, alignItems: 'center',
      background: 'var(--surface)',
      border: 'var(--hairline) solid var(--border)',
      borderLeft: `3px solid ${accent}`,
      borderRadius: 'var(--r)',
      boxShadow: 'var(--shadow-card)',
      padding: '14px 16px', width: '100%',
    }}>
      <Avatar person={person} size={58} accent={accent} ring={false} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 21,
            color: 'var(--text)', letterSpacing: '-0.6px', lineHeight: 1.1,
            wordBreak: 'keep-all', overflowWrap: 'normal',
          }}>{person.name}</span>
          {distanceLabel(person.distance) && (
            <span className="t-label" style={{ color: accent, flexShrink: 0, fontSize: 9.5, whiteSpace: 'nowrap' }}>
              {distanceLabel(person.distance)}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
          <AccentPill accent={accent}>{person.pronouns}</AccentPill>
          {person.stickers?.length > 0 && (
            <span style={{ display: 'flex', gap: 3 }}>
              {person.stickers.map((s, i) => <span key={i} style={{ fontSize: 14 }}>{s}</span>)}
            </span>
          )}
        </div>
        {person.tagline && (
          <div style={{
            fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700,
            fontSize: 13.5, color: 'var(--muted)', marginTop: 7, lineHeight: 1.35,
          }}>{person.tagline}</div>
        )}
      </div>
    </div>
  );
}

/* ── wave chip — corner indicator for sent/incoming waves ── */
function WaveChip({ state, variant }) {
  if (!state) return null;
  const sent = state === 'sent';
  const sticker = variant === 'sticker';
  return (
    <span style={{
      position: 'absolute',
      top: sticker ? 46 : -7,
      left: sticker ? 2 : -6,
      zIndex: 6,
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: sent ? 'var(--sage)' : 'var(--surface)',
      color: sent ? '#14301f' : 'var(--text)',
      border: sent ? 'none' : '1.5px solid var(--border)',
      fontWeight: 800, fontSize: 10, lineHeight: 1, whiteSpace: 'nowrap',
      padding: '4px 9px', borderRadius: 99,
      boxShadow: '0 2px 8px rgba(29,19,11,.16)',
      transform: 'rotate(-4deg)',
    }}>
      <span style={{ fontSize: 12 }}>👋</span>{sent ? 'hi sent' : 'says hi!'}
    </span>
  );
}

export function PersonCard({ person, accent, variant = 'sticker', tilt = 0, waveState }) {
  const card = variant === 'editorial'
    ? <EditorialCard person={person} accent={accent} />
    : <StickerBadge person={person} accent={accent} tilt={tilt} />;
  if (!waveState) return card;
  return (
    <div style={{ position: 'relative', width: variant === 'editorial' ? '100%' : 'auto' }}>
      {card}
      <WaveChip state={waveState} variant={variant} />
    </div>
  );
}
