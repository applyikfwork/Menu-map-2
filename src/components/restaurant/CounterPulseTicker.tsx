import React from 'react';
import { ShieldCheck, Clock, TrendingDown, CheckCircle2, Sparkles, Store } from 'lucide-react';
import { Restaurant } from '../../types/database';

interface CounterPulseTickerProps {
  restaurant: Restaurant;
}

export const CounterPulseTicker: React.FC<CounterPulseTickerProps> = ({
  restaurant,
}) => {
  return (
    <section aria-label="Live Counter Pulse" className="w-full">
      <div className="bg-gradient-to-r from-stone-900 via-[#1C1917] to-stone-900 text-stone-200 border border-stone-800/90 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-md overflow-hidden relative">
        {/* Subtle background glow */}
        <div className="absolute -right-8 -top-8 w-36 h-36 bg-[#FF5A36]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-8 -bottom-8 w-36 h-36 bg-[#0F766E]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Left badge group: 100% Genuine in-store verified guarantees */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Direct Counter Rate Stamp */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-extrabold text-[11px] sm:text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>100% In-Store Verified Menu Rates</span>
            </div>

            {/* Quick Self-Pickup active */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 font-bold text-[11px] sm:text-xs">
              <Store className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>🚶 15-Min Quick Self-Pickup Active</span>
            </div>

            {/* Prep Time */}
            <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-200/90 font-medium text-[11px] sm:text-xs">
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Avg Kitchen Prep: 12–18 mins</span>
            </div>
          </div>

          {/* Right Zero-Markup Advantage */}
          <div className="flex items-center gap-2 text-stone-300 font-medium text-[11px] sm:text-xs">
            <span className="hidden sm:inline text-stone-400">Zero App Commission:</span>
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
