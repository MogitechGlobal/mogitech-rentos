// apps/web/app/page.tsx
/* eslint-disable */
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dashboardMockup from "../public/dashboard-mockup.png"; 
import _ from "lodash";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { toast } from 'sonner';
import {
  ArrowRight, Building2, ShieldCheck, BarChart3, Globe, Zap, Server, X, 
  CheckCircle2, Database, Wrench, FileText, LayoutDashboard, Users, CreditCard, 
  PieChart, Activity, Lock, Smartphone, TrendingUp, MessageSquare, AlertCircle, 
  AlertTriangle, Wallet, Receipt, Download, Home, Settings, PhoneCall, FileSignature, 
  Users2, Calendar, Clock, Timer, LineChart, Scaling, FilePlus, UserPlus, Inbox, 
  Megaphone, ChevronDown, Search, Image as ImageIcon, Ticket, HelpCircle, User, 
  Landmark, PhoneForwarded, FileCheck2, MapPin, Phone, Loader2, Send, Camera, 
  Mail, ChevronRight, Filter, ChevronLeft, ZoomIn, ZoomOut, Share2, Heart, 
  Sparkles, History, LockKeyhole, Star, BedDouble, Bath, TrendingDown, Check
} from "lucide-react";

// --- SEO & SCHEMA CONFIGURATION ---
const seoData = {
  title: "MogiRent | Premium Rental Marketplace & Property Management",
  description: "Discover verified homes with zero broker fees. For landlords: track M-Pesa payments, identify arrears, and automate rent collection with smart ledgers.",
  keywords: "rent houses Nairobi, apartments Kenya, rent collection software Kenya, M-Pesa rent automation, property management system",
  url: "https://mogirent.co.ke", 
  image: "https://mogirent.co.ke/og-image.jpg" 
};

const jsonLdOrganization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${seoData.url}/#organization`,
  "name": "MogiRent",
  "url": seoData.url,
  "contactPoint": [
    { "@type": "ContactPoint", "telephone": "+254768569357", "contactType": "sales" },
    { "@type": "ContactPoint", "email": "support@mogirent.co.ke", "contactType": "sales" } 
  ]
};

const jsonLdSoftware = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "MogiRentOS",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "url": seoData.url,
  "description": seoData.description,
  "provider": { "@id": `${seoData.url}/#organization` }
};

const jsonLdWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "MogiRent",
  "url": seoData.url,
  "description": seoData.description,
};

// --- B2B PLATFORM CAPABILITIES ---
const rawFeatures = [
  {
    title: "Zero-Touch M-Pesa Reconciliation",
    description: "Link your Paybill or Till. When a payment is made, the ledger updates instantly. Say goodbye to hunting for transaction codes.",
    longDescription: "Eliminate manual data entry completely. When a resident pays via an STK push or your dedicated Paybill, our engine instantly identifies the unit, clears the pending invoice, and issues a digital receipt.",
    benefits: ["1-Click Direct STK Push", "Zero-Touch Receipt Generation", "Automated Late Fee Application"],
    icon: Zap,
    colSpan: "md:col-span-2 lg:col-span-2",
  },
  {
    title: "Smart Tenant Dashboards",
    description: "Grant residents the power to log repair tickets, download receipts, and digitally sign leases.",
    longDescription: "Empower your residents. Tenants can log in from any smartphone to download their payment history, report maintenance issues with photo evidence, and stay informed.",
    benefits: ["Zero-Download PWA App", "Transparent Invoice History", "Instant Issue Reporting"],
    icon: Smartphone,
    colSpan: "md:col-span-1 lg:col-span-1",
  },
  {
    title: "Instant Financial Reporting",
    description: "Generate comprehensive rent rolls, defaulter lists, and expense sheets for stakeholders.",
    longDescription: "Transform raw property data into actionable intelligence. Our analytics engine categorizes income streams, flags chronic late-payers, and projects your monthly cash flow.",
    benefits: ["PDF & Excel Exports", "Live Arrears Tracking", "Predictive Occupancy"],
    icon: BarChart3,
    colSpan: "md:col-span-1 lg:col-span-1",
  },
  {
    title: "Automated Maintenance",
    description: "Streamlined routing for repair requests, vendor dispatching, and resolution tracking.",
    longDescription: "Protect your asset's value. Tenants submit tickets with photos, and MogiRentOS auto-routes them to your designated caretakers or vendors, tracking progress until resolved.",
    benefits: ["Photo Evidence Uploads", "Automated Work Orders", "Resolution Timestamps"],
    icon: Wrench,
    colSpan: "md:col-span-1 lg:col-span-1",
  },
  {
    title: "Digital Lease Agreements",
    description: "Draft custom clauses, execute agreements securely, and store condition reports digitally.",
    longDescription: "Never lose track of expiring leases. The system monitors the entire lease lifecycle, allows for digital counter-signatures, and securely stores copies in an encrypted vault.",
    benefits: ["Dynamic Templates", "Move-in Sign-offs", "Automated Expiration Alerts"],
    icon: FileSignature, 
    colSpan: "md:col-span-2 lg:col-span-1",
  },
  {
    title: "Bank-Grade Security",
    description: "End-to-end encryption and strict data residency ensuring your ledgers remain strictly confidential.",
    longDescription: "The integrity of your portfolio data is our highest priority. MogiRentOS utilizes AES-256 encryption at rest, ensuring your leases, personal details, and financials are impenetrable.",
    benefits: ["AES-256 Encryption", "Role-Based Access", "Automated Cloud Backups"],
    icon: ShieldCheck,
    colSpan: "md:col-span-2 lg:col-span-3",
  }
];

const features = _.map(rawFeatures, (feature) => ({ ...feature, title: _.startCase(feature.title) }));

const faqs = [
  { q: "Can tenants pay partial rent?", a: "Absolutely. MogiRentOS instantly calculates the remaining balance for partial payments, allowing you to easily identify who is fully cleared and who still holds an active balance." },
  { q: "What happens to unrecognized M-Pesa payments?", a: "Any unclear, duplicated, or overpaid M-Pesa transactions are routed to a dedicated Reconciliation Queue. Your finance team can manually link them to the correct tenant or unit with a single click." },
  { q: "Can caretakers be given restricted access?", a: "Yes. Our Role-Based Access Control (RBAC) allows you to restrict caretakers so they only see the specific buildings they manage, hiding sensitive owner financial reports." },
  { q: "Does this replace my Excel spreadsheets?", a: "Yes. MogiRentOS is designed to completely replace scattered spreadsheets, physical receipt books, and WhatsApp follow-up groups." },
  { q: "Is this system built specifically for Kenya?", a: "Yes. Unlike generic overseas software, MogiRentOS is engineered ground-up for the Kenyan market, with M-Pesa Paybill integrations and local property workflows placed front and center." }
];

const jsonLdFAQ = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.q,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.a
    }
  }))
};

// --- B2B SLIDESHOW IMAGES ---
const b2bSlides = [
  "/image_0d36b7.png",  // Dashboard Analytics
  "/image_0d3600.png", // Billing Dashboard
  "/image_0ce365.png", // Tenant Directory
  "/image_0ce3a6.png", // Accounting & P&L
  "/image_0d3641.png", // Marketplace Leads
  "/image_0d367c.png",  // Listing Manager
  "/image_0d399d.png" // Property Management
];

