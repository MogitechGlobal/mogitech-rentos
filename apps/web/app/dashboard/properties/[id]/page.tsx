// apps/web/app/dashboard/properties/[id]/page.tsx
/* eslint-disable */
'use client';

export const runtime = 'edge';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  MapPin, Plus, UserPlus, Home, X, CheckCircle2, 
  AlertCircle, Building2, Search, Wallet, DoorOpen, 
  Users, Layers, Loader2, ArrowLeft, ArrowRight,
  Edit, Trash2, LogOut, AlertOctagon
} from 'lucide-react';
import Link from 'next/link';
import { useUserStore } from '@/store/useUserStore';

export default function PropertyDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id;

  const { profile } = useUserStore(); // <-- Pull the global profile for limits!

  const [property, setProperty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // --- Filtering States ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // --- Modals State ---
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [isEditUnitModalOpen, setIsEditUnitModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
  const [isMoveOutModalOpen, setIsMoveOutModalOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // --- Target Items ---
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);

  // --- Form Data ---
  const [unitFormData, setUnitFormData] = useState({ unit_number: '', rent_amount: '' });
  const [tenantFormData, setTenantFormData] = useState({
    first_name: '', last_name: '', email: '', phone: '', lease_start: '', lease_end: ''
  });

  const fetchPropertyData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties/${propertyId}/units`, {
        credentials: 'include' 
      });
      
      if (res.status === 401 || res.status === 403) return router.push('/login');
      
      if (!res.ok) throw new Error('Failed to load property details.');
      const data = await res.json();
      setProperty(data);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (propertyId) fetchPropertyData();
  }, [propertyId, router]);

  // --- 1. UNIT ACTIONS ---

  const openAddUnitModal = () => {
    // ==========================================
    // FRONTEND SUBSCRIPTION LIMIT ENFORCEMENT
    // ==========================================
    const currentPlan = profile?.subscription_status || profile?.landlord?.subscription_status || 'FREE';
    const isPro = currentPlan === 'PRO' || currentPlan === 'PREMIUM';
    const isBasic = currentPlan === 'BASIC';
    const isStarter = !isPro && !isBasic;

    const registrationDate = profile?.created_at || profile?.landlord?.created_at;
    const isStarterExpired = isStarter && registrationDate && 
      (new Date().getTime() - new Date(registrationDate).getTime() > 90 * 24 * 60 * 60 * 1000); // 90 Days

    // 1. Check 3-Month Free Trial Expiration
    if (isStarterExpired) {
      setStatusMsg({ type: 'error', text: 'Your 3-month Starter plan has expired. Please upgrade to continue adding units.' });
      setTimeout(() => router.push('/dashboard/settings/billing'), 3000);
      return;
    }

    const currentUnitsCount = property?.units?.length || 0;
    
    // 2. Check Starter Plan Unit Limit (Soft check for this specific property)
    if (isStarter && currentUnitsCount >= 3) {
      setStatusMsg({ type: 'error', text: 'Starter plan allows a maximum of 3 units. Please upgrade to Basic or Pro to add more.' });
      setTimeout(() => router.push('/dashboard/settings/billing'), 3000);
      return;
    }

    // 3. Check Basic Plan Unit Limit (Soft check for this specific property)
    if (isBasic && currentUnitsCount >= 30) {
      setStatusMsg({ type: 'error', text: 'Basic plan allows a maximum of 30 units. Please upgrade to Pro for unlimited units.' });
      setTimeout(() => router.push('/dashboard/settings/billing'), 3000);
      return;
    }
    // ==========================================

    setUnitFormData({ unit_number: '', rent_amount: '' });
    setIsUnitModalOpen(true);
  };

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties/${propertyId}/units`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, 
        credentials: 'include', 
        body: JSON.stringify(unitFormData),
      });
      
      if (res.status === 401) return router.push('/login');
      
      if (!res.ok) {
        // Extract exact backend error to catch global unit limits across multiple properties
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to create unit');
      }
      
      setStatusMsg({ type: 'success', text: `Unit added successfully.` });
      setIsUnitModalOpen(false);
      setUnitFormData({ unit_number: '', rent_amount: '' });
      fetchPropertyData(); 
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
      // If it's a limit error from the backend, auto-redirect them to billing
      if (err.message.toLowerCase().includes('limit reached') || err.message.toLowerCase().includes('expired')) {
        setTimeout(() => router.push('/dashboard/settings/billing'), 4000);
      }
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  const openEditUnitModal = (unit: any) => {
    setSelectedUnit(unit);
    setUnitFormData({ unit_number: unit.unit_number, rent_amount: unit.rent_amount.toString() });
    setIsEditUnitModalOpen(true);
  };

  const handleEditUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/units/${selectedUnit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }, 
        credentials: 'include', 
        body: JSON.stringify(unitFormData),
      });
      
      if (res.status === 401) return router.push('/login');
      if (!res.ok) throw new Error('Failed to update unit');
      
      setStatusMsg({ type: 'success', text: `Unit updated successfully.` });
      setIsEditUnitModalOpen(false);
      fetchPropertyData(); 
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  const openDeleteModal = (unit: any) => {
    setSelectedUnit(unit);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteUnit = async () => {
    setIsSubmitting(true);
    setStatusMsg(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/units/${selectedUnit.id}`, {
        method: 'DELETE',
        credentials: 'include' 
      });
      
      if (res.status === 401) return router.push('/login');
      if (!res.ok) throw new Error('Failed to delete unit. It may have active dependencies.');
      
      setStatusMsg({ type: 'success', text: `Unit deleted successfully.` });
      setIsDeleteModalOpen(false);
      fetchPropertyData(); 
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  // --- 2. TENANT ACTIONS ---

  const openTenantModal = (unit: any) => {
    setSelectedUnit(unit);
    setIsTenantModalOpen(true);
  };

  const handleAddTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/units/${selectedUnit.id}/tenants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, 
        credentials: 'include', 
        body: JSON.stringify(tenantFormData),
      });

      if (res.status === 401) return router.push('/login');
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to register tenant');
      }

      setStatusMsg({ type: 'success', text: 'Tenant registered and moved in successfully!' });
      setIsTenantModalOpen(false);
      setTenantFormData({ first_name: '', last_name: '', email: '', phone: '', lease_start: '', lease_end: '' });
      fetchPropertyData(); 
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  const openMoveOutModal = (unit: any, tenant: any) => {
    setSelectedUnit(unit);
    setSelectedTenant(tenant);
    setIsMoveOutModalOpen(true);
  };

  const handleMoveOutTenant = async () => {
    setIsSubmitting(true);
    setStatusMsg(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants/${selectedTenant.id}/move-out`, {
        method: 'POST',
        credentials: 'include' 
      });

      if (res.status === 401) return router.push('/login');
      if (!res.ok) throw new Error('Failed to move out tenant.');

      setStatusMsg({ type: 'success', text: 'Tenant moved out and unit is now vacant.' });
      setIsMoveOutModalOpen(false);
      fetchPropertyData(); 
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };


  // --- Filtering & Analytics Logic ---
  const units = property?.units || [];
  
  const filteredUnits = units.filter((unit: any) => {
    const activeTenant = unit.tenants?.find((t: any) => t.is_active);
    const tenantName = activeTenant ? `${activeTenant.first_name} ${activeTenant.last_name}`.toLowerCase() : '';
    const matchesSearch = unit.unit_number.toLowerCase().includes(searchTerm.toLowerCase()) || tenantName.includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || unit.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalUnits = units.length;
  const occupiedUnits = units.filter((u: any) => u.status === 'OCCUPIED').length;
  const vacantUnits = units.filter((u: any) => u.status === 'VACANT').length;
  const occupancyRate = totalUnits === 0 ? 0 : Math.round((occupiedUnits / totalUnits) * 100);
  const totalPotentialRent = units.reduce((sum: number, u: any) => sum + Number(u.rent_amount), 0);

  const propertyArrears = units.reduce((sum: number, unit: any) => {
    const activeTenant = unit.tenants?.find((t: any) => t.is_active);
    if (!activeTenant || !activeTenant.invoices) return sum;
    const unpaid = activeTenant.invoices
      .filter((inv: any) => inv.status !== 'PAID')
      .reduce((invSum: number, inv: any) => invSum + inv.amount, 0);
    return sum + unpaid;
  }, 0);

  const getFilterPillClass = (status: string) => {
    const isActive = filterStatus === status;
    return `px-5 py-2 rounded-full text-sm font-bold transition-all ${
      isActive 
        ? 'bg-[#1f8898] text-white shadow-md' 
        : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
    }`;
  };

  if (isLoading) return (
    <div className="min-h-screen bg-[#f8fafb] flex flex-col items-center justify-center text-[#1f8898] gap-4">
      <Loader2 className="w-10 h-10 animate-spin" />
      <span className="font-bold text-sm uppercase tracking-widest text-gray-400">Loading Property...</span>
    </div>
  );

  if (!property) return null;

  return (
    <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans selection:bg-[#1f8898]/30 overflow-x-hidden">
      
      <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-6 pt-6 pb-14 md:pt-8 md:pb-16 relative overflow-hidden shadow-inner">
        <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <Link href="/dashboard/properties" className="inline-flex items-center gap-1.5 text-teal-100 hover:text-white font-bold text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Portfolio
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-100 text-xs font-bold uppercase tracking-widest mb-3 border border-white/20 backdrop-blur-sm">
                  <Building2 className="w-3.5 h-3.5" /> {property.type}
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-[#ffffff] tracking-tight mb-2">
                {property.name}
              </h1>
              <p className="text-teal-100 text-sm md:text-base font-medium flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-teal-200" /> {property.address}
              </p>
            </div>

            <div className="flex mt-2 md:mt-0">
              <button 
                onClick={openAddUnitModal}
                className="bg-[#ffffff] hover:bg-gray-50 text-[#1f8898] px-6 py-2.5 rounded-xl font-black text-sm shadow-xl shadow-black/10 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Plus className="w-4 h-4" /> Add Unit
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 md:-mt-10 relative z-20">
        
        {statusMsg && (
          <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 shadow-lg animate-in fade-in slide-in-from-top-4 border
            ${statusMsg.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}
          `}>
            {statusMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <span className="font-bold text-sm">{statusMsg.text}</span>
          </div>
        )}

        {/* --- Analytics Grid --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-[#ffffff] p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 text-right leading-tight">Monthly<br/>Value</span>
            </div>
            <div className="relative z-10">
              <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">KSH {totalPotentialRent.toLocaleString()}</h4>
              <p className="text-xs text-gray-500 font-medium mt-1">100% capacity value</p>
            </div>
          </div>

          <div className="bg-[#ffffff] p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-row items-center justify-between group hover:-translate-y-1 transition-all">
            <div className="flex flex-col min-w-0 pr-2">
              <div className="flex items-center gap-1.5 mb-2">
                  <DoorOpen className="w-4 h-4 text-gray-400" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Occupancy</h3>
              </div>
              <div className="text-2xl font-black text-gray-900 tracking-tight truncate">{occupancyRate}%</div>
              <p className="text-[11px] text-gray-500 font-medium mt-1 truncate">{occupiedUnits} / {totalUnits} Units Leased</p>
            </div>
            <div className="relative w-14 h-14 flex-shrink-0 drop-shadow-sm">
              <svg className="w-full h-full transform -rotate-90 drop-shadow-sm" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f3f4f6" strokeWidth="4.5"></circle>
                <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#1f8898" strokeWidth="4.5" 
                  strokeDasharray={`${occupancyRate}, ${100 - occupancyRate}`} strokeDashoffset="0" strokeLinecap="round">
                </circle>
              </svg>
            </div>
          </div>

          <div className="bg-[#ffffff] p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Available</span>
            </div>
            <div className="relative z-10">
              <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">{vacantUnits}</h4>
              <p className="text-xs text-gray-500 font-medium mt-1">Ready for tenants</p>
            </div>
          </div>

          <div className="bg-[#ffffff] p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
                <AlertCircle className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-600">Arrears</span>
            </div>
            <div className="relative z-10">
              <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">KSH {propertyArrears.toLocaleString()}</h4>
              <p className="text-xs text-gray-500 font-medium mt-1">Unpaid within property</p>
            </div>
          </div>
        </div>

        {/* --- Toolbar & Grid --- */}
        <div className="bg-[#ffffff] rounded-3xl shadow-lg shadow-black/5 border border-gray-100 overflow-hidden mb-12 p-6 md:p-8">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setFilterStatus('ALL')} className={getFilterPillClass('ALL')}>All Units</button>
              <button onClick={() => setFilterStatus('VACANT')} className={getFilterPillClass('VACANT')}>Vacant</button>
              <button onClick={() => setFilterStatus('OCCUPIED')} className={getFilterPillClass('OCCUPIED')}>Occupied</button>
            </div>

            <div className="relative w-full lg:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input 
                type="text" placeholder="Search unit or tenant..." 
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all bg-gray-50"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {filteredUnits.length === 0 ? (
            <div className="bg-gray-50/50 p-12 rounded-3xl border border-dashed border-gray-200 text-center max-w-lg mx-auto">
              <div className="w-16 h-16 bg-[#ebf3f5] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#1f8898]">
                <Home className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">No units found</h3>
              <p className="text-gray-500 font-medium mb-8">Adjust your filters or add new units to this property.</p>
              <button 
                onClick={openAddUnitModal}
                className="bg-[#1f8898] hover:bg-[#1a7684] text-[#ffffff] font-bold py-3 px-6 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" /> Add Unit
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUnits.map((unit: any) => {
                const activeTenant = unit.tenants?.find((t: any) => t.is_active);
                let outstandingBalance = 0;

                if (activeTenant && activeTenant.invoices) {
                  outstandingBalance = activeTenant.invoices
                    .filter((inv: any) => inv.status !== 'PAID')
                    .reduce((sum: number, inv: any) => sum + inv.amount, 0);
                }

                return (
                  <div key={unit.id} className="bg-[#ffffff] p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md hover:border-[#1f8898]/30 transition-all duration-200 group">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-[#1f8898] group-hover:text-white group-hover:border-[#1f8898] transition-colors shrink-0">
                            <DoorOpen className="w-5 h-5" />
                          </div>
                          <h4 className="text-2xl font-black text-gray-900 group-hover:text-[#1f8898] transition-colors">{unit.unit_number}</h4>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {/* Inline Action Buttons */}
                          <button onClick={() => openEditUnitModal(unit)} className="p-1.5 text-gray-400 hover:text-[#1f8898] hover:bg-[#ebf3f5] rounded-lg transition-colors" title="Edit Unit">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => openDeleteModal(unit)} className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete Unit">
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <span className={`ml-1 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg border flex items-center gap-1 shrink-0 ${
                            unit.status === 'VACANT' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {unit.status === 'VACANT' && <CheckCircle2 className="w-3.5 h-3.5" />}
                            {unit.status === 'OCCUPIED' && <Users className="w-3.5 h-3.5" />}
                            {unit.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-500 text-sm font-medium mb-5">
                        Monthly Rent: <span className="text-gray-900 font-bold ml-1">KSH {Number(unit.rent_amount).toLocaleString()}</span>
                      </p>
                    </div>

                    <div className="pt-4 border-t border-gray-50 mt-auto">
                      {unit.status === 'VACANT' ? (
                        <button
                          onClick={() => openTenantModal(unit)}
                          className="w-full bg-[#ebf3f5] hover:bg-[#1f8898] text-[#1f8898] hover:text-[#ffffff] font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                          <UserPlus className="w-4 h-4" /> Move In Tenant
                        </button>
                      ) : (
                        <div className="flex justify-between items-center bg-gray-50/80 p-4 rounded-xl border border-gray-100">
                          <div className="overflow-hidden pr-2">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Current Tenant</p>
                            <p className="text-sm font-bold text-gray-900 truncate">
                              {activeTenant ? `${activeTenant.first_name} ${activeTenant.last_name}` : 'Unknown'}
                            </p>
                            {outstandingBalance > 0 ? (
                               <p className="text-xs font-black text-rose-600 mt-1">Bal: KSH {outstandingBalance.toLocaleString()}</p>
                            ) : (
                               <p className="text-xs font-black text-emerald-600 mt-1">Settled</p>
                            )}
                          </div>
                          
                          {/* Move Out Button */}
                          <button 
                            onClick={() => openMoveOutModal(unit, activeTenant)} 
                            className="bg-white border border-gray-200 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-transparent p-2.5 rounded-xl transition-all shrink-0 active:scale-95 shadow-sm" 
                            title="Move Out Tenant"
                          >
                            <LogOut className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* --- Add/Edit Unit Modal --- */}
      {(isUnitModalOpen || isEditUnitModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => !isSubmitting && setIsUnitModalOpen(false) && setIsEditUnitModalOpen(false)}></div>
          
          <div className="relative w-full max-w-md bg-[#ffffff] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="bg-[#f8fafb] px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#ebf3f5] rounded-xl flex items-center justify-center text-[#1f8898]">
                  {isEditUnitModalOpen ? <Edit className="w-5 h-5" /> : <DoorOpen className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 tracking-tight">
                    {isEditUnitModalOpen ? 'Edit Unit' : 'Add New Unit'}
                  </h3>
                  <p className="text-xs font-medium text-gray-500">
                    {isEditUnitModalOpen ? 'Update space details' : 'Create a lettable space'}
                  </p>
                </div>
              </div>
              <button onClick={() => !isSubmitting && (setIsUnitModalOpen(false), setIsEditUnitModalOpen(false))} className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={isEditUnitModalOpen ? handleEditUnit : handleAddUnit} className="p-6 space-y-5">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Unit Number / ID</label>
                <input 
                  type="text" required placeholder="e.g. A1, 4B, Shop 2" 
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-gray-50 font-bold text-gray-900" 
                  value={unitFormData.unit_number} onChange={(e) => setUnitFormData({ ...unitFormData, unit_number: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Monthly Rent (KSH)</label>
                <input 
                  type="number" required placeholder="0.00" 
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-gray-50 font-bold text-gray-900" 
                  value={unitFormData.rent_amount} onChange={(e) => setUnitFormData({ ...unitFormData, rent_amount: e.target.value })} 
                />
              </div>
              
              <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={() => { setIsUnitModalOpen(false); setIsEditUnitModalOpen(false); }} className="px-5 py-3 text-sm font-bold text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-100 rounded-xl transition-colors border border-gray-200">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-3 text-sm font-bold text-[#ffffff] bg-[#1f8898] hover:bg-[#1a7684] rounded-xl transition-all shadow-lg shadow-[#1f8898]/20 disabled:opacity-50 flex items-center gap-2 active:scale-95">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {isSubmitting ? 'Saving...' : 'Save Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Delete Confirmation Modal --- */}
      {isDeleteModalOpen && selectedUnit && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => !isSubmitting && setIsDeleteModalOpen(false)}></div>
          
          <div className="relative w-full max-w-md bg-[#ffffff] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 text-center p-8">
            <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertOctagon className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Delete Unit {selectedUnit.unit_number}?</h3>
            <p className="text-sm font-medium text-gray-500 mb-8">
              This action cannot be undone. Are you sure you want to permanently remove this space from the property?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-5 py-3 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
              <button onClick={handleDeleteUnit} disabled={isSubmitting} className="flex-1 px-5 py-3 text-sm font-bold text-[#ffffff] bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-lg shadow-rose-600/20 flex justify-center items-center gap-2">
                 {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Move Out Confirmation Modal --- */}
      {isMoveOutModalOpen && selectedUnit && selectedTenant && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => !isSubmitting && setIsMoveOutModalOpen(false)}></div>
          
          <div className="relative w-full max-w-md bg-[#ffffff] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 p-8">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
              <LogOut className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight mb-2">Move Out Tenant?</h3>
            <p className="text-sm font-medium text-gray-500 mb-6 leading-relaxed">
              Are you sure you want to end the lease for <strong className="text-gray-900">{selectedTenant.first_name} {selectedTenant.last_name}</strong>? Unit <strong className="text-gray-900">{selectedUnit.unit_number}</strong> will be marked as Vacant.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setIsMoveOutModalOpen(false)} className="flex-1 px-5 py-3 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
              <button onClick={handleMoveOutTenant} disabled={isSubmitting} className="flex-[1.5] px-5 py-3 text-sm font-bold text-[#ffffff] bg-amber-600 hover:bg-amber-700 rounded-xl transition-all shadow-lg shadow-amber-600/20 flex justify-center items-center gap-2">
                 {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />} Confirm Move Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Tenant Move-in Modal --- */}
      {isTenantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => !isSubmitting && setIsTenantModalOpen(false)}></div>
          
          <div className="relative w-full max-w-xl bg-[#ffffff] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="bg-[#f8fafb] px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#ebf3f5] rounded-xl flex items-center justify-center text-[#1f8898]">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 tracking-tight">Register Tenant</h3>
                  <p className="text-xs font-medium text-gray-500">Unit {selectedUnit?.unit_number}</p>
                </div>
              </div>
              <button onClick={() => !isSubmitting && setIsTenantModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTenant} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">First Name</label>
                  <input type="text" required className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-gray-50 font-bold text-gray-900" value={tenantFormData.first_name} onChange={(e) => setTenantFormData({ ...tenantFormData, first_name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Last Name</label>
                  <input type="text" required className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-gray-50 font-bold text-gray-900" value={tenantFormData.last_name} onChange={(e) => setTenantFormData({ ...tenantFormData, last_name: e.target.value })} />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Email Address</label>
                  <input type="email" required className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-gray-50 font-bold text-gray-900" value={tenantFormData.email} onChange={(e) => setTenantFormData({ ...tenantFormData, email: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Phone Number</label>
                  <input type="tel" required className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-gray-50 font-bold text-gray-900" value={tenantFormData.phone} onChange={(e) => setTenantFormData({ ...tenantFormData, phone: e.target.value })} />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Lease Start</label>
                  <input type="date" required className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-gray-50 font-bold text-gray-900 cursor-pointer" value={tenantFormData.lease_start} onChange={(e) => setTenantFormData({ ...tenantFormData, lease_start: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Lease End</label>
                  <input type="date" required className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-gray-50 font-bold text-gray-900 cursor-pointer" value={tenantFormData.lease_end} onChange={(e) => setTenantFormData({ ...tenantFormData, lease_end: e.target.value })} />
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsTenantModalOpen(false)} className="px-5 py-3 text-sm font-bold text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-100 rounded-xl transition-colors border border-gray-200">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-3 text-sm font-bold text-[#ffffff] bg-[#1f8898] hover:bg-[#1a7684] rounded-xl transition-all shadow-lg shadow-[#1f8898]/20 disabled:opacity-50 flex items-center gap-2 active:scale-95">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {isSubmitting ? 'Processing...' : 'Confirm Move-in'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}