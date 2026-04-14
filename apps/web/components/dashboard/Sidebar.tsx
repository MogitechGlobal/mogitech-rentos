// apps/web/components/dashboard/Sidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import {
  LayoutDashboard, Building2, DoorOpen, Users, FileSignature,
  FileText, CreditCard, Wrench, PieChart, Settings, HelpCircle,
  LogOut, Menu, X, Crown, Sparkles, Megaphone, Zap, Star, ShieldAlert, Loader2
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // HYDRATION FIX & LIVE DATA STATE
  const [isMounted, setIsMounted] = useState(false);
  const [actualProps, setActualProps] = useState(0);
  const [actualUnits, setActualUnits] = useState(0);

  // Pull profile from global store
  const { profile, clearProfile } = useUserStore();

  useEffect(() => {
    setIsMounted(true);
    
    // --- LIVE USAGE SYNC ---
    // Fetches fresh property and unit counts independently of the global profile
    // Re-runs whenever the pathname changes so the quota is always accurate!
    const fetchUsageMetrics = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties`, { credentials: 'include' });
        if (res.ok) {
          const propsData = await res.json();
          setActualProps(propsData.length || 0);
          
          const totalUnits = propsData.reduce((acc: number, prop: any) => acc + (prop.units?.length || 0), 0);
          setActualUnits(totalUnits);
        }
      } catch (error) {
        console.error("Failed to sync sidebar usage limits.");
      }
    };

    fetchUsageMetrics();
  }, [pathname]);

  const handleSignOut = () => {
    localStorage.removeItem('access_token');
    clearProfile();
    router.push('/login');
  };

  // --- 5-TIER LOGIC & USAGE CALCULATION ---
  const rawPlan = profile?.subscription_status || profile?.landlord?.subscription_status || 'STARTER';
  const currentPlan = rawPlan === 'PREMIUM' ? 'PRO' : rawPlan; // Normalize legacy Premium to Pro

  const isStarter = currentPlan === 'STARTER';
  const isBasic = currentPlan === 'BASIC';
  const isStandard = currentPlan === 'STANDARD';
  const isPro = currentPlan === 'PRO';
  const isEnterprise = currentPlan === 'ENTERPRISE';

  // Safely extract usage prioritizing live fetch, falling back to profile state
  const usedProps = actualProps || profile?.landlord?.properties?.length || profile?.properties?.length || 0;
  
  let profileUnits = 0;
  const propertiesArray = profile?.landlord?.properties || profile?.properties || [];
  if (Array.isArray(propertiesArray)) {
      profileUnits = propertiesArray.reduce((acc: number, prop: any) => acc + (prop?.units?.length || 0), 0);
  }
  if (profileUnits === 0 && profile?.units?.length) profileUnits = profile.units.length;

  const usedUnits = actualUnits || profileUnits || 0;

  // Determine Quota Limits based on the new pricing matrix
  let maxProps: number | string = 1;
  let maxUnits: number | string = 30;

  switch(currentPlan) {
      case 'STARTER': maxProps = 1; maxUnits = 30; break;
      case 'BASIC': maxProps = 3; maxUnits = 50; break;
      case 'STANDARD': maxProps = 5; maxUnits = 100; break;
      case 'PRO':
      case 'ENTERPRISE': 
          maxProps = '∞'; maxUnits = '∞'; break;
      default: maxProps = 1; maxUnits = 30;
  }

  // Calculate Progress Bar Percentages safely
  const propPercent = maxProps === '∞' ? 100 : Math.max(0, Math.min((usedProps / (maxProps as number)) * 100, 100));
  const unitPercent = maxUnits === '∞' ? 100 : Math.max(0, Math.min((usedUnits / (maxUnits as number)) * 100, 100));


  // --- ROBUST ADMIN CHECK ---
  const authorizedAdminEmails = [
    'admin@mogitech.com',
    'mongerijacob@gmail.com',
  ];

  const userEmail = (profile?.user?.email || profile?.email || '').toLowerCase().trim();

  const isAdmin = authorizedAdminEmails.includes(userEmail) ||
    profile?.role?.name === 'ADMIN' ||
    profile?.user?.role?.name === 'ADMIN';

  // ALL FEATURES UNLOCKED FOR ALL PLANS
  const mainNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Properties', path: '/dashboard/properties', icon: <Building2 className="w-5 h-5" /> },
    { name: 'Units', path: '/dashboard/units', icon: <DoorOpen className="w-5 h-5" /> },
    { name: 'Tenants', path: '/dashboard/tenants', icon: <Users className="w-5 h-5" /> },
    { name: 'Leases', path: '/dashboard/leases', icon: <FileSignature className="w-5 h-5" /> },
    { name: 'Invoices', path: '/dashboard/billing', icon: <FileText className="w-5 h-5" /> },
    { name: 'Payments', path: '/dashboard/payments', icon: <CreditCard className="w-5 h-5" /> },
    { name: 'Communications', path: '/dashboard/communications', icon: <Megaphone className="w-5 h-5" /> },
    { name: 'Utility Billing', path: '/dashboard/utilities', icon: <Zap className="w-5 h-5" /> },
    { name: 'Maintenance', path: '/dashboard/maintenance', icon: <Wrench className="w-5 h-5" /> },
    { name: 'Reports', path: '/dashboard/reports', icon: <PieChart className="w-5 h-5" /> },
  ];

  const bottomNavItems = [
    { name: 'Settings', path: '/dashboard/settings', icon: <Settings className="w-5 h-5" /> },
    { name: 'Help Center', path: '/dashboard/help', icon: <HelpCircle className="w-5 h-5" /> },
  ];

  const firstName = profile?.first_name || profile?.user?.first_name || 'Admin';
  const lastName = profile?.last_name || profile?.user?.last_name || 'User';
  const fullName = `${firstName} ${lastName}`.trim();
  const email = profile?.email || profile?.user?.email || 'Loading...';
  const avatarUrl = profile?.avatar_url || profile?.user?.avatar_url || null;
  const companyName = profile?.company_name || profile?.landlord?.company_name || 'My Portfolio';

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-[#ffffff] border-b border-gray-200 text-gray-900 p-4 z-20 shadow-sm">
        <h1 className="text-xl font-extrabold tracking-tight">Mogi<span className="text-[#1f8898]">RentOS</span></h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-500 hover:text-[#1f8898] p-1">
          {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>

      {isMobileMenuOpen && <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-30 md:hidden backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0d393f] flex flex-col shadow-2xl md:shadow-none transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>

        <div className="h-16 hidden md:flex items-center px-6 border-b border-white/10 shrink-0">
          <h1 className="text-xl font-extrabold tracking-tight text-white">Mogi<span className="text-[#ebf3f5] opacity-80">RentOS</span></h1>
        </div>

        <div className="p-4 border-b border-white/10 shrink-0">
          <button className="w-full flex items-center justify-between p-2 hover:bg-white/5 rounded-xl transition duration-150 border border-transparent hover:border-white/10 group cursor-default">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center overflow-hidden text-[#ffffff] font-bold shadow-sm shrink-0 border border-white/10 relative">
                {isMounted && isPro && <Crown className="absolute -top-1 -right-1 w-3 h-3 text-amber-400" />}
                {isMounted && isEnterprise && <Building2 className="absolute -top-1 -right-1 w-3 h-3 text-purple-400" />}
                {isMounted && isStandard && <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-blue-400" />}
                {isMounted && isBasic && <Star className="absolute -top-1 -right-1 w-3 h-3 text-[#48c9dc]" />}
                <Building2 className="w-4 h-4" />
              </div>
              <div className="text-left overflow-hidden">
                <h2 className="text-sm font-bold text-white leading-tight truncate">{isMounted ? companyName : 'Loading...'}</h2>
                {isMounted && (
                  <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border 
                    ${isEnterprise ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                      isPro ? 'bg-amber-400/20 text-amber-300 border-amber-400/30' :
                      isStandard ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                      isBasic ? 'bg-[#1f8898]/30 text-[#48c9dc] border-[#1f8898]/50' :
                        'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'}`}>
                    {currentPlan} PLAN
                  </span>
                )}
              </div>
            </div>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3 custom-scrollbar">

          {/* --- HYDRATION SAFE SUPER ADMIN QUICK ACCESS --- */}
          {isMounted && isAdmin && (
            <div className="mb-2">
              <Link
                href="/super-admin"
                className="flex items-center justify-between px-3 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-rose-500/10 to-orange-500/10 text-rose-400 hover:from-rose-500/20 hover:to-orange-500/20 border border-rose-500/20 transition-all duration-200 shadow-sm group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-rose-500/20 rounded-lg group-hover:scale-110 transition-transform">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                  </div>
                  <span>Command Center</span>
                </div>
              </Link>
              <div className="h-px w-full bg-white/5 my-3"></div>
            </div>
          )}

          <p className="px-3 text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Main</p>
          {mainNavItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 text-left ${isActive ? 'bg-[#1f8898] text-white shadow-md' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
              >
                <div className={`${isActive ? 'text-white' : 'text-white/60'}`}>{item.icon}</div>
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* --- REFINED VOLUME-BASED QUOTA TRACKER --- */}
        {isMounted && (
          <div className="px-4 py-2 shrink-0">
            <div className="bg-[#0b282c] border border-white/5 p-4 rounded-2xl shadow-inner">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Usage Quota</span>
                    <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      isEnterprise ? 'bg-purple-500 text-purple-950' :
                      isPro ? 'bg-amber-500 text-amber-950' :
                      isStandard ? 'bg-blue-500 text-blue-950' :
                      isBasic ? 'bg-[#48c9dc] text-[#0b282c]' :
                      'bg-emerald-500 text-emerald-950'
                    }`}>
                      {currentPlan}
                    </span>
                </div>
                
                <div className="mb-4">
                    <div className="flex justify-between text-[11px] mb-1.5">
                        <span className="text-white/70 font-medium">Properties</span>
                        <span className="text-white font-bold tracking-wide">
                            {usedProps}&nbsp;<span className="text-white/40">/&nbsp;{maxProps}</span>
                        </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-1.5 rounded-full transition-all duration-1000 ${isPro || isEnterprise ? 'bg-amber-400' : 'bg-[#1f8898]'}`} style={{ width: `${propPercent}%` }}></div>
                    </div>
                </div>

                <div className="mb-4">
                    <div className="flex justify-between text-[11px] mb-1.5">
                        <span className="text-white/70 font-medium">Units</span>
                        <span className="text-white font-bold tracking-wide">
                            {usedUnits}&nbsp;<span className="text-white/40">/&nbsp;{maxUnits}</span>
                        </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-1.5 rounded-full transition-all duration-1000 ${isPro || isEnterprise ? 'bg-amber-400' : 'bg-[#1f8898]'}`} style={{ width: `${unitPercent}%` }}></div>
                    </div>
                </div>

                {(!isPro && !isEnterprise) && (
                  <Link href="/dashboard/settings/billing" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-center bg-white/10 hover:bg-white/20 transition-colors text-white text-[10px] font-black uppercase tracking-widest py-2 rounded-xl mt-1">
                      Increase Quota
                  </Link>
                )}
            </div>
          </div>
        )}

        <div className="p-3 border-t border-white/10 flex flex-col gap-1 bg-[#0d393f] shrink-0">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path));
            return (
              <Link key={item.name} href={item.path} onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${isActive ? 'bg-[#1f8898] text-white shadow-md' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
                <div className={`${isActive ? 'text-white' : 'text-white/60'}`}>{item.icon}</div>
                {item.name}
              </Link>
            );
          })}

          <div className="mt-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-white/10 transition duration-150 group cursor-default">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center overflow-hidden border border-white/5 text-white font-bold text-sm shrink-0">
                  {isMounted ? (
                    avatarUrl ? <img src={avatarUrl} alt={firstName} className="w-full h-full object-cover" /> : (firstName !== 'Admin' ? firstName.charAt(0).toUpperCase() : <Users className="w-5 h-5" />)
                  ) : <Loader2 className="w-4 h-4 animate-spin text-white/50" />}
                </div>
                <div className="text-left overflow-hidden">
                  <p className="text-sm font-bold text-white leading-tight truncate">{isMounted ? fullName : '...'}</p>
                  <p className="text-[11px] text-white/60 font-medium truncate">{isMounted ? email : '...'}</p>
                </div>
              </div>
              <button onClick={handleSignOut} className="text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-rose-500/20 hover:text-rose-300 transition opacity-0 group-hover:opacity-100 shrink-0 cursor-pointer" title="Sign Out">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}