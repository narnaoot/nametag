import { useState } from 'react';
import { AuthProvider } from './auth/AuthContext';
import { useAuth } from './auth/useAuth';
import { useViewport } from './hooks/useViewport';
import AuthPage from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';
import ProfilePage from './pages/ProfilePage';
import GridPage from './pages/GridPage';
import PrivacyPage from './pages/PrivacyPage';
import TabBar from './components/TabBar';
import NavRail from './components/NavRail';

function AppShell() {
  const { isLoggedIn } = useAuth();
  const { kind } = useViewport();
  const [tab, setTab] = useState('grid');   // 'grid' | 'profile' | 'privacy'
  const [onboarding, setOnboarding] = useState(false);

  if (!isLoggedIn) return <div className="na-app"><AuthPage onRegistered={() => setOnboarding(true)} /></div>;
  if (onboarding) {
    return <div className="na-app"><OnboardingPage onDone={() => { setOnboarding(false); setTab('grid'); }} /></div>;
  }

  let page;
  if (tab === 'grid') page = <GridPage layout={kind} onEditTag={() => setTab('profile')} />;
  else if (tab === 'profile') page = <ProfilePage onDone={() => setTab('grid')} />;
  else page = <PrivacyPage onChangeVisibility={() => setTab('grid')} />;

  // Desktop: a persistent left nav rail, no bottom tab bar.
  if (kind === 'desktop') {
    return (
      <div className="na-app" style={{ display: 'flex', alignItems: 'flex-start', minHeight: '100vh' }}>
        <NavRail tab={tab} onTab={setTab} />
        <main style={{ flex: 1, minWidth: 0 }}>{page}</main>
      </div>
    );
  }

  // Phone + tablet: the page with a bottom tab bar.
  return (
    <div className="na-app">
      {page}
      <TabBar tab={tab} onTab={setTab} />
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
