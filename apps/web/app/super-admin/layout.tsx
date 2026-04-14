// apps/web/app/super-admin/layout.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import {
    LayoutDashboard, Users, Activity, ShieldAlert,
    Database, Menu, X, PlugZap, Megaphone, ShieldCheck, Headset, Settings, UserCog, BookOpen, FileText, Wrench, Star, ChevronDown, CheckCircle2,
    CreditCard, TerminalSquare, BarChart3,
    Shield,
    LayoutTemplate,
    LogOut
} from 'lucide-react';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { clearProfile } = useUserStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // --- CRITICAL FIX: BYPASS LAYOUT FOR LOGIN PAGE ---
    // If the user is on the login page, render it full-screen without the sidebar/header.
    if (pathname === '/super-admin/login') {
        return <div className="h-[100dvh] w-full bg-[#0d393f]">{children}</div>;
    }

    const handleSignOut = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_role');
        clearProfile();
        router.push('/super-admin/login');
    };

    const tabs = [
        { id: '/super-admin', name: 'Platform Overview', icon: LayoutDashboard },
        { id: '/super-admin/landlords', name: 'Manage Landlords', icon: Users },
        { id: '/super-admin/analytics', name: 'Business Intelligence', icon: BarChart3 },
        { id: '/super-admin/billing', name: 'Platform Revenue', icon: CreditCard },
        { id: '/super-admin/transactions', name: 'System Logs & IPNs', icon: Activity },
        { id: '/super-admin/system', name: 'System Health & Logs', icon: TerminalSquare },
        { id: '/super-admin/integrations', name: 'Global Integrations', icon: PlugZap },
        { id: '/super-admin/announcements', name: 'Communications', icon: Megaphone },
        { id: '/super-admin/team', name: 'Identity & Access (RBAC)', icon: Shield },
        { id: '/super-admin/audit-logs', name: 'Admin Audit Ledger', icon: ShieldCheck },
        { id: '/super-admin/support', name: 'Helpdesk Tickets', icon: Headset },
        { id: '/super-admin/templates', name: 'Document Library', icon: LayoutTemplate },
        { id: '/super-admin/settings', name: 'Platform Settings', icon: Settings },
    ];

    return (
        <div className="h-[100dvh] bg-gray-50/50 font-sans selection:bg-[#1f8898]/30 overflow-hidden flex flex-col md:flex-row w-full">

            {/* --- MOBILE TOP BAR --- */}
            <div className="md:hidden flex items-center justify-between bg-[#0B131E] text-white p-4 z-40 border-b border-gray-800 shrink-0 w-full">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-gradient-to-br from-[#1f8898] to-[#12555f] rounded-md flex items-center justify-center shadow-inner">
                        <ShieldAlert className="w-4 h-4 text-white" />
                    </div>
                    <h1 className="text-lg font-bold tracking-tight">Mogi<span className="text-[#1f8898] font-black">RentOS</span></h1>
                </div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-400 hover:text-white transition-colors p-1">
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* --- MOBILE BACKDROP --- */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* --- SUPER ADMIN SIDEBAR --- */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0B131E] flex flex-col border-r border-gray-800 transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} shrink-0`}>

                <div className="p-6 md:p-8 flex flex-col gap-1">
                    <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#1f8898] to-[#12555f] rounded-lg flex items-center justify-center shadow-inner">
                            <ShieldAlert className="w-4 h-4 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-white tracking-tight leading-none">Mogi<span className="text-[#1f8898] font-black">RentOS</span></h1>
                    </div>
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Platform Administration</p>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
                    <p className="px-3 text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3 mt-4">Menu</p>
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = pathname === tab.id;
                        return (
                            <Link
                                key={tab.id}
                                href={tab.id}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-200
                                    ${isActive ? 'bg-[#1f8898]/10 text-[#1f8898]' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}
                                `}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? 'text-[#1f8898]' : 'text-gray-500'}`} />
                                {tab.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <button 
                        onClick={handleSignOut} 
                        className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 font-bold text-sm transition-colors border border-rose-500/20"
                    >
                        <LogOut className="w-4 h-4" /> Secure Sign Out
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT AREA --- */}
            <main className="flex-1 overflow-y-auto w-full relative min-h-0 bg-gray-50/30">
                <header className="hidden md:flex items-center justify-between px-8 py-5 border-b border-gray-200 bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 tracking-tight">Super Admin Dashboard</h2>
                        <p className="text-xs text-gray-500 font-medium mt-0.5 flex items-center gap-1.5"><Database className="w-3 h-3" /> Production Environment Connected</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">System Admin</p>
                            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online</p>
                        </div>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 flex flex-col h-full">
                    {/* Page Content Injects Here automatically */}
                    {children}
                </div>
            </main>
        </div>
    );
}