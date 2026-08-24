// PaintboxPicker.jsx — pick the colour of your own tag. A row of paintbox
// swatches (the app's own orchid is left out). The selected swatch gets a ring
// in its own hue.
import { accentTrio } from '../lib/colors';
import { TAG_COLORS } from '../lib/constants';

export default function PaintboxPicker({ value, onChange, justify = 'flex-start' }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: justify }}>
      {TAG_COLORS.map(key => {
        const trio = accentTrio(key);
        const on = value === key;
        return (
          <button key={key} type="button" onClick={() => onChange(key)} aria-label={key} style={{
            width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', padding: 0,
            background: trio.hue, border: '2px solid var(--surface)',
            boxShadow: on ? `0 0 0 2px var(--bg), 0 0 0 4px ${trio.hue}` : '0 1px 3px rgba(0,0,0,.18)',
            transform: on ? 'scale(1.08)' : 'none', transition: 'transform .12s ease, box-shadow .12s ease',
          }} />
        );
      })}
    </div>
  );
}
