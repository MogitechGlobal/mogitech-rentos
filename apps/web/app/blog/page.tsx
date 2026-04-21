// apps/web/app/blog/page.tsx
'use client';

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight, Building2, Globe, Home,
  Calendar, Clock, User, Mail, BookOpen, ArrowLeft
} from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

// --- SEO-Optimized Blog Categories ---
const categories = [
  { id: 'all', label: 'All Articles' },
  { id: 'management', label: 'Property Management' },
  { id: 'finance', label: 'Finance & M-Pesa' },
  { id: 'tech', label: 'PropTech & Software' },
  { id: 'market', label: 'Local Market Insights' }
];

// --- Featured Post (Highest Search Volume / Core Feature) ---
const featuredPost = {
  id: 'automate-mpesa-rent-collection',
  title: "How to Automate M-Pesa Rent Collection for Multiple Properties in 2026",
  excerpt: "Stop hunting for transaction codes. Discover how modern Kenyan landlords are using zero-touch STK pushes and auto-reconciled ledgers to collect rent faster and eliminate manual data entry.",
  category: "Finance & M-Pesa",
  categoryId: "finance",
  author: "Mogitech Research",
  date: "April 20, 2026",
  readTime: "8 min read",
  imageGradient: "from-[#1f8898] to-[#135a65]"
};

