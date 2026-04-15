// apps/web/app/super-admin/analytics/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
    Loader2, BarChart3, PieChart as PieChartIcon, 
    TrendingUp, LineChart as LineChartIcon, ShieldCheck, 
    Users, Wallet, Wrench, Download, Activity, Building2, CreditCard
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#1f8898', '#f59e0b', '#8b5cf6', '#10b981', '#f43f5e', '#64748b'];

export default function AnalyticsPage() {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/analytics`, { credentials: 'include' });
                if (res.ok) setData(await res.json());
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    // --- DERIVED SUMMARY METRICS (YTD) ---
    const summary = useMemo(() => {
        if (!data) return null;
        
        const totalRevenueYTD = data.monthlyTrends?.reduce((sum: number, month: any) => sum + (month.revenue || 0), 0) || 0;
        const totalLandlordsYTD = data.monthlyTrends?.reduce((sum: number, month: any) => sum + (month.newLandlords || 0), 0) || 0;
        
        // Find the top payment method
        let topMethod = { name: 'N/A', amount: 0 };
        if (data.paymentStats?.length > 0) {
            topMethod = data.paymentStats.reduce((prev: any, current: any) => (prev.amount > current.amount) ? prev : current);
        }

        return { totalRevenueYTD, totalLandlordsYTD, topMethod };
    }, [data]);

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[600px] bg-[#f8fafb]">
                <Loader2 className="w-10 h-10 animate-spin text-[#1f8898] mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Crunching Platform Data...</p>
            </div>
        );
    }

    // Custom Tooltip for the Area Chart
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100 animate-in zoom-in-95 duration-200">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-50 pb-2">{label}</p>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-6">
                            <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#1f8898]"></div> SaaS Revenue</span>
                            <span className="text-sm font-black text-gray-900">KSH {payload[0].value.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between gap-6">
                            <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> New Landlords</span>
                            <span className="text-sm font-black text-gray-900">{payload[1].value}</span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans selection:bg-[#1f8898]/30 overflow-x-hidden">
            
            {/* --- Premium Gradient Hero Area --- */}
            <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-6 pt-8 pb-24 relative overflow-hidden shadow-inner">
                <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-teal-100 text-[10px] font-black uppercase tracking-widest mb-4 border border-white/20 backdrop-blur-sm">
                            <BarChart3 className="w-3.5 h-3.5" /> Business Intelligence
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-[#ffffff] tracking-tight mb-2">
                            Advanced Analytics
                        </h1>
                        <p className="text-teal-100 text-sm md:text-base font-medium max-w-xl leading-relaxed">
                            Historical trend analysis, tenant behavior patterns, and platform growth metrics.
                        </p>
                    </div>

                    <div className="flex animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 w-full md:w-auto">
                        <button onClick={() => window.print()} className="w-full md:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3 md:py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 backdrop-blur-md active:scale-95 shadow-sm">
                            <Download className="w-4 h-4" /> Export Report
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-[1400px] mx-auto px-4 sm:px-6 -mt-14 relative z-20 space-y-6">
                
                {/* --- 0. YTD SUMMARY METRICS (NEW BENTO GRID) --- */}
                {summary && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-gray-200 flex flex-col justify-between group hover:-translate-y-1 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 rounded-xl bg-[#ebf3f5] flex items-center justify-center border border-[#1f8898]/10 text-[#1f8898]">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-100 px-2.5 py-1 rounded-md">12 Months</span>
                            </div>
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-widest text-gray-500 mb-1">Platform Revenue (YTD)</p>
                                <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                                    <span className="text-sm text-gray-400 mr-1">KSH</span>{summary.totalRevenueYTD.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-gray-200 flex flex-col justify-between group hover:-translate-y-1 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 text-indigo-600">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-100 px-2.5 py-1 rounded-md">12 Months</span>
                            </div>
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-widest text-gray-500 mb-1">New Landlords (YTD)</p>
                                <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">{summary.totalLandlordsYTD}</p>
                            </div>
                        </div>

                        <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-gray-200 flex flex-col justify-between group hover:-translate-y-1 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100 text-emerald-600">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">Top Method</span>
                            </div>
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-widest text-gray-500 mb-1">Primary Gateway Volume</p>
                                <p className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight truncate">{summary.topMethod.name.replace('_', ' ')}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- 1. MRR & LANDLORD GROWTH (AREA CHART) --- */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                    <div className="p-5 sm:p-6 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                            <Activity className="w-5 h-5 text-[#1f8898]" /> Platform Growth & Revenue
                        </h3>
                        <p className="text-xs font-medium text-gray-500 mt-1">Correlation between new landlord acquisition and SaaS revenue over the last 12 months.</p>
                    </div>
                    <div className="p-4 sm:p-6 h-[350px] sm:h-[450px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data?.monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1f8898" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#1f8898" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorLandlords" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af', fontWeight: 800}} dy={10} />
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af', fontWeight: 800}} dx={-10} tickFormatter={(val) => `KSH ${val/1000}k`} />
                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af', fontWeight: 800}} dx={10} />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e5e7eb', strokeWidth: 2, strokeDasharray: '5 5' }} />
                                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontWeight: 'bold', color: '#4b5563' }} iconType="circle" />
                                <Area yAxisId="left" type="monotone" dataKey="revenue" name="SaaS Revenue (KSH)" stroke="#1f8898" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" activeDot={{ r: 6, fill: '#1f8898', stroke: '#fff', strokeWidth: 2 }} />
                                <Area yAxisId="right" type="monotone" dataKey="newLandlords" name="New Landlords" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorLandlords)" activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    
                    {/* --- 2. PAYMENT METHODS (BAR CHART) --- */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                        <div className="p-5 sm:p-6 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-emerald-600" /> Transaction Gateway Volume
                            </h3>
                            <p className="text-xs font-medium text-gray-500 mt-1">Tenant volume processed by each payment method.</p>
                        </div>
                        <div className="p-4 sm:p-6 h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data?.paymentStats} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                                    <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af', fontWeight: 800}} tickFormatter={(val) => `KSH ${val/1000}k`} />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#4b5563', fontWeight: 900}} width={80} />
                                    <Tooltip 
                                        cursor={{fill: '#f8fafb'}}
                                        contentStyle={{ borderRadius: '16px', border: '1px solid #f3f4f6', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px 16px' }} 
                                        itemStyle={{ fontWeight: '900', color: '#10b981', fontSize: '14px' }}
                                        labelStyle={{ fontSize: '10px', fontWeight: '900', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '4px' }}
                                        formatter={(value: any) => [`KSH ${value.toLocaleString()}`, 'Volume']} 
                                    />
                                    <Bar dataKey="amount" fill="#10b981" radius={[0, 8, 8, 0]} barSize={32} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* --- 3. MAINTENANCE DISTRIBUTION (DONUT CHART) --- */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                        <div className="p-5 sm:p-6 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                                <Wrench className="w-5 h-5 text-amber-500" /> Platform Maintenance Load
                            </h3>
                            <p className="text-xs font-medium text-gray-500 mt-1">Distribution of issue types across the entire ecosystem.</p>
                        </div>
                        <div className="p-4 sm:p-6 h-[350px] flex items-center justify-center">
                            {data?.maintenanceStats?.length === 0 ? (
                                <div className="text-center">
                                    <ShieldCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                    <p className="text-sm font-bold text-gray-500">No maintenance data recorded yet.</p>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data?.maintenanceStats}
                                            cx="50%" cy="50%"
                                            innerRadius={80} outerRadius={110}
                                            paddingAngle={4} dataKey="value"
                                            stroke="none"
                                            label={({name, percent}: any) => window.innerWidth > 640 ? `${name} (${((percent || 0) * 100).toFixed(0)}%)` : ''}
                                            labelLine={false}
                                        >
                                            {data?.maintenanceStats.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity outline-none" />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '16px', border: '1px solid #f3f4f6', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px 16px' }} 
                                            itemStyle={{ fontWeight: '900', color: '#111827', fontSize: '14px' }}
                                            labelStyle={{ display: 'none' }}
                                            formatter={(value: any, name: any) => [`${value} Tickets`, name]} 
                                        />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '20px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}