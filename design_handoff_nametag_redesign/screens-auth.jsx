// screens-auth.jsx — Wordmark + AuthScreen (3 compositions: card / editorial / badge)
// Exports to window: Wordmark, AuthScreen

const { useState: useStateA } = React;

/* Brand-styled wordmark: Playfair 900, coral italic "tag". */
function Wordmark({ size = 34, block = false }) {
  return (
    <span style={{
      fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: size,
      letterSpacing: '-1.5px', color: 'var(--text)', lineHeight: 1,
      display: block ? 'block' : 'inline-block',
    }}>
      Name<em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>tag</em>
    </span>
  );
}

function PwField({ value, onChange, placeholder }) {
  const [show, setShow] = useStateA(false);
  return (
    <div style={{ position: 'relative' }}>
      <input className="na-field" style={{ paddingRight: 56 }}
        type={show ? 'text' : 'password'} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)} />
      <button type="button" onClick={() => setShow(s => !s)}
        style={{
          position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer',
          fontWeight: 800, fontSize: 12.5, color: 'var(--muted)',
          textTransform: 'uppercase', letterSpacing: '.08em',
        }}>{show ? 'Hide' : 'Show'}</button>
    </div>
  );
}

function AuthForm({ onSignIn, onRegister, compact }) {
  const [mode, setMode] = useStateA('login'); // login | register | forgot
  const [email, setEmail] = useStateA('');
  const [pw, setPw] = useStateA('');

  if (mode === 'forgot') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <button onClick={() => setMode('login')} style={{
          alignSelf: 'flex-start', background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--muted)', fontWeight: 700, fontSize: 13.5, padding: 0 }}>
          ← Back to sign in
        </button>
        <div className="t-h3" style={{ fontSize: 19 }}>Forgot your password?</div>
        <div className="t-body" style={{ fontSize: 13.5, marginTop: -6 }}>
          Enter your email and we’ll send a reset link your way.
        </div>
        <input className="na-field" type="email" placeholder="you@email.com"
               value={email} onChange={e => setEmail(e.target.value)} />
        <button className="na-btn" onClick={() => setMode('login')}>Send reset link</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* segmented tabs */}
      <div style={{
        display: 'flex', gap: 4, padding: 4, borderRadius: 'var(--r-pill)',
        background: 'var(--warm2)', border: 'var(--hairline) solid var(--border)',
      }}>
        {[['login', 'Sign in'], ['register', 'Create account']].map(([m, label]) => (
          <button key={m} onClick={() => setMode(m)} style={{
            flex: 1, padding: '9px 8px', borderRadius: 'var(--r-pill)', border: 'none',
            cursor: 'pointer', fontWeight: 800, fontSize: 13.5,
            background: mode === m ? 'var(--surface)' : 'transparent',
            color: mode === m ? 'var(--primary)' : 'var(--muted)',
            boxShadow: mode === m ? '0 2px 8px rgba(61,43,31,0.10)' : 'none',
            transition: 'all .15s ease',
          }}>{label}</button>
        ))}
      </div>
      <input className="na-field" type="email" placeholder="you@email.com"
             value={email} onChange={e => setEmail(e.target.value)} />
      <PwField value={pw} onChange={setPw}
               placeholder={mode === 'register' ? 'Password (8+ characters)' : 'Password'} />
      <button className="na-btn" onClick={mode === 'register' && onRegister ? onRegister : onSignIn}>
        {mode === 'login' ? 'Sign in' : 'Create account'}
      </button>
      {mode === 'login' && (
        <button onClick={() => setMode('forgot')} style={{
          background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)',
          fontWeight: 700, fontSize: 13, marginTop: -2 }}>
          Forgot password?
        </button>
      )}
    </div>
  );
}

function AuthScreen({ onSignIn, onRegister, composition = 'card', accent }) {
  const coral = 'var(--coral)';

  // shared card wrapper
  const card = (children) => (
    <div style={{
      background: 'var(--surface)', border: 'var(--hairline) solid var(--border)',
      borderRadius: 'var(--r)', boxShadow: 'var(--shadow-card)', padding: 22,
    }}>{children}</div>
  );

  if (composition === 'editorial') {
    return (
      <div className="dotgrid" style={{ minHeight: '100%', padding: '92px 26px 40px',
                                        display: 'flex', flexDirection: 'column' }}>
        <Wordmark size={22} />
        <div className="t-display" style={{ fontSize: 46, marginTop: 'auto', marginBottom: 4 }}>
          Say <em>hello</em><br />to the room.
        </div>
        <div className="t-body" style={{ fontSize: 15, maxWidth: 300, marginBottom: 26 }}>
          A digital “Hello, my name is” badge. See who’s nearby, share your name —
          and stay in control of when you’re seen.
        </div>
        <AuthForm onSignIn={onSignIn} onRegister={onRegister} />
      </div>
    );
  }

  if (composition === 'badge') {
    const demo = {
      name: 'Nametag', pronouns: 'say hi! 👋', tagline: 'See who’s nearby',
      stickers: ['👋', '🌟', '🎉'], distance: null,
    };
    return (
      <div className="dotgrid" style={{ minHeight: '100%', padding: '78px 26px 40px',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ transform: 'rotate(-3deg)', marginBottom: 30 }}>
          <PersonCard person={demo} accent={accent} variant="sticker" tilt={0} />
        </div>
        <div style={{ width: '100%' }}>{card(<AuthForm onSignIn={onSignIn} onRegister={onRegister} />)}</div>
      </div>
    );
  }

  // default: centered card
  return (
    <div style={{ minHeight: '100%', padding: '96px 26px 40px',
                  display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: 22 }}>
        <Wordmark size={44} />
        <div className="t-body" style={{ fontSize: 14, marginTop: 8 }}>
          See who’s nearby. Say hello.
        </div>
      </div>
      {card(<AuthForm onSignIn={onSignIn} onRegister={onRegister} />)}
      <div style={{ textAlign: 'center', marginTop: 18 }}>
        <span className="t-label">Inspected by Cleo 🐱</span>
      </div>
    </div>
  );
}

Object.assign(window, { Wordmark, AuthScreen });
