// apps/web/app/blog/[id]/page.tsx
'use client';
export const runtime = 'edge';

import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
    Building2, Globe, ArrowLeft, Calendar,
    Clock, User, ArrowRight, Share2, Facebook, Twitter, Linkedin, MessageCircle
} from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

// --- Unified Mock Data (Matching the exact SEO slugs from the main blog page) ---
const allPosts = [
    {
        id: 'automate-mpesa-rent-collection',
        title: "How to Automate M-Pesa Rent Collection for Multiple Properties in 2026",
        category: "Finance & M-Pesa",
        author: "Mogitech Research",
        date: "April 20, 2026",
        readTime: "8 min read",
        excerpt: "Stop hunting for transaction codes. Discover how modern Kenyan landlords are using zero-touch STK pushes and auto-reconciled ledgers to collect rent faster.",
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
        id: 'legal-guide-digital-lease-kenya',
        title: "The Legal Guide to Digital Lease Agreements in Kenya",
        category: "PropTech & Software",
        author: "Legal Team",
        date: "April 15, 2026",
        readTime: "6 min read",
        excerpt: "Navigating digital contracts can be confusing. Learn what makes an e-signature legally binding for your next tenant lease under Kenyan law.",
        content: `
      <p>Navigating digital contracts can be confusing. However, under the Kenya Information and Communications Act, electronic signatures hold the same legal weight as wet-ink signatures, provided certain conditions are met.</p>
      <h3>Making E-Signatures Binding</h3>
      <p>When drafting leases on MogiRentOS, ensure that the tenant's intent to sign is captured clearly. The platform automatically logs IP addresses and timestamps to create a verifiable digital audit trail, ensuring your lease is fully compliant and enforceable in the Rent Restriction Tribunal.</p>
    `
    },
    {
        id: 'top-reasons-tenants-pay-late',
        title: "Top 5 Reasons Your Tenants Are Paying Late (And How to Fix It)",
        category: "Property Management",
        author: "Faith Wanjiku",
        date: "April 10, 2026",
        readTime: "5 min read",
        excerpt: "Stop chasing arrears. Discover the psychological and systemic reasons behind late rent, and the automated SMS reminder tools to solve them.",
        content: `
      <p>Tenant turnover and late payments are the hidden killers of real estate ROI. Every time a unit sits empty or a payment is delayed, you lose money.</p>
      <h3>1. Lack of Payment Options</h3>
      <p>Nobody wants to walk to the bank to deposit rent anymore. Offering seamless, integrated M-Pesa or card payments directly through a tenant portal drastically improves on-time payments.</p>
      <h3>2. Forgetting the Due Date</h3>
      <p>People get busy. Implementing an automated SMS and Email reminder system that triggers 3 days before rent is due can reduce late payments by up to 40%.</p>
    `
    },
    {
        id: 'excel-vs-property-software',
        title: "Excel vs. Property Management Software: When is it time to upgrade?",
        category: "PropTech & Software",
        author: "Peter Kamau",
        date: "April 5, 2026",
        readTime: "7 min read",
        excerpt: "Spreadsheets work until they don't. Here are the 5 undeniable signs your real estate portfolio has outgrown manual tracking and needs an ERP.",
        content: `
      <p>Spreadsheets work great when you have 2 or 3 units. But once you cross the 10-unit threshold, Excel becomes a liability.</p>
      <p>If you spend more than 5 hours a month manually cross-referencing bank statements with tenant lists to figure out who hasn't paid, you are losing money. It's time to upgrade to a centralized ERP.</p>
    `
    },
    {
        id: 'handle-tenant-maintenance-requests',
        title: "How to Handle Tenant Maintenance Requests Without Losing Your Mind",
        category: "Property Management",
        author: "Sarah Omondi",
        date: "March 28, 2026",
        readTime: "5 min read",
        excerpt: "Streamline your repair workflows. Learn how to digitize tenant requests, dispatch vendors quickly, and protect your overall asset value.",
        content: `
      <p>Midnight calls about a broken pipe are every landlord's nightmare. Centralizing your maintenance tracking is the key to preserving your peace of mind and your asset's value.</p>
      <p>By forcing tenants to log tickets through a portal, you can require photo evidence, assign priority levels, and dispatch vendors instantly without playing phone tag.</p>
    `
    },
    {
        id: 'commercial-vs-residential-nairobi',
        title: "A Guide to Managing Commercial vs. Residential Properties in Nairobi",
        category: "Local Market Insights",
        author: "Mogitech Research",
        date: "March 22, 2026",
        readTime: "8 min read",
        excerpt: "Different tenant types require radically different strategies. Explore the operational and billing nuances of mixed-use property management.",
        content: `
      <p>Commercial leases are fundamentally different from residential ones. In commercial spaces, you are often dealing with VAT, service charge calculations, and longer lease terms with escalation clauses.</p>
      <p>Ensure your management software can handle dynamic billing to automatically calculate and apply these specific commercial fees on top of base rent.</p>
    `
    },
    {
        id: 'chamas-financial-transparency',
        title: "How Real Estate Chamas Can Improve Financial Transparency",
        category: "Finance & M-Pesa",
        author: "Investment Team",
        date: "March 15, 2026",
        readTime: "6 min read",
        excerpt: "Trust is everything in an investment group. Learn how cloud ledgers and automated reporting can eliminate disputes and track member contributions.",
        content: `
      <p>Trust is the foundation of every successful investment group or Chama. Disorganized ledgers lead to disputes and dissolved partnerships.</p>
      <p>By adopting a cloud-based ERP, every member of the Chama can have read-only access to view live rent rolls, occupancy rates, and expense reports, ensuring 100% transparency.</p>
    `
    },
    {
        id: 'kenya-rent-restriction-act',
        title: "Understanding the Kenya Rent Restriction Act: A Landlord's Guide",
        category: "Local Market Insights",
        author: "Legal Team",
        date: "March 8, 2026",
        readTime: "9 min read",
        excerpt: "Stay compliant and avoid costly tribunal disputes. A simplified breakdown of Kenyan rental laws and eviction protocols every property owner must know.",
        content: `
      <p>The Kenya Rent Restriction Act governs properties with rent below a specific threshold. Attempting to evict a tenant or increase rent without following the tribunal's protocols can result in heavy fines.</p>
      <p>Always maintain a flawless digital record of all notices sent, invoices issued, and communications made, as these will be your primary defense in any legal dispute.</p>
    `
    },
    {
        id: 'market-vacant-units-mogirentos',
        title: "How to Market Your Vacant Units Faster Using the MogiRentOS Marketplace",
        category: "Property Management",
        author: "Growth Team",
        date: "March 1, 2026",
        readTime: "4 min read",
        excerpt: "Reduce your vacancy periods to zero. Leverage our public aggregator to attract verified, high-quality tenants and capture leads instantly.",
        content: `
      <p>Why pay exorbitant marketing fees when your property management software has a built-in marketplace?</p>
      <p>With MogiRentOS, flipping a unit from 'Occupied' to 'Listed' takes one click. Prospective tenants can view high-resolution galleries, filter by amenities, and submit lead inquiries directly into your landlord dashboard.</p>
    `
    },
    {
        id: 'maximizing-roi-tax-deductions',
        title: "Maximizing ROI: Tax Deductions Kenyan Landlords Often Miss",
        category: "Finance & M-Pesa",
        author: "Financial Advisory",
        date: "February 22, 2026",
        readTime: "7 min read",
        excerpt: "Don't leave money on the table. A comprehensive guide to allowable expenses, maintenance write-offs, and tax breaks for Kenyan property investors.",
        content: `
      <p>Don't leave money on the table. Many landlords are unaware of the allowable deductions under Kenyan tax law.</p>
      <p>If you use software to properly categorize your property maintenance expenses, agency management fees, and structural repairs, your accountant can easily offset these against your rental income tax.</p>
    `
    }
];

