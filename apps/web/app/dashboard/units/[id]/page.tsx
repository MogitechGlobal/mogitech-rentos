// apps/web/app/dashboard/units/[id]/page.tsx
'use client';
export const runtime = 'edge';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Home, Globe, Loader2, DoorOpen } from 'lucide-react';
import UnitMarketplaceTab from '@/components/units/UnitMarketplaceTab';

export default function UnitDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const unitId = params.id;

  const [unit, setUnit] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'marketplace'>('overview');
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    const fetchUnitDetails = async () => {
      const storedToken = localStorage.getItem('access_token') || '';
      setToken(storedToken);

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/units/${unitId}`, {
          headers: { 'Authorization': `Bearer ${storedToken}` },
          credentials: 'include'
        });
        
        if (res.status === 401) return router.push('/login');
        if (!res.ok) throw new Error('Failed to load unit details.');
        
        const data = await res.json();
        setUnit(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (unitId) fetchUnitDetails();
  }, [unitId, router]);

  if (isLoading) return (
    <div className="min-h-screen bg-[#f8fafb] flex flex-col items-center justify-center text-[#1f8898] gap-4">
      <Loader2 className="w-10 h-10 animate-spin" />
    </div>
  );

  if (!unit) return <div className="p-8 text-center text-gray-500">Unit not found.</div>;

  return (
    <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans selection:bg-[#1f8898]/30">
      
      {/* Header Section */}
      <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-6 pt-6 pb-12 relative overflow-hidden shadow-inner">
        <div className="relative z-10 max-w-5xl mx-auto">
          <Link href={`/dashboard/properties/${unit.property_id}`} className="inline-flex items-center gap-1.5 text-teal-100 hover:text-white font-bold text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Property
          </Link>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white border border-white/20 backdrop-blur-sm shadow-lg">
              <DoorOpen className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-[#ffffff] tracking-tight mb-1">
                Unit {unit.unit_number}
              </h1>
              <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border ${
                  unit.status === 'VACANT' ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30' : 'bg-blue-500/20 text-blue-200 border-blue-500/30'
                }`}>
                  {unit.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-6 relative z-20">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex gap-2 mb-8 inline-flex">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'overview' ? 'bg-[#ebf3f5] text-[#1f8898]' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Home className="w-4 h-4" /> Overview
          </button>
          <button 
            onClick={() => setActiveTab('marketplace')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'marketplace' ? 'bg-[#ebf3f5] text-[#1f8898]' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Globe className="w-4 h-4" /> Marketplace Listing
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
              <h3 className="text-lg font-bold text-gray-900">Unit Overview</h3>
              <p className="text-gray-500 mt-2">Rent: KSH {Number(unit.rent_amount).toLocaleString()}</p>
              {/* You can move your tenant/lease details here in the future */}
            </div>
          )}

          {activeTab === 'marketplace' && (
            <UnitMarketplaceTab unit={unit} token={token} />
          )}
        </div>
      </div>
    </div>
  );
}