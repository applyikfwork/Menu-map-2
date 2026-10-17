import React, { useMemo } from 'react';
import { Sparkles, Plus, Check, Coffee, Zap } from 'lucide-react';
import { MenuItem } from '../../types/database';

interface UpsellPairingPromptProps {
  menuItems: MenuItem[];
  cartMap: Record<string, number>;
  onAddToCart: (item: MenuItem) => void;
}

export const UpsellPairingPrompt: React.FC<UpsellPairingPromptProps> = ({
  menuItems,
  cartMap,
  onAddToCart,
}) => {
  // Check if cart has items
  const hasItemsInCart = useMemo(() => {
    return Object.values(cartMap).some((qty) => qty > 0);
  }, [cartMap]);

  // Find candidate pairing items (beverages, sides, dips, desserts) that are NOT in cart
  const pairingSuggestions = useMemo(() => {
    if (!hasItemsInCart || !menuItems || menuItems.length === 0) return [];

    // Filter items not in cart
    const available = menuItems.filter((item) => (cartMap[item.id] || 0) === 0);

    // Identify beverages, sides, dips, or desserts
    const isPairingCandidate = (item: MenuItem) => {
      const name = item.name.toLowerCase();
      const desc = (item.description || '').toLowerCase();
      const category = (item.category_id || '').toLowerCase();
      
      const keywords = [
        'coffee', 'shake', 'mojito', 'coke', 'pepsi', 'tea', 'chai', 
        'beverage', 'drink', 'cooler', 'lemonade', 'fries', 'dip', 
        'bread', 'nachos', 'brownie', 'ice cream', 'dessert', 'chutney'
      ];

      return keywords.some((kw) => name.includes(kw) || desc.includes(kw) || category.includes(kw));
    };

    const candidates = available.filter(isPairingCandidate);

    // If specific pairing keywords matched, pick the top 2 lowest/medium priced ones
    if (candidates.length > 0) {
      return candidates.sort((a, b) => a.price - b.price).slice(0, 2);
    }

    // Fallback: pick 2 budget-friendly items from available
    return available.sort((a, b) => a.price - b.price).slice(0, 2);
  }, [menuItems, cartMap, hasItemsInCart]);

  if (!hasItemsInCart || pairingSuggestions.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-white border border-emerald-200/80 rounded-2xl p-4 my-3 shadow-2xs">
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 text-xs font-black text-emerald-950">
          <Zap className="w-4 h-4 text-emerald-600 fill-emerald-500" />
          <span>Complete Your Meal (Counter Pairings)</span>
        </div>
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
          Diner Favorite
        </span>
      </div>

      <div className="space-y-2">
        {pairingSuggestions.map((item) => {
          const isVeg = item.dietary_tags?.includes('Veg') || item.dietary_tags?.includes('Vegan');
          return (
            <div
              key={item.id}
              className="bg-white border border-emerald-100/80 rounded-xl p-2.5 flex items-center justify-between gap-3 hover:border-emerald-300 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`w-3 h-3 rounded-xs border flex items-center justify-center shrink-0 ${
                    isVeg ? 'border-emerald-600' : 'border-rose-600'
                  }`}
                >
                  <div className={`w-1 h-1 rounded-full ${isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-[#1C1917] truncate">{item.name}</div>
                  <div className="text-[11px] font-extrabold text-[#D8350F]">₹{item.price}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onAddToCart(item)}
                className="shrink-0 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black flex items-center gap-1 active:scale-95 transition-all shadow-2xs"
              >
                <Plus className="w-3 h-3" />
                <span>Add Pair</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
