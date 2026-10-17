import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Mail, 
  Phone, 
  ArrowRight, 
  RefreshCw,
  Clock,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Trash2,
  ExternalLink,
  FileCheck,
  Building2
} from 'lucide-react';
import { Restaurant, RestaurantClaim } from '../types/database';
import { api } from '../lib/supabase';
import { compressImageFile } from '../lib/imageCompressor';
import { useToast } from './Toast';

interface ClaimRestaurantModalProps {
  restaurant: Restaurant;
  isOpen: boolean;
  onClose: () => void;
  navigate: (path: string) => void;
}

interface EvidenceImageItem {
  dataUrl: string;
  name: string;
  sizeKb: number;
}

export const ClaimRestaurantModal: React.FC<ClaimRestaurantModalProps> = ({
  restaurant,
  isOpen,
  onClose,
  navigate,
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [existingClaim, setExistingClaim] = useState<RestaurantClaim | null>(null);

  // Claim Request Form State
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(restaurant.phone || restaurant.whatsapp_number || '');
  const [designation, setDesignation] = useState('Owner');
  const [proofType, setProofType] = useState<RestaurantClaim['proof_type']>('fssai');
  const [proofReference, setProofReference] = useState('');
  const [message, setMessage] = useState('');
  const [evidenceImages, setEvidenceImages] = useState<EvidenceImageItem[]>([]);
  const [compressing, setCompressing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadClaimStatus();
    }
  }, [isOpen, restaurant.id]);

  const loadClaimStatus = async () => {
    setLoading(true);
    try {
      const claims = await api.getRestaurantClaims(restaurant.id);
      if (claims && claims.length > 0) {
        setExistingClaim(claims[0]);
      } else {
        setExistingClaim(null);
      }
    } catch (e) {
      console.warn('Error loading claim status:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (evidenceImages.length + files.length > 3) {
      showToast('You can upload a maximum of 3 evidence images.', 'error');
      return;
    }

    setCompressing(true);
    try {
      const newItems: EvidenceImageItem[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) {
          showToast(`File ${file.name} is not an image.`, 'error');
          continue;
        }

        const compressed = await compressImageFile(file, 1600, 950 * 1024);
        newItems.push({
          dataUrl: compressed.dataUrl,
          name: file.name,
          sizeKb: compressed.compressedSizeKb,
        });
      }

      setEvidenceImages((prev) => [...prev, ...newItems].slice(0, 3));
      showToast(`Added ${newItems.length} evidence photo(s)!`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to process images.', 'error');
    } finally {
      setCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setEvidenceImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRequestClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName.trim()) {
      showToast('Please enter your full name.', 'error');
      return;
    }
    if (!ownerEmail.trim() || !ownerEmail.includes('@')) {
      showToast('Please enter a valid official business email address.', 'error');
      return;
    }
    if (!phoneNumber.trim()) {
      showToast('Please enter a contact phone number.', 'error');
      return;
    }
    if (evidenceImages.length === 0) {
      showToast('Please upload at least 1 evidence image (FSSAI, GST, bill, or counter photo).', 'error');
      return;
    }

    setLoading(true);
    try {
      const claim = await api.submitRestaurantClaim({
        restaurant_id: restaurant.id,
        restaurant_name: restaurant.name,
        owner_name: ownerName,
        owner_email: ownerEmail,
        phone_number: phoneNumber,
        designation: designation,
        proof_type: proofType,
        proof_reference: proofReference,
        evidence_images: evidenceImages.map((img) => img.dataUrl),
        message: message,
      });

      setExistingClaim(claim);
      showToast('Ownership claim submitted with evidence! Awaiting Admin verification.', 'success');
    } catch (e: any) {
      showToast(e?.message || 'Failed to submit ownership claim.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#EFEAE2] overflow-hidden my-6 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-800 bg-[#1C1917] text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0F766E] text-white flex items-center justify-center shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-lg text-white">
                Claim Restaurant Ownership
              </h3>
              <p className="text-xs text-stone-300">
                Official owner verification for {restaurant.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {existingClaim ? (
            <div className="space-y-5">
              {/* STATUS 1: PENDING ADMIN APPROVAL */}
              {existingClaim.status === 'pending_admin_approval' && (
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-3">
                  <div className="flex items-center gap-2 text-amber-900 font-heading font-black text-sm">
                    <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                    <span>Step 1 of 2: Claim Under Verification by Administrator</span>
                  </div>
                  <p className="text-xs text-amber-900/90 leading-relaxed font-sans">
                    Your claim request for <strong>{restaurant.name}</strong> was submitted by <strong>{existingClaim.owner_name}</strong> ({existingClaim.owner_email}).
                  </p>
                  
                  {existingClaim.evidence_images && existingClaim.evidence_images.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-amber-800 font-medium">
                      <FileCheck className="w-4 h-4 text-amber-600" />
                      <span>{existingClaim.evidence_images.length} verification document(s) uploaded and awaiting review.</span>
                    </div>
                  )}

                  <div className="bg-white/90 p-3.5 rounded-xl border border-amber-200 text-xs text-stone-700 space-y-1">
                    <p className="font-bold text-[#1C1917]">What happens next?</p>
                    <p className="text-stone-600 text-[11px] leading-relaxed">
                      Our administrator verifies your submitted proof documents. Once approved, an <strong>exclusive ownership activation link</strong> will be automatically sent to <strong>{existingClaim.owner_email}</strong>, allowing you to set your password and access the cafe dashboard immediately.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={loadClaimStatus}
                      className="px-4 py-2 rounded-full bg-amber-200/60 hover:bg-amber-200 text-amber-900 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Check Approval Status</span>
                    </button>
                    <span className="text-[11px] text-stone-400 font-medium">
                      Submitted on {new Date(existingClaim.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}

              {/* STATUS 2: APPROVED BY ADMIN -> DIRECT LINK ACTIVATION */}
              {existingClaim.status === 'approved' && (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-heading font-black text-base text-emerald-950">
                        ✓ Claim Approved by Administrator!
                      </h4>
                      <p className="text-xs text-emerald-800/90 mt-1 leading-relaxed">
                        Your ownership credentials for <strong>{restaurant.name}</strong> have been verified! An activation link has been sent to <strong>{existingClaim.owner_email}</strong>.
                      </p>
                    </div>
                  </div>

                  {existingClaim.activation_token && (
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          onClose();
                          navigate(`/claim-verify?token=${existingClaim.activation_token}`);
                        }}
                        className="w-full py-3.5 px-4 rounded-full bg-[#0F766E] hover:bg-[#0D9488] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-200" />
                        <span>Activate Ownership & Set Password Now &rarr;</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* STATUS 3: OWNERSHIP ACTIVE */}
              {existingClaim.status === 'ownership_active' && (
                <div className="p-6 rounded-2xl bg-white border border-[#EFEAE2] text-center space-y-4 shadow-2xs">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-heading font-black text-lg text-[#1C1917]">
                      Ownership is Verified & Active!
                    </h4>
                    <p className="text-xs text-stone-600 mt-1 max-w-sm mx-auto font-sans">
                      This venue is officially claimed. You can log in using your registered email ({existingClaim.owner_email}) or phone number anytime.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                    <button
                      onClick={() => {
                        onClose();
                        navigate('/owner/dashboard');
                      }}
                      className="px-6 py-3 rounded-full bg-[#1C1917] hover:bg-black text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
                    >
                      <span>Open Owner Portal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        onClose();
                        navigate('/owner/login');
                      }}
                      className="px-6 py-3 rounded-full bg-white border border-[#EFEAE2] text-stone-700 font-bold text-xs hover:bg-[#FAF8F5] cursor-pointer"
                    >
                      Owner Login Screen
                    </button>
                  </div>
                </div>
              )}

              {/* STATUS 4: REJECTED */}
              {existingClaim.status === 'rejected' && (
                <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
                  <div className="flex items-center gap-2 text-rose-900 font-heading font-black text-sm">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>Claim Request Rejected</span>
                  </div>
                  <p className="text-xs text-rose-900/90 leading-relaxed font-sans">
                    The administrator could not verify ownership credentials for this request. Reason: {existingClaim.admin_notes || 'Business details or documents did not match.'}
                  </p>
                  <button
                    onClick={() => setExistingClaim(null)}
                    className="py-2.5 px-5 rounded-full bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors cursor-pointer"
                  >
                    Submit New Verification Claim with Stronger Evidence
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* STEP 1: INITIAL CLAIM FORM WITH EVIDENCE UPLOAD */
            <form onSubmit={handleRequestClaim} className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-950 leading-relaxed flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  Are you the business owner or general manager of <strong>{restaurant.name}</strong>? Submit your business credentials below. Upon administrator approval, an exclusive ownership activation link will be sent to your email.
                </div>
              </div>

              {/* Full Name & Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Vikram Malhotra"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#EFEAE2] text-xs font-medium focus:outline-hidden focus:border-[#0F766E] bg-white text-[#1C1917]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Role / Designation *
                  </label>
                  <select
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#EFEAE2] text-xs font-medium focus:outline-hidden focus:border-[#0F766E] bg-white text-[#1C1917] cursor-pointer"
                  >
                    <option value="Owner">Owner / Proprietor</option>
                    <option value="Partner">Co-Founder / Partner</option>
                    <option value="General Manager">General Manager</option>
                    <option value="Director">Director / Managing Partner</option>
                  </select>
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center justify-between">
                    <span>Business Email *</span>
                    <span className="text-[10px] text-emerald-700 font-bold">Receives Login Link</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. owner@mycafe.com"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#EFEAE2] text-xs font-medium focus:outline-hidden focus:border-[#0F766E] bg-white text-[#1C1917]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Official Mobile / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#EFEAE2] text-xs font-medium focus:outline-hidden focus:border-[#0F766E] bg-white text-[#1C1917]"
                  />
                </div>
              </div>

              {/* Proof Type & License Ref */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Primary Proof Document *
                  </label>
                  <select
                    value={proofType}
                    onChange={(e) => setProofType(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#EFEAE2] text-xs font-medium focus:outline-hidden focus:border-[#0F766E] bg-white text-[#1C1917] cursor-pointer"
                  >
                    <option value="fssai">FSSAI License Certificate</option>
                    <option value="gst">GST Registration Certificate</option>
                    <option value="electricity_bill">Commercial Electricity Bill</option>
                    <option value="business_card">Photo at Register / Counter with Board</option>
                    <option value="manager_id">Official Visiting Card / ID</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Registration / Certificate No.
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. FSSAI No. 133200..."
                    value={proofReference}
                    onChange={(e) => setProofReference(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#EFEAE2] text-xs font-medium focus:outline-hidden focus:border-[#0F766E] bg-white text-[#1C1917]"
                  />
                </div>
              </div>

              {/* 1 TO 3 EVIDENCE IMAGES UPLOADER */}
              <div className="p-4 rounded-2xl bg-white border border-[#EFEAE2] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-extrabold text-[#1C1917]">
                      Upload Evidence Photos * (1 to 3 images)
                    </label>
                    <p className="text-[11px] text-stone-500">
                      Upload clear photo of your FSSAI/GST certificate, electricity bill, or selfie at the cafe counter.
                    </p>
                  </div>
                  <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                    evidenceImages.length >= 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {evidenceImages.length} / 3 Uploaded
                  </span>
                </div>

                {/* Upload Trigger Dropzone */}
                {evidenceImages.length < 3 && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      className="hidden"
                      id="claim-evidence-input"
                    />
                    <label
                      htmlFor="claim-evidence-input"
                      className="border-2 border-dashed border-stone-300 hover:border-[#0F766E] rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-stone-50/50 hover:bg-teal-50/30 gap-1.5"
                    >
                      <Upload className="w-5 h-5 text-stone-500" />
                      <span className="text-xs font-bold text-stone-700">
                        {compressing ? 'Compressing & preparing image...' : 'Click to Upload Evidence Photos from Phone/PC'}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        Auto-compressed under 950KB for fast verification
                      </span>
                    </label>
                  </div>
                )}

                {/* Evidence Thumbnails Grid */}
                {evidenceImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2.5 pt-1">
                    {evidenceImages.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-4/3 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 group shadow-2xs"
                      >
                        <img
                          src={img.dataUrl}
                          alt={`Evidence ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="p-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-md transition-all cursor-pointer"
                            title="Remove photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md bg-black/70 text-[9px] font-bold text-white">
                          Doc #{idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Message to Admin */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Additional Notes to Admin (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Mention opening hours, branch details, or counter contact if helpful..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#EFEAE2] text-xs font-medium focus:outline-hidden focus:border-[#0F766E] bg-white text-[#1C1917]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || compressing || evidenceImages.length === 0}
                  className="w-full py-3.5 px-4 rounded-full bg-[#1C1917] hover:bg-black text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md disabled:opacity-50 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-[#FF5A36]" />
                  <span>{loading ? 'Submitting Evidence...' : 'Submit Ownership Claim with Proof'}</span>
                </button>
                <p className="text-[11px] text-center text-stone-400 mt-2 font-sans">
                  Zero phone OTP required • Activation link sent directly to your email upon admin verification
                </p>
              </div>
            </form>
          )}

          {/* Quick link to login */}
          <div className="pt-3 border-t border-[#EFEAE2] flex items-center justify-between text-xs text-stone-500">
            <span>Already have an owner account?</span>
            <button
              onClick={() => {
                onClose();
                navigate('/owner/login');
              }}
              className="text-[#D8350F] hover:underline font-bold cursor-pointer"
            >
              Owner Login (Email or Mobile) →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
