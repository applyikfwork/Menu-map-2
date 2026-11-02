/**
 * Menu Maps Discovery - Student Authentication Page & Modal
 * Handles student registration and sign-in with full validation and privacy consent.
 */

import React, { useState } from 'react';
import {
  Compass,
  User,
  Mail,
  Lock,
  GraduationCap,
  BookOpen,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Check,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { useStudentAuth } from '../context/StudentAuthContext';

interface StudentAuthProps {
  navigate: (path: string) => void;
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
  isModal?: boolean;
  onClose?: () => void;
}

export const StudentAuth: React.FC<StudentAuthProps> = ({
  navigate,
  initialMode = 'login',
  onSuccess,
  isModal = false,
  onClose,
}) => {
  const { login, register, isLoading } = useStudentAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [programme, setProgramme] = useState('');
  const [studyYear, setStudyYear] = useState<any>('1st Year');
  const [city, setCity] = useState('Delhi NCR');
  const [publicAttributionConsent, setPublicAttributionConsent] = useState(true);
  const [publicCollegeConsent, setPublicCollegeConsent] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (mode === 'login') {
      const res = await login(email, password);
      if (res.success) {
        if (onSuccess) onSuccess();
        else navigate('/discovery/dashboard');
      } else {
        setErrorMsg(res.error || 'Login failed.');
      }
    } else {
      if (!termsAccepted) {
        setErrorMsg('Please accept the community guidelines and terms to proceed.');
        return;
      }

      const res = await register({
        email,
        password,
        fullName,
        collegeName,
        programme,
        studyYear,
        city,
        publicAttributionConsent,
        publicCollegeConsent,
      });

      if (res.success) {
        if (onSuccess) onSuccess();
        else navigate('/discovery/dashboard');
      } else {
        setErrorMsg(res.error || 'Registration failed.');
      }
    }
  };

  const content = (
    <div className="w-full max-w-md mx-auto bg-white border border-[#E7E2DA] rounded-[32px] p-6 sm:p-8 shadow-sm">
      {/* Brand Header */}
      <div className="text-center space-y-2 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-[#0F766E] flex items-center justify-center mx-auto text-xl shadow-xs">
          🧭
        </div>
        <h2 className="hd text-2xl font-black text-[#1C1917]">
          {mode === 'login' ? 'Student Sign In' : 'Join Discovery Community'}
        </h2>
        <p className="text-xs text-stone-500 max-w-xs mx-auto">
          {mode === 'login'
            ? 'Access your submissions, competition entries, earned credits and passport.'
            : 'Participate in challenges, publish food discoveries, and earn contribution recognition.'}
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-xl mb-6">
        <button
          type="button"
          onClick={() => {
            setMode('login');
            setErrorMsg(null);
          }}
          className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            mode === 'login' ? 'bg-white text-[#1C1917] shadow-xs' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('register');
            setErrorMsg(null);
          }}
          className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            mode === 'register' ? 'bg-white text-[#1C1917] shadow-xs' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          Register as Contributor
        </button>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {mode === 'register' && (
          <>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full bg-[#FAF8F5] border border-[#E7E2DA] focus:border-[#0F766E] rounded-xl pl-9 pr-3 py-2.5 text-xs font-medium outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
                College / University Name *
              </label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                <input
                  type="text"
                  required
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  placeholder="e.g. Hansraj College, DU or DTU"
                  className="w-full bg-[#FAF8F5] border border-[#E7E2DA] focus:border-[#0F766E] rounded-xl pl-9 pr-3 py-2.5 text-xs font-medium outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
                  Programme / Degree
                </label>
                <input
                  type="text"
                  value={programme}
                  onChange={(e) => setProgramme(e.target.value)}
                  placeholder="e.g. B.Tech CS / BA"
                  className="w-full bg-[#FAF8F5] border border-[#E7E2DA] focus:border-[#0F766E] rounded-xl px-3 py-2.5 text-xs font-medium outline-hidden"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
                  Current Year
                </label>
                <select
                  value={studyYear}
                  onChange={(e) => setStudyYear(e.target.value as any)}
                  className="w-full bg-[#FAF8F5] border border-[#E7E2DA] focus:border-[#0F766E] rounded-xl px-3 py-2.5 text-xs font-medium outline-hidden"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Postgraduate">Postgraduate</option>
                  <option value="Alumni">Alumni</option>
                </select>
              </div>
            </div>
          </>
        )}

        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. yourname@college.edu or gmail"
              className="w-full bg-[#FAF8F5] border border-[#E7E2DA] focus:border-[#0F766E] rounded-xl pl-9 pr-3 py-2.5 text-xs font-medium outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
            Password *
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full bg-[#FAF8F5] border border-[#E7E2DA] focus:border-[#0F766E] rounded-xl pl-9 pr-3 py-2.5 text-xs font-medium outline-hidden"
            />
          </div>
        </div>

        {mode === 'register' && (
          <div className="space-y-2 pt-2 border-t border-stone-100 text-[11px] text-stone-600">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={publicAttributionConsent}
                onChange={(e) => setPublicAttributionConsent(e.target.checked)}
                className="mt-0.5 rounded text-[#0F766E]"
              />
              <span>I consent to displaying my name on my approved public contributions & creations.</span>
            </label>

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={publicCollegeConsent}
                onChange={(e) => setPublicCollegeConsent(e.target.checked)}
                className="mt-0.5 rounded text-[#0F766E]"
              />
              <span>I consent to displaying my college name on my public contributor portfolio.</span>
            </label>

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 rounded text-[#0F766E]"
              />
              <span>
                I agree to the Menu Maps community terms and certify that all submitted food evidence and projects are my original work.
              </span>
            </label>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="btn w-full bg-[#0F766E] hover:bg-[#0D9488] text-white min-h-[46px] rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50 mt-2"
        >
          {isLoading ? (
            <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
          ) : (
            <>
              <span>{mode === 'login' ? 'Sign In to Dashboard' : 'Complete Registration'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />
        <div className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 sm:px-6">
      {content}
    </div>
  );
};
