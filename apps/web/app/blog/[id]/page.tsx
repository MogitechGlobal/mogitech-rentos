// apps/web/app/blog/[id]/page.tsx
'use client';
export const runtime = 'edge';

import { useParams } from "next/navigation";
import Link from "next/link";
import {
    Building2, Globe, ArrowLeft, Calendar,
    Clock, User, ArrowRight, Share2, Facebook, Twitter, Linkedin, MessageCircle
} from "lucide-react";
import Footer from "@/components/Footer";

// --- Unified Mock Data (Includes Content) ---
const allPosts = [
    {
        id: 'featured-1',
        title: "The 2026 Guide to Real Estate Automation in East Africa",
        category: "PropTech & Software",
        author: "Mogitech Research",
        date: "April 2, 2026",
        readTime: "8 min read",
        content: `
      <p>The property management landscape in East Africa is undergoing a massive transformation. For decades, landlords and agencies relied heavily on manual ledger books, Excel spreadsheets, and endless WhatsApp threads to manage their portfolios. In 2026, this approach is no longer just inefficient—it's actively costing businesses money.</p>
      
      <h3>The End of the Excel Era</h3>
      <p>As portfolios grow, tracking M-Pesa payments, generating physical receipts, and manually reconciling bank statements becomes a logistical nightmare. Top agencies in Nairobi and Kigali are now abandoning these legacy systems in favor of cloud-based ERPs (Enterprise Resource Planning software) tailored specifically for real estate.</p>
      
      <h3>Why Automation is Winning</h3>
      <p>Automation isn't just about saving time; it's about accuracy and tenant satisfaction. Modern systems offer:</p>
      <ul>
        <li><strong>Automated Rent Reconciliation:</strong> Direct integration with M-Pesa Paybills automatically matches incoming payments to specific tenant units.</li>
        <li><strong>Instant Invoicing:</strong> Invoices for rent, water, and garbage are generated and emailed/SMS'd automatically on the 1st of every month.</li>
        <li><strong>Centralized Maintenance:</strong> Tenants can log tickets with photos, and managers can assign vendors in one click.</li>
      </ul>
      
      <p>The transition to platforms like MogiRentOS is proving that the future of real estate is digital. Those who adapt are scaling their portfolios with half the administrative overhead of their competitors.</p>
    `
    },
    {
        id: '1',
        title: "Top 5 Ways to Reduce Tenant Turnover in Nairobi",
        category: "Property Management",
        author: "Faith Wanjiku",
        date: "March 28, 2026",
        readTime: "5 min read",
        content: `
      <p>Tenant turnover is one of the hidden killers of real estate ROI. Every time a unit sits empty, you aren't just losing rent—you're paying out of pocket for cleaning, repainting, and marketing.</p>
      <h3>1. Proactive Maintenance</h3>
      <p>The number one reason tenants leave is unresolved maintenance issues. Implementing a portal where tenants can track the status of their repair requests builds trust.</p>
      <h3>2. Seamless Payment Options</h3>
      <p>Nobody wants to walk to the bank to deposit rent anymore. Offering seamless, integrated M-Pesa or card payments directly through a tenant portal drastically improves their experience.</p>
      <p>Keep your best tenants happy, and they will stay for years.</p>
    `
    },
    {
        id: '2',
        title: "How to Handle Late Rent Payments Legally and Effectively",
        category: "Finance & M-Pesa",
        author: "Legal Team",
        date: "March 20, 2026",
        readTime: "6 min read",
        content: `
      <p>Handling late payments is the most stressful part of being a property manager. However, having a strict, automated system removes the emotion and legal risk from the equation.</p>
      <p>Ensure your leases clearly state the grace period and the exact late fee penalties. Use an ERP to automatically trigger late fee invoices on day 6, ensuring total compliance and consistency across your portfolio.</p>
    `
    }
];

