import { useState, useEffect, useMemo } from 'react';
import { useNearbyPeople } from '../hooks/useNearbyPeople';
import {
  loadLocalPhoto, getRememberedNames, rememberName, hidePerson,
} from '../profileStorage';
import { toBadgePerson, personTrio } from '../colors';
import { Avatar } from '../components/Avatar';
import Wall from '../components/Wall';
import VisibilityControl from '../components/VisibilityControl';
import DetailSheet from '../components/DetailSheet';
import TagDetail from '../components/TagDetail';
import PartyCodeSheet from '../components/PartyCodeSheet';
import { PLACE_FALLBACK } from '../constants';

// Board tuning per viewport — "the same board, more room".
const BOARD = {
  phone:   { columns: 2, faceBase: 52, sizingWidth: 158, foot: 12,   gap: 12, title: 40 },
  tablet:  { columns: 3, faceBase: 78, sizingWidth: 200, foot: 15,   gap: 20, title: 56 },
  desktop: { columns: 4, faceBase: 72, sizingWidth: 195, foot: 13.5, gap: 18, title: 48 },
};

const CLOSING_NOTE = 'Nothing is kept once you leave — no messages, no history. Names you remember stay on your phone.';

function CenteredState({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: 40 }}>
      {children}
    </div>
  );
}

