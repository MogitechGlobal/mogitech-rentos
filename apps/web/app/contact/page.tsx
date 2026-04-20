// apps/web/app/contact/page.tsx
'use client';

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight, Building2, Globe, MapPin, 
  Mail, Phone, Send, CheckCircle2, Loader2, 
  MessageSquare, HeadphonesIcon
} from "lucide-react";
import Footer from "@/components/Footer";

export default function ContactPage() {
  // Form States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    portfolioSize: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call for lead capture
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({ firstName: '', lastName: '', email: '', phone: '', company: '', portfolioSize: '', message: '' });

      // Reset success message after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
    }, 1500);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafb] font-sans selection:bg-[#1f8898]/30">

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

      <main className="flex-1 pt-16 pb-24 overflow-hidden relative">

        {/* Background Elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-[600px] w-[600px] rounded-full bg-gradient-to-bl from-[#ebf3f5] via-[#1f8898]/5 to-transparent opacity-80 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-[#1f8898]/10 to-transparent opacity-60 blur-3xl pointer-events-none"></div>

        <section className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">

          {/* --- HERO SECTION --- */}
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ebf3f5] text-[#1f8898] text-[10px] font-black uppercase tracking-[0.15em] mb-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                <HeadphonesIcon className="w-3.5 h-3.5" /> Get in touch
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900 mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 leading-[1.1]">
              Let's talk about <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1f8898] to-[#0f4952]">scaling your portfolio.</span>
            </h1>
            <p className="text-lg text-gray-500 font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              Whether you manage 50 units or 50,000, our enterprise sales team is ready to help you streamline your property operations.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-8 items-stretch">

            {/* --- CONTACT INFO PANEL --- */}
            <div className="w-full lg:w-5/12 flex flex-col gap-6 animate-in fade-in slide-in-from-left-8 duration-700 delay-300">

              {/* Sales Card */}
              <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 border border-gray-100 shadow-xl shadow-[#1f8898]/5 hover:-translate-y-1 transition-transform duration-300">
                <div className="w-14 h-14 rounded-2xl bg-[#ebf3f5] text-[#1f8898] flex items-center justify-center mb-6 border border-[#1f8898]/10 shadow-sm">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">Sales & Demos</h3>
                <p className="text-base font-medium text-gray-500 mb-8 leading-relaxed">Want to see MogiRentOS in action? Book a personalized demo with our property tech experts.</p>
                <a href="mailto:sales@mogitechglobal.com" className="inline-flex items-center gap-3 text-[#1f8898] font-black hover:text-[#135a65] transition-colors">
                  <Mail className="w-5 h-5" /> sales@mogitechglobal.com
                </a>
              </div>

              {/* HQ Card */}
              <div className="bg-gradient-to-br from-[#0d393f] to-[#0a2c31] rounded-[2.5rem] p-8 sm:p-10 border border-gray-800 shadow-2xl shadow-gray-900/20 text-white relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#1f8898] rounded-full blur-3xl opacity-20 -mr-20 -mt-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center mb-6 relative z-10 backdrop-blur-sm border border-white/10 shadow-sm">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black mb-3 relative z-10 tracking-tight">Global Headquarters</h3>
                <p className="text-base font-medium text-teal-100/70 mb-8 leading-relaxed relative z-10">Mogitech Global Ltd is proudly headquartered in the heart of Africa's Silicon Savannah.</p>
                <div className="space-y-4 relative z-10">
                  <div className="flex items-start gap-4">
                    <Building2 className="w-5 h-5 text-[#1f8898] shrink-0 mt-0.5" />
                    <span className="font-bold text-white leading-relaxed">Nairobi, Kenya<br /><span className="text-teal-100/50 font-medium">East Africa</span></span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Phone className="w-5 h-5 text-[#1f8898] shrink-0" />
                    <a href="tel:+254768569357" className="font-bold text-white hover:text-[#1f8898] transition-colors">+254 (0) 768 569 357</a>
                  </div>
                </div>
              </div>

            </div>

            {/* --- LEAD GENERATION FORM --- */}
            <div className="w-full lg:w-7/12 animate-in fade-in slide-in-from-right-8 duration-700 delay-400">
              <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 border border-gray-100 shadow-2xl shadow-black/5 h-full flex flex-col">
                
                <div className="mb-8">
                  <h3 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Send us a message</h3>
                  <p className="text-base text-gray-500 font-medium">Fill out the form below and our enterprise team will reach out within 24 hours.</p>
                </div>

                {isSuccess ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-300 py-12">
                    <div className="w-24 h-24 bg-[#ebf3f5] rounded-full flex items-center justify-center mb-8 border border-[#1f8898]/10 shadow-sm">
                      <CheckCircle2 className="w-12 h-12 text-[#1f8898]" />
                    </div>
                    <h4 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Message Sent!</h4>
                    <p className="text-gray-500 font-medium max-w-md mx-auto text-lg">Thank you for reaching out to Mogitech Global. One of our property tech specialists will be in touch shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">First Name</label>
                          <input
                            type="text" required
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-xl focus:ring-2 focus:ring-[#1f8898]/20 focus:border-[#1f8898] block p-4 outline-none transition-all shadow-sm"
                            placeholder="Jacob"
                            value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Last Name</label>
                          <input
                            type="text" required
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-xl focus:ring-2 focus:ring-[#1f8898]/20 focus:border-[#1f8898] block p-4 outline-none transition-all shadow-sm"
                            placeholder="Mogire"
                            value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Work Email</label>
                          <input
                            type="email" required
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-xl focus:ring-2 focus:ring-[#1f8898]/20 focus:border-[#1f8898] block p-4 outline-none transition-all shadow-sm"
                            placeholder="jacob@company.com"
                            value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Phone Number</label>
                          <input
                            type="tel" required
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-xl focus:ring-2 focus:ring-[#1f8898]/20 focus:border-[#1f8898] block p-4 outline-none transition-all shadow-sm"
                            placeholder="+254 700 000 000"
                            value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Company Name</label>
                          <input
                            type="text" required
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-xl focus:ring-2 focus:ring-[#1f8898]/20 focus:border-[#1f8898] block p-4 outline-none transition-all shadow-sm"
                            placeholder="Apex Property Ltd"
                            value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Portfolio Size</label>
                          <div className="relative">
                            <select
                              required
                              className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-xl focus:ring-2 focus:ring-[#1f8898]/20 focus:border-[#1f8898] block p-4 outline-none transition-all cursor-pointer shadow-sm appearance-none"
                              value={formData.portfolioSize} onChange={(e) => setFormData({ ...formData, portfolioSize: e.target.value })}
                            >
                              <option value="" disabled>Select unit count...</option>
                              <option value="1-50">1 - 50 Units</option>
                              <option value="51-200">51 - 200 Units</option>
                              <option value="201-500">201 - 500 Units</option>
                              <option value="500+">500+ Units</option>
                            </select>
                            {/* Custom dropdown arrow */}
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">How can we help?</label>
                        <textarea
                          required rows={4}
                          className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-xl focus:ring-2 focus:ring-[#1f8898]/20 focus:border-[#1f8898] block p-4 outline-none transition-all resize-none shadow-sm"
                          placeholder="Tell us about your current management challenges..."
                          value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        ></textarea>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex h-16 mt-6 items-center justify-center gap-2 rounded-xl bg-gray-900 px-8 text-base font-black tracking-wide text-[#ffffff] shadow-xl shadow-gray-900/20 transition-all hover:bg-[#1f8898] hover:shadow-[#1f8898]/30 hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:hover:translate-y-0"
                    >
                      {isSubmitting ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</>
                      ) : (
                        <>Submit Request <Send className="w-5 h-5 ml-1" /></>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* --- PREMIUM FOOTER --- */}
      <Footer />

    </div>
  );
}