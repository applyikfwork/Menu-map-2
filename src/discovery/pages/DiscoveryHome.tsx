/**
 * Menu Maps Discovery - Master Homepage (/discovery)
 * 9-Section comprehensive discovery hub connecting food discoveries, student creations,
 * live competitions, neighbourhood trails, contributors, and the Hall of Fame.
 */

import React, { useState, useEffect } from 'react';
import {
  Compass,
  Trophy,
  Sparkles,
  MapPin,
  Users,
  Award,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  Utensils,
  ExternalLink,
  ChevronRight,
  UserPlus,
} from 'lucide-react';
import { discoveryApi } from '../lib/discoveryApi';
import {
  DiscoveryCompetition,
  FoodDiscoveryItem,
  StudentFoodTrail,
  StudentProject,
  StudentProfile,
  HallOfFameEntry,
} from '../types/discovery';
import { DiscoveryNavbar } from '../components/DiscoveryNavbar';
import { CompetitionCard } from '../components/CompetitionCard';
import { FoodDiscoveryCard } from '../components/FoodDiscoveryCard';
import { StudentProjectCard } from '../components/StudentProjectCard';
import { FoodTrailCard } from '../components/FoodTrailCard';
import { ContributorCard } from '../components/ContributorCard';
import { StudentAuth } from './StudentAuth';
import { useStudentAuth } from '../context/StudentAuthContext';

interface DiscoveryHomeProps {
  navigate: (path: string) => void;
}

