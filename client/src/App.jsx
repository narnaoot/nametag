import { useState, useMemo } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import AuthPage from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';
import ProfilePage from './pages/ProfilePage';
import GridPage from './pages/GridPage';
import TabBar from './components/TabBar';
import { bestOn } from './colors';
import { COLOR_PRIMARY } from './constants';
import './index.css';

function AppShell() {
  const { isLoggedIn } = useAuth();
  const [tab, setTab] = useState('grid');
  const [onboarding, setOnboarding] = useState(false);

  // --on-primary is computed from the brand color's luminance (see colors.js).
  // Teal leads all chrome; contrast picks white vs. ink ink automatically.
  const onPrimary = useMemo(() => bestOn(COLOR_PRIMARY), []);

  let content;
  if (!isLoggedIn) {
    content = <AuthPage onRegistered={() => setOnboarding(true)} />;
  } else if (onboarding) {
    content = <OnboardingPage onDone={() => { setOnboarding(false); setTab('grid'); }} />;
  } else {
    content = (
      <>
        {tab === 'grid'
          ? <GridPage onEditTag={() => setTab('profile')} />
          : <ProfilePage />}
        <TabBar tab={tab} onTab={setTab} />
      </>
    );
  }

  return (
    <div className="theme-cream na-app"
         style={{ '--primary': 'var(--teal)', '--on-primary': onPrimary }}>
      {content}
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
