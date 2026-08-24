// Avatar.jsx — the circular photo used on every tag, the header, and the
// detail sheet. A white ring (border) always; an optional coloured ring
// (box-shadow spread) — reserved for "you" and for an opened tag. No photo
// falls back to a Caslon initial on the person's tint.
import { initials } from '../lib/colors';

export function Avatar({
  person,
  size = 72,
  border = 2.5,          // white surface ring width
  ring = null,           // coloured ring colour (CSS var/hex) or null
  ringWidth = 1.5,
  shadow = '0 3px 16px rgba(0,0,0,.13)',
  tint,                  // fallback tint (person's -lt) when there's no photo
  deep,                  // fallback initial colour (person's -dk)
}) {
  const boxShadow = ring
    ? `0 0 0 ${ringWidth}px ${ring}, ${shadow}`
    : shadow;
  const common = {
    width: size, height: size, borderRadius: '50%', flexShrink: 0,
    overflow: 'hidden', border: `${border}px solid var(--surface)`,
    boxShadow, background: 'var(--surface)',
  };
  if (person?.photo) {
    return (
      <div style={common}>
        <img src={person.photo} alt={person.name || ''}
             style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
    );
  }
  return (
    <div style={{
      ...common,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: tint || 'var(--warm2)',
    }}>
      <span style={{
        fontFamily: 'var(--font-display)', fontWeight: 700,
        fontSize: size * 0.42, color: deep || 'var(--muted)', lineHeight: 1,
      }}>{initials(person?.name)}</span>
    </div>
  );
}

export default Avatar;
