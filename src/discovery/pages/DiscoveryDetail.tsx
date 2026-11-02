/**
 * Menu Maps Discovery - Individual Discovery Detail Page (/discovery/:slug)
 *
 * One reusable dynamic template:
 * - Editorial magazine storytelling
 * - Verified counter pricing & price transparency
 * - Gallery with captions
 * - Food highlights, visitor tips & map directions
 * - Save & Share actions
 * - Report Incorrect Information
 * - Nearby & related discoveries
 */

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Clock,
  ShieldCheck,
  Tag,
  Share2,
  Bookmark,
  BookmarkCheck,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  ArrowRight,
  User,
  Sparkles,
  Utensils,
  Copy,
  Check,
} from 'lucide-react';
import { DiscoveryItem, PriceVerificationType } from '../types/discovery';
import { discoveryApi } from '../lib/discoveryApi';
import { DiscoveryCard } from '../components/DiscoveryCard';
import { ReportIssueModal } from '../components/ReportIssueModal';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useToast } from '../../components/Toast';

interface DiscoveryDetailProps {
  slug: string;
  navigate: (path: string) => void;
}

const getPriceBadge = (priceType?: PriceVerificationType) => {
  switch (priceType) {
    case 'Counter price observed':
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        icon: ShieldCheck,
        label: 'Verified Physical Counter Price',
        description: 'Personally observed and cross-checked at physical storefront cash counter.',
      };
    case 'Restaurant-confirmed':
      return {
        bg: 'bg-teal-50 text-teal-800 border-teal-200',
        icon: ShieldCheck,
        label: 'Restaurant Confirmed Rate',
        description: 'Confirmed directly from physical printed menu or store cashier.',
      };
    case 'Submitted but unverified':
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        icon: Clock,
        label: 'Community Submitted (Unverified)',
        description: 'Reported by campus contributor; under field verification.',
      };
    case 'Estimated':
    default:
      return {
        bg: 'bg-stone-50 text-stone-700 border-stone-200',
        icon: AlertCircle,
        label: 'Estimated Price Point',
        description: 'Approximate price range.',
      };
  }
};

