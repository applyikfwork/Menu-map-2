import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Bookmark, 
  Flame, 
  Phone, 
  Navigation, 
  UtensilsCrossed, 
  ChevronRight, 
  Sparkles,
  Share2,
  MessageSquare
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

      // Fetch similar dishes across restaurants
      const allDishes = await api.getMenuItems();
      const similar = allDishes
        .filter((i) => i.id !== item.id && i.restaurant_id !== item.restaurant_id)
        .slice(0, 4);
      setSimilarDishes(similar);
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
        title: `${dish?.name} on Menu Map`,
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
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6 animate-pulse">
        <div className="h-72 bg-stone-200 rounded-3xl" />
        <div className="h-8 bg-stone-200 rounded w-1/3" />
        <div className="h-4 bg-stone-200 rounded w-1/2" />
      </div>
    );
  }

  if (!dish) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-heading font-extrabold text-2xl text-slate-800">
          Dish not found
        </h2>
        <p className="text-slate-500 text-sm">
          This menu item is currently unavailable or has been removed.
        </p>
        <button
          onClick={() => navigate('/search')}
          className="px-5 py-2.5 bg-rose-600 text-white font-bold rounded-2xl text-sm"
        >
          Explore Other Dishes
        </button>
      </div>
    );
  }

  const isVeg = dish.dietary_tags?.includes('Veg') || dish.dietary_tags?.includes('Vegan');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <button
          onClick={() => (restaurant ? navigate(`/restaurant/${restaurant.slug}`) : navigate('/'))}
          className="hover:text-slate-800 flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {restaurant?.name || 'Back'}
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span>Menu</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-slate-900 font-bold truncate">{dish.name}</span>
      </div>

      {/* Main Food Card Banner */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2">
        
        {/* Dish Image */}
        <div className="relative aspect-square md:aspect-auto h-full min-h-[340px] bg-stone-100 overflow-hidden">
          <img
            src={getSmartDishImage(dish.name, undefined, dish.image_url)}
            alt={dish.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

          {/* Badges on image */}
          <div className="absolute top-4 inset-x-4 flex items-center justify-between">
            <div
              className={`px-3 py-1 rounded-full text-xs font-bold text-white backdrop-blur-md flex items-center gap-1.5 shadow-md ${
                isVeg ? 'bg-emerald-600/90' : 'bg-rose-600/90'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-white" />
              <span>{isVeg ? 'Vegetarian' : 'Non-Vegetarian'}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
                title="Share dish"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleBookmarkToggle}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  bookmarked
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'bg-black/40 hover:bg-black/60 text-white'
                }`}
                title="Bookmark dish"
              >
                <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-white' : ''}`} />
              </button>
            </div>
          </div>

          {/* Legal Disclaimer badge overlay on corner */}
          <div
            title={IMAGE_DISCLAIMER_TEXT}
            className="absolute bottom-4 left-4 z-10 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-medium text-stone-300 border border-white/10"
          >
            {IMAGE_DISCLAIMER_BADGE}
          </div>
        </div>

        {/* Dish Info & Actions */}
        <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            
            {/* Restaurant Link */}
            {restaurant && (
              <button
                onClick={() => navigate(`/restaurant/${restaurant.slug}`)}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 group"
              >
                <span>Served at</span>
                <span className="font-extrabold underline decoration-orange-300 underline-offset-4 group-hover:text-rose-600">
                  {restaurant.name}
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
              {dish.name}
            </h1>

            {/* Price & Portions */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="font-heading font-black text-3xl text-slate-900">
                  ₹{dish.price}
                </span>
                {dish.portion_size && (
                  <span className="text-xs font-bold text-slate-500 bg-stone-100 px-2.5 py-1 rounded-md">
                    Portion: {dish.portion_size}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-500 italic">
                * Indicative reference price from public listings; subject to restaurant revision & taxes.
              </p>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              {dish.description ||
                'Crafted fresh with wholesome ingredients and signature culinary seasonings.'}
            </p>

            {/* Spice and Dietary Tags */}
            <div className="flex flex-wrap gap-2 pt-2">
              {dish.spice_level > 0 && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 text-xs font-bold">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  Spice Level: {dish.spice_level}/5
                </span>
              )}
              {dish.dietary_tags?.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1 rounded-xl bg-stone-100 text-slate-700 text-xs font-semibold"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-6 border-t border-stone-100">
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
                  msg += `_Powered by Menu Map_`;
                  const encoded = encodeURIComponent(msg);
                  const waUrl = num
                    ? `https://wa.me/${num.startsWith('91') ? num : '91' + num}?text=${encoded}`
                    : `https://wa.me/?text=${encoded}`;
                  window.open(waUrl, '_blank');
                }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                <span>Order on WhatsApp (₹{dish.price})</span>
              </button>
            )}

            {restaurant && (
              <button
                onClick={() => navigate(`/restaurant/${restaurant.slug}`)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-md transition-colors"
              >
                <UtensilsCrossed className="w-4 h-4" />
                <span>View Full Menu of {restaurant.name}</span>
              </button>
            )}

            <div className="grid grid-cols-2 gap-3">
              {restaurant?.phone && (
                <a
                  href={`tel:${restaurant.phone}`}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-slate-800 font-bold text-xs transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
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
                  className="flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-slate-800 font-bold text-xs transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5 text-rose-500" />
                  <span>Directions</span>
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

      {/* More dishes from this restaurant */}
      {sameRestaurantDishes.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-extrabold text-xl text-slate-900">
              More from {restaurant?.name}
            </h2>
            {restaurant && (
              <button
                onClick={() => navigate(`/restaurant/${restaurant.slug}`)}
                className="text-xs font-bold text-rose-600 hover:text-rose-700"
              >
                View all menu items →
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

      {/* Similar dishes across other cafes */}
      {similarDishes.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-stone-200">
          <h2 className="font-heading font-extrabold text-xl text-slate-900">
            Similar Dishes From Other Cafes
          </h2>
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
