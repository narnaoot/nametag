// Design C — "Watercolor Garden"
// Vibe: warm, handcrafted, like a garden notebook

const CARD_BACKGROUNDS = [
  'linear-gradient(135deg, #ffd6cc 0%, #ffebe5 100%)',  // peachy
  'linear-gradient(135deg, #c6f4d8 0%, #e8faf0 100%)',  // minty
  'linear-gradient(135deg, #ddd6fe 0%, #ede9fe 100%)',  // lavender
  'linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)',  // butter yellow
];

const TEXT_COLORS = ['#b45309', '#065f46', '#5b21b6', '#92400e'];

function getCardBg(index) {
  return CARD_BACKGROUNDS[index % CARD_BACKGROUNDS.length];
}
function getTextColor(index) {
  return TEXT_COLORS[index % TEXT_COLORS.length];
}

export function PersonCard({ display_name, pronouns, tagline, photo_path, distance_meters, index = 0 }) {
  const bg = getCardBg(index);
  const textColor = getTextColor(index);

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
        borderRadius: '1.75rem',
        boxShadow: '0 6px 28px rgba(120, 80, 40, 0.10)',
        padding: '1.25rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.55rem',
        textAlign: 'center',
      }}
    >
      {/* Avatar with soft white ring */}
      <div
        style={{
          width: 70,
          height: 70,
          borderRadius: '50%',
          padding: 4,
          background: 'rgba(255,255,255,0.75)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.9)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {photo_path ? (
            <img src={photo_path} alt={display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: 26 }}>👤</span>
          )}
        </div>
      </div>

      {/* Name */}
      <p style={{ fontWeight: 600, color: '#3D2B1F', fontSize: '0.92rem', lineHeight: 1.2, margin: 0 }}>
        {display_name}
      </p>

      {/* Pronoun badge: white pill, soft colored text */}
      <span
        style={{
          background: 'rgba(255,255,255,0.8)',
          color: textColor,
          fontSize: '0.7rem',
          fontWeight: 600,
          padding: '0.2rem 0.7rem',
          borderRadius: 999,
          letterSpacing: '0.01em',
        }}
      >
        {pronouns}
      </span>

      {/* Tagline */}
      {tagline && (
        <p style={{ fontSize: '0.7rem', color: textColor, margin: 0, fontStyle: 'italic', opacity: 0.85 }}>
          {tagline}
        </p>
      )}

      {/* Distance */}
      {distance_meters != null && (
        <p style={{ fontSize: '0.7rem', color: '#a16207', margin: 0, opacity: 0.7 }}>
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
        background: '#FDF8F0',
        borderTop: '1px solid #e9dcc8',
        display: 'flex',
      }}
    >
      {[
        { key: 'grid', label: 'Nearby', icon: '🌸' },
        { key: 'profile', label: 'My Profile', icon: '🌿' },
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
            color: tab === key ? '#92400e' : '#c4a882',
            fontWeight: tab === key ? 700 : 400,
            fontSize: '0.75rem',
          }}
        >
          <span style={{ fontSize: 20 }}>{icon}</span>
          <span>{label}</span>
          {tab === key && (
            <div
              style={{
                width: 28,
                height: 3,
                borderRadius: 2,
                background: 'linear-gradient(90deg, #fca5a5, #d97706)',
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
        background: '#FDF8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}
    >
      <div
        style={{
          background: '#fffdf9',
          borderRadius: '1.5rem',
          boxShadow: '0 8px 32px rgba(120,80,40,0.10)',
          padding: '2.5rem 2rem',
          width: '100%',
          maxWidth: 360,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Floral corner accent */}
        <div
          style={{
            position: 'absolute',
            top: -8,
            right: -8,
            fontSize: 64,
            opacity: 0.18,
            lineHeight: 1,
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          🌸
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: -10,
            left: -8,
            fontSize: 52,
            opacity: 0.14,
            lineHeight: 1,
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          🌿
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem', position: 'relative' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🏷️</div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#3D2B1F', margin: 0 }}>Nametag</h1>
          <p style={{ color: '#a16207', fontSize: '0.82rem', marginTop: 4 }}>
            {mode === 'login' ? 'Welcome back 🌸' : 'Join the garden 🌿'}
          </p>
        </div>

        {error && (
          <div
            style={{
              background: '#fff5f5',
              border: '1px solid #fca5a5',
              borderRadius: '0.75rem',
              padding: '0.65rem 0.9rem',
              color: '#b91c1c',
              fontSize: '0.8rem',
              marginBottom: '1rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', position: 'relative' }}>
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            style={{
              border: '1.5px solid #e9dcc8',
              borderRadius: '0.875rem',
              padding: '0.7rem 1rem',
              fontSize: '0.88rem',
              outline: 'none',
              color: '#3D2B1F',
              background: '#fffdf9',
            }}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            style={{
              border: '1.5px solid #e9dcc8',
              borderRadius: '0.875rem',
              padding: '0.7rem 1rem',
              fontSize: '0.88rem',
              outline: 'none',
              color: '#3D2B1F',
              background: '#fffdf9',
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #fca5a5, #d97706)',
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

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.8rem', color: '#a16207', position: 'relative' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => onModeChange(mode === 'login' ? 'signup' : 'login')}
            style={{
              background: 'none',
              border: 'none',
              color: '#b45309',
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

export function DesignCPreview() {
  return (
    <div style={{ background: '#FDF8F0', minHeight: '100%', padding: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
        {FAKE_PEOPLE.map((p, i) => (
          <PersonCard key={p.display_name} {...p} index={i} />
        ))}
      </div>
      <NavBar tab="grid" onTabChange={() => {}} />
    </div>
  );
}
