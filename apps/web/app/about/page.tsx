// apps/web/app/about/page.tsx
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight, Building2, Menu, X, ShieldCheck, 
  Globe, Target, Lightbulb, MapPin, Users, HeartHandshake, Zap
} from "lucide-react";

export default function AboutPage() {
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
            <Link href="/about" className="text-[#1f8898] transition-colors">Company</Link>
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
              <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black text-[#1f8898]">Company</Link>
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
        
        {/* --- ABOUT HERO --- */}
        <section className="relative px-6 lg:px-8 text-center max-w-5xl mx-auto mb-24 md:mb-32">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-20 h-[500px] w-[500px] rounded-full bg-[#1f8898]/10 blur-3xl pointer-events-none"></div>
          
          <div className="inline-flex items-center rounded-full border border-[#1f8898]/20 bg-[#1f8898]/5 px-4 py-2 text-xs font-black uppercase tracking-widest text-[#1f8898] mb-8 shadow-sm backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Globe className="w-4 h-4 mr-2" /> Mogitech Global Ltd
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-gray-900 mb-8 relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 leading-[1.1]">
            Pioneering the future of <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1f8898] to-[#0f4952]">African real estate.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 max-w-3xl mx-auto">
            We build enterprise-grade software that empowers property managers to automate their operations, secure their financial data, and deliver world-class tenant experiences.
          </p>
        </section>

        {/* --- OUR STORY SECTION --- */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-32">
          <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 p-8 md:p-16 lg:p-20 relative overflow-hidden">
            {/* Decorative background */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gray-50 to-transparent pointer-events-none"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-6">The Problem We Saw.</h2>
                <div className="space-y-6 text-lg text-gray-600 font-medium leading-relaxed">
                  <p>
                    Real estate across Kenya and the wider African continent is booming. Yet, the technology powering these massive portfolios has remained stuck in the past. 
                  </p>
                  <p>
                    Property managers were suffocating under the weight of manual M-Pesa reconciliations, fragmented Excel spreadsheets, lost maintenance requests in WhatsApp groups, and unsecured paper leases. The result? Lost revenue, frustrated tenants, and exhausted management teams.
                  </p>
                  <p className="font-bold text-gray-900 border-l-4 border-[#1f8898] pl-4 py-1">
                    We realized that to scale property operations efficiently, landlords didn't just need an app—they needed a comprehensive Operating System.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col justify-center">
                <div className="bg-gray-900 rounded-[2rem] p-10 text-white shadow-xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#1f8898]/30 via-transparent to-transparent opacity-60 group-hover:scale-110 transition-transform duration-700"></div>
                  <Building2 className="w-12 h-12 text-[#1f8898] mb-8 relative z-10" />
                  <h3 className="text-2xl font-black mb-4 relative z-10">Enter MogiRentOS.</h3>
                  <p className="text-gray-400 font-medium leading-relaxed relative z-10">
                    Developed by Mogitech Global Ltd, MogiRentOS is a hyper-localized, highly secure, cloud-native platform designed specifically for the complexities of modern property management. We automate the mundane so you can focus on scaling your empire.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- CORE VALUES BENTO GRID --- */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-32">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-xs font-black text-[#1f8898] uppercase tracking-widest mb-4 inline-block bg-[#1f8898]/10 px-4 py-1.5 rounded-full">Our DNA</h2>
            <h3 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight">The values that drive our engineering.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-100 rounded-[2rem] p-10 hover:shadow-xl hover:shadow-[#1f8898]/5 transition-all duration-300">
              <ShieldCheck className="w-10 h-10 text-[#1f8898] mb-6" />
              <h4 className="text-2xl font-black text-gray-900 mb-3">Uncompromising Security</h4>
              <p className="text-gray-500 font-medium leading-relaxed">
                We handle sensitive financial ledgers and personal tenant data. We employ bank-grade AES-256 encryption, strict Role-Based Access Control, and automated daily backups to ensure your data is impenetrable.
              </p>
            </div>

            <div className="bg-white border border-gray-100 rounded-[2rem] p-10 hover:shadow-xl hover:shadow-[#1f8898]/5 transition-all duration-300">
              <Zap className="w-10 h-10 text-[#1f8898] mb-6" />
              <h4 className="text-2xl font-black text-gray-900 mb-3">Hyper-Localization</h4>
              <p className="text-gray-500 font-medium leading-relaxed">
                Western software fails to understand the nuances of the African market. We built MogiRentOS with native, deep integrations for M-Pesa Paybills and local banking infrastructures from day one.
              </p>
            </div>

            <div className="bg-white border border-gray-100 rounded-[2rem] p-10 hover:shadow-xl hover:shadow-[#1f8898]/5 transition-all duration-300">
              <Target className="w-10 h-10 text-[#1f8898] mb-6" />
              <h4 className="text-2xl font-black text-gray-900 mb-3">Engineered for Scale</h4>
              <p className="text-gray-500 font-medium leading-relaxed">
                Whether you manage 50 units or 50,000, our cloud-native edge architecture guarantees 99.99% uptime and sub-millisecond latency, ensuring the software never bottlenecks your growth.
              </p>
            </div>

            <div className="bg-white border border-gray-100 rounded-[2rem] p-10 hover:shadow-xl hover:shadow-[#1f8898]/5 transition-all duration-300">
              <HeartHandshake className="w-10 h-10 text-[#1f8898] mb-6" />
              <h4 className="text-2xl font-black text-gray-900 mb-3">Customer Obsession</h4>
              <p className="text-gray-500 font-medium leading-relaxed">
                Software is only as good as the team supporting it. We provide dedicated account managers and priority local support to ensure your property operations run flawlessly 24/7/365.
              </p>
            </div>
          </div>
        </section>

        {/* --- GLOBAL PRESENCE SECTION --- */}
        <section className="bg-gray-900 py-24 px-6 lg:px-8 rounded-[3rem] max-w-[95%] mx-auto mb-24 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
          
          <div className="max-w-5xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex-1">
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-6">Headquartered in the Silicon Savannah.</h2>
              <p className="text-lg text-gray-400 font-medium leading-relaxed mb-8">
                Mogitech Global Ltd is proudly based in Nairobi, Kenya. We are perfectly positioned at the heart of Africa's technology and real estate boom, allowing us to build solutions tailored specifically to this dynamic market.
              </p>
              <div className="flex items-center gap-4 text-white font-bold bg-gray-800/50 w-max px-6 py-4 rounded-2xl border border-gray-700">
                <MapPin className="w-6 h-6 text-[#1f8898]" />
                Nairobi, Kenya
              </div>
            </div>
            
            <div className="flex-1 w-full flex justify-center md:justify-end">
               <div className="w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-[#1f8898] to-[#135a65] rounded-full opacity-20 blur-3xl absolute"></div>
               <Globe className="w-64 h-64 md:w-80 md:h-80 text-white/10 relative z-10" strokeWidth={1} />
            </div>
          </div>
        </section>

        {/* --- FINAL CTA SECTION --- */}
        <section className="py-12 relative overflow-hidden">
            <div className="mx-auto max-w-5xl px-6 text-center">
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-6">Partner with the best.</h2>
                <p className="text-xl text-gray-500 font-medium mb-10 max-w-2xl mx-auto">Discover why top property management firms trust Mogitech Global to power their daily operations.</p>
                <Link
                    href="/contact"
                    className="inline-flex h-16 items-center justify-center gap-3 rounded-2xl bg-[#1f8898] px-10 text-lg font-black text-[#ffffff] shadow-xl shadow-[#1f8898]/20 transition-all hover:bg-[#1a7684] hover:shadow-2xl hover:-translate-y-1 active:scale-95"
                >
                    Contact Our Team <ArrowRight className="w-5 h-5" />
                </Link>
            </div>
        </section>
      </main>

      {/* --- PREMIUM FOOTER --- */}
      <footer className="border-t border-gray-200 bg-[#ffffff] pt-20 pb-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
            <div className="lg:col-span-2 pr-4">
              <div className="flex items-center gap-2 mb-6">
                <Building2 className="h-7 w-7 text-[#1f8898]" />
                <span className="text-2xl font-black text-gray-900 tracking-tight">Mogi<span className="text-[#1f8898]">RentOS</span></span>
              </div>
              <p className="text-sm font-medium text-gray-500 leading-relaxed mb-8 max-w-sm">
                The ultimate operating system for modern property managers and forward-thinking landlords in Africa and beyond.
              </p>
              <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-[#1f8898] hover:text-white transition-colors cursor-pointer"><Globe className="w-4 h-4"/></div>
              </div>
            </div>

            <div>
              <h4 className="font-black text-gray-900 mb-6 tracking-tight">Platform</h4>
              <ul className="space-y-4 text-sm font-medium text-gray-500">
                <li><Link href="/dashboard" className="hover:text-[#1f8898] transition-colors">Executive Dashboard</Link></li>
                <li><Link href="/portal" className="hover:text-[#1f8898] transition-colors">Tenant Portal</Link></li>
                <li><Link href="/pricing" className="hover:text-[#1f8898] transition-colors">Pricing</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-black text-gray-900 mb-6 tracking-tight">Company</h4>
              <ul className="space-y-4 text-sm font-medium text-gray-500">
                <li><Link href="/about" className="text-[#1f8898] transition-colors">About Mogitech</Link></li>
                <li><a href="https://mogitechglobal.com/careers.php" target="_blank" rel="noopener noreferrer" className="hover:text-[#1f8898] transition-colors">Careers</a></li>
                <li><Link href="/contact" className="hover:text-[#1f8898] transition-colors">Contact Sales</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-black text-gray-900 mb-6 tracking-tight">Legal</h4>
              <ul className="space-y-4 text-sm font-medium text-gray-500">
                <li><a href="https://mogitechglobal.com/privacy-policy.php" target="_blank" rel="noopener noreferrer" className="hover:text-[#1f8898] transition-colors">Privacy Policy</a></li>
                <li><a href="https://mogitechglobal.com/terms-of-service.php" target="_blank" rel="noopener noreferrer" className="hover:text-[#1f8898] transition-colors">Terms of Service</a></li>
                <li><a href="https://mogitechglobal.com/cookies.php" target="_blank" rel="noopener noreferrer" className="hover:text-[#1f8898] transition-colors">Data Processing</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm font-bold text-gray-400">
              &copy; {new Date().getFullYear()} Mogitech Global Ltd. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm font-bold text-gray-500 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              All Systems Operational
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}