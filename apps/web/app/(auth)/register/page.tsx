// apps/web/app/(auth)/register/page.tsx
'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Mail, Lock, User, Building2, Phone, ArrowRight, Loader2, 
  ArrowLeft, CheckCircle2, Home, Search, ShieldCheck
} from 'lucide-react';

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  
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

      // --- ALL USERS REDIRECT TO LOGIN UPON SUCCESS ---
      // This ensures they go through the proper secure authentication flow.
      router.push(`/login${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`);
      
    } catch (err: any) {
      if (Array.isArray(err.message)) {
        setError(err.message.join(', '));
      } else {
        setError(err.message);
      }
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
            Create your account
          </h2>
          <p className="text-sm font-medium text-gray-500">
            Join MogiRent today. Choose how you'll use the platform.
          </p>
        </div>

        {/* --- PREMIUM ROLE SELECTOR --- */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {/* House Hunter Option */}
          <button
            type="button"
            onClick={() => setSelectedRole('TENANT')}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-[#1f8898]/20 ${
              selectedRole === 'TENANT' 
                ? 'border-[#1f8898] bg-[#ebf3f5]/50 shadow-sm' 
                : 'border-gray-100 bg-gray-50 hover:bg-white hover:border-gray-200 text-gray-400'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors ${selectedRole === 'TENANT' ? 'bg-white text-[#1f8898] shadow-sm' : 'bg-gray-100 text-gray-400'}`}>
              <Search className="w-5 h-5" />
            </div>
            <span className={`text-[13px] font-bold tracking-tight ${selectedRole === 'TENANT' ? 'text-gray-900' : 'text-gray-500'}`}>House Hunter</span>
            <span className={`text-[11px] font-medium mt-1 leading-tight px-2 text-center ${selectedRole === 'TENANT' ? 'text-[#1f8898]' : 'text-gray-400'}`}>Find your next home</span>
          </button>

          {/* Property Manager Option */}
          <button
            type="button"
            onClick={() => setSelectedRole('LANDLORD')}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-[#0f4952]/20 ${
              selectedRole === 'LANDLORD' 
                ? 'border-[#0f4952] bg-[#f6f8f9] shadow-sm' 
                : 'border-gray-100 bg-gray-50 hover:bg-white hover:border-gray-200 text-gray-400'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors ${selectedRole === 'LANDLORD' ? 'bg-white text-[#0f4952] shadow-sm' : 'bg-gray-100 text-gray-400'}`}>
              <Building2 className="w-5 h-5" />
            </div>
            <span className={`text-[13px] font-bold tracking-tight ${selectedRole === 'LANDLORD' ? 'text-gray-900' : 'text-gray-500'}`}>Property Manager</span>
            <span className={`text-[11px] font-medium mt-1 leading-tight px-2 text-center ${selectedRole === 'LANDLORD' ? 'text-[#0f4952]' : 'text-gray-400'}`}>Manage your rentals</span>
          </button>
        </div>
        
        {error && (
          <div className="rounded-xl bg-rose-50 p-4 text-sm font-bold text-rose-600 border border-rose-100 flex items-start gap-3 animate-in slide-in-from-top-2 mb-6">
            <div className="mt-0.5 w-2 h-2 rounded-full bg-rose-500 shrink-0"></div> 
            <p className="leading-snug">{error}</p>
          </div>
        )}

        <form className="space-y-5" onSubmit={handleRegister}>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5 ml-1">First Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#0f4952] transition-colors" />
                <input 
                  type="text" 
                  name="first_name" 
                  required 
                  autoComplete="given-name"
                  placeholder="Jacob" 
                  className="w-full h-12 sm:h-14 rounded-xl border border-gray-200 pl-11 pr-4 text-sm font-medium outline-none focus:border-[#0f4952] focus:ring-4 focus:ring-[#0f4952]/10 transition-all bg-gray-50/50 hover:bg-white placeholder:text-gray-400" 
                  value={formData.first_name} 
                  onChange={handleChange} 
                />
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5 ml-1">Last Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#0f4952] transition-colors" />
                <input 
                  type="text" 
                  name="last_name" 
                  required 
                  autoComplete="family-name"
                  placeholder="Mogire" 
                  className="w-full h-12 sm:h-14 rounded-xl border border-gray-200 pl-11 pr-4 text-sm font-medium outline-none focus:border-[#0f4952] focus:ring-4 focus:ring-[#0f4952]/10 transition-all bg-gray-50/50 hover:bg-white placeholder:text-gray-400" 
                  value={formData.last_name} 
                  onChange={handleChange} 
                />
              </div>
            </div>
          </div>

          <div className={`grid grid-cols-1 ${selectedRole === 'LANDLORD' ? 'sm:grid-cols-2 gap-5' : 'gap-5'}`}>
            {/* CONDITIONALLY RENDER COMPANY NAME */}
            {selectedRole === 'LANDLORD' && (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5 ml-1">Company Name</label>
                <div className="relative group">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#0f4952] transition-colors" />
                  <input 
                    type="text" 
                    name="company_name" 
                    required={selectedRole === 'LANDLORD'} 
                    autoComplete="organization"
                    placeholder="Mogitech Properties" 
                    className="w-full h-12 sm:h-14 rounded-xl border border-gray-200 pl-11 pr-4 text-sm font-medium outline-none focus:border-[#0f4952] focus:ring-4 focus:ring-[#0f4952]/10 transition-all bg-gray-50/50 hover:bg-white placeholder:text-gray-400" 
                    value={formData.company_name} 
                    onChange={handleChange} 
                  />
                </div>
              </div>
            )}
            
            <div className="transition-all duration-300">
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5 ml-1">Phone Number</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#0f4952] transition-colors" />
                <input 
                  type="tel" 
                  name="contact_phone" 
                  required 
                  autoComplete="tel"
                  placeholder="+254 700 000 000" 
                  className="w-full h-12 sm:h-14 rounded-xl border border-gray-200 pl-11 pr-4 text-sm font-medium outline-none focus:border-[#0f4952] focus:ring-4 focus:ring-[#0f4952]/10 transition-all bg-gray-50/50 hover:bg-white placeholder:text-gray-400" 
                  value={formData.contact_phone} 
                  onChange={handleChange} 
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-1.5 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#0f4952] transition-colors" />
              <input 
                type="email" 
                name="email" 
                required 
                autoComplete="email"
                placeholder={selectedRole === 'LANDLORD' ? "admin@company.com" : "you@example.com"} 
                className="w-full h-12 sm:h-14 rounded-xl border border-gray-200 pl-11 pr-4 text-sm font-medium outline-none focus:border-[#0f4952] focus:ring-4 focus:ring-[#0f4952]/10 transition-all bg-gray-50/50 hover:bg-white placeholder:text-gray-400" 
                value={formData.email} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-1.5 ml-1">Secure Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#0f4952] transition-colors" />
              <input 
                type="password" 
                name="password" 
                required 
                autoComplete="new-password"
                minLength={8} 
                placeholder="At least 8 characters" 
                className="w-full h-12 sm:h-14 rounded-xl border border-gray-200 pl-11 pr-4 text-sm font-medium outline-none focus:border-[#0f4952] focus:ring-4 focus:ring-[#0f4952]/10 transition-all bg-gray-50/50 hover:bg-white placeholder:text-gray-400" 
                value={formData.password} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer group select-none">
              <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                <input 
                  type="checkbox" 
                  className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-md checked:bg-[#0f4952] checked:border-[#0f4952] transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0f4952]"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                />
                <CheckCircle2 className="absolute text-white w-3.5 h-3.5 opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" strokeWidth={4} />
              </div>
              <span className="text-[13px] font-medium text-gray-600 leading-snug">
                I agree to the MogiRent{' '}
                <Link href="/terms" target="_blank" className="text-[#0f4952] hover:underline font-bold focus:outline-none focus:underline rounded">Terms of Service</Link> 
                {' '}and acknowledge the{' '}
                <Link href="/privacy" target="_blank" className="text-[#0f4952] hover:underline font-bold focus:outline-none focus:underline rounded">Privacy Policy</Link>.
              </span>
            </label>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={isLoading || !acceptTerms} 
              className="flex w-full h-12 sm:h-14 items-center justify-center gap-2 rounded-xl bg-[#0f4952] hover:bg-[#1f8898] px-4 text-[15px] font-bold text-white shadow-lg shadow-[#0f4952]/20 hover:shadow-[#1f8898]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4 ml-1" /></>}
            </button>
          </div>
        </form>

        <div className="pt-8 text-center w-full">
          <p className="text-[14px] font-bold text-gray-500">
            Already have an account?{' '}
            <Link href={`/login${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`} className="text-[#1f8898] hover:text-[#0f4952] hover:underline transition-colors focus:outline-none focus:underline rounded">
              Sign in here
            </Link>
          </p>
        </div>
        
      </div>
    </div>
  );
}

