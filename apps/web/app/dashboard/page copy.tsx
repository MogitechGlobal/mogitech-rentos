// apps/web/app/dashboard/page.tsx
/* eslint-disable */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import _ from 'lodash';
import { 
  Building2, Wallet, AlertCircle, TrendingUp, 
  TrendingDown, Download, Activity, ArrowRight,
  CheckCircle2, Clock, CalendarDays, DoorOpen, 
  FileText, Smartphone, XCircle // <-- Added Smartphone & XCircle for M-Pesa widget
} from 'lucide-react';

export default function MasterDashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [data, setData] = useState({
    profile: null as any, 
    properties: [] as any[],
    tenants: [] as any[],
    invoices: [] as any[],
    mpesaLogs: [] as any[] // <-- Added state for M-Pesa Webhooks
  });

  useEffect(() => {
    const fetchAllData = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return router.push('/login');

      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // --- ADDED M-PESA LOGS TO PROMISE.ALL ---
        const [profileRes, propsRes, tenantsRes, invsRes, mpesaRes] = await Promise.all([
          fetch('http://localhost:3000/api/v1/landlords/profile', { headers }),
          fetch('http://localhost:3000/api/v1/properties', { headers }),
          fetch('http://localhost:3000/api/v1/tenants', { headers }),
          fetch('http://localhost:3000/api/v1/invoices', { headers }),
          fetch('http://localhost:3000/api/v1/mpesa/logs', { headers }) // <-- New Endpoint
        ]);

        if (!propsRes.ok || !tenantsRes.ok || !invsRes.ok || !profileRes.ok) {
           throw new Error('Failed to load dashboard data. Please check your connection.');
        }

        setData({
          profile: await profileRes.json(),
          properties: await propsRes.json(),
          tenants: await tenantsRes.json(),
          invoices: await invsRes.json(),
          mpesaLogs: mpesaRes.ok ? await mpesaRes.json() : [] // Safely parse logs
        });
      } catch (err: any) { 
        setError(err.message); 
      } finally { 
        setIsLoading(false); 
      }
    };
    fetchAllData();
  }, [router]);

  // --- Lodash-Optimized Data Processing ---
  const totalProperties = _.size(data.properties);
  const activeTenants = _.size(_.filter(data.tenants, { is_active: true }));
  const totalUnits = _.sumBy(data.properties, (p) => _.size(p.units));
  const occupancyRate = totalUnits === 0 ? 0 : Math.round((activeTenants / totalUnits) * 100);

  const allPayments = _.flatMap(data.invoices, (inv) => inv.payments || []);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const getRevenueForMonth = (month: number, year: number) => {
    const monthlyPayments = _.filter(allPayments, (p) => {
      const d = new Date(p.created_at);
      return d.getMonth() === month && d.getFullYear() === year;
    });
    return _.sumBy(monthlyPayments, 'amount_paid') || 0;
  };

  const thisMonthRevenue = getRevenueForMonth(currentMonth, currentYear);
  const lastMonthRevenue = getRevenueForMonth(lastMonth, lastMonthYear);
  
  const revenueTrend = lastMonthRevenue === 0 
    ? (thisMonthRevenue > 0 ? 100 : 0) 
    : Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100);

  const totalBilled = _.sumBy(data.invoices, 'amount') || 0;
  const totalCollected = _.sumBy(allPayments, 'amount_paid') || 0;
  const totalOutstanding = totalBilled - totalCollected;

  const chartData = _.map(_.range(5, -1, -1), (i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return {
      month: d.toLocaleString('default', { month: 'short' }),
      total: getRevenueForMonth(d.getMonth(), d.getFullYear())
    };
  });
  
  const maxRevenue = Math.max(..._.map(chartData, 'total'), 1000);

  const generateChartPath = () => {
    if (_.isEmpty(chartData)) return '';
    const width = 500;
    const height = 150;
    const points = _.map(chartData, (d, index) => {
      const x = (index / (chartData.length - 1)) * width;
      const y = height - ((d.total / maxRevenue) * height);
      return `${x},${y}`;
    });
    return `M0,${height} L${points.join(' L')} L${width},${height} Z`;
  };

  const generateLinePath = () => {
    if (_.isEmpty(chartData)) return '';
    const width = 500;
    const height = 150;
    return 'M' + _.map(chartData, (d, index) => {
      const x = (index / (chartData.length - 1)) * width;
      const y = height - ((d.total / maxRevenue) * height);
      return `${x},${y}`;
    }).join(' L');
  };

  const recentInvoices = _.take(_.orderBy(data.invoices, ['created_at'], ['desc']), 6);

  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const currentDateString = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  let userFirstName = 'Executive';
  const p = data.profile; 
  if (p?.user?.first_name) {
    userFirstName = p.user.first_name;
  } else if (p?.first_name) { 
    userFirstName = p.first_name;
  } else if (p?.user?.email || p?.email) {
    const emailPrefix = (p?.user?.email || p?.email).split('@')[0];
    userFirstName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
  }

  // --- Helper to mask phone numbers for privacy (e.g. 254712***678) ---
  const maskPhone = (phone: string) => {
    if (!phone) return 'Unknown';
    if (phone.length < 9) return phone;
    return `${phone.substring(0, 6)}***${phone.substring(phone.length - 3)}`;
  };

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8fafb]">
      <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
      <h2 className="text-xl font-black text-gray-900">Connection Error</h2>
      <p className="text-gray-500 mt-2">{error}</p>
      <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2.5 bg-[#1f8898] text-white font-bold rounded-xl shadow-lg hover:bg-[#1a7684] transition-all">Retry Connection</button>
    </div>
  );

  const cardClass = "bg-[#ffffff] p-5 xl:p-4 2xl:p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden";

  return (
    <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans text-gray-900 selection:bg-[#1f8898]/30 overflow-x-hidden">
      
      {/* --- Premium Gradient Hero Area --- */}
      <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-6 pt-8 pb-16 relative overflow-hidden shadow-inner">
        <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-100 text-[10px] font-black uppercase tracking-widest mb-3 border border-white/20 backdrop-blur-sm">
                <CalendarDays className="w-3.5 h-3.5" /> {currentDateString}
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[#ffffff] tracking-tight mb-1">
              {greeting}, {userFirstName}.
            </h1>
            <p className="text-teal-100 text-sm md:text-base font-medium max-w-xl">
              Here is the real-time financial and operational status of your portfolio.
            </p>
          </div>

          <div className="flex mt-2 md:mt-0">
            <Link href="/dashboard/reports" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-2.5 rounded-xl font-bold text-sm backdrop-blur-md transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm">
              <Download className="w-4 h-4" /> Export Report
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 relative z-20 space-y-6">
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-3xl shadow-lg border border-gray-100">
            <Activity className="w-10 h-10 animate-pulse text-[#1f8898] mb-4" /> 
            <p className="font-bold text-sm uppercase tracking-widest text-gray-400">Loading Portfolio Data...</p>
          </div>
        ) : (
          <>
            {/* --- Bento Box KPI Grid --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-5">
              
              <div className={cardClass}>
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full blur-2xl pointer-events-none"></div>
                <div className="flex flex-row items-center justify-between mb-2 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 text-right leading-tight">Total<br/>Billed</span>
                </div>
                <div className="relative z-10 mt-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs font-black text-gray-400">KSH</span>
                    <span className="text-2xl xl:text-xl 2xl:text-3xl font-black text-gray-900 tracking-tight truncate">
                      {totalBilled.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium mt-1 truncate">Across active invoices</p>
                </div>
              </div>

              <div className={cardClass}>
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl pointer-events-none"></div>
                <div className="flex flex-row items-center justify-between mb-2 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 text-right leading-tight">Earnings<br/>(MTD)</span>
                </div>
                <div className="relative z-10 mt-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs font-black text-gray-400">KSH</span>
                    <span className="text-2xl xl:text-xl 2xl:text-3xl font-black text-gray-900 tracking-tight truncate">
                      {thisMonthRevenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5 truncate">
                    <span className={`flex items-center text-[10px] font-black px-1.5 py-0.5 rounded-md ${revenueTrend >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {revenueTrend >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                      {Math.abs(revenueTrend)}%
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider truncate">vs last month</span>
                  </div>
                </div>
              </div>

              <div className={cardClass}>
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 rounded-full blur-2xl pointer-events-none"></div>
                <div className="flex flex-row items-center justify-between mb-2 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100 shrink-0">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 text-right leading-tight">Arrears<br/>Balance</span>
                </div>
                <div className="relative z-10 mt-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs font-black text-gray-400">KSH</span>
                    <span className="text-2xl xl:text-xl 2xl:text-3xl font-black text-gray-900 tracking-tight truncate">
                      {totalOutstanding.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium mt-1.5 truncate">Total unpaid in portfolio</p>
                </div>
              </div>

              <div className={cardClass.replace('flex-col justify-between', 'flex-row items-center justify-between')}>
                <div className="flex flex-col min-w-0 pr-2">
                  <div className="flex items-center gap-1.5 mb-2">
                     <DoorOpen className="w-4 h-4 text-gray-400" />
                     <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Occupancy</h3>
                  </div>
                  <div className="text-2xl xl:text-xl 2xl:text-3xl font-black text-gray-900 tracking-tight truncate">{occupancyRate}%</div>
                  <p className="text-[11px] text-gray-500 font-medium mt-1 truncate">{activeTenants} / {totalUnits} Units Leased</p>
                </div>
                <div className="relative w-14 h-14 2xl:w-16 2xl:h-16 flex-shrink-0 drop-shadow-sm">
                  <svg className="w-full h-full transform -rotate-90 drop-shadow-sm" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f3f4f6" strokeWidth="4.5"></circle>
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#1f8898" strokeWidth="4.5" 
                      strokeDasharray={`${occupancyRate}, ${100 - occupancyRate}`} strokeDashoffset="0" strokeLinecap="round">
                    </circle>
                  </svg>
                </div>
              </div>

              <div className="bg-[#1f8898] p-5 xl:p-4 2xl:p-6 rounded-3xl shadow-[0_15px_30px_-10px_rgba(31,136,152,0.4)] border border-[#1f8898] flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 transition-all">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#ffffff]/10 rounded-full blur-2xl group-hover:bg-[#ffffff]/20 transition-all duration-500 pointer-events-none"></div>
                <div className="relative z-10 flex flex-row items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm border border-white/10 shrink-0">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-teal-100 text-right leading-tight">Total<br/>Properties</h3>
                </div>
                <div className="relative z-10 mt-1">
                  <div className="text-3xl xl:text-2xl 2xl:text-4xl font-black text-[#ffffff] tracking-tight">{totalProperties}</div>
                  <Link href="/dashboard/properties" className="inline-flex items-center justify-between w-full text-[11px] font-bold text-teal-100 hover:text-[#ffffff] mt-2 pt-2 border-t border-white/10">
                    Manage Portfolio <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

            </div>

            {/* --- Middle Section: Analytics & Lists --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              
              {/* Premium Area Chart */}
              <div className="lg:col-span-2 bg-[#ffffff] rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                <div className="p-6 md:p-8 pb-4 flex items-center justify-between z-10 relative">
                  <div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Revenue Trajectory</h3>
                    <p className="text-sm text-gray-500 font-medium mt-1">6-Month collection history</p>
                  </div>
                  <div className="inline-flex items-center rounded-full border border-gray-200 px-3 py-1 text-[10px] uppercase tracking-widest font-black bg-gray-50 text-gray-500">
                    <div className="w-2 h-2 rounded-full bg-[#1f8898] mr-2"></div> Realized Income
                  </div>
                </div>
                
                <div className="p-6 pt-0 flex-1 relative min-h-[220px]">
                  <div className="absolute inset-0 pt-6 pb-8 pl-14 pr-8 flex flex-col justify-between pointer-events-none">
                    {_.map([1, 0.75, 0.5, 0.25, 0], (tick, i) => (
                      <div key={i} className="w-full flex items-center border-b border-dashed border-gray-200 h-0">
                        <span className="absolute left-2 text-[10px] font-bold text-gray-400 tracking-wider">
                          {(maxRevenue * tick).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="absolute inset-0 pl-16 pr-8 pt-6 pb-8">
                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 500 150">
                      <defs>
                        <linearGradient id="gradientTeal" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#1f8898" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#1f8898" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path d={generateChartPath()} fill="url(#gradientTeal)" />
                      <path d={generateLinePath()} fill="none" stroke="#1f8898" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      
                      {_.map(chartData, (data, index) => {
                        const x = (index / (chartData.length - 1)) * 500;
                        const y = 150 - ((data.total / maxRevenue) * 150);
                        return (
                          <g key={index} className="group cursor-pointer">
                            <circle cx={x} cy={y} r="12" fill="#1f8898" opacity="0" className="transition-opacity group-hover:opacity-20" />
                            <circle cx={x} cy={y} r="5" fill="#ffffff" stroke="#1f8898" strokeWidth="3" className="transition-transform group-hover:scale-110 shadow-lg" />
                            <rect x={x - 45} y={y - 38} width="90" height="26" rx="6" fill="#0d393f" className="opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-xl" />
                            <text x={x} y={y - 20} textAnchor="middle" className="text-[10px] font-black fill-[#ffffff] opacity-0 group-hover:opacity-100 transition-opacity tracking-wider">
                              KSH {data.total.toLocaleString()}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  <div className="absolute bottom-2 left-16 right-8 flex justify-between">
                    {_.map(chartData, (data, idx) => (
                      <span key={idx} className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{data.month}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active Portfolio List */}
              <div className="bg-[#ffffff] rounded-3xl shadow-sm border border-gray-100 flex flex-col max-h-[380px]">
                <div className="p-6 md:p-8 pb-4 border-b border-gray-100 shrink-0">
                  <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                     <Building2 className="w-5 h-5 text-[#1f8898]" /> Active Portfolio
                  </h3>
                </div>
                <div className="p-4 flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                  {_.isEmpty(data.properties) ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 mb-3">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-gray-900">No properties</p>
                      <p className="text-xs text-gray-500 font-medium mt-1">Add a property to start tracking.</p>
                    </div>
                  ) : (
                    _.map(data.properties, prop => (
                      <Link key={prop.id} href={`/dashboard/properties/${prop.id}`} className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-[#ebf3f5] hover:border-[#1f8898]/30 transition-all duration-200 group">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-[#ffffff] shadow-sm flex items-center justify-center text-[#1f8898] border border-gray-200 group-hover:border-[#1f8898]/20">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900 tracking-tight group-hover:text-[#1f8898] transition-colors">{prop.name}</p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">{_.size(prop.units)} Managed Units</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#1f8898] transition-transform group-hover:translate-x-1" />
                      </Link>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* --- Bottom Section: Ledger & M-Pesa Grid --- */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
              
              {/* Ledger Table (Spans 2 columns) */}
              <div className="xl:col-span-2 bg-[#ffffff] rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 md:p-8 border-b border-gray-100 gap-4">
                  <div>
                    <h3 className="text-lg font-black text-gray-900 tracking-tight">Recent Ledger Entries</h3>
                    <p className="text-sm text-gray-500 font-medium mt-1">Latest automated invoices and transactions.</p>
                  </div>
                  <Link href="/dashboard/billing" className="inline-flex h-10 items-center justify-center rounded-xl border border-gray-200 bg-[#ffffff] px-4 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all shrink-0">
                    View Full Ledger
                  </Link>
                </div>
                
                <div className="relative w-full overflow-x-auto flex-1">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-400 font-black">
                        <th className="h-12 px-6 pl-8 align-middle">Tenant / Entity</th>
                        <th className="h-12 px-6 align-middle">Date Issued</th>
                        <th className="h-12 px-6 text-right align-middle">Amount</th>
                        <th className="h-12 px-6 pr-8 text-center align-middle">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {_.isEmpty(recentInvoices) ? (
                        <tr>
                          <td colSpan={4} className="p-12 text-center text-sm font-medium text-gray-500">No recent transactions recorded in the ledger.</td>
                        </tr>
                      ) : (
                        _.map(recentInvoices, (inv) => (
                          <tr key={inv.id} className="hover:bg-gray-50/80 transition duration-150 group">
                            <td className="p-4 px-6 pl-8 align-middle">
                              <div className="flex items-center gap-3.5">
                                <div className="w-10 h-10 rounded-full bg-[#ebf3f5] text-[#1f8898] flex items-center justify-center font-black text-xs shrink-0">
                                  {inv.tenant?.first_name?.charAt(0) || 'U'}{inv.tenant?.last_name?.charAt(0) || 'N'}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-bold text-gray-900 group-hover:text-[#1f8898] transition-colors">{inv.tenant?.first_name} {inv.tenant?.last_name}</span>
                                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">{inv.description}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 px-6 align-middle">
                              <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                {new Date(inv.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </div>
                            </td>
                            <td className="p-4 px-6 text-right align-middle font-black text-gray-900 text-base">
                              KSH {inv.amount.toLocaleString()}
                            </td>
                            <td className="p-4 px-6 pr-8 text-center align-middle">
                              <div className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest border ${
                                inv.status === 'PAID' 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                  : inv.status === 'PARTIAL'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}>
                                {inv.status === 'PAID' && <CheckCircle2 className="w-3 h-3" />}
                                {inv.status === 'PARTIAL' && <AlertCircle className="w-3 h-3" />}
                                {inv.status}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* --- NEW: LIVE M-PESA FEED WIDGET --- */}
              <div className="xl:col-span-1 bg-[#ffffff] rounded-3xl shadow-sm border border-gray-100 flex flex-col max-h-[450px]">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-gray-900 tracking-tight">Live M-Pesa Feed</h3>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Webhook Connections</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 flex-1 overflow-y-auto space-y-3 custom-scrollbar bg-gray-50/30">
                  {_.isEmpty(data.mpesaLogs) ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                      <Smartphone className="w-8 h-8 text-gray-300 mb-3" />
                      <p className="text-sm font-bold text-gray-900">Waiting for payments...</p>
                      <p className="text-xs text-gray-500 font-medium mt-1">Tenant STK pushes will appear here instantly.</p>
                    </div>
                  ) : (
                    data.mpesaLogs.map((log: any) => (
                      <div key={log.id} className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-[#1f8898]/30 transition-colors">
                        <div className="flex items-center gap-3.5">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600' :
                            log.status === 'FAILED' ? 'bg-rose-50 text-rose-600' :
                            'bg-amber-50 text-amber-600'
                          }`}>
                            {log.status === 'SUCCESS' ? <CheckCircle2 className="w-5 h-5" /> :
                             log.status === 'FAILED' ? <XCircle className="w-5 h-5" /> :
                             <Activity className="w-5 h-5 animate-pulse" />}
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900 tracking-tight">{maskPhone(log.phone_number)}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                              {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-gray-900">KSH {log.amount?.toLocaleString() || '---'}</p>
                          <span className={`text-[9px] font-black uppercase tracking-widest ${
                            log.status === 'SUCCESS' ? 'text-emerald-600' :
                            log.status === 'FAILED' ? 'text-rose-600' :
                            'text-amber-600'
                          }`}>
                            {log.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </>
        )}
      </main>
    </div>
  );
}