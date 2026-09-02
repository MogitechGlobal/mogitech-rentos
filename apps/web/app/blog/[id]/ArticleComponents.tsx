// apps/web/app/blog/[id]/ArticleComponents.tsx
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Share2, Facebook, Twitter, Linkedin, MessageCircle, Globe, 
  Check, ArrowRight, Building2, Home, Users, ChevronDown, ChevronUp, Copy, CheckCircle2 
} from "lucide-react";
import { toast } from "sonner";
import { BlogPost, FAQItem } from "../blogData";

// --- 1. READING PROGRESS BAR ---
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const currentScroll = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        setProgress(Number((currentScroll / scrollHeight) * 100));
      }
    };
    window.addEventListener("scroll", updateProgress, { passive: true });
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-transparent z-50">
      <div 
        className="h-full bg-[#1f8898] transition-all duration-150 ease-out" 
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

// --- 2. TABLE OF CONTENTS ---
export function ArticleToc() {
  const [isOpen, setIsOpen] = useState(false);
  const [headings, setHeadings] = useState<{ id: string; text: string; level: string }[]>([]);

  useEffect(() => {
    const articleHeadings = Array.from(document.querySelectorAll("article h2, article h3")).map((elem) => ({
      id: elem.id || elem.textContent?.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-') || '',
      text: elem.textContent || '',
      level: elem.tagName
    }));
    
    // Assign IDs if missing
    document.querySelectorAll("article h2, article h3").forEach((elem, index) => {
      if (!elem.id) {
        elem.id = elem.textContent?.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-') || `heading-${index}`;
      }
    });

    setHeadings(articleHeadings);
  }, []);

  if (headings.length === 0) return null;

  return (
    <nav aria-label="Table of Contents" className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between cursor-pointer md:cursor-default" onClick={() => setIsOpen(!isOpen)}>
        <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">In this guide</h4>
        <button className="md:hidden text-gray-400">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      <ul className={`mt-4 space-y-2.5 text-xs font-bold text-gray-600 ${isOpen ? 'block' : 'hidden md:block'}`}>
        {headings.map((h, i) => (
          <li key={i} className={h.level === 'H3' ? 'pl-3 border-l-2 border-gray-100' : ''}>
            <a 
              href={`#${h.id}`} 
              className="hover:text-[#1f8898] transition-colors block py-1 leading-snug"
              onClick={() => setIsOpen(false)}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// --- 3. ARTICLE SHARE RAIL / BAR (HYDRATION-SAFE) ---
export function ArticleShare({ title, excerpt }: { title: string; excerpt: string }) {
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl || window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text: excerpt, url: shareUrl || window.location.href });
      } catch (err) {}
    } else {
      handleCopy();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button onClick={handleNativeShare} className="p-2.5 rounded-xl bg-gray-50 hover:bg-[#ebf3f5] text-gray-600 hover:text-[#1f8898] border border-gray-200/60 transition-all shadow-sm" title="Share">
        <Share2 className="w-4 h-4" />
      </button>
      <a href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-gray-50 hover:bg-[#1DA1F2]/10 text-gray-600 hover:text-[#1DA1F2] border border-gray-200/60 transition-all shadow-sm" title="Twitter / X">
        <Twitter className="w-4 h-4" />
      </a>
      <a href={`https://api.whatsapp.com/send?text=${encodedTitle}%20-%20${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-gray-50 hover:bg-[#25D366]/10 text-gray-600 hover:text-[#25D366] border border-gray-200/60 transition-all shadow-sm" title="WhatsApp">
        <MessageCircle className="w-4 h-4" />
      </a>
      <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-gray-50 hover:bg-[#0A66C2]/10 text-gray-600 hover:text-[#0A66C2] border border-gray-200/60 transition-all shadow-sm" title="LinkedIn">
        <Linkedin className="w-4 h-4" />
      </a>
      <button onClick={handleCopy} className="p-2.5 rounded-xl bg-gray-50 hover:bg-[#1f8898]/10 text-gray-600 hover:text-[#1f8898] border border-gray-200/60 transition-all shadow-sm" title="Copy Link">
        <Copy className="w-4 h-4" />
      </button>
    </div>
  );
}

// --- 4. AUDIENCE-AWARE CONVERSION CTA ---
export function ArticleCTA({ audience }: { audience: BlogPost['audience'] }) {
  if (audience === 'tenant') {
    return (
      <div className="my-12 bg-gradient-to-r from-[#0e363c] to-[#1f8898] rounded-3xl p-8 sm:p-10 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-teal-200 mb-1 inline-block">Mogirent Marketplace</span>
          <h4 className="text-xl sm:text-2xl font-black tracking-tight mb-2">Looking for your next home?</h4>
          <p className="text-teal-100/90 text-sm font-medium">Explore verified houses and apartments directly from trusted landlords with zero broker fees.</p>
        </div>
        <Link href="/marketplace" className="bg-white text-[#0e363c] hover:bg-teal-50 px-8 py-4 rounded-xl font-black text-sm transition-all shadow-lg shrink-0 flex items-center gap-2">
          Find Your Next Home →
        </Link>
      </div>
    );
  }

  return (
    <div className="my-12 bg-white rounded-3xl p-8 sm:p-10 border border-gray-200/80 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
      <div>
        <span className="text-[10px] font-black uppercase tracking-widest text-[#1f8898] mb-1 inline-block">Property Management System</span>
        <h4 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mb-2">Managing rental properties manually?</h4>
        <p className="text-gray-600 text-sm font-medium">Manage properties, tenants, rent collection, maintenance and reporting from one platform with Mogirent.</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full sm:w-auto">
        <Link href="/pricing" className="bg-[#0e363c] hover:bg-[#1f8898] text-white px-8 py-4 rounded-xl font-black text-sm transition-all shadow-lg text-center">
          Manage Your Properties →
        </Link>
      </div>
    </div>
  );
}

// --- 5. FAQ ACCORDION ---
export function ArticleFAQ({ faq }: { faq: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!faq || faq.length === 0) return null;

  return (
    <section className="my-12">
      <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-6">Frequently Asked Questions</h3>
      <div className="space-y-4">
        {faq.map((item, idx) => (
          <div key={idx} className="border border-gray-200/80 rounded-2xl overflow-hidden bg-white shadow-sm">
            <button 
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
            >
              <span className="font-bold text-gray-900 text-sm sm:text-base">{item.question}</span>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${openIndex === idx ? 'rotate-180' : ''}`} />
            </button>
            {openIndex === idx && (
              <div className="px-6 pb-5 text-sm text-gray-600 font-medium leading-relaxed border-t border-gray-50 pt-3">
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}