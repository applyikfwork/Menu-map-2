import React, { useState } from 'react';
import { 
  MessageSquare, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck,
  TrendingDown,
  Clock,
  Users,
  Copy,
  Check,
  Zap
} from 'lucide-react';
import { Restaurant, MenuItem } from '../types/database';
import { useToast } from './Toast';

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

interface WhatsAppOrderDrawerProps {
  restaurant: Restaurant;
  cart: CartItem[];
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onClearCart: () => void;
  isOpen: boolean;
  onClose: () => void;
  menuItems?: MenuItem[];
  onAddToCart?: (item: MenuItem) => void;
  tableNumber?: string | number;
  tablePerk?: string | null;
}

export const WhatsAppOrderDrawer: React.FC<WhatsAppOrderDrawerProps> = ({
  restaurant,
  cart,
  onUpdateQuantity,
  onClearCart,
  isOpen,
  onClose,
  menuItems = [],
  onAddToCart,
  tableNumber,
  tablePerk,
}) => {
  const { showToast } = useToast();
  const [customerName, setCustomerName] = useState('');
  const [orderType, setOrderType] = useState<'Self-Pickup' | 'Dine-in' | 'Takeaway' | 'Delivery'>(() => tableNumber ? 'Dine-in' : 'Self-Pickup');
  const [customerNote, setCustomerNote] = useState('');
  const [splitCount, setSplitCount] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [copiedSplit, setCopiedSplit] = useState(false);

  const totalAmount = cart.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);
  const totalItemCount = cart.reduce((sum, ci) => sum + ci.quantity, 0);
  const appMarkupEstimate = Math.round(totalAmount * 1.3 + (totalAmount > 0 ? 35 : 0));
  const estimatedSavings = Math.max(0, appMarkupEstimate - totalAmount);

  // Per person calculation
  const perPersonAmount = Math.round(totalAmount / splitCount);

  // Target WhatsApp number: restaurant whatsapp_number or phone
  const rawNumber = restaurant.whatsapp_number || restaurant.phone || '';
  const sanitizedNumber = rawNumber.replace(/\D/g, '');

  // High-margin pairing candidates not in cart
  const pairingCandidates = React.useMemo(() => {
    if (!menuItems || menuItems.length === 0 || cart.length === 0) return [];
    const cartIds = new Set(cart.map((ci) => ci.item.id));
    return menuItems
      .filter((item) => !cartIds.has(item.id))
      .filter((item) => {
        const name = item.name.toLowerCase();
        return (
          name.includes('coffee') ||
          name.includes('shake') ||
          name.includes('mojito') ||
          name.includes('coke') ||
          name.includes('dip') ||
          name.includes('fries') ||
          name.includes('brownie')
        );
      })
      .slice(0, 2);
  }, [menuItems, cart]);

  const handleCopySplit = () => {
    navigator.clipboard.writeText(`₹${perPersonAmount}`);
    setCopiedSplit(true);
    showToast(`Copied ₹${perPersonAmount}/person to clipboard!`, 'success');
    setTimeout(() => setCopiedSplit(false), 2000);
  };

  const handleSendWhatsAppOrder = () => {
    if (cart.length === 0) return;

    // Current page live URL
    const liveUrl = window.location.href;

    // Build formatted message
    let message = tableNumber 
      ? `🍽️ *[TABLE #${tableNumber} DINE-IN ORDER] via Menu Maps*\n`
      : `🍽️ *NEW ORDER via Menu Maps*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `📍 *Restaurant:* ${restaurant.name}\n`;
    if (tableNumber) {
      message += `🪑 *Dine-in Table:* Table #${tableNumber}\n`;
    }
    if (tablePerk) {
      message += `🎁 *Table Perk:* ${tablePerk}\n`;
    }
    message += `🔗 *Live Menu:* ${liveUrl}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

    message += `📋 *COUNTER ORDER SUMMARY:*\n`;
    cart.forEach((ci, idx) => {
      const itemSubtotal = ci.item.price * ci.quantity;
      const vegIcon = ci.item.dietary_tags?.includes('Veg') ? '🟢' : '🔴';
      message += `${idx + 1}. ${vegIcon} *${ci.item.name}* x ${ci.quantity}\n`;
      message += `   ₹${ci.item.price} each = ₹${itemSubtotal}\n`;
    });

    message += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `💰 *TOTAL COUNTER BILL: ₹${totalAmount}*\n`;
    if (splitCount > 1) {
      message += `👥 *Split between ${splitCount} diners: ₹${perPersonAmount} each*\n`;
    }
    message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

    message += `👤 *Order Details:*\n`;
    if (customerName.trim()) {
      message += `• Customer Name: ${customerName.trim()}\n`;
    }

    if (orderType === 'Self-Pickup') {
      message += `• Mode: 🚶 15-Min Quick Self-Pickup (Counter Collection)\n`;
      message += `• ETA: ~15 mins from confirmation (Skip queue & ₹0 fee)\n`;
    } else if (orderType === 'Dine-in') {
      message += `• Mode: 🍽️ Dine-in Table Order\n`;
    } else if (orderType === 'Takeaway') {
      message += `• Mode: 🥡 Counter Takeaway\n`;
    } else {
      message += `• Mode: 🛵 Direct Delivery\n`;
    }

    if (customerNote.trim()) {
      message += `• Table No. / Address / Notes: ${customerNote.trim()}\n`;
    }

    message += `\n_Ordered at authentic counter rates with 0% app markup via Menu Map_`;

    const encoded = encodeURIComponent(message);
    const whatsappUrl = sanitizedNumber
      ? `https://wa.me/${sanitizedNumber.startsWith('91') ? sanitizedNumber : '91' + sanitizedNumber}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;

    window.open(whatsappUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] w-full max-w-md h-full flex flex-col shadow-2xl border-l border-[#EFEAE2] animate-in slide-in-from-right duration-300">
        
        {/* Obsidian Slate Header */}
        <div className="p-5 border-b border-stone-800 bg-[#1C1917] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0F766E] text-white flex items-center justify-center shadow-md">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-base text-white">
                Your Order Tray
              </h3>
              <p className="text-[11px] text-[#0F766E] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Direct Counter Order • {restaurant.name}</span>
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

        {/* Cart items list (Physical register bill receipt look) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* Estimated App Savings Banner */}
          {cart.length > 0 && estimatedSavings > 0 && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-emerald-900">
                    You Save ~₹{estimatedSavings}
                  </div>
                  <div className="text-[10px] text-emerald-700">
                    Apps charge ~₹{appMarkupEstimate} for this meal
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-white text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                0% App Markup
              </span>
            </div>
          )}

          {/* Cart item rows */}
          {cart.length > 0 ? (
            <div className="space-y-3">
              {cart.map((ci) => {
                const isVeg = ci.item.dietary_tags?.includes('Veg') || ci.item.dietary_tags?.includes('Vegan');
                return (
                  <div
                    key={ci.item.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-[#EFEAE2] shadow-2xs gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`w-3.5 h-3.5 rounded-xs border flex items-center justify-center shrink-0 ${
                            isVeg ? 'border-emerald-600' : 'border-rose-600'
                          }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                        </div>
                        <h4 className="font-heading font-extrabold text-sm text-[#1C1917] truncate">
                          {ci.item.name}
                        </h4>
                      </div>
                      <div className="text-xs text-stone-500 mt-1 pl-5">
                        ₹{ci.item.price} × {ci.quantity} ={' '}
                        <strong className="text-[#1C1917] font-heading font-bold">₹{ci.item.price * ci.quantity}</strong>
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center bg-[#FAF8F5] border border-[#EFEAE2] rounded-full p-1 gap-2 shadow-2xs shrink-0">
                      <button
                        onClick={() => onUpdateQuantity(ci.item.id, -1)}
                        className="w-6 h-6 rounded-full bg-white hover:bg-stone-200 flex items-center justify-center text-stone-700 font-bold transition-colors shadow-2xs cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-heading font-black text-[#1C1917] min-w-[16px] text-center">
                        {ci.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(ci.item.id, 1)}
                        className="w-6 h-6 rounded-full bg-[#FF5A36] hover:bg-[#D8350F] flex items-center justify-center text-white font-bold transition-colors shadow-2xs cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="flex justify-end pt-1">
                <button
                  onClick={onClearCart}
                  className="text-xs font-bold text-[#D8350F] hover:underline flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear tray</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-white border border-[#EFEAE2] flex items-center justify-center mx-auto text-stone-400">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h4 className="font-heading font-black text-[#1C1917] text-base">
                Your order tray is empty
              </h4>
              <p className="text-xs text-stone-500 max-w-xs mx-auto font-sans">
                Tap "+ Add to Tray" on any dish to assemble your zero-markup WhatsApp order.
              </p>
            </div>
          )}

          {/* Quick Pairing Suggestion inside Drawer */}
          {cart.length > 0 && pairingCandidates.length > 0 && onAddToCart && (
            <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-black text-amber-950">
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                  Popular Counter Add-Ons:
                </span>
              </div>
              <div className="space-y-1.5">
                {pairingCandidates.map((pair) => (
                  <div
                    key={pair.id}
                    className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-amber-100 text-xs"
                  >
                    <span className="truncate text-stone-800 font-bold">{pair.name} (₹{pair.price})</span>
                    <button
                      type="button"
                      onClick={() => onAddToCart(pair)}
                      className="text-[10px] font-black bg-amber-600 hover:bg-amber-700 text-white px-2 py-0.5 rounded-lg shrink-0 cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer details input & Order Mode */}
          {cart.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-dashed border-stone-200">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-stone-400">
                    Order Mode
                  </h4>
                  {orderType === 'Self-Pickup' && (
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Zero-Wait • 15 Mins
                    </span>
                  )}
                </div>

                {/* 4 Order Mode Chips */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderType('Self-Pickup')}
                    className={`p-2.5 rounded-2xl text-xs font-bold transition-all text-left flex flex-col gap-0.5 cursor-pointer ${
                      orderType === 'Self-Pickup'
                        ? 'bg-[#0F766E] text-white shadow-xs'
                        : 'bg-white text-stone-700 border border-[#EFEAE2] hover:border-stone-400'
                    }`}
                  >
                    <span className="flex items-center gap-1 font-extrabold">
                      🚶 15-Min Self-Pickup
                    </span>
                    <span className={`text-[10px] ${orderType === 'Self-Pickup' ? 'text-emerald-100' : 'text-stone-400'}`}>
                      Skip queue & 0% markup
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderType('Dine-in')}
                    className={`p-2.5 rounded-2xl text-xs font-bold transition-all text-left flex flex-col gap-0.5 cursor-pointer ${
                      orderType === 'Dine-in'
                        ? 'bg-[#1C1917] text-white shadow-xs'
                        : 'bg-white text-stone-700 border border-[#EFEAE2] hover:border-stone-400'
                    }`}
                  >
                    <span className="flex items-center gap-1 font-extrabold">
                      🍽️ Dine-in Table
                    </span>
                    <span className={`text-[10px] ${orderType === 'Dine-in' ? 'text-stone-300' : 'text-stone-400'}`}>
                      Send to waiter/kitchen
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderType('Takeaway')}
                    className={`p-2.5 rounded-2xl text-xs font-bold transition-all text-left flex flex-col gap-0.5 cursor-pointer ${
                      orderType === 'Takeaway'
                        ? 'bg-[#1C1917] text-white shadow-xs'
                        : 'bg-white text-stone-700 border border-[#EFEAE2] hover:border-stone-400'
                    }`}
                  >
                    <span className="flex items-center gap-1 font-extrabold">
                      🥡 Counter Takeaway
                    </span>
                    <span className={`text-[10px] ${orderType === 'Takeaway' ? 'text-stone-300' : 'text-stone-400'}`}>
                      Pack for home
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderType('Delivery')}
                    className={`p-2.5 rounded-2xl text-xs font-bold transition-all text-left flex flex-col gap-0.5 cursor-pointer ${
                      orderType === 'Delivery'
                        ? 'bg-[#1C1917] text-white shadow-xs'
                        : 'bg-white text-stone-700 border border-[#EFEAE2] hover:border-stone-400'
                    }`}
                  >
                    <span className="flex items-center gap-1 font-extrabold">
                      🛵 Direct Delivery
                    </span>
                    <span className={`text-[10px] ${orderType === 'Delivery' ? 'text-stone-300' : 'text-stone-400'}`}>
                      Direct from restaurant
                    </span>
                  </button>
                </div>

                {orderType === 'Self-Pickup' && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-teal-50 border border-teal-200/80 text-[11px] text-teal-950 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#0F766E] shrink-0" />
                    <span>Kitchen begins prep now. Collect hot at counter in ~15 mins. Pay direct via UPI or cash!</span>
                  </div>
                )}
              </div>

              {/* Per-Person Bill Splitter Widget */}
              <div className="p-3 rounded-2xl bg-white border border-[#EFEAE2] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-stone-700 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-stone-500" />
                    Split Counter Bill
                  </span>
                  <div className="flex items-center gap-1">
                    {([1, 2, 3, 4, 5] as const).map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setSplitCount(num)}
                        className={`w-6 h-6 rounded-lg text-xs font-black transition-all cursor-pointer ${
                          splitCount === num
                            ? 'bg-[#0F766E] text-white'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {splitCount > 1 && (
                  <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-xs">
                    <span className="text-stone-600">
                      Exact per person ({splitCount} friends):
                    </span>
                    <div className="flex items-center gap-2">
                      <strong className="hd font-black text-sm text-[#1C1917]">
                        ₹{perPersonAmount}
                      </strong>
                      <button
                        type="button"
                        onClick={handleCopySplit}
                        className="text-[10px] font-bold text-[#0F766E] hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        {copiedSplit ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedSplit ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Rohit"
                  className="w-full px-4 py-2.5 bg-white border border-[#EFEAE2] rounded-2xl text-xs focus:outline-hidden focus:border-[#FF5A36] text-[#1C1917]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Table No. / Delivery Address / Cooking Notes
                </label>
                <textarea
                  rows={2}
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder={orderType === 'Self-Pickup' ? 'e.g. Packing instructions, less spicy, extra dip' : 'e.g. Table 4, less spicy, extra green chutney'}
                  className="w-full px-4 py-2.5 bg-white border border-[#EFEAE2] rounded-2xl text-xs focus:outline-hidden focus:border-[#FF5A36] text-[#1C1917]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer with Total and WhatsApp action */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-[#EFEAE2] bg-white space-y-3" style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom))' }}>
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs font-medium text-stone-500">Counter Total ({totalItemCount} items)</span>
                <div className="font-heading font-black text-2xl text-[#1C1917]">
                  ₹{totalAmount}
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                0% App Commission
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE2] text-[11px] text-stone-600 leading-snug">
              <strong>Counter Rate:</strong> Prices are verified direct counter rates. {restaurant.name} will confirm dish availability and preparation time on WhatsApp.
            </div>

            <button
              onClick={handleSendWhatsAppOrder}
              className="w-full py-4 rounded-full bg-[#0F766E] hover:bg-[#0D9488] text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>
                {orderType === 'Self-Pickup'
                  ? `Send 15-Min Self-Pickup Order (₹${totalAmount})`
                  : `Send Order via WhatsApp (₹${totalAmount})`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[10px] text-center text-stone-400">
              Sends itemized order directly to registered venue {sanitizedNumber ? `(+${sanitizedNumber})` : ''}
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
