import React, { useState } from 'react';
import { X, MapPin, Crosshair, Sparkles, Check, ChevronRight } from 'lucide-react';
import { 
  POPULAR_FOOD_HUBS, 
  PopularFoodHub, 
  saveCachedUserCoordinates, 
  getUserLocation 
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
  const [locating, setLocating] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  if (!isOpen) return null;

  const handleSelectHub = (hub: PopularFoodHub) => {
    const coords = {
      latitude: hub.latitude,
      longitude: hub.longitude,
      accuracy: 50,
    };
    saveCachedUserCoordinates(coords);
    window.dispatchEvent(new CustomEvent('menumap_location_updated', { detail: coords }));
    showToast(`Location set to ${hub.name}!`, 'success');
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
    } catch (e: any) {
      showToast('GPS permission denied or unavailable. Please pick a neighborhood below.', 'error');
    } finally {
      setLocating(false);
    }
  };

  const filteredHubs = POPULAR_FOOD_HUBS.filter((hub) =>
    hub.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    hub.tagline.toLowerCase().includes(searchFilter.toLowerCase()) ||
    hub.metroStation.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg max-h-[90vh] bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#EFEAE2] flex flex-col overflow-hidden my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#EFEAE2] bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#FF5A36] flex items-center justify-center shadow-xs">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-lg text-[#1C1917] leading-tight">
                Select Your Location
              </h3>
              <p className="text-xs text-stone-500 font-sans mt-0.5">
                Current: <strong className="text-[#FF5A36]">{activeCity}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live GPS CTA */}
        <div className="p-4 border-b border-[#EFEAE2] bg-[#FAF8F5]">
          <button
            type="button"
            onClick={handleUseGps}
            disabled={locating}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#1C1917] hover:bg-black text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-60"
          >
            <Crosshair className={`w-4 h-4 text-[#FF5A36] ${locating ? 'animate-spin' : ''}`} />
            <span>{locating ? 'Detecting Precise GPS...' : 'Use My Live GPS Location'}</span>
          </button>
        </div>

        {/* Filter search */}
        <div className="px-4 pt-3 pb-1 bg-[#FAF8F5]">
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search neighborhood or metro station..."
            className="w-full px-4 py-2.5 rounded-xl border border-[#EFEAE2] bg-white text-xs font-medium text-[#1C1917] placeholder-stone-400 focus:outline-hidden focus:border-[#FF5A36]"
          />
        </div>

        {/* Food Hubs List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 font-sans">
          <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider px-1">
            Delhi NCR Foodie Neighborhoods
          </div>

          {filteredHubs.map((hub) => {
            const isSelected = activeCity.toLowerCase().includes(hub.name.split(' ')[0].toLowerCase());
            return (
              <button
                key={hub.id}
                type="button"
                onClick={() => handleSelectHub(hub)}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 group cursor-pointer ${
                  isSelected
                    ? 'bg-white border-[#FF5A36] shadow-sm'
                    : 'bg-white/80 hover:bg-white border-[#EFEAE2] hover:border-stone-300'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-heading font-black text-sm text-[#1C1917] group-hover:text-[#FF5A36] transition-colors">
                      {hub.name}
                    </span>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-[#FF5A36] text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-500 truncate mt-0.5">
                    {hub.tagline}
                  </p>
                  <div className="text-[10px] font-semibold text-stone-400 mt-1 flex items-center gap-1">
                    <span>🚇 Metro:</span>
                    <span className="text-stone-600">{hub.metroStation}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#FF5A36] group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            );
          })}

          {filteredHubs.length === 0 && (
            <div className="text-center py-8 text-xs text-stone-500 font-sans">
              No matching neighborhood found. Try searching another Delhi area.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
