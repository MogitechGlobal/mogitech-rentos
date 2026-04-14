// apps/web/app/dashboard/payments/page.tsx
/* eslint-disable */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Receipt, Download, Search, CheckCircle2, 
  Smartphone, Landmark, Banknote, Wallet, 
  ArrowRight, Loader2, BarChart3, Clock, Printer,
  RefreshCw, AlertCircle, FileText, Filter,
  Building2, Calendar, CalendarDays, FileCheck
} from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';

export default function MasterPaymentsPage() {
  const router = useRouter();
  const { profile } = useUserStore(); 

  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState('ALL');
  const [filterProperty, setFilterProperty] = useState('ALL');
  
  const [datePreset, setDatePreset] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const companyName = profile?.company_name || profile?.landlord?.company_name || 'MogiRentOS Management';

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices`, {
          credentials: 'include' 
        });

        if (res.status === 401 || res.status === 403) return router.push('/login');
        if (!res.ok) throw new Error('Failed to fetch payments');

        const allInvoices = await res.json();
        
        const extractedPayments = allInvoices.flatMap((inv: any) => 
          (inv.payments || []).map((payment: any) => ({
            ...payment,
            tenant: inv.tenant,
            invoice_description: inv.description,
            invoice_id: inv.id
          }))
        );

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

  const handleDatePresetChange = (preset: string) => {
    setDatePreset(preset);
    const today = new Date();
    let start = '';
    let end = '';

    const formatDate = (date: Date) => {
      const offset = date.getTimezoneOffset()
      date = new Date(date.getTime() - (offset*60*1000))
      return date.toISOString().split('T')[0]
    }

    switch (preset) {
      case 'TODAY':
        start = end = formatDate(today);
        break;
      case 'YESTERDAY':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        start = end = formatDate(yesterday);
        break;
      case 'THIS_WEEK':
        const firstDay = new Date(today.setDate(today.getDate() - today.getDay()));
        start = formatDate(firstDay);
        end = formatDate(new Date());
        break;
      case 'THIS_MONTH':
        start = formatDate(new Date(today.getFullYear(), today.getMonth(), 1));
        end = formatDate(new Date(today.getFullYear(), today.getMonth() + 1, 0));
        break;
      case 'LAST_MONTH':
        start = formatDate(new Date(today.getFullYear(), today.getMonth() - 1, 1));
        end = formatDate(new Date(today.getFullYear(), today.getMonth(), 0));
        break;
      case 'THIS_YEAR':
        start = formatDate(new Date(today.getFullYear(), 0, 1));
        end = formatDate(new Date(today.getFullYear(), 11, 31));
        break;
      case 'ALL':
      case 'CUSTOM':
      default:
        start = '';
        end = '';
        break;
    }
    
    if (preset !== 'CUSTOM') {
      setStartDate(start);
      setEndDate(end);
    }
  };

  const handleManualDateChange = (type: 'start' | 'end', value: string) => {
    setDatePreset('CUSTOM');
    if (type === 'start') setStartDate(value);
    if (type === 'end') setEndDate(value);
  };

  const handleAutoReconcile = async () => {
    setStatusMsg({ type: 'info', text: 'Syncing with Bank and M-Pesa gateways...' });
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/reconcile`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Reconciliation failed');
      
      setStatusMsg({ type: 'success', text: data.message });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  const handleBulkPDFExport = async () => {
    if (filteredPayments.length === 0) {
      setStatusMsg({ type: 'error', text: 'No receipts found in your current filter to export.' });
      return;
    }

    setStatusMsg({ type: 'info', text: 'Compiling bulk PDF receipts into a ZIP archive...' });
    
    try {
      const paymentIds = filteredPayments.map(p => p.id);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/bulk-receipts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ paymentIds })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to generate ZIP. Ensure archiver is installed on backend.');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MogiRentOS_Bulk_Receipts_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setStatusMsg({ type: 'success', text: 'Bulk receipts ZIP file downloaded successfully.' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  // --- BULLETPROOF PDF GENERATOR WITH FORCED COLORS ---
  const handleDownloadReceipt = (payment: any) => {
    setStatusMsg({ type: 'info', text: 'Generating Official PDF Receipt...' });

    const docId = `REC-${payment.id.substring(0, 8).toUpperCase()}`;
    const invIdShort = payment.invoice_id.substring(0, 8).toUpperCase();
    const date = new Date(payment.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const tenantName = `${payment.tenant?.first_name} ${payment.tenant?.last_name}`;
    const unit = `${payment.tenant?.unit?.property?.name} Unit ${payment.tenant?.unit?.unit_number}`;
    const amountPaid = Number(payment.amount_paid);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${docId}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap');
            
            /* FORCE BROWSER TO PRINT COLORS */
            @media print {
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .watermark {
                color: rgba(229, 231, 235, 0.45) !important;
              }
            }

            body { 
              font-family: 'Inter', sans-serif; 
              color: #111827; 
              padding: 0; 
              margin: 0;
              background: #ffffff; 
            }
            .a4-container { 
              max-width: 800px; 
              margin: 0 auto; 
              background: #ffffff; 
              position: relative;
              min-height: 100vh;
              display: flex;
              flex-direction: column;
            }
            
            /* Dark Teal Header */
            .header-container {
              background-color: #0f3e46 !important; 
              color: #ffffff !important;
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 40px 50px;
            }
            .company-info h1 {
              font-size: 32px;
              font-weight: 800;
              margin: 0 0 5px 0;
              color: #ffffff !important;
            }
            .company-info p {
              font-size: 13px;
              color: #cbd5e1 !important;
              margin: 0;
              font-weight: 400;
            }
            .doc-type h2 {
              font-size: 26px;
              font-weight: 800;
              margin: 0;
              color: #ffffff !important;
              text-transform: uppercase;
              letter-spacing: 1px;
            }

            .content-body {
              padding: 40px 50px;
              flex-grow: 1;
              position: relative;
              z-index: 10;
            }

            /* Watermark */
            .watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-35deg);
              font-size: 130px;
              font-weight: 900;
              color: rgba(229, 231, 235, 0.45); 
              white-space: nowrap;
              z-index: -1;
              pointer-events: none;
              letter-spacing: 5px;
            }

            /* Meta & Billed To */
            .top-section {
              display: flex;
              justify-content: space-between;
              margin-bottom: 40px;
              position: relative;
            }
            .billed-to .label {
              font-size: 11px;
              color: #111827;
              font-weight: 800;
              margin: 0 0 8px 0;
            }
            .billed-to .name {
              font-size: 15px;
              font-weight: 600;
              margin: 0 0 4px 0;
            }
            .billed-to .unit {
              font-size: 14px;
              color: #4b5563;
              margin: 0;
            }
            .meta-table {
              border-collapse: collapse;
            }
            .meta-table td {
              padding: 4px 0 4px 30px;
              font-size: 13px;
            }
            .meta-table td:first-child {
              color: #111827;
              font-weight: 800;
              text-align: left;
            }
            .meta-table td:last-child {
              font-weight: 400;
              text-align: left;
            }

            /* Light Teal Line Items Table */
            .line-items {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 40px;
            }
            .line-items th {
              background-color: #1f8898 !important; 
              color: #ffffff !important;
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
              padding: 12px 16px;
              text-align: left;
            }
            .line-items td {
              padding: 16px;
              font-size: 13px;
              color: #111827;
              border-bottom: 1px solid #e5e7eb;
            }
            .line-items th.right, .line-items td.right {
              text-align: right;
            }
            .totals-row td {
              padding: 16px;
              font-size: 14px;
              border-bottom: none;
            }
            .totals-row .total-label {
              font-weight: 800;
              text-align: right;
              color: #111827;
            }
            .totals-row .total-val {
              font-weight: 800;
              font-size: 16px;
              text-align: right;
              color: #111827;
            }

            /* Signatures */
            .bottom-area {
              margin-top: 60px;
            }
            .signature-block {
              width: 200px;
            }
            .sig-line {
              border-top: 2px solid #111827;
              margin-bottom: 8px;
            }
            .sig-text {
              font-size: 12px;
              color: #111827;
              font-weight: 800;
              margin: 0;
            }

            /* Footer */
            .footer {
              background-color: #f3f4f6 !important;
              text-align: center;
              padding: 20px 50px;
              margin-top: auto;
            }
            .footer p {
              margin: 0 0 5px 0;
              font-size: 10px;
              color: #6b7280;
            }
            .footer p.powered-by {
              font-weight: 600;
              color: #4b5563;
              margin-bottom: 0;
            }
          </style>
        </head>
        <body>
          <div class="a4-container">
            
            <div class="header-container">
              <div class="company-info">
                <h1>${companyName}</h1>
                <p>Automated Property Management</p>
              </div>
              <div class="doc-type">
                <h2>OFFICIAL RECEIPT</h2>
              </div>
            </div>

            <div class="content-body">
              <div class="watermark">PAID</div>

              <div class="top-section">
                <div class="billed-to">
                  <p class="label">BILLED TO:</p>
                  <p class="name">${tenantName}</p>
                  <p class="unit">${unit}</p>
                </div>
                
                <table class="meta-table">
                  <tr>
                    <td>Receipt No:</td>
                    <td>${docId}</td>
                  </tr>
                  <tr>
                    <td>Date Paid:</td>
                    <td>${date}</td>
                  </tr>
                  <tr>
                    <td>Invoice Ref:</td>
                    <td>INV-${invIdShort}</td>
                  </tr>
                </table>
              </div>

              <table class="line-items">
                <thead>
                  <tr>
                    <th>DESCRIPTION</th>
                    <th>PAYMENT METHOD</th>
                    <th>REFERENCE CODE</th>
                    <th class="right">AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Settlement of Account Balance</td>
                    <td>${payment.payment_method || 'MPESA'}</td>
                    <td>${payment.reference_number || 'N/A'}</td>
                    <td class="right">KSH ${amountPaid.toLocaleString()}</td>
                  </tr>
                  <tr class="totals-row">
                    <td colspan="3" class="total-label">TOTAL PAID:</td>
                    <td class="total-val">KSH ${amountPaid.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>

              <div class="bottom-area">
                <div class="signature-block">
                  <div class="sig-line"></div>
                  <p class="sig-text">Authorized Signature</p>
                </div>
              </div>
            </div>

            <div class="footer">
              <p>This is a computer-generated receipt and does not require a physical signature.</p>
              <p>Generated by ${companyName} via MogiRentOS on ${new Date().toLocaleString()}</p>
              <p class="powered-by">Powered by Mogitech Global Ltd</p>
            </div>

          </div>
        </body>
      </html>
    `;

    const printIframe = document.createElement('iframe');
    printIframe.style.position = 'absolute';
    printIframe.style.top = '-10000px';
    document.body.appendChild(printIframe);

    const printDocument = printIframe.contentWindow?.document;
    if (printDocument) {
      printDocument.open();
      printDocument.write(htmlContent);
      printDocument.close();
    }

    setTimeout(() => {
      setStatusMsg(null);
      printIframe.contentWindow?.focus();
      printIframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(printIframe)) {
          document.body.removeChild(printIframe);
        }
      }, 2000);
    }, 500);
  };

  const handleExportCSV = () => {
    const headers = ['Receipt ID', 'Date', 'Tenant', 'Unit', 'Payment Method', 'Reference Number', 'For Invoice', 'Amount (KSH)'];
    const rows = filteredPayments.map(p => [
      `"REC-${p.id.substring(0, 8).toUpperCase()}"`,
      `"${new Date(p.created_at || Date.now()).toLocaleDateString()}"`,
      `"${p.tenant?.first_name} ${p.tenant?.last_name}"`,
      `"${p.tenant?.unit?.property?.name} - ${p.tenant?.unit?.unit_number}"`,
      `"${p.payment_method}"`,
      `"${p.reference_number || 'N/A'}"`,
      `"${p.invoice_description}"`,
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

  const uniqueProperties = Array.from(new Set(payments.map(p => p.tenant?.unit?.property?.name))).filter(Boolean);

  const filteredPayments = payments.filter(payment => {
    const tenantName = `${payment.tenant?.first_name} ${payment.tenant?.last_name}`.toLowerCase();
    const refNumber = (payment.reference_number || '').toLowerCase();
    const matchesSearch = tenantName.includes(searchTerm.toLowerCase()) || refNumber.includes(searchTerm.toLowerCase());
    
    const matchesMethod = filterMethod === 'ALL' || payment.payment_method === filterMethod;
    const matchesProperty = filterProperty === 'ALL' || payment.tenant?.unit?.property?.name === filterProperty;

    const payDate = new Date(payment.created_at || Date.now()).getTime();
    const startObj = startDate ? new Date(startDate).getTime() : 0;
    const endObj = endDate ? new Date(endDate).getTime() + 86399999 : Infinity;
    
    const matchesStart = !startDate || payDate >= startObj;
    const matchesEnd = !endDate || payDate <= endObj;

    return matchesSearch && matchesMethod && matchesProperty && matchesStart && matchesEnd;
  });

  const totalVolume = payments.reduce((sum, p) => sum + Number(p.amount_paid), 0);
  const mpesaVolume = payments.filter(p => p.payment_method === 'MPESA').reduce((sum, p) => sum + Number(p.amount_paid), 0);
  const otherVolume = totalVolume - mpesaVolume;

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
      isActive ? 'bg-[#1f8898] text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
    }`;
  };

  return (
    <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans selection:bg-[#1f8898]/30 overflow-x-hidden">
      
      <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-4 sm:px-6 pt-8 pb-14 md:pt-10 md:pb-16 relative overflow-hidden shadow-inner">
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

          <div className="flex flex-col sm:flex-row gap-3 mt-2 md:mt-0 w-full md:w-auto">
            <button 
              onClick={handleAutoReconcile} 
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-2.5 rounded-xl font-bold text-sm backdrop-blur-md transition-all flex items-center justify-center gap-2 active:scale-95"
              title="Reconcile with Gateways"
            >
              <RefreshCw className="w-4 h-4" /> Reconcile
            </button>

            <button 
              onClick={handleExportCSV} 
              className="w-full sm:w-auto bg-[#ffffff] hover:bg-gray-50 text-[#1f8898] px-6 py-2.5 rounded-xl font-black text-sm shadow-xl shadow-black/10 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 md:-mt-10 relative z-20">
        
        {statusMsg && (
          <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 shadow-lg animate-in fade-in slide-in-from-top-4 border
            ${statusMsg.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 
              statusMsg.type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800' :
              'bg-red-50 border-red-200 text-red-800'}
          `}>
            {statusMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : 
             statusMsg.type === 'info' ? <Loader2 className="w-5 h-5 shrink-0 animate-spin" /> :
             <AlertCircle className="w-5 h-5 shrink-0" />}
            <span className="font-bold text-sm flex-1">{statusMsg.text}</span>
          </div>
        )}

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

        <div className="bg-[#ffffff] rounded-3xl shadow-lg shadow-black/5 border border-gray-100 overflow-hidden mb-12">
          
          <div className="p-5 border-b border-gray-100 bg-[#f8fafb]/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setFilterMethod('ALL')} className={getFilterPillClass('ALL')}>All Transactions</button>
              <button onClick={() => setFilterMethod('MPESA')} className={getFilterPillClass('MPESA')}>M-Pesa Only</button>
              <button onClick={() => setFilterMethod('BANK_TRANSFER')} className={getFilterPillClass('BANK_TRANSFER')}>Bank Transfers</button>
              <button onClick={() => setFilterMethod('CASH')} className={getFilterPillClass('CASH')}>Cash</button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <button 
                onClick={() => setShowFilters(!showFilters)} 
                className={`w-full sm:w-auto border px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-95 ${showFilters ? 'bg-[#1f8898] text-white border-[#1f8898]' : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'}`}
              >
                <Filter className="w-4 h-4" /> Filters
              </button>

              <button 
                onClick={handleBulkPDFExport}
                className="w-full sm:w-auto bg-white border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 hover:text-gray-900 transition-all flex items-center justify-center gap-2 active:scale-95"
                title="Download all receipts as ZIP"
              >
                <FileText className="w-4 h-4" /> Bulk PDFs
              </button>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input 
                  type="text" placeholder="Search Txn ID or tenant..." 
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all bg-[#ffffff]"
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="bg-gray-50 border-b border-gray-100 p-5 md:px-8 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Advanced Date & Property Controls</h4>
                <button onClick={() => { setFilterProperty('ALL'); handleDatePresetChange('ALL'); }} className="text-xs font-bold text-[#1f8898] hover:underline">Clear All</button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1 flex items-center gap-1.5"><Building2 className="w-3 h-3" /> Filter by Property</label>
                  <select 
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all bg-white font-bold text-gray-700 cursor-pointer text-sm" 
                    value={filterProperty} onChange={(e) => setFilterProperty(e.target.value)}
                  >
                    <option value="ALL">Entire Portfolio</option>
                    {uniqueProperties.map((propName: any) => (
                      <option key={propName} value={propName}>{propName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1 flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Date Preset</label>
                  <select 
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all bg-white font-bold text-gray-700 cursor-pointer text-sm" 
                    value={datePreset} onChange={(e) => handleDatePresetChange(e.target.value)}
                  >
                    <option value="ALL">All Time</option>
                    <option value="TODAY">Today</option>
                    <option value="YESTERDAY">Yesterday</option>
                    <option value="THIS_WEEK">This Week</option>
                    <option value="THIS_MONTH">This Month</option>
                    <option value="LAST_MONTH">Last Month</option>
                    <option value="THIS_YEAR">This Year</option>
                    <option value="CUSTOM">Custom Range...</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1 flex items-center gap-1.5"><CalendarDays className="w-3 h-3" /> Paid Date (From)</label>
                  <input 
                    type="date" 
                    disabled={datePreset !== 'CUSTOM'}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all bg-white font-bold text-gray-700 cursor-pointer text-sm disabled:bg-gray-100 disabled:text-gray-400" 
                    value={startDate} onChange={(e) => handleManualDateChange('start', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1 flex items-center gap-1.5"><CalendarDays className="w-3 h-3" /> Paid Date (To)</label>
                  <input 
                    type="date" 
                    disabled={datePreset !== 'CUSTOM'}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all bg-white font-bold text-gray-700 cursor-pointer text-sm disabled:bg-gray-100 disabled:text-gray-400" 
                    value={endDate} onChange={(e) => handleManualDateChange('end', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
          
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
                    <th className="px-6 py-4 text-right pr-8">Action</th>
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
                              <Receipt className="w-3.5 h-3.5 text-gray-400" /> REC-{payment.id.substring(0, 8).toUpperCase()}
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
                          <td className="px-6 py-4 text-right pr-8">
                            <div className="flex items-center justify-end gap-3">
                              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                <CheckCircle2 className="w-3 h-3" /> Settled
                              </span>
                              
                              <button 
                                onClick={() => handleDownloadReceipt(payment)}
                                className="p-2 border rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center bg-[#ffffff] text-[#1f8898] hover:bg-[#1f8898] hover:text-[#ffffff] border-gray-200 hover:border-transparent"
                                title="Download PDF Receipt"
                              >
                                <Printer className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest hidden xl:block ml-1">Receipt</span>
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