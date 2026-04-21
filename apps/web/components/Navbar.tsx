// apps/web/components/Navbar.tsx
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Building2, ArrowRight, Menu, X, ChevronRight, 
  Map, ChevronDown, BookOpen, HelpCircle, Users, Phone 
} from "lucide-react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Handle the scroll effect for the glassmorphic background
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* --- DESKTOP & HEADER NAVIGATION --- */}
      <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-sm' : 'bg-transparent'}`}>
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer shrink-0" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1f8898] to-[#135a65] text-[#ffffff] shadow-lg shadow-[#1f8898]/20 group-hover:scale-105 transition-transform duration-300">
              <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-tight text-gray-900">
              Mogi<span className="text-[#1f8898]">RentOS</span>
            </span>
          </Link>

          {/* Desktop Nav Links (Responsive fluid gaps: lg to xl) */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-8 text-sm font-bold text-gray-600 z-[100]">
            <Link href="/#showcase" className="hover:text-[#1f8898] transition-colors whitespace-nowrap">Platform</Link>
            <Link href="/marketplace" className={`transition-colors whitespace-nowrap ${pathname === '/marketplace' ? 'text-[#1f8898]' : 'hover:text-[#1f8898]'}`}>Marketplace</Link>
            <Link href="/pricing" className={`transition-colors whitespace-nowrap ${pathname === '/pricing' ? 'text-[#1f8898]' : 'hover:text-[#1f8898]'}`}>Pricing</Link>
            
            {/* RESOURCES DROPDOWN */}
            <div className="relative group py-6 -my-6">
                <button className="flex items-center gap-1 hover:text-[#1f8898] transition-colors outline-none whitespace-nowrap">
                    Resources <ChevronDown className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-300" />
                </button>
                <div className="absolute top-[80%] left-1/2 -translate-x-1/2 pt-4 w-52 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <div className="bg-white rounded-2xl shadow-xl shadow-black/10 border border-gray-100 flex flex-col p-2 relative">
                        {/* Invisible bridge to prevent hover loss */}
                        <div className="absolute -top-4 left-0 right-0 h-4 bg-transparent"></div>
                        
                        <Link href="/blog" className={`px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-3 ${pathname === '/blog' ? 'text-[#1f8898] bg-[#ebf3f5]' : 'text-gray-700 hover:text-[#1f8898]'}`}>
                            <BookOpen className="w-4 h-4 text-gray-400" /> PropTech Blog
                        </Link>
                        <Link href="/faq" className={`px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-3 ${pathname === '/faq' ? 'text-[#1f8898] bg-[#ebf3f5]' : 'text-gray-700 hover:text-[#1f8898]'}`}>
                            <HelpCircle className="w-4 h-4 text-gray-400" /> Help & FAQ
                        </Link>
                    </div>
                </div>
            </div>

            {/* COMPANY DROPDOWN */}
            <div className="relative group py-6 -my-6">
                <button className="flex items-center gap-1 hover:text-[#1f8898] transition-colors outline-none whitespace-nowrap">
                    Company <ChevronDown className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-300" />
                </button>
                <div className="absolute top-[80%] left-1/2 -translate-x-1/2 pt-4 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <div className="bg-white rounded-2xl shadow-xl shadow-black/10 border border-gray-100 flex flex-col p-2 relative">
                        <div className="absolute -top-4 left-0 right-0 h-4 bg-transparent"></div>
                        
                        <Link href="/about" className={`px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-3 ${pathname === '/about' ? 'text-[#1f8898] bg-[#ebf3f5]' : 'text-gray-700 hover:text-[#1f8898]'}`}>
                            <Building2 className="w-4 h-4 text-gray-400" /> About Mogitech
                        </Link>
                        <Link href="/customers" className={`px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-3 ${pathname === '/customers' ? 'text-[#1f8898] bg-[#ebf3f5]' : 'text-gray-700 hover:text-[#1f8898]'}`}>
                            <Users className="w-4 h-4 text-gray-400" /> Our Customers
                        </Link>
                        <Link href="/contact" className={`px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-3 ${pathname === '/contact' ? 'text-[#1f8898] bg-[#ebf3f5]' : 'text-gray-700 hover:text-[#1f8898]'}`}>
                            <Phone className="w-4 h-4 text-gray-400" /> Contact Sales
                        </Link>
                    </div>
                </div>
            </div>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-4 shrink-0">
            <Link href="/login" className="text-sm font-bold text-gray-600 hover:text-[#1f8898] transition-colors px-3 xl:px-4 py-2 whitespace-nowrap">
              Sign In
            </Link>
            <Link href="/register" className="inline-flex h-11 items-center justify-center rounded-xl bg-gray-900 px-5 xl:px-6 text-sm font-bold text-[#ffffff] shadow-lg transition-all hover:bg-[#1f8898] hover:shadow-[#1f8898]/30 hover:-translate-y-0.5 whitespace-nowrap">
              Start Free Trial <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Hamburger Trigger (Visible below 1024px) */}
          <button
            className="lg:hidden p-2 text-gray-900 hover:bg-gray-100 rounded-xl transition-colors z-50 shrink-0"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* --- MOBILE SIDE DRAWER MENU --- */}
      
      {/* Blurred Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-[60] bg-gray-900/40 backdrop-blur-sm lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sliding Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 z-[70] w-[85%] max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
          {/* Drawer Header */}
          <div className="flex items-center justify-between h-20 px-5 border-b border-gray-100 shrink-0">
            <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#1f8898] to-[#135a65] text-[#ffffff] shadow-md">
                <Building2 className="h-4 w-4" />
              </div>
              <span className="text-lg font-black tracking-tight text-gray-900">
                Mogi<span className="text-[#1f8898]">RentOS</span>
              </span>
            </Link>
            <button 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Drawer Scrollable Links */}
          <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1 custom-scrollbar">
            
            <Link href="/#showcase" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2.5 text-[15px] font-bold text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors">
              Platform
            </Link>
            
            <Link href="/marketplace" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-2 px-3 py-2.5 text-[15px] font-bold rounded-xl transition-colors ${pathname === '/marketplace' ? 'text-[#1f8898] bg-[#ebf3f5]' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'}`}>
              Marketplace
            </Link>
            
            <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center justify-between px-3 py-2.5 text-[15px] font-bold rounded-xl transition-colors ${pathname === '/pricing' ? 'text-[#1f8898] bg-[#ebf3f5]' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'}`}>
              Pricing
            </Link>

            <div className="h-px bg-gray-100 my-1 mx-3"></div>

            {/* Resources Mobile Accordion */}
            <details className="group [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between px-3 py-2.5 text-[15px] font-bold text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer list-none select-none">
                <span>Resources</span>
                <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="flex flex-col gap-0.5 pl-3 pr-2 py-1">
                <Link href="/blog" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 text-sm font-bold rounded-xl transition-colors ${pathname === '/blog' ? 'text-[#1f8898] bg-[#ebf3f5]' : 'text-gray-600 hover:text-[#1f8898] hover:bg-gray-50'}`}>
                  <BookOpen className="w-4 h-4 text-gray-400" /> PropTech Blog
                </Link>
                <Link href="/faq" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 text-sm font-bold rounded-xl transition-colors ${pathname === '/faq' ? 'text-[#1f8898] bg-[#ebf3f5]' : 'text-gray-600 hover:text-[#1f8898] hover:bg-gray-50'}`}>
                  <HelpCircle className="w-4 h-4 text-gray-400" /> Help & FAQ
                </Link>
              </div>
            </details>

            {/* Company Mobile Accordion */}
            <details className="group [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between px-3 py-2.5 text-[15px] font-bold text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer list-none select-none">
                <span>Company</span>
                <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="flex flex-col gap-0.5 pl-3 pr-2 py-1">
                <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 text-sm font-bold rounded-xl transition-colors ${pathname === '/about' ? 'text-[#1f8898] bg-[#ebf3f5]' : 'text-gray-600 hover:text-[#1f8898] hover:bg-gray-50'}`}>
                  <Building2 className="w-4 h-4 text-gray-400" /> About Mogitech
                </Link>
                <Link href="/customers" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 text-sm font-bold rounded-xl transition-colors ${pathname === '/customers' ? 'text-[#1f8898] bg-[#ebf3f5]' : 'text-gray-600 hover:text-[#1f8898] hover:bg-gray-50'}`}>
                  <Users className="w-4 h-4 text-gray-400" /> Our Customers
                </Link>
                <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 text-sm font-bold rounded-xl transition-colors ${pathname === '/contact' ? 'text-[#1f8898] bg-[#ebf3f5]' : 'text-gray-600 hover:text-[#1f8898] hover:bg-gray-50'}`}>
                  <Phone className="w-4 h-4 text-gray-400" /> Contact Sales
                </Link>
              </div>
            </details>
          </div>

          {/* Drawer Anchored Footer (Auth) */}
          <div className="p-5 border-t border-gray-100 bg-gray-50 shrink-0">
            <div className="flex flex-col gap-2.5">
              <Link 
                href="/login" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="flex w-full items-center justify-center px-4 py-3 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/register" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white bg-gray-900 hover:bg-[#1f8898] rounded-xl shadow-md transition-colors"
              >
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
      </div>

      {/* Spacer to prevent content from hiding behind the fixed header on inner pages */}
      {pathname !== '/' && <div className="h-20 w-full shrink-0"></div>}
    </>
  );
}