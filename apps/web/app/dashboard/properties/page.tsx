// apps/web/app/dashboard/properties/page.tsx
/* eslint-disable */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import _ from 'lodash';
import { 
  Building2, MapPin, Plus, X, Search, 
  Home, Briefcase, LayoutGrid, Layers,
  ChevronRight, AlertCircle, CheckCircle2, 
  Loader2, Edit, Trash2, AlertOctagon 
} from 'lucide-react';

export default function PropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

  // Advanced UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  // Modals & Action States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  
  const [formData, setFormData] = useState({ name: '', type: 'RESIDENTIAL', address: '' });

  const fetchProperties = async () => {
    setIsLoading(true);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties`, {
        credentials: 'include' // <-- PERFECTLY CLEANED
      });
      
      // Security Check
      if (res.status === 401 || res.status === 403) return router.push('/login');
      
      if (!res.ok) throw new Error('Failed to load portfolio data.');
      const data = await res.json();
      setProperties(data);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [router]);

  // --- ACTIONS ---
  
  const openAddModal = () => {
    setFormData({ name: '', type: 'RESIDENTIAL', address: '' });
    setIsAddModalOpen(true);
  };

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg(null);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, // <-- CLEANED
        credentials: 'include', // <-- ADDED
        body: JSON.stringify(formData),
      });

      if (res.status === 401 || res.status === 403) return router.push('/login');

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create property');
      }
      
      setIsAddModalOpen(false);
      setStatusMsg({ type: 'success', text: `${formData.name} added successfully!` });
      fetchProperties(); 
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  const openEditModal = (prop: any) => {
    setSelectedProperty(prop);
    setFormData({ name: prop.name, type: prop.type, address: prop.address });
    setIsEditModalOpen(true);
  };

  const handleEditProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg(null);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties/${selectedProperty.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }, // <-- CLEANED
        credentials: 'include', // <-- ADDED
        body: JSON.stringify(formData),
      });

      if (res.status === 401 || res.status === 403) return router.push('/login');
      if (!res.ok) throw new Error('Failed to update property');
      
      setIsEditModalOpen(false);
      setStatusMsg({ type: 'success', text: `${formData.name} updated successfully!` });
      fetchProperties(); 
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  const openDeleteModal = (prop: any) => {
    setSelectedProperty(prop);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteProperty = async () => {
    setIsSubmitting(true);
    setStatusMsg(null);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties/${selectedProperty.id}`, {
        method: 'DELETE',
        credentials: 'include' // <-- PERFECTLY CLEANED
      });

      if (res.status === 401 || res.status === 403) return router.push('/login');

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to delete property');
      }
      
      setIsDeleteModalOpen(false);
      setStatusMsg({ type: 'success', text: `Property deleted successfully.` });
      fetchProperties(); 
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };


  // --- Data Processing & Analytics ---
  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || p.type === filterType;
    return matchesSearch && matchesType;
  });

  const totalProperties = properties.length;
  const totalUnits = _.sumBy(properties, p => p.units?.length || 0);
  const residentialCount = _.filter(properties, { type: 'RESIDENTIAL' }).length;
  const commercialCount = _.filter(properties, { type: 'COMMERCIAL' }).length;

  // UI Helpers
  const getFilterPillClass = (type: string) => {
    const isActive = filterType === type;
    return `px-5 py-2 rounded-full text-sm font-bold transition-all ${
      isActive 
        ? 'bg-[#1f8898] text-white shadow-md' 
        : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
    }`;
  };

  return (
    <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans selection:bg-[#1f8898]/30 overflow-x-hidden">
      
      {/* --- Scaled-Down Gradient Hero Area --- */}
      <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-6 pt-8 pb-14 md:pt-10 md:pb-16 relative overflow-hidden shadow-inner">
        <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-100 text-xs font-bold uppercase tracking-widest mb-3 border border-white/20 backdrop-blur-sm">
                <LayoutGrid className="w-3.5 h-3.5" /> Portfolio Operations
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[#ffffff] tracking-tight mb-2">
              Property Management
            </h1>
            <p className="text-teal-100 text-sm md:text-base font-medium max-w-xl leading-relaxed">
              Oversee your buildings, plazas, and apartment complexes. Add new assets to expand your portfolio.
            </p>
          </div>

          <div className="flex mt-2 md:mt-0">
            <button 
              onClick={openAddModal}
              className="bg-[#ffffff] hover:bg-gray-50 text-[#1f8898] px-6 py-2.5 rounded-xl font-black text-sm shadow-xl shadow-black/10 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" /> Add New Property
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 md:-mt-10 relative z-20">
        
        {/* Inline Status Notifications */}
        {statusMsg && (
          <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 shadow-lg animate-in fade-in slide-in-from-top-4 border
            ${statusMsg.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 
              statusMsg.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 
              'bg-blue-50 border-blue-200 text-blue-800'}
          `}>
            {statusMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : 
             statusMsg.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : 
             <Loader2 className="w-5 h-5 shrink-0 animate-spin" />}
            <span className="font-bold text-sm">{statusMsg.text}</span>
          </div>
        )}

        {/* --- Bento Box Analytics Grid --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          
          <div className="bg-[#ffffff] p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#ebf3f5] rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-[#ebf3f5] flex items-center justify-center text-[#1f8898] border border-[#1f8898]/10">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#1f8898]">Total Assets</span>
            </div>
            <div className="relative z-10">
              <h4 className="text-3xl font-black text-gray-900 tracking-tight truncate">{totalProperties}</h4>
              <p className="text-xs text-gray-500 font-medium mt-1">Managed Properties</p>
            </div>
          </div>

          <div className="bg-[#ffffff] p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600 border border-gray-100">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Total Capacity</span>
            </div>
            <div className="relative z-10">
              <h4 className="text-3xl font-black text-gray-900 tracking-tight truncate">{totalUnits}</h4>
              <p className="text-xs text-gray-500 font-medium mt-1">Rentable Units</p>
            </div>
          </div>

          <div className="bg-[#ffffff] p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                <Home className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Residential</span>
            </div>
            <div className="relative z-10">
              <h4 className="text-3xl font-black text-gray-900 tracking-tight truncate">{residentialCount}</h4>
              <p className="text-xs text-gray-500 font-medium mt-1">Apartments & Homes</p>
            </div>
          </div>

          <div className="bg-[#ffffff] p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Commercial</span>
            </div>
            <div className="relative z-10">
              <h4 className="text-3xl font-black text-gray-900 tracking-tight truncate">{commercialCount}</h4>
              <p className="text-xs text-gray-500 font-medium mt-1">Plazas & Offices</p>
            </div>
          </div>

        </div>

        {/* --- Filtering Toolbar --- */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setFilterType('ALL')} className={getFilterPillClass('ALL')}>All Properties</button>
            <button onClick={() => setFilterType('RESIDENTIAL')} className={getFilterPillClass('RESIDENTIAL')}>Residential</button>
            <button onClick={() => setFilterType('COMMERCIAL')} className={getFilterPillClass('COMMERCIAL')}>Commercial</button>
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input 
              type="text" placeholder="Search property name or location..." 
              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all bg-[#ffffff] shadow-sm"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* --- Property Grid --- */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-[#1f8898] gap-4 bg-white rounded-3xl shadow-sm border border-gray-100">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="font-bold text-sm uppercase tracking-widest text-gray-400">Loading Portfolio...</span>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="bg-[#ffffff] p-12 rounded-3xl border border-gray-100 shadow-sm text-center mt-6">
            <div className="w-20 h-20 bg-[#ebf3f5] rounded-3xl flex items-center justify-center mx-auto mb-5 text-[#1f8898]">
              <Building2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">No properties found</h3>
            <p className="text-gray-500 mb-8 font-medium max-w-sm mx-auto">
              {searchTerm ? "We couldn't find any properties matching your search criteria." : "Your portfolio is empty. Add your first building to start managing units and tenants."}
            </p>
            {!searchTerm && (
              <button 
                onClick={openAddModal}
                className="bg-[#1f8898] hover:bg-[#1a7684] text-[#ffffff] font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-[#1f8898]/20 transition-all active:scale-95"
              >
                + Add Your First Property
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredProperties.map((property: any) => (
              <div key={property.id} className="bg-[#ffffff] rounded-3xl shadow-sm border border-gray-100 flex flex-col group hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5 transition-all duration-300 overflow-hidden">
                
                {/* Card Header (Gradient Line based on type) */}
                <div className={`h-2 w-full ${property.type === 'RESIDENTIAL' ? 'bg-gradient-to-r from-blue-400 to-blue-500' : 'bg-gradient-to-r from-amber-400 to-amber-500'}`}></div>
                
                <div className="p-6 md:p-8 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#1f8898] group-hover:text-white transition-colors shadow-sm border border-gray-100">
                      {property.type === 'RESIDENTIAL' ? <Home className="w-6 h-6" /> : <Briefcase className="w-6 h-6" />}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => openEditModal(property)} className="p-1.5 text-gray-400 hover:text-[#1f8898] hover:bg-[#ebf3f5] rounded-lg transition-colors" title="Edit Property">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => openDeleteModal(property)} className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete Property">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <span className={`ml-1 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${
                        property.type === 'RESIDENTIAL' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {property.type}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2 group-hover:text-[#1f8898] transition-colors line-clamp-1">
                    {property.name}
                  </h3>
                  
                  <div className="flex items-start text-gray-500 text-sm font-medium mb-6 flex-1">
                    <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-400 shrink-0" /> 
                    <span className="line-clamp-2">{property.address}</span>
                  </div>

                  <div className="pt-6 border-t border-gray-100 flex items-center justify-between mt-auto">
                    <div className="text-sm font-black text-gray-900 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-gray-400" />
                      {property.units?.length || 0} <span className="text-gray-400 font-bold ml-1">Units</span>
                    </div>
                    <Link 
                      href={`/dashboard/properties/${property.id}`}
                      className="text-xs font-black text-[#1f8898] bg-[#ebf3f5] group-hover:bg-[#1f8898] group-hover:text-[#ffffff] px-4 py-2.5 rounded-xl transition-all flex items-center gap-1 uppercase tracking-wider"
                    >
                      Manage <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* --- Add/Edit Property Modal --- */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => !isSubmitting && (setIsAddModalOpen(false), setIsEditModalOpen(false))}></div>
          
          <div className="relative w-full max-w-md bg-[#ffffff] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
            
            <div className="bg-[#f8fafb] px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#ebf3f5] rounded-xl flex items-center justify-center text-[#1f8898]">
                  {isEditModalOpen ? <Edit className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 tracking-tight">
                    {isEditModalOpen ? 'Edit Property' : 'Add New Property'}
                  </h3>
                  <p className="text-xs font-medium text-gray-500">
                    {isEditModalOpen ? 'Update portfolio details' : 'Expand your managed portfolio'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => !isSubmitting && (setIsAddModalOpen(false), setIsEditModalOpen(false))}
                className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={isEditModalOpen ? handleEditProperty : handleAddProperty} className="p-6 space-y-5">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Property Name</label>
                <input 
                  type="text" required placeholder="e.g. Sunrise Apartments"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-gray-50 font-bold text-gray-900" 
                  value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Asset Type</label>
                <select 
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-gray-50 font-bold text-gray-700 cursor-pointer" 
                  value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="RESIDENTIAL">Residential (Apartments, Homes)</option>
                  <option value="COMMERCIAL">Commercial (Offices, Plazas)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Physical Address</label>
                <div className="relative">
                  <MapPin className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
                  <input 
                    type="text" required placeholder="e.g. 123 Westlands Ave, Nairobi"
                    className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-gray-50 font-bold text-gray-900" 
                    value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-6 mt-2 border-t border-gray-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} 
                  className="px-5 py-3 text-sm font-bold text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="px-6 py-3 text-sm font-bold text-[#ffffff] bg-[#1f8898] hover:bg-[#1a7684] rounded-xl transition-all shadow-lg shadow-[#1f8898]/20 disabled:opacity-50 flex items-center gap-2 active:scale-95"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (isEditModalOpen ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />)}
                  {isSubmitting ? 'Saving...' : (isEditModalOpen ? 'Save Changes' : 'Add Property')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Delete Confirmation Modal --- */}
      {isDeleteModalOpen && selectedProperty && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => !isSubmitting && setIsDeleteModalOpen(false)}></div>
          
          <div className="relative w-full max-w-md bg-[#ffffff] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 text-center p-8">
            <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertOctagon className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Delete {selectedProperty.name}?</h3>
            <p className="text-sm font-medium text-gray-500 mb-8">
              Are you sure you want to delete this property? <br/><br/>
              <strong className="text-rose-600">Note:</strong> You cannot delete a property that still has units attached to it.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-5 py-3 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
              <button onClick={handleDeleteProperty} disabled={isSubmitting} className="flex-1 px-5 py-3 text-sm font-bold text-[#ffffff] bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-lg shadow-rose-600/20 flex justify-center items-center gap-2">
                 {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}