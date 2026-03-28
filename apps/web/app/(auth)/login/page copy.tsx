// apps/web/app/(auth)/login/page.tsx
/* eslint-disable */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // <-- Added Link import
import { Mail, Lock, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Inside apps/web/app/(auth)/login/page.tsx

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }

      // 1. Save the token
      localStorage.setItem('access_token', data.access_token);

      // 2. Save the role so our frontend layouts can adapt if needed
      localStorage.setItem('user_role', data.user.role);

      // 3. THE SMART REDIRECT
      if (data.user.role === 'TENANT') {
        router.push('/portal'); // Send tenants to their specific portal
      } else {
        router.push('/dashboard'); // Landlords and Admins go to the main dashboard
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#ebf3f5] px-4 font-sans selection:bg-[#1f8898]/30">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-[#ffffff] p-10 shadow-xl border border-gray-100 relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">

        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#1f8898]"></div>

        <div className="text-center pt-2">
          <div className="w-16 h-16 bg-[#ebf3f5] rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#1f8898] shadow-sm transform rotate-3">
            <ShieldCheck className="w-8 h-8 transform -rotate-3" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            Mogi<span className="text-[#1f8898]">RentOS</span>
          </h2>
          <p className="mt-2 text-sm font-medium text-gray-500">Secure access to your property portfolio.</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600 border border-red-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="admin@mogitech.com"
                  className="block w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3 text-sm text-gray-900 font-medium bg-[#ffffff] outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all placeholder:text-gray-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-bold text-gray-700">Password</label>
                <Link href="#" className="text-xs font-bold text-[#1f8898] hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="block w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3 text-sm text-gray-900 font-medium bg-[#ffffff] outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all placeholder:text-gray-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1f8898] hover:bg-[#1a7684] px-4 py-3.5 text-sm font-bold text-[#ffffff] shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-[#1f8898] focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                Sign In Securely
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* --- Updated Footer Section --- */}
        <div className="pt-8 text-center border-t border-gray-50 flex flex-col gap-4">
          <p className="text-sm font-bold text-gray-500">
            Don't have an account yet?{' '}
            <Link href="/register" className="text-[#1f8898] hover:underline transition-all">
              Create Account
            </Link>
          </p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Powered by Mogitech Global
          </p>
        </div>
      </div>
    </div>
  );
}