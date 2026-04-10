// apps/web/app/super-admin/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
    Loader2, TrendingUp, Building2, Users, Activity, 
    AlertCircle, AlertTriangle, ShieldCheck, Headset, 
    Settings, Megaphone, ArrowRight, Clock, UserCircle,
    Calendar, LayoutDashboard
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

                if (statsRes.status === 401 || statsRes.status === 403) return router.push('/login');
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
                    recentLogs: (logsData.data || []).slice(0, 15), // Grab a larger chunk to allow meaningful client-side filtering
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

    const filteredLogs = useMemo(() => data ? filterByDate(data.recentLogs).slice(0, 5) : [], [data, dateFilter, customStartDate, customEndDate]);
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
            <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col items-center justify-center text-center gap-3 shadow-sm min-h-[400px] m-6">
                <AlertCircle className="w-10 h-10 text-rose-500 shrink-0" />
                <p className="font-bold text-rose-800 text-lg">Connection Error</p>
                <p className="text-sm font-medium text-rose-600 max-w-md">{error}</p>
                <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-rose-600 text-white rounded-xl font-bold shadow-md hover:bg-rose-700">Retry</button>
            </div>
        );
    }

    if (!data) return null;

    const { stats, settings } = data;

    return (
        <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans selection:bg-[#1f8898]/30 overflow-x-hidden">
            
            {/* --- Premium Gradient Hero Area --- */}
            <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-6 pt-8 pb-20 relative overflow-hidden shadow-inner">
                <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-teal-100 text-[10px] font-black uppercase tracking-widest mb-4 border border-white/20 backdrop-blur-sm">
                            <LayoutDashboard className="w-3.5 h-3.5" /> Super Admin
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-[#ffffff] tracking-tight mb-2">
                            Command Center
                        </h1>
                        <p className="text-teal-100 text-sm md:text-base font-medium max-w-xl leading-relaxed">
                            High-level overview of platform operations, global metrics, and recent administrative activity.
                        </p>
                    </div>

                    {/* Date Filter Action */}
                    <div className="flex flex-col sm:flex-row items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                        <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 backdrop-blur-md hover:bg-white/20 transition-colors w-full sm:w-auto">
                            <Calendar className="w-4 h-4 text-teal-100" />
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
                            <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 w-full sm:w-auto">
                                <input 
                                    type="date" 
                                    className="px-3 py-2.5 rounded-xl border border-white/20 bg-white/10 text-white text-xs font-bold outline-none focus:border-white backdrop-blur-md w-full"
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                />
                                <span className="text-teal-100 text-xs font-bold">-</span>
                                <input 
                                    type="date" 
                                    className="px-3 py-2.5 rounded-xl border border-white/20 bg-white/10 text-white text-xs font-bold outline-none focus:border-white backdrop-blur-md w-full"
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 relative z-20 space-y-6">
                
                {/* --- MAINTENANCE MODE WARNING --- */}
                {settings?.maintenance_mode && (
                    <div className="bg-rose-600 text-white p-4 rounded-2xl shadow-lg flex items-start sm:items-center gap-4 animate-pulse">
                        <div className="bg-white/20 p-2 rounded-xl shrink-0">
                            <AlertTriangle className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-black text-lg tracking-tight">Maintenance Mode is ACTIVE</h3>
                            <p className="text-rose-100 text-sm font-medium leading-tight mt-0.5">
                                All Landlords and Tenants are currently locked out of the platform.
                            </p>
                        </div>
                        <Link href="/super-admin/settings" className="hidden sm:flex px-4 py-2 bg-white text-rose-600 text-xs font-black uppercase tracking-widest rounded-lg shadow-sm hover:bg-rose-50 transition-colors shrink-0">
                            Manage
                        </Link>
                    </div>
                )}

                {/* --- TOP METRICS GRID (Global Stats - Unaffected by local date filter) --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-100 transition-colors"></div>
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                                <TrendingUp className="w-6 h-6 text-emerald-600" />
                            </div>
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">Live</span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-1">Estimated MRR</p>
                            <p className="text-3xl font-black text-gray-900 tracking-tight">
                                <span className="text-base text-gray-400 mr-1">KSH</span>{stats.monthly_recurring_revenue.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-100 transition-colors"></div>
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                                <Building2 className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-1">Active Landlords</p>
                            <p className="text-3xl font-black text-gray-900 tracking-tight">{stats.total_landlords}</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-100 transition-colors"></div>
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                                <Users className="w-6 h-6 text-indigo-600" />
                            </div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Tenants</p>
                            <p className="text-3xl font-black text-gray-900 tracking-tight">{stats.total_tenants}</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-50 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-100 transition-colors"></div>
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100">
                                <Activity className="w-6 h-6 text-purple-600" />
                            </div>
                            <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest bg-purple-50 px-2.5 py-1 rounded-md border border-purple-100">24h</span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-1">M-Pesa IPN Hits</p>
                            <p className="text-3xl font-black text-gray-900 tracking-tight">{stats.recent_transactions_24h}</p>
                        </div>
                    </div>
                </div>

                {/* --- TWO COLUMN LAYOUT --- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* LEFT COLUMN: Actions & Support */}
                    <div className="lg:col-span-7 space-y-6">
                        
                        {/* Active Support Tickets */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 border border-rose-100">
                                        <Headset className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-gray-900 tracking-tight">Action Needed</h3>
                                        <p className="text-xs font-medium text-gray-500">Unresolved landlord support tickets.</p>
                                    </div>
                                </div>
                                <Link href="/super-admin/support" className="text-sm font-bold text-[#1f8898] hover:text-[#166c7a] flex items-center gap-1 bg-[#1f8898]/10 px-3 py-1.5 rounded-lg transition-colors">
                                    View All <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                            <div className="p-6">
                                {filteredTickets.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <ShieldCheck className="w-6 h-6" />
                                        </div>
                                        <p className="font-bold text-gray-900">Inbox Zero!</p>
                                        <p className="text-sm text-gray-500 font-medium">No unresolved tickets for the selected period.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {filteredTickets.map((t: any) => (
                                            <div key={t.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1.5">
                                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                                                            t.priority === 'URGENT' || t.priority === 'HIGH' ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-amber-100 text-amber-700 border-amber-200'
                                                        }`}>
                                                            {t.priority}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> {new Date(t.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <h4 className="font-black text-gray-900 text-sm group-hover:text-[#1f8898] transition-colors">{t.subject}</h4>
                                                    <p className="text-xs font-medium text-gray-500 mt-1">{t.landlord?.company_name}</p>
                                                </div>
                                                <Link href="/super-admin/support" className="shrink-0 w-full sm:w-auto text-center px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-lg shadow-sm hover:border-[#1f8898] hover:text-[#1f8898] transition-colors">
                                                    Resolve
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions Bento */}
                        <div className="grid grid-cols-2 gap-4">
                            <Link href="/super-admin/announcements" className="bg-[#1f8898] p-5 rounded-3xl text-white hover:bg-[#166c7a] transition-colors shadow-lg shadow-[#1f8898]/20 flex flex-col justify-between min-h-[140px] group">
                                <Megaphone className="w-8 h-8 text-teal-200 group-hover:scale-110 transition-transform" />
                                <div>
                                    <h4 className="font-black tracking-tight text-lg">Broadcast</h4>
                                    <p className="text-xs text-teal-100 font-medium">Send global notice</p>
                                </div>
                            </Link>
                            <Link href="/super-admin/settings" className="bg-gray-900 p-5 rounded-3xl text-white hover:bg-black transition-colors shadow-lg flex flex-col justify-between min-h-[140px] group">
                                <Settings className="w-8 h-8 text-gray-400 group-hover:rotate-90 transition-transform duration-500" />
                                <div>
                                    <h4 className="font-black tracking-tight text-lg">Settings</h4>
                                    <p className="text-xs text-gray-400 font-medium">Platform config</p>
                                </div>
                            </Link>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Audit Ledger */}
                    <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-100">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 tracking-tight">Security Ledger</h3>
                                    <p className="text-xs font-medium text-gray-500">Filtered admin actions.</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 flex-1">
                            {filteredLogs.length === 0 ? (
                                <p className="text-sm font-medium text-gray-500 text-center py-10">No recent audit logs for the selected period.</p>
                            ) : (
                                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                                    {filteredLogs.map((log: any) => {
                                        // Determine style based on action keyword
                                        const isDanger = log.action.includes('SUSPEND') || log.action.includes('DELETE');
                                        const isWarning = log.action.includes('UPDATE') || log.action.includes('IMPERSONATE');
                                        
                                        return (
                                            <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 ${
                                                    isDanger ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                                                }`}>
                                                    <UserCircle className="w-3.5 h-3.5 text-white" />
                                                </div>
                                                
                                                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-gray-100 bg-white shadow-sm group-hover:shadow-md transition-shadow">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className={`text-[9px] font-black uppercase tracking-widest ${isDanger ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-emerald-600'}`}>
                                                            {log.action.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-700 font-medium leading-snug mb-2">{log.details}</p>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-bold text-gray-400">{log.admin_email.split('@')[0]}</span>
                                                        <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> {new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                            <div className="mt-6 text-center">
                                <Link href="/super-admin/audit-logs" className="inline-flex text-xs font-bold text-[#1f8898] hover:text-[#166c7a] bg-[#1f8898]/5 hover:bg-[#1f8898]/10 px-4 py-2 rounded-lg transition-colors">
                                    View Full Ledger
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}