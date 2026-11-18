import React, { useRef } from 'react';
import { 
  Compass, 
  Leaf, 
  Tag, 
  Star, 
  Clock, 
  Train, 
  Flame, 
  Check
} from 'lucide-react';

export interface FilterOption {
  id: string;
  label: string;
  icon?: 'near' | 'veg' | 'budget' | 'rating' | 'open' | 'metro' | 'trending';
  active: boolean;
}

interface QuickFilterPillsProps {
  filters: FilterOption[];
  onToggle: (id: string) => void;
  className?: string;
}

export const QuickFilterPills: React.FC<QuickFilterPillsProps> = ({
  filters,
  onToggle,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const renderIcon = (icon?: FilterOption['icon'], active?: boolean) => {
    const iconClass = `w-3.5 h-3.5 shrink-0 ${active ? 'text-white' : 'text-[#FF5A36]'}`;
    switch (icon) {
      case 'near':
        return <Compass className={iconClass} />;
      case 'veg':
        return <Leaf className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-white' : 'text-emerald-600'}`} />;
      case 'budget':
        return <Tag className={iconClass} />;
      case 'rating':
        return <Star className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-white fill-white' : 'text-amber-500 fill-amber-500'}`} />;
      case 'open':
        return <Clock className={iconClass} />;
      case 'metro':
        return <Train className={iconClass} />;
      case 'trending':
        return <Flame className={iconClass} />;
      default:
        return null;
    }
  };

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <div 
        ref={containerRef}
        className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1"
        role="group"
        aria-label="Quick filters"
      >
        {filters.map((filter) => {
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => onToggle(filter.id)}
              className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer select-none active:scale-95 ${
                filter.active
                  ? 'bg-[#1C1917] text-white border border-[#1C1917] shadow-sm'
                  : 'bg-white hover:bg-stone-50 text-[#44403C] border border-[#E7E2DA] hover:border-[#FF5A36]/40'
              }`}
              aria-pressed={filter.active}
            >
              {filter.active ? (
                <Check className="w-3.5 h-3.5 text-[#2DD4BF] shrink-0" />
              ) : (
                renderIcon(filter.icon, filter.active)
              )}
              <span>{filter.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
