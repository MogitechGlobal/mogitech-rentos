// apps/web/app/(auth)/register/page.tsx
/* eslint-disable */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Building2, Phone, ArrowRight, Loader2, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Consolidated form state
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
    setIsLoading(true);

    try {
      // FIXED: Uses the dynamic Vercel environment variable
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Injecting the required 'roleName' for the backend
        body: JSON.stringify({ ...formData, roleName: 'LANDLORD' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed. Please check your details.');
      }

      // Auto-login: Save the secure token to the browser's local storage
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        router.push('/dashboard');
      } else {
        // Fallback just in case the backend didn't send a token
        router.push('/login');
      }
      
    } catch (err: any) {
      // If NestJS sends an array of validation errors, join them
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
    <div className="flex min-h-screen items-center justify-center bg-[#ebf3f5] px-4 py-12 font-sans selection:bg-[#1f8898]/30">
      {/* Notice the max-w-xl here to accommodate the 2-column grid */}
      <div className="w-full max-w-xl space-y-8 rounded-3xl bg-[#ffffff] p-8 md:p-10 shadow-xl border border-gray-100 relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#1f8898]"></div>

        <div className="text-center pt-2">
          <div className="w-16 h-16 bg-[#ebf3f5] rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#1f8898] shadow-sm transform -rotate-3">
            <UserPlus className="w-8 h-8 transform rotate-3" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            Create an Account
          </h2>
          <p className="mt-2 text-sm font-medium text-gray-500">Join MogiRentOS to manage your portfolio.</p>
        </div>
        
        <form className="mt-8 space-y-5" onSubmit={handleRegister}>
          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600 border border-red-100 flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></div>
              <span>{error}</span>
            </div>
          )}
          
          {/* --- Grid: First & Last Name --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">First Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text" name="first_name" required placeholder="Kingsley"
                  className="block w-full rounded-xl border border-gray-200 pl-10 pr-4 py-3 text-sm text-gray-900 font-medium bg-[#ffffff] outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all placeholder:text-gray-300"
                  value={formData.first_name} onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Last Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text" name="last_name" required placeholder="Mogitech"
                  className="block w-full rounded-xl border border-gray-200 pl-10 pr-4 py-3 text-sm text-gray-900 font-medium bg-[#ffffff] outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all placeholder:text-gray-300"
                  value={formData.last_name} onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* --- Grid: Company & Phone --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Company Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Building2 className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text" name="company_name" required placeholder="Mogitech Global Ltd"
                  className="block w-full rounded-xl border border-gray-200 pl-10 pr-4 py-3 text-sm text-gray-900 font-medium bg-[#ffffff] outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all placeholder:text-gray-300"
                  value={formData.company_name} onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="tel" name="contact_phone" required placeholder="+254 700 000 000"
                  className="block w-full rounded-xl border border-gray-200 pl-10 pr-4 py-3 text-sm text-gray-900 font-medium bg-[#ffffff] outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all placeholder:text-gray-300"
                  value={formData.contact_phone} onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* --- Full Width: Email --- */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="email" name="email" required placeholder="admin@mogitech.com"
                className="block w-full rounded-xl border border-gray-200 pl-10 pr-4 py-3 text-sm text-gray-900 font-medium bg-[#ffffff] outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all placeholder:text-gray-300"
                value={formData.email} onChange={handleChange}
              />
            </div>
          </div>

          {/* --- Full Width: Password --- */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Create Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="password" name="password" required placeholder="Min. 8 characters" minLength={8}
                className="block w-full rounded-xl border border-gray-200 pl-10 pr-4 py-3 text-sm text-gray-900 font-medium bg-[#ffffff] outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all placeholder:text-gray-300"
                value={formData.password} onChange={handleChange}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1f8898] hover:bg-[#1a7684] px-4 py-3.5 text-sm font-bold text-[#ffffff] shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-[#1f8898] focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Register & Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="pt-8 text-center border-t border-gray-50">
          <p className="text-sm font-bold text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-[#1f8898] hover:underline transition-all">
              Sign In Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}