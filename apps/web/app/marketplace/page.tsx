// apps/web/app/marketplace/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { 
  Search, MapPin, Building2, Phone, Home, Loader2, X, Send, 
  ArrowLeft, Heart, Camera, MessageCircle, SlidersHorizontal, 
  ChevronDown, ChevronRight, CheckCircle2, RotateCcw
} from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/Footer';

export default function PublicMarketplace() {
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // --- REAL FILTER STATES ---
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // --- LEAD CAPTURE MODAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [formData, setFormData] = useState({
    prospect_name: '',
    prospect_email: '',
    prospect_phone: '',
    message: ''
  });

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
  }, []);

  // Extract unique locations directly from the fetched database listings
  const uniqueLocations = Array.from(new Set(listings.map(l => l.property.address))).filter(Boolean);

  // --- ACTIVE FILTER LOGIC ---
  const filteredListings = listings.filter((listing) => {
    // 1. Keyword Search
    const searchString = `${listing.property.name} ${listing.property.address} ${listing.public_description}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());

    // 2. Price Range
    const rent = Number(listing.rent_amount);
    const matchesMinPrice = minPrice === '' || rent >= Number(minPrice);
    const matchesMaxPrice = maxPrice === '' || rent <= Number(maxPrice);

    // 3. Location Dropdown
    const matchesLocation = locationFilter === '' || listing.property.address === locationFilter;

    return matchesSearch && matchesMinPrice && matchesMaxPrice && matchesLocation;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setMinPrice('');
    setMaxPrice('');
  };

  const openContactModal = (listing: any) => {
    setSelectedListing(listing);
    setSubmitStatus(null);
    setFormData({
      prospect_name: '',
      prospect_email: '',
      prospect_phone: '',
      message: `Hi, I am interested in Unit ${listing.unit_number} at ${listing.property.name}. Please contact me with more details or to schedule a viewing.`
    });
    setIsModalOpen(true);
  };

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/marketplace/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unit_id: selectedListing.id,
          landlord_id: selectedListing.property.landlord.id,
          ...formData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to submit inquiry.');
      }

      setSubmitStatus({ type: 'success', text: 'Message sent successfully! The landlord will contact you soon.' });
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitStatus(null);
      }, 3000);
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

  return (
    <div className="min-h-screen bg-[#f8fafb] font-sans selection:bg-[#1f8898]/30 flex flex-col">
      
      {/* --- MOGIRENT BRANDED NAVBAR --- */}
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

      {/* --- BREADCRUMBS & HEADER --- */}
      <div className="bg-white border-b border-gray-100 py-4 px-4 sm:px-6 shadow-sm">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">
            <Home className="w-3.5 h-3.5" /> <ChevronRight className="w-3.5 h-3.5" /> 
            <span className="hover:text-[#1f8898] cursor-pointer">Rentals</span> <ChevronRight className="w-3.5 h-3.5" /> 
            <span className="text-[#1f8898]">Available Units</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Find your next perfect home.
          </h1>
        </div>
      </div>

      {/* --- MAIN TWO-COLUMN LAYOUT --- */}
      <main className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex flex-col lg:flex-row gap-8 flex-1">
        
        {/* --- LEFT COLUMN: LISTINGS --- */}
        <div className="w-full lg:w-2/3 flex flex-col">
          
          {/* Action Bar */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm font-bold text-gray-500 hidden sm:block">
              Showing {filteredListings.length} {filteredListings.length === 1 ? 'Property' : 'Properties'}
            </p>
            
            {/* Mobile Filter Button */}
            <button 
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold text-gray-700 shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#1f8898]" /> Filters
            </button>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold text-gray-700 shadow-sm">
                Newest First <ChevronDown className="w-4 h-4 text-[#1f8898]" />
              </div>
            </div>
          </div>

          {/* Listings Container */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 text-[#1f8898] bg-white rounded-3xl border border-gray-100 shadow-sm">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="font-bold text-sm tracking-widest uppercase text-gray-400">Loading Properties...</p>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-black text-gray-900 mb-2">No properties found</h3>
              <p className="text-sm text-gray-500 mb-6">Try adjusting your filters or search terms.</p>
              <button onClick={clearFilters} className="bg-[#ebf3f5] text-[#1f8898] hover:bg-[#1f8898] hover:text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {filteredListings.map((listing) => (
                // HORIZONTAL CARD DESIGN
                <div key={listing.id} className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-[#1f8898]/30 transition-all duration-300 flex flex-col sm:flex-row group">
                  
                  {/* Card Left: Image Gallery Split */}
                  <div className="w-full sm:w-[320px] h-[240px] sm:h-auto flex flex-col relative shrink-0">
                    <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-sm text-[#1f8898] px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider shadow-sm">
                       Verified
                    </div>
                    
                    {/* Main Cover Image Placeholder */}
                    <div className="flex-1 bg-gray-100 relative overflow-hidden group-hover:opacity-90 transition-opacity cursor-pointer border-b border-gray-100 sm:border-b-0 sm:border-r">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#1f8898]/10 to-[#0d393f]/20 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                        <Building2 className="w-12 h-12 text-[#1f8898]/30" />
                      </div>
                      <div className="absolute bottom-3 left-3 bg-gray-900/70 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1.5 shadow-sm">
                        <Camera className="w-3 h-3" /> Virtual Tour Available
                      </div>
                    </div>
                  </div>

                  {/* Card Right: Content Details */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <h3 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight group-hover:text-[#1f8898] cursor-pointer transition-colors">
                        Unit {listing.unit_number} at {listing.property.name}
                      </h3>
                    </div>
                    
                    <p className="text-sm font-medium text-gray-500 flex items-center gap-1.5 mb-4">
                      <MapPin className="w-4 h-4 text-gray-400" /> {listing.property.address}
                    </p>

                    {/* Metric Pills */}
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

                    {/* Price and Actions Row */}
                    <div className="mt-auto pt-4 border-t border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-0.5">Monthly Rent</p>
                        <h4 className="text-2xl font-black text-[#1f8898] leading-none">
                          KSh {Number(listing.rent_amount).toLocaleString()}
                        </h4>
                      </div>
                      
                      <div className="flex gap-2.5">
                        <a href={`tel:${listing.property.landlord.contact_phone}`} className="w-10 h-10 rounded-xl border border-gray-200 text-gray-500 flex items-center justify-center hover:border-[#1f8898] hover:text-[#1f8898] hover:bg-[#ebf3f5] transition-all shadow-sm" title="Call Landlord">
                          <Phone className="w-4 h-4" />
                        </a>
                        <a href={getWhatsAppLink(listing.property.landlord.contact_phone, `Unit ${listing.unit_number} at ${listing.property.name}`)} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl border border-gray-200 text-[#25D366] flex items-center justify-center hover:border-[#25D366] hover:bg-[#25D366]/10 transition-all shadow-sm" title="WhatsApp">
                           <MessageCircle className="w-5 h-5" />
                        </a>
                        <button onClick={() => openContactModal(listing)} className="flex items-center gap-2 bg-[#0d393f] hover:bg-[#0a2c31] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm">
                          <Send className="w-4 h-4" /> Contact
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- RIGHT COLUMN: ACTIVE FILTERS --- */}
        <aside className={`w-full lg:w-1/3 flex-col gap-6 ${showMobileFilters ? 'flex' : 'hidden lg:flex'}`}>
          <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 sticky top-24 shadow-xl shadow-black/5">
            
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-gray-900 tracking-tight">Filter Properties</h3>
              {(searchTerm || locationFilter || minPrice || maxPrice) && (
                <button onClick={clearFilters} className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 transition-colors">
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              )}
            </div>

            <div className="space-y-5">
              {/* Filter: Search Keyword */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Search Keyword</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="e.g. Ruiru, Balcony..." 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-gray-900 outline-none focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Filter: Location (Dynamic from Data) */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-gray-900 outline-none focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all appearance-none cursor-pointer"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                  >
                    <option value="">All Locations</option>
                    {uniqueLocations.map(loc => (
                      <option key={loc as string} value={loc as string}>{loc as string}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Filter: Price Range */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Monthly Budget (KSh)</label>
                <div className="flex gap-3">
                  <input 
                    type="number" 
                    placeholder="Min" 
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-1/2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 outline-none focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all" 
                  />
                  <input 
                    type="number" 
                    placeholder="Max" 
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-1/2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 outline-none focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all" 
                  />
                </div>
              </div>

              <div className="pt-4">
                 <button 
                  onClick={() => setShowMobileFilters(false)} 
                  className="w-full bg-[#1f8898] hover:bg-[#156a77] text-white py-3.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-[#1f8898]/20 flex justify-center items-center gap-2"
                 >
                   <Search className="w-4 h-4" /> Show {filteredListings.length} Results
                 </button>
              </div>
            </div>
          </div>
        </aside>

      </main>

      {/* --- LEAD CAPTURE MODAL --- */}
      {isModalOpen && selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => !isSubmitting && setIsModalOpen(false)}></div>

          <div className="relative w-full max-w-lg bg-[#ffffff] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 flex flex-col max-h-[85vh]">
            
            <div className="bg-[#f8fafb] px-6 py-5 border-b border-gray-100 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-lg font-black text-gray-900 tracking-tight">Contact Landlord</h3>
                <p className="text-xs font-medium text-gray-500">Inquire about Unit {selectedListing.unit_number} at {selectedListing.property.name}</p>
              </div>
              <button onClick={() => !isSubmitting && setIsModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 custom-scrollbar flex-1">
              {submitStatus ? (
                <div className={`p-6 rounded-2xl text-center border ${submitStatus.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                  <CheckCircle2 className={`w-12 h-12 mx-auto mb-4 ${submitStatus.type === 'success' ? 'text-emerald-500' : 'text-rose-500 hidden'}`} />
                  <p className="font-bold text-base">{submitStatus.text}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitLead} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1.5 ml-1">Your Name</label>
                      <input type="text" required placeholder="John Doe"
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-gray-50 font-medium text-sm"
                        value={formData.prospect_name} onChange={(e) => setFormData({...formData, prospect_name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1.5 ml-1">Phone Number</label>
                      <input type="tel" required placeholder="0712345678"
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-gray-50 font-medium text-sm"
                        value={formData.prospect_phone} onChange={(e) => setFormData({...formData, prospect_phone: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1.5 ml-1">Email Address</label>
                    <input type="email" required placeholder="john@example.com"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-gray-50 font-medium text-sm"
                      value={formData.prospect_email} onChange={(e) => setFormData({...formData, prospect_email: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1.5 ml-1">Message</label>
                    <textarea required rows={4}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-gray-50 font-medium text-sm resize-none"
                      value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})}
                    />
                  </div>

                  <div className="pt-4 flex justify-end gap-3 mt-6 border-t border-gray-100">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 text-sm font-bold text-[#ffffff] bg-[#1f8898] hover:bg-[#1a7684] rounded-xl transition-all shadow-lg shadow-[#1f8898]/20 disabled:opacity-50 flex items-center gap-2 active:scale-95">
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      {isSubmitting ? 'Sending...' : 'Send Request'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- CORPORATE FOOTER --- */}
      <Footer />

    </div>
  );
}