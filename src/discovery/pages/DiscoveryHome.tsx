/**
 * Menu Maps Discovery - Public Food Discovery Platform
 * Master Homepage (/discovery)
 *
 * Repositioned as a public food exploration destination for everyone,
 * powered by verified community and student contributions.
 *
 * 12-Section Architecture:
 * 1. Hero Section (Public Discovery Value Proposition)
 * 2. Explore by Category (6 Core Discovery Pillars)
 * 3. Featured Food Discoveries (Real verified gems with counter prices)
 * 4. Explore Markets (Comprehensive Delhi Market Food Guides)
 * 5. Food Under Your Budget (Real dishes cross-checked at physical counters)
 * 6. Discover by Dish (Iconic Delhi cravings directory)
 * 7. Featured Food Trails (Walkable student crawls with exact budgets)
 * 8. Food Stories & Guides (Editorial culture, history & neighbourhood pieces)
 * 9. Latest Approved Discoveries (Live verified community submissions)
 * 10. Made Possible by Contributors (Attribution & Hall of Fame spotlight)
 * 11. Menu Maps Discovery League — Season 01 (Content-creation challenge engine)
 * 12. Become a Contributor (Invitation & portfolio submission CTA)
 */

import React, { useState, useEffect } from 'react';
import {
  Compass,
  MapPin,
  IndianRupee,
  Store,
  UtensilsCrossed,
  Footprints,
  BookOpen,
  Trophy,
  Sparkles,
  Award,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  Flame,
  Zap,
  ChevronRight,
  Star,
  Users,
  Check,
  ExternalLink,
  Layers,
  Search,
  Coffee,
  Tag,
  Heart,
  TrendingUp,
  SlidersHorizontal,
} from 'lucide-react';
import { discoveryApi } from '../lib/discoveryApi';
import {
  DiscoveryCompetition,
  FoodDiscoveryItem,
  StudentFoodTrail,
  StudentProject,
  StudentProfile,
  HallOfFameEntry,
  MarketFoodGuide,
  FoodStoryItem,
  BudgetFoodDish,
} from '../types/discovery';
import { DiscoveryNavbar } from '../components/DiscoveryNavbar';
import { FoodDiscoveryCard } from '../components/FoodDiscoveryCard';
import { FoodTrailCard } from '../components/FoodTrailCard';
import { ContributorCard } from '../components/ContributorCard';
import { StudentAuth } from './StudentAuth';
import { useStudentAuth } from '../context/StudentAuthContext';

interface DiscoveryHomeProps {
  navigate: (path: string) => void;
}

