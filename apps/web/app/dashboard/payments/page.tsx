// apps/web/app/dashboard/payments/page.tsx
/* eslint-disable */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Receipt, Download, Search, CheckCircle2, 
  Smartphone, Landmark, Banknote, Wallet, 
  ArrowRight, Loader2, BarChart3, Clock, Printer
} from 'lucide-react';

export default function MasterPaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Advanced UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState('ALL');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices`, {
          credentials: 'include' // <-- PERFECTLY CLEANED!
        });

        // Security Check: Kick unauthenticated users
        if (res.status === 401 || res.status === 403) return router.push('/login');
        if (!res.ok) throw new Error('Failed to fetch payments');

        const allInvoices = await res.json();
        
        // Extract and flatten all individual payment records from the invoices
        const extractedPayments = allInvoices.flatMap((inv: any) => 
          (inv.payments || []).map((payment: any) => ({
            ...payment,
            tenant: inv.tenant,
            invoice_description: inv.description
          }))
        );

        // Sort by newest first
        extractedPayments.sort((a: any, b: any) => {
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return dateB - dateA;
        });

        setPayments(extractedPayments);
      } catch (err) { 
        console.error(err); 
      } finally { 
        setIsLoading(false); 
      }
    };
    fetchPayments();
  }, [router]);

  // --- Filtering Logic ---
  const filteredPayments = payments.filter(payment => {
    const tenantName = `${payment.tenant?.first_name} ${payment.tenant?.last_name}`.toLowerCase();
    const refNumber = (payment.reference_number || '').toLowerCase();
    const matchesSearch = tenantName.includes(searchTerm.toLowerCase()) || refNumber.includes(searchTerm.toLowerCase());
    
    const matchesMethod = filterMethod === 'ALL' || payment.payment_method === filterMethod;
    
    return matchesSearch && matchesMethod;
  });

  // --- Analytics Calculations ---
  const totalVolume = payments.reduce((sum, p) => sum + Number(p.amount_paid), 0);
  const mpesaVolume = payments.filter(p => p.payment_method === 'MPESA').reduce((sum, p) => sum + Number(p.amount_paid), 0);
  const otherVolume = totalVolume - mpesaVolume;

  // --- Global CSV Export ---
  const handleExportCSV = () => {
    const headers = ['Receipt ID', 'Date', 'Tenant', 'Unit', 'Payment Method', 'Reference Number', 'For Invoice', 'Amount (KSH)'];
    const rows = filteredPayments.map(p => [
      `REC-${p.id.substring(0, 6).toUpperCase()}`,
      new Date(p.created_at || Date.now()).toLocaleDateString(),
      `${p.tenant?.first_name} ${p.tenant?.last_name}`,
      `${p.tenant?.unit?.property?.name} - ${p.tenant?.unit?.unit_number}`,
      p.payment_method,
      p.reference_number || 'N/A',
      p.invoice_description,
      p.amount_paid
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MogiRentOS_Receipts_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Individual Receipt Printer (PDF Generation) ---
  const handleDownloadReceipt = (payment: any) => {
    const receiptWindow = window.open('', '_blank');
    if (!receiptWindow) {
      alert('Please allow pop-ups to download receipts.');
      return;
    }

    const receiptId = `REC-${payment.id.substring(0, 6).toUpperCase()}`;
    const date = new Date(payment.created_at || Date.now()).toLocaleString();
    const tenantName = `${payment.tenant?.first_name} ${payment.tenant?.last_name}`;
    const unit = `${payment.tenant?.unit?.property?.name} - ${payment.tenant?.unit?.unit_number}`;
    const amount = Number(payment.amount_paid).toLocaleString();

    const htmlContent = `
      <html>
        <head>
          <title>Receipt - ${receiptId}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; color: #111827; padding: 40px; background: #f8fafb; }
            .receipt-container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #e5e7eb; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
            .header { text-align: center; border-bottom: 2px dashed #e5e7eb; padding-bottom: 24px; margin-bottom: 24px; }
            .header h1 { font-weight: 900; font-size: 28px; color: #1f8898; margin: 0 0 4px 0; letter-spacing: -0.5px; }
            .header p { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; margin: 0; }
            .details-grid { display: grid; grid-template-columns: 1fr; gap: 16px; margin-bottom: 32px; }
            .detail-row { display: flex; justify-content: space-between; padding-bottom: 12px; border-bottom: 1px solid #f3f4f6; }
            .label { font-size: 12px; color: #6b7280; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
            .value { font-size: 14px; font-weight: 700; color: #111827; text-align: right; }
            .total-box { background: #ebf3f5; padding: 24px; border-radius: 12px; text-align: center; border: 1px solid rgba(31, 136, 152, 0.2); }
            .total-label { font-size: 12px; color: #1f8898; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
            .total-amount { font-size: 32px; font-weight: 900; color: #1f8898; margin: 0; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #9ca3af; font-weight: 500; }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="header">
              <h1>MogiRentOS</h1>
              <p>Official Payment Receipt</p>
            </div>
            <div class="details-grid">
              <div class="detail-row"><span class="label">Receipt No</span> <span class="value">${receiptId}</span></div>
              <div class="detail-row"><span class="label">Date & Time</span> <span class="value">${date}</span></div>
              <div class="detail-row"><span class="label">Billed To</span> <span class="value">${tenantName}</span></div>
              <div class="detail-row"><span class="label">Property / Unit</span> <span class="value">${unit}</span></div>
              <div class="detail-row"><span class="label">For Invoice</span> <span class="value">${payment.invoice_description}</span></div>
              <div class="detail-row"><span class="label">Payment Method</span> <span class="value">${payment.payment_method}</span></div>
              ${payment.reference_number ? `<div class="detail-row"><span class="label">Reference ID</span> <span class="value">${payment.reference_number}</span></div>` : ''}
            </div>
            <div class="total-box">
              <div class="total-label">Total Amount Settled</div>
              <h2 class="total-amount">KSH ${amount}</h2>
            </div>
            <div class="footer">
              Thank you for your payment.<br>Generated automatically via MogiRentOS.
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `;

    receiptWindow.document.write(htmlContent);
    receiptWindow.document.close();
  };

  // Helper for Payment Method Visuals
  const getMethodDisplay = (method: string) => {
    switch (method) {
      case 'MPESA': return { icon: <Smartphone className="w-3.5 h-3.5" />, color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'M-PESA' };
      case 'BANK_TRANSFER': return { icon: <Landmark className="w-3.5 h-3.5" />, color: 'bg-blue-50 text-blue-700 border-blue-200', label: 'BANK' };
      case 'CASH': return { icon: <Banknote className="w-3.5 h-3.5" />, color: 'bg-amber-50 text-amber-700 border-amber-200', label: 'CASH' };
      default: return { icon: <Receipt className="w-3.5 h-3.5" />, color: 'bg-gray-100 text-gray-700 border-gray-200', label: method };
    }
  };

  const getFilterPillClass = (method: string) => {
    const isActive = filterMethod === method;
    return `px-5 py-2 rounded-full text-sm font-bold transition-all ${
      isActive 
        ? 'bg-[#1f8898] text-white shadow-md' 
        : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
    }`;
  };

  return (
    <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans selection:bg-[#1f8898]/30 overflow-x-hidden">
      
      {/* --- Scaled-Down Gradient Hero Area --- */}
      <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-6 pt-8 pb-14 md:pt-10 md:pb-16 relative overflow-hidden shadow-inner">
        <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-100 text-xs font-bold uppercase tracking-widest mb-3 border border-white/20 backdrop-blur-sm">
                <Receipt className="w-3.5 h-3.5" /> Transaction History
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[#ffffff] tracking-tight mb-2">
              Payments Ledger
            </h1>
            <p className="text-teal-100 text-sm md:text-base font-medium max-w-xl leading-relaxed">
              A strict, immutable record of all successfully settled transactions across your portfolio.
            </p>
          </div>

          <div className="flex mt-2 md:mt-0">
            <button 
              onClick={handleExportCSV} 
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-2.5 rounded-xl font-bold text-sm backdrop-blur-md transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Download className="w-4 h-4" /> Export All Receipts
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 md:-mt-10 relative z-20">
        
        {/* --- Bento Box Analytics Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          
          <div className="bg-[#ffffff] p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-[#1f8898] group-hover:text-white transition-colors">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Volume</span>
            </div>
            <div>
              <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">KSH {totalVolume.toLocaleString()}</h4>
              <p className="text-xs text-gray-500 font-medium mt-1">Processed across all methods</p>
            </div>
          </div>

          <div className="bg-[#ffffff] p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                <Smartphone className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Mobile Money</span>
            </div>
            <div className="relative z-10">
              <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">KSH {mpesaVolume.toLocaleString()}</h4>
              <p className="text-xs text-gray-500 font-medium mt-1">Settled via M-Pesa</p>
            </div>
          </div>

          <div className="bg-[#ffffff] p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                <Landmark className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Bank & Cash</span>
            </div>
            <div className="relative z-10">
              <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">KSH {otherVolume.toLocaleString()}</h4>
              <p className="text-xs text-gray-500 font-medium mt-1">Settled via EFT, RTGS, or Cash</p>
            </div>
          </div>
        </div>

        {/* --- Data Table with Filters --- */}
        <div className="bg-[#ffffff] rounded-3xl shadow-lg shadow-black/5 border border-gray-100 overflow-hidden mb-12">
          
          {/* Filtering Toolbar */}
          <div className="p-5 border-b border-gray-100 bg-[#f8fafb]/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setFilterMethod('ALL')} className={getFilterPillClass('ALL')}>All Transactions</button>
              <button onClick={() => setFilterMethod('MPESA')} className={getFilterPillClass('MPESA')}>M-Pesa Only</button>
              <button onClick={() => setFilterMethod('BANK_TRANSFER')} className={getFilterPillClass('BANK_TRANSFER')}>Bank Transfers</button>
              {/* --- NEW: Cash Filter Button --- */}
              <button onClick={() => setFilterMethod('CASH')} className={getFilterPillClass('CASH')}>Cash</button>
            </div>

            <div className="relative w-full lg:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input 
                type="text" placeholder="Search Txn ID or tenant..." 
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all bg-[#ffffff]"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* The Table */}
          <div className="overflow-x-auto min-h-[400px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 text-[#1f8898] gap-4">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="font-bold text-sm uppercase tracking-widest text-gray-400">Loading ledger...</span>
              </div>
            ) : (
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-gray-100 bg-[#ffffff] text-[10px] uppercase tracking-widest text-gray-400 font-black">
                    <th className="px-6 py-4 pl-8">Receipt Details</th>
                    <th className="px-6 py-4">Tenant / Unit</th>
                    <th className="px-6 py-4">For Invoice</th>
                    <th className="px-6 py-4">Method & Ref</th>
                    <th className="px-6 py-4 text-right">Amount Settled</th>
                    <th className="px-6 py-4 text-center pr-8">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-[#ffffff]">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <div className="w-16 h-16 bg-[#ebf3f5] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#1f8898]">
                          <BarChart3 className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No transactions found</h3>
                        <p className="text-sm text-gray-500 font-medium">When tenants pay their invoices, the receipts will appear here.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((payment) => {
                      const methodDisplay = getMethodDisplay(payment.payment_method);
                      return (
                        <tr key={payment.id} className="hover:bg-gray-50/50 transition duration-150 group">
                          <td className="px-6 py-4 pl-8">
                            <div className="font-bold text-gray-900 font-mono text-xs uppercase tracking-wider group-hover:text-[#1f8898] transition-colors flex items-center gap-2">
                              <Receipt className="w-3.5 h-3.5 text-gray-400" /> REC-{payment.id.substring(0, 6)}
                            </div>
                            <div className="text-[10px] text-gray-500 font-bold mt-1 flex items-center gap-1 uppercase tracking-wide">
                              <Clock className="w-3 h-3" />
                              {new Date(payment.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-gray-900">{payment.tenant?.first_name} {payment.tenant?.last_name}</p>
                            <p className="text-[11px] text-gray-500 font-bold tracking-wide mt-0.5 uppercase">
                              {payment.tenant?.unit?.property?.name} • {payment.tenant?.unit?.unit_number}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                            {payment.invoice_description}
                          </td>
                          <td className="px-6 py-4">
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider border ${methodDisplay.color}`}>
                              {methodDisplay.icon}
                              {methodDisplay.label}
                            </div>
                            {payment.reference_number && (
                               <p className="text-xs font-mono font-bold text-gray-600 mt-1.5 uppercase tracking-wider">Ref: {payment.reference_number}</p>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right font-black text-gray-900 text-base">
                            KSH {Number(payment.amount_paid).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-center pr-8">
                            <div className="flex items-center justify-center gap-2">
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Settled
                              </span>
                              
                              <button 
                                onClick={() => handleDownloadReceipt(payment)}
                                className="p-2 bg-[#ffffff] text-[#1f8898] hover:bg-[#1f8898] hover:text-[#ffffff] rounded-xl transition-all border border-gray-200 hover:border-transparent shadow-sm active:scale-95"
                                title="Download PDF Receipt"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                            </div>
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
    </div>
  );
}