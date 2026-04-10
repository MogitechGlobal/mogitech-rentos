// apps/web/app/super-admin/billing/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
    Loader2, Search, Clock, CreditCard, 
    CheckCircle2, AlertCircle, Calendar, 
    Filter, Download, TrendingUp, Building2,
    ShieldAlert, AlertTriangle, Send, Printer, FileCheck
} from 'lucide-react';

export default function PlatformBillingPage() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // --- ADVANCED FILTERS STATE ---
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [dateFilter, setDateFilter] = useState('ALL');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

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

    // --- ACTION HANDLERS ---
    const handleMarkPaid = async (id: string) => {
        if(!confirm('Mark this SaaS invoice as PAID?')) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/billing/${id}/mark-paid`, { method: 'POST', credentials: 'include' });
            if(res.ok) fetchInvoices();
        } catch(err) { alert('Failed to update invoice'); }
    };

    const handleSuspend = async (landlordId: string) => {
        if(!confirm('Are you sure you want to SUSPEND this landlord? Their tenants will also lose access.')) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/billing/suspend/${landlordId}`, { method: 'POST', credentials: 'include' });
            if(res.ok) alert('Landlord suspended successfully.');
        } catch(err) { alert('Failed to suspend landlord'); }
    };

    // --- ADVANCED PDF GENERATOR (MATCHING TENANT LAYOUT WITH DYNAMIC WATERMARK) ---
    const handleDownloadDocument = (type: 'INVOICE' | 'RECEIPT', invoice: any) => {
        const invIdFull = invoice.id.toUpperCase();
        const invIdShort = invIdFull.substring(0, 8);
        const docId = `${type === 'INVOICE' ? 'INV' : 'REC'}-${invIdShort}`;
        
        const dateIssuedOrPaid = new Date(type === 'INVOICE' ? invoice.created_at || Date.now() : (invoice.paid_at || Date.now()))
          .toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
          
        const dueDate = new Date(invoice.due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        const landlordName = invoice.landlord?.company_name || 'N/A';
        const planDetails = `SaaS Subscription - ${invoice.plan_name}`;
        
        const amountBilled = Number(invoice.amount);
        const isPaid = invoice.status === 'PAID';
        
        // Determine dynamic watermark text
        let watermarkText = 'UNPAID';
        if (isPaid) watermarkText = 'PAID.';
        else if (invoice.status === 'OVERDUE') watermarkText = 'OVERDUE';

        // HTML Template matching the MogiRentOS official design
        const htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>${type} - ${docId}</title>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap');
                
                @media print {
                  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                  .watermark { color: rgba(229, 231, 235, 0.45) !important; }
                }

                body { font-family: 'Inter', sans-serif; color: #111827; padding: 0; margin: 0; background: #ffffff; }
                .a4-container { max-width: 800px; margin: 0 auto; background: #ffffff; position: relative; min-height: 100vh; display: flex; flex-direction: column; }
                
                .header-container { background-color: #0f3e46 !important; color: #ffffff !important; display: flex; justify-content: space-between; align-items: center; padding: 40px 50px; }
                .company-info h1 { font-size: 32px; font-weight: 800; margin: 0 0 5px 0; color: #ffffff !important; }
                .company-info p { font-size: 13px; color: #cbd5e1 !important; margin: 0; font-weight: 400; }
                .doc-type h2 { font-size: 26px; font-weight: 800; margin: 0; color: #ffffff !important; text-transform: uppercase; letter-spacing: 1px; }

                .content-body { padding: 40px 50px; flex-grow: 1; position: relative; z-index: 10; overflow: hidden; }

                .watermark { position: absolute; top: 45%; left: 50%; transform: translate(-50%, -50%) rotate(-35deg); font-size: 130px; font-weight: 900; color: rgba(229, 231, 235, 0.55); white-space: nowrap; z-index: -1; pointer-events: none; letter-spacing: 5px; }

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
                    <h1>MogiRentOS</h1>
                    <p>Automated Property Management Platform</p>
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
                      <p class="name">${landlordName}</p>
                      <p class="unit">${planDetails}</p>
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
                        <td>MogiRentOS Platform Subscription (${invoice.billing_period})</td>
                        ${type === 'RECEIPT' ? `
                        <td>SYSTEM_SETTLEMENT</td>
                        <td>N/A</td>
                        ` : ``}
                        <td class="right">KSH ${amountBilled.toLocaleString()}</td>
                      </tr>
                      <tr class="totals-row">
                        <td colspan="${type === 'RECEIPT' ? 3 : 1}" class="total-label">TOTAL ${type === 'RECEIPT' ? 'PAID' : 'DUE'}:</td>
                        <td class="total-val">KSH ${amountBilled.toLocaleString()}</td>
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
                  <p>Generated by Mogitech Global Ltd via MogiRentOS on ${new Date().toLocaleString()}</p>
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

    // --- ADVANCED CLIENT-SIDE FILTERING ---
    const filteredInvoices = useMemo(() => {
        let result = invoices;

        if (statusFilter !== 'ALL') {
            result = result.filter(inv => inv.status === statusFilter);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(inv => 
                (inv.landlord?.company_name && inv.landlord.company_name.toLowerCase().includes(query)) ||
                (inv.id.toLowerCase().includes(query))
            );
        }

        if (dateFilter !== 'ALL') {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            result = result.filter(inv => {
                const invDate = new Date(inv.due_date);
                switch (dateFilter) {
                    case 'TODAY': return invDate >= today;
                    case 'THIS_MONTH':
                        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                        return invDate >= monthStart;
                    case 'THIS_YEAR':
                        const yearStart = new Date(now.getFullYear(), 0, 1);
                        return invDate >= yearStart;
                    case 'CUSTOM':
                        if (customStartDate && customEndDate) {
                            const start = new Date(customStartDate);
                            const end = new Date(customEndDate);
                            end.setHours(23, 59, 59, 999);
                            return invDate >= start && invDate <= end;
                        }
                        return true;
                    default: return true;
                }
            });
        }
        return result;
    }, [invoices, statusFilter, searchQuery, dateFilter, customStartDate, customEndDate]);

    // --- UPDATED DERIVED METRICS ---
    const collectedRevenue = filteredInvoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.amount, 0);
    const overdueRevenue = filteredInvoices.filter(i => i.status === 'OVERDUE').reduce((sum, i) => sum + i.amount, 0);
    
    // NEW: Pending Revenue and Total Billed Revenue calculations
    const pendingRevenue = filteredInvoices.filter(i => i.status === 'UNPAID').reduce((sum, i) => sum + i.amount, 0);
    const totalBilledRevenue = filteredInvoices.reduce((sum, i) => sum + i.amount, 0);

    const pendingCount = filteredInvoices.filter(i => i.status === 'UNPAID').length;
    const overdueCount = filteredInvoices.filter(i => i.status === 'OVERDUE').length;
    const totalBilledCount = filteredInvoices.length;

    // --- EXPORT CSV FUNCTION ---
    const handleExportCSV = () => {
        if (filteredInvoices.length === 0) return;
        const headers = ['Invoice ID', 'Company', 'Plan', 'Billing Period', 'Due Date', 'Amount (KSH)', 'Status'];
        const csvRows = filteredInvoices.map(i => {
            return [
                `INV-${i.id.substring(0, 6).toUpperCase()}`, 
                `"${i.landlord?.company_name}"`, 
                i.plan_name, 
                i.billing_period, 
                new Date(i.due_date).toLocaleDateString(), 
                i.amount, 
                i.status
            ];
        });
        const csvContent = [headers.join(','), ...csvRows.map(row => row.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `MogiRentOS_SaaS_Revenue_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    return (
        <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans selection:bg-[#1f8898]/30 overflow-x-hidden">
            
            {/* --- Premium Gradient Hero Area --- */}
            <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-6 pt-8 pb-20 relative overflow-hidden shadow-inner">
                <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-teal-100 text-[10px] font-black uppercase tracking-widest mb-4 border border-white/20 backdrop-blur-sm">
                            <CreditCard className="w-3.5 h-3.5" /> Platform Revenue
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-[#ffffff] tracking-tight mb-2">
                            SaaS Billing Engine
                        </h1>
                        <p className="text-teal-100 text-sm md:text-base font-medium max-w-xl leading-relaxed">
                            Track Monthly Recurring Revenue (MRR), manage landlord subscriptions, and enforce automated grace periods.
                        </p>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 relative z-20 space-y-6">
                
                {/* --- Bento Box Analytics Grid --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 text-right leading-tight">Collected<br/>Revenue</span>
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">
                                <span className="text-sm text-gray-400 mr-1">KSH</span>{collectedRevenue.toLocaleString()}
                            </h4>
                            <p className="text-xs text-gray-500 font-medium mt-1">Paid in selected period</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 text-right leading-tight">At Risk<br/>(Overdue)</span>
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">
                                <span className="text-sm text-gray-400 mr-1">KSH</span>{overdueRevenue.toLocaleString()}
                            </h4>
                            <p className="text-xs text-rose-500 font-bold mt-1">{overdueCount} accounts past grace period</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                                <Clock className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 text-right leading-tight">Pending<br/>Invoices</span>
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">
                                <span className="text-sm text-gray-400 mr-1">KSH</span>{pendingRevenue.toLocaleString()}
                            </h4>
                            <p className="text-xs text-gray-500 font-medium mt-1">{pendingCount} awaiting payment</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 text-right leading-tight">Total<br/>Billed</span>
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">
                                <span className="text-sm text-gray-400 mr-1">KSH</span>{totalBilledRevenue.toLocaleString()}
                            </h4>
                            <p className="text-xs text-gray-500 font-medium mt-1">{totalBilledCount} invoices generated</p>
                        </div>
                    </div>
                </div>

                {/* --- Main Table Container --- */}
                <div className="bg-white rounded-3xl shadow-lg shadow-black/5 border border-gray-100 overflow-hidden flex flex-col min-h-[500px] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                    
                    {/* Advanced Toolbar */}
                    <div className="p-4 md:p-5 border-b border-gray-100 bg-[#f8fafb]/50 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                        
                        <div className="flex flex-wrap items-center gap-3">
                            
                            {/* STATUS FILTER */}
                            <div className="flex items-center gap-2 pr-3 border-r border-gray-200">
                                <Filter className="w-4 h-4 text-gray-400" />
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest hidden sm:inline">Status:</span>
                            </div>
                            <div className="flex gap-1.5 pr-3 border-r border-gray-200">
                                {['ALL', 'PAID', 'UNPAID', 'OVERDUE'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setStatusFilter(status)}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                            statusFilter === status 
                                                ? 'bg-[#1f8898] text-white shadow-sm' 
                                                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>

                            {/* DATE FILTER */}
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2 pl-1 pr-3 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm hover:border-[#1f8898]/50 transition-colors">
                                    <Calendar className="w-3.5 h-3.5 text-[#1f8898]" />
                                    <select 
                                        className="text-[10px] font-black text-gray-700 bg-transparent outline-none cursor-pointer uppercase tracking-widest"
                                        value={dateFilter}
                                        onChange={(e) => setDateFilter(e.target.value)}
                                    >
                                        <option value="ALL">All Time</option>
                                        <option value="TODAY">Due Today</option>
                                        <option value="THIS_MONTH">Due This Month</option>
                                        <option value="THIS_YEAR">Due This Year</option>
                                        <option value="CUSTOM">Custom Range</option>
                                    </select>
                                </div>
                                
                                {dateFilter === 'CUSTOM' && (
                                    <div className="flex items-center gap-1.5 animate-in fade-in zoom-in-95">
                                        <input 
                                            type="date" 
                                            className="px-2 py-1.5 rounded-lg border border-gray-200 text-[10px] font-bold text-gray-700 outline-none focus:border-[#1f8898] bg-white shadow-sm cursor-pointer"
                                            value={customStartDate}
                                            onChange={(e) => setCustomStartDate(e.target.value)}
                                        />
                                        <span className="text-gray-400 text-xs font-bold">-</span>
                                        <input 
                                            type="date" 
                                            className="px-2 py-1.5 rounded-lg border border-gray-200 text-[10px] font-bold text-gray-700 outline-none focus:border-[#1f8898] bg-white shadow-sm cursor-pointer"
                                            value={customEndDate}
                                            onChange={(e) => setCustomEndDate(e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* --- SEARCH & EXPORT ACTIONS --- */}
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
                            <div className="relative w-full sm:w-72">
                                <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3" />
                                <input 
                                    type="text" placeholder="Search company or invoice..." 
                                    className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-2.5 text-sm font-medium outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all bg-white shadow-sm"
                                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={handleExportCSV}
                                disabled={filteredInvoices.length === 0}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed shrink-0 active:scale-95"
                            >
                                <Download className="w-4 h-4" />
                                <span>Export Report</span>
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto flex-1 bg-white">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-[400px] text-[#1f8898] gap-4 bg-white">
                                <Loader2 className="w-8 h-8 animate-spin" />
                                <span className="font-bold text-sm uppercase tracking-widest text-gray-400">Loading Revenue Data...</span>
                            </div>
                        ) : (
                            <table className="min-w-full text-left border-collapse whitespace-nowrap">
                                <thead>
                                    <tr className="bg-gray-50/80 border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-400 font-black">
                                        <th className="px-6 py-4 pl-8">Invoice & Client</th>
                                        <th className="px-6 py-4">SaaS Plan Details</th>
                                        <th className="px-6 py-4">Due Date</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 text-right pr-8">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredInvoices.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-16 text-center">
                                                <div className="w-16 h-16 bg-[#ebf3f5] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#1f8898]">
                                                    <ShieldAlert className="w-8 h-8" />
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-1">No Invoices Found</h3>
                                                <p className="text-sm text-gray-500 font-medium">Try adjusting your date filters.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredInvoices.map((inv) => (
                                            <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-6 py-4 pl-8">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-200 shrink-0">
                                                            <Building2 className="w-5 h-5 text-gray-400" />
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-gray-900 text-sm group-hover:text-[#1f8898] transition-colors">{inv.landlord?.company_name}</p>
                                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                                                INV-{inv.id.substring(0, 6).toUpperCase()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-black text-gray-900 text-sm mb-1">
                                                        <span className="text-gray-400 font-bold text-xs mr-1">KSH</span> 
                                                        {inv.amount.toLocaleString()}
                                                    </p>
                                                    <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 inline-block">
                                                        {inv.plan_name} • {inv.billing_period}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-900 font-bold mb-0.5">
                                                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                        {new Date(inv.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                    {inv.paid_at && (
                                                        <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest ml-5">
                                                            Paid on {new Date(inv.paid_at).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border
                                                        ${inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                                                        inv.status === 'OVERDUE' ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                                                        'bg-amber-50 text-amber-700 border-amber-200'}
                                                    `}>
                                                        {inv.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right pr-8">
                                                    <div className="flex items-center justify-end gap-2">
                                                        
                                                        {/* --- DOWNLOAD BUTTON --- */}
                                                        {inv.status === 'PAID' ? (
                                                            <button 
                                                                onClick={() => handleDownloadDocument('RECEIPT', inv)}
                                                                className="p-2 border rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1.5 px-3 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900 border-gray-200"
                                                                title="Download Official Receipt"
                                                            >
                                                                <FileCheck className="w-3.5 h-3.5" />
                                                                <span className="text-[10px] font-black uppercase tracking-widest hidden xl:block">Receipt</span>
                                                            </button>
                                                        ) : (
                                                            <button 
                                                                onClick={() => handleDownloadDocument('INVOICE', inv)}
                                                                className="p-2 border rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1.5 px-3 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900 border-gray-200"
                                                                title="Download Official Invoice"
                                                            >
                                                                <Printer className="w-3.5 h-3.5" />
                                                                <span className="text-[10px] font-black uppercase tracking-widest hidden xl:block">Invoice</span>
                                                            </button>
                                                        )}

                                                        {inv.status !== 'PAID' && (
                                                            <>
                                                                <button 
                                                                    onClick={() => alert('Reminder email queued for dispatch.')}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors text-blue-600 bg-blue-50/50 hover:bg-blue-100 border border-blue-100 active:scale-95"
                                                                >
                                                                    <Send className="w-3.5 h-3.5" /> Remind
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleMarkPaid(inv.id)}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors text-emerald-600 bg-emerald-50/50 hover:bg-emerald-100 border border-emerald-100 active:scale-95"
                                                                >
                                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Pay
                                                                </button>
                                                            </>
                                                        )}
                                                        {inv.status === 'OVERDUE' && (
                                                            <button 
                                                                onClick={() => handleSuspend(inv.landlord_id)}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors text-rose-600 bg-rose-50/50 hover:bg-rose-100 border border-rose-100 active:scale-95"
                                                            >
                                                                <AlertTriangle className="w-3.5 h-3.5" /> Suspend
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
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