import React, { useState } from 'react';
import { X, Sparkles, Dices, Plus, Utensils, Check, ArrowRight } from 'lucide-react';
import { MenuItem } from '../../types/database';

interface DishRouletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  onAddToCart: (item: MenuItem) => void;
}

export const DishRouletteModal: React.FC<DishRouletteModalProps> = ({
  isOpen,
  onClose,
  menuItems,
  onAddToCart,
}) => {
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<MenuItem | null>(null);
  const [added, setAdded] = useState(false);

  if (!isOpen) return null;

  // Filter valid candidate dishes (prefer items with prices and names)
  const candidateDishes = menuItems.filter((m) => m.price > 0 && m.name.trim().length > 0);
  const pool = candidateDishes.length > 0 ? candidateDishes : menuItems;

  const handleRoll = () => {
    if (spinning || pool.length === 0) return;
    setSpinning(true);
    setWinner(null);
    setAdded(false);

    // Shuffle through items rapidly for 2.2 seconds
    let counter = 0;
    const intervalTime = 80;
    const totalTicks = 25;

    const timer = setInterval(() => {
      counter++;
      const randomIdx = Math.floor(Math.random() * pool.length);
      setWinner(pool[randomIdx]);

      if (counter >= totalTicks) {
        clearInterval(timer);
        const finalIdx = Math.floor(Math.random() * pool.length);
        setWinner(pool[finalIdx]);
        setSpinning(false);
      }
    }, intervalTime);
  };

  const handleAddAndClose = () => {
    if (!winner) return;
    onAddToCart(winner);
    setAdded(true);
    setTimeout(() => {
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#EFEAE2] p-6 text-center overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors border border-[#EFEAE2] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-1 mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-[#D8350F] text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Indecisive Diners Club</span>
          </div>
          <h3 className="text-2xl font-black text-[#1C1917] font-heading tracking-tight">
            Dish Roulette 🎲
          </h3>
          <p className="text-xs text-stone-500 font-sans">
            Can't decide what to order? Let the chef's dice choose your next bite!
          </p>
        </div>

        {/* Display Box */}
        <div className="my-6 p-6 rounded-3xl bg-white border-2 border-dashed border-[#FF5A36]/40 min-h-[220px] flex flex-col items-center justify-center relative shadow-inner">
          {winner ? (
            <div className={`space-y-3 transition-all ${spinning ? 'scale-95 opacity-70 blur-[0.5px]' : 'scale-100 opacity-100 animate-bounce-short'}`}>
              {/* Dish Photo or Icon */}
              {winner.image_url ? (
                <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto shadow-md border-2 border-[#EFEAE2]">
                  <img
                    src={winner.image_url}
                    alt={winner.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-orange-50 text-[#FF5A36] flex items-center justify-center mx-auto shadow-sm">
                  <Utensils className="w-9 h-9" />
                </div>
              )}

              <div>
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${winner.is_veg === false ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                  <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">
                    {winner.is_veg === false ? 'Non-Veg' : 'Pure Veg'}
                  </span>
                </div>
                <h4 className="font-heading font-black text-lg text-stone-900 line-clamp-2">
                  {winner.name}
                </h4>
                <p className="font-mono font-black text-xl text-[#D8350F] mt-1">
                  ₹{winner.price}
                </p>
                {winner.description && (
                  <p className="text-[11px] text-stone-500 mt-1 line-clamp-2 max-w-xs mx-auto">
                    {winner.description}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2 py-4">
              <Dices className="w-16 h-16 text-[#FF5A36] mx-auto animate-pulse" />
              <p className="font-heading font-black text-base text-stone-800">
                Ready to find your dish?
              </p>
              <p className="text-xs text-stone-400">
                Click below to spin through {pool.length} verified menu items!
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2.5">
          {!winner || spinning ? (
            <button
              type="button"
              onClick={handleRoll}
              disabled={spinning}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#FF5A36] hover:bg-[#e04826] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Dices className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} />
              <span>{spinning ? 'Rolling the Kitchen Dice…' : 'Roll for My Dish!'}</span>
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleRoll}
                className="py-3 px-4 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Dices className="w-3.5 h-3.5" />
                <span>Reroll</span>
              </button>

              <button
                type="button"
                onClick={handleAddAndClose}
                disabled={added}
                className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Order!</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add ₹{winner.price} to Order</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
