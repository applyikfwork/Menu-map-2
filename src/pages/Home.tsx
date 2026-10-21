import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  Sparkles, 
  Utensils, 
  ArrowRight, 
  Check, 
  Clock, 
  Phone, 
  Flame, 
  Star, 
  ChevronRight, 
  ShieldCheck, 
  RotateCw, 
  HelpCircle, 
  Calendar, 
  Coffee,
  Navigation,
  Percent,
  Train,
  ChevronDown,
  Layers,
  Award,
  Zap,
  Tag
} from 'lucide-react';
import { Restaurant, MenuItem, Collection } from '../types/database';
import { api } from '../lib/supabase';
import { 
  getUserLocation, 
  calculateDistanceKm, 
  GeoCoordinates,
  getCachedUserCoordinates,
  saveCachedUserCoordinates,
  detectAreaContext,
  formatDistance
} from '../lib/location';
import { DELHI_LOCATIONS, DelhiLocation } from '../lib/delhiLocationsData';
import { getDynamicMealContext } from '../lib/recommendations';
import { AREA_FOOD_GUIDES } from '../lib/areaGuidesData';
import { RestaurantCard } from '../components/RestaurantCard';
import { LocationPickerModal } from '../components/LocationPickerModal';
import { useToast } from '../components/Toast';
import { lazyWithRetry } from '../lib/lazyWithRetry';

const SpinWheelModal = lazyWithRetry(
  () => import('../components/interactive/SpinWheelModal'),
  'SpinWheelModal',
  'SpinWheelModal'
);
const FoodQuizModal = lazyWithRetry(
  () => import('../components/interactive/FoodQuizModal'),
  'FoodQuizModal',
  'FoodQuizModal'
);
const DayPlannerModal = lazyWithRetry(
  () => import('../components/interactive/DayPlannerModal'),
  'DayPlannerModal',
  'DayPlannerModal'
);

interface HomeProps {
  navigate: (path: string) => void;
}

// 8 Horizontally Scrollable Category Shortcuts (Mobile-First 1-Tap Access)
const FOOD_CATEGORY_SHORTCUTS = [
  { id: 'all', label: 'All Menus', icon: '🍽️', filter: 'All' },
  { id: 'cafe', label: 'Cafes & Coffee', icon: '☕', filter: 'Cafe' },
  { id: 'pizza', label: 'Pizza & Italian', icon: '🍕', filter: 'Pizza' },
  { id: 'momos', label: 'Momos & Asian', icon: '🥟', filter: 'Momos' },
  { id: 'pure_veg', label: 'Pure Veg', icon: '🌿', filter: 'Pure Veg' },
  { id: 'late_night', label: 'Late Night', icon: '🌙', filter: 'Late night' },
  { id: 'budget', label: 'Budget (< ₹400)', icon: '💰', filter: 'Budget' },
  { id: 'desserts', label: 'Desserts & Bakes', icon: '🧇', filter: 'Dessert' },
  { id: 'shakes', label: 'Shakes & Drinks', icon: '🥤', filter: 'Shake' },
];

// Concise Editorial Discovery Campaigns (Reduced height, readable, non-autoplaying)
const DISCOVERY_CAMPAIGNS = [
  {
    id: 'budget',
    tag: 'Budget Foodie Guide',
    title: 'Pocket-Friendly Feasts Under ₹350 For Two',
    subtitle: 'Verified student-budget addas with authentic in-store prices in Hudson Lane & Satya Niketan.',
    bg: 'from-amber-950 via-[#1C1917] to-amber-950',
    accent: 'bg-amber-400 text-stone-950',
    filter: 'Budget',
    badge: '0% App Markup'
  },
  {
    id: 'late_night',
    tag: 'Night Owl Fuel',
    title: 'Late Night Cafes Open Past Midnight',
    subtitle: 'Where to grab midnight cold coffees, loaded fries, and hot momos across Delhi NCR.',
    bg: 'from-indigo-950 via-[#1C1917] to-slate-950',
    accent: 'bg-indigo-400 text-stone-950',
    filter: 'Late night',
    badge: 'Open Post 12 AM'
  },
  {
    id: 'work_friendly',
    tag: 'Study & Remote Work',
    title: 'Work-Friendly Cafes With Wi-Fi & Power Plugs',
    subtitle: 'Quiet corners, artisanal pour-overs, and verified cafe Wi-Fi credentials for work sessions.',
    bg: 'from-teal-950 via-[#1C1917] to-emerald-950',
    accent: 'bg-teal-400 text-stone-950',
    filter: 'Cafe',
    badge: 'Wi-Fi Verified'
  },
  {
    id: 'iconic_trails',
    tag: 'Neighborhood Food Crawls',
    title: 'Walking Food Trails in Majnu Ka Tila & Hudson Lane',
    subtitle: 'Tested 3-stop food itineraries mapped with nearest Delhi Metro stations.',
    bg: 'from-rose-950 via-[#1C1917] to-orange-950',
    accent: 'bg-[#FF5A36] text-white',
    filter: 'iconic',
    badge: 'Curated Trails'
  }
];

