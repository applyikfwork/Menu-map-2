import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  Sparkles, 
  ShieldCheck, 
  Utensils, 
  MapPin, 
  ArrowRight, 
  Share2, 
  Check, 
  HelpCircle, 
  TrendingDown, 
  Compass,
  Flame,
  Bookmark
} from 'lucide-react';
import { getGuideBySlug, FOOD_GUIDES, FoodGuideItem } from '../data/foodGuidesData';
import { getMasterSeedData } from '../lib/supabase';
import { MenuItem, Restaurant } from '../types/database';
import { updatePageSeo } from '../lib/seo';
import { CravingShufflerWidget } from '../components/guides/CravingShufflerWidget';
import { GuideDishCard } from '../components/guides/GuideDishCard';
import { GuideFaqAccordion } from '../components/guides/GuideFaqAccordion';

interface GuideDetailProps {
  slug: string;
  navigate: (path: string) => void;
}

export const GuideDetail: React.FC<GuideDetailProps> = ({ slug, navigate }) => {
  const guide = useMemo(() => getGuideBySlug(slug), [slug]);
  const [activeFilter, setActiveFilter] = useState<string>('All Cravings');
  const [selectedHighlightDish, setSelectedHighlightDish] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const dishGridRef = useRef<HTMLDivElement>(null);

  // Load real restaurants and dishes
  const { matchedDishes, matchedRestaurants } = useMemo(() => {
    if (!guide) return { matchedDishes: [], matchedRestaurants: [] };

    try {
      const seed = getMasterSeedData();
      const restMap = new Map<string, Restaurant>();
      seed.restaurants.forEach((r) => restMap.set(r.id, r));

      const keywords = guide.queryCriteria.keywords || [];
      const maxPrice = guide.queryCriteria.maxPrice || 500;

      // Filter dishes matching guide criteria
      const candidateDishes = seed.menuItems.filter((item) => {
        if (!item.is_available) return false;
        if (item.price > maxPrice) return false;

        const nameLower = item.name.toLowerCase();
        const descLower = (item.description || '').toLowerCase();

        if (keywords.length > 0) {
          return keywords.some((kw) => nameLower.includes(kw) || descLower.includes(kw));
        }
        return true;
      });

      // Enrich candidate dishes with restaurant info
      const enrichedDishes = candidateDishes.slice(0, 32).map((item) => {
        const rest = restMap.get(item.restaurant_id);
        return {
          ...item,
          restaurant_name: rest?.name || 'Verified Cafe',
          restaurant_slug: rest?.slug || '',
          restaurant_address: rest?.address_line1 || rest?.city || 'Delhi NCR',
          restaurant_city: rest?.city || 'Delhi NCR',
          restaurant_phone: rest?.whatsapp_number || rest?.phone || '',
        };
      });

      // Find unique restaurants serving these dishes
      const uniqueRestSlugs = new Set<string>();
      const candidateRests: Restaurant[] = [];
      for (const d of enrichedDishes) {
        if (d.restaurant_slug && !uniqueRestSlugs.has(d.restaurant_slug)) {
          uniqueRestSlugs.add(d.restaurant_slug);
          const r = seed.restaurants.find((x) => x.slug === d.restaurant_slug);
          if (r) candidateRests.push(r);
        }
        if (candidateRests.length >= 6) break;
      }

      return {
        matchedDishes: enrichedDishes,
        matchedRestaurants: candidateRests,
      };
    } catch (err) {
      console.warn('Error hydrating real guide data:', err);
      return { matchedDishes: [], matchedRestaurants: [] };
    }
  }, [guide]);

  // Set rich SEO Schema.org graph
  useEffect(() => {
    if (!guide) return;

    const pageUrl = `https://menumaps.in/guides/${guide.slug}`;

    const itemListElements = matchedDishes.slice(0, 15).map((dish, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: `${dish.name} at ${dish.restaurant_name}`,
      url: dish.slug ? `https://menumaps.in/food/${dish.slug}` : pageUrl,
    }));

    const faqElements = guide.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    }));

    updatePageSeo({
      title: guide.metaTitle,
      description: guide.metaDescription,
      canonicalUrl: pageUrl,
      keywords: guide.keywords,
      ogImage: guide.heroImage,
      ogType: 'article',
      jsonLd: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Article',
            '@id': `${pageUrl}#article`,
            isPartOf: {
              '@type': 'WebSite',
              '@id': 'https://menumaps.in/#website',
              name: 'Menu Maps',
              url: 'https://menumaps.in',
            },
            headline: guide.title,
            description: guide.metaDescription,
            image: [guide.heroImage],
            datePublished: guide.publishedDate,
            dateModified: guide.updatedDate,
            author: {
              '@type': 'Organization',
              name: 'Menu Maps Editorial Team',
              url: 'https://menumaps.in/about',
            },
            publisher: {
              '@type': 'Organization',
              name: 'Menu Maps',
              url: 'https://menumaps.in',
              logo: {
                '@type': 'ImageObject',
                url: 'https://menumaps.in/logo.jpg',
              },
            },
            mainEntityOfPage: pageUrl,
          },
          {
            '@type': 'ItemList',
            '@id': `${pageUrl}#items`,
            name: `Top Real Dishes for ${guide.shortTitle}`,
            itemListElement: itemListElements,
          },
          {
            '@type': 'FAQPage',
            '@id': `${pageUrl}#faq`,
            mainEntity: faqElements,
          },
          {
            '@type': 'BreadcrumbList',
            '@id': `${pageUrl}#breadcrumbs`,
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://menumaps.in/' },
              { '@type': 'ListItem', position: 2, name: 'Food Guides', item: 'https://menumaps.in/guides' },
              { '@type': 'ListItem', position: 3, name: guide.shortTitle, item: pageUrl },
            ],
          },
        ],
      },
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [guide, matchedDishes]);

  // Filtered dishes
  const displayedDishes = useMemo(() => {
    if (activeFilter === 'All Cravings' || activeFilter.startsWith('All')) {
      return matchedDishes;
    }
    const filterLower = activeFilter.toLowerCase();
    return matchedDishes.filter((dish) => {
      const name = dish.name.toLowerCase();
      const desc = (dish.description || '').toLowerCase();
      const tags = (dish.dietary_tags || []).map((t) => t.toLowerCase());

      if (filterLower.includes('under ₹150') || filterLower.includes('under 150')) {
        return dish.price <= 150;
      }
      if (filterLower.includes('under ₹100') || filterLower.includes('under 100')) {
        return dish.price <= 100;
      }
      if (filterLower.includes('under ₹200') || filterLower.includes('under 200')) {
        return dish.price <= 200;
      }
      if (filterLower.includes('pure veg') || filterLower.includes('veg')) {
        return tags.includes('veg') || (dish as any).is_veg;
      }
      if (filterLower.includes('spicy') || filterLower.includes('street')) {
        return name.includes('roll') || name.includes('momos') || name.includes('tikka') || name.includes('masala') || name.includes('chaat');
      }
      if (filterLower.includes('sweet') || filterLower.includes('dessert')) {
        return name.includes('waffle') || name.includes('shake') || name.includes('cake') || name.includes('brownie') || name.includes('ice cream');
      }
      if (filterLower.includes('carb') || filterLower.includes('comfort')) {
        return name.includes('pasta') || name.includes('pizza') || name.includes('burger') || name.includes('dal') || name.includes('biryani');
      }

      return name.includes(filterLower) || desc.includes(filterLower);
    });
  }, [matchedDishes, activeFilter]);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSelectDishFromShuffler = (dish: MenuItem) => {
    setSelectedHighlightDish(dish.id);
    dishGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // 404 Fallback
  if (!guide) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] py-20 px-4 text-center space-y-4">
        <h1 className="text-2xl font-black text-stone-900">Food Guide Not Found</h1>
        <p className="text-sm text-stone-600">The requested decision guide could not be located.</p>
        <button
          onClick={() => navigate('/guides')}
          className="px-6 py-3 rounded-2xl bg-[#FF5A36] text-white font-bold text-sm cursor-pointer"
        >
          Browse All Food Guides
        </button>
      </div>
    );
  }

  const otherGuides = FOOD_GUIDES.filter((g) => g.slug !== guide.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-24 text-[#1C1917]">
      {/* Top Breadcrumb & Navigation Bar */}
      <div className="bg-white border-b border-stone-200/80 sticky top-16 sm:top-20 z-20 backdrop-blur-md bg-white/95">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between text-xs font-semibold text-stone-500">
          <nav className="flex items-center gap-2 truncate">
            <button onClick={() => navigate('/')} className="hover:text-[#FF5A36] cursor-pointer">
              Home
            </button>
            <span>&gt;</span>
            <button onClick={() => navigate('/guides')} className="hover:text-[#FF5A36] cursor-pointer">
              Food Guides
            </button>
            <span>&gt;</span>
            <span className="text-stone-900 font-bold truncate">{guide.shortTitle}</span>
          </nav>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors cursor-pointer shrink-0"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copied!' : 'Share Guide'}</span>
          </button>
        </div>
      </div>

      {/* Hero Header */}
      <header className="bg-white border-b border-stone-200/80 pt-8 pb-10 px-4 sm:px-6 md:px-8">
        <div className="max-w-[1100px] mx-auto space-y-5">
          {/* Top Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${guide.badgeColor}`}>
              {guide.badge}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-600 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {guide.readTime}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-600 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Updated Nov 2026
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified Counter Rates
            </span>
          </div>

          {/* Guide Title */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black font-heading text-stone-900 tracking-tight leading-tight">
            {guide.title}
          </h1>

          {/* Subheading / Summary */}
          <p className="text-base sm:text-lg text-stone-600 leading-relaxed font-sans max-w-3xl">
            {guide.summary}
          </p>

          {/* Author Byline */}
          <div className="flex items-center gap-3 pt-2 text-xs text-stone-500">
            <div className="w-8 h-8 rounded-full bg-[#FF5A36] text-white font-black flex items-center justify-center text-xs">
              MM
            </div>
            <div>
              <div className="font-bold text-stone-800">Menu Maps Editorial Intelligence</div>
              <div>Ground verified across 770+ Delhi NCR cafes</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Guide Content */}
      <main className="max-w-[1100px] mx-auto px-4 sm:px-6 md:px-8 pt-8 space-y-10">
        {/* Cover Photo */}
        <div className="relative aspect-16/9 sm:aspect-21/9 rounded-3xl overflow-hidden shadow-sm bg-stone-200 border border-stone-200">
          <img
            src={guide.heroImage}
            alt={guide.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6 sm:p-8">
            <p className="text-white font-heading font-black text-lg sm:text-2xl drop-shadow-md">
              {guide.hookHeadline}
            </p>
          </div>
        </div>

        {/* Interactive Craving Shuffler Widget */}
        <CravingShufflerWidget
          dishes={matchedDishes}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          filterTags={guide.filterTags}
          onSelectDish={handleSelectDishFromShuffler}
          navigate={navigate}
        />

        {/* Editorial Text Sections */}
        <section className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 space-y-6">
          <div className="space-y-6 divide-y divide-stone-100">
            {guide.introSections.map((sec, idx) => (
              <div key={idx} className="space-y-3 pt-4 first:pt-0">
                {sec.highlightPill && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-stone-100 text-stone-700">
                    {sec.highlightPill}
                  </span>
                )}
                <h2 className="text-xl sm:text-2xl font-black font-heading text-stone-900 tracking-tight">
                  {sec.heading}
                </h2>
                <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-sans">
                  {sec.body}
                </p>
              </div>
            ))}
          </div>

          {/* Insider Editorial Tips Box */}
          {guide.editorialTips.length > 0 && (
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 font-black text-amber-900 text-sm">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Editor's Counter Tips</span>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-amber-950/80 list-disc list-inside">
                {guide.editorialTips.map((tip, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Real Dishes Recommendation Grid */}
        <section ref={dishGridRef} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-[#FF5A36] tracking-wider">
                <Flame className="w-4 h-4" />
                <span>Verified Dish Recommendations</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-heading text-stone-900 tracking-tight">
                Real Dishes to Try ({displayedDishes.length})
              </h2>
            </div>

            <div className="text-xs text-stone-500 font-medium">
              Showing authentic counter prices without delivery app surcharges
            </div>
          </div>

          {/* Dish Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedDishes.map((dish, idx) => (
              <div
                key={dish.id}
                className={selectedHighlightDish === dish.id ? 'ring-4 ring-[#FF5A36] rounded-3xl' : ''}
              >
                <GuideDishCard dish={dish} rank={idx + 1} navigate={navigate} />
              </div>
            ))}
          </div>

          {displayedDishes.length === 0 && (
            <div className="bg-white rounded-3xl p-8 text-center border border-stone-200 space-y-2">
              <Utensils className="w-8 h-8 text-stone-300 mx-auto" />
              <p className="text-sm font-bold text-stone-700">No dishes match "{activeFilter}" right now.</p>
              <button
                onClick={() => setActiveFilter('All Cravings')}
                className="text-xs font-bold text-[#FF5A36] hover:underline"
              >
                Reset to All Cravings
              </button>
            </div>
          )}
        </section>

        {/* Featured Neighborhood Cafes */}
        {matchedRestaurants.length > 0 && (
          <section className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#FF5A36]">
                  Verified Dining Spots
                </span>
                <h3 className="text-xl sm:text-2xl font-black font-heading text-stone-900 tracking-tight">
                  Featured Cafes Serving These Dishes
                </h3>
              </div>
              <button
                onClick={() => navigate('/restaurants')}
                className="text-xs font-bold text-[#FF5A36] hover:underline hidden sm:flex items-center gap-1 cursor-pointer"
              >
                <span>View All 770+ Cafes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {matchedRestaurants.map((rest) => (
                <div
                  key={rest.id}
                  onClick={() => navigate(`/restaurant/${rest.slug}`)}
                  className="bg-stone-50 hover:bg-white rounded-2xl border border-stone-200/80 hover:border-[#FF5A36]/40 p-4 transition-all shadow-2xs hover:shadow-sm cursor-pointer group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-stone-900 group-hover:text-[#FF5A36] transition-colors truncate">
                        {rest.name}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                        Verified
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-stone-500">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{rest.address_line1 || rest.city || 'Delhi NCR'}</span>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-xs font-bold text-[#FF5A36]">
                      <span>View Menu & Prices</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FAQ Accordion */}
        <GuideFaqAccordion faqs={guide.faqs} />

        {/* Other Guides Carousel / Grid */}
        <section className="space-y-4 pt-4 border-t border-stone-200">
          <h3 className="text-lg sm:text-xl font-black font-heading text-stone-900">
            More Food Decision Guides
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {otherGuides.map((other) => (
              <div
                key={other.slug}
                onClick={() => navigate(`/guides/${other.slug}`)}
                className="bg-white rounded-2xl border border-stone-200/80 hover:border-[#FF5A36]/40 p-4 shadow-2xs hover:shadow-md transition-all cursor-pointer group space-y-2"
              >
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${other.badgeColor}`}>
                  {other.badge}
                </span>
                <h4 className="text-sm font-bold text-stone-900 group-hover:text-[#FF5A36] transition-colors line-clamp-2">
                  {other.title}
                </h4>
                <div className="flex items-center gap-1 text-xs font-bold text-[#FF5A36] pt-1">
                  <span>Read Guide</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default GuideDetail;
