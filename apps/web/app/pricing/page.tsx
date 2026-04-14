// apps/web/app/pricing/page.tsx
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight, Building2, CheckCircle2, Menu, X,
  HelpCircle, ChevronDown, ChevronUp, Zap, Crown
} from "lucide-react";
import Footer from "@/components/Footer";

// --- 5-Tier Pricing Data ---
const pricingTiers = [
  {
    name: "Starter",
    price: "1,500",
    description: "Perfect for individuals managing a single building.",
    buttonText: "Start 30-Day Free Trial",
    buttonLink: "/login?plan=starter",
    isPopular: false,
    limit: "1 Property & 30 Units",
    features: [
      "Automated Rent Invoicing",
      "Full Arrears Tracking",
      "Maintenance Dispatch Hub",
      "Priority 24/7 Tech Support",
      "Tenant Portal Access"
    ]
  },
  {
    name: "Basic",
    price: "2,500",
    description: "The essential tools for growing property portfolios.",
    buttonText: "Get Started",
    buttonLink: "/login?plan=basic",
    isPopular: false,
    limit: "Up to 3 Properties & 50 Units",
    features: [
      "Automated Rent Invoicing",
      "Full Arrears Tracking",
      "Maintenance Dispatch Hub",
      "Priority 24/7 Tech Support",
      "Tenant Portal Access"
    ]
  },
  {
    name: "Standard",
    price: "4,500",
    description: "Designed for mid-sized management agencies.",
    buttonText: "Get Started",
    buttonLink: "/login?plan=standard",
    isPopular: true,
    limit: "Up to 5 Properties & 100 Units",
    features: [
      "Automated Rent Invoicing",
      "Full Arrears Tracking",
      "Maintenance Dispatch Hub",
      "Priority 24/7 Tech Support",
      "Tenant Portal Access"
    ]
  },
  {
    name: "Professional",
    price: "6,500",
    description: "The complete operating system for serious managers.",
    buttonText: "Get Started",
    buttonLink: "/login?plan=pro",
    isPopular: false,
    limit: "Unlimited Properties & Units",
    features: [
      "Automated Rent Invoicing",
      "Full Arrears Tracking",
      "Maintenance Dispatch Hub",
      "Priority 24/7 Tech Support",
      "Tenant Portal Access"
    ]
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Dedicated infrastructure and custom API integrations.",
    buttonText: "Contact Sales",
    buttonLink: "/contact",
    isPopular: false,
    limit: "Unlimited Properties & Units",
    features: [
      "Custom ERP/Accounting integrations",
      "White-labeled tenant portal",
      "Dedicated Account Manager",
      "Custom contract drafting",
      "SLA guarantee (99.99%)"
    ]
  }
];

// --- Updated FAQ Data ---
const faqs = [
  {
    question: "Do you charge per unit or a flat monthly fee?",
    answer: "We use volume-based pricing. Every plan includes full access to all premium features (like maintenance ticketing and M-Pesa syncing). You simply choose the flat-fee tier that matches your current portfolio size, up to Unlimited on our Professional plan."
  },
  {
    question: "How does the 30-Day Free Trial work?",
    answer: "When you create a new account, you are automatically enrolled in the Starter plan trial. For 30 days, you have complete, unrestricted access to the entire platform. No credit card is required to sign up."
  },
  {
    question: "How does the M-Pesa Paybill integration work?",
    answer: "Available on all plans, we link your existing Safaricom Paybill or Till number directly to MogiRentOS via API. When a tenant pays, the system instantly matches their account, updates their ledger, and sends them a digital receipt—zero manual data entry required."
  },
  {
    question: "Can I upgrade or downgrade my plan later?",
    answer: "Absolutely. You can change your subscription tier at any time from your Executive Dashboard as your portfolio grows. Changes take effect immediately."
  },
  {
    question: "Is my data secure?",
    answer: "Yes. We use bank-grade AES-256 encryption to protect your financial ledgers and tenant data. Our infrastructure is hosted on secure, compliant edge networks with daily automated backups."
  }
];

