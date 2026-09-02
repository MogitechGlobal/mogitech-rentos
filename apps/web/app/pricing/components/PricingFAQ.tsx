// apps/web/app/pricing/components/PricingFAQ.tsx
'use client';

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface PricingFAQProps {
  faqs: FAQItem[];
}

export default function PricingFAQ({ faqs }: PricingFAQProps) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id || null);

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {faqs.map((faq) => {
        const isOpen = openId === faq.id;

        return (
          <div 
            key={faq.id} 
            className={`bg-white border rounded-[1.5rem] overflow-hidden transition-all duration-300 relative ${
              isOpen 
              ? 'border-[#1f8898]/40 shadow-xl shadow-[#1f8898]/5' 
              : 'border-gray-200/80 hover:border-gray-300 shadow-sm'
            }`}
          >
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-[#1f8898] transition-transform duration-300 origin-top ${isOpen ? 'scale-y-100' : 'scale-y-0'}`}></div>

            <button 
              type="button"
              aria-expanded={isOpen}
              aria-controls={`pricing-faq-${faq.id}`}
              onClick={() => setOpenId(isOpen ? null : faq.id)}
              className="w-full px-6 sm:px-8 py-6 flex items-start sm:items-center justify-between bg-white text-left focus:outline-none group cursor-pointer"
            >
              <span className={`text-base sm:text-lg font-black tracking-tight pr-6 transition-colors ${isOpen ? 'text-[#1f8898]' : 'text-gray-900 group-hover:text-[#1f8898]'}`}>
                {faq.question}
              </span>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-[#ebf3f5] text-[#1f8898]' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'}`}>
                {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </div>
            </button>
            
            <div 
              id={`pricing-faq-${faq.id}`}
              role="region"
              className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
            >
              <div className="overflow-hidden">
                <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0 text-gray-600 font-medium leading-relaxed text-sm sm:text-base">
                  <div className="pt-3 border-t border-gray-100">
                    {faq.answer}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}