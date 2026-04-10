// apps/web/app/dashboard/help/page.tsx
/* eslint-disable */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, DollarSign, Users, Wrench, ChevronDown, 
  LifeBuoy, MessageSquare, BookOpen, Settings, 
  ArrowRight, Mail, Phone, ShieldCheck,
  Headset, Send, Loader2, Clock, CheckCircle2, AlertCircle, Ticket, Star, X, FileText
} from 'lucide-react';

const categories = [
  { id: 'billing', icon: DollarSign, title: 'Billing & Payments', desc: 'Invoices, M-Pesa tracking, and automated rent.' },
  { id: 'tenants', icon: Users, title: 'Tenant Management', desc: 'Moving tenants in, leases, and directories.' },
  { id: 'maintenance', icon: Wrench, title: 'Maintenance', desc: 'Logging tickets and managing the Kanban board.' },
  { id: 'settings', icon: Settings, title: 'Platform Settings', desc: 'Configuring your company profile and banking.' },
];

const faqs = [
  { category: 'billing', question: 'How does the automated billing work?', answer: 'RentOS runs a background cron job on the 1st of every month. It automatically checks for active tenants and generates a rent invoice based on their unit\'s assigned rent amount.' },
  { category: 'billing', question: 'How do I manually generate invoices for a new month?', answer: 'Go to the Financials & Billing page and click the "Generate Invoices" button. The system will safely generate bills for any active tenant.' },
  { category: 'billing', question: 'Can I track partial payments?', answer: 'Yes! When recording a payment on an invoice, enter the exact amount the tenant paid. The invoice status will automatically update to "PARTIALLY PAID".' },
  { category: 'tenants', question: 'How do I move a tenant out?', answer: 'Navigate to the tenant\'s profile and edit their lease status to "Inactive". This stops the automated billing system from generating future invoices.' },
  { category: 'tenants', question: 'Can I import tenants from Excel?', answer: 'Yes. You can use our bulk CSV importer in the Tenant Directory. Make sure your file matches the exact column headers provided in the sample template.' },
  { category: 'maintenance', question: 'How do tenants submit maintenance requests?', answer: 'Tenants log into their dedicated portal and navigate to the Maintenance tab. When they submit an issue, it instantly appears in your "Pending" column.' },
  { category: 'maintenance', question: 'Will tenants be notified when I update a ticket?', answer: 'Yes. If you drag a ticket from "Pending" to "In Progress" or "Resolved", the system automatically sends a branded email update to the tenant.' },
  { category: 'settings', question: 'How do I add a new property manager?', answer: 'Multi-user Role-Based Access Control (RBAC) allows you to add managers. Go to Settings > Team, and invite them via email with either "Admin" or "Manager" permissions.' },
];

