import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  MapPin, 
  Crosshair, 
  Search, 
  Compass, 
  Check, 
  Sparkles,
  Train,
  Navigation,
  ShieldCheck
} from 'lucide-react';
import { DELHI_LOCATIONS, DelhiLocation } from '../lib/delhiLocationsData';
import { 
  DELHI_GROUND_POCKETS, 
  DelhiGroundPocket, 
  searchDelhiGroundPockets, 
  searchDelhiLocations 
} from '../lib/location';
import { useLocationContext } from '../context/LocationContext';

interface LocationPickerModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  activeCity?: string;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
}) => {
  const {
    currentLocation,
    selectLocality,
    selectGroundPocket,
    selectAllDelhi,
    detectLiveGps,
    isLocating,
    isLocationModalOpen,
    closeLocationModal
  } = useLocationContext();

  const isOpen = propIsOpen !== undefined ? propIsOpen : isLocationModalOpen;
  const onClose = propOnClose || closeLocationModal;

  const [mounted, setMounted] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pockets' | 'hubs'>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
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

  // Search results across 300+ ground sectors and colonies
  const filteredGroundPockets = useMemo(() => {
    return searchDelhiGroundPockets(searchFilter);
  }, [searchFilter]);

  // Search results across food hubs
  const filteredLocations = useMemo(() => {
    return searchDelhiLocations(searchFilter);
  }, [searchFilter]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-full sm:max-w-xl h-[90vh] sm:h-[640px] max-h-[94vh] bg-[#FAF8F5] rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-[#E7E2DA] animate-in slide-in-from-bottom-6 duration-200 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================================================= */}
        {/* 1. MODAL HEADER */}
        {/* ========================================================================= */}
        <div className="shrink-0 p-4 sm:p-5 bg-white border-b border-[#E7E2DA] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFE9E2] text-[#D8350F] flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 id="location-modal-title" className="hd text-lg sm:text-xl font-black text-[#1C1917] tracking-tight">
                Accurate Ground Location
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                <span>Active:</span>
                <span className="font-bold text-[#D8350F] truncate max-w-[200px]">
                  {currentLocation.name}
                </span>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${currentLocation.isLiveGps ? 'bg-emerald-500 animate-pulse' : 'bg-[#FF5A36]'}`}></span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close location selector"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 2. TOP ACTION BUTTONS: LIVE GPS & ALL DELHI NCR */}
        {/* ========================================================================= */}
        <div className="shrink-0 p-3 sm:p-4 bg-white border-b border-[#E7E2DA] space-y-2.5">
          {/* Active Live GPS Ground Banner if detected */}
          {currentLocation.isLiveGps && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="font-black text-emerald-900 flex items-center gap-1.5 flex-wrap">
                  <span>Ground GPS Active: {currentLocation.name}</span>
                  {currentLocation.accuracyMeters && (
                    <span className="text-[10px] px-1.5 py-0.2 bg-emerald-200 text-emerald-800 rounded-md font-bold">
                      ±{currentLocation.accuracyMeters}m precision
                    </span>
                  )}
                </div>
                {currentLocation.nearestMetro && (
                  <div className="text-[11px] text-emerald-700 font-semibold mt-0.5 truncate">
                    🚇 {currentLocation.nearestMetro.label}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Action 1: Use Live GPS */}
            <button
              type="button"
              onClick={() => detectLiveGps(false)}
              disabled={isLocating}
              className="py-3 px-4 rounded-2xl bg-[#1C1917] hover:bg-black text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-60"
            >
              <Crosshair className={`w-4 h-4 text-[#FF5A36] ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Detecting Ground...' : '⚡ Use Exact Ground GPS'}</span>
            </button>

            {/* Action 2: All Delhi NCR */}
            <button
              type="button"
              onClick={selectAllDelhi}
              className={`py-3 px-4 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all border shadow-xs active:scale-98 cursor-pointer ${
                currentLocation.isAllDelhi
                  ? 'bg-orange-50 border-[#FF5A36] text-[#D8350F]'
                  : 'bg-white hover:bg-stone-50 border-[#E7E2DA] text-[#1C1917]'
              }`}
            >
              <Compass className="w-4 h-4 text-[#FF5A36]" />
              <span>🗺️ All Delhi NCR (770+ Cafes)</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search colony, sector (e.g. 14, 7), market, or metro..."
              className="w-full pl-10 pr-9 py-2.5 bg-[#FAF8F5] border border-[#E7E2DA] focus:border-[#FF5A36] focus:bg-white rounded-xl text-xs sm:text-sm font-semibold text-[#1C1917] placeholder:text-stone-400 outline-none transition-all"
            />
            {searchFilter && (
              <button
                type="button"
                onClick={() => setSearchFilter('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Granular Sub-Locality Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`text-xs px-3 py-1 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#1C1917] text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              All Ground Spots ({filteredGroundPockets.length + filteredLocations.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pockets')}
              className={`text-xs px-3 py-1 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'pockets'
                  ? 'bg-[#1C1917] text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              Sectors & Colonies ({filteredGroundPockets.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('hubs')}
              className={`text-xs px-3 py-1 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'hubs'
                  ? 'bg-[#1C1917] text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              Major Food Hubs ({filteredLocations.length})
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. SCROLLABLE GROUND LOCALITIES FEED */}
        {/* ========================================================================= */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-2 overscroll-contain">
          {/* SECTION A: GRANULAR GROUND POCKETS (Sectors, Colonies, Markets) */}
          {(activeTab === 'all' || activeTab === 'pockets') && filteredGroundPockets.length > 0 && (
            <div className="space-y-1.5 mb-4">
              <div className="text-[11px] font-black uppercase tracking-wider text-stone-400 px-1 flex items-center justify-between">
                <span>Specific Sectors & Colonies</span>
                <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-md">Ground Precision</span>
              </div>

              {filteredGroundPockets.slice(0, 35).map((pocket) => {
                const isSelected = !currentLocation.isAllDelhi && (currentLocation.id === pocket.id || currentLocation.name === pocket.name);

                return (
                  <button
                    key={pocket.id}
                    type="button"
                    onClick={() => selectGroundPocket(pocket)}
                    className={`w-full text-left p-3 sm:p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer group ${
                      isSelected
                        ? 'bg-orange-50 border-[#FF5A36] shadow-sm'
                        : 'bg-white hover:bg-stone-50 border-[#E7E2DA] hover:border-stone-400 shadow-2xs'
                    }`}
                  >
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-[#1C1917] group-hover:text-[#D8350F] transition-colors truncate">
                          {pocket.name}
                        </span>
                        {pocket.pincode && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-100 text-stone-500 font-mono">
                            {pocket.pincode}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                        <span className="font-semibold text-stone-600">
                          {pocket.colony} · {pocket.zone}
                        </span>
                        {pocket.landmarks && pocket.landmarks.length > 0 && (
                          <span className="hidden sm:inline text-stone-400">
                            · Near {pocket.landmarks[0]}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isSelected ? (
                        <div className="w-7 h-7 rounded-full bg-[#FF5A36] text-white flex items-center justify-center shadow-xs">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-stone-100 group-hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors">
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* SECTION B: MAJOR FOOD HUBS */}
          {(activeTab === 'all' || activeTab === 'hubs') && filteredLocations.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-black uppercase tracking-wider text-stone-400 px-1 pt-1">
                <span>Major Dining Hubs</span>
              </div>

              {filteredLocations.slice(0, 25).map((loc) => {
                const isSelected = !currentLocation.isAllDelhi && (currentLocation.id === loc.id || currentLocation.name === loc.name);

                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => selectLocality(loc)}
                    className={`w-full text-left p-3 sm:p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer group ${
                      isSelected
                        ? 'bg-orange-50 border-[#FF5A36] shadow-sm'
                        : 'bg-white hover:bg-stone-50 border-[#E7E2DA] hover:border-stone-400 shadow-2xs'
                    }`}
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-[#1C1917] group-hover:text-[#D8350F] transition-colors truncate">
                          {loc.name}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                        <span className="inline-flex items-center gap-1 font-semibold text-stone-600">
                          <Train className="w-3 h-3 text-indigo-500 shrink-0" />
                          <span>{loc.metroStation}</span>
                        </span>

                        {loc.famousSpecialties && loc.famousSpecialties.length > 0 && (
                          <span className="hidden sm:inline text-stone-400">
                            · {loc.famousSpecialties.slice(0, 2).join(', ')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isSelected ? (
                        <div className="w-7 h-7 rounded-full bg-[#FF5A36] text-white flex items-center justify-center shadow-xs">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-stone-100 group-hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors">
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {filteredGroundPockets.length === 0 && filteredLocations.length === 0 && (
            <div className="p-8 text-center space-y-3 bg-white rounded-2xl border border-[#E7E2DA] my-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 text-[#D8350F] flex items-center justify-center mx-auto font-bold text-lg">
                <Search className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-stone-900 text-sm">
                No matching colony or area found for &quot;{searchFilter}&quot;
              </h4>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Try searching another sector, colony, or explore all restaurants across Delhi NCR.
              </p>
              <button
                type="button"
                onClick={selectAllDelhi}
                className="mt-2 px-4 py-2 bg-[#1C1917] text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-black"
              >
                View All Delhi NCR
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
