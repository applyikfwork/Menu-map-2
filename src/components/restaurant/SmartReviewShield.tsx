import React, { useState } from 'react';
import { Star, ShieldAlert, HeartHandshake, MessageSquare, ExternalLink, Sparkles, Check, Send } from 'lucide-react';
import { Restaurant } from '../../types/database';

interface SmartReviewShieldProps {
  restaurant: Restaurant;
  onOpenInternalReview?: () => void;
}

export const SmartReviewShield: React.FC<SmartReviewShieldProps> = ({
  restaurant,
  onOpenInternalReview,
}) => {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [complaintText, setComplaintText] = useState('');
  const [copiedTags, setCopiedTags] = useState(false);

  const rawPhone = (restaurant.whatsapp_number || restaurant.phone || '919876543210').replace(/\D/g, '');
  const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;

  const googleMapsUrl = restaurant.google_maps_url || 
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${restaurant.name} ${restaurant.city_area || restaurant.city || 'Delhi'}`)}`;

  const handleSendPrivateComplaint = () => {
    const text = `⚠️ *Direct Diner Feedback for ${restaurant.name}*\n` +
      `Rating: ${selectedRating} / 5 Stars\n` +
      `Issue: ${complaintText.trim() || 'Food / service concern during my walk-in visit.'}\n\n` +
      `_Sent privately via MenuMaps Owner Shield so you can resolve this directly._`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
  };

  const handleCopyReviewTags = () => {
    const praise = `Loved the honest counter prices & authentic vibes at ${restaurant.name}! #MenuMapsVerified #GreatFood #${(restaurant.city_area || 'Delhi').replace(/\s+/g, '')}`;
    navigator.clipboard.writeText(praise);
    setCopiedTags(true);
    setTimeout(() => setCopiedTags(false), 2500);
  };

  return (
    <div className="bg-white border border-[#E7E2DA] rounded-[28px] p-6 sm:p-7 shadow-xs relative overflow-hidden my-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-[#F0EBE1]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </span>
            <h3 className="hd text-lg sm:text-xl font-black text-[#1C1917]">
              Rate Your Experience at {restaurant.name}
            </h3>
          </div>
          <p className="text-xs text-stone-500 font-medium mt-0.5">
            Your authentic feedback helps keep counter dining honest and high-quality across Delhi
          </p>
        </div>

        {/* 1-5 Star Picker */}
        <div className="flex items-center gap-1.5 bg-stone-50 p-1.5 rounded-2xl border border-stone-200/80 self-start sm:self-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setSelectedRating(star)}
              className="p-1 rounded-xl hover:bg-stone-200/60 transition-transform active:scale-90"
              title={`${star} Star${star > 1 ? 's' : ''}`}
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  selectedRating !== null && star <= selectedRating
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-stone-300 hover:text-amber-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Conditional Content based on Rating */}
      {selectedRating === null ? (
        <div className="py-2 flex items-center justify-between text-xs text-stone-500">
          <span>Tap the stars above to leave a review or share suggestions with the team.</span>
          {onOpenInternalReview && (
            <button
              type="button"
              onClick={onOpenInternalReview}
              className="font-bold text-[#0F766E] hover:underline"
            >
              Write full text review &rarr;
            </button>
          )}
        </div>
      ) : selectedRating >= 4 ? (
        /* ================= 4-5 STARS: GOOGLE REVIEW BOOSTER ================= */
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 sm:p-5 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-heading font-black text-sm sm:text-base text-emerald-950">
                You loved it! Help fellow foodies find {restaurant.name}
              </h4>
              <p className="text-xs text-emerald-800/90 mt-0.5 leading-relaxed">
                Positive Google reviews keep local Delhi food joints thriving against giant corporate chains. Post your 5-star review directly on Google Maps!
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs flex items-center gap-2"
            >
              <span>Publish on Google Reviews</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              type="button"
              onClick={handleCopyReviewTags}
              className="px-3.5 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-900 font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-50"
            >
              {copiedTags ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
              <span>{copiedTags ? 'Tags Copied to Clipboard!' : 'Copy Foodie Praise Tags'}</span>
            </button>

            {onOpenInternalReview && (
              <button
                type="button"
                onClick={onOpenInternalReview}
                className="text-xs font-bold text-stone-600 hover:text-stone-900 hover:underline ml-auto"
              >
                Also leave a MenuMaps review
              </button>
            )}
          </div>
        </div>
      ) : (
        /* ================= 1-3 STARS: WHATSAPP COMPLAINT SHIELD ================= */
        <div className="bg-amber-50/80 border border-amber-300 rounded-2xl p-4 sm:p-5 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-heading font-black text-sm sm:text-base text-amber-950">
                We're deeply sorry your experience wasn't 100% right!
              </h4>
              <p className="text-xs text-amber-900/90 mt-0.5 leading-relaxed">
                Before leaving a public review, talk directly with the owner or floor manager. They are committed to fixing food quality, billing, or service issues immediately.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <textarea
              rows={2}
              value={complaintText}
              onChange={(e) => setComplaintText(e.target.value)}
              placeholder="What went wrong? (e.g. food was cold, delay in service, bill issue)..."
              className="w-full p-3 rounded-xl bg-white border border-amber-300 text-xs text-[#1C1917] outline-none focus:border-amber-500"
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleSendPrivateComplaint}
                className="btn px-4 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0D9488] text-white font-extrabold text-xs shadow-xs flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                <span>Message Owner / Manager on WhatsApp Directly</span>
              </button>

              {onOpenInternalReview && (
                <button
                  type="button"
                  onClick={onOpenInternalReview}
                  className="text-xs font-semibold text-stone-500 hover:text-stone-800 hover:underline"
                >
                  Proceed with public review anyway
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
