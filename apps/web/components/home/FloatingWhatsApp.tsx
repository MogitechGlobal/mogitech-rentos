// apps/web/components/home/FloatingWhatsApp.tsx
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Sparkles, Building2, Search, ArrowRight, ShieldCheck } from "lucide-react";

export default function FloatingWhatsApp() {
  const [isVisible, setIsVisible] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("https://mogirent.co.ke");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }

    // Slide button into view
    const visibilityTimer = setTimeout(() => {
      setIsVisible(true);
    }, 1800);

    // Reveal conversational alert card
    const messageTimer = setTimeout(() => {
      setShowMessage(true);
    }, 3600);

    return () => {
      clearTimeout(visibilityTimer);
      clearTimeout(messageTimer);
    };
  }, []);

  const generateWhatsAppUrl = (intent: string) => {
    const baseMessage = `Hello MogiRent Team,\n\nI'm browsing ${currentUrl} and would like assistance with: *${intent}*.\n\nPlease share more details.`;
    return `https://wa.me/254768569357?text=${encodeURIComponent(baseMessage)}`;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed right-4 sm:right-6 bottom-4 sm:bottom-6 z-50 flex flex-col items-end gap-3 animate-in slide-in-from-bottom-8 fade-in duration-500">
      
      {/* --- ADVANCED CONCIERGE POPUP --- */}
      <div 
        className={`w-[calc(100vw-2rem)] sm:w-[320px] bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_25px_50px_-12px_rgba(15,73,82,0.25)] border border-teal-900/10 overflow-hidden transition-all duration-500 origin-bottom-right ${
          showMessage 
            ? 'scale-100 opacity-100 translate-y-0 pointer-events-auto' 
            : 'scale-90 opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#0f4952] to-[#1f8898] p-4 text-white relative">
          <button 
            onClick={() => setShowMessage(false)}
            className="absolute top-3.5 right-3.5 p-1 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close message"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center border border-white/20 shadow-inner">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#25D366] border-2 border-[#0f4952]"></span>
              </span>
            </div>
            
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-tight">MogiRent Desk</span>
                <Sparkles className="w-3 h-3 text-amber-300" />
              </div>
              <p className="text-[11px] font-medium text-teal-100/90 flex items-center gap-1">
                Verified Support &middot; Typically replies in &lt;5m
              </p>
            </div>
          </div>
        </div>

        {/* Body & Contextual Quick Links */}
        <div className="p-4 space-y-3.5">
          <div className="bg-[#f6f8f9] rounded-2xl p-3 border border-gray-100 text-xs text-gray-700 leading-relaxed">
            <span className="font-bold text-gray-900 block mb-1">Karibu! Need quick assistance?</span>
            Whether looking for an available rental or automating Paybill rent collections, pick an option below to connect with us directly.
          </div>

          <div className="space-y-2">
            {/* House Hunter Action */}
            <a 
              href={generateWhatsAppUrl("Finding a vacant home to rent")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-emerald-50/60 border border-gray-100 hover:border-[#25D366]/40 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-100/60 text-[#25D366] flex items-center justify-center">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-gray-800 group-hover:text-emerald-950">House Hunter Inquiries</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#25D366] group-hover:translate-x-0.5 transition-all" />
            </a>

            {/* Landlord Action */}
            <a 
              href={generateWhatsAppUrl("Landlord ERP setup & automated rent collection")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-teal-50/60 border border-gray-100 hover:border-[#1f8898]/40 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-teal-100/60 text-[#1f8898] flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-gray-800 group-hover:text-teal-950">Landlord & Agency Setup</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#1f8898] group-hover:translate-x-0.5 transition-all" />
            </a>
          </div>

          {/* Quick Platform Route Shortcuts */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] font-bold text-[#1f8898]">
            <Link href="/marketplace" onClick={() => setShowMessage(false)} className="hover:underline">
              View Marketplace &rarr;
            </Link>
            <Link href="/pricing" onClick={() => setShowMessage(false)} className="hover:underline">
              SaaS Pricing &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* --- MAIN FLOATING ACTION BUTTON --- */}
      <a 
        href={generateWhatsAppUrl("General consultation")} 
        className="flex items-center gap-2.5 rounded-full bg-[#25D366] text-white px-5 py-3.5 shadow-[0_15px_30px_rgba(37,211,102,0.35)] hover:bg-[#20bd5a] hover:shadow-[0_20px_35px_rgba(37,211,102,0.45)] hover:-translate-y-0.5 transition-all active:scale-95 group relative" 
        target="_blank" 
        rel="noopener noreferrer" 
        aria-label="Chat on WhatsApp"
        onClick={() => setShowMessage(false)}
        onMouseEnter={() => setShowMessage(true)}
      >
        {/* Pulsing indicator when bubble is closed */}
        {!showMessage && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 border-2 border-white text-[9px] font-black text-white items-center justify-center">
              1
            </span>
          </span>
        )}
        
        <svg width="22" height="22" viewBox="0 0 24 24" fill="white" className="group-hover:rotate-6 transition-transform duration-300 shrink-0">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.305-.885-.653-1.482-1.46-1.656-1.758-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.446-.272.371-1.04 1.015-1.04 2.469 0 1.453 1.065 2.861 1.213 3.06.149.198 2.093 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
        </svg>
        <span className="text-[13px] font-black tracking-tight">Need help? Chat with us</span>
      </a>

    </div>
  );
}