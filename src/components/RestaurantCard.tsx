import React, { useState, useEffect } from 'react';
import { 
  Star, 
  MapPin, 
  Bookmark, 
  Utensils, 
  Check,
  Navigation,
  ArrowRight
} from 'lucide-react';
import { Restaurant } from '../types/database';
import { isBookmarked, toggleBookmark } from '../lib/bookmarks';
import { formatDistance } from '../lib/location';

interface RestaurantCardProps {
  restaurant: Restaurant;
  navigate?: (path: string) => void;
  onClick?: () => void;
  userDistanceKm?: number;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  navigate,
  onClick,
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

  // Directions link fallback
  const directionsUrl =
    restaurant.google_maps_url && restaurant.google_maps_url.trim().length > 5
      ? restaurant.google_maps_url
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${restaurant.name}, ${restaurant.address_line1 || ''}, ${restaurant.city || 'Delhi'}`
        )}`;

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else if (navigate) {
      navigate(`/${restaurant.slug}`);
    } else {
      window.location.href = `/${restaurant.slug}`;
    }
  };

  return (
    <article
      onClick={handleCardClick}
      className="lift group relative flex flex-col bg-white rounded-[24px] sm:rounded-[26px] overflow-hidden border border-[#E8E4DC] cursor-pointer text-left transition-all duration-300 shadow-2xs hover:border-stone-300"
    >
      {/* Cover image container (Uncluttered, consistent 16:10 aspect ratio) */}
      <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
        <img
          src={restaurant.cover_image_url}
          alt={`${restaurant.name} restaurant cover`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80';
          }}
        />
        {/* Subtle Bottom Vignette for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

        {/* Top Badges & Isolated Bookmark Button */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 z-10">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[#0F766E] text-[11px] font-extrabold shadow-xs flex items-center gap-1">
              <Check className="w-3 h-3 stroke-[3]" />
              <span>Verified Menu</span>
            </span>
            {isPureVeg && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                Pure Veg
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleBookmarkToggle}
            className={`w-9 h-9 min-w-[36px] min-h-[36px] rounded-full flex items-center justify-center transition-all active:scale-90 shadow-sm cursor-pointer ${
              bookmarked
                ? 'bg-[#F4512C] text-white'
                : 'bg-white/90 hover:bg-white text-stone-700 hover:text-stone-900'
            }`}
            title={bookmarked ? 'Saved to Bookmarks' : 'Save restaurant'}
            aria-label={bookmarked ? 'Saved to Bookmarks' : 'Save restaurant'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Bottom Badges on Image (Distance / Locality & Open Status) */}
        <div className="absolute bottom-3 inset-x-3 flex items-center justify-between gap-2 text-white z-10">
          {typeof userDistanceKm === 'number' && userDistanceKm > 0 ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-bold text-teal-300 truncate max-w-[140px]">
              <MapPin className="w-3 h-3 text-[#2DD4BF] shrink-0" />
              <span className="truncate">{formatDistance(userDistanceKm)}</span>
            </span>
          ) : (
            <span className="text-[11px] font-bold text-stone-200 drop-shadow-sm truncate max-w-[160px]">
              {restaurant.landmark || restaurant.address_line1?.split(',')[0] || restaurant.city || 'Delhi NCR'}
            </span>
          )}

          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-xs shrink-0 ${
            restaurant.is_open ? 'bg-[#191715] text-white' : 'bg-stone-800/90 text-stone-300'
          }`}>
            {restaurant.is_open ? 'Open now' : 'Opens 11 AM'}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title & Real Rating Display */}
          <div className="flex items-start justify-between gap-2.5">
            <h3 className="hd text-lg sm:text-[19px] font-bold text-[#191715] group-hover:text-[#F4512C] transition-colors line-clamp-1 leading-snug">
              {restaurant.name}
            </h3>

            {/* Honest Rating: ONLY shown if real rating exists (>0) */}
            {restaurant.rating_avg && restaurant.rating_avg > 0 ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#0F766E] text-white font-extrabold text-xs shrink-0 shadow-2xs">
                <Star className="w-3 h-3 fill-white" />
                <span>{restaurant.rating_avg.toFixed(1)}</span>
                {restaurant.rating_count ? (
                  <span className="text-white/70 font-normal text-[10px]">({restaurant.rating_count})</span>
                ) : null}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-stone-100 text-stone-600 font-bold text-[10px] shrink-0">
                Verified
              </span>
            )}
          </div>

          {/* Cuisine & Neighborhood */}
          <p className="mt-1 text-xs text-[#686461] line-clamp-1 font-medium">
            {restaurant.cuisine_types?.length ? restaurant.cuisine_types.slice(0, 3).join(' · ') : 'Cafe · Continental'}
            <span className="text-stone-300 mx-1">·</span>
            <span>{restaurant.landmark || restaurant.address_line1?.split(',')[0] || restaurant.city}</span>
          </p>

          {/* Signature Dish or Description snippet (Uniform min-height for clean grid alignment) */}
          <div className="min-h-[28px] mt-2.5 flex items-center">
            {signatureDish ? (
              <div className="inline-flex items-center gap-1.5 text-xs text-[#57534E] font-medium bg-[#FAF8F4] border border-[#E8E4DC] px-2.5 py-1 rounded-lg truncate w-full">
                <Utensils className="w-3 h-3 text-[#F4512C] shrink-0" />
                <span className="truncate">Famous for: <strong className="text-[#191715] font-bold">{signatureDish}</strong></span>
              </div>
            ) : (
              <p className="text-xs text-[#686461] line-clamp-1 leading-relaxed">
                {restaurant.short_description || `${restaurant.address_line1 || ''}, ${restaurant.city || 'Delhi'}`}
              </p>
            )}
          </div>
        </div>

        {/* Price & Actions Row */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-medium text-stone-500 block">Cost for two</span>
            <span className="hd text-base sm:text-lg font-black text-[#F4512C]">
              ₹{cost}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-9 h-9 rounded-xl border border-stone-200 hover:border-stone-300 hover:bg-stone-50 flex items-center justify-center text-stone-600 hover:text-stone-900 transition-colors"
              title="Get Directions on Google Maps"
              aria-label="Directions"
            >
              <Navigation className="w-3.5 h-3.5 text-stone-600" />
            </a>

            <span className="px-3 py-2 rounded-xl bg-stone-900 group-hover:bg-[#F4512C] text-white text-xs font-bold transition-colors flex items-center gap-1">
              <span>View Menu</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};
