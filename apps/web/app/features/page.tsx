// apps/web/app/features/page.tsx
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight, Building2, Globe, CheckCircle2, 
  Smartphone, FileSignature, Wrench, PieChart, 
  ShieldCheck, Users, Cloud, LayoutDashboard, 
  Sparkles, MessageCircle
} from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function FeaturesPage() {
  // State to trigger the chart animation
  const [chartLoaded, setChartLoaded] = useState(false);

  useEffect(() => {
    // Trigger the chart bars to grow shortly after mount
    const timer = setTimeout(() => setChartLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafb] font-sans selection:bg-[#1f8898]/30">

       {/* --- STANDARDIZED PUBLIC NAVBAR COMPONENT --- */}
      <Navbar />

      <main className="flex-1 pt-16 pb-24 overflow-hidden relative">
        
        {/* Background Elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-[600px] w-[600px] rounded-full bg-gradient-to-bl from-[#ebf3f5] via-[#1f8898]/5 to-transparent opacity-80 blur-3xl pointer-events-none"></div>

        {/* --- FEATURES HERO --- */}
        <section className="relative px-6 lg:px-8 text-center max-w-4xl mx-auto mb-32">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ebf3f5] text-[#1f8898] text-[10px] font-black uppercase tracking-[0.15em] mb-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Sparkles className="w-3.5 h-3.5" /> Core Platform
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 mb-6 relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 leading-[1.1]">
            Everything you need to run your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1f8898] to-[#0f4952]">real estate empire.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 max-w-2xl mx-auto">
            From automated M-Pesa reconciliations to digital lease signing, discover how MogiRentOS replaces scattered spreadsheets with one unified system.
          </p>
        </section>

        {/* --- FEATURE 1: M-PESA --- */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-32">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 lg:pr-8 animate-in fade-in slide-in-from-left-8 duration-700">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 mb-6 border border-emerald-100 shadow-sm">
                <Smartphone className="w-7 h-7" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-4">Zero-Touch M-Pesa Reconciliation.</h2>
              <p className="text-lg text-gray-500 font-medium leading-relaxed mb-8">
                Stop manually checking your Paybill statements against tenant names. Our system automatically intercepts payments, matches them to the correct unit, clears the invoice, and texts a digital receipt to the tenant instantly.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-bold text-base">Instant Paybill & Till Number synchronization</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-bold text-base">Automatic late fee generation for missed deadlines</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-bold text-base">Partial payment tracking and arrears management</span>
                </li>
              </ul>
            </div>
            
            {/* Abstract M-Pesa UI Mockup */}
            <div className="flex-1 w-full animate-in fade-in slide-in-from-right-8 duration-700">
              <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-emerald-900/5 border border-gray-100 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 relative z-10">Live Transactions</h4>
                <div className="space-y-4 relative z-10">
                  {[
                    { name: "Faith Wanjiku", unit: "A1", amount: "+Ksh 16,000", time: "Just now", status: "Auto-Cleared", initial: "F" },
                    { name: "Brian Mogaka", unit: "B4", amount: "+Ksh 22,000", time: "2 mins ago", status: "Auto-Cleared", initial: "B" },
                    { name: "Peter Juma", unit: "C2", amount: "+Ksh 18,500", time: "15 mins ago", status: "Auto-Cleared", initial: "P" }
                  ].map((tx, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-emerald-200 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-default">
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
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-900/20 p-8 pt-12 relative overflow-hidden h-[450px] flex justify-center group border border-slate-700">
                <div className="absolute w-full h-full bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-blue-900/40 via-transparent to-transparent top-0 left-0"></div>
                
                {/* The Paper */}
                <div className="w-3/4 bg-white rounded-t-2xl shadow-2xl p-8 relative z-10 translate-y-8 group-hover:translate-y-4 transition-transform duration-500 border border-gray-200">
                    <div className="h-4 w-3/4 bg-slate-200 rounded-full mb-8"></div>
                    <div className="space-y-4 mb-12">
                        <div className="h-2.5 w-full bg-slate-100 rounded-full"></div>
                        <div className="h-2.5 w-full bg-slate-100 rounded-full"></div>
                        <div className="h-2.5 w-5/6 bg-slate-100 rounded-full"></div>
                        <div className="h-2.5 w-4/5 bg-slate-100 rounded-full"></div>
                    </div>
                    <div className="flex justify-between items-end border-t-2 border-slate-900 pt-8 mt-auto">
                        <div>
                            <div className="text-3xl font-['Brush_Script_MT'] text-blue-800 -mb-2">Signed Digitally</div>
                            <div className="w-32 h-0.5 bg-slate-900 mt-2 mb-1"></div>
                            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Tenant Signature</p>
                        </div>
                        <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-sm">
                            <ShieldCheck className="w-7 h-7 text-emerald-500" />
                        </div>
                    </div>
                </div>
              </div>
            </div>

            <div className="flex-1 lg:pl-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 mb-6 border border-blue-100 shadow-sm">
                <FileSignature className="w-7 h-7" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-4">Legally Binding E-Signatures.</h2>
              <p className="text-lg text-gray-500 font-medium leading-relaxed mb-8">
                Draft, customize, and execute leases without printing a single page. Tenants review and counter-sign documents securely from their mobile portal, automatically generating a final PDF for both parties.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-bold text-base">Dynamic Global Template Library</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-bold text-base">Customizable clauses per tenant</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-bold text-base">Secure digital document vault storage</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* --- FEATURE 3: MAINTENANCE --- */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-32">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 lg:pr-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 mb-6 border border-amber-100 shadow-sm">
                <Wrench className="w-7 h-7" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-4">Automated Maintenance Hub.</h2>
              <p className="text-lg text-gray-500 font-medium leading-relaxed mb-8">
                Protect your property value by resolving issues faster. Tenants submit tickets with photos, and MogiRentOS auto-routes the task to your preferred plumbers, electricians, or handymen.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-bold text-base">Tenant photo & video uploads</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-bold text-base">Urgency categorization & automated dispatch</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-bold text-base">Post-resolution tenant satisfaction ratings</span>
                </li>
              </ul>
            </div>
            
            {/* Abstract Ticket Mockup */}
            <div className="flex-1 w-full">
              <div className="bg-[#f8fafb] rounded-[2.5rem] shadow-inner border border-gray-200 p-8 lg:p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-100/50 via-transparent to-transparent"></div>
                
                <div className="bg-white rounded-2xl p-6 shadow-xl shadow-amber-900/5 border border-amber-100 hover:-translate-y-2 transition-transform duration-300 mb-6 relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <span className="bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md">High Priority</span>
                        <span className="text-xs text-gray-400 font-bold">Unit B4</span>
                    </div>
                    <h4 className="text-xl font-black text-gray-900 mb-2">Leaking Kitchen Pipe</h4>
                    <p className="text-sm text-gray-500 font-medium mb-5">Water is pooling under the sink cabinet, needs immediate attention.</p>
                    <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                        <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] font-black text-gray-500">QF</div>
                        <span className="text-xs font-bold text-gray-600">Assigned to: QuickFix Plumbing</span>
                    </div>
                </div>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-gray-100 scale-95 origin-top relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <span className="bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md">Routine</span>
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
            
            {/* Animated Chart Mockup */}
            <div className="flex-1 w-full">
              <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-[#1f8898]/10 border border-gray-100 p-8 lg:p-10 h-[400px] flex flex-col relative overflow-hidden">
                 <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-8">Revenue Projection (Last 6 Months)</h4>
                 <div className="flex-1 flex items-end justify-between gap-3 sm:gap-6 z-10">
                    {[40, 65, 55, 80, 95, 100].map((targetHeight, i) => (
                        <div key={i} className="w-full h-full bg-[#ebf3f5] rounded-t-xl relative group">
                            {/* Animated Height Container */}
                            <div 
                                className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#1f8898] to-[#2cb3c6] rounded-t-xl transition-all duration-[1500ms] ease-out shadow-md"
                                style={{ height: chartLoaded ? `${targetHeight}%` : '0%' }}
                            ></div>
                            <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-opacity whitespace-nowrap z-20 shadow-lg">
                                KSH {(targetHeight * 15000).toLocaleString()}
                            </div>
                        </div>
                    ))}
                 </div>
                 <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">
                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                 </div>
              </div>
            </div>

            <div className="flex-1 lg:pl-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#ebf3f5] text-[#1f8898] mb-6 border border-[#1f8898]/10 shadow-sm">
                <PieChart className="w-7 h-7" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-4">Executive Financial Analytics.</h2>
              <p className="text-lg text-gray-500 font-medium leading-relaxed mb-8">
                Gain crystal-clear visibility into your portfolio’s performance. Our dashboard synthesizes raw data into beautiful, boardroom-ready reports detailing cash flow, occupancy rates, and outstanding arrears.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#1f8898] shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-bold text-base">Real-time Monthly Recurring Revenue (MRR) tracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#1f8898] shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-bold text-base">Defaulter & Arrears identification algorithms</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#1f8898] shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-bold text-base">1-Click PDF and Excel ledger exports</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* --- GRID OF ADDITIONAL FEATURES --- */}
        <section className="bg-gray-900 py-24 px-6 lg:px-8 rounded-[3.5rem] max-w-[95%] mx-auto mb-24 relative overflow-hidden border border-gray-800 shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#1f8898]/20 via-transparent to-transparent opacity-60 pointer-events-none"></div>
            
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-6 leading-[1.1]">Built for scale.</h2>
                    <p className="text-lg text-gray-400 font-medium max-w-2xl mx-auto">More tools included out-of-the-box to ensure your property management firm operates flawlessly.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-8 rounded-[2rem] hover:border-[#1f8898]/50 transition-colors group">
                        <ShieldCheck className="w-8 h-8 text-[#1f8898] mb-5 group-hover:scale-110 transition-transform" />
                        <h4 className="text-xl font-bold text-white mb-2">Role-Based Access</h4>
                        <p className="text-sm text-gray-400 font-medium leading-relaxed">Create custom permissions for caretakers, accountants, and regional managers.</p>
                    </div>
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-8 rounded-[2rem] hover:border-[#1f8898]/50 transition-colors group">
                        <LayoutDashboard className="w-8 h-8 text-[#1f8898] mb-5 group-hover:scale-110 transition-transform" />
                        <h4 className="text-xl font-bold text-white mb-2">Tenant Portal</h4>
                        <p className="text-sm text-gray-400 font-medium leading-relaxed">A self-service mobile app for tenants to pay rent, download receipts, and log issues.</p>
                    </div>
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-8 rounded-[2rem] hover:border-[#1f8898]/50 transition-colors group">
                        <Cloud className="w-8 h-8 text-[#1f8898] mb-5 group-hover:scale-110 transition-transform" />
                        <h4 className="text-xl font-bold text-white mb-2">Daily Cloud Backups</h4>
                        <p className="text-sm text-gray-400 font-medium leading-relaxed">Your data is backed up to multiple geographical regions automatically every 24 hours.</p>
                    </div>
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-8 rounded-[2rem] hover:border-[#1f8898]/50 transition-colors group">
                        <Users className="w-8 h-8 text-[#1f8898] mb-5 group-hover:scale-110 transition-transform" />
                        <h4 className="text-xl font-bold text-white mb-2">Visitor Gate Passes</h4>
                        <p className="text-sm text-gray-400 font-medium leading-relaxed">Tenants can generate digital PINs for their guests, enhancing estate security.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* --- ENTERPRISE CTA SECTION --- */}
        <section className="max-w-5xl mx-auto px-6 lg:px-8 relative z-10">
            <div className="bg-gradient-to-br from-[#0d393f] to-[#0a2c31] rounded-[3rem] p-10 md:p-16 text-center border border-gray-800 shadow-2xl shadow-gray-900/20 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-b from-[#1f8898]/20 to-transparent rounded-full blur-3xl pointer-events-none -mt-64"></div>
                
                <div className="w-16 h-16 bg-[#1f8898]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 relative z-10 border border-[#1f8898]/30">
                    <MessageCircle className="w-8 h-8 text-[#1f8898]" />
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4 relative z-10 leading-[1.1]">Ready to scale your portfolio?</h2>
                <p className="text-lg text-teal-100/70 font-medium mb-10 max-w-2xl mx-auto relative z-10">
                    Join the next generation of property managers automating their operations and maximizing revenue with MogiRentOS.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
                    <Link
                        href="/register"
                        className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-[#1f8898] px-8 text-base font-bold text-[#ffffff] shadow-xl shadow-[#1f8898]/20 transition-all hover:bg-[#1a7684] active:scale-95"
                    >
                        Get Started Today <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                        href="/contact"
                        className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-gray-800 border border-gray-700 px-8 text-base font-bold text-white transition-all hover:bg-gray-700 active:scale-95"
                    >
                        Talk to Sales
                    </Link>
                </div>
            </div>
        </section>

      </main>

      {/* --- PREMIUM FOOTER --- */}
      <Footer />

    </div>
  );
}