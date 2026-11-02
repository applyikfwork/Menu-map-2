/**
 * Menu Maps Discovery - Competition Card
 * Renders an active or past competition card with verified database dates and status.
 */

import React from 'react';
import {
  Calendar,
  Users,
  Award,
  ArrowRight,
  Clock,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { DiscoveryCompetition, CompetitionStatus } from '../types/discovery';

interface CompetitionCardProps {
  competition: DiscoveryCompetition;
  navigate: (path: string) => void;
  onRegisterClick?: (competition: DiscoveryCompetition) => void;
}

const getStatusBadge = (status: CompetitionStatus) => {
  switch (status) {
    case 'Registration Open':
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dot: 'bg-emerald-500 animate-pulse',
        label: 'Registration Open',
      };
    case 'Upcoming':
      return {
        bg: 'bg-sky-50 text-sky-800 border-sky-200',
        dot: 'bg-sky-500',
        label: 'Upcoming Challenge',
      };
    case 'Ongoing':
      return {
        bg: 'bg-amber-50 text-amber-900 border-amber-200',
        dot: 'bg-amber-500 animate-pulse',
        label: 'Ongoing · Submissions Active',
      };
    case 'Submission Closed':
    case 'Under Evaluation':
      return {
        bg: 'bg-purple-50 text-purple-900 border-purple-200',
        dot: 'bg-purple-500',
        label: 'Under Jury Evaluation',
      };
    case 'Completed':
      return {
        bg: 'bg-stone-100 text-stone-700 border-stone-200',
        dot: 'bg-stone-400',
        label: 'Completed · Results in Hall of Fame',
      };
    default:
      return {
        bg: 'bg-stone-50 text-stone-600 border-stone-200',
        dot: 'bg-stone-300',
        label: status,
      };
  }
};

export const CompetitionCard: React.FC<CompetitionCardProps> = ({
  competition,
  navigate,
  onRegisterClick,
}) => {
  const statusInfo = getStatusBadge(competition.status);

  // Format dates
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const isRegistrationOpen = competition.status === 'Registration Open';

  return (
    <div className="bg-white border border-[#E7E2DA] rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Cover Image & Category Badges */}
        <div className="relative aspect-video w-full overflow-hidden bg-stone-100">
          <img
            src={competition.cover_image_url}
            alt={competition.title}
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur-md ${statusInfo.bg}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
              <span>{statusInfo.label}</span>
            </span>

            <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold">
              {competition.format}
            </span>
          </div>

          {/* Category Tag on bottom left of image */}
          <div className="absolute bottom-3 left-3">
            <span className="px-2.5 py-0.5 rounded-md bg-[#FF5A36] text-white text-[10px] font-black uppercase tracking-wider">
              {competition.category}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500">
            <Users className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>
              {competition.is_team_competition
                ? `Team (${competition.min_team_size}–${competition.max_team_size} members)`
                : 'Individual Entry'}
            </span>
            <span>•</span>
            <span className="truncate">{competition.eligibility}</span>
          </div>

          <h3 className="hd text-lg font-bold text-[#1C1917] group-hover:text-[#0F766E] transition-colors leading-snug">
            {competition.title}
          </h3>

          <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed line-clamp-2">
            {competition.short_description}
          </p>

          {/* Key Dates Grid */}
          <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] border-t border-stone-100">
            <div className="bg-[#FAF8F5] p-2 rounded-xl">
              <span className="text-stone-400 block font-medium">Registration Deadline</span>
              <span className="font-bold text-stone-800">{formatDate(competition.registration_end_date)}</span>
            </div>
            <div className="bg-[#FAF8F5] p-2 rounded-xl">
              <span className="text-stone-400 block font-medium">Submission Deadline</span>
              <span className="font-bold text-[#D8350F]">{formatDate(competition.submission_deadline)}</span>
            </div>
          </div>

          {/* Rewards Preview */}
          {competition.rewards && competition.rewards.length > 0 && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-amber-900 text-xs font-bold">
              <Award className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="truncate">
                {competition.rewards[0].prize
                  ? `${competition.rewards[0].title}: ${competition.rewards[0].prize}`
                  : competition.rewards[0].title}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-5 sm:p-6 pt-0 flex items-center gap-2">
        <button
          onClick={() => navigate(`/discovery/competitions/${competition.slug}`)}
          className="btn flex-1 bg-white hover:bg-stone-50 border border-[#E7E2DA] text-[#1C1917] min-h-[42px] px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>View Challenge Details</span>
          <ArrowRight className="w-3.5 h-3.5 text-stone-500" />
        </button>

        {isRegistrationOpen && (
          <button
            onClick={() => {
              if (onRegisterClick) {
                onRegisterClick(competition);
              } else {
                navigate(`/discovery/competitions/${competition.slug}#register`);
              }
            }}
            className="btn bg-[#0F766E] hover:bg-[#0D9488] text-white min-h-[42px] px-4 rounded-xl text-xs font-extrabold flex items-center justify-center shadow-xs cursor-pointer"
          >
            <span>Register Now</span>
          </button>
        )}
      </div>
    </div>
  );
};
