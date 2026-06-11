// Brand wordmark: "Name" in --text + "tag" as Playfair italic in --primary.
export default function Wordmark({ size = 34, block = false }) {
  return (
    <span style={{
      fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: size,
      letterSpacing: '-1.5px', color: 'var(--text)', lineHeight: 1,
      display: block ? 'block' : 'inline-block',
    }}>
      Name<em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>tag</em>
    </span>
  );
}
