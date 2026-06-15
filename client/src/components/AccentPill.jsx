// AccentPill.jsx — small accent-tinted pill (used for pronouns on the editorial
// badge and the detail sheet). `accent` is a resolved CSS-var reference.
export default function AccentPill({ accent, children, fontSize = 11, padding = '3px 10px' }) {
  return (
    <span style={{
      fontWeight: 800, fontSize, color: accent, lineHeight: 1,
      background: `color-mix(in srgb, ${accent} 14%, var(--surface))`,
      border: `1.5px solid color-mix(in srgb, ${accent} 30%, transparent)`,
      borderRadius: 'var(--r-pill)', padding,
    }}>{children}</span>
  );
}
