// apps/web/app/blog/BlogHubClient.tsx
'use client';

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight, Building2, Search, Calendar, Clock, User, Mail, BookOpen, Sparkles, ShieldCheck, Users, Home, TrendingUp
} from "lucide-react";
import { blogCategories, blogPosts, popularSearches, BlogPost } from "./blogData";
import { toast } from "sonner";

export default function BlogHubClient() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAudience, setSelectedAudience] = useState<"all" | "tenant" | "landlord" | "agent">("all");

  const featuredArticle = blogPosts.find(p => p.featured) || blogPosts[0];
  const trendingArticles = blogPosts.filter(p => p.trending);

  const filteredPosts = useMemo(() => {
    return blogPosts.filter(post => {
      const matchesCategory = activeCategory === 'all' || post.categoryId === activeCategory;
      const matchesAudience = selectedAudience === 'all' || post.audience === selectedAudience || post.audience === 'general';
      const matchesSearch = searchQuery === '' || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesAudience && matchesSearch;
    });
  }, [activeCategory, selectedAudience, searchQuery]);

  const tenantArticles = blogPosts.filter(p => p.audience === 'tenant');
  const landlordArticles = blogPosts.filter(p => p.audience === 'landlord');

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pb-24">
      
      {/* --- ARTICLE SEARCH BAR --- */}
      <div className="max-w-2xl mx-auto -mt-6 mb-12 relative z-30">
        <div className="bg-white p-2.5 rounded-2xl shadow-xl shadow-black/5 border border-white/20 flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400 ml-3 shrink-0" />
          <input
            type="text"
            placeholder="Search property insights (e.g., Kilimani rent, M-Pesa, software)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent outline-none text-sm sm:text-base font-bold text-gray-900 placeholder:text-gray-400 py-2"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-xs font-bold text-gray-400 hover:text-gray-700 px-3 py-1 bg-gray-100 rounded-lg">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* --- AUDIENCE SEGMENTATION CARDS --- */}
      <section className="mb-16">
        <div className="text-center mb-8">
          <h2 className="text-xs font-black text-[#1f8898] uppercase tracking-[0.2em] mb-2">Audience Hub</h2>
          <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">What are you looking for?</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* House Hunters Card */}
          <div 
            onClick={() => setSelectedAudience(selectedAudience === 'tenant' ? 'all' : 'tenant')}
            className={`cursor-pointer group p-8 rounded-3xl border transition-all duration-300 flex flex-col justify-between ${
              selectedAudience === 'tenant' 
                ? 'bg-[#0e363c] border-[#0e363c] text-white shadow-xl' 
                : 'bg-white border-gray-200/80 hover:border-[#1f8898]/40 hover:shadow-lg'
            }`}
          >
            <div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 font-bold shadow-sm ${selectedAudience === 'tenant' ? 'bg-[#1f8898] text-white' : 'bg-[#ebf3f5] text-[#1f8898]'}`}>
                <Home className="w-6 h-6" />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${selectedAudience === 'tenant' ? 'text-teal-300' : 'text-[#1f8898]'}`}>House Hunters</span>
              <h4 className={`text-2xl font-black tracking-tight mt-1 mb-3 ${selectedAudience === 'tenant' ? 'text-white' : 'text-gray-900'}`}>Find your next home</h4>
              <p className={`text-sm font-medium leading-relaxed mb-6 ${selectedAudience === 'tenant' ? 'text-teal-100/80' : 'text-gray-500'}`}>
                Practical guides covering houses to rent, apartments, neighborhood comparisons, pricing trends, viewing checklists, and tenant rights across Kenya.
              </p>
            </div>
            <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${selectedAudience === 'tenant' ? 'text-teal-200' : 'text-[#1f8898]'}`}>
              {selectedAudience === 'tenant' ? 'Showing House Hunter Guides' : 'Explore House Hunting Guides'} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Landlords & Professionals Card */}
          <div 
            onClick={() => setSelectedAudience(selectedAudience === 'landlord' ? 'all' : 'landlord')}
            className={`cursor-pointer group p-8 rounded-3xl border transition-all duration-300 flex flex-col justify-between ${
              selectedAudience === 'landlord' 
                ? 'bg-[#0e363c] border-[#0e363c] text-white shadow-xl' 
                : 'bg-white border-gray-200/80 hover:border-[#1f8898]/40 hover:shadow-lg'
            }`}
          >
            <div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 font-bold shadow-sm ${selectedAudience === 'landlord' ? 'bg-[#1f8898] text-white' : 'bg-[#ebf3f5] text-[#1f8898]'}`}>
                <Users className="w-6 h-6" />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${selectedAudience === 'landlord' ? 'text-teal-300' : 'text-[#1f8898]'}`}>Landlords & Property Professionals</span>
              <h4 className={`text-2xl font-black tracking-tight mt-1 mb-3 ${selectedAudience === 'landlord' ? 'text-white' : 'text-gray-900'}`}>Manage your properties smarter</h4>
              <p className={`text-sm font-medium leading-relaxed mb-6 ${selectedAudience === 'landlord' ? 'text-teal-100/80' : 'text-gray-500'}`}>
                Expert strategies for automated M-Pesa rent collection, arrears tracking, lease automation, maintenance dispatching, and property management software.
              </p>
            </div>
            <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${selectedAudience === 'landlord' ? 'text-teal-200' : 'text-[#1f8898]'}`}>
              {selectedAudience === 'landlord' ? 'Showing Management Guides' : 'Explore Property Management Guides'} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* --- POPULAR SEARCHES --- */}
      <section className="mb-16 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Popular Property Searches</h2>
        <div className="flex flex-wrap gap-2.5">
          {popularSearches.map((term, i) => (
            <Link
              key={i}
              href={`/marketplace?search=${encodeURIComponent(term)}`}
              className="bg-gray-50 hover:bg-[#ebf3f5] text-gray-700 hover:text-[#1f8898] border border-gray-200/60 px-4 py-2 rounded-xl text-xs font-bold transition-all"
            >
              {term}
            </Link>
          ))}
        </div>
      </section>

      {/* --- CATEGORY FILTERS --- */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
        {blogCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeCategory === cat.id
                ? 'bg-[#1f8898] text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-[#1f8898] hover:text-[#1f8898]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* --- FEATURED ARTICLE SECTION --- */}
      {activeCategory === 'all' && !searchQuery && selectedAudience === 'all' && featuredArticle && (
        <section className="mb-20 animate-in fade-in duration-700">
          <Link href={`/blog/${featuredArticle.slug}`} className="group block">
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden flex flex-col md:flex-row transition-all duration-500 hover:shadow-2xl hover:shadow-[#1f8898]/20 hover:-translate-y-1">
              
              <div className="w-full md:w-1/2 min-h-[300px] md:min-h-[420px] relative overflow-hidden bg-gray-100">
                <img 
                  src={featuredArticle.image} 
                  alt={featuredArticle.imageAlt} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 absolute inset-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent md:hidden"></div>
              </div>

              <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-[#ebf3f5] text-[#1f8898] text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg">
                    Featured Insight
                  </span>
                  <span className="text-xs font-bold text-gray-400">• {featuredArticle.category}</span>
                </div>
                
                <h2 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight mb-4 group-hover:text-[#1f8898] transition-colors leading-tight">
                  {featuredArticle.title}
                </h2>
                <p className="text-sm md:text-base text-gray-500 font-medium leading-relaxed mb-8">
                  {featuredArticle.excerpt}
                </p>

                <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{featuredArticle.author}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mt-0.5">
                        <span>{featuredArticle.datePublished}</span>
                        <span>•</span>
                        <span>{featuredArticle.readTime}</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#ebf3f5] text-[#1f8898] flex items-center justify-center group-hover:bg-[#1f8898] group-hover:text-white transition-colors shrink-0">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>

            </div>
          </Link>
        </section>
      )}

      {/* --- TRENDING NOW SECTION --- */}
      {activeCategory === 'all' && !searchQuery && selectedAudience === 'all' && (
        <section className="mb-20">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-xs font-black text-[#1f8898] uppercase tracking-[0.2em] mb-1">Most Read</h2>
              <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Trending Now</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trendingArticles.slice(0, 3).map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                <div className="h-48 w-full relative overflow-hidden bg-gray-100">
                  <img src={post.image} alt={post.imageAlt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <span className="text-[10px] font-black text-[#1f8898] uppercase tracking-widest mb-2">{post.category}</span>
                  <h4 className="text-lg font-black text-gray-900 mb-2 group-hover:text-[#1f8898] transition-colors leading-snug">{post.title}</h4>
                  <p className="text-xs text-gray-500 font-medium line-clamp-2 mb-6">{post.excerpt}</p>
                  <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400 font-bold">
                    <span>{post.readTime}</span>
                    <span className="text-[#1f8898] flex items-center gap-1 group-hover:translate-x-1 transition-transform">Read guide <ArrowRight className="w-3.5 h-3.5" /></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* --- HOUSE HUNTER CONTENT SECTION --- */}
      {activeCategory === 'all' && !searchQuery && (selectedAudience === 'all' || selectedAudience === 'tenant') && (
        <section className="mb-20">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-xs font-black text-[#1f8898] uppercase tracking-[0.2em] mb-1">For Tenants</h2>
              <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Find a Home</h3>
              <p className="text-sm text-gray-500 font-medium mt-1">Everything you need to make a smarter rental decision.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenantArticles.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                <div className="h-48 w-full relative overflow-hidden bg-gray-100">
                  <img src={post.image} alt={post.imageAlt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <span className="text-[10px] font-black text-[#1f8898] uppercase tracking-widest mb-2">{post.category}</span>
                  <h4 className="text-lg font-black text-gray-900 mb-2 group-hover:text-[#1f8898] transition-colors leading-snug">{post.title}</h4>
                  <p className="text-xs text-gray-500 font-medium line-clamp-2 mb-6">{post.excerpt}</p>
                  <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400 font-bold">
                    <span>{post.readTime}</span>
                    <span className="text-[#1f8898] flex items-center gap-1 group-hover:translate-x-1 transition-transform">Read guide <ArrowRight className="w-3.5 h-3.5" /></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Contextual Mogirent CTA for Tenants */}
          <div className="mt-8 bg-gradient-to-r from-[#0e363c] to-[#1f8898] rounded-3xl p-8 sm:p-10 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div>
              <h4 className="text-xl sm:text-2xl font-black tracking-tight mb-2">Looking for your next home?</h4>
              <p className="text-teal-100/90 text-sm font-medium">Explore verified houses and apartments directly from trusted landlords with zero broker fees.</p>
            </div>
            <Link href="/marketplace" className="bg-white text-[#0e363c] hover:bg-teal-50 px-8 py-3.5 rounded-xl font-black text-sm transition-all shadow-lg shrink-0 flex items-center gap-2">
              Find a Property →
            </Link>
          </div>
        </section>
      )}

      {/* --- LANDLORD & PROPERTY MANAGER SECTION --- */}
      {activeCategory === 'all' && !searchQuery && (selectedAudience === 'all' || selectedAudience === 'landlord') && (
        <section className="mb-20">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-xs font-black text-[#1f8898] uppercase tracking-[0.2em] mb-1">For Property Owners</h2>
              <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">For Landlords & Property Managers</h3>
              <p className="text-sm text-gray-500 font-medium mt-1">Practical strategies for collecting rent, managing tenants and protecting your property investment.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {landlordArticles.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                <div className="h-48 w-full relative overflow-hidden bg-gray-100">
                  <img src={post.image} alt={post.imageAlt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <span className="text-[10px] font-black text-[#1f8898] uppercase tracking-widest mb-2">{post.category}</span>
                  <h4 className="text-lg font-black text-gray-900 mb-2 group-hover:text-[#1f8898] transition-colors leading-snug">{post.title}</h4>
                  <p className="text-xs text-gray-500 font-medium line-clamp-2 mb-6">{post.excerpt}</p>
                  <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400 font-bold">
                    <span>{post.readTime}</span>
                    <span className="text-[#1f8898] flex items-center gap-1 group-hover:translate-x-1 transition-transform">Read guide <ArrowRight className="w-3.5 h-3.5" /></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Contextual Mogirent CTA for Landlords */}
          <div className="mt-8 bg-white rounded-3xl p-8 sm:p-10 border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div>
              <h4 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mb-2">Managing multiple rental properties?</h4>
              <p className="text-gray-600 text-sm font-medium">Stop relying on spreadsheets and manual rent tracking. Automate M-Pesa collections and tenant records with Mogirent.</p>
            </div>
            <Link href="/pricing" className="bg-[#0e363c] hover:bg-[#1f8898] text-white px-8 py-3.5 rounded-xl font-black text-sm transition-all shadow-lg shrink-0 flex items-center gap-2">
              Explore Mogirent →
            </Link>
          </div>
        </section>
      )}

      {/* --- ALL / FILTERED POSTS GRID --- */}
      {(activeCategory !== 'all' || searchQuery || selectedAudience !== 'all') && (
        <section className="mb-20">
          <div className="mb-8">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">
              {searchQuery ? `Search Results for "${searchQuery}"` : 'Filtered Articles'} ({filteredPosts.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.length === 0 ? (
              <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h4 className="text-lg font-black text-gray-900">No articles matched your criteria</h4>
                <p className="text-sm text-gray-500 mt-1">Try adjusting your search terms or clearing filters.</p>
                <button onClick={() => { setActiveCategory('all'); setSearchQuery(''); setSelectedAudience('all'); }} className="mt-4 text-[#1f8898] font-bold text-sm underline">
                  Reset All Filters
                </button>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                  <div className="h-48 w-full relative overflow-hidden bg-gray-100">
                    <img src={post.image} alt={post.imageAlt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <span className="text-[10px] font-black text-[#1f8898] uppercase tracking-widest mb-2">{post.category}</span>
                    <h4 className="text-lg font-black text-gray-900 mb-2 group-hover:text-[#1f8898] transition-colors leading-snug">{post.title}</h4>
                    <p className="text-xs text-gray-500 font-medium line-clamp-2 mb-6">{post.excerpt}</p>
                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400 font-bold">
                      <span>{post.readTime}</span>
                      <span className="text-[#1f8898] flex items-center gap-1 group-hover:translate-x-1 transition-transform">Read guide <ArrowRight className="w-3.5 h-3.5" /></span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      )}

      {/* --- KENYA PROPERTY MARKET REPORT CALLOUT --- */}
      <section className="mb-20 bg-gradient-to-br from-[#135a65] to-[#0e363c] rounded-[2.5rem] p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-2xl relative z-10">
          <span className="bg-white/10 text-teal-200 text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-lg inline-block mb-4">
            Market Intelligence
          </span>
          <h3 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">Kenya Rental Market Report 2026</h3>
          <p className="text-teal-50/90 text-sm sm:text-base font-medium leading-relaxed mb-8">
            Rental demand, price trajectories, yield analysis, and neighborhood migration patterns across Nairobi, Kiambu, Mombasa, Nakuru, and Kisumu.
          </p>
          <Link href="/blog/kenya-rental-market-report-2026" className="inline-flex items-center gap-2 bg-white text-[#0e363c] hover:bg-teal-50 px-8 py-4 rounded-xl font-black text-sm transition-all shadow-lg active:scale-95">
            Read the 2026 Market Report →
          </Link>
        </div>
      </section>

      {/* --- NEWSLETTER SECTION --- */}
      <section className="max-w-4xl mx-auto">
        <div className="bg-gray-900 rounded-3xl sm:rounded-[3rem] p-8 sm:p-12 text-center border border-gray-800 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 text-left">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#1f8898]/20 rounded-full blur-3xl pointer-events-none -mt-32 -mr-32"></div>

          <div className="flex-1 relative z-10 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">Stay ahead of Kenya's property market.</h3>
            <p className="text-sm text-gray-400 font-medium leading-relaxed">
              Get practical rental insights, market updates and property management tips delivered to your inbox.
            </p>
          </div>

          <div className="w-full md:w-[380px] relative z-10">
            <form onSubmit={(e) => { e.preventDefault(); toast.success("Subscribed successfully!"); }} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="Your email address"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl pl-11 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-[#1f8898] transition-all font-medium text-sm"
                />
              </div>
              <button type="submit" className="bg-[#1f8898] hover:bg-[#1a7684] text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg active:scale-95 whitespace-nowrap text-sm">
                Subscribe
              </button>
            </form>
            <p className="text-[10px] text-gray-500 mt-2 text-center md:text-left">No spam. Unsubscribe at any time.</p>
          </div>
        </div>
      </section>

    </div>
  );   
}