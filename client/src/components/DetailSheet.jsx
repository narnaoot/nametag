// DetailSheet.jsx — a tag opened into a bottom sheet (phone + tablet). The tag
// body and actions live in TagDetail, shared with the desktop right rail.
import TagDetail from './TagDetail';

export default function DetailSheet(props) {
  const { onClose } = props;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60 }}>
      <div className="nt-scrim" onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'rgba(61,43,31,.34)',
      }} />
      <div className="nt-sheet no-sb" style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, maxWidth: 520, margin: '0 auto',
        background: 'var(--bg)', borderTop: '1.5px solid var(--border)',
        borderRadius: '28px 28px 0 0', boxShadow: '0 -12px 40px rgba(61,43,31,.25)',
        padding: '14px 24px calc(28px + env(safe-area-inset-bottom, 0px))',
        maxHeight: '92vh', overflowY: 'auto', display: 'flex', flexDirection: 'column',
      }}>
        <div onClick={onClose} style={{ width: 44, height: 4, borderRadius: 99,
              background: 'var(--border)', margin: '0 auto 18px', cursor: 'pointer' }} />
        <TagDetail {...props} />
      </div>
    </div>
  );
}