export const DiscoveryDetail: React.FC<DiscoveryDetailProps> = ({ slug, navigate }) => {
  const { student, savedDiscoveryIds, toggleSave } = useStudentAuth();
  const { showToast } = useToast();

  const [discovery, setDiscovery] = useState<DiscoveryItem | null>(null);
  const [nearby, setNearby] = useState<DiscoveryItem[]>([]);
  const [related, setRelated] = useState<DiscoveryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Gallery Image Modal / Zoom
  const [selectedGalleryImg, setSelectedGalleryImg] = useState<{ url: string; caption?: string } | null>(null);

  // Report Modal
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // Copied Link Indicator
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadDiscovery();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  const loadDiscovery = async () => {
    setLoading(true);
    try {
      const item = await discoveryApi.getDiscoveryBySlug(slug);
      setDiscovery(item);
      if (item) {
        const [nearbyItems, relatedItems] = await Promise.all([
          discoveryApi.getNearbyDiscoveries(item.locality, item.id),
          discoveryApi.getRelatedDiscoveries(item.category, item.id),
        ]);
        setNearby(nearbyItems);
        setRelated(relatedItems);
      }
    } catch (e) {
      console.error('Failed to load discovery detail', e);
    } finally {
      setLoading(false);
    }
  };

  const isSaved = discovery ? savedDiscoveryIds.includes(discovery.id) : false;

  const handleToggleSave = () => {
    if (!discovery) return;
    if (!student) {
      showToast('Please log in to save discoveries to your profile', 'info');
      return;
    }
    const saved = toggleSave(discovery.id);
    showToast(saved ? 'Discovery saved!' : 'Discovery removed from saved', 'success');
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: discovery?.title || 'Menu Maps Discovery',
          text: discovery?.short_description,
          url,
        });
      } catch (e) {}
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      showToast('Discovery link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3 bg-[#FAFAF7]">
        <div className="w-8 h-8 rounded-full border-2 border-[#1FB5A0] border-t-transparent animate-spin" />
        <p className="text-xs text-stone-500 font-medium">Opening discovery story...</p>
      </div>
    );
  }

  if (!discovery) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 bg-[#FAFAF7] p-6 text-center">
        <AlertCircle className="w-12 h-12 text-[#FF6B4A]" />
        <h2 className="text-2xl font-black text-stone-900">Discovery Not Found</h2>
        <p className="text-sm text-stone-600 max-w-md">
          This food discovery may have moved or is pending review.
        </p>
        <button
          onClick={() => navigate('/discovery')}
          className="px-6 py-2.5 rounded-full bg-[#1FB5A0] text-white text-xs font-bold shadow-md cursor-pointer"
        >
          Back to Discovery Feed
        </button>
      </div>
    );
  }

  const priceBadge = getPriceBadge(discovery.price_type);
  const BadgeIcon = priceBadge.icon;

  return (
    <article className="min-h-screen bg-[#FAFAF7] text-[#1C1917] pb-16">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="bg-white border-b border-[#E7E2DA] sticky top-16 sm:top-20 z-30">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 h-12 flex items-center justify-between">
          <button
            onClick={() => navigate('/discovery')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>All Discoveries</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleSave}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isSaved
                  ? 'bg-emerald-50 text-[#1FB5A0] border border-emerald-200'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200'
              }`}
              title="Save discovery"
            >
              {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-full bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Share discovery"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hero Visual Container */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 pt-6 sm:pt-8">
        <div className="relative rounded-3xl overflow-hidden min-h-[300px] sm:min-h-[440px] bg-stone-900 shadow-lg">
          <img
            src={discovery.main_image}
            alt={discovery.title}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20" />

          {/* Top Overlays */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex flex-wrap gap-2">
            <span className="px-3.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-stone-900 text-xs font-black uppercase tracking-wider shadow-sm">
              {discovery.category}
            </span>
            {discovery.is_discovery_of_week && (
              <span className="px-3.5 py-1 rounded-full bg-[#1FB5A0] text-white text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Discovery of the Week</span>
              </span>
            )}
          </div>

          {/* Bottom Hero Narrative */}
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-8 sm:left-8 sm:right-8 text-white space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-300 drop-shadow-sm">
              <MapPin className="w-3.5 h-3.5" />
              <span>{discovery.locality}, {discovery.city}</span>
              {discovery.restaurant_name && <span>• {discovery.restaurant_name}</span>}
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight drop-shadow-md max-w-3xl">
              {discovery.title}
            </h1>

            <p className="text-xs sm:text-base text-stone-200 max-w-2xl leading-relaxed drop-shadow-sm line-clamp-2">
              {discovery.short_description}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Layout (Story + Sidebar Info) */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Story Column */}
          <div className="lg:col-span-8 space-y-8">
            {/* Contributor Byline & Credibility */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E7E2DA] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1FB5A0]/10 text-[#1FB5A0] flex items-center justify-center font-bold text-sm shrink-0">
                  {discovery.contributor_name.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-black text-stone-900">
                    Discovered by {discovery.contributor_name}
                  </div>
                  <div className="text-[11px] text-stone-500">
                    {discovery.contributor_college || 'Student Contributor'} • Verified by Menu Maps Team
                  </div>
                </div>
              </div>

              {discovery.published_at && (
                <div className="text-right text-[11px] text-stone-400 shrink-0">
                  Published on {new Date(discovery.published_at).toLocaleDateString()}
                </div>
              )}
            </div>

            {/* Complete Story Narrative */}
            <div className="bg-white rounded-3xl border border-[#E7E2DA] p-6 sm:p-8 space-y-4">
              <h2 className="text-lg font-black text-stone-900 uppercase tracking-wider text-[#1FB5A0]">
                The Discovery Story
              </h2>
              <div className="prose prose-stone max-w-none text-sm sm:text-base text-stone-700 leading-relaxed whitespace-pre-line">
                {discovery.full_description}
              </div>
            </div>

            {/* Gallery Images with Captions */}
            {discovery.gallery && discovery.gallery.length > 0 && (
              <div className="bg-white rounded-3xl border border-[#E7E2DA] p-6 sm:p-8 space-y-4">
                <h3 className="text-base font-black text-stone-900">Photo Evidence & Visuals</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {discovery.gallery.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedGalleryImg(img)}
                      className="rounded-2xl overflow-hidden border border-[#E7E2DA] group cursor-pointer bg-stone-50"
                    >
                      <div className="h-48 overflow-hidden">
                        <img
                          src={img.url}
                          alt={img.caption || `Gallery ${idx}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      {img.caption && (
                        <div className="p-2.5 text-xs text-stone-600 bg-white border-t border-stone-100 font-medium">
                          {img.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Food Highlights & Visitor Tips */}
            {(discovery.food_highlights?.length || discovery.visitor_tips?.length) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {discovery.food_highlights && discovery.food_highlights.length > 0 && (
                  <div className="p-6 rounded-3xl bg-white border border-[#E7E2DA] space-y-3">
                    <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider text-[#1FB5A0] flex items-center gap-1.5">
                      <Utensils className="w-4 h-4" />
                      <span>Food Highlights</span>
                    </h3>
                    <ul className="space-y-2 text-xs text-stone-700">
                      {discovery.food_highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1FB5A0] mt-1.5 shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {discovery.visitor_tips && discovery.visitor_tips.length > 0 && (
                  <div className="p-6 rounded-3xl bg-white border border-[#E7E2DA] space-y-3">
                    <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>Visitor Tips</span>
                    </h3>
                    <ul className="space-y-2 text-xs text-stone-700">
                      {discovery.visitor_tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar: Menu, Price Transparency & Location Info */}
          <div className="lg:col-span-4 space-y-6">
            {/* Signature Dish & Price Transparency Box */}
            {discovery.dish_name && (
              <div className="p-6 rounded-3xl bg-white border border-[#E7E2DA] shadow-xs space-y-4">
                <div className="text-[11px] font-black uppercase tracking-wider text-stone-400">
                  Signature Dish & Pricing
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-stone-900">{discovery.dish_name}</h3>
                    {discovery.restaurant_name && (
                      <div className="text-xs text-stone-500 mt-0.5">{discovery.restaurant_name}</div>
                    )}
                  </div>
                  {discovery.price !== undefined && (
                    <div className="text-right">
                      <span className="text-2xl font-black text-[#FF6B4A]">₹{discovery.price}</span>
                    </div>
                  )}
                </div>

                {/* Price Verification Transparency Box */}
                <div className={`p-3.5 rounded-2xl border ${priceBadge.bg} space-y-1`}>
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <BadgeIcon className="w-3.5 h-3.5" />
                    <span>{priceBadge.label}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    {discovery.price_evidence || priceBadge.description}
                  </p>
                </div>
              </div>
            )}

            {/* Location & Opening Hours */}
            <div className="p-6 rounded-3xl bg-white border border-[#E7E2DA] shadow-xs space-y-4">
              <div className="text-[11px] font-black uppercase tracking-wider text-stone-400">
                Location & Hours
              </div>

              <div className="space-y-3 text-xs">
                {discovery.address && (
                  <div>
                    <span className="font-bold text-stone-700 block mb-0.5">Address</span>
                    <p className="text-stone-600 leading-relaxed">{discovery.address}</p>
                  </div>
                )}

                {discovery.opening_hours && (
                  <div>
                    <span className="font-bold text-stone-700 block mb-0.5">Operating Hours</span>
                    <p className="text-stone-600">{discovery.opening_hours}</p>
                  </div>
                )}

                {discovery.market_name && (
                  <div>
                    <span className="font-bold text-stone-700 block mb-0.5">Market</span>
                    <p className="text-stone-600">{discovery.market_name}</p>
                  </div>
                )}
              </div>

              {discovery.map_link && (
                <div className="pt-2">
                  <a
                    href={discovery.map_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>Open in Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Report Incorrect Information Action */}
            <div className="p-4 rounded-2xl bg-[#FAFAF7] border border-[#E7E2DA] text-center space-y-2">
              <p className="text-xs text-stone-500">
                Notice changed prices, wrong hours, or relocated shop?
              </p>
              <button
                type="button"
                onClick={() => setReportModalOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#FF6B4A] hover:underline cursor-pointer"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Report Incorrect Information</span>
              </button>
            </div>
          </div>
        </div>

        {/* Nearby Discoveries Section (Same Locality) */}
        {nearby.length > 0 && (
          <section className="pt-12 mt-12 border-t border-[#E7E2DA] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-stone-900">
                  More Discoveries in {discovery.locality}
                </h3>
                <p className="text-xs text-stone-500">
                  Explore other verified spots nearby in the same neighbourhood.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {nearby.map((item) => (
                <DiscoveryCard key={item.id} discovery={item} navigate={navigate} />
              ))}
            </div>
          </section>
        )}

        {/* Related Discoveries Section */}
        {related.length > 0 && (
          <section className="pt-12 mt-12 border-t border-[#E7E2DA] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-stone-900">
                  Related {discovery.category}
                </h3>
                <p className="text-xs text-stone-500">
                  Similar food discoveries across Delhi NCR.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((item) => (
                <DiscoveryCard key={item.id} discovery={item} navigate={navigate} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Gallery Image Zoom Modal */}
      {selectedGalleryImg && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedGalleryImg(null)}
        >
          <div className="max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl">
            <img src={selectedGalleryImg.url} alt="Zoomed view" className="w-full max-h-[70vh] object-contain bg-black" />
            {selectedGalleryImg.caption && (
              <div className="p-4 text-xs font-bold text-stone-700 bg-white text-center">
                {selectedGalleryImg.caption}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportModalOpen && (
        <ReportIssueModal
          discoveryId={discovery.id}
          discoveryTitle={discovery.title}
          onClose={() => setReportModalOpen(false)}
        />
      )}
    </article>
  );
};

export default DiscoveryDetail;
