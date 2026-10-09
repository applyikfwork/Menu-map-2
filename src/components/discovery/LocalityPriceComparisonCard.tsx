import React from 'react';
import { ShieldCheck, TrendingDown, ChevronRight, Store, MapPin } from 'lucide-react';
import { MenuItem, Restaurant } from '../../types/database';
import { CounterSavings } from '../../lib/engine/discoveryEngine';

interface AlternativeItem {
  dish: MenuItem;
  restaurant: Restaurant;
  counterSavings: CounterSavings;
}

interface LocalityPriceComparisonCardProps {
  currentDish: MenuItem;
  localityName?: string;
  alternatives: AlternativeItem[];
  navigate: (path: string) => void;
}

export const LocalityPriceComparisonCard: React.FC<LocalityPriceComparisonCardProps> = ({
  currentDish,
  localityName,
  alternatives,
  navigate,
}) => {
  if (!alternatives || alternatives.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl border border-[#EFEAE2] p-5 sm:p-6 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-stone-100 pb-3">
        <div>
          <div className="text-[11px] font-black uppercase tracking-wider text-[#0F766E] flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5" />
            <span>Locality Price &amp; Menu Comparison</span>
          </div>
          <h3 className="font-heading font-black text-base sm:text-lg text-[#1C1917] mt-0.5">
            Where else to get {currentDish.name} {localityName ? `in ${localityName}` : 'nearby'}
          </h3>
        </div>
        <span className="text-[11px] font-bold text-stone-500">
          0% Aggregator Markup
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {alternatives.map(({ dish, restaurant, counterSavings }) => (
          <div
            key={dish.id}
            onClick={() => navigate(`/food/${dish.slug}`)}
            className="group bg-stone-50 hover:bg-white rounded-2xl p-3.5 border border-stone-200/80 hover:border-[#FF5A36] transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs"
          >
            <div className="min-w-0">
              <div className="font-heading font-extrabold text-xs sm:text-sm text-[#1C1917] group-hover:text-[#D8350F] transition-colors truncate">
                {dish.name}
              </div>
              <div className="text-[11px] font-bold text-stone-500 truncate flex items-center gap-1 mt-0.5">
                <span>at {restaurant.name}</span>
                {restaurant.landmark && (
                  <>
                    <span className="text-stone-300">·</span>
                    <span className="text-stone-400 truncate">{restaurant.landmark}</span>
                  </>
                )}
              </div>

              <div className="pt-1.5 flex items-center gap-2 text-[10px] font-bold">
                <span className="text-[#0F766E] bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/70 flex items-center gap-0.5">
                  <TrendingDown className="w-3 h-3" />
                  <span>Save ~₹{counterSavings.totalSavings}</span>
                </span>
                <span className="text-stone-400 line-through">
                  app ₹{counterSavings.totalAppSpend}
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-base font-black text-[#D8350F]">
                ₹{dish.price}
              </div>
              <div className="text-[10px] font-bold text-stone-400 group-hover:text-[#D8350F] flex items-center justify-end gap-0.5 mt-1 transition-colors">
                <span>View</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
