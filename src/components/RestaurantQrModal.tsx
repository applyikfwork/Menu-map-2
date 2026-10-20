import React, { useState, useRef } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  QrCode, 
  Sparkles, 
  ExternalLink, 
  UtensilsCrossed, 
  ShieldCheck, 
  Wifi, 
  Check, 
  Layers,
  Flame,
  Gift
} from 'lucide-react';
import { Restaurant } from '../types/database';
import { getRestaurantQrConfig, saveRestaurantQrConfig } from '../lib/qrConfig';

interface RestaurantQrModalProps {
  restaurant: Restaurant;
  isOpen: boolean;
  onClose: () => void;
  defaultTableNumber?: string | number;
}

export const RestaurantQrModal: React.FC<RestaurantQrModalProps> = ({
  restaurant,
  isOpen,
  onClose,
  defaultTableNumber,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const savedConfig = getRestaurantQrConfig(restaurant.id);
  const [selectedTable, setSelectedTable] = useState<string>(
    defaultTableNumber ? String(defaultTableNumber) : '1'
  );
  const [wifiSsid, setWifiSsid] = useState<string>(() => savedConfig.wifiSsid || '');
  const [wifiPass, setWifiPass] = useState<string>(() => savedConfig.wifiPassword || '');
  const [standeeTheme, setStandeeTheme] = useState<'dark' | 'white'>('white');

  if (!isOpen) return null;

  // Build target URL
  const tableParam = selectedTable === 'master' ? '' : `table=${selectedTable}&`;
  const restaurantUrl = `${window.location.origin}/${restaurant.slug}?${tableParam}mode=dine_in`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=10&data=${encodeURIComponent(
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
      a.download = `${restaurant.slug}-table-${selectedTable}-standee.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      window.open(qrImageUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#EFEAE2] overflow-hidden my-4 max-h-[95vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-800 bg-[#1C1917] text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF5A36] text-white flex items-center justify-center shadow-md">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-white text-base sm:text-lg">
                Table QR Standee Studio
              </h3>
              <p className="text-xs text-stone-300">
                Customizable, ready-to-print tabletop digital menu &amp; gamified ordering kit
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Studio Controls Bar */}
        <div className="p-4 bg-white border-b border-[#EFEAE2] space-y-3 shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Table Number Selector */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-stone-600 mb-1">
                Table Number
              </label>
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:border-[#FF5A36] outline-hidden cursor-pointer"
              >
                <option value="master">All Tables / Master QR</option>
                {Array.from({ length: 25 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={String(num)}>
                    Table #{num}
                  </option>
                ))}
              </select>
            </div>

            {/* Wi-Fi Name */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-stone-600 mb-1">
                Wi-Fi Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. CafeGuest_WiFi"
                value={wifiSsid}
                onChange={(e) => setWifiSsid(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 focus:border-[#FF5A36] outline-hidden placeholder:text-stone-400"
              />
            </div>

            {/* Wi-Fi Password */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-stone-600 mb-1">
                Wi-Fi Password (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. coffee2026"
                value={wifiPass}
                onChange={(e) => setWifiPass(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 focus:border-[#FF5A36] outline-hidden placeholder:text-stone-400"
              />
            </div>
          </div>
        </div>

        {/* Printable Standee Preview Area (Scrollable) */}
        <div className="p-4 sm:p-6 flex flex-col items-center justify-center bg-stone-100/70 overflow-y-auto">
          <div
            ref={printRef}
            id="printable-standee"
            className={`w-full max-w-[320px] rounded-3xl p-5 shadow-2xl text-center space-y-3 relative overflow-hidden transition-colors ${
              standeeTheme === 'dark' 
                ? 'bg-[#1C1917] text-white border-4 border-[#FF5A36]' 
                : 'bg-white text-stone-900 border-4 border-[#1C1917]'
            }`}
          >
            {/* Top Table Badge */}
            <div className="flex items-center justify-center">
              <span className="bg-[#FF5A36] text-white font-mono font-black text-xs uppercase tracking-widest py-1 px-4 rounded-full shadow-xs">
                {selectedTable === 'master' ? 'TABLETOP DIGITAL MENU' : `TABLE #${selectedTable}`}
              </span>
            </div>

            {/* Restaurant Branding */}
            <div>
              <h2 className="font-heading font-black text-xl tracking-tight leading-tight">
                {restaurant.name}
              </h2>
              <p className="text-[11px] opacity-75 font-medium mt-0.5 line-clamp-1">
                {restaurant.address_line1 || restaurant.city}
              </p>
            </div>

            {/* 0% Markup Guarantee Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>0% Marked-Up Counter Rates</span>
            </div>

            {/* High-Res QR Code Frame */}
            <div className="bg-white p-3 rounded-2xl border-2 border-stone-200 inline-block shadow-inner mx-auto">
              <img
                src={qrImageUrl}
                alt={`${restaurant.name} Table ${selectedTable} Digital Menu QR`}
                className="w-44 h-44 mx-auto rounded-lg object-contain"
                crossOrigin="anonymous"
              />
            </div>

            {/* Gamified In-Cafe Perks Callout */}
            <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-stone-800 space-y-0.5">
              <div className="text-[10px] font-black text-[#D8350F] uppercase tracking-wider flex items-center justify-center gap-1">
                <Gift className="w-3 h-3 text-[#FF5A36]" />
                <span>Spin Table Luck Wheel Inside</span>
              </div>
              <p className="text-[11px] font-bold text-stone-700 leading-tight">
                Scan to unlock instant 5% bill discount, secret off-menu treat &amp; waiter buzzer!
              </p>
            </div>

            {/* Optional Wi-Fi Box */}
            {wifiSsid && (
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-left text-xs font-sans text-stone-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-sky-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-wider text-stone-400">Cafe Wi-Fi</p>
                    <p className="text-[11px] font-extrabold truncate">{wifiSsid}</p>
                  </div>
                </div>
                {wifiPass && (
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase tracking-wider text-stone-400">Pass</p>
                    <p className="text-[11px] font-mono font-bold">{wifiPass}</p>
                  </div>
                )}
              </div>
            )}

            {/* Footer Tag */}
            <div className="pt-2 border-t border-stone-200/60 flex items-center justify-center gap-1.5 text-[10px] font-bold opacity-60">
              <UtensilsCrossed className="w-3 h-3 text-[#FF5A36]" />
              <span>Powered by MenuMaps • Authentic Menus</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-white border-t border-[#EFEAE2] space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={handlePrint}
              className="flex-1 py-3 px-4 rounded-xl bg-[#1C1917] hover:bg-black text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Table Standee</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 py-3 px-4 rounded-xl bg-[#FAF8F5] hover:bg-stone-100 text-[#1C1917] border border-[#EFEAE2] font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#FF5A36]" />
              <span>Download Standee Image</span>
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
              <span>Test Table #{selectedTable} Link</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
