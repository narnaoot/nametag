/* @ds-bundle: {"format":4,"namespace":"NabilArnaootDesignSystem_c79d42","components":[],"sourceHashes":{"design_handoff_nametag_redesign/design_files/app.jsx":"fc8360958de6","design_handoff_nametag_redesign/design_files/badge.jsx":"b4b19f714cae","design_handoff_nametag_redesign/design_files/data.js":"1bb775574499","design_handoff_nametag_redesign/design_files/detail-sheet.jsx":"27cc242e0211","design_handoff_nametag_redesign/design_files/ios-frame.jsx":"be3343be4b51","design_handoff_nametag_redesign/design_files/onboarding.jsx":"7f627785c1da","design_handoff_nametag_redesign/design_files/screens-app.jsx":"3635d4a5863d","design_handoff_nametag_redesign/design_files/screens-auth.jsx":"3604a1e73f9a","design_handoff_nametag_redesign/design_files/tweaks-panel.jsx":"6591467622ed","monogram/design-canvas.jsx":"d3ddcf4241b9","monogram/monograms.jsx":"b079156bbae5","nametag-redesign/app.jsx":"fc8360958de6","nametag-redesign/badge.jsx":"b4b19f714cae","nametag-redesign/data.js":"1bb775574499","nametag-redesign/detail-sheet.jsx":"27cc242e0211","nametag-redesign/ios-frame.jsx":"be3343be4b51","nametag-redesign/onboarding.jsx":"7f627785c1da","nametag-redesign/screens-app.jsx":"3635d4a5863d","nametag-redesign/screens-auth.jsx":"3604a1e73f9a","nametag-redesign/tweaks-panel.jsx":"6591467622ed"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.NabilArnaootDesignSystem_c79d42 = window.NabilArnaootDesignSystem_c79d42 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// design_handoff_nametag_redesign/design_files/app.jsx
try { (() => {
// app.jsx — assembles the prototype: tweaks + state + iOS frame.

const {
  useState: useState0,
  useEffect: useEffect0
} = React;
const HEX_TO_KEY = Object.fromEntries(Object.entries(window.NAMETAG_ACCENTS).map(([k, v]) => [v.toUpperCase(), k]));
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
} /*EDITMODE-END*/;
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [you, setYou] = useState0({
    ...window.NAMETAG_DATA.you,
    radius: 100,
    alwaysVisible: true
  });
  const [visible, setVisible] = useState0(true);
  const [waves, setWaves] = useState0({});
  const sendWave = id => setWaves(w => ({
    ...w,
    [id]: 'sent'
  }));
  const [scale, setScale] = useState0(1);
  useEffect0(() => {
    const fit = () => setScale(Math.min(1, (window.innerHeight - 40) / 874, (window.innerWidth - 40) / 402));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  const people = window.NAMETAG_DATA.people;
  const themeClass = t.theme === 'Ink' ? 'theme-ink' : 'theme-cream';
  const dark = t.theme === 'Ink';
  const variant = t.badge === 'Editorial' ? 'editorial' : 'sticker';
  const layout = (t.layout || 'Grid').toLowerCase();
  const authComp = {
    Card: 'card',
    Editorial: 'editorial',
    Badge: 'badge'
  }[t.auth] || 'card';
  const accentMode = Array.isArray(t.accent) ? 'rainbow' : HEX_TO_KEY[String(t.accent).toUpperCase()] || 'coral';
  const primaryKey = HEX_TO_KEY[String(t.primary || '').toUpperCase()];
  const primaryHex = t.primary || '#06D6B8';
  // theme-aware: keyed colors ride the CSS var (ink overrides apply);
  // contrast is computed from the actual hex in play.
  const primaryVal = primaryKey ? `var(--${primaryKey})` : primaryHex;
  const contrastHex = dark && primaryKey ? window.NAMETAG_ACCENTS_INK[primaryKey] : primaryHex;
  const onPrimary = bestOn(contrastHex);
  const screen = t.screen || 'Nearby';
  const isAuth = screen === 'Sign in';
  const isOnboarding = screen === 'Welcome';
  const tab = screen === 'My tag' ? 'profile' : 'grid';
  const goTo = s => setTweak('screen', s);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: dark ? '#1A120C' : '#E7E2D8',
      padding: 20,
      boxSizing: 'border-box',
      transition: 'background .3s ease'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 402 * scale,
      height: 874 * scale,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      transform: `scale(${scale})`,
      transformOrigin: 'top left'
    }
  }, /*#__PURE__*/React.createElement(IOSDevice, {
    dark: dark
  }, /*#__PURE__*/React.createElement("div", {
    className: themeClass,
    style: {
      width: '100%',
      height: '100%',
      '--primary': primaryVal,
      '--on-primary': onPrimary
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "na-app"
  }, isAuth ? /*#__PURE__*/React.createElement(AuthScreen, {
    composition: authComp,
    accent: primaryVal,
    onSignIn: () => goTo('Nearby'),
    onRegister: () => goTo('Welcome')
  }) : isOnboarding ? /*#__PURE__*/React.createElement(OnboardingScreen, {
    you: you,
    setYou: setYou,
    onDone: () => goTo('Nearby')
  }) : /*#__PURE__*/React.createElement(React.Fragment, null, tab === 'grid' ? /*#__PURE__*/React.createElement(Nearby, {
    you: you,
    people: t.empty ? [] : people,
    accentMode: accentMode,
    variant: variant,
    tilt: t.tilt,
    layout: layout,
    visible: visible,
    onToggleVisible: () => setVisible(v => !v),
    waves: waves,
    onWave: sendWave,
    onEditTag: () => goTo('My tag')
  }) : /*#__PURE__*/React.createElement(MyTag, {
    you: you,
    setYou: setYou,
    accentMode: accentMode,
    variant: variant,
    tilt: t.tilt
  }), /*#__PURE__*/React.createElement(TabBar, {
    tab: tab,
    onTab: id => goTo(id === 'profile' ? 'My tag' : 'Nearby')
  }))))))), /*#__PURE__*/React.createElement(TweaksPanel, null, /*#__PURE__*/React.createElement(TweakSection, {
    label: "Flow"
  }), /*#__PURE__*/React.createElement(TweakSelect, {
    label: "Screen",
    value: screen,
    options: ['Sign in', 'Welcome', 'Nearby', 'My tag'],
    onChange: v => setTweak('screen', v)
  }), /*#__PURE__*/React.createElement(TweakRadio, {
    label: "Theme",
    value: t.theme,
    options: ['Cream', 'Ink'],
    onChange: v => setTweak('theme', v)
  }), /*#__PURE__*/React.createElement(TweakColor, {
    label: "Brand color",
    value: t.primary,
    options: ['#06D6B8', '#FFB300', '#FF3D9A', '#A86BFF', '#FF4733'],
    onChange: v => setTweak('primary', v)
  }), /*#__PURE__*/React.createElement(TweakSection, {
    label: "The badge"
  }), /*#__PURE__*/React.createElement(TweakRadio, {
    label: "Card style",
    value: t.badge,
    options: ['Sticker', 'Editorial'],
    onChange: v => setTweak('badge', v)
  }), /*#__PURE__*/React.createElement(TweakColor, {
    label: "Badge colors",
    value: t.accent,
    options: [RAINBOW, '#FF4733', '#06D6B8', '#FFB300', '#FF3D9A', '#A86BFF'],
    onChange: v => setTweak('accent', v)
  }), /*#__PURE__*/React.createElement(TweakSlider, {
    label: "Sticker tilt",
    value: t.tilt,
    min: 0,
    max: 6,
    step: 0.5,
    unit: "\xB0",
    onChange: v => setTweak('tilt', v)
  }), /*#__PURE__*/React.createElement(TweakSection, {
    label: "Nearby"
  }), /*#__PURE__*/React.createElement(TweakRadio, {
    label: "Layout",
    value: t.layout,
    options: ['Grid', 'Stacked', 'Radar'],
    onChange: v => setTweak('layout', v)
  }), /*#__PURE__*/React.createElement(TweakToggle, {
    label: "Empty state",
    value: !!t.empty,
    onChange: v => setTweak('empty', v)
  }), /*#__PURE__*/React.createElement(TweakSection, {
    label: "Sign in"
  }), /*#__PURE__*/React.createElement(TweakRadio, {
    label: "Composition",
    value: t.auth,
    options: ['Card', 'Editorial', 'Badge'],
    onChange: v => setTweak('auth', v)
  })));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "design_handoff_nametag_redesign/design_files/app.jsx", error: String((e && e.message) || e) }); }

// design_handoff_nametag_redesign/design_files/badge.jsx
try { (() => {
// badge.jsx — the nametag card. Two variants: 'sticker' (literal HELLO badge,
// reskinned) and 'editorial' (brand portrait card). Plus Avatar + accent helper.
// Exports to window: Avatar, PersonCard, resolveAccent

const ACCENTS = window.NAMETAG_ACCENTS;
const ACCENT_ORDER = window.NAMETAG_ACCENT_ORDER;
function resolveAccent(person, index, accentMode) {
  // Returns a CSS var reference so the Ink theme's deepened paintbox
  // applies automatically wherever the accent is used.
  const key = !accentMode || accentMode === 'rainbow' ? ACCENTS[person.accent] ? person.accent : ACCENT_ORDER[index % ACCENT_ORDER.length] : ACCENTS[accentMode] ? accentMode : 'coral';
  return `var(--${key})`;
}

// initials from a display name
function initials(name) {
  const parts = String(name).trim().split(/\s+/);
  return (parts[0]?.[0] || '?').toUpperCase();
}
function Avatar({
  person,
  size = 96,
  accent,
  ring = true
}) {
  const common = {
    width: size,
    height: size,
    borderRadius: '50%',
    flexShrink: 0,
    overflow: 'hidden',
    border: ring ? '4px solid var(--surface)' : 'none',
    boxShadow: ring ? 'var(--shadow-card)' : 'none'
  };
  if (person.photo) {
    return /*#__PURE__*/React.createElement("div", {
      style: common
    }, /*#__PURE__*/React.createElement("img", {
      src: person.photo,
      alt: person.name,
      style: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }
    }));
  }
  // initial-monogram avatar on accent tint — bright + on-brand, no fake faces
  return /*#__PURE__*/React.createElement("div", {
    style: {
      ...common,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `color-mix(in srgb, ${accent} 20%, var(--surface))`
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: size * 0.42,
      color: accent,
      lineHeight: 1,
      letterSpacing: '-1px'
    }
  }, initials(person.name)));
}
function distanceLabel(d) {
  if (d == null) return null;
  if (d < 10) return 'here';
  if (d < 100) return `~${Math.round(d / 5) * 5} m`;
  return `${Math.max(1, Math.round(d / 80))} min walk`;
}

/* ── Sticker variant — literal HELLO badge, brand-reskinned ── */
function StickerBadge({
  person,
  accent,
  tilt = 0
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: -16,
      zIndex: 2
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    person: person,
    size: 72,
    accent: accent
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 168,
      background: 'var(--surface)',
      borderRadius: 8,
      overflow: 'hidden',
      border: 'var(--hairline) solid var(--border)',
      boxShadow: 'var(--shadow-card)',
      transform: `rotate(${tilt}deg)`,
      transformOrigin: 'center top',
      paddingTop: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: accent,
      padding: '7px 14px 6px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 13,
      letterSpacing: '.2em',
      color: '#fff',
      lineHeight: 1.05
    }
  }, "HELLO"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 8,
      letterSpacing: '.16em',
      textTransform: 'uppercase',
      color: 'rgba(255,255,255,.92)'
    }
  }, "my name is")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 10px 8px',
      textAlign: 'center',
      minHeight: 56,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: person.name.length > 11 ? 22 : person.name.length > 7 ? 26 : 30,
      color: 'var(--text)',
      lineHeight: 1.05,
      letterSpacing: '-0.5px',
      overflowWrap: 'normal',
      wordBreak: 'keep-all',
      maxWidth: '100%'
    }
  }, person.name)), person.tagline && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 12px 8px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontWeight: 700,
      fontSize: 12.5,
      color: 'var(--muted)',
      lineHeight: 1.3
    }
  }, person.tagline)), person.stickers?.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      justifyContent: 'center',
      paddingBottom: 8
    }
  }, person.stickers.map((s, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      fontSize: 17
    }
  }, s))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 14px',
      background: `color-mix(in srgb, ${accent} 13%, var(--surface))`,
      borderTop: `1.5px solid color-mix(in srgb, ${accent} 28%, transparent)`
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 800,
      fontSize: 12.5,
      color: accent
    }
  }, person.pronouns), distanceLabel(person.distance) && /*#__PURE__*/React.createElement("span", {
    className: "t-label",
    style: {
      fontSize: 9.5,
      color: 'var(--muted)'
    }
  }, distanceLabel(person.distance)))));
}

/* ── Editorial variant — brand portrait card, sticker spirit kept ── */
function EditorialCard({
  person,
  accent
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      alignItems: 'center',
      background: 'var(--surface)',
      border: 'var(--hairline) solid var(--border)',
      borderLeft: `3px solid ${accent}`,
      borderRadius: 'var(--r)',
      boxShadow: 'var(--shadow-card)',
      padding: '14px 16px',
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    person: person,
    size: 58,
    accent: accent,
    ring: false
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: 21,
      color: 'var(--text)',
      letterSpacing: '-0.6px',
      lineHeight: 1.1,
      wordBreak: 'keep-all',
      overflowWrap: 'normal'
    }
  }, person.name), distanceLabel(person.distance) && /*#__PURE__*/React.createElement("span", {
    className: "t-label",
    style: {
      color: accent,
      flexShrink: 0,
      fontSize: 9.5,
      whiteSpace: 'nowrap'
    }
  }, distanceLabel(person.distance))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginTop: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 800,
      fontSize: 11,
      color: accent,
      background: `color-mix(in srgb, ${accent} 14%, var(--surface))`,
      border: `1.5px solid color-mix(in srgb, ${accent} 30%, transparent)`,
      borderRadius: 'var(--r-pill)',
      padding: '3px 10px',
      lineHeight: 1
    }
  }, person.pronouns), person.stickers?.length > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      gap: 3
    }
  }, person.stickers.map((s, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      fontSize: 14
    }
  }, s)))), person.tagline && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontWeight: 700,
      fontSize: 13.5,
      color: 'var(--muted)',
      marginTop: 7,
      lineHeight: 1.35
    }
  }, person.tagline)));
}

/* ── wave chip — corner indicator for sent/incoming waves ── */
function WaveChip({
  state,
  variant
}) {
  if (!state) return null;
  const sent = state === 'sent';
  const sticker = variant === 'sticker';
  return /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: sticker ? 46 : -7,
      left: sticker ? 2 : -6,
      zIndex: 6,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      background: sent ? 'var(--sage)' : 'var(--surface)',
      color: sent ? '#14301f' : 'var(--text)',
      border: sent ? 'none' : '1.5px solid var(--border)',
      fontWeight: 800,
      fontSize: 10,
      lineHeight: 1,
      whiteSpace: 'nowrap',
      padding: '4px 9px',
      borderRadius: 99,
      boxShadow: '0 2px 8px rgba(29,19,11,.16)',
      transform: 'rotate(-4deg)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12
    }
  }, "\uD83D\uDC4B"), sent ? 'hi sent' : 'says hi!');
}
function PersonCard({
  person,
  accent,
  variant = 'sticker',
  tilt = 0,
  waveState
}) {
  const card = variant === 'editorial' ? /*#__PURE__*/React.createElement(EditorialCard, {
    person: person,
    accent: accent
  }) : /*#__PURE__*/React.createElement(StickerBadge, {
    person: person,
    accent: accent,
    tilt: tilt
  });
  if (!waveState) return card;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: variant === 'editorial' ? '100%' : 'auto'
    }
  }, card, /*#__PURE__*/React.createElement(WaveChip, {
    state: waveState,
    variant: variant
  }));
}
Object.assign(window, {
  Avatar,
  PersonCard,
  resolveAccent,
  distanceLabel,
  ntInitials: initials
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "design_handoff_nametag_redesign/design_files/badge.jsx", error: String((e && e.message) || e) }); }

// design_handoff_nametag_redesign/design_files/data.js
try { (() => {
// data.js — seed people for the Nearby grid (global: window.NAMETAG_DATA)
// Accents are paintbox keys; avatars are initial-monograms except `you`.

window.NAMETAG_DATA = {
  you: {
    id: 'you',
    name: 'Nabil',
    pronouns: 'he/him',
    tagline: 'Curious about almost everything',
    accent: 'teal',
    stickers: ['📚', '🐱'],
    photo: 'assets/ProfilePicture.webp',
    distance: 0,
    you: true
  },
  people: [{
    id: 1,
    name: 'Marisol',
    pronouns: 'she/her',
    tagline: 'Always chasing good light',
    accent: 'teal',
    stickers: ['📷', '🌸'],
    distance: 8,
    wavedAtYou: true
  }, {
    id: 2,
    name: 'Devin',
    pronouns: 'he/him',
    tagline: 'Here mostly for the coffee',
    accent: 'mustard',
    stickers: ['☕', '📚'],
    distance: 21
  }, {
    id: 3,
    name: 'Priya',
    pronouns: 'she/they',
    tagline: 'Building tiny robots',
    accent: 'lavender',
    stickers: ['🤖', '🎨'],
    distance: 34
  }, {
    id: 4,
    name: 'Theo',
    pronouns: 'he/they',
    tagline: 'Ask me about ferments',
    accent: 'rose',
    stickers: ['🍕', '🌍'],
    distance: 47
  }, {
    id: 5,
    name: 'Amara',
    pronouns: 'they/them',
    tagline: 'Plant parent, loud laugher',
    accent: 'coral',
    stickers: ['🌈', '🎉'],
    distance: 60
  }, {
    id: 6,
    name: 'Jonas',
    pronouns: 'he/him',
    tagline: 'Vinyl and very long walks',
    accent: 'teal',
    stickers: ['🎸'],
    distance: 130
  }, {
    id: 7,
    name: 'Yuki',
    pronouns: 'she/her',
    tagline: 'Sketching strangers, kindly',
    accent: 'mustard',
    stickers: ['🎨', '🌟'],
    distance: 210
  }]
};

// Paintbox lookup (hex). Mirrors colors_and_type.css.
window.NAMETAG_ACCENTS = {
  coral: '#FF4733',
  teal: '#06D6B8',
  mustard: '#FFB300',
  rose: '#FF3D9A',
  lavender: '#A86BFF'
};

// Deepened variants for the Ink theme — same hues, less glow on dark.
window.NAMETAG_ACCENTS_INK = {
  coral: '#E04330',
  teal: '#0ABFA6',
  mustard: '#E0A000',
  rose: '#E83387',
  lavender: '#955EE8'
};
window.NAMETAG_ACCENT_ORDER = ['coral', 'teal', 'mustard', 'rose', 'lavender'];
})(); } catch (e) { __ds_ns.__errors.push({ path: "design_handoff_nametag_redesign/design_files/data.js", error: String((e && e.message) || e) }); }

// design_handoff_nametag_redesign/design_files/detail-sheet.jsx
try { (() => {
// detail-sheet.jsx — slide-up person detail sheet for the Nearby screen.
// Tapping a badge opens this inside the phone frame. Includes the
// "Say hi" wave action (state lives in app.jsx so it persists).
// Exports to window: DetailSheet

function DetailSheet({
  person,
  accent,
  waved,
  onWave,
  onClose,
  onEditTag
}) {
  if (!person) return null;
  const isYou = !!person.you;
  const dist = window.distanceLabel(person.distance);
  const incoming = !isYou && !!person.wavedAtYou;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 60
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "nt-scrim",
    onClick: onClose,
    style: {
      position: 'absolute',
      inset: 0,
      background: 'color-mix(in srgb, #1d130b 44%, transparent)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "nt-sheet",
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      background: 'var(--surface)',
      borderTop: 'var(--hairline) solid var(--border)',
      borderRadius: '22px 22px 0 0',
      boxShadow: '0 -12px 40px rgba(29,19,11,.25)',
      padding: '10px 24px calc(22px + 14px)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      display: 'flex',
      justifyContent: 'center',
      padding: '2px 0 12px',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 4.5,
      borderRadius: 99,
      background: 'var(--border)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    person: person,
    size: 92,
    accent: accent
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      letterSpacing: '-1px',
      fontSize: person.name.length > 11 ? 28 : 34,
      lineHeight: 1.05,
      color: 'var(--text)',
      marginTop: 12
    }
  }, person.name), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginTop: 9
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 800,
      fontSize: 12,
      color: accent,
      lineHeight: 1,
      background: `color-mix(in srgb, ${accent} 14%, var(--surface))`,
      border: `1.5px solid color-mix(in srgb, ${accent} 30%, transparent)`,
      borderRadius: 'var(--r-pill)',
      padding: '5px 12px'
    }
  }, person.pronouns), dist && /*#__PURE__*/React.createElement("span", {
    className: "t-label",
    style: {
      fontSize: 10
    }
  }, isYou ? 'this is you' : dist === 'here' ? 'right here' : dist.includes('walk') ? dist : `${dist} away`)), person.tagline && /*#__PURE__*/React.createElement("div", {
    className: "t-quote",
    style: {
      fontSize: 16.5,
      color: 'var(--muted)',
      marginTop: 12,
      maxWidth: 250
    }
  }, "\u201C", person.tagline, "\u201D"), person.stickers?.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      marginTop: 14
    }
  }, person.stickers.map((s, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      fontSize: 30,
      lineHeight: 1,
      display: 'inline-block',
      transform: `rotate(${i % 2 === 0 ? -6 : 6}deg)`,
      filter: 'drop-shadow(0 2px 3px rgba(29,19,11,.18))'
    }
  }, s))), /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      marginTop: 20
    }
  }, incoming && /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 12.5,
      color: 'var(--text)',
      marginBottom: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15
    }
  }, "\uD83D\uDC4B"), person.name, " said hi to you"), isYou ? /*#__PURE__*/React.createElement("button", {
    className: "na-btn",
    style: {
      width: '100%'
    },
    onClick: onEditTag
  }, "Edit my tag") : waved ? /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      padding: '13px',
      borderRadius: 'var(--r-pill)',
      background: 'color-mix(in srgb, var(--sage) 16%, var(--surface))',
      border: '1.5px solid color-mix(in srgb, var(--sage) 38%, transparent)',
      fontWeight: 800,
      fontSize: 14.5,
      color: 'var(--text)'
    }
  }, "Wave sent ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16
    }
  }, "\uD83D\uDC4B"), " \u2014 they\u2019ll see it on their tag") : /*#__PURE__*/React.createElement("button", {
    className: "na-btn",
    style: {
      width: '100%'
    },
    onClick: () => onWave(person.id)
  }, incoming ? 'Wave back' : 'Say hi', " ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16,
      verticalAlign: '-2px'
    }
  }, "\uD83D\uDC4B"))))));
}
Object.assign(window, {
  DetailSheet
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "design_handoff_nametag_redesign/design_files/detail-sheet.jsx", error: String((e && e.message) || e) }); }

// design_handoff_nametag_redesign/design_files/ios-frame.jsx
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)

/* BEGIN USAGE */
// iOS.jsx — Simplified iOS 26 (Liquid Glass) device frame
// Based on the iOS 26 UI Kit + Figma status bar spec. No assets, no deps.
// Exports (to window): IOSDevice, IOSStatusBar, IOSNavBar, IOSGlassPill, IOSList, IOSListRow, IOSKeyboard
//
// Usage — wrap your screen content in <IOSDevice> to get the bezel, status bar
// and home indicator (props: title, dark, keyboard):
//
//   <IOSDevice title="Settings">
//     ...your screen content...
//   </IOSDevice>
//   <IOSDevice dark title="Search" keyboard>…</IOSDevice>
/* END USAGE */

// ─────────────────────────────────────────────────────────────
// Status bar
// ─────────────────────────────────────────────────────────────
function IOSStatusBar({
  dark = false,
  time = '9:41'
}) {
  const c = dark ? '#fff' : '#000';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 154,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '21px 24px 19px',
      boxSizing: 'border-box',
      position: 'relative',
      zIndex: 20,
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 1.5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: '-apple-system, "SF Pro", system-ui',
      fontWeight: 590,
      fontSize: 17,
      lineHeight: '22px',
      color: c
    }
  }, time)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      paddingTop: 1,
      paddingRight: 1
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "19",
    height: "12",
    viewBox: "0 0 19 12"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "7.5",
    width: "3.2",
    height: "4.5",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "4.8",
    y: "5",
    width: "3.2",
    height: "7",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "9.6",
    y: "2.5",
    width: "3.2",
    height: "9.5",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "14.4",
    y: "0",
    width: "3.2",
    height: "12",
    rx: "0.7",
    fill: c
  })), /*#__PURE__*/React.createElement("svg", {
    width: "17",
    height: "12",
    viewBox: "0 0 17 12"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M8.5 3.2C10.8 3.2 12.9 4.1 14.4 5.6L15.5 4.5C13.7 2.7 11.2 1.5 8.5 1.5C5.8 1.5 3.3 2.7 1.5 4.5L2.6 5.6C4.1 4.1 6.2 3.2 8.5 3.2Z",
    fill: c
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8.5 6.8C9.9 6.8 11.1 7.3 12 8.2L13.1 7.1C11.8 5.9 10.2 5.1 8.5 5.1C6.8 5.1 5.2 5.9 3.9 7.1L5 8.2C5.9 7.3 7.1 6.8 8.5 6.8Z",
    fill: c
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "8.5",
    cy: "10.5",
    r: "1.5",
    fill: c
  })), /*#__PURE__*/React.createElement("svg", {
    width: "27",
    height: "13",
    viewBox: "0 0 27 13"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0.5",
    y: "0.5",
    width: "23",
    height: "12",
    rx: "3.5",
    stroke: c,
    strokeOpacity: "0.35",
    fill: "none"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "2",
    y: "2",
    width: "20",
    height: "9",
    rx: "2",
    fill: c
  }), /*#__PURE__*/React.createElement("path", {
    d: "M25 4.5V8.5C25.8 8.2 26.5 7.2 26.5 6.5C26.5 5.8 25.8 4.8 25 4.5Z",
    fill: c,
    fillOpacity: "0.4"
  }))));
}

// ─────────────────────────────────────────────────────────────
// Liquid glass pill — blur + tint + shine
// ─────────────────────────────────────────────────────────────
function IOSGlassPill({
  children,
  dark = false,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 44,
      minWidth: 44,
      borderRadius: 9999,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: dark ? '0 2px 6px rgba(0,0,0,0.35), 0 6px 16px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.07), 0 3px 10px rgba(0,0,0,0.06)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 9999,
      backdropFilter: 'blur(12px) saturate(180%)',
      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      background: dark ? 'rgba(120,120,128,0.28)' : 'rgba(255,255,255,0.5)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 9999,
      boxShadow: dark ? 'inset 1.5px 1.5px 1px rgba(255,255,255,0.15), inset -1px -1px 1px rgba(255,255,255,0.08)' : 'inset 1.5px 1.5px 1px rgba(255,255,255,0.7), inset -1px -1px 1px rgba(255,255,255,0.4)',
      border: dark ? '0.5px solid rgba(255,255,255,0.15)' : '0.5px solid rgba(0,0,0,0.06)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      alignItems: 'center',
      padding: '0 4px'
    }
  }, children));
}

