// apps/web/app/marketplace/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Search, MapPin, Building2, CheckCircle2, Phone, Home, Loader2, X, Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/Footer';

export default function PublicMarketplace() {
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredListings = listings.filter((listing) => {
    const searchString = `${listing.property.name} ${listing.property.address} ${listing.public_description}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

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

  return (
    <div className="min-h-screen bg-[#f8fafb] font-sans selection:bg-[#1f8898]/30 flex flex-col">
      
      {/* --- MOBILE-OPTIMIZED NAVBAR --- */}
      <nav className="bg-white border-b border-gray-100 py-3 sm:py-4 px-4 sm:px-6 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">
          
          <Link href="/marketplace" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#1f8898] rounded-lg flex items-center justify-center text-white shadow-md">
              <Home className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            {/* Reduced text size on mobile to prevent wrapping */}
            <span className="text-lg sm:text-xl font-black text-gray-900 tracking-tight leading-none hidden sm:block">
              Mogi<span className="text-[#1f8898]">Rent</span> Marketplace
            </span>
            <span className="text-[17px] font-black text-gray-900 tracking-tight leading-none sm:hidden">
              Mogi<span className="text-[#1f8898]">Rent</span>
            </span>
          </Link>
          
          <div className="flex items-center gap-3 sm:gap-6 shrink-0">
            <Link href="/" className="text-xs sm:text-sm font-bold text-gray-500 hover:text-[#1f8898] transition-colors hidden md:flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <Link href="/pricing" className="text-xs sm:text-sm font-bold text-gray-500 hover:text-[#1f8898] transition-colors hidden lg:block">
              Pricing
            </Link>
            
            <div className="h-4 w-px bg-gray-200 hidden md:block"></div>
            
            {/* Turned Login into a contained button so it looks great on mobile */}
            <Link href="/login" className="text-xs sm:text-sm font-bold text-[#1f8898] bg-[#1f8898]/10 hover:bg-[#1f8898]/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap">
              Landlord Login <ArrowLeft className="w-3 h-3 rotate-180 hidden sm:block" />
            </Link>
          </div>
        </div>
      </nav>

      {/* --- MOBILE-OPTIMIZED HERO SECTION --- */}
      <div className="bg-[#0d393f] relative overflow-hidden py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="max-w-3xl mx-auto relative z-10 text-center">
          
          {/* Scaled text for different viewports */}
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white tracking-tight mb-4 sm:mb-6 leading-tight">
            Find your next perfect <span className="text-[#48c9dc]">home.</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-white/70 mb-8 sm:mb-10 font-medium px-2">
            Browse verified listings directly from premium property managers and landlords across the country.
          </p>

          {/* Adjusted Search Bar with Button */}
          <div className="bg-white p-1.5 sm:p-2 rounded-2xl flex items-center shadow-2xl max-w-2xl mx-auto border border-white/20 focus-within:ring-4 focus-within:ring-[#48c9dc]/30 transition-all">
            <div className="pl-3 sm:pl-4 text-gray-400 hidden sm:block"><Search className="w-4 h-4 sm:w-5 sm:h-5" /></div>
            <input 
              type="text" 
              placeholder="Search areas, keywords..." 
              className="w-full bg-transparent border-none px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 font-medium outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {/* Brought back the search button, styled for mobile fit */}
            <button className="bg-[#1f8898] hover:bg-[#156a77] text-white px-4 sm:px-8 py-2 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-colors shrink-0 shadow-md">
              Search
            </button>
          </div>

        </div>
      </div>

      {/* --- LISTINGS GRID --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 flex-1 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 sm:mb-8 gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Available Units</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">{filteredListings.length} properties matching your criteria</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#1f8898]">
            <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin mb-4" />
            <p className="font-bold text-xs sm:text-sm tracking-widest uppercase text-gray-400">Loading Listings...</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-16 sm:py-20 bg-white rounded-3xl border border-dashed border-gray-200 px-4">
            <Building2 className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-2">No listings found</h3>
            <p className="text-sm text-gray-500">We couldn't find any vacant units matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredListings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-[#1f8898]/30 transition-all duration-300 group flex flex-col">
                <div className="h-40 sm:h-48 bg-gray-100 relative overflow-hidden border-b border-gray-100">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1f8898]/10 to-[#0d393f]/20 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                    <Building2 className="w-10 h-10 sm:w-12 sm:h-12 text-[#1f8898]/40" />
                  </div>
                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-white/95 backdrop-blur text-[#1f8898] text-[10px] sm:text-xs font-black px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg uppercase tracking-wider shadow-sm">
                    Unit {listing.unit_number}
                  </div>
                </div>

                <div className="p-5 sm:p-6 flex-1 flex flex-col">
                  <div className="mb-4">
                    <h3 className="text-xl sm:text-2xl font-black text-[#1f8898] mb-1">
                      KSH {Number(listing.rent_amount).toLocaleString()} <span className="text-xs sm:text-sm text-gray-400 font-medium">/ month</span>
                    </h3>
                    <h4 className="text-base sm:text-lg font-bold text-gray-900 truncate">{listing.property.name}</h4>
                    <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" /> <span className="truncate">{listing.property.address}</span>
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-5 sm:mb-6 flex-1">
                    {listing.public_description || "A beautiful unit ready for immediate occupation. Contact the landlord for more details."}
                  </p>

                  {listing.amenities && listing.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-5 sm:mb-6">
                      {listing.amenities.slice(0, 3).map((amenity: string, idx: number) => (
                        <span key={idx} className="bg-[#ebf3f5] text-[#1f8898] text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {amenity}
                        </span>
                      ))}
                      {listing.amenities.length > 3 && <span className="text-[10px] sm:text-xs text-gray-400 font-bold self-center">+{listing.amenities.length - 3} more</span>}
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                    <div className="overflow-hidden pr-2">
                      <p className="text-[9px] sm:text-[10px] uppercase tracking-widest font-black text-gray-400 mb-0.5">Listed By</p>
                      <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">{listing.property.landlord.company_name}</p>
                    </div>
                    
                    <button 
                      onClick={() => openContactModal(listing)}
                      className="bg-[#1f8898] hover:bg-[#156a77] text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-colors flex items-center gap-1.5 sm:gap-2 shrink-0 active:scale-95"
                    >
                      <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Contact
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* --- LEAD CAPTURE MODAL --- */}
      {isModalOpen && selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => !isSubmitting && setIsModalOpen(false)}></div>

          {/* Adjusted modal height/overflow for smaller phones */}
          <div className="relative w-full max-w-lg bg-[#ffffff] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 flex flex-col max-h-[85vh]">
            
            <div className="bg-[#f8fafb] px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 flex justify-between items-center shrink-0">
              <div className="pr-2">
                <h3 className="text-base sm:text-lg font-black text-gray-900 tracking-tight">Contact Landlord</h3>
                <p className="text-[10px] sm:text-xs font-medium text-gray-500 truncate">Unit {selectedListing.unit_number} @ {selectedListing.property.name}</p>
              </div>
              <button onClick={() => !isSubmitting && setIsModalOpen(false)} className="p-1.5 sm:p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-full transition-colors shrink-0">
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-4 sm:p-6 custom-scrollbar flex-1">
              {submitStatus ? (
                <div className={`p-4 sm:p-6 rounded-2xl text-center border ${submitStatus.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                  <CheckCircle2 className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 ${submitStatus.type === 'success' ? 'text-emerald-500' : 'text-rose-500 hidden'}`} />
                  <p className="font-bold text-sm sm:text-base">{submitStatus.text}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitLead} className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1 sm:mb-1.5 ml-1">Your Name</label>
                      <input type="text" required placeholder="John Doe"
                        className="w-full rounded-xl border border-gray-200 px-3 sm:px-4 py-2.5 sm:py-3 outline-none focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-gray-50 font-medium text-sm"
                        value={formData.prospect_name} onChange={(e) => setFormData({...formData, prospect_name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1 sm:mb-1.5 ml-1">Phone Number</label>
                      <input type="tel" required placeholder="0712345678"
                        className="w-full rounded-xl border border-gray-200 px-3 sm:px-4 py-2.5 sm:py-3 outline-none focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-gray-50 font-medium text-sm"
                        value={formData.prospect_phone} onChange={(e) => setFormData({...formData, prospect_phone: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1 sm:mb-1.5 ml-1">Email Address</label>
                    <input type="email" required placeholder="john@example.com"
                      className="w-full rounded-xl border border-gray-200 px-3 sm:px-4 py-2.5 sm:py-3 outline-none focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-gray-50 font-medium text-sm"
                      value={formData.prospect_email} onChange={(e) => setFormData({...formData, prospect_email: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1 sm:mb-1.5 ml-1">Message</label>
                    <textarea required rows={3}
                      className="w-full rounded-xl border border-gray-200 px-3 sm:px-4 py-2.5 sm:py-3 outline-none focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-gray-50 font-medium text-sm resize-none"
                      value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})}
                    />
                  </div>

                  <div className="pt-3 sm:pt-4 border-t border-gray-100 flex justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-[#ffffff] bg-[#1f8898] hover:bg-[#1a7684] rounded-xl transition-all shadow-lg shadow-[#1f8898]/20 disabled:opacity-50 flex items-center gap-2 active:scale-95">
                      {isSubmitting ? <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" /> : <Send className="w-3 h-3 sm:w-4 sm:h-4" />}
                      {isSubmitting ? 'Sending...' : 'Send Inquiry'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- PREMIUM FOOTER --- */}
      <Footer />

    </div>
  );
}