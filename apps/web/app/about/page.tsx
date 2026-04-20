// apps/web/app/about/page.tsx
'use client';

import Link from "next/link";
import {
  ArrowRight, Building2, Globe, ShieldCheck,
  Target, MapPin, HeartHandshake, Zap,
  MessageCircle, Info
} from "lucide-react";
import Footer from "@/components/Footer";

export default function AboutPage() {
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

        {/* Background Elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-[600px] w-[600px] rounded-full bg-gradient-to-bl from-[#ebf3f5] via-[#1f8898]/5 to-transparent opacity-80 blur-3xl pointer-events-none"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-20 h-[500px] w-[500px] rounded-full bg-[#1f8898]/5 blur-3xl pointer-events-none"></div>

        {/* --- ABOUT HERO --- */}
        <section className="relative px-6 lg:px-8 text-center max-w-4xl mx-auto mb-24 md:mb-32">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ebf3f5] text-[#1f8898] text-[10px] font-black uppercase tracking-[0.15em] mb-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Info className="w-3.5 h-3.5" /> Our Story
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 mb-6 relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 leading-[1.1]">
            Pioneering the future of <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1f8898] to-[#0f4952]">African real estate.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 max-w-3xl mx-auto">
            We build enterprise-grade software that empowers property managers to automate their operations, secure their financial data, and deliver world-class tenant experiences.
          </p>
        </section>

        {/* --- OUR STORY SECTION --- */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-32 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
          <div className="bg-white rounded-[3rem] shadow-xl shadow-black/5 border border-gray-100 p-8 md:p-16 lg:p-20 relative overflow-hidden">
            {/* Decorative background */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gray-50/50 to-transparent pointer-events-none"></div>

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
                <div className="bg-gradient-to-br from-[#0d393f] to-[#0a2c31] rounded-[2.5rem] p-10 sm:p-12 text-white shadow-2xl shadow-gray-900/20 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-500">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#1f8898]/30 via-transparent to-transparent opacity-60 group-hover:scale-110 transition-transform duration-700"></div>
                  
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-8 relative z-10 border border-white/10 backdrop-blur-sm">
                      <Building2 className="w-7 h-7 text-teal-200" />
                  </div>
                  
                  <h3 className="text-3xl font-black mb-4 relative z-10 tracking-tight">Enter MogiRentOS.</h3>
                  <p className="text-teal-50/80 font-medium leading-relaxed relative z-10 text-lg">
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
            <h3 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">The values that drive our engineering.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 sm:p-10 hover:shadow-xl hover:shadow-[#1f8898]/5 hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 bg-[#ebf3f5] rounded-2xl flex items-center justify-center mb-6 text-[#1f8898] border border-[#1f8898]/10 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-2xl font-black text-gray-900 mb-3">Uncompromising Security</h4>
              <p className="text-gray-500 font-medium leading-relaxed">
                We handle sensitive financial ledgers and personal tenant data. We employ bank-grade AES-256 encryption, strict Role-Based Access Control, and automated daily backups to ensure your data is impenetrable.
              </p>
            </div>

            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 sm:p-10 hover:shadow-xl hover:shadow-[#1f8898]/5 hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 bg-[#ebf3f5] rounded-2xl flex items-center justify-center mb-6 text-[#1f8898] border border-[#1f8898]/10 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6" />
              </div>
              <h4 className="text-2xl font-black text-gray-900 mb-3">Hyper-Localization</h4>
              <p className="text-gray-500 font-medium leading-relaxed">
                Western software fails to understand the nuances of the African market. We built MogiRentOS with native, deep integrations for M-Pesa Paybills and local banking infrastructures from day one.
              </p>
            </div>

            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 sm:p-10 hover:shadow-xl hover:shadow-[#1f8898]/5 hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 bg-[#ebf3f5] rounded-2xl flex items-center justify-center mb-6 text-[#1f8898] border border-[#1f8898]/10 group-hover:scale-110 transition-transform">
                  <Target className="w-6 h-6" />
              </div>
              <h4 className="text-2xl font-black text-gray-900 mb-3">Engineered for Scale</h4>
              <p className="text-gray-500 font-medium leading-relaxed">
                Whether you manage 50 units or 50,000, our cloud-native edge architecture guarantees 99.99% uptime and sub-millisecond latency, ensuring the software never bottlenecks your growth.
              </p>
            </div>

            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 sm:p-10 hover:shadow-xl hover:shadow-[#1f8898]/5 hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 bg-[#ebf3f5] rounded-2xl flex items-center justify-center mb-6 text-[#1f8898] border border-[#1f8898]/10 group-hover:scale-110 transition-transform">
                  <HeartHandshake className="w-6 h-6" />
              </div>
              <h4 className="text-2xl font-black text-gray-900 mb-3">Customer Obsession</h4>
              <p className="text-gray-500 font-medium leading-relaxed">
                Software is only as good as the team supporting it. We provide dedicated account managers and priority local support to ensure your property operations run flawlessly 24/7/365.
              </p>
            </div>
          </div>
        </section>

        {/* --- GLOBAL PRESENCE SECTION --- */}
        <section className="bg-gray-900 py-20 lg:py-24 px-6 lg:px-12 rounded-[3.5rem] max-w-[95%] mx-auto mb-24 relative overflow-hidden border border-gray-800 shadow-2xl">
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>

          <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-20">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight mb-6 leading-[1.1]">Headquartered in the Nairobi, Kenya.</h2>
              <p className="text-lg text-gray-400 font-medium leading-relaxed mb-10 max-w-xl mx-auto md:mx-0">
                Mogitech Global Ltd is proudly based in Nairobi, Kenya. We are perfectly positioned at the heart of Africa's technology and real estate boom, allowing us to build solutions tailored specifically to this dynamic market.
              </p>
              <div className="inline-flex items-center gap-4 text-white font-bold bg-gray-800/50 px-6 py-4 rounded-2xl border border-gray-700 backdrop-blur-sm">
                <MapPin className="w-6 h-6 text-[#1f8898]" />
                Nairobi, Kenya
              </div>
            </div>

            <div className="flex-1 w-full flex justify-center md:justify-end relative">
              <div className="w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-[#1f8898] to-[#135a65] rounded-full opacity-20 blur-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
              <Globe className="w-64 h-64 md:w-80 md:h-80 text-white/10 relative z-10 animate-[spin_60s_linear_infinite]" strokeWidth={1} />
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
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4 relative z-10 leading-[1.1]">Partner with the best.</h2>
                <p className="text-lg text-teal-100/70 font-medium mb-10 max-w-2xl mx-auto relative z-10">
                    Discover why top property management firms trust Mogitech Global to power their daily operations and drive revenue growth.
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
                        Contact Our Team
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