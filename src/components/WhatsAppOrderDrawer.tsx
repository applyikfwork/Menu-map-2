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
  TrendingDown
} from 'lucide-react';
import { Restaurant, MenuItem } from '../types/database';

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
}

export const WhatsAppOrderDrawer: React.FC<WhatsAppOrderDrawerProps> = ({
  restaurant,
  cart,
  onUpdateQuantity,
  onClearCart,
  isOpen,
  onClose,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [orderType, setOrderType] = useState<'Dine-in' | 'Takeaway' | 'Delivery'>('Dine-in');
  const [customerNote, setCustomerNote] = useState('');

  const totalAmount = cart.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);
  const totalItemCount = cart.reduce((sum, ci) => sum + ci.quantity, 0);
  const appMarkupEstimate = Math.round(totalAmount * 1.3 + (totalAmount > 0 ? 35 : 0));
  const estimatedSavings = Math.max(0, appMarkupEstimate - totalAmount);

  // Target WhatsApp number: restaurant whatsapp_number or phone
  const rawNumber = restaurant.whatsapp_number || restaurant.phone || '';
  const sanitizedNumber = rawNumber.replace(/\D/g, '');

  const handleSendWhatsAppOrder = () => {
    if (cart.length === 0) return;

    // Current page live URL
    const liveUrl = window.location.href;

    // Build formatted message
    let message = `🍽️ *NEW ORDER via Menu Map*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `📍 *Restaurant:* ${restaurant.name}\n`;
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
    message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

    message += `👤 *Order Details:*\n`;
    if (customerName.trim()) {
      message += `• Customer Name: ${customerName.trim()}\n`;
    }
    message += `• Mode: ${orderType}\n`;
    if (customerNote.trim()) {
      message += `• Table No. / Address / Notes: ${customerNote.trim()}\n`;
    }

    message += `\n_Ordered at authentic counter price with 0% app markup via Menu Map_`;

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
                <span className="text-emerald-300">Direct WhatsApp Order • {restaurant.name}</span>
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

        {/* Cart items list (Physical register bill receipt look) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* Estimated App Savings Banner */}
          {cart.length > 0 && estimatedSavings > 0 && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between">
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
                0% Markup
              </span>
            </div>
          )}

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
                        className="w-6 h-6 rounded-full bg-white hover:bg-stone-200 flex items-center justify-center text-stone-700 font-bold transition-colors shadow-2xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-heading font-black text-[#1C1917] min-w-[16px] text-center">
                        {ci.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(ci.item.id, 1)}
                        className="w-6 h-6 rounded-full bg-[#FF5A36] hover:bg-[#D8350F] flex items-center justify-center text-white font-bold transition-colors shadow-2xs"
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
                  className="text-xs font-bold text-[#D8350F] hover:underline flex items-center gap-1 transition-colors"
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
                Tap "+ Add at Counter Price" on any dish to assemble your WhatsApp order.
              </p>
            </div>
          )}

          {/* Customer details input */}
          {cart.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-dashed border-stone-200">
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-stone-400">
                Order Specifics
              </h4>

              {/* Order Type Chips */}
              <div className="grid grid-cols-3 gap-2">
                {(['Dine-in', 'Takeaway', 'Delivery'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setOrderType(type)}
                    className={`py-2 px-1 rounded-full text-xs font-bold transition-all ${
                      orderType === type
                        ? 'bg-[#1C1917] text-white shadow-2xs'
                        : 'bg-white text-stone-700 border border-[#EFEAE2] hover:border-stone-400'
                    }`}
                  >
                    {type}
                  </button>
                ))}
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
                  placeholder="e.g. Table 4, less spicy, extra green chutney please"
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
              className="w-full py-4 rounded-full bg-[#0F766E] hover:bg-[#0D9488] text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>Send Order via WhatsApp (₹{totalAmount})</span>
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
