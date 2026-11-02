/**
 * Menu Maps Discovery - Discover by Dish (/discovery/dishes)
 * Explore Delhi NCR food places by iconic dish cravings:
 * Momos, Chole Bhature, Dosa, Rolls, Pizza, Chaat, Burgers, Sweets, and more.
 */

import React, { useState, useEffect } from 'react';
import {
  Utensils,
  Search,
  MapPin,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { discoveryApi } from '../lib/discoveryApi';
import { DiscoveryNavbar } from '../components/DiscoveryNavbar';

interface DiscoverByDishProps {
  navigate: (path: string) => void;
}

export const DiscoverByDish: React.FC<DiscoverByDishProps> = ({ navigate }) => {
  const [selectedDishGroup, setSelectedDishGroup] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dishGroups, setDishGroups] = useState<any[]>([]);

  useEffect(() => {
    const data = discoveryApi.getDishesDirectory();
    setDishGroups(data);
  }, []);

  const filteredGroups = dishGroups.filter((g) => {
    if (selectedDishGroup !== 'all' && g.id !== selectedDishGroup) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      g.label.toLowerCase().includes(q) ||
      g.sample_dishes.some((s: any) =>
        s.dish_name.toLowerCase().includes(q) || s.restaurant_name.toLowerCase().includes(q)
      )
    );
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917]">
      <DiscoveryNavbar currentPath="/discovery/dishes" navigate={navigate} />

      {/* Header Banner */}
      <section className="bg-gradient-to-b from-white to-[#FAF8F5] border-b border-[#E7E2DA]/80 pt-8 sm:pt-12 pb-8 sm:pb-12 px-4 sm:px-6 md:px-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-[#0F766E] border border-teal-200">
              Dish-Wise Exploration
            </span>
            <span className="text-xs text-stone-400">•</span>
            <span className="text-xs text-stone-500 font-medium">Explore by Craving</span>
          </div>

          <h1 className="hd text-3xl sm:text-5xl font-black text-[#1C1917] tracking-tight">
            Discover Delhi by Dish
          </h1>
          <p className="text-sm sm:text-base text-stone-600 mt-2 max-w-2xl leading-relaxed">
            Craving steaming momos, crispy butter dosa, or rich pindi chole bhature? Find exactly which verified cafes and street legends serve them with honest in-store prices.
          </p>

          {/* Dish Pills */}
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedDishGroup('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedDishGroup === 'all'
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              All Cravings
            </button>
            {dishGroups.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedDishGroup(g.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedDishGroup === g.id
                    ? 'bg-[#0F766E] text-white shadow-2xs'
                    : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                <span>{g.icon}</span>
                <span>{g.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 md:px-8 max-w-[1280px] mx-auto space-y-10">
        {filteredGroups.map((group) => (
          <div key={group.id} className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/80 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl p-2 rounded-2xl bg-white border border-stone-200 shadow-2xs">
                  {group.icon}
                </span>
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                    {group.label}
                  </h2>
                  <span className="text-xs text-stone-500 font-medium">
                    Available at {group.total_places_count} verified places • Starting from ₹{group.min_price}
                  </span>
                </div>
              </div>
            </div>

            {/* Dishes in this group */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {group.sample_dishes.map((item: any, idx: number) => (
                <div
                  key={`${item.restaurant_slug}_${idx}`}
                  className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4 className="font-bold text-sm text-stone-900 group-hover:text-[#0F766E] transition-colors leading-snug">
                        {item.dish_name}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                        ₹{item.price}
                      </span>
                    </div>

                    <button
                      onClick={() => navigate(`/${item.restaurant_slug}`)}
                      className="text-xs font-semibold text-stone-700 hover:text-[#0F766E] flex items-center gap-1 text-left"
                    >
                      <span>{item.restaurant_name}</span>
                      <ExternalLink className="w-3 h-3 text-stone-400 group-hover:text-[#0F766E]" />
                    </button>

                    <p className="text-[11px] text-stone-400 flex items-center gap-1 mt-1 truncate">
                      <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                      <span>{item.neighbourhood}</span>
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3" /> Counter Rate
                    </span>
                    <button
                      onClick={() => navigate(`/${item.restaurant_slug}`)}
                      className="text-[#0F766E] font-bold hover:underline"
                    >
                      View Cafe Menu →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};
