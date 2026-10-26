import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  ArrowRight,
  Dices
} from 'lucide-react';
import { useLocationContext } from '../context/LocationContext';
import { useDiscovery } from '../context/DiscoveryContext';
import { getMasterSeedData } from '../lib/supabase';
import { Restaurant, MenuItem } from '../types/database';
import { calculateDistanceKm, GeoCoordinates } from '../lib/location';
import { getSmartDishImage } from '../lib/dishImageRegistry';
import { calculateCounterSavings } from '../lib/engine/discoveryEngine';
import { DishProfileStoryReel, StoryDishGroup } from '../components/discovery/DishProfileStoryReel';
import { RestaurantAvailabilityDrawer, MatchingRestaurantSpot } from '../components/discovery/RestaurantAvailabilityDrawer';
import { updatePageSeo } from '../lib/seo';
import { 
  getCombinedDishDemand, 
  recordDishInteraction, 
  subscribeToDemandUpdates 
} from '../lib/engine/dishDemandTracker';

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
  totalClicks: number;
  totalPoints: number;
  liveClicks: number;
  livePoints: number;
  isTrending: boolean;
  isBudgetSteal: boolean;
  isGourmet: boolean;
  demandBadge?: string;
  isJustClicked?: boolean;
}

/**
 * Deterministic pseudo-random float generator from a string seed.
 */
function hashStringToFloat(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  const unsigned = hash >>> 0;
  return (unsigned % 10000) / 10000;
}

/**
 * Resolves raw category IDs (or UUIDs) into human-friendly culinary categories.
 * Completely eliminates raw UUID codes like "22222222-0000-4000-8000-000000000017" from the UI.
 */
export function getCleanCategoryName(
  categoryId: string | undefined,
  dishName: string,
  categoryMap: Map<string, string>
): string {
  if (categoryId && categoryMap.has(categoryId)) {
    const mapped = categoryMap.get(categoryId)!;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}/i.test(mapped) && mapped.trim().length > 0) {
      return mapped;
    }
  }

  if (categoryId && !/^[0-9a-f]{8}-[0-9a-f]{4}/i.test(categoryId) && categoryId.length < 25) {
    return categoryId;
  }

  // Infer friendly culinary category from dish name keywords
  const lower = dishName.toLowerCase();
  if (/momo|dimsum|bao|wonton/i.test(lower)) return 'Momos & Dimsums';
  if (/pizza|calzone|bruschetta|garlic bread/i.test(lower)) return 'Italian & Pizzas';
  if (/pasta|spaghetti|penne|lasagna|ravioli/i.test(lower)) return 'Gourmet Pastas';
  if (/burger|sandwich|wrap|roll|frankie|hot dog/i.test(lower)) return 'Burgers & Rolls';
  if (/coffee|brew|cappuccino|latte|espresso|mocha|frappe/i.test(lower)) return 'Specialty Coffee';
  if (/chai|tea|kulhad|kahwa/i.test(lower)) return 'Chai & Beverages';
  if (/shake|smoothie|mojito|cooler|lemonade|boba/i.test(lower)) return 'Shakes & Coolers';
  if (/chaap|tikka|kebab|tandoori/i.test(lower)) return 'Tandoori & Starters';
  if (/dal|paneer|curry|gravy|korma|butter chicken|kadhai|masala|saag/i.test(lower)) return 'Main Course Curries';
  if (/thali|platter|combo/i.test(lower)) return 'Thalis & Combos';
  if (/naan|roti|paratha|kulcha|bread/i.test(lower)) return 'Breads & Parathas';
  if (/biryani|pulao|rice|khichdi/i.test(lower)) return 'Biryani & Rice';
  if (/dosa|idli|vada|uttapam|sambar/i.test(lower)) return 'South Indian';
  if (/noodle|chowmein|manchurian|fried rice|chilli potato/i.test(lower)) return 'Chinese & Wok';
  if (/waffle|pancake|brownie|cake|pastry|ice cream|sundae|dessert|shake|sweet|gulab jamun/i.test(lower)) return 'Desserts & Bakes';

  return 'Chef Special';
}

