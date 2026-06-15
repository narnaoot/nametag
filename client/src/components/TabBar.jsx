// TabBar.jsx — bottom tab bar (Nearby / My tag). Active tab gets the primary
// label + a 22×3 underline. Ported from the design handoff (screens-app.jsx).

const TABS = [
  ['grid', '👥', 'Nearby'],
  ['profile', '🏷️', 'My tag'],
];

export default function TabBar({ tab, onTab }) {
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
      display: 'flex', background: 'var(--surface)',
      borderTop: 'var(--hairline) solid var(--border)',
      paddingBottom: 'env(safe-area-inset-bottom, 22px)',
      boxShadow: '0 -4px 20px rgba(61,43,31,0.05)',
    }}>
      {TABS.map(([id, icon, label]) => {
        const on = tab === id;
        return (
          <button key={id} onClick={() => onTab(id)} style={{
            flex: 1, minHeight: 44, padding: '11px 0 6px', background: 'none', border: 'none',
            cursor: 'pointer', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 3,
          }}>
            <span style={{ fontSize: 21, filter: on ? 'none' : 'grayscale(.6) opacity(.7)' }}>{icon}</span>
            <span style={{
              fontWeight: 800, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase',
              color: on ? 'var(--primary)' : 'var(--muted)',
            }}>{label}</span>
            <div style={{ width: 22, height: 3, borderRadius: 99, marginTop: 1,
                          background: on ? 'var(--primary)' : 'transparent' }} />
          </button>
        );
      })}
    </nav>
  );
}
