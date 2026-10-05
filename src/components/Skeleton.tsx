import React from 'react';

export const RestaurantCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-[#EFEAE2] shadow-xs animate-pulse">
      <div className="h-52 bg-stone-200" />
      <div className="p-5 space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-6 bg-stone-200 rounded-lg w-2/3" />
          <div className="h-6 bg-stone-200 rounded-lg w-12" />
        </div>
        <div className="h-4 bg-stone-100 rounded-md w-1/2" />
        <div className="flex gap-2 pt-3 border-t border-[#EFEAE2]">
          <div className="h-3.5 bg-stone-100 rounded-md w-16" />
          <div className="h-3.5 bg-stone-100 rounded-md w-24" />
        </div>
      </div>
    </div>
  );
};

export const FoodCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-[#EFEAE2] shadow-xs animate-pulse p-4 flex gap-4">
      <div className="w-20 h-20 bg-stone-200 rounded-2xl shrink-0" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-5 bg-stone-200 rounded-md w-3/4" />
        <div className="h-3.5 bg-stone-100 rounded-md w-1/2" />
        <div className="h-4 bg-stone-200 rounded-md w-1/4 pt-1" />
      </div>
    </div>
  );
};

export const CollectionCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-3xl overflow-hidden h-64 bg-stone-900 animate-pulse relative border border-stone-800">
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/50 to-transparent" />
      <div className="absolute bottom-5 left-5 right-5 space-y-2.5">
        <div className="h-6 bg-stone-700 rounded-lg w-2/3" />
        <div className="h-4 bg-stone-800 rounded-md w-1/3" />
      </div>
    </div>
  );
};
