import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Lock, 
  Phone, 
  KeyRound, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  UtensilsCrossed, 
  ArrowLeft 
} from 'lucide-react';
import { api, getCurrentOwnerSession } from '../lib/supabase';
import { useToast } from '../components/Toast';

interface OwnerLoginProps {
  navigate: (path: string) => void;
}

export const OwnerLogin: React.FC<OwnerLoginProps> = ({ navigate }) => {
  const { showToast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const session = getCurrentOwnerSession();
    if (session) {
      navigate('/owner/dashboard');
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || !password) {
      showToast('Please enter your mobile number and password.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.loginRestaurantOwner(phoneNumber, password);
      if (res.success && res.owner) {
        showToast(`Welcome back, ${res.owner.owner_name}!`, 'success');
        navigate('/owner/dashboard');
      } else {
        showToast(res.error || 'Invalid credentials.', 'error');
      }
    } catch (e: any) {
      showToast(e?.message || 'Login failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-stone-100 via-stone-50 to-stone-100">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-stone-200/80 shadow-xl space-y-6">
        {/* Back Link */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Menu Maps</span>
        </button>

        {/* Branding */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center mx-auto shadow-md">
            <Building2 className="w-7 h-7" />
          </div>
          <h2 className="font-heading font-black text-2xl text-slate-900 tracking-tight">
            Restaurant Owner Portal
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Log in with your verified phone number & password to manage your digital menu and QR standees.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-orange-500" />
              <span>Registered Mobile Number</span>
            </label>
            <input
              type="tel"
              placeholder="e.g. 9876543210"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-stone-200 text-xs sm:text-sm font-semibold focus:outline-hidden focus:border-orange-500 bg-stone-50/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-orange-500" />
              <span>Password</span>
            </label>
            <input
              type="password"
              placeholder="Enter your account password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-stone-200 text-xs sm:text-sm font-medium focus:outline-hidden focus:border-orange-500 bg-stone-50/50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Owner Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Claim prompt for new owners */}
        <div className="pt-4 border-t border-stone-100 text-center space-y-2">
          <p className="text-xs text-slate-600">
            Haven’t claimed your restaurant yet?
          </p>
          <button
            onClick={() => navigate('/restaurants')}
            className="text-xs font-extrabold text-orange-600 hover:text-orange-700 hover:underline"
          >
            Find Your Restaurant & Click "Claim Ownership" →
          </button>
        </div>
      </div>
    </div>
  );
};
