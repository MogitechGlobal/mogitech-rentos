// apps/web/app/hunter/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { User, Lock, Mail, Loader2, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export default function HunterSettingsPage() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    // Fetch the user's basic profile details using the dashboard endpoint we already created
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hunter/dashboard`, {
          credentials: 'include'
        });
        if (res.ok) {
          const json = await res.json();
          setUserProfile(json.user);
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (newPassword !== confirmPassword) {
      return setStatusMessage({ type: 'error', text: 'Passwords do not match.' });
    }
    if (newPassword.length < 8) {
      return setStatusMessage({ type: 'error', text: 'Password must be at least 8 characters long.' });
    }

    setIsSaving(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ newPassword })
      });

      if (!res.ok) throw new Error('Failed to update password');
      
      setStatusMessage({ type: 'success', text: 'Password updated successfully!' });
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[600px]">
        <Loader2 className="w-10 h-10 animate-spin text-[#1f8898] mb-4" />
        <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className="pb-12 max-w-4xl mx-auto px-4 sm:px-6 pt-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Profile Settings</h1>
        <p className="text-gray-500 font-medium text-sm">Manage your personal information and account security.</p>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 border ${statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <p className="font-bold text-sm">{statusMessage.text}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* --- PERSONAL INFORMATION (Read Only for now) --- */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#ebf3f5] rounded-xl flex items-center justify-center text-[#1f8898]">
              <User className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-gray-900">Personal Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2 ml-1">First Name</label>
              <input 
                type="text" 
                disabled 
                className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-gray-50 text-gray-900 font-bold text-sm cursor-not-allowed"
                value={userProfile?.first_name || ''} 
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2 ml-1">Last Name</label>
              <input 
                type="text" 
                disabled 
                className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-gray-50 text-gray-900 font-bold text-sm cursor-not-allowed"
                value={userProfile?.last_name || ''} 
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
                <input 
                  type="email" 
                  disabled 
                  className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3 bg-gray-50 text-gray-900 font-bold text-sm cursor-not-allowed"
                  value={userProfile?.email || ''} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* --- SECURITY & PASSWORD --- */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">Security</h2>
              <p className="text-xs font-medium text-gray-500">Update your account password</p>
            </div>
          </div>

          <form onSubmit={handlePasswordUpdate} className="space-y-5">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2 ml-1">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
                <input 
                  type="password" 
                  required
                  placeholder="At least 8 characters"
                  className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3 bg-white text-gray-900 font-bold text-sm focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 outline-none transition-all"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2 ml-1">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
                <input 
                  type="password" 
                  required
                  placeholder="Type new password again"
                  className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3 bg-white text-gray-900 font-bold text-sm focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 outline-none transition-all"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={isSaving}
                className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Update Password
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}