import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import GridPage from './pages/GridPage';
import { NavBar } from './designs/DesignE';
import { getMyProfile } from './api';
import './index.css';

function AppShell() {
  const { isLoggedIn, signOut } = useAuth();
  const [tab, setTab] = useState('grid');

  // Send first-time users straight to the profile tab so they can set up
  // their name and pronouns before seeing the (empty) grid.
  useEffect(() => {
    if (!isLoggedIn) return;
    getMyProfile().then(profile => {
      if (!profile) setTab('profile');
    }).catch(err => console.error('[App] profile check:', err));
  }, [isLoggedIn]);

  if (!isLoggedIn) return <AuthPage />;

  return (
    <div className="min-h-screen bg-page">
      {/* Top nav */}
      <header className="bg-white sticky top-0 z-10 border-b-2 border-line">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-caveat font-bold text-brand" style={{ fontSize: 24 }}>
            🏷️ Nametag
          </span>
          <button
            onClick={signOut}
            className="font-caveat text-sm font-semibold text-dim"
            style={{ fontSize: 15 }}
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

      {/* Bottom tab bar */}
      <NavBar tab={tab} onTabChange={setTab} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
