import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  Crosshair, 
  Sparkles, 
  Compass, 
  Utensils, 
  ArrowRight, 
  Coffee, 
  CheckCircle, 
  Clock, 
  PhoneCall, 
  Flame,
  ChevronRight,
  TrendingUp,
  Heart,
  RotateCw,
  HelpCircle,
  Calendar,
  Sun,
  Sunset,
  Moon,
  Landmark,
  BadgePercent
} from 'lucide-react';
import { Restaurant, MenuItem, Collection } from '../types/database';
import { api } from '../lib/supabase';
import { 
  getUserLocation, 
  calculateDistanceKm, 
  GeoCoordinates,
  getCachedUserCoordinates,
  saveCachedUserCoordinates,
  getNearestAreaName,
  detectAreaContext,
  formatDistance
} from '../lib/location';
import { getBookmarks } from '../lib/bookmarks';
import { RestaurantCard } from '../components/RestaurantCard';
import { FoodItemCard } from '../components/FoodItemCard';
import { CollectionCard } from '../components/CollectionCard';
import { RestaurantCardSkeleton, FoodCardSkeleton, CollectionCardSkeleton } from '../components/Skeleton';
import { useToast } from '../components/Toast';
import { SpinWheelModal } from '../components/interactive/SpinWheelModal';
import { FoodQuizModal } from '../components/interactive/FoodQuizModal';
import { DayPlannerModal } from '../components/interactive/DayPlannerModal';

interface HomeProps {
  navigate: (path: string) => void;
}

type MoodType = 
  | 'studying' 
  | 'hungry' 
  | 'chill' 
  | 'social' 
  | 'romantic' 
  | 'adventurous' 
  | 'budget' 
  | 'premium';

type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

