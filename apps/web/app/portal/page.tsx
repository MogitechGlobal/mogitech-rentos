// apps/web/app/portal/page.tsx
/* eslint-disable */
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Wallet, Building2, Calendar, CheckCircle2, 
  Loader2, PlusCircle, Wrench, 
  History, AlertCircle, CreditCard, 
  ShieldCheck, Clock, Download, ArrowRight,
  Smartphone, Landmark, ThumbsUp, LogOut, 
  FileWarning, X, PiggyBank, Receipt, PieChart, Activity
} from 'lucide-react';

export default function TenantPortalHome() {
  const router = useRouter();
  const [leaseData, setLeaseData] = useState<any>(null);
  const [maintenanceData, setMaintenanceData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Advanced UI States
  const [ledgerTab, setLedgerTab] = useState<'pending' | 'history'>('pending');
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [isSubmittingNotice, setIsSubmittingNotice] = useState(false);
  const [noticeData, setNoticeData] = useState({ moveOutDate: '', reason: '' });

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return router.push('/login');

      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        
        const [leaseRes, maintRes] = await Promise.all([
          fetch('${process.env.NEXT_PUBLIC_API_URL}/portal/my-lease', { headers }),
          fetch('${process.env.NEXT_PUBLIC_API_URL}/portal/maintenance', { headers })
        ]);

        if (!leaseRes.ok) throw new Error('Failed to load lease details');
        
        const leaseJson = await leaseRes.json();
        const maintJson = maintRes.ok ? await maintRes.json() : [];

        setLeaseData(leaseJson);
        setMaintenanceData(maintJson);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [router]);

  const handleNoticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingNotice(true);
    const token = localStorage.getItem('access_token');

    try {
        const res = await fetch('${process.env.NEXT_PUBLIC_API_URL}/portal/lease/notice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(noticeData)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to submit notice.');

        alert(data.message || 'Notice to vacate submitted successfully.');
        setIsNoticeModalOpen(false);
        setNoticeData({ moveOutDate: '', reason: '' });
    } catch (err: any) {
        alert(err.message);
    } finally {
        setIsSubmittingNotice(false);
    }
  };

  // --- ADVANCED ANALYTICS DERIVATION ---
  const { outstandingBalance = 0, unit, lease_end, first_name, invoices = [] } = leaseData || {};
  
  const analytics = useMemo(() => {
    if (!leaseData) return { totalBilled: 0, totalPaid: 0, paymentRate: 0, pendingInvoices: [], recentPayments: [], daysLeft: 0, progressPercentage: 0 };

    const totalBilled = invoices.reduce((sum: number, inv: any) => sum + inv.amount, 0);
    const totalPaid = invoices.reduce((sum: number, inv: any) => {
        const paidForInvoice = inv.payments?.reduce((pSum: number, p: any) => pSum + p.amount_paid, 0) || 0;
        return sum + paidForInvoice;
    }, 0);
    
    const paymentRate = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0;
    const pendingInvoices = invoices.filter((inv: any) => inv.status !== 'PAID').sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
    
    const recentPayments = invoices
        .flatMap((inv: any) => (inv.payments || []).map((p: any) => ({ ...p, invoice_description: inv.description })))
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);

    const daysLeft = Math.ceil((new Date(lease_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const progressPercentage = Math.max(0, Math.min(100, 100 - (daysLeft / 365) * 100));

    return { totalBilled, totalPaid, paymentRate, pendingInvoices, recentPayments, daysLeft, progressPercentage };
  }, [leaseData, invoices, lease_end]);

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#f8fafb]">
        <div className="relative">
            <Loader2 className="w-12 h-12 animate-spin text-[#1f8898]" />
            <div className="absolute inset-0 blur-xl bg-[#1f8898]/20 animate-pulse"></div>
        </div>
        <p className="text-sm font-bold text-gray-500 mt-4 tracking-tight uppercase tracking-widest">Authenticating your portal...</p>
      </div>
    );
  }

  if (error || !leaseData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafb] p-6">
        <div className="max-w-md w-full p-8 bg-white border border-rose-100 shadow-xl shadow-rose-100/50 rounded-3xl text-center">
            <div className="bg-rose-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-rose-100">
                <AlertCircle className="text-rose-600 w-8 h-8" />
            </div>
            <h2 className="text-gray-900 font-black text-2xl mb-2 tracking-tight">Connection Error</h2>
            <p className="text-gray-500 font-medium mb-8">{error}</p>
            <button onClick={() => window.location.reload()} className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-lg shadow-rose-600/20 transition-all active:scale-95">
              Retry Connection
            </button>
        </div>
      </div>
    );
  }

  const activeTickets = maintenanceData.filter(m => m.status !== 'RESOLVED');
  const latestTicket = activeTickets.length > 0 ? activeTickets[0] : null;

  // Calculate 30 days from today for the Notice date picker
  const minNoticeDate = new Date();
  minNoticeDate.setDate(minNoticeDate.getDate() + 30);
  const minDateString = minNoticeDate.toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans selection:bg-[#1f8898]/30 overflow-x-hidden">
      
      {/* --- Executive Hero Area --- */}
      <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-6 pt-10 pb-24 relative overflow-hidden shadow-inner">
        <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-teal-100 text-[10px] font-black uppercase tracking-widest mb-4 border border-white/20 backdrop-blur-sm">
                <ShieldCheck className="w-3.5 h-3.5" /> Secure Tenant Portal
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-[#ffffff] tracking-tight mb-2">
              Welcome home, {first_name}.
            </h1>
            <p className="text-teal-100 text-sm md:text-base font-medium max-w-xl">
              Manage your lease, track your financial history, and clear balances for <strong className="text-white">{unit.property.name}</strong>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Link href="/portal/documents" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-3 rounded-xl font-bold text-sm backdrop-blur-md transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm">
              <Download className="w-4 h-4" /> Lease Docs
            </Link>
            <Link href="/portal/maintenance" className="bg-[#ffffff] text-[#1f8898] hover:bg-gray-50 px-6 py-3 rounded-xl font-black text-sm transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95">
              <PlusCircle className="w-4 h-4" /> New Request
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-12 relative z-20 space-y-6">
        
        {/* --- TOP FINANCIAL METRICS GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          
          {/* 1. OUTSTANDING BALANCE (Priority) */}
          <div className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between relative overflow-hidden transition-all duration-300 group hover:-translate-y-1 ${
            outstandingBalance > 0 ? 'bg-gradient-to-br from-white to-rose-50 border-rose-100' : 'bg-gradient-to-br from-white to-emerald-50 border-emerald-100'
          }`}>
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-50 transition-opacity group-hover:opacity-70 border-none ${outstandingBalance > 0 ? 'bg-rose-200' : 'bg-emerald-200'}`}></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  outstandingBalance > 0 ? 'bg-rose-100 text-rose-600 border-rose-200' : 'bg-emerald-100 text-emerald-600 border-emerald-200'
                }`}>
                  <Wallet className="w-5 h-5" />
                </div>
                {outstandingBalance > 0 ? (
                  <span className="bg-rose-600 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest animate-pulse shadow-sm">Due</span>
                ) : (
                  <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border border-emerald-200">Cleared</span>
                )}
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Outstanding Balance</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-black text-gray-400">KSH</span>
                <span className={`text-2xl lg:text-3xl font-black tracking-tight ${outstandingBalance > 0 ? 'text-rose-600' : 'text-gray-900'}`}>
                  {outstandingBalance.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* 2. TOTAL PAID (Lifetime) */}
          <div className="bg-[#ffffff] p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 mb-4">
                  <PiggyBank className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Paid (Lifetime)</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-black text-gray-400">KSH</span>
                <span className="text-2xl lg:text-3xl font-black tracking-tight text-gray-900 group-hover:text-emerald-600 transition-colors">
                  {analytics.totalPaid.toLocaleString()}
                </span>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Payment Rate</span>
                      <span className="text-xs font-black text-emerald-600">{analytics.paymentRate}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${analytics.paymentRate}%` }}></div>
                  </div>
              </div>
            </div>
          </div>

          {/* 3. TOTAL BILLED */}
          <div className="bg-[#ffffff] p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 mb-4">
                  <Receipt className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Billed</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-black text-gray-400">KSH</span>
                <span className="text-2xl lg:text-3xl font-black tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors">
                  {analytics.totalBilled.toLocaleString()}
                </span>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                 <PieChart className="w-3.5 h-3.5 text-gray-400" />
                 <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Across {invoices.length} Invoices</span>
              </div>
            </div>
          </div>

          {/* 4. LEASE STATUS */}
          <div className="bg-[#ffffff] p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-500 border border-gray-100 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5" />
                  </div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Lease Expiry</p>
              <p className="text-2xl lg:text-3xl font-black text-gray-900 leading-tight tracking-tight">
                  {analytics.daysLeft > 0 ? `${analytics.daysLeft} ` : '0 '} 
                  <span className="text-sm text-gray-400 font-bold tracking-normal">Days</span>
              </p>
              
              <div className="mt-4 pt-3 border-t border-gray-100">
                  <button 
                    onClick={() => setIsNoticeModalOpen(true)}
                    className="w-full py-2 bg-gray-50 hover:bg-rose-50 text-gray-600 hover:text-rose-600 border border-gray-200 hover:border-rose-200 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Notice to Vacate
                  </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- LOWER BENTO BOX SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6">
          
          {/* TABBED FINANCIAL LEDGER (Left - 8 Cols) */}
          <div className="lg:col-span-8 bg-[#ffffff] border border-gray-100 rounded-3xl shadow-sm flex flex-col min-h-[450px] overflow-hidden">
              
              {/* Tab Header */}
              <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 pr-4 shrink-0">
                  <div className="flex">
                      <button 
                          onClick={() => setLedgerTab('pending')}
                          className={`px-6 py-4 text-sm font-black uppercase tracking-widest transition-all border-b-2 flex items-center gap-2
                              ${ledgerTab === 'pending' ? `border-rose-500 text-rose-600 bg-white` : 'border-transparent text-gray-400 hover:text-gray-600'}
                          `}
                      >
                          Pending Bills 
                          {analytics.pendingInvoices.length > 0 && (
                            <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full text-[10px]">{analytics.pendingInvoices.length}</span>
                          )}
                      </button>
                      <button 
                          onClick={() => setLedgerTab('history')}
                          className={`px-6 py-4 text-sm font-black uppercase tracking-widest transition-all border-b-2 flex items-center gap-2
                              ${ledgerTab === 'history' ? `border-[#1f8898] text-[#1f8898] bg-white` : 'border-transparent text-gray-400 hover:text-gray-600'}
                          `}
                      >
                          Payment History
                      </button>
                  </div>
                  <Link href="/portal/billing" className="hidden sm:flex text-[10px] font-black uppercase tracking-widest text-[#1f8898] hover:bg-[#ebf3f5] px-3 py-1.5 rounded-lg transition-colors items-center gap-1">
                    Full Ledger <ArrowRight className="w-3 h-3" />
                  </Link>
              </div>
              
              {/* Tab Content */}
              <div className="p-4 md:p-6 flex-1 overflow-y-auto custom-scrollbar bg-gray-50/30">
                  
                  {/* PENDING BILLS TAB */}
                  {ledgerTab === 'pending' && (
                    <div className="space-y-3 animate-in fade-in duration-300">
                        {analytics.pendingInvoices.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                </div>
                                <p className="text-gray-900 font-black text-lg">All Caught Up!</p>
                                <p className="text-sm font-bold text-gray-500 mt-1">You have no outstanding bills to pay.</p>
                            </div>
                        ) : (
                            analytics.pendingInvoices.map((inv: any) => (
                                <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-rose-100 bg-rose-50/30 hover:bg-white transition-all gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                                            <AlertCircle className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900 text-sm tracking-tight">{inv.description}</p>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-rose-500 mt-0.5 flex items-center gap-1">
                                              Due: {new Date(inv.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full border-t sm:border-t-0 border-rose-100 pt-3 sm:pt-0">
                                        <div className="text-left sm:text-right">
                                            <p className="font-black text-gray-900 text-lg leading-none">KSH {inv.amount.toLocaleString()}</p>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-rose-600">{inv.status}</span>
                                        </div>
                                        <Link href="/portal/billing" className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95 whitespace-nowrap">
                                            Pay Now
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                  )}

                  {/* PAYMENT HISTORY TAB */}
                  {ledgerTab === 'history' && (
                    <div className="space-y-3 animate-in fade-in duration-300">
                        {analytics.recentPayments.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                                <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm font-bold text-gray-500">No recent transactions found.</p>
                            </div>
                        ) : (
                            analytics.recentPayments.map((payment: any) => (
                                <div key={payment.id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${payment.payment_method === 'MPESA' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                                            {payment.payment_method === 'MPESA' ? <Smartphone className="w-5 h-5" /> : <Landmark className="w-5 h-5" />}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="font-bold text-gray-900 text-sm tracking-tight truncate max-w-[180px] sm:max-w-xs">{payment.invoice_description}</p>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-0.5 flex items-center gap-1">
                                              <Clock className="w-3 h-3" /> {new Date(payment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0 ml-2">
                                      <p className="font-black text-gray-900">+ KSH {payment.amount_paid.toLocaleString()}</p>
                                      <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Settled via {payment.payment_method}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                  )}
              </div>
          </div>

          {/* PROPERTY & MAINTENANCE WIDGETS (Right - 4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-5 md:gap-6">
              
              {/* PROPERTY DETAILS */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#ebf3f5] text-[#1f8898] flex items-center justify-center shrink-0">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Your Residence</p>
                        <p className="text-lg font-black text-gray-900 leading-tight">{unit.property.name}</p>
                    </div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Unit Number</span>
                        <span className="text-sm font-black text-gray-900">{unit.unit_number}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-200/60">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Base Rent</span>
                        <span className="text-sm font-black text-gray-900">KSH {unit.rent_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-200/60">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Management</span>
                        <span className="text-xs font-bold text-gray-700">{unit.property.landlord?.company_name || 'PM'}</span>
                    </div>
                </div>
              </div>

              {/* MAINTENANCE HUB */}
              <div className="bg-[#1f8898] text-white rounded-3xl p-6 shadow-lg relative overflow-hidden flex-1 flex flex-col justify-between">
                  <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
                      <Wrench className="w-32 h-32" />
                  </div>
                  <div className="relative z-10">
                      <h3 className="text-sm font-black tracking-widest uppercase text-teal-100 mb-4 flex items-center gap-2">
                          <Activity className="w-4 h-4" /> Operations Hub
                      </h3>
                      
                      {latestTicket ? (
                          <div className="bg-[#ffffff]/10 border border-[#ffffff]/20 rounded-2xl p-4 backdrop-blur-md shadow-inner mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-teal-100 truncate pr-2">{latestTicket.issue_type}</p>
                                <span className="px-2 py-0.5 bg-amber-400 text-amber-950 text-[9px] font-black uppercase tracking-widest rounded-md shrink-0">
                                    {latestTicket.status.replace('_', ' ')}
                                </span>
                              </div>
                              <p className="text-sm font-bold text-white truncate">{latestTicket.description}</p>
                          </div>
                      ) : (
                          <div className="bg-[#ffffff]/10 border border-[#ffffff]/20 rounded-2xl p-4 backdrop-blur-md shadow-inner mb-4 text-center">
                              <ThumbsUp className="w-6 h-6 text-teal-200 mx-auto mb-2" />
                              <p className="text-sm font-black text-white">All Clear</p>
                              <p className="text-[10px] text-teal-100 font-bold mt-0.5">No active tickets.</p>
                          </div>
                      )}
                  </div>

                  <div className="relative z-10 flex gap-2">
                      <Link href="/portal/maintenance" className="flex-1 py-3 bg-[#ffffff] text-[#1f8898] rounded-xl text-xs font-black hover:bg-gray-50 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2">
                          <PlusCircle className="w-3.5 h-3.5" /> Report Issue
                      </Link>
                  </div>
              </div>
          </div>
        </div>
      </main>

      {/* --- NOTICE TO VACATE MODAL --- */}
      {isNoticeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#ffffff] rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 flex flex-col">
            
            <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-rose-600 text-white">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
                        <FileWarning className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black tracking-tight">Notice to Vacate</h2>
                        <p className="text-[10px] font-bold text-rose-100 uppercase tracking-widest mt-0.5">Formal move-out initiation</p>
                    </div>
                </div>
                <button onClick={() => setIsNoticeModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>
            
            <form onSubmit={handleNoticeSubmit} className="p-6 md:p-8 space-y-5">
              <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex gap-3 mb-2">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-xs text-rose-800 font-medium">
                  By submitting this form, you are officially notifying your landlord of your intent to terminate your lease. 
                  A minimum of <strong className="font-black">30 days notice</strong> is required.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2 ml-1">Intended Move-Out Date</label>
                <input 
                  type="date" required min={minDateString}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all bg-gray-50/50 text-gray-900 font-medium text-sm"
                  value={noticeData.moveOutDate} onChange={(e) => setNoticeData({...noticeData, moveOutDate: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2 ml-1">Reason for Leaving</label>
                <textarea 
                  required rows={3} placeholder="Please briefly explain why you are leaving..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all bg-gray-50/50 text-gray-900 font-medium text-sm resize-none" 
                  value={noticeData.reason} onChange={(e) => setNoticeData({...noticeData, reason: e.target.value})} 
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                <button type="button" onClick={() => setIsNoticeModalOpen(false)} className="px-5 py-3 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">Cancel</button>
                <button type="submit" disabled={isSubmittingNotice} className="flex items-center justify-center gap-2 px-6 py-3 w-full sm:w-auto rounded-xl font-bold text-sm text-[#ffffff] bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/20 transition-all disabled:opacity-60 active:scale-95">
                  {isSubmittingNotice ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} 
                  {isSubmittingNotice ? 'Recording...' : 'Submit Formal Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}