import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  KeyRound, 
  Lock, 
  ArrowRight, 
  AlertCircle, 
  Building2, 
  Mail, 
  Phone, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  Sparkles
} from 'lucide-react';
import { api } from '../lib/supabase';
import { RestaurantClaim, Restaurant } from '../types/database';
import { useToast } from '../components/Toast';

interface ClaimVerifyProps {
  navigate: (path: string) => void;
  searchParams?: URLSearchParams;
}

export const ClaimVerify: React.FC<ClaimVerifyProps> = ({ navigate, searchParams }) => {
  const { showToast } = useToast();

  const [token, setToken] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [claim, setClaim] = useState<RestaurantClaim | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  // Form State
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const rawToken = searchParams?.get('token') || new URLSearchParams(window.location.search).get('token') || '';
    setToken(rawToken);

    if (!rawToken) {
      setLoading(false);
      setValid(false);
      setErrorMsg('No activation token was provided in the link. Please check the URL received in your email.');
      return;
    }

    validateToken(rawToken);
  }, [searchParams]);

  const validateToken = async (tok: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.validateClaimToken(tok);
      if (res.valid && res.claim) {
        setValid(true);
        setClaim(res.claim);
        if (res.restaurant) {
          setRestaurant(res.restaurant);
        }
      } else {
        setValid(false);
        setErrorMsg(res.error || 'This activation link is invalid, expired, or has already been used.');
      }
    } catch (e: any) {
      setValid(false);
      setErrorMsg(e?.message || 'Error validating ownership activation token.');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!password || password.length < 6) {
      showToast('Password must be at least 6 characters long.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match. Please re-enter.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.activateOwnershipWithToken(token, password);
      if (res.success && res.owner) {
        showToast(`🎉 Ownership verified! Welcome, ${res.owner.owner_name}.`, 'success');
        navigate('/owner/dashboard');
      } else {
        showToast(res.error || 'Activation failed. The link may have expired.', 'error');
      }
    } catch (e: any) {
      showToast(e?.message || 'Failed to activate ownership.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4 bg-gradient-to-b from-stone-100 via-stone-50 to-stone-100">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-stone-200 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-[#0F766E] flex items-center justify-center mx-auto animate-pulse">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-black text-lg text-stone-900">
            Verifying Ownership Credentials...
          </h3>
          <p className="text-xs text-stone-500">
            Checking your exclusive cafe activation token with the central verification registry.
          </p>
        </div>
      </div>
    );
  }

  if (!valid || !claim) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4 bg-gradient-to-b from-stone-100 via-stone-50 to-stone-100">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-stone-200 text-center space-y-5 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-heading font-black text-xl text-stone-900">
              Activation Link Issue
            </h3>
            <p className="text-xs text-stone-600 mt-1.5 leading-relaxed font-sans">
              {errorMsg || 'This ownership link is invalid, expired, or has already been completed.'}
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => navigate('/owner/login')}
              className="w-full py-3 rounded-full bg-[#1C1917] hover:bg-black text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <span>Go to Owner Login (Email & Password)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs cursor-pointer"
            >
              Return to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 py-12 bg-gradient-to-b from-stone-100 via-stone-50 to-stone-100">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden space-y-6">
        {/* Header Banner */}
        <div className="p-6 bg-gradient-to-r from-stone-900 via-[#1C1917] to-stone-900 text-white border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0F766E] text-white flex items-center justify-center shadow-md shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30 mb-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Verified Approval
              </span>
              <h2 className="font-heading font-black text-xl text-white">
                Claim {claim.restaurant_name}
              </h2>
              <p className="text-xs text-stone-300">
                Official Cafe Ownership Activation
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-8 space-y-5">
          {/* Cafe & Owner Summary Card */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE2] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-stone-500 font-medium">Claimant:</span>
              <strong className="text-[#1C1917] font-extrabold">{claim.owner_name} ({claim.designation || 'Owner'})</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500 font-medium">Registered Email:</span>
              <strong className="text-[#0F766E] font-extrabold">{claim.owner_email}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500 font-medium">Contact Phone:</span>
              <strong className="text-stone-800 font-extrabold">{claim.phone_number}</strong>
            </div>
            {restaurant?.city_area && (
              <div className="flex items-center justify-between pt-1 border-t border-stone-200">
                <span className="text-stone-500 font-medium">Location:</span>
                <span className="text-stone-700 font-bold">{restaurant.city_area}, {restaurant.city || 'Delhi'}</span>
              </div>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200/80 text-xs text-teal-950 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              This activation link is <strong>exclusively reserved for {claim.restaurant_name}</strong>. Create your password below to complete setup and take direct control of your cafe dashboard.
            </div>
          </div>

          {/* Password Creation Form */}
          <form onSubmit={handleActivate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Create Permanent Password *</span>
                <span className="text-[10px] text-stone-400 font-normal">Min 6 characters</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 text-xs sm:text-sm font-semibold focus:outline-hidden focus:border-[#0F766E] bg-stone-50/50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Confirm Password *
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-enter password to confirm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border border-stone-300 text-xs sm:text-sm font-semibold focus:outline-hidden focus:border-[#0F766E] bg-stone-50/50"
              />
            </div>

            <p className="text-[11px] text-stone-500 leading-relaxed font-sans">
              ℹ️ After activating, you will be able to sign in anytime at <strong>/owner/login</strong> using your email (<strong>{claim.owner_email}</strong>) and this password.
            </p>

            <button
              type="submit"
              disabled={submitting || password.length < 6 || password !== confirmPassword}
              className="w-full py-4 px-4 rounded-full bg-[#0F766E] hover:bg-[#0D9488] text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md disabled:opacity-50 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-200" />
              <span>{submitting ? 'Activating Ownership...' : `Activate Ownership & Enter Dashboard`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
