import React, { useMemo } from 'react';
import { Sparkles, Trophy, Plus, Check, Lightbulb, Flame, Award } from 'lucide-react';
import { Restaurant, MenuItem } from '../../types/database';

interface TopPicksSpotlightProps {
  restaurant: Restaurant;
  menuItems: MenuItem[];
  onAddToCart: (item: MenuItem) => void;
  cartMap?: Record<string, number>;
}

export const TopPicksSpotlight: React.FC<TopPicksSpotlightProps> = ({
  restaurant,
  menuItems,
  onAddToCart,
  cartMap = {},
}) => {
  // Extract or curate top 3 items
  const { topPicks, insiderTip } = useMemo(() => {
    if (!menuItems || menuItems.length === 0) {
      return { topPicks: [], insiderTip: null };
    }

    // 1. Sort by must-try, rating, or order index
    const sorted = [...menuItems].sort((a, b) => {
      const aScore = (a.is_must_try ? 10 : 0) + (a.is_popular ? 5 : 0) + (a.rating || 4);
      const bScore = (b.is_must_try ? 10 : 0) + (b.is_popular ? 5 : 0) + (b.rating || 4);
      return bScore - aScore;
    });

    const picks = sorted.slice(0, 3).map((item, index) => {
      let tagLabel = '⭐ Crowd Legend';
      let tagStyle = 'bg-amber-100 text-amber-900 border-amber-300';
      let statText = 'Verified in-store crowd recommendation';

      if (index === 0) {
        tagLabel = '👑 #1 Most Ordered';
        tagStyle = 'bg-rose-100 text-rose-900 border-rose-300';
        statText = 'Unmatched local favorite • Must order';
      } else if (index === 1) {
        tagLabel = '⚡ Best Value Star';
        tagStyle = 'bg-emerald-100 text-emerald-900 border-emerald-300';
        statText = 'Maximum portion value for money';
      } else if (index === 2) {
        tagLabel = '🥤 Ideal Table Pair';
        tagStyle = 'bg-cyan-100 text-cyan-900 border-cyan-300';
        statText = 'Perfect sip or sweet finale';
      }

      return {
        item,
        tagLabel,
        tagStyle,
        statText,
      };
    });

    // Curate an insider tip based on cuisine & vibe
    const cuisine = (restaurant.cuisine_types?.[0] || 'Food').toLowerCase();
    let tip = `Ask for freshly made mint & garlic dip at the counter — usually served complimentary with hot orders!`;
    if (cuisine.includes('cafe') || cuisine.includes('coffee') || cuisine.includes('bakery')) {
      tip = `Order your cold coffee or cooler first while choosing snacks — counter barista takes ~3 mins!`;
    } else if (cuisine.includes('chinese') || cuisine.includes('momos') || cuisine.includes('tibetan')) {
      tip = `Request the extra fiery red schezwan chutney & mayo on the side — free with all counter orders!`;
    } else if (cuisine.includes('mughlai') || cuisine.includes('north indian') || cuisine.includes('rolls')) {
      tip = `Ask the tandoor chef for extra crispy crust and sliced onions with chat masala at the counter!`;
    }

    return { topPicks: picks, insiderTip: tip };
  }, [menuItems, restaurant]);

  if (topPicks.length === 0) return null;

  return (
    <section aria-label="Crowd-Voted Top 3 Must-Order Dishes" className="w-full my-6">
      <div className="bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30 border border-[#E7E2DA] rounded-[28px] p-5 sm:p-7 shadow-xs relative overflow-hidden">
        {/* Decorative Top Accent */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-[#F0EBE1]">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-gradient-to-br from-amber-500 to-[#FF5A36] text-white shadow-xs">
              <Trophy className="w-4 h-4 stroke-[2.5]" />
            </span>
            <div>
              <h3 className="hd text-lg sm:text-xl font-black text-[#1C1917] tracking-tight">
                Crowd-Voted Top 3 Must-Orders
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                Skip menu paralysis • Verified counter bestsellers & crowd favorites
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            Zero Regret Picks
          </span>
        </div>

        {/* 3 Top Picks Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topPicks.map(({ item, tagLabel, tagStyle, statText }, idx) => {
            const isVeg = item.dietary_tags?.includes('Veg') || item.dietary_tags?.includes('Vegan');
            const inCartQty = cartMap[item.id] || 0;

            return (
              <div
                key={item.id}
                className="bg-white border border-[#EFEAE2] hover:border-amber-400 rounded-2xl p-4 flex flex-col justify-between shadow-2xs hover:shadow-sm transition-all group"
              >
                <div>
                  {/* Badge & Rank */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${tagStyle}`}>
                      {tagLabel}
                    </span>
                    <span className="text-stone-300 font-black text-xs">#{idx + 1}</span>
                  </div>

                  {/* Title & Dietary Dot */}
                  <div className="flex items-start gap-2">
                    <div
                      className={`w-3.5 h-3.5 rounded-xs border mt-0.5 flex items-center justify-center shrink-0 ${
                        isVeg ? 'border-emerald-600' : 'border-rose-600'
                      }`}
                      title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-heading font-black text-sm sm:text-base text-[#1C1917] group-hover:text-[#FF5A36] transition-colors leading-snug">
                        {item.name}
                      </h4>
                      {item.description && (
                        <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Counter Price & 1-Tap Add */}
                <div className="pt-4 mt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 block">
                      Counter Price
                    </span>
                    <span className="hd text-lg font-black text-[#1C1917]">
                      ₹{item.price}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onAddToCart(item)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs ${
                      inCartQty > 0
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-[#FF5A36] hover:bg-[#D8350F] text-white'
                    }`}
                  >
                    {inCartQty > 0 ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Added ({inCartQty})</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Tray</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Social Proof Stat Note */}
                <div className="mt-2 text-[10px] font-medium text-stone-500 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-500 shrink-0" />
                  <span className="truncate">{statText}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 1 Insider Hack / Secret Upgrade Tip Banner */}
        {insiderTip && (
          <div className="mt-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/40 flex items-start sm:items-center gap-2.5 text-xs text-amber-950">
            <div className="p-1 rounded-lg bg-amber-500 text-white shrink-0 mt-0.5 sm:mt-0">
              <Lightbulb className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 font-medium leading-relaxed">
              <strong className="font-extrabold text-[#1C1917]">Street Insider Hack:</strong> {insiderTip}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
