// apps/web/app/docs/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Building2, Globe, ArrowRight, ChevronRight, 
  CreditCard, FileText, Wrench, ShieldCheck, 
  Zap, BookOpen, Terminal, ChevronLeft, ThumbsUp
} from 'lucide-react';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

// --- Documentation Content Database ---
const docsData = {
  'getting-started': {
    category: 'Overview',
    title: 'Platform Introduction',
    icon: BookOpen,
    content: (
      <div className="space-y-6">
        <p className="text-lg text-gray-600 leading-relaxed font-medium">
          Welcome to the MogiRentOS official documentation. This guide will help you configure your property portfolio, automate your financial workflows, and streamline your maintenance operations.
        </p>
        <div className="bg-gradient-to-br from-[#ebf3f5] to-white border border-[#1f8898]/10 rounded-[2rem] p-8 mt-8 shadow-sm">
          <h4 className="flex items-center gap-2 font-black text-gray-900 mb-2 text-xl tracking-tight">
            <div className="w-8 h-8 rounded-full bg-[#1f8898]/10 text-[#1f8898] flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            Quick Start
          </h4>
          <p className="text-base text-gray-500 mb-6 font-medium">To get your portfolio live within 24 hours, follow these three steps:</p>
          <ol className="space-y-4 text-base text-gray-700 font-medium">
            <li className="flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <span className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
                Configure your organization settings and banking details.
            </li>
            <li className="flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <span className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center shrink-0">2</span>
                Import your property and unit hierarchy.
            </li>
            <li className="flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <span className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center shrink-0">3</span>
                Import your tenant ledgers.
            </li>
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
        <p className="text-lg text-gray-600 leading-relaxed font-medium">
          MogiRentOS eliminates manual invoicing by automatically generating rent charges and late fees based on your custom lease terms.
        </p>
        
        <h3 className="text-2xl font-black text-gray-900 mt-12 mb-6 tracking-tight">1. Configure Invoice Generation</h3>
        <p className="text-gray-600 text-base">Navigate to <strong className="text-gray-900">Settings &gt; Billing Rules</strong>. Here, you define when the system should draft and send invoices.</p>
        <div className="bg-[#0a2c31] text-teal-50 rounded-[1.5rem] p-6 sm:p-8 font-mono text-sm sm:text-base shadow-2xl shadow-gray-900/10 my-6">
          <span className="text-teal-400 font-bold mb-4 block">// Billing Settings JSON</span>
          <div className="space-y-2">
              <p><span className="text-gray-400">"invoice_generation_date":</span> <span className="text-emerald-400">"25th"</span>,</p>
              <p><span className="text-gray-400">"payment_due_date":</span> <span className="text-emerald-400">"5th"</span>,</p>
              <p><span className="text-gray-400">"auto_send_emails":</span> <span className="text-amber-400">true</span></p>
          </div>
        </div>

        <h3 className="text-2xl font-black text-gray-900 mt-12 mb-6 tracking-tight">2. Set Up Late Fee Penalties</h3>
        <p className="text-gray-600 text-base mb-6">You can configure the system to automatically penalize defaulters. Go to the <strong className="text-gray-900">Penalties</strong> tab.</p>
        <ul className="space-y-4">
          <li className="flex items-start gap-4 bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:border-[#1f8898]/30 transition-colors">
            <div className="w-8 h-8 rounded-full bg-[#ebf3f5] text-[#1f8898] flex items-center justify-center font-black text-sm shrink-0">1</div>
            <p className="text-base text-gray-600 leading-relaxed">Select <strong className="text-gray-900 font-black">Fixed Amount</strong> (e.g., KES 1,000) or <strong className="text-gray-900 font-black">Percentage</strong> (e.g., 5% of outstanding balance).</p>
          </li>
          <li className="flex items-start gap-4 bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:border-[#1f8898]/30 transition-colors">
            <div className="w-8 h-8 rounded-full bg-[#ebf3f5] text-[#1f8898] flex items-center justify-center font-black text-sm shrink-0">2</div>
            <p className="text-base text-gray-600 leading-relaxed">Set the grace period. If rent is due on the 5th, a 2-day grace period means penalties trigger at 00:01 on the 8th.</p>
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
        <p className="text-lg text-gray-600 leading-relaxed font-medium">
          Migrating from spreadsheets or legacy software is seamless with our intelligent CSV importer. You can bring in hundreds of tenants and their historical balances in seconds.
        </p>

        <h3 className="text-2xl font-black text-gray-900 mt-12 mb-6 tracking-tight">The Import Process</h3>
        
        <div className="space-y-4">
          <div className="p-6 sm:p-8 bg-white border border-gray-100 rounded-[2rem] shadow-sm flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-[#ebf3f5] flex items-center justify-center shrink-0">
                <Terminal className="w-7 h-7 text-[#1f8898]" />
            </div>
            <div>
              <h4 className="text-xl font-black text-gray-900 mb-2 tracking-tight">Step 1: Download the Template</h4>
              <p className="text-base text-gray-500 leading-relaxed">Go to <strong className="text-gray-900">Tenants &gt; Bulk Import</strong> and download the official MogiRentOS CSV template. Do not change the column headers.</p>
            </div>
          </div>

          <div className="p-6 sm:p-8 bg-white border border-gray-100 rounded-[2rem] shadow-sm flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-[#ebf3f5] flex items-center justify-center shrink-0">
                <FileText className="w-7 h-7 text-[#1f8898]" />
            </div>
            <div>
              <h4 className="text-xl font-black text-gray-900 mb-2 tracking-tight">Step 2: Format Your Data</h4>
              <p className="text-base text-gray-500 leading-relaxed">Ensure all phone numbers are in international format (e.g., 2547...). For the <code className="bg-gray-100 border border-gray-200 px-2 py-1 rounded text-gray-800 text-sm font-mono">Opening_Balance</code> column, use positive numbers for arrears and negative numbers for overpayments/credits.</p>
            </div>
          </div>

          <div className="p-6 sm:p-8 bg-white border border-gray-100 rounded-[2rem] shadow-sm flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-[#ebf3f5] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-7 h-7 text-[#1f8898]" />
            </div>
            <div>
              <h4 className="text-xl font-black text-gray-900 mb-2 tracking-tight">Step 3: Upload and Validate</h4>
              <p className="text-base text-gray-500 leading-relaxed">Drag and drop your saved CSV into the portal. The system will pre-validate the data, flagging any duplicate ID numbers or unrecognized unit numbers before committing to the database.</p>
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
        <p className="text-lg text-gray-600 leading-relaxed font-medium">
          Streamline your repair workflows by automating ticket dispatch. MogiRentOS can automatically assign incoming tenant requests to specific contractors based on the issue category.
        </p>

        <h3 className="text-2xl font-black text-gray-900 mt-12 mb-6 tracking-tight">Creating Auto-Dispatch Rules</h3>
        <p className="text-gray-600 text-base mb-6">Instead of manually moving tickets from "Pending" to "In Progress", let the system notify your team instantly.</p>

        <div className="bg-white border border-gray-200 rounded-[2rem] overflow-hidden shadow-sm">
          <div className="bg-[#f8fafb] px-6 sm:px-8 py-4 border-b border-gray-200 font-black text-gray-900 text-sm uppercase tracking-widest">
            Example Dispatch Configuration
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="text-gray-400 font-bold uppercase tracking-wider text-[10px] bg-white border-b border-gray-100">
                <tr>
                  <th className="px-6 sm:px-8 py-4">Issue Category</th>
                  <th className="px-6 sm:px-8 py-4">Assigned Vendor</th>
                  <th className="px-6 sm:px-8 py-4">Notification Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600 font-medium bg-white">
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 sm:px-8 py-5"><span className="bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1.5 rounded-lg text-xs font-black tracking-wide">PLUMBING</span></td>
                  <td className="px-6 sm:px-8 py-5">AquaFix Ltd (John)</td>
                  <td className="px-6 sm:px-8 py-5 text-gray-900 font-bold">SMS & Email</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 sm:px-8 py-5"><span className="bg-amber-50 text-amber-600 border border-amber-100 px-3 py-1.5 rounded-lg text-xs font-black tracking-wide">ELECTRICAL</span></td>
                  <td className="px-6 sm:px-8 py-5">SparkTech Solutions</td>
                  <td className="px-6 sm:px-8 py-5 text-gray-900 font-bold">Email Only</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 sm:px-8 py-5"><span className="bg-rose-50 text-rose-600 border border-rose-100 px-3 py-1.5 rounded-lg text-xs font-black tracking-wide">EMERGENCY</span></td>
                  <td className="px-6 sm:px-8 py-5">Property Manager</td>
                  <td className="px-6 sm:px-8 py-5 text-gray-900 font-bold">High-Priority SMS</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <p className="text-sm text-gray-400 mt-6 italic font-medium">
          * Note: Assigned staff will receive a secure, one-time link to view the ticket details and upload completion photos, without needing full dashboard access.
        </p>
      </div>
    )
  }
};

