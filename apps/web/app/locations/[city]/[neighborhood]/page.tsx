// apps/web/app/locations/[city]/[neighborhood]/page.tsx
import { Metadata } from 'next';

type Props = { params: { city: string; neighborhood: string } };

// Dynamically generate SEO tags for this specific neighborhood
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const city = params.city.charAt(0).toUpperCase() + params.city.slice(1);
  const neighborhood = params.neighborhood.charAt(0).toUpperCase() + params.neighborhood.slice(1);

  return {
    title: `Apartments for Rent in ${neighborhood}, ${city} | MogiRentOS`,
    description: `Browse the best verified rental properties and market trends in ${neighborhood}, ${city}.`,
    alternates: {
      canonical: `https://rentos.mogitechglobal.com/locations/${params.city}/${params.neighborhood}`,
    }
  };
}

export default function NeighborhoodPage({ params }: Props) {
  return (
    <article>
      <h1>Living in {params.neighborhood}, {params.city}</h1>
      {/* Fetch and map properties specific to this neighborhood here */}
    </article>
  );
}