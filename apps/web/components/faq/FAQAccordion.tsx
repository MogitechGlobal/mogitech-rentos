// apps/web/components/faq/FAQAccordion.tsx
'use client';

import { useState } from "react";
import Link from "next/link";
import { Plus, Minus, ArrowRight, ThumbsUp, ThumbsDown } from "lucide-react";
import { FAQ } from "@/data/faq/faqs";
import { toast } from "sonner";

interface FAQAccordionProps {
  faqs: FAQ[];
}

export default function FAQAccordion({ faqs }: FAQAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id || null);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, boolean>>({});

  const handleFeedback = (id: string, helpful: boolean) => {
    setFeedbackGiven(prev => ({ ...prev, [id]: true }));
    toast.success("Thank you for your feedback!");
  };

  if (faqs.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-200 shadow-sm max-w-3xl mx-auto">
        <h3 className="text-xl font-black text-gray-900 mb-2">No answers found</h3>
        <p className="text-gray-500 font-medium mb-6">Try searching for another term or explore our resource hub.</p>
        <Link href="/blog" className="inline-flex items-center gap-2 bg-[#1f8898] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-sm">
          Explore Guides & Blog <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {faqs.map((faq) => {
        const isOpen = openId === faq.id;
        const hasFeedback = feedbackGiven[faq.id];

        return (
          <div 
            key={faq.id} 
            className={`bg-white border rounded-[1.5rem] overflow-hidden transition-all duration-300 relative ${
              isOpen 
              ? 'border-[#1f8898]/40 shadow-xl shadow-[#1f8898]/5' 
              : 'border-gray-200/60 hover:border-gray-300 shadow-sm'
            }`}
          >
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-[#1f8898] transition-transform duration-300 origin-top ${isOpen ? 'scale-y-100' : 'scale-y-0'}`}></div>

            <button 
              type="button"
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${faq.id}`}
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
              id={`faq-answer-${faq.id}`}
              role="region"
              className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
            >
              <div className="overflow-hidden">
                <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0 text-gray-600 font-medium leading-relaxed text-sm sm:text-base">
                  <div className="pt-3 border-t border-gray-100">
                    <p className="mb-4">{faq.answer}</p>

                    {/* Related Links */}
                    {faq.relatedLinks && faq.relatedLinks.length > 0 && (
                      <div className="mb-6 flex flex-wrap gap-2">
                        {faq.relatedLinks.map((link, lIdx) => (
                          <Link 
                            key={lIdx} 
                            href={link.href}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1f8898] bg-[#ebf3f5] hover:bg-[#1f8898] hover:text-white px-3 py-1.5 rounded-lg transition-colors"
                          >
                            {link.label} <ArrowRight className="w-3 h-3" />
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Was this helpful? */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-xs text-gray-400 font-bold">
                      <span>Was this answer helpful?</span>
                      {hasFeedback ? (
                        <span className="text-emerald-600 font-bold">Thank you for your feedback!</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleFeedback(faq.id, true)} 
                            className="flex items-center gap-1 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-600 px-3 py-1 rounded-lg border border-gray-200 transition-colors"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" /> Yes
                          </button>
                          <button 
                            onClick={() => handleFeedback(faq.id, false)} 
                            className="flex items-center gap-1 bg-gray-50 hover:bg-rose-50 hover:text-rose-600 px-3 py-1 rounded-lg border border-gray-200 transition-colors"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" /> No
                          </button>
                        </div>
                      )}
                    </div>
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