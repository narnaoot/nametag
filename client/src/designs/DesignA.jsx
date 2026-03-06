// Design A — "Soft Bubbles"
// Vibe: cute, elegant, soft

const CARD_COLORS = [
  { bg: 'linear-gradient(135deg, #ddd6fe 0%, #e0e7ff 100%)', ring: '#a78bfa' },
  { bg: 'linear-gradient(135deg, #dbeafe 0%, #e0f2fe 100%)', ring: '#38bdf8' },
  { bg: 'linear-gradient(135deg, #f3e8ff 0%, #ede9fe 100%)', ring: '#c084fc' },
  { bg: 'linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%)', ring: '#818cf8' },
];

function getCardColor(index) {
  return CARD_COLORS[index % CARD_COLORS.length];
}

export function PersonCard({ display_name, pronouns, tagline, photo_path, distance_meters, index = 0 }) {
  const { bg, ring } = getCardColor(index);

  const formatDistance = (m) => {
    if (m == null) return null;
    if (m < 10) return 'right here';
    if (m < 1000) return `${Math.round(m)} m away`;
    return `${(m / 1000).toFixed(1)} km away`;
  };

  return (
    <div
      style={{
        background: bg,
        borderRadius: '1.5rem',
        boxShadow: '0 8px 32px rgba(139, 92, 246, 0.08)',
        padding: '1.5rem 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem',
        textAlign: 'center',
      }}
    >
      {/* Avatar with soft ring */}
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          border: `3px solid ${ring}`,
          boxShadow: `0 0 0 3px rgba(139, 92, 246, 0.1)`,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fff',
          flexShrink: 0,
        }}
      >
        {photo_path ? (
          <img src={photo_path} alt={display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: 32 }}>👤</span>
        )}
      </div>

      {/* Name */}
      <p style={{ fontWeight: 700, color: '#4c1d95', fontSize: '1.05rem', lineHeight: 1.2, margin: 0 }}>
        {display_name}
      </p>

      {/* Pronoun badge: soft gradient background */}
      <span
        style={{
          background: `linear-gradient(135deg, ${ring}30, ${ring}15)`,
          color: ring,
          fontSize: '0.75rem',
          fontWeight: 700,
          padding: '0.3rem 0.8rem',
          borderRadius: 999,
          letterSpacing: '0.01em',
        }}
      >
        {pronouns}
      </span>

      {/* Tagline */}
      {tagline && (
        <p style={{ fontSize: '0.75rem', color: '#6d28d9', margin: 0, fontStyle: 'italic', opacity: 0.8 }}>
          {tagline}
        </p>
      )}

      {/* Distance */}
      {distance_meters != null && (
        <p style={{ fontSize: '0.75rem', color: '#9333ea', margin: 0, opacity: 0.65 }}>
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
        background: 'linear-gradient(180deg, #ffffff, #f3f0ff)',
        borderTop: '1px solid #e9d5ff',
        display: 'flex',
      }}
    >
      {[
        { key: 'grid', label: 'Nearby', icon: '👥', color: '#a78bfa' },
        { key: 'profile', label: 'My Profile', icon: '🏷️', color: '#c084fc' },
      ].map(({ key, label, icon, color }) => (
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
            color: tab === key ? color : '#d8b4fe',
            fontWeight: tab === key ? 700 : 400,
            fontSize: '0.75rem',
          }}
        >
          <span style={{ fontSize: 20 }}>{icon}</span>
          <span>{label}</span>
          {tab === key && (
            <div
              style={{
                width: 20,
                height: 2,
                borderRadius: 2,
                background: color,
                marginTop: 2,
              }}
            />
          )}
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
        background: 'linear-gradient(135deg, #ede9fe 0%, #f3e8ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.25rem',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '1.5rem',
          boxShadow: '0 10px 40px rgba(139, 92, 246, 0.12)',
          padding: '2.5rem 2rem',
          width: '100%',
          maxWidth: 380,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🏷️</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#6d28d9', margin: 0 }}>Nametag</h1>
          <p style={{ color: '#a78bfa', fontSize: '0.85rem', marginTop: 4 }}>See who's around you</p>
        </div>

        {error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '0.75rem',
              padding: '0.65rem 0.9rem',
              color: '#991b1b',
              fontSize: '0.8rem',
              marginBottom: '1rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            style={{
              border: '1.5px solid #e9d5ff',
              borderRadius: '0.875rem',
              padding: '0.7rem 1rem',
              fontSize: '0.88rem',
              outline: 'none',
              color: '#3f0f5c',
              background: '#faf5ff',
            }}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            style={{
              border: '1.5px solid #e9d5ff',
              borderRadius: '0.875rem',
              padding: '0.7rem 1rem',
              fontSize: '0.88rem',
              outline: 'none',
              color: '#3f0f5c',
              background: '#faf5ff',
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #a78bfa, #c084fc)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '0.875rem',
              padding: '0.8rem',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginTop: 4,
            }}
          >
            {loading ? 'Loading…' : mode === 'login' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.8rem', color: '#9333ea' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => onModeChange(mode === 'login' ? 'signup' : 'login')}
            style={{
              background: 'none',
              border: 'none',
              color: '#7c3aed',
              fontWeight: 700,
              cursor: 'pointer',
              padding: 0,
              fontSize: '0.8rem',
            }}
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}

const FAKE_PEOPLE = [
  { display_name: 'Alex', pronouns: 'they/them', tagline: 'coffee & code', distance_meters: 12 },
  { display_name: 'Jordan', pronouns: 'she/her', tagline: 'always vibing', distance_meters: 47 },
  { display_name: 'Sam', pronouns: 'he/him', distance_meters: 103 },
  { display_name: 'Riley', pronouns: 'ze/zir', tagline: 'ask me about plants', distance_meters: 8 },
];

export function DesignAPreview() {
  return (
    <div style={{ background: '#faf5ff', minHeight: '100%', padding: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
        {FAKE_PEOPLE.map((p, i) => (
          <PersonCard key={p.display_name} {...p} index={i} />
        ))}
      </div>
      <NavBar tab="grid" onTabChange={() => {}} />
    </div>
  );
}
