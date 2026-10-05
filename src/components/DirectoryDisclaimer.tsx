import React, { useState } from 'react';
import { ShieldCheck, Info, Sparkles, Building2, CheckCircle2, X, Send } from 'lucide-react';
import { useToast } from './Toast';

interface DirectoryDisclaimerProps {
  restaurantName?: string;
  restaurantPhone?: string;
  className?: string;
  variant?: 'full' | 'compact' | 'inline';
}

export const DirectoryDisclaimer: React.FC<DirectoryDisclaimerProps> = ({
  restaurantName,
  restaurantPhone,
  className = '',
  variant = 'full',
}) => {
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [userRole, setUserRole] = useState<'customer' | 'owner'>('customer');
  const [senderName, setSenderName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [correctionNote, setCorrectionNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setModalOpen(false);
      setSubmitted(false);
      setCorrectionNote('');
      showToast('Thank you! Your update has been submitted for editorial verification.', 'success');
    }, 1200);
  };

  if (variant === 'inline') {
    return (
      <div className={`flex items-start gap-2.5 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE2] text-stone-700 text-xs ${className}`}>
        <Info className="w-4 h-4 text-[#FF5A36] shrink-0 mt-0.5" />
        <div className="flex-1 font-sans">
          <p className="leading-relaxed">
            <strong className="font-bold text-[#1C1917]">Menu & Price Reference:</strong> Dish prices and availability are indicative reference rates curated from public domain listings and community visits. Final bills are confirmed directly by the venue at the counter.
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`p-5 rounded-3xl bg-white border border-[#EFEAE2] text-xs text-stone-600 space-y-2 shadow-2xs ${className}`}>
        <div className="flex items-center gap-2 text-[#1C1917] font-heading font-black text-sm">
          <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
          <span>Independent Food Directory & Price Reference Guide</span>
        </div>
        <p className="text-xs leading-relaxed text-stone-500 font-sans">
          Information {restaurantName ? `for ${restaurantName}` : 'on this page'} is aggregated from physical menus and verified visitor photos. Direct counter prices subject to local restaurant revision.
        </p>
        <button
          onClick={() => setModalOpen(true)}
          className="text-xs font-bold text-[#D8350F] hover:text-[#FF5A36] underline decoration-dotted underline-offset-4"
        >
          Notice a price change or manage this listing? Click here.
        </button>
      </div>
    );
  }

  return (
    <>
      <div className={`bg-white border border-[#EFEAE2] rounded-3xl p-6 sm:p-8 shadow-xs space-y-5 ${className}`}>
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#EFEAE2]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#FF5A36] flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="font-heading font-black text-base text-[#1C1917]">
              Community Food Directory & Counter Menu Transparency Notice
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-bold">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Direct Cafe Contact
            </span>
            <span className="px-3 py-1 rounded-full bg-[#FAF8F5] text-stone-700 border border-[#EFEAE2]">
              0% Platform Markup
            </span>
          </div>
        </div>

        {/* Informative Body Copy */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-stone-600 leading-relaxed font-sans">
          <div className="space-y-2 md:col-span-2">
            <h4 className="font-heading font-black text-sm text-[#1C1917] flex items-center gap-1.5">
              <Info className="w-4 h-4 text-[#FF5A36]" />
              <span>Public Information & Indicative Pricing Guide</span>
            </h4>
            <p>
              Menu Map operates as an independent community culinary directory celebrating heritage eateries, local cafes, and dining spots across Delhi NCR. Menus, dish names, and pricing displayed for{' '}
              <strong className="text-[#1C1917] font-semibold">{restaurantName || 'listed restaurants'}</strong> are compiled from publicly accessible platforms, photo archives, and recent dine-in visits.
            </p>
            <p className="text-stone-500 text-[11px]">
              Because ingredients, seasonal offerings, and taxes change periodically, all items and prices should be regarded as reference estimates. Final billing, item availability, and delivery charges are confirmed directly by the venue when you contact or order through WhatsApp.
            </p>
          </div>

          {/* Owner & Community Correction CTA */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE2] space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[#1C1917] font-heading font-black text-xs mb-1">
                <Building2 className="w-4 h-4 text-[#FF5A36]" />
                <span>Restaurant Owner or Diner?</span>
              </div>
              <p className="text-[11px] text-stone-500 leading-normal">
                Have prices been updated recently, or do you manage this venue and want to verify details for free?
              </p>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="w-full py-2.5 px-3 rounded-full bg-[#1C1917] hover:bg-black text-white font-extrabold text-[11px] shadow-xs transition-colors flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Suggest Update / Claim Listing</span>
            </button>
          </div>
        </div>
      </div>

      {/* Suggest Update / Claim Listing Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-[#EFEAE2] space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFEAE2]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-orange-100 text-[#FF5A36] flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-base text-[#1C1917]">
                    Menu Update & Verification
                  </h3>
                  <p className="text-[11px] text-stone-500 font-sans">
                    {restaurantName ? `Listing: ${restaurantName}` : 'Menu Map Community Directory'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors border border-[#EFEAE2]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  I am submitting this update as:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setUserRole('customer')}
                    className={`py-2 px-3 rounded-full text-xs font-bold border text-center transition-all ${
                      userRole === 'customer'
                        ? 'bg-[#1C1917] text-white border-[#1C1917]'
                        : 'bg-white border-[#EFEAE2] text-stone-600 hover:bg-[#FAF8F5]'
                    }`}
                  >
                    Customer / Foodie Patron
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserRole('owner')}
                    className={`py-2 px-3 rounded-full text-xs font-bold border text-center transition-all ${
                      userRole === 'owner'
                        ? 'bg-[#0F766E] text-white border-[#0F766E]'
                        : 'bg-white border-[#EFEAE2] text-stone-600 hover:bg-[#FAF8F5]'
                    }`}
                  >
                    Restaurant Owner / Manager
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="e.g. Ramesh or Manager"
                    className="w-full px-4 py-2.5 bg-white border border-[#EFEAE2] rounded-2xl text-xs font-medium focus:outline-hidden focus:border-[#FF5A36] text-[#1C1917]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Phone or Email
                  </label>
                  <input
                    type="text"
                    required
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder="e.g. +91 98... or email"
                    className="w-full px-4 py-2.5 bg-white border border-[#EFEAE2] rounded-2xl text-xs font-medium focus:outline-hidden focus:border-[#FF5A36] text-[#1C1917]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  What details would you like to update?
                </label>
                <textarea
                  rows={3}
                  required
                  value={correctionNote}
                  onChange={(e) => setCorrectionNote(e.target.value)}
                  placeholder="e.g. Price of Butter Chicken updated from ₹280 to ₹300, new phone number, or request official badge..."
                  className="w-full px-4 py-2.5 bg-white border border-[#EFEAE2] rounded-2xl text-xs font-medium focus:outline-hidden focus:border-[#FF5A36] text-[#1C1917]"
                />
              </div>

              <div className="p-3 rounded-2xl bg-white border border-[#EFEAE2] text-[11px] text-stone-500 flex items-start gap-2 font-sans">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  Our directory team reviews and applies updates free of charge to maintain accurate menus for the foodie community.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-stone-600 hover:bg-stone-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitted}
                  className="px-6 py-2.5 rounded-full bg-[#1C1917] hover:bg-black text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitted ? 'Submitting...' : 'Submit Update'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
