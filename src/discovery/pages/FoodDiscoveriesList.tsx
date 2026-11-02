/**
 * Menu Maps Discovery - Food Discoveries Directory (/discovery/food-discoveries)
 * Public directory showcasing hidden street gems, student canteen recommendations,
 * and verified counter-priced local food places.
 */

import React, { useState, useEffect } from 'react';
import {
  Compass,
  Search,
  Filter,
  Sparkles,
  ShieldCheck,
  PlusCircle,
  ArrowLeft,
  MapPin,
  UtensilsCrossed,
} from 'lucide-react';
import { discoveryApi } from '../lib/discoveryApi';
import { FoodDiscoveryItem, FoodDiscoveryVerificationStatus } from '../types/discovery';
import { FoodDiscoveryCard } from '../components/FoodDiscoveryCard';
import { DiscoveryNavbar } from '../components/DiscoveryNavbar';
import { useStudentAuth } from '../context/StudentAuthContext';

interface FoodDiscoveriesListProps {
  navigate: (path: string) => void;
}

export const FoodDiscoveriesList: React.FC<FoodDiscoveriesListProps> = ({ navigate }) => {
  const { student } = useStudentAuth();
  const [discoveries, setDiscoveries] = useState<FoodDiscoveryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Verified' | 'Community'>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    loadDiscoveries();
  }, []);

  const loadDiscoveries = async () => {
    setLoading(true);
    try {
      // Get all approved and submitted discoveries
      const data = await discoveryApi.getAllFoodDiscoveries();
      setDiscoveries(data);
    } catch (e) {
      console.error('Failed to load food discoveries', e);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'All',
    'Hidden Gem Cafe',
    'Street Food Legend',
    'Pocket-Friendly Canteen',
    'Late Night Corner',
    'Legendary Chaat & Rolls',
    'Heritage Bakery',
  ];

  const filteredDiscoveries = discoveries.filter((item) => {
    // Search query
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      item.food_place_name.toLowerCase().includes(q) ||
      item.neighbourhood.toLowerCase().includes(q) ||
      item.featured_dish.toLowerCase().includes(q) ||
      item.contributor_name.toLowerCase().includes(q);

    // Status filter
    let matchStatus = true;
    if (selectedStatus === 'Verified') {
      matchStatus = item.verification_status === 'Verified by Menu Maps';
    } else if (selectedStatus === 'Community') {
      matchStatus =
        item.verification_status === 'Student Submitted' ||
        item.verification_status === 'Awaiting Review';
    }

    // Category filter
    let matchCategory = true;
    if (selectedCategory !== 'All') {
      matchCategory = item.category.toLowerCase().includes(selectedCategory.toLowerCase());
    }

    return matchSearch && matchStatus && matchCategory;
  });

  const handleContributeClick = () => {
    if (student) {
      navigate('/discovery/dashboard?tab=discoveries');
    } else {
      navigate('/discovery/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917]">
      <DiscoveryNavbar navigate={navigate} activeTab="discoveries" />

      {/* Header Banner */}
      <section className="bg-white border-b border-stone-200/80 pt-10 pb-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate('/discovery')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-500 hover:text-[#0F766E] mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Discovery Overview
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-[#0F766E] text-xs font-semibold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Crowd-Sourced & Ground-Verified
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
                Food Discoveries & Hidden Spots
              </h1>
              <p className="text-stone-600 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
                Explore real street food joints, legendary student haunts, and hidden alley eateries submitted by local university students and verified by Menu Maps with counter rates.
              </p>
            </div>

            <button
              onClick={handleContributeClick}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#0F766E] text-white font-semibold text-sm hover:bg-[#0d635c] transition-all shadow-sm shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit a Discovery (+100 Credits)</span>
            </button>
          </div>

          {/* Search & Filters */}
          <div className="mt-8 pt-6 border-t border-stone-100 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search by spot name, dish (e.g. momos, chole), or area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:bg-white transition-all"
              />
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <button
                onClick={() => setSelectedStatus('All')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedStatus === 'All'
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                All Discoveries ({discoveries.length})
              </button>
              <button
                onClick={() => setSelectedStatus('Verified')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedStatus === 'Verified'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified by Menu Maps
              </button>
              <button
                onClick={() => setSelectedStatus('Community')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedStatus === 'Community'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-900 border border-amber-200/80 hover:bg-amber-100'
                }`}
              >
                Community Submitted
              </button>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pt-4 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#0F766E] text-white shadow-2xs'
                    : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Directory Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-[#0F766E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-stone-500 font-medium">Loading discoveries...</p>
          </div>
        ) : filteredDiscoveries.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-4 text-stone-400">
              <UtensilsCrossed className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">No discoveries match your criteria</h3>
            <p className="text-xs text-stone-600 mb-6 leading-relaxed">
              We couldn't find any discoveries matching "{searchQuery || selectedCategory}". Be the first student to document a hidden food gem in this area!
            </p>
            <button
              onClick={handleContributeClick}
              className="px-5 py-2.5 bg-[#0F766E] text-white text-xs font-semibold rounded-xl hover:bg-[#0d635c] transition-colors shadow-sm"
            >
              Submit This Spot
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDiscoveries.map((discovery) => (
              <FoodDiscoveryCard key={discovery.id} discovery={discovery} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
