// apps/web/app/hunter/unlocked/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LockOpen, MapPin, Phone, MessageCircle, Loader2, Search, CheckCircle2 } from 'lucide-react';

export default function HunterUnlockedPage() {
  const [unlocked, setUnlocked] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUnlocked = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hunter/dashboard`, {
          credentials: 'include'
        });
        if (res.ok) {
          const json = await res.json();
          setUnlocked(json.unlocked_properties || []);
        }
      } catch (error) {
        console.error("Failed to load unlocked properties");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUnlocked();
  }, []);

  const getWhatsAppLink = (phone: string, unitStr: string) => {
    let cleanPhone = phone?.replace(/\D/g, '') || '';
    if (cleanPhone.startsWith('0')) cleanPhone = '254' + cleanPhone.substring(1);
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hi, I unlocked your listing for ${unitStr} on MogiRentOS.`)}`;
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[600px]">
        <Loader2 className="w-10 h-10 animate-spin text-[#1f8898] mb-4" />
      </div>
    );
  }

  return (
    <div className="pb-12 max-w-5xl mx-auto px-4 sm:px-6 pt-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Unlocked Contacts</h1>
        <p className="text-gray-500 font-medium text-sm">Direct contact details and exact locations for your premium unlocks.</p>
      </div>

      {unlocked.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-10 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4">
            <LockOpen className="w-8 h-8 text-amber-500" />
          </div>
          <h3 className="text-lg font-black text-gray-900 mb-1">No unlocked properties yet</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">Pay Ksh. 300 on any premium marketplace listing to permanently unlock the landlord's contact details here.</p>
          <Link href="/marketplace" className="bg-[#1f8898] text-white px-6 py-3 rounded-xl font-bold shadow-md">
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {unlocked.map((item: any) => (
            <div key={item.id} className="bg-white rounded-3xl border border-amber-100 shadow-sm p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-50 text-amber-600 px-4 py-1.5 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest border-b border-l border-amber-100 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Unlocked
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-1 pr-20">{item.property.name}</h3>
              <p className="text-sm font-bold text-gray-500 mb-4">Unit {item.unit.unit_number}</p>
              
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-[#1f8898] shrink-0"><MapPin className="w-4 h-4" /></div>
                  <p className="text-sm font-bold text-gray-700 leading-tight">
                    <a href={`https://www.google.com/maps/search/?api=1&query=${item.property.latitude},${item.property.longitude}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#1f8898] hover:underline">View Exact Location on Map</a>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-[#1f8898] shrink-0"><Phone className="w-4 h-4" /></div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Landlord Contact</p>
                    <p className="text-sm font-bold text-gray-900">{item.property.landlord.contact_phone}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <a href={`tel:${item.property.landlord.contact_phone}`} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"><Phone className="w-4 h-4" /> Call</a>
                <a href={getWhatsAppLink(item.property.landlord.contact_phone, `Unit ${item.unit.unit_number} at ${item.property.name}`)} target="_blank" rel="noopener noreferrer" className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"><MessageCircle className="w-4 h-4" /> WhatsApp</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}