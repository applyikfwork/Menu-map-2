import React from 'react';

export interface CravingStory {
  id: string;
  name: string;
  query: string;
  badge?: string;
  imageUrl: string;
  isSpecial?: boolean;
}

const STORIES: CravingStory[] = [
  {
    id: 'momos',
    name: 'Momos',
    query: 'Momos',
    badge: 'Popular',
    imageUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'coffee',
    name: 'Cold Coffee',
    query: 'Coffee',
    imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'pizza',
    name: 'Pizza Slices',
    query: 'Pizza',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'shakes',
    name: 'Thick Shakes',
    query: 'Shake',
    imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'burgers',
    name: 'Burgers',
    query: 'Burger',
    badge: '< ₹150',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'maggi',
    name: 'Cheesy Maggi',
    query: 'Maggi',
    imageUrl: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'pasta',
    name: 'White Sauce',
    query: 'Pasta',
    imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'waffles',
    name: 'Nutella Waffles',
    query: 'Waffle',
    imageUrl: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'rooftop',
    name: 'Rooftops',
    query: 'Rooftop',
    badge: 'Vibes',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&auto=format&fit=crop&q=80',
    isSpecial: true,
  },
  {
    id: 'latenight',
    name: 'Late Night',
    query: 'Late Night',
    badge: 'Midnight',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80',
    isSpecial: true,
  },
];

interface MealCravingStoriesProps {
  onSelectStory: (query: string) => void;
  className?: string;
}

export const MealCravingStories: React.FC<MealCravingStoriesProps> = ({
  onSelectStory,
  className = '',
}) => {
  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <div 
        className="flex items-center gap-3.5 sm:gap-5 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1"
        role="region"
        aria-label="Cravings quick discovery"
      >
        {STORIES.map((story) => (
          <button
            key={story.id}
            type="button"
            onClick={() => onSelectStory(story.query)}
            className="group shrink-0 flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer transition-transform active:scale-95 text-center"
          >
            {/* Story Ring Avatar Container */}
            <div className="relative">
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full p-[2.5px] transition-all duration-300 group-hover:scale-105 shadow-sm ${
                  story.isSpecial
                    ? 'bg-gradient-to-tr from-amber-500 via-[#FF5A36] to-purple-600'
                    : 'bg-gradient-to-tr from-[#FF5A36] to-amber-400 group-hover:from-emerald-500 group-hover:to-teal-400'
                }`}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-white p-[2px]">
                  <img
                    src={story.imageUrl}
                    alt={story.name}
                    className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Optional Micro Badge */}
              {story.badge && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-[#1C1917] text-white text-[9px] font-black tracking-tighter shadow-sm border border-white">
                  {story.badge}
                </span>
              )}
            </div>

            {/* Story Label */}
            <span className="text-[11px] sm:text-xs font-bold text-[#44403C] group-hover:text-[#1C1917] transition-colors truncate max-w-[70px] sm:max-w-[80px]">
              {story.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
