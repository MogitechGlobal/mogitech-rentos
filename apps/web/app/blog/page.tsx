// apps/web/app/blog/page.tsx
import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogHubClient from "./BlogHubClient";
import { blogCategories } from "./blogData";

export const metadata: Metadata = {
  title: "Property Insights & Rental Guides for Kenya | MogiRent Hub",
  description: "Practical property guides, rental market insights, and technology tips for tenants, landlords, property managers, and real estate professionals in Kenya.",
  keywords: "houses to rent in Nairobi, apartments to rent in Nairobi, property management software Kenya, M-Pesa rent collection, Kenya rental market",
  openGraph: {
    title: "Property Insights & Rental Guides for Kenya | MogiRent Hub",
    description: "Practical property guides, rental market insights, and technology tips for tenants and landlords in Kenya.",
    url: "https://mogirent.co.ke/blog",
    type: "website",
    images: [{ url: "https://mogirent.co.ke/og-blog.jpg", width: 1200, height: 630, alt: "MogiRent Property Knowledge Hub" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Property Insights & Rental Guides for Kenya | MogiRent Hub",
    description: "Practical property guides, rental market insights, and technology tips for tenants and landlords in Kenya."
  }
};

const jsonLdBlog = {
  "@context": "https://schema.org",
  "@type": "Blog",
  "name": "MogiRent Property Knowledge Hub",
  "url": "https://mogirent.co.ke/blog",
  "description": "Practical property guides, rental market insights, and technology tips for tenants and landlords in Kenya.",
  "publisher": {
    "@type": "Organization",
    "name": "MogiRent",
    "url": "https://mogirent.co.ke"
  }
};

export default function BlogPage() {
  return (
    <>
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBlog) }} 
      />

      <div className="min-h-screen bg-[#f8fafb] font-sans selection:bg-[#1f8898]/30 flex flex-col">
        {/* --- NAVBAR --- */}
        <Navbar />

        {/* --- REDUCED MINIMAL LIGHT HERO SECTION --- */}
        <div className="bg-[#f8fafb] px-6 pt-12 pb-8 md:pt-16 md:pb-10 border-b border-gray-200/60">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1f8898]/10 text-[#1f8898] text-[10px] sm:text-xs font-black uppercase tracking-widest mb-3 border border-[#1f8898]/20 shadow-sm">
              PROPERTY INSIGHTS FOR KENYA
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-3 leading-[1.15]">
              Find a home. Understand the market. <br className="hidden sm:block" />
              <span className="text-[#1f8898]">Manage property smarter.</span>
            </h1>
            <p className="text-gray-600 text-sm sm:text-base font-medium max-w-2xl mx-auto leading-relaxed">
              Practical property guides, rental market insights and technology tips for tenants, landlords, property managers and real estate professionals in Kenya.
            </p>
          </div>
        </div>

        {/* --- INTERACTIVE CLIENT HUB (SEARCH, FILTERS, SECTIONS) --- */}
        <BlogHubClient />

        {/* --- FOOTER --- */}
        <Footer />
      </div>
    </>
  );
}