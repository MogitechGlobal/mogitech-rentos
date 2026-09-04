// apps/web/app/(auth)/login/page.tsx
/* eslint-disable */
'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Mail, Lock, ShieldCheck, ArrowRight, Loader2, KeyRound,
  ArrowLeft, Building2, MessageCircle,CheckCircle2
} from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl'); 

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Password Reset State
  const [needsPasswordChange, setNeedsPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [hasActiveLease, setHasActiveLease] = useState(false);

  // ------------------------------------------------------------------
  // ⚠️ PRESERVED: CORE AUTHENTICATION LOGIC
  // ------------------------------------------------------------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed.');

      if (data.access_token) {
        // Preserving the cookie logic
        document.cookie = `access_token=${data.access_token}; path=/; max-age=${rememberMe ? 604800 : 86400}; Secure; SameSite=Lax`;
      }

      const role = data.user.role || 'USER';
      const hasLease = data.user.has_active_lease === true;

      if (data.user.requires_password_change) {
        setUserRole(role);
        setHasActiveLease(hasLease); 
        setNeedsPasswordChange(true);
        return;
      }

      localStorage.setItem('user_role', role);
      localStorage.setItem('user_email', data.user.email);
      localStorage.setItem('has_active_lease', hasLease ? 'true' : 'false');

      // STRICT ROLE-BASED REDIRECT LOGIC
      if (role === 'LANDLORD' || role === 'MANAGER' || role === 'STAFF') {
        router.push('/dashboard');
      } 
      else if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
        router.push('/super-admin/login');
      }
      else if (role === 'TENANT' && hasLease) {
        router.push('/portal'); 
      } 
      else {
        router.push(callbackUrl || '/hunter');
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
        credentials: 'include', 
        body: JSON.stringify({ newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update password.');
      }

      localStorage.setItem('user_role', userRole);

      // REDIRECT LOGIC AFTER PASSWORD RESET
      if (userRole === 'LANDLORD' || userRole === 'MANAGER' || userRole === 'STAFF') {
        router.push('/dashboard');
      } else if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
        router.push('/super-admin/login');
      } else if (userRole === 'TENANT' && hasActiveLease) {
        router.push('/portal');
      } else {
        router.push(callbackUrl || '/hunter'); 
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[460px] mx-auto flex flex-col min-h-full">
      
      {/* TABLET/MOBILE ELEVATED CARD */}
      <div className="flex-1 flex flex-col justify-center py-10 sm:py-0 md:bg-white md:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] md:rounded-[2.5rem] md:p-10 lg:bg-transparent lg:shadow-none lg:p-0">
        
        {/* Mobile/Tablet Branding Header */}
        <div className="lg:hidden flex flex-col items-center justify-center mb-8 md:mb-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f4952] to-[#1f8898] text-[#ffffff] shadow-sm mb-4 md:h-14 md:w-14">
            <Building2 className="h-6 w-6 md:h-7 md:w-7" />
          </div>
          <span className="text-2xl md:text-3xl font-black tracking-tight text-gray-900">MogiRent</span>
        </div>

        <div className="text-center lg:text-left mb-8">
          <h2 className="text-3xl sm:text-[32px] font-black text-gray-900 tracking-tight mb-2">
            {needsPasswordChange ? 'Secure Your Account' : 'Welcome back'}
          </h2>
          <p className="text-sm font-medium text-gray-500">
            {needsPasswordChange
              ? 'Please set a permanent, secure password to continue.'
              : 'Sign in to continue to MogiRent.'}
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 p-4 text-sm font-bold text-rose-600 border border-rose-100 flex items-start gap-3 animate-in slide-in-from-top-2 mb-6">
            <div className="mt-0.5 w-2 h-2 rounded-full bg-rose-500 shrink-0"></div>
            <p className="leading-snug">{error}</p>
          </div>
        )}

        {/* --- STANDARD LOGIN FORM --- */}
        {!needsPasswordChange ? (
          <form className="space-y-5" onSubmit={handleLogin}>
            
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5 ml-1">Email address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#0f4952] transition-colors" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="Enter your email address"
                  className="w-full h-12 sm:h-14 rounded-xl border border-gray-200 pl-11 pr-4 text-sm font-medium outline-none focus:border-[#0f4952] focus:ring-4 focus:ring-[#0f4952]/10 transition-all bg-gray-50/50 hover:bg-white placeholder:text-gray-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5 ml-1">Password</label>
              <div className="relative group flex items-center w-full h-12 sm:h-14 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white focus-within:border-[#0f4952] focus-within:ring-4 focus-within:ring-[#0f4952]/10 transition-all overflow-hidden">
                <Lock className="absolute left-4 h-5 w-5 text-gray-400 group-focus-within:text-[#0f4952] transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="w-full h-full bg-transparent pl-11 pr-16 text-sm font-medium outline-none placeholder:text-gray-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 h-full px-4 text-xs font-bold text-gray-500 hover:text-gray-900 focus:outline-none transition-colors"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 pb-1">
              <label className="flex items-center gap-2 cursor-pointer group select-none">
                <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${rememberMe ? 'bg-[#0f4952] border-[#0f4952]' : 'bg-white border-gray-300 group-hover:border-[#0f4952]'}`}>
                  {rememberMe && <CheckCircle2 className="w-3 h-3 text-white" />}
                </div>
                <input type="checkbox" className="hidden" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                <span className="text-[13px] font-bold text-gray-600">Remember me</span>
              </label>

              <Link href="/forgot-password" className="text-[13px] font-bold text-[#1f8898] hover:text-[#0f4952] hover:underline transition-colors focus:outline-none focus:underline rounded">
                Forgot password?
              </Link>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full h-12 sm:h-14 items-center justify-center gap-2 rounded-xl bg-[#0f4952] hover:bg-[#1f8898] text-[15px] font-bold text-white shadow-lg shadow-[#0f4952]/20 hover:shadow-[#1f8898]/30 transition-all disabled:opacity-70 disabled:hover:bg-[#0f4952] active:scale-[0.98]"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In</>}
              </button>
            </div>
          </form>
        ) : (

        /* --- FORCE PASSWORD CHANGE FORM --- */
          <form className="space-y-5" onSubmit={handlePasswordChange}>
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5 ml-1">New Password</label>
              <div className="relative group flex items-center w-full h-12 sm:h-14 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white focus-within:border-[#0f4952] focus-within:ring-4 focus-within:ring-[#0f4952]/10 transition-all overflow-hidden">
                <Lock className="absolute left-4 h-5 w-5 text-gray-400 group-focus-within:text-[#0f4952] transition-colors" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                  className="w-full h-full bg-transparent pl-11 pr-16 text-sm font-medium outline-none placeholder:text-gray-400"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-0 h-full px-4 text-xs font-bold text-gray-500 hover:text-gray-900 focus:outline-none transition-colors"
                >
                  {showNewPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5 ml-1">Confirm New Password</label>
              <div className="relative group flex items-center w-full h-12 sm:h-14 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white focus-within:border-[#0f4952] focus-within:ring-4 focus-within:ring-[#0f4952]/10 transition-all overflow-hidden">
                <Lock className="absolute left-4 h-5 w-5 text-gray-400 group-focus-within:text-[#0f4952] transition-colors" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="Type password again"
                  className="w-full h-full bg-transparent pl-11 pr-16 text-sm font-medium outline-none placeholder:text-gray-400"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-0 h-full px-4 text-xs font-bold text-gray-500 hover:text-gray-900 focus:outline-none transition-colors"
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full h-12 sm:h-14 items-center justify-center gap-2 rounded-xl bg-[#0f4952] hover:bg-[#1f8898] text-[15px] font-bold text-white shadow-lg shadow-[#0f4952]/20 hover:shadow-[#1f8898]/30 transition-all disabled:opacity-70 disabled:hover:bg-[#0f4952] active:scale-[0.98]"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Save & Continue</>}
              </button>
            </div>
          </form>
        )}

        {/* --- REGISTRATION & SUPPORT ACTIONS --- */}
        <div className="pt-8 space-y-6 md:space-y-8 flex-col flex items-center">
          {!needsPasswordChange && (
            <div className="text-center w-full">
              <p className="text-[13px] md:text-[14px] font-bold text-gray-500">
                Don't have an account?{' '}
                <Link href={`/register${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`} className="text-[#1f8898] hover:text-[#0f4952] transition-colors hover:underline focus:outline-none focus:underline rounded">
                  Create an account
                </Link>
              </p>
            </div>
          )}

          <div className="pt-6 md:pt-8 border-t border-gray-100 flex flex-col items-center w-full max-w-[280px]">
            <p className="text-[11px] font-bold text-gray-400 mb-2.5 uppercase tracking-widest text-center">Need help signing in?</p>
            <a 
              href="https://wa.me/254768569357?text=Hi,%20I%20need%20help%20signing%20in%20to%20MogiRent."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full max-w-[200px] border border-gray-200 bg-white text-gray-600 hover:text-[#25D366] hover:border-[#25D366]/30 font-bold text-[13px] transition-all group focus:outline-none focus:text-[#25D366] rounded-xl py-2.5 shadow-sm"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366] group-hover:scale-110 transition-transform" /> 
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>

      </div>

      {/* --- MINIMAL MOBILE FOOTER --- */}
      <div className="lg:hidden w-full pt-8 pb-6 md:pb-10 border-t border-transparent mt-auto text-center shrink-0">
        <p className="text-[11px] font-bold text-gray-400 mb-2">
          &copy; {new Date().getFullYear()} Mogitech Global Ltd.
        </p>
        <div className="flex items-center justify-center gap-4 text-[11px] font-bold text-gray-400">
          <Link href="/privacy" className="hover:text-gray-700 transition-colors">Privacy Policy</Link>
          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
          <Link href="/terms" className="hover:text-gray-700 transition-colors">Terms of Service</Link>
        </div>
      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[100dvh] bg-white md:bg-[#f6f8f9] lg:bg-white font-sans selection:bg-[#1f8898]/30">

      {/* LEFT PANEL - Premium Visual Context (Hidden on mobile/tablet, ~45% width on Desktop) */}
      <div className="hidden lg:flex lg:w-[45%] max-w-[600px] bg-[#0f172a] relative overflow-hidden flex-col justify-between p-12 xl:p-16 border-r border-gray-200 shadow-2xl z-10">
        
        {/* Background Property Imagery */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1600&auto=format&fit=crop" 
            alt="Modern Real Estate Architecture" 
            className="w-full h-full object-cover opacity-50 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/20 via-transparent to-[#0f172a]/95"></div>
        </div>

        {/* Top Brand Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5 group w-fit cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white rounded-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-gradient-to-br from-[#0f4952] to-[#1f8898] text-[#ffffff] shadow-lg">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">MogiRent</span>
          </Link>
        </div>

        {/* Bottom Context Message */}
        <div className="relative z-10 mt-auto max-w-[420px]">
          <h1 className="text-[40px] xl:text-[48px] font-black text-white leading-[1.1] mb-5 tracking-tight">
            Find a place to call home. <br />
            <span className="text-teal-300">Or manage the properties that matter to you.</span>
          </h1>
          <p className="text-[15px] xl:text-base text-gray-300 font-medium leading-relaxed max-w-sm">
            One platform connecting house hunters with seamless property discovery, and giving landlords the tools to manage rental operations securely.
          </p>
        </div>

        {/* Minimal Footer Info */}
        <div className="relative z-10 flex items-center justify-between text-xs font-bold text-gray-400 pt-6 border-t border-white/10">
          <span>&copy; {new Date().getFullYear()} Mogitech Global Ltd.</span>
          <div className="flex items-center gap-1.5 text-emerald-400/80">
            <ShieldCheck className="w-3.5 h-3.5" /> Your data is protected
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Authentication Form Container */}
      <div className="w-full lg:flex-1 flex flex-col relative bg-transparent h-[100dvh] overflow-y-auto custom-scrollbar">
        
        {/* Subtle Back Button (Sticky on Mobile/Tablet, Absolute on Desktop) */}
        <div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-20">
          <Link href="/" className="group flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200 rounded-full pr-3">
            <div className="p-2 sm:p-2.5 rounded-full bg-white sm:bg-white md:bg-white md:shadow-sm border border-gray-100 group-hover:border-gray-300 transition-colors shadow-sm lg:shadow-none lg:bg-gray-50">
              <ArrowLeft className="w-4 h-4 sm:w-4 sm:h-4 text-gray-600 sm:text-gray-500 group-hover:text-gray-900" />
            </div>
            <span className="hidden sm:block md:text-gray-500 lg:text-gray-400">Back to MogiRent</span>
          </Link>
        </div>

        {/* Form Area */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 py-16 sm:py-24 relative lg:bg-white">
          <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[#1f8898]" /></div>}>
            <LoginFormContent />
          </Suspense>
        </div>

        {/* Desktop Minimal Footer */}
        <div className="hidden lg:flex w-full px-12 py-8 border-t border-gray-50 items-center justify-between mt-auto shrink-0 bg-white">
          <p className="text-[11px] font-bold text-gray-400">
            &copy; {new Date().getFullYear()} Mogitech Global Ltd.
          </p>
          <div className="flex items-center gap-6 text-[11px] font-bold text-gray-400">
            <Link href="/privacy" className="hover:text-gray-700 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-700 transition-colors">Terms of Service</Link>
          </div>
        </div>

      </div>
    </div>
  );
}