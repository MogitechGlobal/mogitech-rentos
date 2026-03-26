// apps/web/app/dashboard/layout.tsx
/* eslint-disable */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

// 1. Google Font API Integration (Optimized by Next.js)
import { Inter } from 'next/font/google';

// 2. Lucide Icons Import
import { 
  LayoutDashboard, 
  Building2, 
  DoorOpen, 
  Users, 
  FileSignature, 
  FileText, 
  CreditCard, 
  Wrench, 
  PieChart, 
  Settings, 
  HelpCircle, 
  LogOut, 
  ChevronsUpDown,
  Menu,
  X
} from 'lucide-react';

// Configure the Google Font
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // State for the dynamic profile
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Fetch user and landlord data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      try {
        const res = await fetch('http://localhost:3000/api/v1/landlords/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (err) {
        console.error('Failed to load profile for sidebar:', err);
      }
    };

    fetchProfile();
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('access_token');
    router.push('/login');
  };

  const mainNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Properties', path: '/dashboard/properties', icon: <Building2 className="w-5 h-5" /> },
    { name: 'Units', path: '/dashboard/units', icon: <DoorOpen className="w-5 h-5" /> },
    { name: 'Tenants', path: '/dashboard/tenants', icon: <Users className="w-5 h-5" /> },
    { name: 'Leases', path: '/dashboard/leases', icon: <FileSignature className="w-5 h-5" /> },
    { name: 'Invoices', path: '/dashboard/billing', icon: <FileText className="w-5 h-5" /> },
    { name: 'Payments', path: '/dashboard/payments', icon: <CreditCard className="w-5 h-5" /> },
    { name: 'Maintenance', path: '/dashboard/maintenance', icon: <Wrench className="w-5 h-5" /> },
    { name: 'Reports', path: '/dashboard/reports', icon: <PieChart className="w-5 h-5" /> },
  ];

  const bottomNavItems = [
    { name: 'Settings', path: '/dashboard/settings', icon: <Settings className="w-5 h-5" /> },
    { name: 'Help Center', path: '/dashboard/help', icon: <HelpCircle className="w-5 h-5" /> },
  ];

  // Safely extract variables for the UI
  const firstName = profile?.first_name || profile?.user?.first_name || 'Admin';
  const lastName = profile?.last_name || profile?.user?.last_name || 'User';
  const fullName = `${firstName} ${lastName}`.trim();
  const email = profile?.email || profile?.user?.email || 'Loading...';
  
  // Extract Avatar URL
  const avatarUrl = profile?.avatar_url || profile?.user?.avatar_url || null;
  
  const companyName = profile?.company_name || profile?.landlord?.company_name || 'My Portfolio';
  const companyInitial = companyName.charAt(0).toUpperCase();
  const planStatus = profile?.subscription_status || profile?.landlord?.subscription_status || 'FREE PLAN';

  return (
    <div className={`flex flex-col md:flex-row h-screen bg-[#ebf3f5] overflow-hidden ${inter.variable} font-sans`}>
      
      {/* --- Mobile Top Bar --- */}
      <div className="md:hidden flex items-center justify-between bg-[#ffffff] border-b border-gray-200 text-gray-900 p-4 z-20 shadow-sm">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-extrabold tracking-tight">
            Mogi<span className="text-[#1f8898]">RentOS</span>
          </h1>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-gray-500 hover:text-[#1f8898] focus:outline-none p-1 transition"
        >
          {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-30 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* --- Main Sidebar --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#0d393f] flex flex-col shadow-2xl md:shadow-none
        transform transition-transform duration-300 ease-in-out
        md:static md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        <div className="h-16 hidden md:flex items-center px-6 border-b border-white/10 bg-[#0d393f]">
          <h1 className="text-xl font-extrabold tracking-tight text-white">
            Mogi<span className="text-[#ebf3f5] opacity-80">RentOS</span>
          </h1>
        </div>
        
        {/* Workspace Switcher (Dynamic with Avatar) */}
        <div className="p-4 border-b border-white/10">
          <button className="w-full flex items-center justify-between p-2 hover:bg-white/5 rounded-xl transition duration-150 border border-transparent hover:border-white/10 group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center overflow-hidden text-[#ffffff] font-bold shadow-sm shrink-0 border border-white/10">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Workspace Logo" className="w-full h-full object-cover" />
                ) : (
                  companyInitial
                )}
              </div>
              <div className="text-left overflow-hidden">
                <h2 className="text-sm font-bold text-white leading-tight truncate">
                  {companyName}
                </h2>
                <span className="text-[10px] font-bold text-[#ebf3f5] opacity-80 uppercase tracking-wider bg-white/10 px-1.5 py-0.5 rounded">
                  {planStatus === 'ACTIVE' ? 'FREE PLAN' : planStatus}
                </span>
              </div>
            </div>
            <ChevronsUpDown className="w-4 h-4 text-white/50 group-hover:text-white transition shrink-0" />
          </button>
        </div>
        
        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3">
          <p className="px-3 text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Main</p>
          
          {mainNavItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.name} 
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
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
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.name} 
                href={item.path}
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

          {/* User Profile Card (Dynamic with Avatar) */}
          <div className="mt-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-white/10 transition duration-150 group">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center overflow-hidden border border-white/5 text-white font-bold text-sm shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={firstName} className="w-full h-full object-cover" />
                  ) : (
                    firstName !== 'Admin' ? firstName.charAt(0).toUpperCase() : <Users className="w-5 h-5" />
                  )}
                </div>
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
                className="text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-rose-500/20 hover:text-rose-300 transition opacity-0 group-hover:opacity-100 shrink-0"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative bg-[#ebf3f5] w-full">
        {children}
      </main>

    </div>
  );
}