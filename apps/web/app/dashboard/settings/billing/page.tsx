// apps/web/app/dashboard/settings/billing/page.tsx
/* eslint-disable */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CreditCard, Crown, CheckCircle2, Shield,
  Zap, Loader2, X, Building2,
  PieChart, FileText, Wrench
} from 'lucide-react';

export default function BillingSettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    let isMounted = true; // Prevents memory leaks

    const fetchProfile = async () => {
      const token = localStorage.getItem('access_token');

      // Safely kill the loader if no token exists
      if (!token) {
        if (isMounted) setIsLoading(false);
        router.push('/login');
        return;
      }

      // Defensive Programming: Don't let the fetch hang forever!
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 Second Timeout

      try {
        // FIXED: Swapped single quotes for backticks here
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/landlords/profile`, {
          headers: { 'Authorization': `Bearer ${token}` },
          signal: controller.signal
        });

        clearTimeout(timeoutId); // Clear the timeout if the request succeeds

        if (res.ok) {
          const data = await res.json();
          if (isMounted) setProfile(data);
        } else {
          console.warn(`Backend returned status: ${res.status}`);
        }
      } catch (err: any) {
        console.error('Fetch failed or timed out:', err.message);
      } finally {
        if (isMounted) setIsLoading(false); // GUARANTEED to stop the loading spinner
      }
    };

    fetchProfile();

    // Cleanup function
    return () => { isMounted = false; };
  }, []); // <--- Removed [router] to prevent infinite Next.js suspense traps

  // Detect successful return from Paystack
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');

    if (paymentStatus === 'success') {
      setStatusMsg({ type: 'success', text: 'Payment successful! Your account is now Premium.' });
      window.history.replaceState({}, document.title, window.location.pathname);

      // Optimistically upgrade UI so they don't have to wait
      setProfile((prev: any) => ({ ...prev, subscription_plan: 'PREMIUM' }));
    }
  }, []);

  const handleUpgrade = async () => {
    setIsProcessing(true);
    setStatusMsg(null);

    try {
      const token = localStorage.getItem('access_token');
      // FIXED: Swapped single quotes for backticks here
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/paystack/initialize`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to initialize payment gateway.');

      const data = await res.json();

      // Redirect the user to the Paystack secure checkout page
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      } else {
        throw new Error('Paystack did not return a valid URL.');
      }
    } catch (err: any) {
      setIsProcessing(false);
      setStatusMsg({ type: 'error', text: err.message });
    }
  };

  const currentPlan = profile?.subscription_plan || profile?.landlord?.subscription_plan || 'FREE';
  const isPremium = currentPlan === 'PREMIUM' || currentPlan === 'PRO';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafb] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#1f8898] mb-4" />
        <p className="font-bold text-gray-400 uppercase tracking-widest text-sm">Loading Billing Details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans selection:bg-[#1f8898]/30 overflow-x-hidden">

      {/* --- Premium Gradient Hero --- */}
      <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-6 pt-8 pb-14 md:pt-10 md:pb-16 relative overflow-hidden shadow-inner">
        <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-100 text-[10px] font-black uppercase tracking-widest mb-4 border border-white/20 backdrop-blur-sm">
            <CreditCard className="w-3.5 h-3.5" /> Subscription Management
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-[#ffffff] tracking-tight mb-4">
            Plans & Billing
          </h1>
          <p className="text-teal-100 text-sm md:text-base font-medium max-w-xl leading-relaxed">
            Manage your subscription, upgrade your capabilities, and securely handle your billing information.
          </p>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">

        {/* --- Status Messages --- */}
        {statusMsg && (
          <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 shadow-lg animate-in fade-in slide-in-from-top-4 border ${statusMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
            {statusMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <X className="w-5 h-5 shrink-0" />}
            <span className="font-bold text-sm">{statusMsg.text}</span>
          </div>
        )}

        {/* --- Current Active Plan Banner --- */}
        <div className="bg-[#ffffff] rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner border ${isPremium ? 'bg-gradient-to-br from-amber-400 to-amber-600 border-amber-300' : 'bg-gray-100 border-gray-200 text-gray-500'
              }`}>
              {isPremium ? <Crown className="w-8 h-8 text-white drop-shadow-sm" /> : <Building2 className="w-8 h-8" />}
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Current Plan</p>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                {isPremium ? 'MogiRentOS Premium' : 'MogiRentOS Starter'}
                {isPremium && <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest">Active</span>}
              </h2>
            </div>
          </div>

          <div className="w-full md:w-auto bg-gray-50 px-6 py-4 rounded-2xl border border-gray-100 flex flex-col items-start md:items-end">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Billing Cycle</span>
            <span className="text-lg font-black text-gray-900">{isPremium ? 'KSH 4,500 / month' : 'Free Forever'}</span>
          </div>
        </div>

        {/* --- Pricing Cards Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">

          {/* Starter / Free Plan */}
          <div className={`bg-[#ffffff] rounded-3xl p-8 border-2 transition-all ${!isPremium ? 'border-[#1f8898] shadow-lg shadow-[#1f8898]/10 relative transform md:-translate-y-2' : 'border-gray-100 shadow-sm'
            }`}>
            {!isPremium && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#1f8898] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-md">
                Current Plan
              </div>
            )}
            <h3 className="text-xl font-black text-gray-900 mb-2">Starter</h3>
            <p className="text-sm text-gray-500 font-medium mb-6 min-h-[40px]">Perfect for landlords with a small portfolio just getting started.</p>
            <div className="mb-8">
              <span className="text-4xl font-black text-gray-900 tracking-tight">KSH 0</span>
              <span className="text-gray-500 font-medium"> / forever</span>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span className="text-sm font-bold text-gray-700">Up to 10 Managed Units</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span className="text-sm font-bold text-gray-700">Basic Tenant Directory</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span className="text-sm font-bold text-gray-700">Property & Unit Tracking</span>
              </div>
              <div className="flex items-start gap-3 opacity-40">
                <X className="w-5 h-5 text-gray-400 shrink-0" />
                <span className="text-sm font-bold text-gray-500 line-through">Automated Invoicing & Payments</span>
              </div>
              <div className="flex items-start gap-3 opacity-40">
                <X className="w-5 h-5 text-gray-400 shrink-0" />
                <span className="text-sm font-bold text-gray-500 line-through">Maintenance Helpdesk</span>
              </div>
            </div>

            <button
              disabled={!isPremium}
              className={`w-full py-3.5 rounded-xl font-black text-sm transition-all ${!isPremium ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
            >
              {!isPremium ? 'Active Plan' : 'Downgrade to Starter'}
            </button>
          </div>

          {/* Professional / Premium Plan */}
          <div className={`bg-[#ffffff] rounded-3xl p-8 border-2 transition-all relative overflow-hidden ${isPremium ? 'border-amber-400 shadow-xl shadow-amber-400/20 transform md:-translate-y-2' : 'border-gray-100 shadow-sm hover:border-amber-200'
            }`}>

            {/* Background Glow */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>

            {isPremium && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-amber-400 text-[#0d393f] text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-md flex items-center gap-1">
                <Crown className="w-3 h-3" /> Current Plan
              </div>
            )}

            <div className="flex items-center gap-2 mb-2 relative z-10">
              <Crown className="w-5 h-5 text-amber-500" />
              <h3 className="text-xl font-black text-gray-900">Professional</h3>
            </div>
            <p className="text-sm text-gray-500 font-medium mb-6 min-h-[40px] relative z-10">The complete operating system for serious property managers.</p>

            <div className="mb-8 relative z-10">
              <span className="text-4xl font-black text-gray-900 tracking-tight">KSH 4,500</span>
              <span className="text-gray-500 font-medium"> / month</span>
            </div>

            <div className="space-y-4 mb-8 relative z-10">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-amber-500 shrink-0 fill-amber-100" />
                <span className="text-sm font-bold text-gray-700">Unlimited Managed Units</span>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-amber-500 shrink-0" />
                <span className="text-sm font-bold text-gray-700">Automated Rent Invoicing</span>
              </div>
              <div className="flex items-start gap-3">
                <PieChart className="w-5 h-5 text-amber-500 shrink-0" />
                <span className="text-sm font-bold text-gray-700">Advanced Analytics & Arrears Tracking</span>
              </div>
              <div className="flex items-start gap-3">
                <Wrench className="w-5 h-5 text-amber-500 shrink-0" />
                <span className="text-sm font-bold text-gray-700">Maintenance Dispatch Hub</span>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-amber-500 shrink-0" />
                <span className="text-sm font-bold text-gray-700">Priority 24/7 Tech Support</span>
              </div>
            </div>

            <button
              onClick={handleUpgrade}
              disabled={isPremium || isProcessing}
              className={`w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg relative z-10 ${isPremium
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-[#0d393f] shadow-amber-500/30 active:scale-95'
                }`}
            >
              {isProcessing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
              ) : isPremium ? (
                'Active Plan'
              ) : (
                <><CreditCard className="w-4 h-4" /> Upgrade to Professional</>
              )}
            </button>
          </div>

        </div>

        {/* Security / Trust Footer */}
        <div className="mt-12 flex flex-col items-center justify-center gap-2 text-gray-400">
          <Shield className="w-6 h-6 mb-1" />
          <p className="text-xs font-bold uppercase tracking-widest">Bank-Grade Encryption</p>
          <p className="text-xs font-medium text-center max-w-md">Your payment information is secured with 256-bit AES encryption. You can cancel your subscription at any time from this dashboard.</p>
        </div>

      </main>
    </div>
  );
}