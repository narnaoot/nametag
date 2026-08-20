// TabBar.jsx — three tabs: Nearby / My tag / Privacy. Privacy is a top-level
// tab (not a settings row) so it can be read before anyone is asked to be
// visible. Active tab: label in an orchid-lt pill above a 22×3 orchid underline.
const TABS = [
  ['grid', 'Nearby'],
  ['profile', 'My tag'],
  ['privacy', 'Privacy'],
];

export default function TabBar({ tab, onTab }) {
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
      maxWidth: 430, margin: '0 auto', display: 'flex',
      background: 'var(--surface)', borderTop: '1.5px solid var(--border)',
      padding: '13px 0', paddingBottom: 'max(26px, env(safe-area-inset-bottom, 26px))',
    }}>
      {TABS.map(([id, label]) => {
        const on = tab === id;
        return (
          <button key={id} onClick={() => onTab(id)} style={{
            flex: 1, minHeight: 44, background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          }}>
            <span style={{
              fontWeight: 800, fontSize: 11.5, letterSpacing: '.12em', textTransform: 'uppercase',
              color: on ? 'var(--orchid-dk)' : 'var(--muted)',
              background: on ? 'var(--orchid-lt)' : 'transparent',
              borderRadius: 'var(--r-pill)', padding: on ? '4px 13px' : '4px 0',
            }}>{label}</span>
            <div style={{ width: 22, height: 3, borderRadius: 99,
                          background: on ? 'var(--orchid)' : 'transparent' }} />
          </button>
        );
      })}
    </nav>
  );
}
