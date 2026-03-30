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
    TrendingUp, Activity
} from 'lucide-react';

export default function TenantBillingPage() {
    const router = useRouter();
    const [leaseData, setLeaseData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Advanced UI States
    const [activeTab, setActiveTab] = useState<'invoices' | 'receipts'>('invoices');
    const [searchQuery, setSearchQuery] = useState('');

    // Payment Modal State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [paymentMode, setPaymentMode] = useState<'EXPRESS' | 'MANUAL'>('MANUAL');

    const [paymentData, setPaymentData] = useState({
        amount_paid: '',
        payment_method: 'MPESA',
        reference_number: '',
        phone: ''
    });

    const fetchLeaseData = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) return router.push('/login');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portal/my-lease`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

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

    const handleDownloadReceipt = async (paymentId: string) => {
        const token = localStorage.getItem('access_token');
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portal/payments/${paymentId}/download`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Receipt_${paymentId.substring(0, 8)}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert("Could not download receipt. Please try again.");
        }
    };

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const token = localStorage.getItem('access_token');

        try {
            if (paymentMode === 'EXPRESS') {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mpesa/stk-push`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ amount: Number(paymentData.amount_paid), phone: paymentData.phone })
                });
                if (!res.ok) throw new Error('Failed to initiate M-Pesa prompt.');
                alert('STK Push Sent! Check your phone.');
            } else {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portal/invoices/${selectedInvoice.id}/pay`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({
                        amount_paid: Number(paymentData.amount_paid),
                        payment_method: 'MPESA',
                        reference_number: paymentData.reference_number
                    })
                });
                if (!res.ok) throw new Error('Failed to process manual payment.');
                alert('Payment recorded successfully!');
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
                allPayments.push({ ...p, invoice_description: inv.description });
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
        if (activeTab === 'invoices') {
            return analytics.invoices.filter((i: any) => i.description.toLowerCase().includes(q) || i.id.toLowerCase().includes(q));
        } else {
            return analytics.allPayments.filter((p: any) => p.reference_number?.toLowerCase().includes(q) || p.invoice_description?.toLowerCase().includes(q));
        }
    }, [analytics, activeTab, searchQuery]);

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

    const inputStyle = "w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-gray-50/50 text-gray-900 font-medium text-sm";

    return (
        <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans selection:bg-[#1f8898]/30 overflow-x-hidden">

            {/* --- Advanced Gradient Hero Area --- */}
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

                {/* --- TOP METRICS GRID (Bento Box) --- */}
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

                {/* --- TABBED FINANCIAL LEDGER --- */}
                <div className="bg-[#ffffff] rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">

                    {/* Tab Header & Search */}
                    <div className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-100 bg-gray-50/50 pr-4 shrink-0">
                        <div className="flex w-full sm:w-auto">
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
                        <div className="p-3 w-full sm:w-auto sm:p-0">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search ledger..."
                                    className="w-full sm:w-64 pl-9 pr-4 py-2 rounded-xl border border-gray-200 outline-none focus:border-[#1f8898] text-sm font-medium"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto relative z-0 flex-1">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="bg-white border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-400 font-black sticky top-0">
                                    <th className="px-6 md:px-8 py-4 align-middle">{activeTab === 'invoices' ? 'Invoice Description' : 'Reference / Method'}</th>
                                    <th className="px-6 py-4 align-middle">{activeTab === 'invoices' ? 'Date Issued' : 'Date Paid'}</th>
                                    <th className="px-6 py-4 text-right align-middle">Amount (KSH)</th>
                                    <th className="px-6 md:px-8 py-4 text-center align-middle">{activeTab === 'invoices' ? 'Status & Action' : 'Action'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 bg-white">
                                {filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-16 text-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                                                {activeTab === 'invoices' ? <Receipt className="w-8 h-8 text-gray-300" /> : <Download className="w-8 h-8 text-gray-300" />}
                                            </div>
                                            <h3 className="text-gray-900 font-black text-lg mb-1">No records found.</h3>
                                            <p className="text-sm font-medium text-gray-500">Your ledger is currently empty for this view.</p>
                                        </td>
                                    </tr>
                                ) : activeTab === 'invoices' ? (
                                    filteredData.map((inv: any) => (
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
                                            <td className="px-6 py-4 text-right align-middle font-black text-gray-900 text-base">
                                                {inv.amount.toLocaleString()}
                                            </td>
                                            <td className="px-6 md:px-8 py-4 text-center align-middle">
                                                <div className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest border ${inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : inv.status === 'PARTIAL' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                                                    }`}>
                                                    {inv.status === 'PAID' && <CheckCircle2 className="w-3 h-3" />}
                                                    {inv.status === 'PARTIAL' && <AlertCircle className="w-3 h-3" />}
                                                    {inv.status === 'UNPAID' && <FileWarning className="w-3 h-3" />}
                                                    {inv.status.replace('_', ' ')}
                                                </div>
                                                {inv.status !== 'PAID' && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedInvoice(inv);
                                                            setPaymentData(prev => ({ ...prev, amount_paid: (inv.amount - (inv.payments?.reduce((acc: number, p: any) => acc + p.amount_paid, 0) || 0)).toString() }));
                                                            setIsPaymentModalOpen(true);
                                                        }}
                                                        className="ml-3 text-[10px] font-black uppercase tracking-widest text-white bg-rose-600 hover:bg-rose-700 px-3 py-1.5 rounded-lg shadow-sm transition-all active:scale-95"
                                                    >
                                                        Pay Now
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
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
                                            <td className="px-6 md:px-8 py-4 text-center align-middle">
                                                <button
                                                    onClick={() => handleDownloadReceipt(payment.id)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 hover:text-[#1f8898] hover:border-[#1f8898]/30 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm transition-all active:scale-95 group/btn"
                                                >
                                                    <Download className="w-3.5 h-3.5 group-hover/btn:-translate-y-0.5 transition-transform" /> Download PDF
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>

            {/* --- M-PESA DUAL PAYMENT MODAL --- */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#ffffff] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 flex flex-col">

                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gradient-to-br from-[#1f8898] to-[#135a65] text-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black tracking-tight">Make Payment</h2>
                                    <p className="text-[10px] font-bold text-teal-100 uppercase tracking-widest mt-0.5">{selectedInvoice?.description}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsPaymentModalOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Custom Tabs */}
                        <div className="flex border-b border-gray-100 bg-gray-50/50 p-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setPaymentMode('MANUAL')}
                                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${paymentMode === 'MANUAL' ? 'bg-white shadow-sm border border-gray-200 text-[#1f8898]' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <Edit3 className="w-4 h-4" /> Manual Entry
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMode('EXPRESS')}
                                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${paymentMode === 'EXPRESS' ? 'bg-white shadow-sm border border-gray-200 text-[#1f8898]' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <Smartphone className="w-4 h-4" /> STK Push
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handlePaymentSubmit} className="p-6 md:p-8 space-y-5">

                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2 ml-1">Amount to Pay (KSH)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-3.5 text-gray-400 font-black text-sm">KSH</span>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        max={selectedInvoice ? (selectedInvoice.amount - selectedInvoice.payments.reduce((acc: number, p: any) => acc + p.amount_paid, 0)) : undefined}
                                        className={`${inputStyle} pl-14 text-lg font-black`}
                                        value={paymentData.amount_paid}
                                        onChange={(e) => setPaymentData({ ...paymentData, amount_paid: e.target.value })}
                                    />
                                </div>
                            </div>

                            {paymentMode === 'MANUAL' ? (
                                <>
                                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl mb-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 mb-1">Payment Instructions</p>
                                        <p className="text-xs text-emerald-800 font-medium">1. Go to M-Pesa Menu &gt; Lipa na M-Pesa &gt; Paybill</p>
                                        <p className="text-xs text-emerald-800 font-medium">2. Enter Business No: <strong className="font-black">174379</strong></p>
                                        <p className="text-xs text-emerald-800 font-medium">3. Enter Account No: <strong className="font-black">{leaseData?.unit?.unit_number || 'YOUR_UNIT'}</strong></p>
                                        <p className="text-xs text-emerald-800 font-medium mt-2">Wait for the confirmation SMS, then enter the code below.</p>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2 ml-1">M-Pesa Transaction Code</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. NLJ7RT61CQ"
                                            className={`${inputStyle} uppercase`}
                                            value={paymentData.reference_number}
                                            onChange={(e) => setPaymentData({ ...paymentData, reference_number: e.target.value.toUpperCase() })}
                                        />
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
                                    <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-wide">A PIN prompt will appear on your phone.</p>
                                </div>
                            )}

                            {/* Modal Footer */}
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