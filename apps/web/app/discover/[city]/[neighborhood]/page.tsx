// apps/web/app/discover/[city]/[neighborhood]/page.tsx
import { Metadata } from 'next';
import SeoFaq from "@/components/SeoFaq";

// ⚡️ CRITICAL FOR CLOUDFLARE PAGES ⚡️
export const runtime = 'edge';

type Props = {
  params: { city: string; neighborhood: string }
};

// 1. Dynamic SEO Metadata Generation
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Capitalize first letters for clean formatting
  const city = params.city.charAt(0).toUpperCase() + params.city.slice(1);
  const neighborhood = params.neighborhood.charAt(0).toUpperCase() + params.neighborhood.slice(1);

  return {
    title: `Properties for Rent in ${neighborhood}, ${city} | MogiRentOS`,
    description: `Browse the best verified rental properties, market trends, and prices in ${neighborhood}, ${city}.`,
  };
}

// 2. The Default Page Component
export default function DiscoverNeighborhoodPage({ params }: Props) {
  const city = params.city.charAt(0).toUpperCase() + params.city.slice(1);
  const neighborhood = params.neighborhood.charAt(0).toUpperCase() + params.neighborhood.slice(1);

  return (
    <main className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-12">
      <h1 className="text-3xl sm:text-5xl font-black text-gray-900 mb-4 tracking-tight">
        The {neighborhood}, {city} Rental Market
      </h1>
      <p className="text-base sm:text-lg text-gray-600 mb-12 max-w-2xl font-medium">
        Explore verified listings, market insights, and real-time rental trends specific to {neighborhood}. All properties support zero-touch M-Pesa payments.
      </p>

      {/* --- Dynamic Listing Grid Would Go Here --- */}
      <div className="bg-gray-50 border border-dashed border-gray-200 rounded-3xl h-64 flex items-center justify-center mb-12">
        <p className="text-gray-400 font-bold">Property Listings Feed (Coming Soon)</p>
      </div>

      {/* --- Dynamic Location-Based SEO FAQ --- */}
      <div className="bg-white rounded-2xl md:rounded-[2rem] p-6 sm:p-10 border border-gray-100 shadow-sm max-w-4xl">
        <SeoFaq locationKey={params.neighborhood} />
      </div>
    </main>
  );
}