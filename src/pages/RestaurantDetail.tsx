import React, { useState, useEffect, useMemo } from 'react';
import { 
  Star, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Globe, 
  Bookmark, 
  Navigation, 
  Clock, 
  CheckCircle2, 
  UtensilsCrossed, 
  ShieldAlert, 
  Heart, 
  Camera, 
  Share2, 
  Sparkles,
  Flame,
  ChevronRight,
  ArrowLeft,
  QrCode,
  Calendar,
  ShieldCheck,
  Search,
  Filter,
  ExternalLink,
  X,
  Users,
  Coffee,
  BookOpen,
  Moon,
  Landmark,
  Check,
  CheckCircle,
  Plus
} from 'lucide-react';
import { 
  Restaurant, 
  MenuCategory, 
  MenuItem, 
  Review, 
  RestaurantPhoto 
} from '../types/database';
import { api } from '../lib/supabase';
import { isBookmarked, toggleBookmark } from '../lib/bookmarks';
import { FoodItemCard } from '../components/FoodItemCard';
import { RestaurantCard } from '../components/RestaurantCard';
import { WhatsAppOrderDrawer, CartItem } from '../components/WhatsAppOrderDrawer';
import { DirectoryDisclaimer } from '../components/DirectoryDisclaimer';
import { RestaurantQrModal } from '../components/RestaurantQrModal';
import { TableReservationModal } from '../components/TableReservationModal';
import { SocialShareModal } from '../components/SocialShareModal';
import { ClaimRestaurantModal } from '../components/ClaimRestaurantModal';
import { updatePageSeo, buildRestaurantSchema } from '../lib/seo';
import { useToast } from '../components/Toast';

interface RestaurantDetailProps {
  slug: string;
  navigate: (path: string) => void;
}

type TabType = 'overview' | 'menu' | 'photos' | 'reviews';