export const Home: React.FC<HomeProps> = ({ navigate }) => {
  const { showToast } = useToast();

  // Search input & active states
  const [searchQuery, setSearchQuery] = useState('');

  // Database Data
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // GPS Coordinates & Locating state
  const [userCoords, setUserCoords] = useState<GeoCoordinates | null>(() => getCachedUserCoordinates());
  const [locating, setLocating] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  // Modals
  const [spinModalOpen, setSpinModalOpen] = useState(false);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [plannerModalOpen, setPlannerModalOpen] = useState(false);

  // Filter tabs for restaurants
  const [restaurantFilter, setRestaurantFilter] = useState<'All' | 'Pure Veg' | 'Rooftop' | 'Late night' | 'Budget' | 'Cafe' | 'Pizza' | 'Momos'>('All');

  // Discovery Campaign Carousel State (Manual, no autoplay)
  const [activeCampaignIdx, setActiveCampaignIdx] = useState(0);

  // Real-time Meal context (Breakfast, Lunch, Evening, Dinner, Late Night)
  const mealContext = useMemo(() => getDynamicMealContext(), []);

  useEffect(() => {
    loadHomeData();
    if (!userCoords) {
      triggerAutoLocation();
    }

    const handleLocationUpdate = (e: any) => {
      if (e.detail) {
        setUserCoords(e.detail);
      }
    };
    window.addEventListener('menumap_location_updated', handleLocationUpdate);
    return () => window.removeEventListener('menumap_location_updated', handleLocationUpdate);
  }, []);

  const triggerAutoLocation = async () => {
    try {
      setLocating(true);
      const coords = await getUserLocation();
      setUserCoords(coords);
      saveCachedUserCoordinates(coords);
      window.dispatchEvent(new CustomEvent('menumap_location_updated', { detail: coords }));
    } catch {
      // Fallback gracefully to default
    } finally {
      setLocating(false);
    }
  };

  const loadHomeData = async () => {
    setLoading(true);
    try {
      const [restData, itemData] = await Promise.all([
        api.getRestaurants(true),
        api.getMenuItems(),
      ]);
      setRestaurants(restData);
      setMenuItems(itemData.filter((i) => i.is_available));
    } catch (e) {
      console.error('Error loading home data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/restaurants');
    }
  };

  // Detected Area Context
  const detectedAreaContext = useMemo(() => {
    if (!userCoords) {
      const defaultLoc = DELHI_LOCATIONS[0];
      return {
        areaName: defaultLoc.name,
        tagline: defaultLoc.tagline,
        headline: 'Best Cafes & Verified Menus in North Campus (DU)',
        subheadline: 'Explore student-budget cafes, study tables with power outlets & Wi-Fi, and late-night addas.',
        distanceKm: 0,
        isDUCampus: true,
        isHeritage: false,
        isCentralDelhi: false,
        isWestDelhi: false,
        isNorthWestDelhi: false,
        isSouthDelhi: false,
        isEastDelhi: false,
        nearestMetro: defaultLoc.metroStation,
        zone: defaultLoc.zone,
        closestLocation: defaultLoc,
      };
    }
    return detectAreaContext(userCoords, restaurants);
  }, [userCoords, restaurants]);

  const activeAreaName = detectedAreaContext?.areaName || 'Delhi NCR';

  // Restaurants filtered and sorted by proximity to the active user location
  const filteredAreaRestaurants = useMemo(() => {
    const list = restaurants.filter((r) => {
      if (restaurantFilter === 'Pure Veg') {
        return r.dietary_options?.includes('Pure Veg');
      }
      if (restaurantFilter === 'Rooftop') {
        return r.facilities?.some((f) => /rooftop|outdoor|balcony/i.test(f));
      }
      if (restaurantFilter === 'Late night') {
        return r.best_for_tags?.some((t) => /late/i.test(t)) || r.meal_types?.includes('Late Night');
      }
      if (restaurantFilter === 'Budget') {
        return (r.average_cost_for_two || 500) <= 400;
      }
      if (restaurantFilter === 'Cafe') {
        return r.cuisine_types?.some((c) => /cafe|coffee|beverage/i.test(c));
      }
      if (restaurantFilter === 'Pizza') {
        return r.cuisine_types?.some((c) => /pizza|italian/i.test(c));
      }
      if (restaurantFilter === 'Momos') {
        return r.cuisine_types?.some((c) => /momo|tibetan|asian|chinese/i.test(c));
      }
      return true;
    });

    if (userCoords) {
      return [...list].sort((a, b) => {
        const distA = calculateDistanceKm(userCoords.latitude, userCoords.longitude, a.latitude, a.longitude);
        const distB = calculateDistanceKm(userCoords.latitude, userCoords.longitude, b.latitude, b.longitude);
        return distA - distB;
      });
    }

    return list;
  }, [restaurants, restaurantFilter, userCoords]);

  // Recently added or genuinely verified venues
  const recentlyAddedRestaurants = useMemo(() => {
    return [...restaurants]
      .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
      .slice(0, 6);
  }, [restaurants]);

  const activeCampaign = DISCOVERY_CAMPAIGNS[activeCampaignIdx] || DISCOVERY_CAMPAIGNS[0];

  return (
    <div className="w-full bg-[#FAF8F4] text-[#191715] selection:bg-[#FFE0D6] selection:text-[#9A2208]">
      {/* ========================================================
          1. COMPACT LOCATION HEADER & PROMINENT UNIVERSAL SEARCH
      ======================================================== */}
      <section className="bg-gradient-to-b from-[#F5EFEB] to-[#FAF8F4] border-b border-[#E8E4DC] pt-5 sm:pt-7 pb-8 sm:pb-10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 space-y-5">
          {/* 1.1 Compact Location & Meal Context Pill */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setLocationModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E8E4DC] shadow-2xs text-xs font-bold text-[#191715] hover:bg-stone-50 transition-colors cursor-pointer"
                title="Tap to change neighborhood or recalibrate GPS"
              >
                <MapPin className="w-3.5 h-3.5 text-[#F4512C] shrink-0" />
                <span className="text-[#686461] font-medium">Location:</span>
                <span className="text-[#191715] font-black truncate max-w-[140px] sm:max-w-none">{activeAreaName}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <ChevronDown className="w-3 h-3 text-stone-400 ml-0.5" />
              </button>

              {detectedAreaContext?.nearestMetro && (
                <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-xs font-bold text-[#0F766E]">
                  <Train className="w-3 h-3 shrink-0" />
                  <span>{detectedAreaContext.nearestMetro}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-[#0F766E] bg-teal-50 border border-teal-100 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-pulse shrink-0" />
              <span>{mealContext.badge} · 0% App Markup</span>
            </div>
          </div>

          {/* 1.2 Prominent Universal Search Bar */}
          <div className="max-w-3xl mx-auto pt-2 space-y-3">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center shadow-md rounded-2xl bg-white border border-[#E8E4DC] focus-within:border-[#F4512C] transition-all">
              <div className="pl-4 pr-2 text-stone-400">
                <Search className="w-5 h-5 text-stone-500" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dishes, restaurants or cuisines"
                className="w-full py-4 pr-3 text-sm sm:text-base font-medium text-[#191715] placeholder:text-stone-400 bg-transparent outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-2 text-xs font-bold text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  Clear
                </button>
              )}
              <div className="pr-2 sm:pr-3">
                <button
                  type="submit"
                  className="btn bg-[#F4512C] hover:bg-[#E0401B] text-white min-h-[44px] px-5 sm:px-6 rounded-xl font-bold text-xs sm:text-sm shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  Find Menus
                </button>
              </div>
            </form>

            {/* Quick-Tap Craving Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider shrink-0 mr-1">
                Popular:
              </span>
              {[
                { label: '🥟 Momos', query: 'Momos' },
                { label: '☕ Artisan Coffee', query: 'Coffee' },
                { label: '🍕 Neapolitan Pizza', query: 'Pizza' },
                { label: '🌿 Pure Veg', query: 'Pure Veg' },
                { label: '🌙 Late Night', query: 'Late night' },
                { label: '💰 Budget Eats', query: 'Budget' },
                { label: '🥤 Shakes', query: 'Shake' }
              ].map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => {
                    setSearchQuery(chip.query);
                    navigate(`/search?q=${encodeURIComponent(chip.query)}`);
                  }}
                  className="text-xs px-3 py-1 rounded-full bg-white hover:bg-orange-50 hover:text-[#F4512C] text-stone-700 font-bold border border-[#E8E4DC] whitespace-nowrap transition-colors shrink-0 cursor-pointer shadow-2xs"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          2. COMPACT DISCOVERY BANNER (-25% HEIGHT, REFINED EDITORIAL FOCUS)
      ======================================================== */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-8 pt-6">
        <div className={`relative rounded-[28px] sm:rounded-[32px] overflow-hidden bg-gradient-to-r ${activeCampaign.bg} text-white p-6 sm:p-9 shadow-lg border border-stone-800`}>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-stone-200 text-[10px] font-extrabold uppercase tracking-wider">
                  {activeCampaign.tag}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black uppercase tracking-wider">
                  {activeCampaign.badge}
                </span>
              </div>
              <h2 className="hd text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
                {activeCampaign.title}
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-normal">
                {activeCampaign.subtitle}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (activeCampaign.filter === 'iconic') {
                    navigate('/iconic-area');
                  } else {
                    setRestaurantFilter(activeCampaign.filter as any);
                    const el = document.getElementById('cafes-grid');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className={`btn ${activeCampaign.accent} min-h-[46px] px-6 rounded-xl font-black text-xs sm:text-sm shadow-md flex items-center gap-2 cursor-pointer active:scale-95 transition-all`}
              >
                <span>Explore Curated Cafes</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Manual Campaign Selector Tabs (No Autoplay, Fully Predictable) */}
          <div className="relative z-10 flex items-center gap-2 mt-6 pt-5 border-t border-white/10 overflow-x-auto no-scrollbar">
            {DISCOVERY_CAMPAIGNS.map((camp, idx) => (
              <button
                key={camp.id}
                type="button"
                onClick={() => setActiveCampaignIdx(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeCampaignIdx === idx
                    ? 'bg-white text-stone-950 font-black shadow-xs'
                    : 'bg-white/10 hover:bg-white/20 text-stone-300'
                }`}
              >
                {camp.tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          3. HORIZONTALLY SCROLLABLE FOOD CATEGORY SHORTCUTS
      ======================================================== */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-8 pt-6">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {FOOD_CATEGORY_SHORTCUTS.map((cat) => {
            const isActive = restaurantFilter === cat.filter;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setRestaurantFilter(cat.filter as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#191715] text-white border-[#191715] shadow-xs'
                    : 'bg-white text-stone-700 hover:text-stone-900 border-[#E8E4DC] hover:border-stone-400'
                }`}
              >
                <span className="text-sm">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          4. NEARBY & POPULAR VERIFIED RESTAURANTS
      ======================================================== */}
      <section id="cafes-grid" className="max-w-[1280px] mx-auto px-4 sm:px-8 pt-10 pb-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E8E4DC] pb-4">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-[#F4512C] block">
              Direct Counter Discovery
            </span>
            <h2 className="hd text-2xl sm:text-3xl font-black text-[#191715] mt-1">
              Top Verified Cafes in {activeAreaName}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              100% verified printed menus, in-store pricing, and 0% markup WhatsApp orders.
            </p>
          </div>

          {/* Quick Sub-Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
            {(['All', 'Pure Veg', 'Rooftop', 'Late night', 'Budget'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setRestaurantFilter(filter)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                  restaurantFilter === filter
                    ? 'bg-[#191715] text-white border-[#191715]'
                    : 'bg-white text-stone-600 hover:bg-stone-50 border-[#E8E4DC]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Restaurant Cards Grid (Consistent Aspect Ratio, Honest Ratings) */}
        {filteredAreaRestaurants.length === 0 ? (
          <div className="mt-8 bg-white rounded-3xl p-10 text-center border border-[#E8E4DC] space-y-3">
            <Utensils className="w-10 h-10 text-stone-400 mx-auto" />
            <h3 className="font-bold text-base text-[#191715]">No restaurants matched this filter in {activeAreaName}</h3>
            <p className="text-xs text-stone-500">Try switching filters or explore cafes across all of Delhi NCR.</p>
            <button
              type="button"
              onClick={() => setRestaurantFilter('All')}
              className="btn bg-[#191715] text-white text-xs px-5 py-2.5 rounded-xl font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAreaRestaurants.slice(0, 6).map((restaurant) => {
              const userDist = userCoords
                ? calculateDistanceKm(userCoords.latitude, userCoords.longitude, restaurant.latitude, restaurant.longitude)
                : undefined;

              return (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  navigate={navigate}
                  userDistanceKm={userDist}
                />
              );
            })}
          </div>
        )}

        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={() => navigate('/restaurants')}
            className="btn bg-white hover:bg-stone-50 text-[#191715] border border-[#E8E4DC] min-h-[48px] px-8 rounded-full font-bold shadow-2xs hover:border-stone-400 transition-all cursor-pointer"
          >
            <span>View All {restaurants.length || 682} Verified Menus in Delhi NCR</span>
            <ArrowRight className="w-4 h-4 text-[#F4512C]" />
          </button>
        </div>
      </section>

      {/* ========================================================
          5. FEATURED LOCAL FOOD AREAS & LIVING TRAILS
      ======================================================== */}
      <section className="bg-white border-y border-[#E8E4DC] py-14">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#0F766E] block">
                Neighbourhood Food Maps
              </span>
              <h2 className="hd text-2xl sm:text-3xl font-black text-[#191715] mt-1">
                Explore Delhi's Iconic Food Hubs
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                Curated dining pockets with metro connectivity, average cost, and signature dish stops.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/iconic-area')}
              className="text-xs font-bold text-[#F4512C] hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <span>View all neighborhood guides</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {AREA_FOOD_GUIDES.slice(0, 6).map((guide) => (
              <div
                key={guide.id}
                onClick={() => navigate(`/iconic-area/${guide.slug}`)}
                className="lift group bg-[#FAF8F4] rounded-[24px] overflow-hidden border border-[#E8E4DC] cursor-pointer hover:border-stone-400 transition-all flex flex-col justify-between"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-stone-200">
                  <img
                    src={guide.cover_image_url}
                    alt={guide.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/95 text-stone-900 text-[10px] font-black uppercase tracking-wider shadow-xs">
                      {guide.area_metadata?.zone || 'Delhi Food Hub'}
                    </span>
                  </div>
                  <div className="absolute bottom-3 inset-x-3 text-white">
                    <h3 className="font-heading font-black text-lg text-white leading-tight">
                      {guide.area_metadata?.area_name || guide.title}
                    </h3>
                  </div>
                </div>

                <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {guide.description}
                  </p>

                  <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-xs text-stone-700">
                    <div className="flex items-center gap-1 font-bold">
                      <Train className="w-3.5 h-3.5 text-[#0F766E]" />
                      <span className="truncate max-w-[150px]">{guide.area_metadata?.nearest_metro?.split('(')[0] || 'Metro Connected'}</span>
                    </div>
                    <span className="font-black text-[#F4512C]">
                      ₹{guide.area_metadata?.avg_cost_for_two || 500} for two
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          6. RECENTLY VERIFIED & NEWLY ADDED RESTAURANTS
      ======================================================== */}
      {recentlyAddedRestaurants.length > 0 && (
        <section className="max-w-[1280px] mx-auto px-4 sm:px-8 py-14">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E8E4DC] pb-4">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-purple-700 block">
                Fresh Verified Additions
              </span>
              <h2 className="hd text-2xl sm:text-3xl font-black text-[#191715] mt-1">
                Recently Added to MenuMaps
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                New cafe menus digitized and verified with 0% delivery app markup.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/restaurants')}
              className="text-xs font-bold text-[#F4512C] hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <span>Explore all cafes</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentlyAddedRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                navigate={navigate}
              />
            ))}
          </div>
        </section>
      )}

      {/* ========================================================
          7. COMPACT INTERACTIVE DECISION TOOLS (WHEEL & QUIZ)
      ======================================================== */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-8 pb-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Spin Wheel Card */}
          <div className="bg-gradient-to-br from-[#FFE9E2] to-[#FFF5F0] border border-[#FFCCBD] rounded-[28px] p-6 sm:p-7 flex flex-col justify-between shadow-2xs">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-white text-[#F4512C] text-[10px] font-black uppercase tracking-wider shadow-2xs">
                Decision Maker
              </span>
              <h3 className="hd mt-3 text-xl sm:text-2xl font-black text-[#191715]">
                Can't decide what to eat? Spin the Wheel
              </h3>
              <p className="mt-1.5 text-xs text-stone-600 leading-relaxed">
                Let fate pick your next meal from verified dishes and cafes in {activeAreaName}.
              </p>
            </div>
            <div className="mt-5">
              <button
                type="button"
                onClick={() => setSpinModalOpen(true)}
                className="btn bg-[#F4512C] hover:bg-[#E0401B] text-white min-h-[44px] px-5 rounded-xl font-bold text-xs cursor-pointer shadow-xs flex items-center gap-2"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Spin the Food Wheel</span>
              </button>
            </div>
          </div>

          {/* Craving Quiz Card */}
          <div className="bg-gradient-to-br from-[#E6F4F1] to-[#F0FAF7] border border-[#BCE3DA] rounded-[28px] p-6 sm:p-7 flex flex-col justify-between shadow-2xs">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-white text-[#0F766E] text-[10px] font-black uppercase tracking-wider shadow-2xs">
                Craving Matcher
              </span>
              <h3 className="hd mt-3 text-xl sm:text-2xl font-black text-[#191715]">
                What should you eat right now?
              </h3>
              <p className="mt-1.5 text-xs text-stone-600 leading-relaxed">
                Answer 3 quick questions about your mood, budget, and cravings to get matched instantly.
              </p>
            </div>
            <div className="mt-5">
              <button
                type="button"
                onClick={() => setQuizModalOpen(true)}
                className="btn bg-[#0F766E] hover:bg-[#0D9488] text-white min-h-[44px] px-5 rounded-xl font-bold text-xs cursor-pointer shadow-xs flex items-center gap-2"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Take 60-Second Quiz</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          8. TRANSPARENT MENU TRUST EXPLAINER
      ======================================================== */}
      <section className="bg-white border-t border-[#E8E4DC] py-14">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#0F766E]">
              Zero Middleman Markups
            </span>
            <h2 className="hd text-2xl sm:text-3xl font-black text-[#191715]">
              How MenuMaps Protects Your Food Bill
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              Unlike delivery apps that inflate dish prices by 25–40%, MenuMaps shows exact in-store counter menus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-6 rounded-[24px] bg-[#FAF8F4] border border-[#E8E4DC] space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#F4512C] flex items-center justify-center font-black">
                <Check className="w-5 h-5 stroke-[3]" />
              </div>
              <h3 className="font-heading font-black text-base text-[#191715]">
                100% Genuine Counter Rates
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Menus are photographed directly from physical in-store printouts or verified by cafe owners. What you see is what you pay.
              </p>
            </div>

            <div className="p-6 rounded-[24px] bg-[#FAF8F4] border border-[#E8E4DC] space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 text-[#0F766E] flex items-center justify-center font-black">
                <Percent className="w-5 h-5 stroke-[3]" />
              </div>
              <h3 className="font-heading font-black text-base text-[#191715]">
                0% Delivery App Commissions
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Cafes pay ₹0 commission to MenuMaps, allowing them to offer transparent pricing without adding packaging or surge premiums.
              </p>
            </div>

            <div className="p-6 rounded-[24px] bg-[#FAF8F4] border border-[#E8E4DC] space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-black text-base text-[#191715]">
                Direct Kitchen WhatsApp Orders
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Order takeout or table service directly to the counter via WhatsApp, with table numbers and itemized totals auto-formatted.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Location Picker Modal */}
      <LocationPickerModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        activeCity={activeAreaName}
      />

      {/* Interactive Modals */}
      <React.Suspense fallback={null}>
        {spinModalOpen && (
          <SpinWheelModal
            isOpen={spinModalOpen}
            onClose={() => setSpinModalOpen(false)}
            restaurants={restaurants}
            navigate={navigate}
          />
        )}
        {quizModalOpen && (
          <FoodQuizModal
            isOpen={quizModalOpen}
            onClose={() => setQuizModalOpen(false)}
            restaurants={restaurants}
            navigate={navigate}
          />
        )}
        {plannerModalOpen && (
          <DayPlannerModal
            isOpen={plannerModalOpen}
            onClose={() => setPlannerModalOpen(false)}
            restaurants={restaurants}
            navigate={navigate}
          />
        )}
      </React.Suspense>
    </div>
  );
};
