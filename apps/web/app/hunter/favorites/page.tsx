// apps/web/app/hunter/favorites/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Heart, Loader2, MapPin, Building2, BedDouble,Sparkles,
  Bath, CheckCircle2, LockKeyhole, ArrowRight, Trash2,
  Star, GitCompare, Grid, List, Phone, MessageCircle,
  ExternalLink, TrendingDown, CheckSquare, Square, X,
  Search, SlidersHorizontal, Check
} from 'lucide-react';
import { toast } from 'sonner';

export default function HunterFavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [shortlist, setShortlist] = useState<any[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // View & Interaction States
  const [activeTab, setActiveTab] = useState<'FAVORITES' | 'SHORTLIST'>('FAVORITES');
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
  const [sortBy, setSortBy] = useState<'RECENT' | 'PRICE_ASC' | 'PRICE_DESC' | 'MATCH'>('RECENT');
  
  // Bulk Actions & Comparison
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [selectedToCompare, setSelectedToCompare] = useState<Set<string>>(new Set());
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  useEffect(() => {
    const loadWorkspaceData = async () => {
      try {
        const savedFavIds = JSON.parse(localStorage.getItem('mogi_favorites') || '[]');
        
        const [listingsRes, dashRes, shortlistRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/marketplace/listings`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/hunter/dashboard`, { credentials: 'include' }).catch(() => null),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/hunter/shortlist`, { credentials: 'include' }).catch(() => null)
        ]);

        let allListings: any[] = [];
        if (listingsRes.ok) {
          const json = await listingsRes.json();
          allListings = json.data || [];
        }

        let dashUnlocked = new Set<string>();
        let userInquiries: any[] = [];
        if (dashRes && dashRes.ok) {
          const dashJson = await dashRes.json();
          dashUnlocked = new Set<string>((dashJson.unlocked_properties || []).map((u: any) => u.unit.id));
          setUnlockedIds(dashUnlocked);
          userInquiries = dashJson.inquiries || [];
          setInquiries(userInquiries);
        }

        // Calculate Primary Interest Area for Match Scoring
        const interestedLocations = new Set<string>();
        userInquiries.forEach((inq: any) => {
          if (inq.unit?.property?.address) interestedLocations.add(inq.unit.property.address);
        });
        const primaryArea = interestedLocations.size > 0 ? Array.from(interestedLocations)[0] : "Nairobi";

        // Score all listings
        const scoredListings = allListings.map(listing => {
          let score = 40;
          const reasons: string[] = [];
          if (listing.property?.address === primaryArea) { score += 35; reasons.push(`In ${primaryArea}`); }
          if (listing.images?.length >= 3) score += 15;
          if (listing.amenities?.length > 0) { score += 10; reasons.push('Premium amenities'); }
          if (listing.virtual_tour_url) { score += 5; reasons.push('Virtual tour'); }
          return { ...listing, matchScore: Math.min(score, 99), matchReasons: reasons };
        });

        // Filter Favorites
        const matchedFavorites = scoredListings.filter((listing: any) => savedFavIds.includes(listing.id));
        setFavorites(matchedFavorites);

        // Filter Shortlist (Fallback to localStorage if API fails)
        if (shortlistRes && shortlistRes.ok) {
          const slJson = await shortlistRes.json();
          // Assuming API returns an array of records with a 'unit' object
          const slListings = slJson.map((sl: any) => {
             const matched = scoredListings.find(l => l.id === sl.unit_id || l.id === sl.unit?.id);
             return matched ? { ...matched, shortlistNotes: sl.notes } : null;
          }).filter(Boolean);
          setShortlist(slListings);
        } else {
          const savedShortIds = JSON.parse(localStorage.getItem('mogi_shortlist_ids') || '[]');
          const slListings = scoredListings.filter((listing: any) => savedShortIds.includes(listing.id));
          setShortlist(slListings);
        }

      } catch (error) {
        console.error("Failed to load workspace data", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadWorkspaceData();
  }, []);

  // --- ACTIONS ---

  const removeFavorite = (e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation();
    const updatedFavorites = favorites.filter(f => f.id !== id);
    setFavorites(updatedFavorites);
    const newSavedIds = updatedFavorites.map(f => f.id);
    localStorage.setItem('mogi_favorites', JSON.stringify(newSavedIds));
    toast.success('Removed from favorites', { position: 'bottom-right' });
    
    // Also remove from comparison if selected
    if (selectedToCompare.has(id)) {
      const newCompare = new Set(selectedToCompare);
      newCompare.delete(id);
      setSelectedToCompare(newCompare);
    }
  };

  const toggleShortlist = async (e: React.MouseEvent, listing: any) => {
    e.preventDefault(); e.stopPropagation();
    const isCurrentlyShortlisted = shortlist.some(s => s.id === listing.id);

    try {
      if (isCurrentlyShortlisted) {
        // Remove from Shortlist
        const updated = shortlist.filter(s => s.id !== listing.id);
        setShortlist(updated);
        localStorage.setItem('mogi_shortlist_ids', JSON.stringify(updated.map(s => s.id)));
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hunter/shortlist/${listing.id}`, { method: 'DELETE', credentials: 'include' }).catch(() => {});
        toast.success('Removed from shortlist');
      } else {
        // Add to Shortlist
        const updated = [listing, ...shortlist];
        setShortlist(updated);
        localStorage.setItem('mogi_shortlist_ids', JSON.stringify(updated.map(s => s.id)));
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hunter/shortlist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ unit_id: listing.id })
        }).catch(() => {});
        toast.success('Added to shortlist! Ready for comparison.');
      }
    } catch (err) {
      toast.error('Could not update shortlist.');
    }
  };

  const toggleCompareSelection = (e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation();
    const newSet = new Set(selectedToCompare);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      if (newSet.size >= 5) {
        return toast.error("You can only compare up to 5 properties at once.");
      }
      newSet.add(id);
    }
    setSelectedToCompare(newSet);
  };

  const getWhatsAppLink = (phone: string, unitStr: string, id: string) => {
    let cleanPhone = phone?.replace(/\D/g, '') || '';
    if (cleanPhone.startsWith('0')) cleanPhone = '254' + cleanPhone.substring(1);
    const listingUrl = `${window.location.origin}/marketplace?id=${id}`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hi, I'm reaching out regarding Unit ${unitStr} listed on MogiRentOS.\n\nLink: ${listingUrl}`)}`;
  };

  // --- DERIVED STATE ---

  const displayedListings = activeTab === 'FAVORITES' ? favorites : shortlist;
  
  const sortedListings = useMemo(() => {
    const arr = [...displayedListings];
    switch (sortBy) {
      case 'PRICE_ASC': return arr.sort((a, b) => Number(a.rent_amount) - Number(b.rent_amount));
      case 'PRICE_DESC': return arr.sort((a, b) => Number(b.rent_amount) - Number(a.rent_amount));
      case 'MATCH': return arr.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      case 'RECENT':
      default: return arr; // Preserving chronological order of addition
    }
  }, [displayedListings, sortBy]);

  const propertiesToCompare = useMemo(() => {
    const all = [...favorites, ...shortlist];
    return all.filter(p => selectedToCompare.has(p.id));
  }, [selectedToCompare, favorites, shortlist]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[600px]">
        <Loader2 className="w-10 h-10 animate-spin text-[#1f8898] mb-4" />
        <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Loading Workspace...</p>
      </div>
    );
  }

  return (
    <div className="pb-32 bg-[#f8fafb] min-h-screen font-sans selection:bg-[#1f8898]/30 relative">
      
      {/* --- HEADER --- */}
      <div className="bg-[#0d393f] px-6 sm:px-10 pt-8 pb-24 relative overflow-hidden shadow-inner border-b border-[#0a2c31]">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#1f8898] rounded-full blur-[100px] opacity-20 -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-[#ffffff] tracking-tight mb-2">
                Property Workspace
              </h1>
              <p className="text-teal-50/80 text-sm md:text-base font-medium max-w-xl">
                Compare, shortlist, and contact landlords for your favorite homes.
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-3">
              <Link href="/hunter/settings" className="bg-white/10 text-white border border-white/20 hover:bg-white/20 px-5 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 backdrop-blur-sm active:scale-95">
                Alert Settings
              </Link>
              <Link href="/marketplace" className="bg-[#1f8898] text-white hover:bg-[#48c9dc] px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-black/20 flex items-center gap-2 active:scale-95">
                Explore Market
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex-1 min-w-[150px]">
              <p className="text-[10px] font-black uppercase tracking-widest text-teal-100/60 mb-1">Saved</p>
              <p className="text-2xl font-black text-white flex items-center gap-2"><Heart className="w-5 h-5 text-rose-400 fill-rose-400" /> {favorites.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex-1 min-w-[150px]">
              <p className="text-[10px] font-black uppercase tracking-widest text-teal-100/60 mb-1">Shortlisted</p>
              <p className="text-2xl font-black text-white flex items-center gap-2"><Star className="w-5 h-5 text-amber-400 fill-amber-400" /> {shortlist.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex-1 min-w-[150px]">
              <p className="text-[10px] font-black uppercase tracking-widest text-teal-100/60 mb-1">Unlocked Contacts</p>
              <p className="text-2xl font-black text-white flex items-center gap-2"><LockKeyhole className="w-5 h-5 text-emerald-400" /> {unlockedIds.size}</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- WORKSPACE CONTROLS --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Tabs */}
          <div className="flex bg-gray-50 p-1.5 rounded-xl self-start sm:self-auto">
            <button 
              onClick={() => setActiveTab('FAVORITES')}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'FAVORITES' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Heart className={`w-4 h-4 ${activeTab === 'FAVORITES' ? 'text-rose-500' : ''}`} /> Favorites
            </button>
            <button 
              onClick={() => setActiveTab('SHORTLIST')}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'SHORTLIST' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Star className={`w-4 h-4 ${activeTab === 'SHORTLIST' ? 'text-amber-500' : ''}`} /> Shortlist
            </button>
          </div>

          {/* View Toggles & Sorting */}
          <div className="flex flex-wrap items-center gap-3">
            {displayedListings.length > 0 && (
              <button 
                onClick={() => setIsCompareMode(!isCompareMode)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border ${isCompareMode ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
              >
                <GitCompare className="w-4 h-4" /> {isCompareMode ? 'Cancel Compare' : 'Select to Compare'}
              </button>
            )}

            <div className="relative group shrink-0 hidden sm:block">
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as any)} 
                className="appearance-none bg-white border border-gray-200 pl-4 pr-10 py-2.5 rounded-xl text-sm font-bold text-gray-700 shadow-sm outline-none focus:border-[#1f8898] cursor-pointer hover:bg-gray-50 transition-all"
              >
                <option value="RECENT">Recently Saved</option>
                <option value="MATCH">Best Match Score</option>
                <option value="PRICE_ASC">Price: Low to High</option>
                <option value="PRICE_DESC">Price: High to Low</option>
              </select>
            </div>

            <div className="flex bg-gray-50 border border-gray-200 rounded-xl overflow-hidden shrink-0">
              <button onClick={() => setViewMode('GRID')} className={`p-2.5 transition-colors ${viewMode === 'GRID' ? 'bg-white text-[#1f8898] shadow-sm' : 'text-gray-400 hover:text-gray-700'}`} title="Grid View">
                <Grid className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('LIST')} className={`p-2.5 transition-colors ${viewMode === 'LIST' ? 'bg-white text-[#1f8898] shadow-sm' : 'text-gray-400 hover:text-gray-700'}`} title="List View">
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {displayedListings.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-dashed border-gray-200 p-12 text-center flex flex-col items-center shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-5">
              {activeTab === 'FAVORITES' ? <Heart className="w-10 h-10 text-gray-300" /> : <Star className="w-10 h-10 text-gray-300" />}
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">
              {activeTab === 'FAVORITES' ? 'No favorites saved yet' : 'Your shortlist is empty'}
            </h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
              {activeTab === 'FAVORITES' 
                ? 'Explore the marketplace and click the heart icon on properties you like to save them here.' 
                : 'Move your favorite properties here when you are seriously considering them to easily compare features side-by-side.'}
            </p>
            <Link href="/marketplace" className="bg-[#1f8898] hover:bg-[#156a77] text-white px-8 py-3.5 rounded-xl font-bold shadow-md transition-all active:scale-95 flex items-center gap-2">
              Explore Marketplace <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className={viewMode === 'GRID' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-6"}>
            {sortedListings.map((listing) => {
              const isUnlocked = unlockedIds.has(listing.id);
              const isShortlisted = shortlist.some(s => s.id === listing.id);
              const isSelected = selectedToCompare.has(listing.id);

              return (
                <div 
                  key={listing.id} 
                  className={`bg-white rounded-3xl border ${isSelected ? 'border-indigo-400 shadow-md ring-4 ring-indigo-50' : 'border-gray-100 shadow-sm'} overflow-hidden group hover:shadow-xl transition-all duration-300 flex ${viewMode === 'GRID' ? 'flex-col' : 'flex-col sm:flex-row'} relative`}
                >
                  {/* Select for Compare Overlay */}
                  {isCompareMode && (
                    <button 
                      onClick={(e) => toggleCompareSelection(e, listing.id)}
                      className="absolute inset-0 z-20 bg-black/5 hover:bg-black/10 transition-colors flex items-start justify-end p-4 cursor-pointer"
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-white shadow-md border-2 transition-colors ${isSelected ? 'border-indigo-500 text-indigo-500' : 'border-gray-200 text-gray-300'}`}>
                        {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                      </div>
                    </button>
                  )}

                  {/* Image Section */}
                  <Link href={`/marketplace?id=${listing.id}`} className={`${viewMode === 'GRID' ? 'h-56' : 'h-56 sm:h-auto sm:w-64 shrink-0'} bg-gray-100 relative overflow-hidden block`}>
                    {listing.images && listing.images.length > 0 ? (
                      <img src={listing.images[0].url} alt="Property" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#ebf3f5]">
                        <Building2 className="w-10 h-10 text-[#1f8898]/30" />
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                      {isUnlocked ? (
                        <div className="bg-emerald-500 text-white px-2 py-1 rounded border border-emerald-400 text-[9px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> Unlocked
                        </div>
                      ) : (
                        <div className="bg-white/90 text-gray-900 px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 w-fit">
                          <LockKeyhole className="w-3 h-3 text-amber-500" /> Premium
                        </div>
                      )}
                      
                      {listing.matchScore > 75 && (
                        <div className="bg-indigo-500 text-white px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 w-fit">
                          <Sparkles className="w-3 h-3" /> {listing.matchScore}% Match
                        </div>
                      )}
                      
                      {/* Simulated Price Drop */}
                      {listing.rent_amount < 35000 && (
                        <div className="bg-rose-500 text-white px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 w-fit">
                           <TrendingDown className="w-3 h-3" /> Price Drop
                        </div>
                      )}
                    </div>
                    
                    {/* Remove Action (Only shown when not in compare mode) */}
                    {!isCompareMode && activeTab === 'FAVORITES' && (
                      <button 
                        onClick={(e) => removeFavorite(e, listing.id)}
                        className="absolute top-3 right-3 p-2.5 bg-white/90 hover:bg-rose-50 backdrop-blur-md rounded-full shadow-sm transition-all hover:scale-110 border border-white z-10"
                        title="Remove from favorites"
                      >
                        <Trash2 className="w-4 h-4 text-rose-500" />
                      </button>
                    )}
                  </Link>

                  {/* Details Section */}
                  <div className="p-5 flex flex-col flex-1 z-10 bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <Link href={`/marketplace?id=${listing.id}`} className="hover:text-[#1f8898] transition-colors">
                        <h3 className="text-xl font-black text-gray-900 truncate pr-2">
                          Unit {listing.unit_number} <span className="text-gray-300 font-normal mx-1">•</span> {listing.property?.name || 'Property'}
                        </h3>
                      </Link>
                    </div>

                    <p className="text-xs font-bold text-gray-500 flex items-center gap-1.5 mb-4 truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#1f8898]" /> {listing.property?.address} Area
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4 text-sm font-bold text-gray-700">
                      <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100 text-xs">
                        <Building2 className="w-3.5 h-3.5 text-gray-400" /> {listing.unit_type?.replace('_', ' ')}
                      </div>
                      {listing.bedrooms !== null && (
                        <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100 text-xs">
                          <BedDouble className="w-3.5 h-3.5 text-gray-400" /> {listing.bedrooms} Beds
                        </div>
                      )}
                      {listing.bathrooms !== null && (
                        <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100 text-xs">
                          <Bath className="w-3.5 h-3.5 text-gray-400" /> {listing.bathrooms} Baths
                        </div>
                      )}
                    </div>

                    {/* Why it matches */}
                    {listing.matchReasons && listing.matchReasons.length > 0 && (
                      <div className="mb-4 bg-[#ebf3f5]/50 border border-[#1f8898]/10 rounded-xl p-3">
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#1f8898] mb-1.5">Why this matches</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                          {listing.matchReasons.slice(0,3).map((reason: string, idx: number) => (
                            <span key={idx} className="text-[10px] text-gray-600 font-bold flex items-center gap-1">
                              <Check className="w-3 h-3 text-[#1f8898]" /> {reason}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-[9px] uppercase tracking-widest font-black text-gray-400 mb-0.5">Monthly Rent</p>
                        <p className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#1f8898] to-gray-900 leading-none">
                          KSh {Number(listing.rent_amount).toLocaleString()}
                        </p>
                      </div>
                      
                      {!isCompareMode && (
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => toggleShortlist(e, listing)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border ${isShortlisted ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                          >
                            <Star className={`w-3.5 h-3.5 ${isShortlisted ? 'fill-amber-500 text-amber-500' : ''}`} /> 
                            {isShortlisted ? 'Shortlisted' : 'Shortlist'}
                          </button>
                          
                          {isUnlocked ? (
                            <a 
                              href={getWhatsAppLink(listing.property?.landlord?.contact_phone, listing.unit_number, listing.id)} 
                              target="_blank" rel="noopener noreferrer"
                              className="bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#25D366]/20 flex items-center gap-1.5"
                            >
                              <MessageCircle className="w-3.5 h-3.5" /> Contact
                            </a>
                          ) : (
                            <Link href={`/marketplace?id=${listing.id}`} className="bg-gray-900 hover:bg-[#1f8898] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5">
                              <LockKeyhole className="w-3.5 h-3.5" /> Unlock
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- COMPARE BOTTOM BAR --- */}
      {isCompareMode && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-4 sm:p-6 z-50 animate-in slide-in-from-bottom-full duration-300">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-black text-gray-900 text-lg">Compare Properties</h3>
              <p className="text-sm font-medium text-gray-500">{selectedToCompare.size} of 5 selected</p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button 
                onClick={() => { setIsCompareMode(false); setSelectedToCompare(new Set()); }}
                className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                disabled={selectedToCompare.size < 2}
                onClick={() => setShowComparisonModal(true)}
                className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:text-gray-500 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <GitCompare className="w-4 h-4" /> Compare Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- COMPARISON MODAL --- */}
      {showComparisonModal && (
        <div className="fixed inset-0 z-[100] bg-white overflow-hidden flex flex-col animate-in fade-in duration-300">
          <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50 shrink-0">
            <div>
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2"><GitCompare className="w-6 h-6 text-indigo-500" /> Property Comparison</h2>
              <p className="text-sm font-medium text-gray-500">Comparing {propertiesToCompare.length} properties side-by-side.</p>
            </div>
            <button onClick={() => setShowComparisonModal(false)} className="p-2 bg-white rounded-full border border-gray-200 hover:bg-gray-100 transition-colors shadow-sm">
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-auto bg-[#f8fafb] p-4 sm:p-8">
            <div className="max-w-screen-2xl mx-auto overflow-x-auto custom-scrollbar pb-8">
              <table className="w-full text-left border-collapse bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-w-[800px]">
                <thead>
                  <tr>
                    <th className="p-6 bg-gray-50 border-b border-r border-gray-100 w-48 shrink-0">
                      <p className="text-xs font-black uppercase tracking-widest text-gray-400">Features</p>
                    </th>
                    {propertiesToCompare.map(p => (
                      <th key={p.id} className="p-6 border-b border-r border-gray-100 bg-white align-top w-72">
                        <div className="h-32 bg-gray-100 rounded-xl mb-4 overflow-hidden relative">
                          {p.images?.length > 0 ? (
                            <img src={p.images[0].url} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <Building2 className="w-8 h-8 text-gray-300 m-auto mt-12" />
                          )}
                          <button onClick={() => toggleCompareSelection({ preventDefault:()=>{} } as any, p.id)} className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-md hover:bg-rose-50 hover:text-rose-500 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <h4 className="text-lg font-black text-gray-900 mb-1 truncate">Unit {p.unit_number}</h4>
                        <p className="text-xs font-bold text-gray-500 truncate mb-3">{p.property?.name}</p>
                        <Link href={`/marketplace?id=${p.id}`} className="block w-full text-center py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-bold transition-colors">
                          View Listing
                        </Link>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Monthly Rent', key: 'rent_amount', format: (val: any) => <span className="font-black text-[#1f8898] text-lg">KSh {Number(val).toLocaleString()}</span> },
                    { label: 'Match Score', key: 'matchScore', format: (val: any) => <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{val}%</span> },
                    { label: 'Location', key: 'property', subkey: 'address', format: (val: any) => <span className="font-medium text-gray-700">{val}</span> },
                    { label: 'Property Type', key: 'unit_type', format: (val: any) => <span className="font-medium text-gray-700 capitalize">{val?.replace('_', ' ').toLowerCase()}</span> },
                    { label: 'Bedrooms', key: 'bedrooms', format: (val: any) => <span className="font-bold text-gray-900">{val || '-'}</span> },
                    { label: 'Bathrooms', key: 'bathrooms', format: (val: any) => <span className="font-bold text-gray-900">{val || '-'}</span> },
                    { label: 'Furnishing', key: 'furnishing_status', format: (val: any) => <span className="font-medium text-gray-700 capitalize">{val?.replace('_', ' ').toLowerCase()}</span> },
                    { label: 'Key Amenities', key: 'amenities', format: (val: any[]) => (
                      <div className="flex flex-wrap gap-1">
                        {val?.slice(0,3).map((a, i) => <span key={i} className="text-[10px] bg-gray-100 px-2 py-1 rounded font-bold text-gray-600">{a}</span>)}
                        {val?.length > 3 && <span className="text-[10px] bg-gray-100 px-2 py-1 rounded font-bold text-gray-600">+{val.length - 3}</span>}
                      </div>
                    )},
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 border-b border-r border-gray-100 bg-gray-50/50 font-bold text-xs text-gray-600 uppercase tracking-wide">
                        {row.label}
                      </td>
                      {propertiesToCompare.map(p => {
                        const rawVal = row.subkey ? p[row.key]?.[row.subkey] : p[row.key as keyof typeof p];
                        return (
                          <td key={p.id} className="p-4 border-b border-r border-gray-100 align-middle">
                            {row.format ? row.format(rawVal) : <span className="font-medium text-gray-700">{rawVal || '-'}</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}