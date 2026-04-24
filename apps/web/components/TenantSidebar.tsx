// apps/web/components/TenantSidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, CreditCard, Wrench, User, LogOut, ShieldCheck,
  Menu, X, LifeBuoy, Building2, FileText, Bell, Droplet, KeySquare,
  Repeat
} from 'lucide-react';

export default function TenantSidebar({ profile }: { profile: any }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  const handleSignOut = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (e) {
      console.error("Logout failed", e);
    }
    window.location.href = '/login'; 
  };

  const mainNavItems = [
    { name: 'Dashboard', href: '/portal', icon: <Home className="w-4 h-4" /> },
    { name: 'Billing & Payments', href: '/portal/billing', icon: <CreditCard className="w-4 h-4" /> },
    { name: 'Utility Tracking', href: '/portal/utilities', icon: <Droplet className="w-4 h-4" /> },
    { name: 'Visitor Passes', href: '/portal/visitors', icon: <KeySquare className="w-4 h-4" /> },
    { name: 'Maintenance Hub', href: '/portal/maintenance', icon: <Wrench className="w-4 h-4" /> },
    { name: 'Document Center', href: '/portal/documents', icon: <FileText className="w-4 h-4" /> },
    { 
      name: (
        <div className="flex items-center justify-between w-full">
            <span>Announcements</span>
            <span className="flex h-1.5 w-1.5 relative mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
            </span>
        </div>
      ), 
      href: '/portal/announcements', 
      icon: <Bell className="w-4 h-4" /> 
    },
  ];

  const bottomNavItems = [
    { name: 'My Profile', href: '/portal/profile', icon: <User className="w-4 h-4" /> },
    { name: 'Help Center', href: '/portal/support', icon: <LifeBuoy className="w-4 h-4" /> },
  ];

  const firstName = profile?.first_name || profile?.user?.first_name || 'Tenant';
  const lastName = profile?.last_name || profile?.user?.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim();
  const email = profile?.email || profile?.user?.email || 'Loading...';
  const propertyName = profile?.unit?.property?.name || 'My Residence';
  const unitNumber = profile?.unit?.unit_number || '---';
  const avatarUrl = profile?.user?.avatar_url || null;

  const hasManagementAccess = !!profile?.user?.landlord || !!profile?.user?.staff;

  return (
    <>
      {/* Mobile Header (Behind Drawer) */}
      <div className="md:hidden flex items-center justify-between bg-[#ffffff] border-b border-gray-200 text-gray-900 p-4 z-20 shadow-sm shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-extrabold tracking-tight">
            Mogi<span className="text-[#1f8898]">RentOS</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
            <Link href="/portal/announcements" className="relative text-gray-400 hover:text-[#1f8898] transition-colors">
                <Bell className="w-6 h-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-rose-500"></span>
            </Link>
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-gray-500 hover:text-[#1f8898] focus:outline-none transition active:scale-95"
            >
              <Menu className="w-7 h-7" />
            </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-gray-900/60 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Sidebar Drawer */}
      <aside className={`
        fixed top-0 left-0 z-50 h-[100dvh] w-[85vw] max-w-[300px] pb-[env(safe-area-inset-bottom)]
        bg-[#0d393f] flex flex-col shadow-2xl md:shadow-none
        transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shrink-0
        md:relative md:w-64 md:translate-x-0 md:h-auto md:pb-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* Logo Header & Mobile Close Button */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/5 shrink-0 bg-[#0d393f]">
          <h1 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#48c9dc]" />
            Mogi<span className="text-[#ebf3f5] opacity-80">RentOS</span>
          </h1>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-white/50 hover:text-white p-1 rounded-lg hover:bg-white/10 transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Compact Property & Unit Card */}
        <div className="p-3 border-b border-white/5 shrink-0">
          <div className="w-full flex items-center justify-between p-1.5 rounded-xl border border-white/10 bg-white/5 cursor-default">
            <div className="flex items-center gap-3 w-full">
              <div className="w-8 h-8 bg-[#1f8898]/20 rounded-lg flex items-center justify-center overflow-hidden text-[#48c9dc] shadow-sm shrink-0 border border-[#1f8898]/30">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="text-left overflow-hidden">
                <h2 className="text-[13px] font-bold text-white leading-tight truncate">
                  {propertyName}
                </h2>
                <span className="text-[8px] font-black uppercase tracking-widest px-1 py-0.5 rounded mt-0.5 inline-block bg-[#1f8898]/30 text-[#48c9dc]">
                  UNIT {unitNumber}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Maximized Main Navigation with Overscroll Contain */}
        <div className="flex-1 overflow-y-auto overscroll-contain py-1 flex flex-col gap-0.5 px-3 custom-scrollbar mt-2">
          <p className="px-2 text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Menu</p>
          
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={typeof item.name === 'string' ? item.name : item.href} 
                href={item.href}
                className={`relative w-full flex items-center gap-2.5 px-2 py-2.5 md:py-1.5 rounded-lg text-[13px] font-semibold transition-all duration-200 text-left overflow-hidden group active:scale-[0.98] ${
                  isActive ? 'bg-[#48c9dc]/10 text-[#48c9dc] shadow-sm' : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#48c9dc] rounded-r-md"></div>}
                <div className={`${isActive ? 'text-[#48c9dc]' : 'text-white/50 group-hover:text-white/80'}`}>{item.icon}</div>
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div className="px-3 pb-4 md:pb-2 flex flex-col gap-0.5 shrink-0 pt-2 border-t border-white/5">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`relative w-full flex items-center gap-2.5 px-2 py-2.5 md:py-1.5 rounded-lg text-[13px] font-semibold transition-all duration-200 text-left overflow-hidden group active:scale-[0.98] ${
                  isActive ? 'bg-[#48c9dc]/10 text-[#48c9dc] shadow-sm' : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#48c9dc] rounded-r-md"></div>}
                <div className={`${isActive ? 'text-[#48c9dc]' : 'text-white/50 group-hover:text-white/80'}`}>{item.icon}</div>
                {item.name}
              </Link>
            );
          })}

          <div className="mt-2 pt-2 border-t border-white/5">
            
            {/* WORKSPACE SWITCHER */}
            {hasManagementAccess && (
               <Link 
                 href="/dashboard" 
                 className="flex items-center justify-center gap-1.5 mb-2 p-2.5 md:p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-400/20 hover:bg-amber-400/20 transition-all font-bold text-[12px] md:text-[11px] shadow-sm active:scale-95"
               >
                 <Repeat className="w-3.5 h-3.5" /> Switch to Management
               </Link>
            )}

            {/* Profile & Logout Card */}
            <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white/5 transition duration-150 cursor-default">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-9 h-9 md:w-8 md:h-8 bg-[#1f8898]/20 rounded-full flex items-center justify-center overflow-hidden border border-[#1f8898]/30 text-[#48c9dc] font-black text-[11px] shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <>{firstName.charAt(0)}{lastName.charAt(0)}</>
                  )}
                </div>

                <div className="text-left overflow-hidden">
                  <p className="text-[13px] md:text-[12px] font-bold text-white leading-tight truncate">
                    {fullName}
                  </p>
                  <p className="text-[11px] md:text-[10px] text-white/50 font-medium truncate">
                    {email}
                  </p>
                </div>
              </div>
              <button 
                onClick={handleSignOut}
                className="text-white/30 hover:text-rose-400 p-2 md:p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors shrink-0 active:scale-95"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5 md:w-4 md:h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}