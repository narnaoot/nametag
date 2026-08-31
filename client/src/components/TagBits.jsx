// TagBits.jsx — the small repeated pieces every name-tag renders: the
// "hello my name is" eyebrow and the outlined pill (pronouns + stickers).
// Extracted so the four tag layouts (Tag on the wall, MyTagPreview, the sign-in
// MiniTag, and onboarding) share one definition instead of hand-rolling the same
// markup. Per-context sizing is passed via `style`, preserving the design's
// hand-set values.

// The "HELLO MY NAME IS" eyebrow. Defaults to the wall-tag size (8px / .17em);
// pass `style` to override where a layout uses a different size or adds a margin.
export function Eyebrow({ style }) {
  return (
    <div style={{
      fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)',
      fontSize: 8, letterSpacing: '.17em', ...style,
    }}>
      hello my name is
    </div>
  );
}

// An outlined pill in a person's colour — the pronoun chip and the sticker chips.
// `hue` is the 1.5px border colour, `deep` the text colour. Padding, font-size and
// line-height differ per layout, so they come through `style`.
export function Pill({ hue, deep, style, children }) {
  return (
    <div style={{
      background: 'var(--surface)', border: `1.5px solid ${hue}`,
      borderRadius: 'var(--r-pill)', fontWeight: 800, color: deep, ...style,
    }}>
      {children}
    </div>
  );
}
