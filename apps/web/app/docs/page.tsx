// apps/web/app/docs/page.tsx
/* eslint-disable */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Building2, Search, ArrowLeft, ChevronRight, 
  CreditCard, FileText, Wrench, ShieldCheck, 
  Zap, BookOpen, Terminal
} from 'lucide-react';

// --- Documentation Content Database ---
const docsData = {
  'getting-started': {
    category: 'Overview',
    title: 'Platform Introduction',
    icon: BookOpen,
    content: (
      <div className="space-y-6">
        <p className="text-lg text-gray-600 leading-relaxed">
          Welcome to the MogiRentOS official documentation. This guide will help you configure your property portfolio, automate your financial workflows, and streamine your maintenance operations.
        </p>
        <div className="bg-[#ebf3f5]/50 border border-[#1f8898]/10 rounded-2xl p-6 mt-8">
          <h4 className="flex items-center gap-2 font-bold text-[#1f8898] mb-2">
            <Zap className="w-5 h-5" /> Quick Start
          </h4>
          <p className="text-sm text-gray-600 mb-4">To get your portfolio live within 24 hours, follow these three steps:</p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 font-medium">
            <li>Configure your organization settings and banking details.</li>
            <li>Import your property and unit hierarchy.</li>
            <li>Import your tenant ledgers (See the Tenant Ledgers guide).</li>
          </ol>
        </div>
      </div>
    )
  },
  'automated-billing': {
    category: 'Financials',
    title: 'Setting Up Automated Billing',
    icon: CreditCard,
    content: (
      <div className="space-y-6">
        <p className="text-lg text-gray-600 leading-relaxed">
          MogiRentOS eliminates manual invoicing by automatically generating rent charges and late fees based on your custom lease terms.
        </p>
        
        <h3 className="text-xl font-black text-gray-900 mt-8 mb-4">1. Configure Invoice Generation</h3>
        <p className="text-gray-600">Navigate to <strong>Settings &gt; Billing Rules</strong>. Here, you define when the system should draft and send invoices.</p>
        <div className="bg-gray-900 text-gray-300 rounded-xl p-5 font-mono text-sm shadow-inner my-4">
          <span className="text-teal-400">Settings:</span><br/>
          Invoice Generation Date: <span className="text-white">25th of the month</span><br/>
          Payment Due Date: <span className="text-white">5th of the following month</span><br/>
          Auto-Send Emails: <span className="text-white">True</span>
        </div>

        <h3 className="text-xl font-black text-gray-900 mt-8 mb-4">2. Set Up Late Fee Penalties</h3>
        <p className="text-gray-600 mb-4">You can configure the system to automatically penalize defaulters. Go to the <strong>Penalties</strong> tab.</p>
        <ul className="space-y-3 bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-teal-50 text-[#1f8898] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</div>
            <p className="text-sm text-gray-600">Select <strong className="text-gray-900">Fixed Amount</strong> (e.g., KES 1,000) or <strong className="text-gray-900">Percentage</strong> (e.g., 5% of outstanding balance).</p>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-teal-50 text-[#1f8898] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</div>
            <p className="text-sm text-gray-600">Set the grace period. If rent is due on the 5th, a 2-day grace period means penalties trigger at 00:01 on the 8th.</p>
          </li>
        </ul>
      </div>
    )
  },
  'tenant-ledgers': {
    category: 'Data Migration',
    title: 'Importing Tenant Ledgers',
    icon: FileText,
    content: (
      <div className="space-y-6">
        <p className="text-lg text-gray-600 leading-relaxed">
          Migrating from spreadsheets or legacy software is seamless with our intelligent CSV importer. You can bring in hundreds of tenants and their historical balances in seconds.
        </p>

        <h3 className="text-xl font-black text-gray-900 mt-8 mb-4">The Import Process</h3>
        
        <div className="space-y-4">
          <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm flex gap-4">
            <Terminal className="w-6 h-6 text-[#1f8898] shrink-0" />
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Step 1: Download the Template</h4>
              <p className="text-sm text-gray-500">Go to <strong>Tenants &gt; Bulk Import</strong> and download the official MogiRentOS CSV template. Do not change the column headers.</p>
            </div>
          </div>

          <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm flex gap-4">
            <FileText className="w-6 h-6 text-[#1f8898] shrink-0" />
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Step 2: Format Your Data</h4>
              <p className="text-sm text-gray-500">Ensure all phone numbers are in international format (e.g., 2547...). For the <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700">Opening_Balance</code> column, use positive numbers for arrears and negative numbers for overpayments/credits.</p>
            </div>
          </div>

          <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm flex gap-4">
            <ShieldCheck className="w-6 h-6 text-[#1f8898] shrink-0" />
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Step 3: Upload and Validate</h4>
              <p className="text-sm text-gray-500">Drag and drop your saved CSV into the portal. The system will pre-validate the data, flagging any duplicate ID numbers or unrecognized unit numbers before committing to the database.</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  'maintenance-staff': {
    category: 'Operations',
    title: 'Assigning Maintenance Staff',
    icon: Wrench,
    content: (
      <div className="space-y-6">
        <p className="text-lg text-gray-600 leading-relaxed">
          Streamline your repair workflows by automating ticket dispatch. MogiRentOS can automatically assign incoming tenant requests to specific contractors based on the issue category.
        </p>

        <h3 className="text-xl font-black text-gray-900 mt-8 mb-4">Creating Auto-Dispatch Rules</h3>
        <p className="text-gray-600 mb-4">Instead of manually moving tickets from "Pending" to "In Progress", let the system notify your team instantly.</p>

        <div className="bg-[#f8fafb] border border-gray-200 rounded-2xl overflow-hidden">
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 font-bold text-gray-700 text-sm">
            Example Dispatch Configuration
          </div>
          <table className="w-full text-left text-sm">
            <thead className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Issue Category</th>
                <th className="px-6 py-4">Assigned Vendor</th>
                <th className="px-6 py-4">Notification Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-600 font-medium bg-white">
              <tr>
                <td className="px-6 py-4"><span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-xs font-bold">PLUMBING</span></td>
                <td className="px-6 py-4">AquaFix Ltd (John)</td>
                <td className="px-6 py-4">SMS & Email</td>
              </tr>
              <tr>
                <td className="px-6 py-4"><span className="bg-amber-50 text-amber-600 px-2 py-1 rounded-md text-xs font-bold">ELECTRICAL</span></td>
                <td className="px-6 py-4">SparkTech Solutions</td>
                <td className="px-6 py-4">Email Only</td>
              </tr>
              <tr>
                <td className="px-6 py-4"><span className="bg-rose-50 text-rose-600 px-2 py-1 rounded-md text-xs font-bold">EMERGENCY</span></td>
                <td className="px-6 py-4">Property Manager (Internal)</td>
                <td className="px-6 py-4">High-Priority SMS</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <p className="text-sm text-gray-500 mt-4 italic">
          * Note: Assigned staff will receive a secure, one-time link to view the ticket details and upload completion photos, without needing full dashboard access.
        </p>
      </div>
    )
  }
};

export default function DocumentationPage() {
  const [activeDoc, setActiveDoc] = useState('getting-started');

  // Group docs by category for the sidebar
  const categories = Array.from(new Set(Object.values(docsData).map(doc => doc.category)));

  return (
    <div className="min-h-screen bg-[#ffffff] font-sans selection:bg-[#1f8898]/30 flex flex-col">
      
      {/* Docs Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-[#ffffff]/90 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1f8898] text-[#ffffff]">
                <Building2 className="h-5 w-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-gray-900">
                Mogi<span className="text-[#1f8898]">RentOS</span>
              </span>
            </Link>
            <span className="hidden md:inline-block w-px h-6 bg-gray-200"></span>
            <span className="hidden md:inline-block text-sm font-bold text-gray-500">Documentation</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-400 w-64">
              <Search className="w-4 h-4" />
              <span>Search docs...</span>
              <span className="ml-auto bg-white border border-gray-200 rounded px-1.5 text-[10px] font-bold">⌘K</span>
            </div>
            <Link href="/help" className="text-sm font-bold text-gray-500 hover:text-[#1f8898] flex items-center gap-2">
               Support <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-[1400px] w-full mx-auto flex flex-col md:flex-row">
        
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-72 border-r border-gray-100 bg-gray-50/30 p-6 overflow-y-auto hidden md:block shrink-0">
          {categories.map((category) => (
            <div key={category} className="mb-8">
              <h5 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">{category}</h5>
              <ul className="space-y-1">
                {Object.entries(docsData)
                  .filter(([_, data]) => data.category === category)
                  .map(([key, data]) => {
                    const isActive = activeDoc === key;
                    const Icon = data.icon;
                    return (
                      <li key={key}>
                        <button
                          onClick={() => setActiveDoc(key)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                            isActive 
                              ? 'bg-[#ebf3f5] text-[#1f8898]' 
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isActive ? 'text-[#1f8898]' : 'text-gray-400'}`} />
                          {data.title}
                        </button>
                      </li>
                    );
                  })}
              </ul>
            </div>
          ))}
        </aside>

        {/* Mobile Dropdown for Docs (Visible only on small screens) */}
        <div className="md:hidden p-4 border-b border-gray-100 bg-gray-50">
          <select 
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-[#1f8898]"
            value={activeDoc}
            onChange={(e) => setActiveDoc(e.target.value)}
          >
            {Object.entries(docsData).map(([key, data]) => (
              <option key={key} value={key}>{data.title}</option>
            ))}
          </select>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 px-6 py-12 md:px-16 md:py-16 max-w-4xl">
          <div className="flex items-center gap-2 text-sm font-bold text-[#1f8898] mb-4">
            {docsData[activeDoc as keyof typeof docsData].category}
            <ChevronRight className="w-4 h-4 text-gray-300" />
            <span className="text-gray-400">{docsData[activeDoc as keyof typeof docsData].title}</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight mb-8">
            {docsData[activeDoc as keyof typeof docsData].title}
          </h1>

          <div className="prose prose-gray max-w-none">
            {docsData[activeDoc as keyof typeof docsData].content}
          </div>

          {/* Footer Pagination */}
          <div className="mt-20 pt-8 border-t border-gray-100 flex justify-between items-center">
             <p className="text-sm font-bold text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
             <button className="text-sm font-bold text-[#1f8898] hover:text-[#1a7684] flex items-center gap-1 transition-colors">
               Was this helpful?
             </button>
          </div>
        </main>
      </div>
    </div>
  );
}