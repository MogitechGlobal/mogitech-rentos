// apps/web/app/dashboard/maintenance/page.tsx
/* eslint-disable */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Plus, X, AlertCircle, Wrench, CheckCircle2, 
    Home, ChevronRight, Calendar, Search, Clock, 
    ShieldAlert, Loader2, Layers, Zap, LayoutGrid, List
} from 'lucide-react';

export default function MaintenancePage() {
    const router = useRouter();
    const [tickets, setTickets] = useState<any[]>([]);
    const [properties, setProperties] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // --- UI & Filtering States ---
    const [viewMode, setViewMode] = useState<'BOARD' | 'HISTORY'>('BOARD');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterUrgency, setFilterUrgency] = useState('ALL');

    // --- Modal State ---
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ 
        issue_type: 'GENERAL', 
        urgency: 'MEDIUM', 
        description: '', 
        property_id: '', 
        unit_id: '' 
    });

    const fetchData = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) return router.push('/login');

        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            const [ticketsRes, propsRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets', { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties', { headers })
            ]);

            const ticketsData = await ticketsRes.json();
            const propsData = await propsRes.json();

            setTickets(Array.isArray(ticketsData) ? ticketsData : []);
            setProperties(Array.isArray(propsData) ? propsData : []);
        } catch (err: any) {
            setStatusMsg({ type: 'error', text: 'Failed to load maintenance data.' });
            setTickets([]);
            setProperties([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [router]);

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatusMsg(null);
        
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData),
            });
            
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Failed to create ticket');
            }
            
            setStatusMsg({ type: 'success', text: 'Maintenance request logged successfully!' });
            setIsAddModalOpen(false);
            setFormData({ issue_type: 'GENERAL', urgency: 'MEDIUM', description: '', property_id: '', unit_id: '' });
            fetchData(); 
        } catch (err: any) { 
            setStatusMsg({ type: 'error', text: err.message });
        } finally { 
            setIsSubmitting(false); 
            setTimeout(() => setStatusMsg(null), 5000);
        }
    };

    const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
        // Optimistic UI update for instantaneous feedback
        setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));

        const token = localStorage.getItem('access_token');
        try {
            await fetch(`http://localhost:3000/api/v1/tickets/${ticketId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: newStatus }),
            });
        } catch (err) {
            console.error("Status update failed:", err);
            fetchData(); // Revert on failure
        }
    };

    // --- Analytics & Filtering ---
    const pendingCount = tickets.filter(t => t.status === 'PENDING').length;
    const inProgressCount = tickets.filter(t => t.status === 'IN_PROGRESS').length;
    const resolvedCount = tickets.filter(t => t.status === 'RESOLVED').length;

    const filteredTickets = tickets.filter(t => {
        const searchString = `${t.description} ${t.unit?.property?.name} ${t.unit?.unit_number} ${t.issue_type}`.toLowerCase();
        const matchesSearch = searchString.includes(searchTerm.toLowerCase());
        const matchesUrgency = filterUrgency === 'ALL' || t.urgency === filterUrgency;
        return matchesSearch && matchesUrgency;
    });

    const getFilterPillClass = (urgency: string) => {
        const isActive = filterUrgency === urgency;
        return `px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
            isActive ? 'bg-[#1f8898] text-white border-[#1f8898] shadow-sm' : 'bg-white text-gray-500 hover:bg-gray-100 border-gray-200'
        }`;
    };

    const getUrgencyColor = (urgency: string) => {
        if (urgency === 'EMERGENCY') return 'bg-rose-100 text-rose-700 border-rose-200';
        if (urgency === 'HIGH') return 'bg-orange-100 text-orange-700 border-orange-200';
        if (urgency === 'MEDIUM') return 'bg-amber-100 text-amber-700 border-amber-200';
        return 'bg-blue-50 text-blue-600 border-blue-200'; // LOW
    };

    const getStatusColor = (status: string) => {
        if (status === 'PENDING') return 'bg-amber-50 text-amber-600 border-amber-200';
        if (status === 'IN_PROGRESS') return 'bg-blue-50 text-blue-600 border-blue-200';
        return 'bg-emerald-50 text-emerald-600 border-emerald-200'; // RESOLVED
    };

    const renderColumn = (title: string, status: string, Icon: any, nextStatus: string | null) => {
        const columnTickets = filteredTickets.filter(t => t.status === status);

        return (
            <div className="flex flex-col w-full lg:flex-1 min-w-[320px] bg-gray-50/50 rounded-3xl border border-gray-100 p-5 shadow-inner">
                <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-200">
                    <h3 className="font-black text-gray-900 flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-xl ${
                            status === 'PENDING' ? 'bg-amber-100 text-amber-600' :
                            status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-600' :
                            'bg-emerald-100 text-emerald-600'
                        }`}>
                            <Icon className="w-4 h-4" />
                        </div>
                        {title}
                    </h3>
                    <span className="bg-white text-gray-600 text-xs font-black px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                        {columnTickets.length}
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                    {columnTickets.length === 0 ? (
                        <div className="p-8 text-center flex flex-col items-center justify-center text-sm font-bold text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl bg-white/50">
                            <Icon className="w-8 h-8 mb-2 text-gray-300" />
                            No tickets here
                        </div>
                    ) : (
                        columnTickets.map(ticket => (
                            <div key={ticket.id} className="bg-[#ffffff] p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-[#1f8898]/40 hover:shadow-md transition-all duration-200 group relative">
                                
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-[10px] font-black text-gray-400 tracking-widest bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                        TKT-{ticket.id.substring(0, 4).toUpperCase()}
                                    </span>
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${getUrgencyColor(ticket.urgency)}`}>
                                        {ticket.urgency}
                                    </span>
                                </div>
                                
                                <h4 className="font-black text-sm text-gray-900 mb-1.5">{ticket.issue_type}</h4>
                                <p className="text-sm font-medium text-gray-500 mb-5 line-clamp-2 leading-relaxed">{ticket.description}</p>
                                
                                <div className="flex items-center gap-2 text-[11px] text-gray-600 font-bold mb-4 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                                    <Home className="w-3.5 h-3.5 text-[#1f8898]" /> 
                                    {ticket.unit?.property?.name} • Unit {ticket.unit?.unit_number}
                                </div>
                                
                                <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1f8898] to-[#146a77] text-white flex items-center justify-center text-[10px] font-black shadow-sm">
                                            {ticket.tenant ? ticket.tenant.first_name.charAt(0) : 'V'}
                                        </div>
                                        <span className="text-xs text-gray-900 font-bold max-w-[90px] truncate">
                                            {ticket.tenant ? `${ticket.tenant.first_name} ${ticket.tenant.last_name}` : 'Vacant Unit'}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>

                                {/* Next Status Action */}
                                {nextStatus && (
                                    <button
                                        onClick={() => handleUpdateStatus(ticket.id, nextStatus)}
                                        className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-[#ffffff] border border-gray-200 text-[#1f8898] hover:bg-[#1f8898] hover:text-[#ffffff] hover:border-transparent rounded-full p-2.5 opacity-0 group-hover:opacity-100 transition-all shadow-lg z-10 active:scale-95"
                                        title={`Move to ${nextStatus.replace('_', ' ')}`}
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    };

    const selectedProperty = properties.find(p => p.id === formData.property_id);

    return (
        <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans selection:bg-[#1f8898]/30 overflow-x-hidden">
            
            {/* --- Premium Gradient Hero Area --- */}
            <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-6 pt-8 pb-14 md:pt-10 md:pb-16 relative overflow-hidden shadow-inner">
                <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-100 text-xs font-bold uppercase tracking-widest mb-3 border border-white/20 backdrop-blur-sm">
                            <Wrench className="w-3.5 h-3.5" /> Operations
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-[#ffffff] tracking-tight mb-2">
                            Maintenance Hub
                        </h1>
                        <p className="text-teal-100 text-sm md:text-base font-medium max-w-xl leading-relaxed">
                            Track tenant issues, dispatch repairs, and monitor resolutions across your portfolio.
                        </p>
                    </div>

                    <div className="flex mt-2 md:mt-0">
                        <button 
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-[#ffffff] hover:bg-gray-50 text-[#1f8898] px-6 py-2.5 rounded-xl font-black text-sm shadow-xl shadow-black/10 transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                            <Plus className="w-4 h-4" /> Log Request
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 md:-mt-10 relative z-20">
                
                {/* Inline Status Notifications */}
                {statusMsg && (
                    <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 shadow-lg animate-in fade-in slide-in-from-top-4 border
                        ${statusMsg.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}
                    `}>
                        {statusMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                        <span className="font-bold text-sm">{statusMsg.text}</span>
                    </div>
                )}

                {/* --- Bento Box Analytics Grid --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                    
                    <div className="bg-[#ffffff] p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#ebf3f5] rounded-full blur-2xl pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-[#ebf3f5] flex items-center justify-center text-[#1f8898] border border-[#1f8898]/10">
                                <Layers className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#1f8898] text-right leading-tight">Total<br/>Tickets</span>
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">{tickets.length}</h4>
                            <p className="text-xs text-gray-500 font-medium mt-1">All historical requests</p>
                        </div>
                    </div>

                    <div className="bg-[#ffffff] p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 text-right leading-tight">Awaiting<br/>Review</span>
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">{pendingCount}</h4>
                            <p className="text-xs text-gray-500 font-medium mt-1">New submissions</p>
                        </div>
                    </div>

                    <div className="bg-[#ffffff] p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                                <Clock className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 text-right leading-tight">Work In<br/>Progress</span>
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">{inProgressCount}</h4>
                            <p className="text-xs text-gray-500 font-medium mt-1">Dispatched repairs</p>
                        </div>
                    </div>

                    <div className="bg-[#ffffff] p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 text-right leading-tight">Resolved<br/>Issues</span>
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">{resolvedCount}</h4>
                            <p className="text-xs text-gray-500 font-medium mt-1">Successfully closed</p>
                        </div>
                    </div>
                </div>

                {/* --- Main Data Container (Board or History) --- */}
                <div className="bg-[#ffffff] rounded-3xl shadow-lg shadow-black/5 border border-gray-100 overflow-hidden mb-12 flex flex-col">
                    
                    {/* Dynamic Filtering Toolbar */}
                    <div className="p-5 border-b border-gray-100 bg-[#f8fafb]/50 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                        
                        <div className="flex flex-wrap items-center gap-3">
                            {/* View Mode Toggle */}
                            <div className="flex bg-gray-200/50 p-1 rounded-xl mr-2">
                                <button 
                                    onClick={() => setViewMode('BOARD')} 
                                    className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 ${viewMode === 'BOARD' ? 'bg-white shadow-sm text-[#1f8898]' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <LayoutGrid className="w-3.5 h-3.5" /> Board
                                </button>
                                <button 
                                    onClick={() => setViewMode('HISTORY')} 
                                    className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 ${viewMode === 'HISTORY' ? 'bg-white shadow-sm text-[#1f8898]' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <List className="w-3.5 h-3.5" /> History
                                </button>
                            </div>
                            
                            <div className="h-6 w-px bg-gray-200 hidden sm:block mx-1"></div>
                            
                            {/* All 5 Urgency Filters */}
                            <div className="flex flex-wrap items-center gap-1.5">
                                <button onClick={() => setFilterUrgency('ALL')} className={getFilterPillClass('ALL')}>All</button>
                                <button onClick={() => setFilterUrgency('EMERGENCY')} className={getFilterPillClass('EMERGENCY')}>Emergency</button>
                                <button onClick={() => setFilterUrgency('HIGH')} className={getFilterPillClass('HIGH')}>High</button>
                                <button onClick={() => setFilterUrgency('MEDIUM')} className={getFilterPillClass('MEDIUM')}>Medium</button>
                                <button onClick={() => setFilterUrgency('LOW')} className={getFilterPillClass('LOW')}>Low</button>
                            </div>
                        </div>

                        <div className="relative w-full xl:w-72">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                            <input 
                                type="text" placeholder="Search tickets, units..." 
                                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all bg-[#ffffff] shadow-sm"
                                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* --- Dynamic Content Render --- */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-[500px] text-[#1f8898] gap-4 bg-[#f8fafb]">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <span className="font-bold text-sm uppercase tracking-widest text-gray-400">Loading Records...</span>
                        </div>
                    ) : viewMode === 'BOARD' ? (
                        // KANBAN BOARD VIEW
                        <div className="flex-1 overflow-x-auto p-6 md:p-8 custom-scrollbar bg-[#f8fafb]">
                            <div className="flex flex-col lg:flex-row gap-6 min-h-[600px] lg:w-full w-max">
                                {renderColumn('Pending', 'PENDING', AlertCircle, 'IN_PROGRESS')}
                                {renderColumn('In Progress', 'IN_PROGRESS', Wrench, 'RESOLVED')}
                                {renderColumn('Resolved', 'RESOLVED', CheckCircle2, null)}
                            </div>
                        </div>
                    ) : (
                        // HISTORY TABLE VIEW
                        <div className="overflow-x-auto min-h-[500px]">
                            <table className="w-full text-left border-collapse whitespace-nowrap">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-400 font-black">
                                        <th className="px-6 py-4 pl-8">Ticket ID & Date</th>
                                        <th className="px-6 py-4">Property / Unit</th>
                                        <th className="px-6 py-4">Issue Details</th>
                                        <th className="px-6 py-4 text-center">Urgency</th>
                                        <th className="px-6 py-4 text-center pr-8">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-[#ffffff]">
                                    {filteredTickets.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-16 text-center">
                                                <div className="w-16 h-16 bg-[#ebf3f5] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#1f8898]">
                                                    <List className="w-8 h-8" />
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-1">No historical records found</h3>
                                                <p className="text-sm text-gray-500 font-medium">Adjust your filters to see past tickets.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredTickets.map(ticket => (
                                            <tr key={ticket.id} className="hover:bg-gray-50/50 transition duration-150">
                                                <td className="px-6 py-4 pl-8">
                                                    <div className="font-mono text-xs font-bold text-gray-900 mb-1">TKT-{ticket.id.substring(0, 6).toUpperCase()}</div>
                                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-900 text-sm mb-1">{ticket.unit?.property?.name}</div>
                                                    <div className="text-xs font-medium text-gray-500">Unit {ticket.unit?.unit_number}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-black text-xs text-gray-900 mb-1">{ticket.issue_type}</div>
                                                    <div className="text-xs font-medium text-gray-500 max-w-[250px] truncate">{ticket.description}</div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center justify-center px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-md border ${getUrgencyColor(ticket.urgency)}`}>
                                                        {ticket.urgency}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 pr-8 text-center">
                                                    <span className={`inline-flex items-center justify-center px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg border ${getStatusColor(ticket.status)}`}>
                                                        {ticket.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* --- Premium Add Request Modal --- */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => !isSubmitting && setIsAddModalOpen(false)}></div>
                    
                    <div className="relative w-full max-w-lg bg-[#ffffff] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
                        <div className="bg-[#f8fafb] px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#ebf3f5] rounded-xl flex items-center justify-center text-[#1f8898]">
                                    <Zap className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-gray-900 tracking-tight">Log Maintenance Issue</h3>
                                    <p className="text-xs font-medium text-gray-500">Dispatch a new repair request</p>
                                </div>
                            </div>
                            <button onClick={() => !isSubmitting && setIsAddModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateTicket} className="p-6 space-y-5">
                            
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Category</label>
                                    <select 
                                        className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-[#ffffff] text-sm font-bold text-gray-900 cursor-pointer" 
                                        value={formData.issue_type} onChange={(e) => setFormData({ ...formData, issue_type: e.target.value })}
                                    >
                                        <option value="PLUMBING">Plumbing</option>
                                        <option value="ELECTRICAL">Electrical</option>
                                        <option value="APPLIANCE">Appliance</option>
                                        <option value="GENERAL">General / Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Urgency</label>
                                    <select 
                                        className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-[#ffffff] text-sm font-bold text-gray-900 cursor-pointer" 
                                        value={formData.urgency} onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                                    >
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                        <option value="EMERGENCY">Emergency</option>
                                    </select>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Property</label>
                                        <select 
                                            required 
                                            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-[#ffffff] text-sm font-bold text-gray-900 cursor-pointer" 
                                            value={formData.property_id} onChange={(e) => setFormData({ ...formData, property_id: e.target.value, unit_id: '' })}
                                        >
                                            <option value="" disabled>Select Property</option>
                                            {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Unit</label>
                                        <select 
                                            required disabled={!formData.property_id} 
                                            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-[#ffffff] text-sm font-bold text-gray-900 cursor-pointer disabled:bg-gray-100 disabled:text-gray-400" 
                                            value={formData.unit_id} onChange={(e) => setFormData({ ...formData, unit_id: e.target.value })}
                                        >
                                            <option value="" disabled>Select Unit</option>
                                            {selectedProperty?.units.map((u: any) => <option key={u.id} value={u.id}>{u.unit_number}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Detailed Description</label>
                                <textarea 
                                    required rows={4} placeholder="Describe the issue in detail..." 
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-[#ffffff] text-sm font-medium text-gray-900 resize-none" 
                                    value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                                />
                            </div>
                            
                            <div className="pt-5 border-t border-gray-100 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-3 text-sm font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="px-6 py-3 text-sm font-bold text-[#ffffff] bg-[#1f8898] hover:bg-[#1a7684] rounded-xl transition-colors shadow-lg shadow-[#1f8898]/20 disabled:opacity-50 flex items-center gap-2 active:scale-95">
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                    {isSubmitting ? 'Saving...' : 'Submit Ticket'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}