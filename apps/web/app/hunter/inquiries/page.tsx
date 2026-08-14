// apps/web/app/hunter/inquiries/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  MessageSquare, MapPin, Clock, Loader2, Building2, 
  AlertCircle, ArrowRight, ExternalLink, Phone, MessageCircle, 
  CheckCircle2, LockKeyhole, FileText, Search, Calendar, 
  Star, ChevronRight, Copy, Check, Activity, Unlock
} from 'lucide-react';
import { toast } from 'sonner';

interface Inquiry {
  id: string;
  unit_id: string;
  status: 'NEW' | 'CONTACTED' | 'VIEWED' | 'CONVERTED' | 'ARCHIVED';
  message: string;
  created_at: string;
  updated_at: string;
  unit: any;
}

export default function HunterInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [unlockedUnits, setUnlockedUnits] = useState<Record<string, any>>({});
  const [shortlistIds, setShortlistIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'NEW' | 'CONTACTED' | 'VIEWED' | 'CONVERTED' | 'ARCHIVED'>('ACTIVE');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'OLDEST' | 'UPDATED'>('UPDATED');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashRes, shortlistRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/hunter/dashboard`, { credentials: 'include' }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/hunter/shortlist`, { credentials: 'include' }).catch(() => null)
        ]);

        if (!dashRes.ok) throw new Error('Failed to load your pipeline data.');

        const json = await dashRes.json();
        setInquiries(json.inquiries || []);

        // Map unlocked properties for quick lookup O(1)
        const unlockedMap: Record<string, any> = {};
        if (json.unlocked_properties) {
          json.unlocked_properties.forEach((up: any) => {
            unlockedMap[up.unit.id] = up;
          });
        }
        setUnlockedUnits(unlockedMap);

        // Load shortlist
        if (shortlistRes && shortlistRes.ok) {
          const slJson = await shortlistRes.json();
          setShortlistIds(new Set(slJson.map((sl: any) => sl.unit_id)));
        } else {
          const localShorts = JSON.parse(localStorage.getItem('mogi_shortlist_ids') || '[]');
          setShortlistIds(new Set(localShorts));
        }

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // --- ACTIONS ---

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Number copied to clipboard!');
  };

  const toggleShortlist = async (e: React.MouseEvent, unitId: string) => {
    e.preventDefault(); e.stopPropagation();
    const isCurrentlyShortlisted = shortlistIds.has(unitId);

    try {
      const newShortlist = new Set(shortlistIds);
      if (isCurrentlyShortlisted) {
        newShortlist.delete(unitId);
        toast.success('Removed from shortlist');
      } else {
        newShortlist.add(unitId);
        toast.success('Added to shortlist!');
      }
      setShortlistIds(newShortlist);
      localStorage.setItem('mogi_shortlist_ids', JSON.stringify(Array.from(newShortlist)));
      
      // API call placeholder for persistent shortlisting
      const method = isCurrentlyShortlisted ? 'DELETE' : 'POST';
      const endpoint = isCurrentlyShortlisted ? `/hunter/shortlist/${unitId}` : `/hunter/shortlist`;
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: !isCurrentlyShortlisted ? JSON.stringify({ unit_id: unitId }) : undefined
      }).catch(() => {});
    } catch (err) {
      toast.error('Could not update shortlist.');
    }
  };

  const getWhatsAppLink = (phone: string, unitStr: string, propName: string) => {
    let cleanPhone = phone?.replace(/\D/g, '') || '';
    if (cleanPhone.startsWith('0')) cleanPhone = '254' + cleanPhone.substring(1);
    const message = `Hi, I sent a viewing request for Unit ${unitStr} at ${propName} via MogiRentOS and would like to follow up.`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  // --- PIPELINE & DATA MAPPING ---

  const getPipelineStage = (status: Inquiry['status']) => {
    switch (status) {
      case 'NEW': return 1; // Request Sent / Awaiting Review
      case 'CONTACTED': return 2; // Landlord Reviewed / Discussion
      case 'VIEWED': return 3; // Property Viewed
      case 'CONVERTED': return 4; // Rented / Converted
      default: return 0;
    }
  };

  const filteredAndSortedInquiries = useMemo(() => {
    let filtered = inquiries.filter(inq => {
      // Apply Search Filter
      const searchStr = `${inq.unit?.property?.name} ${inq.unit?.property?.address} ${inq.unit?.unit_number}`.toLowerCase();
      if (searchTerm && !searchStr.includes(searchTerm.toLowerCase())) return false;
      
      // Apply Status Filter
      if (filterStatus === 'ALL') return true;
      if (filterStatus === 'ACTIVE') return ['NEW', 'CONTACTED', 'VIEWED'].includes(inq.status);
      if (filterStatus === 'NEW') return inq.status === 'NEW';
      if (filterStatus === 'CONTACTED') return inq.status === 'CONTACTED';
      if (filterStatus === 'VIEWED') return inq.status === 'VIEWED';
      if (filterStatus === 'CONVERTED') return inq.status === 'CONVERTED';
      if (filterStatus === 'ARCHIVED') return inq.status === 'ARCHIVED';
      return true;
    });

    // Apply Sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'NEWEST': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'OLDEST': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'UPDATED':
        default: return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
      }
    });
  }, [inquiries, searchTerm, filterStatus, sortBy]);

  // --- METRICS ---
  const stats = {
    total: inquiries.length,
    active: inquiries.filter(i => ['NEW', 'CONTACTED', 'VIEWED'].includes(i.status)).length,
    awaiting: inquiries.filter(i => i.status === 'NEW').length,
    inDiscussion: inquiries.filter(i => i.status === 'CONTACTED').length,
    converted: inquiries.filter(i => i.status === 'CONVERTED').length,
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[600px]">
        <Loader2 className="w-10 h-10 animate-spin text-[#1f8898] mb-4" />
        <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Loading Pipeline...</p>
      </div>
    );
  }

  return (
    <div className="pb-16 bg-[#f8fafb] min-h-screen font-sans selection:bg-[#1f8898]/30">
      
      {/* --- PREMIUM HEADER --- */}
      <div className="bg-[#0d393f] px-6 sm:px-10 pt-8 pb-24 relative overflow-hidden shadow-inner border-b border-[#0a2c31]">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500 rounded-full blur-[120px] opacity-10 -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-blue-100 text-[10px] font-black uppercase tracking-widest mb-4 border border-white/20 backdrop-blur-sm shadow-sm">
              <MessageSquare className="w-3.5 h-3.5" /> Pipeline Workspace
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[#ffffff] tracking-tight mb-2">
              Viewing Requests
            </h1>
            <p className="text-teal-50/80 text-sm md:text-base font-medium max-w-xl">
              Track the progress of your inquiries from initial contact to successful shortlisting. Stay on top of landlord responses.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-3">
            <Link href="/marketplace" className="bg-[#1f8898] hover:bg-[#48c9dc] text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-black/20 flex items-center gap-2 active:scale-95">
              <Search className="w-4 h-4" /> Discover Properties
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-12 relative z-20 space-y-6">
        
        {/* --- STATS OVERVIEW --- */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500 shrink-0"><FileText className="w-4 h-4" /></div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none mb-1">{stats.total}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Total Sent</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm flex items-center gap-3 ring-1 ring-blue-50">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 shrink-0"><Activity className="w-4 h-4" /></div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none mb-1">{stats.active}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-blue-600">Active Requests</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 shrink-0"><Clock className="w-4 h-4" /></div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none mb-1">{stats.awaiting}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Awaiting Reply</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 shrink-0"><Calendar className="w-4 h-4" /></div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none mb-1">{stats.inDiscussion}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">In Discussion</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 shrink-0"><CheckCircle2 className="w-4 h-4" /></div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none mb-1">{stats.converted}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Successful</p>
            </div>
          </div>
        </div>

        {/* --- SEARCH & FILTERS --- */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#1f8898] transition-colors" />
            <input 
              type="text" placeholder="Search by property, unit, or location..." 
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-11 pr-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all"
            />
          </div>
          <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
            <div className="relative shrink-0">
              <select 
                value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} 
                className="appearance-none bg-white border border-gray-200 pl-4 pr-10 py-3 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-[#1f8898] cursor-pointer hover:bg-gray-50 transition-all"
              >
                <option value="ALL">All Requests</option>
                <option value="ACTIVE">Active Pipeline</option>
                <option value="NEW">Awaiting Response</option>
                <option value="CONTACTED">In Discussion</option>
                <option value="VIEWED">Viewed</option>
                <option value="CONVERTED">Successful</option>
              </select>
            </div>
            <div className="relative shrink-0">
              <select 
                value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} 
                className="appearance-none bg-white border border-gray-200 px-4 pr-10 py-3 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-[#1f8898] cursor-pointer hover:bg-gray-50 transition-all"
              >
                <option value="UPDATED">Recently Updated</option>
                <option value="NEWEST">Newest First</option>
                <option value="OLDEST">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* --- INQUIRY PIPELINE LIST --- */}
        {error ? (
          <div className="p-4 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-3">
            <AlertCircle className="w-5 h-5" /> <p className="font-bold">{error}</p>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-dashed border-gray-200 p-12 text-center flex flex-col items-center shadow-sm">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-5">
              <MessageSquare className="w-10 h-10 text-blue-400" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">No viewing requests sent</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-6 leading-relaxed">
              When you request to view a property on the marketplace, your pipeline status and landlord responses will track here automatically.
            </p>
            <Link href="/marketplace" className="bg-[#1f8898] hover:bg-[#156a77] text-white px-8 py-3.5 rounded-xl font-bold shadow-md transition-colors active:scale-95">
              Explore Marketplace
            </Link>
          </div>
        ) : filteredAndSortedInquiries.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-black text-gray-900 mb-1">No matches found</h3>
            <p className="text-sm text-gray-500 mb-4">Adjust your search or filters to see your requests.</p>
            <button onClick={() => { setSearchTerm(''); setFilterStatus('ACTIVE'); }} className="text-[#1f8898] font-bold text-sm hover:underline">Reset Filters</button>
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            {filteredAndSortedInquiries.map((inq) => {
              const isUnlocked = !!unlockedUnits[inq.unit_id];
              const unlockData = unlockedUnits[inq.unit_id];
              const propertyName = isUnlocked ? (unlockData.exact_name || inq.unit?.property?.name) : (inq.unit?.property?.name || 'Premium Listing');
              const currentStage = getPipelineStage(inq.status);
              const imgUrl = inq.unit?.images?.[0]?.url || inq.unit?.property?.images?.[0]?.url;
              const hasUpdate = inq.updated_at && new Date(inq.updated_at).getTime() > new Date(inq.created_at).getTime();

              return (
                <div key={inq.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col xl:flex-row group hover:shadow-xl hover:border-[#1f8898]/30 transition-all duration-300">
                  
                  {/* LEFT: Property Snapshot */}
                  <div className="xl:w-[350px] shrink-0 border-b xl:border-b-0 xl:border-r border-gray-100 relative bg-gray-50/50">
                    <div className="h-48 relative bg-gray-100 overflow-hidden">
                      {imgUrl ? (
                        <img src={imgUrl} alt="Property" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1f8898]/10 to-[#0d393f]/10">
                          <Building2 className="w-12 h-12 text-[#1f8898]/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
                      
                      <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                        {isUnlocked ? (
                          <div className="bg-emerald-500 text-white px-2 py-1 rounded border border-emerald-400 text-[9px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 w-fit backdrop-blur-md">
                            <Unlock className="w-3 h-3" /> Unlocked
                          </div>
                        ) : (
                          <div className="bg-white/90 text-gray-900 px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 w-fit backdrop-blur-md">
                            <LockKeyhole className="w-3 h-3 text-amber-500" /> Protected
                          </div>
                        )}
                      </div>

                      <div className="absolute bottom-4 left-4 right-4 z-10">
                        <h3 className="text-xl font-black text-white truncate drop-shadow-md">
                          Unit {inq.unit?.unit_number}
                        </h3>
                        <p className="text-xs font-bold text-gray-200 truncate mt-0.5 drop-shadow-md">
                          {propertyName}
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-5 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-500 flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-[#1f8898]" /> {inq.unit?.property?.address} Area
                        </p>
                        <span className="font-black text-[#1f8898] text-sm">KSh {Number(inq.unit?.rent_amount || 0).toLocaleString()}</span>
                      </div>
                      
                      <div className="flex gap-2">
                         <Link href={`/marketplace?id=${inq.unit_id}`} className="flex-1 py-2 bg-white border border-gray-200 hover:border-[#1f8898] hover:text-[#1f8898] rounded-xl text-xs font-bold text-gray-600 transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                           <ExternalLink className="w-3 h-3" /> Listing
                         </Link>
                         <button onClick={(e) => toggleShortlist(e, inq.unit_id)} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm border ${shortlistIds.has(inq.unit_id) ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                           <Star className={`w-3.5 h-3.5 ${shortlistIds.has(inq.unit_id) ? 'fill-amber-500 text-amber-500' : ''}`} /> Shortlist
                         </button>
                      </div>
                    </div>
                  </div>

                  {/* MIDDLE: Pipeline & Message */}
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    
                    {/* Visual Journey Pipeline */}
                    <div className="mb-6 bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                      <div className="flex justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Pipeline Status</span>
                        {hasUpdate && (
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#1f8898] flex items-center gap-1">
                            <Activity className="w-3 h-3" /> Updated {new Date(inq.updated_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest mb-1.5 px-1">
                        <span className={currentStage >= 1 ? 'text-[#1f8898]' : 'text-gray-400'}>Sent</span>
                        <span className={currentStage >= 2 ? 'text-blue-500' : 'text-gray-300'}>Review</span>
                        <span className={currentStage >= 3 ? 'text-amber-500' : 'text-gray-300'}>Viewed</span>
                        <span className={currentStage >= 4 ? 'text-emerald-500' : 'text-gray-300'}>Success</span>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden flex">
                        <div className={`h-full transition-all duration-700 ${currentStage >= 1 ? 'bg-[#1f8898]' : ''}`} style={{ width: '25%' }}></div>
                        <div className={`h-full transition-all duration-700 ${currentStage >= 2 ? 'bg-blue-500' : ''}`} style={{ width: '25%' }}></div>
                        <div className={`h-full transition-all duration-700 ${currentStage >= 3 ? 'bg-amber-400' : ''}`} style={{ width: '25%' }}></div>
                        <div className={`h-full transition-all duration-700 ${currentStage >= 4 ? 'bg-emerald-500' : ''}`} style={{ width: '25%' }}></div>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          inq.status === 'NEW' ? 'bg-gray-400 animate-pulse' : 
                          inq.status === 'CONTACTED' ? 'bg-blue-500' : 
                          inq.status === 'VIEWED' ? 'bg-amber-400' : 'bg-emerald-500'
                        }`}></div>
                        <p className="text-sm font-bold text-gray-900">
                          {inq.status === 'NEW' ? 'Awaiting Landlord Response' : 
                           inq.status === 'CONTACTED' ? 'In Discussion / Viewing Set' : 
                           inq.status === 'VIEWED' ? 'Property Viewed' : 
                           inq.status === 'CONVERTED' ? 'Successfully Converted' : 'Archived'}
                        </p>
                      </div>
                    </div>

                    {/* Original Message Thread */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 relative">
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Initial Request • {new Date(inq.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-sm font-medium text-gray-700 italic border-l-2 border-gray-200 pl-3 leading-relaxed">
                        "{inq.message}"
                      </p>
                    </div>
                  </div>

                  {/* RIGHT: Landlord Communication Actions */}
                  <div className="w-full xl:w-[280px] shrink-0 border-t xl:border-t-0 xl:border-l border-gray-100 bg-gray-50/30 p-6 flex flex-col justify-between">
                    
                    <div className="mb-6">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Communication</p>
                      {isUnlocked ? (
                        <div className="bg-white rounded-xl border border-emerald-100 p-3 shadow-sm mb-4">
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600/70">Direct Contact</p>
                            <button onClick={() => copyToClipboard(unlockData.phone)} className="text-gray-400 hover:text-emerald-600 transition-colors">
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-base font-black text-gray-900">{unlockData.phone}</p>
                        </div>
                      ) : (
                        <div className="bg-amber-50 rounded-xl border border-amber-100 p-4 shadow-sm mb-4">
                          <LockKeyhole className="w-6 h-6 text-amber-500 mb-2" />
                          <p className="text-xs font-bold text-gray-900 mb-1">Contact Protected</p>
                          <p className="text-[10px] text-gray-600 font-medium leading-relaxed">Unlock this property to access the landlord's direct phone number and exact map coordinates.</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 mt-auto">
                      {isUnlocked ? (
                        <>
                          <a 
                            href={getWhatsAppLink(unlockData.phone, inq.unit?.unit_number, propertyName)} 
                            target="_blank" rel="noopener noreferrer" 
                            className="w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-[#25D366]/20 active:scale-95"
                          >
                            <MessageCircle className="w-4 h-4" /> Follow Up on WhatsApp
                          </a>
                          <a 
                            href={`tel:${unlockData.phone}`} 
                            className="w-full py-3 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-gray-900/20 active:scale-95"
                          >
                            <Phone className="w-4 h-4" /> Call Landlord
                          </a>
                        </>
                      ) : (
                        <Link 
                          href={`/marketplace?id=${inq.unit_id}`} 
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20 active:scale-95"
                        >
                          <LockKeyhole className="w-4 h-4" /> Unlock Contact Info
                        </Link>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}