// apps/web/app/dashboard/tenants/page.tsx
/* eslint-disable */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, Mail, Home, CheckCircle2, Clock, 
  FileWarning, Plus, X, Building2, DoorOpen, 
  Calendar, Loader2, Trash2, Search, AlertCircle,
  ShieldAlert, LogOut, ArrowRight, CreditCard,
  UserPlus, Edit, AlertOctagon
} from 'lucide-react';

export default function TenantDirectoryPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // --- Filtering States ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // --- Modals State ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedTenant, setSelectedTenant] = useState<any>(null);

  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', phone: '', 
    property_id: '', unit_id: '', lease_start: '', lease_end: ''
  });

  const now = new Date();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentBillingMonth = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

  const fetchData = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return router.push('/login');

    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [tenantsRes, propsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants', { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties', { headers })
      ]);
      
      if (!tenantsRes.ok || !propsRes.ok) throw new Error('Failed to load directory data');
      
      setTenants(await tenantsRes.json());
      setProperties(await propsRes.json());
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- ACTIONS ---

  const openAddModal = () => {
    setFormData({ first_name: '', last_name: '', email: '', phone: '', property_id: '', unit_id: '', lease_start: '', lease_end: '' });
    setIsAddModalOpen(true);
  };

  const handleRegisterTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg(null);

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`http://localhost:3000/api/v1/tenants/onboard/${formData.unit_id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      setStatusMsg({ type: 'success', text: `${formData.first_name} ${formData.last_name} successfully onboarded!` });
      setIsAddModalOpen(false);
      await fetchData();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  const openEditModal = (tenant: any) => {
    setSelectedTenant(tenant);
    setFormData({
      first_name: tenant.first_name,
      last_name: tenant.last_name,
      email: tenant.email,
      phone: tenant.phone,
      property_id: tenant.unit?.property?.id || '',
      unit_id: tenant.unit_id || '',
      lease_start: tenant.lease_start ? new Date(tenant.lease_start).toISOString().split('T')[0] : '',
      lease_end: tenant.lease_end ? new Date(tenant.lease_end).toISOString().split('T')[0] : ''
    });
    setIsEditModalOpen(true);
  };

  const handleEditTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg(null);

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`http://localhost:3000/api/v1/tenants/${selectedTenant.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to update tenant details');

      setStatusMsg({ type: 'success', text: `Tenant details updated successfully!` });
      setIsEditModalOpen(false);
      await fetchData();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  const openDeleteModal = (tenant: any) => {
    setSelectedTenant(tenant);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    setStatusMsg(null);

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`http://localhost:3000/api/v1/tenants/${selectedTenant.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to delete tenant');
      
      setStatusMsg({ type: 'success', text: `Tenant deleted and moved out successfully.` });
      setIsDeleteModalOpen(false);
      await fetchData(); 
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  // --- Data Processing & Filtering ---
  
  const sixtyDaysFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
  const expiringLeasesCount = tenants.filter(t => new Date(t.lease_end) <= sixtyDaysFromNow && new Date(t.lease_end) > now).length;
  
  const arrearsCount = tenants.filter(t => {
    const currentInvoice = t.invoices?.find((inv: any) => inv.description.includes(currentBillingMonth));
    return !currentInvoice || currentInvoice.status !== 'PAID';
  }).length;

  const filteredTenants = tenants.filter(tenant => {
    const searchString = `${tenant.first_name} ${tenant.last_name} ${tenant.email} ${tenant.unit?.unit_number}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    
    const currentInvoice = tenant.invoices?.find((inv: any) => inv.description.includes(currentBillingMonth));
    const isPaid = currentInvoice?.status === 'PAID';
    
    const matchesStatus = 
      filterStatus === 'ALL' || 
      (filterStatus === 'PAID' && isPaid) ||
      (filterStatus === 'ARREARS' && !isPaid);

    return matchesSearch && matchesStatus;
  });

  const selectedProperty = properties.find(p => p.id === formData.property_id);
  // If editing, we must include the tenant's current unit in the list so the select doesn't break
  const availableUnits = selectedProperty?.units?.filter((u: any) => 
    u.status === 'VACANT' || (isEditModalOpen && u.id === formData.unit_id)
  ) || [];

  const getFilterPillClass = (status: string) => {
    const isActive = filterStatus === status;
    return `px-5 py-2 rounded-full text-sm font-bold transition-all ${
      isActive ? 'bg-[#1f8898] text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
    }`;
  };

  return (
    <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans selection:bg-[#1f8898]/30 overflow-x-hidden">
      
      {/* --- Premium Gradient Hero Area --- */}
      <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-6 pt-8 pb-14 md:pt-10 md:pb-16 relative overflow-hidden shadow-inner">
        <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-100 text-xs font-bold uppercase tracking-widest mb-3 border border-white/20 backdrop-blur-sm">
                <Users className="w-3.5 h-3.5" /> Identity & Access
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[#ffffff] tracking-tight mb-2">
              Tenant Directory
            </h1>
            <p className="text-teal-100 text-sm md:text-base font-medium max-w-xl leading-relaxed">
              Manage leases, track compliance, and oversee billing statuses for all active residents.
            </p>
          </div>

          <div className="flex mt-2 md:mt-0">
            <button 
              onClick={openAddModal}
              className="bg-[#ffffff] hover:bg-gray-50 text-[#1f8898] px-6 py-2.5 rounded-xl font-black text-sm shadow-xl shadow-black/10 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" /> Onboard Tenant
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 md:-mt-10 relative z-20">
        
        {/* Inline Status Notifications */}
        {statusMsg && (
          <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 shadow-lg animate-in fade-in slide-in-from-top-4 border
            ${statusMsg.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}
          `}>
            {statusMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <span className="font-bold text-sm">{statusMsg.text}</span>
          </div>
        )}

        {/* --- Bento Box Analytics Grid --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          
          <div className="bg-[#ffffff] p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#ebf3f5] rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-[#ebf3f5] flex items-center justify-center text-[#1f8898] border border-[#1f8898]/10">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#1f8898] text-right leading-tight">Active<br/>Residents</span>
            </div>
            <div className="relative z-10">
              <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">{tenants.length}</h4>
              <p className="text-xs text-gray-500 font-medium mt-1">Total registered profiles</p>
            </div>
          </div>

          <div className="bg-[#ffffff] p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 text-right leading-tight">Good<br/>Standing</span>
            </div>
            <div className="relative z-10">
              <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">{tenants.length - arrearsCount}</h4>
              <p className="text-xs text-gray-500 font-medium mt-1">Up to date on payments</p>
            </div>
          </div>

          <div className="bg-[#ffffff] p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 text-right leading-tight">Requires<br/>Attention</span>
            </div>
            <div className="relative z-10">
              <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">{arrearsCount}</h4>
              <p className="text-xs text-gray-500 font-medium mt-1">Pending current invoices</p>
            </div>
          </div>

          <div className="bg-[#ffffff] p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 text-right leading-tight">Expiring<br/>Leases</span>
            </div>
            <div className="relative z-10">
              <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">{expiringLeasesCount}</h4>
              <p className="text-xs text-gray-500 font-medium mt-1">Ending within 60 days</p>
            </div>
          </div>

        </div>

        {/* --- Toolbar & Grid --- */}
        <div className="bg-[#ffffff] rounded-3xl shadow-lg shadow-black/5 border border-gray-100 overflow-hidden mb-12">
          
          {/* Filtering Toolbar */}
          <div className="p-5 border-b border-gray-100 bg-[#f8fafb]/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setFilterStatus('ALL')} className={getFilterPillClass('ALL')}>All Residents</button>
              <button onClick={() => setFilterStatus('PAID')} className={getFilterPillClass('PAID')}>Fully Paid</button>
              <button onClick={() => setFilterStatus('ARREARS')} className={getFilterPillClass('ARREARS')}>In Arrears</button>
            </div>

            <div className="relative w-full lg:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input 
                type="text" placeholder="Search name or unit..." 
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all bg-[#ffffff]"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Directory Table */}
          <div className="overflow-x-auto min-h-[400px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 text-[#1f8898] gap-4">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="font-bold text-sm uppercase tracking-widest text-gray-400">Loading Directory...</span>
              </div>
            ) : (
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-gray-100 bg-[#ffffff] text-[10px] uppercase tracking-widest text-gray-400 font-black">
                    <th className="px-6 py-4 pl-8">Resident Details</th>
                    <th className="px-6 py-4">Property & Unit</th>
                    <th className="px-6 py-4">Lease Status</th>
                    <th className="px-6 py-4 text-center">Billing Status</th>
                    <th className="px-6 py-4 text-right pr-8">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-[#ffffff]">
                  {filteredTenants.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <div className="w-16 h-16 bg-[#ebf3f5] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#1f8898]">
                          <Users className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No residents found</h3>
                        <p className="text-sm text-gray-500 font-medium">Adjust your filters or onboard a new tenant.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredTenants.map((tenant) => {
                      const currentInvoice = tenant.invoices?.find((inv: any) => inv.description.includes(currentBillingMonth));
                      
                      return (
                        <tr key={tenant.id} className="hover:bg-gray-50/50 transition duration-150 group">
                          <td className="px-6 py-4 pl-8">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1f8898] to-[#146a77] flex items-center justify-center text-[#ffffff] font-black text-sm shadow-sm shrink-0">
                                {tenant.first_name[0]}{tenant.last_name[0]}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 group-hover:text-[#1f8898] transition-colors">{tenant.first_name} {tenant.last_name}</p>
                                <p className="text-[11px] text-gray-500 font-bold tracking-wide mt-0.5">{tenant.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-gray-900 font-bold">
                              <Home className="w-4 h-4 text-gray-400 group-hover:text-[#1f8898] transition-colors" />
                              {tenant.unit?.property?.name}
                            </div>
                            <p className="text-[10px] text-gray-500 font-bold tracking-wide mt-1 uppercase">
                              Unit {tenant.unit?.unit_number}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600 font-bold flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              Ends {new Date(tenant.lease_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center">
                              {!currentInvoice ? (
                                <span className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg border bg-rose-50 text-rose-700 border-rose-200 flex items-center gap-1.5 w-max">
                                  <FileWarning className="w-3 h-3" /> Unbilled
                                </span>
                              ) : currentInvoice.status === 'PAID' ? (
                                <span className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg border bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1.5 w-max">
                                  <CheckCircle2 className="w-3 h-3" /> Settled
                                </span>
                              ) : (
                                <span className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg border bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1.5 w-max">
                                  <Clock className="w-3 h-3" /> Pending
                                </span>
                              )}
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 pr-8 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditModal(tenant)}
                                className="p-2 bg-[#ffffff] text-gray-400 hover:text-[#1f8898] hover:bg-[#ebf3f5] border border-gray-200 hover:border-transparent rounded-xl transition-all shadow-sm active:scale-95"
                                title="Edit Tenant Details"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openDeleteModal(tenant)}
                                className="p-2 bg-[#ffffff] text-gray-400 hover:text-rose-600 hover:bg-rose-50 border border-gray-200 hover:border-transparent rounded-xl transition-all shadow-sm active:scale-95"
                                title="Move Out / Delete Tenant"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
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

      {/* --- Premium Unified Onboarding/Edit Modal --- */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => !isSubmitting && (setIsAddModalOpen(false), setIsEditModalOpen(false))}></div>
          
          <div className="relative w-full max-w-2xl bg-[#ffffff] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 flex flex-col max-h-[90vh]">
            <div className="bg-[#f8fafb] px-6 py-5 border-b border-gray-100 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#ebf3f5] rounded-xl flex items-center justify-center text-[#1f8898]">
                  {isEditModalOpen ? <Edit className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 tracking-tight">
                    {isEditModalOpen ? 'Edit Tenant Details' : 'Onboard New Tenant'}
                  </h3>
                  <p className="text-xs font-medium text-[#1f8898]">
                    {isEditModalOpen ? 'Update personal and lease info' : 'Assign a resident to an available unit'}
                  </p>
                </div>
              </div>
              <button onClick={() => !isSubmitting && (setIsAddModalOpen(false), setIsEditModalOpen(false))} className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <form id="tenant-form" onSubmit={isEditModalOpen ? handleEditTenant : handleRegisterTenant} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">First Name</label>
                    <input type="text" required placeholder="e.g. Jacobs" className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-gray-50 font-bold text-gray-900" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Last Name</label>
                    <input type="text" required placeholder="e.g. Mogire" className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-gray-50 font-bold text-gray-900" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
                      <input type="email" required placeholder="jacobs@example.com" className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-gray-50 font-bold text-gray-900" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Phone Number</label>
                    <input type="tel" required placeholder="07XXXXXXXX" className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-gray-50 font-bold text-gray-900" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                  </div>
                </div>

                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1 flex items-center gap-1.5"><Building2 className="w-3 h-3" /> Select Property</label>
                      <select required disabled={isEditModalOpen} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-white font-bold text-gray-700 cursor-pointer disabled:bg-gray-100 disabled:text-gray-400" value={formData.property_id} onChange={(e) => setFormData({...formData, property_id: e.target.value, unit_id: ''})}>
                        <option value="">Choose a Property...</option>
                        {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1 flex items-center gap-1.5"><DoorOpen className="w-3 h-3" /> Select Unit</label>
                      <select required disabled={!formData.property_id || isEditModalOpen} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-white font-bold text-gray-700 cursor-pointer disabled:bg-gray-100 disabled:text-gray-400" value={formData.unit_id} onChange={(e) => setFormData({...formData, unit_id: e.target.value})}>
                        <option value="">{formData.property_id ? 'Choose a Unit...' : 'Select property first'}</option>
                        {availableUnits.map((u: any) => (
                          <option key={u.id} value={u.id}>{u.unit_number} (KSH {u.rent_amount.toLocaleString()})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Lease Start</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
                        <input type="date" required className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-white font-bold text-gray-900 cursor-pointer" value={formData.lease_start} onChange={(e) => setFormData({...formData, lease_start: e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Lease End</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
                        <input type="date" required className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-white font-bold text-gray-900 cursor-pointer" value={formData.lease_end} onChange={(e) => setFormData({...formData, lease_end: e.target.value})} />
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="px-6 py-5 border-t border-gray-100 bg-[#f8fafb] flex justify-end gap-3 shrink-0">
              <button type="button" onClick={() => {setIsAddModalOpen(false); setIsEditModalOpen(false);}} className="px-5 py-3 text-sm font-bold text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-100 rounded-xl transition-colors border border-gray-200">
                Cancel
              </button>
              <button type="submit" form="tenant-form" disabled={isSubmitting || !formData.unit_id} className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-[#ffffff] bg-[#1f8898] hover:bg-[#1a7684] shadow-lg shadow-[#1f8898]/20 transition-all disabled:opacity-60 active:scale-95">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {isSubmitting ? 'Saving...' : (isEditModalOpen ? 'Save Changes' : 'Complete Onboarding')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Delete / Move Out Confirmation Modal --- */}
      {isDeleteModalOpen && selectedTenant && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => !isSubmitting && setIsDeleteModalOpen(false)}></div>
          
          <div className="relative w-full max-w-md bg-[#ffffff] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 p-8">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-6 border border-rose-100">
              <AlertOctagon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight mb-2">Delete & Move Out Tenant?</h3>
            <p className="text-sm font-medium text-gray-500 mb-6 leading-relaxed">
              Are you sure you want to permanently remove <strong className="text-gray-900">{selectedTenant.first_name} {selectedTenant.last_name}</strong> from the system? Their portal access will be revoked and unit <strong className="text-gray-900">{selectedTenant.unit?.unit_number}</strong> will become vacant.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-5 py-3 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
              <button onClick={handleDelete} disabled={isSubmitting} className="flex-[1.5] px-5 py-3 text-sm font-bold text-[#ffffff] bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-lg shadow-rose-600/20 flex justify-center items-center gap-2 active:scale-95">
                 {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}