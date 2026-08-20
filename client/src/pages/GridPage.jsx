import { useState, useEffect, useMemo } from 'react';
import { useNearbyPeople } from '../hooks/useNearbyPeople';
import {
  loadLocalPhoto, getRememberedNames, rememberName, hidePerson,
} from '../profileStorage';
import { toBadgePerson, personTrio } from '../colors';
import { Avatar } from '../components/Avatar';
import Tag from '../components/Tag';
import VisibilityControl from '../components/VisibilityControl';
import DetailSheet from '../components/DetailSheet';
import PartyCodeSheet from '../components/PartyCodeSheet';
import { PLACE_FALLBACK } from '../constants';

// A tilted, hand-laid feel for any number of tags. The mock's six fixed
// positions can't be literal with live data, so we lay two columns of tilted
// cards whose tilts, shadows, widths, and photo sizes never line up — the
// irregularity the design asks for, made robust. "You" (coral) leads.
const TILTS = [0, 3.4, -3, 0.8, -2, 3.2, -1.6, 2.4, -2.8, 1.6];
const SHADOWS = [
  '0 10px 28px rgba(0,0,0,.18)', '0 2px 10px rgba(0,0,0,.10)',
  '0 6px 20px rgba(0,0,0,.14)', '0 2px 11px rgba(0,0,0,.11)',
  '0 12px 30px rgba(0,0,0,.19)', '0 4px 14px rgba(0,0,0,.12)',
];
const FACES = [52, 48, 52, 48, 54, 50];
const ALIGN = ['flex-start', 'flex-end', 'center'];

function WallColumn({ people, offset = 0, onOpen }) {
  return (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column',
                  gap: 20, marginTop: offset }}>
      {people.map(({ person, i }) => (
        <div key={person.id ?? i} style={{ width: `${100 - (i % 3) * 5}%`,
              alignSelf: ALIGN[i % ALIGN.length] }}>
          <Tag person={person} index={i}
               width="100%" sizingWidth={158}
               tilt={TILTS[i % TILTS.length]}
               shadow={SHADOWS[i % SHADOWS.length]}
               faceSize={FACES[i % FACES.length]}
               onClick={() => onOpen(person)} />
        </div>
      ))}
    </div>
  );
}

function EmptyWall({ place }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
                  textAlign: 'center', paddingTop: 40 }}>
      <div style={{ width: 132, border: '2px dashed color-mix(in srgb, var(--muted) 34%, transparent)',
            borderRadius: 'var(--r-tag)', transform: 'rotate(-2deg)', padding: '22px 14px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 26 }}>👋</span>
        <span className="t-quote" style={{ fontSize: 14, color: 'var(--muted)' }}>this spot’s free</span>
      </div>
      <div className="t-h2" style={{ fontSize: 26, marginTop: 26 }}>No tags yet</div>
      <div className="t-body" style={{ fontSize: 14, maxWidth: 260, marginTop: 8 }}>
        You’re the first one here. Stay visible — when someone arrives {place && place !== 'nearby' ? `at ${place}` : 'nearby'}, their tag shows up right beside yours.
      </div>
    </div>
  );
}

