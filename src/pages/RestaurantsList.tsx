import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  MapPin, 
  Crosshair, 
  ArrowUpDown, 
  SlidersHorizontal, 
  Map, 
  LayoutGrid, 
  ArrowUpRight,
  Sparkles,
  Search
} from 'lucide-react';
import { Restaurant } from '../types/database';
import { api } from '../lib/supabase';
import { RestaurantCard } from '../components/RestaurantCard';
import { RestaurantCardSkeleton } from '../components/Skeleton';
import { 
  getUserLocation, 
  calculateDistanceKm, 
  formatDistance, 
  GeoCoordinates,
  getCachedUserCoordinates,
  saveCachedUserCoordinates,
  getNearestAreaName
} from '../lib/location';
import { useToast } from '../components/Toast';

interface RestaurantsListProps {
  navigate: (path: string) => void;
  initialMode?: 'near_me' | 'explore';
}

const DELHI_NEIGHBORHOODS = [
  { id: 'all', label: 'All Delhi NCR' },
  { id: 'satya_niketan', label: 'Satya Niketan (South Campus)', query: 'satya niketan|south campus|venky' },
  { id: 'malviya_saket', label: 'Malviya Nagar & Saket', query: 'malviya|saket|khirki|shivalik' },
  { id: 'hkv_sda', label: 'Hauz Khas & SDA', query: 'hauz khas|hkv|sda|shahpur jat' },
  { id: 'mukherjee_nagar', label: 'Mukherjee Nagar', query: 'mukherjee|batra|parmanand|gandhi vihar|nehru vihar' },
  { id: 'majnu_ka_tilla', label: 'Majnu Ka Tilla (MKT)', query: 'majnu|mkt|tibetan' },
  { id: 'rajendra_karol_bagh', label: 'Karol Bagh & Rajendra Nagar', query: 'karol bagh|rajendra|rajinder|bada bazar|pusa' },
  { id: 'north_campus', label: 'North Campus / Hudson', query: 'north campus|hudson|kamla' },
  { id: 'cp', label: 'Connaught Place', query: 'connaught|cp' },
  { id: 'nangloi', label: 'Nangloi & West Delhi', query: 'nangloi' },
  { id: 'old_delhi', label: 'Old Delhi / Chandni Chowk', query: 'chandni chowk|old delhi|chawri' },
  { id: 'rajouri', label: 'Rajouri Garden', query: 'rajouri' },
];

