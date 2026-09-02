// apps/web/app/pricing/page.tsx
export const runtime = 'edge';

import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, CheckCircle2, HelpCircle, MessageCircle, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { pricingPlans } from "@/data/pricing/plans";
import PricingFAQ from "./components/PricingFAQ";

export const metadata: Metadata = {
  title: "MogiRent Pricing | Property Management Software Kenya",
  description: "Explore MogiRent pricing for landlords, property managers, agencies, and growing rental businesses. Choose a plan based on your property portfolio and operational needs.",
  keywords: "property management software Kenya, MogiRent pricing, rental management software, landlord software Kenya",
  alternates: {
    canonical: "https://mogirent.co.ke/pricing"
  },
  openGraph: {
    title: "MogiRent Pricing | Property Management Software",
    description: "Explore transparent pricing for landlords and property managers in Kenya.",
    url: "https://mogirent.co.ke/pricing",
    type: "website"
  }
};

const pricingFaqs = [
  {
    id: "core-features",
    question: "What is included in every MogiRent plan?",
    answer: "Every plan includes core access to the MogiRent platform: property and unit records, tenant management, rent tracking, invoice generation, maintenance ticketing, and tenant portal access."
  },
  {
    id: "pricing-calculation",
    question: "How is MogiRent pricing calculated?",
    answer: "Pricing is based on the size of your property portfolio (number of properties and units). As your business grows, you can easily upgrade to a higher plan."
  },
  {
    id: "upgrade-plan",
    question: "Can I upgrade my plan later?",
    answer: "Yes, you can upgrade your subscription tier at any time from your account settings as your portfolio expands."
  },
  {
    id: "downgrade-plan",
    question: "Can I downgrade my plan?",
    answer: "You can adjust your plan tier to fit your current portfolio requirements by contacting our support team or reviewing your billing settings."
  },
  {
    id: "plan-limits",
    question: "What happens when I reach my plan limit?",
    answer: "When you approach or reach your property/unit limit, the system will prompt you to upgrade to the next appropriate tier to continue adding new listings."
  },
  {
    id: "subscription-cancellation",
    question: "Can I cancel my subscription?",
    answer: "Yes, subscriptions can be managed or cancelled from your account billing dashboard according to our standard service terms."
  },
  {
    id: "data-migration",
    question: "Can I migrate existing property data?",
    answer: "Yes, you can import your existing tenant lists and property information into MogiRent to get started quickly."
  }
];

