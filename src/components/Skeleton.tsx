import React from 'react';

export const RestaurantCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm animate-pulse">
      <div className="h-48 bg-slate-200" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-5 bg-slate-200 rounded w-2/3" />
          <div className="h-5 bg-slate-200 rounded w-12" />
        </div>
        <div className="h-4 bg-slate-100 rounded w-1/2" />
        <div className="flex gap-2 pt-2 border-t border-slate-100">
          <div className="h-3 bg-slate-100 rounded w-16" />
          <div className="h-3 bg-slate-100 rounded w-20" />
        </div>
      </div>
    </div>
  );
};

export const FoodCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm animate-pulse p-3 flex gap-3">
      <div className="w-24 h-24 bg-slate-200 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-100 rounded w-1/2" />
        <div className="h-4 bg-slate-200 rounded w-1/4 pt-1" />
      </div>
    </div>
  );
};

export const CollectionCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl overflow-hidden h-64 bg-slate-200 animate-pulse relative">
      <div className="absolute inset-0 bg-gradient-to-t from-slate-300 via-transparent to-transparent" />
      <div className="absolute bottom-4 left-4 right-4 space-y-2">
        <div className="h-5 bg-slate-300/80 rounded w-2/3" />
        <div className="h-3 bg-slate-300/60 rounded w-1/3" />
      </div>
    </div>
  );
};
