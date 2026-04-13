// apps/web/app/blog/page.tsx
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight, Building2, Menu, X, Globe,
  Calendar, Clock, User, ChevronRight, Mail, BookOpen
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredPosts = activeCategory === 'all'
    ? blogPosts
    : blogPosts.filter(post => post.categoryId === activeCategory);

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
            <Link href="/blog" className="text-[#1f8898] transition-colors">Resources</Link>
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
              <Link href="/blog" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black text-[#1f8898]">Resources</Link>
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

        {/* --- BLOG HERO --- */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center rounded-full border border-[#1f8898]/20 bg-[#1f8898]/5 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#1f8898] mb-6 shadow-sm">
                <BookOpen className="w-4 h-4 mr-2" /> Learning Hub
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900 mb-4">
                Resources & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1f8898] to-[#0f4952]">Insights.</span>
              </h1>
              <p className="text-lg text-gray-500 font-medium leading-relaxed max-w-xl">
                Expert advice, industry trends, and actionable strategies to help you scale your property management business.
              </p>
            </div>

            {/* Category Filter Desktop */}
            <div className="hidden lg:flex flex-wrap gap-2 justify-end max-w-md">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeCategory === cat.id
                      ? 'bg-gray-900 text-white shadow-md border border-gray-800'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-[#1f8898]/50 hover:bg-gray-50'
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter Mobile */}
          <div className="flex lg:hidden overflow-x-auto pb-4 gap-2 no-scrollbar mb-8">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${activeCategory === cat.id
                    ? 'bg-gray-900 text-white shadow-md border border-gray-800'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-[#1f8898]/50 hover:bg-gray-50'
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* --- FEATURED POST (Only show if 'all' is selected) --- */}
        {activeCategory === 'all' && (
          <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-20 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            <Link href={`/blog/${featuredPost.id}`} className="group block">
              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden flex flex-col md:flex-row transition-all hover:shadow-2xl hover:shadow-[#1f8898]/10 hover:border-[#1f8898]/30">

                {/* Abstract Image Placeholder for Featured Post */}
                <div className={`w-full md:w-1/2 min-h-[300px] md:min-h-[400px] bg-gradient-to-br ${featuredPost.imageGradient} relative overflow-hidden flex items-center justify-center p-10`}>
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
                  <div className="absolute w-64 h-64 bg-white/10 rounded-full blur-3xl -top-10 -left-10 group-hover:scale-150 transition-transform duration-1000"></div>
                  <Building2 className="w-32 h-32 text-white/50 relative z-10 group-hover:scale-110 transition-transform duration-700" />
                </div>

                <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="bg-[#ebf3f5] text-[#1f8898] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md">
                      {featuredPost.category}
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-4 group-hover:text-[#1f8898] transition-colors leading-tight">
                    {featuredPost.title}
                  </h2>
                  <p className="text-lg text-gray-500 font-medium leading-relaxed mb-8">
                    {featuredPost.excerpt}
                  </p>

                  <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{featuredPost.author}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {featuredPost.date}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {featuredPost.readTime}</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#1f8898] group-hover:text-white transition-colors text-gray-400">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>

              </div>
            </Link>
          </section>
        )}

        {/* --- BLOG POSTS GRID --- */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-32 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-gray-100">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-black text-gray-900">No articles found</h3>
                <p className="text-gray-500 font-medium mt-2">Check back soon for more content in this category.</p>
              </div>
            ) : (
              filteredPosts.map((post, idx) => (
                <Link key={post.id} href={`/blog/${post.id}`} className="group flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-[#1f8898]/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden">

                  {/* Abstract Card Image Placeholder */}
                  <div className={`h-48 w-full bg-gray-100 relative overflow-hidden flex items-center justify-center`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 group-hover:scale-105 transition-transform duration-700"></div>
                    <Building2 className="w-12 h-12 text-gray-300 relative z-10 group-hover:text-[#1f8898]/50 transition-colors duration-300" />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-900 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded shadow-sm">
                      {post.category}
                    </div>
                  </div>

                  <div className="p-8 flex flex-col flex-1">
                    <h3 className="text-xl font-black text-gray-900 mb-3 group-hover:text-[#1f8898] transition-colors leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6 flex-1">
                      {post.excerpt}
                    </p>

                    <div className="mt-auto pt-5 border-t border-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-gray-400" /> {post.date}</span>
                      </div>
                      <span className="text-[11px] font-bold text-[#1f8898] bg-[#ebf3f5] px-2 py-1 rounded flex items-center gap-1">
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
        <section className="max-w-5xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="bg-gray-900 rounded-[3rem] p-10 md:p-16 text-center border border-gray-800 shadow-2xl shadow-gray-900/20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10 text-left">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-[#1f8898]/30 to-transparent rounded-full blur-3xl pointer-events-none -mt-32 -mr-32"></div>

            <div className="flex-1 relative z-10 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">Never miss an update.</h2>
              <p className="text-lg text-gray-400 font-medium mb-0">
                Join 5,000+ property managers receiving our weekly insights on real estate automation, market trends, and legal updates.
              </p>
            </div>

            <div className="w-full md:w-[400px] relative z-10">
              <form className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your work email"
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-[#1f8898] transition-all font-medium"
                  />
                </div>
                <button type="button" className="bg-[#1f8898] hover:bg-[#1a7684] text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg active:scale-95 whitespace-nowrap">
                  Subscribe
                </button>
              </form>
              <p className="text-xs text-gray-500 mt-3 text-center md:text-left">No spam. Unsubscribe at any time.</p>
            </div>
          </div>
        </section>

      </main>

      {/* --- PREMIUM FOOTER --- */}
      <Footer />

    </div>
  );
}