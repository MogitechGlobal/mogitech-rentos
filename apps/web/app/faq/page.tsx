// apps/web/app/faq/page.tsx
'use client';

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight, Building2, Globe, Search, MessageCircle,
  HelpCircle, CreditCard, ShieldCheck, Wrench, Plus, Minus,
  LifeBuoy
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
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openFaqId, setOpenFaqId] = useState<number | null>(1); // Open the first FAQ by default

  // Filter Logic
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

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
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-[#1f8898]/10 to-transparent opacity-60 blur-3xl pointer-events-none"></div>

        {/* --- FAQ HERO & SEARCH --- */}
        <section className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ebf3f5] text-[#1f8898] text-[10px] font-black uppercase tracking-[0.15em] mb-6">
              <LifeBuoy className="w-3.5 h-3.5" /> Support Center
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-gray-900 mb-6 leading-[1.1]">
            How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1f8898] to-[#0f4952]">help you?</span>
          </h1>
          <p className="text-lg text-gray-500 font-medium leading-relaxed mb-10 max-w-2xl mx-auto">
            Everything you need to know about billing, security, and scaling your property portfolio with MogiRentOS.
          </p>

          {/* Glassmorphic Search Bar */}
          <div className="relative max-w-2xl mx-auto group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#1f8898]/20 to-[#0f4952]/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
            <div className="relative bg-white border border-gray-200 shadow-xl shadow-black/5 rounded-2xl flex items-center overflow-hidden transition-all focus-within:border-[#1f8898] focus-within:ring-4 focus-within:ring-[#1f8898]/10">
              <Search className="absolute left-5 h-6 w-6 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search for answers (e.g., M-Pesa, Security)..."
                className="w-full bg-transparent text-gray-900 text-lg font-bold pl-14 pr-6 py-5 outline-none placeholder:text-gray-300 placeholder:font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
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
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
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
                <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-200 shadow-sm">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">No results found</h3>
                    <p className="text-gray-500 font-medium">We couldn't find any questions matching "{searchQuery}".</p>
                </div>
            ) : (
                filteredFaqs.map((faq) => {
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
                })
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

      <Footer />

    </div>
  );
}