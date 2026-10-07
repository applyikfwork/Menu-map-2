import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  Bookmark, 
  Share2, 
  MapPin,
  Clock,
  Navigation,
  Car,
  ChevronRight,
  MessageCircle,
  Copy,
  ExternalLink,
  Utensils,
  Search,
  Check,
  Sparkles,
  Train,
  Users,
  Footprints,
  Flame,
  Filter,
  DollarSign,
  Heart,
  Info,
  ShieldCheck,
  Compass,
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import { Collection, Restaurant, MenuItem, CollectionItem, FamousDishSpotlight, FoodCrawlStop } from '../types/database';
import { api } from '../lib/supabase';
import { isBookmarked, toggleBookmark } from '../lib/bookmarks';
import { RestaurantCard } from '../components/RestaurantCard';
import { useToast } from '../components/Toast';
import { AREA_FOOD_GUIDES } from '../lib/areaGuidesData';
import { 
  getUserLocation, 
  calculateDistanceKm, 
  formatDistance, 
  GeoCoordinates, 
  getCachedUserCoordinates 
} from '../lib/location';
import { DELHI_LOCATIONS, DelhiLocation } from '../lib/delhiLocationsData';

interface CollectionDetailProps {
  slug: string;
  navigate: (path: string) => void;
}

export const CollectionDetail: React.FC<CollectionDetailProps> = ({ slug, navigate }) => {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [collectionItems, setCollectionItems] = useState<CollectionItem[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [bookmarked, setBookmarked] = useState(false);
  const [userCoords, setUserCoords] = useState<GeoCoordinates | null>(() => getCachedUserCoordinates());

  // Sticky Anchor Navigation State
  const [activeNavSection, setActiveNavSection] = useState<'transit' | 'dishes' | 'crawl' | 'cafes'>('transit');

  // "Explore This Area" Power Cafe Engine State
  const [vibeFilter, setVibeFilter] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [partySize, setPartySize] = useState<1 | 2 | 4>(2);
  const [filterWithinPartyBudget, setFilterWithinPartyBudget] = useState(false);

  // Modals
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedSpotlightDish, setSelectedSpotlightDish] = useState<FamousDishSpotlight | null>(null);

  useEffect(() => {
    loadCollectionData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    getUserLocation().then(setUserCoords).catch(() => {});
  }, [slug]);

  const loadCollectionData = async () => {
    setLoading(true);
    try {
      let col: Collection | null = null;

      // 1. Try finding in Supabase
      try {
        col = await api.getCollectionBySlug(slug);
      } catch (err) {
        console.warn('Supabase collection fetch failed, trying local fallback:', err);
      }

      // 2. Try matching in curated AREA_FOOD_GUIDES
      if (!col) {
        const fallbackGuide = AREA_FOOD_GUIDES.find(
          (g) => g.slug === slug || g.id === slug || g.title.toLowerCase().includes(slug.replace(/-/g, ' ').toLowerCase())
        );
        if (fallbackGuide) col = fallbackGuide;
      }

      // 3. Fallback to matching 60+ Delhi Geospatial Directory so NO locality ever 404s!
      if (!col) {
        const cleanSlug = slug.toLowerCase().replace(/^(delhi-hub-|iconic-area-)/, '');
        const matchedLoc = DELHI_LOCATIONS.find(
          (l) => l.id === cleanSlug || 
                 l.id.includes(cleanSlug) || 
                 cleanSlug.includes(l.id) ||
                 l.name.toLowerCase().includes(cleanSlug.replace(/-/g, ' '))
        );

        if (matchedLoc) {
          col = {
            id: `delhi-loc-${matchedLoc.id}`,
            title: `${matchedLoc.name} Food Guide`,
            slug: slug,
            description: matchedLoc.tagline,
            type: 'Area-Guide',
            is_featured: matchedLoc.isPopularHub,
            is_active: true,
            sort_order: 1,
            created_at: new Date().toISOString(),
            cover_image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80',
            area_metadata: {
              area_name: matchedLoc.name,
              zone: matchedLoc.zone,
              latitude: matchedLoc.latitude,
              longitude: matchedLoc.longitude,
              vibe_badge: matchedLoc.tagline,
              famous_for_summary: matchedLoc.famousSpecialties.join(', '),
              best_time_to_visit: '4:00 PM – 9:30 PM (Vibrant evening food street vibes)',
              nearest_metro: `${matchedLoc.metroStation} (${matchedLoc.metroLines.join(', ')})`,
              parking_tips: 'Designated market parking or metro station parking recommended during peak hours.',
              avg_cost_for_two: matchedLoc.avgCostForTwo,
              sub_guide_filters: ['All Cafes', 'Pure Veg', 'Budget Under ₹400', 'Study & Wi-Fi', 'Late Night'],
              famous_dishes: matchedLoc.famousSpecialties.map((spec, i) => ({
                name: spec,
                why_famous: `Iconic culinary landmark in ${matchedLoc.shortName}. Loved by foodies for authentic taste and counter value.`,
                restaurant_name: `Iconic ${matchedLoc.shortName} Kitchen`,
                price: Math.max(90, Math.round((matchedLoc.avgCostForTwo / 2.3) * (0.7 + i * 0.15))),
                is_veg: true,
                image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80'
              })),
              food_crawl_stops: [
                {
                  stop_number: 1,
                  time: 'Stop 1 · 4:45 PM',
                  type: 'Signature Starters & Street Bites',
                  recommended_dish: matchedLoc.famousSpecialties[0] || 'Crispy Chaat & Snacks',
                  venue_name: `${matchedLoc.shortName} Street Landmark`,
                  distance_to_next: '120 m · 2 min walk'
                },
                {
                  stop_number: 2,
                  time: 'Stop 2 · 6:15 PM',
                  type: 'Signature Mains & Platters',
                  recommended_dish: matchedLoc.famousSpecialties[1] || 'Special Thali & Rolls',
                  venue_name: `Central ${matchedLoc.shortName} Diner`,
                  distance_to_next: '95 m · 1 min walk'
                },
                {
                  stop_number: 3,
                  time: 'Stop 3 · 8:00 PM',
                  type: 'Artisan Shakes & Desserts',
                  recommended_dish: matchedLoc.famousSpecialties[2] || 'Dessert & Beverage Spot',
                  venue_name: `${matchedLoc.shortName} Sweet Adda`,
                  distance_to_next: 'End of evening crawl'
                }
              ]
            }
          };
        }
      }

      if (!col) {
        setCollection(null);
        return;
      }

      // If area_metadata is missing on DB collection, supplement from local curated guides
      if (!col.area_metadata) {
        const matchedGuide = AREA_FOOD_GUIDES.find((g) => g.slug === slug || g.id === col?.id);
        if (matchedGuide?.area_metadata) {
          col = { ...col, area_metadata: matchedGuide.area_metadata };
        }
      }

      setCollection(col);
      setBookmarked(isBookmarked('collection', col.id));
      document.title = `${col.title} - Menu Maps Delhi NCR`;

      const [items, allRests, allDishes] = await Promise.all([
        api.getCollectionItems(col.id).catch(() => []),
        api.getRestaurants(true).catch(() => []),
        api.getMenuItems().catch(() => []),
      ]);

      setCollectionItems(items);
      setRestaurants(allRests);
      setMenuItems(allDishes);
    } catch (e) {
      console.error('Error loading collection:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkToggle = () => {
    if (!collection) return;
    const next = toggleBookmark('collection', collection.id);
    setBookmarked(next);
    showToast(next ? 'Saved neighborhood guide to bookmarks!' : 'Removed from bookmarks.', 'success');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: collection?.title || 'Area Guide - Menu Maps',
        text: collection?.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      setShareModalOpen(true);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Guide link copied to clipboard!', 'success');
    setShareModalOpen(false);
  };

  const scrollToAnchor = (id: string, navKey: 'transit' | 'dishes' | 'crawl' | 'cafes') => {
    setActiveNavSection(navKey);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -96; // Offset for fixed navbar + sticky anchor bar
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const meta = collection?.area_metadata;

  // Extracted famous dishes
  const famousDishes: FamousDishSpotlight[] = useMemo(() => {
    if (meta?.famous_dishes && meta.famous_dishes.length > 0) {
      return meta.famous_dishes;
    }
    return [
      { name: 'Ferrero Rocher Monster Shake', restaurant_name: 'Big Yellow Door', price: 219, why_famous: 'Nutella fudge, soft-serve & Ferrero Rochers.', is_veg: true },
      { name: 'Crispy Kurkure Paneer Momos', restaurant_name: 'Ricos Cafe', price: 169, why_famous: 'Golden crunchy casing with spiced paneer filling.', is_veg: true },
      { name: 'Cheesy Peri Peri Fries Platter', restaurant_name: 'Woodbox Cafe', price: 189, why_famous: 'Twice-fried crisp fries in fiery peri peri seasoning.', is_veg: true },
      { name: 'Baked Pink Sauce Penne', restaurant_name: 'Hudson Cafe', price: 249, why_famous: 'Rich tomato & cream sauce under baked mozzarella.', is_veg: true },
      { name: 'Dark Chocolate Belgian Waffle', restaurant_name: 'Abongchi Cafe', price: 179, why_famous: 'Fresh warm waffle topped with melted Belgian fudge.', is_veg: true },
    ];
  }, [meta]);

  // Extracted 3-stop food crawl
  const crawlStops: FoodCrawlStop[] = useMemo(() => {
    if (meta?.food_crawl_stops && meta.food_crawl_stops.length > 0) {
      return meta.food_crawl_stops;
    }
    return [
      { stop_number: 1, time: 'Stop 1 · 4:30 PM', type: 'Evening starters', recommended_dish: 'Kurkure Afghani Momos & Peri Peri Platter', venue_name: 'Woodbox Cafe', distance_to_next: '120 m · 2 min walk' },
      { stop_number: 2, time: 'Stop 2 · 6:00 PM', type: 'Comfort mains', recommended_dish: 'Wood-fired Paneer Tikka Pizza & Pink Penne', venue_name: 'Ricos Cafe & Bistro', distance_to_next: '90 m · 1 min walk' },
      { stop_number: 3, time: 'Stop 3 · 7:45 PM', type: 'Shakes & waffles', recommended_dish: 'Nutella Brownie Bomb Shake & Belgian Waffle', venue_name: 'Big Yellow Door', distance_to_next: 'End of evening crawl' },
    ];
  }, [meta]);

  // Filtered cafes matching this area and power filters
  const guideRestaurants = useMemo(() => {
    if (!collection) return [];

    let list: Restaurant[] = [];
    if (collectionItems.length > 0) {
      const restIds = collectionItems.map((ci) => ci.restaurant_id).filter(Boolean);
      list = restaurants.filter((r) => restIds.includes(r.id));
    }

    if (list.length === 0) {
      const areaKeywords = (meta?.area_name || collection.title)
        .toLowerCase()
        .split(/[\s,&/()]+/);
      list = restaurants.filter((r) => {
        const fullAddr = `${r.name} ${r.landmark || ''} ${r.address_line1 || ''}`.toLowerCase();
        return areaKeywords.some((kw) => kw.length > 3 && fullAddr.includes(kw));
      });
    }

    // Geolocation fallback: if no restaurants found by text, pick closest restaurants to area coordinates
    if (list.length === 0 && meta?.latitude && meta?.longitude) {
      list = [...restaurants].sort((a, b) => {
        const distA = calculateDistanceKm(meta.latitude!, meta.longitude!, a.latitude, a.longitude);
        const distB = calculateDistanceKm(meta.latitude!, meta.longitude!, b.latitude, b.longitude);
        return distA - distB;
      }).slice(0, 9);
    }

    // Fallback if still empty
    if (list.length === 0) {
      list = restaurants.slice(0, 6);
    }

    // Apply Live Filters
    return list.filter((r) => {
      // 1. Text Search Filter
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        const matchesName = r.name.toLowerCase().includes(q);
        const matchesCuisine = (r.cuisine_types || []).some((c) => c.toLowerCase().includes(q));
        const matchesDishes = (r.known_for_dishes || []).some((d) => d.toLowerCase().includes(q));
        if (!matchesName && !matchesCuisine && !matchesDishes) return false;
      }

      // 2. Vibe Filter
      if (vibeFilter !== 'all') {
        if (vibeFilter === 'Pure Veg' && !r.dietary_options?.includes('Pure Veg')) return false;
        if (vibeFilter === 'Rooftops' && !r.facilities?.some((f) => /roof|outdoor|terrace/i.test(f))) return false;
        if (vibeFilter === 'Study' && !r.facilities?.some((f) => /wifi|power|work|study|laptop/i.test(f))) return false;
        if (vibeFilter === 'Late Night' && !r.facilities?.some((f) => /late|midnight|24/i.test(f))) return false;
        if (vibeFilter === 'Budget' && (r.average_cost_for_two || 0) > 400) return false;
      }

      // 3. Party Budget Filter
      if (filterWithinPartyBudget) {
        const costForTwo = r.average_cost_for_two || 400;
        const multiplier = partySize === 1 ? 0.6 : partySize === 2 ? 1.0 : 2.0;
        const maxBudget = (meta?.avg_cost_for_two || 450) * multiplier;
        if (costForTwo * (multiplier / (partySize === 2 ? 1 : 2)) > maxBudget) {
          return false;
        }
      }

      return true;
    });
  }, [collection, collectionItems, restaurants, searchFilter, vibeFilter, filterWithinPartyBudget, partySize, meta]);

  // Budget for party calculation
  const calculatedPartyBudget = useMemo(() => {
    const base = meta?.avg_cost_for_two || 450;
    if (partySize === 1) return Math.round(base * 0.55);
    if (partySize === 4) return Math.round(base * 2.0);
    return base;
  }, [meta, partySize]);

  // Google Maps Walking Route link for the food crawl
  const googleMapsRouteUrl = useMemo(() => {
    if (!crawlStops || crawlStops.length === 0) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((meta?.area_name || collection?.title || 'Delhi') + ' food street')}`;
    }
    const origin = encodeURIComponent(`${crawlStops[0].venue_name}, ${meta?.area_name || 'Delhi'}`);
    const dest = encodeURIComponent(`${crawlStops[crawlStops.length - 1].venue_name}, ${meta?.area_name || 'Delhi'}`);
    const waypoints = crawlStops.slice(1, -1).map(s => encodeURIComponent(`${s.venue_name}, ${meta?.area_name || 'Delhi'}`)).join('|');
    
    if (waypoints) {
      return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&waypoints=${waypoints}&travelmode=walking`;
    }
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=walking`;
  }, [crawlStops, meta, collection]);

  if (loading) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 py-24 text-center">
        <div className="w-12 h-12 border-4 border-[#FF5A36] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-bold text-stone-500">Loading neighborhood guide…</p>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <div className="w-14 h-14 rounded-2xl bg-orange-100 text-[#D8350F] mx-auto flex items-center justify-center mb-4">
          <Compass className="w-7 h-7" />
        </div>
        <h2 className="hd text-3xl font-extrabold text-[#1C1917]">Area Guide Not Found</h2>
        <p className="mt-2 text-sm text-[#78716C]">The foodie neighborhood guide you requested could not be located.</p>
        <button 
          onClick={() => navigate('/iconic-area')} 
          className="btn mt-6 bg-[#1C1917] hover:bg-[#D8350F] text-white"
        >
          Explore All 60+ Area Guides
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FAF8F5] text-[#1C1917] min-h-screen pb-28">

      {/* ========================================================================= */}
      {/* 1. TOP SUB-NAV BAR (BACK & SOCIAL SHARE BUTTONS) */}
      {/* ========================================================================= */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/iconic-area')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-stone-600 hover:text-[#D8350F] transition-colors py-1 px-2.5 rounded-xl hover:bg-stone-200/50 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Delhi Food Guides</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleBookmarkToggle}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              bookmarked 
                ? 'bg-[#FF5A36] text-white shadow-xs' 
                : 'bg-white border border-[#E7E2DA] text-[#57534E] hover:text-[#1C1917] hover:bg-stone-50'
            }`}
            title="Bookmark this neighborhood"
          >
            <Bookmark className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${bookmarked ? 'fill-white' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-[#E7E2DA] text-[#57534E] hover:text-[#1C1917] hover:bg-stone-50 flex items-center justify-center transition-all cursor-pointer"
            title="Share neighborhood guide"
          >
            <Share2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. COMPACT HERO BANNER (MOBILE-FIRST, NO NEGATIVE MARGIN OVERLAP) */}
      {/* ========================================================================= */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="relative rounded-[28px] sm:rounded-[36px] overflow-hidden min-h-[300px] sm:min-h-[380px] flex items-end text-white shadow-sm"
          style={{
            background: collection.cover_image_url
              ? `linear-gradient(to top, rgba(16,14,13,0.95) 0%, rgba(16,14,13,0.55) 55%, rgba(16,14,13,0.2) 100%), url(${collection.cover_image_url}) center/cover no-repeat`
              : 'linear-gradient(150deg,#F4A261 0%,#C2410C 50%,#431407 100%)',
          }}
        >
          <div className="relative z-10 w-full p-5 sm:p-8 lg:p-10 space-y-2.5">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-md text-[11px] font-black uppercase tracking-wider text-amber-200">
                {meta?.zone || 'Delhi NCR'}
              </span>
              {meta?.nearest_metro && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-900/60 backdrop-blur-md text-[11px] font-bold text-teal-200 border border-teal-500/30">
                  <Train className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[200px] sm:max-w-none">{meta.nearest_metro.split('(')[0].trim()}</span>
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="hd text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight max-w-4xl">
              {collection.title}
            </h1>

            {/* Description */}
            <p className="text-xs sm:text-base text-stone-200 leading-relaxed font-medium max-w-2xl line-clamp-2 sm:line-clamp-none">
              {collection.description || 'Buzzing student adda, late-night waffles and pocket-friendly platters.'}
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. GLANCE FACT BAR (CLEAN, TOUCH-FRIENDLY, NO OVERLAPPING BUGS) */}
        {/* ========================================================================= */}
        <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {/* Card 1: Nearest Metro */}
          <div className="bg-white rounded-2xl border border-[#EFEAE2] p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center gap-2 text-[#0F766E] mb-1">
              <Train className="w-4 h-4 shrink-0" />
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-stone-400">Metro Station</span>
            </div>
            <div className="text-xs sm:text-sm font-extrabold text-[#1C1917] truncate">
              {meta?.nearest_metro ? meta.nearest_metro.split('(')[0].trim() : 'Metro Connected'}
            </div>
            <div className="text-[10px] text-stone-500 truncate mt-0.5">
              {meta?.nearest_metro?.includes('Exit') ? meta.nearest_metro.slice(meta.nearest_metro.indexOf('Exit')) : 'Short walk or e-rickshaw'}
            </div>
          </div>

          {/* Card 2: Cost For Two */}
          <div className="bg-white rounded-2xl border border-[#EFEAE2] p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center gap-2 text-[#D8350F] mb-1">
              <DollarSign className="w-4 h-4 shrink-0" />
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-stone-400">Budget For Two</span>
            </div>
            <div className="text-xs sm:text-sm font-extrabold text-[#D8350F]">
              ₹{meta?.avg_cost_for_two || 450} <span className="text-[11px] font-medium text-stone-500">avg</span>
            </div>
            <div className="text-[10px] text-stone-500 truncate mt-0.5">
              ~₹{Math.round((meta?.avg_cost_for_two || 450) / 2)} / person
            </div>
          </div>

          {/* Card 3: Best Time */}
          <div className="bg-white rounded-2xl border border-[#EFEAE2] p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center gap-2 text-[#B45309] mb-1">
              <Clock className="w-4 h-4 shrink-0" />
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-stone-400">Best Hours</span>
            </div>
            <div className="text-xs sm:text-sm font-extrabold text-[#1C1917] truncate">
              {meta?.best_time_to_visit ? meta.best_time_to_visit.split('(')[0].trim() : '3:30 – 8:30 PM'}
            </div>
            <div className="text-[10px] text-stone-500 truncate mt-0.5">
              Evening crowd & best vibe
            </div>
          </div>

          {/* Card 4: Parking & Transit */}
          <div className="bg-white rounded-2xl border border-[#EFEAE2] p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center gap-2 text-[#0F766E] mb-1">
              <Car className="w-4 h-4 shrink-0" />
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-stone-400">Parking Intel</span>
            </div>
            <div className="text-xs sm:text-sm font-extrabold text-[#1C1917] truncate">
              {meta?.parking_tips?.includes('Metro') ? 'Metro Station Lot' : 'Municipal Lot'}
            </div>
            <div className="text-[10px] text-stone-500 truncate mt-0.5">
              Avoid inner lanes in cars
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. MOBILE STICKY QUICK-JUMP ANCHOR BAR */}
      {/* ========================================================================= */}
      <div className="sticky top-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-md border-y border-[#E7E2DA] my-6 py-2 px-4 sm:px-6 shadow-2xs">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => scrollToAnchor('section-transit', 'transit')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeNavSection === 'transit'
                  ? 'bg-[#1C1917] text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-[#E7E2DA] hover:bg-stone-50'
              }`}
            >
              <Train className="w-3.5 h-3.5" />
              <span>Transit &amp; Intel</span>
            </button>

            <button
              type="button"
              onClick={() => scrollToAnchor('section-dishes', 'dishes')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeNavSection === 'dishes'
                  ? 'bg-[#1C1917] text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-[#E7E2DA] hover:bg-stone-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Signatures ({famousDishes.length})</span>
            </button>

            <button
              type="button"
              onClick={() => scrollToAnchor('section-crawl', 'crawl')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeNavSection === 'crawl'
                  ? 'bg-[#1C1917] text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-[#E7E2DA] hover:bg-stone-50'
              }`}
            >
              <Footprints className="w-3.5 h-3.5 text-teal-600" />
              <span>3-Stop Food Crawl</span>
            </button>

            <button
              type="button"
              onClick={() => scrollToAnchor('section-cafes', 'cafes')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeNavSection === 'cafes'
                  ? 'bg-[#D8350F] text-white shadow-xs'
                  : 'bg-white text-[#D8350F] border border-orange-200 hover:bg-orange-50'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Explore Cafes ({guideRestaurants.length})</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center text-xs font-semibold text-stone-500 shrink-0">
            <span>Menu Maps Verified</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">

        {/* ========================================================================= */}
        {/* BLOCK 1: TRANSIT & VISITOR INTEL */}
        {/* ========================================================================= */}
        <section id="section-transit" className="scroll-mt-28 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-black uppercase tracking-wider text-[#0F766E]">
                Arrival &amp; Local Navigation
              </div>
              <h2 className="hd text-xl sm:text-2xl font-black text-[#1C1917]">
                Get there without the guesswork
              </h2>
            </div>

            {meta?.latitude && meta?.longitude && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((meta.area_name || collection.title) + ' Delhi')}`}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#0F766E] hover:underline"
              >
                <span>Google Maps View</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Metro Transit */}
            <div className="bg-white rounded-2xl sm:rounded-[24px] border border-[#EFEAE2] p-5 shadow-2xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center">
                <Train className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-black text-base text-[#1C1917]">
                Nearest Metro Station
              </h3>
              <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
                {meta?.nearest_metro || 'Directly accessible via Delhi Metro network. Take a quick e-rickshaw or walk from the nearest exit.'}
              </p>
              <div className="pt-2 text-[11px] font-bold text-[#0F766E] flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Last-mile: E-Rickshaws usually ₹10–₹20</span>
              </div>
            </div>

            {/* Parking & Lanes */}
            <div className="bg-white rounded-2xl sm:rounded-[24px] border border-[#EFEAE2] p-5 shadow-2xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#D8350F] flex items-center justify-center">
                <Car className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-black text-base text-[#1C1917]">
                Parking &amp; Cab Drop
              </h3>
              <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
                {meta?.parking_tips || 'Paid municipal parking or metro multilevel lot recommended. Lanes can be congested during evening rush.'}
              </p>
              <div className="pt-2 text-[11px] font-bold text-amber-700 flex items-center gap-1">
                <Info className="w-3.5 h-3.5" />
                <span>Tip: Set cab drop at main road or metro exit</span>
              </div>
            </div>

            {/* Timing & Crowd */}
            <div className="bg-white rounded-2xl sm:rounded-[24px] border border-[#EFEAE2] p-5 shadow-2xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#B45309] flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-black text-base text-[#1C1917]">
                Best Visiting Window
              </h3>
              <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
                {meta?.best_time_to_visit || '4:00 PM – 9:00 PM for the vibrant food walk atmosphere.'} Visit early afternoons for quiet study seating with Wi-Fi.
              </p>
              <div className="pt-2 text-[11px] font-bold text-teal-700 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Most counters open till 11:00 PM</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* BLOCK 2: LOCALITY SIGNATURES STRIP (WHAT THIS LANE IS FAMOUS FOR) */}
        {/* ========================================================================= */}
        <section id="section-dishes" className="scroll-mt-28 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1.5">
            <div>
              <div className="text-[11px] font-black uppercase tracking-wider text-[#D8350F]">
                Locality Signatures
              </div>
              <h2 className="hd text-xl sm:text-2xl font-black text-[#1C1917]">
                What this neighbourhood is legendary for
              </h2>
            </div>
            <p className="text-xs text-stone-500 font-medium">
              Verified counter rates · No 30% delivery commission markups
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {famousDishes.map((dish, idx) => {
              const estimatedAppPrice = Math.round(dish.price * 1.25) + 35;
              const savings = estimatedAppPrice - dish.price;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedSpotlightDish(dish)}
                  className="bg-white rounded-2xl sm:rounded-[24px] border border-[#EFEAE2] p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
                >
                  <div className="space-y-2">
                    {/* Top Row: Dish Name + Price */}
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${dish.is_veg === false ? 'bg-red-600' : 'bg-green-600'}`} />
                          <h3 className="font-heading font-black text-base text-[#1C1917] group-hover:text-[#D8350F] transition-colors leading-tight">
                            {dish.name}
                          </h3>
                        </div>
                        <div className="text-xs font-bold text-[#0F766E] mt-0.5">
                          at {dish.restaurant_name}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-lg font-black text-[#D8350F]">
                          ₹{dish.price}
                        </div>
                        <div className="text-[10px] text-stone-400 line-through">
                          app ₹{estimatedAppPrice}
                        </div>
                      </div>
                    </div>

                    {/* Why famous explanation */}
                    <p className="text-xs text-[#57534E] leading-relaxed line-clamp-2">
                      {dish.why_famous}
                    </p>
                  </div>

                  {/* Savings Tag */}
                  <div className="mt-4 pt-3 border-t border-[#E7E2DA]/80 flex items-center justify-between text-[11px] font-bold">
                    <span className="inline-flex items-center gap-1 text-[#0F766E] bg-teal-50 px-2 py-0.5 rounded-md">
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span>Save ~₹{savings} at counter</span>
                    </span>

                    <span className="text-[#D8350F] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      <span>Details</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* BLOCK 3: CURATED 3-STOP FOOD CRAWL (VISUAL WALKING TIMELINE) */}
        {/* ========================================================================= */}
        <section id="section-crawl" className="scroll-mt-28">
          <div className="bg-[#14110F] text-white rounded-[28px] sm:rounded-[36px] p-6 sm:p-9 lg:p-11 relative overflow-hidden shadow-lg">
            {/* Glowing Accent */}
            <div
              aria-hidden="true"
              className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(255,90,54,0.3),transparent_70%)] pointer-events-none"
            />

            <div className="relative z-10 max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-[#2DD4BF] text-[11px] font-black uppercase tracking-wider">
                <Footprints className="w-3.5 h-3.5" />
                <span>Curated Evening Trail</span>
              </div>
              <h2 className="hd text-2xl sm:text-4xl font-black text-white tracking-tight">
                Tested on foot: 3 stops, 1 evening
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-normal">
                Follow this exact sequence to enjoy the neighborhood’s star dishes in one smooth walking route without waiting in queues.
              </p>
            </div>

            {/* Visual Step-by-Step Timeline */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
              {crawlStops.map((stop, idx) => (
                <div
                  key={idx}
                  className="bg-white/6 hover:bg-white/10 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="px-2.5 py-0.5 rounded-lg bg-[#2DD4BF]/20 text-[#2DD4BF] text-[11px] font-black">
                        {stop.time}
                      </span>
                      {stop.distance_to_next && (
                        <span className="text-[11px] text-stone-400">
                          {stop.distance_to_next}
                        </span>
                      )}
                    </div>

                    <h4 className="font-heading font-black text-base sm:text-lg text-white pt-1">
                      {stop.type}
                    </h4>

                    <div className="text-xs font-bold text-[#FF8A6B]">
                      Must-Order: {stop.recommended_dish}
                    </div>

                    <div className="text-xs text-stone-300 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#2DD4BF] shrink-0" />
                      <span className="truncate">{stop.venue_name}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-stone-400 flex items-center justify-between">
                    <span>Stop #{stop.stop_number}</span>
                    <span className="text-stone-300">Verified Trail</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Bar for the Food Crawl */}
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 relative z-10">
              <a
                href={googleMapsRouteUrl}
                target="_blank"
                rel="noreferrer"
                className="btn bg-[#0F766E] hover:bg-[#0D9488] text-white text-xs sm:text-sm font-bold min-h-[46px] shadow-sm"
              >
                <Navigation className="w-4 h-4 mr-1.5" />
                <span>Open Walking Route in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `Hey! Let's do this 3-stop food crawl in ${collection.title} on MenuMap:\n\n` +
                  crawlStops.map(s => `• ${s.time}: ${s.recommended_dish} at ${s.venue_name}`).join('\n') +
                  `\n\nFull guide: ${window.location.href}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="btn bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-bold min-h-[46px]"
              >
                <MessageCircle className="w-4 h-4 mr-1.5 text-emerald-400" />
                <span>Share Crawl with Friends</span>
              </a>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* BLOCK 4: "EXPLORE THIS AREA" POWER CAFE ENGINE */}
        {/* ========================================================================= */}
        <section id="section-cafes" className="scroll-mt-28 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="text-[11px] font-black uppercase tracking-wider text-[#D8350F]">
                Verified Counters &amp; Direct Menus
              </div>
              <h2 className="hd text-2xl sm:text-3xl font-black text-[#1C1917]">
                Explore cafes in {collection.title.replace(' Food Guide', '').replace(' Food Map', '')}
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Browse verified counter menus, 0% markup dining, and WhatsApp ordering.
              </p>
            </div>

            {/* LIVE BUDGET CALCULATOR PER PARTY SIZE */}
            <div className="bg-white border border-[#E7E2DA] rounded-2xl p-3 sm:p-3.5 shadow-2xs flex flex-col gap-2 shrink-0">
              <div className="flex items-center justify-between gap-3 text-xs font-bold text-stone-600">
                <span className="flex items-center gap-1.5 text-[#0F766E]">
                  <Users className="w-3.5 h-3.5" />
                  <span>Party Budget Estimator:</span>
                </span>
                <span className="font-extrabold text-[#D8350F] text-sm">
                  ~₹{calculatedPartyBudget}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {[
                  { size: 1, label: 'Solo (1)' },
                  { size: 2, label: 'Duo (2)' },
                  { size: 4, label: 'Group (4)' },
                ].map((item) => (
                  <button
                    key={item.size}
                    type="button"
                    onClick={() => setPartySize(item.size as 1 | 2 | 4)}
                    className={`px-3 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      partySize === item.size
                        ? 'bg-[#1C1917] text-white shadow-2xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* POWER CONTROLS: VIBE FILTERS & SEARCH BAR */}
          <div className="space-y-3 bg-white rounded-2xl sm:rounded-[24px] border border-[#EFEAE2] p-4 sm:p-5 shadow-2xs">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search cafe name, dish or cuisine (e.g. Momos, Pizza, Shakes)..."
                className="w-full pl-9 pr-14 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-medium text-[#1C1917] focus:border-[#FF5A36] focus:bg-white outline-none transition-all"
              />
              {searchFilter && (
                <button
                  type="button"
                  onClick={() => setSearchFilter('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 hover:text-stone-700"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Vibe Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
              {[
                { id: 'all', label: 'All Cafes' },
                { id: 'Pure Veg', label: '🌱 Pure Veg' },
                { id: 'Budget', label: '💰 Budget (< ₹400)' },
                { id: 'Study', label: '💻 Study & Wi-Fi' },
                { id: 'Rooftops', label: '🌇 Rooftops' },
                { id: 'Late Night', label: '🌙 Late Night' },
              ].map((pill) => {
                const active = vibeFilter === pill.id;
                return (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => setVibeFilter(pill.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      active
                        ? 'bg-[#D8350F] text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* RESTAURANTS GRID */}
          <div>
            <div className="flex items-center justify-between mb-4 text-xs font-bold text-stone-500">
              <span>Showing {guideRestaurants.length} verified counters</span>
              {userCoords && <span className="text-[#0F766E]">📍 Distance from your GPS</span>}
            </div>

            {guideRestaurants.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {guideRestaurants.map((restaurant) => {
                  const dist = userCoords
                    ? calculateDistanceKm(userCoords.latitude, userCoords.longitude, restaurant.latitude, restaurant.longitude)
                    : undefined;

                  return (
                    <RestaurantCard
                      key={restaurant.id}
                      restaurant={restaurant}
                      navigate={navigate}
                      userDistanceKm={dist}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl border border-[#E7E2DA] p-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#D8350F] mx-auto flex items-center justify-center">
                  <Utensils className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-black text-base text-[#1C1917]">
                  No cafes match these filters in this area
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Try clearing the search text or switching to "All Cafes" to view all verified dining spots in this neighbourhood.
                </p>
                <button
                  type="button"
                  onClick={() => { setVibeFilter('all'); setSearchFilter(''); }}
                  className="btn bg-[#1C1917] hover:bg-[#D8350F] text-white text-xs px-4 py-2 rounded-xl font-bold cursor-pointer"
                >
                  Reset Area Filters
                </button>
              </div>
            )}
          </div>
        </section>

      </div>

      {/* ========================================================================= */}
      {/* 5. MODALS: SHARE MODAL & DISH SPOTLIGHT MODAL */}
      {/* ========================================================================= */}

      {/* Share Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-[#FFE9E2] text-[#D8350F] mx-auto flex items-center justify-center">
              <Share2 className="w-6 h-6" />
            </div>
            <h3 className="hd text-xl font-bold text-[#1C1917]">Share Food Guide</h3>
            <p className="text-xs text-[#78716C]">
              Share this verified neighborhood guide with iconic dishes &amp; walking trails.
            </p>
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={copyShareLink}
                className="btn w-full bg-stone-100 hover:bg-stone-200 text-[#1C1917] min-h-[44px] text-xs font-bold cursor-pointer"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Guide Link
              </button>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `Check out the ${collection.title} on MenuMap! Verified menus, famous dishes & food trails: ${window.location.href}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="btn w-full bg-[#0F766E] hover:bg-[#0D9488] text-white min-h-[44px] text-xs font-bold"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Share on WhatsApp
              </a>
              <button
                type="button"
                onClick={() => setShareModalOpen(false)}
                className="btn w-full bg-transparent text-stone-500 min-h-[40px] text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Famous Dish Spotlight Modal */}
      {selectedSpotlightDish && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[28px] max-w-md w-full p-6 text-left space-y-4 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setSelectedSpotlightDish(null)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 cursor-pointer"
            >
              ✕
            </button>

            <div>
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#D8350F] mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Locality Landmark Dish</span>
              </div>
              <h3 className="hd text-xl sm:text-2xl font-black text-[#1C1917]">
                {selectedSpotlightDish.name}
              </h3>
              <div className="text-sm font-bold text-[#0F766E]">
                Available at {selectedSpotlightDish.restaurant_name}
              </div>
            </div>

            {/* Price & Savings Pill */}
            <div className="bg-orange-50/70 border border-orange-200/80 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Counter Dine-in / Takeaway
                </div>
                <div className="text-2xl font-black text-[#D8350F]">
                  ₹{selectedSpotlightDish.price}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold text-stone-400 line-through">
                  App ~₹{Math.round(selectedSpotlightDish.price * 1.25) + 35}
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0F766E] bg-white px-2 py-0.5 rounded-md border border-teal-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>0% Markup Verified</span>
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
              {selectedSpotlightDish.why_famous}
            </p>

            {/* Actions */}
            <div className="pt-2 space-y-2">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `Check out this famous ${selectedSpotlightDish.name} at ${selectedSpotlightDish.restaurant_name} in ${collection.title} for ₹${selectedSpotlightDish.price} on MenuMap: ${window.location.href}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="btn w-full bg-[#0F766E] hover:bg-[#0D9488] text-white min-h-[44px] text-xs font-bold"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Share Dish on WhatsApp
              </a>

              <button
                type="button"
                onClick={() => setSelectedSpotlightDish(null)}
                className="btn w-full bg-stone-100 hover:bg-stone-200 text-[#1C1917] min-h-[40px] text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
