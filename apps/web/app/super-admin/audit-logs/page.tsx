// apps/web/app/super-admin/audit-logs/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
    Loader2, ShieldCheck, Search, UserCircle, 
    Clock, ShieldAlert, AlertTriangle, Activity, 
    Database, Filter, CheckCircle2, Lock, Download,
    Calendar
} from 'lucide-react';

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);
    
    // --- ADVANCED FILTERS STATE ---
    const [filterRisk, setFilterRisk] = useState<'ALL' | 'HIGH_RISK' | 'STANDARD'>('ALL');
    const [dateFilter, setDateFilter] = useState('ALL');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    useEffect(() => {
        const fetchLogs = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/audit-logs?page=${page}&search=${searchQuery}`, { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    setLogs(data.data);
                    setTotalPages(data.meta.last_page);
                    setTotalLogs(data.meta.total);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        const timeoutId = setTimeout(() => fetchLogs(), 300);
        return () => clearTimeout(timeoutId);
    }, [page, searchQuery]);

    const getActionRisk = (action: string) => {
        if (action.includes('SUSPEND') || action.includes('DELETE') || action.includes('IMPERSONATE')) return 'HIGH_RISK';
        if (action.includes('UPDATE')) return 'MEDIUM_RISK';
        return 'STANDARD';
    };

    const getActionStyle = (action: string) => {
        const risk = getActionRisk(action);
        if (risk === 'HIGH_RISK') return 'bg-rose-50 text-rose-700 border-rose-200';
        if (risk === 'MEDIUM_RISK') return 'bg-amber-50 text-amber-700 border-amber-200';
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    };

    // --- ADVANCED CLIENT-SIDE FILTERING ---
    const filteredLogs = useMemo(() => {
        let result = logs;

        // 1. Filter by Risk
        if (filterRisk !== 'ALL') {
            const isHighRisk = filterRisk === 'HIGH_RISK';
            result = result.filter(log => (getActionRisk(log.action) === 'HIGH_RISK') === isHighRisk);
        }

        // 2. Filter by Date Range
        if (dateFilter !== 'ALL') {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            result = result.filter(log => {
                const logDate = new Date(log.created_at);

                switch (dateFilter) {
                    case 'TODAY':
                        return logDate >= today;
                    case 'YESTERDAY':
                        const yesterdayStart = new Date(today);
                        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
                        return logDate >= yesterdayStart && logDate < today;
                    case 'THIS_WEEK':
                        const weekStart = new Date(today);
                        weekStart.setDate(today.getDate() - today.getDay());
                        return logDate >= weekStart;
                    case 'THIS_MONTH':
                        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                        return logDate >= monthStart;
                    case 'THIS_YEAR':
                        const yearStart = new Date(now.getFullYear(), 0, 1);
                        return logDate >= yearStart;
                    case 'CUSTOM':
                        if (customStartDate && customEndDate) {
                            const start = new Date(customStartDate);
                            const end = new Date(customEndDate);
                            end.setHours(23, 59, 59, 999); // Include the whole end day
                            return logDate >= start && logDate <= end;
                        }
                        return true; // Don't filter if custom dates aren't fully selected yet
                    default:
                        return true;
                }
            });
        }

        return result;
    }, [logs, filterRisk, dateFilter, customStartDate, customEndDate]);

    // --- Derived Metrics for Current View ---
    const highRiskCount = filteredLogs.filter(log => getActionRisk(log.action) === 'HIGH_RISK').length;
    const uniqueAdmins = new Set(filteredLogs.map(log => log.admin_email)).size;

    // --- EXPORT CSV FUNCTION ---
    const handleExportCSV = () => {
        if (filteredLogs.length === 0) return;
        const headers = ['Timestamp', 'Admin Email', 'Action Code', 'Risk Level', 'System Details'];
        const csvRows = filteredLogs.map(log => {
            const timestamp = new Date(log.created_at).toLocaleString().replace(/,/g, ''); 
            const riskLevel = getActionRisk(log.action).replace('_', ' ');
            const safeDetails = `"${log.details.replace(/"/g, '""')}"`; 
            return [timestamp, log.admin_email, log.action, riskLevel, safeDetails];
        });
        const csvContent = [headers.join(','), ...csvRows.map(row => row.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `Security_Audit_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                            <Lock className="w-3.5 h-3.5" /> Security Operations
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-[#ffffff] tracking-tight mb-2">
                            Master Audit Ledger
                        </h1>
                        <p className="text-teal-100 text-sm md:text-base font-medium max-w-xl leading-relaxed">
                            Immutable read-only ledger tracking all administrative actions, configurations, and access modifications across the platform.
                        </p>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 relative z-20 space-y-6">
                
                {/* --- Bento Box Analytics Grid --- */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                                <Database className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 text-right leading-tight">Total<br/>Records</span>
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">{totalLogs.toLocaleString()}</h4>
                            <p className="text-xs text-gray-500 font-medium mt-1">Lifetime actions logged</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
                                <ShieldAlert className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 text-right leading-tight">High Risk<br/>(Current View)</span>
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">{highRiskCount}</h4>
                            <p className="text-xs text-gray-500 font-medium mt-1">Suspensions & Impersonations</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                                <Activity className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 text-right leading-tight">Active<br/>Admins</span>
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">{uniqueAdmins}</h4>
                            <p className="text-xs text-gray-500 font-medium mt-1">Unique admins in view</p>
                        </div>
                    </div>
                </div>

                {/* --- Main Table Container --- */}
                <div className="bg-white rounded-3xl shadow-lg shadow-black/5 border border-gray-100 overflow-hidden flex flex-col min-h-[500px] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                    
                    {/* Advanced Toolbar */}
                    <div className="p-4 md:p-5 border-b border-gray-100 bg-[#f8fafb]/50 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                        
                        <div className="flex flex-wrap items-center gap-3">
                            
                            {/* RISK FILTER */}
                            <div className="flex items-center gap-2 pr-3 border-r border-gray-200">
                                <Filter className="w-4 h-4 text-gray-400" />
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest hidden sm:inline">Risk:</span>
                            </div>
                            <div className="flex gap-1.5 pr-3 border-r border-gray-200">
                                {['ALL', 'HIGH_RISK', 'STANDARD'].map((risk) => (
                                    <button
                                        key={risk}
                                        onClick={() => setFilterRisk(risk as any)}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                            filterRisk === risk 
                                                ? 'bg-[#1f8898] text-white shadow-sm' 
                                                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        {risk.replace('_', ' ')}
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

                        {/* --- SEARCH & EXPORT ACTIONS --- */}
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
                            <div className="relative w-full sm:w-72">
                                <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3" />
                                <input
                                    type="text"
                                    placeholder="Search actions or emails..."
                                    className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-2.5 text-sm font-medium outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all bg-white shadow-sm"
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                                />
                            </div>
                            <button
                                onClick={handleExportCSV}
                                disabled={filteredLogs.length === 0}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed shrink-0 active:scale-95"
                                title="Export current view to CSV"
                            >
                                <Download className="w-4 h-4" />
                                <span>Export CSV</span>
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto flex-1 bg-white">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-[400px] text-[#1f8898] gap-4 bg-white">
                                <Loader2 className="w-8 h-8 animate-spin" />
                                <span className="font-bold text-sm uppercase tracking-widest text-gray-400">Fetching Secure Logs...</span>
                            </div>
                        ) : (
                            <table className="min-w-full text-left border-collapse whitespace-nowrap">
                                <thead>
                                    <tr className="bg-gray-50/80 border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-400 font-black">
                                        <th className="px-6 py-4 pl-8">Timestamp</th>
                                        <th className="px-6 py-4">Admin Identity</th>
                                        <th className="px-6 py-4">Action Code</th>
                                        <th className="px-6 py-4 pr-8">System Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredLogs.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-16 text-center">
                                                <div className="w-16 h-16 bg-[#ebf3f5] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#1f8898]">
                                                    <ShieldCheck className="w-8 h-8" />
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-1">No Audit Logs Found</h3>
                                                <p className="text-sm text-gray-500 font-medium">No actions match your current search or filter criteria.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredLogs.map((log) => (
                                            <tr key={log.id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-6 py-4 pl-8">
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-900 font-bold mb-0.5">
                                                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-5">
                                                        {new Date(log.created_at).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 shrink-0">
                                                            <UserCircle className="w-5 h-5 text-gray-500" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 text-sm">{log.admin_email.split('@')[0]}</p>
                                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{log.admin_email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getActionStyle(log.action)}`}>
                                                        {log.action.replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 pr-8">
                                                    <p className="text-sm font-medium text-gray-600 max-w-md truncate group-hover:text-gray-900 transition-colors" title={log.details}>
                                                        {log.details}
                                                    </p>
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
        </div>
    );
}