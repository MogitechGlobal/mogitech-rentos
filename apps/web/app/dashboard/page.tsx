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
  FileText, Smartphone, XCircle, PiggyBank, Receipt, PieChart,
  AlertTriangle, CalendarClock, Megaphone, Wrench // <-- Added Wrench
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
    mpesaLogs: [] as any[],
    maintenance: [] as any[] // <-- Added maintenance state
  });

  useEffect(() => {
    const fetchAllData = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return router.push('/login');

      try {
        const headers = { 'Authorization': `Bearer ${token}` };

        const [profileRes, propsRes, tenantsRes, invsRes, mpesaRes, maintRes] = await Promise.all([
          fetch('${process.env.NEXT_PUBLIC_API_URL}/landlords/profile', { headers }),
          fetch('${process.env.NEXT_PUBLIC_API_URL}/properties', { headers }),
          fetch('${process.env.NEXT_PUBLIC_API_URL}/tenants', { headers }),
          fetch('${process.env.NEXT_PUBLIC_API_URL}/invoices', { headers }),
          fetch('${process.env.NEXT_PUBLIC_API_URL}/mpesa/logs', { headers }),
          fetch('${process.env.NEXT_PUBLIC_API_URL}/tickets', { headers }).catch(() => ({ ok: false }))]);

        if (!propsRes.ok || !tenantsRes.ok || !invsRes.ok || !profileRes.ok) {
          throw new Error('Failed to load dashboard data. Please check your connection.');
        }

        setData({
          profile: await profileRes.json(),
          properties: await propsRes.json(),
          tenants: await tenantsRes.json(),
          invoices: await invsRes.json(),
          mpesaLogs: mpesaRes.ok ? await mpesaRes.json() : [],
          maintenance: maintRes.ok ? await (maintRes as any).json() : []
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, [router]);

  // --- Advanced Analytics & Data Processing ---
  const totalProperties = _.size(data.properties);
  const activeTenants = _.size(_.filter(data.tenants, { is_active: true }));
  const totalUnits = _.sumBy(data.properties, (p) => _.size(p.units));
  const occupancyRate = totalUnits === 0 ? 0 : Math.round((activeTenants / totalUnits) * 100);

  const allPayments = _.flatMap(data.invoices, (inv) => inv.payments || []);

  const totalBilled = _.sumBy(data.invoices, 'amount') || 0;
  const totalCollected = _.sumBy(allPayments, 'amount_paid') || 0;
  const totalOutstanding = totalBilled - totalCollected;
  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

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

  // --- ACTION CENTER ANALYTICS ---

  // 1. Top Defaulters
  const topDefaulters = _.chain(data.invoices)
    .filter(inv => inv.status !== 'PAID')
    .groupBy('tenant_id')
    .map((invoices, tenant_id) => {
      const tenant = _.find(data.tenants, { id: tenant_id });
      const totalOwed = _.sumBy(invoices, 'amount');
      const totalPaidForThese = _.sumBy(invoices, inv => _.sumBy(inv.payments, 'amount_paid') || 0);
      const balance = totalOwed - totalPaidForThese;
      return { tenant, balance };
    })
    .filter(t => t.balance > 0 && !!t.tenant)
    .orderBy(['balance'], ['desc'])
    .take(4)
    .value();

  // 2. Expiring Leases
  const sixtyDaysFromNow = new Date();
  sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);

  const expiringLeases = _.chain(data.tenants)
    .filter(t => {
      if (!t.is_active || !t.lease_end) return false;
      const endDate = new Date(t.lease_end);
      return endDate <= sixtyDaysFromNow && endDate >= new Date();
    })
    .map(t => {
      const daysLeft = Math.ceil((new Date(t.lease_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return { ...t, daysLeft };
    })
    .orderBy(['daysLeft'], ['asc'])
    .take(4)
    .value();

  // 3. Active Maintenance Tickets (Prioritized by Urgency)
  const urgencyWeight = { 'EMERGENCY': 1, 'HIGH': 2, 'MEDIUM': 3, 'LOW': 4 };
  const activeTickets = _.chain(data.maintenance)
    .filter(t => t.status !== 'RESOLVED')
    .orderBy([(t) => (urgencyWeight as any)[t.urgency] || 5, 'created_at'], ['asc', 'desc'])
    .take(4)
    .value();

  // Helper to resolve a unit_id to a Property/Unit name
  const resolveUnitName = (unitId: string) => {
    for (const prop of data.properties) {
      const unit = _.find(prop.units, { id: unitId });
      if (unit) return `${prop.name}, ${unit.unit_number}`;
    }
    return 'Unknown Unit';
  };

  const getUrgencyColors = (urgency: string) => {
    if (urgency === 'EMERGENCY') return 'bg-rose-100 text-rose-700 border-rose-200';
    if (urgency === 'HIGH') return 'bg-amber-100 text-amber-700 border-amber-200';
    if (urgency === 'MEDIUM') return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  // --- END ACTION CENTER ANALYTICS ---

  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const currentDateString = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  let userFirstName = 'Executive';
  const p = data.profile;
  if (p?.user?.first_name) userFirstName = p.user.first_name;
  else if (p?.first_name) userFirstName = p.first_name;
  else if (p?.user?.email || p?.email) {
    const emailPrefix = (p?.user?.email || p?.email).split('@')[0];
    userFirstName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
  }

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

      {/* --- Executive Gradient Hero Area --- */}
      <div className="bg-gradient-to-br from-[#0d393f] to-[#1f8898] px-6 pt-8 pb-16 relative overflow-hidden shadow-inner">
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
              Here is the real-time financial and operational status of your property portfolio.
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
            <p className="font-bold text-sm uppercase tracking-widest text-gray-400">Loading Analytics...</p>
          </div>
        ) : (
          <>
            {/* --- TOP BENTO BOX: Lifetime Financials & Operations --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-5">

              {/* 1. OUTSTANDING ARREARS */}
              <div className={`p-5 xl:p-4 2xl:p-6 rounded-3xl shadow-sm border flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden ${totalOutstanding > 0 ? 'bg-gradient-to-br from-white to-rose-50 border-rose-100' : 'bg-[#ffffff] border-gray-100'
                }`}>
                <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl pointer-events-none ${totalOutstanding > 0 ? 'bg-rose-200 opacity-50' : 'bg-gray-100 opacity-0'}`}></div>
                <div className="flex flex-row items-center justify-between mb-2 relative z-10">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${totalOutstanding > 0 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest text-right leading-tight ${totalOutstanding > 0 ? 'text-rose-600' : 'text-gray-400'}`}>Outstanding<br />Arrears</span>
                </div>
                <div className="relative z-10 mt-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs font-black text-gray-400">KSH</span>
                    <span className={`text-2xl xl:text-xl 2xl:text-3xl font-black tracking-tight truncate ${totalOutstanding > 0 ? 'text-rose-600' : 'text-gray-900'}`}>
                      {totalOutstanding.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-2 truncate">Unpaid Balance</p>
                </div>
              </div>

              {/* 2. TOTAL COLLECTED */}
              <div className={cardClass}>
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl pointer-events-none"></div>
                <div className="flex flex-row items-center justify-between mb-2 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
                    <PiggyBank className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 text-right leading-tight">Total<br />Collected</span>
                </div>
                <div className="relative z-10 mt-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs font-black text-gray-400">KSH</span>
                    <span className="text-2xl xl:text-xl 2xl:text-3xl font-black text-gray-900 tracking-tight truncate">
                      {totalCollected.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5 truncate">
                    <span className={`flex items-center text-[10px] font-black px-1.5 py-0.5 rounded-md ${revenueTrend >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {revenueTrend >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                      {Math.abs(revenueTrend)}%
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider truncate">MTD Velocity</span>
                  </div>
                </div>
              </div>

              {/* 3. TOTAL BILLED */}
              <div className={cardClass}>
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full blur-2xl pointer-events-none"></div>
                <div className="flex flex-row items-center justify-between mb-2 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 text-right leading-tight">Lifetime<br />Billed</span>
                </div>
                <div className="relative z-10 mt-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs font-black text-gray-400">KSH</span>
                    <span className="text-2xl xl:text-xl 2xl:text-3xl font-black text-gray-900 tracking-tight truncate">
                      {totalBilled.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-2 flex items-center gap-1">
                    <PieChart className="w-3 h-3" /> {data.invoices.length} Invoices
                  </p>
                </div>
              </div>

              {/* 4. COLLECTION HEALTH */}
              <div className={cardClass}>
                <div className="flex flex-row items-center justify-between mb-2 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100 shrink-0">
                    <Activity className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 text-right leading-tight">Collection<br />Health</span>
                </div>
                <div className="relative z-10 mt-2">
                  <div className="flex items-end justify-between mb-1.5">
                    <span className="text-2xl xl:text-xl 2xl:text-3xl font-black text-gray-900 tracking-tight leading-none">{collectionRate}%</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Clearance</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mt-2">
                    <div className={`h-full rounded-full ${collectionRate > 80 ? 'bg-emerald-500' : collectionRate > 50 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${collectionRate}%` }}></div>
                  </div>
                </div>
              </div>

              {/* 5. OCCUPANCY RATE */}
              <div className={cardClass.replace('flex-col justify-between', 'flex-row items-center justify-between')}>
                <div className="flex flex-col min-w-0 pr-2">
                  <div className="flex items-center gap-1.5 mb-2">
                    <DoorOpen className="w-4 h-4 text-[#1f8898]" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[#1f8898]">Occupancy</h3>
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

            </div>

            {/* --- NEW SECTION: ACTION CENTER (Alerts & Risks) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

              {/* 1. Top Defaulters Widget */}
              <div className="bg-[#ffffff] rounded-3xl shadow-sm border border-rose-100 flex flex-col overflow-hidden">
                <div className="p-5 md:p-6 border-b border-rose-50 bg-rose-50/30 flex items-center justify-between shrink-0">
                  <div>
                    <h3 className="text-base font-black text-rose-900 tracking-tight flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-rose-500" /> Top Defaulters
                    </h3>
                    <p className="text-[10px] text-rose-600 font-bold uppercase tracking-wider mt-0.5">Highest balances</p>
                  </div>
                  <span className="bg-rose-100 text-rose-700 px-2.5 py-1 rounded-lg text-[10px] font-black shrink-0">{topDefaulters.length} Found</span>
                </div>

                <div className="p-2 flex-1 overflow-y-auto">
                  {_.isEmpty(topDefaulters) ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                      <CheckCircle2 className="w-8 h-8 text-emerald-300 mb-2" />
                      <p className="text-sm font-bold text-gray-900">Zero Arrears</p>
                      <p className="text-xs text-gray-500">All tenants are caught up.</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {_.map(topDefaulters, ({ tenant, balance }, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 rounded-2xl hover:bg-rose-50/50 transition-colors group">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center font-black text-xs text-gray-500">
                              {tenant.first_name.charAt(0)}{tenant.last_name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-black text-gray-900 group-hover:text-rose-700 transition-colors truncate max-w-[120px]">{tenant.first_name} {tenant.last_name}</p>
                              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">{tenant.phone || 'No Phone'}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-black text-rose-600">KSH {balance.toLocaleString()}</p>
                            <Link href={`/dashboard/communications`} className="mt-1 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-[#1f8898] hover:text-[#135a65]">
                              <Megaphone className="w-3 h-3" /> Remind
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Expiring Leases Widget */}
              <div className="bg-[#ffffff] rounded-3xl shadow-sm border border-amber-100 flex flex-col overflow-hidden">
                <div className="p-5 md:p-6 border-b border-amber-50 bg-amber-50/30 flex items-center justify-between shrink-0">
                  <div>
                    <h3 className="text-base font-black text-amber-900 tracking-tight flex items-center gap-2">
                      <CalendarClock className="w-5 h-5 text-amber-500" /> Renewals
                    </h3>
                    <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider mt-0.5">Expiring &lt; 60 days</p>
                  </div>
                  <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg text-[10px] font-black shrink-0">{expiringLeases.length} Soon</span>
                </div>

                <div className="p-2 flex-1 overflow-y-auto">
                  {_.isEmpty(expiringLeases) ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                      <CheckCircle2 className="w-8 h-8 text-emerald-300 mb-2" />
                      <p className="text-sm font-bold text-gray-900">Pipeline Clear</p>
                      <p className="text-xs text-gray-500">No leases ending soon.</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {_.map(expiringLeases, (tenant, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 rounded-2xl hover:bg-amber-50/50 transition-colors group">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center font-black text-xs text-gray-500">
                              {tenant.first_name.charAt(0)}{tenant.last_name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-black text-gray-900 group-hover:text-amber-700 transition-colors truncate max-w-[120px]">{tenant.first_name} {tenant.last_name}</p>
                              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">
                                Ends: {new Date(tenant.lease_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="inline-flex items-center justify-center px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[9px] font-black uppercase tracking-widest border border-amber-200">
                              {tenant.daysLeft} Days
                            </div>
                            <div className="mt-1">
                              <Link href={`/dashboard/tenants`} className="text-[9px] font-black uppercase tracking-widest text-[#1f8898] hover:text-[#135a65]">
                                View Lease
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Active Maintenance Widget */}
              <div className="bg-[#ffffff] rounded-3xl shadow-sm border border-blue-100 flex flex-col overflow-hidden">
                <div className="p-5 md:p-6 border-b border-blue-50 bg-blue-50/30 flex items-center justify-between shrink-0">
                  <div>
                    <h3 className="text-base font-black text-blue-900 tracking-tight flex items-center gap-2">
                      <Wrench className="w-5 h-5 text-blue-500" /> Pending Fixes
                    </h3>
                    <p className="text-[10px] text-blue-700 font-bold uppercase tracking-wider mt-0.5">Unresolved tickets</p>
                  </div>
                  <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg text-[10px] font-black shrink-0">{activeTickets.length} Open</span>
                </div>

                <div className="p-2 flex-1 overflow-y-auto">
                  {_.isEmpty(activeTickets) ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                      <CheckCircle2 className="w-8 h-8 text-emerald-300 mb-2" />
                      <p className="text-sm font-bold text-gray-900">All Clear</p>
                      <p className="text-xs text-gray-500">No active maintenance issues.</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {_.map(activeTickets, (ticket, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 rounded-2xl hover:bg-blue-50/50 transition-colors group border border-transparent hover:border-blue-100">
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${ticket.urgency === 'EMERGENCY' ? 'bg-rose-500 animate-pulse' : ticket.urgency === 'HIGH' ? 'bg-amber-500' : 'bg-blue-400'}`}></div>
                            <div>
                              <p className="text-sm font-black text-gray-900 tracking-tight">{ticket.issue_type}</p>
                              <p className="text-[10px] font-bold text-gray-500 mt-0.5 truncate max-w-[120px]">{resolveUnitName(ticket.unit_id)}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${getUrgencyColors(ticket.urgency)}`}>
                              {ticket.urgency}
                            </span>
                            <div className="mt-1">
                              <Link href={`/dashboard/maintenance`} className="text-[9px] font-black uppercase tracking-widest text-[#1f8898] hover:text-[#135a65]">
                                Resolve
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* --- Middle Section: Analytics & Lists --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

              {/* Premium Area Chart */}
              <div className="lg:col-span-2 bg-[#ffffff] rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                <div className="p-6 md:p-8 pb-4 flex items-center justify-between z-10 relative">
                  <div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Collection Trajectory</h3>
                    <p className="text-sm text-gray-500 font-medium mt-1">Realized income over the last 6 months</p>
                  </div>
                  <div className="inline-flex items-center rounded-full border border-emerald-200 px-3 py-1 text-[10px] uppercase tracking-widest font-black bg-emerald-50 text-emerald-600">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></div> Live Data
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
                <div className="p-6 md:p-8 pb-4 border-b border-gray-100 shrink-0 flex items-center justify-between">
                  <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#1f8898]" /> Active Portfolio
                  </h3>
                  <span className="bg-[#ebf3f5] text-[#1f8898] px-2.5 py-1 rounded-lg text-[10px] font-black">{totalProperties}</span>
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
                              <div className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest border ${inv.status === 'PAID'
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

              {/* --- LIVE M-PESA FEED WIDGET --- */}
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
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600' :
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
                          <span className={`text-[9px] font-black uppercase tracking-widest ${log.status === 'SUCCESS' ? 'text-emerald-600' :
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