export const DiscoveryHome: React.FC<DiscoveryHomeProps> = ({ navigate }) => {
  const { student, isAuthenticated } = useStudentAuth();

  // Real Database States
  const [loading, setLoading] = useState(true);
  const [competitions, setCompetitions] = useState<DiscoveryCompetition[]>([]);
  const [foodDiscoveries, setFoodDiscoveries] = useState<FoodDiscoveryItem[]>([]);
  const [studentProjects, setStudentProjects] = useState<StudentProject[]>([]);
  const [foodTrails, setFoodTrails] = useState<StudentFoodTrail[]>([]);
  const [contributors, setContributors] = useState<StudentProfile[]>([]);
  const [hallOfFame, setHallOfFame] = useState<HallOfFameEntry[]>([]);

  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    loadDiscoveryData();
  }, []);

  const loadDiscoveryData = async () => {
    setLoading(true);
    try {
      const [comps, discs, projs, trails, conts, hof] = await Promise.all([
        discoveryApi.getCompetitions(true),
        discoveryApi.getApprovedFoodDiscoveries(),
        discoveryApi.getStudentProjects(),
        discoveryApi.getFoodTrails(true),
        discoveryApi.getPublicContributors(),
        discoveryApi.getHallOfFameEntries(),
      ]);

      setCompetitions(comps);
      setFoodDiscoveries(discs);
      setStudentProjects(projs);
      setFoodTrails(trails);
      setContributors(conts);
      setHallOfFame(hof);
    } catch (e) {
      console.error('Error loading discovery data', e);
    } finally {
      setLoading(false);
    }
  };

  const openAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthInitialMode(mode);
    setAuthModalOpen(true);
  };

  const scrollToDiscoveries = () => {
    const el = document.getElementById('featured-discoveries');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917]">
      {/* Sub-Navigation */}
      <DiscoveryNavbar
        currentPath="/discovery"
        navigate={navigate}
        onOpenAuth={openAuth}
      />

      {/* ========================================================
          SECTION 1: HERO
      ======================================================== */}
      <section className="relative overflow-hidden pt-10 sm:pt-16 pb-14 sm:pb-20 border-b border-[#E7E2DA] bg-gradient-to-b from-white via-[#FAF8F5] to-[#FAF8F5]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-[#0F766E] text-xs font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Menu Maps Student & Community Discovery</span>
              </div>

              <h1 className="hd text-3xl sm:text-5xl lg:text-6xl font-black text-[#1C1917] tracking-tight leading-[1.12]">
                Every place has a story. <br className="hidden sm:inline" />
                <span className="text-[#0F766E]">Every discovery matters.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#57534E] leading-relaxed max-w-xl mx-auto lg:mx-0">
                Explore hidden food places, take on creative challenges, build something interesting and share your discoveries with the Menu Maps community.
              </p>

              {/* Primary Actions */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <button
                  onClick={scrollToDiscoveries}
                  className="btn bg-[#0F766E] hover:bg-[#0D9488] text-white min-h-[48px] px-6 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-emerald-300" />
                  <span>Explore Discoveries</span>
                </button>

                <button
                  onClick={() => navigate('/discovery/competitions')}
                  className="btn bg-white hover:bg-stone-50 border border-[#E7E2DA] text-[#1C1917] min-h-[48px] px-6 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
                >
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>Join a Competition</span>
                </button>

                <button
                  onClick={() => {
                    if (isAuthenticated) navigate('/discovery/dashboard');
                    else openAuth('register');
                  }}
                  className="btn bg-[#FAF8F5] hover:bg-orange-50 border border-orange-200 text-[#D8350F] min-h-[48px] px-5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Become a Contributor</span>
                </button>
              </div>

              {/* Credibility metric pills */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs text-stone-500 font-semibold">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-[#E7E2DA]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E]" />
                  100% Genuine Evidence Review
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-[#E7E2DA]">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF5A36]" />
                  Verifiable Student Portfolios
                </span>
              </div>
            </div>

            {/* Right Visual: Indian Neighbourhood Discovery Canvas */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-[36px] bg-gradient-to-br from-amber-500/10 via-teal-500/10 to-orange-500/10 p-4 sm:p-6 border border-[#E7E2DA] shadow-lg">
                <div className="aspect-4/3 rounded-3xl overflow-hidden bg-stone-900 relative shadow-inner">
                  <img
                    src="https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=900&q=80"
                    alt="Delhi Neighbourhood Exploration"
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Overlaid Floating Discovery Cards */}
                  <div className="absolute bottom-4 left-4 right-4 space-y-2">
                    <div className="p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-white/20 text-[#1C1917] shadow-lg flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#0F766E] text-white flex items-center justify-center text-lg shrink-0">
                        🗺️
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#0F766E] block">
                          Community Trail Discovery
                        </span>
                        <h4 className="font-bold text-xs truncate">Chache Di Hatti & Kamla Nagar Trail</h4>
                        <span className="text-[11px] text-stone-500">Documented by DU Explorers</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-white text-[11px] flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Verification Standard: Counter Verified
                      </span>
                      <span className="text-amber-300 font-extrabold">0% Delivery Markups</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 2: DISCOVERY OVERVIEW (6 VISUAL CARDS)
      ======================================================== */}
      <section className="py-12 sm:py-16 border-b border-[#E7E2DA]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#0F766E]">
              The Ecosystem
            </span>
            <h2 className="hd text-2xl sm:text-4xl font-black text-[#1C1917]">
              Explore What Discovery Offers
            </h2>
            <p className="text-xs sm:text-sm text-stone-500">
              Pick your pathway to discover, create, submit, or get recognized across Delhi NCR.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                title: 'Food Discoveries',
                desc: 'Uncover hidden street gems, hole-in-the-wall cafes, and authentic counter rates.',
                icon: '📍',
                tag: 'Community Intel',
                path: '/discovery/food-discoveries',
                color: 'from-teal-500/10 to-emerald-500/5',
              },
              {
                title: 'Market Missions',
                desc: 'Field challenges in Chandni Chowk, Majnu Ka Tila, Hudson Lane, and CR Park.',
                icon: '🧭',
                tag: 'Field Quests',
                path: '/discovery/competitions?category=offline',
                color: 'from-orange-500/10 to-amber-500/5',
              },
              {
                title: 'Creative Challenges',
                desc: 'Compete in UI/UX app design, food mapping, poster making, and research.',
                icon: '🎨',
                tag: 'Competitions',
                path: '/discovery/competitions',
                color: 'from-pink-500/10 to-rose-500/5',
              },
              {
                title: 'Student Food Trails',
                desc: 'Curated walking routes with recommended dishes, stops, and exact budgets.',
                icon: '🗺️',
                tag: 'Curated Trails',
                path: '/discovery/trails',
                color: 'from-blue-500/10 to-cyan-500/5',
              },
              {
                title: 'Student Creations',
                desc: 'Browse approved student prototypes, interactive maps, and design decks.',
                icon: '✨',
                tag: 'Public Gallery',
                path: '/discovery/creations',
                color: 'from-purple-500/10 to-indigo-500/5',
              },
              {
                title: 'Hall of Fame',
                desc: 'Honour roll of challenge champions, jury picks, and top community contributors.',
                icon: '🏆',
                tag: 'Recognition',
                path: '/discovery/hall-of-fame',
                color: 'from-amber-500/10 to-yellow-500/5',
              },
            ].map((card) => (
              <div
                key={card.title}
                onClick={() => navigate(card.path)}
                className={`p-6 sm:p-7 rounded-[28px] border border-[#E7E2DA] bg-gradient-to-br ${card.color} bg-white hover:border-[#0F766E] shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl p-2 rounded-2xl bg-white border border-[#E7E2DA] shadow-2xs">
                      {card.icon}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white text-[10px] font-black uppercase tracking-wider text-stone-600 border border-[#E7E2DA]">
                      {card.tag}
                    </span>
                  </div>

                  <h3 className="hd text-lg font-bold text-[#1C1917] group-hover:text-[#0F766E] transition-colors leading-snug">
                    {card.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed mt-2">
                    {card.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-200/50 flex items-center justify-between text-xs font-extrabold text-[#0F766E]">
                  <span>Explore Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          FLAGSHIP SECTION: MENU MAPS DISCOVERY LEAGUE — SEASON 01
      ======================================================== */}
      <section className="py-12 sm:py-16 border-b border-[#E7E2DA] bg-gradient-to-b from-stone-50/50 via-white to-stone-50/50">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
                <Trophy className="w-3.5 h-3.5 text-amber-600" />
                <span>Flagship Series</span>
              </div>
              <h2 className="hd text-2xl sm:text-4xl font-black text-[#1C1917] tracking-tight">
                MENU MAPS DISCOVERY LEAGUE — SEASON 01
              </h2>
              <p className="text-xs sm:text-sm text-[#FF5A36] font-semibold mt-1">
                "Two challenges. Two different experiences. One opportunity to discover, create and get recognised."
              </p>
            </div>

            <button
              onClick={() => navigate('/discovery/competitions/discovery-league')}
              className="px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:text-[#0F766E] text-xs font-bold shadow-2xs hover:shadow-xs transition-all flex items-center gap-1.5 shrink-0"
            >
              <span>Explore Series Overview</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Two Flagship Competition Cards Side-by-Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* 1. The Great Market Mission */}
            <div className="bg-white rounded-3xl border border-[#E7E2DA] shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="relative h-48 sm:h-56 bg-stone-900 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80"
                    alt="The Great Market Mission"
                    className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#FF5A36] text-white text-[11px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Offline Exploration
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs text-stone-900 text-[11px] font-bold">
                      Teams of 2–3
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-5 right-5 text-white">
                    <p className="text-[11px] uppercase tracking-widest text-amber-300 font-bold">Challenge 01</p>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold">THE GREAT MARKET MISSION</h3>
                    <p className="text-xs text-stone-200 line-clamp-1 italic mt-0.5">
                      "One Market. Hidden Food Stories. Can Your Team Discover Them All?"
                    </p>
                  </div>
                </div>

                <div className="p-5 sm:p-6 space-y-4">
                  <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
                    Explore a real Delhi neighbourhood market. Investigate honest counter pricing, discover two hidden gem stalls, design a ₹200 budget feast, and publish a visual food discovery map.
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/80">
                      <span className="font-bold text-[#0F766E]">4 Field Missions</span>
                      <p className="text-stone-500 text-[11px]">100 Points Total</p>
                    </div>
                    <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/80">
                      <span className="font-bold text-[#0F766E]">Budget Battle</span>
                      <p className="text-stone-500 text-[11px]">Best Feast Under ₹200</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      10 Days Duration
                    </span>
                    <span>•</span>
                    <span>Deadline: June 26, 2026</span>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6 bg-stone-50 border-t border-stone-100 flex items-center gap-3">
                <button
                  onClick={() => navigate('/discovery/competitions/great-market-mission')}
                  className="flex-1 py-2.5 px-4 bg-[#0F766E] text-white font-bold text-xs rounded-xl hover:bg-[#0d635c] transition-colors shadow-2xs text-center"
                >
                  View Details & Rules
                </button>
                <button
                  onClick={() => {
                    if (isAuthenticated) {
                      navigate('/discovery/competitions/great-market-mission');
                    } else {
                      openAuth('register');
                    }
                  }}
                  className="py-2.5 px-4 bg-white border border-stone-200 text-stone-800 font-bold text-xs rounded-xl hover:bg-stone-50 transition-colors"
                >
                  Register Team
                </button>
              </div>
            </div>

            {/* 2. The Foodverse Challenge */}
            <div className="bg-white rounded-3xl border border-[#E7E2DA] shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="relative h-48 sm:h-56 bg-stone-900 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80"
                    alt="The Foodverse Challenge"
                    className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#0F766E] text-white text-[11px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                      <Laptop className="w-3 h-3" /> Online Digital Challenge
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs text-stone-900 text-[11px] font-bold">
                      Individual or Teams (1–4)
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-5 right-5 text-white">
                    <p className="text-[11px] uppercase tracking-widest text-teal-300 font-bold">Challenge 02</p>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold">THE FOODVERSE CHALLENGE</h3>
                    <p className="text-xs text-stone-200 line-clamp-1 italic mt-0.5">
                      "Imagine the Future of Food Discovery. Then Build It."
                    </p>
                  </div>
                </div>

                <div className="p-5 sm:p-6 space-y-4">
                  <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
                    Choose from 5 challenge tracks (₹150 Food Explorer, Veg Hunter, Hidden Delhi, Friends Planner, Best Dish). Build an original clickable prototype, digital map, or app concept.
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/80">
                      <span className="font-bold text-[#FF5A36]">5 Focus Tracks</span>
                      <p className="text-stone-500 text-[11px]">Choose 1 to solve</p>
                    </div>
                    <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/80">
                      <span className="font-bold text-[#FF5A36]">Challenge Drops</span>
                      <p className="text-stone-500 text-[11px]">Days 03, 05, 07 prompts</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      14 Days Duration
                    </span>
                    <span>•</span>
                    <span>Deadline: July 05, 2026</span>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6 bg-stone-50 border-t border-stone-100 flex items-center gap-3">
                <button
                  onClick={() => navigate('/discovery/competitions/foodverse-challenge')}
                  className="flex-1 py-2.5 px-4 bg-[#0F766E] text-white font-bold text-xs rounded-xl hover:bg-[#0d635c] transition-colors shadow-2xs text-center"
                >
                  View Details & Tracks
                </button>
                <button
                  onClick={() => {
                    if (isAuthenticated) {
                      navigate('/discovery/competitions/foodverse-challenge');
                    } else {
                      openAuth('register');
                    }
                  }}
                  className="py-2.5 px-4 bg-white border border-stone-200 text-stone-800 font-bold text-xs rounded-xl hover:bg-stone-50 transition-colors"
                >
                  Register (Free)
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 3: LIVE COMPETITIONS
      ======================================================== */}
      <section className="py-12 sm:py-16 border-b border-[#E7E2DA] bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div className="max-w-2xl">
              <span className="text-xs font-black uppercase tracking-widest text-[#FF5A36]">
                Student Challenges
              </span>
              <h2 className="hd text-2xl sm:text-4xl font-black text-[#1C1917] mt-1">
                Live & Upcoming Competitions
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Real challenges backed by verified rewards, digital certificates, and hall of fame recognition.
              </p>
            </div>

            <button
              onClick={() => navigate('/discovery/competitions')}
              className="text-xs font-bold text-[#0F766E] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All Challenges</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {competitions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {competitions.slice(0, 3).map((comp) => (
                <CompetitionCard
                  key={comp.id}
                  competition={comp}
                  navigate={navigate}
                  onRegisterClick={() => {
                    if (isAuthenticated) {
                      navigate(`/discovery/competitions/${comp.slug}#register`);
                    } else {
                      openAuth('register');
                    }
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="bg-[#FAF8F5] border border-dashed border-[#E7E2DA] rounded-3xl p-10 sm:p-14 text-center space-y-3">
              <Trophy className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="hd text-lg font-bold text-stone-700">
                No active competitions right now
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                New design challenges, food mapping sprints, and neighbourhood exploration missions are coming soon.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================
          SECTION 4: FEATURED FOOD DISCOVERIES
      ======================================================== */}
      <section id="featured-discoveries" className="py-12 sm:py-16 border-b border-[#E7E2DA]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div className="max-w-2xl">
              <span className="text-xs font-black uppercase tracking-widest text-[#0F766E]">
                Ground Verification Standard
              </span>
              <h2 className="hd text-2xl sm:text-4xl font-black text-[#1C1917] mt-1">
                Verified Community Food Discoveries
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Authentic spots discovered by students and community patrons. All verified rates checked at the physical counter.
              </p>
            </div>

            <button
              onClick={() => {
                if (isAuthenticated) navigate('/discovery/dashboard?tab=discoveries');
                else openAuth('login');
              }}
              className="btn bg-[#0F766E] hover:bg-[#0D9488] text-white px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <span>+ Submit a Discovery</span>
            </button>
          </div>

          {foodDiscoveries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {foodDiscoveries.slice(0, 3).map((disc) => (
                <FoodDiscoveryCard key={disc.id} item={disc} navigate={navigate} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-dashed border-[#E7E2DA] rounded-3xl p-10 sm:p-14 text-center space-y-3">
              <MapPin className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="hd text-lg font-bold text-stone-700">
                Discoveries are being verified
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Student submissions are currently undergoing physical counter verification before public listing.
              </p>
              <button
                onClick={() => {
                  if (isAuthenticated) navigate('/discovery/dashboard?tab=discoveries');
                  else openAuth('register');
                }}
                className="btn bg-[#0F766E] text-white px-4 py-2 rounded-xl text-xs font-bold mt-2"
              >
                Submit Your Hidden Gem
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================
          SECTION 5: STUDENT CREATIONS (PUBLIC GALLERY)
      ======================================================== */}
      <section className="py-12 sm:py-16 border-b border-[#E7E2DA] bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div className="max-w-2xl">
              <span className="text-xs font-black uppercase tracking-widest text-[#FF5A36]">
                Student Portfolio Gallery
              </span>
              <h2 className="hd text-2xl sm:text-4xl font-black text-[#1C1917] mt-1">
                Approved Student Creations
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Explore food maps, digital prototypes, app interfaces, and research projects built by students.
              </p>
            </div>

            <button
              onClick={() => navigate('/discovery/creations')}
              className="text-xs font-bold text-[#0F766E] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Explore All Creations</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {studentProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {studentProjects.slice(0, 3).map((proj) => (
                <StudentProjectCard key={proj.id} project={proj} navigate={navigate} />
              ))}
            </div>
          ) : (
            <div className="bg-[#FAF8F5] border border-dashed border-[#E7E2DA] rounded-3xl p-10 sm:p-14 text-center space-y-3">
              <Sparkles className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="hd text-lg font-bold text-stone-700">
                No student creations have been published yet
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Submissions from the current creative challenges will be showcased here once approved by our jury.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================
          SECTION 6: PEOPLE BEHIND MENU MAPS
      ======================================================== */}
      <section className="py-12 sm:py-16 border-b border-[#E7E2DA]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div className="max-w-2xl">
              <span className="text-xs font-black uppercase tracking-widest text-[#0F766E]">
                Community Contributors
              </span>
              <h2 className="hd text-2xl sm:text-4xl font-black text-[#1C1917] mt-1">
                People Behind Menu Maps
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Celebrating genuine students and community explorers who have contributed verified ground data and creative projects.
              </p>
            </div>

            <button
              onClick={() => navigate('/discovery/contributors')}
              className="text-xs font-bold text-[#0F766E] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All Contributors</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {contributors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {contributors.slice(0, 4).map((c) => (
                <ContributorCard key={c.id} profile={c} navigate={navigate} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-dashed border-[#E7E2DA] rounded-3xl p-10 sm:p-14 text-center space-y-3">
              <Users className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="hd text-lg font-bold text-stone-700">
                Contributor showcase is forming
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Verified contributors who opt into public attribution will appear here as their work gets accepted.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================
          SECTION 7: STUDENT FOOD TRAILS
      ======================================================== */}
      <section className="py-12 sm:py-16 border-b border-[#E7E2DA] bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div className="max-w-2xl">
              <span className="text-xs font-black uppercase tracking-widest text-[#FF5A36]">
                Curated Walks & Crawls
              </span>
              <h2 className="hd text-2xl sm:text-4xl font-black text-[#1C1917] mt-1">
                Student Food Trails
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Budget-conscious, walkable food itineraries across Delhi university hubs and heritage bazaars.
              </p>
            </div>

            <button
              onClick={() => navigate('/discovery/trails')}
              className="text-xs font-bold text-[#0F766E] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Explore All Food Trails</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {foodTrails.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {foodTrails.slice(0, 3).map((trail) => (
                <FoodTrailCard key={trail.id} trail={trail} navigate={navigate} />
              ))}
            </div>
          ) : (
            <div className="bg-[#FAF8F5] border border-dashed border-[#E7E2DA] rounded-3xl p-10 sm:p-14 text-center space-y-3">
              <BookOpen className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="hd text-lg font-bold text-stone-700">
                No food trails published yet
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Curated neighbourhood trails submitted by campus explorers will be featured here once reviewed.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================
          SECTION 8: HALL OF FAME
      ======================================================== */}
      <section className="py-12 sm:py-16 border-b border-[#E7E2DA]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div className="max-w-2xl">
              <span className="text-xs font-black uppercase tracking-widest text-[#EAB308]">
                Honour Roll & Awards
              </span>
              <h2 className="hd text-2xl sm:text-4xl font-black text-[#1C1917] mt-1">
                Discovery Hall of Fame
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Official competition champions, jury choice selections, and exemplary student contributors.
              </p>
            </div>

            <button
              onClick={() => navigate('/discovery/hall-of-fame')}
              className="text-xs font-bold text-[#0F766E] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Hall of Fame</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {hallOfFame.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {hallOfFame.slice(0, 3).map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white border border-[#E7E2DA] rounded-3xl p-6 shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">🏆</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-black uppercase tracking-wider">
                        {entry.award_rank}
                      </span>
                    </div>

                    <h4 className="hd text-lg font-bold text-[#1C1917] leading-snug">
                      {entry.winner_name}
                    </h4>

                    {entry.college_name && (
                      <p className="text-xs text-stone-500 font-medium">{entry.college_name}</p>
                    )}

                    <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#E7E2DA] text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                        Project / Entry
                      </span>
                      <strong className="text-stone-800 font-bold block truncate">{entry.project_title}</strong>
                      <span className="text-[11px] text-[#0F766E] font-semibold mt-0.5 block truncate">
                        {entry.competition_title}
                      </span>
                    </div>

                    {entry.citation && (
                      <p className="text-xs text-[#57534E] italic leading-relaxed">
                        &quot;{entry.citation}&quot;
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] text-stone-400">
                    Awarded {new Date(entry.awarded_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-dashed border-[#E7E2DA] rounded-3xl p-10 sm:p-14 text-center space-y-3">
              <Award className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="hd text-lg font-bold text-stone-700">
                Hall of Fame results will be announced after competition juries conclude
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                All awards and citations come directly from official competition results.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================
          SECTION 9: JOIN THE COMMUNITY
      ======================================================== */}
      <section className="py-14 sm:py-20 bg-gradient-to-br from-[#1C1917] via-stone-900 to-black text-white relative overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 text-center relative z-10 space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto text-2xl shadow-inner">
            🧭
          </div>

          <h2 className="hd text-3xl sm:text-5xl font-black tracking-tight max-w-2xl mx-auto leading-tight">
            Build Your Food Tech & Creative Portfolio with Menu Maps
          </h2>

          <p className="text-stone-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Gain verified contribution recognition, earn official digital passport stamps, participate in real challenges, and help make counter rates transparent across Delhi NCR.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                if (isAuthenticated) navigate('/discovery/dashboard');
                else openAuth('register');
              }}
              className="btn bg-[#0F766E] hover:bg-[#0D9488] text-white min-h-[48px] px-8 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              <span>{isAuthenticated ? 'Open My Discovery Dashboard' : 'Register as a Student Contributor'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/discovery/competitions')}
              className="btn bg-white/10 hover:bg-white/15 text-white border border-white/20 min-h-[48px] px-6 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Browse Challenges</span>
            </button>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-stone-400">
            <span>✓ 100% Free & Voluntary</span>
            <span>✓ Real Verifiable Digital Certificates</span>
            <span>✓ Genuine Student Ownership of Work</span>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      {authModalOpen && (
        <StudentAuth
          navigate={navigate}
          initialMode={authInitialMode}
          isModal={true}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={() => {
            setAuthModalOpen(false);
            navigate('/discovery/dashboard');
          }}
        />
      )}
    </div>
  );
};
