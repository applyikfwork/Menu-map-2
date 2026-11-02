/**
 * Menu Maps Discovery - Responsive Sub-Navigation Bar
 * Unified, sleek navigation bar for the Discovery ecosystem.
 * Responsive across mobile (<640px), tablet (640px-1024px), and desktop (>1024px).
 */

import React from 'react';
import {
  Compass,
  Trophy,
  Sparkles,
  MapPin,
  BookOpen,
  Award,
  User,
  Users,
} from 'lucide-react';
import { useStudentAuth } from '../context/StudentAuthContext';

interface DiscoveryNavbarProps {
  currentPath?: string;
  activeTab?: string;
  navigate: (path: string) => void;
  onOpenAuth?: (initialMode?: 'login' | 'register') => void;
}

export const DiscoveryNavbar: React.FC<DiscoveryNavbarProps> = ({
  currentPath: propCurrentPath,
  activeTab,
  navigate,
  onOpenAuth,
}) => {
  const currentPath =
    propCurrentPath || (typeof window !== 'undefined' ? window.location.pathname : '/discovery');
  const { student, isAuthenticated } = useStudentAuth();

  const navItems = [
    { id: 'overview', label: 'Overview', path: '/discovery', icon: Compass },
    { id: 'competitions', label: 'Competitions', path: '/discovery/competitions', icon: Trophy },
    { id: 'discoveries', label: 'Discoveries', path: '/discovery/food-discoveries', icon: MapPin },
    { id: 'trails', label: 'Food Trails', path: '/discovery/trails', icon: BookOpen },
    { id: 'creations', label: 'Creations', path: '/discovery/creations', icon: Sparkles },
    { id: 'hall-of-fame', label: 'Hall of Fame', path: '/discovery/hall-of-fame', icon: Award, desktopOnly: true },
    { id: 'contributors', label: 'Contributors', path: '/discovery/contributors', icon: Users, desktopOnly: true },
  ];

  return (
    <div className="bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E7E2DA]/80 sticky top-16 sm:top-20 z-40 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all">
      <div className="max-w-[1280px] mx-auto px-3 sm:px-6 md:px-8 h-11 sm:h-12 flex items-center justify-between gap-2 sm:gap-4">
        {/* Navigation Links with Mobile Edge Mask */}
        <div className="relative flex-1 min-w-0 overflow-hidden">
          <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-1 scroll-smooth">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                activeTab === item.id ||
                (item.path === '/discovery'
                  ? currentPath === '/discovery' || currentPath === '/discovery/'
                  : currentPath.startsWith(item.path));

              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                    item.desktopOnly ? 'hidden md:flex' : 'flex'
                  } ${
                    isActive
                      ? 'bg-[#0F766E] text-white shadow-2xs font-bold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 font-medium'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-stone-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Section: My Discovery Dashboard or Student Portal */}
        <div className="flex items-center gap-1.5 shrink-0 pl-1">
          {isAuthenticated && student ? (
            <button
              onClick={() => navigate('/discovery/dashboard')}
              className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-200 text-[#0F766E] text-[11px] sm:text-xs font-bold transition-all shadow-2xs cursor-pointer"
              title="Go to My Discovery Dashboard"
            >
              {student.avatar_url ? (
                <img
                  src={student.avatar_url}
                  alt={student.full_name}
                  className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover border border-emerald-300"
                />
              ) : (
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#0F766E] text-white flex items-center justify-center text-[9px] font-black">
                  {student.full_name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="hidden sm:inline truncate max-w-[100px]">{student.full_name}</span>
              <span className="px-1.5 py-0.5 rounded-md bg-[#0F766E] text-white text-[9px] font-black uppercase">
                {student.contributor_level || 'L1'}
              </span>
            </button>
          ) : (
            <button
              onClick={() => (onOpenAuth ? onOpenAuth('login') : navigate('/discovery/login'))}
              className="px-3 py-1 sm:py-1.5 bg-[#0F766E] hover:bg-[#0d635c] text-white text-[11px] sm:text-xs font-bold rounded-full flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer whitespace-nowrap"
            >
              <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Student Portal</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
