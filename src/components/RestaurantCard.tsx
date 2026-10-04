import React, { useState, useEffect } from 'react';
import { 
  Star, 
  MapPin, 
  Bookmark, 
  Utensils, 
  Clock, 
  Phone, 
  ArrowUpRight,
  ShieldAlert
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

  return (
    <div
      onClick={() => navigate(`/${restaurant.slug}`)}
      className="group relative bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col cursor-pointer"
    >
      {/* Cover Image Container */}
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Badges on Top */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 z-10">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Open / Closed / Temporarily Closed */}
            {restaurant.is_temporarily_closed ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-xs flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                Temp Closed
              </span>
            ) : restaurant.is_open ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/90 backdrop-blur-md text-white shadow-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Open Now
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-stone-900/80 backdrop-blur-md text-white shadow-xs">
                Closed
              </span>
            )}

            {isPureVeg && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Pure Veg
              </span>
            )}

            {restaurant.is_featured && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-xs">
                Featured
              </span>
            )}
          </div>

          {/* Bookmark Button */}
          <button
            onClick={handleBookmarkToggle}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 ${
              bookmarked
                ? 'bg-rose-500 text-white shadow-md'
                : 'bg-white/80 hover:bg-white text-stone-700 backdrop-blur-sm shadow-xs'
            }`}
            title={bookmarked ? 'Remove bookmark' : 'Bookmark restaurant'}
          >
            <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Bottom Banner inside Image: Rating & Distance */}
        <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-white z-10">
          <div className="flex items-center gap-1.5 bg-stone-950/70 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10 text-xs font-bold">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{restaurant.rating_avg > 0 ? restaurant.rating_avg.toFixed(1) : 'New'}</span>
            {restaurant.rating_count > 0 && (
              <span className="text-stone-400 font-normal">({restaurant.rating_count})</span>
            )}
          </div>

          {typeof userDistanceKm === 'number' && (
            <div className="flex items-center gap-1 bg-stone-950/70 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10 text-xs font-semibold text-emerald-300">
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span>{formatDistance(userDistanceKm)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Content Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-heading font-extrabold text-lg text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-1">
              {restaurant.name}
            </h3>
            <span className="text-xs font-bold text-slate-500 shrink-0 bg-stone-100 px-2 py-0.5 rounded-md">
              {restaurant.price_range}
            </span>
          </div>

          <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-medium">
            {restaurant.cuisine_types?.length ? restaurant.cuisine_types.join(' • ') : 'Cafe & Bites'}
          </p>

          <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
            {restaurant.short_description || `${restaurant.address_line1}, ${restaurant.city}`}
          </p>
        </div>

        {/* Known for dishes chips */}
        {restaurant.known_for_dishes && restaurant.known_for_dishes.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-hidden text-[11px] text-slate-500 font-medium">
            <Utensils className="w-3 h-3 text-orange-500 shrink-0" />
            <span className="truncate">Known for: {restaurant.known_for_dishes.slice(0, 3).join(', ')}</span>
          </div>
        )}

        {/* Footer info & Hover Actions */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            <span className="text-slate-400">Avg cost: </span>
            <span className="font-bold text-slate-800">
              ₹{restaurant.average_cost_for_two} for two
            </span>
          </div>

          <span className="inline-flex items-center gap-1 text-rose-600 font-bold group-hover:translate-x-1 transition-transform">
            View Menu
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
