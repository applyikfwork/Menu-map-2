import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  Bookmark, 
  Sparkles, 
  Share2, 
  Compass, 
  MapPin,
  Clock,
  DollarSign,
  Navigation,
  Car,
  Flame,
  ChevronRight,
  MessageCircle,
  Copy,
  Info,
  ExternalLink,
  CheckCircle2,
  Coffee,
  Heart,
  Users,
  Search
} from 'lucide-react';
import { Collection, Restaurant, MenuItem, CollectionItem, FamousDishSpotlight, FoodCrawlStop } from '../types/database';
import { api } from '../lib/supabase';
import { isBookmarked, toggleBookmark } from '../lib/bookmarks';
import { RestaurantCard } from '../components/RestaurantCard';
import { useToast } from '../components/Toast';
import { AREA_FOOD_GUIDES } from '../lib/areaGuidesData';
import { getUserLocation, calculateDistanceKm, GeoCoordinates, getCachedUserCoordinates } from '../lib/location';

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

  // Interactive Micro-Collections Filter
  const [selectedSubGuide, setSelectedSubGuide] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');
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
      // 1. Check if slug belongs to area guides or database collections
      let col = await api.getCollectionBySlug(slug);
      if (!col) {
        const fallbackGuide = AREA_FOOD_GUIDES.find((g) => g.slug === slug);
        if (fallbackGuide) col = fallbackGuide;
      }

      if (!col) {
        setCollection(null);
        return;
      }

      // If area_metadata is missing, try to enrich from AREA_FOOD_GUIDES
      if (!col.area_metadata) {
        const matchedGuide = AREA_FOOD_GUIDES.find((g) => g.slug === slug || g.id === col?.id);
        if (matchedGuide?.area_metadata) {
          col = { ...col, area_metadata: matchedGuide.area_metadata };
        }
      }

      setCollection(col);
      setBookmarked(isBookmarked('collection', col.id));

      // Dynamic SEO Title & Meta update
      document.title = `${col.title} | Verified Menus & Prices - MenuMap Delhi NCR`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute(
          'content',
          col.description || `Explore ${col.title} with verified counter menus, prices, famous dishes and 3-stop food crawls.`
        );
      }

      const [items, allRests, allDishes] = await Promise.all([
        api.getCollectionItems(col.id),
        api.getRestaurants(true),
        api.getMenuItems(),
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
    const shareUrl = window.location.href;
    const shareText = `Check out the ${collection?.title} on MenuMap! Verified counter menus, famous dishes & food crawls: ${shareUrl}`;

    if (navigator.share) {
      navigator.share({
        title: collection?.title || 'Living Neighborhood Food Guide',
        text: shareText,
        url: shareUrl,
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

  // Map collection items to actual objects + dynamic area matching for ANY locality
  const populatedRestaurants: Array<{ restaurant: Restaurant; note?: string }> = useMemo(() => {
    if (!collection) return [];
    const list: Array<{ restaurant: Restaurant; note?: string }> = [];

    // 1. Items explicitly linked via collection_items
    for (const item of collectionItems) {
      if (item.item_type === 'restaurant' && item.restaurant_id) {
        const found = restaurants.find((r) => r.id === item.restaurant_id);
        if (found && !list.some((p) => p.restaurant.id === found.id)) {
          list.push({ restaurant: found, note: item.note });
        }
      }
    }

    // 2. Dynamic matching for ANY area / locality across all restaurants in database
    const rawAreaName = (collection.area_metadata?.area_name || collection.title || '');
    const cleanAreaName = rawAreaName
      .toLowerCase()
      .replace(/food guide|dining trail|heritage & rooftops|food map|iconic food hub|food trail|guide|trail/g, '')
      .trim();

    const areaTokens = cleanAreaName
      .split(/[,/& -]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 2 && !['delhi', 'west', 'north', 'south', 'east', 'central', 'ncr', 'the', 'and', 'hub', 'area'].includes(t));

    const matchedByLocation = restaurants.filter((r) => {
      if (list.some((p) => p.restaurant.id === r.id)) return false;
      const text = `${r.name} ${r.city} ${r.address_line1 || ''} ${r.landmark || ''} ${r.short_description || ''}`.toLowerCase();

      // Known area patterns
      if (/satya|south campus/i.test(cleanAreaName) && /satya|venky|moti bagh|south campus/i.test(text)) return true;
      if (/hudson|kamla|north campus/i.test(cleanAreaName) && /hudson|gtb|campus|kamla|kingsway/i.test(text)) return true;
      if (/mukherjee|batra/i.test(cleanAreaName) && /mukherjee|batra|parmanand|gandhi vihar|nehru vihar/i.test(text)) return true;
      if (/majnu|mkt|tibetan/i.test(cleanAreaName) && /majnu|mkt|aruna|monastery/i.test(text)) return true;
      if (/rajendra|karol/i.test(cleanAreaName) && /rajendra|karol|pusa|arya samaj|ajmal khan|bada bazar/i.test(text)) return true;
      if (/malviya|saket/i.test(cleanAreaName) && /malviya|saket|shivalik|khirki|hauz rani|anupam/i.test(text)) return true;
      if (/hauz khas|sda|shahpur/i.test(cleanAreaName) && /hauz khas|hkv|sda|shahpur|essex|green park/i.test(text)) return true;
      if (/nangloi/i.test(cleanAreaName) && /nangloi|shivram|rohtak/i.test(text)) return true;
      if (/connaught|cp/i.test(cleanAreaName) && /connaught|rajiv chowk|cp/i.test(text)) return true;
      if (/chandni|old delhi/i.test(cleanAreaName) && /chandni|old delhi|chawri|jama masjid/i.test(text)) return true;

      // Generic token matching for ANY area
      return areaTokens.some((token) => text.includes(token));
    });

    for (const r of matchedByLocation) {
      list.push({ restaurant: r, note: r.short_description || `Verified cafe in ${rawAreaName}` });
    }

    return list;
  }, [collection, collectionItems, restaurants]);

  // Micro-collections filtering & search
  const filteredRestaurants = useMemo(() => {
    let result = populatedRestaurants;

    if (selectedSubGuide !== 'all') {
      result = result.filter(({ restaurant }) => {
        const facilities = restaurant.facilities || [];
        const bestFor = restaurant.best_for_tags || [];
        const cost = restaurant.average_cost_for_two || 500;
        const isPureVeg = restaurant.dietary_options?.includes('Pure Veg') || restaurant.cuisine_types.includes('Pure Vegetarian');

        if (selectedSubGuide === 'student') {
          return (cost <= 450) || bestFor.includes('Studying') || bestFor.includes('Budget') || facilities.some((f) => /wifi|power|laptop/i.test(f));
        }
        if (selectedSubGuide === 'date_night') {
          return bestFor.includes('Date Night') || bestFor.includes('Views') || /rooftop|aesthetic|cozy|bistro/i.test(restaurant.short_description);
        }
        if (selectedSubGuide === 'family') {
          return isPureVeg || bestFor.includes('Groups') || cost >= 400 || /family|thali|dhaba|dining/i.test(restaurant.short_description);
        }
        if (selectedSubGuide === 'quick_bites') {
          return (cost <= 350) || bestFor.includes('Breakfast') || bestFor.includes('Coffee') || /chai|momos|snack|patty|dosa|fast food/i.test(restaurant.short_description);
        }
        return true;
      });
    }

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase().trim();
      result = result.filter(({ restaurant }) => {
        const text = `${restaurant.name} ${restaurant.cuisine_types.join(' ')} ${restaurant.short_description} ${restaurant.landmark || ''}`.toLowerCase();
        return text.includes(q);
      });
    }

    return result;
  }, [populatedRestaurants, selectedSubGuide, searchFilter]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8 animate-pulse">
        <div className="h-64 sm:h-96 bg-stone-200 rounded-3xl" />
        <div className="h-8 bg-stone-200 rounded w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-72 bg-stone-200 rounded-3xl" />
          <div className="h-72 bg-stone-200 rounded-3xl" />
          <div className="h-72 bg-stone-200 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
          <Compass className="w-8 h-8" />
        </div>
        <h2 className="font-heading font-extrabold text-2xl text-slate-800">
          Neighborhood Guide Not Found
        </h2>
        <p className="text-xs text-slate-500">
          The requested area collection may have moved or been updated.
        </p>
        <button
          onClick={() => navigate('/iconic-area')}
          className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl text-xs transition-colors shadow-md cursor-pointer"
        >
          Explore All Living Area Guides
        </button>
      </div>
    );
  }

  const areaMeta = collection.area_metadata;

  // Auto-resolve or generate famous dishes from area's verified cafes if not provided
  const effectiveFamousDishes: FamousDishSpotlight[] = areaMeta?.famous_dishes && areaMeta.famous_dishes.length > 0 
    ? areaMeta.famous_dishes 
    : populatedRestaurants.slice(0, 4).map(({ restaurant }, i) => ({
        name: restaurant.known_for_dishes?.[0] || `${restaurant.name} Signature Platter`,
        why_famous: `Celebrated crowd-favorite at ${restaurant.name} with authentic local preparation and verified pricing.`,
        restaurant_name: restaurant.name,
        restaurant_slug: restaurant.slug,
        price: Math.round((restaurant.average_cost_for_two || 450) * 0.4),
        image_url: restaurant.cover_image_url,
        is_veg: restaurant.dietary_options?.includes('Pure Veg') ?? true,
      }));

  // Auto-resolve or generate 3-stop food crawl
  const effectiveFoodCrawlStops: FoodCrawlStop[] = areaMeta?.food_crawl_stops && areaMeta.food_crawl_stops.length > 0
    ? areaMeta.food_crawl_stops
    : populatedRestaurants.length >= 3
    ? [
        {
          stop_number: 1,
          time: '4:00 PM',
          type: 'Evening Tea & Signature Starters',
          venue_name: populatedRestaurants[0].restaurant.name,
          venue_slug: populatedRestaurants[0].restaurant.slug,
          recommended_dish: populatedRestaurants[0].restaurant.known_for_dishes?.[0] || 'Hot Signature Starter & Chai',
          distance_to_next: '150 meters (2 min walk)',
          note: `Start early at ${populatedRestaurants[0].restaurant.name} before the peak evening rush kicks in.`
        },
        {
          stop_number: 2,
          time: '6:30 PM',
          type: 'Main Course & Tandoori Feast',
          venue_name: populatedRestaurants[1].restaurant.name,
          venue_slug: populatedRestaurants[1].restaurant.slug,
          recommended_dish: populatedRestaurants[1].restaurant.known_for_dishes?.[0] || 'Specialty Main Course Platter',
          distance_to_next: '120 meters (2 min walk)',
          note: 'Settle in for a hearty dinner course with comfortable air-conditioned booth seating.'
        },
        {
          stop_number: 3,
          time: '8:30 PM',
          type: 'Desserts & Thick Shakes',
          venue_name: populatedRestaurants[2].restaurant.name,
          venue_slug: populatedRestaurants[2].restaurant.slug,
          recommended_dish: populatedRestaurants[2].restaurant.known_for_dishes?.[0] || 'Signature Dessert & Cold Brew',
          distance_to_next: 'End of Trail (Near Metro)',
          note: 'Wrap up the food crawl with sweet treats and neighborhood nighttime ambiance.'
        }
      ]
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-10 sm:space-y-12">
      
      {/* ========================================================================= */}
      {/* 0. BREADCRUMBS & TOP ACTIONS (Mobile Adaptive Bar) */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between gap-3 text-xs">
        <button
          onClick={() => navigate('/iconic-area')}
          className="inline-flex items-center gap-1.5 font-bold text-slate-600 hover:text-orange-600 transition-colors cursor-pointer group py-1.5"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="hidden xs:inline">All Neighborhood Guides</span>
          <span className="xs:hidden">All Guides</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-slate-700 font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-orange-600" />
            <span className="hidden sm:inline">Share Guide</span>
          </button>

          <button
            onClick={handleBookmarkToggle}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold shadow-2xs transition-all cursor-pointer ${
              bookmarked
                ? 'bg-rose-50 text-rose-600 border-rose-200'
                : 'bg-white hover:bg-stone-50 text-slate-700 border-stone-200'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-rose-600' : ''}`} />
            <span>{bookmarked ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. ADAPTIVE HERO BANNER (Responsive Math, No Text Overlap) */}
      {/* ========================================================================= */}
      <section className="relative rounded-3xl overflow-hidden shadow-xl bg-stone-950 flex flex-col justify-end p-5 sm:p-8 lg:p-12 min-h-[340px] sm:min-h-[420px] lg:min-h-[460px]">
        <img
          src={collection.cover_image_url}
          alt={collection.title}
          className="absolute inset-0 w-full h-full object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/75 to-stone-950/20" />

        <div className="relative z-10 space-y-3 sm:space-y-4 max-w-4xl text-white">
          
          {/* Vibe Statement Header */}
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-orange-400">
            <Flame className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="line-clamp-1">{areaMeta?.vibe_badge || 'Living Neighborhood Food Guide & Authentic Menus'}</span>
          </div>

          <h1 className="font-heading font-black text-2xl sm:text-4xl lg:text-5xl tracking-tight text-white drop-shadow-md leading-tight">
            {collection.title}
          </h1>

          <p className="text-xs sm:text-sm lg:text-base text-stone-300 leading-relaxed max-w-3xl line-clamp-3 sm:line-clamp-none">
            {collection.description}
          </p>

          {/* Quick Logistics Row (Stacked on mobile, 3-card row on desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-xs">
            {areaMeta?.best_time_to_visit && (
              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/10">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Best Vibe Hours</div>
                  <div className="font-bold truncate text-white">{areaMeta.best_time_to_visit.split('(')[0]}</div>
                </div>
              </div>
            )}

            {areaMeta?.avg_cost_for_two && (
              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/10">
                <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Avg Cost for Two</div>
                  <div className="font-bold truncate text-white">~₹{areaMeta.avg_cost_for_two} for 2 people</div>
                </div>
              </div>
            )}

            {areaMeta?.nearest_metro && (
              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/10">
                <Navigation className="w-4 h-4 text-rose-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Nearest Metro</div>
                  <div className="font-bold truncate text-white" title={areaMeta.nearest_metro}>
                    {areaMeta.nearest_metro.split('(')[0]}
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. PRACTICAL VISITOR INTEL CARD (Metro Exit & Parking Hacks) */}
      {/* ========================================================================= */}
      {(areaMeta?.nearest_metro || areaMeta?.parking_tips) && (
        <section className="bg-gradient-to-br from-stone-50 to-orange-50/40 rounded-3xl p-5 sm:p-7 border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-orange-600">
            <Info className="w-4 h-4" />
            <span>Practical Visitor Intel</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-xs sm:text-sm">
            {areaMeta?.nearest_metro && (
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/80 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 font-heading font-extrabold text-slate-900 text-sm sm:text-base">
                  <Navigation className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Metro Gate Exit & Route</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {areaMeta.nearest_metro}
                </p>
              </div>
            )}

            {areaMeta?.parking_tips && (
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/80 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 font-heading font-extrabold text-slate-900 text-sm sm:text-base">
                  <Car className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Parking Advice & Navigation</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {areaMeta.parking_tips}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 3. SIGNATURE DISHES SPOTLIGHT (Mobile Swipeable + Desktop Grid) */}
      {/* ========================================================================= */}
      {effectiveFamousDishes.length > 0 && (
        <section className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1 pb-3 border-b border-stone-200">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-rose-600">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span>Locality Signatures</span>
              </div>
              <h2 className="font-heading font-extrabold text-xl sm:text-3xl text-slate-900 tracking-tight mt-0.5">
                What {areaMeta?.area_name || 'This Area'} is Famous For
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-400">
              {effectiveFamousDishes.length} iconic specialties
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {effectiveFamousDishes.map((dish, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedSpotlightDish(dish)}
                className="group bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-0.5"
              >
                <div>
                  <div className="relative aspect-[16/10] bg-stone-100 overflow-hidden">
                    <img
                      src={dish.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80'}
                      alt={dish.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs ${dish.is_veg ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                        {dish.is_veg ? 'Veg' : 'Non-Veg'}
                      </span>
                    </div>

                    <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-white">
                      <span className="font-heading font-black text-base sm:text-lg">
                        ₹{dish.price}
                      </span>
                      <span className="text-[11px] font-semibold text-stone-200 bg-black/60 px-2.5 py-1 rounded-full backdrop-blur-xs truncate max-w-[60%]">
                        {dish.restaurant_name}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 space-y-2">
                    <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                      {dish.name}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {dish.why_famous}
                    </p>
                  </div>
                </div>

                <div className="p-4 sm:p-5 pt-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const match = restaurants.find((r) => r.name.toLowerCase().includes(dish.restaurant_name.toLowerCase()));
                      if (match) navigate(`/restaurant/${match.slug}`);
                      else navigate('/restaurants');
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-stone-100 hover:bg-orange-50 text-slate-800 hover:text-orange-600 text-xs font-bold border border-stone-200 hover:border-orange-200 transition-all cursor-pointer"
                  >
                    <span>View Counter Menu</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 4. TIME-STAMPED 3-STOP FOOD CRAWL (Vertical Connected Stepper) */}
      {/* ========================================================================= */}
      {effectiveFoodCrawlStops.length > 0 && (
        <section className="bg-white rounded-3xl p-5 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-orange-600">
              <Compass className="w-4 h-4" />
              <span>Curated Walk</span>
            </div>
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight">
              Curated 3-Stop Food Crawl
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              The optimal afternoon-to-evening food trail: starters, dinner, and late-night dessert.
            </p>
          </div>

          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-orange-200">
            {effectiveFoodCrawlStops.map((stop, idx) => (
              <div key={idx} className="relative group">
                {/* Step Marker Dot */}
                <div className="absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 rounded-full bg-orange-600 text-white font-black text-xs flex items-center justify-center ring-4 ring-orange-100 shadow-xs">
                  {stop.stop_number || idx + 1}
                </div>

                <div className="bg-stone-50 hover:bg-orange-50/40 rounded-2xl p-4 sm:p-5 border border-stone-200/80 transition-colors space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-orange-600 uppercase tracking-wider">
                      {stop.time} · {stop.type}
                    </span>
                    {stop.distance_to_next && (
                      <span className="text-[11px] font-semibold text-slate-500 bg-white px-2.5 py-0.5 rounded-full border border-stone-200">
                        {stop.distance_to_next}
                      </span>
                    )}
                  </div>

                  <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-900">
                    {stop.venue_name}
                  </h3>

                  <div className="text-xs text-slate-700 font-semibold flex items-center gap-1.5">
                    <span className="text-orange-600">Recommended order:</span>
                    <span>{stop.recommended_dish}</span>
                  </div>

                  {stop.note && (
                    <p className="text-xs text-slate-500 leading-relaxed italic">
                      "{stop.note}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 5. INTERACTIVE CAFE EXPLORER (Smooth Horizontal Filter Bar + Grid) */}
      {/* ========================================================================= */}
      <section className="space-y-6" id="cafes-section">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-3 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-rose-600">
              <MapPin className="w-4 h-4 text-orange-500" />
              <span>Verified Directory</span>
            </div>
            <h2 className="font-heading font-extrabold text-xl sm:text-3xl text-slate-900 tracking-tight mt-0.5">
              Verified Cafes & Restaurants in {areaMeta?.area_name || collection.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span>{filteredRestaurants.length} of {populatedRestaurants.length} places</span>
          </div>
        </div>

        {/* Filter Controls & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Horizontal Scrollable Filter Strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {[
              { id: 'all', label: 'All Places', icon: Compass },
              { id: 'student', label: 'Student / Budget', icon: Coffee },
              { id: 'date_night', label: 'Date Night & Vibes', icon: Heart },
              { id: 'family', label: 'Family & Thalis', icon: Users },
              { id: 'quick_bites', label: 'Quick Chai & Bites', icon: Flame },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = selectedSubGuide === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedSubGuide(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-stone-100 hover:bg-stone-200 text-slate-600'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Search within area */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search dishes or cafes..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
            />
          </div>
        </div>

        {/* Restaurant Grid */}
        {filteredRestaurants.length === 0 ? (
          <div className="bg-stone-50 rounded-3xl p-12 text-center space-y-3 border border-stone-200">
            <Compass className="w-8 h-8 text-stone-400 mx-auto" />
            <h3 className="font-heading font-extrabold text-base text-slate-800">
              No matching cafes found in this category
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try switching your filter or clear your search term to view all verified cafes.
            </p>
            <button
              onClick={() => {
                setSelectedSubGuide('all');
                setSearchFilter('');
              }}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map(({ restaurant }) => {
              const distanceKm = userCoords && restaurant.latitude && restaurant.longitude
                ? calculateDistanceKm(userCoords.latitude, userCoords.longitude, restaurant.latitude, restaurant.longitude)
                : undefined;
              return (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  navigate={navigate}
                  userDistanceKm={distanceKm}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 6. SPOTLIGHT DISH MODAL (Quick Dish Inspection) */}
      {/* ========================================================================= */}
      {selectedSpotlightDish && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 space-y-0">
            <div className="relative aspect-video bg-stone-100">
              <img
                src={selectedSpotlightDish.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80'}
                alt={selectedSpotlightDish.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedSpotlightDish(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-heading font-black text-xl text-slate-900">
                    {selectedSpotlightDish.name}
                  </h3>
                  <p className="text-xs text-orange-600 font-bold mt-0.5">
                    Served at {selectedSpotlightDish.restaurant_name}
                  </p>
                </div>
                <span className="font-heading font-black text-xl text-slate-900 shrink-0">
                  ₹{selectedSpotlightDish.price}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {selectedSpotlightDish.why_famous}
              </p>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => {
                    const match = restaurants.find((r) => r.name.toLowerCase().includes(selectedSpotlightDish.restaurant_name.toLowerCase()));
                    setSelectedSpotlightDish(null);
                    if (match) navigate(`/restaurant/${match.slug}`);
                    else navigate('/restaurants');
                  }}
                  className="flex-1 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                >
                  <span>Open Full Digital Menu</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. SHARE GUIDE MODAL */}
      {/* ========================================================================= */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center animate-in fade-in zoom-in duration-150">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 mx-auto flex items-center justify-center">
              <Share2 className="w-6 h-6" />
            </div>

            <h3 className="font-heading font-extrabold text-lg text-slate-900">
              Share Neighborhood Guide
            </h3>

            <p className="text-xs text-slate-500 leading-relaxed">
              Send this verified living guide with famous dishes and food crawl stops to friends.
            </p>

            <div className="space-y-2 pt-2">
              <button
                onClick={copyShareLink}
                className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Copy className="w-4 h-4 text-slate-600" />
                <span>Copy Guide Link</span>
              </button>

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `Check out the ${collection.title} on MenuMap! Verified menus, famous dishes & food crawls: ${window.location.href}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Share on WhatsApp</span>
              </a>

              <button
                onClick={() => setShareModalOpen(false)}
                className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
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
