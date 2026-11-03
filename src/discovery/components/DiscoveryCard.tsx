/**
 * Menu Maps Discovery - Discovery Card Component
 * Premium editorial food-discovery card with varied layout variants.
 * Always links to dedicated /discovery/:slug detail page.
 */

import React from 'react';
import { MapPin, Tag, ShieldCheck, Clock, AlertCircle, Sparkles, ChevronRight, User } from 'lucide-react';
import { DiscoveryItem, PriceVerificationType } from '../types/discovery';

interface DiscoveryCardProps {
  discovery: DiscoveryItem;
  navigate: (path: string) => void;
  variant?: 'featured' | 'standard' | 'horizontal';
}

const getPriceBadge = (priceType?: PriceVerificationType) => {
  switch (priceType) {
    case 'Counter price observed':
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        icon: ShieldCheck,
        label: 'Verified Counter Price',
      };
    case 'Restaurant-confirmed':
      return {
        bg: 'bg-teal-50 text-teal-800 border-teal-200',
        icon: ShieldCheck,
        label: 'Restaurant Confirmed',
      };
    case 'Submitted but unverified':
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        icon: Clock,
        label: 'Submitted Price',
      };
    case 'Estimated':
    default:
      return {
        bg: 'bg-stone-50 text-stone-700 border-stone-200',
        icon: AlertCircle,
        label: 'Estimated Price',
      };
  }
};

export const DiscoveryCard: React.FC<DiscoveryCardProps> = ({
  discovery,
  navigate,
  variant = 'standard',
}) => {
  const priceBadge = getPriceBadge(discovery.price_type);
  const BadgeIcon = priceBadge.icon;

  const handleClick = () => {
    navigate(`/discovery/${discovery.slug}`);
  };

  // 1. Featured / Hero Card Variant
  if (variant === 'featured') {
    return (
      <div
        onClick={handleClick}
        className="bg-white rounded-3xl border border-[#E7E2DA] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col lg:flex-row"
      >
        <div className="lg:w-1/2 relative min-h-[260px] sm:min-h-[320px] overflow-hidden bg-stone-100">
          <img
            src={discovery.main_image}
            alt={discovery.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full bg-[#1FB5A0] text-white text-xs font-black uppercase tracking-wider shadow-md flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Discovery of the Week</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-stone-900 text-xs font-bold">
              {discovery.category}
            </span>
          </div>
          {discovery.price !== undefined && (
            <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md text-stone-900 shadow-md">
              <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Starting at</div>
              <div className="text-base font-black text-[#FF6B4A]">₹{discovery.price}</div>
            </div>
          )}
        </div>

        <div className="lg:w-1/2 p-6 sm:p-8 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <MapPin className="w-3.5 h-3.5 text-[#1FB5A0]" />
              <span className="font-bold text-stone-700">{discovery.locality}</span>
              {discovery.restaurant_name && (
                <>
                  <span>•</span>
                  <span className="text-stone-600 font-medium">{discovery.restaurant_name}</span>
                </>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-stone-900 group-hover:text-[#1FB5A0] transition-colors leading-tight">
              {discovery.title}
            </h3>

            <p className="text-sm text-stone-600 line-clamp-3 leading-relaxed">
              {discovery.short_description}
            </p>

            {discovery.dish_name && (
              <div className="p-3 rounded-2xl bg-[#FAFAF7] border border-[#E7E2DA]/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Signature Dish:</span>
                  <div className="font-bold text-stone-800">{discovery.dish_name}</div>
                </div>
                {discovery.price !== undefined && (
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 ${priceBadge.bg}`}>
                    <BadgeIcon className="w-3 h-3" />
                    <span>{priceBadge.label}</span>
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#1FB5A0]/10 text-[#1FB5A0] flex items-center justify-center font-bold text-xs">
                {(discovery.contributor_name || 'M').charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-bold text-stone-800">{discovery.contributor_name || 'Menu Maps Contributor'}</div>
                {discovery.contributor_college && (
                  <div className="text-[10px] text-stone-400">{discovery.contributor_college}</div>
                )}
              </div>
            </div>

            <span className="inline-flex items-center gap-1 font-bold text-[#1FB5A0] group-hover:translate-x-1 transition-transform">
              <span>Read Story</span>
              <ChevronRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Standard Editorial Card Variant
  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-3xl border border-[#E7E2DA] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between"
    >
      <div>
        <div className="relative h-48 sm:h-52 overflow-hidden bg-stone-100">
          <img
            src={discovery.main_image}
            alt={discovery.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-stone-900 text-[10px] font-black uppercase tracking-wider shadow-xs">
              {discovery.category}
            </span>
          </div>

          {discovery.price !== undefined && (
            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-xl bg-white/95 backdrop-blur-md text-stone-900 shadow-xs flex items-center gap-1">
              <span className="text-[10px] text-stone-500 font-bold">₹</span>
              <span className="text-xs font-black text-[#FF6B4A]">{discovery.price}</span>
            </div>
          )}

          <div className="absolute bottom-3 left-3 right-16">
            <div className="flex items-center gap-1 text-[11px] font-bold text-white drop-shadow-sm">
              <MapPin className="w-3 h-3 text-[#1FB5A0]" />
              <span className="truncate">{discovery.locality}</span>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-2.5">
          <h3 className="text-base sm:text-lg font-black text-stone-900 group-hover:text-[#1FB5A0] transition-colors leading-snug line-clamp-2">
            {discovery.title}
          </h3>

          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
            {discovery.short_description}
          </p>

          {discovery.restaurant_name && (
            <div className="text-[11px] font-bold text-stone-500 flex items-center gap-1">
              <span>At:</span>
              <span className="text-stone-800 truncate">{discovery.restaurant_name}</span>
            </div>
          )}

          {discovery.price_type && (
            <div className="pt-1">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${priceBadge.bg}`}>
                <BadgeIcon className="w-3 h-3" />
                <span>{priceBadge.label}</span>
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-5 pt-0">
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px]">
          <span className="text-stone-500 truncate max-w-[150px]">
            By <strong className="text-stone-700">{discovery.contributor_name}</strong>
          </span>
          <span className="font-bold text-[#1FB5A0] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 shrink-0">
            <span>Explore</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
