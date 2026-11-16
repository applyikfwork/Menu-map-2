import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { GuideFaq } from '../../data/foodGuidesData';

interface GuideFaqAccordionProps {
  faqs: GuideFaq[];
}

export const GuideFaqAccordion: React.FC<GuideFaqAccordionProps> = ({ faqs }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-sm space-y-6 my-10">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-bold uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5 text-[#FF5A36]" />
          <span>Frequently Asked Questions</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black font-heading text-stone-900 tracking-tight">
          Everything You Need to Know
        </h3>
        <p className="text-xs sm:text-sm text-stone-500">
          Verified answers about pricing, ordering direct, and dining across Delhi NCR.
        </p>
      </div>

      <div className="divide-y divide-stone-100">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div key={idx} className="py-3.5 first:pt-0 last:pb-0">
              <button
                onClick={() => toggle(idx)}
                className="w-full flex items-center justify-between gap-4 text-left font-bold text-stone-900 hover:text-[#FF5A36] text-sm sm:text-base py-1 transition-colors cursor-pointer"
                aria-expanded={isOpen}
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-stone-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-[#FF5A36]' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="mt-2 text-xs sm:text-sm text-stone-600 leading-relaxed pr-6 animate-in fade-in duration-150">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
