// apps/web/app/dashboard/communications/page.tsx
/* eslint-disable */
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
    BellRing, Send, Loader2, ShieldAlert, 
    CheckCircle2, Megaphone, History, 
    Search, Users, Building2, AlertTriangle, Info, Clock
} from 'lucide-react';

export default function CommunicationsPage() {
    const router = useRouter();
    const [properties, setProperties] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Advanced UI States
    const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose');
    const [searchQuery, setSearchQuery] = useState('');
    const [localAnnouncements, setLocalAnnouncements] = useState<any[]>([]);

    // Form States
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMsg, setStatusMsg] = useState<{type: 'success'|'error', text: string} | null>(null);
    const [formData, setFormData] = useState({
        propertyId: '',
        title: '',
        message: '',
        type: 'INFO'
    });

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties`, {
                    credentials: 'include' // <-- FIXED: Cleaned up the mangled syntax
                });
                
                // Security Check: Kick to login if cookie is missing/invalid
                if (res.status === 401 || res.status === 403) return router.push('/login');
                if (!res.ok) throw new Error('Failed to load properties');

                const data = await res.json();
                setProperties(data);
                
                if (data.length > 0) {
                    setFormData(prev => ({ ...prev, propertyId: data[0].id }));
                }

                // Extract and flatten all announcements
                const allAnnouncements = data.flatMap((p: any) => 
                    (p.announcements || []).map((a: any) => ({ ...a, propertyName: p.name }))
                ).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                
                setLocalAnnouncements(allAnnouncements);

            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProperties();
    }, [router]);

    const handleBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatusMsg(null);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties/${formData.propertyId}/announcements`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }, // <-- FIXED: Removed Authorization header
                credentials: 'include', // <-- FIXED: Added credentials
                body: JSON.stringify({ title: formData.title, message: formData.message, type: formData.type })
            });

            const responseData = await res.json();
            if (!res.ok) throw new Error(responseData.message || 'Failed to broadcast announcement.');
            
            setStatusMsg({ type: 'success', text: 'Announcement successfully broadcasted to tenants!' });
            
            // Instantly update the history tab with the new announcement
            const targetProp = properties.find(p => p.id === formData.propertyId);
            setLocalAnnouncements(prev => [{
                ...responseData.announcement,
                propertyName: targetProp?.name,
                created_at: new Date().toISOString()
            }, ...prev]);

            setFormData(prev => ({ ...prev, title: '', message: '', type: 'INFO' }));
            setTimeout(() => setStatusMsg(null), 4000);
        } catch (err: any) {
            setStatusMsg({ type: 'error', text: err.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- DERIVED METRICS ---
    const targetProperty = properties.find(p => p.id === formData.propertyId);
    const activeTenantsCount = targetProperty?.units?.flatMap((u: any) => u.tenants).filter((t: any) => t.is_active).length || 0;
    
    const filteredAnnouncements = useMemo(() => {
        if (!searchQuery) return localAnnouncements;
        const q = searchQuery.toLowerCase();
        return localAnnouncements.filter(a => 
            a.title.toLowerCase().includes(q) || 
            a.message.toLowerCase().includes(q) ||
            a.propertyName.toLowerCase().includes(q)
        );
    }, [localAnnouncements, searchQuery]);

    const getUrgencyColors = (type: string) => {
        switch (type) {
            case 'EMERGENCY': return { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', icon: <ShieldAlert className="w-5 h-5" /> };
            case 'WARNING': return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: <AlertTriangle className="w-5 h-5" /> };
            case 'INFO': 
            default: return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: <Info className="w-5 h-5" /> };
        }
    };

    if (isLoading) {
        return (
            <div className="h-full min-h-screen flex flex-col items-center justify-center bg-[#f8fafb]">
                <div className="relative">
                    <Loader2 className="w-12 h-12 animate-spin text-[#1f8898]" />
                    <div className="absolute inset-0 blur-xl bg-[#1f8898]/20 animate-pulse"></div>
                </div>
                <p className="text-sm font-bold text-gray-500 mt-4 uppercase tracking-widest">Loading Comms Hub...</p>
            </div>
        );
    }

    const inputStyle = "w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-gray-50/50 text-gray-900 font-medium text-sm";

    return (
        <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans selection:bg-[#1f8898]/30 overflow-x-hidden">
            
            {/* --- Executive Gradient Hero --- */}
            <div className="bg-gradient-to-br from-[#0d393f] to-[#1f8898] px-6 pt-10 pb-24 relative overflow-hidden shadow-inner">
                <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 text-teal-100 text-[10px] font-black uppercase tracking-widest mb-4 border border-white/20 backdrop-blur-sm">
                            <Megaphone className="w-3.5 h-3.5" /> Broadcasting
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-[#ffffff] tracking-tight mb-2">
                            Communications
                        </h1>
                        <p className="text-teal-100 text-sm md:text-base font-medium max-w-xl">
                            Send official notices, track broadcast history, and manage tenant alerts.
                        </p>
                    </div>
                </div>
            </div>

            {/* --- Main Dashboard Content --- */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 -mt-12 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* LEFT: Target Panel & Analytics */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-6 relative overflow-hidden group hover:shadow-md transition-shadow">
                            <div className="absolute -right-8 -top-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                                <Building2 className="w-40 h-40" />
                            </div>

                            <div className="relative z-10">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Target Property</label>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
                                    <select 
                                        className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-gray-50/50 text-gray-900 font-bold text-sm appearance-none cursor-pointer" 
                                        value={formData.propertyId} 
                                        onChange={e => setFormData({...formData, propertyId: e.target.value})}
                                    >
                                        {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Reach Metric */}
                            <div className="relative z-10 pt-6 border-t border-gray-100">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Estimated Reach</p>
                                <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black text-blue-700 leading-none">{activeTenantsCount}</p>
                                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">Active Tenants</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {statusMsg && (
                            <div className={`p-5 rounded-2xl border items-start gap-3 font-bold text-sm animate-in fade-in zoom-in-95 duration-300 shadow-sm flex
                                ${statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}
                            `}>
                                {statusMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />}
                                <span className="leading-relaxed">{statusMsg.text}</span>
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Main Interface */}
                    <div className="lg:col-span-8 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[600px]">
                        
                        {/* Tab Switcher Header */}
                        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 pr-4">
                            <div className="flex">
                                <button 
                                    onClick={() => setActiveTab('compose')}
                                    className={`px-6 md:px-8 py-5 text-sm font-black uppercase tracking-widest transition-all border-b-2 flex items-center gap-2
                                        ${activeTab === 'compose' ? `border-[#1f8898] text-[#1f8898] bg-white` : 'border-transparent text-gray-400 hover:text-gray-600'}
                                    `}
                                >
                                    <Megaphone className="w-4 h-4" /> Compose
                                </button>
                                <button 
                                    onClick={() => setActiveTab('history')}
                                    className={`px-6 md:px-8 py-5 text-sm font-black uppercase tracking-widest transition-all border-b-2 flex items-center gap-2
                                        ${activeTab === 'history' ? `border-[#1f8898] text-[#1f8898] bg-white` : 'border-transparent text-gray-400 hover:text-gray-600'}
                                    `}
                                >
                                    <History className="w-4 h-4" /> History <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-[10px]">{localAnnouncements.length}</span>
                                </button>
                            </div>
                        </div>

                        {/* --- VIEW: COMPOSE --- */}
                        {activeTab === 'compose' && (
                            <form onSubmit={handleBroadcast} className="flex flex-col flex-1 animate-in fade-in duration-300">
                                <div className="p-6 md:p-8 space-y-6 flex-1">
                                    
                                    <div>
                                        <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">Urgency Level</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {['INFO', 'WARNING', 'EMERGENCY'].map((type) => {
                                                const colors = getUrgencyColors(type);
                                                const isSelected = formData.type === type;
                                                return (
                                                    <button 
                                                        key={type} type="button" onClick={() => setFormData({...formData, type})}
                                                        className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all active:scale-95
                                                            ${isSelected ? `${colors.bg} ${colors.border} ring-2 ring-offset-1 ring-${colors.border.split('-')[1]}-400` : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-400'}
                                                        `}
                                                    >
                                                        <div className={isSelected ? colors.text : 'text-gray-400'}>{colors.icon}</div>
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? colors.text : 'text-gray-500'}`}>{type}</span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">Notice Title</label>
                                        <input type="text" required placeholder="e.g., Scheduled Power Outage" className={inputStyle} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">Message Body</label>
                                        <textarea required rows={8} placeholder="Type the full announcement here. Tenants will receive this in their portal dashboard immediately..." className={`${inputStyle} resize-none`} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />
                                    </div>
                                </div>

                                <div className="p-5 md:p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
                                    <p className="text-xs font-bold text-gray-400 hidden sm:block flex-1">Instant push to active tenant portals.</p>
                                    <button 
                                        type="submit" disabled={isSubmitting || !formData.propertyId} 
                                        className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 text-white font-black text-sm rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 bg-[#1f8898] hover:bg-[#1a7684] shadow-[#1f8898]/20"
                                    >
                                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />} 
                                        {isSubmitting ? 'Broadcasting...' : 'Broadcast Notice'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* --- VIEW: HISTORY --- */}
                        {activeTab === 'history' && (
                            <div className="flex flex-col flex-1 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="p-4 md:p-6 border-b border-gray-100 bg-white">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-3 w-4 h-4 text-gray-400" />
                                        <input 
                                            type="text" placeholder="Search past announcements..." 
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#1f8898] text-sm font-medium"
                                            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="p-4 md:p-6 bg-gray-50/30 flex-1 overflow-y-auto">
                                    {localAnnouncements.length === 0 ? (
                                        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                                                <History className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <h3 className="text-gray-900 font-black text-lg">No Broadcast History</h3>
                                            <p className="text-sm font-medium text-gray-500 mt-1">You haven't sent any announcements yet.</p>
                                        </div>
                                    ) : filteredAnnouncements.length === 0 ? (
                                        <div className="text-center py-12">
                                            <p className="text-sm font-bold text-gray-400">No announcements match your search.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {filteredAnnouncements.map((ann) => {
                                                const colors = getUrgencyColors(ann.type);
                                                return (
                                                    <div key={ann.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 group hover:border-[#1f8898]/30 transition-all">
                                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${colors.bg} ${colors.text} ${colors.border}`}>
                                                            {colors.icon}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <h4 className="font-black text-gray-900 group-hover:text-[#1f8898] transition-colors tracking-tight">{ann.title}</h4>
                                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    {new Date(ann.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                                                <Building2 className="w-3.5 h-3.5" /> {ann.propertyName}
                                                            </p>
                                                            <p className="text-sm font-medium text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                                                                {ann.message}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}