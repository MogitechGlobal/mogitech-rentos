// apps/web/app/features/page.tsx
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight, Building2, Menu, X, CheckCircle2, 
  Smartphone, FileSignature, Wrench, PieChart, 
  ShieldCheck, Users, Cloud, LayoutDashboard, Globe
} from "lucide-react";
import Footer from "@/components/Footer";

export default function FeaturesPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // State to trigger the chart animation
  const [chartLoaded, setChartLoaded] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    
    // Trigger the chart bars to grow shortly after mount
    setTimeout(() => setChartLoaded(true), 300);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafb] font-sans selection:bg-[#1f8898]/30">

      {/* --- PREMIUM NAVIGATION --- */}
      <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm' : 'bg-transparent'}`}>
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1f8898] to-[#135a65] text-[#ffffff] shadow-lg shadow-[#1f8898]/20 group-hover:scale-105 transition-transform duration-300">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="text-2xl font-black tracking-tight text-gray-900">
              Mogi<span className="text-[#1f8898]">RentOS</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-600">
            <Link href="/features" className="text-[#1f8898] transition-colors">Platform</Link>
            <Link href="/pricing" className="hover:text-[#1f8898] transition-colors">Pricing</Link>
            <Link href="/help" className="hover:text-[#1f8898] transition-colors">Enterprise Support</Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold text-gray-600 hover:text-[#1f8898] transition-colors px-4 py-2">
              Client Portal
            </Link>
            <Link href="/login" className="inline-flex h-11 items-center justify-center rounded-xl bg-gray-900 px-6 text-sm font-bold text-[#ffffff] shadow-lg transition-all hover:bg-[#1f8898] hover:shadow-[#1f8898]/30 hover:-translate-y-0.5">
              Access Dashboard <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          <button
            className="md:hidden p-2 text-gray-900 hover:bg-gray-100 rounded-xl transition-colors z-50"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-0 left-0 w-full h-screen bg-white/95 backdrop-blur-2xl border-b border-gray-200 flex flex-col pt-24 px-6 animate-in slide-in-from-top-4 fade-in duration-300 z-40">
            <nav className="flex flex-col gap-6">
              <Link href="/features" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black text-[#1f8898]">Platform</Link>
              <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black text-gray-900 hover:text-[#1f8898]">Pricing</Link>
              <Link href="/help" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black text-gray-900 hover:text-[#1f8898]">Support</Link>
              <div className="h-px bg-gray-200 my-4"></div>
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-gray-600 hover:text-[#1f8898] text-center">Tenant Sign In</Link>
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="mt-2 flex h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#1f8898] to-[#135a65] text-base font-bold text-[#ffffff] shadow-xl shadow-[#1f8898]/20 active:scale-95 transition-all">
                Access Manager Dashboard
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1 pt-32 pb-24 overflow-hidden">
        {/* --- FEATURES HERO --- */}
        <section className="relative px-6 lg:px-8 text-center max-w-4xl mx-auto mb-32">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-20 h-[500px] w-[500px] rounded-full bg-[#1f8898]/10 blur-3xl pointer-events-none"></div>
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900 mb-6 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Everything you need to run your real estate empire.
          </h1>
          <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 max-w-2xl mx-auto">
            From automated M-Pesa reconciliations to digital lease signing, discover how MogiRentOS replaces scattered spreadsheets with one unified system.
          </p>
        </section>

        {/* --- FEATURE 1: M-PESA --- */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-32">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 lg:pr-8 animate-in fade-in slide-in-from-left-8 duration-700">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 mb-6">
                <Smartphone className="w-7 h-7" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-4">Zero-Touch M-Pesa Reconciliation.</h2>
              <p className="text-lg text-gray-500 font-medium leading-relaxed mb-8">
                Stop manually checking your Paybill statements against tenant names. Our system automatically intercepts payments, matches them to the correct unit, clears the invoice, and texts a digital receipt to the tenant instantly.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                  <span className="text-gray-700 font-bold">Instant Paybill & Till Number synchronization</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                  <span className="text-gray-700 font-bold">Automatic late fee generation for missed deadlines</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                  <span className="text-gray-700 font-bold">Partial payment tracking and arrears management</span>
                </li>
              </ul>
            </div>
            
            {/* Abstract M-Pesa UI Mockup */}
            <div className="flex-1 w-full animate-in fade-in slide-in-from-right-8 duration-700">
              <div className="bg-white rounded-3xl shadow-2xl shadow-emerald-900/5 border border-gray-100 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 relative z-10">Live Transactions</h4>
                <div className="space-y-4 relative z-10">
                  {[
                    { name: "Faith Wanjiku", unit: "A1", amount: "+Ksh 16,000", time: "Just now", status: "Auto-Cleared", initial: "F" },
                    { name: "Brian Mogaka", unit: "B4", amount: "+Ksh 22,000", time: "2 mins ago", status: "Auto-Cleared", initial: "B" },
                    { name: "Peter Juma", unit: "C2", amount: "+Ksh 18,500", time: "15 mins ago", status: "Auto-Cleared", initial: "P" }
                  ].map((tx, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-emerald-200 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">{tx.initial}</div>
                        <div>
                          <p className="font-bold text-gray-900">{tx.name}</p>
                          <p className="text-xs text-gray-500 font-medium">Unit {tx.unit} • {tx.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-emerald-600">{tx.amount}</p>
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{tx.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- FEATURE 2: E-SIGNATURES --- */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-32">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-16">
            
            {/* Abstract Lease Document Mockup */}
            <div className="flex-1 w-full">
              <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-900/20 p-8 pt-12 relative overflow-hidden h-[450px] flex justify-center">
                <div className="absolute w-full h-full bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-blue-900/40 via-transparent to-transparent top-0 left-0"></div>
                
                {/* The Paper */}
                <div className="w-3/4 bg-white rounded-t-xl shadow-2xl p-8 relative z-10 translate-y-8 hover:translate-y-4 transition-transform duration-500">
                    <div className="h-4 w-3/4 bg-slate-200 rounded-full mb-8"></div>
                    <div className="space-y-3 mb-12">
                        <div className="h-2 w-full bg-slate-100 rounded-full"></div>
                        <div className="h-2 w-full bg-slate-100 rounded-full"></div>
                        <div className="h-2 w-5/6 bg-slate-100 rounded-full"></div>
                    </div>
                    <div className="flex justify-between items-end border-t-2 border-slate-900 pt-8 mt-auto">
                        <div>
                            <div className="text-2xl font-['Brush_Script_MT'] text-blue-800 -mb-2">Signed Digitally</div>
                            <div className="w-32 h-0.5 bg-slate-900 mt-2 mb-1"></div>
                            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Tenant Signature</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6 text-emerald-500" />
                        </div>
                    </div>
                </div>
              </div>
            </div>

            <div className="flex-1 lg:pl-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 mb-6">
                <FileSignature className="w-7 h-7" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-4">Legally Binding E-Signatures.</h2>
              <p className="text-lg text-gray-500 font-medium leading-relaxed mb-8">
                Draft, customize, and execute leases without printing a single page. Tenants review and counter-sign documents securely from their mobile portal, automatically generating a final PDF for both parties.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-blue-500 shrink-0" />
                  <span className="text-gray-700 font-bold">Dynamic Global Template Library</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-blue-500 shrink-0" />
                  <span className="text-gray-700 font-bold">Customizable clauses per tenant</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-blue-500 shrink-0" />
                  <span className="text-gray-700 font-bold">Secure digital document vault storage</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* --- FEATURE 3: MAINTENANCE --- */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-32">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 lg:pr-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 mb-6">
                <Wrench className="w-7 h-7" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-4">Automated Maintenance Hub.</h2>
              <p className="text-lg text-gray-500 font-medium leading-relaxed mb-8">
                Protect your property value by resolving issues faster. Tenants submit tickets with photos, and MogiRentOS auto-routes the task to your preferred plumbers, electricians, or handymen.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-amber-500 shrink-0" />
                  <span className="text-gray-700 font-bold">Tenant photo & video uploads</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-amber-500 shrink-0" />
                  <span className="text-gray-700 font-bold">Urgency categorization & automated dispatch</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-amber-500 shrink-0" />
                  <span className="text-gray-700 font-bold">Post-resolution tenant satisfaction ratings</span>
                </li>
              </ul>
            </div>
            
            {/* Abstract Ticket Mockup */}
            <div className="flex-1 w-full">
              <div className="bg-[#f8fafb] rounded-3xl shadow-inner border border-gray-200 p-8">
                <div className="bg-white rounded-2xl p-6 shadow-xl shadow-amber-900/5 border border-amber-100 hover:-translate-y-2 transition-transform duration-300 mb-4">
                    <div className="flex justify-between items-start mb-4">
                        <span className="bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">High Priority</span>
                        <span className="text-xs text-gray-400 font-bold">Unit B4</span>
                    </div>
                    <h4 className="text-lg font-black text-gray-900 mb-2">Leaking Kitchen Pipe</h4>
                    <p className="text-sm text-gray-500 font-medium mb-4">Water is pooling under the sink cabinet, needs immediate attention.</p>
                    <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                        <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"></div>
                        <span className="text-xs font-bold text-gray-600">Assigned to: QuickFix Plumbing</span>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 opacity-60 scale-95 origin-top">
                    <div className="flex justify-between items-start mb-4">
                        <span className="bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Routine</span>
                        <span className="text-xs text-gray-400 font-bold">Unit A1</span>
                    </div>
                    <h4 className="text-lg font-black text-gray-900">Broken Light Switch</h4>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- FEATURE 4: ANALYTICS --- */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-32">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-16">
            
            {/* Animated Chart Mockup - ADDED h-full to the wrapper */}
            <div className="flex-1 w-full">
              <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-[#1f8898]/10 border border-gray-100 p-8 h-[400px] flex flex-col relative overflow-hidden">
                 <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-8">Revenue Projection (Last 6 Months)</h4>
                 <div className="flex-1 flex items-end justify-between gap-2 sm:gap-4 z-10">
                    {[40, 65, 55, 80, 95, 100].map((targetHeight, i) => (
                        <div key={i} className="w-full h-full bg-[#ebf3f5] rounded-t-xl relative group">
                            {/* Animated Height Container */}
                            <div 
                                className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#1f8898] to-[#2cb3c6] rounded-t-xl transition-all duration-[1500ms] ease-out"
                                style={{ height: chartLoaded ? `${targetHeight}%` : '0%' }}
                            ></div>
                            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded transition-opacity whitespace-nowrap z-20">
                                KSH {(targetHeight * 15000).toLocaleString()}
                            </div>
                        </div>
                    ))}
                 </div>
                 <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                 </div>
              </div>
            </div>

            <div className="flex-1 lg:pl-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1f8898]/10 text-[#1f8898] mb-6">
                <PieChart className="w-7 h-7" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-4">Executive Financial Analytics.</h2>
              <p className="text-lg text-gray-500 font-medium leading-relaxed mb-8">
                Gain crystal-clear visibility into your portfolio’s performance. Our dashboard synthesizes raw data into beautiful, boardroom-ready reports detailing cash flow, occupancy rates, and outstanding arrears.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#1f8898] shrink-0" />
                  <span className="text-gray-700 font-bold">Real-time Monthly Recurring Revenue (MRR) tracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#1f8898] shrink-0" />
                  <span className="text-gray-700 font-bold">Defaulter & Arrears identification algorithms</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#1f8898] shrink-0" />
                  <span className="text-gray-700 font-bold">1-Click PDF and Excel ledger exports</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* --- GRID OF ADDITIONAL FEATURES --- */}
        <section className="bg-gray-900 py-24 px-6 lg:px-8 rounded-[3rem] max-w-[95%] mx-auto mb-24">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-6">Built for scale.</h2>
                    <p className="text-lg text-gray-400 font-medium max-w-2xl mx-auto">More tools included out-of-the-box to ensure your property management firm operates flawlessly.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="bg-gray-800/50 border border-gray-700 p-8 rounded-3xl">
                        <ShieldCheck className="w-8 h-8 text-[#1f8898] mb-4" />
                        <h4 className="text-xl font-bold text-white mb-2">Role-Based Access</h4>
                        <p className="text-sm text-gray-400 font-medium">Create custom permissions for caretakers, accountants, and regional managers.</p>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 p-8 rounded-3xl">
                        <LayoutDashboard className="w-8 h-8 text-[#1f8898] mb-4" />
                        <h4 className="text-xl font-bold text-white mb-2">Tenant Portal</h4>
                        <p className="text-sm text-gray-400 font-medium">A self-service mobile app for tenants to pay rent, download receipts, and log issues.</p>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 p-8 rounded-3xl">
                        <Cloud className="w-8 h-8 text-[#1f8898] mb-4" />
                        <h4 className="text-xl font-bold text-white mb-2">Daily Cloud Backups</h4>
                        <p className="text-sm text-gray-400 font-medium">Your data is backed up to multiple geographical regions automatically every 24 hours.</p>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 p-8 rounded-3xl">
                        <Users className="w-8 h-8 text-[#1f8898] mb-4" />
                        <h4 className="text-xl font-bold text-white mb-2">Visitor Gate Passes</h4>
                        <p className="text-sm text-gray-400 font-medium">Tenants can generate digital PINs for their guests, enhancing estate security.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* --- FINAL CTA SECTION --- */}
        <section className="py-12 relative overflow-hidden">
            <div className="mx-auto max-w-5xl px-6 text-center">
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-6">Ready to scale your portfolio?</h2>
                <p className="text-xl text-gray-500 font-medium mb-10 max-w-2xl mx-auto">Join the next generation of property managers automating their operations and maximizing revenue with MogiRentOS.</p>
                <Link
                    href="/login"
                    className="inline-flex h-16 items-center justify-center gap-3 rounded-2xl bg-[#1f8898] px-10 text-lg font-black text-[#ffffff] shadow-xl shadow-[#1f8898]/20 transition-all hover:bg-[#1a7684] hover:shadow-2xl hover:-translate-y-1 active:scale-95"
                >
                    Get Started Today <ArrowRight className="w-5 h-5" />
                </Link>
            </div>
        </section>
      </main>

       {/* --- PREMIUM FOOTER --- */}
      <Footer />

    </div>
  );
}