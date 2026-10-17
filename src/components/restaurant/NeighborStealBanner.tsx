import React, { useMemo } from 'react';
import { AlertCircle, ShieldCheck, ArrowRight, Sparkles, MapPin, Building2 } from 'lucide-react';
import { Restaurant } from '../../types/database';

interface NeighborStealBannerProps {
  currentRestaurant: Restaurant;
  nearbyRestaurants: Restaurant[];
  onSelectRestaurant?: (slug: string) => void;
  onClaimClick?: () => void;
}

export const NeighborStealBanner: React.FC<NeighborStealBannerProps> = ({
  currentRestaurant,
  nearbyRestaurants,
  onSelectRestaurant,
  onClaimClick,
}) => {
  // Check if current venue is verified partner (e.g. is_verified or claimed)
  const isVerifiedPartner = Boolean(currentRestaurant.is_verified || currentRestaurant.is_claimed);

  // Find a verified neighbor in the same market or nearby area
  const verifiedNeighbor = useMemo(() => {
    if (isVerifiedPartner) return null;
    return nearbyRestaurants.find((r) => r.id !== currentRestaurant.id && (r.is_verified || r.rating >= 4.2)) || nearbyRestaurants[0] || null;
  }, [nearbyRestaurants, currentRestaurant, isVerifiedPartner]);

  // If already verified partner, display verified badge banner
  if (isVerifiedPartner) {
    return (
      <div className="my-6 bg-gradient-to-r from-emerald-50 via-white to-teal-50/50 border border-emerald-300/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-heading font-black text-sm sm:text-base text-emerald-950">
                  Verified In-Store Partner
                </h4>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  100% Rate Lock
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                {currentRestaurant.name} counter prices & 0% discretionary service charge are directly verified on-ground.
              </p>
            </div>
          </div>

          <div className="text-[11px] font-bold text-emerald-800 bg-white/80 px-3 py-1.5 rounded-xl border border-emerald-200 shrink-0 self-start sm:self-center">
            ✓ Genuine Walk-In Rates
          </div>
        </div>
      </div>
    );
  }

  // If unverified/unclaimed, show competitor alert + claim CTA
  return (
    <div className="my-6 bg-gradient-to-br from-amber-50/90 via-white to-rose-50/40 border border-amber-300/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs relative overflow-hidden">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Warning text */}
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-amber-500 text-white shrink-0">
              <AlertCircle className="w-3.5 h-3.5" />
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-900">
              Counter Menu Status
            </span>
          </div>

          <h4 className="font-heading font-black text-sm sm:text-base text-[#1C1917]">
            {currentRestaurant.name} counter prices are crowdsourced & unverified.
          </h4>

          {verifiedNeighbor && (
            <p className="text-xs text-stone-600 leading-relaxed">
              Want guaranteed direct counter rates & verified zero-markup nearby? Check{' '}
              <button
                type="button"
                onClick={() => onSelectRestaurant && onSelectRestaurant(verifiedNeighbor.slug)}
                className="font-extrabold text-[#0F766E] hover:underline inline-flex items-center gap-1"
              >
                <span>{verifiedNeighbor.name}</span>
                <ArrowRight className="w-3 h-3" />
              </button>{' '}
              in {verifiedNeighbor.city_area || verifiedNeighbor.city || 'the same area'}.
            </p>
          )}
        </div>

        {/* Claim Call to Action for Owner */}
        {onClaimClick && (
          <div className="shrink-0 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-amber-200">
            <button
              type="button"
              onClick={onClaimClick}
              className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-[#1C1917] hover:bg-stone-800 text-white font-black text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Building2 className="w-3.5 h-3.5 text-[#FF5A36]" />
              <span>Own {currentRestaurant.name}? Claim Now &rarr;</span>
            </button>
            <p className="text-[10px] text-stone-500 text-center md:text-right mt-1">
              Verify your rates in 60s for free
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
