/**
 * Menu Maps Discovery - Competitions Hub (/competitions)
 * Menu Maps Discovery League — Season 01
 * Exactly TWO Flagship Competitions:
 * 1. THE GREAT MARKET MISSION (Offline Exploration)
 * 2. THE FOODVERSE CHALLENGE (Online Creative Innovation)
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
  ChevronDown,
  ChevronUp,
  HelpCircle,
  ExternalLink,
  Compass,
  Utensils,
  Wallet,
  FileText,
  Lightbulb,
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

  // Accordion state for FAQs
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

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

  const gmmComp =
    competitions.find((c) => c.slug === 'the-great-market-mission' || c.id.includes('market')) ||
    competitions[0];
  const foodverseComp =
    competitions.find((c) => c.slug === 'the-foodverse-challenge' || c.id.includes('foodverse')) ||
    competitions[1];

  const faqs = [
    {
      q: '1. Can I participate individually?',
      a: 'Yes! Both The Great Market Mission and The Foodverse Challenge welcome individual participants. You can explore or build completely solo and receive full personal recognition.',
    },
    {
      q: '2. Can I participate with friends?',
      a: 'Yes! For The Great Market Mission, you can form a team of 2–3 students. For The Foodverse Challenge, you can collaborate with friends as a team (up to 4 members). A team leader registers the team and manages submissions on behalf of all members.',
    },
    {
      q: '3. Do I need coding skills?',
      a: 'No! Coding is completely optional. In The Great Market Mission, you conduct offline exploration, observe menus, and build visual maps. In The Foodverse Challenge, you can submit UI/UX designs, Figma prototypes, Canva mockups, or conceptual digital maps.',
    },
    {
      q: '4. Do I need to purchase food?',
      a: 'No! There is strictly no compulsory food purchase required. In the Budget Battle mission and all other tasks, your research, menu photography, and observed counter prices are fully sufficient.',
    },
    {
      q: '5. Can beginners participate?',
      a: 'Absolutely! Both competitions are designed to be beginner-friendly. We value curiosity, honest observation, and creative problem solving over previous experience or specialized design backgrounds.',
    },
    {
      q: '6. How do I submit my work?',
      a: 'Log in to your Student Dashboard, open the My Competitions tab, and click "Submit Project". You will find a dedicated form tailored to your competition\'s required missions and deliverables.',
    },
    {
      q: '7. Can I edit my submission?',
      a: 'Yes! You can save drafts at any time, edit your answers, update links, and revise deliverables until the official submission deadline.',
    },
    {
      q: '8. How are winners selected?',
      a: 'Submissions are evaluated by the Menu Maps panel based on transparency, usefulness, originality, research depth, and visual clarity using a structured 100-point rubric.',
    },
    {
      q: '9. Where can I check my results?',
      a: 'Results, evaluation scores out of 100, and jury feedback will appear directly inside your Student Dashboard under the My Competitions section once published by the evaluation team.',
    },
    {
      q: '10. How do I receive recognition?',
      a: 'All qualifying participants receive verified digital participation certificates. Winners and category awardees receive verified achievement certificates, Hall of Fame showcase, and permanent contributor attribution on Menu Maps.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#1C1917] pb-20">
      {/* =========================================================================
          PART 1 — COMPETITION HERO
      ========================================================================= */}
      <section className="relative overflow-hidden pt-14 sm:pt-20 pb-16 sm:pb-20 bg-stone-900 text-white border-b border-stone-800">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1FB5A0]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#FF6B4A]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 md:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[#1FB5A0] text-xs font-black uppercase tracking-wider">
            <Trophy className="w-4 h-4 text-[#FFC84A]" />
            <span>Official Student Competition Series • Season 01</span>
          </div>

          <h1 className="hd text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
            MENU MAPS DISCOVERY LEAGUE
          </h1>

          <div className="text-base sm:text-xl font-bold text-[#FFC84A] tracking-wide">
            &ldquo;Discover More. Create More. Make Your Mark.&rdquo;
          </div>

          <p className="text-xs sm:text-base text-stone-300 max-w-2xl mx-auto leading-relaxed">
            Explore real food places, uncover interesting discoveries and create fresh ideas for the future of food exploration. Choose your challenge, participate individually or with a team, and showcase your creativity.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#the-great-market-mission"
              className="px-6 py-3 rounded-full bg-[#1FB5A0] hover:bg-[#199d8b] text-white text-xs sm:text-sm font-bold shadow-lg transition-all cursor-pointer flex items-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>The Great Market Mission (Offline)</span>
            </a>
            <a
              href="#the-foodverse-challenge"
              className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2"
            >
              <Laptop className="w-4 h-4" />
              <span>The Foodverse Challenge (Online)</span>
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================================
          PART 2 — TRUST & STRUCTURE STRIP
      ========================================================================= */}
      <div className="bg-white border-b border-[#E7E2DA] py-4 shadow-xs sticky top-16 sm:top-20 z-20">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-[#1FB5A0] shrink-0" />
            <div>
              <div className="font-bold text-stone-900">Individual or Team</div>
              <div className="text-stone-500 text-[11px]">Solo & collaborative tracks</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#1FB5A0] shrink-0" />
            <div>
              <div className="font-bold text-stone-900">100% Free Participation</div>
              <div className="text-stone-500 text-[11px]">No compulsory purchases</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Award className="w-4 h-4 text-[#FF6B4A] shrink-0" />
            <div>
              <div className="font-bold text-stone-900">Official Recognition</div>
              <div className="text-stone-500 text-[11px]">Verified digital certificates</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#FFC84A] shrink-0" />
            <div>
              <div className="font-bold text-stone-900">Public Showcase</div>
              <div className="text-stone-500 text-[11px]">Featured on Menu Maps</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 md:px-8 pt-12 space-y-20">
        {/* =========================================================================
            PART 3 — TWO COMPETITION VISUAL CARDS
        ========================================================================= */}
        <section className="space-y-6">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-[11px] font-black uppercase text-[#1FB5A0] tracking-wider">
              Choose Your Challenge
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900">
              Two Ways to Make Your Mark
            </h2>
            <p className="text-xs sm:text-sm text-stone-500">
              Select the competition that best fits your style: real-world street exploration or online digital innovation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1: GMM */}
            {gmmComp && (
              <div className="bg-white rounded-3xl border border-[#E7E2DA] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
                <div className="relative h-48 sm:h-56 overflow-hidden">
                  <img
                    src={gmmComp.cover_image}
                    alt={gmmComp.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#FF6B4A] text-white text-[10px] font-black uppercase tracking-wider">
                      Offline Exploration
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold">
                      {gmmComp.duration_text || `${gmmComp.duration_days} Days`}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-xl sm:text-2xl font-black leading-tight">{gmmComp.title}</h3>
                    <p className="text-xs text-amber-300 font-bold mt-1">&ldquo;{gmmComp.tagline}&rdquo;</p>
                  </div>
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {gmmComp.description}
                  </p>

                  <div className="space-y-3 pt-2 border-t border-stone-100">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-stone-50">
                        <span className="text-stone-400 block text-[10px] font-bold uppercase">Format</span>
                        <span className="font-bold text-stone-800">{gmmComp.participation_type}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-stone-50">
                        <span className="text-stone-400 block text-[10px] font-bold uppercase">Requirements</span>
                        <span className="font-bold text-stone-800">No coding • No purchase</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => setSelectedCompForJoin(gmmComp)}
                        className="flex-1 py-3 rounded-full bg-[#1FB5A0] hover:bg-[#199d8b] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <Trophy className="w-4 h-4" />
                        <span>Join This Challenge</span>
                      </button>
                      <a
                        href="#the-great-market-mission"
                        className="px-4 py-3 rounded-full border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-bold transition-colors"
                      >
                        Details
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Card 2: Foodverse */}
            {foodverseComp && (
              <div className="bg-white rounded-3xl border border-[#E7E2DA] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
                <div className="relative h-48 sm:h-56 overflow-hidden">
                  <img
                    src={foodverseComp.cover_image}
                    alt={foodverseComp.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#1FB5A0] text-white text-[10px] font-black uppercase tracking-wider">
                      Online Creative Challenge
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold">
                      {foodverseComp.duration_text || `${foodverseComp.duration_days} Days`}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-xl sm:text-2xl font-black leading-tight">{foodverseComp.title}</h3>
                    <p className="text-xs text-teal-300 font-bold mt-1">&ldquo;{foodverseComp.tagline}&rdquo;</p>
                  </div>
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {foodverseComp.description}
                  </p>

                  <div className="space-y-3 pt-2 border-t border-stone-100">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-stone-50">
                        <span className="text-stone-400 block text-[10px] font-bold uppercase">Format</span>
                        <span className="font-bold text-stone-800">{foodverseComp.participation_type}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-stone-50">
                        <span className="text-stone-400 block text-[10px] font-bold uppercase">Tracks</span>
                        <span className="font-bold text-stone-800">5 Challenge Tracks</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => setSelectedCompForJoin(foodverseComp)}
                        className="flex-1 py-3 rounded-full bg-[#1FB5A0] hover:bg-[#199d8b] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <Trophy className="w-4 h-4" />
                        <span>Join This Challenge</span>
                      </button>
                      <a
                        href="#the-foodverse-challenge"
                        className="px-4 py-3 rounded-full border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-bold transition-colors"
                      >
                        Details
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* =========================================================================
            PART 4 — COMPETITION ONE: THE GREAT MARKET MISSION
        ========================================================================= */}
        {gmmComp && (
          <section id="the-great-market-mission" className="scroll-mt-24 space-y-8">
            <div className="bg-white rounded-3xl border border-[#E7E2DA] overflow-hidden shadow-xs">
              {/* Competition Banner */}
              <div className="p-6 sm:p-10 border-b border-[#E7E2DA] bg-gradient-to-r from-amber-500/10 via-white to-white flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#FF6B4A] text-white text-[11px] font-black uppercase tracking-wider">
                      Competition 01
                    </span>
                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-black uppercase">
                      Offline Exploration
                    </span>
                    <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-[11px] font-bold">
                      {gmmComp.duration_text || '10 Days'}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-black text-stone-900 leading-tight">
                    {gmmComp.title}
                  </h2>

                  <p className="text-sm sm:text-base font-bold text-[#FF6B4A]">
                    Tagline: {gmmComp.tagline}
                  </p>

                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {gmmComp.introduction}
                  </p>

                  {/* Metadata Chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px]">
                    <div className="p-2 rounded-xl bg-stone-50">
                      <span className="text-stone-400 block font-bold uppercase text-[9px]">Participation</span>
                      <span className="font-bold text-stone-800">{gmmComp.participation_type}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-stone-50">
                      <span className="text-stone-400 block font-bold uppercase text-[9px]">Difficulty</span>
                      <span className="font-bold text-stone-800">{gmmComp.difficulty || 'Beginner-friendly'}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-stone-50">
                      <span className="text-stone-400 block font-bold uppercase text-[9px]">Purchase</span>
                      <span className="font-bold text-stone-800">No compulsory purchase</span>
                    </div>
                    <div className="p-2 rounded-xl bg-stone-50">
                      <span className="text-stone-400 block font-bold uppercase text-[9px]">Coding</span>
                      <span className="font-bold text-stone-800">None required</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col gap-2">
                  <button
                    onClick={() => setSelectedCompForJoin(gmmComp)}
                    className="px-6 py-3 rounded-full bg-[#1FB5A0] hover:bg-[#199d8b] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Trophy className="w-4 h-4" />
                    <span>Join The Great Market Mission</span>
                  </button>
                  <span className="text-[11px] text-stone-400 text-center">
                    Deadline: {new Date(gmmComp.submission_deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* 4 Mission Cards */}
              <div className="p-6 sm:p-10 space-y-8">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#1FB5A0] mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>2.2 Your Four Missions (100 Points Total)</span>
                  </div>
                  <h3 className="text-xl font-black text-stone-900">
                    Turn An Ordinary Market Visit Into An Honest Discovery
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 max-w-2xl">
                    Choose an accessible local market (e.g. Kamla Nagar, CR Park, Chandni Chowk, Lajpat Nagar, Karol Bagh, CP). Complete these four core missions.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Mission 01 */}
                  <div className="p-6 rounded-3xl bg-[#FAFAF7] border border-[#E7E2DA] space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase">
                          20 POINTS
                        </span>
                        <span className="text-xs font-bold text-stone-400">Mission 01</span>
                      </div>
                      <h4 className="text-base font-black text-stone-900">MISSION 01 — HIDDEN GEM</h4>
                      <p className="text-xs text-stone-600 leading-relaxed font-medium">
                        Find two interesting food outlets in your selected market.
                      </p>
                      <div className="pt-2">
                        <span className="text-[11px] font-bold text-stone-700 block mb-1">Explain for each outlet:</span>
                        <ul className="space-y-1 text-xs text-stone-600">
                          <li className="flex items-start gap-1.5">• Name and location</li>
                          <li className="flex items-start gap-1.5">• What makes it interesting</li>
                          <li className="flex items-start gap-1.5">• What food it is known for</li>
                          <li className="flex items-start gap-1.5">• Why someone should discover it</li>
                          <li className="flex items-start gap-1.5">• Photographs or supporting evidence where possible</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Mission 02 */}
                  <div className="p-6 rounded-3xl bg-[#FAFAF7] border border-[#E7E2DA] space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full bg-teal-100 text-teal-900 text-xs font-black uppercase">
                          25 POINTS
                        </span>
                        <span className="text-xs font-bold text-stone-400">Mission 02</span>
                      </div>
                      <h4 className="text-base font-black text-stone-900">MISSION 02 — MENU DETECTIVE</h4>
                      <p className="text-xs text-stone-600 leading-relaxed font-medium">
                        Explore the menus of at least three interesting dishes.
                      </p>
                      <div className="pt-2">
                        <span className="text-[11px] font-bold text-stone-700 block mb-1">Submit:</span>
                        <ul className="space-y-1 text-xs text-stone-600">
                          <li className="flex items-start gap-1.5">• Dish name and outlet name</li>
                          <li className="flex items-start gap-1.5">• Available price & photo evidence</li>
                          <li className="flex items-start gap-1.5">• Short explanation of why the dish is worth trying</li>
                          <li className="flex items-start gap-1.5">• Price accuracy: identify if observed on displayed menu, confirmed by outlet, unverified, or estimated</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Mission 03 */}
                  <div className="p-6 rounded-3xl bg-[#FAFAF7] border border-[#E7E2DA] space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black uppercase">
                          25 POINTS
                        </span>
                        <span className="text-xs font-bold text-stone-400">Mission 03</span>
                      </div>
                      <h4 className="text-base font-black text-stone-900">MISSION 03 — BUDGET BATTLE</h4>
                      <p className="text-xs text-stone-600 leading-relaxed font-medium">
                        Create a practical food experience within ₹200.
                      </p>
                      <div className="pt-2">
                        <span className="text-[11px] font-bold text-stone-700 block mb-1">Include:</span>
                        <ul className="space-y-1 text-xs text-stone-600">
                          <li className="flex items-start gap-1.5">• Food items and outlet names</li>
                          <li className="flex items-start gap-1.5">• Available prices & total estimated cost (within ₹200)</li>
                          <li className="flex items-start gap-1.5">• Why you selected these items</li>
                          <li className="flex items-start gap-1.5 text-stone-500 italic">* You do not have to purchase the food. Research and evidence are sufficient.</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Mission 04 */}
                  <div className="p-6 rounded-3xl bg-[#FAFAF7] border border-[#E7E2DA] space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-900 text-xs font-black uppercase">
                          30 POINTS
                        </span>
                        <span className="text-xs font-bold text-stone-400">Mission 04</span>
                      </div>
                      <h4 className="text-base font-black text-stone-900">MISSION 04 — MARKET MAP</h4>
                      <p className="text-xs text-stone-600 leading-relaxed font-medium">
                        Create a useful visual food map of your selected market.
                      </p>
                      <div className="pt-2">
                        <span className="text-[11px] font-bold text-stone-700 block mb-1">Include:</span>
                        <ul className="space-y-1 text-xs text-stone-600">
                          <li className="flex items-start gap-1.5">• Important food outlets and locations</li>
                          <li className="flex items-start gap-1.5">• Interesting dishes and available prices</li>
                          <li className="flex items-start gap-1.5">• Short descriptions and suggested exploration route</li>
                          <li className="flex items-start gap-1.5">• Create map with design tools (Canva, Figma, Google My Maps, or digital sketch)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submission Checklist & Evaluation Table */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-[#E7E2DA]">
                  {/* Checklist */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase text-stone-500 tracking-wider">
                      2.3 What to Submit (Checklist)
                    </h4>
                    <div className="p-5 rounded-2xl bg-[#FAFAF7] border border-[#E7E2DA] space-y-2 text-xs">
                      {[
                        '1. Selected market name and location',
                        '2. Two hidden food discoveries',
                        '3. At least three interesting dishes',
                        '4. Menu/price evidence',
                        '5. ₹200 budget experience',
                        '6. Visual market map',
                        '7. Supporting photographs',
                        '8. Short explanation of the overall exploration',
                        'Optional: A short video documenting the exploration',
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#1FB5A0] shrink-0" />
                          <span className="text-stone-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Evaluation Rubric */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase text-stone-500 tracking-wider">
                      2.4 How Winners Are Evaluated (100 Points)
                    </h4>
                    <div className="p-5 rounded-2xl bg-white border border-[#E7E2DA] space-y-2 text-xs">
                      <div className="flex items-center justify-between py-1 border-b border-stone-100">
                        <span className="text-stone-700 font-medium">Discovery quality</span>
                        <span className="font-black text-stone-900">20 pts</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-stone-100">
                        <span className="text-stone-700 font-medium">Menu research and evidence</span>
                        <span className="font-black text-stone-900">25 pts</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-stone-100">
                        <span className="text-stone-700 font-medium">Budget creativity</span>
                        <span className="font-black text-stone-900">25 pts</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-stone-100">
                        <span className="text-stone-700 font-medium">Market map quality</span>
                        <span className="font-black text-stone-900">20 pts</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-stone-100">
                        <span className="text-stone-700 font-medium">Presentation & clarity</span>
                        <span className="font-black text-stone-900">10 pts</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 font-black text-stone-900 text-sm">
                        <span>Total Evaluation</span>
                        <span className="text-[#1FB5A0]">100 Points</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Important Participation Guidelines */}
                <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2 text-xs">
                  <h4 className="font-bold text-amber-900 text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>2.5 Important Participation Guidelines</span>
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-700 pt-1">
                    <li className="flex items-start gap-1.5">• Choose a market you can safely access.</li>
                    <li className="flex items-start gap-1.5">• No compulsory purchase required.</li>
                    <li className="flex items-start gap-1.5">• Respect shop owners, customers and local rules.</li>
                    <li className="flex items-start gap-1.5">• Ask permission before photographing people or private interiors.</li>
                    <li className="flex items-start gap-1.5">• Do not enter restricted areas.</li>
                    <li className="flex items-start gap-1.5">• Do not collect personal information.</li>
                    <li className="flex items-start gap-1.5">• Do not publish misleading prices or false information.</li>
                    <li className="flex items-start gap-1.5">• Team members should participate responsibly.</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =========================================================================
            PART 5 — COMPETITION TWO: THE FOODVERSE CHALLENGE
        ========================================================================= */}
        {foodverseComp && (
          <section id="the-foodverse-challenge" className="scroll-mt-24 space-y-8">
            <div className="bg-white rounded-3xl border border-[#E7E2DA] overflow-hidden shadow-xs">
              {/* Competition Banner */}
              <div className="p-6 sm:p-10 border-b border-[#E7E2DA] bg-gradient-to-r from-teal-500/10 via-white to-white flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#1FB5A0] text-white text-[11px] font-black uppercase tracking-wider">
                      Competition 02
                    </span>
                    <span className="px-3 py-1 rounded-full bg-teal-100 text-teal-900 text-[11px] font-black uppercase">
                      Online Creative Challenge
                    </span>
                    <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-[11px] font-bold">
                      {foodverseComp.duration_text || '12–14 Days'}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-black text-stone-900 leading-tight">
                    {foodverseComp.title}
                  </h2>

                  <p className="text-sm sm:text-base font-bold text-[#1FB5A0]">
                    Tagline: {foodverseComp.tagline}
                  </p>

                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {foodverseComp.introduction}
                  </p>

                  {/* Metadata Chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px]">
                    <div className="p-2 rounded-xl bg-stone-50">
                      <span className="text-stone-400 block font-bold uppercase text-[9px]">Participation</span>
                      <span className="font-bold text-stone-800">{foodverseComp.participation_type}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-stone-50">
                      <span className="text-stone-400 block font-bold uppercase text-[9px]">Difficulty</span>
                      <span className="font-bold text-stone-800">{foodverseComp.difficulty || 'Open to beginners'}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-stone-50">
                      <span className="text-stone-400 block font-bold uppercase text-[9px]">Coding</span>
                      <span className="font-bold text-stone-800">Not compulsory</span>
                    </div>
                    <div className="p-2 rounded-xl bg-stone-50">
                      <span className="text-stone-400 block font-bold uppercase text-[9px]">Paid Tools</span>
                      <span className="font-bold text-stone-800">Not compulsory</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col gap-2">
                  <button
                    onClick={() => setSelectedCompForJoin(foodverseComp)}
                    className="px-6 py-3 rounded-full bg-[#1FB5A0] hover:bg-[#199d8b] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Trophy className="w-4 h-4" />
                    <span>Join The Foodverse Challenge</span>
                  </button>
                  <span className="text-[11px] text-stone-400 text-center">
                    Deadline: {new Date(foodverseComp.submission_deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* 5 Challenge Tracks */}
              <div className="p-6 sm:p-10 space-y-8">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#1FB5A0] mb-1">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>3.2 Choose Your Challenge (Pick 1 of 5 Tracks)</span>
                  </div>
                  <h3 className="text-xl font-black text-stone-900">
                    5 Challenge Tracks Built for Practical Food Discovery
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 max-w-2xl">
                    Select any one track. You do not need to be a programmer — Figma mockups, Canva presentations, or research decks are fully welcomed.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(foodverseComp?.tracks || []).map((rawTrack: any, idx: number) => {
                    const track = typeof rawTrack === 'string'
                      ? {
                          id: `track_${idx + 1}`,
                          track_number: idx + 1,
                          title: rawTrack,
                          description: 'Design a practical and creative food exploration experience for this challenge.',
                          ideas: ['Budget food finder', 'Map discovery concept', 'Recommendation interface'],
                          enabled: true,
                        }
                      : {
                          ...rawTrack,
                          id: rawTrack.id || `track_${idx + 1}`,
                          title: rawTrack.title || `Track 0${idx + 1}`,
                          description: rawTrack.description || 'Design a practical food exploration solution.',
                          ideas: Array.isArray(rawTrack.ideas) ? rawTrack.ideas : [],
                        };

                    return (
                    <div
                      key={track.id}
                      className="p-5 rounded-3xl bg-[#FAFAF7] border border-[#E7E2DA] space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="w-6 h-6 rounded-full bg-[#1FB5A0] text-white flex items-center justify-center font-bold text-xs">
                            {idx + 1}
                          </span>
                          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                            Track {idx + 1}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-stone-900 leading-snug">{track.title}</h4>
                        <p className="text-xs text-stone-600 leading-relaxed font-medium">
                          {track.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-stone-200/60">
                        <span className="text-[10px] font-bold text-stone-500 uppercase block mb-1">
                          Possible Ideas:
                        </span>
                        <ul className="space-y-1 text-[11px] text-stone-600">
                          {(Array.isArray(track.ideas) ? track.ideas : []).map((idea: string, i: number) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <span className="text-[#1FB5A0] font-bold">•</span>
                              <span>{idea}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    );
                  })}
                </div>

                {/* What Can You Create & Deliverables */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-[#E7E2DA]">
                  {/* Creative formats */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase text-stone-500 tracking-wider">
                      3.3 What Can You Create?
                    </h4>
                    <div className="p-5 rounded-2xl bg-[#FAFAF7] border border-[#E7E2DA] space-y-2 text-xs">
                      <p className="text-stone-600 leading-relaxed mb-2 font-medium">
                        Submit any suitable creative solution using free tools (Figma, Canva, Google Docs, Loom):
                      </p>
                      {[
                        'UI/UX design or wireframes',
                        'Website or mobile app concept',
                        'Clickable interactive prototype',
                        'Digital food map or exploration radar',
                        'Interactive student experience',
                        'Research-backed proposal deck',
                        'Short product demonstration',
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#1FB5A0] shrink-0" />
                          <span className="text-stone-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 10-Point Submission Checklist */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase text-stone-500 tracking-wider">
                      3.4 What to Submit (Checklist)
                    </h4>
                    <div className="p-5 rounded-2xl bg-white border border-[#E7E2DA] space-y-1.5 text-xs">
                      {[
                        '1. Project title & selected track',
                        '2. Problem being solved & intended users',
                        '3. Proposed solution & main features',
                        '4. Design, prototype or concept link',
                        '5. Explanation of how it works',
                        '6. Why the idea is useful & practical',
                        '7. Supporting research or references',
                        'Optional: 2-minute demonstration video',
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span className="text-stone-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Scoring Table */}
                <div className="space-y-3 pt-6 border-t border-[#E7E2DA]">
                  <h4 className="text-xs font-black uppercase text-stone-500 tracking-wider">
                    3.5 Judging Criteria (100 Points Total)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                    <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                      <div className="flex justify-between font-black text-stone-900">
                        <span>Problem & Research</span>
                        <span className="text-[#1FB5A0]">20 pts</span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-1">Understanding user pain points and genuine context.</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                      <div className="flex justify-between font-black text-stone-900">
                        <span>Innovation & Originality</span>
                        <span className="text-[#1FB5A0]">20 pts</span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-1">Fresh perspective beyond conventional delivery apps.</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                      <div className="flex justify-between font-black text-stone-900">
                        <span>Usefulness & Usability</span>
                        <span className="text-[#1FB5A0]">20 pts</span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-1">Practical value and intuitive navigation for real diners.</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                      <div className="flex justify-between font-black text-stone-900">
                        <span>Creativity & Design</span>
                        <span className="text-[#1FB5A0]">20 pts</span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-1">Visual appeal, clear layouts, and presentation flair.</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                      <div className="flex justify-between font-black text-stone-900">
                        <span>Presentation Quality</span>
                        <span className="text-[#1FB5A0]">10 pts</span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-1">Clarity of demo deck, prototype walkthrough, or video.</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                      <div className="flex justify-between font-black text-stone-900">
                        <span>Completeness & Feasibility</span>
                        <span className="text-[#1FB5A0]">10 pts</span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-1">Realistic execution and logical feature flow.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =========================================================================
            PART 6 — HOW STUDENTS PARTICIPATE (3-STEP WORKFLOW)
        ========================================================================= */}
        <section className="bg-white rounded-3xl border border-[#E7E2DA] p-8 sm:p-12 space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-[11px] font-black uppercase text-[#1FB5A0] tracking-wider">
              Step-by-Step
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900">
              How Participation Works
            </h2>
            <p className="text-xs sm:text-sm text-stone-500">
              Three simple steps from discovery to official portfolio credits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#FAFAF7] border border-[#E7E2DA] space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-black text-sm">
                01
              </div>
              <h4 className="text-base font-black text-stone-900">Choose Your Challenge</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Explore the two competitions: The Great Market Mission (offline market exploration) or The Foodverse Challenge (online creative challenge). Select the one you want to participate in.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAFAF7] border border-[#E7E2DA] space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 text-[#1FB5A0] flex items-center justify-center font-black text-sm">
                02
              </div>
              <h4 className="text-base font-black text-stone-900">Register in Seconds</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Log in or create your student account. Choose Individual or Team participation. For teams, a team leader manages registration and invites collaborators.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAFAF7] border border-[#E7E2DA] space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-black text-sm">
                03
              </div>
              <h4 className="text-base font-black text-stone-900">Create & Submit</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Complete the assigned missions or challenge tracks. Submit deliverables through your Student Dashboard before the deadline. Track evaluation status and view score feedback in real-time.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            PART 7 — JUDGING AND RECOGNITION
        ========================================================================= */}
        <section className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white rounded-3xl p-8 sm:p-12 space-y-8">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[11px] font-black uppercase text-[#FFC84A] tracking-wider">
              Transparency & Fairness
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Judging and Contributor Recognition
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              We believe in rewarding genuine curiosity, rigorous research, and creative problem-solving without making empty promises. Student submissions remain their original intellectual work.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <Award className="w-6 h-6 text-[#FFC84A]" />
              <h4 className="font-bold text-white text-sm">Digital Certificates</h4>
              <p className="text-stone-400 text-[11px] leading-relaxed">
                Verified digital participation certificates for all qualifying submissions; specialized winner certificates for podium placements.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <Sparkles className="w-6 h-6 text-[#1FB5A0]" />
              <h4 className="font-bold text-white text-sm">Public Showcase</h4>
              <p className="text-stone-400 text-[11px] leading-relaxed">
                Featured publication on the official Menu Maps Discovery ecosystem with permanent student byline and contributor attribution.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <Trophy className="w-6 h-6 text-[#FF6B4A]" />
              <h4 className="font-bold text-white text-sm">Portfolio Badges</h4>
              <p className="text-stone-400 text-[11px] leading-relaxed">
                Earn verifiable portfolio badges and point milestones visible in your student creator profile.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <FileText className="w-6 h-6 text-emerald-400" />
              <h4 className="font-bold text-white text-sm">Jury Feedback</h4>
              <p className="text-stone-400 text-[11px] leading-relaxed">
                Detailed 100-point rubric breakdown and constructive feedback from our food exploration and design reviewers.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            PART 8 — FREQUENTLY ASKED QUESTIONS (10 FAQS)
        ========================================================================= */}
        <section className="bg-white rounded-3xl border border-[#E7E2DA] p-8 sm:p-12 space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-[11px] font-black uppercase text-[#1FB5A0] tracking-wider">
              Answers & Guidelines
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-stone-500">
              Everything you need to know about eligibility, teamwork, scoring, and recognition.
            </p>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-[#E7E2DA] overflow-hidden transition-all bg-[#FAFAF7]"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-stone-900 hover:text-[#1FB5A0] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#1FB5A0] shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-stone-600 leading-relaxed border-t border-stone-200/60 pt-3 bg-white">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            PART 9 — FINAL JOIN CTA BANNER
        ========================================================================= */}
        <section className="rounded-3xl bg-gradient-to-r from-teal-900 via-[#1FB5A0] to-teal-800 text-white p-8 sm:p-12 text-center space-y-6 shadow-md">
          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-black">
              Ready to Make Your Mark?
            </h2>
            <p className="text-xs sm:text-sm text-teal-100">
              Join students across universities exploring local food markets and imagining the future of food discovery.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            {gmmComp && (
              <button
                onClick={() => setSelectedCompForJoin(gmmComp)}
                className="px-6 py-3 rounded-full bg-white text-stone-900 hover:bg-stone-100 text-xs sm:text-sm font-bold shadow-md cursor-pointer transition-all flex items-center gap-2"
              >
                <Trophy className="w-4 h-4 text-[#FF6B4A]" />
                <span>Join The Great Market Mission</span>
              </button>
            )}

            {foodverseComp && (
              <button
                onClick={() => setSelectedCompForJoin(foodverseComp)}
                className="px-6 py-3 rounded-full bg-stone-900/60 hover:bg-stone-900 text-white border border-white/20 text-xs sm:text-sm font-bold shadow-md cursor-pointer transition-all flex items-center gap-2"
              >
                <Laptop className="w-4 h-4 text-[#1FB5A0]" />
                <span>Join The Foodverse Challenge</span>
              </button>
            )}

            {isAuthenticated && (
              <button
                onClick={() => navigate('/student-dashboard?tab=competitions')}
                className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer"
              >
                Go to Student Dashboard →
              </button>
            )}
          </div>
        </section>
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
