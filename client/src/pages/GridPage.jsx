import { useState, useEffect, useMemo } from 'react';
import { useNearbyPeople } from '../hooks/useNearbyPeople';
import { loadLocalPhoto } from '../profileStorage';
import { toBadgePerson, resolveAccent } from '../colors';
import { PersonCard } from '../components/Badge';
import DetailSheet from '../components/DetailSheet';
import Toggle from '../components/Toggle';
import { STICKER_TILT } from '../constants';

function timeLabel(d) {
  return d ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
}

/* ── Loading skeleton — pulsing placeholder sticker badges ── */
function SkeletonGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', columnGap: 14,
                  rowGap: 30, justifyItems: 'center' }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{ width: '100%', display: 'flex', flexDirection: 'column',
                              alignItems: 'center', animation: `nt-pulse 1.1s ease ${i * 0.12}s infinite alternate` }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--warm2)',
                        border: 'var(--hairline) solid var(--border)', marginBottom: -14, zIndex: 2 }} />
          <div style={{ width: 168, height: 150, borderRadius: 8, background: 'var(--surface)',
                        border: 'var(--hairline) solid var(--border)', paddingTop: 24 }}>
            <div style={{ height: 28, background: 'var(--warm2)', margin: '0 0 14px' }} />
            <div style={{ height: 14, background: 'var(--warm2)', borderRadius: 99, margin: '0 28px 8px' }} />
            <div style={{ height: 10, background: 'var(--warm2)', borderRadius: 99, margin: '0 40px' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function YouTag({ right = 18 }) {
  return (
    <span style={{
      position: 'absolute', top: -6, right, zIndex: 5,
      background: 'var(--text)', color: 'var(--bg)',
      fontWeight: 800, fontSize: 9, letterSpacing: '.12em',
      padding: '3px 8px', borderRadius: 99, textTransform: 'uppercase',
    }}>You</span>
  );
}

/* ── Empty state — "you're the first one here" ── */
function EmptyNearby({ me, visible, onSelect }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 6 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
        {me && (
          <div className="nt-tappable" onClick={() => onSelect(me)}
               style={{ cursor: 'pointer', opacity: visible ? 1 : 0.4, position: 'relative' }}>
            <PersonCard person={me} accent={resolveAccent(me, 0)} variant="sticker" tilt={-STICKER_TILT} />
            <YouTag right={12} />
          </div>
        )}
        {/* the free spot — a dashed ghost sticker */}
        <div style={{
          width: 150, alignSelf: 'stretch', minHeight: 200, marginTop: 28,
          border: '2px dashed color-mix(in srgb, var(--muted) 38%, transparent)',
          borderRadius: 10, transform: `rotate(${STICKER_TILT}deg)`,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 8, padding: 14,
        }}>
          <span style={{ fontSize: 26 }}>👋</span>
          <span className="t-quote" style={{ fontSize: 13.5, color: 'var(--muted)', textAlign: 'center' }}>
            this spot’s free
          </span>
        </div>
      </div>
      <div className="t-h2" style={{ fontSize: 24, marginTop: 30, textAlign: 'center', whiteSpace: 'nowrap' }}>
        No tags nearby <em style={{ color: 'var(--primary)' }}>yet</em>
      </div>
      <div className="t-body" style={{ fontSize: 14, textAlign: 'center', maxWidth: 250, marginTop: 9, lineHeight: 1.55 }}>
        You’re the first one here. Stay visible — when someone arrives, their tag shows up right beside yours.
      </div>
    </div>
  );
}

export default function GridPage({ onEditTag }) {
  const { nearby, myProfile, locationError, loading, isActive, lastUpdated, refresh, toggleVisibility } = useNearbyPeople();
  const [selfPhoto, setSelfPhoto] = useState(null);
  const [waves, setWaves] = useState({});
  const [sel, setSel] = useState(null);

  useEffect(() => { loadLocalPhoto().then(setSelfPhoto); }, []);

  const alwaysVisible = myProfile?.always_visible !== false;
  const visible = alwaysVisible || isActive;

  const me = myProfile?.display_name
    ? toBadgePerson(myProfile, { selfPhoto, you: true })
    : null;

  const others = useMemo(
    () => [...nearby]
      .sort((a, b) => (a.distance_meters ?? 1e9) - (b.distance_meters ?? 1e9))
      .map(p => toBadgePerson(p)),
    [nearby]
  );

  const all = useMemo(() => (me ? [me, ...others] : others), [me, others]);

  const sendWave = (id) => setWaves(w => ({ ...w, [id]: 'sent' }));

  const selIndex = sel ? all.findIndex(p => p.id === sel.id) : -1;
  const selAccent = sel ? resolveAccent(sel, selIndex < 0 ? 0 : selIndex) : null;

  const status = loading ? 'Scanning nearby…'
    : others.length === 0 ? `Updated ${timeLabel(lastUpdated)} · just you`
    : `Updated ${timeLabel(lastUpdated)} · ${others.length} ${others.length === 1 ? 'person' : 'people'}`;

  return (
    <div className="no-sb" style={{ minHeight: '100vh', padding: '70px 18px 96px', maxWidth: 520, margin: '0 auto' }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div className="t-display" style={{ fontSize: 38 }}>Near<em>by</em></div>
          <div className="t-label" style={{ marginTop: 6 }}>{status}</div>
        </div>
        <button className="na-chip" style={{ fontWeight: 800 }} onClick={refresh} disabled={loading}>
          {loading ? 'Scanning…' : 'Refresh →'}
        </button>
      </div>

      {/* visibility banner */}
      <div onClick={() => !alwaysVisible && toggleVisibility(myProfile?.always_visible)} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        background: visible ? 'color-mix(in srgb, var(--sage) 14%, var(--surface))' : 'var(--warm2)',
        border: `var(--hairline) solid ${visible ? 'color-mix(in srgb, var(--sage) 34%, transparent)' : 'var(--border)'}`,
        borderRadius: 'var(--r)', padding: '13px 16px', marginBottom: 20,
        cursor: alwaysVisible ? 'default' : 'pointer',
      }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 14 }}>
            {visible ? 'You’re visible nearby' : 'You’re hidden right now'}
          </div>
          <div className="t-body" style={{ fontSize: 12.5, marginTop: 2 }}>
            {alwaysVisible ? 'Always on — manage in My tag.'
              : visible ? 'Tap to slip out of view.' : 'Tap to share your name nearby.'}
          </div>
        </div>
        <Toggle on={visible} color="var(--sage)"
                onClick={() => !alwaysVisible && toggleVisibility(myProfile?.always_visible)} />
      </div>

      {/* location error */}
      {locationError && !loading && (
        <div style={{
          background: 'color-mix(in srgb, var(--danger) 9%, var(--surface))',
          border: 'var(--hairline) solid color-mix(in srgb, var(--danger) 30%, transparent)',
          borderRadius: 'var(--r)', padding: '12px 14px', marginBottom: 20,
          fontWeight: 700, fontSize: 13, color: 'var(--text)',
        }}>{locationError}</div>
      )}

      {/* body */}
      {loading ? (
        <SkeletonGrid />
      ) : others.length === 0 ? (
        <EmptyNearby me={me} visible={visible} onSelect={setSel} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', columnGap: 14,
                      rowGap: 30, justifyItems: 'center' }}>
          {all.map((p, i) => {
            const dim = p.you && !visible;
            const waveState = !p.you ? (waves[p.id] ? 'sent' : (p.wavedAtYou ? 'incoming' : null)) : null;
            return (
              <div key={p.id ?? i} onClick={() => setSel(p)} className="nt-tappable" style={{
                position: 'relative', width: '100%', display: 'flex', justifyContent: 'center',
                opacity: dim ? 0.4 : 1, cursor: 'pointer',
              }}>
                <PersonCard person={p} accent={resolveAccent(p, i)} variant="sticker"
                            tilt={i % 2 === 0 ? -STICKER_TILT : STICKER_TILT} waveState={waveState} />
                {p.you && <YouTag />}
              </div>
            );
          })}
        </div>
      )}

      <DetailSheet person={sel} accent={selAccent} waved={!!(sel && waves[sel.id])}
                   onWave={sendWave} onClose={() => setSel(null)}
                   onEditTag={() => { setSel(null); onEditTag && onEditTag(); }} />
    </div>
  );
}
