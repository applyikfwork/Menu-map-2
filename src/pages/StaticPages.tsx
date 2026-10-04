import React from 'react';
import { ShieldCheck, Mail, MapPin, Heart, UtensilsCrossed } from 'lucide-react';

interface StaticPageProps {
  type: 'about' | 'contact' | 'terms' | 'privacy';
  navigate: (path: string) => void;
}

export const StaticPage: React.FC<StaticPageProps> = ({ type, navigate }) => {
  if (type === 'about') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-black uppercase tracking-wider">
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Our Mission</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-slate-900 tracking-tight">
            About Menu Map
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
            Democratizing restaurant discovery with complete price transparency, real menus, and genuine diner experiences.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-stone-200/90 shadow-xs space-y-6 text-slate-700 leading-relaxed text-sm sm:text-base">
          <p>
            Menu Map was created to solve a common dilemma: entering a cafe without knowing the prices, dietary options, or signature specials. We believe every customer deserves to see real, verified menus before stepping out the door.
          </p>
          <p>
            Unlike heavy marketplace delivery apps that mark up food prices by 20% to 30%, Menu Map showcases the restaurant's authentic in-house dine-in prices and direct contact details, allowing diners to directly connect with their favorite local food artisans.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-stone-100">
            <div className="space-y-2">
              <h3 className="font-heading font-bold text-slate-900 text-lg">100% Real Menus</h3>
              <p className="text-xs text-slate-500">
                Uploaded and maintained directly with verified prices and portion sizes.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-heading font-bold text-slate-900 text-lg">Zero Commissions</h3>
              <p className="text-xs text-slate-500">
                Direct phone calls, WhatsApp inquiries, and directions without middlemen.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-heading font-bold text-slate-900 text-lg">Honest Reviews</h3>
              <p className="text-xs text-slate-500">
                Unfiltered community feedback from verified visitors and food lovers.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'contact') {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div className="text-center space-y-3">
          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-slate-900 tracking-tight">
            Contact & Support
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">
            Have questions, feedback, or want your cafe featured on Menu Map?
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-xs space-y-6">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-orange-50/70 border border-orange-200/80">
            <div className="w-12 h-12 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-orange-950 uppercase tracking-wider">Email Us</div>
              <a
                href="mailto:xyzapplywork@gmail.com"
                className="text-base sm:text-lg font-black text-orange-600 hover:underline"
              >
                xyzapplywork@gmail.com
              </a>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert('Thank you! Your inquiry has been sent to our team.');
            }}
            className="space-y-4 pt-2"
          >
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
              <input
                type="text"
                required
                placeholder="Full name"
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Message / Cafe Details</label>
              <textarea
                required
                rows={4}
                placeholder="Tell us what's on your mind or share your restaurant details..."
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:border-orange-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold text-sm rounded-2xl shadow-md transition-all"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6">
      <h1 className="font-heading font-extrabold text-3xl text-slate-900 tracking-tight">
        {type === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
      </h1>
      <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-xs space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <p>
          Welcome to Menu Map. By browsing our website and accessing menu records, you agree to our standard terms and data protection policies.
        </p>
        <p>
          <strong>Data Usage:</strong> We do not sell user personal data. Geolocation requests are used exclusively inside your browser to calculate distances to nearby cafes and restaurants.
        </p>
        <p>
          <strong>Restaurant Content:</strong> Menus, prices, and opening hours are provided by participating restaurants and public directories. While we strive for 100% accuracy, prices are subject to seasonal changes.
        </p>
        <p>
          For inquiries or rights requests, contact{' '}
          <a href="mailto:xyzapplywork@gmail.com" className="text-rose-600 font-bold underline">
            xyzapplywork@gmail.com
          </a>.
        </p>
      </div>
    </div>
  );
};
