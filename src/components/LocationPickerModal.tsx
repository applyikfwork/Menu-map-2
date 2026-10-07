import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  MapPin, 
  Crosshair, 
  Sparkles, 
  Check, 
  ChevronRight, 
  Search, 
  Compass, 
  Navigation, 
  Train,
  CheckCircle2
} from 'lucide-react';
import { 
  DELHI_LOCATIONS, 
  DELHI_ZONES, 
  DelhiLocation, 
  DelhiZoneInfo, 
  saveCachedUserCoordinates, 
  getUserLocation,
  searchDelhiLocations,
  calculateDistanceKm,
  formatDistance,
  getCachedUserCoordinates
} from '../lib/location';
import { useToast } from './Toast';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCity?: string;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  activeCity = 'Delhi NCR',
}) => {
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [locating, setLocating] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Ensure portal target document.body is ready
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Auto-focus search on desktop after small delay
      const timer = setTimeout(() => {
        if (window.innerWidth > 768) {
          searchInputRef.current?.focus();
        }
      }, 150);
      return () => {
        document.body.style.overflow = '';
        clearTimeout(timer);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Helper to color-code Delhi Metro Lines realistically
  const getMetroLineBadgeClass = (line: string) => {
    const l = line.toLowerCase();
    if (l.includes('yellow')) return 'bg-amber-100 text-amber-900 border-amber-300';
    if (l.includes('blue')) return 'bg-sky-100 text-sky-900 border-sky-300';
    if (l.includes('red')) return 'bg-rose-100 text-rose-900 border-rose-300';
    if (l.includes('pink')) return 'bg-pink-100 text-pink-900 border-pink-300';
    if (l.includes('violet')) return 'bg-purple-100 text-purple-900 border-purple-300';
    if (l.includes('magenta')) return 'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-300';
    if (l.includes('airport') || l.includes('orange')) return 'bg-orange-100 text-orange-900 border-orange-300';
    if (l.includes('green')) return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    return 'bg-stone-100 text-stone-700 border-stone-200';
  };

  // Top quick-access hubs for 1-tap switching
  const popularHubShortcuts = useMemo(() => {
    const desiredShortNames = [
      'Connaught Place',
      'Hudson Lane',
      'NSP Pitampura',
      'Hauz Khas',
      'Chandni Chowk',
      'Dwarka Sec 12',
      'Rajouri Garden',
      'Laxmi Nagar',
      'Aerocity',
      'Saket'
    ];
    return DELHI_LOCATIONS.filter((l) => 
      desiredShortNames.some((name) => l.name.toLowerCase().includes(name.toLowerCase()) || l.shortName.toLowerCase().includes(name.toLowerCase()))
    ).slice(0, 10);
  }, []);

  // Filtered locations with distance calculation if coordinates cached
  const userCoords = useMemo(() => getCachedUserCoordinates(), [isOpen]);

  const filteredLocations = useMemo(() => {
    const results = searchDelhiLocations(searchFilter, selectedZone);

    if (userCoords) {
      return [...results].sort((a, b) => {
        const distA = calculateDistanceKm(userCoords.latitude, userCoords.longitude, a.latitude, a.longitude);
        const distB = calculateDistanceKm(userCoords.latitude, userCoords.longitude, b.latitude, b.longitude);
        return distA - distB;
      });
    }

    return results;
  }, [searchFilter, selectedZone, userCoords]);

  if (!isOpen || !mounted) return null;

  const handleSelectLocation = (loc: DelhiLocation) => {
    const coords = {
      latitude: loc.latitude,
      longitude: loc.longitude,
      accuracy: 50,
    };
    saveCachedUserCoordinates(coords);
    window.dispatchEvent(new CustomEvent('menumap_location_updated', { detail: coords }));
    showToast(`Area switched to ${loc.shortName || loc.name}!`, 'success');
    onClose();
  };

  const handleUseGps = async () => {
    setLocating(true);
    try {
      const coords = await getUserLocation();
      saveCachedUserCoordinates(coords);
      window.dispatchEvent(new CustomEvent('menumap_location_updated', { detail: coords }));
      showToast('Live GPS location detected successfully!', 'success');
      onClose();
    } catch {
      showToast('GPS permission denied or unavailable. Please pick your Delhi neighborhood below.', 'info');
    } finally {
      setLocating(false);
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn overflow-hidden"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 999999,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal Dialog Card (Optimized Height, Zero Flex-Clipping, 100% Contained) */}
      <div 
        className="relative w-full max-w-2xl h-[92vh] sm:h-[86vh] max-h-[760px] bg-[#FAF8F5] rounded-3xl sm:rounded-[36px] shadow-2xl border border-[#EFEAE2] flex flex-col overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* ========================================================================= */}
        {/* 1. FIXED TOP HEADER (ALWAYS FULLY VISIBLE & ACCESSIBLE) */}
        {/* ========================================================================= */}
        <div className="shrink-0 p-4 sm:p-5 border-b border-[#E7E2DA] bg-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-orange-100 text-[#FF5A36] flex items-center justify-center shrink-0 shadow-xs">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-heading font-black text-base sm:text-lg text-[#1C1917] leading-tight truncate">
                Select Delhi Location
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-stone-500 font-sans truncate">
                <span>Active:</span>
                <span className="font-bold text-[#D8350F] truncate">{activeCity}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Close dialog (Esc)"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 2. AUTO-DETECT GPS BUTTON (PINNED & PROMINENT, NEVER CUT OFF) */}
        {/* ========================================================================= */}
        <div className="shrink-0 p-3 sm:p-4 bg-gradient-to-r from-orange-50/70 via-stone-50 to-teal-50/60 border-b border-[#E7E2DA]">
          <button
            type="button"
            onClick={handleUseGps}
            disabled={locating}
            className="w-full py-3 sm:py-3.5 px-4 rounded-2xl bg-[#1C1917] hover:bg-black text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-60"
          >
            <Crosshair className={`w-4 h-4 text-[#FF5A36] ${locating ? 'animate-spin' : ''}`} />
            <span>{locating ? 'Detecting Precise GPS Location...' : 'Use My Live GPS Location'}</span>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider hidden sm:inline">
              Instant Auto-Detect
            </span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 3. UNIVERSAL SEARCH INPUT & INSTANT POPULAR SHORTCUTS */}
        {/* ========================================================================= */}
        <div className="shrink-0 px-3 sm:px-4 pt-3 pb-2 bg-[#FAF8F5] space-y-2">
          <div className="relative flex items-center bg-white border border-[#E7E2DA] rounded-2xl px-3.5 py-2.5 shadow-xs focus-within:border-[#FF5A36] focus-within:ring-2 focus-within:ring-[#FF5A36]/15 transition-all">
            <Search className="w-4 h-4 text-stone-400 shrink-0 mr-2" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search colony, metro station, line, or food (e.g. NSP, Momos, Yellow Line)..."
              className="w-full bg-transparent text-xs sm:text-sm font-medium text-[#1C1917] placeholder-stone-400 outline-none"
            />
            {searchFilter && (
              <button 
                type="button" 
                onClick={() => setSearchFilter('')}
                className="text-stone-400 hover:text-stone-700 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick-Tap Popular Food Hubs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 shrink-0 mr-0.5">
              Top Hubs:
            </span>
            {popularHubShortcuts.map((loc) => (
              <button
                key={loc.id}
                type="button"
                onClick={() => handleSelectLocation(loc)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-white hover:bg-orange-50 hover:text-[#D8350F] hover:border-[#FF5A36]/40 text-[#44403C] font-bold whitespace-nowrap transition-colors shrink-0 border border-[#E7E2DA] shadow-2xs cursor-pointer"
              >
                {loc.shortName}
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. DELHI ZONE TABS (HORIZONTAL SCROLLING) */}
        {/* ========================================================================= */}
        <div className="shrink-0 px-3 sm:px-4 pb-2.5 bg-[#FAF8F5] border-b border-[#E7E2DA]/60">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {DELHI_ZONES.map((zone) => {
              const isSelected = selectedZone === zone.key;
              return (
                <button
                  key={zone.key}
                  type="button"
                  onClick={() => setSelectedZone(zone.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer border ${
                    isSelected
                      ? 'bg-[#1C1917] text-white border-[#1C1917] shadow-xs'
                      : 'bg-white border-[#E7E2DA] text-[#57534E] hover:border-stone-400 hover:bg-stone-50'
                  }`}
                >
                  <span>{zone.icon}</span>
                  <span>{zone.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5. SCROLLABLE NEIGHBORHOODS & METRO HUBS FEED */}
        {/* ========================================================================= */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-2.5 overscroll-contain font-sans">
          <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-stone-400 px-1">
            <span>Delhi NCR Neighborhoods &amp; Metro Stations ({filteredLocations.length})</span>
            {userCoords && <span className="text-[#0F766E] font-bold">Sorted by Proximity</span>}
          </div>

          {filteredLocations.map((loc) => {
            const isSelected = 
              activeCity.toLowerCase().includes(loc.shortName.toLowerCase()) || 
              loc.name.toLowerCase().includes(activeCity.toLowerCase());

            const dist = userCoords
              ? calculateDistanceKm(userCoords.latitude, userCoords.longitude, loc.latitude, loc.longitude)
              : undefined;

            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => handleSelectLocation(loc)}
                className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 group cursor-pointer ${
                  isSelected
                    ? 'bg-orange-50/70 border-[#FF5A36] shadow-xs ring-1 ring-[#FF5A36]/30'
                    : 'bg-white hover:bg-stone-50/80 border-[#E7E2DA] hover:border-stone-300 shadow-2xs'
                }`}
              >
                <div className="min-w-0 flex-1">
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                      {loc.zone}
                    </span>
                    {loc.isPopularHub && (
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-100 text-[#D8350F]">
                        ★ Top Hub
                      </span>
                    )}
                    {loc.pincode && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stone-50 text-stone-500 border border-stone-200/50">
                        PIN: {loc.pincode}
                      </span>
                    )}
                    {dist !== undefined && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-[#0F766E] border border-teal-100">
                        {formatDistance(dist)} away
                      </span>
                    )}
                  </div>

                  {/* Location Title & Selection Indicator */}
                  <div className="flex items-center gap-2">
                    <h4 className="font-heading font-black text-sm sm:text-base text-[#1C1917] group-hover:text-[#D8350F] transition-colors truncate">
                      {loc.name}
                    </h4>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-[#FF5A36] text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  {/* Foodie Tagline */}
                  <p className="text-xs text-[#57534E] line-clamp-1 mt-0.5 font-normal">
                    {loc.tagline}
                  </p>

                  {/* Metro Station & Metro Line Tags */}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-stone-600">
                    <span className="inline-flex items-center gap-1 text-[#0F766E] font-bold">
                      <Train className="w-3.5 h-3.5 shrink-0" />
                      <span>{loc.metroStation}</span>
                    </span>
                    {loc.metroLines.map((line) => (
                      <span
                        key={line}
                        className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${getMetroLineBadgeClass(line)}`}
                      >
                        {line}
                      </span>
                    ))}
                    <span className="text-stone-300">·</span>
                    <span className="text-stone-500">Avg ₹{loc.avgCostForTwo} for two</span>
                  </div>

                  {/* Food Highlights Strip */}
                  <div className="mt-2 flex flex-wrap items-center gap-1">
                    {loc.famousSpecialties.slice(0, 4).map((dish) => (
                      <span
                        key={dish}
                        className="text-[10px] font-medium bg-[#FAF8F5] text-stone-600 px-2 py-0.5 rounded-lg border border-stone-200/60"
                      >
                        {dish}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 shrink-0">
                  <div className="w-7 h-7 rounded-full bg-stone-100 group-hover:bg-[#FF5A36] group-hover:text-white text-stone-400 flex items-center justify-center transition-all">
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </button>
            );
          })}

          {filteredLocations.length === 0 && (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="font-heading font-bold text-base text-[#1C1917]">
                No matching Delhi location found
              </h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                We couldn't find "{searchFilter}" in {selectedZone === 'all' ? 'Delhi NCR' : 'this zone'}. Try searching by colony name, metro station, or clear your filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchFilter('');
                  setSelectedZone('all');
                }}
                className="btn bg-[#1C1917] text-white text-xs px-4 py-2 rounded-xl font-bold"
              >
                Show All 60+ Delhi Areas
              </button>
            </div>
          )}
        </div>

        {/* Bottom Micro Footer */}
        <div className="shrink-0 p-3 bg-white border-t border-[#E7E2DA] flex items-center justify-between text-[11px] text-stone-500 px-4">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FF5A36]" />
            <span>60+ colonies across all 11 Delhi revenue districts mapped</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-[#D8350F] hover:underline cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
