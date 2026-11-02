/**
 * Menu Maps Discovery League — Season 01 (/discovery/competitions/discovery-league)
 * Dedicated flagship series overview page presenting both Season 01 challenges:
 * The Great Market Mission (Offline) & The Foodverse Challenge (Online).
 */

import React, { useState, useEffect } from 'react';
import {
  Compass,
  Trophy,
  Sparkles,
  MapPin,
  Laptop,
  Users,
  ShieldCheck,
  Calendar,
  ArrowRight,
  CheckCircle2,
  FileCheck,
  Award,
  ChevronRight,
  ArrowLeft,
  Coins,
} from 'lucide-react';
import { discoveryApi } from '../lib/discoveryApi';
import { DiscoveryCompetition } from '../types/discovery';
import { DiscoveryNavbar } from '../components/DiscoveryNavbar';

interface DiscoveryLeagueSeriesProps {
  navigate: (path: string) => void;
}

export const DiscoveryLeagueSeries: React.FC<DiscoveryLeagueSeriesProps> = ({ navigate }) => {
  const [competitions, setCompetitions] = useState<DiscoveryCompetition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSeriesData();
  }, []);

  const loadSeriesData = async () => {
    setLoading(true);
    try {
      const data = await discoveryApi.getDiscoveryLeagueCompetitions();
      setCompetitions(data);
    } catch (e) {
      console.error('Failed to load Discovery League competitions', e);
    } finally {
      setLoading(false);
    }
  };

  const gmm = competitions.find((c) => c.slug === 'great-market-mission');
  const fvc = competitions.find((c) => c.slug === 'foodverse-challenge');

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917]">
      <DiscoveryNavbar navigate={navigate} activeTab="competitions" />

      {/* Series Hero Section */}
      <section className="bg-white border-b border-stone-200/80 pt-12 pb-14 px-4 sm:px-6 relative overflow-hidden">
        {/* Subtle Map Grid Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-radial from-teal-500/5 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <button
            onClick={() => navigate('/discovery/competitions')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-500 hover:text-[#0F766E] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Competitions
          </button>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold uppercase tracking-wider mb-4">
            <Trophy className="w-4 h-4 text-amber-600" />
            <span>Official Competition Series • Season 01</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-[1.1]">
            MENU MAPS <span className="text-[#0F766E]">DISCOVERY LEAGUE</span>
          </h1>

          <p className="font-serif italic text-lg sm:text-2xl text-[#FF5A36] font-semibold mt-3">
            "Discover More. Create More. Make Your Mark."
          </p>

          <p className="text-stone-600 text-sm sm:text-base max-w-3xl mt-4 leading-relaxed">
            Menu Maps Discovery League is a series of creative and exploration-based challenges where university students investigate real neighbourhood food ecosystems, solve discovery problems, and build creative digital food products. Two distinct challenges. Two different experiences. One opportunity to discover, create, and be recognized.
          </p>

          <div className="mt-8 flex flex-wrap gap-4 items-center">
            <a
              href="#flagship-competitions"
              className="px-6 py-3 bg-[#0F766E] text-white text-xs sm:text-sm font-semibold rounded-2xl hover:bg-[#0d635c] transition-all shadow-sm"
            >
              Explore Season 01 Challenges
            </a>
            <button
              onClick={() => navigate('/discovery/hall-of-fame')}
              className="px-5 py-3 border border-stone-200 text-stone-700 text-xs sm:text-sm font-semibold rounded-2xl hover:bg-stone-50 transition-colors"
            >
              View Past Champions
            </button>
          </div>
        </div>
      </section>

      {/* Flagship Competitions Side-by-Side Showcase */}
      <section id="flagship-competitions" className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0F766E] bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            Season 01 Dual Challenge
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-stone-900 mt-3">
            Two Flagship Challenges
          </h2>
          <p className="text-stone-600 text-sm mt-2">
            Participation in one competition is not compulsory for the other. Choose the challenge that best matches your passion, or assemble a team to compete in both!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Competition 1: The Great Market Mission */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              {/* Header Visual Banner */}
              <div className="relative h-56 bg-stone-900 overflow-hidden">
                <img
                  src={
                    gmm?.cover_image_url ||
                    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80'
                  }
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
                  <p className="text-xs uppercase tracking-widest text-amber-300 font-bold">Competition 01</p>
                  <h3 className="font-serif text-2xl font-bold">THE GREAT MARKET MISSION</h3>
                  <p className="text-xs text-stone-200 mt-0.5 line-clamp-1 italic">
                    "One Market. Hidden Food Stories. Can Your Team Discover Them All?"
                  </p>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-6 sm:p-8 space-y-5">
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Head into a real Delhi neighbourhood market with your team. Investigate honest counter pricing, discover two genuine hidden gem stalls, design a ₹200 budget feast, and publish a visual food discovery map for newcomers.
                </p>

                {/* Key Missions Pill List */}
                <div className="space-y-2 pt-2 border-t border-stone-100">
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-500">The 4 Mission Tasks (100 Pts):</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80">
                      <span className="font-bold text-[#0F766E]">Mission 01 (20 pts)</span>
                      <p className="text-stone-700 font-medium mt-0.5">The Hidden Gem</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80">
                      <span className="font-bold text-[#0F766E]">Mission 02 (25 pts)</span>
                      <p className="text-stone-700 font-medium mt-0.5">The Menu Detective</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80">
                      <span className="font-bold text-[#0F766E]">Mission 03 (25 pts)</span>
                      <p className="text-stone-700 font-medium mt-0.5">The Budget Battle (≤ ₹200)</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80">
                      <span className="font-bold text-[#0F766E]">Mission 04 (30 pts)</span>
                      <p className="text-stone-700 font-medium mt-0.5">The Market Map</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-stone-500">
                  <span className="flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    Duration: 10 Days
                  </span>
                  <span>•</span>
                  <span>No Purchase Compulsory</span>
                  <span>•</span>
                  <span>Zero Coding Required</span>
                </div>
              </div>
            </div>

            {/* Footer Action */}
            <div className="p-6 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-4">
              <button
                onClick={() => navigate('/discovery/competitions/great-market-mission')}
                className="w-full py-3 bg-[#0F766E] text-white font-semibold text-xs sm:text-sm rounded-xl hover:bg-[#0d635c] transition-colors shadow-2xs flex items-center justify-center gap-1.5"
              >
                <span>View Full Mission Brief & Register</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Competition 2: The Foodverse Challenge */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              {/* Header Visual Banner */}
              <div className="relative h-56 bg-stone-900 overflow-hidden">
                <img
                  src={
                    fvc?.cover_image_url ||
                    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80'
                  }
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
                  <p className="text-xs uppercase tracking-widest text-teal-300 font-bold">Competition 02</p>
                  <h3 className="font-serif text-2xl font-bold">THE FOODVERSE CHALLENGE</h3>
                  <p className="text-xs text-stone-200 mt-0.5 line-clamp-1 italic">
                    "Imagine the Future of Food Discovery. Then Build It."
                  </p>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-6 sm:p-8 space-y-5">
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Design the future of how students and urban diners discover food. Choose from 5 focused challenge tracks (₹150 Budget Explorer, Veg Hunter, Hidden Delhi, Group Planner, Best Dish) and build an interactive prototype, digital map, or app concept.
                </p>

                {/* 5 Tracks Preview */}
                <div className="space-y-2 pt-2 border-t border-stone-100">
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-500">5 Challenge Tracks (Choose 1):</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-stone-50 border border-stone-200/80">
                      <span className="font-bold text-[#FF5A36]">Track 01:</span> ₹150 Food Explorer
                    </div>
                    <div className="p-2 rounded-lg bg-stone-50 border border-stone-200/80">
                      <span className="font-bold text-[#FF5A36]">Track 02:</span> Vegetarian Food Hunter
                    </div>
                    <div className="p-2 rounded-lg bg-stone-50 border border-stone-200/80">
                      <span className="font-bold text-[#FF5A36]">Track 03:</span> Hidden Delhi Explorer
                    </div>
                    <div className="p-2 rounded-lg bg-stone-50 border border-stone-200/80">
                      <span className="font-bold text-[#FF5A36]">Track 04:</span> Friends Food Planner
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-50 border border-stone-200/80 text-xs">
                    <span className="font-bold text-[#FF5A36]">Track 05:</span> Best Dish for Your Budget
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-stone-500">
                  <span className="flex items-center gap-1 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Secret Challenge Drops on Day 3, 5 & 7
                  </span>
                  <span>•</span>
                  <span>Free Tools (Figma/Canva/Slides)</span>
                </div>
              </div>
            </div>

            {/* Footer Action */}
            <div className="p-6 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-4">
              <button
                onClick={() => navigate('/discovery/competitions/foodverse-challenge')}
                className="w-full py-3 bg-[#0F766E] text-white font-semibold text-xs sm:text-sm rounded-xl hover:bg-[#0d635c] transition-colors shadow-2xs flex items-center justify-center gap-1.5"
              >
                <span>View Full Challenge & Tracks</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Side-by-Side Comparison Matrix */}
      <section className="bg-white border-y border-stone-200/80 py-14 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 text-center mb-8">
            Compare Season 01 Competitions
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border border-stone-200 rounded-2xl overflow-hidden">
              <thead className="bg-stone-50 text-stone-700 font-semibold border-b border-stone-200">
                <tr>
                  <th className="p-4">Aspect</th>
                  <th className="p-4 text-[#0F766E] font-bold">The Great Market Mission</th>
                  <th className="p-4 text-[#FF5A36] font-bold">The Foodverse Challenge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-600">
                <tr>
                  <td className="p-4 font-semibold text-stone-900">Format</td>
                  <td className="p-4">Offline Ground Exploration</td>
                  <td className="p-4">100% Online Digital Innovation</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-stone-900">Participation</td>
                  <td className="p-4">Teams of 2–3 students</td>
                  <td className="p-4">Individual or Teams (1–4 students)</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-stone-900">Location</td>
                  <td className="p-4">Selected Delhi NCR neighbourhood market</td>
                  <td className="p-4">Anywhere in India (Work from Home/Campus)</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-stone-900">Coding Required</td>
                  <td className="p-4 font-medium text-emerald-700">None</td>
                  <td className="p-4 font-medium text-emerald-700">None (UI/Prototypes/Decks evaluated)</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-stone-900">Purchase Required</td>
                  <td className="p-4 font-medium text-emerald-700">None (Visual counter audit)</td>
                  <td className="p-4 font-medium text-emerald-700">None (Free software sufficient)</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-stone-900">Core Deliverables</td>
                  <td className="p-4">2 Gems, 3 Verified Dishes, ₹200 Combo, Market Map</td>
                  <td className="p-4">Problem Statement, Interactive Prototype/Concept, Demo Video</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-stone-900">Evaluation Focus</td>
                  <td className="p-4">Ground honesty, counter rates, usability of map</td>
                  <td className="p-4">User research, product innovation, UI/UX polish</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Safety & Fair Participation Rules */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
        <div className="bg-stone-50 rounded-3xl p-6 sm:p-10 border border-stone-200">
          <div className="flex items-center gap-2 mb-3 text-[#0F766E]">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="font-serif text-xl font-bold text-stone-900">
              Safety, Ethics & Fair Participation Charter
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 mb-6 leading-relaxed">
            Menu Maps Discovery League is built on mutual respect, civic honesty, and student safety. All participants agree to uphold these core standards:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-700">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
              <span>Explore only public and accessible locations during daytime.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
              <span>Never trespass, enter restricted kitchens, or disturb vendors.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
              <span>Zero tolerance for fake or misrepresented counter rates.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
              <span>Free tools are 100% sufficient; no paid subscriptions required.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
              <span>Student intellectual property remains 100% owned by the student creators.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
              <span>Participation is completely voluntary.</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
