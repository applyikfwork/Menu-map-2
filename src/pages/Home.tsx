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
  Send,
  Coffee,
  CheckCircle2,
  ExternalLink
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
import { 
  getDynamicMealContext, 
  getRecommendedVenues, 
  getRecommendedDishes, 
  getLiveHeroTicket 
} from '../lib/recommendations';
import { RestaurantCard } from '../components/RestaurantCard';
import { useToast } from '../components/Toast';
import { LocationPickerModal } from '../components/LocationPickerModal';

const SpinWheelModal = React.lazy(() =>
  import('../components/interactive/SpinWheelModal').then((m) => ({ default: m.SpinWheelModal }))
);
const FoodQuizModal = React.lazy(() =>
  import('../components/interactive/FoodQuizModal').then((m) => ({ default: m.FoodQuizModal }))
);
const DayPlannerModal = React.lazy(() =>
  import('../components/interactive/DayPlannerModal').then((m) => ({ default: m.DayPlannerModal }))
);

interface HomeProps {
  navigate: (path: string) => void;
}

export const Home: React.FC<HomeProps> = ({ navigate }) => {
  const { showToast } = useToast();

  // Search mode & input
  const [searchMode, setSearchMode] = useState<'dish' | 'cafe'>('dish');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePills, setActivePills] = useState<Record<string, boolean>>({
    'Pure Veg': true,
  });

  // Data
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  // GPS Coordinates
  const [userCoords, setUserCoords] = useState<GeoCoordinates | null>(() => getCachedUserCoordinates());
  const [locating, setLocating] = useState(false);

  // Interactive Modals
  const [spinModalOpen, setSpinModalOpen] = useState(false);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [plannerModalOpen, setPlannerModalOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  // Restaurant tab filter
  const [restaurantFilter, setRestaurantFilter] = useState<'All' | 'Pure Veg' | 'Rooftop' | 'Late night'>('All');

  // Selected Dish for Spotlight
  const [selectedSpotlightIndex, setSelectedSpotlightIndex] = useState(0);

  useEffect(() => {
    loadHomeData();
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
    } catch {
      // Graceful fallback
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
    } catch {
      showToast('GPS unavailable. Please pick your Delhi neighborhood below.', 'info');
      setLocationModalOpen(true);
    } finally {
      setLocating(false);
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

  const togglePill = (name: string) => {
    setActivePills((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  // Filtered restaurants for Verified Restaurants Grid (auto-sorted by distance when GPS is active)
  const filteredRestaurants = useMemo(() => {
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

  // Compute distance for nearby restaurants
  const restaurantsWithDistance = useMemo(() => {
    return restaurants.map((r) => {
      const dist = userCoords
        ? calculateDistanceKm(userCoords.latitude, userCoords.longitude, r.latitude, r.longitude)
        : undefined;
      return { ...r, distanceKm: dist };
    });
  }, [restaurants, userCoords]);

  // Detected Area Context
  const detectedAreaContext = useMemo(() => {
    if (!userCoords) return null;
    return detectAreaContext(userCoords, restaurants);
  }, [userCoords, restaurants]);

  // Dynamic Real-Time Meal Context
  const mealContext = useMemo(() => getDynamicMealContext(), []);

  // Multi-Factor Live Hero Ticket (direct mathematical scoring from live DB items)
  const heroTicketData = useMemo(() => {
    return getLiveHeroTicket(restaurants, menuItems, userCoords);
  }, [restaurants, menuItems, userCoords]);

  const heroRestaurant = heroTicketData.restaurant;
  const heroTicketItems = heroTicketData.items;
  const heroTicketTotal = {
    counterTotal: heroTicketData.counterTotal,
    appTotal: heroTicketData.appTotal,
    savings: heroTicketData.savingsTotal,
    savingsPct: heroTicketData.savingsPctTotal,
  };

  // Popular search suggestions from live database
  const dynamicDishSuggestions = useMemo(() => {
    if (menuItems.length === 0) {
      return [
        { title: 'Kurkure Paneer Momos', meta: 'from ₹169', query: 'Paneer Momos' },
        { title: 'Ferrero Rocher Monster Shake', meta: '₹219', query: 'Monster Shake' },
        { title: 'Cheesy Peri Peri Fries Platter', meta: '₹189', query: 'Peri Peri Fries' },
        { title: 'Dark Chocolate Belgian Waffle', meta: '₹179', query: 'Waffle' },
      ];
    }
    const candidates = menuItems.filter((i) => i.is_featured || i.is_must_try);
    const pool = candidates.length >= 4 ? candidates : menuItems;
    return pool.slice(0, 4).map((i) => ({
      title: i.name,
      meta: `₹${i.price}`,
      query: i.name,
    }));
  }, [menuItems]);

  const dynamicCafeSuggestions = useMemo(() => {
    if (restaurants.length === 0) {
      return [
        { title: 'Big Yellow Door (BYD)', meta: 'Hudson Lane', slug: 'big-yellow-door' },
        { title: 'Ricos Cafe & Bistro', meta: 'Hudson Lane', slug: 'ricos-cafe-bistro' },
        { title: 'Woodbox Cafe', meta: 'Hudson Lane', slug: 'woodbox-cafe' },
        { title: 'Hudson Cafe', meta: 'Hudson Lane', slug: 'hudson-cafe' },
      ];
    }
    const featured = restaurants.filter((r) => r.is_featured);
    const pool = featured.length >= 4 ? featured : restaurants;
    return pool.slice(0, 4).map((r) => ({
      title: r.name,
      meta: r.landmark || r.city || 'Delhi NCR',
      slug: r.slug,
    }));
  }, [restaurants]);

  // Marquee dishes
  const marqueeDishes = [
    'Kurkure Momos',
    'Monster Shakes',
    'Butter Chicken',
    'Paneer Tikka',
    'Tandoori Chai',
    'Belgian Waffles',
    'Pink Sauce Pasta',
    'Peri Peri Fries',
    'Thukpa Bowls',
    'Cheese Bomb Burgers',
    'Kurkure Momos',
    'Monster Shakes',
    'Butter Chicken',
    'Paneer Tikka',
    'Tandoori Chai',
    'Belgian Waffles',
  ];

  // 4 Pillars of trust
  const pillars = [
    {
      title: 'Real counter menus',
      desc: 'Curated directly from verified storefront records, not inflated delivery app listings.',
      bg: '#FFE9E2',
      fg: '#D8350F',
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#D8350F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 6h16M4 12h16M4 18h10" />
        </svg>
      ),
    },
    {
      title: 'Verified prices',
      desc: 'Exact dine-in and takeaway counter prices you will pay at the billing cash counter.',
      bg: '#E6F4F1',
      fg: '#0F766E',
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0F766E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m5 12 5 5L20 7" />
        </svg>
      ),
    },
    {
      title: 'Zero commission',
      desc: 'Restaurants keep 100% of their revenue. Diners skip the 30% delivery app markup.',
      bg: '#FEF3C7',
      fg: '#B45309',
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v18M17 7H9.5a2.5 2.5 0 0 0 0 5h5a2.5 2.5 0 0 1 0 5H7" />
        </svg>
      ),
    },
    {
      title: 'Direct WhatsApp',
      desc: 'Your dish selection transforms into a clean order message sent straight to the owner.',
      bg: '#E6F4F1',
      fg: '#0F766E',
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0F766E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.7-5A8.5 8.5 0 1 1 21 11.5Z" />
        </svg>
      ),
    },
  ];

  // Bento living area guides mapped directly from live collections
  const dynamicAreaGuides = useMemo(() => {
    const areaGuidesList = collections.filter((c) => c.type === 'Area-Guide' || c.is_featured);
    const pool = areaGuidesList.length > 0 ? areaGuidesList.slice(0, 5) : collections.slice(0, 5);

    const gradients = [
      'linear-gradient(150deg,#F4A261 0%,#C2410C 50%,#431407 100%)',
      'linear-gradient(160deg,#2DD4BF,#0F766E 60%,#134E4A)',
      'linear-gradient(160deg,#F87171,#B91C1C 60%,#7F1D1D)',
      'linear-gradient(160deg,#FBBF24,#B45309 60%,#78350F)',
      'linear-gradient(160deg,#A8A29E,#57534E 60%,#292524)',
    ];

    if (pool.length === 0) {
      return [
        {
          name: 'Hudson Lane & North Campus',
          tag: 'Student adda',
          vibe: 'Monster shakes, pasta, cheese bomb burgers & rooftop chatter.',
          cost: '₹450 for two',
          metro: 'GTB Nagar (Gate 3)',
          slug: 'hudson-lane-north-campus-food-guide',
          gradient: gradients[0],
          span: 'md:col-span-2 md:row-span-2 min-h-[380px]',
        },
        {
          name: 'Satya Niketan',
          tag: 'South Campus hub',
          vibe: 'Student budget bites, loaded fries & terrace cafes.',
          cost: '₹400 for two',
          metro: 'Durgabai Deshmukh South Campus',
          slug: 'satya-niketan-south-campus-food-guide',
          gradient: gradients[1],
          span: 'min-h-[220px]',
        },
        {
          name: 'Majnu Ka Tila',
          tag: 'Tibetan colony',
          vibe: 'Laphing, thukpa, tingmo, Korean corn dogs & riverside cafes.',
          cost: '₹500 for two',
          metro: 'Vidhan Sabha Metro',
          slug: 'majnu-ka-tila-tibetan-food-guide',
          gradient: gradients[2],
          span: 'min-h-[220px]',
        },
        {
          name: 'Connaught Place',
          tag: 'Heritage & nightlife',
          vibe: 'Colonnade cafes, century-old bakeries & craft coffee.',
          cost: '₹850 for two',
          metro: 'Rajiv Chowk',
          slug: 'connaught-place-heritage-food-guide',
          gradient: gradients[3],
          span: 'min-h-[220px]',
        },
        {
          name: 'Mukherjee Nagar',
          tag: 'Study crowd',
          vibe: 'Pocket-friendly thalis, lassi and late-night chai addas.',
          cost: '₹250 for two',
          metro: 'GTB Nagar',
          slug: 'mukherjee-nagar-food-guide',
          gradient: gradients[4],
          span: 'min-h-[220px]',
        },
      ];
    }

    return pool.map((col, idx) => {
      const meta = col.area_metadata;
      const cleanName = meta?.area_name || col.title.replace(/ Food (Map|Guide)/gi, '');
      const tag = meta?.zone || col.type || 'Iconic Hub';
      const vibe = meta?.vibe_badge || col.description;
      const cost = meta?.avg_cost_for_two ? `₹${meta.avg_cost_for_two} for two` : '₹450 for two';
      const metro = meta?.nearest_metro ? meta.nearest_metro.split(',')[0] : 'Delhi Metro';
      const span = idx === 0 ? 'md:col-span-2 md:row-span-2 min-h-[380px]' : 'min-h-[220px]';

      return {
        name: cleanName,
        tag,
        vibe,
        cost,
        metro,
        slug: col.slug,
        gradient: gradients[idx % gradients.length],
        span,
      };
    });
  }, [collections]);

  // Dishes spotlight dataset from live menuItems powered by recommendation engine
  const dynamicSpotlightDishes = useMemo(() => {
    const recommended = getRecommendedDishes(menuItems, restaurants, userCoords, 4);

    const gradients = [
      'linear-gradient(150deg,#F59E0B,#B45309)',
      'linear-gradient(150deg,#92400E,#451A03)',
      'linear-gradient(150deg,#EF4444,#9A3412)',
      'linear-gradient(150deg,#FB7185,#BE185D)',
    ];

    if (recommended.length === 0) {
      return [
        {
          name: 'Crispy Kurkure Paneer Momos',
          restaurant: 'Ricos Cafe & Bistro',
          restaurantSlug: 'ricos-cafe-bistro',
          area: 'Hudson Lane',
          counterPrice: 169,
          appPrice: 260,
          savings: 'Save ₹91 (35%)',
          desc: 'Crunchy golden coating with stuffed spiced paneer and spicy garlic dip.',
          tag: 'Bestseller',
          veg: true,
          gradient: gradients[0],
        },
        {
          name: 'Ferrero Rocher Monster Shake',
          restaurant: 'Big Yellow Door',
          restaurantSlug: 'big-yellow-door',
          area: 'Hudson Lane',
          counterPrice: 219,
          appPrice: 320,
          savings: 'Save ₹101 (32%)',
          desc: 'Nutella fudge, vanilla soft-serve and whole Ferrero Rochers on top.',
          tag: 'Campus Legend',
          veg: true,
          gradient: gradients[1],
        },
        {
          name: 'Cheesy Peri Peri Fries Platter',
          restaurant: 'Woodbox Cafe',
          restaurantSlug: 'woodbox-cafe',
          area: 'Hudson Lane',
          counterPrice: 189,
          appPrice: 280,
          savings: 'Save ₹91 (32%)',
          desc: 'Double-fried crisp potatoes tossed in African peri peri with melted cheddar.',
          tag: 'Must Try',
          veg: true,
          gradient: gradients[2],
        },
        {
          name: 'Baked Pink Sauce Penne',
          restaurant: 'Hudson Cafe',
          restaurantSlug: 'hudson-cafe',
          area: 'Hudson Lane',
          counterPrice: 249,
          appPrice: 360,
          savings: 'Save ₹111 (31%)',
          desc: 'Italian plum tomatoes, double cream, baked under a thick mozzarella crust.',
          tag: 'Chef Special',
          veg: true,
          gradient: gradients[3],
        },
      ];
    }

    return recommended.map((item, idx) => ({
      id: item.id,
      name: item.name,
      restaurant: item.restaurantName,
      restaurantSlug: item.restaurantSlug,
      area: item.restaurantArea,
      counterPrice: item.price,
      appPrice: item.appPrice,
      savings: `Save ₹${item.savingsAmt} (${item.savingsPct}%)`,
      desc: item.description || `Freshly prepared ${item.name} at verified in-store counter pricing with 0% app markup.`,
      tag: item.is_featured ? 'Bestseller' : item.is_must_try ? 'Must Try' : 'Top Scored',
      veg: item.dietary_tags?.includes('Veg') ?? true,
      gradient: gradients[idx % gradients.length],
      imageUrl: item.image_url,
    }));
  }, [menuItems, restaurants, userCoords]);

  const currentSpotlight = dynamicSpotlightDishes[selectedSpotlightIndex] || dynamicSpotlightDishes[0];

  // Dynamic Radar Venues (Closest 3 live restaurants powered by recommendation engine)
  const radarVenues = useMemo(() => {
    if (restaurants.length === 0) return [];
    const recommended = getRecommendedVenues(restaurants, userCoords, 3);

    const positions = [
      'top-8 right-6',
      'bottom-8 left-4',
      'top-1/2 -left-2',
    ];

    return recommended.map((r, idx) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      distLabel: r.distanceLabel || r.landmark || 'Delhi NCR',
      position: positions[idx % positions.length],
    }));
  }, [restaurants, userCoords]);

  // 3-Stop Food Crawl
  const crawlStops = [
    {
      stopNumber: 1,
      time: 'Stop 1 · 4:30 PM',
      title: 'Evening Starters & Crunchy Momos',
      dish: 'Kurkure Afghani Momos & Peri Peri Platter',
      venue: 'Woodbox Cafe · Hudson Lane',
      distanceToNext: '120 m · 2 min walk',
    },
    {
      stopNumber: 2,
      time: 'Stop 2 · 6:00 PM',
      title: 'Comfort Mains & Cheesy Crust',
      dish: 'Wood-fired Paneer Tikka Pizza & Pink Penne',
      venue: 'Ricos Cafe & Bistro',
      distanceToNext: '90 m · 1 min walk',
    },
    {
      stopNumber: 3,
      time: 'Stop 3 · 7:45 PM',
      title: 'Dessert, Monster Shakes & Night Walk',
      dish: 'Nutella Brownie Bomb Shake & Belgian Waffle',
      venue: 'Big Yellow Door (BYD)',
      distanceToNext: 'End of evening crawl',
    },
  ];

  // Real Reviews Data
  const communityReviews = [
    {
      diner: 'Aarav Sharma',
      badge: 'DU Student · Hindu College',
      venue: 'Big Yellow Door',
      rating: 5,
      comment:
        'Food apps charge ₹320 for the Monster Shake plus platform fee and delivery. MenuMap showed the exact counter menu price of ₹219. We just walked in, showed the MenuMap counter ticket, and saved ₹200 on our bill.',
      reply: 'Thanks Aarav! We keep our physical counter menu pricing 100% transparent. Glad you enjoyed the shake!',
      replyAuthor: 'BYD Hudson Lane Team',
    },
    {
      diner: 'Priya Mehra',
      badge: 'Verified Explorer · GTB Nagar',
      venue: 'Ricos Cafe & Bistro',
      rating: 5,
      comment:
        'The 3-stop food crawl in Hudson Lane was fantastic! We started at Woodbox, grabbed mains at Ricos, and finished at BYD. No guesswork on parking, metro exit, or prices.',
      reply: 'So glad the Hudson Lane crawl made your weekend smooth Priya! Come try our stone-baked calzone next time.',
      replyAuthor: 'Chef at Ricos',
    },
    {
      diner: 'Kabir Verma',
      badge: 'South Campus Patron',
      venue: 'Woodbox Cafe',
      rating: 5,
      comment:
        'Direct WhatsApp ordering is a game changer for takeaway. No aggregator commission, bill was ₹189 exact counter price. Ready right as I walked up to the counter.',
      reply: 'Thanks Kabir! 0% commission keeps food affordable for everyone.',
      replyAuthor: 'Woodbox Management',
    },
  ];

  return (
    <div className="w-full bg-[#FAF8F5] text-[#1C1917] overflow-hidden">
      {/* ========================================================
          1. HERO (DARK OBSIDIAN #14110F)
      ======================================================== */}
      <section className="relative bg-[#14110F] text-white overflow-hidden pt-6 pb-24 md:pb-32">
        {/* Ambient Radial Gradient Glows */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 -top-52 w-[760px] h-[760px] rounded-full bg-[radial-gradient(circle,rgba(255,90,54,0.55),transparent_65%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-56 -bottom-72 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(13,148,136,0.5),transparent_65%)]"
        />
        {/* Subtle Vertical Grid Lines */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.025)_0_1px,transparent_1px_96px)]"
        />

        <div className="relative max-w-[1280px] mx-auto px-4 sm:px-8 pt-4 sm:pt-8 flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* Hero Left Content */}
          <div className="flex-1 min-w-0 z-10 text-left w-full">
            {/* Real-Time Live Meal Period & Trust Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs sm:text-sm font-bold text-[#5EEAD4] max-w-full flex-wrap">
              <span className="w-4 h-4 rounded-full bg-[#0D9488] inline-flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 text-white stroke-[3.5]" />
              </span>
              <span className="text-white font-black">{mealContext.badge}</span>
              <span className="hidden sm:inline text-white/40">·</span>
              <span className="truncate">Real menus · 0% commission</span>
            </div>

            {/* Giant Fluid Hero Headline */}
            <h1 className="hd mt-4 sm:mt-6 text-3xl sm:text-5xl lg:text-[68px] xl:text-[76px] font-black leading-[1.08] sm:leading-[0.96] tracking-tight">
              Eat at <span className="text-[#FF5A36]">counter prices.</span><br className="hidden sm:inline" />
              Not app prices.
            </h1>

            {/* Subhead */}
            <p className="mt-4 sm:mt-6 max-w-xl text-base sm:text-lg text-[#D6D3D1] leading-relaxed font-normal">
              India's hyper-local directory of real counter menus, exact dine-in prices and iconic neighbourhood food trails. Order straight on WhatsApp, with no middleman.
            </p>

            {/* Unified Universal Search Card */}
            <div className="mt-6 sm:mt-8 max-w-2xl bg-white rounded-[26px] sm:rounded-[32px] p-2.5 sm:p-3 text-[#1C1917] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.7)]">
              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 flex items-center gap-3 px-4 min-h-[52px] sm:min-h-[58px] rounded-[18px] sm:rounded-[22px] bg-[#FAF8F5] border border-transparent focus-within:border-stone-300">
                  <Search className="w-5 h-5 text-[#78716C] shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search momos, monster shakes, BYD, Hudson Lane…"
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
                  className="btn bg-[#D8350F] hover:bg-[#FF5A36] text-white min-h-[52px] sm:min-h-[58px] px-7 rounded-[18px] sm:rounded-[22px] font-bold text-sm sm:text-base shrink-0 w-full sm:w-auto cursor-pointer"
                >
                  Find menus
                </button>
              </form>

              {/* Instant Tap Cravings Strip */}
              <div className="mt-2.5 pt-2 border-t border-[#E7E2DA]/60 px-1 pb-1">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                  <span className="text-[10px] font-extrabold tracking-wider uppercase text-[#78716C] shrink-0 mr-1">
                    Try:
                  </span>
                  {[
                    { label: '🥟 Momos', query: 'Momos' },
                    { label: '🥤 Shakes', query: 'Shake' },
                    { label: '🫓 Chur Chur Naan', query: 'Naan' },
                    { label: '🥘 Dal Makhani', query: 'Dal' },
                    { label: '☕ Cafes', query: 'Cafe' },
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
                      className="text-xs px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-orange-50 hover:text-[#D8350F] text-[#44403C] font-semibold whitespace-nowrap transition-colors shrink-0 cursor-pointer"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Filter Chips */}
            <div className="mt-4 sm:mt-5 flex flex-wrap gap-2 max-w-2xl">
              {[
                'Pure Veg',
                'Rooftop cafes',
                'Student budget · under ₹200',
                'Late night',
                'Wi-Fi & work friendly',
              ].map((pill) => {
                const on = activePills[pill];
                return (
                  <button
                    key={pill}
                    type="button"
                    onClick={() => togglePill(pill)}
                    className={`chip text-xs min-h-[34px] ${on ? 'on' : ''}`}
                  >
                    {on && <span className="w-1.5 h-1.5 rounded-full bg-[#1C1917]"></span>}
                    {pill}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hero Visual: Floating 3D Counter Price Ticket (100% Contained & Responsive) */}
          <div className="flex-1 min-w-0 w-full flex justify-center items-center relative py-4 sm:py-6">
            {/* Ambient Background Circle */}
            <div className="absolute w-[280px] sm:w-[420px] h-[280px] sm:h-[420px] rounded-full bg-[radial-gradient(circle,rgba(255,90,54,0.3),transparent_70%)] pointer-events-none" />

            {/* Ticket Card Container */}
            <div className="relative w-full max-w-[380px] md:rotate-[2deg] hover:rotate-0 transition-transform duration-500">
              {/* Teal 0% Commission Badge */}
              <div className="inline-flex items-center gap-1.5 mb-2.5 sm:mb-0 sm:absolute sm:-left-3 sm:-top-4 z-20 bg-[#0D9488] text-white font-extrabold text-[11px] tracking-wider uppercase px-3.5 py-1.5 rounded-xl shadow-md">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>0% Commission Counter</span>
              </div>

              {/* White Receipt Ticket Box */}
              <div className="bg-white text-[#1C1917] rounded-[26px] sm:rounded-[30px] p-5 sm:p-7 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.7)] border border-stone-200 overflow-hidden">
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <div className="text-[11px] font-extrabold tracking-wider uppercase text-[#78716C]">
                      Counter Price Ticket
                    </div>
                    <h3 className="hd mt-1 text-xl sm:text-2xl font-bold truncate">
                      {heroRestaurant?.name || 'Verified Counter'}
                    </h3>
                    <div className="text-xs font-semibold text-[#78716C] mt-0.5 truncate">
                      {heroRestaurant?.landmark || heroRestaurant?.city || 'Delhi NCR'}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#E6F4F1] text-[#0F766E] text-[11px] font-extrabold shrink-0">
                    ✓ Verified
                  </span>
                </div>

                {/* Contained Perforation Cut-out Divider */}
                <div className="my-4 -mx-5 sm:-mx-7 border-t-2 border-dashed border-[#E7E2DA] relative">
                  <span className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-[#14110F]" />
                  <span className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-[#14110F]" />
                </div>

                {/* Itemized Counter Dishes */}
                <div className="flex flex-col gap-3.5">
                  {heroTicketItems.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start gap-3">
                      <div className="min-w-0">
                        <div className="font-bold text-sm leading-snug truncate">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-[#78716C] mt-0.5 truncate">
                          {item.rest} · <span className="line-through text-stone-400">App ₹{item.app}</span>
                        </div>
                      </div>
                      <div className="hd text-base sm:text-lg font-black text-[#D8350F] shrink-0">
                        ₹{item.price}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Second Perforation Divider */}
                <div className="my-4 -mx-5 sm:-mx-7 border-t-2 border-dashed border-[#E7E2DA] relative">
                  <span className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-[#14110F]" />
                  <span className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-[#14110F]" />
                </div>

                {/* Price Total & Real Savings Breakdown */}
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">
                      Counter Bill Total
                    </span>
                    <div className="text-xs text-[#0F766E] font-bold mt-0.5">
                      You save ₹{heroTicketTotal.savings} vs food apps
                    </div>
                  </div>
                  <span className="hd text-2xl sm:text-3xl font-black text-[#1C1917]">
                    ₹{heroTicketTotal.counterTotal}
                  </span>
                </div>

                {/* Action Button inside Ticket */}
                <button
                  type="button"
                  onClick={() => {
                    if (heroRestaurant?.slug) {
                      navigate(`/${heroRestaurant.slug}`);
                    } else {
                      navigate('/restaurants');
                    }
                  }}
                  className="btn mt-4 w-full bg-[#0F766E] hover:bg-[#0D9488] text-white min-h-[46px] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all rounded-xl"
                >
                  <span>View {heroRestaurant ? heroRestaurant.name.split(' ')[0] : 'verified'} menu & prices</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          2. CONTINUOUS DISH MARQUEE TICKER
      ======================================================== */}
      <section className="bg-[#1C1917] text-white py-4 overflow-hidden border-y border-stone-800">
        <div className="marq flex items-center">
          {marqueeDishes.map((dish, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-3 text-sm sm:text-base font-extrabold tracking-wide uppercase whitespace-nowrap text-stone-300"
            >
              <span className="w-2 h-2 rounded-full bg-[#FF5A36]"></span>
              {dish}
            </span>
          ))}
        </div>
      </section>

      {/* ========================================================
          3. 4 PILLARS OF TRUST
      ======================================================== */}
      <section className="sec pt-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pillars.map((pillar, idx) => (
            <div
              key={idx}
              className="lift bg-white border border-[#EFEAE2] rounded-[28px] p-7 flex flex-col justify-between"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shrink-0"
                style={{ backgroundColor: pillar.bg }}
              >
                {pillar.icon}
              </div>
              <div>
                <h3 className="hd text-xl font-bold text-[#1C1917]">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-sm text-[#57534E] leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          4. LIVING AREA GUIDES (BENTO GRID)
      ======================================================== */}
      <section id="areas" className="sec">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="eyebrow text-[#D8350F]">Living area guides</div>
            <h2 className="h2 mt-3.5">
              Pick a neighbourhood. We plan the whole evening.
            </h2>
          </div>
          <button
            onClick={() => navigate('/iconic-area')}
            className="btn bg-[#1C1917] text-white hover:bg-stone-800"
          >
            All area guides →
          </button>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
          {dynamicAreaGuides.map((area, idx) => (
            <div
              key={idx}
              onClick={() => navigate(`/iconic-area/${area.slug}`)}
              className={`lift ph rounded-[32px] p-8 text-white flex flex-col justify-between cursor-pointer ${area.span}`}
              style={{ background: area.gradient }}
            >
              <div className="flex justify-between items-start gap-4">
                <span className="px-3 py-1 rounded-full bg-black/30 backdrop-blur-md text-xs font-bold text-white uppercase tracking-wider">
                  {area.tag}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white">
                  {area.cost}
                </span>
              </div>

              <div className="mt-10">
                <h3 className="hd text-2xl sm:text-3xl font-extrabold leading-tight">
                  {area.name}
                </h3>
                <p className="mt-2 text-sm sm:text-base text-stone-100 max-w-md line-clamp-2">
                  {area.vibe}
                </p>

                <div className="mt-5 pt-4 border-t border-white/20 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-stone-200">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-300" />
                    {area.metro}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-white underline decoration-white/40">
                    Explore food trail →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          5. ICONIC DISHES & BENCHMARK SPOTLIGHT
      ======================================================== */}
      <section id="dishes" className="sec">
        <div className="max-w-2xl">
          <div className="eyebrow text-[#0F766E]">Iconic dishes</div>
          <h2 className="h2 mt-3.5">
            Search the dish. See who sells it for less.
          </h2>
        </div>

        <div className="mt-12 flex flex-col lg:flex-row gap-6 items-stretch">
          {/* Left Spotlight Big Card */}
          <div className="flex-1 bg-[#1C1917] text-white rounded-[40px] p-8 sm:p-10 relative overflow-hidden flex flex-col justify-between">
            <div
              aria-hidden="true"
              className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(255,90,54,0.4),transparent_70%)] pointer-events-none"
            />
            <div className="relative z-10">
              <div className="flex flex-wrap gap-2.5">
                <span className="px-3.5 py-1 rounded-full bg-[#FF5A36] text-[#1C1917] text-xs font-extrabold uppercase tracking-wide">
                  Dish spotlight
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 text-[#5EEAD4] text-xs font-bold">
                  {currentSpotlight.savings}
                </span>
              </div>

              <h3 className="hd mt-6 text-3xl sm:text-4xl font-extrabold leading-tight">
                {currentSpotlight.name}
              </h3>
              <p className="mt-3 text-base text-stone-300 leading-relaxed max-w-lg">
                {currentSpotlight.desc}
              </p>

              <div className="mt-6 flex items-baseline gap-4">
                <span className="hd text-4xl sm:text-5xl font-black text-white">
                  ₹{currentSpotlight.counterPrice}
                </span>
                <span className="text-sm font-semibold text-stone-400">
                  at {currentSpotlight.restaurant} · {currentSpotlight.area}
                </span>
              </div>

              <div className="mt-2 text-xs text-stone-400">
                Food apps price: <span className="line-through">₹{currentSpotlight.appPrice}</span> + delivery fee + platform fee
              </div>
            </div>

            <div className="mt-8 relative z-10 flex flex-wrap gap-3">
              <button
                onClick={() => navigate(`/search?q=${encodeURIComponent(currentSpotlight.name)}`)}
                className="btn bg-white text-[#1C1917] hover:bg-stone-100 min-h-[48px]"
              >
                Find counters near you
              </button>
              <button
                onClick={() => {
                  if (currentSpotlight.restaurantSlug) {
                    navigate(`/${currentSpotlight.restaurantSlug}`);
                  } else {
                    navigate('/restaurants');
                  }
                }}
                className="btn bg-transparent border border-white/20 text-white hover:bg-white/10 min-h-[48px]"
              >
                View on {currentSpotlight.restaurant} menu →
              </button>
            </div>
          </div>

          {/* Right Selector List */}
          <div className="flex-1 flex flex-col gap-3 justify-center">
            {dynamicSpotlightDishes.map((dish, idx) => {
              const isSelected = selectedSpotlightIndex === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedSpotlightIndex(idx)}
                  className={`lift p-5 sm:p-6 rounded-[28px] border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isSelected
                      ? 'bg-white border-[#1C1917] shadow-md ring-2 ring-[#FF5A36]/30'
                      : 'bg-white border-[#EFEAE2] hover:border-stone-400'
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className="ph w-14 h-14 rounded-2xl shrink-0"
                      style={{ background: dish.gradient }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                        <h4 className="font-bold text-base sm:text-lg text-[#1C1917] truncate">
                          {dish.name}
                        </h4>
                      </div>
                      <p className="text-xs text-[#78716C] mt-0.5 truncate">
                        {dish.restaurant} · {dish.area}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="hd text-xl sm:text-2xl font-extrabold text-[#D8350F]">
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
          6. NEARBY GPS DISCOVERY
      ======================================================== */}
      <section id="nearby" className="sec">
        <div className="bg-[#E6F4F1] border border-[#BCE3DA] rounded-[44px] p-8 sm:p-14 flex flex-col lg:flex-row items-center gap-12 overflow-hidden">
          <div className="flex-1 min-w-0 text-left">
            <div className="eyebrow text-[#0F766E]">Nearby GPS discovery</div>
            <h2 className="h2 mt-3.5 text-3xl sm:text-5xl font-extrabold text-[#1C1917]">
              {detectedAreaContext
                ? `What is good near ${detectedAreaContext.areaName}?`
                : 'What is good, 350 metres from you?'}
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[#44403C] leading-relaxed max-w-lg">
              {detectedAreaContext
                ? `Verified counter cafes and bakeries mapped within walking distance of ${detectedAreaContext.areaName}. Zero commission, direct menu rates.`
                : 'One tap and MenuMap finds counters around you, sorted by real walking distance. No location access? We fall back to Delhi\'s top hubs.'}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleManualLocationClick}
                disabled={locating}
                className="btn bg-[#0F766E] hover:bg-[#0D9488] text-white min-h-[52px]"
              >
                <Crosshair className={`w-4 h-4 ${locating ? 'animate-spin' : ''}`} />
                <span>
                  {locating
                    ? 'Detecting GPS…'
                    : detectedAreaContext
                    ? `Recalibrate GPS (${detectedAreaContext.areaName})`
                    : 'Use my live location'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setLocationModalOpen(true)}
                className="btn bg-white text-[#1C1917] hover:bg-stone-50 min-h-[52px] border border-[#BCE3DA] flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <MapPin className="w-4 h-4 text-[#FF5A36]" />
                <span>Choose Area Manually</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/restaurants?sort=distance')}
                className="btn bg-[#1C1917] text-white hover:bg-black min-h-[52px]"
              >
                Explore radius map
              </button>
            </div>
          </div>

          {/* Radar Visual */}
          <div className="flex-1 w-full max-w-[380px] aspect-square relative flex items-center justify-center">
            {/* Pulsing Concentric Radar Rings */}
            <div className="rg w-[320px] h-[320px]" />
            <div className="rg w-[240px] h-[240px] [animation-delay:1.2s]" />
            <div className="rg w-[160px] h-[160px] [animation-delay:2.4s]" />

            {/* Radar Center Pin */}
            <div className="relative z-10 w-16 h-16 rounded-full bg-[#0F766E] text-white flex items-center justify-center shadow-lg border-4 border-white">
              <MapPin className="w-7 h-7 fill-white" />
            </div>

            {/* Live Dynamic Venue Pins Around Radar */}
            {radarVenues.map((venue) => (
              <button
                key={venue.id}
                type="button"
                onClick={() => navigate(`/${venue.slug}`)}
                className={`absolute ${venue.position} z-10 bg-white px-3.5 py-1.5 rounded-full shadow-md border border-[#E7E2DA] text-xs font-bold text-[#1C1917] flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                <span className="truncate max-w-[120px]">{venue.name}</span>
                <span className="text-[#78716C] font-semibold shrink-0">· {venue.distLabel}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          7. VERIFIED RESTAURANTS GRID
      ======================================================== */}
      <section className="sec">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="eyebrow text-[#D8350F]">
              {detectedAreaContext ? `Verified near ${detectedAreaContext.areaName}` : 'Verified restaurants'}
            </div>
            <h2 className="h2 mt-3.5">
              Menus you can trust before you walk in.
            </h2>
            {detectedAreaContext && (
              <p className="mt-2 text-xs sm:text-sm text-[#78716C] font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-pulse shrink-0"></span>
                <span>Sorted by closest walking and driving distance from {detectedAreaContext.areaName}</span>
              </p>
            )}
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-2">
            {(['All', 'Pure Veg', 'Rooftop', 'Late night'] as const).map((filter) => (
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
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.slice(0, 6).map((restaurant) => {
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

        <div className="mt-12 text-center">
          <button
            onClick={() => navigate('/restaurants')}
            className="btn bg-[#1C1917] text-white hover:bg-stone-800"
          >
            View all {restaurants.length || 50} verified counters in Delhi NCR →
          </button>
        </div>
      </section>

      {/* ========================================================
          8. CURATED 3-STOP FOOD CRAWL
      ======================================================== */}
      <section className="sec">
        <div className="bg-[#14110F] text-white rounded-[44px] p-8 sm:p-14 relative overflow-hidden flex flex-col lg:flex-row gap-12">
          <div
            aria-hidden="true"
            className="absolute -right-28 -top-28 w-96 h-96 rounded-full bg-[radial-gradient(circle,rgba(255,90,54,0.4),transparent_70%)] pointer-events-none"
          />

          <div className="flex-1 min-w-0 relative z-10 text-left">
            <div className="eyebrow text-[#2DD4BF]">3-stop food crawl</div>
            <h2 className="h2 mt-3.5 text-3xl sm:text-5xl font-extrabold text-white">
              One evening. Three counters. 210 metres.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-stone-300 leading-relaxed max-w-lg">
              Time-stamped trails tested on foot. Start at 4:30 PM with hot momos, walk 120m for comforting baked pasta, and end with iconic monster shakes under ₹350 per head.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/iconic-area/' + (dynamicAreaGuides[0]?.slug || 'hudson-lane-north-campus-food-guide'))}
                className="btn bg-[#2DD4BF] text-[#14110F] font-bold hover:bg-teal-300 min-h-[50px]"
              >
                Follow {dynamicAreaGuides[0]?.name ? dynamicAreaGuides[0].name.split('&')[0].trim() : 'Hudson Lane'} trail
              </button>
              <button
                onClick={() => setPlannerModalOpen(true)}
                className="btn bg-white/10 border border-white/20 text-white hover:bg-white/20 min-h-[50px]"
              >
                Plan custom foodie day
              </button>
            </div>
          </div>

          {/* Interactive Trail Timeline */}
          <div className="flex-1 flex flex-col gap-4 relative z-10">
            {crawlStops.map((stop) => (
              <div
                key={stop.stopNumber}
                className="bg-white/5 border border-white/10 rounded-[24px] p-5 sm:p-6 backdrop-blur-md"
              >
                <div className="flex items-center justify-between gap-3 text-xs font-bold text-[#2DD4BF]">
                  <span>{stop.time}</span>
                  <span className="text-stone-400 font-medium">{stop.distanceToNext}</span>
                </div>
                <h4 className="hd mt-2 text-lg sm:text-xl font-bold text-white">
                  {stop.title}
                </h4>
                <div className="mt-1 text-sm font-semibold text-[#FF8A6B]">
                  Dish: {stop.dish}
                </div>
                <div className="mt-1 text-xs text-stone-400">
                  {stop.venue}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          9. ZERO-COMMISSION WHATSAPP ORDERING SHOWCASE
      ======================================================== */}
      <section className="sec">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-1 min-w-0 text-left">
            <div className="eyebrow text-[#0F766E]">Zero-commission ordering</div>
            <h2 className="h2 mt-3.5">
              Diners save. Owners keep 100%.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[#57534E] leading-relaxed max-w-xl">
              Aggregators add a hidden markup to every plate plus delivery surge and platform taxes. MenuMap compiles your cart into a clean WhatsApp order message sent directly to the owner at counter rates.
            </p>

            <div className="mt-8 flex flex-col gap-4">
              {[
                {
                  num: '1',
                  head: 'Pick from the counter menu',
                  sub: 'Tap any dish for photo, spice level, veg status and exact billing price.',
                },
                {
                  num: '2',
                  head: 'Send on WhatsApp',
                  sub: 'Your cart is compiled into a formatted order message with table or takeaway details.',
                },
                {
                  num: '3',
                  head: 'Pay the counter price',
                  sub: 'Zero platform fee, zero commissions, zero surprise bill markups.',
                },
              ].map((step) => (
                <div key={step.num} className="flex gap-4 items-start">
                  <span className="w-9 h-9 rounded-full bg-[#E6F4F1] text-[#0F766E] font-black text-sm flex items-center justify-center shrink-0">
                    {step.num}
                  </span>
                  <div>
                    <h4 className="font-bold text-base text-[#1C1917]">
                      {step.head}
                    </h4>
                    <p className="text-sm text-[#78716C] mt-0.5">
                      {step.sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp Chat Demonstration Box */}
          <div className="flex-1 w-full max-w-md bg-[#ECE5DD] rounded-[36px] p-6 shadow-xl border border-stone-300">
            {/* Header of WhatsApp Chat */}
            <div className="bg-[#075E54] text-white p-4 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                BYD
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm truncate">Big Yellow Door (Hudson Lane)</div>
                <div className="text-[11px] text-emerald-200">Online · Counter Menu Verified</div>
              </div>
            </div>

            {/* Chat Bubble with Order */}
            <div className="mt-5 bg-white rounded-2xl rounded-tr-none p-4 shadow-sm text-xs leading-relaxed text-[#1C1917]">
              <div className="font-bold text-sm text-[#075E54] pb-2 border-b border-stone-200 mb-2">
                🍽️ New Order via MenuMap
              </div>
              <p>Hello! I would like to order at counter rates:</p>
              <div className="mt-2 space-y-1 font-medium">
                <div className="flex justify-between">
                  <span>1x Ferrero Rocher Monster Shake</span>
                  <span className="font-bold">₹219</span>
                </div>
                <div className="flex justify-between">
                  <span>1x Cheesy Peri Peri Fries</span>
                  <span className="font-bold">₹189</span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-dashed border-stone-300 flex justify-between font-extrabold text-sm">
                <span>Total Counter Bill:</span>
                <span className="text-[#D8350F]">₹408</span>
              </div>
              <div className="mt-2 text-[10px] text-stone-500">
                ✓ Dine-in Table / Pickup Takeaway · 0% commission
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-stone-600 justify-center">
              <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
              <span>Direct connection to the restaurant manager</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          10. FOR RESTAURANT OWNERS
      ======================================================== */}
      <section id="owners" className="sec">
        <div className="bg-white border border-[#EFEAE2] rounded-[44px] p-8 sm:p-14 flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-1 min-w-0 text-left">
            <div className="eyebrow text-[#D8350F]">For restaurant owners</div>
            <h2 className="h2 mt-3.5 text-3xl sm:text-5xl font-extrabold">
              Your menu, your prices, your customers.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[#57534E] leading-relaxed max-w-lg">
              Claim your restaurant page, verify with a quick 6-digit SMS OTP, and keep 100% of your earnings with zero platform commissions.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 text-xs sm:text-sm font-bold text-[#1C1917]">
              {[
                '✓ Free listing & zero fees',
                '✓ Fast OTP owner verification',
                '✓ Daily menu & price updates',
                '✓ Real counter QR standee',
                '✓ Direct WhatsApp order log',
                '✓ Full business control',
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/contact')}
                className="btn bg-[#FF5A36] text-white hover:bg-[#D8350F] min-h-[50px]"
              >
                Claim your restaurant free
              </button>
              <button
                onClick={() => navigate('/owner/login')}
                className="btn bg-[#FAF8F5] border border-[#E7E2DA] text-[#1C1917] hover:bg-stone-100 min-h-[50px]"
              >
                Owner portal login
              </button>
            </div>
          </div>

          {/* QR Standee Card Preview */}
          <div className="flex-1 w-full max-w-sm bg-[#FAF8F5] border border-[#E7E2DA] rounded-[36px] p-7 text-center shadow-lg">
            <div className="text-xs font-extrabold tracking-wider uppercase text-[#0F766E]">
              Table QR Standee
            </div>
            <h4 className="hd mt-1 text-2xl font-bold">
              Scan for Counter Menu
            </h4>
            <p className="text-xs text-[#78716C] mt-1">
              Place on billing counter or dining tables
            </p>

            {/* SVG QR Code Simulation */}
            <div className="mt-5 mx-auto w-48 h-48 bg-white p-3 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-center">
              <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
                <rect width="160" height="160" fill="white" />
                {/* QR corners */}
                <rect x="10" y="10" width="40" height="40" rx="6" fill="#1C1917" />
                <rect x="18" y="18" width="24" height="24" rx="4" fill="white" />
                <rect x="24" y="24" width="12" height="12" fill="#1C1917" />

                <rect x="110" y="10" width="40" height="40" rx="6" fill="#1C1917" />
                <rect x="118" y="18" width="24" height="24" rx="4" fill="white" />
                <rect x="124" y="24" width="12" height="12" fill="#1C1917" />

                <rect x="10" y="110" width="40" height="40" rx="6" fill="#1C1917" />
                <rect x="18" y="118" width="24" height="24" rx="4" fill="white" />
                <rect x="24" y="124" width="12" height="12" fill="#1C1917" />

                {/* Simulated QR bits */}
                <circle cx="80" cy="80" r="14" fill="#FF5A36" />
                <rect x="60" y="20" width="8" height="20" fill="#1C1917" />
                <rect x="80" y="20" width="12" height="8" fill="#1C1917" />
                <rect x="20" y="60" width="20" height="8" fill="#1C1917" />
                <rect x="120" y="60" width="16" height="8" fill="#1C1917" />
                <rect x="60" y="120" width="24" height="8" fill="#1C1917" />
                <rect x="100" y="110" width="12" height="18" fill="#1C1917" />
                <rect x="120" y="120" width="16" height="16" fill="#1C1917" />
              </svg>
            </div>

            <div className="mt-4 text-xs font-bold text-stone-600">
              menumaps.online/your-cafe
            </div>
            <div className="mt-1 text-[11px] text-[#0F766E] font-extrabold">
              0% Commission · Instant WhatsApp Cart
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          11. COMMUNITY & VERIFIED REVIEWS
      ======================================================== */}
      <section className="sec">
        <div className="max-w-2xl">
          <div className="eyebrow text-[#0F766E]">Community</div>
          <h2 className="h2 mt-3.5">
            Real diners. Owners reply.
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {communityReviews.map((rev, idx) => (
            <div
              key={idx}
              className="lift bg-white border border-[#EFEAE2] rounded-[30px] p-7 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                <p className="mt-4 text-sm text-[#44403C] leading-relaxed">
                  "{rev.comment}"
                </p>

                <div className="mt-5 flex items-center justify-between text-xs pt-4 border-t border-dashed border-[#E7E2DA]">
                  <div>
                    <div className="font-bold text-[#1C1917]">{rev.diner}</div>
                    <div className="text-[11px] text-[#78716C]">{rev.badge}</div>
                  </div>
                  <span className="text-xs font-semibold text-[#0F766E]">
                    {rev.venue}
                  </span>
                </div>
              </div>

              {/* Owner Reply Quote */}
              <div className="mt-4 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E7E2DA] text-xs">
                <div className="font-bold text-[#0F766E] mb-1">
                  ✓ Owner reply ({rev.replyAuthor}):
                </div>
                <div className="text-stone-600 italic">
                  "{rev.reply}"
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          12. FINAL HIGH-IMPACT CTA BANNER
      ======================================================== */}
      <section className="sec pb-24">
        <div className="bg-gradient-to-r from-[#FF5A36] to-[#C2310F] rounded-[48px] p-10 sm:p-16 text-center text-white relative overflow-hidden shadow-2xl">
          <h2 className="hd text-4xl sm:text-6xl lg:text-7xl font-black max-w-4xl mx-auto leading-[0.96]">
            Your next meal is on the menu.
          </h2>
          <p className="mt-5 text-lg sm:text-xl text-[#FFE9E2] font-medium">
            Real menus. Real prices. No markup.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => navigate('/restaurants')}
              className="btn bg-white text-[#1C1917] hover:bg-stone-100 min-h-[54px] px-8 text-base font-extrabold"
            >
              Explore menus
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="btn bg-[#1C1917] text-white hover:bg-stone-900 min-h-[54px] px-8 text-base font-extrabold"
            >
              List your restaurant free
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Modals (Code-Split & Lazy Loaded) */}
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

      <LocationPickerModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        activeCity={detectedAreaContext?.areaName || 'Delhi NCR'}
      />
    </div>
  );
};
