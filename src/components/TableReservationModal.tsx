import React, { useState } from 'react';
import { X, Calendar, Clock, Users, Sparkles, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Restaurant } from '../types/database';

interface TableReservationModalProps {
  restaurant: Restaurant;
  isOpen: boolean;
  onClose: () => void;
}

export const TableReservationModal: React.FC<TableReservationModalProps> = ({
  restaurant,
  isOpen,
  onClose,
}) => {
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('08:00 PM');
  const [guestsCount, setGuestsCount] = useState('4');
  const [occasion, setOccasion] = useState('Casual Dining');
  const [specialRequest, setSpecialRequest] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestPhone.trim()) return;

    // Target phone/WhatsApp number
    const targetPhone = (restaurant.whatsapp_number || restaurant.phone || '919711510115').replace(/\D/g, '');
    const formattedTarget = targetPhone.startsWith('91') ? targetPhone : `91${targetPhone.slice(-10)}`;

    const messageLines = [
      `👋 *Hello ${restaurant.name}!*`,
      `I would like to reserve a table via *Menu Map*:`,
      ``,
      `📅 *Date:* ${date}`,
      `⏰ *Time:* ${time}`,
      `👥 *Number of Guests:* ${guestsCount} people`,
      `🎉 *Occasion:* ${occasion}`,
      `👤 *Name:* ${guestName.trim()}`,
      `📞 *Phone:* ${guestPhone.trim()}`,
    ];

    if (specialRequest.trim()) {
      messageLines.push(`📝 *Special Request:* ${specialRequest.trim()}`);
    }

    messageLines.push(``);
    messageLines.push(`Kindly confirm table availability. Thank you!`);

    const waUrl = `https://wa.me/${formattedTarget}?text=${encodeURIComponent(messageLines.join('\n'))}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#EFEAE2] overflow-hidden my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-800 bg-[#1C1917] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF5A36] text-white flex items-center justify-center shadow-md">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-white text-lg">
                Book a Table / Inquire
              </h3>
              <p className="text-xs text-stone-300">
                Direct instant confirmation with {restaurant.name}
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

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-heading font-black text-xl text-[#1C1917]">
              Inquiry Sent to WhatsApp!
            </h4>
            <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed font-sans">
              Your table booking details have been opened in WhatsApp directly with the restaurant management. They will confirm your reservation shortly.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="py-3 px-8 rounded-full bg-[#1C1917] text-white font-extrabold text-xs hover:bg-black transition-all shadow-md"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#FF5A36]" />
                  <span>Reservation Date</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#EFEAE2] text-xs font-medium focus:outline-hidden focus:border-[#FF5A36] bg-white text-[#1C1917]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#FF5A36]" />
                  <span>Preferred Time</span>
                </label>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#EFEAE2] text-xs font-medium focus:outline-hidden focus:border-[#FF5A36] bg-white text-[#1C1917] cursor-pointer"
                >
                  <option value="12:30 PM">12:30 PM (Lunch)</option>
                  <option value="01:30 PM">01:30 PM (Lunch)</option>
                  <option value="02:30 PM">02:30 PM (Late Lunch)</option>
                  <option value="07:00 PM">07:00 PM (Early Dinner)</option>
                  <option value="08:00 PM">08:00 PM (Dinner)</option>
                  <option value="08:30 PM">08:30 PM (Prime Dinner)</option>
                  <option value="09:00 PM">09:00 PM (Dinner)</option>
                  <option value="09:30 PM">09:30 PM (Late Dinner)</option>
                  <option value="10:00 PM">10:00 PM (Late Dinner)</option>
                </select>
              </div>
            </div>

            {/* Guests & Occasion */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span>Number of Guests</span>
                </label>
                <select
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#EFEAE2] text-xs font-medium focus:outline-hidden focus:border-[#0F766E] bg-white text-[#1C1917] cursor-pointer"
                >
                  <option value="1">1 Person</option>
                  <option value="2">2 People (Couple Table)</option>
                  <option value="4">3 - 4 People (Family Table)</option>
                  <option value="6">5 - 6 People</option>
                  <option value="8">7 - 8 People</option>
                  <option value="10">10+ People (Group/Banquet)</option>
                  <option value="20">20+ People (Party Booking)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Occasion</span>
                </label>
                <select
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#EFEAE2] text-xs font-medium focus:outline-hidden focus:border-[#0F766E] bg-white text-[#1C1917] cursor-pointer"
                >
                  <option value="Casual Dining">Casual Dining</option>
                  <option value="Birthday Celebration">Birthday Celebration 🎂</option>
                  <option value="Anniversary Dinner">Anniversary Dinner ❤️</option>
                  <option value="Family Gathering">Family Gathering 👨‍👩‍👧‍👦</option>
                  <option value="Kitty Party">Kitty Party ☕</option>
                  <option value="Corporate / Business">Corporate / Business Meet 💼</option>
                </select>
              </div>
            </div>

            {/* Contact details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#EFEAE2] text-xs font-medium focus:outline-hidden focus:border-[#FF5A36] bg-white text-[#1C1917]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Contact Phone Number *
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 98765 43210"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#EFEAE2] text-xs font-medium focus:outline-hidden focus:border-[#FF5A36] bg-white text-[#1C1917]"
                />
              </div>
            </div>

            {/* Special Request */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Special Requests (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., Corner booth, high chair for toddler, birthday decor"
                value={specialRequest}
                onChange={(e) => setSpecialRequest(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-[#EFEAE2] text-xs font-medium focus:outline-hidden focus:border-[#FF5A36] bg-white text-[#1C1917]"
              />
            </div>

            {/* Submit via WhatsApp */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-4 px-4 rounded-full bg-[#0F766E] hover:bg-[#0D9488] text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                <span>Send Booking Request to WhatsApp</span>
              </button>
              <p className="text-[11px] text-center text-stone-400 mt-2 font-sans">
                0% booking fee • Instant direct WhatsApp confirmation with {restaurant.name}
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
