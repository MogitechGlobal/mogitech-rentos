// apps/web/app/customers/page.tsx
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight, Building2, Menu, X, Quote, Star,
  TrendingUp, Clock, ShieldCheck, Globe
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
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

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-600">
            <Link href="/features" className="hover:text-[#1f8898] transition-colors">Platform</Link>
            <Link href="/pricing" className="hover:text-[#1f8898] transition-colors">Pricing</Link>
            <Link href="/about" className="hover:text-[#1f8898] transition-colors">Company</Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold text-gray-600 hover:text-[#1f8898] transition-colors px-4 py-2">
              Client Portal
            </Link>
            <Link href="/login" className="inline-flex h-11 items-center justify-center rounded-xl bg-gray-900 px-6 text-sm font-bold text-[#ffffff] shadow-lg transition-all hover:bg-[#1f8898] hover:shadow-[#1f8898]/30 hover:-translate-y-0.5">
              Access Dashboard <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
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
              <Link href="/features" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black text-gray-900 hover:text-[#1f8898]">Platform</Link>
              <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black text-gray-900 hover:text-[#1f8898]">Pricing</Link>
              <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black text-gray-900 hover:text-[#1f8898]">Company</Link>
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

        {/* --- CUSTOMERS HERO --- */}
        <section className="relative px-6 lg:px-8 text-center max-w-4xl mx-auto mb-20">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-[400px] w-[400px] rounded-full bg-[#1f8898]/10 blur-3xl pointer-events-none"></div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900 mb-6 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Trusted by top <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1f8898] to-[#0f4952]">property portfolios.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 max-w-2xl mx-auto">
            See how forward-thinking landlords and property management agencies are using MogiRentOS to automate collections, reduce vacancies, and scale effortlessly.
          </p>
        </section>

        {/* --- LOGO CLOUD --- */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-32 relative z-20">
          <div className="border-y border-gray-200 py-10 flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Replace these with actual SVGs when you have client logos */}
            <div className="text-xl font-black text-gray-400 uppercase tracking-widest">Apex Properties</div>
            <div className="text-xl font-black text-gray-400 uppercase tracking-widest font-serif italic">Gilgal Suites</div>
            <div className="text-xl font-black text-gray-400 uppercase tracking-widest">Highlands Real Estate</div>
            <div className="text-xl font-black text-gray-400 uppercase tracking-widest">Nairobi Premier</div>
          </div>
        </section>

        {/* --- FEATURED CASE STUDY --- */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-32">
          <div className="bg-gray-900 rounded-[3rem] p-8 md:p-12 lg:p-16 relative overflow-hidden text-white shadow-2xl shadow-gray-900/20">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#1f8898]/40 to-transparent rounded-full blur-3xl pointer-events-none -mr-32 -mt-32"></div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10 items-center">
              <div>
                <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#1f8898] mb-6 backdrop-blur-md border border-white/10">
                  Featured Case Study
                </div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">How Apex Properties scaled to 500+ units with zero added headcount.</h2>
                <p className="text-lg text-gray-400 font-medium leading-relaxed mb-8">
                  Faced with massive administrative overhead from manual M-Pesa tracking and paper leases, Apex Properties integrated MogiRentOS. Within 3 months, they eliminated reconciliation errors and reclaimed hundreds of administrative hours.
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center text-xl font-black text-white border border-gray-700">F</div>
                  <div>
                    <p className="font-bold text-white">Faith Wanjiku</p>
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Operations Manager, Apex Properties</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-6 rounded-3xl">
                  <TrendingUp className="w-8 h-8 text-[#1f8898] mb-4" />
                  <p className="text-4xl font-black text-white mb-1">98%</p>
                  <p className="text-sm font-medium text-gray-400">On-time rent collection rate, up from 65% previously.</p>
                </div>
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-6 rounded-3xl">
                  <Clock className="w-8 h-8 text-[#1f8898] mb-4" />
                  <p className="text-4xl font-black text-white mb-1">40hrs</p>
                  <p className="text-sm font-medium text-gray-400">Saved per month on manual M-Pesa reconciliation.</p>
                </div>
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-6 rounded-3xl sm:col-span-2">
                  <ShieldCheck className="w-8 h-8 text-[#1f8898] mb-4" />
                  <p className="text-4xl font-black text-white mb-1">100%</p>
                  <p className="text-sm font-medium text-gray-400">Lease compliance. All documents digitally signed and securely vaulted before key handover.</p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-black/5 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#1f8898]/10 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex text-amber-400 mb-6">
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                  <Quote className="w-10 h-10 text-[#ebf3f5] mb-4" />
                  <p className="text-lg text-gray-700 font-medium leading-relaxed mb-8">"{t.quote}"</p>
                </div>

                <div className="flex items-center gap-4 pt-6 border-t border-gray-50">
                  <div className="w-12 h-12 rounded-full bg-[#1f8898]/10 flex items-center justify-center text-[#1f8898] font-black text-lg">
                    {t.image}
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900">{t.name}</h4>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t.role}, {t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- FINAL CTA SECTION --- */}
        <section className="py-12 relative overflow-hidden">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-6">Ready to become our next success story?</h2>
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