export default function PricingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafb] font-sans selection:bg-[#1f8898]/30">

      {/* --- PREMIUM NAVIGATION --- */}
      <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-sm' : 'bg-transparent'}`}>
        <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
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
            <Link href="/#features" className="hover:text-[#1f8898] transition-colors">Platform</Link>
            <Link href="/pricing" className="text-[#1f8898] transition-colors">Pricing</Link>
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
              <Link href="/#features" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black text-gray-900 hover:text-[#1f8898]">Platform</Link>
              <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black text-[#1f8898]">Pricing</Link>
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

      <main className="flex-1 pt-32 pb-24">
        {/* --- PRICING HERO --- */}
        <section className="relative px-6 lg:px-8 text-center max-w-4xl mx-auto mb-16 md:mb-24">
          <div className="absolute top-0 right-10 -mr-20 -mt-20 h-[400px] w-[400px] rounded-full bg-[#1f8898]/5 blur-3xl pointer-events-none"></div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900 mb-6 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Scale without limits.
          </h1>
          <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 max-w-2xl mx-auto">
            Every plan includes our complete suite of automated property management tools. Simply choose the tier that matches your portfolio size.
          </p>
        </section>

        {/* --- 5-TIER PRICING CARDS --- */}
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-32 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 items-stretch">
            {pricingTiers.map((tier, idx) => (
              <div
                key={idx}
                className={`relative flex flex-col p-6 xl:p-8 rounded-[2rem] transition-all duration-500 animate-in fade-in slide-in-from-bottom-8 ${tier.isPopular
                    ? 'bg-gray-900 text-white shadow-2xl shadow-gray-900/20 xl:-translate-y-4 z-10 border border-gray-800'
                    : 'bg-white text-gray-900 shadow-xl shadow-black/5 border border-gray-100 hover:border-[#1f8898]/30 hover:shadow-2xl hover:shadow-[#1f8898]/10'
                  }`}
                style={{ animationDelay: `${(idx + 1) * 100}ms` }}
              >
                {tier.isPopular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-amber-500/30 flex items-center gap-1">
                      <Crown className="w-3 h-3" /> Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6 border-b pb-6 border-gray-100/10">
                  <h3 className={`text-xl font-black mb-2 ${tier.isPopular ? 'text-white' : 'text-gray-900'}`}>{tier.name}</h3>
                  <div className="flex items-baseline gap-1.5 mb-3">
                    {tier.price === 'Custom' ? (
                      <span className={`text-4xl font-black tracking-tight ${tier.isPopular ? 'text-white' : 'text-gray-900'}`}>
                        Custom
                      </span>
                    ) : (
                      <>
                        <span className={`text-xl font-bold ${tier.isPopular ? 'text-gray-400' : 'text-gray-400'}`}>Ksh</span>
                        <span className={`text-4xl font-black tracking-tight ${tier.isPopular ? 'text-white' : 'text-gray-900'}`}>{tier.price}</span>
                        <span className={`text-xs font-bold ${tier.isPopular ? 'text-gray-400' : 'text-gray-500'}`}>/mo</span>
                      </>
                    )}
                  </div>
                  <p className={`text-xs font-medium leading-relaxed min-h-[3rem] ${tier.isPopular ? 'text-gray-400' : 'text-gray-500'}`}>
                    {tier.description}
                  </p>
                </div>

                <div className="flex-1 mb-8">
                  {/* Volume Limit Highlight */}
                  <div className={`flex items-start gap-3 mb-6 p-3 rounded-xl border ${tier.isPopular ? 'bg-gray-800 border-gray-700' : 'bg-[#ebf3f5] border-[#1f8898]/10'}`}>
                      <Building2 className={`w-5 h-5 shrink-0 mt-0.5 ${tier.isPopular ? 'text-amber-400' : 'text-[#1f8898]'}`} />
                      <span className={`text-sm font-black ${tier.isPopular ? 'text-white' : 'text-gray-900'}`}>{tier.limit}</span>
                  </div>

                  <ul className="space-y-4">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className={`w-5 h-5 shrink-0 ${tier.isPopular ? 'text-emerald-400' : 'text-emerald-500'}`} />
                        <span className={`text-xs font-bold ${tier.isPopular ? 'text-gray-300' : 'text-gray-600'}`}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={tier.buttonLink}
                  className={`w-full py-4 rounded-xl text-sm font-black text-center transition-all active:scale-95 mt-auto ${tier.isPopular
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-amber-950 shadow-lg shadow-amber-500/20'
                      : 'bg-gray-50 hover:bg-[#1f8898] hover:text-white text-gray-900 border border-gray-200 hover:border-transparent'
                    }`}
                >
                  {tier.buttonText}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* --- FAQ SECTION --- */}
        <section className="max-w-3xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#ebf3f5] text-[#1f8898] mb-4">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all hover:border-[#1f8898]/30"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-5 flex items-center justify-between bg-white text-left focus:outline-none"
                >
                  <span className="font-bold text-gray-900">{faq.question}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-[#1f8898] shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                  )}
                </button>

                {openFaq === idx && (
                  <div className="px-6 pb-5 pt-0 text-gray-500 font-medium leading-relaxed border-t border-gray-50 bg-gray-50/50">
                    <div className="pt-4">{faq.answer}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* --- PREMIUM FOOTER --- */}
      <Footer />

    </div>
  );
}