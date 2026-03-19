import { useState, useEffect } from 'react';
import { login, register, forgotPassword, resetPassword } from '../api';
import { useAuth } from '../AuthContext';

// Nametag logo sticker — shared across all auth screens
function Logo() {
  return (
    <div className="flex justify-center mb-8">
      <div
        className="bg-white rounded-sm overflow-hidden"
        style={{ width: 200, boxShadow: '3px 4px 16px rgba(0,0,0,0.15)', transform: 'rotate(-2deg)' }}
      >
        <div className="bg-brand px-4 pt-3 pb-1.5">
          <p className="text-white font-bold uppercase" style={{ fontSize: 9, letterSpacing: '0.2em' }}>HELLO</p>
          <p className="text-white font-semibold uppercase" style={{ fontSize: 8, opacity: 0.9, letterSpacing: '0.12em' }}>my name is</p>
        </div>
        <div className="px-4 py-3 text-center">
          <p className="font-caveat font-bold text-ink" style={{ fontSize: 36, lineHeight: 1 }}>
            Nametag
          </p>
        </div>
        <div className="font-caveat px-4 py-1.5 text-brand" style={{ backgroundColor: '#E6394618', borderTop: '2px solid #E6394622', fontSize: 14 }}>
          say hi! 👋
        </div>
      </div>
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

  // If the URL has ?reset=<token>, jump straight to the reset form
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
      // Clear the token from the URL without a page reload
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(() => switchMode('login'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputClass = 'w-full px-4 py-3 rounded-lg border border-gray-200 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-300';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-page">
      <div className="w-full max-w-sm">
        <Logo />

        {/* ── Forgot password ── */}
        {mode === 'forgot' && (
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <button
              onClick={() => switchMode('login')}
              className="text-sm mb-4 flex items-center gap-1 text-dim"
            >
              ← Back to sign in
            </button>
            <h2 className="font-semibold text-slate-800 mb-1">Forgot your password?</h2>
            <p className="text-sm text-slate-500 mb-4">Enter your email and we'll send a reset link.</p>
            <form onSubmit={handleForgot} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className={inputClass}
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {success && <p className="text-green-600 text-sm">{success}</p>}
              {!success && (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 text-white rounded-lg font-semibold text-sm disabled:opacity-50 bg-brand"
                >
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              )}
            </form>
          </div>
        )}

        {/* ── Reset password ── */}
        {mode === 'reset' && (
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <h2 className="font-semibold text-slate-800 mb-1">Choose a new password</h2>
            <p className="text-sm text-slate-500 mb-4">Must be at least 8 characters.</p>
            <form onSubmit={handleReset} className="space-y-4">
              <input
                type="password"
                placeholder="New password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                className={inputClass}
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {success && <p className="text-green-600 text-sm">{success}</p>}
              {!success && (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 text-white rounded-lg font-semibold text-sm disabled:opacity-50 bg-brand"
                >
                  {loading ? 'Saving…' : 'Set new password'}
                </button>
              )}
            </form>
          </div>
        )}

        {/* ── Login / Register ── */}
        {(mode === 'login' || mode === 'register') && (
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <div className="flex bg-gray-100 rounded-lg p-1 mb-5">
              {['login', 'register'].map(m => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${mode === m ? 'bg-white shadow text-brand' : 'text-gray-400'}`}
                >
                  {m === 'login' ? 'Sign in' : 'Create account'}
                </button>
              ))}
            </div>

            <form onSubmit={handleLoginRegister} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className={inputClass}
              />
              <input
                type="password"
                placeholder={mode === 'register' ? 'Password (8+ characters)' : 'Password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={mode === 'register' ? 8 : undefined}
                className={inputClass}
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-white rounded-lg font-semibold text-sm disabled:opacity-50 bg-brand"
              >
                {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
              </button>
            </form>

            {mode === 'login' && (
              <button
                onClick={() => switchMode('forgot')}
                className="mt-3 text-sm w-full text-center text-dim"
              >
                Forgot password?
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
