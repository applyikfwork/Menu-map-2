import React from 'react';
import { Clock, Sparkles, Compass, Check } from 'lucide-react';
import { useDiscovery } from '../../context/DiscoveryContext';
import { MealTimeWindow, MEAL_TIME_WINDOWS } from '../../lib/engine/discoveryEngine';

interface MealTimeHeroBannerProps {
  onSelectMealTime?: (time: MealTimeWindow) => void;
  className?: string;
}

export const MealTimeHeroBanner: React.FC<MealTimeHeroBannerProps> = ({
  onSelectMealTime,
  className = '',
}) => {
  const {
    currentMealTime,
    mealTimeInfo,
    setManualMealTime,
    isManualMealTime,
    resetMealTimeToCurrent,
    activeLocality,
  } = useDiscovery();

  const handlePillClick = (key: MealTimeWindow) => {
    setManualMealTime(key);
    onSelectMealTime?.(key);
  };

  return (
    <div className={`bg-gradient-to-r from-stone-900 via-neutral-900 to-[#1C1917] rounded-3xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden ${className}`}>
      {/* Decorative Glow */}
      <div
        aria-hidden="true"
        className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[radial-gradient(circle,rgba(255,90,54,0.35),transparent_70%)] pointer-events-none"
      />

      <div className="relative z-10 space-y-3">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-black uppercase tracking-wider text-amber-300">
            <span>{mealTimeInfo.icon}</span>
            <span>{mealTimeInfo.label}</span>
            <span className="text-white/40">·</span>
            <span className="text-stone-300">{mealTimeInfo.timeRange}</span>
          </div>

          {isManualMealTime && (
            <button
              type="button"
              onClick={resetMealTimeToCurrent}
              className="text-[11px] font-bold text-[#FF8A6B] hover:text-white underline cursor-pointer"
            >
              Reset to Current Time
            </button>
          )}
        </div>

        {/* Heading */}
        <div>
          <h2 className="font-heading font-black text-xl sm:text-3xl text-white tracking-tight leading-tight">
            {mealTimeInfo.tagline}
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 mt-1">
            Personalized for <strong className="text-white">{activeLocality}</strong> · Verified counter menus with 0% delivery app markup.
          </p>
        </div>

        {/* Meal Time Selector Pills */}
        <div className="pt-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {(Object.keys(MEAL_TIME_WINDOWS) as MealTimeWindow[]).map((key) => {
            const win = MEAL_TIME_WINDOWS[key];
            const isActive = currentMealTime === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => handlePillClick(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#FF5A36] text-white shadow-xs'
                    : 'bg-white/10 hover:bg-white/15 text-stone-300 border border-white/10'
                }`}
              >
                <span>{win.icon}</span>
                <span>{win.label.split('&')[0].trim()}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
