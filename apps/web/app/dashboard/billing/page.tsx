// apps/web/app/dashboard/billing/page.tsx
/* eslint-disable */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Download, Zap, TrendingUp, AlertCircle, CheckCircle2, 
  DollarSign, Wallet, FileText, Search, CreditCard, Loader2,
  FileSpreadsheet, ArrowRight, ShieldCheck
} from 'lucide-react';

export default function BillingDashboard() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Advanced UI States
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [paymentData, setPaymentData] = useState({ amount_paid: '', payment_method: 'MPESA', reference_number: '' });

  const fetchInvoices = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('access_token');
    if (!token) return router.push('/login');
    try {
      // FIXED: Corrected closing backtick
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load invoices');
      const data = await res.json();
      setInvoices(data);
    } catch (err: any) { 
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchInvoices(); }, [router]);

  // --- Manual Batch Generate ---
  const handleGenerateBatch = async () => {
    setIsGenerating(true);
    setStatusMsg(null);
    try {
      const token = localStorage.getItem('access_token');
      // FIXED: Corrected closing backtick
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices/generate-batch`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.count === 0) {
        setStatusMsg({ type: 'info', text: 'All tenants are already billed for this period.' });
      } else {
        setStatusMsg({ type: 'success', text: `Successfully generated ${data.count} new invoices.` });
      }
      fetchInvoices(); 
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Failed to generate invoices. Check server connection.' });
    } finally {
      setIsGenerating(false);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  // --- CSV Export ---
  const handleExportCSV = () => {
    const headers = ['Tenant Name', 'Property & Unit', 'Description', 'Due Date', 'Amount (KSH)', 'Status'];
    const rows = filteredInvoices.map(inv => [
      `${inv.tenant.first_name} ${inv.tenant.last_name}`,
      `${inv.tenant.unit.property.name} - ${inv.tenant.unit.unit_number}`,
      inv.description,
      new Date(inv.due_date).toLocaleDateString(),
      inv.amount,
      inv.status
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MogiRentOS_Financials_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Filtering Logic ---
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = `${inv.tenant.first_name} ${inv.tenant.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inv.tenant.unit.unit_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || inv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // --- Advanced Analytics Calculations ---
  const totalBilled = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalCollected = invoices.reduce((sum, inv) => {
    const paidOnInvoice = inv.payments?.reduce((pSum: number, p: any) => pSum + p.amount_paid, 0) || 0;
    return sum + paidOnInvoice;
  }, 0);
  const totalOutstanding = totalBilled - totalCollected;
  const collectionRate = totalBilled === 0 ? 0 : Math.round((totalCollected / totalBilled) * 100);

  // --- Payment Modal Logic ---
  const handleOpenPaymentModal = (invoice: any) => {
    const alreadyPaid = invoice.payments?.reduce((sum: number, p: any) => sum + p.amount_paid, 0) || 0;
    const remainingBalance = invoice.amount - alreadyPaid;
    
    setSelectedInvoice({ ...invoice, remainingBalance });
    setPaymentData({ amount_paid: remainingBalance.toString(), payment_method: 'MPESA', reference_number: '' });
    setIsPaymentModalOpen(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg(null);
    try {
      const token = localStorage.getItem('access_token');
      // FIXED: Removed http:// and api/v1 since they are part of the environment variable
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices/${selectedInvoice.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(paymentData),
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Payment failed');
      }

      setStatusMsg({ type: 'success', text: 'Payment recorded successfully!' });
      setIsPaymentModalOpen(false);
      fetchInvoices(); 
    } catch (err: any) { 
      setStatusMsg({ type: 'error', text: err.message });
    } finally { 
      setIsSubmitting(false); 
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans selection:bg-[#1f8898]/30 overflow-x-hidden">
      
      <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-6 pt-8 pb-14 md:pt-10 md:pb-16 relative overflow-hidden shadow-inner">
        <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-100 text-xs font-bold uppercase tracking-widest mb-3 border border-white/20 backdrop-blur-sm">
                <Wallet className="w-3.5 h-3.5" /> Financial Operations
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[#ffffff] tracking-tight mb-2">
              Billing Dashboard
            </h1>
            <p className="text-teal-100 text-sm md:text-base font-medium max-w-xl leading-relaxed">
              Track your portfolio's revenue, generate monthly rent invoices, and reconcile tenant payments in real-time.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-2 md:mt-0">
            <button 
              onClick={handleExportCSV} 
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-2.5 rounded-xl font-bold text-sm backdrop-blur-md transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> Export Ledger
            </button>
            <button 
              onClick={handleGenerateBatch} 
              disabled={isGenerating} 
              className="bg-[#ffffff] hover:bg-gray-50 text-[#1f8898] px-6 py-2.5 rounded-xl font-black text-sm shadow-xl shadow-black/10 transition-all flex items-center justify-center gap-2 disabled:opacity-70 active:scale-95"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {isGenerating ? 'Processing...' : 'Run Auto-Billing'}
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 md:-mt-10 relative z-20">
        
        {statusMsg && (
          <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 shadow-lg animate-in fade-in slide-in-from-top-4 border
            ${statusMsg.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 
              statusMsg.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 
              'bg-blue-50 border-blue-200 text-blue-800'}
          `}>
            {statusMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : 
             statusMsg.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : 
             <ShieldCheck className="w-5 h-5 shrink-0" />}
            <span className="font-bold text-sm">{statusMsg.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          
          <div className="bg-[#ffffff] p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-[#1f8898] group-hover:text-white transition-colors">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Billed</span>
            </div>
            <div>
              <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">KSH {totalBilled.toLocaleString()}</h4>
              <p className="text-xs text-gray-500 font-medium mt-1">Across all active invoices</p>
            </div>
          </div>

          <div className="bg-[#ffffff] p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-50 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 border border-green-100">
                <DollarSign className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-green-600">Collected</span>
            </div>
            <div className="relative z-10">
              <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">KSH {totalCollected.toLocaleString()}</h4>
              <p className="text-xs text-gray-500 font-medium mt-1">Realized revenue</p>
            </div>
          </div>

          <div className="bg-[#ffffff] p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
                <AlertCircle className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-600">Outstanding</span>
            </div>
            <div className="relative z-10">
              <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">KSH {totalOutstanding.toLocaleString()}</h4>
              <p className="text-xs text-gray-500 font-medium mt-1">Pending collection</p>
            </div>
          </div>

          <div className="bg-[#ffffff] p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center group hover:-translate-y-1 transition-all">
            <div className="flex justify-between items-end mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#1f8898]" />
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Health</p>
              </div>
              <p className="text-3xl font-black text-[#1f8898] tracking-tight">{collectionRate}%</p>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden border border-gray-200">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${collectionRate >= 80 ? 'bg-[#1f8898]' : collectionRate >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                style={{ width: `${collectionRate}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-3 text-center">Collection Efficiency</p>
          </div>
        </div>

        <div className="bg-[#ffffff] rounded-3xl shadow-lg shadow-black/5 border border-gray-100 overflow-hidden mb-12">
          <div className="p-5 border-b border-gray-100 bg-[#f8fafb]/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#1f8898]" /> Invoice Ledger
            </h3>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input 
                  type="text" placeholder="Search tenant or unit..." 
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all bg-[#ffffff]"
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="w-full sm:w-auto border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all bg-[#ffffff] cursor-pointer"
                value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="PAID">Fully Paid</option>
                <option value="PARTIAL">Partially Paid</option>
                <option value="UNPAID">Unpaid</option>
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto min-h-[400px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 text-[#1f8898] gap-4">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="font-bold text-sm uppercase tracking-widest text-gray-400">Loading ledgers...</span>
              </div>
            ) : (
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-gray-100 bg-[#ffffff] text-[10px] uppercase tracking-widest text-gray-400 font-black">
                    <th className="px-6 py-4">Tenant / Unit</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Due Date</th>
                    <th className="px-6 py-4 text-right">Billed</th>
                    <th className="px-6 py-4 text-right">Balance</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-[#ffffff]">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center">
                        <div className="w-16 h-16 bg-[#ebf3f5] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#1f8898]">
                          <FileText className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No invoices found</h3>
                        <p className="text-sm text-gray-500 font-medium">Try adjusting your search or generate new bills.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => {
                      const alreadyPaid = inv.payments?.reduce((sum: number, p: any) => sum + p.amount_paid, 0) || 0;
                      const balance = inv.amount - alreadyPaid;

                      return (
                        <tr key={inv.id} className="hover:bg-gray-50/50 transition duration-150 group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#ebf3f5] text-[#1f8898] flex items-center justify-center font-black text-sm shrink-0">
                                {inv.tenant.first_name.charAt(0)}{inv.tenant.last_name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">{inv.tenant.first_name} {inv.tenant.last_name}</p>
                                <p className="text-[11px] text-gray-500 font-bold tracking-wide mt-0.5 uppercase">{inv.tenant.unit.property.name} • {inv.tenant.unit.unit_number}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 font-medium">{inv.description}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                            {new Date(inv.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4 text-right text-sm text-gray-600 font-medium">
                            KSH {inv.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-right font-black text-gray-900 group-hover:text-[#1f8898] transition-colors">
                            KSH {balance.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                              inv.status === 'PAID' ? 'bg-green-50 text-green-700 border-green-200' :
                              inv.status === 'PARTIAL' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                              {inv.status === 'PAID' && <CheckCircle2 className="w-3 h-3" />}
                              {inv.status === 'PARTIAL' && <AlertCircle className="w-3 h-3" />}
                              {inv.status}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {inv.status !== 'PAID' ? (
                              <button 
                                onClick={() => handleOpenPaymentModal(inv)} 
                                className="bg-white border border-gray-200 text-gray-700 font-bold px-4 py-2 rounded-xl hover:border-[#1f8898] hover:text-[#1f8898] transition-all text-xs flex items-center gap-2 ml-auto active:scale-95 shadow-sm"
                              >
                                <CreditCard className="w-3.5 h-3.5" /> Record Pay
                              </button>
                            ) : (
                              <span className="text-gray-400 font-bold text-xs flex items-center justify-end gap-1 px-4 py-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" /> Settled
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {isPaymentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsPaymentModalOpen(false)}></div>
          
          <div className="relative w-full max-w-md bg-[#ffffff] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="bg-[#f8fafb] px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#ebf3f5] rounded-xl flex items-center justify-center text-[#1f8898]">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 tracking-tight">Record Payment</h3>
                  <p className="text-xs font-medium text-gray-500">{selectedInvoice.tenant.first_name} {selectedInvoice.tenant.last_name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Remaining Bal</p>
                <p className="text-sm font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100">
                  KSH {selectedInvoice.remainingBalance.toLocaleString()}
                </p>
              </div>
            </div>

            <form onSubmit={handleRecordPayment} className="p-6 space-y-5">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Amount Received (KSH)</label>
                <div className="relative">
                  <DollarSign className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
                  <input 
                    type="number" required 
                    max={selectedInvoice.remainingBalance} 
                    className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-gray-50 font-bold text-gray-900" 
                    value={paymentData.amount_paid} 
                    onChange={(e) => setPaymentData({ ...paymentData, amount_paid: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Payment Method</label>
                <select 
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-gray-50 font-bold text-gray-700 cursor-pointer" 
                  value={paymentData.payment_method} 
                  onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })}
                >
                  <option value="MPESA">Safaricom M-Pesa</option>
                  <option value="BANK_TRANSFER">Bank Transfer (EFT/RTGS)</option>
                  <option value="CASH">Physical Cash</option>
                </select>
              </div>

              {paymentData.payment_method === 'MPESA' && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">M-Pesa Ref Number</label>
                  <input 
                    type="text" required placeholder="e.g. QWE123RTY"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all uppercase bg-gray-50 font-bold text-gray-900 placeholder:normal-case placeholder:font-medium" 
                    value={paymentData.reference_number} 
                    onChange={(e) => setPaymentData({ ...paymentData, reference_number: e.target.value.toUpperCase() })}
                  />
                </div>
              )}

              <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsPaymentModalOpen(false)} 
                  className="px-5 py-3 text-sm font-bold text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="px-6 py-3 text-sm font-bold text-[#ffffff] bg-[#1f8898] hover:bg-[#1a7684] rounded-xl transition-all shadow-lg shadow-[#1f8898]/20 disabled:opacity-50 flex items-center gap-2 active:scale-95"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {isSubmitting ? 'Processing...' : 'Confirm Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}