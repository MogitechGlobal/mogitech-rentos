// apps/web/app/super-admin/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
    Loader2, TrendingUp, Building2, Users, Activity, 
    AlertCircle, AlertTriangle, ShieldCheck, Headset, 
    Settings, Megaphone, ArrowRight, Clock, UserCircle,
    Calendar, LayoutDashboard, ChevronRight
} from 'lucide-react';

export default function SuperAdminOverview() {
    const router = useRouter();
    
    // Combined State for all Dashboard Data
    const [data, setData] = useState<{
        stats: any;
        settings: any;
        recentLogs: any[];
        pendingTickets: any[];
    } | null>(null);
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- ADVANCED FILTERS STATE ---
    const [dateFilter, setDateFilter] = useState('ALL');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const reqOptions = { credentials: 'include' as RequestCredentials };
                
                // Fetch everything in parallel for speed
                const [statsRes, settingsRes, logsRes, ticketsRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard`, reqOptions),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/settings`, reqOptions),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/audit-logs?page=1`, reqOptions),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/support-tickets?page=1`, reqOptions)
                ]);

                if (statsRes.status === 401 || statsRes.status === 403) return router.push('/super-admin/login');
                if (!statsRes.ok) throw new Error('Failed to load core dashboard stats.');

                const statsData = await statsRes.json();
                const settingsData = settingsRes.ok ? await settingsRes.json() : null;
                const logsData = logsRes.ok ? await logsRes.json() : { data: [] };
                const ticketsData = ticketsRes.ok ? await ticketsRes.json() : { data: [] };

                // Filter tickets to only show actionable ones
                const activeTickets = (ticketsData.data || []).filter((t: any) => t.status !== 'RESOLVED').slice(0, 10);

                setData({
                    stats: statsData.overview,
                    settings: settingsData,
                    recentLogs: (logsData.data || []).slice(0, 15), 
                    pendingTickets: activeTickets
                });
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboardData();
    }, [router]);

    // --- CLIENT-SIDE DATE FILTERING FOR LOGS & TICKETS ---
    const filterByDate = (items: any[]) => {
        if (dateFilter === 'ALL') return items;
        
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        return items.filter(item => {
            const itemDate = new Date(item.created_at);

            switch (dateFilter) {
                case 'TODAY':
                    return itemDate >= today;
                case 'YESTERDAY':
                    const yesterdayStart = new Date(today);
                    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
                    return itemDate >= yesterdayStart && itemDate < today;
                case 'THIS_WEEK':
                    const weekStart = new Date(today);
                    weekStart.setDate(today.getDate() - today.getDay());
                    return itemDate >= weekStart;
                case 'THIS_MONTH':
                    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                    return itemDate >= monthStart;
                case 'THIS_YEAR':
                    const yearStart = new Date(now.getFullYear(), 0, 1);
                    return itemDate >= yearStart;
                case 'CUSTOM':
                    if (customStartDate && customEndDate) {
                        const start = new Date(customStartDate);
                        const end = new Date(customEndDate);
                        end.setHours(23, 59, 59, 999);
                        return itemDate >= start && itemDate <= end;
                    }
                    return true;
                default:
                    return true;
            }
        });
    };

    const filteredLogs = useMemo(() => data ? filterByDate(data.recentLogs).slice(0, 6) : [], [data, dateFilter, customStartDate, customEndDate]);
    const filteredTickets = useMemo(() => data ? filterByDate(data.pendingTickets).slice(0, 4) : [], [data, dateFilter, customStartDate, customEndDate]);

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[600px] bg-[#f8fafb]">
                <Loader2 className="w-10 h-10 animate-spin text-[#1f8898] mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Loading Command Center...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-rose-50 border border-rose-200 rounded-3xl flex flex-col items-center justify-center text-center gap-3 shadow-sm min-h-[400px] max-w-2xl mx-auto mt-12">
                <AlertCircle className="w-12 h-12 text-rose-500 shrink-0 mb-2" />
                <p className="font-black text-rose-900 text-xl tracking-tight">Connection Error</p>
                <p className="text-sm font-medium text-rose-700 max-w-md leading-relaxed">{error}</p>
                <button onClick={() => window.location.reload()} className="mt-4 px-8 py-3 bg-rose-600 text-white rounded-xl font-bold shadow-md hover:bg-rose-700 active:scale-95 transition-all">Retry Connection</button>
            </div>
        );
    }

    if (!data) return null;

    const { stats, settings } = data;

    return (
        <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans selection:bg-[#1f8898]/30 overflow-x-hidden">
            
            {/* --- Premium Gradient Hero Area --- */}
            <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-6 pt-8 pb-24 relative overflow-hidden shadow-inner">
                <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 max-w-[1400px] mx-auto flex flex-col xl:flex-row xl:items-end justify-between gap-6">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-teal-100 text-[10px] font-black uppercase tracking-widest mb-4 border border-white/20 backdrop-blur-sm">
                            <LayoutDashboard className="w-3.5 h-3.5" /> Super Admin
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-[#ffffff] tracking-tight mb-3">
                            Command Center
                        </h1>
                        <p className="text-teal-50 text-sm md:text-base font-medium max-w-xl leading-relaxed">
                            High-level overview of platform operations, global revenue metrics, and recent administrative security activity.
                        </p>
                    </div>

                    {/* Date Filter Action (Mobile Responsive Stack) */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                        <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-3.5 sm:py-3 backdrop-blur-md hover:bg-white/20 transition-colors w-full sm:w-auto shadow-sm">
                            <Calendar className="w-4 h-4 text-teal-100 shrink-0" />
                            <select 
                                className="text-xs font-black text-white bg-transparent outline-none cursor-pointer uppercase tracking-widest [&>option]:text-gray-900 w-full"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                            >
                                <option value="ALL">All Time Activity</option>
                                <option value="TODAY">Today's Activity</option>
                                <option value="YESTERDAY">Yesterday</option>
                                <option value="THIS_WEEK">This Week</option>
                                <option value="THIS_MONTH">This Month</option>
                                <option value="THIS_YEAR">This Year</option>
                                <option value="CUSTOM">Custom Range</option>
                            </select>
                        </div>
                        
                        {dateFilter === 'CUSTOM' && (
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 animate-in fade-in zoom-in-95 w-full sm:w-auto">
                                <input 
                                    type="date" 
                                    className="px-4 py-3.5 sm:py-3 rounded-xl border border-white/20 bg-white/10 text-white text-xs font-bold outline-none focus:border-white backdrop-blur-md w-full sm:w-auto shadow-sm cursor-pointer"
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                />
                                <span className="hidden sm:block text-teal-100 text-xs font-bold">-</span>
                                <input 
                                    type="date" 
                                    className="px-4 py-3.5 sm:py-3 rounded-xl border border-white/20 bg-white/10 text-white text-xs font-bold outline-none focus:border-white backdrop-blur-md w-full sm:w-auto shadow-sm cursor-pointer"
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <main className="max-w-[1400px] mx-auto px-4 sm:px-6 -mt-14 relative z-20 space-y-6">
                
                {/* --- MAINTENANCE MODE WARNING --- */}
                {settings?.maintenance_mode && (
                    <div className="bg-rose-600 text-white p-4 sm:p-5 rounded-2xl shadow-xl flex items-start sm:items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
                        <div className="bg-white/20 p-2.5 rounded-xl shrink-0">
                            <AlertTriangle className="w-6 h-6 text-white animate-pulse" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-black text-lg tracking-tight">Maintenance Mode is ACTIVE</h3>
                            <p className="text-rose-100 text-sm font-medium leading-tight mt-0.5">
                                All Landlords and Tenants are currently locked out of the platform.
                            </p>
                        </div>
                        <Link href="/super-admin/settings" className="hidden sm:flex px-6 py-2.5 bg-white text-rose-600 text-xs font-black uppercase tracking-widest rounded-xl shadow-sm hover:bg-rose-50 transition-colors shrink-0 active:scale-95">
                            Manage Settings
                        </Link>
                    </div>
                )}

                {/* --- TOP METRICS GRID --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all hover:-translate-y-1">
                        <div className="absolute -right-4 -top-4 w-28 h-28 bg-emerald-50 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-100 transition-colors"></div>
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-sm">
                                <TrendingUp className="w-6 h-6 text-emerald-600" />
                            </div>
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">Live</span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-1">Estimated MRR</p>
                            <p className="text-3xl font-black text-gray-900 tracking-tight">
                                <span className="text-base text-gray-400 mr-1 font-bold">KSH</span>{stats.monthly_recurring_revenue.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all hover:-translate-y-1">
                        <div className="absolute -right-4 -top-4 w-28 h-28 bg-blue-50 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-100 transition-colors"></div>
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 shadow-sm">
                                <Building2 className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-1">Active Landlords</p>
                            <p className="text-3xl font-black text-gray-900 tracking-tight">{stats.total_landlords}</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all hover:-translate-y-1">
                        <div className="absolute -right-4 -top-4 w-28 h-28 bg-indigo-50 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-100 transition-colors"></div>
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-sm">
                                <Users className="w-6 h-6 text-indigo-600" />
                            </div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Tenants</p>
                            <p className="text-3xl font-black text-gray-900 tracking-tight">{stats.total_tenants}</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all hover:-translate-y-1">
                        <div className="absolute -right-4 -top-4 w-28 h-28 bg-purple-50 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-100 transition-colors"></div>
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100 shadow-sm">
                                <Activity className="w-6 h-6 text-purple-600" />
                            </div>
                            <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100">24h</span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-1">M-Pesa IPN Hits</p>
                            <p className="text-3xl font-black text-gray-900 tracking-tight">{stats.recent_transactions_24h}</p>
                        </div>
                    </div>
                </div>

                {/* --- TWO COLUMN LAYOUT (Fixed alignment to prevent stretching) --- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* LEFT COLUMN: Actions & Support */}
                    <div className="lg:col-span-7 flex flex-col gap-6">
                        
                        {/* Active Support Tickets */}
                        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 border border-rose-100 shadow-sm shrink-0">
                                        <Headset className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-gray-900 tracking-tight">Action Needed</h3>
                                        <p className="text-xs font-medium text-gray-500 mt-0.5">Unresolved landlord support tickets.</p>
                                    </div>
                                </div>
                                <Link href="/super-admin/support" className="inline-flex text-sm font-bold text-[#1f8898] hover:text-white bg-[#1f8898]/10 hover:bg-[#1f8898] px-4 py-2 rounded-xl transition-colors items-center justify-center gap-1.5 shrink-0">
                                    View All <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                            <div className="p-4 sm:p-6 bg-white">
                                {filteredTickets.length === 0 ? (
                                    <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-gray-100 border-dashed">
                                        <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm">
                                            <ShieldCheck className="w-7 h-7" />
                                        </div>
                                        <p className="font-black text-gray-900 text-lg tracking-tight">Inbox Zero!</p>
                                        <p className="text-sm text-gray-500 font-medium mt-1">No unresolved tickets for the selected period.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {filteredTickets.map((t: any) => (
                                            <div key={t.id} className="p-5 rounded-2xl border border-gray-100 bg-[#f8fafb] hover:bg-white hover:border-[#1f8898]/30 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                                                <div className="min-w-0"> {/* min-w-0 ensures truncation works */}
                                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border shadow-sm ${
                                                            t.priority === 'URGENT' || t.priority === 'HIGH' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                                                        }`}>
                                                            {t.priority}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> {new Date(t.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <h4 className="font-black text-gray-900 text-[15px] group-hover:text-[#1f8898] transition-colors truncate">{t.subject}</h4>
                                                    <p className="text-xs font-bold text-gray-500 mt-1.5 flex items-center gap-1.5 truncate">
                                                        <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" /> {t.landlord?.company_name}
                                                    </p>
                                                </div>
                                                <Link href="/super-admin/support" className="shrink-0 w-full sm:w-auto text-center px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-xs font-black rounded-xl shadow-sm hover:border-[#1f8898] hover:text-[#1f8898] hover:bg-teal-50 transition-colors active:scale-95">
                                                    Resolve
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions Bento (Responsive Grid) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                            <Link href="/super-admin/announcements" className="bg-gradient-to-br from-[#1f8898] to-[#166c7a] p-6 sm:p-8 rounded-3xl text-white hover:shadow-xl hover:shadow-[#1f8898]/30 transition-all flex flex-col justify-between min-h-[160px] group relative overflow-hidden">
                                <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
                                <Megaphone className="w-8 h-8 text-teal-100 group-hover:scale-110 transition-transform duration-300 relative z-10" />
                                <div className="relative z-10 mt-6">
                                    <h4 className="font-black tracking-tight text-xl mb-1">Broadcast</h4>
                                    <p className="text-xs text-teal-100 font-medium flex items-center gap-1 group-hover:text-white transition-colors">
                                        Send global notice <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -ml-2 group-hover:ml-0 transition-all" />
                                    </p>
                                </div>
                            </Link>
                            
                            <Link href="/super-admin/settings" className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 sm:p-8 rounded-3xl text-white hover:shadow-xl hover:shadow-gray-900/30 transition-all flex flex-col justify-between min-h-[160px] group relative overflow-hidden">
                                <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors"></div>
                                <Settings className="w-8 h-8 text-gray-400 group-hover:rotate-90 group-hover:text-gray-200 transition-all duration-500 relative z-10" />
                                <div className="relative z-10 mt-6">
                                    <h4 className="font-black tracking-tight text-xl mb-1">Settings</h4>
                                    <p className="text-xs text-gray-400 font-medium flex items-center gap-1 group-hover:text-white transition-colors">
                                        Platform config <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -ml-2 group-hover:ml-0 transition-all" />
                                    </p>
                                </div>
                            </Link>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Audit Ledger (Scrollable container to prevent page stretching) */}
                    <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col max-h-[800px]">
                        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm shrink-0">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 tracking-tight">Security Ledger</h3>
                                    <p className="text-xs font-medium text-gray-500 mt-0.5">Administrative audit trail.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-5 sm:p-6 flex-1 overflow-y-auto bg-white scrollbar-thin scrollbar-thumb-gray-200">
                            {filteredLogs.length === 0 ? (
                                <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-gray-100 border-dashed">
                                    <Activity className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                                    <p className="text-sm font-bold text-gray-600">No Activity</p>
                                    <p className="text-xs font-medium text-gray-400 mt-1">No audit logs for the selected period.</p>
                                </div>
                            ) : (
                                <div className="relative border-l-2 border-gray-100 ml-3 md:ml-4 space-y-6 pb-4">
                                    {filteredLogs.map((log: any) => {
                                        const isDanger = log.action.includes('SUSPEND') || log.action.includes('DELETE');
                                        const isWarning = log.action.includes('UPDATE') || log.action.includes('IMPERSONATE') || log.action.includes('INVITE');
                                        
                                        const colorClass = isDanger ? 'border-rose-500 bg-rose-50' : isWarning ? 'border-amber-500 bg-amber-50' : 'border-[#1f8898] bg-teal-50';
                                        const badgeClass = isDanger ? 'text-rose-700 bg-rose-100/50 border-rose-200' : isWarning ? 'text-amber-700 bg-amber-100/50 border-amber-200' : 'text-[#1f8898] bg-teal-50 border-teal-200';

                                        return (
                                            <div key={log.id} className="relative pl-6 sm:pl-8 group">
                                                {/* Timeline Node */}
                                                <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 bg-white shadow-sm transition-transform group-hover:scale-125 ${colorClass}`}></div>
                                                
                                                {/* Log Card */}
                                                <div className="bg-[#f8fafb] p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm group-hover:shadow-md group-hover:bg-white group-hover:border-gray-200 transition-all">
                                                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border ${badgeClass}`}>
                                                            {log.action.replace(/_/g, ' ')}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm">
                                                            <Clock className="w-3 h-3" /> {new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                        </span>
                                                    </div>
                                                    
                                                    <p className="text-sm text-gray-800 font-medium leading-relaxed mb-3">
                                                        {log.details}
                                                    </p>
                                                    
                                                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100/80">
                                                        <UserCircle className="w-4 h-4 text-gray-400 shrink-0" />
                                                        <span className="text-[11px] font-black text-gray-500 tracking-wide truncate">
                                                            {log.admin_email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                            
                            <div className="mt-6 pt-4 text-center border-t border-gray-100">
                                <Link href="/super-admin/audit-logs" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-[#1f8898] bg-gray-50 hover:bg-teal-50 px-6 py-3 rounded-xl transition-all border border-transparent hover:border-teal-100 active:scale-95">
                                    View Full Ledger <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}