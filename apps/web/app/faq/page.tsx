// apps/web/app/faq/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, HelpCircle, LifeBuoy, MessageCircle, Home, Building2, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { faqs, FAQCategory } from "@/data/faq/faqs";
import FAQSearch from "@/components/faq/FAQSearch";
import FAQCategoryTabs from "@/components/faq/FAQCategoryTabs";
import FAQAccordion from "@/components/faq/FAQAccordion";

export const metadata: Metadata = {
  title: "MogiRent FAQ | Property Management & Rent Collection Help",
  description: "Find answers about MogiRent property management software, rent collection, tenants, landlords, maintenance, M-Pesa payments and more.",
  keywords: "property management software Kenya, M-Pesa rent collection, rental property management, tenant management software",
  alternates: {
    canonical: "https://mogirent.co.ke/faq"
  },
  openGraph: {
    title: "MogiRent FAQ | Support & Knowledge Hub",
    description: "Find answers about MogiRent property management software, rent collection, and tenant workflows.",
    url: "https://mogirent.co.ke/faq",
    type: "website"
  }
};

interface PageProps {
  searchParams: Promise<{ q?: string; category?: string }>;
}

export default async function FAQPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const searchQuery = resolvedParams.q || "";
  const selectedCategory = (resolvedParams.category as FAQCategory) || "all";

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

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

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://mogirent.co.ke" },
      { "@type": "ListItem", "position": 2, "name": "Support Center", "item": "https://mogirent.co.ke/faq" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="flex min-h-screen flex-col bg-[#f8fafb] font-sans selection:bg-[#1f8898]/30">
        <Navbar />

        <main className="flex-1 pt-12 pb-24 overflow-hidden relative">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-[500px] w-[500px] rounded-full bg-gradient-to-bl from-[#ebf3f5] via-[#1f8898]/5 to-transparent opacity-80 blur-3xl pointer-events-none"></div>

          <div className="max-w-4xl mx-auto px-6 mb-6">
            <nav aria-label="Breadcrumb" className="text-xs font-bold text-gray-400 flex items-center gap-2">
              <Link href="/" className="hover:text-[#1f8898] transition-colors">Home</Link>
              <span>/</span>
              <span className="text-gray-600">Support Center & FAQs</span>
            </nav>
          </div>

          <section className="max-w-4xl mx-auto px-6 text-center relative z-10 mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ebf3f5] text-[#1f8898] text-[10px] font-black uppercase tracking-[0.15em] mb-4 shadow-sm">
              <LifeBuoy className="w-3.5 h-3.5" /> MOGIRENT SUPPORT CENTER
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-gray-900 mb-4 leading-[1.1]">
              Find answers. <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1f8898] to-[#0f4952]">Manage smarter.</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-500 font-medium leading-relaxed mb-10 max-w-2xl mx-auto">
              Get clear answers about renting, property management, rent collection, tenant workflows, and MogiRent.
            </p>

            <form action="/faq" method="GET" className="max-w-2xl mx-auto">
              <div className="relative bg-white border border-gray-200/80 shadow-xl shadow-black/5 rounded-2xl flex items-center overflow-hidden transition-all focus-within:border-[#1f8898] focus-within:ring-4 focus-within:ring-[#1f8898]/10">
                <input 
                  type="text" 
                  name="q"
                  defaultValue={searchQuery}
                  placeholder="Search questions, features, rent collection, tenants..."
                  className="w-full bg-transparent text-gray-900 text-base sm:text-lg font-bold pl-6 pr-32 py-4 outline-none placeholder:text-gray-400 placeholder:font-medium"
                />
                <button type="submit" className="absolute right-2 bg-[#1f8898] hover:bg-[#1a7684] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm">
                  Search
                </button>
              </div>
            </form>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-gray-500">
              <span className="text-gray-400">Popular:</span>
              <Link href="/faq?q=M-Pesa" className="hover:text-[#1f8898] underline">M-Pesa rent collection</Link>
              <span>•</span>
              <Link href="/faq?q=property+management+software" className="hover:text-[#1f8898] underline">Property management software</Link>
              <span>•</span>
              <Link href="/faq?q=maintenance" className="hover:text-[#1f8898] underline">Maintenance</Link>
            </div>
          </section>

          <section className="max-w-5xl mx-auto px-6 mb-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/faq?category=tenants" className="bg-white p-6 rounded-2xl border border-gray-200/80 hover:border-[#1f8898]/40 hover:shadow-lg transition-all group">
                <Home className="w-6 h-6 text-[#1f8898] mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-black text-gray-900 text-base mb-1">For Tenants</h3>
                <p className="text-xs text-gray-500 font-medium">Find homes and manage payments.</p>
              </Link>
              <Link href="/faq?category=landlords" className="bg-white p-6 rounded-2xl border border-gray-200/80 hover:border-[#1f8898]/40 hover:shadow-lg transition-all group">
                <Building2 className="w-6 h-6 text-[#1f8898] mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-black text-gray-900 text-base mb-1">For Landlords</h3>
                <p className="text-xs text-gray-500 font-medium">Manage tenants, rent & operations.</p>
              </Link>
              <Link href="/faq?category=property-management" className="bg-white p-6 rounded-2xl border border-gray-200/80 hover:border-[#1f8898]/40 hover:shadow-lg transition-all group">
                <Users className="w-6 h-6 text-[#1f8898] mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-black text-gray-900 text-base mb-1">Property Managers</h3>
                <p className="text-xs text-gray-500 font-medium">Multi-property portfolios & staff.</p>
              </Link>
              <Link href="/faq?category=billing" className="bg-white p-6 rounded-2xl border border-gray-200/80 hover:border-[#1f8898]/40 hover:shadow-lg transition-all group">
                <HelpCircle className="w-6 h-6 text-[#1f8898] mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-black text-gray-900 text-base mb-1">Rent & M-Pesa</h3>
                <p className="text-xs text-gray-500 font-medium">Automated collection & ledgers.</p>
              </Link>
            </div>
          </section>

          <section className="max-w-4xl mx-auto px-6 relative z-10 mb-20">
            <div className="mb-8">
              <FAQCategoryTabs />
            </div>

            <FAQAccordion faqs={filteredFaqs} />
          </section>

          <section className="max-w-4xl mx-auto px-6 mb-20 bg-white rounded-3xl p-8 sm:p-10 border border-gray-200/80 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 tracking-tight mb-2">Explore MogiRent Resources</h3>
            <p className="text-sm text-gray-500 font-medium mb-6">Deep dive into our expert property guides and Kenyan rental market insights.</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/blog" className="bg-[#ebf3f5] text-[#1f8898] hover:bg-[#1f8898] hover:text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all">
                Property Management Guides →
              </Link>
              <Link href="/blog" className="bg-[#ebf3f5] text-[#1f8898] hover:bg-[#1f8898] hover:text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all">
                Rent Collection Insights →
              </Link>
              <Link href="/marketplace" className="bg-[#ebf3f5] text-[#1f8898] hover:bg-[#1f8898] hover:text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all">
                Browse Marketplace →
              </Link>
            </div>
          </section>

          <section className="max-w-5xl mx-auto px-6 mb-20">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-[#0f4952] to-[#1f8898] rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-teal-200 mb-2 inline-block">House Hunters</span>
                  <h4 className="text-2xl font-black tracking-tight mb-3">Looking for your next home?</h4>
                  <p className="text-teal-100/90 text-sm font-medium leading-relaxed mb-8">
                    Explore available rental properties on MogiRent with zero broker fees and verified landlord listings.
                  </p>
                </div>
                <Link href="/marketplace" className="inline-flex items-center justify-center gap-2 bg-white text-[#0f4952] hover:bg-teal-50 px-6 py-3.5 rounded-xl font-black text-sm transition-all shadow-md">
                  Find Your Next Home <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#1f8898] mb-2 inline-block">Property Owners & Managers</span>
                  <h4 className="text-2xl font-black text-gray-900 tracking-tight mb-3">Managing properties manually?</h4>
                  <p className="text-gray-600 text-sm font-medium leading-relaxed mb-8">
                    Bring rent, tenants, leases, maintenance and property operations into one professional platform.
                  </p>
                </div>
                <Link href="/pricing" className="inline-flex items-center justify-center gap-2 bg-[#0f4952] hover:bg-[#1f8898] text-white px-6 py-3.5 rounded-xl font-black text-sm transition-all shadow-md">
                  Manage Your Properties <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>

          <section className="max-w-4xl mx-auto px-6">
            <div className="bg-gray-900 rounded-[2.5rem] p-8 sm:p-12 text-center border border-gray-800 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#1f8898]/20 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="w-14 h-14 bg-[#1f8898]/20 rounded-2xl flex items-center justify-center mx-auto mb-5 relative z-10 border border-[#1f8898]/30">
                <MessageCircle className="w-7 h-7 text-[#1f8898]" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3 relative z-10">Can't find what you're looking for?</h2>
              <p className="text-sm sm:text-base text-gray-400 font-medium mb-8 max-w-xl mx-auto relative z-10 leading-relaxed">
                Our support team can help you understand how MogiRent fits your property management needs.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3 relative z-10">
                <Link
                  href="/contact"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#1f8898] px-8 text-sm font-bold text-white shadow-lg transition-all hover:bg-[#1a7684]"
                >
                  Contact Support
                </Link>
                <a
                  href="mailto:support@mogirent.co.ke"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gray-800 border border-gray-700 px-8 text-sm font-bold text-white transition-all hover:bg-gray-700"
                >
                  Email Support
                </a>
              </div>
            </div>
          </section>

        </main>

        <Footer />
      </div>
    </>
  );
}