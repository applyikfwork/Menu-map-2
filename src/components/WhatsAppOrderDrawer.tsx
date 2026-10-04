import React, { useState } from 'react';
import { 
  MessageSquare, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  UtensilsCrossed, 
  Sparkles,
  PhoneCall
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

    message += `📋 *ORDER SUMMARY:*\n`;
    cart.forEach((ci, idx) => {
      const itemSubtotal = ci.item.price * ci.quantity;
      const vegIcon = ci.item.dietary_tags?.includes('Veg') ? '🟢' : '🔴';
      message += `${idx + 1}. ${vegIcon} *${ci.item.name}* x ${ci.quantity}\n`;
      message += `   ₹${ci.item.price} each = ₹${itemSubtotal}\n`;
    });

    message += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `💰 *TOTAL BILL: ₹${totalAmount}*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

    message += `👤 *Customer Details:*\n`;
    if (customerName.trim()) {
      message += `• Name: ${customerName.trim()}\n`;
    }
    message += `• Order Type: ${orderType}\n`;
    if (customerNote.trim()) {
      message += `• Instructions / Address: ${customerNote.trim()}\n`;
    }

    message += `\n_Powered by Menu Map (Authentic Menus & Zero Commissions)_`;

    const encoded = encodeURIComponent(message);
    const whatsappUrl = sanitizedNumber
      ? `https://wa.me/${sanitizedNumber.startsWith('91') ? sanitizedNumber : '91' + sanitizedNumber}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;

    window.open(whatsappUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl border-l border-stone-200 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-base text-slate-900">
                Your Order Tray
              </h3>
              <p className="text-[11px] text-emerald-700 font-bold">
                Direct WhatsApp Order to {restaurant.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-200 rounded-full text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart items list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length > 0 ? (
            <div className="space-y-3">
              {cart.map((ci) => (
                <div
                  key={ci.item.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-sm text-slate-900 truncate">
                      {ci.item.name}
                    </h4>
                    <div className="text-xs text-slate-500">
                      ₹{ci.item.price} × {ci.quantity} ={' '}
                      <strong className="text-slate-800">₹{ci.item.price * ci.quantity}</strong>
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center bg-white border border-stone-200 rounded-xl p-1 gap-2 shadow-2xs">
                    <button
                      onClick={() => onUpdateQuantity(ci.item.id, -1)}
                      className="w-6 h-6 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-slate-700 font-bold transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-black text-slate-900 min-w-[16px] text-center">
                      {ci.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(ci.item.id, 1)}
                      className="w-6 h-6 rounded-lg bg-rose-500 hover:bg-rose-600 flex items-center justify-center text-white font-bold transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex justify-end pt-1">
                <button
                  onClick={onClearCart}
                  className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear tray</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center space-y-3">
              <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto" />
              <h4 className="font-heading font-bold text-slate-800 text-base">
                Your order tray is empty
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Tap "+ Add to Order" on any menu dish to start assembling your meal.
              </p>
            </div>
          )}

          {/* Customer details input */}
          {cart.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-stone-100">
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-400">
                Order Specifics
              </h4>

              {/* Order Type */}
              <div className="grid grid-cols-3 gap-2">
                {(['Dine-in', 'Takeaway', 'Delivery'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setOrderType(type)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      orderType === type
                        ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                        : 'bg-stone-50 text-slate-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Rohit"
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Table No. / Delivery Address / Cooking Notes
                </label>
                <textarea
                  rows={2}
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder="e.g. Table 4, make it less spicy, extra dip please"
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer with Total and Send button */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-stone-100 bg-stone-50/50 space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-500">Total ({totalItemCount} items)</span>
                <div className="font-heading font-black text-2xl text-slate-900">
                  ₹{totalAmount}
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Direct to Owner
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 leading-snug">
              <strong>Notice:</strong> Prices are indicative estimates from recent public menus. {restaurant.name} will confirm exact item availability and final bill on WhatsApp.
            </div>

            <button
              onClick={handleSendWhatsAppOrder}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>Send Order to Restaurant via WhatsApp</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[10px] text-center text-slate-400">
              Sends itemized order & Menu Map live URL directly to registered phone {sanitizedNumber ? `(+${sanitizedNumber})` : ''}
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
