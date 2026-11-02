/**
 * Menu Maps Discovery - Food Discovery Card
 * Displays a community-contributed food gem with strict verification state badge.
 */

import React from 'react';
import { MapPin, ShieldCheck, Clock, User, Utensils, AlertCircle } from 'lucide-react';
import { FoodDiscoveryItem, FoodDiscoveryVerificationStatus } from '../types/discovery';

interface FoodDiscoveryCardProps {
  item: FoodDiscoveryItem;
  navigate?: (path: string) => void;
}

const getVerificationBadge = (status: FoodDiscoveryVerificationStatus) => {
  switch (status) {
    case 'Verified by Menu Maps':
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        icon: ShieldCheck,
        label: 'Verified by Menu Maps',
        sub: 'Counter prices cross-checked in store',
      };
    case 'Student Submitted':
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        icon: Clock,
        label: 'Community Submitted',
        sub: 'Independent review in progress',
      };
    case 'Awaiting Review':
      return {
        bg: 'bg-sky-50 text-sky-800 border-sky-200',
        icon: Clock,
        label: 'Under Verification',
        sub: 'Field team checking menu rates',
      };
    default:
      return {
        bg: 'bg-stone-50 text-stone-700 border-stone-200',
        icon: AlertCircle,
        label: status,
        sub: '',
      };
  }
};

export const FoodDiscoveryCard: React.FC<FoodDiscoveryCardProps> = ({ item, navigate }) => {
  const badgeInfo = getVerificationBadge(item.verification_status);
  const BadgeIcon = badgeInfo.icon;

  const displayAuthor =
    item.public_attribution_preference === 'Anonymous'
      ? 'Anonymous Explorer'
      : item.contributor_name || 'Community Contributor';

  return (
    <div className="bg-white border border-[#E7E2DA] rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Cover Photo */}
        <div className="relative aspect-video w-full overflow-hidden bg-stone-100">
          {item.photo_urls && item.photo_urls.length > 0 ? (
            <img
              src={item.photo_urls[0]}
              alt={item.food_place_name}
              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-orange-50 text-[#FF5A36]">
              <Utensils className="w-10 h-10 opacity-40" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Top Location Pill */}
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold">
              <MapPin className="w-3 h-3 text-[#FF5A36]" />
              <span>{item.neighbourhood}</span>
            </span>
          </div>

          {/* Category Tag */}
          <div className="absolute bottom-3 left-3">
            <span className="px-2.5 py-0.5 rounded-md bg-[#0F766E] text-white text-[10px] font-black uppercase tracking-wider">
              {item.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-3">
          {/* Strict Verification Badge */}
          <div className={`p-2.5 rounded-2xl border flex items-start gap-2 ${badgeInfo.bg}`}>
            <BadgeIcon className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-black leading-tight">{badgeInfo.label}</div>
              {badgeInfo.sub && <div className="text-[11px] opacity-80 mt-0.5">{badgeInfo.sub}</div>}
            </div>
          </div>

          <h3 className="hd text-lg font-bold text-[#1C1917] leading-snug">
            {item.food_place_name}
          </h3>

          <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-[#FAF8F5] border border-[#E7E2DA]">
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Featured Dish</span>
              <span className="font-bold text-sm text-[#1C1917] truncate block">{item.featured_dish}</span>
            </div>
            {item.counter_price_observed ? (
              <div className="text-right shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                  {item.verification_status === 'Verified by Menu Maps' ? 'Verified Counter' : 'Reported Rate'}
                </span>
                <span className="font-black text-sm text-[#0F766E]">₹{item.verified_counter_rate || item.counter_price_observed}</span>
              </div>
            ) : null}
          </div>

          <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed line-clamp-3">
            {item.evidence_description}
          </p>

          <p className="text-[11px] text-stone-400 truncate">
            {item.full_address}
          </p>
        </div>
      </div>

      {/* Contributor Credit Footer */}
      <div className="p-5 sm:p-6 pt-0 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
        <div className="flex items-center gap-1.5 min-w-0">
          <User className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
          <span className="truncate font-semibold">Found by {displayAuthor}</span>
        </div>
        <span className="text-[11px] text-stone-400 shrink-0">
          {new Date(item.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
        </span>
      </div>
    </div>
  );
};
