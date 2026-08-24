// StickerPicker.jsx — pick up to three stickers. Square-cornered (radius 3px)
// on purpose: stickers are content you pick, not a control you press, and every
// other pill in the app is a control. Selected chips take the coral tint,
// because the stickers land on your own (coral) tag.
import { STICKER_OPTIONS, MAX_STICKERS } from '../lib/constants';

export default function StickerPicker({ value = [], onChange, max = MAX_STICKERS }) {
  function toggle(emoji) {
    if (value.includes(emoji)) onChange(value.filter(e => e !== emoji));
    else if (value.length < max) onChange([...value, emoji]);
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
      {STICKER_OPTIONS.map(({ emoji, word }) => {
        const on = value.includes(emoji);
        return (
          <button key={emoji} type="button" onClick={() => toggle(emoji)} style={{
            background: on ? 'var(--coral-lt)' : 'var(--surface)',
            border: `1.5px solid ${on ? 'var(--coral)' : 'var(--border)'}`,
            borderRadius: 'var(--r-sm)', padding: '8px 13px', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 13,
            color: on ? 'var(--coral-dk)' : 'var(--text)',
            display: 'flex', gap: 6, alignItems: 'center', transition: 'all .12s ease',
          }}>
            <span style={{ fontSize: 15 }}>{emoji}</span>{word}
          </button>
        );
      })}
    </div>
  );
}
