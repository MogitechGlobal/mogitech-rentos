// apps/web/app/customers/page.tsx
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight, Building2, Globe, Quote, Star,
  TrendingUp, Clock, ShieldCheck, MessageCircle
} from "lucide-react";
import Footer from "@/components/Footer";

// --- Mock Data: Testimonials ---
const testimonials = [
  {
    quote: "Before MogiRentOS, the 5th of every month was a nightmare of Excel sheets and M-Pesa statements. Now, the system auto-reconciles 90% of our payments while I sleep. It's nothing short of revolutionary.",
    name: "Faith Wanjiku",
    role: "Operations Manager",
    company: "Apex Property Management Ltd",
    image: "F"
  },
  {
    quote: "The automated lease renewal notices alone have saved us millions in lost revenue. Tenants are happier because they can request maintenance from their phones, and we can track our vendor costs in real-time.",
    name: "Peter Kamau",
    role: "Managing Director",
    company: "Gilgal Apartments & Suites",
    image: "P"
  },
  {
    quote: "We migrated a portfolio of 400+ units onto MogiRentOS in less than a week. The role-based access allows my accountants to see the ledgers without messing up the tenant profiles. Highly recommended.",
    name: "Sarah Omondi",
    role: "Chief Financial Officer",
    company: "Nairobi Premier Estates",
    image: "S"
  },
  {
    quote: "The digital signatures are a game-changer. We used to spend days chasing tenants to physically sign house rules and condition reports. Now, it's all done via the portal before they even get the keys.",
    name: "Brian Kipkorir",
    role: "Property Supervisor",
    company: "Highlands Real Estate",
    image: "B"
  }
];

