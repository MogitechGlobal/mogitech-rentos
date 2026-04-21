// apps/web/app/dashboard/units/[id]/page.tsx
'use client';
export const runtime = 'edge';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Home, Globe, Loader2, DoorOpen, Building2, 
  Banknote, Bed, Bath, Maximize, User, Calendar, 
  Phone, Mail, FileText, Edit, Droplet, UserPlus, LogOut, 
  XCircle, CheckCircle2, Wrench, Receipt, Clock, AlertTriangle, FileWarning
} from 'lucide-react';
import UnitMarketplaceTab from '@/components/units/UnitMarketplaceTab';

export default function UnitDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const unitId = params.id;

  const [unit, setUnit] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'marketplace' | 'financials' | 'maintenance'>('overview');
  const [token, setToken] = useState<string>('');

  // Modal & Form States
  const [activeModal, setActiveModal] = useState<'EDIT_UNIT' | 'UTILITY' | 'MOVE_OUT' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [alert, setAlert] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const fetchUnitDetails = async () => {
    const storedToken = localStorage.getItem('access_token') || '';
    setToken(storedToken);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/units/${unitId}`, {
        headers: { 'Authorization': `Bearer ${storedToken}` },
        credentials: 'include'
      });
      
      if (res.status === 401) return router.push('/login');
      if (!res.ok) throw new Error('Failed to load unit details.');
      
      const data = await res.json();
      setUnit(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (unitId) fetchUnitDetails();
  }, [unitId, router]);

  // --- FUNCTIONAL ACTION HANDLERS ---

  const handleEditUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/units/${unitId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        credentials: 'include',
        body: JSON.stringify({ unit_number: formData.unit_number, rent_amount: Number(formData.rent_amount) })
      });
      if (!res.ok) throw new Error('Failed to update unit');
      await fetchUnitDetails();
      closeModal();
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message });
    } finally { setIsSubmitting(false); }
  };

  const handleRecordUtility = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/units/${unitId}/utilities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        credentials: 'include',
        body: JSON.stringify({ 
          utilityType: formData.utilityType, 
          reading: Number(formData.reading), 
          unitPrice: Number(formData.unitPrice) 
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to record utility');
      await fetchUnitDetails();
      closeModal();
      window.alert("Success: " + data.message); 
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message });
    } finally { setIsSubmitting(false); }
  };

  const handleMoveOutTenant = async () => {
    if (!activeTenant) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants/${activeTenant.id}/move-out`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to move out tenant');
      await fetchUnitDetails();
      closeModal();
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message });
    } finally { setIsSubmitting(false); }
  };

  const openModal = (type: 'EDIT_UNIT' | 'UTILITY' | 'MOVE_OUT') => {
    setAlert(null);
    if (type === 'EDIT_UNIT') setFormData({ unit_number: unit.unit_number, rent_amount: unit.rent_amount });
    else if (type === 'UTILITY') setFormData({ utilityType: 'water', reading: '', unitPrice: '' });
    else setFormData({});
    setActiveModal(type);
  };
  
  const closeModal = () => { setActiveModal(null); setFormData({}); setAlert(null); };

  if (isLoading) return (
    <div className="min-h-screen bg-[#f8fafb] flex flex-col items-center justify-center text-[#1f8898] gap-4">
      <Loader2 className="w-10 h-10 animate-spin" />
      <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Loading Unit Details...</p>
    </div>
  );

  if (!unit) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafb]">
        <div className="p-8 text-center bg-white rounded-3xl shadow-sm border border-gray-100 max-w-md mx-4">
            <DoorOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-black text-gray-900 mb-2">Unit Not Found</h2>
            <p className="text-gray-500 text-sm mb-6">This unit may have been deleted or you don't have access to it.</p>
            <button onClick={() => router.back()} className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-[#1f8898] transition-colors">Go Back</button>
        </div>
    </div>
  );

  const activeTenant = unit.tenants?.find((t: any) => t.is_active);
  const invoices = activeTenant?.invoices || [];
  const maintenanceReqs = unit.maintenance_requests || unit.tickets || [];

  const totalBilled = invoices.reduce((sum: number, inv: any) => sum + inv.amount, 0);
  const totalOutstanding = invoices.filter((inv: any) => inv.status !== 'PAID').reduce((sum: number, inv: any) => sum + inv.amount, 0);

  return (
    <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans selection:bg-[#1f8898]/30 overflow-x-hidden">
      
      {/* --- MINIMIZED HERO HEADER SECTION --- */}
      <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-4 sm:px-6 pt-4 pb-12 sm:pb-14 relative overflow-hidden shadow-inner">
        <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <Link href={`/dashboard/properties/${unit.property_id}`} className="inline-flex items-center gap-1.5 text-teal-100 hover:text-white font-bold text-[11px] sm:text-xs mb-4 sm:mb-5 transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm w-max">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Property
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white border border-white/20 backdrop-blur-sm shadow-lg shrink-0">
              <DoorOpen className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#ffffff] tracking-tight">
                    Unit {unit.unit_number}
                </h1>
                <span className={`px-2 py-1 text-[9px] sm:text-[10px] font-black uppercase tracking-wider rounded-md border shadow-sm ${
                    unit.status === 'VACANT' ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30' : 'bg-blue-500/20 text-blue-200 border-blue-500/30'
                }`}>
                    {unit.status}
                </span>
              </div>
              <p className="text-teal-100 text-[11px] sm:text-xs font-medium flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-teal-300" /> {unit.property?.name || 'Loading Property...'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 relative z-20 -mt-6 sm:-mt-8">
        
        {/* --- MOBILE RESPONSIVE TABS --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1 sm:p-1.5 mb-5 sm:mb-6 overflow-x-auto custom-scrollbar flex whitespace-nowrap">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'overview' ? 'bg-[#ebf3f5] text-[#1f8898] shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Overview
          </button>
          <button 
            onClick={() => setActiveTab('marketplace')}
            className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'marketplace' ? 'bg-[#ebf3f5] text-[#1f8898] shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Marketplace Listing
          </button>
          <button 
            onClick={() => setActiveTab('financials')}
            className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'financials' ? 'bg-[#ebf3f5] text-[#1f8898] shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Banknote className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Financials
          </button>
          <button 
             onClick={() => setActiveTab('maintenance')}
             className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'maintenance' ? 'bg-[#ebf3f5] text-[#1f8898] shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Maintenance
          </button>
        </div>

        {/* --- TAB CONTENT --- */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {/* ========================================= */}
          {/* OVERVIEW TAB */}
          {/* ========================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-4 sm:space-y-6">
                
                {/* METRICS GRID */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-500">Monthly Rent</span>
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-50 flex items-center justify-center"><Banknote className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" /></div>
                        </div>
                        <h3 className="text-lg sm:text-xl font-black text-gray-900 truncate">KSH {Number(unit.rent_amount).toLocaleString()}</h3>
                    </div>
                    <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-500">Unit Type</span>
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#ebf3f5] flex items-center justify-center"><DoorOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1f8898]" /></div>
                        </div>
                        <h3 className="text-sm sm:text-base font-black text-gray-900 truncate capitalize">{unit.unit_type?.toLowerCase().replace(/_/g, ' ') || 'Standard'}</h3>
                    </div>
                    <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-500">Layout</span>
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-50 flex items-center justify-center"><Bed className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" /></div>
                        </div>
                        <div className="flex items-center gap-3">
                            <h3 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-1"><Bed className="w-3.5 h-3.5 text-gray-400"/> {unit.bedrooms || '-'}</h3>
                            <h3 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-1"><Bath className="w-3.5 h-3.5 text-gray-400"/> {unit.bathrooms || '-'}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-500">Area</span>
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-50 flex items-center justify-center"><Maximize className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" /></div>
                        </div>
                        <h3 className="text-lg sm:text-xl font-black text-gray-900 truncate">{unit.size_sqm ? `${unit.size_sqm} sqm` : '-'}</h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* LEFT COLUMN - TENANT INFO */}
                    <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
                            <div className="p-4 sm:p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                                <div>
                                    <h2 className="text-base sm:text-lg font-black text-gray-900">Current Occupant</h2>
                                    <p className="text-[10px] sm:text-xs text-gray-500 font-medium mt-0.5">Active lease and tenant details</p>
                                </div>
                            </div>
                            
                            <div className="p-4 sm:p-6 flex-1 flex flex-col">
                                {unit.status === 'VACANT' || !activeTenant ? (
                                    <div className="flex-1 flex flex-col items-center justify-center py-6 sm:py-8 text-center">
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                                            <User className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300" />
                                        </div>
                                        <h3 className="text-base sm:text-lg font-black text-gray-900 mb-1">Unit is Vacant</h3>
                                        <p className="text-xs sm:text-sm text-gray-500 max-w-sm mb-5 sm:mb-6">There is no active tenant assigned to this unit. You can add a tenant manually or publish it to the marketplace.</p>
                                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                                            <button onClick={() => router.push('/dashboard/tenants')} className="px-4 sm:px-5 py-2.5 bg-[#ebf3f5] text-[#1f8898] hover:bg-[#1f8898] hover:text-white rounded-xl font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2">
                                                <UserPlus className="w-4 h-4"/> Onboard Tenant
                                            </button>
                                            <button onClick={() => setActiveTab('marketplace')} className="px-4 sm:px-5 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                                                <Globe className="w-4 h-4"/> Publish to Marketplace
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4 sm:space-y-6">
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#ebf3f5] rounded-2xl flex items-center justify-center border border-[#1f8898]/20 shrink-0">
                                                <User className="w-5 h-5 sm:w-6 sm:h-6 text-[#1f8898]" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg sm:text-xl font-black text-gray-900 truncate">{activeTenant.first_name} {activeTenant.last_name}</h3>
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 mt-1 bg-emerald-50 text-emerald-700 rounded-md text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
                                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Active Tenant
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 bg-gray-50 p-3 sm:p-4 rounded-2xl border border-gray-100">
                                            <div className="space-y-1">
                                                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400">Email Address</p>
                                                <p className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-2 truncate"><Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 shrink-0"/> <span className="truncate">{activeTenant.email}</span></p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400">Phone Number</p>
                                                <p className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-2"><Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 shrink-0"/> {activeTenant.phone}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            <div className="border border-gray-100 p-3 sm:p-4 rounded-2xl">
                                                <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                                                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1f8898]" />
                                                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500">Lease Start</p>
                                                </div>
                                                <p className="text-xs sm:text-sm font-bold text-gray-900">{new Date(activeTenant.lease_start).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric'})}</p>
                                            </div>
                                            <div className="border border-gray-100 p-3 sm:p-4 rounded-2xl">
                                                <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                                                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500" />
                                                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500">Lease End</p>
                                                </div>
                                                <p className="text-xs sm:text-sm font-bold text-gray-900">{new Date(activeTenant.lease_end).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric'})}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN - QUICK ACTIONS & DETAILS */}
                    <div className="flex flex-col gap-4 sm:gap-6">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-6">
                            <h2 className="text-xs sm:text-sm font-black text-gray-900 mb-3 sm:mb-4 uppercase tracking-wider">Quick Actions</h2>
                            <div className="space-y-2">
                                <button onClick={() => openModal('EDIT_UNIT')} className="w-full flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 hover:bg-[#ebf3f5] hover:text-[#1f8898] text-gray-700 rounded-xl font-bold text-xs sm:text-sm transition-colors border border-gray-100 group">
                                    <div className="bg-white p-1.5 rounded-lg shadow-sm group-hover:bg-[#1f8898] group-hover:text-white transition-colors"><Edit className="w-3.5 h-3.5" /></div>
                                    Edit Unit Details
                                </button>
                                
                                {unit.status === 'VACANT' || !activeTenant ? (
                                  <>
                                    <button onClick={() => router.push('/dashboard/tenants')} className="w-full flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 hover:bg-[#ebf3f5] hover:text-[#1f8898] text-gray-700 rounded-xl font-bold text-xs sm:text-sm transition-colors border border-gray-100 group">
                                        <div className="bg-white p-1.5 rounded-lg shadow-sm group-hover:bg-[#1f8898] group-hover:text-white transition-colors"><UserPlus className="w-3.5 h-3.5" /></div>
                                        Onboard New Tenant
                                    </button>
                                    <button onClick={() => setActiveTab('marketplace')} className="w-full flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 hover:bg-[#ebf3f5] hover:text-[#1f8898] text-gray-700 rounded-xl font-bold text-xs sm:text-sm transition-colors border border-gray-100 group">
                                        <div className="bg-white p-1.5 rounded-lg shadow-sm group-hover:bg-[#1f8898] group-hover:text-white transition-colors"><Globe className="w-3.5 h-3.5" /></div>
                                        Publish to Marketplace
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button onClick={() => openModal('UTILITY')} className="w-full flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 hover:bg-[#ebf3f5] hover:text-[#1f8898] text-gray-700 rounded-xl font-bold text-xs sm:text-sm transition-colors border border-gray-100 group">
                                        <div className="bg-white p-1.5 rounded-lg shadow-sm group-hover:bg-[#1f8898] group-hover:text-white transition-colors"><Droplet className="w-3.5 h-3.5" /></div>
                                        Record Utility
                                    </button>
                                    <button className="w-full flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 hover:bg-[#ebf3f5] hover:text-[#1f8898] text-gray-700 rounded-xl font-bold text-xs sm:text-sm transition-colors border border-gray-100 group">
                                        <div className="bg-white p-1.5 rounded-lg shadow-sm group-hover:bg-[#1f8898] group-hover:text-white transition-colors"><FileText className="w-3.5 h-3.5" /></div>
                                        Lease Document
                                    </button>
                                    <div className="pt-2">
                                        <button onClick={() => openModal('MOVE_OUT')} className="w-full flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold text-xs sm:text-sm transition-colors border border-rose-100 group">
                                            <div className="bg-white p-1.5 rounded-lg shadow-sm group-hover:bg-rose-500 group-hover:text-white transition-colors"><LogOut className="w-3.5 h-3.5" /></div>
                                            Move Out Tenant
                                        </button>
                                    </div>
                                  </>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-6 flex-1">
                            <h2 className="text-xs sm:text-sm font-black text-gray-900 mb-3 sm:mb-4 uppercase tracking-wider">System Details</h2>
                            <div className="space-y-3 sm:space-y-4">
                                <div>
                                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Unit ID</p>
                                    <p className="text-[10px] sm:text-xs font-medium text-gray-900 font-mono truncate">{unit.id}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Created On</p>
                                    <p className="text-[10px] sm:text-xs font-bold text-gray-900">{new Date(unit.created_at).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Last Updated</p>
                                    <p className="text-[10px] sm:text-xs font-bold text-gray-900">{new Date(unit.updated_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          )}

          {/* ========================================= */}
          {/* MARKETPLACE TAB */}
          {/* ========================================= */}
          {activeTab === 'marketplace' && (
            <UnitMarketplaceTab unit={unit} token={token} />
          )}

          {/* ========================================= */}
          {/* FINANCIALS TAB */}
          {/* ========================================= */}
          {activeTab === 'financials' && (
            <div className="space-y-4 sm:space-y-6">
              {!activeTenant ? (
                <div className="bg-white rounded-[2rem] border border-dashed border-gray-200 p-10 sm:p-12 text-center max-w-xl mx-auto shadow-sm">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#ebf3f5] rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-5 text-[#1f8898]">
                    <Banknote className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2">No Active Financials</h3>
                  <p className="text-sm text-gray-500 font-medium">Because this unit is vacant, there are no invoices or billing records to display. Onboard a tenant to begin tracking financials.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                          <div className="flex items-center justify-between mb-2">
                              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-500">Total Billed</span>
                              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#ebf3f5] flex items-center justify-center"><Receipt className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1f8898]" /></div>
                          </div>
                          <h3 className="text-xl sm:text-2xl font-black text-gray-900">KSH {totalBilled.toLocaleString()}</h3>
                      </div>
                      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                          <div className="flex items-center justify-between mb-2">
                              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-500">Outstanding</span>
                              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rose-50 flex items-center justify-center"><FileWarning className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600" /></div>
                          </div>
                          <h3 className="text-xl sm:text-2xl font-black text-rose-600">KSH {totalOutstanding.toLocaleString()}</h3>
                      </div>
                  </div>

                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 sm:p-5 border-b border-gray-50 bg-[#f8fafb]/50">
                        <h2 className="text-base sm:text-lg font-black text-gray-900">Recent Invoices</h2>
                    </div>
                    <div className="overflow-x-auto">
                      {invoices.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm font-medium">No invoices generated yet for this lease.</div>
                      ) : (
                        <table className="w-full text-left border-collapse whitespace-nowrap min-w-[600px]">
                          <thead>
                            <tr className="bg-[#ffffff] text-[9px] sm:text-[10px] uppercase tracking-widest text-gray-400 font-black border-b border-gray-100">
                              <th className="px-4 sm:px-6 py-3 sm:py-4 pl-4 sm:pl-6">Description</th>
                              <th className="px-4 sm:px-6 py-3 sm:py-4">Amount</th>
                              <th className="px-4 sm:px-6 py-3 sm:py-4">Due Date</th>
                              <th className="px-4 sm:px-6 py-3 sm:py-4">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {invoices.map((inv: any) => (
                              <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-4 sm:px-6 py-3 sm:py-4 pl-4 sm:pl-6 font-bold text-gray-900 text-xs sm:text-sm">{inv.description}</td>
                                <td className="px-4 sm:px-6 py-3 sm:py-4 font-black text-[#1f8898] text-xs sm:text-sm">KSH {inv.amount.toLocaleString()}</td>
                                <td className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-gray-600 text-xs sm:text-sm">{new Date(inv.due_date).toLocaleDateString()}</td>
                                <td className="px-4 sm:px-6 py-3 sm:py-4">
                                   <span className={`px-2.5 py-1 text-[9px] sm:text-[10px] font-black uppercase tracking-wider rounded-md border ${
                                      inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                      inv.status === 'PARTIAL' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                      'bg-rose-50 text-rose-700 border-rose-200'
                                   }`}>
                                      {inv.status}
                                   </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ========================================= */}
          {/* MAINTENANCE TAB */}
          {/* ========================================= */}
          {activeTab === 'maintenance' && (
             <div className="space-y-4 sm:space-y-6">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 sm:p-5 border-b border-gray-50 bg-[#f8fafb]/50 flex justify-between items-center">
                        <h2 className="text-base sm:text-lg font-black text-gray-900">Maintenance Logs</h2>
                        <button 
                            onClick={() => router.push('/dashboard/maintenance')}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-900 text-white rounded-lg font-bold text-xs sm:text-sm shadow-md hover:bg-[#1f8898] transition-colors"
                        >
                            Log Request
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                      {maintenanceReqs.length === 0 ? (
                        <div className="p-10 text-center">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4"><Wrench className="w-6 h-6 sm:w-8 sm:h-8" /></div>
                            <p className="text-gray-500 text-sm font-medium">No maintenance requests have been logged for this unit.</p>
                        </div>
                      ) : (
                        <table className="w-full text-left border-collapse whitespace-nowrap min-w-[700px]">
                          <thead>
                            <tr className="bg-[#ffffff] text-[9px] sm:text-[10px] uppercase tracking-widest text-gray-400 font-black border-b border-gray-100">
                              <th className="px-4 sm:px-6 py-3 sm:py-4 pl-4 sm:pl-6">Issue</th>
                              <th className="px-4 sm:px-6 py-3 sm:py-4">Urgency</th>
                              <th className="px-4 sm:px-6 py-3 sm:py-4">Date Reported</th>
                              <th className="px-4 sm:px-6 py-3 sm:py-4">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {maintenanceReqs.map((req: any) => (
                              <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-4 sm:px-6 py-3 sm:py-4 pl-4 sm:pl-6 font-bold text-gray-900 text-xs sm:text-sm truncate max-w-[200px]">{req.description || req.title || req.issue_type}</td>
                                <td className="px-4 sm:px-6 py-3 sm:py-4">
                                   <span className={`flex items-center gap-1.5 text-xs sm:text-sm font-black ${
                                      req.urgency === 'HIGH' || req.urgency === 'EMERGENCY' || req.priority === 'High' ? 'text-rose-600' :
                                      req.urgency === 'MEDIUM' || req.priority === 'Medium' ? 'text-amber-500' :
                                      'text-blue-500'
                                   }`}>
                                      <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {req.urgency || req.priority}
                                   </span>
                                </td>
                                <td className="px-4 sm:px-6 py-3 sm:py-4 font-medium text-gray-600 text-xs sm:text-sm">{new Date(req.created_at).toLocaleDateString()}</td>
                                <td className="px-4 sm:px-6 py-3 sm:py-4">
                                   <span className={`px-2.5 py-1 text-[9px] sm:text-[10px] font-black uppercase tracking-wider rounded-md border ${
                                      req.status === 'RESOLVED' || req.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                      req.status === 'IN_PROGRESS' || req.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                      'bg-amber-50 text-amber-700 border-amber-200'
                                   }`}>
                                      {req.status}
                                   </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                </div>
             </div>
          )}

        </div>
      </main>

      {/* --- REUSABLE MODAL WRAPPER --- */}
      {activeModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95">
            <div className="p-5 sm:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0 z-10">
              <h2 className="text-lg sm:text-xl font-black text-gray-900">
                {activeModal === 'EDIT_UNIT' ? 'Edit Unit Details' :
                 activeModal === 'UTILITY' ? 'Record Utility Reading' : 'Confirm Move Out'}
              </h2>
              <button onClick={closeModal} className="p-1.5 sm:p-2 text-gray-400 hover:bg-gray-200 rounded-full transition-colors"><XCircle className="w-5 h-5 sm:w-6 sm:h-6" /></button>
            </div>
            
            <div className="p-5 sm:p-6">
              {alert && (
                <div className={`p-3 rounded-xl mb-4 text-xs sm:text-sm font-bold flex items-center gap-2 ${alert.type === 'error' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                  {alert.type === 'error' ? <XCircle className="w-4 h-4 shrink-0"/> : <CheckCircle2 className="w-4 h-4 shrink-0"/>} {alert.message}
                </div>
              )}

              {activeModal === 'EDIT_UNIT' && (
                <form id="modal-form" onSubmit={handleEditUnit} className="space-y-4">
                  <div>
                    <label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5 sm:mb-2 ml-1">Unit Number</label>
                    <input required type="text" value={formData.unit_number} onChange={e => setFormData({...formData, unit_number: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-bold outline-none focus:border-[#1f8898]" />
                  </div>
                  <div>
                    <label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5 sm:mb-2 ml-1">Rent Amount (KSH)</label>
                    <input required type="number" value={formData.rent_amount} onChange={e => setFormData({...formData, rent_amount: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-bold outline-none focus:border-[#1f8898]" />
                  </div>
                </form>
              )}

              {activeModal === 'UTILITY' && (
                <form id="modal-form" onSubmit={handleRecordUtility} className="space-y-4">
                  <div>
                    <label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5 sm:mb-2 ml-1">Utility Type</label>
                    <select value={formData.utilityType} onChange={e => setFormData({...formData, utilityType: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-bold outline-none focus:border-[#1f8898]">
                        <option value="water">Water</option>
                        <option value="electricity">Electricity</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5 sm:mb-2 ml-1">Current Meter Reading</label>
                    <input required type="number" step="0.01" value={formData.reading} onChange={e => setFormData({...formData, reading: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-bold outline-none focus:border-[#1f8898]" placeholder="Enter exact reading..." />
                  </div>
                  <div>
                    <label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5 sm:mb-2 ml-1">Price Per Unit (KSH)</label>
                    <input required type="number" step="0.01" value={formData.unitPrice} onChange={e => setFormData({...formData, unitPrice: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-bold outline-none focus:border-[#1f8898]" placeholder="e.g. 150" />
                  </div>
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                    <p className="text-[11px] sm:text-xs text-blue-700 font-medium leading-relaxed">This will automatically calculate the consumption based on the previous reading and generate an invoice for the tenant.</p>
                  </div>
                </form>
              )}

              {activeModal === 'MOVE_OUT' && (
                <div className="text-center py-2 sm:py-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4"><LogOut className="w-6 h-6 sm:w-8 sm:h-8" /></div>
                  <h3 className="text-base sm:text-lg font-black text-gray-900 mb-2">Move Out Tenant?</h3>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium mb-4 sm:mb-6">This will deactivate {activeTenant?.first_name}'s lease and mark the unit as VACANT. This action cannot be undone.</p>
                </div>
              )}
            </div>

            <div className="p-5 sm:p-6 border-t border-gray-100 bg-white flex justify-end gap-2 sm:gap-3 sticky bottom-0">
              <button type="button" onClick={closeModal} className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm text-gray-600 hover:bg-gray-100 transition-colors w-full sm:w-auto">Cancel</button>
              {activeModal === 'MOVE_OUT' ? (
                  <button onClick={handleMoveOutTenant} disabled={isSubmitting} className="bg-rose-600 hover:bg-rose-700 text-white px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-lg shadow-rose-500/30 disabled:opacity-70 flex items-center justify-center gap-2 w-full sm:w-auto">
                    {isSubmitting ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : null} Confirm
                  </button>
              ) : (
                  <button type="submit" form="modal-form" disabled={isSubmitting} className="bg-[#1f8898] hover:bg-[#156a77] text-white px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-lg shadow-[#1f8898]/30 disabled:opacity-70 flex items-center justify-center gap-2 w-full sm:w-auto">
                    {isSubmitting ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : null} Save Details
                  </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}