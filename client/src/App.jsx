import { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import GridPage from './pages/GridPage';
import DesignPreview from './designs/DesignPreview';
import './index.css';

function AppShell() {
  const { isLoggedIn, signOut } = useAuth();
  const [tab, setTab] = useState('grid');

  if (!isLoggedIn) return <AuthPage />;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top nav */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-slate-800 text-lg">🏷️ Nametag</span>
          <button onClick={signOut} className="text-sm text-slate-400 hover:text-slate-600">
            Sign out
          </button>
        </div>
      </header>

      {/* Page content */}
      <main className="pb-20">
        {tab === 'grid' && <GridPage />}
        {tab === 'profile' && <ProfilePage onSaved={() => setTab('grid')} />}
      </main>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200">
        <div className="max-w-2xl mx-auto flex">
          <button
            className={`flex-1 py-3 text-sm font-medium flex flex-col items-center gap-0.5 transition-colors ${
              tab === 'grid' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
            }`}
            onClick={() => setTab('grid')}
          >
            <span className="text-xl">👥</span>
            <span>Nearby</span>
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium flex flex-col items-center gap-0.5 transition-colors ${
              tab === 'profile' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
            }`}
            onClick={() => setTab('profile')}
          >
            <span className="text-xl">🏷️</span>
            <span>My profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default function App() {
  if (window.location.hash === '#designs') {
    return <DesignPreview />;
  }
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