export default function PricingPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": pricingFaqs.map(faq => ({
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
      { "@type": "ListItem", "position": 2, "name": "Pricing", "item": "https://mogirent.co.ke/pricing" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="flex min-h-screen flex-col bg-[#f8fafb] font-sans selection:bg-[#1f8898]/30">
        <Navbar />

        <main className="flex-1 pt-8 pb-24 overflow-hidden relative">
          
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-[500px] w-[500px] rounded-full bg-gradient-to-bl from-[#ebf3f5] via-[#1f8898]/5 to-transparent opacity-80 blur-3xl pointer-events-none"></div>

          {/* --- BREADCRUMBS --- */}
          <div className="max-w-6xl mx-auto px-6 mb-6">
            <nav aria-label="Breadcrumb" className="text-xs font-bold text-gray-400 flex items-center gap-2">
              <Link href="/" className="hover:text-[#1f8898] transition-colors">Home</Link>
              <span>/</span>
              <span className="text-gray-600">Pricing</span>
            </nav>
          </div>

          {/* --- PRICING HERO --- */}
          <section className="relative px-6 lg:px-8 pt-12 pb-16 text-center max-w-4xl mx-auto z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ebf3f5] text-[#1f8898] text-[10px] font-black uppercase tracking-[0.15em] mb-4 shadow-sm">
              Simple, transparent pricing
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-gray-900 mb-4 leading-[1.1]">
              Simple pricing for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1f8898] to-[#0f4952]">smarter property management.</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 font-medium leading-relaxed max-w-2xl mx-auto">
              Choose a plan that fits your property portfolio. Start with the tools you need today and move to a larger plan as your business grows.
            </p>
          </section>

          {/* --- BILLING CONTEXT --- */}
          <section className="max-w-4xl mx-auto px-6 mb-12 text-center">
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-sm inline-flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-gray-600">
              <span>Currency: KSh</span>
              <span>•</span>
              <span>Billed monthly</span>
              <span>•</span>
              <span>Cancel anytime</span>
            </div>
          </section>

          {/* --- 4-TIER PRICING CARDS --- */}
          <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-20 relative z-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
              {pricingPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative flex flex-col p-8 rounded-3xl transition-all duration-300 ${
                    plan.popular
                      ? 'bg-[#0f4952] text-white shadow-xl ring-2 ring-[#1f8898] lg:-translate-y-2'
                      : 'bg-white text-gray-950 shadow-sm border border-gray-200/80 hover:border-[#1f8898]/40 hover:shadow-md'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-0 right-0 flex justify-center">
                      <span className="bg-[#1f8898] text-white text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full shadow-sm">
                        Recommended
                      </span>
                    </div>
                  )}

                  <div className="mb-6 border-b pb-6 border-gray-100/20">
                    <h3 className={`text-xl font-black mb-1 ${plan.popular ? 'text-white' : 'text-gray-950'}`}>{plan.name}</h3>
                    <p className={`text-xs font-medium mb-4 min-h-[2.5rem] ${plan.popular ? 'text-teal-100/80' : 'text-gray-500'}`}>
                      {plan.description}
                    </p>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className={`text-xs font-bold ${plan.popular ? 'text-teal-200' : 'text-gray-400'}`}>{plan.currency}</span>
                      <span className={`text-4xl font-black tracking-tight ${plan.popular ? 'text-white' : 'text-gray-950'}`}>
                        {plan.price?.toLocaleString()}
                      </span>
                      <span className={`text-xs font-bold ${plan.popular ? 'text-teal-200/70' : 'text-gray-500'}`}>/ {plan.billingPeriod}</span>
                    </div>
                  </div>

                  <div className="flex-1 mb-8">
                    <div className={`flex items-center gap-2 mb-6 p-3 rounded-xl border ${plan.popular ? 'bg-white/10 border-white/20 text-white' : 'bg-[#ebf3f5] border-[#1f8898]/10 text-gray-950'}`}>
                      <Building2 className="w-4 h-4 shrink-0 text-[#1f8898]" />
                      <span className="text-xs font-black">{plan.portfolioLimit}</span>
                    </div>

                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs font-bold">
                          <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${plan.popular ? 'text-teal-300' : 'text-[#1f8898]'}`} />
                          <span className={plan.popular ? 'text-teal-50' : 'text-gray-700'}>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    href={plan.ctaHref}
                    className={`w-full py-3.5 rounded-xl text-xs font-black text-center transition-all active:scale-95 mt-auto ${
                      plan.popular
                        ? 'bg-white text-[#0f4952] hover:bg-teal-50 shadow-md'
                        : 'bg-[#0f4952] hover:bg-[#1f8898] text-white shadow-sm'
                    }`}
                  >
                    {plan.ctaLabel}
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* --- WHICH PLAN IS RIGHT FOR ME? --- */}
          <section className="max-w-5xl mx-auto px-6 mb-20">
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200/80 shadow-sm">
              <h2 className="text-xs font-black text-[#1f8898] uppercase tracking-[0.2em] mb-2">Decision Guide</h2>
              <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-8">Which plan is right for me?</h3>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-[#f8fafb] p-6 rounded-2xl border border-gray-100">
                  <h4 className="font-black text-gray-900 text-base mb-1">I manage one property</h4>
                  <p className="text-xs font-bold text-[#1f8898] mb-2">Starter Plan</p>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">For individual landlords managing a smaller portfolio or single building.</p>
                </div>
                <div className="bg-[#f8fafb] p-6 rounded-2xl border border-gray-100">
                  <h4 className="font-black text-gray-900 text-base mb-1">I manage several properties</h4>
                  <p className="text-xs font-bold text-[#1f8898] mb-2">Basic Plan</p>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">For growing landlords and small property management operations.</p>
                </div>
                <div className="bg-[#f8fafb] p-6 rounded-2xl border border-gray-100">
                  <h4 className="font-black text-gray-900 text-base mb-1">I manage a larger portfolio</h4>
                  <p className="text-xs font-bold text-[#1f8898] mb-2">Standard Plan</p>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">For established property managers needing team access and advanced reporting.</p>
                </div>
                <div className="bg-[#f8fafb] p-6 rounded-2xl border border-gray-100">
                  <h4 className="font-black text-gray-900 text-base mb-1">I manage a large or expanding portfolio</h4>
                  <p className="text-xs font-bold text-[#1f8898] mb-2">Professional Plan</p>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">For larger property operations requiring unlimited properties and units.</p>
                </div>
              </div>
            </div>
          </section>

          {/* --- FEATURE COMPARISON TABLE --- */}
          <section className="max-w-5xl mx-auto px-6 mb-20">
            <div className="text-center mb-10">
              <h2 className="text-xs font-black text-[#1f8898] uppercase tracking-[0.2em] mb-2">Feature Breakdown</h2>
              <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Compare plan capabilities</h3>
            </div>

            <div className="bg-white rounded-3xl border border-gray-200/80 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-xs font-black text-gray-900 uppercase tracking-wider">
                      <th className="p-5">Feature</th>
                      <th className="p-5 text-center">Starter</th>
                      <th className="p-5 text-center">Basic</th>
                      <th className="p-5 text-center">Standard</th>
                      <th className="p-5 text-center">Professional</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs sm:text-sm font-medium text-gray-700">
                    <tr>
                      <td className="p-5 font-bold text-gray-900">Properties limit</td>
                      <td className="p-5 text-center font-bold">1</td>
                      <td className="p-5 text-center font-bold">3</td>
                      <td className="p-5 text-center font-bold">5</td>
                      <td className="p-5 text-center font-bold text-[#1f8898]">Unlimited</td>
                    </tr>
                    <tr>
                      <td className="p-5 font-bold text-gray-900">Units limit</td>
                      <td className="p-5 text-center font-bold">30</td>
                      <td className="p-5 text-center font-bold">50</td>
                      <td className="p-5 text-center font-bold">100</td>
                      <td className="p-5 text-center font-bold text-[#1f8898]">Unlimited</td>
                    </tr>
                    <tr>
                      <td className="p-5 font-bold text-gray-900">Property & tenant management</td>
                      <td className="p-5 text-center text-[#1f8898] font-bold">✓</td>
                      <td className="p-5 text-center text-[#1f8898] font-bold">✓</td>
                      <td className="p-5 text-center text-[#1f8898] font-bold">✓</td>
                      <td className="p-5 text-center text-[#1f8898] font-bold">✓</td>
                    </tr>
                    <tr>
                      <td className="p-5 font-bold text-gray-900">Rent tracking & invoicing</td>
                      <td className="p-5 text-center text-[#1f8898] font-bold">✓</td>
                      <td className="p-5 text-center text-[#1f8898] font-bold">✓</td>
                      <td className="p-5 text-center text-[#1f8898] font-bold">✓</td>
                      <td className="p-5 text-center text-[#1f8898] font-bold">✓</td>
                    </tr>
                    <tr>
                      <td className="p-5 font-bold text-gray-900">Maintenance management</td>
                      <td className="p-5 text-center text-[#1f8898] font-bold">✓</td>
                      <td className="p-5 text-center text-[#1f8898] font-bold">✓</td>
                      <td className="p-5 text-center text-[#1f8898] font-bold">✓</td>
                      <td className="p-5 text-center text-[#1f8898] font-bold">✓</td>
                    </tr>
                    <tr>
                      <td className="p-5 font-bold text-gray-900">Team access & staff permissions</td>
                      <td className="p-5 text-center text-gray-300">-</td>
                      <td className="p-5 text-center text-gray-300">-</td>
                      <td className="p-5 text-center text-[#1f8898] font-bold">✓</td>
                      <td className="p-5 text-center text-[#1f8898] font-bold">✓</td>
                    </tr>
                    <tr>
                      <td className="p-5 font-bold text-gray-900">Advanced reporting</td>
                      <td className="p-5 text-center text-gray-300">-</td>
                      <td className="p-5 text-center text-gray-300">-</td>
                      <td className="p-5 text-center text-[#1f8898] font-bold">✓</td>
                      <td className="p-5 text-center text-[#1f8898] font-bold">✓</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* --- NO HIDDEN COMPLEXITY TRUST SECTION --- */}
          <section className="max-w-5xl mx-auto px-6 mb-20">
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#1f8898] mb-2 inline-block">Transparent Pricing</span>
                <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-3">Know what you're paying for.</h3>
                <p className="text-gray-600 text-sm sm:text-base font-medium leading-relaxed">
                  Clear monthly pricing, portfolio-based plans, and transparent limits. No unnecessary feature bundles—just upgrade as your property portfolio grows.
                </p>
              </div>
              <div className="shrink-0">
                <div className="w-16 h-16 bg-[#ebf3f5] rounded-2xl flex items-center justify-center text-[#1f8898] border border-[#1f8898]/20 shadow-sm">
                  <ShieldCheck className="w-8 h-8" />
                </div>
              </div>
            </div>
          </section>

          {/* --- PRICING FAQ SECTION --- */}
          <section className="max-w-4xl mx-auto px-6 mb-20 relative z-10">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#ebf3f5] text-[#1f8898] mb-4 border border-[#1f8898]/10 shadow-sm">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Frequently Asked Questions</h3>
            </div>

            <PricingFAQ faqs={pricingFaqs} />
          </section>

          {/* --- ENTERPRISE / CUSTOM REQUIREMENTS --- */}
          <section className="max-w-5xl mx-auto px-6 mb-16">
            <div className="bg-[#0f4952] rounded-3xl p-8 sm:p-12 text-center text-white border border-gray-800 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#1f8898]/30 rounded-full blur-3xl pointer-events-none"></div>

              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-5 relative z-10 border border-white/10 backdrop-blur-sm">
                <MessageCircle className="w-7 h-7 text-teal-200" />
              </div>
              
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-3 relative z-10">Need something beyond the standard plans?</h3>
              
              <p className="text-sm sm:text-base text-teal-100/80 font-medium mb-8 max-w-xl mx-auto relative z-10 leading-relaxed">
                If your organisation has larger portfolio requirements or specific operational needs, talk to the MogiRent team about the options available for your business.
              </p>
              
              <Link
                href="/contact"
                className="inline-flex h-12 sm:h-14 items-center justify-center gap-2 rounded-xl bg-white px-8 text-sm font-bold text-[#0f4952] shadow-lg transition-all hover:bg-teal-50 active:scale-95 relative z-10"
              >
                Talk to Sales <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>

        </main>

        <Footer />
      </div>
    </>
  );
}