export const RestaurantsList: React.FC<RestaurantsListProps> = ({ 
  navigate,
  initialMode = 'explore' 
}) => {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [userCoords, setUserCoords] = useState<GeoCoordinates | null>(() => getCachedUserCoordinates());
  const [locating, setLocating] = useState(false);
  const [detectedArea, setDetectedArea] = useState<string>('Delhi NCR');

  // Unified Mode: 'near_me' or 'explore'
  const [activeTab, setActiveTab] = useState<'near_me' | 'explore'>(initialMode);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // Near Me Radius filter
  const [radiusKm, setRadiusKm] = useState<number>(10);

  // Explore Localities filter
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('all');

  // Common Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCuisine, setFilterCuisine] = useState<string>('all');
  const [onlyPureVeg, setOnlyPureVeg] = useState(false);
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'cost_low' | 'cost_high' | 'distance'>('rating');

  useEffect(() => {
    loadData();
    // Auto-detect GPS coordinates
    handleLocate(false);

    const handleLocationUpdate = (e: any) => {
      if (e.detail) {
        setUserCoords(e.detail);
      }
    };
    window.addEventListener('menumap_location_updated', handleLocationUpdate);
    return () => window.removeEventListener('menumap_location_updated', handleLocationUpdate);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getRestaurants(true);
      setRestaurants(data);
      if (userCoords) {
        const area = getNearestAreaName(userCoords, data);
        if (area) setDetectedArea(area);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLocate = async (showNotification = true) => {
    setLocating(true);
    try {
      const coords = await getUserLocation();
      setUserCoords(coords);
      saveCachedUserCoordinates(coords);
      window.dispatchEvent(new CustomEvent('menumap_location_updated', { detail: coords }));
      if (restaurants.length > 0) {
        const area = getNearestAreaName(coords, restaurants);
        if (area) setDetectedArea(area);
      }
      if (showNotification) {
        showToast('Live GPS location detected successfully!', 'success');
      }
    } catch (e: any) {
      if (!userCoords) {
        setUserCoords({ latitude: 28.6139, longitude: 77.2090 });
      }
      if (showNotification) {
        showToast('Could not retrieve precise GPS. Showing Delhi NCR coordinates.', 'info');
      }
    } finally {
      setLocating(false);
    }
  };

  const cuisinesList = Array.from(
    new Set(restaurants.flatMap((r) => r.cuisine_types || []))
  );

  // Compute distances
  const restaurantsWithDistance = restaurants.map((r) => {
    const dist = userCoords
      ? calculateDistanceKm(userCoords.latitude, userCoords.longitude, r.latitude, r.longitude)
      : undefined;
    return { ...r, distanceKm: dist };
  });

  // Filter based on active tab and settings
  const filtered = restaurantsWithDistance.filter((r) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = r.name.toLowerCase().includes(q);
      const matchCuisine = r.cuisine_types?.some((c) => c.toLowerCase().includes(q));
      const matchArea = (r.city || '').toLowerCase().includes(q) || (r.address_line1 || '').toLowerCase().includes(q) || (r.landmark || '').toLowerCase().includes(q);
      if (!matchName && !matchCuisine && !matchArea) return false;
    }

    // Near Me specific: Radius threshold
    if (activeTab === 'near_me' && userCoords) {
      if (r.distanceKm !== undefined && r.distanceKm > radiusKm) return false;
    }

    // Explore specific: Neighborhood filter
    if (activeTab === 'explore' && selectedNeighborhood !== 'all') {
      const hood = DELHI_NEIGHBORHOODS.find((n) => n.id === selectedNeighborhood);
      if (hood?.query) {
        const regex = new RegExp(hood.query, 'i');
        const textToMatch = `${r.name} ${r.city} ${r.address_line1 || ''} ${r.landmark || ''} ${r.heritage_area ? 'heritage' : ''}`;
        if (!regex.test(textToMatch)) return false;
      }
    }

    // Cuisine filter
    if (filterCuisine !== 'all' && !r.cuisine_types?.includes(filterCuisine)) return false;

    // Pure veg
    if (onlyPureVeg && !r.dietary_options?.includes('Pure Veg')) return false;

    // Open now
    if (onlyOpen && (!r.is_open || r.is_temporarily_closed)) return false;

    return true;
  });

  // Sort list
  const sorted = [...filtered].sort((a, b) => {
    if (activeTab === 'near_me' || sortBy === 'distance') {
      return (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999);
    }
    if (sortBy === 'rating') return b.rating_avg - a.rating_avg;
    if (sortBy === 'cost_low') return a.average_cost_for_two - b.average_cost_for_two;
    if (sortBy === 'cost_high') return b.average_cost_for_two - a.average_cost_for_two;
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-xs font-black uppercase tracking-widest text-rose-600 mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Unified Cafe Discovery</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Explore Cafes & Near Me
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Discover verified counter menus, seating vibes, ratings, and genuine prices near your live location or across Delhi NCR.
          </p>
        </div>

        {/* Live GPS Status & Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleLocate(true)}
            disabled={locating}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-stone-200 shadow-2xs hover:border-orange-300 text-xs font-bold text-slate-700 hover:text-orange-600 transition-all cursor-pointer"
            title="Update live coordinates"
          >
            <Crosshair className={`w-3.5 h-3.5 text-rose-500 ${locating ? 'animate-spin' : ''}`} />
            <span>{locating ? 'Detecting GPS...' : detectedArea !== 'Delhi NCR' ? `GPS: ${detectedArea}` : 'Detect Live GPS'}</span>
          </button>
        </div>
      </div>

      {/* Primary Discovery Tabs: Near Me vs Explore All */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-stone-100/80 p-1.5 rounded-2xl border border-stone-200">
        <div className="grid grid-cols-2 gap-1.5 sm:flex sm:items-center">
          <button
            onClick={() => setActiveTab('near_me')}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'near_me'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Near Me (Live GPS)</span>
          </button>

          <button
            onClick={() => setActiveTab('explore')}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'explore'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Explore All Cafes & Areas</span>
          </button>
        </div>

        {/* View Mode Toggle when on Near Me */}
        {activeTab === 'near_me' ? (
          <div className="flex items-center justify-end gap-1 bg-white p-1 rounded-xl border border-stone-200 self-end sm:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-rose-50 text-rose-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-rose-50 text-rose-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Radar Map</span>
            </button>
          </div>
        ) : (
          /* Sort selector for Explore */
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-stone-200 text-slate-700 font-bold text-xs rounded-xl px-3 py-1.5 shadow-2xs focus:outline-hidden"
            >
              <option value="rating">Top Rated First</option>
              {userCoords && <option value="distance">Nearest to Me</option>}
              <option value="cost_low">Cost: Low to High</option>
              <option value="cost_high">Cost: High to Low</option>
            </select>
          </div>
        )}
      </div>

      {/* Secondary Controls based on Tab */}
      {activeTab === 'near_me' ? (
        /* Near Me Radius Filter */
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Distance Radius:</span>
          {[3, 5, 10, 20, 50].map((km) => (
            <button
              key={km}
              onClick={() => setRadiusKm(km)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                radiusKm === km
                  ? 'bg-rose-500 text-white border-rose-500 shadow-2xs'
                  : 'bg-stone-50 text-slate-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              {km} km
            </button>
          ))}
          <span className="text-[11px] font-semibold text-slate-400 ml-auto">
            {sorted.length} cafes within {radiusKm} km
          </span>
        </div>
      ) : (
        /* Explore Localities Pills */
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span>Select Locality / Food Zone:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {DELHI_NEIGHBORHOODS.map((hood) => (
              <button
                key={hood.id}
                onClick={() => setSelectedNeighborhood(hood.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                  selectedNeighborhood === hood.id
                    ? 'bg-rose-500 text-white border-rose-500 shadow-2xs'
                    : 'bg-white text-slate-700 border-stone-200 hover:bg-stone-50'
                }`}
              >
                {hood.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Common Quick Filters (Cuisine & Dietary) */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilterCuisine('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
            filterCuisine === 'all'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-700 border-stone-200 hover:bg-stone-50'
          }`}
        >
          All Cuisines
        </button>

        {cuisinesList.slice(0, 6).map((c) => (
          <button
            key={c}
            onClick={() => setFilterCuisine(c === filterCuisine ? 'all' : c)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
              filterCuisine === c
                ? 'bg-rose-500 text-white border-rose-500'
                : 'bg-white text-slate-700 border-stone-200 hover:bg-stone-50'
            }`}
          >
            {c}
          </button>
        ))}

        <div className="h-5 w-px bg-stone-200 mx-1 hidden sm:block" />

        <button
          onClick={() => setOnlyPureVeg(!onlyPureVeg)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
            onlyPureVeg
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-white text-slate-700 border-stone-200 hover:bg-stone-50'
          }`}
        >
          Pure Veg Only
        </button>

        <button
          onClick={() => setOnlyOpen(!onlyOpen)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
            onlyOpen
              ? 'bg-teal-600 text-white border-teal-600'
              : 'bg-white text-slate-700 border-stone-200 hover:bg-stone-50'
          }`}
        >
          Open Now
        </button>
      </div>

      {/* Main Content: Map or Grid */}
      {activeTab === 'near_me' && viewMode === 'map' ? (
        /* Radar Map View */
        <div className="bg-stone-900 rounded-3xl p-6 shadow-xl border border-stone-800 text-white space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-rose-400" />
              <h3 className="font-heading font-extrabold text-base">
                Interactive Coordinates Radar
              </h3>
            </div>
            <span className="text-xs text-stone-400">
              {sorted.length} venues mapped within {radiusKm} km
            </span>
          </div>

          <div className="relative aspect-[21/9] min-h-[360px] bg-stone-950 rounded-2xl border border-stone-800 overflow-hidden flex items-center justify-center p-4">
            {/* Grid circles */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <div className="w-[500px] h-[500px] rounded-full border border-dashed border-teal-500 animate-pulse" />
              <div className="absolute w-[320px] h-[320px] rounded-full border border-stone-500" />
              <div className="absolute w-[160px] h-[160px] rounded-full border border-stone-500" />
            </div>

            {/* Center user location */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/50 ring-4 ring-rose-500/30 animate-pulse">
                <Crosshair className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-rose-300 mt-1 bg-black/60 px-2 py-0.5 rounded-full">
                {detectedArea}
              </span>
            </div>

            {/* Mapped pins */}
            {sorted.map((r, i) => {
              const angle = (i * (360 / Math.max(1, sorted.length))) * (Math.PI / 180);
              const distVal = r.distanceKm ?? 1;
              const normDist = Math.min(180, Math.max(50, (distVal / radiusKm) * 160));
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

                  <div className="hidden group-hover:flex flex-col absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white text-slate-900 p-2.5 rounded-xl shadow-2xl border border-stone-200 text-xs w-48 pointer-events-none z-30">
                    <span className="font-extrabold truncate">{r.name}</span>
                    <span className="text-[10px] text-slate-500">
                      {formatDistance(r.distanceKm ?? 0)} away • ★ {r.rating_avg.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-rose-600 font-bold mt-1">
                      Click to view menu →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {sorted.slice(0, 6).map((r) => (
              <div
                key={r.id}
                onClick={() => navigate(`/restaurant/${r.slug}`)}
                className="flex items-center justify-between p-3 rounded-2xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700/80 cursor-pointer transition-colors"
              >
                <div className="min-w-0 pr-2">
                  <div className="font-bold text-sm text-white truncate">{r.name}</div>
                  <div className="text-xs text-emerald-400 font-semibold">
                    {formatDistance(r.distanceKm ?? 0)} away
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-stone-400 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Grid of Restaurant Cards */
        <div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <RestaurantCardSkeleton key={n} />
              ))}
            </div>
          ) : sorted.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {sorted.map((r) => (
                <RestaurantCard
                  key={r.id}
                  restaurant={r}
                  navigate={navigate}
                  userDistanceKm={r.distanceKm}
                />
              ))}
            </div>
          ) : (
            <div className="bg-stone-50 border-2 border-dashed border-stone-200 rounded-3xl p-12 text-center space-y-3">
              <Compass className="w-12 h-12 text-stone-400 mx-auto" />
              <h3 className="font-heading font-extrabold text-lg text-slate-800">
                No cafes or restaurants found
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                {activeTab === 'near_me' 
                  ? `No venues located within ${radiusKm} km of your position. Try increasing the radius slider or switch to Explore All.`
                  : 'Try selecting a different locality or clearing cuisine filters.'}
              </p>
              {activeTab === 'near_me' && (
                <button
                  onClick={() => setRadiusKm(50)}
                  className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-colors"
                >
                  Expand Radius to 50 km
                </button>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
