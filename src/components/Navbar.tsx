import React, { useState, useEffect } from 'react';
import { 
  Compass,
  MapPin,
  Bookmark,
  UtensilsCrossed,
  Sparkles,
  Search,
  ChevronDown,
  Menu,
  X,
  PlusCircle,
  PhoneCall
} from 'lucide-react';
import { MenuMapLogo } from './Logo';
import { getBookmarks } from '../lib/bookmarks';
import { LocationPickerModal } from './LocationPickerModal';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
  city?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate, city = 'Delhi NCR' }) => {
  const [scrolled, setScrolled] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHome = currentPath === '/' || currentPath === '';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const updateCount = () => {
      const b = getBookmarks();
      setSavedCount(b.restaurants.length + b.dishes.length + b.collections.length);
    };
    updateCount();
    window.addEventListener('menumap_bookmarks_updated', updateCount);
    return () => window.removeEventListener('menumap_bookmarks_updated', updateCount);
  }, []);

  // Close mobile drawer on route change or ESC
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [currentPath]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: 'Explore', path: '/restaurants' },
    { label: 'Area guides', path: '/iconic-area' },
    { label: 'Dishes', path: isHome ? '#dishes' : '/search' },
    { label: 'Saved', path: '/bookmarks', badge: savedCount > 0 ? savedCount : undefined },
  ];

  const handleLinkClick = (path: string) => {
    setMobileMenuOpen(false);
    if (path.startsWith('#')) {
      if (!isHome) {
        navigate('/' + path);
      } else {
        const el = document.querySelector(path);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(path);
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 bg-[#FAF8F5]/95 backdrop-blur-md text-[#1C1917] border-b border-[#E7E2DA] ${
          scrolled ? 'shadow-sm' : ''
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-3.5 sm:px-6 md:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-left group transition-transform active:scale-95 cursor-pointer shrink-0"
            aria-label="Menu Maps Home"
          >
            <MenuMapLogo size={32} className="shrink-0 sm:w-[38px] sm:h-[38px] group-hover:scale-105 transition-transform" />
            <span className="hd text-xl sm:text-2xl font-extrabold tracking-tight text-[#1C1917]">
              Menu<span className="text-[#FF5A36]">Maps</span>
            </span>
          </button>

          {/* Desktop Nav Links */}
          <nav aria-label="Main" className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive =
                (link.path === '/restaurants' && (currentPath === '/restaurants' || currentPath === '/search')) ||
                (link.path === '/iconic-area' && (currentPath === '/iconic-area' || currentPath.startsWith('/iconic-area/'))) ||
                (link.path === '/bookmarks' && currentPath === '/bookmarks');

              return (
                <button
                  key={link.label}
                  onClick={() => handleLinkClick(link.path)}
                  className={`font-semibold text-[15px] transition-colors relative py-1 cursor-pointer ${
                    isActive
                      ? 'text-[#D8350F]'
                      : 'text-[#44403C] hover:text-[#D8350F]'
                  }`}
                >
                  {link.label}
                  {link.badge && (
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[11px] font-bold bg-[#FF5A36] text-white">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Desktop Right Action & City Badge (Visible ONLY md:flex -> No clash with mobile) */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={() => setLocationModalOpen(true)}
              className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-full text-sm font-semibold border border-[#E7E2DA] text-[#1C1917] bg-white hover:bg-stone-50 transition-all hover:scale-102 active:scale-95 cursor-pointer shadow-xs"
              title="Click to change Delhi neighborhood or recalibrate GPS"
            >
              <span className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-pulse"></span>
              <span className="truncate max-w-[140px]">{city}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0" />
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="btn min-h-[44px] px-5 text-sm font-bold shadow-sm bg-[#1C1917] text-white hover:bg-stone-800"
            >
              List your cafe
            </button>
          </div>

          {/* Mobile Right Cluster (Visible ONLY below md) */}
          <div className="flex md:hidden items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setLocationModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 sm:px-3 min-h-[40px] rounded-full border border-[#E7E2DA] text-[#1C1917] bg-white hover:bg-stone-50 transition-all active:scale-95 cursor-pointer shadow-xs"
              title="Change neighborhood or recalibrate GPS"
              aria-label={`Current location: ${city}. Tap to change`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF] animate-pulse shrink-0"></span>
              <span className="truncate max-w-[76px] xs:max-w-[105px] sm:max-w-[130px]">{city}</span>
              <ChevronDown className="w-3 h-3 opacity-60 shrink-0" />
            </button>

            <button
              onClick={() => navigate('/search')}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors active:scale-95 text-[#1C1917] hover:bg-stone-100 bg-white border border-[#E7E2DA] shadow-xs cursor-pointer"
              aria-label="Search dishes and cafes"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors active:scale-95 text-[#1C1917] hover:bg-stone-100 bg-white border border-[#E7E2DA] shadow-xs cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-In Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[9999] md:hidden flex justify-end">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <div
            className="relative w-[85%] max-w-[320px] h-full bg-[#FAF8F5] text-[#1C1917] shadow-2xl flex flex-col justify-between p-6 z-10 animate-slideInRight border-l border-[#E7E2DA]"
            style={{
              paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
            }}
          >
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-5 border-b border-[#E7E2DA]">
                <div className="flex items-center gap-2">
                  <MenuMapLogo size={28} />
                  <span className="hd text-lg font-extrabold text-[#1C1917]">
                    Menu<span className="text-[#FF5A36]">Maps</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Location Shortcut inside Drawer */}
              <div className="mt-4 p-3 rounded-2xl bg-white border border-[#E7E2DA] shadow-2xs">
                <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                  Active Locality
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setLocationModalOpen(true);
                  }}
                  className="w-full text-left flex items-center justify-between text-sm font-black text-[#1C1917] hover:text-[#D8350F]"
                >
                  <span className="truncate">{city}</span>
                  <span className="text-xs text-[#0F766E] font-bold">Change &rarr;</span>
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="mt-6 flex flex-col gap-1.5">
                {navLinks.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => handleLinkClick(link.path)}
                    className="w-full text-left px-3.5 py-3 rounded-xl font-bold text-base text-[#44403C] hover:text-[#1C1917] hover:bg-stone-100/70 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-black bg-[#FF5A36] text-white">
                        {link.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-[#E7E2DA] space-y-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/contact');
                }}
                className="w-full min-h-[48px] rounded-2xl bg-[#1C1917] hover:bg-black text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-98 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-[#FF5A36]" />
                <span>List your cafe / menu</span>
              </button>

              <div className="text-center">
                <p className="text-[11px] text-stone-400 font-medium">
                  Verified real menus · 0% markups
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <LocationPickerModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        activeCity={city}
      />
    </>
  );
};
