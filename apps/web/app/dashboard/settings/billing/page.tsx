// apps/web/app/dashboard/settings/billing/page.tsx
/* eslint-disable */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CreditCard, Crown, CheckCircle2, Shield,
  Zap, Loader2, X, Building2,
  PieChart, FileText, Wrench, Smartphone, ArrowRight, Star, Clock
} from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';

export default function BillingSettingsPage() {
  const router = useRouter();
  const { fetchProfile: fetchGlobalProfile } = useUserStore();

  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'waiting', text: string } | null>(null);

  // --- MODAL & PAYMENT STATES ---
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card' | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessingMpesa, setIsProcessingMpesa] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  
  // Track WHICH plan they clicked!
  const [selectedPlanToUpgrade, setSelectedPlanToUpgrade] = useState<'BASIC' | 'PRO' | null>(null);

  // --- MAIN PROFILE FETCH WITH TIMEOUT FIX ---
  useEffect(() => {
    let isMounted = true; 
    const controller = new AbortController();
    
    // Bumped to 30 seconds to give Render backend time to wake up from cold starts
    const timeoutId = setTimeout(() => controller.abort('Timeout after 30s'), 30000); 

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/landlords/profile`, {
          credentials: 'include', 
          signal: controller.signal
        });
        
        clearTimeout(timeoutId); 

        if (res.status === 401 || res.status === 403) {
          if (isMounted) setIsLoading(false);
          router.push('/login');
          return;
        }

        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setProfile(data);
            if (data?.contact_phone) setPhoneNumber(data.contact_phone);
          }
        }
      } catch (err: any) {
        if (err.name === 'AbortError' || err.message.includes('aborted')) {
           console.log('Fetch gracefully aborted or timed out.');
        } else {
           console.error('Fetch failed:', err.message);
        }
      } finally {
        if (isMounted) setIsLoading(false); 
      }
    };

    fetchProfile();
    
    // Cleanup prevents the "signal aborted" error when rapidly navigating
    return () => { 
      isMounted = false; 
      controller.abort(); 
      clearTimeout(timeoutId);
    };
  }, [router]);

  // Polling logic for M-Pesa
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isPolling) {
      intervalId = setInterval(async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/landlords/profile`, {
            credentials: 'include'
          });
          
          if (res.ok) {
            const data = await res.json();
            const currentStatus = data?.subscription_status || data?.landlord?.subscription_status;
            
            if (currentStatus === 'PREMIUM' || currentStatus === 'PRO' || currentStatus === 'BASIC') {
              setProfile(data);
              setIsPolling(false);
              setStatusMsg({ type: 'success', text: `Payment confirmed! Your account is now ${currentStatus}.` });
              fetchGlobalProfile(); 
            }
          }
        } catch (err) {
          // Ignore polling errors silently
        }
      }, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPolling, fetchGlobalProfile]);

  // Detect Paystack Success
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const upgradedPlan = urlParams.get('plan') || 'PREMIUM'; 

    if (paymentStatus === 'success') {
      setStatusMsg({ type: 'success', text: `Payment successful! Your account is now ${upgradedPlan}.` });
      window.history.replaceState({}, document.title, window.location.pathname);
      setProfile((prev: any) => ({ ...prev, subscription_status: upgradedPlan }));
      fetchGlobalProfile();
    }
  }, [fetchGlobalProfile]);

  const handlePaystackUpgrade = async () => {
    setIsProcessing(true);
    setStatusMsg(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/paystack/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ plan: selectedPlanToUpgrade })
      });

      if (res.status === 401 || res.status === 403) return router.push('/login');
      if (!res.ok) throw new Error('Failed to initialize Paystack gateway.');

      const data = await res.json();
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      } else {
        throw new Error('Paystack did not return a valid URL.');
      }
    } catch (err: any) {
      setIsProcessing(false);
      setIsPaymentModalOpen(false);
      setStatusMsg({ type: 'error', text: err.message });
    }
  };

  const handleMpesaUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingMpesa(true);
    setStatusMsg(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/kcb/stk-push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone: phoneNumber, plan: selectedPlanToUpgrade })
      });

      if (res.status === 401 || res.status === 403) return router.push('/login');
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to initiate M-Pesa push.');

      setIsPaymentModalOpen(false);
      setStatusMsg({ type: 'waiting', text: 'M-Pesa prompt sent! Check your phone and enter your PIN. Waiting for confirmation...' });
      setIsPolling(true);
      
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setIsProcessingMpesa(false);
    }
  };

  const initiateUpgrade = (plan: 'BASIC' | 'PRO') => {
    setSelectedPlanToUpgrade(plan);
    setIsPaymentModalOpen(true);
  };

  const currentPlan = profile?.subscription_status || profile?.landlord?.subscription_status || 'FREE';
  const isBasic = currentPlan === 'BASIC';
  const isPro = currentPlan === 'PRO' || currentPlan === 'PREMIUM';

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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">

        {statusMsg && (
          <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 shadow-lg animate-in fade-in slide-in-from-top-4 border ${
              statusMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 
              statusMsg.type === 'waiting' ? 'bg-blue-50 border-blue-200 text-blue-800' : 
              'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
            {statusMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : 
             statusMsg.type === 'waiting' ? <Loader2 className="w-5 h-5 shrink-0 animate-spin" /> : 
             <X className="w-5 h-5 shrink-0" />}
            <span className="font-bold text-sm flex-1">{statusMsg.text}</span>
          </div>
        )}

        <div className="bg-[#ffffff] rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner border ${
              isPro ? 'bg-gradient-to-br from-amber-400 to-amber-600 border-amber-300' : 
              isBasic ? 'bg-gradient-to-br from-[#1f8898] to-[#135a65] border-[#1f8898]' :
              'bg-gray-100 border-gray-200 text-gray-500'
              }`}>
              {isPro ? <Crown className="w-8 h-8 text-white drop-shadow-sm" /> : 
               isBasic ? <Star className="w-8 h-8 text-white drop-shadow-sm" /> : 
               <Building2 className="w-8 h-8" />}
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Current Plan</p>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                {isPro ? 'MogiRentOS Professional' : isBasic ? 'MogiRentOS Basic' : 'MogiRentOS Starter'}
                {(isPro || isBasic) && <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">Active</span>}
              </h2>
            </div>
          </div>
        </div>

        {/* --- 3-TIER PRICING GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          
          {/* 1. Starter Plan */}
          <div className={`bg-[#ffffff] rounded-3xl p-8 border-2 transition-all flex flex-col ${(!isPro && !isBasic) ? 'border-gray-300 shadow-md relative transform md:-translate-y-2' : 'border-gray-100 opacity-80'}`}>
            {(!isPro && !isBasic) && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-md">Current Plan</div>
            )}
            <h3 className="text-xl font-black text-gray-900 mb-2">Starter</h3>
            <p className="text-sm text-gray-500 font-medium mb-6 min-h-[40px]">For landlords with a small portfolio just getting started.</p>
            <div className="mb-8">
              <span className="text-4xl font-black text-gray-900 tracking-tight">KSH 0</span>
              <span className="text-gray-500 font-medium"> / 3 months</span>
            </div>

            <div className="space-y-4 mb-8 flex-1">
              <div className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-gray-400 shrink-0" /><span className="text-sm font-bold text-gray-700">1 Property & 3 Managed Units</span></div>
              <div className="flex items-start gap-3"><Clock className="w-5 h-5 text-gray-400 shrink-0" /><span className="text-sm font-bold text-gray-700">90-Day Access Period</span></div>
              <div className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-gray-400 shrink-0" /><span className="text-sm font-bold text-gray-700">Basic Tenant Directory</span></div>
              <div className="flex items-start gap-3 opacity-40"><X className="w-5 h-5 text-gray-300 shrink-0" /><span className="text-sm font-bold text-gray-400 line-through">Automated Invoicing</span></div>
            </div>

            <button disabled={true} className={`w-full py-3.5 rounded-xl font-black text-sm transition-all bg-gray-100 text-gray-400 cursor-not-allowed`}>
              {(!isPro && !isBasic) ? 'Active Plan' : 'Included'}
            </button>
          </div>

          {/* 2. Basic Plan */}
          <div className={`bg-[#ffffff] rounded-3xl p-8 border-2 transition-all flex flex-col relative ${isBasic ? 'border-[#1f8898] shadow-xl shadow-[#1f8898]/20 transform md:-translate-y-2' : 'border-gray-100 hover:border-[#1f8898]/50'}`}>
            {isBasic && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#1f8898] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-md">
                Current Plan
              </div>
            )}
            <div className="flex items-center gap-2 mb-2"><Star className="w-5 h-5 text-[#1f8898]" /><h3 className="text-xl font-black text-gray-900">Basic</h3></div>
            <p className="text-sm text-gray-500 font-medium mb-6 min-h-[40px]">The essential tools for growing property portfolios.</p>
            <div className="mb-8">
              <span className="text-4xl font-black text-gray-900 tracking-tight">KSH 1,500</span>
              <span className="text-gray-500 font-medium"> / month</span>
            </div>

            <div className="space-y-4 mb-8 flex-1">
              <div className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-[#1f8898] shrink-0" /><span className="text-sm font-bold text-gray-700">Up to 3 Properties & 30 Units</span></div>
              <div className="flex items-start gap-3"><FileText className="w-5 h-5 text-[#1f8898] shrink-0" /><span className="text-sm font-bold text-gray-700">Automated Rent Invoicing</span></div>
              <div className="flex items-start gap-3"><PieChart className="w-5 h-5 text-[#1f8898] shrink-0" /><span className="text-sm font-bold text-gray-700">Basic Arrears Tracking</span></div>
              <div className="flex items-start gap-3 opacity-40"><X className="w-5 h-5 text-gray-300 shrink-0" /><span className="text-sm font-bold text-gray-400 line-through">Maintenance Dispatch</span></div>
            </div>

            <button
              onClick={() => initiateUpgrade('BASIC')}
              disabled={isBasic || isPro || isPolling}
              className={`w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                  isBasic || isPro || isPolling
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-[#1f8898] hover:bg-[#166c7a] text-white shadow-lg shadow-[#1f8898]/30 active:scale-95'
                }`}
            >
              {isBasic ? 'Active Plan' : isPro ? 'Included in Pro' : 'Upgrade to Basic'}
            </button>
          </div>

          {/* 3. Professional Plan */}
          <div className={`bg-[#ffffff] rounded-3xl p-8 border-2 transition-all flex flex-col relative overflow-hidden ${isPro ? 'border-amber-400 shadow-xl shadow-amber-400/20 transform md:-translate-y-2' : 'border-gray-100 hover:border-amber-200'}`}>
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>

            {isPro && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-amber-400 text-[#0d393f] text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-md flex items-center gap-1">
                <Crown className="w-3 h-3" /> Current Plan
              </div>
            )}

            <div className="flex items-center gap-2 mb-2 relative z-10"><Crown className="w-5 h-5 text-amber-500" /><h3 className="text-xl font-black text-gray-900">Professional</h3></div>
            <p className="text-sm text-gray-500 font-medium mb-6 min-h-[40px] relative z-10">The complete operating system for serious managers.</p>

            <div className="mb-8 relative z-10">
              <span className="text-4xl font-black text-gray-900 tracking-tight">KSH 4,500</span>
              <span className="text-gray-500 font-medium"> / month</span>
            </div>

            <div className="space-y-4 mb-8 relative z-10 flex-1">
              <div className="flex items-start gap-3"><Zap className="w-5 h-5 text-amber-500 shrink-0 fill-amber-100" /><span className="text-sm font-bold text-gray-700">Unlimited Properties & Units</span></div>
              <div className="flex items-start gap-3"><FileText className="w-5 h-5 text-amber-500 shrink-0" /><span className="text-sm font-bold text-gray-700">Advanced Automated Billing</span></div>
              <div className="flex items-start gap-3"><Wrench className="w-5 h-5 text-amber-500 shrink-0" /><span className="text-sm font-bold text-gray-700">Maintenance Dispatch Hub</span></div>
              <div className="flex items-start gap-3"><Shield className="w-5 h-5 text-amber-500 shrink-0" /><span className="text-sm font-bold text-gray-700">Priority 24/7 Tech Support</span></div>
            </div>

            <button
              onClick={() => initiateUpgrade('PRO')}
              disabled={isPro || isPolling}
              className={`w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg relative z-10 ${
                  isPro || isPolling
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-[#0d393f] shadow-amber-500/30 active:scale-95'
                }`}
            >
              {isPro ? 'Active Plan' : isPolling ? <><Loader2 className="w-4 h-4 animate-spin" /> Awaiting Payment...</> : <><CreditCard className="w-4 h-4" /> Upgrade to Pro</>}
            </button>
          </div>
        </div>
      </main>

      {/* --- PAYMENT SELECTION MODAL --- */}
      {isPaymentModalOpen && selectedPlanToUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#ffffff] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 flex flex-col">
            
            <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50">
                <div>
                    <h2 className="text-xl font-black tracking-tight text-gray-900">Upgrade to {selectedPlanToUpgrade}</h2>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Total Due: <span className="text-[#1f8898]">KSH {selectedPlanToUpgrade === 'PRO' ? '4,500' : '1,500'}</span></p>
                </div>
                <button onClick={() => { setIsPaymentModalOpen(false); setPaymentMethod(null); setSelectedPlanToUpgrade(null); }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>
            
            <div className="p-6 md:p-8 space-y-4">
              {!paymentMethod ? (
                <>
                  <p className="text-sm font-bold text-gray-600 mb-4 text-center">How would you like to pay today?</p>
                  
                  <button 
                    onClick={() => setPaymentMethod('mpesa')}
                    className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-300 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                        <Smartphone className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-black text-gray-900 text-lg">M-Pesa Express</h3>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Instant Phone Prompt</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-emerald-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-1" />
                  </button>

                  <button 
                    onClick={handlePaystackUpgrade}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-gray-100 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all group disabled:opacity-70"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-600/20">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-black text-gray-900 text-lg">Card or Bank</h3>
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Via Secure Gateway</p>
                      </div>
                    </div>
                    {isProcessing ? <Loader2 className="w-5 h-5 text-gray-400 animate-spin" /> : <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-transform group-hover:translate-x-1" />}
                  </button>
                </>
              ) : (
                <form onSubmit={handleMpesaUpgrade} className="animate-in slide-in-from-right-4 duration-300">
                  <button type="button" onClick={() => setPaymentMethod(null)} className="text-xs font-bold text-gray-500 hover:text-[#1f8898] mb-6 flex items-center gap-1 transition-colors">
                    &larr; Back to methods
                  </button>

                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Smartphone className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="font-black text-xl text-gray-900 tracking-tight">Enter M-Pesa Number</h3>
                    <p className="text-xs font-medium text-gray-500 mt-1 px-4">We will send a secure payment prompt directly to your phone.</p>
                  </div>

                  <div className="mb-8">
                    <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2 ml-1">Safaricom Number</label>
                    <input 
                      type="tel" 
                      required 
                      placeholder="e.g. 254700000000"
                      className="w-full rounded-xl border-2 border-emerald-100 px-4 py-4 text-center text-lg outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all bg-emerald-50/30 font-black text-gray-900 tracking-wider"
                      value={phoneNumber} 
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                    <p className="text-center text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-2">Format: 2547XXXXXXXX or 07XXXXXXXX</p>
                  </div>

                  <button type="submit" disabled={isProcessingMpesa || !phoneNumber} className="flex items-center justify-center gap-2 px-6 py-4 w-full rounded-xl font-black text-sm text-[#ffffff] bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-60 active:scale-95">
                    {isProcessingMpesa ? <Loader2 className="w-5 h-5 animate-spin" /> : <Smartphone className="w-5 h-5" />} 
                    {isProcessingMpesa ? 'Initiating Prompt...' : 'Send M-Pesa Prompt'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}