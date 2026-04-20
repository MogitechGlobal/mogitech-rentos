// apps/web/app/pricing/page.tsx
'use client';

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight, Building2, Globe, CheckCircle2, 
  HelpCircle, Plus, Minus, Crown, Zap, MessageCircle
} from "lucide-react";
import Footer from "@/components/Footer";

// --- 5-Tier Pricing Data ---
const pricingTiers = [
  {
    name: "Starter",
    price: "1,500",
    description: "Perfect for individuals managing a single building.",
    buttonText: "Start 30-Day Free Trial",
    buttonLink: "/register?plan=starter",
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
    buttonLink: "/register?plan=basic",
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
    buttonLink: "/register?plan=standard",
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
    buttonLink: "/register?plan=pro",
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
    id: 1,
    question: "Do you charge per unit or a flat monthly fee?",
    answer: "We use volume-based pricing. Every plan includes full access to all premium features (like maintenance ticketing and M-Pesa syncing). You simply choose the flat-fee tier that matches your current portfolio size, up to Unlimited on our Professional plan."
  },
  {
    id: 2,
    question: "How does the 30-Day Free Trial work?",
    answer: "When you create a new account, you are automatically enrolled in the Starter plan trial. For 30 days, you have complete, unrestricted access to the entire platform. No credit card is required to sign up."
  },
  {
    id: 3,
    question: "How does the M-Pesa Paybill integration work?",
    answer: "Available on all plans, we link your existing Safaricom Paybill or Till number directly to MogiRentOS via API. When a tenant pays, the system instantly matches their account, updates their ledger, and sends them a digital receipt, zero manual data entry required."
  },
  {
    id: 4,
    question: "Can I upgrade or downgrade my plan later?",
    answer: "Absolutely. You can change your subscription tier at any time from your Executive Dashboard as your portfolio grows. Changes take effect immediately."
  },
  {
    id: 5,
    question: "Is my data secure?",
    answer: "Yes. We use bank-grade AES-256 encryption to protect your financial ledgers and tenant data. Our infrastructure is hosted on secure, compliant edge networks with daily automated backups."
  }
];

