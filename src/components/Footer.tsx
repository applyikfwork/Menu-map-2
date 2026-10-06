import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';
import { MenuMapLogo } from './Logo';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="bg-[#14110F] text-white border-t border-[#292524] mt-auto">
      <div className="max-w-[1280px] mx-auto px-6 sm:px-8 pt-16 pb-28 md:pb-10">
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
                <button
                  onClick={() => navigate('/restaurants')}
                  className="nl text-left transition-colors hover:text-[#FF8A6B]"
                >
                  Explore Directory
                </button>
                <button
                  onClick={() => navigate('/iconic-area')}
                  className="nl text-left transition-colors hover:text-[#FF8A6B]"
                >
                  Area Guides
                </button>
                <button
                  onClick={() => navigate('/search')}
                  className="nl text-left transition-colors hover:text-[#FF8A6B]"
                >
                  Iconic Dishes
                </button>
                <button
                  onClick={() => navigate('/restaurants?sort=distance')}
                  className="nl text-left transition-colors hover:text-[#FF8A6B]"
                >
                  Near Me Counters
                </button>
                <button
                  onClick={() => navigate('/bookmarks')}
                  className="nl text-left transition-colors hover:text-[#FF8A6B]"
                >
                  Saved Bookmarks
                </button>
              </div>
            </div>

            {/* Owners */}
            <div>
              <div className="hd text-xs font-extrabold tracking-wider uppercase text-[#78716C]">
                Owners
              </div>
              <div className="mt-4 flex flex-col gap-2.5 text-[15px]">
                <button
                  onClick={() => navigate('/contact')}
                  className="nl text-left transition-colors hover:text-[#FF8A6B]"
                >
                  Claim your page
                </button>
                <button
                  onClick={() => navigate('/owner/login')}
                  className="nl text-left transition-colors hover:text-[#FF8A6B]"
                >
                  Owner login
                </button>
                <button
                  onClick={() => navigate('/contact')}
                  className="nl text-left transition-colors hover:text-[#FF8A6B]"
                >
                  Free QR standee
                </button>
                <button
                  onClick={() => navigate('/admin-secure-panel2010')}
                  className="nl text-left transition-colors hover:text-[#FF8A6B] flex items-center gap-1 text-xs text-stone-500"
                >
                  <Lock className="w-3 h-3" />
                  <span>Admin portal</span>
                </button>
              </div>
            </div>

            {/* MenuMap Info */}
            <div>
              <div className="hd text-xs font-extrabold tracking-wider uppercase text-[#78716C]">
                MenuMap
              </div>
              <div className="mt-4 flex flex-col gap-2.5 text-[15px]">
                <button
                  onClick={() => navigate('/about')}
                  className="nl text-left transition-colors hover:text-[#FF8A6B]"
                >
                  About us
                </button>
                <button
                  onClick={() => navigate('/contact')}
                  className="nl text-left transition-colors hover:text-[#FF8A6B]"
                >
                  Contact & Support
                </button>
                <button
                  onClick={() => navigate('/privacy')}
                  className="nl text-left transition-colors hover:text-[#FF8A6B]"
                >
                  Privacy policy
                </button>
                <button
                  onClick={() => navigate('/terms')}
                  className="nl text-left transition-colors hover:text-[#FF8A6B]"
                >
                  Terms of service
                </button>
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
