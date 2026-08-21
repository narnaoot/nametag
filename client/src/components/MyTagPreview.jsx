// MyTagPreview.jsx — your own tag, exactly as the room sees it, in the colour
// you picked (coral by default). Used on My tag.
import { Avatar } from './Avatar';
import { personTrio } from '../colors';
import { STICKER_LABELS } from '../constants';

export default function MyTagPreview({ person, onPhotoClick }) {
  const c = personTrio(person);
  return (
    <div style={{ background: c.tint, border: '1.5px solid var(--border)',
                  borderRadius: 'var(--r)', boxShadow: 'var(--shadow-raise)',
                  transform: 'rotate(-1.4deg)', padding: '14px 20px 12px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
      <div onClick={onPhotoClick} style={{ cursor: onPhotoClick ? 'pointer' : 'default' }}>
        <Avatar person={person} size={74} border={3} ring={c.hue}
                shadow="var(--shadow-raise)" tint={c.tint} deep={c.deep} />
      </div>
      <div style={{ fontWeight: 700, fontSize: 9, letterSpacing: '.18em',
                    textTransform: 'uppercase', color: 'var(--muted)', marginTop: 3 }}>
        hello my name is
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 32,
                    letterSpacing: '-1px', lineHeight: 1, color: 'var(--text)', textAlign: 'center' }}>
        {person.name || ' '}
      </div>
      {person.pronouns && (
        <div style={{ background: 'var(--surface)', border: `1.5px solid ${c.hue}`,
                      borderRadius: 'var(--r-pill)', padding: '5px 13px', fontWeight: 800,
                      fontSize: 12, color: c.deep }}>{person.pronouns}</div>
      )}
      {person.tagline && (
        <div className="t-quote" style={{ fontSize: 15, lineHeight: 1.35, textAlign: 'center',
              marginTop: 1 }}>{person.tagline}</div>
      )}
      {person.stickers?.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 5, flexWrap: 'wrap', justifyContent: 'center' }}>
          {person.stickers.map((s, i) => (
            <div key={i} style={{ background: 'var(--surface)', border: `1.5px solid ${c.hue}`,
                  borderRadius: 'var(--r-pill)', padding: '5px 11px', fontWeight: 800, fontSize: 11,
                  color: c.deep, display: 'flex', gap: 5, alignItems: 'center' }}>
              <span style={{ fontSize: 12 }}>{s}</span>{STICKER_LABELS[s] || ''}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