export default function UnifiedHomePage() {
  const router = useRouter();

  // B2B States
  const [activeTab, setActiveTab] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [currentB2BSlide, setCurrentB2BSlide] = useState(0);

  // B2C Search States
  const [searchLocation, setSearchLocation] = useState('');
  const [searchType, setSearchType] = useState('');
  const [searchBudget, setSearchBudget] = useState('');

  // --- Dynamic Trending Searches State ---
  const [trendingSearches, setTrendingSearches] = useState([
    { label: 'Kilimani', param: 'location', value: 'Kilimani' },
    { label: 'Ruiru', param: 'location', value: 'Ruiru' },
    { label: 'Apartments', param: 'type', value: 'APARTMENT' }
  ]);

  // B2C Marketplace States
  const [trendingListings, setTrendingListings] = useState<any[]>([]);
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [shortlist, setShortlist] = useState<Set<string>>(new Set());
  const [unlockedUnits, setUnlockedUnits] = useState<Record<string, any>>({});

  // B2C Modals
  const [detailsModal, setDetailsModal] = useState<any>(null);
  const [galleryData, setGalleryData] = useState<{ images: any[], currentIndex: number } | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [unlockPhone, setUnlockPhone] = useState('');
  const [isWaitingForMpesa, setIsWaitingForMpesa] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadSubmitStatus, setLeadSubmitStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [leadFormData, setLeadFormData] = useState({ prospect_name: '', prospect_email: '', prospect_phone: '', message: '', agreeTerms: false });

  const showcaseTabs = [
    { title: "Marketplace CRM", icon: Users, tag: "Lead Pipeline" },
    { title: "Financial Command", icon: LayoutDashboard, tag: "Analytics" },
    { title: "Auto-Reconciliation", icon: CreditCard, tag: "Payments" }
  ];

  // Auto-play B2B Slideshow
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentB2BSlide((prev) => (prev + 1) % b2bSlides.length);
    }, 4500); 
    return () => clearInterval(slideTimer);
  }, []);

  // Fetch B2C Context & Trending Properties
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [listingsRes, dashRes, shortlistRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/marketplace/listings?limit=6`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/hunter/dashboard`, { credentials: 'include' }).catch(() => null),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/hunter/shortlist`, { credentials: 'include' }).catch(() => null)
        ]);

        if (listingsRes.ok) {
          const json = await listingsRes.json();
          const listings = json.data || [];
          setTrendingListings(listings);

          if (listings.length > 0) {
            const locations = listings.map((l: any) => l.property?.city || (l.property?.address ? l.property.address.split(',')[0].trim() : null)).filter(Boolean);
            const locCounts = _.countBy(locations);
            const topLocs = Object.entries(locCounts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 2)
              .map(([loc]) => ({ label: loc, param: 'location', value: loc }));

            const types = listings.map((l: any) => l.unit_type).filter(Boolean);
            const typeCounts = _.countBy(types);
            const topTypes = Object.entries(typeCounts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 1)
              .map(([type]) => ({ 
                label: _.startCase(_.toLower(type)) + 's', 
                param: 'type', 
                value: type 
              }));

            const derivedSearches = [...topLocs, ...topTypes];
            if (derivedSearches.length > 0) {
              setTrendingSearches(derivedSearches);
            }
          }
        }

        if (dashRes && dashRes.ok) {
          const dashJson = await dashRes.json();
          const unlocks: Record<string, any> = {};
          dashJson.unlocked_properties?.forEach((up: any) => { unlocks[up.unit.id] = up; });
          setUnlockedUnits(unlocks);
        }

        if (shortlistRes && shortlistRes.ok) {
          const slData = await shortlistRes.json();
          setShortlist(new Set(slData.map((s: any) => s.unit_id)));
        } else {
          setShortlist(new Set(JSON.parse(localStorage.getItem('mogi_shortlist_ids') || '[]')));
        }
        setFavorites(new Set(JSON.parse(localStorage.getItem('mogi_favorites') || '[]')));

      } catch (error) {
        console.error("Failed to fetch initial data");
      } finally {
        setIsLoadingTrending(false);
      }
    };
    fetchData();

    const savedEmail = localStorage.getItem('user_email') || '';
    setLeadFormData(prev => ({ ...prev, prospect_email: savedEmail }));
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchLocation) params.append('location', searchLocation);
    if (searchType) params.append('type', searchType);
    if (searchBudget) params.append('maxPrice', searchBudget);
    router.push(`/marketplace?${params.toString()}`);
  };

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newFavs = new Set(favorites);
    if (newFavs.has(id)) newFavs.delete(id); else newFavs.add(id);
    setFavorites(newFavs);
    localStorage.setItem('mogi_favorites', JSON.stringify(Array.from(newFavs)));
    toast.success(newFavs.has(id) ? 'Saved to Favorites' : 'Removed from Favorites');
  };

  const toggleShortlist = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const isLogged = !!localStorage.getItem('user_role');
    if (!isLogged) return router.push('/register?callbackUrl=/');

    const newShorts = new Set(shortlist);
    const isAdding = !newShorts.has(id);
    if (isAdding) newShorts.add(id); else newShorts.delete(id);
    setShortlist(newShorts);
    localStorage.setItem('mogi_shortlist_ids', JSON.stringify(Array.from(newShorts)));

    try {
      const endpoint = isAdding ? '/hunter/shortlist' : `/hunter/shortlist/${id}`;
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: isAdding ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: isAdding ? JSON.stringify({ unit_id: id }) : undefined
      });
      toast.success(isAdding ? 'Added to Shortlist' : 'Removed from Shortlist');
    } catch (err) {}
  };

  const openDetailsModal = (listing: any) => {
    setLeadFormData(prev => ({ ...prev, message: `Hi, I am interested in Unit ${listing.unit_number}. Please contact me with more details.` }));
    setDetailsModal(listing);
  };

  const closeDetailsModal = () => {
    setDetailsModal(null);
    setLeadSubmitStatus(null);
    if (isUnlockModalOpen) closeUnlockModal();
  };

  const openGallery = (listing: any, index: number = 0) => {
    if (!listing.images || listing.images.length === 0) return;
    setGalleryData({ images: listing.images, currentIndex: index });
    setIsZoomed(false);
  };

  const closeGallery = () => { setGalleryData(null); setIsZoomed(false); };

  const openUnlockModal = () => {
    const isLogged = !!localStorage.getItem('user_role');
    if (!isLogged) return router.push('/register?callbackUrl=/');
    setSubmitStatus(null); setUnlockPhone(''); setIsWaitingForMpesa(false);
    setIsUnlockModalOpen(true);
  };

  const closeUnlockModal = () => {
    setIsUnlockModalOpen(false);
    if (pollingInterval) clearInterval(pollingInterval);
    setIsWaitingForMpesa(false);
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsWaitingForMpesa(true);
    setSubmitStatus(null);

    let finalPhone = unlockPhone.replace(/\D/g, '');
    if (finalPhone.startsWith('0')) finalPhone = '254' + finalPhone.substring(1);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/marketplace/unlock`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ unit_id: detailsModal.id, phone: finalPhone }),
      });
      if (!response.ok) throw new Error('Failed to initiate M-Pesa STK Push.');
      
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/marketplace/unlock/status?unit_id=${detailsModal.id}&phone=${finalPhone}`, { credentials: 'include' });
          if (!res.ok) return;
          const data = await res.json();
          if (data.status === 'SUCCESS') {
            clearInterval(interval);
            setIsWaitingForMpesa(false);
            setSubmitStatus({ type: 'success', text: 'Payment successful! Details unlocked.' });
            setUnlockedUnits(prev => ({ ...prev, [detailsModal.id]: { phone: data.revealed_phone, exact_name: data.exact_name, latitude: data.latitude, longitude: data.longitude } }));
          } else if (data.status === 'FAILED') {
            clearInterval(interval);
            setIsWaitingForMpesa(false);
            setSubmitStatus({ type: 'error', text: 'M-Pesa payment failed.' });
          }
        } catch (error) {}
      }, 3000); 
      setPollingInterval(interval);
      
    } catch (error: any) {
      setSubmitStatus({ type: 'error', text: error.message });
      setIsWaitingForMpesa(false);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadFormData.agreeTerms) return;
    setIsSubmittingLead(true);
    setLeadSubmitStatus(null);

    let finalPhone = leadFormData.prospect_phone.replace(/\D/g, '');
    if (finalPhone.startsWith('0')) finalPhone = '254' + finalPhone.substring(1);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/marketplace/leads`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          unit_id: detailsModal.id, 
          prospect_name: leadFormData.prospect_name, 
          prospect_email: leadFormData.prospect_email,
          prospect_phone: finalPhone, 
          message: leadFormData.message,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit inquiry.');
      setLeadSubmitStatus({ type: 'success', text: 'Viewing request sent securely to the landlord!' });
    } catch (error: any) {
      setLeadSubmitStatus({ type: 'error', text: error.message });
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const getWhatsAppLink = (phone: string, unitStr: string, listingId: string) => {
    let cleanPhone = phone?.replace(/\D/g, '') || '';
    if (cleanPhone.startsWith('0')) cleanPhone = '254' + cleanPhone.substring(1);
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`I saw your listing for Unit ${unitStr} on MogiRent Marketplace and would like more details.\n\nLink: ${window.location.origin}/marketplace?id=${listingId}`)}`;
  };

  return (
    <>
      <title>{seoData.title}</title>
      <meta name="description" content={seoData.description} />
      <meta name="keywords" content={seoData.keywords} />
      <meta property="og:title" content={seoData.title} />
      <meta property="og:description" content={seoData.description} />
      <meta property="og:url" content={seoData.url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="MogiRent" />
      <meta property="og:image" content={seoData.image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoData.title} />
      <meta name="twitter:description" content={seoData.description} />
      <meta name="twitter:image" content={seoData.image} />
      
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSoftware) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFAQ) }} />

      <div className="flex min-h-screen flex-col bg-[#f4f7f9] font-sans selection:bg-[#1f8898]/30 overflow-x-hidden">
        <Navbar />

        <main className="flex-1">
          
          {/* --- B2C RENTER HERO (LIGHT THEME) --- */}
          <section className="relative overflow-hidden bg-[#f4f7f9] pt-24 pb-20 md:pt-32 md:pb-24 rounded-b-[3rem] sm:rounded-b-[4rem] z-10 border-b border-gray-200/50">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#1f8898] rounded-full blur-[100px] opacity-[0.04] -mr-10 -mt-10 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#4fd1c5] rounded-full blur-[100px] opacity-[0.03] -ml-10 -mb-10 pointer-events-none"></div>
            
            <div className="relative mx-auto max-w-7xl px-4 lg:px-8 text-center z-10 flex flex-col items-center">
              <div className="inline-flex items-center rounded-full border border-[#1f8898]/20 bg-[#1f8898]/5 backdrop-blur-md px-4 py-2 text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#1f8898] mb-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Sparkles className="w-3.5 h-3.5 mr-2 text-amber-500" /> Premium Rental Discovery
              </div>

              <h1 className="mx-auto max-w-5xl text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-gray-900 mb-6 leading-[1.05] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                Find your perfect home. <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1f8898] to-[#0d393f]">Direct to landlord.</span>
              </h1>

              <p className="mx-auto max-w-2xl text-sm sm:text-lg font-medium text-gray-600 leading-relaxed mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                Browse verified premium listings, schedule viewings instantly, and bypass expensive brokers using our secure STK push unlocking system.
              </p>

              <form onSubmit={handleHeroSearch} className="w-full max-w-4xl mx-auto bg-white p-2 sm:p-2.5 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-gray-200 flex flex-col sm:flex-row items-center gap-2 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
                <div className="flex-1 flex items-center gap-3 bg-gray-50/80 hover:bg-gray-50 rounded-xl px-4 py-3.5 w-full border border-gray-100 focus-within:border-[#1f8898] focus-within:bg-white transition-colors">
                  <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
                  <input type="text" placeholder="City or Neighborhood..." className="w-full bg-transparent outline-none text-sm font-bold text-gray-900" value={searchLocation} onChange={(e) => setSearchLocation(e.target.value)} />
                </div>
                <div className="hidden sm:block w-px h-10 bg-gray-200"></div>
                <div className="flex-1 flex items-center gap-3 bg-gray-50/80 hover:bg-gray-50 rounded-xl px-4 py-3.5 w-full border border-gray-100 focus-within:border-[#1f8898] focus-within:bg-white transition-colors">
                  <Building2 className="w-5 h-5 text-gray-400 shrink-0" />
                  <select className="w-full bg-transparent outline-none text-sm font-bold text-gray-900 appearance-none cursor-pointer" value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                    <option value="">Any Type</option>
                    <option value="APARTMENT">Apartment</option>
                    <option value="HOUSE_OWN_COMPOUND">House</option>
                    <option value="TOWNHOUSE">Townhouse</option>
                    <option value="BEDSITTER">Bedsitter</option>
                  </select>
                </div>
                <div className="hidden sm:block w-px h-10 bg-gray-200"></div>
                <div className="flex-1 flex items-center gap-3 bg-gray-50/80 hover:bg-gray-50 rounded-xl px-4 py-3.5 w-full border border-gray-100 focus-within:border-[#1f8898] focus-within:bg-white transition-colors">
                  <Wallet className="w-5 h-5 text-gray-400 shrink-0" />
                  <select className="w-full bg-transparent outline-none text-sm font-bold text-gray-900 appearance-none cursor-pointer" value={searchBudget} onChange={(e) => setSearchBudget(e.target.value)}>
                    <option value="">Max Budget</option>
                    <option value="20000">Under KSh 20,000</option>
                    <option value="50000">Under KSh 50,000</option>
                    <option value="100000">Under KSh 100,000</option>
                    <option value="150000">Under KSh 150,000</option>
                  </select>
                </div>
                <button type="submit" className="w-full sm:w-auto bg-[#1f8898] hover:bg-[#156a77] text-white px-8 py-4 rounded-xl font-black text-sm transition-all shadow-md hover:shadow-lg shrink-0 flex items-center justify-center gap-2">
                  <Search className="w-4 h-4" /> Search
                </button>
              </form>

              {/* --- DYNAMIC TRENDING SEARCHES --- */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm animate-in fade-in duration-1000 delay-500">
                <span className="text-gray-400 font-black uppercase tracking-widest text-[10px] mr-2">Trending Searches:</span>
                {trendingSearches.map((search, idx) => (
                  <Link 
                    key={idx} 
                    href={`/marketplace?${search.param}=${encodeURIComponent(search.value)}`} 
                    className="text-gray-600 hover:text-[#1f8898] font-bold border border-gray-200 px-4 py-1.5 rounded-full bg-white transition-colors shadow-sm text-xs"
                  >
                    {search.label}
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* --- TRENDING PROPERTIES B2C --- */}
          <section className="py-16 relative z-20 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Trending on MogiRent</h2>
                <p className="text-sm font-medium text-gray-500 mt-1">Highly-rated properties catching attention right now.</p>
              </div>
              <Link href="/marketplace" className="hidden sm:flex items-center gap-2 text-sm font-bold text-[#1f8898] hover:text-[#156a77] bg-white px-5 py-2.5 rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                View Marketplace <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {isLoadingTrending ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-[2rem] border border-gray-100 h-[400px] animate-pulse shadow-sm"></div>)}
              </div>
            ) : trendingListings.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-[2rem] border border-dashed border-gray-200 shadow-sm">
                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-black text-gray-900 mb-2">No trending properties</h3>
                <p className="text-sm text-gray-500 mb-6">Check the marketplace for the latest additions.</p>
                <Link href="/marketplace" className="bg-[#1f8898] text-white px-6 py-3 rounded-xl font-bold shadow-sm inline-flex">Explore Market</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingListings.slice(0,6).map((listing) => {
                  const isFav = favorites.has(listing.id);
                  const isShortlisted = shortlist.has(listing.id);
                  const unlockedData = unlockedUnits[listing.id];
                  const isUnlocked = !!unlockedData;

                  return (
                    <div key={listing.id} onClick={() => openDetailsModal(listing)} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-[#1f8898]/10 hover:border-[#1f8898]/40 hover:-translate-y-1 transition-all duration-300 flex flex-col group relative cursor-pointer">
                      <button onClick={(e) => toggleFavorite(e, listing.id)} className="absolute top-4 right-4 z-30 p-2.5 bg-white/90 backdrop-blur-md hover:bg-white rounded-full shadow-md transition-transform active:scale-90 border border-white">
                        <Heart className={`w-4 h-4 ${isFav ? 'text-rose-500 fill-rose-500' : 'text-gray-400'}`} />
                      </button>

                      <div className="h-56 w-full relative overflow-hidden bg-gray-100">
                        {listing.images?.[0] ? (
                           <img src={listing.images[0].url} alt="Property" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1f8898]/10 to-[#0d393f]/20"><Building2 className="w-12 h-12 text-[#1f8898]/30" /></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>

                        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 items-start">
                          {isUnlocked ? (
                            <div className="bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 backdrop-blur-md"><CheckCircle2 className="w-3 h-3" /> Unlocked</div>
                          ) : (
                            <div className="bg-white/90 text-gray-900 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 backdrop-blur-md"><LockKeyhole className="w-3 h-3 text-amber-500" /> Premium</div>
                          )}
                          {listing.rent_amount < 40000 && (
                            <div className="bg-rose-500 text-white px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 backdrop-blur-md"><TrendingDown className="w-3 h-3" /> Trending</div>
                          )}
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col bg-white">
                        <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-[#1f8898] transition-colors truncate mb-1">
                          Unit {listing.unit_number} <span className="text-gray-300 font-normal mx-1">•</span> {isUnlocked ? (unlockedData.exact_name || listing.property?.name) : 'Premium Listing'}
                        </h3>
                        <p className="text-xs font-bold text-gray-500 flex items-center gap-1.5 mb-4 truncate">
                          <MapPin className="w-3.5 h-3.5 text-[#1f8898]" /> {isUnlocked ? listing.property?.address : `${listing.property?.address || 'Unknown'} Area`}
                        </p>

                        <div className="flex gap-3 mb-4 text-xs font-bold text-gray-700 flex-wrap">
                          <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded border border-gray-100"><Building2 className="w-3.5 h-3.5 text-gray-400" /> {listing.unit_type?.replace('_', ' ')}</div>
                          {listing.bedrooms && <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded border border-gray-100"><BedDouble className="w-3.5 h-3.5 text-gray-400" /> {listing.bedrooms}</div>}
                          {listing.bathrooms && <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded border border-gray-100"><Bath className="w-3.5 h-3.5 text-gray-400" /> {listing.bathrooms}</div>}
                        </div>

                        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                          <div>
                            <p className="text-[9px] uppercase tracking-widest font-black text-gray-400 mb-0.5">Monthly Rent</p>
                            <h4 className="text-xl font-black text-[#1f8898] leading-none">KSh {Number(listing.rent_amount).toLocaleString()}</h4>
                          </div>
                          <div className={`p-2 rounded-xl transition-all ${isShortlisted ? 'bg-amber-50 text-amber-500' : 'bg-gray-50 text-gray-400 group-hover:bg-[#1f8898] group-hover:text-white'}`}>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            
            <div className="flex justify-center mt-10 sm:hidden">
              <Link href="/marketplace" className="w-full flex items-center justify-center gap-2 bg-white px-6 py-3.5 rounded-xl border border-gray-200 text-gray-700 font-bold shadow-sm">
                View All Properties <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>

          {/* --- ADVANCED B2B TRANSITION & HERO MOCKUP SLIDESHOW --- */}
          <section className="pt-24 pb-20 sm:pb-32 bg-gradient-to-b from-[#f4f7f9] to-white border-t border-gray-200/50 relative overflow-hidden">
             {/* Decorative Background glow */}
             <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#1f8898]/5 rounded-full blur-[120px] pointer-events-none"></div>
             
             <div className="max-w-4xl mx-auto text-center px-4 mb-10 sm:mb-16 relative z-10">
                <span className="text-[10px] font-black text-[#1f8898] uppercase tracking-[0.2em] mb-4 inline-block bg-[#1f8898]/10 px-4 py-1.5 rounded-full border border-[#1f8898]/20 shadow-sm">Property Management SaaS</span>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight mb-6">Are you a Property Owner?</h2>
                <p className="text-lg sm:text-xl text-gray-600 font-medium leading-relaxed mb-8 max-w-3xl mx-auto">
                  Track Payments, Monitor Arrears, and Streamline Operations. MogiRent helps Kenyan landlords and property managers track M-Pesa payments, identify arrears, and automate rent collection with smart ledgers.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/register" className="inline-flex h-14 w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-[#0e363c] hover:bg-[#1f8898] px-10 text-sm sm:text-base font-bold text-[#ffffff] shadow-[0_15px_30px_rgba(14,54,60,0.2)] transition-all hover:shadow-[0_15px_30px_rgba(31,136,152,0.3)] hover:-translate-y-1 active:scale-95">
                      Start Your Free Trial <ArrowRight className="h-5 w-5" />
                    </Link>
                    <Link href="/pricing" className="inline-flex h-14 w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 px-10 text-sm sm:text-base font-bold text-gray-700 transition-all shadow-sm active:scale-95">
                      View Pricing
                    </Link>
                </div>
             </div>

             {/* DYNAMIC CROSS-FADING MACBOOK MOCKUP SLIDESHOW */}
             <div className="relative mx-auto max-w-[1100px] px-4 sm:px-6 z-20 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                <div className="relative w-full aspect-[16/10] max-h-[700px]">
                  {b2bSlides.map((slide, idx) => (
                    <img 
                      key={idx}
                      src={slide} 
                      alt={`MogiRentOS Dashboard View ${idx + 1}`} 
                      className={`absolute inset-0 w-full h-full object-contain drop-shadow-[0_30px_60px_rgba(14,54,60,0.15)] mix-blend-multiply transition-opacity duration-1000 ease-in-out ${
                        currentB2BSlide === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'
                      }`} 
                    />
                  ))}
                </div>

                {/* Slideshow Pagination Controls */}
                <div className="flex justify-center gap-2.5 mt-4 sm:mt-8 relative z-30">
                  {b2bSlides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentB2BSlide(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                      className={`h-2.5 rounded-full transition-all duration-300 shadow-sm ${
                        currentB2BSlide === idx 
                          ? 'w-8 bg-[#1f8898]' 
                          : 'w-2.5 bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
             </div>
          </section>

          {/* --- B2B PLATFORM MODULES BENTO --- */}
          <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20 relative">
            <div className="mb-12 text-center max-w-3xl mx-auto">
              <h2 className="text-[10px] font-black text-[#1f8898] uppercase tracking-[0.2em] mb-3 inline-block bg-[#1f8898]/10 px-4 py-1.5 rounded-full border border-[#1f8898]/20">Platform Modules</h2>
              <h3 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight mb-4">Precision Engineered.</h3>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[minmax(280px,auto)]">
              {features.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div key={idx} onClick={() => setSelectedFeature(feature)} className={`cursor-pointer group rounded-[2rem] bg-white border border-gray-200/60 p-8 flex flex-col relative overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_rgba(31,136,152,0.08)] hover:border-[#1f8898]/40 hover:-translate-y-1.5 z-10 ${feature.colSpan}`}>
                    <div className="absolute -top-4 -right-4 p-6 opacity-[0.015] group-hover:opacity-[0.04] transition-opacity transform group-hover:scale-110 group-hover:-rotate-6 duration-700 pointer-events-none">
                      <Icon className="w-56 h-56 text-[#0e363c]" />
                    </div>
                    <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f4f7f9] border border-gray-100 text-[#1f8898] group-hover:bg-gradient-to-br group-hover:from-[#1f8898] group-hover:to-[#135a65] group-hover:text-white transition-all duration-500 relative z-10 shadow-sm">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h2 className="font-black text-xl sm:text-2xl mb-3 text-gray-900 relative z-10 tracking-tight">{feature.title}</h2>
                    <p className="text-sm font-medium text-gray-500 leading-relaxed flex-1 relative z-10 group-hover:text-gray-700">{feature.description}</p>
                    {/* VISIBLE EXPLORE FEATURE TEXT */}
                    <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-[#1f8898] transition-all duration-300 relative z-10 uppercase tracking-[0.15em] group-hover:text-[#0e363c]">
                      Explore Feature <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* --- THE M-PESA WORKFLOW --- */}
          <section className="py-16 md:py-24 bg-white relative border-y border-gray-100">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-16 lg:items-start">
                    <div className="w-full lg:w-1/2">
                        <span className="text-[10px] font-black text-[#1f8898] uppercase tracking-[0.2em] mb-4 inline-block bg-[#1f8898]/10 px-4 py-1.5 rounded-full border border-[#1f8898]/20">M-Pesa Front & Center</span>
                        <h2 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight mb-6">Collect Rent Automatically</h2>
                        <p className="text-base text-gray-600 leading-relaxed mb-10">MogiRentOS is deeply integrated with local payment flows. Request, capture, match, and post collections seamlessly to completely eliminate manual reconciliation.</p>
                        
                        <h3 className="text-xl font-black text-gray-900 mb-8">How Auto-Reconciliation Works</h3>
                        
                        {/* REFINED LEFT-ALIGNED TIMELINE */}
                        <div className="relative border-l-2 border-[#1f8898]/20 ml-3 sm:ml-4 space-y-8 pb-4">
                            {[
                                "System dispatches automated STK Push links or Paybill instructions via SMS.",
                                "MogiRent captures the M-Pesa transaction instantly.",
                                "The system algorithmically matches the payment to the correct tenant ledger.",
                                "Invoices are cleared; partial payments automatically calculate the remaining balance.",
                                "A digital rent receipt is generated and securely dispatched.",
                                "The landlord's arrears dashboard updates in real-time."
                            ].map((step, idx) => (
                                <div key={idx} className="relative pl-8 sm:pl-10 group">
                                    <div className="absolute -left-[17px] top-1.5 flex items-center justify-center w-8 h-8 rounded-full border-4 border-white bg-[#1f8898] text-white font-black text-[10px] shadow-sm z-10 group-hover:scale-110 transition-transform duration-300">
                                        {idx + 1}
                                    </div>
                                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm text-sm font-bold text-gray-700 leading-relaxed hover:border-[#1f8898]/30 hover:shadow-md transition-all">
                                        {step}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT COLUMN - STICKY POSITIONING */}
                    <div className="w-full lg:w-1/2 lg:sticky lg:top-28">
                        <div className="bg-[#0e363c] rounded-[3rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#1f8898]/20 rounded-full blur-3xl pointer-events-none"></div>
                            <h3 className="text-2xl sm:text-3xl font-black text-white mb-4 relative z-10 tracking-tight">Built for Kenyan workflows.</h3>
                            <p className="text-teal-100/80 mb-8 leading-relaxed relative z-10">Connect your payment workflow, capture M-Pesa transactions, issue receipts, and keep rent records current inside the same system.</p>
                            
                            <ul className="space-y-4 mb-10 relative z-10">
                                <li className="flex gap-3 text-white"><CheckCircle2 className="w-6 h-6 text-[#4fd1c5] shrink-0" /> Share secure STK push links directly via SMS.</li>
                                <li className="flex gap-3 text-white"><CheckCircle2 className="w-6 h-6 text-[#4fd1c5] shrink-0" /> Configure custom Paybill formats and instructions.</li>
                                <li className="flex gap-3 text-white"><CheckCircle2 className="w-6 h-6 text-[#4fd1c5] shrink-0" /> Auto-post collections into tenant payment history.</li>
                            </ul>

                            <div className="bg-[#11454f] rounded-2xl p-6 border border-white/10 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-[#1f8898] rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-[#1f8898]/30">
                                        <ShieldCheck className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-white font-black text-lg">Verified Integrations</p>
                                        <p className="text-xs text-teal-100/70 mt-1">Safaricom API, KCB, Equity Bank</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </section>

          {/* --- INTERACTIVE PRODUCT SHOWCASE --- */}
          <section id="showcase" className="py-16 md:py-24 bg-[#f4f7f9] relative">
              <div className="max-w-[1400px] mx-auto px-6 lg:px-8 relative z-10">
                  <div className="text-center mb-12 max-w-3xl mx-auto">
                      <h2 className="text-[10px] font-black text-[#1f8898] uppercase tracking-[0.2em] mb-3 inline-block bg-[#1f8898]/10 px-4 py-1.5 rounded-full border border-[#1f8898]/20">Platform Tour</h2>
                      <h3 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight mb-4">Enterprise capabilities. <br/>Consumer simplicity.</h3>
                  </div>

                  <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
                      <div className="w-full lg:w-1/3 flex flex-col gap-3">
                          {showcaseTabs.map((tab, idx) => {
                              const Icon = tab.icon;
                              const isActive = activeTab === idx;
                              return (
                                  <button 
                                      key={idx}
                                      onClick={() => setActiveTab(idx)}
                                      className={`p-5 sm:p-6 rounded-3xl text-left transition-all duration-500 border ${
                                          isActive 
                                          ? 'bg-[#0e363c] border-[#0e363c] shadow-2xl scale-[1.02] lg:translate-x-4' 
                                          : 'bg-white border-gray-200 hover:bg-gray-50'
                                      }`}
                                  >
                                      <div className="flex items-center gap-4 mb-3">
                                          <div className={`p-3 rounded-2xl transition-colors ${isActive ? 'bg-[#1f8898] text-white shadow-md' : 'bg-[#ebf3f5] text-[#1f8898]'}`}>
                                              <Icon className="w-6 h-6" />
                                          </div>
                                          <div>
                                              <h4 className={`text-lg font-black transition-colors tracking-tight ${isActive ? 'text-white' : 'text-gray-900'}`}>{tab.title}</h4>
                                              <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-[#4fd1c5]' : 'text-gray-400'}`}>{tab.tag}</span>
                                          </div>
                                      </div>
                                      {isActive && (
                                          <p className="text-sm font-medium text-white/70 mt-2 leading-relaxed animate-in fade-in slide-in-from-top-1">
                                              {idx === 0 && "Publish vacant units directly to our integrated marketplace. Manage leads, schedule viewings, and onboard tenants from a single pipeline."}
                                              {idx === 1 && "Consolidate portfolio performance into a single source of truth. Monitor cash flow, arrears, and occupancy across all properties in real-time."}
                                              {idx === 2 && "Automated STK pushes, instant ledger clearing, and zero-touch digital receipts directly connected to your Paybill."}
                                          </p>
                                      )}
                                  </button>
                              )
                          })}
                      </div>

                      <div className="w-full lg:w-2/3 h-[480px] sm:h-[600px] bg-white rounded-[2.5rem] sm:rounded-[3.5rem] border border-gray-200 shadow-[0_30px_60px_rgba(0,0,0,0.08)] overflow-hidden relative group ring-1 ring-gray-900/5">
                          {activeTab === 0 && (
                              <div className="h-full flex flex-col animate-in fade-in zoom-in-95 duration-500 bg-[#f4f7f9]">
                                  <div className="bg-[#1f8898] p-6 text-white shrink-0 shadow-sm z-10">
                                      <h2 className="text-3xl font-black tracking-tight mb-1">Marketplace Leads</h2>
                                      <p className="text-sm font-medium text-teal-100">Track inquiries, manage prospect communications, and monitor your pipeline.</p>
                                  </div>
                                  <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex flex-col justify-between">
                                              <div className="flex justify-between items-center mb-4">
                                                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Leads</span>
                                                  <Users2 className="w-4 h-4 text-gray-400" />
                                              </div>
                                              <p className="text-3xl font-black text-gray-900">11</p>
                                          </div>
                                          <div className="bg-white rounded-2xl p-4 border border-amber-100 shadow-sm flex flex-col justify-between">
                                              <div className="flex justify-between items-center mb-4">
                                                  <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Action Needed</span>
                                                  <Inbox className="w-4 h-4 text-amber-500" />
                                              </div>
                                              <p className="text-3xl font-black text-amber-600">7</p>
                                          </div>
                                          <div className="bg-white rounded-2xl p-4 border border-blue-100 shadow-sm flex flex-col justify-between">
                                              <div className="flex justify-between items-center mb-4">
                                                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">In Progress</span>
                                                  <MessageSquare className="w-4 h-4 text-blue-400" />
                                              </div>
                                              <p className="text-3xl font-black text-blue-600">2</p>
                                          </div>
                                          <div className="bg-white rounded-2xl p-4 border border-teal-100 shadow-sm flex flex-col justify-between">
                                              <div className="flex justify-between items-center mb-4">
                                                  <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Conv. Rate</span>
                                                  <TrendingUp className="w-4 h-4 text-teal-500" />
                                              </div>
                                              <p className="text-3xl font-black text-teal-600">18%</p>
                                          </div>
                                      </div>
                                      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                          <div className="px-5 py-4 border-b border-gray-100 flex gap-4">
                                              <div className="flex-1 bg-gray-50 rounded-xl px-4 py-2 flex items-center gap-2 border border-gray-200">
                                                  <Search className="w-4 h-4 text-gray-400" />
                                                  <span className="text-sm font-medium text-gray-400">Search name, email...</span>
                                              </div>
                                          </div>
                                          <div className="p-5 flex gap-5 overflow-x-auto">
                                              <div className="min-w-[280px] bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                                                  <div className="flex justify-between items-start mb-4">
                                                      <div>
                                                          <h4 className="font-bold text-gray-900 text-lg">Mogitech Glob...</h4>
                                                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">27 Days Ago</p>
                                                      </div>
                                                      <span className="bg-rose-50 text-rose-600 text-[10px] font-black uppercase px-2 py-1 rounded">New</span>
                                                  </div>
                                                  <div className="bg-[#ebf3f5] rounded-xl p-3 mb-4 flex items-center gap-2">
                                                      <Building2 className="w-4 h-4 text-[#1f8898]"/>
                                                      <span className="text-xs font-bold text-[#1f8898]">Unit A2 | Gilgal</span>
                                                  </div>
                                                  <p className="text-sm text-gray-500 italic mb-4">"Hi, I am interested in Unit A2 at Gilgal Apartment. Please contact me..."</p>
                                              </div>
                                              <div className="min-w-[280px] bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                                                  <div className="flex justify-between items-start mb-4">
                                                      <div>
                                                          <h4 className="font-bold text-gray-900 text-lg">Felix Maraga</h4>
                                                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">43 Days Ago</p>
                                                      </div>
                                                      <span className="bg-rose-50 text-rose-600 text-[10px] font-black uppercase px-2 py-1 rounded">New</span>
                                                  </div>
                                                  <div className="bg-[#ebf3f5] rounded-xl p-3 mb-4 flex items-center gap-2">
                                                      <Building2 className="w-4 h-4 text-[#1f8898]"/>
                                                      <span className="text-xs font-bold text-[#1f8898]">Unit F02 | Gilgal</span>
                                                  </div>
                                                  <p className="text-sm text-gray-500 italic mb-4">"Hi, I am interested in Unit F02 at Gilgal Apartment. Please contact me..."</p>
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          )}

                          {activeTab === 1 && (
                              <div className="h-full flex flex-col justify-between p-8 animate-in fade-in zoom-in-95 duration-500 bg-white">
                                  <div className="flex justify-between items-center mb-6">
                                      <div>
                                          <h4 className="text-2xl font-black text-gray-900 tracking-tight">Portfolio Analytics</h4>
                                          <p className="text-sm font-bold text-[#1f8898]">Financial Health Overview</p>
                                      </div>
                                      <BarChart3 className="w-10 h-10 text-[#1f8898]" />
                                  </div>
                                  <div className="flex-1 flex items-end gap-4 pb-4">
                                      {[30, 45, 40, 65, 80, 95, 85, 100].map((h, i) => (
                                          <div key={i} className="flex-1 bg-[#ebf3f5] rounded-t-2xl relative h-full flex items-end">
                                              <div className="w-full bg-gradient-to-t from-[#135a65] to-[#1f8898] rounded-t-2xl transition-all duration-1000 ease-out shadow-lg" style={{ height: `${h}%` }}></div>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          )}

                          {activeTab === 2 && (
                              <div className="h-full flex flex-col justify-center items-center animate-in fade-in zoom-in-95 duration-500 bg-[#f4f7f9]">
                                  <div className="bg-white border border-emerald-100 shadow-[0_20px_40px_rgba(16,185,129,0.1)] p-8 sm:p-10 rounded-[2.5rem] max-w-sm w-full text-center relative overflow-hidden">
                                      <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500"></div>
                                      <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                                          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                                      </div>
                                      <h4 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">STK Push Successful</h4>
                                      <p className="text-gray-500 font-medium mb-8 text-sm">Payment authorized. Ledger cleared instantly.</p>
                                      <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex justify-between items-center">
                                          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Amount</span>
                                          <span className="text-2xl font-black text-emerald-600">KSH 18,500</span>
                                      </div>
                                  </div>
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          </section>

          {/* --- INTEGRATIONS & COMPLIANCE --- */}
          <section className="py-20 bg-[#0e363c] relative overflow-hidden rounded-[3rem] sm:rounded-[4rem] mx-4 sm:mx-6 lg:mx-8 mb-20 shadow-[0_30px_60px_rgba(14,54,60,0.5)]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-[#1f8898]/40 via-[#0e363c] to-[#0e363c] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                   <h2 className="text-[10px] font-black text-[#4fd1c5] uppercase tracking-[0.2em] mb-3 inline-block bg-[#4fd1c5]/10 px-4 py-1.5 rounded-full border border-[#4fd1c5]/20">Ecosystem & Compliance</h2>
                   <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">Connect to the tools you already trust.</h3>
                   <p className="text-base sm:text-lg text-teal-100/80 font-medium leading-relaxed">MogiRentOS seamlessly bridges your property data with Kenya's top financial institutions and tax authorities.</p>
                </div>

                {/* Banks Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-12 sm:mb-16">
                  {[
                     { name: "M-Pesa", color: "text-emerald-400" },
                     { name: "KCB Bank", color: "text-green-500" },
                     { name: "Equity Bank", color: "text-amber-600" },
                     { name: "Co-op Bank", color: "text-green-600" },
                     { name: "NCBA", color: "text-yellow-400" },
                     { name: "Family Bank", color: "text-blue-400" },
                     { name: "DTB", color: "text-red-500" },
                     { name: "National Bank", color: "text-yellow-500" }
                  ].map((bank, i) => (
                     <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-colors shadow-inner">
                        <Landmark className={`w-6 h-6 ${bank.color}`} />
                        <span className="text-xs font-bold text-white text-center leading-tight">{bank.name}</span>
                     </div>
                  ))}
                </div>

                {/* Dual Feature: eTIMS & USSD */}
                <div className="grid md:grid-cols-2 gap-6">
                   <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 hover:border-[#4fd1c5]/50 transition-all group shadow-2xl">
                      <div className="w-14 h-14 bg-rose-500/20 rounded-2xl flex items-center justify-center mb-6 border border-rose-500/30 group-hover:scale-110 transition-transform">
                         <FileCheck2 className="w-7 h-7 text-rose-400" />
                      </div>
                      <h4 className="text-xl sm:text-2xl font-black text-white mb-3 tracking-tight">Automated KRA eTIMS</h4>
                      <p className="text-sm sm:text-base text-teal-100/70 leading-relaxed font-medium">Stay 100% compliant without the administrative nightmare. Our system automatically structures, generates, and transmits electronic tax invoices directly to the KRA portal, eliminating errors and manual reporting.</p>
                   </div>

                   <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 hover:border-[#4fd1c5]/50 transition-all group shadow-2xl">
                      <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/30 group-hover:scale-110 transition-transform">
                         <PhoneForwarded className="w-7 h-7 text-blue-400" />
                      </div>
                      <h4 className="text-xl sm:text-2xl font-black text-white mb-3 tracking-tight">Universal USSD Self-Service</h4>
                      <p className="text-sm sm:text-base text-teal-100/70 leading-relaxed font-medium">Bridge the digital divide. Tenants without smartphones can dial a simple USSD code to check rent balances, request statements, pay via M-Pesa, and log maintenance issues instantly from any basic phone.</p>
                   </div>
                </div>
            </div>
          </section>

          {/* --- PRICING SECTION --- */}
          <section className="py-20 bg-[#f4f7f9] border-t border-gray-200">
             <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="text-center mb-16">
                   <h2 className="text-[10px] font-black text-[#1f8898] uppercase tracking-[0.2em] mb-3 inline-block bg-[#1f8898]/10 px-4 py-1.5 rounded-full border border-[#1f8898]/20">Transparent Pricing</h2>
                   <h3 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight mb-4">Scale on your terms.</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                    {[
                        { name: "Starter", price: "1,500", desc: "Perfect for individuals managing a single building.", prop: "1 Property & 30 Units", featured: false },
                        { name: "Basic", price: "2,500", desc: "The essential tools for growing property portfolios.", prop: "Up to 3 Properties & 50 Units", featured: false },
                        { name: "Standard", price: "4,500", desc: "Designed for mid-sized management agencies.", prop: "Up to 5 Properties & 100 Units", featured: true },
                        { name: "Professional", price: "6,500", desc: "The complete operating system for serious managers.", prop: "Unlimited Properties & Units", featured: false }
                    ].map((plan, idx) => (
                        <div key={idx} className={`relative flex flex-col p-8 rounded-[2rem] border ${plan.featured ? 'bg-[#0e363c] border-[#154a52] shadow-2xl scale-105 z-10' : 'bg-white border-gray-200 shadow-sm'}`}>
                            {plan.featured && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-black uppercase px-4 py-1.5 rounded-full tracking-widest shadow-md">Most Popular</div>
                            )}
                            <h4 className={`text-xl font-black mb-4 ${plan.featured ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h4>
                            <div className="mb-4">
                                <span className={`text-sm font-bold ${plan.featured ? 'text-[#4fd1c5]' : 'text-gray-400'}`}>Ksh </span>
                                <span className={`text-4xl font-black tracking-tight ${plan.featured ? 'text-white' : 'text-gray-900'}`}>{plan.price}</span>
                                <span className={`text-xs font-bold ${plan.featured ? 'text-teal-100/50' : 'text-gray-400'}`}> /mo</span>
                            </div>
                            <p className={`text-sm font-medium mb-6 ${plan.featured ? 'text-teal-100/80' : 'text-gray-500'}`}>{plan.desc}</p>
                            
                            <div className={`p-4 rounded-xl mb-6 font-bold text-sm text-center ${plan.featured ? 'bg-[#154a52] text-white border border-[#1f8898]/30' : 'bg-[#ebf3f5] text-[#1f8898] border border-[#1f8898]/10'}`}>
                                <Building2 className="w-4 h-4 inline-block mr-2" />
                                {plan.prop}
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                {["Automated Rent Invoicing", "Full Arrears Tracking", "Maintenance Dispatch Hub", "Priority 24/7 Tech Support", "Tenant Portal Access"].map((feat, i) => (
                                    <li key={i} className={`flex items-start gap-3 text-sm font-bold ${plan.featured ? 'text-white' : 'text-gray-700'}`}>
                                        <CheckCircle2 className={`w-5 h-5 shrink-0 ${plan.featured ? 'text-[#4fd1c5]' : 'text-[#1f8898]'}`} /> {feat}
                                    </li>
                                ))}
                            </ul>

                            <Link href="/register" className={`w-full py-4 rounded-xl font-black text-center transition-all ${plan.featured ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/20' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
                                Get Started
                            </Link>
                        </div>
                    ))}
                </div>
             </div>
          </section>

          {/* --- FAQ SECTION --- */}
          <section className="py-20 bg-white border-t border-gray-100">
             <div className="max-w-4xl mx-auto px-6">
                <div className="text-center mb-12">
                   <h2 className="text-[10px] font-black text-[#1f8898] uppercase tracking-[0.2em] mb-3 inline-block bg-[#1f8898]/10 px-4 py-1.5 rounded-full border border-[#1f8898]/20">FAQ</h2>
                   <h3 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-4">Common Questions</h3>
                </div>
                <div className="space-y-4">
                   {faqs.map((faq, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                         <button 
                            onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                            className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
                         >
                            <span className="font-black text-gray-900">{faq.q}</span>
                            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} />
                         </button>
                         {openFaq === idx && (
                            <div className="px-6 pb-5 text-sm text-gray-600 font-medium leading-relaxed animate-in fade-in slide-in-from-top-2">
                               {faq.a}
                            </div>
                         )}
                      </div>
                   ))}
                </div>
             </div>
          </section>

          {/* --- FINAL CTA SECTION (RICH GRADIENT) --- */}
          <section className="py-20 sm:py-28 relative overflow-hidden bg-gradient-to-br from-[#1f8898] via-[#135a65] to-[#0e363c]">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
              <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>

              <div className="mx-auto max-w-4xl px-6 text-center relative z-10">
                  <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight">It's time to professionalize your operations.</h2>
                  <p className="text-base sm:text-xl text-teal-100 font-medium mb-10 max-w-2xl mx-auto leading-relaxed">Join the next generation of real estate managers automating their workflows and maximizing revenue.</p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
                    <Link href="/pricing" className="inline-flex h-14 sm:h-16 items-center justify-center gap-3 rounded-2xl bg-white px-10 sm:px-12 text-base font-black text-[#0e363c] shadow-2xl shadow-black/20 transition-all hover:bg-gray-50 hover:-translate-y-1 active:scale-95">
                        View Pricing Plans <ArrowRight className="w-5 h-5" />
                    </Link>
                    <a href="https://wa.me/254768569357?text=Hi,%20I%20need%20more%20information%20about%20MogiRent%20pricing." target="_blank" rel="noopener noreferrer" className="inline-flex h-14 sm:h-16 items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl px-10 sm:px-12 text-base font-black text-white transition-all hover:bg-white/20 hover:border-white/30 active:scale-95">
                        <MessageSquare className="w-5 h-5" /> Chat on WhatsApp
                    </a>
                  </div>
              </div>
          </section>

        </main>
        <Footer />

        {/* --- FLOATING WHATSAPP CTA --- */}
        <a href="https://wa.me/254768569357?text=Hi,%20I%20need%20help%20with%20MogiRent%20setup." 
           className="fixed right-4 sm:right-6 bottom-4 sm:bottom-6 z-50 flex items-center gap-2 rounded-full bg-[#25D366] text-white px-4 sm:px-5 py-3 sm:py-3.5 shadow-2xl shadow-[#25D366]/30 hover:bg-[#20bd5a] hover:-translate-y-1 transition-all active:scale-95" 
           target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
           <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.305-.885-.653-1.482-1.46-1.656-1.758-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.446-.272.371-1.04 1.015-1.04 2.469 0 1.453 1.065 2.861 1.213 3.06.149.198 2.093 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
           <span className="text-[12px] sm:text-[13px] font-bold tracking-wide"><span className="hidden sm:inline">Need setup help? </span>Chat on WhatsApp</span>
        </a>

        {/* --- FEATURE EXPLORATION MODAL --- */}
        {selectedFeature && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-[#0e363c]/80 backdrop-blur-lg transition-opacity" onClick={() => setSelectedFeature(null)} />
            <div className="relative w-full max-w-2xl bg-[#ffffff] rounded-3xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 ring-1 ring-white/10">
              <div className="bg-[#f4f7f9] px-6 py-6 sm:px-8 border-b border-gray-200/60 flex items-center justify-between">
                <div className="flex items-center gap-4 pr-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm text-[#1f8898] border border-gray-100">
                    <selectedFeature.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-tight">{selectedFeature.title}</h3>
                </div>
                <button onClick={() => setSelectedFeature(null)} className="p-2.5 text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 sm:p-8">
                <p className="text-sm sm:text-lg text-gray-600 font-medium leading-relaxed mb-8">{selectedFeature.longDescription}</p>
                <div className="bg-[#ebf3f5]/50 rounded-3xl p-6 sm:p-8 border border-[#1f8898]/10 mb-8 shadow-inner">
                  <h4 className="text-[10px] font-black text-[#1f8898] uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                      <Zap className="w-4 h-4"/> Core Benefits
                  </h4>
                  <ul className="space-y-4">
                    {selectedFeature.benefits.map((benefit: string, i: number) => (
                      <li key={i} className="flex items-start gap-4">
                        <CheckCircle2 className="w-6 h-6 text-[#1f8898] shrink-0 mt-0.5" />
                        <span className="font-bold text-gray-800 text-sm sm:text-base leading-snug">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                  <button onClick={() => setSelectedFeature(null)} className="w-full sm:w-auto px-8 py-4 rounded-xl font-black text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors uppercase tracking-widest text-[10px] sm:text-xs">Close</button>
                  <Link href="/register" className="flex w-full sm:w-auto justify-center items-center gap-2 sm:gap-3 bg-gradient-to-br from-[#0e363c] to-[#1f8898] hover:opacity-90 text-white px-10 py-4 rounded-xl font-black transition-all shadow-xl shadow-[#1f8898]/20 uppercase tracking-widest text-[10px] sm:text-xs active:scale-95">
                    Start Demo <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* --- GALLERY LIGHTBOX --- */}
        {galleryData && (
          <div className="fixed inset-0 z-[90] flex flex-col bg-black/95 backdrop-blur-xl animate-in fade-in duration-200">
            <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex justify-between items-center z-50">
              <div className="text-white font-black tracking-widest text-sm bg-white/10 px-4 py-1.5 rounded-full">{galleryData.currentIndex + 1} / {galleryData.images.length}</div>
              <button onClick={closeGallery} className="p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"><X className="w-6 h-6" /></button>
            </div>
            <div className="flex-1 flex items-center justify-center p-4">
              <img src={galleryData.images[galleryData.currentIndex].url} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" alt="Gallery" />
            </div>
            {galleryData.images.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); setGalleryData({ ...galleryData, currentIndex: (galleryData.currentIndex - 1 + galleryData.images.length) % galleryData.images.length }); }} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 hover:bg-[#1f8898] text-white rounded-full transition-all"><ChevronLeft className="w-6 h-6" /></button>
                <button onClick={(e) => { e.stopPropagation(); setGalleryData({ ...galleryData, currentIndex: (galleryData.currentIndex + 1) % galleryData.images.length }); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 hover:bg-[#1f8898] text-white rounded-full transition-all"><ChevronRight className="w-6 h-6" /></button>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}