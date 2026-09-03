// apps/web/components/home/PlatformModules.tsx
'use client';

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Zap, Smartphone, BarChart3, Wrench, FileSignature, ShieldCheck, CheckCircle2, X } from "lucide-react";

const features = [
  {
    title: "Zero-Touch M-Pesa Reconciliation",
    description: "Link your Paybill or Till. When a payment is made, the ledger updates instantly. Say goodbye to hunting for transaction codes.",
    longDescription: "Eliminate manual data entry completely. When a resident pays via an STK push or your dedicated Paybill, our engine instantly identifies the unit, clears the pending invoice, and issues a digital receipt.",
    benefits: ["1-Click Direct STK Push", "Zero-Touch Receipt Generation", "Automated Late Fee Application"],
    icon: Zap,
    colSpan: "md:col-span-2 lg:col-span-2",
  },
  {
    title: "Smart Tenant Dashboards",
    description: "Grant residents the power to log repair tickets, download receipts, and digitally sign leases.",
    longDescription: "Empower your residents. Tenants can log in from any smartphone to download their payment history, report maintenance issues with photo evidence, and stay informed.",
    benefits: ["Zero-Download PWA App", "Transparent Invoice History", "Instant Issue Reporting"],
    icon: Smartphone,
    colSpan: "md:col-span-1 lg:col-span-1",
  },
  {
    title: "Instant Financial Reporting",
    description: "Generate comprehensive rent rolls, defaulter lists, and expense sheets for stakeholders.",
    longDescription: "Transform raw property data into actionable intelligence. Our analytics engine categorizes income streams, flags chronic late-payers, and projects your monthly cash flow.",
    benefits: ["PDF & Excel Exports", "Live Arrears Tracking", "Predictive Occupancy"],
    icon: BarChart3,
    colSpan: "md:col-span-1 lg:col-span-1",
  },
  {
    title: "Automated Maintenance",
    description: "Streamlined routing for repair requests, vendor dispatching, and resolution tracking.",
    longDescription: "Protect your asset's value. Tenants submit tickets with photos, and MogiRentOS auto-routes them to your designated caretakers or vendors, tracking progress until resolved.",
    benefits: ["Photo Evidence Uploads", "Automated Work Orders", "Resolution Timestamps"],
    icon: Wrench,
    colSpan: "md:col-span-1 lg:col-span-1",
  },
  {
    title: "Digital Lease Agreements",
    description: "Draft custom clauses, execute agreements securely, and store condition reports digitally.",
    longDescription: "Never lose track of expiring leases. The system monitors the entire lease lifecycle, allows for digital counter-signatures, and securely stores copies in an encrypted vault.",
    benefits: ["Dynamic Templates", "Move-in Sign-offs", "Automated Expiration Alerts"],
    icon: FileSignature, 
    colSpan: "md:col-span-2 lg:col-span-1",
  },
  {
    title: "Bank-Grade Security",
    description: "End-to-end encryption and strict data residency ensuring your ledgers remain strictly confidential.",
    longDescription: "The integrity of your portfolio data is our highest priority. MogiRentOS utilizes AES-256 encryption at rest, ensuring your leases, personal details, and financials are impenetrable.",
    benefits: ["AES-256 Encryption", "Role-Based Access", "Automated Cloud Backups"],
    icon: ShieldCheck,
    colSpan: "md:col-span-2 lg:col-span-3",
  }
];

export default function PlatformModules() {
  const [selectedFeature, setSelectedFeature] = useState<any>(null);

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[minmax(280px,auto)]">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <div key={idx} onClick={() => setSelectedFeature(feature)} className={`cursor-pointer group rounded-[2rem] bg-white border border-gray-200/60 p-8 flex flex-col relative overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_rgba(31,136,152,0.08)] hover:border-[#1f8898]/40 hover:-translate-y-1.5 z-10 ${feature.colSpan}`}>
              <div className="absolute -top-4 -right-4 p-6 opacity-[0.015] group-hover:opacity-[0.04] transition-opacity transform group-hover:scale-110 group-hover:-rotate-6 duration-700 pointer-events-none">
                <Icon className="w-56 h-56 text-[#0e363c]" />
              </div>
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f4f7f9] border border-gray-100 text-[#1f8898] group-hover:bg-gradient-to-br group-hover:from-[#1f8898] group-hover:to-[#135a65] group-hover:text-white transition-all duration-500 relative z-10 shadow-sm">
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="font-black text-xl sm:text-2xl mb-3 text-gray-900 relative z-10 tracking-tight">{feature.title}</h2>
              <p className="text-sm font-medium text-gray-500 leading-relaxed flex-1 relative z-10 group-hover:text-gray-700">{feature.description}</p>
              <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-[#1f8898] transition-all duration-300 relative z-10 uppercase tracking-[0.15em] group-hover:text-[#0e363c]">
                Explore Feature <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </div>
          );
        })}
      </div>

      {selectedFeature && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-[#0e363c]/80 backdrop-blur-lg transition-opacity" onClick={() => setSelectedFeature(null)} />
          <div className="relative w-full max-w-2xl bg-[#ffffff] rounded-3xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 ring-1 ring-white/10">
            <div className="bg-[#f4f7f9] px-6 py-6 sm:px-8 border-b border-gray-200/60 flex items-center justify-between">
              <div className="flex items-center gap-4 pr-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm text-[#1f8898] border border-gray-100">
                  <selectedFeature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-tight">{selectedFeature.title}</h3>
              </div>
              <button onClick={() => setSelectedFeature(null)} className="p-2.5 text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 sm:p-8">
              <p className="text-sm sm:text-lg text-gray-600 font-medium leading-relaxed mb-8">{selectedFeature.longDescription}</p>
              <div className="bg-[#ebf3f5]/50 rounded-3xl p-6 sm:p-8 border border-[#1f8898]/10 mb-8 shadow-inner">
                <h4 className="text-[10px] font-black text-[#1f8898] uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                    <Zap className="w-4 h-4"/> Core Benefits
                </h4>
                <ul className="space-y-4">
                  {selectedFeature.benefits.map((benefit: string, i: number) => (
                    <li key={i} className="flex items-start gap-4">
                      <CheckCircle2 className="w-6 h-6 text-[#1f8898] shrink-0 mt-0.5" />
                      <span className="font-bold text-gray-800 text-sm sm:text-base leading-snug">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                <button onClick={() => setSelectedFeature(null)} className="w-full sm:w-auto px-8 py-4 rounded-xl font-black text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors uppercase tracking-widest text-[10px] sm:text-xs">Close</button>
                <Link href="/register" className="flex w-full sm:w-auto justify-center items-center gap-2 sm:gap-3 bg-gradient-to-br from-[#0e363c] to-[#1f8898] hover:opacity-90 text-white px-10 py-4 rounded-xl font-black transition-all shadow-xl shadow-[#1f8898]/20 uppercase tracking-widest text-[10px] sm:text-xs active:scale-95">
                  Start Demo <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}