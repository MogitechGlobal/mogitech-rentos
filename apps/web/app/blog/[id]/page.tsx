// apps/web/app/blog/[id]/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  ArrowLeft, Calendar, Clock, User, Sparkles, MapPin, Building2, CheckCircle2, ArrowRight 
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getPostById, getRelatedPosts, blogPosts } from "../blogData";
import { ReadingProgress, ArticleToc, ArticleShare, ArticleCTA, ArticleFAQ } from "./ArticleComponents";

interface PageProps {
  params: Promise<{ id: string }>;
}

// --- DYNAMIC SEO METADATA ---
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const post = getPostById(resolvedParams.id);

  if (!post) {
    return {
      title: "Article Not Found | MogiRent Property Hub",
      description: "The article you are looking for does not exist or has been moved."
    };
  }

  const siteUrl = "https://mogirent.co.ke";
  const canonicalUrl = `${siteUrl}/blog/${post.slug}`;

  return {
    title: `${post.title} | MogiRent Property Hub`,
    description: post.excerpt,
    keywords: post.keywords?.join(", ") || "property management Kenya, houses to rent in Nairobi, M-Pesa rent collection",
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: canonicalUrl,
      type: "article",
      publishedTime: post.dateModified || post.datePublished,
      authors: [post.author],
      images: [
        {
          url: post.socialImage || post.image,
          width: 1200,
          height: 630,
          alt: post.imageAlt,
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.socialImage || post.image],
    }
  };
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    id: post.id,
  }));
}

