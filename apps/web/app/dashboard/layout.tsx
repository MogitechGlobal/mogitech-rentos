// apps/web/app/dashboard/layout.tsx
/* eslint-disable */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Megaphone, Zap } from 'lucide-react'; 

// 1. Google Font API Integration
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
  X,
  Lock,      // <-- New: For gated features
  Crown,     // <-- New: For Premium branding
  Sparkles,  // <-- New: For upgrade buttons
  CheckCircle2
} from 'lucide-react';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // --- Profile & Subscription State ---
  const [profile, setProfile] = useState<any>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      try {
        // FIXED: Replaced closing single quote with a backtick
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/landlords/profile`, {
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

  // --- BUSINESS LOGIC: Feature Gating Flags ---
  // We define which routes require a Premium Subscription
  const mainNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, requiresPremium: false },
    { name: 'Properties', path: '/dashboard/properties', icon: <Building2 className="w-5 h-5" />, requiresPremium: false },
    { name: 'Units', path: '/dashboard/units', icon: <DoorOpen className="w-5 h-5" />, requiresPremium: false },
    { name: 'Tenants', path: '/dashboard/tenants', icon: <Users className="w-5 h-5" />, requiresPremium: false },
    
    // --- Premium Locked Features ---
    { name: 'Leases', path: '/dashboard/leases', icon: <FileSignature className="w-5 h-5" />, requiresPremium: true },
    { name: 'Invoices', path: '/dashboard/billing', icon: <FileText className="w-5 h-5" />, requiresPremium: true },
    { name: 'Payments', path: '/dashboard/payments', icon: <CreditCard className="w-5 h-5" />, requiresPremium: true },
    { name: 'Communications', path: '/dashboard/communications', icon: <Megaphone className="w-5 h-5" />, requiresPremium: true },
    { name: 'Utility Billing', path: '/dashboard/utilities', icon: <Zap className="w-5 h-5" />, requiresPremium: true },
    { name: 'Maintenance', path: '/dashboard/maintenance', icon: <Wrench className="w-5 h-5" />, requiresPremium: true },
    { name: 'Reports', path: '/dashboard/reports', icon: <PieChart className="w-5 h-5" />, requiresPremium: true },
  ];

  const bottomNavItems = [
    { name: 'Settings', path: '/dashboard/settings', icon: <Settings className="w-5 h-5" /> },
    { name: 'Help Center', path: '/dashboard/help', icon: <HelpCircle className="w-5 h-5" /> },
  ];

  // --- User Data Extraction ---
  const firstName = profile?.first_name || profile?.user?.first_name || 'Admin';
  const lastName = profile?.last_name || profile?.user?.last_name || 'User';
  const fullName = `${firstName} ${lastName}`.trim();
  const email = profile?.email || profile?.user?.email || 'Loading...';
  const avatarUrl = profile?.avatar_url || profile?.user?.avatar_url || null;
  const companyName = profile?.company_name || profile?.landlord?.company_name || 'My Portfolio';
  const companyInitial = companyName.charAt(0).toUpperCase();
  
  // --- SUBSCRIPTION DETERMINATION ---
  // Evaluate the plan based on the database flag. Default to FREE.
  const planTier = profile?.subscription_plan || profile?.landlord?.subscription_plan || 'FREE';
  const isPremium = planTier === 'PREMIUM' || planTier === 'PRO';

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
        
        {/* Workspace Switcher */}
        <div className="p-4 border-b border-white/10">
          <button className="w-full flex items-center justify-between p-2 hover:bg-white/5 rounded-xl transition duration-150 border border-transparent hover:border-white/10 group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center overflow-hidden text-[#ffffff] font-bold shadow-sm shrink-0 border border-white/10 relative">
                {isPremium && <Crown className="absolute -top-1 -right-1 w-3 h-3 text-amber-400" />}
                {<Building2 className="w-4 h-4" />}
              </div>
              <div className="text-left overflow-hidden">
                <h2 className="text-sm font-bold text-white leading-tight truncate">
                  {companyName}
                </h2>
                {/* Dynamic Plan Badge */}
                <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${
                  isPremium 
                    ? 'bg-amber-400/20 text-amber-300 border-amber-400/30' 
                    : 'bg-white/10 text-white/70 border-white/10'
                }`}>
                  {isPremium ? 'PREMIUM' : 'FREE PLAN'}
                </span>
              </div>
            </div>
            <ChevronsUpDown className="w-4 h-4 text-white/50 group-hover:text-white transition shrink-0" />
          </button>
        </div>
        
        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3 custom-scrollbar">
          <p className="px-3 text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Main</p>
          
          {mainNavItems.map((item) => {
            const isActive = pathname === item.path;
            const isLocked = item.requiresPremium && !isPremium;

            return (
              <button 
                key={item.name} 
                onClick={() => {
                  if (isLocked) {
                    setIsUpgradeModalOpen(true);
                  } else {
                    router.push(item.path);
                    setIsMobileMenuOpen(false);
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 text-left ${
                  isActive 
                    ? 'bg-[#1f8898] text-white shadow-md' 
                    : isLocked
                      ? 'text-white/40 hover:bg-white/5 hover:text-white/70'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className={`${isActive ? 'text-white' : isLocked ? 'text-white/30' : 'text-white/60'}`}>
                  {item.icon}
                </div>
                {item.name}
                {isLocked && <Lock className="w-3.5 h-3.5 ml-auto text-amber-400/70" />}
              </button>
            );
          })}
        </div>

        {/* Upgrade Call To Action (Only visible if Free) */}
        {!isPremium && (
          <div className="px-4 py-2">
            <div className="bg-gradient-to-br from-amber-400/20 to-amber-600/20 border border-amber-400/30 p-4 rounded-xl flex flex-col items-start relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-amber-400/20 rounded-full blur-xl"></div>
              <Crown className="w-5 h-5 text-amber-400 mb-2" />
              <h4 className="text-white text-sm font-black tracking-tight mb-1">Unlock Premium</h4>
              <p className="text-white/60 text-[11px] font-medium leading-tight mb-3">Get automated billing, maintenance, & analytics.</p>
              <button 
                onClick={() => setIsUpgradeModalOpen(true)}
                className="w-full bg-amber-500 hover:bg-amber-400 text-[#0d393f] text-xs font-black py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20"
              >
                <Sparkles className="w-3.5 h-3.5" /> Upgrade Now
              </button>
            </div>
          </div>
        )}

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

          {/* User Profile Card */}
          <div className="mt-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-white/10 transition duration-150 group cursor-default">
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
                className="text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-rose-500/20 hover:text-rose-300 transition opacity-0 group-hover:opacity-100 shrink-0 cursor-pointer"
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

      {/* --- PREMIUM UPGRADE MODAL PAYWALL --- */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-[#0d393f]/80 backdrop-blur-sm transition-opacity" onClick={() => setIsUpgradeModalOpen(false)}></div>
          
          <div className="relative w-full max-w-md bg-[#ffffff] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
            
            {/* Modal Header Gradient */}
            <div className="bg-gradient-to-br from-amber-400 to-amber-600 px-6 py-8 text-center relative overflow-hidden">
               <div className="absolute -left-10 -top-10 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
               <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
               
               <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30 shadow-inner">
                  <Crown className="w-8 h-8 text-white drop-shadow-md" />
               </div>
               <h3 className="text-2xl font-black text-white tracking-tight drop-shadow-sm">Upgrade to Premium</h3>
               <p className="text-amber-50 text-sm font-medium mt-1 drop-shadow-sm">Unlock the full power of MogiRentOS.</p>

               <button onClick={() => setIsUpgradeModalOpen(false)} className="absolute top-4 right-4 p-2 text-white/70 hover:bg-white/20 hover:text-white rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Premium Features List */}
            <div className="p-8 space-y-4 bg-[#f8fafb]">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" />
                <span className="text-sm font-bold text-gray-700">Automated Rent Invoicing & Receipts</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" />
                <span className="text-sm font-bold text-gray-700">Payment Tracking & Arrears Reports</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" />
                <span className="text-sm font-bold text-gray-700">Maintenance & Ticket Dispatch Hub</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" />
                <span className="text-sm font-bold text-gray-700">Real-time Portfolio Analytics</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-5 border-t border-gray-100 bg-[#ffffff] flex flex-col gap-3">
              <button 
                onClick={() => {
                  setIsUpgradeModalOpen(false);
                  router.push('/dashboard/settings/billing'); // Route them to where they can pay
                }} 
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-black text-sm text-[#0d393f] bg-amber-400 hover:bg-amber-500 shadow-lg shadow-amber-400/30 transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4" /> View Premium Plans
              </button>
              <button 
                onClick={() => setIsUpgradeModalOpen(false)} 
                className="w-full px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}