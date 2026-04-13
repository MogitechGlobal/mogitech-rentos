// apps/web/app/(auth)/login/page.tsx
/* eslint-disable */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Mail, Lock, ShieldCheck, ArrowRight, Loader2, KeyRound,
  ArrowLeft, Building2, CheckCircle2
} from 'lucide-react';

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
  const [userRole, setUserRole] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // <-- THIS TELLS THE BROWSER TO ACCEPT & STORE THE SECURE COOKIE
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed.');

      if (data.user.requires_password_change) {
        setUserRole(data.user.role);
        setNeedsPasswordChange(true);
        return;
      }

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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // <-- THIS AUTOMATICALLY SENDS THE COOKIE WE JUST RECEIVED
        body: JSON.stringify({ newPassword }),
      });

      if (!response.ok) throw new Error('Failed to update password.');

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
    <div className="flex min-h-screen bg-white font-sans selection:bg-[#1f8898]/30">

      {/* LEFT PANEL - Corporate Branding (Hidden on mobile, 50% width on Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0f4952] relative overflow-hidden flex-col justify-between p-12 xl:p-20">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full border-[40px] border-[#1f8898] opacity-50 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-[#1f8898] opacity-20 blur-3xl translate-x-1/3 translate-y-1/3"></div>
        </div>

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/20">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-black text-white tracking-tight">MogiRentOS</span>
        </div>

        {/* Corporate Messaging */}
        <div className="relative z-10 max-w-lg mt-auto mb-auto">
          <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-6">
            Enterprise-grade property management.
          </h1>
          <p className="text-lg text-[#ebf3f5]/80 font-medium leading-relaxed mb-10">
            Securely access your portfolio, automate your collections, and gain real-time operational oversight across all your properties.
          </p>

          <div className="space-y-4">
            {[
              'Bank-level security & encryption',
              'Automated M-Pesa reconciliation',
              'Real-time portfolio analytics'
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#1f8898]" />
                <span className="text-white font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-sm font-medium text-white/50 pt-8 border-t border-white/10">
          <span>&copy; {new Date().getFullYear()} Mogitech Global Ltd.</span>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            All Systems Operational
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Authentication Form */}
      <div className="w-full lg:w-1/2 flex flex-col relative bg-white">

        {/* Back to Home Button */}
        <div className="absolute top-6 left-6 sm:top-10 sm:left-10 z-20">
          <Link href="/" className="group flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors">
            <div className="p-2 rounded-full bg-gray-50 border border-gray-100 group-hover:border-gray-300 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="hidden sm:block">Back to Home</span>
          </Link>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12 xl:p-24">
          <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Mobile-only Logo */}
            <div className="lg:hidden flex justify-center mb-8">
              <div className="flex items-center gap-2.5">
                <div className="bg-[#ebf3f5] p-2 rounded-xl border border-[#1f8898]/20">
                  <Building2 className="h-6 w-6 text-[#1f8898]" />
                </div>
                <span className="text-2xl font-black text-gray-900 tracking-tight">Mogi<span className="text-[#1f8898]">RentOS</span></span>
              </div>
            </div>

            {/* Header */}
            <div className="text-left">
              <div className="inline-flex items-center justify-center p-3 bg-[#ebf3f5] rounded-2xl mb-6 text-[#1f8898] border border-[#1f8898]/10 shadow-sm">
                {needsPasswordChange ? <KeyRound className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
              </div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                {needsPasswordChange ? 'Secure Your Account' : 'Welcome back'}
              </h2>
              <p className="text-base font-medium text-gray-500">
                {needsPasswordChange
                  ? 'Please set a permanent, secure password to continue.'
                  : 'Enter your credentials to access your portal.'}
              </p>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600 border border-red-100 flex items-start gap-3 animate-in slide-in-from-top-2">
                <div className="mt-0.5 w-2 h-2 rounded-full bg-red-500 shrink-0"></div>
                <p>{error}</p>
              </div>
            )}

            {/* Standard Login Flow */}
            {!needsPasswordChange ? (
              <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Work Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        required
                        placeholder="name@company.com"
                        className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3 text-sm font-medium outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all bg-gray-50/50 hover:bg-white"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-bold text-gray-700">Password</label>
                      <Link href="/forgot-password" className="text-xs font-bold text-[#1f8898] hover:text-[#0f4952] hover:underline transition-colors">Forgot password?</Link>                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3 text-sm font-medium outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all bg-gray-50/50 hover:bg-white"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1f8898] hover:bg-[#0f4952] px-4 py-3.5 text-sm font-bold text-white shadow-sm hover:shadow-md transition-all disabled:opacity-70 disabled:hover:bg-[#1f8898]"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In Securely <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            ) : (

              /* Password Reset Flow */
              <form className="mt-8 space-y-6" onSubmit={handlePasswordChange}>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                      <input
                        type="password"
                        required
                        minLength={8}
                        placeholder="At least 8 characters"
                        className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3 text-sm font-medium outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all bg-gray-50/50 hover:bg-white"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                      <input
                        type="password"
                        required
                        minLength={8}
                        placeholder="Type password again"
                        className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3 text-sm font-medium outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all bg-gray-50/50 hover:bg-white"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 hover:bg-black px-4 py-3.5 text-sm font-bold text-white shadow-sm hover:shadow-md transition-all disabled:opacity-70"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Save & Continue</>}
                </button>
              </form>
            )}

            <div className="pt-8 flex flex-col items-center gap-4">
              {!needsPasswordChange && (
                <p className="text-sm font-bold text-gray-500">
                  Don't have an account?{' '}
                  <Link href="/register" className="text-[#1f8898] hover:text-[#0f4952] hover:underline transition-all">
                    Create an account
                  </Link>
                </p>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}