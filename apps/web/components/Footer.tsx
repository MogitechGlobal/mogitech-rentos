// apps/web/components/Footer.tsx
import Link from "next/link";
import { Building2, Globe, Twitter, Linkedin, Mail, ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#f6f8f9] border-t border-gray-200">
      
      {/* --- PRE-FOOTER CTA BANNER --- */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12 sm:py-16 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Looking for a home?</h3>
            <p className="text-gray-600 font-medium">Explore available properties on MogiRent.</p>
          </div>
          <Link href="/marketplace" className="inline-flex items-center justify-center gap-2 bg-[#1f8898] hover:bg-[#0f4952] text-white px-8 py-4 rounded-xl font-black text-sm transition-all shadow-md shrink-0 active:scale-95">
            Find a Home <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-16 pb-8">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 mb-16">
          
          {/* --- BRAND COLUMN --- */}
          <div className="lg:w-2/6">
            <div className="flex items-center gap-2.5 mb-6 group w-fit">
              <Building2 className="h-7 w-7 text-[#1f8898]" />
              <span className="text-2xl font-black text-gray-900 tracking-tight">Mogi<span className="text-[#1f8898]">Rent</span></span>
            </div>
            
            <p className="text-lg font-black text-gray-900 mb-2">Find your next home.<br/>Manage your properties.</p>
            <p className="text-sm font-medium text-gray-500 leading-relaxed mb-8 max-w-sm">
              MogiRent connects people looking for homes with the tools landlords and property managers need to run rental operations.
            </p>
            
            <div className="flex gap-3">
                <a href="https://mogitechglobal.com" target="_blank" rel="noopener noreferrer" aria-label="Mogitech Website" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-[#1f8898] hover:text-white hover:border-[#1f8898] transition-all shadow-sm">
                  <Globe className="w-4 h-4" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-[#1DA1F2] hover:text-white hover:border-[#1DA1F2] transition-all shadow-sm">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] transition-all shadow-sm">
                  <Linkedin className="w-4 h-4" />
                </a>
                <Link href="/contact" aria-label="Contact Sales" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-800 hover:text-white hover:border-gray-800 transition-all shadow-sm">
                  <Mail className="w-4 h-4" />
                </Link>
            </div>
          </div>

          {/* --- LINKS NAVIGATION --- */}
          <div className="lg:w-4/6 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-12">
            
            {/* HOUSE HUNTING */}
            <div>
              <h4 className="font-black text-gray-900 mb-5 tracking-widest uppercase text-[11px] opacity-50">House Hunting</h4>
              <ul className="space-y-3.5 text-sm font-bold text-gray-600">
                <li><Link href="/marketplace" className="hover:text-[#1f8898] transition-colors">Find a Home</Link></li>
                <li><Link href="/marketplace" className="hover:text-[#1f8898] transition-colors">Browse Properties</Link></li>
                <li><Link href="/#how-it-works" className="hover:text-[#1f8898] transition-colors">How It Works</Link></li>
                <li><Link href="/marketplace?type=APARTMENT" className="hover:text-[#1f8898] transition-colors">Property Types</Link></li>
              </ul>
            </div>

            {/* PROPERTY MANAGEMENT */}
            <div>
              <h4 className="font-black text-gray-900 mb-5 tracking-widest uppercase text-[11px] opacity-50">Property Management</h4>
              <ul className="space-y-3.5 text-sm font-bold text-gray-600">
                <li><Link href="/#showcase" className="hover:text-[#1f8898] transition-colors">Platform</Link></li>
                <li><Link href="/#features" className="hover:text-[#1f8898] transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-[#1f8898] transition-colors">Pricing</Link></li>
                <li><Link href="/login" className="hover:text-[#1f8898] transition-colors">Dashboard</Link></li>
              </ul>
            </div>

            {/* COMPANY */}
            <div>
              <h4 className="font-black text-gray-900 mb-5 tracking-widest uppercase text-[11px] opacity-50">Company</h4>
              <ul className="space-y-3.5 text-sm font-bold text-gray-600">
                <li><Link href="/about" className="hover:text-[#1f8898] transition-colors">About Mogitech</Link></li>
                <li><Link href="/customers" className="hover:text-[#1f8898] transition-colors">Our Customers</Link></li>
                <li><Link href="/blog" className="hover:text-[#1f8898] transition-colors">PropTech Blog</Link></li>
                <li><Link href="/contact" className="hover:text-[#1f8898] transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* HELP & LEGAL */}
            <div>
              <h4 className="font-black text-gray-900 mb-5 tracking-widest uppercase text-[11px] opacity-50">Help & Legal</h4>
              <ul className="space-y-3.5 text-sm font-bold text-gray-600">
                <li><Link href="/faq" className="hover:text-[#1f8898] transition-colors">FAQ</Link></li>
                <li><Link href="/privacy" className="hover:text-[#1f8898] transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-[#1f8898] transition-colors">Terms of Service</Link></li>
              </ul>
            </div>

          </div>
        </div>

        {/* --- COPYRIGHT --- */}
        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-xs font-bold text-gray-400">
            &copy; {new Date().getFullYear()} Mogitech Global Ltd. All rights reserved.
          </p>
          <p className="text-xs font-bold text-gray-400">
            MogiRent is a product of <a href="https://mogitechglobal.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#1f8898] transition-colors">Mogitech Global Ltd</a>.
          </p>
        </div>
      </div>
    </footer>
  );
}