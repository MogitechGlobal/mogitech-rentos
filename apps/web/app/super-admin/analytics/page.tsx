// apps/web/app/super-admin/analytics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
    Loader2, BarChart3, PieChart as PieChartIcon, 
    TrendingUp, LineChart as LineChartIcon, ShieldCheck, 
    Users, Wallet, Wrench, Download
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

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] bg-[#f8fafb]">
                <Loader2 className="w-10 h-10 animate-spin text-[#1f8898] mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Crunching Platform Data...</p>
            </div>
        );
    }

    // Custom Tooltip for Revenue Chart
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 rounded-xl shadow-xl border border-gray-100">
                    <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">{label}</p>
                    <p className="text-sm font-bold text-[#1f8898]">
                        MRR: KSH {payload[0].value.toLocaleString()}
                    </p>
                    <p className="text-sm font-bold text-indigo-600 mt-1">
                        New Landlords: {payload[1].value}
                    </p>
                </div>
            );
        }
        return null;
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
                            <BarChart3 className="w-3.5 h-3.5" /> Business Intelligence
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-[#ffffff] tracking-tight mb-2">
                            Advanced Analytics
                        </h1>
                        <p className="text-teal-100 text-sm md:text-base font-medium max-w-xl leading-relaxed">
                            Historical trend analysis, tenant behavior patterns, and platform growth metrics.
                        </p>
                    </div>

                    <div className="flex animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                        <button onClick={() => window.print()} className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 backdrop-blur-md active:scale-95 w-full md:w-auto">
                            <Download className="w-4 h-4" /> Export Report
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 relative z-20 space-y-6">
                
                {/* --- 1. MRR & LANDLORD GROWTH (AREA CHART) --- */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-[#1f8898]" /> Platform Growth (12 Months)
                            </h3>
                            <p className="text-xs font-medium text-gray-500 mt-1">Correlation between new landlord acquisition and SaaS revenue.</p>
                        </div>
                    </div>
                    <div className="p-6 h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data?.monthlyTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1f8898" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#1f8898" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorLandlords" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af', fontWeight: 700}} dy={10} />
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af', fontWeight: 700}} dx={-10} tickFormatter={(val) => `KSH ${val/1000}k`} />
                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af', fontWeight: 700}} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold' }} />
                                <Area yAxisId="left" type="monotone" dataKey="revenue" name="SaaS Revenue (KSH)" stroke="#1f8898" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                <Area yAxisId="right" type="monotone" dataKey="newLandlords" name="New Landlords" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorLandlords)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* --- 2. PAYMENT METHODS (BAR CHART) --- */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                        <div className="p-6 border-b border-gray-50">
                            <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-emerald-600" /> Payment Preferences
                            </h3>
                            <p className="text-xs font-medium text-gray-500 mt-1">Tenant volume by transaction method.</p>
                        </div>
                        <div className="p-6 h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data?.paymentStats} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                                    <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af', fontWeight: 700}} tickFormatter={(val) => `KSH ${val/1000}k`} />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#4b5563', fontWeight: 800}} width={100} />
                                    <Tooltip 
                                        cursor={{fill: '#f8fafb'}}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }} 
                                        formatter={(value: any) => [`KSH ${value.toLocaleString()}`, 'Volume Processing']} 
                                    />
                                    <Bar dataKey="amount" fill="#10b981" radius={[0, 8, 8, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* --- 3. MAINTENANCE DISTRIBUTION (DONUT CHART) --- */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                        <div className="p-6 border-b border-gray-50">
                            <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                                <Wrench className="w-5 h-5 text-amber-500" /> Platform Maintenance Load
                            </h3>
                            <p className="text-xs font-medium text-gray-500 mt-1">Distribution of issue types across all properties.</p>
                        </div>
                        <div className="p-6 h-[350px] flex items-center justify-center">
                            {data?.maintenanceStats?.length === 0 ? (
                                <p className="text-sm font-bold text-gray-400">No maintenance data collected yet.</p>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data?.maintenanceStats}
                                            cx="50%" cy="50%"
                                            innerRadius={80} outerRadius={120}
                                            paddingAngle={5} dataKey="value"
                                            label={({name, percent}: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                            labelLine={false}
                                        >
                                            {data?.maintenanceStats.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }} 
                                            formatter={(value: any) => [`${value} Tickets`, 'Total']} 
                                        />
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