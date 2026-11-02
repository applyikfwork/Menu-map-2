/**
 * Menu Maps Discovery - Contributor Card
 * Displays a verified community contributor with level badge, contributions, and portfolio link.
 */

import React from 'react';
import { User, Award, CheckCircle2, ArrowRight } from 'lucide-react';
import { StudentProfile } from '../types/discovery';

interface ContributorCardProps {
  profile: StudentProfile;
  navigate: (path: string) => void;
}

const getLevelBadge = (level: StudentProfile['contributor_level']) => {
  switch (level) {
    case 'Community Leader':
      return 'bg-purple-100 text-purple-900 border-purple-200';
    case 'Active Contributor':
      return 'bg-emerald-100 text-emerald-900 border-emerald-200';
    case 'Contributor':
      return 'bg-teal-100 text-teal-900 border-teal-200';
    default:
      return 'bg-stone-100 text-stone-700 border-stone-200';
  }
};

export const ContributorCard: React.FC<ContributorCardProps> = ({ profile, navigate }) => {
  const levelBadge = getLevelBadge(profile.contributor_level);

  return (
    <div className="bg-white border border-[#E7E2DA] rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="w-12 h-12 rounded-2xl object-cover border border-stone-200"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0F766E] to-teal-800 text-white flex items-center justify-center font-black text-base shadow-xs">
                {profile.full_name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h4 className="hd text-base font-bold text-[#1C1917] group-hover:text-[#0F766E] transition-colors leading-snug">
                {profile.full_name}
              </h4>
              {profile.public_consent_college && profile.college_name && (
                <p className="text-xs text-stone-500 truncate max-w-[160px]">{profile.college_name}</p>
              )}
            </div>
          </div>

          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${levelBadge} shrink-0`}>
            {profile.contributor_level}
          </span>
        </div>

        {profile.bio && (
          <p className="text-xs text-[#57534E] leading-relaxed line-clamp-2 mt-3">
            {profile.bio}
          </p>
        )}

        {/* Real Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-stone-100 text-center">
          <div className="bg-[#FAF8F5] p-2 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Contributions</span>
            <span className="font-black text-sm text-[#1C1917]">{profile.total_contributions_count || 0}</span>
          </div>
          <div className="bg-[#FAF8F5] p-2 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Credits Earned</span>
            <span className="font-black text-sm text-[#0F766E]">{profile.total_credits || 0}</span>
          </div>
        </div>
      </div>

      {/* Action */}
      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
        <span className="text-[11px] text-stone-400">
          Member since {new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
        </span>

        {profile.portfolio_slug && (
          <button
            onClick={() => navigate(`/discovery/contributors/${profile.portfolio_slug}`)}
            className="font-bold text-[#0F766E] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>Portfolio</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