export default function BlogPostPage() {
    const params = useParams();
    const postId = params.id as string;

    const post = allPosts.find(p => p.id === postId);

    // --- SHARE FUNCTIONALITY LOGIC ---
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const encodedUrl = encodeURIComponent(shareUrl);

    // Fallback strings
    const safeTitle = post ? post.title : '';
    const safeExcerpt = post ? post.excerpt : '';
    const encodedTitle = encodeURIComponent(safeTitle);

    const shareToTwitter = () => window.open(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`, '_blank');
    const shareToFacebook = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank');
    const shareToLinkedIn = () => window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`, '_blank');
    const shareToWhatsApp = () => window.open(`https://api.whatsapp.com/send?text=${encodedTitle} - ${encodedUrl}`, '_blank');

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: safeTitle,
                    text: safeExcerpt,
                    url: shareUrl,
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            navigator.clipboard.writeText(shareUrl);
            toast.success("Link copied to clipboard!");
        }
    };

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
        <div className="min-h-screen bg-[#ffffff] font-sans selection:bg-[#1f8898]/30 flex flex-col">

            {/* --- STANDARDIZED PUBLIC NAVBAR COMPONENT --- */}
            <Navbar />

            {/* --- MINIMALIST ARTICLE STRUCTURE --- */}
            <main className="flex-1 w-full max-w-3xl mx-auto px-6 sm:px-8 py-12 md:py-20">

                {/* Back Link & Category Ribbon */}
                <div className="flex flex-col items-start gap-6 mb-8">
                    <Link href="/blog" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#1f8898] font-bold text-sm transition-colors group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Resources
                    </Link>
                    <span className="text-[#1f8898] text-[11px] sm:text-xs font-black uppercase tracking-widest">
                        {post.category}
                    </span>
                </div>

                {/* Typography Focus: Title */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight mb-8 leading-[1.1]">
                    {post.title}
                </h1>

                {/* Modern Metadata Ribbon */}
                <div className="flex items-center justify-between border-y border-gray-100 py-6 mb-12">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#ebf3f5] flex items-center justify-center text-[#1f8898] font-bold shrink-0">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-base font-bold text-gray-900">{post.author}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mt-0.5">
                                <span>{post.date}</span>
                                <span className="text-gray-300">•</span>
                                <span>{post.readTime}</span>
                            </div>
                        </div>
                    </div>

                    {/* Top Share Button (Desktop Only) */}
                    <button onClick={handleNativeShare} className="hidden sm:flex items-center gap-2 text-gray-400 hover:text-[#1f8898] transition-colors p-2 bg-gray-50 hover:bg-[#ebf3f5] rounded-full">
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>

                {/* Clean Prose Content */}
                <article
                    className="prose prose-lg prose-teal max-w-none 
                        prose-headings:font-black prose-headings:tracking-tight prose-headings:text-gray-900 
                        prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4
                        prose-p:text-gray-600 prose-p:mb-6 prose-p:leading-relaxed prose-p:text-[1.1rem]
                        prose-a:text-[#1f8898] hover:prose-a:text-[#156a77]
                        prose-strong:text-gray-900
                        prose-ul:list-disc prose-ul:pl-6 prose-li:mb-2 prose-li:text-gray-600"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* --- BOTTOM FUNCTIONAL SOCIAL SHARE FOOTER --- */}
                <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <span className="text-base font-bold text-gray-900 flex items-center gap-2">
                        Share this article
                    </span>
                    <div className="flex gap-3">
                        <button onClick={shareToTwitter} title="Share on Twitter / X" className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 hover:border-[#1DA1F2] hover:text-[#1DA1F2] text-gray-400 flex items-center justify-center transition-all shadow-sm hover:shadow-md">
                            <Twitter className="w-5 h-5" />
                        </button>
                        <button onClick={handleNativeShare} title="Copy Link" className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 hover:border-[#1f8898] hover:text-[#1f8898] text-gray-400 flex items-center justify-center transition-all shadow-sm hover:shadow-md">
                            <Globe className="w-5 h-5" />
                        </button>
                        <button onClick={shareToWhatsApp} title="Share on WhatsApp" className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 hover:border-[#25D366] hover:text-[#25D366] text-gray-400 flex items-center justify-center transition-all shadow-sm hover:shadow-md">
                            <MessageCircle className="w-5 h-5" />
                        </button>
                        <button onClick={shareToLinkedIn} title="Share on LinkedIn" className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 hover:border-[#0A66C2] hover:text-[#0A66C2] text-gray-400 flex items-center justify-center transition-all shadow-sm hover:shadow-md">
                            <Linkedin className="w-5 h-5" />
                        </button>
                        <button onClick={shareToFacebook} title="Share on Facebook" className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 hover:border-[#1877F2] hover:text-[#1877F2] text-gray-400 flex items-center justify-center transition-all shadow-sm hover:shadow-md">
                            <Facebook className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}