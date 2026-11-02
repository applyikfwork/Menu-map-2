/**
 * Menu Maps Discovery - Master Public Discovery Feed (/discovery)
 *
 * One powerful public food discovery page helping normal visitors explore
 * interesting dishes, hidden gems, and verified food experiences.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Sparkles,
  MapPin,
  IndianRupee,
  SlidersHorizontal,
  Compass,
  ArrowRight,
  TrendingUp,
  Tag,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { DiscoveryItem, DiscoveryCategory } from '../types/discovery';
import { discoveryApi } from '../lib/discoveryApi';
import { DiscoveryCard } from '../components/DiscoveryCard';
import { useToast } from '../../components/Toast';

interface DiscoveryPageProps {
  navigate: (path: string) => void;
}

const CATEGORY_FILTERS: Array<{ id: string; label: string }> = [
  { id: 'all', label: 'All Discoveries' },
  { id: 'Hidden Gems', label: 'Hidden Gems' },
  { id: 'Dishes Worth Trying', label: 'Dishes Worth Trying' },
  { id: 'Budget-Friendly', label: 'Budget-Friendly' },
  { id: 'Local Food Experiences', label: 'Local Experiences' },
  { id: 'Vegetarian', label: 'Vegetarian' },
  { id: 'Street Eats', label: 'Street Eats' },
];

export const DiscoveryPage: React.FC<DiscoveryPageProps> = ({ navigate }) => {
  const { showToast } = useToast();

  const [discoveries, setDiscoveries] = useState<DiscoveryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocality, setSelectedLocality] = useState<string>('all');
  const [budgetTier, setBudgetTier] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'featured' | 'price_low'>('featured');

  // Pagination State
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    loadPublishedDiscoveries();
  }, []);

  const loadPublishedDiscoveries = async () => {
    setLoading(true);
    try {
      const items = await discoveryApi.getPublishedDiscoveries();
      setDiscoveries(items);
    } catch (e) {
      console.error('Failed to load discoveries', e);
    } finally {
      setLoading(false);
    }
  };

  // Distinct localities from published data
  const localities = useMemo(() => {
    const set = new Set(discoveries.map((d) => d.locality).filter(Boolean));
    return Array.from(set).sort();
  }, [discoveries]);

  // Filtered & Sorted Feed
  const filteredDiscoveries = useMemo(() => {
    return discoveries
      .filter((item) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchDish = item.dish_name?.toLowerCase().includes(q);
          const matchRest = item.restaurant_name?.toLowerCase().includes(q);
          const matchLoc = item.locality.toLowerCase().includes(q);
          const matchDesc = item.short_description.toLowerCase().includes(q);
          const matchTag = item.tags?.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchDish && !matchRest && !matchLoc && !matchDesc && !matchTag) {
            return false;
          }
        }

        // Category Filter
        if (selectedCategory !== 'all' && item.category !== selectedCategory) {
          return false;
        }

        // Locality Filter
        if (selectedLocality !== 'all' && item.locality !== selectedLocality) {
          return false;
        }

        // Budget Filter
        if (budgetTier !== 'all' && item.price !== undefined) {
          const max = Number(budgetTier);
          if (item.price > max) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'featured') {
          if (a.is_discovery_of_week && !b.is_discovery_of_week) return -1;
          if (!a.is_discovery_of_week && b.is_discovery_of_week) return 1;
          return (b.saves_count || 0) - (a.saves_count || 0);
        }
        if (sortBy === 'newest') {
          return new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime();
        }
        if (sortBy === 'price_low') {
          return (a.price || 9999) - (b.price || 9999);
        }
        return 0;
      });
  }, [discoveries, searchQuery, selectedCategory, selectedLocality, budgetTier, sortBy]);

  // Featured "Discovery of the Week"
  const discoveryOfWeek = useMemo(() => {
    return discoveries.find((d) => d.is_discovery_of_week && d.status === 'Published');
  }, [discoveries]);

  // Surprise Me Handler
  const handleSurpriseMe = async () => {
    const random = await discoveryApi.getRandomPublishedDiscovery();
    if (random) {
      showToast(`Surprise discovery: ${random.title}!`, 'success');
      navigate(`/discovery/${random.slug}`);
    } else {
      showToast('No discoveries found for Surprise Me', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#1C1917]">
      {/* =========================================================================
          HERO SECTION — THERE'S MORE TO DISCOVER
      ========================================================================= */}
      <section className="relative overflow-hidden pt-10 sm:pt-16 pb-12 sm:pb-16 bg-gradient-to-b from-white via-[#FAFAF7] to-[#FAFAF7] border-b border-[#E7E2DA]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-[#1FB5A0] text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Menu Maps Discovery</span>
          </div>

          <h1 className="hd text-3xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-[1.15]">
            There&apos;s More to Discover.
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
            Explore interesting food, hidden gems, unique dishes and experiences worth discovering across Delhi NCR with verified counter pricing.
          </p>

          {/* Prominent Search Bar & Surprise Me Button */}
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-2.5 pt-2">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dishes, hidden gems, localities, or stalls..."
                className="w-full pl-11 pr-4 py-3.5 rounded-full bg-white border border-[#E7E2DA] text-xs sm:text-sm font-medium shadow-sm focus:ring-2 focus:ring-[#1FB5A0] outline-hidden"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 hover:text-stone-700"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              onClick={handleSurpriseMe}
              className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#1FB5A0] hover:bg-[#199d8b] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0"
              title="Pick a random published discovery"
            >
              <Compass className="w-4 h-4" />
              <span>Surprise Me</span>
            </button>
          </div>

          {/* Trust badges */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-stone-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#1FB5A0]" />
              <span>Verified Counter Rates</span>
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#FF6B4A]" />
              <span>Real Delhi Neighbourhoods</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-[#FFC84A]" />
              <span>Student & Patrons Fieldwork</span>
            </span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          DISCOVERY OF THE WEEK (FEATURED SPOTLIGHT)
      ========================================================================= */}
      {discoveryOfWeek && !searchQuery && selectedCategory === 'all' && (
        <section className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 -mt-6 sm:-mt-8 mb-8 relative z-20">
          <DiscoveryCard discovery={discoveryOfWeek} navigate={navigate} variant="featured" />
        </section>
      )}

      {/* =========================================================================
          CONTROLS & FEED (IN-PAGE FILTERING)
      ========================================================================= */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 py-8 space-y-6">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {CATEGORY_FILTERS.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setVisibleCount(6);
                }}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-[#1FB5A0] text-white shadow-xs'
                    : 'bg-white border border-[#E7E2DA] text-stone-700 hover:bg-stone-50'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Secondary Filter Row: Locality, Budget & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-[#E7E2DA]">
          <div className="flex flex-wrap items-center gap-3">
            {/* Locality Dropdown */}
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              <select
                value={selectedLocality}
                onChange={(e) => {
                  setSelectedLocality(e.target.value);
                  setVisibleCount(6);
                }}
                className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-medium bg-stone-50 focus:ring-2 focus:ring-[#1FB5A0] outline-hidden"
              >
                <option value="all">All Delhi Localities</option>
                {localities.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Budget Dropdown */}
            <div className="flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-stone-400" />
              <select
                value={budgetTier}
                onChange={(e) => {
                  setBudgetTier(e.target.value);
                  setVisibleCount(6);
                }}
                className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-medium bg-stone-50 focus:ring-2 focus:ring-[#1FB5A0] outline-hidden"
              >
                <option value="all">Any Budget</option>
                <option value="50">Under ₹50</option>
                <option value="100">Under ₹100</option>
                <option value="150">Under ₹150</option>
                <option value="200">Under ₹200</option>
              </select>
            </div>
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-800 bg-stone-50 focus:ring-2 focus:ring-[#1FB5A0] outline-hidden"
            >
              <option value="featured">Featured / Popular</option>
              <option value="newest">Recently Published</option>
              <option value="price_low">Price (Lowest first)</option>
            </select>
          </div>
        </div>

        {/* Discovery Feed Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#1FB5A0] border-t-transparent animate-spin mx-auto mb-3" />
            <p className="text-xs text-stone-500 font-medium">Loading verified discoveries...</p>
          </div>
        ) : filteredDiscoveries.length === 0 ? (
          <div className="text-center py-16 p-8 rounded-3xl bg-white border border-[#E7E2DA] space-y-3">
            <Compass className="w-10 h-10 text-stone-400 mx-auto" />
            <h3 className="text-base font-bold text-stone-900">No matching discoveries found</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Try adjusting your search query, location, or category filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedLocality('all');
                setBudgetTier('all');
              }}
              className="px-4 py-2 rounded-full bg-stone-900 text-white text-xs font-bold cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDiscoveries.slice(0, visibleCount).map((item) => (
                <DiscoveryCard key={item.id} discovery={item} navigate={navigate} />
              ))}
            </div>

            {/* Load More Pagination */}
            {visibleCount < filteredDiscoveries.length && (
              <div className="text-center pt-4">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 6)}
                  className="px-8 py-3 rounded-full bg-white hover:bg-stone-50 border border-[#E7E2DA] text-xs font-bold text-stone-800 shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  Load More Discoveries ({filteredDiscoveries.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default DiscoveryPage;
