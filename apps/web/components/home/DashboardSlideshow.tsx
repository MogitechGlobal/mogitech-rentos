// apps/web/components/home/DashboardSlideshow.tsx
'use client';

import { useState, useEffect } from "react";

const b2bSlides = [
  "/image_0d36b7.png",  // Dashboard Analytics
  "/image_0d3600.png",  // Tenant Directory
  "/image_0ce365.png",  // Accounting & P&L
  "/image_0ce3a6.png",  // Billing Dashboard
  "/image_0d3a1e.png",  // Marketplace Leads
  "/image_0d3641.png",  // Listing Manager
  "/image_0d367c.png",  // Property Management
  "/image_0d399d.png"   // Billing Dashboard alternative
];

export default function DashboardSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % b2bSlides.length);
    }, 4500); 
    return () => clearInterval(slideTimer);
  }, []);

  return (
    <div className="relative w-full max-w-[1100px] mx-auto mb-16 sm:mb-24 animate-in fade-in slide-in-from-bottom-12 duration-1000">
      
      {/* Seamless Slideshow Container */}
      <div className="relative w-full aspect-[16/10] max-h-[700px] flex items-center justify-center">
         {b2bSlides.map((slide, idx) => (
            <img 
              key={idx}
              src={slide} 
              alt={`MogiRentOS Dashboard View ${idx + 1}`} 
              className={`absolute inset-0 w-full h-full object-contain drop-shadow-[0_30px_60px_rgba(14,54,60,0.15)] transition-opacity duration-1000 ease-in-out ${
                currentSlide === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`} 
            />
          ))}
      </div>
      
      {/* Clean Pagination Controls */}
      <div className="flex justify-center gap-2.5 mt-8 sm:mt-12 relative z-20">
         {b2bSlides.map((_, idx) => (
           <button
             key={idx}
             onClick={() => setCurrentSlide(idx)}
             aria-label={`Go to slide ${idx + 1}`}
             className={`h-2.5 rounded-full transition-all duration-300 shadow-sm ${
               currentSlide === idx 
                 ? 'w-8 bg-[#1f8898]' 
                 : 'w-2.5 bg-gray-300 hover:bg-gray-400'
             }`}
           />
         ))}
      </div>
      
    </div>
  );
}