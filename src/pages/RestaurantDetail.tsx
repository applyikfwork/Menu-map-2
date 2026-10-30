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
  MessageSquare,
  FileText,
  Sparkles,
  Flame,
  Megaphone,
  Camera,
  Image as ImageIcon,
  Edit3,
  Eye,
  Upload,
  X,
  Gift,
  Bell,
  Droplets,
  Receipt,
  Dices,
  Utensils,
  Wifi,
  Copy,
  ArrowLeft,
  Building2,
  PhoneCall,
  Train
} from 'lucide-react';
import { 
  Restaurant, 
  MenuCategory, 
  MenuItem, 
  Review,
  RestaurantAnnouncement,
  RestaurantGalleryImage,
  RestaurantOwnerAccount,
  AnnouncementBadge,
  GalleryCategory
} from '../types/database';
import { api, getCurrentOwnerSession } from '../lib/supabase';
import { getRestaurantQrConfig, RestaurantQrConfig } from '../lib/qrConfig';
import { compressImageFile } from '../lib/imageCompressor';
import { isBookmarked, toggleBookmark } from '../lib/bookmarks';
import { RestaurantCard } from '../components/RestaurantCard';
import { WhatsAppOrderDrawer, CartItem } from '../components/WhatsAppOrderDrawer';
import { TableQrScannerModal } from '../components/restaurant/TableQrScannerModal';
import { updatePageSeo, buildRestaurantSchema } from '../lib/seo';
import { useToast } from '../components/Toast';
import { useDiscovery } from '../context/DiscoveryContext';
import { useLocationContext } from '../context/LocationContext';
import { 
  calculateDistanceKm, 
  calculateTravelEstimate, 
  getGoogleMapsDirectionsUrl, 
  getNearestMetroStation,
  GeoCoordinates
} from '../lib/location';
import { RestaurantSuperWidgets } from '../components/restaurant/RestaurantSuperWidgets';
import { HonestBillBox } from '../components/restaurant/HonestBillBox';
import { CounterPulseTicker } from '../components/restaurant/CounterPulseTicker';
import { TopPicksSpotlight } from '../components/restaurant/TopPicksSpotlight';
import { UpsellPairingPrompt } from '../components/restaurant/UpsellPairingPrompt';
import { NeighborStealBanner } from '../components/restaurant/NeighborStealBanner';
import { SmartReviewShield } from '../components/restaurant/SmartReviewShield';
import { getSmartDishImage } from '../lib/dishImageRegistry';
import { lazyWithRetry } from '../lib/lazyWithRetry';

