// apps/web/app/help/page.tsx
/* eslint-disable */
import Link from 'next/link';
import { Building2, Mail, Phone, LifeBuoy, BookOpen, MessageSquare, ArrowLeft, ArrowRight } from 'lucide-react';

export default function EnterpriseSupportPage() {
    return (
        <div className="min-h-screen bg-[#f8fafb] font-sans selection:bg-[#1f8898]/30 flex flex-col">

            {/* Minimal Header */}
            <header className="w-full border-b border-gray-200 bg-white">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
                    <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1f8898] text-[#ffffff]">
                            <Building2 className="h-6 w-6" />
                        </div>
                        <span className="text-2xl font-black tracking-tight text-gray-900">
                            Mogi<span className="text-[#1f8898]">RentOS</span>
                        </span>
                    </Link>
                    <Link href="/" className="text-sm font-bold text-gray-500 hover:text-[#1f8898] flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-16 md:py-24">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">Enterprise Support</h1>
                    <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto">
                        Whether you need help onboarding a 500-unit portfolio or configuring custom M-Pesa paybills, our technical team is here for you.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                    {/* Priority Email Support */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm hover:border-[#1f8898]/30 transition-colors">
                        <div className="w-12 h-12 bg-[#ebf3f5] rounded-xl flex items-center justify-center mb-6 text-[#1f8898]">
                            <Mail className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">Technical Support</h3>
                        <p className="text-sm text-gray-500 font-medium mb-6">Create a support ticket via email. Our engineering team typically responds within 2 hours during business days.</p>
                        <a href="mailto:support@mogitechglobal.com" className="inline-flex font-bold text-[#1f8898] hover:text-[#1a7684] items-center gap-2">
                            support@mogitechglobal.com <ArrowRight className="w-4 h-4" />
                        </a>
                    </div>

                    {/* Sales & Account Management */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm hover:border-[#1f8898]/30 transition-colors">
                        <div className="w-12 h-12 bg-[#ebf3f5] rounded-xl flex items-center justify-center mb-6 text-[#1f8898]">
                            <Phone className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">Account Management</h3>
                        <p className="text-sm text-gray-500 font-medium mb-6">Need to upgrade your tier, schedule a demo, or request custom feature development? Talk to sales.</p>
                        <a href="https://mogitechglobal.com/contact.php" target="_blank" rel="noopener noreferrer" className="inline-flex font-bold text-[#1f8898] hover:text-[#1a7684] items-center gap-2">
                            Contact Sales Team <ArrowRight className="w-4 h-4" />
                        </a>
                    </div>
                </div>

                {/* Knowledge Base Teaser */}
                <div className="bg-gray-900 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1f8898]/20 via-transparent to-transparent opacity-60"></div>
                    <div className="relative z-10">
                        <LifeBuoy className="w-12 h-12 text-[#1f8898] mx-auto mb-6" />
                        <h3 className="text-2xl font-black text-white mb-4">Official Documentation</h3>
                        <p className="text-gray-400 font-medium max-w-lg mx-auto mb-8">
                            Explore step-by-step guides on setting up automated billing, importing tenant ledgers, and assigning maintenance staff.
                        </p>
                        <Link href="/docs" className="inline-block bg-[#1f8898] hover:bg-[#1a7684] text-white px-8 py-3.5 rounded-xl font-bold transition-colors shadow-lg shadow-[#1f8898]/20 hover:-translate-y-0.5 active:translate-y-0">
                            Read the Docs
                        </Link>
                    </div>
                </div>
            </main>

            {/* Minimal Footer */}
            <footer className="w-full border-t border-gray-200 bg-white py-8 text-center">
                <p className="text-xs font-bold text-gray-400">
                    &copy; {new Date().getFullYear()} Mogitech Global Ltd. All rights reserved.
                </p>
            </footer>
        </div>
    );
}