export default function CustomersPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafb] font-sans selection:bg-[#1f8898]/30">

      {/* --- STANDARDIZED PUBLIC NAVBAR --- */}
      <nav className="bg-white border-b border-gray-100 py-3 sm:py-4 px-4 sm:px-6 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">

              <Link href="/" className="flex items-center gap-2 shrink-0 group">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-[#1f8898] to-[#135a65] rounded-lg flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-300">
                      <Building2 className="w-4 h-4 sm:w-4 sm:h-4" />
                  </div>
                  <span className="text-lg sm:text-xl font-black text-gray-900 tracking-tight leading-none hidden sm:block">
                      Mogi<span className="text-[#1f8898]">RentOS</span>
                  </span>
                  <span className="text-[17px] font-black text-gray-900 tracking-tight leading-none sm:hidden">
                      Mogi<span className="text-[#1f8898]">Rent</span>
                  </span>
              </Link>

              <div className="flex items-center gap-3 sm:gap-6 shrink-0">
                  <Link href="/marketplace" className="text-xs sm:text-sm font-bold text-gray-500 hover:text-[#1f8898] transition-colors hidden md:flex items-center gap-1.5">
                      <Globe className="w-4 h-4" /> Marketplace
                  </Link>
                  <Link href="/pricing" className="text-xs sm:text-sm font-bold text-gray-500 hover:text-[#1f8898] transition-colors hidden lg:block">
                      Pricing
                  </Link>
                  <div className="h-4 w-px bg-gray-200 hidden md:block"></div>
                  <Link href="/login" className="text-xs sm:text-sm font-bold text-[#1f8898] bg-[#1f8898]/10 hover:bg-[#1f8898]/20 px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap">
                      Sign In <ArrowRight className="w-3 h-3 hidden sm:block" />
                  </Link>
              </div>
          </div>
      </nav>

      <main className="flex-1 pt-16 pb-24 overflow-hidden relative">

        {/* --- CUSTOMERS HERO --- */}
        <section className="relative px-6 lg:px-8 text-center max-w-4xl mx-auto mb-20">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-[400px] w-[400px] rounded-full bg-gradient-to-bl from-[#ebf3f5] via-[#1f8898]/5 to-transparent opacity-80 blur-3xl pointer-events-none"></div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ebf3f5] text-[#1f8898] text-[10px] font-black uppercase tracking-[0.15em] mb-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Star className="w-3.5 h-3.5 fill-[#1f8898]" /> Customer Success
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 mb-6 relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 leading-[1.1]">
            Trusted by top <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1f8898] to-[#0f4952]">property portfolios.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 max-w-2xl mx-auto">
            See how forward-thinking landlords and property management agencies are using MogiRentOS to automate collections, reduce vacancies, and scale effortlessly.
          </p>
        </section>

        {/* --- LOGO CLOUD --- */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-32 relative z-20 animate-in fade-in duration-1000 delay-300">
          <div className="border-y border-gray-200 py-10 flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Replace these with actual SVGs when you have client logos */}
            <div className="text-lg sm:text-xl font-black text-gray-400 uppercase tracking-widest hover:text-[#1f8898] transition-colors cursor-default">Apex Properties</div>
            <div className="text-lg sm:text-xl font-black text-gray-400 uppercase tracking-widest font-serif italic hover:text-[#1f8898] transition-colors cursor-default">Gilgal Suites</div>
            <div className="text-lg sm:text-xl font-black text-gray-400 uppercase tracking-widest hover:text-[#1f8898] transition-colors cursor-default">Highlands Real Estate</div>
            <div className="text-lg sm:text-xl font-black text-gray-400 uppercase tracking-widest hover:text-[#1f8898] transition-colors cursor-default">Nairobi Premier</div>
          </div>
        </section>

        {/* --- FEATURED CASE STUDY --- */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-32">
          <div className="bg-gray-900 rounded-[3rem] p-8 md:p-12 lg:p-16 relative overflow-hidden text-white shadow-2xl shadow-gray-900/20">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#1f8898]/40 to-transparent rounded-full blur-3xl pointer-events-none -mr-32 -mt-32"></div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10 items-center">
              <div>
                <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-teal-200 mb-6 backdrop-blur-md border border-white/10 shadow-sm">
                  Featured Case Study
                </div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6 leading-[1.1]">How Apex Properties scaled to 500+ units with zero added headcount.</h2>
                <p className="text-lg text-gray-400 font-medium leading-relaxed mb-8">
                  Faced with massive administrative overhead from manual M-Pesa tracking and paper leases, Apex Properties integrated MogiRentOS. Within 3 months, they eliminated reconciliation errors and reclaimed hundreds of administrative hours.
                </p>
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 w-fit backdrop-blur-sm">
                  <div className="w-12 h-12 rounded-full bg-[#1f8898] flex items-center justify-center text-xl font-black text-white shadow-inner">F</div>
                  <div>
                    <p className="font-bold text-white text-sm">Faith Wanjiku</p>
                    <p className="text-[10px] text-teal-200/70 uppercase tracking-widest font-bold">Operations Manager, Apex Properties</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:border-[#1f8898]/50 transition-colors p-8 rounded-3xl group">
                  <TrendingUp className="w-8 h-8 text-[#1f8898] mb-4 group-hover:scale-110 transition-transform" />
                  <p className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">98%</p>
                  <p className="text-sm font-medium text-gray-400 leading-relaxed">On-time rent collection rate, up from 65% previously.</p>
                </div>
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:border-[#1f8898]/50 transition-colors p-8 rounded-3xl group">
                  <Clock className="w-8 h-8 text-[#1f8898] mb-4 group-hover:scale-110 transition-transform" />
                  <p className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">40hrs</p>
                  <p className="text-sm font-medium text-gray-400 leading-relaxed">Saved per month on manual M-Pesa reconciliation workflows.</p>
                </div>
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:border-[#1f8898]/50 transition-colors p-8 rounded-3xl sm:col-span-2 flex flex-col sm:flex-row items-start sm:items-center gap-6 group">
                  <div className="shrink-0">
                    <ShieldCheck className="w-8 h-8 text-[#1f8898] mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-4xl md:text-5xl font-black text-white tracking-tight">100%</p>
                  </div>
                  <p className="text-sm font-medium text-gray-400 leading-relaxed">
                    Lease compliance. All documents are digitally signed and securely vaulted before key handover, eliminating physical paperwork.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- TESTIMONIALS GRID --- */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-32">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">Don't just take our word for it.</h2>
            <p className="text-lg text-gray-500 font-medium leading-relaxed">Hear from the property managers who use our software every single day to run their businesses.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-black/5 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#1f8898]/10 transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <div className="flex text-amber-400 mb-6">
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                  <Quote className="w-10 h-10 text-[#ebf3f5] mb-4 group-hover:text-[#1f8898]/20 transition-colors" />
                  <p className="text-lg text-gray-700 font-medium leading-relaxed mb-8">"{t.quote}"</p>
                </div>

                <div className="flex items-center gap-4 pt-6 border-t border-gray-50">
                  <div className="w-12 h-12 rounded-full bg-[#ebf3f5] flex items-center justify-center text-[#1f8898] font-black text-lg shadow-sm">
                    {t.image}
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900">{t.name}</h4>
                    <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest">{t.role}, <span className="text-[#1f8898]">{t.company}</span></p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- ENTERPRISE CTA SECTION --- */}
        <section className="max-w-5xl mx-auto px-6 lg:px-8 relative z-10">
            <div className="bg-gradient-to-br from-[#0d393f] to-[#0a2c31] rounded-[3rem] p-10 md:p-16 text-center border border-gray-800 shadow-2xl shadow-gray-900/20 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-b from-[#1f8898]/20 to-transparent rounded-full blur-3xl pointer-events-none -mt-64"></div>
                
                <div className="w-16 h-16 bg-[#1f8898]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 relative z-10 border border-[#1f8898]/30">
                    <MessageCircle className="w-8 h-8 text-[#1f8898]" />
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4 relative z-10 leading-[1.1]">Ready to become our next success story?</h2>
                <p className="text-lg text-teal-100/70 font-medium mb-10 max-w-2xl mx-auto relative z-10">
                    Join the next generation of property managers automating their operations and maximizing revenue with MogiRentOS.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
                    <Link
                        href="/register"
                        className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-[#1f8898] px-8 text-base font-bold text-[#ffffff] shadow-xl shadow-[#1f8898]/20 transition-all hover:bg-[#1a7684] active:scale-95"
                    >
                        Start Your Free Trial <ArrowRight className="w-4 h-4" />
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