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
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-rose-600">
            <Bookmark className="w-4 h-4 fill-rose-600" />
            <span>Saved Offline & Private</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight mt-1">
            My Bookmarks
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Easily access your favorite cafes, curated collections, and must-try dishes.
          </p>
        </div>

        {totalCount > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-stone-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-bold transition-colors self-start sm:self-center"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
        <button
          onClick={() => setActiveTab('restaurants')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'restaurants'
              ? 'bg-rose-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-stone-100'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Places ({bookmarkedRestaurants.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('dishes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'dishes'
              ? 'bg-rose-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-stone-100'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Dishes ({bookmarkedDishes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('collections')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'collections'
              ? 'bg-rose-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-stone-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Collections ({bookmarkedCollections.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="p-12 text-center text-sm text-slate-400">Loading your saved items...</div>
      ) : activeTab === 'restaurants' ? (
        bookmarkedRestaurants.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bookmarkedRestaurants.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} navigate={navigate} />
            ))}
          </div>
        ) : (
          <div className="bg-stone-50 border-2 border-dashed border-stone-200 rounded-3xl p-16 text-center space-y-4">
            <Compass className="w-12 h-12 text-stone-400 mx-auto" />
            <h3 className="font-heading font-extrabold text-xl text-slate-800">
              No saved restaurants
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              Tap the bookmark icon on any cafe or restaurant card to save it here for quick access.
            </p>
            <button
              onClick={() => navigate('/restaurants')}
              className="px-5 py-2.5 bg-rose-500 text-white font-bold rounded-2xl text-xs shadow-md"
            >
              Explore Cafes
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
          <div className="bg-stone-50 border-2 border-dashed border-stone-200 rounded-3xl p-16 text-center space-y-4">
            <Utensils className="w-12 h-12 text-stone-400 mx-auto" />
            <h3 className="font-heading font-extrabold text-xl text-slate-800">
              No saved dishes
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              Save trending pastas, desserts, coffees, or pizzas to plan your next order.
            </p>
            <button
              onClick={() => navigate('/search')}
              className="px-5 py-2.5 bg-rose-500 text-white font-bold rounded-2xl text-xs shadow-md"
            >
              Discover Dishes
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
        <div className="bg-stone-50 border-2 border-dashed border-stone-200 rounded-3xl p-16 text-center space-y-4">
          <Sparkles className="w-12 h-12 text-stone-400 mx-auto" />
          <h3 className="font-heading font-extrabold text-xl text-slate-800">
            No saved iconic area guides
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            Browse our living neighborhood food guides and bookmark entire areas with one click.
          </p>
          <button
            onClick={() => navigate('/iconic-area')}
            className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl text-xs shadow-md transition-colors cursor-pointer"
          >
            Browse Iconic Areas
          </button>
        </div>
      )}

    </div>
  );
};
