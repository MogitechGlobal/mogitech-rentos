// apps/web/app/dashboard/utilities/page.tsx
/* eslint-disable */
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Droplet, Zap, Loader2, Gauge, 
    CheckCircle2, Save, Building2, 
    AlertCircle, Users, Calculator,
    Search, History, TrendingUp, Receipt, Filter, BarChart3
} from 'lucide-react';

export default function UtilitiesManagerPage() {
    const router = useRouter();
    const [properties, setProperties] = useState<any[]>([]);
    const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
    const [units, setUnits] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Advanced UI States
    const [activeTab, setActiveTab] = useState<'water' | 'electricity'>('water');
    const [viewMode, setViewMode] = useState<'input' | 'history'>('input');
    const [searchQuery, setSearchQuery] = useState('');

    // Form State
    const [readings, setReadings] = useState<Record<string, number>>({});
    const [unitPrice, setUnitPrice] = useState<number>(activeTab === 'water' ? 150 : 25);
    const [isSaving, setIsSaving] = useState(false);
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const fetchProperties = async () => {
            const token = localStorage.getItem('access_token');
            try {
                const res = await fetch('http://localhost:3000/api/v1/properties', { headers: { 'Authorization': `Bearer ${token}` }});
                const data = await res.json();
                setProperties(data);
                if (data.length > 0) setSelectedPropertyId(data[0].id);
            } catch (err) { console.error(err); } finally { setIsLoading(false); }
        };
        fetchProperties();
    }, []);

    useEffect(() => {
        if (!selectedPropertyId) return;
        const fetchUnits = async () => {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`http://localhost:3000/api/v1/properties/${selectedPropertyId}/units`, { 
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            
            const propertyUnits = data.units || []; 
            // Only strictly occupied units need readings
            setUnits(propertyUnits.filter((u: any) => u.status === 'OCCUPIED'));
            setReadings({});
            setStatusMsg(null);
            setSearchQuery('');
        };
        fetchUnits();
    }, [selectedPropertyId]);

    const handleSaveReadings = async () => {
        setIsSaving(true);
        setStatusMsg(null);
        const token = localStorage.getItem('access_token');

        try {
            let processedCount = 0;
            for (const unitId of Object.keys(readings)) {
                const readingVal = readings[unitId];
                if (readingVal > 0) {
                    await fetch(`http://localhost:3000/api/v1/units/${unitId}/utilities`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ utilityType: activeTab, reading: readingVal, unitPrice })
                    });
                    processedCount++;
                }
            }

            if (processedCount === 0) {
                setStatusMsg({ type: 'error', text: 'Please enter at least one valid reading before saving.' });
            } else {
                setStatusMsg({ type: 'success', text: `Successfully generated bills for ${processedCount} units!` });
                setReadings({}); 
                setTimeout(() => setStatusMsg(null), 5000);
            }
        } catch (err) {
            setStatusMsg({ type: 'error', text: 'Failed to save readings. Please try again.' });
        } finally {
            setIsSaving(false);
        }
    };

    // --- ADVANCED DERIVED DATA ---

    // Filter units for the input grid
    const filteredUnits = useMemo(() => {
        if (!searchQuery) return units;
        return units.filter(u => {
            const tenantName = u.tenants[0] ? `${u.tenants[0].first_name} ${u.tenants[0].last_name}`.toLowerCase() : '';
            const unitNumber = u.unit_number.toLowerCase();
            const q = searchQuery.toLowerCase();
            return unitNumber.includes(q) || tenantName.includes(q);
        });
    }, [units, searchQuery]);

    // Extract Historical Bills from Tenant Invoices
    const historicalBills = useMemo(() => {
        const bills: any[] = [];
        const utilityKeyword = activeTab === 'water' ? 'water' : 'electricity';
        
        units.forEach(unit => {
            const tenant = unit.tenants[0];
            if (tenant && tenant.invoices) {
                tenant.invoices.forEach((inv: any) => {
                    if (inv.description.toLowerCase().includes(utilityKeyword)) {
                        bills.push({
                            id: inv.id,
                            unit: unit.unit_number,
                            tenant: `${tenant.first_name} ${tenant.last_name}`,
                            amount: inv.amount,
                            date: inv.created_at,
                            status: inv.status,
                            description: inv.description
                        });
                    }
                });
            }
        });
        
        return bills.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [units, activeTab]);

    // Analytics Calculations
    const readingsCount = Object.keys(readings).filter(k => readings[k] > 0).length;
    const progressPercentage = units.length > 0 ? Math.round((readingsCount / units.length) * 100) : 0;
    const totalHistoricalRevenue = historicalBills.reduce((acc, bill) => acc + bill.amount, 0);

    if (isLoading) {
        return (
            <div className="h-full min-h-screen flex flex-col items-center justify-center bg-[#f8fafb]">
                <div className="relative">
                    <Loader2 className="w-12 h-12 animate-spin text-[#1f8898]" />
                    <div className="absolute inset-0 blur-xl bg-[#1f8898]/20 animate-pulse"></div>
                </div>
                <p className="text-sm font-bold text-gray-500 mt-4 uppercase tracking-widest">Loading Utility Engine...</p>
            </div>
        );
    }

    const isWater = activeTab === 'water';
    const ThemeIcon = isWater ? Droplet : Zap;
    const themeAccent = isWater ? 'blue' : 'amber';
    const themeColorText = isWater ? 'text-blue-600' : 'text-amber-600';
    const themeColorBg = isWater ? 'bg-blue-600' : 'bg-amber-500';
    const themeColorHover = isWater ? 'hover:bg-blue-700' : 'hover:bg-amber-600';
    const themeColorLight = isWater ? 'bg-blue-50 border-blue-100' : 'bg-amber-50 border-amber-100';

    return (
        <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans selection:bg-[#1f8898]/30 overflow-x-hidden">
            
            {/* --- Executive Gradient Hero --- */}
            <div className="bg-gradient-to-br from-[#0d393f] to-[#1f8898] px-6 pt-10 pb-24 relative overflow-hidden shadow-inner">
                <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 text-teal-100 text-[10px] font-black uppercase tracking-widest mb-4 border border-white/20 backdrop-blur-sm">
                            <Gauge className="w-3.5 h-3.5" /> Meter Management
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-[#ffffff] tracking-tight mb-2">
                            Utility Billing
                        </h1>
                        <p className="text-teal-100 text-sm md:text-base font-medium max-w-xl">
                            Record readings, track consumption history, and generate utility invoices.
                        </p>
                    </div>

                    <div className="flex bg-white/10 p-1.5 rounded-2xl border border-white/20 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <button 
                            onClick={() => { setActiveTab('water'); setUnitPrice(150); setStatusMsg(null); }} 
                            className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${isWater ? 'bg-white text-blue-600 shadow-md' : 'text-white/70 hover:text-white hover:bg-white/20'}`}
                        >
                            <Droplet className="w-4 h-4" /> Water
                        </button>
                        <button 
                            onClick={() => { setActiveTab('electricity'); setUnitPrice(25); setStatusMsg(null); }} 
                            className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${!isWater ? 'bg-white text-amber-500 shadow-md' : 'text-white/70 hover:text-white hover:bg-white/20'}`}
                        >
                            <Zap className="w-4 h-4" /> Power
                        </button>
                    </div>
                </div>
            </div>

            {/* --- Main Dashboard Content --- */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-12 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* LEFT: Configuration & Analytics Panel */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        
                        {/* Config Card */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-6 relative overflow-hidden group hover:shadow-md transition-shadow">
                            <div className="absolute -right-8 -top-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                                <Calculator className="w-40 h-40" />
                            </div>

                            <div className="relative z-10">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Target Property</label>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
                                    <select 
                                        className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-gray-50/50 text-gray-900 font-bold text-sm appearance-none cursor-pointer" 
                                        value={selectedPropertyId} 
                                        onChange={e => setSelectedPropertyId(e.target.value)}
                                    >
                                        {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="relative z-10 pt-6 border-t border-gray-100">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Billing Rate (KSH per Unit)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-3.5 text-gray-400 font-black text-sm">KSH</span>
                                    <input 
                                        type="number" 
                                        className={`w-full rounded-xl border border-gray-200 pl-14 pr-4 py-3 outline-none focus:bg-white transition-all bg-gray-50/50 text-gray-900 font-black text-xl
                                            ${isWater ? 'focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10' : 'focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10'}
                                        `}
                                        value={unitPrice} 
                                        onChange={e => setUnitPrice(Number(e.target.value))} 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Analytics Mini-Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className={`p-5 rounded-3xl border ${themeColorLight} flex flex-col justify-center`}>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Input Progress</p>
                                <p className={`text-2xl font-black ${themeColorText}`}>{progressPercentage}%</p>
                                <p className="text-xs font-bold text-gray-400 mt-1">{readingsCount} of {units.length} units</p>
                            </div>
                            <div className="p-5 rounded-3xl border border-gray-100 bg-white flex flex-col justify-center shadow-sm">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Lifetime {isWater?'Water':'Power'} Rev</p>
                                <p className="text-xl font-black text-gray-900 truncate">KSH {totalHistoricalRevenue.toLocaleString()}</p>
                            </div>
                        </div>

                        {statusMsg && (
                            <div className={`p-5 rounded-2xl border items-start gap-3 font-bold text-sm animate-in fade-in zoom-in-95 duration-300 shadow-sm flex
                                ${statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}
                            `}>
                                {statusMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
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
                                    onClick={() => setViewMode('input')}
                                    className={`px-6 md:px-8 py-5 text-sm font-black uppercase tracking-widest transition-all border-b-2
                                        ${viewMode === 'input' ? `border-[#1f8898] text-[#1f8898] bg-white` : 'border-transparent text-gray-400 hover:text-gray-600'}
                                    `}
                                >
                                    Record Readings
                                </button>
                                <button 
                                    onClick={() => setViewMode('history')}
                                    className={`px-6 md:px-8 py-5 text-sm font-black uppercase tracking-widest transition-all border-b-2 flex items-center gap-2
                                        ${viewMode === 'history' ? `border-[#1f8898] text-[#1f8898] bg-white` : 'border-transparent text-gray-400 hover:text-gray-600'}
                                    `}
                                >
                                    Billing History <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-[10px]">{historicalBills.length}</span>
                                </button>
                            </div>
                        </div>

                        {/* --- VIEW: INPUT READINGS --- */}
                        {viewMode === 'input' && (
                            <div className="flex flex-col flex-1 animate-in fade-in duration-300">
                                {/* Search & Filter Bar */}
                                <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-4 bg-white">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-4 top-3 w-4 h-4 text-gray-400" />
                                        <input 
                                            type="text" 
                                            placeholder="Search by unit number or tenant name..." 
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#1f8898] text-sm font-medium"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                                        <Filter className="w-4 h-4" /> Filter Unread
                                    </button>
                                </div>

                                <div className="p-4 md:p-6 bg-gray-50/30 flex-1 overflow-y-auto">
                                    {units.length === 0 ? (
                                        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                                                <Gauge className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <h3 className="text-gray-900 font-black text-lg">No Active Units</h3>
                                            <p className="text-sm font-medium text-gray-500 mt-1">There are no occupied units in this property yet.</p>
                                        </div>
                                    ) : filteredUnits.length === 0 ? (
                                        <div className="text-center py-12">
                                            <p className="text-sm font-bold text-gray-400">No units match your search.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {filteredUnits.map(unit => {
                                                const tenantName = unit.tenants[0] ? `${unit.tenants[0].first_name} ${unit.tenants[0].last_name}` : 'Unknown Tenant';
                                                const isFilled = (readings[unit.id] || 0) > 0;

                                                return (
                                                    <div key={unit.id} className={`flex flex-col p-4 md:p-5 rounded-2xl bg-white transition-all duration-200 group
                                                        border shadow-sm
                                                        ${isWater ? 'focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-500/10' : 'focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-500/10'}
                                                        ${isFilled ? 'border-gray-200' : 'border-gray-100 hover:border-gray-300'}
                                                    `}>
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div>
                                                                <p className="font-black text-gray-900 text-sm">Unit {unit.unit_number}</p>
                                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 truncate max-w-[120px]">{tenantName}</p>
                                                            </div>
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors
                                                                ${isFilled 
                                                                    ? (isWater ? 'bg-blue-500 text-white shadow-sm' : 'bg-amber-500 text-white shadow-sm') 
                                                                    : 'bg-gray-50 text-gray-300 group-focus-within:text-gray-500'
                                                                }
                                                            `}>
                                                                <ThemeIcon className="w-4 h-4" />
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="relative mt-auto">
                                                            <input 
                                                                type="number" placeholder="0" min="0"
                                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none transition-colors font-mono font-black text-lg text-right focus:bg-white"
                                                                value={readings[unit.id] || ''}
                                                                onChange={(e) => setReadings({...readings, [unit.id]: Number(e.target.value)})}
                                                            />
                                                            <span className="absolute left-4 top-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                                Reading
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Sticky Save Footer */}
                                <div className="p-5 md:p-6 border-t border-gray-100 bg-white flex justify-between items-center shrink-0">
                                    <p className="text-xs font-bold text-gray-400 hidden sm:block">Invoices will be auto-generated upon saving.</p>
                                    <button 
                                        onClick={handleSaveReadings} 
                                        disabled={isSaving || units.length === 0 || Object.keys(readings).length === 0}
                                        className={`flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 text-white font-black text-sm rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100
                                            ${themeColorBg} ${themeColorHover} shadow-${themeAccent}-500/20
                                        `}
                                    >
                                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} 
                                        {isSaving ? 'Processing...' : 'Save & Generate Bills'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* --- VIEW: HISTORY & ANALYTICS --- */}
                        {viewMode === 'history' && (
                            <div className="flex flex-col flex-1 animate-in fade-in slide-in-from-right-4 duration-300">
                                {historicalBills.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                                            <History className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <h3 className="text-gray-900 font-black text-xl mb-2">No Billing History</h3>
                                        <p className="text-sm font-medium text-gray-500 max-w-sm mx-auto">
                                            There are no generated {activeTab} invoices for this property yet. Record new readings to generate bills.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse whitespace-nowrap">
                                            <thead>
                                                <tr className="bg-white border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-400 font-black sticky top-0 z-10">
                                                    <th className="px-6 md:px-8 py-4">Unit / Tenant</th>
                                                    <th className="px-6 py-4">Invoice Details</th>
                                                    <th className="px-6 py-4 text-right">Amount Billed</th>
                                                    <th className="px-6 md:px-8 py-4 text-center">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50 bg-white">
                                                {historicalBills.map((bill) => (
                                                    <tr key={bill.id} className="hover:bg-gray-50/50 transition duration-150">
                                                        <td className="px-6 md:px-8 py-4">
                                                            <div className="font-black text-gray-900 text-sm">Unit {bill.unit}</div>
                                                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5 truncate max-w-[150px]">{bill.tenant}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <Receipt className="w-4 h-4 text-gray-400" />
                                                                <div>
                                                                    <div className="font-bold text-gray-700 text-sm">{bill.description}</div>
                                                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                                                                        {new Date(bill.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <span className="font-black text-gray-900 text-base">KSH {bill.amount.toLocaleString()}</span>
                                                        </td>
                                                        <td className="px-6 md:px-8 py-4 text-center">
                                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border ${
                                                                bill.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                                bill.status === 'PARTIAL' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                                'bg-rose-50 text-rose-700 border-rose-200'
                                                            }`}>
                                                                {bill.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}