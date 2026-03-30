// apps/web/app/dashboard/reports/page.tsx
/* eslint-disable */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Download, AlertTriangle, Building2, CheckCircle2, 
  TrendingUp, Wallet, AlertCircle, PieChart, Layers, 
  Loader2, Clock
} from 'lucide-react';

export default function ReportsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [data, setData] = useState({
    properties: [] as any[],
    tenants: [] as any[],
    invoices: [] as any[]
  });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const reqOptions = { credentials: 'include' as RequestCredentials };
        
        const [propsRes, tenantsRes, invsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties`, reqOptions),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants`, reqOptions),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices`, reqOptions)
        ]);

        // Security Check: Kick unauthenticated users back to login
        if (propsRes.status === 401 || tenantsRes.status === 401 || invsRes.status === 401) {
          return router.push('/login');
        }

        if (!propsRes.ok || !tenantsRes.ok || !invsRes.ok) {
          throw new Error('Failed to load report data');
        }

        setData({
          properties: await propsRes.json(),
          tenants: await tenantsRes.json(),
          invoices: await invsRes.json()
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [router]);

  // --- Global Analytics Calculations (Corrected for Partial Payments) ---
  
  // Flatten all payments across all invoices
  const allPayments = data.invoices.flatMap(inv => inv.payments || []);

  const globalTotalRevenue = allPayments.reduce((sum, p) => sum + Number(p.amount_paid), 0);
  const globalTotalBilled = data.invoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
  const globalTotalArrears = globalTotalBilled - globalTotalRevenue;

  // Process invoices to calculate exact remaining balances for the Arrears Table
  const arrearsInvoices = data.invoices
    .map(inv => {
      const amountPaid = (inv.payments || []).reduce((sum: number, p: any) => sum + Number(p.amount_paid), 0);
      const balance = Number(inv.amount) - amountPaid;
      return { ...inv, balance };
    })
    .filter(inv => inv.balance > 0)
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

  const totalPortfolioUnits = data.properties.reduce((sum, p) => sum + (p.units?.length || 0), 0);
  const totalOccupiedUnits = data.properties.reduce((sum, p) => sum + (p.units?.filter((u: any) => u.status === 'OCCUPIED').length || 0), 0);
  const globalOccupancyRate = totalPortfolioUnits === 0 ? 0 : Math.round((totalOccupiedUnits / totalPortfolioUnits) * 100);

  // --- Property Performance Breakdown (Corrected) ---
  const propertyPerformance = data.properties.map(property => {
    const totalUnits = property.units?.length || 0;
    const occupiedUnits = property.units?.filter((u: any) => u.status === 'OCCUPIED').length || 0;
    const occupancyRate = totalUnits === 0 ? 0 : Math.round((occupiedUnits / totalUnits) * 100);
    
    // Find all invoices linked to this specific property
    const propertyInvoices = data.invoices.filter(inv => 
      inv.tenant?.unit?.property_id === property.id
    );
    
    const propertyTotalBilled = propertyInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
    const propertyPayments = propertyInvoices.flatMap(inv => inv.payments || []);
    
    const revenueCollected = propertyPayments.reduce((sum, p) => sum + Number(p.amount_paid), 0);
    const outstandingDues = propertyTotalBilled - revenueCollected;

    return { ...property, totalUnits, occupiedUnits, occupancyRate, revenueCollected, outstandingDues };
  });

  // --- Master Export Function ---
  const handleExportMasterReport = () => {
    const headers = ['Property', 'Unit', 'Tenant Name', 'Invoice Desc', 'Due Date', 'Total Billed (KSH)', 'Remaining Balance (KSH)', 'Status'];
    const rows = data.invoices.map(inv => {
      const amountPaid = (inv.payments || []).reduce((sum: number, p: any) => sum + Number(p.amount_paid), 0);
      const balance = Number(inv.amount) - amountPaid;
      return [
        inv.tenant?.unit?.property?.name || 'Unknown',
        inv.tenant?.unit?.unit_number || 'Unknown',
        `${inv.tenant?.first_name} ${inv.tenant?.last_name}`,
        inv.description,
        new Date(inv.due_date).toLocaleDateString(),
        inv.amount,
        balance,
        inv.status
      ];
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MogiRentOS_Master_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8fafb]">
      <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
      <h2 className="text-xl font-black text-gray-900">Report Generation Failed</h2>
      <p className="text-gray-500 mt-2">{error}</p>
      <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2.5 bg-[#1f8898] text-white font-bold rounded-xl shadow-lg hover:bg-[#1a7684] transition-all">Retry Generation</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans text-gray-900 selection:bg-[#1f8898]/30 overflow-x-hidden">
      
      {/* --- Premium Gradient Hero Area --- */}
      <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-6 pt-8 pb-14 md:pt-10 md:pb-16 relative overflow-hidden shadow-inner">
        <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-100 text-[10px] font-black uppercase tracking-widest mb-3 border border-white/20 backdrop-blur-sm">
                <PieChart className="w-3.5 h-3.5" /> Financial Intelligence
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[#ffffff] tracking-tight mb-2">
              Reports & Analytics
            </h1>
            <p className="text-teal-100 text-sm md:text-base font-medium max-w-xl leading-relaxed">
              Comprehensive breakdown of your portfolio's performance, arrears exposure, and realized revenue.
            </p>
          </div>

          <div className="flex mt-2 md:mt-0">
            <button 
              onClick={handleExportMasterReport} 
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-2.5 rounded-xl font-bold text-sm backdrop-blur-md transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
            >
              <Download className="w-4 h-4" /> Export Master CSV
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 md:-mt-10 relative z-20 space-y-6 md:space-y-8">
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-3xl shadow-lg border border-gray-100">
            <Loader2 className="w-10 h-10 animate-spin text-[#1f8898] mb-4" /> 
            <p className="font-bold text-sm uppercase tracking-widest text-gray-400">Compiling Reports...</p>
          </div>
        ) : (
          <>
            {/* --- Bento Box Global KPI Grid --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              
              <div className="bg-[#ffffff] p-5 md:p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl pointer-events-none"></div>
                <div className="flex flex-row items-center justify-between mb-4 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 text-right leading-tight">Realized<br/>Revenue</span>
                </div>
                <div className="relative z-10 mt-1">
                  <div className="text-2xl xl:text-xl 2xl:text-3xl font-black text-gray-900 tracking-tight truncate">KSH {globalTotalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-gray-500 font-medium mt-1.5 truncate">Total collected payments</p>
                </div>
              </div>

              <div className="bg-[#ffffff] p-5 md:p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 rounded-full blur-2xl pointer-events-none"></div>
                <div className="flex flex-row items-center justify-between mb-4 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 text-right leading-tight">Global<br/>Arrears</span>
                </div>
                <div className="relative z-10 mt-1">
                  <div className="text-2xl xl:text-xl 2xl:text-3xl font-black text-gray-900 tracking-tight truncate">KSH {globalTotalArrears.toLocaleString()}</div>
                  <p className="text-xs text-gray-500 font-medium mt-1.5 truncate">Total unpaid exposure</p>
                </div>
              </div>

              <div className="bg-[#ffffff] p-5 md:p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-row items-center justify-between group hover:-translate-y-1 transition-all">
                <div className="flex flex-col min-w-0 pr-2">
                  <div className="flex items-center gap-1.5 mb-2">
                     <PieChart className="w-4 h-4 text-gray-400" />
                     <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Portfolio Occupancy</h3>
                  </div>
                  <div className="text-2xl xl:text-xl 2xl:text-3xl font-black text-gray-900 tracking-tight truncate">{globalOccupancyRate}%</div>
                  <p className="text-[11px] text-gray-500 font-medium mt-1 truncate">Overall Utilization</p>
                </div>
                <div className="relative w-14 h-14 2xl:w-16 2xl:h-16 flex-shrink-0 drop-shadow-sm">
                  <svg className="w-full h-full transform -rotate-90 drop-shadow-sm" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f3f4f6" strokeWidth="4.5"></circle>
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#1f8898" strokeWidth="4.5" 
                      strokeDasharray={`${globalOccupancyRate}, ${100 - globalOccupancyRate}`} strokeDashoffset="0" strokeLinecap="round">
                    </circle>
                  </svg>
                </div>
              </div>

              <div className="bg-[#ffffff] p-5 md:p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full blur-2xl pointer-events-none"></div>
                <div className="flex flex-row items-center justify-between mb-4 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                    <Layers className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 text-right leading-tight">Total<br/>Inventory</span>
                </div>
                <div className="relative z-10 mt-1">
                  <div className="text-2xl xl:text-xl 2xl:text-3xl font-black text-gray-900 tracking-tight truncate">{totalPortfolioUnits}</div>
                  <p className="text-xs text-gray-500 font-medium mt-1.5 truncate">Managed units across {data.properties.length} properties</p>
                </div>
              </div>

            </div>

            {/* --- Arrears / Risk Section --- */}
            <div className="bg-[#ffffff] rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              <div className="px-6 md:px-8 py-6 border-b border-rose-100 bg-rose-50/30 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center shrink-0 border border-rose-200 shadow-sm">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Outstanding Arrears</h3>
                    <p className="text-sm text-gray-500 font-medium mt-1">Tenants with unpaid or partial balances requiring attention.</p>
                  </div>
                </div>
                <div className="text-left sm:text-right bg-white px-5 py-3 rounded-2xl border border-rose-100 shadow-sm shrink-0">
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Total at Risk</p>
                  <p className="text-2xl font-black text-rose-600 tracking-tight">KSH {globalTotalArrears.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-[#ffffff] text-[10px] uppercase tracking-widest text-gray-400 font-black border-b border-gray-100">
                      <th className="px-6 md:px-8 py-4">Tenant / Unit</th>
                      <th className="px-6 md:px-8 py-4">Invoice Details</th>
                      <th className="px-6 md:px-8 py-4 text-center">Due Date</th>
                      <th className="px-6 md:px-8 py-4 text-right">Balance Owed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {arrearsInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-8 py-16 text-center">
                          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600 border border-emerald-100">
                            <CheckCircle2 className="w-8 h-8" />
                          </div>
                          <h3 className="text-xl font-black text-gray-900 mb-1">Zero Arrears!</h3>
                          <p className="text-sm text-gray-500 font-medium">All tenant accounts are fully settled and up to date.</p>
                        </td>
                      </tr>
                    ) : (
                      arrearsInvoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-rose-50/30 transition duration-150 group">
                          <td className="px-6 md:px-8 py-5">
                            <p className="font-bold text-gray-900 group-hover:text-rose-700 transition-colors text-base">{inv.tenant?.first_name} {inv.tenant?.last_name}</p>
                            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mt-1">
                              <Building2 className="w-3 h-3 inline mr-1 text-gray-400" />
                              {inv.tenant?.unit?.property?.name} • Unit {inv.tenant?.unit?.unit_number}
                            </p>
                          </td>
                          <td className="px-6 md:px-8 py-5 text-sm text-gray-600 font-bold">{inv.description}</td>
                          <td className="px-6 md:px-8 py-5 text-center">
                            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100">
                               <Clock className="w-3.5 h-3.5" />
                               {new Date(inv.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </td>
                          <td className="px-6 md:px-8 py-5 font-black text-rose-600 text-right text-lg">
                            KSH {inv.balance.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* --- Property Performance Section --- */}
            <div className="bg-[#ffffff] rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 md:px-8 py-6 border-b border-gray-100 bg-[#f8fafb]/50 flex justify-between items-center">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 bg-[#ebf3f5] text-[#1f8898] rounded-xl flex items-center justify-center shrink-0 border border-[#1f8898]/10 shadow-sm">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Property Performance</h3>
                    <p className="text-sm text-gray-500 font-medium mt-1">Revenue, capacity, and delinquency metrics per building.</p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-[#ffffff] text-[10px] uppercase tracking-widest text-gray-400 font-black border-b border-gray-100">
                      <th className="px-6 md:px-8 py-4">Property Identity</th>
                      <th className="px-6 md:px-8 py-4 min-w-[250px]">Occupancy Rate</th>
                      <th className="px-6 md:px-8 py-4 text-right">Revenue Collected</th>
                      <th className="px-6 md:px-8 py-4 text-right pr-8">Outstanding Dues</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {propertyPerformance.length === 0 ? (
                       <tr>
                         <td colSpan={4} className="px-8 py-16 text-center">
                           <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-400 border border-gray-100">
                              <Building2 className="w-8 h-8" />
                           </div>
                           <h3 className="text-lg font-bold text-gray-900 mb-1">No Properties Found</h3>
                           <p className="text-sm text-gray-500 font-medium">Add a property to start tracking performance metrics.</p>
                         </td>
                       </tr>
                    ) : (
                      propertyPerformance.map((prop) => (
                        <tr key={prop.id} className="hover:bg-[#ebf3f5]/30 transition duration-150 group">
                          <td className="px-6 md:px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-[#ffffff] shadow-sm flex items-center justify-center text-[#1f8898] border border-gray-200 group-hover:border-[#1f8898]/30 transition-all shrink-0">
                                <Building2 className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 group-hover:text-[#1f8898] transition-colors text-base tracking-tight">{prop.name}</p>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">{prop.type}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 md:px-8 py-5">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-sm font-black text-gray-900 w-10">{prop.occupancyRate}%</span>
                                <div className="flex-1 max-w-[150px] bg-gray-100 rounded-full h-2.5 overflow-hidden border border-gray-200/50">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${prop.occupancyRate > 80 ? 'bg-gradient-to-r from-[#1f8898] to-[#146a77]' : prop.occupancyRate > 50 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-rose-500 to-rose-600'}`} 
                                    style={{ width: `${prop.occupancyRate}%` }}
                                  ></div>
                                </div>
                              </div>
                              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">{prop.occupiedUnits} of {prop.totalUnits} Units Leased</p>
                            </div>
                          </td>
                          <td className="px-6 md:px-8 py-5 font-black text-[#1f8898] text-right text-lg">
                            KSH {prop.revenueCollected.toLocaleString()}
                          </td>
                          <td className="px-6 md:px-8 py-5 font-bold text-right pr-8">
                            {prop.outstandingDues > 0 ? (
                              <span className="inline-flex items-center gap-1.5 text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100 text-sm font-black tracking-tight">
                                <AlertCircle className="w-3.5 h-3.5" />
                                KSH {prop.outstandingDues.toLocaleString()}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 text-xs font-bold tracking-widest uppercase">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Zero Dues
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </>
        )}
      </main>
    </div>
  );
}