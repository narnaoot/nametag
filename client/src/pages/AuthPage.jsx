import { useState, useEffect } from 'react';
import { login, register, forgotPassword, resetPassword } from '../api';
import { useAuth } from '../AuthContext';
import { PersonCard } from '../components/Badge';

// Hero promo badge shown above the form (the chosen "badge" composition).
const DEMO = {
  name: 'Nametag', pronouns: 'say hi! 👋', tagline: 'See who’s nearby',
  stickers: ['👋', '🌟', '🎉'], distance: null,
};

// Password field with a show/hide toggle.
function PwField({ value, onChange, placeholder, minLength }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        className="na-field" style={{ paddingRight: 56 }}
        type={show ? 'text' : 'password'} value={value} placeholder={placeholder}
        required minLength={minLength}
        onChange={e => onChange(e.target.value)}
      />
      <button
        type="button" onClick={() => setShow(s => !s)} tabIndex={-1}
        style={{
          position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer',
          fontWeight: 800, fontSize: 12.5, color: 'var(--muted)',
          textTransform: 'uppercase', letterSpacing: '.08em',
        }}
      >{show ? 'Hide' : 'Show'}</button>
    </div>
  );
}

export default function AuthPage() {
  const { signIn } = useAuth();

  // mode: 'login' | 'register' | 'forgot' | 'reset'
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // If the URL has ?reset=<token>, jump straight to the reset form.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('reset');
    if (t) {
      setResetToken(t);
      setMode('reset');
    }
  }, []);

  function switchMode(m) {
    setMode(m);
    setError('');
    setSuccess('');
  }

  async function handleLoginRegister(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fn = mode === 'login' ? login : register;
      const data = await fn(email, password);
      // NOTE: per the redesign, "Create account" should route to first-run
      // onboarding before Nearby. Wire that in once OnboardingScreen lands;
      // for now registration signs in directly (unchanged behavior).
      signIn(data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email);
      setSuccess('If that email is registered, a reset link is on its way.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await resetPassword(resetToken, password);
      setSuccess('Password updated! You can now sign in.');
      // Clear the token from the URL without a page reload.
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(() => switchMode('login'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const message = error
    ? <p style={{ color: 'var(--danger)', fontSize: 13.5, fontWeight: 700, margin: 0 }}>{error}</p>
    : success
      ? <p style={{ color: 'var(--sage)', fontSize: 13.5, fontWeight: 700, margin: 0 }}>{success}</p>
      : null;

  function renderForm() {
    // ── Forgot password ──
    if (mode === 'forgot') {
      return (
        <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <button
            type="button" onClick={() => switchMode('login')}
            style={{
              alignSelf: 'flex-start', background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--muted)', fontWeight: 700, fontSize: 13.5, padding: 0,
            }}
          >← Back to sign in</button>
          <div className="t-h3" style={{ fontSize: 19 }}>Forgot your password?</div>
          <div className="t-body" style={{ fontSize: 13.5, marginTop: -6 }}>
            Enter your email and we’ll send a reset link your way.
          </div>
          <input
            className="na-field" type="email" placeholder="you@email.com"
            value={email} onChange={e => setEmail(e.target.value)} required
          />
          {message}
          {!success && (
            <button className="na-btn" type="submit" disabled={loading}>
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          )}
        </form>
      );
    }

    // ── Reset password (from ?reset=<token>) ──
    if (mode === 'reset') {
      return (
        <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="t-h3" style={{ fontSize: 19 }}>Choose a new password</div>
          <div className="t-body" style={{ fontSize: 13.5, marginTop: -6 }}>
            Must be at least 8 characters.
          </div>
          <PwField value={password} onChange={setPassword} placeholder="New password" minLength={8} />
          {message}
          {!success && (
            <button className="na-btn" type="submit" disabled={loading}>
              {loading ? 'Saving…' : 'Set new password'}
            </button>
          )}
        </form>
      );
    }

    // ── Login / Register ──
    return (
      <form onSubmit={handleLoginRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* segmented tabs */}
        <div style={{
          display: 'flex', gap: 4, padding: 4, borderRadius: 'var(--r-pill)',
          background: 'var(--warm2)', border: 'var(--hairline) solid var(--border)',
        }}>
          {[['login', 'Sign in'], ['register', 'Create account']].map(([m, label]) => (
            <button
              key={m} type="button" onClick={() => switchMode(m)}
              style={{
                flex: 1, padding: '9px 8px', borderRadius: 'var(--r-pill)', border: 'none',
                cursor: 'pointer', fontWeight: 800, fontSize: 13.5,
                background: mode === m ? 'var(--surface)' : 'transparent',
                color: mode === m ? 'var(--primary)' : 'var(--muted)',
                boxShadow: mode === m ? '0 2px 8px rgba(61,43,31,0.10)' : 'none',
                transition: 'all .15s ease',
              }}
            >{label}</button>
          ))}
        </div>
        <input
          className="na-field" type="email" placeholder="you@email.com"
          value={email} onChange={e => setEmail(e.target.value)} required
        />
        <PwField
          value={password} onChange={setPassword}
          placeholder={mode === 'register' ? 'Password (8+ characters)' : 'Password'}
          minLength={mode === 'register' ? 8 : undefined}
        />
        {message}
        <button className="na-btn" type="submit" disabled={loading}>
          {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>
        {mode === 'login' && (
          <button
            type="button" onClick={() => switchMode('forgot')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)',
              fontWeight: 700, fontSize: 13, marginTop: -2,
            }}
          >Forgot password?</button>
        )}
      </form>
    );
  }

  return (
    <div
      className="na-app dotgrid"
      style={{
        minHeight: '100vh', padding: '78px 26px 40px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}
    >
      <div style={{ transform: 'rotate(-3deg)', marginBottom: 30 }}>
        <PersonCard person={DEMO} accent="var(--primary)" variant="sticker" tilt={0} />
      </div>
      <div style={{
        width: '100%', maxWidth: 380,
        background: 'var(--surface)', border: 'var(--hairline) solid var(--border)',
        borderRadius: 'var(--r)', boxShadow: 'var(--shadow-card)', padding: 22,
      }}>
        {renderForm()}
      </div>
    </div>
  );
}
