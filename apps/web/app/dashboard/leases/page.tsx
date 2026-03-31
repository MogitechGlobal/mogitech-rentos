// apps/web/app/dashboard/leases/page.tsx
/* eslint-disable */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileSignature, Home, Calendar, CheckCircle2, 
  XCircle, Clock, Search, Edit, Trash2, X, 
  Loader2, AlertCircle, CalendarDays,
  LogOut, ShieldAlert, Crown, Download, RefreshCw, FileText
} from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';

export default function MasterLeasesPage() {
  const router = useRouter();
  const { profile } = useUserStore(); // Pull user tier for feature gating

  const [tenants, setTenants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

  // --- Filtering States ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // --- Modals State ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLease, setSelectedLease] = useState<any>(null);

  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', phone: '', lease_start: '', lease_end: ''
  });

  const currentPlan = profile?.subscription_status || profile?.landlord?.subscription_status || 'FREE';
  const isPro = currentPlan === 'PRO' || currentPlan === 'PREMIUM';

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants`, {
        credentials: 'include' 
      });
      
      if (res.status === 401 || res.status === 403) return router.push('/login');
      if (!res.ok) throw new Error('Failed to load lease data.');
      
      setTenants(await res.json());
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  // --- PREMIUM FEATURES ---

  const handleExportCSV = () => {
    const headers = ['Tenant Name', 'Property', 'Unit', 'Lease Start', 'Lease End', 'Status'];
    const csvRows = filteredLeases.map(t => {
      return [
        `"${t.first_name} ${t.last_name}"`,
        `"${t.unit?.property?.name || 'N/A'}"`,
        `"${t.unit?.unit_number || 'N/A'}"`,
        `"${new Date(t.lease_start).toLocaleDateString()}"`,
        `"${new Date(t.lease_end).toLocaleDateString()}"`,
        `"${t.is_active ? 'Active' : 'Terminated'}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Lease_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handle1ClickRenew = async (tenant: any) => {
    if (!isPro) {
      router.push('/dashboard/settings/billing');
      return;
    }

    // Pro Feature: Auto-add 1 year to the current lease end date
    const currentEndDate = new Date(tenant.lease_end);
    const newEndDate = new Date(currentEndDate.setFullYear(currentEndDate.getFullYear() + 1));
    
    setStatusMsg({ type: 'info', text: 'Processing renewal...' });
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants/${tenant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...tenant,
          lease_start: tenant.lease_start, // Keep original start
          lease_end: newEndDate.toISOString()
        })
      });

      if (!res.ok) throw new Error('Failed to auto-renew lease.');

      setStatusMsg({ type: 'success', text: `Lease successfully renewed for 1 year until ${newEndDate.toLocaleDateString()}!` });
      await fetchData();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    }
  };

  const handleDownloadContract = () => {
    if (!isPro) {
      router.push('/dashboard/settings/billing');
      return;
    }
    // Simulation of a PDF generation backend call
    setStatusMsg({ type: 'success', text: 'Lease agreement PDF generated and downloaded.' });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // --- STANDARD ACTIONS ---

  const openEditModal = (tenant: any) => {
    setSelectedLease(tenant);
    setFormData({
      first_name: tenant.first_name,
      last_name: tenant.last_name,
      email: tenant.email,
      phone: tenant.phone,
      lease_start: tenant.lease_start ? new Date(tenant.lease_start).toISOString().split('T')[0] : '',
      lease_end: tenant.lease_end ? new Date(tenant.lease_end).toISOString().split('T')[0] : ''
    });
    setIsEditModalOpen(true);
  };

  const handleEditLease = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants/${selectedLease.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }, 
        credentials: 'include', 
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to update lease agreements.');

      setStatusMsg({ type: 'success', text: `Lease dates updated successfully!` });
      setIsEditModalOpen(false);
      await fetchData();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  const openTerminateModal = (tenant: any) => {
    setSelectedLease(tenant);
    setIsTerminateModalOpen(true);
  };

  const handleTerminateLease = async () => {
    setIsSubmitting(true);
    setStatusMsg(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants/${selectedLease.id}`, {
        method: 'DELETE',
        credentials: 'include' 
      });

      if (!res.ok) throw new Error('Failed to terminate lease.');
      
      setStatusMsg({ type: 'success', text: `Lease terminated successfully. Unit is now vacant.` });
      setIsTerminateModalOpen(false);
      await fetchData(); 
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  // --- Data Processing ---
  const now = new Date();
  const sixtyDaysFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

  const isExpiringSoon = (endDateStr: string, isActive: boolean) => {
    if (!isActive) return false;
    const end = new Date(endDateStr);
    return end <= sixtyDaysFromNow && end >= now;
  };

  const totalLeases = tenants.length;
  const activeCount = tenants.filter(t => t.is_active).length;
  const expiringCount = tenants.filter(t => isExpiringSoon(t.lease_end, t.is_active)).length;
  const terminatedCount = tenants.filter(t => !t.is_active).length;

  const filteredLeases = tenants.filter(tenant => {
    const searchString = `${tenant.first_name} ${tenant.last_name} ${tenant.unit?.property?.name} ${tenant.unit?.unit_number}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    const expiring = isExpiringSoon(tenant.lease_end, tenant.is_active);
    
    const matchesStatus = 
      filterStatus === 'ALL' || 
      (filterStatus === 'ACTIVE' && tenant.is_active) ||
      (filterStatus === 'EXPIRING' && expiring) ||
      (filterStatus === 'TERMINATED' && !tenant.is_active);

    return matchesSearch && matchesStatus;
  });

  const getFilterPillClass = (status: string) => {
    const isActive = filterStatus === status;
    return `px-5 py-2 rounded-full text-sm font-bold transition-all ${
      isActive ? 'bg-[#1f8898] text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
    }`;
  };

  return (
    <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans selection:bg-[#1f8898]/30 overflow-x-hidden">
      
      <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-6 pt-8 pb-14 md:pt-10 md:pb-16 relative overflow-hidden shadow-inner">
        <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-100 text-xs font-bold uppercase tracking-widest mb-3 border border-white/20 backdrop-blur-sm">
                <FileSignature className="w-3.5 h-3.5" /> Contracts & Compliance
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[#ffffff] tracking-tight mb-2">
              Lease Management
            </h1>
            <p className="text-teal-100 text-sm md:text-base font-medium max-w-xl leading-relaxed">
              Monitor contract durations, process upcoming renewals, and safely manage lease terminations.
            </p>
          </div>

          <div className="flex mt-2 md:mt-0">
            <button 
              onClick={handleExportCSV}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-2.5 rounded-xl font-black text-sm backdrop-blur-md transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
            >
              <Download className="w-4 h-4" /> Export Ledger
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
            <span className="font-bold text-sm">{statusMsg.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          
          <div className="bg-[#ffffff] p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-gray-100 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600 border border-gray-200">
                <FileSignature className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 text-right leading-tight">Total<br/>Contracts</span>
            </div>
            <div className="relative z-10">
              <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">{totalLeases}</h4>
              <p className="text-xs text-gray-500 font-medium mt-1">All historical records</p>
            </div>
          </div>

          <div className="bg-[#ffffff] p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 text-right leading-tight">Active<br/>Leases</span>
            </div>
            <div className="relative z-10">
              <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">{activeCount}</h4>
              <p className="text-xs text-gray-500 font-medium mt-1">Currently occupied units</p>
            </div>
          </div>

          <div className="bg-[#ffffff] p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 text-right leading-tight">Expiring<br/>Soon</span>
            </div>
            <div className="relative z-10">
              <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">{expiringCount}</h4>
              <p className="text-xs text-gray-500 font-medium mt-1">Ending within 60 days</p>
            </div>
          </div>

          <div className="bg-[#ffffff] p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
                <XCircle className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 text-right leading-tight">Past<br/>Leases</span>
            </div>
            <div className="relative z-10">
              <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">{terminatedCount}</h4>
              <p className="text-xs text-gray-500 font-medium mt-1">Moved out / Terminated</p>
            </div>
          </div>

        </div>

        <div className="bg-[#ffffff] rounded-3xl shadow-lg shadow-black/5 border border-gray-100 overflow-hidden mb-12">
          
          <div className="p-5 border-b border-gray-100 bg-[#f8fafb]/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setFilterStatus('ALL')} className={getFilterPillClass('ALL')}>All Leases</button>
              <button onClick={() => setFilterStatus('ACTIVE')} className={getFilterPillClass('ACTIVE')}>Active</button>
              <button onClick={() => setFilterStatus('EXPIRING')} className={getFilterPillClass('EXPIRING')}>Expiring Soon</button>
              <button onClick={() => setFilterStatus('TERMINATED')} className={getFilterPillClass('TERMINATED')}>Terminated</button>
            </div>

            <div className="relative w-full lg:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input 
                type="text" placeholder="Search tenant or property..." 
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all bg-[#ffffff]"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto min-h-[400px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 text-[#1f8898] gap-4">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="font-bold text-sm uppercase tracking-widest text-gray-400">Loading Contracts...</span>
              </div>
            ) : (
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-gray-100 bg-[#ffffff] text-[10px] uppercase tracking-widest text-gray-400 font-black">
                    <th className="px-6 py-4 pl-8">Contract Party</th>
                    <th className="px-6 py-4">Unit Assigned</th>
                    <th className="px-6 py-4">Lease Duration</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right pr-8">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-[#ffffff]">
                  {filteredLeases.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <div className="w-16 h-16 bg-[#ebf3f5] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#1f8898]">
                          <FileSignature className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No leases found</h3>
                        <p className="text-sm text-gray-500 font-medium">No contracts match your current filter criteria.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredLeases.map((tenant) => {
                      const expiring = isExpiringSoon(tenant.lease_end, tenant.is_active);
                      
                      return (
                        <tr key={tenant.id} className={`hover:bg-gray-50/50 transition duration-150 group ${!tenant.is_active ? 'opacity-70' : ''}`}>
                          <td className="px-6 py-4 pl-8">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-[#ebf3f5] text-[#1f8898] flex items-center justify-center font-black shadow-sm border border-[#1f8898]/10 shrink-0">
                                <FileSignature className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 group-hover:text-[#1f8898] transition-colors">{tenant.first_name} {tenant.last_name}</p>
                                <p className="text-[10px] text-gray-500 font-bold tracking-wide mt-0.5">{tenant.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-gray-900 font-bold">
                              <Home className="w-4 h-4 text-gray-400 group-hover:text-[#1f8898] transition-colors" />
                              {tenant.unit?.property?.name || 'N/A'}
                            </div>
                            <p className="text-[10px] text-gray-500 font-bold tracking-wide mt-1 uppercase">
                              Unit {tenant.unit?.unit_number || 'N/A'}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 font-bold flex items-center gap-1.5 mb-0.5">
                              <CalendarDays className="w-3.5 h-3.5 text-[#1f8898]" />
                              {new Date(tenant.lease_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            <div className="text-sm text-gray-500 font-medium flex items-center gap-1.5 pl-5">
                              <span className="text-gray-300">to</span> {new Date(tenant.lease_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center">
                              {!tenant.is_active ? (
                                <span className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg border bg-gray-50 text-gray-500 border-gray-200 flex items-center gap-1.5 w-max">
                                  <XCircle className="w-3 h-3" /> Terminated
                                </span>
                              ) : expiring ? (
                                <span className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg border bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1.5 w-max">
                                  <Clock className="w-3 h-3" /> Expiring Soon
                                </span>
                              ) : (
                                <span className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg border bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1.5 w-max">
                                  <CheckCircle2 className="w-3 h-3" /> Active Lease
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 pr-8 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {tenant.is_active && (
                                <>
                                  {/* PRO FEATURE: 1-Click Renew */}
                                  <button
                                    onClick={() => handle1ClickRenew(tenant)}
                                    className={`p-2 border rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1.5 px-3 ${
                                      isPro 
                                      ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 border-emerald-100' 
                                      : 'bg-gray-50 text-gray-400 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200'
                                    }`}
                                    title={isPro ? "Auto-Renew for 1 Year" : "Pro Feature: 1-Click Renewal"}
                                  >
                                    {!isPro && <Crown className="w-3 h-3 text-amber-400" />}
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Renew</span>
                                  </button>

                                  {/* PRO FEATURE: Download Contract */}
                                  <button
                                    onClick={handleDownloadContract}
                                    className="p-2 bg-[#ffffff] text-gray-400 hover:text-blue-600 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-xl transition-all shadow-sm active:scale-95"
                                    title={isPro ? "Download Contract PDF" : "Pro Feature: Document Generation"}
                                  >
                                    {!isPro ? <Crown className="w-4 h-4 text-amber-400" /> : <FileText className="w-4 h-4" />}
                                  </button>

                                  <div className="w-px h-6 bg-gray-200 mx-1"></div>

                                  <button
                                    onClick={() => openEditModal(tenant)}
                                    className="p-2 bg-[#ffffff] text-gray-400 hover:text-[#1f8898] hover:bg-[#ebf3f5] border border-gray-200 hover:border-[#1f8898]/30 rounded-xl transition-all shadow-sm active:scale-95"
                                    title="Edit Dates manually"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => openTerminateModal(tenant)}
                                    className="p-2 bg-[#ffffff] text-gray-400 hover:text-rose-600 hover:bg-rose-50 border border-gray-200 hover:border-rose-200 rounded-xl transition-all shadow-sm active:scale-95"
                                    title="Terminate Lease"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              {!tenant.is_active && (
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3">Archived</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* --- Edit Lease Modal --- */}
      {isEditModalOpen && selectedLease && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => !isSubmitting && setIsEditModalOpen(false)}></div>
          
          <div className="relative w-full max-w-md bg-[#ffffff] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="bg-[#f8fafb] px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#ebf3f5] rounded-xl flex items-center justify-center text-[#1f8898]">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 tracking-tight">Modify Lease Dates</h3>
                  <p className="text-xs font-medium text-[#1f8898]">For {selectedLease.first_name} {selectedLease.last_name}</p>
                </div>
              </div>
              <button onClick={() => !isSubmitting && setIsEditModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditLease} className="p-6 space-y-5">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-2">
                <p className="text-xs text-gray-500 font-medium mb-1">Assigned Property</p>
                <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <Home className="w-4 h-4 text-[#1f8898]" /> {selectedLease.unit?.property?.name} - Unit {selectedLease.unit?.unit_number}
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Lease Start</label>
                <div className="relative">
                  <CalendarDays className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
                  <input type="date" required className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-white font-bold text-gray-900 cursor-pointer" value={formData.lease_start} onChange={(e) => setFormData({...formData, lease_start: e.target.value})} />
                </div>
              </div>
              
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Lease End</label>
                <div className="relative">
                  <CalendarDays className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
                  <input type="date" required className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-white font-bold text-gray-900 cursor-pointer" value={formData.lease_end} onChange={(e) => setFormData({...formData, lease_end: e.target.value})} />
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-3 text-sm font-bold text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-100 rounded-xl transition-colors border border-gray-200">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-3 text-sm font-bold text-[#ffffff] bg-[#1f8898] hover:bg-[#1a7684] rounded-xl transition-all shadow-lg shadow-[#1f8898]/20 disabled:opacity-50 flex items-center gap-2 active:scale-95">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {isSubmitting ? 'Saving...' : 'Update Dates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Terminate Confirmation Modal --- */}
      {isTerminateModalOpen && selectedLease && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => !isSubmitting && setIsTerminateModalOpen(false)}></div>
          
          <div className="relative w-full max-w-md bg-[#ffffff] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 p-8">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-6 border border-rose-100">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight mb-2">Terminate Lease Contract?</h3>
            <p className="text-sm font-medium text-gray-500 mb-6 leading-relaxed">
              Are you sure you want to end the lease for <strong className="text-gray-900">{selectedLease.first_name} {selectedLease.last_name}</strong>? This will permanently archive the contract and free up unit <strong className="text-gray-900">{selectedLease.unit?.unit_number}</strong>.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setIsTerminateModalOpen(false)} className="flex-1 px-5 py-3 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
              <button onClick={handleTerminateLease} disabled={isSubmitting} className="flex-[1.5] px-5 py-3 text-sm font-bold text-[#ffffff] bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-lg shadow-rose-600/20 flex justify-center items-center gap-2 active:scale-95">
                 {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />} Terminate Lease
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}