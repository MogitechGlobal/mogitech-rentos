// apps/web/app/hunter/favorites/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Loader2, MapPin, Building2 } from 'lucide-react';

export default function HunterFavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const savedIds = JSON.parse(localStorage.getItem('mogi_favorites') || '[]');
        if (savedIds.length === 0) return;

        // Fetch all listings and filter down to just the favorited ones
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/marketplace/listings`);
        if (res.ok) {
          const json = await res.json();
          const dataArray = json.data || [];
          const matchedFavorites = dataArray.filter((listing: any) => savedIds.includes(listing.id));
          setFavorites(matchedFavorites);
        }
      } catch (error) {
        console.error("Failed to load favorites");
      } finally {
        setIsLoading(false);
      }
    };
    loadFavorites();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[600px]">
        <Loader2 className="w-10 h-10 animate-spin text-[#1f8898] mb-4" />
      </div>
    );
  }

  return (
    <div className="pb-12 max-w-5xl mx-auto px-4 sm:px-6 pt-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Saved Favorites</h1>
        <p className="text-gray-500 font-medium text-sm">Properties you've bookmarked while browsing the marketplace.</p>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-10 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-rose-400" />
          </div>
          <h3 className="text-lg font-black text-gray-900 mb-1">No favorites saved</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">Click the heart icon on any property in the marketplace to save it here for quick access later.</p>
          <Link href="/marketplace" className="bg-[#1f8898] text-white px-6 py-3 rounded-xl font-bold shadow-md">
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((listing) => (
            <Link href={`/marketplace?id=${listing.id}`} key={listing.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all hover:-translate-y-1 block">
              <div className="h-48 bg-gray-100 relative">
                {listing.images && listing.images.length > 0 ? (
                  <img src={listing.images[0].url} alt="Property" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1f8898]/10 to-gray-200">
                    <Building2 className="w-8 h-8 text-[#1f8898]/30" />
                  </div>
                )}
                <div className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-md rounded-full shadow-sm">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-black text-gray-900 mb-1 truncate group-hover:text-[#1f8898] transition-colors">Unit {listing.unit_number}</h3>
                <p className="text-xs font-bold text-gray-500 flex items-center gap-1 mb-4 truncate"><MapPin className="w-3 h-3 text-[#1f8898]" /> {listing.property?.address} Area</p>
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xl font-black text-[#1f8898]">KSh {listing.rent_amount.toLocaleString()}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}