// ─────────────────────────────────────────────────────────────
// Navigation bar — glass pills + large title
// ─────────────────────────────────────────────────────────────
function IOSNavBar({
  title = 'Title',
  dark = false,
  trailingIcon = true
}) {
  const muted = dark ? 'rgba(255,255,255,0.6)' : '#404040';
  const text = dark ? '#fff' : '#000';
  const pillIcon = content => /*#__PURE__*/React.createElement(IOSGlassPill, {
    dark: dark
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, content));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      paddingTop: 62,
      paddingBottom: 10,
      position: 'relative',
      zIndex: 5
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px'
    }
  }, pillIcon(/*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "20",
    viewBox: "0 0 12 20",
    fill: "none",
    style: {
      marginLeft: -1
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M10 2L2 10l8 8",
    stroke: muted,
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), trailingIcon && pillIcon(/*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "6",
    viewBox: "0 0 22 6"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "3",
    cy: "3",
    r: "2.5",
    fill: muted
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "3",
    r: "2.5",
    fill: muted
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "19",
    cy: "3",
    r: "2.5",
    fill: muted
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px',
      fontFamily: '-apple-system, system-ui',
      fontSize: 34,
      fontWeight: 700,
      lineHeight: '41px',
      color: text,
      letterSpacing: 0.4
    }
  }, title));
}

// ─────────────────────────────────────────────────────────────
// Grouped list (inset card, r:26) + row (52px)
// ─────────────────────────────────────────────────────────────
function IOSListRow({
  title,
  detail,
  icon,
  chevron = true,
  isLast = false,
  dark = false
}) {
  const text = dark ? '#fff' : '#000';
  const sec = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const ter = dark ? 'rgba(235,235,245,0.3)' : 'rgba(60,60,67,0.3)';
  const sep = dark ? 'rgba(84,84,88,0.65)' : 'rgba(60,60,67,0.12)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      minHeight: 52,
      padding: '0 16px',
      position: 'relative',
      fontFamily: '-apple-system, system-ui',
      fontSize: 17,
      letterSpacing: -0.43
    }
  }, icon && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 30,
      height: 30,
      borderRadius: 7,
      background: icon,
      marginRight: 12,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      color: text
    }
  }, title), detail && /*#__PURE__*/React.createElement("span", {
    style: {
      color: sec,
      marginRight: 6
    }
  }, detail), chevron && /*#__PURE__*/React.createElement("svg", {
    width: "8",
    height: "14",
    viewBox: "0 0 8 14",
    style: {
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M1 1l6 6-6 6",
    stroke: ter,
    strokeWidth: "2",
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })), !isLast && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      left: icon ? 58 : 16,
      height: 0.5,
      background: sep
    }
  }));
}
function IOSList({
  header,
  children,
  dark = false
}) {
  const hc = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const bg = dark ? '#1C1C1E' : '#fff';
  return /*#__PURE__*/React.createElement("div", null, header && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: '-apple-system, system-ui',
      fontSize: 13,
      color: hc,
      textTransform: 'uppercase',
      padding: '8px 36px 6px',
      letterSpacing: -0.08
    }
  }, header), /*#__PURE__*/React.createElement("div", {
    style: {
      background: bg,
      borderRadius: 26,
      margin: '0 16px',
      overflow: 'hidden'
    }
  }, children));
}

// ─────────────────────────────────────────────────────────────
// Device frame
// ─────────────────────────────────────────────────────────────
function IOSDevice({
  children,
  width = 402,
  height = 874,
  dark = false,
  title,
  keyboard = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      height,
      borderRadius: 48,
      overflow: 'hidden',
      position: 'relative',
      background: dark ? '#000' : '#F2F2F7',
      boxShadow: '0 40px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.12)',
      fontFamily: '-apple-system, system-ui, sans-serif',
      WebkitFontSmoothing: 'antialiased'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 11,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 126,
      height: 37,
      borderRadius: 24,
      background: '#000',
      zIndex: 50
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10
    }
  }, /*#__PURE__*/React.createElement(IOSStatusBar, {
    dark: dark
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }
  }, title !== undefined && /*#__PURE__*/React.createElement(IOSNavBar, {
    title: title,
    dark: dark
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto'
    }
  }, children), keyboard && /*#__PURE__*/React.createElement(IOSKeyboard, {
    dark: dark
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 60,
      height: 34,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-end',
      paddingBottom: 8,
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 139,
      height: 5,
      borderRadius: 100,
      background: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.25)'
    }
  })));
}

// ─────────────────────────────────────────────────────────────
// Keyboard — iOS 26 liquid glass
// ─────────────────────────────────────────────────────────────
function IOSKeyboard({
  dark = false
}) {
  const glyph = dark ? 'rgba(255,255,255,0.7)' : '#595959';
  const sugg = dark ? 'rgba(255,255,255,0.6)' : '#333';
  const keyBg = dark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.85)';

  // special-key icons
  const icons = {
    shift: /*#__PURE__*/React.createElement("svg", {
      width: "19",
      height: "17",
      viewBox: "0 0 19 17"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M9.5 1L1 9.5h4.5V16h8V9.5H18L9.5 1z",
      fill: glyph
    })),
    del: /*#__PURE__*/React.createElement("svg", {
      width: "23",
      height: "17",
      viewBox: "0 0 23 17"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M7 1h13a2 2 0 012 2v11a2 2 0 01-2 2H7l-6-7.5L7 1z",
      fill: "none",
      stroke: glyph,
      strokeWidth: "1.6",
      strokeLinejoin: "round"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M10 5l7 7M17 5l-7 7",
      stroke: glyph,
      strokeWidth: "1.6",
      strokeLinecap: "round"
    })),
    ret: /*#__PURE__*/React.createElement("svg", {
      width: "20",
      height: "14",
      viewBox: "0 0 20 14"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M18 1v6H4m0 0l4-4M4 7l4 4",
      fill: "none",
      stroke: "#fff",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }))
  };
  const key = (content, {
    w,
    flex,
    ret,
    fs = 25,
    k
  } = {}) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      height: 42,
      borderRadius: 8.5,
      flex: flex ? 1 : undefined,
      width: w,
      minWidth: 0,
      background: ret ? '#08f' : keyBg,
      boxShadow: '0 1px 0 rgba(0,0,0,0.075)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, "SF Compact", system-ui',
      fontSize: fs,
      fontWeight: 458,
      color: ret ? '#fff' : glyph
    }
  }, content);
  const row = (keys, pad = 0) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6.5,
      justifyContent: 'center',
      padding: `0 ${pad}px`
    }
  }, keys.map(l => key(l, {
    flex: true,
    k: l
  })));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 15,
      borderRadius: 27,
      overflow: 'hidden',
      padding: '11px 0 2px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxShadow: dark ? '0 -2px 20px rgba(0,0,0,0.09)' : '0 -1px 6px rgba(0,0,0,0.018), 0 -3px 20px rgba(0,0,0,0.012)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 27,
      backdropFilter: 'blur(12px) saturate(180%)',
      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      background: dark ? 'rgba(120,120,128,0.14)' : 'rgba(255,255,255,0.25)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 27,
      boxShadow: dark ? 'inset 1.5px 1.5px 1px rgba(255,255,255,0.15)' : 'inset 1.5px 1.5px 1px rgba(255,255,255,0.7), inset -1px -1px 1px rgba(255,255,255,0.4)',
      border: dark ? '0.5px solid rgba(255,255,255,0.15)' : '0.5px solid rgba(0,0,0,0.06)',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 20,
      alignItems: 'center',
      padding: '8px 22px 13px',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative'
    }
  }, ['"The"', 'the', 'to'].map((w, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, i > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1,
      height: 25,
      background: '#ccc',
      opacity: 0.3
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'center',
      fontFamily: '-apple-system, system-ui',
      fontSize: 17,
      color: sugg,
      letterSpacing: -0.43,
      lineHeight: '22px'
    }
  }, w)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 13,
      padding: '0 6.5px',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative'
    }
  }, row(['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p']), row(['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'], 20), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14.25,
      alignItems: 'center'
    }
  }, key(icons.shift, {
    w: 45,
    k: 'shift'
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6.5,
      flex: 1
    }
  }, ['z', 'x', 'c', 'v', 'b', 'n', 'm'].map(l => key(l, {
    flex: true,
    k: l
  }))), key(icons.del, {
    w: 45,
    k: 'del'
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      alignItems: 'center'
    }
  }, key('ABC', {
    w: 92.25,
    fs: 18,
    k: 'abc'
  }), key('', {
    flex: true,
    k: 'space'
  }), key(icons.ret, {
    w: 92.25,
    ret: true,
    k: 'ret'
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 56,
      width: '100%',
      position: 'relative'
    }
  }));
}
Object.assign(window, {
  IOSDevice,
  IOSStatusBar,
  IOSNavBar,
  IOSGlassPill,
  IOSList,
  IOSListRow,
  IOSKeyboard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "design_handoff_nametag_redesign/design_files/ios-frame.jsx", error: String((e && e.message) || e) }); }

// design_handoff_nametag_redesign/design_files/onboarding.jsx
try { (() => {
// onboarding.jsx — first-run "write your name on your tag" moment.
// Shown after Create account. The badge fills in live as you type.
// Exports to window: OnboardingScreen

const {
  useState: useStateO
} = React;
const OB_PRONOUNS = ['she/her', 'he/him', 'they/them', 'she/they', 'he/they'];
function OnboardingScreen({
  you,
  setYou,
  onDone
}) {
  const [name, setName] = useStateO('');
  const [pronouns, setPronouns] = useStateO('');
  const [accentKey, setAccentKey] = useStateO('teal');
  const ready = name.trim().length > 0;
  const draft = {
    name: name.trim() || ' ',
    pronouns: pronouns || ' ',
    tagline: '',
    stickers: [],
    distance: null,
    photo: null
  };
  const accentHex = `var(--${accentKey})`;
  const finish = () => {
    if (!ready) return;
    setYou(prev => ({
      ...prev,
      name: name.trim(),
      pronouns: pronouns || prev.pronouns,
      accent: accentKey
    }));
    onDone();
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "dotgrid no-sb",
    style: {
      height: '100%',
      width: '100%',
      overflowY: 'auto',
      padding: '70px 26px 40px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxSizing: 'border-box'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "t-label",
    style: {
      color: 'var(--primary)'
    }
  }, "One last thing"), /*#__PURE__*/React.createElement("div", {
    className: "t-display",
    style: {
      fontSize: 30,
      textAlign: 'center',
      marginTop: 8,
      lineHeight: 1.1
    }
  }, "Write your name", /*#__PURE__*/React.createElement("br", null), "on your ", /*#__PURE__*/React.createElement("em", null, "tag")), /*#__PURE__*/React.createElement("div", {
    className: "nt-pop",
    style: {
      marginTop: 22,
      marginBottom: 26,
      transform: 'rotate(-2deg)'
    }
  }, /*#__PURE__*/React.createElement(PersonCard, {
    person: draft,
    accent: accentHex,
    variant: "sticker",
    tilt: 0
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("input", {
    className: "na-field",
    autoFocus: true,
    type: "text",
    placeholder: "Your name",
    maxLength: 20,
    value: name,
    onChange: e => setName(e.target.value),
    style: {
      textAlign: 'center',
      fontWeight: 800,
      fontSize: 17
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      justifyContent: 'center'
    }
  }, OB_PRONOUNS.map(p => /*#__PURE__*/React.createElement("button", {
    key: p,
    className: "na-chip",
    "data-on": pronouns === p ? 'true' : 'false',
    onClick: () => setPronouns(prev => prev === p ? '' : p)
  }, p))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      justifyContent: 'center',
      marginTop: 2
    }
  }, window.NAMETAG_ACCENT_ORDER.map(k => /*#__PURE__*/React.createElement("button", {
    key: k,
    onClick: () => setAccentKey(k),
    "aria-label": k,
    style: {
      width: 34,
      height: 34,
      borderRadius: '50%',
      cursor: 'pointer',
      background: `var(--${k})`,
      border: accentKey === k ? '3px solid var(--text)' : '3px solid transparent',
      outline: 'var(--hairline) solid var(--border)',
      transition: 'transform .12s ease',
      transform: accentKey === k ? 'scale(1.12)' : 'none'
    }
  }))), /*#__PURE__*/React.createElement("button", {
    className: "na-btn",
    disabled: !ready,
    onClick: finish,
    style: {
      marginTop: 6,
      opacity: ready ? 1 : 0.45,
      cursor: ready ? 'pointer' : 'default'
    }
  }, "Stick it on \u2192"), /*#__PURE__*/React.createElement("div", {
    className: "t-label",
    style: {
      textAlign: 'center',
      fontSize: 9.5
    }
  }, "You can add a photo & stickers later")));
}
Object.assign(window, {
  OnboardingScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "design_handoff_nametag_redesign/design_files/onboarding.jsx", error: String((e && e.message) || e) }); }

// design_handoff_nametag_redesign/design_files/screens-app.jsx
try { (() => {
// screens-app.jsx — NearbyScreen (grid/stacked/radar), MyTagScreen, TabBar
// Exports to window: NearbyScreen, MyTagScreen, TabBar

const {
  useState: useS,
  useMemo: useM
} = React;
const PRONOUN_OPTIONS = ['she/her', 'he/him', 'they/them', 'she/they', 'he/they', 'custom'];
const STICKER_OPTIONS = ['👋', '🌟', '🎉', '🌈', '🦄', '🐉', '🌸', '🍕', '🎸', '📚', '🎨', '🌍', '☕', '🤖', '🐱', '🐶'];
const RADIUS_OPTIONS = [{
  v: 50,
  l: '50 m · same floor'
}, {
  v: 100,
  l: '100 m · a city block'
}, {
  v: 200,
  l: '200 m · nearby blocks'
}, {
  v: 500,
  l: '500 m · the neighborhood'
}, {
  v: 1000,
  l: '1 km · wider area'
}];

/* ── shared toggle ── */
function Toggle({
  on,
  onClick,
  color = 'var(--primary)'
}) {
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    style: {
      width: 46,
      height: 27,
      borderRadius: 99,
      cursor: 'pointer',
      flexShrink: 0,
      background: on ? color : 'var(--border)',
      position: 'relative',
      transition: 'background .18s ease'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 3,
      left: on ? 22 : 3,
      width: 21,
      height: 21,
      borderRadius: '50%',
      background: '#fff',
      boxShadow: '0 1px 3px rgba(0,0,0,.25)',
      transition: 'left .18s ease'
    }
  }));
}

/* ═══════════════ NEARBY ═══════════════ */
function Nearby({
  you,
  people,
  accentMode,
  variant,
  tilt,
  layout,
  visible,
  onToggleVisible,
  waves,
  onWave,
  onEditTag
}) {
  const [sel, setSel] = useS(null);
  const [refreshing, setRefreshing] = useS(false);
  const doRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };
  const all = useM(() => {
    const list = [];
    if (you?.name) list.push({
      ...you,
      you: true
    });
    const sorted = [...people].sort((a, b) => (a.distance ?? 1e9) - (b.distance ?? 1e9));
    return list.concat(sorted);
  }, [you, people]);
  const selAccent = sel ? resolveAccent(sel, all.findIndex(p => p.id === sel.id), accentMode) : null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "no-sb",
    style: {
      height: '100%',
      overflowY: 'auto',
      padding: '70px 18px 96px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "t-display",
    style: {
      fontSize: 38
    }
  }, "Near", /*#__PURE__*/React.createElement("em", null, "by")), /*#__PURE__*/React.createElement("div", {
    className: "t-label",
    style: {
      marginTop: 6
    }
  }, refreshing ? 'Scanning nearby…' : people.length === 0 ? 'Updated 9:41 · just you' : `Updated 9:41 · ${people.length} people`)), /*#__PURE__*/React.createElement("button", {
    className: "na-chip",
    style: {
      fontWeight: 800
    },
    onClick: doRefresh
  }, refreshing ? 'Scanning…' : 'Refresh →')), /*#__PURE__*/React.createElement("div", {
    onClick: onToggleVisible,
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      background: visible ? 'color-mix(in srgb, var(--sage) 14%, var(--surface))' : 'var(--warm2)',
      border: `var(--hairline) solid ${visible ? 'color-mix(in srgb, var(--sage) 34%, transparent)' : 'var(--border)'}`,
      borderRadius: 'var(--r)',
      padding: '13px 16px',
      marginBottom: 20,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 14,
      whiteSpace: 'nowrap'
    }
  }, visible ? 'You’re visible nearby' : 'You’re hidden right now'), /*#__PURE__*/React.createElement("div", {
    className: "t-body",
    style: {
      fontSize: 12.5,
      marginTop: 2,
      whiteSpace: 'nowrap'
    }
  }, visible ? 'Tap to slip out of view.' : 'Tap to share your name nearby.')), /*#__PURE__*/React.createElement(Toggle, {
    on: visible,
    onClick: () => {},
    color: "var(--sage)"
  })), refreshing ? /*#__PURE__*/React.createElement(SkeletonGrid, {
    variant: variant,
    layout: layout
  }) : people.length === 0 ? /*#__PURE__*/React.createElement(EmptyNearby, {
    you: you,
    accentMode: accentMode,
    variant: variant,
    tilt: tilt,
    visible: visible,
    onSelect: setSel
  }) : layout === 'radar' ? /*#__PURE__*/React.createElement(Radar, {
    you: you,
    people: people,
    accentMode: accentMode,
    visible: visible,
    onSelect: setSel
  }) : /*#__PURE__*/React.createElement(PeopleLayout, {
    all: all,
    accentMode: accentMode,
    variant: variant,
    tilt: tilt,
    layout: layout,
    visible: visible,
    onSelect: setSel,
    waves: waves
  })), /*#__PURE__*/React.createElement(DetailSheet, {
    person: sel,
    accent: selAccent,
    waved: !!(sel && waves && waves[sel.id]),
    onWave: onWave,
    onClose: () => setSel(null),
    onEditTag: () => {
      setSel(null);
      onEditTag && onEditTag();
    }
  }));
}

/* ── Loading skeleton — pulsing placeholder badges ── */
function SkeletonGrid({
  variant,
  layout
}) {
  const sticker = variant === 'sticker';
  const cols = layout === 'grid' && sticker ? 'repeat(2, 1fr)' : '1fr';
  const n = sticker ? 4 : 4;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: cols,
      columnGap: 14,
      rowGap: sticker ? 30 : 14,
      justifyItems: 'center',
      maxWidth: layout === 'stacked' ? 320 : '100%',
      margin: '0 auto'
    }
  }, Array.from({
    length: n
  }).map((_, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      animation: `nt-pulse 1.1s ease ${i * 0.12}s infinite alternate`
    }
  }, sticker ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 64,
      height: 64,
      borderRadius: '50%',
      background: 'var(--warm2)',
      border: 'var(--hairline) solid var(--border)',
      marginBottom: -14,
      zIndex: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 168,
      height: 150,
      borderRadius: 8,
      background: 'var(--surface)',
      border: 'var(--hairline) solid var(--border)',
      paddingTop: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 28,
      background: 'var(--warm2)',
      margin: '0 0 14px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 14,
      background: 'var(--warm2)',
      borderRadius: 99,
      margin: '0 28px 8px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 10,
      background: 'var(--warm2)',
      borderRadius: 99,
      margin: '0 40px'
    }
  }))) : /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      height: 86,
      borderRadius: 'var(--r)',
      background: 'var(--surface)',
      border: 'var(--hairline) solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '0 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 58,
      height: 58,
      borderRadius: '50%',
      background: 'var(--warm2)',
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 16,
      background: 'var(--warm2)',
      borderRadius: 99,
      width: '55%',
      marginBottom: 9
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 11,
      background: 'var(--warm2)',
      borderRadius: 99,
      width: '80%'
    }
  }))))));
}

/* ── Empty state — you're the first one here ── */
function EmptyNearby({
  you,
  accentMode,
  variant,
  tilt,
  visible,
  onSelect
}) {
  const accent = resolveAccent(you, 0, accentMode);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "nt-tappable",
    onClick: () => onSelect({
      ...you,
      you: true
    }),
    style: {
      cursor: 'pointer',
      opacity: visible ? 1 : 0.4,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement(PersonCard, {
    person: you,
    accent: accent,
    variant: variant,
    tilt: variant === 'sticker' ? -tilt : 0
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: variant === 'sticker' ? -6 : 8,
      right: variant === 'sticker' ? 12 : 10,
      zIndex: 5,
      background: 'var(--text)',
      color: 'var(--bg)',
      fontWeight: 800,
      fontSize: 9,
      letterSpacing: '.12em',
      padding: '3px 8px',
      borderRadius: 99,
      textTransform: 'uppercase'
    }
  }, "You")), variant === 'sticker' && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 150,
      alignSelf: 'stretch',
      minHeight: 200,
      marginTop: 28,
      border: '2px dashed color-mix(in srgb, var(--muted) 38%, transparent)',
      borderRadius: 10,
      transform: `rotate(${tilt || 2}deg)`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      padding: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 26
    }
  }, "\uD83D\uDC4B"), /*#__PURE__*/React.createElement("span", {
    className: "t-quote",
    style: {
      fontSize: 13.5,
      color: 'var(--muted)',
      textAlign: 'center'
    }
  }, "this spot\u2019s free"))), /*#__PURE__*/React.createElement("div", {
    className: "t-h2",
    style: {
      fontSize: 24,
      marginTop: 30,
      textAlign: 'center',
      whiteSpace: 'nowrap'
    }
  }, "No tags nearby ", /*#__PURE__*/React.createElement("em", {
    style: {
      color: 'var(--primary)'
    }
  }, "yet")), /*#__PURE__*/React.createElement("div", {
    className: "t-body",
    style: {
      fontSize: 14,
      color: 'var(--muted)',
      textAlign: 'center',
      maxWidth: 250,
      marginTop: 9,
      lineHeight: 1.55
    }
  }, "You\u2019re the first one here. Stay visible \u2014 when someone arrives, their tag shows up right beside yours."));
}
function PeopleLayout({
  all,
  accentMode,
  variant,
  tilt,
  layout,
  visible,
  onSelect,
  waves
}) {
  const isGrid = layout === 'grid';
  const cols = isGrid && variant === 'sticker' ? 'repeat(2, 1fr)' : '1fr';
  const rowGap = variant === 'sticker' ? 30 : 14;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: cols,
      columnGap: 14,
      rowGap,
      justifyItems: variant === 'sticker' ? 'center' : 'stretch',
      maxWidth: layout === 'stacked' ? 320 : '100%',
      margin: '0 auto'
    }
  }, all.map((p, i) => {
    const accent = resolveAccent(p, i, accentMode);
    const dim = p.you && !visible;
    const waveState = !p.you ? waves && waves[p.id] ? 'sent' : p.wavedAtYou ? 'incoming' : null : null;
    return /*#__PURE__*/React.createElement("div", {
      key: p.id,
      onClick: () => onSelect && onSelect(p),
      className: "nt-tappable",
      style: {
        position: 'relative',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        opacity: dim ? 0.4 : 1,
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement(PersonCard, {
      person: p,
      accent: accent,
      variant: variant,
      tilt: variant === 'sticker' ? i % 2 === 0 ? -tilt : tilt : 0,
      waveState: waveState
    }), p.you && /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        top: variant === 'sticker' ? -6 : 8,
        right: variant === 'sticker' ? 18 : 10,
        zIndex: 5,
        background: 'var(--text)',
        color: 'var(--bg)',
        fontWeight: 800,
        fontSize: 9,
        letterSpacing: '.12em',
        padding: '3px 8px',
        borderRadius: 99,
        textTransform: 'uppercase'
      }
    }, "You"));
  }));
}

/* ── Radar layout — spatial map on a dotted grid ── */
function Radar({
  you,
  people,
  accentMode,
  visible,
  onSelect
}) {
  const SIZE = 320,
    C = SIZE / 2;
  const maxD = Math.max(...people.map(p => p.distance), 100);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "dotgrid",
    style: {
      position: 'relative',
      width: '100%',
      maxWidth: SIZE,
      aspectRatio: '1',
      margin: '0 auto',
      borderRadius: 'var(--r)',
      border: 'var(--hairline) solid var(--border)',
      overflow: 'hidden',
      background: 'var(--surface)'
    }
  }, [0.4, 0.72, 1].map((f, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      position: 'absolute',
      left: '50%',
      top: '50%',
      width: `${f * 88}%`,
      height: `${f * 88}%`,
      transform: 'translate(-50%,-50%)',
      borderRadius: '50%',
      border: '1.5px dashed color-mix(in srgb, var(--muted) 35%, transparent)'
    }
  })), /*#__PURE__*/React.createElement(Pin, {
    person: you,
    accent: "var(--primary)",
    x: C,
    y: C,
    size: 52,
    you: true,
    dim: !visible,
    onClick: () => onSelect({
      ...you,
      you: true
    })
  }), people.map((p, i) => {
    const ang = (i * 49 + 20) * Math.PI / 180;
    const r = (0.22 + 0.66 * (p.distance / maxD)) * (SIZE * 0.44);
    const x = C + r * Math.cos(ang),
      y = C + r * Math.sin(ang);
    return /*#__PURE__*/React.createElement(Pin, {
      key: p.id,
      person: p,
      accent: resolveAccent(p, i, accentMode),
      x: x,
      y: y,
      size: 40,
      onClick: () => onSelect(p)
    });
  })), /*#__PURE__*/React.createElement("div", {
    className: "t-label",
    style: {
      textAlign: 'center',
      marginTop: 12
    }
  }, "Tap a face to see their tag"));
}
function Pin({
  person,
  accent,
  x,
  y,
  size,
  you,
  dim,
  onClick
}) {
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    style: {
      position: 'absolute',
      left: x,
      top: y,
      transform: 'translate(-50%,-50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 3,
      cursor: 'pointer',
      opacity: dim ? 0.4 : 1,
      zIndex: you ? 4 : 3
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    person: person,
    size: size,
    accent: accent
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 800,
      fontSize: 10,
      color: 'var(--text)',
      background: 'var(--surface)',
      padding: '1px 7px',
      borderRadius: 99,
      border: 'var(--hairline) solid var(--border)',
      whiteSpace: 'nowrap'
    }
  }, you ? 'You' : person.name));
}

