// NavRail.jsx — the desktop left navigation rail. Replaces the bottom tab bar at
// desk width. Wordmark + the three tabs; active tab in an orchid-lt pill.
const ITEMS = [
  ['grid', 'Nearby'],
  ['profile', 'My tag'],
  ['privacy', 'Privacy'],
];

export default function NavRail({ tab, onTab, footer }) {
  return (
    <nav style={{ width: 250, flexShrink: 0, alignSelf: 'stretch', background: 'var(--surface)',
          borderRight: '1.5px solid var(--border)', padding: '30px 22px', display: 'flex',
          flexDirection: 'column', gap: 8, position: 'sticky', top: 0, height: '100vh' }}>
      <div className="t-label" style={{ fontSize: 11, marginBottom: 16 }}>Nametag</div>
      {ITEMS.map(([id, label]) => {
        const on = tab === id;
        return (
          <button key={id} onClick={() => onTab(id)} style={{ textAlign: 'left', border: 'none', cursor: 'pointer',
                borderRadius: 'var(--r-pill)', padding: '11px 16px', fontWeight: 800, fontSize: 14,
                background: on ? 'var(--orchid-lt)' : 'transparent',
                color: on ? 'var(--orchid-dk)' : 'var(--muted)', transition: 'background .15s ease' }}>
            {label}
          </button>
        );
      })}
      {footer && <div style={{ marginTop: 'auto' }}>{footer}</div>}
    </nav>
  );
}
