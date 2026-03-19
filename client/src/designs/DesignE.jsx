// Design E — "Classic Nametag Sticker"
// Physical hello-my-name-is badge: photo on top, sticker below with
// colored header band, handwritten name, pronouns strip at the bottom.

import { BANNER_COLOR_HEXES } from '../constants';
import { photoUrl } from '../api';

export function PersonCard({ display_name, pronouns, tagline, photo_path, distance_meters, tag_color, stickers, index = 0 }) {
  const bannerColor = tag_color || BANNER_COLOR_HEXES[index % BANNER_COLOR_HEXES.length];
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
          ? <img src={photoUrl(photo_path)} alt={display_name} className="w-full h-full object-cover" />
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