export default function GridPage({ onEditTag }) {
  const {
    nearby, myProfile, locationError, loading, lastUpdated, mode,
    hiddenIds, refresh, setVisibilityMode, reloadHidden,
  } = useNearbyPeople();
  const [selfPhoto, setSelfPhoto] = useState(null);
  const [remembered, setRemembered] = useState([]);
  const [sel, setSel] = useState(null);
  const [showParty, setShowParty] = useState(false);

  useEffect(() => { loadLocalPhoto().then(setSelfPhoto); }, []);
  useEffect(() => { getRememberedNames().then(setRemembered); }, []);

  const place = PLACE_FALLBACK;
  const me = myProfile?.display_name ? toBadgePerson(myProfile, { selfPhoto, you: true }) : null;

  const others = useMemo(
    () => [...nearby]
      .filter(p => !hiddenIds.includes(p.id))
      .sort((a, b) => (a.distance_meters ?? 1e9) - (b.distance_meters ?? 1e9))
      .map(p => toBadgePerson(p)),
    [nearby, hiddenIds]
  );

  const visible = mode !== 'invisible';
  // "You" leads; on the board coral marks you even though the header carries the ring.
  const all = useMemo(() => (visible && me ? [me, ...others] : others), [visible, me, others]);

  // split into two staggered columns
  const cols = useMemo(() => {
    const L = [], R = [];
    all.forEach((person, i) => (i % 2 === 0 ? L : R).push({ person, i }));
    return { L, R };
  }, [all]);

  const count = others.length;
  const headLabel = loading ? 'Reading the room…'
    : `${count === 0 ? 'No' : count} ${count === 1 ? 'tag' : 'tags'}${place && place !== 'nearby' ? ` at ${place}` : ' nearby'}`;

  function handleMode(next) {
    if (next === 'party') { setShowParty(true); return; }
    setVisibilityMode(next);
  }

  async function handleRemember(person) {
    await rememberName(person);
    setRemembered(await getRememberedNames());
  }
  async function handleHide(person) {
    await hidePerson(person.id);
    await reloadHidden();
    setSel(null);
  }
  const isRemembered = (p) => remembered.some(r => String(r.id ?? r.name) === String(p?.id ?? p?.name));

  return (
    <div className="no-sb na-screen" style={{ padding: '0 0 96px' }}>
      {/* header */}
      <div style={{ padding: '34px 22px 0', display: 'flex', alignItems: 'flex-end',
                    justifyContent: 'space-between', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div className="t-label" style={{ fontSize: 10 }}>{headLabel}</div>
          <div className="t-display" style={{ fontSize: 40, letterSpacing: '-1.2px', marginTop: 6 }}>
            Near<em>by</em>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <button onClick={refresh} disabled={loading} style={{
            whiteSpace: 'nowrap', background: 'var(--surface)', border: '1.5px solid var(--border)',
            borderRadius: 'var(--r-pill)', padding: '11px 15px', fontWeight: 800, fontSize: 13,
            color: 'var(--text)', cursor: 'pointer' }}>
            {loading ? 'Reading…' : 'Refresh'}
          </button>
          {me && (
            <div onClick={onEditTag} style={{ cursor: 'pointer' }}>
              <Avatar person={me} size={42} border={2} ring="var(--brand)" shadow="none"
                      tint={personTrio(me).tint} deep={personTrio(me).deep} />
            </div>
          )}
        </div>
      </div>

      {/* visibility control */}
      <div style={{ margin: '14px 20px 0' }}>
        <VisibilityControl value={mode} onChange={handleMode} place={place}
                           partyCode={myProfile?.party_code} />
      </div>

      {/* location error */}
      {locationError && !loading && (
        <div className="na-danger-card" style={{ margin: '14px 20px 0', padding: '12px 14px',
              fontWeight: 700, fontSize: 13, color: 'var(--coral-dk)' }}>{locationError}</div>
      )}

      {/* the wall */}
      <div style={{ padding: '18px 20px 0' }}>
        {!visible ? (
          <div style={{ textAlign: 'center', paddingTop: 46 }}>
            <div className="t-h2" style={{ fontSize: 24 }}>You’re invisible</div>
            <div className="t-body" style={{ fontSize: 14, maxWidth: 260, margin: '8px auto 0' }}>
              Your tag has left the wall. Switch to Nearby to see who’s here and be seen.
            </div>
          </div>
        ) : all.length === 0 ? (
          <EmptyWall place={place} />
        ) : (
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <WallColumn people={cols.L} offset={0} onOpen={setSel} />
            <WallColumn people={cols.R} offset={24} onOpen={setSel} />
          </div>
        )}
      </div>

      {sel && (
        <DetailSheet person={sel} index={all.findIndex(p => p.id === sel.id)}
                     remembered={isRemembered(sel)}
                     onRemember={handleRemember} onHide={handleHide}
                     onEditTag={() => { setSel(null); onEditTag && onEditTag(); }}
                     onClose={() => setSel(null)} />
      )}

      {showParty && (
        <PartyCodeSheet initial={myProfile?.party_code || ''}
          onJoin={(code) => { setShowParty(false); setVisibilityMode('party', { partyCode: code }); }}
          onStayVisible={() => { setShowParty(false); setVisibilityMode('nearby'); }}
          onClose={() => setShowParty(false)} />
      )}

      <div className="t-label" style={{ textAlign: 'center', fontSize: 9, marginTop: 28,
            color: 'color-mix(in srgb, var(--muted) 60%, transparent)' }}>
        {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
      </div>
    </div>
  );
}
