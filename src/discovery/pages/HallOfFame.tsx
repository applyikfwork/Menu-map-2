/**
 * Menu Maps Discovery - Hall of Fame (/discovery/hall-of-fame)
 * Official honour roll celebrating competition champions, runners-up, finalists, and jury picks.
 */

import React, { useState, useEffect } from 'react';
import { Award, Trophy, ArrowLeft, Star, Medal, Sparkles, User, Calendar } from 'lucide-react';
import { discoveryApi } from '../lib/discoveryApi';
import { HallOfFameEntry, AwardRank } from '../types/discovery';
import { DiscoveryNavbar } from '../components/DiscoveryNavbar';

interface HallOfFameProps {
  navigate: (path: string) => void;
}

const getRankBadgeColor = (rank: AwardRank) => {
  switch (rank) {
    case 'Champion':
      return 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-300/40';
    case 'First Runner-Up':
      return 'bg-stone-100 text-stone-900 border-stone-300';
    case 'Second Runner-Up':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'Finalist':
      return 'bg-purple-100 text-purple-900 border-purple-200';
    default:
      return 'bg-teal-100 text-teal-900 border-teal-200';
  }
};

export const HallOfFame: React.FC<HallOfFameProps> = ({ navigate }) => {
  const [entries, setEntries] = useState<HallOfFameEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const data = await discoveryApi.getHallOfFameEntries();
      setEntries(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917]">
      <DiscoveryNavbar currentPath="/discovery/hall-of-fame" navigate={navigate} />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 py-10 sm:py-14 space-y-10">
        {/* Header */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/discovery')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Discovery Overview</span>
          </button>

          <h1 className="hd text-3xl sm:text-5xl font-black text-[#1C1917]">
            Discovery Hall of Fame
          </h1>

          <p className="text-sm sm:text-base text-stone-500 max-w-2xl leading-relaxed">
            Honouring outstanding student champions, finalists, and best-in-class creators from official Menu Maps challenges. All citations and rankings are certified by our platform juries.
          </p>
        </div>

        {/* Entries Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#0F766E] border-t-transparent animate-spin mx-auto mb-3" />
            <span className="text-xs text-stone-500 font-semibold">Loading Hall of Fame records...</span>
          </div>
        ) : entries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entries.map((entry) => {
              const badgeStyle = getRankBadgeColor(entry.award_rank);
              return (
                <div
                  key={entry.id}
                  className="bg-white border border-[#E7E2DA] rounded-[32px] p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl">🏆</span>
                      <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border ${badgeStyle}`}>
                        {entry.award_rank}
                      </span>
                    </div>

                    <div>
                      <h3 className="hd text-xl font-bold text-[#1C1917] leading-snug">
                        {entry.winner_name}
                      </h3>
                      {entry.college_name && (
                        <p className="text-xs text-stone-500 font-medium">{entry.college_name}</p>
                      )}
                      {entry.team_name && (
                        <p className="text-xs text-[#0F766E] font-bold">Team: {entry.team_name}</p>
                      )}
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E7E2DA] text-xs space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                        Winning Entry
                      </span>
                      <strong className="text-stone-900 font-bold block">{entry.project_title}</strong>
                      <span className="text-[11px] text-[#0F766E] font-semibold block">
                        {entry.competition_title}
                      </span>
                    </div>

                    {entry.citation && (
                      <p className="text-xs text-[#57534E] italic leading-relaxed pt-1">
                        &quot;{entry.citation}&quot;
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                    <span>Year {entry.year || 2026}</span>
                    <span>
                      {new Date(entry.awarded_at).toLocaleDateString('en-IN', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-dashed border-[#E7E2DA] rounded-3xl p-14 text-center space-y-3">
            <Trophy className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="hd text-lg font-bold text-stone-700">
              No Hall of Fame records published yet
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Results and prize citations will be declared here once upcoming challenge submissions complete jury evaluation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
