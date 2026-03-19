import { useNearbyPeople } from '../hooks/useNearbyPeople';
import { PersonCard } from '../designs/DesignE';

export default function GridPage() {
  const { nearby, myProfile, locationError, loading, isActive, lastUpdated, refresh, toggleVisibility } = useNearbyPeople();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-caveat font-bold text-ink" style={{ fontSize: 28 }}>
            Nearby
          </h2>
          {lastUpdated && (
            <p className="text-xs text-dim">Updated {lastUpdated.toLocaleTimeString()}</p>
          )}
        </div>
        <button
          onClick={refresh}
          className="font-caveat text-sm font-semibold text-brand"
          style={{ fontSize: 16 }}
        >
          Refresh
        </button>
      </div>

      {/* Visibility banner */}
      {myProfile && !myProfile.always_visible && (
        <div
          className={`mb-5 rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer border ${
            isActive ? 'bg-green-50 border-green-200' : 'bg-slate-100 border-slate-200'
          }`}
          onClick={() => toggleVisibility(myProfile.always_visible)}
        >
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {isActive ? '✅ You are visible to others' : '🙈 You are hidden'}
            </p>
            <p className="text-xs text-slate-500">
              {isActive
                ? 'Tap to hide yourself from the grid.'
                : 'Tap to make your name and pronouns visible to nearby people.'}
            </p>
          </div>
          <div className={`w-10 h-6 rounded-full transition-colors ${isActive ? 'bg-green-500' : 'bg-slate-300'} relative flex-shrink-0`}>
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${isActive ? 'left-5' : 'left-1'}`} />
          </div>
        </div>
      )}

      {myProfile?.always_visible && (
        <div className="mb-5 rounded-xl px-4 py-3 border text-brand" style={{ backgroundColor: '#E6394610', borderColor: '#E6394630' }}>
          <p className="text-sm">
            <span className="font-semibold">You're always visible.</span> To change this, go to your profile settings.
          </p>
        </div>
      )}

      {/* Location error */}
      {locationError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {locationError}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="text-center py-16 font-caveat text-dim" style={{ fontSize: 20 }}>
          Looking for people nearby…
        </div>
      ) : nearby.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">👋</p>
          <p className="text-slate-600 font-medium">No one nearby right now</p>
          <p className="text-slate-400 text-sm mt-1">Check back when you're around others using Nametag.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 justify-items-center">
          {nearby.map((person, i) => (
            <PersonCard key={person.id} person={person} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
