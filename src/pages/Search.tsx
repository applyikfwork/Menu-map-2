import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search as SearchIcon, 
  SlidersHorizontal, 
  X, 
  LayoutGrid, 
  List, 
  Star, 
  Sparkles, 
  Compass, 
  Utensils, 
  MapPin,
  Check
} from 'lucide-react';
import { Restaurant, MenuItem, PriceRange, DietaryOption, MealType } from '../types/database';
import { api } from '../lib/supabase';
import { getUserLocation, calculateDistanceKm, GeoCoordinates } from '../lib/location';
import { RestaurantCard } from '../components/RestaurantCard';
import { FoodItemCard } from '../components/FoodItemCard';
import { RestaurantCardSkeleton } from '../components/Skeleton';

interface SearchProps {
  navigate: (path: string) => void;
  initialQuery?: string;
  initialCuisine?: string;
}

type TabMode = 'all' | 'restaurants' | 'dishes';
type SortOption = 'relevance' | 'rating' | 'distance' | 'price_low' | 'price_high' | 'newest';

export const Search: React.FC<SearchProps> = ({ navigate, initialQuery = '', initialCuisine = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [tabMode, setTabMode] = useState<TabMode>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Data
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [userCoords, setUserCoords] = useState<GeoCoordinates | null>(null);

  // Filters State
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(
    initialCuisine ? [initialCuisine] : []
  );
  const [selectedMealTypes, setSelectedMealTypes] = useState<MealType[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<PriceRange[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedDietary, setSelectedDietary] = useState<DietaryOption[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [onlyOpenNow, setOnlyOpenNow] = useState(false);
  const [onlyDelivery, setOnlyDelivery] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');

  useEffect(() => {
    loadData();
    getUserLocation().then(setUserCoords).catch(() => {});
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [restData, itemData] = await Promise.all([
        api.getRestaurants(true),
        api.getMenuItems(),
      ]);
      setRestaurants(restData);
      setMenuItems(itemData.filter((i) => i.is_available));
    } finally {
      setLoading(false);
    }
  };

  // Derive unique lists for filter options
  const allCuisines = useMemo(() => {
    const set = new Set<string>();
    restaurants.forEach((r) => r.cuisine_types?.forEach((c) => set.add(c)));
    return Array.from(set);
  }, [restaurants]);

  const allFacilities = useMemo(() => {
    const set = new Set<string>();
    restaurants.forEach((r) => r.facilities?.forEach((f) => set.add(f)));
    return Array.from(set);
  }, [restaurants]);

  // Log analytics debounced
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.trim()) {
        api.logSearchAnalytic(query, filteredRestaurants.length + filteredItems.length, {
          cuisines: selectedCuisines,
          sortBy,
        });
      }
    }, 1500);
    return () => clearTimeout(timeout);
  }, [query, selectedCuisines, sortBy]);

  // Filter Restaurants
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((r) => {
      // Query match
      if (query.trim()) {
        const q = query.toLowerCase();
        const matchesName = r.name.toLowerCase().includes(q);
        const matchesCuisine = r.cuisine_types?.some((c) => c.toLowerCase().includes(q));
        const matchesDesc = r.short_description?.toLowerCase().includes(q);
        const matchesDish = r.known_for_dishes?.some((d) => d.toLowerCase().includes(q));
        if (!matchesName && !matchesCuisine && !matchesDesc && !matchesDish) return false;
      }

      // Cuisines
      if (selectedCuisines.length > 0) {
        const hasCuisine = selectedCuisines.some((c) => r.cuisine_types?.includes(c));
        if (!hasCuisine) return false;
      }

      // Meal Types
      if (selectedMealTypes.length > 0) {
        const hasMeal = selectedMealTypes.some((m) => r.meal_types?.includes(m));
        if (!hasMeal) return false;
      }

      // Price Range
      if (selectedPriceRanges.length > 0 && !selectedPriceRanges.includes(r.price_range)) {
        return false;
      }

      // Rating
      if (minRating > 0 && r.rating_avg < minRating) {
        return false;
      }

      // Dietary Options
      if (selectedDietary.length > 0) {
        const hasDietary = selectedDietary.some((d) => r.dietary_options?.includes(d));
        if (!hasDietary) return false;
      }

      // Facilities
      if (selectedFacilities.length > 0) {
        const hasAllFacilities = selectedFacilities.every((f) => r.facilities?.includes(f));
        if (!hasAllFacilities) return false;
      }

      // Open now
      if (onlyOpenNow && (!r.is_open || r.is_temporarily_closed)) {
        return false;
      }

      // Delivery
      if (onlyDelivery && !r.delivery_available) {
        return false;
      }

      return true;
    });
  }, [
    restaurants,
    query,
    selectedCuisines,
    selectedMealTypes,
    selectedPriceRanges,
    minRating,
    selectedDietary,
    selectedFacilities,
    onlyOpenNow,
    onlyDelivery,
  ]);

  // Sort Restaurants
  const sortedRestaurants = useMemo(() => {
    const list = [...filteredRestaurants];
    if (sortBy === 'rating') {
      return list.sort((a, b) => b.rating_avg - a.rating_avg);
    }
    if (sortBy === 'distance' && userCoords) {
      return list.sort((a, b) => {
        const distA = calculateDistanceKm(userCoords.latitude, userCoords.longitude, a.latitude, a.longitude);
        const distB = calculateDistanceKm(userCoords.latitude, userCoords.longitude, b.latitude, b.longitude);
        return distA - distB;
      });
    }
    if (sortBy === 'price_low') {
      return list.sort((a, b) => a.average_cost_for_two - b.average_cost_for_two);
    }
    if (sortBy === 'price_high') {
      return list.sort((a, b) => b.average_cost_for_two - a.average_cost_for_two);
    }
    if (sortBy === 'newest') {
      return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    // relevance: featured first, then rating
    return list.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0) || b.rating_avg - a.rating_avg);
  }, [filteredRestaurants, sortBy, userCoords]);

  // Filter Menu Items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (query.trim()) {
        const q = query.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }
      return true;
    });
  }, [menuItems, query]);

  const clearAllFilters = () => {
    setSelectedCuisines([]);
    setSelectedMealTypes([]);
    setSelectedPriceRanges([]);
    setMinRating(0);
    setSelectedDietary([]);
    setSelectedFacilities([]);
    setOnlyOpenNow(false);
    setOnlyDelivery(false);
  };

  const hasActiveFilters =
    selectedCuisines.length > 0 ||
    selectedMealTypes.length > 0 ||
    selectedPriceRanges.length > 0 ||
    minRating > 0 ||
    selectedDietary.length > 0 ||
    selectedFacilities.length > 0 ||
    onlyOpenNow ||
    onlyDelivery;

  const renderFilterContent = () => (
    <>
      {/* Quick Toggles */}
      <div className="space-y-2.5">
        <label className="flex items-center justify-between cursor-pointer text-xs font-semibold text-stone-700 py-1">
          <span>Open Right Now</span>
          <input
            type="checkbox"
            checked={onlyOpenNow}
            onChange={(e) => setOnlyOpenNow(e.target.checked)}
            className="w-4 h-4 text-[#FF5A36] rounded-md focus:ring-[#FF5A36] accent-[#FF5A36]"
          />
        </label>
        <label className="flex items-center justify-between cursor-pointer text-xs font-semibold text-stone-700 py-1">
          <span>Delivery Available</span>
          <input
            type="checkbox"
            checked={onlyDelivery}
            onChange={(e) => setOnlyDelivery(e.target.checked)}
            className="w-4 h-4 text-[#FF5A36] rounded-md focus:ring-[#FF5A36] accent-[#FF5A36]"
          />
        </label>
      </div>

      {/* Rating Filter */}
      <div className="space-y-2.5 pt-4 border-t border-stone-100">
        <h4 className="text-xs font-extrabold text-stone-500 uppercase tracking-wider">
          Minimum Rating
        </h4>
        <div className="flex items-center gap-2">
          {[0, 3.5, 4.0, 4.5].map((val) => (
            <button
              key={val}
              onClick={() => setMinRating(val)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                minRating === val
                  ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-[#E7E2DA]'
              }`}
            >
              {val === 0 ? 'Any' : `${val}+ ★`}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-2.5 pt-4 border-t border-stone-100">
        <h4 className="text-xs font-extrabold text-stone-500 uppercase tracking-wider">
          Price Range
        </h4>
        <div className="flex gap-2">
          {(['₹', '₹₹', '₹₹₹'] as PriceRange[]).map((p) => {
            const active = selectedPriceRanges.includes(p);
            return (
              <button
                key={p}
                onClick={() => {
                  setSelectedPriceRanges((prev) =>
                    active ? prev.filter((item) => item !== p) : [...prev, p]
                  );
                }}
                className={`flex-1 py-1.5 rounded-xl text-xs font-extrabold border transition-all ${
                  active
                    ? 'bg-[#14110F] text-white border-[#14110F]'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-[#E7E2DA]'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cuisines multi-select */}
      {allCuisines.length > 0 && (
        <div className="space-y-2.5 pt-4 border-t border-stone-100">
          <h4 className="text-xs font-extrabold text-stone-500 uppercase tracking-wider">
            Cuisine Types
          </h4>
          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
            {allCuisines.map((cuisine) => {
              const checked = selectedCuisines.includes(cuisine);
              return (
                <label
                  key={cuisine}
                  className="flex items-center gap-2 text-xs font-medium text-stone-700 hover:text-stone-950 cursor-pointer py-1"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      setSelectedCuisines((prev) =>
                        checked ? prev.filter((c) => c !== cuisine) : [...prev, cuisine]
                      );
                    }}
                    className="w-3.5 h-3.5 text-[#FF5A36] rounded-sm accent-[#FF5A36]"
                  />
                  <span>{cuisine}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Dietary options */}
      <div className="space-y-2.5 pt-4 border-t border-stone-100">
        <h4 className="text-xs font-extrabold text-stone-500 uppercase tracking-wider">
          Dietary Options
        </h4>
        {(['Pure Veg', 'Vegan Options', 'Gluten-Free Options'] as DietaryOption[]).map((diet) => {
          const checked = selectedDietary.includes(diet);
          return (
            <label
              key={diet}
              className="flex items-center gap-2 text-xs font-medium text-stone-700 hover:text-stone-950 cursor-pointer py-1"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => {
                  setSelectedDietary((prev) =>
                    checked ? prev.filter((d) => d !== diet) : [...prev, diet]
                  );
                }}
                className="w-3.5 h-3.5 text-[#FF5A36] rounded-sm accent-[#FF5A36]"
              />
              <span>{diet}</span>
            </label>
          );
        })}
      </div>

      {/* Facilities */}
      {allFacilities.length > 0 && (
        <div className="space-y-2.5 pt-4 border-t border-stone-100">
          <h4 className="text-xs font-extrabold text-stone-500 uppercase tracking-wider">
            Facilities & Vibes
          </h4>
          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
            {allFacilities.map((fac) => {
              const checked = selectedFacilities.includes(fac);
              return (
                <label
                  key={fac}
                  className="flex items-center gap-2 text-xs font-medium text-stone-700 hover:text-stone-950 cursor-pointer py-1"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      setSelectedFacilities((prev) =>
                        checked ? prev.filter((f) => f !== fac) : [...prev, fac]
                      );
                    }}
                    className="w-3.5 h-3.5 text-[#FF5A36] rounded-sm accent-[#FF5A36]"
                  />
                  <span>{fac}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Search Bar */}
      <div className="bg-white rounded-[28px] p-3 sm:p-4 border border-[#E7E2DA] shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="flex-1 flex items-center gap-3 px-3 w-full">
          <SearchIcon className="w-5 h-5 text-[#78716C] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cafes, restaurants, pastas, thalis, coffee..."
            className="w-full bg-transparent text-[#1C1917] placeholder-stone-400 text-base font-medium outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 hover:bg-stone-100 rounded-full text-stone-400">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Trigger on Mobile & Tabs on Desktop */}
        <div className="flex items-center justify-between w-full md:w-auto gap-2 border-t md:border-t-0 pt-2 md:pt-0 border-stone-100">
          {/* Tab Selector */}
          <div className="flex items-center bg-[#F5F1EB] p-1 rounded-2xl text-xs font-bold text-[#57534E]">
            <button
              onClick={() => setTabMode('all')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                tabMode === 'all' ? 'bg-[#1C1917] text-white shadow-xs' : 'hover:text-[#1C1917]'
              }`}
            >
              All ({filteredRestaurants.length + filteredItems.length})
            </button>
            <button
              onClick={() => setTabMode('restaurants')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                tabMode === 'restaurants' ? 'bg-[#1C1917] text-white shadow-xs' : 'hover:text-[#1C1917]'
              }`}
            >
              Places ({filteredRestaurants.length})
            </button>
            <button
              onClick={() => setTabMode('dishes')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                tabMode === 'dishes' ? 'bg-[#1C1917] text-white shadow-xs' : 'hover:text-[#1C1917]'
              }`}
            >
              Dishes ({filteredItems.length})
            </button>
          </div>

          <button
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className={`lg:hidden flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold border transition-colors ${
              hasActiveFilters
                ? 'bg-[#FF5A36]/10 text-[#FF5A36] border-[#FF5A36]/30'
                : 'bg-white text-stone-700 border-[#E7E2DA]'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Filters sidebar + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Filters Sidebar (Desktop) */}
        <aside className="hidden lg:block bg-white rounded-3xl p-6 border border-[#E7E2DA] shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#FF5A36]" />
              <h3 className="font-heading font-extrabold text-base text-[#1C1917]">Filters</h3>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-bold text-[#FF5A36] hover:underline"
              >
                Reset all
              </button>
            )}
          </div>
          {renderFilterContent()}
        </aside>

        {/* Mobile Filters Drawer Modal */}
        {showFiltersMobile && (
          <div className="fixed inset-0 z-50 lg:hidden flex flex-col bg-white animate-fade-in">
            <div className="flex items-center justify-between p-4 border-b border-stone-200 bg-[#FAF8F5]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#FF5A36]" />
                <h3 className="font-heading font-extrabold text-lg text-[#1C1917]">Filters</h3>
              </div>
              <div className="flex items-center gap-3">
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs font-bold text-[#FF5A36] hover:underline"
                  >
                    Reset all
                  </button>
                )}
                <button
                  onClick={() => setShowFiltersMobile(false)}
                  className="p-2 hover:bg-stone-200/60 rounded-full text-stone-600 transition-colors"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {renderFilterContent()}
            </div>

            <div className="p-4 border-t border-stone-200 bg-white sticky bottom-0 shadow-lg">
              <button
                onClick={() => setShowFiltersMobile(false)}
                className="w-full py-3.5 bg-[#14110F] hover:bg-black text-white font-bold rounded-2xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span>Show {filteredRestaurants.length + filteredItems.length} Results</span>
              </button>
            </div>
          </div>
        )}

        {/* Results Area */}
        <main className="lg:col-span-3 space-y-6">
          
          {/* Controls Bar: Sort + Grid/List Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs">
            <span className="text-xs font-semibold text-slate-500">
              Showing{' '}
              <strong className="text-slate-800">
                {tabMode === 'dishes'
                  ? filteredItems.length
                  : tabMode === 'restaurants'
                  ? sortedRestaurants.length
                  : sortedRestaurants.length + filteredItems.length}
              </strong>{' '}
              results
            </span>

            <div className="flex items-center gap-3">
              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-700 focus:outline-hidden"
                >
                  <option value="relevance">Relevance</option>
                  <option value="rating">Rating: High to Low</option>
                  {userCoords && <option value="distance">Distance</option>}
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="newest">Newest</option>
                </select>
              </div>

              {/* Grid / List View Toggle */}
              <div className="hidden sm:flex items-center bg-stone-100 p-1 rounded-xl text-slate-500">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : ''}`}
                  title="Grid view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-2xs' : ''}`}
                  title="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Results Loading Skeleton */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <RestaurantCardSkeleton key={n} />
              ))}
            </div>
          ) : (
            <div className="space-y-10">
              
              {/* 1. Restaurants Section */}
              {(tabMode === 'all' || tabMode === 'restaurants') && (
                <div className="space-y-4">
                  {tabMode === 'all' && sortedRestaurants.length > 0 && (
                    <div className="flex items-center gap-2 text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                      <Compass className="w-4 h-4 text-orange-500" />
                      <span>Restaurants & Cafes ({sortedRestaurants.length})</span>
                    </div>
                  )}

                  {sortedRestaurants.length > 0 ? (
                    <div
                      className={
                        viewMode === 'grid'
                          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                          : 'space-y-4'
                      }
                    >
                      {sortedRestaurants.map((restaurant) => (
                        <RestaurantCard
                          key={restaurant.id}
                          restaurant={restaurant}
                          navigate={navigate}
                          userDistanceKm={
                            userCoords
                              ? calculateDistanceKm(
                                  userCoords.latitude,
                                  userCoords.longitude,
                                  restaurant.latitude,
                                  restaurant.longitude
                                )
                              : undefined
                          }
                        />
                      ))}
                    </div>
                  ) : tabMode === 'restaurants' ? (
                    <div className="bg-stone-50 border border-stone-200/80 rounded-3xl p-10 text-center space-y-3">
                      <Compass className="w-10 h-10 text-stone-400 mx-auto" />
                      <h3 className="font-heading font-bold text-base text-slate-800">
                        No restaurants matched your filters
                      </h3>
                      <p className="text-xs text-slate-500">
                        Try clearing some filters or searching for a different keyword.
                      </p>
                      {hasActiveFilters && (
                        <button
                          onClick={clearAllFilters}
                          className="px-4 py-2 bg-[#FF5A36]/10 text-[#FF5A36] font-bold rounded-xl text-xs hover:bg-[#FF5A36]/20 transition-colors"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  ) : null}
                </div>
              )}

              {/* 2. Menu Items (Dishes) Section */}
              {(tabMode === 'all' || tabMode === 'dishes') && (
                <div className="space-y-4">
                  {tabMode === 'all' && filteredItems.length > 0 && (
                    <div className="flex items-center gap-2 text-xs font-extrabold text-slate-400 uppercase tracking-wider pt-4 border-t border-stone-200">
                      <Utensils className="w-4 h-4 text-teal-500" />
                      <span>Dishes & Menu Items ({filteredItems.length})</span>
                    </div>
                  )}

                  {filteredItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredItems.map((dish) => {
                        const rest = restaurants.find((r) => r.id === dish.restaurant_id);
                        return (
                          <FoodItemCard
                            key={dish.id}
                            item={dish}
                            restaurant={rest}
                            navigate={navigate}
                          />
                        );
                      })}
                    </div>
                  ) : tabMode === 'dishes' ? (
                    <div className="bg-stone-50 border border-stone-200/80 rounded-3xl p-10 text-center space-y-3">
                      <Utensils className="w-10 h-10 text-stone-400 mx-auto" />
                      <h3 className="font-heading font-bold text-base text-slate-800">
                        No dishes found for this search
                      </h3>
                      <p className="text-xs text-slate-500">
                        Try querying with common names like 'Pasta', 'Cold Coffee', or 'Paneer'.
                      </p>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Total empty state when neither matches */}
              {sortedRestaurants.length === 0 && filteredItems.length === 0 && (
                <div className="bg-stone-50 border-2 border-dashed border-stone-200 rounded-3xl p-12 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
                    <SearchIcon className="w-7 h-7" />
                  </div>
                  <h3 className="font-heading font-extrabold text-xl text-slate-800">
                    No results found for "{query}"
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                    We couldn't find any cafe or dish matching your search criteria. Check your spelling or reset filters.
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="px-5 py-2.5 bg-[#FF5A36] hover:bg-[#E84E2A] text-white font-bold rounded-2xl text-xs shadow-md shadow-[#FF5A36]/20 transition-colors"
                    >
                      Reset All Filters
                    </button>
                  )}
                </div>
              )}

            </div>
          )}

        </main>
      </div>

    </div>
  );
};
