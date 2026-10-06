import React, { useRef } from 'react';
import { X, Download, Printer, QrCode, Sparkles, ExternalLink, UtensilsCrossed, ShieldCheck } from 'lucide-react';
import { Restaurant } from '../types/database';

interface RestaurantQrModalProps {
  restaurant: Restaurant;
  isOpen: boolean;
  onClose: () => void;
}

export const RestaurantQrModal: React.FC<RestaurantQrModalProps> = ({
  restaurant,
  isOpen,
  onClose,
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  if (!isOpen) return null;

  const restaurantUrl = `${window.location.origin}/${restaurant.slug}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=10&data=${encodeURIComponent(
    restaurantUrl
  )}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${restaurant.slug}-menu-qr.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      window.open(qrImageUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#EFEAE2] overflow-hidden my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-800 bg-[#1C1917] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF5A36] text-white flex items-center justify-center shadow-md">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-white text-lg">
                Table QR Standee
              </h3>
              <p className="text-xs text-stone-300">
                Ready-to-print tabletop digital counter menu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Standee Preview Card */}
        <div className="p-6 flex flex-col items-center justify-center bg-stone-100/60">
          <div
            ref={printRef}
            id="printable-standee"
            className="w-full max-w-xs bg-white rounded-3xl p-6 shadow-xl border-4 border-[#1C1917] text-center space-y-4 relative overflow-hidden"
          >
            {/* Top decorative badge */}
            <div className="bg-[#FF5A36] text-white font-extrabold text-[11px] uppercase tracking-wider py-1.5 px-4 rounded-full mx-auto inline-flex items-center gap-1.5 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>0% Markup Counter Menu</span>
            </div>

            {/* Restaurant Branding */}
            <div>
              <h2 className="font-heading font-black text-xl text-[#1C1917] tracking-tight">
                {restaurant.name}
              </h2>
              <p className="text-xs text-stone-500 font-medium mt-0.5 line-clamp-1">
                {restaurant.address_line1}, {restaurant.city}
              </p>
            </div>

            {/* High-Res QR Code Frame */}
            <div className="bg-white p-3 rounded-2xl border-2 border-[#EFEAE2] inline-block shadow-inner mx-auto">
              <img
                src={qrImageUrl}
                alt={`${restaurant.name} Digital Menu QR`}
                className="w-48 h-48 mx-auto rounded-lg object-contain"
                crossOrigin="anonymous"
              />
            </div>

            {/* Scanning instructions */}
            <div className="space-y-1">
              <p className="font-heading font-black text-sm text-[#1C1917]">
                Scan with Phone Camera to View Menu
              </p>
              <p className="text-[11px] text-stone-500 leading-tight">
                Direct counter rates, dish photos, allergen info & instant WhatsApp table ordering
              </p>
            </div>

            {/* Footer Tag */}
            <div className="pt-2 border-t border-[#EFEAE2] flex items-center justify-center gap-1.5 text-[10px] font-bold text-stone-400">
              <UtensilsCrossed className="w-3 h-3 text-[#FF5A36]" />
              <span>Powered by Menu Maps</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-5 bg-white border-t border-[#EFEAE2] space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={handlePrint}
              className="flex-1 py-3.5 px-4 rounded-full bg-[#1C1917] hover:bg-black text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Print Table Standee</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 py-3.5 px-4 rounded-full bg-[#FAF8F5] hover:bg-stone-100 text-[#1C1917] border border-[#EFEAE2] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Download className="w-4 h-4 text-[#FF5A36]" />
              <span>Download QR Image</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-stone-400 px-1">
            <span className="truncate max-w-[280px] font-mono text-[11px]">
              {restaurantUrl}
            </span>
            <a
              href={restaurantUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#D8350F] hover:underline inline-flex items-center gap-1 font-bold"
            >
              <span>Test Menu Link</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
