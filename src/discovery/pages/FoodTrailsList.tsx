/**
 * Menu Maps Discovery - Food Trails List (/discovery/trails)
 * Directory of student-curated food walks, street trails, and neighborhood food crawls.
 */

import React, { useState, useEffect } from 'react';
import { BookOpen, MapPin, Search, ArrowLeft, Plus } from 'lucide-react';
import { discoveryApi } from '../lib/discoveryApi';
import { StudentFoodTrail } from '../types/discovery';
import { DiscoveryNavbar } from '../components/DiscoveryNavbar';
import { FoodTrailCard } from '../components/FoodTrailCard';
import { useStudentAuth } from '../context/StudentAuthContext';

interface FoodTrailsListProps {
  navigate: (path: string) => void;
}

export const FoodTrailsList: React.FC<FoodTrailsListProps> = ({ navigate }) => {
  const { isAuthenticated } = useStudentAuth();
  const [trails, setTrails] = useState<StudentFoodTrail[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTrails();
  }, []);

  const loadTrails = async () => {
    setLoading(true);
    try {
      const data = await discoveryApi.getFoodTrails(true);
      setTrails(data);
    } finally {
      setLoading(false);
    }
  };

  const filtered = trails.filter((t) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        t.title.toLowerCase().includes(q) ||
        t.neighbourhood.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.creator_name.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917]">
      <DiscoveryNavbar currentPath="/discovery/trails" navigate={navigate} />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 py-10 sm:py-14">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div className="space-y-3 max-w-2xl">
            <button
              onClick={() => navigate('/discovery')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Discovery Overview</span>
            </button>

            <h1 className="hd text-3xl sm:text-5xl font-black text-[#1C1917]">
              Student Food Trails
            </h1>

            <p className="text-sm sm:text-base text-stone-500 leading-relaxed">
              Curated walking itineraries created by university students. Discover the best sequential food stops, must-try specialties, and exact per-person budgets.
            </p>
          </div>

          <button
            onClick={() => {
              if (isAuthenticated) navigate('/discovery/dashboard?tab=contributions');
              else navigate('/discovery/login');
            }}
            className="btn bg-[#0F766E] hover:bg-[#0D9488] text-white px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Submit a Food Trail</span>
          </button>
        </div>

        {/* Search */}
        <div className="bg-white border border-[#E7E2DA] rounded-3xl p-4 shadow-2xs mb-8">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search food trails by neighbourhood (e.g. Kamla Nagar, CR Park, Jama Masjid)..."
              className="w-full bg-[#FAF8F5] border border-[#E7E2DA] focus:border-[#0F766E] rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium outline-hidden"
            />
          </div>
        </div>

        {/* Trails Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#0F766E] border-t-transparent animate-spin mx-auto mb-3" />
            <span className="text-xs text-stone-500 font-semibold">Loading student food trails...</span>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((t) => (
              <FoodTrailCard key={t.id} trail={t} navigate={navigate} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-dashed border-[#E7E2DA] rounded-3xl p-12 text-center space-y-3">
            <BookOpen className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="hd text-lg font-bold text-stone-700">No food trails published yet</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Be the first student to map out your campus or neighbourhood trail!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
