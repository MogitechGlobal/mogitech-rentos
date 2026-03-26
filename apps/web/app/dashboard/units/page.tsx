// apps/web/app/dashboard/units/page.tsx
/* eslint-disable */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  DoorOpen, CheckCircle2, Home, Search, Layers, 
  Wallet, Users, Key, AlertCircle, ArrowRight, Loader2
} from 'lucide-react';

export default function MasterUnitsPage() {
  const router = useRouter();
  const [units, setUnits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Advanced UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    const fetchUnits = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return router.push('/login');
      
      try {
        const res = await fetch('http://localhost:3000/api/v1/properties', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        
        const properties = await res.json();
        
        // Extract and flatten all units from properties
        if (Array.isArray(properties)) {
          const allUnits = properties.flatMap((p: any) => 
            (Array.isArray(p.units) ? p.units : []).map((u: any) => ({ ...u, propertyName: p.name }))
          );
          setUnits(allUnits);
        } else if (properties && Array.isArray(properties.data)) {
          const allUnits = properties.data.flatMap((p: any) => 
            (Array.isArray(p.units) ? p.units : []).map((u: any) => ({ ...u, propertyName: p.name }))
          );
          setUnits(allUnits);
        } else {
          setUnits([]);
        }
      } catch (err) { 
        console.error('Failed to fetch units:', err); 
        setUnits([]); 
      } finally { 
        setIsLoading(false); 
      }
    };
    
    fetchUnits();
  }, [router]);

  // --- Filtering Logic ---
  const filteredUnits = units.filter(unit => {
    const matchesSearch = 
      unit.unit_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.propertyName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'ALL' || unit.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // --- Analytics Calculations ---
  const totalUnits = units.length;
  const vacantUnits = units.filter(u => u.status === 'VACANT').length;
  const occupiedUnits = units.filter(u => u.status === 'OCCUPIED').length;
  const maintenanceUnits = units.filter(u => u.status === 'MAINTENANCE').length;
  
  // Total Potential Rent Value
  const totalPotentialRent = units.reduce((sum, u) => sum + Number(u.rent_amount), 0);
  const occupancyRate = totalUnits === 0 ? 0 : Math.round((occupiedUnits / totalUnits) * 100);

  // Helper for Pill Styling
  const getFilterPillClass = (status: string) => {
    const isActive = filterStatus === status;
    return `px-5 py-2 rounded-full text-sm font-bold transition-all ${
      isActive 
        ? 'bg-[#1f8898] text-white shadow-md' 
        : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
    }`;
  };

  return (
    <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans selection:bg-[#1f8898]/30 overflow-x-hidden">
      
      {/* --- Scaled-Down Gradient Hero Area --- */}
      <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-6 pt-8 pb-14 md:pt-10 md:pb-16 relative overflow-hidden shadow-inner">
        <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-100 text-xs font-bold uppercase tracking-widest mb-3 border border-white/20 backdrop-blur-sm">
                <Layers className="w-3.5 h-3.5" /> Inventory Control
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[#ffffff] tracking-tight mb-2">
              Master Units List
            </h1>
            <p className="text-teal-100 text-sm md:text-base font-medium max-w-xl leading-relaxed">
              A global, cross-property view of every lettable asset in your portfolio.
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 md:-mt-10 relative z-20">
        
        {/* --- Bento Box Analytics Grid --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          
          {/* Potential Value */}
          <div className="bg-[#ffffff] p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 text-right leading-tight">Monthly<br/>Value</span>
            </div>
            <div className="relative z-10">
              <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">KSH {totalPotentialRent.toLocaleString()}</h4>
              <p className="text-xs text-gray-500 font-medium mt-1">Total potential rent</p>
            </div>
          </div>

          {/* Occupied */}
          <div className="bg-[#ffffff] p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#ebf3f5] rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-[#ebf3f5] flex items-center justify-center text-[#1f8898] border border-[#1f8898]/20">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#1f8898] text-right leading-tight">Occupied<br/>Units</span>
            </div>
            <div className="relative z-10">
              <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">{occupiedUnits}</h4>
              <p className="text-xs text-gray-500 font-medium mt-1">{occupancyRate}% of portfolio</p>
            </div>
          </div>

          {/* Vacant */}
          <div className="bg-[#ffffff] p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                <Key className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 text-right leading-tight">Available<br/>To Let</span>
            </div>
            <div className="relative z-10">
              <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">{vacantUnits}</h4>
              <p className="text-xs text-gray-500 font-medium mt-1">Ready for tenants</p>
            </div>
          </div>

          {/* Total Units */}
          <div className="bg-[#ffffff] p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600 border border-gray-100">
                <DoorOpen className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Total</span>
            </div>
            <div>
              <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">{totalUnits}</h4>
              <p className="text-xs text-gray-500 font-medium mt-1">Across all properties</p>
            </div>
          </div>
        </div>

        {/* --- Data Table with Filters --- */}
        <div className="bg-[#ffffff] rounded-3xl shadow-lg shadow-black/5 border border-gray-100 overflow-hidden mb-12">
          
          {/* Filtering Toolbar */}
          <div className="p-5 border-b border-gray-100 bg-[#f8fafb]/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setFilterStatus('ALL')} className={getFilterPillClass('ALL')}>All Units</button>
              <button onClick={() => setFilterStatus('VACANT')} className={getFilterPillClass('VACANT')}>Vacant</button>
              <button onClick={() => setFilterStatus('OCCUPIED')} className={getFilterPillClass('OCCUPIED')}>Occupied</button>
              {maintenanceUnits > 0 && (
                <button onClick={() => setFilterStatus('MAINTENANCE')} className={getFilterPillClass('MAINTENANCE')}>Maintenance</button>
              )}
            </div>

            <div className="relative w-full lg:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input 
                type="text" placeholder="Search unit no or property..." 
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all bg-[#ffffff]"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* The Table */}
          <div className="overflow-x-auto min-h-[400px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 text-[#1f8898] gap-4">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="font-bold text-sm uppercase tracking-widest text-gray-400">Loading units...</span>
              </div>
            ) : (
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-gray-100 bg-[#ffffff] text-[10px] uppercase tracking-widest text-gray-400 font-black">
                    <th className="px-6 py-4 pl-8">Unit Details</th>
                    <th className="px-6 py-4">Location / Property</th>
                    <th className="px-6 py-4 text-right">Rent Amount</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right pr-8">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-[#ffffff]">
                  {filteredUnits.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <div className="w-16 h-16 bg-[#ebf3f5] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#1f8898]">
                          <DoorOpen className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No units found</h3>
                        <p className="text-sm text-gray-500 font-medium">No units match your current search and filter settings.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUnits.map((unit) => (
                      <tr key={unit.id} className="hover:bg-gray-50/50 transition duration-150 group">
                        <td className="px-6 py-4 pl-8">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#ebf3f5] text-[#1f8898] flex items-center justify-center font-bold shadow-sm border border-[#1f8898]/10 group-hover:bg-[#1f8898] group-hover:text-white transition-colors">
                              <DoorOpen className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-black text-gray-900 text-base">{unit.unit_number}</span>
                              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-0.5">Asset ID: {unit.id.substring(0, 6)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-900 font-bold group-hover:text-[#1f8898] transition-colors">
                            <Home className="w-4 h-4 text-gray-400 group-hover:text-[#1f8898]" />
                            {unit.propertyName}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-black text-gray-900">KSH {Number(unit.rent_amount).toLocaleString()}</span>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-0.5">Per Month</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center">
                            <span className={`px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1.5 w-max border ${
                              unit.status === 'VACANT' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : unit.status === 'OCCUPIED'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {unit.status === 'VACANT' && <CheckCircle2 className="w-3.5 h-3.5" />}
                              {unit.status === 'OCCUPIED' && <Users className="w-3.5 h-3.5" />}
                              {unit.status === 'MAINTENANCE' && <AlertCircle className="w-3.5 h-3.5" />}
                              {unit.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 pr-8 text-right">
                          <Link 
                            href={`/dashboard/properties/${unit.property_id}`}
                            className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 font-bold px-4 py-2 rounded-xl hover:border-[#1f8898] hover:text-[#1f8898] transition-all text-xs active:scale-95 shadow-sm group/btn"
                          >
                            Manage <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
          
        </div>
      </main>
    </div>
  );
}