export const DiscoveryHome: React.FC<DiscoveryHomeProps> = ({ navigate }) => {
  const { student, isAuthenticated } = useStudentAuth();

  // Datasets from real seed & Supabase
  const [loading, setLoading] = useState(true);
  const [foodDiscoveries, setFoodDiscoveries] = useState<FoodDiscoveryItem[]>([]);
  const [marketGuides, setMarketGuides] = useState<MarketFoodGuide[]>([]);
  const [foodTrails, setFoodTrails] = useState<StudentFoodTrail[]>([]);
  const [foodStories, setFoodStories] = useState<FoodStoryItem[]>([]);
  const [competitions, setCompetitions] = useState<DiscoveryCompetition[]>([]);
  const [contributors, setContributors] = useState<StudentProfile[]>([]);
  const [hallOfFame, setHallOfFame] = useState<HallOfFameEntry[]>([]);

  // Budget Tier Interactive State
  const [selectedBudgetTier, setSelectedBudgetTier] = useState<
    'under-50' | 'under-100' | 'under-150' | 'under-200'
  >('under-100');
  const [budgetSampleDishes, setBudgetSampleDishes] = useState<BudgetFoodDish[]>([]);

  // Dishes directory
  const [dishCategories, setDishCategories] = useState<any[]>([]);

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    loadAllDiscoveryData();
  }, []);

  useEffect(() => {
    // Update budget sample dishes whenever tier changes
    const dishes = discoveryApi.getBudgetFoodDishes(selectedBudgetTier);
    setBudgetSampleDishes(dishes.slice(0, 4));
  }, [selectedBudgetTier]);

  const loadAllDiscoveryData = async () => {
    setLoading(true);
    try {
      const [discs, markets, trails, stories, comps, conts, hof] = await Promise.all([
        discoveryApi.getApprovedFoodDiscoveries(),
        discoveryApi.getMarketGuides(true),
        discoveryApi.getFoodTrails(true),
        discoveryApi.getFoodStories(true),
        discoveryApi.getCompetitions(true),
        discoveryApi.getPublicContributors(),
        discoveryApi.getHallOfFameEntries(),
      ]);

      setFoodDiscoveries(discs);
      setMarketGuides(markets);
      setFoodTrails(trails);
      setFoodStories(stories);
      setCompetitions(comps);
      setContributors(conts);
      setHallOfFame(hof);

      // Load dishes directory
      const directory = discoveryApi.getDishesDirectory();
      setDishCategories(directory);

      // Initialize budget dishes
      const initialDishes = discoveryApi.getBudgetFoodDishes('under-100');
      setBudgetSampleDishes(initialDishes.slice(0, 4));
    } catch (e) {
      console.error('Error loading Discovery platform data', e);
    } finally {
      setLoading(false);
    }
  };

  const openAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthInitialMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917] selection:bg-[#0F766E]/20">
      {/* Sub-Navigation Bar */}
      <DiscoveryNavbar
        currentPath="/discovery"
        navigate={navigate}
        onOpenAuth={openAuth}
      />

      {/* =========================================================================
          SECTION 1: HERO — PUBLIC FOOD DISCOVERY PLATFORM
      ========================================================================= */}
      <section className="relative overflow-hidden pt-8 sm:pt-12 md:pt-16 pb-12 sm:pb-16 border-b border-[#E7E2DA]/80 bg-gradient-to-b from-white via-[#FAF8F5] to-[#FAF8F5]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Narrative Column */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-[#0F766E] text-[11px] sm:text-xs font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Menu Maps Discovery • Verified Food Platform</span>
              </div>

              <h1 className="hd text-3xl sm:text-5xl lg:text-6xl font-black text-[#1C1917] tracking-tight leading-[1.12]">
                Discover Hidden Food. <br className="hidden sm:inline" />
                Uncover Delhi&apos;s Best <br className="hidden sm:inline" />
                <span className="text-[#0F766E]">Neighbourhood Flavours.</span>
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-[#57534E] leading-relaxed max-w-xl mx-auto lg:mx-0">
                Explore real neighbourhood food places, market-wise culinary guides, budget-friendly eats with verified counter pricing, and iconic local food stories — curated with student and community researchers.
              </p>

              {/* Primary Call to Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-3 pt-1">
                <button
                  onClick={() => navigate('/discovery/food-discoveries')}
                  className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#0F766E] hover:bg-[#0d635c] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <MapPin className="w-4 h-4 text-emerald-300" />
                  <span>Explore Discoveries</span>
                </button>

                <button
                  onClick={() => navigate('/discovery/markets')}
                  className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-white hover:bg-stone-100 text-[#1C1917] border border-[#E7E2DA] text-xs sm:text-sm font-bold shadow-2xs hover:shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Store className="w-4 h-4 text-[#0F766E]" />
                  <span>Market Guides</span>
                </button>

                <button
                  onClick={() => navigate('/discovery/food-trails')}
                  className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-white hover:bg-stone-100 text-[#1C1917] border border-[#E7E2DA] text-xs sm:text-sm font-bold shadow-2xs hover:shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Footprints className="w-4 h-4 text-amber-600" />
                  <span>Food Trails</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-2 sm:pt-4 border-t border-[#E7E2DA]/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0F766E] shrink-0" />
                  <div>
                    <div className="text-xs sm:text-sm font-black text-stone-900">770+ Outlets</div>
                    <div className="text-[10px] text-stone-500">Verified Delhi Venues</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#0F766E] shrink-0" />
                  <div>
                    <div className="text-xs sm:text-sm font-black text-stone-900">Counter Prices</div>
                    <div className="text-[10px] text-stone-500">100% Physical Rates</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#0F766E] shrink-0" />
                  <div>
                    <div className="text-xs sm:text-sm font-black text-stone-900">Campus Credits</div>
                    <div className="text-[10px] text-stone-500">Documented by Students</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0" />
                  <div>
                    <div className="text-xs sm:text-sm font-black text-stone-900">Zero Fake Data</div>
                    <div className="text-[10px] text-stone-500">Strict Human Review</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Visual Feature Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden bg-white border border-[#E7E2DA] shadow-xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0F766E]">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-stone-900">Delhi Food Radar</div>
                      <div className="text-[10px] text-stone-500">Curated by Menu Maps Community</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#0F766E] text-[10px] font-black uppercase">
                    Live Feed
                  </span>
                </div>

                {/* Mini Preview Outlets */}
                <div className="space-y-2.5">
                  <div
                    onClick={() => navigate('/discovery/markets/kamla-nagar')}
                    className="p-3 rounded-2xl bg-stone-50 hover:bg-stone-100/80 border border-stone-200/60 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-sm shrink-0">
                        KN
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-900">Kamla Nagar Market Guide</div>
                        <div className="text-[11px] text-stone-500">North Campus • ₹80–₹180 / person</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </div>

                  <div
                    onClick={() => navigate('/discovery/budget-food?tier=under-50')}
                    className="p-3 rounded-2xl bg-stone-50 hover:bg-stone-100/80 border border-stone-200/60 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-100 text-[#0F766E] flex items-center justify-center font-black text-sm shrink-0">
                        ₹
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-900">Eats Under ₹50</div>
                        <div className="text-[11px] text-stone-500">Laphing, Chai, Bread Pakora & Kachori</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </div>

                  <div
                    onClick={() => navigate('/discovery/food-trails')}
                    className="p-3 rounded-2xl bg-stone-50 hover:bg-stone-100/80 border border-stone-200/60 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-black text-sm shrink-0">
                        🗺️
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-900">North Campus Student Crawl</div>
                        <div className="text-[11px] text-stone-500">4 stops • 55 mins • Under ₹150 total</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => navigate('/discovery/food-discoveries')}
                    className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Browse All Delhi Discoveries</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: EXPLORE BY CATEGORY (6 CORE DISCOVERY PILLARS)
      ========================================================================= */}
      <section className="py-10 sm:py-14 max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 border-b border-[#E7E2DA]/80">
        <div className="space-y-1 mb-8">
          <div className="text-[11px] font-black uppercase text-[#0F766E] tracking-wider">
            Explore Discovery Channels
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            How Would You Like to Explore Today?
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 max-w-2xl">
            Choose your preferred way to discover Delhi&apos;s food — by budget, market, cravings, walking trails, or local stories.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* 1. Budget Food */}
          <div
            onClick={() => navigate('/discovery/budget-food')}
            className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E7E2DA] hover:border-[#0F766E]/50 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0F766E] flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900 group-hover:text-[#0F766E] transition-colors">
                  Budget Food
                </h3>
                <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">
                  Eats under ₹50, ₹100, ₹150, & ₹200
                </p>
              </div>
            </div>
            <div className="pt-3 flex items-center text-[10px] font-bold text-[#0F766E]">
              <span>Explore rates</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* 2. Market Guides */}
          <div
            onClick={() => navigate('/discovery/markets')}
            className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E7E2DA] hover:border-[#0F766E]/50 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900 group-hover:text-[#0F766E] transition-colors">
                  Market Guides
                </h3>
                <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">
                  CP, Kamla Nagar, Chandni Chowk, MKT & more
                </p>
              </div>
            </div>
            <div className="pt-3 flex items-center text-[10px] font-bold text-[#0F766E]">
              <span>6 deep guides</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* 3. Hidden Discoveries */}
          <div
            onClick={() => navigate('/discovery/food-discoveries')}
            className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E7E2DA] hover:border-[#0F766E]/50 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900 group-hover:text-[#0F766E] transition-colors">
                  Hidden Gems
                </h3>
                <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">
                  Secret alleyways and student icons
                </p>
              </div>
            </div>
            <div className="pt-3 flex items-center text-[10px] font-bold text-[#0F766E]">
              <span>Verified gems</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* 4. Food Trails */}
          <div
            onClick={() => navigate('/discovery/food-trails')}
            className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E7E2DA] hover:border-[#0F766E]/50 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                <Footprints className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900 group-hover:text-[#0F766E] transition-colors">
                  Food Trails
                </h3>
                <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">
                  Walkable crawls with exact budgets
                </p>
              </div>
            </div>
            <div className="pt-3 flex items-center text-[10px] font-bold text-[#0F766E]">
              <span>Curated crawls</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* 5. Discover by Dish */}
          <div
            onClick={() => navigate('/discovery/dishes')}
            className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E7E2DA] hover:border-[#0F766E]/50 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900 group-hover:text-[#0F766E] transition-colors">
                  By Dish
                </h3>
                <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">
                  Momos, Chole Bhature, Dosa, Rolls & more
                </p>
              </div>
            </div>
            <div className="pt-3 flex items-center text-[10px] font-bold text-[#0F766E]">
              <span>Craving radar</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* 6. Food Stories */}
          <div
            onClick={() => navigate('/discovery/stories')}
            className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E7E2DA] hover:border-[#0F766E]/50 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900 group-hover:text-[#0F766E] transition-colors">
                  Food Stories
                </h3>
                <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">
                  Food culture, origins & neighbourhood essays
                </p>
              </div>
            </div>
            <div className="pt-3 flex items-center text-[10px] font-bold text-[#0F766E]">
              <span>Read essays</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: FEATURED FOOD DISCOVERIES
      ========================================================================= */}
      <section className="py-10 sm:py-14 max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 border-b border-[#E7E2DA]/80">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-[11px] font-black uppercase text-[#0F766E] tracking-wider">
              Handpicked Highlights
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Featured Food Discoveries
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              Community-recommended outlets with physical counter verification and student researcher credit.
            </p>
          </div>
          <button
            onClick={() => navigate('/discovery/food-discoveries')}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#0F766E] hover:text-[#0d635c] transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
          >
            <span>View all discoveries</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {foodDiscoveries.slice(0, 3).map((item) => (
            <FoodDiscoveryCard key={item.id} item={item} navigate={navigate} />
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: EXPLORE MARKETS (MARKET-WISE FOOD GUIDES)
      ========================================================================= */}
      <section className="py-10 sm:py-14 max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 border-b border-[#E7E2DA]/80 bg-[#FAF8F5]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-[11px] font-black uppercase text-[#0F766E] tracking-wider">
              Neighbourhood Hubs
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Explore Delhi&apos;s Iconic Food Markets
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              In-depth food guides covering famous stalls, secret corners, and average student budgets.
            </p>
          </div>
          <button
            onClick={() => navigate('/discovery/markets')}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#0F766E] hover:text-[#0d635c] transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
          >
            <span>All 6 Market Guides</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {marketGuides.slice(0, 3).map((market) => (
            <div
              key={market.id}
              onClick={() => navigate(`/discovery/markets/${market.slug}`)}
              className="bg-white rounded-3xl border border-[#E7E2DA] overflow-hidden shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={market.cover_image_url}
                    alt={market.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs text-stone-900 text-[10px] font-black">
                      {market.nearest_metro}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="text-base font-black leading-tight drop-shadow-xs">
                      {market.title}
                    </h3>
                    <div className="text-[11px] text-stone-200 mt-0.5">{market.location_area}</div>
                  </div>
                </div>

                <div className="p-4 sm:p-5 space-y-3">
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {market.overview}
                  </p>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                    <span className="text-stone-500 text-[11px]">Avg. Meal Budget</span>
                    <span className="font-bold text-stone-900">{market.estimated_budget}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {market.iconic_outlets.slice(0, 2).map((outlet) => (
                      <span
                        key={outlet.name}
                        className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[10px] font-bold"
                      >
                        {outlet.name}
                      </span>
                    ))}
                    {market.iconic_outlets.length > 2 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-500 text-[10px]">
                        +{market.iconic_outlets.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5 pt-0">
                <div className="w-full py-2 rounded-xl bg-stone-50 group-hover:bg-[#0F766E] text-stone-700 group-hover:text-white text-xs font-bold transition-all text-center flex items-center justify-center gap-1">
                  <span>Explore Market Guide</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: FOOD UNDER YOUR BUDGET (BUDGET-FRIENDLY FOOD DISCOVERIES)
      ========================================================================= */}
      <section className="py-10 sm:py-14 max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 border-b border-[#E7E2DA]/80">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="text-[11px] font-black uppercase text-[#0F766E] tracking-wider">
              100% Counter Verified Pricing
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Eat Good On Any Budget
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              Real dishes cross-checked from physical counters across 770+ verified Delhi restaurants.
            </p>
          </div>
          <button
            onClick={() => navigate('/discovery/budget-food')}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#0F766E] hover:text-[#0d635c] transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
          >
            <span>Explore All Budget Dishes</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Budget Tier Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-6">
          {(
            [
              { id: 'under-50', label: 'Under ₹50', sub: 'Snacks, Chai & Laphing' },
              { id: 'under-100', label: 'Under ₹100', sub: 'Chole Bhature, Momos & Rolls' },
              { id: 'under-150', label: 'Under ₹150', sub: 'Dosas, Burgers & Pastas' },
              { id: 'under-200', label: 'Under ₹200', sub: 'Full Thalis & Pizza Combos' },
            ] as const
          ).map((tier) => {
            const isSelected = selectedBudgetTier === tier.id;
            return (
              <button
                key={tier.id}
                onClick={() => setSelectedBudgetTier(tier.id)}
                className={`px-4 py-2 rounded-2xl text-left transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#0F766E] text-white shadow-sm'
                    : 'bg-white border border-[#E7E2DA] text-stone-700 hover:bg-stone-50'
                }`}
              >
                <div className="text-xs font-black">{tier.label}</div>
                <div
                  className={`text-[10px] ${
                    isSelected ? 'text-teal-100' : 'text-stone-500'
                  }`}
                >
                  {tier.sub}
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Budget Dishes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {budgetSampleDishes.map((dish, idx) => (
            <div
              key={idx}
              onClick={() => navigate(`/restaurant/${dish.restaurant_slug}`)}
              className="bg-white rounded-2xl border border-[#E7E2DA] p-4 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="relative h-32 rounded-xl overflow-hidden bg-stone-100">
                  <img
                    src={dish.photo_url}
                    alt={dish.dish_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-[#0F766E] text-white text-xs font-black shadow-xs">
                    ₹{dish.price}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-stone-900 group-hover:text-[#0F766E] transition-colors line-clamp-1">
                    {dish.dish_name}
                  </h4>
                  <div className="text-[11px] font-medium text-stone-600 line-clamp-1">
                    {dish.restaurant_name}
                  </div>
                  <div className="text-[10px] text-stone-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-stone-400" />
                    <span>{dish.neighbourhood}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between text-[10px]">
                <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                  Counter Verified
                </span>
                <span className="text-[#0F766E] font-bold group-hover:translate-x-0.5 transition-transform">
                  View Menu →
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: DISCOVER BY DISH (ICONIC DELHI CRAVINGS)
      ========================================================================= */}
      <section className="py-10 sm:py-14 max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 border-b border-[#E7E2DA]/80">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-[11px] font-black uppercase text-[#0F766E] tracking-wider">
              Iconic Cravings
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Discover by Dish
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              Craving something specific? Explore top spots across 770+ verified outlets.
            </p>
          </div>
          <button
            onClick={() => navigate('/discovery/dishes')}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#0F766E] hover:text-[#0d635c] transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
          >
            <span>View All Cravings</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {dishCategories.slice(0, 6).map((group) => (
            <div
              key={group.id}
              onClick={() => navigate(`/discovery/dishes?c=${group.id}`)}
              className="p-4 rounded-2xl bg-white border border-[#E7E2DA] hover:border-[#0F766E]/50 shadow-2xs hover:shadow-md transition-all cursor-pointer group text-center space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="text-3xl group-hover:scale-110 transition-transform py-1">
                  {group.icon}
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-[#0F766E] transition-colors line-clamp-1">
                  {group.label}
                </h3>
                <div className="text-[10px] text-stone-500 mt-0.5">
                  {group.total_places_count} verified places
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100 text-[10px] font-bold text-[#0F766E]">
                From ₹{group.min_price}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: FEATURED FOOD TRAILS (WALKABLE STUDENT CRAWLS)
      ========================================================================= */}
      <section className="py-10 sm:py-14 max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 border-b border-[#E7E2DA]/80 bg-[#FAF8F5]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-[11px] font-black uppercase text-[#0F766E] tracking-wider">
              Walking Crawls
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Featured Food Trails
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              Neighbourhood walking routes tested for distance, walking time, and realistic budgets.
            </p>
          </div>
          <button
            onClick={() => navigate('/discovery/food-trails')}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#0F766E] hover:text-[#0d635c] transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
          >
            <span>View all trails</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {foodTrails.slice(0, 3).map((trail) => (
            <FoodTrailCard key={trail.id} trail={trail} navigate={navigate} />
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: FOOD STORIES AND GUIDES (EDITORIAL CULTURE & ESSAYS)
      ========================================================================= */}
      <section className="py-10 sm:py-14 max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 border-b border-[#E7E2DA]/80">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-[11px] font-black uppercase text-[#0F766E] tracking-wider">
              Food Culture & History
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Food Stories & Neighbourhood Guides
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              Read editorial deep-dives into culinary origins, student eating rituals, and secret recipes.
            </p>
          </div>
          <button
            onClick={() => navigate('/discovery/stories')}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#0F766E] hover:text-[#0d635c] transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
          >
            <span>Read All Stories</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {foodStories.slice(0, 3).map((story) => (
            <div
              key={story.id}
              onClick={() => navigate(`/discovery/stories/${story.slug}`)}
              className="bg-white rounded-3xl border border-[#E7E2DA] overflow-hidden shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={story.cover_image_url}
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-bold">
                      {story.category}
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 space-y-2">
                  <div className="flex items-center gap-2 text-[10px] text-stone-500">
                    <Clock className="w-3 h-3" />
                    <span>{story.reading_time_minutes} min read</span>
                    <span>•</span>
                    <span>By {story.author_name}</span>
                  </div>

                  <h3 className="text-base font-bold text-stone-900 group-hover:text-[#0F766E] transition-colors leading-snug">
                    {story.title}
                  </h3>

                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {story.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-5 pt-0">
                <div className="text-xs font-bold text-[#0F766E] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  <span>Read full story</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 9: LATEST APPROVED DISCOVERIES (LIVE VERIFIED FEED)
      ========================================================================= */}
      <section className="py-10 sm:py-14 max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 border-b border-[#E7E2DA]/80">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-[11px] font-black uppercase text-[#0F766E] tracking-wider">
              Live Verified Feed
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Latest Approved Community Discoveries
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              Verified contributions documented and submitted by students and local explorers.
            </p>
          </div>
          <button
            onClick={() => navigate('/discovery/food-discoveries')}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#0F766E] hover:text-[#0d635c] transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
          >
            <span>Browse all verified</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {foodDiscoveries.slice(3, 6).map((item) => (
            <FoodDiscoveryCard key={item.id} item={item} navigate={navigate} />
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 10: MADE POSSIBLE BY CONTRIBUTORS (HONOR ROLL & ATTRIBUTION)
      ========================================================================= */}
      <section className="py-10 sm:py-14 max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 border-b border-[#E7E2DA]/80 bg-[#FAF8F5]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-[11px] font-black uppercase text-[#0F766E] tracking-wider">
              Community Researchers
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Made Possible by Campus Contributors
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              Meet the student explorers, photographers, and researchers whose field contributions power Menu Maps Discovery.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/discovery/hall-of-fame')}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-700 hover:text-amber-800 transition-colors cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>Hall of Fame</span>
            </button>
            <button
              onClick={() => navigate('/discovery/contributors')}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#0F766E] hover:text-[#0d635c] transition-colors cursor-pointer"
            >
              <span>All Contributors</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {contributors.slice(0, 4).map((contrib) => (
            <ContributorCard key={contrib.id} contributor={contrib} navigate={navigate} />
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 11: MENU MAPS DISCOVERY LEAGUE — SEASON 01 (CHALLENGE ENGINE)
      ========================================================================= */}
      <section
        id="discovery-league"
        className="py-12 sm:py-16 max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 border-b border-[#E7E2DA]/80"
      >
        <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-10 lg:p-12 relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-400/20 border border-teal-400/30 text-teal-300 text-[11px] font-black uppercase tracking-wider mb-3">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>The Content Creation Engine</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                  CREATE SOMETHING WORTH DISCOVERING.
                </h2>
                <p className="text-xs sm:text-sm text-stone-300 max-w-2xl mt-1 leading-relaxed">
                  Menu Maps Discovery League is our premier challenge series where university students explore real neighbourhood markets, document physical counter pricing, and build creative digital experiences.
                </p>
              </div>

              <button
                onClick={() => navigate('/discovery/competitions/discovery-league')}
                className="px-5 py-2.5 rounded-full bg-white text-stone-900 hover:bg-stone-100 text-xs sm:text-sm font-bold transition-all shadow-md shrink-0 cursor-pointer"
              >
                <span>Season 01 Details</span>
              </button>
            </div>

            {/* The 2 Competitions Side-by-Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {/* Competition 1: The Great Market Mission */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase">
                      Offline Exploration
                    </span>
                    <span className="text-[11px] text-stone-400">Teams of 2–3</span>
                  </div>
                  <h3 className="text-lg font-black text-white">THE GREAT MARKET MISSION</h3>
                  <div className="text-xs text-amber-300 font-bold">
                    &quot;One Market. Hidden Food Stories. Can Your Team Discover Them All?&quot;
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    Explore real Delhi markets like Kamla Nagar, Chandni Chowk, or CR Park. Document hidden food gems, verify counter menus, and curate high-utility budget maps.
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-stone-400">8 Supported Markets</span>
                  <button
                    onClick={() => navigate('/discovery/competitions/great-market-mission')}
                    className="text-xs font-bold text-teal-300 hover:text-teal-200 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Mission Tasks</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Competition 2: The Foodverse Challenge */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-black uppercase">
                      Online Digital Innovation
                    </span>
                    <span className="text-[11px] text-stone-400">Solo or Team (1–4)</span>
                  </div>
                  <h3 className="text-lg font-black text-white">THE FOODVERSE CHALLENGE</h3>
                  <div className="text-xs text-teal-300 font-bold">
                    &quot;Imagine the Future of Food Discovery. Then Build It.&quot;
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    Solve real-world food discovery problems through UI/UX prototypes, data visualisations, algorithmic matchers, and innovative campus food concepts.
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-stone-400">5 Tracks • 3 Secret Drops</span>
                  <button
                    onClick={() => navigate('/discovery/competitions/foodverse-challenge')}
                    className="text-xs font-bold text-teal-300 hover:text-teal-200 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Challenge Tracks</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 12: BECOME A CONTRIBUTOR (INVITATION & PORTFOLIO CTA)
      ========================================================================= */}
      <section className="py-12 sm:py-16 max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8">
        <div className="bg-gradient-to-br from-teal-900 via-[#0F766E] to-teal-950 text-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4 text-center sm:text-left">
            <span className="px-3 py-1 rounded-full bg-white/10 text-white text-[10px] font-black uppercase tracking-wider inline-block">
              Open Community Network
            </span>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Know a Hidden Gem in Your College Market?
            </h2>

            <p className="text-xs sm:text-sm text-teal-100 leading-relaxed">
              Help thousands of students and food lovers discover honest prices, legendary stalls, and great meals. Every approved contribution earns official Menu Maps portfolio credit and digital verification.
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
              {isAuthenticated ? (
                <button
                  onClick={() => navigate('/discovery/dashboard?tab=submit')}
                  className="px-6 py-3 rounded-full bg-white text-[#0F766E] hover:bg-stone-100 text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Submit a Food Discovery</span>
                </button>
              ) : (
                <button
                  onClick={() => openAuth('register')}
                  className="px-6 py-3 rounded-full bg-white text-[#0F766E] hover:bg-stone-100 text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Register as Contributor</span>
                </button>
              )}

              <button
                onClick={() => navigate('/discovery/competitions')}
                className="px-6 py-3 rounded-full bg-teal-800/60 hover:bg-teal-800 text-white border border-teal-600/60 text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                <Trophy className="w-4 h-4" />
                <span>Browse Active Competitions</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      {authModalOpen && (
        <StudentAuth
          initialMode={authInitialMode}
          navigate={navigate}
          onSuccess={() => {
            setAuthModalOpen(false);
            navigate('/discovery/dashboard');
          }}
          onClose={() => setAuthModalOpen(false)}
        />
      )}
    </div>
  );
};

export default DiscoveryHome;