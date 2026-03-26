// apps/web/app/page.tsx
/* eslint-disable */
'use client';

import { useState } from "react";
import Link from "next/link";
import _ from "lodash";
import {
  ArrowRight, Building2, ShieldCheck, BarChart3,
  Globe, Zap, Server, Menu, X, CheckCircle2, Database,
  Wrench, FileText
} from "lucide-react";

// --- Data Configuration ---
const rawFeatures = [
  {
    title: "executive analytics & reporting",
    description: "Real-time financial reporting, arrears tracking, and portfolio-wide occupancy metrics. Generate C-suite ready PDF reports with a single click.",
    longDescription: "Transform raw property data into actionable intelligence. Our analytics engine automatically categorizes income, flags serial late-payers, and projects your monthly cash flow. Export beautiful, boardroom-ready financial statements instantly.",
    benefits: ["Customizable PDF & Excel Exports", "Live Arrears & Defaulter Tracking", "Predictive Occupancy Forecasting"],
    icon: BarChart3,
    colSpan: "md:col-span-2 lg:col-span-2",
  },
  {
    title: "bank-grade security",
    description: "End-to-end encryption ensuring your tenant data and financial ledgers remain strictly confidential.",
    longDescription: "Your portfolio's data integrity is our highest priority. MogiRentOS utilizes AES-256 encryption at rest and TLS 1.3 in transit, ensuring that lease agreements, payment histories, and personal tenant details are impenetrable.",
    benefits: ["AES-256 Encryption at Rest", "Role-Based Access Control (RBAC)", "Automated Daily Cloud Backups"],
    icon: ShieldCheck,
    colSpan: "md:col-span-1 lg:col-span-1",
  },
  {
    title: "automated M-Pesa reconciliations",
    description: "Seamlessly sync M-Pesa and bank transfers directly to tenant ledgers without manual entry.",
    longDescription: "Eliminate manual data entry errors and hours of reconciliation. When a tenant pays via your dedicated M-Pesa Paybill or Till, the system instantly identifies the tenant, updates their invoice status, and issues a digital receipt.",
    benefits: ["Instant M-Pesa Paybill Sync", "Zero-Touch Receipt Generation", "Automatic Late Fee Application"],
    icon: Zap,
    colSpan: "md:col-span-1 lg:col-span-1",
  },
  {
    title: "maintenance ticketing",
    description: "Automated routing for tenant repair requests, vendor dispatch, and resolution tracking.",
    longDescription: "Give tenants the power to report issues directly from their portal. MogiRentOS auto-assigns tickets to the right vendors (plumbers, electricians) based on category, tracking progress from pending to resolved.",
    benefits: ["Automated Vendor Dispatch", "Photo Uploads & Status Updates", "Cost Tracking per Property"],
    icon: Wrench,
    colSpan: "md:col-span-1 lg:col-span-1",
  },
  {
    title: "smart lease management",
    description: "Digitize your rental agreements, track expirations, and automate renewal notices.",
    longDescription: "Stop losing track of expiring leases. The system tracks every lease lifecycle, sends automated 60-day renewal notices, and securely stores digital copies of all tenant agreements.",
    benefits: ["Digital Document Vault", "Automated Expiration Alerts", "Rent Escalation Rules"],
    icon: FileText,
    colSpan: "md:col-span-2 lg:col-span-1",
  },
  {
    title: "global infrastructure",
    description: "Powered by modern edge networks for sub-millisecond global latency and 99.99% uptime.",
    longDescription: "MogiRentOS is built on a distributed edge architecture. Whether your property managers are accessing the dashboard from a high-speed fiber connection in Nairobi or a 3G mobile network on-site, the platform remains lightning fast and highly responsive.",
    benefits: ["99.99% SLA Guarantee", "Sub-millisecond API Latency", "Localized Data Residency"],
    icon: Globe,
    colSpan: "md:col-span-2 lg:col-span-3",
  },
];

const features = _.map(rawFeatures, (feature) => ({
  ...feature,
  title: _.startCase(feature.title),
}));

const stats = [
  { label: "Units Managed", value: "10,000+" },
  { label: "Transactions Synced", value: "Ksh 2B+" },
  { label: "System Uptime", value: "99.99%" },
];

