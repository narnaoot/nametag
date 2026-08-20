import { useState } from 'react';
import { AuthProvider } from './AuthContext';
import { useAuth } from './useAuth';
import AuthPage from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';
import ProfilePage from './pages/ProfilePage';
import GridPage from './pages/GridPage';
import PrivacyPage from './pages/PrivacyPage';
import TabBar from './components/TabBar';
import './index.css';

function AppShell() {
  const { isLoggedIn } = useAuth();
  const [tab, setTab] = useState('grid');   // 'grid' | 'profile' | 'privacy'
  const [onboarding, setOnboarding] = useState(false);

  let content;
  if (!isLoggedIn) {
    content = <AuthPage onRegistered={() => setOnboarding(true)} />;
  } else if (onboarding) {
    content = <OnboardingPage onDone={() => { setOnboarding(false); setTab('grid'); }} />;
  } else {
    let page;
    if (tab === 'grid') page = <GridPage onEditTag={() => setTab('profile')} />;
    else if (tab === 'profile') page = <ProfilePage onDone={() => setTab('grid')} />;
    else page = <PrivacyPage onChangeVisibility={() => setTab('grid')} />;
    content = (
      <>
        {page}
        <TabBar tab={tab} onTab={setTab} />
      </>
    );
  }

  return <div className="na-app">{content}</div>;
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
