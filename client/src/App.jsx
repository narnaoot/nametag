import { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import GridPage from './pages/GridPage';
import DesignPreview from './designs/DesignPreview';
import { NavBar } from './designs/DesignE';
import './index.css';

function AppShell() {
  const { isLoggedIn, signOut } = useAuth();
  const [tab, setTab] = useState('grid');

  if (!isLoggedIn) return <AuthPage />;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f0' }}>
      {/* Top nav */}
      <header className="bg-white sticky top-0 z-10" style={{ borderBottom: '2px solid #f0f0ec' }}>
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <span
            className="font-bold"
            style={{ fontFamily: "'Caveat', cursive", fontSize: 24, color: '#E63946' }}
          >
            🏷️ Nametag
          </span>
          <button
            onClick={signOut}
            className="text-sm font-semibold"
            style={{ color: '#aaa', fontFamily: "'Caveat', cursive", fontSize: 15 }}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Page content */}
      <main className="pb-20">
        {tab === 'grid' && <GridPage />}
        {tab === 'profile' && <ProfilePage onSaved={() => setTab('grid')} />}
      </main>

      {/* Design E bottom tab bar */}
      <NavBar tab={tab} onTabChange={setTab} />
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
