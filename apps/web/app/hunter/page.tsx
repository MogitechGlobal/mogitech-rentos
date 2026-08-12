// apps/web/app/hunter/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Building2, MapPin, Phone, MessageCircle, Heart, 
  LockOpen, MessageSquare, ArrowRight, Loader2, Search, CheckCircle2
} from 'lucide-react';

export default function HunterDashboard() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHunterData = async () => {
      try {
        // Assume you create a backend endpoint that aggregates the hunter's activity
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hunter/dashboard`, {
          credentials: 'include'
        });

        if (!res.ok) {
          throw new Error('Failed to load your dashboard data.');
        }

        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHunterData();
  }, []);

  const getWhatsAppLink = (phone: string, unitStr: string) => {
    let cleanPhone = phone?.replace(/\D/g, '') || '';
    if (cleanPhone.startsWith('0')) cleanPhone = '254' + cleanPhone.substring(1);
    const message = `Hi, I unlocked your listing for ${unitStr} on MogiRentOS and would like to schedule a viewing.`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[600px]">
        <Loader2 className="w-10 h-10 animate-spin text-[#1f8898] mb-4" />
        <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Loading Your Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 m-6 bg-rose-50 border border-rose-200 rounded-3xl flex flex-col items-center justify-center text-center gap-3 shadow-sm">
        <p className="font-black text-rose-900 text-xl tracking-tight">Oops!</p>
        <p className="text-sm font-medium text-rose-700">{error}</p>
      </div>
    );
  }

  // Mock fallbacks if backend array is empty
  const unlocked = data?.unlocked_properties || [];
  const favorites = data?.favorites || [];
  const inquiries = data?.inquiries || [];

  return (
    <div className="pb-12">
      {/* --- HERO AREA --- */}
      <div className="bg-gradient-to-br from-[#0d393f] to-[#1f8898] px-6 sm:px-10 pt-10 pb-20 relative overflow-hidden shadow-inner">
        <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-teal-100 text-[10px] font-black uppercase tracking-widest mb-4 border border-white/20 backdrop-blur-sm">
             House Hunter Profile
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#ffffff] tracking-tight mb-2">
            Welcome back, {data?.user?.first_name || 'Hunter'}!
          </h1>
          <p className="text-teal-50 text-sm font-medium max-w-xl">
            Keep track of the premium contacts you've unlocked, review your favorite listings, and manage your viewing requests.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-10 relative z-20 space-y-8">
        
        {/* --- METRICS GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 group hover:-translate-y-1 transition-transform">
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-100 shrink-0 group-hover:scale-110 transition-transform">
              <LockOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">{unlocked.length}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-0.5">Unlocked Contacts</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 group hover:-translate-y-1 transition-transform">
            <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 border border-rose-100 shrink-0 group-hover:scale-110 transition-transform">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">{favorites.length}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-0.5">Saved Favorites</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 group hover:-translate-y-1 transition-transform">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-100 shrink-0 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">{inquiries.length}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-0.5">Viewing Requests</p>
            </div>
          </div>
        </div>

        {/* --- PREMIUM UNLOCKED PROPERTIES --- */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <LockOpen className="w-5 h-5 text-amber-500" /> Premium Unlocked Contacts
            </h2>
            <Link href="/marketplace" className="text-sm font-bold text-[#1f8898] hover:underline flex items-center gap-1">
              Find more <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {unlocked.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-10 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-1">No unlocked properties yet</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                When you pay Ksh. 300 to unlock a property on the marketplace, the landlord's direct contact details and exact location will be permanently saved here.
              </p>
              <Link href="/marketplace" className="bg-[#1f8898] hover:bg-[#156a77] text-white px-6 py-3 rounded-xl font-bold shadow-md transition-colors active:scale-95">
                Browse Marketplace
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unlocked.map((item: any) => (
                <div key={item.id} className="bg-white rounded-3xl border border-amber-100 shadow-sm p-6 relative overflow-hidden group hover:shadow-md transition-all">
                  <div className="absolute top-0 right-0 bg-amber-50 text-amber-600 px-4 py-1.5 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest border-b border-l border-amber-100 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Unlocked
                  </div>

                  <h3 className="text-xl font-black text-gray-900 mb-1 pr-20">{item.property.name}</h3>
                  <p className="text-sm font-bold text-gray-500 mb-4">Unit {item.unit.unit_number}</p>

                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-[#1f8898] shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-bold text-gray-700 leading-tight">
                        <a href={`https://www.google.com/maps/search/?api=1&query=${item.property.latitude},${item.property.longitude}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#1f8898] hover:underline">
                          View Exact Location on Map
                        </a>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-[#1f8898] shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Landlord Contact</p>
                        <p className="text-sm font-bold text-gray-900">{item.property.landlord.contact_phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <a href={`tel:${item.property.landlord.contact_phone}`} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm">
                      <Phone className="w-4 h-4" /> Call
                    </a>
                    <a href={getWhatsAppLink(item.property.landlord.contact_phone, `Unit ${item.unit.unit_number} at ${item.property.name}`)} target="_blank" rel="noopener noreferrer" className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm text-sm">
                      <MessageCircle className="w-4 h-4" /> WhatsApp
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}