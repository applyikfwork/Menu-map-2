/**
 * Menu Maps Discovery - Food Under Your Budget (/discovery/budget-food)
 * Genuine budget-oriented food exploration powered by physical in-store counter records.
 * Browse dishes under ₹50, ₹100, ₹150, and ₹200 across Delhi NCR.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Coins,
  ShieldCheck,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  MapPin,
  UtensilsCrossed,
} from 'lucide-react';
import { discoveryApi } from '../lib/discoveryApi';
import { BudgetFoodDish } from '../types/discovery';
import { DiscoveryNavbar } from '../components/DiscoveryNavbar';

interface BudgetFoodDiscoveryProps {
  navigate: (path: string) => void;
}

type BudgetFilter = 'all' | 'under-50' | 'under-100' | 'under-150' | 'under-200';

export const BudgetFoodDiscovery: React.FC<BudgetFoodDiscoveryProps> = ({ navigate }) => {
  const [selectedTier, setSelectedTier] = useState<BudgetFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dishes, setDishes] = useState<BudgetFoodDish[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load genuine dishes from Menu Maps database
    const tierParam = selectedTier === 'all' ? undefined : selectedTier;
    const items = discoveryApi.getBudgetFoodDishes(tierParam, selectedCategory);
    setDishes(items);
    setLoading(false);
  }, [selectedTier, selectedCategory]);

  const filteredDishes = useMemo(() => {
    if (!searchQuery.trim()) return dishes;
    const q = searchQuery.toLowerCase().trim();
    return dishes.filter(
      (d) =>
        d.dish_name.toLowerCase().includes(q) ||
        d.restaurant_name.toLowerCase().includes(q) ||
        d.neighbourhood.toLowerCase().includes(q)
    );
  }, [dishes, searchQuery]);

  const categories = ['All', 'Snack', 'Roll', 'Dosa', 'Momo', 'Chaat', 'Beverage', 'Burger', 'Pizza', 'Rice'];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917]">
      <DiscoveryNavbar currentPath="/discovery/budget-food" navigate={navigate} />

      {/* Header Banner */}
      <section className="bg-gradient-to-b from-white to-[#FAF8F5] border-b border-[#E7E2DA]/80 pt-8 sm:pt-12 pb-8 sm:pb-12 px-4 sm:px-6 md:px-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1">
              <Coins className="w-3 h-3 text-amber-600" />
              Honest Counter Pricing
            </span>
            <span className="text-xs text-stone-400">•</span>
            <span className="text-xs text-stone-500 font-medium">0% Delivery Markups</span>
          </div>

          <h1 className="hd text-3xl sm:text-5xl font-black text-[#1C1917] tracking-tight">
            Food Under Your Budget
          </h1>
          <p className="text-sm sm:text-base text-stone-600 mt-2 max-w-2xl leading-relaxed">
            Discover real, satisfying meals across Delhi NCR verified directly at in-store counters. No hidden platform fees or inflated delivery pricing.
          </p>

          {/* Quick Budget Tiers */}
          <div className="mt-6 flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Budgets (≤ ₹200)' },
              { id: 'under-50', label: '⚡ Under ₹50' },
              { id: 'under-100', label: '🔥 Under ₹100' },
              { id: 'under-150', label: '⭐ Under ₹150' },
              { id: 'under-200', label: '👑 Under ₹200' },
            ].map((tier) => (
              <button
                key={tier.id}
                onClick={() => setSelectedTier(tier.id as BudgetFilter)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedTier === tier.id
                    ? 'bg-[#0F766E] text-white shadow-2xs'
                    : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                {tier.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="py-6 px-4 sm:px-6 md:px-8 max-w-[1280px] mx-auto">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pb-4 border-b border-stone-200/80">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search dishes (e.g. momos, chole, burger, roll) or cafes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-stone-900 text-white font-bold'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between my-4 text-xs text-stone-500">
          <span>Showing {filteredDishes.length} verified budget dishes</span>
          <span className="flex items-center gap-1 text-emerald-700 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> All prices counter-verified
          </span>
        </div>

        {/* Dishes Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#0F766E] border-t-transparent animate-spin mx-auto mb-3" />
            <span className="text-xs text-stone-500 font-semibold">Loading budget menu records...</span>
          </div>
        ) : filteredDishes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {filteredDishes.slice(0, 48).map((dish, i) => (
              <div
                key={`${dish.restaurant_slug}_${dish.dish_name}_${i}`}
                className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-600">
                      {dish.category}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                      ₹{dish.price}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-stone-900 group-hover:text-[#0F766E] transition-colors leading-snug">
                    {dish.dish_name}
                  </h3>

                  <button
                    onClick={() => navigate(`/${dish.restaurant_slug}`)}
                    className="text-xs font-semibold text-stone-700 hover:text-[#0F766E] flex items-center gap-1 mt-1 text-left"
                  >
                    <span>{dish.restaurant_name}</span>
                    <ExternalLink className="w-3 h-3 text-stone-400 group-hover:text-[#0F766E]" />
                  </button>

                  <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5 truncate">
                    <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                    <span>{dish.neighbourhood}</span>
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400">
                  <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3" /> Counter Verified
                  </span>
                  <button
                    onClick={() => navigate(`/${dish.restaurant_slug}`)}
                    className="text-[#0F766E] font-bold hover:underline"
                  >
                    View Menu →
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-stone-200 p-8">
            <Coins className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <h3 className="font-bold text-base text-stone-800">No dishes found in this price range</h3>
            <p className="text-xs text-stone-500 mt-1">Try switching budget tiers or clearing the search query.</p>
          </div>
        )}
      </section>
    </div>
  );
};
