// apps/web/app/dashboard/team/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, Plus, Mail, Shield, Building2, 
  MoreVertical, Edit2, Trash2, XCircle, 
  CheckCircle2, Loader2, AlertCircle, Wrench, Calculator
} from 'lucide-react';
import _ from 'lodash';

export default function TeamManagementPage() {
  const router = useRouter();
  
  const [team, setTeam] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', roleType: 'CARETAKER', propertyIds: [] as string[], isActive: true
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const reqOptions = { credentials: 'include' as RequestCredentials };
      
      const [teamRes, propsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/staff`, reqOptions),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties`, reqOptions)
      ]);

      if (teamRes.status === 401 || propsRes.status === 401) return router.push('/login');
      if (teamRes.status === 403) {
          router.push('/dashboard'); // Staff shouldn't be here
          return;
      }

      setTeam(await teamRes.json());
      setProperties(await propsRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreateModal = () => {
    setFormData({ firstName: '', lastName: '', email: '', roleType: 'CARETAKER', propertyIds: [], isActive: true });
    setModalMode('CREATE');
    setIsModalOpen(true);
  };

  const openEditModal = (staff: any) => {
    setFormData({
      firstName: staff.user.first_name,
      lastName: staff.user.last_name,
      email: staff.user.email,
      roleType: staff.role_type,
      propertyIds: staff.assignments.map((a: any) => a.property.id),
      isActive: staff.is_active
    });
    setSelectedStaffId(staff.id);
    setModalMode('EDIT');
    setIsModalOpen(true);
  };

  const handlePropertyToggle = (propertyId: string) => {
    setFormData(prev => {
      const isSelected = prev.propertyIds.includes(propertyId);
      if (isSelected) {
        return { ...prev, propertyIds: prev.propertyIds.filter(id => id !== propertyId) };
      } else {
        return { ...prev, propertyIds: [...prev.propertyIds, propertyId] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg(null);

    try {
      const url = modalMode === 'EDIT' 
        ? `${process.env.NEXT_PUBLIC_API_URL}/staff/${selectedStaffId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/staff`;
        
      const res = await fetch(url, {
        method: modalMode === 'EDIT' ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save team member.');

      setStatusMsg({ type: 'success', text: `Team member ${modalMode === 'EDIT' ? 'updated' : 'invited'} successfully!` });
      await fetchData();
      setIsModalOpen(false);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to completely remove this user from your team?')) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/staff/${id}`, { method: 'DELETE', credentials: 'include' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
        case 'CARETAKER': return <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest"><Shield className="w-3 h-3" /> Caretaker</span>;
        case 'FINANCE': return <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest"><Calculator className="w-3 h-3" /> Finance</span>;
        case 'VENDOR': return <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest"><Wrench className="w-3 h-3" /> Vendor</span>;
        default: return <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-700 border border-gray-200 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">{role}</span>;
    }
  };

  if (isLoading && team.length === 0) return (
    <div className="min-h-screen bg-[#f8fafb] flex flex-col items-center justify-center text-[#1f8898] gap-4">
      <Loader2 className="w-8 h-8 animate-spin" />
      <span className="font-bold text-sm uppercase tracking-widest text-gray-400">Loading Team Data...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans selection:bg-[#1f8898]/30 overflow-x-hidden">
      
      {/* --- MINIMIZED HERO SECTION --- */}
      <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-4 sm:px-6 pt-5 pb-8 sm:pb-10 relative overflow-hidden shadow-inner">
        <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-teal-100 text-[10px] font-bold uppercase tracking-widest mb-1.5 border border-white/20">
                <Users className="w-3 h-3" /> Access Management
            </div>
            <h1 className="text-xl md:text-2xl font-black text-[#ffffff] tracking-tight">
              Team & Staff
            </h1>
            <p className="text-teal-100 text-xs sm:text-sm font-medium mt-1">Delegate access to caretakers, finance managers, or maintenance vendors.</p>
          </div>
          <button onClick={openCreateModal} className="w-full sm:w-auto px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-950 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95">
            <Plus className="w-4 h-4" /> Invite Member
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 relative z-20 -mt-4">
        
        {statusMsg && (
            <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 shadow-sm border animate-in fade-in slide-in-from-top-2
                ${statusMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}
            `}>
                {statusMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                <p className="font-bold text-sm">{statusMsg.text}</p>
            </div>
        )}

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mt-6">
            <div className="overflow-x-auto">
                {team.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4"><Users className="w-8 h-8 text-gray-300" /></div>
                        <h3 className="text-lg font-black text-gray-900 tracking-tight">No team members yet</h3>
                        <p className="text-gray-500 font-medium text-sm mt-1">Invite a caretaker or manager to help run your portfolio.</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-400 font-black">
                                <th className="px-6 py-4 pl-8">Team Member</th>
                                <th className="px-6 py-4">Role Access</th>
                                <th className="px-6 py-4">Assigned Properties</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 pr-8 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {team.map((member: any) => (
                                <tr key={member.id} className="hover:bg-[#ebf3f5]/30 transition-colors group">
                                    <td className="px-6 py-4 pl-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1f8898] to-[#135a65] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                                                {member.user.first_name.charAt(0)}{member.user.last_name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-900 text-sm tracking-tight">{member.user.first_name} {member.user.last_name}</p>
                                                <p className="text-[11px] text-gray-500 font-medium flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3" /> {member.user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getRoleBadge(member.role_type)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="w-4 h-4 text-gray-400" />
                                            <span className="text-xs font-bold text-gray-700">
                                                {member.assignments.length === 0 ? 'No Assignments' : 
                                                 member.assignments.length === properties.length ? 'All Properties' : 
                                                 `${member.assignments.length} Properties`}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex w-2.5 h-2.5 rounded-full ${member.is_active && member.user.is_active ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-rose-500'}`} title={member.is_active ? 'Active' : 'Suspended'}></span>
                                    </td>
                                    <td className="px-6 py-4 pr-8 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openEditModal(member)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Access">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(member.id)} className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Remove Member">
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

      {/* --- ADD / EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => !isSubmitting && setIsModalOpen(false)}></div>
          
          <div className="relative w-full max-w-lg bg-[#ffffff] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 flex flex-col max-h-[90vh]">
            <div className="bg-[#f8fafb] px-6 py-5 border-b border-gray-100 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#ebf3f5] rounded-xl flex items-center justify-center text-[#1f8898]">
                    <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 tracking-tight">
                      {modalMode === 'CREATE' ? 'Invite Team Member' : 'Edit Access Levels'}
                  </h3>
                  <p className="text-xs font-medium text-gray-500">
                      {modalMode === 'CREATE' ? "They will receive an email to set their password." : 'Modify roles and property assignments.'}
                  </p>
                </div>
              </div>
              <button onClick={() => !isSubmitting && setIsModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-200 rounded-full transition-colors"><XCircle className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-5">
              
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">First Name</label>
                    <input disabled={modalMode === 'EDIT'} required type="text" className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#1f8898] bg-gray-50 disabled:bg-gray-100 font-bold text-gray-900 text-sm" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Last Name</label>
                    <input disabled={modalMode === 'EDIT'} required type="text" className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#1f8898] bg-gray-50 disabled:bg-gray-100 font-bold text-gray-900 text-sm" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
                  </div>
              </div>

              <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Email Address</label>
                  <input disabled={modalMode === 'EDIT'} required type="email" placeholder="colleague@example.com" className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#1f8898] bg-gray-50 disabled:bg-gray-100 font-bold text-gray-900 text-sm" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Role Designation</label>
                    <select className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#1f8898] bg-gray-50 font-bold text-gray-700 text-sm cursor-pointer" value={formData.roleType} onChange={(e) => setFormData({...formData, roleType: e.target.value})}>
                        <option value="CARETAKER">Property Caretaker</option>
                        <option value="FINANCE">Finance / Accountant</option>
                        <option value="VENDOR">Maintenance Vendor</option>
                    </select>
                  </div>
                  {modalMode === 'EDIT' && (
                    <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Account Status</label>
                        <select className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#1f8898] bg-gray-50 font-bold text-gray-700 text-sm cursor-pointer" value={formData.isActive.toString()} onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}>
                            <option value="true">Active & Allowed</option>
                            <option value="false">Suspended (No Access)</option>
                        </select>
                    </div>
                  )}
              </div>

              <div className="pt-4 border-t border-gray-100">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-3 ml-1">Property Assignments</label>
                  <div className="space-y-2 bg-gray-50 p-4 rounded-2xl border border-gray-200 max-h-48 overflow-y-auto">
                      {properties.map(prop => (
                          <label key={prop.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors border border-transparent hover:border-gray-200">
                              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${formData.propertyIds.includes(prop.id) ? 'bg-[#1f8898] border-[#1f8898]' : 'bg-white border-gray-300'}`}>
                                  {formData.propertyIds.includes(prop.id) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                              </div>
                              <input type="checkbox" className="sr-only" checked={formData.propertyIds.includes(prop.id)} onChange={() => handlePropertyToggle(prop.id)} />
                              <span className="text-sm font-bold text-gray-700 select-none">{prop.name}</span>
                          </label>
                      ))}
                      {properties.length === 0 && <p className="text-xs font-medium text-gray-500 text-center py-2">No properties available to assign.</p>}
                  </div>
              </div>

            </form>
            
            <div className="p-5 border-t border-gray-100 flex justify-end gap-3 shrink-0 bg-gray-50">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl transition-colors">
                    Cancel
                </button>
                <button type="submit" onClick={handleSubmit} disabled={isSubmitting} className="px-6 py-2.5 text-sm font-bold text-[#ffffff] bg-[#1f8898] hover:bg-[#1a7684] rounded-xl shadow-lg shadow-[#1f8898]/20 disabled:opacity-50 flex items-center justify-center gap-2">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />} 
                    {modalMode === 'CREATE' ? 'Send Invitation' : 'Save Access Levels'}
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}