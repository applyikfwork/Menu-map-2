import React, { useState, useMemo } from 'react';
import { 
  X, 
  MapPin, 
  ShieldCheck, 
  MessageSquare, 
  ExternalLink, 
  ArrowUpDown, 
  Flame, 
  TrendingDown, 
  Check, 
  Sparkles,
  Phone,
  Navigation,
  Utensils
} from 'lucide-react';
import { Restaurant, MenuItem } from '../../types/database';
import { calculateCounterSavings } from '../../lib/engine/discoveryEngine';
import { getSmartCoverImage, getSmartDishImage } from '../../lib/dishImageRegistry';

export interface MatchingRestaurantSpot {
  restaurant: Restaurant;
  dish: MenuItem;
  distanceKm?: number;
}

interface RestaurantAvailabilityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  dishName: string;
  spots: MatchingRestaurantSpot[];
  activeLocationName: string;
  navigate: (path: string) => void;
}

export const RestaurantAvailabilityDrawer: React.FC<RestaurantAvailabilityDrawerProps> = ({
  isOpen,
  onClose,
  dishName,
  spots,
  activeLocationName,
  navigate,
}) => {
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'distance' | 'rating'>('price_asc');

  // Sorted Spots
  const sortedSpots = useMemo(() => {
    return [...spots].sort((a, b) => {
      if (sortBy === 'price_asc') {
        return a.dish.price - b.dish.price;
      }
      if (sortBy === 'price_desc') {
        return b.dish.price - a.dish.price;
      }
      if (sortBy === 'distance') {
        return (a.distanceKm ?? 999) - (b.distanceKm ?? 999);
      }
      if (sortBy === 'rating') {
        return (b.restaurant.rating || 4.2) - (a.restaurant.rating || 4.2);
      }
      return 0;
    });
  }, [spots, sortBy]);

  if (!isOpen) return null;

  const lowestPrice = spots.length > 0 ? Math.min(...spots.map((s) => s.dish.price)) : 0;
  const highestPrice = spots.length > 0 ? Math.max(...spots.map((s) => s.dish.price)) : 0;

  const sampleSpot = spots[0];
  const sampleDish = sampleSpot?.dish;
  const heroImage = sampleDish
    ? getSmartDishImage(dishName, sampleDish.category_id || '', sampleDish.image_url)
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#E7E2DA] overflow-hidden my-4 max-h-[92vh] flex flex-col">
        
        {/* Drawer Header */}
        <div className="relative bg-[#1C1917] text-white p-5 sm:p-6 shrink-0 border-b border-stone-800">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden shrink-0 border-2 border-white/20 bg-stone-900 shadow-md">
                <img
                  src={heroImage}
                  alt={dishName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-[#FF5A36] text-white text-[10px] font-black uppercase tracking-wider">
                    Dish Radar
                  </span>
                  <span className="text-xs text-stone-300 font-bold">
                    Found at {spots.length} nearby {spots.length === 1 ? 'spot' : 'spots'}
                  </span>
                </div>
                <h3 className="font-heading font-black text-xl sm:text-2xl text-white mt-1">
                  Where to eat {dishName}
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Real in-store counter pricing in <strong className="text-stone-200">{activeLocationName}</strong>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Price Spectrum Banner */}
          <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-stone-400 font-medium">Price range:</span>
              <span className="font-black text-emerald-400 text-sm">₹{lowestPrice}</span>
              <span className="text-stone-500">──</span>
              <span className="font-black text-amber-300 text-sm">₹{highestPrice}</span>
            </div>

            <span className="text-[11px] font-bold text-teal-300 bg-teal-950/60 px-2.5 py-1 rounded-full border border-teal-800">
              0% Delivery App Markup
            </span>
          </div>
        </div>

        {/* Sort Command Bar */}
        <div className="px-5 sm:px-6 py-3 bg-white border-b border-[#E7E2DA] flex items-center justify-between gap-2 flex-wrap shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-500">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#FF5A36]" />
            <span>Sort by:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setSortBy('price_asc')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                sortBy === 'price_asc'
                  ? 'bg-[#1C1917] text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              Lowest Price First
            </button>

            <button
              type="button"
              onClick={() => setSortBy('distance')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                sortBy === 'distance'
                  ? 'bg-[#1C1917] text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              Nearest Distance
            </button>

            <button
              type="button"
              onClick={() => setSortBy('rating')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                sortBy === 'rating'
                  ? 'bg-[#1C1917] text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              Top Rated
            </button>
          </div>
        </div>

        {/* Restaurant Cards List */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {sortedSpots.map((spot, index) => {
            const savings = calculateCounterSavings(spot.dish.price);
            const coverImg = getSmartCoverImage(spot.restaurant.name, spot.restaurant.cuisine_types?.[0], spot.restaurant.cover_image_url);
            const isLowest = spot.dish.price === lowestPrice;
            const cleanPhone = (spot.restaurant.whatsapp_number || spot.restaurant.phone || '').replace(/[^0-9]/g, '');

            const whatsappUrl = `https://wa.me/${cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone}?text=${encodeURIComponent(
              `Hi ${spot.restaurant.name}! I found your "${spot.dish.name}" (₹${spot.dish.price}) on Menu Maps. Is it available for dine-in or direct pickup right now?`
            )}`;

            return (
              <div
                key={`${spot.restaurant.id}-${spot.dish.id}`}
                className={`rounded-2xl border transition-all p-4 sm:p-5 bg-white ${
                  isLowest
                    ? 'border-[#FF5A36] ring-2 ring-[#FF5A36]/20 shadow-md'
                    : 'border-[#E7E2DA] hover:border-stone-400 shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Restaurant Meta */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 bg-stone-100 border border-stone-200">
                      <img
                        src={coverImg}
                        alt={spot.restaurant.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h4 className="font-heading font-black text-base text-[#1C1917] truncate">
                          {spot.restaurant.name}
                        </h4>
                        <span title="Verified Storefront"><ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" /></span>
                        {isLowest && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                            🏆 Lowest Price
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                          <span>{spot.restaurant.city_area || spot.restaurant.city || activeLocationName}</span>
                        </span>
                        {typeof spot.distanceKm === 'number' && (
                          <span className="font-bold text-[#FF5A36]">
                            • {spot.distanceKm < 1 ? `${Math.round(spot.distanceKm * 1000)}m away` : `${spot.distanceKm.toFixed(1)} km`}
                          </span>
                        )}
                        {spot.restaurant.rating && (
                          <span className="text-amber-600 font-extrabold">
                            • ★ {spot.restaurant.rating.toFixed(1)}
                          </span>
                        )}
                      </div>

                      <div className="mt-1 text-xs text-stone-600 font-semibold line-clamp-1">
                        Listed on menu as: <span className="text-[#1C1917] font-bold">"{spot.dish.name}"</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Column */}
                  <div className="text-left sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100 flex sm:flex-col justify-between items-baseline sm:items-end">
                    <div>
                      <span className="text-[11px] text-stone-400 uppercase tracking-wider block font-bold">Counter MRP</span>
                      <span className="font-black text-2xl sm:text-3xl text-[#D8350F]">
                        ₹{spot.dish.price}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-stone-400">
                        Delivery App: <span className="line-through">₹{savings.deliveryAppPrice}</span>
                      </div>
                      <div className="text-xs font-black text-emerald-700">
                        Save ₹{savings.totalSavings}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Strip */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
                    {spot.restaurant.facilities?.includes('RO Water Free') && (
                      <span className="text-emerald-700 font-bold">💧 Free RO Water</span>
                    )}
                    {spot.restaurant.metro_gate && (
                      <span>🚇 {spot.restaurant.metro_gate}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-auto">
                    {cleanPhone && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn bg-[#0F766E] hover:bg-[#0d6962] text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                        title="Order directly to cafe over WhatsApp at 0% commission"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Order via WhatsApp</span>
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        navigate(`/${spot.restaurant.slug}`);
                      }}
                      className="btn bg-white hover:bg-stone-100 text-[#1C1917] border border-stone-300 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Menu</span>
                      <ExternalLink className="w-3 h-3 text-stone-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
