import { useState } from 'react';
import { login, register } from '../api';
import { useAuth } from '../AuthContext';

export default function AuthPage() {
  const { signIn } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
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

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#f5f5f0' }}>
      <div className="w-full max-w-sm">
        {/* Big sticker logo */}
        <div className="flex justify-center mb-8">
          <div
            className="bg-white rounded-sm overflow-hidden"
            style={{
              width: 200,
              boxShadow: '3px 4px 16px rgba(0,0,0,0.15)',
              transform: 'rotate(-2deg)',
            }}
          >
            <div className="px-4 pt-3 pb-1.5" style={{ backgroundColor: '#E63946' }}>
              <p className="text-white font-bold uppercase" style={{ fontSize: 9, letterSpacing: '0.2em' }}>HELLO</p>
              <p className="text-white font-semibold uppercase" style={{ fontSize: 8, opacity: 0.9, letterSpacing: '0.12em' }}>my name is</p>
            </div>
            <div className="px-4 py-3 text-center">
              <p style={{ fontFamily: "'Caveat', cursive", fontSize: 36, fontWeight: 700, color: '#1a1a1a', lineHeight: 1 }}>
                Nametag
              </p>
            </div>
            <div className="px-4 py-1.5" style={{ backgroundColor: '#E6394618', borderTop: '2px solid #E6394622' }}>
              <p style={{ fontFamily: "'Caveat', cursive", fontSize: 14, color: '#E63946' }}>say hi! 👋</p>
            </div>
          </div>
        </div>

        {/* Auth card */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <div className="flex bg-gray-100 rounded-lg p-1 mb-5">
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${mode === m ? 'bg-white shadow' : 'text-gray-400'}`}
                style={mode === m ? { color: '#E63946' } : {}}
              >
                {m === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-200 text-gray-800 text-sm focus:outline-none"
              style={{ '--tw-ring-color': '#E63946' }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-200 text-gray-800 text-sm focus:outline-none"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#E63946' }}
            >
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
