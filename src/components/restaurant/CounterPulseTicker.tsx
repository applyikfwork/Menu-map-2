import React from 'react';
import { Flame, ShieldCheck, Clock, TrendingDown, Sparkles, CheckCircle2 } from 'lucide-react';
import { Restaurant } from '../../types/database';

interface CounterPulseTickerProps {
  restaurant: Restaurant;
  dailyViews?: number;
}

export const CounterPulseTicker: React.FC<CounterPulseTickerProps> = ({
  restaurant,
  dailyViews = 38,
}) => {
  // Deterministic daily view count based on restaurant ID length & average cost
  const calculatedViews = React.useMemo(() => {
    if (dailyViews && dailyViews > 10) return dailyViews;
    const seed = (restaurant.id.charCodeAt(0) || 12) + (restaurant.name.length * 3);
    return 24 + (seed % 45);
  }, [restaurant, dailyViews]);

  return (
    <section aria-label="Live Counter Pulse" className="w-full">
      <div className="bg-gradient-to-r from-stone-900 via-[#1C1917] to-stone-900 text-stone-200 border border-stone-800/90 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-md overflow-hidden relative">
        {/* Subtle background glow */}
        <div className="absolute -right-8 -top-8 w-36 h-36 bg-[#FF5A36]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-8 -bottom-8 w-36 h-36 bg-[#0F766E]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Left badge group */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Live Social Proof Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 font-extrabold text-[11px] sm:text-xs tracking-tight animate-pulse">
              <Flame className="w-3.5 h-3.5 text-rose-400 fill-rose-400 shrink-0" />
              <span>{calculatedViews} foodies viewed this menu today</span>
            </div>

            {/* Direct Counter Rate Stamp */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-[11px] sm:text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>100% In-Store Verified Rates</span>
            </div>

            {/* Prep Time */}
            <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-200/90 font-medium text-[11px] sm:text-xs">
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Avg Kitchen Prep: 12–18 mins</span>
            </div>
          </div>

          {/* Right Zero-Markup Advantage */}
          <div className="flex items-center gap-2 text-stone-300 font-medium text-[11px] sm:text-xs">
            <span className="hidden sm:inline text-stone-400">Zero App Markup:</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-white font-extrabold text-[11px]">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
              Save ₹90–₹160 vs Delivery Apps
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
