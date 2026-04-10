// apps/web/app/contact/page.tsx
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight, Building2, Menu, X, Globe, 
  MapPin, Mail, Phone, Send, CheckCircle2, Loader2, MessageSquare
} from "lucide-react";

export default function ContactPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

      {/* --- PREMIUM NAVIGATION --- */}
      <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm' : 'bg-transparent'}`}>
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1f8898] to-[#135a65] text-[#ffffff] shadow-lg shadow-[#1f8898]/20 group-hover:scale-105 transition-transform duration-300">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="text-2xl font-black tracking-tight text-gray-900">
              Mogi<span className="text-[#1f8898]">RentOS</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-600">
            <Link href="/features" className="hover:text-[#1f8898] transition-colors">Platform</Link>
            <Link href="/pricing" className="hover:text-[#1f8898] transition-colors">Pricing</Link>
            <Link href="/about" className="hover:text-[#1f8898] transition-colors">Company</Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold text-gray-600 hover:text-[#1f8898] transition-colors px-4 py-2">
              Client Portal
            </Link>
            <Link href="/login" className="inline-flex h-11 items-center justify-center rounded-xl bg-gray-900 px-6 text-sm font-bold text-[#ffffff] shadow-lg transition-all hover:bg-[#1f8898] hover:shadow-[#1f8898]/30 hover:-translate-y-0.5">
              Access Dashboard <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-gray-900 hover:bg-gray-100 rounded-xl transition-colors z-50"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-0 left-0 w-full h-screen bg-white/95 backdrop-blur-2xl border-b border-gray-200 flex flex-col pt-24 px-6 animate-in slide-in-from-top-4 fade-in duration-300 z-40">
            <nav className="flex flex-col gap-6">
              <Link href="/features" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black text-gray-900 hover:text-[#1f8898]">Platform</Link>
              <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black text-gray-900 hover:text-[#1f8898]">Pricing</Link>
              <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black text-gray-900 hover:text-[#1f8898]">Company</Link>
              <div className="h-px bg-gray-200 my-4"></div>
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-gray-600 hover:text-[#1f8898] text-center">Tenant Sign In</Link>
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="mt-2 flex h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#1f8898] to-[#135a65] text-base font-bold text-[#ffffff] shadow-xl shadow-[#1f8898]/20 active:scale-95 transition-all">
                Access Manager Dashboard
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1 pt-32 pb-24 overflow-hidden relative">
        
        {/* Background Elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-[600px] w-[600px] rounded-full bg-gradient-to-bl from-[#ebf3f5] via-[#1f8898]/5 to-transparent opacity-80 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-[#1f8898]/10 to-transparent opacity-60 blur-3xl pointer-events-none"></div>

        <section className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900 mb-6">
              Let's talk about <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1f8898] to-[#0f4952]">scaling your portfolio.</span>
            </h1>
            <p className="text-lg text-gray-500 font-medium leading-relaxed">
              Whether you manage 50 units or 50,000, our enterprise sales team is ready to help you streamline your property operations.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-8 items-stretch">
            
            {/* --- CONTACT INFO PANEL --- */}
            <div className="w-full lg:w-5/12 flex flex-col gap-6 animate-in fade-in slide-in-from-left-8 duration-700 delay-100">
                
                {/* Sales Card */}
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-[#1f8898]/5 hover:-translate-y-1 transition-transform duration-300">
                    <div className="w-12 h-12 rounded-2xl bg-[#ebf3f5] text-[#1f8898] flex items-center justify-center mb-6">
                        <MessageSquare className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">Sales & Demos</h3>
                    <p className="text-sm font-medium text-gray-500 mb-6">Want to see MogiRentOS in action? Book a personalized demo with our property tech experts.</p>
                    <a href="mailto:sales@mogitechglobal.com" className="inline-flex items-center gap-3 text-[#1f8898] font-bold hover:text-[#135a65] transition-colors">
                        <Mail className="w-5 h-5" /> sales@mogitechglobal.com
                    </a>
                </div>

                {/* HQ Card */}
                <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800 shadow-2xl shadow-gray-900/20 text-white relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[#1f8898] rounded-full blur-3xl opacity-20 -mr-10 -mt-10 group-hover:opacity-40 transition-opacity"></div>
                    <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center mb-6 relative z-10 backdrop-blur-sm border border-white/10">
                        <MapPin className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-black mb-2 relative z-10">Global Headquarters</h3>
                    <p className="text-sm font-medium text-gray-400 mb-6 relative z-10">Mogitech Global Ltd is proudly headquartered in the heart of Africa's Silicon Savannah.</p>
                    <div className="space-y-3 relative z-10">
                        <div className="flex items-start gap-3">
                            <Building2 className="w-5 h-5 text-[#1f8898] shrink-0 mt-0.5" />
                            <span className="font-medium text-gray-300">Nairobi, Kenya<br/>East Africa</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-[#1f8898] shrink-0" />
                            <a href="tel:+254700000000" className="font-medium text-gray-300 hover:text-white transition-colors">+254 (0) 700 000 000</a>
                        </div>
                    </div>
                </div>

            </div>

            {/* --- LEAD GENERATION FORM --- */}
            <div className="w-full lg:w-7/12 animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
                <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 border border-gray-100 shadow-2xl shadow-[#1f8898]/5 h-full">
                    <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Send us a message</h3>
                    <p className="text-sm text-gray-500 font-medium mb-8">Fill out the form below and our enterprise team will reach out within 24 hours.</p>

                    {isSuccess ? (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-300">
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 border border-emerald-100">
                                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h4 className="text-2xl font-black text-gray-900 mb-2">Message Sent!</h4>
                            <p className="text-gray-500 font-medium max-w-sm mx-auto">Thank you for reaching out to Mogitech Global. One of our property tech specialists will be in touch shortly.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">First Name</label>
                                    <input 
                                        type="text" required
                                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-xl focus:ring-2 focus:ring-[#1f8898]/20 focus:border-[#1f8898] block p-3.5 outline-none transition-all"
                                        placeholder="John"
                                        value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Last Name</label>
                                    <input 
                                        type="text" required
                                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-xl focus:ring-2 focus:ring-[#1f8898]/20 focus:border-[#1f8898] block p-3.5 outline-none transition-all"
                                        placeholder="Doe"
                                        value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Work Email</label>
                                    <input 
                                        type="email" required
                                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-xl focus:ring-2 focus:ring-[#1f8898]/20 focus:border-[#1f8898] block p-3.5 outline-none transition-all"
                                        placeholder="john@company.com"
                                        value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Phone Number</label>
                                    <input 
                                        type="tel" required
                                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-xl focus:ring-2 focus:ring-[#1f8898]/20 focus:border-[#1f8898] block p-3.5 outline-none transition-all"
                                        placeholder="+254 700 000 000"
                                        value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Company Name</label>
                                    <input 
                                        type="text" required
                                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-xl focus:ring-2 focus:ring-[#1f8898]/20 focus:border-[#1f8898] block p-3.5 outline-none transition-all"
                                        placeholder="Apex Property Ltd"
                                        value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Portfolio Size</label>
                                    <select 
                                        required
                                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-xl focus:ring-2 focus:ring-[#1f8898]/20 focus:border-[#1f8898] block p-3.5 outline-none transition-all cursor-pointer"
                                        value={formData.portfolioSize} onChange={(e) => setFormData({...formData, portfolioSize: e.target.value})}
                                    >
                                        <option value="" disabled>Select unit count...</option>
                                        <option value="1-50">1 - 50 Units</option>
                                        <option value="51-200">51 - 200 Units</option>
                                        <option value="201-500">201 - 500 Units</option>
                                        <option value="500+">500+ Units</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">How can we help?</label>
                                <textarea 
                                    required rows={4}
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-xl focus:ring-2 focus:ring-[#1f8898]/20 focus:border-[#1f8898] block p-3.5 outline-none transition-all resize-none"
                                    placeholder="Tell us about your current management challenges..."
                                    value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})}
                                ></textarea>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-gray-900 px-8 text-base font-bold text-[#ffffff] shadow-xl shadow-gray-900/20 transition-all hover:bg-[#1f8898] hover:shadow-[#1f8898]/30 hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:hover:translate-y-0"
                            >
                                {isSubmitting ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</>
                                ) : (
                                    <>Submit Request <Send className="w-4 h-4 ml-1" /></>
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
      <footer className="border-t border-gray-200 bg-[#ffffff] pt-20 pb-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
            <div className="lg:col-span-2 pr-4">
              <div className="flex items-center gap-2 mb-6">
                <Building2 className="h-7 w-7 text-[#1f8898]" />
                <span className="text-2xl font-black text-gray-900 tracking-tight">Mogi<span className="text-[#1f8898]">RentOS</span></span>
              </div>
              <p className="text-sm font-medium text-gray-500 leading-relaxed mb-8 max-w-sm">
                The ultimate operating system for modern property managers and forward-thinking landlords in Africa and beyond.
              </p>
              <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-[#1f8898] hover:text-white transition-colors cursor-pointer"><Globe className="w-4 h-4"/></div>
              </div>
            </div>

            <div>
              <h4 className="font-black text-gray-900 mb-6 tracking-tight">Platform</h4>
              <ul className="space-y-4 text-sm font-medium text-gray-500">
                <li><Link href="/dashboard" className="hover:text-[#1f8898] transition-colors">Executive Dashboard</Link></li>
                <li><Link href="/portal" className="hover:text-[#1f8898] transition-colors">Tenant Portal</Link></li>
                <li><Link href="/pricing" className="hover:text-[#1f8898] transition-colors">Pricing</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-black text-gray-900 mb-6 tracking-tight">Company</h4>
              <ul className="space-y-4 text-sm font-medium text-gray-500">
                <li><Link href="/about" className="hover:text-[#1f8898] transition-colors">About Mogitech</Link></li>
                <li><a href="https://mogitechglobal.com/careers.php" target="_blank" rel="noopener noreferrer" className="hover:text-[#1f8898] transition-colors">Careers</a></li>
                <li><Link href="/contact" className="text-[#1f8898] transition-colors">Contact Sales</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-black text-gray-900 mb-6 tracking-tight">Legal</h4>
              <ul className="space-y-4 text-sm font-medium text-gray-500">
                <li><a href="https://mogitechglobal.com/privacy-policy.php" target="_blank" rel="noopener noreferrer" className="hover:text-[#1f8898] transition-colors">Privacy Policy</a></li>
                <li><a href="https://mogitechglobal.com/terms-of-service.php" target="_blank" rel="noopener noreferrer" className="hover:text-[#1f8898] transition-colors">Terms of Service</a></li>
                <li><a href="https://mogitechglobal.com/cookies.php" target="_blank" rel="noopener noreferrer" className="hover:text-[#1f8898] transition-colors">Data Processing</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm font-bold text-gray-400">
              &copy; {new Date().getFullYear()} Mogitech Global Ltd. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm font-bold text-gray-500 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              All Systems Operational
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}