import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Bookmark, 
  Flame, 
  Phone, 
  Navigation, 
  UtensilsCrossed, 
  ChevronRight, 
  Share2,
  MessageSquare,
  ShieldCheck,
  TrendingDown,
  Sparkles
} from 'lucide-react';
import { MenuItem, Restaurant } from '../types/database';
import { api } from '../lib/supabase';
import { isBookmarked, toggleBookmark } from '../lib/bookmarks';
import { getSmartDishImage, IMAGE_DISCLAIMER_BADGE, IMAGE_DISCLAIMER_TEXT } from '../lib/dishImageRegistry';
import { FoodItemCard } from '../components/FoodItemCard';
import { DirectoryDisclaimer } from '../components/DirectoryDisclaimer';
import { useToast } from '../components/Toast';

interface FoodDetailProps {
  slug: string;
  navigate: (path: string) => void;
}

export const FoodDetail: React.FC<FoodDetailProps> = ({ slug, navigate }) => {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [dish, setDish] = useState<MenuItem | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [sameRestaurantDishes, setSameRestaurantDishes] = useState<MenuItem[]>([]);
  const [similarDishes, setSimilarDishes] = useState<MenuItem[]>([]);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    loadDishData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  const loadDishData = async () => {
    setLoading(true);
    try {
      const item = await api.getMenuItemBySlug(slug);
      if (!item) {
        setDish(null);
        return;
      }
      setDish(item);
      setBookmarked(isBookmarked('dish', item.id));

      // Log click & view count
      api.logItemClick('food', item.id);
      api.incrementMenuItemView(item.id);

      // Fetch restaurant
      const rest = await api.getRestaurantById(item.restaurant_id);
      setRestaurant(rest);

      // Fetch other dishes from same restaurant
      const allRestaurantDishes = await api.getMenuItems(item.restaurant_id);
      setSameRestaurantDishes(allRestaurantDishes.filter((i) => i.id !== item.id).slice(0, 4));

      // Fetch contextual similar dishes across restaurants
      const allDishes = await api.getMenuItems();
      const currentKeywords = item.name
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 2);
      const isCurrentVeg = item.dietary_tags?.includes('Veg');

      const scoredSimilar = allDishes
        .filter((i) => i.id !== item.id && i.restaurant_id !== item.restaurant_id)
        .map((candidate) => {
          let score = 0;
          const candidateName = candidate.name.toLowerCase();
          
          // 1. Keyword match on dish title (e.g. coffee, pizza, momo, chicken, pasta)
          for (const kw of currentKeywords) {
            if (candidateName.includes(kw)) score += 3.0;
          }

          // 2. Category / Cuisine alignment
          if (candidate.category_id === item.category_id) score += 2.0;

          // 3. Dietary tag alignment
          const isCandidateVeg = candidate.dietary_tags?.includes('Veg');
          if (isCurrentVeg === isCandidateVeg) score += 1.5;

          // 4. Price bracket proximity (within 30%)
          if (item.price > 0 && Math.abs(candidate.price - item.price) / item.price <= 0.3) {
            score += 1.0;
          }

          // 5. Popularity boost
          if (candidate.is_must_try) score += 0.5;
          if (candidate.is_featured) score += 0.5;

          return { candidate, score };
        })
        .sort((a, b) => b.score - a.score);

      setSimilarDishes(scoredSimilar.slice(0, 4).map((s) => s.candidate));
    } catch (e) {
      console.error('Error loading food detail:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkToggle = () => {
    if (!dish) return;
    const next = toggleBookmark('dish', dish.id);
    setBookmarked(next);
    showToast(next ? 'Saved dish to bookmarks!' : 'Removed dish from bookmarks.', 'success');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${dish?.name} on Menu Maps`,
        text: dish?.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!', 'success');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-pulse">
        <div className="h-6 bg-stone-200 rounded-full w-48" />
        <div className="h-[460px] bg-stone-200 rounded-3xl" />
        <div className="h-10 bg-stone-200 rounded-2xl w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-72 bg-stone-200 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!dish) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-[#FF5A36] flex items-center justify-center mx-auto">
          <UtensilsCrossed className="w-8 h-8" />
        </div>
        <h2 className="font-heading font-black text-2xl text-[#1C1917]">
          Dish not found
        </h2>
        <p className="text-stone-500 text-sm">
          This counter menu item is currently unavailable or has been archived.
        </p>
        <button
          onClick={() => navigate('/search')}
          className="btn bg-[#FF5A36] hover:bg-[#D8350F] text-white shadow-md text-sm"
        >
          Explore Other Counter Dishes
        </button>
      </div>
    );
  }

  const isVeg = dish.dietary_tags?.includes('Veg') || dish.dietary_tags?.includes('Vegan');
  const appMarkupEstimate = Math.round(dish.price * 1.3 + 35);
  const estimatedSavings = appMarkupEstimate - dish.price;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Editorial Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 flex-wrap">
        <button
          onClick={() => (restaurant ? navigate(`/restaurant/${restaurant.slug}`) : navigate('/'))}
          className="hover:text-[#1C1917] flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#EFEAE2] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#FF5A36]" />
          <span>{restaurant?.name || 'Back to Menu'}</span>
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-stone-300" />
        <span className="text-stone-400">Counter Menu</span>
        <ChevronRight className="w-3.5 h-3.5 text-stone-300" />
        <span className="text-[#1C1917] font-bold truncate max-w-[200px]">{dish.name}</span>
      </div>

      {/* Main Counter Ticket Hero Container */}
      <div className="bg-white rounded-3xl border border-[#EFEAE2] shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 lift">
        
        {/* Left Column: High-Res Photo Hero */}
        <div className="lg:col-span-6 relative aspect-square sm:aspect-[4/3] lg:aspect-auto min-h-[260px] sm:min-h-[360px] lg:min-h-[500px] bg-stone-100 overflow-hidden">
          <img
            src={getSmartDishImage(dish.name, undefined, dish.image_url)}
            alt={dish.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Top Overlays */}
          <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
            {/* Veg / Non-Veg Badge */}
            <div
              className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md flex items-center gap-1.5 shadow-md ${
                isVeg
                  ? 'bg-white/95 text-emerald-800 border border-emerald-600/30'
                  : 'bg-white/95 text-rose-800 border border-rose-600/30'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
              <span>{isVeg ? 'Vegetarian' : 'Non-Vegetarian'}</span>
            </div>

            {/* Action Icon Pills */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/75 text-white backdrop-blur-md flex items-center justify-center transition-transform active:scale-95 border border-white/10 cursor-pointer"
                title="Share dish"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleBookmarkToggle}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform active:scale-95 cursor-pointer ${
                  bookmarked
                    ? 'bg-[#FF5A36] text-white shadow-md'
                    : 'bg-black/50 hover:bg-black/75 text-white backdrop-blur-md border border-white/10'
                }`}
                title="Bookmark dish"
              >
                <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-white' : ''}`} />
              </button>
            </div>
          </div>

          {/* Legal Presentation Disclaimer badge */}
          <div
            title={IMAGE_DISCLAIMER_TEXT}
            className="absolute bottom-4 left-4 z-10 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-medium text-stone-300 border border-white/10"
          >
            {IMAGE_DISCLAIMER_BADGE}
          </div>
        </div>

        {/* Right Column: Counter Slip & Price Transparency */}
        <div className="lg:col-span-6 p-5 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6 bg-white relative">
          
          <div className="space-y-4 sm:space-y-5">
            {/* Eyebrow & Restaurant Badge */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              {restaurant && (
                <button
                  onClick={() => navigate(`/restaurant/${restaurant.slug}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#EFEAE2] text-xs font-bold text-[#D8350F] hover:border-[#D8350F]/40 transition-colors cursor-pointer"
                >
                  <span>Served at</span>
                  <span className="underline decoration-dotted underline-offset-2">{restaurant.name}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}

              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>0% App Markup</span>
              </span>
            </div>

            {/* Dish Heading */}
            <h1 className="hd font-black text-2xl sm:text-4xl text-[#1C1917] tracking-tight leading-tight">
              {dish.name}
            </h1>

            {/* Price Transparency Bento Box */}
            <div className="bg-[#FAF8F5] rounded-2xl border border-[#EFEAE2] p-4 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-baseline justify-between gap-2">
                <div>
                  <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Official Counter Price</div>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="hd font-black text-3xl sm:text-4xl text-[#1C1917]">
                      ₹{dish.price}
                    </span>
                    {dish.portion_size && (
                      <span className="text-xs font-bold text-stone-600 bg-white border border-[#EFEAE2] px-2.5 py-0.5 rounded-md">
                        {dish.portion_size}
                      </span>
                    )}
                  </div>
                </div>

                <div className="sm:text-right">
                  <div className="text-[11px] font-medium text-stone-400 line-through">
                    Apps charge ~₹{appMarkupEstimate}
                  </div>
                  <div className="inline-flex items-center gap-1 text-xs font-black text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full mt-0.5">
                    <TrendingDown className="w-3 h-3" />
                    <span>Save ₹{estimatedSavings}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-dashed border-stone-200 text-[11px] text-stone-500 flex items-center justify-between">
                <span>* Direct cafe counter rate. No food app commissions added.</span>
                <span className="font-bold text-emerald-700">Verified Menu</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-stone-600 leading-relaxed font-sans">
              {dish.description ||
                'Crafted fresh with wholesome ingredients and signature culinary seasonings.'}
            </p>

            {/* Dietary & Spice Tags */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {dish.spice_level > 0 && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-orange-900 text-xs font-bold">
                  <Flame className="w-3.5 h-3.5 text-[#FF5A36]" />
                  <span>Spice Level: {dish.spice_level}/5</span>
                </span>
              )}
              {dish.dietary_tags?.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1 rounded-full bg-white border border-[#EFEAE2] text-stone-700 text-xs font-semibold"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-6 border-t border-[#EFEAE2]">
            {restaurant && (restaurant.whatsapp_number || restaurant.phone) && (
              <button
                onClick={() => {
                  const rawNum = restaurant.whatsapp_number || restaurant.phone || '';
                  const num = rawNum.replace(/\D/g, '');
                  const liveUrl = window.location.href;
                  let msg = `🍽️ *ORDER REQUEST via Menu Map*\n`;
                  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
                  msg += `📍 *Restaurant:* ${restaurant.name}\n`;
                  msg += `🍽️ *Dish:* ${dish.name} (₹${dish.price})\n`;
                  msg += `🔗 *Live Menu Link:* ${liveUrl}\n`;
                  msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
                  msg += `Hello! I would like to order:\n`;
                  msg += `• 1x *${dish.name}* (₹${dish.price})\n\n`;
                  msg += `Please confirm availability & delivery/dine-in timing.\n\n`;
                  msg += `_Powered by Menu Map (0% App Markup)_`;
                  const encoded = encodeURIComponent(msg);
                  const waUrl = num
                    ? `https://wa.me/${num.startsWith('91') ? num : '91' + num}?text=${encoded}`
                    : `https://wa.me/?text=${encoded}`;
                  window.open(waUrl, '_blank');
                }}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-full bg-[#0F766E] hover:bg-[#0D9488] text-white font-extrabold text-sm shadow-md transition-all active:scale-95"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                <span>Order on WhatsApp at Counter Price (₹{dish.price})</span>
              </button>
            )}

            {restaurant && (
              <button
                onClick={() => navigate(`/restaurant/${restaurant.slug}`)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#1C1917] hover:bg-stone-800 text-white font-bold text-sm shadow-xs transition-colors"
              >
                <UtensilsCrossed className="w-4 h-4" />
                <span>View Complete Menu of {restaurant.name}</span>
              </button>
            )}

            {/* Quick Actions (Call & Directions) */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {restaurant?.phone && (
                <a
                  href={`tel:${restaurant.phone}`}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-full bg-white hover:bg-stone-50 border border-[#EFEAE2] text-[#1C1917] font-bold text-xs transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span>Call Venue</span>
                </a>
              )}

              {restaurant && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${restaurant.name}, ${restaurant.address_line1}, ${restaurant.city}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 rounded-full bg-white hover:bg-stone-50 border border-[#EFEAE2] text-[#1C1917] font-bold text-xs transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#FF5A36]" />
                  <span>Get Directions</span>
                </a>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Directory Transparency Notice */}
      <DirectoryDisclaimer
        restaurantName={restaurant?.name}
        restaurantPhone={restaurant?.phone || restaurant?.whatsapp_number}
        variant="compact"
      />

      {/* More Must-Try Dishes from Same Restaurant */}
      {sameRestaurantDishes.length > 0 && (
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="eyebrow text-[#FF5A36]">Kitchen Specialties</span>
              <h2 className="font-heading font-black text-2xl text-[#1C1917] mt-0.5">
                More from {restaurant?.name}
              </h2>
            </div>
            {restaurant && (
              <button
                onClick={() => navigate(`/restaurant/${restaurant.slug}`)}
                className="text-xs font-bold text-[#D8350F] hover:text-[#FF5A36] flex items-center gap-1 group"
              >
                <span>View all menu items</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sameRestaurantDishes.map((item) => (
              <FoodItemCard
                key={item.id}
                item={item}
                restaurant={restaurant || undefined}
                navigate={navigate}
              />
            ))}
          </div>
        </div>
      )}

      {/* Similar Dishes Across Delhi */}
      {similarDishes.length > 0 && (
        <div className="space-y-6 pt-8 border-t border-[#EFEAE2]">
          <div>
            <span className="eyebrow text-[#0F766E]">Food Discovery</span>
            <h2 className="font-heading font-black text-2xl text-[#1C1917] mt-0.5">
              Similar Dishes Across Delhi Cafes
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarDishes.map((item) => (
              <FoodItemCard
                key={item.id}
                item={item}
                navigate={navigate}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
