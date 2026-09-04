// apps/web/components/Navbar.tsx
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Building2, ArrowRight, Menu, X, ChevronDown, 
  BookOpen, HelpCircle, Phone, Search, Users, 
  CreditCard, Wrench, LayoutDashboard, MessageCircle
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
      
      // STRICT, BULLETPROOF ROUTING
      if (role === 'LANDLORD' || role === 'MANAGER' || role === 'STAFF') {
        setDashboardUrl('/dashboard');
      } else if (role === 'TENANT' && hasLease) {
        setDashboardUrl('/portal');
      } else if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
        setDashboardUrl('/super-admin/login');
      } else {
        // Defaults USER, HUNTER, and TENANT (without lease) to the House Hunter view
        setDashboardUrl('/hunter');
      }
    }
    setIsLoadingAuth(false);
  }, []);

  // Handle subtle scroll styling
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    handleScroll();
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

  const isActive = (path: string) => pathname === path;

  // Safe navigation handler that prevents unauthorized users from accessing the Landlord Dashboard
  const handleRestrictedNavigation = (e: React.MouseEvent, destination: string) => {
    if (!isLoggedIn) {
      e.preventDefault();
      router.push('/login');
      return;
    }
    
    // If the user is just a hunter or tenant, redirect them to their actual workspace instead of crashing
    if (userRole === 'USER' || userRole === 'HUNTER' || userRole === 'TENANT') {
      e.preventDefault();
      router.push(dashboardUrl);
    }
  };

  return (
    <>
      <header 
        className={`fixed top-0 z-50 w-full transition-all duration-200 bg-white ${
          scrolled ? 'border-b border-[#eef2f3] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]' : 'border-b border-transparent'
        }`}
      >
        <div className="mx-auto flex h-[64px] lg:h-[72px] max-w-[1400px] items-center justify-between px-6 lg:px-8">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer shrink-0" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#0f4952] to-[#1f8898] text-[#ffffff] shadow-sm">
              <Building2 className="h-4 w-4" />
            </div>
            <span className="text-xl font-black tracking-tight text-gray-900">
              MogiRent
            </span>
          </Link>

          {/* Main Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 text-[13px] font-[600] text-gray-600">
            
            <Link 
              href="/marketplace" 
              className={`transition-colors py-2 flex items-center gap-1.5 ${isActive('/marketplace') ? 'text-[#0f4952]' : 'hover:text-[#1f8898]'}`}
            >
              {isActive('/marketplace') && <span className="w-1.5 h-1.5 rounded-full bg-[#1f8898]"></span>}
              Find a Home
            </Link>

            {/* Property Management Dropdown */}
            <div className="relative group py-6 -my-6">
                <button className="flex items-center gap-1.5 transition-colors outline-none hover:text-[#1f8898]">
                  Property Management <ChevronDown className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-200" />
                </button>
                <div className="absolute top-[80%] left-1/2 -translate-x-1/2 pt-4 w-72 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0">
                    <div className="bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 p-2 flex flex-col">
                        <div className="absolute -top-4 left-0 right-0 h-4 bg-transparent"></div>
                        <div className="px-4 py-3 border-b border-gray-50 mb-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#1f8898] mb-1">Manage Your Properties</p>
                          <p className="text-xs text-gray-500 font-medium">Run your entire rental operations from one dashboard.</p>
                        </div>
                        
                        {/* Protected Routes using onClick handler */}
                        <a href="/dashboard" onClick={(e) => handleRestrictedNavigation(e, '/dashboard')} className="px-4 py-2.5 rounded-xl hover:bg-[#f6f8f9] transition-colors flex items-center gap-3 hover:text-[#1f8898] cursor-pointer">
                            <Building2 className="w-4 h-4 text-gray-400 shrink-0" /> Properties & Units
                        </a>
                        <a href="/dashboard" onClick={(e) => handleRestrictedNavigation(e, '/dashboard')} className="px-4 py-2.5 rounded-xl hover:bg-[#f6f8f9] transition-colors flex items-center gap-3 hover:text-[#1f8898] cursor-pointer">
                            <Users className="w-4 h-4 text-gray-400 shrink-0" /> Tenants
                        </a>
                        <a href="/dashboard" onClick={(e) => handleRestrictedNavigation(e, '/dashboard')} className="px-4 py-2.5 rounded-xl hover:bg-[#f6f8f9] transition-colors flex items-center gap-3 hover:text-[#1f8898] cursor-pointer">
                            <CreditCard className="w-4 h-4 text-gray-400 shrink-0" /> Rent & Collections
                        </a>
                        <a href="/dashboard" onClick={(e) => handleRestrictedNavigation(e, '/dashboard')} className="px-4 py-2.5 rounded-xl hover:bg-[#f6f8f9] transition-colors flex items-center gap-3 hover:text-[#1f8898] cursor-pointer">
                            <Wrench className="w-4 h-4 text-gray-400 shrink-0" /> Maintenance
                        </a>
                        <div className="mt-1 pt-2 border-t border-gray-50 px-2">
                          <Link href="/register" className="flex items-center justify-between w-full bg-gray-50 hover:bg-[#ebf3f5] text-[#0f4952] px-4 py-2.5 rounded-lg text-xs font-bold transition-colors">
                            Start Managing <ArrowRight className="w-3.5 h-3.5" />
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
                <div className="absolute top-[80%] left-1/2 -translate-x-1/2 pt-4 w-60 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0">
                    <div className="bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 p-2 flex flex-col text-gray-700">
                        <div className="absolute -top-4 left-0 right-0 h-4 bg-transparent"></div>
                        <Link href="/blog" className={`px-4 py-3 rounded-xl hover:bg-[#f6f8f9] transition-colors flex items-start gap-3 ${isActive('/blog') ? 'text-[#1f8898]' : 'hover:text-[#1f8898]'}`}>
                            <BookOpen className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" /> 
                            <div>
                              <p className="font-bold text-[13px] leading-none mb-1">Blog</p>
                              <p className="text-[11px] font-medium text-gray-400 leading-tight">PropTech insights and guides</p>
                            </div>
                        </Link>
                        <Link href="/faq" className={`px-4 py-3 rounded-xl hover:bg-[#f6f8f9] transition-colors flex items-start gap-3 ${isActive('/faq') ? 'text-[#1f8898]' : 'hover:text-[#1f8898]'}`}>
                            <HelpCircle className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" /> 
                            <div>
                              <p className="font-bold text-[13px] leading-none mb-1">FAQ</p>
                              <p className="text-[11px] font-medium text-gray-400 leading-tight">Answers about MogiRent</p>
                            </div>
                        </Link>
                        <Link href="/contact" className={`px-4 py-3 rounded-xl hover:bg-[#f6f8f9] transition-colors flex items-start gap-3 ${isActive('/contact') ? 'text-[#1f8898]' : 'hover:text-[#1f8898]'}`}>
                            <Phone className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" /> 
                            <div>
                              <p className="font-bold text-[13px] leading-none mb-1">Help & Support</p>
                              <p className="text-[11px] font-medium text-gray-400 leading-tight">Get assistance with the platform</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            <Link 
              href="/pricing" 
              className={`transition-colors py-2 flex items-center gap-1.5 ${isActive('/pricing') ? 'text-[#0f4952]' : 'hover:text-[#1f8898]'}`}
            >
              {isActive('/pricing') && <span className="w-1.5 h-1.5 rounded-full bg-[#1f8898]"></span>}
              Pricing
            </Link>

          </nav>

          {/* --- RIGHT ACTIONS --- */}
          <div className="hidden lg:flex items-center gap-4 shrink-0">
            {isLoadingAuth ? (
              <div className="w-32 h-10 bg-gray-100 animate-pulse rounded-[10px]"></div>
            ) : isLoggedIn ? (
              <Link href={dashboardUrl} className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] px-5 text-[13px] font-[600] transition-all bg-[#0f4952] text-white hover:bg-[#1f8898] whitespace-nowrap shadow-sm hover:-translate-y-0.5">
                <LayoutDashboard className="w-4 h-4" /> Go to Workspace
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-[13px] font-[600] text-gray-600 hover:text-[#1f8898] transition-colors px-3 py-2 whitespace-nowrap">
                  Sign In
                </Link>
                <Link href="/register" className="inline-flex h-10 items-center justify-center rounded-[10px] px-6 text-[13px] font-[600] transition-all bg-[#0f4952] text-white hover:bg-[#1f8898] hover:shadow-md hover:shadow-[#1f8898]/20 whitespace-nowrap border border-transparent">
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            className="lg:hidden p-2 -mr-2 rounded-[10px] transition-colors z-50 shrink-0 text-gray-900 hover:bg-[#f6f8f9]"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open Navigation Menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Spacer */}
      <div className="h-[64px] lg:h-[72px] w-full shrink-0 bg-transparent"></div>

      {/* --- FULLSCREEN MOBILE NAVIGATION --- */}
      <div 
        className={`fixed inset-0 z-[100] bg-white transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${
          isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="flex items-center justify-between h-[64px] px-6 border-b border-[#eef2f3] shrink-0">
          <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#0f4952] to-[#1f8898] text-[#ffffff] shadow-sm">
              <Building2 className="h-4 w-4" />
            </div>
            <span className="text-xl font-black tracking-tight text-gray-900">
              MogiRent
            </span>
          </Link>
          <button 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="p-2 -mr-2 text-gray-400 hover:bg-[#f6f8f9] hover:text-gray-900 rounded-[10px] transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-6">
          
          <Link href="/marketplace" onClick={() => setIsMobileMenuOpen(false)} className={`text-2xl font-black tracking-tight transition-colors ${isActive('/marketplace') ? 'text-[#1f8898]' : 'text-gray-900'}`}>
            Find a Home
          </Link>

          <details className="group [&_summary::-webkit-details-marker]:hidden border-b border-gray-100 pb-4">
            <summary className="text-2xl font-black tracking-tight text-gray-900 cursor-pointer list-none select-none flex items-center justify-between">
              Property Management
              <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" />
            </summary>
            <div className="flex flex-col gap-4 mt-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#1f8898]">Manage Your Properties</p>
              <a href="/dashboard" onClick={(e) => { handleRestrictedNavigation(e, '/dashboard'); setIsMobileMenuOpen(false); }} className="text-[15px] font-bold text-gray-600">Properties & Units</a>
              <a href="/dashboard" onClick={(e) => { handleRestrictedNavigation(e, '/dashboard'); setIsMobileMenuOpen(false); }} className="text-[15px] font-bold text-gray-600">Tenants</a>
              <a href="/dashboard" onClick={(e) => { handleRestrictedNavigation(e, '/dashboard'); setIsMobileMenuOpen(false); }} className="text-[15px] font-bold text-gray-600">Rent & Collections</a>
              <a href="/dashboard" onClick={(e) => { handleRestrictedNavigation(e, '/dashboard'); setIsMobileMenuOpen(false); }} className="text-[15px] font-bold text-gray-600">Maintenance</a>
            </div>
          </details>

          <details className="group [&_summary::-webkit-details-marker]:hidden border-b border-gray-100 pb-4">
            <summary className="text-2xl font-black tracking-tight text-gray-900 cursor-pointer list-none select-none flex items-center justify-between">
              Resources
              <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" />
            </summary>
            <div className="flex flex-col gap-4 mt-6">
              <Link href="/blog" onClick={() => setIsMobileMenuOpen(false)} className="text-[15px] font-bold text-gray-600">Blog</Link>
              <Link href="/faq" onClick={() => setIsMobileMenuOpen(false)} className="text-[15px] font-bold text-gray-600">FAQ</Link>
              <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-[15px] font-bold text-gray-600">Contact Support</Link>
            </div>
          </details>

          <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)} className={`text-2xl font-black tracking-tight transition-colors ${isActive('/pricing') ? 'text-[#1f8898]' : 'text-gray-900'}`}>
            Pricing
          </Link>
          
        </div>

        <div className="p-6 bg-gray-50 flex flex-col gap-4 shrink-0">
          {isLoadingAuth ? (
            <div className="h-12 bg-gray-200 animate-pulse rounded-xl w-full"></div>
          ) : isLoggedIn ? (
            <Link 
              href={dashboardUrl} 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="flex w-full items-center justify-center gap-2 h-14 text-[15px] font-bold text-white bg-[#0f4952] rounded-xl shadow-md transition-colors"
            >
              <LayoutDashboard className="w-5 h-5" /> Go to Workspace
            </Link>
          ) : (
            <div className="flex flex-col gap-3">
              <Link 
                href="/login" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="flex w-full items-center justify-center h-14 text-[15px] font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/register" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="flex w-full items-center justify-center h-14 text-[15px] font-bold text-white bg-[#0f4952] rounded-xl transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}

          <div className="pt-4 mt-2 border-t border-gray-200 flex flex-col items-center">
            <p className="text-xs font-bold text-gray-500 mb-2">Need help?</p>
            <a 
              href="https://wa.me/254768569357?text=Hi,%20I%20would%20like%20to%20learn%20more%20about%20MogiRent."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#25D366] font-bold text-sm hover:underline"
            >
              <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </>
  );
}