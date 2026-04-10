// apps/web/app/super-admin/support/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
    Headset, Loader2, Search, Clock, Star, 
    MessageSquare, X, Activity, CheckCircle2, 
    AlertCircle, ShieldAlert, LifeBuoy, Building2,
    Calendar, Filter
} from 'lucide-react';

export default function AdminHelpdeskPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // --- ADVANCED FILTERS STATE ---
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [dateFilter, setDateFilter] = useState('ALL');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    // --- FEEDBACK MODAL STATE ---
    const [selectedFeedback, setSelectedFeedback] = useState<any | null>(null);

    const fetchTickets = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/support-tickets?page=${page}&search=${searchQuery}`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setTickets(data.data);
                setTotalPages(data.meta.last_page);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => fetchTickets(), 300);
        return () => clearTimeout(timeoutId);
    }, [page, searchQuery]);

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        // Optimistic update
        setTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/support-tickets/${id}/status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status: newStatus })
            });
            if (!res.ok) throw new Error('Failed to update status');
        } catch (err: any) {
            alert(err.message);
            fetchTickets(); // Revert on failure
        }
    };

    const getPriorityStyle = (priority: string) => {
        if (priority === 'URGENT') return 'text-rose-700 bg-rose-100 border-rose-200';
        if (priority === 'HIGH') return 'text-orange-700 bg-orange-100 border-orange-200';
        if (priority === 'MEDIUM') return 'text-amber-700 bg-amber-100 border-amber-200';
        return 'text-blue-700 bg-blue-100 border-blue-200';
    };

    // --- STEP 1: DATE FILTERING ---
    const dateFilteredTickets = useMemo(() => {
        let result = tickets;

        if (dateFilter !== 'ALL') {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            result = result.filter(t => {
                const ticketDate = new Date(t.created_at);

                switch (dateFilter) {
                    case 'TODAY':
                        return ticketDate >= today;
                    case 'YESTERDAY':
                        const yesterdayStart = new Date(today);
                        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
                        return ticketDate >= yesterdayStart && ticketDate < today;
                    case 'THIS_WEEK':
                        const weekStart = new Date(today);
                        weekStart.setDate(today.getDate() - today.getDay());
                        return ticketDate >= weekStart;
                    case 'THIS_MONTH':
                        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                        return ticketDate >= monthStart;
                    case 'THIS_YEAR':
                        const yearStart = new Date(now.getFullYear(), 0, 1);
                        return ticketDate >= yearStart;
                    case 'CUSTOM':
                        if (customStartDate && customEndDate) {
                            const start = new Date(customStartDate);
                            const end = new Date(customEndDate);
                            end.setHours(23, 59, 59, 999);
                            return ticketDate >= start && ticketDate <= end;
                        }
                        return true;
                    default:
                        return true;
                }
            });
        }
        return result;
    }, [tickets, dateFilter, customStartDate, customEndDate]);

    // --- DERIVED METRICS (Based on Date Filter) ---
    const openTicketsCount = dateFilteredTickets.filter(t => t.status === 'OPEN').length;
    const inProgressCount = dateFilteredTickets.filter(t => t.status === 'IN_PROGRESS').length;
    const resolvedCount = dateFilteredTickets.filter(t => t.status === 'RESOLVED').length;
    
    const ratedTickets = dateFilteredTickets.filter(t => t.rating);
    const avgRating = ratedTickets.length > 0 
        ? (ratedTickets.reduce((sum, t) => sum + t.rating, 0) / ratedTickets.length).toFixed(1) 
        : 'N/A';

    // --- STEP 2: STATUS FILTERING (Final output for the table) ---
    const filteredTickets = useMemo(() => {
        if (statusFilter === 'ALL') return dateFilteredTickets;
        return dateFilteredTickets.filter(t => t.status === statusFilter);
    }, [dateFilteredTickets, statusFilter]);

    return (
        <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans selection:bg-[#1f8898]/30 overflow-x-hidden">
            
            {/* --- Premium Gradient Hero Area --- */}
            <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-6 pt-8 pb-20 relative overflow-hidden shadow-inner">
                <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-teal-100 text-[10px] font-black uppercase tracking-widest mb-4 border border-white/20 backdrop-blur-sm">
                            <Headset className="w-3.5 h-3.5" /> Platform Operations
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-[#ffffff] tracking-tight mb-2">
                            Support Helpdesk
                        </h1>
                        <p className="text-teal-100 text-sm md:text-base font-medium max-w-xl leading-relaxed">
                            Monitor, manage, and resolve technical support requests submitted by Landlords across the platform.
                        </p>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 relative z-20 space-y-6">
                
                {/* --- Bento Box Analytics Grid --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 text-right leading-tight">Action<br/>Required</span>
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">{openTicketsCount}</h4>
                            <p className="text-xs text-gray-500 font-medium mt-1">Open Tickets</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                                <Activity className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 text-right leading-tight">Currently<br/>Working</span>
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">{inProgressCount}</h4>
                            <p className="text-xs text-gray-500 font-medium mt-1">In Progress</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 text-right leading-tight">Successfully<br/>Closed</span>
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">{resolvedCount}</h4>
                            <p className="text-xs text-gray-500 font-medium mt-1">Resolved Tickets</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100">
                                <Star className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 text-right leading-tight">Average<br/>Rating</span>
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate flex items-baseline gap-1">
                                {avgRating} <span className="text-sm text-gray-400 font-medium">/ 5.0</span>
                            </h4>
                            <p className="text-xs text-gray-500 font-medium mt-1">From {ratedTickets.length} reviews</p>
                        </div>
                    </div>
                </div>

                {/* --- Main Table Container --- */}
                <div className="bg-white rounded-3xl shadow-lg shadow-black/5 border border-gray-100 overflow-hidden flex flex-col min-h-[500px] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                    
                    {/* Advanced Toolbar */}
                    <div className="p-4 md:p-5 border-b border-gray-100 bg-[#f8fafb]/50 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                        
                        <div className="flex flex-wrap items-center gap-3">
                            
                            {/* STATUS FILTER */}
                            <div className="flex items-center gap-2 pr-3 border-r border-gray-200">
                                <Filter className="w-4 h-4 text-gray-400" />
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest hidden sm:inline">Status:</span>
                            </div>
                            <div className="flex gap-1.5 pr-3 border-r border-gray-200">
                                {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setStatusFilter(status)}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                            statusFilter === status 
                                                ? 'bg-[#1f8898] text-white shadow-sm' 
                                                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        {status.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>

                            {/* DATE FILTER */}
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2 pl-1 pr-3 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm hover:border-[#1f8898]/50 transition-colors">
                                    <Calendar className="w-3.5 h-3.5 text-[#1f8898]" />
                                    <select 
                                        className="text-[10px] font-black text-gray-700 bg-transparent outline-none cursor-pointer uppercase tracking-widest"
                                        value={dateFilter}
                                        onChange={(e) => setDateFilter(e.target.value)}
                                    >
                                        <option value="ALL">All Time</option>
                                        <option value="TODAY">Today</option>
                                        <option value="YESTERDAY">Yesterday</option>
                                        <option value="THIS_WEEK">This Week</option>
                                        <option value="THIS_MONTH">This Month</option>
                                        <option value="THIS_YEAR">This Year</option>
                                        <option value="CUSTOM">Custom Range</option>
                                    </select>
                                </div>
                                
                                {/* Custom Date Range Inputs */}
                                {dateFilter === 'CUSTOM' && (
                                    <div className="flex items-center gap-1.5 animate-in fade-in zoom-in-95">
                                        <input 
                                            type="date" 
                                            className="px-2 py-1.5 rounded-lg border border-gray-200 text-[10px] font-bold text-gray-700 outline-none focus:border-[#1f8898] bg-white shadow-sm cursor-pointer"
                                            value={customStartDate}
                                            onChange={(e) => setCustomStartDate(e.target.value)}
                                        />
                                        <span className="text-gray-400 text-xs font-bold">-</span>
                                        <input 
                                            type="date" 
                                            className="px-2 py-1.5 rounded-lg border border-gray-200 text-[10px] font-bold text-gray-700 outline-none focus:border-[#1f8898] bg-white shadow-sm cursor-pointer"
                                            value={customEndDate}
                                            onChange={(e) => setCustomEndDate(e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* --- SEARCH --- */}
                        <div className="flex items-center gap-3 w-full xl:w-auto">
                            <div className="relative w-full sm:w-72">
                                <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3" />
                                <input 
                                    type="text" placeholder="Search subject or landlord..." 
                                    className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-2.5 text-sm font-medium outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all bg-white shadow-sm"
                                    value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto flex-1 bg-white">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-[400px] text-[#1f8898] gap-4 bg-white">
                                <Loader2 className="w-8 h-8 animate-spin" />
                                <span className="font-bold text-sm uppercase tracking-widest text-gray-400">Loading Helpdesk...</span>
                            </div>
                        ) : (
                            <table className="min-w-full text-left border-collapse whitespace-nowrap">
                                <thead>
                                    <tr className="bg-gray-50/80 border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-400 font-black">
                                        <th className="px-6 py-4 pl-8">Landlord Identity</th>
                                        <th className="px-6 py-4">Issue Summary</th>
                                        <th className="px-6 py-4">Priority</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 text-center pr-8">Satisfaction</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredTickets.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-16 text-center">
                                                <div className="w-16 h-16 bg-[#ebf3f5] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#1f8898]">
                                                    <ShieldAlert className="w-8 h-8" />
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-1">No Tickets Found</h3>
                                                <p className="text-sm text-gray-500 font-medium">Try adjusting your search or status filters.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredTickets.map((t) => (
                                            <tr key={t.id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-6 py-4 pl-8">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200 shrink-0">
                                                            <Building2 className="w-5 h-5 text-gray-500" />
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-gray-900 text-sm">{t.landlord?.company_name}</p>
                                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{t.landlord?.user?.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 max-w-[250px] overflow-hidden">
                                                    <p className="font-bold text-gray-900 text-sm truncate group-hover:text-[#1f8898] transition-colors">{t.subject}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5 truncate" title={t.message}>{t.message}</p>
                                                    <p className="text-[10px] text-gray-400 mt-1.5 font-bold flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> {new Date(t.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${getPriorityStyle(t.priority)}`}>
                                                        {t.priority}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <select 
                                                        className={`text-[11px] font-black uppercase tracking-widest rounded-xl px-4 py-2 border outline-none cursor-pointer shadow-sm transition-colors
                                                            ${t.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-500/20' : 
                                                              t.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-500/20' : 
                                                              'bg-white text-gray-700 border-gray-200 focus:ring-gray-500/20'}
                                                        `}
                                                        value={t.status}
                                                        onChange={(e) => handleStatusUpdate(t.id, e.target.value)}
                                                    >
                                                        <option value="OPEN">Open</option>
                                                        <option value="IN_PROGRESS">In Progress</option>
                                                        <option value="RESOLVED">Resolved</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 pr-8 text-center">
                                                    {t.rating ? (
                                                        <div className="flex flex-col items-center justify-center gap-2">
                                                            <div className="flex items-center bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <Star key={star} className={`w-3.5 h-3.5 ${star <= t.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                                                                ))}
                                                            </div>
                                                            {t.feedback && (
                                                                <button 
                                                                    onClick={() => setSelectedFeedback(t)}
                                                                    className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-lg hover:bg-indigo-100 transition-colors shadow-sm active:scale-95"
                                                                >
                                                                    <MessageSquare className="w-3 h-3" /> Read Note
                                                                </button>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="text-center text-gray-300 text-[10px] font-bold uppercase tracking-widest">
                                                            {t.status === 'RESOLVED' ? 'Awaiting Rating' : '—'}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                    
                    {/* Pagination */}
                    <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
                        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 text-xs font-bold text-gray-600 disabled:opacity-50 bg-white hover:bg-gray-50 rounded-xl transition-colors border border-gray-200 shadow-sm">Previous</button>
                        <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Page {page} of {totalPages || 1}</span>
                        <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 text-xs font-bold text-gray-600 disabled:opacity-50 bg-white hover:bg-gray-50 rounded-xl transition-colors border border-gray-200 shadow-sm">Next</button>
                    </div>
                </div>
            </main>

            {/* --- FEEDBACK MODAL --- */}
            {selectedFeedback && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 flex flex-col">
                        
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-br from-gray-50 to-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center">
                                    <MessageSquare className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-gray-900 tracking-tight">Landlord Feedback</h2>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">{selectedFeedback.landlord?.company_name}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedFeedback(null)} 
                                className="text-gray-400 hover:text-gray-900 transition-colors bg-white p-2 rounded-full hover:bg-gray-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 md:p-8 space-y-6">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><LifeBuoy className="w-3.5 h-3.5"/> Original Issue</p>
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <p className="text-sm font-black text-gray-900 mb-1">{selectedFeedback.subject}</p>
                                    <p className="text-xs font-medium text-gray-500 leading-relaxed">{selectedFeedback.message}</p>
                                </div>
                            </div>
                            
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Star className="w-3.5 h-3.5"/> Satisfaction Score</p>
                                <div className="flex items-center gap-1.5 bg-amber-50 w-fit px-4 py-2.5 rounded-xl border border-amber-100 shadow-sm">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} className={`w-5 h-5 ${star <= selectedFeedback.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                                    ))}
                                    <span className="ml-2 text-sm font-black text-amber-700">{selectedFeedback.rating}.0</span>
                                </div>
                            </div>

                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5"/> Landlord Note</p>
                                <div className="text-sm font-medium text-indigo-900 leading-relaxed bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 relative">
                                    <div className="absolute top-2 left-2 text-indigo-200 opacity-50 text-4xl font-serif">"</div>
                                    <p className="relative z-10 italic">
                                        {selectedFeedback.feedback}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button 
                                onClick={() => setSelectedFeedback(null)} 
                                className="px-8 py-3 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-black transition-colors shadow-lg active:scale-95"
                            >
                                Close Window
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}