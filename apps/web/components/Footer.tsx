import Link from "next/link";
import { Building2, Globe, Twitter, Linkedin, Mail, ArrowRight, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-[#f8fafb] pt-16 sm:pt-24 pb-8 sm:pb-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Adjusted the main layout to flex to allow precise control over the two halves */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 mb-12 sm:mb-20">
          
          {/* --- REFINED BRAND COLUMN --- */}
          <div className="lg:w-2/5">
            <div className="flex items-center gap-2.5 mb-5 sm:mb-6 group w-fit">
              <Building2 className="h-6 w-6 sm:h-7 sm:w-7 text-[#1f8898] group-hover:scale-105 transition-transform duration-300" />
              <span className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Mogi<span className="text-[#1f8898]">RentOS</span></span>
            </div>
            <p className="text-[13px] sm:text-sm font-medium text-gray-500 leading-relaxed mb-6 sm:mb-8 max-w-sm pr-4">
              The high-performance operating system for forward-thinking property managers across the African continent.
            </p>
            
            {/* Slightly scaled down icons for mobile */}
            <div className="flex gap-2.5 sm:gap-3">
                <a href="https://mogitechglobal.com" target="_blank" rel="noopener noreferrer" aria-label="Mogitech Website" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-[#1f8898] hover:text-white hover:border-[#1f8898] transition-all shadow-sm group">
                  <Globe className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-[#1DA1F2] hover:text-white hover:border-[#1DA1F2] transition-all shadow-sm group">
                  <Twitter className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] transition-all shadow-sm group">
                  <Linkedin className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </a>
                <Link href="/contact" aria-label="Contact Sales" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-800 hover:text-white hover:border-gray-800 transition-all shadow-sm group">
                  <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </Link>
            </div>
          </div>

          {/* --- LINKS COLUMNS (2-column grid on mobile, 3 on desktop) --- */}
          <div className="lg:w-3/5 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-10 sm:gap-8">
            <div>
              <h4 className="font-black text-gray-900 mb-4 sm:mb-6 tracking-tight uppercase text-[10px] sm:text-[11px] opacity-60">Platform</h4>
              <ul className="space-y-2.5 sm:space-y-3 text-[13px] sm:text-sm font-bold text-gray-600">
                <li className="group flex items-center overflow-hidden">
                  <ArrowRight className="w-3.5 h-3.5 text-[#1f8898] opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 mr-2 transition-all duration-300" />
                  <Link href="/dashboard" className="group-hover:text-[#1f8898] group-hover:translate-x-1 transition-transform duration-300 block py-0.5">Executive Dashboard</Link>
                </li>
                <li className="group flex items-center overflow-hidden">
                  <ArrowRight className="w-3.5 h-3.5 text-[#1f8898] opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 mr-2 transition-all duration-300" />
                  <Link href="/portal" className="group-hover:text-[#1f8898] group-hover:translate-x-1 transition-transform duration-300 block py-0.5">Tenant Portal (PWA)</Link>
                </li>
                <li className="group flex items-center overflow-hidden">
                  <ArrowRight className="w-3.5 h-3.5 text-[#1f8898] opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 mr-2 transition-all duration-300" />
                  <Link href="/pricing" className="group-hover:text-[#1f8898] group-hover:translate-x-1 transition-transform duration-300 block py-0.5">Pricing Plans</Link>
                </li>
                <li className="group flex items-center overflow-hidden">
                  <ArrowRight className="w-3.5 h-3.5 text-[#1f8898] opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 mr-2 transition-all duration-300" />
                  <Link href="/#features" className="group-hover:text-[#1f8898] group-hover:translate-x-1 transition-transform duration-300 block py-0.5">Feature Tour</Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-black text-gray-900 mb-4 sm:mb-6 tracking-tight uppercase text-[10px] sm:text-[11px] opacity-60">Company</h4>
              <ul className="space-y-2.5 sm:space-y-3 text-[13px] sm:text-sm font-bold text-gray-600">
                <li className="group flex items-center overflow-hidden">
                  <ArrowRight className="w-3.5 h-3.5 text-[#1f8898] opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 mr-2 transition-all duration-300" />
                  <Link href="/about" className="group-hover:text-[#1f8898] group-hover:translate-x-1 transition-transform duration-300 block py-0.5">About Mogitech</Link>
                </li>
                <li className="group flex items-center overflow-hidden">
                  <ArrowRight className="w-3.5 h-3.5 text-[#1f8898] opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 mr-2 transition-all duration-300" />
                  <Link href="/customers" className="group-hover:text-[#1f8898] group-hover:translate-x-1 transition-transform duration-300 block py-0.5">Our Customers</Link>
                </li>
                <li className="group flex items-center overflow-hidden">
                  <ArrowRight className="w-3.5 h-3.5 text-[#1f8898] opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 mr-2 transition-all duration-300" />
                  <a href="https://mogitechglobal.com/careers.php" target="_blank" rel="noopener noreferrer" className="group-hover:text-[#1f8898] group-hover:translate-x-1 transition-transform duration-300 block py-0.5">Career Hub</a>
                </li>
                <li className="group flex items-center overflow-hidden">
                  <ArrowRight className="w-3.5 h-3.5 text-[#1f8898] opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 mr-2 transition-all duration-300" />
                  <Link href="/contact" className="group-hover:text-[#1f8898] group-hover:translate-x-1 transition-transform duration-300 block py-0.5">Contact Sales</Link>
                </li>
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <h4 className="font-black text-gray-900 mb-4 sm:mb-6 tracking-tight uppercase text-[10px] sm:text-[11px] opacity-60">Resources</h4>
              <ul className="space-y-2.5 sm:space-y-3 text-[13px] sm:text-sm font-bold text-gray-600">
                <li className="group flex items-center overflow-hidden">
                  <ArrowRight className="w-3.5 h-3.5 text-[#1f8898] opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 mr-2 transition-all duration-300" />
                  <Link href="/blog" className="group-hover:text-[#1f8898] group-hover:translate-x-1 transition-transform duration-300 block py-0.5">PropTech Blog</Link>
                </li>
                <li className="group flex items-center overflow-hidden">
                  <ArrowRight className="w-3.5 h-3.5 text-[#1f8898] opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 mr-2 transition-all duration-300" />
                  <Link href="/faq" className="group-hover:text-[#1f8898] group-hover:translate-x-1 transition-transform duration-300 block py-0.5">Help & FAQ</Link>
                </li>
                <li className="group flex items-center overflow-hidden">
                  <ArrowRight className="w-3.5 h-3.5 text-[#1f8898] opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 mr-2 transition-all duration-300" />
                  <Link href="/privacy" className="group-hover:text-[#1f8898] group-hover:translate-x-1 transition-transform duration-300 block py-0.5">Privacy Policy</Link>
                </li>
                <li className="group flex items-center overflow-hidden">
                  <ArrowRight className="w-3.5 h-3.5 text-[#1f8898] opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 mr-2 transition-all duration-300" />
                  <Link href="/terms" className="group-hover:text-[#1f8898] group-hover:translate-x-1 transition-transform duration-300 block py-0.5">Terms of Service</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* --- BOTTOM BAR --- */}
        <div className="border-t border-gray-200 pt-6 sm:pt-8 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 text-center md:text-left">
          
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6">
            <p className="text-[11px] sm:text-xs font-bold text-gray-400">
              &copy; {new Date().getFullYear()} Mogitech Global Ltd. Engineering Excellence.
            </p>
            <div className="hidden md:block w-1 h-1 rounded-full bg-gray-300"></div>
            <p className="text-[11px] sm:text-xs font-bold text-gray-400 flex items-center gap-1.5 justify-center">
              <ShieldCheck className="w-3.5 h-3.5" /> Secure M-Pesa & Bank API Integrations
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-gray-500 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors">
            <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-emerald-500"></span>
            </span>
            All Systems Operational
          </div>
        </div>
      </div>
    </footer>
  );
}