/**
 * Menu Maps Discovery - Contributors Directory (/discovery/contributors)
 * Showcases students, field researchers, designers, and community ambassadors building Menu Maps.
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Award,
  Sparkles,
  ArrowLeft,
  Building,
  GraduationCap,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { discoveryApi } from '../lib/discoveryApi';
import { StudentProfile, ContributorLevel } from '../types/discovery';
import { ContributorCard } from '../components/ContributorCard';
import { DiscoveryNavbar } from '../components/DiscoveryNavbar';

interface ContributorsListProps {
  navigate: (path: string) => void;
}

export const ContributorsList: React.FC<ContributorsListProps> = ({ navigate }) => {
  const [contributors, setContributors] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');

  useEffect(() => {
    loadContributors();
  }, []);

  const loadContributors = async () => {
    setLoading(true);
    try {
      const data = await discoveryApi.getPublicContributors();
      setContributors(data);
    } catch (e) {
      console.error('Failed to load contributors', e);
    } finally {
      setLoading(false);
    }
  };

  const levels: Array<'All' | ContributorLevel> = [
    'All',
    'Community Leader',
    'Active Contributor',
    'Contributor',
    'Explorer',
  ];

  const filteredContributors = contributors.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      c.full_name.toLowerCase().includes(q) ||
      (c.college_name && c.college_name.toLowerCase().includes(q)) ||
      (c.contributor_title && c.contributor_title.toLowerCase().includes(q)) ||
      (c.bio && c.bio.toLowerCase().includes(q));

    const matchLevel = selectedLevel === 'All' || c.contributor_level === selectedLevel;

    return matchSearch && matchLevel;
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917]">
      <DiscoveryNavbar navigate={navigate} activeTab="contributors" />

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
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-semibold uppercase tracking-wider mb-2">
                <Users className="w-3.5 h-3.5 text-amber-700" />
                Community & People
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
                The People Behind Menu Maps
              </h1>
              <p className="text-stone-600 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
                Meet the passionate university students, food researchers, and designers documenting real counter pricing, mapping hidden food trails, and building civic food technology across India.
              </p>
            </div>

            <button
              onClick={() => navigate('/discovery/register')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#0F766E] text-white font-semibold text-sm hover:bg-[#0d635c] transition-all shadow-sm shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>Join as Student Contributor</span>
            </button>
          </div>

          {/* Search & Level Filters */}
          <div className="mt-8 pt-6 border-t border-stone-100 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search by student name, college, or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:bg-white transition-all"
              />
            </div>

            {/* Level Filter Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              {levels.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedLevel === lvl
                      ? 'bg-stone-900 text-white shadow-2xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Directory Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-[#0F766E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-stone-500 font-medium">Loading student contributors...</p>
          </div>
        ) : filteredContributors.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-4 text-stone-400">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">No contributors found</h3>
            <p className="text-xs text-stone-600 mb-6 leading-relaxed">
              No public student profiles match your search criteria. Be the first to build a public portfolio!
            </p>
            <button
              onClick={() => navigate('/discovery/register')}
              className="px-5 py-2.5 bg-[#0F766E] text-white text-xs font-semibold rounded-xl hover:bg-[#0d635c] transition-colors shadow-sm"
            >
              Create Your Profile
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContributors.map((contributor) => (
              <ContributorCard
                key={contributor.id}
                contributor={contributor}
                onClick={() => {
                  if (contributor.portfolio_slug) {
                    navigate(`/discovery/contributors/${contributor.portfolio_slug}`);
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