/* ═══════════════ MY TAG ═══════════════ */
function Field({
  label,
  count,
  max,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 7
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 800,
      fontSize: 13.5,
      color: 'var(--text)'
    }
  }, label), max != null && /*#__PURE__*/React.createElement("span", {
    className: "t-label",
    style: {
      color: count > max - 5 ? 'var(--primary)' : 'var(--muted)'
    }
  }, count, "/", max)), children);
}
function MyTag({
  you,
  setYou,
  accentMode,
  variant,
  tilt
}) {
  const [confirmDel, setConfirmDel] = useS(false);
  const u = you;
  const set = patch => setYou({
    ...u,
    ...patch
  });
  const accent = resolveAccent(u, 0, accentMode);
  const toggleSticker = s => {
    const has = u.stickers.includes(s);
    if (has) set({
      stickers: u.stickers.filter(x => x !== s)
    });else if (u.stickers.length < 3) set({
      stickers: [...u.stickers, s]
    });
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "no-sb",
    style: {
      height: '100%',
      overflowY: 'auto',
      padding: '70px 22px 96px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "t-display",
    style: {
      fontSize: 38
    }
  }, "My ", /*#__PURE__*/React.createElement("em", null, "tag")), /*#__PURE__*/React.createElement("span", {
    className: "t-label",
    style: {
      color: 'var(--sage)'
    }
  }, "Saved \u2713")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      padding: '22px 0 26px',
      background: 'var(--warm)',
      borderRadius: 'var(--r)',
      border: 'var(--hairline) solid var(--border)',
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement(PersonCard, {
    person: u,
    accent: accent,
    variant: variant,
    tilt: variant === 'sticker' ? tilt : 0
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    person: u,
    size: 88,
    accent: accent
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 800,
      fontSize: 13.5,
      color: 'var(--primary)',
      cursor: 'pointer'
    }
  }, "Change photo")), /*#__PURE__*/React.createElement(Field, {
    label: "Your name",
    count: u.name.length,
    max: 40
  }, /*#__PURE__*/React.createElement("input", {
    className: "na-field",
    value: u.name,
    maxLength: 40,
    onChange: e => set({
      name: e.target.value
    }),
    placeholder: "What should people call you?"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Your pronouns"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8
    }
  }, PRONOUN_OPTIONS.map(opt => /*#__PURE__*/React.createElement("button", {
    key: opt,
    className: "na-chip",
    "data-on": u.pronouns === opt,
    onClick: () => set({
      pronouns: opt === 'custom' ? u.pronouns : opt
    })
  }, opt === 'custom' ? '+ custom' : opt)))), /*#__PURE__*/React.createElement(Field, {
    label: "Tagline",
    count: u.tagline.length,
    max: 60
  }, /*#__PURE__*/React.createElement("input", {
    className: "na-field",
    value: u.tagline,
    maxLength: 60,
    onChange: e => set({
      tagline: e.target.value
    }),
    placeholder: "A short line about you\u2026"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Show me to people within"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("select", {
    className: "na-field",
    value: u.radius || 100,
    onChange: e => set({
      radius: Number(e.target.value)
    }),
    style: {
      appearance: 'none',
      cursor: 'pointer'
    }
  }, RADIUS_OPTIONS.map(o => /*#__PURE__*/React.createElement("option", {
    key: o.v,
    value: o.v
  }, o.l))), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      right: 16,
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none',
      color: 'var(--muted)',
      fontWeight: 800
    }
  }, "\u25BE"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 13,
      alignItems: 'flex-start',
      padding: 16,
      marginBottom: 22,
      background: 'color-mix(in srgb, var(--primary) 8%, var(--surface))',
      border: 'var(--hairline) solid color-mix(in srgb, var(--primary) 26%, transparent)',
      borderRadius: 'var(--r)'
    }
  }, /*#__PURE__*/React.createElement(Toggle, {
    on: u.alwaysVisible !== false,
    onClick: () => set({
      alwaysVisible: !(u.alwaysVisible !== false)
    })
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 13.5
    }
  }, u.alwaysVisible !== false ? 'Always visible when nearby' : 'Only visible when I choose'), /*#__PURE__*/React.createElement("div", {
    className: "t-body",
    style: {
      fontSize: 12.5,
      marginTop: 2
    }
  }, u.alwaysVisible !== false ? 'People nearby see your name automatically.' : 'Hidden by default — flip visibility on from Nearby.'))), /*#__PURE__*/React.createElement(Field, {
    label: "Nametag color"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      flexWrap: 'wrap'
    }
  }, window.NAMETAG_ACCENT_ORDER.map(key => {
    const hex = `var(--${key})`;
    const on = u.accent === key;
    return /*#__PURE__*/React.createElement("button", {
      key: key,
      onClick: () => set({
        accent: key
      }),
      title: key,
      style: {
        width: 34,
        height: 34,
        borderRadius: '50%',
        background: hex,
        border: on ? '3px solid var(--text)' : '3px solid transparent',
        boxShadow: on ? '0 0 0 2px var(--surface) inset' : 'none',
        cursor: 'pointer',
        transition: 'transform .12s ease',
        transform: on ? 'scale(1.08)' : 'none'
      }
    });
  }))), /*#__PURE__*/React.createElement(Field, {
    label: `Stickers · pick up to 3`
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8
    }
  }, STICKER_OPTIONS.map(s => {
    const on = u.stickers.includes(s);
    return /*#__PURE__*/React.createElement("button", {
      key: s,
      onClick: () => toggleSticker(s),
      style: {
        width: 42,
        height: 42,
        borderRadius: 'var(--r)',
        fontSize: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all .12s ease',
        background: on ? 'color-mix(in srgb, var(--primary) 14%, var(--surface))' : 'var(--surface)',
        border: `var(--hairline) solid ${on ? 'var(--primary)' : 'var(--border)'}`
      }
    }, s);
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      paddingTop: 20,
      borderTop: 'var(--hairline) solid var(--border)'
    }
  }, !confirmDel ? /*#__PURE__*/React.createElement("button", {
    onClick: () => setConfirmDel(true),
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--muted)',
      fontWeight: 700,
      fontSize: 13.5,
      padding: 0
    }
  }, "Delete account") : /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'color-mix(in srgb, var(--danger) 9%, var(--surface))',
      border: 'var(--hairline) solid color-mix(in srgb, var(--danger) 30%, transparent)',
      borderRadius: 'var(--r)',
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 14,
      color: 'var(--danger)'
    }
  }, "Delete your account?"), /*#__PURE__*/React.createElement("div", {
    className: "t-body",
    style: {
      fontSize: 12.5,
      margin: '6px 0 12px'
    }
  }, "This erases your profile, photo, and account immediately. There\u2019s no undo."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "na-btn",
    style: {
      flex: 1,
      padding: '11px',
      background: 'var(--danger)',
      color: '#fff'
    },
    onClick: () => setConfirmDel(false)
  }, "Delete everything"), /*#__PURE__*/React.createElement("button", {
    className: "na-btn na-btn--ghost",
    style: {
      flex: 1,
      padding: '11px'
    },
    onClick: () => setConfirmDel(false)
  }, "Cancel")))));
}

/* ═══════════════ TAB BAR ═══════════════ */
function TabBar({
  tab,
  onTab
}) {
  const tabs = [['grid', '👥', 'Nearby'], ['profile', '🏷️', 'My tag']];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 40,
      display: 'flex',
      background: 'var(--surface)',
      borderTop: 'var(--hairline) solid var(--border)',
      paddingBottom: 22,
      boxShadow: '0 -4px 20px rgba(61,43,31,0.05)'
    }
  }, tabs.map(([id, icon, label]) => {
    const on = tab === id;
    return /*#__PURE__*/React.createElement("button", {
      key: id,
      onClick: () => onTab(id),
      style: {
        flex: 1,
        padding: '11px 0 6px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 21,
        filter: on ? 'none' : 'grayscale(.6) opacity(.7)'
      }
    }, icon), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 800,
        fontSize: 11,
        letterSpacing: '.1em',
        textTransform: 'uppercase',
        color: on ? 'var(--primary)' : 'var(--muted)'
      }
    }, label), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 3,
        borderRadius: 99,
        marginTop: 1,
        background: on ? 'var(--primary)' : 'transparent'
      }
    }));
  }));
}
Object.assign(window, {
  Nearby,
  MyTag,
  TabBar
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "design_handoff_nametag_redesign/design_files/screens-app.jsx", error: String((e && e.message) || e) }); }

// design_handoff_nametag_redesign/design_files/screens-auth.jsx
try { (() => {
// screens-auth.jsx — Wordmark + AuthScreen (3 compositions: card / editorial / badge)
// Exports to window: Wordmark, AuthScreen

const {
  useState: useStateA
} = React;

/* Brand-styled wordmark: Playfair 900, coral italic "tag". */
function Wordmark({
  size = 34,
  block = false
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: size,
      letterSpacing: '-1.5px',
      color: 'var(--text)',
      lineHeight: 1,
      display: block ? 'block' : 'inline-block'
    }
  }, "Name", /*#__PURE__*/React.createElement("em", {
    style: {
      fontStyle: 'italic',
      color: 'var(--primary)'
    }
  }, "tag"));
}
function PwField({
  value,
  onChange,
  placeholder
}) {
  const [show, setShow] = useStateA(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("input", {
    className: "na-field",
    style: {
      paddingRight: 56
    },
    type: show ? 'text' : 'password',
    value: value,
    placeholder: placeholder,
    onChange: e => onChange(e.target.value)
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setShow(s => !s),
    style: {
      position: 'absolute',
      right: 14,
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontWeight: 800,
      fontSize: 12.5,
      color: 'var(--muted)',
      textTransform: 'uppercase',
      letterSpacing: '.08em'
    }
  }, show ? 'Hide' : 'Show'));
}
function AuthForm({
  onSignIn,
  onRegister,
  compact
}) {
  const [mode, setMode] = useStateA('login'); // login | register | forgot
  const [email, setEmail] = useStateA('');
  const [pw, setPw] = useStateA('');
  if (mode === 'forgot') {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setMode('login'),
      style: {
        alignSelf: 'flex-start',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--muted)',
        fontWeight: 700,
        fontSize: 13.5,
        padding: 0
      }
    }, "\u2190 Back to sign in"), /*#__PURE__*/React.createElement("div", {
      className: "t-h3",
      style: {
        fontSize: 19
      }
    }, "Forgot your password?"), /*#__PURE__*/React.createElement("div", {
      className: "t-body",
      style: {
        fontSize: 13.5,
        marginTop: -6
      }
    }, "Enter your email and we\u2019ll send a reset link your way."), /*#__PURE__*/React.createElement("input", {
      className: "na-field",
      type: "email",
      placeholder: "you@email.com",
      value: email,
      onChange: e => setEmail(e.target.value)
    }), /*#__PURE__*/React.createElement("button", {
      className: "na-btn",
      onClick: () => setMode('login')
    }, "Send reset link"));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      padding: 4,
      borderRadius: 'var(--r-pill)',
      background: 'var(--warm2)',
      border: 'var(--hairline) solid var(--border)'
    }
  }, [['login', 'Sign in'], ['register', 'Create account']].map(([m, label]) => /*#__PURE__*/React.createElement("button", {
    key: m,
    onClick: () => setMode(m),
    style: {
      flex: 1,
      padding: '9px 8px',
      borderRadius: 'var(--r-pill)',
      border: 'none',
      cursor: 'pointer',
      fontWeight: 800,
      fontSize: 13.5,
      background: mode === m ? 'var(--surface)' : 'transparent',
      color: mode === m ? 'var(--primary)' : 'var(--muted)',
      boxShadow: mode === m ? '0 2px 8px rgba(61,43,31,0.10)' : 'none',
      transition: 'all .15s ease'
    }
  }, label))), /*#__PURE__*/React.createElement("input", {
    className: "na-field",
    type: "email",
    placeholder: "you@email.com",
    value: email,
    onChange: e => setEmail(e.target.value)
  }), /*#__PURE__*/React.createElement(PwField, {
    value: pw,
    onChange: setPw,
    placeholder: mode === 'register' ? 'Password (8+ characters)' : 'Password'
  }), /*#__PURE__*/React.createElement("button", {
    className: "na-btn",
    onClick: mode === 'register' && onRegister ? onRegister : onSignIn
  }, mode === 'login' ? 'Sign in' : 'Create account'), mode === 'login' && /*#__PURE__*/React.createElement("button", {
    onClick: () => setMode('forgot'),
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--muted)',
      fontWeight: 700,
      fontSize: 13,
      marginTop: -2
    }
  }, "Forgot password?"));
}
function AuthScreen({
  onSignIn,
  onRegister,
  composition = 'card',
  accent
}) {
  const coral = 'var(--coral)';

  // shared card wrapper
  const card = children => /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface)',
      border: 'var(--hairline) solid var(--border)',
      borderRadius: 'var(--r)',
      boxShadow: 'var(--shadow-card)',
      padding: 22
    }
  }, children);
  if (composition === 'editorial') {
    return /*#__PURE__*/React.createElement("div", {
      className: "dotgrid",
      style: {
        minHeight: '100%',
        padding: '92px 26px 40px',
        display: 'flex',
        flexDirection: 'column'
      }
    }, /*#__PURE__*/React.createElement(Wordmark, {
      size: 22
    }), /*#__PURE__*/React.createElement("div", {
      className: "t-display",
      style: {
        fontSize: 46,
        marginTop: 'auto',
        marginBottom: 4
      }
    }, "Say ", /*#__PURE__*/React.createElement("em", null, "hello"), /*#__PURE__*/React.createElement("br", null), "to the room."), /*#__PURE__*/React.createElement("div", {
      className: "t-body",
      style: {
        fontSize: 15,
        maxWidth: 300,
        marginBottom: 26
      }
    }, "A digital \u201CHello, my name is\u201D badge. See who\u2019s nearby, share your name \u2014 and stay in control of when you\u2019re seen."), /*#__PURE__*/React.createElement(AuthForm, {
      onSignIn: onSignIn,
      onRegister: onRegister
    }));
  }
  if (composition === 'badge') {
    const demo = {
      name: 'Nametag',
      pronouns: 'say hi! 👋',
      tagline: 'See who’s nearby',
      stickers: ['👋', '🌟', '🎉'],
      distance: null
    };
    return /*#__PURE__*/React.createElement("div", {
      className: "dotgrid",
      style: {
        minHeight: '100%',
        padding: '78px 26px 40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        transform: 'rotate(-3deg)',
        marginBottom: 30
      }
    }, /*#__PURE__*/React.createElement(PersonCard, {
      person: demo,
      accent: accent,
      variant: "sticker",
      tilt: 0
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        width: '100%'
      }
    }, card(/*#__PURE__*/React.createElement(AuthForm, {
      onSignIn: onSignIn,
      onRegister: onRegister
    }))));
  }

  // default: centered card
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100%',
      padding: '96px 26px 40px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement(Wordmark, {
    size: 44
  }), /*#__PURE__*/React.createElement("div", {
    className: "t-body",
    style: {
      fontSize: 14,
      marginTop: 8
    }
  }, "See who\u2019s nearby. Say hello.")), card(/*#__PURE__*/React.createElement(AuthForm, {
    onSignIn: onSignIn,
    onRegister: onRegister
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "t-label"
  }, "Inspected by Cleo \uD83D\uDC31")));
}
Object.assign(window, {
  Wordmark,
  AuthScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "design_handoff_nametag_redesign/design_files/screens-auth.jsx", error: String((e && e.message) || e) }); }

// design_handoff_nametag_redesign/design_files/tweaks-panel.jsx
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)

/* BEGIN USAGE */
// tweaks-panel.jsx
// Reusable Tweaks shell + form-control helpers.
// Exports (to window): useTweaks, TweaksPanel, TweakSection, TweakRow, TweakSlider,
//   TweakToggle, TweakRadio, TweakSelect, TweakText, TweakNumber, TweakColor, TweakButton.
//
// Owns the host protocol (listens for __activate_edit_mode / __deactivate_edit_mode,
// posts __edit_mode_available / __edit_mode_set_keys / __edit_mode_dismissed) so
// individual prototypes don't re-roll it. Ships a consistent set of controls so you
// don't hand-draw <input type="range">, segmented radios, steppers, etc.
//
// Usage (in an HTML file that loads React + Babel):
//
//   const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
//     "primaryColor": "#D97757",
//     "palette": ["#D97757", "#29261b", "#f6f4ef"],
//     "fontSize": 16,
//     "density": "regular",
//     "dark": false
//   }/*EDITMODE-END*/;
//
//   function App() {
//     const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
//     return (
//       <div style={{ fontSize: t.fontSize, color: t.primaryColor }}>
//         Hello
//         <TweaksPanel>
//           <TweakSection label="Typography" />
//           <TweakSlider label="Font size" value={t.fontSize} min={10} max={32} unit="px"
//                        onChange={(v) => setTweak('fontSize', v)} />
//           <TweakRadio  label="Density" value={t.density}
//                        options={['compact', 'regular', 'comfy']}
//                        onChange={(v) => setTweak('density', v)} />
//           <TweakSection label="Theme" />
//           <TweakColor  label="Primary" value={t.primaryColor}
//                        options={['#D97757', '#2A6FDB', '#1F8A5B', '#7A5AE0']}
//                        onChange={(v) => setTweak('primaryColor', v)} />
//           <TweakColor  label="Palette" value={t.palette}
//                        options={[['#D97757', '#29261b', '#f6f4ef'],
//                                  ['#475569', '#0f172a', '#f1f5f9']]}
//                        onChange={(v) => setTweak('palette', v)} />
//           <TweakToggle label="Dark mode" value={t.dark}
//                        onChange={(v) => setTweak('dark', v)} />
//         </TweaksPanel>
//       </div>
//     );
//   }
//
// TweakRadio is the segmented control for 2–3 short options (auto-falls-back to
// TweakSelect past ~16/~10 chars per label); reach for TweakSelect directly when
// options are many or long. For color tweaks always curate 3-4 options rather than
// a free picker; an option can also be a whole 2–5 color palette (the stored value
// is the array). The Tweak* controls are a floor, not a ceiling — build custom
// controls inside the panel if a tweak calls for UI they don't cover.
/* END USAGE */
// ─────────────────────────────────────────────────────────────────────────────

const __TWEAKS_STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    transform:scale(var(--dc-inv-zoom,1));transform-origin:bottom right;
    background:rgba(250,249,247,.78);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0;
    scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.15) transparent}
  .twk-body::-webkit-scrollbar{width:8px}
  .twk-body::-webkit-scrollbar-track{background:transparent;margin:2px}
  .twk-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px;
    border:2px solid transparent;background-clip:content-box}
  .twk-body::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.25);
    border:2px solid transparent;background-clip:content-box}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;
    color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}

  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}

  .twk-field{appearance:none;box-sizing:border-box;width:100%;min-width:0;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;
    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  .twk-field:focus{border-color:rgba(0,0,0,.25);background:rgba(255,255,255,.85)}
  select.twk-field{padding-right:22px;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");
    background-repeat:no-repeat;background-position:right 8px center}

  .twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;
    border-radius:999px;background:rgba(0,0,0,.12);outline:none}
  .twk-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;
    width:14px;height:14px;border-radius:50%;background:#fff;
    border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}
  .twk-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
    background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}

  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg.dragging .twk-seg-thumb{transition:none}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:default;padding:4px 6px;line-height:1.2;
    overflow-wrap:anywhere}

  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:default;padding:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}

  .twk-num{display:flex;align-items:center;box-sizing:border-box;min-width:0;height:26px;padding:0 0 0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;background:rgba(255,255,255,.6)}
  .twk-num-lbl{font-weight:500;color:rgba(41,38,27,.6);cursor:ew-resize;
    user-select:none;padding-right:8px}
  .twk-num input{flex:1;min-width:0;height:100%;border:0;background:transparent;
    font:inherit;font-variant-numeric:tabular-nums;text-align:right;padding:0 8px 0 0;
    outline:none;color:inherit;-moz-appearance:textfield}
  .twk-num input::-webkit-inner-spin-button,.twk-num input::-webkit-outer-spin-button{
    -webkit-appearance:none;margin:0}
  .twk-num-unit{padding-right:8px;color:rgba(41,38,27,.45)}

  .twk-btn{appearance:none;height:26px;padding:0 12px;border:0;border-radius:7px;
    background:rgba(0,0,0,.78);color:#fff;font:inherit;font-weight:500;cursor:default}
  .twk-btn:hover{background:rgba(0,0,0,.88)}
  .twk-btn.secondary{background:rgba(0,0,0,.06);color:inherit}
  .twk-btn.secondary:hover{background:rgba(0,0,0,.1)}

  .twk-swatch{appearance:none;-webkit-appearance:none;width:56px;height:22px;
    border:.5px solid rgba(0,0,0,.1);border-radius:6px;padding:0;cursor:default;
    background:transparent;flex-shrink:0}
  .twk-swatch::-webkit-color-swatch-wrapper{padding:0}
  .twk-swatch::-webkit-color-swatch{border:0;border-radius:5.5px}
  .twk-swatch::-moz-color-swatch{border:0;border-radius:5.5px}

  .twk-chips{display:flex;gap:6px}
  .twk-chip{position:relative;appearance:none;flex:1;min-width:0;height:46px;
    padding:0;border:0;border-radius:6px;overflow:hidden;cursor:default;
    box-shadow:0 0 0 .5px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.06);
    transition:transform .12s cubic-bezier(.3,.7,.4,1),box-shadow .12s}
  .twk-chip:hover{transform:translateY(-1px);
    box-shadow:0 0 0 .5px rgba(0,0,0,.18),0 4px 10px rgba(0,0,0,.12)}
  .twk-chip[data-on="1"]{box-shadow:0 0 0 1.5px rgba(0,0,0,.85),
    0 2px 6px rgba(0,0,0,.15)}
  .twk-chip>span{position:absolute;top:0;bottom:0;right:0;width:34%;
    display:flex;flex-direction:column;box-shadow:-1px 0 0 rgba(0,0,0,.1)}
  .twk-chip>span>i{flex:1;box-shadow:0 -1px 0 rgba(0,0,0,.1)}
  .twk-chip>span>i:first-child{box-shadow:none}
  .twk-chip svg{position:absolute;top:6px;left:6px;width:13px;height:13px;
    filter:drop-shadow(0 1px 1px rgba(0,0,0,.3))}
