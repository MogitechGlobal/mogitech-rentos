// apps/web/components/Navbar.tsx
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Building2, Menu, X, ChevronDown, 
  BookOpen, HelpCircle, Phone, Search, Users, 
  CreditCard, Wrench, LayoutDashboard, MessageCircle, Home, Tag, ArrowRight
} from "lucide-react";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  
  // --- AUTHENTICATION STATE ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [dashboardUrl, setDashboardUrl] = useState('/login');
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem('user_role');
    const hasLease = localStorage.getItem('has_active_lease') === 'true';

    if (role) {
      setIsLoggedIn(true);
      setUserRole(role);
      
      if (role === 'LANDLORD' || role === 'MANAGER' || role === 'STAFF') {
        setDashboardUrl('/dashboard');
      } else if (role === 'TENANT' && hasLease) {
        setDashboardUrl('/portal');
      } else if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
        setDashboardUrl('/super-admin/login');
      } else {
        setDashboardUrl('/hunter');
      }
    }
    setIsLoadingAuth(false);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  const isActive = (path: string) => pathname === path;

  const handleRestrictedNavigation = (e: React.MouseEvent, destination: string) => {
    if (!isLoggedIn) {
      e.preventDefault();
      router.push('/login');
      return;
    }
    
    if (userRole === 'USER' || userRole === 'HUNTER' || userRole === 'TENANT') {
      e.preventDefault();
      router.push(dashboardUrl);
    } else {
      e.preventDefault();
      router.push(destination);
    }
  };

  return (
    <>
      <header 
        className={`fixed top-0 z-50 w-full transition-all duration-200 bg-white ${
          scrolled ? 'border-b border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)]' : 'border-b border-gray-100/50'
        }`}
      >
        <div className="mx-auto flex h-[64px] lg:h-[72px] max-w-[1400px] items-center justify-between px-6 lg:px-8">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer shrink-0 outline-none rounded-lg" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#0f4952] to-[#1f8898] text-[#ffffff] shadow-sm group-hover:shadow-md transition-shadow">
              <Building2 className="h-[18px] w-[18px]" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-black tracking-tight text-[#0f172a]">
              MogiRent
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-9 text-[14px] font-[600] text-gray-600">
            <Link 
              href="/marketplace" 
              className={`transition-colors py-2 flex items-center gap-1.5 relative ${isActive('/marketplace') ? 'text-[#0f4952]' : 'hover:text-[#1f8898]'}`}
            >
              Find a Home
              {isActive('/marketplace') && <span className="absolute -bottom-[26px] left-0 right-0 h-[3px] rounded-t-full bg-[#0f4952]"></span>}
            </Link>

            {/* Property Management Dropdown */}
            <div className="relative group py-6 -my-6">
              <button className={`flex items-center gap-1.5 transition-colors outline-none relative hover:text-[#1f8898] ${pathname.startsWith('/dashboard') ? 'text-[#0f4952]' : ''}`}>
                Property Management <ChevronDown className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-200" />
                {pathname.startsWith('/dashboard') && <span className="absolute -bottom-[26px] left-0 right-0 h-[3px] rounded-t-full bg-[#0f4952]"></span>}
              </button>
              
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[340px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0">
                <div className="bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 p-3 flex flex-col">
                  <div className="px-3 py-3 mb-2 bg-gray-50 rounded-xl border border-gray-100/50">
                    <p className="text-[11px] font-black uppercase tracking-widest text-[#0f4952] mb-1.5">Manage Your Properties</p>
                    <p className="text-[13px] text-gray-500 font-medium leading-snug">Run your entire rental operations securely from one unified workspace.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-1 px-1">
                    <a href="/dashboard" onClick={(e) => handleRestrictedNavigation(e, '/dashboard')} className="px-3 py-2.5 rounded-xl hover:bg-[#ebf3f5] transition-colors flex items-center gap-2.5 text-[13px] hover:text-[#0f4952] cursor-pointer">
                        <Building2 className="w-4 h-4 text-[#1f8898]" /> Properties
                    </a>
                    <a href="/dashboard" onClick={(e) => handleRestrictedNavigation(e, '/dashboard')} className="px-3 py-2.5 rounded-xl hover:bg-[#ebf3f5] transition-colors flex items-center gap-2.5 text-[13px] hover:text-[#0f4952] cursor-pointer">
                        <Users className="w-4 h-4 text-[#1f8898]" /> Tenants
                    </a>
                    <a href="/dashboard" onClick={(e) => handleRestrictedNavigation(e, '/dashboard')} className="px-3 py-2.5 rounded-xl hover:bg-[#ebf3f5] transition-colors flex items-center gap-2.5 text-[13px] hover:text-[#0f4952] cursor-pointer">
                        <CreditCard className="w-4 h-4 text-[#1f8898]" /> Rent
                    </a>
                    <a href="/dashboard" onClick={(e) => handleRestrictedNavigation(e, '/dashboard')} className="px-3 py-2.5 rounded-xl hover:bg-[#ebf3f5] transition-colors flex items-center gap-2.5 text-[13px] hover:text-[#0f4952] cursor-pointer">
                        <Wrench className="w-4 h-4 text-[#1f8898]" /> Maintenance
                    </a>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-50 px-1">
                    <Link href="/register" className="flex items-center justify-between w-full bg-[#0f4952] hover:bg-[#1f8898] text-white px-4 py-3 rounded-xl text-[13px] font-bold transition-all shadow-sm group/btn">
                      Start Managing <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Resources Dropdown */}
            <div className="relative group py-6 -my-6">
              <button className="flex items-center gap-1.5 transition-colors outline-none hover:text-[#1f8898]">
                Resources <ChevronDown className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-200" />
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[280px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0">
                <div className="bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 p-2 flex flex-col text-gray-700">
                  <Link href="/blog" className="px-4 py-3 rounded-xl hover:bg-[#ebf3f5] transition-colors flex items-start gap-3 group/link">
                    <BookOpen className="w-[18px] h-[18px] text-[#1f8898] shrink-0 mt-0.5" /> 
                    <div>
                      <p className="font-bold text-[14px] text-gray-900 leading-none mb-1.5 group-hover/link:text-[#0f4952]">Blog</p>
                      <p className="text-[12px] font-medium text-gray-500 leading-tight">PropTech insights and practical guides</p>
                    </div>
                  </Link>
                  <Link href="/faq" className="px-4 py-3 rounded-xl hover:bg-[#ebf3f5] transition-colors flex items-start gap-3 group/link">
                    <HelpCircle className="w-[18px] h-[18px] text-[#1f8898] shrink-0 mt-0.5" /> 
                    <div>
                      <p className="font-bold text-[14px] text-gray-900 leading-none mb-1.5 group-hover/link:text-[#0f4952]">FAQ</p>
                      <p className="text-[12px] font-medium text-gray-500 leading-tight">Answers about MogiRent capabilities</p>
                    </div>
                  </Link>
                  <Link href="/contact" className="px-4 py-3 rounded-xl hover:bg-[#ebf3f5] transition-colors flex items-start gap-3 group/link">
                    <Phone className="w-[18px] h-[18px] text-[#1f8898] shrink-0 mt-0.5" /> 
                    <div>
                      <p className="font-bold text-[14px] text-gray-900 leading-none mb-1.5 group-hover/link:text-[#0f4952]">Help & Support</p>
                      <p className="text-[12px] font-medium text-gray-500 leading-tight">Get assistance with the platform</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            <Link 
              href="/pricing" 
              className={`transition-colors py-2 flex items-center gap-1.5 relative ${isActive('/pricing') ? 'text-[#0f4952]' : 'hover:text-[#1f8898]'}`}
            >
              Pricing
              {isActive('/pricing') && <span className="absolute -bottom-[26px] left-0 right-0 h-[3px] rounded-t-full bg-[#0f4952]"></span>}
            </Link>

          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            {isLoadingAuth ? (
              <div className="w-32 h-10 bg-gray-100 animate-pulse rounded-xl"></div>
            ) : isLoggedIn ? (
              <Link href={dashboardUrl} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-[14px] font-bold transition-all bg-[#0f4952] text-white hover:bg-[#1f8898] whitespace-nowrap shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95">
                <LayoutDashboard className="w-[18px] h-[18px]" strokeWidth={2.5} /> Go to Workspace
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-[14px] font-bold text-gray-600 hover:text-[#0f4952] hover:bg-gray-50 rounded-xl transition-colors px-4 py-2.5 whitespace-nowrap">
                  Sign In
                </Link>
                <Link href="/register" className="inline-flex h-11 items-center justify-center rounded-xl px-6 text-[14px] font-bold transition-all bg-[#0f4952] text-white hover:bg-[#1f8898] whitespace-nowrap shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 -mr-2 rounded-xl text-gray-800 hover:bg-gray-100 transition-colors focus:outline-none"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open Navigation Menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      <div className="h-[64px] lg:h-[72px] w-full shrink-0 bg-transparent"></div>

      {/* --- MODERN SLIDE-OUT MOBILE SIDEBAR MENU --- */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-xs lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div 
        className={`fixed top-0 right-0 bottom-0 z-[100] w-[300px] sm:w-[360px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-6 h-[72px] border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0f4952] text-white">
              <Building2 className="h-4 w-4" />
            </div>
            <span className="font-black text-lg text-gray-900 tracking-tight">MogiRent</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-full transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Scrollable Links */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 custom-scrollbar">
          
          {/* Section: Explore */}
          <div>
            <p className="px-3 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Marketplace</p>
            <Link 
              href="/marketplace" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-gray-800 hover:bg-[#ebf3f5] hover:text-[#0f4952] transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#1f8898] flex items-center justify-center shrink-0">
                <Search className="w-4 h-4" />
              </div>
              <span>Find a Home</span>
            </Link>
          </div>

          {/* Section: Management */}
          <div>
            <p className="px-3 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Property Management</p>
            <div className="space-y-1">
              <a href="/dashboard" onClick={(e) => { handleRestrictedNavigation(e, '/dashboard'); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                <Building2 className="w-4 h-4 text-gray-400 shrink-0" /> Properties & Units
              </a>
              <a href="/dashboard" onClick={(e) => { handleRestrictedNavigation(e, '/dashboard'); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                <Users className="w-4 h-4 text-gray-400 shrink-0" /> Tenants Directory
              </a>
              <a href="/dashboard" onClick={(e) => { handleRestrictedNavigation(e, '/dashboard'); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                <CreditCard className="w-4 h-4 text-gray-400 shrink-0" /> Rent & Collections
              </a>
              <a href="/dashboard" onClick={(e) => { handleRestrictedNavigation(e, '/dashboard'); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                <Wrench className="w-4 h-4 text-gray-400 shrink-0" /> Maintenance Logs
              </a>
            </div>
          </div>

          {/* Section: Company & Resources */}
          <div>
            <p className="px-3 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Platform</p>
            <div className="space-y-1">
              <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                <Tag className="w-4 h-4 text-gray-400 shrink-0" /> Pricing Plans
              </Link>
              <Link href="/blog" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                <BookOpen className="w-4 h-4 text-gray-400 shrink-0" /> PropTech Blog
              </Link>
              <Link href="/faq" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                <HelpCircle className="w-4 h-4 text-gray-400 shrink-0" /> Help & FAQ
              </Link>
            </div>
          </div>

        </div>

        {/* Sidebar Footer CTA */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col gap-3 shrink-0">
          {isLoadingAuth ? (
            <div className="h-12 bg-gray-200 animate-pulse rounded-xl w-full"></div>
          ) : isLoggedIn ? (
            <Link 
              href={dashboardUrl} 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="flex w-full items-center justify-center gap-2 h-12 text-sm font-bold text-white bg-[#0f4952] rounded-xl shadow-md transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" /> Go to Workspace
            </Link>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link 
                href="/login" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="flex items-center justify-center h-11 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/register" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="flex items-center justify-center h-11 text-sm font-bold text-white bg-[#0f4952] rounded-xl shadow-md transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}

          <div className="pt-2 flex items-center justify-center gap-2 text-xs font-bold text-gray-500">
            <span>Need help?</span>
            <a 
              href="https://wa.me/254768569357?text=Hi,%20I%20would%20like%20to%20learn%20more%20about%20MogiRent."
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#25D366] hover:underline flex items-center gap-1"
            >
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </>
  );
}