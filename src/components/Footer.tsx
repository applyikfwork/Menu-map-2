import React from 'react';
import { ShieldCheck, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { MenuMapLogo } from './Logo';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="bg-[#14110F] text-white border-t border-[#292524] mt-auto">
      <div className="max-w-[1280px] mx-auto px-6 sm:px-8 pt-12 pb-28 md:pb-10">
        {/* Medium-sized Cafe Owner Acquisition Banner */}
        <div className="bg-gradient-to-r from-stone-900 via-[#1C1917] to-stone-900 rounded-2xl p-4 sm:p-5 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4 mb-8 border border-white/10 ring-1 ring-white/5">
          <div className="space-y-1 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FF5A36]/15 text-[#FF8A6B] text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-[#FF5A36]" />
              <span>For Delhi NCR Cafe Owners</span>
            </div>
            <h3 className="font-heading font-bold text-base sm:text-lg text-white tracking-tight">
              Own or Manage a Cafe in Delhi? List It on MenuMaps
            </h3>
            <p className="text-xs text-stone-300 max-w-xl leading-relaxed">
              Showcase authentic counter prices, stop paying 35% commissions, and capture direct walk-in WhatsApp orders.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2.5 w-full md:w-auto justify-center">
            <button
              onClick={() => navigate('/list-cafe')}
              className="px-4 py-2.5 rounded-xl bg-[#FF5A36] hover:bg-[#e04826] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs hover:scale-102 active:scale-98 transition-all cursor-pointer"
            >
              <span>List Your Cafe (Free)</span>
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </button>
            <button
              onClick={() => navigate('/owner/login')}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-stone-200 font-medium text-xs transition-all cursor-pointer text-center"
            >
              Owner Login
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-12 justify-between pb-12 border-b border-[#292524]">
          {/* Brand Info */}
          <div className="flex-1 min-w-[280px] max-w-md">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-3 text-left group transition-transform active:scale-95"
            >
              <MenuMapLogo size={40} className="shrink-0" />
              <span className="hd text-3xl font-extrabold text-white">
                Menu<span className="text-[#FF5A36]">Maps</span>
              </span>
            </button>
            <p className="mt-4 text-[15px] leading-relaxed text-[#A8A29E]">
              Real menus, verified counter prices and iconic neighbourhood food trails. Curated from verified storefront records, community patrons, and public data.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-[#5EEAD4]">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2DD4BF]" />
                0% Restaurant Commission
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                Direct WhatsApp Ordering
              </span>
            </div>
          </div>

          {/* Nav Columns */}
          <div className="flex flex-wrap gap-10 sm:gap-16">
            {/* Discover */}
            <div>
              <div className="hd text-xs font-extrabold tracking-wider uppercase text-[#78716C]">
                Discover
              </div>
              <div className="mt-4 flex flex-col gap-2.5 text-[15px]">
                <a
                  href="/restaurants"
                  onClick={(e) => { e.preventDefault(); navigate('/restaurants'); }}
                  className="nl text-left transition-colors hover:text-[#FF8A6B]"
                >
                  Restaurants & Cafes
                </a>
                <a
                  href="/nearby"
                  onClick={(e) => { e.preventDefault(); navigate('/nearby'); }}
                  className="nl text-left transition-colors hover:text-[#FF8A6B]"
                >
                  Best Cafes Near Me
                </a>
                <a
                  href="/iconic-area"
                  onClick={(e) => { e.preventDefault(); navigate('/iconic-area'); }}
                  className="nl text-left transition-colors hover:text-[#FF8A6B]"
                >
                  Iconic Areas
                </a>
                <a
                  href="/collections"
                  onClick={(e) => { e.preventDefault(); navigate('/collections'); }}
                  className="nl text-left transition-colors hover:text-[#FF8A6B]"
                >
                  Curated Collections
                </a>
                <a
                  href="/search"
                  onClick={(e) => { e.preventDefault(); navigate('/search'); }}
                  className="nl text-left transition-colors hover:text-[#FF8A6B]"
                >
                  Search Dishes
                </a>
                <a
                  href="/bookmarks"
                  onClick={(e) => { e.preventDefault(); navigate('/bookmarks'); }}
                  className="nl text-left transition-colors hover:text-[#FF8A6B]"
                >
                  Saved Bookmarks
                </a>
              </div>
            </div>

            {/* Owners */}
            <div>
              <div className="hd text-xs font-extrabold tracking-wider uppercase text-[#78716C]">
                Owners
              </div>
              <div className="mt-4 flex flex-col gap-2.5 text-[15px]">
                <a
                  href="/list-cafe"
                  onClick={(e) => { e.preventDefault(); navigate('/list-cafe'); }}
                  className="nl text-left font-bold text-[#FF8A6B] hover:text-[#FF5A36] flex items-center gap-1.5"
                >
                  <span>List your cafe</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#FF5A36]/20 text-[#FF8A6B] font-black uppercase">Free</span>
                </a>
                <a
                  href="/list-cafe"
                  onClick={(e) => { e.preventDefault(); navigate('/list-cafe'); }}
                  className="nl text-left transition-colors hover:text-[#FF8A6B]"
                >
                  Claim your page
                </a>
                <a
                  href="/owner/login"
                  onClick={(e) => { e.preventDefault(); navigate('/owner/login'); }}
                  className="nl text-left transition-colors hover:text-[#FF8A6B]"
                >
                  Owner login
                </a>
                <a
                  href="/contact"
                  onClick={(e) => { e.preventDefault(); navigate('/contact'); }}
                  className="nl text-left transition-colors hover:text-[#FF8A6B]"
                >
                  Free QR standee
                </a>
                <a
                  href="/admin-secure-panel2010"
                  onClick={(e) => { e.preventDefault(); navigate('/admin-secure-panel2010'); }}
                  className="nl text-left transition-colors hover:text-[#FF8A6B] flex items-center gap-1 text-xs text-stone-500"
                >
                  <Lock className="w-3 h-3" />
                  <span>Admin portal</span>
                </a>
              </div>
            </div>

            {/* MenuMap Info */}
            <div>
              <div className="hd text-xs font-extrabold tracking-wider uppercase text-[#78716C]">
                MenuMap
              </div>
              <div className="mt-4 flex flex-col gap-2.5 text-[15px]">
                <a
                  href="/about"
                  onClick={(e) => { e.preventDefault(); navigate('/about'); }}
                  className="nl text-left transition-colors hover:text-[#FF8A6B]"
                >
                  About us
                </a>
                <a
                  href="/contact"
                  onClick={(e) => { e.preventDefault(); navigate('/contact'); }}
                  className="nl text-left transition-colors hover:text-[#FF8A6B]"
                >
                  Contact & Support
                </a>
                <a
                  href="/privacy"
                  onClick={(e) => { e.preventDefault(); navigate('/privacy'); }}
                  className="nl text-left transition-colors hover:text-[#FF8A6B]"
                >
                  Privacy policy
                </a>
                <a
                  href="/terms"
                  onClick={(e) => { e.preventDefault(); navigate('/terms'); }}
                  className="nl text-left transition-colors hover:text-[#FF8A6B]"
                >
                  Terms of service
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Public domain disclaimer */}
        <div className="py-6 border-b border-[#292524] text-xs text-[#78716C] leading-relaxed space-y-2">
          <p>
            <strong className="text-stone-400">Independent Directory:</strong> Menu Maps is an independent culinary directory celebrating food culture, cafes, and iconic eateries across Delhi NCR. All trademarks, photos, and brand marks belong to their respective owners. Counter prices are verified from public storefront records, community patrons, and direct submissions.
          </p>
          <p>
            Restaurants do not pay listing fees or commissions. Final orders placed via WhatsApp are fulfilled directly by each restaurant at their counter rates.
          </p>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-[#78716C]">
          <span>© {new Date().getFullYear()} Menu Maps. Real menus. Real prices. No markup.</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-stone-400">
              <span className="w-2 h-2 rounded-full bg-[#2DD4BF]"></span>
              Delhi NCR
            </span>
            <span>•</span>
            <span className="text-[#FF5A36] font-semibold">0% Commission</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
