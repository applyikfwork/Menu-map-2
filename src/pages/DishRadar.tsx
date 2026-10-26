import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Sparkles, 
  Flame, 
  TrendingDown, 
  MapPin, 
  Utensils, 
  ArrowUpDown, 
  ShieldCheck, 
  ChevronRight, 
  X, 
  Filter, 
  Coffee, 
  SlidersHorizontal,
  ArrowRight
} from 'lucide-react';
import { useLocationContext } from '../context/LocationContext';
import { useDiscovery } from '../context/DiscoveryContext';
import { Restaurant, MenuItem } from '../types/database';
import { calculateDistanceKm, GeoCoordinates } from '../lib/location';
import { getSmartDishImage } from '../lib/dishImageRegistry';
import { calculateCounterSavings } from '../lib/engine/discoveryEngine';
import { DishProfileStoryReel, StoryDishGroup } from '../components/discovery/DishProfileStoryReel';
import { DishPriceSpectrumWidget } from '../components/discovery/DishPriceSpectrumWidget';
import { RestaurantAvailabilityDrawer, MatchingRestaurantSpot } from '../components/discovery/RestaurantAvailabilityDrawer';
import { updatePageSeo } from '../lib/seo';

interface DishRadarProps {
  navigate: (path: string) => void;
}

export interface CanonicalDishCluster {
  id: string;
  name: string;
  category: string;
  isVeg: boolean;
  isEgg: boolean;
  isNonVeg: boolean;
  sampleDish: MenuItem;
  spots: MatchingRestaurantSpot[];
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  demandScore: number;
  isTrending: boolean;
  isBudgetSteal: boolean;
  isGourmet: boolean;
}

