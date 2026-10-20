import React, { useState, useMemo } from 'react';
import { X, Sparkles, Gift, Check, Trophy, PartyPopper } from 'lucide-react';

interface TablePerkWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantName: string;
  tableNumber?: string | number;
  onPerkUnlocked: (perk: string) => void;
  activePerk?: string | null;
  enabledPerkIds?: string[];
}

interface PerkOption {
  id: string;
  label: string;
  subtext: string;
  badge: string;
  color: string;
}

const TABLE_PERKS: PerkOption[] = [
  { id: 'discount5', label: '5% Counter Discount', subtext: 'Deducted directly from your table bill at counter', badge: '5% OFF', color: '#FF5A36' },
  { id: 'freedip', label: 'Free House Dip / Chutney', subtext: 'Served complimentary with your first starter order', badge: 'FREE DIP', color: '#0F766E' },
  { id: 'secretdeal', label: 'Chef’s Secret Recipe Perk', subtext: 'Unlock chef’s off-menu recommendation with order', badge: 'SECRET BITE', color: '#9333EA' },
  { id: 'chaiupgrade', label: 'Free Drink Upgrade', subtext: 'Upgrade regular drink to special masala chai / iced brew', badge: 'FREE UPGRADE', color: '#F59E0B' },
  { id: 'desserttreat', label: 'Complimentary Sweet Treat', subtext: 'Complimentary mini dessert / chocolate bite with bill', badge: 'SWEET TREAT', color: '#E11D48' },
  { id: 'extraportion', label: 'Chef’s Generous Portion', subtext: 'Kitchen adds extra loaded toppings on your main dish', badge: 'LOADED PORTION', color: '#1C1917' },
];

export const TablePerkWheelModal: React.FC<TablePerkWheelModalProps> = ({
  isOpen,
  onClose,
  restaurantName,
  tableNumber = 1,
  onPerkUnlocked,
  activePerk,
  enabledPerkIds,
}) => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const availablePerks = useMemo(() => {
    if (enabledPerkIds && enabledPerkIds.length > 0) {
      const filtered = TABLE_PERKS.filter((p) => enabledPerkIds.includes(p.id));
      return filtered.length > 0 ? filtered : TABLE_PERKS;
    }
    return TABLE_PERKS;
  }, [enabledPerkIds]);

  const [wonPerk, setWonPerk] = useState<PerkOption | null>(() => {
    if (activePerk) {
      return TABLE_PERKS.find((p) => p.label === activePerk) || {
        id: 'active',
        label: activePerk,
        subtext: 'Active on this table session',
        badge: 'ACTIVE PERK',
        color: '#FF5A36',
      };
    }
    return null;
  });

  if (!isOpen) return null;

  const handleSpin = () => {
    if (spinning || availablePerks.length === 0) return;
    setSpinning(true);
    setWonPerk(null);

    const extraRounds = 5 + Math.floor(Math.random() * 4); // 5 to 8 full spins
    const randomIndex = Math.floor(Math.random() * availablePerks.length);
    const sliceAngle = 360 / availablePerks.length;
    const targetAngle = extraRounds * 360 + (availablePerks.length - randomIndex - 0.5) * sliceAngle;

    setRotation((prev) => prev + targetAngle);

    setTimeout(() => {
      setSpinning(false);
      const chosen = availablePerks[randomIndex];
      setWonPerk(chosen);
      onPerkUnlocked(chosen.label);
    }, 3800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#EFEAE2] p-6 text-center overflow-y-auto max-h-[92vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors border border-[#EFEAE2] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-1 mb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Table #{tableNumber} Dine-In Special</span>
          </div>
          <h3 className="text-2xl font-black text-[#1C1917] font-heading tracking-tight">
            Table Luck Wheel 🎡
          </h3>
          <p className="text-xs text-stone-500 font-sans max-w-xs mx-auto">
            Spin once per table visit to unlock an instant dine-in perk at <strong>{restaurantName}</strong>!
          </p>
        </div>

        {/* Wheel Graphic */}
        <div className="relative w-64 h-64 mx-auto my-3 flex items-center justify-center">
          {/* Top Pointer Indicator */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 text-[#FF5A36] drop-shadow-md">
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-[#FF5A36]" />
          </div>

          {/* Rotating Wheel SVG */}
          <div
            className="w-full h-full rounded-full border-4 border-[#1C1917] shadow-xl overflow-hidden"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? 'transform 3.8s cubic-bezier(0.15, 0.9, 0.25, 1)' : 'none',
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {availablePerks.map((opt, i) => {
                const total = availablePerks.length;
                const angle = 360 / total;
                const startAngle = i * angle;
                const endAngle = (i + 1) * angle;

                const x1 = 50 + 50 * Math.cos((Math.PI * (startAngle - 90)) / 180);
                const y1 = 50 + 50 * Math.sin((Math.PI * (startAngle - 90)) / 180);
                const x2 = 50 + 50 * Math.cos((Math.PI * (endAngle - 90)) / 180);
                const y2 = 50 + 50 * Math.sin((Math.PI * (endAngle - 90)) / 180);

                const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                const midAngle = startAngle + angle / 2;
                const tx = 50 + 32 * Math.cos((Math.PI * (midAngle - 90)) / 180);
                const ty = 50 + 32 * Math.sin((Math.PI * (midAngle - 90)) / 180);

                return (
                  <g key={opt.id}>
                    <path d={pathData} fill={opt.color} stroke="#FAF8F5" strokeWidth="1.2" />
                    <text
                      x={tx}
                      y={ty}
                      fill="#FFFFFF"
                      fontSize="5"
                      fontWeight="900"
                      textAnchor="middle"
                      dominantBaseline="central"
                      transform={`rotate(${midAngle}, ${tx}, ${ty})`}
                    >
                      {opt.badge}
                    </text>
                  </g>
                );
              })}
              {/* Inner Center Cap */}
              <circle cx="50" cy="50" r="12" fill="#FAF8F5" stroke="#1C1917" strokeWidth="2.5" />
              <text x="50" y="52" fill="#FF5A36" fontSize="7" fontWeight="900" textAnchor="middle">
                TABLE
              </text>
            </svg>
          </div>
        </div>

        {/* Won Perk Alert */}
        {wonPerk && !spinning && (
          <div className="my-4 p-4 rounded-2xl bg-orange-50 border-2 border-[#FF5A36] text-center space-y-1.5 animate-in zoom-in-95 duration-200">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FF5A36] text-white text-[10px] font-black uppercase tracking-wider">
              <PartyPopper className="w-3 h-3" />
              <span>Table #{tableNumber} Perk Unlocked!</span>
            </div>
            <h4 className="font-heading font-black text-lg text-stone-900">
              {wonPerk.label}
            </h4>
            <p className="text-xs text-stone-600 leading-snug">
              {wonPerk.subtext}
            </p>
            <div className="pt-2 text-[11px] font-bold text-emerald-700 flex items-center justify-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>Automatically applied to your WhatsApp kitchen order!</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 space-y-2">
          {!wonPerk || spinning ? (
            <button
              type="button"
              onClick={handleSpin}
              disabled={spinning}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#FF5A36] hover:bg-[#e04826] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Gift className={`w-4 h-4 ${spinning ? 'animate-bounce' : ''}`} />
              <span>{spinning ? 'Spinning for Table #' + tableNumber + '…' : 'Spin the Table Wheel!'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#1C1917] hover:bg-black text-white font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span>Done! Continue to Menu</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
