import React, { useState, useEffect } from 'react';
import { Bookmark, Sparkles, ArrowRight, Navigation, Flame, Clock } from 'lucide-react';
import { Collection } from '../types/database';
import { isBookmarked, toggleBookmark } from '../lib/bookmarks';
import { AREA_FOOD_GUIDES } from '../lib/areaGuidesData';

interface CollectionCardProps {
  collection: Collection;
  itemCount?: number;
  userDistanceKm?: number;
  navigate: (path: string) => void;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
  itemCount = 0,
  userDistanceKm,
  navigate,
}) => {
  const [bookmarked, setBookmarked] = useState(false);

  // Enrich with area metadata if not directly attached
  const areaMeta = collection.area_metadata || 
    AREA_FOOD_GUIDES.find((g) => g.slug === collection.slug || g.id === collection.id)?.area_metadata;

  useEffect(() => {
    setBookmarked(isBookmarked('collection', collection.id));
  }, [collection.id]);

  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = toggleBookmark('collection', collection.id);
    setBookmarked(next);
  };

  return (
    <div
      onClick={() => navigate(`/iconic-area/${collection.slug}`)}
      className="group relative rounded-3xl overflow-hidden aspect-[4/3] sm:aspect-[16/11] cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-end p-5 sm:p-6 bg-stone-950 border border-stone-800/80"
    >
      {/* Background Image */}
      <img
        src={collection.cover_image_url}
        alt={collection.title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-80"
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).src =
            'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80';
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/10" />

      {/* Top Header Tags */}
      <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-black tracking-wide uppercase bg-white/20 backdrop-blur-md text-white border border-white/20 flex items-center gap-1 shadow-xs">
            <Flame className="w-3 h-3 text-amber-300 fill-amber-300" />
            {areaMeta?.zone || collection.type || 'Iconic Area'}
          </span>
          {typeof userDistanceKm === 'number' && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/90 text-white shadow-xs backdrop-blur-xs flex items-center gap-1">
              <span>📍 {userDistanceKm < 1 ? `${Math.round(userDistanceKm * 1000)}m` : `${userDistanceKm.toFixed(1)} km`}</span>
            </span>
          )}
        </div>

        <button
          onClick={handleBookmarkToggle}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-90 ${
            bookmarked
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-black/50 hover:bg-black/70 text-white backdrop-blur-xs'
          }`}
          title="Save collection"
        >
          <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-white' : ''}`} />
        </button>
      </div>

      {/* Content at Bottom */}
      <div className="relative z-10 space-y-2 text-white">
        {/* Vibe Badge */}
        {areaMeta?.vibe_badge && (
          <div className="inline-block px-2.5 py-0.5 rounded-lg bg-orange-500/90 backdrop-blur-xs text-[10px] sm:text-[11px] font-bold text-white shadow-xs line-clamp-1">
            🔥 {areaMeta.vibe_badge}
          </div>
        )}

        <h3 className="font-heading font-extrabold text-lg sm:text-2xl leading-tight group-hover:text-amber-300 transition-colors drop-shadow-md">
          {collection.title}
        </h3>

        {/* Famous dishes teaser */}
        {areaMeta?.famous_dishes && areaMeta.famous_dishes.length > 0 ? (
          <p className="text-[11px] sm:text-xs text-stone-200 line-clamp-1 drop-shadow-xs font-medium">
            <span className="text-amber-400 font-bold">Must-Eat:</span> {areaMeta.famous_dishes.slice(0, 3).map((d) => d.name).join(' • ')}
          </p>
        ) : (
          <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed drop-shadow-xs">
            {collection.description}
          </p>
        )}

        {/* Transit & Crawl Badges */}
        <div className="pt-1 flex items-center justify-between text-xs font-bold text-stone-300 border-t border-white/10">
          <div className="flex items-center gap-1.5 text-[11px] text-stone-300 truncate max-w-[190px]">
            {areaMeta?.nearest_metro ? (
              <>
                <Navigation className="w-3 h-3 text-rose-400 shrink-0" />
                <span className="truncate">{areaMeta.nearest_metro.split(',')[0]}</span>
              </>
            ) : (
              <span>{itemCount > 0 ? `${itemCount} verified cafes` : 'Curated Guide'}</span>
            )}
          </div>
          <span className="inline-flex items-center gap-1 text-amber-400 group-hover:translate-x-1 transition-transform shrink-0">
            <span>Explore Guide</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
