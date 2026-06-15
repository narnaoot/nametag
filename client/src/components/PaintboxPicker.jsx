// PaintboxPicker.jsx — the five-swatch paintbox accent picker, shared by
// Onboarding and My Tag. Selected swatch gets a text-colored ring + slight
// scale-up. `value`/`onChange` work in paintbox keys (e.g. "teal").
import { ACCENT_ORDER } from '../constants';

export default function PaintboxPicker({ value, onChange, justify = 'flex-start' }) {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: justify }}>
      {ACCENT_ORDER.map(key => {
        const on = value === key;
        return (
          <button key={key} type="button" onClick={() => onChange(key)} aria-label={key} title={key} style={{
            width: 34, height: 34, borderRadius: '50%', background: `var(--${key})`,
            border: on ? '3px solid var(--text)' : '3px solid transparent',
            outline: 'var(--hairline) solid var(--border)',
            cursor: 'pointer', transition: 'transform .12s ease',
            transform: on ? 'scale(1.12)' : 'none',
          }} />
        );
      })}
    </div>
  );
}
