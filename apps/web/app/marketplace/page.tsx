// apps/web/app/marketplace/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';  
import {
  Search, MapPin, Building2, Phone, Loader2, X, Send,
  Camera, MessageCircle, SlidersHorizontal,Mail,
  ChevronDown, ChevronRight, CheckCircle2, RotateCcw, Filter,
  ChevronLeft, ZoomIn, ZoomOut, Share2, Heart, Sparkles, History,
  LockKeyhole
} from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import SeoFaq from "@/components/SeoFaq";

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
  const router = useRouter();

  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'all' | 'featured' | 'recent' | 'favorites'>('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);

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

  const [galleryData, setGalleryData] = useState<{ images: any[], currentIndex: number, listingInfo: any } | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  
  // --- PAYWALL & M-PESA STATES ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [unlockPhone, setUnlockPhone] = useState('');
  const [isWaitingForMpesa, setIsWaitingForMpesa] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [unlockedUnits, setUnlockedUnits] = useState<Record<string, { phone: string, exact_name: string, latitude: number, longitude: number }>>({});

  // --- CRM LEAD CAPTURE STATES ---
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadSubmitStatus, setLeadSubmitStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [leadFormData, setLeadFormData] = useState({
    prospect_name: '', prospect_email: '', prospect_phone: '', message: '',
    agreeTerms: false, emailSimilar: false, allowAgents: false
  });

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/marketplace/listings`);
        if (!res.ok) throw new Error('Failed to fetch listings');
        const responseData = await res.json();
        setListings(responseData.data || []); 
        
      } catch (error) {
        console.error("Error loading marketplace:", error);
        setListings([]); 
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchListings();
    setFavorites(JSON.parse(localStorage.getItem('mogi_favorites') || '[]'));
    setRecentlyViewed(JSON.parse(localStorage.getItem('mogi_recent_views') || '[]'));
  }, []);

  const uniqueLocations = Array.from(new Set(listings.map(l => l.property?.address))).filter(Boolean);

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
    setSelectedAmenities(prev => prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]);
  };

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

  const clearFilters = () => {
    setSearchTerm(''); setLocationFilter(''); setMinPrice(''); setMaxPrice('');
    setUnitType(''); setBedrooms(''); setBathrooms(''); setSelectedAmenities([]);
    setHasVirtualTour(false); setSortBy('newest'); setActiveTab('all');
  };

  // --- UNLOCK MODAL LOGIC (COMPLETELY REMOVED NEXT-AUTH) ---
  const openUnlockModal = (listing: any) => {
    // 1. Check Custom Local Storage Auth
    const isLogged = !!localStorage.getItem('user_role');
    
    if (!isLogged) {
      // 2. Redirect them to your register/login page. 
      router.push('/register?callbackUrl=/marketplace');
      return;
    }

    markAsViewed(listing.id);
    setSelectedListing(listing);
    setSubmitStatus(null);
    setUnlockPhone('');
    setIsWaitingForMpesa(false);
    setIsModalOpen(true);
  };

  const closeUnlockModal = () => {
    setIsModalOpen(false);
    if (pollingInterval) clearInterval(pollingInterval);
    setIsWaitingForMpesa(false);
  };

  const startPollingMpesaStatus = (unitId: string, phone: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/marketplace/unlock/status?unit_id=${unitId}&phone=${phone}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === 'SUCCESS') {
          clearInterval(interval);
          setIsWaitingForMpesa(false);
          setSubmitStatus({ type: 'success', text: 'Payment successful! Details unlocked.' });
          setUnlockedUnits(prev => ({
            ...prev,
            [unitId]: { phone: data.revealed_phone, exact_name: data.exact_name, latitude: data.latitude, longitude: data.longitude }
          }));
        } else if (data.status === 'FAILED') {
          clearInterval(interval);
          setIsWaitingForMpesa(false);
          setSubmitStatus({ type: 'error', text: 'M-Pesa payment failed or was cancelled.' });
        }
      } catch (error) {
        console.error("Polling error", error);
      }
    }, 3000); 
    setPollingInterval(interval);
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsWaitingForMpesa(true);
    setSubmitStatus(null);

    let finalPhone = unlockPhone.replace(/\D/g, '');
    if (finalPhone.startsWith('0')) finalPhone = '254' + finalPhone.substring(1);
    else if (!finalPhone.startsWith('254')) finalPhone = '254' + finalPhone;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/marketplace/unlock`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unit_id: selectedListing.id, phone: finalPhone }),
      });
      if (!response.ok) throw new Error('Failed to initiate M-Pesa STK Push.');
      startPollingMpesaStatus(selectedListing.id, finalPhone);
    } catch (error: any) {
      setSubmitStatus({ type: 'error', text: error.message });
      setIsWaitingForMpesa(false);
    }
  };

  // --- CRM LEAD MODAL LOGIC ---
  const openContactModal = (listing: any) => {
    markAsViewed(listing.id);
    setSelectedListing(listing);
    setLeadSubmitStatus(null);
    
    const savedEmail = localStorage.getItem('user_email') || '';
    
    setLeadFormData({
      prospect_name: '', 
      prospect_email: savedEmail, 
      prospect_phone: '',
      message: `Hi, I am interested in Unit ${listing.unit_number}. Please contact me with more details or to schedule a viewing.`,
      agreeTerms: false, emailSimilar: false, allowAgents: false
    });
    setIsContactModalOpen(true);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadFormData.agreeTerms) return;
    setIsSubmittingLead(true);
    setLeadSubmitStatus(null);

    let finalPhone = leadFormData.prospect_phone.replace(/\D/g, '');
    if (finalPhone.startsWith('0')) finalPhone = '254' + finalPhone.substring(1);
    else if (!finalPhone.startsWith('254')) finalPhone = '254' + finalPhone;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/marketplace/leads`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unit_id: selectedListing.id, 
          prospect_name: leadFormData.prospect_name, 
          prospect_email: leadFormData.prospect_email,
          prospect_phone: finalPhone, 
          message: leadFormData.message,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit inquiry.');
      setLeadSubmitStatus({ type: 'success', text: 'Viewing request sent securely to the landlord!' });
      setTimeout(() => { setIsContactModalOpen(false); setLeadSubmitStatus(null); }, 3000);
    } catch (error: any) {
      setLeadSubmitStatus({ type: 'error', text: error.message });
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const getWhatsAppLink = (phone: string, unitStr: string, listingId: string) => {
    let cleanPhone = phone?.replace(/\D/g, '') || '';
    if (cleanPhone.startsWith('0')) cleanPhone = '254' + cleanPhone.substring(1);
    const listingUrl = `${window.location.origin}/marketplace?id=${listingId}`;
    const message = `I saw your listing for ${unitStr} on MogiRent Marketplace and would like more details.\n\nListing link: ${listingUrl}`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const handleShare = async (listing: any) => {
    const shareData = {
      title: `Unit ${listing.unit_number} - MogiRent Marketplace`,
      text: `Check out this rental unit on MogiRent Marketplace for KSh ${Number(listing.rent_amount).toLocaleString()}/month!`,
      url: window.location.href,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) { }
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
            <button key={amenity} onClick={() => toggleAmenity(amenity)}
              className={`py-2 px-3 rounded-lg text-xs font-medium transition-all text-center ${isSelected ? 'bg-[#1f8898] text-white border border-[#1f8898] shadow-sm shadow-[#1f8898]/20' : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-[#1f8898] hover:text-[#1f8898]'
                }`}>
              {amenity}
            </button>
          );
        })}
      </div>
    </details>
  );

  const localFaqs = useMemo(() => {
    const currentArea = locationFilter || "Kenya";
    return [
      {
        question: `What are the average rental prices in ${currentArea}?`,
        answer: locationFilter.toLowerCase() === 'ruiru'
          ? "As of 2026, a standard 2-bedroom apartment in Ruiru averages between KSH 25,000 and KSH 35,000 per month, depending on proximity to the Thika Superhighway and integrated amenities."
          : `Rental prices in ${currentArea} vary by unit type. Premium verified apartments and commercial spaces listed on MogiRentOS represent real-time local market rates with verified landlord pricing.`
      },
      {
        question: `Do properties in ${currentArea} accept M-Pesa?`,
        answer: "Yes, all properties managed natively on MogiRentOS fully support automated zero-touch M-Pesa reconciliation and instant rent clearance via integrated STK pushes."
      }
    ];
  }, [locationFilter]);

  // Evaluated names for modals
  const selectedUnlockedData = selectedListing ? unlockedUnits[selectedListing.id] : null;
  const isSelectedUnlocked = !!selectedUnlockedData;
  const selectedDisplayPropertyName = isSelectedUnlocked ? (selectedUnlockedData?.exact_name || selectedListing.property?.name) : "Premium Listing";

  return (
    <div className="min-h-screen bg-[#f8fafb] font-sans selection:bg-[#1f8898]/30 flex flex-col">
      <Navbar />

      <div className="bg-gradient-to-br from-[#0d393f] to-[#0a2c31] py-5 sm:py-6 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1f8898] rounded-full blur-3xl opacity-20 -mr-32 -mt-32 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#135a65] rounded-full blur-3xl opacity-30 -ml-20 -mb-20 pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight mb-2 leading-tight flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-300 hidden sm:block" /> Discover your next perfect space.
          </h1>
          <p className="text-teal-100/80 text-xs sm:text-sm font-medium mb-5 max-w-2xl mx-auto">
            Browse premium apartments, houses, and commercial spaces directly managed by top landlords.
          </p>

          <div className="relative max-w-3xl mx-auto group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#1f8898]/30 to-teal-400/30 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
            <div className="relative bg-white border border-white/20 shadow-xl shadow-black/20 rounded-2xl flex items-center overflow-hidden transition-all focus-within:ring-4 focus-within:ring-[#1f8898]/30 p-1 sm:p-1.5 pl-3 sm:pl-4">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search city, neighborhood, or property..."
                className="w-full bg-transparent text-gray-900 text-sm sm:text-base font-bold px-3 py-2 sm:py-2.5 outline-none placeholder:text-gray-400 placeholder:font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="bg-[#1f8898] hover:bg-[#156a77] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-sm transition-colors shadow-md whitespace-nowrap hidden sm:block">
                Search Homes
              </button>
            </div>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-2 mt-3 sm:mt-4">
            <span className="text-teal-100/50 text-[10px] font-black uppercase tracking-widest mr-1 hidden sm:block">Trending:</span>
            <button onClick={() => setUnitType('APARTMENT')} className="bg-white/5 hover:bg-white/10 text-teal-50 border border-white/10 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold backdrop-blur-sm transition-colors shadow-sm">Apartments</button>
            <button onClick={() => setUnitType('OFFICE')} className="bg-white/5 hover:bg-white/10 text-teal-50 border border-white/10 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold backdrop-blur-sm transition-colors shadow-sm">Commercial</button>
            <button onClick={() => setLocationFilter('Nairobi')} className="bg-white/5 hover:bg-white/10 text-teal-50 border border-white/10 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold backdrop-blur-sm transition-colors shadow-sm">Nairobi</button>
            <button onClick={() => setMaxPrice(50000)} className="bg-white/5 hover:bg-white/10 text-teal-50 border border-white/10 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold backdrop-blur-sm transition-colors shadow-sm hidden sm:block">Under 50k</button>
          </div>
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-8 sm:py-10 flex flex-col lg:flex-row gap-8 flex-1 relative z-20">

        <div className="w-full lg:w-2/3 flex flex-col overflow-hidden">
          <div className="flex overflow-x-auto gap-2 pb-4 mb-2 custom-scrollbar shrink-0">
            <button onClick={() => setActiveTab('all')} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === 'all' ? 'bg-[#1f8898] text-white shadow-md shadow-[#1f8898]/20 border border-[#1f8898]' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}>
              <Building2 className="w-4 h-4" /> All Units
            </button>
            <button onClick={() => setActiveTab('featured')} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === 'featured' ? 'bg-gray-900 text-white shadow-md border border-gray-900' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}>
              <Sparkles className={`w-4 h-4 ${activeTab === 'featured' ? 'text-amber-400' : ''}`} /> Featured
            </button>
            <button onClick={() => setActiveTab('recent')} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === 'recent' ? 'bg-[#1f8898] text-white shadow-md shadow-[#1f8898]/20 border border-[#1f8898]' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}>
              <History className="w-4 h-4" /> Recently Viewed
            </button>
            <button onClick={() => setActiveTab('favorites')} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === 'favorites' ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-sm' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}>
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
              <div className="relative flex-1 sm:flex-none group">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full sm:w-auto appearance-none bg-white border border-gray-200 pl-4 pr-10 py-2.5 rounded-xl text-sm font-bold text-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-[#1f8898]/20 focus:border-[#1f8898] cursor-pointer hover:bg-gray-50 transition-all">
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-[#1f8898] pointer-events-none transition-colors" />
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-[2rem] border border-gray-100 p-2 flex flex-col sm:flex-row gap-6 animate-pulse shadow-sm">
                  <div className="w-full sm:w-[380px] h-[240px] bg-gray-100 rounded-[1.5rem] shrink-0"></div>
                  <div className="flex-1 py-6 pr-6 flex flex-col gap-4">
                    <div className="flex justify-between"><div className="h-8 bg-gray-100 rounded-lg w-2/3"></div></div>
                    <div className="h-4 bg-gray-100 rounded-md w-1/2"></div>
                    <div className="flex gap-2"><div className="h-6 bg-gray-100 rounded-md w-20"></div><div className="h-6 bg-gray-100 rounded-md w-24"></div></div>
                    <div className="mt-auto flex justify-between items-end">
                      <div className="space-y-2"><div className="h-3 bg-gray-100 rounded w-16"></div><div className="h-8 bg-gray-100 rounded-lg w-32"></div></div>
                      <div className="h-10 bg-gray-100 rounded-xl w-32"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : displayListings.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-black text-gray-900 mb-2">No properties found</h3>
              <p className="text-sm text-gray-500 mb-6">
                {activeTab === 'favorites' ? "You haven't saved any favorites yet." : "Try adjusting your filters or search terms."}
              </p>
              <button onClick={clearFilters} className="bg-[#ebf3f5] text-[#1f8898] hover:bg-[#1f8898] hover:text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm">
                Clear Filters & Reset
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {displayListings.map((listing) => {
                const isFav = favorites.includes(listing.id);
                const unlockedData = unlockedUnits[listing.id];
                const isUnlocked = !!unlockedData;

                const displayLocation = isUnlocked ? listing.property?.address : `${listing.property?.address || 'Unknown'} Area`;
                const displayPropertyName = isUnlocked ? (unlockedData.exact_name || listing.property?.name) : "Premium Listing";
                
                return (
                  <div key={listing.id} className="bg-white rounded-2xl md:rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-[#1f8898]/10 hover:border-[#1f8898]/30 hover:-translate-y-1 transition-all duration-300 flex flex-col sm:flex-row group relative">

                    <button
                      onClick={(e) => toggleFavorite(listing.id, e)}
                      className="absolute top-4 right-4 z-30 p-2.5 bg-white/90 backdrop-blur-md hover:bg-white rounded-full shadow-md transition-transform active:scale-90 border border-white"
                      title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                    >
                      <Heart className={`w-5 h-5 ${isFav ? 'text-rose-500 fill-rose-500' : 'text-gray-400'}`} />
                    </button>

                    <div className="w-full sm:w-[380px] h-[240px] sm:h-auto flex flex-col relative shrink-0 p-2">
                      <div className="absolute top-4 left-4 z-20 flex gap-2">
                        <div className="bg-white/90 backdrop-blur-md text-[#1f8898] border border-white/20 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm">Verified</div>
                        {activeTab === 'featured' && <div className="bg-amber-400 text-white px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1"><Sparkles className="w-3 h-3" /> Featured</div>}
                      </div>

                      <div className="flex-1 bg-gray-100 relative overflow-hidden rounded-[1.5rem] group-hover:shadow-inner transition-all">
                        {listing.images && listing.images.length > 0 ? (
                          <div className={`w-full h-full grid gap-0.5 bg-white ${listing.images.length >= 4 ? 'grid-cols-2 grid-rows-2' :
                              listing.images.length === 3 ? 'grid-cols-2 grid-rows-2' :
                                listing.images.length === 2 ? 'grid-cols-2' : 'grid-cols-1'
                            }`}>
                            {listing.images.slice(0, 4).map((img: any, idx: number) => (
                              <div
                                key={idx}
                                className={`relative overflow-hidden cursor-pointer ${listing.images.length === 3 && idx === 0 ? 'row-span-2' : ''}`}
                                onClick={() => openGallery(listing, idx)}
                              >
                                <img src={img.url} alt={`Unit ${listing.unit_number}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 select-none" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

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
                          className="absolute bottom-3 left-3 bg-gray-900/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer hover:bg-[#1f8898] transition-colors z-20 border border-white/10"
                          onClick={() => openGallery(listing, 0)}
                        >
                          <Camera className="w-3.5 h-3.5" /> {listing.images?.length > 0 ? `${listing.images.length} Photos` : 'No Photos'}
                        </div>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-center">
                      <div className="flex justify-between items-start gap-4 mb-3 pr-10">
                        <h3 className="text-2xl font-black text-gray-900 leading-tight group-hover:text-[#1f8898] transition-colors flex items-center gap-2">
                          Unit {listing.unit_number} <span className="text-gray-300">•</span> {displayPropertyName}
                          {!isUnlocked && <LockKeyhole className="w-4 h-4 text-amber-500 mb-0.5" />}
                        </h3>
                      </div>

                      <p className="text-sm font-medium text-gray-500 flex items-center gap-1.5 mb-5">
                        <MapPin className={`w-4 h-4 ${isUnlocked ? 'text-[#1f8898]' : 'text-gray-400'}`} /> {displayLocation}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-5">
                        {listing.amenities?.slice(0, 3).map((amenity: string, idx: number) => (
                          <span key={idx} className="bg-gray-50 border border-gray-100 text-gray-600 text-[10px] font-bold px-2.5 py-1.5 rounded-lg uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-[#1f8898]" /> {amenity}
                          </span>
                        ))}
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-2 mb-8 flex-1 leading-relaxed">
                        {listing.public_description || "A beautiful unit ready for immediate occupation. Contact the landlord for more details."}
                      </p>

                      <div className="mt-auto pt-5 border-t border-gray-100 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-1">Monthly Rent</p>
                          <h4 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#1f8898] to-gray-900 leading-none tracking-tight">
                            KSh {Number(listing.rent_amount).toLocaleString()}
                          </h4>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2.5 w-full xl:w-auto">
                          {isUnlocked ? (
                            <>
                              <button onClick={() => handleShare(listing)} className="w-11 h-11 rounded-xl border border-gray-200 text-gray-500 flex items-center justify-center hover:border-[#1f8898] hover:text-[#1f8898] hover:bg-[#ebf3f5] transition-all shadow-sm shrink-0" title="Share Listing">
                                <Share2 className="w-4 h-4" />
                              </button>
                              <a href={`https://www.google.com/maps/search/?api=1&query=${unlockedData.latitude},${unlockedData.longitude}`} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-xl border border-gray-200 text-[#1f8898] flex items-center justify-center hover:border-[#1f8898] hover:bg-[#ebf3f5] transition-all shadow-sm shrink-0" title="View Exact Location">
                                <MapPin className="w-4 h-4" />
                              </a>
                              <a href={`tel:${unlockedData.phone}`} className="w-11 h-11 rounded-xl border border-gray-200 text-gray-500 flex items-center justify-center hover:border-[#1f8898] hover:text-[#1f8898] hover:bg-[#ebf3f5] transition-all shadow-sm shrink-0" title="Call Landlord">
                                <Phone className="w-4 h-4" />
                              </a>
                              <a href={getWhatsAppLink(unlockedData.phone, `Unit ${listing.unit_number} at ${unlockedData.exact_name}`, listing.id)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center flex-1 xl:flex-none gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-[#25D366]/20 hover:shadow-[#25D366]/30 hover:-translate-y-0.5 whitespace-nowrap">
                                <MessageCircle className="w-5 h-5" /> WhatsApp Owner
                              </a>
                              <button onClick={() => openContactModal(listing)} className="flex items-center justify-center flex-1 xl:flex-none gap-2 bg-gray-900 hover:bg-[#1f8898] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-gray-900/20 hover:shadow-[#1f8898]/30 hover:-translate-y-0.5 whitespace-nowrap">
                                <Send className="w-4 h-4" /> Request Viewing
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => openUnlockModal(listing)} className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 hover:-translate-y-0.5 whitespace-nowrap">
                                <LockKeyhole className="w-4 h-4" /> Unlock Details
                              </button>
                              <button onClick={() => openContactModal(listing)} className="flex-1 flex items-center justify-center gap-2 bg-gray-900 hover:bg-[#1f8898] text-white px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-gray-900/20 hover:shadow-[#1f8898]/30 hover:-translate-y-0.5 whitespace-nowrap">
                                <Send className="w-4 h-4" /> Request Viewing
                              </button>
                            </>
                          )}
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
        <aside className={`fixed inset-0 z-50 lg:static lg:z-auto lg:flex lg:w-1/3 flex-col gap-6 ${showMobileFilters ? 'flex' : 'hidden'}`}>
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm lg:hidden transition-opacity" onClick={() => setShowMobileFilters(false)}></div>

          <div className={`absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white p-6 overflow-y-auto shadow-2xl transition-transform duration-300 ease-in-out lg:relative lg:w-full lg:max-w-none lg:bg-white lg:border lg:border-gray-100 lg:rounded-[2.5rem] lg:p-8 lg:sticky lg:top-24 lg:shadow-xl lg:shadow-black/5 custom-scrollbar`}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-[#1f8898]" />
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Filters</h3>
              </div>

              {(searchTerm || locationFilter || minPrice || maxPrice || unitType || bedrooms || bathrooms || hasVirtualTour || selectedAmenities.length > 0) && (
                <button onClick={clearFilters} className="hidden lg:flex text-xs font-bold text-rose-500 hover:text-rose-600 items-center gap-1 transition-colors bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100">
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              )}

              <button onClick={() => setShowMobileFilters(false)} className="lg:hidden p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="relative group">
                <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold text-gray-900 outline-none focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all appearance-none cursor-pointer" value={unitType} onChange={(e) => setUnitType(e.target.value)}>
                  <option value="">All Property Types</option>
                  <option value="APARTMENT">Apartments</option>
                  <option value="HOUSE_OWN_COMPOUND">Houses</option>
                  <option value="TOWNHOUSE">Townhouses</option>
                  <option value="BEDSITTER">Bedsitters / Studios</option>
                  <option value="OFFICE">Offices</option>
                  <option value="SHOP">Shops</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-[#1f8898] pointer-events-none transition-colors" />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Location</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#1f8898] transition-colors" />
                  <select className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 text-sm font-bold text-gray-900 outline-none focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all appearance-none cursor-pointer" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
                    <option value="">Anywhere in Kenya</option>
                    {uniqueLocations.map(loc => (
                      <option key={loc as string} value={loc as string}>{loc as string}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-[#1f8898] pointer-events-none transition-colors" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Monthly Budget (KSh)</label>
                <div className="flex gap-3">
                  <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : '')} className="w-1/2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold text-gray-900 outline-none focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all" />
                  <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')} className="w-1/2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold text-gray-900 outline-none focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all" />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 space-y-2">
                <details className="group [&_summary::-webkit-details-marker]:hidden bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                  <summary className="flex items-center justify-between w-full p-4 text-sm font-black text-gray-900 cursor-pointer list-none select-none hover:bg-gray-100 transition-colors">
                    <span>Bedrooms</span>
                    <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="p-4 pt-0 flex flex-wrap gap-2">
                    {['1', '2', '3', '4', '5+'].map(num => (
                      <button key={num} onClick={() => setBedrooms(bedrooms === num ? '' : num)} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${bedrooms === num ? 'bg-[#1f8898] text-white border-[#1f8898] shadow-sm shadow-[#1f8898]/20' : 'bg-white text-gray-600 border-gray-200 hover:border-[#1f8898]'}`}>
                        {num}
                      </button>
                    ))}
                  </div>
                </details>

                <details className="group [&_summary::-webkit-details-marker]:hidden bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                  <summary className="flex items-center justify-between w-full p-4 text-sm font-black text-gray-900 cursor-pointer list-none select-none hover:bg-gray-100 transition-colors">
                    <span>Bathrooms</span>
                    <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="p-4 pt-0 flex flex-wrap gap-2">
                    {['1', '2', '3', '4+'].map(num => (
                      <button key={num} onClick={() => setBathrooms(bathrooms === num ? '' : num)} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${bathrooms === num ? 'bg-[#1f8898] text-white border-[#1f8898] shadow-sm shadow-[#1f8898]/20' : 'bg-white text-gray-600 border-gray-200 hover:border-[#1f8898]'}`}>
                        {num}
                      </button>
                    ))}
                  </div>
                </details>

                <div className="pt-4 pb-2">
                  <h4 className="text-sm font-black text-gray-900 mb-3 px-1">Amenities</h4>
                  <div className="space-y-2">
                    {renderAmenityCategory("Nearby", AMENITIES_CATEGORIES.nearby)}
                    {renderAmenityCategory("Internal features", AMENITIES_CATEGORIES.internal)}
                    {renderAmenityCategory("External features", AMENITIES_CATEGORIES.external)}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded-md border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${hasVirtualTour ? 'bg-[#1f8898] border-[#1f8898]' : 'bg-gray-50 border-gray-200 group-hover:border-[#1f8898]'}`}>
                    {hasVirtualTour && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={hasVirtualTour} onChange={(e) => setHasVirtualTour(e.target.checked)} />
                  <span className="text-sm font-medium text-gray-600 select-none">Only show listings with virtual tours and video walkthroughs</span>
                </label>
              </div>

              <div className="lg:hidden mt-6 pt-6 border-t border-gray-100">
                {(searchTerm || locationFilter || minPrice || maxPrice || unitType || bedrooms || bathrooms || hasVirtualTour || selectedAmenities.length > 0) && (
                  <button onClick={clearFilters} className="w-full bg-rose-50 text-rose-600 hover:bg-rose-100 py-4 rounded-xl font-bold text-sm transition-colors border border-rose-100">
                    Reset All Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        </aside>
      </main>

      <section className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 pb-16">
        <div className="bg-white rounded-2xl md:rounded-[2rem] p-6 sm:p-10 border border-gray-100 shadow-sm">
          <SeoFaq 
            locationKey={locationFilter || "kenya"} 
            fallbackItems={[
              {
                question: `What are the average rental prices for houses and flats in ${locationFilter || "Kenya"}?`,
                answer: `Verified luxury townhouses, commercial spaces, and apartments for rent in ${locationFilter || "our target regions"} match premium local ledger parameters with transparent service fees.`
              }
            ]}
          />
        </div>
      </section>

      {/* --- REVISED PAYWALL (UNLOCK) MODAL --- */}
      {isModalOpen && selectedListing && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-md transition-opacity" onClick={closeUnlockModal}></div>

          <div className="relative w-full max-w-lg bg-[#ffffff] rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col border border-white/20">
            <button onClick={closeUnlockModal} className="absolute top-4 right-4 z-10 p-2 bg-white text-gray-400 hover:text-gray-900 shadow-sm border border-gray-100 hover:bg-gray-50 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>

            {unlockedUnits[selectedListing.id] ? (
              <div className="p-8 flex flex-col">
                <div className="bg-emerald-50 text-emerald-600 px-4 py-3 rounded-xl flex items-center gap-3 mb-6 border border-emerald-100">
                  <CheckCircle2 className="w-6 h-6 shrink-0" />
                  <div>
                    <p className="font-bold text-sm">Payment Successful!</p>
                    <p className="text-xs opacity-90">Listing details have been securely unlocked.</p>
                  </div>
                </div>

                <h3 className="text-2xl font-black text-gray-900 mb-1">{unlockedUnits[selectedListing.id].exact_name}</h3>
                <p className="text-sm font-bold text-gray-500 mb-6">Unit {selectedListing.unit_number}</p>

                <div className="space-y-4 mb-8">
                  <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-100 text-[#1f8898]"><Phone className="w-5 h-5" /></div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Landlord / Caretaker</p>
                        <p className="font-bold text-gray-900">{unlockedUnits[selectedListing.id].phone}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a href={`tel:${unlockedUnits[selectedListing.id].phone}`} className="w-10 h-10 bg-gray-900 text-white rounded-lg flex items-center justify-center hover:bg-[#1f8898] transition-colors"><Phone className="w-4 h-4" /></a>
                      <a href={getWhatsAppLink(unlockedUnits[selectedListing.id].phone, `Unit ${selectedListing.unit_number} at ${unlockedUnits[selectedListing.id].exact_name}`, selectedListing.id)} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-[#25D366] text-white rounded-lg flex items-center justify-center hover:bg-[#20bd5a] transition-colors"><MessageCircle className="w-4 h-4" /></a>
                    </div>
                  </div>

                  <div className="rounded-xl overflow-hidden h-48 border border-gray-200 relative bg-gray-100">
                    <iframe 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0 }} 
                      loading="lazy" 
                      allowFullScreen 
                      src={`https://maps.google.com/maps?q=${unlockedUnits[selectedListing.id].latitude},${unlockedUnits[selectedListing.id].longitude}&z=15&output=embed`}
                    ></iframe>
                  </div>
                </div>

                <button onClick={closeUnlockModal} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-3.5 rounded-xl transition-colors">
                  Close & Continue Browsing
                </button>
              </div>
            ) : (
              <div className="p-8 flex flex-col items-center">
                <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100 mb-5">
                  <LockKeyhole className="w-8 h-8 text-amber-500" />
                </div>
                
                <h3 className="text-2xl font-black text-gray-900 tracking-tight text-center leading-tight mb-2">
                  Unlock Premium Details
                </h3>
                <p className="text-sm font-medium text-gray-500 text-center mb-6">
                  Pay Ksh. 300 via M-Pesa to instantly view the exact building name, map coordinates, and landlord contact details for Unit {selectedListing.unit_number}.
                </p>

                {isWaitingForMpesa ? (
                  <div className="w-full flex flex-col items-center justify-center py-8 bg-gray-50 rounded-2xl border border-gray-100">
                    <Loader2 className="w-10 h-10 text-[#1f8898] animate-spin mb-4" />
                    <p className="font-bold text-gray-900">Awaiting M-Pesa Confirmation...</p>
                    <p className="text-xs text-gray-500 mt-2 text-center max-w-[200px]">Please enter your PIN on your phone to complete the transaction.</p>
                  </div>
                ) : (
                  <form onSubmit={handleUnlock} className="w-full space-y-4">
                    {submitStatus?.type === 'error' && (
                      <div className="bg-rose-50 text-rose-600 p-3 rounded-lg text-sm font-medium text-center border border-rose-100">
                        {submitStatus.text}
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">M-Pesa Number</label>
                      <div className="relative flex items-center w-full rounded-xl bg-white border border-gray-200 overflow-hidden focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-500/10 transition-all">
                        <div className="flex items-center gap-2 pl-4 pr-3 py-3.5 border-r border-gray-200 shrink-0 bg-gray-50">
                          <span className="text-sm font-bold text-gray-900">+254</span>
                        </div>
                        <input type="tel" required placeholder="712 345 678"
                          className="w-full px-4 py-3.5 bg-transparent outline-none font-bold text-sm text-gray-900 placeholder:text-gray-400 placeholder:font-medium"
                          value={unlockPhone} onChange={(e) => setUnlockPhone(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-4 rounded-xl font-black text-base transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 hover:-translate-y-0.5"
                      >
                        Pay Ksh. 300 & Unlock Now
                      </button>
                    </div>
                    
                    <p className="text-[10px] text-gray-400 text-center flex items-center justify-center gap-1 mt-4">
                      <CheckCircle2 className="w-3 h-3" /> Secure checkout powered by M-Pesa Express
                    </p>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- RESTORED CRM LEAD MODAL --- */}
      {isContactModalOpen && selectedListing && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-md transition-opacity" onClick={() => !isSubmittingLead && setIsContactModalOpen(false)}></div>

          <div className="relative w-full max-w-4xl bg-[#ffffff] rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:flex-row max-h-[95vh] border border-white/20">

            <button onClick={() => !isSubmittingLead && setIsContactModalOpen(false)} className="absolute top-4 right-4 z-10 p-2 bg-white text-gray-400 hover:text-gray-900 shadow-sm border border-gray-100 hover:bg-gray-50 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>

            <div className="hidden md:flex w-[40%] bg-gray-50 flex-col relative border-r border-gray-100 shrink-0">
              {selectedListing.images && selectedListing.images.length > 0 ? (
                <img src={selectedListing.images[0].url} alt="Property" className="h-64 w-full object-cover" />
              ) : (
                <div className="h-64 w-full bg-gradient-to-br from-[#1f8898]/10 to-[#0d393f]/20 flex items-center justify-center">
                  <Building2 className="w-12 h-12 text-[#1f8898]/30" />
                </div>
              )}
              <div className="p-8 flex flex-col flex-1">
                <div className="bg-[#ebf3f5] text-[#1f8898] text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg w-fit mb-4">Viewing Request</div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-tight mb-2">
                  Unit {selectedListing.unit_number}
                </h3>
                <p className="text-sm font-medium text-gray-500 mb-8">
                  {selectedListing ? (unlockedUnits[selectedListing.id] ? unlockedUnits[selectedListing.id].exact_name : "Premium Listing") : ''}
                </p>

                <div className="mt-auto">
                  <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-1">Monthly Rent</p>
                  <h4 className="text-3xl font-black text-[#1f8898] leading-none tracking-tight">
                    KSh {Number(selectedListing.rent_amount).toLocaleString()}
                  </h4>
                </div>
              </div>
            </div>

            <div className="w-full md:w-[60%] overflow-y-auto custom-scrollbar bg-white flex flex-col">
              <div className="relative pt-8 pb-4 px-6 flex flex-col items-center border-b border-gray-100 shrink-0 md:hidden">
                <div className="w-14 h-14 border-2 border-[#1f8898]/20 rounded-2xl flex items-center justify-center text-[#1f8898] mb-4 bg-white shadow-sm">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight text-center leading-tight">
                  {selectedListing ? (unlockedUnits[selectedListing.id] ? unlockedUnits[selectedListing.id].exact_name : "Premium Listing") : ''}
                </h3>
                <p className="text-sm font-medium text-gray-500 mt-1 text-center">
                  Inquire about Unit {selectedListing.unit_number}
                </p>
              </div>

              <div className="p-6 sm:p-10 flex-1">
                {leadSubmitStatus ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${leadSubmitStatus.type === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h4 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">{leadSubmitStatus.type === 'success' ? 'Request Sent!' : 'Error'}</h4>
                    <p className="text-gray-500 font-medium">{leadSubmitStatus.text}</p>
                  </div>
                ) : (
                  <form onSubmit={handleLeadSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <input type="text" required placeholder="Full name (required)"
                          className="w-full rounded-xl bg-white border border-gray-200 px-4 py-3.5 outline-none focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all font-medium text-sm text-gray-900 placeholder:text-gray-400"
                          value={leadFormData.prospect_name} onChange={(e) => setLeadFormData({ ...leadFormData, prospect_name: e.target.value })}
                        />
                      </div>
                      <div>
                        <input type="email" required placeholder="Your email (required)"
                          className="w-full rounded-xl bg-white border border-gray-200 px-4 py-3.5 outline-none focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all font-medium text-sm text-gray-900 placeholder:text-gray-400"
                          value={leadFormData.prospect_email} onChange={(e) => setLeadFormData({ ...leadFormData, prospect_email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="relative flex items-center w-full rounded-xl bg-white border border-gray-200 overflow-hidden focus-within:border-[#1f8898] focus-within:ring-4 focus-within:ring-[#1f8898]/10 transition-all">
                      <div className="flex items-center gap-2 pl-4 pr-3 py-3.5 border-r border-gray-200 shrink-0">
                        <span className="text-sm font-bold text-gray-900">KE</span>
                        <span className="text-sm font-bold text-gray-900">+254</span>
                      </div>
                      <input type="tel" required placeholder="Phone number (required)"
                        className="w-full px-4 py-3.5 bg-transparent outline-none font-medium text-sm text-gray-900 placeholder:text-gray-400"
                        value={leadFormData.prospect_phone} onChange={(e) => setLeadFormData({ ...leadFormData, prospect_phone: e.target.value })}
                      />
                    </div>

                    <div className="pt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Please enter your message <span className="text-gray-400">(required)</span></label>
                      <textarea required rows={4}
                        className="w-full rounded-xl bg-white border border-gray-200 px-4 py-3.5 outline-none focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all font-medium text-sm text-gray-900 resize-none"
                        value={leadFormData.message} onChange={(e) => setLeadFormData({ ...leadFormData, message: e.target.value })}
                      />
                    </div>

                    <div className="space-y-3 pt-4">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${leadFormData.agreeTerms ? 'bg-[#1f8898] border-[#1f8898]' : 'bg-white border-gray-300 group-hover:border-[#1f8898]'}`}>
                          {leadFormData.agreeTerms && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={leadFormData.agreeTerms} onChange={(e) => setLeadFormData({ ...leadFormData, agreeTerms: e.target.checked })} />
                        <span className="text-sm text-gray-600 font-medium leading-snug">
                          <span className="text-rose-500 font-black">*</span> I agree to MogiRentOS <Link href="/terms" className="text-[#1f8898] hover:underline">Terms & Conditions</Link> and <Link href="/privacy" className="text-[#1f8898] hover:underline">Privacy Policy</Link>.
                        </span>
                      </label>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isSubmittingLead || !leadFormData.agreeTerms}
                        className={`w-full py-3.5 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 ${leadFormData.agreeTerms && !isSubmittingLead
                            ? 'bg-[#1f8898] text-white shadow-xl shadow-[#1f8898]/20 hover:bg-[#156a77] hover:-translate-y-0.5'
                            : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                          }`}
                      >
                        {isSubmittingLead ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                        {isSubmittingLead ? 'Sending Request...' : 'Send Viewing Request'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- FULLSCREEN IMAGE GALLERY LIGHTBOX --- */}
      {galleryData && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-black/95 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="absolute top-0 left-0 right-0 z-50 p-4 sm:p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
            <div className="text-white/80 font-black tracking-widest text-sm bg-black/40 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10 pointer-events-auto">
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