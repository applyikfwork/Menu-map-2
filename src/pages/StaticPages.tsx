import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Mail, 
  MapPin, 
  UtensilsCrossed, 
  ArrowRight, 
  MessageSquare, 
  Sparkles, 
  Phone, 
  TrendingDown, 
  CheckCircle2, 
  Compass, 
  Heart,
  Lock,
  FileText
} from 'lucide-react';
import { useToast } from '../components/Toast';

interface StaticPageProps {
  type: 'about' | 'contact' | 'terms' | 'privacy';
  navigate: (path: string) => void;
}

export const StaticPage: React.FC<StaticPageProps> = ({ type, navigate }) => {
  const { showToast } = useToast();

  // Contact form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cafeName, setCafeName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setName('');
      setEmail('');
      setCafeName('');
      setMessage('');
      showToast('Thank you! Your message has been sent to the Menu Map team.', 'success');
    }, 600);
  };

  // ABOUT PAGE
  if (type === 'about') {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-[#D8350F] text-xs font-black uppercase tracking-wider">
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>The Counter Price Revolution</span>
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-[#1C1917] tracking-tight">
            Why Pay 30% More on Food Delivery Apps?
          </h1>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-sans">
            Menu Map was built on a simple premise: restaurant food shouldn't cost more just because you looked it up online. We connect you directly with Delhi's local kitchens at authentic counter rates.
          </p>
        </div>

        {/* 3-Card Trust Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EFEAE2] shadow-xs hover:shadow-md transition-shadow space-y-3 lift">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#0F766E] flex items-center justify-center">
              <TrendingDown className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-black text-xl text-[#1C1917]">
              100% Counter Prices
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-sans">
              Unlike delivery marketplace apps that add 20% to 35% markups onto every single dish, Menu Map verifies physical counter rates so you know the real price before ordering.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EFEAE2] shadow-xs hover:shadow-md transition-shadow space-y-3 lift">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#FF5A36] flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-black text-xl text-[#1C1917]">
              Zero-Commission Orders
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-sans">
              Order directly through WhatsApp or phone with cafe owners. No intermediary platform cuts, no hidden service fees, and direct customer-to-kitchen relationships.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EFEAE2] shadow-xs hover:shadow-md transition-shadow space-y-3 lift">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 text-[#1C1917] flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-black text-xl text-[#1C1917]">
              Delhi Food Culture
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-sans">
              Curated neighborhood food trails across Majnu Ka Tila, Hudson Lane, Kamla Nagar, Connaught Place, Old Delhi, and Hauz Khas with metro transit info.
            </p>
          </div>
        </div>

        {/* Counter Stats Strip */}
        <div className="bg-[#1C1917] text-white rounded-3xl p-8 sm:p-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center border border-stone-800 shadow-xl">
          <div className="space-y-1">
            <div className="font-heading font-black text-3xl sm:text-4xl text-[#FF5A36]">50+</div>
            <div className="text-xs text-stone-400 font-sans font-medium uppercase tracking-wider">Verified Delhi Cafes</div>
          </div>
          <div className="space-y-1">
            <div className="font-heading font-black text-3xl sm:text-4xl text-emerald-400">1,200+</div>
            <div className="text-xs text-stone-400 font-sans font-medium uppercase tracking-wider">Dishes at Counter Rates</div>
          </div>
          <div className="space-y-1">
            <div className="font-heading font-black text-3xl sm:text-4xl text-amber-400">0%</div>
            <div className="text-xs text-stone-400 font-sans font-medium uppercase tracking-wider">Platform Commissions</div>
          </div>
          <div className="space-y-1">
            <div className="font-heading font-black text-3xl sm:text-4xl text-white">100%</div>
            <div className="text-xs text-stone-400 font-sans font-medium uppercase tracking-wider">Private & Offline Vault</div>
          </div>
        </div>

        {/* Manifesto Narrative */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#EFEAE2] shadow-xs space-y-6 text-stone-700 leading-relaxed text-sm sm:text-base font-sans">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#FF5A36]">
            <Sparkles className="w-4 h-4" />
            <span>Our Manifesto</span>
          </div>

          <h2 className="font-heading font-black text-2xl sm:text-3xl text-[#1C1917] tracking-tight">
            Transparent Dining. Direct Connections. Zero Middlemen.
          </h2>

          <p>
            For years, dining platforms promised convenience while quietly inflating menu prices by up to 35% and charging small local restaurants crippling commissions. The diner pays more, the restaurant earns less, and the authentic food culture suffers.
          </p>

          <p>
            Menu Map was launched to reverse this trend. We believe every diner has the right to browse an authentic in-house menu before leaving their home or ordering a meal. We provide high-resolution dish photography, real customer favorites, and one-click direct communication via WhatsApp and phone.
          </p>

          <div className="pt-4 border-t border-[#EFEAE2] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-stone-500 font-medium">
              Ready to explore Delhi's authentic counter menus?
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/restaurants')}
                className="btn bg-[#FF5A36] hover:bg-[#D8350F] text-white shadow-md text-xs font-bold"
              >
                <span>Explore Cafes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => navigate('/iconic-area')}
                className="btn bg-[#FAF8F5] hover:bg-stone-100 text-[#1C1917] border border-[#EFEAE2] text-xs font-bold"
              >
                <span>Area Guides</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CONTACT & PARTNER PAGE
  if (type === 'contact') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <span className="eyebrow text-[#FF5A36]">Get In Touch</span>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-[#1C1917] tracking-tight">
            Contact & Cafe Support
          </h1>
          <p className="text-stone-600 text-sm sm:text-base font-sans">
            Have questions, feedback, or want your restaurant featured on Menu Map? We'd love to hear from you.
          </p>
        </div>

        {/* Dual Direct Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Email Support Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#EFEAE2] shadow-xs flex items-center gap-4 lift">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#FF5A36] flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Direct Email</div>
              <a
                href="mailto:xyzapplywork@gmail.com"
                className="font-heading font-black text-base text-[#1C1917] hover:text-[#FF5A36] transition-colors truncate block"
              >
                xyzapplywork@gmail.com
              </a>
              <div className="text-[11px] text-stone-500 mt-0.5">Replies within 24 hours</div>
            </div>
          </div>

          {/* WhatsApp Support Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#EFEAE2] shadow-xs flex items-center gap-4 lift">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#0F766E] flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Cafe Partner Hotline</div>
              <a
                href="https://wa.me/919711510115?text=Hello%20Menu%20Map%20Team!%20I%20would%20like%20to%20inquire%20about%20my%20cafe%20listing."
                target="_blank"
                rel="noopener noreferrer"
                className="font-heading font-black text-base text-[#0F766E] hover:underline truncate block"
              >
                WhatsApp Inquiry (+91 97115 •••15)
              </a>
              <div className="text-[11px] text-stone-500 mt-0.5">Instant cafe partner assistance</div>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#EFEAE2] shadow-xs space-y-6">
          <div>
            <h3 className="font-heading font-black text-2xl text-[#1C1917]">
              Send Us a Message
            </h3>
            <p className="text-xs text-stone-500 font-sans mt-1">
              Whether you are a diner with a tip, a food creator, or a restaurant manager.
            </p>
          </div>

          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#EFEAE2] rounded-2xl text-xs font-medium focus:outline-hidden focus:border-[#FF5A36] text-[#1C1917]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#EFEAE2] rounded-2xl text-xs font-medium focus:outline-hidden focus:border-[#FF5A36] text-[#1C1917]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Restaurant / Cafe Name (Optional)
              </label>
              <input
                type="text"
                value={cafeName}
                onChange={(e) => setCafeName(e.target.value)}
                placeholder="e.g. The Blue Bistro, Majnu Ka Tila"
                className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#EFEAE2] rounded-2xl text-xs font-medium focus:outline-hidden focus:border-[#FF5A36] text-[#1C1917]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Message / Inquiry *
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share your feedback, correction request, or cafe listing details..."
                className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#EFEAE2] rounded-2xl text-xs font-medium focus:outline-hidden focus:border-[#FF5A36] text-[#1C1917]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-full bg-[#1C1917] hover:bg-black text-white font-extrabold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Sending Message...' : 'Send Message to Team'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // TERMS OF SERVICE & PRIVACY POLICY
  const isTerms = type === 'terms';
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <span className="eyebrow text-[#0F766E] flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" />
          <span>Legal & Transparency Policies</span>
        </span>
        <h1 className="font-heading font-black text-3xl sm:text-5xl text-[#1C1917] tracking-tight">
          {isTerms ? 'Terms of Service' : 'Privacy Policy'}
        </h1>
        <p className="text-xs text-stone-400 font-sans">
          Last revised: October 2026 • Menu Map Independent Food Transparency Directory
        </p>
      </div>

      {/* Editorial Legal Document Layout */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#EFEAE2] shadow-xs space-y-8 text-stone-700 leading-relaxed text-sm font-sans">
        
        <section className="space-y-2">
          <h3 className="font-heading font-black text-lg text-[#1C1917]">
            1. Overview & Core Mission
          </h3>
          <p>
            Welcome to Menu Map. By accessing or using our platform, you acknowledge and agree to these terms. Menu Map operates as an independent community directory dedicated to consumer price transparency, in-store counter menu records, and direct non-intermediated contact between diners and food venues.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-heading font-black text-lg text-[#1C1917]">
            2. Offline-First Privacy & Zero Ad Tracking
          </h3>
          <p>
            We respect your privacy unconditionally. Menu Map does not sell, rent, or monetize personal user data. Your saved cafes, favorite dishes, and food trails are stored purely in your own browser's local storage (Offline Vault). We do not require mandatory registration for public menu exploration.
          </p>
          <p>
            When you request GPS coordinates via the Nearby hub, your coordinates are processed strictly inside your device's browser to compute mathematical distances (Haversine formula) to nearby restaurants.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-heading font-black text-lg text-[#1C1917]">
            3. Menu Accuracy & Indicative Counter Pricing
          </h3>
          <p>
            Menu items, photographs, spice levels, and pricing data displayed on Menu Map reflect in-store physical menus and direct verified cafe submissions. While we endeavor to keep all information updated and accurate:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-stone-600 text-xs">
            <li>Prices are indicative counter rates subject to seasonal updates and statutory local taxes (e.g. GST).</li>
            <li>Item availability and daily preparation times are confirmed directly by the venue via WhatsApp or phone.</li>
            <li>Restaurant owners retain full rights to request updates or claim their official profile via our verification portal.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="font-heading font-black text-lg text-[#1C1917]">
            4. Direct WhatsApp Connect & 0% Commissions
          </h3>
          <p>
            Menu Map acts solely as a discovery conduit. Orders initiated via our WhatsApp drawer are transmitted directly to the restaurant's registered telephone line. Menu Map charges zero marketplace fees, handles no payments, and does not retain consumer banking details.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-heading font-black text-lg text-[#1C1917]">
            5. Inquiries & Data Rights
          </h3>
          <p>
            For any rights requests, copyright notices, or directory corrections, please contact our team at{' '}
            <a href="mailto:xyzapplywork@gmail.com" className="text-[#D8350F] font-bold hover:underline">
              xyzapplywork@gmail.com
            </a>.
          </p>
        </section>

        {/* Footer Navigation */}
        <div className="pt-6 border-t border-[#EFEAE2] flex items-center justify-between text-xs text-stone-500">
          <button
            onClick={() => navigate('/')}
            className="text-[#FF5A36] font-bold hover:underline"
          >
            ← Return to Home
          </button>
          <span>Menu Map Transparency Initiative</span>
        </div>
      </div>
    </div>
  );
};
