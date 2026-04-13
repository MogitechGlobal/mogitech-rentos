// apps/web/app/(auth)/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Mail, ArrowLeft, Building2, CheckCircle2, Loader2, Send 
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      // Connect this to your actual backend endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to send reset link.');
      }

      setStatus('success');
      
    } catch (err: any) {
      setErrorMessage(err.message);
      setStatus('error');
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans selection:bg-[#1f8898]/30">
      
      {/* LEFT PANEL - Corporate Branding (Matches Login Page) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0f4952] relative overflow-hidden flex-col justify-between p-12 xl:p-20">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full border-[40px] border-[#1f8898] opacity-50 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-[#1f8898] opacity-20 blur-3xl translate-x-1/3 translate-y-1/3"></div>
        </div>

        <div className="relative z-10 flex items-center gap-2.5">
          <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/20">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-black text-white tracking-tight">MogiRentOS</span>
        </div>

        <div className="relative z-10 max-w-lg mt-auto mb-auto">
          <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-6">
            Enterprise-grade property management.
          </h1>
          <p className="text-lg text-[#ebf3f5]/80 font-medium leading-relaxed mb-10">
            Securely access your portfolio, automate your collections, and gain real-time operational oversight across all your properties.
          </p>
          
          <div className="space-y-4">
            {['Bank-level security & encryption', 'Automated M-Pesa reconciliation', 'Real-time portfolio analytics'].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#1f8898]" />
                <span className="text-white font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-sm font-medium text-white/50 pt-8 border-t border-white/10">
          <span>&copy; {new Date().getFullYear()} Mogitech Global Ltd.</span>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            All Systems Operational
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Reset Form */}
      <div className="w-full lg:w-1/2 flex flex-col relative bg-white">
        
        {/* Back to Login Button */}
        <div className="absolute top-6 left-6 sm:top-10 sm:left-10 z-20">
          <Link href="/login" className="group flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors">
            <div className="p-2 rounded-full bg-gray-50 border border-gray-100 group-hover:border-gray-300 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="hidden sm:block">Back to Login</span>
          </Link>
        </div>

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

            {status !== 'success' ? (
              <>
                {/* Header */}
                <div className="text-left">
                  <div className="inline-flex items-center justify-center p-3 bg-[#ebf3f5] rounded-2xl mb-6 text-[#1f8898] border border-[#1f8898]/10 shadow-sm">
                    <Mail className="w-6 h-6" />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                    Reset password
                  </h2>
                  <p className="text-base font-medium text-gray-500">
                    Enter your work email address and we'll send you a secure link to reset your password.
                  </p>
                </div>
                
                {status === 'error' && (
                  <div className="rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600 border border-red-100 flex items-start gap-3 animate-in slide-in-from-top-2">
                    <div className="mt-0.5 w-2 h-2 rounded-full bg-red-500 shrink-0"></div> 
                    <p>{errorMessage}</p>
                  </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
                  
                  <button 
                    type="submit" 
                    disabled={status === 'loading'} 
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1f8898] hover:bg-[#0f4952] px-4 py-3.5 text-sm font-bold text-white shadow-sm hover:shadow-md transition-all disabled:opacity-70 disabled:hover:bg-[#1f8898]"
                  >
                    {status === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send Reset Link <Send className="w-4 h-4 ml-1" /></>}
                  </button>
                </form>
              </>
            ) : (
              /* Success State */
              <div className="text-center animate-in zoom-in-95 duration-500">
                <div className="inline-flex items-center justify-center p-4 bg-emerald-50 rounded-full mb-6 text-emerald-500 border border-emerald-100 shadow-sm">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-4">
                  Check your inbox
                </h2>
                <p className="text-base font-medium text-gray-500 mb-8 max-w-sm mx-auto">
                  We've sent a secure password reset link to <span className="text-gray-900 font-bold">{email}</span>. Please check your spam folder if you don't see it within a few minutes.
                </p>
                <Link 
                  href="/login" 
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 hover:bg-black px-4 py-3.5 text-sm font-bold text-white shadow-sm hover:shadow-md transition-all"
                >
                  Return to Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}