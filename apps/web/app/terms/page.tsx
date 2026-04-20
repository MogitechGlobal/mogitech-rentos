// apps/web/app/terms/page.tsx
import Link from 'next/link';
import { 
  Building2, ArrowRight, ShieldCheck, Database, 
  Activity, Globe, Mail, Gavel, UserCheck, 
  CreditCard, AlertTriangle
} from 'lucide-react';
import Footer from '@/components/Footer';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#ffffff] flex flex-col font-sans selection:bg-[#1f8898]/30">
      
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

      {/* --- MAIN CONTENT LAYOUT --- */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24 flex flex-col lg:flex-row gap-12 lg:gap-24">
        
        {/* Sticky Desktop Sidebar Navigation */}
        <aside className="hidden lg:block lg:w-1/4 shrink-0">
            <div className="sticky top-32">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Contents</h3>
                <nav className="space-y-4 text-sm font-bold text-gray-500">
                    <a href="#account" className="block hover:text-[#1f8898] hover:translate-x-1 transition-all">1. Account & Security</a>
                    <a href="#subscriptions" className="block hover:text-[#1f8898] hover:translate-x-1 transition-all">2. Subscription Tiers</a>
                    <a href="#integrations" className="block hover:text-[#1f8898] hover:translate-x-1 transition-all">3. Financial Integrations</a>
                    <a href="#data" className="block hover:text-[#1f8898] hover:translate-x-1 transition-all">4. Data Ownership</a>
                    <a href="#termination" className="block hover:text-[#1f8898] hover:translate-x-1 transition-all">5. Termination</a>
                </nav>

                <div className="mt-12 p-6 bg-[#f8fafb] rounded-[2rem] border border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-4 shadow-sm">
                        <Gavel className="w-5 h-5 text-[#1f8898]" />
                    </div>
                    <p className="text-sm font-black text-gray-900 mb-2">Legal Team</p>
                    <p className="text-xs text-gray-500 font-medium mb-4 leading-relaxed">For questions regarding these terms or enterprise SLA agreements.</p>
                    <a href="mailto:legal@mogitechglobal.com" className="text-xs font-bold text-[#1f8898] flex items-center gap-2 hover:underline">
                        <Mail className="w-3.5 h-3.5" /> Contact Legal
                    </a>
                </div>
            </div>
        </aside>

        {/* Legal Prose Content */}
        <div className="lg:w-3/4 max-w-3xl">
            
            {/* Header */}
            <div className="mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ebf3f5] text-[#1f8898] text-[10px] font-black uppercase tracking-[0.15em] mb-8">
                    <Gavel className="w-3.5 h-3.5" /> Legal Agreement
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight mb-6 leading-[1.1]">
                    Terms of Service
                </h1>
                <p className="text-gray-400 font-bold tracking-wide uppercase text-xs">
                    Last Updated: April 15, 2026
                </p>
            </div>

            <div className="space-y-16 text-gray-600">
                <p className="text-xl leading-relaxed font-medium text-gray-500">
                    Welcome to MogiRentOS, a SaaS property management platform provided by Mogitech Global Ltd. By registering for an account, accessing, or using our services, you agree to be bound by these Terms of Service.
                </p>

                {/* Section 1 */}
                <section id="account" className="scroll-mt-32">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 shrink-0 shadow-sm">
                            <UserCheck className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">1. Account Registration and Security</h2>
                    </div>
                    <p className="text-lg leading-relaxed font-medium">
                        You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. Mogitech Global Ltd will not be liable for any loss or damage arising from your failure to protect your account information.
                    </p>
                </section>

                {/* Section 2 */}
                <section id="subscriptions" className="scroll-mt-32 border-t border-gray-100 pt-16">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 shrink-0 shadow-sm">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">2. Subscription Tiers and Usage Quotas</h2>
                    </div>
                    <p className="text-lg leading-relaxed font-medium">
                        MogiRentOS operates on a volume-based subscription model (Starter, Basic, Standard, Pro, Enterprise). Your access is limited by the number of properties and units permitted within your active tier. Exceeding these limits will require an account upgrade. We reserve the right to suspend accounts that fail to pay subscription invoices within the required grace period.
                    </p>
                </section>

                {/* Section 3 */}
                <section id="integrations" className="scroll-mt-32 border-t border-gray-100 pt-16">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 shrink-0 shadow-sm">
                            <Activity className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">3. Financial Integrations</h2>
                    </div>
                    <p className="text-lg leading-relaxed font-medium">
                        Our platform integrates with third-party payment gateways (e.g., Safaricom Daraja API, Paystack). You agree that MogiRentOS simply acts as a technical intermediary routing payment notifications to your ledger. 
                    </p>
                    <p className="text-lg leading-relaxed font-medium mt-4 bg-[#f8fafb] p-6 rounded-2xl border border-gray-100 text-gray-900">
                        <strong>Disclaimer:</strong> We do not hold, touch, or process your tenant's rental funds directly. You are solely responsible for compliance with Safaricom's terms regarding Paybill/Till ownership and KYC requirements.
                    </p>
                </section>

                {/* Section 4 */}
                <section id="data" className="scroll-mt-32 border-t border-gray-100 pt-16">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 shrink-0 shadow-sm">
                            <Database className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">4. Data Ownership and Privacy</h2>
                    </div>
                    <p className="text-lg leading-relaxed font-medium">
                        You retain all rights to the tenant data, financial records, and documents you input into the system. By using the platform, you grant MogiRentOS a secure, encrypted license to host and process this data to provide the service. For detailed information on data handling, refer to our <Link href="/privacy" className="text-[#1f8898] font-bold hover:underline">Privacy Policy</Link>.
                    </p>
                </section>

                {/* Section 5 */}
                <section id="termination" className="scroll-mt-32 border-t border-gray-100 pt-16">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 shrink-0 shadow-sm">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">5. Termination</h2>
                    </div>
                    <p className="text-lg leading-relaxed font-medium">
                        You may terminate your account at any time by contacting our support team. Mogitech Global reserves the right to suspend or terminate your access immediately, without prior notice, if you breach these Terms of Service or engage in fraudulent activities using our API gateways.
                    </p>
                </section>

                {/* Mobile-Only Contact Box */}
                <div className="lg:hidden mt-16 p-8 bg-[#f8fafb] rounded-[2rem] border border-gray-100">
                    <Gavel className="w-8 h-8 text-[#1f8898] mb-4" />
                    <p className="text-lg font-black text-gray-900 mb-2">Legal inquiries?</p>
                    <p className="text-sm text-gray-500 font-medium mb-6">Contact our legal team for questions regarding these terms or enterprise SLA agreements.</p>
                    <a href="mailto:legal@mogitechglobal.com" className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-bold text-sm">
                        <Mail className="w-4 h-4" /> legal@mogitechglobal.com
                    </a>
                </div>

            </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}