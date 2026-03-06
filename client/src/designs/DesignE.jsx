// Design E — "Classic Nametag Sticker"
// Physical hello-my-name-is badge: photo on top, sticker below with
// colored header band, handwritten name, pronouns strip at the bottom.

const BANNER_COLORS = [
  '#E63946', // red
  '#2563EB', // blue
  '#16A34A', // green
  '#D97706', // amber
  '#7C3AED', // purple
  '#0891B2', // cyan
];

export function PersonCard({ display_name, pronouns, tagline, photo_path, distance_meters, tag_color, stickers, index = 0 }) {
  const bannerColor = tag_color || BANNER_COLORS[index % BANNER_COLORS.length];
  const rotation = (index % 2 === 0 ? -1 : 1) * (0.8 + (index % 3) * 0.4);
  let stickerList = [];
  try { stickerList = stickers ? JSON.parse(stickers) : []; } catch {}

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Photo */}
      <div
        className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md flex items-center justify-center bg-slate-100"
        style={{ zIndex: 1 }}
      >
        {photo_path
          ? <img src={photo_path} alt={display_name} className="w-full h-full object-cover" />
          : <span className="text-4xl">👤</span>
        }
      </div>

      {/* Sticker badge */}
      <div
        className="bg-white rounded-sm overflow-hidden"
        style={{
          width: 160,
          boxShadow: '2px 3px 12px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
          transform: `rotate(${rotation}deg)`,
          transformOrigin: 'center top',
        }}
      >
        {/* Colored header band */}
        <div
          className="px-3 pt-2 pb-1"
          style={{ backgroundColor: bannerColor }}
        >
          <p
            className="text-white uppercase tracking-widest font-bold"
            style={{ fontSize: 8, letterSpacing: '0.18em', lineHeight: 1.2 }}
          >
            HELLO
          </p>
          <p
            className="text-white uppercase font-semibold"
            style={{ fontSize: 7, opacity: 0.9, letterSpacing: '0.12em' }}
          >
            my name is
          </p>
        </div>

        {/* Handwritten name area */}
        <div
          className="px-3 py-2 flex items-center justify-center"
          style={{ minHeight: 56, backgroundColor: '#fff' }}
        >
          <p
            style={{
              fontFamily: "'Caveat', cursive",
              fontSize: display_name.length > 12 ? 22 : 28,
              fontWeight: 700,
              color: '#1a1a1a',
              lineHeight: 1.1,
              textAlign: 'center',
              wordBreak: 'break-word',
            }}
          >
            {display_name}
          </p>
        </div>

        {/* Tagline */}
        {tagline && (
          <div className="px-3 pb-1 text-center">
            <p
              style={{
                fontFamily: "'Caveat', cursive",
                fontSize: 12,
                color: '#555',
                fontStyle: 'italic',
                lineHeight: 1.2,
              }}
            >
              {tagline}
            </p>
          </div>
        )}

        {/* Stickers row */}
        {stickerList.length > 0 && (
          <div className="px-3 pb-1 flex gap-1 justify-center">
            {stickerList.map((s, i) => (
              <span key={i} style={{ fontSize: 16 }}>{s}</span>
            ))}
          </div>
        )}

        {/* Pronouns strip */}
        <div
          className="px-3 py-1.5 flex items-center justify-between"
          style={{ backgroundColor: bannerColor + '18', borderTop: `2px solid ${bannerColor}22` }}
        >
          <p
            style={{
              fontFamily: "'Caveat', cursive",
              fontSize: 14,
              color: bannerColor,
              fontWeight: 500,
            }}
          >
            {pronouns}
          </p>
          {distance_meters != null && (
            <p
              className="text-xs font-medium"
              style={{ color: '#999', fontSize: 10 }}
            >
              {distance_meters < 10 ? 'here' : `${Math.round(distance_meters)}m`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function NavBar({ tab, onTabChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-100">
      <div className="max-w-2xl mx-auto flex">
        {[
          { id: 'grid', icon: '👥', label: 'Nearby' },
          { id: 'profile', icon: '🏷️', label: 'My tag' },
        ].map(({ id, icon, label }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className="flex-1 py-3 flex flex-col items-center gap-0.5"
          >
            <span className="text-xl">{icon}</span>
            <span
              className="text-xs font-bold uppercase tracking-wider"
              style={{
                color: tab === id ? '#E63946' : '#aaa',
                fontFamily: "'Caveat', cursive",
                fontSize: 13,
              }}
            >
              {label}
            </span>
            {tab === id && (
              <div className="w-6 h-1 rounded-full mt-0.5" style={{ backgroundColor: '#E63946' }} />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}

export function AuthForm({ mode, onModeChange, onSubmit, loading, error }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#f5f5f0' }}>
      <div className="w-full max-w-sm">
        {/* Big sticker logo */}
        <div className="flex justify-center mb-8">
          <div
            className="bg-white rounded-sm overflow-hidden"
            style={{
              width: 200,
              boxShadow: '3px 4px 16px rgba(0,0,0,0.15)',
              transform: 'rotate(-2deg)',
            }}
          >
            <div className="px-4 pt-3 pb-1.5" style={{ backgroundColor: '#E63946' }}>
              <p className="text-white font-bold uppercase" style={{ fontSize: 9, letterSpacing: '0.2em' }}>HELLO</p>
              <p className="text-white font-semibold uppercase" style={{ fontSize: 8, opacity: 0.9, letterSpacing: '0.12em' }}>my name is</p>
            </div>
            <div className="px-4 py-3 text-center">
              <p style={{ fontFamily: "'Caveat', cursive", fontSize: 36, fontWeight: 700, color: '#1a1a1a', lineHeight: 1 }}>
                Nametag
              </p>
            </div>
            <div className="px-4 py-1.5" style={{ backgroundColor: '#E6394618', borderTop: '2px solid #E6394622' }}>
              <p style={{ fontFamily: "'Caveat', cursive", fontSize: 14, color: '#E63946' }}>say hi! 👋</p>
            </div>
          </div>
        </div>

        {/* Auth card */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <div className="flex bg-gray-100 rounded-lg p-1 mb-5">
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => onModeChange(m)}
                className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${mode === m ? 'bg-white shadow text-gray-800' : 'text-gray-400'}`}
                style={mode === m ? { color: '#E63946' } : {}}
              >
                {m === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>
          {onSubmit}
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
}

const FAKE_PEOPLE = [
  { display_name: 'Alex', pronouns: 'they/them', tagline: 'coffee & code', distance_meters: 8 },
  { display_name: 'Jordan', pronouns: 'she/her', tagline: 'always vibing', distance_meters: 47 },
  { display_name: 'Sam', pronouns: 'he/him', distance_meters: 103 },
  { display_name: 'Riley', pronouns: 'ze/zir', tagline: 'ask me about plants', distance_meters: 22 },
  { display_name: 'Morgan', pronouns: 'she/they', distance_meters: 65 },
  { display_name: 'Avery', pronouns: 'he/him', tagline: 'making music', distance_meters: 134 },
];

export function DesignEPreview() {
  return (
    <div>
      <h3
        className="text-2xl font-bold mb-1"
        style={{ fontFamily: "'Caveat', cursive", color: '#E63946' }}
      >
        Design E — Classic Nametag Sticker
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        Physical "HELLO my name is" badge with a handwritten name. Photo floats above, sticker sits below with a colored banner, name in Caveat script, and pronoun strip at the bottom. Each card gets a different color and a subtle rotation.
      </p>

      {/* Grid preview */}
      <div
        className="rounded-2xl p-6"
        style={{ backgroundColor: '#f5f5f0' }}
      >
        <div className="grid grid-cols-2 gap-6 justify-items-center">
          {FAKE_PEOPLE.map((p, i) => (
            <PersonCard key={i} {...p} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
