import React, { useState, useEffect, useMemo } from 'react';
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
  Layers,
  CheckCircle2,
  Bookmark,
  Crosshair,
  ArrowUpDown,
  Utensils,
  ExternalLink,
  MessageCircle,
  Copy
} from 'lucide-react';
import { Collection, AreaGuideMetadata, FamousDishSpotlight } from '../types/database';
import { api } from '../lib/supabase';
import { AREA_FOOD_GUIDES } from '../lib/areaGuidesData';
import { isBookmarked, toggleBookmark } from '../lib/bookmarks';
import { 
  getUserLocation, 
  getCachedUserCoordinates, 
  saveCachedUserCoordinates, 
  calculateDistanceKm, 
  formatDistance, 
  GeoCoordinates 
} from '../lib/location';
import { useToast } from '../components/Toast';

interface CollectionsListProps {
  navigate: (path: string) => void;
}

interface EnrichedAreaGuide extends Collection {
  distanceKm?: number;
}

export const CollectionsList: React.FC<CollectionsListProps> = ({ navigate }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');
  const [selectedCraving, setSelectedCraving] = useState<string | null>(null);
  const [savedGuideIds, setSavedGuideIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'areas' | 'famous_dishes'>('areas');

  // Automatic Live GPS State (no manual location input required!)
  const [userCoords, setUserCoords] = useState<GeoCoordinates | null>(() => getCachedUserCoordinates());
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [sortByDistance, setSortByDistance] = useState(true);

  // Selected Dish for Spotlight Modal
  const [selectedSpotlightDish, setSelectedSpotlightDish] = useState<{
    dish: FamousDishSpotlight;
    areaName: string;
    areaSlug: string;
    distanceKm?: number;
  } | null>(null);

  // Auto-detect live GPS location systematically on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = 'Iconic Area Food Guides & What’s Famous - MenuMap Delhi NCR';

    // 1. Check cached or silent background detect
    const cached = getCachedUserCoordinates();
    if (cached) {
      setUserCoords(cached);
    } else {
      // Automatic silent live GPS check
      getUserLocation()
        .then((coords) => {
          setUserCoords(coords);
          saveCachedUserCoordinates(coords);
        })
        .catch(() => {
          // Geolocation silently fallback
        });
    }

    // 2. Listen to live GPS location updates from Navbar or anywhere in the app
    const handleLocationUpdate = (e: any) => {
      if (e.detail) {
        setUserCoords(e.detail);
      }
    };
    window.addEventListener('menumap_location_updated', handleLocationUpdate);

    loadGuides();

    return () => {
      window.removeEventListener('menumap_location_updated', handleLocationUpdate);
    };
  }, []);

  const loadGuides = async () => {
    setLoading(true);
    try {
      const data = await api.getCollections(true);
      const mergedMap = new Map<string, Collection>();

      // Seed with AREA_FOOD_GUIDES
      for (const guide of AREA_FOOD_GUIDES) {
        mergedMap.set(guide.slug, guide);
      }

      // Overlay database collections
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
      setCollections(mergedList);

      // Load restaurant counts
      const countMap: Record<string, number> = {};
      for (const col of mergedList) {
        try {
          const items = await api.getCollectionItems(col.id);
          countMap[col.id] = items.length;
        } catch (e) {
          countMap[col.id] = 4;
        }
      }
      setCounts(countMap);
    } catch (e) {
      console.error('Error loading collections:', e);
      setCollections(AREA_FOOD_GUIDES);
    } finally {
      setLoading(false);
    }
  };

  const handleManualLiveGpsTrigger = async () => {
    setIsDetectingLocation(true);
    try {
      const coords = await getUserLocation();
      setUserCoords(coords);
      saveCachedUserCoordinates(coords);
      window.dispatchEvent(new CustomEvent('menumap_location_updated', { detail: coords }));
      showToast('Live GPS updated! Closest iconic food areas reordered automatically.', 'success');
    } catch (e) {
      showToast('Could not access live GPS. Showing all iconic Delhi NCR areas.', 'info');
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleBookmark = (e: React.MouseEvent, colId: string) => {
    e.stopPropagation();
    const next = toggleBookmark('collection', colId);
    setSavedGuideIds((prev) => 
      next ? [...prev, colId] : prev.filter((id) => id !== colId)
    );
    showToast(next ? 'Saved iconic area guide to bookmarks!' : 'Removed from bookmarks.', 'success');
  };

  // Enrich collections with distance from user's live GPS
  const enrichedGuides: EnrichedAreaGuide[] = useMemo(() => {
    return collections.map((col) => {
      const meta = col.area_metadata;
      let dist: number | undefined = undefined;

      if (userCoords && meta?.latitude && meta?.longitude) {
        dist = calculateDistanceKm(
          userCoords.latitude,
          userCoords.longitude,
          meta.latitude,
          meta.longitude
        );
      }
      return { ...col, distanceKm: dist };
    });
  }, [collections, userCoords]);

  // Identify the closest iconic neighborhood to user's live GPS
  const nearestGuide = useMemo(() => {
    if (!userCoords) return null;
    const sorted = [...enrichedGuides].filter((g) => typeof g.distanceKm === 'number');
    if (sorted.length === 0) return null;
    sorted.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
    return sorted[0];
  }, [enrichedGuides, userCoords]);

  // Filter and sort guides
  const filteredGuides = useMemo(() => {
    let result = enrichedGuides.filter((c) => {
      const meta = c.area_metadata;
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch = 
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        meta?.area_name.toLowerCase().includes(q) ||
        meta?.vibe_badge.toLowerCase().includes(q) ||
        meta?.nearest_metro.toLowerCase().includes(q) ||
        meta?.famous_dishes?.some((d) => 
          d.name.toLowerCase().includes(q) || 
          d.why_famous.toLowerCase().includes(q) ||
          d.restaurant_name.toLowerCase().includes(q)
        );

      if (!matchesSearch) return false;

      if (selectedZone === 'all') return true;
      if (selectedZone === 'north') return meta?.zone?.toLowerCase().includes('north') || /hudson|campus/i.test(c.title);
      if (selectedZone === 'west') return meta?.zone?.toLowerCase().includes('west') || /nangloi|rajouri/i.test(c.title);
      if (selectedZone === 'central') return meta?.zone?.toLowerCase().includes('central') || /connaught|cp|old delhi|chandni/i.test(c.title);
      if (selectedZone === 'south') return meta?.zone?.toLowerCase().includes('south') || /hauz khas|south/i.test(c.title);

      return true;
    });

    if (sortByDistance && userCoords) {
      result = [...result].sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
    } else {
      result = [...result].sort((a, b) => (a.sort_order || 99) - (b.sort_order || 99));
    }

    return result;
  }, [enrichedGuides, searchQuery, selectedZone, sortByDistance, userCoords]);

  // Flatten all famous dishes across all iconic areas for direct search
  const allFamousDishes = useMemo(() => {
    const list: Array<{
      dish: FamousDishSpotlight;
      areaName: string;
      areaSlug: string;
      zone?: string;
      distanceKm?: number;
    }> = [];

    for (const guide of enrichedGuides) {
      const meta = guide.area_metadata;
      if (meta?.famous_dishes) {
        for (const dish of meta.famous_dishes) {
          list.push({
            dish,
            areaName: meta.area_name,
            areaSlug: guide.slug,
            zone: meta.zone,
            distanceKm: guide.distanceKm,
          });
        }
      }
    }
    return list;
  }, [enrichedGuides]);

  // Filter famous dishes for the "Search What's Famous" view
  const filteredFamousDishes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const craving = selectedCraving?.toLowerCase() || '';

    return allFamousDishes.filter(({ dish, areaName, zone }) => {
      const matchesText = 
        !q ||
        dish.name.toLowerCase().includes(q) ||
        dish.why_famous.toLowerCase().includes(q) ||
        dish.restaurant_name.toLowerCase().includes(q) ||
        areaName.toLowerCase().includes(q) ||
        (zone && zone.toLowerCase().includes(q));

      if (!matchesText) return false;

      if (!craving) return true;
      if (craving === 'shakes') return /shake|beverage|cold|coffee|waffle/i.test(dish.name + ' ' + dish.why_famous);
      if (craving === 'momos') return /momo|dumpling|starter|kurkure/i.test(dish.name + ' ' + dish.why_famous);
      if (craving === 'naan') return /naan|kulcha|chole|thali|paratha/i.test(dish.name + ' ' + dish.why_famous);
      if (craving === 'dal') return /dal|makhani|bukhara|paneer|gravy/i.test(dish.name + ' ' + dish.why_famous);
      if (craving === 'jalebi') return /jalebi|rabri|sweet|dessert|gulab/i.test(dish.name + ' ' + dish.why_famous);
      if (craving === 'chaap') return /chaap|soya|tandoori|afghani|kebab/i.test(dish.name + ' ' + dish.why_famous);
      if (craving === 'nonveg') return !dish.is_veg || /mutton|chicken|rogan/i.test(dish.name);

      return true;
    });
  }, [allFamousDishes, searchQuery, selectedCraving]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* ========================================================================= */}
      {/* 1. AUTOMATIC LIVE GPS STATUS & HERO HEADER */}
      {/* ========================================================================= */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        
        {/* Navigation Breadcrumb / Tagline */}
        <div className="eyebrow text-[#D8350F]">
          Living Area Guides
        </div>

        <h1 className="hd text-4xl sm:text-6xl font-black text-[#1C1917] tracking-tight leading-tight">
          Iconic foodie neighbourhoods &amp; trails
        </h1>

        <p className="text-base sm:text-lg text-[#57534E] leading-relaxed font-normal max-w-2xl mx-auto">
          Pick a neighbourhood. We plan the whole evening. Real counter menus, verified prices, landmark signature dishes and walking trails.
        </p>

        {/* ========================================================================= */}
        {/* LIVE GPS DETECTION BANNER (100% AUTOMATIC) */}
        {/* ========================================================================= */}
        <div className="pt-2">
          {nearestGuide && typeof nearestGuide.distanceKm === 'number' ? (
            <div className="bg-white border border-[#EFEAE2] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#E6F4F1] text-[#0F766E] flex items-center justify-center shrink-0 shadow-xs">
                  <MapPin className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#0F766E] bg-[#E6F4F1] px-2 py-0.5 rounded-md">
                      Live GPS Nearest
                    </span>
                    <span className="text-xs font-bold text-[#57534E]">
                      {formatDistance(nearestGuide.distanceKm)} from your location
                    </span>
                  </div>
                  <h3 className="hd font-bold text-base sm:text-lg text-[#14110F]">
                    Closest Food District: <span className="text-[#D8350F]">{nearestGuide.area_metadata?.area_name || nearestGuide.title}</span>
                  </h3>
                  <p className="text-xs text-[#57534E] line-clamp-1 italic">
                    "{nearestGuide.area_metadata?.vibe_badge}"
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => navigate(`/iconic-area/${nearestGuide.slug}`)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0D9488] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer whitespace-nowrap"
                >
                  <span>Explore Guide</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleManualLiveGpsTrigger}
                  disabled={isDetectingLocation}
                  title="Refresh live GPS"
                  className="p-2.5 rounded-xl bg-[#FAF8F5] hover:bg-stone-100 border border-[#E7E2DA] text-[#57534E] transition-colors cursor-pointer"
                >
                  <Crosshair className={`w-4 h-4 ${isDetectingLocation ? 'animate-spin text-[#FF5A36]' : ''}`} />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-3 sm:p-4 flex items-center justify-between text-xs text-[#57534E] border border-[#EFEAE2]">
              <div className="flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-[#FF5A36] shrink-0" />
                <span>Automatic live GPS is detecting your nearest Delhi NCR food district...</span>
              </div>
              <button
                onClick={handleManualLiveGpsTrigger}
                className="text-[#D8350F] font-bold hover:underline cursor-pointer shrink-0"
              >
                Detect Now
              </button>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* VIEW MODE SWITCHER & SEARCH ENGINE */}
        {/* ========================================================================= */}
        <div className="space-y-4 pt-2">
          
          {/* Main Search Input */}
          <div className="relative max-w-xl mx-auto">
            <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search what's famous (e.g. Monster Shake, Chur Chur Naan, Dal Bukhara)..."
              className="w-full pl-11 pr-20 py-3.5 bg-white border border-[#E7E2DA] rounded-2xl text-xs sm:text-sm font-medium text-[#14110F] shadow-xs focus:outline-hidden focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Craving Filters (Horizontal swipe on mobile) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 max-w-3xl mx-auto">
            <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider shrink-0 mr-1">
              Famous:
            </span>
            {[
              { id: null, label: 'All Specialties' },
              { id: 'shakes', label: '🥤 Monster Shakes' },
              { id: 'naan', label: '🫓 Amritsari Naan' },
              { id: 'dal', label: '🥘 Dal Bukhara' },
              { id: 'momos', label: '🥟 Kurkure Momos' },
              { id: 'jalebi', label: '🍯 Desi Ghee Jalebi' },
              { id: 'chaap', label: '🍢 Tandoori Chaap' },
              { id: 'nonveg', label: '🍖 Heritage Mutton' },
            ].map((chip) => (
              <button
                key={chip.label}
                onClick={() => {
                  setSelectedCraving(chip.id);
                  if (chip.id) setActiveTab('famous_dishes');
                }}
                className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  selectedCraving === chip.id
                    ? 'bg-[#FF5A36] text-white shadow-xs'
                    : 'bg-white hover:bg-stone-100 text-[#44403C] border border-[#E7E2DA]'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Toggle between "Neighborhood Guides" and "Famous Foods" */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <div className="bg-[#F5F1EB] p-1 rounded-2xl border border-[#E7E2DA] inline-flex">
              <button
                onClick={() => setActiveTab('areas')}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'areas'
                    ? 'bg-white text-[#14110F] shadow-xs'
                    : 'text-[#57534E] hover:text-[#14110F]'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-[#FF5A36]" />
                <span>Neighborhoods ({filteredGuides.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('famous_dishes')}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'famous_dishes'
                    ? 'bg-white text-[#14110F] shadow-xs'
                    : 'text-[#57534E] hover:text-[#14110F]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D8350F]" />
                <span>Famous Dishes ({filteredFamousDishes.length})</span>
              </button>
            </div>

            {/* Live GPS Sorting Toggle */}
            {userCoords && activeTab === 'areas' && (
              <button
                onClick={() => setSortByDistance(!sortByDistance)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                  sortByDistance
                    ? 'bg-[#E6F4F1] text-[#0F766E] border-[#2DD4BF]/40'
                    : 'bg-white text-[#57534E] border-[#E7E2DA] hover:bg-stone-50'
                }`}
                title="Toggle Live GPS distance sorting"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-[#0F766E]" />
                <span>{sortByDistance ? 'GPS Distance Sort' : 'Default Order'}</span>
              </button>
            )}
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. TAB A: ICONIC NEIGHBORHOODS DIRECTORY (WITH LIVE GPS DISTANCES) */}
      {/* ========================================================================= */}
      {activeTab === 'areas' && (
        <div className="space-y-6">
          
          {/* Delhi Zones Quick Filter Pills (Horizontal swipe on mobile) */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#E7E2DA] pb-4">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto py-1">
              {[
                { id: 'all', label: 'All Delhi NCR' },
                { id: 'north', label: 'North Campus' },
                { id: 'west', label: 'West Delhi' },
                { id: 'central', label: 'Central & CP' },
                { id: 'south', label: 'South Delhi' },
              ].map((zone) => (
                <button
                  key={zone.id}
                  onClick={() => setSelectedZone(zone.id)}
                  className={`chipl text-xs min-h-[36px] px-3.5 font-bold shrink-0 ${
                    selectedZone === zone.id ? 'on' : ''
                  }`}
                >
                  {zone.label}
                </button>
              ))}
            </div>

            {userCoords && (
              <span className="text-xs font-bold text-[#0F766E] flex items-center gap-1.5 shrink-0">
                <span className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-pulse" />
                <span>Live GPS Active</span>
              </span>
            )}
          </div>


          {/* Grid of Iconic Area Guides */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-96 bg-stone-200 rounded-[28px]" />
              ))}
            </div>
          ) : filteredGuides.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGuides.map((col) => {
                const meta = col.area_metadata;
                const isSaved = isBookmarked('collection', col.id) || savedGuideIds.includes(col.id);

                return (
                  <div
                    key={col.id}
                    onClick={() => navigate(`/iconic-area/${col.slug}`)}
                    className="lift bg-white rounded-[28px] overflow-hidden border border-[#EFEAE2] flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      {/* Image Banner */}
                      <div className="relative aspect-[16/10] bg-stone-900 overflow-hidden">
                        <img
                          src={col.cover_image_url}
                          alt={col.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10" />

                        {/* Top Badges */}
                        <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/20 shadow-xs">
                              {meta?.zone || 'Delhi NCR'}
                            </span>
                            {typeof col.distanceKm === 'number' && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/90 text-white shadow-xs backdrop-blur-xs flex items-center gap-1">
                                <span>📍 {formatDistance(col.distanceKm)}</span>
                              </span>
                            )}
                          </div>

                          <button
                            onClick={(e) => handleBookmark(e, col.id)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-90 ${
                              isSaved
                                ? 'bg-rose-500 text-white shadow-md'
                                : 'bg-black/40 hover:bg-black/60 text-white backdrop-blur-xs'
                            }`}
                            title="Save guide"
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
                          </button>
                        </div>

                        {/* Vibe Badge */}
                        {meta?.vibe_badge && (
                          <div className="absolute bottom-3 inset-x-3">
                            <span className="inline-block px-2.5 py-1 rounded-xl bg-orange-500/90 backdrop-blur-xs text-[11px] font-bold text-white shadow-xs line-clamp-1">
                              🔥 {meta.vibe_badge}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content Body */}
                      <div className="p-5 space-y-3">
                        <div>
                          <h3 className="hd text-lg sm:text-xl font-bold text-[#14110F] group-hover:text-[#FF5A36] transition-colors">
                            {col.title}
                          </h3>
                          <p className="text-xs text-[#57534E] line-clamp-2 leading-relaxed mt-1">
                            {col.description}
                          </p>
                        </div>

                        {/* Famous Dishes Spotlight pills */}
                        {meta?.famous_dishes && meta.famous_dishes.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">
                              Famous In This Place:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {meta.famous_dishes.slice(0, 3).map((dish, idx) => (
                                <span
                                  key={idx}
                                  className="text-[11px] font-semibold bg-[#FAF8F5] text-[#14110F] px-2.5 py-0.5 rounded-lg border border-[#EFEAE2]"
                                >
                                  {dish.name}
                                </span>
                              ))}
                              {meta.famous_dishes.length > 3 && (
                                <span className="text-[10px] font-bold text-[#D8350F] px-1.5 py-0.5">
                                  +{meta.famous_dishes.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Transit & Cost Details */}
                        <div className="pt-2 border-t border-[#EFEAE2] grid grid-cols-2 gap-2 text-[11px] text-[#57534E]">
                          {meta?.nearest_metro && (
                            <div className="flex items-center gap-1.5 truncate" title={meta.nearest_metro}>
                              <Navigation className="w-3.5 h-3.5 text-[#D8350F] shrink-0" />
                              <span className="truncate">{meta.nearest_metro.split(',')[0]}</span>
                            </div>
                          )}
                          {meta?.avg_cost_for_two && (
                            <div className="flex items-center gap-1.5">
                              <DollarSign className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
                              <span>~₹{meta.avg_cost_for_two} for two</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer CTA */}
                    <div className="p-5 pt-0">
                      <div className="w-full flex items-center justify-between py-2.5 px-4 rounded-xl bg-[#FAF8F5] group-hover:bg-[#FFE9E2] border border-[#EFEAE2] group-hover:border-[#FF5A36]/30 text-xs font-bold text-[#14110F] group-hover:text-[#D8350F] transition-colors">
                        <span className="flex items-center gap-1.5">
                          <Compass className="w-3.5 h-3.5" />
                          <span>{counts[col.id] || 4} Verified Dining Cafes</span>
                        </span>
                        <span className="flex items-center gap-1 text-[#D8350F]">
                          <span>Explore Area</span>
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-stone-50 border-2 border-dashed border-stone-200 rounded-3xl p-16 text-center space-y-3">
              <Search className="w-12 h-12 text-stone-400 mx-auto" />
              <h3 className="font-heading font-extrabold text-xl text-slate-800">
                No Iconic Areas Match "{searchQuery}"
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Try searching for "Nangloi", "Hudson Lane", "Connaught Place", or clear search to browse all guides.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedZone('all');
                }}
                className="px-5 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-xs cursor-pointer"
              >
                Reset Search Filters
              </button>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TAB B: WHAT'S FAMOUS DIRECTORY (INSTANT FOOD SEARCH ACROSS ALL LOCALITIES) */}
      {/* ========================================================================= */}
      {activeTab === 'famous_dishes' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
            <div>
              <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900">
                What’s Famous in Delhi NCR Neighborhoods
              </h2>
              <p className="text-xs text-slate-500">
                Browse iconic signature dishes, counter prices, and the exact cafes serving them.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-stone-100 px-3 py-1.5 rounded-full">
              Showing {filteredFamousDishes.length} famous specialties
            </span>
          </div>

          {filteredFamousDishes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFamousDishes.map(({ dish, areaName, areaSlug, distanceKm }, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedSpotlightDish({ dish, areaName, areaSlug, distanceKm })}
                  className="group bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1"
                >
                  <div>
                    {/* Dish Photo */}
                    <div className="relative aspect-[16/10] bg-stone-100 overflow-hidden">
                      <img
                        src={dish.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80'}
                        alt={dish.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs ${dish.is_veg ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                          {dish.is_veg ? 'Veg' : 'Non-Veg'}
                        </span>
                        {typeof distanceKm === 'number' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-emerald-400 backdrop-blur-xs">
                            📍 {formatDistance(distanceKm)}
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-white">
                        <span className="font-heading font-extrabold text-lg text-amber-300">
                          ₹{dish.price}
                        </span>
                        <span className="text-xs font-semibold text-stone-200 bg-black/60 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                          {dish.restaurant_name}
                        </span>
                      </div>
                    </div>

                    {/* Dish Info */}
                    <div className="p-5 space-y-2">
                      <div className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-[#D8350F]">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{areaName}</span>
                      </div>
                      <h3 className="hd text-base sm:text-lg font-bold text-[#14110F] group-hover:text-[#FF5A36] transition-colors">
                        {dish.name}
                      </h3>
                      <p className="text-xs text-[#57534E] leading-relaxed line-clamp-2">
                        {dish.why_famous}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/iconic-area/${areaSlug}`);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#FFE9E2] text-[#14110F] hover:text-[#D8350F] text-xs font-bold border border-[#EFEAE2] hover:border-[#FF5A36]/30 transition-all cursor-pointer"
                    >
                      <span>Explore in {areaName} Guide</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border-2 border-dashed border-[#E7E2DA] rounded-3xl p-10 sm:p-16 text-center space-y-3">
              <Sparkles className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="hd font-bold text-xl text-[#14110F]">
                No Famous Dishes Match "{searchQuery}"
              </h3>
              <p className="text-xs sm:text-sm text-[#57534E] max-w-md mx-auto">
                Try searching for "Monster Shake", "Chur Chur Naan", "Dal Bukhara", "Jalebi", or "Chaap".
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCraving(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#D8350F] hover:bg-[#FF5A36] text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
              >
                Reset Search
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. DISH SPOTLIGHT PREVIEW MODAL (Mobile Bottom-Sheet Compatible) */}
      {/* ========================================================================= */}
      {selectedSpotlightDish && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-t-[32px] sm:rounded-3xl overflow-hidden max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#EFEAE2] space-y-0 relative animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            {/* Modal Image */}
            <div className="relative aspect-[16/10] bg-stone-900 overflow-hidden shrink-0">
              <img
                src={selectedSpotlightDish.dish.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80'}
                alt={selectedSpotlightDish.dish.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

              <button
                onClick={() => setSelectedSpotlightDish(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white font-bold flex items-center justify-center transition-colors z-20 cursor-pointer"
              >
                ✕
              </button>

              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-xs ${selectedSpotlightDish.dish.is_veg ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                  {selectedSpotlightDish.dish.is_veg ? 'Pure Veg' : 'Non-Veg'}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-400 text-stone-950 shadow-xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Famous Specialty</span>
                </span>
              </div>

              <div className="absolute bottom-4 inset-x-4 flex items-end justify-between text-white">
                <div>
                  <span className="text-[11px] font-bold text-stone-300 uppercase tracking-wider block">
                    Counter Price
                  </span>
                  <span className="hd font-black text-2xl sm:text-3xl text-amber-300">
                    ₹{selectedSpotlightDish.dish.price}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-stone-300 font-semibold block">Exclusively Served At</span>
                  <span className="text-xs sm:text-sm font-bold text-white bg-black/60 px-3 py-1 rounded-xl backdrop-blur-xs">
                    {selectedSpotlightDish.dish.restaurant_name}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <h3 className="hd font-black text-xl sm:text-2xl text-[#14110F]">
                  {selectedSpotlightDish.dish.name}
                </h3>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F766E] mt-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Located in {selectedSpotlightDish.areaName}</span>
                  {typeof selectedSpotlightDish.distanceKm === 'number' && (
                    <span className="text-[#57534E] font-normal">
                      • {formatDistance(selectedSpotlightDish.distanceKm)} from your live GPS
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#EFEAE2] space-y-1.5">
                <div className="text-[11px] font-black uppercase tracking-wider text-[#D8350F] flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Why This Dish is Famous</span>
                </div>
                <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed font-normal">
                  {selectedSpotlightDish.dish.why_famous}
                </p>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={() => {
                    const slug = selectedSpotlightDish.areaSlug;
                    setSelectedSpotlightDish(null);
                    navigate(`/iconic-area/${slug}`);
                  }}
                  className="flex-1 py-3 px-4 rounded-2xl bg-[#0F766E] hover:bg-[#0D9488] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Utensils className="w-4 h-4" />
                  <span>View Full {selectedSpotlightDish.areaName} Guide & Menus</span>
                </button>

                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this famous ${selectedSpotlightDish.dish.name} at ${selectedSpotlightDish.dish.restaurant_name} in ${selectedSpotlightDish.areaName} for ₹${selectedSpotlightDish.dish.price} on MenuMap: ${window.location.origin}/iconic-area/${selectedSpotlightDish.areaSlug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Share</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SYSTEMATIC LOCAL LOGISTICS GUIDE */}
      {/* ========================================================================= */}
      <section className="bg-stone-50 rounded-3xl p-6 sm:p-10 border border-stone-200 space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-black uppercase tracking-wider text-rose-600">
            Delhi Metro & Systematic GPS Know-How
          </span>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900">
            Systematic Neighborhood Discovery on MenuMap
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-700 leading-relaxed">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Crosshair className="w-4 h-4 text-emerald-500" />
              <span>Zero Manual Typing Needed</span>
            </div>
            <p>
              Your browser's live GPS automatically detects whether you're in Nangloi, North Campus, CP, or South Delhi. Iconic areas are dynamically sorted by live distance from where you stand.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <UtensilsCrossed className="w-4 h-4 text-rose-500" />
              <span>Instant "What’s Famous" Search</span>
            </div>
            <p>
              Looking for a specific dish rather than a locality? Search any food item (e.g. "Chur Chur Naan" or "Monster Shake") to immediately see which area and cafe serves it with verified counter prices.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Navigation className="w-4 h-4 text-orange-500" />
              <span>Exact Metro Gates & 3-Stop Crawls</span>
            </div>
            <p>
              Every iconic area guide includes the exact Delhi Metro line, exit gate number, parking realities, and an interactive 3-stop food crawl walking itinerary.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
