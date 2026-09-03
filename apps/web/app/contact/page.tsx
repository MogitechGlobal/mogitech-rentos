// apps/web/app/contact/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import { 
  MapPin, Mail, Phone, MessageSquare, HeadphonesIcon, 
  HelpCircle, Building2, CreditCard, PlayCircle, BookOpen 
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactForm from "./components/ContactForm";

export const metadata: Metadata = {
  title: "Contact MogiRent | Mogitech Global",
  description: "Contact Mogitech Global to learn more about MogiRent, request a demo, ask about pricing, or discuss your property management needs.",
  alternates: {
    canonical: "https://mogirent.co.ke/contact"
  },
  openGraph: {
    title: "Contact MogiRent | Mogitech Global",
    description: "Contact Mogitech Global to learn more about MogiRent or discuss your property management needs.",
    url: "https://mogirent.co.ke/contact",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact MogiRent | Mogitech Global",
    description: "Contact Mogitech Global to discuss your property management needs."
  }
};

const jsonLdBreadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://mogirent.co.ke" },
    { "@type": "ListItem", "position": 2, "name": "Contact Us", "item": "https://mogirent.co.ke/contact" }
  ]
};

const jsonLdWebPage = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Contact MogiRent | Mogitech Global",
  "description": "Contact Mogitech Global to learn more about MogiRent, request a demo, ask about pricing, or discuss your property management needs.",
  "url": "https://mogirent.co.ke/contact"
};

