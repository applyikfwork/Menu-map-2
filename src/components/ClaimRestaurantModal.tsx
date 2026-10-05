import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  KeyRound, 
  ArrowRight, 
  RefreshCw,
  Clock,
  Sparkles
} from 'lucide-react';
import { Restaurant, RestaurantClaim } from '../types/database';
import { api } from '../lib/supabase';
import { useToast } from './Toast';

interface ClaimRestaurantModalProps {
  restaurant: Restaurant;
  isOpen: boolean;
  onClose: () => void;
  navigate: (path: string) => void;
}

export const ClaimRestaurantModal: React.FC<ClaimRestaurantModalProps> = ({
  restaurant,
  isOpen,
  onClose,
  navigate,
}) => {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [existingClaim, setExistingClaim] = useState<RestaurantClaim | null>(null);

  // Claim Request Form
  const [ownerName, setOwnerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(restaurant.phone || restaurant.whatsapp_number || '');
  const [proofType, setProofType] = useState<RestaurantClaim['proof_type']>('fssai');
  const [proofReference, setProofReference] = useState('');
  const [message, setMessage] = useState('');

  // OTP & Password Form (for approved claims)
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [demoCodeHint, setDemoCodeHint] = useState<string | null>(null);

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

  if (!isOpen) return null;

  // Submit initial claim request
  const handleRequestClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName.trim() || !phoneNumber.trim()) {
      showToast('Please enter your name and phone number.', 'error');
      return;
    }

    setLoading(true);
    try {
      const claim = await api.submitRestaurantClaim({
        restaurant_id: restaurant.id,
        restaurant_name: restaurant.name,
        owner_name: ownerName,
        phone_number: phoneNumber,
        proof_type: proofType,
        proof_reference: proofReference,
        message: message,
      });

      setExistingClaim(claim);
      showToast('Ownership request submitted! Awaiting Admin approval.', 'success');
    } catch (e: any) {
      showToast(e?.message || 'Failed to submit ownership claim.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Send Twilio OTP (strictly max 2 times, requires admin approval)
  const handleSendOtp = async () => {
    if (!existingClaim) return;
    setOtpSending(true);
    setDemoCodeHint(null);
    try {
      const res = await api.sendClaimOtp(existingClaim.id);
      if (res.success) {
        showToast(`OTP sent to ${existingClaim.phone_number}! (${res.attemptsLeft} attempt(s) remaining)`, 'success');
        if (res.demoCode) {
          setDemoCodeHint(res.demoCode);
        }
        await loadClaimStatus();
      } else {
        showToast(res.error || 'Failed to send OTP.', 'error');
      }
    } catch (e: any) {
      showToast(e?.message || 'Could not send verification OTP.', 'error');
    } finally {
      setOtpSending(false);
    }
  };

  // Verify OTP and Set Permanent Password
  const handleVerifyOtpAndPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingClaim) return;
    if (!otpCode.trim() || otpCode.trim().length < 6) {
      showToast('Please enter the 6-digit OTP code.', 'error');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      showToast('Password must be at least 6 characters long.', 'error');
      return;
    }

    setVerifying(true);
    try {
      const res = await api.verifyClaimOtp(existingClaim.id, otpCode, newPassword);
      if (res.success && res.owner) {
        showToast(`🎉 Ownership verified! Welcome, ${res.owner.owner_name}.`, 'success');
        onClose();
        navigate('/owner/dashboard');
      } else {
        showToast(res.error || 'Verification failed. Please check the OTP.', 'error');
      }
    } catch (e: any) {
      showToast(e?.message || 'Error verifying OTP.', 'error');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#EFEAE2] overflow-hidden my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-800 bg-[#1C1917] text-white">
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
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Active Claim Flow Dispatcher */}
          {existingClaim ? (
            <div className="space-y-5">
              {/* STATUS 1: PENDING ADMIN APPROVAL */}
              {existingClaim.status === 'pending_admin_approval' && (
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-3">
                  <div className="flex items-center gap-2 text-amber-900 font-heading font-black text-sm">
                    <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                    <span>Step 1 of 2: Awaiting Administrator Approval</span>
                  </div>
                  <p className="text-xs text-amber-900/90 leading-relaxed font-sans">
                    Your claim request for <strong>{restaurant.name}</strong> was submitted by <strong>{existingClaim.owner_name}</strong> ({existingClaim.phone_number}).
                  </p>
                  <div className="bg-white/90 p-3.5 rounded-xl border border-amber-200 text-xs text-stone-700 space-y-1">
                    <p className="font-bold text-[#1C1917]">What happens next?</p>
                    <p className="text-stone-600 text-[11px] leading-relaxed">
                      Our administrator reviews your registered business details. Once approved, the <strong>Phone OTP</strong> verification will unlock here, allowing you to set your password and access the Owner Portal.
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={loadClaimStatus}
                      className="px-4 py-2 rounded-full bg-amber-200/60 hover:bg-amber-200 text-amber-900 font-bold text-xs flex items-center gap-1.5 transition-colors"
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

              {/* STATUS 2: APPROVED BY ADMIN -> OTP & PASSWORD SETUP */}
              {existingClaim.status === 'approved' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-emerald-900">
                        ✓ Claim Approved by Administrator!
                      </h4>
                      <p className="text-[11px] text-emerald-800 leading-relaxed font-sans">
                        Verify your registered phone number via SMS OTP and set your permanent password to take full ownership.
                      </p>
                    </div>
                  </div>

                  {/* OTP Verification Card */}
                  <div className="p-5 rounded-2xl bg-white border border-[#EFEAE2] space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-stone-600">Registered Phone</span>
                        <p className="font-heading font-black text-sm text-[#1C1917]">
                          {existingClaim.phone_number}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-bold text-stone-400">OTP Attempts</span>
                        <p className={`text-xs font-black ${existingClaim.otp_attempts_count >= 2 ? 'text-red-600' : 'text-stone-700'}`}>
                          {existingClaim.otp_attempts_count} of 2 used
                        </p>
                      </div>
                    </div>

                    {existingClaim.otp_attempts_count < 2 ? (
                      <button
                        onClick={handleSendOtp}
                        disabled={otpSending}
                        className="w-full py-3 rounded-full bg-[#FF5A36] hover:bg-[#D8350F] text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-xs"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{otpSending ? 'Sending OTP...' : 'Send Verification OTP'}</span>
                      </button>
                    ) : (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-semibold text-center">
                        ⚠️ Maximum 2 OTP attempts exceeded. Please contact the administrator.
                      </div>
                    )}

                    {demoCodeHint && (
                      <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 font-mono text-center">
                        Verification Code: <strong>{demoCodeHint}</strong>
                      </div>
                    )}

                    {/* Form to submit OTP & New Password */}
                    <form onSubmit={handleVerifyOtpAndPassword} className="space-y-3 pt-2 border-t border-[#EFEAE2]">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          Enter 6-Digit OTP *
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="e.g. 542198"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          required
                          className="w-full px-4 py-2.5 rounded-2xl border border-[#EFEAE2] font-mono text-center tracking-widest text-base font-black focus:outline-hidden focus:border-[#0F766E] bg-[#FAF8F5]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          Set Owner Portal Password * (min 6 characters)
                        </label>
                        <input
                          type="password"
                          placeholder="Create secure password for login"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          minLength={6}
                          className="w-full px-4 py-2.5 rounded-2xl border border-[#EFEAE2] text-xs font-medium focus:outline-hidden focus:border-[#0F766E] bg-[#FAF8F5]"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={verifying || !otpCode || newPassword.length < 6}
                        className="w-full py-3.5 rounded-full bg-[#1C1917] hover:bg-black text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-md"
                      >
                        <KeyRound className="w-4 h-4 text-amber-300" />
                        <span>{verifying ? 'Verifying & Activating...' : 'Verify OTP & Activate Ownership'}</span>
                      </button>
                    </form>
                  </div>
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
                      This venue is officially claimed. You can log in using your registered phone number and password anytime.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                    <button
                      onClick={() => {
                        onClose();
                        navigate('/owner/dashboard');
                      }}
                      className="px-6 py-3 rounded-full bg-[#1C1917] hover:bg-black text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md"
                    >
                      <span>Open Owner Portal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        onClose();
                        navigate('/owner/login');
                      }}
                      className="px-6 py-3 rounded-full bg-white border border-[#EFEAE2] text-stone-700 font-bold text-xs hover:bg-[#FAF8F5]"
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
                    The administrator could not verify ownership credentials for this request. Reason: {existingClaim.admin_notes || 'Business details did not match.'}
                  </p>
                  <button
                    onClick={() => setExistingClaim(null)}
                    className="py-2.5 px-5 rounded-full bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors"
                  >
                    Submit New Verification Claim
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* STEP 1: INITIAL CLAIM FORM */
            <form onSubmit={handleRequestClaim} className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-950 leading-relaxed flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  Are you the business owner or general manager of <strong>{restaurant.name}</strong>? Claim your cafe with 0% commissions to manage menus, table standees, and direct WhatsApp customer orders.
                </div>
              </div>

              {/* Claimant Name */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vikram Malhotra (Owner / Manager)"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#EFEAE2] text-xs font-medium focus:outline-hidden focus:border-[#FF5A36] bg-white text-[#1C1917]"
                />
              </div>

              {/* Phone number */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center justify-between">
                  <span>Official Registered Mobile Number *</span>
                  <span className="text-[11px] text-stone-400 font-normal">Will receive OTP</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#EFEAE2] text-xs font-medium focus:outline-hidden focus:border-[#FF5A36] bg-white text-[#1C1917]"
                />
              </div>

              {/* Proof Type & Ref */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Proof Document Type *
                  </label>
                  <select
                    value={proofType}
                    onChange={(e) => setProofType(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#EFEAE2] text-xs font-medium focus:outline-hidden focus:border-[#FF5A36] bg-white text-[#1C1917] cursor-pointer"
                  >
                    <option value="fssai">FSSAI License</option>
                    <option value="gst">GST Registration</option>
                    <option value="business_card">Business Visiting Card</option>
                    <option value="electricity_bill">Commercial Electricity Bill</option>
                    <option value="menu_card">Official Physical Menu Card</option>
                    <option value="manager_id">Manager / Staff ID</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Certificate / License Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. FSSAI No. 133200..."
                    value={proofReference}
                    onChange={(e) => setProofReference(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#EFEAE2] text-xs font-medium focus:outline-hidden focus:border-[#FF5A36] bg-white text-[#1C1917]"
                  />
                </div>
              </div>

              {/* Message to Admin */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Message / Remarks to Admin (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Mention any additional details to verify your ownership quickly..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#EFEAE2] text-xs font-medium focus:outline-hidden focus:border-[#FF5A36] bg-white text-[#1C1917]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-full bg-[#1C1917] hover:bg-black text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4 text-[#FF5A36]" />
                  <span>{loading ? 'Submitting...' : 'Submit Ownership Claim for Admin Approval'}</span>
                </button>
                <p className="text-[11px] text-center text-stone-400 mt-2 font-sans">
                  Admin approval required before OTP verification is permitted (Max 2 OTP attempts)
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
              className="text-[#D8350F] hover:underline font-bold"
            >
              Owner Login →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
