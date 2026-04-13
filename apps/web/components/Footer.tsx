import Link from "next/link";
import { Building2, Globe, Users } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-[#f8fafb] pt-24 pb-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-16 mb-20">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-8">
              <Building2 className="h-8 w-8 text-[#1f8898]" />
              <span className="text-3xl font-black text-gray-900 tracking-tight">Mogi<span className="text-[#1f8898]">RentOS</span></span>
            </div>
            <p className="text-base font-medium text-gray-500 leading-relaxed mb-8 max-w-sm">
              The high-performance operating system for forward-thinking property managers across the African continent.
            </p>
            <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#1f8898] transition-colors cursor-pointer shadow-sm"><Globe className="w-5 h-5"/></div>
                <Link href="/customers" className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#1f8898] transition-colors cursor-pointer shadow-sm"><Users className="w-5 h-5"/></Link>
            </div>
          </div>

          <div>
            <h4 className="font-black text-gray-900 mb-8 tracking-tight uppercase text-xs">Platform</h4>
            <ul className="space-y-4 text-sm font-bold text-gray-500">
              <li><Link href="/dashboard" className="hover:text-[#1f8898]">Executive Dashboard</Link></li>
              <li><Link href="/portal" className="hover:text-[#1f8898]">Tenant Portal (PWA)</Link></li>
              <li><Link href="/pricing" className="hover:text-[#1f8898]">Pricing Plans</Link></li>
              <li><Link href="#features" className="hover:text-[#1f8898]">Feature Tour</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-gray-900 mb-8 tracking-tight uppercase text-xs">Company</h4>
            <ul className="space-y-4 text-sm font-bold text-gray-500">
              <li><Link href="/about" className="hover:text-[#1f8898]">About Mogitech</Link></li>
              <li><Link href="/customers" className="hover:text-[#1f8898]">Our Customers</Link></li>
              <li><a href="https://mogitechglobal.com/careers.php" target="_blank" rel="noopener noreferrer" className="hover:text-[#1f8898]">Career Hub</a></li>
              <li><Link href="/contact" className="hover:text-[#1f8898]">Contact Sales</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-gray-900 mb-8 tracking-tight uppercase text-xs">Resources</h4>
            <ul className="space-y-4 text-sm font-bold text-gray-500">
              <li><Link href="/blog" className="hover:text-[#1f8898]">PropTech Blog</Link></li>
              <li><Link href="/faq" className="hover:text-[#1f8898]">Help & FAQ</Link></li>
              <li><a href="https://mogitechglobal.com/privacy-policy.php" target="_blank" rel="noopener noreferrer" className="hover:text-[#1f8898]">Privacy Policy</a></li>
              <li><a href="https://mogitechglobal.com/terms-of-service.php" target="_blank" rel="noopener noreferrer" className="hover:text-[#1f8898]">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm font-bold text-gray-400">
            &copy; {new Date().getFullYear()} Mogitech Global Ltd. Engineering Excellence.
          </p>
          <div className="flex items-center gap-3 text-xs font-black text-gray-500 bg-white px-5 py-2.5 rounded-full border border-gray-100 shadow-sm">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            All Systems Operational
          </div>
        </div>
      </div>
    </footer>
  );
}