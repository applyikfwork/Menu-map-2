/**
 * Menu Maps Discovery - Sub-Navigation Bar
 * Editorial secondary navigation for the Discovery ecosystem.
 */

import React, { useState } from 'react';
import {
  Compass,
  Trophy,
  Sparkles,
  MapPin,
  Users,
  Award,
  BookOpen,
  User,
  LogOut,
  Bell,
  ChevronRight,
  ExternalLink,
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
  const { student, isAuthenticated, logout, unreadNotificationsCount } = useStudentAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Overview', path: '/discovery', icon: Compass },
    { id: 'competitions', label: 'Competitions', path: '/discovery/competitions', icon: Trophy },
    { id: 'discoveries', label: 'Food Discoveries', path: '/discovery/food-discoveries', icon: MapPin },
    { id: 'trails', label: 'Food Trails', path: '/discovery/trails', icon: BookOpen },
    { id: 'creations', label: 'Student Creations', path: '/discovery/creations', icon: Sparkles },
    { id: 'contributors', label: 'Contributors', path: '/discovery/contributors', icon: Users },
    { id: 'hall-of-fame', label: 'Hall of Fame', path: '/discovery/hall-of-fame', icon: Award },
  ];

  return (
    <div className="bg-white/90 backdrop-blur-md border-b border-[#E7E2DA] sticky top-16 sm:top-20 z-40">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 h-13 sm:h-14 flex items-center justify-between gap-3">
        {/* Horizontal Scroll Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-1">
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-[#0F766E] text-white shadow-xs'
                    : 'text-[#57534E] hover:text-[#1C1917] hover:bg-stone-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#78716C]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Section: My Discovery or Sign In */}
        <div className="flex items-center gap-2 shrink-0">
          {isAuthenticated && student ? (
            <div className="relative">
              <button
                onClick={() => navigate('/discovery/dashboard')}
                className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 transition-colors text-xs font-bold text-emerald-900 cursor-pointer"
                title="Go to My Discovery Dashboard"
              >
                {student.avatar_url ? (
                  <img
                    src={student.avatar_url}
                    alt={student.full_name}
                    className="w-5 h-5 rounded-full object-cover border border-emerald-300"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[#0F766E] text-white flex items-center justify-center text-[10px] font-black">
                    {student.full_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:inline truncate max-w-[120px]">{student.full_name}</span>
                <span className="px-1.5 py-0.2 rounded-md bg-[#0F766E] text-white text-[9px] font-black tracking-wide">
                  {student.contributor_level}
                </span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => onOpenAuth ? onOpenAuth('login') : navigate('/discovery/login')}
              className="btn bg-[#0F766E] hover:bg-[#0D9488] text-white px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>Student Portal</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
