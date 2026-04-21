// apps/web/app/super-admin/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { UserCircle, Lock, Save, Mail, ShieldCheck, Loader2, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api'; // <-- IMPORT THE NEW WRAPPER

export default function AdminProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', password: '', confirm_password: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      // Replaced localStorage with our secure cookie wrapper
      const res = await fetchWithAuth('/admin/profile'); 
      const data = await res.json();
      
      setProfileData(data);
      setFormData(prev => ({
        ...prev,
        first_name: data.first_name || '',
        last_name: data.last_name || '',
      }));
    } catch (error) {
      console.error('Session expired or unauthorized');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (formData.password && formData.password !== formData.confirm_password) {
      return setAlert({ type: 'error', message: 'New passwords do not match.' });
    }

    setIsSaving(true);

    try {
      const payload: any = { first_name: formData.first_name, last_name: formData.last_name };
      if (formData.password) payload.password = formData.password;

      // Replaced localStorage with our secure cookie wrapper
      const res = await fetchWithAuth('/admin/profile', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      setAlert({ type: 'success', message: 'Profile updated successfully.' });
      setFormData(prev => ({ ...prev, password: '', confirm_password: '' }));
      setProfileData((prev: any) => ({ ...prev, first_name: result.user.first_name, last_name: result.user.last_name }));
      setTimeout(() => setAlert(null), 3000);

    } catch (error: any) {
      setAlert({ type: 'error', message: error.message || 'Failed to save profile' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#1f8898] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full pb-12">
      
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Profile</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">Manage your administrative identity and security settings.</p>
      </div>

      {alert && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 border animate-in fade-in slide-in-from-top-2 ${
          alert.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'
        }`}>
          {alert.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <p className="text-sm font-bold">{alert.message}</p>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* --- PERSONAL INFORMATION CARD --- */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-gray-50 flex items-center gap-4 bg-gray-50/50">
            <div className="w-12 h-12 bg-[#ebf3f5] text-[#1f8898] rounded-xl flex items-center justify-center shrink-0">
              <UserCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">Personal Information</h2>
              <p className="text-xs font-medium text-gray-500">Your basic profile details.</p>
            </div>
          </div>
          
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">First Name</label>
                <input 
                  type="text" 
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  placeholder="John"
                  className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all font-bold text-sm text-gray-900 placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Last Name</label>
                <input 
                  type="text" 
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  placeholder="Doe"
                  className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all font-bold text-sm text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Read Only Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Email Address</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-4 w-4 h-4 text-gray-400" />
                  <input 
                    type="email" 
                    disabled 
                    value={profileData?.email || ''}
                    className="w-full rounded-xl bg-gray-100 border border-gray-200 pl-11 pr-4 py-3 font-bold text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5 ml-1 font-medium">Contact IT support to change your email address.</p>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Administrative Role</label>
                <div className="relative flex items-center">
                  <ShieldCheck className="absolute left-4 w-4 h-4 text-[#1f8898]" />
                  <input 
                    type="text" 
                    disabled 
                    value={profileData?.role?.name?.replace(/_/g, ' ') || 'Admin'}
                    className="w-full rounded-xl bg-[#ebf3f5] border border-[#1f8898]/20 pl-11 pr-4 py-3 font-black text-sm text-[#1f8898] uppercase tracking-wider cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- SECURITY CARD --- */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-gray-50 flex items-center gap-4 bg-gray-50/50">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">Security Settings</h2>
              <p className="text-xs font-medium text-gray-500">Update your password. Leave blank to keep current password.</p>
            </div>
          </div>
          
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">New Password</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 w-4 h-4 text-gray-400" />
                  <input 
                    type="password" 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••"
                    className="w-full rounded-xl bg-gray-50 border border-gray-200 pl-11 pr-4 py-3 outline-none focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all font-bold text-sm text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Confirm New Password</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 w-4 h-4 text-gray-400" />
                  <input 
                    type="password" 
                    value={formData.confirm_password}
                    onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
                    placeholder="••••••••"
                    className="w-full rounded-xl bg-gray-50 border border-gray-200 pl-11 pr-4 py-3 outline-none focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all font-bold text-sm text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- ACTION BAR --- */}
        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={isSaving}
            className="flex items-center gap-2 bg-gray-900 hover:bg-[#1f8898] text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-gray-900/20 hover:shadow-[#1f8898]/30 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>

      </form>
    </div>
  );
}