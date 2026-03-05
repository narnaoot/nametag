// Design D — "Neon Fizz"
// Vibe: techy-playful, like a colorful app store screenshot

const GRADIENT_BORDERS = [
  'linear-gradient(180deg, #f472b6, #fb923c)',  // pink to orange
  'linear-gradient(180deg, #3b82f6, #34d399)',  // blue to green
  'linear-gradient(180deg, #a78bfa, #f472b6)',  // purple to pink
  'linear-gradient(180deg, #fb923c, #facc15)',  // orange to yellow
];

const AVATAR_COLORS = ['#ec4899', '#2563eb', '#84cc16', '#f97316'];

const BADGE_COLORS = ['#f472b6', '#3b82f6', '#84cc16', '#f97316'];

function getGradientBorder(index) {
  return GRADIENT_BORDERS[index % GRADIENT_BORDERS.length];
}
function getAvatarColor(index) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}
function getBadgeColor(index) {
  return BADGE_COLORS[index % BADGE_COLORS.length];
}

export function PersonCard({ display_name, pronouns, photo_path, distance_meters, index = 0 }) {
  const gradientBorder = getGradientBorder(index);
  const avatarColor = getAvatarColor(index);
  const badgeColor = getBadgeColor(index);

  const formatDistanceShort = (m) => {
    if (m == null) return null;
    if (m < 10) return 'here';
    if (m < 1000) return `${Math.round(m)}m`;
    return `${(m / 1000).toFixed(1)}km`;
  };

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '0.75rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '1rem 0.75rem',
        gap: '0.5rem',
        textAlign: 'center',
        position: 'relative',
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
        overflow: 'hidden',
      }}
    >
      {/* Colorful gradient left border via pseudo-element substitute */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: gradientBorder,
          borderRadius: '0.75rem 0 0 0.75rem',
        }}
      />

      {/* Avatar: circular, solid bright color background */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: photo_path ? '#f3f4f6' : avatarColor,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {photo_path ? (
          <img src={photo_path} alt={display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: 26, filter: 'brightness(10)' }}>👤</span>
        )}
      </div>

      {/* Name */}
      <p style={{ fontWeight: 800, color: '#000000', fontSize: '1.05rem', lineHeight: 1.15, margin: 0 }}>
        {display_name}
      </p>

      {/* Pronoun badge: monospace, colored text + underline, transparent bg */}
      <span
        style={{
          color: badgeColor,
          fontSize: '0.68rem',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontWeight: 600,
          background: 'transparent',
          textDecoration: 'underline',
          textDecorationColor: badgeColor,
          textUnderlineOffset: 2,
          padding: '0 0.1rem',
        }}
      >
        {pronouns}
      </span>

      {/* Distance badge */}
      {distance_meters != null && (
        <span
          style={{
            background: badgeColor,
            color: '#ffffff',
            fontSize: '0.65rem',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontWeight: 700,
            padding: '0.15rem 0.5rem',
            borderRadius: 999,
          }}
        >
          {formatDistanceShort(distance_meters)}
        </span>
      )}
    </div>
  );
}

export function NavBar({ tab, onTabChange }) {
  const DOT_COLORS = { grid: '#f472b6', profile: '#3b82f6' };

  return (
    <nav
      style={{
        background: '#ffffff',
        borderTop: '1px solid #f3f4f6',
        display: 'flex',
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
            color: tab === key ? '#000000' : '#9ca3af',
            fontWeight: tab === key ? 700 : 400,
            fontSize: '0.75rem',
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
                background: DOT_COLORS[key],
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
        background: '#F5F5F5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.25rem',
      }}
    >
      {/* Big colorful gradient logo */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: 900,
            background: 'linear-gradient(90deg, #f472b6, #3b82f6, #84cc16)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: 0,
            letterSpacing: '-0.02em',
          }}
        >
          Nametag
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: 4, fontFamily: 'ui-monospace, monospace' }}>
          // see who's nearby
        </p>
      </div>

      {error && (
        <div
          style={{
            background: '#ffffff',
            border: '2px solid #f472b6',
            borderRadius: '0.5rem',
            padding: '0.65rem 0.9rem',
            color: '#be185d',
            fontSize: '0.8rem',
            fontFamily: 'ui-monospace, monospace',
            marginBottom: '1rem',
            width: '100%',
            maxWidth: 340,
          }}
        >
          ! {error}
        </div>
      )}

      <form
        onSubmit={onSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
          width: '100%',
          maxWidth: 340,
        }}
      >
        <input
          name="email"
          type="email"
          placeholder="email@example.com"
          required
          style={{
            border: '2px solid #e5e7eb',
            borderRadius: '0.5rem',
            padding: '0.7rem 0.9rem',
            fontSize: '0.88rem',
            outline: 'none',
            color: '#111',
            background: '#ffffff',
            fontFamily: 'ui-monospace, monospace',
          }}
        />
        <input
          name="password"
          type="password"
          placeholder="••••••••"
          required
          style={{
            border: '2px solid #e5e7eb',
            borderRadius: '0.5rem',
            padding: '0.7rem 0.9rem',
            fontSize: '0.88rem',
            outline: 'none',
            color: '#111',
            background: '#ffffff',
            fontFamily: 'ui-monospace, monospace',
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            background: 'linear-gradient(90deg, #f472b6, #3b82f6)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '0.5rem',
            padding: '0.8rem',
            fontWeight: 800,
            fontSize: '0.95rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            letterSpacing: '0.02em',
          }}
        >
          {loading ? '…' : mode === 'login' ? 'Sign In →' : 'Sign Up →'}
        </button>
      </form>

      <p style={{ marginTop: '1.25rem', fontSize: '0.78rem', color: '#9ca3af', fontFamily: 'ui-monospace, monospace' }}>
        {mode === 'login' ? 'new here? ' : 'have account? '}
        <button
          onClick={() => onModeChange(mode === 'login' ? 'signup' : 'login')}
          style={{
            background: 'none',
            border: 'none',
            color: '#3b82f6',
            fontWeight: 700,
            cursor: 'pointer',
            padding: 0,
            fontSize: '0.78rem',
            fontFamily: 'ui-monospace, monospace',
          }}
        >
          {mode === 'login' ? 'sign_up()' : 'sign_in()'}
        </button>
      </p>
    </div>
  );
}

const FAKE_PEOPLE = [
  { display_name: 'Alex', pronouns: 'they/them', distance_meters: 12 },
  { display_name: 'Jordan', pronouns: 'she/her', distance_meters: 47 },
  { display_name: 'Sam', pronouns: 'he/him', distance_meters: 103 },
  { display_name: 'Riley', pronouns: 'ze/zir', distance_meters: 8 },
];

export function DesignDPreview() {
  return (
    <div style={{ background: '#F5F5F5', minHeight: '100%', padding: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
        {FAKE_PEOPLE.map((p, i) => (
          <PersonCard key={p.display_name} {...p} index={i} />
        ))}
      </div>
      <NavBar tab="grid" onTabChange={() => {}} />
    </div>
  );
}
