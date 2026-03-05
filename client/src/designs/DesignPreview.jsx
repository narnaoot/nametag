import { useState } from 'react';
import { DesignAPreview, AuthForm as AuthFormA } from './DesignA';
import { DesignBPreview, AuthForm as AuthFormB } from './DesignB';
import { DesignCPreview, AuthForm as AuthFormC } from './DesignC';
import { DesignDPreview, AuthForm as AuthFormD } from './DesignD';
import { DesignEPreview } from './DesignE';

const DESIGNS = [
  {
    id: 'A',
    label: 'Design A',
    subtitle: 'Soft Bubbles',
    emoji: '🫧',
    description: 'Pale lavender-to-mint gradient, cloud-white rounded cards, pastel avatar rings.',
    Preview: DesignAPreview,
    Auth: AuthFormA,
    accentColor: '#6366f1',
  },
  {
    id: 'B',
    label: 'Design B',
    subtitle: 'Bold Candy',
    emoji: '🍬',
    description: 'Pure white, thick colored top borders, split auth layout, bold black type.',
    Preview: DesignBPreview,
    Auth: AuthFormB,
    accentColor: '#A855F7',
  },
  {
    id: 'C',
    label: 'Design C',
    subtitle: 'Watercolor Garden',
    emoji: '🌸',
    description: 'Warm ivory background, soft watercolor card washes, floral corner accents.',
    Preview: DesignCPreview,
    Auth: AuthFormC,
    accentColor: '#b45309',
  },
  {
    id: 'D',
    label: 'Design D',
    subtitle: 'Neon Fizz',
    emoji: '⚡',
    description: 'Light gray base, gradient left-border cards, monospace pronouns, big gradient logo.',
    Preview: DesignDPreview,
    Auth: AuthFormD,
    accentColor: '#f472b6',
  },
  {
    id: 'E',
    label: 'Design E',
    subtitle: 'Classic Nametag',
    emoji: '🏷️',
    description: '"HELLO my name is" sticker badge — photo above, colored band, handwritten name in Caveat script, pronouns strip below. Each person gets a different color and a subtle tilt.',
    Preview: DesignEPreview,
    Auth: null,
    accentColor: '#E63946',
  },
];

const FAKE_PEOPLE = [
  { display_name: 'Alex', pronouns: 'they/them', distance_meters: 12 },
  { display_name: 'Jordan', pronouns: 'she/her', distance_meters: 47 },
  { display_name: 'Sam', pronouns: 'he/him', distance_meters: 103 },
  { display_name: 'Riley', pronouns: 'ze/zir', distance_meters: 8 },
];

function PhoneFrame({ children, label, accent }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
      <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </p>
      <div
        style={{
          width: 390,
          maxWidth: '100%',
          border: `2px solid ${accent}`,
          borderRadius: '1.25rem',
          overflow: 'hidden',
          boxShadow: `0 8px 32px ${accent}22`,
          background: '#fff',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function DesignPreview() {
  const [activeTab, setActiveTab] = useState('grid');
  const [mode, setMode] = useState('cards');  // 'cards' | 'auth'

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          padding: '1.5rem 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: '#111827',
            margin: 0,
            marginBottom: '0.25rem',
          }}
        >
          Design Options — pick your favorite
        </h1>
        <p style={{ color: '#6b7280', margin: 0, fontSize: '0.9rem' }}>
          {DESIGNS.length} design directions — pick your favorite and we'll build it out
        </p>

        {/* View toggle */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          {['cards', 'auth'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: 999,
                border: mode === m ? '2px solid #6366f1' : '2px solid #e5e7eb',
                background: mode === m ? '#6366f1' : '#fff',
                color: mode === m ? '#fff' : '#374151',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {m === 'cards' ? '👥 Person Cards' : '🔐 Auth Page'}
            </button>
          ))}
        </div>
      </div>

      {/* Design grid */}
      <div
        style={{
          padding: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '2.5rem',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        {DESIGNS.map(({ id, label, subtitle, emoji, description, Preview, Auth, accentColor }) => {
          const showingAuth = mode === 'auth' && Auth;
          return (
          <div
            key={id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              alignItems: 'center',
            }}
          >
            {/* Design label */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{emoji}</div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: accentColor }}>
                {label}
              </h2>
              <p style={{ margin: '2px 0 0', fontWeight: 600, fontSize: '0.85rem', color: '#374151' }}>
                "{subtitle}"
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#6b7280', maxWidth: 340, lineHeight: 1.4 }}>
                {description}
              </p>
            </div>

            {/* Phone frame with design preview */}
            <div
              style={{
                width: 390,
                maxWidth: '100%',
                border: `2px solid ${accentColor}`,
                borderRadius: '1.25rem',
                overflow: 'hidden',
                boxShadow: `0 8px 32px ${accentColor}20`,
                minHeight: showingAuth ? 480 : 340,
              }}
            >
              {showingAuth ? (
                <div style={{ height: 480 }}>
                  <Auth
                    mode="login"
                    onModeChange={() => {}}
                    onSubmit={(e) => e.preventDefault()}
                    loading={false}
                    error={null}
                  />
                </div>
              ) : (
                <Preview />
              )}
            </div>

            {/* Fake data label */}
            {!showingAuth && (
              <p style={{ margin: 0, fontSize: '0.72rem', color: '#9ca3af' }}>
                {Auth ? `Showing ${FAKE_PEOPLE.length} fake nearby people` : 'Cards only (no separate auth screen)'}
              </p>
            )}
          </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af', fontSize: '0.8rem', borderTop: '1px solid #f3f4f6' }}>
        Nametag Design Preview · Visit <code style={{ background: '#f3f4f6', padding: '1px 6px', borderRadius: 4 }}>#designs</code> to return here anytime
      </div>
    </div>
  );
}
