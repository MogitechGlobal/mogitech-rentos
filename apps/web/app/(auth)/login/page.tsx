// apps/web/app/(auth)/login/page.tsx
/* eslint-disable */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ShieldCheck, ArrowRight, Loader2, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Password Reset State
  const [needsPasswordChange, setNeedsPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [userRole, setUserRole] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed.');

      if (data.user.requires_password_change) {
        setTempToken(data.access_token);
        setUserRole(data.user.role);
        setNeedsPasswordChange(true);
        return; 
      }

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user_role', data.user.role);
      
      if (data.user.role === 'TENANT') {
        router.push('/portal');
      } else {
        router.push('/dashboard');
      }
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (newPassword.length < 8) {
      return setError('Password must be at least 8 characters long.');
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/change-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempToken}` 
        },
        body: JSON.stringify({ newPassword }),
      });

      if (!response.ok) throw new Error('Failed to update password.');

      localStorage.setItem('access_token', tempToken);
      localStorage.setItem('user_role', userRole);
      
      if (userRole === 'TENANT') {
        router.push('/portal');
      } else {
        router.push('/dashboard');
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#ebf3f5] px-4 font-sans selection:bg-[#1f8898]/30">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-[#ffffff] p-10 shadow-xl border border-gray-100 relative overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#1f8898]"></div>

        <div className="text-center pt-2">
          <div className="w-16 h-16 bg-[#ebf3f5] rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#1f8898] shadow-sm transform rotate-3">
            {needsPasswordChange ? <KeyRound className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8 transform -rotate-3" />}
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            {needsPasswordChange ? 'Secure Your Account' : <>Mogi<span className="text-[#1f8898]">RentOS</span></>}
          </h2>
          <p className="mt-2 text-sm font-medium text-gray-500">
            {needsPasswordChange ? 'Please set a permanent password to continue.' : 'Secure access to your property portfolio.'}
          </p>
        </div>
        
        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600 border border-red-100 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> {error}
          </div>
        )}

        {!needsPasswordChange ? (
          <form className="mt-8 space-y-6 animate-in fade-in slide-in-from-right-4" onSubmit={handleLogin}>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <input type="email" required placeholder="name@email.com" className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3 text-sm font-medium outline-none focus:border-[#1f8898] focus:ring-1 focus:ring-[#1f8898] transition-all" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-bold text-gray-700">Password</label>
                  <Link href="#" className="text-xs font-bold text-[#1f8898] hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <input type="password" required placeholder="••••••••" className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3 text-sm font-medium outline-none focus:border-[#1f8898] focus:ring-1 focus:ring-[#1f8898] transition-all" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1f8898] hover:bg-[#1a7684] px-4 py-3.5 text-sm font-bold text-[#ffffff] shadow-md transition-all disabled:opacity-70">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In Securely <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        ) : (
          <form className="mt-8 space-y-6 animate-in fade-in slide-in-from-right-4" onSubmit={handlePasswordChange}>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">New Password</label>
                <input type="password" required minLength={8} placeholder="At least 8 characters" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium outline-none focus:border-[#1f8898] focus:ring-1 focus:ring-[#1f8898] transition-all" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Confirm New Password</label>
                <input type="password" required minLength={8} placeholder="Type password again" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium outline-none focus:border-[#1f8898] focus:ring-1 focus:ring-[#1f8898] transition-all" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 hover:bg-black px-4 py-3.5 text-sm font-bold text-[#ffffff] shadow-md transition-all disabled:opacity-70">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Save & Continue to Portal</>}
            </button>
          </form>
        )}

        <div className="pt-8 text-center border-t border-gray-50 flex flex-col gap-4">
          {!needsPasswordChange && (
             <p className="text-sm font-bold text-gray-500">
             Don't have an account yet?{' '}
             <Link href="/register" className="text-[#1f8898] hover:underline transition-all">
               Create Account
             </Link>
           </p>
          )}
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Powered by Mogitech Global</p>
        </div>
      </div>
    </div>
  );
}