export const RestaurantDetail: React.FC<RestaurantDetailProps> = ({ slug, navigate }) => {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [similarRestaurants, setSimilarRestaurants] = useState<Restaurant[]>([]);

  // Navigation tab
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('all');

  // Bookmarking
  const [bookmarked, setBookmarked] = useState(false);

  // WhatsApp Order Tray State
  const [cartMap, setCartMap] = useState<Record<string, number>>({});
  const [orderDrawerOpen, setOrderDrawerOpen] = useState(false);

  // Review Form modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewEmail, setReviewEmail] = useState('');
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // New High-Power Feature Modals
  const [showQrModal, setShowQrModal] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showGoogleReviewPrompt, setShowGoogleReviewPrompt] = useState(false);

  // Live In-Menu Search & Dietary Toggles
  const [menuSearch, setMenuSearch] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'non-veg' | 'bestseller' | 'chef' | 'spicy'>('all');

  useEffect(() => {
    loadRestaurantData();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      updatePageSeo({
        title: 'Menu Map – Real Menus, Cafes & Restaurant Discovery',
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

      // Log click
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

      // Automated Full SEO, Meta Tags & Schema.org Rich Result Indexing
      const pageUrl = `${window.location.origin}/${rest.slug}`;
      const restaurantSchema = buildRestaurantSchema(rest, cats, items, pageUrl);

      updatePageSeo({
        title: `${rest.name} Menu, Prices & Photos | ${rest.city} | Menu Map`,
        description: `Explore ${rest.name} in ${rest.city}. View live digital menu with verified prices, dish photos, address (${rest.address_line1}), opening timings, and 0% commission direct WhatsApp ordering.`,
        keywords: [
          rest.name,
          `${rest.name} menu`,
          `${rest.name} price list`,
          `${rest.name} ${rest.city}`,
          `${rest.city} cafes`,
          `${rest.city} restaurants`,
          'digital menu',
          'WhatsApp food order',
          'contactless dining',
          ...(rest.cuisine_types || []),
        ],
        canonicalUrl: pageUrl,
        ogImage: rest.cover_image_url,
        ogType: 'restaurant.restaurant',
        jsonLd: restaurantSchema,
      });

      // Find similar restaurants by cuisine, best_for_tags, and dining vibe
      const similar = allRests
        .filter((r) => r.id !== rest.id && (
          r.cuisine_types?.some((c) => rest.cuisine_types?.includes(c)) ||
          r.best_for_tags?.some((b) => rest.best_for_tags?.includes(b)) ||
          r.city === rest.city
        ))
        .slice(0, 4);
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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${restaurant?.name} on Menu Map`,
        text: restaurant?.short_description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Page link copied to clipboard!', 'success');
    }
  };

  const handleAddToCart = (item: MenuItem) => {
    setCartMap((prev) => {
      const current = prev[item.id] || 0;
      const next = { ...prev, [item.id]: current + 1 };
      return next;
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

  const handleClearCart = () => {
    setCartMap({});
    showToast('Order tray cleared.', 'info');
  };

  // Convert cartMap to CartItem array
  const cartList: CartItem[] = Object.entries(cartMap)
    .map(([itemId, quantity]) => {
      const item = menuItems.find((i) => i.id === itemId);
      return item ? { item, quantity } : null;
    })
    .filter(Boolean) as CartItem[];

  const cartTotalAmount = cartList.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);
  const cartTotalCount = cartList.reduce((sum, ci) => sum + ci.quantity, 0);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;
    if (!reviewText.trim()) {
      showToast('Please enter your review comments.', 'error');
      return;
    }
    setSubmittingReview(true);
    try {
      const created = await api.submitReview({
        restaurant_id: restaurant.id,
        user_name: reviewName.trim() || 'Food Explorer',
        user_email: reviewEmail.trim(),
        rating: reviewRating,
        review_text: reviewText.trim(),
      });
      setReviews((prev) => [created, ...prev]);
      setShowReviewModal(false);
      setReviewText('');
      setReviewName('');
      setReviewEmail('');
      showToast('Thank you! Your review has been published.', 'success');
      if (reviewRating >= 4) {
        setShowGoogleReviewPrompt(true);
      }
    } catch (e) {
      showToast('Could not submit review at this moment.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const mustTryDishes = useMemo(() => {
    if (!restaurant) return [];
    return menuItems.filter(
      (i) =>
        i.is_must_try ||
        i.is_featured ||
        (restaurant.known_for_dishes &&
          restaurant.known_for_dishes.some(
            (kd) =>
              kd.toLowerCase().includes(i.name.toLowerCase()) ||
              i.name.toLowerCase().includes(kd.toLowerCase())
          ))
    ).slice(0, 8);
  }, [menuItems, restaurant]);

  const goodForList = useMemo(() => {
    if (!restaurant) return [];
    return [
      { label: 'Good for Coffee', icon: '☕', isGood: Boolean(restaurant.best_for_tags?.includes('Coffee') || restaurant.cuisine_types?.some(c => /cafe|coffee/i.test(c))) },
      { label: 'Good for Studying', icon: '📚', isGood: Boolean(restaurant.best_for_tags?.includes('Studying') || restaurant.facilities?.some(f => /wifi|power|outlets/i.test(f))) },
      { label: 'Good for Date Night', icon: '💑', isGood: Boolean(restaurant.best_for_tags?.includes('Date Night') || restaurant.ambience_tags?.includes('Romantic & Intimate')) },
      { label: 'Good for Families', icon: '👨‍👩‍👧‍👦', isGood: Boolean(restaurant.dietary_options?.includes('Pure Veg') || restaurant.facilities?.some(f => /family|indoor/i.test(f))) },
      { label: 'Good for Groups', icon: '🎉', isGood: Boolean(restaurant.best_for_tags?.includes('Groups') || restaurant.facilities?.some(f => /party|spacious/i.test(f))) },
      { label: 'Good for Budget', icon: '💰', isGood: Boolean(restaurant.best_for_tags?.includes('Budget') || restaurant.average_cost_for_two <= 350) },
      { label: 'Good for Late Night', icon: '🌙', isGood: Boolean(restaurant.best_for_tags?.includes('Late Night') || restaurant.meal_types?.includes('Late Night')) },
      { label: 'Heritage Experience', icon: '🏛️', isGood: Boolean(restaurant.heritage_area || restaurant.best_for_tags?.includes('Traditional Food')) },
    ];
  }, [restaurant]);

  const ambiencePhotos = useMemo(() => {
    if (!restaurant) return [];
    return [
      restaurant.cover_image_url,
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=600&auto=format&fit=crop&q=80',
    ];
  }, [restaurant]);

  const occasionsList = useMemo(() => {
    if (!restaurant) return [];
    const list = [
      { name: 'Study Sessions & Assignments', icon: '📚', match: Boolean(restaurant.best_for_tags?.includes('Studying')), desc: 'Quiet corners, reliable Wi-Fi, and individual power sockets' },
      { name: 'Birthday & Group Celebrations', icon: '🎉', match: Boolean(restaurant.best_for_tags?.includes('Groups')), desc: 'Spacious seating, lively atmosphere, and sharing platters' },
      { name: 'First Date & Intimate Dining', icon: '🕯️', match: Boolean(restaurant.best_for_tags?.includes('Date Night')), desc: 'Intimate mood lighting, cozy tables, and artisan desserts' },
      { name: 'Family Lunch & Feasts', icon: '👨‍👩‍👧‍👦', match: Boolean(restaurant.facilities?.some(f => /family|indoor/i.test(f)) || restaurant.dietary_options?.includes('Pure Veg')), desc: 'Comfortable booth seating with wholesome thalis and gravies' },
      { name: 'Quick Solo Meal on the Go', icon: '⚡', match: Boolean(restaurant.facilities?.some(f => /takeout|quick/i.test(f))), desc: 'Fast counter service and pocket-friendly price points' },
      { name: 'Weekend Coffee Catchup & Brunch', icon: '☕', match: Boolean(restaurant.meal_types?.includes('Breakfast') || restaurant.cuisine_types?.includes('Cafe')), desc: 'Fresh morning waffles, pour-over coffees, and relaxed seating' },
    ];
    return list.filter(o => o.match);
  }, [restaurant]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-8 animate-pulse">
        <div className="h-80 bg-stone-200 rounded-3xl" />
        <div className="space-y-4">
          <div className="h-8 bg-stone-200 rounded w-1/3" />
          <div className="h-4 bg-stone-200 rounded w-1/4" />
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="font-heading font-extrabold text-2xl text-slate-800">
          Restaurant not found
        </h2>
        <p className="text-slate-500 text-sm">
          The place you are looking for might have been moved or removed.
        </p>
        <button
          onClick={() => navigate('/restaurants')}
          className="px-6 py-2.5 bg-rose-600 text-white font-bold rounded-2xl text-sm"
        >
          Browse All Restaurants
        </button>
      </div>
    );
  }

  const filteredMenuItems = menuItems.filter((i) => {
    // 1. Category filter
    if (selectedCategoryTab !== 'all' && i.category_id !== selectedCategoryTab) {
      return false;
    }
    // 2. Search query filter
    if (menuSearch.trim()) {
      const q = menuSearch.toLowerCase().trim();
      const matches = i.name.toLowerCase().includes(q) || (i.description && i.description.toLowerCase().includes(q));
      if (!matches) return false;
    }
    // 3. Dietary / Bestseller filter
    if (dietaryFilter === 'veg') {
      return i.dietary_tags.includes('Veg');
    }
    if (dietaryFilter === 'non-veg') {
      return i.dietary_tags.includes('Non-veg');
    }
    if (dietaryFilter === 'bestseller') {
      return i.is_featured || i.order_count > 50;
    }
    if (dietaryFilter === 'chef') {
      return i.is_featured;
    }
    if (dietaryFilter === 'spicy') {
      return i.spice_level > 2 || i.dietary_tags.includes('Spicy');
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
      
      {/* Back breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <button
          onClick={() => navigate('/restaurants')}
          className="hover:text-slate-800 flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Restaurants
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span>{restaurant.city}</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-slate-900 font-bold truncate">{restaurant.name}</span>
      </div>

      {/* Hero Visual Section: Cover image & Badges with Safe Margin & High Contrast */}
      <div className="relative rounded-3xl overflow-hidden shadow-lg border border-stone-200 bg-stone-950 min-h-[380px] sm:min-h-[440px] flex flex-col justify-between">
        <img
          src={restaurant.cover_image_url}
          alt={restaurant.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Subtle dark gradient overlay ensuring contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/30 pointer-events-none" />

        {/* Top Floating Action Bar with Safe Margins */}
        <div className="relative z-10 pt-4 sm:pt-5 px-4 sm:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {restaurant.is_temporarily_closed ? (
              <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/90 text-white shadow-sm backdrop-blur-md border border-white/20">
                Temporarily Closed
              </span>
            ) : restaurant.is_open ? (
              <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-black/40 text-emerald-400 shadow-sm backdrop-blur-md border border-white/20 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white">Open Now</span>
              </span>
            ) : (
              <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-black/40 text-stone-300 shadow-sm backdrop-blur-md border border-white/20">
                Closed
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowQrModal(true)}
              className="h-9 px-3 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-amber-300 border border-white/20 flex items-center gap-1.5 text-xs font-bold transition-all shadow-sm active:scale-95"
              title="Table QR Standee Generator"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table QR</span>
            </button>
            <button
              onClick={() => setShowSocialModal(true)}
              className="h-9 px-3 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white border border-white/20 flex items-center gap-1.5 text-xs font-bold transition-all shadow-sm active:scale-95"
              title="Social media & Instagram bio kit"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Promote</span>
            </button>
            <button
              onClick={handleBookmarkToggle}
              className={`h-9 px-3 rounded-full backdrop-blur-md border border-white/20 flex items-center gap-1.5 text-xs font-bold transition-all shadow-sm active:scale-95 ${
                bookmarked
                  ? 'bg-rose-500 text-white border-rose-400'
                  : 'bg-black/40 hover:bg-black/60 text-white'
              }`}
              title="Save restaurant"
            >
              <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-white' : ''}`} />
              <span>{bookmarked ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>

        {/* Bottom Info Grouped Inside Cover */}
        <div className="relative z-10 p-5 sm:p-7 text-white space-y-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            {restaurant.cuisine_types?.map((c) => (
              <span
                key={c}
                className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/10"
              >
                {c}
              </span>
            ))}
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-500/80 backdrop-blur-md text-white border border-orange-400/30">
              {restaurant.price_range} • ₹{restaurant.average_cost_for_two} for two
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-white tracking-tight leading-tight drop-shadow-md">
              {restaurant.name}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 backdrop-blur-md border border-amber-400/40 text-amber-300 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Verified Listing</span>
            </span>
          </div>

          <p className="text-xs sm:text-sm text-stone-200 flex items-center gap-1.5 leading-snug">
            <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="line-clamp-2">{restaurant.address_line1}, {restaurant.city}</span>
          </p>

          {/* Compact Rating Pill */}
          <div className="pt-1 flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-xs font-bold text-amber-300">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{restaurant.rating_avg.toFixed(1)}</span>
              <span className="text-stone-300 font-normal">({restaurant.rating_count} reviews)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Prominent "Best For" Quick Identification Badges */}
      {restaurant.best_for_tags && restaurant.best_for_tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400 mr-1">
            Best For:
          </span>
          {restaurant.best_for_tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-gradient-to-r from-orange-50 to-amber-50 text-orange-900 border border-orange-200/90 shadow-2xs"
            >
              {tag === 'Studying' && '📚'}
              {tag === 'Date Night' && '💑'}
              {tag === 'Groups' && '👥'}
              {tag === 'Budget' && '💸'}
              {tag === 'Coffee' && '☕'}
              {tag === 'Breakfast' && '🥞'}
              {tag === 'Late Night' && '🌙'}
              {tag === 'Traditional Food' && '🏛️'}
              {tag === 'Views' && '🌅'}
              <span>{tag}</span>
            </span>
          ))}
        </div>
      )}

      {/* Primary Actions & Consolidated CTAs */}
      <div className="space-y-3">
        {/* Prominent Primary Button: Order on WhatsApp */}
        {(restaurant.whatsapp_number || restaurant.phone) && (
          <button
            onClick={() => {
              if (cartTotalCount > 0) {
                setOrderDrawerOpen(true);
              } else {
                setActiveTab('menu');
                showToast('Select dishes from the menu to build your WhatsApp order tray!', 'info');
              }
            }}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm sm:text-base shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <MessageSquare className="w-5 h-5 fill-white shrink-0" />
            <span>
              {cartTotalCount > 0
                ? `View WhatsApp Order Tray (${cartTotalCount} items • ₹${cartTotalAmount})`
                : 'Order on WhatsApp (0% Commission)'}
            </span>
          </button>
        )}

        {/* Secondary Row: 4-Column Action Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* 1. Call */}
          {restaurant.phone ? (
            <a
              href={`tel:${restaurant.phone}`}
              className="h-11 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-slate-800 font-bold text-xs shadow-2xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">Call Place</span>
            </a>
          ) : (
            <div className="h-11 rounded-xl border border-dashed border-stone-200 bg-stone-50 text-slate-400 font-semibold text-xs flex items-center justify-center">
              No Direct Phone
            </div>
          )}

          {/* 2. Directions */}
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
            className="h-11 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-slate-800 font-bold text-xs shadow-2xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
          >
            <Navigation className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>Directions</span>
          </a>

          {/* 3. Book a Table */}
          <button
            onClick={() => setShowReservationModal(true)}
            className="h-11 rounded-xl border border-orange-200 bg-orange-50/70 hover:bg-orange-100 text-orange-900 font-bold text-xs shadow-2xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
          >
            <Calendar className="w-3.5 h-3.5 text-orange-600 shrink-0" />
            <span>Book Table</span>
          </button>

          {/* 4. Table QR Standee */}
          <button
            onClick={() => setShowQrModal(true)}
            className="h-11 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-amber-900 font-bold text-xs shadow-2xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
          >
            <QrCode className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>QR Standee</span>
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="border-b border-stone-200 py-3 my-2">
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar scrollbar-none pb-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`h-11 px-4 sm:px-5 rounded-xl font-extrabold text-xs sm:text-sm transition-all shrink-0 flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-white border border-stone-200/90 text-slate-700 hover:bg-stone-50'
            }`}
          >
            Overview & Info
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`h-11 px-4 sm:px-5 rounded-xl font-extrabold text-xs sm:text-sm transition-all shrink-0 flex items-center gap-2 ${
              activeTab === 'menu'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-white border border-stone-200/90 text-slate-700 hover:bg-stone-50'
            }`}
          >
            <span>Full Menu</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'menu' ? 'bg-white/20 text-white' : 'bg-stone-100 text-slate-600'
              }`}
            >
              {menuItems.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`h-11 px-4 sm:px-5 rounded-xl font-extrabold text-xs sm:text-sm transition-all shrink-0 flex items-center gap-2 ${
              activeTab === 'reviews'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-white border border-stone-200/90 text-slate-700 hover:bg-stone-50'
            }`}
          >
            <span>Reviews</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'reviews' ? 'bg-white/20 text-white' : 'bg-stone-100 text-slate-600'
              }`}
            >
              {reviews.length}
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            
            {/* 1. Distinct About Card with balanced line-height */}
            <div className="rounded-3xl bg-white shadow-xs p-6 border border-slate-200 space-y-3">
              <h2 className="font-heading font-extrabold text-xl text-slate-900">
                About {restaurant.name}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed whitespace-pre-line">
                {restaurant.long_description || restaurant.short_description}
              </p>

              {restaurant.known_for_dishes && restaurant.known_for_dishes.length > 0 && (
                <div className="pt-3 border-t border-stone-100 space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Known For Signature Flavours
                  </h3>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {restaurant.known_for_dishes.map((dish) => (
                      <span
                        key={dish}
                        className="px-3 py-1 bg-orange-50 border border-orange-200 text-orange-800 text-xs font-bold rounded-xl"
                      >
                        {dish}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Must-Try Dishes at Restaurant Name */}
            {mustTryDishes.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                    <h2 className="font-heading font-extrabold text-xl text-slate-900">
                      Must-Try Dishes at {restaurant.name}
                    </h2>
                  </div>
                  <button
                    onClick={() => setActiveTab('menu')}
                    className="text-xs font-bold text-orange-600 hover:text-orange-700"
                  >
                    View Full Menu ({menuItems.length}) →
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  Customer favorites and signature creations recommended by foodies who regularly dine here.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {mustTryDishes.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl border border-stone-200/90 hover:border-orange-300 bg-stone-50/50 hover:bg-white transition-all flex items-center justify-between gap-3 group"
                    >
                      <img
                        src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80'}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-sm text-slate-900 truncate">{item.name}</h4>
                          <span className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider">
                            Must-Try
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {item.description || 'Speciality house recipe'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-black text-slate-900">₹{item.price}</span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                            {item.dietary_tags?.[0] || 'Veg'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddToCart(item)}
                        className="p-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-xs shrink-0 active:scale-95 transition-transform"
                        title="Add to order tray"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Ambience & Vibe Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-teal-600" />
                  <h2 className="font-heading font-extrabold text-xl text-slate-900">
                    Ambience & Dining Vibe
                  </h2>
                </div>
              </div>

              {/* Ambience Badges */}
              <div className="flex flex-wrap gap-2">
                {(restaurant.ambience_tags && restaurant.ambience_tags.length > 0
                  ? restaurant.ambience_tags
                  : ['Cozy & Quiet', 'Lively & Social', 'Modern & Trendy']
                ).map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 rounded-xl bg-stone-100 border border-stone-200 text-slate-800 text-xs font-bold"
                  >
                    ✨ {tag}
                  </span>
                ))}
              </div>

              {/* Ambience Photo Showcase */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {ambiencePhotos.map((photoUrl, idx) => (
                  <div key={idx} className="relative aspect-4/3 rounded-2xl overflow-hidden shadow-2xs group">
                    <img
                      src={photoUrl}
                      alt={`${restaurant.name} dining seating ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                    <span className="absolute bottom-2 left-2 text-[10px] font-bold text-white">
                      {idx === 0 ? 'Main Dining Hall' : idx === 1 ? 'Seating Booths' : idx === 2 ? 'Interior Ambience' : 'Cozy Corner'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Perfect For Occasions */}
            {occasionsList.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  <h2 className="font-heading font-extrabold text-xl text-slate-900">
                    Perfect For These Occasions
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {occasionsList.map((occ) => (
                    <div
                      key={occ.name}
                      className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-start gap-3"
                    >
                      <span className="text-xl">{occ.icon}</span>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900">{occ.name}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{occ.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Nearby Attractions & Landmarks */}
            {restaurant.nearby_landmarks && restaurant.nearby_landmarks.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-rose-500" />
                  <h2 className="font-heading font-extrabold text-xl text-slate-900">
                    Nearby Landmarks & Location Context
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {restaurant.nearby_landmarks.map((landmark, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-100 text-xs font-semibold text-slate-700"
                    >
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{landmark}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Facilities & Features */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-4">
              <h2 className="font-heading font-extrabold text-xl text-slate-900">
                Facilities & Dining Amenities
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {restaurant.facilities?.map((f) => (
                  <div
                    key={f}
                    className="flex items-center gap-2 p-3 rounded-2xl bg-stone-50 border border-stone-100 text-xs font-bold text-slate-700"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              {restaurant.dietary_options && restaurant.dietary_options.length > 0 && (
                <div className="pt-4 border-t border-stone-100 space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Dietary Options
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {restaurant.dietary_options.map((opt) => (
                      <span
                        key={opt}
                        className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl"
                      >
                        {opt}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: Good For Info Box, Address & Timings */}
          <div className="space-y-6">
            
            {/* Good For Info Box */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-orange-500" />
                <h3 className="font-heading font-extrabold text-base text-slate-900">
                  Good For Checklist
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-2 text-xs">
                {goodForList.map((gf) => (
                  <div
                    key={gf.label}
                    className={`flex items-center justify-between p-2.5 rounded-xl border ${
                      gf.isGood
                        ? 'bg-emerald-50/60 border-emerald-200/80 text-emerald-900 font-bold'
                        : 'bg-stone-50 border-stone-100 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{gf.icon}</span>
                      <span>{gf.label}</span>
                    </div>
                    {gf.isGood ? (
                      <span className="text-emerald-700 text-xs font-extrabold">✓ Yes</span>
                    ) : (
                      <span className="text-slate-400 text-xs font-normal">—</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {/* Opening Hours */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" />
                <h3 className="font-heading font-extrabold text-base text-slate-900">
                  Opening Timings
                </h3>
              </div>

              <div className="space-y-2 text-xs divide-y divide-stone-100">
                {Object.entries(restaurant.opening_hours || {}).map(([day, hours]: any) => (
                  <div key={day} className="flex justify-between py-1.5 pt-2">
                    <span className="font-semibold text-slate-600">{day}</span>
                    <span className="font-bold text-slate-800">
                      {hours.is_closed ? (
                        <span className="text-rose-500">Closed</span>
                      ) : (
                        `${hours.open} – ${hours.close}`
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location & Map card */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-500" />
                <h3 className="font-heading font-extrabold text-base text-slate-900">
                  Address & Contact
                </h3>
              </div>

              <div className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
                <p className="font-bold text-slate-800">{restaurant.address_line1}</p>
                {restaurant.address_line2 && <p>{restaurant.address_line2}</p>}
                {restaurant.landmark && <p className="text-slate-500">Near: {restaurant.landmark}</p>}
                <p>
                  {restaurant.city}, {restaurant.state} - {restaurant.pincode}
                </p>
              </div>

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
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-800 font-bold text-xs transition-colors"
              >
                <Navigation className="w-3.5 h-3.5 text-rose-500" />
                <span>Open in Google Maps</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FULL MENU */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          {/* In-Menu Live Search & Dietary Filter Bar */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/90 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={`Search inside ${restaurant.name}'s menu (e.g. momos, burger, shake, biryani)...`}
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs sm:text-sm font-medium focus:outline-hidden focus:border-orange-500"
              />
              {menuSearch && (
                <button
                  onClick={() => setMenuSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Dietary Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setDietaryFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                  dietaryFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
                }`}
              >
                All Dishes ({filteredMenuItems.length})
              </button>
              <button
                onClick={() => setDietaryFilter('veg')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1 ${
                  dietaryFilter === 'veg'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>Pure Veg</span>
              </button>
              <button
                onClick={() => setDietaryFilter('non-veg')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1 ${
                  dietaryFilter === 'non-veg'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                <span>Non-Veg</span>
              </button>
              <button
                onClick={() => setDietaryFilter('bestseller')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1 ${
                  dietaryFilter === 'bestseller'
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                <Star className="w-3 h-3 fill-current" />
                <span>Bestsellers</span>
              </button>
              <button
                onClick={() => setDietaryFilter('chef')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1 ${
                  dietaryFilter === 'chef'
                    ? 'bg-orange-600 text-white shadow-2xs'
                    : 'bg-orange-50 text-orange-800 border border-orange-200 hover:bg-orange-100'
                }`}
              >
                <Flame className="w-3 h-3 text-orange-500" />
                <span>Chef's Special</span>
              </button>
              <button
                onClick={() => setDietaryFilter('spicy')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1 ${
                  dietaryFilter === 'spicy'
                    ? 'bg-red-600 text-white shadow-2xs'
                    : 'bg-red-50 text-red-800 border border-red-200 hover:bg-red-100'
                }`}
              >
                <span>🌶️ Spicy</span>
              </button>
            </div>
          </div>
          
          {/* Menu Categories Filter Pills */}
          {categories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategoryTab('all')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
                  selectedCategoryTab === 'all'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-white border border-stone-200 text-slate-700 hover:bg-stone-50'
                }`}
              >
                All Items ({menuItems.length})
              </button>
              {categories.map((cat) => {
                const count = menuItems.filter((i) => i.category_id === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryTab(cat.id)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
                      selectedCategoryTab === cat.id
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'bg-white border border-stone-200 text-slate-700 hover:bg-stone-50'
                    }`}
                  >
                    {cat.name} ({count})
                  </button>
                );
              })}
            </div>
          )}

          {/* Menu Items Grid */}
          {filteredMenuItems.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMenuItems.map((item) => (
                  <FoodItemCard
                    key={item.id}
                    item={item}
                    restaurant={restaurant}
                    navigate={navigate}
                    onAddToOrder={handleAddToCart}
                    orderQuantity={cartMap[item.id] || 0}
                  />
                ))}
              </div>

              {/* Menu Indicative Footnote */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
                <p className="flex items-center gap-1.5 leading-relaxed">
                  <span className="font-bold text-amber-700">* Notice:</span>
                  <span>Dishes, ingredients, and prices are indicative reference rates compiled from public domain listings. Final bills & seasonal availability are confirmed by {restaurant.name}.</span>
                </p>
                <span className="shrink-0 text-emerald-800 bg-white/90 px-3 py-1 rounded-full border border-emerald-300 font-bold text-[11px] self-start sm:self-auto">
                  0% Commission • Direct Venue Contact
                </span>
              </div>
            </>
          ) : (
            <div className="bg-stone-50 border border-stone-200 rounded-3xl p-12 text-center space-y-3">
              <UtensilsCrossed className="w-12 h-12 text-stone-400 mx-auto" />
              <h3 className="font-heading font-bold text-lg text-slate-800">
                No menu items in this category
              </h3>
              <p className="text-xs text-slate-500">
                Switch to "All Items" to view the full offering.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: REVIEWS */}
      {activeTab === 'reviews' && (
        <div className="space-y-8">
          
          {/* Reviews Summary Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6 text-center sm:text-left">
              <div>
                <div className="text-4xl sm:text-5xl font-heading font-black text-slate-900">
                  {restaurant.rating_avg.toFixed(1)}
                </div>
                <div className="flex items-center gap-1 justify-center sm:justify-start text-amber-400 mt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= Math.round(restaurant.rating_avg)
                          ? 'fill-amber-400'
                          : 'text-stone-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Based on {reviews.length} customer ratings
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowReviewModal(true)}
              className="px-6 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-500/20 active:scale-95 transition-all"
            >
              Write a Review
            </button>
          </div>

          {/* Reviews List */}
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-heading font-bold text-sm sm:text-base text-slate-900">
                        {rev.user_name}
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        {new Date(rev.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl text-xs font-bold text-amber-800">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{rev.rating}</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {rev.review_text}
                  </p>

                  {/* Owner Response */}
                  {rev.owner_response && (
                    <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200/80 text-xs space-y-1">
                      <div className="font-bold text-orange-900">Response from Owner:</div>
                      <p className="text-orange-800 leading-relaxed">{rev.owner_response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-stone-50 border border-stone-200 rounded-3xl p-12 text-center space-y-3">
              <MessageSquare className="w-12 h-12 text-stone-400 mx-auto" />
              <h3 className="font-heading font-bold text-lg text-slate-800">
                Be the first to review!
              </h3>
              <p className="text-xs text-slate-500">
                Have you dined at {restaurant.name}? Share your thoughts with fellow food lovers.
              </p>
              <button
                onClick={() => setShowReviewModal(true)}
                className="px-5 py-2.5 bg-rose-500 text-white font-bold rounded-2xl text-xs shadow-md"
              >
                Submit Review
              </button>
            </div>
          )}
        </div>
      )}

      {/* Review Modal Form (No login required) */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-stone-200">
            <div className="flex justify-between items-center pb-2 border-b border-stone-100">
              <h3 className="font-heading font-extrabold text-xl text-slate-900">
                Write a Review
              </h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Overall Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= reviewRating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">
                    {reviewRating} of 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  placeholder="e.g. Rahul Sharma or Anonymous"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email (Private, not shown publicly)
                </label>
                <input
                  type="email"
                  value={reviewEmail}
                  onChange={(e) => setReviewEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Review & Experience *
                </label>
                <textarea
                  required
                  rows={4}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="How was the food, service, seating vibe, and favorite dish?"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md transition-colors"
                >
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Take Restaurant Ownership Section */}
      {restaurant && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Restaurant Owner Portal</span>
            </div>
            <h3 className="font-heading font-black text-xl sm:text-2xl text-white">
              Do you own or manage {restaurant.name}?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Take official ownership of this digital menu to update dish prices, add new items, generate branded table QR standees, and take 0% commission direct WhatsApp orders.
            </p>
          </div>

          <button
            onClick={() => setShowClaimModal(true)}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0"
          >
            <ShieldCheck className="w-4 h-4 text-slate-950" />
            <span>Take Ownership of This Page</span>
          </button>
        </div>
      )}

      {/* Community Directory Transparency & Price Disclaimer */}
      {restaurant && (
        <div className="pt-4">
          <DirectoryDisclaimer
            restaurantName={restaurant.name}
            restaurantPhone={restaurant.phone || restaurant.whatsapp_number}
          />
        </div>
      )}

      {/* Similar Restaurants Section */}
      {similarRestaurants.length > 0 && (
        <div className="pt-10 border-t border-stone-200 space-y-6">
          <h2 className="font-heading font-extrabold text-2xl text-slate-900">
            Similar Cafes & Places You Might Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarRestaurants.map((sim) => (
              <RestaurantCard key={sim.id} restaurant={sim} navigate={navigate} />
            ))}
          </div>
        </div>
      )}

      {/* Floating Bottom WhatsApp Tray Bar */}
      {cartTotalCount > 0 && (
        <div className="fixed bottom-5 inset-x-4 sm:inset-x-auto sm:right-6 z-40 max-w-lg w-full animate-in slide-in-from-bottom duration-300">
          <div className="bg-slate-900 text-white rounded-3xl p-4 shadow-2xl border border-stone-700 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-black">
                  {cartTotalCount}
                </span>
                <span className="font-bold text-sm">₹{cartTotalAmount}</span>
              </div>
              <span className="text-[10px] text-stone-400">Order tray ready</span>
            </div>

            <button
              onClick={() => setOrderDrawerOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs shadow-md shadow-emerald-500/30 flex items-center gap-2 active:scale-95 transition-all"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>View Tray & Order</span>
            </button>
          </div>
        </div>
      )}

      {/* WhatsApp Order Drawer */}
      <WhatsAppOrderDrawer
        restaurant={restaurant}
        cart={cartList}
        onUpdateQuantity={handleUpdateQuantity}
        onClearCart={handleClearCart}
        isOpen={orderDrawerOpen}
        onClose={() => setOrderDrawerOpen(false)}
      />

      {/* Feature 2: Printable Table QR Standee Modal */}
      {restaurant && (
        <RestaurantQrModal
          restaurant={restaurant}
          isOpen={showQrModal}
          onClose={() => setShowQrModal(false)}
        />
      )}

      {/* Feature 3: Table Booking & Party Inquiry Modal */}
      {restaurant && (
        <TableReservationModal
          restaurant={restaurant}
          isOpen={showReservationModal}
          onClose={() => setShowReservationModal(false)}
        />
      )}

      {/* Feature 6: Social Media & Instagram Bio Kit Modal */}
      {restaurant && (
        <SocialShareModal
          restaurant={restaurant}
          isOpen={showSocialModal}
          onClose={() => setShowSocialModal(false)}
        />
      )}

      {/* Feature 7: Restaurant Ownership Claim Modal with Twilio Phone OTP */}
      {restaurant && (
        <ClaimRestaurantModal
          restaurant={restaurant}
          isOpen={showClaimModal}
          onClose={() => setShowClaimModal(false)}
          navigate={navigate}
        />
      )}

      {/* Feature 5: Google Review Booster Modal */}
      {showGoogleReviewPrompt && restaurant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
              <Star className="w-7 h-7 fill-amber-400" />
            </div>
            <h3 className="font-heading font-black text-xl text-slate-900">
              Share Praise on Google Maps?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Thank you for the high rating! Would you mind sharing this praise on <strong>{restaurant.name}</strong>'s official Google Maps profile as well? It helps this local cafe tremendously.
            </p>
            <div className="flex flex-col gap-2 pt-2">
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
                onClick={() => setShowGoogleReviewPrompt(false)}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                <span>⭐ Post on Google Maps Profile</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setShowGoogleReviewPrompt(false)}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-stone-100"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
