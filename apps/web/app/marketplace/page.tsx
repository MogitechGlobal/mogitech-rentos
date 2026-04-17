// apps/web/app/marketplace/page.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  Search, MapPin, Building2, Phone, Home, Loader2, X, Send,
  ArrowLeft, Camera, MessageCircle, SlidersHorizontal,
  ChevronDown, ChevronRight, CheckCircle2, RotateCcw, Filter,
  ChevronLeft, ZoomIn, ZoomOut, Share2, Heart, Sparkles, History,
  Video, Mail
} from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/Footer';

// --- AMENITIES CATEGORY DATA ---
const AMENITIES_CATEGORIES = {
  nearby: [
    "Public Transit", "Golf Course", "Hospital / Clinic", 
    "Scenic Views", "Schools", "Waterfront View"
  ],
  internal: [
    "Air Conditioning", "Security Alarm", "Backup Generator", 
    "En-Suite Rooms", "Fibre Internet", "Furnished", 
    "Serviced Unit", "Service Charge Inclusive", "Walk-in Closets"
  ],
  external: [
    "Balcony / Patio", "BBQ Area", "Borehole Water", 
    "CCTV Surveillance", "Electric Fence", "Private Garden", 
    "Fitness Gym", "Elevator / Lift", "Designated Parking", 
    "Staff Quarters / DSQ", "Swimming Pool", "Wheelchair Accessible", 
    "Gated Community", "Kids Play Area", "Pet Friendly"
  ]
};

