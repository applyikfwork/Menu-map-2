import React, { useState, useRef, useEffect } from 'react';
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
  Gift,
  Palette,
  Image as ImageIcon,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { Restaurant } from '../types/database';
import { getRestaurantQrConfig, saveRestaurantQrConfig } from '../lib/qrConfig';
import { POSTER_TEMPLATES, getPosterTemplate, PosterTemplate } from '../lib/posterTemplates';
import { renderPosterToCanvas, downloadPosterAsPng } from '../lib/canvasPosterGenerator';

interface RestaurantQrModalProps {
  restaurant: Restaurant;
  isOpen: boolean;
  onClose: () => void;
  defaultTableNumber?: string | number;
  enabledPerkIds?: string[];
  initialTemplateId?: string;
}

export const RestaurantQrModal: React.FC<RestaurantQrModalProps> = ({
  restaurant,
  isOpen,
  onClose,
  defaultTableNumber,
  initialTemplateId,
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const savedConfig = getRestaurantQrConfig(restaurant.id);

  // Studio Mode: Graphic Artwork Poster vs Minimal Table Standee
  const [activeTab, setActiveTab] = useState<'poster' | 'standee'>('poster');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    initialTemplateId || 'diwali-festive-feast'
  );
  const [selectedTable, setSelectedTable] = useState<string>(
    defaultTableNumber ? String(defaultTableNumber) : 'master'
  );
  const [displayName, setDisplayName] = useState<string>(restaurant.name);
  const [wifiSsid, setWifiSsid] = useState<string>(() => savedConfig.wifiSsid || '');
  const [wifiPass, setWifiPass] = useState<string>(() => savedConfig.wifiPassword || '');
  const [standeeTheme, setStandeeTheme] = useState<'dark' | 'white'>('white');

  // Canvas State for Graphic Poster
  const [posterPreviewUrl, setPosterPreviewUrl] = useState<string | null>(null);
  const [isRenderingPoster, setIsRenderingPoster] = useState<boolean>(true);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [renderError, setRenderError] = useState<string | null>(null);

  const selectedTemplate = getPosterTemplate(selectedTemplateId);

  // Build target URL
  const tableParam = selectedTable === 'master' ? '' : `table=${selectedTable}&`;
  const restaurantUrl = `${window.location.origin}/${restaurant.slug}?${tableParam}mode=dine_in`;

  // Fallback QR Image URL for Standee
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=10&data=${encodeURIComponent(
    restaurantUrl
  )}`;

  // Re-render poster canvas whenever template, table, or name changes
  useEffect(() => {
    let isMounted = true;
    if (!isOpen || activeTab !== 'poster') return;

    setIsRenderingPoster(true);
    setRenderError(null);

    renderPosterToCanvas({
      template: selectedTemplate,
      restaurantName: displayName.trim() || restaurant.name,
      targetUrl: restaurantUrl,
      tableNumber: selectedTable === 'master' ? undefined : selectedTable,
      scale: 1.5, // Crisp preview scale
    })
      .then((canvas) => {
        if (!isMounted) return;
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        setPosterPreviewUrl(dataUrl);
        setIsRenderingPoster(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to render poster to canvas:', err);
        setRenderError('Could not render poster preview. Please try again.');
        setIsRenderingPoster(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, activeTab, selectedTemplateId, selectedTable, displayName, restaurantUrl]);

  if (!isOpen) return null;

  // Print Handler
  const handlePrint = () => {
    if (activeTab === 'poster' && posterPreviewUrl) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${restaurant.name} - Menu Maps Poster</title>
              <style>
                @page { size: auto; margin: 0; }
                body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #fff; }
                img { max-width: 100vw; max-height: 100vh; object-fit: contain; }
              </style>
            </head>
            <body>
              <img src="${posterPreviewUrl}" onload="window.print();window.close();" />
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        window.print();
      }
    } else {
      window.print();
    }
  };

  // High-Resolution 300 DPI Download
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      if (activeTab === 'poster') {
        // Render at 3x scale for ultra-crisp 300 DPI master print quality (2388 x 3072 px)
        const masterCanvas = await renderPosterToCanvas({
          template: selectedTemplate,
          restaurantName: displayName.trim() || restaurant.name,
          targetUrl: restaurantUrl,
          tableNumber: selectedTable === 'master' ? undefined : selectedTable,
          scale: 2.5,
        });

        const suffix = selectedTable === 'master' ? 'counter-poster' : `table-${selectedTable}-standee`;
        const fileName = `${restaurant.slug}-${suffix}.png`;
        await downloadPosterAsPng(masterCanvas, fileName);
      } else {
        // Minimal standee download
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
      }
    } catch (e) {
      console.error('Download error:', e);
      if (posterPreviewUrl) {
        const a = document.createElement('a');
        a.href = posterPreviewUrl;
        a.download = `${restaurant.slug}-poster.png`;
        a.click();
      } else {
        window.open(qrImageUrl, '_blank');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#EFEAE2] overflow-hidden my-2 max-h-[96vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-800 bg-[#1C1917] text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF5A36] to-amber-500 text-white flex items-center justify-center shadow-md">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-white text-base sm:text-lg">
                  Ready-Made Poster &amp; QR Studio
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  Print Ready
                </span>
              </div>
              <p className="text-xs text-stone-300">
                1-Click customized marketing posters &amp; tabletop standees with verified QR
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

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-2 p-2.5 bg-stone-100 border-b border-stone-200/80 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('poster')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'poster'
                ? 'bg-white text-[#1C1917] shadow-sm border border-stone-200/80'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
            }`}
          >
            <Palette className="w-4 h-4 text-[#FF5A36]" />
            <span>Ready-Made Graphic Poster</span>
            <span className="text-[9px] bg-orange-100 text-[#D8350F] px-1.5 py-0.5 rounded-md font-extrabold">
              FEATURED
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('standee')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'standee'
                ? 'bg-white text-[#1C1917] shadow-sm border border-stone-200/80'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
            }`}
          >
            <Layers className="w-4 h-4 text-stone-700" />
            <span>Minimal Table Standee</span>
          </button>
        </div>

        {/* Studio Controls Bar */}
        <div className="p-3 sm:p-4 bg-white border-b border-[#EFEAE2] space-y-3 shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Table Number Selector */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-stone-600 mb-1">
                Print Purpose / Table #
              </label>
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:border-[#FF5A36] outline-hidden cursor-pointer"
              >
                <option value="master">Cash Counter / Entrance Poster (Master)</option>
                {Array.from({ length: 25 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={String(num)}>
                    Dining Table #{num}
                  </option>
                ))}
              </select>
            </div>

            {/* Display Name Customizer */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-stone-600 mb-1">
                Name on Banner
              </label>
              <input
                type="text"
                placeholder={restaurant.name}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:border-[#FF5A36] outline-hidden"
              />
            </div>

            {/* Template Chooser or Wi-Fi info */}
            {activeTab === 'poster' ? (
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-stone-600 mb-1">
                  Poster Template
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:border-[#FF5A36] outline-hidden cursor-pointer"
                >
                  {POSTER_TEMPLATES.map((tmpl) => (
                    <option key={tmpl.id} value={tmpl.id}>
                      {tmpl.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-stone-600 mb-1">
                  Standee Theme
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStandeeTheme('white')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border ${
                      standeeTheme === 'white'
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-white text-stone-700 border-stone-200'
                    }`}
                  >
                    White
                  </button>
                  <button
                    type="button"
                    onClick={() => setStandeeTheme('dark')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border ${
                      standeeTheme === 'dark'
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-white text-stone-700 border-stone-200'
                    }`}
                  >
                    Dark Slate
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Visual Thumbnail Carousel for Poster Templates */}
          {activeTab === 'poster' && (
            <div className="pt-2.5 border-t border-stone-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-[#FF5A36]" />
                  <span>Choose Template ({POSTER_TEMPLATES.length} Designs):</span>
                </span>
                <span className="text-[10px] text-amber-800 font-extrabold bg-amber-100/80 px-2 py-0.5 rounded-full">
                  {selectedTemplate.badge}
                </span>
              </div>
              <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
                {POSTER_TEMPLATES.map((tmpl) => {
                  const isSelected = tmpl.id === selectedTemplateId;
                  return (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => setSelectedTemplateId(tmpl.id)}
                      className={`group relative shrink-0 w-20 sm:w-24 h-28 sm:h-32 rounded-xl overflow-hidden border-2 transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'border-[#FF5A36] ring-3 ring-[#FF5A36]/30 shadow-md scale-[1.02]'
                          : 'border-stone-200 hover:border-stone-400 opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={tmpl.thumbnailUrl}
                        alt={tmpl.name}
                        className="w-full h-full object-cover"
                      />
                      {tmpl.isNew && (
                        <span className="absolute top-1 left-1 bg-[#FF5A36] text-white text-[8px] font-black px-1 py-0.5 rounded-md shadow-xs leading-none">
                          NEW
                        </span>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-1 sm:p-1.5">
                        <p className="text-[9px] font-bold text-white truncate leading-tight">
                          {tmpl.name}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Live Canvas / Standee Preview Area */}
        <div className="p-3 sm:p-5 flex flex-col items-center justify-center bg-stone-200/60 overflow-y-auto flex-1 min-h-[360px]">
          {activeTab === 'poster' ? (
            /* Graphic Poster Real-Time Render */
            <div className="relative flex flex-col items-center justify-center w-full">
              {isRenderingPoster && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/70 backdrop-blur-xs rounded-2xl">
                  <RefreshCw className="w-8 h-8 text-[#FF5A36] animate-spin mb-2" />
                  <p className="text-xs font-black text-stone-800">Compositing Ready-Made Poster...</p>
                </div>
              )}

              {renderError ? (
                <div className="p-6 text-center text-rose-600 bg-rose-50 border border-rose-200 rounded-2xl">
                  <p className="font-bold text-sm">{renderError}</p>
                </div>
              ) : posterPreviewUrl ? (
                <div className="relative group max-w-[340px] sm:max-w-[420px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                  <img
                    src={posterPreviewUrl}
                    alt={`${restaurant.name} Ready-Made Poster`}
                    className="w-full h-auto object-contain block select-none"
                  />
                  {/* Subtle hovering badge */}
                  <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 opacity-90 shadow-md">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>300 DPI Ready</span>
                  </div>
                </div>
              ) : null}

              <p className="mt-2.5 text-[11px] font-bold text-stone-500 text-center">
                ✨ Automatically stamped with your verified digital menu QR &amp; custom vintage branding
              </p>
            </div>
          ) : (
            /* Minimal Table Standee */
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
                  {displayName || restaurant.name}
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

              {/* Footer Tag */}
              <div className="pt-2 border-t border-stone-200/60 flex items-center justify-center gap-1.5 text-[10px] font-bold opacity-60">
                <UtensilsCrossed className="w-3 h-3 text-[#FF5A36]" />
                <span>Powered by MenuMaps • Authentic Menus</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-3 sm:p-4 bg-white border-t border-[#EFEAE2] space-y-2.5 shrink-0">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading || isRenderingPoster}
              className="flex-1 py-3 px-4 rounded-xl bg-[#1C1917] hover:bg-black disabled:opacity-50 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md cursor-pointer"
            >
              {isDownloading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#FF5A36]" />
                  <span>Exporting High-Res Poster...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-[#FF5A36]" />
                  <span>Download High-Res Poster (PNG)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              disabled={isRenderingPoster}
              className="flex-1 py-3 px-4 rounded-xl bg-[#FAF8F5] hover:bg-stone-100 text-[#1C1917] border border-[#EFEAE2] font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-stone-700" />
              <span>1-Click Print Poster</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-stone-400 px-1 pt-1">
            <span className="truncate max-w-[280px] font-mono text-[11px]">
              {restaurantUrl}
            </span>
            <a
              href={restaurantUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#D8350F] hover:underline inline-flex items-center gap-1 font-bold"
            >
              <span>Test Live Link</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
export default RestaurantQrModal;
