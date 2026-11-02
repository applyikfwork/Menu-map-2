/**
 * Menu Maps Discovery - Discovery Creation & Editing Studio
 * Comprehensive creator workspace for students:
 * - Multi-field discovery metadata & location
 * - Image gallery manager (upload, preview, captions, reorder, delete)
 * - Rich-text formatted story editor
 * - Price type & evidence transparency
 * - Live preview modal
 * - Safe revision workflow for published items
 */

import React, { useState, useEffect } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Eye,
  Save,
  Send,
  Plus,
  HelpCircle,
  MapPin,
  Tag,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  X,
  Sparkles,
  Bold,
  Italic,
  List,
  Heading,
} from 'lucide-react';
import {
  DiscoveryItem,
  DiscoveryCategory,
  PriceVerificationType,
  DiscoveryGalleryImage,
} from '../types/discovery';
import { discoveryApi } from '../lib/discoveryApi';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useToast } from '../../components/Toast';

interface DiscoveryEditorProps {
  initialDiscovery?: DiscoveryItem | null;
  onSaved: (discovery: DiscoveryItem) => void;
  onCancel: () => void;
}

const CATEGORIES: DiscoveryCategory[] = [
  'Hidden Gems',
  'Dishes Worth Trying',
  'Budget-Friendly',
  'Local Food Experiences',
  'Vegetarian',
  'Street Eats',
  'Heritage',
];

const PRICE_TYPES: PriceVerificationType[] = [
  'Counter price observed',
  'Restaurant-confirmed',
  'Submitted but unverified',
  'Estimated',
];

