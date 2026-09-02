// apps/web/app/customers/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { 
  Building2, ArrowRight, Home, Users, CheckCircle2, 
  ShieldCheck, FileText, Wrench, BarChart3, CreditCard, MessageCircle 
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { customerStories } from "@/data/customers/customer-stories";

export const metadata: Metadata = {
  title: "MogiRent Customers & Use Cases | Property Management Software Kenya",
  description: "See how MogiRent helps landlords, property managers, agencies, and growing property businesses organise properties, tenants, rent, maintenance, and daily operations.",
  keywords: "property management software Kenya, rental property management, tenant management software, landlord software Kenya, MogiRent use cases",
  alternates: {
    canonical: "https://mogirent.co.ke/customers"
  },
  openGraph: {
    title: "MogiRent Customers & Use Cases | Property Management Software",
    description: "Discover how property owners and managers use MogiRent to organise rental operations.",
    url: "https://mogirent.co.ke/customers",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "MogiRent Customers & Use Cases | Property Management Software",
    description: "Discover how property owners and managers use MogiRent to organise rental operations."
  }
};

const jsonLdBreadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://mogirent.co.ke" },
    { "@type": "ListItem", "position": 2, "name": "Customers & Use Cases", "item": "https://mogirent.co.ke/customers" }
  ]
};

