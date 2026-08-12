// apps/web/app/hunter/layout.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, Heart, LockOpen, MessageSquare, Settings, 
  LogOut, Menu, X, ShieldAlert, Building2, Search 
} from 'lucide-react';

export default function HunterLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleSignOut = async () => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            router.push('/login');
        }
    };

    const tabs = [
        { id: '/hunter', name: 'My Dashboard', icon: Home },
        { id: '/marketplace', name: 'Browse Properties', icon: Search },
        { id: '/hunter/unlocked', name: 'Unlocked Contacts', icon: LockOpen },
        { id: '/hunter/favorites', name: 'Saved Favorites', icon: Heart },
        { id: '/hunter/inquiries', name: 'Viewing Requests', icon: MessageSquare },
        { id: '/hunter/settings', name: 'Profile Settings', icon: Settings },
    ];

    return (
        <div className="h-[100dvh] bg-[#f8fafb] font-sans selection:bg-[#1f8898]/30 overflow-hidden flex flex-col md:flex-row w-full">

            {/* --- MOBILE TOP BAR --- */}
            <div className="md:hidden flex items-center justify-between bg-white text-gray-900 p-4 z-40 border-b border-gray-200 shrink-0 w-full shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#ebf3f5] rounded-lg flex items-center justify-center border border-[#1f8898]/20">
                        <Building2 className="w-5 h-5 text-[#1f8898]" />
                    </div>
                    <h1 className="text-lg font-black tracking-tight">Mogi<span className="text-[#1f8898]">RentOS</span></h1>
                </div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-500 hover:text-gray-900 transition-colors p-1">
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

            {/* --- SIDEBAR --- */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white flex flex-col border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} shrink-0 shadow-xl md:shadow-none`}>
                
                <div className="p-6 md:p-8 flex flex-col gap-1 hidden md:flex border-b border-gray-100">
                    <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-10 h-10 bg-[#ebf3f5] rounded-xl flex items-center justify-center border border-[#1f8898]/20">
                            <Building2 className="w-6 h-6 text-[#1f8898]" />
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none">Mogi<span className="text-[#1f8898]">RentOS</span></h1>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">House Hunter Portal</p>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar mt-6">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = pathname === tab.id;
                        return (
                            <Link
                                key={tab.id}
                                href={tab.id}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200
                                    ${isActive ? 'bg-[#1f8898] text-white shadow-md shadow-[#1f8898]/20' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-transparent hover:border-gray-200'}
                                `}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                                {tab.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button 
                        onClick={handleSignOut} 
                        className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-sm transition-colors border border-rose-100"
                    >
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT AREA --- */}
            <main className="flex-1 overflow-y-auto w-full relative min-h-0 bg-[#f8fafb]">
                {children}
            </main>
        </div>
    );
}