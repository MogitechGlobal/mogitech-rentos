// apps/web/app/super-admin/billing/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    Loader2, Search, Clock, CreditCard,
    CheckCircle2, AlertCircle, Calendar,
    Filter, Download, TrendingUp, Building2,
    ShieldAlert, AlertTriangle, Send, Printer, FileCheck,
    RefreshCw, X, Mail, Smartphone, BellRing
} from 'lucide-react';

export default function PlatformBillingPage() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // --- ADVANCED FILTERS STATE ---
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [dateFilter, setDateFilter] = useState('ALL');
    const [isSyncing, setIsSyncing] = useState(false);

    // --- RECONCILIATION MODAL STATE ---
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentData, setPaymentData] = useState({ payment_method: 'MPESA', reference_number: '' });

    // --- NOTIFICATION & DISPATCH STATE ---
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
    const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
    const [selectedReminderInvoice, setSelectedReminderInvoice] = useState<any>(null);
    const [isBulkReminderModalOpen, setIsBulkReminderModalOpen] = useState(false);
    
    // FIXED: Default all channels to FALSE so the user explicitly selects what they want
    const [dispatchChannels, setDispatchChannels] = useState({ email: false, whatsapp: false, portal: false });

    const fetchInvoices = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/billing`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setInvoices(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchInvoices(); }, []);

    // ==========================================
    // ACTION HANDLERS
    // ==========================================

    const openPaymentModal = (invoice: any) => {
        setSelectedInvoice(invoice);
        setPaymentData({ payment_method: 'MPESA', reference_number: '' });
        // FIXED: Reset channels to unselected when modal opens
        setDispatchChannels({ email: false, whatsapp: false, portal: false }); 
        setIsPaymentModalOpen(true);
    };

    const handleRecordPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (paymentData.payment_method !== 'CASH' && !paymentData.reference_number) {
            alert('A Transaction Reference Number is required for M-Pesa or Bank transfers.');
            return;
        }

        const channels = [];
        if (dispatchChannels.email) channels.push('EMAIL');
        if (dispatchChannels.whatsapp) channels.push('WHATSAPP');
        if (dispatchChannels.portal) channels.push('PORTAL');

        setIsSubmitting(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/billing/${selectedInvoice.id}/mark-paid`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ ...paymentData, channels }) 
            });
            if (!res.ok) throw new Error('Failed to mark as paid');
            
            alert('Payment recorded successfully! A receipt has been dispatched via the selected channels.');
            setIsPaymentModalOpen(false);
            fetchInvoices();
        } catch (err) {
            alert('Failed to process payment.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openReminderModal = (invoice: any) => {
        setSelectedReminderInvoice(invoice);
        // FIXED: Reset channels to unselected when modal opens
        setDispatchChannels({ email: false, whatsapp: false, portal: false }); 
        setIsReminderModalOpen(true);
    };

    const executeRemind = async () => {
        const channels = [];
        if (dispatchChannels.email) channels.push('EMAIL');
        if (dispatchChannels.whatsapp) channels.push('WHATSAPP');
        if (dispatchChannels.portal) channels.push('PORTAL');

        if (channels.length === 0) return alert('Please select at least one channel.');

        setIsSubmitting(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/billing/${selectedReminderInvoice.id}/remind`, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ channels }),
                credentials: 'include' 
            });
            if (res.ok) alert('Reminder dispatched successfully to Landlord.');
            else alert('Failed to send reminder.');
        } catch (err) { alert('Failed to send reminder'); }
        finally {
            setIsSubmitting(false);
            setIsReminderModalOpen(false);
        }
    };

    const openBulkReminderModal = () => {
        // FIXED: Reset channels to unselected when modal opens
        setDispatchChannels({ email: false, whatsapp: false, portal: false }); 
        setIsBulkReminderModalOpen(true);
    };

    const executeRemindAll = async () => {
        const channels = [];
        if (dispatchChannels.email) channels.push('EMAIL');
        if (dispatchChannels.whatsapp) channels.push('WHATSAPP');
        if (dispatchChannels.portal) channels.push('PORTAL');

        if (channels.length === 0) return alert('Select at least one channel');

        setIsSubmitting(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/billing/remind-all`, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ channels }),
                credentials: 'include' 
            });
            if (res.ok) alert('Bulk reminders dispatched successfully.');
            else alert('Failed to send bulk reminders.');
        } catch (err) { alert('Failed to send bulk reminders'); }
        finally {
            setIsSubmitting(false);
            setIsBulkReminderModalOpen(false);
        }
    };

    const handleSyncPrices = async () => {
        setIsSyncing(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/billing/sync-prices`, { method: 'POST', credentials: 'include' });
            const data = await res.json();
            alert(data.message);
            fetchInvoices(); 
        } catch (err) { 
            alert('Failed to synchronize prices'); 
        } finally {
            setIsSyncing(false);
        }
    };

    const handleSuspend = async (landlordId: string) => {
        if (!confirm('Are you sure you want to SUSPEND this landlord? This will disable their access and their tenants access immediately.')) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/billing/suspend/${landlordId}`, { method: 'POST', credentials: 'include' });
            if (res.ok) alert('Landlord account suspended successfully.');
            fetchInvoices();
        } catch (err) {
            alert('Failed to suspend landlord.');
        }
    };

    // ==========================================
    // PDF INVOICE / RECEIPT GENERATOR
    // ==========================================
    const handleDownloadDocument = (type: 'INVOICE' | 'RECEIPT', invoice: any) => {
        setStatusMsg({ type: 'info', text: `Generating ${type}...` });

        const companyName = 'MogiRentOS Infrastructure';
        const clientName = invoice.landlord?.company_name || 'Landlord';
        const clientEmail = invoice.landlord?.user?.email || 'N/A';
        const clientPhone = invoice.landlord?.contact_phone || 'N/A';
        
        const shortId = `${type === 'INVOICE' ? 'INV' : 'REC'}-${invoice.id.substring(0, 8).toUpperCase()}`;
        const dateIssuedOrPaid = new Date(type === 'INVOICE' ? invoice.created_at : invoice.paid_at || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        const dueDate = new Date(invoice.due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

        let watermarkText = 'UNPAID';
        if (invoice.status === 'PAID') watermarkText = 'PAID IN FULL';
        else if (invoice.status === 'OVERDUE') watermarkText = 'OVERDUE';

        const methodDisplay = invoice.payment_method === 'BANK_TRANSFER' ? 'Bank Transfer' : invoice.payment_method === 'MPESA' ? 'M-Pesa' : invoice.payment_method || 'N/A';

        const htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>${type} - ${shortId}</title>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap');
                @media print {
                  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                  .watermark { color: rgba(229, 231, 235, 0.45) !important; }
                }
                body { font-family: 'Inter', sans-serif; color: #111827; padding: 0; margin: 0; background: #ffffff; }
                .a4-container { max-width: 800px; margin: 0 auto; background: #ffffff; position: relative; min-height: 100vh; display: flex; flex-direction: column; }
                
                .header-container { background-color: #0f3e46 !important; color: #ffffff !important; display: flex; justify-content: space-between; align-items: center; padding: 40px 50px; }
                .company-info h1 { font-size: 32px; font-weight: 900; margin: 0 0 5px 0; color: #ffffff !important; }
                .company-info p { font-size: 13px; color: #cbd5e1 !important; margin: 0; font-weight: 400; }
                .doc-type h2 { font-size: 24px; font-weight: 900; margin: 0; color: #ffffff !important; text-transform: uppercase; letter-spacing: 1px; }
    
                .content-body { padding: 40px 50px; flex-grow: 1; position: relative; z-index: 10; overflow: hidden; }
                .watermark { position: absolute; top: 45%; left: 50%; transform: translate(-50%, -50%) rotate(-35deg); font-size: ${watermarkText === 'PAID IN FULL' ? '100px' : '130px'}; font-weight: 900; color: rgba(229, 231, 235, 0.55); white-space: nowrap; z-index: -1; pointer-events: none; letter-spacing: 5px; }
    
                .top-section { display: flex; justify-content: space-between; margin-bottom: 40px; position: relative; }
                .billed-to .label { font-size: 11px; color: #111827; font-weight: 800; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;}
                .billed-to .name { font-size: 16px; font-weight: 800; margin: 0 0 4px 0; }
                .billed-to .unit { font-size: 13px; color: #4b5563; margin: 0 0 2px 0; }
                
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
                .totals-row .total-val { font-weight: 900; font-size: 18px; text-align: right; color: #1f8898; }
    
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
                    <p>SaaS Subscription Billing</p>
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
                      <p class="name">${clientName}</p>
                      <p class="unit">${clientEmail}</p>
                      <p class="unit">${clientPhone}</p>
                    </div>
                    <table class="meta-table">
                      <tr>
                        <td>${type === 'INVOICE' ? 'Invoice No:' : 'Receipt No:'}</td>
                        <td>${shortId}</td>
                      </tr>
                      <tr>
                        <td>${type === 'INVOICE' ? 'Date Issued:' : 'Date Paid:'}</td>
                        <td>${dateIssuedOrPaid}</td>
                      </tr>
                      ${type === 'RECEIPT' ? `
                      <tr>
                        <td>Payment Method:</td>
                        <td>${methodDisplay}</td>
                      </tr>
                      <tr>
                        <td>Reference Code:</td>
                        <td>${invoice.reference_number || 'N/A'}</td>
                      </tr>
                      ` : `
                      <tr>
                        <td>Due Date:</td>
                        <td style="color: #e11d48; font-weight: 800;">${dueDate}</td>
                      </tr>
                      `}
                    </table>
                  </div>
    
                  <table class="line-items">
                    <thead>
                      <tr>
                        <th>DESCRIPTION</th>
                        <th>BILLING PERIOD</th>
                        <th class="right">AMOUNT</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>MogiRentOS ${invoice.plan_name}</strong><br/><span style="font-size:11px; color:#6b7280;">SaaS Platform Subscription</span></td>
                        <td>${invoice.billing_period}</td>
                        <td class="right">KSH ${invoice.amount.toLocaleString()}</td>
                      </tr>
                      <tr class="totals-row">
                        <td colspan="2" class="total-label">TOTAL ${type === 'RECEIPT' ? 'PAID' : 'DUE'}:</td>
                        <td class="total-val">KSH ${invoice.amount.toLocaleString()}</td>
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
                  <p>This is a computer-generated document and does not require a physical signature.</p>
                  <p>Generated via MogiRentOS on ${new Date().toLocaleString()}</p>
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
        const headers = ['Landlord/Company', 'Plan', 'Billing Cycle', 'Due Date', 'Amount (KSH)', 'Status', 'Payment Method', 'Reference', 'Paid At'];
        const csvRows = filteredInvoices.map(inv => [
            `"${inv.landlord.company_name}"`,
            `"${inv.plan_name}"`,
            `"${inv.billing_period}"`,
            `"${new Date(inv.due_date).toLocaleDateString()}"`,
            inv.amount,
            `"${inv.status}"`,
            `"${inv.payment_method || 'N/A'}"`,
            `"${inv.reference_number || 'N/A'}"`,
            `"${inv.paid_at ? new Date(inv.paid_at).toLocaleDateString() : 'N/A'}"`
        ].join(','));

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...csvRows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `SaaS_Platform_Billing_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // ==========================================
    // CLIENT-SIDE FILTERING & METRICS
    // ==========================================
    const filteredInvoices = useMemo(() => {
        let result = invoices;
        if (searchQuery) {
            const lower = searchQuery.toLowerCase();
            result = result.filter(i => 
                i.landlord?.company_name?.toLowerCase().includes(lower) ||
                i.plan_name?.toLowerCase().includes(lower) ||
                i.id.toLowerCase().includes(lower) ||
                i.reference_number?.toLowerCase().includes(lower)
            );
        }
        if (statusFilter !== 'ALL') {
            result = result.filter(i => i.status === statusFilter);
        }
        if (dateFilter !== 'ALL') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            result = result.filter(i => {
                const due = new Date(i.due_date);
                switch (dateFilter) {
                    case 'TODAY': return due.getTime() === today.getTime();
                    case 'THIS_MONTH': return due.getMonth() === today.getMonth() && due.getFullYear() === today.getFullYear();
                    default: return true;
                }
            });
        }
        return result;
    }, [invoices, searchQuery, statusFilter, dateFilter]);

    const currentMonthInvoices = invoices.filter(i => {
        const d = new Date(i.due_date);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const mrr = currentMonthInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const collected = currentMonthInvoices.filter(i => i.status === 'PAID').reduce((sum, inv) => sum + inv.amount, 0);
    const outstanding = mrr - collected;
    const overdueCount = invoices.filter(i => i.status === 'OVERDUE').length;

    return (
        <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans selection:bg-[#1f8898]/30 overflow-x-hidden">
            {/* Premium Gradient Hero Area */}
            <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-6 pt-8 pb-20 relative overflow-hidden shadow-inner">
                <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-teal-100 text-[10px] font-black uppercase tracking-widest mb-4 border border-white/20 backdrop-blur-sm">
                            <CreditCard className="w-3.5 h-3.5" /> Finance & Revenue
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-[#ffffff] tracking-tight mb-2">
                            SaaS Billing Engine
                        </h1>
                        <p className="text-teal-100 text-sm md:text-base font-medium max-w-xl leading-relaxed">
                            Monitor Monthly Recurring Revenue (MRR), manage landlord subscriptions, and reconcile payments with PDF receipts.
                        </p>
                    </div>
                </div>
            </div>

            <main className="max-w-[1400px] mx-auto px-4 sm:px-6 -mt-10 relative z-20 space-y-6">
                
                {/* --- NOTIFICATION TOAST --- */}
                {statusMsg && (
                    <div className={`p-4 rounded-2xl flex items-center gap-3 shadow-lg animate-in fade-in slide-in-from-top-4 border
                        ${statusMsg.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                        statusMsg.type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800' :
                        'bg-red-50 border-red-200 text-red-800'}
                    `}>
                        {statusMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> :
                        statusMsg.type === 'info' ? <Loader2 className="w-5 h-5 shrink-0 animate-spin" /> :
                        <AlertCircle className="w-5 h-5 shrink-0" />}
                        <span className="font-bold text-sm">{statusMsg.text}</span>
                    </div>
                )}

                {/* Analytics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 text-right leading-tight">Projected<br/>MRR</span>
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">KSH {mrr.toLocaleString()}</h4>
                            <p className="text-xs text-gray-500 font-medium mt-1">Expected this month</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 text-right leading-tight">Collected<br/>Revenue</span>
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">KSH {collected.toLocaleString()}</h4>
                            <p className="text-xs text-gray-500 font-medium mt-1">Realized this month</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 text-right leading-tight">Pending<br/>Collection</span>
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">KSH {outstanding.toLocaleString()}</h4>
                            <p className="text-xs text-gray-500 font-medium mt-1">Outstanding this month</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center group hover:-translate-y-1 transition-all">
                        <div className="flex justify-between items-end mb-4">
                            <div className="flex items-center gap-2">
                                <ShieldAlert className="w-5 h-5 text-rose-500" />
                                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Overdue</p>
                            </div>
                            <p className="text-3xl font-black text-rose-600 tracking-tight">{overdueCount}</p>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden border border-gray-200">
                            <div className="h-full rounded-full transition-all duration-1000 bg-rose-500" style={{ width: `${Math.min(overdueCount * 5, 100)}%` }}></div>
                        </div>
                        <p className="text-xs text-gray-500 font-medium mt-3 text-center">Accounts Risking Suspension</p>
                    </div>
                </div>

                {/* Main Table Interface */}
                <div className="bg-white rounded-3xl shadow-lg shadow-black/5 border border-gray-100 overflow-hidden flex flex-col min-h-[500px] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                    <div className="p-4 md:p-5 border-b border-gray-100 bg-[#f8fafb]/50 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 w-full xl:w-auto">
                            <div className="flex items-center gap-2 border-b sm:border-b-0 sm:border-r border-gray-200 pb-3 sm:pb-0 pr-0 sm:pr-3 w-full sm:w-auto">
                                <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                                <select 
                                    className="text-[10px] font-black text-gray-700 bg-transparent outline-none cursor-pointer uppercase tracking-widest hover:text-[#1f8898] transition-colors w-full sm:w-auto"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="ALL">All Statuses</option>
                                    <option value="PAID">Fully Paid</option>
                                    <option value="UNPAID">Pending</option>
                                    <option value="OVERDUE">Overdue</option>
                                </select>
                            </div>
                            
                            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 sm:py-1.5 shadow-sm hover:border-[#1f8898]/50 transition-colors w-full sm:w-auto">
                                <Calendar className="w-3.5 h-3.5 text-[#1f8898] shrink-0" />
                                <select 
                                    className="text-[10px] font-black text-gray-700 bg-transparent outline-none cursor-pointer uppercase tracking-widest w-full sm:w-auto"
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                >
                                    <option value="ALL">All Time</option>
                                    <option value="THIS_MONTH">This Month</option>
                                    <option value="TODAY">Due Today</option>
                                </select>
                            </div>
                        </div>

                        {/* --- SEARCH & EXPORT ACTIONS --- */}
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
                            <div className="relative w-full sm:w-64">
                                <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3" />
                                <input 
                                    type="text" placeholder="Search company or invoice..." 
                                    className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-2.5 text-sm font-medium outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all bg-white shadow-sm"
                                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <button
                                onClick={handleSyncPrices}
                                disabled={isSyncing}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 shrink-0 active:scale-95"
                            >
                                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                                <span className="hidden lg:block">{isSyncing ? 'Syncing...' : 'Sync Prices'}</span>
                            </button>

                            <button
                                onClick={openBulkReminderModal}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 transition-colors shadow-sm shrink-0 active:scale-95"
                            >
                                <Send className="w-4 h-4" />
                                <span className="hidden lg:block">Remind All</span>
                            </button>

                            <button
                                onClick={handleExportCSV}
                                disabled={filteredInvoices.length === 0}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed shrink-0 active:scale-95"
                            >
                                <Download className="w-4 h-4" />
                                <span className="hidden lg:block">Export</span>
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto flex-1 bg-gray-50/30 p-0 md:p-6">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full text-[#1f8898] gap-4 py-20">
                                <Loader2 className="w-8 h-8 animate-spin" />
                                <span className="font-bold text-sm uppercase tracking-widest text-gray-400">Loading Billing Data...</span>
                            </div>
                        ) : filteredInvoices.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-20">
                                <div className="w-16 h-16 bg-white border border-gray-200 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                                    <FileCheck className="w-8 h-8 text-gray-300" />
                                </div>
                                <h3 className="text-gray-900 font-black text-lg mb-1">No Invoices Found</h3>
                                <p className="text-sm font-medium text-gray-500">Wait for the next billing cycle or adjust your filters.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse whitespace-nowrap bg-white border border-gray-100 sm:rounded-2xl overflow-hidden shadow-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-[#f8fafb] text-[10px] uppercase tracking-widest text-gray-400 font-black">
                                        <th className="px-6 py-4 pl-8">Landlord Account</th>
                                        <th className="px-6 py-4">Billing Period</th>
                                        <th className="px-6 py-4">Amount & Plan</th>
                                        <th className="px-6 py-4">Status & Payment Info</th>
                                        <th className="px-6 py-4 text-right pr-8">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredInvoices.map((inv) => (
                                        <tr key={inv.id} className="hover:bg-gray-50/50 transition duration-150 group">
                                            <td className="px-6 py-4 pl-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-[#ebf3f5] text-[#1f8898] flex items-center justify-center font-black text-sm shrink-0 border border-[#1f8898]/10">
                                                        <Building2 className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 group-hover:text-[#1f8898] transition-colors truncate max-w-[200px]">
                                                            {inv.landlord?.company_name}
                                                        </p>
                                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">INV-{inv.id.substring(0, 6)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-gray-900 text-sm mb-1">{inv.billing_period}</p>
                                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                                                    <Clock className="w-3 h-3" /> Due {new Date(inv.due_date).toLocaleDateString()}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-black text-gray-900 text-sm mb-1">
                                                    <span className="text-gray-400 font-bold text-xs mr-1">KSH</span>
                                                    {inv.amount.toLocaleString()}
                                                </p>
                                                
                                                {/* DYNAMIC 5-TIER COLOR BADGES */}
                                                <p className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border inline-flex items-center gap-1.5
                                                    ${inv.plan_name?.includes('ENTERPRISE') ? 'bg-gray-900 text-amber-400 border-gray-700 shadow-sm' : 
                                                      inv.plan_name?.includes('PRO') ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                      inv.plan_name?.includes('STANDARD') ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                                      inv.plan_name?.includes('BASIC') ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                      'bg-gray-50 text-gray-600 border-gray-200'
                                                    }
                                                `}>
                                                    {inv.plan_name}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border w-max ${
                                                        inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                        inv.status === 'OVERDUE' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                        'bg-amber-50 text-amber-700 border-amber-200'
                                                    }`}>
                                                        {inv.status === 'PAID' ? <CheckCircle2 className="w-3 h-3" /> : 
                                                         inv.status === 'OVERDUE' ? <ShieldAlert className="w-3 h-3" /> : 
                                                         <Clock className="w-3 h-3" />}
                                                        {inv.status}
                                                    </span>
                                                    
                                                    {inv.status === 'PAID' && inv.payment_method && (
                                                        <div className="mt-1">
                                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{inv.payment_method}</p>
                                                            {inv.reference_number && <p className="text-[11px] font-bold text-[#1f8898]">{inv.reference_number}</p>}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 pr-8 text-right">
                                                <div className="flex items-center justify-end gap-2 transition-opacity">
                                                    {inv.status !== 'PAID' ? (
                                                        <>
                                                            <button 
                                                                onClick={() => handleDownloadDocument('INVOICE', inv)}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 active:scale-95"
                                                                title="Download Invoice PDF"
                                                            >
                                                                <Printer className="w-3.5 h-3.5" />
                                                                <span className="hidden xl:block">Invoice</span>
                                                            </button>
                                                            <button 
                                                                onClick={() => openReminderModal(inv)}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors text-amber-600 bg-amber-50/50 hover:bg-amber-100 border border-amber-100 active:scale-95"
                                                            >
                                                                <Send className="w-3.5 h-3.5" /> Remind
                                                            </button>
                                                            <button 
                                                                onClick={() => openPaymentModal(inv)}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors text-emerald-600 bg-emerald-50/50 hover:bg-emerald-100 border border-emerald-100 active:scale-95"
                                                            >
                                                                <CreditCard className="w-3.5 h-3.5" /> Pay
                                                            </button>
                                                            {inv.status === 'OVERDUE' && (
                                                                <button
                                                                    onClick={() => handleSuspend(inv.landlord_id)}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors text-rose-600 bg-rose-50/50 hover:bg-rose-100 border border-rose-100 active:scale-95"
                                                                >
                                                                    <AlertTriangle className="w-3.5 h-3.5" /> Suspend
                                                                </button>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleDownloadDocument('RECEIPT', inv)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 active:scale-95"
                                                            title="Download Receipt PDF"
                                                        >
                                                            <FileCheck className="w-3.5 h-3.5" />
                                                            <span className="hidden xl:block">Receipt</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </main>

            {/* ========================================== */}
            {/* INDIVIDUAL REMINDER MODAL */}
            {/* ========================================== */}
            {isReminderModalOpen && selectedReminderInvoice && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-0">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => !isSubmitting && setIsReminderModalOpen(false)}></div>
                    <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
                        <div className="bg-[#f8fafb] px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                                    <Send className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-gray-900 tracking-tight">Send Payment Reminder</h3>
                                    <p className="text-xs font-medium text-gray-500">To: {selectedReminderInvoice.landlord?.company_name}</p>
                                </div>
                            </div>
                            <button onClick={() => !isSubmitting && setIsReminderModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-gray-600 font-medium">Select the channels you want to use to notify this landlord about their pending SaaS invoice of <span className="font-bold text-gray-900">KSH {selectedReminderInvoice.amount.toLocaleString()}</span>.</p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <button type="button" onClick={() => setDispatchChannels(p => ({ ...p, email: !p.email }))} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${dispatchChannels.email ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200 hover:bg-gray-50'}`}>
                                    <Mail className="w-6 h-6" />
                                    <span className="text-xs font-bold text-gray-900">Email <span className={`block text-[10px] font-medium uppercase tracking-widest ${dispatchChannels.email ? 'opacity-80' : 'text-gray-400'}`}>Standard</span></span>
                                </button>
                                <button type="button" onClick={() => setDispatchChannels(p => ({ ...p, whatsapp: !p.whatsapp }))} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${dispatchChannels.whatsapp ? 'border-[#25D366] bg-[#25D366]/10 text-[#25D366]' : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200 hover:bg-gray-50'}`}>
                                    <Smartphone className="w-6 h-6" />
                                    <span className="text-xs font-bold text-gray-900">WhatsApp <span className={`block text-[10px] font-medium uppercase tracking-widest ${dispatchChannels.whatsapp ? 'opacity-80' : 'text-gray-400'}`}>Immediate</span></span>
                                </button>
                                <button type="button" onClick={() => setDispatchChannels(p => ({ ...p, portal: !p.portal }))} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${dispatchChannels.portal ? 'border-[#1f8898] bg-[#1f8898]/10 text-[#1f8898]' : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200 hover:bg-gray-50'}`}>
                                    <AlertCircle className="w-6 h-6" />
                                    <span className="text-xs font-bold text-gray-900">Portal <span className={`block text-[10px] font-medium uppercase tracking-widest ${dispatchChannels.portal ? 'opacity-80' : 'text-gray-400'}`}>Alert</span></span>
                                </button>
                            </div>

                            <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsReminderModalOpen(false)} className="px-5 py-3 text-sm font-bold text-gray-600 bg-white hover:bg-gray-100 rounded-xl transition-colors border border-gray-200">Cancel</button>
                                <button type="button" onClick={executeRemind} disabled={isSubmitting || (!dispatchChannels.email && !dispatchChannels.whatsapp && !dispatchChannels.portal)} className="px-6 py-3 text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center gap-2">
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    Dispatch
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================== */}
            {/* BULK REMINDER MODAL */}
            {/* ========================================== */}
            {isBulkReminderModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-0">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => !isSubmitting && setIsBulkReminderModalOpen(false)}></div>
                    <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
                        <div className="bg-[#f8fafb] px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
                                    <BellRing className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-gray-900 tracking-tight">Bulk Dispatch Reminders</h3>
                                    <p className="text-xs font-medium text-gray-500">Notify all overdue landlords</p>
                                </div>
                            </div>
                            <button onClick={() => !isSubmitting && setIsBulkReminderModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-gray-600 font-medium">You are about to dispatch payment reminders to <span className="font-bold text-gray-900">ALL</span> landlords with an Unpaid or Overdue subscription. Select the delivery channels:</p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <button type="button" onClick={() => setDispatchChannels(p => ({ ...p, email: !p.email }))} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${dispatchChannels.email ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200 hover:bg-gray-50'}`}>
                                    <Mail className="w-6 h-6" />
                                    <span className="text-xs font-bold text-gray-900">Email</span>
                                </button>
                                <button type="button" onClick={() => setDispatchChannels(p => ({ ...p, whatsapp: !p.whatsapp }))} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${dispatchChannels.whatsapp ? 'border-[#25D366] bg-[#25D366]/10 text-[#25D366]' : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200 hover:bg-gray-50'}`}>
                                    <Smartphone className="w-6 h-6" />
                                    <span className="text-xs font-bold text-gray-900">WhatsApp</span>
                                </button>
                                <button type="button" onClick={() => setDispatchChannels(p => ({ ...p, portal: !p.portal }))} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${dispatchChannels.portal ? 'border-[#1f8898] bg-[#1f8898]/10 text-[#1f8898]' : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200 hover:bg-gray-50'}`}>
                                    <AlertCircle className="w-6 h-6" />
                                    <span className="text-xs font-bold text-gray-900">Portal</span>
                                </button>
                            </div>

                            <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsBulkReminderModalOpen(false)} className="px-5 py-3 text-sm font-bold text-gray-600 bg-white hover:bg-gray-100 rounded-xl transition-colors border border-gray-200">Cancel</button>
                                <button type="button" onClick={executeRemindAll} disabled={isSubmitting || (!dispatchChannels.email && !dispatchChannels.whatsapp && !dispatchChannels.portal)} className="px-6 py-3 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-lg shadow-rose-600/20 disabled:opacity-50 flex items-center gap-2">
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <BellRing className="w-4 h-4" />}
                                    Dispatch All
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================== */}
            {/* PAYMENT RECONCILIATION MODAL */}
            {/* ========================================== */}
            {isPaymentModalOpen && selectedInvoice && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-0">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => !isSubmitting && setIsPaymentModalOpen(false)}></div>

                    <div className="relative w-full max-w-md bg-[#ffffff] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
                        <div className="bg-[#f8fafb] px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-gray-900 tracking-tight">Record SaaS Payment</h3>
                                    <p className="text-xs font-medium text-gray-500">{selectedInvoice.landlord?.company_name}</p>
                                </div>
                            </div>
                            <button onClick={() => !isSubmitting && setIsPaymentModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="px-6 pt-5">
                            <div className="flex justify-between items-center bg-blue-50 border border-blue-100 p-4 rounded-xl">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-0.5">Amount Due</p>
                                    <p className="text-lg font-black text-blue-700">KSH {selectedInvoice.amount.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-0.5">Plan</p>
                                    <p className="text-sm font-bold text-blue-700">{selectedInvoice.plan_name}</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleRecordPayment} className="p-6 space-y-5">
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Payment Method</label>
                                <select
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-gray-50 font-bold text-gray-700 cursor-pointer"
                                    value={paymentData.payment_method}
                                    onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })}
                                >
                                    <option value="MPESA">Safaricom M-Pesa</option>
                                    <option value="BANK_TRANSFER">Bank Transfer (EFT/RTGS)</option>
                                    <option value="CASH">Cash / Cheque</option>
                                </select>
                            </div>

                            {paymentData.payment_method !== 'CASH' && (
                                <div className="animate-in slide-in-from-top-2 duration-300">
                                    <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Transaction Ref Number</label>
                                    <input
                                        type="text" required placeholder="e.g. QWE123RTY"
                                        className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all uppercase bg-gray-50 font-bold text-gray-900 placeholder:normal-case placeholder:font-medium"
                                        value={paymentData.reference_number}
                                        onChange={(e) => setPaymentData({ ...paymentData, reference_number: e.target.value.toUpperCase() })}
                                    />
                                </div>
                            )}

                            {/* MULTI-CHANNEL DISPATCH TOGGLES FOR RECEIPTS */}
                            <div className="pt-2">
                                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Dispatch Receipt Via</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button type="button" onClick={() => setDispatchChannels(p => ({ ...p, email: !p.email }))} className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 transition-all ${dispatchChannels.email ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-100 bg-white text-gray-400 hover:bg-gray-50'}`}>
                                        <Mail className="w-5 h-5" />
                                        <span className="text-[10px] font-bold">Email</span>
                                    </button>
                                    <button type="button" onClick={() => setDispatchChannels(p => ({ ...p, whatsapp: !p.whatsapp }))} className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 transition-all ${dispatchChannels.whatsapp ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-100 bg-white text-gray-400 hover:bg-gray-50'}`}>
                                        <Smartphone className="w-5 h-5" />
                                        <span className="text-[10px] font-bold">WhatsApp</span>
                                    </button>
                                    <button type="button" onClick={() => setDispatchChannels(p => ({ ...p, portal: !p.portal }))} className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 transition-all ${dispatchChannels.portal ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-100 bg-white text-gray-400 hover:bg-gray-50'}`}>
                                        <AlertCircle className="w-5 h-5" />
                                        <span className="text-[10px] font-bold">Portal</span>
                                    </button>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="w-full sm:w-auto px-5 py-3 text-sm font-bold text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-100 rounded-xl transition-colors border border-gray-200">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting || (!dispatchChannels.email && !dispatchChannels.whatsapp && !dispatchChannels.portal)} className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-[#ffffff] bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95">
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                    {isSubmitting ? 'Processing...' : 'Confirm Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}