export default function CustomersPage() {
  const verifiedStories = customerStories.filter(s => s.verified && s.approvedForPublicUse);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />

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
              <span className="text-gray-600">Customers & Use Cases</span>
            </nav>
          </div>

          {/* --- HERO SECTION --- */}
          <section className="relative px-6 lg:px-8 text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ebf3f5] text-[#1f8898] text-[10px] font-black uppercase tracking-[0.15em] mb-4 shadow-sm">
              <Building2 className="w-3.5 h-3.5" /> PROPERTY MANAGEMENT PLATFORM
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-gray-900 mb-6 leading-[1.1]">
              Built for the people who <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1f8898] to-[#0f4952]">manage property.</span>
            </h1>
            
            <p className="text-base sm:text-lg text-gray-600 font-medium leading-relaxed max-w-2xl mx-auto mb-8">
              From individual landlords to growing property management teams, MogiRent brings properties, tenants, rent, maintenance, and day-to-day operations into one organised platform.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/register" className="w-full sm:w-auto bg-[#1f8898] hover:bg-[#1a7684] text-white px-8 py-4 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 text-center">
                Start Managing Smarter
              </Link>
              <Link href="/pricing" className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 px-8 py-4 rounded-xl font-bold text-sm transition-all shadow-sm text-center">
                Explore MogiRent
              </Link>
            </div>
          </section>

          {/* --- AUDIENCE / USE CASES SECTION --- */}
          <section className="max-w-6xl mx-auto px-6 mb-24">
            <div className="text-center mb-12 max-w-2xl mx-auto">
              <h2 className="text-xs font-black text-[#1f8898] uppercase tracking-[0.2em] mb-2">Use Cases</h2>
              <h3 className="text-3xl font-black text-gray-900 tracking-tight">One platform. Different property needs.</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Landlords */}
              <div className="bg-white p-8 rounded-3xl border border-gray-200/80 shadow-sm flex flex-col justify-between hover:border-[#1f8898]/40 transition-all">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#ebf3f5] text-[#1f8898] flex items-center justify-center mb-6 font-bold">
                    <Home className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-black text-gray-900 mb-2">Landlords</h4>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6">
                    Know what is happening across your properties without relying on spreadsheets and scattered records.
                  </p>
                  <ul className="space-y-2.5 mb-8 text-xs font-bold text-gray-700">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#1f8898]" /> Tenant records & lease history</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#1f8898]" /> Rent tracking & payment visibility</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#1f8898]" /> Property information & documents</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#1f8898]" /> Maintenance request logs</li>
                  </ul>
                </div>
                <Link href="/pricing" className="text-xs font-bold text-[#1f8898] uppercase tracking-wider flex items-center gap-1 group hover:underline">
                  For Landlords <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Property Managers */}
              <div className="bg-white p-8 rounded-3xl border border-gray-200/80 shadow-sm flex flex-col justify-between hover:border-[#1f8898]/40 transition-all">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#ebf3f5] text-[#1f8898] flex items-center justify-center mb-6 font-bold">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-black text-gray-900 mb-2">Property Managers</h4>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6">
                    Manage multiple properties and tenants from one central workspace.
                  </p>
                  <ul className="space-y-2.5 mb-8 text-xs font-bold text-gray-700">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#1f8898]" /> Portfolio & multi-building management</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#1f8898]" /> Rent collection workflows</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#1f8898]" /> Staff role-based permissions</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#1f8898]" /> Operational reporting</li>
                  </ul>
                </div>
                <Link href="/pricing" className="text-xs font-bold text-[#1f8898] uppercase tracking-wider flex items-center gap-1 group hover:underline">
                  For Property Managers <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Real Estate Agencies */}
              <div className="bg-white p-8 rounded-3xl border border-gray-200/80 shadow-sm flex flex-col justify-between hover:border-[#1f8898]/40 transition-all">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#ebf3f5] text-[#1f8898] flex items-center justify-center mb-6 font-bold">
                    <Users className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-black text-gray-900 mb-2">Real Estate Agencies</h4>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6">
                    Bring property operations and client management into a more organised workflow.
                  </p>
                  <ul className="space-y-2.5 mb-8 text-xs font-bold text-gray-700">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#1f8898]" /> Property records & unit availability</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#1f8898]" /> Agency operations & client visibility</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#1f8898]" /> Team access controls</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#1f8898]" /> Tenant & lease communication</li>
                  </ul>
                </div>
                <Link href="/pricing" className="text-xs font-bold text-[#1f8898] uppercase tracking-wider flex items-center gap-1 group hover:underline">
                  For Agencies <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Growing Property Businesses */}
              <div className="bg-white p-8 rounded-3xl border border-gray-200/80 shadow-sm flex flex-col justify-between hover:border-[#1f8898]/40 transition-all">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#ebf3f5] text-[#1f8898] flex items-center justify-center mb-6 font-bold">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-black text-gray-900 mb-2">Growing Property Businesses</h4>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6">
                    Replace fragmented processes with a system that can grow with your portfolio.
                  </p>
                  <ul className="space-y-2.5 mb-8 text-xs font-bold text-gray-700">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#1f8898]" /> Centralised operational records</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#1f8898]" /> Scalable team workflows</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#1f8898]" /> Portfolio performance reporting</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#1f8898]" /> Reduced reliance on spreadsheets</li>
                  </ul>
                </div>
                <Link href="/pricing" className="text-xs font-bold text-[#1f8898] uppercase tracking-wider flex items-center gap-1 group hover:underline">
                  Explore MogiRent <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

            </div>
          </section>

          {/* --- OPERATIONAL CHALLENGES: BEFORE VS WITH MOGIRENT --- */}
          <section className="max-w-6xl mx-auto px-6 mb-24">
            <div className="text-center mb-12 max-w-2xl mx-auto">
              <h2 className="text-xs font-black text-[#1f8898] uppercase tracking-[0.2em] mb-2">Workflow Evolution</h2>
              <h3 className="text-3xl font-black text-gray-900 tracking-tight">What better property operations look like</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Before */}
              <div className="bg-white p-8 sm:p-10 rounded-3xl border border-gray-200 shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg mb-6 inline-block">Traditional Approach</span>
                <h4 className="text-xl font-black text-gray-900 mb-6">Fragmented Processes</h4>
                <ul className="space-y-4 text-sm font-medium text-gray-600">
                  <li className="flex items-center gap-3">❌ Spreadsheets and manual record keeping</li>
                  <li className="flex items-center gap-3">❌ Paper records prone to misplacement</li>
                  <li className="flex items-center gap-3">❌ Scattered payment information</li>
                  <li className="flex items-center gap-3">❌ Manual follow-ups on rent and leases</li>
                  <li className="flex items-center gap-3">❌ Disconnected maintenance communication</li>
                  <li className="flex items-center gap-3">❌ Limited visibility across multiple properties</li>
                </ul>
              </div>

              {/* With MogiRent */}
              <div className="bg-[#0f4952] p-8 sm:p-10 rounded-3xl text-white shadow-xl flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-teal-200 bg-white/10 px-3 py-1.5 rounded-lg mb-6 inline-block">With MogiRent</span>
                  <h4 className="text-xl font-black text-white mb-6">Organised Platform</h4>
                  <ul className="space-y-4 text-sm font-medium text-teal-50/90">
                    <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-teal-300 shrink-0" /> Centralised property and unit records</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-teal-300 shrink-0" /> Organised tenant and lease information</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-teal-300 shrink-0" /> Clear rent tracking and payment history</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-teal-300 shrink-0" /> Structured maintenance request workflows</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-teal-300 shrink-0" /> Role-based access for teams and staff</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-teal-300 shrink-0" /> Better operational visibility across buildings</li>
                  </ul>
                </div>
              </div>

            </div>
          </section>

          {/* --- PRODUCT CAPABILITY SECTION --- */}
          <section className="max-w-6xl mx-auto px-6 mb-24">
            <div className="text-center mb-12 max-w-2xl mx-auto">
              <h2 className="text-xs font-black text-[#1f8898] uppercase tracking-[0.2em] mb-2">Platform Capabilities</h2>
              <h3 className="text-3xl font-black text-gray-900 tracking-tight">From daily tasks to portfolio visibility</h3>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[
                { title: "Properties", desc: "Manage property and unit information from one place.", icon: Building2 },
                { title: "Tenants", desc: "Keep tenant information and tenancy records organised.", icon: Users },
                { title: "Rent", desc: "Track rent-related activity and payment records.", icon: CreditCard },
                { title: "Maintenance", desc: "Organise maintenance requests and follow-up workflows.", icon: Wrench },
                { title: "Documents", desc: "Keep important property and tenancy documents accessible.", icon: FileText },
                { title: "Reports", desc: "Give property teams better visibility into operational information.", icon: BarChart3 }
              ].map((mod, i) => {
                const Icon = mod.icon;
                return (
                  <div key={i} className="bg-white p-8 rounded-3xl border border-gray-200/80 shadow-sm hover:border-[#1f8898]/40 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-[#ebf3f5] text-[#1f8898] flex items-center justify-center mb-5">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h4 className="text-lg font-black text-gray-900 mb-2">{mod.title}</h4>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">{mod.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* --- CUSTOMER STORIES (CONDITIONALLY RENDERED ONLY IF VERIFIED) --- */}
          {verifiedStories.length > 0 && (
            <section className="max-w-6xl mx-auto px-6 mb-24">
              <div className="text-center mb-12 max-w-2xl mx-auto">
                <h2 className="text-xs font-black text-[#1f8898] uppercase tracking-[0.2em] mb-2">Verified Success</h2>
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">Stories from the people using MogiRent</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {verifiedStories.map(story => (
                  <div key={story.id} className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
                    <p className="text-gray-700 font-medium italic mb-6">"{story.quote}"</p>
                    <p className="font-black text-gray-900">{story.name}</p>
                    <p className="text-xs text-gray-500 font-medium">{story.role}, {story.company}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* --- TRUST & SECURITY PRINCIPLES --- */}
          <section className="max-w-6xl mx-auto px-6 mb-24">
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200/80 shadow-sm">
              <h2 className="text-xs font-black text-[#1f8898] uppercase tracking-[0.2em] mb-2">Platform Standards</h2>
              <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-6">Designed with operational trust in mind</h3>
              
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-black text-gray-900 text-base mb-1">Secure Authentication</h4>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">Protecting user accounts and platform access against unauthorized entry.</p>
                </div>
                <div>
                  <h4 className="font-black text-gray-900 text-base mb-1">Role-Based Access</h4>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">Control what staff, accountants, and caretakers can view across buildings.</p>
                </div>
                <div>
                  <h4 className="font-black text-gray-900 text-base mb-1">Controlled Information</h4>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">Ensure sensitive business and tenant records remain confidential.</p>
                </div>
                <div>
                  <h4 className="font-black text-gray-900 text-base mb-1">Structured Records</h4>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">Keep leases, payments, and property history organized and auditable.</p>
                </div>
                <div>
                  <h4 className="font-black text-gray-900 text-base mb-1">Reliable Infrastructure</h4>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">Hosted on stable cloud architecture designed for continuous uptime.</p>
                </div>
                <div>
                  <h4 className="font-black text-gray-900 text-base mb-1">Clear Workflows</h4>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">Standardise day-to-day property operations across your entire team.</p>
                </div>
              </div>
            </div>
          </section>

          {/* --- KENYA / LOCAL CONTEXT SECTION --- */}
          <section className="max-w-6xl mx-auto px-6 mb-24">
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#1f8898] mb-2 inline-block">Local Context</span>
                <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-3">Built with the realities of property management in mind</h3>
                <p className="text-gray-600 text-sm sm:text-base font-medium leading-relaxed">
                  MogiRent is designed around the practical workflows of property businesses operating in Kenya and across Africa. From rent collection tracking and tenant communication to multi-property management, our platform supports small and growing property teams with relevant, structured tools.
                </p>
              </div>
              <div className="shrink-0">
                <div className="w-16 h-16 bg-[#ebf3f5] rounded-2xl flex items-center justify-center text-[#1f8898] border border-[#1f8898]/20 shadow-sm">
                  <ShieldCheck className="w-8 h-8" />
                </div>
              </div>
            </div>
          </section>

          {/* --- FINAL CTA SECTION --- */}
          <section className="max-w-5xl mx-auto px-6">
            <div className="bg-[#0f4952] rounded-[2.5rem] p-8 sm:p-12 text-center text-white border border-gray-800 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#1f8898]/30 rounded-full blur-3xl pointer-events-none"></div>

              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-5 relative z-10 border border-white/10 backdrop-blur-sm">
                <MessageCircle className="w-7 h-7 text-teal-200" />
              </div>
              
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-3 relative z-10 leading-tight">Ready to manage your properties with less friction?</h2>
              
              <p className="text-sm sm:text-base text-teal-100/80 font-medium mb-8 max-w-xl mx-auto relative z-10 leading-relaxed">
                Bring your properties, tenants, rent, maintenance, and operations into one organised platform with MogiRent.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-3 relative z-10">
                <Link
                  href="/register"
                  className="inline-flex h-12 sm:h-14 items-center justify-center gap-2 rounded-xl bg-white px-8 text-sm sm:text-base font-bold text-[#0f4952] shadow-lg transition-all hover:bg-teal-50 active:scale-95"
                >
                  Get Started <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex h-12 sm:h-14 items-center justify-center gap-2 rounded-xl bg-white/10 border border-white/20 px-8 text-sm sm:text-base font-bold text-white transition-all hover:bg-white/20 active:scale-95"
                >
                  Talk to Us
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