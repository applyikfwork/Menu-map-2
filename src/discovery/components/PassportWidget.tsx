/**
 * Menu Maps Discovery - Passport Widget
 * Renders the distinctive digital exploration passport booklet with official stamps.
 */

import React from 'react';
import { Compass, CheckCircle2, Lock, Sparkles, Award, ShieldCheck, MapPin } from 'lucide-react';
import { StudentProfile, PassportStamp } from '../types/discovery';
import { OFFICIAL_PASSPORT_STAMPS } from '../lib/discoveryPassport';

interface PassportWidgetProps {
  profile: StudentProfile;
  earnedStamps: PassportStamp[];
  compact?: boolean;
}

export const PassportWidget: React.FC<PassportWidgetProps> = ({
  profile,
  earnedStamps,
  compact = false,
}) => {
  const earnedKeySet = new Set(earnedStamps.map((s) => s.stamp_key));
  const passportNumber = `MM-DL-${profile.id.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase()}`;

  return (
    <div className="bg-gradient-to-br from-[#1C1917] via-stone-900 to-[#14110F] text-white rounded-[32px] p-6 sm:p-8 shadow-xl border border-amber-500/30 relative overflow-hidden">
      {/* Background Decorative Rings */}
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full border border-amber-500/10 pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full border border-amber-500/10 pointer-events-none" />

      {/* Passport Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-2xl shadow-inner">
            🧭
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                Menu Maps Official Discovery Passport
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[9px] font-bold">
                Verified Citizen
              </span>
            </div>
            <h3 className="hd text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              {profile.full_name}
            </h3>
            {profile.college_name && (
              <p className="text-xs text-stone-400">{profile.college_name}</p>
            )}
          </div>
        </div>

        <div className="text-right sm:text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
            Passport ID
          </span>
          <span className="font-mono text-sm sm:text-base font-black text-amber-300 tracking-wider">
            {passportNumber}
          </span>
          <span className="text-[10px] text-stone-400 block mt-0.5">
            Level: <strong className="text-white">{profile.contributor_level}</strong>
          </span>
        </div>
      </div>

      {/* Stamps Count & Subhead */}
      <div className="pt-6 pb-4 flex items-center justify-between relative z-10">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-300">
            Field Exploration Stamps
          </h4>
          <p className="text-xs text-stone-400 mt-0.5">
            {earnedStamps.length} of {OFFICIAL_PASSPORT_STAMPS.length} stamps unlocked
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-amber-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{profile.total_credits || 0} Credits</span>
        </div>
      </div>

      {/* Stamps Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 relative z-10">
        {OFFICIAL_PASSPORT_STAMPS.map((stampDef) => {
          const isUnlocked = earnedKeySet.has(stampDef.stamp_key);
          const earnedInfo = earnedStamps.find((s) => s.stamp_key === stampDef.stamp_key);

          return (
            <div
              key={stampDef.stamp_key}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col justify-between relative ${
                isUnlocked
                  ? 'bg-stone-800/80 border-amber-400/50 shadow-md ring-1 ring-amber-400/20'
                  : 'bg-stone-900/50 border-white/5 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{stampDef.icon}</span>
                  {isUnlocked ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  ) : (
                    <Lock className="w-3 h-3 text-stone-500" />
                  )}
                </div>

                <h5 className="font-bold text-xs sm:text-sm text-white leading-snug line-clamp-1">
                  {stampDef.name}
                </h5>

                <p className="text-[11px] text-stone-400 leading-tight mt-1 line-clamp-2">
                  {stampDef.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-white/10 text-[10px]">
                {isUnlocked && earnedInfo ? (
                  <span className="text-emerald-400 font-bold block truncate">
                    Earned {new Date(earnedInfo.earned_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </span>
                ) : (
                  <span className="text-stone-500 block truncate" title={stampDef.unlock_condition}>
                    {stampDef.unlock_condition}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
