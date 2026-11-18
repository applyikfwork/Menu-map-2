import React, { useRef, useEffect } from 'react';

export interface CategoryTab {
  id: string;
  name: string;
  count?: number;
}

interface StickyCategoryBarProps {
  categories: CategoryTab[];
  activeCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  className?: string;
}

export const StickyCategoryBar: React.FC<StickyCategoryBarProps> = ({
  categories,
  activeCategoryId,
  onSelectCategory,
  className = ''
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeBtnRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll active pill into view within the horizontal strip
  useEffect(() => {
    if (activeBtnRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const btn = activeBtnRef.current;
      const containerLeft = container.getBoundingClientRect().left;
      const btnLeft = btn.getBoundingClientRect().left;
      const relativeLeft = btnLeft - containerLeft + container.scrollLeft;

      container.scrollTo({
        left: Math.max(0, relativeLeft - (container.clientWidth / 2) + (btn.clientWidth / 2)),
        behavior: 'smooth'
      });
    }
  }, [activeCategoryId]);

  if (!categories || categories.length === 0) return null;

  return (
    <div className={`sticky top-14 sm:top-16 z-30 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E7E2DA] py-2.5 px-3 sm:px-6 transition-all duration-200 ${className}`}>
      <div 
        ref={scrollContainerRef}
        className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth max-w-7xl mx-auto"
        role="tablist"
        aria-label="Menu categories"
      >
        {categories.map((cat) => {
          const isActive = cat.id === activeCategoryId;
          return (
            <button
              key={cat.id}
              ref={isActive ? activeBtnRef : null}
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelectCategory(cat.id)}
              className={`shrink-0 px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer select-none active:scale-95 ${
                isActive
                  ? 'bg-[#1C1917] text-white shadow-md shadow-stone-900/10'
                  : 'bg-white hover:bg-stone-100 text-[#44403C] border border-[#E7E2DA]'
              }`}
            >
              <span>{cat.name}</span>
              {typeof cat.count === 'number' && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                    isActive ? 'bg-white/20 text-white' : 'bg-stone-100 text-[#78716C]'
                  }`}
                >
                  {cat.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
