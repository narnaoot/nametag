// Design B — "Bold Candy"
// Vibe: graphic, punchy, energetic

const ACCENT_COLORS = ['#FF6B6B', '#A855F7', '#14B8A6', '#F59E0B'];

function getAccent(index) {
  return ACCENT_COLORS[index % ACCENT_COLORS.length];
}

export function PersonCard({ display_name, pronouns, photo_path, distance_meters, index = 0 }) {
  const accent = getAccent(index);

  const formatDistance = (m) => {
    if (m == null) return null;
    if (m < 10) return 'right here';
    if (m < 1000) return `${Math.round(m)} m away`;
    return `${(m / 1000).toFixed(1)} km away`;
  };

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '0.5rem',
        border: '1.5px solid #e5e7eb',
        borderTop: `4px solid ${accent}`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '1.25rem 1rem 1rem',
        gap: '0.5rem',
        textAlign: 'center',
      }}
    >
      {/* Avatar: square-ish */}
      <div
        style={{
          width: 68,
          height: 68,
          borderRadius: '0.75rem',
          background: '#f3f4f6',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {photo_path ? (
          <img src={photo_path} alt={display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: 28 }}>👤</span>
        )}
      </div>

      {/* Name */}
      <p style={{ fontWeight: 800, color: '#000000', fontSize: '1rem', lineHeight: 1.2, margin: 0 }}>
        {display_name}
      </p>

      {/* Pronoun badge — bold colored background */}
      <span
        style={{
          background: accent,
          color: '#ffffff',
          fontSize: '0.7rem',
          fontWeight: 700,
          padding: '0.2rem 0.65rem',
          borderRadius: '0.375rem',
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
        }}
      >
        {pronouns}
      </span>

      {/* Distance */}
      {distance_meters != null && (
        <p style={{ fontSize: '0.7rem', color: '#9ca3af', margin: 0, fontWeight: 500 }}>
          {formatDistance(distance_meters)}
        </p>
      )}
    </div>
  );
}

export function NavBar({ tab, onTabChange }) {
  return (
    <nav
      style={{
        background: '#ffffff',
        borderTop: '1.5px solid #e5e7eb',
        display: 'flex',
      }}
    >
      {[
        { key: 'grid', label: 'Nearby', icon: '👥', accent: '#FF6B6B' },
        { key: 'profile', label: 'My Profile', icon: '🏷️', accent: '#A855F7' },
      ].map(({ key, label, icon, accent }) => (
        <button
          key={key}
          onClick={() => onTabChange(key)}
          style={{
            flex: 1,
            padding: '0.75rem 0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: tab === key ? '#000000' : '#9ca3af',
            fontWeight: tab === key ? 800 : 500,
            fontSize: '0.75rem',
            position: 'relative',
            borderTop: tab === key ? `3px solid ${accent}` : '3px solid transparent',
            marginTop: -1.5,
          }}
        >
          <span style={{ fontSize: 20 }}>{icon}</span>
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

export function AuthForm({ mode, onModeChange, onSubmit, loading, error }) {
  return (
    <div
      style={{
        minHeight: '100%',
        display: 'flex',
        background: '#ffffff',
      }}
    >
      {/* Left half — bold color */}
      <div
        style={{
          width: '45%',
          background: '#A855F7',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1.5rem',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 48, marginBottom: 12 }}>🏷️</span>
        <h1 style={{ color: '#ffffff', fontWeight: 900, fontSize: '1.5rem', textAlign: 'center', margin: 0 }}>
          Name&shy;tag
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.78rem', textAlign: 'center', marginTop: 8 }}>
          See who's around you
        </p>
      </div>

      {/* Right half — white form */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '1.5rem 1.25rem',
        }}
      >
        <h2 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#000', marginBottom: '1.25rem', marginTop: 0 }}>
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </h2>

        {error && (
          <div
            style={{
              background: '#fff0f0',
              border: '1.5px solid #FF6B6B',
              borderRadius: '0.375rem',
              padding: '0.6rem 0.75rem',
              color: '#FF6B6B',
              fontSize: '0.78rem',
              fontWeight: 600,
              marginBottom: '0.75rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            style={{
              border: '1.5px solid #e5e7eb',
              borderRadius: '0.375rem',
              padding: '0.65rem 0.75rem',
              fontSize: '0.85rem',
              outline: 'none',
              color: '#111',
            }}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            style={{
              border: '1.5px solid #e5e7eb',
              borderRadius: '0.375rem',
              padding: '0.65rem 0.75rem',
              fontSize: '0.85rem',
              outline: 'none',
              color: '#111',
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#000000',
              color: '#ffffff',
              border: 'none',
              borderRadius: '0.375rem',
              padding: '0.7rem',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              marginTop: 4,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {loading ? '…' : mode === 'login' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <p style={{ marginTop: '0.9rem', fontSize: '0.75rem', color: '#6b7280' }}>
          {mode === 'login' ? 'New? ' : 'Have account? '}
          <button
            onClick={() => onModeChange(mode === 'login' ? 'signup' : 'login')}
            style={{
              background: 'none',
              border: 'none',
              color: '#A855F7',
              fontWeight: 800,
              cursor: 'pointer',
              padding: 0,
              fontSize: '0.75rem',
            }}
          >
            {mode === 'login' ? 'Sign up →' : 'Sign in →'}
          </button>
        </p>
      </div>
    </div>
  );
}

const FAKE_PEOPLE = [
  { display_name: 'Alex', pronouns: 'they/them', distance_meters: 12 },
  { display_name: 'Jordan', pronouns: 'she/her', distance_meters: 47 },
  { display_name: 'Sam', pronouns: 'he/him', distance_meters: 103 },
  { display_name: 'Riley', pronouns: 'ze/zir', distance_meters: 8 },
];

export function DesignBPreview() {
  return (
    <div style={{ background: '#ffffff', minHeight: '100%', padding: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
        {FAKE_PEOPLE.map((p, i) => (
          <PersonCard key={p.display_name} {...p} index={i} />
        ))}
      </div>
      <NavBar tab="grid" onTabChange={() => {}} />
    </div>
  );
}