`;

// ── useTweaks ───────────────────────────────────────────────────────────────
// Single source of truth for tweak values. setTweak persists via the host
// (__edit_mode_set_keys → host rewrites the EDITMODE block on disk).
function useTweaks(defaults) {
  const [values, setValues] = React.useState(defaults);
  // Accepts either setTweak('key', value) or setTweak({ key: value, ... }) so a
  // useState-style call doesn't write a "[object Object]" key into the persisted
  // JSON block.
  const setTweak = React.useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' && keyOrEdits !== null ? keyOrEdits : {
      [keyOrEdits]: val
    };
    setValues(prev => ({
      ...prev,
      ...edits
    }));
    window.parent.postMessage({
      type: '__edit_mode_set_keys',
      edits
    }, '*');
    // Same-window signal so in-page listeners (deck-stage rail thumbnails)
    // can react — the parent message only reaches the host, not peers.
    window.dispatchEvent(new CustomEvent('tweakchange', {
      detail: edits
    }));
  }, []);
  return [values, setTweak];
}

// ── TweaksPanel ─────────────────────────────────────────────────────────────
// Floating shell. Registers the protocol listener BEFORE announcing
// availability — if the announce ran first, the host's activate could land
// before our handler exists and the toolbar toggle would silently no-op.
// The close button posts __edit_mode_dismissed so the host's toolbar toggle
// flips off in lockstep; the host echoes __deactivate_edit_mode back which
// is what actually hides the panel.
function TweaksPanel({
  title = 'Tweaks',
  children
}) {
  const [open, setOpen] = React.useState(false);
  const dragRef = React.useRef(null);
  const offsetRef = React.useRef({
    x: 16,
    y: 16
  });
  const PAD = 16;
  const clampToViewport = React.useCallback(() => {
    const panel = dragRef.current;
    if (!panel) return;
    const w = panel.offsetWidth,
      h = panel.offsetHeight;
    const maxRight = Math.max(PAD, window.innerWidth - w - PAD);
    const maxBottom = Math.max(PAD, window.innerHeight - h - PAD);
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(PAD, offsetRef.current.y))
    };
    panel.style.right = offsetRef.current.x + 'px';
    panel.style.bottom = offsetRef.current.y + 'px';
  }, []);
  React.useEffect(() => {
    if (!open) return;
    clampToViewport();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', clampToViewport);
      return () => window.removeEventListener('resize', clampToViewport);
    }
    const ro = new ResizeObserver(clampToViewport);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [open, clampToViewport]);
  React.useEffect(() => {
    const onMsg = e => {
      const t = e?.data?.type;
      if (t === '__activate_edit_mode') setOpen(true);else if (t === '__deactivate_edit_mode') setOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({
      type: '__edit_mode_available'
    }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);
  const dismiss = () => {
    setOpen(false);
    window.parent.postMessage({
      type: '__edit_mode_dismissed'
    }, '*');
  };
  const onDragStart = e => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX,
      sy = e.clientY;
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    const move = ev => {
      offsetRef.current = {
        x: startRight - (ev.clientX - sx),
        y: startBottom - (ev.clientY - sy)
      };
      clampToViewport();
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };
  if (!open) return null;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("style", null, __TWEAKS_STYLE), /*#__PURE__*/React.createElement("div", {
    ref: dragRef,
    className: "twk-panel",
    "data-omelette-chrome": "",
    style: {
      right: offsetRef.current.x,
      bottom: offsetRef.current.y
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-hd",
    onMouseDown: onDragStart
  }, /*#__PURE__*/React.createElement("b", null, title), /*#__PURE__*/React.createElement("button", {
    className: "twk-x",
    "aria-label": "Close tweaks",
    onMouseDown: e => e.stopPropagation(),
    onClick: dismiss
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    className: "twk-body"
  }, children)));
}

// ── Layout helpers ──────────────────────────────────────────────────────────

function TweakSection({
  label,
  children
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "twk-sect"
  }, label), children);
}
function TweakRow({
  label,
  value,
  children,
  inline = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: inline ? 'twk-row twk-row-h' : 'twk-row'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label), value != null && /*#__PURE__*/React.createElement("span", {
    className: "twk-val"
  }, value)), children);
}

// ── Controls ────────────────────────────────────────────────────────────────

function TweakSlider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label,
    value: `${value}${unit}`
  }, /*#__PURE__*/React.createElement("input", {
    type: "range",
    className: "twk-slider",
    min: min,
    max: max,
    step: step,
    value: value,
    onChange: e => onChange(Number(e.target.value))
  }));
}
function TweakToggle({
  label,
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-row twk-row-h"
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "twk-toggle",
    "data-on": value ? '1' : '0',
    role: "switch",
    "aria-checked": !!value,
    onClick: () => onChange(!value)
  }, /*#__PURE__*/React.createElement("i", null)));
}
function TweakRadio({
  label,
  value,
  options,
  onChange
}) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  // The active value is read by pointer-move handlers attached for the lifetime
  // of a drag — ref it so a stale closure doesn't fire onChange for every move.
  const valueRef = React.useRef(value);
  valueRef.current = value;

  // Segments wrap mid-word once per-segment width runs out. The track is
  // ~248px (280 panel − 28 body pad − 4 seg pad), each button loses 12px
  // to its own padding, and 11.5px system-ui averages ~6.3px/char — so 2
  // options fit ~16 chars each, 3 fit ~10. Past that (or >3 options), fall
  // back to a dropdown rather than wrap.
  const labelLen = o => String(typeof o === 'object' ? o.label : o).length;
  const maxLen = options.reduce((m, o) => Math.max(m, labelLen(o)), 0);
  const fitsAsSegments = maxLen <= ({
    2: 16,
    3: 10
  }[options.length] ?? 0);
  if (!fitsAsSegments) {
    // <select> emits strings — map back to the original option value so the
    // fallback stays type-preserving (numbers, booleans) like the segment path.
    const resolve = s => {
      const m = options.find(o => String(typeof o === 'object' ? o.value : o) === s);
      return m === undefined ? s : typeof m === 'object' ? m.value : m;
    };
    return /*#__PURE__*/React.createElement(TweakSelect, {
      label: label,
      value: value,
      options: options,
      onChange: s => onChange(resolve(s))
    });
  }
  const opts = options.map(o => typeof o === 'object' ? o : {
    value: o,
    label: o
  });
  const idx = Math.max(0, opts.findIndex(o => o.value === value));
  const n = opts.length;
  const segAt = clientX => {
    const r = trackRef.current.getBoundingClientRect();
    const inner = r.width - 4;
    const i = Math.floor((clientX - r.left - 2) / inner * n);
    return opts[Math.max(0, Math.min(n - 1, i))].value;
  };
  const onPointerDown = e => {
    setDragging(true);
    const v0 = segAt(e.clientX);
    if (v0 !== valueRef.current) onChange(v0);
    const move = ev => {
      if (!trackRef.current) return;
      const v = segAt(ev.clientX);
      if (v !== valueRef.current) onChange(v);
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("div", {
    ref: trackRef,
    role: "radiogroup",
    onPointerDown: onPointerDown,
    className: dragging ? 'twk-seg dragging' : 'twk-seg'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-seg-thumb",
    style: {
      left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
      width: `calc((100% - 4px) / ${n})`
    }
  }), opts.map(o => /*#__PURE__*/React.createElement("button", {
    key: o.value,
    type: "button",
    role: "radio",
    "aria-checked": o.value === value
  }, o.label))));
}
function TweakSelect({
  label,
  value,
  options,
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("select", {
    className: "twk-field",
    value: value,
    onChange: e => onChange(e.target.value)
  }, options.map(o => {
    const v = typeof o === 'object' ? o.value : o;
    const l = typeof o === 'object' ? o.label : o;
    return /*#__PURE__*/React.createElement("option", {
      key: v,
      value: v
    }, l);
  })));
}
function TweakText({
  label,
  value,
  placeholder,
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("input", {
    className: "twk-field",
    type: "text",
    value: value,
    placeholder: placeholder,
    onChange: e => onChange(e.target.value)
  }));
}
function TweakNumber({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange
}) {
  const clamp = n => {
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  };
  const startRef = React.useRef({
    x: 0,
    val: 0
  });
  const onScrubStart = e => {
    e.preventDefault();
    startRef.current = {
      x: e.clientX,
      val: value
    };
    const decimals = (String(step).split('.')[1] || '').length;
    const move = ev => {
      const dx = ev.clientX - startRef.current.x;
      const raw = startRef.current.val + dx * step;
      const snapped = Math.round(raw / step) * step;
      onChange(clamp(Number(snapped.toFixed(decimals))));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-num"
  }, /*#__PURE__*/React.createElement("span", {
    className: "twk-num-lbl",
    onPointerDown: onScrubStart
  }, label), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: value,
    min: min,
    max: max,
    step: step,
    onChange: e => onChange(clamp(Number(e.target.value)))
  }), unit && /*#__PURE__*/React.createElement("span", {
    className: "twk-num-unit"
  }, unit));
}

// Relative-luminance contrast pick — checkmarks drawn over a swatch need to
// read on both #111 and #fafafa without per-option configuration. Hex input
// only (#rgb / #rrggbb); named or rgb()/hsl() colors fall through to "light".
function __twkIsLight(hex) {
  const h = String(hex).replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, c => c + c) : h.padEnd(6, '0');
  const n = parseInt(x.slice(0, 6), 16);
  if (Number.isNaN(n)) return true;
  const r = n >> 16 & 255,
    g = n >> 8 & 255,
    b = n & 255;
  return r * 299 + g * 587 + b * 114 > 148000;
}
const __TwkCheck = ({
  light
}) => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 14 14",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M3 7.2 5.8 10 11 4.2",
  fill: "none",
  strokeWidth: "2.2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  stroke: light ? 'rgba(0,0,0,.78)' : '#fff'
}));

// TweakColor — curated color/palette picker. Each option is either a single
// hex string or an array of 1-5 hex strings; the card adapts — a lone color
// renders solid, a palette renders colors[0] as the hero (left ~2/3) with the
// rest stacked in a sharp column on the right. onChange emits the
// option in the shape it was passed (string stays string, array stays array).
// Without options it falls back to the native color input for back-compat.
function TweakColor({
  label,
  value,
  options,
  onChange
}) {
  if (!options || !options.length) {
    return /*#__PURE__*/React.createElement("div", {
      className: "twk-row twk-row-h"
    }, /*#__PURE__*/React.createElement("div", {
      className: "twk-lbl"
    }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("input", {
      type: "color",
      className: "twk-swatch",
      value: value,
      onChange: e => onChange(e.target.value)
    }));
  }
  // Native <input type=color> emits lowercase hex per the HTML spec, so
  // compare case-insensitively. String() guards JSON.stringify(undefined),
  // which returns the primitive undefined (no .toLowerCase).
  const key = o => String(JSON.stringify(o)).toLowerCase();
  const cur = key(value);
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-chips",
    role: "radiogroup"
  }, options.map((o, i) => {
    const colors = Array.isArray(o) ? o : [o];
    const [hero, ...rest] = colors;
    const sup = rest.slice(0, 4);
    const on = key(o) === cur;
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      type: "button",
      className: "twk-chip",
      role: "radio",
      "aria-checked": on,
      "data-on": on ? '1' : '0',
      "aria-label": colors.join(', '),
      title: colors.join(' · '),
      style: {
        background: hero
      },
      onClick: () => onChange(o)
    }, sup.length > 0 && /*#__PURE__*/React.createElement("span", null, sup.map((c, j) => /*#__PURE__*/React.createElement("i", {
      key: j,
      style: {
        background: c
      }
    }))), on && /*#__PURE__*/React.createElement(__TwkCheck, {
      light: __twkIsLight(hero)
    }));
  })));
}
function TweakButton({
  label,
  onClick,
  secondary = false
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: secondary ? 'twk-btn secondary' : 'twk-btn',
    onClick: onClick
  }, label);
}
Object.assign(window, {
  useTweaks,
  TweaksPanel,
  TweakSection,
  TweakRow,
  TweakSlider,
  TweakToggle,
  TweakRadio,
  TweakSelect,
  TweakText,
  TweakNumber,
  TweakColor,
  TweakButton
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "design_handoff_nametag_redesign/design_files/tweaks-panel.jsx", error: String((e && e.message) || e) }); }

// monogram/design-canvas.jsx
try { (() => {
/* BEGIN USAGE */
// DesignCanvas.jsx — Figma-ish design canvas wrapper
// Warm gray grid bg + Sections + Artboards + PostIt notes.
// Exports (to window): DesignCanvas, DCSection, DCArtboard, DCPostIt.
// Artboards are reorderable (grip-drag), deletable, labels/titles are
// inline-editable, and any artboard can be opened in a fullscreen focus
// overlay (←/→/Esc). State persists to a .design-canvas.state.json sidecar
// via the host bridge. No assets, no deps.
//
// Usage:
//   <DesignCanvas>
//     <DCSection id="onboarding" title="Onboarding" subtitle="First-run variants">
//       <DCArtboard id="a" label="A · Dusk" width={260} height={480}>…</DCArtboard>
//       <DCArtboard id="b" label="B · Minimal" width={260} height={480}>…</DCArtboard>
//     </DCSection>
//   </DesignCanvas>
//
// Artboards are static design frames, not scroll regions — never use
// height: 100% + overflow: auto/scroll on inner elements; size each artboard
// to fit its content (explicit pixel height, or let it grow).
/* END USAGE */

const DC = {
  bg: '#f0eee9',
  grid: 'rgba(0,0,0,0.06)',
  label: 'rgba(60,50,40,0.7)',
  title: 'rgba(40,30,20,0.85)',
  subtitle: 'rgba(60,50,40,0.6)',
  postitBg: '#fef4a8',
  postitText: '#5a4a2a',
  font: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
};

// One-time CSS injection (classes are dc-prefixed so they don't collide with
// the hosted design's own styles).
if (typeof document !== 'undefined' && !document.getElementById('dc-styles')) {
  const s = document.createElement('style');
  s.id = 'dc-styles';
  s.textContent = ['.dc-editable{cursor:text;outline:none;white-space:nowrap;border-radius:3px;padding:0 2px;margin:0 -2px}', '.dc-editable:focus{background:#fff;box-shadow:0 0 0 1.5px #c96442}', '[data-dc-slot]{transition:transform .18s cubic-bezier(.2,.7,.3,1)}', '[data-dc-slot].dc-dragging{transition:none;z-index:10;pointer-events:none}', '[data-dc-slot].dc-dragging .dc-card{box-shadow:0 12px 40px rgba(0,0,0,.25),0 0 0 2px #c96442;transform:scale(1.02)}',
  // isolation:isolate contains artboard content's z-indexes so a
  // z-indexed child (sticky navbar etc.) can't paint over .dc-header or
  // the .dc-menu popover that drops into the top of the card.
  '.dc-card{isolation:isolate;transition:box-shadow .15s,transform .15s}', '.dc-card *{scrollbar-width:none}', '.dc-card *::-webkit-scrollbar{display:none}',
  // Per-artboard header: grip + label on the left, delete/expand on the
  // right. Single flex row; when the artboard's on-screen width is too
  // narrow for both the label yields (ellipsis, then hidden entirely below
  // ~4ch via the container query) and the buttons stay on the row.
  '.dc-header{position:absolute;bottom:100%;left:-4px;margin-bottom:calc(4px * var(--dc-inv-zoom,1));z-index:2;', '  display:flex;align-items:center;container-type:inline-size}', '.dc-labelrow{display:flex;align-items:center;gap:4px;height:24px;flex:1 1 auto;min-width:0}', '.dc-grip{flex:0 0 auto;cursor:grab;display:flex;align-items:center;padding:5px 4px;border-radius:4px;transition:background .12s,opacity .12s}', '.dc-grip:hover{background:rgba(0,0,0,.08)}', '.dc-grip:active{cursor:grabbing}', '.dc-labeltext{flex:1 1 auto;min-width:0;cursor:pointer;border-radius:4px;padding:3px 6px;', '  display:flex;align-items:center;transition:background .12s;overflow:hidden}',
  // Below ~4ch of label room: hide the label entirely, and drop the grip to
  // hover-only (same reveal rule as .dc-btns) so a narrow header is clean
  // until the card is moused.
  '@container (max-width: 110px){', '  .dc-labeltext{display:none}', '  .dc-grip{opacity:0}', '  [data-dc-slot]:hover .dc-grip{opacity:1}', '}', '.dc-labeltext:hover{background:rgba(0,0,0,.05)}', '.dc-labeltext .dc-editable{overflow:hidden;text-overflow:ellipsis;max-width:100%}', '.dc-labeltext .dc-editable:focus{overflow:visible;text-overflow:clip}', '.dc-btns{flex:0 0 auto;margin-left:auto;display:flex;gap:2px;opacity:0;transition:opacity .12s}', '[data-dc-slot]:hover .dc-btns,.dc-btns:has(.dc-menu){opacity:1}', '.dc-expand,.dc-kebab{width:22px;height:22px;border-radius:5px;border:none;cursor:pointer;padding:0;', '  background:transparent;color:rgba(60,50,40,.7);display:flex;align-items:center;justify-content:center;', '  font:inherit;transition:background .12s,color .12s}', '.dc-expand:hover,.dc-kebab:hover{background:rgba(0,0,0,.06);color:#2a251f}',
  // Slot hosting an open menu floats above later siblings (which otherwise
  // paint on top — same z-index:auto, later DOM order) so the popup isn't
  // clipped by the next card.
  '[data-dc-slot]:has(.dc-menu){z-index:10}', '.dc-menu{position:absolute;top:100%;right:0;margin-top:4px;background:#fff;border-radius:8px;', '  box-shadow:0 8px 28px rgba(0,0,0,.18),0 0 0 1px rgba(0,0,0,.05);padding:4px;min-width:160px;z-index:10}', '.dc-menu button{display:block;width:100%;padding:7px 10px;border:0;background:transparent;', '  border-radius:5px;font-family:inherit;font-size:13px;font-weight:500;line-height:1.2;', '  color:#29261b;cursor:pointer;text-align:left;transition:background .12s;white-space:nowrap}', '.dc-menu button:hover{background:rgba(0,0,0,.05)}', '.dc-menu hr{border:0;border-top:1px solid rgba(0,0,0,.08);margin:4px 2px}', '.dc-menu .dc-danger{color:#c96442}', '.dc-menu .dc-danger:hover{background:rgba(201,100,66,.1)}',
  // Chrome (titles / labels / buttons) counter-scales against the viewport
  // zoom so it stays a constant on-screen size. --dc-inv-zoom is set by
  // DCViewport on every transform update and inherits to all descendants —
  // any overlay inside the world (e.g. a TweaksPanel on an artboard) can use
  // it the same way.
  //
  // The header uses transform:scale (out-of-flow, so layout impact doesn't
  // matter) with its world-space width set to card-width / inv-zoom so that
  // after counter-scaling its on-screen width exactly matches the card's —
  // that's what lets the container query + text-overflow behave against the
  // card's visible edge at every zoom level.
  //
  // The section head uses CSS zoom instead of transform so its layout box
  // grows with the counter-scale, pushing the card row down — otherwise the
  // constant-screen-size title would overflow into the (shrinking) world-
  // space gap and overlap the artboard headers at low zoom.
  '.dc-header{width:calc((100% + 4px) / var(--dc-inv-zoom,1));', '  transform:scale(var(--dc-inv-zoom,1));transform-origin:bottom left}', '.dc-sectionhead{zoom:var(--dc-inv-zoom,1)}'].join('\n');
  document.head.appendChild(s);
}
const DCCtx = React.createContext(null);

// Recursively unwrap React.Fragment so <>…</> grouping doesn't hide
// DCSection/DCArtboard children from the type-based walks below.
function dcFlatten(children) {
  const out = [];
  React.Children.forEach(children, c => {
    if (c && c.type === React.Fragment) out.push(...dcFlatten(c.props.children));else out.push(c);
  });
  return out;
}

// ─────────────────────────────────────────────────────────────
// DesignCanvas — stateful wrapper around the pan/zoom viewport.
// Owns runtime state (per-section order, renamed titles/labels, hidden
// artboards, focused artboard). Order/titles/labels/hidden persist to a
// .design-canvas.state.json
// sidecar next to the HTML. Reads go via plain fetch() so the saved
// arrangement is visible anywhere the HTML + sidecar are served together
// (omelette preview, direct link, downloaded zip). Writes go through the
// host's window.omelette bridge — editing requires the omelette runtime.
// Focus is ephemeral.
// ─────────────────────────────────────────────────────────────
const DC_STATE_FILE = '.design-canvas.state.json';
function DesignCanvas({
  children,
  minScale,
  maxScale,
  style
}) {
  const [state, setState] = React.useState({
    sections: {},
    focus: null
  });
  // Hold rendering until the sidecar read settles so the saved order/titles
  // appear on first paint (no source-order flash). didRead gates writes until
  // the read settles so the empty initial state can't clobber a slow read;
  // skipNextWrite suppresses the one echo-write that would otherwise follow
  // hydration.
  const [ready, setReady] = React.useState(false);
  const didRead = React.useRef(false);
  const skipNextWrite = React.useRef(false);
  React.useEffect(() => {
    let off = false;
    fetch('./' + DC_STATE_FILE).then(r => r.ok ? r.json() : null).then(saved => {
      if (off || !saved || !saved.sections) return;
      skipNextWrite.current = true;
      setState(s => ({
        ...s,
        sections: saved.sections
      }));
    }).catch(() => {}).finally(() => {
      didRead.current = true;
      if (!off) setReady(true);
    });
    const t = setTimeout(() => {
      if (!off) setReady(true);
    }, 150);
    return () => {
      off = true;
      clearTimeout(t);
    };
  }, []);
  React.useEffect(() => {
    if (!didRead.current) return;
    if (skipNextWrite.current) {
      skipNextWrite.current = false;
      return;
    }
    const t = setTimeout(() => {
      window.omelette?.writeFile(DC_STATE_FILE, JSON.stringify({
        sections: state.sections
      })).catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [state.sections]);

  // Build registries synchronously from children so FocusOverlay can read
  // them in the same render. Fragments are flattened; wrapping in other
  // elements still opts out of focus/reorder.
  const registry = {}; // slotId -> { sectionId, artboard }
  const sectionMeta = {}; // sectionId -> { title, subtitle, slotIds[] }
  const sectionOrder = [];
  dcFlatten(children).forEach(sec => {
    if (!sec || sec.type !== DCSection) return;
    const sid = sec.props.id ?? sec.props.title;
    if (!sid) return;
    sectionOrder.push(sid);
    const persisted = state.sections[sid] || {};
    const abs = [];
    dcFlatten(sec.props.children).forEach(ab => {
      if (!ab || ab.type !== DCArtboard) return;
      const aid = ab.props.id ?? ab.props.label;
      if (aid) abs.push([aid, ab]);
    });
    // hidden is scoped to one source revision — when the agent regenerates
    // (artboard-ID set changes), prior deletes don't apply to new content.
    const srcKey = abs.map(([k]) => k).join('\x1f');
    const hidden = persisted.srcKey === srcKey ? persisted.hidden || [] : [];
    const srcIds = [];
    abs.forEach(([aid, ab]) => {
      if (hidden.includes(aid)) return;
      registry[`${sid}/${aid}`] = {
        sectionId: sid,
        artboard: ab
      };
      srcIds.push(aid);
    });
    const kept = (persisted.order || []).filter(k => srcIds.includes(k));
    sectionMeta[sid] = {
      title: persisted.title ?? sec.props.title,
      subtitle: sec.props.subtitle,
      slotIds: [...kept, ...srcIds.filter(k => !kept.includes(k))]
    };
  });
  const api = React.useMemo(() => ({
    state,
    section: id => state.sections[id] || {},
    patchSection: (id, p) => setState(s => ({
      ...s,
      sections: {
        ...s.sections,
        [id]: {
          ...s.sections[id],
          ...(typeof p === 'function' ? p(s.sections[id] || {}) : p)
        }
      }
    })),
    setFocus: slotId => setState(s => ({
      ...s,
      focus: slotId
    }))
  }), [state]);

  // Esc exits focus; any outside pointerdown commits an in-progress rename.
  React.useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') api.setFocus(null);
    };
    const onPd = e => {
      const ae = document.activeElement;
      if (ae && ae.isContentEditable && !ae.contains(e.target)) ae.blur();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPd, true);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPd, true);
    };
  }, [api]);
  return /*#__PURE__*/React.createElement(DCCtx.Provider, {
    value: api
  }, /*#__PURE__*/React.createElement(DCViewport, {
    minScale: minScale,
    maxScale: maxScale,
    style: style
  }, ready && children), state.focus && registry[state.focus] && /*#__PURE__*/React.createElement(DCFocusOverlay, {
    entry: registry[state.focus],
    sectionMeta: sectionMeta,
    sectionOrder: sectionOrder
  }));
}

// ─────────────────────────────────────────────────────────────
// DCViewport — transform-based pan/zoom (internal)
//
// Input mapping (Figma-style):
//   • trackpad pinch  → zoom   (ctrlKey wheel; Safari gesture* events)
//   • trackpad scroll → pan    (two-finger)
//   • mouse wheel     → zoom   (notched; distinguished from trackpad scroll)
//   • middle-drag / primary-drag-on-bg → pan
//
// Transform state lives in a ref and is written straight to the DOM
// (translate3d + will-change) so wheel ticks don't go through React —
// keeps pans at 60fps on dense canvases.
// ─────────────────────────────────────────────────────────────
function DCViewport({
  children,
  minScale = 0.1,
  maxScale = 8,
  style = {}
}) {
  const vpRef = React.useRef(null);
  const worldRef = React.useRef(null);
  const tf = React.useRef({
    x: 0,
    y: 0,
    scale: 1
  });
  // Persist viewport across reloads so the user lands back where they were
  // after an agent edit or browser refresh. The sandbox origin is already
  // per-project; pathname keeps multiple canvas files in one project apart.
  const tfKey = 'dc-viewport:' + location.pathname;
  const saveT = React.useRef(0);
  const lastPostedScale = React.useRef();
  const apply = React.useCallback(() => {
    const {
      x,
      y,
      scale
    } = tf.current;
    const el = worldRef.current;
    if (!el) return;
    el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
    // Exposed for zoom-invariant chrome (labels, buttons, TweaksPanel).
    el.style.setProperty('--dc-inv-zoom', String(1 / scale));
    // Keep the host toolbar's % readout in sync with the canvas scale. Pan
    // ticks leave scale unchanged — skip the cross-frame post for those.
    if (lastPostedScale.current !== scale) {
      lastPostedScale.current = scale;
      window.parent.postMessage({
        type: '__dc_zoom',
        scale
      }, '*');
    }
    clearTimeout(saveT.current);
    saveT.current = setTimeout(() => {
      try {
        localStorage.setItem(tfKey, JSON.stringify(tf.current));
      } catch {}
    }, 200);
  }, [tfKey]);
  React.useLayoutEffect(() => {
    const flush = () => {
      clearTimeout(saveT.current);
      try {
        localStorage.setItem(tfKey, JSON.stringify(tf.current));
      } catch {}
    };
    try {
      const s = JSON.parse(localStorage.getItem(tfKey) || 'null');
      if (s && Number.isFinite(s.x) && Number.isFinite(s.y) && Number.isFinite(s.scale)) {
        tf.current = {
          x: s.x,
          y: s.y,
          scale: Math.min(maxScale, Math.max(minScale, s.scale))
        };
        apply();
      }
    } catch {}
    // Flush on pagehide and unmount so a reload within the 200ms debounce
    // window doesn't drop the last pan/zoom.
    window.addEventListener('pagehide', flush);
    return () => {
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, []);
  React.useEffect(() => {
    const vp = vpRef.current;
    if (!vp) return;
    const zoomAt = (cx, cy, factor) => {
      const r = vp.getBoundingClientRect();
      const px = cx - r.left,
        py = cy - r.top;
      const t = tf.current;
      const next = Math.min(maxScale, Math.max(minScale, t.scale * factor));
      const k = next / t.scale;
      // --dc-inv-zoom consumers (.dc-sectionhead's CSS zoom, each section's
      // marginBottom) reflow on every scale change, vertically shifting the
      // world layout — so a world point mathematically pinned under the cursor
      // drifts as you zoom (content creeps up on zoom-in, down on zoom-out).
      // Anchor the DOM element under the cursor instead: record its screen Y,
      // apply the transform + --dc-inv-zoom, then cancel whatever vertical
      // drift the reflow introduced so it stays put on screen.
      let marker = null,
        markerY0 = 0;
      if (k !== 1) {
        const hit = document.elementFromPoint(cx, cy);
        marker = hit && hit.closest ? hit.closest('[data-dc-slot],[data-dc-section]') : null;
        if (marker) markerY0 = marker.getBoundingClientRect().top;
      }
      // keep the world point under the cursor fixed
      t.x = px - (px - t.x) * k;
      t.y = py - (py - t.y) * k;
      t.scale = next;
      apply();
      if (marker) {
        // A pure zoom around (cx, cy) maps screen Y → cy + (Y - cy) * k. Any
        // departure after the --dc-inv-zoom reflow is the layout drift.
        const drift = marker.getBoundingClientRect().top - (cy + (markerY0 - cy) * k);
        if (Math.abs(drift) > 0.1) {
          t.y -= drift;
          apply();
        }
      }
    };

    // Mouse-wheel vs trackpad-scroll heuristic. A physical wheel sends
    // line-mode deltas (Firefox) or large integer pixel deltas with no X
    // component (Chrome/Safari, typically multiples of 100/120). Trackpad
    // two-finger scroll sends small/fractional pixel deltas, often with
    // non-zero deltaX. ctrlKey is set by the browser for trackpad pinch.
    const isMouseWheel = e => e.deltaMode !== 0 || e.deltaX === 0 && Number.isInteger(e.deltaY) && Math.abs(e.deltaY) >= 40;
    const onWheel = e => {
      e.preventDefault();
      if (isGesturing) return; // Safari: gesture* owns the pinch — discard concurrent wheels
      if ((e.ctrlKey || e.metaKey) && !isMouseWheel(e)) {
        // trackpad pinch, or ctrl/cmd + smooth-scroll mouse. Notched
        // wheels fall through to the fixed-step branch below.
        zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.01));
      } else if (isMouseWheel(e)) {
        // notched mouse wheel — fixed-ratio step per click
        zoomAt(e.clientX, e.clientY, Math.exp(-Math.sign(e.deltaY) * 0.18));
      } else {
        // trackpad two-finger scroll — pan
        tf.current.x -= e.deltaX;
        tf.current.y -= e.deltaY;
        apply();
      }
    };

    // Safari sends native gesture* events for trackpad pinch with a smooth
    // e.scale; preferring these over the ctrl+wheel fallback gives a much
    // better feel there. No-ops on other browsers. Safari also fires
    // ctrlKey wheel events during the same pinch — isGesturing makes
    // onWheel drop those entirely so they neither zoom nor pan.
    let gsBase = 1;
    let isGesturing = false;
    const onGestureStart = e => {
      e.preventDefault();
      isGesturing = true;
      gsBase = tf.current.scale;
    };
    const onGestureChange = e => {
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, gsBase * e.scale / tf.current.scale);
    };
    const onGestureEnd = e => {
      e.preventDefault();
      isGesturing = false;
    };

    // Drag-pan: middle button anywhere, or primary button on canvas
    // background (anything that isn't an artboard or an inline editor).
    let drag = null;
    const onPointerDown = e => {
      const onBg = !e.target.closest('[data-dc-slot], .dc-editable');
      if (!(e.button === 1 || e.button === 0 && onBg)) return;
      e.preventDefault();
      vp.setPointerCapture(e.pointerId);
      drag = {
        id: e.pointerId,
        lx: e.clientX,
        ly: e.clientY
      };
      vp.style.cursor = 'grabbing';
    };
    const onPointerMove = e => {
      if (!drag || e.pointerId !== drag.id) return;
      tf.current.x += e.clientX - drag.lx;
      tf.current.y += e.clientY - drag.ly;
      drag.lx = e.clientX;
      drag.ly = e.clientY;
      apply();
    };
    const onPointerUp = e => {
      if (!drag || e.pointerId !== drag.id) return;
      vp.releasePointerCapture(e.pointerId);
      drag = null;
      vp.style.cursor = '';
    };

    // Host-driven zoom (toolbar % menu). Zooms around viewport centre so the
    // visible midpoint stays fixed — matching the host's iframe-zoom feel.
    const onHostMsg = e => {
      const d = e.data;
      if (d && d.type === '__dc_set_zoom' && typeof d.scale === 'number') {
        const r = vp.getBoundingClientRect();
        zoomAt(r.left + r.width / 2, r.top + r.height / 2, d.scale / tf.current.scale);
      } else if (d && d.type === '__dc_probe') {
        // Host's [readyGen] reset asks whether a canvas is present; it
        // fires on the iframe's native 'load', which for canvases with
        // images/fonts is after our mount-time announce, so re-announce.
        // Clear the pan-tick guard so apply() re-posts the current scale
        // even if it's unchanged — the host just reset dcScale to 1.
        window.parent.postMessage({
          type: '__dc_present'
        }, '*');
        lastPostedScale.current = undefined;
        apply();
      }
    };
    window.addEventListener('message', onHostMsg);
    // Announce canvas mode so the host toolbar proxies its % control here
    // instead of scaling the iframe element (which would just shrink the
    // viewport window of an infinite canvas). The apply() that follows emits
    // the initial __dc_zoom so the toolbar % is correct before first pinch.
    // lastPostedScale reset mirrors the __dc_probe handler: the layout
    // effect's restore-path apply() may already have posted the restored
    // scale (before __dc_present), so clear the guard to re-post it in order.
    window.parent.postMessage({
      type: '__dc_present'
    }, '*');
    lastPostedScale.current = undefined;
    apply();
    vp.addEventListener('wheel', onWheel, {
      passive: false
    });
    vp.addEventListener('gesturestart', onGestureStart, {
      passive: false
    });
    vp.addEventListener('gesturechange', onGestureChange, {
      passive: false
    });
    vp.addEventListener('gestureend', onGestureEnd, {
      passive: false
    });
    vp.addEventListener('pointerdown', onPointerDown);
    vp.addEventListener('pointermove', onPointerMove);
    vp.addEventListener('pointerup', onPointerUp);
    vp.addEventListener('pointercancel', onPointerUp);
    return () => {
      window.removeEventListener('message', onHostMsg);
      vp.removeEventListener('wheel', onWheel);
      vp.removeEventListener('gesturestart', onGestureStart);
      vp.removeEventListener('gesturechange', onGestureChange);
      vp.removeEventListener('gestureend', onGestureEnd);
      vp.removeEventListener('pointerdown', onPointerDown);
      vp.removeEventListener('pointermove', onPointerMove);
      vp.removeEventListener('pointerup', onPointerUp);
      vp.removeEventListener('pointercancel', onPointerUp);
    };
  }, [apply, minScale, maxScale]);
  const gridSvg = `url("data:image/svg+xml,%3Csvg width='120' height='120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M120 0H0v120' fill='none' stroke='${encodeURIComponent(DC.grid)}' stroke-width='1'/%3E%3C/svg%3E")`;
  return /*#__PURE__*/React.createElement("div", {
    ref: vpRef,
    className: "design-canvas",
    style: {
      height: '100vh',
      width: '100vw',
      background: DC.bg,
      overflow: 'hidden',
      overscrollBehavior: 'none',
      touchAction: 'none',
      position: 'relative',
      fontFamily: DC.font,
      boxSizing: 'border-box',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: worldRef,
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      transformOrigin: '0 0',
      willChange: 'transform',
      width: 'max-content',
      minWidth: '100%',
      minHeight: '100%',
      padding: '60px 0 80px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: -6000,
      backgroundImage: gridSvg,
      backgroundSize: '120px 120px',
      pointerEvents: 'none',
      zIndex: -1
    }
  }), children));
}

// ─────────────────────────────────────────────────────────────
// DCSection — editable title + h-row of artboards in persisted order
// ─────────────────────────────────────────────────────────────
function DCSection({
  id,
  title,
  subtitle,
  children,
  gap = 48
}) {
  const ctx = React.useContext(DCCtx);
  const sid = id ?? title;
  const all = React.Children.toArray(dcFlatten(children));
  const artboards = all.filter(c => c && c.type === DCArtboard);
  const rest = all.filter(c => !(c && c.type === DCArtboard));
  const sec = ctx && sid && ctx.section(sid) || {};
  // Must match DesignCanvas's srcKey computation exactly (it filters falsy
  // IDs), or onDelete persists a srcKey that DesignCanvas never recognizes.
  const allIds = artboards.map(a => a.props.id ?? a.props.label).filter(Boolean);
  const srcKey = allIds.join('\x1f');
  const hidden = sec.srcKey === srcKey ? sec.hidden || [] : [];
  const srcOrder = allIds.filter(k => !hidden.includes(k));
  const order = React.useMemo(() => {
    const kept = (sec.order || []).filter(k => srcOrder.includes(k));
    return [...kept, ...srcOrder.filter(k => !kept.includes(k))];
  }, [sec.order, srcOrder.join('|')]);
  const byId = Object.fromEntries(artboards.map(a => [a.props.id ?? a.props.label, a]));

  // marginBottom counter-scales so the on-screen gap between sections stays
  // constant — otherwise at low zoom the (world-space) gap collapses while
  // the screen-constant sectionhead below it doesn't, and the title reads as
  // belonging to the section above. paddingBottom below is just enough for
  // the 24px artboard-header (abs-positioned above each card) plus ~8px, so
  // the title sits tight against its own row at every zoom.
  return /*#__PURE__*/React.createElement("div", {
    "data-dc-section": sid,
    style: {
      marginBottom: 'calc(80px * var(--dc-inv-zoom, 1))',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 60px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "dc-sectionhead",
    style: {
      paddingBottom: 36
    }
  }, /*#__PURE__*/React.createElement(DCEditable, {
    tag: "div",
    value: sec.title ?? title,
    onChange: v => ctx && sid && ctx.patchSection(sid, {
      title: v
    }),
    style: {
      fontSize: 28,
      fontWeight: 600,
      color: DC.title,
      letterSpacing: -0.4,
      marginBottom: 6,
      display: 'inline-block'
    }
  }), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      color: DC.subtitle
    }
  }, subtitle))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap,
      padding: '0 60px',
      alignItems: 'flex-start',
      width: 'max-content'
    }
  }, order.map(k => /*#__PURE__*/React.createElement(DCArtboardFrame, {
    key: k,
    sectionId: sid,
    artboard: byId[k],
    order: order,
    label: (sec.labels || {})[k] ?? byId[k].props.label,
    onRename: v => ctx && ctx.patchSection(sid, x => ({
      labels: {
        ...x.labels,
        [k]: v
      }
    })),
    onReorder: next => ctx && ctx.patchSection(sid, {
      order: next
    }),
    onDelete: () => ctx && ctx.patchSection(sid, x => ({
      hidden: [...(x.srcKey === srcKey ? x.hidden || [] : []), k],
      srcKey
    })),
    onFocus: () => ctx && ctx.setFocus(`${sid}/${k}`)
  }))), rest);
}

// DCArtboard — marker; rendered by DCArtboardFrame via DCSection.
function DCArtboard() {
  return null;
}

// Per-artboard export (kind: 'png' | 'html'). Both paths share the same
// self-contained clone: computed styles baked in, @font-face / <img> /
// inline-style background-image urls inlined as data URIs. PNG wraps the
// clone in foreignObject→canvas at 3× the artboard's natural width×height
// (same pipeline the host uses for page captures); HTML wraps it in a
// minimal standalone document. Both are independent of viewport zoom.
async function dcExport(node, w, h, name, kind) {
  try {
    await document.fonts.ready;
  } catch {}
  const toDataURL = url => fetch(url).then(r => r.blob()).then(b => new Promise(res => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = () => res(url);
    fr.readAsDataURL(b);
  })).catch(() => url);

  // Collect @font-face rules. ss.cssRules throws SecurityError on
  // cross-origin sheets (e.g. fonts.googleapis.com) — in that case fetch
  // the CSS text directly (those endpoints send ACAO:*) and regex-extract
  // the blocks. @import and @media/@supports are walked so nested
  // @font-face rules aren't missed.
  const fontRules = [],
    pending = [],
    seen = new Set();
  const scrapeCss = href => {
    if (seen.has(href)) return;
    seen.add(href);
    pending.push(fetch(href).then(r => r.text()).then(css => {
      for (const m of css.match(/@font-face\s*{[^}]*}/g) || []) fontRules.push({
        css: m,
        base: href
      });
      for (const m of css.matchAll(/@import\s+(?:url\()?['"]?([^'")\s;]+)/g)) scrapeCss(new URL(m[1], href).href);
    }).catch(() => {}));
  };
  const walk = (rules, base) => {
    for (const r of rules) {
      if (r.type === CSSRule.FONT_FACE_RULE) fontRules.push({
        css: r.cssText,
        base
      });else if (r.type === CSSRule.IMPORT_RULE && r.styleSheet) {
        const ibase = r.styleSheet.href || base;
        try {
          walk(r.styleSheet.cssRules, ibase);
        } catch {
          scrapeCss(ibase);
        }
      } else if (r.cssRules) walk(r.cssRules, base);
    }
  };
  for (const ss of document.styleSheets) {
    const base = ss.href || location.href;
    try {
      walk(ss.cssRules, base);
    } catch {
      if (ss.href) scrapeCss(ss.href);
    }
  }
  while (pending.length) await pending.shift();
  const fontCss = (await Promise.all(fontRules.map(async rule => {
    let out = rule.css,
      m;
    const re = /url\((['"]?)([^'")]+)\1\)/g;
    while (m = re.exec(rule.css)) {
      if (m[2].indexOf('data:') === 0) continue;
      let abs;
      try {
        abs = new URL(m[2], rule.base).href;
      } catch {
        continue;
      }
      out = out.split(m[0]).join('url("' + (await toDataURL(abs)) + '")');
    }
    return out;
  }))).join('\n');
  const cloneStyled = src => {
    if (src.nodeType === 8 || src.nodeType === 1 && src.tagName === 'SCRIPT') return document.createTextNode('');
    const dst = src.cloneNode(false);
    if (src.nodeType === 1) {
      const cs = getComputedStyle(src);
      let txt = '';
      for (let i = 0; i < cs.length; i++) txt += cs[i] + ':' + cs.getPropertyValue(cs[i]) + ';';
      dst.setAttribute('style', txt + 'animation:none;transition:none;');
      if (src.tagName === 'CANVAS') try {
        const im = document.createElement('img');
        im.src = src.toDataURL();
        im.setAttribute('style', txt);
        return im;
      } catch {}
    }
    for (let c = src.firstChild; c; c = c.nextSibling) dst.appendChild(cloneStyled(c));
    return dst;
  };
  const clone = cloneStyled(node);
  clone.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
  // Drop the card's own shadow/radius so the export is a flush w×h rect;
  // the artboard's own background (if any) is already in the computed style.
  clone.style.boxShadow = 'none';
  clone.style.borderRadius = '0';
  const jobs = [];
  clone.querySelectorAll('img').forEach(el => {
    const s = el.getAttribute('src');
    if (s && s.indexOf('data:') !== 0) jobs.push(toDataURL(el.src).then(d => el.setAttribute('src', d)));
  });
  [clone, ...clone.querySelectorAll('*')].forEach(el => {
    const bg = el.style.backgroundImage;
    if (!bg) return;
    let m;
    const re = /url\(["']?([^"')]+)["']?\)/g;
    while (m = re.exec(bg)) {
      const tok = m[0],
        url = m[1];
      if (url.indexOf('data:') === 0) continue;
      jobs.push(toDataURL(url).then(d => {
        el.style.backgroundImage = el.style.backgroundImage.split(tok).join('url("' + d + '")');
      }));
    }
  });
  await Promise.all(jobs);
  const xml = new XMLSerializer().serializeToString(clone);
  const save = (blob, ext) => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name + '.' + ext;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  if (kind === 'html') {
    const html = '<!doctype html><html><head><meta charset="utf-8"><title>' + name + '</title>' + (fontCss ? '<style>' + fontCss + '</style>' : '') + '</head><body style="margin:0">' + xml + '</body></html>';
    return save(new Blob([html], {
      type: 'text/html'
    }), 'html');
  }

  // PNG: the SVG's own width/height must be the output resolution — an
  // <img>-loaded SVG rasterizes at its intrinsic size, so sizing it at 1×
  // and ctx.scale()-ing up would just upscale a 1× bitmap. viewBox maps the
  // w×h foreignObject onto the px·w × px·h SVG canvas so the browser renders
  // the HTML at full resolution.
  const px = 3;
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w * px + '" height="' + h * px + '" viewBox="0 0 ' + w + ' ' + h + '"><foreignObject width="' + w + '" height="' + h + '">' + (fontCss ? '<style><![CDATA[' + fontCss + ']]></style>' : '') + xml + '</foreignObject></svg>';
  const img = new Image();
  await new Promise((res, rej) => {
    img.onload = res;
    img.onerror = () => rej(new Error('svg load failed'));
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
  const cv = document.createElement('canvas');
  cv.width = w * px;
  cv.height = h * px;
  cv.getContext('2d').drawImage(img, 0, 0);
  cv.toBlob(blob => save(blob, 'png'), 'image/png');
}
function DCArtboardFrame({
  sectionId,
  artboard,
  label,
  order,
  onRename,
  onReorder,
  onFocus,
  onDelete
}) {
  const {
    id: rawId,
    label: rawLabel,
    width = 260,
    height = 480,
    children,
    style = {}
  } = artboard.props;
  const id = rawId ?? rawLabel;
  const ref = React.useRef(null);
  const cardRef = React.useRef(null);
  const menuRef = React.useRef(null);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [confirming, setConfirming] = React.useState(false);

  // ⋯ menu: close on any outside pointerdown. Two-click delete lives inside
  // the menu — first click arms the row, second commits; closing disarms.
  React.useEffect(() => {
    if (!menuOpen) {
      setConfirming(false);
      return;
    }
    const off = e => {
      if (!menuRef.current || !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('pointerdown', off, true);
    return () => document.removeEventListener('pointerdown', off, true);
  }, [menuOpen]);
  const doExport = kind => {
    setMenuOpen(false);
    if (!cardRef.current) return;
    const name = String(label || id || 'artboard').replace(/[^\w\s.-]+/g, '_');
    dcExport(cardRef.current, width, height, name, kind).catch(e => console.error('[design-canvas] export failed:', e));
  };

  // Live drag-reorder: dragged card sticks to cursor; siblings slide into
  // their would-be slots in real time via transforms. DOM order only
  // changes on drop.
  const onGripDown = e => {
    e.preventDefault();
    e.stopPropagation();
    const me = ref.current;
    // translateX is applied in local (pre-scale) space but pointer deltas and
    // getBoundingClientRect().left are screen-space — divide by the viewport's
    // current scale so the dragged card tracks the cursor at any zoom level.
    const scale = me.getBoundingClientRect().width / me.offsetWidth || 1;
    const peers = Array.from(document.querySelectorAll(`[data-dc-section="${sectionId}"] [data-dc-slot]`));
    const homes = peers.map(el => ({
      el,
      id: el.dataset.dcSlot,
      x: el.getBoundingClientRect().left
    }));
    const slotXs = homes.map(h => h.x);
    const startIdx = order.indexOf(id);
    const startX = e.clientX;
    let liveOrder = order.slice();
    me.classList.add('dc-dragging');
    const layout = () => {
      for (const h of homes) {
        if (h.id === id) continue;
        const slot = liveOrder.indexOf(h.id);
        h.el.style.transform = `translateX(${(slotXs[slot] - h.x) / scale}px)`;
      }
    };
    const move = ev => {
      const dx = ev.clientX - startX;
      me.style.transform = `translateX(${dx / scale}px)`;
      const cur = homes[startIdx].x + dx;
      let nearest = 0,
        best = Infinity;
      for (let i = 0; i < slotXs.length; i++) {
        const d = Math.abs(slotXs[i] - cur);
        if (d < best) {
          best = d;
          nearest = i;
        }
      }
      if (liveOrder.indexOf(id) !== nearest) {
        liveOrder = order.filter(k => k !== id);
        liveOrder.splice(nearest, 0, id);
        layout();
      }
    };
    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      const finalSlot = liveOrder.indexOf(id);
      me.classList.remove('dc-dragging');
      me.style.transform = `translateX(${(slotXs[finalSlot] - homes[startIdx].x) / scale}px)`;
      // After the settle transition, kill transitions + clear transforms +
      // commit the reorder in the same frame so there's no visual snap-back.
      setTimeout(() => {
        for (const h of homes) {
          h.el.style.transition = 'none';
          h.el.style.transform = '';
        }
        if (liveOrder.join('|') !== order.join('|')) onReorder(liveOrder);
        requestAnimationFrame(() => requestAnimationFrame(() => {
          for (const h of homes) h.el.style.transition = '';
        }));
      }, 180);
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    "data-dc-slot": id,
    style: {
      position: 'relative',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "dc-header",
    "data-omelette-chrome": "",
    style: {
      color: DC.label
    },
    onPointerDown: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "dc-labelrow"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dc-grip",
    onPointerDown: onGripDown,
    title: "Drag to reorder"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "9",
    height: "13",
    viewBox: "0 0 9 13",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "2",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "2",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "6.5",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "6.5",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "11",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "11",
    r: "1.1"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "dc-labeltext",
    onClick: onFocus,
    title: "Click to focus"
  }, /*#__PURE__*/React.createElement(DCEditable, {
    value: label,
    onChange: onRename,
    onClick: e => e.stopPropagation(),
    style: {
      fontSize: 15,
      fontWeight: 500,
      color: DC.label,
      lineHeight: 1
    }
  }))), /*#__PURE__*/React.createElement("div", {
    className: "dc-btns"
  }, /*#__PURE__*/React.createElement("div", {
    ref: menuRef,
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "dc-kebab",
    title: "More",
    onClick: () => setMenuOpen(o => !o)
  }, /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 12 12",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "2.5",
    cy: "6",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "6",
    cy: "6",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "9.5",
    cy: "6",
    r: "1.1"
  }))), menuOpen && /*#__PURE__*/React.createElement("div", {
    className: "dc-menu",
    onPointerDown: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => doExport('png')
  }, "Download PNG"), /*#__PURE__*/React.createElement("button", {
    onClick: () => doExport('html')
  }, "Download HTML"), /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement("button", {
    className: "dc-danger",
    onClick: () => {
      if (confirming) {
        setMenuOpen(false);
        onDelete();
      } else setConfirming(true);
    }
  }, confirming ? 'Click again to delete' : 'Delete'))), /*#__PURE__*/React.createElement("button", {
    className: "dc-expand",
    onClick: onFocus,
    title: "Focus"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 12 12",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M7 1h4v4M5 11H1V7M11 1L7.5 4.5M1 11l3.5-3.5"
  }))))), /*#__PURE__*/React.createElement("div", {
    ref: cardRef,
    className: "dc-card",
    style: {
      borderRadius: 2,
      boxShadow: '0 1px 3px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.06)',
      overflow: 'hidden',
      width,
      height,
      background: '#fff',
      ...style
    }
  }, children || /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#bbb',
      fontSize: 13,
      fontFamily: DC.font
    }
  }, id)));
}

// Inline rename — commits on blur or Enter.
function DCEditable({
  value,
  onChange,
  style,
  tag = 'span',
  onClick
}) {
  const T = tag;
  return /*#__PURE__*/React.createElement(T, {
    className: "dc-editable",
    contentEditable: true,
    suppressContentEditableWarning: true,
    onClick: onClick,
    onPointerDown: e => e.stopPropagation(),
    onBlur: e => onChange && onChange(e.currentTarget.textContent),
    onKeyDown: e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.currentTarget.blur();
      }
    },
    style: style
  }, value);
}

// ─────────────────────────────────────────────────────────────
// Focus mode — overlay one artboard; ←/→ within section, ↑/↓ across
// sections, Esc or backdrop click to exit.
// ─────────────────────────────────────────────────────────────
function DCFocusOverlay({
  entry,
  sectionMeta,
  sectionOrder
}) {
  const ctx = React.useContext(DCCtx);
  const {
    sectionId,
    artboard
  } = entry;
  const sec = ctx.section(sectionId);
  const meta = sectionMeta[sectionId];
  const peers = meta.slotIds;
  const aid = artboard.props.id ?? artboard.props.label;
  const idx = peers.indexOf(aid);
  const secIdx = sectionOrder.indexOf(sectionId);
  const go = d => {
    const n = peers[(idx + d + peers.length) % peers.length];
    if (n) ctx.setFocus(`${sectionId}/${n}`);
  };
  const goSection = d => {
    // Sections whose artboards are all deleted have slotIds:[] — step past
    // them to the next non-empty section so ↑/↓ doesn't dead-end.
    const n = sectionOrder.length;
    for (let i = 1; i < n; i++) {
      const ns = sectionOrder[((secIdx + d * i) % n + n) % n];
      const first = sectionMeta[ns] && sectionMeta[ns].slotIds[0];
      if (first) {
        ctx.setFocus(`${ns}/${first}`);
        return;
      }
    }
  };
  React.useEffect(() => {
    const k = e => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(-1);
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(1);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        goSection(-1);
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        goSection(1);
      }
    };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  });
  const {
    width = 260,
    height = 480,
    children
  } = artboard.props;
  const [vp, setVp] = React.useState({
    w: window.innerWidth,
    h: window.innerHeight
  });
  React.useEffect(() => {
    const r = () => setVp({
      w: window.innerWidth,
      h: window.innerHeight
    });
    window.addEventListener('resize', r);
    return () => window.removeEventListener('resize', r);
  }, []);
  const scale = Math.max(0.1, Math.min((vp.w - 200) / width, (vp.h - 260) / height, 2));
  const [ddOpen, setDd] = React.useState(false);
  const Arrow = ({
    dir,
    onClick
  }) => /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      onClick();
    },
    style: {
      position: 'absolute',
      top: '50%',
      [dir]: 28,
      transform: 'translateY(-50%)',
      border: 'none',
      background: 'rgba(255,255,255,.08)',
      color: 'rgba(255,255,255,.9)',
      width: 44,
      height: 44,
      borderRadius: 22,
      fontSize: 18,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background .15s'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'rgba(255,255,255,.18)',
    onMouseLeave: e => e.currentTarget.style.background = 'rgba(255,255,255,.08)'
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 18 18",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: dir === 'left' ? 'M11 3L5 9l6 6' : 'M7 3l6 6-6 6'
  })));

  // Portal to body so position:fixed is the real viewport regardless of any
  // transform on DesignCanvas's ancestors (including the canvas zoom itself).
  return ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
    onClick: () => ctx.setFocus(null),
    onWheel: e => e.preventDefault(),
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'rgba(24,20,16,.6)',
      backdropFilter: 'blur(14px)',
      fontFamily: DC.font,
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 72,
      display: 'flex',
      alignItems: 'flex-start',
      padding: '16px 20px 0',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setDd(o => !o),
    style: {
      border: 'none',
      background: 'transparent',
      color: '#fff',
      cursor: 'pointer',
      padding: '6px 8px',
      borderRadius: 6,
      textAlign: 'left',
      fontFamily: 'inherit'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18,
      fontWeight: 600,
      letterSpacing: -0.3
    }
  }, meta.title), /*#__PURE__*/React.createElement("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 11 11",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    style: {
      opacity: .7
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2 4l3.5 3.5L9 4"
  }))), meta.subtitle && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 13,
      opacity: .6,
      fontWeight: 400,
      marginTop: 2
    }
  }, meta.subtitle)), ddOpen && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '100%',
      left: 0,
      marginTop: 4,
      background: '#2a251f',
      borderRadius: 8,
      boxShadow: '0 8px 32px rgba(0,0,0,.4)',
      padding: 4,
      minWidth: 200,
      zIndex: 10
    }
  }, sectionOrder.filter(sid => sectionMeta[sid].slotIds.length).map(sid => /*#__PURE__*/React.createElement("button", {
    key: sid,
    onClick: () => {
      setDd(false);
      const f = sectionMeta[sid].slotIds[0];
      if (f) ctx.setFocus(`${sid}/${f}`);
    },
    style: {
      display: 'block',
      width: '100%',
      textAlign: 'left',
      border: 'none',
      cursor: 'pointer',
      background: sid === sectionId ? 'rgba(255,255,255,.1)' : 'transparent',
      color: '#fff',
      padding: '8px 12px',
      borderRadius: 5,
      fontSize: 14,
      fontWeight: sid === sectionId ? 600 : 400,
      fontFamily: 'inherit'
    }
  }, sectionMeta[sid].title)))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => ctx.setFocus(null),
    onMouseEnter: e => e.currentTarget.style.background = 'rgba(255,255,255,.12)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent',
    style: {
      border: 'none',
      background: 'transparent',
      color: 'rgba(255,255,255,.7)',
      width: 32,
      height: 32,
      borderRadius: 16,
      fontSize: 20,
      cursor: 'pointer',
      lineHeight: 1,
      transition: 'background .12s'
    }
  }, "\xD7")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 64,
      bottom: 56,
      left: 100,
      right: 100,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: width * scale,
      height: height * scale,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      height,
      transform: `scale(${scale})`,
      transformOrigin: 'top left',
      background: '#fff',
      borderRadius: 2,
      overflow: 'hidden',
      boxShadow: '0 20px 80px rgba(0,0,0,.4)'
    }
  }, children || /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#bbb'
    }
  }, aid))), /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      fontSize: 14,
      fontWeight: 500,
      opacity: .85,
      textAlign: 'center'
    }
  }, (sec.labels || {})[aid] ?? artboard.props.label, /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: .5,
      marginLeft: 10,
      fontVariantNumeric: 'tabular-nums'
    }
  }, idx + 1, " / ", peers.length))), /*#__PURE__*/React.createElement(Arrow, {
    dir: "left",
    onClick: () => go(-1)
  }), /*#__PURE__*/React.createElement(Arrow, {
    dir: "right",
    onClick: () => go(1)
  }), /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: 'absolute',
      bottom: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: 8
    }
  }, peers.map((p, i) => /*#__PURE__*/React.createElement("button", {
    key: p,
    onClick: () => ctx.setFocus(`${sectionId}/${p}`),
    style: {
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      width: 6,
      height: 6,
      borderRadius: 3,
      background: i === idx ? '#fff' : 'rgba(255,255,255,.3)'
    }
  })))), document.body);
}

// ─────────────────────────────────────────────────────────────
// Post-it — absolute-positioned sticky note
// ─────────────────────────────────────────────────────────────
function DCPostIt({
  children,
  top,
  left,
  right,
  bottom,
  rotate = -2,
  width = 180
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top,
      left,
      right,
      bottom,
      width,
      background: DC.postitBg,
      padding: '14px 16px',
      fontFamily: '"Comic Sans MS", "Marker Felt", "Segoe Print", cursive',
      fontSize: 14,
      lineHeight: 1.4,
      color: DC.postitText,
      boxShadow: '0 2px 8px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
      transform: `rotate(${rotate}deg)`,
      zIndex: 5
    }
  }, children);
}
Object.assign(window, {
  DesignCanvas,
  DCSection,
  DCArtboard,
  DCPostIt
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "monogram/design-canvas.jsx", error: String((e && e.message) || e) }); }

// monogram/monograms.jsx
try { (() => {
/* monograms.jsx — Spectacled NA color studies (concept #1 refined)
   No sparkle. Letters live inside two thick lenses. Brand palette only. */

const C = {
  ink: "#3D2B1F",
  coral: "#F5563F",
  teal: "#12C2B0",
  mustard: "#F0A500",
  cream: "#FFFBF5",
  warm: "#FFF5E8",
  surface: "#FFFFFF",
  border: "#E8DDD0"
};
function Frame({
  children,
  bg = C.cream
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      height: "100%",
      background: bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, children);
}

/* Parametrized spectacled monogram — no star.
   frame: glasses color · lens: lens fill · nColor/aColor: letter colors */
function Spectacles({
  frame,
  lens,
  nColor,
  aColor,
  bg
}) {
  return /*#__PURE__*/React.createElement(Frame, {
    bg: bg
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 340 180",
    width: "290"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M44 88 L14 76",
    stroke: frame,
    strokeWidth: "9",
    strokeLinecap: "round",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M296 88 L326 76",
    stroke: frame,
    strokeWidth: "9",
    strokeLinecap: "round",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M142 86 Q170 70 198 86",
    stroke: frame,
    strokeWidth: "9",
    strokeLinecap: "round",
    fill: "none"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "100",
    cy: "100",
    r: "56",
    fill: lens,
    stroke: frame,
    strokeWidth: "9"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "240",
    cy: "100",
    r: "56",
    fill: lens,
    stroke: frame,
    strokeWidth: "9"
  }), /*#__PURE__*/React.createElement("text", {
    x: "100",
    y: "125",
    textAnchor: "middle",
    fontFamily: "'Playfair Display',serif",
    fontWeight: "900",
    fontSize: "78",
    fill: nColor
  }, "N"), /*#__PURE__*/React.createElement("text", {
    x: "240",
    y: "125",
    textAnchor: "middle",
    fontFamily: "'Playfair Display',serif",
    fontWeight: "900",
    fontSize: "78",
    fill: aColor
  }, "A")));
}
function App() {
  return /*#__PURE__*/React.createElement(DesignCanvas, null, /*#__PURE__*/React.createElement(DCSection, {
    id: "teal",
    title: "Spectacled NA \u2014 teal, color placement",
    subtitle: "Where should the teal live \u2014 frames, letters, or a single accent?"
  }, /*#__PURE__*/React.createElement(DCArtboard, {
    id: "t1",
    label: "E \xB7 Teal frames \xB7 ink letters  (your pick)",
    width: 360,
    height: 240
  }, /*#__PURE__*/React.createElement(Spectacles, {
    frame: C.teal,
    lens: C.surface,
    nColor: C.ink,
    aColor: C.ink
  })), /*#__PURE__*/React.createElement(DCArtboard, {
    id: "t2",
    label: "Reverse \xB7 ink frames \xB7 teal letters",
    width: 360,
    height: 240
  }, /*#__PURE__*/React.createElement(Spectacles, {
    frame: C.ink,
    lens: C.surface,
    nColor: C.teal,
    aColor: C.teal
  })), /*#__PURE__*/React.createElement(DCArtboard, {
    id: "t3",
    label: "Two-tone \xB7 ink frames \xB7 teal A only",
    width: 360,
    height: 240
  }, /*#__PURE__*/React.createElement(Spectacles, {
    frame: C.ink,
    lens: C.surface,
    nColor: C.ink,
    aColor: C.teal
  })), /*#__PURE__*/React.createElement(DCArtboard, {
    id: "t4",
    label: "Accent \xB7 teal frames \xB7 teal A",
    width: 360,
    height: 240
  }, /*#__PURE__*/React.createElement(Spectacles, {
    frame: C.teal,
    lens: C.surface,
    nColor: C.ink,
    aColor: C.teal
  }))), /*#__PURE__*/React.createElement(DCSection, {
    id: "small",
    title: "At size \u2014 does it hold up small?",
    subtitle: "The real test for a logo / favicon"
  }, /*#__PURE__*/React.createElement(DCArtboard, {
    id: "s1",
    label: "E \xB7 teal frames",
    width: 150,
    height: 120
  }, /*#__PURE__*/React.createElement(Spectacles, {
    frame: C.teal,
    lens: C.surface,
    nColor: C.ink,
    aColor: C.ink
  })), /*#__PURE__*/React.createElement(DCArtboard, {
    id: "s2",
    label: "Reverse \xB7 teal letters",
    width: 150,
    height: 120
  }, /*#__PURE__*/React.createElement(Spectacles, {
    frame: C.ink,
    lens: C.surface,
    nColor: C.teal,
    aColor: C.teal
  })), /*#__PURE__*/React.createElement(DCArtboard, {
    id: "s3",
    label: "Two-tone \xB7 teal A",
    width: 150,
    height: 120
  }, /*#__PURE__*/React.createElement(Spectacles, {
    frame: C.ink,
    lens: C.surface,
    nColor: C.ink,
    aColor: C.teal
  }))));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "monogram/monograms.jsx", error: String((e && e.message) || e) }); }

// nametag-redesign/app.jsx
try { (() => {
// app.jsx — assembles the prototype: tweaks + state + iOS frame.

const {
  useState: useState0,
  useEffect: useEffect0
} = React;
const HEX_TO_KEY = Object.fromEntries(Object.entries(window.NAMETAG_ACCENTS).map(([k, v]) => [v.toUpperCase(), k]));
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
} /*EDITMODE-END*/;
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [you, setYou] = useState0({
    ...window.NAMETAG_DATA.you,
    radius: 100,
    alwaysVisible: true
  });
  const [visible, setVisible] = useState0(true);
  const [waves, setWaves] = useState0({});
  const sendWave = id => setWaves(w => ({
    ...w,
    [id]: 'sent'
  }));
  const [scale, setScale] = useState0(1);
  useEffect0(() => {
    const fit = () => setScale(Math.min(1, (window.innerHeight - 40) / 874, (window.innerWidth - 40) / 402));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  const people = window.NAMETAG_DATA.people;
  const themeClass = t.theme === 'Ink' ? 'theme-ink' : 'theme-cream';
  const dark = t.theme === 'Ink';
  const variant = t.badge === 'Editorial' ? 'editorial' : 'sticker';
  const layout = (t.layout || 'Grid').toLowerCase();
  const authComp = {
    Card: 'card',
    Editorial: 'editorial',
    Badge: 'badge'
  }[t.auth] || 'card';
  const accentMode = Array.isArray(t.accent) ? 'rainbow' : HEX_TO_KEY[String(t.accent).toUpperCase()] || 'coral';
  const primaryKey = HEX_TO_KEY[String(t.primary || '').toUpperCase()];
  const primaryHex = t.primary || '#06D6B8';
  // theme-aware: keyed colors ride the CSS var (ink overrides apply);
  // contrast is computed from the actual hex in play.
  const primaryVal = primaryKey ? `var(--${primaryKey})` : primaryHex;
  const contrastHex = dark && primaryKey ? window.NAMETAG_ACCENTS_INK[primaryKey] : primaryHex;
  const onPrimary = bestOn(contrastHex);
  const screen = t.screen || 'Nearby';
  const isAuth = screen === 'Sign in';
  const isOnboarding = screen === 'Welcome';
  const tab = screen === 'My tag' ? 'profile' : 'grid';
  const goTo = s => setTweak('screen', s);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: dark ? '#1A120C' : '#E7E2D8',
      padding: 20,
      boxSizing: 'border-box',
      transition: 'background .3s ease'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 402 * scale,
      height: 874 * scale,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      transform: `scale(${scale})`,
      transformOrigin: 'top left'
    }
  }, /*#__PURE__*/React.createElement(IOSDevice, {
    dark: dark
  }, /*#__PURE__*/React.createElement("div", {
    className: themeClass,
    style: {
      width: '100%',
      height: '100%',
      '--primary': primaryVal,
      '--on-primary': onPrimary
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "na-app"
  }, isAuth ? /*#__PURE__*/React.createElement(AuthScreen, {
    composition: authComp,
    accent: primaryVal,
    onSignIn: () => goTo('Nearby'),
    onRegister: () => goTo('Welcome')
  }) : isOnboarding ? /*#__PURE__*/React.createElement(OnboardingScreen, {
    you: you,
    setYou: setYou,
    onDone: () => goTo('Nearby')
  }) : /*#__PURE__*/React.createElement(React.Fragment, null, tab === 'grid' ? /*#__PURE__*/React.createElement(Nearby, {
    you: you,
    people: t.empty ? [] : people,
    accentMode: accentMode,
    variant: variant,
    tilt: t.tilt,
    layout: layout,
    visible: visible,
    onToggleVisible: () => setVisible(v => !v),
    waves: waves,
    onWave: sendWave,
    onEditTag: () => goTo('My tag')
  }) : /*#__PURE__*/React.createElement(MyTag, {
    you: you,
    setYou: setYou,
    accentMode: accentMode,
    variant: variant,
    tilt: t.tilt
  }), /*#__PURE__*/React.createElement(TabBar, {
    tab: tab,
    onTab: id => goTo(id === 'profile' ? 'My tag' : 'Nearby')
  }))))))), /*#__PURE__*/React.createElement(TweaksPanel, null, /*#__PURE__*/React.createElement(TweakSection, {
    label: "Flow"
  }), /*#__PURE__*/React.createElement(TweakSelect, {
    label: "Screen",
    value: screen,
    options: ['Sign in', 'Welcome', 'Nearby', 'My tag'],
    onChange: v => setTweak('screen', v)
  }), /*#__PURE__*/React.createElement(TweakRadio, {
    label: "Theme",
    value: t.theme,
    options: ['Cream', 'Ink'],
    onChange: v => setTweak('theme', v)
  }), /*#__PURE__*/React.createElement(TweakColor, {
    label: "Brand color",
    value: t.primary,
    options: ['#06D6B8', '#FFB300', '#FF3D9A', '#A86BFF', '#FF4733'],
    onChange: v => setTweak('primary', v)
  }), /*#__PURE__*/React.createElement(TweakSection, {
    label: "The badge"
  }), /*#__PURE__*/React.createElement(TweakRadio, {
    label: "Card style",
    value: t.badge,
    options: ['Sticker', 'Editorial'],
    onChange: v => setTweak('badge', v)
  }), /*#__PURE__*/React.createElement(TweakColor, {
    label: "Badge colors",
    value: t.accent,
    options: [RAINBOW, '#FF4733', '#06D6B8', '#FFB300', '#FF3D9A', '#A86BFF'],
    onChange: v => setTweak('accent', v)
  }), /*#__PURE__*/React.createElement(TweakSlider, {
    label: "Sticker tilt",
    value: t.tilt,
    min: 0,
    max: 6,
    step: 0.5,
    unit: "\xB0",
    onChange: v => setTweak('tilt', v)
  }), /*#__PURE__*/React.createElement(TweakSection, {
    label: "Nearby"
  }), /*#__PURE__*/React.createElement(TweakRadio, {
    label: "Layout",
    value: t.layout,
    options: ['Grid', 'Stacked', 'Radar'],
    onChange: v => setTweak('layout', v)
  }), /*#__PURE__*/React.createElement(TweakToggle, {
    label: "Empty state",
    value: !!t.empty,
    onChange: v => setTweak('empty', v)
  }), /*#__PURE__*/React.createElement(TweakSection, {
    label: "Sign in"
  }), /*#__PURE__*/React.createElement(TweakRadio, {
    label: "Composition",
    value: t.auth,
    options: ['Card', 'Editorial', 'Badge'],
    onChange: v => setTweak('auth', v)
  })));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "nametag-redesign/app.jsx", error: String((e && e.message) || e) }); }

// nametag-redesign/badge.jsx
try { (() => {
// badge.jsx — the nametag card. Two variants: 'sticker' (literal HELLO badge,
// reskinned) and 'editorial' (brand portrait card). Plus Avatar + accent helper.
// Exports to window: Avatar, PersonCard, resolveAccent

const ACCENTS = window.NAMETAG_ACCENTS;
const ACCENT_ORDER = window.NAMETAG_ACCENT_ORDER;
function resolveAccent(person, index, accentMode) {
  // Returns a CSS var reference so the Ink theme's deepened paintbox
  // applies automatically wherever the accent is used.
  const key = !accentMode || accentMode === 'rainbow' ? ACCENTS[person.accent] ? person.accent : ACCENT_ORDER[index % ACCENT_ORDER.length] : ACCENTS[accentMode] ? accentMode : 'coral';
  return `var(--${key})`;
}

// initials from a display name
function initials(name) {
  const parts = String(name).trim().split(/\s+/);
  return (parts[0]?.[0] || '?').toUpperCase();
}
function Avatar({
  person,
  size = 96,
  accent,
  ring = true
}) {
  const common = {
    width: size,
    height: size,
    borderRadius: '50%',
    flexShrink: 0,
    overflow: 'hidden',
    border: ring ? '4px solid var(--surface)' : 'none',
    boxShadow: ring ? 'var(--shadow-card)' : 'none'
  };
  if (person.photo) {
    return /*#__PURE__*/React.createElement("div", {
      style: common
    }, /*#__PURE__*/React.createElement("img", {
      src: person.photo,
      alt: person.name,
      style: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }
    }));
  }
  // initial-monogram avatar on accent tint — bright + on-brand, no fake faces
  return /*#__PURE__*/React.createElement("div", {
    style: {
      ...common,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `color-mix(in srgb, ${accent} 20%, var(--surface))`
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: size * 0.42,
      color: accent,
      lineHeight: 1,
      letterSpacing: '-1px'
    }
  }, initials(person.name)));
}
function distanceLabel(d) {
  if (d == null) return null;
  if (d < 10) return 'here';
  if (d < 100) return `~${Math.round(d / 5) * 5} m`;
  return `${Math.max(1, Math.round(d / 80))} min walk`;
}

/* ── Sticker variant — literal HELLO badge, brand-reskinned ── */
function StickerBadge({
  person,
  accent,
  tilt = 0
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: -16,
      zIndex: 2
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    person: person,
    size: 72,
    accent: accent
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 168,
      background: 'var(--surface)',
      borderRadius: 8,
      overflow: 'hidden',
      border: 'var(--hairline) solid var(--border)',
      boxShadow: 'var(--shadow-card)',
      transform: `rotate(${tilt}deg)`,
      transformOrigin: 'center top',
      paddingTop: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: accent,
      padding: '7px 14px 6px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 13,
      letterSpacing: '.2em',
      color: '#fff',
      lineHeight: 1.05
    }
  }, "HELLO"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 8,
      letterSpacing: '.16em',
      textTransform: 'uppercase',
      color: 'rgba(255,255,255,.92)'
    }
  }, "my name is")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 10px 8px',
      textAlign: 'center',
      minHeight: 56,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: person.name.length > 11 ? 22 : person.name.length > 7 ? 26 : 30,
      color: 'var(--text)',
      lineHeight: 1.05,
      letterSpacing: '-0.5px',
      overflowWrap: 'normal',
      wordBreak: 'keep-all',
      maxWidth: '100%'
    }
  }, person.name)), person.tagline && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 12px 8px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontWeight: 700,
      fontSize: 12.5,
      color: 'var(--muted)',
      lineHeight: 1.3
    }
  }, person.tagline)), person.stickers?.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      justifyContent: 'center',
      paddingBottom: 8
    }
  }, person.stickers.map((s, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      fontSize: 17
    }
  }, s))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 14px',
      background: `color-mix(in srgb, ${accent} 13%, var(--surface))`,
      borderTop: `1.5px solid color-mix(in srgb, ${accent} 28%, transparent)`
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 800,
      fontSize: 12.5,
      color: accent
    }
  }, person.pronouns), distanceLabel(person.distance) && /*#__PURE__*/React.createElement("span", {
    className: "t-label",
    style: {
      fontSize: 9.5,
      color: 'var(--muted)'
    }
  }, distanceLabel(person.distance)))));
}

/* ── Editorial variant — brand portrait card, sticker spirit kept ── */
function EditorialCard({
  person,
  accent
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      alignItems: 'center',
      background: 'var(--surface)',
      border: 'var(--hairline) solid var(--border)',
      borderLeft: `3px solid ${accent}`,
      borderRadius: 'var(--r)',
      boxShadow: 'var(--shadow-card)',
      padding: '14px 16px',
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    person: person,
    size: 58,
    accent: accent,
    ring: false
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: 21,
      color: 'var(--text)',
      letterSpacing: '-0.6px',
      lineHeight: 1.1,
      wordBreak: 'keep-all',
      overflowWrap: 'normal'
    }
  }, person.name), distanceLabel(person.distance) && /*#__PURE__*/React.createElement("span", {
    className: "t-label",
    style: {
      color: accent,
      flexShrink: 0,
      fontSize: 9.5,
      whiteSpace: 'nowrap'
    }
  }, distanceLabel(person.distance))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginTop: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 800,
      fontSize: 11,
      color: accent,
      background: `color-mix(in srgb, ${accent} 14%, var(--surface))`,
      border: `1.5px solid color-mix(in srgb, ${accent} 30%, transparent)`,
      borderRadius: 'var(--r-pill)',
      padding: '3px 10px',
      lineHeight: 1
    }
  }, person.pronouns), person.stickers?.length > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      gap: 3
    }
  }, person.stickers.map((s, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      fontSize: 14
    }
  }, s)))), person.tagline && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontWeight: 700,
      fontSize: 13.5,
      color: 'var(--muted)',
      marginTop: 7,
      lineHeight: 1.35
    }
  }, person.tagline)));
}

/* ── wave chip — corner indicator for sent/incoming waves ── */
function WaveChip({
  state,
  variant
}) {
  if (!state) return null;
  const sent = state === 'sent';
  const sticker = variant === 'sticker';
  return /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: sticker ? 46 : -7,
      left: sticker ? 2 : -6,
      zIndex: 6,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      background: sent ? 'var(--sage)' : 'var(--surface)',
      color: sent ? '#14301f' : 'var(--text)',
      border: sent ? 'none' : '1.5px solid var(--border)',
      fontWeight: 800,
      fontSize: 10,
      lineHeight: 1,
      whiteSpace: 'nowrap',
      padding: '4px 9px',
      borderRadius: 99,
      boxShadow: '0 2px 8px rgba(29,19,11,.16)',
      transform: 'rotate(-4deg)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12
    }
  }, "\uD83D\uDC4B"), sent ? 'hi sent' : 'says hi!');
}
function PersonCard({
  person,
  accent,
  variant = 'sticker',
  tilt = 0,
  waveState
}) {
  const card = variant === 'editorial' ? /*#__PURE__*/React.createElement(EditorialCard, {
    person: person,
    accent: accent
  }) : /*#__PURE__*/React.createElement(StickerBadge, {
    person: person,
    accent: accent,
    tilt: tilt
  });
  if (!waveState) return card;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: variant === 'editorial' ? '100%' : 'auto'
    }
  }, card, /*#__PURE__*/React.createElement(WaveChip, {
    state: waveState,
    variant: variant
  }));
}
Object.assign(window, {
  Avatar,
  PersonCard,
  resolveAccent,
  distanceLabel,
  ntInitials: initials
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "nametag-redesign/badge.jsx", error: String((e && e.message) || e) }); }

// nametag-redesign/data.js
try { (() => {
// data.js — seed people for the Nearby grid (global: window.NAMETAG_DATA)
// Accents are paintbox keys; avatars are initial-monograms except `you`.

window.NAMETAG_DATA = {
  you: {
    id: 'you',
    name: 'Nabil',
    pronouns: 'he/him',
    tagline: 'Curious about almost everything',
    accent: 'teal',
    stickers: ['📚', '🐱'],
    photo: 'assets/ProfilePicture.webp',
    distance: 0,
    you: true
  },
  people: [{
    id: 1,
    name: 'Marisol',
    pronouns: 'she/her',
    tagline: 'Always chasing good light',
    accent: 'teal',
    stickers: ['📷', '🌸'],
    distance: 8,
    wavedAtYou: true
  }, {
    id: 2,
    name: 'Devin',
    pronouns: 'he/him',
    tagline: 'Here mostly for the coffee',
    accent: 'mustard',
    stickers: ['☕', '📚'],
    distance: 21
  }, {
    id: 3,
    name: 'Priya',
    pronouns: 'she/they',
    tagline: 'Building tiny robots',
    accent: 'lavender',
    stickers: ['🤖', '🎨'],
    distance: 34
  }, {
    id: 4,
    name: 'Theo',
    pronouns: 'he/they',
    tagline: 'Ask me about ferments',
    accent: 'rose',
    stickers: ['🍕', '🌍'],
    distance: 47
  }, {
    id: 5,
    name: 'Amara',
    pronouns: 'they/them',
    tagline: 'Plant parent, loud laugher',
    accent: 'coral',
    stickers: ['🌈', '🎉'],
    distance: 60
  }, {
    id: 6,
    name: 'Jonas',
    pronouns: 'he/him',
    tagline: 'Vinyl and very long walks',
    accent: 'teal',
    stickers: ['🎸'],
    distance: 130
  }, {
    id: 7,
    name: 'Yuki',
    pronouns: 'she/her',
    tagline: 'Sketching strangers, kindly',
    accent: 'mustard',
    stickers: ['🎨', '🌟'],
    distance: 210
  }]
};

// Paintbox lookup (hex). Mirrors colors_and_type.css.
window.NAMETAG_ACCENTS = {
  coral: '#FF4733',
  teal: '#06D6B8',
  mustard: '#FFB300',
  rose: '#FF3D9A',
  lavender: '#A86BFF'
};

// Deepened variants for the Ink theme — same hues, less glow on dark.
window.NAMETAG_ACCENTS_INK = {
  coral: '#E04330',
  teal: '#0ABFA6',
  mustard: '#E0A000',
  rose: '#E83387',
  lavender: '#955EE8'
};
window.NAMETAG_ACCENT_ORDER = ['coral', 'teal', 'mustard', 'rose', 'lavender'];
})(); } catch (e) { __ds_ns.__errors.push({ path: "nametag-redesign/data.js", error: String((e && e.message) || e) }); }

// nametag-redesign/detail-sheet.jsx
try { (() => {
// detail-sheet.jsx — slide-up person detail sheet for the Nearby screen.
// Tapping a badge opens this inside the phone frame. Includes the
// "Say hi" wave action (state lives in app.jsx so it persists).
// Exports to window: DetailSheet

function DetailSheet({
  person,
  accent,
  waved,
  onWave,
  onClose,
  onEditTag
}) {
  if (!person) return null;
  const isYou = !!person.you;
  const dist = window.distanceLabel(person.distance);
  const incoming = !isYou && !!person.wavedAtYou;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 60
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "nt-scrim",
    onClick: onClose,
    style: {
      position: 'absolute',
      inset: 0,
      background: 'color-mix(in srgb, #1d130b 44%, transparent)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "nt-sheet",
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      background: 'var(--surface)',
      borderTop: 'var(--hairline) solid var(--border)',
      borderRadius: '22px 22px 0 0',
      boxShadow: '0 -12px 40px rgba(29,19,11,.25)',
      padding: '10px 24px calc(22px + 14px)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      display: 'flex',
      justifyContent: 'center',
      padding: '2px 0 12px',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 4.5,
      borderRadius: 99,
      background: 'var(--border)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    person: person,
    size: 92,
    accent: accent
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      letterSpacing: '-1px',
      fontSize: person.name.length > 11 ? 28 : 34,
      lineHeight: 1.05,
      color: 'var(--text)',
      marginTop: 12
    }
  }, person.name), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginTop: 9
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 800,
      fontSize: 12,
      color: accent,
      lineHeight: 1,
      background: `color-mix(in srgb, ${accent} 14%, var(--surface))`,
      border: `1.5px solid color-mix(in srgb, ${accent} 30%, transparent)`,
      borderRadius: 'var(--r-pill)',
      padding: '5px 12px'
    }
  }, person.pronouns), dist && /*#__PURE__*/React.createElement("span", {
    className: "t-label",
    style: {
      fontSize: 10
    }
  }, isYou ? 'this is you' : dist === 'here' ? 'right here' : dist.includes('walk') ? dist : `${dist} away`)), person.tagline && /*#__PURE__*/React.createElement("div", {
    className: "t-quote",
    style: {
      fontSize: 16.5,
      color: 'var(--muted)',
      marginTop: 12,
      maxWidth: 250
    }
  }, "\u201C", person.tagline, "\u201D"), person.stickers?.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      marginTop: 14
    }
  }, person.stickers.map((s, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      fontSize: 30,
      lineHeight: 1,
      display: 'inline-block',
      transform: `rotate(${i % 2 === 0 ? -6 : 6}deg)`,
      filter: 'drop-shadow(0 2px 3px rgba(29,19,11,.18))'
    }
  }, s))), /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      marginTop: 20
    }
  }, incoming && /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 12.5,
      color: 'var(--text)',
      marginBottom: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15
    }
  }, "\uD83D\uDC4B"), person.name, " said hi to you"), isYou ? /*#__PURE__*/React.createElement("button", {
    className: "na-btn",
    style: {
      width: '100%'
    },
    onClick: onEditTag
  }, "Edit my tag") : waved ? /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      padding: '13px',
      borderRadius: 'var(--r-pill)',
      background: 'color-mix(in srgb, var(--sage) 16%, var(--surface))',
      border: '1.5px solid color-mix(in srgb, var(--sage) 38%, transparent)',
      fontWeight: 800,
      fontSize: 14.5,
      color: 'var(--text)'
    }
  }, "Wave sent ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16
    }
  }, "\uD83D\uDC4B"), " \u2014 they\u2019ll see it on their tag") : /*#__PURE__*/React.createElement("button", {
    className: "na-btn",
    style: {
      width: '100%'
    },
    onClick: () => onWave(person.id)
  }, incoming ? 'Wave back' : 'Say hi', " ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16,
      verticalAlign: '-2px'
    }
  }, "\uD83D\uDC4B"))))));
}
Object.assign(window, {
  DetailSheet
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "nametag-redesign/detail-sheet.jsx", error: String((e && e.message) || e) }); }

// nametag-redesign/ios-frame.jsx
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)

/* BEGIN USAGE */
// iOS.jsx — Simplified iOS 26 (Liquid Glass) device frame
// Based on the iOS 26 UI Kit + Figma status bar spec. No assets, no deps.
// Exports (to window): IOSDevice, IOSStatusBar, IOSNavBar, IOSGlassPill, IOSList, IOSListRow, IOSKeyboard
//
// Usage — wrap your screen content in <IOSDevice> to get the bezel, status bar
// and home indicator (props: title, dark, keyboard):
//
//   <IOSDevice title="Settings">
//     ...your screen content...
//   </IOSDevice>
//   <IOSDevice dark title="Search" keyboard>…</IOSDevice>
/* END USAGE */

// ─────────────────────────────────────────────────────────────
// Status bar
// ─────────────────────────────────────────────────────────────
function IOSStatusBar({
  dark = false,
  time = '9:41'
}) {
  const c = dark ? '#fff' : '#000';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 154,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '21px 24px 19px',
      boxSizing: 'border-box',
      position: 'relative',
      zIndex: 20,
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 1.5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: '-apple-system, "SF Pro", system-ui',
      fontWeight: 590,
      fontSize: 17,
      lineHeight: '22px',
      color: c
    }
  }, time)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      paddingTop: 1,
      paddingRight: 1
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "19",
    height: "12",
    viewBox: "0 0 19 12"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "7.5",
    width: "3.2",
    height: "4.5",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "4.8",
    y: "5",
    width: "3.2",
    height: "7",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "9.6",
    y: "2.5",
    width: "3.2",
    height: "9.5",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "14.4",
    y: "0",
    width: "3.2",
    height: "12",
    rx: "0.7",
    fill: c
  })), /*#__PURE__*/React.createElement("svg", {
    width: "17",
    height: "12",
    viewBox: "0 0 17 12"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M8.5 3.2C10.8 3.2 12.9 4.1 14.4 5.6L15.5 4.5C13.7 2.7 11.2 1.5 8.5 1.5C5.8 1.5 3.3 2.7 1.5 4.5L2.6 5.6C4.1 4.1 6.2 3.2 8.5 3.2Z",
    fill: c
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8.5 6.8C9.9 6.8 11.1 7.3 12 8.2L13.1 7.1C11.8 5.9 10.2 5.1 8.5 5.1C6.8 5.1 5.2 5.9 3.9 7.1L5 8.2C5.9 7.3 7.1 6.8 8.5 6.8Z",
    fill: c
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "8.5",
    cy: "10.5",
    r: "1.5",
    fill: c
  })), /*#__PURE__*/React.createElement("svg", {
    width: "27",
    height: "13",
    viewBox: "0 0 27 13"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0.5",
    y: "0.5",
    width: "23",
    height: "12",
    rx: "3.5",
    stroke: c,
    strokeOpacity: "0.35",
    fill: "none"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "2",
    y: "2",
    width: "20",
    height: "9",
    rx: "2",
    fill: c
  }), /*#__PURE__*/React.createElement("path", {
    d: "M25 4.5V8.5C25.8 8.2 26.5 7.2 26.5 6.5C26.5 5.8 25.8 4.8 25 4.5Z",
    fill: c,
    fillOpacity: "0.4"
  }))));
}

// ─────────────────────────────────────────────────────────────
// Liquid glass pill — blur + tint + shine
// ─────────────────────────────────────────────────────────────
function IOSGlassPill({
  children,
  dark = false,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 44,
      minWidth: 44,
      borderRadius: 9999,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: dark ? '0 2px 6px rgba(0,0,0,0.35), 0 6px 16px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.07), 0 3px 10px rgba(0,0,0,0.06)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 9999,
      backdropFilter: 'blur(12px) saturate(180%)',
      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      background: dark ? 'rgba(120,120,128,0.28)' : 'rgba(255,255,255,0.5)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 9999,
      boxShadow: dark ? 'inset 1.5px 1.5px 1px rgba(255,255,255,0.15), inset -1px -1px 1px rgba(255,255,255,0.08)' : 'inset 1.5px 1.5px 1px rgba(255,255,255,0.7), inset -1px -1px 1px rgba(255,255,255,0.4)',
      border: dark ? '0.5px solid rgba(255,255,255,0.15)' : '0.5px solid rgba(0,0,0,0.06)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      alignItems: 'center',
      padding: '0 4px'
    }
  }, children));
}

// ─────────────────────────────────────────────────────────────
// Navigation bar — glass pills + large title
// ─────────────────────────────────────────────────────────────
function IOSNavBar({
  title = 'Title',
  dark = false,
  trailingIcon = true
}) {
  const muted = dark ? 'rgba(255,255,255,0.6)' : '#404040';
  const text = dark ? '#fff' : '#000';
  const pillIcon = content => /*#__PURE__*/React.createElement(IOSGlassPill, {
    dark: dark
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, content));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      paddingTop: 62,
      paddingBottom: 10,
      position: 'relative',
      zIndex: 5
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px'
    }
  }, pillIcon(/*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "20",
    viewBox: "0 0 12 20",
    fill: "none",
    style: {
      marginLeft: -1
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M10 2L2 10l8 8",
    stroke: muted,
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), trailingIcon && pillIcon(/*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "6",
    viewBox: "0 0 22 6"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "3",
    cy: "3",
    r: "2.5",
    fill: muted
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "3",
    r: "2.5",
    fill: muted
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "19",
    cy: "3",
    r: "2.5",
    fill: muted
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px',
      fontFamily: '-apple-system, system-ui',
      fontSize: 34,
      fontWeight: 700,
      lineHeight: '41px',
      color: text,
      letterSpacing: 0.4
    }
  }, title));
}

// ─────────────────────────────────────────────────────────────
// Grouped list (inset card, r:26) + row (52px)
// ─────────────────────────────────────────────────────────────
function IOSListRow({
  title,
  detail,
  icon,
  chevron = true,
  isLast = false,
  dark = false
}) {
  const text = dark ? '#fff' : '#000';
  const sec = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const ter = dark ? 'rgba(235,235,245,0.3)' : 'rgba(60,60,67,0.3)';
  const sep = dark ? 'rgba(84,84,88,0.65)' : 'rgba(60,60,67,0.12)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      minHeight: 52,
      padding: '0 16px',
      position: 'relative',
      fontFamily: '-apple-system, system-ui',
      fontSize: 17,
      letterSpacing: -0.43
    }
  }, icon && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 30,
      height: 30,
      borderRadius: 7,
      background: icon,
      marginRight: 12,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      color: text
    }
  }, title), detail && /*#__PURE__*/React.createElement("span", {
    style: {
      color: sec,
      marginRight: 6
    }
  }, detail), chevron && /*#__PURE__*/React.createElement("svg", {
    width: "8",
    height: "14",
    viewBox: "0 0 8 14",
    style: {
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M1 1l6 6-6 6",
    stroke: ter,
    strokeWidth: "2",
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })), !isLast && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      left: icon ? 58 : 16,
      height: 0.5,
      background: sep
    }
  }));
}
function IOSList({
  header,
  children,
  dark = false
}) {
  const hc = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const bg = dark ? '#1C1C1E' : '#fff';
  return /*#__PURE__*/React.createElement("div", null, header && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: '-apple-system, system-ui',
      fontSize: 13,
      color: hc,
      textTransform: 'uppercase',
      padding: '8px 36px 6px',
      letterSpacing: -0.08
    }
  }, header), /*#__PURE__*/React.createElement("div", {
    style: {
      background: bg,
      borderRadius: 26,
      margin: '0 16px',
      overflow: 'hidden'
    }
  }, children));
}

// ─────────────────────────────────────────────────────────────
// Device frame
// ─────────────────────────────────────────────────────────────
function IOSDevice({
  children,
  width = 402,
  height = 874,
  dark = false,
  title,
  keyboard = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      height,
      borderRadius: 48,
      overflow: 'hidden',
      position: 'relative',
      background: dark ? '#000' : '#F2F2F7',
      boxShadow: '0 40px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.12)',
      fontFamily: '-apple-system, system-ui, sans-serif',
      WebkitFontSmoothing: 'antialiased'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 11,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 126,
      height: 37,
      borderRadius: 24,
      background: '#000',
      zIndex: 50
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10
    }
  }, /*#__PURE__*/React.createElement(IOSStatusBar, {
    dark: dark
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }
  }, title !== undefined && /*#__PURE__*/React.createElement(IOSNavBar, {
    title: title,
    dark: dark
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto'
    }
  }, children), keyboard && /*#__PURE__*/React.createElement(IOSKeyboard, {
    dark: dark
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 60,
      height: 34,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-end',
      paddingBottom: 8,
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 139,
      height: 5,
      borderRadius: 100,
      background: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.25)'
    }
  })));
}

// ─────────────────────────────────────────────────────────────
// Keyboard — iOS 26 liquid glass
// ─────────────────────────────────────────────────────────────
function IOSKeyboard({
  dark = false
}) {
  const glyph = dark ? 'rgba(255,255,255,0.7)' : '#595959';
  const sugg = dark ? 'rgba(255,255,255,0.6)' : '#333';
  const keyBg = dark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.85)';

  // special-key icons
  const icons = {
    shift: /*#__PURE__*/React.createElement("svg", {
      width: "19",
      height: "17",
      viewBox: "0 0 19 17"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M9.5 1L1 9.5h4.5V16h8V9.5H18L9.5 1z",
      fill: glyph
    })),
    del: /*#__PURE__*/React.createElement("svg", {
      width: "23",
      height: "17",
      viewBox: "0 0 23 17"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M7 1h13a2 2 0 012 2v11a2 2 0 01-2 2H7l-6-7.5L7 1z",
      fill: "none",
      stroke: glyph,
      strokeWidth: "1.6",
      strokeLinejoin: "round"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M10 5l7 7M17 5l-7 7",
      stroke: glyph,
      strokeWidth: "1.6",
      strokeLinecap: "round"
    })),
    ret: /*#__PURE__*/React.createElement("svg", {
      width: "20",
      height: "14",
      viewBox: "0 0 20 14"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M18 1v6H4m0 0l4-4M4 7l4 4",
      fill: "none",
      stroke: "#fff",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }))
  };
  const key = (content, {
    w,
    flex,
    ret,
    fs = 25,
    k
  } = {}) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      height: 42,
      borderRadius: 8.5,
      flex: flex ? 1 : undefined,
      width: w,
      minWidth: 0,
      background: ret ? '#08f' : keyBg,
      boxShadow: '0 1px 0 rgba(0,0,0,0.075)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, "SF Compact", system-ui',
      fontSize: fs,
      fontWeight: 458,
      color: ret ? '#fff' : glyph
    }
  }, content);
  const row = (keys, pad = 0) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6.5,
      justifyContent: 'center',
      padding: `0 ${pad}px`
    }
  }, keys.map(l => key(l, {
    flex: true,
    k: l
  })));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 15,
      borderRadius: 27,
      overflow: 'hidden',
      padding: '11px 0 2px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxShadow: dark ? '0 -2px 20px rgba(0,0,0,0.09)' : '0 -1px 6px rgba(0,0,0,0.018), 0 -3px 20px rgba(0,0,0,0.012)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 27,
      backdropFilter: 'blur(12px) saturate(180%)',
      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      background: dark ? 'rgba(120,120,128,0.14)' : 'rgba(255,255,255,0.25)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 27,
      boxShadow: dark ? 'inset 1.5px 1.5px 1px rgba(255,255,255,0.15)' : 'inset 1.5px 1.5px 1px rgba(255,255,255,0.7), inset -1px -1px 1px rgba(255,255,255,0.4)',
      border: dark ? '0.5px solid rgba(255,255,255,0.15)' : '0.5px solid rgba(0,0,0,0.06)',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 20,
      alignItems: 'center',
      padding: '8px 22px 13px',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative'
    }
  }, ['"The"', 'the', 'to'].map((w, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, i > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1,
      height: 25,
      background: '#ccc',
      opacity: 0.3
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'center',
      fontFamily: '-apple-system, system-ui',
      fontSize: 17,
      color: sugg,
      letterSpacing: -0.43,
      lineHeight: '22px'
    }
  }, w)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 13,
      padding: '0 6.5px',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative'
    }
  }, row(['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p']), row(['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'], 20), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14.25,
      alignItems: 'center'
    }
  }, key(icons.shift, {
    w: 45,
    k: 'shift'
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6.5,
      flex: 1
    }
  }, ['z', 'x', 'c', 'v', 'b', 'n', 'm'].map(l => key(l, {
    flex: true,
    k: l
  }))), key(icons.del, {
    w: 45,
    k: 'del'
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      alignItems: 'center'
    }
  }, key('ABC', {
    w: 92.25,
    fs: 18,
    k: 'abc'
  }), key('', {
    flex: true,
    k: 'space'
  }), key(icons.ret, {
    w: 92.25,
    ret: true,
    k: 'ret'
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 56,
      width: '100%',
      position: 'relative'
    }
  }));
}
Object.assign(window, {
  IOSDevice,
  IOSStatusBar,
  IOSNavBar,
  IOSGlassPill,
  IOSList,
  IOSListRow,
  IOSKeyboard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "nametag-redesign/ios-frame.jsx", error: String((e && e.message) || e) }); }

// nametag-redesign/onboarding.jsx
try { (() => {
// onboarding.jsx — first-run "write your name on your tag" moment.
// Shown after Create account. The badge fills in live as you type.
// Exports to window: OnboardingScreen

const {
  useState: useStateO
} = React;
const OB_PRONOUNS = ['she/her', 'he/him', 'they/them', 'she/they', 'he/they'];
function OnboardingScreen({
  you,
  setYou,
  onDone
}) {
  const [name, setName] = useStateO('');
  const [pronouns, setPronouns] = useStateO('');
  const [accentKey, setAccentKey] = useStateO('teal');
  const ready = name.trim().length > 0;
  const draft = {
    name: name.trim() || ' ',
    pronouns: pronouns || ' ',
    tagline: '',
    stickers: [],
    distance: null,
    photo: null
  };
  const accentHex = `var(--${accentKey})`;
  const finish = () => {
    if (!ready) return;
    setYou(prev => ({
      ...prev,
      name: name.trim(),
      pronouns: pronouns || prev.pronouns,
      accent: accentKey
    }));
    onDone();
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "dotgrid no-sb",
    style: {
      height: '100%',
      width: '100%',
      overflowY: 'auto',
      padding: '70px 26px 40px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxSizing: 'border-box'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "t-label",
    style: {
      color: 'var(--primary)'
    }
  }, "One last thing"), /*#__PURE__*/React.createElement("div", {
    className: "t-display",
    style: {
      fontSize: 30,
      textAlign: 'center',
      marginTop: 8,
      lineHeight: 1.1
    }
  }, "Write your name", /*#__PURE__*/React.createElement("br", null), "on your ", /*#__PURE__*/React.createElement("em", null, "tag")), /*#__PURE__*/React.createElement("div", {
    className: "nt-pop",
    style: {
      marginTop: 22,
      marginBottom: 26,
      transform: 'rotate(-2deg)'
    }
  }, /*#__PURE__*/React.createElement(PersonCard, {
    person: draft,
    accent: accentHex,
    variant: "sticker",
    tilt: 0
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("input", {
    className: "na-field",
    autoFocus: true,
    type: "text",
    placeholder: "Your name",
    maxLength: 20,
    value: name,
    onChange: e => setName(e.target.value),
    style: {
      textAlign: 'center',
      fontWeight: 800,
      fontSize: 17
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      justifyContent: 'center'
    }
  }, OB_PRONOUNS.map(p => /*#__PURE__*/React.createElement("button", {
    key: p,
    className: "na-chip",
    "data-on": pronouns === p ? 'true' : 'false',
    onClick: () => setPronouns(prev => prev === p ? '' : p)
  }, p))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      justifyContent: 'center',
      marginTop: 2
    }
  }, window.NAMETAG_ACCENT_ORDER.map(k => /*#__PURE__*/React.createElement("button", {
    key: k,
    onClick: () => setAccentKey(k),
    "aria-label": k,
    style: {
      width: 34,
      height: 34,
      borderRadius: '50%',
      cursor: 'pointer',
      background: `var(--${k})`,
      border: accentKey === k ? '3px solid var(--text)' : '3px solid transparent',
      outline: 'var(--hairline) solid var(--border)',
      transition: 'transform .12s ease',
      transform: accentKey === k ? 'scale(1.12)' : 'none'
    }
  }))), /*#__PURE__*/React.createElement("button", {
    className: "na-btn",
    disabled: !ready,
    onClick: finish,
    style: {
      marginTop: 6,
      opacity: ready ? 1 : 0.45,
      cursor: ready ? 'pointer' : 'default'
    }
  }, "Stick it on \u2192"), /*#__PURE__*/React.createElement("div", {
    className: "t-label",
    style: {
      textAlign: 'center',
      fontSize: 9.5
    }
  }, "You can add a photo & stickers later")));
}
Object.assign(window, {
  OnboardingScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "nametag-redesign/onboarding.jsx", error: String((e && e.message) || e) }); }

// nametag-redesign/screens-app.jsx
try { (() => {
// screens-app.jsx — NearbyScreen (grid/stacked/radar), MyTagScreen, TabBar
// Exports to window: NearbyScreen, MyTagScreen, TabBar

const {
  useState: useS,
  useMemo: useM
} = React;
const PRONOUN_OPTIONS = ['she/her', 'he/him', 'they/them', 'she/they', 'he/they', 'custom'];
const STICKER_OPTIONS = ['👋', '🌟', '🎉', '🌈', '🦄', '🐉', '🌸', '🍕', '🎸', '📚', '🎨', '🌍', '☕', '🤖', '🐱', '🐶'];
const RADIUS_OPTIONS = [{
  v: 50,
  l: '50 m · same floor'
}, {
  v: 100,
  l: '100 m · a city block'
}, {
  v: 200,
  l: '200 m · nearby blocks'
}, {
  v: 500,
  l: '500 m · the neighborhood'
}, {
  v: 1000,
  l: '1 km · wider area'
}];

/* ── shared toggle ── */
function Toggle({
  on,
  onClick,
  color = 'var(--primary)'
}) {
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    style: {
      width: 46,
      height: 27,
      borderRadius: 99,
      cursor: 'pointer',
      flexShrink: 0,
      background: on ? color : 'var(--border)',
      position: 'relative',
      transition: 'background .18s ease'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 3,
      left: on ? 22 : 3,
      width: 21,
      height: 21,
      borderRadius: '50%',
      background: '#fff',
      boxShadow: '0 1px 3px rgba(0,0,0,.25)',
      transition: 'left .18s ease'
    }
  }));
}

/* ═══════════════ NEARBY ═══════════════ */
function Nearby({
  you,
  people,
  accentMode,
  variant,
  tilt,
  layout,
  visible,
  onToggleVisible,
  waves,
  onWave,
  onEditTag
}) {
  const [sel, setSel] = useS(null);
  const [refreshing, setRefreshing] = useS(false);
  const doRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };
  const all = useM(() => {
    const list = [];
    if (you?.name) list.push({
      ...you,
      you: true
    });
    const sorted = [...people].sort((a, b) => (a.distance ?? 1e9) - (b.distance ?? 1e9));
    return list.concat(sorted);
  }, [you, people]);
  const selAccent = sel ? resolveAccent(sel, all.findIndex(p => p.id === sel.id), accentMode) : null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "no-sb",
    style: {
      height: '100%',
      overflowY: 'auto',
      padding: '70px 18px 96px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "t-display",
    style: {
      fontSize: 38
    }
  }, "Near", /*#__PURE__*/React.createElement("em", null, "by")), /*#__PURE__*/React.createElement("div", {
    className: "t-label",
    style: {
      marginTop: 6
    }
  }, refreshing ? 'Scanning nearby…' : people.length === 0 ? 'Updated 9:41 · just you' : `Updated 9:41 · ${people.length} people`)), /*#__PURE__*/React.createElement("button", {
    className: "na-chip",
    style: {
      fontWeight: 800
    },
    onClick: doRefresh
  }, refreshing ? 'Scanning…' : 'Refresh →')), /*#__PURE__*/React.createElement("div", {
    onClick: onToggleVisible,
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      background: visible ? 'color-mix(in srgb, var(--sage) 14%, var(--surface))' : 'var(--warm2)',
      border: `var(--hairline) solid ${visible ? 'color-mix(in srgb, var(--sage) 34%, transparent)' : 'var(--border)'}`,
      borderRadius: 'var(--r)',
      padding: '13px 16px',
      marginBottom: 20,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 14,
      whiteSpace: 'nowrap'
    }
  }, visible ? 'You’re visible nearby' : 'You’re hidden right now'), /*#__PURE__*/React.createElement("div", {
    className: "t-body",
    style: {
      fontSize: 12.5,
      marginTop: 2,
      whiteSpace: 'nowrap'
    }
  }, visible ? 'Tap to slip out of view.' : 'Tap to share your name nearby.')), /*#__PURE__*/React.createElement(Toggle, {
    on: visible,
    onClick: () => {},
    color: "var(--sage)"
  })), refreshing ? /*#__PURE__*/React.createElement(SkeletonGrid, {
    variant: variant,
    layout: layout
  }) : people.length === 0 ? /*#__PURE__*/React.createElement(EmptyNearby, {
    you: you,
    accentMode: accentMode,
    variant: variant,
    tilt: tilt,
    visible: visible,
    onSelect: setSel
  }) : layout === 'radar' ? /*#__PURE__*/React.createElement(Radar, {
    you: you,
    people: people,
    accentMode: accentMode,
    visible: visible,
    onSelect: setSel
  }) : /*#__PURE__*/React.createElement(PeopleLayout, {
    all: all,
    accentMode: accentMode,
    variant: variant,
    tilt: tilt,
    layout: layout,
    visible: visible,
    onSelect: setSel,
    waves: waves
  })), /*#__PURE__*/React.createElement(DetailSheet, {
    person: sel,
    accent: selAccent,
    waved: !!(sel && waves && waves[sel.id]),
    onWave: onWave,
    onClose: () => setSel(null),
    onEditTag: () => {
      setSel(null);
      onEditTag && onEditTag();
    }
  }));
}

/* ── Loading skeleton — pulsing placeholder badges ── */
function SkeletonGrid({
  variant,
  layout
}) {
  const sticker = variant === 'sticker';
  const cols = layout === 'grid' && sticker ? 'repeat(2, 1fr)' : '1fr';
  const n = sticker ? 4 : 4;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: cols,
      columnGap: 14,
      rowGap: sticker ? 30 : 14,
      justifyItems: 'center',
      maxWidth: layout === 'stacked' ? 320 : '100%',
      margin: '0 auto'
    }
  }, Array.from({
    length: n
  }).map((_, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      animation: `nt-pulse 1.1s ease ${i * 0.12}s infinite alternate`
    }
  }, sticker ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 64,
      height: 64,
      borderRadius: '50%',
      background: 'var(--warm2)',
      border: 'var(--hairline) solid var(--border)',
      marginBottom: -14,
      zIndex: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 168,
      height: 150,
      borderRadius: 8,
      background: 'var(--surface)',
      border: 'var(--hairline) solid var(--border)',
      paddingTop: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 28,
      background: 'var(--warm2)',
      margin: '0 0 14px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 14,
      background: 'var(--warm2)',
      borderRadius: 99,
      margin: '0 28px 8px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 10,
      background: 'var(--warm2)',
      borderRadius: 99,
      margin: '0 40px'
    }
  }))) : /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      height: 86,
      borderRadius: 'var(--r)',
      background: 'var(--surface)',
      border: 'var(--hairline) solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '0 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 58,
      height: 58,
      borderRadius: '50%',
      background: 'var(--warm2)',
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 16,
      background: 'var(--warm2)',
      borderRadius: 99,
      width: '55%',
      marginBottom: 9
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 11,
      background: 'var(--warm2)',
      borderRadius: 99,
      width: '80%'
    }
  }))))));
}

/* ── Empty state — you're the first one here ── */
function EmptyNearby({
  you,
  accentMode,
  variant,
  tilt,
  visible,
  onSelect
}) {
  const accent = resolveAccent(you, 0, accentMode);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "nt-tappable",
    onClick: () => onSelect({
      ...you,
      you: true
    }),
    style: {
      cursor: 'pointer',
      opacity: visible ? 1 : 0.4,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement(PersonCard, {
    person: you,
    accent: accent,
    variant: variant,
    tilt: variant === 'sticker' ? -tilt : 0
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: variant === 'sticker' ? -6 : 8,
      right: variant === 'sticker' ? 12 : 10,
      zIndex: 5,
      background: 'var(--text)',
      color: 'var(--bg)',
      fontWeight: 800,
      fontSize: 9,
      letterSpacing: '.12em',
      padding: '3px 8px',
      borderRadius: 99,
      textTransform: 'uppercase'
    }
  }, "You")), variant === 'sticker' && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 150,
      alignSelf: 'stretch',
      minHeight: 200,
      marginTop: 28,
      border: '2px dashed color-mix(in srgb, var(--muted) 38%, transparent)',
      borderRadius: 10,
      transform: `rotate(${tilt || 2}deg)`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      padding: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 26
    }
  }, "\uD83D\uDC4B"), /*#__PURE__*/React.createElement("span", {
    className: "t-quote",
    style: {
      fontSize: 13.5,
      color: 'var(--muted)',
      textAlign: 'center'
    }
  }, "this spot\u2019s free"))), /*#__PURE__*/React.createElement("div", {
    className: "t-h2",
    style: {
      fontSize: 24,
      marginTop: 30,
      textAlign: 'center',
      whiteSpace: 'nowrap'
    }
  }, "No tags nearby ", /*#__PURE__*/React.createElement("em", {
    style: {
      color: 'var(--primary)'
    }
  }, "yet")), /*#__PURE__*/React.createElement("div", {
    className: "t-body",
    style: {
      fontSize: 14,
      color: 'var(--muted)',
      textAlign: 'center',
      maxWidth: 250,
      marginTop: 9,
      lineHeight: 1.55
    }
  }, "You\u2019re the first one here. Stay visible \u2014 when someone arrives, their tag shows up right beside yours."));
}
function PeopleLayout({
  all,
  accentMode,
  variant,
  tilt,
  layout,
  visible,
  onSelect,
  waves
}) {
  const isGrid = layout === 'grid';
  const cols = isGrid && variant === 'sticker' ? 'repeat(2, 1fr)' : '1fr';
  const rowGap = variant === 'sticker' ? 30 : 14;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: cols,
      columnGap: 14,
      rowGap,
      justifyItems: variant === 'sticker' ? 'center' : 'stretch',
      maxWidth: layout === 'stacked' ? 320 : '100%',
      margin: '0 auto'
    }
  }, all.map((p, i) => {
    const accent = resolveAccent(p, i, accentMode);
    const dim = p.you && !visible;
    const waveState = !p.you ? waves && waves[p.id] ? 'sent' : p.wavedAtYou ? 'incoming' : null : null;
    return /*#__PURE__*/React.createElement("div", {
      key: p.id,
      onClick: () => onSelect && onSelect(p),
      className: "nt-tappable",
      style: {
        position: 'relative',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        opacity: dim ? 0.4 : 1,
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement(PersonCard, {
      person: p,
      accent: accent,
      variant: variant,
      tilt: variant === 'sticker' ? i % 2 === 0 ? -tilt : tilt : 0,
      waveState: waveState
    }), p.you && /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        top: variant === 'sticker' ? -6 : 8,
        right: variant === 'sticker' ? 18 : 10,
        zIndex: 5,
        background: 'var(--text)',
        color: 'var(--bg)',
        fontWeight: 800,
        fontSize: 9,
        letterSpacing: '.12em',
        padding: '3px 8px',
        borderRadius: 99,
        textTransform: 'uppercase'
      }
    }, "You"));
  }));
}

/* ── Radar layout — spatial map on a dotted grid ── */
function Radar({
  you,
  people,
  accentMode,
  visible,
  onSelect
}) {
  const SIZE = 320,
    C = SIZE / 2;
  const maxD = Math.max(...people.map(p => p.distance), 100);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "dotgrid",
    style: {
      position: 'relative',
      width: '100%',
      maxWidth: SIZE,
      aspectRatio: '1',
      margin: '0 auto',
      borderRadius: 'var(--r)',
      border: 'var(--hairline) solid var(--border)',
      overflow: 'hidden',
      background: 'var(--surface)'
    }
  }, [0.4, 0.72, 1].map((f, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      position: 'absolute',
      left: '50%',
      top: '50%',
      width: `${f * 88}%`,
      height: `${f * 88}%`,
      transform: 'translate(-50%,-50%)',
      borderRadius: '50%',
      border: '1.5px dashed color-mix(in srgb, var(--muted) 35%, transparent)'
    }
  })), /*#__PURE__*/React.createElement(Pin, {
    person: you,
    accent: "var(--primary)",
    x: C,
    y: C,
    size: 52,
    you: true,
    dim: !visible,
    onClick: () => onSelect({
      ...you,
      you: true
    })
  }), people.map((p, i) => {
    const ang = (i * 49 + 20) * Math.PI / 180;
    const r = (0.22 + 0.66 * (p.distance / maxD)) * (SIZE * 0.44);
    const x = C + r * Math.cos(ang),
      y = C + r * Math.sin(ang);
    return /*#__PURE__*/React.createElement(Pin, {
      key: p.id,
      person: p,
      accent: resolveAccent(p, i, accentMode),
      x: x,
      y: y,
      size: 40,
      onClick: () => onSelect(p)
    });
  })), /*#__PURE__*/React.createElement("div", {
    className: "t-label",
    style: {
      textAlign: 'center',
      marginTop: 12
    }
  }, "Tap a face to see their tag"));
}
function Pin({
  person,
  accent,
  x,
  y,
  size,
  you,
  dim,
  onClick
}) {
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    style: {
      position: 'absolute',
      left: x,
      top: y,
      transform: 'translate(-50%,-50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 3,
      cursor: 'pointer',
      opacity: dim ? 0.4 : 1,
      zIndex: you ? 4 : 3
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    person: person,
    size: size,
    accent: accent
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 800,
      fontSize: 10,
      color: 'var(--text)',
      background: 'var(--surface)',
      padding: '1px 7px',
      borderRadius: 99,
      border: 'var(--hairline) solid var(--border)',
      whiteSpace: 'nowrap'
    }
  }, you ? 'You' : person.name));
}

/* ═══════════════ MY TAG ═══════════════ */
function Field({
  label,
  count,
  max,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 7
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 800,
      fontSize: 13.5,
      color: 'var(--text)'
    }
  }, label), max != null && /*#__PURE__*/React.createElement("span", {
    className: "t-label",
    style: {
      color: count > max - 5 ? 'var(--primary)' : 'var(--muted)'
    }
  }, count, "/", max)), children);
}
function MyTag({
  you,
  setYou,
  accentMode,
  variant,
  tilt
}) {
  const [confirmDel, setConfirmDel] = useS(false);
  const u = you;
  const set = patch => setYou({
    ...u,
    ...patch
  });
  const accent = resolveAccent(u, 0, accentMode);
  const toggleSticker = s => {
    const has = u.stickers.includes(s);
    if (has) set({
      stickers: u.stickers.filter(x => x !== s)
    });else if (u.stickers.length < 3) set({
      stickers: [...u.stickers, s]
    });
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "no-sb",
    style: {
      height: '100%',
      overflowY: 'auto',
      padding: '70px 22px 96px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "t-display",
    style: {
      fontSize: 38
    }
  }, "My ", /*#__PURE__*/React.createElement("em", null, "tag")), /*#__PURE__*/React.createElement("span", {
    className: "t-label",
    style: {
      color: 'var(--sage)'
    }
  }, "Saved \u2713")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      padding: '22px 0 26px',
      background: 'var(--warm)',
      borderRadius: 'var(--r)',
      border: 'var(--hairline) solid var(--border)',
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement(PersonCard, {
    person: u,
    accent: accent,
    variant: variant,
    tilt: variant === 'sticker' ? tilt : 0
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    person: u,
    size: 88,
    accent: accent
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 800,
      fontSize: 13.5,
      color: 'var(--primary)',
      cursor: 'pointer'
    }
  }, "Change photo")), /*#__PURE__*/React.createElement(Field, {
    label: "Your name",
    count: u.name.length,
    max: 40
  }, /*#__PURE__*/React.createElement("input", {
    className: "na-field",
    value: u.name,
    maxLength: 40,
    onChange: e => set({
      name: e.target.value
    }),
    placeholder: "What should people call you?"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Your pronouns"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8
    }
  }, PRONOUN_OPTIONS.map(opt => /*#__PURE__*/React.createElement("button", {
    key: opt,
    className: "na-chip",
    "data-on": u.pronouns === opt,
    onClick: () => set({
      pronouns: opt === 'custom' ? u.pronouns : opt
    })
  }, opt === 'custom' ? '+ custom' : opt)))), /*#__PURE__*/React.createElement(Field, {
    label: "Tagline",
    count: u.tagline.length,
    max: 60
  }, /*#__PURE__*/React.createElement("input", {
    className: "na-field",
    value: u.tagline,
    maxLength: 60,
    onChange: e => set({
      tagline: e.target.value
    }),
    placeholder: "A short line about you\u2026"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Show me to people within"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("select", {
    className: "na-field",
    value: u.radius || 100,
    onChange: e => set({
      radius: Number(e.target.value)
    }),
    style: {
      appearance: 'none',
      cursor: 'pointer'
    }
  }, RADIUS_OPTIONS.map(o => /*#__PURE__*/React.createElement("option", {
    key: o.v,
    value: o.v
  }, o.l))), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      right: 16,
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none',
      color: 'var(--muted)',
      fontWeight: 800
    }
  }, "\u25BE"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 13,
      alignItems: 'flex-start',
      padding: 16,
      marginBottom: 22,
      background: 'color-mix(in srgb, var(--primary) 8%, var(--surface))',
      border: 'var(--hairline) solid color-mix(in srgb, var(--primary) 26%, transparent)',
      borderRadius: 'var(--r)'
    }
  }, /*#__PURE__*/React.createElement(Toggle, {
    on: u.alwaysVisible !== false,
    onClick: () => set({
      alwaysVisible: !(u.alwaysVisible !== false)
    })
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 13.5
    }
  }, u.alwaysVisible !== false ? 'Always visible when nearby' : 'Only visible when I choose'), /*#__PURE__*/React.createElement("div", {
    className: "t-body",
    style: {
      fontSize: 12.5,
      marginTop: 2
    }
  }, u.alwaysVisible !== false ? 'People nearby see your name automatically.' : 'Hidden by default — flip visibility on from Nearby.'))), /*#__PURE__*/React.createElement(Field, {
    label: "Nametag color"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      flexWrap: 'wrap'
    }
  }, window.NAMETAG_ACCENT_ORDER.map(key => {
    const hex = `var(--${key})`;
    const on = u.accent === key;
    return /*#__PURE__*/React.createElement("button", {
      key: key,
      onClick: () => set({
        accent: key
      }),
      title: key,
      style: {
        width: 34,
        height: 34,
        borderRadius: '50%',
        background: hex,
        border: on ? '3px solid var(--text)' : '3px solid transparent',
        boxShadow: on ? '0 0 0 2px var(--surface) inset' : 'none',
        cursor: 'pointer',
        transition: 'transform .12s ease',
        transform: on ? 'scale(1.08)' : 'none'
      }
    });
  }))), /*#__PURE__*/React.createElement(Field, {
    label: `Stickers · pick up to 3`
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8
    }
  }, STICKER_OPTIONS.map(s => {
    const on = u.stickers.includes(s);
    return /*#__PURE__*/React.createElement("button", {
      key: s,
      onClick: () => toggleSticker(s),
      style: {
        width: 42,
        height: 42,
        borderRadius: 'var(--r)',
        fontSize: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all .12s ease',
        background: on ? 'color-mix(in srgb, var(--primary) 14%, var(--surface))' : 'var(--surface)',
        border: `var(--hairline) solid ${on ? 'var(--primary)' : 'var(--border)'}`
      }
    }, s);
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      paddingTop: 20,
      borderTop: 'var(--hairline) solid var(--border)'
    }
  }, !confirmDel ? /*#__PURE__*/React.createElement("button", {
    onClick: () => setConfirmDel(true),
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--muted)',
      fontWeight: 700,
      fontSize: 13.5,
      padding: 0
    }
  }, "Delete account") : /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'color-mix(in srgb, var(--danger) 9%, var(--surface))',
      border: 'var(--hairline) solid color-mix(in srgb, var(--danger) 30%, transparent)',
      borderRadius: 'var(--r)',
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 14,
      color: 'var(--danger)'
    }
  }, "Delete your account?"), /*#__PURE__*/React.createElement("div", {
    className: "t-body",
    style: {
      fontSize: 12.5,
      margin: '6px 0 12px'
    }
  }, "This erases your profile, photo, and account immediately. There\u2019s no undo."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "na-btn",
    style: {
      flex: 1,
      padding: '11px',
      background: 'var(--danger)',
      color: '#fff'
    },
    onClick: () => setConfirmDel(false)
  }, "Delete everything"), /*#__PURE__*/React.createElement("button", {
    className: "na-btn na-btn--ghost",
    style: {
      flex: 1,
      padding: '11px'
    },
    onClick: () => setConfirmDel(false)
  }, "Cancel")))));
}

/* ═══════════════ TAB BAR ═══════════════ */
function TabBar({
  tab,
  onTab
}) {
  const tabs = [['grid', '👥', 'Nearby'], ['profile', '🏷️', 'My tag']];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 40,
      display: 'flex',
      background: 'var(--surface)',
      borderTop: 'var(--hairline) solid var(--border)',
      paddingBottom: 22,
      boxShadow: '0 -4px 20px rgba(61,43,31,0.05)'
    }
  }, tabs.map(([id, icon, label]) => {
    const on = tab === id;
    return /*#__PURE__*/React.createElement("button", {
      key: id,
      onClick: () => onTab(id),
      style: {
        flex: 1,
        padding: '11px 0 6px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 21,
        filter: on ? 'none' : 'grayscale(.6) opacity(.7)'
      }
    }, icon), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 800,
        fontSize: 11,
        letterSpacing: '.1em',
        textTransform: 'uppercase',
        color: on ? 'var(--primary)' : 'var(--muted)'
      }
    }, label), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 3,
        borderRadius: 99,
        marginTop: 1,
        background: on ? 'var(--primary)' : 'transparent'
      }
    }));
  }));
}
Object.assign(window, {
  Nearby,
  MyTag,
  TabBar
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "nametag-redesign/screens-app.jsx", error: String((e && e.message) || e) }); }

// nametag-redesign/screens-auth.jsx
try { (() => {
// screens-auth.jsx — Wordmark + AuthScreen (3 compositions: card / editorial / badge)
// Exports to window: Wordmark, AuthScreen

const {
  useState: useStateA
} = React;

/* Brand-styled wordmark: Playfair 900, coral italic "tag". */
function Wordmark({
  size = 34,
  block = false
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: size,
      letterSpacing: '-1.5px',
      color: 'var(--text)',
      lineHeight: 1,
      display: block ? 'block' : 'inline-block'
    }
  }, "Name", /*#__PURE__*/React.createElement("em", {
    style: {
      fontStyle: 'italic',
      color: 'var(--primary)'
    }
  }, "tag"));
}
function PwField({
  value,
  onChange,
  placeholder
}) {
  const [show, setShow] = useStateA(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("input", {
    className: "na-field",
    style: {
      paddingRight: 56
    },
    type: show ? 'text' : 'password',
    value: value,
    placeholder: placeholder,
    onChange: e => onChange(e.target.value)
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setShow(s => !s),
    style: {
      position: 'absolute',
      right: 14,
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontWeight: 800,
      fontSize: 12.5,
      color: 'var(--muted)',
      textTransform: 'uppercase',
      letterSpacing: '.08em'
    }
  }, show ? 'Hide' : 'Show'));
}
function AuthForm({
  onSignIn,
  onRegister,
  compact
}) {
  const [mode, setMode] = useStateA('login'); // login | register | forgot
  const [email, setEmail] = useStateA('');
  const [pw, setPw] = useStateA('');
  if (mode === 'forgot') {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setMode('login'),
      style: {
        alignSelf: 'flex-start',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--muted)',
        fontWeight: 700,
        fontSize: 13.5,
        padding: 0
      }
    }, "\u2190 Back to sign in"), /*#__PURE__*/React.createElement("div", {
      className: "t-h3",
      style: {
        fontSize: 19
      }
    }, "Forgot your password?"), /*#__PURE__*/React.createElement("div", {
      className: "t-body",
      style: {
        fontSize: 13.5,
        marginTop: -6
      }
    }, "Enter your email and we\u2019ll send a reset link your way."), /*#__PURE__*/React.createElement("input", {
      className: "na-field",
      type: "email",
      placeholder: "you@email.com",
      value: email,
      onChange: e => setEmail(e.target.value)
    }), /*#__PURE__*/React.createElement("button", {
      className: "na-btn",
      onClick: () => setMode('login')
    }, "Send reset link"));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      padding: 4,
      borderRadius: 'var(--r-pill)',
      background: 'var(--warm2)',
      border: 'var(--hairline) solid var(--border)'
    }
  }, [['login', 'Sign in'], ['register', 'Create account']].map(([m, label]) => /*#__PURE__*/React.createElement("button", {
    key: m,
    onClick: () => setMode(m),
    style: {
      flex: 1,
      padding: '9px 8px',
      borderRadius: 'var(--r-pill)',
      border: 'none',
      cursor: 'pointer',
      fontWeight: 800,
      fontSize: 13.5,
      background: mode === m ? 'var(--surface)' : 'transparent',
      color: mode === m ? 'var(--primary)' : 'var(--muted)',
      boxShadow: mode === m ? '0 2px 8px rgba(61,43,31,0.10)' : 'none',
      transition: 'all .15s ease'
    }
  }, label))), /*#__PURE__*/React.createElement("input", {
    className: "na-field",
    type: "email",
    placeholder: "you@email.com",
    value: email,
    onChange: e => setEmail(e.target.value)
  }), /*#__PURE__*/React.createElement(PwField, {
    value: pw,
    onChange: setPw,
    placeholder: mode === 'register' ? 'Password (8+ characters)' : 'Password'
  }), /*#__PURE__*/React.createElement("button", {
    className: "na-btn",
    onClick: mode === 'register' && onRegister ? onRegister : onSignIn
  }, mode === 'login' ? 'Sign in' : 'Create account'), mode === 'login' && /*#__PURE__*/React.createElement("button", {
    onClick: () => setMode('forgot'),
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--muted)',
      fontWeight: 700,
      fontSize: 13,
      marginTop: -2
    }
  }, "Forgot password?"));
}
function AuthScreen({
  onSignIn,
  onRegister,
  composition = 'card',
  accent
}) {
  const coral = 'var(--coral)';

  // shared card wrapper
  const card = children => /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface)',
      border: 'var(--hairline) solid var(--border)',
      borderRadius: 'var(--r)',
      boxShadow: 'var(--shadow-card)',
      padding: 22
    }
  }, children);
  if (composition === 'editorial') {
    return /*#__PURE__*/React.createElement("div", {
      className: "dotgrid",
      style: {
        minHeight: '100%',
        padding: '92px 26px 40px',
        display: 'flex',
        flexDirection: 'column'
      }
    }, /*#__PURE__*/React.createElement(Wordmark, {
      size: 22
    }), /*#__PURE__*/React.createElement("div", {
      className: "t-display",
      style: {
        fontSize: 46,
        marginTop: 'auto',
        marginBottom: 4
      }
    }, "Say ", /*#__PURE__*/React.createElement("em", null, "hello"), /*#__PURE__*/React.createElement("br", null), "to the room."), /*#__PURE__*/React.createElement("div", {
      className: "t-body",
      style: {
        fontSize: 15,
        maxWidth: 300,
        marginBottom: 26
      }
    }, "A digital \u201CHello, my name is\u201D badge. See who\u2019s nearby, share your name \u2014 and stay in control of when you\u2019re seen."), /*#__PURE__*/React.createElement(AuthForm, {
      onSignIn: onSignIn,
      onRegister: onRegister
    }));
  }
  if (composition === 'badge') {
    const demo = {
      name: 'Nametag',
      pronouns: 'say hi! 👋',
      tagline: 'See who’s nearby',
      stickers: ['👋', '🌟', '🎉'],
      distance: null
    };
    return /*#__PURE__*/React.createElement("div", {
      className: "dotgrid",
      style: {
        minHeight: '100%',
        padding: '78px 26px 40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        transform: 'rotate(-3deg)',
        marginBottom: 30
      }
    }, /*#__PURE__*/React.createElement(PersonCard, {
      person: demo,
      accent: accent,
      variant: "sticker",
      tilt: 0
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        width: '100%'
      }
    }, card(/*#__PURE__*/React.createElement(AuthForm, {
      onSignIn: onSignIn,
      onRegister: onRegister
    }))));
  }

  // default: centered card
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100%',
      padding: '96px 26px 40px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement(Wordmark, {
    size: 44
  }), /*#__PURE__*/React.createElement("div", {
    className: "t-body",
    style: {
      fontSize: 14,
      marginTop: 8
    }
  }, "See who\u2019s nearby. Say hello.")), card(/*#__PURE__*/React.createElement(AuthForm, {
    onSignIn: onSignIn,
    onRegister: onRegister
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "t-label"
  }, "Inspected by Cleo \uD83D\uDC31")));
}
Object.assign(window, {
  Wordmark,
  AuthScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "nametag-redesign/screens-auth.jsx", error: String((e && e.message) || e) }); }

// nametag-redesign/tweaks-panel.jsx
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)

/* BEGIN USAGE */
// tweaks-panel.jsx
// Reusable Tweaks shell + form-control helpers.
// Exports (to window): useTweaks, TweaksPanel, TweakSection, TweakRow, TweakSlider,
//   TweakToggle, TweakRadio, TweakSelect, TweakText, TweakNumber, TweakColor, TweakButton.
//
// Owns the host protocol (listens for __activate_edit_mode / __deactivate_edit_mode,
// posts __edit_mode_available / __edit_mode_set_keys / __edit_mode_dismissed) so
// individual prototypes don't re-roll it. Ships a consistent set of controls so you
// don't hand-draw <input type="range">, segmented radios, steppers, etc.
//
// Usage (in an HTML file that loads React + Babel):
//
//   const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
//     "primaryColor": "#D97757",
//     "palette": ["#D97757", "#29261b", "#f6f4ef"],
//     "fontSize": 16,
//     "density": "regular",
//     "dark": false
//   }/*EDITMODE-END*/;
//
//   function App() {
//     const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
//     return (
//       <div style={{ fontSize: t.fontSize, color: t.primaryColor }}>
//         Hello
//         <TweaksPanel>
//           <TweakSection label="Typography" />
//           <TweakSlider label="Font size" value={t.fontSize} min={10} max={32} unit="px"
//                        onChange={(v) => setTweak('fontSize', v)} />
//           <TweakRadio  label="Density" value={t.density}
//                        options={['compact', 'regular', 'comfy']}
//                        onChange={(v) => setTweak('density', v)} />
//           <TweakSection label="Theme" />
//           <TweakColor  label="Primary" value={t.primaryColor}
//                        options={['#D97757', '#2A6FDB', '#1F8A5B', '#7A5AE0']}
//                        onChange={(v) => setTweak('primaryColor', v)} />
//           <TweakColor  label="Palette" value={t.palette}
//                        options={[['#D97757', '#29261b', '#f6f4ef'],
//                                  ['#475569', '#0f172a', '#f1f5f9']]}
//                        onChange={(v) => setTweak('palette', v)} />
//           <TweakToggle label="Dark mode" value={t.dark}
//                        onChange={(v) => setTweak('dark', v)} />
//         </TweaksPanel>
//       </div>
//     );
//   }
//
// TweakRadio is the segmented control for 2–3 short options (auto-falls-back to
// TweakSelect past ~16/~10 chars per label); reach for TweakSelect directly when
// options are many or long. For color tweaks always curate 3-4 options rather than
// a free picker; an option can also be a whole 2–5 color palette (the stored value
// is the array). The Tweak* controls are a floor, not a ceiling — build custom
// controls inside the panel if a tweak calls for UI they don't cover.
/* END USAGE */
// ─────────────────────────────────────────────────────────────────────────────

const __TWEAKS_STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    transform:scale(var(--dc-inv-zoom,1));transform-origin:bottom right;
    background:rgba(250,249,247,.78);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0;
    scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.15) transparent}
  .twk-body::-webkit-scrollbar{width:8px}
  .twk-body::-webkit-scrollbar-track{background:transparent;margin:2px}
  .twk-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px;
    border:2px solid transparent;background-clip:content-box}
  .twk-body::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.25);
    border:2px solid transparent;background-clip:content-box}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;
    color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}

  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}

  .twk-field{appearance:none;box-sizing:border-box;width:100%;min-width:0;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;
    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  .twk-field:focus{border-color:rgba(0,0,0,.25);background:rgba(255,255,255,.85)}
  select.twk-field{padding-right:22px;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");
    background-repeat:no-repeat;background-position:right 8px center}

  .twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;
    border-radius:999px;background:rgba(0,0,0,.12);outline:none}
  .twk-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;
    width:14px;height:14px;border-radius:50%;background:#fff;
    border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}
  .twk-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
    background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}

  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg.dragging .twk-seg-thumb{transition:none}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:default;padding:4px 6px;line-height:1.2;
    overflow-wrap:anywhere}

  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:default;padding:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}

  .twk-num{display:flex;align-items:center;box-sizing:border-box;min-width:0;height:26px;padding:0 0 0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;background:rgba(255,255,255,.6)}
  .twk-num-lbl{font-weight:500;color:rgba(41,38,27,.6);cursor:ew-resize;
    user-select:none;padding-right:8px}
  .twk-num input{flex:1;min-width:0;height:100%;border:0;background:transparent;
    font:inherit;font-variant-numeric:tabular-nums;text-align:right;padding:0 8px 0 0;
    outline:none;color:inherit;-moz-appearance:textfield}
  .twk-num input::-webkit-inner-spin-button,.twk-num input::-webkit-outer-spin-button{
    -webkit-appearance:none;margin:0}
  .twk-num-unit{padding-right:8px;color:rgba(41,38,27,.45)}

  .twk-btn{appearance:none;height:26px;padding:0 12px;border:0;border-radius:7px;
    background:rgba(0,0,0,.78);color:#fff;font:inherit;font-weight:500;cursor:default}
  .twk-btn:hover{background:rgba(0,0,0,.88)}
  .twk-btn.secondary{background:rgba(0,0,0,.06);color:inherit}
  .twk-btn.secondary:hover{background:rgba(0,0,0,.1)}

  .twk-swatch{appearance:none;-webkit-appearance:none;width:56px;height:22px;
    border:.5px solid rgba(0,0,0,.1);border-radius:6px;padding:0;cursor:default;
    background:transparent;flex-shrink:0}
  .twk-swatch::-webkit-color-swatch-wrapper{padding:0}
  .twk-swatch::-webkit-color-swatch{border:0;border-radius:5.5px}
  .twk-swatch::-moz-color-swatch{border:0;border-radius:5.5px}

  .twk-chips{display:flex;gap:6px}
  .twk-chip{position:relative;appearance:none;flex:1;min-width:0;height:46px;
    padding:0;border:0;border-radius:6px;overflow:hidden;cursor:default;
    box-shadow:0 0 0 .5px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.06);
    transition:transform .12s cubic-bezier(.3,.7,.4,1),box-shadow .12s}
  .twk-chip:hover{transform:translateY(-1px);
    box-shadow:0 0 0 .5px rgba(0,0,0,.18),0 4px 10px rgba(0,0,0,.12)}
  .twk-chip[data-on="1"]{box-shadow:0 0 0 1.5px rgba(0,0,0,.85),
    0 2px 6px rgba(0,0,0,.15)}
  .twk-chip>span{position:absolute;top:0;bottom:0;right:0;width:34%;
    display:flex;flex-direction:column;box-shadow:-1px 0 0 rgba(0,0,0,.1)}
  .twk-chip>span>i{flex:1;box-shadow:0 -1px 0 rgba(0,0,0,.1)}
  .twk-chip>span>i:first-child{box-shadow:none}
  .twk-chip svg{position:absolute;top:6px;left:6px;width:13px;height:13px;
    filter:drop-shadow(0 1px 1px rgba(0,0,0,.3))}
`;

