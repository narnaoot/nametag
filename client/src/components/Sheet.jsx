// Sheet.jsx — the bottom sheet every overlay uses (an opened tag, the party
// code): a scrim that closes on tap, a rounded panel that slides up, and the
// grab handle. `scroll` lets tall content scroll inside the panel.
export default function Sheet({ onClose, maxWidth = 430, scroll = false, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60 }}>
      <div className="nt-scrim" onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'rgba(61,43,31,.34)',
      }} />
      <div className={scroll ? 'nt-sheet no-sb' : 'nt-sheet'} style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, maxWidth, margin: '0 auto',
        background: 'var(--bg)', borderTop: '1.5px solid var(--border)',
        borderRadius: 'var(--r) var(--r) 0 0', boxShadow: 'var(--shadow-sheet)',
        padding: '14px 24px calc(28px + env(safe-area-inset-bottom, 0px))',
        display: 'flex', flexDirection: 'column',
        ...(scroll ? { maxHeight: '92vh', overflowY: 'auto' } : null),
      }}>
        <div onClick={onClose} style={{ width: 44, height: 4, borderRadius: 99,
              background: 'var(--border)', margin: '0 auto 18px', cursor: 'pointer' }} />
        {children}
      </div>
    </div>
  );
}
