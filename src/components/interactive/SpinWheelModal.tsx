import React, { useState } from 'react';
import { X, Sparkles, ArrowRight, RotateCw, Trophy } from 'lucide-react';
import { Restaurant } from '../../types/database';

interface SpinWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurants: Restaurant[];
  navigate: (path: string) => void;
}

interface WheelOption {
  label: string;
  tagline: string;
  restaurantSlug: string;
  restaurantName: string;
  color: string;
}

export const SpinWheelModal: React.FC<SpinWheelModalProps> = ({
  isOpen,
  onClose,
  restaurants,
  navigate,
}) => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedWinner, setSelectedWinner] = useState<WheelOption | null>(null);

  if (!isOpen) return null;

  // Build 6 to 8 engaging wheel options from available restaurants
  const candidates = restaurants.filter((r) => r.is_featured || r.rating_avg >= 4.3).slice(0, 8);
  const colors = ['#FF5A36', '#1C1917', '#0F766E', '#F59E0B', '#9333EA', '#0D9488', '#E11D48', '#D97706'];

  const options: WheelOption[] = candidates.length >= 4
    ? candidates.map((r, i) => ({
        label: r.specialty_dishes?.[0] || r.known_for_dishes?.[0] || r.name,
        tagline: `At ${r.name}`,
        restaurantSlug: r.slug,
        restaurantName: r.name,
        color: colors[i % colors.length],
      }))
    : [
        { label: 'Cheesy Baked Pasta', tagline: 'At Big Yellow Door', restaurantSlug: 'big-yellow-door-hudson-lane', restaurantName: 'Big Yellow Door', color: '#FF5A36' },
        { label: 'Butter Masala Maggi', tagline: "At Tom Uncle's Maggi Point", restaurantSlug: 'tom-uncles-maggi-point', restaurantName: "Tom Uncle's Maggi Point", color: '#1C1917' },
        { label: 'Blueberry Pancakes', tagline: 'At AMA Cafe', restaurantSlug: 'ama-cafe-majnu-ka-tilla', restaurantName: 'AMA Cafe', color: '#0F766E' },
        { label: 'Chole Bhature Special', tagline: 'At Chache Di Hatti', restaurantSlug: 'chache-di-hatti-kamla-nagar', restaurantName: 'Chache Di Hatti', color: '#F59E0B' },
        { label: 'UCH Cona Coffee', tagline: 'At United Coffee House', restaurantSlug: 'united-coffee-house-connaught-place', restaurantName: 'United Coffee House', color: '#9333EA' },
        { label: 'Lakeview Woodfire Pizza', tagline: 'At Social Hauz Khas', restaurantSlug: 'social-hauz-khas-village', restaurantName: 'Social Hauz Khas', color: '#0D9488' },
      ];

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setSelectedWinner(null);

    const extraRounds = 5 + Math.floor(Math.random() * 4); // 5 to 8 full spins
    const randomIndex = Math.floor(Math.random() * options.length);
    const sliceAngle = 360 / options.length;
    const targetAngle = extraRounds * 360 + (options.length - randomIndex - 0.5) * sliceAngle;

    setRotation((prev) => prev + targetAngle);

    setTimeout(() => {
      setSpinning(false);
      setSelectedWinner(options[randomIndex]);
    }, 3800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#EFEAE2] p-6 overflow-y-auto max-h-[90vh] text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors border border-[#EFEAE2]"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-1 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-[#D8350F] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Can't Decide What to Eat?</span>
          </div>
          <h3 className="text-2xl font-black text-[#1C1917] font-heading tracking-tight">
            Spin the Food Wheel 🎡
          </h3>
          <p className="text-xs text-stone-500 font-sans">
            Let fate decide your next counter meal across Delhi!
          </p>
        </div>

        {/* Wheel Graphic */}
        <div className="relative w-64 h-64 mx-auto my-4 flex items-center justify-center">
          {/* Top Pointer Indicator */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 text-[#FF5A36] drop-shadow-md">
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-[#FF5A36]" />
          </div>

          {/* Rotating Wheel Disk */}
          <div
            className="w-full h-full rounded-full border-4 border-white shadow-xl relative overflow-hidden"
            style={{
              transition: 'transform 3.8s cubic-bezier(0.15, 0.9, 0.2, 1)',
              transform: `rotate(${rotation}deg)`,
              background: `conic-gradient(${options
                .map((opt, i) => `${opt.color} ${(i / options.length) * 100}% ${((i + 1) / options.length) * 100}%`)
                .join(', ')})`,
            }}
          >
            {options.map((opt, i) => {
              const angle = (360 / options.length) * i + 360 / (options.length * 2);
              return (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 -translate-y-1/2 origin-left text-white text-[11px] font-black pl-8 pointer-events-none truncate max-w-[110px]"
                  style={{ transform: `rotate(${angle}deg)` }}
                >
                  {opt.label}
                </div>
              );
            })}
          </div>

          {/* Center Hub Button */}
          <button
            onClick={handleSpin}
            disabled={spinning}
            className="absolute z-10 w-16 h-16 rounded-full bg-white shadow-xl border-4 border-[#FF5A36] flex flex-col items-center justify-center hover:scale-105 active:scale-95 transition-transform disabled:opacity-80 cursor-pointer"
          >
            <RotateCw className={`w-5 h-5 text-[#FF5A36] ${spinning ? 'animate-spin' : ''}`} />
            <span className="text-[10px] font-heading font-black text-[#1C1917] uppercase tracking-wider mt-0.5">
              {spinning ? 'Spinning' : 'Spin'}
            </span>
          </button>
        </div>

        {/* Winner Announcement Card */}
        {selectedWinner && !spinning && (
          <div className="mt-4 p-4 rounded-2xl bg-white border border-[#EFEAE2] shadow-sm animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-700 mb-1">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Winning Recommendation Pick!</span>
            </div>
            <h4 className="text-base font-heading font-black text-[#1C1917]">{selectedWinner.label}</h4>
            <p className="text-xs text-stone-500 font-sans mb-3">{selectedWinner.tagline}</p>
            <button
              onClick={() => {
                onClose();
                navigate(`/${selectedWinner.restaurantSlug}`);
              }}
              className="w-full py-3 px-4 rounded-full bg-[#FF5A36] hover:bg-[#D8350F] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <span>View Cafe & Counter Menu</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {!selectedWinner && !spinning && (
          <button
            onClick={handleSpin}
            className="w-full mt-2 py-3.5 rounded-full bg-[#1C1917] hover:bg-black text-white font-extrabold text-sm shadow-md active:scale-95 transition-all cursor-pointer"
          >
            Tap Here to Spin!
          </button>
        )}
      </div>
    </div>
  );
};
