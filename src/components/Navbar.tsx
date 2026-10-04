import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Search, 
  Bookmark, 
  Compass, 
  Sparkles, 
  Flame,
  Menu, 
  X,
  Crosshair
} from 'lucide-react';
import { MenuMapLogo } from './Logo';
import { getBookmarks } from '../lib/bookmarks';
import { getUserLocation, getCachedUserCoordinates, saveCachedUserCoordinates, getNearestAreaName } from '../lib/location';
import { api } from '../lib/supabase';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
  city?: string;
  onDetectLocation?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate, city = 'Delhi NCR', onDetectLocation }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [locating, setLocating] = useState(false);
  const [liveLocationName, setLiveLocationName] = useState<string>(city);

  const updateCounts = () => {
    const store = getBookmarks();
    const count = store.restaurants.length + store.dishes.length + store.collections.length;
    setBookmarkCount(count);
  };

  const resolveAreaFromCoords = async (coords: { latitude: number; longitude: number }) => {
    try {
      const rests = await api.getRestaurants();
      const area = getNearestAreaName(coords, rests);
      if (area && area !== 'Delhi NCR') {
        setLiveLocationName(area);
      }
    } catch (e) {}
  };

  useEffect(() => {
    updateCounts();
    window.addEventListener('menumap_bookmarks_updated', updateCounts);

    const cached = getCachedUserCoordinates();
    if (cached) {
      resolveAreaFromCoords(cached);
    }

    const handleLocationUpdate = (e: any) => {
      if (e.detail) {
        resolveAreaFromCoords(e.detail);
      }
    };
    window.addEventListener('menumap_location_updated', handleLocationUpdate);

    return () => {
      window.removeEventListener('menumap_bookmarks_updated', updateCounts);
      window.removeEventListener('menumap_location_updated', handleLocationUpdate);
    };
  }, []);

  const handleLocateClick = async () => {
    if (onDetectLocation) {
      onDetectLocation();
      return;
    }
    setLocating(true);
    try {
      const coords = await getUserLocation();
      saveCachedUserCoordinates(coords);
      window.dispatchEvent(new CustomEvent('menumap_location_updated', { detail: coords }));
      await resolveAreaFromCoords(coords);
    } catch (e) {
      console.warn('Geolocation blocked or unavailable');
    } finally {
      setLocating(false);
    }
  };

  const navLinks = [
    { label: 'Explore & Near Me', path: '/restaurants', icon: Compass },
    { label: 'Iconic Area Guides', path: '/iconic-area', icon: Flame },
  ];

  const isLinkActive = (path: string) => {
    if (path === '/restaurants') {
      return currentPath === '/restaurants' || currentPath === '/nearby';
    }
    if (path === '/iconic-area') {
      return (
        currentPath === '/iconic-area' ||
        currentPath === '/iconic-areas' ||
        currentPath.startsWith('/iconic-area/') ||
        currentPath.startsWith('/iconic-areas/') ||
        currentPath === '/collections' ||
        currentPath.startsWith('/collection/')
      );
    }
    return currentPath === path;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-4">
          
          {/* Brand Logo & Location */}
          <div className="flex items-center gap-2.5 sm:gap-4 shrink-0 min-w-0">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2.5 text-left group transition-transform active:scale-95 cursor-pointer shrink-0"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white p-1 shadow-md shadow-orange-500/15 border border-orange-100 flex items-center justify-center group-hover:rotate-6 transition-transform">
                <MenuMapLogo className="w-full h-full" />
              </div>
              <div>
                <span className="font-heading font-extrabold text-xl sm:text-2xl tracking-tight bg-gradient-to-r from-rose-600 via-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Menu Map
                </span>
                <span className="hidden sm:block text-[10px] uppercase font-bold tracking-widest text-slate-500 -mt-1">
                  Real Menus & Cafes
                </span>
              </div>
            </button>

            {/* City & Geolocation pill */}
            <div className="hidden md:flex items-center bg-stone-100/90 hover:bg-stone-200/70 transition-colors rounded-full px-3 py-1.5 text-xs font-semibold text-slate-700 gap-1.5 border border-stone-200 shrink-0">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="max-w-[110px] xl:max-w-[140px] truncate" title={liveLocationName}>{liveLocationName}</span>
              <button
                onClick={handleLocateClick}
                disabled={locating}
                title="Automatically detect live GPS location"
                className="text-orange-600 hover:text-orange-700 flex items-center gap-1 pl-1.5 border-l border-stone-300 cursor-pointer"
              >
                <Crosshair className={`w-3 h-3 shrink-0 ${locating ? 'animate-spin' : ''}`} />
                <span className="text-[11px] whitespace-nowrap">{locating ? 'Locating...' : 'Live GPS'}</span>
              </button>
            </div>
          </div>

          {/* Quick Search Bar Trigger (Compact, sleek & never overflows) */}
          {currentPath !== '/search' && (
            <div className="hidden lg:flex items-center min-w-0 max-w-[210px] xl:max-w-[260px] shrink mx-1">
              <button
                onClick={() => navigate('/search')}
                className="w-full h-9 flex items-center justify-between px-3 bg-stone-100/90 hover:bg-white text-slate-500 hover:text-slate-800 text-xs rounded-full border border-stone-200/90 shadow-2xs hover:border-orange-300 hover:shadow-xs transition-all group cursor-pointer"
                title="Search cafes, cuisines or dishes"
              >
                <div className="flex items-center gap-2 min-w-0 pr-1">
                  <Search className="w-3.5 h-3.5 text-orange-500 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="truncate font-medium text-slate-500">Search cafes, dishes...</span>
                </div>
                <kbd className="hidden xl:inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold text-slate-400 bg-white border border-stone-200 rounded shrink-0">
                  Search
                </kbd>
              </button>
            </div>
          )}

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2 shrink-0">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = isLinkActive(link.path);
              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-rose-50 text-rose-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-stone-100/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-rose-600' : 'text-slate-500'}`} />
                  <span>{link.label}</span>
                </button>
              );
            })}

            {/* Bookmarks */}
            <button
              onClick={() => navigate('/bookmarks')}
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                currentPath === '/bookmarks'
                  ? 'bg-rose-50 text-rose-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-stone-100/80'
              }`}
            >
              <Bookmark className={`w-4 h-4 shrink-0 ${currentPath === '/bookmarks' ? 'text-rose-600 fill-rose-600' : 'text-slate-500'}`} />
              <span>Saved</span>
              {bookmarkCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-black rounded-full bg-rose-500 text-white">
                  {bookmarkCount}
                </span>
              )}
            </button>
          </nav>

          {/* Mobile Actions: Search icon & Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => navigate('/search')}
              className="p-2 rounded-xl text-slate-600 hover:bg-stone-100 active:scale-95 transition-transform"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-orange-600" />
            </button>

            <button
              onClick={() => navigate('/bookmarks')}
              className="relative p-2 rounded-xl text-slate-600 hover:bg-stone-100 active:scale-95 transition-transform"
              aria-label="Bookmarks"
            >
              <Bookmark className="w-5 h-5" />
              {bookmarkCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-stone-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-2 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 px-2 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>Location: {city}</span>
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLocateClick();
              }}
              className="text-orange-600 font-bold flex items-center gap-1"
            >
              <Crosshair className="w-3.5 h-3.5" />
              Detect
            </button>
          </div>

          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = isLinkActive(link.path);
            return (
              <button
                key={link.path}
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate(link.path);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-left transition-colors ${
                  isActive ? 'bg-rose-50 text-rose-600' : 'text-slate-700 hover:bg-stone-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-rose-600' : 'text-slate-500'}`} />
                <span>{link.label}</span>
              </button>
            );
          })}

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              navigate('/bookmarks');
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold text-left transition-colors ${
              currentPath === '/bookmarks' ? 'bg-rose-50 text-rose-600' : 'text-slate-700 hover:bg-stone-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bookmark className="w-5 h-5 text-slate-500" />
              <span>Saved Bookmarks</span>
            </div>
            {bookmarkCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white">
                {bookmarkCount}
              </span>
            )}
          </button>
        </div>
      )}
    </header>
  );
};
