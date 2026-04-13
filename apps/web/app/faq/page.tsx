// apps/web/app/faq/page.tsx
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight, Building2, Menu, X, Globe, 
  ChevronDown, ChevronUp, Search, MessageCircle,
  HelpCircle, CreditCard, ShieldCheck, Wrench
} from "lucide-react";
import Footer from "@/components/Footer";

// --- FAQ Data Organized by Category ---
const faqCategories = [
  { id: 'all', label: 'All Questions', icon: HelpCircle },
  { id: 'billing', label: 'Billing & M-Pesa', icon: CreditCard },
  { id: 'security', label: 'Security & Data', icon: ShieldCheck },
  { id: 'features', label: 'Platform Features', icon: Wrench },
];

const faqs = [
  // Billing & M-Pesa
  {
    id: 1,
    category: 'billing',
    question: "How does the automated M-Pesa Paybill integration work?",
    answer: "MogiRentOS connects directly to your Safaricom Paybill or Till number via an API. When a tenant makes a payment, the system intercepts the transaction, matches the phone number or account number to the specific tenant and unit, updates their ledger in real-time, and automatically sends an SMS receipt."
  },
  {
    id: 2,
    category: 'billing',
    question: "Can tenants pay their rent in installments?",
    answer: "Yes. The system fully supports partial payments. If a tenant pays a fraction of their rent, MogiRentOS updates their invoice status to 'Partially Paid', records the exact amount received, and clearly displays the outstanding balance on both your dashboard and their tenant portal."
  },
  {
    id: 3,
    category: 'billing',
    question: "How are late fees calculated and applied?",
    answer: "You can configure custom late fee rules in your settings. For example, you can set a flat fee of Ksh 1,000 or a percentage of the rent if payment is not received by the 5th of the month. The system will automatically add this charge to the tenant's ledger at midnight on the deadline."
  },
  
  // Security & Data
  {
    id: 4,
    category: 'security',
    question: "Is my financial data and tenant information secure?",
    answer: "Absolutely. We utilize bank-grade AES-256 encryption to protect all sensitive data at rest and TLS 1.3 for data in transit. Our servers are hosted on enterprise-grade infrastructure with strict Role-Based Access Control (RBAC), meaning your staff only sees what you allow them to see."
  },
  {
    id: 5,
    category: 'security',
    question: "Where is my data hosted, and do you comply with local laws?",
    answer: "Our primary databases are hosted on secure edge networks with localized data residency configurations to comply with Kenyan data protection regulations. We also perform automated, geo-redundant backups every 24 hours to ensure zero data loss."
  },
  {
    id: 6,
    category: 'security',
    question: "Who owns the data generated on the platform?",
    answer: "You do. Your tenant lists, financial ledgers, and lease agreements are 100% your property. You can export your data at any time in CSV or PDF formats directly from the dashboard."
  },

  // Platform Features
  {
    id: 7,
    category: 'features',
    question: "Can I customize the lease agreements for different properties?",
    answer: "Yes. MogiRentOS features a dynamic template builder. You can create a master 'Global Template' and then add specific custom clauses for individual tenants or buildings. Tenants can securely e-sign these documents via their mobile portal."
  },
  {
    id: 8,
    category: 'features',
    question: "How does the maintenance ticketing system work?",
    answer: "Tenants log into their portal, select an issue category (e.g., Plumbing, Electrical), upload photos, and submit a ticket. The system automatically routes this ticket to your dashboard and can notify your preferred vendors. You track the status from 'Pending' to 'Resolved'."
  },
  {
    id: 9,
    category: 'features',
    question: "Do tenants need to download a separate mobile app?",
    answer: "No app store download is required! The Tenant Portal is a Progressive Web App (PWA). It acts like a native app on their phone, allowing them to log in via a browser, save the icon to their home screen, and access their leases and invoices instantly."
  },
  {
    id: 10,
    category: 'features',
    question: "Does the system support commercial properties or just residential?",
    answer: "MogiRentOS is highly flexible and supports both residential apartments and commercial properties (offices, retail spaces). You can configure different lease terms, VAT additions, and billing cycles based on the property type."
  }
];

