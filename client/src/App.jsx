import { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import GridPage from './pages/GridPage';
import PrivacyPage from './pages/PrivacyPage';
import { NavBar } from './designs/DesignE';
import './index.css';

function AppShell() {
  const { isLoggedIn, signOut } = useAuth();
  const [tab, setTab] = useState('profile');
  const [showPrivacy, setShowPrivacy] = useState(false);

  if (showPrivacy) return <PrivacyPage onBack={() => setShowPrivacy(false)} />;
  if (!isLoggedIn) return <AuthPage onShowPrivacy={() => setShowPrivacy(true)} />;

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
        {tab === 'profile' && (
          <ProfilePage
            onSaved={() => setTab('grid')}
            onShowPrivacy={() => setShowPrivacy(true)}
          />
        )}
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
