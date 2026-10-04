import React, { useState } from 'react';
import { X, Sparkles, Compass, ArrowRight, RotateCw, Trophy } from 'lucide-react';
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
  const colors = ['#FF5A36', '#F59E0B', '#10B981', '#0D9488', '#6366F1', '#EC4899', '#8B5CF6', '#EF4444'];

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
        { label: 'Butter Masala Maggi', tagline: "At Tom Uncle's Maggi Point", restaurantSlug: 'tom-uncles-maggi-point', restaurantName: "Tom Uncle's Maggi Point", color: '#F59E0B' },
        { label: 'Blueberry Pancakes', tagline: 'At AMA Cafe', restaurantSlug: 'ama-cafe-majnu-ka-tilla', restaurantName: 'AMA Cafe', color: '#10B981' },
        { label: 'Chole Bhature Special', tagline: 'At Chache Di Hatti', restaurantSlug: 'chache-di-hatti-kamla-nagar', restaurantName: 'Chache Di Hatti', color: '#0D9488' },
        { label: 'UCH Cona Coffee', tagline: 'At United Coffee House', restaurantSlug: 'united-coffee-house-connaught-place', restaurantName: 'United Coffee House', color: '#6366F1' },
        { label: 'Lakeview Woodfire Pizza', tagline: 'At Social Hauz Khas', restaurantSlug: 'social-hauz-khas-village', restaurantName: 'Social Hauz Khas', color: '#EC4899' },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 overflow-hidden text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Can't Decide What to Eat?</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 font-heading">
            Spin the Food Wheel 🎡
          </h3>
          <p className="text-xs text-slate-500">
            Let fate decide your next mouth-watering meal near you!
          </p>
        </div>

        {/* Wheel Graphic */}
        <div className="relative w-64 h-64 mx-auto my-4 flex items-center justify-center">
          {/* Top Pointer Indicator */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 text-rose-600 drop-shadow-md">
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-rose-600" />
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
            className="absolute z-10 w-16 h-16 rounded-full bg-white shadow-xl border-4 border-orange-500 flex flex-col items-center justify-center hover:scale-105 active:scale-95 transition-transform disabled:opacity-80"
          >
            <RotateCw className={`w-5 h-5 text-orange-600 ${spinning ? 'animate-spin' : ''}`} />
            <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider mt-0.5">
              {spinning ? 'Wait' : 'Spin'}
            </span>
          </button>
        </div>

        {/* Winner Announcement Card */}
        {selectedWinner && !spinning && (
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-700 mb-1">
              <Trophy className="w-4 h-4 text-amber-600" />
              <span>Tonight's Winning Pick!</span>
            </div>
            <h4 className="text-base font-extrabold text-slate-900">{selectedWinner.label}</h4>
            <p className="text-xs text-slate-600 mb-3">{selectedWinner.tagline}</p>
            <button
              onClick={() => {
                onClose();
                navigate(`/${selectedWinner.restaurantSlug}`);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
            >
              <span>View Cafe & Live Menu</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {!selectedWinner && !spinning && (
          <button
            onClick={handleSpin}
            className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 text-white font-bold text-sm shadow-md shadow-orange-500/20 active:scale-98 transition-transform"
          >
            Tap Here to Spin!
          </button>
        )}
      </div>
    </div>
  );
};