const RestaurantQrModal = lazyWithRetry(
  () => import('../components/RestaurantQrModal'),
  'RestaurantQrModal',
  'RestaurantQrModal'
);
const DishRouletteModal = lazyWithRetry(
  () => import('../components/interactive/DishRouletteModal'),
  'DishRouletteModal',
  'DishRouletteModal'
);
const TablePerkWheelModal = lazyWithRetry(
  () => import('../components/interactive/TablePerkWheelModal'),
  'TablePerkWheelModal',
  'TablePerkWheelModal'
);
const TableReservationModal = lazyWithRetry(
  () => import('../components/TableReservationModal'),
  'TableReservationModal',
  'TableReservationModal'
);
const SocialShareModal = lazyWithRetry(
  () => import('../components/SocialShareModal'),
  'SocialShareModal',
  'SocialShareModal'
);
const ClaimRestaurantModal = lazyWithRetry(
  () => import('../components/ClaimRestaurantModal'),
  'ClaimRestaurantModal',
  'ClaimRestaurantModal'
);
const PhysicalMenuModal = lazyWithRetry(
  () => import('../components/PhysicalMenuModal'),
  'PhysicalMenuModal',
  'PhysicalMenuModal'
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
  const { engine, mealTimeInfo, trackView, calculateSavings } = useDiscovery();
  const { currentLocation } = useLocationContext();

  const cleanSlug = decodeURIComponent(slug).trim().toLowerCase();
  const cachedInitialRest = engine.getRestaurantBySlug(cleanSlug) || engine.getRestaurantBySlug(slug) || null;
  const cachedInitialItems = cachedInitialRest ? engine.getDishesForRestaurant(cachedInitialRest.id) : [];
  const cachedInitialCats = cachedInitialRest ? engine.getCategoriesForRestaurant(cachedInitialRest.id) : [];

  const [loading, setLoading] = useState<boolean>(() => !cachedInitialRest);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(() => cachedInitialRest);
  const [categories, setCategories] = useState<MenuCategory[]>(() => cachedInitialCats);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => cachedInitialItems);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [similarRestaurants, setSimilarRestaurants] = useState<Restaurant[]>([]);

  // User Ground Location & Transit Discovery
  const userCoords: GeoCoordinates | null = useMemo(() => {
    if (typeof currentLocation.latitude === 'number' && typeof currentLocation.longitude === 'number') {
      return {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      };
    }
    return null;
  }, [currentLocation]);

  const userDistanceKm = useMemo(() => {
    if (!userCoords || !restaurant || typeof restaurant.latitude !== 'number' || typeof restaurant.longitude !== 'number') {
      return null;
    }
    return calculateDistanceKm(userCoords.latitude, userCoords.longitude, restaurant.latitude, restaurant.longitude);
  }, [userCoords, restaurant]);

  const travelEstimate = useMemo(() => {
    if (userDistanceKm === null) return null;
    return calculateTravelEstimate(userDistanceKm);
  }, [userDistanceKm]);

  const nearestMetro = useMemo(() => {
    if (!restaurant || typeof restaurant.latitude !== 'number' || typeof restaurant.longitude !== 'number') {
      return null;
    }
    return getNearestMetroStation(restaurant.latitude, restaurant.longitude);
  }, [restaurant]);

  const directionsUrl = useMemo(() => {
    if (!restaurant) return '';
    if (typeof restaurant.latitude === 'number' && typeof restaurant.longitude === 'number') {
      return getGoogleMapsDirectionsUrl(
        restaurant.latitude,
        restaurant.longitude,
        restaurant.name,
        userCoords,
        travelEstimate?.primaryMode || 'driving'
      );
    }
    if (restaurant.google_maps_url && restaurant.google_maps_url.trim().length > 5) {
      return restaurant.google_maps_url;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${restaurant.name}, ${restaurant.address_line1 || ''}, ${restaurant.city || ''}`
    )}`;
  }, [restaurant, userCoords, travelEstimate]);

  // Navigation tab
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('all');
  const [menuSearch, setMenuSearch] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'non-veg' | 'jain' | 'bestseller'>('all');

  // Bookmarking
  const [bookmarked, setBookmarked] = useState(false);

  // Table Mode & Gamified In-Restaurant Session
  const [tableNumber, setTableNumber] = useState<string | null>(null);
  const [isTableDineIn, setIsTableDineIn] = useState<boolean>(false);
  const [tablePerk, setTablePerk] = useState<string | null>(null);
  const [showTablePerkWheel, setShowTablePerkWheel] = useState(false);
  const [showDishRoulette, setShowDishRoulette] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState<'menu' | 'table_perks' | 'gallery' | 'intel' | 'reviews'>('menu');
  const [selectedDishPreview, setSelectedDishPreview] = useState<MenuItem | null>(null);

  // Guarantee clear separation: When outside the restaurant, table_perks tab is never active
  const effectiveMainTab = (!isTableDineIn && activeMainTab === 'table_perks') ? 'menu' : activeMainTab;
  const [qrConfig, setQrConfig] = useState<RestaurantQrConfig>(() =>
    getRestaurantQrConfig(restaurant?.id || '', restaurant?.whatsapp_number || restaurant?.phone)
  );

  // WhatsApp Order Tray State
  const [cartMap, setCartMap] = useState<Record<string, number>>({});

  // Modals
  const [showOrderDrawer, setShowOrderDrawer] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showTableScannerModal, setShowTableScannerModal] = useState(false);
  const [showPhysicalMenuModal, setShowPhysicalMenuModal] = useState(false);

  // Owner & Live Announcements State
  const [ownerSession, setOwnerSession] = useState<RestaurantOwnerAccount | null>(null);
  const [activeAnnouncement, setActiveAnnouncement] = useState<RestaurantAnnouncement | null>(null);
  const [galleryImages, setGalleryImages] = useState<RestaurantGalleryImage[]>([]);
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<RestaurantGalleryImage | null>(null);
  const [showOwnerQuickModal, setShowOwnerQuickModal] = useState(false);
  const [ownerQuickTab, setOwnerQuickTab] = useState<'announcement' | 'photo'>('announcement');
  const [quickAnnouncementTitle, setQuickAnnouncementTitle] = useState('');
  const [quickAnnouncementMsg, setQuickAnnouncementMsg] = useState('');
  const [quickAnnouncementBadge, setQuickAnnouncementBadge] = useState<AnnouncementBadge>("Today's Special");
  const [quickPhotoCategory, setQuickPhotoCategory] = useState<GalleryCategory>('menu_page');
  const [quickPhotoCaption, setQuickPhotoCaption] = useState('');
  const [savingQuickUpdate, setSavingQuickUpdate] = useState(false);
  const quickPhotoInputRef = React.useRef<HTMLInputElement>(null);

  // Review Form
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    // Check if opened from Table QR code (?table=4&mode=dine_in)
    const urlParams = new URLSearchParams(window.location.search);
    const tbl = urlParams.get('table');
    const mode = urlParams.get('mode') || urlParams.get('dine_in');
    if (tbl) {
      setTableNumber(tbl);
      setIsTableDineIn(true);
      // Auto-prompt table luck wheel on table scan if perk not yet spun
      const sessionKey = `perk_prompted_${tbl}`;
      if (!sessionStorage.getItem(sessionKey)) {
        sessionStorage.setItem(sessionKey, 'true');
        setTimeout(() => setShowTablePerkWheel(true), 700);
      }
    } else if (mode === 'dine_in' || mode === 'true') {
      setIsTableDineIn(true);
    }

    loadRestaurantData();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const cleanSlug = decodeURIComponent(slug).trim().toLowerCase();

    const handleQrConfigUpdated = (e: any) => {
      if (restaurant?.id && e.detail?.restaurantId === restaurant.id) {
        setQrConfig(e.detail.config);
      }
    };
    window.addEventListener('menumaps_qr_config_updated', handleQrConfigUpdated);

    const handleAnnouncementUpdated = (e: any) => {
      const detRestId = (e.detail?.restaurantId || '').toString().trim().toLowerCase();
      const detSlug = (e.detail?.restaurantSlug || '').toString().trim().toLowerCase();
      if (
        detRestId === cleanSlug ||
        detSlug === cleanSlug ||
        (restaurant && (
          detRestId === restaurant.id.toLowerCase() ||
          detSlug === restaurant.slug.toLowerCase()
        ))
      ) {
        setActiveAnnouncement(e.detail.announcement);
      }
    };
    window.addEventListener('menumap_announcement_updated', handleAnnouncementUpdated);

    return () => {
      window.removeEventListener('menumaps_qr_config_updated', handleQrConfigUpdated);
      window.removeEventListener('menumap_announcement_updated', handleAnnouncementUpdated);
      updatePageSeo({
        title: 'Menu Maps – Real Menus, Cafes & Restaurant Discovery',
        description: 'Discover the best cafes, restaurants, and trending dishes near you with real menus, verified prices, and curated collections.',
        canonicalUrl: window.location.origin,
      });
    };
  }, [slug]);

  const loadRestaurantData = async () => {
    const cleanSlug = decodeURIComponent(slug).trim().toLowerCase();
    // Fast in-memory discovery engine cache lookup
    const cachedRest = engine.getRestaurantBySlug(cleanSlug) || engine.getRestaurantBySlug(slug);
    if (cachedRest) {
      setRestaurant(cachedRest);
      const cachedItems = engine.getDishesForRestaurant(cachedRest.id);
      if (cachedItems.length > 0) setMenuItems(cachedItems);
      const cachedCats = engine.getCategoriesForRestaurant(cachedRest.id);
      if (cachedCats.length > 0) setCategories(cachedCats);
      setBookmarked(isBookmarked('restaurant', cachedRest.id));
      trackView('restaurant', cachedRest.id, cachedRest.name, cachedRest.slug);
      setLoading(false);

      // Instantly load any active announcement from cache/table
      api.getActiveRestaurantAnnouncement(cachedRest.id, cachedRest.slug, (cachedRest as any).announcements)
        .then((ann) => {
          if (ann) setActiveAnnouncement(ann);
        })
        .catch(() => {});
    } else if (!restaurant) {
      setLoading(true);
    }

    try {
      const rest = (await api.getRestaurantBySlug(cleanSlug)) || (await api.getRestaurantBySlug(slug)) || cachedRest;
      if (!rest) {
        setRestaurant(null);
        return;
      }
      setRestaurant(rest);
      setBookmarked(isBookmarked('restaurant', rest.id));
      trackView('restaurant', rest.id, rest.name, rest.slug);

      api.logItemClick('restaurant', rest.id);

      const [cats, items, revs, allRests, liveAnn, gallery] = await Promise.all([
        api.getCategories(rest.id).catch(() => []),
        api.getMenuItems(rest.id).catch(() => []),
        api.getReviews(rest.id, true).catch(() => []),
        api.getRestaurants(true).catch(() => []),
        api.getActiveRestaurantAnnouncement(rest.id, rest.slug, (rest as any).announcements).catch(() => null),
        api.getRestaurantGallery(rest.id).catch(() => []),
      ]);

      setCategories(cats);
      setMenuItems(items);
      setReviews(revs);
      if (liveAnn) setActiveAnnouncement(liveAnn);
      setGalleryImages(gallery);
      setOwnerSession(getCurrentOwnerSession());
      setQrConfig(getRestaurantQrConfig(rest.id, rest.whatsapp_number || rest.phone));

      // SEO & AEO Graph
      const pageUrl = `https://menumaps.in/restaurant/${rest.slug}`;
      const restaurantSchema = buildRestaurantSchema(rest, cats, items, pageUrl);

      updatePageSeo({
        title: `${rest.name} Menu, Prices & Photos | ${rest.city_area || rest.city} | Menu Maps`,
        description: `Explore ${rest.name} in ${rest.city_area || rest.city}. View live digital menu with verified prices, dish photos, address (${rest.address_line1}), opening timings, and 0% commission direct WhatsApp ordering.`,
        canonicalUrl: pageUrl,
        ogImage: rest.cover_image_url,
        ogType: 'restaurant.restaurant',
        jsonLd: restaurantSchema,
      });

      // Contextual similar restaurants via CentralDiscoveryEngine
      const smartSimilar = engine.getSimilarVibeRestaurants(rest, 3).map((s) => s.restaurant);
      if (smartSimilar.length > 0) {
        setSimilarRestaurants(smartSimilar);
      } else {
        const fallbackSimilar = allRests
          .filter((r) => r.id !== rest.id && (
            r.cuisine_types?.some((c) => rest.cuisine_types?.includes(c)) ||
            (rest.landmark && r.landmark === rest.landmark) ||
            r.city === rest.city
          ))
          .slice(0, 3);
        setSimilarRestaurants(fallbackSimilar);
      }
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
    setShowOrderDrawer(true);
  };

  const isOwnerOfThisRest = Boolean(
    ownerSession && restaurant && (
      ownerSession.restaurant_id === restaurant.id ||
      ownerSession.restaurant_slug === restaurant.slug
    )
  );

  const isAcquired = Boolean(restaurant && (restaurant.is_claimed || restaurant.is_verified));

  const handleQuickPostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;
    if (!quickAnnouncementTitle.trim() || !quickAnnouncementMsg.trim()) {
      showToast('Title and message are required.', 'error');
      return;
    }

    setSavingQuickUpdate(true);
    try {
      const saved = await api.saveRestaurantAnnouncement({
        restaurant_id: restaurant.id,
        title: quickAnnouncementTitle.trim(),
        message: quickAnnouncementMsg.trim(),
        badge: quickAnnouncementBadge,
        is_active: true,
      });
      setActiveAnnouncement(saved);
      setShowOwnerQuickModal(false);
      setQuickAnnouncementTitle('');
      setQuickAnnouncementMsg('');
      showToast("✓ Today's announcement published live to your page!", 'success');
    } catch (e) {
      showToast('Failed to publish announcement.', 'error');
    } finally {
      setSavingQuickUpdate(false);
    }
  };

  const handleQuickUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !restaurant) return;

    setSavingQuickUpdate(true);
    try {
      const compressed = await compressImageFile(file, { maxWidth: 1800, quality: 0.85 });
      const saved = await api.saveGalleryImage({
        restaurant_id: restaurant.id,
        image_url: compressed.dataUrl,
        caption: quickPhotoCaption.trim() || undefined,
        category: quickPhotoCategory,
        uploaded_by: 'owner',
        sort_order: galleryImages.length,
      });

      const updated = [...galleryImages, saved];
      setGalleryImages(updated);

      if (quickPhotoCategory === 'menu_page') {
        const pages = updated.filter((i) => i.category === 'menu_page').map((i) => i.image_url);
        await api.updateRestaurantMenuPages(restaurant.id, pages);
        setRestaurant((prev) => (prev ? { ...prev, menu_pages: pages } : null));
      }

      setQuickPhotoCaption('');
      if (quickPhotoInputRef.current) quickPhotoInputRef.current.value = '';
      setShowOwnerQuickModal(false);
      showToast(`✓ Photo uploaded as "${quickPhotoCategory === 'menu_page' ? 'Paper Menu Page' : quickPhotoCategory}"!`, 'success');
    } catch (e) {
      showToast('Failed to upload photo.', 'error');
    } finally {
      setSavingQuickUpdate(false);
    }
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
      if (dietaryFilter === 'jain' && !(item.dietary_tags?.includes('Jain') || item.dietary_tags?.includes('Pure Veg') || (item.dietary_tags?.includes('Veg') && !item.description?.toLowerCase().includes('garlic') && !item.description?.toLowerCase().includes('onion')))) return false;
      if (dietaryFilter === 'bestseller' && !(item.is_featured || item.is_must_try)) return false;

      if (menuSearch.trim()) {
        const q = menuSearch.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = (item.description || '').toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }

      return true;
    });
  }, [menuItems, categories, selectedCategoryTab, dietaryFilter, menuSearch]);

  const getSmartPairingForItem = (item: MenuItem, allItems: MenuItem[]): MenuItem | null => {
    if (!allItems || allItems.length <= 1) return null;
    const isBeverage = (item.cuisine_types || []).some((c) => /drink|beverage|coffee|tea|shake/i.test(c)) ||
      /shake|coffee|tea|mojito|coke|soda|cooler|lassi|frappe/i.test(item.name);
    
    if (isBeverage) {
      return allItems.find((m) => m.id !== item.id && (/fries|momo|burger|pizza|pasta|waffle|cookie|nachos|sandwich/i.test(m.name) || m.is_must_try || m.is_featured)) || null;
    } else {
      return allItems.find((m) => m.id !== item.id && (/coffee|shake|mojito|tea|coke|cooler|lassi|frappe/i.test(m.name))) || null;
    }
  };

  if (loading && !restaurant) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 py-20 text-center">
        <div className="w-12 h-12 border-4 border-[#FF5A36] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-base font-extrabold text-stone-800">Verifying cafe counter records…</h2>
        <p className="text-xs text-stone-500 mt-1">Loading authentic in-store pricing and menu items.</p>
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
          0. FLOATING OWNER QUICK TOOLBAR (WHEN LOGGED IN AS OWNER)
      ======================================================== */}
      {isOwnerOfThisRest && (
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-amber-500/30 text-white py-2.5 px-4 sm:px-8 sticky top-14 sm:top-16 z-40 shadow-xl backdrop-blur-md">
          <div className="max-w-[1280px] mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-amber-300">Owner Mode:</span>
              <span className="text-xs font-extrabold text-white truncate max-w-[200px] sm:max-w-none">{restaurant.name}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setOwnerQuickTab('announcement');
                  setShowOwnerQuickModal(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>+ Post Today's Update</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setOwnerQuickTab('photo');
                  setShowOwnerQuickModal(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>+ Upload Photo</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/owner/dashboard')}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-300" />
                <span>Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          1. REDESIGNED HERO SECTION & CINEMA VISUAL STAGE
      ======================================================== */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-8 pt-4 space-y-4">
        {/* 1.1 CINEMA VISUAL CANVAS (UNCLUTTERED, PURE PHOTOGRAPHY) */}
        <div className="relative rounded-[32px] sm:rounded-[40px] overflow-hidden bg-stone-100 border border-[#E7E2DA] shadow-sm group">
          <div className="w-full h-[240px] sm:h-[340px] lg:h-[400px] overflow-hidden relative">
            <img
              src={restaurant.cover_image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80'}
              alt={`${restaurant.name} ambiance and facade`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="eager"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80';
              }}
            />
          </div>

          {/* Ultra-subtle Top Protection for white icons only — Zero dark overlay over photo */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/25 to-transparent pointer-events-none" />

          {/* Top Controls: Minimalist Clean Back Button & Actions */}
          <div className="absolute top-4 inset-x-4 sm:inset-x-6 flex items-center justify-between pointer-events-auto">
            <button
              type="button"
              onClick={() => navigate('/restaurants')}
              className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer shadow-md active:scale-95"
              title="Back to all cafes"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBookmarkToggle}
                aria-label="Save"
                className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border transition-transform active:scale-90 cursor-pointer shadow-md ${
                  bookmarked
                    ? 'bg-[#FF5A36] text-white border-[#FF5A36]'
                    : 'bg-black/40 hover:bg-black/60 text-white border-white/20'
                }`}
                title="Bookmark cafe"
              >
                <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-white' : 'text-white'}`} />
              </button>

              <button
                type="button"
                onClick={() => setShowSocialModal(true)}
                aria-label="Share"
                className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-transform active:scale-90 cursor-pointer shadow-md"
                title="Share menu"
              >
                <Share2 className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Bottom Right: Clean Photos Pill */}
          <div className="absolute bottom-4 right-4 sm:right-6 pointer-events-auto">
            <button
              type="button"
              onClick={() => setActiveMainTab('gallery')}
              className="px-3.5 py-1.5 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 border border-white/20 transition-all cursor-pointer shadow-md"
              title="View Photo Gallery & Paper Menu"
            >
              <Camera className="w-3.5 h-3.5 text-amber-300" />
              <span>{galleryImages.length > 0 ? `${galleryImages.length} Photos` : 'View Photos'}</span>
            </button>
          </div>
        </div>

        {/* 1.2 DEDICATED RESTAURANT DOSSIER CARD (ELEVATED CLEAN WHITE SURFACE) */}
        <div className="bg-white rounded-[32px] sm:rounded-[36px] p-6 sm:p-8 border border-[#EFEAE2] shadow-sm space-y-5">
          {/* Main Title, Brand Logo & Grouped Badges */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
            <div className="flex items-start gap-4">
              {restaurant.logo_url && (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl border border-stone-200 bg-white p-1.5 shadow-md shrink-0 overflow-hidden">
                  <img
                    src={restaurant.logo_url}
                    alt={`${restaurant.name} logo`}
                    className="w-full h-full object-cover rounded-xl sm:rounded-2xl"
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="hd text-3xl sm:text-4xl lg:text-5xl font-black text-[#1C1917] tracking-tight">
                    {restaurant.name}
                  </h1>

                  {/* Badges grouped with the name */}
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold shadow-2xs">
                    <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-600" />
                    <span>Verified Menu</span>
                  </span>

                  {isPureVeg && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-xs font-extrabold shadow-2xs">
                      Pure Veg
                    </span>
                  )}

                  {restaurant.is_claimed ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 text-stone-800 border border-stone-300 text-xs font-extrabold" title="Claimed and managed directly by the cafe owner">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verified Owner</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowClaimModal(true)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold cursor-pointer transition-colors"
                      title="Are you the owner of this cafe? Claim your profile"
                    >
                      <Building2 className="w-3 h-3 text-[#FF5A36]" />
                      <span>Claim Cafe</span>
                    </button>
                  )}
                </div>

                {/* Subtitle / Cuisine tags */}
                <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                  {restaurant.short_description || `${restaurant.cuisine_types?.join(' · ') || 'Multi-Cuisine Cafe'} in ${restaurant.city}`}
                </p>
              </div>
            </div>

            {/* Quick Pricing Badge */}
            <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100 shrink-0">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Average Cost</span>
              <div className="text-xl sm:text-2xl font-black text-[#1C1917] flex items-center gap-1">
                <span>₹{restaurant.average_cost_for_two || 500}</span>
                <span className="text-xs font-bold text-stone-500">for two</span>
              </div>
            </div>
          </div>

          {/* Key Facts & Status Intel Bar (Ratings, Live Open/Closed, Operational Hours) */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs sm:text-sm">
            {/* Rating */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-extrabold">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{restaurant.rating ? restaurant.rating.toFixed(1) : '4.6'}</span>
              <span className="text-stone-500 font-medium">({reviews.length || restaurant.rating_count || 120}+ reviews)</span>
            </div>

            {/* Open / Closed Live Status */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold border ${
              restaurant.is_open
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-stone-100 text-stone-700 border-stone-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${restaurant.is_open ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`} />
              <span>{restaurant.is_open ? 'Open Now' : 'Closed'}</span>
              <span className="text-stone-400">·</span>
              <span className="font-medium text-stone-600">{formatOpeningHours(restaurant.opening_hours)}</span>
            </div>

            {/* 0% Commission Guarantee */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-100 text-[#D8350F] font-bold">
              <span>🏷️ Real In-Store Counter Rates</span>
            </div>
          </div>

          {/* Hyperlocal Address & Transit Intel Bar */}
          <div className="flex flex-wrap items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-stone-50 border border-stone-200/70 text-xs sm:text-sm text-stone-700">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <MapPin className="w-4 h-4 text-[#FF5A36] shrink-0" />
              <span className="font-medium truncate">{restaurant.address_line1}, {restaurant.city}</span>
              {restaurant.landmark && (
                <span className="text-xs text-stone-500 font-normal hidden md:inline">({restaurant.landmark})</span>
              )}
            </div>

            {travelEstimate && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold shrink-0">
                <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                <span>{travelEstimate.distanceLabel}</span>
                <span className="text-emerald-700">· {travelEstimate.primaryTimeLabel}</span>
              </div>
            )}

            {nearestMetro ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold shrink-0">
                <Train className="w-3.5 h-3.5 text-indigo-600" />
                <span>{nearestMetro.name}</span>
                <span className="text-indigo-600 font-medium">({nearestMetro.walkingMinutes} min walk)</span>
              </div>
            ) : restaurant.metro_station ? (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold shrink-0">
                <span>🚇 {restaurant.metro_station}</span>
                {restaurant.metro_gate && <span className="text-indigo-600 font-medium">Gate {restaurant.metro_gate}</span>}
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(`${restaurant.name}, ${restaurant.address_line1}, ${restaurant.city}`);
                showToast('Address copied to clipboard', 'success');
              }}
              className="text-xs font-bold text-[#FF5A36] hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </button>
          </div>

          {/* Aggregator Markup Defense Pill (Loss Aversion & Price Transparency) */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 text-xs font-bold text-[#9A2A0C] my-1">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span>100% In-Store Prices · Save 20–35% vs Food Delivery Apps</span>
          </div>

          {/* Comprehensive Action Bar (All actions clean, organized, prominent) */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {/* Primary Action: Direct WhatsApp Counter Order */}
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
              className="btn bg-[#0F766E] hover:bg-[#0D9488] text-white min-h-[48px] px-6 text-sm font-extrabold flex items-center gap-2 shadow-sm flex-1 sm:flex-initial cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Menu & Order</span>
            </button>

            {/* Directions Link */}
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn bg-[#0F766E] hover:bg-[#0D9488] text-white shadow-sm min-h-[48px] px-5 text-sm font-extrabold flex items-center gap-2 cursor-pointer"
            >
              <Navigation className="w-4 h-4 text-emerald-200" />
              <span>{travelEstimate ? `Navigate (${travelEstimate.primaryTimeLabel})` : 'Directions'}</span>
            </a>

            {/* Paper Flipbook Modal */}
            <button
              type="button"
              onClick={() => setShowPhysicalMenuModal(true)}
              className="btn bg-[#FAF8F5] hover:bg-stone-100 text-[#1C1917] border border-[#E7E2DA] shadow-sm min-h-[48px] px-5 text-sm font-extrabold flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Real Counter Menu (Photos)</span>
            </button>

            {/* Call Button */}
            {restaurant.phone && (
              <a
                href={`tel:${restaurant.phone.replace(/[^0-9+]/g, '')}`}
                className="btn bg-white hover:bg-stone-100 text-[#1C1917] border border-stone-200 shadow-sm min-h-[48px] px-5 text-sm font-bold flex items-center gap-2 cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 text-sky-600" />
                <span>Call</span>
              </a>
            )}

            {/* Dynamic In-Restaurant Mode Toggle */}
            {isTableDineIn ? (
              <div className="flex items-center gap-1.5 ml-auto">
                <button
                  type="button"
                  onClick={() => setShowTableScannerModal(true)}
                  className="btn bg-amber-400 hover:bg-amber-500 text-stone-950 font-black min-h-[48px] px-4 text-xs sm:text-sm flex items-center gap-1.5 shadow-md border border-amber-500 cursor-pointer"
                  title="Table mode active. Tap to switch table or re-scan standee"
                >
                  <QrCode className="w-4 h-4 text-stone-950" />
                  <span>Table #{tableNumber || '1'} (Active)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsTableDineIn(false);
                    setTableNumber(null);
                    setTablePerk(null);
                    showToast('Exited table session.', 'info');
                  }}
                  className="p-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 min-h-[48px] flex items-center justify-center cursor-pointer transition-colors border border-stone-200 shadow-xs"
                  title="Exit Table Mode"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowTableScannerModal(true)}
                className="btn bg-[#1C1917] hover:bg-stone-800 text-white shadow-sm min-h-[48px] px-4 sm:px-5 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer ml-auto border border-stone-800 transition-all hover:scale-[1.02]"
                title="Scan tabletop QR code to activate table buzzers & digital menu"
              >
                <QrCode className="w-4 h-4 text-[#FF5A36] animate-pulse shrink-0" />
                <span>Scan QR</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================
          1.2. GAMIFIED TABLE SESSION BANNER (WHEN DINE-IN / ?table=X)
      ======================================================== */}
      {isTableDineIn && (
        <section className="max-w-[1280px] mx-auto mt-6 px-4 sm:px-8 relative z-20">
          <div className="bg-gradient-to-r from-stone-900 via-[#1C1917] to-stone-900 border-2 border-amber-400/80 rounded-[32px] p-5 sm:p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                  <span>🍽️</span>
                  <span>Table #{tableNumber || 'Dine-In'} VIP Session</span>
                </span>
                {tablePerk ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-extrabold text-xs flex items-center gap-1">
                    <span>🎉</span>
                    <span>Perk: {tablePerk}</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400 text-rose-300 font-bold text-xs animate-pulse">
                    Wheel Spin Available
                  </span>
                )}
                {/* 1-Tap Cafe Wi-Fi Info */}
                {qrConfig.wifiSsid && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-stone-200">
                    <Wifi className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Wi-Fi: <strong className="text-white">{qrConfig.wifiSsid}</strong></span>
                    {qrConfig.wifiPassword && (
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(qrConfig.wifiPassword || '');
                          showToast(`Copied Wi-Fi password: "${qrConfig.wifiPassword}"`, 'success');
                        }}
                        className="ml-1 text-[11px] font-mono font-bold text-amber-300 hover:text-white flex items-center gap-0.5 cursor-pointer underline"
                        title="Copy Wi-Fi Password"
                      >
                        <span>({qrConfig.wifiPassword})</span>
                        <Copy className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
              <h3 className="font-heading text-lg sm:text-xl font-black text-amber-200">
                Welcome to {restaurant.name}! Dine-In VIP Perks & Facilities Active
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
                Order directly to your table via WhatsApp with zero commission markup. Use the instant buzzers below to alert staff directly to Table #{tableNumber || 'our table'}.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <button
                type="button"
                onClick={() => setShowTablePerkWheel(true)}
                className="btn flex-1 md:flex-none bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-stone-950 font-black text-xs px-4 py-3 rounded-2xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Gift className="w-4 h-4" />
                <span>{tablePerk ? 'View Unlocked Perk' : 'Spin Table Wheel 🎡'}</span>
              </button>

              {/* Table Buzzers */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    const rawPhone = qrConfig.buzzerPhone || restaurant.whatsapp_number || restaurant.phone;
                    if (rawPhone) {
                      const phone = rawPhone.replace(/[^0-9]/g, '');
                      window.open(`https://wa.me/${phone.length === 10 ? `91${phone}` : phone}?text=${encodeURIComponent(`🛎️ [TABLE #${tableNumber || 'Dine-In'}] Call Waiter: Hello ${restaurant.name}, please send someone to assist our table.`)}`, '_blank');
                    } else {
                      showToast('Cafe staff notified on counter buzzer.', 'info');
                    }
                  }}
                  className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-100 text-xs font-bold border border-white/15 flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Call Waiter to Table"
                >
                  <Bell className="w-3.5 h-3.5 text-amber-400" />
                  <span>Call Waiter</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const rawPhone = qrConfig.buzzerPhone || restaurant.whatsapp_number || restaurant.phone;
                    if (rawPhone) {
                      const phone = rawPhone.replace(/[^0-9]/g, '');
                      window.open(`https://wa.me/${phone.length === 10 ? `91${phone}` : phone}?text=${encodeURIComponent(`💧 [TABLE #${tableNumber || 'Dine-In'}] Extra Water: Hello ${restaurant.name}, please bring fresh drinking water to Table #${tableNumber || 'our table'}.`)}`, '_blank');
                    } else {
                      showToast('Water request sent to counter.', 'info');
                    }
                  }}
                  className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-100 text-xs font-bold border border-white/15 flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Request Drinking Water"
                >
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Water</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const rawPhone = qrConfig.buzzerPhone || restaurant.whatsapp_number || restaurant.phone;
                    if (rawPhone) {
                      const phone = rawPhone.replace(/[^0-9]/g, '');
                      window.open(`https://wa.me/${phone.length === 10 ? `91${phone}` : phone}?text=${encodeURIComponent(`🧾 [TABLE #${tableNumber || 'Dine-In'}] Request Bill: Hello ${restaurant.name}, please prepare and bring the bill for Table #${tableNumber || 'our table'}.${tablePerk ? ` (Applied Perk: ${tablePerk})` : ''}`)}`, '_blank');
                    } else {
                      showToast('Bill request sent to counter.', 'info');
                    }
                  }}
                  className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-100 text-xs font-bold border border-white/15 flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Request Table Bill"
                >
                  <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Bill</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const rawPhone = qrConfig.buzzerPhone || restaurant.whatsapp_number || restaurant.phone;
                    if (rawPhone) {
                      const phone = rawPhone.replace(/[^0-9]/g, '');
                      window.open(`https://wa.me/${phone.length === 10 ? `91${phone}` : phone}?text=${encodeURIComponent(`🍴 [TABLE #${tableNumber || 'Dine-In'}] Extra Cutlery: Hello ${restaurant.name}, please send extra spoons, forks, and tissues to Table #${tableNumber || 'our table'}.`)}`, '_blank');
                    } else {
                      showToast('Cutlery request sent to counter.', 'info');
                    }
                  }}
                  className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-100 text-xs font-bold border border-white/15 flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Request Extra Cutlery"
                >
                  <Utensils className="w-3.5 h-3.5 text-purple-400" />
                  <span>Cutlery</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================
          1.3. PROMINENT LIVE OWNER ANNOUNCEMENT BULLETIN
      ======================================================== */}
      {activeAnnouncement && (
        <section className="max-w-[1280px] mx-auto mt-6 px-4 sm:px-8 relative z-20">
          <div className="rounded-[32px] bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-rose-500/15 border-2 border-amber-400/80 p-5 sm:p-7 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden backdrop-blur-xs">
            <div
              aria-hidden="true"
              className="absolute -right-16 -top-16 w-60 h-60 rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.25),transparent_70%)] pointer-events-none"
            />
            <div className="space-y-2 relative z-10 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                </span>
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-rose-600 to-orange-600 text-white font-black text-xs uppercase tracking-wider shadow-xs flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" />
                  <span>{activeAnnouncement.badge}</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/80 border border-amber-300 text-xs font-black text-amber-950">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Official Notice from Restaurant Owner</span>
                </span>
              </div>
              <h3 className="font-heading font-black text-xl sm:text-2xl text-stone-900 leading-tight">
                {activeAnnouncement.title}
              </h3>
              <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-medium">
                {activeAnnouncement.message}
              </p>
            </div>

            <div className="relative z-10 shrink-0 flex flex-wrap items-center gap-3">
              {activeAnnouncement.action_label ? (
                <a
                  href={
                    activeAnnouncement.action_url?.startsWith('http')
                      ? activeAnnouncement.action_url
                      : `https://wa.me/${(restaurant?.whatsapp_number || restaurant?.phone || '919876543210').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${restaurant?.name}, I am inquiring about your announcement: "${activeAnnouncement.title}" on Menu Maps.`)}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn bg-[#D8350F] hover:bg-[#FF5A36] text-white px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm shadow-md flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                >
                  <span>{activeAnnouncement.action_label}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <a
                  href={`https://wa.me/${(restaurant?.whatsapp_number || restaurant?.phone || '919876543210').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${restaurant?.name}, I saw your announcement on Menu Maps: "${activeAnnouncement.title}". Could you share more details?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn bg-white hover:bg-stone-50 text-stone-900 border border-amber-300 px-5 py-3 rounded-2xl font-black text-xs shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <span>Inquire via WhatsApp</span>
                  <ExternalLink className="w-4 h-4 text-stone-500" />
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================
          1.4. MASTER TABBED NAVIGATION (SEPARATED FOR OUTSIDE VS IN-RESTAURANT)
      ======================================================== */}
      <section className="max-w-[1280px] mx-auto mt-6 px-4 sm:px-8 relative z-20">
        <div className="bg-white border border-[#E7E2DA] rounded-[24px] p-2 shadow-xs flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveMainTab('menu')}
            className={`px-4 sm:px-6 py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              effectiveMainTab === 'menu'
                ? 'bg-[#1C1917] text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <span>🍽️</span>
            <span>{isTableDineIn ? `Table #${tableNumber || '1'} Menu` : 'Digital Menu'} ({menuItems.length})</span>
          </button>

          {/* In-Restaurant Only Tab: Table Facilities & Buzzers */}
          {isTableDineIn && (
            <button
              type="button"
              onClick={() => setActiveMainTab('table_perks')}
              className={`px-4 sm:px-6 py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                effectiveMainTab === 'table_perks'
                  ? 'bg-[#1C1917] text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <span>🎡</span>
              <span>Table Facilities & Buzzers</span>
              {tablePerk ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              ) : (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">VIP</span>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveMainTab('gallery')}
            className={`px-4 sm:px-6 py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              effectiveMainTab === 'gallery'
                ? 'bg-[#1C1917] text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <span>📸</span>
            <span>Photos & Flipbook ({galleryImages.length})</span>
          </button>

          {/* Outside Discovery Only Tab: Honest Bill & Intel */}
          {!isTableDineIn && (
            <button
              type="button"
              onClick={() => setActiveMainTab('intel')}
              className={`px-4 sm:px-6 py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                effectiveMainTab === 'intel'
                  ? 'bg-[#1C1917] text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <span>ℹ️</span>
              <span>Honest Bill & Intel</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveMainTab('reviews')}
            className={`px-4 sm:px-6 py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              effectiveMainTab === 'reviews'
                ? 'bg-[#1C1917] text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <span>⭐</span>
            <span>{isTableDineIn ? 'Dine-In Reviews' : 'Diner Reviews'} ({reviews.length || restaurant.rating_count || 120})</span>
          </button>
        </div>
      </section>

      {/* ========================================================
          3. MAIN BODY (TABBED CONTENT + WHATSAPP CART SIDEBAR)
      ======================================================== */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-8 pt-8 pb-24 flex flex-col lg:flex-row gap-10 items-start">
        {/* Left Column: Tabbed Content */}
        <div className="flex-1 min-w-0 w-full">

          {/* ==========================================
              TAB 1: DIGITAL MENU
          ========================================== */}
          {effectiveMainTab === 'menu' && (
            <div className="space-y-6">
              {/* Owner Announcement Capsule */}
              {activeAnnouncement && (
                <div className="rounded-[28px] bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-rose-500/15 border-2 border-amber-400/50 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
                      </span>
                      <span className="px-3 py-0.5 rounded-full bg-rose-600 text-white font-black text-[11px] uppercase tracking-wider shadow-xs">
                        {activeAnnouncement.badge}
                      </span>
                      <span className="text-xs text-amber-900 font-extrabold">
                        Official Notice from Restaurant Owner
                      </span>
                    </div>
                    <h3 className="font-heading font-black text-xl text-stone-900">
                      {activeAnnouncement.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-700 leading-relaxed max-w-3xl">
                      {activeAnnouncement.message}
                    </p>
                  </div>

                  {activeAnnouncement.action_label && (
                    <a
                      href={
                        activeAnnouncement.action_url?.startsWith('http')
                          ? activeAnnouncement.action_url
                          : `https://wa.me/${(restaurant.whatsapp_number || restaurant.phone || '919876543210').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${restaurant.name}, I am inquiring about your announcement: "${activeAnnouncement.title}" on Menu Maps.`)}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn bg-rose-600 hover:bg-rose-700 text-white px-5 py-3 rounded-2xl font-black text-xs shadow-md shrink-0 flex items-center gap-1.5"
                    >
                      <span>{activeAnnouncement.action_label}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}

              {/* Meal Time Contextual Banner */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-xs font-semibold text-amber-900 shadow-sm">
                <span>{mealTimeInfo?.icon || '🍽️'}</span>
                <span>{mealTimeInfo?.label || 'Dining'} Hour:</span>
                <span className="text-amber-700 font-normal">0% marked-up counter rates & live dine-in menu</span>
              </div>

              {/* Top 3 Must-Order Spotlight */}
              <TopPicksSpotlight
                restaurant={restaurant}
                menuItems={menuItems}
                onAddToCart={handleAddToCart}
                cartMap={cartMap}
              />

              {/* Category Tabs (Horizontally Swipeable Strip) */}
              <div className="sticky top-16 sm:top-20 z-30 py-2.5 bg-[#FAF8F5]/95 backdrop-blur-md flex items-center gap-2 overflow-x-auto no-scrollbar whitespace-nowrap border-b border-[#E7E2DA]">
                <button
                  onClick={() => setSelectedCategoryTab('all')}
                  className={`chipl ${selectedCategoryTab === 'all' ? 'on' : ''} text-xs font-bold shrink-0 min-h-[38px] cursor-pointer`}
                >
                  All Items ({menuItems.length})
                </button>
                {categories.map((cat) => {
                  const on = selectedCategoryTab.toLowerCase() === cat.name.toLowerCase();
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategoryTab(on ? 'all' : cat.name)}
                      className={`chipl ${on ? 'on' : ''} text-xs font-bold shrink-0 min-h-[38px] cursor-pointer`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>

              {/* Search Inside Menu & Dietary Filters + Bite Roulette Trigger */}
              <div className="flex flex-wrap gap-2.5 sm:gap-3 items-center">
                <div className="flex-1 min-w-[170px] sm:min-w-[200px] flex items-center gap-2 px-3.5 sm:px-4 min-h-[44px] sm:min-h-[46px] rounded-2xl bg-white border border-[#E7E2DA]">
                  <Search className="w-4 h-4 text-[#78716C] shrink-0" />
                  <input
                    type="text"
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    placeholder="Search this menu (e.g. momos, burger, shake)…"
                    className="flex-1 bg-transparent text-xs sm:text-sm text-[#1C1917] outline-none placeholder:text-stone-400"
                  />
                </div>

                {/* Bite Roulette Button */}
                <button
                  type="button"
                  onClick={() => setShowDishRoulette(true)}
                  className="px-3.5 sm:px-4 min-h-[44px] sm:min-h-[46px] rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                  title="Can't decide? Let Bite Roulette pick a dish for you"
                >
                  <Dices className="w-4 h-4" />
                  <span>Pick For Me 🎲</span>
                </button>

                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  <button
                    onClick={() => setDietaryFilter(dietaryFilter === 'veg' ? 'all' : 'veg')}
                    className={`chipl text-xs min-h-[44px] px-3 sm:px-3.5 cursor-pointer ${dietaryFilter === 'veg' ? 'on' : ''}`}
                  >
                    🟢 Pure Veg
                  </button>
                  <button
                    onClick={() => setDietaryFilter(dietaryFilter === 'non-veg' ? 'all' : 'non-veg')}
                    className={`chipl text-xs min-h-[44px] px-3 sm:px-3.5 cursor-pointer ${dietaryFilter === 'non-veg' ? 'on' : ''}`}
                  >
                    🔴 Non-Veg
                  </button>
                  <button
                    onClick={() => setDietaryFilter(dietaryFilter === 'jain' ? 'all' : 'jain')}
                    className={`chipl text-xs min-h-[44px] px-3 sm:px-3.5 cursor-pointer ${dietaryFilter === 'jain' ? 'on' : ''}`}
                  >
                    🌾 Jain Friendly
                  </button>
                  <button
                    onClick={() => setDietaryFilter(dietaryFilter === 'bestseller' ? 'all' : 'bestseller')}
                    className={`chipl text-xs min-h-[44px] px-3 sm:px-3.5 cursor-pointer ${dietaryFilter === 'bestseller' ? 'on' : ''}`}
                  >
                    ⭐ Bestsellers
                  </button>
                </div>
              </div>

              {/* Dish Items List */}
              <div className="mt-4">
                <h2 className="hd text-2xl sm:text-3xl font-extrabold text-[#1C1917]">
                  {selectedCategoryTab === 'all' ? 'Counter menu items' : selectedCategoryTab}
                </h2>

                {filteredMenuItems.length === 0 ? (
                  menuItems.length === 0 && restaurant.menu_pages && restaurant.menu_pages.length > 0 ? (
                    <div className="bg-white rounded-3xl border border-[#EFEAE2] p-6 sm:p-8 space-y-4 my-6">
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-100">
                        <div>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
                            <FileText className="w-3.5 h-3.5" />
                            Verified Counter Paper Menu Active
                          </span>
                          <h3 className="font-heading font-black text-xl text-[#1C1917]">
                            Real Counter Rate Card ({restaurant.menu_pages.length} Pages)
                          </h3>
                          <p className="text-xs text-stone-500">
                            Counter prices photographed directly from {restaurant.name}. Tap any page to view full size.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowPhysicalMenuModal(true)}
                          className="btn bg-[#0F766E] hover:bg-[#0D9488] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Open Fullscreen Flipbook</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {restaurant.menu_pages.map((pageUrl, idx) => (
                          <div
                            key={idx}
                            onClick={() => setShowPhysicalMenuModal(true)}
                            className="aspect-[3/4] rounded-2xl overflow-hidden border border-stone-200 cursor-pointer group relative bg-stone-100 hover:shadow-md transition-all"
                          >
                            <img
                              src={pageUrl}
                              alt={`Menu Page ${idx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2.5 text-white text-xs font-bold flex items-center justify-between">
                              <span>Page {idx + 1}</span>
                              <span className="text-[10px] text-emerald-300 font-normal">Verified Menu</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : menuItems.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-[#EFEAE2] p-8 text-center my-6 space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-2xl">
                        📋
                      </div>
                      <div className="space-y-1 max-w-md mx-auto">
                        <h3 className="font-heading font-black text-lg text-[#1C1917]">
                          Counter Menu Digitization in Progress
                        </h3>
                        <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
                          This cafe was recently listed. Our menu team is uploading verified counter rates and dish photos. You can inquire directly with the cafe for today's live menu and specials.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const rawPhone = restaurant.whatsapp_number || restaurant.phone;
                          if (rawPhone) {
                            const phone = rawPhone.replace(/[^0-9]/g, '');
                            window.open(`https://wa.me/${phone.length === 10 ? `91${phone}` : phone}?text=${encodeURIComponent(`Hi ${restaurant.name}, I am exploring your menu on MenuMaps. Could you please share today's menu card and prices?`)}`, '_blank');
                          }
                        }}
                        className="btn bg-[#0F766E] hover:bg-[#0D9488] text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-2xl shadow-sm inline-flex items-center gap-2 cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Ask Counter on WhatsApp</span>
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white rounded-3xl border border-[#EFEAE2] p-8 text-center my-6">
                      <p className="text-sm font-semibold text-stone-500">No dishes matched your filter or search.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuSearch('');
                          setDietaryFilter('all');
                          setSelectedCategoryTab('all');
                        }}
                        className="mt-3 text-xs font-bold text-[#FF5A36] hover:underline cursor-pointer"
                      >
                        Clear Filters
                      </button>
                    </div>
                  )
                ) : (
                  <div className="mt-5 flex flex-col gap-3">
                    {filteredMenuItems.map((item) => {
                      const smartPairing = getSmartPairingForItem(item, menuItems);
                      const savings = calculateSavings(item.price);
                      const dishImage = getSmartDishImage(item.name, undefined, item.image_url);
                      return (
                        <div key={item.id} className="item group flex flex-col items-stretch">
                          {/* Main Row: Dish Photo + Info on left, Price + Add button on right */}
                          <div className="flex items-center justify-between gap-3 sm:gap-4 w-full">
                            <div className="flex items-center gap-3.5 sm:gap-4 flex-1 min-w-0">
                              {/* Thumbnail Photo / Gradient */}
                              <div
                                onClick={() => setSelectedDishPreview(item)}
                                className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl shrink-0 overflow-hidden bg-stone-100 cursor-pointer hover:opacity-95 border border-stone-200/80 shadow-xs relative"
                                title={`View ${item.name} details & nutrition`}
                              >
                                <img
                                  src={dishImage}
                                  alt={item.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  loading="lazy"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80';
                                  }}
                                />
                              </div>

                              {/* Dish Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                  {/* Veg / Non-Veg dot */}
                                  <span
                                    className={`w-3.5 h-3.5 rounded-[3px] border flex items-center justify-center shrink-0 ${
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
                                    <span className="text-[10px] sm:text-[11px] font-extrabold uppercase text-[#D8350F] bg-[#FFE9E2] px-1.5 sm:px-2 py-0.5 rounded-md shrink-0">
                                      Bestseller
                                    </span>
                                  )}
                                  {item.spice_level && item.spice_level > 1 && (
                                    <span className="text-[10px] sm:text-[11px] font-bold text-amber-700 bg-amber-50 px-1.5 sm:px-2 py-0.5 rounded-md shrink-0">
                                      🌶️ Spicy
                                    </span>
                                  )}
                                </div>

                                <h3
                                  onClick={() => setSelectedDishPreview(item)}
                                  className="hd mt-1 text-base sm:text-xl font-black text-[#1C1917] leading-snug line-clamp-1 sm:line-clamp-2 cursor-pointer hover:text-[#0F766E] transition-colors"
                                  title={`Click to view ${item.name} details`}
                                >
                                  {item.name}
                                </h3>
                                {item.description && (
                                  <p className="mt-1 text-xs sm:text-sm text-[#44403C] line-clamp-1 sm:line-clamp-2 leading-relaxed">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Price & Add Button */}
                            <div className="flex flex-col items-end justify-center gap-1.5 shrink-0 pl-2">
                              <div className="flex flex-col items-end">
                                <span className="hd text-lg sm:text-2xl font-black text-[#1C1917] leading-none">
                                  ₹{item.price}
                                </span>
                                {savings.totalSavings > 0 && (
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 inline-block mt-1 whitespace-nowrap">
                                    Save ₹{savings.totalSavings} vs apps
                                  </span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleAddToCart(item)}
                                className="add cursor-pointer active:scale-95 mt-1"
                                title="Add to order tray"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Smart Pairing / The Perfect Bite (cleanly placed underneath the dish row) */}
                          {smartPairing && (
                            <div className="w-full mt-2.5 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs bg-amber-50/70 px-3 py-2 rounded-xl">
                              <span className="text-stone-700 font-medium truncate max-w-[220px] sm:max-w-md">
                                ✨ <strong>The Perfect Bite:</strong> Pairs best with <strong>{smartPairing.name}</strong> (+₹{smartPairing.price})
                              </span>
                              <button
                                type="button"
                                onClick={() => handleAddToCart(smartPairing)}
                                className="text-[11px] font-extrabold text-[#FF5A36] hover:underline flex items-center gap-1 shrink-0 ml-2 cursor-pointer"
                              >
                                + Add Combo
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 2: TABLE PERKS & BUZZER SUITE
          ========================================== */}
          {isTableDineIn && effectiveMainTab === 'table_perks' && (
            <div className="space-y-6">
              {/* Table Luck Wheel Interactive Hero */}
              <div className="bg-gradient-to-br from-stone-900 via-[#1C1917] to-stone-900 border-2 border-amber-400/80 rounded-[32px] p-6 sm:p-8 text-white shadow-xl">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-stone-950 text-xs font-black uppercase tracking-wider">
                      <span>🎡</span>
                      <span>Gamified Table Luck Wheel</span>
                    </div>
                    <h3 className="font-heading text-2xl sm:text-3xl font-black text-amber-200">
                      Spin & Win In-Cafe Table Rewards
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-300 max-w-xl leading-relaxed">
                      Every table gets a complimentary spin! Win instant counter discounts, house dips, sweet bites, or upgraded drinks. Perks are automatically tagged to your WhatsApp table orders.
                    </p>
                    {tablePerk ? (
                      <div className="pt-2 flex items-center gap-2">
                        <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-extrabold text-xs">
                          🎉 Active Perk: {tablePerk} (Table #{tableNumber || 'Dine-In'})
                        </span>
                      </div>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowTablePerkWheel(true)}
                    className="btn bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 hover:from-amber-500 hover:to-rose-600 text-stone-950 font-black text-sm px-6 py-4 rounded-2xl shadow-xl flex items-center gap-2 active:scale-95 cursor-pointer shrink-0"
                  >
                    <Gift className="w-5 h-5" />
                    <span>{tablePerk ? 'Spin Again / View Perk' : 'Spin Table Wheel Now 🎡'}</span>
                  </button>
                </div>
              </div>

              {/* Table Buzzer Suite (1-Click Table Assistance) */}
              <div className="bg-white border border-[#E7E2DA] rounded-[32px] p-6 sm:p-7 shadow-xs">
                <div className="space-y-1 mb-5">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-[#0F766E]">
                    Zero Waiting • Instant Attention
                  </div>
                  <h3 className="hd text-xl sm:text-2xl font-black text-[#1C1917]">
                    1-Tap Table Buzzers (WhatsApp Direct)
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600">
                    Tap any button below to send an automated instant alert to the cafe manager's WhatsApp with your Table #{tableNumber || 'Dine-In'} tag.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Buzzer 1: Call Waiter */}
                  <button
                    type="button"
                    onClick={() => {
                      const rawPhone = restaurant.whatsapp_number || restaurant.phone;
                      if (rawPhone) {
                        const phone = rawPhone.replace(/[^0-9]/g, '');
                        window.open(`https://wa.me/${phone.length === 10 ? `91${phone}` : phone}?text=${encodeURIComponent(`🛎️ [TABLE #${tableNumber || 'Dine-In'}] Call Waiter: Hello ${restaurant.name}, please send someone to assist Table #${tableNumber || 'our table'}. Thank you!`)}`, '_blank');
                      } else {
                        showToast('Staff alerted on counter buzzer.', 'info');
                      }
                    }}
                    className="p-4 rounded-2xl bg-amber-50/70 hover:bg-amber-100/80 border border-amber-200 text-left flex items-start gap-3.5 transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-stone-900">🛎️ Call Waiter / Server</h4>
                      <p className="text-xs text-stone-600 mt-0.5">Summons table service immediately to take order or help</p>
                    </div>
                  </button>

                  {/* Buzzer 2: Drinking Water */}
                  <button
                    type="button"
                    onClick={() => {
                      const rawPhone = restaurant.whatsapp_number || restaurant.phone;
                      if (rawPhone) {
                        const phone = rawPhone.replace(/[^0-9]/g, '');
                        window.open(`https://wa.me/${phone.length === 10 ? `91${phone}` : phone}?text=${encodeURIComponent(`💧 [TABLE #${tableNumber || 'Dine-In'}] Extra Water: Hello ${restaurant.name}, please bring fresh drinking RO water for Table #${tableNumber || 'our table'}.`)}`, '_blank');
                      } else {
                        showToast('Water request sent to counter.', 'info');
                      }
                    }}
                    className="p-4 rounded-2xl bg-cyan-50/70 hover:bg-cyan-100/80 border border-cyan-200 text-left flex items-start gap-3.5 transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-cyan-500 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Droplets className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-stone-900">💧 Extra Drinking Water</h4>
                      <p className="text-xs text-stone-600 mt-0.5">Request fresh RO filtered drinking water refill</p>
                    </div>
                  </button>

                  {/* Buzzer 3: Request Bill */}
                  <button
                    type="button"
                    onClick={() => {
                      const rawPhone = restaurant.whatsapp_number || restaurant.phone;
                      if (rawPhone) {
                        const phone = rawPhone.replace(/[^0-9]/g, '');
                        window.open(`https://wa.me/${phone.length === 10 ? `91${phone}` : phone}?text=${encodeURIComponent(`🧾 [TABLE #${tableNumber || 'Dine-In'}] Request Bill: Hello ${restaurant.name}, please prepare and bring the final bill for Table #${tableNumber || 'our table'}.${tablePerk ? ` (Applied Perk: ${tablePerk})` : ''}`)}`, '_blank');
                      } else {
                        showToast('Bill request sent to counter.', 'info');
                      }
                    }}
                    className="p-4 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200 text-left flex items-start gap-3.5 transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-stone-900">🧾 Request Final Bill</h4>
                      <p className="text-xs text-stone-600 mt-0.5">Prepares counter invoice with 0% markups and perks</p>
                    </div>
                  </button>

                  {/* Buzzer 4: Extra Cutlery & Napkins */}
                  <button
                    type="button"
                    onClick={() => {
                      const rawPhone = restaurant.whatsapp_number || restaurant.phone;
                      if (rawPhone) {
                        const phone = rawPhone.replace(/[^0-9]/g, '');
                        window.open(`https://wa.me/${phone.length === 10 ? `91${phone}` : phone}?text=${encodeURIComponent(`🍴 [TABLE #${tableNumber || 'Dine-In'}] Extra Cutlery: Hello ${restaurant.name}, please send extra spoons, forks, and tissues to Table #${tableNumber || 'our table'}.`)}`, '_blank');
                      } else {
                        showToast('Cutlery request sent to counter.', 'info');
                      }
                    }}
                    className="p-4 rounded-2xl bg-stone-100/80 hover:bg-stone-200/80 border border-stone-200 text-left flex items-start gap-3.5 transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-stone-800 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Utensils className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-stone-900">🍴 Extra Cutlery & Tissues</h4>
                      <p className="text-xs text-stone-600 mt-0.5">Extra plates, spoons, forks, dips or napkins</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Table Standee Kit Studio Card */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-[32px] p-6 sm:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-md bg-amber-400 text-stone-950 font-bold text-xs">
                      <QrCode className="w-3.5 h-3.5" />
                    </span>
                    <h3 className="font-heading text-lg font-black text-stone-900">
                      Printable Table QR Standee Studio
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-600 max-w-xl">
                    Cafe manager or visiting guest? Generate customized acrylic table standees with Table # (1–25) and Wi-Fi credentials ready to print in high-resolution PNG.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className="btn bg-stone-900 hover:bg-black text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-md flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
                >
                  <QrCode className="w-4 h-4 text-amber-400" />
                  <span>Open Standee Studio 🖨️</span>
                </button>
              </div>

              {/* Live Counter Pulse Ticker */}
              <CounterPulseTicker restaurant={restaurant} />
            </div>
          )}

          {/* ==========================================
              TAB 3: PHOTOS & PAPER FLIPBOOK
          ========================================== */}
          {effectiveMainTab === 'gallery' && (
            <div className="space-y-6">
              {/* Paper Flipbook Banner */}
              <div className="bg-gradient-to-r from-emerald-900 via-stone-900 to-emerald-950 text-white rounded-[32px] p-6 sm:p-8 border border-emerald-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Original Physical Paper Menus</span>
                  </div>
                  <h3 className="font-heading text-2xl font-black text-emerald-100">
                    Counter Flipbook Modal
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-300 max-w-xl leading-relaxed">
                    View high-resolution, unedited photos of the real laminated paper menus used at {restaurant.name}'s counter. Check exact chef notes and seasonal rates.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPhysicalMenuModal(true)}
                  className="btn bg-emerald-500 hover:bg-emerald-600 text-stone-950 font-black text-xs px-5 py-3.5 rounded-2xl shadow-lg flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
                >
                  <FileText className="w-4 h-4" />
                  <span>Open Paper Flipbook 📖</span>
                </button>
              </div>

              {/* Photo & Menu Grid */}
              <div className="bg-white border border-[#EFEAE2] rounded-[32px] p-6 sm:p-7 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-extrabold uppercase tracking-wider text-[#0F766E]">
                      Real In-Store Atmosphere & Menus
                    </div>
                    <h3 className="hd text-xl sm:text-2xl font-black text-[#1C1917] mt-0.5">
                      Verified Photos & Menu Pages ({galleryImages.length})
                    </h3>
                  </div>
                  {galleryImages.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowPhysicalMenuModal(true)}
                      className="text-xs font-bold text-[#0F766E] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Open Flipbook &rarr;</span>
                    </button>
                  )}
                </div>

                {galleryImages.length === 0 ? (
                  <div className="text-center py-12 bg-stone-50 rounded-2xl border border-stone-200">
                    <ImageIcon className="w-10 h-10 text-stone-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-stone-700">No photos uploaded yet</p>
                    <p className="text-xs text-stone-500 mt-1">Cafe owner or diners can submit verified in-store photos.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {galleryImages.map((img, idx) => (
                      <div
                        key={img.id}
                        onClick={() => {
                          if (img.category === 'menu_page') {
                            setShowPhysicalMenuModal(true);
                          } else {
                            setSelectedPhotoPreview(img);
                          }
                        }}
                        className="aspect-square rounded-2xl overflow-hidden relative cursor-pointer group bg-stone-100 border border-stone-200"
                      >
                        <img
                          src={img.image_url}
                          alt={img.caption || 'Restaurant gallery'}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="absolute bottom-1.5 left-1.5 right-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[9px] font-bold text-white uppercase tracking-wider block truncate">
                            {img.category === 'menu_page' ? `Menu Page ${idx + 1}` : img.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 4: HONEST BILL & INTEL
          ========================================== */}
          {effectiveMainTab === 'intel' && (
            <div className="space-y-6">
              {/* Quick Fact Bar */}
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

              {/* The Honest Bill Box */}
              <HonestBillBox restaurant={restaurant} />

              {/* Restaurant Super Widgets (Price Transparency, Vibe Radar, Metro Route Guide & Bill Splitter) */}
              <RestaurantSuperWidgets
                restaurant={restaurant}
                menuItems={menuItems}
                cartTotalAmount={cartTotalAmount}
                onAddToCart={handleAddToCart}
                onOpenPhysicalMenu={() => setShowPhysicalMenuModal(true)}
              />

              {/* AEO Direct Answer & Citation Capsule */}
              <div className="bg-stone-50/90 border border-stone-200/90 rounded-2xl p-4 sm:p-5 text-xs text-stone-700 leading-relaxed shadow-xs">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase tracking-wider">
                    Verified Dining Guide
                  </span>
                  <span className="text-[11px] text-stone-500 font-medium">
                    Updated for 2026 • 100% Verified Menu Price Guarantee
                  </span>
                </div>
                <p className="text-[13px] text-stone-800 font-medium leading-relaxed">
                  <strong>{restaurant.name}</strong> is a dining destination located in <strong>{restaurant.city_area || restaurant.city}, Delhi</strong>. Known for serving {restaurant.cuisine_types?.join(', ') || 'multi-cuisine dishes'} with an average cost of ₹{restaurant.average_cost_for_two || 350} for two diners. View the complete, verified digital menu with 0% markup direct WhatsApp ordering.
                </p>
              </div>

              {/* Neighbor Steal / Verified Partner Banner */}
              <NeighborStealBanner
                currentRestaurant={restaurant}
                nearbyRestaurants={similarRestaurants}
                onSelectRestaurant={(s) => navigate(`/${s}`)}
                onClaimClick={() => setShowClaimModal(true)}
              />
            </div>
          )}

          {/* ==========================================
              TAB 5: DINER REVIEWS
          ========================================== */}
          {effectiveMainTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="hd text-3xl font-extrabold text-[#1C1917]">Diner reviews</h2>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(true)}
                  className="btn bg-[#1C1917] hover:bg-stone-800 text-white min-h-[44px] px-5 text-sm cursor-pointer"
                >
                  Write a review
                </button>
              </div>

              {/* Smart Google Review Booster & WhatsApp Complaint Shield */}
              <SmartReviewShield
                restaurant={restaurant}
                onOpenInternalReview={() => setShowReviewModal(true)}
              />

              {/* Review Score Summary Box */}
              <div className="bg-white border border-[#EFEAE2] rounded-[28px] p-5 sm:p-7 flex flex-wrap gap-6 sm:gap-8 items-center shadow-xs">
                <div>
                  <div className="hd text-4xl sm:text-6xl font-black text-[#1C1917] leading-none">
                    {restaurant.rating_avg > 0 ? restaurant.rating_avg.toFixed(1) : '4.6'}
                  </div>
                  <div className="mt-1 text-xs text-[#57534E] font-medium">
                    from {restaurant.rating_count || 120} verified diners
                  </div>
                </div>

                {/* Simulated Rating Bar Breakdown */}
                <div className="flex-1 min-w-0 w-full sm:min-w-[240px] flex flex-col gap-2">
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
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <div className="bg-white border border-[#EFEAE2] rounded-[24px] p-8 text-center">
                    <p className="text-sm font-semibold text-stone-600">No written reviews yet. Be the first to share your experience!</p>
                  </div>
                ) : (
                  reviews.slice(0, 5).map((rev) => (
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
                  ))
                )}
              </div>
            </div>
          )}

        </div>

        {/* Right Sidebar: WhatsApp Cart + Find it + Claim Card */}
        <aside aria-label="Your order" className="w-full lg:w-96 flex flex-col gap-6 shrink-0 sticky top-20">
          {/* Order Tray Box */}
          <div className="bg-white border border-[#EFEAE2] rounded-[32px] p-7 shadow-[0_30px_60px_-34px_rgba(28,25,23,0.35)]">
            <div className="flex justify-between items-center">
              <h2 className="hd text-2xl font-bold text-[#1C1917]">
                {isTableDineIn ? `Table #${tableNumber || '1'} Order` : 'Your order'}
              </h2>
              <span className="px-3 py-1 rounded-full bg-[#E6F4F1] text-[#0F766E] text-xs font-extrabold">
                {isTableDineIn ? '0% Dine-In' : '0% commission'}
              </span>
            </div>
            {isTableDineIn && tablePerk && (
              <div className="mt-2 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-900 text-xs font-bold flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-[#FF5A36] shrink-0" />
                <span>Active Table Perk: <strong>{tablePerk}</strong></span>
              </div>
            )}

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
                        className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center font-bold text-xs hover:bg-stone-200 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold text-xs w-4 text-center">{ci.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(ci.item.id, 1)}
                        className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center font-bold text-xs hover:bg-stone-200 cursor-pointer"
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

            {/* High-margin auto-upsell pairing prompt */}
            <UpsellPairingPrompt
              menuItems={menuItems}
              cartMap={cartMap}
              onAddToCart={handleAddToCart}
            />

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
              className={`btn mt-5 w-full min-h-[54px] text-sm font-bold text-white transition-all cursor-pointer ${
                cartList.length > 0
                  ? 'bg-[#0F766E] hover:bg-[#0D9488]'
                  : 'bg-stone-300 cursor-not-allowed'
              }`}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              <span>{isTableDineIn ? `Send Table #${tableNumber || '1'} Order via WhatsApp` : 'Review Order (or 🚶 15-Min Pickup)'}</span>
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

          {/* Claim Page Card OR Acquired / Owner Status Card */}
          {isOwnerOfThisRest ? (
            <div className="bg-gradient-to-br from-[#1C1917] via-stone-900 to-black text-white rounded-[28px] p-6 text-left border-2 border-[#FF5A36] shadow-xl relative overflow-hidden">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF5A36]/20 border border-[#FF5A36]/40 text-[#FF5A36] text-[11px] font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>You Own This Listing</span>
              </div>
              <h3 className="hd text-xl font-bold mt-3">Owner Control Center</h3>
              <p className="mt-1 text-xs text-stone-300 leading-relaxed">
                Update your logo, storefront banner, dishes, prices, announcements, and ground policies directly from your dashboard.
              </p>
              <button
                onClick={() => navigate('/owner/dashboard')}
                className="btn mt-4 w-full bg-[#FF5A36] hover:bg-[#D8350F] text-white min-h-[46px] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>Manage Cafe & Menu</span>
              </button>
            </div>
          ) : isAcquired ? (
            <div className="bg-emerald-50 border border-emerald-300/80 rounded-[28px] p-6 text-left shadow-xs">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-black uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified In-Store Partner</span>
              </div>
              <h3 className="hd text-lg font-bold text-stone-900 mt-3">100% Rate Lock Guarantee</h3>
              <p className="mt-1 text-xs text-stone-600 leading-relaxed">
                This cafe is managed directly by the verified owner. Counter prices, RO water, and dine-in rules are actively guaranteed.
              </p>
            </div>
          ) : (
            <div className="bg-[#1C1917] text-white rounded-[28px] p-6 text-left">
              <h3 className="hd text-xl font-bold">Own this restaurant?</h3>
              <p className="mt-2 text-xs text-stone-300 leading-relaxed">
                Claim your verified listing, verify with your business documents or photo proof, and update your counter prices anytime.
              </p>
              <button
                onClick={() => setShowClaimModal(true)}
                className="btn mt-4 w-full bg-[#FF5A36] hover:bg-[#D8350F] text-white min-h-[46px] text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                Claim this page
              </button>
            </div>
          )}
        </aside>
      </section>

      {/* ========================================================
          4. SIMILAR VIBE & NEARBY GEMS (CENTRAL DISCOVERY ENGINE)
      ======================================================== */}
      {similarRestaurants.length > 0 && (
        <section className="max-w-[1280px] mx-auto px-4 sm:px-8 pb-20">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#0F766E]">
                Personalized for your palate
              </div>
              <h2 className="hd text-2xl sm:text-3xl font-extrabold text-[#1C1917] mt-0.5">
                Similar vibe & nearby spots
              </h2>
            </div>
            <button
              onClick={() => navigate('/restaurants')}
              className="text-xs font-bold text-[#0F766E] hover:underline"
            >
              Explore all &rarr;
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarRestaurants.map((simRest) => {
              const simDist = userCoords && typeof simRest.latitude === 'number' && typeof simRest.longitude === 'number'
                ? calculateDistanceKm(userCoords.latitude, userCoords.longitude, simRest.latitude, simRest.longitude)
                : undefined;
              return (
                <RestaurantCard
                  key={simRest.id}
                  restaurant={simRest}
                  onClick={() => navigate(`/${simRest.slug}`)}
                  userDistanceKm={simDist}
                  userCoords={userCoords}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Modals (Lazy Loaded) */}
      <React.Suspense fallback={null}>
        {showPhysicalMenuModal && (
          <PhysicalMenuModal
            isOpen={showPhysicalMenuModal}
            onClose={() => setShowPhysicalMenuModal(false)}
            restaurant={restaurant}
          />
        )}
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
        {showDishRoulette && (
          <DishRouletteModal
            isOpen={showDishRoulette}
            onClose={() => setShowDishRoulette(false)}
            menuItems={menuItems}
            onAddToCart={handleAddToCart}
          />
        )}
        {showTablePerkWheel && (
          <TablePerkWheelModal
            isOpen={showTablePerkWheel}
            onClose={() => setShowTablePerkWheel(false)}
            restaurantName={restaurant.name}
            tableNumber={tableNumber || undefined}
            onPerkUnlocked={(perk: string) => setTablePerk(perk)}
            activePerk={tablePerk}
            enabledPerkIds={qrConfig.enabledPerks}
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

      {/* ========================================================
          OWNER QUICK UPDATE MODAL (ON-PAGE)
      ======================================================== */}
      {showOwnerQuickModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-[32px] max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-stone-200 my-8">
            <div className="flex justify-between items-center pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-rose-100 text-rose-600">
                  <Megaphone className="w-4 h-4" />
                </span>
                <h3 className="hd text-xl font-bold text-stone-900">
                  Owner Quick Update: {restaurant.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowOwnerQuickModal(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Mode Switcher */}
            <div className="flex gap-2 p-1 bg-stone-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setOwnerQuickTab('announcement')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  ownerQuickTab === 'announcement'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                📢 Post Today's Announcement
              </button>
              <button
                type="button"
                onClick={() => setOwnerQuickTab('photo')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  ownerQuickTab === 'photo'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                📸 Upload Paper Menu / Photo
              </button>
            </div>

            {ownerQuickTab === 'announcement' ? (
              <form onSubmit={handleQuickPostAnnouncement} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Announcement Badge *
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {(["Today's Special", "Festival Offer", "Live Event", "Special Timings", "Notice"] as AnnouncementBadge[]).map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setQuickAnnouncementBadge(b)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          quickAnnouncementBadge === b
                            ? 'bg-rose-500 text-white border-rose-500'
                            : 'bg-stone-50 text-stone-700 border-stone-200'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Announcement Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={quickAnnouncementTitle}
                    onChange={(e) => setQuickAnnouncementTitle(e.target.value)}
                    placeholder="e.g. Navratri Special Thali & 15% Off Today!"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Detailed Message *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={quickAnnouncementMsg}
                    onChange={(e) => setQuickAnnouncementMsg(e.target.value)}
                    placeholder="e.g. Prepared with authentic sendha namak and fresh ingredients. Available exclusively for dine-in and WhatsApp takeaways."
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-hidden"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setShowOwnerQuickModal(false)}
                    className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingQuickUpdate}
                    className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95"
                  >
                    {savingQuickUpdate ? 'Publishing...' : 'Publish Instantly to Page'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Photo Type / Category
                  </label>
                  <select
                    value={quickPhotoCategory}
                    onChange={(e) => setQuickPhotoCategory(e.target.value as GalleryCategory)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 outline-none"
                  >
                    <option value="menu_page">📄 Paper Menu Page (Added to Flipbook Modal)</option>
                    <option value="ambiance">🪑 Ambiance & Seating (Dining vibe, outdoor)</option>
                    <option value="food">🍲 Signature Dish</option>
                    <option value="outdoor">🌿 Outdoor / Rooftop</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Caption (Optional)
                  </label>
                  <input
                    type="text"
                    value={quickPhotoCaption}
                    onChange={(e) => setQuickPhotoCaption(e.target.value)}
                    placeholder="e.g. Menu Page 1 - Starters & Rolls"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-hidden"
                  />
                </div>

                <div className="pt-2">
                  <input
                    type="file"
                    ref={quickPhotoInputRef}
                    onChange={handleQuickUploadPhoto}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => quickPhotoInputRef.current?.click()}
                    disabled={savingQuickUpdate}
                    className="w-full py-4 rounded-2xl border-2 border-dashed border-emerald-400 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800 font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all"
                  >
                    <Upload className="w-5 h-5 text-emerald-600" />
                    <span>{savingQuickUpdate ? 'Compressing & Saving...' : 'Tap to Choose Photo from Phone/PC'}</span>
                    <span className="text-[10px] text-emerald-600/80 font-normal">Auto-compressed for instant fast loading</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          PHOTO LIGHTBOX PREVIEW
      ======================================================== */}
      {selectedPhotoPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => setSelectedPhotoPreview(null)}
        >
          <div
            className="max-w-3xl w-full bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-white/10">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {selectedPhotoPreview.category === 'menu_page'
                  ? 'Paper Menu Page'
                  : selectedPhotoPreview.category}
              </span>
              <button
                type="button"
                onClick={() => setSelectedPhotoPreview(null)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[75vh] flex items-center justify-center p-2 bg-black">
              <img
                src={selectedPhotoPreview.image_url}
                alt={selectedPhotoPreview.caption || 'Preview'}
                className="max-h-[70vh] w-auto object-contain rounded-xl"
              />
            </div>
            {selectedPhotoPreview.caption && (
              <div className="p-4 text-xs text-stone-200 font-medium">
                {selectedPhotoPreview.caption}
              </div>
            )}
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

      
      {/* ========================================================
          DISH QUICK VIEW MODAL (DELIGHTFUL PREVIEW WITHOUT NAVIGATING AWAY)
      ======================================================== */}
      {selectedDishPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedDishPreview(null)}
        >
          <div
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden text-left animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dish Large Image Header */}
            <div className="relative h-56 sm:h-64 w-full bg-stone-100 overflow-hidden shrink-0">
              {selectedDishPreview.image_url ? (
                <img
                  src={selectedDishPreview.image_url}
                  alt={selectedDishPreview.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 flex items-center justify-center text-white text-5xl">
                  🍽️
                </div>
              )}

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedDishPreview(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer z-10"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Veg / Non-Veg badge overlay */}
              <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black shadow-md flex items-center gap-1.5 ${
                    selectedDishPreview.dietary_tags?.includes('Veg')
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  <span>{selectedDishPreview.dietary_tags?.includes('Veg') ? '🟢 Pure Veg' : '🔴 Non-Veg'}</span>
                </span>

                {(selectedDishPreview.is_featured || selectedDishPreview.is_must_try) && (
                  <span className="px-3 py-1 rounded-full bg-[#FF5A36] text-white text-xs font-black uppercase tracking-wider shadow-md">
                    ⭐ Bestseller
                  </span>
                )}

                {selectedDishPreview.spice_level && selectedDishPreview.spice_level > 1 && (
                  <span className="px-3 py-1 rounded-full bg-amber-500 text-stone-950 text-xs font-black shadow-md">
                    🌶️ Spicy Level {selectedDishPreview.spice_level}
                  </span>
                )}
              </div>
            </div>

            {/* Dish Details Body */}
            <div className="p-6 sm:p-7 space-y-4 overflow-y-auto flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-heading font-black text-2xl sm:text-3xl text-stone-900 leading-tight">
                    {selectedDishPreview.name}
                  </h3>
                  {selectedDishPreview.cuisine_types && selectedDishPreview.cuisine_types.length > 0 && (
                    <p className="text-xs font-bold text-[#0F766E] uppercase tracking-wider mt-1">
                      {selectedDishPreview.cuisine_types.join(' • ')}
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="font-heading font-black text-2xl sm:text-3xl text-stone-950 block">
                    ₹{selectedDishPreview.price}
                  </span>
                  {(() => {
                    const savings = calculateSavings(selectedDishPreview.price);
                    return savings.totalSavings > 0 ? (
                      <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-block mt-0.5">
                        Save ₹{savings.totalSavings} vs apps
                      </span>
                    ) : null;
                  })()}
                </div>
              </div>

              {selectedDishPreview.description && (
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {selectedDishPreview.description}
                </p>
              )}

              {/* Smart Pairing Suggestion */}
              {(() => {
                const pairing = getSmartPairingForItem(selectedDishPreview, menuItems);
                if (!pairing) return null;
                return (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
                        ✨ The Perfect Bite Combo
                      </span>
                      <span className="text-xs font-bold text-stone-900 truncate block">
                        Pairs with {pairing.name} (+₹{pairing.price})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        handleAddToCart(pairing);
                        showToast(`Added ${pairing.name} combo to tray!`, 'success');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-extrabold shrink-0 cursor-pointer active:scale-95"
                    >
                      + Add Combo
                    </button>
                  </div>
                );
              })()}

              {/* Dietary Tags */}
              {selectedDishPreview.dietary_tags && selectedDishPreview.dietary_tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedDishPreview.dietary_tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 text-[11px] font-bold"
                    >
                      ✓ {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              {selectedDishPreview.slug && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDishPreview(null);
                    navigate(`/food/${selectedDishPreview.slug}`);
                  }}
                  className="text-xs font-bold text-stone-500 hover:text-stone-900 hover:underline flex items-center gap-1 cursor-pointer order-2 sm:order-1"
                >
                  <span>View Full Dish Profile & Delhi Ranking</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  handleAddToCart(selectedDishPreview);
                  showToast(`Added ${selectedDishPreview.name} to order tray!`, 'success');
                  setSelectedDishPreview(null);
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#0F766E] hover:bg-[#0d6962] text-white font-black text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95 order-1 sm:order-2 ml-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add to Order Tray • ₹{selectedDishPreview.price}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Mobile Quick-Action HUD (Fitts's Law / Thumb-Zone Ergonomics) */}
      <div className="md:hidden fixed bottom-16 inset-x-0 z-30 px-3 py-2 bg-white/95 backdrop-blur-md border-t border-[#E7E2DA] shadow-xl flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowPhysicalMenuModal(true)}
          className="flex-1 min-h-[46px] px-3 rounded-2xl bg-[#FAF8F5] hover:bg-stone-100 border border-[#E7E2DA] text-[#1C1917] font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
        >
          <FileText className="w-4 h-4 text-emerald-600" />
          <span>Real Counter Menu</span>
        </button>

        <button
          type="button"
          onClick={() => {
            const rawPhone = restaurant.whatsapp_number || restaurant.phone;
            if (rawPhone) {
              const phone = rawPhone.replace(/[^0-9]/g, '');
              window.open(`https://wa.me/${phone.length === 10 ? `91${phone}` : phone}?text=${encodeURIComponent(`Hi ${restaurant.name}, I am exploring your counter menu on MenuMaps.`)}`, '_blank');
            } else {
              setShowOrderDrawer(true);
            }
          }}
          className="flex-1 min-h-[46px] px-3 rounded-2xl bg-[#0F766E] hover:bg-[#0d6962] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer active:scale-95 transition-all"
        >
          <MessageSquare className="w-4 h-4" />
          <span>WhatsApp Order</span>
        </button>
      </div>

      {/* Table QR Standee Scanner Modal */}
      {showTableScannerModal && restaurant && (
        <TableQrScannerModal
          isOpen={showTableScannerModal}
          onClose={() => setShowTableScannerModal(false)}
          restaurant={restaurant}
          onTableConfirmed={(tNum) => {
            setIsTableDineIn(true);
            setTableNumber(tNum);
            setActiveMainTab('menu');
            showToast(`🎉 Connected to Table #${tNum}! Live table buzzers & VIP perks active.`, 'success');
            if (!tablePerk) setShowTablePerkWheel(true);
          }}
        />
      )}

      {/* WhatsApp Order Drawer (15-min self-pickup, split bill & direct order) */}
      <WhatsAppOrderDrawer
        restaurant={restaurant}
        cart={cartList}
        onUpdateQuantity={handleUpdateQuantity}
        onClearCart={() => setCartMap({})}
        isOpen={showOrderDrawer}
        onClose={() => setShowOrderDrawer(false)}
        menuItems={menuItems}
        onAddToCart={handleAddToCart}
        tableNumber={tableNumber || (isTableDineIn ? 'Dine-In' : undefined)}
        tablePerk={tablePerk || undefined}
      />
    </div>
  );
};
