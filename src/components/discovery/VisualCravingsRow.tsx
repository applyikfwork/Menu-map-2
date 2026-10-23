import React from 'react';
import { ArrowRight, Flame } from 'lucide-react';

interface CravingItem {
  id: string;
  name: string;
  query: string;
  emoji: string;
  tagline: string;
  imageUrl: string;
}

const CRAVINGS: CravingItem[] = [
  {
    id: 'momos',
    name: 'Momos',
    query: 'Momos',
    emoji: '🥟',
    tagline: 'Steamed, Kurkure & Gravy',
    imageUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'shakes',
    name: 'Thick Shakes',
    query: 'Shake',
    emoji: '🥤',
    tagline: 'Monster, Oreo & Belgian',
    imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'pizza',
    name: 'Woodfired Pizza',
    query: 'Pizza',
    emoji: '🍕',
    tagline: 'Neapolitan Slices',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'coffee',
    name: 'Cold Coffee & Brews',
    query: 'Coffee',
    emoji: '☕',
    tagline: 'Iced Latte & Pour Over',
    imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'naan',
    name: 'Chur Chur Naan',
    query: 'Naan',
    emoji: '🫓',
    tagline: 'Old Delhi Thalis',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'burgers',
    name: 'Gourmet Burgers',
    query: 'Burger',
    emoji: '🍔',
    tagline: 'Smash & Crispy Patty',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'fries',
    name: 'Loaded Fries',
    query: 'Fries',
    emoji: '🍟',
    tagline: 'Peri Peri & Cheesy',
    imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'pure-veg',
    name: 'Pure Veg Addas',
    query: 'Pure Veg',
    emoji: '🌿',
    tagline: '100% Vegetarian',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'desserts',
    name: 'Waffles & Bakes',
    query: 'Waffle',
    emoji: '🧇',
    tagline: 'Nutella & Cheesecakes',
    imageUrl: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'late-night',
    name: 'Late Night Cravings',
    query: 'Late Night',
    emoji: '🌙',
    tagline: 'Open Past 12 AM',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&auto=format&fit=crop&q=80',
  },
];

interface VisualCravingsRowProps {
  navigate: (path: string) => void;
  onSelectCraving?: (query: string) => void;
}

export const VisualCravingsRow: React.FC<VisualCravingsRowProps> = ({ navigate, onSelectCraving }) => {
  const handleItemClick = (query: string) => {
    if (onSelectCraving) {
      onSelectCraving(query);
    } else {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-8 py-8 text-left">
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#FF5A36] mb-1">
            <Flame className="w-3.5 h-3.5 fill-[#FF5A36]" />
            What are you craving today?
          </div>
          <h2 className="hd text-xl sm:text-3xl font-black text-[#1C1917] tracking-tight">
            Delhi's Most Popular Street &amp; Cafe Hits
          </h2>
        </div>

        <button
          type="button"
          onClick={() => navigate('/restaurants')}
          className="text-xs font-bold text-[#D8350F] hover:underline flex items-center gap-1 shrink-0 cursor-pointer hidden sm:flex"
        >
          <span>See all dishes</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Horizontal Carousel */}
      <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-3 pt-1 scroll-smooth snap-x snap-mandatory">
        {CRAVINGS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleItemClick(item.query)}
            className="group flex flex-col items-center shrink-0 w-24 sm:w-28 text-center cursor-pointer snap-start transition-all active:scale-95"
          >
            {/* Circular Thumbnail with Hover Ring */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-gradient-to-br from-orange-200 via-stone-200 to-amber-200 group-hover:from-[#FF5A36] group-hover:to-[#D8350F] transition-all duration-300 shadow-sm group-hover:shadow-md">
              <div className="w-full h-full rounded-full overflow-hidden bg-stone-100 relative">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                  onError={(e) => {
                    // Fallback to emoji if image fails
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform pointer-events-none drop-shadow-sm">
                  {item.emoji}
                </span>
              </div>
            </div>

            {/* Label */}
            <div className="mt-2.5 w-full">
              <h3 className="font-extrabold text-xs sm:text-sm text-[#1C1917] group-hover:text-[#D8350F] transition-colors truncate">
                {item.name}
              </h3>
              <p className="text-[10px] text-stone-500 font-medium truncate mt-0.5">
                {item.tagline}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
