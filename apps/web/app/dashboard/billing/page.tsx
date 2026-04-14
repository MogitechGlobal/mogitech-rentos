// apps/web/app/dashboard/billing/page.tsx
/* eslint-disable */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Download, Zap, TrendingUp, AlertCircle, CheckCircle2, 
  DollarSign, Wallet, FileText, Search, CreditCard, Loader2,
  FileSpreadsheet, ShieldCheck, Bell,
  ToggleRight, ToggleLeft, FileCheck, Printer, Filter,
  Building2, CalendarDays, X, Calendar, Mail, Smartphone, BellRing
} from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';

export default function BillingDashboard() {
  const router = useRouter();
  const { profile } = useUserStore();

  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAutoPilot, setIsAutoPilot] = useState(false); 
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

  // --- REMINDER MODAL STATES ---
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderInvoice, setReminderInvoice] = useState<any>(null);
  const [reminderChannels, setReminderChannels] = useState({ email: true, sms: false, portal: true });

  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterProperty, setFilterProperty] = useState('ALL');
  
  const [datePreset, setDatePreset] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [paymentData, setPaymentData] = useState({ amount_paid: '', payment_method: 'MPESA', reference_number: '' });

  const companyName = profile?.company_name || profile?.landlord?.company_name || 'Tech Global Ltd';

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices`, {
        credentials: 'include' 
      });
      if (res.status === 401 || res.status === 403) return router.push('/login');
      if (!res.ok) throw new Error('Failed to load invoices');
      setInvoices(await res.json());
    } catch (err: any) { 
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    fetchInvoices(); 
    const storedAutoPilot = localStorage.getItem('mogi_autopilot_enabled');
    if (storedAutoPilot === 'true') setIsAutoPilot(true);
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
      case 'TODAY': start = end = formatDate(today); break;
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
      case 'ALL': case 'CUSTOM': default: start = ''; end = ''; break;
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

  const handleToggleAutoPilot = () => {
    const newState = !isAutoPilot;
    setIsAutoPilot(newState);
    localStorage.setItem('mogi_autopilot_enabled', newState.toString());
    setStatusMsg({ type: 'success', text: newState ? 'Auto-Pilot enabled.' : 'Auto-Pilot disabled.' });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const openReminderModal = (invoice: any) => {
    const alreadyPaid = invoice.payments?.reduce((sum: number, p: any) => sum + Number(p.amount_paid), 0) || 0;
    const remainingBalance = Number(invoice.amount) - alreadyPaid;
    
    setReminderInvoice({ ...invoice, remainingBalance });
    setReminderChannels({ email: true, sms: false, portal: true }); 
    setIsReminderModalOpen(true);
  };

  const executeSendReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reminderChannels.email && !reminderChannels.sms && !reminderChannels.portal) {
      setStatusMsg({ type: 'error', text: 'Please select at least one delivery channel.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMsg(null);

    const channels = [];
    if (reminderChannels.email) channels.push('EMAIL');
    if (reminderChannels.sms) channels.push('SMS');
    if (reminderChannels.portal) channels.push('PORTAL');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices/${reminderInvoice.id}/remind`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ channels })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send reminder');

      setStatusMsg({ type: 'success', text: data.message });
      setIsReminderModalOpen(false);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  // --- ADVANCED PDF GENERATOR (MATCHING TARGET LAYOUT WITH DYNAMIC WATERMARK) ---
  const handleDownloadDocument = (type: 'INVOICE' | 'RECEIPT', invoice: any) => {
    setStatusMsg({ type: 'info', text: `Generating ${type}...` });

    // Determine values
    const invIdFull = invoice.id.toUpperCase();
    const invIdShort = invIdFull.substring(0, 8);
    const docId = `${type === 'INVOICE' ? 'INV' : 'REC'}-${type === 'RECEIPT' && invoice.payments?.[0] ? invoice.payments[0].id.substring(0, 8).toUpperCase() : invIdShort}`;
    
    const dateIssuedOrPaid = new Date(type === 'INVOICE' ? invoice.created_at || Date.now() : (invoice.payments?.[0]?.created_at || Date.now()))
      .toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      
    const dueDate = new Date(invoice.due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const tenantName = `${invoice.tenant?.first_name} ${invoice.tenant?.last_name}`;
    const unit = `${invoice.tenant?.unit?.property?.name} - Unit ${invoice.tenant?.unit?.unit_number}`;
    
    const amountBilled = Number(invoice.amount);
    const amountPaid = invoice.payments?.reduce((sum: number, p: any) => sum + Number(p.amount_paid), 0) || 0;
    const balance = amountBilled - amountPaid;
    
    // Stamp logic
    const isFullyPaid = balance <= 0;
    const isPartial = !isFullyPaid && amountPaid > 0;
    
    // Determine dynamic watermark text
    let watermarkText = 'UNPAID';
    if (type === 'RECEIPT' || isFullyPaid) watermarkText = 'PAID.';
    else if (isPartial) watermarkText = 'PARTIALLY PAID';

    // HTML Template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${type} - ${docId}</title>
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
              overflow: hidden;
            }

            /* Dynamic Watermark */
            .watermark {
              position: absolute;
              top: 45%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-35deg);
              font-size: ${watermarkText === 'PARTIALLY PAID' ? '90px' : '130px'};
              font-weight: 900;
              color: rgba(229, 231, 235, 0.55); 
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
                <h2>OFFICIAL ${type}</h2>
              </div>
            </div>

            <div class="content-body">
              <div class="watermark">${watermarkText}</div>

              <div class="top-section">
                <div class="billed-to">
                  <p class="label">BILLED TO:</p>
                  <p class="name">${tenantName}</p>
                  <p class="unit">${unit}</p>
                </div>
                
                <table class="meta-table">
                  <tr>
                    <td>${type === 'INVOICE' ? 'Invoice No:' : 'Receipt No:'}</td>
                    <td>${docId}</td>
                  </tr>
                  <tr>
                    <td>${type === 'INVOICE' ? 'Date Issued:' : 'Date Paid:'}</td>
                    <td>${dateIssuedOrPaid}</td>
                  </tr>
                  ${type === 'RECEIPT' ? `
                  <tr>
                    <td>Invoice Ref:</td>
                    <td>INV-${invIdShort}</td>
                  </tr>
                  ` : `
                  <tr>
                    <td>Due Date:</td>
                    <td style="color: #e11d48;">${dueDate}</td>
                  </tr>
                  `}
                </table>
              </div>

              <table class="line-items">
                <thead>
                  <tr>
                    <th>DESCRIPTION</th>
                    ${type === 'RECEIPT' ? `
                    <th>PAYMENT METHOD</th>
                    <th>REFERENCE CODE</th>
                    ` : ``}
                    <th class="right">AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${type === 'RECEIPT' ? 'Settlement of Account Balance' : invoice.description}</td>
                    ${type === 'RECEIPT' ? `
                    <td>${invoice.payments?.[0]?.payment_method || 'MPESA'}</td>
                    <td>${invoice.payments?.[0]?.reference_number || 'N/A'}</td>
                    ` : ``}
                    <td class="right">KSH ${type === 'RECEIPT' ? amountPaid.toLocaleString() : amountBilled.toLocaleString()}</td>
                  </tr>
                  
                  ${type === 'INVOICE' && amountPaid > 0 ? `
                  <tr>
                    <td colspan="1">Less: Payments Received</td>
                    <td class="right" style="color: #047857;">- KSH ${amountPaid.toLocaleString()}</td>
                  </tr>
                  ` : ''}

                  <tr class="totals-row">
                    <td colspan="${type === 'RECEIPT' ? 3 : 1}" class="total-label">TOTAL ${type === 'RECEIPT' ? 'PAID' : 'DUE'}:</td>
                    <td class="total-val">KSH ${type === 'RECEIPT' ? amountPaid.toLocaleString() : balance.toLocaleString()}</td>
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
              <p>This is a computer-generated ${type.toLowerCase()} and does not require a physical signature.</p>
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

  const handleGenerateBatch = async () => {
    setIsGenerating(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices/generate-batch`, {
        method: 'POST',
        credentials: 'include' 
      });
      const data = await res.json();
      if (data.count === 0) setStatusMsg({ type: 'info', text: 'All tenants are already billed.' });
      else setStatusMsg({ type: 'success', text: `Generated ${data.count} new invoices.` });
      fetchInvoices(); 
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Failed to generate invoices. Check server connection.' });
    } finally {
      setIsGenerating(false);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Tenant Name', 'Property & Unit', 'Description', 'Due Date', 'Amount (KSH)', 'Status'];
    const rows = filteredInvoices.map(inv => [
      `"${inv.tenant.first_name} ${inv.tenant.last_name}"`,
      `"${inv.tenant.unit.property.name} - ${inv.tenant.unit.unit_number}"`,
      `"${inv.description}"`,
      `"${new Date(inv.due_date).toLocaleDateString()}"`,
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices/${selectedInvoice.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, 
        credentials: 'include', 
        body: JSON.stringify(paymentData),
      });
      if (!res.ok) throw new Error('Payment failed. Please try again.');
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

  const uniqueProperties = Array.from(new Set(invoices.map(inv => inv.tenant?.unit?.property?.name))).filter(Boolean);

  const filteredInvoices = invoices.filter(inv => {
    const searchString = `${inv.tenant.first_name} ${inv.tenant.last_name} ${inv.tenant.unit.unit_number} ${inv.description}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || inv.status === filterStatus;
    const matchesProperty = filterProperty === 'ALL' || inv.tenant?.unit?.property?.name === filterProperty;

    const invDate = new Date(inv.due_date).getTime();
    const startObj = startDate ? new Date(startDate).getTime() : 0;
    const endObj = endDate ? new Date(endDate).getTime() : Infinity;
    
    const matchesStart = !startDate || invDate >= startObj;
    const matchesEnd = !endDate || invDate <= endObj;

    return matchesSearch && matchesStatus && matchesProperty && matchesStart && matchesEnd;
  });

  const totalBilled = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalCollected = invoices.reduce((sum, inv) => sum + (inv.payments?.reduce((pSum: number, p: any) => pSum + p.amount_paid, 0) || 0), 0);
  const totalOutstanding = totalBilled - totalCollected;
  const collectionRate = totalBilled === 0 ? 0 : Math.round((totalCollected / totalBilled) * 100);

  return (
    <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans selection:bg-[#1f8898]/30 overflow-x-hidden">
      <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-4 sm:px-6 pt-8 pb-14 md:pt-10 md:pb-16 relative overflow-hidden shadow-inner">
        <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-100 text-xs font-bold uppercase tracking-widest mb-3 border border-white/20 backdrop-blur-sm">
                <Wallet className="w-3.5 h-3.5" /> Financial Operations
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[#ffffff] tracking-tight mb-2">Billing Dashboard</h1>
            <p className="text-teal-100 text-sm md:text-base font-medium max-w-xl leading-relaxed">
              Track your portfolio's revenue, generate monthly rent invoices, and reconcile tenant payments.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-2 md:mt-0 w-full md:w-auto">
            <button 
              onClick={handleToggleAutoPilot}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border shadow-sm ${
                isAutoPilot ? 'bg-emerald-500 hover:bg-emerald-400 border-emerald-400 text-white' : 'bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md'
              }`}
            >
              {isAutoPilot ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
              Auto-Pilot
            </button>

            <button 
              onClick={handleGenerateBatch} 
              disabled={isGenerating || isAutoPilot} 
              className="w-full sm:w-auto bg-[#ffffff] hover:bg-gray-50 text-[#1f8898] px-6 py-2.5 rounded-xl font-black text-sm shadow-xl shadow-black/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
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
              <p className="text-xs text-gray-500 font-medium mt-1">Across active invoices</p>
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
              <div className={`h-full rounded-full transition-all duration-1000 ${collectionRate >= 80 ? 'bg-[#1f8898]' : collectionRate >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${collectionRate}%` }}></div>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-3 text-center">Collection Efficiency</p>
          </div>
        </div>

        <div className="bg-[#ffffff] rounded-3xl shadow-lg shadow-black/5 border border-gray-100 overflow-hidden mb-12">
          <div className="p-5 border-b border-gray-100 bg-[#f8fafb]/50 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2 shrink-0">
              <FileText className="w-5 h-5 text-[#1f8898]" /> Invoice Ledger
            </h3>
            
            <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 w-full xl:w-auto">
              <button onClick={() => setShowFilters(!showFilters)} className={`w-full sm:w-auto border px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-95 ${showFilters ? 'bg-[#1f8898] text-white border-[#1f8898]' : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'}`}>
                <Filter className="w-4 h-4" /> Filters
              </button>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input type="text" placeholder="Search tenant or unit..." className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all bg-[#ffffff]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>

              <select className="w-full sm:w-auto border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all bg-[#ffffff] cursor-pointer" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="ALL">All Statuses</option>
                <option value="PAID">Fully Paid</option>
                <option value="PARTIAL">Partially Paid</option>
                <option value="UNPAID">Unpaid</option>
              </select>

              <button onClick={handleExportCSV} className="w-full sm:w-auto bg-white border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                <Download className="w-4 h-4" /> Export
              </button>
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
                  <select className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all bg-white font-bold text-gray-700 cursor-pointer text-sm" value={filterProperty} onChange={(e) => setFilterProperty(e.target.value)}>
                    <option value="ALL">Entire Portfolio</option>
                    {uniqueProperties.map((propName: any) => <option key={propName} value={propName}>{propName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1 flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Date Preset</label>
                  <select className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all bg-white font-bold text-gray-700 cursor-pointer text-sm" value={datePreset} onChange={(e) => handleDatePresetChange(e.target.value)}>
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
                  <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1 flex items-center gap-1.5"><CalendarDays className="w-3 h-3" /> Due Date (From)</label>
                  <input type="date" disabled={datePreset !== 'CUSTOM'} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all bg-white font-bold text-gray-700 cursor-pointer text-sm disabled:bg-gray-100 disabled:text-gray-400" value={startDate} onChange={(e) => handleManualDateChange('start', e.target.value)} />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1 flex items-center gap-1.5"><CalendarDays className="w-3 h-3" /> Due Date (To)</label>
                  <input type="date" disabled={datePreset !== 'CUSTOM'} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all bg-white font-bold text-gray-700 cursor-pointer text-sm disabled:bg-gray-100 disabled:text-gray-400" value={endDate} onChange={(e) => handleManualDateChange('end', e.target.value)} />
                </div>
              </div>
            </div>
          )}
          
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
                    <th className="px-6 py-4 pl-8">Tenant / Unit</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4 text-right">Billed</th>
                    <th className="px-6 py-4 text-right">Balance</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right pr-8">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-[#ffffff]">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <div className="w-16 h-16 bg-[#ebf3f5] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#1f8898]">
                          <FileText className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No invoices found</h3>
                        <p className="text-sm text-gray-500 font-medium">Try adjusting your search filters or generate new bills.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => {
                      const alreadyPaid = inv.payments?.reduce((sum: number, p: any) => sum + p.amount_paid, 0) || 0;
                      const balance = inv.amount - alreadyPaid;

                      return (
                        <tr key={inv.id} className="hover:bg-gray-50/50 transition duration-150 group">
                          <td className="px-6 py-4 pl-8">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#ebf3f5] text-[#1f8898] flex items-center justify-center font-black text-sm shrink-0">
                                {inv.tenant.first_name.charAt(0)}{inv.tenant.last_name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 group-hover:text-[#1f8898] transition-colors">{inv.tenant.first_name} {inv.tenant.last_name}</p>
                                <p className="text-[11px] text-gray-500 font-bold tracking-wide mt-0.5 uppercase">{inv.tenant.unit.property.name} • {inv.tenant.unit.unit_number}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-900 font-bold">{inv.description}</p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Due: {new Date(inv.due_date).toLocaleDateString()}</p>
                          </td>
                          <td className="px-6 py-4 text-right text-sm text-gray-500 font-medium">
                            KSH {inv.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-right font-black text-lg text-[#1f8898]">
                            KSH {balance.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                              inv.status === 'PAID' ? 'bg-green-50 text-green-700 border-green-200' :
                              inv.status === 'PARTIAL' || inv.status === 'PARTIALLY_PAID' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                              {inv.status === 'PAID' && <CheckCircle2 className="w-3 h-3" />}
                              {(inv.status === 'PARTIAL' || inv.status === 'PARTIALLY_PAID') && <AlertCircle className="w-3 h-3" />}
                              {inv.status === 'PARTIALLY_PAID' ? 'PARTIAL' : inv.status}
                            </div>
                          </td>
                          <td className="px-6 py-4 pr-8">
                            <div className="flex items-center justify-end gap-2">
                              {inv.status !== 'PAID' ? (
                                <>
                                  <button 
                                    onClick={() => handleDownloadDocument('INVOICE', inv)}
                                    className="p-2 border rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1.5 px-3 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900 border-gray-200"
                                    title="Download PDF Invoice"
                                  >
                                    <Printer className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-black uppercase tracking-widest hidden xl:block">Invoice</span>
                                  </button>

                                  <button 
                                    onClick={() => openReminderModal(inv)}
                                    className="p-2 border rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1.5 px-3 bg-gray-50 text-gray-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                                    title="Send Payment Reminder"
                                  >
                                    <BellRing className="w-3.5 h-3.5" />
                                  </button>
                                  
                                  <button 
                                    onClick={() => handleOpenPaymentModal(inv)} 
                                    className="bg-white border border-gray-200 text-gray-700 font-bold px-4 py-2 rounded-xl hover:border-[#1f8898] hover:text-[#1f8898] transition-all text-xs flex items-center gap-2 active:scale-95 shadow-sm"
                                  >
                                    <CreditCard className="w-3.5 h-3.5" /> Pay
                                  </button>
                                </>
                              ) : (
                                <>
                                  <span className="text-gray-400 font-bold text-xs hidden sm:flex items-center gap-1 mr-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Settled
                                  </span>
                                  <button 
                                    onClick={() => handleDownloadDocument('RECEIPT', inv)}
                                    className="p-2 border rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1.5 px-3 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900 border-gray-200"
                                    title="Download PDF Receipt"
                                  >
                                    <FileCheck className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-black uppercase tracking-widest hidden xl:block">Receipt</span>
                                  </button>
                                </>
                              )}
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

      {/* --- PAYMENT MODAL --- */}
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
              <button onClick={() => !isSubmitting && setIsPaymentModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 pt-5">
              <div className="flex justify-between items-center bg-rose-50 border border-rose-100 p-4 rounded-xl">
                 <p className="text-xs font-black uppercase tracking-widest text-rose-500">Remaining Bal</p>
                 <p className="text-lg font-black text-rose-600">
                   KSH {selectedInvoice.remainingBalance.toLocaleString()}
                 </p>
              </div>
            </div>

            <form onSubmit={handleRecordPayment} className="p-6 space-y-5">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Amount Received (KSH) <span className="normal-case font-medium text-gray-400">(Can be partial)</span></label>
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
                <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="w-full sm:w-auto px-5 py-3 text-sm font-bold text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-100 rounded-xl transition-colors border border-gray-200">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-[#ffffff] bg-[#1f8898] hover:bg-[#1a7684] rounded-xl transition-all shadow-lg shadow-[#1f8898]/20 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {isSubmitting ? 'Processing...' : 'Confirm Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MULTI-CHANNEL REMINDER MODAL --- */}
      {isReminderModalOpen && reminderInvoice && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => !isSubmitting && setIsReminderModalOpen(false)}></div>
          
          <div className="relative w-full max-w-md bg-[#ffffff] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="bg-[#f8fafb] px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 tracking-tight">Dispatch Reminder</h3>
                  <p className="text-xs font-medium text-gray-500">To {reminderInvoice.tenant.first_name} {reminderInvoice.tenant.last_name}</p>
                </div>
              </div>
              <button onClick={() => !isSubmitting && setIsReminderModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="text-center mb-6">
                <p className="text-sm text-gray-600 font-medium">Outstanding Balance</p>
                <h4 className="text-3xl font-black text-rose-600 mt-1">KSH {reminderInvoice.remainingBalance.toLocaleString()}</h4>
              </div>

              <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-3 ml-1 text-center">Select Delivery Channels</label>
              
              <div className="flex flex-col gap-3">
                  <button 
                      type="button" 
                      onClick={() => setReminderChannels(prev => ({ ...prev, email: !prev.email }))}
                      className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                          reminderChannels.email ? 'border-[#1f8898]/30 bg-[#ebf3f5] text-[#1f8898]' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                      <div className={`rounded-full p-1.5 ${reminderChannels.email ? 'bg-[#1f8898] text-white' : 'bg-gray-100 text-gray-400'}`}>
                          {reminderChannels.email ? <CheckCircle2 className="w-3 h-3" /> : <Mail className="w-3 h-3" />}
                      </div>
                      <span className="text-sm font-bold text-left flex-1">Email Notice <span className={`block text-[10px] font-medium uppercase tracking-widest ${reminderChannels.email ? 'opacity-80' : 'text-gray-400'}`}>Official PDF Attached</span></span>
                  </button>

                  <button 
                      type="button" 
                      onClick={() => setReminderChannels(prev => ({ ...prev, sms: !prev.sms }))}
                      className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                          reminderChannels.sms ? 'border-[#1f8898]/30 bg-[#ebf3f5] text-[#1f8898]' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                      <div className={`rounded-full p-1.5 ${reminderChannels.sms ? 'bg-[#1f8898] text-white' : 'bg-gray-100 text-gray-400'}`}>
                          {reminderChannels.sms ? <CheckCircle2 className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
                      </div>
                      <span className="text-sm font-bold text-left flex-1">SMS Text <span className={`block text-[10px] font-medium uppercase tracking-widest ${reminderChannels.sms ? 'opacity-80' : 'text-gray-400'}`}>Direct to phone</span></span>
                  </button>

                  <button 
                      type="button" 
                      onClick={() => setReminderChannels(prev => ({ ...prev, portal: !prev.portal }))}
                      className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                          reminderChannels.portal ? 'border-[#1f8898]/30 bg-[#ebf3f5] text-[#1f8898]' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                      <div className={`rounded-full p-1.5 ${reminderChannels.portal ? 'bg-[#1f8898] text-white' : 'bg-gray-100 text-gray-400'}`}>
                          {reminderChannels.portal ? <CheckCircle2 className="w-3 h-3" /> : <BellRing className="w-3 h-3" />}
                      </div>
                      <span className="text-sm font-bold text-left flex-1">Tenant Portal <span className={`block text-[10px] font-medium uppercase tracking-widest ${reminderChannels.portal ? 'opacity-80' : 'text-gray-400'}`}>System Alert</span></span>
                  </button>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsReminderModalOpen(false)} className="w-full sm:w-auto px-5 py-3 text-sm font-bold text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-100 rounded-xl transition-colors border border-gray-200">
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={executeSendReminder}
                  disabled={isSubmitting || (!reminderChannels.email && !reminderChannels.sms && !reminderChannels.portal)} 
                  className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-[#ffffff] bg-[#1f8898] hover:bg-[#1a7684] rounded-xl transition-all shadow-lg shadow-[#1f8898]/20 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <BellRing className="w-4 h-4" />}
                  {isSubmitting ? 'Sending...' : 'Dispatch Reminder'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}