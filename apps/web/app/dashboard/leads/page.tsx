'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, Phone, Mail, MessageCircle, Building2, Loader2, 
  Search, Filter, Clock, TrendingUp, Inbox, ChevronDown, CalendarDays
} from 'lucide-react';

export default function LeadsCRMPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- CRM FILTER & SEARCH STATES ---
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL'); // ALL, NEW, CONTACTED, CONVERTED
  
  // --- DATE FILTER STATES ---
  const [dateFilter, setDateFilter] = useState('ALL_TIME');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leads`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      
      if (res.status === 401) return router.push('/login');
      if (!res.ok) throw new Error('Failed to load leads');
      
      const data = await res.json();
      // Sort newest first automatically
      const sortedData = data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setLeads(sortedData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    // Optimistic UI update for instant feedback
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include'
      });
    } catch (err) {
      console.error(err);
      fetchLeads(); // Revert on failure
    }
  };

  // --- ADVANCED COMMUNICATION HELPERS ---
  const getWhatsAppLink = (phone: string, name: string, unit: string, propertyName: string, listingId: string) => {
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '254' + cleanPhone.substring(1);
    const listingUrl = `${window.location.origin}/marketplace?id=${listingId}`;
    const message = `Hi ${name}, this is the landlord following up on your inquiry for Unit ${unit} at ${propertyName} on MogiRent Marketplace.\n\nListing details: ${listingUrl}`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const getEmailLink = (email: string, name: string, unit: string, propertyName: string, listingId: string) => {
    const listingUrl = `${window.location.origin}/marketplace?id=${listingId}`;
    const subject = `Re: Inquiry for Unit ${unit} at ${propertyName}`;
    const body = `Hi ${name},\n\nThank you for your interest in Unit ${unit} at ${propertyName}.\n\nI'm following up on your inquiry submitted via the MogiRent Marketplace.\n\nListing details: ${listingUrl}\n\nLet me know if you have any questions or if you'd like to schedule a viewing.\n\nBest regards,`;
    return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // --- UTILS & DATE LOGIC ---
  const getTimeAgo = (dateString: string) => {
    const days = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / (1000 * 3600 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const isDateInRange = (dateString: string) => {
    if (dateFilter === 'ALL_TIME') return true;
    
    const date = new Date(dateString);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (dateFilter === 'TODAY') return date >= startOfToday;
    
    if (dateFilter === 'YESTERDAY') {
      const startOfYesterday = new Date(startOfToday);
      startOfYesterday.setDate(startOfYesterday.getDate() - 1);
      return date >= startOfYesterday && date < startOfToday;
    }
    
    if (dateFilter === 'THIS_WEEK') {
      const startOfWeek = new Date(startOfToday);
      startOfWeek.setDate(startOfToday.getDate() - 7);
      return date >= startOfWeek;
    }
    
    if (dateFilter === 'THIS_MONTH') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return date >= startOfMonth;
    }
    
    if (dateFilter === 'THIS_YEAR') {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      return date >= startOfYear;
    }
    
    if (dateFilter === 'CUSTOM') {
      if (!customStartDate && !customEndDate) return true;
      let isAfterStart = true;
      let isBeforeEnd = true;
      if (customStartDate) isAfterStart = date >= new Date(customStartDate);
      if (customEndDate) {
        const endDate = new Date(customEndDate);
        endDate.setHours(23, 59, 59, 999);
        isBeforeEnd = date <= endDate;
      }
      return isAfterStart && isBeforeEnd;
    }
    
    return true;
  };

  // --- DERIVED METRICS (Based on Date Filter Only) ---
  const leadsFilteredByDate = leads.filter(lead => isDateInRange(lead.created_at));
  
  const newLeadsCount = leadsFilteredByDate.filter(l => l.status === 'NEW').length;
  const contactedLeadsCount = leadsFilteredByDate.filter(l => l.status === 'CONTACTED').length;
  const convertedLeadsCount = leadsFilteredByDate.filter(l => l.status === 'CONVERTED').length;
  const conversionRate = leadsFilteredByDate.length > 0 ? Math.round((convertedLeadsCount / leadsFilteredByDate.length) * 100) : 0;

  // --- FINAL LIST (Applying Search & Status Filters) ---
  const finalLeads = leadsFilteredByDate.filter(lead => {
    const matchesSearch = 
      lead.prospect_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.prospect_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.unit.property.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = activeFilter === 'ALL' || lead.status === activeFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans selection:bg-[#1f8898]/30 overflow-x-hidden">
      
      {/* --- MINIMIZED HERO AREA --- */}
      <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-4 sm:px-6 pt-6 pb-16 relative overflow-hidden shadow-inner">
        <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#ffffff] tracking-tight mb-1">
              Marketplace Leads
            </h1>
            <p className="text-teal-100 text-xs md:text-sm font-medium leading-relaxed">
              Track inquiries, manage prospect communications, and monitor your pipeline.
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 relative z-20 -mt-10">
        
        {/* --- CRM METRICS RIBBON --- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-500">Total Leads</p>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0"><Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" /></div>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-gray-900">{leadsFilteredByDate.length}</h3>
            </div>
            
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-amber-400/10 rounded-bl-full blur-xl pointer-events-none"></div>
                <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-500">Action Needed</p>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0"><Inbox className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" /></div>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-amber-500">{newLeadsCount}</h3>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-400/10 rounded-bl-full blur-xl pointer-events-none"></div>
                <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-500">In Progress</p>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0"><MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" /></div>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-blue-500">{contactedLeadsCount}</h3>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#1f8898]/10 rounded-bl-full blur-xl pointer-events-none"></div>
                <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-500">Conv. Rate</p>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#ebf3f5] flex items-center justify-center shrink-0"><TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1f8898]" /></div>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-[#1f8898]">{conversionRate}%</h3>
            </div>
        </div>

        {/* --- MOBILE RESPONSIVE SEARCH & FILTER TOOLBAR --- */}
        <div className="flex flex-col lg:flex-row gap-3 justify-between items-start lg:items-center mb-6 bg-white p-2.5 rounded-2xl shadow-sm border border-gray-100">
            
            <div className="relative w-full lg:w-80 flex items-center group shrink-0">
                <Search className="absolute left-3.5 w-4 h-4 text-gray-400 group-focus-within:text-[#1f8898] transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search name, email, property..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-50/50 hover:bg-gray-50 border border-transparent focus:border-[#1f8898]/20 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-gray-900 outline-none placeholder:text-gray-400 transition-all"
                />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              
              {/* Date Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1 sm:flex-none">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select 
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full sm:w-auto appearance-none bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl pl-9 pr-8 py-2.5 outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 cursor-pointer shadow-sm"
                  >
                    <option value="ALL_TIME">All Time</option>
                    <option value="TODAY">Today</option>
                    <option value="YESTERDAY">Yesterday</option>
                    <option value="THIS_WEEK">Last 7 Days</option>
                    <option value="THIS_MONTH">This Month</option>
                    <option value="THIS_YEAR">This Year</option>
                    <option value="CUSTOM">Custom Range...</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {dateFilter === 'CUSTOM' && (
                  <div className="flex items-center gap-2 w-full sm:w-auto animate-in fade-in slide-in-from-left-2 duration-300">
                    <input 
                      type="date" 
                      value={customStartDate} 
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="flex-1 sm:flex-none bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl px-3 py-2.5 outline-none focus:border-[#1f8898]" 
                    />
                    <span className="text-gray-400 font-bold">-</span>
                    <input 
                      type="date" 
                      value={customEndDate} 
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="flex-1 sm:flex-none bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl px-3 py-2.5 outline-none focus:border-[#1f8898]" 
                    />
                  </div>
                )}
              </div>

              <div className="hidden sm:block w-px h-8 bg-gray-100 mx-1"></div>

              {/* Status Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto custom-scrollbar">
                  <Filter className="w-4 h-4 text-gray-400 mx-1 hidden lg:block shrink-0" />
                  {['ALL', 'NEW', 'CONTACTED', 'CONVERTED'].map(filter => (
                      <button 
                          key={filter}
                          onClick={() => setActiveFilter(filter)}
                          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                              activeFilter === filter 
                              ? 'bg-gray-900 text-white shadow-md' 
                              : 'bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                      >
                          {filter}
                      </button>
                  ))}
              </div>
            </div>
        </div>

        {/* --- MAIN CONTENT --- */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-[#1f8898] bg-white rounded-[2rem] border border-gray-100 shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="font-bold text-sm uppercase tracking-widest text-gray-400 mt-4">Syncing Pipeline...</span>
          </div>
        ) : finalLeads.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-dashed border-gray-200 p-10 sm:p-12 text-center max-w-xl mx-auto mt-6 shadow-sm">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#ebf3f5] rounded-3xl flex items-center justify-center mx-auto mb-5 text-[#1f8898]">
              <Users className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2 tracking-tight">No leads found</h3>
            <p className="text-sm sm:text-base text-gray-500 font-medium">
                {searchQuery || activeFilter !== 'ALL' || dateFilter !== 'ALL_TIME'
                    ? "Try adjusting your search or filters to find what you're looking for."
                    : "When tenants inquire about your public listings, they will appear right here."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
            {finalLeads.map((lead) => (
              <div key={lead.id} className="bg-[#ffffff] rounded-3xl sm:rounded-[2rem] shadow-sm border border-gray-100 flex flex-col group hover:-translate-y-1 hover:shadow-xl hover:shadow-[#1f8898]/5 hover:border-[#1f8898]/30 transition-all duration-300 overflow-hidden relative">
                
                {/* Stage Indicator Bar */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 transition-colors duration-500 ${
                    lead.status === 'NEW' ? 'bg-amber-400' :
                    lead.status === 'CONTACTED' ? 'bg-blue-400' :
                    'bg-emerald-400'
                  }`}>
                </div>

                <div className="p-5 sm:p-6 border-b border-gray-50 bg-gradient-to-b from-gray-50/50 to-white flex justify-between items-start gap-4 pt-6 sm:pt-7">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-gray-900 text-lg sm:text-xl group-hover:text-[#1f8898] transition-colors truncate" title={lead.prospect_name}>
                        {lead.prospect_name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 sm:mt-1.5">
                        <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400" />
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-gray-500">
                          {getTimeAgo(lead.created_at)}
                        </span>
                    </div>
                  </div>
                  
                  {/* Styled Status Dropdown */}
                  <div className="relative shrink-0">
                    <select 
                        value={lead.status}
                        onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                        className={`appearance-none text-[10px] sm:text-xs font-black pl-3 pr-7 sm:pr-8 py-1.5 sm:py-2 rounded-xl outline-none cursor-pointer border shadow-sm transition-all focus:ring-4 ${
                        lead.status === 'NEW' ? 'bg-amber-50 text-amber-700 border-amber-200 focus:ring-amber-400/20' :
                        lead.status === 'CONTACTED' ? 'bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-400/20' :
                        'bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-400/20'
                        }`}
                    >
                        <option value="NEW">🚨 NEW</option>
                        <option value="CONTACTED">💬 CONTACTED</option>
                        <option value="CONVERTED">✅ CONVERTED</option>
                    </select>
                    <ChevronDown className={`absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 pointer-events-none ${
                        lead.status === 'NEW' ? 'text-amber-500' : lead.status === 'CONTACTED' ? 'text-blue-500' : 'text-emerald-500'
                    }`} />
                  </div>
                </div>

                <div className="p-5 sm:p-6 flex-1 flex flex-col">
                  {/* Property Tag */}
                  <div className="bg-[#ebf3f5] text-[#1f8898] px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 mb-4 sm:mb-5 shadow-inner border border-[#1f8898]/10">
                    <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span className="truncate">Unit {lead.unit.unit_number} <span className="opacity-40 mx-1">|</span> {lead.unit.property.name}</span>
                  </div>

                  {/* Contact Info (Fixed Hydration Error with <div> instead of <p>) */}
                  <div className="space-y-2.5 mb-5 sm:mb-6 bg-gray-50/50 p-3 sm:p-4 rounded-2xl border border-gray-100">
                    <div className="text-xs sm:text-sm text-gray-700 flex items-center gap-2.5 font-bold">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm"><Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" /></div>
                      {lead.prospect_phone}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-700 flex items-center gap-2.5 font-bold">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm"><Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" /></div>
                      <span className="truncate" title={lead.prospect_email}>{lead.prospect_email}</span>
                    </div>
                  </div>

                  {/* Message Bubble */}
                  <div className="relative mt-auto">
                    <div className="absolute -top-2.5 left-3 bg-white px-2 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-[#1f8898]">Inquiry Note</div>
                    <div className="bg-white border border-gray-200 p-3.5 sm:p-4 pt-4 sm:pt-5 rounded-2xl shadow-sm">
                        <p className="text-xs sm:text-sm text-gray-600 italic line-clamp-3 leading-relaxed">"{lead.message}"</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-3 sm:p-4 bg-gray-50 border-t border-gray-100 flex gap-2 sm:gap-3">
                  <a 
                    href={getWhatsAppLink(lead.prospect_phone, lead.prospect_name, lead.unit.unit_number, lead.unit.property.name, lead.unit.id)}
                    target="_blank" rel="noopener noreferrer"
                    className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm shadow-[#25D366]/20 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> WhatsApp
                  </a>
                  <a 
                    href={getEmailLink(lead.prospect_email, lead.prospect_name, lead.unit.unit_number, lead.unit.property.name, lead.unit.id)}
                    className="flex-1 bg-white border border-gray-200 text-gray-700 hover:border-[#1f8898] hover:text-[#1f8898] py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Email
                  </a>
                </div>

              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}