// ── useTweaks ───────────────────────────────────────────────────────────────
// Single source of truth for tweak values. setTweak persists via the host
// (__edit_mode_set_keys → host rewrites the EDITMODE block on disk).
function useTweaks(defaults) {
  const [values, setValues] = React.useState(defaults);
  // Accepts either setTweak('key', value) or setTweak({ key: value, ... }) so a
  // useState-style call doesn't write a "[object Object]" key into the persisted
  // JSON block.
  const setTweak = React.useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' && keyOrEdits !== null ? keyOrEdits : {
      [keyOrEdits]: val
    };
    setValues(prev => ({
      ...prev,
      ...edits
    }));
    window.parent.postMessage({
      type: '__edit_mode_set_keys',
      edits
    }, '*');
    // Same-window signal so in-page listeners (deck-stage rail thumbnails)
    // can react — the parent message only reaches the host, not peers.
    window.dispatchEvent(new CustomEvent('tweakchange', {
      detail: edits
    }));
  }, []);
  return [values, setTweak];
}

// ── TweaksPanel ─────────────────────────────────────────────────────────────
// Floating shell. Registers the protocol listener BEFORE announcing
// availability — if the announce ran first, the host's activate could land
// before our handler exists and the toolbar toggle would silently no-op.
// The close button posts __edit_mode_dismissed so the host's toolbar toggle
// flips off in lockstep; the host echoes __deactivate_edit_mode back which
// is what actually hides the panel.
function TweaksPanel({
  title = 'Tweaks',
  children
}) {
  const [open, setOpen] = React.useState(false);
  const dragRef = React.useRef(null);
  const offsetRef = React.useRef({
    x: 16,
    y: 16
  });
  const PAD = 16;
  const clampToViewport = React.useCallback(() => {
    const panel = dragRef.current;
    if (!panel) return;
    const w = panel.offsetWidth,
      h = panel.offsetHeight;
    const maxRight = Math.max(PAD, window.innerWidth - w - PAD);
    const maxBottom = Math.max(PAD, window.innerHeight - h - PAD);
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(PAD, offsetRef.current.y))
    };
    panel.style.right = offsetRef.current.x + 'px';
    panel.style.bottom = offsetRef.current.y + 'px';
  }, []);
  React.useEffect(() => {
    if (!open) return;
    clampToViewport();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', clampToViewport);
      return () => window.removeEventListener('resize', clampToViewport);
    }
    const ro = new ResizeObserver(clampToViewport);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [open, clampToViewport]);
  React.useEffect(() => {
    const onMsg = e => {
      const t = e?.data?.type;
      if (t === '__activate_edit_mode') setOpen(true);else if (t === '__deactivate_edit_mode') setOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({
      type: '__edit_mode_available'
    }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);
  const dismiss = () => {
    setOpen(false);
    window.parent.postMessage({
      type: '__edit_mode_dismissed'
    }, '*');
  };
  const onDragStart = e => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX,
      sy = e.clientY;
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    const move = ev => {
      offsetRef.current = {
        x: startRight - (ev.clientX - sx),
        y: startBottom - (ev.clientY - sy)
      };
      clampToViewport();
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };
  if (!open) return null;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("style", null, __TWEAKS_STYLE), /*#__PURE__*/React.createElement("div", {
    ref: dragRef,
    className: "twk-panel",
    "data-omelette-chrome": "",
    style: {
      right: offsetRef.current.x,
      bottom: offsetRef.current.y
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-hd",
    onMouseDown: onDragStart
  }, /*#__PURE__*/React.createElement("b", null, title), /*#__PURE__*/React.createElement("button", {
    className: "twk-x",
    "aria-label": "Close tweaks",
    onMouseDown: e => e.stopPropagation(),
    onClick: dismiss
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    className: "twk-body"
  }, children)));
}

// ── Layout helpers ──────────────────────────────────────────────────────────

function TweakSection({
  label,
  children
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "twk-sect"
  }, label), children);
}
function TweakRow({
  label,
  value,
  children,
  inline = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: inline ? 'twk-row twk-row-h' : 'twk-row'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label), value != null && /*#__PURE__*/React.createElement("span", {
    className: "twk-val"
  }, value)), children);
}

