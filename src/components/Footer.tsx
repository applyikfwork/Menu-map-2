import React from 'react';
import { Heart, ShieldCheck, Clock, MapPin, Lock } from 'lucide-react';
import { MenuMapLogo } from './Logo';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-stone-800">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-3 group text-left transition-transform active:scale-95"
            >
              <div className="w-12 h-12 rounded-2xl bg-white p-1.5 shadow-lg shadow-orange-500/10 flex items-center justify-center group-hover:rotate-6 transition-transform">
                <MenuMapLogo className="w-full h-full" />
              </div>
              <span className="font-heading font-extrabold text-2xl text-white tracking-tight">
                Menu Map
              </span>
            </button>
            <p className="text-sm text-stone-400 max-w-sm leading-relaxed">
              Your ultimate cafe and restaurant guide with authentic menus, transparent pricing, accurate coordinates, and curated foodie collections.
            </p>
            <div className="flex flex-wrap gap-4 text-xs font-medium text-stone-400 pt-2">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Verified Menus
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                Updated Regularly
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-400" />
                Precise Geolocation
              </span>
            </div>
          </div>

          {/* Quick Discover */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-white text-base tracking-wide uppercase text-xs">
              Discovery
            </h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <button
                  onClick={() => navigate('/restaurants')}
                  className="hover:text-white transition-colors"
                >
                  All Restaurants & Cafes
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/iconic-area')}
                  className="hover:text-white transition-colors"
                >
                  Iconic Area Food Guides
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/nearby')}
                  className="hover:text-white transition-colors"
                >
                  Cafes Near Me
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/bookmarks')}
                  className="hover:text-white transition-colors"
                >
                  Saved Bookmarks
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Admin */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-white text-base tracking-wide uppercase text-xs">
              Company & Admin
            </h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <button
                  onClick={() => navigate('/about')}
                  className="hover:text-white transition-colors"
                >
                  About Menu Map
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/contact')}
                  className="hover:text-white transition-colors"
                >
                  Contact & Support
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/privacy')}
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/terms')}
                  className="hover:text-white transition-colors"
                >
                  Terms of Service
                </button>
              </li>
              <li className="pt-2">
                <button
                  onClick={() => navigate('/admin-secure-panel2010')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-rose-400 hover:text-rose-300 font-bold text-xs border border-stone-700 transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Admin Access</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Public Domain & Indicative Price Disclaimer */}
        <div className="py-8 border-b border-stone-800/80 text-[11px] text-stone-400 space-y-3">
          <div className="flex items-center gap-2 text-stone-300 font-bold uppercase tracking-wider text-[10px]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Independent Directory & Price Disclaimer</span>
          </div>
          <p className="leading-relaxed text-stone-400">
            <strong>Public Domain Notice:</strong> Menu Map is an independent culinary directory celebrating food culture, cafes, and iconic eateries. All business names, logos, registered trademarks, and third-party photos remain the intellectual property of their respective owners. Menus, dish ingredients, and prices displayed across Menu Map are compiled from publicly accessible platforms, community patrons, verified storefront photographs, and public map records for informational reference only.
          </p>
          <p className="leading-relaxed text-stone-400">
            <strong>Price & Availability Notice:</strong> While we continuously verify and refresh our database, food prices, ingredient formulations, taxes, and seasonal availability are subject to periodic changes by individual establishments without prior notice. Final bills and table/delivery arrangements are confirmed directly by the respective restaurant at the time of your order or visit. Menu Map does not charge patron commission or delivery markups.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-stone-400 pt-1">
            <span>Are you an authorized restaurant owner or patron?</span>
            <button
              onClick={() => navigate('/contact')}
              className="text-orange-400 hover:text-orange-300 font-semibold underline decoration-orange-500/50 underline-offset-2 transition-colors"
            >
              Report a Menu Change or Claim Your Listing Free →
            </button>
          </div>
        </div>

        {/* Copyright notice & bottom admin link */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} Menu Map. Real menus. Real food. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin-secure-panel2010')}
              className="text-stone-500 hover:text-stone-300 transition-colors flex items-center gap-1 text-[11px]"
            >
              <Lock className="w-3 h-3" />
              <span>Admin Portal</span>
            </button>
            <span>•</span>
            <p className="flex items-center gap-1">
              Crafted for passionate foodies & cafe lovers
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

