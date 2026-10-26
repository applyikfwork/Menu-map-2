import React from 'react';
import { TrendingDown, Sparkles, ShieldCheck, Tag } from 'lucide-react';
import { calculateCounterSavings } from '../../lib/engine/discoveryEngine';

interface DishPriceSpectrumWidgetProps {
  minPrice: number;
  avgPrice: number;
  maxPrice: number;
  totalSpotsCount: number;
  dishName: string;
  selectedPriceBracket: 'all' | 'budget' | 'mid' | 'premium';
  onSelectPriceBracket: (bracket: 'all' | 'budget' | 'mid' | 'premium') => void;
}

export const DishPriceSpectrumWidget: React.FC<DishPriceSpectrumWidgetProps> = ({
  minPrice,
  avgPrice,
  maxPrice,
  totalSpotsCount,
  dishName,
  selectedPriceBracket,
  onSelectPriceBracket,
}) => {
  const savings = calculateCounterSavings(avgPrice || minPrice || 150);

  // If prices are not diverse, render compact version
  const hasRange = maxPrice > minPrice && minPrice > 0;

  return (
    <div className="rounded-3xl bg-gradient-to-br from-white via-[#FAF8F5] to-orange-50/40 border border-[#E7E2DA] p-5 sm:p-6 shadow-sm">
      {/* Top Meta Line */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E7E2DA]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider">
              Price Range &amp; Analytics
            </span>
            <span className="text-xs text-stone-500 font-bold">
              Across {totalSpotsCount} local spots
            </span>
          </div>
          <h4 className="font-heading font-black text-lg sm:text-xl text-[#1C1917] mt-1">
            {dishName} Counter Pricing Spectrum
          </h4>
        </div>

        {/* Delivery App Savings Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold shadow-2xs">
          <TrendingDown className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Save ~₹{savings.totalSavings} vs delivery apps</span>
        </div>
      </div>

      {/* Visual Spectrum Bar */}
      <div className="pt-5 pb-2">
        <div className="flex items-center justify-between text-xs font-extrabold mb-1.5">
          <div className="text-left">
            <span className="text-[11px] text-stone-400 uppercase tracking-wider block font-bold">Lowest Counter Rate</span>
            <span className="font-black text-base sm:text-lg text-emerald-600">₹{minPrice}</span>
          </div>

          <div className="text-center">
            <span className="text-[11px] text-stone-400 uppercase tracking-wider block font-bold">Locality Average</span>
            <span className="font-black text-base sm:text-lg text-amber-600">₹{avgPrice}</span>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-stone-400 uppercase tracking-wider block font-bold">Gourmet Peak</span>
            <span className="font-black text-base sm:text-lg text-rose-600">₹{maxPrice}</span>
          </div>
        </div>

        {/* Gradient Spectrum Progress Track */}
        <div className="relative h-3 w-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500 shadow-inner overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-2xs" />
        </div>

        <div className="flex justify-between items-center text-[10px] font-bold text-stone-500 mt-1 px-1">
          <span>Budget Champion</span>
          <span>Typical Cafe MRP</span>
          <span>Artisanal / Specialty</span>
        </div>
      </div>

      {/* Quick Price Bracket Filter Chips */}
      <div className="mt-4 pt-3 border-t border-[#E7E2DA]/80 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-stone-600 mr-1 flex items-center gap-1">
          <Tag className="w-3.5 h-3.5 text-[#FF5A36]" />
          <span>Filter Price:</span>
        </span>

        <button
          type="button"
          onClick={() => onSelectPriceBracket('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            selectedPriceBracket === 'all'
              ? 'bg-[#1C1917] text-white shadow-xs'
              : 'bg-white border border-[#E7E2DA] text-stone-700 hover:border-stone-400'
          }`}
        >
          All Prices (₹{minPrice} - ₹{maxPrice})
        </button>

        <button
          type="button"
          onClick={() => onSelectPriceBracket('budget')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            selectedPriceBracket === 'budget'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100'
          }`}
        >
          Under ₹180 (Pocket Steals)
        </button>

        <button
          type="button"
          onClick={() => onSelectPriceBracket('mid')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            selectedPriceBracket === 'mid'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100'
          }`}
        >
          ₹180 - ₹300 (Cafe Standard)
        </button>

        <button
          type="button"
          onClick={() => onSelectPriceBracket('premium')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            selectedPriceBracket === 'premium'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-rose-50 border border-rose-200 text-rose-800 hover:bg-rose-100'
          }`}
        >
          ₹300+ (Gourmet Picks)
        </button>
      </div>
    </div>
  );
};
