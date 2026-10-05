import React from 'react';
import { X, Sparkles, MapPin, Clock, ArrowRight, Compass, Sun, Moon } from 'lucide-react';
import { Restaurant } from '../../types/database';
import { GeoCoordinates, calculateDistanceKm } from '../../lib/location';

interface DayPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  areaName?: string;
  userCoords?: GeoCoordinates | null;
  restaurants: Restaurant[];
  navigate: (path: string) => void;
}

export const DayPlannerModal: React.FC<DayPlannerModalProps> = ({
  isOpen,
  onClose,
  areaName = 'Your Area',
  userCoords,
  restaurants,
  navigate,
}) => {
  if (!isOpen) return null;

  // Sort pool by real distance if userCoords available
  const pool = userCoords
    ? [...restaurants].sort((a, b) => {
        const dA = calculateDistanceKm(userCoords.latitude, userCoords.longitude, a.latitude, a.longitude);
        const dB = calculateDistanceKm(userCoords.latitude, userCoords.longitude, b.latitude, b.longitude);
        return dA - dB;
      })
    : [...restaurants];

  // Pick closest Breakfast spot
  const breakfastSpot =
    pool.find((r) => r.best_for_tags?.includes('Breakfast') || r.meal_types?.includes('Breakfast')) ||
    pool[0];

  // Pick closest Lunch spot (different from breakfast)
  const lunchSpot =
    pool.find((r) => r.id !== breakfastSpot?.id && (r.best_for_tags?.includes('Budget') || r.meal_types?.includes('Lunch'))) ||
    pool[1] ||
    pool[0];

  // Pick closest Evening / Night spot
  const eveningSpot =
    pool.find((r) => r.id !== breakfastSpot?.id && r.id !== lunchSpot?.id && (r.best_for_tags?.includes('Late Night') || r.best_for_tags?.includes('Coffee') || r.cuisine_types?.includes('Cafe'))) ||
    pool[2] ||
    pool[0];

  const totalCost = (breakfastSpot?.average_cost_for_two || 200) + (lunchSpot?.average_cost_for_two || 350) + (eveningSpot?.average_cost_for_two || 400);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#EFEAE2] p-6 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors z-10 border border-[#EFEAE2]"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1 mb-4 shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold">
            <Compass className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>Curated One-Day Food Trail</span>
          </div>
          <h3 className="text-2xl font-black text-[#1C1917] font-heading tracking-tight">
            Food Trail Near {areaName} 🗺️
          </h3>
          <p className="text-xs text-stone-500 font-sans">
            A morning-to-night food itinerary tailored to your nearest verified counter venues.
          </p>
        </div>

        {/* Timeline Itinerary */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 py-1">
          {/* Stop 1: Breakfast */}
          <div className="relative pl-6 pb-2 border-l-2 border-amber-300">
            <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-amber-400 text-white flex items-center justify-center text-xs shadow-xs">
              <Sun className="w-3 h-3" />
            </div>
            <div className="text-[11px] font-black text-amber-700 uppercase tracking-wider mb-1">
              Morning Kickoff (9:00 AM – 11:30 AM)
            </div>
            {breakfastSpot && (
              <div
                onClick={() => {
                  onClose();
                  navigate(`/${breakfastSpot.slug}`);
                }}
                className="p-3.5 rounded-2xl bg-white border border-[#EFEAE2] hover:border-amber-400 cursor-pointer transition-all flex items-center gap-3.5 shadow-2xs lift"
              >
                <img
                  src={breakfastSpot.cover_image_url}
                  alt={breakfastSpot.name}
                  className="w-14 h-14 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-heading font-black text-sm text-[#1C1917] truncate">{breakfastSpot.name}</h4>
                  <p className="text-xs text-stone-500 truncate font-sans">{breakfastSpot.specialty_dishes?.[0] || breakfastSpot.city}</p>
                  <span className="text-[11px] font-bold text-amber-700 font-heading">₹{breakfastSpot.average_cost_for_two} for two</span>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-600 shrink-0" />
              </div>
            )}
          </div>

          {/* Stop 2: Lunch */}
          <div className="relative pl-6 pb-2 border-l-2 border-[#FF5A36]">
            <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-[#FF5A36] text-white flex items-center justify-center text-xs shadow-xs">
              <Clock className="w-3 h-3" />
            </div>
            <div className="text-[11px] font-black text-[#D8350F] uppercase tracking-wider mb-1">
              Mid-day Refuel (1:00 PM – 3:30 PM)
            </div>
            {lunchSpot && (
              <div
                onClick={() => {
                  onClose();
                  navigate(`/${lunchSpot.slug}`);
                }}
                className="p-3.5 rounded-2xl bg-white border border-[#EFEAE2] hover:border-[#FF5A36] cursor-pointer transition-all flex items-center gap-3.5 shadow-2xs lift"
              >
                <img
                  src={lunchSpot.cover_image_url}
                  alt={lunchSpot.name}
                  className="w-14 h-14 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-heading font-black text-sm text-[#1C1917] truncate">{lunchSpot.name}</h4>
                  <p className="text-xs text-stone-500 truncate font-sans">{lunchSpot.specialty_dishes?.[0] || lunchSpot.city}</p>
                  <span className="text-[11px] font-bold text-[#D8350F] font-heading">₹{lunchSpot.average_cost_for_two} for two</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#FF5A36] shrink-0" />
              </div>
            )}
          </div>

          {/* Stop 3: Evening & Dinner */}
          <div className="relative pl-6 border-l-2 border-[#0F766E]">
            <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-[#0F766E] text-white flex items-center justify-center text-xs shadow-xs">
              <Moon className="w-3 h-3" />
            </div>
            <div className="text-[11px] font-black text-[#0F766E] uppercase tracking-wider mb-1">
              Evening Hangout & Dinner (6:30 PM Onwards)
            </div>
            {eveningSpot && (
              <div
                onClick={() => {
                  onClose();
                  navigate(`/${eveningSpot.slug}`);
                }}
                className="p-3.5 rounded-2xl bg-white border border-[#EFEAE2] hover:border-[#0F766E] cursor-pointer transition-all flex items-center gap-3.5 shadow-2xs lift"
              >
                <img
                  src={eveningSpot.cover_image_url}
                  alt={eveningSpot.name}
                  className="w-14 h-14 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-heading font-black text-sm text-[#1C1917] truncate">{eveningSpot.name}</h4>
                  <p className="text-xs text-stone-500 truncate font-sans">{eveningSpot.specialty_dishes?.[0] || eveningSpot.city}</p>
                  <span className="text-[11px] font-bold text-[#0F766E] font-heading">₹{eveningSpot.average_cost_for_two} for two</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#0F766E] shrink-0" />
              </div>
            )}
          </div>
        </div>

        {/* Total Cost Summary */}
        <div className="mt-4 pt-3 border-t border-[#EFEAE2] flex items-center justify-between shrink-0">
          <div>
            <span className="text-xs text-stone-500">Estimated Total for Two:</span>
            <div className="font-heading font-black text-lg text-[#1C1917]">
              ₹{totalCost} for 3 Meals
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-[#1C1917] hover:bg-black text-white text-xs font-extrabold transition-all shadow-md active:scale-95"
          >
            Close Itinerary
          </button>
        </div>
      </div>
    </div>
  );
};