export default async function BlogPostPage({ params }: PageProps) {
  const resolvedParams = await params;
  const post = getPostById(resolvedParams.id);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(post, 3);
  const siteUrl = "https://mogirent.co.ke";
  const canonicalUrl = `${siteUrl}/blog/${post.slug}`;

  // --- JSON-LD STRUCTURED DATA ---
  const jsonLdArticle = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.image,
    "datePublished": post.datePublished,
    "dateModified": post.dateModified || post.datePublished,
    "author": {
      "@type": "Organization",
      "name": post.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "MogiRent",
      "url": siteUrl
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    }
  };

  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": siteUrl },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${siteUrl}/blog` },
      { "@type": "ListItem", "position": 3, "name": post.category, "item": `${siteUrl}/blog` },
      { "@type": "ListItem", "position": 4, "name": post.title, "item": canonicalUrl }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />

      <div className="min-h-screen bg-[#fcfdfd] font-sans selection:bg-[#1f8898]/20 flex flex-col text-gray-800">
        <ReadingProgress />
        <Navbar />

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
          
          {/* --- BREADCRUMBS --- */}
          <nav aria-label="Breadcrumb" className="mb-6 text-xs font-bold text-gray-400 flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-2">
            <Link href="/" className="hover:text-[#1f8898] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-[#1f8898] transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-gray-600">{post.category}</span>
          </nav>

          {/* --- ARTICLE HEADER --- */}
          <header className="mb-10 md:mb-12 max-w-4xl mx-auto text-left">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 bg-[#ebf3f5] text-[#1f8898] text-[11px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-[#1f8898]/10">
                <Sparkles className="w-3 h-3 text-[#1f8898]" /> {post.category}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight mb-6 leading-[1.1]">
              {post.title}
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 font-medium leading-relaxed mb-8">
              {post.excerpt}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1f8898] to-[#135a65] text-white flex items-center justify-center font-bold shadow-md shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900">{post.author}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mt-0.5">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-gray-400" /> Published: {post.datePublished}</span>
                    {post.dateModified && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span>Updated: {post.dateModified}</span>
                      </>
                    )}
                    <span className="text-gray-300">•</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-gray-400" /> {post.readTime}</span>
                  </div>
                </div>
              </div>

              <ArticleShare title={post.title} excerpt={post.excerpt} />
            </div>
          </header>

          {/* --- FEATURED HERO IMAGE --- */}
          <div className="max-w-4xl mx-auto mb-12 rounded-[2.5rem] overflow-hidden shadow-lg relative h-[320px] sm:h-[450px] bg-gray-100">
            <img 
              src={post.image} 
              alt={post.imageAlt} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* --- MAIN LAYOUT GRID (SIDEBAR TOC + CONTENT) --- */}
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Desktop Sticky Table of Contents Sidebar */}
            <aside className="hidden lg:block lg:col-span-4 sticky top-28 space-y-6">
              <ArticleToc />

              {/* Quick Conversion Widget */}
              <div className="bg-[#0e363c] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#1f8898]/20 rounded-full blur-2xl"></div>
                <h4 className="font-black text-lg mb-2 relative z-10">Streamline Property in Kenya</h4>
                <p className="text-teal-100/80 text-xs font-medium mb-6 relative z-10 leading-relaxed">Automate M-Pesa collection and tenant ledgers with Mogirent.</p>
                <Link href="/pricing" className="block text-center bg-white text-[#0e363c] hover:bg-teal-50 py-3 rounded-xl font-black text-xs transition-all uppercase tracking-wider relative z-10">
                  Explore Mogirent →
                </Link>
              </div>
            </aside>

            {/* Article Body Content */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Mobile Table of Contents */}
              <div className="block lg:hidden">
                <ArticleToc />
              </div>

              {/* Key Takeaways Box */}
              {post.keyTakeaways && post.keyTakeaways.length > 0 && (
                <div className="bg-[#ebf3f5]/60 border border-[#1f8898]/20 rounded-3xl p-6 sm:p-8 shadow-inner">
                  <h3 className="text-xs font-black text-[#1f8898] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#1f8898]" /> Key Takeaways
                  </h3>
                  <ul className="space-y-3">
                    {post.keyTakeaways.map((takeaway, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm sm:text-base font-bold text-gray-800 leading-snug">
                        <span className="text-[#1f8898] font-black">•</span> {takeaway}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Article Content Prose */}
              <article
                className="prose prose-lg prose-teal max-w-none 
                    prose-headings:font-black prose-headings:tracking-tight prose-headings:text-gray-900 
                    prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:mt-10 prose-h2:mb-4
                    prose-h3:text-xl sm:prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3
                    prose-p:text-gray-600 prose-p:mb-6 prose-p:leading-[1.8] prose-p:text-base sm:prose-p:text-[1.125rem]
                    prose-a:text-[#1f8898] hover:prose-a:text-[#156a77] prose-a:font-bold
                    prose-strong:text-gray-900 prose-strong:font-black
                    prose-ul:list-disc prose-ul:pl-6 prose-li:mb-2.5 prose-li:text-gray-600 prose-li:font-medium
                    bg-white p-6 sm:p-10 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)]"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* --- AUDIENCE-AWARE CONVERSION CTA --- */}
              <ArticleCTA audience={post.audience} />

              {/* --- FAQ SECTION --- */}
              {post.faq && post.faq.length > 0 && (
                <ArticleFAQ faq={post.faq} />
              )}

              {/* --- AUTHOR BIO BLOCK --- */}
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1f8898] to-[#135a65] text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Written By</span>
                  <h4 className="text-lg font-black text-gray-900">{post.author}</h4>
                  <p className="text-xs text-gray-500 font-medium mt-1">
                    Dedicated property technology and rental market research team focusing on Kenyan real estate automation, compliance, and tenant workflows.
                  </p>
                </div>
              </div>

              {/* --- RELATED ARTICLES --- */}
              {relatedPosts.length > 0 && (
                <section className="pt-10 border-t border-gray-100">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-6">Continue Reading</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {relatedPosts.map(rel => (
                      <Link key={rel.id} href={`/blog/${rel.slug}`} className="group flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                        <div className="h-36 w-full relative overflow-hidden bg-gray-100">
                          <img src={rel.image} alt={rel.imageAlt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                          <span className="text-[9px] font-black text-[#1f8898] uppercase tracking-widest mb-1.5">{rel.category}</span>
                          <h4 className="text-sm font-black text-gray-900 mb-2 group-hover:text-[#1f8898] transition-colors leading-snug line-clamp-2">{rel.title}</h4>
                          <span className="mt-auto text-[11px] text-gray-400 font-bold">{rel.readTime}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

            </div>
          </div>

        </main>

        <Footer />
      </div>
    </>
  );
}