// apps/web/app/dashboard/accounting/page.tsx
/* eslint-disable */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import _ from 'lodash';
import { 
  Calculator, TrendingUp, TrendingDown, DollarSign, 
  Building2, Plus, Loader2, XCircle, Search, FileText, Trash2, Calendar,
  CheckCircle2, ChevronDown, Download, Printer, Eye, Edit2,
  Globe, Filter, CalendarDays
} from 'lucide-react';

// --- MOCK EXCHANGE RATES (Base: KES) ---
const EXCHANGE_RATES: Record<string, number> = {
  KES: 1,
  USD: 1 / 130,  // 1 KES = ~0.0077 USD
  EUR: 1 / 142,  // 1 KES = ~0.0070 EUR
  TZS: 20,       // 1 KES = ~20 TZS
  UGX: 30        // 1 KES = ~30 UGX
};

export default function AccountingDashboard() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [propertyFilter, setPropertyFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // --- GLOBAL FILTERS ---
  const [timeFilter, setTimeFilter] = useState('ALL'); // ALL, TODAY, WEEK, MONTH, YEAR, CUSTOM
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [currency, setCurrency] = useState('KES');

  // Dynamic Modal States
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT' | 'VIEW'>('CREATE');
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    property_id: '', amount: '', category: 'MAINTENANCE', description: '', date_incurred: new Date().toISOString().split('T')[0]
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const reqOptions = { credentials: 'include' as RequestCredentials };

      // Fetch both P&L data and raw invoices to enable dynamic revenue recalculation
      const [pnlRes, invsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounting/pnl?propertyId=${propertyFilter}`, reqOptions),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices`, reqOptions)
      ]);
      
      if (pnlRes.status === 401 || invsRes.status === 401) return router.push('/login');
      if (!pnlRes.ok || !invsRes.ok) throw new Error('Failed to load accounting data');
      
      const pnlData = await pnlRes.json();
      const invoicesData = await invsRes.json();

      // Pre-filter invoices by property if a specific property is selected
      let filteredInvs = invoicesData;
      if (propertyFilter !== 'ALL') {
          filteredInvs = invoicesData.filter((inv: any) => inv.tenant?.unit?.property_id === propertyFilter);
      }

      setData({
        ...pnlData,
        invoices: filteredInvs
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [propertyFilter]);

  // --- UTILS: TIME FILTERING & CURRENCY ---
  const filterByTime = (items: any[], dateKey: string) => {
    if (timeFilter === 'ALL' || !items) return items || [];
    const now = new Date();
    return _.filter(items, item => {
      const itemDate = new Date(item[dateKey]);
      
      if (timeFilter === 'TODAY') return itemDate.toDateString() === now.toDateString();
      if (timeFilter === 'WEEK') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return itemDate >= weekAgo;
      }
      if (timeFilter === 'MONTH') return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
      if (timeFilter === 'YEAR') return itemDate.getFullYear() === now.getFullYear();
      if (timeFilter === 'CUSTOM') {
        if (!customStartDate && !customEndDate) return true;
        let isAfterStart = true;
        let isBeforeEnd = true;
        if (customStartDate) isAfterStart = itemDate >= new Date(customStartDate);
        if (customEndDate) {
          const endDate = new Date(customEndDate);
          endDate.setHours(23, 59, 59, 999);
          isBeforeEnd = itemDate <= endDate;
        }
        return isAfterStart && isBeforeEnd;
      }
      return true;
    });
  };

  const formatCurrency = (amount: number | string) => {
    const num = Number(amount) || 0;
    const converted = num * (EXCHANGE_RATES[currency] || 1);
    const decimals = ['KES', 'TZS', 'UGX'].includes(currency) ? 0 : 2;
    return `${currency} ${converted.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
  };

  const handleRecordExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'VIEW') return setIsExpenseModalOpen(false);

    setIsSubmitting(true);
    try {
      const url = modalMode === 'EDIT' 
        ? `${process.env.NEXT_PUBLIC_API_URL}/accounting/expenses/${selectedExpenseId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/accounting/expenses`;
        
      const method = modalMode === 'EDIT' ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error(`Failed to ${modalMode.toLowerCase()} expense`);
      
      await fetchData();
      setIsExpenseModalOpen(false);
    } catch (err) {
      alert(`Error saving expense.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense record?')) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounting/expenses/${id}`, { method: 'DELETE', credentials: 'include' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Modal Action Handlers
  const openCreateModal = () => {
    setFormData({
      property_id: data?.properties?.[0]?.id || '', amount: '', category: 'MAINTENANCE', description: '', date_incurred: new Date().toISOString().split('T')[0]
    });
    setModalMode('CREATE');
    setIsExpenseModalOpen(true);
  };

  const openEditModal = (exp: any) => {
    setFormData({
      property_id: exp.property_id, amount: exp.amount.toString(), category: exp.category, description: exp.description, date_incurred: new Date(exp.date_incurred).toISOString().split('T')[0]
    });
    setSelectedExpenseId(exp.id);
    setModalMode('EDIT');
    setIsExpenseModalOpen(true);
  };

  const openViewModal = (exp: any) => {
    setFormData({
      property_id: exp.property_id, amount: exp.amount.toString(), category: exp.category, description: exp.description, date_incurred: new Date(exp.date_incurred).toISOString().split('T')[0]
    });
    setModalMode('VIEW');
    setIsExpenseModalOpen(true);
  };

  // --- DYNAMIC ANALYTICS ENGINE ---
  const filteredExpenses = filterByTime(data?.expenses || [], 'date_incurred');
  const searchedExpenses = filteredExpenses.filter((e: any) => 
    e.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allPayments = (data?.invoices || []).flatMap((inv: any) => inv.payments || []);
  const filteredPayments = filterByTime(allPayments, 'created_at');

  const totalRevenue = filteredPayments.reduce((sum: number, p: any) => sum + Number(p.amount_paid), 0);
  const totalExpenses = filteredExpenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

  // --- NATIVE CSV EXPORT ---
  const exportToCSV = () => {
    if (!data || searchedExpenses.length === 0) return;
    const headers = ['Date Incurred', 'Description', 'Property', 'Category', `Amount (${currency})`];
    const rows = searchedExpenses.map((exp: any) => {
      const rate = EXCHANGE_RATES[currency] || 1;
      const amountConv = (Number(exp.amount) * rate).toFixed(2);
      return [
        new Date(exp.date_incurred).toLocaleDateString(),
        `"${exp.description.replace(/"/g, '""')}"`, 
        `"${exp.property.name}"`,
        exp.category,
        amountConv
      ]
    });
    const csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MogiRent_General_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading && !data) return (
    <div className="min-h-screen bg-[#f8fafb] flex flex-col items-center justify-center text-[#1f8898] gap-4">
      <Loader2 className="w-8 h-8 animate-spin" />
      <span className="font-bold text-sm uppercase tracking-widest text-gray-400">Loading General Ledger...</span>
    </div>
  );

  const currentDateString = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <>
      {/* --- MAGICAL PRINT CSS --- */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: auto; margin: 12mm; }
          html, body { height: auto !important; overflow: visible !important; background-color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          aside, header, nav, .md\\:hidden { display: none !important; }
          #print-container { position: absolute; top: 0; left: 0; width: 100%; margin: 0; padding: 0; z-index: 99999; }
        }
        .custom-calendar-icon::-webkit-calendar-picker-indicator {
            filter: invert(1);
            opacity: 0.6;
            cursor: pointer;
        }
        .custom-calendar-icon::-webkit-calendar-picker-indicator:hover {
            opacity: 1;
        }
      `}} />

      <div id="print-container" className="min-h-screen bg-[#f8fafb] pb-12 font-sans overflow-x-hidden print:bg-white print:pb-0">
        
        {/* --- MINIMIZED EXECUTIVE HERO AREA --- */}
        <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-4 sm:px-6 pt-5 pb-8 sm:pb-10 relative overflow-hidden shadow-inner print:hidden">
          <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-100 text-[10px] font-bold uppercase tracking-widest mb-1.5 border border-white/20 backdrop-blur-sm">
                  <CalendarDays className="w-3.5 h-3.5" /> {currentDateString}
              </div>
              <h1 className="text-xl md:text-2xl font-black text-[#ffffff] tracking-tight">
                Accounting & P&L
              </h1>
            </div>
            
            {/* --- GLOBAL FILTERS & ACTIONS --- */}
            <div className="flex flex-wrap items-center gap-2 mt-3 md:mt-0">
                <div className="relative shrink-0">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-teal-100" />
                    <select 
                        value={currency} onChange={(e) => setCurrency(e.target.value)}
                        className="appearance-none bg-white/10 hover:bg-white/20 border border-white/20 text-white pl-8 pr-8 py-2 rounded-xl font-bold text-xs backdrop-blur-md transition-all outline-none cursor-pointer"
                    >
                        <option value="KES" className="text-gray-900">KES - Kenyan Shilling</option>
                        <option value="USD" className="text-gray-900">USD - US Dollar</option>
                        <option value="EUR" className="text-gray-900">EUR - Euro</option>
                        <option value="TZS" className="text-gray-900">TZS - Tanzanian Shilling</option>
                        <option value="UGX" className="text-gray-900">UGX - Ugandan Shilling</option>
                    </select>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-teal-100" />
                        <select 
                            value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}
                            className="appearance-none bg-white/10 hover:bg-white/20 border border-white/20 text-white pl-8 pr-8 py-2 rounded-xl font-bold text-xs backdrop-blur-md transition-all outline-none cursor-pointer"
                        >
                            <option value="ALL" className="text-gray-900">All Time</option>
                            <option value="TODAY" className="text-gray-900">Today</option>
                            <option value="WEEK" className="text-gray-900">This Week</option>
                            <option value="MONTH" className="text-gray-900">This Month</option>
                            <option value="YEAR" className="text-gray-900">This Year</option>
                            <option value="CUSTOM" className="text-gray-900">Custom Range</option>
                        </select>
                    </div>

                    {timeFilter === 'CUSTOM' && (
                        <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-right-2 duration-300">
                            <input 
                            type="date" 
                            value={customStartDate} 
                            onChange={e => setCustomStartDate(e.target.value)} 
                            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-2.5 py-1.5 rounded-xl font-bold text-[11px] sm:text-xs backdrop-blur-md outline-none custom-calendar-icon" 
                            />
                            <span className="text-white/50 text-xs">-</span>
                            <input 
                            type="date" 
                            value={customEndDate} 
                            onChange={e => setCustomEndDate(e.target.value)} 
                            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-2.5 py-1.5 rounded-xl font-bold text-[11px] sm:text-xs backdrop-blur-md outline-none custom-calendar-icon" 
                            />
                        </div>
                    )}
                </div>

                <button onClick={openCreateModal} className="w-full sm:w-auto px-4 py-2 bg-amber-400 hover:bg-amber-300 text-amber-950 rounded-xl font-bold text-xs transition-all shadow-lg flex items-center justify-center gap-1.5 active:scale-95 shrink-0">
                  <Plus className="w-3.5 h-3.5" /> Record Expense
                </button>
            </div>
          </div>
        </div>

        {/* --- PRINT-ONLY HEADER --- */}
        <div className="hidden print:block pt-4 pb-6 border-b-2 border-gray-900 mb-6 px-4">
          <h1 className="text-3xl font-black text-black">MogiRent General Ledger</h1>
          <div className="flex justify-between items-end mt-2">
            <p className="text-sm text-gray-600 font-medium">Generated on: {new Date().toLocaleDateString()}</p>
            <p className="text-sm font-bold text-gray-900">
                Property Filter: {propertyFilter === 'ALL' ? 'All Portfolio' : data?.properties.find((p:any)=>p.id===propertyFilter)?.name} <br/>
                Time Filter: {timeFilter}
            </p>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 relative z-20 -mt-4 print:m-0 print:max-w-none print:w-full">
          
          {/* --- METRICS RIBBON --- */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 print:grid-cols-4 print:gap-4 print:mb-8">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between print:shadow-none print:border-gray-300 print:rounded-xl">
                  <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Gross Revenue</p>
                      <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center print:hidden"><TrendingUp className="w-3 h-3 text-emerald-600" /></div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-gray-900 print:text-black">{formatCurrency(totalRevenue)}</h3>
              </div>
              
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between print:shadow-none print:border-gray-300 print:rounded-xl">
                  <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Total Expenses</p>
                      <div className="w-6 h-6 rounded-full bg-rose-50 flex items-center justify-center print:hidden"><TrendingDown className="w-3 h-3 text-rose-600" /></div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-rose-600 print:text-black">{formatCurrency(totalExpenses)}</h3>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden print:shadow-none print:border-gray-300 print:rounded-xl">
                  <div className="absolute top-0 right-0 w-12 h-12 bg-[#1f8898]/10 rounded-bl-full blur-xl pointer-events-none print:hidden"></div>
                  <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Net Profit</p>
                      <div className="w-6 h-6 rounded-full bg-[#ebf3f5] flex items-center justify-center print:hidden"><DollarSign className="w-3 h-3 text-[#1f8898]" /></div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-[#1f8898] print:text-black">{formatCurrency(netProfit)}</h3>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between print:shadow-none print:border-gray-300 print:rounded-xl">
                  <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Profit Margin</p>
                      <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center print:hidden"><Calculator className="w-3 h-3 text-blue-600" /></div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-blue-600 print:text-black">{profitMargin}%</h3>
              </div>
          </div>

          {/* --- TOOLBAR --- */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center mb-6 bg-white p-2.5 rounded-2xl shadow-sm border border-gray-100 print:hidden">
              <div className="relative w-full sm:max-w-md flex items-center group">
                  <Search className="absolute left-3.5 w-4 h-4 text-gray-400 group-focus-within:text-[#1f8898]" />
                  <input 
                      type="text" placeholder="Search expenses..." 
                      value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-gray-50 hover:bg-gray-100 focus:bg-white border border-transparent focus:border-[#1f8898]/20 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-gray-900 outline-none transition-all"
                  />
              </div>
              <div className="relative w-full sm:w-auto shrink-0">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select 
                      value={propertyFilter} onChange={(e) => setPropertyFilter(e.target.value)}
                      className="w-full sm:w-auto appearance-none bg-gray-50 hover:bg-gray-100 border border-transparent focus:border-[#1f8898]/20 rounded-xl pl-10 pr-10 py-2.5 text-sm font-bold text-gray-700 outline-none cursor-pointer transition-all"
                  >
                      <option value="ALL">All Properties</option>
                      {data?.properties.map((prop: any) => <option key={prop.id} value={prop.id}>{prop.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
          </div>

          {/* --- EXPENSE DATA TABLE --- */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden print:shadow-none print:border-none print:rounded-none">
            <div className="p-4 sm:p-5 border-b border-gray-50 bg-[#f8fafb]/50 flex justify-between items-center print:hidden">
                <h2 className="text-base sm:text-lg font-black text-gray-900">Expense Ledger</h2>
                <div className="flex items-center gap-2">
                   <button onClick={exportToCSV} className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-[#ebf3f5] hover:text-[#1f8898] text-gray-700 rounded-lg text-xs sm:text-sm font-bold transition-colors">
                      <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> CSV
                   </button>
                   <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-[#ebf3f5] hover:text-[#1f8898] text-gray-700 rounded-lg text-xs sm:text-sm font-bold transition-colors">
                      <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> PDF
                   </button>
                </div>
            </div>
            <div className="overflow-x-auto print:overflow-visible">
              {searchedExpenses.length === 0 ? (
                <div className="p-10 sm:p-16 text-center print:hidden">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4"><FileText className="w-8 h-8 text-gray-300" /></div>
                    <p className="text-gray-500 font-medium text-sm">No expenses found for this period.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse whitespace-nowrap min-w-[750px] print:min-w-full">
                  <thead>
                    <tr className="bg-[#ffffff] text-[9px] sm:text-[10px] uppercase tracking-widest text-gray-400 font-black border-b-2 border-gray-200 print:border-black print:text-black">
                      <th className="px-4 sm:px-6 py-3 sm:py-4 pl-4 sm:pl-6 print:pl-2">Description</th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4">Property</th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4">Category</th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-right">Amount</th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-center print:text-right print:pr-2">Date</th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-right print:hidden">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 print:divide-gray-200">
                    {searchedExpenses.map((exp: any) => (
                      <tr key={exp.id} className="hover:bg-gray-50/50 transition-colors print:text-black print:break-inside-avoid">
                        <td className="px-4 sm:px-6 py-3 sm:py-4 pl-4 sm:pl-6 print:pl-2 font-bold text-gray-900 text-xs sm:text-sm truncate max-w-[250px] print:whitespace-normal print:max-w-none">{exp.description}</td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-gray-600 text-xs sm:text-sm">{exp.property.name}</td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                           <span className="px-2.5 py-1 text-[9px] sm:text-[10px] font-black uppercase tracking-wider rounded-md border bg-gray-50 text-gray-600 border-gray-200 print:bg-transparent print:border-none print:p-0">
                              {exp.category}
                           </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 font-black text-rose-600 text-xs sm:text-sm text-right print:text-black">
                          - {formatCurrency(exp.amount)}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-gray-500 text-xs sm:text-sm text-center print:text-right print:pr-2">{new Date(exp.date_incurred).toLocaleDateString()}</td>
                        
                        {/* VISIBLE ACTIONS COLUMN */}
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-right print:hidden">
                          <div className="flex items-center justify-end gap-2">
                              <button onClick={() => openViewModal(exp)} className="p-1.5 text-gray-500 hover:text-[#1f8898] hover:bg-[#ebf3f5] rounded-lg transition-colors" title="View Expense">
                                  <Eye className="w-4 h-4" />
                              </button>
                              <button onClick={() => openEditModal(exp)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Expense">
                                  <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteExpense(exp.id)} className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete Expense">
                                  <Trash2 className="w-4 h-4" />
                              </button>
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

        {/* --- DYNAMIC MODAL (CREATE / EDIT / VIEW) --- */}
        {isExpenseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0 print:hidden">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => !isSubmitting && setIsExpenseModalOpen(false)}></div>
            
            <div className="relative w-full max-w-md bg-[#ffffff] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
              <div className="bg-[#f8fafb] px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500">
                      {modalMode === 'VIEW' ? <Eye className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-gray-900 tracking-tight">
                        {modalMode === 'CREATE' ? 'Record Expense' : modalMode === 'EDIT' ? 'Edit Expense' : 'Expense Details'}
                    </h3>
                    <p className="text-xs font-medium text-gray-500">
                        {modalMode === 'VIEW' ? 'Viewing ledger record' : 'Log an overhead or maintenance bill'}
                    </p>
                  </div>
                </div>
                <button onClick={() => !isSubmitting && setIsExpenseModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-full transition-colors"><XCircle className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleRecordExpense} className="p-6 space-y-4">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Property</label>
                  <select disabled={modalMode === 'VIEW'} required className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#1f8898] bg-gray-50 disabled:bg-gray-100 disabled:opacity-80 font-bold text-gray-700 text-sm" value={formData.property_id} onChange={(e) => setFormData({...formData, property_id: e.target.value})}>
                      {data?.properties.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Category</label>
                      <select disabled={modalMode === 'VIEW'} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#1f8898] bg-gray-50 disabled:bg-gray-100 disabled:opacity-80 font-bold text-gray-700 text-sm" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                          <option value="MAINTENANCE">Maintenance</option>
                          <option value="UTILITIES">Utilities</option>
                          <option value="TAXES">Taxes</option>
                          <option value="INSURANCE">Insurance</option>
                          <option value="SALARY">Salaries</option>
                          <option value="MARKETING">Marketing</option>
                          <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Amount (KSH)</label>
                      <input disabled={modalMode === 'VIEW'} type="number" required min="1" className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#1f8898] bg-gray-50 disabled:bg-gray-100 disabled:opacity-80 font-bold text-gray-900 text-sm" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
                    </div>
                </div>

                <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Description</label>
                    <input disabled={modalMode === 'VIEW'} type="text" required placeholder="e.g. Fixed leaking pipe in Unit 102" className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#1f8898] bg-gray-50 disabled:bg-gray-100 disabled:opacity-80 font-bold text-gray-900 text-sm" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                </div>

                <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Date Incurred</label>
                    <input disabled={modalMode === 'VIEW'} type="date" required className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#1f8898] bg-gray-50 disabled:bg-gray-100 disabled:opacity-80 font-bold text-gray-700 text-sm" value={formData.date_incurred} onChange={(e) => setFormData({...formData, date_incurred: e.target.value})} />
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsExpenseModalOpen(false)} className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-colors ${modalMode === 'VIEW' ? 'bg-gray-900 text-white w-full' : 'text-gray-600 hover:bg-gray-100'}`}>
                      {modalMode === 'VIEW' ? 'Close' : 'Cancel'}
                  </button>
                  {modalMode !== 'VIEW' && (
                      <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 text-sm font-bold text-[#ffffff] bg-[#1f8898] hover:bg-[#1a7684] rounded-xl shadow-lg shadow-[#1f8898]/20 disabled:opacity-50 flex items-center justify-center gap-2">
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} 
                        {modalMode === 'CREATE' ? 'Save Expense' : 'Update Expense'}
                      </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}