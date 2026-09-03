// apps/web/components/home/FloatingWhatsApp.tsx
'use client';

import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";

export default function FloatingWhatsApp() {
  const [isVisible, setIsVisible] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    // Slide the button in after 2 seconds
    const visibilityTimer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    // Pop open the greeting message after 4 seconds
    const messageTimer = setTimeout(() => {
      setShowMessage(true);
    }, 4000);

    return () => {
      clearTimeout(visibilityTimer);
      clearTimeout(messageTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed right-4 sm:right-6 bottom-4 sm:bottom-6 z-50 flex flex-col items-end gap-3 animate-in slide-in-from-bottom-10 duration-700 fade-in">
      
      {/* Pop-up Alert Message */}
      <div 
        className={`bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 max-w-[260px] relative transition-all duration-500 origin-bottom-right ${
          showMessage ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <button 
          onClick={() => setShowMessage(false)}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close message"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-[#25D366]/10 flex items-center justify-center shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#25D366]"></span>
            </span>
          </div>
          <div>
            <p className="text-xs font-black text-gray-900 mb-1 leading-tight">Need help finding a home or setting up your property?</p>
            <p className="text-[11px] font-medium text-gray-500 leading-relaxed">Our support team is online and ready to assist you.</p>
          </div>
        </div>
      </div>

      {/* Main Floating Button */}
      <a 
        href="https://wa.me/254768569357?text=Hi,%20I%20need%20help%20with%20MogiRent." 
        className="flex items-center gap-2.5 rounded-full bg-[#25D366] text-white px-5 py-3.5 shadow-2xl shadow-[#25D366]/40 hover:bg-[#20bd5a] hover:-translate-y-1 transition-all active:scale-95 group relative" 
        target="_blank" 
        rel="noopener noreferrer" 
        aria-label="Chat on WhatsApp"
        onMouseEnter={() => setShowMessage(true)}
      >
        {/* Notification Badge */}
        {!showMessage && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 border-2 border-white"></span>
          </span>
        )}
        
        <svg width="22" height="22" viewBox="0 0 24 24" fill="white" className="group-hover:rotate-12 transition-transform duration-300">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.305-.885-.653-1.482-1.46-1.656-1.758-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.446-.272.371-1.04 1.015-1.04 2.469 0 1.453 1.065 2.861 1.213 3.06.149.198 2.093 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
        </svg>
        <span className="text-[13px] font-bold tracking-wide">Chat on WhatsApp</span>
      </a>

    </div>
  );
}