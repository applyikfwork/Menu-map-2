import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  Crosshair, 
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
  CheckCircle2,
  ExternalLink,
  Navigation,
  Compass,
  Bookmark,
  TrendingDown,
  Layers,
  Award,
  Zap,
  Filter,
  Percent,
  Train
} from 'lucide-react';
import { Restaurant, MenuItem } from '../types/database';
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
import { 
  getDynamicMealContext,
  getRecommendedVenues,
  getRecommendedDishes,
  getLiveHeroTicket
} from '../lib/recommendations';
import { useLocationContext } from '../context/LocationContext';
import { RestaurantCard } from '../components/RestaurantCard';
import { VisualCravingsRow } from '../components/discovery/VisualCravingsRow';
import { BillComparisonWidget } from '../components/discovery/BillComparisonWidget';
import { CuratedPlaylistsSection } from '../components/discovery/CuratedPlaylistsSection';
import { useToast } from '../components/Toast';
import { toggleBookmark, isBookmarked } from '../lib/bookmarks';
import { lazyWithRetry } from '../lib/lazyWithRetry';

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

export const Home: React.FC<HomeProps> = ({ navigate }) => {
  const { showToast } = useToast();

  // Search input & active states
  const [searchQuery, setSearchQuery] = useState('');

  // Database Data
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Centralized Global Location from Navbar
  const { currentLocation, openLocationModal, isLocating } = useLocationContext();

  const userCoords: GeoCoordinates | null = useMemo(() => {
    if (currentLocation.latitude && currentLocation.longitude) {
      return {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      };
    }
    return null;
  }, [currentLocation]);

  // Modals
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [plannerModalOpen, setPlannerModalOpen] = useState(false);

  // Filter tabs for restaurants
  const [restaurantFilter, setRestaurantFilter] = useState<'All' | 'Pure Veg' | 'Rooftop' | 'Late night' | 'Budget'>('All');

  // Selected Dish Spotlight
  const [selectedSpotlightIndex, setSelectedSpotlightIndex] = useState(0);

  // Real-time Meal context (Breakfast, Lunch, Evening, Dinner, Late Night)
  const mealContext = useMemo(() => getDynamicMealContext(), []);

  useEffect(() => {
    loadHomeData();
  }, []);

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

  const activeAreaName = useMemo(() => {
    if (currentLocation.isAllDelhi) return 'Delhi NCR';
    return currentLocation.name || 'Delhi NCR';
  }, [currentLocation]);

  const activeDelhiLocation: DelhiLocation = useMemo(() => {
    if (!currentLocation.isAllDelhi) {
      const found = DELHI_LOCATIONS.find(
        (loc) => loc.id === currentLocation.id || loc.name.toLowerCase() === currentLocation.name.toLowerCase()
      );
      if (found) return found;
    }
    if (userCoords) {
      const ctx = detectAreaContext(userCoords, restaurants);
      if (ctx.closestLocation) return ctx.closestLocation;
    }
    return DELHI_LOCATIONS[0];
  }, [currentLocation, userCoords, restaurants]);

  // Detected Area Context
  const detectedAreaContext = useMemo(() => {
    if (!userCoords) {
      const defaultLoc = activeDelhiLocation;
      return {
        areaName: activeAreaName,
        tagline: defaultLoc.tagline,
        headline: `Best Cafes & Verified Menus in ${activeAreaName}`,
        subheadline: 'Explore student-budget cafes, study tables with power outlets & Wi-Fi, and late-night addas.',
        distanceKm: 0,
        isDUCampus: /campus|hudson|kamla/i.test(activeAreaName),
        isHeritage: /chandni|purani|chawri/i.test(activeAreaName),
        isCentralDelhi: /connaught|cp|mandi/i.test(activeAreaName),
        isWestDelhi: /punjabi|rajouri|janakpuri/i.test(activeAreaName),
        isNorthWestDelhi: /pitampura|rohini|nsp/i.test(activeAreaName),
        isSouthDelhi: /hauz|gk|saket/i.test(activeAreaName),
        isEastDelhi: /laxmi|preet|anand/i.test(activeAreaName),
        nearestMetro: defaultLoc.metroStation,
        zone: defaultLoc.zone,
        closestLocation: defaultLoc,
      };
    }
    return detectAreaContext(userCoords, restaurants);
  }, [userCoords, restaurants, activeDelhiLocation, activeAreaName]);

  // Restaurants filtered and sorted by proximity to the active user location
  const areaRestaurants = useMemo(() => {
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

  // Multi-Factor Live Hero Ticket for active location (Warm & Cream UI Card)
  const heroTicketData = useMemo(() => {
    return getLiveHeroTicket(restaurants, menuItems, userCoords);
  }, [restaurants, menuItems, userCoords]);

  const heroRestaurant = heroTicketData.restaurant;
  const heroTicketItems = heroTicketData.items;

  // Dishes available in this active location / top cafes
  const activeLocationDishes = useMemo(() => {
    const topAreaRestIds = new Set(areaRestaurants.slice(0, 12).map((r) => r.id));
    const areaItems = menuItems.filter((i) => topAreaRestIds.has(i.restaurant_id));
    const pool = areaItems.length >= 4 ? areaItems : menuItems;

    const gradients = [
      'linear-gradient(135deg, #FF6B4A 0%, #D8350F 100%)',
      'linear-gradient(135deg, #0F766E 0%, #115E59 100%)',
      'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)',
      'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
    ];

    if (pool.length === 0) {
      return [
        {
          id: 'demo-1',
          name: 'Crispy Kurkure Paneer Momos',
          restaurant: 'Ricos Cafe & Bistro',
          restaurantSlug: 'ricos-cafe-bistro',
          area: activeAreaName,
          counterPrice: 169,
          appPrice: 260,
          savings: 'Save ₹91 (35%)',
          desc: 'Crunchy golden panko coating with spiced cottage cheese stuffing and fire-roasted garlic dip.',
          gradient: gradients[0],
          isVeg: true,
        },
        {
          id: 'demo-2',
          name: 'Ferrero Rocher Monster Shake',
          restaurant: 'Big Yellow Door',
          restaurantSlug: 'big-yellow-door',
          area: activeAreaName,
          counterPrice: 219,
          appPrice: 320,
          savings: 'Save ₹101 (32%)',
          desc: 'Layered Nutella fudge, vanilla soft-serve, roasted hazelnuts and whole Ferrero Rocher chocolates.',
          gradient: gradients[1],
          isVeg: true,
        },
        {
          id: 'demo-3',
          name: 'Cheesy Peri Peri Fries Platter',
          restaurant: 'Woodbox Cafe',
          restaurantSlug: 'woodbox-cafe',
          area: activeAreaName,
          counterPrice: 189,
          appPrice: 280,
          savings: 'Save ₹91 (32%)',
          desc: 'Double-fried crisp potato fingers tossed in African bird’s eye seasoning with bubbling melted cheddar.',
          gradient: gradients[2],
          isVeg: true,
        },
        {
          id: 'demo-4',
          name: 'Baked Pink Sauce Penne',
          restaurant: 'Hudson Cafe',
          restaurantSlug: 'hudson-cafe',
          area: activeAreaName,
          counterPrice: 249,
          appPrice: 360,
          savings: 'Save ₹111 (31%)',
          desc: 'Crushed Italian plum tomatoes, dairy cream, fresh basil baked under a thick golden mozzarella crust.',
          gradient: gradients[3],
          isVeg: true,
        },
      ];
    }

    return pool.slice(0, 4).map((item, idx) => {
      const rest = restaurants.find((r) => r.id === item.restaurant_id);
      const appPrice = Math.round(item.price * 1.34 + 32);
      const savingsAmt = Math.max(20, appPrice - item.price);
      const savingsPct = Math.round((savingsAmt / appPrice) * 100);

      return {
        id: item.id,
        name: item.name,
        restaurant: rest?.name || 'Verified Cafe',
        restaurantSlug: rest?.slug || '',
        area: rest?.landmark || rest?.city || activeAreaName,
        counterPrice: item.price,
        appPrice,
        savings: `Save ₹${savingsAmt} (${savingsPct}%)`,
        desc: item.description || `Freshly prepared ${item.name} at verified in-store counter pricing with 0% middleman markup.`,
        gradient: gradients[idx % gradients.length],
        isVeg: item.dietary_tags?.includes('Veg') ?? true,
      };
    });
  }, [areaRestaurants, menuItems, restaurants, activeAreaName]);

  const currentSpotlight = activeLocationDishes[selectedSpotlightIndex] || activeLocationDishes[0];

  return (
    <div className="w-full bg-[#FAF8F5] text-[#1C1917] overflow-hidden selection:bg-[#FFE0D6] selection:text-[#9A2208]">
      {/* ========================================================
          1. WARM, HIGH-CONVERTING HERO SECTION (HERO 2.0)
      ======================================================== */}
      <section className="relative bg-gradient-to-b from-[#F5EFEB] via-[#FAF8F5] to-[#FAF8F5] border-b border-[#E7E2DA] pt-6 sm:pt-8 pb-16 sm:pb-24">
        {/* Soft Organic Ambience Glows */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-32 w-[650px] h-[650px] rounded-full bg-[radial-gradient(circle,rgba(255,90,54,0.12),transparent_65%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-32 top-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-[radial-gradient(circle,rgba(15,118,110,0.08),transparent_65%)]"
        />

        <div className="relative max-w-[1280px] mx-auto px-4 sm:px-8">
          {/* Hero Two-Column Grid: Left Content + Right Interactive Live Counter Ticket */}
          <div className="pt-8 sm:pt-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 text-left">
              {/* Dynamic Real-Time Meal Badge & Trust Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E7E2DA] shadow-xs text-xs font-bold text-[#0F766E] flex-wrap">
                <span className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-pulse shrink-0"></span>
                <span className="text-[#0F766E] font-black">{mealContext.badge}</span>
                <span className="text-stone-300">·</span>
                <span className="text-[#57534E]">100% Real Counter Menus</span>
                <span className="text-stone-300 hidden sm:inline">·</span>
                <span className="text-[#D8350F] font-black hidden sm:inline">0% App Markup</span>
              </div>

              {/* Headline */}
              <h1 className="hd mt-5 text-3xl sm:text-5xl lg:text-[56px] font-black text-[#1C1917] leading-[1.08] tracking-tight">
                Eat at <span className="text-[#FF5A36]">exact counter prices.</span><br />
                Skip delivery app markups.
              </h1>

              {/* Subhead */}
              <p className="mt-4 text-base sm:text-lg text-[#57534E] leading-relaxed max-w-xl font-normal">
                Menu Maps gives you direct access to 100% verified in-store counter menus in <strong className="text-[#1C1917] font-bold">{activeAreaName}</strong>. Check prices before walking in, or place orders straight to the cafe over WhatsApp.
              </p>

              {/* Universal Menu & Dish Search Card */}
              <div className="mt-7 bg-white rounded-3xl p-3 sm:p-3.5 shadow-xl border border-[#E7E2DA] max-w-xl">
                <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 flex items-center gap-3 px-4 min-h-[54px] rounded-2xl bg-[#FAF8F5] border border-transparent focus-within:border-[#FF5A36]/40 transition-colors">
                    <Search className="w-5 h-5 text-[#78716C] shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={`Search momos, monster shakes, BYD, ${activeAreaName.split(/[\s,/]+/)[0]}…`}
                      className="flex-1 min-w-0 bg-transparent text-[#1C1917] placeholder:text-stone-400 text-sm sm:text-base outline-none font-medium"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="text-xs font-bold text-stone-400 hover:text-stone-700 px-1 cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="btn bg-[#D8350F] hover:bg-[#FF5A36] text-white min-h-[54px] px-8 rounded-2xl font-extrabold text-sm sm:text-base shrink-0 w-full sm:w-auto cursor-pointer shadow-md transition-all active:scale-95"
                  >
                    Find menus
                  </button>
                </form>

                {/* Instant Tap Cravings Strip */}
                <div className="mt-3 pt-2.5 border-t border-[#E7E2DA]/70 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  <span className="text-[10px] font-extrabold tracking-wider uppercase text-[#78716C] shrink-0 mr-1">
                    Try:
                  </span>
                  {[
                    { label: '🥟 Momos', query: 'Momos' },
                    { label: '🥤 Shakes', query: 'Shake' },
                    { label: '🫓 Chur Chur Naan', query: 'Naan' },
                    { label: '🍟 Loaded Fries', query: 'Fries' },
                    { label: '☕ Artisan Coffee', query: 'Coffee' },
                    { label: '🌿 Pure Veg', query: 'Veg' },
                    { label: '🌙 Late Night', query: 'Late Night' },
                  ].map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => {
                        setSearchQuery(chip.query);
                        navigate(`/search?q=${encodeURIComponent(chip.query)}`);
                      }}
                      className="text-xs px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-orange-50 hover:text-[#D8350F] text-[#44403C] font-bold whitespace-nowrap transition-colors shrink-0 cursor-pointer"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 1-Tap Mood & Dietary Triage */}
              <div className="mt-5 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {[
                  { label: '🍽️ All Cafes', filter: 'All' },
                  { label: '🌱 100% Pure Veg', filter: 'Pure Veg' },
                  { label: '💰 Budget Under ₹400', filter: 'Budget' },
                  { label: '🌙 Open Late Night', filter: 'Late night' },
                  { label: '🌆 Rooftop Ambience', filter: 'Rooftop' },
                ].map((mood) => {
                  const isActive = restaurantFilter === mood.filter;
                  return (
                    <button
                      key={mood.label}
                      type="button"
                      onClick={() => {
                        setRestaurantFilter(mood.filter as any);
                        const el = document.getElementById('cafes');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`text-xs px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer border ${
                        isActive
                          ? 'bg-[#1C1917] text-white border-[#1C1917] shadow-sm'
                          : 'bg-white hover:bg-stone-50 text-[#44403C] border-[#E7E2DA]'
                      }`}
                    >
                      {mood.label}
                    </button>
                  );
                })}
              </div>

              {/* 3 Quick Benefit Metrics */}
              <div className="mt-6 flex flex-wrap items-center gap-6 text-xs sm:text-sm font-semibold text-[#57534E]">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>{restaurants.length > 0 ? `${restaurants.length}+ Verified Delhi Cafes` : 'Verified Delhi NCR Cafes'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-orange-100 text-[#D8350F] flex items-center justify-center shrink-0">
                    <Percent className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Save 25–40% vs Food Apps</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-teal-100 text-[#0F766E] flex items-center justify-center shrink-0">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <span>Direct WhatsApp Ordering</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual: Authentic Clean Counter Price Ticket */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[390px] group transition-all duration-300">
                {/* Clean Verified Badge Top */}
                <div className="inline-flex items-center gap-1.5 mb-2.5 sm:absolute sm:-top-4 sm:-left-3 z-20 bg-[#0F766E] text-white font-extrabold text-[11px] tracking-wider uppercase px-3.5 py-1.5 rounded-xl shadow-md">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Real Dine-In Receipt</span>
                </div>

                {/* Main Receipt Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-[#E7E2DA] relative overflow-hidden">
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <div className="text-[11px] font-extrabold tracking-wider uppercase text-[#78716C]">
                        Counter Bill Ticket
                      </div>
                      <h3 className="hd mt-1 text-xl sm:text-2xl font-black text-[#1C1917] truncate">
                        {heroRestaurant?.name || 'Top Verified Counter'}
                      </h3>
                      <div className="text-xs font-semibold text-[#78716C] mt-0.5 truncate">
                        {heroRestaurant?.landmark || heroRestaurant?.city || activeAreaName}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#E6F4F1] text-[#0F766E] text-[11px] font-black shrink-0">
                      ✓ Verified
                    </span>
                  </div>

                  {/* Cut-out Receipt Perforation Line */}
                  <div className="my-4 -mx-6 sm:-mx-7 border-t-2 border-dashed border-[#E7E2DA] relative">
                    <span className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-[#F5EFEB]" />
                    <span className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-[#F5EFEB]" />
                  </div>

                  {/* Itemized Counter Dishes */}
                  <div className="flex flex-col gap-3.5">
                    {heroTicketItems.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start gap-3">
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-[#1C1917] truncate leading-snug">
                            {item.name}
                          </div>
                          <div className="text-[11px] text-[#78716C] mt-0.5 truncate">
                            {item.rest} · <span className="line-through text-stone-400">App ₹{item.app}</span>
                          </div>
                        </div>
                        <div className="hd text-base font-black text-[#D8350F] shrink-0">
                          ₹{item.price}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Second Perforation Line */}
                  <div className="my-4 -mx-6 sm:-mx-7 border-t-2 border-dashed border-[#E7E2DA] relative">
                    <span className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-[#F5EFEB]" />
                    <span className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-[#F5EFEB]" />
                  </div>

                  {/* Receipt Total & Real Diner Savings */}
                  <div className="flex justify-between items-baseline">
                    <div>
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">
                        Counter Bill Total
                      </span>
                      <div className="text-xs text-[#0F766E] font-extrabold mt-0.5">
                        You save ₹{heroTicketData.savingsTotal} vs food apps
                      </div>
                    </div>
                    <span className="hd text-2xl sm:text-3xl font-black text-[#1C1917]">
                      ₹{heroTicketData.counterTotal}
                    </span>
                  </div>

                  {/* Action Link inside Ticket */}
                  <button
                    type="button"
                    onClick={() => {
                      if (heroRestaurant?.slug) {
                        navigate(`/${heroRestaurant.slug}`);
                      } else {
                        navigate('/restaurants');
                      }
                    }}
                    className="btn mt-4 w-full bg-[#0F766E] hover:bg-[#115E59] text-white min-h-[46px] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all rounded-xl shadow-xs"
                  >
                    <span>View {heroRestaurant ? heroRestaurant.name.split(' ')[0] : 'counter'} menu & prices</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          1.5. VISUAL CRAVINGS CAROUSEL (What are you craving today?)
      ======================================================== */}
      <VisualCravingsRow navigate={navigate} />

      {/* ========================================================
          1.6. THE VALUE HOOK: BILL COMPARISON WIDGET
      ======================================================== */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-8 py-4">
        <BillComparisonWidget navigate={navigate} />
      </section>

      {/* ========================================================
          1.7. CURATED EDITORIAL SHELVES (Spotlight, Budget, Late Night)
      ======================================================== */}
      {restaurants.length > 0 && (
        <CuratedPlaylistsSection
          restaurants={restaurants}
          activeAreaName={activeAreaName}
          navigate={navigate}
          userCoords={userCoords}
        />
      )}

      {/* ========================================================
          2. TOP VERIFIED CAFES IN THIS LOCATION
      ======================================================== */}
      <section className="sec pt-14 pb-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <div className="eyebrow text-[#D8350F]">Verified Counter Menus</div>
            <h2 className="h2 mt-2">
              Top cafes & restaurants in {activeAreaName}
            </h2>
            <p className="mt-1.5 text-sm text-[#78716C] font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Showing verified dining spots with 100% digital counter menus</span>
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {(['All', 'Pure Veg', 'Rooftop', 'Late night', 'Budget'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setRestaurantFilter(filter)}
                className={`chipl ${restaurantFilter === filter ? 'on' : ''}`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Restaurant Cards Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {areaRestaurants.slice(0, 6).map((restaurant) => {
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

        <div className="mt-10 text-center">
          <button
            onClick={() => navigate('/restaurants')}
            className="btn bg-[#1C1917] text-white hover:bg-stone-800 min-h-[50px] px-8 rounded-full font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            View all {restaurants.length || 770} verified counter menus in Delhi NCR →
          </button>
        </div>
      </section>

      {/* ========================================================
          3. POPULAR COUNTER DISHES IN THIS LOCATION
      ======================================================== */}
      <section id="dishes" className="sec bg-white py-16 border-y border-[#E7E2DA]">
        <div className="max-w-2xl">
          <div className="eyebrow text-[#0F766E]">Counter Price Benchmark</div>
          <h2 className="h2 mt-2">
            Signature dishes in {activeAreaName}
          </h2>
          <p className="mt-1.5 text-sm text-[#78716C]">
            Compare the exact in-store counter price against inflated food delivery apps before ordering.
          </p>
        </div>

        <div className="mt-8 flex flex-col lg:flex-row gap-6 items-stretch">
          {/* Spotlight Card */}
          <div className="flex-1 bg-[#1C1917] text-white rounded-[32px] p-7 sm:p-9 relative overflow-hidden flex flex-col justify-between shadow-xl">
            <div
              aria-hidden="true"
              className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(255,90,54,0.35),transparent_70%)] pointer-events-none"
            />
            <div className="relative z-10">
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-[#FF5A36] text-[#1C1917] text-xs font-black uppercase tracking-wide">
                  Dish Spotlight
                </span>
                <span className="px-3 py-1 rounded-full bg-white/15 text-[#5EEAD4] text-xs font-bold">
                  {currentSpotlight.savings}
                </span>
              </div>

              <h3 className="hd mt-5 text-2xl sm:text-3xl font-extrabold leading-tight text-white">
                {currentSpotlight.name}
              </h3>
              <p className="mt-2 text-sm sm:text-base text-stone-300 leading-relaxed max-w-lg">
                {currentSpotlight.desc}
              </p>

              <div className="mt-6 flex items-baseline gap-4">
                <span className="hd text-4xl sm:text-5xl font-black text-white">
                  ₹{currentSpotlight.counterPrice}
                </span>
                <span className="text-sm font-semibold text-stone-300">
                  at {currentSpotlight.restaurant} · {currentSpotlight.area}
                </span>
              </div>

              <div className="mt-2 text-xs text-stone-400">
                Food delivery app price: <span className="line-through">₹{currentSpotlight.appPrice}</span> + packaging + delivery fee
              </div>
            </div>

            <div className="mt-6 relative z-10 flex flex-wrap gap-3">
              <button
                onClick={() => navigate(`/search?q=${encodeURIComponent(currentSpotlight.name)}`)}
                className="btn bg-white text-[#1C1917] hover:bg-stone-100 min-h-[46px] rounded-xl font-bold cursor-pointer"
              >
                Find counters near you
              </button>
              {currentSpotlight.restaurantSlug && (
                <button
                  onClick={() => navigate(`/${currentSpotlight.restaurantSlug}`)}
                  className="btn bg-transparent border border-white/25 text-white hover:bg-white/10 min-h-[46px] rounded-xl font-bold cursor-pointer"
                >
                  View full menu →
                </button>
              )}
            </div>
          </div>

          {/* Dish Selector List */}
          <div className="flex-1 flex flex-col gap-3 justify-center">
            {activeLocationDishes.map((dish, idx) => {
              const isSelected = selectedSpotlightIndex === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedSpotlightIndex(idx)}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isSelected
                      ? 'bg-orange-50/60 border-[#FF5A36] shadow-sm ring-2 ring-[#FF5A36]/30'
                      : 'bg-white border-[#E7E2DA] hover:border-stone-400'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center text-white font-black text-base shadow-xs"
                      style={{ background: dish.gradient }}
                    >
                      ₹
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {dish.isVeg && (
                          <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0"></span>
                        )}
                        <h4 className="font-bold text-base text-[#1C1917] truncate">
                          {dish.name}
                        </h4>
                      </div>
                      <p className="text-xs text-[#78716C] mt-0.5 truncate">
                        {dish.restaurant} · {dish.area}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="hd text-xl font-black text-[#D8350F]">
                      ₹{dish.counterPrice}
                    </span>
                    <div className="text-[11px] font-bold text-[#0F766E]">
                      {dish.savings}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================
          4. CRAVING QUIZ DISCOVERY TOOL
      ======================================================== */}
      <section className="sec py-14">
        <div className="max-w-2xl mx-auto">
          {/* Food Quiz Card */}
          <div className="bg-gradient-to-br from-[#E6F4F1] to-[#F0FAF7] border border-[#BCE3DA] rounded-[32px] p-7 sm:p-8 flex flex-col justify-between shadow-sm">
            <div>
              <span className="px-3 py-1 rounded-full bg-white text-[#0F766E] text-xs font-black uppercase tracking-wider shadow-xs">
                Craving Quiz
              </span>
              <h3 className="hd mt-4 text-2xl sm:text-3xl font-extrabold text-[#1C1917]">
                What should you eat right now?
              </h3>
              <p className="mt-2 text-sm text-[#57534E] leading-relaxed">
                Answer 3 quick questions about your mood, budget, and cravings to get matched instantly.
              </p>
            </div>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setQuizModalOpen(true)}
                className="btn bg-[#0F766E] hover:bg-[#115E59] text-white min-h-[46px] px-6 rounded-xl font-bold cursor-pointer shadow-sm flex items-center gap-2"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Take 60-Second Quiz</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      

      {/* Interactive Modals */}
      <React.Suspense fallback={null}>
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