export const DishRadar: React.FC<DishRadarProps> = ({ navigate }) => {
  const { currentLocation } = useLocationContext();
  const { engine } = useDiscovery();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryTab, setActiveCategoryTab] = useState<'all' | 'trending' | 'budget' | 'gourmet'>('all');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'non_veg'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc' | 'distance'>('popular');
  const [priceBracket, setPriceBracket] = useState<'all' | 'budget' | 'mid' | 'premium'>('all');

  // Selected Dish for Availability Drawer
  const [selectedCluster, setSelectedCluster] = useState<CanonicalDishCluster | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const locationLabel = currentLocation.isAllDelhi ? 'Delhi NCR' : currentLocation.name;
    document.title = `Popular Dishes & Counter Price Radar in ${locationLabel} | Menu Maps`;
    updatePageSeo({
      title: `Popular Dishes & Counter Price Radar in ${locationLabel} | Menu Maps`,
      description: `Explore popular dishes across verified cafes in ${locationLabel}. Compare real counter prices, view lowest to highest rates, and order direct at 0% delivery app markup.`,
      canonicalUrl: 'https://menumaps.in/dishes',
    });
  }, [currentLocation]);

  const activeAreaName = useMemo(() => {
    if (currentLocation.isAllDelhi) return 'Delhi NCR';
    return currentLocation.name || 'Delhi NCR';
  }, [currentLocation]);

  const userCoords: GeoCoordinates | null = useMemo(() => {
    if (currentLocation.latitude && currentLocation.longitude) {
      return {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      };
    }
    return null;
  }, [currentLocation]);

  // 1. Get restaurants matching the active universal location
  const areaRestaurants = useMemo(() => {
    const all = engine.getAllRestaurants();
    if (currentLocation.isAllDelhi) return all;

    const locName = (currentLocation.name || '').toLowerCase();
    const filtered = all.filter((r) => {
      const matchText = `${r.name} ${r.city_area || ''} ${r.landmark || ''} ${r.address_line1 || ''} ${r.city || ''}`.toLowerCase();
      return matchText.includes(locName);
    });

    if (filtered.length >= 3) return filtered;

    // If locality is hyper-specific and has few direct matches, use proximity if coordinates exist
    if (userCoords) {
      return [...all]
        .map((r) => ({
          restaurant: r,
          dist: calculateDistanceKm(userCoords.latitude, userCoords.longitude, r.latitude, r.longitude),
        }))
        .filter((item) => item.dist <= 8)
        .sort((a, b) => a.dist - b.dist)
        .map((item) => item.restaurant);
    }

    return all.slice(0, 35);
  }, [engine, currentLocation, userCoords]);

  // 2. Build Canonical Dish Clusters for this active location
  const dishClusters: CanonicalDishCluster[] = useMemo(() => {
    const restMap = new Map<string, Restaurant>();
    areaRestaurants.forEach((r) => restMap.set(r.id, r));

    const clustersMap = new Map<string, {
      name: string;
      category: string;
      sampleDish: MenuItem;
      spots: MatchingRestaurantSpot[];
      dietaryTags: Set<string>;
      demandPoints: number;
    }>();

    // Clean dish name normalizer
    const normalizeKey = (name: string): string => {
      return name
        .toLowerCase()
        .replace(/special|authentic|signature|chef's|style|deluxe|crispy|hot|fresh/gi, '')
        .replace(/[^a-z0-9 ]/g, '')
        .trim();
    };

    areaRestaurants.forEach((rest) => {
      const restDishes = engine.getDishesForRestaurant(rest.id);
      const distKm = userCoords ? calculateDistanceKm(userCoords.latitude, userCoords.longitude, rest.latitude, rest.longitude) : undefined;

      restDishes.forEach((d) => {
        if (!d.name || d.price <= 0) return;
        const norm = normalizeKey(d.name);
        if (norm.length < 3) return;

        // Group into clusters
        let existingKey: string | null = null;
        for (const k of clustersMap.keys()) {
          if (norm.includes(k) || k.includes(norm)) {
            existingKey = k;
            break;
          }
        }

        const clusterKey = existingKey || norm;
        const spot: MatchingRestaurantSpot = {
          restaurant: rest,
          dish: d,
          distanceKm: distKm,
        };

        if (!clustersMap.has(clusterKey)) {
          clustersMap.set(clusterKey, {
            name: d.name,
            category: d.category_id || 'Specials',
            sampleDish: d,
            spots: [spot],
            dietaryTags: new Set(d.dietary_tags || []),
            demandPoints: (d.is_must_try ? 15 : 0) + (d.is_featured ? 10 : 0) + (rest.rating ? rest.rating * 2 : 8),
          });
        } else {
          const entry = clustersMap.get(clusterKey)!;
          entry.spots.push(spot);
          (d.dietary_tags || []).forEach((t) => entry.dietaryTags.add(t));
          entry.demandPoints += (d.is_must_try ? 12 : 5);
        }
      });
    });

    const result: CanonicalDishCluster[] = [];

    clustersMap.forEach((entry, key) => {
      // De-duplicate spots by restaurant so one restaurant doesn't show 5 duplicates of same item
      const uniqueSpotsByRest = new Map<string, MatchingRestaurantSpot>();
      entry.spots.forEach((s) => {
        if (!uniqueSpotsByRest.has(s.restaurant.id) || s.dish.price < uniqueSpotsByRest.get(s.restaurant.id)!.dish.price) {
          uniqueSpotsByRest.set(s.restaurant.id, s);
        }
      });

      const finalSpots = Array.from(uniqueSpotsByRest.values()).sort((a, b) => a.dish.price - b.dish.price);
      if (finalSpots.length === 0) return;

      const prices = finalSpots.map((s) => s.dish.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

      const isVeg = Array.from(entry.dietaryTags).some((t) => /veg/i.test(t) && !/non/i.test(t));
      const isEgg = Array.from(entry.dietaryTags).some((t) => /egg/i.test(t));
      const isNonVeg = Array.from(entry.dietaryTags).some((t) => /non/i.test(t) || /chicken|mutton|fish/i.test(entry.name));

      result.push({
        id: key,
        name: entry.sampleDish.name,
        category: entry.category,
        isVeg: isVeg || (!isNonVeg && !isEgg),
        isEgg,
        isNonVeg,
        sampleDish: entry.sampleDish,
        spots: finalSpots,
        minPrice,
        maxPrice,
        avgPrice,
        demandScore: entry.demandPoints + finalSpots.length * 4,
        isTrending: finalSpots.length >= 2 || entry.demandPoints >= 20,
        isBudgetSteal: minPrice <= 180,
        isGourmet: minPrice >= 300,
      });
    });

    return result.sort((a, b) => b.demandScore - a.demandScore);
  }, [areaRestaurants, engine, userCoords]);

  // 3. Build Story Reel Groups for Top Trending Avatars
  const storyGroups: StoryDishGroup[] = useMemo(() => {
    return dishClusters.slice(0, 12).map((c, i) => ({
      id: c.id,
      canonicalName: c.name,
      sampleDish: c.sampleDish,
      minPrice: c.minPrice,
      maxPrice: c.maxPrice,
      avgPrice: c.avgPrice,
      restaurantCount: c.spots.length,
      demandBadge: i === 0 ? '🔥 #1 Trending' : undefined,
      isVeg: c.isVeg,
    }));
  }, [dishClusters]);

  // 4. Filter and Sort Clusters for Display
  const filteredClusters = useMemo(() => {
    return dishClusters
      .filter((cluster) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = cluster.name.toLowerCase().includes(q);
          const matchesSpots = cluster.spots.some((s) => s.restaurant.name.toLowerCase().includes(q));
          if (!matchesName && !matchesSpots) return false;
        }

        // Dietary
        if (dietaryFilter === 'veg' && !cluster.isVeg) return false;
        if (dietaryFilter === 'non_veg' && !cluster.isNonVeg) return false;

        // Category tab
        if (activeCategoryTab === 'trending' && !cluster.isTrending) return false;
        if (activeCategoryTab === 'budget' && !cluster.isBudgetSteal) return false;
        if (activeCategoryTab === 'gourmet' && !cluster.isGourmet) return false;

        // Price bracket
        if (priceBracket === 'budget' && cluster.minPrice > 180) return false;
        if (priceBracket === 'mid' && (cluster.minPrice < 180 || cluster.minPrice > 300)) return false;
        if (priceBracket === 'premium' && cluster.minPrice < 300) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') return b.demandScore - a.demandScore;
        if (sortBy === 'price_asc') return a.minPrice - b.minPrice;
        if (sortBy === 'price_desc') return b.minPrice - a.minPrice;
        if (sortBy === 'distance') {
          const distA = a.spots[0]?.distanceKm ?? 999;
          const distB = b.spots[0]?.distanceKm ?? 999;
          return distA - distB;
        }
        return 0;
      });
  }, [dishClusters, searchQuery, dietaryFilter, activeCategoryTab, priceBracket, sortBy]);

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] text-[#1C1917] pb-24 selection:bg-[#FFE0D6] selection:text-[#9A2208]">
      {/* ========================================================
          1. HERO HEADER: STRICTLY DRIVEN BY NAVBAR LOCATION
      ======================================================== */}
      <section className="bg-gradient-to-b from-[#F5EFEB] via-[#FAF8F5] to-[#FAF8F5] border-b border-[#E7E2DA] pt-6 sm:pt-10 pb-8">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
          {/* Subtle Location Context Pill (Purely Informational, Zero Duplicate Picker) */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E7E2DA] shadow-xs text-xs font-bold text-stone-700 mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Showing verified dishes in</span>
            <span className="text-[#D8350F] font-black">{activeAreaName}</span>
            <span className="text-stone-400 font-normal hidden sm:inline">(synced with navbar location)</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-[#1C1917] tracking-tight leading-[1.1]">
                Craving a specific dish?<br />
                <span className="text-[#FF5A36]">Compare nearby counters &amp; prices.</span>
              </h1>
              <p className="mt-2 text-sm sm:text-base text-[#57534E] max-w-2xl leading-relaxed">
                Check which cafes in <strong className="text-[#1C1917]">{activeAreaName}</strong> serve your favorite food. Compare lowest to highest counter prices, view real menu rates, and skip delivery app surcharges.
              </p>
            </div>

            {/* Quick Summary Pill Box */}
            <div className="shrink-0 flex items-center gap-3 bg-white border border-[#E7E2DA] rounded-2xl p-3 sm:p-4 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#D8350F] flex items-center justify-center font-black">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <span className="font-heading font-black text-xl text-[#1C1917] block leading-none">
                  {dishClusters.length}
                </span>
                <span className="text-[11px] font-bold text-stone-500">
                  Dishes across {areaRestaurants.length} local cafes
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          2. PROFILE STORY REEL: POPULAR DISHES IN ACTIVE LOCATION
      ======================================================== */}
      <DishProfileStoryReel
        storyGroups={storyGroups}
        selectedGroupId={selectedCluster?.id || null}
        onSelectGroup={(grp) => {
          const match = dishClusters.find((c) => c.id === grp.id);
          if (match) setSelectedCluster(match);
        }}
        activeLocationName={activeAreaName}
      />

      {/* ========================================================
          3. COMMAND SEARCH & MULTI-FILTER TOOLBAR
      ======================================================== */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-8 mt-6">
        <div className="bg-white border border-[#E7E2DA] rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Real-Time Dish Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search dishes in ${activeAreaName} (e.g. Cold Brew, Momos, Butter Chicken, Pizza)...`}
                className="w-full pl-11 pr-10 py-3 rounded-2xl bg-[#FAF8F5] border border-[#E7E2DA] focus:border-[#FF5A36] focus:bg-white text-xs sm:text-sm font-bold text-stone-900 outline-none transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="w-6 h-6 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-600 absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Selector Dropdown */}
            <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-between md:justify-start">
              <span className="text-xs font-bold text-stone-500 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#FF5A36]" />
                <span className="hidden sm:inline">Sort:</span>
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="py-2.5 px-3.5 rounded-xl bg-[#FAF8F5] border border-[#E7E2DA] text-xs font-extrabold text-stone-800 outline-none cursor-pointer hover:border-stone-400 transition-colors"
              >
                <option value="popular">🔥 Most Popular / Demand</option>
                <option value="price_asc">💰 Lowest Price First</option>
                <option value="price_desc">💎 Highest Price First</option>
                <option value="distance">📍 Closest Distance</option>
              </select>
            </div>
          </div>

          {/* Category & Dietary Filter Chips Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E7E2DA]">
            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setActiveCategoryTab('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeCategoryTab === 'all'
                    ? 'bg-[#1C1917] text-white shadow-xs'
                    : 'bg-[#FAF8F5] text-stone-600 hover:bg-stone-200'
                }`}
              >
                All Cravings ({dishClusters.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveCategoryTab('trending')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeCategoryTab === 'trending'
                    ? 'bg-[#FF5A36] text-white shadow-xs'
                    : 'bg-[#FAF8F5] text-stone-600 hover:bg-stone-200'
                }`}
              >
                🔥 High Demand ({dishClusters.filter((c) => c.isTrending).length})
              </button>

              <button
                type="button"
                onClick={() => setActiveCategoryTab('budget')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeCategoryTab === 'budget'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-[#FAF8F5] text-stone-600 hover:bg-stone-200'
                }`}
              >
                💸 Pocket Steals &lt; ₹180 ({dishClusters.filter((c) => c.isBudgetSteal).length})
              </button>

              <button
                type="button"
                onClick={() => setActiveCategoryTab('gourmet')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeCategoryTab === 'gourmet'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-[#FAF8F5] text-stone-600 hover:bg-stone-200'
                }`}
              >
                💎 Gourmet Specialties ({dishClusters.filter((c) => c.isGourmet).length})
              </button>
            </div>

            {/* Dietary Toggle */}
            <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1 rounded-2xl border border-[#E7E2DA]">
              <button
                type="button"
                onClick={() => setDietaryFilter('all')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  dietaryFilter === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setDietaryFilter('veg')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  dietaryFilter === 'veg' ? 'bg-emerald-600 text-white shadow-xs' : 'text-stone-600 hover:text-emerald-700'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Veg Only</span>
              </button>
              <button
                type="button"
                onClick={() => setDietaryFilter('non_veg')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  dietaryFilter === 'non_veg' ? 'bg-rose-600 text-white shadow-xs' : 'text-stone-600 hover:text-rose-700'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span>Non-Veg</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          4. MAIN DISH COMPARISON CARDS GRID
      ======================================================== */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-8 mt-8">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-black text-xl sm:text-2xl text-[#1C1917]">
              Verified Dishes in {activeAreaName}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-stone-200 text-stone-800 text-xs font-black">
              {filteredClusters.length}
            </span>
          </div>

          <span className="text-xs text-stone-500 font-bold hidden sm:inline">
            Showing in-store counter MRPs
          </span>
        </div>

        {filteredClusters.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-[#E7E2DA] max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-orange-100 text-[#FF5A36] flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-black text-lg text-stone-900">
              No dishes found matching your filter
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Try adjusting your search query, price bracket, or dietary preference.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setDietaryFilter('all');
                setActiveCategoryTab('all');
                setPriceBracket('all');
              }}
              className="btn bg-[#FF5A36] text-white text-xs font-bold px-4 py-2 rounded-xl mt-4 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredClusters.map((cluster) => {
              const savings = calculateCounterSavings(cluster.minPrice);
              const imageUrl = getSmartDishImage(
                cluster.name,
                cluster.sampleDish.category_id || '',
                cluster.sampleDish.image_url
              );

              return (
                <div
                  key={cluster.id}
                  onClick={() => setSelectedCluster(cluster)}
                  className="rounded-3xl bg-white border border-[#E7E2DA] hover:border-[#FF5A36] p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                >
                  <div>
                    {/* Top Row: Dish Image + Title + Category */}
                    <div className="flex items-start gap-4">
                      {/* Circular Food Thumbnail */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 bg-stone-100 border border-stone-200 relative group-hover:scale-105 transition-transform duration-300">
                        <img
                          src={imageUrl}
                          alt={cluster.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {cluster.isVeg ? (
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" title="Pure Veg" />
                          ) : cluster.isEgg ? (
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" title="Contains Egg" />
                          ) : (
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shrink-0" title="Non-Veg" />
                          )}
                          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                            {cluster.category}
                          </span>
                          {cluster.isTrending && (
                            <span className="px-1.5 py-0.2 rounded bg-orange-100 text-[#D8350F] text-[9px] font-black uppercase">
                              🔥 Popular
                            </span>
                          )}
                        </div>

                        <h3 className="font-heading font-black text-base sm:text-lg text-[#1C1917] mt-1 leading-snug group-hover:text-[#FF5A36] transition-colors line-clamp-2">
                          {cluster.name}
                        </h3>

                        <p className="text-xs text-stone-500 mt-1 line-clamp-1">
                          Available at {cluster.spots.length} {cluster.spots.length === 1 ? 'cafe' : 'cafes'} nearby
                        </p>
                      </div>
                    </div>

                    {/* Price Range Meter Inside Card */}
                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-baseline justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-bold">Counter Rates</span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-black text-xl text-[#D8350F]">
                            ₹{cluster.minPrice}
                          </span>
                          {cluster.maxPrice > cluster.minPrice && (
                            <span className="text-xs text-stone-500 font-bold">
                              – ₹{cluster.maxPrice}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <TrendingDown className="w-3 h-3" />
                          <span>Save ~₹{savings.totalSavings}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Comparison CTA Button */}
                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-extrabold text-[#FF5A36] group-hover:text-[#D8350F]">
                    <span>Compare {cluster.spots.length} nearby {cluster.spots.length === 1 ? 'spot' : 'spots'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ========================================================
          5. RESTAURANT AVAILABILITY DRAWER (WHEN A DISH IS CLICKED)
      ======================================================== */}
      {selectedCluster && (
        <RestaurantAvailabilityDrawer
          isOpen={Boolean(selectedCluster)}
          onClose={() => setSelectedCluster(null)}
          dishName={selectedCluster.name}
          spots={selectedCluster.spots}
          activeLocationName={activeAreaName}
          navigate={navigate}
        />
      )}
    </div>
  );
};

export default DishRadar;
