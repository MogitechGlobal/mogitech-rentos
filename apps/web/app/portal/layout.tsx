// apps/web/app/portal/layout.tsx
/* eslint-disable */
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Inter } from 'next/font/google';
import { 
  Home, 
  CreditCard, 
  Wrench, 
  User, 
  LogOut, 
  ShieldCheck,
  Menu,
  X,
  LifeBuoy,
  Building2,
  FileText,
  Bell,
  Droplet,
  KeySquare
} from 'lucide-react';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function TenantPortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  // Dynamic Profile State
  const [tenantProfile, setTenantProfile] = useState<any>(null);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    // 1. Security Check
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role');
    
    if (!token) {
      router.push('/login');
      return;
    }

    if (role !== 'TENANT') {
      router.push('/dashboard');
      return;
    }

    setUserRole(role);

    // 2. Fetch Profile for Sidebar
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portal/my-lease`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setTenantProfile(data);
        }
      } catch (err) {
        console.error("Failed to load sidebar profile");
      }
    };

    fetchProfile();
  }, [router]);

  const handleSignOut = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    router.push('/login');
  };

  const mainNavItems = [
    { name: 'Dashboard', href: '/portal', icon: <Home className="w-5 h-5" /> },
    { name: 'Billing & Payments', href: '/portal/billing', icon: <CreditCard className="w-5 h-5" /> },
    { name: 'Utility Tracking', href: '/portal/utilities', icon: <Droplet className="w-5 h-5" /> },
    { name: 'Visitor Passes', href: '/portal/visitors', icon: <KeySquare className="w-5 h-5" /> }, // <-- Add this line
    { name: 'Maintenance Hub', href: '/portal/maintenance', icon: <Wrench className="w-5 h-5" /> },
    { name: 'Document Center', href: '/portal/documents', icon: <FileText className="w-5 h-5" /> },
    { 
      name: (
        <div className="flex items-center justify-between w-full">
            <span>Announcements</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
        </div>
      ), 
      href: '/portal/announcements', 
      icon: <Bell className="w-5 h-5" /> 
    },
  ];

  const bottomNavItems = [
    { name: 'My Profile', href: '/portal/profile', icon: <User className="w-5 h-5" /> },
    { name: 'Help Center', href: '/portal/support', icon: <LifeBuoy className="w-5 h-5" /> },
  ];

  // --- User Data Extraction ---
  const firstName = tenantProfile?.first_name || 'Tenant';
  const lastName = tenantProfile?.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim();
  const email = tenantProfile?.email || 'Loading...';
  const propertyName = tenantProfile?.unit?.property?.name || 'My Residence';
  const unitNumber = tenantProfile?.unit?.unit_number || '---';
  const avatarUrl = tenantProfile?.user?.avatar_url || null;

  // Prevent rendering the layout until the role is verified
  if (userRole !== 'TENANT') return null;

  return (
    <div className={`flex flex-col md:flex-row h-screen bg-[#ebf3f5] overflow-hidden ${inter.variable} font-sans`}>
      
      {/* --- Mobile Top Bar (Matches Landlord) --- */}
      <div className="md:hidden flex items-center justify-between bg-[#ffffff] border-b border-gray-200 text-gray-900 p-4 z-20 shadow-sm">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-extrabold tracking-tight">
            Mogi<span className="text-[#1f8898]">RentOS</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
            <Link href="/portal/announcements" className="relative text-gray-400 hover:text-[#1f8898] transition-colors">
                <Bell className="w-6 h-6" />
                <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-rose-500"></span>
            </Link>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-500 hover:text-[#1f8898] focus:outline-none transition"
            >
              {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
        </div>
      </div>

      {/* --- Mobile Overlay --- */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-30 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* --- Main Sidebar (Dark Theme) --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#0d393f] flex flex-col shadow-2xl md:shadow-none
        transform transition-transform duration-300 ease-in-out
        md:static md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* Branding */}
        <div className="h-16 hidden md:flex items-center px-6 border-b border-white/10 bg-[#0d393f]">
          <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#1f8898]" />
            Mogi<span className="text-[#ebf3f5] opacity-80">RentOS</span>
          </h1>
        </div>
        
        {/* Residence Identifier (Matches Landlord Workspace Switcher) */}
        <div className="p-4 border-b border-white/10">
          <div className="w-full flex items-center p-2 bg-white/5 rounded-xl border border-white/10 cursor-default">
            <div className="flex items-center gap-3 w-full">
              <div className="w-8 h-8 bg-[#1f8898] rounded-lg flex items-center justify-center overflow-hidden text-[#ffffff] font-bold shadow-sm shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="text-left overflow-hidden">
                <h2 className="text-sm font-bold text-white leading-tight truncate">
                  {propertyName}
                </h2>
                <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border bg-white/10 text-white/70 border-white/10">
                  UNIT {unitNumber}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3 custom-scrollbar">
          <p className="px-3 text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Menu</p>
          
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link 
                key={typeof item.name === 'string' ? item.name : item.href} 
                href={item.href}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 text-left ${
                  isActive 
                    ? 'bg-[#1f8898] text-white shadow-md' 
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className={`${isActive ? 'text-white' : 'text-white/60'}`}>
                  {item.icon}
                </div>
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Bottom Section (Settings & Profile) */}
        <div className="p-3 border-t border-white/10 flex flex-col gap-1 bg-[#0d393f]">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                  isActive 
                    ? 'bg-[#1f8898] text-white shadow-md' 
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className={`${isActive ? 'text-white' : 'text-white/60'}`}>{item.icon}</div>
                {item.name}
              </Link>
            );
          })}

          {/* User Profile Card (Matches Landlord) */}
          <div className="mt-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-white/10 transition duration-150 group cursor-default">
              <div className="flex items-center gap-3 overflow-hidden">
                
                {/* --- UPDATED AVATAR RENDER --- */}
                <div className="w-9 h-9 bg-[#1f8898] rounded-full flex items-center justify-center overflow-hidden border border-white/5 text-white font-black text-sm shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <>{firstName.charAt(0)}{lastName.charAt(0)}</>
                  )}
                </div>
                {/* ----------------------------- */}

                <div className="text-left overflow-hidden">
                  <p className="text-sm font-bold text-white leading-tight truncate">
                    {fullName}
                  </p>
                  <p className="text-[11px] text-white/60 font-medium truncate">
                    {email}
                  </p>
                </div>
              </div>
              <button 
                onClick={handleSignOut}
                className="text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-rose-500/20 hover:text-rose-300 transition opacity-0 group-hover:opacity-100 shrink-0 cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 overflow-y-auto relative bg-[#ebf3f5] w-full">
        {children}
      </main>

    </div>
  );
}