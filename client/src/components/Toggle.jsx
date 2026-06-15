// Toggle.jsx — pill switch used by the visibility banner and My-tag settings.
// Ported from the design handoff (screens-app.jsx Toggle).

export default function Toggle({ on, onClick, color = 'var(--primary)' }) {
  return (
    <div onClick={onClick} role="switch" aria-checked={on} style={{
      width: 46, height: 27, borderRadius: 99, cursor: 'pointer', flexShrink: 0,
      background: on ? color : 'var(--border)', position: 'relative',
      transition: 'background .18s ease',
    }}>
      <div style={{
        position: 'absolute', top: 3, left: on ? 22 : 3, width: 21, height: 21,
        borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.25)',
        transition: 'left .18s ease',
      }} />
    </div>
  );
}
