// apps/web/app/portal/support/page.tsx
/* eslint-disable */
'use client';

import { 
  LifeBuoy, Mail, Phone, MessageSquare, 
  FileText, ExternalLink, ArrowRight,
  ShieldCheck, HelpCircle, BookOpen
} from 'lucide-react';
import Link from 'next/link';

export default function TenantSupportPage() {
  const supportCards = [
    {
      title: "Knowledge Base",
      desc: "Browse our documentation for guides on payments and maintenance.",
      icon: BookOpen,
      action: "Read Articles",
      color: "bg-blue-50 text-blue-600 border-blue-100"
    },
    {
      title: "Direct Support",
      desc: "Reach out to your property manager for urgent lease inquiries.",
      icon: MessageSquare,
      action: "Start Chat",
      color: "bg-[#ebf3f5] text-[#1f8898] border-[#1f8898]/20"
    },
    {
      title: "Maintenance Guides",
      desc: "Common troubleshooting steps for minor apartment repairs.",
      icon: LifeBuoy,
      action: "View Guides",
      color: "bg-amber-50 text-amber-600 border-amber-100"
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans overflow-x-hidden">
      
      {/* --- Advanced Gradient Hero Area --- */}
      <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-6 pt-10 pb-20 relative overflow-hidden shadow-inner">
        <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-teal-100 text-[10px] font-black uppercase tracking-widest mb-4 border border-white/20 backdrop-blur-sm">
                <HelpCircle className="w-3.5 h-3.5" /> Help Center
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-[#ffffff] tracking-tight mb-2">
              How can we help?
            </h1>
            <p className="text-teal-100 text-sm md:text-base font-medium max-w-xl">
              Access resources, documentation, and direct contact channels for all your tenancy needs.
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 relative z-20 space-y-6">

        {/* --- SUPPORT ACTION GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {supportCards.map((card, idx) => (
            <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-start group hover:-translate-y-1 transition-all duration-300">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">{card.title}</h3>
              <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6">
                {card.desc}
              </p>
              <button className="mt-auto flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#1f8898] hover:text-[#135a65] transition-colors group/btn">
                {card.action} <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>

        {/* --- FAQ SECTION --- */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-100">
            <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
               <FileText className="w-5 h-5 text-[#1f8898]" /> Frequently Asked Questions
            </h3>
          </div>
          <div className="divide-y divide-gray-50">
            {[
              { q: "How do I download my payment receipts?", a: "Navigate to the 'Billing & Payments' tab and click 'Download PDF' next to any settled transaction." },
              { q: "What should I do in a maintenance emergency?", a: "Submit a new ticket in the Maintenance Hub and set the urgency to 'Emergency' for immediate priority." },
              { q: "Can I pay rent in advance?", a: "Yes. Use the 'Make Advance Payment' option in the Billing section to add funds to your account credit balance." }
            ].map((faq, i) => (
              <div key={i} className="p-6 md:p-8 hover:bg-gray-50/50 transition-colors">
                <p className="font-black text-gray-900 mb-2">{faq.q}</p>
                <p className="text-gray-500 text-sm font-medium leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* --- CONTACT FOOTER --- */}
        <div className="bg-[#0d393f] rounded-3xl p-8 md:p-10 text-white relative overflow-hidden group">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#1f8898]/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl font-black tracking-tight mb-2">Still need help?</h3>
              <p className="text-teal-100 text-sm font-medium">Our support team is available Monday to Friday, 8am – 5pm.</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <a href="mailto:support@mogirentos.com" className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl font-bold text-sm transition-all backdrop-blur-md">
                <Mail className="w-4 h-4" /> Email Us
              </a>
              <a href="tel:+254700000000" className="flex items-center gap-2 px-6 py-3 bg-[#1f8898] hover:bg-[#1a7684] rounded-xl font-bold text-sm transition-all shadow-lg">
                <Phone className="w-4 h-4" /> Call Support
              </a>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}