import React, { useState, useEffect } from 'react';
import { Bookmark, Compass, Utensils, Sparkles, Trash2, ArrowRight } from 'lucide-react';
import { Restaurant, MenuItem, Collection } from '../types/database';
import { api } from '../lib/supabase';
import { getBookmarks, clearAllBookmarks } from '../lib/bookmarks';
import { RestaurantCard } from '../components/RestaurantCard';
import { FoodItemCard } from '../components/FoodItemCard';
import { CollectionCard } from '../components/CollectionCard';
import { useToast } from '../components/Toast';

interface BookmarksProps {
  navigate: (path: string) => void;
}

type BookmarkTab = 'restaurants' | 'dishes' | 'collections';

export const Bookmarks: React.FC<BookmarksProps> = ({ navigate }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<BookmarkTab>('restaurants');
  const [loading, setLoading] = useState(true);

  const [bookmarkedRestaurants, setBookmarkedRestaurants] = useState<Restaurant[]>([]);
  const [bookmarkedDishes, setBookmarkedDishes] = useState<MenuItem[]>([]);
  const [bookmarkedCollections, setBookmarkedCollections] = useState<Collection[]>([]);
  const [restaurantsMap, setRestaurantsMap] = useState<Record<string, Restaurant>>({});

  useEffect(() => {
    loadSavedData();
    window.addEventListener('menumap_bookmarks_updated', loadSavedData);
    return () => window.removeEventListener('menumap_bookmarks_updated', loadSavedData);
  }, []);

  const loadSavedData = async () => {
    setLoading(true);
    try {
      const store = getBookmarks();
      const [allRests, allDishes, allCols] = await Promise.all([
        api.getRestaurants(false),
        api.getMenuItems(),
        api.getCollections(false),
      ]);

      const rMap: Record<string, Restaurant> = {};
      allRests.forEach((r) => (rMap[r.id] = r));
      setRestaurantsMap(rMap);

      setBookmarkedRestaurants(allRests.filter((r) => store.restaurants.includes(r.id)));
      setBookmarkedDishes(allDishes.filter((d) => store.dishes.includes(d.id)));
      setBookmarkedCollections(allCols.filter((c) => store.collections.includes(c.id)));
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all your saved bookmarks?')) {
      clearAllBookmarks();
      showToast('All bookmarks cleared.', 'info');
    }
  };

  const totalCount =
    bookmarkedRestaurants.length + bookmarkedDishes.length + bookmarkedCollections.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header with Editorial Branding */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EFEAE2]">
        <div>
          <span className="eyebrow text-[#FF5A36] flex items-center gap-1.5">
            <Bookmark className="w-3.5 h-3.5 fill-[#FF5A36]" />
            <span>Private & Offline Vault • Zero Tracking</span>
          </span>
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-[#1C1917] tracking-tight mt-1">
            My Saved Counter Menus
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-sans mt-0.5">
            Easily access your favorite cafes, signature dishes, and iconic neighborhood guides.
          </p>
        </div>

        {totalCount > 0 && (
          <button
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-rose-50 text-stone-600 hover:text-rose-600 border border-[#EFEAE2] hover:border-rose-200 text-xs font-bold transition-all self-start sm:self-center"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Vault</span>
          </button>
        )}
      </div>

      {/* Segmented Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('restaurants')}
          className={`chipl ${activeTab === 'restaurants' ? 'on' : ''}`}
        >
          <Compass className="w-4 h-4 text-[#FF5A36]" />
          <span>Places ({bookmarkedRestaurants.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('dishes')}
          className={`chipl ${activeTab === 'dishes' ? 'on' : ''}`}
        >
          <Utensils className="w-4 h-4 text-[#0F766E]" />
          <span>Dishes ({bookmarkedDishes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('collections')}
          className={`chipl ${activeTab === 'collections' ? 'on' : ''}`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Area Guides ({bookmarkedCollections.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="py-20 text-center text-sm font-semibold text-stone-400">
          Loading your saved vault items...
        </div>
      ) : activeTab === 'restaurants' ? (
        bookmarkedRestaurants.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bookmarkedRestaurants.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} navigate={navigate} />
            ))}
          </div>
        ) : (
          <div className="bg-white border-2 border-dashed border-[#EFEAE2] rounded-3xl p-14 sm:p-18 text-center space-y-4 shadow-2xs">
            <div className="w-16 h-16 rounded-full bg-[#FAF8F5] text-stone-400 border border-[#EFEAE2] flex items-center justify-center mx-auto">
              <Compass className="w-8 h-8" />
            </div>
            <h3 className="font-heading font-black text-2xl text-[#1C1917]">
              No saved restaurants
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto font-sans">
              Tap the bookmark icon on any cafe card across Delhi to save it here for quick counter access.
            </p>
            <button
              onClick={() => navigate('/restaurants')}
              className="btn bg-[#FF5A36] hover:bg-[#D8350F] text-white shadow-md text-xs font-bold"
            >
              <span>Explore Delhi Cafes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )
      ) : activeTab === 'dishes' ? (
        bookmarkedDishes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bookmarkedDishes.map((dish) => (
              <FoodItemCard
                key={dish.id}
                item={dish}
                restaurant={restaurantsMap[dish.restaurant_id]}
                navigate={navigate}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border-2 border-dashed border-[#EFEAE2] rounded-3xl p-14 sm:p-18 text-center space-y-4 shadow-2xs">
            <div className="w-16 h-16 rounded-full bg-[#FAF8F5] text-stone-400 border border-[#EFEAE2] flex items-center justify-center mx-auto">
              <Utensils className="w-8 h-8" />
            </div>
            <h3 className="font-heading font-black text-2xl text-[#1C1917]">
              No saved dishes
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto font-sans">
              Save trending pizzas, momos, rolls, coffees, or shakes to view their direct counter prices anytime.
            </p>
            <button
              onClick={() => navigate('/search')}
              className="btn bg-[#FF5A36] hover:bg-[#D8350F] text-white shadow-md text-xs font-bold"
            >
              <span>Discover Dishes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )
      ) : bookmarkedCollections.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarkedCollections.map((col) => (
            <CollectionCard key={col.id} collection={col} navigate={navigate} />
          ))}
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-[#EFEAE2] rounded-3xl p-14 sm:p-18 text-center space-y-4 shadow-2xs">
          <div className="w-16 h-16 rounded-full bg-[#FAF8F5] text-stone-400 border border-[#EFEAE2] flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8 text-amber-500" />
          </div>
          <h3 className="font-heading font-black text-2xl text-[#1C1917]">
            No saved neighborhood guides
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto font-sans">
            Bookmark entire foodie hubs like Majnu Ka Tila, Hudson Lane, or Connaught Place with one click.
          </p>
          <button
            onClick={() => navigate('/iconic-area')}
            className="btn bg-[#FF5A36] hover:bg-[#D8350F] text-white shadow-md text-xs font-bold"
          >
            <span>Browse Iconic Areas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
};
