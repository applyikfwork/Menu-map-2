import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Navigation, 
  Clock, 
  DollarSign, 
  Flame, 
  ArrowRight, 
  Search, 
  ChevronRight,
  Compass,
  UtensilsCrossed,
  CheckCircle2,
  Bookmark,
  Crosshair,
  Utensils,
  ExternalLink,
  MessageCircle,
  Copy,
  Train,
  Share2,
  X,
  ChevronDown,
  ArrowUpRight,
  ShieldCheck,
  Footprints,
  Filter,
  Check,
  Heart,
  Info,
  Calendar,
  Layers
} from 'lucide-react';
import { Collection, AreaGuideMetadata, FamousDishSpotlight, FoodCrawlStop, Restaurant, MenuItem, CollectionItem } from '../types/database';
import { api } from '../lib/supabase';
import { AREA_FOOD_GUIDES } from '../lib/areaGuidesData';
import { isBookmarked, toggleBookmark } from '../lib/bookmarks';
import { 
  getUserLocation, 
  getCachedUserCoordinates, 
  saveCachedUserCoordinates, 
  calculateDistanceKm, 
  formatDistance, 
  GeoCoordinates,
  getNearestAreaGuide
} from '../lib/location';
import { 
  DELHI_LOCATIONS, 
  DELHI_ZONES, 
  DelhiLocation 
} from '../lib/delhiLocationsData';
import { RestaurantCard } from '../components/RestaurantCard';
import { useToast } from '../components/Toast';
import { updatePageSeo, buildAreaGuideSchema } from '../lib/seo';

interface CollectionsListProps {
  navigate: (path: string) => void;
}

interface EnrichedAreaGuide extends Collection {
  distanceKm?: number;
}

