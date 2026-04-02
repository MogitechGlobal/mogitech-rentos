// apps/web/app/portal/billing/page.tsx
/* eslint-disable */
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    CreditCard, CheckCircle2, Clock, FileWarning,
    Wallet, Receipt, ArrowRight, Loader2, X, Download,
    ShieldCheck, AlertCircle, Smartphone, Landmark,
    CalendarDays, Banknote, Edit3, Search, PieChart,
    TrendingUp, Activity, Filter, Printer, Calendar
} from 'lucide-react';

export default function TenantBillingPage() {
    const router = useRouter();
    const [leaseData, setLeaseData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Advanced UI States
    const [activeTab, setActiveTab] = useState<'invoices' | 'receipts'>('invoices');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filterStatus, setFilterStatus] = useState('ALL');
    
    // Date Filtering
    const [datePreset, setDatePreset] = useState('ALL');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Payment Modal State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [paymentMode, setPaymentMode] = useState<'EXPRESS' | 'MANUAL'>('EXPRESS');

    const [paymentData, setPaymentData] = useState({
        amount_paid: '',
        payment_method: 'MPESA',
        reference_number: '',
        phone: ''
    });

    const fetchLeaseData = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portal/my-lease`, {
                credentials: 'include' 
            });

            if (res.status === 401 || res.status === 403) return router.push('/login');
            if (!res.ok) throw new Error('Failed to load billing details.');

            const data = await res.json();
            setLeaseData(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchLeaseData(); }, [router]);

    // --- ADVANCED DATE FILTERING ---
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

    // --- ADVANCED FRONTEND PDF GENERATOR ---
    const handleDownloadDocument = (type: 'INVOICE' | 'RECEIPT', dataObj: any) => {
        if (!leaseData) return;
        
        const companyName = leaseData.unit?.property?.landlord?.company_name || 'MogiRentOS Management';
        const tenantName = `${leaseData.first_name} ${leaseData.last_name}`;
        const unit = `${leaseData.unit?.property?.name} - Unit ${leaseData.unit?.unit_number}`;

        // Extract variables based on Document Type
        const isInvoice = type === 'INVOICE';
        const docId = isInvoice ? `INV-${dataObj.id.substring(0, 8).toUpperCase()}` : `REC-${dataObj.id.substring(0, 8).toUpperCase()}`;
        const invIdShort = isInvoice ? dataObj.id.substring(0, 8).toUpperCase() : dataObj.invoice_id.substring(0, 8).toUpperCase();
        
        const dateIssuedOrPaid = new Date(dataObj.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        const dueDate = isInvoice ? new Date(dataObj.due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A';
        
        const description = isInvoice ? dataObj.description : dataObj.invoice_description || 'Settlement of Account Balance';
        const paymentMethod = isInvoice ? 'N/A' : (dataObj.payment_method || 'MPESA');
        const refCode = isInvoice ? 'N/A' : (dataObj.reference_number || 'N/A');

        const amountBilled = isInvoice ? Number(dataObj.amount) : Number(dataObj.invoice?.amount || 0);
        const amountPaid = isInvoice ? (dataObj.payments?.reduce((s: number, p: any) => s + Number(p.amount_paid), 0) || 0) : Number(dataObj.amount_paid);
        const balance = isInvoice ? (amountBilled - amountPaid) : 0;

        const isFullyPaid = balance <= 0;
        const isPartial = !isFullyPaid && amountPaid > 0;
        let watermarkText = 'UNPAID';
        if (!isInvoice || isFullyPaid) watermarkText = 'PAID.';
        else if (isPartial) watermarkText = 'PARTIALLY PAID';

        const htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>${type} - ${docId}</title>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap');
                @media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } .watermark { color: rgba(229, 231, 235, 0.45) !important; } }
                body { font-family: 'Inter', sans-serif; color: #111827; padding: 0; margin: 0; background: #ffffff; }
                .a4-container { max-width: 800px; margin: 0 auto; background: #ffffff; position: relative; min-height: 100vh; display: flex; flex-direction: column; }
                .header-container { background-color: #0f3e46 !important; color: #ffffff !important; display: flex; justify-content: space-between; align-items: center; padding: 40px 50px; }
                .company-info h1 { font-size: 32px; font-weight: 800; margin: 0 0 5px 0; color: #ffffff !important; }
                .company-info p { font-size: 13px; color: #cbd5e1 !important; margin: 0; font-weight: 400; }
                .doc-type h2 { font-size: 26px; font-weight: 800; margin: 0; color: #ffffff !important; text-transform: uppercase; letter-spacing: 1px; }
                .content-body { padding: 40px 50px; flex-grow: 1; position: relative; z-index: 10; overflow: hidden; }
                .watermark { position: absolute; top: 45%; left: 50%; transform: translate(-50%, -50%) rotate(-35deg); font-size: ${watermarkText === 'PARTIALLY PAID' ? '90px' : '130px'}; font-weight: 900; color: rgba(229, 231, 235, 0.55); white-space: nowrap; z-index: -1; pointer-events: none; letter-spacing: 5px; }
                .top-section { display: flex; justify-content: space-between; margin-bottom: 40px; position: relative; }
                .billed-to .label { font-size: 11px; color: #111827; font-weight: 800; margin: 0 0 8px 0; }
                .billed-to .name { font-size: 15px; font-weight: 600; margin: 0 0 4px 0; }
                .billed-to .unit { font-size: 14px; color: #4b5563; margin: 0; }
                .meta-table { border-collapse: collapse; }
                .meta-table td { padding: 4px 0 4px 30px; font-size: 13px; }
                .meta-table td:first-child { color: #111827; font-weight: 800; text-align: left; }
                .meta-table td:last-child { font-weight: 400; text-align: left; }
                .line-items { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                .line-items th { background-color: #1f8898 !important; color: #ffffff !important; font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 12px 16px; text-align: left; }
                .line-items td { padding: 16px; font-size: 13px; color: #111827; border-bottom: 1px solid #e5e7eb; }
                .line-items th.right, .line-items td.right { text-align: right; }
                .totals-row td { padding: 16px; font-size: 14px; border-bottom: none; }
                .totals-row .total-label { font-weight: 800; text-align: right; color: #111827; }
                .totals-row .total-val { font-weight: 800; font-size: 16px; text-align: right; color: #111827; }
                .bottom-area { margin-top: 60px; }
                .signature-block { width: 200px; }
                .sig-line { border-top: 2px solid #111827; margin-bottom: 8px; }
                .sig-text { font-size: 12px; color: #111827; font-weight: 800; margin: 0; }
                .footer { background-color: #f3f4f6 !important; text-align: center; padding: 20px 50px; margin-top: auto; }
                .footer p { margin: 0 0 5px 0; font-size: 10px; color: #6b7280; }
                .footer p.powered-by { font-weight: 600; color: #4b5563; margin-bottom: 0; }
              </style>
            </head>
            <body>
              <div class="a4-container">
                <div class="header-container">
                  <div class="company-info">
                    <h1>${companyName}</h1>
                    <p>Automated Property Management</p>
                  </div>
                  <div class="doc-type"><h2>OFFICIAL ${type}</h2></div>
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
                      <tr><td>${isInvoice ? 'Invoice No:' : 'Receipt No:'}</td><td>${docId}</td></tr>
                      <tr><td>${isInvoice ? 'Date Issued:' : 'Date Paid:'}</td><td>${dateIssuedOrPaid}</td></tr>
                      ${!isInvoice ? `<tr><td>Invoice Ref:</td><td>INV-${invIdShort}</td></tr>` : `<tr><td>Due Date:</td><td style="color: #e11d48;">${dueDate}</td></tr>`}
                    </table>
                  </div>
                  <table class="line-items">
                    <thead>
                      <tr>
                        <th>DESCRIPTION</th>
                        ${!isInvoice ? `<th>PAYMENT METHOD</th><th>REFERENCE CODE</th>` : ``}
                        <th class="right">AMOUNT</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>${description}</td>
                        ${!isInvoice ? `<td>${paymentMethod}</td><td>${refCode}</td>` : ``}
                        <td class="right">KSH ${(!isInvoice ? amountPaid : amountBilled).toLocaleString()}</td>
                      </tr>
                      ${isInvoice && amountPaid > 0 ? `
                      <tr>
                        <td colspan="1">Less: Payments Received</td>
                        <td class="right" style="color: #047857;">- KSH ${amountPaid.toLocaleString()}</td>
                      </tr>` : ''}
                      <tr class="totals-row">
                        <td colspan="${!isInvoice ? 3 : 1}" class="total-label">TOTAL ${!isInvoice ? 'PAID' : 'DUE'}:</td>
                        <td class="total-val">KSH ${(!isInvoice ? amountPaid : balance).toLocaleString()}</td>
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
          printIframe.contentWindow?.focus();
          printIframe.contentWindow?.print();
          setTimeout(() => {
            if (document.body.contains(printIframe)) document.body.removeChild(printIframe);
          }, 2000);
        }, 500);
    };

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (paymentMode === 'EXPRESS') {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portal/invoices/${selectedInvoice.id}/mpesa-push`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include', 
                    body: JSON.stringify({ phone: paymentData.phone }) 
                });
                
                if (res.status === 401 || res.status === 403) return router.push('/login');
                if (!res.ok) {
                    const errorObj = await res.json();
                    throw new Error(errorObj.message || 'Failed to initiate prompt.');
                }
                
                alert('Payment Request Sent! Check your phone.');
            } else {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portal/invoices/${selectedInvoice.id}/pay`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }, 
                    credentials: 'include', 
                    body: JSON.stringify({
                        amount_paid: Number(paymentData.amount_paid),
                        payment_method: paymentData.payment_method, // Dynamically mapped
                        reference_number: paymentData.reference_number
                    })
                });
                
                if (res.status === 401 || res.status === 403) return router.push('/login');
                if (!res.ok) throw new Error('Failed to process manual payment.');
                
                alert('Payment recorded successfully! Awaiting verification.');
                fetchLeaseData();
            }

            setIsPaymentModalOpen(false);
            setPaymentData({ amount_paid: '', payment_method: 'MPESA', reference_number: '', phone: '' });
            setSelectedInvoice(null);

        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- DERIVED FINANCIAL ANALYTICS ---
    const analytics = useMemo(() => {
        if (!leaseData) return { outstandingBalance: 0, totalBilled: 0, totalPaid: 0, paymentRate: 0, nextDueDate: null, isOverdue: false, allPayments: [], invoices: [] };
        const invoices = leaseData.invoices || [];
        const totalBilled = invoices.reduce((sum: number, inv: any) => sum + inv.amount, 0);

        let totalPaid = 0;
        const allPayments: any[] = [];

        invoices.forEach((inv: any) => {
            const paidForInvoice = inv.payments?.reduce((pSum: number, p: any) => {
                allPayments.push({ ...p, invoice_description: inv.description, invoice: inv });
                return pSum + p.amount_paid;
            }, 0) || 0;
            totalPaid += paidForInvoice;
        });

        allPayments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        const paymentRate = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0;
        const unpaidInvoices = invoices.filter((i: any) => i.status !== 'PAID').sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
        const nextDueDate = unpaidInvoices.length > 0 ? new Date(unpaidInvoices[0].due_date) : null;
        const isOverdue = nextDueDate && nextDueDate < new Date();

        return {
            outstandingBalance: leaseData.outstandingBalance || 0,
            totalBilled,
            totalPaid,
            paymentRate,
            nextDueDate,
            isOverdue,
            allPayments,
            invoices
        };
    }, [leaseData]);

    const filteredData = useMemo(() => {
        const q = searchQuery.toLowerCase();
        let dataToFilter = activeTab === 'invoices' ? analytics.invoices : analytics.allPayments;

        return dataToFilter.filter((item: any) => {
            const searchStr = activeTab === 'invoices' ? item.description.toLowerCase() : (item.reference_number?.toLowerCase() || item.invoice_description?.toLowerCase());
            const matchesSearch = searchStr.includes(q);
            const matchesStatus = activeTab === 'invoices' ? (filterStatus === 'ALL' || item.status === filterStatus) : true;
            
            const itemDate = new Date(item.created_at || item.due_date).getTime();
            const startObj = startDate ? new Date(startDate).getTime() : 0;
            const endObj = endDate ? new Date(endDate).getTime() + 86399999 : Infinity;
            const matchesStart = !startDate || itemDate >= startObj;
            const matchesEnd = !endDate || itemDate <= endObj;

            return matchesSearch && matchesStatus && matchesStart && matchesEnd;
        });
    }, [analytics, activeTab, searchQuery, filterStatus, startDate, endDate]);

    if (isLoading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-[#f8fafb]">
                <div className="relative">
                    <Loader2 className="w-12 h-12 animate-spin text-[#1f8898]" />
                    <div className="absolute inset-0 blur-xl bg-[#1f8898]/20 animate-pulse"></div>
                </div>
                <p className="text-sm font-bold text-gray-500 mt-4 uppercase tracking-widest">Loading Ledger...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafb] p-6">
                <div className="max-w-md w-full p-8 bg-white border border-rose-100 shadow-xl shadow-rose-100/50 rounded-3xl text-center">
                    <div className="bg-rose-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-rose-100">
                        <AlertCircle className="text-rose-600 w-8 h-8" />
                    </div>
                    <h2 className="text-gray-900 font-black text-2xl mb-2 tracking-tight">Ledger Error</h2>
                    <p className="text-gray-500 font-medium mb-8">{error}</p>
                    <button onClick={() => window.location.reload()} className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-lg shadow-rose-600/20 transition-all active:scale-95">
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    const inputStyle = "w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-gray-50/50 text-gray-900 font-medium text-sm disabled:bg-gray-100 disabled:text-gray-400";
    
    // --- DYNAMIC GATEWAY CONFIGURATIONS ---
    const landlord = leaseData?.unit?.property?.landlord;
    const dynamicShortcode = landlord?.mpesa_shortcode || 'NOT SET';
    const landlordName = landlord?.company_name || 'Property Manager';
    const gatewayType = landlord?.gateway_type || 'MPESA';
    const bankName = landlord?.bank_name || 'KCB';
    const isBankGateway = gatewayType === 'BANK';

    return (
        <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans selection:bg-[#1f8898]/30 overflow-x-hidden">

            <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-6 pt-10 pb-24 relative overflow-hidden shadow-inner">
                <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-teal-100 text-[10px] font-black uppercase tracking-widest mb-4 border border-white/20 backdrop-blur-sm">
                            <Wallet className="w-3.5 h-3.5" /> Billing & Payments
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-[#ffffff] tracking-tight mb-2">
                            Financial Ledger
                        </h1>
                        <p className="text-teal-100 text-sm md:text-base font-medium max-w-xl">
                            Track your lifetime payments, settle outstanding balances securely, and download official receipts.
                        </p>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-12 relative z-20 space-y-6">

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">

                    {/* BALANCE CARD */}
                    <div className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between relative overflow-hidden transition-all duration-300 group hover:-translate-y-1 ${analytics.outstandingBalance > 0 ? 'bg-gradient-to-br from-white to-rose-50 border-rose-100' : 'bg-gradient-to-br from-white to-emerald-50 border-emerald-100'
                        }`}>
                        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-50 ${analytics.outstandingBalance > 0 ? 'bg-rose-200' : 'bg-emerald-200'}`}></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${analytics.outstandingBalance > 0 ? 'bg-rose-100 text-rose-600 border-rose-200' : 'bg-emerald-100 text-emerald-600 border-emerald-200'
                                    }`}>
                                    <Banknote className="w-5 h-5" />
                                </div>
                                {analytics.outstandingBalance > 0 ? (
                                    <span className="bg-rose-600 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest animate-pulse shadow-sm">Due Now</span>
                                ) : (
                                    <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border border-emerald-200">Cleared</span>
                                )}
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Outstanding Balance</p>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-sm font-black text-gray-400">KSH</span>
                                <span className={`text-2xl lg:text-3xl font-black tracking-tight ${analytics.outstandingBalance > 0 ? 'text-rose-600' : 'text-gray-900'}`}>
                                    {analytics.outstandingBalance.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* TOTAL PAID CARD */}
                    <div className="bg-[#ffffff] p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all">
                        <div>
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 mb-4">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Paid (Lifetime)</p>
                            <p className="text-2xl lg:text-3xl font-black text-gray-900 leading-tight tracking-tight">
                                <span className="text-sm text-gray-400 font-bold mr-1">KSH</span>{analytics.totalPaid.toLocaleString()}
                            </p>
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

                    {/* TOTAL BILLED CARD */}
                    <div className="bg-[#ffffff] p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all">
                        <div>
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 mb-4">
                                <PieChart className="w-5 h-5" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Billed (Lifetime)</p>
                            <p className="text-2xl lg:text-3xl font-black text-gray-900 leading-tight tracking-tight">
                                <span className="text-sm text-gray-400 font-bold mr-1">KSH</span>{analytics.totalBilled.toLocaleString()}
                            </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Activity className="w-3.5 h-3.5 text-blue-500" /> Across {analytics.invoices.length} total invoices
                            </p>
                        </div>
                    </div>

                    {/* NEXT DUE DATE CARD */}
                    <div className="bg-[#ffffff] p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 border border-gray-100">
                                    <CalendarDays className="w-5 h-5" />
                                </div>
                                {analytics.isOverdue && (
                                    <span className="bg-rose-50 text-rose-600 border border-rose-100 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">Late</span>
                                )}
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Next Payment Due</p>
                            <p className={`text-xl lg:text-2xl font-black leading-tight tracking-tight ${analytics.isOverdue ? 'text-rose-600' : 'text-gray-900'}`}>
                                {analytics.nextDueDate ? analytics.nextDueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No pending bills'}
                            </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Late fees apply after due date
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-[#ffffff] rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">

                    <div className="flex flex-col xl:flex-row items-center justify-between border-b border-gray-100 bg-gray-50/50 pr-4 shrink-0">
                        <div className="flex w-full xl:w-auto">
                            <button
                                onClick={() => setActiveTab('invoices')}
                                className={`flex-1 sm:flex-none px-6 py-5 text-xs md:text-sm font-black uppercase tracking-widest transition-all border-b-2 flex items-center justify-center gap-2
                                    ${activeTab === 'invoices' ? `border-[#1f8898] text-[#1f8898] bg-white` : 'border-transparent text-gray-400 hover:text-gray-600'}
                                `}
                            >
                                <Receipt className="w-4 h-4" /> All Invoices
                            </button>
                            <button
                                onClick={() => setActiveTab('receipts')}
                                className={`flex-1 sm:flex-none px-6 py-5 text-xs md:text-sm font-black uppercase tracking-widest transition-all border-b-2 flex items-center justify-center gap-2
                                    ${activeTab === 'receipts' ? `border-[#1f8898] text-[#1f8898] bg-white` : 'border-transparent text-gray-400 hover:text-gray-600'}
                                `}
                            >
                                <Download className="w-4 h-4" /> Receipts
                            </button>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-3 p-4 xl:p-0 w-full xl:w-auto">
                            <button onClick={() => setShowFilters(!showFilters)} className={`w-full sm:w-auto border px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-95 ${showFilters ? 'bg-[#1f8898] text-white border-[#1f8898]' : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'}`}>
                                <Filter className="w-4 h-4" /> Filters
                            </button>

                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search ledger..."
                                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all text-sm font-medium"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            
                            {activeTab === 'invoices' && (
                                <select className="w-full sm:w-auto border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-gray-700 outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all bg-[#ffffff] cursor-pointer" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                    <option value="ALL">All Statuses</option>
                                    <option value="PAID">Fully Paid</option>
                                    <option value="PARTIAL">Partially Paid</option>
                                    <option value="UNPAID">Unpaid</option>
                                </select>
                            )}
                        </div>
                    </div>

                    {showFilters && (
                        <div className="bg-gray-50 border-b border-gray-100 p-5 md:px-8 animate-in slide-in-from-top-2 duration-200">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Advanced Date Controls</h4>
                                <button onClick={() => { handleDatePresetChange('ALL'); }} className="text-xs font-bold text-[#1f8898] hover:underline">Clear Dates</button>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
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
                                    <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1 flex items-center gap-1.5"><CalendarDays className="w-3 h-3" /> Filter Date (From)</label>
                                    <input type="date" disabled={datePreset !== 'CUSTOM'} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all bg-white font-bold text-gray-700 cursor-pointer text-sm disabled:bg-gray-100 disabled:text-gray-400" value={startDate} onChange={(e) => handleManualDateChange('start', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1 flex items-center gap-1.5"><CalendarDays className="w-3 h-3" /> Filter Date (To)</label>
                                    <input type="date" disabled={datePreset !== 'CUSTOM'} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all bg-white font-bold text-gray-700 cursor-pointer text-sm disabled:bg-gray-100 disabled:text-gray-400" value={endDate} onChange={(e) => handleManualDateChange('end', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="overflow-x-auto relative z-0 flex-1">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="bg-white border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-400 font-black sticky top-0">
                                    <th className="px-6 md:px-8 py-4 align-middle">{activeTab === 'invoices' ? 'Invoice Description' : 'Reference / Method'}</th>
                                    <th className="px-6 py-4 align-middle">{activeTab === 'invoices' ? 'Date Issued' : 'Date Paid'}</th>
                                    <th className="px-6 py-4 text-right align-middle">{activeTab === 'invoices' ? 'Billed' : 'Amount (KSH)'}</th>
                                    {activeTab === 'invoices' && <th className="px-6 py-4 text-right align-middle">Balance</th>}
                                    <th className="px-6 md:px-8 py-4 text-center align-middle">{activeTab === 'invoices' ? 'Status & Action' : 'Action'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 bg-white">
                                {filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-16 text-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                                                {activeTab === 'invoices' ? <Receipt className="w-8 h-8 text-gray-300" /> : <Download className="w-8 h-8 text-gray-300" />}
                                            </div>
                                            <h3 className="text-gray-900 font-black text-lg mb-1">No records found.</h3>
                                            <p className="text-sm font-medium text-gray-500">Your ledger is currently empty for this view.</p>
                                        </td>
                                    </tr>
                                ) : activeTab === 'invoices' ? (
                                    filteredData.map((inv: any) => {
                                        const alreadyPaid = inv.payments?.reduce((sum: number, p: any) => sum + p.amount_paid, 0) || 0;
                                        const balance = inv.amount - alreadyPaid;
                                        const isPartial = inv.status === 'PARTIAL' || inv.status === 'PARTIALLY_PAID';

                                        return (
                                        <tr key={inv.id} className="hover:bg-gray-50/80 transition duration-150 group">
                                            <td className="px-6 md:px-8 py-4 align-middle">
                                                <div className="font-bold text-gray-900 text-sm group-hover:text-[#1f8898] transition-colors">{inv.description}</div>
                                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">INV-{inv.id.substring(0, 8).toUpperCase()}</div>
                                            </td>
                                            <td className="px-6 py-4 align-middle">
                                                <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
                                                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                    {new Date(inv.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right align-middle text-sm text-gray-500 font-medium">
                                                KSH {inv.amount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right align-middle font-black text-lg text-[#1f8898]">
                                                KSH {balance.toLocaleString()}
                                            </td>
                                            <td className="px-6 md:px-8 py-4 text-right align-middle">
                                                <div className="flex items-center justify-end gap-2">
                                                    <div className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest border ${
                                                        inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                                                        isPartial ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                                                        'bg-rose-50 text-rose-700 border-rose-200'
                                                    }`}>
                                                        {inv.status === 'PAID' && <CheckCircle2 className="w-3 h-3" />}
                                                        {isPartial && <AlertCircle className="w-3 h-3" />}
                                                        {inv.status === 'UNPAID' && <FileWarning className="w-3 h-3" />}
                                                        {isPartial ? 'PARTIAL' : inv.status}
                                                    </div>
                                                    
                                                    <button 
                                                        onClick={() => handleDownloadDocument('INVOICE', inv)}
                                                        className="p-2 border rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1.5 px-3 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900 border-gray-200"
                                                        title="Download PDF Invoice"
                                                    >
                                                        <Printer className="w-3.5 h-3.5" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest hidden xl:block">Invoice</span>
                                                    </button>

                                                    {inv.status !== 'PAID' && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedInvoice(inv);
                                                                setPaymentData(prev => ({ ...prev, amount_paid: balance.toString() }));
                                                                setIsPaymentModalOpen(true);
                                                            }}
                                                            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded-xl shadow-sm transition-all active:scale-95"
                                                        >
                                                            <CreditCard className="w-3.5 h-3.5" /> Pay
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )})
                                ) : (
                                    filteredData.map((payment: any) => (
                                        <tr key={payment.id} className="hover:bg-gray-50/80 transition duration-150 group">
                                            <td className="px-6 md:px-8 py-4 align-middle">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${payment.payment_method === 'MPESA' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                                                        }`}>
                                                        {payment.payment_method === 'MPESA' ? <Smartphone className="w-4 h-4" /> : <Landmark className="w-4 h-4" />}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 text-sm tracking-tight">{payment.reference_number || 'Cash/Manual'}</div>
                                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{payment.invoice_description}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 align-middle">
                                                <div className="text-sm font-medium text-gray-600">
                                                    {new Date(payment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right align-middle font-black text-gray-900 text-base">
                                                KSH {payment.amount_paid.toLocaleString()}
                                            </td>
                                            <td className="px-6 md:px-8 py-4 text-right align-middle">
                                                <div className="flex items-center justify-end gap-3">
                                                    <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                        <CheckCircle2 className="w-3 h-3" /> Settled
                                                    </span>
                                                    <button
                                                        onClick={() => handleDownloadDocument('RECEIPT', payment)}
                                                        className="p-2 border rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1.5 px-3 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900 border-gray-200"
                                                    >
                                                        <Download className="w-3.5 h-3.5" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest hidden xl:block">Receipt</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>

            {/* --- UNIFIED GATEWAY PAYMENT MODAL --- */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#ffffff] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 flex flex-col">

                        <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-gray-200 text-[#1f8898] shadow-sm">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black tracking-tight text-gray-900">Make Payment</h2>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">To: {landlordName}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsPaymentModalOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex border-b border-gray-100 bg-gray-50/50 p-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setPaymentMode('EXPRESS')}
                                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${paymentMode === 'EXPRESS' ? 'bg-[#1f8898] shadow-sm border border-[#1f8898] text-white' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <Smartphone className="w-4 h-4" /> Pay via STK Push
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMode('MANUAL')}
                                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${paymentMode === 'MANUAL' ? 'bg-[#1f8898] shadow-sm border border-[#1f8898] text-white' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <Edit3 className="w-4 h-4" /> Manual Entry
                            </button>
                        </div>

                        <form onSubmit={handlePaymentSubmit} className="p-6 md:p-8 space-y-5">

                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2 ml-1 flex justify-between">
                                    <span>Amount to Pay (KSH)</span>
                                    {paymentMode === 'EXPRESS' && <span className="text-[#1f8898]">(Full settlement required)</span>}
                                </label>
                                <div className="relative">
                                    <span className={`absolute left-4 top-3.5 font-black text-sm ${paymentMode === 'EXPRESS' ? 'text-gray-300' : 'text-gray-400'}`}>KSH</span>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        max={selectedInvoice ? (selectedInvoice.amount - selectedInvoice.payments.reduce((acc: number, p: any) => acc + p.amount_paid, 0)) : undefined}
                                        disabled={paymentMode === 'EXPRESS'} // Lock amount for backend STK Push
                                        className={`${inputStyle} pl-14 text-lg font-black`}
                                        value={paymentData.amount_paid}
                                        onChange={(e) => setPaymentData({ ...paymentData, amount_paid: e.target.value })}
                                    />
                                </div>
                            </div>

                            {paymentMode === 'MANUAL' ? (
                                <>
                                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl mb-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-1">Direct Payment Instructions</p>
                                        {isBankGateway ? (
                                            <>
                                                <p className="text-xs text-amber-800 font-medium">1. Open your <strong>{bankName}</strong> App or M-Pesa Paybill.</p>
                                                <p className="text-xs text-amber-800 font-medium">2. Enter Biller / Business No: <strong className="font-black text-[#1f8898]">{dynamicShortcode}</strong></p>
                                                <p className="text-xs text-amber-800 font-medium">3. Enter Account No: <strong className="font-black text-[#1f8898]">{leaseData?.unit?.unit_number || 'YOUR_UNIT'}</strong></p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-xs text-amber-800 font-medium">1. Go to M-Pesa Menu &gt; Lipa na M-Pesa &gt; Paybill</p>
                                                <p className="text-xs text-amber-800 font-medium">2. Enter Business No: <strong className="font-black text-[#1f8898]">{dynamicShortcode}</strong></p>
                                                <p className="text-xs text-amber-800 font-medium">3. Enter Account No: <strong className="font-black text-[#1f8898]">{leaseData?.unit?.unit_number || 'YOUR_UNIT'}</strong></p>
                                            </>
                                        )}
                                        <p className="text-xs text-amber-800 font-medium mt-2">Wait for the confirmation SMS, then enter the transaction code below.</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2 ml-1">Payment Method</label>
                                            <select 
                                                className={`${inputStyle} cursor-pointer`}
                                                value={paymentData.payment_method}
                                                onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })}
                                            >
                                                <option value="MPESA">M-Pesa</option>
                                                <option value="BANK_TRANSFER">Bank Transfer</option>
                                                <option value="CASH">Cash</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2 ml-1">Transaction Reference Code</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. NLJ7RT61CQ"
                                                className={`${inputStyle} uppercase`}
                                                value={paymentData.reference_number}
                                                onChange={(e) => setPaymentData({ ...paymentData, reference_number: e.target.value.toUpperCase() })}
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2 ml-1">M-Pesa Phone Number</label>
                                    <input
                                        type="tel"
                                        required
                                        placeholder="e.g. 0712345678"
                                        className={inputStyle}
                                        value={paymentData.phone}
                                        onChange={(e) => setPaymentData({ ...paymentData, phone: e.target.value })}
                                    />
                                    <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-wide">A PIN prompt will securely appear on your phone.</p>
                                </div>
                            )}

                            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsPaymentModalOpen(false)}
                                    className="px-5 py-3 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex items-center justify-center gap-2 px-6 py-3 w-full sm:w-auto rounded-xl font-bold text-sm text-[#ffffff] bg-[#1f8898] hover:bg-[#1a7684] shadow-lg shadow-[#1f8898]/20 transition-all disabled:opacity-60 active:scale-95"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                    {paymentMode === 'MANUAL' ? 'Record Payment' : 'Send Prompt'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}