export const DiscoveryEditor: React.FC<DiscoveryEditorProps> = ({
  initialDiscovery,
  onSaved,
  onCancel,
}) => {
  const { student } = useStudentAuth();
  const { showToast } = useToast();

  const isEditingExisting = !!initialDiscovery;
  const isAlreadyPublished = initialDiscovery?.status === 'Published';

  // Form State
  const [title, setTitle] = useState(initialDiscovery?.title || '');
  const [shortDesc, setShortDesc] = useState(initialDiscovery?.short_description || '');
  const [fullDesc, setFullDesc] = useState(initialDiscovery?.full_description || '');
  const [category, setCategory] = useState<DiscoveryCategory>(
    initialDiscovery?.category || 'Hidden Gems'
  );
  const [city, setCity] = useState(initialDiscovery?.city || 'Delhi');
  const [locality, setLocality] = useState(initialDiscovery?.locality || '');
  const [marketName, setMarketName] = useState(initialDiscovery?.market_name || '');
  const [restaurantName, setRestaurantName] = useState(initialDiscovery?.restaurant_name || '');
  const [address, setAddress] = useState(initialDiscovery?.address || '');
  const [mapLink, setMapLink] = useState(initialDiscovery?.map_link || '');

  // Images State
  const [mainImage, setMainImage] = useState(
    initialDiscovery?.main_image ||
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80'
  );
  const [gallery, setGallery] = useState<DiscoveryGalleryImage[]>(
    initialDiscovery?.gallery || []
  );

  // Food & Price Information
  const [dishName, setDishName] = useState(initialDiscovery?.dish_name || '');
  const [price, setPrice] = useState<string>(
    initialDiscovery?.price !== undefined ? String(initialDiscovery.price) : ''
  );
  const [priceType, setPriceType] = useState<PriceVerificationType>(
    initialDiscovery?.price_type || 'Counter price observed'
  );
  const [priceEvidence, setPriceEvidence] = useState(initialDiscovery?.price_evidence || '');
  const [openingHours, setOpeningHours] = useState(initialDiscovery?.opening_hours || '');
  const [whyInteresting, setWhyInteresting] = useState(initialDiscovery?.why_interesting || '');
  const [tagsInput, setTagsInput] = useState(initialDiscovery?.tags?.join(', ') || '');

  // Highlights & Tips
  const [highlightInput, setHighlightInput] = useState('');
  const [highlights, setHighlights] = useState<string[]>(initialDiscovery?.food_highlights || []);
  const [tipInput, setTipInput] = useState('');
  const [visitorTips, setVisitorTips] = useState<string[]>(initialDiscovery?.visitor_tips || []);

  // UI State
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Auto-save draft timer
  useEffect(() => {
    if (!title.trim() || isAlreadyPublished) return;
    const timer = setTimeout(() => {
      handleAutoSave();
    }, 15000);
    return () => clearTimeout(timer);
  }, [title, shortDesc, fullDesc, locality]);

  const handleAutoSave = async () => {
    if (!student) return;
    const itemToSave = assembleDiscovery('Draft');
    await discoveryApi.saveDiscoveryDraft(itemToSave);
  };

  const assembleDiscovery = (status: DiscoveryItem['status']): DiscoveryItem => {
    const slug =
      initialDiscovery?.slug ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') ||
      `discovery-${Date.now()}`;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    return {
      id: initialDiscovery?.id || `disc_${Date.now()}`,
      title: title.trim(),
      slug,
      short_description: shortDesc.trim(),
      full_description: fullDesc.trim(),
      category,
      city: city.trim() || 'Delhi',
      locality: locality.trim() || 'Delhi NCR',
      market_name: marketName.trim() || undefined,
      restaurant_name: restaurantName.trim() || undefined,
      address: address.trim() || undefined,
      map_link: mapLink.trim() || undefined,
      main_image: mainImage,
      gallery,
      dish_name: dishName.trim() || undefined,
      price: price ? Number(price) : undefined,
      price_type: priceType,
      price_evidence: priceEvidence.trim() || undefined,
      food_highlights: highlights,
      visitor_tips: visitorTips,
      opening_hours: openingHours.trim() || undefined,
      why_interesting: whyInteresting.trim() || undefined,
      contributor_id: initialDiscovery?.contributor_id || student?.id || 'guest',
      contributor_name: initialDiscovery?.contributor_name || student?.name || 'Student Explorer',
      contributor_college: initialDiscovery?.contributor_college || student?.college_university,
      status,
      created_at: initialDiscovery?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags,
    };
  };

  // Image Upload Handler (reads as data URL / compressed image)
  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size should be under 5MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setMainImage(event.target.result as string);
        showToast('Cover image updated', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setGallery((prev) => [
            ...prev,
            { url: event.target!.result as string, caption: file.name.split('.')[0] },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
    showToast('Gallery images added', 'success');
  };

  const removeGalleryImage = (index: number) => {
    setGallery((prev) => prev.filter((_, i) => i !== index));
  };

  const updateGalleryCaption = (index: number, caption: string) => {
    setGallery((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], caption };
      return next;
    });
  };

  // Highlights & Tips Handlers
  const addHighlight = () => {
    if (!highlightInput.trim()) return;
    setHighlights((prev) => [...prev, highlightInput.trim()]);
    setHighlightInput('');
  };

  const removeHighlight = (idx: number) => {
    setHighlights((prev) => prev.filter((_, i) => i !== idx));
  };

  const addTip = () => {
    if (!tipInput.trim()) return;
    setVisitorTips((prev) => [...prev, tipInput.trim()]);
    setTipInput('');
  };

  const removeTip = (idx: number) => {
    setVisitorTips((prev) => prev.filter((_, i) => i !== idx));
  };

  // Rich Text helper buttons
  const insertText = (prefix: string, suffix = '') => {
    setFullDesc((prev) => `${prev}\n${prefix}Your Text${suffix}\n`);
  };

  // Submission actions
  const handleSaveDraft = async () => {
    if (!title.trim()) {
      showToast('Please provide a title before saving draft', 'error');
      return;
    }
    setSaving(true);
    try {
      const draft = assembleDiscovery('Draft');
      const saved = await discoveryApi.saveDiscoveryDraft(draft);
      showToast('Draft saved successfully', 'success');
      onSaved(saved);
    } catch (e) {
      showToast('Failed to save draft', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!title.trim() || !shortDesc.trim() || !locality.trim()) {
      showToast('Please fill title, short intro, and locality', 'error');
      return;
    }

    setSaving(true);
    try {
      if (isAlreadyPublished && initialDiscovery) {
        // Safe revision workflow: live version remains untouched!
        const proposed = assembleDiscovery('Published');
        await discoveryApi.submitRevision({
          id: `rev_${Date.now()}`,
          discovery_id: initialDiscovery.id,
          editor_id: student?.id || 'unknown',
          editor_name: student?.name || 'Student Contributor',
          proposed_content: proposed,
          submitted_at: new Date().toISOString(),
          review_status: 'Pending Approval',
        });
        showToast('Changes submitted for admin review! Live version stays visible until approved.', 'success');
        onSaved(initialDiscovery);
      } else {
        const item = assembleDiscovery('Pending Approval');
        const submitted = await discoveryApi.submitDiscoveryForApproval(item);
        showToast('Discovery submitted for approval! It will appear after admin review.', 'success');
        onSaved(submitted);
      }
    } catch (e) {
      showToast('Submission error', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E7E2DA] p-6 sm:p-8 shadow-xs max-w-4xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E7E2DA]">
        <div>
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
          <h2 className="text-2xl font-black text-stone-900">
            {isEditingExisting ? 'Edit Food Discovery' : 'Create a New Food Discovery'}
          </h2>
          <p className="text-xs text-stone-500">
            Document interesting food places, dishes, and real counter rates. Every approved discovery is credited to your portfolio.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="px-4 py-2 rounded-full border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-stone-500" />
            <span>Live Preview</span>
          </button>
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={saving}
            className="px-4 py-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>
          <button
            type="button"
            onClick={handleSubmitForReview}
            disabled={saving}
            className="px-5 py-2 rounded-full bg-[#1FB5A0] hover:bg-[#199d8b] text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isAlreadyPublished ? 'Submit Revisions' : 'Submit for Approval'}</span>
          </button>
        </div>
      </div>

      {isAlreadyPublished && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <strong>Published Discovery Editing:</strong> This discovery is currently live. When you submit edits, they will be saved as a pending revision for admin review. The existing live page will remain untouched until your changes are approved.
          </div>
        </div>
      )}

      {/* 1. Basic Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center gap-2">
          <span>1. Basic Discovery Details</span>
        </h3>

        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">
            Discovery Title <span className="text-[#FF6B4A]">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Chache Di Hatti's Legendary Rawalpindi Chole Bhature"
            className="w-full px-4 py-2.5 rounded-xl border border-[#E7E2DA] text-sm font-bold focus:ring-2 focus:ring-[#1FB5A0] outline-hidden"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Discovery Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as DiscoveryCategory)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] text-xs font-medium focus:ring-2 focus:ring-[#1FB5A0] outline-hidden"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Tags (Comma-separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. Chole Bhature, Under ₹100, Breakfast"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] text-xs font-medium focus:ring-2 focus:ring-[#1FB5A0] outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">
            Short Introduction <span className="text-[#FF6B4A]">*</span>
          </label>
          <textarea
            value={shortDesc}
            onChange={(e) => setShortDesc(e.target.value)}
            rows={2}
            placeholder="1-2 sentences summarizing what makes this food spot special and why visitors should care..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] text-xs focus:ring-2 focus:ring-[#1FB5A0] outline-hidden resize-none"
          />
        </div>

        {/* Rich-Text Full Story Editor */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-stone-700">
              Full Discovery Story / Description <span className="text-[#FF6B4A]">*</span>
            </label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => insertText('### ')}
                className="p-1 rounded text-stone-500 hover:text-stone-900 hover:bg-stone-100 text-xs flex items-center gap-0.5"
                title="Add Heading"
              >
                <Heading className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertText('**', '**')}
                className="p-1 rounded text-stone-500 hover:text-stone-900 hover:bg-stone-100 text-xs flex items-center gap-0.5"
                title="Bold Text"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertText('*', '*')}
                className="p-1 rounded text-stone-500 hover:text-stone-900 hover:bg-stone-100 text-xs flex items-center gap-0.5"
                title="Italic Text"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertText('- ')}
                className="p-1 rounded text-stone-500 hover:text-stone-900 hover:bg-stone-100 text-xs flex items-center gap-0.5"
                title="Bullet List"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <textarea
            value={fullDesc}
            onChange={(e) => setFullDesc(e.target.value)}
            rows={6}
            placeholder="Write the full story: history of the stall, cooking methods, flavors, textures, atmosphere, and student rituals..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] text-xs focus:ring-2 focus:ring-[#1FB5A0] outline-hidden leading-relaxed"
          />
        </div>
      </div>

      {/* 2. Location Information */}
      <div className="space-y-4 pt-4 border-t border-[#E7E2DA]">
        <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center gap-2">
          <span>2. Location & Venue Details</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Delhi"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] text-xs font-medium focus:ring-2 focus:ring-[#1FB5A0] outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Locality / Neighbourhood <span className="text-[#FF6B4A]">*</span>
            </label>
            <input
              type="text"
              required
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              placeholder="e.g. Kamla Nagar, CR Park, CP"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] text-xs font-medium focus:ring-2 focus:ring-[#1FB5A0] outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Market Name (Optional)</label>
            <input
              type="text"
              value={marketName}
              onChange={(e) => setMarketName(e.target.value)}
              placeholder="e.g. Bungalow Road, Janpath Flea"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] text-xs font-medium focus:ring-2 focus:ring-[#1FB5A0] outline-hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Outlet / Stall Name</label>
            <input
              type="text"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              placeholder="e.g. Chache Di Hatti"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] text-xs font-medium focus:ring-2 focus:ring-[#1FB5A0] outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Google Maps Link (Optional)</label>
            <input
              type="url"
              value={mapLink}
              onChange={(e) => setMapLink(e.target.value)}
              placeholder="https://maps.google.com/?q=..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] text-xs font-medium focus:ring-2 focus:ring-[#1FB5A0] outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">Full Address / Landmark Directions</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. D-32, Gali 4, Near Clock Tower, Kamla Nagar, Delhi 110007"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] text-xs font-medium focus:ring-2 focus:ring-[#1FB5A0] outline-hidden"
          />
        </div>
      </div>

      {/* 3. Images Management */}
      <div className="space-y-4 pt-4 border-t border-[#E7E2DA]">
        <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center gap-2">
          <span>3. Cover & Gallery Images</span>
        </h3>

        {/* Cover Photo */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-2">Main Cover Photo</label>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:w-48 h-32 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
              <img src={mainImage} alt="Cover Preview" className="w-full h-full object-cover" />
            </div>
            <div className="space-y-2 flex-1 w-full">
              <input
                type="text"
                value={mainImage}
                onChange={(e) => setMainImage(e.target.value)}
                placeholder="Paste Image URL or upload below"
                className="w-full px-3.5 py-2 rounded-xl border border-[#E7E2DA] text-xs focus:ring-2 focus:ring-[#1FB5A0] outline-hidden"
              />
              <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload From Device (Max 5MB)</span>
                <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {/* Additional Gallery Photos */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-stone-700">
              Additional Story Images (Gallery)
            </label>
            <label className="inline-flex items-center gap-1 text-xs font-bold text-[#1FB5A0] cursor-pointer hover:underline">
              <Plus className="w-3.5 h-3.5" />
              <span>Add Images</span>
              <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {gallery.map((img, idx) => (
              <div key={idx} className="p-3 rounded-2xl border border-[#E7E2DA] bg-[#FAFAF7] space-y-2 relative">
                <div className="h-28 rounded-xl overflow-hidden bg-stone-200">
                  <img src={img.url} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                </div>
                <input
                  type="text"
                  value={img.caption || ''}
                  onChange={(e) => updateGalleryCaption(idx, e.target.value)}
                  placeholder="Image caption..."
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#E7E2DA] bg-white text-[11px] outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(idx)}
                  className="absolute top-4 right-4 p-1.5 rounded-full bg-white/90 text-rose-600 hover:bg-rose-50 shadow-xs cursor-pointer"
                  title="Remove image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Food & Price Information */}
      <div className="space-y-4 pt-4 border-t border-[#E7E2DA]">
        <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center gap-2">
          <span>4. Food Dish & Counter Price Information</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Dish Name</label>
            <input
              type="text"
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
              placeholder="e.g. Stuffed Aloo Chole Bhature"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] text-xs font-medium focus:ring-2 focus:ring-[#1FB5A0] outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Dish Price (₹)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 80"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] text-xs font-medium focus:ring-2 focus:ring-[#1FB5A0] outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Price Verification Type</label>
            <select
              value={priceType}
              onChange={(e) => setPriceType(e.target.value as PriceVerificationType)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] text-xs font-medium focus:ring-2 focus:ring-[#1FB5A0] outline-hidden"
            >
              {PRICE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">
            Price Evidence / Explanation (How was this price verified?)
          </label>
          <input
            type="text"
            value={priceEvidence}
            onChange={(e) => setPriceEvidence(e.target.value)}
            placeholder="e.g. Photographed physical counter board, printed receipt, or menu card at outlet"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] text-xs font-medium focus:ring-2 focus:ring-[#1FB5A0] outline-hidden"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Opening Hours / Schedule</label>
            <input
              type="text"
              value={openingHours}
              onChange={(e) => setOpeningHours(e.target.value)}
              placeholder="e.g. 9:30 AM – 2:00 PM (Closed Tuesdays)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] text-xs font-medium focus:ring-2 focus:ring-[#1FB5A0] outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">What Makes It Special?</label>
            <input
              type="text"
              value={whyInteresting}
              onChange={(e) => setWhyInteresting(e.target.value)}
              placeholder="e.g. Generational cooking method, no artificial color, student-friendly"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] text-xs font-medium focus:ring-2 focus:ring-[#1FB5A0] outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* 5. Food Highlights & Tips */}
      <div className="space-y-4 pt-4 border-t border-[#E7E2DA]">
        <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center gap-2">
          <span>5. Food Highlights & Visitor Tips</span>
        </h3>

        {/* Highlights */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">Food Highlights (Bulleted)</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={highlightInput}
              onChange={(e) => setHighlightInput(e.target.value)}
              placeholder="e.g. Slow-simmered dark pindi chana with whole spices"
              className="flex-1 px-3 py-2 rounded-xl border border-[#E7E2DA] text-xs outline-hidden"
            />
            <button
              type="button"
              onClick={addHighlight}
              className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {highlights.map((h, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-[#1FB5A0] text-xs font-medium flex items-center gap-1.5"
              >
                <span>{h}</span>
                <button type="button" onClick={() => removeHighlight(i)} className="text-stone-400 hover:text-stone-700">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Visitor Tips */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">Useful Visitor Tips</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tipInput}
              onChange={(e) => setTipInput(e.target.value)}
              placeholder="e.g. Arrive before 1 PM to avoid waiting"
              className="flex-1 px-3 py-2 rounded-xl border border-[#E7E2DA] text-xs outline-hidden"
            />
            <button
              type="button"
              onClick={addTip}
              className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {visitorTips.map((tip, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-center gap-1.5"
              >
                <span>{tip}</span>
                <button type="button" onClick={() => removeTip(i)} className="text-stone-400 hover:text-stone-700">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="pt-6 border-t border-[#E7E2DA] flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-full border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-bold cursor-pointer"
        >
          Cancel
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={saving}
            className="px-5 py-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>
          <button
            type="button"
            onClick={handleSubmitForReview}
            disabled={saving}
            className="px-6 py-2.5 rounded-full bg-[#1FB5A0] hover:bg-[#199d8b] text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isAlreadyPublished ? 'Submit Revisions' : 'Submit for Approval'}</span>
          </button>
        </div>
      </div>

      {/* Live Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative space-y-6">
            <button
              onClick={() => setPreviewOpen(false)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <span className="px-2.5 py-1 rounded-full bg-teal-50 text-[#1FB5A0] text-[10px] font-black uppercase">
                {category} • Live Preview
              </span>
              <h2 className="text-2xl font-black text-stone-900">{title || 'Untitled Discovery'}</h2>
              <div className="text-xs text-stone-500 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#1FB5A0]" />
                <span>{locality || 'Locality'}</span>
                {restaurantName && <span>• {restaurantName}</span>}
              </div>
            </div>

            <div className="h-60 rounded-2xl overflow-hidden bg-stone-100">
              <img src={mainImage} alt={title} className="w-full h-full object-cover" />
            </div>

            <p className="text-sm text-stone-700 leading-relaxed">{shortDesc}</p>
            <div className="text-xs text-stone-600 whitespace-pre-line leading-relaxed">{fullDesc}</div>

            {dishName && (
              <div className="p-4 rounded-2xl bg-[#FAFAF7] border border-[#E7E2DA] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-stone-900">{dishName}</div>
                  <div className="text-[10px] text-stone-500">{priceType}</div>
                </div>
                {price && <div className="text-base font-black text-[#FF6B4A]">₹{price}</div>}
              </div>
            )}

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="px-6 py-2 rounded-full bg-stone-900 text-white text-xs font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
