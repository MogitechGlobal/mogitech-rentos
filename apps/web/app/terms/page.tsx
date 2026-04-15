// apps/web/app/terms/page.tsx
import Link from 'next/link';
import { Building2, ArrowLeft } from 'lucide-react';
import Footer from '@/components/Footer';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#f8fafb] flex flex-col font-sans selection:bg-[#1f8898]/30">
      
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1f8898] to-[#135a65] text-[#ffffff] shadow-lg shadow-[#1f8898]/20">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="text-2xl font-black tracking-tight text-gray-900">
              Mogi<span className="text-[#1f8898]">RentOS</span>
            </span>
          </Link>
          <Link href="/register" className="text-sm font-bold flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Registration
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
            
            <div className="border-b border-gray-100 pb-8 mb-8">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest mb-4">
                    Legal Agreement
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-4">Terms of Service</h1>
                <p className="text-gray-500 font-medium">Last Updated: April 15, 2026</p>
            </div>

            <div className="prose prose-gray max-w-none text-gray-600 space-y-6">
                <p>
                    Welcome to MogiRentOS, a SaaS property management platform provided by Mogitech Global Ltd. By registering for an account, accessing, or using our services, you agree to be bound by these Terms of Service.
                </p>

                <h3 className="text-xl font-black text-gray-900 mt-8 mb-4">1. Account Registration and Security</h3>
                <p>
                    You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. Mogitech Global Ltd will not be liable for any loss or damage arising from your failure to protect your account information.
                </p>

                <h3 className="text-xl font-black text-gray-900 mt-8 mb-4">2. Subscription Tiers and Usage Quotas</h3>
                <p>
                    MogiRentOS operates on a volume-based subscription model (Starter, Basic, Standard, Pro, Enterprise). Your access is limited by the number of properties and units permitted within your active tier. Exceeding these limits will require an account upgrade. We reserve the right to suspend accounts that fail to pay subscription invoices within the required grace period.
                </p>

                <h3 className="text-xl font-black text-gray-900 mt-8 mb-4">3. Financial Integrations (M-Pesa & Bank)</h3>
                <p>
                    Our platform integrates with third-party payment gateways (e.g., Safaricom Daraja API, Paystack). You agree that MogiRentOS simply acts as a technical intermediary routing payment notifications to your ledger. We do not hold, touch, or process your tenant's rental funds directly. You are solely responsible for compliance with Safaricom's terms regarding Paybill/Till ownership and KYC requirements.
                </p>

                <h3 className="text-xl font-black text-gray-900 mt-8 mb-4">4. Data Ownership and Privacy</h3>
                <p>
                    You retain all rights to the tenant data, financial records, and documents you input into the system. By using the platform, you grant MogiRentOS a secure, encrypted license to host and process this data to provide the service. For detailed information on data handling, refer to our <Link href="/privacy" className="text-[#1f8898] font-bold hover:underline">Privacy Policy</Link>.
                </p>

                <h3 className="text-xl font-black text-gray-900 mt-8 mb-4">5. Termination</h3>
                <p>
                    You may terminate your account at any time by contacting our support team. Mogitech Global reserves the right to suspend or terminate your access immediately, without prior notice, if you breach these Terms of Service or engage in fraudulent activities using our API gateways.
                </p>

                <div className="mt-12 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-sm font-bold text-gray-900 mb-2">Questions regarding these terms?</p>
                    <p className="text-sm text-gray-500">Contact our legal team at <a href="mailto:legal@mogitechglobal.com" className="text-[#1f8898] hover:underline">legal@mogitechglobal.com</a></p>
                </div>
            </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}