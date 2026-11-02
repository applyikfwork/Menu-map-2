/**
 * Menu Maps Discovery - Competitions Directory (/discovery/competitions)
 * Searchable, filterable directory of live, upcoming, and past student challenges.
 */

import React, { useState, useEffect } from 'react';
import { Trophy, Search, Filter, ArrowLeft, Calendar, Sparkles } from 'lucide-react';
import { discoveryApi } from '../lib/discoveryApi';
import { DiscoveryCompetition, CompetitionCategory } from '../types/discovery';
import { DiscoveryNavbar } from '../components/DiscoveryNavbar';
import { CompetitionCard } from '../components/CompetitionCard';

interface CompetitionsListProps {
  navigate: (path: string) => void;
}

export const CompetitionsList: React.FC<CompetitionsListProps> = ({ navigate }) => {
  const [competitions, setCompetitions] = useState<DiscoveryCompetition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCompetitions();
  }, []);

  const loadCompetitions = async () => {
    setLoading(true);
    try {
      const data = await discoveryApi.getCompetitions(true);
      setCompetitions(data);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompetitions = competitions.filter((c) => {
    if (selectedFilter === 'offline' && c.format.toLowerCase() !== 'offline') return false;
    if (selectedFilter === 'online' && c.format.toLowerCase() !== 'online') return false;
    if (selectedFilter === 'open' && c.status !== 'Registration Open') return false;
    if (selectedFilter === 'upcoming' && c.status !== 'Upcoming') return false;
    if (selectedFilter === 'completed' && c.status !== 'Completed') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        c.title.toLowerCase().includes(q) ||
        c.short_description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917]">
      <DiscoveryNavbar currentPath="/discovery/competitions" navigate={navigate} />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 py-10 sm:py-14">
        {/* Discovery League Flagship Callout Banner */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 rounded-3xl p-6 sm:p-8 text-white shadow-md mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-stone-800">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Menu Maps Discovery League • Season 01</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-white">
              The Great Market Mission & The Foodverse Challenge
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
              Two flagship competitions. Compare challenges, check mission tasks, and register your team.
            </p>
          </div>
          <button
            onClick={() => navigate('/discovery/competitions/discovery-league')}
            className="px-5 py-3 rounded-2xl bg-[#0F766E] hover:bg-[#0d635c] text-white text-xs sm:text-sm font-bold shadow-sm transition-all whitespace-nowrap shrink-0 text-center"
          >
            Explore Season 01 League &rarr;
          </button>
        </div>

        {/* Header */}
        <div className="space-y-3 mb-8">
          <button
            onClick={() => navigate('/discovery')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Discovery Overview</span>
          </button>

          <h1 className="hd text-3xl sm:text-5xl font-black text-[#1C1917]">
            Discovery Competitions & Challenges
          </h1>

          <p className="text-sm sm:text-base text-stone-500 max-w-2xl leading-relaxed">
            Take on real-world food discovery quests, digital interface challenges, and field missions. Earn verifiable certificates, credits, and community recognition.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white border border-[#E7E2DA] rounded-3xl p-4 sm:p-5 shadow-2xs mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search challenges by keyword, category, or rules..."
                className="w-full bg-[#FAF8F5] border border-[#E7E2DA] focus:border-[#0F766E] rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium outline-hidden"
              />
            </div>

            {/* Filter Pills: All, Offline, Online, Registration Open, Upcoming, Completed */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              {[
                { id: 'all', label: 'All Competitions' },
                { id: 'offline', label: 'Offline' },
                { id: 'online', label: 'Online' },
                { id: 'open', label: 'Registration Open' },
                { id: 'upcoming', label: 'Upcoming' },
                { id: 'completed', label: 'Completed' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFilter(f.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedFilter === f.id
                      ? 'bg-[#0F766E] text-white shadow-2xs'
                      : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Competitions Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#0F766E] border-t-transparent animate-spin mx-auto mb-3" />
            <span className="text-xs text-stone-500 font-semibold">Loading live challenges...</span>
          </div>
        ) : filteredCompetitions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompetitions.map((comp) => (
              <CompetitionCard key={comp.id} competition={comp} navigate={navigate} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-dashed border-[#E7E2DA] rounded-3xl p-12 text-center space-y-3">
            <Trophy className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="hd text-lg font-bold text-stone-700">No active competitions match your filter</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Try resetting your search query or switching formats to see other challenges.
            </p>
            <button
              onClick={() => {
                setSelectedFormat('all');
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="btn bg-[#0F766E] text-white px-4 py-2 rounded-xl text-xs font-bold mt-2 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
