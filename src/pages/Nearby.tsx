import React, { useState, useEffect } from 'react';
import { 
  Crosshair, 
  MapPin, 
  Map, 
  LayoutGrid, 
  SlidersHorizontal, 
  Navigation, 
  Star, 
  Compass,
  ArrowUpRight
} from 'lucide-react';
import { Restaurant } from '../types/database';
import { api } from '../lib/supabase';
import { 
  getUserLocation, 
  calculateDistanceKm, 
  formatDistance, 
  GeoCoordinates,
  getCachedUserCoordinates,
  saveCachedUserCoordinates
} from '../lib/location';
import { RestaurantCard } from '../components/RestaurantCard';
import { RestaurantCardSkeleton } from '../components/Skeleton';
import { useToast } from '../components/Toast';

interface NearbyProps {
  navigate: (path: string) => void;
}

export const Nearby: React.FC<NearbyProps> = ({ navigate }) => {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [userCoords, setUserCoords] = useState<GeoCoordinates | null>(() => getCachedUserCoordinates());
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // Filters
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState<string>('all');

  useEffect(() => {
    loadData();
    requestLocation();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getRestaurants(true);
      setRestaurants(data);
    } finally {
      setLoading(false);
    }
  };

  const requestLocation = async () => {
    setLocating(true);
    try {
      const coords = await getUserLocation();
      setUserCoords(coords);
      saveCachedUserCoordinates(coords);
      window.dispatchEvent(new CustomEvent('menumap_location_updated', { detail: coords }));
    } catch (e: any) {
      console.warn('Geolocation error:', e);
      if (!userCoords) {
        showToast('Could not access GPS location. Showing venues from default city.', 'info');
        // Default to New Delhi coordinates
        setUserCoords({ latitude: 28.6139, longitude: 77.2090 });
      }
    } finally {
      setLocating(false);
    }
  };

  const cuisinesList = Array.from(
    new Set(restaurants.flatMap((r) => r.cuisine_types || []))
  );

  // Compute distance and sort
  const restaurantsWithDistance = restaurants
    .map((r) => {
      const dist = userCoords
        ? calculateDistanceKm(userCoords.latitude, userCoords.longitude, r.latitude, r.longitude)
        : 0;
      return { ...r, distanceKm: dist };
    })
    .filter((r) => {
      if (userCoords && r.distanceKm > radiusKm) return false;
      if (onlyOpen && (!r.is_open || r.is_temporarily_closed)) return false;
      if (selectedCuisine !== 'all' && !r.cuisine_types?.includes(selectedCuisine)) return false;
      return true;
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-rose-600">
            <Crosshair className="w-4 h-4" />
            <span>Geolocation Discovery</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Cafes & Restaurants Near You
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {userCoords
              ? `Showing places within ${radiusKm} km of your detected location.`
              : 'Detecting your coordinates...'}
          </p>
        </div>

        {/* View mode toggle & Re-detect button */}
        <div className="flex items-center gap-3">
          <button
            onClick={requestLocation}
            disabled={locating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-stone-200 hover:bg-stone-50 text-xs font-bold text-slate-700 shadow-2xs transition-colors"
          >
            <Crosshair className={`w-3.5 h-3.5 text-rose-500 ${locating ? 'animate-spin' : ''}`} />
            <span>{locating ? 'Locating...' : 'Refresh GPS'}</span>
          </button>

          <div className="flex items-center bg-stone-100 p-1 rounded-2xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'map'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Map View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Radius and Cuisine Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-2xs">
        <span className="text-xs font-bold text-slate-500">Radius:</span>
        {[3, 5, 10, 25, 50].map((km) => (
          <button
            key={km}
            onClick={() => setRadiusKm(km)}
            className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors ${
              radiusKm === km
                ? 'bg-rose-500 text-white border-rose-500 shadow-2xs'
                : 'bg-stone-50 text-slate-700 border-stone-200 hover:bg-stone-100'
            }`}
          >
            {km} km
          </button>
        ))}

        <div className="h-5 w-px bg-stone-200 mx-1 hidden sm:block" />

        <button
          onClick={() => setOnlyOpen(!onlyOpen)}
          className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors ${
            onlyOpen
              ? 'bg-teal-600 text-white border-teal-600'
              : 'bg-stone-50 text-slate-700 border-stone-200 hover:bg-stone-100'
          }`}
        >
          Open Now
        </button>

        {cuisinesList.length > 0 && (
          <select
            value={selectedCuisine}
            onChange={(e) => setSelectedCuisine(e.target.value)}
            className="bg-stone-50 border border-stone-200 text-slate-700 font-bold text-xs rounded-xl px-3 py-1 focus:outline-hidden"
          >
            <option value="all">All Cuisines</option>
            {cuisinesList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Main Content: Map or Grid */}
      {viewMode === 'map' ? (
        /* Visual Interactive Coordinate Radar Map */
        <div className="bg-stone-900 rounded-3xl p-6 shadow-xl border border-stone-800 text-white space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-rose-400" />
              <h3 className="font-heading font-extrabold text-base">
                Interactive Coordinates Radar
              </h3>
            </div>
            <span className="text-xs text-stone-400">
              {restaurantsWithDistance.length} venues mapped within {radiusKm} km
            </span>
          </div>

          {/* Interactive Map Visual Area */}
          <div className="relative aspect-[21/9] min-h-[360px] bg-stone-950 rounded-2xl border border-stone-800 overflow-hidden flex items-center justify-center p-4">
            
            {/* Radar Grid Circles */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <div className="w-[500px] h-[500px] rounded-full border border-dashed border-teal-500 animate-pulse" />
              <div className="absolute w-[320px] h-[320px] rounded-full border border-stone-500" />
              <div className="absolute w-[160px] h-[160px] rounded-full border border-stone-500" />
            </div>

            {/* User Center Pin */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/50 ring-4 ring-rose-500/30 animate-pulse">
                <Crosshair className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-rose-300 mt-1 bg-black/60 px-2 py-0.5 rounded-full">
                You are here
              </span>
            </div>

            {/* Mapped Restaurant Pins Scattered based on coords offset */}
            {restaurantsWithDistance.map((r, i) => {
              // Calculate visual angle & distance offset
              const angle = (i * (360 / Math.max(1, restaurantsWithDistance.length))) * (Math.PI / 180);
              const normDist = Math.min(180, Math.max(50, (r.distanceKm / radiusKm) * 160));
              const leftOffset = Math.cos(angle) * normDist;
              const topOffset = Math.sin(angle) * normDist;

              return (
                <div
                  key={r.id}
                  style={{
                    transform: `translate(${leftOffset}px, ${topOffset}px)`,
                  }}
                  onClick={() => navigate(`/restaurant/${r.slug}`)}
                  className="absolute z-20 group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-amber-400 group-hover:bg-rose-500 text-stone-900 group-hover:text-white flex items-center justify-center font-black text-xs shadow-md transition-all group-hover:scale-125">
                    <MapPin className="w-4 h-4" />
                  </div>

                  {/* Tooltip on Hover */}
                  <div className="hidden group-hover:flex flex-col absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white text-slate-900 p-2.5 rounded-xl shadow-2xl border border-stone-200 text-xs w-48 pointer-events-none z-30">
                    <span className="font-extrabold truncate">{r.name}</span>
                    <span className="text-[10px] text-slate-500">
                      {formatDistance(r.distanceKm)} away • ★ {r.rating_avg.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-rose-600 font-bold mt-1">
                      Click to view menu →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick list below map */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {restaurantsWithDistance.slice(0, 6).map((r) => (
              <div
                key={r.id}
                onClick={() => navigate(`/restaurant/${r.slug}`)}
                className="flex items-center justify-between p-3 rounded-2xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700/80 cursor-pointer transition-colors"
              >
                <div className="min-w-0 pr-2">
                  <div className="font-bold text-sm text-white truncate">{r.name}</div>
                  <div className="text-xs text-emerald-400 font-semibold">
                    {formatDistance(r.distanceKm)} away
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-stone-400 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Grid View */
        <div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <RestaurantCardSkeleton key={n} />
              ))}
            </div>
          ) : restaurantsWithDistance.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {restaurantsWithDistance.map((r) => (
                <RestaurantCard
                  key={r.id}
                  restaurant={r}
                  navigate={navigate}
                  userDistanceKm={r.distanceKm}
                />
              ))}
            </div>
          ) : (
            <div className="bg-stone-50 border-2 border-dashed border-stone-200 rounded-3xl p-16 text-center space-y-3">
              <Compass className="w-12 h-12 text-stone-400 mx-auto" />
              <h3 className="font-heading font-extrabold text-xl text-slate-800">
                No places within {radiusKm} km
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                Try increasing your search radius or clearing active filters.
              </p>
              <button
                onClick={() => setRadiusKm(50)}
                className="px-5 py-2.5 bg-rose-500 text-white font-bold rounded-2xl text-xs shadow-md"
              >
                Expand Radius to 50 km
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
