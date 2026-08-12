// apps/web/app/hunter/inquiries/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageSquare, MapPin, Clock, Loader2, Building2, AlertCircle, ArrowRight } from 'lucide-react';

export default function HunterInquiriesPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        // Reuse the dashboard endpoint since it already includes the inquiries array
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hunter/dashboard`, {
          credentials: 'include'
        });

        if (!res.ok) throw new Error('Failed to load your inquiries.');

        const json = await res.json();
        setInquiries(json.inquiries || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInquiries();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CONTACTED': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'VIEWED': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'CONVERTED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[600px]">
        <Loader2 className="w-10 h-10 animate-spin text-[#1f8898] mb-4" />
        <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Loading Inquiries...</p>
      </div>
    );
  }

  return (
    <div className="pb-12 max-w-5xl mx-auto px-4 sm:px-6 pt-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Viewing Requests</h1>
        <p className="text-gray-500 font-medium text-sm">Track the status of the messages you've sent to landlords.</p>
      </div>

      {error ? (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" /> <p className="font-bold">{error}</p>
        </div>
      ) : inquiries.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-10 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-black text-gray-900 mb-1">No requests sent yet</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            When you request to view a property on the marketplace, your message history and landlord response status will appear here.
          </p>
          <Link href="/marketplace" className="bg-[#1f8898] hover:bg-[#156a77] text-white px-6 py-3 rounded-xl font-bold shadow-md transition-colors active:scale-95">
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inq) => (
            <div key={inq.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all group">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-[#ebf3f5] rounded-xl flex items-center justify-center text-[#1f8898] shrink-0 border border-[#1f8898]/20">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900 group-hover:text-[#1f8898] transition-colors">
                      {inq.unit?.property?.name || 'Unknown Property'}
                    </h3>
                    <p className="text-xs font-bold text-gray-500 mb-1">Unit {inq.unit?.unit_number}</p>
                    <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase tracking-widest">
                      <Clock className="w-3 h-3" /> {new Date(inq.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusColor(inq.status)}`}>
                  {inq.status}
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 relative">
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Your Message</p>
                <p className="text-sm font-medium text-gray-700 italic">"{inq.message}"</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}