import React, { useState } from 'react';
import { Search, Compass, MapPin, Home } from 'lucide-react';
import { POPULAR_FOOD_HUBS } from '../lib/location';

interface NotFoundProps {
  navigate: (path: string) => void;
  message?: string;
}

export const NotFound: React.FC<NotFoundProps> = ({ 
  navigate, 
  message = "The page, cafe, or dish you are looking for doesn't exist or has moved." 
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-[70vh] max-w-4xl mx-auto px-4 sm:px-6 py-16 flex flex-col items-center justify-center text-center animate-fadeIn">
      <div className="w-20 h-20 rounded-3xl bg-orange-100 text-[#FF5A36] flex items-center justify-center font-heading font-black text-3xl shadow-sm mb-6">
        404
      </div>

      <h1 className="font-heading font-black text-3xl sm:text-5xl text-[#1C1917] tracking-tight">
        Off the Menu Maps
      </h1>
      <p className="mt-3 text-stone-600 max-w-md mx-auto text-sm sm:text-base font-sans leading-relaxed">
        {message}
      </p>

      {/* Quick Search Bar */}
      <form onSubmit={handleSearch} className="w-full max-w-md mt-8 flex items-center bg-white border border-[#EFEAE2] rounded-full p-1.5 shadow-sm focus-within:border-[#FF5A36] transition-all">
        <div className="pl-4 text-stone-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search cafes or dishes instead..."
          className="flex-1 px-3 py-2 text-xs font-medium bg-transparent text-[#1C1917] focus:outline-hidden placeholder-stone-400 font-sans"
        />
        <button
          type="submit"
          className="px-5 py-2.5 rounded-full bg-[#1C1917] hover:bg-black text-white text-xs font-bold transition-all shrink-0 cursor-pointer"
        >
          Search
        </button>
      </form>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="btn px-6 py-3 rounded-full bg-[#1C1917] hover:bg-black text-white text-xs font-extrabold flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Go to Homepage</span>
        </button>
        <button
          type="button"
          onClick={() => navigate('/restaurants')}
          className="btn px-6 py-3 rounded-full bg-white hover:bg-stone-50 border border-[#EFEAE2] text-[#1C1917] text-xs font-extrabold flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <Compass className="w-3.5 h-3.5 text-[#FF5A36]" />
          <span>Explore All 50+ Cafes</span>
        </button>
      </div>

      {/* Popular Food Hub Shortcuts */}
      <div className="mt-14 w-full border-t border-[#EFEAE2] pt-10">
        <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">
          Popular Delhi Foodie Hubs
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
          {POPULAR_FOOD_HUBS.slice(0, 6).map((hub) => (
            <button
              key={hub.id}
              type="button"
              onClick={() => navigate('/restaurants')}
              className="px-3.5 py-1.5 rounded-full bg-white hover:bg-orange-50 border border-[#EFEAE2] hover:border-orange-200 text-xs font-semibold text-stone-700 hover:text-[#FF5A36] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <MapPin className="w-3 h-3 text-[#FF5A36]" />
              <span>{hub.name.split('/')[0].trim()}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
