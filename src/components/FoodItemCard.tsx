import React, { useState, useEffect } from 'react';
import { Bookmark, Flame, ArrowRight, Plus, Check, ShieldCheck } from 'lucide-react';
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

  // Compact row representation (for search drawers, side lists, mini carts)
  if (compact) {
    return (
      <div
        onClick={() => navigate(`/food/${item.slug}`)}
        className="group flex items-center justify-between p-3.5 bg-white rounded-2xl border border-[#EFEAE2] hover:border-[#FF5A36]/50 hover:shadow-md transition-all cursor-pointer gap-3"
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Dish Image Thumbnail */}
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 border border-[#EFEAE2] shrink-0">
            <img
              src={resolvedImage}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80';
              }}
            />
          </div>

          {/* Veg / Non-Veg Pip */}
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
            <h4 className="font-heading font-bold text-sm text-[#1C1917] group-hover:text-[#D8350F] truncate transition-colors">
              {item.name}
            </h4>
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <span className="font-heading font-extrabold text-[#1C1917]">₹{item.price}</span>
              {item.portion_size && <span className="text-stone-400">• {item.portion_size}</span>}
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">Counter</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onAddToOrder && (
            <button
              onClick={handleAddClick}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 active:scale-95 ${
                orderQuantity > 0
                  ? 'bg-[#0F766E] text-white shadow-xs'
                  : 'bg-[#FF5A36] hover:bg-[#D8350F] text-white shadow-xs'
              }`}
            >
              {orderQuantity > 0 ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>{orderQuantity}</span>
                </>
              ) : (
                <>
                  <Plus className="w-3 h-3" />
                  <span>Add</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={handleBookmarkToggle}
            className={`p-1.5 rounded-lg transition-colors ${
              bookmarked ? 'text-[#FF5A36]' : 'text-stone-400 hover:text-stone-600'
            }`}
            title="Bookmark dish"
          >
            <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-[#FF5A36]' : ''}`} />
          </button>
        </div>
      </div>
    );
  }

  // Standard Editorial Grid Card
  return (
    <div
      onClick={() => navigate(`/food/${item.slug}`)}
      className="group relative bg-white rounded-3xl overflow-hidden border border-[#EFEAE2] shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col cursor-pointer lift"
    >
      {/* Dish Image Hero Container */}
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
        {/* Soft bottom vignette for readable badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Top Badges Overlay */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Veg / Non-Veg Pip Badge */}
            <div
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md flex items-center gap-1.5 shadow-xs ${
                isVeg
                  ? 'bg-white/95 text-emerald-800 border border-emerald-600/30'
                  : 'bg-white/95 text-rose-800 border border-rose-600/30'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
              <span>{isVeg ? 'Veg' : 'Non-Veg'}</span>
            </div>

            {/* Must-Try / Popular Pill */}
            {(item.is_must_try || item.is_featured) && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FF5A36] text-white shadow-xs flex items-center gap-1">
                <Flame className="w-3 h-3 fill-white" />
                <span>Must Try</span>
              </span>
            )}
          </div>

          {/* Bookmark Button */}
          <button
            onClick={handleBookmarkToggle}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-90 ${
              bookmarked
                ? 'bg-[#FF5A36] text-white shadow-md'
                : 'bg-white/85 hover:bg-white text-stone-700 backdrop-blur-sm shadow-xs'
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

        {/* Price & Spice bar inside photo overlay */}
        <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-white z-10">
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading font-black text-xl drop-shadow-md">
              ₹{item.price}
            </span>
            <span className="text-[10px] font-semibold text-stone-300 drop-shadow-xs">
              counter rate
            </span>
          </div>

          {isSpicy && (
            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-orange-300 border border-white/10">
              <Flame className="w-3 h-3 text-orange-400" />
              <span>Spice {item.spice_level}/5</span>
            </div>
          )}
        </div>
      </div>

      {/* Dish Details Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 bg-white">
        <div>
          <h4 className="font-heading font-extrabold text-base text-[#1C1917] group-hover:text-[#D8350F] transition-colors line-clamp-1">
            {item.name}
          </h4>

          {restaurant && (
            <p className="text-xs text-[#D8350F] font-bold line-clamp-1 mt-0.5">
              at {restaurant.name}
            </p>
          )}

          <p className="text-xs text-stone-500 line-clamp-2 mt-2 leading-relaxed font-sans">
            {item.description || 'Prepared fresh with high quality ingredients and authentic counter recipe.'}
          </p>
        </div>

        {/* Metadata Badges (0% Markup Guarantee + Portions + Dietary) */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>0% App Markup</span>
          </span>

          {item.portion_size && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#FAF8F5] text-stone-600 border border-[#EFEAE2]">
              {item.portion_size}
            </span>
          )}

          {item.dietary_tags && item.dietary_tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#FAF8F5] text-stone-600 border border-[#EFEAE2]"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Bottom Bar: Add to Order button or View Details */}
        <div className="pt-3 border-t border-dashed border-[#EFEAE2] flex items-center justify-between text-xs">
          {onAddToOrder ? (
            <button
              onClick={handleAddClick}
              className={`flex-1 py-2 px-3 rounded-full font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                orderQuantity > 0
                  ? 'bg-[#0F766E] hover:bg-[#0D9488] text-white shadow-xs'
                  : 'bg-[#FF5A36] hover:bg-[#D8350F] text-white shadow-xs'
              }`}
            >
              {orderQuantity > 0 ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added to Order ({orderQuantity})</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add at Counter Price</span>
                </>
              )}
            </button>
          ) : (
            <div className="w-full flex items-center justify-between font-bold text-[#D8350F] group-hover:text-[#FF5A36] transition-colors">
              <span>View Dish & Counter Details</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
