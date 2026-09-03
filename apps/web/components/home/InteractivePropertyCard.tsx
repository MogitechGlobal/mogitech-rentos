// apps/web/components/home/InteractivePropertyCard.tsx
'use client';

import { useState } from "react";
import Link from "next/link";
import { Building2, MapPin, BedDouble, Bath, ArrowRight, LockKeyhole, TrendingDown, X, ChevronLeft, ChevronRight } from "lucide-react";
import FavoriteButton from "./FavoriteButton";

export default function InteractivePropertyCard({ listing }: { listing: any }) {
  const [galleryData, setGalleryData] = useState<{ images: any[], currentIndex: number } | null>(null);

  const openGallery = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!listing.images || listing.images.length === 0) return;
    setGalleryData({ images: listing.images, currentIndex: 0 });
  };

  const closeGallery = () => setGalleryData(null);

  return (
    <>
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-[#1f8898]/10 hover:-translate-y-1.5 transition-all duration-300 group flex flex-col relative">
        <FavoriteButton />

        <div onClick={openGallery} className="h-56 w-full relative bg-gray-100 overflow-hidden cursor-pointer block">
          {listing.images?.[0]?.url ? (
             <img src={listing.images[0].url} alt="Property" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          ) : (
             <div className="w-full h-full flex items-center justify-center bg-gray-50"><Building2 className="w-12 h-12 text-gray-300" /></div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>

          <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 items-start">
            <div className="bg-white/90 text-gray-900 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 backdrop-blur-md">
              <LockKeyhole className="w-3 h-3 text-amber-500" /> Premium
            </div>
            {listing.rent_amount < 40000 && (
              <div className="bg-rose-500 text-white px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 backdrop-blur-md">
                <TrendingDown className="w-3 h-3" /> Trending
              </div>
            )}
          </div>
        </div>

        <Link href={`/marketplace?id=${listing.id}`} className="p-5 flex-1 flex flex-col bg-white hover:bg-gray-50/50 transition-colors">
          <h3 className="text-xl font-black text-gray-900 leading-tight mb-1 truncate">
            <span>Unit {listing.unit_number}</span>
            <span className="text-gray-300 font-normal mx-1.5">•</span>
            <span className="text-[#1f8898]">{listing.property?.name || 'Property'}</span>
          </h3>
          <p className="text-xs font-bold text-gray-500 flex items-center gap-1.5 mb-5 truncate">
            <MapPin className="w-3.5 h-3.5 text-[#1f8898]" /> {listing.property?.address || 'Location on request'}
          </p>
          <div className="flex gap-3 mb-6 text-xs font-bold text-gray-700 flex-wrap">
            <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded border border-gray-100"><Building2 className="w-3.5 h-3.5 text-gray-400" /> {listing.unit_type?.replace('_', ' ') || 'APARTMENT'}</div>
            {listing.bedrooms && <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded border border-gray-100"><BedDouble className="w-3.5 h-3.5 text-gray-400" /> {listing.bedrooms}</div>}
            {listing.bathrooms && <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded border border-gray-100"><Bath className="w-3.5 h-3.5 text-gray-400" /> {listing.bathrooms}</div>}
          </div>
          <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-[9px] uppercase tracking-widest font-black text-gray-400 mb-0.5">Monthly Rent</p>
              <h4 className="text-xl font-black text-[#1f8898] leading-none">KSh {Number(listing.rent_amount).toLocaleString()}</h4>
            </div>
            <div className="p-2 rounded-xl transition-all bg-gray-50 text-gray-400 group-hover:bg-[#1f8898] group-hover:text-white shadow-sm">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Link>
      </div>

      {galleryData && (
        <div className="fixed inset-0 z-[120] flex flex-col bg-black/95 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex justify-between items-center z-50">
            <div className="text-white font-black tracking-widest text-sm bg-white/10 px-4 py-1.5 rounded-full">{galleryData.currentIndex + 1} / {galleryData.images.length}</div>
            <button onClick={closeGallery} className="p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"><X className="w-6 h-6" /></button>
          </div>
          <div className="flex-1 flex items-center justify-center p-4">
            <img src={galleryData.images[galleryData.currentIndex].url} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" alt="Gallery" />
          </div>
          {galleryData.images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); setGalleryData({ ...galleryData, currentIndex: (galleryData.currentIndex - 1 + galleryData.images.length) % galleryData.images.length }); }} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 hover:bg-[#1f8898] text-white rounded-full transition-all"><ChevronLeft className="w-6 h-6" /></button>
              <button onClick={(e) => { e.stopPropagation(); setGalleryData({ ...galleryData, currentIndex: (galleryData.currentIndex + 1) % galleryData.images.length }); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 hover:bg-[#1f8898] text-white rounded-full transition-all"><ChevronRight className="w-6 h-6" /></button>
            </>
          )}
        </div>
      )}
    </>
  );
}