// apps/web/app/blog/[id]/not-found.tsx
import Link from "next/link";
import { ArrowLeft, BookOpen, Home } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function BlogNotFound() {
  return (
    <div className="min-h-screen bg-[#f8fafb] flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
        <h1 className="text-7xl font-black text-[#1f8898]/20 mb-4">404</h1>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2 tracking-tight">Article not found</h2>
        <p className="text-gray-500 font-medium mb-8 text-sm sm:text-base leading-relaxed">
          This article may have moved or the link may be incorrect. Explore our other property insights or browse available homes.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link href="/blog" className="flex-1 bg-[#1f8898] hover:bg-[#1a7684] text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2">
            <BookOpen className="w-4 h-4" /> Browse Insights
          </Link>
          <Link href="/marketplace" className="flex-1 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 px-6 py-3.5 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2">
            <Home className="w-4 h-4 text-[#1f8898]" /> Find a Home
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}