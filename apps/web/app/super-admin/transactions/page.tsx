// apps/web/app/super-admin/transactions/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
    Loader2, Search, Clock, Activity, 
    CheckCircle2, AlertCircle, Calendar, 
    Filter, Download, CreditCard, 
    ArrowUpRight, ShieldAlert, Receipt
} from 'lucide-react';

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');

    // --- ADVANCED FILTERS STATE ---
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [dateFilter, setDateFilter] = useState('ALL');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    useEffect(() => {
        const fetchTransactions = async () => {
            setIsLoading(true);
            try {
                // We fetch the page, but apply rich client-side filtering on the returned dataset
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/transactions?page=${page}`, { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    setTransactions(data.data);
                    setTotalPages(data.meta.last_page);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        const timeoutId = setTimeout(() => fetchTransactions(), 300);
        return () => clearTimeout(timeoutId);
    }, [page]);

    // --- STEP 1: DATE FILTERING ---
    const dateFilteredTransactions = useMemo(() => {
        let result = transactions;

        if (dateFilter !== 'ALL') {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            result = result.filter(t => {
                const txDate = new Date(t.created_at);

                switch (dateFilter) {
                    case 'TODAY':
                        return txDate >= today;
                    case 'YESTERDAY':
                        const yesterdayStart = new Date(today);
                        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
                        return txDate >= yesterdayStart && txDate < today;
                    case 'THIS_WEEK':
                        const weekStart = new Date(today);
                        weekStart.setDate(today.getDate() - today.getDay());
                        return txDate >= weekStart;
                    case 'THIS_MONTH':
                        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                        return txDate >= monthStart;
                    case 'THIS_YEAR':
                        const yearStart = new Date(now.getFullYear(), 0, 1);
                        return txDate >= yearStart;
                    case 'CUSTOM':
                        if (customStartDate && customEndDate) {
                            const start = new Date(customStartDate);
                            const end = new Date(customEndDate);
                            end.setHours(23, 59, 59, 999);
                            return txDate >= start && txDate <= end;
                        }
                        return true;
                    default:
                        return true;
                }
            });
        }
        return result;
    }, [transactions, dateFilter, customStartDate, customEndDate]);

    // --- DERIVED METRICS (Based on Date Filter) ---
    const totalCount = dateFilteredTransactions.length;
    const successCount = dateFilteredTransactions.filter(t => t.status === 'SUCCESS').length;
    const failedCount = dateFilteredTransactions.filter(t => t.status === 'FAILED').length;
    const successRate = totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0;
    
    // Sum only successful transactions for the revenue metric
    const totalRevenue = dateFilteredTransactions
        .filter(t => t.status === 'SUCCESS')
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    // --- STEP 2: STATUS & SEARCH FILTERING (Final output for the table) ---
    const filteredTransactions = useMemo(() => {
        let result = dateFilteredTransactions;

        if (statusFilter !== 'ALL') {
            result = result.filter(t => t.status === statusFilter);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(t => 
                (t.receipt_number && t.receipt_number.toLowerCase().includes(query)) ||
                (t.phone_number && t.phone_number.includes(query)) ||
                (t.checkout_request_id && t.checkout_request_id.toLowerCase().includes(query))
            );
        }

        return result;
    }, [dateFilteredTransactions, statusFilter, searchQuery]);

    // --- EXPORT CSV FUNCTION ---
    const handleExportCSV = () => {
        if (filteredTransactions.length === 0) return;

        const headers = ['Timestamp', 'Checkout Request ID', 'M-Pesa Receipt', 'Phone Number', 'Amount (KSH)', 'Status'];
        
        const csvRows = filteredTransactions.map(t => {
            const timestamp = new Date(t.created_at).toLocaleString().replace(/,/g, ''); 
            const amount = t.amount || 0;
            return [timestamp, t.checkout_request_id, t.receipt_number || 'N/A', t.phone_number || 'N/A', amount, t.status];
        });

        const csvContent = [headers.join(','), ...csvRows.map(row => row.join(','))].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `Transaction_Logs_${new Date().toISOString().split('T')[0]}.csv`);
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
                            <Activity className="w-3.5 h-3.5" /> Financial Integrations
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-[#ffffff] tracking-tight mb-2">
                            System Logs & IPNs
                        </h1>
                        <p className="text-teal-100 text-sm md:text-base font-medium max-w-xl leading-relaxed">
                            Monitor global M-Pesa Instant Payment Notifications (IPNs), track transaction states, and resolve automated billing failures.
                        </p>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 relative z-20 space-y-6">
                
                {/* --- Bento Box Analytics Grid --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                                <ArrowUpRight className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 text-right leading-tight">Total<br/>Processed</span>
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">
                                <span className="text-sm text-gray-400 mr-1">KSH</span>
                                {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h4>
                            <p className="text-xs text-gray-500 font-medium mt-1">Successful volume in view</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                                <Receipt className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 text-right leading-tight">Recorded<br/>IPN Hits</span>
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">{totalCount}</h4>
                            <p className="text-xs text-gray-500 font-medium mt-1">Transactions pinged</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 text-right leading-tight">Success<br/>Rate</span>
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">{successRate}%</h4>
                            <p className="text-xs text-gray-500 font-medium mt-1">Completed without errors</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 text-right leading-tight">Failed<br/>Transactions</span>
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">{failedCount}</h4>
                            <p className="text-xs text-gray-500 font-medium mt-1">Canceled or dropped</p>
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
                                {['ALL', 'SUCCESS', 'PENDING', 'FAILED'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setStatusFilter(status)}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                            statusFilter === status 
                                                ? 'bg-[#1f8898] text-white shadow-sm' 
                                                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        {status}
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
                                    type="text" placeholder="Search receipt, phone, or ID..." 
                                    className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-2.5 text-sm font-medium outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all bg-white shadow-sm"
                                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={handleExportCSV}
                                disabled={filteredTransactions.length === 0}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed shrink-0 active:scale-95"
                                title="Export current view to CSV"
                            >
                                <Download className="w-4 h-4" />
                                <span>Export Report</span>
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto flex-1 bg-white">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-[400px] text-[#1f8898] gap-4 bg-white">
                                <Loader2 className="w-8 h-8 animate-spin" />
                                <span className="font-bold text-sm uppercase tracking-widest text-gray-400">Loading System Logs...</span>
                            </div>
                        ) : (
                            <table className="min-w-full text-left border-collapse whitespace-nowrap">
                                <thead>
                                    <tr className="bg-gray-50/80 border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-400 font-black">
                                        <th className="px-6 py-4 pl-8">Transaction Identity</th>
                                        <th className="px-6 py-4">Amount & Contact</th>
                                        <th className="px-6 py-4">System Timestamp</th>
                                        <th className="px-6 py-4 pr-8 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredTransactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-16 text-center">
                                                <div className="w-16 h-16 bg-[#ebf3f5] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#1f8898]">
                                                    <ShieldAlert className="w-8 h-8" />
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-1">No Transactions Found</h3>
                                                <p className="text-sm text-gray-500 font-medium">Try adjusting your filters or date range.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredTransactions.map((t) => (
                                            <tr key={t.id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-6 py-4 pl-8">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-200 shrink-0">
                                                            <CreditCard className="w-5 h-5 text-gray-400" />
                                                        </div>
                                                        <div>
                                                            <p className="font-mono text-xs font-bold text-gray-900 mb-1 group-hover:text-[#1f8898] transition-colors">{t.checkout_request_id}</p>
                                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                                                Ref: {t.receipt_number || <span className="text-gray-400 font-medium italic">AWAITING M-PESA</span>}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-black text-gray-900 text-sm mb-1">
                                                        <span className="text-gray-400 font-bold text-xs mr-1">KSH</span> 
                                                        {t.amount ? t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 font-medium">{t.phone_number || 'N/A'}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-900 font-bold mb-0.5">
                                                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                        {new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-5">
                                                        {new Date(t.created_at).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 pr-8 text-right">
                                                    <span className={`inline-flex px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border
                                                        ${t.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                                                        t.status === 'FAILED' ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                                                        'bg-amber-50 text-amber-700 border-amber-200'}
                                                    `}>
                                                        {t.status}
                                                    </span>
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