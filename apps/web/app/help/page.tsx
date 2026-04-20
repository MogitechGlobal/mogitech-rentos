// apps/web/app/help/page.tsx
'use client';

import Link from 'next/link';
import { 
    Building2, Globe, ArrowRight, Mail, 
    Phone, LifeBuoy, BookOpen, MessageSquare 
} from 'lucide-react';
import Footer from '@/components/Footer';

export default function EnterpriseSupportPage() {
    return (
        <div className="min-h-screen bg-[#f8fafb] font-sans selection:bg-[#1f8898]/30 flex flex-col">

            {/* --- STANDARDIZED PUBLIC NAVBAR --- */}
            <nav className="bg-white border-b border-gray-100 py-3 sm:py-4 px-4 sm:px-6 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">

                    <Link href="/" className="flex items-center gap-2 shrink-0 group">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-[#1f8898] to-[#135a65] rounded-lg flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-300">
                            <Building2 className="w-4 h-4 sm:w-4 sm:h-4" />
                        </div>
                        <span className="text-lg sm:text-xl font-black text-gray-900 tracking-tight leading-none hidden sm:block">
                            Mogi<span className="text-[#1f8898]">RentOS</span>
                        </span>
                        <span className="text-[17px] font-black text-gray-900 tracking-tight leading-none sm:hidden">
                            Mogi<span className="text-[#1f8898]">Rent</span>
                        </span>
                    </Link>

                    <div className="flex items-center gap-3 sm:gap-6 shrink-0">
                        <Link href="/marketplace" className="text-xs sm:text-sm font-bold text-gray-500 hover:text-[#1f8898] transition-colors hidden md:flex items-center gap-1.5">
                            <Globe className="w-4 h-4" /> Marketplace
                        </Link>
                        <Link href="/pricing" className="text-xs sm:text-sm font-bold text-gray-500 hover:text-[#1f8898] transition-colors hidden lg:block">
                            Pricing
                        </Link>
                        <div className="h-4 w-px bg-gray-200 hidden md:block"></div>
                        <Link href="/login" className="text-xs sm:text-sm font-bold text-[#1f8898] bg-[#1f8898]/10 hover:bg-[#1f8898]/20 px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap">
                            Sign In <ArrowRight className="w-3 h-3 hidden sm:block" />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 w-full relative overflow-hidden pt-16 pb-24">
                
                {/* Background Elements */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 h-[600px] w-[600px] rounded-full bg-gradient-to-bl from-[#ebf3f5] via-[#1f8898]/5 to-transparent opacity-80 blur-3xl pointer-events-none"></div>

                <div className="max-w-5xl mx-auto px-6 lg:px-8 relative z-10">
                    
                    {/* --- HERO SECTION --- */}
                    <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ebf3f5] text-[#1f8898] text-[10px] font-black uppercase tracking-[0.15em] mb-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <LifeBuoy className="w-3.5 h-3.5" /> 24/7 Support
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 leading-[1.1]">
                            Enterprise <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1f8898] to-[#0f4952]">Support</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                            Whether you need help onboarding a 500-unit portfolio or configuring custom M-Pesa paybills, our technical team is here for you.
                        </p>
                    </div>

                    {/* --- SUPPORT CARDS --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
                        
                        {/* Technical Support */}
                        <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-black/5 hover:-translate-y-1 hover:shadow-[#1f8898]/10 transition-all duration-300 group">
                            <div className="w-14 h-14 bg-[#ebf3f5] rounded-2xl flex items-center justify-center mb-6 text-[#1f8898] border border-[#1f8898]/10 group-hover:scale-110 transition-transform">
                                <Mail className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Technical Support</h3>
                            <p className="text-base text-gray-500 font-medium mb-8 leading-relaxed">
                                Create a support ticket via email. Our engineering team typically responds within 2 hours during business days to resolve technical inquiries.
                            </p>
                            <a href="mailto:support@mogitechglobal.com" className="inline-flex font-black text-[#1f8898] hover:text-[#135a65] items-center gap-2 group/link">
                                support@mogitechglobal.com <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                            </a>
                        </div>

                        {/* Account Management */}
                        <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-black/5 hover:-translate-y-1 hover:shadow-[#1f8898]/10 transition-all duration-300 group">
                            <div className="w-14 h-14 bg-[#ebf3f5] rounded-2xl flex items-center justify-center mb-6 text-[#1f8898] border border-[#1f8898]/10 group-hover:scale-110 transition-transform">
                                <Phone className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Account Management</h3>
                            <p className="text-base text-gray-500 font-medium mb-8 leading-relaxed">
                                Need to upgrade your tier, schedule a personalized platform demo, or request custom feature development? Talk to our sales team.
                            </p>
                            <a href="https://mogitechglobal.com/contact.php" target="_blank" rel="noopener noreferrer" className="inline-flex font-black text-[#1f8898] hover:text-[#135a65] items-center gap-2 group/link">
                                Contact Sales Team <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                            </a>
                        </div>
                    </div>

                    {/* --- KNOWLEDGE BASE CTA --- */}
                    <div className="bg-gradient-to-br from-[#0d393f] to-[#0a2c31] rounded-[3rem] p-10 md:p-16 text-center border border-gray-800 shadow-2xl shadow-gray-900/20 relative overflow-hidden animate-in fade-in slide-in-from-bottom-12 duration-700 delay-500">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-b from-[#1f8898]/20 to-transparent rounded-full blur-3xl pointer-events-none -mt-64"></div>
                        
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-[#1f8898]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#1f8898]/30">
                                <BookOpen className="w-8 h-8 text-[#1f8898]" />
                            </div>
                            <h3 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">Official Documentation</h3>
                            <p className="text-lg text-teal-100/70 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
                                Explore step-by-step guides on setting up automated billing rules, importing historical tenant ledgers, and assigning maintenance staff.
                            </p>
                            <Link href="/docs" className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-[#1f8898] px-10 text-base font-bold text-[#ffffff] shadow-xl shadow-[#1f8898]/20 transition-all hover:bg-[#1a7684] active:scale-95">
                                Read the Docs <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                </div>
            </main>

            {/* --- PREMIUM FOOTER --- */}
            <Footer />
        </div>
    );
}