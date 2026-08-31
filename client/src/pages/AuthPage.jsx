import { useState, useEffect } from 'react';
import { login, register, forgotPassword, resetPassword, verifyEmail, resendVerification } from '../lib/api';
import { useAuth } from '../auth/useAuth';
import { Eyebrow, Pill } from '../components/TagBits';

// Sign in — "Put a name to the room." Orchid takes the accent word and the
// primary button, so the app's own colour is set before you have a tag.
//
// The design showed "Continue with Apple", but Sign in with Apple needs an Apple
// Developer account + Services ID + verified domain + a signed client secret —
// too much for a web prototype — so the working path is email/password. Add the
// Apple button back here when there's a native app + developer account.

function MiniTag({ w, rot, tint, hue, dk, top, left, right, bottom, name, pron, nameSize = 26, photo, lift }) {
  return (
    <div style={{ position: 'absolute', top, left, right, bottom, width: w, transform: `rotate(${rot}deg)`,
          background: tint, border: '1.5px solid var(--border)', borderRadius: 'var(--r-tag)',
          boxShadow: lift ? 'var(--shadow-raise)' : 'var(--shadow-card)', padding: '16px 12px 14px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: photo ? 7 : 6 }}>
      {photo && (
        <div style={{ width: 62, height: 62, borderRadius: '50%', overflow: 'hidden',
              border: '2.5px solid var(--surface)', boxShadow: `0 0 0 1.5px ${hue}, var(--shadow-card)` }}>
          <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      <Eyebrow />
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: nameSize,
            letterSpacing: '-.7px', color: 'var(--text)', lineHeight: 1 }}>{name}</div>
      <Pill hue={hue} deep={dk} style={{ padding: '4px 11px', fontSize: 11 }}>{pron}</Pill>
    </div>
  );
}

function PwField({ value, onChange, placeholder, minLength }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input className="na-field" style={{ paddingRight: 56 }} type={show ? 'text' : 'password'}
        value={value} placeholder={placeholder} required minLength={minLength}
        onChange={e => onChange(e.target.value)} />
      <button type="button" onClick={() => setShow(s => !s)} tabIndex={-1} className="na-textbtn" style={{ position: 'absolute',
            right: 14, top: '50%', transform: 'translateY(-50%)',
            fontWeight: 800, fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase',
            letterSpacing: '.08em' }}>{show ? 'Hide' : 'Show'}</button>
    </div>
  );
}

export default function AuthPage({ onRegistered }) {
  const { signIn } = useAuth();
  const [view, setView] = useState('landing');           // 'landing' | 'email'
  // login | register | forgot | reset | check-email | verifying | verify-failed
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resetTok = params.get('reset');
    if (resetTok) { setResetToken(resetTok); setMode('reset'); setView('email'); return; }

    // A verification link: confirm the email, then sign in and go to onboarding.
    const verifyTok = params.get('verify');
    if (verifyTok) {
      setView('email'); setMode('verifying');
      verifyEmail(verifyTok)
        .then(async (data) => {
          window.history.replaceState({}, '', window.location.pathname);
          if (onRegistered) onRegistered();  // fresh account → onboarding
          await signIn(data.token);
        })
        .catch((err) => { setError(err.message); setMode('verify-failed'); });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function switchMode(m) { setMode(m); setError(''); setSuccess(''); }

  async function handleLoginRegister(e) {
    e.preventDefault(); setError(''); setSuccess(''); setLoading(true);
    try {
      if (mode === 'register') {
        // Registration no longer logs you in — it sends a verification email.
        await register(email, password);
        setMode('check-email');
      } else {
        const data = await login(email, password);
        await signIn(data.token);
      }
    } catch (err) {
      // Unverified sign-in → route to the check-email panel (with resend).
      if (err.data?.needsVerification) { setMode('check-email'); }
      else { setError(err.message); }
    } finally { setLoading(false); }
  }

  async function handleResend() {
    setError(''); setSuccess(''); setLoading(true);
    try { await resendVerification(email); setSuccess('Sent again — check your inbox.'); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  async function handleForgot(e) {
    e.preventDefault(); setError(''); setLoading(true);
    try { await forgotPassword(email); setSuccess('If that email is registered, a reset link is on its way.'); }
    catch (err) { setError(err.message); } finally { setLoading(false); }
  }
  async function handleReset(e) {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await resetPassword(resetToken, password);
      setSuccess('Password updated — you can sign in now.');
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(() => switchMode('login'), 1500);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }

  const errLine = error && <p style={{ color: 'var(--coral-dk)', fontWeight: 700, fontSize: 13.5, margin: 0 }}>{error}</p>;
  const okLine = success && <p style={{ color: 'var(--sage-dk)', fontWeight: 700, fontSize: 13.5, margin: 0 }}>{success}</p>;

  // ── Landing ──────────────────────────────────────────────
  if (view === 'landing') {
    return (
      <div className="na-screen no-sb" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column',
            justifyContent: 'space-between', padding: '64px 30px max(40px, env(safe-area-inset-bottom, 40px))' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="t-label" style={{ fontSize: 10 }}>Nametag</div>
          <div className="t-display" style={{ fontSize: 46, letterSpacing: '-1.4px', lineHeight: 1.02 }}>
            Put a name to the <em>room</em>.
          </div>
          <div className="t-body" style={{ fontSize: 15, maxWidth: 290 }}>
            Wear a tag for the people around you. No feed, no follows, no messages. Just who’s here, so you can go and say hello.
          </div>
        </div>

        <div style={{ position: 'relative', height: 288 }}>
          <MiniTag w={150} rot={-6} tint="var(--lav-lt)" hue="var(--lavender)" dk="var(--lav-dk)"
                   top={20} left={6} name="Nabil" pron="he/him" nameSize={24} photo="/face-nabil.webp" />
          <MiniTag w={150} rot={5} tint="var(--must-lt)" hue="var(--mustard)" dk="var(--must-dk)"
                   top={0} right={4} name="Jonas" pron="they/them" nameSize={24} photo="/face-jonas.webp" />
          <MiniTag w={172} rot={-2} tint="var(--coral-lt)" hue="var(--coral)" dk="var(--coral-dk)"
                   bottom={0} left={80} name="Maya" pron="she/her" nameSize={28} photo="/face-maya.webp" lift />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button className="na-btn" onClick={() => setView('email')}>Continue with email</button>
          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, marginTop: 4 }}>
            Nametag only shows you to people in the same place, and only while you’re visible.
          </div>
        </div>
      </div>
    );
  }

  // ── Email flow ───────────────────────────────────────────
  let form;
  if (mode === 'forgot') {
    form = (
      <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="t-h3">Forgot your password?</div>
        <div className="t-body" style={{ fontSize: 13.5, marginTop: -6 }}>Enter your email and we’ll send a reset link.</div>
        <input className="na-field" type="email" placeholder="you@email.com" required value={email}
               onChange={e => setEmail(e.target.value)} />
        {errLine}{okLine}
        {!success && <button className="na-btn" type="submit" disabled={loading}>{loading ? 'Sending…' : 'Send reset link'}</button>}
        <button type="button" onClick={() => switchMode('login')} className="na-textbtn" style={{ color: 'var(--muted)', fontWeight: 700, fontSize: 13 }}>Back to sign in</button>
      </form>
    );
  } else if (mode === 'reset') {
    form = (
      <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="t-h3">Choose a new password</div>
        <div className="t-body" style={{ fontSize: 13.5, marginTop: -6 }}>Must be at least 8 characters.</div>
        <PwField value={password} onChange={setPassword} placeholder="New password" minLength={8} />
        {errLine}{okLine}
        {!success && <button className="na-btn" type="submit" disabled={loading}>{loading ? 'Saving…' : 'Set new password'}</button>}
      </form>
    );
  } else if (mode === 'check-email') {
    form = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="t-h3">Check your email</div>
        <div className="t-body" style={{ fontSize: 13.5, marginTop: -6 }}>
          We sent a verification link to <strong style={{ color: 'var(--text)' }}>{email || 'your email'}</strong>.
          Open it to finish setting up your account — then you’ll be signed in.
        </div>
        {errLine}{okLine}
        <button className="na-btn" type="button" onClick={handleResend} disabled={loading}>
          {loading ? 'Sending…' : 'Resend email'}
        </button>
        <button type="button" onClick={() => switchMode('login')} className="na-textbtn" style={{ color: 'var(--muted)', fontWeight: 700, fontSize: 13 }}>Back to sign in</button>
      </div>
    );
  } else if (mode === 'verifying') {
    form = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'center', padding: '8px 0' }}>
        <div className="t-h3">Verifying…</div>
        <div className="t-body" style={{ fontSize: 13.5 }}>Confirming your email and signing you in.</div>
      </div>
    );
  } else if (mode === 'verify-failed') {
    form = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="t-h3">This link didn’t work</div>
        <div className="t-body" style={{ fontSize: 13.5, marginTop: -6 }}>
          That verification link is invalid or has expired. Create your account again to get a fresh link.
        </div>
        <button className="na-btn" type="button" onClick={() => switchMode('register')}>Back to create account</button>
        <button type="button" onClick={() => switchMode('login')} className="na-textbtn" style={{ color: 'var(--muted)', fontWeight: 700, fontSize: 13 }}>Sign in instead</button>
      </div>
    );
  } else {
    form = (
      <form onSubmit={handleLoginRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', gap: 4, padding: 3, borderRadius: 'var(--r-pill)',
              background: 'var(--warm2)', border: '1.5px solid var(--border)' }}>
          {[['login', 'Sign in'], ['register', 'Create account']].map(([m, label]) => (
            <button key={m} type="button" onClick={() => switchMode(m)} style={{ flex: 1, padding: '10px 8px',
                  borderRadius: 'var(--r-pill)', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 13,
                  background: mode === m ? 'var(--surface)' : 'transparent',
                  color: mode === m ? 'var(--orchid-dk)' : 'var(--muted)',
                  boxShadow: mode === m ? '0 2px 8px rgba(61,43,31,0.1)' : 'none' }}>{label}</button>
          ))}
        </div>
        <input className="na-field" type="email" placeholder="you@email.com" required value={email}
               onChange={e => setEmail(e.target.value)} />
        <PwField value={password} onChange={setPassword} minLength={mode === 'register' ? 8 : undefined}
                 placeholder={mode === 'register' ? 'Password (8+ characters)' : 'Password'} />
        {errLine}
        <button className="na-btn" type="submit" disabled={loading}>
          {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>
        {mode === 'login' && (
          <button type="button" onClick={() => switchMode('forgot')} className="na-textbtn" style={{ color: 'var(--muted)', fontWeight: 700, fontSize: 13, marginTop: -2 }}>Forgot password?</button>
        )}
      </form>
    );
  }

  return (
    <div className="na-screen no-sb" style={{ minHeight: '100vh', padding: '52px 30px 40px' }}>
      <button onClick={() => setView('landing')} className="na-textbtn" style={{
            color: 'var(--muted)', fontWeight: 800, fontSize: 14, padding: 0, marginBottom: 24 }}>← Back</button>
      <div className="t-display" style={{ fontSize: 34, letterSpacing: '-1px', marginBottom: 22 }}>
        {mode === 'register' ? <>Make your <em>tag</em></>
          : mode === 'check-email' ? <>Check your <em>inbox</em></>
            : mode === 'verifying' ? <>One <em>moment</em></>
              : mode === 'verify-failed' ? <>Link <em>expired</em></>
                : <>Welcome <em>back</em></>}
      </div>
      <div className="na-card" style={{ boxShadow: 'var(--shadow-card)', padding: 22 }}>{form}</div>
    </div>
  );
}