export default function HelpCenterPage() {
  const [viewMode, setViewMode] = useState<'faqs' | 'tickets'>('faqs');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ subject: '', message: '', priority: 'MEDIUM' });

  // --- DYNAMIC SYSTEM SETTINGS STATE ---
  const [globalSettings, setGlobalSettings] = useState({ 
    email: 'support@mogitechglobal.com', 
    phone: '+254 700 000 000',
    terms: ''
  });

  const ratingStateTemplate = { ticketId: '', rating: 0, feedback: '', isSubmitting: false };
  const [ratingState, setRatingState] = useState<typeof ratingStateTemplate | null>(null);

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

    const fetchTickets = async () => {
        setIsLoadingTickets(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/landlords/support-tickets`, { credentials: 'include' });
            if (res.ok) setTickets(await res.json());
        } catch (err) { console.error(err); } 
        finally { setIsLoadingTickets(false); }
    };

    fetchSystemSettings();
    fetchTickets(); 
  }, []);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/landlords/support-tickets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(formData)
        });
        if (!res.ok) throw new Error('Failed to submit ticket');
        
        const updatedTicketsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/landlords/support-tickets`, { credentials: 'include' });
        if (updatedTicketsRes.ok) setTickets(await updatedTicketsRes.json());
        
        setFormData({ subject: '', message: '', priority: 'MEDIUM' });
        alert('Support ticket submitted to MogiRentOS administration successfully.');
    } catch (err: any) {
        alert(err.message);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleRateTicket = async (ticketId: string) => {
    if (!ratingState || ratingState.rating === 0) return;
    setRatingState(prev => ({ ...prev!, isSubmitting: true }));
    
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/landlords/support-tickets/${ticketId}/rate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ rating: ratingState.rating, feedback: ratingState.feedback })
        });
        if (!res.ok) throw new Error('Failed to submit rating');
        setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, rating: ratingState.rating, feedback: ratingState.feedback } : t));
        setRatingState(null);
    } catch (err: any) {
        alert(err.message);
        setRatingState(prev => ({ ...prev!, isSubmitting: false }));
    }
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || faq.category === activeTab;
    return searchQuery ? matchesSearch : matchesTab;
  });

  return (
    <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans selection:bg-[#1f8898]/30 animate-in fade-in duration-300 overflow-x-hidden">
      
      <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-6 py-20 text-center relative overflow-hidden shadow-inner">
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
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setViewMode('faqs'); 
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-center -mt-8 relative z-30 mb-10 px-4">
        <div className="bg-white p-1.5 rounded-2xl shadow-lg shadow-black/5 border border-gray-100 inline-flex flex-col sm:flex-row gap-1 max-w-full overflow-x-auto">
          <button 
            onClick={() => setViewMode('faqs')}
            className={`px-8 py-3.5 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 whitespace-nowrap ${viewMode === 'faqs' ? 'bg-[#1f8898] text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
          >
            <BookOpen className="w-4 h-4" /> Knowledge Base
          </button>
          <button 
            onClick={() => setViewMode('tickets')}
            className={`px-8 py-3.5 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 whitespace-nowrap ${viewMode === 'tickets' ? 'bg-[#1f8898] text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
          >
            <Ticket className="w-4 h-4" /> My Support Tickets
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 relative z-20 space-y-12">
        
        {viewMode === 'faqs' && (
          <div className="animate-in fade-in duration-500 space-y-12">
            {!searchQuery && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {categories.map((cat, idx) => {
                  const Icon = cat.icon;
                  return (
                    <div 
                      key={idx} 
                      onClick={() => { setActiveTab(cat.id); setOpenFaq(null); }}
                      className={`bg-[#ffffff] p-6 rounded-2xl shadow-sm border transition-all cursor-pointer group hover:-translate-y-1 hover:shadow-md
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
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                    {searchQuery ? 'Search Results' : 'Frequently Asked Questions'}
                  </h2>
                  {!searchQuery && activeTab !== 'all' && (
                    <button onClick={() => setActiveTab('all')} className="text-sm font-bold text-[#1f8898] hover:text-[#1a7684] flex items-center gap-1">
                      View All <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                {filteredFaqs.length === 0 ? (
                  <div className="bg-[#ffffff] py-16 px-6 rounded-3xl border border-gray-100 shadow-sm text-center">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-900 font-black text-xl mb-2">No results found</p>
                    <p className="text-gray-500 font-medium max-w-md mx-auto mb-6">We couldn't find any articles matching "{searchQuery}". Try adjusting your search terms or open a ticket.</p>
                    <button onClick={() => setViewMode('tickets')} className="px-6 py-3 bg-[#1f8898] text-white font-bold rounded-xl shadow-lg hover:bg-[#1a7684] transition-all">
                      Open a Support Ticket
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredFaqs.map((faq, idx) => {
                      const isOpen = openFaq === idx;
                      return (
                        <div key={idx} className={`bg-[#ffffff] rounded-2xl border transition-all duration-200 overflow-hidden
                          ${isOpen ? 'border-[#1f8898]/30 shadow-md' : 'border-gray-100 shadow-sm hover:border-gray-300'}
                        `}>
                          <button onClick={() => setOpenFaq(isOpen ? null : idx)} className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none group">
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
                              <p className="text-gray-600 text-sm leading-relaxed font-medium">{faq.answer}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="lg:col-span-1 space-y-6 sticky top-8">
                
                {/* --- DYNAMIC BRANDING USED HERE --- */}
                <div className="bg-[#ffffff] rounded-3xl p-8 shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-[#ebf3f5] rounded-xl flex items-center justify-center mb-5">
                    <LifeBuoy className="w-6 h-6 text-[#1f8898]" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">Still need help?</h3>
                  <p className="text-gray-500 text-sm mb-6 font-medium leading-relaxed">
                    Can't find the answer you're looking for? Our dedicated technical support team is ready to assist you.
                  </p>
                  
                  <div className="space-y-3">
                    <button 
                      onClick={() => setViewMode('tickets')} 
                      className="w-full bg-[#1f8898] hover:bg-[#1a7684] text-[#ffffff] font-bold py-3.5 px-4 rounded-xl transition duration-200 shadow-md flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Ticket className="w-5 h-5" /> Open Support Ticket
                    </button>
                    <a href={`mailto:${globalSettings.email}`} className="w-full bg-white border border-gray-200 hover:border-[#1f8898] hover:bg-gray-50 text-gray-700 font-bold py-3.5 px-4 rounded-xl transition duration-200 flex items-center justify-center gap-2 active:scale-95">
                      <Mail className="w-5 h-5 text-gray-400" /> Email Support
                    </a>
                    <a href={`tel:${globalSettings.phone.replace(/\s+/g, '')}`} className="w-full bg-white border border-gray-200 hover:border-[#1f8898] hover:bg-gray-50 text-gray-700 font-bold py-3.5 px-4 rounded-xl transition duration-200 flex items-center justify-center gap-2 active:scale-95">
                      <Phone className="w-5 h-5 text-gray-400" /> Call {globalSettings.phone}
                    </a>
                  </div>
                </div>

                {globalSettings.terms && (
                  <button onClick={() => setIsTermsModalOpen(true)} className="w-full flex items-center justify-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors p-4">
                    <FileText className="w-4 h-4" /> View Terms & Conditions
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'tickets' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 h-fit">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#ebf3f5] rounded-xl flex items-center justify-center shrink-0">
                        <Headset className="w-5 h-5 text-[#1f8898]" />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Open a Ticket</h2>
                </div>
                
                <form onSubmit={handleSubmitTicket} className="space-y-5">
                    <div>
                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Issue Subject</label>
                        <input 
                            type="text" required placeholder="e.g., M-Pesa Integration Failing"
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-gray-50/50 text-sm font-medium text-gray-900 shadow-sm"
                            value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Priority</label>
                        <select 
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-gray-50/50 text-sm font-bold text-gray-900 cursor-pointer shadow-sm"
                            value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}
                        >
                            <option value="LOW">Low (General Question)</option>
                            <option value="MEDIUM">Medium (Bug / Glitch)</option>
                            <option value="HIGH">High (Billing Issue)</option>
                            <option value="URGENT">Urgent (System Down)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Details</label>
                        <textarea 
                            required rows={5} placeholder="Describe your issue in detail..."
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-gray-50/50 text-sm font-medium text-gray-900 resize-none shadow-sm"
                            value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}
                        />
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#1f8898] hover:bg-[#1a7684] text-[#ffffff] font-black rounded-xl shadow-lg shadow-[#1f8898]/20 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100">
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        {isSubmitting ? 'Submitting...' : 'Submit Support Ticket'}
                    </button>
                </form>
            </div>

            <div className="lg:col-span-7 space-y-4">
                <h3 className="text-xl font-black text-gray-900 tracking-tight px-1 mb-2">Your Active Tickets</h3>
                
                {isLoadingTickets ? (
                    <div className="flex justify-center items-center h-64 bg-white rounded-3xl border border-gray-100 shadow-sm"><Loader2 className="w-8 h-8 animate-spin text-[#1f8898]" /></div>
                ) : tickets.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm">
                        <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                        <p className="font-black text-gray-900 text-xl tracking-tight">No Issues Reported</p>
                        <p className="text-gray-500 font-medium mt-2">You haven't submitted any support tickets yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {tickets.map(ticket => (
                            <div key={ticket.id} className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow group">
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <h4 className="font-black text-xl text-gray-900 tracking-tight group-hover:text-[#1f8898] transition-colors">{ticket.subject}</h4>
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border shrink-0
                                        ${ticket.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                                          ticket.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                                          'bg-gray-100 text-gray-600 border-gray-200'}
                                    `}>
                                        {ticket.status}
                                    </span>
                                </div>
                                <div className="text-sm font-medium text-gray-600 mb-5 bg-gray-50/50 p-5 rounded-2xl border border-gray-100 whitespace-pre-wrap">
                                    {ticket.message}
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest pt-4 border-t border-gray-50 mb-4">
                                    <span className="flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm"><AlertCircle className="w-3.5 h-3.5" /> Priority: {ticket.priority}</span>
                                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(ticket.created_at).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}</span>
                                </div>

                                {ticket.status === 'RESOLVED' && (
                                    <div className="pt-5 border-t border-gray-100">
                                        {ticket.rating ? (
                                            <div className="flex items-center justify-between bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                                                <div>
                                                    <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest mb-1">Your Rating</p>
                                                    <div className="flex items-center gap-1">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star key={star} className={`w-4 h-4 ${star <= ticket.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 animate-in fade-in zoom-in-95">
                                                <h5 className="text-sm font-bold text-gray-900 mb-1">How did we do?</h5>
                                                <p className="text-xs font-medium text-gray-500 mb-4">Please rate your support experience to help us improve.</p>
                                                
                                                {!ratingState || ratingState.ticketId !== ticket.id ? (
                                                    <div className="flex items-center gap-2">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <button
                                                                key={star}
                                                                onClick={() => setRatingState({ ticketId: ticket.id, rating: star, feedback: '', isSubmitting: false })}
                                                                className="p-1 hover:scale-110 transition-transform focus:outline-none"
                                                            >
                                                                <Star className="w-8 h-8 text-gray-300 hover:fill-amber-400 hover:text-amber-400 transition-colors" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <button
                                                                    key={star}
                                                                    onClick={() => setRatingState(prev => ({ ...prev!, rating: star }))}
                                                                    className="p-1 hover:scale-110 transition-transform focus:outline-none"
                                                                >
                                                                    <Star className={`w-6 h-6 ${star <= ratingState.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 hover:fill-amber-300 hover:text-amber-300'}`} />
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <textarea 
                                                            placeholder="Optional: Tell us what went well or what we can improve..."
                                                            className="w-full text-sm font-medium px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 resize-none shadow-sm"
                                                            rows={2}
                                                            value={ratingState.feedback}
                                                            onChange={(e) => setRatingState(prev => ({ ...prev!, feedback: e.target.value }))}
                                                        />
                                                        <div className="flex gap-2 justify-end">
                                                            <button 
                                                                onClick={() => setRatingState(null)}
                                                                className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button 
                                                                onClick={() => handleRateTicket(ticket.id)}
                                                                disabled={ratingState.isSubmitting}
                                                                className="px-5 py-2 text-xs font-bold text-white bg-[#1f8898] hover:bg-[#1a7684] rounded-lg shadow-md flex items-center gap-2 disabled:opacity-50"
                                                            >
                                                                {ratingState.isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                                                Submit Rating
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
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