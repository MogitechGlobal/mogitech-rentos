// apps/web/app/(auth)/register/page.tsx
'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Mail, Lock, User, Building2, Phone, ArrowRight, Loader2, 
  UserPlus, ArrowLeft, CheckCircle2, Home 
} from 'lucide-react';

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  // --- NEW: DUAL-ROLE STATE ---
  // Default to TENANT (House Hunter) if they came from the marketplace
  const [selectedRole, setSelectedRole] = useState<'LANDLORD' | 'TENANT'>(
    callbackUrl?.includes('marketplace') ? 'TENANT' : 'LANDLORD'
  );
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    company_name: '',
    contact_phone: '',
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!acceptTerms) {
        return setError('You must agree to the Terms of Service and Privacy Policy to create an account.');
    }

    setIsLoading(true);

    // Prepare payload. Omit company_name for House Hunters.
    const payload = {
      ...formData,
      roleName: selectedRole,
      company_name: selectedRole === 'TENANT' ? undefined : formData.company_name,
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', 
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed. Please check your details.');
      }

      // --- SMART REDIRECT LOGIC ---
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        // Route back to the exact unit they were viewing, or default by role
        const defaultRoute = selectedRole === 'LANDLORD' ? '/dashboard' : '/marketplace';
        router.push(callbackUrl || defaultRoute);
      } else {
        router.push(`/login${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`);
      }
      
    } catch (err: any) {
      if (Array.isArray(err.message)) {
        setError(err.message.join(', '));
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16 lg:pt-0">
      
      <div className="lg:hidden flex justify-center mb-8">
        <div className="flex items-center gap-2.5">
          <div className="bg-[#ebf3f5] p-2 rounded-xl border border-[#1f8898]/20">
            <Building2 className="h-6 w-6 text-[#1f8898]" />
          </div>
          <span className="text-2xl font-black text-gray-900 tracking-tight">Mogi<span className="text-[#1f8898]">RentOS</span></span>
        </div>
      </div>

      <div className="text-left">
        <div className="inline-flex items-center justify-center p-3 bg-[#ebf3f5] rounded-2xl mb-6 text-[#1f8898] border border-[#1f8898]/10 shadow-sm">
          {selectedRole === 'LANDLORD' ? <Building2 className="w-6 h-6" /> : <Home className="w-6 h-6" />}
        </div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
          {selectedRole === 'LANDLORD' ? 'Create your Landlord account' : 'Create your Hunter account'}
        </h2>
        <p className="text-base font-medium text-gray-500">
          {selectedRole === 'LANDLORD' 
            ? 'Enter your details to set up your property management workspace.' 
            : 'Register to securely unlock premium property details and exact locations.'}
        </p>
      </div>

      {/* --- NEW: ROLE TOGGLE --- */}
      <div className="flex p-1.5 bg-gray-100/80 rounded-2xl border border-gray-200 shadow-inner">
        <button
          type="button"
          onClick={() => setSelectedRole('TENANT')}
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            selectedRole === 'TENANT' 
              ? 'bg-white text-[#1f8898] shadow-sm ring-1 ring-gray-200/50' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
          }`}
        >
          <Home className="w-4 h-4" /> House Hunter
        </button>
        <button
          type="button"
          onClick={() => setSelectedRole('LANDLORD')}
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            selectedRole === 'LANDLORD' 
              ? 'bg-white text-[#1f8898] shadow-sm ring-1 ring-gray-200/50' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
          }`}
        >
          <Building2 className="w-4 h-4" /> Property Manager
        </button>
      </div>
      
      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600 border border-red-100 flex items-start gap-3 animate-in slide-in-from-top-2">
          <div className="mt-0.5 w-2 h-2 rounded-full bg-red-500 shrink-0"></div> 
          <p>{error}</p>
        </div>
      )}

      <form className="mt-8 space-y-5" onSubmit={handleRegister}>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">First Name</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <input type="text" name="first_name" required placeholder="Jacob" className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3 text-sm font-medium outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all bg-gray-50/50 hover:bg-white" value={formData.first_name} onChange={handleChange} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Last Name</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <input type="text" name="last_name" required placeholder="Mogire" className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3 text-sm font-medium outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all bg-gray-50/50 hover:bg-white" value={formData.last_name} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* CONDITIONALLY RENDER COMPANY NAME */}
          {selectedRole === 'LANDLORD' && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Company Name</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <input type="text" name="company_name" required={selectedRole === 'LANDLORD'} placeholder="Mogitech Properties" className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3 text-sm font-medium outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all bg-gray-50/50 hover:bg-white" value={formData.company_name} onChange={handleChange} />
              </div>
            </div>
          )}
          
          <div className={selectedRole === 'TENANT' ? 'col-span-1 sm:col-span-2' : ''}>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <input type="tel" name="contact_phone" required placeholder="+254 700 000 000" className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3 text-sm font-medium outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all bg-gray-50/50 hover:bg-white" value={formData.contact_phone} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            <input type="email" name="email" required placeholder={selectedRole === 'LANDLORD' ? "admin@company.com" : "you@example.com"} className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3 text-sm font-medium outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all bg-gray-50/50 hover:bg-white" value={formData.email} onChange={handleChange} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">Secure Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            <input type="password" name="password" required minLength={8} placeholder="At least 8 characters" className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3 text-sm font-medium outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all bg-gray-50/50 hover:bg-white" value={formData.password} onChange={handleChange} />
          </div>
        </div>

        <div className="pt-2">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center mt-0.5">
              <input 
                type="checkbox" 
                className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-md checked:bg-[#1f8898] checked:border-[#1f8898] transition-all cursor-pointer"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
              />
              <CheckCircle2 className="absolute text-white w-3.5 h-3.5 opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" strokeWidth={4} />
            </div>
            <span className="text-sm font-medium text-gray-600 leading-snug">
              I agree to the MogiRentOS{' '}
              <Link href="/terms" target="_blank" className="text-[#1f8898] hover:underline font-bold">Terms of Service</Link> 
              {' '}and acknowledge the{' '}
              <Link href="/privacy" target="_blank" className="text-[#1f8898] hover:underline font-bold">Privacy Policy</Link>.
            </span>
          </label>
        </div>

        <div className="pt-4">
          <button 
            type="submit" 
            disabled={isLoading || !acceptTerms} 
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1f8898] hover:bg-[#0f4952] px-4 py-3.5 text-sm font-bold text-white shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Complete Registration <ArrowRight className="w-4 h-4 ml-1" /></>}
          </button>
        </div>
      </form>

      <div className="pt-6 text-center">
        <p className="text-sm font-bold text-gray-500">
          Already have an account?{' '}
          {/* Ensure the callback URL persists if they switch to the login page */}
          <Link href={`/login${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`} className="text-[#1f8898] hover:text-[#0f4952] hover:underline transition-all">
            Sign in here
          </Link>
        </p>
      </div>
      
    </div>
  );
}

