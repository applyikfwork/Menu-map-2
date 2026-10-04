import React, { useState, useEffect } from 'react';
import { Bookmark, Flame, ArrowRight, Utensils, Plus, Check } from 'lucide-react';
import { MenuItem, Restaurant } from '../types/database';
import { isBookmarked, toggleBookmark } from '../lib/bookmarks';
import { getSmartDishImage, IMAGE_DISCLAIMER_BADGE, IMAGE_DISCLAIMER_TEXT } from '../lib/dishImageRegistry';

interface FoodItemCardProps {
  item: MenuItem;
  restaurant?: Restaurant;
  navigate: (path: string) => void;
  compact?: boolean;
  onAddToOrder?: (item: MenuItem) => void;
  orderQuantity?: number;
}

export const FoodItemCard: React.FC<FoodItemCardProps> = ({
  item,
  restaurant,
  navigate,
  compact = false,
  onAddToOrder,
  orderQuantity = 0,
}) => {
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    setBookmarked(isBookmarked('dish', item.id));
  }, [item.id]);

  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = toggleBookmark('dish', item.id);
    setBookmarked(next);
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToOrder) {
      onAddToOrder(item);
    }
  };

  const isVeg = item.dietary_tags?.includes('Veg') || item.dietary_tags?.includes('Vegan');
  const isSpicy = item.spice_level > 0;
  const resolvedImage = getSmartDishImage(item.name, undefined, item.image_url);

  if (compact) {
    return (
      <div
        onClick={() => navigate(`/food/${item.slug}`)}
        className="group flex items-center justify-between p-3.5 bg-white rounded-2xl border border-stone-200/80 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer gap-3"
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Dish Image Thumbnail */}
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 border border-stone-200/80 shrink-0">
            <img
              src={resolvedImage}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80';
              }}
            />
          </div>

          {/* Veg / Non-Veg Icon */}
          <div
            className={`w-4 h-4 rounded-xs border flex items-center justify-center shrink-0 ${
              isVeg ? 'border-emerald-600' : 'border-rose-600'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                isVeg ? 'bg-emerald-600' : 'bg-rose-600'
              }`}
            />
          </div>

          <div className="min-w-0">
            <h4 className="font-heading font-bold text-sm text-slate-900 group-hover:text-rose-600 truncate transition-colors">
              {item.name}
            </h4>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-bold text-slate-800">₹{item.price}</span>
              {item.portion_size && <span className="text-slate-400">• {item.portion_size}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onAddToOrder && (
            <button
              onClick={handleAddClick}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                orderQuantity > 0
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-slate-800'
              }`}
            >
              {orderQuantity > 0 ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>{orderQuantity}</span>
                </>
              ) : (
                <>
                  <Plus className="w-3 h-3 text-rose-500" />
                  <span>Add</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={handleBookmarkToggle}
            className={`p-1.5 rounded-lg transition-colors ${
              bookmarked ? 'text-rose-500' : 'text-slate-400 hover:text-slate-600'
            }`}
            title="Bookmark dish"
          >
            <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-rose-500' : ''}`} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => navigate(`/food/${item.slug}`)}
      className="group relative bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col cursor-pointer"
    >
      {/* Dish Image */}
      <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
        <img
          src={resolvedImage}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Veg / Non-Veg badge */}
            <div
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md flex items-center gap-1 shadow-xs ${
                isVeg
                  ? 'bg-emerald-500/90 text-white'
                  : 'bg-rose-500/90 text-white'
              }`}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
              {isVeg ? 'Veg' : 'Non-Veg'}
            </div>

            {item.is_featured && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-amber-950 shadow-xs">
                Popular
              </span>
            )}
          </div>

          {/* Bookmark Button */}
          <button
            onClick={handleBookmarkToggle}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-90 ${
              bookmarked
                ? 'bg-rose-500 text-white shadow-md'
                : 'bg-white/80 hover:bg-white text-stone-700 backdrop-blur-sm'
            }`}
            title="Bookmark dish"
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Presentation Disclaimer Badge in photo corner */}
        <div
          title={IMAGE_DISCLAIMER_TEXT}
          className="absolute top-12 left-3 z-10 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[9px] font-medium text-stone-300 border border-white/10"
        >
          {IMAGE_DISCLAIMER_BADGE}
        </div>

        {/* Price & Spice badge bottom */}
        <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-white z-10">
          <span className="font-heading font-extrabold text-lg drop-shadow-md">
            ₹{item.price}
          </span>

          {isSpicy && (
            <div className="flex items-center gap-0.5 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-full text-[11px] font-semibold text-orange-300">
              <Flame className="w-3 h-3 text-orange-400" />
              <span>Spice {item.spice_level}/5</span>
            </div>
          )}
        </div>
      </div>

      {/* Dish details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h4 className="font-heading font-extrabold text-base text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-1">
            {item.name}
          </h4>

          {restaurant && (
            <p className="text-xs text-orange-600 font-semibold line-clamp-1 mt-0.5">
              at {restaurant.name}
            </p>
          )}

          <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
            {item.description || 'Prepared fresh with high quality ingredients and house spices.'}
          </p>
        </div>

        {/* Dietary Chips */}
        {item.dietary_tags && item.dietary_tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {item.dietary_tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Bottom Bar: Add to Order button & Details */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
          {onAddToOrder ? (
            <button
              onClick={handleAddClick}
              className={`flex-1 py-1.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                orderQuantity > 0
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80'
              }`}
            >
              {orderQuantity > 0 ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added ({orderQuantity})</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to WhatsApp Order</span>
                </>
              )}
            </button>
          ) : (
            <div className="w-full flex items-center justify-between font-bold text-rose-600">
              <span>View Details & Similar</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

