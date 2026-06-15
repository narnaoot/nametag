// screens-app.jsx — NearbyScreen (grid/stacked/radar), MyTagScreen, TabBar
// Exports to window: NearbyScreen, MyTagScreen, TabBar

const { useState: useS, useMemo: useM } = React;

const PRONOUN_OPTIONS = ['she/her', 'he/him', 'they/them', 'she/they', 'he/they', 'custom'];
const STICKER_OPTIONS = ['👋','🌟','🎉','🌈','🦄','🐉','🌸','🍕','🎸','📚','🎨','🌍','☕','🤖','🐱','🐶'];
const RADIUS_OPTIONS = [
  { v: 50,   l: '50 m · same floor' },
  { v: 100,  l: '100 m · a city block' },
  { v: 200,  l: '200 m · nearby blocks' },
  { v: 500,  l: '500 m · the neighborhood' },
  { v: 1000, l: '1 km · wider area' },
];

/* ── shared toggle ── */
function Toggle({ on, onClick, color = 'var(--primary)' }) {
  return (
    <div onClick={onClick} style={{
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

/* ═══════════════ NEARBY ═══════════════ */
function Nearby({ you, people, accentMode, variant, tilt, layout, visible, onToggleVisible,
                 waves, onWave, onEditTag }) {
  const [sel, setSel] = useS(null);
  const [refreshing, setRefreshing] = useS(false);
  const doRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };
  const all = useM(() => {
    const list = [];
    if (you?.name) list.push({ ...you, you: true });
    const sorted = [...people].sort((a, b) => (a.distance ?? 1e9) - (b.distance ?? 1e9));
    return list.concat(sorted);
  }, [you, people]);

  const selAccent = sel ? resolveAccent(sel, all.findIndex(p => p.id === sel.id), accentMode) : null;

  return (
    <div style={{ height: '100%', position: 'relative' }}>
    <div className="no-sb" style={{ height: '100%', overflowY: 'auto', padding: '70px 18px 96px' }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div className="t-display" style={{ fontSize: 38 }}>
            Near<em>by</em>
          </div>
          <div className="t-label" style={{ marginTop: 6 }}>
            {refreshing ? 'Scanning nearby…'
              : people.length === 0 ? 'Updated 9:41 · just you'
              : `Updated 9:41 · ${people.length} people`}
          </div>
        </div>
        <button className="na-chip" style={{ fontWeight: 800 }} onClick={doRefresh}>
          {refreshing ? 'Scanning…' : 'Refresh →'}
        </button>
      </div>

      {/* visibility banner */}
      <div onClick={onToggleVisible} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        background: visible ? 'color-mix(in srgb, var(--sage) 14%, var(--surface))'
                            : 'var(--warm2)',
        border: `var(--hairline) solid ${visible ? 'color-mix(in srgb, var(--sage) 34%, transparent)' : 'var(--border)'}`,
        borderRadius: 'var(--r)', padding: '13px 16px', marginBottom: 20, cursor: 'pointer',
      }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 14, whiteSpace: 'nowrap' }}>
            {visible ? 'You’re visible nearby' : 'You’re hidden right now'}
          </div>
          <div className="t-body" style={{ fontSize: 12.5, marginTop: 2, whiteSpace: 'nowrap' }}>
            {visible ? 'Tap to slip out of view.' : 'Tap to share your name nearby.'}
          </div>
        </div>
        <Toggle on={visible} onClick={() => {}} color="var(--sage)" />
      </div>

      {refreshing
        ? <SkeletonGrid variant={variant} layout={layout} />
        : people.length === 0
        ? <EmptyNearby you={you} accentMode={accentMode} variant={variant} tilt={tilt}
                       visible={visible} onSelect={setSel} />
        : layout === 'radar'
        ? <Radar you={you} people={people} accentMode={accentMode} visible={visible}
                 onSelect={setSel} />
        : <PeopleLayout all={all} accentMode={accentMode} variant={variant} tilt={tilt}
                        layout={layout} visible={visible} onSelect={setSel} waves={waves} />}
    </div>
    <DetailSheet person={sel} accent={selAccent} waved={!!(sel && waves && waves[sel.id])}
                 onWave={onWave} onClose={() => setSel(null)}
                 onEditTag={() => { setSel(null); onEditTag && onEditTag(); }} />
    </div>
  );
}

/* ── Loading skeleton — pulsing placeholder badges ── */
function SkeletonGrid({ variant, layout }) {
  const sticker = variant === 'sticker';
  const cols = (layout === 'grid' && sticker) ? 'repeat(2, 1fr)' : '1fr';
  const n = sticker ? 4 : 4;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: cols, columnGap: 14,
                  rowGap: sticker ? 30 : 14, justifyItems: 'center',
                  maxWidth: layout === 'stacked' ? 320 : '100%', margin: '0 auto' }}>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} style={{ width: '100%', display: 'flex', flexDirection: 'column',
                              alignItems: 'center', animation: `nt-pulse 1.1s ease ${i * 0.12}s infinite alternate` }}>
          {sticker ? (
            <React.Fragment>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--warm2)',
                            border: 'var(--hairline) solid var(--border)', marginBottom: -14, zIndex: 2 }}></div>
              <div style={{ width: 168, height: 150, borderRadius: 8, background: 'var(--surface)',
                            border: 'var(--hairline) solid var(--border)', paddingTop: 24 }}>
                <div style={{ height: 28, background: 'var(--warm2)', margin: '0 0 14px' }}></div>
                <div style={{ height: 14, background: 'var(--warm2)', borderRadius: 99, margin: '0 28px 8px' }}></div>
                <div style={{ height: 10, background: 'var(--warm2)', borderRadius: 99, margin: '0 40px' }}></div>
              </div>
            </React.Fragment>
          ) : (
            <div style={{ width: '100%', height: 86, borderRadius: 'var(--r)', background: 'var(--surface)',
                          border: 'var(--hairline) solid var(--border)', display: 'flex',
                          alignItems: 'center', gap: 14, padding: '0 16px' }}>
              <div style={{ width: 58, height: 58, borderRadius: '50%', background: 'var(--warm2)', flexShrink: 0 }}></div>
              <div style={{ flex: 1 }}>
                <div style={{ height: 16, background: 'var(--warm2)', borderRadius: 99, width: '55%', marginBottom: 9 }}></div>
                <div style={{ height: 11, background: 'var(--warm2)', borderRadius: 99, width: '80%' }}></div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Empty state — you're the first one here ── */
function EmptyNearby({ you, accentMode, variant, tilt, visible, onSelect }) {
  const accent = resolveAccent(you, 0, accentMode);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 6 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
        {/* your badge, tappable */}
        <div className="nt-tappable" onClick={() => onSelect({ ...you, you: true })}
             style={{ cursor: 'pointer', opacity: visible ? 1 : 0.4, position: 'relative' }}>
          <PersonCard person={you} accent={accent} variant={variant}
                      tilt={variant === 'sticker' ? -tilt : 0} />
          <span style={{
            position: 'absolute', top: variant === 'sticker' ? -6 : 8,
            right: variant === 'sticker' ? 12 : 10, zIndex: 5,
            background: 'var(--text)', color: 'var(--bg)',
            fontWeight: 800, fontSize: 9, letterSpacing: '.12em',
            padding: '3px 8px', borderRadius: 99, textTransform: 'uppercase',
          }}>You</span>
        </div>
        {/* the free spot — a dashed ghost sticker */}
        {variant === 'sticker' && (
          <div style={{
            width: 150, alignSelf: 'stretch', minHeight: 200, marginTop: 28,
            border: '2px dashed color-mix(in srgb, var(--muted) 38%, transparent)',
            borderRadius: 10, transform: `rotate(${tilt || 2}deg)`,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 8, padding: 14,
          }}>
            <span style={{ fontSize: 26 }}>👋</span>
            <span className="t-quote" style={{ fontSize: 13.5, color: 'var(--muted)', textAlign: 'center' }}>
              this spot’s free
            </span>
          </div>
        )}
      </div>
      <div className="t-h2" style={{ fontSize: 24, marginTop: 30, textAlign: 'center', whiteSpace: 'nowrap' }}>
        No tags nearby <em style={{ color: 'var(--primary)' }}>yet</em>
      </div>
      <div className="t-body" style={{ fontSize: 14, color: 'var(--muted)', textAlign: 'center',
                                       maxWidth: 250, marginTop: 9, lineHeight: 1.55 }}>
        You’re the first one here. Stay visible — when someone arrives, their tag shows up right beside yours.
      </div>
    </div>
  );
}

