// apps/web/app/hunter/layout.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, Heart, LockOpen, MessageSquare, Settings, 
  LogOut, Menu, X, Building2, Search, UserCircle,
  Repeat, Loader2
} from 'lucide-react';

export default function HunterLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // User state for the profile card
    const [user, setUser] = useState<any>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [hasActiveLease, setHasActiveLease] = useState(false);

    useEffect(() => {
        // Close mobile menu on route change
        setIsMobileMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        // Lock body scroll when mobile menu is open
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isMobileMenuOpen]);

    useEffect(() => {
        // 1. Fetch user role & lease status from local storage
        setUserRole(localStorage.getItem('user_role'));
        setHasActiveLease(localStorage.getItem('has_active_lease') === 'true');

        // 2. Fetch user profile data to display in the sidebar
        const fetchProfile = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hunter/dashboard`, {
                    credentials: 'include'
                });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                }
            } catch (error) {
                console.error("Failed to load user profile", error);
            }
        };

        fetchProfile();
    }, []);

    const handleSignOut = async () => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            localStorage.removeItem('user_role');
            localStorage.removeItem('user_email');
            localStorage.removeItem('has_active_lease');
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

    const firstName = user?.first_name || 'Hunter';
    const lastName = user?.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();

    return (
        <div className="h-[100dvh] bg-[#f8fafb] font-sans selection:bg-[#1f8898]/30 overflow-hidden flex flex-col md:flex-row w-full">

            {/* --- MOBILE TOP BAR --- */}
            <div className="md:hidden flex items-center justify-between bg-white text-gray-900 p-4 z-40 border-b border-gray-200 shrink-0 w-full shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#ebf3f5] rounded-lg flex items-center justify-center border border-[#1f8898]/20 shadow-sm">
                        <Building2 className="w-5 h-5 text-[#1f8898]" />
                    </div>
                    <h1 className="text-lg font-black tracking-tight">Mogi<span className="text-[#1f8898]">RentOS</span></h1>
                </div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-500 hover:text-[#1f8898] transition-colors p-1 active:scale-95">
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* --- MOBILE BACKDROP --- */}
            <div 
                className={`fixed inset-0 bg-gray-900/60 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300 ${
                    isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setIsMobileMenuOpen(false)} 
            />

            {/* --- SIDEBAR --- */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-[85vw] max-w-[280px] bg-white flex flex-col border-r border-gray-200 
                transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shrink-0 shadow-2xl md:shadow-none
                md:static md:w-64 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                
                {/* Logo Area */}
                <div className="p-5 md:p-8 flex flex-col gap-1 border-b border-gray-100 shrink-0 bg-white">
                    <div className="flex items-center justify-between md:justify-start gap-2.5 mb-2">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 md:w-10 md:h-10 bg-[#ebf3f5] rounded-xl flex items-center justify-center border border-[#1f8898]/20 shadow-sm">
                                <Building2 className="w-5 h-5 md:w-6 md:h-6 text-[#1f8898]" />
                            </div>
                            <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight leading-none">Mogi<span className="text-[#1f8898]">RentOS</span></h1>
                        </div>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-400 hover:text-gray-900 p-1 bg-gray-50 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">House Hunter Portal</p>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto custom-scrollbar bg-white">
                    <p className="px-4 text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Menu</p>
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = pathname === tab.id;
                        return (
                            <Link
                                key={tab.id}
                                href={tab.id}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 overflow-hidden group active:scale-[0.98]
                                    ${isActive ? 'bg-[#1f8898] text-white shadow-md shadow-[#1f8898]/20' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-transparent hover:border-gray-200'}
                                `}
                            >
                                <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                                <span className="truncate">{tab.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom User Card & Actions */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col gap-3 shrink-0">
                    
                    {/* Workspace Switcher (If they also have a landlord/tenant account) */}
                    {(userRole === 'LANDLORD' || (userRole === 'TENANT' && hasActiveLease)) && (
                        <Link 
                            href={userRole === 'LANDLORD' ? '/dashboard' : '/portal'} 
                            className="flex items-center justify-center gap-1.5 w-full py-2.5 px-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-100 hover:text-[#1f8898] transition-all shadow-sm active:scale-95"
                        >
                            <Repeat className="w-3.5 h-3.5" /> 
                            Switch to {userRole === 'LANDLORD' ? 'Management' : 'Tenant Portal'}
                        </Link>
                    )}

                    {/* User Profile Card */}
                    <div className="flex items-center gap-3 px-2 py-1">
                        <div className="w-10 h-10 rounded-full bg-white text-[#1f8898] flex items-center justify-center font-black text-sm shrink-0 border border-gray-200 shadow-sm">
                            {user ? `${firstName.charAt(0)}${lastName.charAt(0) || ''}` : <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                        </div>
                        <div className="overflow-hidden flex-1">
                            <p className="text-sm font-bold text-gray-900 truncate tracking-tight">{user ? fullName : 'Loading Profile...'}</p>
                            <p className="text-xs font-medium text-gray-500 truncate">{user ? user.email : 'Please wait'}</p>
                        </div>
                    </div>

                    <button 
                        onClick={handleSignOut} 
                        className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-white hover:bg-rose-50 text-gray-600 hover:text-rose-600 font-bold text-sm transition-all border border-gray-200 hover:border-rose-200 shadow-sm active:scale-95"
                    >
                        <LogOut className="w-4 h-4 shrink-0" /> Sign Out
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