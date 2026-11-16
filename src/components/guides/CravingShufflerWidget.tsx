import React, { useState } from 'react';
import { Sparkles, Dices, ArrowRight, ShieldCheck, Flame, TrendingDown } from 'lucide-react';
import { MenuItem } from '../../types/database';

interface CravingShufflerWidgetProps {
  dishes: (MenuItem & { restaurant_name?: string; restaurant_slug?: string; restaurant_address?: string })[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  filterTags: string[];
  onSelectDish: (dish: MenuItem & { restaurant_name?: string; restaurant_slug?: string }) => void;
  navigate: (path: string) => void;
}

export const CravingShufflerWidget: React.FC<CravingShufflerWidgetProps> = ({
  dishes,
  activeFilter,
  onFilterChange,
  filterTags,
  onSelectDish,
  navigate,
}) => {
  const [isRolling, setIsRolling] = useState(false);
  const [rolledDish, setRolledDish] = useState<(MenuItem & { restaurant_name?: string; restaurant_slug?: string }) | null>(null);

  const handleRoll = () => {
    if (dishes.length === 0) return;
    setIsRolling(true);

    let count = 0;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * dishes.length);
      setRolledDish(dishes[randomIdx]);
      count++;
      if (count > 8) {
        clearInterval(interval);
        setIsRolling(false);
        const finalDish = dishes[Math.floor(Math.random() * dishes.length)];
        setRolledDish(finalDish);
        onSelectDish(finalDish);
      }
    }, 80);
  };

  return (
    <div className="bg-gradient-to-br from-stone-900 via-[#1C1917] to-stone-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-800 relative overflow-hidden my-8">
      {/* Decorative Glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#FF5A36]/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5A36]/20 text-[#FF8A6B] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Craving Shuffler</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-heading text-white tracking-tight">
              Can't Decide What to Eat? Let Menu Maps Pick For You.
            </h3>
            <p className="text-xs sm:text-sm text-stone-300">
              Filter by your mood or tap the dice to roll a verified dish at honest counter prices.
            </p>
          </div>

          {/* Roll Button */}
          <button
            onClick={handleRoll}
            disabled={isRolling}
            className="self-start sm:self-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF5A36] to-[#E03A14] hover:from-[#E03A14] hover:to-[#B82B0A] text-white font-extrabold text-sm flex items-center gap-2.5 shadow-lg shadow-[#FF5A36]/30 transition-all active:scale-95 cursor-pointer shrink-0 disabled:opacity-60"
          >
            <Dices className={`w-5 h-5 ${isRolling ? 'animate-spin' : ''}`} />
            <span>{isRolling ? 'Shuffling Cravings...' : 'Roll My Meal 🎲'}</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 pt-1 border-t border-stone-800/80">
          {filterTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onFilterChange(tag)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === tag
                  ? 'bg-[#FF5A36] text-white shadow-xs'
                  : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700/80 hover:text-white'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Rolled Highlight Dish Box */}
        {rolledDish && (
          <div className="bg-stone-800/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              {rolledDish.image_url ? (
                <img
                  src={rolledDish.image_url}
                  alt={rolledDish.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 border border-stone-700"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-stone-700 flex items-center justify-center shrink-0">
                  <Flame className="w-7 h-7 text-[#FF8A6B]" />
                </div>
              )}
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400">
                    Your Pick ✨
                  </span>
                  <span className="text-xs text-stone-400 truncate">
                    {rolledDish.restaurant_name || 'Verified Cafe'}
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-black text-white truncate">
                  {rolledDish.name}
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-extrabold text-base">
                    ₹{rolledDish.price}
                  </span>
                  <span className="text-[11px] text-stone-400 line-through">
                    ₹{Math.round(rolledDish.price * 1.35 + 25)}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                    Save ₹{Math.round(rolledDish.price * 0.35 + 25)} vs apps
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              {rolledDish.restaurant_slug && (
                <button
                  onClick={() => navigate(`/restaurant/${rolledDish.restaurant_slug}`)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-stone-700 hover:bg-stone-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>View Cafe Menu</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              {rolledDish.slug && (
                <button
                  onClick={() => navigate(`/food/${rolledDish.slug}`)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#FF5A36] hover:bg-[#D8350F] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Dish Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Savings banner */}
        <div className="flex items-center gap-2 text-xs text-stone-400 pt-2 border-t border-stone-800/80">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            100% verified counter rates. Direct WhatsApp ordering carries zero platform commissions.
          </span>
        </div>
      </div>
    </div>
  );
};
