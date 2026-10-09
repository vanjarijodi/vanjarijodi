import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { COMMUNITY_FAQS } from '../data/initialData';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export const FAQSection: React.FC = () => {
  const { t, language } = useApp();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 bg-slate-950 border-t border-amber-500/20 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/30">
            <HelpCircle className="w-3.5 h-3.5 fill-amber-400" />
            <span>FAQ</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            {t('faq_title')}
          </h2>
        </div>

        {/* Accordions */}
        <div className="space-y-4">
          {COMMUNITY_FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            const question = language === 'mr' ? faq.qMr : faq.qEn;
            const answer = language === 'mr' ? faq.aMr : faq.aEn;

            return (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleAccordion(idx)}
                  className="w-full p-5 text-left font-bold text-slate-100 flex justify-between items-center text-sm sm:text-base hover:text-amber-300"
                >
                  <span>{question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-amber-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
                    {answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
