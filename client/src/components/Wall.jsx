// Wall.jsx — the hand-laid tag wall. The mock hand-places a fixed six; live data
// has any number, so we lay N staggered columns whose tilts, shadows, widths and
// photo sizes never line up — the irregularity the design asks for, made robust.
// "You" (coral) leads. Column count grows with the viewport.
import Tag from './Tag';

const TILTS = [0, 3.4, -3, 0.8, -2, 3.2, -1.6, 2.4, -2.8, 1.6];
const SHADOWS = [
  '0 10px 28px rgba(0,0,0,.18)', '0 2px 10px rgba(0,0,0,.10)',
  '0 6px 20px rgba(0,0,0,.14)', '0 2px 11px rgba(0,0,0,.11)',
  '0 12px 30px rgba(0,0,0,.19)', '0 4px 14px rgba(0,0,0,.12)',
];
const ALIGN = ['flex-start', 'flex-end', 'center'];
const COL_OFFSET = [0, 24, 12, 30, 6, 18];

export default function Wall({
  people, columns = 2, gap = 12, faceBase = 52, sizingWidth = 158, footFontSize = 12, onOpen,
}) {
  // round-robin into columns keeps nearest-first roughly top-to-bottom
  const cols = Array.from({ length: columns }, () => []);
  people.forEach((person, i) => cols[i % columns].push({ person, i }));

  return (
    <div style={{ display: 'flex', gap, alignItems: 'flex-start' }}>
      {cols.map((arr, c) => (
        <div key={c} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column',
              gap: 20, marginTop: COL_OFFSET[c % COL_OFFSET.length] }}>
          {arr.map(({ person, i }) => (
            <div key={person.id ?? i} style={{ width: `${100 - (i % 3) * 5}%`, alignSelf: ALIGN[i % ALIGN.length] }}>
              <Tag person={person} index={i} width="100%" sizingWidth={sizingWidth}
                   tilt={TILTS[i % TILTS.length]} shadow={SHADOWS[i % SHADOWS.length]}
                   faceSize={faceBase - (i % 3) * 2} footFontSize={footFontSize}
                   onClick={() => onOpen(person)} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
