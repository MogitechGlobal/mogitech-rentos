// apps/web/app/hunter/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Building2, MapPin, Phone, MessageCircle, Heart, 
  LockOpen, ArrowRight, Loader2, Search, 
  CheckCircle2, Sparkles, BellRing, 
  Activity, Star, Calendar, Filter, Plus,
  TrendingDown, Check, Map as MapIcon, List, Compass
} from 'lucide-react';
import { toast } from 'sonner';

// Define strict types for our Next Action Engine
interface NextAction {
  title: string;
  desc: string;
  cta: string;
  action: () => void;
  icon: any;
  color: string;
}

export default function HunterCommandCenter() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [recommendedListings, setRecommendedListings] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [shortlist, setShortlist] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'LIST' | 'MAP'>('LIST');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isAlertActive, setIsAlertActive] = useState(true);
  const [localFavoritesCount, setLocalFavoritesCount] = useState(0);

  useEffect(() => {
    // Note: These will be replaced by backend endpoints (see requirements below)
    const favs = JSON.parse(localStorage.getItem('mogi_favorites') || '[]');
    const shorts = JSON.parse(localStorage.getItem('mogi_shortlist') || '[]');
    const searches = JSON.parse(localStorage.getItem('mogi_saved_searches') || '[]');
    
    setLocalFavoritesCount(favs.length);
    setShortlist(shorts);
    setSavedSearches(searches);

    const fetchDashboardAndRecommendations = async () => {
      try {
        const [dashRes, listingsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/hunter/dashboard`, { credentials: 'include' }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/marketplace/listings`)
        ]);

        if (!dashRes.ok) throw new Error('Failed to load your dashboard data.');

        const dashData = await dashRes.json();
        const listingsData = listingsRes.ok ? await listingsRes.json() : { data: [] };

        setData(dashData);

        // --- 1. UNIFIED ACTIVITY FEED GENERATOR (Real Data Only) ---
        const timeline: any[] = [];
        dashData.inquiries?.forEach((inq: any) => {
          timeline.push({
            id: `inq_${inq.id}`,
            type: 'INQUIRY',
            title: inq.status === 'NEW' ? 'Viewing Request Sent' : `Landlord Responded`,
            desc: inq.status === 'NEW' 
              ? `Requested to view Unit ${inq.unit?.unit_number} at ${inq.unit?.property?.name || 'Property'}`
              : `Status updated to ${inq.status} for Unit ${inq.unit?.unit_number}`,
            date: new Date(inq.updated_at || inq.created_at),
            status: inq.status
          });
        });
        dashData.unlocked_properties?.forEach((up: any) => {
          timeline.push({
            id: `up_${up.id}`,
            type: 'UNLOCK',
            title: 'Premium Contact Unlocked',
            desc: `Unlocked landlord details for ${up.property?.name}`,
            date: new Date(up.updated_at || up.created_at || Date.now()),
            status: 'SUCCESS'
          });
        });
        
        timeline.sort((a, b) => b.date.getTime() - a.date.getTime());
        setActivities(timeline);

        // --- 2. SMART RECOMMENDATION ENGINE ---
        const allListings = listingsData.data || [];
        const interestedLocations = new Set<string>();
        
        dashData.inquiries?.forEach((inq: any) => {
          if (inq.unit?.property?.address) interestedLocations.add(inq.unit.property.address);
        });
        dashData.unlocked_properties?.forEach((up: any) => {
          if (up.property?.address) interestedLocations.add(up.property.address);
        });

        const primaryArea = interestedLocations.size > 0 
          ? Array.from(interestedLocations)[0] 
          : "Nairobi"; 

        const unlockedIds = new Set(dashData.unlocked_properties?.map((up: any) => up.unit?.id));
        
        const scoredListings = allListings
          .filter((listing: any) => !unlockedIds.has(listing.id))
          .map((listing: any) => {
            let score = 40; 
            const reasons: string[] = [];

            if (listing.property?.address === primaryArea) {
              score += 35; 
              reasons.push(`In ${primaryArea}`);
            }
            if (listing.images?.length >= 3) {
              score += 15;
            }
            if (listing.amenities?.length > 0) {
              score += 10;
              reasons.push('Has premium amenities');
            }
            if (listing.virtual_tour_url) {
              score += 5; 
              reasons.push('Virtual tour available');
            }
            
            return { ...listing, matchScore: Math.min(score, 99), matchReasons: reasons };
          })
          .sort((a: any, b: any) => b.matchScore - a.matchScore); 

        setRecommendedListings(scoredListings.slice(0, 4));

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardAndRecommendations();
  }, []);

  const handleToggleAlerts = () => {
    setIsAlertActive(!isAlertActive);
    toast.success(
      isAlertActive ? 'Location alerts paused.' : 'Alerts activated! We will notify you of new matches.', 
      { position: 'bottom-right' }
    );
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[600px] bg-[#f6f8f9]">
        <Loader2 className="w-10 h-10 animate-spin text-[#0f4952] mb-4" />
        <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">Loading Workspace...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f6f8f9] p-6 flex items-center justify-center">
        <div className="p-10 bg-white border border-rose-100 rounded-3xl flex flex-col items-center justify-center text-center gap-4 shadow-xl max-w-md w-full">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-2">
            <Search className="w-8 h-8 text-rose-500" />
          </div>
          <p className="font-black text-gray-900 text-2xl tracking-tight">System Error</p>
          <p className="text-[14px] font-medium text-gray-500">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-8 py-3.5 bg-[#0f4952] text-white rounded-xl font-bold shadow-md hover:bg-[#1f8898] transition-colors w-full active:scale-[0.98]">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const unlocked = data?.unlocked_properties || [];
  const inquiries = data?.inquiries || [];
  const favoritesCount = data?.favorites?.length || localFavoritesCount; 
  
  const upcomingViewings = inquiries.filter((i: any) => i.status === 'CONTACTED' || i.status === 'VIEWED');
  const recentUnlocked = unlocked.slice(0, 3);
  const primaryInterestArea = inquiries.length > 0 
    ? inquiries[0].unit?.property?.address 
    : unlocked.length > 0 ? unlocked[0].property?.address : "Premium Locations";

  // --- 3. DYNAMIC NEXT ACTION ENGINE ---
  let nextAction: NextAction = { 
    title: 'Complete your preferences', 
    desc: 'Get better matches by setting up your first saved search profile.', 
    cta: 'Create Search', 
    action: () => document.getElementById('searches-section')?.scrollIntoView({ behavior: 'smooth' }),
    icon: Filter,
    color: 'bg-[#0f4952]' // Deep Corporate Teal
  };

  if (upcomingViewings.length > 0) {
    nextAction = { 
      title: `Upcoming Viewing`, 
      desc: `Your inquiry for Unit ${upcomingViewings[0].unit?.unit_number} has progressed to ${upcomingViewings[0].status.replace('_', ' ')}.`, 
      cta: 'View Progress', 
      action: () => { router.push('/hunter/inquiries'); }, 
      icon: MessageCircle,
      color: 'bg-[#0f172a]' // Navy
    };
  } else if (recommendedListings.length > 0 && recommendedListings[0].matchScore > 80) {
    nextAction = { 
      title: `${recommendedListings.length} new matches found`, 
      desc: `We found a ${recommendedListings[0].matchScore}% match in ${primaryInterestArea}.`, 
      cta: 'View Matches', 
      action: () => document.getElementById('matches-section')?.scrollIntoView({ behavior: 'smooth' }),
      icon: Sparkles,
      color: 'bg-[#1f8898]' // Vibrant Teal
    };
  }

  // --- 4. HOUSE-HUNTING PIPELINE METRICS ---
  const pipelineStats = {
    discovered: favoritesCount + shortlist.length + inquiries.length,
    saved: favoritesCount,
    contacted: inquiries.length,
    shortlisted: shortlist.length
  };

  return (
    <div className="pb-20 bg-[#f6f8f9] min-h-screen font-sans selection:bg-[#1f8898]/30">
      
      {/* --- PREMIUM HERO SECTION --- */}
      <div className="bg-[#0f4952] px-6 sm:px-10 pt-10 pb-32 relative overflow-hidden">
        {/* Subtle Background Graphics */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#1f8898] rounded-full blur-[120px] opacity-20 -mr-40 -mt-40 pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
        
        <div className="relative z-10 max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 backdrop-blur-md mb-6">
              <Compass className="w-4 h-4 text-teal-300" />
              <span className="text-[11px] font-black uppercase tracking-widest text-teal-50">House Hunter Workspace</span>
            </div>
            <h1 className="text-3xl md:text-[44px] font-black text-white tracking-tight mb-4 leading-tight">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {data?.user?.first_name || 'Hunter'}.
            </h1>
            <p className="text-teal-50/80 text-[15px] font-medium leading-relaxed max-w-xl">
              Track your property pipeline, discover AI-recommended matches, and manage your viewings securely from one command center.
            </p>
          </div>
          
          <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <button onClick={() => document.getElementById('searches-section')?.scrollIntoView({ behavior: 'smooth' })} className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3.5 rounded-xl font-bold text-[14px] transition-all flex items-center justify-center gap-2 backdrop-blur-sm active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50">
              <Plus className="w-[18px] h-[18px]" /> Saved Search
            </button>
            <Link href="/marketplace" className="w-full sm:w-auto bg-white hover:bg-gray-50 text-[#0f4952] px-8 py-3.5 rounded-xl font-black text-[14px] transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#0f4952]">
              <Search className="w-[18px] h-[18px] text-[#1f8898]" /> Search Properties
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 -mt-20 relative z-20 space-y-8">
        
        {/* --- METRICS ROW --- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Link href="/hunter/favorites" className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] flex flex-col justify-between group hover:-translate-y-1 hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.08)] hover:border-gray-200 transition-all min-h-[140px]">
            <div className="flex justify-between items-start w-full">
              <div className="w-10 h-10 bg-rose-50 rounded-[10px] flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform duration-300">
                <Heart className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-[28px] font-black text-gray-900 leading-none mb-1.5">{favoritesCount}</p>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Saved Properties</p>
            </div>
          </Link>

          <a href="#matches-section" className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] flex flex-col justify-between group hover:-translate-y-1 hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.08)] hover:border-gray-200 transition-all min-h-[140px] cursor-pointer">
            <div className="flex justify-between items-start w-full">
              <div className="w-10 h-10 bg-indigo-50 rounded-[10px] flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-[28px] font-black text-gray-900 leading-none mb-1.5">{recommendedListings.length}</p>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">New Matches</p>
            </div>
          </a>

          <Link href="/hunter/inquiries" className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] flex flex-col justify-between group hover:-translate-y-1 hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.08)] hover:border-gray-200 transition-all min-h-[140px]">
            <div className="flex justify-between items-start w-full">
              <div className="w-10 h-10 bg-sky-50 rounded-[10px] flex items-center justify-center text-sky-500 group-hover:scale-110 transition-transform duration-300">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-[28px] font-black text-gray-900 leading-none mb-1.5">{upcomingViewings.length}</p>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Upcoming Viewings</p>
            </div>
          </Link>

          <Link href="/hunter/unlocked" className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] flex flex-col justify-between group hover:-translate-y-1 hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.08)] hover:border-gray-200 transition-all min-h-[140px]">
            <div className="flex justify-between items-start w-full">
              <div className="w-10 h-10 bg-amber-50 rounded-[10px] flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform duration-300">
                <LockOpen className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-[28px] font-black text-gray-900 leading-none mb-1.5">{unlocked.length}</p>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Unlocked Contacts</p>
            </div>
          </Link>
        </div>

        {/* --- DYNAMIC NEXT ACTION --- */}
        <div className={`${nextAction.color} rounded-[2rem] p-8 md:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 text-white overflow-hidden relative border border-white/10`}>
          <div className="absolute right-0 top-0 opacity-[0.08] pointer-events-none scale-150 transform translate-x-1/4 -translate-y-1/4">
             <nextAction.icon className="w-64 h-64" />
          </div>
          <div className="relative z-10 text-center md:text-left">
            <h2 className="text-[11px] font-black uppercase tracking-[0.1em] text-white/70 mb-3 flex items-center justify-center md:justify-start gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span> Your Next Action
            </h2>
            <p className="text-[24px] sm:text-[28px] font-black text-white leading-tight mb-2 tracking-tight">{nextAction.title}</p>
            <p className="text-[15px] font-medium text-white/80 max-w-xl leading-relaxed">{nextAction.desc}</p>
          </div>
          <button onClick={nextAction.action} className="relative z-10 shrink-0 w-full md:w-auto bg-white text-[#0f4952] px-8 py-4 rounded-xl font-bold text-[14px] shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-white/30">
            {nextAction.cta} <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* --- HOUSE HUNTING PIPELINE --- */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)] p-8 overflow-x-auto custom-scrollbar">
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-8">Pipeline Progress</p>
          <div className="min-w-[700px] flex items-center justify-between relative px-6 pb-4">
            <div className="absolute left-10 right-10 top-6 -translate-y-1/2 h-1.5 bg-gray-100 z-0 rounded-full"></div>
            
            {[
              { label: 'Discovered', count: pipelineStats.discovered, active: true },
              { label: 'Saved', count: pipelineStats.saved, active: pipelineStats.saved > 0 },
              { label: 'Contacted', count: pipelineStats.contacted, active: pipelineStats.contacted > 0 },
              { label: 'Shortlisted', count: pipelineStats.shortlisted, active: pipelineStats.shortlisted > 0 },
              { label: 'Rented', count: 0, active: false }
            ].map((stage, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center gap-4 bg-white px-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-[15px] transition-all border-[6px] border-white ${stage.active ? 'bg-[#1f8898] text-white shadow-md scale-110' : 'bg-gray-100 text-gray-400'}`}>
                  {stage.count > 0 ? stage.count : <CheckCircle2 className="w-5 h-5 opacity-40" />}
                </div>
                <span className={`text-[11px] font-bold uppercase tracking-wider ${stage.active ? 'text-gray-900' : 'text-gray-400'}`}>{stage.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- LEFT COLUMN (Span 8) --- */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* SMART MATCHES */}
            <div id="matches-section" className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col">
              <div className="p-8 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <h2 className="text-[20px] font-black tracking-tight text-gray-900 flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-[#1f8898]" /> Recommended Matches
                  </h2>
                  <p className="text-[13px] text-gray-500 font-medium mt-1.5">Based on your activity around <span className="font-bold text-gray-700">{primaryInterestArea}</span>.</p>
                </div>
                
                <div className="flex bg-gray-50 p-1.5 rounded-[12px] shrink-0 border border-gray-100">
                  <button onClick={() => setViewMode('LIST')} className={`px-5 py-2 rounded-[10px] text-[13px] font-bold transition-all flex items-center gap-2 ${viewMode === 'LIST' ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-700'}`}>
                    <List className="w-4 h-4" /> List
                  </button>
                  <button onClick={() => setViewMode('MAP')} className={`px-5 py-2 rounded-[10px] text-[13px] font-bold transition-all flex items-center gap-2 ${viewMode === 'MAP' ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-700'}`}>
                    <MapIcon className="w-4 h-4" /> Map
                  </button>
                </div>
              </div>
              
              <div className="p-8 bg-gray-50/30">
                {recommendedListings.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                    <Search className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                    <p className="text-[14px] font-bold text-gray-600">Gathering perfect matches...</p>
                  </div>
                ) : viewMode === 'MAP' ? (
                  <div className="w-full h-[460px] bg-gray-100 rounded-3xl flex flex-col items-center justify-center border border-gray-200 relative overflow-hidden shadow-inner">
                    <MapIcon className="w-16 h-16 text-gray-300 mb-3" />
                    <p className="text-[15px] font-bold text-gray-500">Interactive Map View</p>
                    <p className="text-[13px] text-gray-400 max-w-sm text-center mt-2 leading-relaxed">Map visualises approximate zones for locked matches and exact coordinates for unlocked properties.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {recommendedListings.map(listing => (
                      <div key={listing.id} className="group bg-white border border-gray-100 rounded-[1.5rem] overflow-hidden shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-xl hover:border-[#1f8898]/30 transition-all duration-300 flex flex-col cursor-pointer" onClick={() => router.push(`/marketplace?id=${listing.id}`)}>
                        <div className="h-[200px] bg-gray-100 relative overflow-hidden">
                          {listing.images && listing.images.length > 0 ? (
                            <img src={listing.images[0].url} alt="Property" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50">
                              <Building2 className="w-10 h-10 text-gray-200" />
                            </div>
                          )}
                          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start bg-gradient-to-b from-gray-900/60 to-transparent">
                             <div className="bg-[#0f4952] text-white px-3 py-1.5 rounded-[8px] text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1.5 backdrop-blur-md">
                                {listing.matchScore}% Match
                             </div>
                             <button onClick={(e) => { e.stopPropagation(); /* Add fav logic */ }} className="p-2.5 bg-white/20 hover:bg-white/90 backdrop-blur-md rounded-xl text-white hover:text-rose-500 transition-colors shadow-sm">
                               <Heart className="w-[18px] h-[18px]" />
                             </button>
                          </div>
                          
                          {listing.rent_amount < 40000 && (
                             <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1.5 rounded-[8px] text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1.5">
                                <TrendingDown className="w-3.5 h-3.5 text-[#1f8898]" /> Trending
                             </div>
                          )}
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                          <h4 className="font-black text-gray-900 text-[18px] truncate group-hover:text-[#0f4952] transition-colors tracking-tight">Unit {listing.unit_number}</h4>
                          <p className="text-[13px] font-bold text-gray-500 flex items-center gap-1.5 mt-2 mb-4 truncate">
                            <MapPin className="w-4 h-4 text-[#1f8898]" /> {listing.property?.address || 'Premium Location'}
                          </p>

                          <div className="space-y-2 mb-6">
                            {listing.matchReasons?.map((reason: string, idx: number) => (
                              <p key={idx} className="text-[12px] text-gray-600 font-medium flex items-center gap-2">
                                <Check className="w-4 h-4 text-[#1f8898]" /> {reason}
                              </p>
                            ))}
                          </div>
                          
                          <div className="mt-auto pt-5 border-t border-gray-100 flex items-center justify-between">
                            <div>
                              <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-1">Monthly</p>
                              <span className="font-black text-[#0f4952] text-[20px] tracking-tight">KSh {Number(listing.rent_amount).toLocaleString()}</span>
                            </div>
                            <div className="bg-gray-50 group-hover:bg-[#0f4952] text-gray-400 group-hover:text-white w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-sm">
                              <ArrowRight className="w-5 h-5" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* UPCOMING VIEWINGS */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col">
              <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-[20px] font-black tracking-tight text-gray-900 flex items-center gap-2.5">
                  <Calendar className="w-5 h-5 text-[#0f172a]" /> Upcoming Viewings
                </h2>
              </div>
              
              <div className="p-8 bg-white">
                {upcomingViewings.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-10 border border-dashed border-gray-200 rounded-2xl">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                      <Calendar className="w-7 h-7 text-gray-300" />
                    </div>
                    <h3 className="text-[15px] font-black text-gray-900 mb-1.5">No viewings scheduled</h3>
                    <p className="text-[13px] font-medium text-gray-500 max-w-sm">Approved viewing requests will appear here once confirmed by the property manager.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingViewings.map((inq: any) => (
                      <div key={inq.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5 group hover:border-[#0f4952]/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gray-50 text-[#0f4952] rounded-[14px] flex items-center justify-center shrink-0 border border-gray-100">
                            <Building2 className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-black text-gray-900 text-[16px] tracking-tight">{inq.unit?.property?.name || 'Property Viewing'}</h4>
                            <p className="text-[12px] font-bold text-gray-500 flex items-center gap-1 mt-1"><MapPin className="w-3.5 h-3.5 text-gray-400"/> {inq.unit?.property?.address}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <Link href={`/marketplace?id=${inq.unit_id}`} className="flex-1 sm:flex-none text-center px-5 py-2.5 border border-gray-200 text-gray-600 rounded-[10px] text-[13px] font-bold hover:bg-gray-50 transition-colors">Listing</Link>
                          <button className="flex-1 sm:flex-none text-center px-5 py-2.5 bg-[#0f172a] text-white rounded-[10px] text-[13px] font-bold hover:bg-[#1e293b] transition-colors shadow-sm">Details</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* RECENT ACTIVITY TIMELINE */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col">
              <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-[20px] font-black tracking-tight text-gray-900 flex items-center gap-2.5">
                  <Activity className="w-5 h-5 text-gray-400" /> Recent Activity
                </h2>
              </div>
              <div className="p-8 overflow-y-auto max-h-[460px] custom-scrollbar">
                {activities.length === 0 ? (
                  <p className="text-[14px] font-medium text-gray-500 text-center py-10 border border-dashed border-gray-200 rounded-2xl">No recent activity detected.</p>
                ) : (
                  <div className="relative border-l-2 border-gray-100 ml-4 space-y-10">
                    {activities.map((act) => (
                      <div key={act.id} className="relative pl-8">
                        <div className={`absolute -left-[11px] top-1 w-[20px] h-[20px] rounded-full border-[4px] border-white ${act.type === 'UNLOCK' ? 'bg-[#1f8898]' : 'bg-[#0f172a] shadow-sm'}`}></div>
                        <p className="text-[15px] font-black text-gray-900 mb-1 tracking-tight">{act.title}</p>
                        <p className="text-[13px] font-medium text-gray-500 mb-2.5 leading-relaxed">{act.desc}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                          {act.date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* --- RIGHT COLUMN (Span 4) --- */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* SAVED SEARCHES */}
            <div id="searches-section" className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col">
              <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-[18px] font-black tracking-tight text-gray-900 flex items-center gap-2.5">
                  <Filter className="w-5 h-5 text-[#0f4952]" /> Saved Searches
                </h2>
              </div>
              <div className="p-6 bg-white">
                {savedSearches.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-[13px] font-medium text-gray-500 mb-5 leading-relaxed px-4">Create targeted searches to receive instant updates when matching units drop.</p>
                    <button className="bg-gray-50 border border-gray-200 text-gray-700 font-bold text-[13px] px-6 py-3 rounded-xl hover:bg-white hover:border-[#1f8898] hover:text-[#1f8898] transition-all w-full shadow-sm">
                      Configure First Search
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedSearches.map((search: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-[#1f8898]/50 hover:bg-[#ebf3f5]/30 transition-all group cursor-pointer">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-[10px] bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-[#1f8898] group-hover:bg-white transition-colors">
                            <Search className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-black text-gray-900 text-[14px]">{search.name || 'Nairobi Area'}</h4>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                              {search.location || 'Any'} • {search.budget || 'Any budget'}
                            </p>
                          </div>
                        </div>
                        <span className="bg-[#ebf3f5] text-[#0f4952] text-[9px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider">Active</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* PREFERRED LOCATION ALERTS */}
            <div className="bg-[#0f172a] rounded-[2rem] shadow-xl overflow-hidden flex flex-col relative text-white border border-gray-800">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#1f8898]/20 rounded-full blur-[40px] pointer-events-none -mt-10 -mr-10"></div>
              <div className="p-8 relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-white/10 p-3 rounded-xl border border-white/10 shadow-sm backdrop-blur-md">
                    <BellRing className="w-5 h-5 text-teal-300" />
                  </div>
                  <button 
                    onClick={handleToggleAlerts}
                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 border-2 border-transparent focus:outline-none ${isAlertActive ? 'bg-[#1f8898]' : 'bg-white/20'}`}
                  >
                    <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition duration-200 ${isAlertActive ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
                <h3 className="text-[20px] font-black tracking-tight mb-2">Automated Alerts</h3>
                <p className="text-[13px] text-gray-400 font-medium mb-8 leading-relaxed">Receive instant notifications via WhatsApp and email the moment a property matching your precise criteria is listed.</p>
                
                <Link href="/hunter/settings" className="w-full py-3.5 rounded-xl bg-white text-[#0f172a] font-bold text-[13px] transition-all flex items-center justify-center gap-2 shadow-md hover:bg-gray-100 active:scale-95">
                  Manage Preferences
                </Link>
              </div>
            </div>

            {/* SHORTLIST WIDGET */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col">
               <div className="p-8 flex items-center justify-between border-b border-gray-100">
                 <div>
                   <h2 className="text-[18px] font-black tracking-tight text-gray-900 flex items-center gap-2.5">
                     <Star className="w-5 h-5 text-[#0f4952]" /> Shortlist
                   </h2>
                 </div>
                 <div className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-[10px] flex items-center justify-center font-black text-gray-700 text-[14px] shadow-sm">{shortlist.length}</div>
               </div>
               <div className="p-8">
                  {shortlist.length === 0 ? (
                    <p className="text-[13px] font-medium text-gray-500 text-center mb-6 leading-relaxed">Pin properties to your shortlist to compare their amenities and locations side-by-side.</p>
                  ) : (
                    <p className="text-[13px] font-bold text-[#0f4952] text-center mb-6">{shortlist.length} properties staged for comparison.</p>
                  )}
                  <button disabled={shortlist.length < 2} className="w-full py-3.5 bg-gray-50 hover:bg-[#0f4952] hover:text-white text-gray-700 border border-gray-200 rounded-xl text-[13px] font-bold transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-50 disabled:hover:text-gray-700 shadow-sm">
                    Compare Shortlist <ArrowRight className="w-4 h-4"/>
                  </button>
               </div>
            </div>

            {/* PREMIUM UNLOCKS OVERVIEW */}
            <div className="bg-[#0f4952] rounded-[2rem] shadow-xl overflow-hidden flex flex-col relative text-white border border-[#0f4952]">
              <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none">
                <LockOpen className="w-32 h-32 text-white" />
              </div>
              <div className="p-8 border-b border-white/10 flex items-center justify-between relative z-10">
                <h2 className="text-[18px] font-black tracking-tight text-white flex items-center gap-2.5">Premium Access</h2>
                <Link href="/hunter/unlocked" className="text-[11px] font-bold uppercase tracking-widest text-teal-300 hover:text-white flex items-center gap-1.5 transition-colors">
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              
              <div className="p-6 flex-1 flex flex-col relative z-10 bg-[#0f172a]/10">
                {recentUnlocked.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                    <LockOpen className="w-8 h-8 text-white/30 mb-3" />
                    <p className="text-[13px] text-white/70 font-medium">No direct landlord contacts unlocked.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentUnlocked.map((item: any) => (
                      <div key={item.id} className="bg-white rounded-[1.25rem] p-5 shadow-lg border border-white/20 text-gray-900">
                        <div className="flex justify-between items-start mb-4">
                          <div className="overflow-hidden">
                            <h4 className="font-black text-gray-900 text-[15px] truncate pr-2 tracking-tight">{item.property?.name || 'Premium Listing'}</h4>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Unit {item.unit?.unit_number}</p>
                          </div>
                          <CheckCircle2 className="w-5 h-5 text-[#1f8898] shrink-0" />
                        </div>
                        <div className="flex gap-2">
                          <a href={`tel:${item.property?.landlord?.contact_phone}`} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-[12px]"><Phone className="w-3.5 h-3.5" /> Direct Call</a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}