/**
 * Menu Maps Discovery - Competitions Hub (/competitions)
 * Menu Maps Discovery League — Season 01
 * Features:
 * - The Great Market Mission (Offline Exploration)
 * - The Foodverse Challenge (Online Digital Innovation)
 * - Interactive Join Competition Modal (Individual & Team)
 */

import React, { useState, useEffect } from 'react';
import {
  Trophy,
  MapPin,
  Laptop,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { DiscoveryCompetition } from '../types/discovery';
import { discoveryApi } from '../lib/discoveryApi';
import { CompetitionJoinModal } from '../components/CompetitionJoinModal';
import { useStudentAuth } from '../context/StudentAuthContext';

interface CompetitionsPageProps {
  navigate: (path: string) => void;
}

export const CompetitionsPage: React.FC<CompetitionsPageProps> = ({ navigate }) => {
  const { student, isAuthenticated } = useStudentAuth();

  const [competitions, setCompetitions] = useState<DiscoveryCompetition[]>([]);
  const [selectedCompForJoin, setSelectedCompForJoin] = useState<DiscoveryCompetition | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompetitions();
  }, []);

  const loadCompetitions = async () => {
    setLoading(true);
    try {
      const comps = await discoveryApi.getCompetitions();
      setCompetitions(comps);
    } catch (e) {
      console.error('Failed to load competitions', e);
    } finally {
      setLoading(false);
    }
  };

  const gmmComp = competitions.find((c) => c.slug === 'the-great-market-mission') || competitions[0];
  const foodverseComp = competitions.find((c) => c.slug === 'the-foodverse-challenge') || competitions[1];

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#1C1917] pb-16">
      {/* =========================================================================
          HERO SECTION — MENU MAPS DISCOVERY LEAGUE (SEASON 01)
      ========================================================================= */}
      <section className="relative overflow-hidden pt-12 sm:pt-16 pb-12 sm:pb-16 bg-stone-900 text-white border-b border-stone-800">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#1FB5A0]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FF6B4A]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 relative z-10 text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-[#1FB5A0] text-xs font-black uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5" />
            <span>Official Student Competition Series</span>
          </div>

          <h1 className="hd text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
            MENU MAPS DISCOVERY LEAGUE
          </h1>

          <div className="text-sm sm:text-base font-bold text-amber-400 uppercase tracking-widest">
            SEASON 01 • &ldquo;Discover More. Create More. Make Your Mark.&rdquo;
          </div>

          <p className="text-xs sm:text-base text-stone-300 max-w-2xl mx-auto leading-relaxed">
            Menu Maps Discovery League invites university students to explore real food places, investigate honest menu counter prices, discover authentic hidden gems, and build creative digital experiences.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#the-great-market-mission"
              className="px-6 py-3 rounded-full bg-[#1FB5A0] hover:bg-[#199d8b] text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
            >
              The Great Market Mission (Offline)
            </a>
            <a
              href="#the-foodverse-challenge"
              className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs sm:text-sm font-bold transition-all cursor-pointer"
            >
              The Foodverse Challenge (Online)
            </a>
          </div>
        </div>
      </section>

      {/* Trust & Structure Strip */}
      <div className="bg-white border-b border-[#E7E2DA] py-4">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-[#1FB5A0] shrink-0" />
            <div>
              <div className="font-bold text-stone-900">Solo or Team</div>
              <div className="text-stone-500 text-[11px]">Individual & Group entries</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#1FB5A0] shrink-0" />
            <div>
              <div className="font-bold text-stone-900">100% Free Entry</div>
              <div className="text-stone-500 text-[11px]">No compulsory purchases</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Award className="w-4 h-4 text-[#1FB5A0] shrink-0" />
            <div>
              <div className="font-bold text-stone-900">Portfolio Credits</div>
              <div className="text-stone-500 text-[11px]">Official verified credits</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#1FB5A0] shrink-0" />
            <div>
              <div className="font-bold text-stone-900">Public Showcase</div>
              <div className="text-stone-500 text-[11px]">Published on Menu Maps</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 pt-12 space-y-16">
        {/* =========================================================================
            COMPETITION 1: THE GREAT MARKET MISSION
        ========================================================================= */}
        {gmmComp && (
          <section id="the-great-market-mission" className="scroll-mt-24 space-y-6">
            <div className="bg-white rounded-3xl border border-[#E7E2DA] overflow-hidden shadow-xs">
              {/* Competition Header Card */}
              <div className="p-6 sm:p-10 border-b border-[#E7E2DA] bg-gradient-to-r from-amber-500/10 via-white to-white flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-black uppercase tracking-wider">
                      Competition 01 • Offline Exploration
                    </span>
                    <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-[11px] font-bold">
                      {gmmComp.duration_days} Days Duration
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-black text-stone-900 leading-tight">
                    {gmmComp.title}
                  </h2>

                  <p className="text-sm font-bold text-[#FF6B4A]">
                    &ldquo;{gmmComp.tagline}&rdquo;
                  </p>

                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {gmmComp.description}
                  </p>
                </div>

                <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2">
                  <button
                    onClick={() => setSelectedCompForJoin(gmmComp)}
                    className="px-6 py-3 rounded-full bg-[#1FB5A0] hover:bg-[#199d8b] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Trophy className="w-4 h-4" />
                    <span>Join This Competition</span>
                  </button>
                  <span className="text-[11px] text-stone-400 text-center">
                    {gmmComp.participation_type}
                  </span>
                </div>
              </div>

              {/* Mission Tasks (100 Points Total) */}
              <div className="p-6 sm:p-10 space-y-6">
                <div>
                  <h3 className="text-base font-black text-stone-900 uppercase tracking-wider text-[#1FB5A0]">
                    Mission Tasks & Point Breakdown
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Complete all 4 missions in an accessible local market (e.g. Kamla Nagar, CR Park, Chandni Chowk, CP, Lajpat Nagar).
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gmmComp.tasks.map((task, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-[#FAFAF7] border border-[#E7E2DA] space-y-2 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-stone-900">{task.title}</h4>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                            {task.points} pts
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 leading-relaxed mt-2">
                          {task.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Scoring Criteria & Rules Accordion/Box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#E7E2DA]">
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase text-stone-500 tracking-wider">
                      Judging Criteria (100 Points)
                    </h4>
                    <div className="space-y-2">
                      {gmmComp.scoring_criteria.map((sc, i) => (
                        <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-stone-100">
                          <span className="text-stone-700">{sc.criterion}</span>
                          <span className="font-bold text-stone-900">{sc.points} pts</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase text-stone-500 tracking-wider">
                      Safety & Integrity Rules
                    </h4>
                    <ul className="space-y-1.5 text-xs text-stone-600">
                      {gmmComp.rules.map((rule, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#1FB5A0] shrink-0 mt-0.5" />
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =========================================================================
            COMPETITION 2: THE FOODVERSE CHALLENGE
        ========================================================================= */}
        {foodverseComp && (
          <section id="the-foodverse-challenge" className="scroll-mt-24 space-y-6">
            <div className="bg-white rounded-3xl border border-[#E7E2DA] overflow-hidden shadow-xs">
              {/* Competition Header Card */}
              <div className="p-6 sm:p-10 border-b border-[#E7E2DA] bg-gradient-to-r from-teal-500/10 via-white to-white flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-teal-100 text-teal-900 text-[11px] font-black uppercase tracking-wider">
                      Competition 02 • Online Creative & Digital
                    </span>
                    <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-[11px] font-bold">
                      {foodverseComp.duration_days} Days Duration
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-black text-stone-900 leading-tight">
                    {foodverseComp.title}
                  </h2>

                  <p className="text-sm font-bold text-[#1FB5A0]">
                    &ldquo;{foodverseComp.tagline}&rdquo;
                  </p>

                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {foodverseComp.description}
                  </p>
                </div>

                <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2">
                  <button
                    onClick={() => setSelectedCompForJoin(foodverseComp)}
                    className="px-6 py-3 rounded-full bg-[#1FB5A0] hover:bg-[#199d8b] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Trophy className="w-4 h-4" />
                    <span>Join This Competition</span>
                  </button>
                  <span className="text-[11px] text-stone-400 text-center">
                    {foodverseComp.participation_type}
                  </span>
                </div>
              </div>

              {/* Suggested Tracks */}
              <div className="p-6 sm:p-10 space-y-6">
                <div>
                  <h3 className="text-base font-black text-stone-900 uppercase tracking-wider text-[#1FB5A0]">
                    5 Challenge Tracks (Choose Any One)
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Coding is not compulsory. UI/UX prototypes, visual food maps, or research decks are fully accepted.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {foodverseComp.tracks?.map((track, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-[#FAFAF7] border border-[#E7E2DA] flex items-start gap-3"
                    >
                      <span className="w-6 h-6 rounded-full bg-[#1FB5A0] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-stone-800 leading-snug">{track}</span>
                    </div>
                  ))}
                </div>

                {/* Tasks & Judging Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#E7E2DA]">
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase text-stone-500 tracking-wider">
                      Required Submission Deliverables
                    </h4>
                    <div className="space-y-3">
                      {foodverseComp.tasks.map((task, i) => (
                        <div key={i} className="p-3 rounded-xl bg-stone-50 text-xs">
                          <div className="font-bold text-stone-900">{task.title}</div>
                          <div className="text-stone-500 mt-0.5">{task.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase text-stone-500 tracking-wider">
                      Judging Criteria (100 Points)
                    </h4>
                    <div className="space-y-2">
                      {foodverseComp.scoring_criteria.map((sc, i) => (
                        <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-stone-100">
                          <span className="text-stone-700">{sc.criterion}</span>
                          <span className="font-bold text-stone-900">{sc.points} pts</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-teal-900 leading-relaxed mt-4">
                      <strong>Submission Note:</strong> Free tools like Figma, Google Slides, Canva, or Loom screen recordings are 100% accepted.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Join Modal */}
      {selectedCompForJoin && (
        <CompetitionJoinModal
          competition={selectedCompForJoin}
          onClose={() => setSelectedCompForJoin(null)}
          navigate={navigate}
        />
      )}
    </div>
  );
};

export default CompetitionsPage;
