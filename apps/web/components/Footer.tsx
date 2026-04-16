import Link from "next/link";
import { Building2, Globe, Twitter, Linkedin, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-[#f8fafb] pt-16 sm:pt-24 pb-8 sm:pb-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Adjusted the main layout to flex to allow precise control over the two halves */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 mb-12 sm:mb-20">
          
          {/* --- REFINED BRAND COLUMN --- */}
          <div className="lg:w-2/5">
            <div className="flex items-center gap-2.5 mb-5 sm:mb-6">
              <Building2 className="h-6 w-6 sm:h-7 sm:w-7 text-[#1f8898]" />
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
                <li><Link href="/dashboard" className="hover:text-[#1f8898] transition-colors block py-0.5">Executive Dashboard</Link></li>
                <li><Link href="/portal" className="hover:text-[#1f8898] transition-colors block py-0.5">Tenant Portal (PWA)</Link></li>
                <li><Link href="/pricing" className="hover:text-[#1f8898] transition-colors block py-0.5">Pricing Plans</Link></li>
                <li><Link href="#features" className="hover:text-[#1f8898] transition-colors block py-0.5">Feature Tour</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-black text-gray-900 mb-4 sm:mb-6 tracking-tight uppercase text-[10px] sm:text-[11px] opacity-60">Company</h4>
              <ul className="space-y-2.5 sm:space-y-3 text-[13px] sm:text-sm font-bold text-gray-600">
                <li><Link href="/about" className="hover:text-[#1f8898] transition-colors block py-0.5">About Mogitech</Link></li>
                <li><Link href="/customers" className="hover:text-[#1f8898] transition-colors block py-0.5">Our Customers</Link></li>
                <li><a href="https://mogitechglobal.com/careers.php" target="_blank" rel="noopener noreferrer" className="hover:text-[#1f8898] transition-colors block py-0.5">Career Hub</a></li>
                <li><Link href="/contact" className="hover:text-[#1f8898] transition-colors block py-0.5">Contact Sales</Link></li>
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <h4 className="font-black text-gray-900 mb-4 sm:mb-6 tracking-tight uppercase text-[10px] sm:text-[11px] opacity-60">Resources</h4>
              <ul className="space-y-2.5 sm:space-y-3 text-[13px] sm:text-sm font-bold text-gray-600">
                <li><Link href="/blog" className="hover:text-[#1f8898] transition-colors block py-0.5">PropTech Blog</Link></li>
                <li><Link href="/faq" className="hover:text-[#1f8898] transition-colors block py-0.5">Help & FAQ</Link></li>
                <li><a href="https://mogitechglobal.com/privacy-policy.php" target="_blank" rel="noopener noreferrer" className="hover:text-[#1f8898] transition-colors block py-0.5">Privacy Policy</a></li>
                <li><a href="https://mogitechglobal.com/terms-of-service.php" target="_blank" rel="noopener noreferrer" className="hover:text-[#1f8898] transition-colors block py-0.5">Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* --- BOTTOM BAR --- */}
        <div className="border-t border-gray-200 pt-6 sm:pt-8 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 text-center md:text-left">
          <p className="text-[11px] sm:text-xs font-bold text-gray-400">
            &copy; {new Date().getFullYear()} Mogitech Global Ltd. Engineering Excellence.
          </p>
          <div className="flex items-center gap-2 sm:gap-2.5 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-gray-500 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
            <span className="flex h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            All Systems Operational
          </div>
        </div>
      </div>
    </footer>
  );
}