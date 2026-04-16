'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Phone, Mail, CheckCircle2, MessageCircle, Building2, Loader2, Target } from 'lucide-react';

export default function LeadsCRMPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leads`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      
      if (res.status === 401) return router.push('/login');
      if (!res.ok) throw new Error('Failed to load leads');
      
      const data = await res.json();
      setLeads(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include'
      });
      fetchLeads(); // Refresh the board
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to format WhatsApp links dynamically
  const getWhatsAppLink = (phone: string, name: string, unit: string) => {
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '254' + cleanPhone.substring(1);
    const text = encodeURIComponent(`Hi ${name}, this is the landlord following up on your inquiry for Unit ${unit} on MogiRentOS.`);
    return `https://wa.me/${cleanPhone}?text=${text}`;
  };

  return (
    <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans selection:bg-[#1f8898]/30 overflow-x-hidden">
      
      {/* --- Scaled-Down Gradient Hero Area --- */}
      <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-6 pt-8 pb-14 md:pt-10 md:pb-16 relative overflow-hidden shadow-inner">
        <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-100 text-xs font-bold uppercase tracking-widest mb-3 border border-white/20 backdrop-blur-sm">
                <Target className="w-3.5 h-3.5" /> CRM Pipeline
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[#ffffff] tracking-tight mb-2">
              Marketplace Leads
            </h1>
            <p className="text-teal-100 text-sm md:text-base font-medium max-w-xl leading-relaxed">
              Manage inquiries from the public portal. Contact prospects and convert them into active tenants.
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 md:-mt-10 relative z-20">
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-[#1f8898] bg-white rounded-3xl shadow-sm border border-gray-100">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="font-bold text-sm uppercase tracking-widest text-gray-400 mt-4">Loading Pipeline...</span>
          </div>
        ) : leads.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center max-w-xl mx-auto mt-6 shadow-sm">
            <div className="w-20 h-20 bg-[#ebf3f5] rounded-3xl flex items-center justify-center mx-auto mb-5 text-[#1f8898]">
              <Users className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">No leads yet</h3>
            <p className="text-gray-500 font-medium">When tenants inquire about your public listings, they will appear right here in your pipeline.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leads.map((lead) => (
              <div key={lead.id} className="bg-[#ffffff] rounded-3xl shadow-sm border border-gray-100 flex flex-col group hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5 transition-all duration-300 overflow-hidden">
                
                {/* Status Indicator Bar */}
                <div className={`h-2 w-full ${
                    lead.status === 'NEW' ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                    lead.status === 'CONTACTED' ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                    'bg-gradient-to-r from-emerald-400 to-emerald-500'
                  }`}>
                </div>

                <div className="p-5 border-b border-gray-50 bg-gray-50/50 flex justify-between items-start">
                  <div>
                    <h3 className="font-black text-gray-900 text-lg group-hover:text-[#1f8898] transition-colors line-clamp-1">{lead.prospect_name}</h3>
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {/* Status Dropdown */}
                  <select 
                    value={lead.status}
                    onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                    className={`text-xs font-black px-3 py-1.5 rounded-lg outline-none cursor-pointer border shadow-sm ${
                      lead.status === 'NEW' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      lead.status === 'CONTACTED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    <option value="NEW">🚨 NEW</option>
                    <option value="CONTACTED">💬 CONTACTED</option>
                    <option value="CONVERTED">✅ CONVERTED</option>
                  </select>
                </div>

                <div className="p-5 flex-1">
                  <div className="bg-[#ebf3f5] text-[#1f8898] px-3 py-2 rounded-xl text-sm font-bold inline-flex items-center gap-2 mb-4 w-full">
                    <Building2 className="w-4 h-4 shrink-0" />
                    <span className="truncate">Unit {lead.unit.unit_number} <span className="text-[#156a77] opacity-50 mx-1">|</span> {lead.unit.property.name}</span>
                  </div>

                  <div className="space-y-3 mb-5">
                    <p className="text-sm text-gray-600 flex items-center gap-2 font-medium">
                      <Phone className="w-4 h-4 text-gray-400 shrink-0" /> {lead.prospect_phone}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-2 font-medium">
                      <Mail className="w-4 h-4 text-gray-400 shrink-0" /> <span className="truncate">{lead.prospect_email}</span>
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 relative">
                    <div className="absolute -top-3 left-4 bg-white px-2 text-[10px] font-black uppercase tracking-wider text-gray-400">Message</div>
                    <p className="text-sm text-gray-700 italic line-clamp-3">"{lead.message}"</p>
                  </div>
                </div>

                <div className="p-4 border-t border-gray-50 flex gap-2">
                  <a 
                    href={getWhatsAppLink(lead.prospect_phone, lead.prospect_name, lead.unit.unit_number)}
                    target="_blank" rel="noopener noreferrer"
                    className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                  <a 
                    href={`mailto:${lead.prospect_email}`}
                    className="flex-1 bg-white border border-gray-200 text-gray-700 hover:border-[#1f8898] hover:text-[#1f8898] py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
                  >
                    <Mail className="w-4 h-4" /> Email
                  </a>
                </div>

              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}