// components/SeoFaq.tsx
import Script from 'next/script';

interface FaqItem {
  question: string;
  answer: string;
}

export default function SeoFaq({ faqs }: { faqs: FaqItem[] }) {
  // Construct the JSON-LD Schema
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
      {/* 1. The Invisible AI Search Data */}
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 2. The Visible Human Content */}
      <h2 className="text-2xl font-black mb-6">Frequently Asked Questions</h2>
      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <div key={index} className="border-b border-gray-200 pb-4">
            {/* Atomic Heading */}
            <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.question}</h3>
            {/* Direct, succinct answer */}
            <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}