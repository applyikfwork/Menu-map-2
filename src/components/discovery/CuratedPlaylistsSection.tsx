import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Flame, Moon, Wallet } from 'lucide-react';
import { Restaurant } from '../../types/database';
import { RestaurantCard } from '../RestaurantCard';
import { calculateDistanceKm, GeoCoordinates } from '../../lib/location';

interface CuratedShelfProps {
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ReactNode;
  restaurants: Restaurant[];
  navigate: (path: string) => void;
  userCoords?: GeoCoordinates | null;
  onViewAll?: () => void;
}

const ShelfRow: React.FC<CuratedShelfProps> = ({
  title,
  subtitle,
  badge,
  icon,
  restaurants,
  navigate,
  userCoords,
  onViewAll,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -380 : 380;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  if (restaurants.length === 0) return null;

  return (
    <div className="py-6 border-b border-[#E7E2DA]/60 last:border-b-0 text-left">
      {/* Shelf Header */}
      <div className="flex items-end justify-between gap-4 mb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#FF5A36] mb-1">
            {icon}
            <span>{badge}</span>
          </div>
          <h3 className="hd text-xl sm:text-2xl font-black text-[#1C1917] tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-[#78716C] font-medium mt-0.5">
            {subtitle}
          </p>
        </div>

        {/* Action chevrons + View all */}
        <div className="flex items-center gap-2">
          {onViewAll && (
            <button
              type="button"
              onClick={onViewAll}
              className="text-xs font-bold text-[#D8350F] hover:underline mr-1 hidden sm:inline"
            >
              See all ({restaurants.length})
            </button>
          )}

          <button
            type="button"
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full bg-white hover:bg-stone-50 border border-[#E7E2DA] flex items-center justify-center text-stone-700 shadow-xs cursor-pointer active:scale-95 transition-all hidden sm:flex"
            title="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full bg-white hover:bg-stone-50 border border-[#E7E2DA] flex items-center justify-center text-stone-700 shadow-xs cursor-pointer active:scale-95 transition-all hidden sm:flex"
            title="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Shelf Scroll Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-3 pt-1 scroll-smooth snap-x snap-mandatory"
      >
        {restaurants.slice(0, 8).map((restaurant) => {
          const userDist = userCoords
            ? calculateDistanceKm(userCoords.latitude, userCoords.longitude, restaurant.latitude, restaurant.longitude)
            : undefined;

          return (
            <div
              key={restaurant.id}
              className="w-[280px] sm:w-[320px] shrink-0 snap-start"
            >
              <RestaurantCard
                restaurant={restaurant}
                navigate={navigate}
                userDistanceKm={userDist}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface CuratedPlaylistsSectionProps {
  restaurants: Restaurant[];
  activeAreaName: string;
  navigate: (path: string) => void;
  userCoords?: GeoCoordinates | null;
}

export const CuratedPlaylistsSection: React.FC<CuratedPlaylistsSectionProps> = ({
  restaurants,
  activeAreaName,
  navigate,
  userCoords,
}) => {
  // Playlist 1: In the Spotlight / Top Rated
  const spotlightCafes = React.useMemo(() => {
    return [...restaurants]
      .filter((r) => r.rating_avg >= 4.3 || r.is_featured)
      .sort((a, b) => b.rating_avg - a.rating_avg);
  }, [restaurants]);

  // Playlist 2: Pocket-Friendly Student Addas (Cost for two <= 400)
  const budgetCafes = React.useMemo(() => {
    return restaurants.filter((r) => (r.average_cost_for_two || 500) <= 400);
  }, [restaurants]);

  // Playlist 3: Late Night Addas
  const lateNightCafes = React.useMemo(() => {
    return restaurants.filter((r) => {
      return (
        r.meal_types?.includes('Late Night') ||
        r.best_for_tags?.some((t) => /late/i.test(t)) ||
        r.facilities?.some((f) => /24|night|late/i.test(f))
      );
    });
  }, [restaurants]);

  return (
    <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-8 py-8">
      {/* Shelf 1 */}
      <ShelfRow
        title={`Spotlight Counters in ${activeAreaName}`}
        subtitle="Highest-rated dining spots with 100% verified printed menus & direct prices."
        badge="Top Rated & Verified"
        icon={<Flame className="w-3.5 h-3.5 fill-[#FF5A36]" />}
        restaurants={spotlightCafes}
        navigate={navigate}
        userCoords={userCoords}
        onViewAll={() => navigate('/restaurants')}
      />

      {/* Shelf 2 */}
      <ShelfRow
        title="Pocket-Friendly DU & Student Legends"
        subtitle="Verified cafe menus under ₹400 for two — maximum taste, zero surprise surcharge."
        badge="Budget Friendly"
        icon={<Wallet className="w-3.5 h-3.5" />}
        restaurants={budgetCafes}
        navigate={navigate}
        userCoords={userCoords}
        onViewAll={() => navigate('/restaurants')}
      />

      {/* Shelf 3 */}
      {lateNightCafes.length > 0 && (
        <ShelfRow
          title="Midnight Cravings & Late-Night Addas"
          subtitle="Spots verified open past 11:00 PM with exact counter pricing."
          badge="Open Late"
          icon={<Moon className="w-3.5 h-3.5" />}
          restaurants={lateNightCafes}
          navigate={navigate}
          userCoords={userCoords}
          onViewAll={() => navigate('/restaurants')}
        />
      )}
    </section>
  );
};
