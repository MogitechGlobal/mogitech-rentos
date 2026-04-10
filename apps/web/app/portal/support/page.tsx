// apps/web/app/portal/support/page.tsx
/* eslint-disable */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  LifeBuoy, Mail, Phone, MessageSquare, 
  FileText, ArrowRight, ShieldCheck, 
  HelpCircle, BookOpen, Wrench, 
  Megaphone, Star, ChevronDown, CheckCircle2, X
} from 'lucide-react';

export default function TenantSupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  // --- DYNAMIC SYSTEM SETTINGS STATE ---
  const [globalSettings, setGlobalSettings] = useState({ 
    email: 'support@mogitechglobal.com', 
    phone: '+254 700 000 000',
    terms: ''
  });

  useEffect(() => { 
    const fetchSystemSettings = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/system-settings`);
            if (res.ok) {
                const data = await res.json();
                setGlobalSettings({ 
                    email: data.support_email || 'support@mogitechglobal.com', 
                    phone: data.support_phone || '+254 700 000 000',
                    terms: data.terms_conditions || ''
                });
            }
        } catch (err) { console.error(err); }
    };
    fetchSystemSettings();
  }, []);

  const supportCards = [
    {
      title: "Maintenance & Repairs",
      desc: "Log repair requests, track dispatch status, and rate completed jobs.",
      icon: Wrench,
      action: "Open Service Hub",
      href: "/portal/maintenance",
      color: "bg-amber-50 text-amber-600 border-amber-100",
      accent: "text-amber-600"
    },
    {
      title: "Official Notices",
      desc: "Check property broadcasts, system alerts, and community updates.",
      icon: Megaphone,
      action: "View Notice Board",
      href: "/portal/announcements",
      color: "bg-blue-50 text-blue-600 border-blue-100",
      accent: "text-blue-600"
    },
    {
      title: "Billing & Leases",
      desc: "View your current rent cycle, download PDF receipts, and e-sign documents.",
      icon: FileText,
      action: "Manage Billing",
      href: "/portal",
      color: "bg-[#ebf3f5] text-[#1f8898] border-[#1f8898]/20",
      accent: "text-[#1f8898]"
    }
  ];

  const faqs = [
    { 
      q: "How do I rate a maintenance repair?", 
      a: "Once your property manager marks your maintenance request as 'RESOLVED', a 5-star rating prompt will automatically appear on the ticket in your Maintenance Hub. You can also leave written feedback!" 
    },
    { 
      q: "What should I do in a maintenance emergency?", 
      a: "Submit a new ticket in the Maintenance Hub and set the urgency to 'EMERGENCY'. For life-threatening issues (e.g., severe flooding, fire), please call the property manager immediately after submitting the ticket." 
    },
    { 
      q: "How do I download my payment receipts?", 
      a: "Navigate to your main portal dashboard. Under your 'Recent Invoices' or 'Payment History', you will see a 'Download PDF' button next to any settled transaction." 
    },
    { 
      q: "Where do I see community rules?", 
      a: "Your officially signed Building Rules & Regulations, along with your Lease Agreement and Move-in Inspection, are permanently stored in the 'My Documents' section of your portal." 
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans selection:bg-[#1f8898]/30 overflow-x-hidden animate-in fade-in duration-300">
      
      <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-6 pt-10 pb-20 relative overflow-hidden shadow-inner">
        <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-teal-100 text-[10px] font-black uppercase tracking-widest mb-4 border border-white/20 backdrop-blur-sm">
                <HelpCircle className="w-3.5 h-3.5" /> Tenant Help Center
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-[#ffffff] tracking-tight mb-2">
              How can we assist you?
            </h1>
            <p className="text-teal-100 text-sm md:text-base font-medium max-w-xl">
              Access resources, documentation, and direct service channels for all your tenancy needs.
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 relative z-20 space-y-8">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {supportCards.map((card, idx) => (
            <Link href={card.href} key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-start group hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden">
              <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-50 ${card.color.split(' ')[0]}`}></div>
              
              <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border ${card.color} group-hover:scale-110 transition-transform`}>
                <card.icon className="w-6 h-6" />
              </div>
              <h3 className="relative z-10 text-xl font-black text-gray-900 mb-2 tracking-tight">{card.title}</h3>
              <p className="relative z-10 text-gray-500 text-sm font-medium leading-relaxed mb-6">
                {card.desc}
              </p>
              <div className={`mt-auto flex items-center gap-2 text-xs font-black uppercase tracking-widest ${card.accent} transition-colors`}>
                {card.action} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2 mb-1">
                <BookOpen className="w-6 h-6 text-[#1f8898]" /> Frequently Asked Questions
                </h3>
                <p className="text-xs text-gray-500 font-medium">Quick answers to common portal questions.</p>
            </div>
          </div>
          
          <div className="p-4 md:p-6 space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className={`bg-[#ffffff] rounded-2xl border transition-all duration-200 overflow-hidden
                  ${isOpen ? 'border-[#1f8898]/30 shadow-md' : 'border-gray-100 shadow-sm hover:border-gray-300'}
                `}>
                  <button onClick={() => setOpenFaq(isOpen ? null : idx)} className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none group">
                    <span className={`font-bold pr-4 transition-colors text-sm md:text-base ${isOpen ? 'text-[#1f8898]' : 'text-gray-900 group-hover:text-[#1f8898]'}`}>
                      {faq.q}
                    </span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors
                      ${isOpen ? 'bg-[#ebf3f5]' : 'bg-gray-50 group-hover:bg-[#ebf3f5]'}
                    `}>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#1f8898]' : 'text-gray-400 group-hover:text-[#1f8898]'}`} />
                    </div>
                  </button>
                  
                  <div className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="pt-4 border-t border-gray-50">
                      <p className="text-gray-600 text-sm leading-relaxed font-medium">{faq.a}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* --- DYNAMIC CONTACT FOOTER --- */}
        <div className="bg-gradient-to-br from-[#0d393f] to-[#0a2c31] rounded-3xl p-8 md:p-10 text-white relative overflow-hidden group shadow-xl">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#1f8898]/20 rounded-full blur-3xl pointer-events-none transition-all group-hover:bg-[#1f8898]/40"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-5 border border-white/10">
                <LifeBuoy className="w-6 h-6 text-teal-100" />
              </div>
              <h3 className="text-2xl font-black tracking-tight mb-2">Need to reach management?</h3>
              <p className="text-teal-100 text-sm font-medium max-w-md">For urgent issues not related to maintenance, please contact your property manager directly.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              <a href={`mailto:${globalSettings.email}`} className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl font-bold text-sm transition-all backdrop-blur-md active:scale-95">
                <Mail className="w-4 h-4" /> Email Office
              </a>
              <a href={`tel:${globalSettings.phone.replace(/\s+/g, '')}`} className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1f8898] hover:bg-[#1a7684] rounded-xl font-bold text-sm transition-all shadow-lg shadow-[#1f8898]/20 active:scale-95">
                <Phone className="w-4 h-4" /> Call Management
              </a>
            </div>
          </div>
        </div>

        {globalSettings.terms && (
            <div className="flex justify-center pb-6">
                <button onClick={() => setIsTermsModalOpen(true)} className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-[#1f8898] transition-colors">
                    <FileText className="w-4 h-4" /> View Platform Legal Terms
                </button>
            </div>
        )}

      </main>

      {/* --- TERMS & CONDITIONS MODAL --- */}
      {isTermsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
                <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between bg-gradient-to-br from-gray-50 to-white">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Platform Terms & Conditions</h2>
                        <p className="text-sm font-medium text-gray-500 mt-1">Official legal agreements for MogiRentOS users.</p>
                    </div>
                    <button onClick={() => setIsTermsModalOpen(false)} className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition-colors"><X className="w-6 h-6"/></button>
                </div>
                <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 whitespace-pre-wrap text-sm text-gray-700 font-medium leading-relaxed bg-gray-50/30">
                    {globalSettings.terms || 'No terms have been published yet.'}
                </div>
                <div className="p-5 border-t border-gray-100 bg-white flex justify-end">
                    <button onClick={() => setIsTermsModalOpen(false)} className="px-8 py-3 bg-gray-900 text-white hover:bg-black transition-colors rounded-xl font-bold shadow-lg">Close Document</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}