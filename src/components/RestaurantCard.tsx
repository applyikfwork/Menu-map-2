import React, { useState, useEffect } from 'react';
import { 
  Star, 
  MapPin, 
  Bookmark, 
  Utensils, 
  Clock, 
  ArrowUpRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Restaurant } from '../types/database';
import { isBookmarked, toggleBookmark } from '../lib/bookmarks';
import { formatDistance } from '../lib/location';

interface RestaurantCardProps {
  restaurant: Restaurant;
  navigate: (path: string) => void;
  userDistanceKm?: number;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  navigate,
  userDistanceKm,
}) => {
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    setBookmarked(isBookmarked('restaurant', restaurant.id));
  }, [restaurant.id]);

  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = toggleBookmark('restaurant', restaurant.id);
    setBookmarked(next);
  };

  const isPureVeg = restaurant.dietary_options?.includes('Pure Veg');
  const signatureDish = restaurant.known_for_dishes?.[0];
  const cost = restaurant.average_cost_for_two || 350;

  return (
    <div
      onClick={() => navigate(`/${restaurant.slug}`)}
      className="lift group relative flex flex-col bg-white rounded-[28px] overflow-hidden border border-[#EFEAE2] cursor-pointer text-left transition-all duration-300"
    >
      {/* Cover image container with .ph texture */}
      <div className="ph relative aspect-[16/10] overflow-hidden bg-stone-100">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between gap-2 z-10">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-white text-[#0F766E] text-xs font-extrabold shadow-sm flex items-center gap-1">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              Verified
            </span>
            {isPureVeg && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold border border-emerald-300 shadow-sm">
                Pure Veg
              </span>
            )}
          </div>

          <button
            onClick={handleBookmarkToggle}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform active:scale-90 shadow-sm ${
              bookmarked
                ? 'bg-[#FF5A36] text-white'
                : 'bg-white/90 hover:bg-white text-stone-700'
            }`}
            title={bookmarked ? 'Remove bookmark' : 'Bookmark restaurant'}
          >
            <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Bottom Badges on Image */}
        <div className="absolute bottom-3.5 inset-x-3.5 flex items-center justify-between text-white z-10">
          {typeof userDistanceKm === 'number' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-xs font-bold text-teal-300">
              <MapPin className="w-3 h-3 text-[#2DD4BF]" />
              {formatDistance(userDistanceKm)}
            </span>
          ) : (
            <span className="text-xs font-bold text-stone-200 drop-shadow-sm">
              {restaurant.landmark || restaurant.city}
            </span>
          )}

          <span className="px-3 py-1 rounded-full bg-[#1C1917] text-white text-xs font-bold shadow-sm">
            {restaurant.is_open ? 'Open now' : 'Opens 11 AM'}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h3 className="hd text-xl sm:text-[22px] font-bold text-[#1C1917] group-hover:text-[#D8350F] transition-colors line-clamp-1 leading-snug">
              {restaurant.name}
            </h3>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#0F766E] text-white font-extrabold text-xs shrink-0">
              <Star className="w-3 h-3 fill-white" />
              {restaurant.rating_avg > 0 ? restaurant.rating_avg.toFixed(1) : '4.5'}
            </span>
          </div>

          <p className="mt-1.5 text-xs text-[#78716C] line-clamp-1 font-medium">
            {restaurant.cuisine_types?.length ? restaurant.cuisine_types.join(' · ') : 'Cafe · Continental'}
          </p>

          {signatureDish ? (
            <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#57534E] font-medium bg-[#FAF8F5] border border-[#E7E2DA] px-2.5 py-1 rounded-lg">
              <Utensils className="w-3 h-3 text-[#FF5A36] shrink-0" />
              <span className="truncate">Famous for: <strong className="text-[#1C1917]">{signatureDish}</strong></span>
            </div>
          ) : (
            <p className="mt-2 text-xs text-[#57534E] line-clamp-2 leading-relaxed">
              {restaurant.short_description || `${restaurant.address_line1}, ${restaurant.city}`}
            </p>
          )}
        </div>

        {/* Dashed divider & For Two Price */}
        <div className="mt-4 pt-3.5 border-t border-dashed border-[#E7E2DA] flex items-center justify-between">
          <span className="text-xs font-semibold text-[#57534E]">
            Cost for two
          </span>
          <span className="hd text-xl font-extrabold text-[#D8350F]">
            ₹{cost}
          </span>
        </div>
      </div>
    </div>
  );
};
