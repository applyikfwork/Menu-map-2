/**
 * Menu Maps Discovery - Market Food Guides Directory (/discovery/markets)
 * In-depth, market-wise culinary guides across Delhi NCR.
 */

import React, { useState, useEffect } from 'react';
import {
  Compass,
  MapPin,
  Building2,
  Train,
  ArrowRight,
  ShieldCheck,
  Search,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { discoveryApi } from '../lib/discoveryApi';
import { MarketFoodGuide } from '../types/discovery';
import { DiscoveryNavbar } from '../components/DiscoveryNavbar';

interface MarketGuidesListProps {
  navigate: (path: string) => void;
}

export const MarketGuidesList: React.FC<MarketGuidesListProps> = ({ navigate }) => {
  const [guides, setGuides] = useState<MarketFoodGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadGuides();
  }, []);

  const loadGuides = async () => {
    setLoading(true);
    try {
      const all = await discoveryApi.getMarketGuides(true);
      setGuides(all);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = guides.filter(
    (g) =>
      g.market_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.neighbourhood.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.tagline.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917]">
      <DiscoveryNavbar currentPath="/discovery/markets" navigate={navigate} />

      {/* Header Banner */}
      <section className="bg-gradient-to-b from-white to-[#FAF8F5] border-b border-[#E7E2DA]/80 pt-8 sm:pt-12 pb-8 sm:pb-12 px-4 sm:px-6 md:px-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-50 text-[#FF5A36] border border-orange-200">
              Neighbourhood Exploration
            </span>
            <span className="text-xs text-stone-400">•</span>
            <span className="text-xs text-stone-500 font-medium">Area-Wise Food Guides</span>
          </div>

          <h1 className="hd text-3xl sm:text-5xl font-black text-[#1C1917] tracking-tight">
            Delhi NCR Market Food Guides
          </h1>
          <p className="text-sm sm:text-base text-stone-600 mt-2 max-w-2xl leading-relaxed">
            Every market has its own culinary soul. Explore historic bazaars, campus food hubs, and local street lanes with honest in-store counter pricing and curated recommendations.
          </p>

          <div className="mt-5 max-w-md relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search markets (e.g. Kamla Nagar, Connaught Place, CR Park)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0F766E] shadow-2xs"
            />
          </div>
        </div>
      </section>

      {/* Market Cards Grid */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 md:px-8 max-w-[1280px] mx-auto">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#0F766E] border-t-transparent animate-spin mx-auto mb-3" />
            <span className="text-xs text-stone-500 font-semibold">Loading market guides...</span>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filtered.map((guide) => (
              <div
                key={guide.id}
                onClick={() => navigate(`/discovery/markets/${guide.slug}`)}
                className="bg-white rounded-3xl border border-[#E7E2DA] overflow-hidden shadow-2xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-48 sm:h-52 bg-stone-900 overflow-hidden">
                    <img
                      src={guide.cover_image_url}
                      alt={guide.market_name}
                      className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-stone-900 text-[10px] font-bold">
                        {guide.neighbourhood}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <h3 className="font-serif text-xl font-bold leading-tight group-hover:text-amber-300 transition-colors">
                        {guide.market_name}
                      </h3>
                      <p className="text-xs text-stone-300 italic line-clamp-1 mt-0.5">{guide.tagline}</p>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 space-y-3">
                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {guide.short_description}
                    </p>

                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs flex items-center justify-between">
                      <span className="text-stone-600 font-medium">Budget Range:</span>
                      <span className="font-bold text-[#0F766E]">{guide.budget_range}</span>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                        Must-Try Outlets
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {guide.iconic_outlets.slice(0, 3).map((out) => (
                          <span
                            key={out.outlet_name}
                            className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded text-[11px] font-medium"
                          >
                            {out.outlet_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6 pt-0 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-[#0F766E] mt-2">
                  <span>Explore Guide & Map</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-stone-200 p-8">
            <Building2 className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <h3 className="font-bold text-base text-stone-800">No market guides found matching your query</h3>
            <p className="text-xs text-stone-500 mt-1">Try another search keyword like "North Campus" or "Connaught Place".</p>
          </div>
        )}
      </section>
    </div>
  );
};