export default function PublicMarketplace() {
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- FEATURE TABS & LOCAL STORAGE STATES ---
  const [activeTab, setActiveTab] = useState<'all' | 'featured' | 'recent' | 'favorites'>('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);

  // --- ADVANCED FILTER & SORT STATES ---
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [unitType, setUnitType] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [hasVirtualTour, setHasVirtualTour] = useState(false);
  const [sortBy, setSortBy] = useState('newest'); 
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // --- IMAGE GALLERY MODAL STATE ---
  const [galleryData, setGalleryData] = useState<{ images: any[], currentIndex: number, listingInfo: any } | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  // --- ADVANCED LEAD CAPTURE MODAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [formData, setFormData] = useState({
    prospect_name: '',
    prospect_email: '',
    prospect_phone: '',
    message: '',
    agreeTerms: false,
    emailSimilar: false,
    allowAgents: false
  });

  // Load properties and local storage on mount
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/marketplace/listings`);
        if (!res.ok) throw new Error('Failed to fetch listings');
        const data = await res.json();
        setListings(data);
      } catch (error) {
        console.error("Error loading marketplace:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchListings();

    // Load Local Storage Data for Guests
    setFavorites(JSON.parse(localStorage.getItem('mogi_favorites') || '[]'));
    setRecentlyViewed(JSON.parse(localStorage.getItem('mogi_recent_views') || '[]'));
  }, []);

  const uniqueLocations = Array.from(new Set(listings.map(l => l.property?.address))).filter(Boolean);

  // --- LOGIC: FAVORITES & RECENT VIEWS ---
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavs = favorites.includes(id) ? favorites.filter(f => f !== id) : [...favorites, id];
    setFavorites(newFavs);
    localStorage.setItem('mogi_favorites', JSON.stringify(newFavs));
  };

  const markAsViewed = (id: string) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(v => v !== id);
      const newViews = [id, ...filtered].slice(0, 10); 
      localStorage.setItem('mogi_recent_views', JSON.stringify(newViews));
      return newViews;
    });
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  // --- LOGIC: ADVANCED FILTERING ---
  const sortedAndFilteredListings = listings
    .filter((listing) => {
      if (activeTab === 'favorites' && !favorites.includes(listing.id)) return false;
      if (activeTab === 'recent' && !recentlyViewed.includes(listing.id)) return false;
      
      const searchString = `${listing.property?.name} ${listing.property?.address} ${listing.public_description}`.toLowerCase();
      const matchesSearch = searchString.includes(searchTerm.toLowerCase());
      const rent = Number(listing.rent_amount);
      const matchesMinPrice = minPrice === '' || rent >= Number(minPrice);
      const matchesMaxPrice = maxPrice === '' || rent <= Number(maxPrice);
      const matchesLocation = locationFilter === '' || listing.property?.address === locationFilter;
      
      const matchesUnitType = unitType === '' || listing.unit_type === unitType;
      const matchesBedrooms = bedrooms === '' || listing.bedrooms === Number(bedrooms);
      const matchesBathrooms = bathrooms === '' || listing.bathrooms === Number(bathrooms);
      const matchesVirtualTour = !hasVirtualTour || !!listing.virtual_tour_url;

      const matchesAmenities = selectedAmenities.length === 0 || selectedAmenities.every(selected => 
        listing.amenities?.some((unitAmenity: string) => unitAmenity.toLowerCase().includes(selected.toLowerCase()))
      );

      return matchesSearch && matchesMinPrice && matchesMaxPrice && matchesLocation && 
             matchesUnitType && matchesBedrooms && matchesBathrooms && matchesVirtualTour && matchesAmenities;
    })
    .sort((a, b) => {
      if (activeTab === 'featured') return Number(b.rent_amount) - Number(a.rent_amount);
      if (sortBy === 'price_asc') return Number(a.rent_amount) - Number(b.rent_amount);
      if (sortBy === 'price_desc') return Number(b.rent_amount) - Number(a.rent_amount);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const displayListings = activeTab === 'featured' ? sortedAndFilteredListings.slice(0, 3) : sortedAndFilteredListings;

  const similarProperties = selectedListing 
    ? listings.filter(l => l.property?.address === selectedListing.property?.address && l.id !== selectedListing.id).slice(0, 2) 
    : [];

  const clearFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setMinPrice('');
    setMaxPrice('');
    setUnitType('');
    setBedrooms('');
    setBathrooms('');
    setSelectedAmenities([]);
    setHasVirtualTour(false);
    setSortBy('newest');
    setActiveTab('all');
  };

  const openContactModal = (listing: any) => {
    markAsViewed(listing.id);
    setSelectedListing(listing);
    setSubmitStatus(null);
    setFormData({
      prospect_name: '',
      prospect_email: '',
      prospect_phone: '',
      // RESTORED: Dynamic pre-filled message
      message: `Hi, I am interested in Unit ${listing.unit_number} at ${listing.property?.name}. Please contact me with more details or to schedule a viewing.`,
      agreeTerms: false,
      emailSimilar: true,
      allowAgents: true
    });
    setIsModalOpen(true);
  };

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreeTerms) return;

    setIsSubmitting(true);
    setSubmitStatus(null);

    let finalPhone = formData.prospect_phone.replace(/\D/g, '');
    if (finalPhone.startsWith('0')) finalPhone = '254' + finalPhone.substring(1);
    else if (!finalPhone.startsWith('254')) finalPhone = '254' + finalPhone;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/marketplace/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unit_id: selectedListing.id,
          landlord_id: selectedListing.property.landlord.id,
          prospect_name: formData.prospect_name,
          prospect_email: formData.prospect_email,
          prospect_phone: finalPhone,
          message: formData.message,
          opt_in_similar: formData.emailSimilar,
          opt_in_agents: formData.allowAgents
        }),
      });

      if (!response.ok) throw new Error('Failed to submit inquiry.');
      setSubmitStatus({ type: 'success', text: 'Message sent successfully! The landlord will contact you soon.' });
      setTimeout(() => { setIsModalOpen(false); setSubmitStatus(null); }, 3000);
    } catch (error: any) {
      setSubmitStatus({ type: 'error', text: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWhatsAppLink = (phone: string, unitStr: string) => {
    let cleanPhone = phone?.replace(/\D/g, '') || '';
    if (cleanPhone.startsWith('0')) cleanPhone = '254' + cleanPhone.substring(1);
    const text = encodeURIComponent(`Hi, I saw your listing for ${unitStr} on MogiRent Marketplace and would like more details.`);
    return `https://wa.me/${cleanPhone}?text=${text}`;
  };

  const handleShare = async (listing: any) => {
    const shareData = {
      title: `Unit ${listing.unit_number} at ${listing.property?.name}`,
      text: `Check out this rental unit on MogiRent Marketplace for KSh ${Number(listing.rent_amount).toLocaleString()}/month!`,
      url: window.location.href, 
    };

    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) {}
    } else {
      navigator.clipboard.writeText(`${shareData.title} - ${shareData.url}`);
      alert('Link copied to clipboard!');
    }
  };

  const openGallery = (listing: any, index: number = 0) => {
    if (!listing.images || listing.images.length === 0) return;
    markAsViewed(listing.id);
    setGalleryData({ images: listing.images, currentIndex: index, listingInfo: listing });
    setIsZoomed(false);
  };

  const closeGallery = () => { setGalleryData(null); setIsZoomed(false); };
  const nextImage = (e?: React.MouseEvent) => { e?.stopPropagation(); if (galleryData) { setGalleryData({ ...galleryData, currentIndex: (galleryData.currentIndex + 1) % galleryData.images.length }); setIsZoomed(false); } };
  const prevImage = (e?: React.MouseEvent) => { e?.stopPropagation(); if (galleryData) { setGalleryData({ ...galleryData, currentIndex: (galleryData.currentIndex - 1 + galleryData.images.length) % galleryData.images.length }); setIsZoomed(false); } };

  const renderAmenityCategory = (title: string, amenitiesList: string[]) => (
    <details className="group [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex items-center justify-between w-full py-3 text-sm font-medium text-gray-600 cursor-pointer list-none border-b border-gray-100">
        <span>{title}</span>
        <ChevronDown className="w-4 h-4 text-gray-900 group-open:rotate-180 transition-transform" />
      </summary>
      <div className="py-3 px-1 grid grid-cols-2 gap-2">
        {amenitiesList.map(amenity => {
          const isSelected = selectedAmenities.includes(amenity);
          return (
            <button
              key={amenity}
              onClick={() => toggleAmenity(amenity)}
              className={`py-2 px-3 rounded-lg text-xs font-medium transition-all text-center ${
                isSelected 
                  ? 'bg-[#1f8898] text-white border border-[#1f8898] shadow-sm shadow-[#1f8898]/20' 
                  : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-[#1f8898] hover:text-[#1f8898]'
              }`}
            >
              {amenity}
            </button>
          );
        })}
      </div>
    </details>
  );

  return (
    <div className="min-h-screen bg-[#f8fafb] font-sans selection:bg-[#1f8898]/30 flex flex-col">

      {/* --- NAVBAR --- */}
      <nav className="bg-white border-b border-gray-100 py-3 sm:py-4 px-4 sm:px-6 sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center gap-2">
          <Link href="/marketplace" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#1f8898] rounded-lg flex items-center justify-center text-white shadow-sm">
              <Home className="w-5 h-5 sm:w-5 sm:h-5" />
            </div>
            <span className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-none">
              Mogi<span className="text-[#1f8898]">Rent</span> <span className="font-medium text-gray-400 hidden sm:inline text-lg">Marketplace</span>
            </span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-6 shrink-0">
            <Link href="/" className="text-sm font-bold text-gray-500 hover:text-[#1f8898] transition-colors hidden md:flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Back to Website
            </Link>
            <div className="h-4 w-px bg-gray-200 hidden md:block mx-2"></div>
            <Link href="/login" className="text-sm font-bold text-[#1f8898] hover:text-[#156a77] transition-colors hidden sm:block">Sign In</Link>
            <Link href="/login" className="text-sm font-bold text-white bg-[#0d393f] hover:bg-[#0a2c31] px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap shadow-sm">
              Landlord Portal
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HEADER --- */}
      <div className="bg-white border-b border-gray-100 py-4 px-4 sm:px-6 shadow-sm">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">
            <Link href="/" className="hover:text-[#1f8898] transition-colors flex items-center gap-1"><Home className="w-3.5 h-3.5" /> Home</Link> 
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/marketplace" className="hover:text-[#1f8898] transition-colors">Rentals</Link> 
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#1f8898]">Available Units</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Find your next perfect home.</h1>
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex flex-col lg:flex-row gap-8 flex-1 relative">

        {/* --- LEFT COLUMN: LISTINGS --- */}
        <div className="w-full lg:w-2/3 flex flex-col overflow-hidden">
          
          <div className="flex overflow-x-auto gap-2 pb-4 mb-2 custom-scrollbar shrink-0">
            <button onClick={() => setActiveTab('all')} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === 'all' ? 'bg-[#1f8898] text-white shadow-md shadow-[#1f8898]/20' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}>
              <Building2 className="w-4 h-4" /> All Units
            </button>
            <button onClick={() => setActiveTab('featured')} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === 'featured' ? 'bg-[#0d393f] text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}>
              <Sparkles className={`w-4 h-4 ${activeTab === 'featured' ? 'text-amber-400' : ''}`} /> Featured
            </button>
            <button onClick={() => setActiveTab('recent')} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === 'recent' ? 'bg-[#1f8898] text-white shadow-md shadow-[#1f8898]/20' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}>
              <History className="w-4 h-4" /> Recently Viewed
            </button>
            <button onClick={() => setActiveTab('favorites')} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === 'favorites' ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}>
              <Heart className="w-4 h-4" fill={activeTab === 'favorites' ? 'currentColor' : 'none'} /> Favorites ({favorites.length})
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 shrink-0">
            <p className="text-sm font-bold text-gray-500 hidden sm:block">
              Showing {displayListings.length} {displayListings.length === 1 ? 'Property' : 'Properties'}
            </p>
            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
              <button onClick={() => setShowMobileFilters(true)} className="lg:hidden flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50">
                <SlidersHorizontal className="w-4 h-4 text-[#1f8898]" /> Filters
              </button>
              <div className="relative flex-1 sm:flex-none">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full sm:w-auto appearance-none bg-white border border-gray-200 pl-4 pr-10 py-2.5 rounded-xl text-sm font-bold text-gray-700 shadow-sm outline-none focus:border-[#1f8898] cursor-pointer hover:bg-gray-50">
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1f8898] pointer-events-none" />
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 text-[#1f8898] bg-white rounded-3xl border border-gray-100 shadow-sm">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="font-bold text-sm tracking-widest uppercase text-gray-400">Loading Properties...</p>
            </div>
          ) : displayListings.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-black text-gray-900 mb-2">No properties found</h3>
              <p className="text-sm text-gray-500 mb-6">
                {activeTab === 'favorites' ? "You haven't saved any favorites yet." : "Try adjusting your filters or search terms."}
              </p>
              <button onClick={clearFilters} className="bg-[#ebf3f5] text-[#1f8898] hover:bg-[#1f8898] hover:text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors">
                Clear Filters & Return Home
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {displayListings.map((listing) => {
                const isFav = favorites.includes(listing.id);
                return (
                  <div key={listing.id} className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-[#1f8898]/30 transition-all duration-300 flex flex-col sm:flex-row group relative">
                    
                    <button 
                      onClick={(e) => toggleFavorite(listing.id, e)}
                      className="absolute top-3 right-3 z-30 p-2.5 bg-white/90 backdrop-blur hover:bg-white rounded-full shadow-sm transition-transform active:scale-90"
                      title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                    >
                      <Heart className={`w-5 h-5 ${isFav ? 'text-rose-500 fill-rose-500' : 'text-gray-400'}`} />
                    </button>

                    <div className="w-full sm:w-[380px] h-[240px] sm:h-auto flex flex-col relative shrink-0">
                      <div className="absolute top-3 left-3 z-10 flex gap-2">
                        <div className="bg-white/95 backdrop-blur-sm text-[#1f8898] px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider shadow-sm">Verified</div>
                        {activeTab === 'featured' && <div className="bg-amber-400 text-white px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1"><Sparkles className="w-3 h-3"/> Featured</div>}
                      </div>

                      <div className="flex-1 bg-gray-100 relative overflow-hidden group-hover:opacity-95 transition-opacity border-b border-gray-100 sm:border-b-0 sm:border-r">
                        {listing.images && listing.images.length > 0 ? (
                          <div className={`w-full h-full grid gap-0.5 bg-white ${
                            listing.images.length >= 4 ? 'grid-cols-2 grid-rows-2' :
                            listing.images.length === 3 ? 'grid-cols-2 grid-rows-2' :
                            listing.images.length === 2 ? 'grid-cols-2' : 'grid-cols-1'
                          }`}>
                            {listing.images.slice(0, 4).map((img: any, idx: number) => (
                              <div 
                                key={idx} 
                                className={`relative overflow-hidden cursor-pointer ${listing.images.length === 3 && idx === 0 ? 'row-span-2' : ''}`}
                                onClick={() => openGallery(listing, idx)}
                              >
                                 <img
                                   src={img.url}
                                   alt={`Unit ${listing.unit_number} - View ${idx + 1}`}
                                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 select-none"
                                   draggable="false"
                                   onContextMenu={(e) => e.preventDefault()}
                                 />

                                 <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-10 select-none mix-blend-overlay">
                                   <div className="text-white/60 font-bold whitespace-nowrap drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] text-center">
                                     <div className="text-[10px] sm:text-xs tracking-widest uppercase">{listing.property?.name}</div>
                                     <div className="text-[8px] tracking-widest opacity-80 mt-0.5">POWERED BY MOGIRENTOS</div>
                                   </div>
                                 </div>

                                 {idx === 3 && listing.images.length > 4 && (
                                   <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-lg backdrop-blur-sm z-20">
                                     +{listing.images.length - 4}
                                   </div>
                                 )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-[#1f8898]/10 to-[#0d393f]/20 flex items-center justify-center">
                            <Building2 className="w-12 h-12 text-[#1f8898]/30" />
                          </div>
                        )}

                        <div 
                          className="absolute bottom-3 left-3 bg-gray-900/80 backdrop-blur text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer hover:bg-[#1f8898] transition-colors z-20"
                          onClick={() => openGallery(listing, 0)}
                        >
                          <Camera className="w-3.5 h-3.5" /> {listing.images?.length > 0 ? `${listing.images.length} Photos` : 'No Photos'}
                        </div>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start gap-4 mb-2 pr-10">
                        <h3 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
                          Unit {listing.unit_number} at {listing.property?.name}
                        </h3>
                      </div>

                      <p className="text-sm font-medium text-gray-500 flex items-center gap-1.5 mb-4">
                        <MapPin className="w-4 h-4 text-gray-400" /> {listing.property?.address}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {listing.amenities?.slice(0, 3).map((amenity: string, idx: number) => (
                          <span key={idx} className="bg-[#ebf3f5] text-[#1f8898] text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> {amenity}
                          </span>
                        ))}
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-2 mb-6 flex-1">
                        {listing.public_description || "A beautiful unit ready for immediate occupation. Contact the landlord for more details."}
                      </p>

                      <div className="mt-auto pt-4 border-t border-gray-50 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-0.5">Monthly Rent</p>
                          <h4 className="text-2xl font-black text-[#1f8898] leading-none">
                            KSh {Number(listing.rent_amount).toLocaleString()}
                          </h4>
                        </div>

                        <div className="flex gap-2.5">
                          <button onClick={() => handleShare(listing)} className="w-10 h-10 rounded-xl border border-gray-200 text-gray-500 flex items-center justify-center hover:border-[#1f8898] hover:text-[#1f8898] hover:bg-[#ebf3f5] transition-all shadow-sm" title="Share Listing">
                            <Share2 className="w-4 h-4" />
                          </button>
                          {listing.virtual_tour_url && (
                             <a href={listing.virtual_tour_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl border border-gray-200 text-[#1f8898] flex items-center justify-center hover:border-[#1f8898] hover:bg-[#ebf3f5] transition-all shadow-sm" title="Virtual Tour">
                               <Video className="w-4 h-4" />
                             </a>
                          )}
                          <a href={`tel:${listing.property?.landlord?.contact_phone}`} className="w-10 h-10 rounded-xl border border-gray-200 text-gray-500 flex items-center justify-center hover:border-[#1f8898] hover:text-[#1f8898] hover:bg-[#ebf3f5] transition-all shadow-sm" title="Call Landlord">
                            <Phone className="w-4 h-4" />
                          </a>
                          <a href={getWhatsAppLink(listing.property?.landlord?.contact_phone, `Unit ${listing.unit_number} at ${listing.property?.name}`)} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl border border-gray-200 text-[#25D366] flex items-center justify-center hover:border-[#25D366] hover:bg-[#25D366]/10 transition-all shadow-sm" title="WhatsApp">
                            <MessageCircle className="w-5 h-5" />
                          </a>
                          <button onClick={() => openContactModal(listing)} className="flex items-center justify-center flex-1 xl:flex-none gap-2 bg-[#0d393f] hover:bg-[#0a2c31] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm whitespace-nowrap">
                            <Send className="w-4 h-4" /> Contact
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* --- RIGHT COLUMN: ADVANCED FILTERS --- */}
        <aside className={`
          fixed inset-0 z-50 lg:static lg:z-auto lg:flex lg:w-1/3 flex-col gap-6
          ${showMobileFilters ? 'flex' : 'hidden'}
        `}>
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm lg:hidden transition-opacity" onClick={() => setShowMobileFilters(false)}></div>

          <div className={`
            absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white p-6 overflow-y-auto shadow-2xl transition-transform duration-300 ease-in-out
            lg:relative lg:w-full lg:max-w-none lg:bg-white lg:border lg:border-gray-100 lg:rounded-3xl lg:p-8 lg:sticky lg:top-24 lg:shadow-xl lg:shadow-black/5 custom-scrollbar
          `}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-[#1f8898] lg:hidden" />
                <h3 className="text-lg font-black text-gray-900 tracking-tight">Filter Properties</h3>
              </div>
              
              {(searchTerm || locationFilter || minPrice || maxPrice || unitType || bedrooms || bathrooms || hasVirtualTour || selectedAmenities.length > 0) && (
                <button onClick={clearFilters} className="hidden lg:flex text-xs font-bold text-rose-500 hover:text-rose-600 items-center gap-1 transition-colors">
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              )}

              <button onClick={() => setShowMobileFilters(false)} className="lg:hidden p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              
              {/* Type Dropdown */}
              <div className="relative">
                <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-medium text-gray-900 outline-none focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all appearance-none cursor-pointer" value={unitType} onChange={(e) => setUnitType(e.target.value)}>
                  <option value="">All Property Types</option>
                  <option value="APARTMENT">Apartments</option>
                  <option value="HOUSE_OWN_COMPOUND">Houses</option>
                  <option value="TOWNHOUSE">Townhouses</option>
                  <option value="BEDSITTER">Bedsitters / Studios</option>
                  <option value="OFFICE">Offices</option>
                  <option value="SHOP">Shops</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Search Keyword */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1.5 ml-1">Search Keyword</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="e.g. Ruiru, Balcony..." className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 text-sm font-medium text-gray-900 outline-none focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1.5 ml-1">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 text-sm font-medium text-gray-900 outline-none focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all appearance-none cursor-pointer" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
                    <option value="">All Locations</option>
                    {uniqueLocations.map(loc => (
                      <option key={loc as string} value={loc as string}>{loc as string}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1.5 ml-1">Monthly Budget (KSh)</label>
                <div className="flex gap-3">
                  <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : '')} className="w-1/2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-medium text-gray-900 outline-none focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all" />
                  <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')} className="w-1/2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-medium text-gray-900 outline-none focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all" />
                </div>
              </div>

              {/* Advanced Accordions */}
              <div className="pt-2 space-y-3">
                {/* Size */}
                <details className="group [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between w-full py-3 text-sm font-medium text-gray-900 cursor-pointer list-none border-b border-gray-100">
                    <span>Size</span>
                    <ChevronDown className="w-4 h-4 text-gray-900 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="py-3 px-2 text-sm text-gray-500">Filters by Square Meters coming soon.</div>
                </details>

                {/* Bedrooms */}
                <details className="group [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between w-full py-3 text-sm font-medium text-gray-900 cursor-pointer list-none border-b border-gray-100">
                    <span>Bedrooms</span>
                    <ChevronDown className="w-4 h-4 text-gray-900 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="py-3 px-2 flex flex-wrap gap-2">
                    {['1', '2', '3', '4', '5+'].map(num => (
                      <button key={num} onClick={() => setBedrooms(bedrooms === num ? '' : num)} className={`px-4 py-1.5 rounded-lg text-sm border font-medium transition-all ${bedrooms === num ? 'bg-[#1f8898] text-white border-[#1f8898]' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-[#1f8898]'}`}>
                        {num}
                      </button>
                    ))}
                  </div>
                </details>

                {/* Bathrooms */}
                <details className="group [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between w-full py-3 text-sm font-medium text-gray-900 cursor-pointer list-none border-b border-gray-100">
                    <span>Bathrooms</span>
                    <ChevronDown className="w-4 h-4 text-gray-900 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="py-3 px-2 flex flex-wrap gap-2">
                    {['1', '2', '3', '4+'].map(num => (
                      <button key={num} onClick={() => setBathrooms(bathrooms === num ? '' : num)} className={`px-4 py-1.5 rounded-lg text-sm border font-medium transition-all ${bathrooms === num ? 'bg-[#1f8898] text-white border-[#1f8898]' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-[#1f8898]'}`}>
                        {num}
                      </button>
                    ))}
                  </div>
                </details>

                {/* --- AMENITIES CATEGORIES --- */}
                <div className="pt-2">
                  <h4 className="text-base font-medium text-gray-900 mb-2">Amenities</h4>
                  {renderAmenityCategory("Nearby", AMENITIES_CATEGORIES.nearby)}
                  {renderAmenityCategory("Internal features", AMENITIES_CATEGORIES.internal)}
                  {renderAmenityCategory("External features", AMENITIES_CATEGORIES.external)}
                </div>
              </div>

              {/* Checkbox for Virtual Tours */}
              <div className="pt-4 pb-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${hasVirtualTour ? 'bg-[#1f8898] border-[#1f8898]' : 'bg-gray-50 border-gray-200 group-hover:border-[#1f8898]'}`}>
                    {hasVirtualTour && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={hasVirtualTour} onChange={(e) => setHasVirtualTour(e.target.checked)} />
                  <span className="text-sm font-medium text-gray-600 select-none">Listings with virtual tours and videos</span>
                </label>
              </div>

              {/* Desktop/Mobile Search Button */}
              <div className="pt-2">
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full bg-[#1f8898] hover:bg-[#156a77] text-white py-4 rounded-xl font-bold text-base transition-colors shadow-lg shadow-[#1f8898]/20 flex justify-center items-center gap-2"
                >
                  <Search className="w-4 h-4" /> Search
                </button>
                
                {/* Mobile Reset Only */}
                <div className="lg:hidden mt-3">
                  {(searchTerm || locationFilter || minPrice || maxPrice || unitType || bedrooms || bathrooms || hasVirtualTour || selectedAmenities.length > 0) && (
                    <button onClick={clearFilters} className="w-full bg-rose-50 text-rose-600 hover:bg-rose-100 py-3.5 rounded-xl font-bold text-sm transition-colors">
                      Reset All Filters
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        </aside>
      </main>

      {/* --- ADVANCED LEAD CAPTURE MODAL --- */}
      {isModalOpen && selectedListing && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => !isSubmitting && setIsModalOpen(false)}></div>

          <div className="relative w-full max-w-md bg-[#ffffff] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 flex flex-col max-h-[95vh]">
            
            {/* Modal Header */}
            <div className="relative pt-8 pb-4 px-6 flex flex-col items-center border-b border-gray-100 shrink-0">
              <button onClick={() => !isSubmitting && setIsModalOpen(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-14 h-14 border-2 border-[#1f8898]/20 rounded-2xl flex items-center justify-center text-[#1f8898] mb-4 bg-white shadow-sm">
                 <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight text-center leading-tight">
                {selectedListing.property?.landlord?.company_name || 'Property Owner'}
              </h3>
              <p className="text-sm font-medium text-gray-500 mt-1 text-center">
                Inquire about Unit {selectedListing.unit_number} at {selectedListing.property?.name}
              </p>
            </div>

            <div className="overflow-y-auto p-6 custom-scrollbar flex-1">
              {submitStatus ? (
                <div className={`p-6 rounded-2xl text-center border ${submitStatus.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                  <CheckCircle2 className={`w-12 h-12 mx-auto mb-4 ${submitStatus.type === 'success' ? 'text-emerald-500' : 'text-rose-500 hidden'}`} />
                  <p className="font-bold text-base">{submitStatus.text}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitLead} className="space-y-4">
                  
                  {/* Single Column Inputs */}
                  <div>
                    <input type="text" required placeholder="Full name (required)"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3.5 outline-none focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all font-medium text-sm placeholder:text-gray-400"
                      value={formData.prospect_name} onChange={(e) => setFormData({ ...formData, prospect_name: e.target.value })}
                    />
                  </div>

                  <div>
                    <input type="email" required placeholder="Your email (required)"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3.5 outline-none focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all font-medium text-sm placeholder:text-gray-400"
                      value={formData.prospect_email} onChange={(e) => setFormData({ ...formData, prospect_email: e.target.value })}
                    />
                  </div>

                  <div className="relative flex items-center w-full rounded-xl border border-gray-200 overflow-hidden focus-within:border-[#1f8898] focus-within:ring-4 focus-within:ring-[#1f8898]/10 transition-all">
                    <div className="flex items-center gap-2 pl-4 pr-3 py-3.5 bg-gray-50 border-r border-gray-200 shrink-0">
                      <span className="text-lg leading-none">🇰🇪</span>
                      <span className="text-sm font-bold text-gray-700">+254</span>
                    </div>
                    <input type="tel" required placeholder="Phone number (required)"
                      className="w-full px-4 py-3.5 outline-none font-medium text-sm placeholder:text-gray-400"
                      value={formData.prospect_phone} onChange={(e) => setFormData({ ...formData, prospect_phone: e.target.value })}
                    />
                  </div>

                  <div className="pt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Please enter your message <span className="text-gray-400 font-normal">(required)</span></label>
                    <textarea required rows={3}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3.5 outline-none focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all font-medium text-sm resize-none text-gray-700"
                      value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  {/* Compliance & Marketing Checkboxes */}
                  <div className="space-y-3 pt-2">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${formData.agreeTerms ? 'bg-[#1f8898] border-[#1f8898]' : 'bg-white border-gray-300 group-hover:border-[#1f8898]'}`}>
                        {formData.agreeTerms && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <input type="checkbox" className="hidden" checked={formData.agreeTerms} onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })} />
                      <span className="text-sm text-gray-600 leading-snug">
                        <span className="text-rose-500 font-bold">*</span> I agree to MogiRentOS <span className="text-[#1f8898] hover:underline">Terms & Conditions</span> and <span className="text-[#1f8898] hover:underline">Privacy Policy</span>.
                      </span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${formData.emailSimilar ? 'bg-[#1f8898] border-[#1f8898]' : 'bg-white border-gray-300 group-hover:border-[#1f8898]'}`}>
                        {formData.emailSimilar && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <input type="checkbox" className="hidden" checked={formData.emailSimilar} onChange={(e) => setFormData({ ...formData, emailSimilar: e.target.checked })} />
                      <span className="text-sm text-gray-600">Email me about similar properties</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${formData.allowAgents ? 'bg-[#1f8898] border-[#1f8898]' : 'bg-white border-gray-300 group-hover:border-[#1f8898]'}`}>
                        {formData.allowAgents && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <input type="checkbox" className="hidden" checked={formData.allowAgents} onChange={(e) => setFormData({ ...formData, allowAgents: e.target.checked })} />
                      <span className="text-sm text-gray-600">Allow agents with similar properties to contact me</span>
                    </label>
                  </div>

                  <div className="pt-6">
                    <button 
                      type="submit" 
                      disabled={isSubmitting || !formData.agreeTerms} 
                      className={`w-full py-3.5 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 ${
                        formData.agreeTerms && !isSubmitting
                          ? 'bg-[#f0f7f8] text-[#1f8898] border border-[#1f8898] hover:bg-[#1f8898] hover:text-white shadow-sm'
                          : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                      }`}
                    >
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                      {isSubmitting ? 'Sending...' : 'Submit message'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- FULLSCREEN IMAGE GALLERY LIGHTBOX --- */}
      {galleryData && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-black/95 backdrop-blur-xl animate-in fade-in duration-200">
          
          <div className="absolute top-0 left-0 right-0 z-50 p-4 sm:p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
            <div className="text-white/80 font-bold tracking-widest text-sm bg-black/40 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10 pointer-events-auto">
              {galleryData.currentIndex + 1} OF {galleryData.images.length}
            </div>
            
            <div className="flex items-center gap-4 pointer-events-auto">
              <button onClick={() => setIsZoomed(!isZoomed)} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all" title={isZoomed ? "Zoom Out" : "Zoom In"}>
                {isZoomed ? <ZoomOut className="w-6 h-6" /> : <ZoomIn className="w-6 h-6" />}
              </button>
              <button onClick={closeGallery} className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 rounded-full transition-all">
                <X className="w-7 h-7" />
              </button>
            </div>
          </div>

          <div className={`flex-1 overflow-auto flex items-center justify-center p-4 sm:p-12 pt-24 pb-32 transition-all duration-300 ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`} onClick={() => setIsZoomed(!isZoomed)}>
            <div className={`relative transition-all duration-500 ease-out flex items-center justify-center ${isZoomed ? 'w-full h-auto scale-[1.5] md:scale-[2]' : 'w-full h-full'}`}>
              
              <img 
                src={galleryData.images[galleryData.currentIndex].url} 
                alt="Property Gallery View" 
                className={`rounded-lg select-none shadow-2xl ${isZoomed ? 'w-full h-auto object-cover' : 'max-w-full max-h-full object-contain'}`}
                draggable="false"
                onContextMenu={(e) => e.preventDefault()}
              />
              
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-10 select-none mix-blend-overlay">
                <div className="text-white/40 font-bold whitespace-nowrap drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-center">
                  <div className="text-2xl sm:text-4xl tracking-widest uppercase">{galleryData.listingInfo?.property?.name}</div>
                  <div className="text-sm sm:text-lg tracking-widest opacity-80 mt-1">POWERED BY MOGIRENTOS</div>
                </div>
              </div>

            </div>
          </div>

          {galleryData.images.length > 1 && (
            <>
              <button onClick={prevImage} className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-3 sm:p-4 bg-black/40 hover:bg-[#1f8898] text-white rounded-full backdrop-blur-md transition-all border border-white/10 hover:scale-110 group z-50">
                <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <button onClick={nextImage} className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-3 sm:p-4 bg-black/40 hover:bg-[#1f8898] text-white rounded-full backdrop-blur-md transition-all border border-white/10 hover:scale-110 group z-50">
                <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </>
          )}

          {galleryData.images.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/90 to-transparent flex justify-center gap-3 overflow-x-auto custom-scrollbar z-50 pointer-events-none">
              <div className="flex gap-2 pointer-events-auto max-w-full px-4">
                {galleryData.images.map((img: any, idx: number) => (
                  <button key={idx} onClick={(e) => { e.stopPropagation(); setGalleryData({ ...galleryData, currentIndex: idx }); setIsZoomed(false); }} className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 transition-all duration-200 border-2 ${galleryData.currentIndex === idx ? 'border-[#1f8898] scale-110 shadow-lg shadow-[#1f8898]/40 z-10' : 'border-transparent opacity-50 hover:opacity-100'}`}>
                    <img src={img.url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Footer />
    </div>
  );
}