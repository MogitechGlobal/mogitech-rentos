// apps/web/app/blog/page.tsx
'use client';

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight, Building2, Globe, Home,
  Calendar, Clock, User, Mail, BookOpen, ArrowLeft
} from "lucide-react";
import Footer from "@/components/Footer";

// --- Mock Data: Blog Categories & Posts ---
const categories = [
  { id: 'all', label: 'All Articles' },
  { id: 'management', label: 'Property Management' },
  { id: 'finance', label: 'Finance & M-Pesa' },
  { id: 'tech', label: 'PropTech & Software' },
  { id: 'market', label: 'Local Market Insights' }
];

const featuredPost = {
  id: 'featured-1',
  title: "The 2026 Guide to Real Estate Automation in East Africa",
  excerpt: "Discover how top agencies in Nairobi and beyond are abandoning Excel spreadsheets and leveraging cloud-based ERPs to scale their portfolios effortlessly.",
  category: "PropTech & Software",
  categoryId: "tech",
  author: "Mogitech Research",
  date: "April 2, 2026",
  readTime: "8 min read",
  imageGradient: "from-[#1f8898] to-[#135a65]"
};

const blogPosts = [
  {
    id: 1,
    title: "Top 5 Ways to Reduce Tenant Turnover in Nairobi",
    excerpt: "High turnover eats into your ROI. Learn actionable strategies to keep your best tenants happy, from automated maintenance to seamless rent payments.",
    category: "Property Management",
    categoryId: "management",
    author: "Faith Wanjiku",
    date: "March 28, 2026",
    readTime: "5 min read",
  },
  {
    id: 2,
    title: "How to Handle Late Rent Payments Legally and Effectively",
    excerpt: "Navigating arrears can be tricky. Here is a step-by-step guide to automating late fees and sending compliant eviction notices.",
    category: "Finance & M-Pesa",
    categoryId: "finance",
    author: "Legal Team",
    date: "March 20, 2026",
    readTime: "6 min read",
  },
  {
    id: 3,
    title: "Why M-Pesa Paybill Integration is Crucial for Modern Landlords",
    excerpt: "Manual reconciliation is dead. See how direct STK pushes and automated ledgers are transforming rent collection in Kenya.",
    category: "Finance & M-Pesa",
    categoryId: "finance",
    author: "Peter Kamau",
    date: "March 15, 2026",
    readTime: "4 min read",
  },
  {
    id: 4,
    title: "Understanding the New Housing Policies in Kenya",
    excerpt: "A breakdown of recent legislative changes and what they mean for property developers, landlords, and property management agencies.",
    category: "Local Market Insights",
    categoryId: "market",
    author: "Mogitech Research",
    date: "March 10, 2026",
    readTime: "10 min read",
  },
  {
    id: 5,
    title: "The Hidden ROI of Automated Maintenance Ticketing",
    excerpt: "Stop managing repairs via WhatsApp. Discover how a centralized vendor and maintenance hub protects your asset values.",
    category: "Property Management",
    categoryId: "management",
    author: "Sarah Omondi",
    date: "March 5, 2026",
    readTime: "5 min read",
  },
  {
    id: 6,
    title: "Moving from Excel to a Property Management ERP",
    excerpt: "The definitive checklist for migrating your tenant data and financial ledgers to a cloud-based system without losing a single record.",
    category: "PropTech & Software",
    categoryId: "tech",
    author: "Tech Implementations",
    date: "February 28, 2026",
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

      {/* --- STANDARDIZED PUBLIC NAVBAR (Matches Marketplace) --- */}
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

      {/* --- OVERLAPPING GRADIENT HERO --- */}
      <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-6 pt-16 pb-32 md:pt-20 md:pb-40 relative overflow-hidden shadow-inner">
        {/* Abstract Background Blurs */}
        <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-0 bottom-0 w-[500px] h-[500px] bg-[#ffffff]/5 rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3"></div>

        <div className="relative z-10 max-w-7xl mx-auto text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl mx-auto md:mx-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-100 text-xs font-bold uppercase tracking-widest mb-4 border border-white/20 backdrop-blur-sm shadow-sm mx-auto md:mx-0">
                <BookOpen className="w-3.5 h-3.5" /> Learning Hub
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#ffffff] tracking-tight mb-4 leading-tight">
              Resources & <span className="text-teal-200">Insights.</span>
            </h1>
            <p className="text-teal-100/90 text-sm md:text-base lg:text-lg font-medium leading-relaxed">
              Expert advice, industry trends, and actionable strategies to help you scale your property management business.
            </p>
          </div>

          {/* Interactive Category Filters */}
          <div className="flex flex-wrap justify-center md:justify-end gap-2 max-w-md">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-[11px] sm:text-xs font-bold transition-all backdrop-blur-md ${
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

      <main className="flex-1 w-full relative z-20 -mt-16 md:-mt-24 max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        
        {/* --- FEATURED POST (Pulls up into the Hero) --- */}
        {activeCategory === 'all' && (
          <section className="mb-12 md:mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <Link href={`/blog/${featuredPost.id}`} className="group block">
              <div className="bg-[#ffffff] rounded-3xl sm:rounded-[2.5rem] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden flex flex-col md:flex-row transition-all duration-500 hover:shadow-2xl hover:shadow-[#1f8898]/20 hover:-translate-y-1">

                {/* Left Side: Abstract Image Cover */}
                <div className={`w-full md:w-1/2 min-h-[250px] md:min-h-[400px] bg-gradient-to-br ${featuredPost.imageGradient} relative overflow-hidden flex items-center justify-center p-8 sm:p-10`}>
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
                  <div className="absolute w-64 h-64 bg-white/20 rounded-full blur-3xl -top-10 -left-10 group-hover:scale-150 transition-transform duration-1000"></div>
                  <Building2 className="w-24 h-24 sm:w-32 sm:h-32 text-white/50 relative z-10 group-hover:scale-110 group-hover:text-white/70 transition-all duration-700" />
                </div>

                {/* Right Side: Content */}
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

                  {/* Abstract Card Image Placeholder */}
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
            {/* Dark Mode Background Effect */}
            <div className="absolute top-0 right-0 w-64 h-64 sm:w-[400px] sm:h-[400px] bg-gradient-to-bl from-[#1f8898]/30 to-transparent rounded-full blur-3xl pointer-events-none -mt-32 -mr-32"></div>

            <div className="flex-1 relative z-10 text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight mb-3 sm:mb-4">Never miss an update.</h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-400 font-medium mb-0 leading-relaxed">
                Join 5,000+ property managers receiving our weekly insights on real estate automation and market trends.
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