// apps/web/components/SeoFaq.tsx
import Script from 'next/script';

interface FaqItem {
  question: string;
  answer: string;
}

// 🇰🇪 SCALED HIGH-INTENT KNOWLEDGE MATRIX FOR TOP CITIES & TOWNS IN KENYA
const KENYA_LOCATION_MATRIX: Record<string, FaqItem[]> = {
  nairobi: [
    {
      question: "What are the average rental prices in Nairobi?",
      answer: "As of 2026, 1-bedroom apartments for rent in Nairobi neighborhoods like Kilimani and Westlands average between KSh 45,000 and KSh 65,000 per month. Budget-friendly options in Roysambu or Embakasi range from KSh 15,000 to KSh 25,000."
    },
    {
      question: "Which neighborhoods in Nairobi have properties accepting direct M-Pesa tracking?",
      answer: "Premium residential listings across Kilimani, Lavington, Westlands, and along the Thika Superhighway corridors utilize MogiRentOS for integrated Safaricom Paybill settlements and zero-touch tenant billing reconciliation."
    }
  ],
  mombasa: [
    {
      question: "What is the average cost of apartments to rent in Mombasa?",
      answer: "Beachfront apartments and luxury townhouses for rent in Nyali and Shanzu range between KSh 60,000 and KSh 120,000 monthly. Standard rental flats closer to Mombasa Island or Bamburi average KSh 20,000 to KSh 35,000."
    },
    {
      question: "Are serviced apartments with scenic ocean views available in Nyali?",
      answer: "Yes, our marketplace features fully managed beachfront villas and serviced flats in Nyali that include external amenities like swimming pools, backup generators, and 24/7 CCTV surveillance."
    }
  ],
  kisumu: [
    {
      question: "What are the rental trends for houses in Kisumu?",
      answer: "Standalone multi-bedroom houses and secure townhouses for rent in Milimani and Riat Hills range from KSh 50,000 to KSh 90,000 per month. Modern flats to rent near lakeview zones average KSh 25,000 to KSh 40,000."
    }
  ],
  nakuru: [
    {
      question: "How much does it cost to rent flats or bedsitters in Nakuru City?",
      answer: "Flats and modern apartments for rent in Milimani and Section 55 average KSh 22,000 to KSh 35,000 per month. Affordable bedsitters and studios near the city center or Naka range from KSh 7,000 to KSh 12,000."
    }
  ],
  eldoret: [
    {
      question: "What is the rental market status in Eldoret?",
      answer: "Residential properties and apartments to rent near Elgon View average KSh 30,000 to KSh 50,000 monthly, while student accommodations and bedsitters near Moi University zones go for KSh 6,000 to KSh 11,000."
    }
  ],
  ruiru: [
    {
      question: "What are the average rental prices in Ruiru?",
      answer: "As of 2026, a standard 1-bedroom apartment in Ruiru ranges from KSh 15,000 to KSh 22,000, while typical 2-bedroom apartments average between KSh 25,000 and KSh 35,000 per month depending on proximity to the Thika Superhighway."
    },
    {
      question: "Which areas in Ruiru have the best rental properties and commercial godowns?",
      answer: "Popular residential and commercial zones within Ruiru include Kimbo, Toll, and corporate hubs like Tatu City and the Eastern Bypass, known for massive warehouses with three-phase industrial power and borehole water systems."
    }
  ],
  thika: [
    {
      question: "What are the typical price ranges for properties to rent in Thika?",
      answer: "Modern townhouses and apartments for rent in Section 9 and tight gated estates average KSh 30,000 to KSh 45,000. Rental units near the town center or primary access paths range from KSh 14,000 to KSh 22,000."
    }
  ]
};

interface SeoFaqProps {
  locationKey?: string;
  fallbackItems?: FaqItem[];
}

export default function SeoFaq({ locationKey = "kenya", fallbackItems = [] }: SeoFaqProps) {
  const normalizedKey = locationKey.toLowerCase().trim();
  
  // Find localized keyword match in the engine, or fall back to general definitions
  const faqs = KENYA_LOCATION_MATRIX[normalizedKey] || fallbackItems || [
    {
      question: "How do properties listed on MogiRentOS handle monthly rent billing?",
      answer: "All houses, flats, and commercial properties on our portal integrate native automated payment pipelines. Tenants receive digital invoices via SMS and settle directly to landlord accounts with zero manual work."
    }
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <section className="my-12">
      <Script
        id={`faq-schema-${normalizedKey}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h2 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">
        Market Insights & Frequently Asked Questions
      </h2>
      <div className="space-y-6 max-w-4xl">
        {faqs.map((faq, index) => (
          <div key={index} className="border-b border-gray-100 pb-5 last:border-0">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 flex items-start gap-2.5 leading-snug">
              <span className="text-[#1f8898] font-black">Q:</span> {faq.question}
            </h3>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed pl-6">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}