// Wrapper component to safely handle useSearchParams in Next.js App Router
export default function RegisterPage() {
  return (
    <div className="flex min-h-screen bg-white font-sans selection:bg-[#1f8898]/30">
      
      {/* LEFT PANEL - Corporate Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 bg-[#0f4952] relative overflow-hidden flex-col justify-between p-12 xl:p-20">
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
            Start scaling your portfolio today.
          </h1>
          <p className="text-lg text-[#ebf3f5]/80 font-medium leading-relaxed mb-10">
            Join forward-thinking property managers using MogiRentOS to automate rent collection, manage tenants, and streamline operations.
          </p>
          
          <div className="space-y-4">
            {[
              'Zero setup fees or hidden costs',
              'Instant M-Pesa Paybill integration',
              'Automated tenant invoicing & receipts'
            ].map((feature, i) => (
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

      {/* RIGHT PANEL - Registration Form */}
      <div className="w-full lg:w-7/12 xl:w-1/2 flex flex-col relative bg-white">
        
        <div className="absolute top-6 left-6 sm:top-10 sm:left-10 z-20">
          <Link href="/login" className="group flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors">
            <div className="p-2 rounded-full bg-gray-50 border border-gray-100 group-hover:border-gray-300 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="hidden sm:block">Back to Login</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-12 xl:p-16 overflow-y-auto">
          {/* Suspense boundary required by Next.js 13+ when using useSearchParams */}
          <Suspense fallback={<div className="flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#1f8898]" /></div>}>
            <RegisterFormContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}