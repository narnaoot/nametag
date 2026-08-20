// Tag.jsx — a single name tag as it appears on the wall. Tint fill in the
// person's hue, 1.5px hairline, hand-tilted. Photo carries NO coloured ring on
// the board (the ring only ever means "you", up in the header). The footer
// strip carries the person's own line and disappears entirely when they wrote
// none.
import { Avatar } from './Avatar';
import { personTrio } from '../colors';

// Size the Caslon name to the card width and the name's length so it never
// wraps awkwardly. The mock hand-set 20–23px on a 154–172px card; this tracks.
function nameSize(width, name, override) {
  if (override) return override;
  const base = Math.round(width * 0.135);
  const len = (name || '').length;
  const scaled = len > 11 ? base * 0.8 : len > 7 ? base * 0.9 : base;
  return Math.max(17, Math.min(26, Math.round(scaled)));
}

export function Tag({
  person,
  index = 0,
  width = 168,
  sizingWidth,          // numeric width used only for name sizing when width is a CSS string
  tilt = 0,
  shadow = '0 3px 16px rgba(0,0,0,.13)',
  faceSize = 52,
  nameFontSize,
  footFontSize = 12,
  zIndex = 1,
  onClick,
  style,
}) {
  const trio = personTrio(person, index);
  const hasLine = !!(person?.tagline && person.tagline.trim());
  const wForName = sizingWidth ?? (typeof width === 'number' ? width : 160);
  const ns = nameSize(wForName, person?.name, nameFontSize);

  return (
    <div
      onClick={onClick}
      className={onClick ? 'nt-tappable' : undefined}
      style={{
        width, transform: `rotate(${tilt}deg)`, zIndex,
        background: trio.tint,
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--r-tag)',
        overflow: 'hidden',
        boxShadow: shadow,
        display: 'flex', flexDirection: 'column',
        ...style,
      }}
    >
      <div style={{ padding: '13px 12px 10px', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 5 }}>
        <Avatar person={person} size={faceSize} border={2.5}
                tint={trio.tint} deep={trio.deep} />
        <div style={{ fontWeight: 700, fontSize: 8, letterSpacing: '.17em',
                      textTransform: 'uppercase', color: 'var(--muted)', marginTop: 2 }}>
          hello my name is
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: ns,
                      letterSpacing: '-.7px', color: 'var(--text)', lineHeight: 1,
                      textAlign: 'center', maxWidth: '100%', overflowWrap: 'anywhere' }}>
          {person?.name || ' '}
        </div>
        {person?.pronouns && (
          <div style={{ background: 'var(--surface)', border: `1.5px solid ${trio.hue}`,
                        borderRadius: 'var(--r-pill)', padding: '3px 10px', fontWeight: 800,
                        fontSize: 11, color: trio.deep, lineHeight: 1 }}>
            {person.pronouns}
          </div>
        )}
      </div>
      {hasLine && (
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center',
                      justifyContent: 'flex-start', padding: '8px 12px 9px',
                      background: 'var(--surface)', borderTop: `1.5px solid ${trio.hue}`,
                      color: trio.deep }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: footFontSize,
                         lineHeight: 1.35 }}>{person.tagline}</span>
        </div>
      )}
    </div>
  );
}

export default Tag;
