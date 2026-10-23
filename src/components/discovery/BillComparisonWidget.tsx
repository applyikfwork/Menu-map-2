import React, { useState } from 'react';
import { ShieldCheck, TrendingDown, ArrowRight, Zap, Check, AlertCircle, Sparkles } from 'lucide-react';

interface ComboOption {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  items: { name: string; appPrice: number; counterPrice: number }[];
  appFees: { surge: number; packaging: number; platform: number; taxes: number };
}

const COMBOS: ComboOption[] = [
  {
    id: 'student-hangout',
    name: 'North Campus Student Hangout',
    tagline: 'Momos + Monster Cold Coffee',
    badge: 'Save 45%',
    items: [
      { name: 'Crispy Kurkure Momos (8 pcs)', appPrice: 190, counterPrice: 120 },
      { name: 'Hazelnut Thick Shake / Cold Coffee', appPrice: 210, counterPrice: 140 },
    ],
    appFees: { surge: 35, packaging: 25, platform: 12, taxes: 32 },
  },
  {
    id: 'cafe-date',
    name: 'Evening Cafe Date Combo',
    tagline: 'Woodfired Pizza + Loaded Fries',
    badge: 'Save ₹240',
    items: [
      { name: 'Farmhouse Neapolitan Pizza (10")', appPrice: 380, counterPrice: 280 },
      { name: 'Peri Peri Cheesy Loaded Fries', appPrice: 220, counterPrice: 150 },
    ],
    appFees: { surge: 40, packaging: 30, platform: 15, taxes: 45 },
  },
  {
    id: 'desi-special',
    name: 'Delhi Heritage Legend',
    tagline: 'Chur Chur Naan Thali + Lassi',
    badge: 'Zero Surge',
    items: [
      { name: 'Paneer Chur Chur Naan Thali (with Dal Makhani)', appPrice: 260, counterPrice: 180 },
      { name: 'Special Malai Lassi (Kulhad)', appPrice: 120, counterPrice: 80 },
    ],
    appFees: { surge: 30, packaging: 25, platform: 12, taxes: 28 },
  },
];

