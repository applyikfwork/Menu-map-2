/**
 * Menu Maps Discovery - Market Food Guide Detail (/discovery/markets/:slug)
 * Deep dive into an individual Delhi market guide with iconic outlets,
 * budget recommendations, verified counter prices, and contributor attribution.
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  MapPin,
  Train,
  Clock,
  Coins,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Share2,
  Sparkles,
} from 'lucide-react';
import { discoveryApi } from '../lib/discoveryApi';
import { MarketFoodGuide } from '../types/discovery';
import { DiscoveryNavbar } from '../components/DiscoveryNavbar';

interface MarketGuideDetailProps {
  slug: string;
  navigate: (path: string) => void;
}

export const MarketGuideDetail: React.FC<MarketGuideDetailProps> = ({ slug, navigate }) => {
  const [guide, setGuide] = useState<MarketFoodGuide | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGuide();
  }, [slug]);

  const loadGuide = async () => {
    setLoading(true);
    try {
      const item = await discoveryApi.getMarketGuideBySlug(slug);
      setGuide(item);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917]">
        <DiscoveryNavbar currentPath={`/discovery/markets/${slug}`} navigate={navigate} />
        <div className="py-24 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#0F766E] border-t-transparent animate-spin mx-auto mb-3" />
          <span className="text-xs text-stone-500 font-semibold">Loading market guide...</span>
        </div>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917]">
        <DiscoveryNavbar currentPath={`/discovery/markets/${slug}`} navigate={navigate} />
        <div className="max-w-md mx-auto py-24 px-4 text-center">
          <h2 className="text-xl font-bold text-stone-900 mb-2">Market Guide Not Found</h2>
          <p className="text-xs text-stone-500 mb-6">
            We couldn't locate a published food guide matching this market slug.
          </p>
          <button
            onClick={() => navigate('/discovery/markets')}
            className="px-5 py-2.5 bg-[#0F766E] text-white text-xs font-bold rounded-xl"
          >
            Back to All Market Guides
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917]">
      <DiscoveryNavbar currentPath={`/discovery/markets/${slug}`} navigate={navigate} />

      {/* Hero Header */}
      <section className="relative h-64 sm:h-80 md:h-96 bg-stone-900 overflow-hidden">
        <img
          src={guide.cover_image_url}
          alt={guide.market_name}
          className="w-full h-full object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/30" />

        <div className="absolute top-4 left-4 sm:left-8">
          <button
            onClick={() => navigate('/discovery/markets')}
            className="px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-stone-800 text-xs font-bold flex items-center gap-1.5 hover:bg-white transition-all shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All Market Guides
          </button>
        </div>

        <div className="absolute bottom-6 left-4 right-4 sm:left-8 sm:right-8 max-w-[1280px] mx-auto text-white">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#FF5A36] text-white text-[10px] font-black uppercase tracking-wider">
              {guide.neighbourhood}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-white text-[10px] font-bold">
              {guide.total_outlets_count} Scouted Outlets
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-black leading-tight">
            {guide.market_name}
          </h1>
          <p className="text-xs sm:text-sm text-stone-200 mt-1 max-w-xl italic">{guide.tagline}</p>
        </div>
      </section>

      {/* Info Strip */}
      <div className="bg-white border-b border-stone-200/80 px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-[1280px] mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-stone-600">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <span className="flex items-center gap-1.5 font-medium">
              <Train className="w-4 h-4 text-[#0F766E]" />
              <strong>Metro:</strong> {guide.metro_station}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Coins className="w-4 h-4 text-amber-600" />
              <strong>Budget:</strong> {guide.budget_range}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-4 h-4 text-[#FF5A36]" />
              <strong>Hours:</strong> {guide.best_time_to_visit}
            </span>
          </div>

          {guide.contributor_attribution && (
            <span className="text-[11px] text-stone-500 italic bg-stone-50 px-3 py-1 rounded-full border border-stone-200">
              {guide.contributor_attribution}
            </span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 py-10 space-y-12">
        {/* Market Overview */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-2xs space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
            About the Food Culture
          </h2>
          <p className="text-sm text-stone-700 leading-relaxed max-w-3xl">
            {guide.description}
          </p>

          <div className="pt-2 flex flex-wrap gap-2">
            {guide.food_categories.map((cat) => (
              <span
                key={cat}
                className="px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-semibold"
              >
                {cat}
              </span>
            ))}
          </div>
        </section>

        {/* Iconic Outlets */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#0F766E]">
                Must-Visit Food Spots
              </span>
              <h2 className="font-serif text-2xl font-bold text-stone-900 mt-0.5">
                Iconic Outlets & Specialties
              </h2>
            </div>
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> All counter prices verified
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guide.iconic_outlets.map((outlet) => (
              <div
                key={outlet.outlet_name}
                className="bg-white rounded-3xl p-6 border border-stone-200 shadow-2xs flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-base text-stone-900 leading-snug">
                      {outlet.outlet_name}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                      ₹{outlet.price_estimate}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-[#0F766E]">
                    Specialty: {outlet.signature_dish}
                  </p>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    {outlet.why_famous}
                  </p>

                  <p className="text-[11px] text-stone-400 flex items-center gap-1 pt-1">
                    <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                    <span>{outlet.address_or_landmark}</span>
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-bold flex items-center gap-0.5 text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5" /> In-Store Verified
                  </span>
                  {outlet.restaurant_slug && (
                    <button
                      onClick={() => navigate(`/${outlet.restaurant_slug}`)}
                      className="text-[#0F766E] font-bold hover:underline flex items-center gap-1"
                    >
                      <span>View Menu</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Curated Budget Deals */}
        {guide.budget_deals && guide.budget_deals.length > 0 && (
          <section className="bg-gradient-to-r from-teal-900 to-stone-900 rounded-3xl p-6 sm:p-8 text-white space-y-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                Student & Explorer Deals
              </span>
              <h2 className="font-serif text-2xl font-bold mt-1">Best Budget Picks in {guide.market_name}</h2>
              <p className="text-xs sm:text-sm text-stone-300">
                Top rated dishes strictly verified under physical counter rates.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              {guide.budget_deals.map((deal) => (
                <div
                  key={deal.dish_name}
                  className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs flex flex-col justify-between"
                >
                  <div>
                    <span className="text-xs font-black text-amber-300 block mb-1">₹{deal.price}</span>
                    <h4 className="font-bold text-sm text-white leading-snug">{deal.dish_name}</h4>
                    <p className="text-[11px] text-stone-300 mt-0.5">{deal.outlet_name}</p>
                  </div>
                  <span className="text-[10px] text-emerald-300 font-semibold mt-2 pt-2 border-t border-white/10 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Zero Markup Rate
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
