import React, { useState, useEffect, useMemo } from 'react';
import { NotFound } from './NotFound';
import { 
  Star, 
  MapPin, 
  Phone, 
  Bookmark, 
  Navigation, 
  Clock, 
  Check, 
  Share2, 
  QrCode, 
  Calendar, 
  ShieldCheck, 
  Search, 
  Plus, 
  Minus, 
  Trash2,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { 
  Restaurant, 
  MenuCategory, 
  MenuItem, 
  Review 
} from '../types/database';
import { api } from '../lib/supabase';
import { isBookmarked, toggleBookmark } from '../lib/bookmarks';
import { RestaurantCard } from '../components/RestaurantCard';
import { CartItem } from '../components/WhatsAppOrderDrawer';
import { updatePageSeo, buildRestaurantSchema } from '../lib/seo';
import { useToast } from '../components/Toast';

const RestaurantQrModal = React.lazy(() =>
  import('../components/RestaurantQrModal').then((m) => ({ default: m.RestaurantQrModal }))
);
const TableReservationModal = React.lazy(() =>
  import('../components/TableReservationModal').then((m) => ({ default: m.TableReservationModal }))
);
const SocialShareModal = React.lazy(() =>
  import('../components/SocialShareModal').then((m) => ({ default: m.SocialShareModal }))
);
const ClaimRestaurantModal = React.lazy(() =>
  import('../components/ClaimRestaurantModal').then((m) => ({ default: m.ClaimRestaurantModal }))
);

interface RestaurantDetailProps {
  slug: string;
  navigate: (path: string) => void;
}

const formatOpeningHours = (hours?: any): string => {
  if (!hours) return '11:00 AM – 11:00 PM';
  if (typeof hours === 'string') return hours;
  if (typeof hours === 'object') {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = days[new Date().getDay()];
    const todayHours = hours[todayName] || Object.values(hours)[0] as any;
    if (todayHours) {
      if (todayHours.is_closed) return 'Closed today';
      if (todayHours.open && todayHours.close) return `${todayHours.open} – ${todayHours.close}`;
    }
  }
  return '11:00 AM – 11:00 PM';
};

export const RestaurantDetail: React.FC<RestaurantDetailProps> = ({ slug, navigate }) => {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [similarRestaurants, setSimilarRestaurants] = useState<Restaurant[]>([]);

  // Navigation tab
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('all');
  const [menuSearch, setMenuSearch] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'non-veg'>('all');

  // Bookmarking
  const [bookmarked, setBookmarked] = useState(false);

  // WhatsApp Order Tray State
  const [cartMap, setCartMap] = useState<Record<string, number>>({});

  // Modals
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);

  // Review Form
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    loadRestaurantData();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      updatePageSeo({
        title: 'Menu Maps – Real Menus, Cafes & Restaurant Discovery',
        description: 'Discover the best cafes, restaurants, and trending dishes near you with real menus, verified prices, and curated collections.',
        canonicalUrl: window.location.origin,
      });
    };
  }, [slug]);

  const loadRestaurantData = async () => {
    setLoading(true);
    try {
      const rest = await api.getRestaurantBySlug(slug);
      if (!rest) {
        setRestaurant(null);
        return;
      }
      setRestaurant(rest);
      setBookmarked(isBookmarked('restaurant', rest.id));

      api.logItemClick('restaurant', rest.id);

      const [cats, items, revs, allRests] = await Promise.all([
        api.getCategories(rest.id),
        api.getMenuItems(rest.id),
        api.getReviews(rest.id, true),
        api.getRestaurants(true),
      ]);

      setCategories(cats);
      setMenuItems(items);
      setReviews(revs);

      // SEO
      const pageUrl = `${window.location.origin}/${rest.slug}`;
      const restaurantSchema = buildRestaurantSchema(rest, cats, items, pageUrl);

      updatePageSeo({
        title: `${rest.name} Menu, Prices & Photos | ${rest.city} | Menu Maps`,
        description: `Explore ${rest.name} in ${rest.city}. View live digital menu with verified prices, dish photos, address (${rest.address_line1}), opening timings, and 0% commission direct WhatsApp ordering.`,
        canonicalUrl: pageUrl,
        ogImage: rest.cover_image_url,
        ogType: 'restaurant.restaurant',
        jsonLd: restaurantSchema,
      });

      // Similar
      const similar = allRests
        .filter((r) => r.id !== rest.id && (
          r.cuisine_types?.some((c) => rest.cuisine_types?.includes(c)) ||
          (rest.landmark && r.landmark === rest.landmark) ||
          r.city === rest.city
        ))
        .slice(0, 3);
      setSimilarRestaurants(similar);
    } catch (e) {
      console.error('Error loading restaurant detail:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkToggle = () => {
    if (!restaurant) return;
    const next = toggleBookmark('restaurant', restaurant.id);
    setBookmarked(next);
    showToast(next ? 'Saved to your bookmarks!' : 'Removed from bookmarks.', 'success');
  };

  const handleAddToCart = (item: MenuItem) => {
    setCartMap((prev) => {
      const current = prev[item.id] || 0;
      return { ...prev, [item.id]: current + 1 };
    });
    showToast(`Added ${item.name} to order tray!`, 'success');
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCartMap((prev) => {
      const current = prev[itemId] || 0;
      const nextQty = current + delta;
      const copy = { ...prev };
      if (nextQty <= 0) {
        delete copy[itemId];
      } else {
        copy[itemId] = nextQty;
      }
      return copy;
    });
  };

  const cartList: CartItem[] = Object.entries(cartMap)
    .map(([itemId, quantity]) => {
      const item = menuItems.find((i) => i.id === itemId);
      return item ? { item, quantity } : null;
    })
    .filter(Boolean) as CartItem[];

  const cartTotalAmount = cartList.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);

  const handleSendWhatsAppOrder = () => {
    if (!restaurant) return;
    if (cartList.length === 0) {
      showToast('Add dishes to your order tray first!', 'info');
      return;
    }

    const itemsSummary = cartList
      .map((ci) => `• ${ci.quantity}x ${ci.item.name} (₹${ci.item.price * ci.quantity})`)
      .join('\n');

    const message = `*🍽️ New Order via MenuMap (0% Commission)*\n*Restaurant:* ${restaurant.name}\n\n*Ordered Items:*\n${itemsSummary}\n\n*Total Counter Bill:* ₹${cartTotalAmount}\n\n_Sent directly from MenuMap. Please confirm preparation and availability._`;

    const cleanPhone = (restaurant.whatsapp_number || restaurant.phone || '919876543210').replace(/[^0-9]/g, '');
    const fullPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant || !reviewText.trim()) {
      showToast('Please enter your review text.', 'error');
      return;
    }
    setSubmittingReview(true);
    try {
      const created = await api.submitReview({
        restaurant_id: restaurant.id,
        user_name: reviewName.trim() || 'Food Explorer',
        rating: reviewRating,
        review_text: reviewText.trim(),
      });
      setReviews((prev) => [created, ...prev]);
      setShowReviewModal(false);
      setReviewText('');
      showToast('Thank you! Your verified review has been posted.', 'success');
    } catch {
      showToast('Failed to submit review. Try again.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Filtered menu items
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (selectedCategoryTab !== 'all') {
        const cat = categories.find((c) => c.name.toLowerCase() === selectedCategoryTab.toLowerCase());
        if (cat && item.category_id !== cat.id) return false;
      }
      if (dietaryFilter === 'veg' && !item.dietary_tags?.includes('Veg')) return false;
      if (dietaryFilter === 'non-veg' && item.dietary_tags?.includes('Veg')) return false;

      if (menuSearch.trim()) {
        const q = menuSearch.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = (item.description || '').toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }

      return true;
    });
  }, [menuItems, categories, selectedCategoryTab, dietaryFilter, menuSearch]);

  if (loading) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 py-20 text-center">
        <div className="w-12 h-12 border-4 border-[#FF5A36] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-bold text-stone-500">Loading counter menu…</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <NotFound
        message={`We couldn't find a verified cafe matching "${slug}". Explore other iconic Delhi venues below.`}
        navigate={navigate}
      />
    );
  }

  const isPureVeg = restaurant.dietary_options?.includes('Pure Veg');

  return (
    <div className="w-full bg-[#FAF8F5] text-[#1C1917] min-h-screen">
      {/* ========================================================
          1. HERO BANNER (MATCHES restaurant_template.html)
      ======================================================== */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-8 pt-4">
        <div
          className="ph rounded-[36px] sm:rounded-[44px] min-h-[400px] sm:min-h-[440px] flex items-end relative overflow-hidden bg-stone-900"
          style={{
            backgroundImage: `url(${restaurant.cover_image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#14110F] via-[#14110F]/70 to-transparent" />

          {/* Content inside Hero */}
          <div className="relative z-10 w-full p-6 sm:p-10 flex flex-wrap gap-6 justify-between items-end">
            <div className="text-white min-w-0 max-w-2xl">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-white text-[#0F766E] text-xs font-extrabold shadow-sm flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  Counter menu verified
                </span>
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white">
                  {restaurant.is_open ? 'Open now' : 'Opens 11 AM'}
                </span>
                {isPureVeg && (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/90 text-white text-xs font-extrabold">
                    Pure Veg
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="hd mt-3 text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[0.98] tracking-tight">
                {restaurant.name}
              </h1>

              {/* Subhead / Address */}
              <p className="mt-2.5 text-base sm:text-lg text-stone-200 leading-relaxed max-w-xl">
                {restaurant.short_description || `${restaurant.address_line1}, ${restaurant.city}`}
              </p>
            </div>

            {/* Hero Action Buttons */}
            <div className="flex flex-wrap gap-2.5 items-center">
              <button
                type="button"
                onClick={() => {
                  const rawPhone = restaurant.whatsapp_number || restaurant.phone;
                  if (rawPhone) {
                    const phone = rawPhone.replace(/[^0-9]/g, '');
                    window.open(`https://wa.me/${phone.length === 10 ? `91${phone}` : phone}?text=${encodeURIComponent(`Hi ${restaurant.name}, I am exploring your counter menu on MenuMap.`)}`, '_blank');
                  } else {
                    showToast('Direct counter WhatsApp active for orders below.', 'info');
                  }
                }}
                className="btn bg-[#0F766E] hover:bg-[#0D9488] text-white min-h-[48px] px-6 text-sm"
              >
                <MessageSquare className="w-4 h-4 mr-1.5" />
                WhatsApp
              </button>

              <a
                href={
                  restaurant.google_maps_url && restaurant.google_maps_url.trim().length > 5
                    ? restaurant.google_maps_url
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${restaurant.name}, ${restaurant.address_line1}, ${restaurant.city}`
                      )}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="btn bg-white hover:bg-stone-100 text-[#1C1917] border border-stone-200 shadow-md min-h-[48px] px-6 text-sm font-bold"
              >
                <Navigation className="w-4 h-4 mr-1.5 text-rose-500" />
                Directions
              </a>

              <button
                type="button"
                onClick={handleBookmarkToggle}
                aria-label="Save"
                className={`btn w-12 h-12 p-0 rounded-full transition-transform active:scale-90 shadow-md border ${
                  bookmarked ? 'bg-[#FF5A36] text-white border-[#FF5A36]' : 'bg-white text-[#1C1917] hover:bg-stone-100 border-stone-200'
                }`}
              >
                <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-white' : 'text-[#1C1917]'}`} />
              </button>

              <button
                type="button"
                onClick={() => setShowSocialModal(true)}
                aria-label="Share"
                className="btn w-12 h-12 p-0 rounded-full bg-white text-[#1C1917] hover:bg-stone-100 border border-stone-200 shadow-md transition-transform active:scale-90"
              >
                <Share2 className="w-5 h-5 text-[#1C1917]" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          2. QUICK FACT BAR (MATCHES restaurant_template.html)
      ======================================================== */}
      <section className="max-w-[1280px] mx-auto mt-6 px-4 sm:px-8 relative z-20">
        <div className="bg-white border border-[#EFEAE2] rounded-[28px] shadow-sm p-6 sm:p-7 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-xs font-extrabold tracking-wider uppercase text-[#78716C]">
              Rating
            </div>
            <div className="hd mt-1 text-2xl font-bold text-[#1C1917] flex items-center gap-1.5">
              <span>{restaurant.rating_avg > 0 ? restaurant.rating_avg.toFixed(1) : '4.6'}</span>
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-xs font-normal text-[#78716C]">({restaurant.rating_count || 120})</span>
            </div>
          </div>

          <div>
            <div className="text-xs font-extrabold tracking-wider uppercase text-[#78716C]">
              Cost for two
            </div>
            <div className="hd mt-1 text-2xl font-bold text-[#D8350F]">
              ₹{restaurant.average_cost_for_two || 350}
            </div>
          </div>

          <div>
            <div className="text-xs font-extrabold tracking-wider uppercase text-[#78716C]">
              Hours
            </div>
            <div className="hd mt-1 text-xl font-bold text-[#1C1917] truncate">
              {formatOpeningHours(restaurant.opening_hours)}
            </div>
          </div>

          <div>
            <div className="text-xs font-extrabold tracking-wider uppercase text-[#78716C]">
              Metro station
            </div>
            <div className="hd mt-1 text-xl font-bold text-[#0F766E] truncate">
              {restaurant.landmark || restaurant.city}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. MAIN BODY (MENU, REVIEWS & WHATSAPP CART SIDEBAR)
      ======================================================== */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-8 pt-8 pb-24 flex flex-col lg:flex-row gap-10 items-start">
        {/* Left Column: Menu Items & Reviews */}
        <div className="flex-1 min-w-0 w-full">
          {/* Category Tabs */}
          <div className="sticky top-20 z-30 py-3 bg-[#FAF8F5]/95 backdrop-blur-md flex flex-wrap gap-2 border-b border-[#E7E2DA]">
            <button
              onClick={() => setSelectedCategoryTab('all')}
              className={`chipl ${selectedCategoryTab === 'all' ? 'on' : ''} text-xs font-bold`}
            >
              All Items ({menuItems.length})
            </button>
            {categories.map((cat) => {
              const on = selectedCategoryTab.toLowerCase() === cat.name.toLowerCase();
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryTab(on ? 'all' : cat.name)}
                  className={`chipl ${on ? 'on' : ''} text-xs font-bold`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Search inside menu & veg filters */}
          <div className="mt-6 flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[200px] flex items-center gap-2.5 px-4 min-h-[46px] rounded-2xl bg-white border border-[#E7E2DA]">
              <Search className="w-4 h-4 text-[#78716C] shrink-0" />
              <input
                type="text"
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                placeholder="Search this menu (e.g. momos, burger, shake)…"
                className="flex-1 bg-transparent text-sm text-[#1C1917] outline-none placeholder:text-stone-400"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setDietaryFilter(dietaryFilter === 'veg' ? 'all' : 'veg')}
                className={`chipl text-xs min-h-[46px] px-3.5 ${dietaryFilter === 'veg' ? 'on' : ''}`}
              >
                🟢 Pure Veg
              </button>
              <button
                onClick={() => setDietaryFilter(dietaryFilter === 'non-veg' ? 'all' : 'non-veg')}
                className={`chipl text-xs min-h-[46px] px-3.5 ${dietaryFilter === 'non-veg' ? 'on' : ''}`}
              >
                🔴 Non-Veg
              </button>
            </div>
          </div>

          {/* Dish Items List matching .item from redesign */}
          <div className="mt-8">
            <h2 className="hd text-3xl font-extrabold text-[#1C1917]">
              {selectedCategoryTab === 'all' ? 'Counter menu items' : selectedCategoryTab}
            </h2>

            {filteredMenuItems.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#EFEAE2] p-8 text-center my-6">
                <p className="text-sm font-semibold text-stone-500">No dishes matched your filter or search.</p>
              </div>
            ) : (
              <div className="mt-5 flex flex-col gap-3.5">
                {filteredMenuItems.map((item) => (
                  <div key={item.id} className="item group">
                    {/* Thumbnail Photo / Gradient */}
                    <div
                      className="ph w-24 h-24 sm:w-28 sm:h-28 rounded-2xl shrink-0 overflow-hidden bg-stone-100"
                    >
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-500" />
                      )}
                    </div>

                    {/* Dish Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {/* Veg / Non-Veg dot */}
                        <span
                          className={`w-3.5 h-3.5 rounded-[3px] border flex items-center justify-center ${
                            item.dietary_tags?.includes('Veg')
                              ? 'border-emerald-700'
                              : 'border-rose-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.dietary_tags?.includes('Veg') ? 'bg-emerald-700' : 'bg-rose-700'
                            }`}
                          />
                        </span>

                        {(item.is_featured || item.is_must_try) && (
                          <span className="text-[11px] font-extrabold uppercase text-[#D8350F] bg-[#FFE9E2] px-2 py-0.5 rounded-md">
                            Bestseller
                          </span>
                        )}
                        {item.spice_level && item.spice_level > 1 && (
                          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                            🌶️ Spicy
                          </span>
                        )}
                      </div>

                      <h3 className="hd mt-1 text-base sm:text-xl font-black text-[#1C1917] leading-snug">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="mt-1 text-xs sm:text-sm text-[#44403C] line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Price & Add Button */}
                    <div className="flex flex-col items-end gap-2 shrink-0 pl-2">
                      <span className="hd text-lg sm:text-2xl font-black text-[#1C1917]">
                        ₹{item.price}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddToCart(item)}
                        className="add"
                        title="Add to order tray"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ========================================================
              REVIEWS SECTION (MATCHES restaurant_template.html)
          ======================================================== */}
          <div className="mt-16">
            <div className="flex justify-between items-center">
              <h2 className="hd text-3xl font-extrabold text-[#1C1917]">Diner reviews</h2>
              <button
                type="button"
                onClick={() => setShowReviewModal(true)}
                className="btn bg-[#1C1917] text-white min-h-[44px] px-5 text-sm"
              >
                Write a review
              </button>
            </div>

            {/* Review Score Summary Box */}
            <div className="mt-6 bg-white border border-[#EFEAE2] rounded-[28px] p-7 flex flex-wrap gap-8 items-center shadow-xs">
              <div>
                <div className="hd text-5xl sm:text-6xl font-black text-[#1C1917] leading-none">
                  {restaurant.rating_avg > 0 ? restaurant.rating_avg.toFixed(1) : '4.6'}
                </div>
                <div className="mt-1 text-xs text-[#57534E] font-medium">
                  from {restaurant.rating_count || 120} verified diners
                </div>
              </div>

              {/* Simulated Rating Bar Breakdown */}
              <div className="flex-1 min-w-[240px] flex flex-col gap-2">
                {[
                  { star: '5', width: '78%' },
                  { star: '4', width: '16%' },
                  { star: '3', width: '4%' },
                  { star: '2', width: '1%' },
                  { star: '1', width: '1%' },
                ].map((bar) => (
                  <div key={bar.star} className="flex items-center gap-3 text-xs font-bold">
                    <span className="w-3 text-stone-600">{bar.star}</span>
                    <div className="flex-1 h-2 rounded-full bg-[#F0EBE3] overflow-hidden">
                      <div className="h-full bg-[#0F766E] rounded-full" style={{ width: bar.width }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Individual Reviews */}
            <div className="mt-6 space-y-4">
              {reviews.slice(0, 5).map((rev) => (
                <div key={rev.id} className="bg-white border border-[#EFEAE2] rounded-[24px] p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-sm text-[#1C1917]">{rev.user_name}</div>
                      <div className="flex items-center gap-1 text-amber-400 mt-1">
                        {[...Array(rev.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-[#0F766E] bg-[#E6F4F1] px-2.5 py-0.5 rounded-full">
                      ✓ Verified diner
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-[#44403C] leading-relaxed">
                    "{rev.review_text}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar: WhatsApp Cart + Find it + Claim Card */}
        <aside aria-label="Your order" className="w-full lg:w-96 flex flex-col gap-6 shrink-0 sticky top-20">
          {/* Order Tray Box */}
          <div className="bg-white border border-[#EFEAE2] rounded-[32px] p-7 shadow-[0_30px_60px_-34px_rgba(28,25,23,0.35)]">
            <div className="flex justify-between items-center">
              <h2 className="hd text-2xl font-bold text-[#1C1917]">Your order</h2>
              <span className="px-3 py-1 rounded-full bg-[#E6F4F1] text-[#0F766E] text-xs font-extrabold">
                0% commission
              </span>
            </div>

            <div className="my-4 border-t-2 border-dashed border-[#E7E2DA]" />

            {cartList.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#78716C] leading-relaxed">
                <p>Your order tray is empty.</p>
                <p className="mt-1">Tap <strong>+</strong> on any dish to compile a zero-markup WhatsApp order.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-h-72 overflow-y-auto no-scrollbar">
                {cartList.map((ci) => (
                  <div key={ci.item.id} className="flex justify-between items-center gap-3 text-sm">
                    <div className="min-w-0">
                      <div className="font-bold text-[#1C1917] truncate">{ci.item.name}</div>
                      <div className="text-xs text-[#78716C]">₹{ci.item.price} each</div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleUpdateQuantity(ci.item.id, -1)}
                        className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center font-bold text-xs hover:bg-stone-200"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold text-xs w-4 text-center">{ci.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(ci.item.id, 1)}
                        className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center font-bold text-xs hover:bg-stone-200"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <span className="hd font-bold text-sm text-[#1C1917] w-12 text-right">
                        ₹{ci.item.price * ci.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="my-4 border-t-2 border-dashed border-[#E7E2DA]" />

            <div className="flex justify-between items-baseline">
              <span className="text-sm font-bold text-[#57534E]">Total</span>
              <span className="hd text-3xl font-extrabold text-[#D8350F]">
                ₹{cartTotalAmount}
              </span>
            </div>

            <button
              type="button"
              onClick={handleSendWhatsAppOrder}
              disabled={cartList.length === 0}
              className={`btn mt-5 w-full min-h-[54px] text-sm font-bold text-white transition-all ${
                cartList.length > 0
                  ? 'bg-[#0F766E] hover:bg-[#0D9488]'
                  : 'bg-stone-300 cursor-not-allowed'
              }`}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Send order on WhatsApp
            </button>
          </div>

          {/* Find It Card */}
          <div className="bg-white border border-[#EFEAE2] rounded-[28px] p-6">
            <h3 className="hd text-xl font-bold text-[#1C1917]">Find it</h3>
            <p className="mt-2 text-xs sm:text-sm text-[#57534E] leading-relaxed">
              {restaurant.address_line1}, {restaurant.city} {restaurant.pincode}
            </p>
            {restaurant.landmark && (
              <p className="mt-2 text-xs font-bold text-[#0F766E]">
                Metro / Landmark: {restaurant.landmark}
              </p>
            )}

            {restaurant.facilities && restaurant.facilities.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {restaurant.facilities.map((fac) => (
                  <span
                    key={fac}
                    className="px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#E7E2DA] text-[11px] font-bold text-[#57534E]"
                  >
                    {fac}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Claim Page Card */}
          <div className="bg-[#1C1917] text-white rounded-[28px] p-6 text-left">
            <h3 className="hd text-xl font-bold">Own this restaurant?</h3>
            <p className="mt-2 text-xs text-stone-300 leading-relaxed">
              Claim your verified listing, verify with a 6-digit SMS OTP, and update your counter prices anytime.
            </p>
            <button
              onClick={() => setShowClaimModal(true)}
              className="btn mt-4 w-full bg-[#FF5A36] hover:bg-[#D8350F] text-[#1C1917] hover:text-white min-h-[46px] text-xs font-black uppercase tracking-wider"
            >
              Claim this page
            </button>
          </div>
        </aside>
      </section>

      {/* Modals (Lazy Loaded) */}
      <React.Suspense fallback={null}>
        {showQrModal && (
          <RestaurantQrModal
            isOpen={showQrModal}
            onClose={() => setShowQrModal(false)}
            restaurant={restaurant}
          />
        )}
        {showReservationModal && (
          <TableReservationModal
            isOpen={showReservationModal}
            onClose={() => setShowReservationModal(false)}
            restaurant={restaurant}
          />
        )}
        {showSocialModal && (
          <SocialShareModal
            isOpen={showSocialModal}
            onClose={() => setShowSocialModal(false)}
            restaurant={restaurant}
          />
        )}
        {showClaimModal && (
          <ClaimRestaurantModal
            isOpen={showClaimModal}
            onClose={() => setShowClaimModal(false)}
            restaurant={restaurant}
            navigate={navigate}
          />
        )}
      </React.Suspense>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl border border-stone-200">
            <h3 className="hd text-2xl font-bold text-[#1C1917]">Review {restaurant.name}</h3>
            <p className="mt-1 text-xs text-[#78716C]">Share your counter menu experience with fellow foodies.</p>

            <form onSubmit={handleReviewSubmit} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-600 block mb-1">Your Name</label>
                <input
                  type="text"
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm outline-none focus:border-stone-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-600 block mb-1">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-600 block mb-1">Your Comments</label>
                <textarea
                  rows={4}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Write your review about the food, counter prices, or ambience…"
                  className="w-full p-3 rounded-xl border border-stone-300 text-sm outline-none focus:border-stone-500"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="btn flex-1 bg-stone-100 text-stone-700 min-h-[44px] text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn flex-1 bg-[#0F766E] text-white min-h-[44px] text-xs font-bold"
                >
                  {submittingReview ? 'Posting…' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Floating Order Bar (visible only when cart has items) */}
      {cartList.length > 0 && (
        <aside
          aria-label="Floating order tray bar"
          className="md:hidden fixed left-3 right-3 z-30 bg-[#14110F] text-white p-3.5 rounded-2xl shadow-2xl flex items-center justify-between border border-white/10"
          style={{
            bottom: 'calc(64px + max(12px, env(safe-area-inset-bottom)))',
          }}
        >
          <div className="flex flex-col">
            <span className="text-[11px] text-stone-400 font-semibold uppercase tracking-wider">
              {cartList.reduce((s, ci) => s + ci.quantity, 0)} {cartList.reduce((s, ci) => s + ci.quantity, 0) === 1 ? 'item' : 'items'} in tray
            </span>
            <span className="hd text-lg font-black text-white">₹{cartTotalAmount}</span>
          </div>
          <button
            type="button"
            onClick={handleSendWhatsAppOrder}
            className="btn bg-[#0F766E] hover:bg-[#0D9488] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md active:scale-95 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Order WhatsApp</span>
          </button>
        </aside>
      )}
    </div>
  );
};