export default function FAQPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // FAQ States
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openFaqId, setOpenFaqId] = useState<number | null>(1); // Open the first FAQ by default

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Filter Logic
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

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

      <main className="flex-1 pt-32 pb-24 overflow-hidden relative">
        
        {/* Background Elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-[600px] w-[600px] rounded-full bg-gradient-to-bl from-[#ebf3f5] via-[#1f8898]/5 to-transparent opacity-80 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-[#1f8898]/10 to-transparent opacity-60 blur-3xl pointer-events-none"></div>

        {/* --- FAQ HERO & SEARCH --- */}
        <section className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900 mb-6">
            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1f8898] to-[#0f4952]">Questions.</span>
          </h1>
          <p className="text-lg text-gray-500 font-medium leading-relaxed mb-10 max-w-2xl mx-auto">
            Everything you need to know about MogiRentOS, billing, security, and how to scale your property portfolio with our platform.
          </p>

          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-4 h-6 w-6 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search for answers (e.g., M-Pesa, Security, Leases)..."
              className="w-full bg-white border border-gray-200 shadow-xl shadow-[#1f8898]/5 text-gray-900 text-lg font-bold rounded-2xl pl-14 pr-6 py-4 outline-none focus:ring-4 focus:ring-[#1f8898]/10 focus:border-[#1f8898] transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </section>

        {/* --- FAQ CATEGORIES & ACCORDION --- */}
        <section className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10 mb-32">
          
          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-12 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            {faqCategories.map(category => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all active:scale-95 ${
                    isActive 
                    ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20 border border-gray-800' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-[#1f8898]/30 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#1f8898]' : 'text-gray-400'}`} />
                  {category.label}
                </button>
              );
            })}
          </div>

          {/* Accordion List */}
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            {filteredFaqs.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">No results found</h3>
                    <p className="text-gray-500 font-medium">We couldn't find any questions matching "{searchQuery}". Please try another term.</p>
                </div>
            ) : (
                filteredFaqs.map((faq) => (
                <div 
                    key={faq.id} 
                    className={`bg-white border rounded-[1.5rem] overflow-hidden transition-all duration-300 ${
                        openFaqId === faq.id 
                        ? 'border-[#1f8898]/30 shadow-xl shadow-[#1f8898]/5' 
                        : 'border-gray-200 hover:border-gray-300 shadow-sm'
                    }`}
                >
                    <button 
                    onClick={() => setOpenFaqId(openFaqId === faq.id ? null : faq.id)}
                    className="w-full px-6 py-6 flex items-center justify-between bg-white text-left focus:outline-none group"
                    >
                    <span className={`text-lg font-black tracking-tight pr-4 transition-colors ${openFaqId === faq.id ? 'text-[#1f8898]' : 'text-gray-900 group-hover:text-[#1f8898]'}`}>
                        {faq.question}
                    </span>
                    <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition-colors ${openFaqId === faq.id ? 'bg-[#ebf3f5] text-[#1f8898]' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'}`}>
                        {openFaqId === faq.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                    </button>
                    
                    <div 
                        className={`overflow-hidden transition-all duration-500 ease-in-out ${openFaqId === faq.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                        <div className="px-6 pb-6 pt-0 text-gray-500 font-medium leading-relaxed border-t border-gray-50/50">
                            <div className="pt-4">{faq.answer}</div>
                        </div>
                    </div>
                </div>
                ))
            )}
          </div>
        </section>

        {/* --- STILL HAVE QUESTIONS CTA --- */}
        <section className="max-w-5xl mx-auto px-6 lg:px-8 relative z-10">
            <div className="bg-gray-900 rounded-[3rem] p-10 md:p-16 text-center border border-gray-800 shadow-2xl shadow-gray-900/20 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-b from-[#1f8898]/20 to-transparent rounded-full blur-3xl pointer-events-none -mt-64"></div>
                
                <div className="w-16 h-16 bg-[#1f8898]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 relative z-10 border border-[#1f8898]/30">
                    <MessageCircle className="w-8 h-8 text-[#1f8898]" />
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4 relative z-10">Still have questions?</h2>
                <p className="text-lg text-gray-400 font-medium mb-10 max-w-2xl mx-auto relative z-10">
                    Can't find the answer you're looking for? Our enterprise support team is available to help you understand how MogiRentOS fits your unique portfolio.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
                    <Link
                        href="/contact"
                        className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-[#1f8898] px-8 text-base font-bold text-[#ffffff] shadow-xl shadow-[#1f8898]/20 transition-all hover:bg-[#1a7684] active:scale-95"
                    >
                        Contact Support Team
                    </Link>
                    <a
                        href="mailto:support@mogitechglobal.com"
                        className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-gray-800 border border-gray-700 px-8 text-base font-bold text-white transition-all hover:bg-gray-700 active:scale-95"
                    >
                        Email Us Directly
                    </a>
                </div>
            </div>
        </section>

      </main>

       {/* --- PREMIUM FOOTER --- */}
      <Footer />

    </div>
  );
}