import React, { useState } from 'react';
import { X, Sparkles, ArrowRight, RotateCcw, Compass, CheckCircle2 } from 'lucide-react';
import { Restaurant } from '../../types/database';

interface FoodQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurants: Restaurant[];
  navigate: (path: string) => void;
}

export const FoodQuizModal: React.FC<FoodQuizModalProps> = ({
  isOpen,
  onClose,
  restaurants,
  navigate,
}) => {
  const [step, setStep] = useState(1);
  const [mood, setMood] = useState<string>('study');
  const [budget, setBudget] = useState<string>('budget');
  const [diet, setDiet] = useState<string>('all');

  if (!isOpen) return null;

  const resetQuiz = () => {
    setStep(1);
    setMood('study');
    setBudget('budget');
    setDiet('all');
  };

  // Filter recommendations based on answers
  const filtered = restaurants.filter((r) => {
    // Diet filter
    if (diet === 'veg' && !r.dietary_options?.includes('Pure Veg') && !r.cuisine_types?.some((c) => /veg/i.test(c))) {
      return false;
    }
    // Budget filter
    if (budget === 'budget' && r.average_cost_for_two > 400) return false;
    if (budget === 'premium' && r.average_cost_for_two < 700) return false;

    // Mood filter
    if (mood === 'study') {
      return (
        r.best_for_tags?.includes('Studying') ||
        r.facilities?.some((f) => /wifi|power|outlets/i.test(f)) ||
        r.cuisine_types?.includes('Cafe')
      );
    }
    if (mood === 'date') {
      return (
        r.best_for_tags?.includes('Date Night') ||
        r.ambience_tags?.includes('Romantic & Intimate') ||
        r.rating_avg >= 4.5
      );
    }
    if (mood === 'friends') {
      return (
        r.best_for_tags?.includes('Groups') ||
        r.ambience_tags?.includes('Lively & Social') ||
        r.facilities?.some((f) => /party|spacious/i.test(f))
      );
    }
    return true;
  });

  const finalMatches = (filtered.length > 0 ? filtered : restaurants).slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#EFEAE2] p-6 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors z-10 border border-[#EFEAE2]"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1 mb-4 shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-[#D8350F] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>30-Second Dining Matchmaker</span>
          </div>
          <h3 className="text-2xl font-black text-[#1C1917] font-heading tracking-tight">
            Find Your Ideal Cafe 🎯
          </h3>
          <p className="text-xs text-stone-500 font-sans">
            {step <= 3 ? `Step ${step} of 3: Personalized for your taste & budget` : 'Your Tailored Counter Matches'}
          </p>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto pr-1">
          {step === 1 && (
            <div className="space-y-4 py-2">
              <label className="block text-sm font-bold text-[#1C1917] text-center font-heading">
                What is your vibe right now?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'study', title: '📚 Study & Work', desc: 'Wi-Fi, power sockets, calm ambience' },
                  { id: 'friends', title: '🎉 Chill with Friends', desc: 'Lively, platters & group tables' },
                  { id: 'date', title: '🕯️ Romantic Date', desc: 'Cozy lighting, aesthetic corners' },
                  { id: 'quick', title: '⚡ Quick Bites', desc: 'Fast snacks, pocket-friendly meals' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setMood(item.id);
                      setStep(2);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      mood === item.id
                        ? 'border-[#FF5A36] bg-white shadow-md ring-2 ring-[#FF5A36]/20'
                        : 'border-[#EFEAE2] bg-white hover:border-[#FF5A36]/40 hover:bg-stone-50'
                    }`}
                  >
                    <div className="font-heading font-extrabold text-sm text-[#1C1917] mb-1">{item.title}</div>
                    <div className="text-xs text-stone-500 font-sans leading-tight">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 py-2">
              <label className="block text-sm font-bold text-[#1C1917] text-center font-heading">
                What is your budget for two?
              </label>
              <div className="space-y-2.5">
                {[
                  { id: 'budget', title: '💸 Pocket-Friendly (Under ₹350 for two)', desc: 'Student combos, economical street & cafe bites' },
                  { id: 'mid', title: '🍱 Casual Dining (₹350 – ₹700 for two)', desc: 'Full-course bistro meals, pastas, coffees & shakes' },
                  { id: 'premium', title: '✨ Splurge & Rooftops (₹700+ for two)', desc: 'Artisanal roasts, rooftop terrace & monument views' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setBudget(item.id);
                      setStep(3);
                    }}
                    className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      budget === item.id
                        ? 'border-[#FF5A36] bg-white shadow-md ring-2 ring-[#FF5A36]/20'
                        : 'border-[#EFEAE2] bg-white hover:border-[#FF5A36]/40 hover:bg-stone-50'
                    }`}
                  >
                    <div className="font-heading font-extrabold text-sm text-[#1C1917]">{item.title}</div>
                    <div className="text-xs text-stone-500 mt-1 font-sans">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 py-2">
              <label className="block text-sm font-bold text-[#1C1917] text-center font-heading">
                Dietary Preference?
              </label>
              <div className="space-y-2.5">
                {[
                  { id: 'all', title: '🍽️ All Cuisines Welcome', desc: 'Veg, Non-Veg & Signature specials' },
                  { id: 'veg', title: '🟢 Pure Vegetarian Only', desc: '100% vegetarian kitchens & Jain options' },
                  { id: 'healthy', title: '🌱 Vegan & Healthy Friendly', desc: 'Fresh bowls, salads, dairy-free smoothies' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setDiet(item.id);
                      setStep(4);
                    }}
                    className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      diet === item.id
                        ? 'border-[#FF5A36] bg-white shadow-md ring-2 ring-[#FF5A36]/20'
                        : 'border-[#EFEAE2] bg-white hover:border-[#FF5A36]/40 hover:bg-stone-50'
                    }`}
                  >
                    <div className="font-heading font-extrabold text-sm text-[#1C1917]">{item.title}</div>
                    <div className="text-xs text-stone-500 mt-1 font-sans">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3 py-1">
              <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                <span className="font-bold text-[#0F766E]">Found {finalMatches.length} tailored spots</span>
                <button
                  onClick={resetQuiz}
                  className="inline-flex items-center gap-1 text-[#D8350F] font-bold hover:underline"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Quiz</span>
                </button>
              </div>

              <div className="space-y-3">
                {finalMatches.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => {
                      onClose();
                      navigate(`/${r.slug}`);
                    }}
                    className="p-3.5 rounded-2xl border border-[#EFEAE2] hover:border-[#FF5A36] bg-white hover:shadow-md transition-all cursor-pointer flex items-center gap-3.5 lift"
                  >
                    <img
                      src={r.cover_image_url}
                      alt={r.name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-heading font-black text-sm text-[#1C1917] truncate">{r.name}</h4>
                      <p className="text-xs text-stone-500 truncate mt-0.5 font-sans">{r.short_description || r.address_line1}</p>
                      <div className="flex items-center gap-2 mt-1.5 text-[11px] font-bold text-[#D8350F]">
                        <span>₹{r.average_cost_for_two} for two</span>
                        <span className="text-stone-300">•</span>
                        <span className="text-emerald-700">⭐ {r.rating_avg.toFixed(1)}</span>
                        <span className="text-stone-300">•</span>
                        <span className="text-stone-500">0% App Markup</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-400 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        {step < 4 && (
          <div className="mt-4 pt-3 border-t border-[#EFEAE2] flex items-center justify-between shrink-0">
            {step > 1 ? (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="text-xs font-bold text-stone-600 hover:text-[#1C1917]"
              >
                ← Back
              </button>
            ) : <div />}
            <span className="text-xs font-semibold text-stone-400">Step {step} of 3</span>
          </div>
        )}
      </div>
    </div>
  );
};
