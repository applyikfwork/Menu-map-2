import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, ArrowRight, RotateCcw } from 'lucide-react';
import { Restaurant } from '../../types/database';
import { RestaurantCard } from '../RestaurantCard';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-stone-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1 mb-4 shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>30-Second Dining Matchmaker</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 font-heading">
            Find Your Ideal Cafe 🎯
          </h3>
          <p className="text-xs text-slate-500">
            {step <= 3 ? `Step ${step} of 3: Personalized for your taste` : 'Your Personalized Dining Matches'}
          </p>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto pr-1">
          {step === 1 && (
            <div className="space-y-4 py-2">
              <label className="block text-sm font-bold text-slate-800 text-center">
                What is your vibe right now?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'study', title: '📚 Study & Assignments', desc: 'Wi-Fi, power sockets, calm' },
                  { id: 'friends', title: '🎉 Chill with Friends', desc: 'Lively, sharing platters' },
                  { id: 'date', title: '🕯️ Romantic Date', desc: 'Cozy lighting, good music' },
                  { id: 'quick', title: '⚡ Fast Hunger Strike', desc: 'Quick bites, heavy meals' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setMood(item.id);
                      setStep(2);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      mood === item.id
                        ? 'border-orange-500 bg-orange-50/80 shadow-xs'
                        : 'border-stone-200 hover:border-orange-300 hover:bg-stone-50'
                    }`}
                  >
                    <div className="font-bold text-sm text-slate-900 mb-0.5">{item.title}</div>
                    <div className="text-xs text-slate-500">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 py-2">
              <label className="block text-sm font-bold text-slate-800 text-center">
                What is your budget for two?
              </label>
              <div className="space-y-2.5">
                {[
                  { id: 'budget', title: '💸 Pocket-Friendly (Under ₹350)', desc: 'Student combos, economical & delicious' },
                  { id: 'mid', title: '🍱 Standard Casual (₹350 – ₹700)', desc: 'Full-course bistro dining and beverages' },
                  { id: 'premium', title: '✨ Splurge & Fine Dine (₹700+)', desc: 'Artisanal roasts, rooftop & monument views' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setBudget(item.id);
                      setStep(3);
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all ${
                      budget === item.id
                        ? 'border-orange-500 bg-orange-50/80 shadow-xs'
                        : 'border-stone-200 hover:border-orange-300 hover:bg-stone-50'
                    }`}
                  >
                    <div className="font-bold text-sm text-slate-900">{item.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 py-2">
              <label className="block text-sm font-bold text-slate-800 text-center">
                Dietary Preference?
              </label>
              <div className="space-y-2.5">
                {[
                  { id: 'all', title: '🍽️ All Cuisines Welcome', desc: 'Veg & Non-Veg options' },
                  { id: 'veg', title: '🟢 Pure Vegetarian Only', desc: '100% pure veg restaurants & Jain food' },
                  { id: 'healthy', title: '🌱 Vegan & Healthy Friendly', desc: 'Fresh bowls, salads, dairy-free shakes' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setDiet(item.id);
                      setStep(4);
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all ${
                      diet === item.id
                        ? 'border-orange-500 bg-orange-50/80 shadow-xs'
                        : 'border-stone-200 hover:border-orange-300 hover:bg-stone-50'
                    }`}
                  >
                    <div className="font-bold text-sm text-slate-900">{item.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3 py-1">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>Found {finalMatches.length} tailored spots</span>
                <button
                  onClick={resetQuiz}
                  className="inline-flex items-center gap-1 text-orange-600 font-bold hover:underline"
                >
                  <RotateCcw className="w-3 h-3" />
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
                    className="p-3 rounded-2xl border border-stone-200 hover:border-orange-400 bg-stone-50/60 hover:bg-white transition-all cursor-pointer flex items-center gap-3"
                  >
                    <img
                      src={r.cover_image_url}
                      alt={r.name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-slate-900 truncate">{r.name}</h4>
                      <p className="text-xs text-slate-500 truncate">{r.short_description}</p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] font-bold text-orange-600">
                        <span>₹{r.average_cost_for_two} for two</span>
                        <span>•</span>
                        <span>⭐ {r.rating_avg}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        {step < 4 && (
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between shrink-0">
            {step > 1 ? (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Back
              </button>
            ) : <div />}
            <span className="text-xs text-slate-400">Step {step} of 3</span>
          </div>
        )}
      </div>
    </div>
  );
};
