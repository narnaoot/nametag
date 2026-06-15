// onboarding.jsx — first-run "write your name on your tag" moment.
// Shown after Create account. The badge fills in live as you type.
// Exports to window: OnboardingScreen

const { useState: useStateO } = React;

const OB_PRONOUNS = ['she/her', 'he/him', 'they/them', 'she/they', 'he/they'];

function OnboardingScreen({ you, setYou, onDone }) {
  const [name, setName] = useStateO('');
  const [pronouns, setPronouns] = useStateO('');
  const [accentKey, setAccentKey] = useStateO('teal');

  const ready = name.trim().length > 0;
  const draft = {
    name: name.trim() || ' ',
    pronouns: pronouns || ' ',
    tagline: '',
    stickers: [],
    distance: null,
    photo: null,
  };
  const accentHex = `var(--${accentKey})`;

  const finish = () => {
    if (!ready) return;
    setYou(prev => ({ ...prev, name: name.trim(), pronouns: pronouns || prev.pronouns, accent: accentKey }));
    onDone();
  };

  return (
    <div className="dotgrid no-sb" style={{ height: '100%', width: '100%', overflowY: 'auto',
                  padding: '70px 26px 40px', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', boxSizing: 'border-box' }}>
      <div className="t-label" style={{ color: 'var(--primary)' }}>One last thing</div>
      <div className="t-display" style={{ fontSize: 30, textAlign: 'center', marginTop: 8, lineHeight: 1.1 }}>
        Write your name<br />on your <em>tag</em>
      </div>

      {/* the live badge */}
      <div className="nt-pop" style={{ marginTop: 22, marginBottom: 26, transform: 'rotate(-2deg)' }}>
        <PersonCard person={draft} accent={accentHex} variant="sticker" tilt={0} />
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <input className="na-field" autoFocus type="text" placeholder="Your name" maxLength={20}
               value={name} onChange={e => setName(e.target.value)}
               style={{ textAlign: 'center', fontWeight: 800, fontSize: 17 }} />

        {/* pronouns */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {OB_PRONOUNS.map(p => (
            <button key={p} className="na-chip" data-on={pronouns === p ? 'true' : 'false'}
                    onClick={() => setPronouns(prev => prev === p ? '' : p)}>
              {p}
            </button>
          ))}
        </div>

        {/* paintbox */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 2 }}>
          {window.NAMETAG_ACCENT_ORDER.map(k => (
            <button key={k} onClick={() => setAccentKey(k)} aria-label={k} style={{
              width: 34, height: 34, borderRadius: '50%', cursor: 'pointer',
              background: `var(--${k})`,
              border: accentKey === k ? '3px solid var(--text)' : '3px solid transparent',
              outline: 'var(--hairline) solid var(--border)',
              transition: 'transform .12s ease',
              transform: accentKey === k ? 'scale(1.12)' : 'none',
            }}></button>
          ))}
        </div>

        <button className="na-btn" disabled={!ready} onClick={finish} style={{
          marginTop: 6, opacity: ready ? 1 : 0.45,
          cursor: ready ? 'pointer' : 'default',
        }}>
          Stick it on →
        </button>
        <div className="t-label" style={{ textAlign: 'center', fontSize: 9.5 }}>
          You can add a photo &amp; stickers later
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { OnboardingScreen });