export const BillComparisonWidget: React.FC<{ navigate?: (path: string) => void }> = ({ navigate }) => {
  const [selectedComboId, setSelectedComboId] = useState<string>('student-hangout');

  const combo = COMBOS.find((c) => c.id === selectedComboId) || COMBOS[0];

  const appDishesTotal = combo.items.reduce((acc, i) => acc + i.appPrice, 0);
  const appTotal = appDishesTotal + combo.appFees.surge + combo.appFees.packaging + combo.appFees.platform + combo.appFees.taxes;

  const counterTotal = combo.items.reduce((acc, i) => acc + i.counterPrice, 0);
  const savings = appTotal - counterTotal;
  const savingsPercent = Math.round((savings / appTotal) * 100);

  return (
    <div className="w-full bg-white rounded-[32px] border border-[#E7E2DA] p-5 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] relative overflow-hidden text-left">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-orange-100/40 via-teal-100/20 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-[#E7E2DA]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFE9E2] text-[#9A2A0C] text-xs font-black uppercase tracking-wider mb-2">
            <Zap className="w-3.5 h-3.5 fill-[#FF5A36] text-[#FF5A36]" />
            The Counter Savings Superpower
          </div>
          <h2 className="hd text-2xl sm:text-3xl font-black text-[#1C1917] tracking-tight">
            See the real bill difference.
          </h2>
          <p className="text-xs sm:text-sm text-[#78716C] mt-1">
            Compare actual food delivery app carts vs 100% in-store counter prices in Delhi NCR.
          </p>
        </div>

        {/* Combo Switcher Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {COMBOS.map((c) => {
            const active = c.id === selectedComboId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedComboId(c.id)}
                className={`text-xs font-bold px-3.5 py-2 rounded-2xl whitespace-nowrap transition-all cursor-pointer border ${
                  active
                    ? 'bg-[#1C1917] text-white border-[#1C1917] shadow-sm scale-[1.02]'
                    : 'bg-[#FAF8F5] hover:bg-stone-100 text-[#57534E] border-[#E7E2DA]'
                }`}
              >
                {c.name.split(' ')[0]} {c.name.split(' ')[1]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Side-by-Side Comparison Container */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
        {/* Left Column: Aggregator Cart (The Pain Point) */}
        <div className="bg-[#FAF8F5] rounded-3xl p-5 sm:p-6 border border-[#E7E2DA] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#E7E2DA]/80">
              <span className="text-xs font-extrabold uppercase tracking-wider text-stone-500">
                Food Delivery Apps
              </span>
              <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg">
                Markups & Fees Added
              </span>
            </div>

            {/* Dishes with App Markup */}
            <div className="mt-4 space-y-2.5">
              {combo.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-[#57534E] font-medium truncate pr-2">{item.name}</span>
                  <span className="font-bold text-[#1C1917] shrink-0">₹{item.appPrice}</span>
                </div>
              ))}

              <div className="pt-3 border-t border-dashed border-[#E7E2DA] space-y-1.5 text-xs text-stone-500">
                <div className="flex justify-between">
                  <span>Surge / Rain Surcharge</span>
                  <span className="font-semibold text-rose-600">+₹{combo.appFees.surge}</span>
                </div>
                <div className="flex justify-between">
                  <span>Restaurant Packaging Fee</span>
                  <span className="font-semibold text-stone-700">+₹{combo.appFees.packaging}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee</span>
                  <span className="font-semibold text-stone-700">+₹{combo.appFees.platform}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST & Delivery Charges</span>
                  <span className="font-semibold text-stone-700">+₹{combo.appFees.taxes}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-[#E7E2DA] flex items-baseline justify-between">
            <span className="text-xs font-bold text-stone-500">Total App Bill</span>
            <span className="hd text-xl sm:text-2xl font-black text-stone-800 line-through decoration-rose-500/70">
              ₹{appTotal}
            </span>
          </div>
        </div>

        {/* Right Column: MenuMaps Counter Price (The Superpower) */}
        <div className="bg-gradient-to-b from-[#E6F4F1]/60 to-white rounded-3xl p-5 sm:p-6 border-2 border-[#0F766E]/40 flex flex-col justify-between relative shadow-sm">
          <div className="absolute -top-3 right-5 bg-[#0F766E] text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 stroke-[2.5]" />
            100% Counter Price
          </div>

          <div>
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-teal-200/60">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#0F766E]">
                MenuMaps Dine-In / Direct
              </span>
              <span className="text-[11px] font-extrabold text-[#0F766E] bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-lg">
                Zero Middleman
              </span>
            </div>

            {/* Dishes at Exact Counter Price */}
            <div className="mt-4 space-y-2.5">
              {combo.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-[#1C1917] font-semibold truncate pr-2">{item.name}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-black text-[#0F766E]">₹{item.counterPrice}</span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1 rounded">
                      -₹{item.appPrice - item.counterPrice}
                    </span>
                  </div>
                </div>
              ))}

              <div className="pt-3 border-t border-dashed border-teal-200/80 space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between text-emerald-800 font-semibold">
                  <span>Surge Fee</span>
                  <span>₹0 (None)</span>
                </div>
                <div className="flex justify-between text-emerald-800 font-semibold">
                  <span>Packaging Fee</span>
                  <span>₹0 (Dine-in)</span>
                </div>
                <div className="flex justify-between text-emerald-800 font-semibold">
                  <span>Platform Fee</span>
                  <span>₹0 (Direct)</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Standard 5% Govt GST</span>
                  <span>Included / Standard</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-teal-200/80 flex items-baseline justify-between">
            <span className="text-xs font-bold text-[#0F766E]">Real Counter Total</span>
            <span className="hd text-2xl sm:text-3xl font-black text-[#0F766E]">
              ₹{counterTotal}
            </span>
          </div>
        </div>
      </div>

      {/* High-Impact Bottom Savings Callout */}
      <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-orange-500 via-[#FF5A36] to-[#D8350F] text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-xl shrink-0">
            💥
          </div>
          <div>
            <div className="text-xs sm:text-sm font-extrabold">
              You Save ₹{savings} ({savingsPercent}%) on this single meal!
            </div>
            <div className="text-[11px] text-white/85 font-medium">
              View authentic physical counter menus and exact prices before stepping out in Delhi NCR.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (navigate) navigate('/restaurants');
          }}
          className="btn bg-white hover:bg-stone-50 text-[#1C1917] px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm whitespace-nowrap shadow-md cursor-pointer transition-all active:scale-95 shrink-0"
        >
          <span>Find Menus Near Me</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </button>
      </div>
    </div>
  );
};
