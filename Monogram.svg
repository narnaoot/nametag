// app.jsx — assembles the prototype: tweaks + state + iOS frame.

const { useState: useState0, useEffect: useEffect0 } = React;

const HEX_TO_KEY = Object.fromEntries(
  Object.entries(window.NAMETAG_ACCENTS).map(([k, v]) => [v.toUpperCase(), k])
);
const RAINBOW = window.NAMETAG_ACCENT_ORDER.map(k => window.NAMETAG_ACCENTS[k]);

// relative luminance + best contrasting text color for a filled swatch
function lum(hex) {
  const c = hex.replace('#', '');
  const ch = i => {
    const x = parseInt(c.slice(i, i + 2), 16) / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * ch(0) + 0.7152 * ch(2) + 0.0722 * ch(4);
}
function bestOn(hex) {
  const L = lum(hex);
  const onWhite = 1.05 / (L + 0.05);
  const onDark = (L + 0.05) / (lum('#23170E') + 0.05);
  return onWhite >= onDark ? '#FFFFFF' : '#23170E';
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "screen": "Nearby",
  "theme": "Cream",
  "primary": "#06D6B8",
  "badge": "Sticker",
  "layout": "Grid",
  "auth": "Badge",
  "accent": ["#FF4733", "#06D6B8", "#FFB300", "#FF3D9A", "#A86BFF"],
  "tilt": 2
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [you, setYou] = useState0({
    ...window.NAMETAG_DATA.you, radius: 100, alwaysVisible: true,
  });
  const [visible, setVisible] = useState0(true);
  const [waves, setWaves] = useState0({});
  const sendWave = (id) => setWaves(w => ({ ...w, [id]: 'sent' }));
  const [scale, setScale] = useState0(1);

  useEffect0(() => {
    const fit = () => setScale(Math.min(1, (window.innerHeight - 40) / 874,
                                           (window.innerWidth - 40) / 402));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  const people = window.NAMETAG_DATA.people;
  const themeClass = t.theme === 'Ink' ? 'theme-ink' : 'theme-cream';
  const dark = t.theme === 'Ink';
  const variant = t.badge === 'Editorial' ? 'editorial' : 'sticker';
  const layout = (t.layout || 'Grid').toLowerCase();
  const authComp = { Card: 'card', Editorial: 'editorial', Badge: 'badge' }[t.auth] || 'card';
  const accentMode = Array.isArray(t.accent)
    ? 'rainbow'
    : (HEX_TO_KEY[String(t.accent).toUpperCase()] || 'coral');
  const primaryKey = HEX_TO_KEY[String(t.primary || '').toUpperCase()];
  const primaryHex = t.primary || '#06D6B8';
  // theme-aware: keyed colors ride the CSS var (ink overrides apply);
  // contrast is computed from the actual hex in play.
  const primaryVal = primaryKey ? `var(--${primaryKey})` : primaryHex;
  const contrastHex = (dark && primaryKey)
    ? window.NAMETAG_ACCENTS_INK[primaryKey] : primaryHex;
  const onPrimary = bestOn(contrastHex);

  const screen = t.screen || 'Nearby';
  const isAuth = screen === 'Sign in';
  const isOnboarding = screen === 'Welcome';
  const tab = screen === 'My tag' ? 'profile' : 'grid';

  const goTo = (s) => setTweak('screen', s);

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: dark ? '#1A120C' : '#E7E2D8', padding: 20, boxSizing: 'border-box',
      transition: 'background .3s ease',
    }}>
      <div style={{ width: 402 * scale, height: 874 * scale, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0,
                      transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <IOSDevice dark={dark}>
          <div className={themeClass} style={{ width: '100%', height: '100%',
                 '--primary': primaryVal, '--on-primary': onPrimary }}>
          <div className="na-app">
            {isAuth ? (
              <AuthScreen composition={authComp} accent={primaryVal}
                          onSignIn={() => goTo('Nearby')}
                          onRegister={() => goTo('Welcome')} />
            ) : isOnboarding ? (
              <OnboardingScreen you={you} setYou={setYou} onDone={() => goTo('Nearby')} />
            ) : (
              <React.Fragment>
                {tab === 'grid'
                  ? <Nearby you={you} people={t.empty ? [] : people} accentMode={accentMode}
                            variant={variant} tilt={t.tilt} layout={layout}
                            visible={visible} onToggleVisible={() => setVisible(v => !v)}
                            waves={waves} onWave={sendWave}
                            onEditTag={() => goTo('My tag')} />
                  : <MyTag you={you} setYou={setYou} accentMode={accentMode}
                           variant={variant} tilt={t.tilt} />}
                <TabBar tab={tab} onTab={(id) => goTo(id === 'profile' ? 'My tag' : 'Nearby')} />
              </React.Fragment>
            )}
            </div>
          </div>
        </IOSDevice>
        </div>
      </div>

      <TweaksPanel>
        <TweakSection label="Flow" />
        <TweakSelect label="Screen" value={screen}
          options={['Sign in', 'Welcome', 'Nearby', 'My tag']}
          onChange={v => setTweak('screen', v)} />
        <TweakRadio label="Theme" value={t.theme} options={['Cream', 'Ink']}
          onChange={v => setTweak('theme', v)} />
        <TweakColor label="Brand color" value={t.primary}
          options={['#06D6B8', '#FFB300', '#FF3D9A', '#A86BFF', '#FF4733']}
          onChange={v => setTweak('primary', v)} />

        <TweakSection label="The badge" />
        <TweakRadio label="Card style" value={t.badge} options={['Sticker', 'Editorial']}
          onChange={v => setTweak('badge', v)} />
        <TweakColor label="Badge colors" value={t.accent}
          options={[RAINBOW, '#FF4733', '#06D6B8', '#FFB300', '#FF3D9A', '#A86BFF']}
          onChange={v => setTweak('accent', v)} />
        <TweakSlider label="Sticker tilt" value={t.tilt} min={0} max={6} step={0.5} unit="°"
          onChange={v => setTweak('tilt', v)} />

        <TweakSection label="Nearby" />
        <TweakRadio label="Layout" value={t.layout} options={['Grid', 'Stacked', 'Radar']}
          onChange={v => setTweak('layout', v)} />
        <TweakToggle label="Empty state" value={!!t.empty}
          onChange={v => setTweak('empty', v)} />

        <TweakSection label="Sign in" />
        <TweakRadio label="Composition" value={t.auth} options={['Card', 'Editorial', 'Badge']}
          onChange={v => setTweak('auth', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
