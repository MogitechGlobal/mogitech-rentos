// apps/web/app/super-admin/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldCheck, Loader2, Lock, Mail, ArrowRight, 
  CheckCircle2, ShieldAlert, ArrowLeft, KeyRound,
  Server, Shield, Activity
} from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';

export default function AdminLoginPage() {
  const router = useRouter();
  const { fetchProfile } = useUserStore();

  const [step, setStep] = useState<'LOGIN' | 'SETUP_PASSWORD'>('LOGIN');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Password Setup State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid credentials');

      localStorage.setItem('access_token', data.access_token);

      const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
        headers: { 'Authorization': `Bearer ${data.access_token}` }
      });
      const profileData = await profileRes.json();

      // STRICT ROLE BLOCKING
      if (profileData.role?.name === 'LANDLORD' || profileData.role?.name === 'TENANT') {
          localStorage.removeItem('access_token');
          throw new Error('Unauthorized. Please use the standard client portal to log in.');
      }

      if (profileData.requires_password_change) {
          setStep('SETUP_PASSWORD');
          setIsLoading(false);
          return;
      }

      await fetchProfile();
      router.push('/super-admin');

    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleSetupPassword = async (e: React.FormEvent) => {
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
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/team/setup-password`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to secure account.');

      await fetchProfile();
      router.push('/super-admin');

    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans selection:bg-[#1f8898]/30">

      {/* --- LEFT PANEL: Administrative Branding (Hidden on Mobile) --- */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0d393f] relative overflow-hidden flex-col justify-between p-12 xl:p-20">
        
        {/* Deep Tech Background Aesthetics */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full border-[40px] border-[#1f8898] opacity-30 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-[#1f8898] opacity-10 blur-3xl translate-x-1/3 translate-y-1/3"></div>
          
          {/* Subtle Grid Pattern for Tech Feel */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50"></div>
        </div>

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-gradient-to-br from-[#1f8898] to-[#12555f] p-2.5 rounded-xl shadow-inner border border-white/10">
            <ShieldAlert className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
              <span className="text-2xl font-black text-white tracking-tight leading-none">Mogi<span className="text-[#48c9dc]">RentOS</span></span>
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-0.5">Platform Administration</span>
          </div>
        </div>

        {/* Corporate Messaging */}
        <div className="relative z-10 max-w-lg mt-auto mb-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 text-rose-400 text-[10px] font-black uppercase tracking-widest mb-6 border border-rose-500/20 backdrop-blur-sm">
             <Shield className="w-3.5 h-3.5" /> Restricted Access Area
          </div>
          
          <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-6">
            Command Center
          </h1>
          <p className="text-lg text-[#ebf3f5]/70 font-medium leading-relaxed mb-12">
            You are entering the centralized administrative portal. All actions, configuration changes, and data queries are securely logged and monitored.
          </p>

          <div className="space-y-5">
            {[
              { icon: <Server className="w-5 h-5 text-[#48c9dc]" />, text: 'Infrastructure Management & Settings' },
              { icon: <Activity className="w-5 h-5 text-[#48c9dc]" />, text: 'Global SaaS Revenue & API Logs' },
              { icon: <ShieldCheck className="w-5 h-5 text-[#48c9dc]" />, text: 'Identity, Access, and Audit Tracking' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                <div className="bg-[#0b282c] p-2 rounded-lg border border-white/5">
                    {item.icon}
                </div>
                <span className="text-white font-medium text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs font-bold text-white/30 pt-8 border-t border-white/10 uppercase tracking-widest">
          <span>&copy; {new Date().getFullYear()} Mogitech Global Ltd.</span>
          <div className="flex items-center gap-2 text-emerald-400/80">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            System Online
          </div>
        </div>
      </div>

      {/* --- RIGHT PANEL: Authentication Form --- */}
      <div className="w-full lg:w-1/2 flex flex-col relative bg-white">

        {/* Back to Portal Link */}
        <div className="absolute top-6 left-6 sm:top-10 sm:left-10 z-20">
          <Link href="/" className="group flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors">
            <div className="p-2 rounded-full bg-gray-50 border border-gray-100 group-hover:border-gray-300 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="hidden sm:block">Back to Public Site</span>
          </Link>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12 xl:p-24">
          <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Mobile-only Logo */}
            <div className="lg:hidden flex flex-col items-center justify-center mb-10">
              <div className="bg-gradient-to-br from-[#0d393f] to-[#12555f] p-3 rounded-2xl shadow-lg border border-[#1f8898]/30 mb-4">
                <ShieldAlert className="h-8 w-8 text-white" />
              </div>
              <span className="text-3xl font-black text-gray-900 tracking-tight">Mogi<span className="text-[#1f8898]">RentOS</span></span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Platform Administration</span>
            </div>

            {/* Header */}
            <div className="text-left mb-8">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                {step === 'SETUP_PASSWORD' ? 'Secure Your Account' : 'Staff Login'}
              </h2>
              <p className="text-sm font-medium text-gray-500">
                {step === 'SETUP_PASSWORD'
                  ? 'Please set a permanent, secure password to activate your administrative privileges.'
                  : 'Enter your credentials to access the Command Center.'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 flex items-start gap-3 animate-in slide-in-from-top-2">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <p className="text-sm font-bold text-rose-700 leading-relaxed">{error}</p>
              </div>
            )}

            {/* --- STANDARD LOGIN FLOW --- */}
            {step === 'LOGIN' ? (
              <form className="space-y-6" onSubmit={handleLogin}>
                <div className="space-y-5">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Work Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        required
                        placeholder="yours@gmail.com"
                        className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3.5 text-sm font-bold outline-none focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-gray-50/50 hover:bg-white text-gray-900"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2 ml-1 mr-1">
                      <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500">Password</label>
                      <Link href="/forgot-password" className="text-[11px] font-bold text-[#1f8898] hover:text-[#0f4952] hover:underline transition-colors">Recover Access</Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3.5 text-sm font-bold outline-none focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-gray-50/50 hover:bg-white text-gray-900"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0d393f] hover:bg-[#082428] px-4 py-4 text-sm font-black text-white shadow-lg shadow-[#0d393f]/20 transition-all disabled:opacity-70 active:scale-95"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Access System <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            ) : (

            /* --- FORCED 24-HOUR PASSWORD RESET FLOW --- */
              <form className="space-y-6" onSubmit={handleSetupPassword}>
                
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl mb-6">
                  <p className="text-xs font-bold text-amber-800 leading-relaxed">
                      <strong className="block text-sm mb-1 text-amber-900">Security Requirement</strong>
                      Your temporary 24-hour credentials have been verified. You must create a new permanent password to continue.
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Set New Password</label>
                    <div className="relative">
                      <KeyRound className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                      <input
                        type="password"
                        required
                        minLength={8}
                        placeholder="Minimum 8 characters"
                        className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3.5 text-sm font-bold outline-none focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-gray-50/50 hover:bg-white text-gray-900"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Confirm New Password</label>
                    <div className="relative">
                      <CheckCircle2 className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                      <input
                        type="password"
                        required
                        minLength={8}
                        placeholder="Re-type your new password"
                        className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3.5 text-sm font-bold outline-none focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-gray-50/50 hover:bg-white text-gray-900"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-4 text-sm font-black text-white shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-70 active:scale-95"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ShieldCheck className="w-5 h-5" /> Secure Account & Login</>}
                </button>
              </form>
            )}

            <div className="mt-12 text-center">
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
                 <Shield className="w-3.5 h-3.5" /> Secured by Mogitech Global
               </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}