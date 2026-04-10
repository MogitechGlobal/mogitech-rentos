// apps/web/app/page.tsx
/* eslint-disable */
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import _ from "lodash";
import {
  ArrowRight, Building2, ShieldCheck, BarChart3,
  Globe, Zap, Server, Menu, X, CheckCircle2, Database,
  Wrench, FileText, ChevronRight, PlayCircle, 
  LayoutDashboard, Users, CreditCard, PieChart, Activity,
  Lock, Smartphone, TrendingUp, Cloud, Ticket, BookOpen, MessageSquare,
  AlertCircle, Wallet, Receipt, Circle, Download, Home, Settings, HelpCircle, PhoneCall, FileSignature, User, Users2, Calendar, Clock,
} from "lucide-react";

// --- Data Configuration ---
const rawFeatures = [
  {
    title: "executive analytics & BI",
    description: "Real-time financial reporting, arrears tracking, and portfolio-wide occupancy metrics. Generate boardroom-ready PDF ledgers instantly.",
    longDescription: "Transform raw property data into actionable intelligence. Our analytics engine automatically categorizes income, flags serial late-payers, and projects your monthly cash flow.",
    benefits: ["Customizable PDF & Excel Exports", "Live Arrears & Defaulter Tracking", "Predictive Occupancy Forecasting"],
    icon: BarChart3,
    colSpan: "md:col-span-2 lg:col-span-2",
  },
  {
    title: "tenant portal & gate passes",
    description: "A complete self-service PWA for tenants to pay rent, sign documents, and generate secure visitor gate passes.",
    longDescription: "Empower your residents. Tenants can log in from any device to download receipts, report maintenance issues with photos, and generate one-time PINs for their guests.",
    benefits: ["Zero-Download PWA App", "Secure Visitor Management", "Self-Service Invoice History"],
    icon: Smartphone,
    colSpan: "md:col-span-1 lg:col-span-1",
  },
  {
    title: "zero-touch M-pesa billing",
    description: "Direct STK Pushes and Paybill reconciliation. Invoices clear automatically the second a tenant pays.",
    longDescription: "Eliminate manual data entry. When a tenant pays via STK push or your dedicated Paybill, the system instantly identifies the unit, clears the invoice, and issues a digital receipt.",
    benefits: ["1-Click Direct STK Push", "Zero-Touch Receipt Generation", "Automated Late Fee Application"],
    icon: Zap,
    colSpan: "md:col-span-1 lg:col-span-1",
  },
  {
    title: "automated maintenance",
    description: "Streamlined routing for tenant repair requests, vendor dispatch, and post-repair satisfaction ratings.",
    longDescription: "Protect your property value. Tenants submit tickets with photos, and MogiRentOS auto-routes them to the right vendors, tracking progress from pending to resolved.",
    benefits: ["Photo & Video Uploads", "Automated Vendor Dispatch", "Tenant Satisfaction Ratings"],
    icon: Wrench,
    colSpan: "md:col-span-1 lg:col-span-1",
  },
  {
    title: "legally binding e-signatures",
    description: "Draft custom clauses, execute leases, and store move-in condition reports without printing a single page.",
    longDescription: "Stop losing track of expiring leases. The system tracks every lease lifecycle, allows landlords to counter-sign digitally, and securely stores digital copies in a vault.",
    benefits: ["Dynamic Template Library", "Move-in Inspection Sign-offs", "Automated Expiration Alerts"],
    icon: FileSignature, 
    colSpan: "md:col-span-2 lg:col-span-1",
  },
  {
    title: "bank-grade security",
    description: "End-to-end encryption and localized data residency ensuring your financial ledgers remain strictly confidential.",
    longDescription: "Your portfolio's data integrity is our highest priority. MogiRentOS utilizes AES-256 encryption at rest, ensuring lease agreements and personal details are impenetrable.",
    benefits: ["AES-256 Encryption at Rest", "Role-Based Access Control", "Automated Daily Cloud Backups"],
    icon: ShieldCheck,
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
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const showcaseTabs = [
    { title: "Dashboard Overview", icon: LayoutDashboard, tag: "Analytics" },
    { title: "Tenant Lifecycle", icon: Users, tag: "Operations" },
    { title: "Auto-Reconciliation", icon: CreditCard, tag: "Payments" }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafb] font-sans selection:bg-[#1f8898]/30 overflow-x-hidden">

      {/* --- PREMIUM NAVIGATION --- */}
      <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-sm' : 'bg-transparent'}`}>
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1f8898] to-[#135a65] text-[#ffffff] shadow-lg shadow-[#1f8898]/20 group-hover:scale-105 transition-transform duration-300">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="text-2xl font-black tracking-tight text-gray-900">
              Mogi<span className="text-[#1f8898]">RentOS</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-600">
            <Link href="#showcase" className="hover:text-[#1f8898] transition-colors">Platform</Link>
            <Link href="/customers" className="hover:text-[#1f8898] transition-colors">Customers</Link>
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
              <Link href="#showcase" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black text-gray-900 flex items-center justify-between">Platform <ChevronRight className="text-gray-300 w-6 h-6" /></Link>
              <Link href="/customers" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black text-gray-900 flex items-center justify-between">Customers <ChevronRight className="text-gray-300 w-6 h-6" /></Link>
              <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black text-gray-900 flex items-center justify-between">Pricing <ChevronRight className="text-gray-300 w-6 h-6" /></Link>
              <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black text-gray-900 flex items-center justify-between">Company <ChevronRight className="text-gray-300 w-6 h-6" /></Link>
              <div className="h-px bg-gray-200 my-4"></div>
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-gray-600 text-center">Tenant Sign In</Link>
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="mt-2 flex h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#1f8898] to-[#135a65] text-base font-bold text-[#ffffff] shadow-xl">
                Access Manager Dashboard
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* --- ARCHITECTURAL HERO SECTION --- */}
        <section className="relative overflow-hidden bg-[#ffffff] pt-32 pb-24 md:pt-44 md:pb-40">
          
          {/* Architectural Blueprint & Skyline Background */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
             {/* Blueprint Grid */}
             <div className="absolute inset-0 opacity-[0.03] text-[#1f8898]">
               <svg className="w-full h-full" width="100%" height="100%">
                  <defs>
                     <pattern id="blueprint-grid" width="80" height="80" patternUnits="userSpaceOnUse">
                        <path d="M 80 0 L 0 0 0 80" fill="none" stroke="currentColor" strokeWidth="1" />
                        <path d="M 40 0 L 40 80 M 0 40 L 80 40" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
                     </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#blueprint-grid)" />
               </svg>
             </div>
             
             {/* Abstract City Skyline (Pure CSS) */}
             <div className="absolute bottom-0 left-0 w-full h-96 flex items-end justify-around opacity-[0.04] px-4 sm:px-20">
                <div className="w-24 h-48 border-t-4 border-l-4 border-r-4 border-[#1f8898] relative"><div className="absolute top-4 left-4 right-4 h-12 border-2 border-[#1f8898]"></div></div>
                <div className="w-32 h-80 border-t-4 border-l-4 border-r-4 border-[#1f8898] relative hidden md:block"><div className="absolute top-6 left-6 right-6 h-20 border-2 border-[#1f8898]"></div><div className="absolute top-32 left-6 right-6 h-20 border-2 border-[#1f8898]"></div></div>
                <div className="w-40 h-64 border-t-4 border-l-4 border-r-4 border-[#1f8898] relative"><div className="absolute top-8 left-8 right-8 bottom-0 border-t-2 border-l-2 border-r-2 border-[#1f8898]"></div></div>
                <div className="w-28 h-96 border-t-4 border-l-4 border-r-4 border-[#1f8898] relative hidden lg:block"><div className="absolute top-4 left-4 right-4 h-10 border-2 border-[#1f8898]"></div><div className="absolute top-20 left-4 right-4 h-10 border-2 border-[#1f8898]"></div><div className="absolute top-36 left-4 right-4 h-10 border-2 border-[#1f8898]"></div></div>
                <div className="w-32 h-56 border-t-4 border-l-4 border-r-4 border-[#1f8898] relative hidden sm:block"><div className="absolute top-0 w-full h-10 bg-[#1f8898]"></div></div>
             </div>
          </div>
          
          {/* Glowing Orbs */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-[600px] w-[600px] sm:h-[800px] sm:w-[800px] rounded-full bg-gradient-to-bl from-[#ebf3f5] via-[#1f8898]/10 to-transparent opacity-80 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-[400px] w-[400px] sm:h-[600px] sm:w-[600px] rounded-full bg-gradient-to-tr from-[#1f8898]/10 to-transparent opacity-60 blur-3xl pointer-events-none"></div>

          <div className="relative mx-auto max-w-7xl px-6 lg:px-8 text-center z-10 flex flex-col items-center">
            <div className="inline-flex items-center rounded-full border border-[#1f8898]/30 bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-[#1f8898] mb-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="flex h-2 w-2 rounded-full bg-[#1f8898] animate-pulse mr-2.5 shadow-[0_0_8px_#1f8898]"></span> The New Standard in PropTech
            </div>

            <h1 className="mx-auto max-w-5xl text-5xl font-black tracking-tighter text-gray-900 sm:text-7xl lg:text-[6.5rem] mb-8 leading-[1.05] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              Property Management, <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1f8898] to-[#0f4952]">Engineered for Scale.</span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg sm:text-xl font-medium text-gray-500 leading-relaxed mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              MogiRentOS empowers modern portfolios with zero-touch M-Pesa billing, seamless maintenance routing, and boardroom-ready financial intelligence.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300 w-full sm:w-auto">
              <Link
                href="/pricing"
                className="inline-flex h-14 w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-gray-900 hover:bg-[#1f8898] px-8 text-base font-bold text-[#ffffff] shadow-xl shadow-gray-900/20 transition-all hover:shadow-[#1f8898]/30 hover:-translate-y-1 active:scale-95"
              >
                View Pricing <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="#showcase"
                className="inline-flex h-14 w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-[#ffffff] px-8 text-base font-bold text-gray-700 transition-all hover:border-[#1f8898]/30 hover:bg-gray-50 active:scale-95 shadow-sm"
              >
                <PlayCircle className="w-5 h-5" /> Watch Product Tour
              </Link>
            </div>
          </div>

          {/* --- HIGH-FIDELITY HERO DASHBOARD MOCKUP --- */}
          <div className="relative mx-auto max-w-[1200px] mt-24 px-4 sm:px-6 z-20 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
             <div className="rounded-[2.5rem] bg-gray-900/5 p-2 sm:p-4 border border-gray-200/50 shadow-2xl backdrop-blur-xl">
                <div className="rounded-[2rem] bg-[#f0f4f8] border border-gray-200 shadow-lg overflow-hidden flex flex-col h-[650px] relative">
                    
                    {/* Safari/Chrome Mac Header */}
                    <div className="h-12 bg-gray-100 border-b border-gray-200 flex items-center px-4 gap-4 shrink-0">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                            <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                        </div>
                        <div className="mx-auto bg-white border border-gray-200 rounded-md h-7 w-1/2 max-w-sm flex items-center justify-center text-[11px] text-gray-500 font-medium font-mono">
                            <Lock className="w-3 h-3 mr-2" /> rentos.mogitechglobal.com
                        </div>
                    </div>

                    {/* Exact MogiRentOS UI Replication */}
                    <div className="flex flex-1 overflow-hidden font-sans">
                        
                        {/* Sidebar */}
                        <aside className="w-64 bg-[#113a3f] text-white flex flex-col shrink-0 hidden md:flex">
                            <div className="p-6">
                                <h1 className="text-xl font-black tracking-tight mb-8">MogiRentOS</h1>
                                
                                {/* Profile Badge */}
                                <div className="bg-white/10 p-3 rounded-xl flex items-center gap-3 border border-white/5 mb-8">
                                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center"><Building2 className="w-5 h-5"/></div>
                                    <div>
                                        <p className="font-bold text-sm leading-tight">Tech Global Ltd</p>
                                        <span className="text-[9px] font-black uppercase tracking-wider bg-amber-500 text-amber-950 px-1.5 py-0.5 rounded mt-1 inline-block">Pro Plan</span>
                                    </div>
                                </div>

                                {/* Menu Items */}
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3 pl-2">Main</p>
                                    <div className="bg-[#1f8898] text-white flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm shadow-md"><LayoutDashboard className="w-4 h-4" /> Dashboard</div>
                                    <div className="text-white/70 flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm"><Building2 className="w-4 h-4" /> Properties</div>
                                    <div className="text-white/70 flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm"><Home className="w-4 h-4" /> Units</div>
                                    <div className="text-white/70 flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm"><Users className="w-4 h-4" /> Tenants</div>
                                    <div className="text-white/70 flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm"><FileText className="w-4 h-4" /> Leases</div>
                                    <div className="text-white/70 flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm"><Receipt className="w-4 h-4" /> Invoices</div>
                                    <div className="text-white/70 flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm"><CreditCard className="w-4 h-4" /> Payments</div>
                                    <div className="text-white/70 flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm"><MessageSquare className="w-4 h-4" /> Communications</div>
                                    <div className="text-white/70 flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm"><Zap className="w-4 h-4" /> Utility Billing</div>
                                </div>
                            </div>
                            <div className="mt-auto p-6 space-y-1.5">
                                <div className="text-white/70 flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm"><Settings className="w-4 h-4" /> Settings</div>
                                <div className="text-white/70 flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm mb-4"><HelpCircle className="w-4 h-4" /> Help Center</div>
                                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                                    <div className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center border-2 border-white/20 shadow-sm shrink-0"><Building2 className="w-4 h-4 text-white"/></div>
                                    <div className="overflow-hidden">
                                        <p className="text-xs font-bold text-white truncate">Tech Plaza</p>
                                        <p className="text-[10px] text-white/50 truncate">techglobal@gmail.com</p>
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Main Dashboard Area */}
                        <main className="flex-1 overflow-hidden flex flex-col relative">
                            {/* Abstract gradient background from original image */}
                            <div className="absolute top-0 w-full h-64 bg-gradient-to-b from-[#156e7b] to-transparent pointer-events-none"></div>
                            
                            <div className="relative z-10 p-8 flex flex-col h-full gap-6 overflow-y-auto custom-scrollbar">
                                
                                {/* Header */}
                                <div className="flex justify-between items-end shrink-0">
                                    <div>
                                        <h2 className="text-3xl font-black text-white tracking-tight mb-1">Good evening, Tech.</h2>
                                        <p className="text-sm font-medium text-teal-50">Here is the real-time financial and operational status of your property portfolio.</p>
                                    </div>
                                    <button className="hidden sm:flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-2.5 rounded-xl font-bold text-sm backdrop-blur-sm transition-colors">
                                        <Download className="w-4 h-4" /> Export Report
                                    </button>
                                </div>

                                {/* KPI Top Row */}
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 shrink-0">
                                    {/* Outstanding Arrears */}
                                    <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-sm col-span-2 md:col-span-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center"><AlertCircle className="w-4 h-4"/></div>
                                            <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Outstanding<br/>Arrears</span>
                                        </div>
                                        <p className="text-sm font-bold text-gray-400 mb-0.5">KSH <span className="text-2xl font-black text-rose-600 tracking-tight">355,450</span></p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Unpaid Balance</p>
                                    </div>
                                    
                                    {/* Total Collected */}
                                    <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm col-span-2 md:col-span-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center"><Wallet className="w-4 h-4"/></div>
                                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Total<br/>Collected</span>
                                        </div>
                                        <p className="text-sm font-bold text-gray-400 mb-0.5">KSH <span className="text-2xl font-black text-gray-900 tracking-tight">157,225</span></p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                            <span className="text-rose-500 bg-rose-50 px-1 py-0.5 rounded flex items-center"><TrendingUp className="w-3 h-3 mr-0.5 rotate-180"/>61%</span> MTD Velocity
                                        </p>
                                    </div>

                                    {/* Lifetime Billed */}
                                    <div className="bg-white rounded-2xl p-5 border border-blue-100 shadow-sm col-span-2 md:col-span-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center"><Receipt className="w-4 h-4"/></div>
                                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Lifetime<br/>Billed</span>
                                        </div>
                                        <p className="text-sm font-bold text-gray-400 mb-0.5">KSH <span className="text-2xl font-black text-gray-900 tracking-tight">512,675</span></p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1"><Clock className="w-3 h-3" /> 20 Invoices</p>
                                    </div>

                                    {/* Collection Health */}
                                    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between hidden sm:flex">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center"><Activity className="w-4 h-4"/></div>
                                            <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Collection<br/>Health</span>
                                        </div>
                                        <div className="flex items-end gap-2 mb-2">
                                            <span className="text-2xl font-black text-gray-900 tracking-tight leading-none">31%</span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Clearance</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                                            <div className="bg-rose-500 h-2.5 rounded-full w-[31%]"></div>
                                        </div>
                                    </div>

                                    {/* Occupancy */}
                                    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex items-center justify-between hidden lg:flex">
                                        <div>
                                            <span className="text-[10px] font-black text-[#1f8898] uppercase tracking-widest block mb-2">Occupancy</span>
                                            <span className="text-2xl font-black text-gray-900 tracking-tight leading-none block mb-1">91%</span>
                                            <span className="text-[10px] font-bold text-gray-400">10 / 11 Units</span>
                                        </div>
                                        {/* Mock Circle Chart */}
                                        <div className="w-14 h-14 rounded-full border-[6px] border-gray-100 border-t-[#1f8898] border-r-[#1f8898] border-l-[#1f8898] flex items-center justify-center -rotate-45">
                                            <div className="w-8 h-8 bg-white rounded-full rotate-45"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Three Panels */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                                    
                                    {/* Defaulters Panel */}
                                    <div className="bg-white rounded-[1.5rem] border border-rose-100 shadow-sm flex flex-col overflow-hidden">
                                        <div className="p-5 border-b border-rose-50 flex justify-between items-center bg-rose-50/30">
                                            <div className="flex items-center gap-2">
                                                <AlertCircle className="w-5 h-5 text-rose-500" />
                                                <div>
                                                    <h3 className="font-black text-gray-900 leading-tight">Top Defaulters</h3>
                                                    <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">Highest Balances</p>
                                                </div>
                                            </div>
                                            <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-2 py-1 rounded-md">4 Found</span>
                                        </div>
                                        <div className="p-3 overflow-y-auto space-y-2">
                                            {[
                                                { name: 'Mogi Jac', phone: '07453667643', amount: '70,000', init: 'MJ' },
                                                { name: 'David Mongeri', phone: '078962725...', amount: '45,000', init: 'DM' },
                                                { name: 'Lilian Angela', phone: '0736363632...', amount: '45,000', init: 'LA' },
                                                { name: 'Mogitech Glo...', phone: '076856965...', amount: '45,000', init: 'MG' },
                                            ].map((d, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 font-black flex items-center justify-center text-sm">{d.init}</div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 text-sm leading-tight">{d.name}</p>
                                                            <p className="text-[10px] text-gray-500 font-medium">{d.phone}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-black text-rose-600 text-sm leading-tight">KSH {d.amount}</p>
                                                        <p className="text-[9px] font-bold text-[#1f8898] uppercase tracking-widest flex items-center justify-end gap-1 mt-0.5"><PhoneCall className="w-2.5 h-2.5"/> Remind</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Renewals Panel */}
                                    <div className="bg-white rounded-[1.5rem] border border-amber-100 shadow-sm flex flex-col overflow-hidden hidden md:flex">
                                        <div className="p-5 border-b border-amber-50 flex justify-between items-center bg-amber-50/30">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-5 h-5 text-amber-500" />
                                                <div>
                                                    <h3 className="font-black text-gray-900 leading-tight">Renewals</h3>
                                                    <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Expiring &lt; 60 Days</p>
                                                </div>
                                            </div>
                                            <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-1 rounded-md">4 Soon</span>
                                        </div>
                                        <div className="p-3 overflow-y-auto space-y-2">
                                            {[
                                                { name: 'Naom Nyamo...', end: 'MAY 31', days: '54 DAYS', init: 'NN' },
                                                { name: 'Lilian Angela', end: 'MAY 31', days: '54 DAYS', init: 'LA' },
                                                { name: 'Dominic Gich...', end: 'MAY 31', days: '54 DAYS', init: 'DG' },
                                                { name: 'Mog Glo', end: 'MAY 31', days: '54 DAYS', init: 'MG' },
                                            ].map((r, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 font-black flex items-center justify-center text-sm">{r.init}</div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 text-sm leading-tight">{r.name}</p>
                                                            <p className="text-[10px] text-gray-500 font-bold uppercase">Ends: {r.end}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex flex-col items-end">
                                                        <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest mb-1">{r.days}</span>
                                                        <p className="text-[9px] font-bold text-[#1f8898] uppercase tracking-widest">View Lease</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Pending Fixes Panel */}
                                    <div className="bg-white rounded-[1.5rem] border border-blue-100 shadow-sm flex flex-col overflow-hidden hidden lg:flex">
                                        <div className="p-5 border-b border-blue-50 flex justify-between items-center bg-blue-50/30">
                                            <div className="flex items-center gap-2">
                                                <Wrench className="w-5 h-5 text-blue-500" />
                                                <div>
                                                    <h3 className="font-black text-gray-900 leading-tight">Pending Fixes</h3>
                                                    <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">Unresolved Tickets</p>
                                                </div>
                                            </div>
                                            <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-1 rounded-md">4 Open</span>
                                        </div>
                                        <div className="p-3 overflow-y-auto space-y-2">
                                            {[
                                                { cat: 'GENERAL', loc: 'Tech Plaza, TPG001', tag: 'EMERGENCY', color: 'rose' },
                                                { cat: 'ELECTRICAL', loc: 'Tech Plaza, TPG001', tag: 'EMERGENCY', color: 'rose' },
                                                { cat: 'GENERAL', loc: 'Tech Plaza, TPG001', tag: 'HIGH', color: 'amber' },
                                                { cat: 'APPLIANCE', loc: 'Tech Plaza, TPG001', tag: 'HIGH', color: 'amber' },
                                            ].map((f, i) => (
                                                <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-2 h-2 rounded-full bg-${f.color}-500`}></div>
                                                        <div>
                                                            <p className="font-black text-gray-900 text-xs tracking-widest uppercase leading-tight">{f.cat}</p>
                                                            <p className="text-[10px] text-gray-500 font-medium">{f.loc}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`bg-${f.color}-50 text-${f.color}-600 border border-${f.color}-100 text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest`}>{f.tag}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </main>
                    </div>
                </div>
             </div>
          </div>
        </section>

        {/* --- INTERACTIVE PRODUCT SHOWCASE --- */}
        <section id="showcase" className="py-24 md:py-32 bg-[#f8fafb]">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <h2 className="text-xs font-black text-[#1f8898] uppercase tracking-widest mb-4 inline-block bg-[#1f8898]/10 px-4 py-1.5 rounded-full">The Platform Tour</h2>
                    <h3 className="text-3xl font-black text-gray-900 sm:text-6xl tracking-tight mb-6">Designed for modern management.</h3>
                    <p className="text-lg text-gray-500 font-medium leading-relaxed">Experience a unified operating system that replaces scattered spreadsheets and manual processes with automated data pipelines.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 items-center">
                    
                    {/* Navigation Tabs */}
                    <div className="w-full lg:w-1/3 flex flex-col gap-3">
                        {showcaseTabs.map((tab, idx) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === idx;
                            return (
                                <button 
                                    key={idx}
                                    onClick={() => setActiveTab(idx)}
                                    className={`p-6 rounded-[2rem] text-left transition-all border duration-500 ${
                                        isActive 
                                        ? 'bg-white border-[#1f8898]/30 shadow-2xl shadow-[#1f8898]/10 translate-x-0 lg:translate-x-6' 
                                        : 'bg-transparent border-transparent hover:bg-white hover:border-gray-200'
                                    }`}
                                >
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className={`p-3 rounded-xl transition-colors ${isActive ? 'bg-[#1f8898] text-white' : 'bg-gray-100 text-gray-400'}`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className={`text-lg font-black transition-colors ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>{tab.title}</h4>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[#1f8898]">{tab.tag}</span>
                                        </div>
                                    </div>
                                    {isActive && (
                                        <p className="text-sm font-medium text-gray-500 mt-4 leading-relaxed animate-in fade-in slide-in-from-top-2">
                                            {idx === 0 && "Consolidate portfolio performance into a single source of truth. Monitor cash flow, arrears, and occupancy across multiple buildings in real-time."}
                                            {idx === 1 && "Digitize the entire tenant journey. From digital lease execution and move-in inspections to automated renewal notices and gate-pass generation."}
                                            {idx === 2 && "Connect your Paybill and let the system do the work. Automated STK pushes, instant ledger clearing, and zero-touch digital receipts."}
                                        </p>
                                    )}
                                </button>
                            )
                        })}
                    </div>

                    {/* Interactive Visual Window */}
                    <div className="w-full lg:w-2/3 h-[450px] sm:h-[550px] bg-white rounded-[3.5rem] border border-gray-200 shadow-2xl overflow-hidden relative p-10 group">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#1f8898]/10 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
                        
                        {activeTab === 0 && (
                            <div className="h-full flex flex-col justify-between animate-in fade-in zoom-in-95 duration-500">
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h4 className="text-2xl font-black text-gray-900">Portfolio Performance</h4>
                                        <p className="text-sm font-bold text-[#1f8898]">Active MRR: KSH 2,450,000</p>
                                    </div>
                                    <PieChart className="w-10 h-10 text-[#1f8898]" />
                                </div>
                                <div className="flex-1 flex items-end gap-4 pb-10">
                                    {[30, 45, 40, 65, 80, 95, 85, 100].map((h, i) => (
                                        <div key={i} className="flex-1 bg-[#ebf3f5] rounded-t-2xl relative h-full flex items-end">
                                            <div className="w-full bg-[#1f8898] rounded-t-2xl transition-all duration-1000 ease-out shadow-lg" style={{ height: `${h}%` }}></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 1 && (
                            <div className="h-full flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-500">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-2xl font-black text-gray-900">Tenant Intelligence</h4>
                                    <Users className="w-8 h-8 text-[#1f8898]" />
                                </div>
                                {/* Updated with real names from mockup */}
                                {[
                                    {name: "Mogi Jac", unit: "TPG001"},
                                    {name: "David Mongeri", unit: "TPG002"},
                                    {name: "Lilian Angela", unit: "TPG003"},
                                    {name: "Naom Nyamoita", unit: "TPG004"}
                                ].map((t, i) => (
                                    <div key={i} className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex justify-between items-center hover:bg-white hover:shadow-lg transition-all duration-300 cursor-default">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black">{t.name.charAt(0)}</div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Unit {t.unit} • Lease Active</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase rounded-lg border border-emerald-100 hidden sm:inline-block">E-Signed</span>
                                            <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[9px] font-black uppercase rounded-lg border border-blue-100">Gate Pass</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 2 && (
                            <div className="h-full flex flex-col justify-center items-center animate-in fade-in zoom-in-95 duration-500">
                                <div className="bg-white border border-emerald-100 shadow-2xl shadow-emerald-900/5 p-10 rounded-[2.5rem] max-w-sm w-full text-center relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500"></div>
                                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                                    </div>
                                    <h4 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">STK Push Successful</h4>
                                    <p className="text-gray-500 font-medium mb-8 text-sm">Tenant Faith Wanjiku has authorized payment. Ledger cleared instantly.</p>
                                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex justify-between items-center">
                                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Amount</span>
                                        <span className="text-2xl font-black text-emerald-600">KSH 18,500</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </section>

        {/* --- FLOATING PERFORMANCE STATS --- */}
        <section className="relative z-20 -mt-16 mb-20 px-6">
          <div className="mx-auto max-w-5xl bg-white/90 backdrop-blur-2xl border border-white rounded-[3rem] shadow-2xl shadow-black/5 p-10 sm:p-14">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 divide-y md:divide-y-0 md:divide-x divide-gray-100 text-center">
              {stats.map((stat, idx) => (
                <div key={idx} className="pt-8 md:pt-0 flex flex-col items-center justify-center first:pt-0">
                  <p className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-[#1f8898] tracking-tighter mb-3">{stat.value}</p>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- CORE CAPABILITIES BENTO --- */}
        <section id="features" className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
          <div className="mb-20 md:text-center max-w-3xl md:mx-auto">
            <h2 className="text-xs font-black text-[#1f8898] uppercase tracking-widest mb-4 inline-block bg-[#1f8898]/10 px-4 py-1.5 rounded-full">Module Deep Dive</h2>
            <h3 className="text-3xl font-black text-gray-900 sm:text-5xl tracking-tight mb-6">Unrivaled Power & Precision.</h3>
            <p className="text-lg text-gray-500 font-medium leading-relaxed">Every tool within MogiRentOS is designed to reduce administrative overhead and eliminate the risk of human error.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[minmax(320px,auto)]">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedFeature(feature)}
                  className={`cursor-pointer group rounded-[2.5rem] bg-white border border-gray-100 p-8 sm:p-10 flex flex-col relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-[#1f8898]/10 hover:border-[#1f8898]/30 hover:-translate-y-1.5 ${feature.colSpan}`}
                >
                  <div className="absolute -top-6 -right-6 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity transform group-hover:scale-110 group-hover:-rotate-12 duration-700 pointer-events-none">
                    <Icon className="w-56 h-56 text-[#1f8898]" />
                  </div>

                  <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f8fafb] border border-gray-100 text-[#1f8898] group-hover:bg-[#1f8898] group-hover:text-[#ffffff] transition-all duration-500 relative z-10 shadow-sm group-hover:shadow-lg">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="font-black text-2xl mb-4 text-gray-900 relative z-10 tracking-tight">{feature.title}</h3>
                  <p className="text-base font-medium text-gray-500 leading-relaxed flex-1 relative z-10 max-w-lg group-hover:text-gray-600">
                    {feature.description}
                  </p>

                  <div className="mt-8 flex items-center gap-2 text-sm font-bold text-[#1f8898] opacity-0 group-hover:opacity-100 transition-all transform -translate-x-4 group-hover:translate-x-0 duration-300 relative z-10 uppercase tracking-widest">
                    Explore <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* --- INFRASTRUCTURE SECTION --- */}
        <section id="infrastructure" className="relative overflow-hidden bg-gray-950 py-24 sm:py-32 m-4 sm:m-8 rounded-[3.5rem]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#1f8898]/30 via-transparent to-transparent opacity-60"></div>

          <div className="relative mx-auto max-w-7xl px-6 lg:px-12 z-10">
            <div className="md:w-2/3 mb-20">
              <h2 className="text-xs font-black text-[#1f8898] uppercase tracking-widest mb-4 inline-block bg-[#1f8898]/20 px-4 py-1.5 rounded-full border border-[#1f8898]/30">System Integrity</h2>
              <h3 className="text-4xl font-black text-white sm:text-7xl tracking-tight mb-6 leading-[1.1]">Cloud Infrastructure. <br /> Local Reliability.</h3>
              <p className="text-lg text-gray-400 font-medium leading-relaxed max-w-xl">
                Deployed on distributed edge networks ensuring 99.99% uptime, localized Kenyan data residency, and bank-grade data encryption.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div className="p-10 rounded-[2.5rem] bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-[#1f8898]/50 hover:bg-gray-900 transition-all duration-500 group">
                <Server className="w-12 h-12 text-[#1f8898] mb-8 transition-transform duration-500 group-hover:scale-110" />
                <h4 className="text-2xl font-bold text-white mb-4 tracking-tight">Edge Networking</h4>
                <p className="text-base text-gray-400 leading-relaxed font-medium">
                  Sub-millisecond API response times powered by global edge workers. Zero latency tenant interactions.
                </p>
              </div>

              <div className="p-10 rounded-[2.5rem] bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-[#1f8898]/50 hover:bg-gray-900 transition-all duration-500 group">
                <Database className="w-12 h-12 text-[#1f8898] mb-8 transition-transform duration-500 group-hover:scale-110" />
                <h4 className="text-2xl font-bold text-white mb-4 tracking-tight">ACID Compliance</h4>
                <p className="text-base text-gray-400 leading-relaxed font-medium">
                  Relational data architecture ensuring absolute ledger accuracy and perfect financial history records.
                </p>
              </div>

              <div className="p-10 rounded-[2.5rem] bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-[#1f8898]/50 hover:bg-gray-900 transition-all duration-500 group">
                <ShieldCheck className="w-12 h-12 text-[#1f8898] mb-8 transition-transform duration-500 group-hover:scale-110" />
                <h4 className="text-2xl font-bold text-white mb-4 tracking-tight">Bank-Level Crypto</h4>
                <p className="text-base text-gray-400 leading-relaxed font-medium">
                  AES-256 data encryption at rest and TLS 1.3 in transit. Your portfolio data is strictly impenetrable.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- FINAL CTA SECTION --- */}
        <section className="py-24 relative overflow-hidden bg-white">
            <div className="mx-auto max-w-5xl px-6 text-center">
                <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight mb-8">Ready to scale your portfolio?</h2>
                <p className="text-xl text-gray-500 font-medium mb-12 max-w-2xl mx-auto">Join the next generation of property managers automating their operations and maximizing revenue with MogiRentOS.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                      href="/pricing"
                      className="inline-flex h-16 items-center justify-center gap-3 rounded-2xl bg-[#1f8898] px-12 text-lg font-black text-[#ffffff] shadow-2xl shadow-[#1f8898]/30 transition-all hover:bg-[#1a7684] hover:-translate-y-1 active:scale-95"
                  >
                      View Pricing Plans <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                      href="/contact"
                      className="inline-flex h-16 items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white px-12 text-lg font-black text-gray-700 transition-all hover:border-[#1f8898]/30 hover:bg-gray-50 active:scale-95"
                  >
                      <MessageSquare className="w-5 h-5" /> Contact Sales
                  </Link>
                </div>
            </div>
        </section>

      </main>

      {/* --- PREMIUM FOOTER --- */}
      <footer className="border-t border-gray-200 bg-[#f8fafb] pt-24 pb-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-16 mb-20">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-8">
                <Building2 className="h-8 w-8 text-[#1f8898]" />
                <span className="text-3xl font-black text-gray-900 tracking-tight">Mogi<span className="text-[#1f8898]">RentOS</span></span>
              </div>
              <p className="text-base font-medium text-gray-500 leading-relaxed mb-8 max-w-sm">
                The high-performance operating system for forward-thinking property managers across the African continent.
              </p>
              <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#1f8898] transition-colors cursor-pointer shadow-sm"><Globe className="w-5 h-5"/></div>
                  <Link href="/customers" className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#1f8898] transition-colors cursor-pointer shadow-sm"><Users className="w-5 h-5"/></Link>
              </div>
            </div>

            <div>
              <h4 className="font-black text-gray-900 mb-8 tracking-tight uppercase text-xs">Platform</h4>
              <ul className="space-y-4 text-sm font-bold text-gray-500">
                <li><Link href="/dashboard" className="hover:text-[#1f8898]">Executive Dashboard</Link></li>
                <li><Link href="/portal" className="hover:text-[#1f8898]">Tenant Portal (PWA)</Link></li>
                <li><Link href="/pricing" className="hover:text-[#1f8898]">Pricing Plans</Link></li>
                <li><Link href="#features" className="hover:text-[#1f8898]">Feature Tour</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-black text-gray-900 mb-8 tracking-tight uppercase text-xs">Company</h4>
              <ul className="space-y-4 text-sm font-bold text-gray-500">
                <li><Link href="/about" className="hover:text-[#1f8898]">About Mogitech</Link></li>
                <li><Link href="/customers" className="hover:text-[#1f8898]">Our Customers</Link></li>
                <li><a href="https://mogitechglobal.com/careers.php" target="_blank" rel="noopener noreferrer" className="hover:text-[#1f8898]">Career Hub</a></li>
                <li><Link href="/contact" className="hover:text-[#1f8898]">Contact Sales</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-black text-gray-900 mb-8 tracking-tight uppercase text-xs">Resources</h4>
              <ul className="space-y-4 text-sm font-bold text-gray-500">
                <li><Link href="/blog" className="hover:text-[#1f8898]">PropTech Blog</Link></li>
                <li><Link href="/faq" className="hover:text-[#1f8898]">Help & FAQ</Link></li>
                <li><a href="https://mogitechglobal.com/privacy-policy.php" target="_blank" rel="noopener noreferrer" className="hover:text-[#1f8898]">Privacy Policy</a></li>
                <li><a href="https://mogitechglobal.com/terms-of-service.php" target="_blank" rel="noopener noreferrer" className="hover:text-[#1f8898]">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-sm font-bold text-gray-400">
              &copy; {new Date().getFullYear()} Mogitech Global Ltd. Engineering Excellence.
            </p>
            <div className="flex items-center gap-3 text-xs font-black text-gray-500 bg-white px-5 py-2.5 rounded-full border border-gray-100 shadow-sm">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              All Systems Operational
            </div>
          </div>
        </div>
      </footer>

      {/* --- FEATURE EXPLORATION MODAL --- */}
      {selectedFeature && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-gray-950/60 backdrop-blur-md transition-opacity"
            onClick={() => setSelectedFeature(null)}
          />

          <div className="relative w-full max-w-2xl bg-[#ffffff] rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-[#f8fafb] px-10 py-10 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-6 pr-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#ebf3f5] text-[#1f8898] border border-[#1f8898]/10">
                  <selectedFeature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">{selectedFeature.title}</h3>
              </div>
              <button
                onClick={() => setSelectedFeature(null)}
                className="p-3 text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-10">
              <p className="text-lg sm:text-xl text-gray-600 font-medium leading-relaxed mb-10">
                {selectedFeature.longDescription}
              </p>

              <div className="bg-[#ebf3f5]/50 rounded-[2rem] p-8 border border-[#1f8898]/10 mb-10 shadow-inner">
                <h4 className="text-xs font-black text-[#1f8898] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Zap className="w-4 h-4"/> Core Benefits
                </h4>
                <ul className="space-y-4">
                  {selectedFeature.benefits.map((benefit: string, i: number) => (
                    <li key={i} className="flex items-start gap-4">
                      <CheckCircle2 className="w-6 h-6 text-[#1f8898] shrink-0 mt-0.5" />
                      <span className="font-bold text-gray-800 text-base">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button onClick={() => setSelectedFeature(null)} className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors uppercase tracking-widest text-xs">Close</button>
                <Link
                  href="/pricing"
                  className="flex w-full sm:w-auto justify-center items-center gap-3 bg-gray-900 hover:bg-[#1f8898] text-white px-10 py-4 rounded-2xl font-black transition-all shadow-xl uppercase tracking-widest text-xs active:scale-95"
                >
                  Start Demo <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}