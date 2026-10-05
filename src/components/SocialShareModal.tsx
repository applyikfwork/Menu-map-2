import React, { useState } from 'react';
import { X, Share2, Copy, Check, Instagram, MessageSquare, Facebook, ExternalLink, Sparkles } from 'lucide-react';
import { Restaurant } from '../types/database';
import { useToast } from './Toast';

interface SocialShareModalProps {
  restaurant: Restaurant;
  isOpen: boolean;
  onClose: () => void;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  restaurant,
  isOpen,
  onClose,
}) => {
  const { showToast } = useToast();
  const [copiedBio, setCopiedBio] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const restaurantUrl = `${window.location.origin}/${restaurant.slug}`;

  // Formatted Instagram Bio Snippet
  const instagramBioText = `🍽️ ${restaurant.name}\n📍 ${restaurant.address_line1}, ${restaurant.city}\n⭐ ${restaurant.rating_avg.toFixed(1)} Rating • Official Counter Menu & Photos\n👇 View Full Menu & Direct Order at 0% Markup:\n${restaurantUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(restaurantUrl);
    setCopiedLink(true);
    showToast('Copied menu link to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyBio = () => {
    navigator.clipboard.writeText(instagramBioText);
    setCopiedBio(true);
    showToast('Copied Instagram Bio snippet!', 'success');
    setTimeout(() => setCopiedBio(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = `Check out ${restaurant.name}'s official counter menu on Menu Map! Explore dishes, verified photos & order directly at 0% app markup: ${restaurantUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(restaurantUrl)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#EFEAE2] overflow-hidden my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-800 bg-[#1C1917] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF5A36] text-white flex items-center justify-center shadow-md">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-white text-lg">
                Promote & Social Kit
              </h3>
              <p className="text-xs text-stone-300">
                Share {restaurant.name} across social networks
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

        <div className="p-6 space-y-5">
          {/* 1. Instagram Bio Copy Card */}
          <div className="p-4 rounded-2xl bg-white border border-[#EFEAE2] space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#1C1917]">
                <Instagram className="w-4 h-4 text-pink-600" />
                <span>Instagram Bio Link & Text</span>
              </div>
              <span className="text-[10px] font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200/50">
                For Cafe Bio
              </span>
            </div>
            <pre className="text-[11px] font-sans text-stone-700 bg-[#FAF8F5] p-3.5 rounded-xl border border-[#EFEAE2] whitespace-pre-line leading-relaxed">
              {instagramBioText}
            </pre>
            <button
              onClick={handleCopyBio}
              className="w-full py-3 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all"
            >
              {copiedBio ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedBio ? 'Copied Bio Text!' : 'Copy Formatted Instagram Bio'}</span>
            </button>
          </div>

          {/* 2. Direct Share Buttons */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-700">
              One-Tap Direct Share
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleShareWhatsApp}
                className="py-3 px-3 rounded-full bg-[#0F766E] hover:bg-[#0D9488] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xs"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                <span>WhatsApp</span>
              </button>
              <button
                onClick={handleShareFacebook}
                className="py-3 px-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xs"
              >
                <Facebook className="w-4 h-4 fill-white" />
                <span>Facebook</span>
              </button>
            </div>
          </div>

          {/* 3. Direct URL Copy */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-bold text-stone-700">
              Direct Counter Menu Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={restaurantUrl}
                className="flex-1 px-4 py-2.5 bg-white border border-[#EFEAE2] rounded-full text-xs font-mono text-stone-600 truncate"
              />
              <button
                onClick={handleCopyLink}
                className="px-5 py-2.5 rounded-full bg-[#1C1917] hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all active:scale-95 shadow-2xs"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