export const CollectionsList: React.FC<CollectionsListProps> = ({ navigate }) => {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [guides, setGuides] = useState<Collection[]>([]);
  const [activeGuide, setActiveGuide] = useState<Collection | null>(null);

  // Active Area Cafes & Items
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [collectionItems, setCollectionItems] = useState<CollectionItem[]>([]);
  const [loadingCafes, setLoadingCafes] = useState(false);

  // Live GPS Coordinates (Automatic & Silent)
  const [userCoords, setUserCoords] = useState<GeoCoordinates | null>(() => getCachedUserCoordinates());
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Active Area Filters
  const [cafeFilter, setCafeFilter] = useState<'all' | 'veg' | 'budget' | 'date' | 'open_now'>('all');
  const [cafeSearchQuery, setCafeSearchQuery] = useState('');

  // All Areas Explorer Modal State
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [explorerSearch, setExplorerSearch] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');

  // Spotlight Dish Modal
  const [selectedSpotlightDish, setSelectedSpotlightDish] = useState<{
    dish: FamousDishSpotlight;
    areaName: string;
    areaSlug: string;
  } | null>(null);

  // Share Modal
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Bookmarking
  const [isGuideBookmarked, setIsGuideBookmarked] = useState(false);

  // Ref for smooth scroll to guide
  const guideTopRef = useRef<HTMLDivElement>(null);

  // 1. Initial Load & Automatic Live Location Resolution
  useEffect(() => {
    let isMounted = true;

    async function init() {
      setLoading(true);
      try {
        // Load collections from Supabase with fallback to curated AREA_FOOD_GUIDES
        const data = await api.getCollections(true).catch(() => []);
        const mergedMap = new Map<string, Collection>();

        for (const g of AREA_FOOD_GUIDES) {
          mergedMap.set(g.slug, g);
        }
        for (const item of data) {
          if (mergedMap.has(item.slug)) {
            const base = mergedMap.get(item.slug)!;
            mergedMap.set(item.slug, {
              ...base,
              ...item,
              area_metadata: item.area_metadata || base.area_metadata,
            });
          } else {
            mergedMap.set(item.slug, item);
          }
        }

        const mergedList = Array.from(mergedMap.values());
        if (!isMounted) return;
        setGuides(mergedList);

        // Check if there is an area requested via URL or query
        const urlParams = new URLSearchParams(window.location.search);
        const requestedSlug = urlParams.get('area');

        let targetGuide: Collection | null = null;
        if (requestedSlug) {
          targetGuide = mergedList.find((g) => g.slug === requestedSlug || g.id === requestedSlug) || null;
        }

        // Silent Location Detection if no target slug
        let currentCoords = getCachedUserCoordinates();
        if (!currentCoords && typeof navigator !== 'undefined' && navigator.geolocation) {
          try {
            currentCoords = await getUserLocation();
            if (isMounted) {
              setUserCoords(currentCoords);
              saveCachedUserCoordinates(currentCoords);
            }
          } catch (e) {
            // User denied or timed out; safe fallback
          }
        }

        if (!targetGuide) {
          const nearestResult = getNearestAreaGuide(currentCoords, mergedList);
          targetGuide = nearestResult.guide || mergedList[0] || null;
        }

        if (isMounted && targetGuide) {
          setActiveGuide(targetGuide);
          setIsGuideBookmarked(isBookmarked('collection', targetGuide.id));
          updateAreaSeo(targetGuide);
        }
      } catch (err) {
        console.error('Failed to initialize iconic areas:', err);
        if (isMounted && AREA_FOOD_GUIDES.length > 0) {
          const fallback = AREA_FOOD_GUIDES[0];
          setGuides(AREA_FOOD_GUIDES);
          setActiveGuide(fallback);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    init();

    // Listen to global GPS updates
    const handleLocationUpdate = (e: any) => {
      if (e.detail) {
        setUserCoords(e.detail);
      }
    };
    window.addEventListener('menumap_location_updated', handleLocationUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('menumap_location_updated', handleLocationUpdate);
    };
  }, []);

  // 2. Fetch Cafes whenever activeGuide changes
  useEffect(() => {
    if (!activeGuide) return;

    let isMounted = true;
    setLoadingCafes(true);

    async function loadActiveGuideCafes() {
      try {
        const [items, allRests, allDishes] = await Promise.all([
          api.getCollectionItems(activeGuide!.id).catch(() => []),
          api.getRestaurants(true).catch(() => []),
          api.getMenuItems().catch(() => []),
        ]);

        if (!isMounted) return;
        setCollectionItems(items);
        setRestaurants(allRests);
        setMenuItems(allDishes);
        setIsGuideBookmarked(isBookmarked('collection', activeGuide!.id));
        updateAreaSeo(activeGuide!);
      } catch (e) {
        console.warn('Could not load restaurants for active guide:', e);
      } finally {
        if (isMounted) setLoadingCafes(false);
      }
    }

    loadActiveGuideCafes();

    return () => {
      isMounted = false;
    };
  }, [activeGuide?.id]);

  // Update SEO for Active Area
  const updateAreaSeo = (guide: Collection) => {
    const areaName = guide.area_metadata?.area_name || guide.title;
    const colUrl = `https://menumaps.in/iconic-area/${guide.slug}`;
    const schema = buildAreaGuideSchema({ name: guide.title, description: guide.description }, colUrl);

    updatePageSeo({
      title: `${areaName} Food Guide & Real Menus | MenuMaps Delhi`,
      description: guide.description || `Explore ${areaName}'s verified cafes, signature dishes, metro routes & 3-stop food crawls on MenuMaps.`,
      canonicalUrl: colUrl,
      ogImage: guide.cover_image_url,
      ogType: 'website',
      jsonLd: schema,
    });
  };

  // Re-run live GPS detection on user click
  const handleRecalibrateGps = async () => {
    setIsDetectingLocation(true);
    try {
      const coords = await getUserLocation();
      setUserCoords(coords);
      saveCachedUserCoordinates(coords);
      window.dispatchEvent(new CustomEvent('menumap_location_updated', { detail: coords }));

      // Automatically switch to nearest guide
      if (guides.length > 0) {
        const { guide, distanceKm } = getNearestAreaGuide(coords, guides);
        if (guide) {
          setActiveGuide(guide);
          showToast(`📍 Switched to your nearest area: ${guide.area_metadata?.area_name || guide.title} (${formatDistance(distanceKm || 0)} away)`, 'success');
        }
      }
    } catch (e) {
      showToast('Could not access live GPS. Showing nearest Delhi NCR hub.', 'info');
    } finally {
      setIsDetectingLocation(false);
    }
  };

  // Switch Active Area smoothly
  const handleSelectArea = (guide: Collection) => {
    setActiveGuide(guide);
    setIsExplorerOpen(false);
    setCafeFilter('all');
    setCafeSearchQuery('');
    
    // Update URL smoothly without full reload
    try {
      window.history.pushState(null, '', `/iconic-area/${guide.slug}`);
    } catch (e) {}

    // Scroll to top of guide
    if (guideTopRef.current) {
      guideTopRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Bookmark Toggle
  const handleBookmarkToggle = () => {
    if (!activeGuide) return;
    const next = toggleBookmark('collection', activeGuide.id);
    setIsGuideBookmarked(next);
    showToast(next ? `Saved ${activeGuide.area_metadata?.area_name || activeGuide.title} to bookmarks!` : 'Removed from bookmarks.', 'success');
  };

  // Distance to Active Guide
  const activeGuideDistance = useMemo(() => {
    if (!userCoords || !activeGuide?.area_metadata?.latitude || !activeGuide?.area_metadata?.longitude) {
      return null;
    }
    return calculateDistanceKm(
      userCoords.latitude,
      userCoords.longitude,
      activeGuide.area_metadata.latitude,
      activeGuide.area_metadata.longitude
    );
  }, [userCoords, activeGuide]);

  // All Guides Enriched with Distance (Sorted Closest to User)
  const enrichedGuides: EnrichedAreaGuide[] = useMemo(() => {
    return guides.map((g) => {
      let dist: number | undefined = undefined;
      if (userCoords && g.area_metadata?.latitude && g.area_metadata?.longitude) {
        dist = calculateDistanceKm(
          userCoords.latitude,
          userCoords.longitude,
          g.area_metadata.latitude,
          g.area_metadata.longitude
        );
      }
      return { ...g, distanceKm: dist };
    }).sort((a, b) => {
      if (typeof a.distanceKm === 'number' && typeof b.distanceKm === 'number') {
        return a.distanceKm - b.distanceKm;
      }
      return (a.sort_order || 99) - (b.sort_order || 99);
    });
  }, [guides, userCoords]);

  // Nearby Guide Pills for Horizontal Switcher (Excluding Active Guide)
  const nearbyGuidePills = useMemo(() => {
    return enrichedGuides.filter((g) => g.id !== activeGuide?.id);
  }, [enrichedGuides, activeGuide?.id]);

  // Active Area Metadata
  const meta: AreaGuideMetadata | undefined = activeGuide?.area_metadata;

  // Active Area Famous Dishes
  const famousDishes: FamousDishSpotlight[] = useMemo(() => {
    if (meta?.famous_dishes && meta.famous_dishes.length > 0) {
      return meta.famous_dishes;
    }
    return [];
  }, [meta]);

  // Active Area Food Crawl
  const crawlStops: FoodCrawlStop[] = useMemo(() => {
    if (meta?.food_crawl_stops && meta.food_crawl_stops.length > 0) {
      return meta.food_crawl_stops;
    }
    return [];
  }, [meta]);

  // 1-Click Google Maps Crawl URL
  const googleMapsRouteUrl = useMemo(() => {
    if (!crawlStops || crawlStops.length === 0) {
      const dest = encodeURIComponent(`${meta?.area_name || activeGuide?.title || 'Delhi'} food market`);
      return `https://www.google.com/maps/search/?api=1&query=${dest}`;
    }
    const origin = encodeURIComponent(`${crawlStops[0].venue_name}, ${meta?.area_name || 'Delhi'}`);
    const dest = encodeURIComponent(`${crawlStops[crawlStops.length - 1].venue_name}, ${meta?.area_name || 'Delhi'}`);
    const waypoints = crawlStops.slice(1, -1).map(s => encodeURIComponent(`${s.venue_name}, ${meta?.area_name || 'Delhi'}`)).join('|');

    if (waypoints) {
      return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&waypoints=${waypoints}&travelmode=walking`;
    }
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=walking`;
  }, [crawlStops, meta, activeGuide]);

  // Filtered Cafes for Active Area
  const activeAreaCafes = useMemo(() => {
    if (!activeGuide) return [];

    let list: Restaurant[] = [];
    if (collectionItems.length > 0) {
      const restIds = collectionItems.map((ci) => ci.restaurant_id).filter(Boolean);
      list = restaurants.filter((r) => restIds.includes(r.id));
    }

    if (list.length === 0) {
      const areaKeywords = (meta?.area_name || activeGuide.title)
        .toLowerCase()
        .split(/[\s,&/()]+/);
      list = restaurants.filter((r) => {
        const fullAddr = `${r.name} ${r.landmark || ''} ${r.address_line1 || ''}`.toLowerCase();
        return areaKeywords.some((kw) => kw.length > 3 && fullAddr.includes(kw));
      });
    }

    // Geolocation fallback: closest restaurants to area coordinates
    if (list.length === 0 && meta?.latitude && meta?.longitude) {
      list = [...restaurants].sort((a, b) => {
        const distA = calculateDistanceKm(meta.latitude!, meta.longitude!, a.latitude, a.longitude);
        const distB = calculateDistanceKm(meta.latitude!, meta.longitude!, b.latitude, b.longitude);
        return distA - distB;
      }).slice(0, 12);
    }

    // Apply Live Filters
    return list.filter((r) => {
      // 1. Text Search
      if (cafeSearchQuery.trim()) {
        const q = cafeSearchQuery.toLowerCase();
        const matchesName = r.name.toLowerCase().includes(q);
        const matchesCuisine = (r.cuisine_types || []).some((c) => c.toLowerCase().includes(q));
        const matchesDishes = (r.known_for_dishes || []).some((d) => d.toLowerCase().includes(q));
        if (!matchesName && !matchesCuisine && !matchesDishes) return false;
      }

      // 2. Chip Filters
      if (cafeFilter === 'veg' && !r.dietary_options?.includes('Pure Veg')) return false;
      if (cafeFilter === 'budget' && (r.average_cost_for_two || 0) > 400) return false;
      if (cafeFilter === 'date' && !r.ambience_tags?.some((a) => /date|romantic|aesthetic|cozy|rooftop/i.test(a))) return false;
      if (cafeFilter === 'open_now' && r.is_active === false) return false;

      return true;
    });
  }, [activeGuide, collectionItems, restaurants, cafeSearchQuery, cafeFilter, meta]);

  // Color-coded metro line styling
  const getMetroLineBadgeClass = (line: string) => {
    const l = line.toLowerCase();
    if (l.includes('yellow')) return 'bg-amber-100 text-amber-900 border-amber-300';
    if (l.includes('blue')) return 'bg-sky-100 text-sky-900 border-sky-300';
    if (l.includes('red')) return 'bg-rose-100 text-rose-900 border-rose-300';
    if (l.includes('pink')) return 'bg-pink-100 text-pink-900 border-pink-300';
    if (l.includes('violet')) return 'bg-purple-100 text-purple-900 border-purple-300';
    if (l.includes('magenta')) return 'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-300';
    if (l.includes('airport') || l.includes('orange')) return 'bg-orange-100 text-orange-900 border-orange-300';
    if (l.includes('green')) return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    return 'bg-stone-100 text-stone-700 border-stone-200';
  };

  // Time-of-Day Smart Vibe Recommendation
  const timeOfDayVibe = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) {
      return {
        badge: 'Morning Brews & Bakeries',
        desc: 'Ideal morning coffee, fresh artisan toasts, and peaceful breakfast courtyards.',
      };
    }
    if (hour >= 12 && hour < 16) {
      return {
        badge: 'College Lunches & Budget Bowls',
        desc: 'Vibrant afternoon crowd: budget student platters, cooling iced teas, and quick bites.',
      };
    }
    if (hour >= 16 && hour < 20) {
      return {
        badge: 'Golden Hour Crawl & Rooftops',
        desc: 'Sunset hours: buzzing neon streets, signature milkshakes, and open-air seating.',
      };
    }
    return {
      badge: 'Late-Night Adda & Desserts',
      desc: 'Late-night cravings: hot tandoori momos, warm Belgian waffles, and midnight chai.',
    };
  }, []);

  // Filtered Guides in Explorer Modal
  const modalFilteredGuides = useMemo(() => {
    const q = explorerSearch.toLowerCase().trim();
    return enrichedGuides.filter((g) => {
      const m = g.area_metadata;
      const matchesSearch =
        !q ||
        g.title.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        m?.area_name.toLowerCase().includes(q) ||
        m?.nearest_metro.toLowerCase().includes(q) ||
        m?.famous_dishes?.some((d) => d.name.toLowerCase().includes(q) || d.restaurant_name.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (selectedZone === 'all') return true;
      if (selectedZone === 'north') return m?.zone?.toLowerCase().includes('north') || /hudson|campus|model/i.test(g.title);
      if (selectedZone === 'west') return m?.zone?.toLowerCase().includes('west') || /nangloi|rajouri|punjabi/i.test(g.title);
      if (selectedZone === 'central') return m?.zone?.toLowerCase().includes('central') || /connaught|cp|chandni/i.test(g.title);
      if (selectedZone === 'south') return m?.zone?.toLowerCase().includes('south') || /hauz|gk|defence|cr park/i.test(g.title);
      if (selectedZone === 'ncr') return m?.zone?.toLowerCase().includes('ncr') || /cyber|gurgaon|noida/i.test(g.title);

      return true;
    });
  }, [enrichedGuides, explorerSearch, selectedZone]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#FF5A36] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-stone-600">Detecting your location &amp; loading nearest foodie hub…</p>
      </div>
    );
  }

  if (!activeGuide) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <Compass className="w-12 h-12 text-[#FF5A36] mx-auto mb-3" />
        <h2 className="text-2xl font-black text-stone-900">Iconic Food Guides</h2>
        <p className="text-sm text-stone-600 mt-1">Select an iconic Delhi foodie neighborhood to explore.</p>
        <button
          type="button"
          onClick={() => setActiveGuide(guides[0])}
          className="mt-4 px-6 py-2.5 rounded-full bg-[#1C1917] text-white font-bold text-sm"
        >
          View First Guide
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FAF8F5] text-[#1C1917] min-h-screen pb-24 font-sans" ref={guideTopRef}>

      {/* ========================================================================= */}
      {/* 1. HERO BANNER: ACTIVE AREA AUTO-LOADED WITH LIVE LOCATION CONTEXT */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-linear-to-b from-[#1C1917] via-[#24201E] to-[#1C1917] text-white pt-8 pb-10 sm:pb-12 border-b border-stone-800">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#FF5A36_1px,transparent_1px)] [background-size:18px_18px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          
          {/* Top Pill Row: Location Beacon & Time-of-Day */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-800/90 border border-stone-700/80 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5A36] animate-pulse" />
              {activeGuideDistance !== null ? (
                <span className="text-xs font-bold text-orange-200">
                  📍 Nearest to your location • <strong>{formatDistance(activeGuideDistance)} away</strong>
                </span>
              ) : (
                <span className="text-xs font-bold text-stone-300">
                  📍 Delhi NCR Living Food Guide
                </span>
              )}
              <button
                type="button"
                onClick={handleRecalibrateGps}
                disabled={isDetectingLocation}
                title="Recalibrate GPS"
                className="ml-1 p-1 hover:bg-stone-700 rounded-full text-stone-300 hover:text-white transition-colors cursor-pointer"
              >
                <Crosshair className={`w-3.5 h-3.5 ${isDetectingLocation ? 'animate-spin text-[#FF5A36]' : ''}`} />
              </button>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{timeOfDayVibe.badge}</span>
            </div>
          </div>

          {/* Area Headline & Vibe */}
          <div className="space-y-3 max-w-3xl">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              {activeGuide.title}
            </h1>
            <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
              {meta?.vibe_badge || activeGuide.description}
            </p>
          </div>

          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 pt-2">
            {/* Metro */}
            <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-3 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
                <Train className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Nearest Metro</p>
                <p className="text-xs font-extrabold text-stone-100 truncate">
                  {meta?.nearest_metro?.split('(')[0] || 'Rajiv Chowk'}
                </p>
              </div>
            </div>

            {/* Budget */}
            <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-3 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <DollarSign className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Avg Cost For Two</p>
                <p className="text-xs font-extrabold text-stone-100">
                  ₹{meta?.avg_cost_for_two || 450}
                </p>
              </div>
            </div>

            {/* Cafes Count */}
            <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-3 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Verified Cafes</p>
                <p className="text-xs font-extrabold text-stone-100">
                  {activeAreaCafes.length || 10}+ Listed
                </p>
              </div>
            </div>

            {/* Dishes */}
            <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-3 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                <Flame className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Iconic Dishes</p>
                <p className="text-xs font-extrabold text-stone-100">
                  {famousDishes.length || 5} Must-Tries
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions Row */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Let's explore ${activeGuide.area_metadata?.area_name || activeGuide.title}! Check out the verified food crawl, signature dishes & real menu prices on MenuMaps: ${window.location.origin}/iconic-area/${activeGuide.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all active:scale-95"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-white" />
              <span>Plan with Friends on WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={handleBookmarkToggle}
              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border ${
                isGuideBookmarked
                  ? 'bg-[#FF5A36] text-white border-[#FF5A36]'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isGuideBookmarked ? 'fill-white' : ''}`} />
              <span>{isGuideBookmarked ? 'Saved to Bookmarks' : 'Bookmark Area'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('area-cafes-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Utensils className="w-3.5 h-3.5 text-[#FF5A36]" />
              <span>Jump to Cafes ({activeAreaCafes.length})</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. STICKY QUICK-SWITCHER BAR: EFFORTLESSLY JUMP TO OTHER AREAS */}
      {/* ========================================================================= */}
      <div className="sticky top-14 sm:top-16 z-30 bg-white/95 backdrop-blur-md border-b border-[#E7E2DA] shadow-xs py-2.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
          
          {/* Active Area Pill */}
          <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1C1917] text-white text-xs font-black shadow-xs">
            <MapPin className="w-3.5 h-3.5 text-[#FF5A36]" />
            <span>{meta?.area_name || activeGuide.title.split(' ')[0]}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          </div>

          <span className="text-stone-300 font-bold text-xs shrink-0">|</span>

          {/* Search All Areas Trigger Button */}
          <button
            type="button"
            onClick={() => setIsExplorerOpen(true)}
            className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-orange-50 hover:bg-orange-100 border border-orange-200 text-[#D8350F] text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search All 14+ Areas &amp; 60+ Hubs</span>
            <ChevronDown className="w-3 h-3 ml-0.5" />
          </button>

          {/* Nearby Area Pills Sorted by Distance */}
          {nearbyGuidePills.slice(0, 6).map((guide) => {
            const areaShort = guide.area_metadata?.area_name || guide.title.split('&')[0].trim();
            const dist = (guide as any).distanceKm;
            return (
              <button
                key={guide.id}
                type="button"
                onClick={() => handleSelectArea(guide)}
                className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full bg-white hover:bg-stone-100 border border-[#E7E2DA] text-stone-700 hover:text-stone-900 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                <span>{areaShort}</span>
                {typeof dist === 'number' && (
                  <span className="text-[10px] text-stone-500 font-mono">
                    · {formatDistance(dist)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Sections for Active Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

        {/* ========================================================================= */}
        {/* 3. SECTION 1: LIVE TRANSIT & METRO DIRECTIONS */}
        {/* ========================================================================= */}
        {meta?.nearest_metro && (
          <section className="bg-white rounded-3xl border border-[#E7E2DA] p-5 sm:p-7 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <Train className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-stone-900">
                    Delhi Metro &amp; Transit Guide
                  </h3>
                  <p className="text-xs text-stone-500">
                    Recommended station exits, walking times &amp; parking realities
                  </p>
                </div>
              </div>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${meta.nearest_metro}, ${meta.area_name || 'Delhi'}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
              >
                <Navigation className="w-3.5 h-3.5 fill-white" />
                <span>Open Directions in Google Maps</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wide flex items-center gap-1">
                  <Train className="w-3.5 h-3.5 text-sky-600" />
                  <span>Metro Route &amp; Exit Gate</span>
                </span>
                <p className="text-sm font-bold text-stone-900 leading-snug">
                  {meta.nearest_metro}
                </p>
                <p className="text-xs text-stone-600">
                  Fastest commute to {meta.area_name}. Avoid Delhi traffic and take the exit gate indicated above.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wide flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-amber-600" />
                  <span>Parking &amp; Cab Reality</span>
                </span>
                <p className="text-sm font-bold text-stone-900 leading-snug">
                  {meta.parking_tips || 'Designated market or multilevel metro parking recommended during peak hours.'}
                </p>
                <p className="text-xs text-stone-600">
                  Peak evening rush: {meta.best_time_to_visit?.split('(')[0] || '4:00 PM – 9:00 PM'}.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 4. SECTION 2: FAMOUS LANDMARK DISHES OF THIS AREA */}
        {/* ========================================================================= */}
        {famousDishes.length > 0 && (
          <section className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF5A36] uppercase tracking-wider mb-1">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Local Signature Specialties</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                  Must-Try Dishes of {meta?.area_name || activeGuide.title.split(' ')[0]}
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                  Voted by locals: the dishes you cannot leave this neighborhood without tasting.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {famousDishes.map((dish, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedSpotlightDish({
                    dish,
                    areaName: meta?.area_name || activeGuide.title,
                    areaSlug: activeGuide.slug,
                  })}
                  className="group bg-white rounded-2xl border border-[#E7E2DA] p-3.5 flex gap-3.5 cursor-pointer hover:border-[#FF5A36] hover:shadow-md transition-all text-left"
                >
                  <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-stone-100 relative">
                    <img
                      src={dish.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'}
                      alt={dish.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute top-1.5 left-1.5">
                      <span className={`w-3.5 h-3.5 rounded-full border border-white flex items-center justify-center ${dish.is_veg ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-black text-sm text-stone-900 group-hover:text-[#FF5A36] transition-colors line-clamp-1">
                          {dish.name}
                        </h4>
                        <span className="font-mono font-black text-sm text-[#FF5A36] shrink-0">
                          ₹{dish.price}
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-stone-600 truncate mt-0.5">
                        at {dish.restaurant_name}
                      </p>
                      <p className="text-[11px] text-stone-500 line-clamp-2 mt-1 leading-snug">
                        {dish.why_famous}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center text-[11px] font-bold text-[#FF5A36]">
                      <span>View Story &amp; Details</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 5. SECTION 3: TESTED 3-STOP FOOD CRAWL TIMELINE */}
        {/* ========================================================================= */}
        {crawlStops.length > 0 && (
          <section className="bg-gradient-to-br from-stone-900 via-stone-900 to-[#2A2320] text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF5A36] uppercase tracking-wider mb-1">
                  <Footprints className="w-3.5 h-3.5" />
                  <span>Tested Evening Walking Trail</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  3-Stop Food Crawl in {meta?.area_name || activeGuide.title.split(' ')[0]}
                </h2>
                <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-xl">
                  Follow this exact tested walking route: starters to comfort mains to famous monster shakes without getting stuck in traffic.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={googleMapsRouteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-[#FF5A36] hover:bg-[#e04826] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all active:scale-95"
                >
                  <Navigation className="w-3.5 h-3.5 fill-white" />
                  <span>Start Walking Route in Google Maps</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {crawlStops.map((stop, i) => (
                <div
                  key={i}
                  className="bg-stone-800/90 border border-stone-700/80 rounded-2xl p-5 space-y-3 flex flex-col justify-between relative"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-[#FF5A36]/20 text-[#FF5A36] font-mono font-black text-xs">
                        Stop {stop.stop_number || i + 1}
                      </span>
                      <span className="text-xs font-bold text-stone-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-stone-400" />
                        <span>{stop.time}</span>
                      </span>
                    </div>

                    <h4 className="text-base font-extrabold text-white">
                      {stop.venue_name}
                    </h4>

                    <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wide block">
                        Must-Order
                      </span>
                      <p className="text-xs font-bold text-orange-200 mt-0.5">
                        {stop.recommended_dish}
                      </p>
                    </div>

                    {stop.note && (
                      <p className="text-xs text-stone-400 leading-relaxed">
                        {stop.note}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-stone-700/60 flex items-center justify-between text-[11px] text-stone-400">
                    <span className="flex items-center gap-1">
                      <Footprints className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{stop.distance_to_next}</span>
                    </span>
                    <span className="font-bold text-stone-300">
                      {stop.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 6. SECTION 4: CURATED VERIFIED CAFES IN THIS AREA */}
        {/* ========================================================================= */}
        <section id="area-cafes-section" className="space-y-6 pt-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF5A36] uppercase tracking-wider mb-1">
                <Utensils className="w-3.5 h-3.5" />
                <span>Verified Dining Directory</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                Cafes &amp; Restaurants in {meta?.area_name || activeGuide.title.split(' ')[0]}
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                Authentic dine-in menus, 0% app markups &amp; direct WhatsApp table orders.
              </p>
            </div>

            {/* In-Area Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={`Search cafes or dishes in ${meta?.area_name || 'area'}…`}
                value={cafeSearchQuery}
                onChange={(e) => setCafeSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-[#E7E2DA] rounded-xl text-xs font-medium focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/20 outline-hidden shadow-2xs"
              />
            </div>
          </div>

          {/* Quick Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: 'all', label: `All Cafes (${activeAreaCafes.length})` },
              { id: 'veg', label: '🥗 Pure Veg Only' },
              { id: 'budget', label: '💰 Budget (Under ₹400 for Two)' },
              { id: 'date', label: '✨ Aesthetic & Date Spots' },
              { id: 'open_now', label: '🟢 Open & Serving' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setCafeFilter(f.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  cafeFilter === f.id
                    ? 'bg-[#1C1917] text-white shadow-xs'
                    : 'bg-white hover:bg-stone-100 text-stone-700 border border-[#E7E2DA]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Cafes Grid */}
          {loadingCafes ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-3 border-[#FF5A36] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-stone-500 font-bold">Loading verified venues…</p>
            </div>
          ) : activeAreaCafes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeAreaCafes.map((rest) => {
                const dist = userCoords && rest.latitude && rest.longitude
                  ? calculateDistanceKm(userCoords.latitude, userCoords.longitude, rest.latitude, rest.longitude)
                  : undefined;
                return (
                  <RestaurantCard
                    key={rest.id}
                    restaurant={rest}
                    navigate={navigate}
                    userDistanceKm={dist}
                  />
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E7E2DA] p-10 text-center space-y-3">
              <Utensils className="w-8 h-8 text-stone-400 mx-auto" />
              <h4 className="text-base font-bold text-stone-800">
                No cafes match "{cafeSearchQuery || cafeFilter}"
              </h4>
              <p className="text-xs text-stone-500">
                Try resetting your filters or search query to see all venues.
              </p>
              <button
                type="button"
                onClick={() => {
                  setCafeFilter('all');
                  setCafeSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold"
              >
                Reset Filters
              </button>
            </div>
          )}
        </section>

      </div>

      {/* ========================================================================= */}
      {/* 7. ALL AREAS & HUBS EXPLORER MODAL / DRAWER */}
      {/* ========================================================================= */}
      {isExplorerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-left border border-[#E7E2DA]">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-[#E7E2DA] flex items-center justify-between shrink-0 bg-stone-50">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#FF5A36] text-white flex items-center justify-center shadow-xs">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-stone-900">
                    Explore All Iconic Food Areas &amp; Hubs
                  </h3>
                  <p className="text-xs text-stone-500">
                    Sorted by live GPS distance from where you stand
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsExplorerOpen(false)}
                className="p-2 rounded-full hover:bg-stone-200 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search & Zone Filter Bar */}
            <div className="p-4 border-b border-[#E7E2DA] space-y-3 bg-white shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by area name, metro station, landmark dish (e.g. Hudson Lane, CP, Momos)…"
                  value={explorerSearch}
                  onChange={(e) => setExplorerSearch(e.target.value)}
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/20 outline-hidden shadow-2xs"
                />
              </div>

              {/* Zone Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {[
                  { id: 'all', label: 'All Delhi NCR' },
                  { id: 'north', label: 'North Campus & Model Town' },
                  { id: 'central', label: 'Central Delhi & CP' },
                  { id: 'south', label: 'South Delhi & HKV' },
                  { id: 'west', label: 'West Delhi & Nangloi' },
                  { id: 'ncr', label: 'Cyber Hub & NCR' },
                ].map((z) => (
                  <button
                    key={z.id}
                    type="button"
                    onClick={() => setSelectedZone(z.id)}
                    className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                      selectedZone === z.id
                        ? 'bg-[#FF5A36] text-white shadow-2xs'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                  >
                    {z.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Cards Grid (Scrollable) */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {modalFilteredGuides.map((guide) => {
                  const isActive = guide.id === activeGuide.id;
                  const dist = (guide as any).distanceKm;
                  const m = guide.area_metadata;

                  return (
                    <div
                      key={guide.id}
                      onClick={() => handleSelectArea(guide)}
                      className={`group rounded-2xl border p-3 flex flex-col justify-between cursor-pointer transition-all ${
                        isActive
                          ? 'border-[#FF5A36] bg-orange-50/60 ring-2 ring-[#FF5A36]/30 shadow-md'
                          : 'border-[#E7E2DA] bg-white hover:border-stone-400 hover:shadow-md'
                      }`}
                    >
                      <div className="space-y-2">
                        {/* Cover image & distance badge */}
                        <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-stone-100">
                          <img
                            src={guide.cover_image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80'}
                            alt={guide.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold">
                            <MapPin className="w-2.5 h-2.5 text-[#FF5A36]" />
                            <span>{typeof dist === 'number' ? `${formatDistance(dist)} away` : 'Delhi NCR'}</span>
                          </div>
                          {isActive && (
                            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#FF5A36] text-white text-[10px] font-black shadow-xs">
                              Active
                            </div>
                          )}
                        </div>

                        {/* Title & Metro */}
                        <div>
                          <h4 className="font-black text-sm text-stone-900 group-hover:text-[#FF5A36] transition-colors line-clamp-1">
                            {m?.area_name || guide.title}
                          </h4>
                          <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5 leading-snug">
                            {m?.vibe_badge || guide.description}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 mt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                        <span className="font-bold text-stone-600 flex items-center gap-1">
                          <Train className="w-3 h-3 text-sky-600" />
                          <span className="truncate max-w-[120px]">{m?.nearest_metro?.split('(')[0] || 'Metro'}</span>
                        </span>
                        <span className="font-bold text-[#FF5A36] flex items-center gap-0.5">
                          <span>Open Guide</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {modalFilteredGuides.length === 0 && (
                <div className="text-center py-12 space-y-2">
                  <Compass className="w-8 h-8 text-stone-400 mx-auto" />
                  <p className="text-sm font-bold text-stone-800">No area guides match "{explorerSearch}"</p>
                  <p className="text-xs text-stone-500">Try searching for Connaught Place, Hudson Lane, Hauz Khas, or Nangloi.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. DISH SPOTLIGHT MODAL */}
      {/* ========================================================================= */}
      {selectedSpotlightDish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl text-left border border-[#E7E2DA]">
            <div className="relative aspect-[16/10] bg-stone-100">
              <img
                src={selectedSpotlightDish.dish.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80'}
                alt={selectedSpotlightDish.dish.name}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setSelectedSpotlightDish(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-xs text-white text-xs font-bold">
                📍 {selectedSpotlightDish.areaName}
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-black text-stone-900">
                    {selectedSpotlightDish.dish.name}
                  </h3>
                  <p className="text-xs font-bold text-stone-600 mt-0.5">
                    Served fresh at <strong>{selectedSpotlightDish.dish.restaurant_name}</strong>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xl font-mono font-black text-[#FF5A36]">
                    ₹{selectedSpotlightDish.dish.price}
                  </span>
                  <span className="block text-[10px] text-stone-500 font-bold">Counter Price</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-orange-50/70 border border-orange-200/80">
                <span className="text-[10px] font-bold text-[#FF5A36] uppercase tracking-wide block">
                  Why It's Famous
                </span>
                <p className="text-xs text-stone-700 mt-1 leading-relaxed">
                  {selectedSpotlightDish.dish.why_famous}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this famous ${selectedSpotlightDish.dish.name} at ${selectedSpotlightDish.dish.restaurant_name} in ${selectedSpotlightDish.areaName} for ₹${selectedSpotlightDish.dish.price} on MenuMaps: ${window.location.origin}/iconic-area/${selectedSpotlightDish.areaSlug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Share on WhatsApp</span>
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedSpotlightDish(null)}
                  className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
