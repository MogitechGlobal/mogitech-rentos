// apps/web/app/pricing/page.tsx
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight, Building2, CheckCircle2, Menu, X,
  HelpCircle, ChevronDown, ChevronUp, Globe
} from "lucide-react";
import Footer from "@/components/Footer";

// --- Pricing Data ---
const pricingTiers = [
  {
    name: "Starter",
    price: "1,500",
    description: "Perfect for independent landlords managing a small portfolio of units.",
    buttonText: "Start Free Trial",
    buttonLink: "/login?plan=starter",
    isPopular: false,
    features: [
      "Up to 50 active units",
      "Manual payment tracking",
      "Basic tenant portal",
      "Standard lease templates",
      "Email support"
    ],
    notIncluded: [
      "Automated M-Pesa Paybill sync",
      "Maintenance ticketing system",
      "Advanced financial analytics",
      "Custom E-Signatures"
    ]
  },
  {
    name: "Professional",
    price: "4,500",
    description: "The complete operating system for growing property management companies.",
    buttonText: "Get Started",
    buttonLink: "/login?plan=pro",
    isPopular: true,
    features: [
      "Unlimited active units",
      "Automated M-Pesa & Bank sync",
      "Full maintenance ticketing",
      "Premium e-signature documents",
      "Advanced financial reporting",
      "1-Click lease renewals",
      "Priority 24/7 WhatsApp support"
    ],
    notIncluded: []
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Dedicated infrastructure and custom API integrations for massive portfolios.",
    buttonText: "Contact Sales",
    buttonLink: "/contact",
    isPopular: false,
    features: [
      "Everything in Professional",
      "Custom ERP/Accounting integrations",
      "White-labeled tenant portal",
      "Dedicated Account Manager",
      "On-premise deployment options",
      "Custom contract drafting",
      "SLA guarantee (99.99%)"
    ],
    notIncluded: []
  }
];

// --- FAQ Data ---
const faqs = [
  {
    question: "Do you charge per unit or a flat monthly fee?",
    answer: "We charge a flat monthly subscription based on your tier. The Starter plan is capped at 50 units, while the Professional plan allows for unlimited units at no extra cost per door, allowing you to scale without penalty."
  },
  {
    question: "How does the M-Pesa Paybill integration work?",
    answer: "On the Professional plan, we link your existing Safaricom Paybill or Till number directly to MogiRentOS via API. When a tenant pays, the system instantly matches their phone number or account number, updates their ledger, and sends them a digital receipt."
  },
  {
    question: "Can I upgrade or downgrade my plan later?",
    answer: "Absolutely. You can change your subscription tier at any time from your Executive Dashboard. Changes take effect at the start of your next billing cycle."
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
        <section className="relative px-6 lg:px-8 text-center max-w-4xl mx-auto mb-20">
          <div className="absolute top-0 right-10 -mr-20 -mt-20 h-[400px] w-[400px] rounded-full bg-[#1f8898]/5 blur-3xl pointer-events-none"></div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900 mb-6 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Simple, transparent pricing.
          </h1>
          <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            No hidden fees, no per-unit penalties. Choose the plan that fits your portfolio size and unlock the full power of automated property management.
          </p>
        </section>

        {/* --- PRICING CARDS --- */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-32 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {pricingTiers.map((tier, idx) => (
              <div
                key={idx}
                className={`relative flex flex-col p-8 sm:p-10 rounded-[2.5rem] transition-all duration-500 animate-in fade-in slide-in-from-bottom-8 ${tier.isPopular
                    ? 'bg-gray-900 text-white shadow-2xl shadow-gray-900/20 scale-100 md:scale-105 z-10 border border-gray-800'
                    : 'bg-white text-gray-900 shadow-xl shadow-black/5 border border-gray-100 hover:border-[#1f8898]/30 hover:shadow-2xl hover:shadow-[#1f8898]/10'
                  }`}
                style={{ animationDelay: `${(idx + 2) * 150}ms` }}
              >
                {tier.isPopular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <span className="bg-gradient-to-r from-[#1f8898] to-[#135a65] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-[#1f8898]/30">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className={`text-xl font-black mb-2 ${tier.isPopular ? 'text-white' : 'text-gray-900'}`}>{tier.name}</h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    {tier.price === 'Custom' ? (
                      <span className={`text-5xl font-black tracking-tight ${tier.isPopular ? 'text-white' : 'text-gray-900'}`}>
                        Custom
                      </span>
                    ) : (
                      <>
                        <span className={`text-2xl font-bold ${tier.isPopular ? 'text-gray-400' : 'text-gray-400'}`}>Ksh</span>
                        <span className={`text-5xl font-black tracking-tight ${tier.isPopular ? 'text-white' : 'text-gray-900'}`}>{tier.price}</span>
                        <span className={`text-sm font-bold ${tier.isPopular ? 'text-gray-400' : 'text-gray-500'}`}>/mo</span>
                      </>
                    )}
                  </div>
                  <p className={`text-sm font-medium leading-relaxed ${tier.isPopular ? 'text-gray-400' : 'text-gray-500'}`}>
                    {tier.description}
                  </p>
                </div>

                <Link
                  href={tier.buttonLink}
                  className={`w-full py-4 rounded-xl text-sm font-black text-center transition-all active:scale-95 mb-10 ${tier.isPopular
                      ? 'bg-[#1f8898] hover:bg-[#1a7684] text-white shadow-lg shadow-[#1f8898]/20'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200'
                    }`}
                >
                  {tier.buttonText}
                </Link>

                <div className="flex-1">
                  <p className={`text-xs font-black uppercase tracking-widest mb-4 ${tier.isPopular ? 'text-gray-400' : 'text-gray-400'}`}>What's Included</p>
                  <ul className="space-y-4 mb-8">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className={`w-5 h-5 shrink-0 ${tier.isPopular ? 'text-[#1f8898]' : 'text-[#1f8898]'}`} />
                        <span className={`text-sm font-medium ${tier.isPopular ? 'text-gray-300' : 'text-gray-600'}`}>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {tier.notIncluded.length > 0 && (
                    <>
                      <p className={`text-xs font-black uppercase tracking-widest mb-4 ${tier.isPopular ? 'text-gray-500' : 'text-gray-400'}`}>Not Included</p>
                      <ul className="space-y-4">
                        {tier.notIncluded.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3 opacity-60">
                            <X className={`w-5 h-5 shrink-0 ${tier.isPopular ? 'text-gray-600' : 'text-gray-400'}`} />
                            <span className={`text-sm font-medium ${tier.isPopular ? 'text-gray-500' : 'text-gray-500'}`}>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- FAQ SECTION --- */}
        <section className="max-w-4xl mx-auto px-6 lg:px-8">
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