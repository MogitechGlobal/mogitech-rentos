// apps/web/app/hunter/unlocked/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  LockOpen, MapPin, Phone, MessageCircle, Loader2, ArrowRight, 
  Search, CheckCircle2, Copy, Building2, Calendar, MessageSquare, 
  BedDouble, Bath, Activity, Filter, Map as MapIcon, Image as ImageIcon,
  Clock, Check, ChevronRight, Star
} from 'lucide-react';
import { toast } from 'sonner';

export default function HunterUnlockedPage() {
  const [unlocked, setUnlocked] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [shortlistIds, setShortlistIds] = useState<Set<string>>(new Set());
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'RECENT' | 'RENT_ASC' | 'RENT_DESC'>('RECENT');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'NOT_CONTACTED' | 'CONTACTED' | 'VIEWING'>('ALL');
  
  // UI State
  const [viewModes, setViewModes] = useState<Record<string, 'IMAGE' | 'MAP'>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // --- CRITICAL FIX: EXPLICIT TOKEN EXTRACTION ---
        // Prevents silent 401 failures when cross-origin cookies drop
        const getAuthToken = () => {
          if (typeof document !== 'undefined') {
            const match = document.cookie.match(new RegExp('(^| )access_token=([^;]+)'));
            if (match) return match[2];
          }
          if (typeof localStorage !== 'undefined') {
            return localStorage.getItem('access_token');
          }
          return null;
        };

        const token = getAuthToken();

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hunter/dashboard`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          credentials: 'include'
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch workspace data (Status: ${res.status})`);
        }

        const json = await res.json();
        
        // Safely handle both { data: {...} } and direct {...} payload structures
        const payload = json.data || json;
        
        // Safely handle camelCase or snake_case variations
        const unlockedData = payload.unlocked_properties || payload.unlockedProperties || [];
        const inquiriesData = payload.inquiries || [];
        
        setUnlocked(unlockedData);
        setInquiries(inquiriesData);

        // Load shortlist from local storage (until backend API is connected)
        const shorts = JSON.parse(localStorage.getItem('mogi_shortlist_ids') || '[]');
        setShortlistIds(new Set(shorts));

        // Generate Activity Feed
        const timeline: any[] = [];
        unlockedData.forEach((up: any) => {
          timeline.push({
            id: `up_${up.id}`,
            type: 'UNLOCK',
            title: `Unlocked ${up.property?.name || 'Property'}`,
            desc: `Direct contact details secured.`,
            date: new Date(up.created_at || Date.now())
          });
        });
        inquiriesData.forEach((inq: any) => {
          // Only add activities for unlocked properties
          if (unlockedData.some((u: any) => u.unit?.id === inq.unit_id)) {
            timeline.push({
              id: `inq_${inq.id}_${inq.status}`,
              type: 'INQUIRY',
              title: inq.status === 'NEW' ? 'Requested Viewing' : `Viewing Update: ${inq.status}`,
              desc: `Unit ${inq.unit?.unit_number} at ${inq.unit?.property?.name || 'Property'}`,
              date: new Date(inq.updated_at || inq.created_at)
            });
          }
        });
        timeline.sort((a, b) => b.date.getTime() - a.date.getTime());
        setActivities(timeline);
        
      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
        toast.error("Failed to sync secure contacts with the server.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getWhatsAppLink = (phone: string, unitStr: string, propertyName: string) => {
    let cleanPhone = phone?.replace(/\D/g, '') || '';
    if (cleanPhone.startsWith('0')) cleanPhone = '254' + cleanPhone.substring(1);
    const message = `Hi, I unlocked your listing for Unit ${unitStr} at ${propertyName} on MogiRentOS and would like to arrange a viewing.`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Phone number copied to clipboard!', { position: 'bottom-right' });
  };

  const toggleViewMode = (id: string, mode: 'IMAGE' | 'MAP') => {
    setViewModes(prev => ({ ...prev, [id]: mode }));
  };

  // --- DATA MERGING & PIPELINE LOGIC ---
  const enrichedUnlocked = useMemo(() => {
    return unlocked.map(item => {
      // Find matching inquiry to determine pipeline status
      const relatedInquiry = inquiries.find(inq => inq.unit_id === item.unit?.id);
      const isShortlisted = shortlistIds.has(item.unit?.id);
      
      let pipelineStage = 1; // 1: Unlocked
      if (relatedInquiry) {
        pipelineStage = 2; // 2: Contacted / Requested
        if (['CONTACTED', 'VIEWED'].includes(relatedInquiry.status)) pipelineStage = 3; // 3: Responded / Viewing
      }
      if (isShortlisted) pipelineStage = 4; // 4: Shortlisted

      return {
        ...item,
        relatedInquiry,
        pipelineStage,
        isShortlisted
      };
    });
  }, [unlocked, inquiries, shortlistIds]);

  // --- FILTERING & SORTING ---
  const processedUnlocked = useMemo(() => {
    let filtered = enrichedUnlocked.filter((item) => {
      // Search
      const searchStr = `${item.property?.name} ${item.property?.address} ${item.unit?.unit_number} ${item.property?.landlord?.contact_phone}`.toLowerCase();
      if (searchTerm && !searchStr.includes(searchTerm.toLowerCase())) return false;
      
      // Status Filter
      if (filterStatus === 'NOT_CONTACTED' && item.pipelineStage > 1) return false;
      if (filterStatus === 'CONTACTED' && item.pipelineStage === 1) return false;
      if (filterStatus === 'VIEWING' && item.pipelineStage < 3) return false;
      
      return true;
    });

    // Sort
    switch (sortBy) {
      case 'RENT_ASC': return filtered.sort((a, b) => Number(a.unit?.rent_amount || 0) - Number(b.unit?.rent_amount || 0));
      case 'RENT_DESC': return filtered.sort((a, b) => Number(b.unit?.rent_amount || 0) - Number(a.unit?.rent_amount || 0));
      case 'RECENT':
      default: return filtered.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
    }
  }, [enrichedUnlocked, searchTerm, filterStatus, sortBy]);

  // --- OVERVIEW STATS ---
  const stats = {
    total: unlocked.length,
    contacted: enrichedUnlocked.filter(i => i.pipelineStage > 1).length,
    viewings: enrichedUnlocked.filter(i => i.pipelineStage >= 3).length,
    shortlisted: enrichedUnlocked.filter(i => i.isShortlisted).length
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[600px] bg-[#f8fafb]">
        <Loader2 className="w-10 h-10 animate-spin text-[#1f8898] mb-4" />
        <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Loading Secure Contacts...</p>
      </div>
    );
  }

  return (
    <div className="pb-16 bg-[#f8fafb] min-h-screen font-sans selection:bg-[#1f8898]/30">
      
      {/* --- PREMIUM HEADER --- */}
      <div className="bg-[#0d393f] px-6 sm:px-10 pt-8 pb-24 relative overflow-hidden shadow-inner border-b border-[#0a2c31]">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500 rounded-full blur-[120px] opacity-10 -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-amber-100 text-[10px] font-black uppercase tracking-widest mb-4 border border-white/20 backdrop-blur-sm shadow-sm">
              <LockOpen className="w-3.5 h-3.5" /> Premium Workspace
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[#ffffff] tracking-tight mb-2">
              Unlocked Contacts
            </h1>
            <p className="text-teal-50/80 text-sm md:text-base font-medium max-w-xl">
              Direct access to landlords and exact coordinates for properties you've unlocked. Manage your communications and viewings here.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-3">
            <Link href="/marketplace" className="bg-[#1f8898] hover:bg-[#48c9dc] text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-black/20 flex items-center gap-2 active:scale-95">
              <Search className="w-4 h-4" /> Unlock More
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-12 relative z-20 space-y-6">
        
        {/* --- STATS OVERVIEW --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 shrink-0"><LockOpen className="w-5 h-5" /></div>
            <div>
              <p className="text-2xl font-black text-gray-900 leading-none mb-1">{stats.total}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Unlocked</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 shrink-0"><MessageCircle className="w-5 h-5" /></div>
            <div>
              <p className="text-2xl font-black text-gray-900 leading-none mb-1">{stats.contacted}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Contacted</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 shrink-0"><Calendar className="w-5 h-5" /></div>
            <div>
              <p className="text-2xl font-black text-gray-900 leading-none mb-1">{stats.viewings}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Viewings</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 shrink-0"><Star className="w-5 h-5" /></div>
            <div>
              <p className="text-2xl font-black text-gray-900 leading-none mb-1">{stats.shortlisted}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Shortlisted</p>
            </div>
          </div>
        </div>

        {/* --- MAIN WORKSPACE GRID --- */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Properties (Span 8) */}
          <div className="xl:col-span-8 space-y-6">
            
            {/* Search & Filters */}
            {unlocked.length > 0 && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#1f8898] transition-colors" />
                  <input 
                    type="text" placeholder="Search properties or locations..." 
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-11 pr-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all"
                  />
                </div>
                <div className="flex gap-3">
                  <div className="relative group shrink-0">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select 
                      value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} 
                      className="appearance-none bg-white border border-gray-200 pl-10 pr-10 py-3 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-[#1f8898] cursor-pointer hover:bg-gray-50 transition-all"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="NOT_CONTACTED">Not Contacted</option>
                      <option value="CONTACTED">Contacted</option>
                      <option value="VIEWING">Viewings</option>
                    </select>
                  </div>
                  <div className="relative group shrink-0 hidden sm:block">
                    <select 
                      value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} 
                      className="appearance-none bg-white border border-gray-200 px-4 pr-10 py-3 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-[#1f8898] cursor-pointer hover:bg-gray-50 transition-all"
                    >
                      <option value="RECENT">Newest First</option>
                      <option value="RENT_ASC">Rent: Low to High</option>
                      <option value="RENT_DESC">Rent: High to Low</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* List of Unlocked Properties */}
            {unlocked.length === 0 ? (
              <div className="bg-white rounded-[2rem] border border-dashed border-gray-200 p-12 text-center flex flex-col items-center shadow-sm">
                <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-5 border border-amber-100 shadow-inner">
                  <LockOpen className="w-10 h-10 text-amber-500" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">No properties unlocked yet</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
                  Pay Ksh. 300 on any premium marketplace listing to bypass brokers and permanently unlock the landlord's direct contact details here.
                </p>
                <Link href="/marketplace" className="bg-[#1f8898] hover:bg-[#156a77] text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-[#1f8898]/20 transition-all active:scale-95 flex items-center gap-2">
                  Browse Marketplace <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : processedUnlocked.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-black text-gray-900 mb-1">No matches found</h3>
                <p className="text-sm text-gray-500">Adjust your search or filters to see results.</p>
                <button onClick={() => { setSearchTerm(''); setFilterStatus('ALL'); }} className="mt-4 text-[#1f8898] font-bold text-sm hover:underline">Clear Filters</button>
              </div>
            ) : (
              <div className="space-y-6">
                {processedUnlocked.map((item: any) => {
                  const phone = item.property?.landlord?.contact_phone || 'N/A';
                  const propertyName = item.property?.name || 'Premium Listing';
                  const unitNumber = item.unit?.unit_number || 'N/A';
                  const currentViewMode = viewModes[item.id] || 'IMAGE';
                  const imgUrl = item.unit?.images?.[0]?.url || item.property?.images?.[0]?.url;

                  return (
                    <div key={item.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl hover:border-[#1f8898]/30 transition-all duration-300">
                      
                      {/* Top Header */}
                      <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-gray-200 text-[#1f8898] shadow-sm shrink-0">
                            <Building2 className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-[#1f8898] transition-colors truncate max-w-[200px] sm:max-w-sm">
                              {propertyName}
                            </h3>
                            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-0.5 flex items-center gap-2">
                              Unit {unitNumber} <span className="w-1 h-1 rounded-full bg-gray-300"></span> {item.property?.address || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                           <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1">
                             <Clock className="w-3 h-3" /> Unlocked {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recently'}
                           </span>
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row">
                        {/* Media Left Column */}
                        <div className="w-full md:w-72 shrink-0 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col">
                          <div className="h-48 relative bg-gray-100">
                            {currentViewMode === 'IMAGE' ? (
                              imgUrl ? (
                                <img src={imgUrl} alt="Property" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1f8898]/10 to-[#0d393f]/20 text-gray-400">
                                  <Building2 className="w-8 h-8 mb-2 opacity-50 text-[#1f8898]" />
                                  <span className="text-xs font-bold uppercase tracking-widest">No Image</span>
                                </div>
                              )
                            ) : (
                              <iframe 
                                width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen 
                                src={`https://maps.google.com/maps?q=${item.property?.latitude || 0},${item.property?.longitude || 0}&z=15&output=embed`}
                              ></iframe>
                            )}
                            
                            {/* Map/Image Toggle */}
                            <div className="absolute bottom-3 left-3 flex bg-white/90 backdrop-blur-md rounded-lg p-1 shadow-sm border border-white/20">
                              <button onClick={() => toggleViewMode(item.id, 'IMAGE')} className={`p-1.5 rounded-md transition-colors ${currentViewMode === 'IMAGE' ? 'bg-[#1f8898] text-white' : 'text-gray-600 hover:text-gray-900'}`} title="Photo">
                                <ImageIcon className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => toggleViewMode(item.id, 'MAP')} className={`p-1.5 rounded-md transition-colors ${currentViewMode === 'MAP' ? 'bg-[#1f8898] text-white' : 'text-gray-600 hover:text-gray-900'}`} title="Exact Map">
                                <MapIcon className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-gray-50 flex items-center justify-between border-t border-gray-100 flex-1">
                            <div>
                              <p className="text-[9px] uppercase tracking-widest font-black text-gray-400 mb-0.5">Monthly Rent</p>
                              <p className="text-lg font-black text-[#1f8898] leading-none">KSh {Number(item.unit?.rent_amount || 0).toLocaleString()}</p>
                            </div>
                            <div className="flex gap-3 text-sm font-bold text-gray-600">
                              {item.unit?.bedrooms && <span className="flex items-center gap-1"><BedDouble className="w-4 h-4"/> {item.unit.bedrooms}</span>}
                              {item.unit?.bathrooms && <span className="flex items-center gap-1"><Bath className="w-4 h-4"/> {item.unit.bathrooms}</span>}
                            </div>
                          </div>
                        </div>

                        {/* Content Right Column */}
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          
                          {/* Property Journey Pipeline */}
                          <div className="mb-6">
                            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest mb-2 px-1">
                              <span className="text-emerald-500">Unlocked</span>
                              <span className={item.pipelineStage >= 2 ? 'text-blue-500' : 'text-gray-300'}>Contacted</span>
                              <span className={item.pipelineStage >= 3 ? 'text-amber-500' : 'text-gray-300'}>Viewing</span>
                              <span className={item.pipelineStage >= 4 ? 'text-purple-500' : 'text-gray-300'}>Shortlisted</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden flex">
                              <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: '25%' }}></div>
                              <div className={`h-full transition-all duration-500 ${item.pipelineStage >= 2 ? 'bg-blue-500' : ''}`} style={{ width: '25%' }}></div>
                              <div className={`h-full transition-all duration-500 ${item.pipelineStage >= 3 ? 'bg-amber-400' : ''}`} style={{ width: '25%' }}></div>
                              <div className={`h-full transition-all duration-500 ${item.pipelineStage >= 4 ? 'bg-purple-500' : ''}`} style={{ width: '25%' }}></div>
                            </div>
                            {item.relatedInquiry && (
                              <p className="text-xs font-bold text-gray-500 mt-3 flex items-center gap-1.5">
                                <MessageSquare className="w-3.5 h-3.5 text-blue-400" /> System Status: <span className="text-gray-900 uppercase">{item.relatedInquiry.status.replace('_', ' ')}</span>
                              </p>
                            )}
                          </div>

                          {/* Contact Display */}
                          <div className="bg-[#ebf3f5]/50 border border-[#1f8898]/20 rounded-2xl p-4 mb-4 flex items-center justify-between">
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-widest text-[#1f8898]/60 mb-0.5">Direct Landlord Contact</p>
                              <p className="text-xl font-black text-gray-900 tracking-tight">{phone}</p>
                            </div>
                            <button onClick={() => copyToClipboard(phone)} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-500 hover:text-[#1f8898] hover:shadow-sm border border-gray-200 transition-all" title="Copy Number">
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Action Buttons */}
                          <div className="grid grid-cols-2 gap-3 mt-auto">
                            <a href={`tel:${phone}`} className="col-span-1 bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors text-xs shadow-md shadow-gray-900/20 active:scale-95">
                              <Phone className="w-3.5 h-3.5" /> Call
                            </a>
                            <a href={getWhatsAppLink(phone, unitNumber, propertyName)} target="_blank" rel="noopener noreferrer" className="col-span-1 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors text-xs shadow-md shadow-[#25D366]/20 active:scale-95">
                              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                            </a>
                            <Link href={`/marketplace?id=${item.unit?.id}`} className="col-span-2 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs flex items-center justify-center gap-1.5 hover:border-[#1f8898] hover:text-[#1f8898] hover:bg-[#ebf3f5] transition-all active:scale-95">
                              {item.relatedInquiry ? 'Manage Request' : 'Request Official Viewing'} <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>

                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Activity Feed (Span 4) */}
          <div className="xl:col-span-4 space-y-6">
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col sticky top-24 max-h-[calc(100vh-8rem)]">
              <div className="p-6 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
                <Activity className="w-5 h-5 text-[#1f8898]" />
                <h2 className="text-lg font-black text-gray-900">Communication Log</h2>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                {activities.length === 0 ? (
                  <div className="text-center py-10">
                    <Activity className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-500">No communication activity recorded yet.</p>
                  </div>
                ) : (
                  <div className="relative border-l-2 border-gray-100 ml-3 space-y-8">
                    {activities.map((act) => (
                      <div key={act.id} className="relative pl-6">
                        <div className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 border-white ${act.type === 'UNLOCK' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                        <p className="text-sm font-black text-gray-900 mb-0.5">{act.title}</p>
                        <p className="text-xs font-medium text-gray-600 mb-1.5 leading-relaxed">{act.desc}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                          {act.date.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}