/**
 * Menu Maps Discovery - Student Food Trail Card
 * Displays a curated student food crawl or neighbourhood itinerary.
 */

import React from 'react';
import { MapPin, Clock, DollarSign, ArrowRight, User } from 'lucide-react';
import { StudentFoodTrail } from '../types/discovery';

interface FoodTrailCardProps {
  trail: StudentFoodTrail;
  navigate: (path: string) => void;
}

export const FoodTrailCard: React.FC<FoodTrailCardProps> = ({ trail, navigate }) => {
  return (
    <div className="bg-white border border-[#E7E2DA] rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Cover */}
        <div className="relative aspect-video w-full overflow-hidden bg-stone-100">
          <img
            src={trail.cover_image_url}
            alt={trail.title}
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Neighbourhood Pill */}
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold">
              <MapPin className="w-3 h-3 text-[#FF5A36]" />
              <span>{trail.neighbourhood}</span>
            </span>
          </div>

          {/* Stops count */}
          <div className="absolute bottom-3 left-3">
            <span className="px-2.5 py-0.5 rounded-md bg-[#0F766E] text-white text-[10px] font-black uppercase tracking-wider">
              {trail.stops ? trail.stops.length : 0} Curated Food Stops
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-3">
          <h3 className="hd text-lg font-bold text-[#1C1917] group-hover:text-[#0F766E] transition-colors leading-snug">
            {trail.title}
          </h3>

          <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed line-clamp-2">
            {trail.description}
          </p>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 text-xs font-semibold text-stone-600 pt-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>{trail.total_duration_estimate || '2 hours'}</span>
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span>~₹{trail.budget_estimate_for_one || 250}/person</span>
            </span>
          </div>

          {/* Stops Preview */}
          {trail.stops && trail.stops.length > 0 && (
            <div className="pt-2 border-t border-stone-100 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Stops Preview</span>
              <div className="flex flex-wrap gap-1.5">
                {trail.stops.slice(0, 3).map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-lg bg-[#FAF8F5] border border-[#E7E2DA] text-[11px] font-medium text-stone-700 truncate max-w-[150px]"
                  >
                    {idx + 1}. {s.place_name}
                  </span>
                ))}
                {trail.stops.length > 3 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold text-[#0F766E] self-center">
                    +{trail.stops.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-5 sm:p-6 pt-0 flex items-center justify-between border-t border-stone-100 text-xs text-stone-500">
        <div className="flex items-center gap-1 min-w-0">
          <User className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
          <span className="truncate font-semibold">{trail.creator_name}</span>
        </div>

        <button
          onClick={() => navigate(`/discovery/trails/${trail.slug}`)}
          className="text-xs font-bold text-[#0F766E] hover:underline flex items-center gap-0.5 cursor-pointer"
        >
          <span>Explore Trail</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