export default function DocumentationPage() {
  const [activeDoc, setActiveDoc] = useState('getting-started');

  // Keys array for Pagination
  const docKeys = Object.keys(docsData);
  const currentIndex = docKeys.indexOf(activeDoc);
  const prevDocKey = currentIndex > 0 ? docKeys[currentIndex - 1] : null;
  const nextDocKey = currentIndex < docKeys.length - 1 ? docKeys[currentIndex + 1] : null;

  // Group docs by category for the sidebar
  const categories = Array.from(new Set(Object.values(docsData).map(doc => doc.category)));

  return (
    <div className="min-h-screen bg-[#ffffff] font-sans selection:bg-[#1f8898]/30 flex flex-col">
      
       {/* --- STANDARDIZED PUBLIC NAVBAR COMPONENT --- */}
      <Navbar />

      {/* --- DOCS LAYOUT --- */}
      <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col md:flex-row relative">
        
        {/* Desktop Sidebar (Sticky) */}
        <aside className="w-full md:w-72 lg:w-80 border-r border-gray-100 bg-[#f8fafb]/50 p-6 md:p-8 shrink-0 hidden md:block sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto">
          {categories.map((category) => (
            <div key={category} className="mb-10">
              <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 pl-3">{category}</h5>
              <ul className="space-y-1.5">
                {Object.entries(docsData)
                  .filter(([_, data]) => data.category === category)
                  .map(([key, data]) => {
                    const isActive = activeDoc === key;
                    const Icon = data.icon;
                    return (
                      <li key={key}>
                        <button
                          onClick={() => {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                            setActiveDoc(key);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all text-left ${
                            isActive 
                              ? 'bg-white text-[#1f8898] shadow-sm border border-gray-100 font-black' 
                              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 font-bold border border-transparent'
                          }`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#1f8898]' : 'text-gray-400'}`} />
                          {data.title}
                        </button>
                      </li>
                    );
                  })}
              </ul>
            </div>
          ))}
        </aside>

        {/* Mobile Dropdown for Docs */}
        <div className="md:hidden p-4 border-b border-gray-100 bg-[#f8fafb] sticky top-[65px] z-40">
          <div className="relative">
              <select 
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-black text-gray-900 outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/10 appearance-none shadow-sm"
                value={activeDoc}
                onChange={(e) => setActiveDoc(e.target.value)}
              >
                {Object.entries(docsData).map(([key, data]) => (
                  <option key={key} value={key}>{data.category} - {data.title}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronRight className="w-5 h-5 rotate-90" />
              </div>
          </div>
        </div>

        {/* Main Article Content Area */}
        <main className="flex-1 px-6 py-12 md:px-12 lg:px-20 md:py-16 max-w-4xl overflow-hidden">
          
          {/* Smooth fade transition wrapper */}
          <div key={activeDoc} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-xs font-black tracking-widest uppercase mb-6">
                <span className="text-[#1f8898] bg-[#ebf3f5] px-2.5 py-1 rounded-md">{docsData[activeDoc as keyof typeof docsData].category}</span>
                <ChevronRight className="w-3 h-3 text-gray-300" />
                <span className="text-gray-400">{docsData[activeDoc as keyof typeof docsData].title}</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-10 leading-[1.1]">
                {docsData[activeDoc as keyof typeof docsData].title}
              </h1>

              {/* Content Injection */}
              <div className="prose prose-lg max-w-none text-gray-600">
                {docsData[activeDoc as keyof typeof docsData].content}
              </div>

          </div>

          {/* --- BOTTOM PAGINATION & FEEDBACK --- */}
          <div className="mt-24 pt-8 border-t border-gray-100">
             
             {/* Next/Prev Navigation Cards */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
                 {prevDocKey ? (
                     <button 
                        onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setActiveDoc(prevDocKey); }}
                        className="flex flex-col text-left p-6 rounded-2xl border border-gray-100 bg-white hover:border-[#1f8898]/30 hover:shadow-lg transition-all group"
                     >
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1 mb-2">
                             <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> Previous
                         </span>
                         <span className="text-lg font-bold text-gray-900 group-hover:text-[#1f8898] transition-colors">
                             {docsData[prevDocKey as keyof typeof docsData].title}
                         </span>
                     </button>
                 ) : <div></div>}

                 {nextDocKey && (
                     <button 
                        onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setActiveDoc(nextDocKey); }}
                        className="flex flex-col text-right items-end p-6 rounded-2xl border border-gray-100 bg-white hover:border-[#1f8898]/30 hover:shadow-lg transition-all group"
                     >
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1 mb-2">
                             Next <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                         </span>
                         <span className="text-lg font-bold text-gray-900 group-hover:text-[#1f8898] transition-colors">
                             {docsData[nextDocKey as keyof typeof docsData].title}
                         </span>
                     </button>
                 )}
             </div>

             {/* Feedback Footer */}
             <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#f8fafb] p-6 rounded-2xl border border-gray-100">
                <p className="text-xs font-bold text-gray-400">Last updated: April 20, 2026</p>
                <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                    Was this helpful?
                    <button className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:text-[#1f8898] hover:border-[#1f8898] transition-colors shadow-sm">
                        <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:text-rose-500 hover:border-rose-500 transition-colors shadow-sm">
                        <ThumbsUp className="w-4 h-4 rotate-180" />
                    </button>
                </div>
             </div>

          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}