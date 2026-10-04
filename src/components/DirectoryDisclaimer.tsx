import React, { useState } from 'react';
import { ShieldCheck, Info, Sparkles, Building2, CheckCircle2, MessageSquare, X, Send } from 'lucide-react';
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
      <div className={`flex items-start gap-2 p-3 rounded-2xl bg-amber-50/80 border border-amber-200/70 text-amber-900 text-xs ${className}`}>
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="leading-relaxed">
            <strong className="font-bold">Menu & Price Reference:</strong> Dish prices and availability are indicative reference rates curated from public domain listings and community visits. Final bills and seasonal items are confirmed directly by the venue.
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`p-4 rounded-2xl bg-stone-50 border border-stone-200/90 text-xs text-stone-600 space-y-2 ${className}`}>
        <div className="flex items-center gap-2 text-stone-800 font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Independent Food Directory & Reference Guide</span>
        </div>
        <p className="text-[11px] leading-relaxed text-stone-500">
          Information {restaurantName ? `for ${restaurantName}` : 'on this page'} is aggregated from public domain directories, map contributions, and verified visitor menus. Prices and items may vary over time.
        </p>
        <button
          onClick={() => setModalOpen(true)}
          className="text-[11px] font-bold text-orange-600 hover:text-orange-700 underline decoration-orange-300 underline-offset-2"
        >
          Notice a price change or claim this listing? Click here.
        </button>
      </div>
    );
  }

  return (
    <>
      <div className={`bg-gradient-to-br from-stone-50 via-amber-50/40 to-stone-50 border border-stone-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4 ${className}`}>
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-200/70">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
            </div>
            <span className="font-heading font-extrabold text-sm text-slate-900">
              Community Food Directory & Menu Transparency Notice
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-semibold">
            <span className="px-2.5 py-1 rounded-full bg-emerald-100/70 text-emerald-800 border border-emerald-200/70">
              Direct Restaurant Contact
            </span>
            <span className="px-2.5 py-1 rounded-full bg-stone-200/60 text-stone-700">
              0% Platform Markups
            </span>
          </div>
        </div>

        {/* Informative Body Copy */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600 leading-relaxed">
          <div className="space-y-1.5 md:col-span-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-orange-500" />
              <span>Public Information & Indicative Pricing Guide</span>
            </h4>
            <p>
              Menu Map operates as an independent community culinary directory celebrating heritage eateries, local cafes, and dining spots. Menus, dish names, descriptions, and pricing displayed for{' '}
              <strong className="text-slate-900 font-semibold">{restaurantName || 'listed restaurants'}</strong> are compiled from publicly accessible platforms, photo archives, and recent dine-in visits.
            </p>
            <p className="text-slate-500 text-[11px]">
              Because ingredients, seasonal offerings, and taxes change periodically, all items and prices should be regarded as reference estimates. Final billing, item availability, and delivery charges are confirmed directly by the venue when you contact or order through WhatsApp.
            </p>
          </div>

          {/* Owner & Community Correction CTA */}
          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs mb-1">
                <Building2 className="w-4 h-4 text-rose-500" />
                <span>Restaurant Owner or Foodie?</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Have prices been updated recently, or do you manage this venue and want to verify details for free?
              </p>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="w-full py-2 px-3 rounded-xl bg-stone-900 hover:bg-slate-800 text-white font-bold text-[11px] shadow-xs transition-colors flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Suggest Update / Claim Listing</span>
            </button>
          </div>
        </div>
      </div>

      {/* Suggest Update / Claim Listing Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-stone-200 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-base text-slate-900">
                    Menu Update & Owner Verification
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {restaurantName ? `Listing: ${restaurantName}` : 'Menu Map Community Directory'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-stone-100 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  I am submitting this update as:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setUserRole('customer')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border text-center transition-all ${
                      userRole === 'customer'
                        ? 'bg-rose-50 border-rose-300 text-rose-700'
                        : 'bg-stone-50 border-stone-200 text-slate-600 hover:bg-stone-100'
                    }`}
                  >
                    Customer / Foodie Patron
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserRole('owner')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border text-center transition-all ${
                      userRole === 'owner'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'bg-stone-50 border-stone-200 text-slate-600 hover:bg-stone-100'
                    }`}
                  >
                    Restaurant Owner / Manager
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="e.g. Ramesh or Manager"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone or Email
                  </label>
                  <input
                    type="text"
                    required
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder="e.g. +91 98... or email"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  What details would you like to update?
                </label>
                <textarea
                  rows={3}
                  required
                  value={correctionNote}
                  onChange={(e) => setCorrectionNote(e.target.value)}
                  placeholder="e.g. Price of Butter Chicken updated from ₹280 to ₹300, new phone number, or request official badge..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-[11px] text-slate-500 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  Our directory team reviews and applies updates free of charge to maintain accurate menus for the foodie community.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitted}
                  className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
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