const MOODS: { id: MoodType; label: string; icon: string; subtitle: string; bg: string; border: string; text: string }[] = [
  { id: 'studying', label: 'Studying', icon: '📚', subtitle: 'WiFi • Quiet • Power Outlets', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  { id: 'hungry', label: 'Hungry', icon: '🍔', subtitle: 'Quick Bites • Heavy Meals', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
  { id: 'chill', label: 'Chill', icon: '☕', subtitle: 'Ambience • Relaxed Vibes', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
  { id: 'social', label: 'Social', icon: '👥', subtitle: 'Group Hangout • Big Tables', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
  { id: 'romantic', label: 'Romantic', icon: '🕯️', subtitle: 'Date Night • Cozy Ambience', bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700' },
  { id: 'adventurous', label: 'Adventurous', icon: '🧭', subtitle: 'Unique Dishes • Hidden Gems', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
  { id: 'budget', label: 'Budget-Friendly', icon: '💸', subtitle: 'Under ₹150 • Student Combos', bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700' },
  { id: 'premium', label: 'Premium', icon: '✨', subtitle: 'Splurge Today • Fine Dining', bg: 'bg-stone-100', border: 'border-stone-300', text: 'text-stone-800' },
];

const CUISINE_CHIPS = [
  { name: 'Cafes & Brews', icon: '☕', query: 'Cafe' },
  { name: 'North Indian & Thali', icon: '🍛', query: 'North Indian' },
  { name: 'Italian & Pizza', icon: '🍕', query: 'Italian' },
  { name: 'Fast Food & Momos', icon: '🥟', query: 'Fast Food' },
  { name: 'Chinese & Rolls', icon: '🥢', query: 'Chinese' },
  { name: 'Desserts & Bakes', icon: '🧇', query: 'Desserts' },
  { name: 'Heritage Legends', icon: '🏛️', query: 'Heritage' },
  { name: 'Late Night Bites', icon: '🌙', query: 'Late Night' },
];

export const Home: React.FC<HomeProps> = ({ navigate }) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Real coordinates (defaults to cached if available)
  const [userCoords, setUserCoords] = useState<GeoCoordinates | null>(() => getCachedUserCoordinates());
  const [locating, setLocating] = useState(false);

  // Mood selection state
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);

  // Time of Day state (auto-detected from current local time)
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<TimeOfDay>(() => {
    const hr = new Date().getHours();
    if (hr >= 6 && hr < 11) return 'morning';
    if (hr >= 11 && hr < 16) return 'afternoon';
    if (hr >= 16 && hr < 20) return 'evening';
    return 'night';
  });

  // Interactive Modals
  const [spinModalOpen, setSpinModalOpen] = useState(false);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [plannerModalOpen, setPlannerModalOpen] = useState(false);

  // Data states
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionCounts, setCollectionCounts] = useState<Record<string, number>>({});

  // Auto-suggest search state
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    loadHomeData();
    // Automatically trigger GPS detection on mount
    triggerAutoLocation();

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
    } catch (e) {
      // User didn't grant or browser blocked, gracefully keep existing or show general
    } finally {
      setLocating(false);
    }
  };

  const loadHomeData = async () => {
    setLoading(true);
    try {
      const [restData, itemData, colData] = await Promise.all([
        api.getRestaurants(true),
        api.getMenuItems(),
        api.getCollections(true),
      ]);
      setRestaurants(restData);
      setMenuItems(itemData.filter((i) => i.is_available));
      setCollections(colData);

      // Load counts for collections
      const counts: Record<string, number> = {};
      for (const col of colData) {
        const items = await api.getCollectionItems(col.id);
        counts[col.id] = items.length;
      }
      setCollectionCounts(counts);
    } catch (e) {
      console.error('Error loading home data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleManualLocationClick = async () => {
    setLocating(true);
    try {
      const coords = await getUserLocation();
      setUserCoords(coords);
      saveCachedUserCoordinates(coords);
      window.dispatchEvent(new CustomEvent('menumap_location_updated', { detail: coords }));
      const context = detectAreaContext(coords, restaurants);
      showToast(`Location detected! Showing cafes near ${context.areaName}.`, 'success');
    } catch (err: any) {
      showToast('Location permission denied or unavailable. Showing all venues in Delhi NCR.', 'info');
    } finally {
      setLocating(false);
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  // Full Detected Area Context dynamically from coordinates & verified venue coordinates
  const areaContext = useMemo(() => {
    if (!userCoords || restaurants.length === 0) return null;
    return detectAreaContext(userCoords, restaurants);
  }, [userCoords, restaurants]);

  const detectedAreaName = areaContext?.areaName || null;

  // Compute distance for all restaurants
  const restaurantsWithDistance = useMemo(() => {
    return restaurants.map((r) => {
      const dist = userCoords 
        ? calculateDistanceKm(userCoords.latitude, userCoords.longitude, r.latitude, r.longitude)
        : undefined;
      return { ...r, distanceKm: dist };
    });
  }, [restaurants, userCoords]);

  // Nearest cafes (sorted strictly by physical distance if coords available)
  const nearbyRestaurants = useMemo(() => {
    if (userCoords) {
      return [...restaurantsWithDistance]
        .sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999))
        .slice(0, 8);
    }
    // When location not yet granted, show top rated cafes
    return [...restaurantsWithDistance]
      .sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0) || b.rating_avg - a.rating_avg)
      .slice(0, 8);
  }, [restaurantsWithDistance, userCoords]);

  // Best Rated overall
  const bestRatedRestaurants = useMemo(() => {
    return [...restaurantsWithDistance]
      .sort((a, b) => b.rating_avg - a.rating_avg || b.rating_count - a.rating_count)
      .slice(0, 8);
  }, [restaurantsWithDistance]);

  // Mood Filtered Restaurants (sorted by distance if coords available)
  const moodRestaurants = useMemo(() => {
    if (!selectedMood) return [];
    return restaurantsWithDistance
      .filter((r) => {
        switch (selectedMood) {
          case 'studying':
            return (
              r.best_for_tags?.includes('Studying') ||
              r.facilities?.some((f) => /wifi|power|outlets/i.test(f)) ||
              r.cuisine_types?.includes('Cafe')
            );
          case 'hungry':
            return r.average_cost_for_two <= 450 || r.meal_types?.includes('Lunch');
          case 'chill':
            return (
              r.best_for_tags?.includes('Coffee') ||
              r.ambience_tags?.includes('Cozy & Quiet') ||
              r.cuisine_types?.includes('Cafe')
            );
          case 'social':
            return (
              r.best_for_tags?.includes('Groups') ||
              r.ambience_tags?.includes('Lively & Social') ||
              r.facilities?.some((f) => /party|seating|group/i.test(f))
            );
          case 'romantic':
            return (
              r.best_for_tags?.includes('Date Night') ||
              r.ambience_tags?.includes('Romantic & Intimate') ||
              r.rating_avg >= 4.4
            );
          case 'adventurous':
            return r.specialty_dishes && r.specialty_dishes.length > 0;
          case 'budget':
            return (
              r.best_for_tags?.includes('Budget') ||
              r.average_cost_for_two <= 350 ||
              r.price_range === '₹'
            );
          case 'premium':
            return r.average_cost_for_two >= 600 || r.price_range === '₹₹₹';
          default:
            return true;
        }
      })
      .sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999))
      .slice(0, 6);
  }, [restaurantsWithDistance, selectedMood]);

  // Time-Based Restaurants
  const timeBasedRestaurants = useMemo(() => {
    const list = restaurantsWithDistance.filter((r) => {
      switch (selectedTimeOfDay) {
        case 'morning':
          return (
            r.best_for_tags?.includes('Breakfast') ||
            r.meal_types?.includes('Breakfast') ||
            r.cuisine_types?.some((c) => /breakfast|sweets|bakery|chai/i.test(c))
          );
        case 'afternoon':
          return (
            r.meal_types?.includes('Lunch') ||
            r.best_for_tags?.includes('Budget') ||
            r.average_cost_for_two <= 450
          );
        case 'evening':
          return (
            r.best_for_tags?.includes('Coffee') ||
            r.meal_types?.includes('Snacks') ||
            r.cuisine_types?.some((c) => /cafe|chai|fast food|momos/i.test(c))
          );
        case 'night':
          return (
            r.best_for_tags?.includes('Late Night') ||
            r.meal_types?.includes('Late Night') ||
            r.is_open
          );
      }
    });

    return (list.length >= 3 ? list : restaurantsWithDistance)
      .sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999))
      .slice(0, 6);
  }, [restaurantsWithDistance, selectedTimeOfDay]);

  // Popular Dishes from nearby restaurants
  const popularDishes = useMemo(() => {
    return [...menuItems]
      .filter((i) => i.is_available)
      .sort((a, b) => {
        if (b.is_must_try !== a.is_must_try) return (b.is_must_try ? 1 : 0) - (a.is_must_try ? 1 : 0);
        return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0) || b.view_count - a.view_count;
      })
      .slice(0, 8);
  }, [menuItems]);

  // Personalized picks from saved bookmarks
  const bookmarks = getBookmarks();
  const bookmarkedRestaurants = restaurants.filter((r) => bookmarks.restaurants.includes(r.id));
  const preferredCuisines = Array.from(new Set(bookmarkedRestaurants.flatMap((r) => r.cuisine_types || [])));

  const personalizedRecommendations =
    preferredCuisines.length > 0
      ? restaurantsWithDistance.filter(
          (r) =>
            !bookmarks.restaurants.includes(r.id) &&
            r.cuisine_types?.some((c) => preferredCuisines.includes(c))
        ).slice(0, 4)
      : [];

  // Auto-suggest
  const autoSuggestRestaurants = searchQuery.trim()
    ? restaurants.filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3)
    : [];
  const autoSuggestDishes = searchQuery.trim()
    ? menuItems.filter((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3)
    : [];

  return (
    <div className="min-w-0 flex flex-col space-y-14 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-14 sm:pt-12 sm:pb-20 bg-gradient-to-b from-orange-50/80 via-rose-50/40 to-stone-50/20 border-b border-orange-100/60">
        
        {/* Ambient Blur */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none overflow-hidden -z-10">
          <div className="absolute -top-12 left-10 w-72 h-72 rounded-full bg-rose-400/15 blur-3xl" />
          <div className="absolute top-4 right-10 w-80 h-80 rounded-full bg-amber-400/15 blur-3xl" />
          <div className="absolute top-28 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-teal-400/10 blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          
          {/* Tagline / Detected Location Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 shadow-xs border border-orange-200/90 text-xs sm:text-sm font-bold text-slate-800 backdrop-blur-sm">
            {userCoords ? (
              <>
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>
                  Live GPS: <strong className="text-orange-600">{areaContext?.areaName || 'Your Location'}</strong>
                  {areaContext && areaContext.distanceKm < 30 && (
                    <span className="font-medium text-slate-500 text-xs ml-1.5">
                      (closest spot {formatDistance(areaContext.distanceKm)})
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={handleManualLocationClick}
                  disabled={locating}
                  title="Refresh location"
                  className="ml-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 underline cursor-pointer"
                >
                  {locating ? 'Updating...' : 'Re-detect'}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleManualLocationClick}
                disabled={locating}
                className="flex items-center gap-2 cursor-pointer hover:text-orange-600 transition-colors"
              >
                <Crosshair className={`w-4 h-4 text-rose-500 ${locating ? 'animate-spin' : ''}`} />
                <span>{locating ? 'Detecting your GPS location...' : 'Tap to automatically detect your live location'}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-extrabold">
                  Instant Proximity
                </span>
              </button>
            )}
          </div>

          {/* Main Headline */}
          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl text-slate-900 tracking-tight leading-[1.15]">
            {areaContext ? (
              areaContext.headline
            ) : (
              <>
                Discover the best{' '}
                <span className="bg-gradient-to-r from-rose-600 via-orange-600 to-amber-500 bg-clip-text text-transparent">
                  cafes & restaurants
                </span>{' '}
                near you
              </>
            )}
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 font-medium">
            {areaContext
              ? areaContext.subheadline
              : 'Explore authentic food menus, 0% markup counter prices, verified seating ambience, and direct WhatsApp pre-orders.'}
          </p>

          {/* Search Box with GPS auto-detection */}
          <div className="max-w-3xl mx-auto relative text-left">
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex flex-col sm:flex-row items-stretch bg-white rounded-3xl sm:rounded-full shadow-xl shadow-orange-500/10 border-2 border-orange-200/80 p-2 gap-2 transition-all focus-within:border-orange-500 focus-within:shadow-orange-500/20"
            >
              <div className="flex-1 flex items-center px-4 gap-3 py-2 sm:py-0">
                <Search className="w-5 h-5 text-orange-500 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  placeholder={
                    areaContext 
                      ? `Search cafes, momos, pasta, or coffee in ${areaContext.areaName}...` 
                      : 'Search for cafe, restaurant, cuisine, or dish in Delhi NCR...'
                  }
                  className="w-full bg-transparent text-slate-800 placeholder-slate-400 text-sm sm:text-base font-medium focus:outline-hidden"
                />
              </div>

              {/* GPS Location Button */}
              <div className="flex items-center gap-2 px-2">
                <button
                  type="button"
                  onClick={handleManualLocationClick}
                  disabled={locating}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold text-slate-700 bg-stone-100 hover:bg-stone-200 transition-colors shrink-0 cursor-pointer"
                  title="Detect GPS location"
                >
                  <Crosshair className={`w-3.5 h-3.5 text-rose-500 ${locating ? 'animate-spin' : ''}`} />
                  <span>{locating ? 'Locating...' : userCoords ? (areaContext?.areaName || 'Near You') : 'Auto Detect'}</span>
                </button>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold text-sm sm:text-base shadow-md shadow-orange-500/25 active:scale-95 transition-all shrink-0 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Explore</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Auto-suggest dropdown */}
            {searchFocused && searchQuery.trim().length > 0 && (
              <div
                className="absolute top-full mt-2 inset-x-0 bg-white rounded-3xl shadow-2xl border border-stone-200 p-3 z-30 max-h-80 overflow-y-auto space-y-2 animate-in fade-in duration-200"
                onMouseDown={(e) => e.preventDefault()}
              >
                {autoSuggestRestaurants.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3">
                      Restaurants & Cafes
                    </span>
                    {autoSuggestRestaurants.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => navigate(`/${r.slug}`)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-stone-50 text-left transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Compass className="w-4 h-4 text-orange-500 shrink-0" />
                          <span className="text-sm font-bold text-slate-800">{r.name}</span>
                          <span className="text-xs text-slate-400">({r.city})</span>
                        </div>
                        <span className="text-xs font-semibold text-rose-600">View menu</span>
                      </button>
                    ))}
                  </div>
                )}

                {autoSuggestDishes.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3">
                      Dishes
                    </span>
                    {autoSuggestDishes.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => navigate(`/food/${d.slug}`)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-stone-50 text-left transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Utensils className="w-4 h-4 text-teal-500 shrink-0" />
                          <span className="text-sm font-bold text-slate-800">{d.name}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-700">₹{d.price}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Cuisine Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {CUISINE_CHIPS.map((chip) => (
              <button
                key={chip.name}
                onClick={() => navigate(`/search?cuisine=${encodeURIComponent(chip.query)}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/90 hover:bg-white text-slate-700 border border-stone-200/90 shadow-2xs hover:border-orange-300 hover:text-orange-600 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>{chip.icon}</span>
                <span>{chip.name}</span>
              </button>
            ))}
          </div>

          {/* Interactive Boosters: Spin Wheel, Food Quiz, Day Planner */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <button
              onClick={() => setSpinModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-all font-bold text-xs shadow-2xs cursor-pointer active:scale-95"
            >
              <RotateCw className="w-3.5 h-3.5 text-rose-500" />
              <span>🎡 Spin the Wheel for Suggestions</span>
            </button>

            <button
              onClick={() => setQuizModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-all font-bold text-xs shadow-2xs cursor-pointer active:scale-95"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>🎯 30-Sec Food Match Quiz</span>
            </button>

            <button
              onClick={() => setPlannerModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition-all font-bold text-xs shadow-2xs cursor-pointer active:scale-95"
            >
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              <span>🗺️ Build Your Day Planner</span>
            </button>
          </div>

        </div>
      </section>

      {/* 2. "I'M FEELING..." MOOD-BASED RECOMMENDATIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-orange-600">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Intent-Driven Dining</span>
            </div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight mt-0.5">
              What's your mood right now?
            </h2>
          </div>
          {selectedMood && (
            <button
              onClick={() => setSelectedMood(null)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
            >
              Clear mood
            </button>
          )}
        </div>

        {/* Mood Chips Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {MOODS.map((m) => {
            const isSelected = selectedMood === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedMood(isSelected ? null : m.id)}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                  isSelected
                    ? `${m.bg} ${m.border} ring-2 ring-orange-500 shadow-md scale-102`
                    : 'bg-white border-stone-200/90 hover:border-orange-300 hover:bg-stone-50/80 shadow-2xs'
                }`}
              >
                <span className="text-2xl">{m.icon}</span>
                <span className={`text-xs font-extrabold ${isSelected ? m.text : 'text-slate-800'}`}>
                  {m.label}
                </span>
                <span className="text-[10px] text-slate-400 leading-tight line-clamp-1">
                  {m.subtitle}
                </span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Mood Filtered Results Tray */}
        {selectedMood && (
          <div className="p-6 rounded-3xl bg-gradient-to-r from-orange-50/80 via-white to-amber-50/60 border border-orange-200/80 animate-in fade-in duration-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-slate-900">
                Top Cafes for <span className="text-orange-600">{MOODS.find((m) => m.id === selectedMood)?.label}</span> Near You
              </h3>
              <span className="text-xs text-slate-500">{moodRestaurants.length} matching spots</span>
            </div>
            {moodRestaurants.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {moodRestaurants.map((r) => (
                  <RestaurantCard key={r.id} restaurant={r} navigate={navigate} />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-500">
                No venues matching this mood in your immediate radius.
              </div>
            )}
          </div>
        )}
      </section>

      {/* 3. TIME-BASED SECTION (PERSONALIZED TO CURRENT TIME) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-teal-600">
              <Clock className="w-3.5 h-3.5" />
              <span>Right Now {detectedAreaName ? `Near ${detectedAreaName}` : 'Near You'}</span>
            </div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight mt-0.5">
              {selectedTimeOfDay === 'morning' && 'Best Breakfast Spots & Morning Chai'}
              {selectedTimeOfDay === 'afternoon' && 'Quick Lunch & Value Thalis'}
              {selectedTimeOfDay === 'evening' && 'Evening Snacks, Cafes & Chai Addas'}
              {selectedTimeOfDay === 'night' && 'Late Night Bites Open Now'}
            </h2>
          </div>

          {/* Time Switcher */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-2xl border border-stone-200/80 self-start sm:self-auto">
            <button
              onClick={() => setSelectedTimeOfDay('morning')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedTimeOfDay === 'morning'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Morning (7-11 AM)
            </button>
            <button
              onClick={() => setSelectedTimeOfDay('afternoon')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedTimeOfDay === 'afternoon'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lunch (12-3 PM)
            </button>
            <button
              onClick={() => setSelectedTimeOfDay('evening')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedTimeOfDay === 'evening'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Snacks (4-7 PM)
            </button>
            <button
              onClick={() => setSelectedTimeOfDay('night')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedTimeOfDay === 'night'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Night (8 PM-2 AM)
            </button>
          </div>
        </div>

        {/* Time-Based Restaurant Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <RestaurantCardSkeleton key={n} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {timeBasedRestaurants.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} navigate={navigate} />
            ))}
          </div>
        )}
      </section>

      {/* 4. REAL NEARBY CAFES (SORTED BY GPS DISTANCE) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-rose-600">
              <Crosshair className="w-3.5 h-3.5" />
              <span>{userCoords ? 'GPS Live Proximity' : 'Popular Venues'}</span>
            </div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight mt-0.5">
              {detectedAreaName ? `Popular Cafes Near ${detectedAreaName}` : 'Cafes & Restaurants Near You'}
            </h2>
          </div>

          <button
            onClick={() => navigate('/nearby')}
            className="inline-flex items-center gap-1 text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors cursor-pointer"
          >
            <span>View all nearby</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <RestaurantCardSkeleton key={n} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {nearbyRestaurants.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} navigate={navigate} />
            ))}
          </div>
        )}
      </section>

      {/* 5. CONTEXTUAL: ONLY IF PHYSICALLY NEAR DU CAMPUS */}
      {areaContext?.isDUCampus && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🎓</span>
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-rose-600">
                <span>North Campus Special</span>
              </div>
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
                Hey DU! Best Cafes & Study Spots Near You
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Pocket-friendly student combos, verified high-speed Wi-Fi, and power outlets in Hudson Lane & Kamla Nagar.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {restaurantsWithDistance
              .filter((r) => (r.distanceKm ?? 99) <= 4.5 && (r.best_for_tags?.includes('Studying') || r.best_for_tags?.includes('Budget') || r.cuisine_types?.includes('Cafe')))
              .slice(0, 4)
              .map((r) => (
                <RestaurantCard key={r.id} restaurant={r} navigate={navigate} />
              ))}
          </div>
        </section>
      )}

      {/* 5.2 CONTEXTUAL: ONLY IF PHYSICALLY NEAR HISTORIC / HERITAGE TRAIL */}
      {areaContext?.isHeritage && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center gap-2.5">
            <Landmark className="w-6 h-6 text-amber-600" />
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-600">
                <span>Historic Food Trail</span>
              </div>
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
                Century-Old Historic Dishes & Heritage Legends
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Walk through royal Mughlai gravies, 150-year-old stuffed parathas, and traditional sweets.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {restaurantsWithDistance
              .filter((r) => (r.distanceKm ?? 99) <= 4.5 && (r.heritage_area || r.best_for_tags?.includes('Traditional Food')))
              .slice(0, 4)
              .map((r) => (
                <RestaurantCard key={r.id} restaurant={r} navigate={navigate} />
              ))}
          </div>
        </section>
      )}

      {/* 5.3 CONTEXTUAL: ONLY IF PHYSICALLY IN WEST DELHI / NANGLOI */}
      {areaContext?.isWestDelhi && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🥘</span>
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-teal-600">
                <span>Neighborhood Highlights</span>
              </div>
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
                Local Gems & Family Dining in {areaContext.areaName}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Pure vegetarian favorites, authentic thalis, cozy cafes, and famous street-food addas near you.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {restaurantsWithDistance
              .filter((r) => (r.distanceKm ?? 99) <= 6)
              .slice(0, 4)
              .map((r) => (
                <RestaurantCard key={r.id} restaurant={r} navigate={navigate} />
              ))}
          </div>
        </section>
      )}

      {/* 6. POPULAR & MUST-TRY DISHES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-amber-600">
              <Flame className="w-3.5 h-3.5" />
              <span>Trending Flavours</span>
            </div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight mt-0.5">
              Popular Must-Try Dishes
            </h2>
          </div>

          <button
            onClick={() => navigate('/search')}
            className="inline-flex items-center gap-1 text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors cursor-pointer"
          >
            <span>Explore all dishes</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <FoodCardSkeleton key={n} />
            ))}
          </div>
        ) : popularDishes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularDishes.map((dish) => {
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
        ) : null}
      </section>

      {/* 7. PERSONALIZED RECOMMENDATIONS (IF BOOKMARKS EXIST) */}
      {personalizedRecommendations.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-orange-500/10 via-rose-500/5 to-amber-500/10 border border-orange-200/70">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <h2 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">
              Picked Just for You
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            Based on cuisines from your saved bookmarks and dining history.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {personalizedRecommendations.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} navigate={navigate} />
            ))}
          </div>
        </section>
      )}

      {/* 8. TOP RATED OVERALL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-amber-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Highest Rated</span>
            </div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight mt-0.5">
              Top Rated Cafes & Dining Spots
            </h2>
          </div>

          <button
            onClick={() => navigate('/restaurants')}
            className="inline-flex items-center gap-1 text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors cursor-pointer"
          >
            <span>All restaurants</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestRatedRestaurants.slice(0, 8).map((r) => (
            <RestaurantCard key={r.id} restaurant={r} navigate={navigate} />
          ))}
        </div>
      </section>

      {/* 9. CURATED EDITORIAL COLLECTIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-orange-600 text-xs font-extrabold uppercase tracking-widest">
              <Flame className="w-4 h-4 fill-orange-600" />
              <span>Living Neighborhood Guides</span>
            </div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight mt-1">
              Iconic Area Guides & Real Menus
            </h2>
          </div>

          <button
            onClick={() => navigate('/iconic-area')}
            className="inline-flex items-center gap-1 text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors cursor-pointer"
          >
            <span>All Iconic Areas</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <CollectionCardSkeleton key={n} />
            ))}
          </div>
        ) : collections.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.slice(0, 6).map((col) => {
              const meta = col.area_metadata;
              const dist = userCoords && meta?.latitude && meta?.longitude
                ? calculateDistanceKm(userCoords.latitude, userCoords.longitude, meta.latitude, meta.longitude)
                : undefined;

              return (
                <CollectionCard
                  key={col.id}
                  collection={col}
                  itemCount={collectionCounts[col.id] || 0}
                  userDistanceKm={dist}
                  navigate={navigate}
                />
              );
            })}
          </div>
        ) : null}
      </section>

      {/* 10. WHY FOODIES CHOOSE MENU MAP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-stone-200/80">
        <div className="text-center space-y-2 mb-10">
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">
            Why Foodies Choose Menu Map
          </h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            100% focused on authentic dine-in discovery, transparent counter prices, and real dining ambience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-4 hover:border-orange-300 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-black">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-extrabold text-lg text-slate-900">
              0% Markup — Real Offline Counter Rates
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              No delivery markups or inflated digital pricing. View exact in-restaurant menus and authentic dish prices verified directly.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-4 hover:border-teal-300 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center font-black">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-extrabold text-lg text-slate-900">
              Verified Dining Amenities & Timings
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Know instantly whether a cafe has power sockets, Wi-Fi, air conditioning, and if they are open right now before you step out.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-4 hover:border-rose-300 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-black">
              <PhoneCall className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-extrabold text-lg text-slate-900">
              Direct Access to Restaurants
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Call, pre-order via WhatsApp, or launch Google Maps directions with a single tap. No middleman cuts or commissions.
            </p>
          </div>
        </div>
      </section>

      {/* Modals */}
      <SpinWheelModal
        isOpen={spinModalOpen}
        onClose={() => setSpinModalOpen(false)}
        restaurants={nearbyRestaurants}
        navigate={navigate}
      />

      <FoodQuizModal
        isOpen={quizModalOpen}
        onClose={() => setQuizModalOpen(false)}
        restaurants={restaurants}
        navigate={navigate}
      />

      <DayPlannerModal
        isOpen={plannerModalOpen}
        onClose={() => setPlannerModalOpen(false)}
        areaName={detectedAreaName || 'Your Area'}
        userCoords={userCoords}
        restaurants={restaurants}
        navigate={navigate}
      />

    </div>
  );
};
