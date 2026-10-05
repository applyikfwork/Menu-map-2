import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  Crosshair, 
  ChevronDown, 
  X,
  SlidersHorizontal,
  ArrowUpDown,
  Check
} from 'lucide-react';
import { Restaurant } from '../types/database';
import { api } from '../lib/supabase';
import { RestaurantCard } from '../components/RestaurantCard';
import { 
  getUserLocation, 
  calculateDistanceKm, 
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

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('all');
  const [selectedPrice, setSelectedPrice] = useState<'all' | '₹' | '₹₹' | '₹₹₹'>('all');
  const [selectedDiet, setSelectedDiet] = useState<string>('all');
  const [selectedMeal, setSelectedMeal] = useState<string>('all');
  const [selectedAmenity, setSelectedAmenity] = useState<string>('all');
  const [distanceRadius, setDistanceRadius] = useState<number>(initialMode === 'near_me' ? 5 : 15);
  const [sortBy, setSortBy] = useState<'rating' | 'cost_low' | 'cost_high' | 'distance'>('rating');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    loadData();
    if (initialMode === 'near_me') {
      handleLocate(false);
    }

    const handleLocationUpdate = (e: any) => {
      if (e.detail) {
        setUserCoords(e.detail);
        if (restaurants.length > 0) {
          const area = getNearestAreaName(e.detail, restaurants);
          if (area) setDetectedArea(area);
        }
      }
    };
    window.addEventListener('menumap_location_updated', handleLocationUpdate);
    return () => window.removeEventListener('menumap_location_updated', handleLocationUpdate);
  }, [initialMode, restaurants.length]);

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
    } catch {
      if (showNotification) {
        showToast('Could not retrieve precise GPS. Showing Delhi NCR.', 'info');
      }
    } finally {
      setLocating(false);
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCuisine('all');
    setSelectedPrice('all');
    setSelectedDiet('all');
    setSelectedMeal('all');
    setSelectedAmenity('all');
    setDistanceRadius(15);
    setSortBy('rating');
  };

  // Distance calculation
  const restaurantsWithDistance = useMemo(() => {
    return restaurants.map((r) => {
      const dist = userCoords
        ? calculateDistanceKm(userCoords.latitude, userCoords.longitude, r.latitude, r.longitude)
        : undefined;
      return { ...r, distanceKm: dist };
    });
  }, [restaurants, userCoords]);

  // Cuisines list
  const cuisines = ['Cafe', 'North Indian', 'Chinese', 'Italian', 'Bakery', 'Street Food', 'Mughlai', 'Desserts'];
  const diets = ['Pure Veg', 'Halal', 'Jain', 'Vegan'];
  const meals = ['Breakfast', 'Lunch', 'Dinner', 'Night owls'];
  const amenities = ['AC', 'Outdoor', 'Wi-Fi', 'Rooftop', 'Live music'];

  // Filtered & Sorted
  const filteredRestaurants = useMemo(() => {
    return restaurantsWithDistance.filter((r) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = r.name.toLowerCase().includes(q);
        const matchesArea = (r.landmark || r.city || '').toLowerCase().includes(q);
        const matchesCuisine = r.cuisine_types?.some((c) => c.toLowerCase().includes(q));
        const matchesDish = r.known_for_dishes?.some((d) => d.toLowerCase().includes(q));
        if (!matchesName && !matchesArea && !matchesCuisine && !matchesDish) return false;
      }

      // Cuisine
      if (selectedCuisine !== 'all') {
        const matches = r.cuisine_types?.some((c) => c.toLowerCase() === selectedCuisine.toLowerCase());
        if (!matches) return false;
      }

      // Price
      if (selectedPrice !== 'all') {
        if (selectedPrice === '₹' && (r.average_cost_for_two || 0) > 300) return false;
        if (selectedPrice === '₹₹' && ((r.average_cost_for_two || 0) < 301 || (r.average_cost_for_two || 0) > 600)) return false;
        if (selectedPrice === '₹₹₹' && (r.average_cost_for_two || 0) < 601) return false;
      }

      // Diet
      if (selectedDiet !== 'all') {
        if (!r.dietary_options?.includes(selectedDiet as any)) return false;
      }

      // Amenities
      if (selectedAmenity !== 'all') {
        const hasAmenity = r.facilities?.some((f) => f.toLowerCase().includes(selectedAmenity.toLowerCase()));
        if (!hasAmenity) return false;
      }

      // Distance radius if userCoords available
      if (userCoords && typeof r.distanceKm === 'number') {
        if (r.distanceKm > distanceRadius) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return (b.rating_avg || 4.5) - (a.rating_avg || 4.5);
      if (sortBy === 'cost_low') return (a.average_cost_for_two || 350) - (b.average_cost_for_two || 350);
      if (sortBy === 'cost_high') return (b.average_cost_for_two || 350) - (a.average_cost_for_two || 350);
      if (sortBy === 'distance') return (a.distanceKm ?? 999) - (b.distanceKm ?? 999);
      return 0;
    });
  }, [restaurantsWithDistance, searchQuery, selectedCuisine, selectedPrice, selectedDiet, selectedAmenity, distanceRadius, sortBy, userCoords]);

  const activeFiltersCount = 
    (selectedCuisine !== 'all' ? 1 : 0) +
    (selectedPrice !== 'all' ? 1 : 0) +
    (selectedDiet !== 'all' ? 1 : 0) +
    (selectedMeal !== 'all' ? 1 : 0) +
    (selectedAmenity !== 'all' ? 1 : 0);

  return (
    <div className="w-full bg-[#FAF8F5] text-[#1C1917] min-h-screen">
      {/* Top Header / Title */}
      <section className="max-w-[1280px] mx-auto px-6 sm:px-8 pt-8 pb-3">
        <div className="text-xs font-extrabold tracking-widest uppercase text-[#D8350F]">
          Explore
        </div>
        <h1 className="hd mt-2 text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight">
          Cafes &amp; restaurants near you
        </h1>

        {/* Search, Sort & Location bar */}
        <div className="mt-7 flex flex-wrap gap-3 items-center">
          <label className="flex-1 min-w-[280px] flex items-center gap-3 px-5 min-h-[58px] rounded-[22px] bg-white border border-[#E7E2DA] shadow-xs">
            <Search className="w-5 h-5 text-[#78716C] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cafes, dishes, areas (e.g. Hudson Lane, Momos)"
              className="flex-1 min-w-0 bg-transparent text-[#1C1917] placeholder:text-stone-400 text-base font-medium outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            )}
          </label>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
              className="chipl min-h-[58px] px-5 rounded-[22px] font-bold text-sm bg-white"
            >
              <span>Sort: {sortBy === 'rating' ? 'Rating' : sortBy === 'cost_low' ? 'Cost: Low to High' : sortBy === 'cost_high' ? 'Cost: High to Low' : 'Distance'}</span>
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>

            {sortDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-[#E7E2DA] rounded-2xl shadow-xl z-30 p-2 text-sm font-semibold">
                <button
                  onClick={() => { setSortBy('rating'); setSortDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-xl transition-colors ${sortBy === 'rating' ? 'bg-[#FAF8F5] text-[#D8350F] font-bold' : 'hover:bg-stone-50'}`}
                >
                  Highest Rated
                </button>
                <button
                  onClick={() => { setSortBy('distance'); setSortDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-xl transition-colors ${sortBy === 'distance' ? 'bg-[#FAF8F5] text-[#D8350F] font-bold' : 'hover:bg-stone-50'}`}
                >
                  Nearest Distance
                </button>
                <button
                  onClick={() => { setSortBy('cost_low'); setSortDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-xl transition-colors ${sortBy === 'cost_low' ? 'bg-[#FAF8F5] text-[#D8350F] font-bold' : 'hover:bg-stone-50'}`}
                >
                  Cost: Low to High
                </button>
                <button
                  onClick={() => { setSortBy('cost_high'); setSortDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-xl transition-colors ${sortBy === 'cost_high' ? 'bg-[#FAF8F5] text-[#D8350F] font-bold' : 'hover:bg-stone-50'}`}
                >
                  Cost: High to Low
                </button>
              </div>
            )}
          </div>

          {/* Quick "Near Me" GPS Sort Toggle */}
          <button
            type="button"
            onClick={() => {
              if (sortBy === 'distance') {
                setSortBy('rating');
              } else {
                setSortBy('distance');
                if (!userCoords) handleLocate(true);
              }
            }}
            className={`chipl min-h-[58px] px-5 rounded-[22px] font-bold text-sm transition-all ${
              sortBy === 'distance'
                ? 'bg-[#FF5A36] text-white border-[#FF5A36] shadow-sm'
                : 'bg-white text-[#1C1917] border-[#E7E2DA] hover:border-stone-300'
            }`}
          >
            <MapPin className="w-4 h-4 mr-1 text-current" />
            <span>Near Me</span>
          </button>

          {/* Location button */}
          <button
            type="button"
            onClick={() => handleLocate(true)}
            disabled={locating}
            className="chipl min-h-[58px] px-5 rounded-[22px] font-bold text-sm bg-[#0F766E] text-white border-[#0F766E] hover:bg-[#0D9488]"
          >
            <Crosshair className={`w-4 h-4 mr-1 ${locating ? 'animate-spin' : ''}`} />
            <span>{locating ? 'Locating…' : 'Use my location'}</span>
          </button>

          {/* Mobile Filter Toggle */}
          <button
            type="button"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden chipl min-h-[58px] px-4 rounded-[22px] font-bold text-sm bg-white"
          >
            <SlidersHorizontal className="w-4 h-4 mr-1.5" />
            Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </button>
        </div>
      </section>

      {/* Main Content: Sidebar + Cards Grid */}
      <section className="max-w-[1280px] mx-auto px-6 sm:px-8 pt-6 pb-24 flex flex-col lg:flex-row gap-10 items-start">
        {/* Left Filter Sidebar */}
        <aside
          aria-label="Filters"
          className={`${
            mobileFilterOpen ? 'block' : 'hidden lg:flex'
          } w-full lg:w-72 bg-white border border-[#EFEAE2] rounded-[28px] p-6 flex-col gap-6 shrink-0 shadow-xs`}
        >
          <div className="flex justify-between items-center pb-2 border-b border-[#E7E2DA]">
            <h2 className="text-xl font-bold text-[#1C1917]">Filters</h2>
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs font-bold text-[#D8350F] hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Cuisine */}
          <div>
            <div className="text-xs font-extrabold tracking-wider uppercase text-[#78716C] mb-3">
              Cuisine
            </div>
            <div className="flex flex-wrap gap-2">
              {cuisines.map((c) => {
                const on = selectedCuisine.toLowerCase() === c.toLowerCase();
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedCuisine(on ? 'all' : c)}
                    className={`chipl text-xs min-h-[36px] px-3.5 py-1 ${on ? 'on' : ''}`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price */}
          <div>
            <div className="text-xs font-extrabold tracking-wider uppercase text-[#78716C] mb-3">
              Budget for Two
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: '₹', val: '₹' as const, sub: '< ₹300' },
                { label: '₹₹', val: '₹₹' as const, sub: '₹300-600' },
                { label: '₹₹₹', val: '₹₹₹' as const, sub: '> ₹600' },
              ].map((p) => {
                const on = selectedPrice === p.val;
                return (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => setSelectedPrice(on ? 'all' : p.val)}
                    className={`chipl text-sm justify-center min-h-[42px] font-bold ${on ? 'on' : ''}`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dietary */}
          <div>
            <div className="text-xs font-extrabold tracking-wider uppercase text-[#78716C] mb-3">
              Dietary
            </div>
            <div className="flex flex-wrap gap-2">
              {diets.map((d) => {
                const on = selectedDiet === d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedDiet(on ? 'all' : d)}
                    className={`chipl text-xs min-h-[36px] px-3.5 py-1 ${on ? 'on' : ''}`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amenities */}
          <div>
            <div className="text-xs font-extrabold tracking-wider uppercase text-[#78716C] mb-3">
              Amenities
            </div>
            <div className="flex flex-wrap gap-2">
              {amenities.map((a) => {
                const on = selectedAmenity === a;
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setSelectedAmenity(on ? 'all' : a)}
                    className={`chipl text-xs min-h-[36px] px-3.5 py-1 ${on ? 'on' : ''}`}
                  >
                    {a}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Distance Slider */}
          <div>
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-xs font-extrabold tracking-wider uppercase text-[#78716C]">
                Distance radius
              </span>
              <span className="hd text-base font-bold text-[#1C1917]">
                {distanceRadius} km
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="25"
              value={distanceRadius}
              onChange={(e) => setDistanceRadius(Number(e.target.value))}
              className="w-full accent-[#D8350F] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-[#78716C] mt-1 font-medium">
              <span>Walking (1km)</span>
              <span>Metro/Cab (25km)</span>
            </div>
          </div>
        </aside>

        {/* Right Cards Column */}
        <div className="flex-1 min-w-0 w-full">
          {/* Top Status & Active Filter Tags */}
          <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
            <p className="text-sm sm:text-base text-[#57534E]">
              <strong className="text-[#1C1917] font-bold">
                Showing {filteredRestaurants.length} verified counters
              </strong>{' '}
              in {detectedArea}
            </p>

            {/* Active filter badge pills */}
            <div className="flex flex-wrap gap-2">
              {selectedCuisine !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FFE9E2] text-[#9A2A0C] text-xs font-bold">
                  {selectedCuisine}
                  <button onClick={() => setSelectedCuisine('all')}>✕</button>
                </span>
              )}
              {selectedPrice !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FFE9E2] text-[#9A2A0C] text-xs font-bold">
                  {selectedPrice} Budget
                  <button onClick={() => setSelectedPrice('all')}>✕</button>
                </span>
              )}
              {selectedDiet !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#E6F4F1] text-[#0F766E] text-xs font-bold">
                  {selectedDiet}
                  <button onClick={() => setSelectedDiet('all')}>✕</button>
                </span>
              )}
            </div>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[16/10] bg-stone-200/60 rounded-[28px] animate-pulse" />
              ))}
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="bg-white rounded-[28px] border border-[#EFEAE2] p-12 text-center my-6">
              <div className="w-14 h-14 rounded-2xl bg-[#FFE9E2] text-[#D8350F] flex items-center justify-center mx-auto mb-4 font-bold text-2xl">
                ✕
              </div>
              <h3 className="hd text-2xl font-bold text-[#1C1917]">No counters found</h3>
              <p className="mt-2 text-sm text-[#78716C] max-w-sm mx-auto">
                No verified restaurants matched your current filters or radius. Try widening your distance or clearing selected cuisines.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="btn mt-6 bg-[#1C1917] text-white min-h-[46px]"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  navigate={navigate}
                  userDistanceKm={restaurant.distanceKm}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
