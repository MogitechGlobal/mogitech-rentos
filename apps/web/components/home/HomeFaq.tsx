// apps/web/components/home/HomeFaq.tsx
'use client';

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

interface HomeFaqProps {
  faqs: { id: string; question: string; answer: string }[];
}

export default function HomeFaq({ faqs }: HomeFaqProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {faqs.map((faq) => {
        const isOpen = openId === faq.id;
        return (
          <div key={faq.id} className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden transition-all shadow-sm">
            <button 
              type="button"
              aria-expanded={isOpen}
              aria-controls={`faq-${faq.id}`}
              onClick={() => setOpenId(isOpen ? null : faq.id)}
              className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none group"
            >
              <span className={`font-black text-base sm:text-lg transition-colors ${isOpen ? 'text-[#1f8898]' : 'text-gray-900 group-hover:text-[#1f8898]'}`}>
                {faq.question}
              </span>
              <div className="shrink-0 ml-4 text-gray-400 group-hover:text-[#1f8898]">
                {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </div>
            </button>
            <div 
              id={`faq-${faq.id}`}
              className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
            >
              <div className="overflow-hidden">
                <div className="px-6 pb-6 text-sm text-gray-600 font-medium leading-relaxed">
                  <div className="pt-2 border-t border-gray-100">
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