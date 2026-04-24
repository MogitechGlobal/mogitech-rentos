// apps/web/app/dashboard/audit/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { 
    ShieldCheck, Clock, UserCircle, Loader2, Activity, FileText, 
    Download, Search, Filter, Monitor, Calendar, FileSpreadsheet, 
    Printer, ChevronDown 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WorkspaceAuditLogsPage() {
    const router = useRouter();
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [dateFilter, setDateFilter] = useState('ALL'); 
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    // UI States
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const exportMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/audit`, { credentials: 'include' });
                if (res.status === 401 || res.status === 403) return router.replace('/dashboard');
                
                if (res.ok) setLogs(await res.json());
            } catch (err) {
                console.error("Failed to load audit logs");
            } finally {
                setIsLoading(false);
            }
        };
        fetchLogs();
    }, [router]);

    // Close export menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
                setIsExportMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'OWNER': return <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md text-[10px] font-black tracking-widest border border-amber-200">OWNER</span>;
            case 'FINANCE': return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md text-[10px] font-black tracking-widest border border-blue-200">FINANCE</span>;
            case 'CARETAKER': return <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md text-[10px] font-black tracking-widest border border-emerald-200">CARETAKER</span>;
            case 'VENDOR': return <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md text-[10px] font-black tracking-widest border border-purple-200">VENDOR</span>;
            case 'SYSTEM': return <span className="bg-gray-800 text-white px-2 py-0.5 rounded-md text-[10px] font-black tracking-widest border border-gray-700">SYSTEM</span>;
            default: return <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-[10px] font-black tracking-widest border border-gray-200">{role}</span>;
        }
    };

    // --- FILTER LOGIC ---
    const filteredLogs = logs.filter(log => {
        const matchesSearch = (log.description || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (log.actor_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                              (log.action || '').toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesRole = roleFilter === 'ALL' || log.actor_role === roleFilter;

        let matchesDate = true;
        const logDate = new Date(log.created_at);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (dateFilter === 'TODAY') {
            matchesDate = logDate >= today;
        } else if (dateFilter === 'YESTERDAY') {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            matchesDate = logDate >= yesterday && logDate < today;
        } else if (dateFilter === 'WEEK') {
            const lastWeek = new Date(today);
            lastWeek.setDate(lastWeek.getDate() - 7);
            matchesDate = logDate >= lastWeek;
        } else if (dateFilter === 'MONTH') {
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            matchesDate = logDate >= startOfMonth;
        } else if (dateFilter === 'YEAR') {
            const startOfYear = new Date(today.getFullYear(), 0, 1);
            matchesDate = logDate >= startOfYear;
        } else if (dateFilter === 'CUSTOM') {
            if (customStartDate) {
                const start = new Date(customStartDate);
                start.setHours(0, 0, 0, 0);
                if (logDate < start) matchesDate = false;
            }
            if (customEndDate) {
                const end = new Date(customEndDate);
                end.setHours(23, 59, 59, 999);
                if (logDate > end) matchesDate = false;
            }
        }

        return matchesSearch && matchesRole && matchesDate;
    });

    // --- SECURE CSV EXPORT FIX ---
    const exportCSV = () => {
        const headers = ['Timestamp', 'User & Role', 'Action Code', 'Event Description'];
        
        const csvRows = filteredLogs.map(log => {
            const dateStr = new Date(log.created_at).toLocaleString();
            const userRole = `${log.actor_name} (${log.actor_role})`;
            const action = log.action;
            const desc = (log.description || '').replace(/"/g, '""'); 

            return `"${dateStr}","${userRole}","${action}","${desc}"`;
        });

        const csvContent = [headers.join(','), ...csvRows].join('\n');
        
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `MogiRentOS_Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setIsExportMenuOpen(false);
    };

    const exportPDF = () => {
        window.print();
        setIsExportMenuOpen(false);
    };

    return (
        <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans text-gray-900 selection:bg-[#1f8898]/30 overflow-x-hidden animate-in fade-in duration-500">
            {/* The Print Container completely isolates the table for PDF Export */}
            <div id="printable-area" className="w-full">
                
                {/* Print-Only Header (Invisible on Web) */}
                <div className="hidden print:block mb-6 border-b border-gray-300 pb-4">
                    <h1 className="text-3xl font-black text-gray-900">MogiRentOS Workspace Audit Report</h1>
                    <p className="text-gray-500 font-medium">Generated on: {new Date().toLocaleString()}</p>
                    <p className="text-gray-500 font-medium">Total Records: {filteredLogs.length}</p>
                </div>

                {/* --- MINIMIZED EXECUTIVE HERO AREA --- */}
                <div className="bg-gradient-to-br from-[#0d393f] to-[#1f8898] px-4 sm:px-6 pt-6 pb-10 sm:pb-14 relative overflow-hidden shadow-inner print:hidden">
                    <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-100 text-[10px] font-black uppercase tracking-widest mb-2 border border-white/20 backdrop-blur-sm">
                                <ShieldCheck className="w-3.5 h-3.5" /> Secure Ledger
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black text-[#ffffff] tracking-tight mb-1">
                                Workspace Audit Trail
                            </h1>
                            <p className="text-teal-100 text-xs sm:text-sm font-medium max-w-xl leading-relaxed">
                                An immutable, time-stamped ledger of all actions taken within your workspace. Monitor security, track changes, and ensure compliance.
                            </p>
                        </div>

                        {/* Export Dropdown in Hero */}
                        <div className="relative shrink-0 mt-2 md:mt-0" ref={exportMenuRef}>
                            <button 
                                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                                className="bg-white text-[#1f8898] px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm hover:shadow-md w-full md:w-auto"
                            >
                                <Download className="w-4 h-4" /> Export Report <ChevronDown className={`w-4 h-4 transition-transform ${isExportMenuOpen ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {isExportMenuOpen && (
                                <div className="absolute right-0 mt-2 w-full md:w-48 bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden z-50 py-1 origin-top-right animate-in fade-in zoom-in duration-200">
                                    <button onClick={exportCSV} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-[#1f8898] transition-colors text-left">
                                        <FileSpreadsheet className="w-4 h-4" /> Export as CSV
                                    </button>
                                    <button onClick={exportPDF} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-rose-500 transition-colors text-left">
                                        <Printer className="w-4 h-4" /> Save as PDF
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- MAIN CONTENT (Overlapping Hero) --- */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6 sm:-mt-8 relative z-20 space-y-4">

                    {/* Advanced Mobile-Responsive Filter Bar - Hidden during PDF Print */}
                    <div className="bg-white p-4 rounded-t-3xl border border-gray-100 border-b-0 flex flex-col xl:flex-row gap-3 shadow-sm print:hidden">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Search users, actions, or details..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all bg-gray-50 hover:bg-white"
                            />
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative sm:w-48 shrink-0">
                                <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                <select 
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl pl-10 pr-8 py-2.5 text-sm font-bold text-gray-700 outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all bg-gray-50 hover:bg-white appearance-none cursor-pointer"
                                >
                                    <option value="ALL">All Roles</option>
                                    <option value="OWNER">Owner</option>
                                    <option value="FINANCE">Finance</option>
                                    <option value="CARETAKER">Caretaker</option>
                                    <option value="VENDOR">Vendor</option>
                                    <option value="SYSTEM">System</option>
                                </select>
                            </div>

                            <div className="relative sm:w-48 shrink-0">
                                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                <select 
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl pl-10 pr-8 py-2.5 text-sm font-bold text-gray-700 outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all bg-gray-50 hover:bg-white appearance-none cursor-pointer"
                                >
                                    <option value="ALL">All Time</option>
                                    <option value="TODAY">Today</option>
                                    <option value="YESTERDAY">Yesterday</option>
                                    <option value="WEEK">Last 7 Days</option>
                                    <option value="MONTH">This Month</option>
                                    <option value="YEAR">This Year</option>
                                    <option value="CUSTOM">Custom Range...</option>
                                </select>
                            </div>
                        </div>

                        {dateFilter === 'CUSTOM' && (
                            <div className="flex flex-col sm:flex-row items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200 animate-in slide-in-from-right-4">
                                <input 
                                    type="date" 
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                    className="w-full sm:w-auto text-xs font-medium px-2 py-1.5 rounded-md border border-gray-200 outline-none focus:border-[#1f8898]" 
                                />
                                <span className="text-gray-400 text-xs font-bold px-1">TO</span>
                                <input 
                                    type="date" 
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                    className="w-full sm:w-auto text-xs font-medium px-2 py-1.5 rounded-md border border-gray-200 outline-none focus:border-[#1f8898]" 
                                />
                            </div>
                        )}
                    </div>

                    {/* Data Table Card (Mobile Card Transformation Applied) */}
                    <div className="bg-transparent md:bg-white rounded-b-3xl md:shadow-sm md:border md:border-gray-100 overflow-hidden print:bg-white print:border-none print:shadow-none print:rounded-none print:overflow-visible">
                        <table className="w-full text-left border-collapse md:min-w-[800px] print:min-w-full block md:table print:table">
                            <thead className="hidden md:table-header-group print:table-header-group">
                                <tr className="bg-gray-50/80 border-b border-gray-100 print:bg-white print:border-b-2 print:border-black">
                                    <th className="py-4 px-4 md:px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest w-40 print:text-black print:px-2">Timestamp</th>
                                    <th className="py-4 px-4 md:px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest w-64 print:text-black print:px-2">User & Role</th>
                                    <th className="py-4 px-4 md:px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest w-56 print:text-black print:px-2">Action Code</th>
                                    <th className="py-4 px-4 md:px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest print:text-black print:px-2">Event Description</th>
                                </tr>
                            </thead>
                            <tbody className="block md:table-row-group divide-y-0 md:divide-y divide-gray-50 print:divide-y print:divide-gray-300 print:table-row-group">
                                {isLoading ? (
                                    <tr className="block md:table-row print:hidden">
                                        <td colSpan={4} className="block md:table-cell p-16 text-center">
                                            <Loader2 className="w-8 h-8 animate-spin text-[#1f8898] mx-auto mb-3" />
                                            <p className="text-gray-500 font-medium text-sm">Syncing secure ledger...</p>
                                        </td>
                                    </tr>
                                ) : filteredLogs.length === 0 ? (
                                    <tr className="block md:table-row bg-white rounded-xl shadow-sm border border-gray-200 md:border-none md:shadow-none md:rounded-none print:table-row">
                                        <td colSpan={4} className="block md:table-cell p-16 text-center print:table-cell">
                                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-gray-100 print:hidden">
                                                <Activity className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <p className="text-gray-800 font-bold text-sm">No events found for this criteria.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((log) => {
                                        const dateObj = new Date(log.created_at);
                                        const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                        const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

                                        return (
                                            <tr key={log.id} className="block md:table-row bg-white border border-gray-100 md:border-none rounded-2xl md:rounded-none mb-4 md:mb-0 p-4 md:p-0 shadow-sm md:shadow-none hover:bg-gray-50/50 transition-colors group print:break-inside-avoid print:table-row print:border-none print:mb-0 print:p-0 print:shadow-none">
                                                
                                                {/* Mobile Label: Timestamp (Hidden on Print) */}
                                                <td className="block md:table-cell py-2 md:py-4 px-0 md:px-6 align-top border-b border-gray-100 md:border-none print:table-cell print:border-none print:py-3 print:px-2">
                                                    <span className="md:hidden print:hidden text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Timestamp</span>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-gray-900">{formattedDate}</span>
                                                        <span className="text-xs font-medium text-gray-500 flex items-center gap-1 mt-0.5 print:text-gray-700">
                                                            <Clock className="w-3 h-3 print:hidden" /> {formattedTime}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Mobile Label: User & Role (Hidden on Print) */}
                                                <td className="block md:table-cell py-2 md:py-4 px-0 md:px-6 align-top border-b border-gray-100 md:border-none print:table-cell print:border-none print:py-3 print:px-2 mt-2 md:mt-0">
                                                    <span className="md:hidden print:hidden text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">User & Role</span>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border print:hidden ${log.actor_role === 'SYSTEM' ? 'bg-gray-100 border-gray-200' : 'bg-[#ebf3f5] border-[#1f8898]/10'}`}>
                                                            {log.actor_role === 'SYSTEM' ? <Monitor className="w-4 h-4 text-gray-500" /> : <UserCircle className="w-4 h-4 text-[#1f8898]" />}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900 leading-none mb-1">{log.actor_name}</p>
                                                            {getRoleBadge(log.actor_role)}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Mobile Label: Action Code (Hidden on Print) */}
                                                <td className="block md:table-cell py-2 md:py-4 px-0 md:px-6 align-top border-b border-gray-100 md:border-none print:table-cell print:border-none print:py-3 print:px-2 mt-2 md:mt-0">
                                                    <span className="md:hidden print:hidden text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Action Code</span>
                                                    <div className="inline-flex items-center gap-1.5 bg-gray-100/80 text-gray-600 px-2.5 py-1 rounded-md border border-gray-200 print:bg-transparent print:border-none print:px-0">
                                                        <FileText className="w-3.5 h-3.5 print:hidden" />
                                                        <span className="text-[10px] font-bold font-mono uppercase tracking-wider truncate max-w-[150px] print:max-w-none print:text-black" title={log.action}>
                                                            {log.action.replace(/_/g, ' ')}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Mobile Label: Event Description (Hidden on Print) */}
                                                <td className="block md:table-cell py-2 md:py-4 px-0 md:px-6 align-top mt-2 md:mt-0 print:table-cell print:border-none print:py-3 print:px-2">
                                                    <span className="md:hidden print:hidden text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Event Description</span>
                                                    <p className="text-sm font-medium text-gray-700 leading-relaxed max-w-lg print:text-black print:max-w-none">
                                                        {log.description}
                                                    </p>
                                                </td>

                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Table Footer - Hidden during PDF Print */}
                    {!isLoading && filteredLogs.length > 0 && (
                        <div className="bg-gray-50 border-t border-gray-100 p-4 flex flex-col sm:flex-row items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-widest print:hidden gap-2 md:rounded-b-3xl">
                            <span>Showing {filteredLogs.length} Events</span>
                            <div className="flex items-center gap-1">
                                <ShieldCheck className="w-4 h-4 text-[#1f8898]" /> Secure Ledger Active
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Aggressive Print Isolation CSS */}
            <style jsx global>{`
                @media print {
                    @page { size: landscape; margin: 10mm; }
                    /* Aggressively hide EVERYTHING in the DOM tree */
                    body * {
                        visibility: hidden;
                    }
                    /* Turn visibility back on ONLY for the printable area */
                    #printable-area, #printable-area * {
                        visibility: visible;
                    }
                    /* Force the printable area to the top-left of the page so it isn't shifted down by invisible sidebars */
                    #printable-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 0;
                    }
                    /* Guarantee any item tagged with print:hidden stays hidden */
                    .print\\:hidden, .print\\:hidden * {
                        visibility: hidden !important;
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
}