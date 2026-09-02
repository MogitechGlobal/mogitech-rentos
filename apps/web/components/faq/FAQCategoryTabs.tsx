// apps/web/components/faq/FAQCategoryTabs.tsx
'use client';

import { useRouter, useSearchParams } from "next/navigation";
import { FAQCategory, faqCategories } from "@/data/faq/faqs";

export default function FAQCategoryTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";

  const handleSelectCategory = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId === "all") {
      params.delete("category");
    } else {
      params.set("category", categoryId);
    }
    router.push(`/faq?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none max-w-5xl mx-auto px-2">
      {faqCategories.map(cat => {
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => handleSelectCategory(cat.id)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 active:scale-95 ${
              isActive 
              ? 'bg-[#0f4952] text-white shadow-md shadow-[#0f4952]/20 border border-[#0f4952]' 
              : 'bg-white text-gray-600 border border-gray-200/80 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}