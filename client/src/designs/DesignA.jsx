// Design A — "Soft Bubbles"
// Vibe: soft bubbles floating on a spring morning

export function PersonCard({ display_name, pronouns, photo_path, distance_meters, index = 0 }) {
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
        borderRadius: '1.5rem',
        boxShadow: '0 4px 24px rgba(139, 92, 246, 0.08), 0 1px 4px rgba(139, 92, 246, 0.06)',
        padding: '1.25rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.6rem',
        textAlign: 'center',
      }}
    >
      {/* Avatar with pastel gradient ring */}
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          padding: 3,
          background: 'linear-gradient(135deg, #c4b5fd, #7dd3fc)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: '#f1f5f9',
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
      </div>

      {/* Name */}
      <p style={{ fontWeight: 500, color: '#1e293b', fontSize: '0.95rem', lineHeight: 1.2, margin: 0 }}>
        {display_name}
      </p>

      {/* Pronoun badge */}
      <span
        style={{
          background: '#ede9fe',
          color: '#4338ca',
          fontSize: '0.72rem',
          fontWeight: 500,
          padding: '0.25rem 0.75rem',
          borderRadius: 999,
          letterSpacing: '0.01em',
        }}
      >
        {pronouns}
      </span>

      {/* Distance */}
      {distance_meters != null && (
        <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0 }}>
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
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(196,181,253,0.3)',
        display: 'flex',
        borderRadius: '1rem 1rem 0 0',
      }}
    >
      {[
        { key: 'grid', label: 'Nearby', icon: '👥' },
        { key: 'profile', label: 'My Profile', icon: '🏷️' },
      ].map(({ key, label, icon }) => (
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
            color: tab === key ? '#4338ca' : '#94a3b8',
            fontWeight: tab === key ? 600 : 400,
            fontSize: '0.75rem',
            transition: 'color 0.15s',
          }}
        >
          <span style={{ fontSize: 20 }}>{icon}</span>
          <span>{label}</span>
          {tab === key && (
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #c4b5fd, #7dd3fc)',
                marginTop: 1,
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
        background: 'linear-gradient(135deg, #ede9fe 0%, #e0f2fe 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '1.75rem',
          boxShadow: '0 8px 40px rgba(139,92,246,0.12)',
          padding: '2.5rem 2rem',
          width: '100%',
          maxWidth: 360,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🏷️</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Nametag</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: 4 }}>
            {mode === 'login' ? 'Welcome back!' : 'Create your account'}
          </p>
        </div>

        {error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '0.75rem',
              padding: '0.75rem 1rem',
              color: '#dc2626',
              fontSize: '0.8rem',
              marginBottom: '1rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            style={{
              border: '1.5px solid #e2e8f0',
              borderRadius: '0.875rem',
              padding: '0.75rem 1rem',
              fontSize: '0.9rem',
              outline: 'none',
              color: '#1e293b',
              background: '#f8fafc',
            }}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            style={{
              border: '1.5px solid #e2e8f0',
              borderRadius: '0.875rem',
              padding: '0.75rem 1rem',
              fontSize: '0.9rem',
              outline: 'none',
              color: '#1e293b',
              background: '#f8fafc',
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #c4b5fd, #7dd3fc)',
              color: '#3730a3',
              border: 'none',
              borderRadius: '0.875rem',
              padding: '0.8rem',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginTop: 4,
            }}
          >
            {loading ? 'Loading…' : mode === 'login' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.82rem', color: '#94a3b8' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => onModeChange(mode === 'login' ? 'signup' : 'login')}
            style={{
              background: 'none',
              border: 'none',
              color: '#6366f1',
              fontWeight: 600,
              cursor: 'pointer',
              padding: 0,
              fontSize: '0.82rem',
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
  { display_name: 'Alex', pronouns: 'they/them', distance_meters: 12 },
  { display_name: 'Jordan', pronouns: 'she/her', distance_meters: 47 },
  { display_name: 'Sam', pronouns: 'he/him', distance_meters: 103 },
  { display_name: 'Riley', pronouns: 'ze/zir', distance_meters: 8 },
];

export function DesignAPreview() {
  return (
    <div style={{ background: 'linear-gradient(135deg, #ede9fe 0%, #e0f2fe 100%)', minHeight: '100%', padding: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
        {FAKE_PEOPLE.map((p, i) => (
          <PersonCard key={p.display_name} {...p} index={i} />
        ))}
      </div>
      <NavBar tab="grid" onTabChange={() => {}} />
    </div>
  );
}
