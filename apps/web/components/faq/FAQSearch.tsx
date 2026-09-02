// apps/web/components/faq/FAQSearch.tsx
'use client';

import { Search, X } from "lucide-react";

interface FAQSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  totalResults: number;
}

export default function FAQSearch({ searchQuery, setSearchQuery, totalResults }: FAQSearchProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <label htmlFor="faq-search" className="sr-only">
        Search frequently asked questions
      </label>
      <div className="relative bg-white border border-gray-200/80 shadow-xl shadow-black/5 rounded-2xl flex items-center overflow-hidden transition-all focus-within:border-[#1f8898] focus-within:ring-4 focus-within:ring-[#1f8898]/10">
        <Search className="absolute left-5 h-5 w-5 text-gray-400" />
        <input 
          id="faq-search"
          type="text" 
          placeholder="Search questions, features, M-Pesa, tenants..."
          className="w-full bg-transparent text-gray-900 text-base sm:text-lg font-bold pl-14 pr-12 py-4 outline-none placeholder:text-gray-400 placeholder:font-medium"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery("")}
            className="absolute right-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {searchQuery && (
        <p className="text-xs font-bold text-gray-500 mt-3 text-center">
          {totalResults} {totalResults === 1 ? 'answer found' : 'answers found'} for "{searchQuery}"
        </p>
      )}
    </div>
  );
}