// Wrapper component to safely handle useSearchParams in Next.js App Router
export default function RegisterPage() {
  return (
    <div className="flex min-h-[100dvh] bg-white md:bg-[#f6f8f9] lg:bg-white font-sans selection:bg-[#1f8898]/30">
      
      {/* LEFT PANEL - Premium Visual Context (Hidden on mobile/tablet) */}
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

      {/* RIGHT PANEL - Registration Form Container */}
      <div className="w-full lg:flex-1 flex flex-col relative bg-transparent h-[100dvh] overflow-y-auto custom-scrollbar">
        
        {/* Subtle Back Button (Sticky on Mobile/Tablet, Absolute on Desktop) */}
        <div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-20">
          <Link href="/login" className="group flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200 rounded-full pr-3">
            <div className="p-2 sm:p-2.5 rounded-full bg-white sm:bg-white md:bg-white md:shadow-sm border border-gray-100 group-hover:border-gray-300 transition-colors shadow-sm lg:shadow-none lg:bg-gray-50">
              <ArrowLeft className="w-4 h-4 sm:w-4 sm:h-4 text-gray-600 sm:text-gray-500 group-hover:text-gray-900" />
            </div>
            <span className="hidden sm:block md:text-gray-500 lg:text-gray-400">Back to Login</span>
          </Link>
        </div>

        {/* Form Area */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 py-16 sm:py-24 relative lg:bg-white">
          <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[#1f8898]" /></div>}>
            <RegisterFormContent />
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

        {/* Mobile Minimal Footer */}
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
    </div>
  );
}