// apps/web/app/about/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { 
  Building2, Globe, ShieldCheck, Target, MapPin, 
  HeartHandshake, Zap, MessageCircle, Eye, Flag, ArrowRight, CheckCircle2 
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "About Mogitech Global | Building Technology for Modern Businesses",
  description: "Learn about Mogitech Global and how we build practical technology solutions for businesses, including MogiRent property management software in Kenya.",
  keywords: "Mogitech Global, MogiRent, MogiRentOS, property management software Kenya, rental property management, PropTech Kenya",
  alternates: {
    canonical: "https://mogirent.co.ke/about"
  },
  openGraph: {
    title: "About Mogitech Global | Building Technology for Modern Businesses",
    description: "Learn about Mogitech Global and how we build practical technology solutions for businesses, including MogiRent.",
    url: "https://mogirent.co.ke/about",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "About Mogitech Global | Building Technology for Modern Businesses",
    description: "Learn about Mogitech Global and how we build practical technology solutions for businesses, including MogiRent."
  }
};

const jsonLdOrg = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Mogitech Global Ltd",
  "url": "https://mogirent.co.ke",
  "logo": "https://mogirent.co.ke/logo.png",
  "description": "Mogitech Global builds practical digital solutions for businesses, including MogiRent property management software.",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Nairobi",
    "addressCountry": "KE"
  }
};

const jsonLdBreadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://mogirent.co.ke" },
    { "@type": "ListItem", "position": 2, "name": "About", "item": "https://mogirent.co.ke/about" }
  ]
};

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />

      <div className="flex min-h-screen flex-col bg-[#f8fafb] font-sans selection:bg-[#1f8898]/30">

        <Navbar />

        <main className="flex-1 pt-8 pb-20 overflow-hidden relative">

          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-[500px] w-[500px] rounded-full bg-gradient-to-bl from-[#ebf3f5] via-[#1f8898]/5 to-transparent opacity-80 blur-3xl pointer-events-none"></div>

          {/* --- BREADCRUMBS --- */}
          <div className="max-w-5xl mx-auto px-6 mb-6">
            <nav aria-label="Breadcrumb" className="text-xs font-bold text-gray-400 flex items-center gap-2">
              <Link href="/" className="hover:text-[#1f8898] transition-colors">Home</Link>
              <span>/</span>
              <span className="text-gray-600">About Mogitech Global</span>
            </nav>
          </div>

          {/* --- CORPORATE HERO --- */}
          <section className="relative px-6 lg:px-8 max-w-5xl mx-auto mb-16">
            <div className="bg-white rounded-[2.5rem] border border-gray-200/80 p-8 sm:p-12 md:p-16 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#1f8898]/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="max-w-3xl relative z-10">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ebf3f5] text-[#1f8898] text-[10px] font-black uppercase tracking-[0.15em] mb-6 shadow-sm">
                  MOGITECH GLOBAL LTD
                </span>
                
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-gray-900 mb-6 leading-[1.1]">
                  Building practical technology for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1f8898] to-[#0f4952]">modern businesses.</span>
                </h1>
                
                <p className="text-base sm:text-lg text-gray-600 font-medium leading-relaxed mb-6">
                  Mogitech Global builds digital platforms that help businesses simplify operations, manage information, and serve their customers better.
                </p>
                
                <p className="text-base sm:text-lg text-[#0f4952] font-bold leading-relaxed border-l-4 border-[#1f8898] pl-4 py-1">
                  <Link href="/marketplace" className="hover:underline">MogiRent</Link> is our property technology platform built to help landlords, property managers, and real estate professionals manage rental operations more efficiently.
                </p>
              </div>
            </div>
          </section>

          {/* --- WHO WE ARE --- */}
          <section className="max-w-5xl mx-auto px-6 lg:px-8 mb-16">
            <div className="grid md:grid-cols-2 gap-8 items-center bg-white rounded-3xl p-8 sm:p-12 border border-gray-200/80 shadow-sm">
              <div>
                <h2 className="text-xs font-black text-[#1f8898] uppercase tracking-[0.2em] mb-2">Corporate Identity</h2>
                <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-4">Who We Are</h3>
                <p className="text-gray-600 font-medium leading-relaxed text-sm sm:text-base mb-4">
                  Mogitech Global Ltd is a technology company focused on building practical digital solutions for businesses.
                </p>
                <p className="text-gray-600 font-medium leading-relaxed text-sm sm:text-base">
                  We combine software engineering, business understanding, and local market context to create systems that solve real operational problems without unnecessary complexity.
                </p>
              </div>

              <div className="bg-[#ebf3f5]/60 rounded-2xl p-6 sm:p-8 border border-[#1f8898]/10 space-y-4">
                <h4 className="font-black text-gray-900 text-base mb-2">What We Focus On</h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-sm font-bold text-gray-800">
                    <CheckCircle2 className="w-5 h-5 text-[#1f8898] shrink-0 mt-0.5" /> Operational Efficiency in daily workflows
                  </li>
                  <li className="flex items-start gap-3 text-sm font-bold text-gray-800">
                    <CheckCircle2 className="w-5 h-5 text-[#1f8898] shrink-0 mt-0.5" /> Connected Systems replacing isolated spreadsheets
                  </li>
                  <li className="flex items-start gap-3 text-sm font-bold text-gray-800">
                    <CheckCircle2 className="w-5 h-5 text-[#1f8898] shrink-0 mt-0.5" /> Local Relevance tailored to African markets
                  </li>
                  <li className="flex items-start gap-3 text-sm font-bold text-gray-800">
                    <CheckCircle2 className="w-5 h-5 text-[#1f8898] shrink-0 mt-0.5" /> Secure Technology protecting business data
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* --- WHY WE EXIST --- */}
          <section className="max-w-5xl mx-auto px-6 lg:px-8 mb-16">
            <div className="bg-[#0f4952] rounded-[2.5rem] p-8 sm:p-12 md:p-16 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#1f8898]/30 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="max-w-3xl relative z-10">
                <span className="text-[10px] font-black uppercase tracking-widest text-teal-200 mb-2 inline-block">Our Perspective</span>
                <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-6 leading-tight">Technology should simplify business, not complicate it.</h2>
                <div className="space-y-4 text-teal-100/90 text-sm sm:text-base font-medium leading-relaxed">
                  <p>
                    Many businesses still depend on disconnected spreadsheets, manual processes, paper records, and communication channels that were never designed to work together.
                  </p>
                  <p>
                    As businesses grow, these processes become harder to control, harder to report on, and harder to scale. Mogitech Global exists to build technology that brings these operations together.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* --- WHY WE BUILT MOGIRENT --- */}
          <section className="max-w-5xl mx-auto px-6 lg:px-8 mb-16">
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200/80 shadow-sm">
              <h2 className="text-xs font-black text-[#1f8898] uppercase tracking-[0.2em] mb-2">Our Flagship Platform</h2>
              <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-4">Why We Built MogiRent</h3>
              <p className="text-gray-600 font-medium leading-relaxed text-sm sm:text-base mb-6">
                Property management is more than collecting rent. It involves properties, units, tenants, leases, payments, expenses, maintenance, reporting, and communication. MogiRent brings these operational processes into one connected platform.
              </p>

              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="bg-[#f8fafb] p-5 rounded-2xl border border-gray-100">
                  <h4 className="font-black text-gray-900 text-sm mb-1">Landlords</h4>
                  <p className="text-xs text-gray-500 font-medium">Control rental income and performance easily.</p>
                </div>
                <div className="bg-[#f8fafb] p-5 rounded-2xl border border-gray-100">
                  <h4 className="font-black text-gray-900 text-sm mb-1">Property Managers</h4>
                  <p className="text-xs text-gray-500 font-medium">Centralise multi-building portfolio operations.</p>
                </div>
                <div className="bg-[#f8fafb] p-5 rounded-2xl border border-gray-100">
                  <h4 className="font-black text-gray-900 text-sm mb-1">Real Estate Agents</h4>
                  <p className="text-xs text-gray-500 font-medium">Organise property listings and client pipelines.</p>
                </div>
                <div className="bg-[#f8fafb] p-5 rounded-2xl border border-gray-100">
                  <h4 className="font-black text-gray-900 text-sm mb-1">Property Owners</h4>
                  <p className="text-xs text-gray-500 font-medium">Gain clear visibility into asset returns.</p>
                </div>
              </div>
            </div>
          </section>

          {/* --- MISSION & VISION --- */}
          <section className="max-w-5xl mx-auto px-6 lg:px-8 mb-16">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200/80 p-8 rounded-3xl shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-[#ebf3f5] text-[#1f8898] flex items-center justify-center mb-5 font-bold">
                  <Flag className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-black text-gray-900 mb-3">Our Mission</h4>
                <p className="text-gray-600 font-medium leading-relaxed text-sm sm:text-base">
                  To build practical, secure, and locally relevant technology that helps businesses operate more efficiently and grow with confidence.
                </p>
              </div>

              <div className="bg-white border border-gray-200/80 p-8 rounded-3xl shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-[#ebf3f5] text-[#1f8898] flex items-center justify-center mb-5 font-bold">
                  <Eye className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-black text-gray-900 mb-3">Our Vision</h4>
                <p className="text-gray-600 font-medium leading-relaxed text-sm sm:text-base">
                  To become a trusted technology partner for businesses across Africa by making sophisticated digital tools accessible, practical, and useful.
                </p>
              </div>
            </div>
          </section>

          {/* --- OUR VALUES --- */}
          <section className="max-w-5xl mx-auto px-6 lg:px-8 mb-16">
            <div className="text-center mb-10 max-w-2xl mx-auto">
              <h2 className="text-xs font-black text-[#1f8898] uppercase tracking-[0.2em] mb-2">Our Principles</h2>
              <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Core Values</h3>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[
                { title: "Build with Purpose", desc: "We solve real problems rather than building technology for its own sake." },
                { title: "Local Understanding", desc: "We design with the realities of African businesses and users in mind." },
                { title: "Trust & Responsibility", desc: "We treat business and customer information with care and integrity." },
                { title: "Simplicity", desc: "Complex technology should result in simple, intuitive experiences." },
                { title: "Continuous Improvement", desc: "We learn, test, and improve our systems consistently." },
                { title: "Customer Focus", desc: "We build around the people and businesses using our products every day." }
              ].map((val, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
                  <h4 className="font-black text-gray-900 text-base mb-2">{val.title}</h4>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">{val.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* --- BUILT WITH AFRICA IN MIND --- */}
          <section className="max-w-5xl mx-auto px-6 lg:px-8 mb-16">
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#1f8898] mb-2 inline-block">Market Relevance</span>
                <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-3">Built with Africa in mind.</h3>
                <p className="text-gray-600 text-sm sm:text-base font-medium leading-relaxed">
                  We believe software works best when it reflects the environment in which its customers operate. For MogiRent, this means accommodating mobile-first users, M-Pesa-driven payment workflows, and the practical realities of managing properties across growing urban centers.
                </p>
              </div>
              <div className="shrink-0">
                <div className="w-20 h-20 bg-[#ebf3f5] rounded-3xl flex items-center justify-center text-[#1f8898] border border-[#1f8898]/20 shadow-sm">
                  <Globe className="w-10 h-10" />
                </div>
              </div>
            </div>
          </section>

          {/* --- HOW WE BUILD --- */}
          <section className="max-w-5xl mx-auto px-6 lg:px-8 mb-16">
            <div className="text-center mb-10 max-w-2xl mx-auto">
              <h2 className="text-xs font-black text-[#1f8898] uppercase tracking-[0.2em] mb-2">Engineering Process</h2>
              <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">How We Build</h3>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
                <span className="text-xs font-black text-[#1f8898] mb-3 block">01</span>
                <h4 className="font-black text-gray-900 text-base mb-1">Understand the problem</h4>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">We start with the operational hurdle before thinking about code.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
                <span className="text-xs font-black text-[#1f8898] mb-3 block">02</span>
                <h4 className="font-black text-gray-900 text-base mb-1">Build for real users</h4>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">Interfaces should work effortlessly for the people actually using them.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
                <span className="text-xs font-black text-[#1f8898] mb-3 block">03</span>
                <h4 className="font-black text-gray-900 text-base mb-1">Keep complexity behind</h4>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">Technology can be sophisticated without becoming difficult to operate.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
                <span className="text-xs font-black text-[#1f8898] mb-3 block">04</span>
                <h4 className="font-black text-gray-900 text-base mb-1">Improve continuously</h4>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">Products evolve as customers, businesses, and markets grow.</p>
              </div>
            </div>
          </section>

          {/* --- BUILT IN KENYA --- */}
          <section className="max-w-5xl mx-auto px-6 lg:px-8 mb-16">
            <div className="bg-gray-900 rounded-3xl p-8 sm:p-12 text-white border border-gray-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#1f8898] mb-2 inline-block">Headquarters</span>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">Built in Kenya. Designed for growth.</h3>
                <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-xl">
                  Mogitech Global is based in Nairobi, Kenya. Our goal is not simply to digitize existing processes, but to build products that can scale right alongside the businesses using them.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-gray-800 px-4 py-3 rounded-xl border border-gray-700 shrink-0 text-sm font-bold">
                <MapPin className="w-4 h-4 text-[#1f8898]" /> Nairobi, Kenya
              </div>
            </div>
          </section>

          {/* --- MOGIRENT CONVERSION SECTION --- */}
          <section className="max-w-5xl mx-auto px-6 mb-16">
            <div className="bg-gradient-to-br from-[#0f4952] to-[#1f8898] rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-teal-200 mb-2 inline-block">MogiRent Platform</span>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-3">Managing rental properties?</h3>
                <p className="text-teal-100/90 text-sm sm:text-base font-medium leading-relaxed max-w-xl">
                  Bring properties, units, tenants, leases, payments, and day-to-day property operations into one connected platform.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto">
                <Link href="/marketplace" className="bg-white text-[#0f4952] hover:bg-teal-50 px-8 py-4 rounded-xl font-black text-sm transition-all shadow-md text-center">
                  Explore MogiRent →
                </Link>
                <Link href="/contact" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-xl font-black text-sm transition-all text-center">
                  Contact Our Team
                </Link>
              </div>
            </div>
          </section>

        </main>

        <Footer />

      </div>
    </>
  );
}