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

function EmptyWall({ place }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: 40 }}>
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

export default function GridPage({ onEditTag, layout = 'phone' }) {
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

  const wall = !visible ? (
    <div style={{ textAlign: 'center', paddingTop: 46 }}>
      <div className="t-h2" style={{ fontSize: 24 }}>You’re invisible</div>
      <div className="t-body" style={{ fontSize: 14, maxWidth: 260, margin: '8px auto 0' }}>
        Your tag has left the wall. Switch to Nearby to see who’s here and be seen.
      </div>
    </div>
  ) : all.length === 0 ? (
    <EmptyWall place={place} />
  ) : (
    <Wall people={all} columns={b.columns} gap={b.gap} faceBase={b.faceBase}
          sizingWidth={b.sizingWidth} footFontSize={b.foot} onOpen={setSel} />
  );

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
          {locationError && !loading && (
            <div className="na-danger-card" style={{ marginTop: 16, padding: '12px 14px', fontWeight: 700,
                  fontSize: 13, color: 'var(--coral-dk)', maxWidth: 420 }}>{locationError}</div>
          )}
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
        {locationError && !loading && (
          <div className="na-danger-card" style={{ marginTop: 16, padding: '12px 14px', fontWeight: 700,
                fontSize: 13, color: 'var(--coral-dk)', maxWidth: 460 }}>{locationError}</div>
        )}
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
      {locationError && !loading && (
        <div className="na-danger-card" style={{ margin: '14px 20px 0', padding: '12px 14px', fontWeight: 700,
              fontSize: 13, color: 'var(--coral-dk)' }}>{locationError}</div>
      )}
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
