// apps/web/components/dashboard/Sidebar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import { 
  LayoutDashboard, Building2, DoorOpen, Users, FileSignature, 
  FileText, CreditCard, Wrench, PieChart, Settings, HelpCircle, 
  LogOut, ChevronsUpDown, Menu, X, Lock, Crown, Sparkles, Megaphone, Zap
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Pull data directly from our new Global Store!
  const { profile, isPremium, clearProfile } = useUserStore();

  const handleSignOut = () => {
    localStorage.removeItem('access_token');
    clearProfile();
    router.push('/login');
  };

  const mainNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, requiresPremium: false },
    { name: 'Properties', path: '/dashboard/properties', icon: <Building2 className="w-5 h-5" />, requiresPremium: false },
    { name: 'Units', path: '/dashboard/units', icon: <DoorOpen className="w-5 h-5" />, requiresPremium: false },
    { name: 'Tenants', path: '/dashboard/tenants', icon: <Users className="w-5 h-5" />, requiresPremium: false },
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
        
        <div className="h-16 hidden md:flex items-center px-6 border-b border-white/10 bg-[#0d393f]">
          <h1 className="text-xl font-extrabold tracking-tight text-white">Mogi<span className="text-[#ebf3f5] opacity-80">RentOS</span></h1>
        </div>
        
        <div className="p-4 border-b border-white/10">
          <button className="w-full flex items-center justify-between p-2 hover:bg-white/5 rounded-xl transition duration-150 border border-transparent hover:border-white/10 group cursor-default">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center overflow-hidden text-[#ffffff] font-bold shadow-sm shrink-0 border border-white/10 relative">
                {isPremium && <Crown className="absolute -top-1 -right-1 w-3 h-3 text-amber-400" />}
                <Building2 className="w-4 h-4" />
              </div>
              <div className="text-left overflow-hidden">
                <h2 className="text-sm font-bold text-white leading-tight truncate">{companyName}</h2>
                <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${isPremium ? 'bg-amber-400/20 text-amber-300 border-amber-400/30' : 'bg-white/10 text-white/70 border-white/10'}`}>
                  {isPremium ? 'PREMIUM' : 'FREE PLAN'}
                </span>
              </div>
            </div>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3 custom-scrollbar">
          <p className="px-3 text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Main</p>
          {mainNavItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path));
            const isLocked = item.requiresPremium && !isPremium;

            return (
              <button 
                key={item.name} 
                onClick={() => {
                  if (isLocked) {
                    router.push('/dashboard/settings/billing'); // Direct routing to upgrade
                  } else {
                    router.push(item.path);
                    setIsMobileMenuOpen(false);
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 text-left ${isActive ? 'bg-[#1f8898] text-white shadow-md' : isLocked ? 'text-white/40 hover:bg-white/5 hover:text-white/70' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
              >
                <div className={`${isActive ? 'text-white' : isLocked ? 'text-white/30' : 'text-white/60'}`}>{item.icon}</div>
                {item.name}
                {isLocked && <Lock className="w-3.5 h-3.5 ml-auto text-amber-400/70" />}
              </button>
            );
          })}
        </div>

        {!isPremium && (
          <div className="px-4 py-2">
            <div className="bg-gradient-to-br from-amber-400/20 to-amber-600/20 border border-amber-400/30 p-4 rounded-xl flex flex-col items-start relative overflow-hidden">
              <Crown className="w-5 h-5 text-amber-400 mb-2" />
              <h4 className="text-white text-sm font-black tracking-tight mb-1">Unlock Premium</h4>
              <p className="text-white/60 text-[11px] font-medium leading-tight mb-3">Get automated billing & analytics.</p>
              <button onClick={() => router.push('/dashboard/settings/billing')} className="w-full bg-amber-500 hover:bg-amber-400 text-[#0d393f] text-xs font-black py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20">
                <Sparkles className="w-3.5 h-3.5" /> Upgrade Now
              </button>
            </div>
          </div>
        )}

        <div className="p-3 border-t border-white/10 flex flex-col gap-1 bg-[#0d393f]">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path));
            return (
              <Link key={item.name} href={item.path} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${isActive ? 'bg-[#1f8898] text-white shadow-md' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
                <div className={`${isActive ? 'text-white' : 'text-white/60'}`}>{item.icon}</div>
                {item.name}
              </Link>
            );
          })}

          <div className="mt-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-white/10 transition duration-150 group cursor-default">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center overflow-hidden border border-white/5 text-white font-bold text-sm shrink-0">
                  {avatarUrl ? <img src={avatarUrl} alt={firstName} className="w-full h-full object-cover" /> : (firstName !== 'Admin' ? firstName.charAt(0).toUpperCase() : <Users className="w-5 h-5" />)}
                </div>
                <div className="text-left overflow-hidden">
                  <p className="text-sm font-bold text-white leading-tight truncate">{fullName}</p>
                  <p className="text-[11px] text-white/60 font-medium truncate">{email}</p>
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