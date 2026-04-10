// apps/web/app/super-admin/landlords/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
    Search, Loader2, UserCheck, UserX, ShieldAlert, 
    CheckCircle2, LogIn, Crown, X, Users, Building2, 
    TrendingUp, Calendar, Filter, AlertCircle
} from 'lucide-react';

export default function LandlordsPage() {
    const [landlords, setLandlords] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [isImpersonating, setIsImpersonating] = useState<string | null>(null);

    // --- ADVANCED FILTERS STATE ---
    const [planFilter, setPlanFilter] = useState('ALL');
    const [dateFilter, setDateFilter] = useState('ALL');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    // --- SUBSCRIPTION MODAL STATE ---
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [selectedLandlord, setSelectedLandlord] = useState<any>(null);
    const [newPlan, setNewPlan] = useState('');
    const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);

    useEffect(() => {
        const fetchLandlords = async () => {
            setIsLoading(true);
            try {
                // Fetching the page data, but applying rich client-side filtering on the returned dataset
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/landlords?page=${page}`, { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    setLandlords(data.data);
                    setTotalPages(data.meta.last_page);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        const timeoutId = setTimeout(() => fetchLandlords(), 300);
        return () => clearTimeout(timeoutId);
    }, [page]);

    // --- STEP 1: DATE FILTERING ---
    const dateFilteredLandlords = useMemo(() => {
        let result = landlords;

        if (dateFilter !== 'ALL') {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            result = result.filter(l => {
                // Safely handle missing dates by falling back to created_at if joined_at is missing
                const joinDate = new Date(l.joined_at || l.created_at);

                switch (dateFilter) {
                    case 'TODAY':
                        return joinDate >= today;
                    case 'YESTERDAY':
                        const yesterdayStart = new Date(today);
                        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
                        return joinDate >= yesterdayStart && joinDate < today;
                    case 'THIS_WEEK':
                        const weekStart = new Date(today);
                        weekStart.setDate(today.getDate() - today.getDay());
                        return joinDate >= weekStart;
                    case 'THIS_MONTH':
                        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                        return joinDate >= monthStart;
                    case 'THIS_YEAR':
                        const yearStart = new Date(now.getFullYear(), 0, 1);
                        return joinDate >= yearStart;
                    case 'CUSTOM':
                        if (customStartDate && customEndDate) {
                            const start = new Date(customStartDate);
                            const end = new Date(customEndDate);
                            end.setHours(23, 59, 59, 999);
                            return joinDate >= start && joinDate <= end;
                        }
                        return true;
                    default:
                        return true;
                }
            });
        }
        return result;
    }, [landlords, dateFilter, customStartDate, customEndDate]);

    // --- DERIVED METRICS (Based on Date Filter) ---
    const totalLandlords = dateFilteredLandlords.length;
    const premiumCount = dateFilteredLandlords.filter(l => l.plan === 'PRO' || l.plan === 'PREMIUM').length;
    const totalProperties = dateFilteredLandlords.reduce((sum, l) => sum + (l.properties_count || 0), 0);
    const suspendedCount = dateFilteredLandlords.filter(l => !l.is_active).length;

    // --- STEP 2: PLAN & SEARCH FILTERING (Final output for the table) ---
    const filteredLandlords = useMemo(() => {
        let result = dateFilteredLandlords;

        if (planFilter !== 'ALL') {
            result = result.filter(l => l.plan === planFilter);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(l => 
                (l.company_name && l.company_name.toLowerCase().includes(query)) ||
                (l.email && l.email.toLowerCase().includes(query)) ||
                (l.phone && l.phone.includes(query))
            );
        }

        return result;
    }, [dateFilteredLandlords, planFilter, searchQuery]);


    // --- ACTION HANDLERS ---
    const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
        if (!confirm(`Are you sure you want to ${currentStatus ? 'suspend' : 'activate'} this account?`)) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/toggle-status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ is_active: !currentStatus })
            });
            if (!res.ok) throw new Error('Failed to update status');
            setLandlords(prev => prev.map(l => l.user_id === userId ? { ...l, is_active: !currentStatus } : l));
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleImpersonate = async (userId: string, companyName: string) => {
        if (!confirm(`Are you sure you want to log in as ${companyName}? Their dashboard will open in a new tab.`)) return;
        setIsImpersonating(userId);
        
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/impersonate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            
            if (!res.ok) throw new Error('Failed to initiate impersonation session.');
            
            const data = await res.json();
            
            if (data.access_token) {
                localStorage.setItem('access_token', data.access_token); 
                localStorage.setItem('isImpersonating', 'true'); 
            }

            window.open('/dashboard', '_blank');
            setIsImpersonating(null);
            
        } catch (err: any) {
            alert(err.message);
            setIsImpersonating(null);
        }
    };

    const handleSavePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdatingPlan(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${selectedLandlord.user_id}/subscription`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ plan: newPlan })
            });
            if (!res.ok) throw new Error('Failed to update subscription');
            
            setLandlords(prev => prev.map(l => l.user_id === selectedLandlord.user_id ? { ...l, plan: newPlan.toUpperCase() } : l));
            setIsPlanModalOpen(false);
            
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsUpdatingPlan(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans selection:bg-[#1f8898]/30 overflow-x-hidden">
            
            {/* --- Premium Gradient Hero Area --- */}
            <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-6 pt-8 pb-20 relative overflow-hidden shadow-inner">
                <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-teal-100 text-[10px] font-black uppercase tracking-widest mb-4 border border-white/20 backdrop-blur-sm">
                            <Users className="w-3.5 h-3.5" /> User Management
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-[#ffffff] tracking-tight mb-2">
                            Landlord Directory
                        </h1>
                        <p className="text-teal-100 text-sm md:text-base font-medium max-w-xl leading-relaxed">
                            Oversee active property managers, manage subscription plans, and impersonate accounts for direct support.
                        </p>
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
                                <Users className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 text-right leading-tight">Total<br/>Landlords</span>
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">{totalLandlords}</h4>
                            <p className="text-xs text-gray-500 font-medium mt-1">Registrations in view</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                                <Crown className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 text-right leading-tight">Premium<br/>Accounts</span>
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">{premiumCount}</h4>
                            <p className="text-xs text-gray-500 font-medium mt-1">Pro & Premium tiers</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 text-right leading-tight">Total<br/>Properties</span>
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">{totalProperties}</h4>
                            <p className="text-xs text-gray-500 font-medium mt-1">Portfolios managed</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
                                <ShieldAlert className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 text-right leading-tight">Suspended<br/>Accounts</span>
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">{suspendedCount}</h4>
                            <p className="text-xs text-gray-500 font-medium mt-1">Access revoked</p>
                        </div>
                    </div>
                </div>

                {/* --- Main Table Container --- */}
                <div className="bg-white rounded-3xl shadow-lg shadow-black/5 border border-gray-100 overflow-hidden flex flex-col min-h-[500px] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                    
                    {/* Advanced Toolbar */}
                    <div className="p-4 md:p-5 border-b border-gray-100 bg-[#f8fafb]/50 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                        
                        <div className="flex flex-wrap items-center gap-3">
                            
                            {/* PLAN FILTER */}
                            <div className="flex items-center gap-2 pr-3 border-r border-gray-200">
                                <Filter className="w-4 h-4 text-gray-400" />
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest hidden sm:inline">Plan:</span>
                            </div>
                            <div className="flex gap-1.5 pr-3 border-r border-gray-200">
                                {['ALL', 'FREE', 'BASIC', 'PRO', 'PREMIUM'].map((plan) => (
                                    <button
                                        key={plan}
                                        onClick={() => setPlanFilter(plan)}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                            planFilter === plan 
                                                ? 'bg-[#1f8898] text-white shadow-sm' 
                                                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        {plan}
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
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
                            <div className="relative w-full sm:w-72">
                                <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3" />
                                <input
                                    type="text"
                                    placeholder="Search company or email..."
                                    className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-2.5 text-sm font-medium outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all bg-white shadow-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto flex-1 bg-white">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-[400px] text-[#1f8898] gap-4 bg-white">
                                <Loader2 className="w-8 h-8 animate-spin" />
                                <span className="font-bold text-sm uppercase tracking-widest text-gray-400">Loading Directory...</span>
                            </div>
                        ) : (
                            <table className="min-w-full text-left border-collapse whitespace-nowrap">
                                <thead>
                                    <tr className="bg-gray-50/80 border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-400 font-black">
                                        <th className="px-6 py-4 pl-8">Company Details</th>
                                        <th className="px-6 py-4">Contact Info</th>
                                        <th className="px-6 py-4">Plan & Size</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 text-right pr-8">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredLandlords.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-16 text-center">
                                                <div className="w-16 h-16 bg-[#ebf3f5] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#1f8898]">
                                                    <Users className="w-8 h-8" />
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-1">No Landlords Found</h3>
                                                <p className="text-sm text-gray-500 font-medium">Try adjusting your filters or date range.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredLandlords.map((l) => (
                                            <tr key={l.id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-6 py-4 pl-8">
                                                    <p className="font-black text-gray-900 text-sm group-hover:text-[#1f8898] transition-colors">{l.company_name}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                                                        Joined {new Date(l.joined_at || l.created_at).toLocaleDateString()}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-medium text-gray-900 text-sm">{l.email}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{l.phone || 'No phone'}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col items-start gap-1.5">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest
                                                            ${(l.plan === 'PRO' || l.plan === 'PREMIUM') ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}
                                                        `}>
                                                            {l.plan}
                                                        </span>
                                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{l.properties_count || 0} Properties</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border
                                                        ${l.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}
                                                    `}>
                                                        {l.is_active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                                                        {l.is_active ? 'Active' : 'Suspended'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right pr-8">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => { setSelectedLandlord(l); setNewPlan(l.plan); setIsPlanModalOpen(true); }}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors text-indigo-600 bg-indigo-50/50 hover:bg-indigo-100 border border-indigo-100 active:scale-95"
                                                            title="Manage Subscription Plan"
                                                        >
                                                            <Crown className="w-3.5 h-3.5" /> Plan
                                                        </button>

                                                        <button
                                                            onClick={() => handleImpersonate(l.user_id, l.company_name)}
                                                            disabled={isImpersonating === l.user_id}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors text-blue-600 bg-blue-50/50 hover:bg-blue-100 border border-blue-100 disabled:opacity-50 active:scale-95"
                                                            title="Log in to this Landlord's dashboard"
                                                        >
                                                            {isImpersonating === l.user_id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogIn className="w-3.5 h-3.5" />} 
                                                            Login As
                                                        </button>

                                                        <button
                                                            onClick={() => handleToggleStatus(l.user_id, l.is_active)}
                                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors active:scale-95
                                                                ${l.is_active ? 'text-rose-600 bg-rose-50/50 hover:bg-rose-100 border border-rose-100' : 'text-emerald-600 bg-emerald-50/50 hover:bg-emerald-100 border border-emerald-100'}
                                                            `}
                                                        >
                                                            {l.is_active ? <><UserX className="w-3.5 h-3.5" /> Suspend</> : <><UserCheck className="w-3.5 h-3.5" /> Activate</>}
                                                        </button>
                                                    </div>
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
                        <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Server Page {page} of {totalPages || 1}</span>
                        <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 text-xs font-bold text-gray-600 disabled:opacity-50 bg-white hover:bg-gray-50 rounded-xl transition-colors border border-gray-200 shadow-sm">Next</button>
                    </div>
                </div>
            </main>

            {/* --- PLAN MANAGEMENT MODAL --- */}
            {isPlanModalOpen && selectedLandlord && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 flex flex-col">
                        
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-br from-gray-50 to-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center">
                                    <Crown className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-gray-900 tracking-tight">Manage Subscription</h2>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Updating: {selectedLandlord.company_name}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsPlanModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors bg-white p-2 rounded-full hover:bg-gray-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSavePlan} className="p-6 md:p-8">
                            <label className="block text-[11px] font-black text-gray-500 mb-2 uppercase tracking-widest">Select New Plan Tier</label>
                            
                            <select 
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/20 transition-all font-bold text-sm text-gray-900 bg-gray-50 hover:bg-white shadow-sm cursor-pointer"
                                value={newPlan}
                                onChange={(e) => setNewPlan(e.target.value)}
                            >
                                <option value="FREE">FREE - Trial / Startup</option>
                                <option value="BASIC">BASIC - Standard Features</option>
                                <option value="PRO">PRO - Advanced & Unlimited</option>
                                <option value="PREMIUM">PREMIUM - Enterprise Level</option>
                            </select>

                            <div className="mt-6 bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5">
                                <p className="text-xs text-indigo-900 font-medium leading-relaxed">
                                    By changing the tier, you instantly unlock or restrict features in the landlord's dashboard. Billing logic must be managed externally for manual overrides.
                                </p>
                            </div>

                            <div className="mt-8 pt-5 border-t border-gray-100 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsPlanModalOpen(false)} className="px-5 py-3 rounded-xl text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isUpdatingPlan || newPlan === selectedLandlord.plan} className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95">
                                    {isUpdatingPlan ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                    {isUpdatingPlan ? 'Saving...' : 'Apply Plan Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}