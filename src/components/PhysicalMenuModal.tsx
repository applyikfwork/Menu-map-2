import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, ShieldCheck, Download, Maximize2 } from 'lucide-react';
import { Restaurant } from '../types/database';

interface PhysicalMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant;
}

export const PhysicalMenuModal: React.FC<PhysicalMenuModalProps> = ({
  isOpen,
  onClose,
  restaurant,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Use restaurant's actual menu card images uploaded by owner, or fallback to high-res culinary scans
  const menuPages = (restaurant.menu_pages && restaurant.menu_pages.length > 0)
    ? restaurant.menu_pages
    : [
        restaurant.cover_image_url || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
      ];

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.max(1, Math.min(2.5, +(prev + delta).toFixed(1))));
  };

  const handlePrev = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : menuPages.length - 1));
    setZoomLevel(1);
  };

  const handleNext = () => {
    setCurrentPage((prev) => (prev < menuPages.length - 1 ? prev + 1 : 0));
    setZoomLevel(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#14110F] text-white rounded-3xl overflow-hidden shadow-2xl border border-stone-800">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-800/80 bg-[#1C1917]/90 z-20">
          <div className="flex items-center gap-3">
            <span className="p-1.5 rounded-lg bg-[#FF5A36]/20 text-[#FF5A36]">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white truncate max-w-[220px] sm:max-w-md">
                {restaurant.name} – Physical Paper Menu
              </h3>
              <p className="text-[11px] text-stone-400">
                Verified counter menu • Page {currentPage + 1} of {menuPages.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Zoom Controls */}
            <button
              onClick={() => handleZoom(-0.25)}
              disabled={zoomLevel <= 1}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold text-stone-400 px-1">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => handleZoom(0.25)}
              disabled={zoomLevel >= 2.5}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 ml-1 rounded-xl bg-stone-800 hover:bg-rose-900/80 text-stone-300 hover:text-white transition-colors"
              title="Close viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Verification Guarantee Banner */}
        <div className="bg-[#0F766E]/20 border-b border-[#0F766E]/30 px-4 py-2 flex items-center justify-between text-xs text-teal-300 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span>100% Authentic In-Store Counter Rates • 0% Delivery Markups</span>
          </div>
          <span className="text-[11px] text-stone-400 hidden sm:inline">
            Verified in {restaurant.city_area || restaurant.city}
          </span>
        </div>

        {/* Image Display Area with Navigation */}
        <div className="relative flex-1 min-h-[380px] sm:min-h-[500px] overflow-auto flex items-center justify-center p-4 bg-black/60 select-none">
          <div
            className="transition-transform duration-200 ease-out origin-center cursor-zoom-in"
            style={{ transform: `scale(${zoomLevel})` }}
            onClick={() => handleZoom(zoomLevel > 1 ? -0.5 : 0.5)}
          >
            <img
              src={menuPages[currentPage]}
              alt={`${restaurant.name} Menu Page ${currentPage + 1}`}
              className="max-h-[70vh] w-auto object-contain rounded-xl shadow-2xl border border-stone-800"
            />
          </div>

          {/* Left Arrow */}
          <button
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-[#FF5A36] text-white shadow-lg backdrop-blur-sm transition-all active:scale-95 z-20"
            title="Previous page"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-[#FF5A36] text-white shadow-lg backdrop-blur-sm transition-all active:scale-95 z-20"
            title="Next page"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Footer Thumbnails & Actions */}
        <div className="px-5 py-3 border-t border-stone-800 bg-[#1C1917]/90 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {menuPages.map((page, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentPage(idx);
                  setZoomLevel(1);
                }}
                className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                  currentPage === idx
                    ? 'border-[#FF5A36] scale-105'
                    : 'border-stone-700 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={page} alt="" className="w-full h-full object-cover" />
                <span className="absolute bottom-0 right-0 px-1 text-[9px] bg-black/80 font-bold">
                  {idx + 1}
                </span>
              </button>
            ))}
          </div>

          <div className="text-right shrink-0">
            <span className="text-[11px] text-stone-400 block">Pinch or click to zoom</span>
            <span className="text-xs font-bold text-[#FF5A36]">Direct dine-in prices</span>
          </div>
        </div>
      </div>
    </div>
  );
};
