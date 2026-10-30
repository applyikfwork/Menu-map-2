import React, { useState, useEffect, useMemo } from 'react';
import { 
  Star, 
  MapPin, 
  Bookmark, 
  Utensils, 
  ShieldCheck, 
  Check,
  MessageCircle,
  Train,
  ArrowRight,
  Navigation
} from 'lucide-react';
import { Restaurant } from '../types/database';
import { isBookmarked, toggleBookmark } from '../lib/bookmarks';
import { 
  formatDistance,
  calculateTravelEstimate,
  getGoogleMapsDirectionsUrl,
  getNearestMetroStation,
  GeoCoordinates
} from '../lib/location';

interface RestaurantCardProps {
  restaurant: Restaurant;
  navigate?: (path: string) => void;
  onClick?: () => void;
  userDistanceKm?: number;
  userCoords?: GeoCoordinates | null;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  navigate,
  onClick,
  userDistanceKm,
  userCoords,
}) => {
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    setBookmarked(isBookmarked('restaurant', restaurant.id));
  }, [restaurant.id]);

  const travel = typeof userDistanceKm === 'number' ? calculateTravelEstimate(userDistanceKm) : null;
  const metroInfo = useMemo(() => {
    if (typeof restaurant.latitude === 'number' && typeof restaurant.longitude === 'number') {
      return getNearestMetroStation(restaurant.latitude, restaurant.longitude);
    }
    return null;
  }, [restaurant.latitude, restaurant.longitude]);

  const handleDirectionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof restaurant.latitude === 'number' && typeof restaurant.longitude === 'number') {
      const mode = travel?.primaryMode === 'walk' ? 'walking' : 'driving';
      const url = getGoogleMapsDirectionsUrl(
        restaurant.latitude,
        restaurant.longitude,
        restaurant.name,
        userCoords,
        mode
      );
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      const query = encodeURIComponent(`${restaurant.name}, ${restaurant.address_line1 || ''}, ${restaurant.city}`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank', 'noopener,noreferrer');
    }
  };

  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = toggleBookmark('restaurant', restaurant.id);
    setBookmarked(next);
  };

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const num = restaurant.whatsapp_number || restaurant.phone;
    if (num) {
      const cleanNum = num.replace(/\D/g, '');
      const formattedNum = cleanNum.startsWith('91') ? cleanNum : `91${cleanNum}`;
      const msg = encodeURIComponent(`Hi! I found ${restaurant.name} on MenuMaps. I would like to check counter prices and place an order.`);
      window.open(`https://wa.me/${formattedNum}?text=${msg}`, '_blank', 'noopener,noreferrer');
    } else if (navigate) {
      navigate(`/${restaurant.slug}`);
    }
  };

  const isPureVeg = restaurant.dietary_options?.includes('Pure Veg');
  const signatureDishes = restaurant.known_for_dishes?.slice(0, 2) || [];
  const cost = restaurant.average_cost_for_two || 350;

  return (
    <div
      onClick={() => {
        if (onClick) onClick();
        else if (navigate) navigate(`/${restaurant.slug}`);
      }}
      className="lift group relative flex flex-col bg-white rounded-[26px] overflow-hidden border border-[#E7E2DA] hover:border-[#FF5A36]/40 shadow-xs hover:shadow-xl cursor-pointer text-left transition-all duration-300"
    >
      {/* Cover image container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
        <img
          src={restaurant.cover_image_url}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 z-10">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#0F766E] text-[11px] font-black shadow-sm flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E]" />
              100% Counter Verified
            </span>
            {isPureVeg && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold shadow-sm flex items-center gap-1">
                🌱 Pure Veg
              </span>
            )}
          </div>

          <button
            onClick={handleBookmarkToggle}
            className={`w-9 h-9 min-w-[36px] min-h-[36px] rounded-full flex items-center justify-center transition-transform active:scale-90 shadow-sm cursor-pointer ${
              bookmarked
                ? 'bg-[#FF5A36] text-white'
                : 'bg-white/90 hover:bg-white text-stone-700'
            }`}
            title={bookmarked ? 'Remove bookmark' : 'Bookmark restaurant'}
            aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark restaurant'}
          >
            <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Bottom Badges on Image (Real Ground Distance & Travel Time) */}
        <div className="absolute bottom-3 inset-x-3 flex items-center justify-between gap-2 text-white z-10">
          <div className="flex items-center gap-1.5 min-w-0">
            {travel ? (
              <button
                type="button"
                onClick={handleDirectionsClick}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 hover:bg-black/90 backdrop-blur-md text-xs font-bold text-teal-300 truncate transition-all cursor-pointer shadow-sm active:scale-95"
                title="Click for turn-by-turn directions in Google Maps"
              >
                <MapPin className="w-3.5 h-3.5 text-[#2DD4BF] shrink-0" />
                <span className="font-extrabold">{travel.distanceLabel}</span>
                <span className="text-stone-300">·</span>
                <span>{travel.primaryTimeLabel}</span>
                <Navigation className="w-3 h-3 text-teal-300 ml-0.5 shrink-0" />
              </button>
            ) : metroInfo ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-xs font-bold text-amber-300 truncate max-w-[190px]">
                <Train className="w-3 h-3 text-amber-300 shrink-0" />
                <span className="truncate">{metroInfo.name}</span>
              </span>
            ) : (
              <span className="text-xs font-bold text-stone-200 drop-shadow-sm truncate max-w-[160px]">
                {restaurant.landmark || restaurant.city}
              </span>
            )}
          </div>

          <span className="px-2.5 py-0.5 rounded-full bg-[#1C1917]/90 backdrop-blur-md text-white text-[11px] font-bold shadow-sm shrink-0">
            {restaurant.is_open ? 'Open now' : 'Opens 11 AM'}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="hd text-lg sm:text-xl font-bold text-[#1C1917] group-hover:text-[#D8350F] transition-colors line-clamp-1 leading-snug">
              {restaurant.name}
            </h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xl bg-[#0F766E] text-white font-black text-xs shrink-0">
              <Star className="w-3 h-3 fill-white" />
              {restaurant.rating_avg > 0 ? restaurant.rating_avg.toFixed(1) : '4.5'}
            </span>
          </div>

          {/* Real Ground Location & Landmark */}
          <div className="mt-1 flex items-center gap-1.5 text-xs text-[#57534E] font-medium truncate">
            <MapPin className="w-3 h-3 text-[#FF5A36] shrink-0" />
            <span className="truncate">
              {restaurant.landmark || restaurant.address_line1 || restaurant.city}
            </span>
            {metroInfo && (
              <span className="hidden sm:inline text-stone-400 shrink-0">
                · 🚇 {metroInfo.name}
              </span>
            )}
          </div>

          <p className="mt-1 text-xs text-[#78716C] line-clamp-1 font-medium">
            {restaurant.cuisine_types?.length ? restaurant.cuisine_types.slice(0, 3).join(' · ') : 'Cafe · Continental'}
            {restaurant.city_area ? ` · ${restaurant.city_area}` : ''}
          </p>

          {/* Signature Cravings Ticker */}
          {signatureDishes.length > 0 ? (
            <div className="mt-2.5 inline-flex items-center gap-1.5 text-xs text-[#57534E] font-medium bg-[#FAF8F5] border border-[#E7E2DA] px-2.5 py-1 rounded-xl w-full">
              <Utensils className="w-3 h-3 text-[#FF5A36] shrink-0" />
              <span className="truncate text-[11px]">
                Famous: <strong className="text-[#1C1917]">{signatureDishes.join(', ')}</strong>
              </span>
            </div>
          ) : (
            <p className="mt-2 text-xs text-[#57534E] line-clamp-2 leading-relaxed">
              {restaurant.short_description || `${restaurant.address_line1}, ${restaurant.city}`}
            </p>
          )}
        </div>

        {/* Card Action Strip */}
        <div className="mt-3.5 pt-3 border-t border-dashed border-[#E7E2DA] flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#78716C]">
              For two
            </div>
            <div className="hd text-lg font-black text-[#D8350F] leading-tight">
              ₹{cost}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick Directions Button */}
            <button
              type="button"
              onClick={handleDirectionsClick}
              className="w-8 h-8 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#D8350F] flex items-center justify-center transition-colors cursor-pointer"
              title="Open turn-by-turn directions in Google Maps"
              aria-label="Open Google Maps directions"
            >
              <Navigation className="w-4 h-4" />
            </button>

            {(restaurant.whatsapp_number || restaurant.phone) && (
              <button
                type="button"
                onClick={handleWhatsAppClick}
                className="w-8 h-8 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition-colors cursor-pointer"
                title="Chat or order direct on WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            )}
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FAF8F5] group-hover:bg-[#1C1917] border border-[#E7E2DA] group-hover:border-[#1C1917] text-[#1C1917] group-hover:text-white text-xs font-black transition-all">
              <span>Menu</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
