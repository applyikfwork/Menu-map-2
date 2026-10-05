import React, { useState, useEffect } from 'react';
import { Bookmark, Flame, ArrowRight, Navigation, MapPin } from 'lucide-react';
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
      className="group relative rounded-3xl overflow-hidden aspect-[4/3] sm:aspect-[16/11] cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-end p-5 sm:p-6 bg-[#14110F] border border-stone-800/80 lift"
    >
      {/* Background Image with Rich Color & Smooth Zoom */}
      <img
        src={collection.cover_image_url}
        alt={collection.title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-75 group-hover:opacity-85"
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).src =
            'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80';
        }}
      />
      
      {/* Editorial High-Contrast Gradient Backdrop */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#14110F] via-[#14110F]/70 to-black/25" />

      {/* Top Header Tags */}
      <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black tracking-wider uppercase bg-black/60 backdrop-blur-md text-white border border-white/20 flex items-center gap-1.5 shadow-xs">
            <Flame className="w-3 h-3 text-[#FF5A36] fill-[#FF5A36]" />
            <span>{areaMeta?.zone || collection.type || 'Iconic Food Hub'}</span>
          </span>

          {typeof userDistanceKm === 'number' && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#0F766E]/90 text-white shadow-xs backdrop-blur-md flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5" />
              <span>{userDistanceKm < 1 ? `${Math.round(userDistanceKm * 1000)}m` : `${userDistanceKm.toFixed(1)} km`}</span>
            </span>
          )}
        </div>

        {/* Bookmark Button */}
        <button
          onClick={handleBookmarkToggle}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform active:scale-90 ${
            bookmarked
              ? 'bg-[#FF5A36] text-white shadow-md'
              : 'bg-black/50 hover:bg-black/75 text-white backdrop-blur-sm border border-white/15'
          }`}
          title="Save food guide"
        >
          <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-white' : ''}`} />
        </button>
      </div>

      {/* Content at Bottom */}
      <div className="relative z-10 space-y-2 text-white">
        {/* Vibe Badge */}
        {areaMeta?.vibe_badge && (
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FF5A36] backdrop-blur-xs text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-white shadow-xs">
            <span>🔥</span>
            <span>{areaMeta.vibe_badge}</span>
          </div>
        )}

        {/* Title */}
        <h3 className="font-heading font-black text-xl sm:text-2xl leading-tight group-hover:text-[#FF8A6B] transition-colors drop-shadow-md tracking-tight">
          {collection.title}
        </h3>

        {/* Famous dishes teaser */}
        {areaMeta?.famous_dishes && areaMeta.famous_dishes.length > 0 ? (
          <p className="text-xs text-stone-200 line-clamp-1 drop-shadow-xs font-medium">
            <span className="text-[#FF8A6B] font-bold">Must-Eat:</span>{' '}
            {areaMeta.famous_dishes.slice(0, 3).map((d) => d.name).join(' • ')}
          </p>
        ) : (
          <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed drop-shadow-xs">
            {collection.description}
          </p>
        )}

        {/* Transit & Guide Link Bar */}
        <div className="pt-2 flex items-center justify-between text-xs font-bold text-stone-300 border-t border-white/15">
          <div className="flex items-center gap-1.5 text-xs text-stone-300 truncate max-w-[200px]">
            {areaMeta?.nearest_metro ? (
              <>
                <Navigation className="w-3.5 h-3.5 text-[#FF8A6B] shrink-0" />
                <span className="truncate">{areaMeta.nearest_metro.split(',')[0]} Metro</span>
              </>
            ) : (
              <span>{itemCount > 0 ? `${itemCount} verified cafes` : 'Curated Area Guide'}</span>
            )}
          </div>

          <span className="inline-flex items-center gap-1 text-[#FF8A6B] group-hover:text-white transition-colors group-hover:translate-x-1 duration-200 shrink-0">
            <span>Explore Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
