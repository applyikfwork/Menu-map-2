import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Lock, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  Image as ImageIcon, 
  IndianRupee, 
  ShieldCheck, 
  Check, 
  Navigation, 
  Store,
  Clock,
  Coffee
} from 'lucide-react';
import { api, getCurrentOwnerSession, logoutRestaurantOwner } from '../lib/supabase';
import { compressImageFile, CompressionResult } from '../lib/imageCompressor';
import { useToast } from '../components/Toast';
import { DietaryOption, RestaurantOwnerAccount } from '../types/database';

interface ListCafeProps {
  navigate: (path: string) => void;
}

const DELHI_LOCALITIES = [
  'Netaji Subhash Place (NSP)',
  'Hudson Lane / GTB Nagar',
  'Satya Niketan',
  'Patel Nagar',
  'Rohini (Sector 7, 8, 9, 14)',
  'Connaught Place (CP)',
  'Lajpat Nagar (Central Market)',
  'Karol Bagh',
  'Hauz Khas Village',
  'Rajouri Garden',
  'Dwarka (Sector 6, 10, 12)',
  'Green Park / Hauz Khas',
  'Pitampura',
  'Noida (Sector 18 / 62)',
  'Gurgaon (CyberHub / Sector 29)',
  'Other Delhi NCR Area',
];

const POPULAR_CUISINES = [
  'Cafe',
  'Fast Food',
  'Italian & Pizza',
  'Momos & Dimsum',
  'Burgers & Sandwiches',
  'Bakery & Desserts',
  'Beverages & Shakes',
  'North Indian',
  'Chinese',
  'Street Food',
  'Continental',
];

