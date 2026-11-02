/**
 * Menu Maps Discovery - Food Story Article View (/discovery/stories/:slug)
 * Editorial reading experience for Delhi food culture, heritage, and neighbourhood guides.
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Clock,
  User,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Share2,
  BookOpen,
} from 'lucide-react';
import { discoveryApi } from '../lib/discoveryApi';
import { FoodStoryItem } from '../types/discovery';
import { DiscoveryNavbar } from '../components/DiscoveryNavbar';

interface FoodStoryDetailProps {
  slug: string;
  navigate: (path: string) => void;
}

export const FoodStoryDetail: React.FC<FoodStoryDetailProps> = ({ slug, navigate }) => {
  const [story, setStory] = useState<FoodStoryItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStory();
  }, [slug]);

  const loadStory = async () => {
    setLoading(true);
    try {
      const item = await discoveryApi.getFoodStoryBySlug(slug);
      setStory(item);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917]">
        <DiscoveryNavbar currentPath={`/discovery/stories/${slug}`} navigate={navigate} />
        <div className="py-24 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#0F766E] border-t-transparent animate-spin mx-auto mb-3" />
          <span className="text-xs text-stone-500 font-semibold">Loading story...</span>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917]">
        <DiscoveryNavbar currentPath={`/discovery/stories/${slug}`} navigate={navigate} />
        <div className="max-w-md mx-auto py-24 px-4 text-center">
          <h2 className="text-xl font-bold text-stone-900 mb-2">Story Not Found</h2>
          <p className="text-xs text-stone-500 mb-6">We could not locate this editorial food story.</p>
          <button
            onClick={() => navigate('/discovery/stories')}
            className="px-5 py-2.5 bg-[#0F766E] text-white text-xs font-bold rounded-xl"
          >
            Back to Stories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917]">
      <DiscoveryNavbar currentPath={`/discovery/stories/${slug}`} navigate={navigate} />

      {/* Article Header */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <button
          onClick={() => navigate('/discovery/stories')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Food Stories
        </button>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-900 text-xs font-bold uppercase tracking-wider border border-purple-200">
              {story.category}
            </span>
            <span className="text-xs text-stone-400">•</span>
            <span className="text-xs text-stone-500 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {story.reading_time_minutes} min read
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-stone-950 leading-[1.15]">
            {story.title}
          </h1>

          <p className="text-base sm:text-lg text-stone-600 font-serif italic leading-relaxed">
            {story.subtitle}
          </p>

          {story.contributor_attribution && (
            <div className="pt-2 pb-4 border-b border-stone-200/80 text-xs text-stone-500 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-teal-100 text-[#0F766E] font-bold flex items-center justify-center text-[10px]">
                ✍️
              </span>
              <span>{story.contributor_attribution}</span>
            </div>
          )}
        </div>

        {/* Feature Cover Image */}
        <div className="my-6 rounded-3xl overflow-hidden shadow-sm aspect-video bg-stone-900 border border-stone-200">
          <img
            src={story.cover_image_url}
            alt={story.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Article Body */}
        <div className="prose prose-stone max-w-none text-stone-800 text-sm sm:text-base leading-relaxed space-y-5 my-8">
          {story.content_paragraphs.map((para, i) => (
            <p key={i} className="leading-relaxed">
              {para}
            </p>
          ))}
        </div>

        {/* Featured Places Mentioned */}
        {story.featured_places && story.featured_places.length > 0 && (
          <div className="my-10 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-2xs space-y-4">
            <h3 className="font-serif text-xl font-bold text-stone-900">
              Places Mentioned in this Story
            </h3>
            <div className="divide-y divide-stone-100">
              {story.featured_places.map((place) => (
                <div key={place.name} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-stone-900">{place.name}</h4>
                    <p className="text-xs text-[#0F766E] font-medium">Signature: {place.dish}</p>
                    <p className="text-[11px] text-stone-400 mt-0.5">{place.address}</p>
                  </div>
                  {place.price && (
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-stone-900">₹{place.price}</span>
                      <span className="text-[10px] text-emerald-700 block font-medium">Counter Rate</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
};