// ── Controls ────────────────────────────────────────────────────────────────

function TweakSlider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label,
    value: `${value}${unit}`
  }, /*#__PURE__*/React.createElement("input", {
    type: "range",
    className: "twk-slider",
    min: min,
    max: max,
    step: step,
    value: value,
    onChange: e => onChange(Number(e.target.value))
  }));
}
function TweakToggle({
  label,
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-row twk-row-h"
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "twk-toggle",
    "data-on": value ? '1' : '0',
    role: "switch",
    "aria-checked": !!value,
    onClick: () => onChange(!value)
  }, /*#__PURE__*/React.createElement("i", null)));
}
function TweakRadio({
  label,
  value,
  options,
  onChange
}) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  // The active value is read by pointer-move handlers attached for the lifetime
  // of a drag — ref it so a stale closure doesn't fire onChange for every move.
  const valueRef = React.useRef(value);
  valueRef.current = value;

  // Segments wrap mid-word once per-segment width runs out. The track is
  // ~248px (280 panel − 28 body pad − 4 seg pad), each button loses 12px
  // to its own padding, and 11.5px system-ui averages ~6.3px/char — so 2
  // options fit ~16 chars each, 3 fit ~10. Past that (or >3 options), fall
  // back to a dropdown rather than wrap.
  const labelLen = o => String(typeof o === 'object' ? o.label : o).length;
  const maxLen = options.reduce((m, o) => Math.max(m, labelLen(o)), 0);
  const fitsAsSegments = maxLen <= ({
    2: 16,
    3: 10
  }[options.length] ?? 0);
  if (!fitsAsSegments) {
    // <select> emits strings — map back to the original option value so the
    // fallback stays type-preserving (numbers, booleans) like the segment path.
    const resolve = s => {
      const m = options.find(o => String(typeof o === 'object' ? o.value : o) === s);
      return m === undefined ? s : typeof m === 'object' ? m.value : m;
    };
    return /*#__PURE__*/React.createElement(TweakSelect, {
      label: label,
      value: value,
      options: options,
      onChange: s => onChange(resolve(s))
    });
  }
  const opts = options.map(o => typeof o === 'object' ? o : {
    value: o,
    label: o
  });
  const idx = Math.max(0, opts.findIndex(o => o.value === value));
  const n = opts.length;
  const segAt = clientX => {
    const r = trackRef.current.getBoundingClientRect();
    const inner = r.width - 4;
    const i = Math.floor((clientX - r.left - 2) / inner * n);
    return opts[Math.max(0, Math.min(n - 1, i))].value;
  };
  const onPointerDown = e => {
    setDragging(true);
    const v0 = segAt(e.clientX);
    if (v0 !== valueRef.current) onChange(v0);
    const move = ev => {
      if (!trackRef.current) return;
      const v = segAt(ev.clientX);
      if (v !== valueRef.current) onChange(v);
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("div", {
    ref: trackRef,
    role: "radiogroup",
    onPointerDown: onPointerDown,
    className: dragging ? 'twk-seg dragging' : 'twk-seg'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-seg-thumb",
    style: {
      left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
      width: `calc((100% - 4px) / ${n})`
    }
  }), opts.map(o => /*#__PURE__*/React.createElement("button", {
    key: o.value,
    type: "button",
    role: "radio",
    "aria-checked": o.value === value
  }, o.label))));
}
function TweakSelect({
  label,
  value,
  options,
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("select", {
    className: "twk-field",
    value: value,
    onChange: e => onChange(e.target.value)
  }, options.map(o => {
    const v = typeof o === 'object' ? o.value : o;
    const l = typeof o === 'object' ? o.label : o;
    return /*#__PURE__*/React.createElement("option", {
      key: v,
      value: v
    }, l);
  })));
}
function TweakText({
  label,
  value,
  placeholder,
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("input", {
    className: "twk-field",
    type: "text",
    value: value,
    placeholder: placeholder,
    onChange: e => onChange(e.target.value)
  }));
}
function TweakNumber({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange
}) {
  const clamp = n => {
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  };
  const startRef = React.useRef({
    x: 0,
    val: 0
  });
  const onScrubStart = e => {
    e.preventDefault();
    startRef.current = {
      x: e.clientX,
      val: value
    };
    const decimals = (String(step).split('.')[1] || '').length;
    const move = ev => {
      const dx = ev.clientX - startRef.current.x;
      const raw = startRef.current.val + dx * step;
      const snapped = Math.round(raw / step) * step;
      onChange(clamp(Number(snapped.toFixed(decimals))));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-num"
  }, /*#__PURE__*/React.createElement("span", {
    className: "twk-num-lbl",
    onPointerDown: onScrubStart
  }, label), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: value,
    min: min,
    max: max,
    step: step,
    onChange: e => onChange(clamp(Number(e.target.value)))
  }), unit && /*#__PURE__*/React.createElement("span", {
    className: "twk-num-unit"
  }, unit));
}