export default function ContactPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebPage) }} />

      <div className="flex min-h-screen flex-col bg-[#f8fafb] font-sans selection:bg-[#1f8898]/30">
        <Navbar />

        <main className="flex-1 pt-8 pb-24 overflow-hidden relative">
          
          {/* Background Glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-[500px] w-[500px] rounded-full bg-gradient-to-bl from-[#ebf3f5] via-[#1f8898]/5 to-transparent opacity-80 blur-3xl pointer-events-none"></div>

          {/* --- BREADCRUMBS --- */}
          <div className="max-w-6xl mx-auto px-6 mb-6">
            <nav aria-label="Breadcrumb" className="text-xs font-bold text-gray-400 flex items-center gap-2">
              <Link href="/" className="hover:text-[#1f8898] transition-colors">Home</Link>
              <span>/</span>
              <span className="text-gray-600">Contact Us</span>
            </nav>
          </div>

          {/* --- HERO SECTION --- */}
          <section className="relative px-6 lg:px-8 text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ebf3f5] text-[#1f8898] text-[10px] font-black uppercase tracking-[0.15em] mb-4 shadow-sm">
              <MessageSquare className="w-3.5 h-3.5" /> Get in touch
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-gray-900 mb-6 leading-[1.1]">
              Let's talk about your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1f8898] to-[#0f4952]">property operations.</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 font-medium leading-relaxed max-w-2xl mx-auto mb-8">
              Whether you're managing a few rental units or a growing property portfolio, we're here to help you understand how MogiRent can fit into your workflow.
            </p>
          </section>

          {/* --- MAIN CONTACT AREA --- */}
          <section className="max-w-6xl mx-auto px-6 mb-24">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-stretch">
              
              {/* Left Column: Contact Info & Context */}
              <div className="w-full lg:w-5/12 flex flex-col gap-6">
                
                <div className="bg-white rounded-[2rem] p-8 border border-gray-200/80 shadow-sm flex-1">
                  <h2 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Contact Information</h2>
                  
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-[#1f8898] mb-2 flex items-center gap-2">
                        <Building2 className="w-4 h-4" /> Sales & Product
                      </h3>
                      <p className="text-sm text-gray-600 font-medium mb-2">For product demonstrations, pricing questions, and portfolio requirements.</p>
                      <a href="mailto:sales@mogitechglobal.com" className="text-gray-900 font-bold hover:text-[#1f8898] transition-colors text-sm flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" /> sales@mogitechglobal.com
                      </a>
                    </div>
                    
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-[#1f8898] mb-2 flex items-center gap-2">
                        <HeadphonesIcon className="w-4 h-4" /> Support
                      </h3>
                      <p className="text-sm text-gray-600 font-medium mb-2">For existing customer issues, account questions, and product assistance.</p>
                      <a href="mailto:support@mogirent.co.ke" className="text-gray-900 font-bold hover:text-[#1f8898] transition-colors text-sm flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" /> support@mogirent.co.ke
                      </a>
                    </div>

                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-[#1f8898] mb-2 flex items-center gap-2">
                        <Phone className="w-4 h-4" /> Phone
                      </h3>
                      <a href="tel:+254768569357" className="text-gray-900 font-bold hover:text-[#1f8898] transition-colors text-sm">
                        +254 (0) 768 569 357
                      </a>
                    </div>
                  </div>
                </div>

                {/* Location Card */}
                <div className="bg-[#0f4952] rounded-[2rem] p-8 border border-gray-800 text-white shadow-xl">
                  <div className="w-10 h-10 rounded-xl bg-white/10 text-teal-200 flex items-center justify-center mb-4 border border-white/10">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black mb-2 tracking-tight">Mogitech Global</h3>
                  <p className="text-sm font-medium text-teal-50/90 leading-relaxed mb-1">Nairobi, Kenya</p>
                  <p className="text-xs font-medium text-teal-100/60 leading-relaxed">Serving businesses across Kenya and beyond.</p>
                </div>

              </div>

              {/* Right Column: Contact Form */}
              <div className="w-full lg:w-7/12">
                <div className="bg-white rounded-[2rem] p-8 sm:p-10 border border-gray-200/80 shadow-xl shadow-black/5 h-full">
                  <div className="mb-8">
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2 tracking-tight">Send us a message</h2>
                    <p className="text-sm text-gray-500 font-medium">Fill out the form below and our team will get back to you.</p>
                  </div>
                  <ContactForm />
                </div>
              </div>

            </div>
          </section>

          {/* --- HOW CAN WE HELP CARDS --- */}
          <section className="max-w-6xl mx-auto px-6 mb-24">
            <div className="text-center mb-10">
              <h2 className="text-xs font-black text-[#1f8898] uppercase tracking-[0.2em] mb-2">Intent</h2>
              <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">How can we help?</h3>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/features" className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm hover:border-[#1f8898]/40 hover:shadow-md transition-all group">
                <PlayCircle className="w-6 h-6 text-[#1f8898] mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="font-black text-gray-900 text-sm mb-1">Explore MogiRent</h4>
                <p className="text-xs text-gray-500 font-medium">See how the platform can support your property operations.</p>
              </Link>
              <Link href="/pricing" className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm hover:border-[#1f8898]/40 hover:shadow-md transition-all group">
                <CreditCard className="w-6 h-6 text-[#1f8898] mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="font-black text-gray-900 text-sm mb-1">Talk About Pricing</h4>
                <p className="text-xs text-gray-500 font-medium">Find a plan that fits your property portfolio.</p>
              </Link>
              <a href="mailto:sales@mogitechglobal.com" className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm hover:border-[#1f8898]/40 hover:shadow-md transition-all group">
                <MessageSquare className="w-6 h-6 text-[#1f8898] mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="font-black text-gray-900 text-sm mb-1">Request a Demo</h4>
                <p className="text-xs text-gray-500 font-medium">See the platform and ask questions about your workflow.</p>
              </a>
              <a href="mailto:support@mogirent.co.ke" className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm hover:border-[#1f8898]/40 hover:shadow-md transition-all group">
                <HelpCircle className="w-6 h-6 text-[#1f8898] mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="font-black text-gray-900 text-sm mb-1">Get Support</h4>
                <p className="text-xs text-gray-500 font-medium">Already using MogiRent? Get assistance with your account.</p>
              </a>
            </div>
          </section>

          {/* --- BEFORE YOU CONTACT US (HELPFUL RESOURCES) --- */}
          <section className="max-w-4xl mx-auto px-6">
            <div className="bg-[#ebf3f5]/50 rounded-[2rem] p-8 sm:p-10 border border-[#1f8898]/10 text-center">
              <BookOpen className="w-8 h-8 text-[#1f8898] mx-auto mb-4" />
              <h3 className="text-xl font-black text-gray-900 mb-3 tracking-tight">Looking for an answer first?</h3>
              <p className="text-sm text-gray-600 font-medium mb-6">You may find what you need in our standard resources.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/pricing" className="bg-white text-gray-900 border border-gray-200 hover:border-[#1f8898] px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm">
                  Pricing Plans
                </Link>
                <Link href="/faq" className="bg-white text-gray-900 border border-gray-200 hover:border-[#1f8898] px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm">
                  Frequently Asked Questions
                </Link>
                <Link href="/blog" className="bg-white text-gray-900 border border-gray-200 hover:border-[#1f8898] px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm">
                  Property Management Blog
                </Link>
              </div>
            </div>
          </section>

        </main>

        <Footer />
      </div>
    </>
  );
}