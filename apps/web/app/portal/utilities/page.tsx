// apps/web/app/portal/utilities/page.tsx
/* eslint-disable */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Droplet, Zap, Loader2, AlertCircle, 
    TrendingUp, TrendingDown, CheckCircle2,
    Calculator, History, Gauge
} from 'lucide-react';

export default function TenantUtilitiesPage() {
    const router = useRouter();
    const [utilityData, setUtilityData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'water' | 'electricity'>('water');

    useEffect(() => {
        const fetchUtilities = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) return router.push('/login');

            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portal/utilities', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Failed to load utility data');
                
                const data = await res.json();
                setUtilityData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUtilities();
    }, [router]);

    if (isLoading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-[#f8fafb]">
                <div className="relative">
                    <Loader2 className="w-12 h-12 animate-spin text-[#1f8898]" />
                    <div className="absolute inset-0 blur-xl bg-[#1f8898]/20 animate-pulse"></div>
                </div>
                <p className="text-sm font-bold text-gray-500 mt-4 uppercase tracking-widest">Loading Meters...</p>
            </div>
        );
    }

    if (error || !utilityData) {
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

    const data = utilityData[activeTab];
    const hasData = data.history && data.history.length > 0;
    
    // Safely calculate trends even if there is only 1 or 0 readings
    const prevMonthData = data.history.length > 1 ? data.history[data.history.length - 2] : { consumption: 0 };
    const isHigher = data.consumption > prevMonthData.consumption;
    const consumptionDiff = Math.abs(data.consumption - prevMonthData.consumption);
    const maxChartValue = hasData ? Math.max(...data.history.map((h: any) => h.consumption)) * 1.2 : 100;

    const isWater = activeTab === 'water';
    const themeColor = isWater ? 'blue' : 'amber';
    const ThemeIcon = isWater ? Droplet : Zap;
    const unitLabel = isWater ? 'Units (m³)' : 'kWh';

    return (
        <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans selection:bg-[#1f8898]/30 overflow-x-hidden">

            {/* --- Advanced Gradient Hero Area --- */}
            <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-6 pt-10 pb-20 relative overflow-hidden shadow-inner">
                <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-teal-100 text-[10px] font-black uppercase tracking-widest mb-4 border border-white/20 backdrop-blur-sm">
                            <Gauge className="w-3.5 h-3.5" /> Meter Readings
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-[#ffffff] tracking-tight mb-2">
                            Utility Tracking
                        </h1>
                        <p className="text-teal-100 text-sm md:text-base font-medium max-w-xl">
                            Monitor your exact consumption and see how your monthly utility bills are calculated.
                        </p>
                    </div>

                    {/* Desktop Utility Toggle */}
                    <div className="hidden md:flex bg-black/20 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
                        <button onClick={() => setActiveTab('water')} className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${isWater ? 'bg-white text-blue-600 shadow-md' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>
                            <Droplet className="w-4 h-4" /> Water
                        </button>
                        <button onClick={() => setActiveTab('electricity')} className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${!isWater ? 'bg-white text-amber-500 shadow-md' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>
                            <Zap className="w-4 h-4" /> Electricity
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 relative z-20 space-y-6">
                
                {/* Mobile Utility Toggle */}
                <div className="md:hidden flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm mb-6">
                    <button onClick={() => setActiveTab('water')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${isWater ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'text-gray-400 hover:text-gray-600'}`}>
                        <Droplet className="w-4 h-4" /> Water
                    </button>
                    <button onClick={() => setActiveTab('electricity')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${!isWater ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'text-gray-400 hover:text-gray-600'}`}>
                        <Zap className="w-4 h-4" /> Power
                    </button>
                </div>

                {/* --- TOP METRICS GRID --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
                    
                    {/* CURRENT BILL CARD */}
                    <div className="bg-[#ffffff] p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
                        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-50 bg-${themeColor}-200`}></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border bg-${themeColor}-50 text-${themeColor}-600 border-${themeColor}-100`}>
                                    <ThemeIcon className="w-5 h-5" />
                                </div>
                                <span className={`bg-${themeColor}-50 text-${themeColor}-700 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border border-${themeColor}-200`}>
                                    Latest Bill
                                </span>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Due</p>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-sm font-black text-gray-400">KSH</span>
                                <span className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 group-hover:text-[#1f8898] transition-colors">
                                    {data.total_bill.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* CONSUMPTION CARD */}
                    <div className="bg-[#ffffff] p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all">
                        <div>
                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 border border-gray-100 group-hover:bg-[#ebf3f5] group-hover:text-[#1f8898] transition-all shrink-0">
                                    <Gauge className="w-5 h-5" />
                                </div>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Consumption</p>
                            <p className="text-3xl font-black text-gray-900 leading-tight tracking-tight">
                                {data.consumption} <span className="text-sm text-gray-400 font-bold">{unitLabel}</span>
                            </p>
                        </div>
                        <div className="mt-6 pt-5 border-t border-gray-100">
                            {hasData && data.history.length > 1 ? (
                                <p className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${isHigher ? 'text-rose-500' : 'text-emerald-500'}`}>
                                    {isHigher ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                                    {consumptionDiff} units {isHigher ? 'more' : 'less'} than last month
                                </p>
                            ) : (
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                                    <AlertCircle className="w-3.5 h-3.5" /> Awaiting historical data
                                </p>
                            )}
                        </div>
                    </div>

                    {/* THE MATH CARD */}
                    <div className={`bg-${themeColor}-600 p-6 md:p-8 rounded-3xl shadow-[0_15px_30px_-10px_rgba(0,0,0,0.2)] text-white relative overflow-hidden group flex flex-col justify-between`}>
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="relative z-10">
                            <h3 className="text-lg font-black tracking-tight mb-4 flex items-center gap-2">
                                <Calculator className="w-5 h-5 text-white/80" /> How it's calculated
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center bg-white/10 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Current Reading</span>
                                    <span className="font-black">{data.current_reading}</span>
                                </div>
                                <div className="flex justify-between items-center bg-white/10 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Previous Reading</span>
                                    <span className="font-black">- {data.previous_reading}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-white/20">
                                    <span className="text-xs font-black uppercase tracking-widest text-white/90">Units Used</span>
                                    <span className="font-black text-lg">{data.consumption}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- BOTTOM SECTION: CHART & LEDGER --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
                    
                    {/* CHART */}
                    <div className="lg:col-span-2 bg-[#ffffff] rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                                    <TrendingUp className={`w-5 h-5 text-${themeColor}-500`} /> Consumption Trend
                                </h3>
                                <p className="text-xs text-gray-500 font-medium mt-1">Your historical {activeTab} usage.</p>
                            </div>
                            <span className="text-sm font-black text-gray-900 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                                KSH {data.unit_price} <span className="text-gray-400 text-xs font-bold">/ unit</span>
                            </span>
                        </div>
                        
                        {hasData ? (
                            <div className="h-64 flex items-end justify-between gap-2 md:gap-6 relative">
                                {/* Y-Axis Grid Lines */}
                                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="w-full border-t border-gray-100 border-dashed"></div>
                                    ))}
                                </div>
                                
                                {/* Bars */}
                                {data.history.map((item: any, i: number) => {
                                    // Handle maxChartValue = 0 to prevent Infinity errors
                                    const heightPercentage = maxChartValue > 0 ? (item.consumption / maxChartValue) * 100 : 5;
                                    const isCurrent = i === data.history.length - 1;
                                    
                                    return (
                                        <div key={`${item.month}-${i}`} className="relative flex flex-col items-center justify-end h-full flex-1 group">
                                            {/* Tooltip */}
                                            <div className="absolute -top-12 bg-gray-900 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none whitespace-nowrap shadow-xl">
                                                {item.consumption} {unitLabel}
                                            </div>
                                            
                                            {/* The Bar */}
                                            <div 
                                                className={`w-full max-w-[48px] rounded-t-xl transition-all duration-500 relative z-10 ${
                                                    isCurrent 
                                                    ? `bg-${themeColor}-500 shadow-[0_0_15px_rgba(0,0,0,0.1)] shadow-${themeColor}-500/30` 
                                                    : 'bg-gray-100 group-hover:bg-gray-200'
                                                }`}
                                                style={{ height: `${heightPercentage}%` }}
                                            ></div>
                                            <span className={`mt-3 text-xs font-black uppercase tracking-widest ${isCurrent ? `text-${themeColor}-600` : 'text-gray-400'}`}>
                                                {item.month}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="h-64 flex flex-col items-center justify-center text-center">
                                <Gauge className="w-12 h-12 text-gray-200 mb-3" />
                                <p className="text-gray-900 font-black">No Chart Data Yet</p>
                                <p className="text-sm font-medium text-gray-500">Readings will appear here once recorded by management.</p>
                            </div>
                        )}
                    </div>

                    {/* LEDGER HISTORY */}
                    <div className="bg-[#ffffff] rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col max-h-[420px]">
                        <div className="p-6 md:p-8 border-b border-gray-100 shrink-0 bg-white">
                            <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                                <History className={`w-5 h-5 text-${themeColor}-500`} /> Reading Log
                            </h3>
                        </div>
                        
                        <div className="overflow-y-auto custom-scrollbar p-2 flex-1">
                            {!hasData ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No Records</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {/* UI Ledger should show newest first, so we reverse the history array */}
                                    {[...data.history].reverse().map((item: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 bg-gray-50/50 hover:bg-white hover:border-gray-200 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 border border-gray-100 shadow-sm text-gray-500 font-black text-[10px]`}>
                                                    {item.month}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm tracking-tight">{item.reading} Reading</p>
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-0.5">
                                                        {item.consumption} Units Used
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-gray-900">KSH {item.amount.toLocaleString()}</p>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 flex items-center justify-end gap-1">
                                                    <CheckCircle2 className="w-3 h-3"/> Billed
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}