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
  Globe, Calculator, Target, ArrowRight, Activity, Shield, ShieldCheck
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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  const handleSignOut = () => {
    localStorage.removeItem('access_token');
    clearProfile();
    router.push('/login');
  };

  // ==========================================
  // ROLE-BASED ACCESS CONTROL (RBAC) LOGIC
  // ==========================================
  const isStaffWorkspace = !!profile?.staff;
  const staffRoleType = profile?.staff?.role_type || 'NONE'; 

  const isLandlordOrAdmin = !isStaffWorkspace; 
  const isFinance = staffRoleType === 'FINANCE';
  const isCaretaker = staffRoleType === 'CARETAKER';
  const isVendor = staffRoleType === 'VENDOR'; 

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
  const authorizedAdminEmails = ['admin@mogitech.com', 'mongerijacob@gmail.com'];
  const userEmail = (profile?.user?.email || profile?.email || '').toLowerCase().trim();
  const isAdmin = authorizedAdminEmails.includes(userEmail);

  // --- DETECT MULTI-WORKSPACE (TENANT) ---
  const hasTenantAccess = !!profile?.tenant || !!profile?.user?.tenant;

  // ==========================================
  // CORPORATE NAV GROUPING (FILTERED BY ROLE)
  // ==========================================
  const navGroups = [
    {
      title: 'Overview',
      hidden: isVendor || isCaretaker, 
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { name: 'Reports', path: '/dashboard/reports', icon: <PieChart className="w-4 h-4" /> },
      ]
    },
    {
      title: 'Portfolio',
      hidden: isVendor, 
      items: [
        ...(isCaretaker ? [] : [{ name: 'Properties', path: '/dashboard/properties', icon: <Building2 className="w-4 h-4" /> }]),
        { name: 'Units', path: '/dashboard/units', icon: <DoorOpen className="w-4 h-4" /> },
        { name: 'Tenants', path: '/dashboard/tenants', icon: <Users className="w-4 h-4" /> },
        ...(isCaretaker ? [] : [{ name: 'Leases', path: '/dashboard/leases', icon: <FileSignature className="w-4 h-4" /> }]),
      ]
    },
    {
      title: 'Financials',
      hidden: !isLandlordOrAdmin && !isFinance, 
      items: [
        { name: 'Accounting', path: '/dashboard/accounting', icon: <Calculator className="w-4 h-4" /> },
        { name: 'Invoices', path: '/dashboard/billing', icon: <FileText className="w-4 h-4" /> },
        { name: 'Payments', path: '/dashboard/payments', icon: <CreditCard className="w-4 h-4" /> },
        { name: 'Utility Billing', path: '/dashboard/utilities', icon: <Zap className="w-4 h-4" /> },
      ]
    },
    {
      title: 'Operations',
      hidden: false, 
      items: [
        { name: 'Maintenance', path: '/dashboard/maintenance', icon: <Wrench className="w-4 h-4" /> },
        ...(isVendor ? [] : [
          ...(isCaretaker ? [] : [{ name: 'Leads (CRM)', path: '/dashboard/leads', icon: <Target className="w-4 h-4" /> }]),
          { name: 'Communications', path: '/dashboard/communications', icon: <Megaphone className="w-4 h-4" /> },
          ...(isCaretaker ? [] : [{ name: 'Marketplace', path: '/dashboard/marketplace', icon: <Globe className="w-4 h-4" /> }]),
        ])
      ]
    }
  ];

  const bottomNavItems = [
    ...(isLandlordOrAdmin ? [
      { name: 'Team & Staff', path: '/dashboard/team', icon: <Shield className="w-4 h-4" /> },
      { name: 'Audit Logs', path: '/dashboard/audit', icon: <ShieldCheck className="w-4 h-4" /> },
      { name: 'Settings', path: '/dashboard/settings', icon: <Settings className="w-4 h-4" /> }
    ] : []),
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
      {/* Mobile Top Bar (Behind Drawer) */}
      <div className="md:hidden flex items-center justify-between bg-[#ffffff] border-b border-gray-200 text-gray-900 p-4 z-20 shadow-sm shrink-0">
        <h1 className="text-xl font-extrabold tracking-tight">Mogi<span className="text-[#1f8898]">RentOS</span></h1>
        <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-500 hover:text-[#1f8898] p-1 focus:outline-none transition active:scale-95">
          <Menu className="w-7 h-7" />
        </button>
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

        {/* Compact Header & Mobile Close */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-white/5 shrink-0 bg-[#0d393f]">
          <h1 className="text-lg font-extrabold tracking-tight text-white">Mogi<span className="text-[#ebf3f5] opacity-80">RentOS</span></h1>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-white/50 hover:text-white p-1 rounded-lg hover:bg-white/10 transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Compact Workspace Indicator */}
        <div className="p-3 border-b border-white/5 shrink-0">
          <button className="w-full flex items-center justify-between p-1.5 hover:bg-white/5 rounded-xl transition duration-150 border border-transparent hover:border-white/10 group cursor-default">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center overflow-hidden text-[#ffffff] shadow-sm shrink-0 border border-white/10 relative">
                {isMounted && isPro && isLandlordOrAdmin && <Crown className="absolute -top-1 -right-1 w-3 h-3 text-amber-400" />}
                {isMounted && isEnterprise && isLandlordOrAdmin && <Building2 className="absolute -top-1 -right-1 w-3 h-3 text-purple-400" />}
                {isMounted && isStandard && isLandlordOrAdmin && <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-blue-400" />}
                {isMounted && isBasic && isLandlordOrAdmin && <Star className="absolute -top-1 -right-1 w-3 h-3 text-[#48c9dc]" />}
                
                {!isLandlordOrAdmin ? <Shield className="w-3.5 h-3.5 text-[#48c9dc]" /> : <Building2 className="w-3.5 h-3.5" />}
              </div>
              <div className="text-left overflow-hidden">
                <h2 className="text-[13px] font-bold text-white leading-tight truncate">{isMounted ? companyName : 'Loading...'}</h2>
                {isMounted && (
                  <span className={`text-[8px] font-black uppercase tracking-widest px-1 py-0.5 rounded mt-0.5 inline-block
                    ${!isLandlordOrAdmin ? 'bg-[#1f8898]/30 text-[#48c9dc]' : 
                      isEnterprise ? 'bg-purple-500/20 text-purple-300' :
                      isPro ? 'bg-amber-400/20 text-amber-300' :
                      isStandard ? 'bg-blue-500/20 text-blue-300' :
                      isBasic ? 'bg-[#1f8898]/30 text-[#48c9dc]' :
                        'bg-emerald-500/20 text-emerald-300'}`}>
                    {isLandlordOrAdmin ? `${currentPlan} PLAN` : `${staffRoleType} ACCESS`}
                  </span>
                )}
              </div>
            </div>
          </button>
        </div>

        {/* Maximized Navigation Area with Overscroll Contain */}
        <div className="flex-1 overflow-y-auto overscroll-contain py-1 flex flex-col px-2 custom-scrollbar">

          {/* --- HYDRATION SAFE SUPER ADMIN QUICK ACCESS --- */}
          {isMounted && isAdmin && (
            <div className="mb-2 mt-1 px-1">
              <Link
                href="/super-admin"
                className="flex items-center justify-between px-2 py-2.5 md:py-1.5 rounded-lg font-bold text-[13px] bg-gradient-to-r from-rose-500/10 to-orange-500/10 text-rose-400 hover:from-rose-500/20 hover:to-orange-500/20 border border-rose-500/20 transition-all duration-200 shadow-sm group active:scale-[0.98]"
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
                  <span>Command Center</span>
                </div>
              </Link>
            </div>
          )}

          {navGroups.filter(group => !group.hidden).map((group, groupIdx) => (
            <div key={groupIdx} className="mb-3 px-1">
              <p className="px-2 text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">{group.title}</p>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path));
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`relative w-full flex items-center gap-2.5 px-2 py-2.5 md:py-1.5 rounded-lg text-[13px] font-semibold transition-all duration-200 text-left overflow-hidden group active:scale-[0.98]
                        ${isActive ? 'bg-[#48c9dc]/10 text-[#48c9dc] shadow-sm' : 'text-white/60 hover:bg-white/5 hover:text-white'}
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

        {/* --- ULTRA-COMPACT USAGE QUOTA (LANDLORDS ONLY) --- */}
        {isMounted && isLandlordOrAdmin && (
          <div className="px-3 py-2 shrink-0 border-t border-white/5">
            <Link 
              href="/dashboard/settings/billing" 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="block bg-white/5 border border-white/10 p-2.5 rounded-xl group hover:bg-white/10 transition-colors active:scale-[0.98]"
            >
                <div className="flex justify-between items-center mb-1.5">
                   <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest">Usage Quota</span>
                   <span className="text-[9px] font-bold text-[#48c9dc] flex items-center gap-1">Manage <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform"/></span>
                </div>
                <div className="flex items-center gap-3">
                   <div className="flex-1">
                      <div className="flex justify-between text-[10px] mb-0.5">
                         <span className="text-white/70">Props</span>
                         <span className="text-white font-bold">{usedProps}/{maxProps}</span>
                      </div>
                      <div className="w-full bg-black/30 rounded-full h-1">
                         <div className={`h-1 rounded-full transition-all duration-1000 ${isPro || isEnterprise ? 'bg-amber-400' : 'bg-[#48c9dc]'}`} style={{ width: `${propPercent}%` }}></div>
                      </div>
                   </div>
                   <div className="flex-1">
                      <div className="flex justify-between text-[10px] mb-0.5">
                         <span className="text-white/70">Units</span>
                         <span className="text-white font-bold">{usedUnits}/{maxUnits}</span>
                      </div>
                      <div className="w-full bg-black/30 rounded-full h-1">
                         <div className={`h-1 rounded-full transition-all duration-1000 ${isPro || isEnterprise ? 'bg-amber-400' : 'bg-[#48c9dc]'}`} style={{ width: `${unitPercent}%` }}></div>
                      </div>
                   </div>
                </div>
            </Link>
          </div>
        )}

        {/* --- BOTTOM ACTIONS & PROFILE --- */}
        <div className="px-3 pb-4 md:pb-2 flex flex-col gap-0.5 shrink-0 pt-2 border-t border-white/5">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path));
            return (
              <Link key={item.name} href={item.path} onClick={() => setIsMobileMenuOpen(false)} className={`relative w-full flex items-center gap-2.5 px-2 py-2.5 md:py-1.5 rounded-lg text-[13px] font-semibold transition-all duration-200 text-left overflow-hidden group active:scale-[0.98] ${isActive ? 'bg-[#48c9dc]/10 text-[#48c9dc] shadow-sm' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#48c9dc] rounded-r-md"></div>}
                <div className={`${isActive ? 'text-[#48c9dc]' : 'text-white/50 group-hover:text-white/80'}`}>{item.icon}</div>
                {item.name}
              </Link>
            );
          })}

          <div className="mt-2 pt-2 border-t border-white/5">
            {/* --- WORKSPACE SWITCHER --- */}
            {isMounted && hasTenantAccess && (
               <Link href="/portal" className="flex items-center justify-center gap-1.5 mb-2 p-2.5 md:p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-400/20 hover:bg-blue-400/20 transition-all font-bold text-[12px] md:text-[11px] shadow-sm active:scale-95">
                 <DoorOpen className="w-3.5 h-3.5" /> Switch to Tenant Portal
               </Link>
            )}

            {/* --- USER PROFILE --- */}
            <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white/5 transition duration-150 group cursor-default">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-9 h-9 md:w-8 md:h-8 bg-white/10 rounded-full flex items-center justify-center overflow-hidden border border-white/5 text-white font-bold text-[11px] shrink-0">
                  {isMounted ? (
                    avatarUrl ? <img src={avatarUrl} alt={firstName} className="w-full h-full object-cover" /> : (firstName !== 'Admin' ? firstName.charAt(0).toUpperCase() : <Users className="w-4 h-4 md:w-3.5 md:h-3.5" />)
                  ) : <Loader2 className="w-3 h-3 animate-spin text-white/50" />}
                </div>
                <div className="text-left overflow-hidden">
                  <p className="text-[13px] md:text-[12px] font-bold text-white leading-tight truncate">{isMounted ? fullName : '...'}</p>
                  <p className="text-[11px] md:text-[10px] text-white/50 font-medium truncate">{isMounted ? email : '...'}</p>
                </div>
              </div>
              <button onClick={handleSignOut} className="text-white/30 hover:text-rose-400 p-2 md:p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer active:scale-95" title="Sign Out">
                <LogOut className="w-5 h-5 md:w-4 md:h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}