// --- SEO-Optimized Blog Posts ---
const blogPosts = [
  {
    id: 'legal-guide-digital-lease-kenya',
    title: "The Legal Guide to Digital Lease Agreements in Kenya",
    excerpt: "Navigating digital contracts can be confusing. Learn what makes an e-signature legally binding for your next tenant lease under Kenyan law.",
    category: "PropTech & Software",
    categoryId: "tech",
    author: "Legal Team",
    date: "April 15, 2026",
    readTime: "6 min read",
  },
  {
    id: 'top-reasons-tenants-pay-late',
    title: "Top 5 Reasons Your Tenants Are Paying Late (And How to Fix It)",
    excerpt: "Stop chasing arrears. Discover the psychological and systemic reasons behind late rent, and the automated SMS reminder tools to solve them.",
    category: "Property Management",
    categoryId: "management",
    author: "Faith Wanjiku",
    date: "April 10, 2026",
    readTime: "5 min read",
  },
  {
    id: 'excel-vs-property-software',
    title: "Excel vs. Property Management Software: When is it time to upgrade?",
    excerpt: "Spreadsheets work until they don't. Here are the 5 undeniable signs your real estate portfolio has outgrown manual tracking and needs an ERP.",
    category: "PropTech & Software",
    categoryId: "tech",
    author: "Peter Kamau",
    date: "April 5, 2026",
    readTime: "7 min read",
  },
  {
    id: 'handle-tenant-maintenance-requests',
    title: "How to Handle Tenant Maintenance Requests Without Losing Your Mind",
    excerpt: "Streamline your repair workflows. Learn how to digitize tenant requests, dispatch vendors quickly, and protect your overall asset value.",
    category: "Property Management",
    categoryId: "management",
    author: "Sarah Omondi",
    date: "March 28, 2026",
    readTime: "5 min read",
  },
  {
    id: 'commercial-vs-residential-nairobi',
    title: "A Guide to Managing Commercial vs. Residential Properties in Nairobi",
    excerpt: "Different tenant types require radically different strategies. Explore the operational and billing nuances of mixed-use property management.",
    category: "Local Market Insights",
    categoryId: "market",
    author: "Mogitech Research",
    date: "March 22, 2026",
    readTime: "8 min read",
  },
  {
    id: 'chamas-financial-transparency',
    title: "How Real Estate Chamas Can Improve Financial Transparency",
    excerpt: "Trust is everything in an investment group. Learn how cloud ledgers and automated reporting can eliminate disputes and track member contributions.",
    category: "Finance & M-Pesa",
    categoryId: "finance",
    author: "Investment Team",
    date: "March 15, 2026",
    readTime: "6 min read",
  },
  {
    id: 'kenya-rent-restriction-act',
    title: "Understanding the Kenya Rent Restriction Act: A Landlord's Guide",
    excerpt: "Stay compliant and avoid costly tribunal disputes. A simplified breakdown of Kenyan rental laws and eviction protocols every property owner must know.",
    category: "Local Market Insights",
    categoryId: "market",
    author: "Legal Team",
    date: "March 8, 2026",
    readTime: "9 min read",
  },
  {
    id: 'market-vacant-units-mogirentos',
    title: "How to Market Your Vacant Units Faster Using the MogiRentOS Marketplace",
    excerpt: "Reduce your vacancy periods to zero. Leverage our public aggregator to attract verified, high-quality tenants and capture leads instantly.",
    category: "Property Management",
    categoryId: "management",
    author: "Growth Team",
    date: "March 1, 2026",
    readTime: "4 min read",
  },
  {
    id: 'maximizing-roi-tax-deductions',
    title: "Maximizing ROI: Tax Deductions Kenyan Landlords Often Miss",
    excerpt: "Don't leave money on the table. A comprehensive guide to allowable expenses, maintenance write-offs, and tax breaks for Kenyan property investors.",
    category: "Finance & M-Pesa",
    categoryId: "finance",
    author: "Financial Advisory",
    date: "February 22, 2026",
    readTime: "7 min read",
  }
];

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredPosts = activeCategory === 'all'
    ? blogPosts
    : blogPosts.filter(post => post.categoryId === activeCategory);

  return (
    <div className="min-h-screen bg-[#f8fafb] font-sans selection:bg-[#1f8898]/30 flex flex-col">

       {/* --- STANDARDIZED PUBLIC NAVBAR COMPONENT --- */}
      <Navbar />

      {/* --- MINIMAL GRADIENT HERO --- */}
      <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-6 pt-10 pb-16 md:pt-12 md:pb-20 relative overflow-hidden shadow-inner">
        <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="text-center md:text-left max-w-xl">
            <h1 className="text-3xl md:text-4xl font-black text-[#ffffff] tracking-tight mb-2 leading-tight">
              Resources & <span className="text-teal-200">Insights.</span>
            </h1>
            <p className="text-teal-100/90 text-sm md:text-base font-medium">
              Expert advice, industry trends, and actionable strategies for property managers in Kenya.
            </p>
          </div>

          <div className="flex flex-wrap justify-center md:justify-end gap-2 max-w-lg">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all backdrop-blur-md ${
                  activeCategory === cat.id
                    ? 'bg-white text-[#135a65] shadow-lg scale-105'
                    : 'bg-white/10 text-teal-50 border border-white/20 hover:bg-white/20'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-1 w-full relative z-20 -mt-8 md:-mt-10 max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        
        {/* --- FEATURED POST --- */}
        {activeCategory === 'all' && (
          <section className="mb-12 md:mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <Link href={`/blog/${featuredPost.id}`} className="group block">
              <div className="bg-[#ffffff] rounded-3xl sm:rounded-[2.5rem] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden flex flex-col md:flex-row transition-all duration-500 hover:shadow-2xl hover:shadow-[#1f8898]/20 hover:-translate-y-1">

                <div className={`w-full md:w-1/2 min-h-[250px] md:min-h-[400px] bg-gradient-to-br ${featuredPost.imageGradient} relative overflow-hidden flex items-center justify-center p-8 sm:p-10`}>
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
                  <div className="absolute w-64 h-64 bg-white/20 rounded-full blur-3xl -top-10 -left-10 group-hover:scale-150 transition-transform duration-1000"></div>
                  <Building2 className="w-24 h-24 sm:w-32 sm:h-32 text-white/50 relative z-10 group-hover:scale-110 group-hover:text-white/70 transition-all duration-700" />
                </div>

                <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-12 flex flex-col justify-center bg-white">
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <span className="bg-[#ebf3f5] text-[#1f8898] text-[10px] sm:text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg">
                      {featuredPost.category}
                    </span>
                  </div>
                  
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-4 group-hover:text-[#1f8898] transition-colors leading-tight">
                    {featuredPost.title}
                  </h2>
                  <p className="text-sm sm:text-base md:text-lg text-gray-500 font-medium leading-relaxed mb-6 sm:mb-8">
                    {featuredPost.excerpt}
                  </p>

                  <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 font-bold border border-gray-100">
                        <User className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-gray-900">{featuredPost.author}</p>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-500 font-medium mt-0.5">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {featuredPost.date}</span>
                          <span className="text-gray-300">•</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {featuredPost.readTime}</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#ebf3f5] text-[#1f8898] flex items-center justify-center group-hover:bg-[#1f8898] group-hover:text-white transition-colors shrink-0">
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </div>
                </div>

              </div>
            </Link>
          </section>
        )}

        {/* --- BLOG POSTS GRID --- */}
        <section className={`animate-in fade-in slide-in-from-bottom-8 duration-700 ${activeCategory !== 'all' ? 'pt-8' : 'delay-100'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredPosts.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-black text-gray-900">No articles found</h3>
                <p className="text-gray-500 font-medium mt-2">Check back soon for more content in this category.</p>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.id}`} className="group flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-[#1f8898]/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden">

                  <div className="h-48 w-full bg-gray-50 relative overflow-hidden flex items-center justify-center border-b border-gray-50">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 group-hover:scale-105 transition-transform duration-700"></div>
                    <Building2 className="w-10 h-10 text-gray-300 relative z-10 group-hover:text-[#1f8898]/40 transition-colors duration-300" />
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-gray-900 text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-sm">
                      {post.category}
                    </div>
                  </div>

                  <div className="p-6 sm:p-8 flex flex-col flex-1">
                    <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-3 group-hover:text-[#1f8898] transition-colors leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed mb-6 flex-1">
                      {post.excerpt}
                    </p>

                    <div className="mt-auto pt-5 border-t border-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gray-400" /> {post.date}</span>
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-bold text-[#1f8898] bg-[#ebf3f5] px-2.5 py-1.5 rounded-md flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> {post.readTime}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* --- NEWSLETTER LEAD CAPTURE --- */}
        <section className="max-w-5xl mx-auto mt-20 sm:mt-32 mb-10">
          <div className="bg-gray-900 rounded-3xl sm:rounded-[3rem] p-8 sm:p-12 md:p-16 text-center border border-gray-800 shadow-2xl shadow-gray-900/20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 md:gap-10 text-left">
            <div className="absolute top-0 right-0 w-64 h-64 sm:w-[400px] sm:h-[400px] bg-gradient-to-bl from-[#1f8898]/30 to-transparent rounded-full blur-3xl pointer-events-none -mt-32 -mr-32"></div>

            <div className="flex-1 relative z-10 text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight mb-3 sm:mb-4">Never miss an update.</h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-400 font-medium mb-0 leading-relaxed">
                Join thousands of Kenyan property managers receiving our weekly insights on real estate automation and market trends.
              </p>
            </div>

            <div className="w-full md:w-[400px] relative z-10">
              <form className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your work email"
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl pl-11 sm:pl-12 pr-4 py-3 sm:py-4 outline-none focus:ring-2 focus:ring-[#1f8898] transition-all font-medium text-sm sm:text-base"
                  />
                </div>
                <button type="button" className="bg-[#1f8898] hover:bg-[#1a7684] text-white px-6 py-3 sm:py-4 rounded-xl font-bold transition-all shadow-lg active:scale-95 whitespace-nowrap text-sm sm:text-base flex items-center justify-center">
                  Subscribe
                </button>
              </form>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-3 text-center md:text-left">No spam. Unsubscribe at any time.</p>
            </div>
          </div>
        </section>

      </main>

      <Footer />

    </div>
  );
}