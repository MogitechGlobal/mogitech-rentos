// apps/web/components/home/FavoriteButton.tsx
'use client';

import { Heart } from "lucide-react";

export default function FavoriteButton() {
  return (
    <button 
      type="button"
      aria-label="Save to favorites"
      className="absolute top-4 right-4 z-30 p-2.5 bg-white/90 backdrop-blur-md hover:bg-white rounded-full shadow-md transition-transform active:scale-90 border border-white"
      onClick={(e) => {
        e.preventDefault(); // Prevents the parent <Link> from triggering navigation
        // Future logic for saving favorites can go here
      }}
    >
      <Heart className="w-4 h-4 text-gray-400 hover:text-rose-500 hover:fill-rose-500 transition-colors" />
    </button>
  );
}