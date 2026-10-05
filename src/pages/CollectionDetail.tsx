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
  Check
} from 'lucide-react';
import { Collection, Restaurant, MenuItem, CollectionItem, FamousDishSpotlight } from '../types/database';
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

  // Interactive Filter state
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
      let col = await api.getCollectionBySlug(slug);
      if (!col) {
        const fallbackGuide = AREA_FOOD_GUIDES.find((g) => g.slug === slug);
        if (fallbackGuide) col = fallbackGuide;
      }

      if (!col) {
        setCollection(null);
        return;
      }

      if (!col.area_metadata) {
        const matchedGuide = AREA_FOOD_GUIDES.find((g) => g.slug === slug || g.id === col?.id);
        if (matchedGuide?.area_metadata) {
          col = { ...col, area_metadata: matchedGuide.area_metadata };
        }
      }

      setCollection(col);
      setBookmarked(isBookmarked('collection', col.id));

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
    if (navigator.share) {
      navigator.share({
        title: collection?.title || 'Area Guide',
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

  // Associated restaurants
  const guideRestaurants = useMemo(() => {
    if (!collection) return [];

    let list: Restaurant[] = [];
    if (collectionItems.length > 0) {
      const restIds = collectionItems.map((ci) => ci.restaurant_id).filter(Boolean);
      list = restaurants.filter((r) => restIds.includes(r.id));
    }

    if (list.length === 0) {
      const areaKeywords = (collection.area_metadata?.area_name || collection.title)
        .toLowerCase()
        .split(/[\s,&]+/);
      list = restaurants.filter((r) => {
        const fullAddr = `${r.name} ${r.landmark || ''} ${r.address_line1 || ''}`.toLowerCase();
        return areaKeywords.some((kw) => kw.length > 3 && fullAddr.includes(kw));
      });
    }

    if (list.length === 0) {
      list = restaurants.slice(0, 6);
    }

    // Apply micro filter
    return list.filter((r) => {
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        if (!r.name.toLowerCase().includes(q) && !(r.cuisine_types || []).some((c) => c.toLowerCase().includes(q))) {
          return false;
        }
      }

      if (selectedSubGuide !== 'all') {
        if (selectedSubGuide === 'Pure Veg' && !r.dietary_options?.includes('Pure Veg')) return false;
        if (selectedSubGuide === 'Rooftops' && !r.facilities?.some((f) => /roof|outdoor/i.test(f))) return false;
        if (selectedSubGuide === 'Budget' && (r.average_cost_for_two || 0) > 400) return false;
      }

      return true;
    });
  }, [collection, collectionItems, restaurants, searchFilter, selectedSubGuide]);

  if (loading) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 py-20 text-center">
        <div className="w-12 h-12 border-4 border-[#FF5A36] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-bold text-stone-500">Loading area guide…</p>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <h2 className="hd text-3xl font-extrabold text-[#1C1917]">Area Guide Not Found</h2>
        <p className="mt-2 text-sm text-[#78716C]">The foodie neighborhood guide you requested could not be located.</p>
        <button onClick={() => navigate('/iconic-area')} className="btn mt-6 bg-[#1C1917] text-white">
          All Area Guides
        </button>
      </div>
    );
  }

  const meta = collection.area_metadata;
  const famousDishes = meta?.famous_dishes || [
    { name: 'Ferrero Rocher Monster Shake', restaurant_name: 'Big Yellow Door', price: 219, why_famous: 'Nutella fudge, soft-serve & Ferrero Rochers.' },
    { name: 'Crispy Kurkure Paneer Momos', restaurant_name: 'Ricos Cafe', price: 169, why_famous: 'Golden crunchy casing with spiced paneer filling.' },
    { name: 'Cheesy Peri Peri Fries Platter', restaurant_name: 'Woodbox Cafe', price: 189, why_famous: 'Twice-fried crisp fries in fiery peri peri seasoning.' },
    { name: 'Baked Pink Sauce Penne', restaurant_name: 'Hudson Cafe', price: 249, why_famous: 'Rich tomato & cream sauce under baked mozzarella.' },
    { name: 'Dark Chocolate Belgian Waffle', restaurant_name: 'Abongchi Cafe', price: 179, why_famous: 'Fresh warm waffle topped with melted Belgian fudge.' },
  ];

  const crawlStops = meta?.food_crawl_stops || [
    { stop_number: 1, time: 'Stop 1 · 4:30 PM', type: 'Evening starters', recommended_dish: 'Kurkure Afghani Momos & Peri Peri Platter', venue_name: 'Woodbox Cafe', distance_to_next: '120 m · 2 min walk' },
    { stop_number: 2, time: 'Stop 2 · 6:00 PM', type: 'Comfort mains', recommended_dish: 'Wood-fired Paneer Tikka Pizza & Pink Penne', venue_name: 'Ricos Cafe & Bistro', distance_to_next: '90 m · 1 min walk' },
    { stop_number: 3, time: 'Stop 3 · 7:45 PM', type: 'Shakes & waffles', recommended_dish: 'Nutella Brownie Bomb Shake & Belgian Waffle', venue_name: 'Big Yellow Door', distance_to_next: 'End of evening crawl' },
  ];

  return (
    <div className="w-full bg-[#FAF8F5] text-[#1C1917] min-h-screen pb-24">
      {/* ========================================================
          1. HERO (MATCHES area_guide_template.html)
      ======================================================== */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-8 pt-4">
        <div
          className="ph rounded-[36px] sm:rounded-[44px] min-h-[440px] sm:min-h-[480px] flex items-end relative overflow-hidden text-white"
          style={{
            background: collection.cover_image_url
              ? `linear-gradient(to top, rgba(20,17,15,0.92) 0%, rgba(20,17,15,0.4) 60%, rgba(20,17,15,0.2) 100%), url(${collection.cover_image_url}) center/cover no-repeat`
              : 'linear-gradient(150deg,#F4A261 0%,#C2410C 50%,#431407 100%)',
          }}
        >
          <div className="relative z-10 w-full p-6 sm:p-11">
            <div className="flex justify-between items-start gap-4">
              <div className="eyebrow text-[#FFD9CC]">
                {meta?.nearest_metro || 'Delhi NCR'} · Area Guide
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleBookmarkToggle}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-transform active:scale-90 ${
                    bookmarked ? 'bg-[#FF5A36] text-white' : 'bg-white/20 backdrop-blur-md text-white hover:bg-white/30'
                  }`}
                  title="Bookmark guide"
                >
                  <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-white' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 flex items-center justify-center transition-transform active:scale-90"
                  title="Share guide"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <h1 className="hd mt-3 text-3xl sm:text-5xl lg:text-7xl font-black leading-tight sm:leading-[0.96] max-w-4xl tracking-tight">
              {collection.title}
            </h1>
            <p className="mt-2.5 sm:mt-3.5 max-w-2xl text-sm sm:text-lg text-stone-100 leading-relaxed font-medium">
              {collection.description || 'Buzzing student adda, late-night waffles and pocket-friendly platters.'}
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================
          2. QUICK FACT BAR (MATCHES area_guide_template.html)
      ======================================================== */}
      <section className="max-w-[1280px] mx-auto -mt-4 sm:-mt-8 px-4 sm:px-8 relative z-20">
        <div className="bg-white border border-[#EFEAE2] rounded-[28px] shadow-[0_30px_60px_-34px_rgba(28,25,23,0.35)] p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-xs font-extrabold tracking-wider uppercase text-[#78716C]">
              Avg cost for two
            </div>
            <div className="hd mt-1 text-2xl font-bold text-[#D8350F]">
              ₹{meta?.avg_cost_for_two || 450}
            </div>
          </div>

          <div>
            <div className="text-xs font-extrabold tracking-wider uppercase text-[#78716C]">
              Best time to visit
            </div>
            <div className="hd mt-1 text-2xl font-bold text-[#1C1917]">
              {meta?.best_time_to_visit || '3:30 – 8:30 PM'}
            </div>
          </div>

          <div>
            <div className="text-xs font-extrabold tracking-wider uppercase text-[#78716C]">
              Famous for
            </div>
            <div className="hd mt-1 text-lg font-bold text-[#0F766E] line-clamp-2">
              {meta?.famous_for_summary || 'Monster shakes, kurkure momos, pink pasta, waffles'}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. VISITOR INTEL
      ======================================================== */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-8 pt-16">
        <div className="eyebrow text-[#0F766E]">Visitor intel</div>
        <h2 className="hd mt-2 text-3xl sm:text-5xl font-black text-[#1C1917]">
          Get there without the guesswork.
        </h2>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Metro Card */}
          <div className="lift bg-white border border-[#EFEAE2] rounded-[28px] p-7">
            <div className="w-12 h-12 rounded-2xl bg-[#E6F4F1] flex items-center justify-center text-[#0F766E] mb-5">
              <MapPin className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="hd text-xl font-bold text-[#1C1917]">Nearest metro</h3>
            <p className="mt-2 text-sm text-[#57534E] leading-relaxed">
              {meta?.nearest_metro || 'GTB Nagar Metro Station (Yellow Line), Exit Gate 3. A 2-minute e-rickshaw for ₹10.'}
            </p>
          </div>

          {/* Parking Card */}
          <div className="lift bg-white border border-[#EFEAE2] rounded-[28px] p-7">
            <div className="w-12 h-12 rounded-2xl bg-[#FFE9E2] flex items-center justify-center text-[#D8350F] mb-5">
              <Car className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="hd text-xl font-bold text-[#1C1917]">Parking & navigation</h3>
            <p className="mt-2 text-sm text-[#57534E] leading-relaxed">
              {meta?.parking_tips || 'Paid municipal lot near Kingsway Camp or park at metro station. Narrow lanes during peak evening hours.'}
            </p>
          </div>

          {/* Timing Card */}
          <div className="lift bg-white border border-[#EFEAE2] rounded-[28px] p-7">
            <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] flex items-center justify-center text-[#B45309] mb-5">
              <Clock className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="hd text-xl font-bold text-[#1C1917]">Best hours</h3>
            <p className="mt-2 text-sm text-[#57534E] leading-relaxed">
              4:00 PM – 9:00 PM for the buzzing campus vibe. Avoid 1:00 PM lunch rush if you want quiet seating.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================
          4. LOCALITY SIGNATURES
      ======================================================== */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-8 pt-16">
        <div className="eyebrow text-[#D8350F]">Locality signatures</div>
        <h2 className="hd mt-2 text-3xl sm:text-5xl font-black text-[#1C1917]">
          What this lane is famous for.
        </h2>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {famousDishes.map((dish, idx) => (
            <div
              key={idx}
              className="lift bg-white border border-[#EFEAE2] rounded-[28px] p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-3">
                  <h3 className="hd text-xl font-bold text-[#1C1917]">
                    {dish.name}
                  </h3>
                  <span className="hd text-2xl font-black text-[#D8350F] shrink-0">
                    ₹{dish.price}
                  </span>
                </div>
                <div className="mt-1 text-xs font-semibold text-[#0F766E]">
                  at {dish.restaurant_name}
                </div>
                {dish.why_famous && (
                  <p className="mt-3 text-xs sm:text-sm text-[#57534E] leading-relaxed">
                    {dish.why_famous}
                  </p>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-dashed border-[#E7E2DA] flex justify-between items-center text-xs font-bold text-stone-500">
                <span className="flex items-center gap-1 text-[#0F766E]">
                  <Check className="w-3.5 h-3.5" /> Verified counter price
                </span>
                <span className="text-[#FF5A36]">0% commission</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          5. CURATED 3-STOP FOOD CRAWL
      ======================================================== */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-8 pt-16">
        <div className="bg-[#14110F] text-white rounded-[44px] p-8 sm:p-14 relative overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(255,90,54,0.4),transparent_70%)] pointer-events-none"
          />

          <div className="relative z-10 max-w-2xl">
            <div className="eyebrow text-[#2DD4BF]">Curated 3-stop food crawl</div>
            <h2 className="hd mt-3 text-3xl sm:text-5xl font-extrabold text-white">
              One evening. Three counters. 210 metres.
            </h2>
            <p className="mt-3 text-base text-stone-300">
              Tested on foot. Start at 4:30 PM, follow the order, and end with iconic desserts under budget.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
            {crawlStops.map((stop, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-[28px] p-6 backdrop-blur-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-[#2DD4BF]">
                    <span>{stop.time}</span>
                    <span className="text-stone-400">{stop.distance_to_next}</span>
                  </div>
                  <h4 className="hd mt-2 text-xl font-bold text-white">
                    {stop.type}
                  </h4>
                  <div className="mt-2 text-sm font-semibold text-[#FF8A6B]">
                    Dish: {stop.recommended_dish}
                  </div>
                  <div className="mt-1 text-xs text-stone-400">
                    {stop.venue_name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          6. VERIFIED CAFES IN THIS AREA
      ======================================================== */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-8 pt-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="eyebrow text-[#D8350F]">Verified counters</div>
            <h2 className="hd mt-2 text-3xl sm:text-5xl font-black text-[#1C1917]">
              Explore cafes in {collection.title}
            </h2>
          </div>

          {/* Micro-Filter Chips */}
          <div className="flex flex-wrap gap-2">
            {['all', 'Pure Veg', 'Rooftops', 'Budget'].map((chip) => {
              const on = selectedSubGuide === chip;
              return (
                <button
                  key={chip}
                  onClick={() => setSelectedSubGuide(chip)}
                  className={`chipl text-xs ${on ? 'on' : ''}`}
                >
                  {chip === 'all' ? 'All Cafes' : chip}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cafes Grid */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
      </section>

      {/* Share Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-[#FFE9E2] text-[#D8350F] mx-auto flex items-center justify-center">
              <Share2 className="w-6 h-6" />
            </div>
            <h3 className="hd text-xl font-bold text-[#1C1917]">Share Area Guide</h3>
            <p className="text-xs text-[#78716C]">Send this verified food guide with famous dishes & trails to friends.</p>
            <div className="space-y-2 pt-2">
              <button
                onClick={copyShareLink}
                className="btn w-full bg-stone-100 text-[#1C1917] min-h-[44px] text-xs font-bold"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Guide Link
              </button>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `Check out the ${collection.title} on MenuMap! Verified menus, famous dishes & food crawls: ${window.location.href}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="btn w-full bg-[#0F766E] text-white min-h-[44px] text-xs font-bold"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Share on WhatsApp
              </a>
              <button
                onClick={() => setShareModalOpen(false)}
                className="btn w-full bg-transparent text-stone-500 min-h-[40px] text-xs"
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
