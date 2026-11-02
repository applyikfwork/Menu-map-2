/**
 * Menu Maps Discovery - Student Creations Gallery (/discovery/creations)
 * Searchable, filterable gallery of approved student food maps, apps, posters, and concepts.
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, Search, ArrowLeft, Filter, Layers } from 'lucide-react';
import { discoveryApi } from '../lib/discoveryApi';
import { StudentProject, ProjectCategory } from '../types/discovery';
import { DiscoveryNavbar } from '../components/DiscoveryNavbar';
import { StudentProjectCard } from '../components/StudentProjectCard';

interface StudentCreationsProps {
  navigate: (path: string) => void;
}

const CATEGORIES: Array<'all' | ProjectCategory> = [
  'all',
  'Food Map',
  'Digital Prototype',
  'App Design',
  'Creative Poster',
  'Food Trail Concept',
  'Research Paper',
  'Short Video',
  'Visual Concept',
  'Presentation',
];

export const StudentCreations: React.FC<StudentCreationsProps> = ({ navigate }) => {
  const [projects, setProjects] = useState<StudentProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'all' | ProjectCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await discoveryApi.getStudentProjects();
      setProjects(data);
    } finally {
      setLoading(false);
    }
  };

  const filtered = projects.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.creator_name.toLowerCase().includes(q) ||
        (p.creator_college && p.creator_college.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917]">
      <DiscoveryNavbar currentPath="/discovery/creations" navigate={navigate} />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 py-10 sm:py-14">
        {/* Header */}
        <div className="space-y-3 mb-8">
          <button
            onClick={() => navigate('/discovery')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Discovery Overview</span>
          </button>

          <h1 className="hd text-3xl sm:text-5xl font-black text-[#1C1917]">
            Student Creations & Portfolios
          </h1>

          <p className="text-sm sm:text-base text-stone-500 max-w-2xl leading-relaxed">
            Explore accepted projects from university students across Delhi NCR. From handcrafted neighborhood food maps to full Figma app prototypes and research papers.
          </p>
        </div>

        {/* Toolbar */}
        <div className="bg-white border border-[#E7E2DA] rounded-3xl p-4 sm:p-5 shadow-2xs mb-8 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student projects by title, creator name, or college..."
              className="w-full bg-[#FAF8F5] border border-[#E7E2DA] focus:border-[#0F766E] rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium outline-hidden"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#0F766E] text-white shadow-2xs'
                    : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                {cat === 'all' ? 'All Creations' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#0F766E] border-t-transparent animate-spin mx-auto mb-3" />
            <span className="text-xs text-stone-500 font-semibold">Loading student projects...</span>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((proj) => (
              <StudentProjectCard key={proj.id} project={proj} navigate={navigate} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-dashed border-[#E7E2DA] rounded-3xl p-12 text-center space-y-3">
            <Sparkles className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="hd text-lg font-bold text-stone-700">No student creations have been published yet</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Approved work submitted to our ongoing creative challenges will appear here once reviewed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