export default function CorporateLandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);

  // Helper function to open modal directly from footer links
  const openFeatureModal = (keyword: string) => {
    const feature = features.find(f => f.title.toLowerCase().includes(keyword.toLowerCase()));
    if (feature) setSelectedFeature(feature);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafb] font-sans selection:bg-[#1f8898]/30">

      {/* --- Corporate Navigation --- */}
      <header className="fixed top-0 z-50 w-full border-b border-gray-200/80 bg-[#ffffff]/90 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1f8898] text-[#ffffff] shadow-lg shadow-[#1f8898]/20">
              <Building2 className="h-6 w-6" />
            </div>
            <span className="text-2xl font-black tracking-tight text-gray-900">
              Mogi<span className="text-[#1f8898]">RentOS</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-8 text-sm font-bold text-gray-600">
            <Link href="#features" className="hover:text-[#1f8898] transition-colors">Platform</Link>
            <Link href="#infrastructure" className="hover:text-[#1f8898] transition-colors">Infrastructure</Link>
            <Link href="/help" className="hover:text-[#1f8898] transition-colors">Enterprise Support</Link>
          </nav>

          <div className="hidden md:flex items-center gap-5">
            <Link href="/login" className="text-sm font-bold text-gray-600 hover:text-[#1f8898] transition-colors">
              Client Portal
            </Link>
            <Link href="/login" className="inline-flex h-11 items-center justify-center rounded-lg bg-[#1f8898] px-6 text-sm font-bold text-[#ffffff] shadow-md shadow-[#1f8898]/20 transition-all hover:bg-[#1a7684] hover:shadow-lg hover:-translate-y-0.5">
              Access Dashboard
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-[#1f8898] hover:bg-[#ebf3f5] rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-[#ffffff] border-b border-gray-200 shadow-xl animate-in slide-in-from-top-4 fade-in duration-200">
            <nav className="flex flex-col p-6 gap-4">
              <Link href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-bold text-gray-800 hover:text-[#1f8898]">Platform</Link>
              <Link href="#infrastructure" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-bold text-gray-800 hover:text-[#1f8898]">Infrastructure</Link>
              <Link href="/help" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-bold text-gray-800 hover:text-[#1f8898]">Enterprise Support</Link>
              <div className="h-px bg-gray-100 my-2"></div>
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-bold text-gray-800 hover:text-[#1f8898]">Client Portal Sign In</Link>
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="mt-2 flex h-12 w-full items-center justify-center rounded-lg bg-[#1f8898] text-sm font-bold text-[#ffffff] shadow-md hover:bg-[#1a7684]">
                Access Dashboard
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1 pt-20">
        {/* --- Hero Section --- */}
        <section className="relative overflow-hidden bg-[#ffffff] pt-28 pb-20 md:pt-36 md:pb-32 border-b border-gray-100">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-[600px] w-[600px] rounded-full bg-gradient-to-bl from-[#ebf3f5] to-transparent opacity-80 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-[#1f8898]/5 to-transparent opacity-80 blur-3xl pointer-events-none"></div>

          <div className="relative mx-auto max-w-7xl px-6 text-center z-10">
            <div className="inline-flex items-center rounded-full border border-[#1f8898]/20 bg-[#ebf3f5] px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#1f8898] mb-8 shadow-sm">
              <Server className="mr-2 h-4 w-4" /> Next-Generation Property Cloud
            </div>

            <h1 className="mx-auto max-w-5xl text-5xl font-black tracking-tight text-gray-900 sm:text-7xl lg:text-[5rem] mb-8 leading-[1.1]">
              Property Management, <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1f8898] to-[#135a65]">Engineered for Scale.</span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg sm:text-xl font-medium text-gray-500 leading-relaxed mb-10">
              MogiRentOS provides executives and property managers with unparalleled visibility into their portfolios. Experience automated billing, seamless maintenance routing, and real-time financial analytics.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="inline-flex h-14 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#1f8898] px-8 text-base font-bold text-[#ffffff] shadow-xl shadow-[#1f8898]/20 transition-all hover:bg-[#1a7684] hover:shadow-2xl hover:-translate-y-1"
              >
                Launch Executive Dashboard
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="#infrastructure"
                className="inline-flex h-14 w-full sm:w-auto items-center justify-center rounded-xl border-2 border-gray-200 bg-[#ffffff] px-8 text-base font-bold text-gray-700 transition-all hover:border-[#1f8898]/30 hover:bg-gray-50"
              >
                View System Specs
              </Link>
            </div>
          </div>
        </section>

        {/* --- Social Proof / Stats Section --- */}
        <section className="bg-[#1f8898] py-12 relative z-20 shadow-inner">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-white/20 text-center">
              {stats.map((stat, idx) => (
                <div key={idx} className="pt-6 md:pt-0 flex flex-col items-center justify-center">
                  <p className="text-4xl font-black text-white tracking-tight mb-2">{stat.value}</p>
                  <p className="text-xs font-bold text-teal-100 uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- Features Bento Grid --- */}
        <section id="features" className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
          <div className="mb-16 md:mb-20 md:text-center max-w-3xl md:mx-auto">
            <h2 className="text-sm font-black text-[#1f8898] uppercase tracking-widest mb-3">Enterprise Capabilities</h2>
            <h3 className="text-3xl font-black text-gray-900 sm:text-5xl tracking-tight">Built for modern portfolios.</h3>
            <p className="mt-6 text-lg text-gray-500 font-medium leading-relaxed">Everything you need to scale your real estate operations, secured by bank-grade encryption and powered by real-time data pipelines.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedFeature(feature)}
                  className={`cursor-pointer group rounded-3xl border border-gray-200 bg-[#ffffff] text-gray-950 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-[#1f8898]/10 hover:-translate-y-1 hover:border-[#1f8898]/30 p-8 flex flex-col overflow-hidden relative ${feature.colSpan}`}
                >
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500 pointer-events-none">
                    <Icon className="w-48 h-48 text-[#1f8898]" />
                  </div>

                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ebf3f5] text-[#1f8898] group-hover:bg-[#1f8898] group-hover:text-[#ffffff] transition-colors relative z-10 shadow-sm">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-black text-xl mb-3 text-gray-900 relative z-10">{feature.title}</h3>
                  <p className="text-base font-medium text-gray-500 leading-relaxed flex-1 relative z-10 max-w-lg">
                    {feature.description}
                  </p>

                  <div className="mt-8 flex items-center gap-2 text-sm font-bold text-[#1f8898] opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-4 group-hover:translate-x-0 duration-300 relative z-10">
                    Explore feature <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* --- Infrastructure Section --- */}
        <section id="infrastructure" className="relative overflow-hidden bg-gray-950 py-24 sm:py-32">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#1f8898]/20 via-transparent to-transparent opacity-60"></div>

          <div className="relative mx-auto max-w-7xl px-6 text-center z-10">
            <h2 className="text-sm font-black text-[#1f8898] uppercase tracking-widest mb-3">System Architecture</h2>
            <h3 className="text-3xl font-black text-white sm:text-5xl tracking-tight mb-6">Global Infrastructure. <br className="hidden md:block" /> Local Reliability.</h3>
            <p className="mx-auto max-w-2xl text-lg text-gray-400 font-medium mb-16 leading-relaxed">
              Deployed on enterprise-grade cloud environments, ensuring 99.99% uptime, localized Kenyan data residency for compliance, and sub-millisecond API response times.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="p-8 rounded-3xl bg-gray-900 border border-gray-800 hover:border-[#1f8898]/50 transition-colors group">
                <Server className="w-10 h-10 text-[#1f8898] mb-6 group-hover:scale-110 transition-transform" />
                <h4 className="text-xl font-bold text-white mb-3">Next.js & NestJS Edge</h4>
                <p className="text-sm text-gray-400 leading-relaxed font-medium">
                  Server-side rendered React interfaces paired with robust NestJS microservices. Built to handle thousands of concurrent tenant interactions without breaking a sweat.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-gray-900 border border-gray-800 hover:border-[#1f8898]/50 transition-colors group">
                <Database className="w-10 h-10 text-[#1f8898] mb-6 group-hover:scale-110 transition-transform" />
                <h4 className="text-xl font-bold text-white mb-3">PostgreSQL Ledgers</h4>
                <p className="text-sm text-gray-400 leading-relaxed font-medium">
                  ACID-compliant relational databases powered by Prisma ORM. Ensures absolute ledger accuracy, zero double-spends, and perfect financial data integrity.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-gray-900 border border-gray-800 hover:border-[#1f8898]/50 transition-colors group">
                <ShieldCheck className="w-10 h-10 text-[#1f8898] mb-6 group-hover:scale-110 transition-transform" />
                <h4 className="text-xl font-bold text-white mb-3">AES-256 Encryption</h4>
                <p className="text-sm text-gray-400 leading-relaxed font-medium">
                  All sensitive tenant data and financial records are encrypted at rest and in transit. Bank-level security protocols protect your real estate portfolio.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* --- Expanded Corporate Footer --- */}
      <footer className="border-t border-gray-200 bg-[#ffffff] pt-16 pb-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <Building2 className="h-6 w-6 text-[#1f8898]" />
                <span className="text-xl font-black text-gray-900 tracking-tight">Mogi<span className="text-[#1f8898]">RentOS</span></span>
              </div>
              <p className="text-sm font-medium text-gray-500 leading-relaxed mb-6">
                The ultimate operating system for modern property managers and forward-thinking landlords in Africa and beyond.
              </p>
            </div>

            <div>
              <h4 className="font-black text-gray-900 mb-4 tracking-tight">Platform</h4>
              <ul className="space-y-3 text-sm font-medium text-gray-500">
                <li><Link href="/dashboard" className="hover:text-[#1f8898] transition-colors">Executive Dashboard</Link></li>
                <li><Link href="/portal" className="hover:text-[#1f8898] transition-colors">Tenant Portal</Link></li>
                <li>
                  <button onClick={() => openFeatureModal('m-pesa')} className="hover:text-[#1f8898] transition-colors text-left">
                    M-Pesa Integration
                  </button>
                </li>
                <li>
                  <button onClick={() => openFeatureModal('maintenance')} className="hover:text-[#1f8898] transition-colors text-left">
                    Maintenance Tracking
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-black text-gray-900 mb-4 tracking-tight">Company</h4>
              <ul className="space-y-3 text-sm font-medium text-gray-500">
                <li><a href="https://mogitechglobal.com/" target="_blank" rel="noopener noreferrer" className="hover:text-[#1f8898] transition-colors">About Mogitech Global</a></li>
                <li><a href="https://mogitechglobal.com/careers.php" target="_blank" rel="noopener noreferrer" className="hover:text-[#1f8898] transition-colors">Careers</a></li>
                <li><a href="https://mogitechglobal.com/contact.php" target="_blank" rel="noopener noreferrer" className="hover:text-[#1f8898] transition-colors">Contact Sales</a></li>
                <li><a href="https://mogitechglobal.com/contact.php" target="_blank" rel="noopener noreferrer" className="hover:text-[#1f8898] transition-colors">Partner Program</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-black text-gray-900 mb-4 tracking-tight">Legal</h4>
              <ul className="space-y-3 text-sm font-medium text-gray-500">
                <li><a href="https://mogitechglobal.com/privacy-policy.php" target="_blank" rel="noopener noreferrer" className="hover:text-[#1f8898] transition-colors">Privacy Policy</a></li>
                <li><a href="https://mogitechglobal.com/terms-of-service.php" target="_blank" rel="noopener noreferrer" className="hover:text-[#1f8898] transition-colors">Terms of Service</a></li>
                <li><a href="https://mogitechglobal.com/cookies.php" target="_blank" rel="noopener noreferrer" className="hover:text-[#1f8898] transition-colors">Data Processing</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs font-bold text-gray-400">
              &copy; {new Date().getFullYear()} Mogitech Global Ltd. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              All Systems Operational
            </div>
          </div>
        </div>
      </footer>

      {/* --- NEW: Feature Exploration Modal --- */}
      {selectedFeature && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedFeature(null)}
          />

          <div className="relative w-full max-w-2xl bg-[#ffffff] rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[#f8fafb] px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1f8898]/10 text-[#1f8898]">
                  <selectedFeature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-black text-gray-900">{selectedFeature.title}</h3>
              </div>
              <button
                onClick={() => setSelectedFeature(null)}
                className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8">
              <p className="text-lg text-gray-600 font-medium leading-relaxed mb-8">
                {selectedFeature.longDescription}
              </p>

              <div className="bg-[#ebf3f5]/50 rounded-2xl p-6 border border-[#1f8898]/10 mb-8">
                <h4 className="text-sm font-black text-[#1f8898] uppercase tracking-widest mb-4">Core Benefits</h4>
                <ul className="space-y-3">
                  {selectedFeature.benefits.map((benefit: string, i: number) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#1f8898] shrink-0 mt-0.5" />
                      <span className="font-bold text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-end gap-3">
                <Link
                  href="/login"
                  className="flex items-center gap-2 bg-[#1f8898] hover:bg-[#1a7684] text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-md active:scale-95"
                >
                  See it in Action <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}