export const ListCafe: React.FC<ListCafeProps> = ({ navigate }) => {
  const { showToast } = useToast();

  const [existingSession, setExistingSession] = useState<RestaurantOwnerAccount | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);

  // --------------------------------------------------------------------------
  // STEP 1: OWNER EMAIL AUTHENTICATION & MANDATORY OTP VERIFICATION
  // --------------------------------------------------------------------------
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Mandatory Email Verification State
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [inputOtp, setInputOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  useEffect(() => {
    let timer: any;
    if (otpCountdown > 0) {
      timer = setInterval(() => setOtpCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [otpCountdown]);

  // --------------------------------------------------------------------------
  // STEP 2: CORE CAFE DETAILS ONLY (NO MENU REQUIRED)
  // --------------------------------------------------------------------------
  const [cafeName, setCafeName] = useState('');
  const [locality, setLocality] = useState(DELHI_LOCALITIES[0]);
  const [customLocality, setCustomLocality] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [landmark, setLandmark] = useState('');
  const [metroStation, setMetroStation] = useState('');
  const [metroGate, setMetroGate] = useState('');
  const [cafePhone, setCafePhone] = useState('');
  const [whatsappOrderNumber, setWhatsappOrderNumber] = useState('');
  const [averageCostForTwo, setAverageCostForTwo] = useState<number>(450);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(['Cafe', 'Fast Food']);
  const [isPureVeg, setIsPureVeg] = useState(false);

  // Ground reality policies
  const [serviceChargePercent, setServiceChargePercent] = useState<number>(0);
  const [waterPolicy, setWaterPolicy] = useState<'free_ro' | 'paid_bottle' | 'both'>('free_ro');
  const [cakePolicy, setCakePolicy] = useState<'free' | 'charges_cutting_fee' | 'not_allowed'>('free');

  // Images
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [coverCompressing, setCoverCompressing] = useState(false);
  const [coverStats, setCoverStats] = useState<CompressionResult | null>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  const [logoUrl, setLogoUrl] = useState('');
  const [logoCompressing, setLogoCompressing] = useState(false);
  const [logoStats, setLogoStats] = useState<CompressionResult | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const active = getCurrentOwnerSession();
    if (active) {
      setExistingSession(active);
      setIsEmailVerified(true);
      setOwnerName(active.owner_name || '');
      setOwnerEmail(active.owner_email || '');
      setOwnerPhone(active.phone_number || '');
      setCafePhone(active.phone_number || '');
      setWhatsappOrderNumber(active.phone_number || '');
    }
  }, []);

  const handleSendOtp = async () => {
    const clean = ownerEmail.trim().toLowerCase();
    if (!clean || !clean.includes('@') || !clean.includes('.')) {
      showToast('Please enter a valid email address before requesting OTP.', 'error');
      return;
    }
    setSendingOtp(true);
    setDevOtpHint(null);
    try {
      const res = await api.sendOwnerEmailVerificationOtp(clean);
      if (res.success) {
        setOtpSent(true);
        setOtpCountdown(60);
        if (res.devOtp) {
          setDevOtpHint(res.devOtp);
        }
        showToast(`Verification code sent to ${clean}. Check your inbox or spam folder.`, 'success');
      } else {
        showToast(res.error || 'Failed to send OTP code. Try again.', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Error sending verification code.', 'error');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!inputOtp.trim()) {
      showToast('Please enter the 6-digit verification code.', 'error');
      return;
    }
    setVerifyingOtp(true);
    try {
      const res = await api.verifyOwnerEmailOtp(ownerEmail, inputOtp);
      if (res.success) {
        setIsEmailVerified(true);
        showToast('✓ Official email successfully verified!', 'success');
      } else {
        showToast(res.error || 'Invalid or expired verification code.', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Error verifying OTP code.', 'error');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (existingSession) {
      setStep(2);
      return;
    }

    if (!ownerName.trim()) {
      showToast('Please enter your full name.', 'error');
      return;
    }
    if (!ownerEmail.trim() || !ownerEmail.includes('@') || !ownerEmail.includes('.')) {
      showToast('Please enter a valid business or personal email address.', 'error');
      return;
    }
    if (!isEmailVerified) {
      showToast('Mandatory email verification: Please verify your email with the 6-digit OTP code before proceeding.', 'error');
      if (!otpSent) {
        handleSendOtp();
      }
      return;
    }
    if (!ownerPhone.trim() || ownerPhone.replace(/\D/g, '').length < 10) {
      showToast('Please enter a valid 10-digit mobile number.', 'error');
      return;
    }
    if (!password || password.length < 6) {
      showToast('Password must be at least 6 characters long.', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match. Please re-enter.', 'error');
      return;
    }

    // Prefill cafe phone / WhatsApp with owner phone if empty
    if (!cafePhone) setCafePhone(ownerPhone);
    if (!whatsappOrderNumber) setWhatsappOrderNumber(ownerPhone);

    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleCuisine = (c: string) => {
    if (selectedCuisines.includes(c)) {
      if (selectedCuisines.length === 1) return; // Keep at least 1
      setSelectedCuisines(selectedCuisines.filter((item) => item !== c));
    } else {
      setSelectedCuisines([...selectedCuisines, c]);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverCompressing(true);
    try {
      const result = await compressImageFile(file, 1800, 950 * 1024);
      setCoverImageUrl(result.dataUrl);
      setCoverStats(result);
      showToast(`Cover photo compressed from ${result.originalSizeKb} KB to ${result.compressedSizeKb} KB (< 1 MB).`, 'success');
    } catch (err) {
      showToast('Failed to compress cover image.', 'error');
    } finally {
      setCoverCompressing(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoCompressing(true);
    try {
      const result = await compressImageFile(file, 600, 500 * 1024);
      setLogoUrl(result.dataUrl);
      setLogoStats(result);
      showToast(`Logo avatar compressed to ${result.compressedSizeKb} KB (< 500 KB).`, 'success');
    } catch (err) {
      showToast('Failed to compress logo image.', 'error');
    } finally {
      setLogoCompressing(false);
    }
  };

  const handleCreateCafe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingSession && !isEmailVerified) {
      showToast('Mandatory email verification: Please verify your email in Step 1 first.', 'error');
      setStep(1);
      return;
    }
    if (!cafeName.trim()) {
      showToast('Please enter your cafe or restaurant name.', 'error');
      return;
    }
    if (!addressLine1.trim()) {
      showToast('Please enter the street address / shop number.', 'error');
      return;
    }

    const finalCity = locality === 'Other Delhi NCR Area' ? customLocality.trim() || 'Delhi NCR' : locality;

    setSubmitting(true);
    try {
      const dietary: DietaryOption[] = [];
      if (isPureVeg) dietary.push('Pure Veg');
      dietary.push('Vegan Options');

      const res = await api.createNewCafeWithOwner({
        owner: {
          name: ownerName.trim(),
          email: ownerEmail.trim().toLowerCase(),
          phone: ownerPhone.trim(),
          password: password || 'OwnerPassword123!',
        },
        cafe: {
          name: cafeName.trim(),
          city: finalCity,
          address_line1: addressLine1.trim(),
          landmark: landmark.trim(),
          metro_station: metroStation.trim(),
          metro_gate: metroGate.trim(),
          phone: cafePhone.trim() || ownerPhone.trim(),
          whatsapp_number: whatsappOrderNumber.trim() || cafePhone.trim() || ownerPhone.trim(),
          average_cost_for_two: Number(averageCostForTwo) || 450,
          cuisine_types: selectedCuisines,
          dietary_options: dietary,
          cover_image_url: coverImageUrl || undefined,
          logo_url: logoUrl || undefined,
          service_charge_percent: Number(serviceChargePercent) || 0,
          water_policy: waterPolicy,
          cake_policy: cakePolicy,
        },
      });

      if (res.success && res.restaurant) {
        showToast(`🎉 "${res.restaurant.name}" is now live on MenuMaps! Redirecting to your dashboard...`, 'success');
        setTimeout(() => {
          navigate('/owner/dashboard');
        }, 800);
      } else {
        showToast(res.error || 'Failed to list cafe. Please try again.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'An unexpected error occurred.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-12 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1C1917] text-white text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#FF5A36]" />
            <span>0% Commission Cafe Onboarding</span>
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-[#1C1917] tracking-tight">
            List Your Cafe on MenuMaps
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-xl mx-auto leading-relaxed">
            Gain direct walk-in customers from Netaji Subhash Place, Hudson Lane, Satya Niketan, and across Delhi NCR with authentic counter prices.
          </p>

          {/* Stepper Pill Indicator */}
          <div className="flex items-center justify-center gap-3 pt-3">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black transition-all ${step === 1 ? 'bg-[#FF5A36] text-white shadow-md' : 'bg-emerald-100 text-emerald-900'}`}>
              <span>1</span>
              <span>Owner Email Login</span>
              {step === 2 && <Check className="w-3.5 h-3.5" />}
            </div>
            <div className="w-6 h-0.5 bg-stone-300"></div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black transition-all ${step === 2 ? 'bg-[#FF5A36] text-white shadow-md' : 'bg-stone-200 text-stone-500'}`}>
              <span>2</span>
              <span>Core Cafe Details</span>
            </div>
          </div>
        </div>

        {/* Existing Session Alert */}
        {existingSession && step === 1 && (
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Active Owner Session Detected</span>
              </div>
              <p className="text-sm font-bold text-stone-800">
                Logged in as <span className="text-emerald-950 font-black">{existingSession.owner_name}</span> ({existingSession.owner_email || existingSession.phone_number})
              </p>
              <p className="text-xs text-stone-600">
                You can list another cafe or manage your current listing.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all cursor-pointer"
              >
                Proceed to Cafe Details &rarr;
              </button>
              <button
                type="button"
                onClick={() => {
                  logoutRestaurantOwner();
                  setExistingSession(null);
                }}
                className="px-4 py-2.5 rounded-full bg-white border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-100 cursor-pointer"
              >
                Switch Account
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 1: OWNER EMAIL AUTHENTICATION
        ======================================================== */}
        {step === 1 && !existingSession && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E7E2DA] shadow-xl space-y-6">
            <div className="border-b border-stone-200 pb-4">
              <h2 className="font-heading font-black text-xl text-[#1C1917]">
                Step 1: Your Owner Credentials
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Use your official email and set a secure password to manage your cafe listing and counter menu anytime.
              </p>
            </div>

            <form onSubmit={handleStep1Submit} className="space-y-5">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1.5">
                  Owner / Manager Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-stone-300 focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/20 text-sm font-semibold outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-black uppercase tracking-wider text-stone-700">
                      Official Email Address <span className="text-rose-500">*</span>
                    </label>
                    {isEmailVerified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Verified
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        OTP Verification Required
                      </span>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-4" />
                    <input
                      type="email"
                      required
                      disabled={isEmailVerified}
                      placeholder="owner@cafe.com"
                      value={ownerEmail}
                      onChange={(e) => {
                        setOwnerEmail(e.target.value);
                        setIsEmailVerified(false);
                        setOtpSent(false);
                        setInputOtp('');
                      }}
                      className={`w-full pl-11 pr-26 py-3 rounded-2xl border text-sm font-semibold outline-hidden ${
                        isEmailVerified
                          ? 'bg-emerald-50/50 border-emerald-300 text-emerald-950 font-bold'
                          : 'border-stone-300 focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/20'
                      }`}
                    />
                    {!isEmailVerified && (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={sendingOtp || !ownerEmail.includes('@') || otpCountdown > 0}
                        className="absolute right-2 px-3 py-1.5 rounded-xl bg-[#1C1917] hover:bg-black text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                      >
                        {sendingOtp ? 'Sending…' : otpCountdown > 0 ? `${otpCountdown}s` : otpSent ? 'Resend' : 'Send OTP'}
                      </button>
                    )}
                  </div>

                  {/* Interactive OTP Verification Box */}
                  {otpSent && !isEmailVerified && (
                    <div className="mt-3 p-3.5 bg-orange-50 border border-orange-200 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-800">
                          Enter 6-Digit OTP:
                        </span>
                        {devOtpHint && (
                          <span className="text-[11px] font-mono font-bold text-orange-700 bg-white px-2 py-0.5 rounded border border-orange-200">
                            Code: {devOtpHint}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="123456"
                          value={inputOtp}
                          onChange={(e) => setInputOtp(e.target.value.replace(/\D/g, ''))}
                          className="flex-1 px-3 py-2 bg-white border border-stone-300 rounded-xl text-center font-mono font-black text-base tracking-widest focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/20 outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={verifyingOtp || inputOtp.length < 4}
                          className="px-4 py-2 rounded-xl bg-[#FF5A36] hover:bg-[#e04826] text-white text-xs font-black transition-all disabled:opacity-50 cursor-pointer"
                        >
                          {verifyingOtp ? 'Verifying…' : 'Verify'}
                        </button>
                      </div>
                      <p className="text-[11px] text-stone-500">
                        Check your email inbox or spam folder. {otpCountdown > 0 && `Resend available in ${otpCountdown}s.`}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1.5">
                    Contact Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-4 top-3.5" />
                    <input
                      type="tel"
                      required
                      placeholder="9876543210"
                      value={ownerPhone}
                      onChange={(e) => setOwnerPhone(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-2xl border border-stone-300 focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/20 text-sm font-semibold outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1.5">
                    Create Password (Min 6 chars) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-4 top-3.5" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-2xl border border-stone-300 focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/20 text-sm font-semibold outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1.5">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-4 top-3.5" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-2xl border border-stone-300 focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/20 text-sm font-semibold outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => navigate('/owner/login')}
                  className="text-xs font-bold text-stone-600 hover:text-[#FF5A36] underline cursor-pointer"
                >
                  Already have an account? Log in here
                </button>

                <button
                  type="submit"
                  className={`px-7 py-3.5 rounded-full font-black text-sm flex items-center gap-2 shadow-lg transition-all ${
                    isEmailVerified
                      ? 'bg-[#1C1917] hover:bg-black text-white hover:scale-102 active:scale-95 cursor-pointer'
                      : 'bg-[#1C1917] text-white hover:bg-black cursor-pointer'
                  }`}
                >
                  <span>{isEmailVerified ? 'Continue to Cafe Details' : 'Verify Email & Continue'}</span>
                  <ArrowRight className="w-4 h-4 text-[#FF5A36]" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================
            STEP 2: CORE CAFE DETAILS ONLY (NO MENU REQUIRED)
        ======================================================== */}
        {step === 2 && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E7E2DA] shadow-xl space-y-8">
            <div className="border-b border-stone-200 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-heading font-black text-xl text-[#1C1917]">
                  Step 2: Core Cafe & Storefront Details
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  Enter only your essential cafe information. Dishes and menu categories can be added anytime in your Owner Dashboard.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Edit Credentials</span>
              </button>
            </div>

            <form onSubmit={handleCreateCafe} className="space-y-6">
              {/* Cafe Name & Locality */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1.5">
                    Cafe / Restaurant Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. The Woodbox Cafe"
                    value={cafeName}
                    onChange={(e) => setCafeName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-stone-300 focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/20 text-sm font-semibold outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1.5">
                    Delhi NCR Food Hub / Locality <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-stone-300 focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/20 text-sm font-semibold outline-hidden bg-white"
                  >
                    {DELHI_LOCALITIES.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {locality === 'Other Delhi NCR Area' && (
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1.5">
                    Specify Your Area / Locality Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Greater Kailash 1, M-Block Market"
                    value={customLocality}
                    onChange={(e) => setCustomLocality(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-stone-300 focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/20 text-sm font-semibold outline-hidden"
                  />
                </div>
              )}

              {/* Full Address & Landmark */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1.5">
                    Full Street Address / Shop Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shop 24, Ground Floor, Aggarwal Cyber Plaza 1"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-stone-300 focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/20 text-sm font-semibold outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1.5">
                    Landmark
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Opposite Metro Exit Gate 2"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-stone-300 focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/20 text-sm font-semibold outline-hidden"
                  />
                </div>
              </div>

              {/* Nearest Metro Station & Gate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1.5">
                    Nearest Delhi Metro Station
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Netaji Subhash Place (Red/Pink Line)"
                    value={metroStation}
                    onChange={(e) => setMetroStation(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-stone-300 focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/20 text-sm font-semibold outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1.5">
                    Exit Gate Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Exit Gate 2"
                    value={metroGate}
                    onChange={(e) => setMetroGate(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-stone-300 focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/20 text-sm font-semibold outline-hidden"
                  />
                </div>
              </div>

              {/* Contact Numbers & Average Cost */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1.5">
                    Direct Phone / Landline
                  </label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={cafePhone}
                    onChange={(e) => setCafePhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-stone-300 focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/20 text-sm font-semibold outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1.5">
                    WhatsApp Direct Orders No.
                  </label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={whatsappOrderNumber}
                    onChange={(e) => setWhatsappOrderNumber(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-stone-300 focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/20 text-sm font-semibold outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1.5">
                    Average Cost for Two (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-stone-400 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      min={100}
                      max={10000}
                      value={averageCostForTwo}
                      onChange={(e) => setAverageCostForTwo(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-3 rounded-2xl border border-stone-300 focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/20 text-sm font-semibold outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Popular Cuisines & Pure Veg toggle */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black uppercase tracking-wider text-stone-700">
                    Cuisines Offered (Select all that apply)
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPureVeg}
                      onChange={(e) => setIsPureVeg(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
                    />
                    <span className="text-xs font-bold text-emerald-700">Pure Veg Outlet</span>
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_CUISINES.map((cuisine) => {
                    const isSelected = selectedCuisines.includes(cuisine);
                    return (
                      <button
                        type="button"
                        key={cuisine}
                        onClick={() => handleToggleCuisine(cuisine)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1C1917] text-white border-[#1C1917] shadow-xs'
                            : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        {cuisine}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ground-Reality Delhi In-Store Policies */}
              <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <h3 className="font-heading font-black text-sm text-amber-950">
                    Dine-In Ground Policies (The Honest Bill Box)
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-stone-700 mb-1">
                      Service Charge Policy
                    </label>
                    <select
                      value={serviceChargePercent}
                      onChange={(e) => setServiceChargePercent(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-stone-300 text-xs font-bold bg-white outline-hidden"
                    >
                      <option value={0}>0% (Only 5% Govt GST)</option>
                      <option value={5}>5% Service Charge</option>
                      <option value={10}>10% Service Charge</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-stone-700 mb-1">
                      Water Serving Policy
                    </label>
                    <select
                      value={waterPolicy}
                      onChange={(e) => setWaterPolicy(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-stone-300 text-xs font-bold bg-white outline-hidden"
                    >
                      <option value="free_ro">Free Regular/RO Water Served</option>
                      <option value="paid_bottle">Paid Mineral Bottle Only</option>
                      <option value="both">Both Available</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-stone-700 mb-1">
                      Outside Birthday Cake
                    </label>
                    <select
                      value={cakePolicy}
                      onChange={(e) => setCakePolicy(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-stone-300 text-xs font-bold bg-white outline-hidden"
                    >
                      <option value="free">Allowed Free (0 Fee)</option>
                      <option value="charges_cutting_fee">Cutting Fee Charged (₹200)</option>
                      <option value="not_allowed">Not Allowed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Storefront Cover Photo & Circular Logo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Cover Banner */}
                <div className="border border-dashed border-stone-300 rounded-2xl p-4 bg-stone-50 text-center space-y-2">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider text-stone-700">
                    <ImageIcon className="w-3.5 h-3.5 text-[#FF5A36]" />
                    <span>Storefront / Cover Banner</span>
                  </div>
                  {coverImageUrl ? (
                    <div className="relative h-28 rounded-xl overflow-hidden border border-stone-200">
                      <img src={coverImageUrl} alt="Cover preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => coverFileInputRef.current?.click()}
                        className="absolute bottom-1 right-1 px-2.5 py-1 rounded-md bg-black/75 text-white text-[10px] font-bold"
                      >
                        Change Photo
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-stone-500">
                      Upload your storefront or cozy dining seating photo. Auto-compressed under 950 KB.
                    </p>
                  )}
                  <input
                    type="file"
                    ref={coverFileInputRef}
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={coverCompressing}
                    onClick={() => coverFileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-white border border-stone-300 text-xs font-bold text-stone-800 hover:bg-stone-100 shadow-2xs cursor-pointer"
                  >
                    {coverCompressing ? 'Compressing...' : coverImageUrl ? 'Replace Cover' : 'Upload Cover Photo'}
                  </button>
                </div>

                {/* Circular Brand Logo */}
                <div className="border border-dashed border-stone-300 rounded-2xl p-4 bg-stone-50 text-center space-y-2">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider text-stone-700">
                    <Building2 className="w-3.5 h-3.5 text-[#0F766E]" />
                    <span>Brand Logo Avatar</span>
                  </div>
                  {logoUrl ? (
                    <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-[#0F766E] shadow-sm">
                      <img src={logoUrl} alt="Logo preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <p className="text-xs text-stone-500">
                      Square or circular cafe brand logo. Auto-compressed under 500 KB.
                    </p>
                  )}
                  <input
                    type="file"
                    ref={logoFileInputRef}
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={logoCompressing}
                    onClick={() => logoFileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-white border border-stone-300 text-xs font-bold text-stone-800 hover:bg-stone-100 shadow-2xs cursor-pointer"
                  >
                    {logoCompressing ? 'Compressing...' : logoUrl ? 'Replace Logo' : 'Upload Cafe Logo'}
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-stone-500">
                  ✓ Your cafe listing is instantly verified and claim-protected.
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#FF5A36] hover:bg-[#D8350F] text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl hover:scale-102 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <span>Activating Cafe & Dashboard...</span>
                  ) : (
                    <>
                      <span>Create Cafe & Open Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
