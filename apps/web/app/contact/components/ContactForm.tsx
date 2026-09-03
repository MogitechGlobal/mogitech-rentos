// apps/web/app/contact/components/ContactForm.tsx
'use client';

import { useState } from "react";
import { Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      // Cleanly resolve the backend URL to prevent duplicate /api/v1 paths.
      let baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
      
      // Remove trailing slash if it exists
      if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
      }
      
      // If the baseUrl already includes '/api/v1', don't append it again
      const endpoint = baseUrl.endsWith('/api/v1') 
        ? `${baseUrl}/contact` 
        : `${baseUrl}/api/v1/contact`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div 
        className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-300 py-12 px-6"
        role="alert" 
        aria-live="polite"
      >
        <div className="w-20 h-20 bg-[#ebf3f5] rounded-full flex items-center justify-center mb-6 border border-[#1f8898]/10 shadow-sm">
          <CheckCircle2 className="w-10 h-10 text-[#1f8898]" />
        </div>
        <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Thanks for reaching out.</h3>
        <p className="text-gray-600 font-medium max-w-md mx-auto">
          We've received your enquiry. Our team will review it and get back to you using the contact details you provided.
        </p>
        <button 
          onClick={() => setStatus('idle')}
          className="mt-8 text-sm font-bold text-[#1f8898] hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {status === 'error' && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 text-rose-800" role="alert" aria-live="assertive">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-black mb-1">We couldn't send your message.</p>
            <p className="text-xs font-medium">Please check your details and try again. If the problem continues, contact us directly by email or phone.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label htmlFor="firstName" className="text-xs font-black uppercase tracking-widest text-gray-600 ml-1">First Name <span className="text-rose-500">*</span></label>
          <input
            id="firstName" name="firstName" type="text" required
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-xl focus:ring-2 focus:ring-[#1f8898]/20 focus:border-[#1f8898] block p-3.5 outline-none transition-all shadow-sm"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="lastName" className="text-xs font-black uppercase tracking-widest text-gray-600 ml-1">Last Name</label>
          <input
            id="lastName" name="lastName" type="text"
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-xl focus:ring-2 focus:ring-[#1f8898]/20 focus:border-[#1f8898] block p-3.5 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-gray-600 ml-1">Work Email <span className="text-rose-500">*</span></label>
          <input
            id="email" name="email" type="email" required
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-xl focus:ring-2 focus:ring-[#1f8898]/20 focus:border-[#1f8898] block p-3.5 outline-none transition-all shadow-sm"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="phone" className="text-xs font-black uppercase tracking-widest text-gray-600 ml-1">Phone Number</label>
          <input
            id="phone" name="phone" type="tel"
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-xl focus:ring-2 focus:ring-[#1f8898]/20 focus:border-[#1f8898] block p-3.5 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label htmlFor="company" className="text-xs font-black uppercase tracking-widest text-gray-600 ml-1">Company / Organisation</label>
          <input
            id="company" name="company" type="text"
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-xl focus:ring-2 focus:ring-[#1f8898]/20 focus:border-[#1f8898] block p-3.5 outline-none transition-all shadow-sm"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="enquiryType" className="text-xs font-black uppercase tracking-widest text-gray-600 ml-1">Enquiry Type <span className="text-rose-500">*</span></label>
          <div className="relative">
            <select
              id="enquiryType" name="enquiryType" required defaultValue=""
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-xl focus:ring-2 focus:ring-[#1f8898]/20 focus:border-[#1f8898] block p-3.5 outline-none transition-all cursor-pointer shadow-sm appearance-none"
            >
              <option value="" disabled>Select enquiry type...</option>
              <option value="demo">MogiRent Demo</option>
              <option value="pricing">Pricing</option>
              <option value="getting-started">Getting Started</option>
              <option value="property-management">Property Management</option>
              <option value="support">Technical Support</option>
              <option value="partnership">Partnership</option>
              <option value="general">General Enquiry</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="message" className="text-xs font-black uppercase tracking-widest text-gray-600 ml-1">Message <span className="text-rose-500">*</span></label>
        <textarea
          id="message" name="message" required rows={4}
          className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-xl focus:ring-2 focus:ring-[#1f8898]/20 focus:border-[#1f8898] block p-3.5 outline-none transition-all resize-none shadow-sm"
          placeholder="Tell us what you'd like help with..."
        ></textarea>
      </div>

      <div className="pt-2">
        <p className="text-[11px] text-gray-500 font-medium leading-relaxed mb-4">
          By submitting this form, you agree that Mogitech Global may use the information provided to respond to your enquiry.
        </p>
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-[#0f4952] px-8 text-sm font-black tracking-wide text-white shadow-lg transition-all hover:bg-[#1f8898] active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
        >
          {status === 'submitting' ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
          ) : (
            <>Send Message <Send className="w-4 h-4 ml-1" /></>
          )}
        </button>
      </div>
    </form>
  );
}