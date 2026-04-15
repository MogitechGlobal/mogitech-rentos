// apps/web/app/privacy/page.tsx
import Link from 'next/link';
import { Building2, ArrowLeft } from 'lucide-react';
import Footer from '@/components/Footer';

export default function PrivacyPolicy() {
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
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest mb-4">
                    Data Protection
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-4">Privacy Policy</h1>
                <p className="text-gray-500 font-medium">Last Updated: April 15, 2026</p>
            </div>

            <div className="prose prose-gray max-w-none text-gray-600 space-y-6">
                <p>
                    Mogitech Global Ltd ("we", "our", or "us") is committed to protecting the privacy and security of the data handled by the MogiRentOS platform. This policy explains how we collect, use, and safeguard your information.
                </p>

                <h3 className="text-xl font-black text-gray-900 mt-8 mb-4">1. Information We Collect</h3>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Account Information:</strong> Your name, company name, email address, and phone number provided during registration.</li>
                    <li><strong>Tenant Data:</strong> PII (Personally Identifiable Information) of your tenants that you upload, including lease details, phone numbers, and balances.</li>
                    <li><strong>Financial Data:</strong> Masked payment gateway credentials (M-Pesa Consumer Keys) and transaction IPN logs received from banks/telecoms.</li>
                </ul>

                <h3 className="text-xl font-black text-gray-900 mt-8 mb-4">2. How We Use Your Information</h3>
                <p>
                    We use this data strictly to provide and improve the MogiRentOS platform. This includes authenticating your logins, processing automated rent reconciliation via API webhooks, sending SMS/Email communications to your tenants on your behalf, and billing you for your SaaS subscription.
                </p>

                <h3 className="text-xl font-black text-gray-900 mt-8 mb-4">3. Data Security & Encryption</h3>
                <p>
                    Security is our top priority. All sensitive database fields (including API keys, passwords, and custom lease documents) are encrypted using industry-standard AES-256 encryption. All network traffic between your browser, our servers, and third-party APIs is secured via SSL/TLS.
                </p>

                <h3 className="text-xl font-black text-gray-900 mt-8 mb-4">4. Third-Party Sharing</h3>
                <p>
                    We do not sell your data. We only share necessary data with trusted third-party sub-processors required to operate the service (e.g., Safaricom for processing M-Pesa push requests, Paystack for processing card payments, and AWS/Cloudflare for secure cloud hosting).
                </p>

                <div className="mt-12 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-sm font-bold text-gray-900 mb-2">Privacy inquiries?</p>
                    <p className="text-sm text-gray-500">Contact our Data Protection Officer at <a href="mailto:privacy@mogitechglobal.com" className="text-[#1f8898] hover:underline">privacy@mogitechglobal.com</a></p>
                </div>
            </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}