export const DishRadar: React.FC<DishRadarProps> = ({ navigate }) => {
  const { currentLocation } = useLocationContext();
  const { engine, isReady } = useDiscovery();

  // Search & Suggestions State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Filter State
  const [activeCategoryTab, setActiveCategoryTab] = useState<'all' | 'trending' | 'budget' | 'gourmet'>('all');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'non_veg'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'random' | 'price_asc' | 'price_desc' | 'distance'>('popular');
  const [priceBracket, setPriceBracket] = useState<'all' | 'budget' | 'mid' | 'premium'>('all');

  // Randomizer & Shuffle State
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);

  // Real-time Demand Update Revision
  const [demandRevision, setDemandRevision] = useState(0);

  // Selected Dish for Availability Drawer
  const [selectedCluster, setSelectedCluster] = useState<CanonicalDishCluster | null>(null);

  // Expanded fallback flag (when hyper-local area has few direct spots)
  const [isExpandedFallback, setIsExpandedFallback] = useState(false);

  // Close search suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Category map cache from master seed data
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    try {
      const seedCats = getMasterSeedData().categories || [];
      seedCats.forEach((c) => {
        if (c.id && c.name) map.set(c.id, c.name);
      });
    } catch {}
    return map;
  }, []);

  // Subscribe to live click and point updates
  useEffect(() => {
    return subscribeToDemandUpdates(() => {
      setDemandRevision((prev) => prev + 1);
    });
  }, []);

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

  // Clean locality token: strips parentheses e.g. "Nangloi (Rohtak Road & Metro Corridor)" -> "nangloi"
  const cleanLocalityKey = useMemo(() => {
    if (currentLocation.isAllDelhi) return '';
    const base = currentLocation.shortName || currentLocation.name || '';
    return base.split('(')[0].trim().toLowerCase();
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

  // 1. Get restaurants matching the active universal location with fail-safe fallback
  const areaRestaurants = useMemo(() => {
    let all = engine.getAllRestaurants();
    if (!all || all.length === 0) {
      all = getMasterSeedData().restaurants;
    }
    if (currentLocation.isAllDelhi || !cleanLocalityKey) {
      setIsExpandedFallback(false);
      return all;
    }

    // 1. Direct locality name match
    let filtered = all.filter((r) => {
      const matchText = `${r.name} ${r.city_area || ''} ${r.landmark || ''} ${r.address_line1 || ''} ${r.city || ''}`.toLowerCase();
      return matchText.includes(cleanLocalityKey);
    });

    // 2. Geospatial proximity match (within 8.5km) if coordinates exist
    if (filtered.length < 5 && userCoords) {
      const proximityMatches = [...all]
        .map((r) => ({
          restaurant: r,
          dist: calculateDistanceKm(userCoords.latitude, userCoords.longitude, r.latitude, r.longitude),
        }))
        .filter((item) => item.dist <= 8.5)
        .sort((a, b) => a.dist - b.dist)
        .map((item) => item.restaurant);

      const existingIds = new Set(filtered.map((r) => r.id));
      for (const pr of proximityMatches) {
        if (!existingIds.has(pr.id)) {
          filtered.push(pr);
          existingIds.add(pr.id);
        }
      }
    }

    // 3. Guaranteed rich fallback if still under 6 restaurants: pull top rated restaurants from broader Delhi NCR
    if (filtered.length < 6) {
      setIsExpandedFallback(true);
      const topRated = [...all]
        .filter((r) => r.rating && r.rating >= 4.2)
        .slice(0, 24);
      const existingIds = new Set(filtered.map((r) => r.id));
      for (const tr of topRated) {
        if (!existingIds.has(tr.id)) {
          filtered.push(tr);
          existingIds.add(tr.id);
        }
      }
    } else {
      setIsExpandedFallback(false);
    }

    return filtered;
  }, [engine, isReady, currentLocation, cleanLocalityKey, userCoords]);

  // 2. Build Canonical Dish Clusters for this active location (Grouped across ALL cafes)
  const dishClusters: CanonicalDishCluster[] = useMemo(() => {
    const restMap = new Map<string, Restaurant>();
    areaRestaurants.forEach((r) => restMap.set(r.id, r));

    const clustersMap = new Map<string, {
      name: string;
      category: string;
      sampleDish: MenuItem;
      spots: MatchingRestaurantSpot[];
      dietaryTags: Set<string>;
    }>();

    // Comprehensive dish name normalizer that strips common preparation descriptors
    // Ensures variants across multiple cafes ("Dal Makhani Handi", "Creamy Dal Makhani", "Special Dal Makhani")
    // group together into the same dish cluster so ALL cafes serving that craving appear together!
    const normalizeKey = (name: string): string => {
      return name
        .toLowerCase()
        .replace(/special|authentic|signature|chef's|style|deluxe|crispy|hot|fresh|creamy|handi|desi|shahi|classic|full|half|regular|plate|portion|combo/gi, '')
        .replace(/[^a-z0-9 ]/g, '')
        .trim();
    };

    areaRestaurants.forEach((rest) => {
      let restDishes = engine.getDishesForRestaurant(rest.id);
      if (!restDishes || restDishes.length === 0) {
        const seedDishes = getMasterSeedData().menuItems.filter((d) => d.restaurant_id === rest.id);
        if (seedDishes.length > 0) restDishes = seedDishes;
      }

      const distKm = userCoords ? calculateDistanceKm(userCoords.latitude, userCoords.longitude, rest.latitude, rest.longitude) : undefined;

      restDishes.forEach((d) => {
        if (!d.name || d.price <= 0) return;
        const norm = normalizeKey(d.name);
        if (norm.length < 3) return;

        // Group into clusters
        let existingKey: string | null = null;
        for (const k of clustersMap.keys()) {
          if (norm === k || (norm.length >= 4 && k.length >= 4 && (norm.includes(k) || k.includes(norm)))) {
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

        const cleanCat = getCleanCategoryName(d.category_id, d.name, categoryMap);

        if (!clustersMap.has(clusterKey)) {
          clustersMap.set(clusterKey, {
            name: d.name,
            category: cleanCat,
            sampleDish: d,
            spots: [spot],
            dietaryTags: new Set(d.dietary_tags || []),
          });
        } else {
          const entry = clustersMap.get(clusterKey)!;
          entry.spots.push(spot);
          (d.dietary_tags || []).forEach((t) => entry.dietaryTags.add(t));
        }
      });
    });

    const result: CanonicalDishCluster[] = [];

    clustersMap.forEach((entry, key) => {
      // De-duplicate spots by restaurant so one restaurant doesn't show multiple duplicates of the exact same item
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

      // Calculate combined demand: deterministic baseline + live user clicks
      const demandStats = getCombinedDishDemand(
        entry.sampleDish.id,
        entry.name,
        entry.category,
        entry.sampleDish.is_must_try,
        finalSpots[0]?.restaurant.rating || 4.2
      );

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
        demandScore: demandStats.totalPoints,
        totalClicks: demandStats.totalClicks,
        totalPoints: demandStats.totalPoints,
        liveClicks: demandStats.liveClicks,
        livePoints: demandStats.livePoints,
        isTrending: demandStats.isTrending,
        isBudgetSteal: minPrice <= 180,
        isGourmet: minPrice >= 300,
        demandBadge: demandStats.demandRankLabel,
        isJustClicked: demandStats.isJustClicked,
      });
    });

    // Guaranteed fallback: If result has fewer than 10 dishes, pull popular seed dishes to guarantee rich cravings
    if (result.length < 10) {
      const allSeedDishes = getMasterSeedData().menuItems;
      const existingNames = new Set(result.map((r) => r.name.toLowerCase()));
      const fallbackDishes = allSeedDishes.filter((d) => (d.is_must_try || d.is_featured) && !existingNames.has(d.name.toLowerCase())).slice(0, 16);

      fallbackDishes.forEach((d) => {
        const fakeRest = areaRestaurants[0] || getMasterSeedData().restaurants[0];
        const cleanCat = getCleanCategoryName(d.category_id, d.name, categoryMap);
        const demandStats = getCombinedDishDemand(d.id, d.name, cleanCat, d.is_must_try, 4.3);
        const isNonVeg = Boolean(d.dietary_tags?.some((t) => /non/i.test(t)) || /chicken|mutton|fish/i.test(d.name));
        const isEgg = Boolean(d.dietary_tags?.some((t) => /egg/i.test(t)));
        const isVeg = !isNonVeg && !isEgg;
        result.push({
          id: `fallback-${d.id}`,
          name: d.name,
          category: cleanCat,
          isVeg,
          isEgg,
          isNonVeg,
          sampleDish: d,
          spots: [{ restaurant: fakeRest, dish: d }],
          minPrice: d.price,
          maxPrice: d.price,
          avgPrice: d.price,
          demandScore: demandStats.totalPoints,
          totalClicks: demandStats.totalClicks,
          totalPoints: demandStats.totalPoints,
          liveClicks: demandStats.liveClicks,
          livePoints: demandStats.livePoints,
          isTrending: true,
          isBudgetSteal: d.price <= 180,
          isGourmet: d.price >= 300,
          demandBadge: demandStats.demandRankLabel,
          isJustClicked: demandStats.isJustClicked,
        });
      });
    }

    return result.sort((a, b) => b.demandScore - a.demandScore);
  }, [areaRestaurants, engine, isReady, userCoords, demandRevision, categoryMap]);

  // 3. Instant Character-by-Character Search Suggestions
  const searchSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q || q.length < 1) return [];

    return dishClusters
      .filter((c) => {
        const matchName = c.name.toLowerCase().includes(q);
        const matchCat = c.category.toLowerCase().includes(q);
        const matchSpot = c.spots.some((s) => s.restaurant.name.toLowerCase().includes(q));
        return matchName || matchCat || matchSpot;
      })
      .slice(0, 6);
  }, [dishClusters, searchQuery]);

  // 4. Build Story Reel Groups for Top Trending Avatars
  const storyGroups: StoryDishGroup[] = useMemo(() => {
    return dishClusters.slice(0, 14).map((c, i) => ({
      id: c.id,
      canonicalName: c.name,
      sampleDish: c.sampleDish,
      minPrice: c.minPrice,
      maxPrice: c.maxPrice,
      avgPrice: c.avgPrice,
      restaurantCount: c.spots.length,
      demandBadge: i === 0 ? '🔥 #1 Hot' : undefined,
      demandPoints: c.totalPoints,
      totalClicks: c.totalClicks,
      isVeg: c.isVeg,
    }));
  }, [dishClusters]);

  // 5. Handle "🎲 Shuffle Cravings" Re-roll
  const handleShuffleCravings = () => {
    setIsShuffling(true);
    setShuffleSeed((prev) => prev + 1);
    if (sortBy !== 'random') {
      setSortBy('random');
    }
    setTimeout(() => {
      setIsShuffling(false);
    }, 450);
  };

  // 6. Handle Dish Card Click with Immediate Point Accrual
  const handleDishClick = (cluster: CanonicalDishCluster) => {
    recordDishInteraction(cluster.sampleDish.id, 'click');
    setSelectedCluster(cluster);
  };

  // 7. Filter and Sort Clusters for Display
  const filteredClusters = useMemo(() => {
    return dishClusters
      .filter((cluster) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = cluster.name.toLowerCase().includes(q);
          const matchesCategory = cluster.category.toLowerCase().includes(q);
          const matchesSpots = cluster.spots.some((s) => s.restaurant.name.toLowerCase().includes(q));
          if (!matchesName && !matchesCategory && !matchesSpots) return false;
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
        if (sortBy === 'random') {
          const hashA = hashStringToFloat(`${a.id}_${shuffleSeed}`);
          const hashB = hashStringToFloat(`${b.id}_${shuffleSeed}`);
          return hashB - hashA;
        }
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
  }, [dishClusters, searchQuery, dietaryFilter, activeCategoryTab, priceBracket, sortBy, shuffleSeed]);

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] text-[#1C1917] pb-24 selection:bg-[#FFE0D6] selection:text-[#9A2208]">
      {/* ========================================================
          1. HERO HEADER: STRICTLY DRIVEN BY NAVBAR LOCATION
      ======================================================== */}
      <section className="bg-gradient-to-b from-[#F5EFEB] via-[#FAF8F5] to-[#FAF8F5] border-b border-[#E7E2DA] pt-6 sm:pt-10 pb-8">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
          {/* Universal Location Context Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E7E2DA] shadow-xs text-xs font-bold text-stone-700 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Showing verified dishes in</span>
            <span className="text-[#D8350F] font-black">{activeAreaName}</span>
            <span className="text-stone-400 font-normal hidden sm:inline">(synced with navbar location)</span>
          </div>

          {isExpandedFallback && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900 mb-3 ml-0 sm:ml-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Showing dishes in {activeAreaName} &amp; nearby popular Delhi NCR dining hubs</span>
            </div>
          )}

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mt-1">
            <div>
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-[#1C1917] tracking-tight leading-[1.1]">
                Craving a specific dish?<br />
                <span className="text-[#FF5A36]">Compare all local counters &amp; prices.</span>
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
          recordDishInteraction(grp.sampleDish.id, 'story_tap');
          const match = dishClusters.find((c) => c.id === grp.id);
          if (match) setSelectedCluster(match);
        }}
        activeLocationName={activeAreaName}
      />

      {/* ========================================================
          3. COMMAND SEARCH, SHUFFLE & MULTI-FILTER TOOLBAR
      ======================================================== */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-8 mt-6">
        <div className="bg-white border border-[#E7E2DA] rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Real-Time Dish Search Input with Live Character-by-Character Suggestions */}
            <div className="relative flex-1 w-full" ref={searchContainerRef}>
              <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                placeholder={`Search dishes in ${activeAreaName} (e.g. Dal Makhani, Momos, Pizza, Cold Coffee)...`}
                className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E7E2DA] focus:border-[#FF5A36] focus:bg-white text-xs sm:text-sm font-bold text-stone-900 outline-none transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchFocused(false);
                  }}
                  className="w-6 h-6 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-600 absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Character-by-Character Instant Live Suggestions Dropdown */}
              {isSearchFocused && searchQuery.trim().length > 0 && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-[#E7E2DA] shadow-xl p-3 z-30 space-y-1 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between px-2 pb-1.5 border-b border-stone-100 text-[11px] font-black uppercase tracking-wider text-stone-400">
                    <span>Matching Dishes in {activeAreaName}</span>
                    <span className="text-[#FF5A36] lowercase font-semibold">tap to compare cafes</span>
                  </div>
                  {searchSuggestions.map((sug) => (
                    <div
                      key={sug.id}
                      onMouseDown={() => {
                        setSearchQuery(sug.name);
                        setIsSearchFocused(false);
                        handleDishClick(sug);
                      }}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-orange-50/70 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 bg-stone-100 border border-stone-200">
                          <img
                            src={getSmartDishImage(sug.name, sug.category, sug.sampleDish.image_url)}
                            alt={sug.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <strong className="text-xs font-bold text-stone-900 block truncate group-hover:text-[#FF5A36] transition-colors">
                            {sug.name}
                          </strong>
                          <span className="text-[10px] text-stone-500 flex items-center gap-1.5">
                            <span>{sug.category}</span>
                            <span>•</span>
                            <span className="text-emerald-700 font-bold">
                              Available at {sug.spots.length} {sug.spots.length === 1 ? 'cafe' : 'cafes'}
                            </span>
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-[#D8350F]">₹{sug.minPrice}+</span>
                        <span className="text-[9px] text-stone-400 block font-semibold">in-store</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Action Buttons: Shuffle + Sort Selector */}
            <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-between md:justify-start">
              {/* Interactive "🎲 Shuffle Cravings" Button */}
              <button
                type="button"
                onClick={handleShuffleCravings}
                className="btn bg-[#1C1917] hover:bg-stone-800 text-amber-300 hover:text-amber-200 border border-stone-800 px-3.5 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                title="Randomly shuffle and discover fresh dishes in this area"
              >
                <Dices className={`w-4 h-4 text-amber-400 ${isShuffling ? 'animate-spin' : ''}`} />
                <span>🎲 Shuffle</span>
              </button>

              {/* Sort Selector Dropdown */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-stone-500 hidden sm:flex items-center gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#FF5A36]" />
                  <span>Sort:</span>
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="py-2.5 px-3 rounded-xl bg-[#FAF8F5] border border-[#E7E2DA] text-xs font-extrabold text-stone-800 outline-none cursor-pointer hover:border-stone-400 transition-colors"
                >
                  <option value="popular">🔥 Most In-Demand</option>
                  <option value="random">🎲 Random Cravings</option>
                  <option value="price_asc">💰 Lowest Price First</option>
                  <option value="price_desc">💎 Highest Price First</option>
                  <option value="distance">📍 Closest Distance</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Trending Keywords Row */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[11px] font-bold text-stone-400 shrink-0">Popular:</span>
            {['Dal Makhani', 'Paneer', 'Momos', 'Cold Coffee', 'Pizza', 'Burger', 'Chaap', 'Thali'].map((kw) => (
              <button
                key={kw}
                type="button"
                onClick={() => setSearchQuery(kw)}
                className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  searchQuery.toLowerCase() === kw.toLowerCase()
                    ? 'bg-[#FF5A36] text-white shadow-xs'
                    : 'bg-[#FAF8F5] text-stone-600 hover:bg-stone-200 border border-[#E7E2DA]'
                }`}
              >
                {kw}
              </button>
            ))}
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

          <div className="flex items-center gap-3">
            <span className="text-xs text-stone-500 font-bold hidden sm:inline">
              Showing in-store counter MRPs
            </span>
          </div>
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
                cluster.category,
                cluster.sampleDish.image_url
              );

              return (
                <div
                  key={cluster.id}
                  onClick={() => handleDishClick(cluster)}
                  className={`rounded-3xl bg-white border p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden active:scale-[0.99] ${
                    cluster.isJustClicked
                      ? 'border-[#FF5A36] ring-2 ring-[#FF5A36]/30'
                      : 'border-[#E7E2DA] hover:border-[#FF5A36]'
                  }`}
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
                        {/* Clean Culinary Category (No raw UUID codes) + Consumer Badges (No raw click numbers) */}
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
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 text-[#D8350F] border border-orange-200 text-[10px] font-black uppercase tracking-wider">
                              <Flame className="w-2.5 h-2.5 fill-current text-orange-500" />
                              <span>High Demand</span>
                            </span>
                          )}
                          {cluster.isBudgetSteal && !cluster.isTrending && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                              Pocket Steal
                            </span>
                          )}
                          {cluster.sampleDish.is_must_try && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold">
                              ⭐ Must-Try
                            </span>
                          )}
                        </div>

                        <h3 className="font-heading font-black text-base sm:text-lg text-[#1C1917] mt-1.5 leading-snug group-hover:text-[#FF5A36] transition-colors line-clamp-2">
                          {cluster.name}
                        </h3>

                        {/* All Cafes in Active Area Display */}
                        <p className="text-xs text-stone-500 mt-1 line-clamp-1 font-medium">
                          Available at <strong className="text-stone-800 font-bold">{cluster.spots.length} verified {cluster.spots.length === 1 ? 'cafe' : 'cafes'}</strong> in {activeAreaName}
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
                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-black text-[#FF5A36] group-hover:text-[#D8350F]">
                    <span>Compare all {cluster.spots.length} {cluster.spots.length === 1 ? 'cafe' : 'cafes'}</span>
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
          demandPoints={selectedCluster.totalPoints}
          totalClicks={selectedCluster.totalClicks}
        />
      )}
    </div>
  );
};

export default DishRadar;