function EmptyWall({ place, mode, partyCode }) {
  const party = mode === 'party';
  return (
    <CenteredState>
      <div style={{ width: 132, border: '2px dashed color-mix(in srgb, var(--muted) 34%, transparent)',
            borderRadius: 'var(--r-tag)', transform: 'rotate(-2deg)', padding: '22px 14px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 26 }}>{party ? '🎉' : '👋'}</span>
        <span className="t-quote" style={{ fontSize: 14, color: 'var(--muted)' }}>this spot’s free</span>
      </div>
      <div className="t-h2" style={{ fontSize: 26, marginTop: 26 }}>{party ? 'No one’s joined yet' : 'No tags yet'}</div>
      <div className="t-body" style={{ fontSize: 14, maxWidth: 268, marginTop: 8 }}>
        {party ? (
          <>No one nearby has entered the code{partyCode ? <> <strong>{partyCode}</strong></> : ''} yet. Share it with the people you want to see.</>
        ) : (
          <>You’re the first one here. Stay visible — when someone arrives {place && place !== 'nearby' ? `at ${place}` : 'nearby'}, their tag shows up right beside yours.</>
        )}
      </div>
    </CenteredState>
  );
}

function LocationNeeded({ kind, onRetry }) {
  const denied = kind === 'denied';
  return (
    <CenteredState>
      <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'var(--sage-lt)',
            border: '1.5px solid var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30 }}>📍</div>
      <div className="t-h2" style={{ fontSize: 24, marginTop: 20 }}>
        {denied ? 'Turn on location' : 'Couldn’t find you'}
      </div>
      <div className="t-body" style={{ fontSize: 14, maxWidth: 280, marginTop: 8 }}>
        {denied
          ? 'Nametag shows you the people in the room with you, so it needs your location while you’re here. Turn it on in your browser or device settings, then try again.'
          : 'We couldn’t get your location just now. Check your connection and try again.'}
      </div>
      <button className="na-btn" style={{ marginTop: 22, minWidth: 180 }} onClick={onRetry}>Try again</button>
    </CenteredState>
  );
}

function WallSkeleton({ columns = 2 }) {
  const tags = Array.from({ length: columns === 2 ? 4 : columns * 2 });
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      {Array.from({ length: columns }).map((_, c) => (
        <div key={c} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20, marginTop: c % 2 ? 24 : 0 }}>
          {tags.slice(0, 2).map((_, i) => (
            <div key={i} style={{ background: 'var(--surface)', border: '1.5px solid var(--border)',
                  borderRadius: 'var(--r-tag)', padding: '13px 12px 16px', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 8, animation: `nt-pulse 1.1s ease ${(c + i) * 0.15}s infinite alternate` }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--warm2)' }} />
              <div style={{ width: '55%', height: 16, borderRadius: 6, background: 'var(--warm2)', marginTop: 4 }} />
              <div style={{ width: '40%', height: 12, borderRadius: 99, background: 'var(--warm2)' }} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function GridPage({ onEditTag, layout = 'phone' }) {
  const {
    nearby, myProfile, locationErrorKind, loading, lastUpdated, mode,
    hiddenIds, refresh, setVisibilityMode, reloadHidden,
  } = useNearbyPeople();
  const [selfPhoto, setSelfPhoto] = useState(null);
  const [remembered, setRemembered] = useState([]);
  const [sel, setSel] = useState(null);
  const [showParty, setShowParty] = useState(false);

  useEffect(() => { loadLocalPhoto().then(setSelfPhoto); }, []);
  useEffect(() => { getRememberedNames().then(setRemembered); }, []);

  const place = PLACE_FALLBACK;
  const b = BOARD[layout] || BOARD.phone;
  const isDesktop = layout === 'desktop';

  const me = myProfile?.display_name ? toBadgePerson(myProfile, { selfPhoto, you: true }) : null;
  const others = useMemo(
    () => [...nearby]
      .filter(p => !hiddenIds.includes(p.id))
      .sort((a, b2) => (a.distance_meters ?? 1e9) - (b2.distance_meters ?? 1e9))
      .map(p => toBadgePerson(p)),
    [nearby, hiddenIds]
  );
  const visible = mode !== 'invisible';
  const all = useMemo(() => (visible && me ? [me, ...others] : others), [visible, me, others]);

  const count = others.length;
  const headLabel = loading ? 'Reading the room…'
    : `${count === 0 ? 'No' : count} ${count === 1 ? 'tag' : 'tags'}${place && place !== 'nearby' ? ` at ${place}` : isDesktop ? ' here' : ' nearby'}`;

  function handleMode(next) {
    if (next === 'party') { setShowParty(true); return; }
    setVisibilityMode(next);
  }
  async function handleRemember(person) { await rememberName(person); setRemembered(await getRememberedNames()); }
  async function handleHide(person) { await hidePerson(person.id); await reloadHidden(); setSel(null); }
  const isRemembered = (p) => remembered.some(r => String(r.id ?? r.name) === String(p?.id ?? p?.name));

  let wall;
  if (!visible) {
    wall = (
      <div style={{ textAlign: 'center', paddingTop: 46 }}>
        <div className="t-h2" style={{ fontSize: 24 }}>You’re invisible</div>
        <div className="t-body" style={{ fontSize: 14, maxWidth: 260, margin: '8px auto 0' }}>
          Your tag has left the wall. Switch to Nearby to see who’s here and be seen.
        </div>
      </div>
    );
  } else if (locationErrorKind) {
    wall = <LocationNeeded kind={locationErrorKind} onRetry={refresh} />;
  } else if (loading && all.length === 0) {
    wall = <WallSkeleton columns={b.columns} />;
  } else if (all.length === 0) {
    wall = <EmptyWall place={place} mode={mode} partyCode={myProfile?.party_code} />;
  } else {
    wall = (
      <>
        <Wall people={all} columns={b.columns} gap={b.gap} faceBase={b.faceBase}
              sizingWidth={b.sizingWidth} footFontSize={b.foot} onOpen={setSel} />
        {others.length === 0 && !loading && (
          <div className="t-body" style={{ textAlign: 'center', fontSize: 13.5, maxWidth: 300, margin: '26px auto 0' }}>
            {mode === 'party'
              ? <>No one else has entered the code{myProfile?.party_code ? <> <strong>{myProfile.party_code}</strong></> : ''} yet — share it to fill the wall.</>
              : <>You’re the first one here. When someone else arrives, their tag appears beside yours.</>}
          </div>
        )}
      </>
    );
  }

  const refreshPill = (
    <button onClick={refresh} disabled={loading} style={{ whiteSpace: 'nowrap', background: 'var(--surface)',
          border: '1.5px solid var(--border)', borderRadius: 'var(--r-pill)', padding: '11px 15px',
          fontWeight: 800, fontSize: 13, color: 'var(--text)', cursor: 'pointer' }}>
      {loading ? 'Reading…' : 'Refresh'}
    </button>
  );
  const meAvatar = me && (
    <div onClick={onEditTag} style={{ cursor: 'pointer' }}>
      <Avatar person={me} size={42} border={2} ring="var(--brand)" shadow="none"
              tint={personTrio(me).tint} deep={personTrio(me).deep} />
    </div>
  );

  const partySheet = showParty && (
    <PartyCodeSheet initial={myProfile?.party_code || ''}
      onJoin={(code) => { setShowParty(false); setVisibilityMode('party', { partyCode: code }); }}
      onStayVisible={() => { setShowParty(false); setVisibilityMode('nearby'); }}
      onClose={() => setShowParty(false)} />
  );

  // ── Desktop: center board + right "Selected" rail (never covers the room) ──
  if (isDesktop) {
    return (
      <div style={{ display: 'flex', alignItems: 'flex-start', minHeight: '100vh' }}>
        <div className="no-sb" style={{ flex: 1, minWidth: 0, padding: '30px 40px 60px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <div className="t-label" style={{ fontSize: 10 }}>{headLabel}</div>
              <div className="t-display" style={{ fontSize: b.title, letterSpacing: '-1.4px', marginTop: 6 }}>
                Near<em>by</em>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>{refreshPill}{meAvatar}</div>
          </div>
          <div style={{ maxWidth: 420, marginTop: 16 }}>
            <VisibilityControl value={mode} onChange={handleMode} place={place} partyCode={myProfile?.party_code} />
          </div>
          <div style={{ marginTop: 24 }}>{wall}</div>
        </div>

        <aside style={{ width: 360, flexShrink: 0, alignSelf: 'stretch', background: 'var(--surface)',
              borderLeft: '1.5px solid var(--border)', padding: '30px 24px', position: 'sticky', top: 0,
              minHeight: '100vh' }}>
          <div className="t-label" style={{ fontSize: 10, marginBottom: 16 }}>Selected</div>
          {sel ? (
            <TagDetail person={sel} index={all.findIndex(p => p.id === sel.id)} remembered={isRemembered(sel)}
                       onRemember={handleRemember} onHide={handleHide}
                       onEditTag={() => { setSel(null); onEditTag && onEditTag(); }} closingNote={CLOSING_NOTE} />
          ) : (
            <div className="t-body" style={{ fontSize: 13.5, lineHeight: 1.7 }}>
              Tap a tag to see who it is. {CLOSING_NOTE}
            </div>
          )}
        </aside>
        {partySheet}
      </div>
    );
  }

  // ── Tablet: one wide board, visibility in the header, bottom tab bar ──
  if (layout === 'tablet') {
    return (
      <div className="no-sb" style={{ maxWidth: 820, margin: '0 auto', padding: '40px 44px 96px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div className="t-label" style={{ fontSize: 10 }}>{headLabel}</div>
            <div className="t-display" style={{ fontSize: b.title, letterSpacing: '-1.4px', marginTop: 6 }}>
              Near<em>by</em>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>{refreshPill}{meAvatar}</div>
        </div>
        <div style={{ maxWidth: 460, marginTop: 16 }}>
          <VisibilityControl value={mode} onChange={handleMode} place={place} partyCode={myProfile?.party_code} />
        </div>
        <div style={{ marginTop: 24 }}>{wall}</div>
        {sel && (
          <DetailSheet person={sel} index={all.findIndex(p => p.id === sel.id)} remembered={isRemembered(sel)}
                       onRemember={handleRemember} onHide={handleHide}
                       onEditTag={() => { setSel(null); onEditTag && onEditTag(); }} onClose={() => setSel(null)} />
        )}
        {partySheet}
      </div>
    );
  }

  // ── Phone ──
  return (
    <div className="no-sb na-screen" style={{ padding: '0 0 96px' }}>
      <div style={{ padding: '34px 22px 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div className="t-label" style={{ fontSize: 10 }}>{headLabel}</div>
          <div className="t-display" style={{ fontSize: b.title, letterSpacing: '-1.2px', marginTop: 6 }}>Near<em>by</em></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>{refreshPill}{meAvatar}</div>
      </div>
      <div style={{ margin: '14px 20px 0' }}>
        <VisibilityControl value={mode} onChange={handleMode} place={place} partyCode={myProfile?.party_code} />
      </div>
      <div style={{ padding: '18px 20px 0' }}>{wall}</div>
      {sel && (
        <DetailSheet person={sel} index={all.findIndex(p => p.id === sel.id)} remembered={isRemembered(sel)}
                     onRemember={handleRemember} onHide={handleHide}
                     onEditTag={() => { setSel(null); onEditTag && onEditTag(); }} onClose={() => setSel(null)} />
      )}
      {partySheet}
      <div className="t-label" style={{ textAlign: 'center', fontSize: 9, marginTop: 28,
            color: 'color-mix(in srgb, var(--muted) 60%, transparent)' }}>
        {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
      </div>
    </div>
  );
}
