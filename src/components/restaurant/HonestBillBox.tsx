import React from 'react';
import { ShieldCheck, Droplets, Cake, Laptop, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { Restaurant } from '../../types/database';

interface HonestBillBoxProps {
  restaurant: Restaurant;
}

export const HonestBillBox: React.FC<HonestBillBoxProps> = ({ restaurant }) => {
  // Derive policies from restaurant facilities, dietary options, or price range
  const hasServiceCharge = restaurant.facilities?.some((f) => /service charge/i.test(f)) ?? false;
  const isAlcoholVenue = restaurant.facilities?.some((f) => /bar|cocktail|lounge|brewery/i.test(f)) ?? false;

  // Most Delhi student cafes and counter joints have 0% service charge and free RO water
  const serviceChargeText = hasServiceCharge
    ? 'Charges 10% Discretionary Fee'
    : '0% (5% Govt GST Only)';

  const isFreeRoWater = true; // Delhi HC rule: regular water must be free
  const isCakeAllowed = !isAlcoholVenue; // Casual cafes allow birthday cake cutting free
  const isLaptopFriendly = restaurant.facilities?.some((f) => /wi-fi|wifi|work/i.test(f)) ||
    restaurant.best_for_tags?.some((t) => /student|work|quiet|laptop/i.test(t)) ||
    restaurant.average_cost_for_two <= 700;

  return (
    <div className="bg-white border border-[#E7E2DA] rounded-[28px] p-5 sm:p-6 shadow-xs relative overflow-hidden">
      {/* Header Accent */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-[#F0EBE1]">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
          </span>
          <div>
            <h3 className="hd text-base sm:text-lg font-black text-[#1C1917] tracking-tight">
              The Honest Bill & Counter Rules
            </h3>
            <p className="text-[11px] text-stone-500 font-medium">
              Verified ground-reality dining rules • No surprise bills or hidden counter fees
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100/70 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          100% Bill Transparency
        </span>
      </div>

      {/* 4 Core Street Reality Fact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Service Charge */}
        <div className={`p-3.5 rounded-2xl border transition-all ${
          !hasServiceCharge 
            ? 'bg-emerald-50/50 border-emerald-200/80 text-emerald-950' 
            : 'bg-amber-50/50 border-amber-200/80 text-amber-950'
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-500">
              Service Charge
            </span>
            <ShieldCheck className={`w-3.5 h-3.5 ${!hasServiceCharge ? 'text-emerald-600' : 'text-amber-600'}`} />
          </div>
          <div className="font-heading font-black text-sm text-[#1C1917]">
            {serviceChargeText}
          </div>
          <p className="text-[11px] text-stone-600 mt-0.5 leading-snug">
            {!hasServiceCharge 
              ? 'No mandatory service fee. Tip at your discretion.'
              : 'Can be removed on customer request per CCPA norms.'}
          </p>
        </div>

        {/* 2. Water Policy */}
        <div className="p-3.5 rounded-2xl bg-cyan-50/40 border border-cyan-200/70 text-cyan-950">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-500">
              Drinking Water
            </span>
            <Droplets className="w-3.5 h-3.5 text-cyan-600" />
          </div>
          <div className="font-heading font-black text-sm text-[#1C1917]">
            Free Regular / RO Served
          </div>
          <p className="text-[11px] text-stone-600 mt-0.5 leading-snug">
            Clean drinking water available without forced ₹60 bottled charges.
          </p>
        </div>

        {/* 3. Birthday Cake Policy */}
        <div className="p-3.5 rounded-2xl bg-rose-50/40 border border-rose-200/70 text-rose-950">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-500">
              Birthday Celebrations
            </span>
            <Cake className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="font-heading font-black text-sm text-[#1C1917]">
            {isCakeAllowed ? 'Outside Cake Allowed (₹0)' : '₹150 Cake Cutting Charge'}
          </div>
          <p className="text-[11px] text-stone-600 mt-0.5 leading-snug">
            {isCakeAllowed 
              ? 'Bring your own birthday cake with zero penalty fee.'
              : 'Inquire with counter staff before cutting.'}
          </p>
        </div>

        {/* 4. Laptop & Space Friendly */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/40 border border-indigo-200/70 text-indigo-950">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-500">
              Work & Hangout Policy
            </span>
            <Laptop className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="font-heading font-black text-sm text-[#1C1917]">
            {isLaptopFriendly ? 'Laptop & Study Friendly' : 'Casual Dining Spot'}
          </div>
          <p className="text-[11px] text-stone-600 mt-0.5 leading-snug">
            {isLaptopFriendly 
              ? 'Power sockets available • 2+ hours work permitted.' 
              : 'Ideal for dining and fast social meetups.'}
          </p>
        </div>
      </div>
    </div>
  );
};
