// apps/web/app/dashboard/help/page.tsx
/* eslint-disable */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Search, DollarSign, Users, Wrench, ChevronDown, 
  LifeBuoy, MessageSquare, BookOpen, Settings, 
  ArrowRight, Mail, Phone, ShieldCheck 
} from 'lucide-react';

// --- Data Configuration ---
const categories = [
  { id: 'billing', icon: DollarSign, title: 'Billing & Payments', desc: 'Invoices, M-Pesa tracking, and automated rent.' },
  { id: 'tenants', icon: Users, title: 'Tenant Management', desc: 'Moving tenants in, leases, and directories.' },
  { id: 'maintenance', icon: Wrench, title: 'Maintenance', desc: 'Logging tickets and managing the Kanban board.' },
  { id: 'settings', icon: Settings, title: 'Platform Settings', desc: 'Configuring your company profile and banking.' },
];

const faqs = [
  // Billing
  { category: 'billing', question: 'How does the automated billing work?', answer: 'RentOS runs a background cron job on the 1st of every month. It automatically checks for active tenants and generates a rent invoice based on their unit\'s assigned rent amount. You don\'t need to click anything!' },
  { category: 'billing', question: 'How do I manually generate invoices for a new month?', answer: 'Go to the Financials & Billing page and click the "Generate Invoices" button. The system will safely generate bills for any active tenant who hasn\'t been billed for the current month yet.' },
  { category: 'billing', question: 'Can I track partial payments?', answer: 'Yes! When recording a payment on an invoice, enter the exact amount the tenant paid. If it\'s less than the total due, the invoice status will automatically update to "PARTIALLY PAID" and keep track of the remaining balance.' },
  // Tenants
  { category: 'tenants', question: 'How do I move a tenant out?', answer: 'Navigate to the tenant\'s profile and edit their lease status to "Inactive". This stops the automated billing system from generating future invoices and frees up the unit for a new tenant.' },
  { category: 'tenants', question: 'Can I import tenants from Excel?', answer: 'Yes. You can use our bulk CSV importer in the Tenant Directory. Make sure your file matches the exact column headers provided in the sample template.' },
  // Maintenance
  { category: 'maintenance', question: 'How do tenants submit maintenance requests?', answer: 'Tenants log into their dedicated portal and navigate to the Maintenance tab. When they submit an issue, it instantly appears in your "Pending" column on the Landlord Dashboard.' },
  { category: 'maintenance', question: 'Will tenants be notified when I update a ticket?', answer: 'Yes. If you drag a ticket from "Pending" to "In Progress" or "Resolved", the system automatically sends a branded email update to the tenant.' },
  // Settings
  { category: 'settings', question: 'How do I add a new property manager?', answer: 'Multi-user Role-Based Access Control (RBAC) allows you to add managers. Go to Settings > Team, and invite them via email with either "Admin" or "Manager" permissions.' },
];

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Filter logic: If searching, ignore tabs. If not searching, use tabs.
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || faq.category === activeTab;
    
    return searchQuery ? matchesSearch : matchesTab;
  });

  return (
    <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans selection:bg-[#1f8898]/30 animate-in fade-in duration-300">
      
      {/* --- Advanced Hero Search Area --- */}
      <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-6 py-20 text-center relative overflow-hidden shadow-inner">
        {/* Decorative background vectors */}
        <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-100 text-xs font-bold uppercase tracking-widest mb-6 border border-white/20 backdrop-blur-sm">
            <ShieldCheck className="w-4 h-4" /> Official Support Center
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#ffffff] tracking-tight mb-6">
            How can we help you today?
          </h1>
          
          <div className="relative mt-8 group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="w-6 h-6 text-gray-400 group-focus-within:text-[#1f8898] transition-colors" />
            </div>
            <input 
              type="text" 
              placeholder="Search for guides, tutorials, and FAQs..." 
              className="w-full pl-14 pr-16 py-5 rounded-2xl border-0 shadow-2xl text-gray-900 outline-none focus:ring-4 focus:ring-[#1f8898]/30 transition-all text-lg font-medium bg-[#ffffff]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
              <span className="bg-gray-100 text-gray-500 text-[10px] font-black px-2 py-1 rounded border border-gray-200 uppercase tracking-widest hidden sm:block">
                Search
              </span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 -mt-8 relative z-20 space-y-12">
        
        {/* --- Bento Box Categories Grid --- */}
        {!searchQuery && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div 
                  key={idx} 
                  onClick={() => { setActiveTab(cat.id); setOpenFaq(null); }}
                  className={`bg-[#ffffff] p-6 rounded-2xl shadow-lg shadow-black/5 border transition-all cursor-pointer group hover:-translate-y-1
                    ${activeTab === cat.id ? 'border-[#1f8898] ring-1 ring-[#1f8898]' : 'border-gray-100 hover:border-[#1f8898]/30'}
                  `}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-colors duration-300
                    ${activeTab === cat.id ? 'bg-[#1f8898] text-white' : 'bg-[#ebf3f5] text-[#1f8898] group-hover:bg-[#1f8898] group-hover:text-white'}
                  `}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-black text-gray-900 mb-2 tracking-tight">{cat.title}</h3>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">{cat.desc}</p>
                </div>
              )
            })}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* --- Main FAQ Area --- */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Dynamic Header Based on State */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                {searchQuery ? 'Search Results' : 'Frequently Asked Questions'}
              </h2>
              
              {/* Reset Tabs Button */}
              {!searchQuery && activeTab !== 'all' && (
                <button 
                  onClick={() => setActiveTab('all')}
                  className="text-sm font-bold text-[#1f8898] hover:text-[#1a7684] flex items-center gap-1"
                >
                  View All <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {/* FAQ Accordion */}
            {filteredFaqs.length === 0 ? (
              <div className="bg-[#ffffff] py-16 px-6 rounded-3xl border border-gray-100 shadow-sm text-center">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-900 font-black text-xl mb-2">No results found</p>
                <p className="text-gray-500 font-medium max-w-md mx-auto">We couldn't find any articles matching "{searchQuery}". Try adjusting your search terms or contact support below.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFaqs.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div key={idx} className={`bg-[#ffffff] rounded-2xl border transition-all duration-200 overflow-hidden
                      ${isOpen ? 'border-[#1f8898]/30 shadow-md' : 'border-gray-100 shadow-sm hover:border-gray-300'}
                    `}>
                      <button 
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none group"
                      >
                        <span className={`font-bold pr-4 transition-colors ${isOpen ? 'text-[#1f8898]' : 'text-gray-900 group-hover:text-[#1f8898]'}`}>
                          {faq.question}
                        </span>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors
                          ${isOpen ? 'bg-[#ebf3f5]' : 'bg-gray-50 group-hover:bg-[#ebf3f5]'}
                        `}>
                          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#1f8898]' : 'text-gray-400 group-hover:text-[#1f8898]'}`} />
                        </div>
                      </button>
                      
                      <div className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="pt-4 border-t border-gray-50">
                          <p className="text-gray-600 text-sm leading-relaxed font-medium">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* --- Sticky Support Sidebar --- */}
          <div className="lg:col-span-1 space-y-6 sticky top-8">
            
            {/* Official Docs Link */}
            <Link href="/docs" className="block bg-gray-900 text-[#ffffff] rounded-3xl p-8 hover:bg-gray-800 transition-colors shadow-xl group overflow-hidden relative border border-gray-800">
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-[#1f8898]/20 rounded-full blur-2xl group-hover:bg-[#1f8898]/40 transition-all"></div>
              <div className="relative z-10">
                <BookOpen className="w-8 h-8 text-[#1f8898] mb-4" />
                <h3 className="text-xl font-black mb-2 tracking-tight">Official Documentation</h3>
                <p className="text-gray-400 text-sm mb-6 font-medium leading-relaxed">
                  Explore comprehensive, step-by-step guides on setting up your property portfolio and automating financials.
                </p>
                <div className="flex items-center gap-2 text-sm font-bold text-[#1f8898] group-hover:text-teal-400 transition-colors">
                  Read the Docs <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Direct Contact Card */}
            <div className="bg-[#ffffff] rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-[#ebf3f5] rounded-xl flex items-center justify-center mb-5">
                <LifeBuoy className="w-6 h-6 text-[#1f8898]" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">Still need help?</h3>
              <p className="text-gray-500 text-sm mb-6 font-medium leading-relaxed">
                Can't find the answer you're looking for? Our dedicated technical support team is ready to assist you.
              </p>
              
              <div className="space-y-3">
                <a href="mailto:support@mogitechglobal.com" className="w-full bg-[#1f8898] hover:bg-[#1a7684] text-[#ffffff] font-bold py-3.5 px-4 rounded-xl transition duration-200 shadow-md flex items-center justify-center gap-2 active:scale-95">
                  <Mail className="w-5 h-5" />
                  Email Support
                </a>
                <a href="https://mogitechglobal.com/contact.php" target="_blank" rel="noopener noreferrer" className="w-full bg-white border border-gray-200 hover:border-[#1f8898] hover:bg-gray-50 text-gray-700 font-bold py-3.5 px-4 rounded-xl transition duration-200 flex items-center justify-center gap-2 active:scale-95">
                  <Phone className="w-5 h-5 text-gray-400" />
                  Contact Sales
                </a>
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-5 font-bold uppercase tracking-widest">
                Avg. email response: Under 2 hours
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}