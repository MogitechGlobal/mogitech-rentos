// apps/web/app/dashboard/marketplace/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Globe, Home, Search, Loader2, Building2, CheckCircle2, 
  XCircle, Edit, Lock, ChevronDown, AlertCircle
} from 'lucide-react';

export default function LandlordMarketplace() {
  const router = useRouter();
  const [vacantUnits, setVacantUnits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtering States
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('ALL');

  useEffect(() => {
    fetchVacantUnits();
  }, []);

  const fetchVacantUnits = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties`, {
        credentials: 'include'
      });
      
      if (res.status === 401) return router.push('/login');
      if (!res.ok) throw new Error('Failed to load properties');
      
      const properties = await res.json();
      
      // Flatten all units from all properties and filter ONLY VACANT ones
      const extractedVacantUnits = properties.flatMap((prop: any) => 
        prop.units
          .filter((unit: any) => unit.status === 'VACANT')
          .map((unit: any) => ({ ...unit, property: prop }))
      );

      setVacantUnits(extractedVacantUnits);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePublish = async (unit: any, newStatus: boolean) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/units/${unit.id}/listing`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_listed: newStatus })
      });

      if (!res.ok) throw new Error('Failed to update status');
      
      setVacantUnits(prev => prev.map(u => u.id === unit.id ? { ...u, is_listed: newStatus } : u));
    } catch (error) {
      alert("Error updating listing status.");
    }
  };

  // Helper to determine if a unit has the minimum required data to be published
  const isUnitConfigured = (unit: any) => {
    return !!unit.public_description && unit.public_description.trim().length > 0;
  };

  // Extract unique properties for the filter dropdown
  const uniqueProperties = Array.from(new Set(vacantUnits.map(u => u.property?.name))).filter(Boolean);

  // Apply Search and Property filters
  const filteredUnits = vacantUnits.filter(unit => {
    const matchesSearch = `${unit.unit_number} ${unit.property?.name}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProperty = propertyFilter === 'ALL' || unit.property?.name === propertyFilter;
    return matchesSearch && matchesProperty;
  });

  return (
    <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans overflow-x-hidden">
      
      {/* --- MINIMIZED HERO SECTION --- */}
      <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-4 sm:px-6 pt-6 pb-12 sm:pb-16 relative overflow-hidden shadow-inner">
        <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-100 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-2 sm:mb-3 border border-white/20">
                <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Public Marketplace
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-[#ffffff] tracking-tight mb-1 sm:mb-2">
              Listing Manager
            </h1>
            <p className="text-teal-100 text-xs sm:text-sm font-medium max-w-xl leading-relaxed">
              Publish your vacant units to the marketplace. Units must be configured with a description before publishing.
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 relative z-20 -mt-6 sm:-mt-8">
        
        {/* --- MOBILE RESPONSIVE TOOLBAR --- */}
        <div className="bg-white p-2.5 sm:p-3 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            
            <div className="relative w-full sm:max-w-md flex items-center group">
                <Search className="absolute left-3.5 w-4 h-4 text-gray-400 group-focus-within:text-[#1f8898] transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search unit or property..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-50 hover:bg-gray-100 focus:bg-white border border-transparent focus:border-[#1f8898]/20 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-gray-900 outline-none transition-all"
                />
            </div>

            <div className="relative w-full sm:w-auto shrink-0">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select 
                    value={propertyFilter}
                    onChange={(e) => setPropertyFilter(e.target.value)}
                    className="w-full sm:w-auto appearance-none bg-gray-50 hover:bg-gray-100 border border-transparent focus:border-[#1f8898]/20 rounded-xl pl-10 pr-10 py-2.5 text-sm font-bold text-gray-700 outline-none cursor-pointer transition-all"
                >
                    <option value="ALL">All Properties</option>
                    {uniqueProperties.map(prop => (
                        <option key={prop as string} value={prop as string}>{prop as string}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
        </div>

        {/* --- CONTENT GRID --- */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin text-[#1f8898]" />
            <p className="text-sm font-bold text-gray-400 mt-4 uppercase tracking-widest">Finding Vacant Units...</p>
          </div>
        ) : filteredUnits.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-dashed border-gray-200 p-10 sm:p-12 text-center shadow-sm max-w-2xl mx-auto">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#ebf3f5] rounded-3xl flex items-center justify-center mx-auto mb-5 text-[#1f8898]">
              <Home className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2">No Vacant Units</h3>
            <p className="text-sm sm:text-base text-gray-500 font-medium">
                {searchQuery || propertyFilter !== 'ALL' 
                    ? "No units match your current filter criteria."
                    : "All your units are currently occupied. Great job!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
            {filteredUnits.map((unit) => {
              const configured = isUnitConfigured(unit);
              
              return (
              <div key={unit.id} className="bg-white rounded-[1.5rem] sm:rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative group">
                
                {/* Publish Status Indicator Line */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 transition-colors duration-500 ${
                    unit.is_listed ? 'bg-blue-400' : 'bg-gray-200'
                }`}></div>

                <div className="p-5 sm:p-6 border-b border-gray-50 flex justify-between items-start pt-6 sm:pt-7">
                  <div>
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[9px] sm:text-[10px] font-black uppercase tracking-wider">Vacant</span>
                        {unit.is_listed && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-[9px] sm:text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm"><Globe className="w-3 h-3"/> Published</span>}
                    </div>
                    <h3 className="font-black text-lg sm:text-xl text-gray-900 group-hover:text-[#1f8898] transition-colors truncate">Unit {unit.unit_number}</h3>
                    <p className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-1.5 mt-1 truncate">
                      <Building2 className="w-3.5 h-3.5 text-[#1f8898] shrink-0" /> {unit.property.name}
                    </p>
                  </div>
                  <div className="text-right">
                      <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Monthly</p>
                      <h4 className="text-lg sm:text-xl font-black text-[#1f8898] whitespace-nowrap">KSH {unit.rent_amount.toLocaleString()}</h4>
                  </div>
                </div>

                <div className="p-5 sm:p-6 flex-1 bg-gray-50/50 flex flex-col justify-center">
                    {!configured && (
                        <div className="bg-amber-50 text-amber-700 p-3 rounded-xl flex items-start gap-2 mb-4 border border-amber-100/50">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <p className="text-xs font-bold leading-tight">Needs configuration before it can be published.</p>
                        </div>
                    )}
                    
                    <p className="text-xs sm:text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                        {unit.public_description || <span className="italic text-gray-400">No public description set.</span>}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mt-auto">
                        {unit.bedrooms && <span className="text-[10px] font-bold bg-white border border-gray-200 px-2 py-1 rounded-lg text-gray-600">{unit.bedrooms} Bed</span>}
                        {unit.bathrooms && <span className="text-[10px] font-bold bg-white border border-gray-200 px-2 py-1 rounded-lg text-gray-600">{unit.bathrooms} Bath</span>}
                        {unit.unit_type && <span className="text-[10px] font-bold bg-white border border-gray-200 px-2 py-1 rounded-lg text-gray-600">{unit.unit_type}</span>}
                    </div>
                </div>

                {/* --- ACTION BUTTONS --- */}
                <div className="p-3 sm:p-4 border-t border-gray-50 bg-white flex gap-2 sm:gap-3">
                  <button 
                    onClick={() => configured ? handleTogglePublish(unit, !unit.is_listed) : null}
                    disabled={!configured}
                    className={`flex-1 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
                        unit.is_listed 
                        ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 shadow-sm border border-rose-100/50' 
                        : configured
                          ? 'bg-[#ebf3f5] text-[#1f8898] hover:bg-[#1f8898] hover:text-white shadow-sm border border-[#1f8898]/10'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                    }`}
                  >
                    {unit.is_listed ? <><XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4"/> Unpublish</> : 
                     !configured ? <><Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4"/> Publish</> : 
                     <><CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4"/> Publish</>}
                  </button>
                  
                  {/* Redirects to the Unit Details page where the Marketplace Tab exists */}
                  <button 
                    onClick={() => router.push(`/dashboard/units/${unit.id}`)}
                    className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 sm:gap-2 shadow-md hover:shadow-lg active:scale-95"
                  >
                    <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Configure
                  </button>
                </div>
              </div>
            )})}
          </div>
        )}
      </main>
    </div>
  );
}