// apps/web/app/portal/announcements/page.tsx
/* eslint-disable */
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
    BellRing, Loader2, AlertCircle, 
    AlertTriangle, Info, ShieldAlert,
    Clock, Search, Filter, Megaphone,
    Building2
} from 'lucide-react';

export default function TenantAnnouncementsPage() {
    const router = useRouter();
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Advanced UI States
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('ALL');

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                // SECURE COOKIE FETCH
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portal/announcements`, {
                    credentials: 'include' 
                });

                // Security Check: Redirect unauthenticated tenants to login
                if (res.status === 401 || res.status === 403) {
                    return router.push('/login');
                }

                if (!res.ok) throw new Error('Failed to load announcements');
                
                const data = await res.json();
                
                // Ensure data is sorted by newest first
                const sortedData = data.sort((a: any, b: any) => {
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                });

                setAnnouncements(sortedData);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAnnouncements();
    }, [router]);

    // --- DERIVED DATA & FILTERS ---
    const filteredAnnouncements = useMemo(() => {
        let result = announcements;

        if (filterType !== 'ALL') {
            result = result.filter(a => a.type === filterType);
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(a => 
                a.title.toLowerCase().includes(q) || 
                a.message.toLowerCase().includes(q)
            );
        }

        return result;
    }, [announcements, searchQuery, filterType]);

    // Calculate if notice was posted in the last 3 days
    const isRecentlyPosted = (dateString: string) => {
        const postedDate = new Date(dateString);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - postedDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        return diffDays <= 3;
    };

    if (isLoading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-[#f8fafb]">
                <div className="relative">
                    <Loader2 className="w-12 h-12 animate-spin text-[#1f8898]" />
                    <div className="absolute inset-0 blur-xl bg-[#1f8898]/20 animate-pulse"></div>
                </div>
                <p className="text-sm font-bold text-gray-500 mt-4 uppercase tracking-widest">Loading Notice Board...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafb] p-6">
                <div className="max-w-md w-full p-8 bg-white border border-rose-100 shadow-xl shadow-rose-100/50 rounded-3xl text-center">
                    <div className="bg-rose-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-rose-100">
                        <AlertCircle className="text-rose-600 w-8 h-8" />
                    </div>
                    <h2 className="text-gray-900 font-black text-2xl mb-2 tracking-tight">Access Error</h2>
                    <p className="text-gray-500 font-medium mb-8">{error}</p>
                    <button onClick={() => window.location.reload()} className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-lg shadow-rose-600/20 transition-all active:scale-95">
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    const getIconAndColors = (type: string) => {
        switch (type) {
            case 'EMERGENCY': 
                return { icon: <ShieldAlert className="w-6 h-6" />, bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', accent: 'bg-rose-500' };
            case 'WARNING': 
                return { icon: <AlertTriangle className="w-6 h-6" />, bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', accent: 'bg-amber-400' };
            case 'INFO': 
            default: 
                return { icon: <Info className="w-6 h-6" />, bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', accent: 'bg-[#1f8898]' };
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans selection:bg-[#1f8898]/30 overflow-x-hidden">

            {/* --- Advanced Gradient Hero Area --- */}
            <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-6 pt-10 pb-24 relative overflow-hidden shadow-inner">
                <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 max-w-5xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-teal-100 text-[10px] font-black uppercase tracking-widest mb-4 border border-white/20 backdrop-blur-sm">
                            <BellRing className="w-3.5 h-3.5" /> Notice Board
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-[#ffffff] tracking-tight mb-2">
                            Announcements
                        </h1>
                        <p className="text-teal-100 text-sm md:text-base font-medium max-w-xl">
                            Stay updated with official property alerts, maintenance notices, and community news.
                        </p>
                    </div>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 -mt-12 relative z-20 space-y-6">
                
                {/* --- Search & Filter Bar --- */}
                <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search notices..." 
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-gray-50/50 text-sm font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex w-full md:w-auto overflow-x-auto hide-scrollbar gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100 shrink-0">
                        {['ALL', 'INFO', 'WARNING', 'EMERGENCY'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap
                                    ${filterType === type 
                                        ? 'bg-white text-gray-900 shadow-sm border border-gray-200' 
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                    }
                                `}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- Announcements Feed --- */}
                <div className="space-y-5">
                    {filteredAnnouncements.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                            <div className="w-20 h-20 bg-[#ebf3f5] rounded-full flex items-center justify-center mx-auto mb-4">
                                <Megaphone className="w-8 h-8 text-[#1f8898]" />
                            </div>
                            <h3 className="text-gray-900 font-black text-xl mb-1">No Announcements</h3>
                            <p className="text-sm font-medium text-gray-500">
                                {searchQuery ? "We couldn't find any notices matching your search." : "Your property manager hasn't posted any official notices yet."}
                            </p>
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="mt-4 text-[#1f8898] text-sm font-bold hover:underline">
                                    Clear Search
                                </button>
                            )}
                        </div>
                    ) : (
                        filteredAnnouncements.map((ann) => {
                            const style = getIconAndColors(ann.type);
                            const isNew = isRecentlyPosted(ann.created_at);

                            return (
                                <div key={ann.id} className="bg-[#ffffff] p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-5 md:gap-6 group hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden">
                                    
                                    {/* Left Accent Bar for New items */}
                                    {isNew && (
                                        <div className={`absolute top-0 left-0 w-1.5 h-full ${style.accent}`}></div>
                                    )}

                                    <div className="flex flex-col sm:items-center gap-4 shrink-0">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${style.bg} ${style.text} ${style.border} shadow-sm group-hover:scale-105 transition-transform`}>
                                            {style.icon}
                                        </div>
                                        {isNew && (
                                            <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border animate-pulse ${style.bg} ${style.text} ${style.border}`}>
                                                New
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{ann.type}</span>
                                                    <span className="text-gray-300">•</span>
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1">
                                                        <Building2 className="w-3 h-3" /> Official Notice
                                                    </span>
                                                </div>
                                                <h3 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight leading-tight group-hover:text-[#1f8898] transition-colors">
                                                    {ann.title}
                                                </h3>
                                            </div>
                                            
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                                <Clock className="w-3.5 h-3.5" />
                                                {new Date(ann.created_at).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}
                                            </div>
                                        </div>
                                        
                                        <div className="mt-4 text-sm font-medium text-gray-600 leading-relaxed bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                                            {/* Preserves formatting if the landlord used newlines */}
                                            <p className="whitespace-pre-wrap">{ann.message}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </main>
        </div>
    );
}