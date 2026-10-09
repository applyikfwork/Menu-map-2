import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  MapPin, 
  Crosshair, 
  ChevronDown, 
  X,
  SlidersHorizontal,
  ArrowUpDown,
  Check,
  Train,
  Utensils,
  Sparkles,
  Flame,
  Store,
  Compass,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { Restaurant, MenuItem } from '../types/database';
import { api } from '../lib/supabase';
import { RestaurantCard } from '../components/RestaurantCard';
import { 
  getUserLocation, 
  calculateDistanceKm, 
  GeoCoordinates,
  getCachedUserCoordinates,
  saveCachedUserCoordinates,
  getNearestAreaName,
  detectAreaContext
} from '../lib/location';
import { DELHI_ZONES, DELHI_LOCATIONS, DelhiLocation } from '../lib/delhiLocationsData';
import { useToast } from '../components/Toast';
import { MealTimeHeroBanner } from '../components/discovery/MealTimeHeroBanner';
import { useDiscovery } from '../context/DiscoveryContext';

interface RestaurantsListProps {
  navigate: (path: string) => void;
  initialMode?: 'near_me' | 'explore';
}

export const RestaurantsList: React.FC<RestaurantsListProps> = ({ 
  navigate,
  initialMode = 'explore' 
}) => {
  const { showToast } = useToast();
  const { engine, currentMealTime, setManualMealTime } = useDiscovery();

  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [userCoords, setUserCoords] = useState<GeoCoordinates | null>(() => getCachedUserCoordinates());
  const [locating, setLocating] = useState(false);
  const [detectedArea, setDetectedArea] = useState<string>('Delhi NCR');
  const [nearestMetro, setNearestMetro] = useState<string>('');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('all');
  const [selectedPrice, setSelectedPrice] = useState<'all' | '₹' | '₹₹' | '₹₹₹'>('all');
  const [selectedDiet, setSelectedDiet] = useState<string>('all');
  const [selectedMeal, setSelectedMeal] = useState<string>('all');
  const [selectedAmenity, setSelectedAmenity] = useState<string>('all');
  const [distanceRadius, setDistanceRadius] = useState<number>(initialMode === 'near_me' ? 5 : 15);
  const [sortBy, setSortBy] = useState<'rating' | 'cost_low' | 'cost_high' | 'distance'>('rating');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
    if (initialMode === 'near_me') {
      handleLocate(false);
    }

    const handleLocationUpdate = (e: any) => {
      if (e.detail) {
        setUserCoords(e.detail);
        if (restaurants.length > 0) {
          const ctx = detectAreaContext(e.detail, restaurants);
          if (ctx?.areaName) setDetectedArea(ctx.areaName);
          if (ctx?.nearestMetro) setNearestMetro(ctx.nearestMetro);
        }
      }
    };
    window.addEventListener('menumap_location_updated', handleLocationUpdate);
    return () => window.removeEventListener('menumap_location_updated', handleLocationUpdate);
  }, [initialMode, restaurants.length]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadData = async () => {
    const cached = engine.getAllRestaurants();
    if (cached.length > 0 && restaurants.length === 0) {
      setRestaurants(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }
    try {
      const [data, items] = await Promise.all([
        api.getRestaurants(true),
        api.getMenuItems(),
      ]);
      setRestaurants(data);
      setMenuItems(items.filter((i) => i.is_available));
      if (userCoords) {
        const ctx = detectAreaContext(userCoords, data);
        if (ctx?.areaName) setDetectedArea(ctx.areaName);
        if (ctx?.nearestMetro) setNearestMetro(ctx.nearestMetro);
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
        const ctx = detectAreaContext(coords, restaurants);
        if (ctx?.areaName) setDetectedArea(ctx.areaName);
        if (ctx?.nearestMetro) setNearestMetro(ctx.nearestMetro);
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
    setSelectedZone('all');
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

  // Map of restaurant ID -> menu items
  const restaurantItemsMap = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    menuItems.forEach((item) => {
      const existing = map.get(item.restaurant_id) || [];
      existing.push(item);
      map.set(item.restaurant_id, existing);
    });
    return map;
  }, [menuItems]);

  // Expand search tokens with synonyms & Delhi locality acronyms
  const searchTokens = useMemo(() => {
    const lower = searchQuery.toLowerCase().trim();
    if (!lower) return [];
    const tokens = lower.split(/[\s,+/]+/).filter((t) => t.length > 0);
    const expanded = new Set<string>(tokens);
    expanded.add(lower);

    const synonyms: Record<string, string[]> = {
      cp: ['connaught place', 'central delhi', 'rajiv chowk'],
      connaught: ['cp', 'rajiv chowk'],
      nsp: ['netaji subhash place', 'pitampura', 'kohat'],
      pitampura: ['nsp', 'netaji subhash place'],
      hkv: ['hauz khas', 'hauz khas village'],
      hauz: ['hkv', 'hauz khas village'],
      gtb: ['gtb nagar', 'hudson lane', 'north campus', 'delhi university', 'du'],
      hudson: ['hudson lane', 'gtb nagar', 'north campus'],
      du: ['north campus', 'south campus', 'hudson lane', 'satyaniketan'],
      satya: ['satyaniketan', 'south campus'],
      momo: ['momos', 'dimsum', 'dumpling', 'kurkure', 'tandoori'],
      momos: ['momo', 'dimsum', 'dumpling', 'kurkure', 'tandoori'],
      shake: ['shakes', 'thickshake', 'smoothie', 'freakshake', 'beverage'],
      shakes: ['shake', 'thickshake', 'smoothie', 'freakshake'],
      coffee: ['cappuccino', 'latte', 'cold coffee', 'espresso', 'frappe', 'brew', 'cafe'],
      cafe: ['coffee', 'bistro', 'bakery', 'rooftop', 'continental'],
      pizza: ['woodfired', 'margherita', 'crust', 'slice', 'italian'],
      pasta: ['penne', 'spaghetti', 'alfredo', 'arrabbiata', 'lasagna', 'italian'],
      burger: ['burgers', 'patty', 'cheeseburger', 'crispy chicken'],
      chaap: ['malai chaap', 'afghani chaap', 'tandoori chaap', 'soya'],
      naan: ['chur chur naan', 'butter naan', 'garlic naan', 'amritsari'],
      biryani: ['dum biryani', 'hyderabadi', 'murgh', 'gosht', 'rice'],
      paneer: ['cottage cheese', 'shahi paneer', 'paneer tikka', 'kadai paneer'],
      chicken: ['butter chicken', 'tikka', 'tandoori chicken', 'kebab'],
      sweet: ['dessert', 'waffle', 'ice cream', 'pastry', 'cake', 'brownie'],
      waffle: ['waffles', 'belgian', 'pancake', 'dessert'],
      maggi: ['maggie', 'noodles', 'wai wai'],
      veg: ['vegetarian', 'pure veg', 'jain'],
      nonveg: ['non veg', 'chicken', 'mutton', 'meat', 'egg'],
    };

    tokens.forEach((tok) => {
      if (synonyms[tok]) {
        synonyms[tok].forEach((s) => expanded.add(s));
      }
    });

    return Array.from(expanded);
  }, [searchQuery]);

  // Matching dishes based on search
  const matchingDishes = useMemo(() => {
    if (searchTokens.length === 0) return [];
    return menuItems.filter((item) => {
      const name = item.name.toLowerCase();
      const desc = (item.description || '').toLowerCase();
      const cat = (item.category_name || '').toLowerCase();
      const tags = (item.dietary_tags || []).map((t) => t.toLowerCase());

      return searchTokens.some((tok) =>
        name.includes(tok) ||
        desc.includes(tok) ||
        cat.includes(tok) ||
        tags.some((t) => t.includes(tok))
      );
    }).slice(0, 10);
  }, [menuItems, searchTokens]);

  // Matching Delhi localities for quick filter
  const matchingAreas = useMemo(() => {
    if (searchTokens.length === 0) return [];
    return DELHI_LOCATIONS.filter((loc) => {
      const name = loc.name.toLowerCase();
      const shortName = loc.shortName.toLowerCase();
      const station = loc.metroStation.toLowerCase();
      return searchTokens.some((tok) =>
        name.includes(tok) ||
        shortName.includes(tok) ||
        station.includes(tok)
      );
    }).slice(0, 3);
  }, [searchTokens]);

  // Filtered & Sorted
  const filteredRestaurants = useMemo(() => {
    return restaurantsWithDistance.filter((r) => {
      // Powerful Multi-Token Search
      if (searchTokens.length > 0) {
        const rItems = restaurantItemsMap.get(r.id) || [];
        const rName = r.name.toLowerCase();
        const rArea = (r.landmark || r.city || r.address_line1 || '').toLowerCase();
        const rCuisines = (r.cuisine_types || []).map((c) => c.toLowerCase());
        const rDishes = (r.known_for_dishes || []).map((d) => d.toLowerCase());
        const rDesc = (r.short_description || '').toLowerCase();
        const rFacilities = (r.facilities || []).map((f) => f.toLowerCase());
        const itemNames = rItems.map((i) => i.name.toLowerCase());
        const itemCategories = rItems.map((i) => (i.category_name || '').toLowerCase());
        const itemDescriptions = rItems.map((i) => (i.description || '').toLowerCase());

        const matches = searchTokens.some((tok) => {
          return (
            rName.includes(tok) ||
            rArea.includes(tok) ||
            rCuisines.some((c) => c.includes(tok)) ||
            rDishes.some((d) => d.includes(tok)) ||
            rDesc.includes(tok) ||
            rFacilities.some((f) => f.includes(tok)) ||
            itemNames.some((name) => name.includes(tok)) ||
            itemCategories.some((cat) => cat.includes(tok)) ||
            itemDescriptions.some((desc) => desc.includes(tok))
          );
        });

        if (!matches) return false;
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

      // Meal time filter
      if (selectedMeal !== 'all') {
        const ml = selectedMeal.toLowerCase();
        if (ml === 'breakfast') {
          const isBreakfast = r.cuisine_types?.some((c) => /cafe|bakery|breakfast|south indian/i.test(c)) ||
            r.known_for_dishes?.some((d) => /paratha|dosa|idli|omelette|pancake|sandwich|coffee|chai|tea/i.test(d));
          if (!isBreakfast) return false;
        } else if (ml === 'lunch') {
          const isLunch = r.cuisine_types?.some((c) => /thali|north indian|chinese|biryani|mughlai|buffet/i.test(c)) ||
            (r.average_cost_for_two || 0) >= 200;
          if (!isLunch) return false;
        } else if (ml === 'dinner') {
          const isDinner = r.cuisine_types?.some((c) => /dinner|north indian|chinese|italian|mughlai|barbecue/i.test(c)) ||
            (r.facilities || []).some((f) => /rooftop|outdoor|ac/i.test(f));
          if (!isDinner) return false;
        } else if (ml === 'night owls') {
          const isLateNight = typeof r.opening_hours === 'object' || /11|12|1|2|3|night|24/i.test(JSON.stringify(r.opening_hours || ''));
          if (!isLateNight) return false;
        }
      }

      // Amenities
      if (selectedAmenity !== 'all') {
        const hasAmenity = r.facilities?.some((f) => f.toLowerCase().includes(selectedAmenity.toLowerCase()));
        if (!hasAmenity) return false;
      }

      // Delhi Zone filter
      if (selectedZone !== 'all') {
        const qz = selectedZone.toLowerCase();
        const matchesLandmark = (r.landmark || '').toLowerCase().includes(qz);
        const matchesCity = (r.city || '').toLowerCase().includes(qz);
        const inZoneLocs = DELHI_LOCATIONS.filter((l) => l.zoneKey === selectedZone);
        const isNearZone = inZoneLocs.some((l) => {
          if (typeof r.latitude === 'number' && typeof r.longitude === 'number') {
            const d = calculateDistanceKm(l.latitude, l.longitude, r.latitude, r.longitude);
            return d <= 5.5;
          }
          return false;
        });
        if (!matchesLandmark && !matchesCity && !isNearZone) return false;
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
  }, [restaurantsWithDistance, searchTokens, restaurantItemsMap, selectedZone, selectedCuisine, selectedPrice, selectedDiet, selectedMeal, selectedAmenity, distanceRadius, sortBy, userCoords]);

  const renderFilterContent = () => (
    <>
      {/* Delhi Zone */}
      <div>
        <div className="text-xs font-extrabold tracking-wider uppercase text-[#78716C] mb-3">
          Delhi Zone
        </div>
        <div className="flex flex-wrap gap-1.5">
          {DELHI_ZONES.map((z) => {
            const on = selectedZone === z.key;
            return (
              <button
                key={z.key}
                type="button"
                onClick={() => setSelectedZone(z.key)}
                className={`chipl text-xs min-h-[36px] px-3 py-1 cursor-pointer ${on ? 'on' : ''}`}
              >
                <span>{z.icon}</span>
                <span>{z.label}</span>
              </button>
            );
          })}
        </div>
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
                className={`chipl text-xs min-h-[36px] px-3.5 py-1 cursor-pointer ${on ? 'on' : ''}`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Budget */}
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
                className={`chipl text-sm justify-center min-h-[42px] font-bold cursor-pointer ${on ? 'on' : ''}`}
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
                className={`chipl text-xs min-h-[36px] px-3.5 py-1 cursor-pointer ${on ? 'on' : ''}`}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>

      {/* Meal Time */}
      <div>
        <div className="text-xs font-extrabold tracking-wider uppercase text-[#78716C] mb-3">
          Meal Selection
        </div>
        <div className="flex flex-wrap gap-2">
          {meals.map((m) => {
            const on = selectedMeal.toLowerCase() === m.toLowerCase();
            return (
              <button
                key={m}
                type="button"
                onClick={() => setSelectedMeal(on ? 'all' : m)}
                className={`chipl text-xs min-h-[36px] px-3.5 py-1 cursor-pointer ${on ? 'on' : ''}`}
              >
                {m}
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
                className={`chipl text-xs min-h-[36px] px-3.5 py-1 cursor-pointer ${on ? 'on' : ''}`}
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
    </>
  );

  const activeFiltersCount = 
    (selectedZone !== 'all' ? 1 : 0) +
    (selectedCuisine !== 'all' ? 1 : 0) +
    (selectedPrice !== 'all' ? 1 : 0) +
    (selectedDiet !== 'all' ? 1 : 0) +
    (selectedMeal !== 'all' ? 1 : 0) +
    (selectedAmenity !== 'all' ? 1 : 0);

  return (
    <div className="w-full bg-[#FAF8F5] text-[#1C1917] min-h-screen">
      {/* Top Header / Title */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-8 pt-6 sm:pt-8 pb-3">
        <div className="text-xs font-extrabold tracking-widest uppercase text-[#D8350F]">
          Explore
        </div>
        <h1 className="hd mt-1 sm:mt-2 text-2xl sm:text-5xl lg:text-6xl font-black tracking-tight">
          Cafes &amp; restaurants near you
        </h1>

        {/* Meal Time Contextual Discovery Banner */}
        <div className="mt-4 sm:mt-5 mb-1">
          <MealTimeHeroBanner />
        </div>

        {/* Search, Sort & Location bar */}
        <div className="mt-5 sm:mt-7 flex flex-wrap gap-2 sm:gap-3 items-center">
          {/* Search Input Container with Dropdown Suggestions */}
          <div ref={searchContainerRef} className="relative flex-1 min-w-0 w-full sm:w-auto">
            <label className="flex items-center gap-2.5 sm:gap-3 px-4 sm:px-5 min-h-[48px] sm:min-h-[56px] rounded-2xl sm:rounded-[22px] bg-white border border-[#E7E2DA] shadow-xs focus-within:border-[#FF5A36] focus-within:ring-2 focus-within:ring-[#FF5A36]/10 transition-all cursor-text">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#78716C] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setSearchDropdownOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchDropdownOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setSearchDropdownOpen(false);
                }}
                placeholder="Search cafes, dishes, areas (e.g. Hudson Lane, Momos, Cold Coffee)"
                className="flex-1 min-w-0 bg-transparent text-[#1C1917] placeholder:text-stone-400 text-xs sm:text-base font-medium outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchDropdownOpen(false);
                  }}
                  className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </label>

            {/* Instant Search Suggestions Popover */}
            {searchDropdownOpen && searchQuery.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-[#E7E2DA] rounded-2xl shadow-2xl z-40 overflow-hidden divide-y divide-stone-100 max-h-[460px] overflow-y-auto animate-fadeIn">
                {/* 1. Matching Cafes */}
                {filteredRestaurants.length > 0 && (
                  <div className="p-3">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 px-2 mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-[#FF5A36]" /> Matching Cafes ({filteredRestaurants.length})
                      </span>
                    </div>
                    <div className="space-y-1">
                      {filteredRestaurants.slice(0, 3).map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => {
                            setSearchDropdownOpen(false);
                            navigate(`/${r.slug}`);
                          }}
                          className="w-full text-left p-2 rounded-xl hover:bg-[#FAF8F5] transition-colors flex items-center justify-between group cursor-pointer"
                        >
                          <div className="min-w-0 flex-1 pr-3">
                            <div className="font-bold text-sm text-[#1C1917] group-hover:text-[#D8350F] truncate">
                              {r.name}
                            </div>
                            <div className="text-xs text-stone-500 truncate flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                              <span>{r.landmark || r.city || 'Delhi'}</span>
                              {r.cuisine_types?.[0] && (
                                <>
                                  <span>•</span>
                                  <span>{r.cuisine_types[0]}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            {r.rating && (
                              <span className="text-xs font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                ★ {r.rating.toFixed(1)}
                              </span>
                            )}
                            <div className="text-[10px] text-stone-400 mt-1 font-medium">₹{r.average_cost_for_two || 350} for 2</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Matching Dishes */}
                {matchingDishes.length > 0 && (
                  <div className="p-3 bg-stone-50/50">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 px-2 mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Utensils className="w-3.5 h-3.5 text-[#D8350F]" /> Matching Dishes ({matchingDishes.length})
                      </span>
                      <span className="text-[10px] font-bold text-[#0F766E]">0% App Markup</span>
                    </div>
                    <div className="space-y-1">
                      {matchingDishes.slice(0, 4).map((dish) => {
                        const parentCafe = restaurants.find((r) => r.id === dish.restaurant_id);
                        return (
                          <button
                            key={dish.id}
                            type="button"
                            onClick={() => {
                              setSearchDropdownOpen(false);
                              if (parentCafe) navigate(`/${parentCafe.slug}`);
                            }}
                            className="w-full text-left p-2 rounded-xl hover:bg-white transition-colors flex items-center justify-between group cursor-pointer border border-transparent hover:border-stone-200"
                          >
                            <div className="min-w-0 flex-1 pr-3">
                              <div className="font-bold text-sm text-[#1C1917] group-hover:text-[#D8350F] truncate">
                                {dish.name}
                              </div>
                              {parentCafe && (
                                <div className="text-xs text-stone-500 truncate flex items-center gap-1 mt-0.5">
                                  <span>at</span>
                                  <span className="font-semibold text-stone-700">{parentCafe.name}</span>
                                  <span>•</span>
                                  <span>{parentCafe.landmark || 'Delhi'}</span>
                                </div>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-sm font-black text-[#1C1917]">₹{dish.price}</div>
                              <span className="text-[9px] font-extrabold text-[#0F766E] uppercase">In-Store</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. Matching Delhi Localities / Areas */}
                {matchingAreas.length > 0 && (
                  <div className="p-3">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 px-2 mb-2 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-blue-600" /> Delhi Hubs & Metro Areas
                    </div>
                    <div className="flex flex-wrap gap-1.5 px-2">
                      {matchingAreas.map((loc) => (
                        <button
                          key={loc.name}
                          type="button"
                          onClick={() => {
                            setSearchQuery(loc.shortName);
                            setSelectedZone(loc.zoneKey);
                            setSearchDropdownOpen(false);
                          }}
                          className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white border border-[#E7E2DA] hover:border-[#1C1917] hover:bg-stone-50 text-[#1C1917] transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <MapPin className="w-3 h-3 text-[#FF5A36]" />
                          <span>{loc.shortName}</span>
                          <span className="text-[10px] text-stone-400 font-normal">({loc.metroStation.split('(')[0].trim()})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Empty suggestion pills if no results */}
                {filteredRestaurants.length === 0 && matchingDishes.length === 0 && matchingAreas.length === 0 && (
                  <div className="p-4 text-center">
                    <p className="text-xs text-stone-500 font-medium mb-3">
                      No direct matches for "{searchQuery}". Try popular Delhi cravings:
                    </p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {['Momos', 'Cold Coffee', 'Pizza', 'Burger', 'Hudson Lane', 'NSP'].map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => {
                            setSearchQuery(k);
                            setSearchDropdownOpen(false);
                          }}
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-[#FFE9E2] text-stone-700 hover:text-[#D8350F] transition-colors cursor-pointer"
                        >
                          {k}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer hint */}
                <div className="p-2.5 bg-stone-50 flex items-center justify-between text-[11px] text-stone-500 font-medium">
                  <span>Press <kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-stone-200">Esc</kbd> to close</span>
                  <button
                    type="button"
                    onClick={() => setSearchDropdownOpen(false)}
                    className="font-bold text-[#D8350F] hover:underline"
                  >
                    View all results
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
              className="chipl min-h-[46px] sm:min-h-[56px] px-3.5 sm:px-5 rounded-2xl sm:rounded-[22px] font-bold text-xs sm:text-sm bg-white"
            >
              <span>Sort: {sortBy === 'rating' ? 'Rating' : sortBy === 'cost_low' ? 'Cost: Low to High' : sortBy === 'cost_high' ? 'Cost: High to Low' : 'Distance'}</span>
              <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
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
            className={`chipl min-h-[46px] sm:min-h-[56px] px-3.5 sm:px-5 rounded-2xl sm:rounded-[22px] font-bold text-xs sm:text-sm transition-all ${
              sortBy === 'distance'
                ? 'bg-[#FF5A36] text-white border-[#FF5A36] shadow-sm'
                : 'bg-white text-[#1C1917] border-[#E7E2DA] hover:border-stone-300'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 text-current" />
            <span>Near Me</span>
          </button>

          {/* Current Active Location Pill */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 min-h-[46px] sm:min-h-[56px] px-3.5 sm:px-5 rounded-2xl sm:rounded-[22px] bg-white border border-[#E7E2DA] shadow-xs text-xs sm:text-sm font-bold text-[#1C1917]">
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FF5A36] shrink-0" />
            <span className="text-stone-400 font-medium">Area:</span>
            <span className="text-[#D8350F] font-black truncate max-w-[110px] sm:max-w-[150px]">{detectedArea || 'Delhi NCR'}</span>
            {nearestMetro && (
              <span className="hidden xl:inline-flex items-center gap-1 text-[#0F766E] text-xs font-semibold pl-2 border-l border-stone-200">
                <Train className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate max-w-[130px]">{nearestMetro.split('(')[0].trim()}</span>
              </span>
            )}
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5"></span>
          </div>

          {/* Mobile Filter Toggle */}
          <button
            type="button"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden chipl min-h-[46px] sm:min-h-[56px] px-3.5 sm:px-4 rounded-2xl sm:rounded-[22px] font-bold text-xs sm:text-sm bg-white"
          >
            <SlidersHorizontal className="w-4 h-4 mr-1.5" />
            Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </button>
        </div>

        {/* Delhi Zones Quick Horizontal Strip */}
        <div className="mt-4 pt-3 border-t border-[#E7E2DA]/70 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 shrink-0 mr-1">
            Delhi Zones:
          </span>
          {DELHI_ZONES.map((zone) => (
            <button
              key={zone.key}
              type="button"
              onClick={() => setSelectedZone(zone.key)}
              className={`text-xs px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer border ${
                selectedZone === zone.key
                  ? 'bg-[#1C1917] text-white border-[#1C1917] shadow-xs'
                  : 'bg-white text-[#57534E] border-[#E7E2DA] hover:bg-stone-50'
              }`}
            >
              <span>{zone.icon}</span>
              <span>{zone.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Main Content: Sidebar + Cards Grid */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-8 pt-4 sm:pt-6 pb-24 flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
        {/* Desktop Left Filter Sidebar */}
        <aside
          aria-label="Filters"
          className="hidden lg:flex w-72 bg-white border border-[#EFEAE2] rounded-[28px] p-6 flex-col gap-6 shrink-0 shadow-xs"
        >
          <div className="flex justify-between items-center pb-2 border-b border-[#E7E2DA]">
            <h2 className="text-xl font-bold text-[#1C1917]">Filters</h2>
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs font-bold text-[#D8350F] hover:underline cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>

          {renderFilterContent()}
        </aside>

        {/* Mobile Filters Drawer Modal */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex flex-col bg-white animate-fadeIn">
            <div className="flex items-center justify-between p-4 border-b border-[#E7E2DA] bg-[#FAF8F5]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#FF5A36]" />
                <h3 className="font-heading font-extrabold text-lg text-[#1C1917]">Filters</h3>
              </div>
              <div className="flex items-center gap-3">
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-xs font-bold text-[#D8350F] hover:underline cursor-pointer"
                  >
                    Clear all
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close filters"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {renderFilterContent()}
            </div>

            <div 
              className="p-4 border-t border-[#E7E2DA] bg-white sticky bottom-0 shadow-lg"
              style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
            >
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3.5 bg-[#1C1917] hover:bg-black text-white font-bold rounded-2xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Show {filteredRestaurants.length} Restaurants</span>
              </button>
            </div>
          </div>
        )}

        {/* Right Cards Column */}
        <div className="flex-1 min-w-0 w-full">
          {/* Matching Dishes Horizontal Scroll Strip */}
          {searchQuery.trim().length > 0 && matchingDishes.length > 0 && (
            <div className="mb-6 p-4 sm:p-5 bg-white border border-[#E7E2DA] rounded-[24px] shadow-xs">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#FFE9E2] text-[#D8350F] flex items-center justify-center font-bold">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-sm sm:text-base text-[#1C1917]">
                      Dishes matching "{searchQuery}"
                    </h3>
                    <p className="text-xs text-[#78716C] font-medium">
                      Found {matchingDishes.length} menu items with verified in-store pricing
                    </p>
                  </div>
                </div>
                <span className="hidden sm:inline-flex text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#E6F4F1] text-[#0F766E]">
                  0% Delivery Markup
                </span>
              </div>

              {/* Horizontal scroll of dish cards */}
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {matchingDishes.map((dish) => {
                  const parentCafe = restaurants.find((r) => r.id === dish.restaurant_id);
                  const isVeg = dish.dietary_tags?.includes('Vegetarian') || dish.dietary_tags?.includes('Pure Veg');
                  return (
                    <div
                      key={dish.id}
                      onClick={() => parentCafe && navigate(`/${parentCafe.slug}`)}
                      className="group flex-shrink-0 w-64 sm:w-72 bg-[#FAF8F5] hover:bg-stone-50 border border-[#E7E2DA] hover:border-[#FF5A36] rounded-2xl p-3 cursor-pointer transition-all flex flex-col justify-between"
                    >
                      <div className="flex gap-3">
                        {dish.image_url ? (
                          <img
                            src={dish.image_url}
                            alt={dish.name}
                            className="w-16 h-16 rounded-xl object-cover shrink-0 border border-stone-200"
                            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-[#FFE9E2]/60 text-[#D8350F] flex items-center justify-center shrink-0">
                            <Utensils className="w-6 h-6" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 truncate">
                              {dish.category_name || 'Dish'}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-[#1C1917] truncate group-hover:text-[#D8350F] transition-colors">
                            {dish.name}
                          </h4>
                          {parentCafe && (
                            <p className="text-xs text-stone-500 truncate flex items-center gap-1 mt-0.5">
                              <Store className="w-3 h-3 text-[#FF5A36] shrink-0" />
                              <span className="truncate">{parentCafe.name}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-[#E7E2DA]/60 flex items-center justify-between">
                        <div>
                          <span className="text-sm font-black text-[#1C1917]">₹{dish.price}</span>
                          <span className="text-[10px] font-bold text-[#0F766E] ml-1.5 bg-[#E6F4F1] px-1.5 py-0.5 rounded">
                            0% markup
                          </span>
                        </div>
                        <span className="text-xs font-bold text-[#D8350F] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                          View Cafe <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
            <div className="bg-white rounded-[28px] border border-[#EFEAE2] p-8 sm:p-12 text-center my-6">
              <div className="w-14 h-14 rounded-2xl bg-[#FFE9E2] text-[#D8350F] flex items-center justify-center mx-auto mb-4 font-bold text-2xl">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="hd text-xl sm:text-2xl font-bold text-[#1C1917]">
                {searchQuery ? `No counters found for "${searchQuery}"` : 'No counters found'}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#78716C] max-w-md mx-auto">
                {searchQuery
                  ? "We couldn't find any restaurants or menu items matching that exact search. Try tapping one of the popular cravings or areas below:"
                  : 'No verified restaurants matched your current filters or radius. Try widening your distance or clearing selected cuisines.'}
              </p>

              {/* Quick suggestions pills */}
              <div className="mt-5 flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
                {['Momos', 'Cold Coffee', 'Thick Shake', 'Woodfired Pizza', 'Burgers', 'Hudson Lane', 'NSP Pitampura', 'Connaught Place', 'Chur Chur Naan', 'Pure Veg'].map((keyword) => (
                  <button
                    key={keyword}
                    type="button"
                    onClick={() => {
                      setSearchQuery(keyword);
                      setSelectedZone('all');
                      setSelectedCuisine('all');
                    }}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#E7E2DA] hover:border-[#FF5A36] hover:bg-[#FFE9E2]/50 text-[#1C1917] transition-all cursor-pointer"
                  >
                    🔍 {keyword}
                  </button>
                ))}
              </div>

              <div className="mt-6 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="btn bg-[#1C1917] text-white min-h-[44px] text-xs sm:text-sm"
                >
                  Clear all filters
                </button>
              </div>
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
