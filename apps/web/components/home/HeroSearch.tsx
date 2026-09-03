// apps/web/components/home/HeroSearch.tsx
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Building2, Wallet } from "lucide-react";

export default function HeroSearch() {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');
  const [budget, setBudget] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.append('location', location);
    if (type) params.append('type', type);
    if (budget) params.append('maxPrice', budget);
    router.push(`/marketplace?${params.toString()}`);
  };

  return (
    <form 
      onSubmit={handleSearch} 
      className="w-full max-w-4xl mx-auto bg-white p-2 sm:p-2.5 rounded-2xl shadow-xl border border-gray-200 flex flex-col sm:flex-row items-center gap-2"
    >
      <div className="flex-1 flex items-center gap-3 bg-gray-50/80 hover:bg-gray-50 rounded-xl px-4 py-3.5 w-full border border-gray-100 focus-within:border-[#1f8898] focus-within:bg-white transition-colors">
        <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
        <input 
          type="text" 
          placeholder="City or Neighborhood..." 
          className="w-full bg-transparent outline-none text-sm font-bold text-gray-900" 
          value={location} 
          onChange={(e) => setLocation(e.target.value)} 
        />
      </div>
      
      <div className="hidden sm:block w-px h-10 bg-gray-200 shrink-0"></div>
      
      <div className="flex-1 flex items-center gap-3 bg-gray-50/80 hover:bg-gray-50 rounded-xl px-4 py-3.5 w-full border border-gray-100 focus-within:border-[#1f8898] focus-within:bg-white transition-colors">
        <Building2 className="w-5 h-5 text-gray-400 shrink-0" />
        <select 
          className="w-full bg-transparent outline-none text-sm font-bold text-gray-900 appearance-none cursor-pointer" 
          value={type} 
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">Any Type</option>
          <option value="APARTMENT">Apartment</option>
          <option value="HOUSE_OWN_COMPOUND">House</option>
          <option value="TOWNHOUSE">Townhouse</option>
          <option value="BEDSITTER">Bedsitter</option>
          <option value="COMMERCIAL">Commercial</option>
        </select>
      </div>

      <div className="hidden sm:block w-px h-10 bg-gray-200 shrink-0"></div>
      
      <div className="flex-1 flex items-center gap-3 bg-gray-50/80 hover:bg-gray-50 rounded-xl px-4 py-3.5 w-full border border-gray-100 focus-within:border-[#1f8898] focus-within:bg-white transition-colors">
        <Wallet className="w-5 h-5 text-gray-400 shrink-0" />
        <select 
          className="w-full bg-transparent outline-none text-sm font-bold text-gray-900 appearance-none cursor-pointer" 
          value={budget} 
          onChange={(e) => setBudget(e.target.value)}
        >
          <option value="">Max Budget</option>
          <option value="20000">Under KSh 20,000</option>
          <option value="50000">Under KSh 50,000</option>
          <option value="100000">Under KSh 100,000</option>
          <option value="150000">Under KSh 150,000</option>
        </select>
      </div>

      <button 
        type="submit" 
        className="w-full sm:w-auto bg-[#0f4952] hover:bg-[#1f8898] text-white px-8 py-4 rounded-xl font-black text-sm transition-all shadow-md shrink-0 flex items-center justify-center gap-2"
      >
        <Search className="w-4 h-4" /> Search
      </button>
    </form>
  );
}