// apps/web/components/dashboard/Sidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import {
  LayoutDashboard, Building2, DoorOpen, Users, FileSignature,
  FileText, CreditCard, Wrench, PieChart, Settings, HelpCircle,
  LogOut, Menu, X, Crown, Sparkles, Megaphone, Zap, Star, ShieldAlert, Loader2,
  Globe, Calculator, Target, ArrowRight, Activity
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
  const currentPlan = rawPlan === 'PREMIUM' ? 'PRO' : rawPlan; 

  const isStarter = currentPlan === 'STARTER';
  const isBasic = currentPlan === 'BASIC';
  const isStandard = currentPlan === 'STANDARD';
  const isPro = currentPlan === 'PRO';
  const isEnterprise = currentPlan === 'ENTERPRISE';

  const usedProps = actualProps || profile?.landlord?.properties?.length || profile?.properties?.length || 0;
  
  let profileUnits = 0;
  const propertiesArray = profile?.landlord?.properties || profile?.properties || [];
  if (Array.isArray(propertiesArray)) {
      profileUnits = propertiesArray.reduce((acc: number, prop: any) => acc + (prop?.units?.length || 0), 0);
  }
  if (profileUnits === 0 && profile?.units?.length) profileUnits = profile.units.length;

  const usedUnits = actualUnits || profileUnits || 0;

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

  // --- CORPORATE NAV GROUPING ---
  const navGroups = [
    {
      title: 'Overview',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { name: 'Reports', path: '/dashboard/reports', icon: <PieChart className="w-4 h-4" /> },
      ]
    },
    {
      title: 'Portfolio Management',
      items: [
        { name: 'Properties', path: '/dashboard/properties', icon: <Building2 className="w-4 h-4" /> },
        { name: 'Units', path: '/dashboard/units', icon: <DoorOpen className="w-4 h-4" /> },
        { name: 'Tenants', path: '/dashboard/tenants', icon: <Users className="w-4 h-4" /> },
        { name: 'Leases', path: '/dashboard/leases', icon: <FileSignature className="w-4 h-4" /> },
      ]
    },
    {
      title: 'Financials',
      items: [
        { name: 'Accounting & P&L', path: '/dashboard/accounting', icon: <Calculator className="w-4 h-4" /> },
        { name: 'Invoices', path: '/dashboard/billing', icon: <FileText className="w-4 h-4" /> },
        { name: 'Payments', path: '/dashboard/payments', icon: <CreditCard className="w-4 h-4" /> },
        { name: 'Utility Billing', path: '/dashboard/utilities', icon: <Zap className="w-4 h-4" /> },
      ]
    },
    {
      title: 'Operations',
      items: [
        { name: 'Maintenance', path: '/dashboard/maintenance', icon: <Wrench className="w-4 h-4" /> },
        { name: 'Leads (CRM)', path: '/dashboard/leads', icon: <Target className="w-4 h-4" /> },
        { name: 'Communications', path: '/dashboard/communications', icon: <Megaphone className="w-4 h-4" /> },
        { name: 'Marketplace', path: '/dashboard/marketplace', icon: <Globe className="w-4 h-4" /> },
      ]
    }
  ];

  const bottomNavItems = [
    { name: 'Settings', path: '/dashboard/settings', icon: <Settings className="w-4 h-4" /> },
    { name: 'Help Center', path: '/dashboard/help', icon: <HelpCircle className="w-4 h-4" /> },
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

        <div className="h-16 hidden md:flex items-center px-6 border-b border-white/5 shrink-0">
          <h1 className="text-xl font-extrabold tracking-tight text-white">Mogi<span className="text-[#ebf3f5] opacity-80">RentOS</span></h1>
        </div>

        <div className="p-4 border-b border-white/5 shrink-0">
          <button className="w-full flex items-center justify-between p-2 hover:bg-white/5 rounded-xl transition duration-150 border border-transparent hover:border-white/10 group cursor-default">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center overflow-hidden text-[#ffffff] font-bold shadow-sm shrink-0 border border-white/10 relative">
                {isMounted && isPro && <Crown className="absolute -top-1 -right-1 w-3.5 h-3.5 text-amber-400" />}
                {isMounted && isEnterprise && <Building2 className="absolute -top-1 -right-1 w-3.5 h-3.5 text-purple-400" />}
                {isMounted && isStandard && <Sparkles className="absolute -top-1 -right-1 w-3.5 h-3.5 text-blue-400" />}
                {isMounted && isBasic && <Star className="absolute -top-1 -right-1 w-3.5 h-3.5 text-[#48c9dc]" />}
                <Building2 className="w-4 h-4" />
              </div>
              <div className="text-left overflow-hidden">
                <h2 className="text-sm font-bold text-white leading-tight truncate">{isMounted ? companyName : 'Loading...'}</h2>
                {isMounted && (
                  <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border mt-0.5 inline-block
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

        <div className="flex-1 overflow-y-auto py-2 flex flex-col px-3 custom-scrollbar">

          {/* --- HYDRATION SAFE SUPER ADMIN QUICK ACCESS --- */}
          {isMounted && isAdmin && (
            <div className="mb-4 mt-2">
              <Link
                href="/super-admin"
                className="flex items-center justify-between px-3 py-2.5 rounded-lg font-bold text-sm bg-gradient-to-r from-rose-500/10 to-orange-500/10 text-rose-400 hover:from-rose-500/20 hover:to-orange-500/20 border border-rose-500/20 transition-all duration-200 shadow-sm group"
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                  <span>Command Center</span>
                </div>
              </Link>
            </div>
          )}

          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="mb-5">
              <p className="px-3 text-[10px] font-black text-white/30 uppercase tracking-widest mb-1.5">{group.title}</p>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path));
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 text-left overflow-hidden group
                        ${isActive ? 'bg-white/10 text-white shadow-sm' : 'text-white/60 hover:bg-white/5 hover:text-white'}
                      `}
                    >
                      {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#48c9dc] rounded-r-md"></div>}
                      <div className={`${isActive ? 'text-[#48c9dc]' : 'text-white/50 group-hover:text-white/80'}`}>{item.icon}</div>
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* --- REFINED VOLUME-BASED QUOTA TRACKER --- */}
        {isMounted && (
          <div className="px-4 py-3 shrink-0">
            <Link 
              href="/dashboard/settings/billing" 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="block bg-[#082327] border border-white/5 p-4 rounded-2xl shadow-inner group hover:border-white/10 hover:bg-[#061b1e] transition-all cursor-pointer relative"
            >
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-white/40 group-hover:text-[#48c9dc] transition-colors" />
                        <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest group-hover:text-white/80 transition-colors">Usage Quota</span>
                    </div>
                </div>
                
                <div className="mb-4">
                    <div className="flex justify-between text-[11px] mb-1.5">
                        <span className="text-white/70 font-medium">Properties</span>
                        <span className="text-white font-bold tracking-wide">
                            {usedProps}&nbsp;<span className="text-white/40">/&nbsp;{maxProps}</span>
                        </span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-1.5 rounded-full transition-all duration-1000 ${isPro || isEnterprise ? 'bg-amber-400' : 'bg-[#48c9dc]'}`} style={{ width: `${propPercent}%` }}></div>
                    </div>
                </div>

                <div className="mb-2">
                    <div className="flex justify-between text-[11px] mb-1.5">
                        <span className="text-white/70 font-medium">Units</span>
                        <span className="text-white font-bold tracking-wide">
                            {usedUnits}&nbsp;<span className="text-white/40">/&nbsp;{maxUnits}</span>
                        </span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-1.5 rounded-full transition-all duration-1000 ${isPro || isEnterprise ? 'bg-amber-400' : 'bg-[#48c9dc]'}`} style={{ width: `${unitPercent}%` }}></div>
                    </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#48c9dc] uppercase tracking-widest">Manage Plan</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#48c9dc] group-hover:translate-x-1 transition-transform" />
                </div>
            </Link>
          </div>
        )}

        <div className="p-3 flex flex-col gap-1 bg-[#0a2c30] border-t border-white/5 shrink-0">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path));
            return (
              <Link key={item.name} href={item.path} onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${isActive ? 'bg-white/10 text-white shadow-sm' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
                <div className={`${isActive ? 'text-white' : 'text-white/50'}`}>{item.icon}</div>
                {item.name}
              </Link>
            );
          })}

          <div className="mt-2 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition duration-150 group cursor-default">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center overflow-hidden border border-white/5 text-white font-bold text-sm shrink-0">
                  {isMounted ? (
                    avatarUrl ? <img src={avatarUrl} alt={firstName} className="w-full h-full object-cover" /> : (firstName !== 'Admin' ? firstName.charAt(0).toUpperCase() : <Users className="w-5 h-5" />)
                  ) : <Loader2 className="w-4 h-4 animate-spin text-white/50" />}
                </div>
                <div className="text-left overflow-hidden">
                  <p className="text-sm font-bold text-white leading-tight truncate">{isMounted ? fullName : '...'}</p>
                  <p className="text-[11px] text-white/50 font-medium truncate">{isMounted ? email : '...'}</p>
                </div>
              </div>
              <button onClick={handleSignOut} className="text-white/30 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer" title="Sign Out">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}