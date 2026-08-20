// DetailSheet.jsx — a tag, opened. The tapped tag grows into the sheet keeping
// its own tint and hue, so it reads as picking a sticker off the wall. Distance
// is gone; the only number is "visible N min". Actions: Remember the name
// (stored on your device) and Hide from me. Your own tag opens Edit my tag.
import { Avatar } from './Avatar';
import { personTrio, visibleLabel } from '../colors';
import { STICKER_LABELS } from '../constants';

function nameSize(name) {
  const len = (name || '').length;
  if (len > 14) return 30;
  if (len > 10) return 36;
  return 42;
}

export default function DetailSheet({
  person, index = 0, remembered, context, onRemember, onHide, onEditTag, onClose,
}) {
  if (!person) return null;
  const you = !!person.you;
  const trio = personTrio(person, index);
  const vis = you ? 'this is you' : visibleLabel(person.visibleSince);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60 }}>
      <div className="nt-scrim" onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'rgba(61,43,31,.34)',
      }} />
      <div className="nt-sheet no-sb" style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, maxWidth: 430, margin: '0 auto',
        background: 'var(--bg)', borderTop: '1.5px solid var(--border)',
        borderRadius: '28px 28px 0 0', boxShadow: '0 -12px 40px rgba(61,43,31,.25)',
        padding: '14px 24px calc(28px + env(safe-area-inset-bottom, 0px))',
        maxHeight: '92vh', overflowY: 'auto', display: 'flex', flexDirection: 'column',
      }}>
        <div onClick={onClose} style={{ width: 44, height: 4, borderRadius: 99,
              background: 'var(--border)', margin: '0 auto 18px', cursor: 'pointer' }} />

        {/* the grown tag */}
        <div style={{ background: trio.tint, border: '1.5px solid var(--border)',
                      borderRadius: 'var(--r)', boxShadow: 'var(--shadow-raise)',
                      transform: 'rotate(-1.2deg)', padding: '22px 22px 18px',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9 }}>
          <Avatar person={person} size={106} border={3} ring={trio.hue}
                  shadow="var(--shadow-raise)" tint={trio.tint} deep={trio.deep} />
          <div style={{ fontWeight: 700, fontSize: 9.5, letterSpacing: '.18em',
                        textTransform: 'uppercase', color: 'var(--muted)', marginTop: 4 }}>
            hello my name is
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700,
                        fontSize: nameSize(person.name), letterSpacing: '-1.4px',
                        lineHeight: 1, color: 'var(--text)', textAlign: 'center' }}>
            {person.name}
          </div>
          {person.pronouns && (
            <div style={{ background: 'var(--surface)', border: `1.5px solid ${trio.hue}`,
                          borderRadius: 'var(--r-pill)', padding: '6px 14px', fontWeight: 800,
                          fontSize: 12.5, color: trio.deep }}>{person.pronouns}</div>
          )}
          {person.tagline && (
            <div className="t-quote" style={{ fontSize: 20, lineHeight: 1.45, textAlign: 'center',
                        maxWidth: 260, marginTop: 4 }}>{person.tagline}</div>
          )}
          {person.stickers?.length > 0 && (
            <div style={{ display: 'flex', gap: 10, marginTop: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
              {person.stickers.map((s, i) => (
                <div key={i} style={{ background: 'var(--surface)', border: `1.5px solid ${trio.hue}`,
                            borderRadius: 'var(--r-pill)', padding: '7px 13px', fontWeight: 800,
                            fontSize: 12, color: trio.deep, display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: 14 }}>{s}</span>{STICKER_LABELS[s] || ''}
                </div>
              ))}
            </div>
          )}
          {vis && (
            <div style={{ marginTop: 10, paddingTop: 14, borderTop: `1.5px solid ${trio.hue}`,
                          width: '100%', textAlign: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: 10, letterSpacing: '.13em',
                            textTransform: 'uppercase', color: 'var(--muted)' }}>{vis}</span>
            </div>
          )}
        </div>

        {/* mutual context — only when we actually have it */}
        {context && (
          <div style={{ marginTop: 18, background: 'var(--surface)', border: '1.5px solid var(--border)',
                        borderRadius: 'var(--r)', padding: '14px 16px', display: 'flex',
                        alignItems: 'center', gap: 12 }}>
            {context.photo != null && (
              <Avatar person={{ photo: context.photo, name: context.name }} size={40} border={2}
                      ring="var(--lavender)" shadow="none" />
            )}
            <div className="t-body" style={{ fontSize: 13, lineHeight: 1.5 }}>{context.text}</div>
          </div>
        )}

        {/* actions */}
        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {you ? (
            <button className="na-btn" onClick={onEditTag}>Edit my tag</button>
          ) : remembered ? (
            <>
              <div style={{ minHeight: 56, borderRadius: 'var(--r-pill)', background: 'var(--sage-lt)',
                            border: '1.5px solid var(--sage)', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontWeight: 800, fontSize: 15, color: 'var(--sage-dk)' }}>
                Name saved to your phone
              </div>
              <button className="na-btn na-btn--ghost" onClick={() => onHide(person)}>Hide from me</button>
            </>
          ) : (
            <>
              <button className="na-btn" onClick={() => onRemember(person)}>Remember the name</button>
              <button className="na-btn na-btn--ghost" onClick={() => onHide(person)}>Hide from me</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
