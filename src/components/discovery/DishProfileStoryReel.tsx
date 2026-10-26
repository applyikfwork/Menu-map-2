import React, { useRef } from 'react';
import { Sparkles, Flame, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { MenuItem } from '../../types/database';
import { getSmartDishImage } from '../../lib/dishImageRegistry';

export interface StoryDishGroup {
  id: string;
  canonicalName: string;
  sampleDish: MenuItem;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  restaurantCount: number;
  demandBadge?: string;
  demandPoints?: number;
  totalClicks?: number;
  isVeg: boolean;
}

interface DishProfileStoryReelProps {
  storyGroups: StoryDishGroup[];
  selectedGroupId: string | null;
  onSelectGroup: (group: StoryDishGroup) => void;
  activeLocationName: string;
}

export const DishProfileStoryReel: React.FC<DishProfileStoryReelProps> = ({
  storyGroups,
  selectedGroupId,
  onSelectGroup,
  activeLocationName,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!storyGroups || storyGroups.length === 0) return null;

  return (
    <div className="relative w-full bg-gradient-to-b from-[#FFF7ED]/70 via-[#FAF8F5] to-transparent pt-4 pb-6 border-b border-[#E7E2DA]/80">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5A36] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF5A36]"></span>
            </span>
            <h3 className="font-heading font-black text-sm sm:text-base text-[#1C1917] tracking-tight">
              Top Trending Cravings in <span className="text-[#FF5A36]">{activeLocationName}</span>
            </h3>
            <span className="text-[11px] font-bold text-stone-500 hidden sm:inline">
              • Tap any profile to compare restaurants
            </span>
          </div>

          {/* Desktop Arrow Controls */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="w-7 h-7 rounded-full bg-white border border-[#E7E2DA] hover:border-stone-400 text-stone-600 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="w-7 h-7 rounded-full bg-white border border-[#E7E2DA] hover:border-stone-400 text-stone-600 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Profile Story Avatar Reel */}
        <div
          ref={scrollContainerRef}
          className="flex items-start gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth py-1 px-0.5"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {storyGroups.map((group, index) => {
            const isSelected = selectedGroupId === group.id;
            const imageUrl = getSmartDishImage(
              group.canonicalName,
              group.sampleDish.category_id || '',
              group.sampleDish.image_url
            );

            return (
              <button
                key={group.id}
                type="button"
                onClick={() => onSelectGroup(group)}
                className="group flex flex-col items-center shrink-0 w-[78px] sm:w-[94px] cursor-pointer focus:outline-none transition-transform active:scale-95 text-center"
              >
                {/* Circular Profile Avatar Container */}
                <div className="relative">
                  {/* Glowing Animated Gradient Ring */}
                  <div
                    className={`rounded-full p-[2.5px] transition-all duration-300 ${
                      isSelected
                        ? 'bg-gradient-to-tr from-[#FF5A36] via-[#F59E0B] to-[#D8350F] shadow-[0_0_14px_rgba(255,90,54,0.45)] scale-105'
                        : 'bg-gradient-to-tr from-amber-400/80 via-orange-400/60 to-rose-400/80 group-hover:from-[#FF5A36] group-hover:to-[#F59E0B] group-hover:scale-105'
                    }`}
                  >
                    <div className="w-[66px] h-[66px] sm:w-[78px] sm:h-[78px] rounded-full overflow-hidden bg-stone-900 border-2 border-white relative shadow-sm">
                      <img
                        src={imageUrl}
                        alt={group.canonicalName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                      {/* Dark gradient overlay for text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity" />
                    </div>
                  </div>

                  {/* Micro Badge Overlay (Top rank or Price) */}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap">
                    {index === 0 ? (
                      <span className="px-1.5 py-0.5 rounded-full bg-[#D8350F] text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 shadow-xs">
                        <Flame className="w-2.5 h-2.5 fill-current" />
                        <span>#1 Hot</span>
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded-full bg-[#1C1917] text-amber-300 border border-amber-400/40 text-[9px] font-extrabold shadow-xs">
                        ₹{group.minPrice}+
                      </span>
                    )}
                  </div>
                </div>

                {/* Dish Name Underneath */}
                <span
                  className={`mt-2.5 text-xs font-bold leading-tight line-clamp-2 max-w-[86px] transition-colors ${
                    isSelected ? 'text-[#D8350F] font-black' : 'text-[#1C1917] group-hover:text-[#FF5A36]'
                  }`}
                >
                  {group.canonicalName}
                </span>

                {/* Restaurant Availability Count & Starting Price */}
                <span className="text-[10px] text-stone-500 font-semibold mt-0.5">
                  {group.restaurantCount} {group.restaurantCount === 1 ? 'cafe' : 'cafes'} • ₹{group.minPrice}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
