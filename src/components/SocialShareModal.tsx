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
  const instagramBioText = `🍽️ ${restaurant.name}\n📍 ${restaurant.address_line1}, ${restaurant.city}\n⭐ ${restaurant.rating_avg.toFixed(1)} Rating • Live Visual Menu & Photos\n👇 View Full Menu & Direct Order:\n${restaurantUrl}`;

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
    const text = `Check out ${restaurant.name}'s official digital menu on Menu Map! Explore dishes, verified photos & order directly: ${restaurantUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(restaurantUrl)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-100 bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-pink-500/10 text-pink-600 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-slate-900 text-lg">
                Promote & Social Kit
              </h3>
              <p className="text-xs text-slate-500">
                Share {restaurant.name} across social channels
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-stone-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* 1. Instagram Bio Copy Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-50 via-purple-50 to-amber-50 border border-pink-200/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black text-pink-900">
                <Instagram className="w-4 h-4 text-pink-600" />
                <span>Instagram Bio Link & Text</span>
              </div>
              <span className="text-[10px] font-bold text-pink-700 bg-pink-100 px-2 py-0.5 rounded-full">
                For Owners
              </span>
            </div>
            <pre className="text-[11px] font-sans text-slate-700 bg-white/80 p-3 rounded-xl border border-pink-200/50 whitespace-pre-line leading-relaxed">
              {instagramBioText}
            </pre>
            <button
              onClick={handleCopyBio}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-95"
            >
              {copiedBio ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedBio ? 'Copied Bio Text!' : 'Copy Formatted Instagram Bio'}</span>
            </button>
          </div>

          {/* 2. Direct Share Buttons */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              One-Tap Direct Share
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleShareWhatsApp}
                className="py-3 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                <span>WhatsApp Share</span>
              </button>
              <button
                onClick={handleShareFacebook}
                className="py-3 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Facebook className="w-4 h-4 text-blue-600 fill-blue-600" />
                <span>Facebook Post</span>
              </button>
            </div>
          </div>

          {/* 3. Direct URL Copy */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Website Page Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={restaurantUrl}
                className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-slate-600 truncate"
              />
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all active:scale-95"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
