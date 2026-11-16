import React from 'react';
import { Utensils, MessageSquare, ArrowRight, MapPin, ShieldCheck, Flame } from 'lucide-react';
import { MenuItem } from '../../types/database';
import { getSmartDishImage } from '../../lib/dishImageRegistry';

interface GuideDishCardProps {
  dish: MenuItem & {
    restaurant_name?: string;
    restaurant_slug?: string;
    restaurant_address?: string;
    restaurant_city?: string;
    restaurant_phone?: string;
  };
  rank?: number;
  navigate: (path: string) => void;
}

export const GuideDishCard: React.FC<GuideDishCardProps> = ({ dish, rank, navigate }) => {
  const isVeg = dish.dietary_tags?.includes('Veg') || (dish as any).is_veg;
  const image = dish.image_url || getSmartDishImage(dish.name, dish.category_id);
  const deliveryEstimated = Math.round(dish.price * 1.32 + 25);
  const savings = deliveryEstimated - dish.price;

  const handleWhatsAppOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = dish.restaurant_phone || '919876543210';
    const text = encodeURIComponent(
      `Hello! I found your *${dish.name}* (₹${dish.price}) on Menu Maps. I would like to place an order at your verified counter rate.`
    );
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200/90 hover:border-[#FF5A36]/40 shadow-sm hover:shadow-md transition-all p-4 sm:p-5 flex flex-col justify-between group">
      <div className="space-y-3.5">
        {/* Top Image & Badge Container */}
        <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-stone-100">
          <img
            src={image}
            alt={dish.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Rank Badge */}
          {rank !== undefined && (
            <div className="absolute top-2.5 left-2.5 w-7 h-7 rounded-full bg-stone-900/90 text-white text-xs font-black flex items-center justify-center shadow-md">
              #{rank}
            </div>
          )}

          {/* Diet Tag */}
          <div className="absolute top-2.5 right-2.5">
            {isVeg ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                Pure Veg
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                Non-Veg
              </span>
            )}
          </div>

          {/* Price overlay banner */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-white/95 backdrop-blur-md rounded-xl p-2 flex items-center justify-between border border-stone-200/60 shadow-xs">
            <div>
              <span className="text-[10px] text-stone-500 font-semibold block uppercase">Counter Rate</span>
              <span className="text-base font-black text-stone-900">₹{dish.price}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-stone-400 line-through block">₹{deliveryEstimated} app</span>
              <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                Save ₹{savings}
              </span>
            </div>
          </div>
        </div>

        {/* Dish Title & Description */}
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-black text-stone-900 group-hover:text-[#FF5A36] transition-colors line-clamp-1">
            {dish.name}
          </h3>
          {dish.description && (
            <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
              {dish.description}
            </p>
          )}
        </div>

        {/* Restaurant Info */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
          <button
            onClick={() => dish.restaurant_slug && navigate(`/restaurant/${dish.restaurant_slug}`)}
            className="flex items-center gap-1.5 font-bold hover:text-[#FF5A36] text-left truncate cursor-pointer"
          >
            <Utensils className="w-3.5 h-3.5 text-[#FF5A36] shrink-0" />
            <span className="truncate">{dish.restaurant_name || 'Verified Cafe'}</span>
          </button>
          {dish.restaurant_address && (
            <span className="text-[11px] text-stone-400 truncate max-w-[120px] text-right">
              {dish.restaurant_address}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 mt-3 border-t border-stone-100 grid grid-cols-2 gap-2">
        {dish.slug ? (
          <button
            onClick={() => navigate(`/food/${dish.slug}`)}
            className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <span>Rate Card</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div />
        )}

        {dish.restaurant_slug && (
          <button
            onClick={() => navigate(`/restaurant/${dish.restaurant_slug}`)}
            className="px-3 py-2 rounded-xl bg-[#FF5A36] hover:bg-[#D8350F] text-white text-xs font-bold flex items-center justify-center gap-1 transition-colors shadow-xs cursor-pointer"
          >
            <span>Full Menu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