export default function PricingPage() {
  const [openFaqId, setOpenFaqId] = useState<number | null>(1); // Open first FAQ by default

  // Dynamic SEO JSON-LD Schema for Google Rich Snippets
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafb] font-sans selection:bg-[#1f8898]/30">

      {/* --- INJECT SEO SCHEMA --- */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

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
                  <Link href="/pricing" className="text-xs sm:text-sm font-black text-[#1f8898] transition-colors hidden lg:block">
                      Pricing
                  </Link>
                  <div className="h-4 w-px bg-gray-200 hidden md:block"></div>
                  <Link href="/login" className="text-xs sm:text-sm font-bold text-[#1f8898] bg-[#1f8898]/10 hover:bg-[#1f8898]/20 px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap">
                      Sign In <ArrowRight className="w-3 h-3 hidden sm:block" />
                  </Link>
              </div>
          </div>
      </nav>

      <main className="flex-1 overflow-hidden relative">
        
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-[600px] w-[600px] rounded-full bg-gradient-to-bl from-[#ebf3f5] via-[#1f8898]/5 to-transparent opacity-80 blur-3xl pointer-events-none"></div>

        {/* --- PRICING HERO --- */}
        <section className="relative px-6 lg:px-8 pt-20 pb-16 text-center max-w-4xl mx-auto z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ebf3f5] text-[#1f8898] text-[10px] font-black uppercase tracking-[0.15em] mb-6 shadow-sm">
              <Zap className="w-3.5 h-3.5" /> Transparent Pricing
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 mb-6 leading-[1.1]">
            Scale your portfolio <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1f8898] to-[#0f4952]">without limits.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto">
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
                    ? 'bg-gray-900 text-white shadow-2xl shadow-[#1f8898]/20 xl:-translate-y-4 z-10 border border-[#1f8898]/30'
                    : 'bg-white text-gray-900 shadow-xl shadow-black/5 border border-gray-100 hover:border-[#1f8898]/30 hover:shadow-2xl hover:shadow-[#1f8898]/10'
                  }`}
                style={{ animationDelay: `${(idx + 1) * 100}ms` }}
              >
                {tier.isPopular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-amber-500/30 flex items-center gap-1.5">
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
                        <span className={`text-xl font-bold ${tier.isPopular ? 'text-teal-200' : 'text-gray-400'}`}>Ksh</span>
                        <span className={`text-4xl font-black tracking-tight ${tier.isPopular ? 'text-white' : 'text-gray-900'}`}>{tier.price}</span>
                        <span className={`text-xs font-bold ${tier.isPopular ? 'text-teal-200/70' : 'text-gray-500'}`}>/mo</span>
                      </>
                    )}
                  </div>
                  <p className={`text-xs font-medium leading-relaxed min-h-[3rem] ${tier.isPopular ? 'text-teal-50' : 'text-gray-500'}`}>
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
                        <CheckCircle2 className={`w-5 h-5 shrink-0 ${tier.isPopular ? 'text-[#1f8898]' : 'text-[#1f8898]'}`} />
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

        {/* --- FAQ SECTION (SMOOTH ACCORDIONS) --- */}
        <section className="max-w-4xl mx-auto px-6 lg:px-8 mb-32 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#ebf3f5] text-[#1f8898] mb-4 border border-[#1f8898]/10 shadow-sm">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div 
                    key={faq.id} 
                    className={`bg-white border rounded-[1.5rem] overflow-hidden transition-all duration-300 relative ${
                        isOpen 
                        ? 'border-[#1f8898]/30 shadow-xl shadow-[#1f8898]/5' 
                        : 'border-gray-100 hover:border-gray-300 shadow-sm'
                    }`}
                >
                    {/* Active Left Highlight */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-[#1f8898] transition-transform duration-300 origin-top ${isOpen ? 'scale-y-100' : 'scale-y-0'}`}></div>

                    <button 
                      onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                      className="w-full px-6 sm:px-8 py-6 flex items-start sm:items-center justify-between bg-white text-left focus:outline-none group"
                    >
                      <span className={`text-lg sm:text-xl font-black tracking-tight pr-6 transition-colors ${isOpen ? 'text-[#1f8898]' : 'text-gray-900 group-hover:text-[#1f8898]'}`}>
                          {faq.question}
                      </span>
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-[#ebf3f5] text-[#1f8898]' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'}`}>
                          {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                      </div>
                    </button>
                    
                    {/* CSS Grid Animation for perfect height transitions */}
                    <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                        <div className="overflow-hidden">
                            <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0 text-gray-500 font-medium leading-relaxed text-base sm:text-lg">
                                <div className="pt-2 border-t border-gray-50">{faq.answer}</div>
                            </div>
                        </div>
                    </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* --- ENTERPRISE CTA SECTION --- */}
        <section className="max-w-5xl mx-auto px-6 lg:px-8 mb-16 relative z-10">
            <div className="bg-gradient-to-br from-[#0d393f] to-[#0a2c31] rounded-[3rem] p-10 md:p-16 text-center border border-gray-800 shadow-2xl shadow-gray-900/20 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-b from-[#1f8898]/20 to-transparent rounded-full blur-3xl pointer-events-none -mt-64"></div>
                
                <div className="w-16 h-16 bg-[#1f8898]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 relative z-10 border border-[#1f8898]/30">
                    <MessageCircle className="w-8 h-8 text-[#1f8898]" />
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4 relative z-10">Need a custom solution?</h2>
                <p className="text-lg text-teal-100/70 font-medium mb-10 max-w-2xl mx-auto relative z-10">
                    Managing more than 500 units? Talk to our sales team about dedicated server instances, custom Sacco ERP integrations, and white-labeled tenant apps.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
                    <Link
                        href="/contact"
                        className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-[#1f8898] px-8 text-base font-bold text-[#ffffff] shadow-xl shadow-[#1f8898]/20 transition-all hover:bg-[#1a7684] active:scale-95"
                    >
                        Contact Sales
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