export default function BlogPostPage() {
    const params = useParams();
    const postId = params.id as string;

    // Find the post that matches the URL ID
    const post = allPosts.find(p => p.id === postId);

    // If the post doesn't exist in our mock data, show a 404 state
    if (!post) {
        return (
            <div className="min-h-screen bg-[#f8fafb] flex flex-col font-sans">
                <nav className="bg-white border-b border-gray-100 py-4 px-6 sticky top-0 z-50 shadow-sm">
                    <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">
                        <Link href="/" className="flex items-center gap-2 shrink-0 group">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#1f8898] to-[#135a65] rounded-lg flex items-center justify-center text-white shadow-md">
                                <Building2 className="w-4 h-4" />
                            </div>
                            <span className="text-xl font-black text-gray-900 tracking-tight leading-none">
                                Mogi<span className="text-[#1f8898]">RentOS</span>
                            </span>
                        </Link>
                    </div>
                </nav>
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <h1 className="text-6xl font-black text-gray-200 mb-4">404</h1>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Article not found</h2>
                    <p className="text-gray-500 mb-6">The article you are looking for doesn't exist or has been moved.</p>
                    <Link href="/blog" className="bg-[#1f8898] hover:bg-[#1a7684] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md inline-flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back to Blog
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafb] font-sans selection:bg-[#1f8898]/30 flex flex-col">

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

            {/* --- ARTICLE HEADER HERO --- */}
            <div className="bg-gradient-to-br from-[#0d393f] to-[#0a2c31] px-6 pt-12 pb-24 md:pt-16 md:pb-32 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>

                <div className="max-w-3xl mx-auto relative z-10">
                    <Link href="/blog" className="inline-flex items-center gap-2 text-teal-200 hover:text-white font-bold text-sm mb-8 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Resources
                    </Link>

                    <div className="mb-6">
                        <span className="bg-[#1f8898] text-white text-[10px] sm:text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg">
                            {post.category}
                        </span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-8 leading-tight">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 border-t border-white/10 pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-teal-100 font-bold">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">{post.author}</p>
                                <div className="flex items-center gap-2 text-[11px] text-teal-200/70 font-medium">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date}</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-white/10 hidden sm:block"></div>
                        <span className="text-[11px] font-bold text-teal-100 bg-white/5 border border-white/10 px-3 py-1.5 rounded-md flex items-center gap-1.5">
                            <Clock className="w-3 h-3" /> {post.readTime}
                        </span>
                    </div>
                </div>
            </div>

            {/* --- ARTICLE BODY --- */}
            <main className="flex-1 w-full relative z-20 -mt-12 max-w-3xl mx-auto px-4 sm:px-6 pb-20">
                <article className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-gray-100 p-6 sm:p-10 md:p-14 text-gray-700 leading-relaxed">
                    {/* Injecting HTML content for the mock blog post.
            In production, this would be sanitized content from a rich text editor or CMS.
          */}
                    <div
                        className="prose prose-lg prose-teal max-w-none 
              prose-headings:font-black prose-headings:tracking-tight prose-headings:text-gray-900 
              prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
              prose-p:text-gray-600 prose-p:mb-6 prose-p:text-base sm:prose-p:text-lg
              prose-a:text-[#1f8898] hover:prose-a:text-[#156a77]
              prose-strong:text-gray-900
              prose-ul:list-disc prose-ul:pl-6 prose-li:mb-2 prose-li:text-gray-600"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    {/* Social Share Footer */}
                    <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-sm font-bold text-gray-500 flex items-center gap-2">
                            <Share2 className="w-4 h-4" /> Share this article
                        </span>
                        <div className="flex gap-2">
                            <button className="w-10 h-10 rounded-full bg-gray-50 hover:bg-[#1DA1F2] hover:text-white text-gray-400 flex items-center justify-center transition-colors">
                                <Twitter className="w-4 h-4" />
                            </button>
                            <button className="w-10 h-10 rounded-full bg-gray-50 hover:bg-[#25D366] hover:text-white text-gray-400 flex items-center justify-center transition-colors">
                                <Globe className="w-4 h-4" />
                            </button>
                            <button className="w-10 h-10 rounded-full bg-gray-50 hover:bg-[#25D366] hover:text-white text-gray-400 flex items-center justify-center transition-colors">
                                <MessageCircle className="w-4 h-4" />
                            </button>
                            <button className="w-10 h-10 rounded-full bg-gray-50 hover:bg-[#0A66C2] hover:text-white text-gray-400 flex items-center justify-center transition-colors">
                                <Linkedin className="w-4 h-4" />
                            </button>
                            <button className="w-10 h-10 rounded-full bg-gray-50 hover:bg-[#1877F2] hover:text-white text-gray-400 flex items-center justify-center transition-colors">
                                <Facebook className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </article>
            </main>

            <Footer />
        </div>
    );
}