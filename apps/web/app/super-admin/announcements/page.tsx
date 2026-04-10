// apps/web/app/super-admin/announcements/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
    Megaphone, Loader2, Send, Trash2, AlertCircle, 
    Clock, Users, Building2, Globe, RadioReceiver, 
    Calendar, Filter, CheckCircle2, X, Search,
} from 'lucide-react';

export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // --- ADVANCED FILTERS STATE ---
    const [searchQuery, setSearchQuery] = useState('');
    const [filterAudience, setFilterAudience] = useState('ANY');
    const [filterUrgency, setFilterUrgency] = useState('ANY');
    const [dateFilter, setDateFilter] = useState('ALL');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    // --- MODAL STATE ---
    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        target_audience: 'ALL',
        is_urgent: false
    });

    const fetchAnnouncements = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/announcements`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setAnnouncements(data);
            }
        } catch (err) {
            console.error("Failed to fetch announcements", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchAnnouncements(); }, []);

    const handlePublish = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPublishing(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/announcements`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            });
            if (!res.ok) throw new Error('Failed to publish announcement');
            
            await fetchAnnouncements();
            setIsComposeOpen(false);
            setFormData({ title: '', content: '', target_audience: 'ALL', is_urgent: false });
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsPublishing(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this announcement? It will be removed from all user dashboards immediately.')) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/announcements/${id}/delete`, {
                method: 'POST',
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Failed to delete');
            setAnnouncements(prev => prev.filter(a => a.id !== id));
        } catch (err: any) {
            alert(err.message);
        }
    };

    // --- ADVANCED CLIENT-SIDE FILTERING ---
    const filteredAnnouncements = useMemo(() => {
        let result = announcements;

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(a => 
                a.title.toLowerCase().includes(lowerQuery) || 
                a.content.toLowerCase().includes(lowerQuery)
            );
        }

        if (filterAudience !== 'ANY') {
            result = result.filter(a => a.target_audience === filterAudience);
        }

        if (filterUrgency !== 'ANY') {
            const isUrgent = filterUrgency === 'URGENT';
            result = result.filter(a => a.is_urgent === isUrgent);
        }

        if (dateFilter !== 'ALL') {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            result = result.filter(a => {
                const aDate = new Date(a.created_at);

                switch (dateFilter) {
                    case 'TODAY':
                        return aDate >= today;
                    case 'YESTERDAY':
                        const yesterdayStart = new Date(today);
                        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
                        return aDate >= yesterdayStart && aDate < today;
                    case 'THIS_WEEK':
                        const weekStart = new Date(today);
                        weekStart.setDate(today.getDate() - today.getDay());
                        return aDate >= weekStart;
                    case 'THIS_MONTH':
                        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                        return aDate >= monthStart;
                    case 'THIS_YEAR':
                        const yearStart = new Date(now.getFullYear(), 0, 1);
                        return aDate >= yearStart;
                    case 'CUSTOM':
                        if (customStartDate && customEndDate) {
                            const start = new Date(customStartDate);
                            const end = new Date(customEndDate);
                            end.setHours(23, 59, 59, 999);
                            return aDate >= start && aDate <= end;
                        }
                        return true;
                    default:
                        return true;
                }
            });
        }

        return result;
    }, [announcements, searchQuery, filterAudience, filterUrgency, dateFilter, customStartDate, customEndDate]);

    // --- DERIVED METRICS ---
    const totalBroadcasts = filteredAnnouncements.length;
    const urgentCount = filteredAnnouncements.filter(a => a.is_urgent).length;
    const landlordCount = filteredAnnouncements.filter(a => a.target_audience === 'LANDLORDS').length;
    const tenantCount = filteredAnnouncements.filter(a => a.target_audience === 'TENANTS').length;

    const getAudienceIcon = (audience: string) => {
        if (audience === 'LANDLORDS') return <Building2 className="w-3.5 h-3.5" />;
        if (audience === 'TENANTS') return <Users className="w-3.5 h-3.5" />;
        return <Globe className="w-3.5 h-3.5" />;
    };

    const inputStyle = "w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all font-medium text-sm text-gray-900 bg-gray-50/50 hover:bg-white focus:bg-white shadow-sm";

    return (
        <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans selection:bg-[#1f8898]/30 overflow-x-hidden">
            
            {/* --- Premium Gradient Hero Area --- */}
            <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-6 pt-8 pb-20 relative overflow-hidden shadow-inner">
                <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-teal-100 text-[10px] font-black uppercase tracking-widest mb-4 border border-white/20 backdrop-blur-sm">
                            <RadioReceiver className="w-3.5 h-3.5" /> Communications
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-[#ffffff] tracking-tight mb-2">
                            Broadcast Center
                        </h1>
                        <p className="text-teal-100 text-sm md:text-base font-medium max-w-xl leading-relaxed">
                            Push real-time updates, policy changes, and urgent alerts directly to Landlord and Tenant dashboards.
                        </p>
                    </div>

                    <div className="flex animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                        <button 
                            onClick={() => setIsComposeOpen(true)}
                            className="bg-[#ffffff] text-[#1f8898] hover:bg-gray-50 px-6 py-3 rounded-xl font-black text-sm shadow-xl shadow-black/10 transition-all flex items-center justify-center gap-2 active:scale-95 w-full md:w-auto"
                        >
                            <Send className="w-4 h-4" /> Compose Message
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 relative z-20 space-y-6">
                
                {/* --- Bento Box Analytics Grid --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                                <Megaphone className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 text-right leading-tight">Total<br/>Broadcasts</span>
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">{totalBroadcasts}</h4>
                            <p className="text-xs text-gray-500 font-medium mt-1">Messages sent</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 text-right leading-tight">Urgent<br/>Alerts</span>
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">{urgentCount}</h4>
                            <p className="text-xs text-gray-500 font-medium mt-1">High-priority notices</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 text-right leading-tight">Landlord<br/>Specific</span>
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">{landlordCount}</h4>
                            <p className="text-xs text-gray-500 font-medium mt-1">Admin communications</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                                <Users className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 text-right leading-tight">Tenant<br/>Specific</span>
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">{tenantCount}</h4>
                            <p className="text-xs text-gray-500 font-medium mt-1">Resident updates</p>
                        </div>
                    </div>
                </div>

                {/* --- Main Content Container --- */}
                <div className="bg-white rounded-3xl shadow-lg shadow-black/5 border border-gray-100 overflow-hidden flex flex-col min-h-[500px] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                    
                    {/* Advanced Toolbar */}
                    <div className="p-4 md:p-5 border-b border-gray-100 bg-[#f8fafb]/50 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                        
                        <div className="flex flex-wrap items-center gap-3">
                            
                            {/* AUDIENCE & URGENCY FILTERS */}
                            <div className="flex items-center gap-2 pr-3 border-r border-gray-200">
                                <Filter className="w-4 h-4 text-gray-400" />
                                <select 
                                    className="text-[10px] font-black text-gray-700 bg-transparent outline-none cursor-pointer uppercase tracking-widest hover:text-[#1f8898] transition-colors"
                                    value={filterAudience}
                                    onChange={(e) => setFilterAudience(e.target.value)}
                                >
                                    <option value="ANY">All Audiences</option>
                                    <option value="ALL">Global (Everyone)</option>
                                    <option value="LANDLORDS">Landlords Only</option>
                                    <option value="TENANTS">Tenants Only</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2 pr-3 border-r border-gray-200">
                                <select 
                                    className="text-[10px] font-black text-gray-700 bg-transparent outline-none cursor-pointer uppercase tracking-widest hover:text-[#1f8898] transition-colors"
                                    value={filterUrgency}
                                    onChange={(e) => setFilterUrgency(e.target.value)}
                                >
                                    <option value="ANY">All Urgencies</option>
                                    <option value="URGENT">Urgent Only</option>
                                    <option value="STANDARD">Standard Only</option>
                                </select>
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
                        <div className="relative w-full xl:w-72 shrink-0">
                            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3" />
                            <input
                                type="text"
                                placeholder="Search announcements..."
                                className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-2.5 text-sm font-medium outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all bg-white shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Announcement List */}
                    <div className="overflow-y-auto flex-1 bg-gray-50/30 p-4 md:p-6">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full text-[#1f8898] gap-4">
                                <Loader2 className="w-8 h-8 animate-spin" />
                                <span className="font-bold text-sm uppercase tracking-widest text-gray-400">Loading Broadcasts...</span>
                            </div>
                        ) : filteredAnnouncements.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-16">
                                <div className="w-16 h-16 bg-white border border-gray-200 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                                    <Megaphone className="w-8 h-8 text-gray-300" />
                                </div>
                                <h3 className="text-gray-900 font-black text-lg mb-1">No Broadcasts Found</h3>
                                <p className="text-sm font-medium text-gray-500">Try adjusting your filters or compose a new message.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredAnnouncements.map((announcement) => (
                                    <div key={announcement.id} className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-[#1f8898]/30 hover:shadow-md transition-all group flex flex-col md:flex-row md:items-start justify-between gap-5 relative overflow-hidden">
                                        
                                        {/* Status Bar */}
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${announcement.is_urgent ? 'bg-rose-500' : 'bg-gray-200 group-hover:bg-[#1f8898] transition-colors'}`}></div>

                                        <div className="space-y-3 flex-1 pl-2">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                {announcement.is_urgent && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-rose-50 text-rose-700 border border-rose-100">
                                                        <AlertCircle className="w-3 h-3" /> Urgent
                                                    </span>
                                                )}
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-gray-50 text-gray-600 border border-gray-200">
                                                    {getAudienceIcon(announcement.target_audience)} 
                                                    {announcement.target_audience === 'ALL' ? 'Global Broadcast' : announcement.target_audience}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1 ml-2">
                                                    <Clock className="w-3 h-3" /> 
                                                    {new Date(announcement.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                </span>
                                            </div>
                                            
                                            <div>
                                                <h4 className="text-lg font-black text-gray-900 tracking-tight group-hover:text-[#1f8898] transition-colors">{announcement.title}</h4>
                                                <p className="text-sm font-medium text-gray-600 mt-2 leading-relaxed whitespace-pre-wrap">{announcement.content}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="shrink-0 flex md:flex-col items-center justify-end md:justify-start pt-3 md:pt-0 border-t md:border-t-0 border-gray-50">
                                            <button 
                                                onClick={() => handleDelete(announcement.id)}
                                                className="flex items-center gap-2 px-4 py-2 md:p-2.5 text-xs font-bold text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors md:opacity-0 group-hover:opacity-100 border border-transparent hover:border-rose-200"
                                                title="Delete Broadcast"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                <span className="md:hidden">Delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* --- PREMIUM COMPOSE MODAL --- */}
            {isComposeOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 flex flex-col">
                        
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-br from-gray-50 to-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#ebf3f5] rounded-xl flex items-center justify-center text-[#1f8898] border border-[#1f8898]/10">
                                    <Send className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-gray-900 tracking-tight">New Broadcast</h2>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-0.5">Push a real-time system message</p>
                                </div>
                            </div>
                            <button onClick={() => !isPublishing && setIsComposeOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handlePublish} className="p-6 md:p-8 space-y-6">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Target Audience</label>
                                        <select 
                                            className={inputStyle}
                                            value={formData.target_audience}
                                            onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                                        >
                                            <option value="ALL">All Users (Global)</option>
                                            <option value="LANDLORDS">Landlords Only</option>
                                            <option value="TENANTS">Tenants Only</option>
                                        </select>
                                    </div>
                                    
                                    <div className={`p-4 rounded-xl border transition-colors ${formData.is_urgent ? 'bg-rose-50 border-rose-200 shadow-sm' : 'bg-gray-50 border-gray-200'}`}>
                                        <label className="flex items-start gap-3 cursor-pointer group">
                                            <div className="flex items-center h-5 mt-0.5">
                                                <input 
                                                    type="checkbox" 
                                                    className="w-4 h-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                                                    checked={formData.is_urgent}
                                                    onChange={(e) => setFormData({ ...formData, is_urgent: e.target.checked })}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <span className={`text-sm font-black transition-colors ${formData.is_urgent ? 'text-rose-700' : 'text-gray-700 group-hover:text-rose-600'}`}>
                                                    Mark as Urgent Alert
                                                </span>
                                                <p className="text-xs font-medium text-gray-500 mt-1 leading-snug">
                                                    Flags the message in red and highlights it immediately on user dashboards.
                                                </p>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Announcement Title</label>
                                        <input 
                                            type="text" required placeholder="e.g., Scheduled System Maintenance"
                                            className={inputStyle}
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Message Content</label>
                                        <textarea 
                                            required rows={5} placeholder="Write your full message here..."
                                            className={`${inputStyle} resize-none`}
                                            value={formData.content}
                                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-5 border-t border-gray-100 flex justify-end gap-3 mt-8">
                                <button type="button" onClick={() => setIsComposeOpen(false)} className="px-5 py-3 rounded-xl text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isPublishing} className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-black text-white bg-[#1f8898] hover:bg-[#1a7684] transition-all shadow-lg shadow-[#1f8898]/20 disabled:opacity-50 active:scale-95">
                                    {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    {isPublishing ? 'Publishing...' : 'Publish Broadcast'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}