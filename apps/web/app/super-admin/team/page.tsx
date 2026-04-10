// apps/web/app/super-admin/team/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { 
    Loader2, ShieldCheck, Users, Key, Lock, 
    UserPlus, Mail, ShieldAlert, CheckCircle2, 
    MoreVertical, Shield, ChevronRight, Save,
    UserCircle, X, Trash2, UserX, UserCheck
} from 'lucide-react';

const SYSTEM_MODULES = [
    { id: 'LANDLORDS', name: 'Landlord Directory', desc: 'View and manage property managers.' },
    { id: 'BILLING', name: 'SaaS Revenue', desc: 'View MRR, invoices, and suspend accounts.' },
    { id: 'SUPPORT', name: 'Helpdesk', desc: 'Read and reply to landlord support tickets.' },
    { id: 'ANNOUNCEMENTS', name: 'Broadcasts', desc: 'Send global push notifications.' },
    { id: 'INTEGRATIONS', name: 'API Gateways', desc: 'Modify M-Pesa & Bank credentials.' },
    { id: 'SETTINGS', name: 'Master Settings', desc: 'Toggle maintenance mode & core config.' },
];

export default function RBACBuilderPage() {
    const [data, setData] = useState<{ roles: any[], staff: any[] } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'STAFF' | 'ROLES'>('STAFF');

    // UI Interactive States
    const [selectedRole, setSelectedRole] = useState<any | null>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Modals
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [isRoleBuilderOpen, setIsRoleBuilderOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form States
    const [inviteForm, setInviteForm] = useState({ email: '', first_name: '', last_name: '', role_id: '' });
    const [roleForm, setRoleForm] = useState({ name: '', permissions: [] as { subject: string, action: string }[] });

    const fetchTeamData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/team`, { credentials: 'include' });
            if (res.ok) {
                const json = await res.json();
                setData(json);
                // Update selected role data if it's currently open
                if (selectedRole) {
                    const updatedRole = json.roles.find((r: any) => r.id === selectedRole.id);
                    setSelectedRole(updatedRole || null);
                }
            }
        } catch (err) { console.error(err); } 
        finally { setIsLoading(false); }
    };

    useEffect(() => { fetchTeamData(); }, []);

    // Close staff management dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // --- API ACTION HANDLERS ---

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/team/invite`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                credentials: 'include', body: JSON.stringify(inviteForm)
            });
            const responseData = await res.json();
            if (res.ok) {
                alert('Staff member invited successfully!');
                setIsInviteOpen(false);
                setInviteForm({ email: '', first_name: '', last_name: '', role_id: '' });
                fetchTeamData();
            } else throw new Error(responseData.message || 'Failed to invite');
        } catch (err: any) { alert(err.message); } 
        finally { setIsSubmitting(false); }
    };

    const handleCreateRole = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/team/roles`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                credentials: 'include', body: JSON.stringify(roleForm)
            });
            if (res.ok) {
                alert('Custom Role created successfully!');
                setIsRoleBuilderOpen(false);
                setRoleForm({ name: '', permissions: [] });
                fetchTeamData();
            } else throw new Error('Failed to create role');
        } catch (err) { alert('Error creating role'); } 
        finally { setIsSubmitting(false); }
    };

    const handleDeleteRole = async (roleId: string, roleName: string) => {
        if (!confirm(`Are you sure you want to delete the ${roleName.replace(/_/g, ' ')} role? Users assigned to this role will lose their access.`)) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/team/roles/${roleId}`, {
                method: 'DELETE', credentials: 'include'
            });
            if (res.ok) {
                alert('Role deleted successfully.');
                setSelectedRole(null);
                fetchTeamData();
            } else throw new Error('Failed to delete role');
        } catch (err) { alert('Error deleting role. It might still have users assigned.'); }
    };

    const handleToggleStaffStatus = async (userId: string, currentStatus: boolean) => {
        if (!confirm(`Are you sure you want to ${currentStatus ? 'suspend' : 'activate'} this staff member?`)) return;
        setOpenMenuId(null);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/toggle-status`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                credentials: 'include', body: JSON.stringify({ is_active: !currentStatus })
            });
            if (res.ok) fetchTeamData();
            else throw new Error('Failed to update status');
        } catch (err) { alert('Error updating staff status'); }
    };

    const handleDeleteStaff = async (userId: string) => {
        if (!confirm('Are you sure you want to permanently revoke access for this staff member?')) return;
        setOpenMenuId(null);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`, {
                method: 'DELETE', credentials: 'include'
            });
            if (res.ok) fetchTeamData();
            else throw new Error('Failed to delete staff member');
        } catch (err) { alert('Error removing staff member'); }
    };

    const togglePermission = (subject: string, action: string) => {
        const exists = roleForm.permissions.find(p => p.subject === subject && p.action === action);
        if (exists) {
            setRoleForm(prev => ({ ...prev, permissions: prev.permissions.filter(p => !(p.subject === subject && p.action === action)) }));
        } else {
            setRoleForm(prev => ({ ...prev, permissions: [...prev.permissions, { subject, action }] }));
        }
    };

    if (isLoading && !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] bg-[#f8fafb]">
                <Loader2 className="w-10 h-10 animate-spin text-[#1f8898] mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Loading Access Matrix...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans selection:bg-[#1f8898]/30 overflow-x-hidden">
            
            {/* --- Premium Gradient Hero Area --- */}
            <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-6 pt-8 pb-20 relative overflow-hidden shadow-inner">
                <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-teal-100 text-[10px] font-black uppercase tracking-widest mb-4 border border-white/20 backdrop-blur-sm">
                            <Shield className="w-3.5 h-3.5" /> Identity & Access Management
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-[#ffffff] tracking-tight mb-2">
                            RBAC Team Builder
                        </h1>
                        <p className="text-teal-100 text-sm md:text-base font-medium max-w-xl leading-relaxed">
                            Manage internal staff accounts, build custom administrative roles, and restrict access to sensitive platform modules.
                        </p>
                    </div>

                    <div className="flex bg-white/10 p-1 rounded-xl backdrop-blur-md border border-white/20 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                        <button onClick={() => setActiveTab('STAFF')} className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'STAFF' ? 'bg-white text-[#1f8898] shadow-sm' : 'text-teal-100 hover:text-white'}`}>
                            Team Directory
                        </button>
                        <button onClick={() => setActiveTab('ROLES')} className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'ROLES' ? 'bg-white text-[#1f8898] shadow-sm' : 'text-teal-100 hover:text-white'}`}>
                            Access Roles
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 relative z-20 space-y-6">
                
                {/* --- Bento Box Analytics Grid --- */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                                <Users className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Internal Staff</p>
                            <h4 className="text-2xl font-black text-gray-900 tracking-tight">{data?.staff.length || 0} Accounts</h4>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                                <Key className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Custom Roles</p>
                            <h4 className="text-2xl font-black text-gray-900 tracking-tight">{data?.roles.length || 0} Defined</h4>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">System Security</p>
                            <h4 className="text-2xl font-black text-gray-900 tracking-tight">Active</h4>
                        </div>
                    </div>
                </div>

                {/* --- TAB CONTENT --- */}
                <div className="bg-white rounded-3xl shadow-lg shadow-black/5 border border-gray-100 overflow-hidden flex flex-col min-h-[500px] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                    
                    {activeTab === 'STAFF' && (
                        <>
                            <div className="p-5 border-b border-gray-100 bg-[#f8fafb]/50 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 tracking-tight">Team Directory</h3>
                                    <p className="text-xs font-medium text-gray-500">Active administrative accounts.</p>
                                </div>
                                <button onClick={() => setIsInviteOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors shadow-sm active:scale-95">
                                    <UserPlus className="w-4 h-4" /> Invite Staff
                                </button>
                            </div>
                            <div className="overflow-x-auto min-h-[350px]">
                                <table className="min-w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50/80 border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-400 font-black">
                                            <th className="px-6 py-4 pl-8">Employee</th>
                                            <th className="px-6 py-4">Assigned Role</th>
                                            <th className="px-6 py-4 text-center">Status</th>
                                            <th className="px-6 py-4 text-right pr-8">Manage</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {data?.staff.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 pl-8">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                                                            <UserCircle className="w-5 h-5 text-gray-500" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 text-sm">{user.first_name} {user.last_name}</p>
                                                            <p className="text-[10px] text-gray-500 font-bold">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                        <Shield className="w-3 h-3 mr-1" /> {user.role.name.replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {user.is_active ? (
                                                        <span className="inline-flex items-center text-[10px] font-bold text-emerald-600"><CheckCircle2 className="w-3.5 h-3.5 mr-1"/> Active</span>
                                                    ) : (
                                                        <span className="inline-flex items-center text-[10px] font-bold text-rose-600"><ShieldAlert className="w-3.5 h-3.5 mr-1"/> Suspended</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right pr-8 relative">
                                                    {/* --- STAFF MANAGEMENT DROPDOWN --- */}
                                                    <button 
                                                        onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                                                        className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg transition-colors"
                                                    >
                                                        <MoreVertical className="w-5 h-5" />
                                                    </button>
                                                    
                                                    {openMenuId === user.id && (
                                                        <div ref={menuRef} className="absolute right-8 top-12 mt-1 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 text-left">
                                                            <div className="p-2 space-y-1">
                                                                <button 
                                                                    onClick={() => handleToggleStaffStatus(user.id, user.is_active)}
                                                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors"
                                                                >
                                                                    {user.is_active ? <><UserX className="w-4 h-4"/> Suspend User</> : <><UserCheck className="w-4 h-4"/> Activate User</>}
                                                                </button>
                                                                
                                                                {user.role.name !== 'ADMIN' && (
                                                                    <button 
                                                                        onClick={() => handleDeleteStaff(user.id)}
                                                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" /> Revoke Access
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {activeTab === 'ROLES' && (
                        <div className="flex flex-col md:flex-row h-full min-h-[500px]">
                            {/* Left Side: Roles List */}
                            <div className="w-full md:w-1/3 border-r border-gray-100 bg-gray-50/30 flex flex-col">
                                <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white">
                                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Defined Roles</h3>
                                    <button onClick={() => setIsRoleBuilderOpen(true)} className="text-[#1f8898] hover:bg-[#1f8898]/10 p-1.5 rounded-lg transition-colors shadow-sm border border-[#1f8898]/20" title="Build New Role">
                                        <UserPlus className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                    {data?.roles.map((role) => (
                                        <button 
                                            key={role.id} 
                                            onClick={() => setSelectedRole(role)}
                                            className={`w-full text-left p-4 rounded-xl border transition-all group flex items-center justify-between ${
                                                selectedRole?.id === role.id 
                                                ? 'bg-[#1f8898] border-[#1f8898] shadow-md' 
                                                : 'bg-white border-gray-200 hover:border-[#1f8898] hover:shadow-sm'
                                            }`}
                                        >
                                            <div>
                                                <p className={`font-black text-sm transition-colors ${selectedRole?.id === role.id ? 'text-white' : 'text-gray-900 group-hover:text-[#1f8898]'}`}>
                                                    {role.name.replace(/_/g, ' ')}
                                                </p>
                                                <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${selectedRole?.id === role.id ? 'text-teal-100' : 'text-gray-400'}`}>
                                                    {role._count.users} Users Assigned
                                                </p>
                                            </div>
                                            <ChevronRight className={`w-4 h-4 transition-transform ${selectedRole?.id === role.id ? 'text-white translate-x-1' : 'text-gray-300 group-hover:text-[#1f8898]'}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Right Side: Dynamic Permission Viewer */}
                            <div className="w-full md:w-2/3 bg-white flex flex-col">
                                {selectedRole ? (
                                    <div className="p-6 md:p-8 flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="border-b border-gray-100 pb-5 mb-6 flex justify-between items-start">
                                            <div>
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-700 border border-indigo-100 mb-2">
                                                    <Shield className="w-3 h-3" /> Security Profile
                                                </div>
                                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">{selectedRole.name.replace(/_/g, ' ')}</h3>
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Viewing access control matrix</p>
                                            </div>
                                            {selectedRole.name !== 'ADMIN' && (
                                                <button 
                                                    onClick={() => handleDeleteRole(selectedRole.id, selectedRole.name)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 rounded-lg transition-colors active:scale-95"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" /> Delete Role
                                                </button>
                                            )}
                                        </div>

                                        <div className="overflow-y-auto flex-1 space-y-4 pr-2">
                                            {selectedRole.name === 'ADMIN' ? (
                                                <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl flex items-start gap-4">
                                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                                                        <Key className="w-6 h-6 text-emerald-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-emerald-900">Unrestricted System Access</h4>
                                                        <p className="text-sm font-medium text-emerald-700/80 mt-1 leading-relaxed">
                                                            The Master Admin role bypasses the permission matrix. Users with this role have full READ, WRITE, and DELETE privileges across all modules, including sensitive financial integrations.
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : selectedRole.permissions.length === 0 ? (
                                                <div className="text-center py-10">
                                                    <ShieldAlert className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                                    <p className="font-bold text-gray-900">No Permissions Assigned</p>
                                                    <p className="text-sm text-gray-500 font-medium mt-1">This role currently has no access to any system modules.</p>
                                                </div>
                                            ) : (
                                                SYSTEM_MODULES.map(mod => {
                                                    const permsForModule = selectedRole.permissions.filter((p: any) => p.subject === mod.id);
                                                    if (permsForModule.length === 0) return null;
                                                    
                                                    return (
                                                        <div key={mod.id} className="p-5 rounded-2xl border border-gray-100 bg-gray-50 flex items-center justify-between gap-4">
                                                            <div>
                                                                <p className="font-black text-gray-900 text-sm">{mod.name}</p>
                                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{mod.id}</p>
                                                            </div>
                                                            <div className="flex flex-wrap gap-2 justify-end">
                                                                {permsForModule.map((p: any) => (
                                                                    <span key={p.id} className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border
                                                                        ${p.action === 'READ' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                                                                          p.action === 'WRITE' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                                                          'bg-rose-50 text-rose-700 border-rose-100'}
                                                                    `}>
                                                                        {p.action}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                        <div className="w-16 h-16 bg-[#ebf3f5] rounded-2xl flex items-center justify-center mb-4 text-[#1f8898]">
                                            <Lock className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-lg font-black text-gray-900 mb-1">Select a role to view permissions</h3>
                                        <p className="text-sm text-gray-500 font-medium">Or click the + icon to build a new custom role.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* --- MODAL: BUILD CUSTOM ROLE --- */}
            {isRoleBuilderOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-br from-gray-50 to-white shrink-0">
                            <div>
                                <h3 className="text-lg font-black text-gray-900 tracking-tight">Build Custom Role</h3>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Select granular module permissions</p>
                            </div>
                            <button onClick={() => setIsRoleBuilderOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors bg-white shadow-sm"><X className="w-5 h-5"/></button>
                        </div>
                        
                        <div className="overflow-y-auto p-6 md:p-8 flex-1">
                            <div className="mb-8">
                                <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Role Title</label>
                                <input 
                                    type="text" required placeholder="e.g. Finance Controller"
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#1f8898] bg-gray-50 focus:bg-white font-bold text-gray-900 transition-all"
                                    value={roleForm.name} onChange={(e) => setRoleForm({...roleForm, name: e.target.value})}
                                />
                            </div>

                            <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 border-b pb-2">Access Control Matrix</h4>
                            
                            <div className="space-y-4">
                                {SYSTEM_MODULES.map((mod) => (
                                    <div key={mod.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-gray-200 transition-colors">
                                        <div>
                                            <p className="font-black text-gray-900 text-sm">{mod.name}</p>
                                            <p className="text-xs text-gray-500 font-medium">{mod.desc}</p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {['READ', 'WRITE', 'DELETE'].map(action => {
                                                const isSelected = roleForm.permissions.some(p => p.subject === mod.id && p.action === action);
                                                return (
                                                    <button 
                                                        key={`${mod.id}-${action}`}
                                                        onClick={() => togglePermission(mod.id, action)}
                                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${
                                                            isSelected ? 'bg-[#1f8898] text-white border-[#1f8898] shadow-md' : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300 hover:text-gray-600'
                                                        }`}
                                                    >
                                                        {action}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0">
                            <button onClick={handleCreateRole} disabled={isSubmitting || !roleForm.name} className="flex items-center gap-2 px-8 py-3 bg-[#1f8898] text-white rounded-xl text-sm font-black hover:bg-[#1a7684] transition-all shadow-lg shadow-[#1f8898]/20 active:scale-95 disabled:opacity-50">
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>}
                                Save & Build Role
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL: INVITE STAFF --- */}
            {isInviteOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-br from-gray-50 to-white">
                            <div>
                                <h3 className="text-lg font-black text-gray-900 tracking-tight">Invite Team Member</h3>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Provision internal access</p>
                            </div>
                            <button onClick={() => setIsInviteOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors bg-white shadow-sm"><X className="w-5 h-5"/></button>
                        </div>
                        <form onSubmit={handleInvite} className="p-6 md:p-8 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">First Name</label>
                                    <input type="text" required className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#1f8898] bg-gray-50 focus:bg-white font-bold text-gray-900" value={inviteForm.first_name} onChange={(e) => setInviteForm({...inviteForm, first_name: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Last Name</label>
                                    <input type="text" required className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#1f8898] bg-gray-50 focus:bg-white font-bold text-gray-900" value={inviteForm.last_name} onChange={(e) => setInviteForm({...inviteForm, last_name: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Work Email</label>
                                <div className="relative">
                                    <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-3.5"/>
                                    <input type="email" required className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3 outline-none focus:border-[#1f8898] bg-gray-50 focus:bg-white font-bold text-gray-900" value={inviteForm.email} onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Assign Role</label>
                                <select required className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#1f8898] bg-gray-50 focus:bg-white font-bold text-gray-900 cursor-pointer" value={inviteForm.role_id} onChange={(e) => setInviteForm({...inviteForm, role_id: e.target.value})}>
                                    <option value="" disabled>Select a role...</option>
                                    {data?.roles.map(r => <option key={r.id} value={r.id}>{r.name.replace(/_/g, ' ')}</option>)}
                                </select>
                            </div>
                            <div className="pt-6 mt-2 border-t border-gray-100 flex justify-end">
                                <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 px-8 py-3.5 bg-[#1f8898] text-white rounded-xl text-sm font-black hover:bg-[#1a7684] transition-all shadow-lg shadow-[#1f8898]/20 active:scale-95 disabled:opacity-50">
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin"/> : <Mail className="w-5 h-5"/>}
                                    Send Invite Link
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}