// Relative-luminance contrast pick — checkmarks drawn over a swatch need to
// read on both #111 and #fafafa without per-option configuration. Hex input
// only (#rgb / #rrggbb); named or rgb()/hsl() colors fall through to "light".
function __twkIsLight(hex) {
  const h = String(hex).replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, c => c + c) : h.padEnd(6, '0');
  const n = parseInt(x.slice(0, 6), 16);
  if (Number.isNaN(n)) return true;
  const r = n >> 16 & 255,
    g = n >> 8 & 255,
    b = n & 255;
  return r * 299 + g * 587 + b * 114 > 148000;
}
const __TwkCheck = ({
  light
}) => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 14 14",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M3 7.2 5.8 10 11 4.2",
  fill: "none",
  strokeWidth: "2.2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  stroke: light ? 'rgba(0,0,0,.78)' : '#fff'
}));

// TweakColor — curated color/palette picker. Each option is either a single
// hex string or an array of 1-5 hex strings; the card adapts — a lone color
// renders solid, a palette renders colors[0] as the hero (left ~2/3) with the
// rest stacked in a sharp column on the right. onChange emits the
// option in the shape it was passed (string stays string, array stays array).
// Without options it falls back to the native color input for back-compat.
function TweakColor({
  label,
  value,
  options,
  onChange
}) {
  if (!options || !options.length) {
    return /*#__PURE__*/React.createElement("div", {
      className: "twk-row twk-row-h"
    }, /*#__PURE__*/React.createElement("div", {
      className: "twk-lbl"
    }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("input", {
      type: "color",
      className: "twk-swatch",
      value: value,
      onChange: e => onChange(e.target.value)
    }));
  }
  // Native <input type=color> emits lowercase hex per the HTML spec, so
  // compare case-insensitively. String() guards JSON.stringify(undefined),
  // which returns the primitive undefined (no .toLowerCase).
  const key = o => String(JSON.stringify(o)).toLowerCase();
  const cur = key(value);
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-chips",
    role: "radiogroup"
  }, options.map((o, i) => {
    const colors = Array.isArray(o) ? o : [o];
    const [hero, ...rest] = colors;
    const sup = rest.slice(0, 4);
    const on = key(o) === cur;
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      type: "button",
      className: "twk-chip",
      role: "radio",
      "aria-checked": on,
      "data-on": on ? '1' : '0',
      "aria-label": colors.join(', '),
      title: colors.join(' · '),
      style: {
        background: hero
      },
      onClick: () => onChange(o)
    }, sup.length > 0 && /*#__PURE__*/React.createElement("span", null, sup.map((c, j) => /*#__PURE__*/React.createElement("i", {
      key: j,
      style: {
        background: c
      }
    }))), on && /*#__PURE__*/React.createElement(__TwkCheck, {
      light: __twkIsLight(hero)
    }));
  })));
}
function TweakButton({
  label,
  onClick,
  secondary = false
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: secondary ? 'twk-btn secondary' : 'twk-btn',
    onClick: onClick
  }, label);
}
Object.assign(window, {
  useTweaks,
  TweaksPanel,
  TweakSection,
  TweakRow,
  TweakSlider,
  TweakToggle,
  TweakRadio,
  TweakSelect,
  TweakText,
  TweakNumber,
  TweakColor,
  TweakButton
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "nametag-redesign/tweaks-panel.jsx", error: String((e && e.message) || e) }); }

})();
