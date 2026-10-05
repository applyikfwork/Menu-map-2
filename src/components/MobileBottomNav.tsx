import React, { useState, useEffect } from 'react';
import { Home, Compass, MapPin, Bookmark, Sparkles } from 'lucide-react';
import { getBookmarks } from '../lib/bookmarks';

interface MobileBottomNavProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentPath, navigate }) => {
  const isHome = currentPath === '/' || currentPath === '';
  const isExplore = currentPath === '/restaurants' || currentPath.startsWith('/restaurant/');
  const isGuides = currentPath === '/iconic-area' || currentPath === '/iconic-areas' || currentPath.startsWith('/iconic-area/') || currentPath === '/collections';
  const isSaved = currentPath === '/bookmarks';

  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    const update = () => {
      const b = getBookmarks();
      setSavedCount(b.restaurants.length + b.dishes.length + b.collections.length);
    };
    update();
    window.addEventListener('menumap_bookmarks_updated', update);
    return () => window.removeEventListener('menumap_bookmarks_updated', update);
  }, []);

  const navItems = [
    {
      label: 'Home',
      icon: Home,
      path: '/',
      active: isHome,
    },
    {
      label: 'Explore',
      icon: Compass,
      path: '/restaurants',
      active: isExplore,
    },
    {
      label: 'Guides',
      icon: Sparkles,
      path: '/iconic-area',
      active: isGuides,
    },
    {
      label: 'Saved',
      icon: Bookmark,
      path: '/bookmarks',
      active: isSaved,
      badge: savedCount,
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-t border-[#E7E2DA] flex items-center justify-around px-2 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]"
      style={{
        paddingTop: '8px',
        paddingBottom: 'max(10px, env(safe-area-inset-bottom))',
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 text-[11px] font-bold transition-all active:scale-95 relative cursor-pointer ${
              item.active
                ? 'text-[#FF5A36]'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5 stroke-[2.2]" />
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-[#FF5A36] text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                  {item.badge}
                </span>
              )}
            </div>
            <span>{item.label}</span>
            {item.active && (
              <span className="w-1 h-1 rounded-full bg-[#FF5A36] -mt-0.5" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
