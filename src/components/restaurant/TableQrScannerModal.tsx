import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Camera, 
  QrCode, 
  Sparkles, 
  Check, 
  AlertCircle, 
  Hash, 
  ArrowRight,
  RefreshCw,
  Zap
} from 'lucide-react';
import { Restaurant } from '../../types/database';

interface TableQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant;
  onTableConfirmed: (tableNumber: string) => void;
}

export const TableQrScannerModal: React.FC<TableQrScannerModalProps> = ({
  isOpen,
  onClose,
  restaurant,
  onTableConfirmed,
}) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualTableNumber, setManualTableNumber] = useState('');
  const [isScanning, setIsScanning] = useState(true);
  const [scanSuccessAnim, setScanSuccessAnim] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setScanSuccessAnim(false);
      setCameraError(null);
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    setCameraActive(false);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera access not supported on this device/browser. Please choose or enter your table number below.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
        startBarcodeDetection();
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Select your table number below to activate table mode.');
      } else {
        setCameraError('Unable to access camera. Select your table number below.');
      }
    }
  };

  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const startBarcodeDetection = () => {
    // Check for native BarcodeDetector API supported in Chromium / Android / modern iOS
    if ('BarcodeDetector' in window) {
      try {
        const barcodeDetector = new (window as any).BarcodeDetector({
          formats: ['qr_code'],
        });

        const detectFrame = async () => {
          if (!videoRef.current || !streamRef.current) return;
          try {
            if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
              const barcodes = await barcodeDetector.detect(videoRef.current);
              if (barcodes.length > 0) {
                const rawVal = barcodes[0].rawValue;
                handleRawScan(rawVal);
                return;
              }
            }
          } catch (e) {
            // Frame detection pass-through
          }
          animFrameRef.current = requestAnimationFrame(detectFrame);
        };

        animFrameRef.current = requestAnimationFrame(detectFrame);
      } catch (e) {
        // Fallback to manual selection
      }
    }
  };

  const handleRawScan = (rawString: string) => {
    stopCamera();
    setScanSuccessAnim(true);

    let extractedTable = '1';
    try {
      if (rawString.includes('table=')) {
        const match = rawString.match(/table=([^&#]+)/i);
        if (match && match[1]) {
          extractedTable = decodeURIComponent(match[1]).trim();
        }
      } else if (/^\d+$/.test(rawString.trim())) {
        extractedTable = rawString.trim();
      }
    } catch (e) {
      extractedTable = '1';
    }

    setTimeout(() => {
      onTableConfirmed(extractedTable);
      onClose();
    }, 600);
  };

  const handleConfirmTable = (tableVal: string) => {
    const clean = tableVal.trim();
    if (!clean) return;
    stopCamera();
    setScanSuccessAnim(true);
    setTimeout(() => {
      onTableConfirmed(clean);
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  const quickTables = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '12', '15', 'VIP'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#E7E2DA] overflow-hidden my-4 max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-800 bg-[#1C1917] text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF5A36] text-white flex items-center justify-center shadow-md">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-white text-base sm:text-lg">
                Scan Table QR Standee
              </h3>
              <p className="text-xs text-stone-300">
                Unlock live table buzzers &amp; digital ordering at {restaurant.name}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Camera Viewfinder Box */}
          <div className="relative w-full aspect-square max-w-[320px] mx-auto rounded-3xl overflow-hidden bg-stone-950 border-2 border-stone-800 shadow-inner flex items-center justify-center">
            {cameraActive ? (
              <>
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* Viewfinder Target Framing */}
                <div className="absolute inset-8 border-2 border-amber-400/80 rounded-2xl pointer-events-none flex flex-col justify-between p-2">
                  <div className="flex justify-between">
                    <span className="w-4 h-4 border-t-2 border-l-2 border-[#FF5A36] -mt-1 -ml-1"></span>
                    <span className="w-4 h-4 border-t-2 border-r-2 border-[#FF5A36] -mt-1 -mr-1"></span>
                  </div>
                  {/* Moving Laser Scan Line */}
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#FF5A36] to-transparent animate-pulse shadow-[0_0_8px_#FF5A36]"></div>
                  <div className="flex justify-between">
                    <span className="w-4 h-4 border-b-2 border-l-2 border-[#FF5A36] -mb-1 -ml-1"></span>
                    <span className="w-4 h-4 border-b-2 border-r-2 border-[#FF5A36] -mb-1 -mr-1"></span>
                  </div>
                </div>

                <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none">
                  <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-sm text-[11px] font-bold text-amber-300 border border-amber-400/30">
                    Align camera with on-table QR standee
                  </span>
                </div>
              </>
            ) : (
              <div className="p-6 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center mx-auto text-[#FF5A36]">
                  <Camera className="w-7 h-7" />
                </div>
                {cameraError ? (
                  <p className="text-xs text-amber-400 font-medium px-2 leading-relaxed">
                    {cameraError}
                  </p>
                ) : (
                  <p className="text-xs text-stone-400">
                    Initializing camera stream...
                  </p>
                )}
                <button
                  type="button"
                  onClick={startCamera}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold border border-stone-700 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Camera</span>
                </button>
              </div>
            )}

            {scanSuccessAnim && (
              <div className="absolute inset-0 bg-emerald-600/90 flex flex-col items-center justify-center text-white space-y-2 animate-in fade-in duration-150 z-20">
                <div className="w-16 h-16 rounded-full bg-white text-emerald-600 flex items-center justify-center shadow-lg animate-bounce">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <h4 className="font-heading font-black text-lg">QR Verified!</h4>
                <p className="text-xs font-semibold text-emerald-100">Connecting table session...</p>
              </div>
            )}
          </div>

          {/* Quick Table Number Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-[#FF5A36]" />
                <span>Or Select Seated Table Number</span>
              </label>
              <span className="text-[11px] text-stone-500">1-Tap Activation</span>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
              {quickTables.map((tNum) => (
                <button
                  key={tNum}
                  type="button"
                  onClick={() => handleConfirmTable(tNum)}
                  className="py-2.5 px-2 rounded-xl bg-white border border-[#E7E2DA] hover:border-[#FF5A36] hover:bg-orange-50 font-black text-xs sm:text-sm text-[#1C1917] transition-all cursor-pointer shadow-xs active:scale-95 text-center"
                >
                  #{tNum}
                </button>
              ))}
            </div>
          </div>

          {/* Manual Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleConfirmTable(manualTableNumber);
            }}
            className="flex items-center gap-2 pt-2 border-t border-[#E7E2DA]"
          >
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Enter custom Table # (e.g. 5, Balcony 2)"
                value={manualTableNumber}
                onChange={(e) => setManualTableNumber(e.target.value)}
                className="w-full pl-3.5 pr-3 py-2.5 rounded-xl bg-white border border-[#E7E2DA] focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/20 text-xs sm:text-sm font-bold text-stone-900 outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={!manualTableNumber.trim()}
              className="btn bg-[#FF5A36] hover:bg-[#D8350F] disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-black text-xs shrink-0 flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>Activate</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Table Perks Information Pill */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/40 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-950 leading-relaxed font-medium">
              Scanning or selecting your table enables <strong>direct table buzzers</strong> (water, cutlery, bill) and routes kitchen orders straight to your table number via WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
