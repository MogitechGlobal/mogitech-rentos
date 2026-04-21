// apps/web/app/privacy/page.tsx
import Link from 'next/link';
import { 
  Building2, ArrowRight, ShieldCheck, Database, 
  Activity, Globe, Mail, Lock, CheckCircle2 
} from 'lucide-react';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#ffffff] flex flex-col font-sans selection:bg-[#1f8898]/30">
      
       {/* --- STANDARDIZED PUBLIC NAVBAR COMPONENT --- */}
      <Navbar />

      {/* --- MAIN CONTENT LAYOUT --- */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24 flex flex-col lg:flex-row gap-12 lg:gap-24">
        
        {/* Sticky Desktop Sidebar Navigation */}
        <aside className="hidden lg:block lg:w-1/4 shrink-0">
            <div className="sticky top-32">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Contents</h3>
                <nav className="space-y-4 text-sm font-bold text-gray-500">
                    <a href="#information" className="block hover:text-[#1f8898] hover:translate-x-1 transition-all">1. Information We Collect</a>
                    <a href="#usage" className="block hover:text-[#1f8898] hover:translate-x-1 transition-all">2. How We Use It</a>
                    <a href="#security" className="block hover:text-[#1f8898] hover:translate-x-1 transition-all">3. Security & Encryption</a>
                    <a href="#sharing" className="block hover:text-[#1f8898] hover:translate-x-1 transition-all">4. Third-Party Sharing</a>
                </nav>

                <div className="mt-12 p-6 bg-[#f8fafb] rounded-[2rem] border border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-4 shadow-sm">
                        <ShieldCheck className="w-5 h-5 text-[#1f8898]" />
                    </div>
                    <p className="text-sm font-black text-gray-900 mb-2">Data Protection Officer</p>
                    <p className="text-xs text-gray-500 font-medium mb-4 leading-relaxed">For any privacy-related inquiries or data deletion requests.</p>
                    <a href="mailto:privacy@mogitechglobal.com" className="text-xs font-bold text-[#1f8898] flex items-center gap-2 hover:underline">
                        <Mail className="w-3.5 h-3.5" /> Contact DPO
                    </a>
                </div>
            </div>
        </aside>

        {/* Legal Prose Content */}
        <div className="lg:w-3/4 max-w-3xl">
            
            {/* Header */}
            <div className="mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ebf3f5] text-[#1f8898] text-[10px] font-black uppercase tracking-[0.15em] mb-8">
                    <Lock className="w-3.5 h-3.5" /> Legal & Compliance
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight mb-6 leading-[1.1]">
                    Privacy Policy
                </h1>
                <p className="text-gray-400 font-bold tracking-wide uppercase text-xs">
                    Last Updated: April 15, 2026
                </p>
            </div>

            <div className="space-y-16 text-gray-600">
                <p className="text-xl leading-relaxed font-medium text-gray-500">
                    Mogitech Global Ltd ("we", "our", or "us") is committed to protecting the privacy and security of the data handled by the MogiRentOS platform. This policy explains how we collect, use, and safeguard your information.
                </p>

                {/* Section 1 */}
                <section id="information" className="scroll-mt-32">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 shrink-0 shadow-sm">
                            <Database className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">1. Information We Collect</h2>
                    </div>
                    <ul className="space-y-5">
                        <li className="flex items-start gap-4">
                            <CheckCircle2 className="w-5 h-5 text-[#1f8898] shrink-0 mt-0.5" />
                            <p className="text-base leading-relaxed">
                                <strong className="text-gray-900 font-black block mb-1">Account Information</strong> 
                                Your name, company name, email address, and phone number provided during registration.
                            </p>
                        </li>
                        <li className="flex items-start gap-4">
                            <CheckCircle2 className="w-5 h-5 text-[#1f8898] shrink-0 mt-0.5" />
                            <p className="text-base leading-relaxed">
                                <strong className="text-gray-900 font-black block mb-1">Tenant Data</strong> 
                                Personally Identifiable Information (PII) of your tenants that you upload, including lease details, phone numbers, and balances.
                            </p>
                        </li>
                        <li className="flex items-start gap-4">
                            <CheckCircle2 className="w-5 h-5 text-[#1f8898] shrink-0 mt-0.5" />
                            <p className="text-base leading-relaxed">
                                <strong className="text-gray-900 font-black block mb-1">Financial Data</strong> 
                                Masked payment gateway credentials (M-Pesa Consumer Keys) and transaction IPN logs received from banking partners.
                            </p>
                        </li>
                    </ul>
                </section>

                {/* Section 2 */}
                <section id="usage" className="scroll-mt-32 border-t border-gray-100 pt-16">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 shrink-0 shadow-sm">
                            <Activity className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">2. How We Use Your Information</h2>
                    </div>
                    <p className="text-lg leading-relaxed font-medium">
                        We use this data strictly to provide and improve the MogiRentOS platform. This workflow includes:
                    </p>
                    <ul className="mt-6 space-y-3 list-disc pl-6 text-base font-medium">
                        <li>Authenticating your secure logins.</li>
                        <li>Processing automated rent reconciliation via API webhooks.</li>
                        <li>Sending SMS/Email communications to your tenants on your behalf.</li>
                        <li>Billing you for your SaaS subscription.</li>
                    </ul>
                </section>

                {/* Section 3 */}
                <section id="security" className="scroll-mt-32 border-t border-gray-100 pt-16">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 shrink-0 shadow-sm">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">3. Data Security & Encryption</h2>
                    </div>
                    <p className="text-lg leading-relaxed font-medium">
                        Security is our top priority. All sensitive database fields (including API keys, passwords, and custom lease documents) are encrypted using industry-standard <strong className="text-gray-900">AES-256 encryption</strong>. 
                    </p>
                    <p className="text-lg leading-relaxed font-medium mt-4">
                        All network traffic between your browser, our servers, and third-party APIs is secured via strict SSL/TLS cryptographic protocols to ensure your financial ledgers remain strictly confidential.
                    </p>
                </section>

                {/* Section 4 */}
                <section id="sharing" className="scroll-mt-32 border-t border-gray-100 pt-16">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 shrink-0 shadow-sm">
                            <Globe className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">4. Third-Party Sharing</h2>
                    </div>
                    <p className="text-lg leading-relaxed font-medium bg-[#f8fafb] p-6 rounded-2xl border border-gray-100 mb-6 text-gray-900">
                        <strong>We do not sell your data.</strong> We have never sold, and will never sell, your personal or tenant information to advertisers or data brokers.
                    </p>
                    <p className="text-lg leading-relaxed font-medium">
                        We only share necessary data payloads with trusted third-party sub-processors required to operate the core service architecture. These partners include:
                    </p>
                    <ul className="mt-6 space-y-3 list-disc pl-6 text-base font-medium">
                        <li><strong>Safaricom PLC:</strong> For processing M-Pesa STK push requests and IPN notifications.</li>
                        <li><strong>KCB / Bank Partners:</strong> For direct banking webhook integrations.</li>
                        <li><strong>Cloudflare & AWS:</strong> For secure cloud hosting, edge networking, and DDOS mitigation.</li>
                    </ul>
                </section>

                {/* Mobile-Only Contact Box */}
                <div className="lg:hidden mt-16 p-8 bg-[#f8fafb] rounded-[2rem] border border-gray-100">
                    <ShieldCheck className="w-8 h-8 text-[#1f8898] mb-4" />
                    <p className="text-lg font-black text-gray-900 mb-2">Privacy inquiries?</p>
                    <p className="text-sm text-gray-500 font-medium mb-6">Contact our Data Protection Officer for any privacy-related inquiries or data deletion requests.</p>
                    <a href="mailto:privacy@mogitechglobal.com" className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-bold text-sm">
                        <Mail className="w-4 h-4" /> privacy@mogitechglobal.com
                    </a>
                </div>

            </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}