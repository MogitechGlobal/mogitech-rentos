// apps/web/app/hunter/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Building2, MapPin, Phone, MessageCircle, Heart, 
  LockOpen, MessageSquare, ArrowRight, Loader2, Search, 
  CheckCircle2, Clock, Sparkles, BellRing, Target, 
  Activity, Star, Calendar, Filter, Plus, ExternalLink,
  TrendingDown, Check, Map as MapIcon, List
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
      <div className="flex-1 flex flex-col items-center justify-center min-h-[600px]">
        <Loader2 className="w-10 h-10 animate-spin text-[#1f8898] mb-4" />
        <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Initializing Command Center...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 m-6 bg-rose-50 border border-rose-200 rounded-3xl flex flex-col items-center justify-center text-center gap-3 shadow-sm">
        <p className="font-black text-rose-900 text-xl tracking-tight">System Error</p>
        <p className="text-sm font-medium text-rose-700">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2.5 bg-rose-600 text-white rounded-xl font-bold shadow-md hover:bg-rose-700 transition-colors">
          Retry Connection
        </button>
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
    color: 'from-[#1f8898] to-[#135a65]'
  };

  if (upcomingViewings.length > 0) {
    nextAction = { 
      title: `Upcoming Viewing`, 
      desc: `Your inquiry for Unit ${upcomingViewings[0].unit?.unit_number} has progressed to ${upcomingViewings[0].status.replace('_', ' ')}.`, 
      cta: 'View Progress', 
      action: () => { router.push('/hunter/inquiries'); }, // <-- TS FIX: Using Router or wrapping in block
      icon: MessageCircle,
      color: 'from-amber-500 to-amber-600'
    };
  } else if (recommendedListings.length > 0 && recommendedListings[0].matchScore > 80) {
    nextAction = { 
      title: `${recommendedListings.length} new matches found`, 
      desc: `We found a ${recommendedListings[0].matchScore}% match in ${primaryInterestArea}.`, 
      cta: 'View Matches', 
      action: () => document.getElementById('matches-section')?.scrollIntoView({ behavior: 'smooth' }),
      icon: Sparkles,
      color: 'from-indigo-500 to-purple-600'
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
    <div className="pb-12 bg-[#f8fafb] min-h-screen font-sans">
      
      {/* --- HERO: COMMAND CENTER --- */}
      <div className="bg-[#0d393f] px-6 sm:px-10 pt-8 pb-28 relative overflow-hidden shadow-inner border-b border-[#0a2c31]">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1f8898] rounded-full blur-[100px] opacity-20 -mr-32 -mt-32 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#48c9dc]/20 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-[#ffffff] tracking-tight mb-2">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {data?.user?.first_name || 'Hunter'}.
            </h1>
            <p className="text-teal-50/80 text-sm md:text-base font-medium max-w-xl">
              Find your next home faster. Monitor your pipeline, track matches, and schedule viewings.
            </p>
          </div>
          
          <div className="shrink-0 flex flex-wrap items-center gap-3">
            <button onClick={() => document.getElementById('searches-section')?.scrollIntoView({ behavior: 'smooth' })} className="bg-white/10 text-white border border-white/20 hover:bg-white/20 px-5 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 backdrop-blur-sm active:scale-95">
              <Plus className="w-4 h-4" /> Saved Search
            </button>
            <Link href="/marketplace" className="bg-[#1f8898] text-white hover:bg-[#48c9dc] px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-black/20 flex items-center gap-2 active:scale-95">
              <Search className="w-4 h-4" /> Search Properties
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-16 relative z-20 space-y-6">
        
        {/* --- METRICS ROW --- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/hunter/favorites" className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group hover:-translate-y-1 hover:shadow-md transition-all">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Saved Properties</p>
              <p className="text-2xl font-black text-gray-900 leading-none">{favoritesCount}</p>
            </div>
            <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform"><Heart className="w-5 h-5" /></div>
          </Link>

          <a href="#matches-section" className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">New Matches</p>
              <p className="text-2xl font-black text-gray-900 leading-none">{recommendedListings.length}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform"><Sparkles className="w-5 h-5" /></div>
          </a>

          <Link href="/hunter/inquiries" className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group hover:-translate-y-1 hover:shadow-md transition-all">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Upcoming Viewings</p>
              <p className="text-2xl font-black text-gray-900 leading-none">{upcomingViewings.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform"><Calendar className="w-5 h-5" /></div>
          </Link>

          <Link href="/hunter/unlocked" className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group hover:-translate-y-1 hover:shadow-md transition-all">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Unlocked Contacts</p>
              <p className="text-2xl font-black text-gray-900 leading-none">{unlocked.length}</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform"><LockOpen className="w-5 h-5" /></div>
          </Link>
        </div>

        {/* --- DYNAMIC NEXT ACTION --- */}
        <div className={`bg-gradient-to-r ${nextAction.color} rounded-[2rem] p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 text-white overflow-hidden relative`}>
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none scale-150 transform translate-x-1/4 -translate-y-1/4">
             <nextAction.icon className="w-64 h-64" />
          </div>
          <div className="relative z-10 text-center md:text-left">
            <h2 className="text-xl md:text-2xl font-black tracking-tight mb-2 flex items-center justify-center md:justify-start gap-2">
              <span className="bg-white/20 p-1.5 rounded-lg"><nextAction.icon className="w-5 h-5" /></span> 
              Your Next Action
            </h2>
            <p className="text-lg font-bold text-white mt-1">{nextAction.title}</p>
            <p className="text-sm font-medium text-white/80">{nextAction.desc}</p>
          </div>
          <button onClick={nextAction.action} className="relative z-10 shrink-0 w-full md:w-auto bg-white text-gray-900 px-8 py-4 rounded-xl font-black shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2">
            {nextAction.cta} <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* --- HOUSE HUNTING PIPELINE --- */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 overflow-x-auto custom-scrollbar">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">My House Hunt Pipeline</p>
          <div className="min-w-[600px] flex items-center justify-between relative px-4 pb-2">
            <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-gray-100 z-0 rounded-full"></div>
            
            {[
              { label: 'Discovered', count: pipelineStats.discovered, active: true },
              { label: 'Saved', count: pipelineStats.saved, active: pipelineStats.saved > 0 },
              { label: 'Contacted', count: pipelineStats.contacted, active: pipelineStats.contacted > 0 },
              { label: 'Shortlisted', count: pipelineStats.shortlisted, active: pipelineStats.shortlisted > 0 },
              { label: 'Rented', count: 0, active: false }
            ].map((stage, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center gap-2 bg-white px-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-colors border-4 border-white ${stage.active ? 'bg-[#1f8898] text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>
                  {stage.count > 0 ? stage.count : <CheckCircle2 className="w-4 h-4 opacity-50" />}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${stage.active ? 'text-gray-900' : 'text-gray-400'}`}>{stage.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* --- LEFT COLUMN (Span 8) --- */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* SMART MATCHES */}
            <div id="matches-section" className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-500" /> New Matches For You
                  </h2>
                  <p className="text-xs text-gray-500 font-medium mt-1">Scored properties based on your preference for <span className="font-bold text-gray-700">{primaryInterestArea}</span>.</p>
                </div>
                
                {/* Embedded Toggle Map/List UI Representation */}
                <div className="flex bg-gray-100 p-1 rounded-xl shrink-0">
                  <button onClick={() => setViewMode('LIST')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${viewMode === 'LIST' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    <List className="w-3.5 h-3.5" /> List
                  </button>
                  <button onClick={() => setViewMode('MAP')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${viewMode === 'MAP' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    <MapIcon className="w-3.5 h-3.5" /> Map
                  </button>
                </div>
              </div>
              
              <div className="p-6 bg-gray-50/50">
                {recommendedListings.length === 0 ? (
                  <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
                    <Search className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-gray-600">Gathering perfect matches...</p>
                  </div>
                ) : viewMode === 'MAP' ? (
                  <div className="w-full h-[400px] bg-gray-200 rounded-2xl flex flex-col items-center justify-center border border-gray-300 relative overflow-hidden">
                    {/* Placeholder for real interactive map implementation */}
                    <MapIcon className="w-12 h-12 text-gray-400 mb-2" />
                    <p className="text-sm font-bold text-gray-500">Interactive Map View</p>
                    <p className="text-xs text-gray-400 max-w-sm text-center mt-1">Shows approximate locations for locked matches and exact locations for unlocked properties.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {recommendedListings.map(listing => (
                      <div key={listing.id} className="group bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all flex flex-col">
                        <div className="h-40 bg-gray-100 relative overflow-hidden">
                          {listing.images && listing.images.length > 0 ? (
                            <img src={listing.images[0].url} alt="Property" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white">
                              <Building2 className="w-8 h-8 text-indigo-200" />
                            </div>
                          )}
                          <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start bg-gradient-to-b from-black/50 to-transparent">
                             <div className="bg-indigo-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1 backdrop-blur-md">
                                {listing.matchScore}% Match
                             </div>
                             <button className="p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors">
                               <Heart className="w-4 h-4" />
                             </button>
                          </div>
                          
                          {/* Price Drop Indicator (Simulated logic for demonstration) */}
                          {listing.rent_amount < 40000 && (
                             <div className="absolute bottom-2 left-2 bg-rose-500 text-white px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1">
                                <TrendingDown className="w-3 h-3" /> Price Drop
                             </div>
                          )}
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                          <h4 className="font-black text-gray-900 text-lg truncate group-hover:text-indigo-600 transition-colors">Unit {listing.unit_number}</h4>
                          <p className="text-xs font-bold text-gray-500 flex items-center gap-1 my-1.5 truncate">
                            <MapPin className="w-3.5 h-3.5 text-indigo-400" /> {listing.property?.address || 'Premium Location'}
                          </p>

                          {/* Why it matches */}
                          <div className="mt-3 space-y-1.5 mb-4">
                            {listing.matchReasons?.map((reason: string, idx: number) => (
                              <p key={idx} className="text-[10px] text-gray-500 font-bold flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-emerald-500" /> {reason}
                              </p>
                            ))}
                          </div>
                          
                          <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                            <span className="font-black text-gray-900 text-xl">KSh {Number(listing.rent_amount).toLocaleString()}</span>
                            <Link href={`/marketplace?id=${listing.id}`} className="bg-gray-900 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors">
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* UPCOMING VIEWINGS */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" /> Upcoming Viewings
                </h2>
              </div>
              
              <div className="p-6 flex-1 flex flex-col bg-gray-50/30">
                {upcomingViewings.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                    <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                      <Calendar className="w-6 h-6 text-blue-300" />
                    </div>
                    <h3 className="text-sm font-black text-gray-900 mb-1">No viewings scheduled</h3>
                    <p className="text-xs text-gray-500 max-w-sm mb-4">Your requested viewings will appear here once the landlord responds.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingViewings.map((inq: any) => (
                      <div key={inq.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-blue-100 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 border border-blue-100">
                            <Building2 className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-black text-gray-900 text-base">{inq.unit?.property?.name || 'Property Viewing'}</h4>
                            <p className="text-xs font-bold text-gray-500 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3"/> {inq.unit?.property?.address}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Link href={`/marketplace?id=${inq.unit_id}`} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors">Details</Link>
                          <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors">Manage</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* RECENT ACTIVITY TIMELINE */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-gray-500" /> Recent Activity
                </h2>
              </div>
              <div className="p-6 overflow-y-auto max-h-[400px] custom-scrollbar">
                {activities.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">No recent activity found.</p>
                ) : (
                  <div className="relative border-l-2 border-gray-100 ml-3 space-y-8">
                    {activities.map((act) => (
                      <div key={act.id} className="relative pl-6">
                        <div className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 border-white ${act.type === 'UNLOCK' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                        <p className="text-sm font-black text-gray-900 mb-0.5">{act.title}</p>
                        <p className="text-xs font-medium text-gray-500 mb-1.5">{act.desc}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                          {act.date.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* --- RIGHT COLUMN (Span 4) --- */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* SAVED SEARCHES (PERSISTENT API PLANNED) */}
            <div id="searches-section" className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-emerald-500" /> Saved Searches
                </h2>
              </div>
              <div className="p-6 bg-white">
                {savedSearches.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm font-medium text-gray-500 mb-4">No saved searches yet. Create one to get instant alerts.</p>
                    <button className="bg-emerald-50 text-emerald-600 font-bold text-xs px-4 py-2 rounded-lg hover:bg-emerald-100 transition-colors">
                      + Create First Search
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedSearches.map((search: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-sm transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                            <Search className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-black text-gray-900 text-sm">{search.name || 'Nairobi Area'}</h4>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">
                              {search.location || 'Any'} • {search.budget || 'Any budget'}
                            </p>
                          </div>
                        </div>
                        <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase px-2 py-1 rounded">Active</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* PREFERRED LOCATION ALERTS */}
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2rem] shadow-xl overflow-hidden flex flex-col relative text-white">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none -mt-10 -mr-10"></div>
              <div className="p-6 relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-white/20 p-2.5 rounded-xl border border-white/20 shadow-sm">
                    <BellRing className="w-5 h-5 text-indigo-100" />
                  </div>
                  <button 
                    onClick={handleToggleAlerts}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 border-2 border-transparent ${isAlertActive ? 'bg-emerald-400' : 'bg-white/30'}`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${isAlertActive ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
                <h3 className="text-lg font-black tracking-tight mb-1">Property Alerts</h3>
                <p className="text-xs text-indigo-100 font-medium mb-6">Receive instant WhatsApp & Email notifications when matching properties drop.</p>
                
                <Link href="/hunter/settings" className="w-full py-3 rounded-xl bg-white text-indigo-600 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md hover:scale-[1.02]">
                  Configure Preferences
                </Link>
              </div>
            </div>

            {/* SHORTLIST WIDGET */}
            <div className="bg-gray-900 rounded-[2rem] shadow-xl overflow-hidden flex flex-col relative text-white">
               <div className="p-6 flex items-center justify-between border-b border-white/10">
                 <div>
                   <h2 className="text-lg font-black flex items-center gap-2">
                     <Star className="w-5 h-5 text-amber-400" /> Shortlist
                   </h2>
                   <p className="text-xs text-gray-400 font-medium mt-1">Properties you are seriously considering.</p>
                 </div>
                 <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center font-black">{shortlist.length}</div>
               </div>
               <div className="p-6">
                  {shortlist.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center mb-4">Add properties to your shortlist to compare them side-by-side.</p>
                  ) : (
                    <p className="text-xs text-amber-400 font-bold text-center mb-4">{shortlist.length} properties ready for comparison.</p>
                  )}
                  <button disabled={shortlist.length < 2} className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                    Compare Shortlist <ArrowRight className="w-4 h-4"/>
                  </button>
               </div>
            </div>

            {/* PREMIUM UNLOCKS OVERVIEW */}
            <div className="bg-[#1f8898] rounded-[2rem] border border-[#166c7a] shadow-lg overflow-hidden flex flex-col relative">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <LockOpen className="w-32 h-32 text-white" />
              </div>
              <div className="p-6 border-b border-[#166c7a] flex items-center justify-between relative z-10">
                <h2 className="text-lg font-black text-white flex items-center gap-2">Premium Unlocks</h2>
                <Link href="/hunter/unlocked" className="text-xs font-bold text-teal-200 hover:text-white flex items-center gap-1 transition-colors">
                  See All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              
              <div className="p-6 flex-1 flex flex-col relative z-10">
                {recentUnlocked.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
                    <LockOpen className="w-8 h-8 text-teal-200 mb-3" />
                    <p className="text-xs text-teal-50 font-medium">No landlord contacts unlocked yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentUnlocked.map((item: any) => (
                      <div key={item.id} className="bg-white rounded-2xl p-4 shadow-md">
                        <div className="flex justify-between items-start mb-3">
                          <div className="overflow-hidden">
                            <h4 className="font-black text-gray-900 text-sm truncate pr-2">{item.property?.name || 'Premium Listing'}</h4>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Unit {item.unit?.unit_number}</p>
                          </div>
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        </div>
                        <div className="flex gap-2">
                          <a href={`tel:${item.property?.landlord?.contact_phone}`} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors text-[11px]"><Phone className="w-3.5 h-3.5" /> Call</a>
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