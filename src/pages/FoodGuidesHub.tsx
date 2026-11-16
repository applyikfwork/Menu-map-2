import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Search, 
  Clock, 
  ArrowRight, 
  Flame, 
  TrendingDown, 
  ShieldCheck, 
  MapPin, 
  BookOpen, 
  Utensils 
} from 'lucide-react';
import { FOOD_GUIDES, FoodGuideItem } from '../data/foodGuidesData';
import { updatePageSeo } from '../lib/seo';

interface FoodGuidesHubProps {
  navigate: (path: string) => void;
}

export const FoodGuidesHub: React.FC<FoodGuidesHubProps> = ({ navigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  useEffect(() => {
    updatePageSeo({
      title: 'Food Decision Guides & What to Eat in Delhi NCR | Menu Maps',
      description: 'Stuck on what to eat? Explore high-intent food decision guides across Delhi NCR. Discover real dishes, transparent counter rates, dinner ideas, budget meals, and late-night eats on Menu Maps.',
      canonicalUrl: 'https://menumaps.in/guides',
      keywords: [
        'food guides delhi',
        'what to eat today',
        'food ideas for dinner',
        'best food near me',
        'delhi food guide',
        'budget eats delhi',
        'late night food delhi'
      ],
      ogType: 'website',
      jsonLd: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'CollectionPage',
            '@id': 'https://menumaps.in/guides#collection',
            'name': 'Menu Maps Food Decision Guides & What to Eat in Delhi NCR',
            'description': 'Editorial food guides backed by 770+ verified cafes and 6,700+ dishes at authentic counter prices.',
            'url': 'https://menumaps.in/guides',
            'publisher': {
              '@type': 'Organization',
              'name': 'Menu Maps',
              'url': 'https://menumaps.in',
              'logo': 'https://menumaps.in/logo.jpg'
            }
          },
          {
            '@type': 'BreadcrumbList',
            '@id': 'https://menumaps.in/guides#breadcrumbs',
            'itemListElement': [
              { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://menumaps.in/' },
              { '@type': 'ListItem', 'position': 2, 'name': 'Food Guides', 'item': 'https://menumaps.in/guides' }
            ]
          }
        ]
      }
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const categories = ['All', 'Daily Decision', 'Dinner Cravings', 'Hyper-Local', 'Budget Steals', 'Midnight Cravings'];

  const filteredGuides = FOOD_GUIDES.filter((guide) => {
    const matchesSearch =
      searchQuery === '' ||
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCat = activeCategory === 'All' || guide.badge === activeCategory;

    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-24 text-[#1C1917]">
      {/* Editorial Hero Header */}
      <section className="bg-gradient-to-b from-[#1C1917] via-stone-900 to-[#FAF8F5] text-white pt-12 pb-20 px-4 sm:px-6 md:px-8">
        <div className="max-w-[1100px] mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF5A36]/20 text-[#FF8A6B] text-xs font-bold uppercase tracking-wider border border-[#FF5A36]/30">
            <BookOpen className="w-4 h-4" />
            <span>Menu Maps Editorial & Decision Guides</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-heading tracking-tight max-w-3xl mx-auto leading-tight">
            Stop Guessing. <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8A6B] via-[#FF5A36] to-amber-300">
              Discover What to Eat
            </span>{' '}
            at Real Counter Prices.
          </h1>

          <p className="text-sm sm:text-base text-stone-300 max-w-2xl mx-auto leading-relaxed">
            Data-backed food guides powered by 770+ verified Delhi NCR cafes and 6,700+ authentic in-store menus. Zero delivery app markups, guaranteed.
          </p>

          {/* Quick Metrics Strip */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 pt-3 text-xs font-bold text-stone-300">
            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/10">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>770+ Audited Cafes</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/10">
              <Utensils className="w-4 h-4 text-[#FF8A6B]" />
              <span>6,700+ Counter Rates</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/10">
              <TrendingDown className="w-4 h-4 text-emerald-400" />
              <span>Save 20–30% vs Apps</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto pt-6">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search food topics (e.g. what to eat today, dinner, under 200)..."
                className="w-full bg-white text-stone-900 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium shadow-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#FF5A36]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-[1100px] mx-auto px-4 sm:px-6 md:px-8 -mt-10">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-xs cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#1C1917] text-white shadow-sm'
                  : 'bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-50 border border-stone-200/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Guides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 pt-4">
          {filteredGuides.map((guide, idx) => {
            const isFeatured = idx === 0 && activeCategory === 'All' && !searchQuery;
            return (
              <article
                key={guide.slug}
                onClick={() => navigate(`/guides/${guide.slug}`)}
                className={`bg-white rounded-3xl border border-stone-200/90 hover:border-[#FF5A36]/40 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between group cursor-pointer ${
                  isFeatured ? 'md:col-span-2' : ''
                }`}
              >
                <div>
                  {/* Hero Cover */}
                  <div className={`relative overflow-hidden bg-stone-100 ${isFeatured ? 'h-64 sm:h-80' : 'h-52 sm:h-60'}`}>
                    <img
                      src={guide.heroImage}
                      alt={guide.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${guide.badgeColor} shadow-md`}>
                        {guide.badge}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/60 text-white backdrop-blur-md flex items-center gap-1 shadow-md">
                        <Clock className="w-3 h-3" />
                        {guide.readTime}
                      </span>
                    </div>

                    {/* Bottom Headline on image for featured */}
                    {isFeatured && (
                      <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                        <span className="text-xs font-bold text-[#FF8A6B] uppercase tracking-wider">
                          ⭐ Featured Food Decision Guide
                        </span>
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-black font-heading leading-tight drop-shadow-sm">
                          {guide.title}
                        </h2>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 sm:p-6 space-y-3">
                    {!isFeatured && (
                      <h2 className="text-lg sm:text-xl font-black font-heading text-stone-900 group-hover:text-[#FF5A36] transition-colors leading-snug">
                        {guide.title}
                      </h2>
                    )}
                    <p className="text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed">
                      {guide.summary}
                    </p>

                    {/* Editorial tags */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {guide.filterTags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-stone-100 text-stone-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Action Strip */}
                <div className="px-5 sm:px-6 py-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-1.5 text-emerald-600">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Real Dishes & Menus</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#FF5A36] group-hover:translate-x-1 transition-transform">
                    <span>Explore Guide</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Empty Search Fallback */}
        {filteredGuides.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-4 my-8">
            <BookOpen className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="text-lg font-bold text-stone-800">No Food Guides Found</h3>
            <p className="text-xs text-stone-500">
              Try searching for "what to eat today", "dinner", or "under 200".
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('All');
              }}
              className="px-4 py-2 rounded-xl bg-[#FF5A36] text-white text-xs font-bold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default FoodGuidesHub;