function PeopleLayout({ all, accentMode, variant, tilt, layout, visible, onSelect, waves }) {
  const isGrid = layout === 'grid';
  const cols = (isGrid && variant === 'sticker') ? 'repeat(2, 1fr)' : '1fr';
  const rowGap = variant === 'sticker' ? 30 : 14;

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: cols,
      columnGap: 14, rowGap,
      justifyItems: variant === 'sticker' ? 'center' : 'stretch',
      maxWidth: layout === 'stacked' ? 320 : '100%', margin: '0 auto',
    }}>
      {all.map((p, i) => {
        const accent = resolveAccent(p, i, accentMode);
        const dim = p.you && !visible;
        const waveState = !p.you ? (waves && waves[p.id] ? 'sent' : (p.wavedAtYou ? 'incoming' : null)) : null;
        return (
          <div key={p.id} onClick={() => onSelect && onSelect(p)} className="nt-tappable" style={{
            position: 'relative', width: '100%',
            display: 'flex', justifyContent: 'center',
            opacity: dim ? 0.4 : 1, cursor: 'pointer',
          }}>
            <PersonCard person={p} accent={accent} variant={variant}
                        tilt={variant === 'sticker' ? (i % 2 === 0 ? -tilt : tilt) : 0}
                        waveState={waveState} />
            {p.you && (
              <span style={{
                position: 'absolute', top: variant === 'sticker' ? -6 : 8,
                right: variant === 'sticker' ? 18 : 10, zIndex: 5,
                background: 'var(--text)', color: 'var(--bg)',
                fontWeight: 800, fontSize: 9, letterSpacing: '.12em',
                padding: '3px 8px', borderRadius: 99, textTransform: 'uppercase',
              }}>You</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Radar layout — spatial map on a dotted grid ── */
function Radar({ you, people, accentMode, visible, onSelect }) {
  const SIZE = 320, C = SIZE / 2;
  const maxD = Math.max(...people.map(p => p.distance), 100);

  return (
    <div>
      <div className="dotgrid" style={{
        position: 'relative', width: '100%', maxWidth: SIZE, aspectRatio: '1',
        margin: '0 auto', borderRadius: 'var(--r)',
        border: 'var(--hairline) solid var(--border)', overflow: 'hidden',
        background: 'var(--surface)',
      }}>
        {/* concentric rings */}
        {[0.4, 0.72, 1].map((f, i) => (
          <div key={i} style={{
            position: 'absolute', left: '50%', top: '50%',
            width: `${f * 88}%`, height: `${f * 88}%`,
            transform: 'translate(-50%,-50%)', borderRadius: '50%',
            border: '1.5px dashed color-mix(in srgb, var(--muted) 35%, transparent)',
          }} />
        ))}
        {/* you in center */}
        <Pin person={you} accent="var(--primary)" x={C} y={C} size={52} you dim={!visible}
             onClick={() => onSelect({ ...you, you: true })} />
        {/* others by polar position */}
        {people.map((p, i) => {
          const ang = (i * 49 + 20) * Math.PI / 180;
          const r = (0.22 + 0.66 * (p.distance / maxD)) * (SIZE * 0.44);
          const x = C + r * Math.cos(ang), y = C + r * Math.sin(ang);
          return (
            <Pin key={p.id} person={p} accent={resolveAccent(p, i, accentMode)}
                 x={x} y={y} size={40} onClick={() => onSelect(p)} />
          );
        })}
      </div>
      <div className="t-label" style={{ textAlign: 'center', marginTop: 12 }}>
        Tap a face to see their tag
      </div>
    </div>
  );
}

function Pin({ person, accent, x, y, size, you, dim, onClick }) {
  return (
    <div onClick={onClick} style={{
      position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
      cursor: 'pointer', opacity: dim ? 0.4 : 1, zIndex: you ? 4 : 3,
    }}>
      <Avatar person={person} size={size} accent={accent} />
      <span style={{
        fontWeight: 800, fontSize: 10, color: 'var(--text)',
        background: 'var(--surface)', padding: '1px 7px', borderRadius: 99,
        border: 'var(--hairline) solid var(--border)', whiteSpace: 'nowrap',
      }}>{you ? 'You' : person.name}</span>
    </div>
  );
}

/* ═══════════════ MY TAG ═══════════════ */
function Field({ label, count, max, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
        <span style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--text)' }}>{label}</span>
        {max != null && <span className="t-label" style={{
          color: count > max - 5 ? 'var(--primary)' : 'var(--muted)' }}>{count}/{max}</span>}
      </div>
      {children}
    </div>
  );
}

function MyTag({ you, setYou, accentMode, variant, tilt }) {
  const [confirmDel, setConfirmDel] = useS(false);
  const u = you;
  const set = (patch) => setYou({ ...u, ...patch });
  const accent = resolveAccent(u, 0, accentMode);

  const toggleSticker = (s) => {
    const has = u.stickers.includes(s);
    if (has) set({ stickers: u.stickers.filter(x => x !== s) });
    else if (u.stickers.length < 3) set({ stickers: [...u.stickers, s] });
  };

  return (
    <div className="no-sb" style={{ height: '100%', overflowY: 'auto', padding: '70px 22px 96px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
        <div className="t-display" style={{ fontSize: 38 }}>My <em>tag</em></div>
        <span className="t-label" style={{ color: 'var(--sage)' }}>Saved ✓</span>
      </div>

      {/* live preview */}
      <div style={{
        display: 'flex', justifyContent: 'center', padding: '22px 0 26px',
        background: 'var(--warm)', borderRadius: 'var(--r)',
        border: 'var(--hairline) solid var(--border)', marginBottom: 24,
      }}>
        <PersonCard person={u} accent={accent} variant={variant}
                    tilt={variant === 'sticker' ? tilt : 0} />
      </div>

      {/* photo */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 22 }}>
        <Avatar person={u} size={88} accent={accent} />
        <span style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--primary)', cursor: 'pointer' }}>
          Change photo
        </span>
      </div>

      <Field label="Your name" count={u.name.length} max={40}>
        <input className="na-field" value={u.name} maxLength={40}
               onChange={e => set({ name: e.target.value })}
               placeholder="What should people call you?" />
      </Field>

      <Field label="Your pronouns">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {PRONOUN_OPTIONS.map(opt => (
            <button key={opt} className="na-chip" data-on={u.pronouns === opt}
              onClick={() => set({ pronouns: opt === 'custom' ? u.pronouns : opt })}>
              {opt === 'custom' ? '+ custom' : opt}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Tagline" count={u.tagline.length} max={60}>
        <input className="na-field" value={u.tagline} maxLength={60}
               onChange={e => set({ tagline: e.target.value })}
               placeholder="A short line about you…" />
      </Field>

      <Field label="Show me to people within">
        <div style={{ position: 'relative' }}>
          <select className="na-field" value={u.radius || 100}
                  onChange={e => set({ radius: Number(e.target.value) })}
                  style={{ appearance: 'none', cursor: 'pointer' }}>
            {RADIUS_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
          <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                         pointerEvents: 'none', color: 'var(--muted)', fontWeight: 800 }}>▾</span>
        </div>
      </Field>

      {/* visibility */}
      <div style={{
        display: 'flex', gap: 13, alignItems: 'flex-start', padding: 16, marginBottom: 22,
        background: 'color-mix(in srgb, var(--primary) 8%, var(--surface))',
        border: 'var(--hairline) solid color-mix(in srgb, var(--primary) 26%, transparent)',
        borderRadius: 'var(--r)',
      }}>
        <Toggle on={u.alwaysVisible !== false} onClick={() => set({ alwaysVisible: !(u.alwaysVisible !== false) })} />
        <div>
          <div style={{ fontWeight: 800, fontSize: 13.5 }}>
            {u.alwaysVisible !== false ? 'Always visible when nearby' : 'Only visible when I choose'}
          </div>
          <div className="t-body" style={{ fontSize: 12.5, marginTop: 2 }}>
            {u.alwaysVisible !== false
              ? 'People nearby see your name automatically.'
              : 'Hidden by default — flip visibility on from Nearby.'}
          </div>
        </div>
      </div>

      {/* nametag color — the paintbox */}
      <Field label="Nametag color">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {window.NAMETAG_ACCENT_ORDER.map(key => {
            const hex = `var(--${key})`;
            const on = u.accent === key;
            return (
              <button key={key} onClick={() => set({ accent: key })} title={key}
                style={{
                  width: 34, height: 34, borderRadius: '50%', background: hex,
                  border: on ? '3px solid var(--text)' : '3px solid transparent',
                  boxShadow: on ? '0 0 0 2px var(--surface) inset' : 'none',
                  cursor: 'pointer', transition: 'transform .12s ease',
                  transform: on ? 'scale(1.08)' : 'none',
                }} />
            );
          })}
        </div>
      </Field>

      {/* stickers */}
      <Field label={`Stickers · pick up to 3`}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {STICKER_OPTIONS.map(s => {
            const on = u.stickers.includes(s);
            return (
              <button key={s} onClick={() => toggleSticker(s)} style={{
                width: 42, height: 42, borderRadius: 'var(--r)', fontSize: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all .12s ease',
                background: on ? 'color-mix(in srgb, var(--primary) 14%, var(--surface))' : 'var(--surface)',
                border: `var(--hairline) solid ${on ? 'var(--primary)' : 'var(--border)'}`,
              }}>{s}</button>
            );
          })}
        </div>
      </Field>

      {/* delete account */}
      <div style={{ marginTop: 14, paddingTop: 20, borderTop: 'var(--hairline) solid var(--border)' }}>
        {!confirmDel ? (
          <button onClick={() => setConfirmDel(true)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--muted)', fontWeight: 700, fontSize: 13.5, padding: 0 }}>
            Delete account
          </button>
        ) : (
          <div style={{
            background: 'color-mix(in srgb, var(--danger) 9%, var(--surface))',
            border: 'var(--hairline) solid color-mix(in srgb, var(--danger) 30%, transparent)',
            borderRadius: 'var(--r)', padding: 16,
          }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--danger)' }}>Delete your account?</div>
            <div className="t-body" style={{ fontSize: 12.5, margin: '6px 0 12px' }}>
              This erases your profile, photo, and account immediately. There’s no undo.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="na-btn" style={{ flex: 1, padding: '11px', background: 'var(--danger)', color: '#fff' }}
                      onClick={() => setConfirmDel(false)}>Delete everything</button>
              <button className="na-btn na-btn--ghost" style={{ flex: 1, padding: '11px' }}
                      onClick={() => setConfirmDel(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════ TAB BAR ═══════════════ */
function TabBar({ tab, onTab }) {
  const tabs = [['grid', '👥', 'Nearby'], ['profile', '🏷️', 'My tag']];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 40,
      display: 'flex', background: 'var(--surface)',
      borderTop: 'var(--hairline) solid var(--border)',
      paddingBottom: 22, boxShadow: '0 -4px 20px rgba(61,43,31,0.05)',
    }}>
      {tabs.map(([id, icon, label]) => {
        const on = tab === id;
        return (
          <button key={id} onClick={() => onTab(id)} style={{
            flex: 1, padding: '11px 0 6px', background: 'none', border: 'none',
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
    </div>
  );
}

Object.assign(window, { Nearby, MyTag, TabBar });
