import React from 'react';
import { Sparkles, Plus, ArrowRight, Utensils } from 'lucide-react';
import { MenuItem } from '../../types/database';

interface DishPairingStripProps {
  currentDish: MenuItem;
  restaurantName: string;
  pairings: MenuItem[];
  navigate: (path: string) => void;
  onAddToCart?: (dish: MenuItem) => void;
}

export const DishPairingStrip: React.FC<DishPairingStripProps> = ({
  currentDish,
  restaurantName,
  pairings,
  navigate,
  onAddToCart,
}) => {
  if (!pairings || pairings.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-orange-50/70 via-stone-50 to-teal-50/70 rounded-3xl border border-orange-200/80 p-5 sm:p-6 shadow-2xs space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-100 text-[#D8350F] flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-heading font-black text-sm sm:text-base text-[#1C1917]">
              Complete Your Meal at {restaurantName}
            </h4>
            <p className="text-[11px] text-stone-500">
              Popular drinks &amp; sides paired with {currentDish.name}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {pairings.map((dish) => (
          <div
            key={dish.id}
            onClick={() => navigate(`/food/${dish.slug}`)}
            className="group bg-white rounded-2xl p-3 border border-stone-200/90 hover:border-[#FF5A36] transition-all cursor-pointer flex items-center justify-between gap-2.5 shadow-2xs hover:shadow-xs"
          >
            <div className="min-w-0">
              <div className="font-heading font-bold text-xs text-[#1C1917] group-hover:text-[#D8350F] transition-colors truncate">
                {dish.name}
              </div>
              <div className="text-[11px] font-black text-[#D8350F] mt-0.5">
                ₹{dish.price}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {onAddToCart && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(dish);
                  }}
                  className="p-1.5 rounded-lg bg-orange-50 hover:bg-[#FF5A36] text-[#D8350F] hover:text-white transition-colors cursor-pointer"
                  title="Add to order"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
              <div className="w-6 h-6 rounded-lg bg-stone-100 group-hover:bg-stone-200 flex items-center justify-center text-stone-400 group-hover:text-stone-700 transition-colors">
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
