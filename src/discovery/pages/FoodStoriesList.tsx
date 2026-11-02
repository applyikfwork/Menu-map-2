/**
 * Menu Maps Discovery - Food Stories & Editorial Guides (/discovery/stories)
 * Deep-dive culinary culture stories, market history, and local food guides.
 */

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Clock,
  ArrowRight,
  User,
  Sparkles,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import { discoveryApi } from '../lib/discoveryApi';
import { FoodStoryItem } from '../types/discovery';
import { DiscoveryNavbar } from '../components/DiscoveryNavbar';

interface FoodStoriesListProps {
  navigate: (path: string) => void;
}

export const FoodStoriesList: React.FC<FoodStoriesListProps> = ({ navigate }) => {
  const [stories, setStories] = useState<FoodStoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    setLoading(true);
    try {
      const data = await discoveryApi.getFoodStories(true);
      setStories(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917]">
      <DiscoveryNavbar currentPath="/discovery/stories" navigate={navigate} />

      {/* Header Banner */}
      <section className="bg-gradient-to-b from-white to-[#FAF8F5] border-b border-[#E7E2DA]/80 pt-8 sm:pt-12 pb-8 sm:pb-12 px-4 sm:px-6 md:px-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-900 border border-purple-200">
              Food Culture & Guides
            </span>
            <span className="text-xs text-stone-400">•</span>
            <span className="text-xs text-stone-500 font-medium">Stories from the Streets</span>
          </div>

          <h1 className="hd text-3xl sm:text-5xl font-black text-[#1C1917] tracking-tight">
            Food Stories & Guides
          </h1>
          <p className="text-sm sm:text-base text-stone-600 mt-2 max-w-2xl leading-relaxed">
            Uncover the origins, legends, and culinary secrets behind Delhi’s most famous food streets and institutions. Documented by passionate local food explorers.
          </p>
        </div>
      </section>

      {/* Stories Grid */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 md:px-8 max-w-[1280px] mx-auto">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#0F766E] border-t-transparent animate-spin mx-auto mb-3" />
            <span className="text-xs text-stone-500 font-semibold">Loading editorial stories...</span>
          </div>
        ) : stories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {stories.map((story) => (
              <div
                key={story.id}
                onClick={() => navigate(`/discovery/stories/${story.slug}`)}
                className="bg-white rounded-3xl border border-[#E7E2DA] overflow-hidden shadow-2xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-48 sm:h-52 bg-stone-900 overflow-hidden">
                    <img
                      src={story.cover_image_url}
                      alt={story.title}
                      className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-stone-900 text-[10px] font-bold">
                        {story.category}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-4 right-4 text-white flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 font-medium text-stone-300">
                        <Clock className="w-3.5 h-3.5" /> {story.reading_time_minutes} min read
                      </span>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 space-y-2.5">
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 group-hover:text-[#0F766E] transition-colors leading-snug">
                      {story.title}
                    </h3>
                    <p className="text-xs text-stone-500 font-medium italic line-clamp-1">
                      {story.subtitle}
                    </p>
                    <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed mt-1">
                      {story.summary}
                    </p>
                  </div>
                </div>

                <div className="p-5 sm:p-6 pt-0 border-t border-stone-100 flex items-center justify-between text-xs mt-3">
                  <span className="text-[11px] text-stone-400 truncate max-w-[180px]">
                    {story.contributor_attribution || 'Menu Maps Editorial'}
                  </span>
                  <span className="text-[#0F766E] font-bold flex items-center gap-1">
                    <span>Read Story</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-stone-200 p-8">
            <BookOpen className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <h3 className="font-bold text-base text-stone-800">No stories published yet</h3>
            <p className="text-xs text-stone-500 mt-1">New neighbourhood stories are being reviewed.</p>
          </div>
        )}
      </section>
    </div>
  );
};
