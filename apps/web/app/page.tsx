// apps/web/app/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import Script from "next/script"; // <-- Imported Next.js Script
import { 
  ArrowRight, Search, Eye, MessageCircle, KeyRound, Building2, 
  Users, CreditCard, AlertTriangle, Wrench, BarChart3, MapPin, 
  BedDouble, CheckCircle2, ArrowDown, LockKeyhole, TrendingDown, Bath
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSearch from "@/components/home/HeroSearch";
import HomeFaq from "@/components/home/HomeFaq";
import DashboardSlideshow from "@/components/home/DashboardSlideshow";
import FavoriteButton from "@/components/home/FavoriteButton";
import FloatingWhatsApp from "@/components/home/FloatingWhatsApp";

export const metadata: Metadata = {
  title: "MogiRent | Find Homes & Manage Rental Properties",
  description: "Find your next home or manage rental properties with MogiRent — a modern platform for house hunters, landlords, and property managers in Kenya.",
  keywords: "rent houses Nairobi, property management software Kenya, MogiRent, landlords software, tenant management",
  alternates: {
    canonical: "https://mogirent.co.ke"
  },
  openGraph: {
    title: "MogiRent | Find Homes & Manage Rental Properties",
    description: "Find your next home or manage rental properties with MogiRent — a modern platform for house hunters, landlords, and property managers.",
    url: "https://mogirent.co.ke",
    type: "website",
    images: [{ url: "https://mogirent.co.ke/og-image.jpg", width: 1200, height: 630, alt: "MogiRent Platform" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "MogiRent | Find Homes & Manage Rental Properties",
    description: "Find your next home or manage rental properties with MogiRent."
  }
};

const jsonLdOrganization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Mogitech Global Ltd",
  "url": "https://mogirent.co.ke",
  "logo": "https://mogirent.co.ke/logo.png"
};

const jsonLdWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "MogiRent",
  "url": "https://mogirent.co.ke",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://mogirent.co.ke/marketplace?location={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

const previewFaqs = [
  { id: "what-is", question: "What is MogiRent?", answer: "MogiRent is a two-sided platform. It helps house hunters discover available properties to rent, and provides software tools for landlords and property managers to run their rental operations." },
  { id: "manage-multiple", question: "Can property managers manage multiple properties?", answer: "Yes, MogiRent is designed to help landlords and agencies centralise records, tenants, rent tracking, and maintenance across multiple properties and units." },
  { id: "cost", question: "How much does MogiRent cost?", answer: "For house hunters, browsing the marketplace is free. For property managers and landlords, we offer portfolio-based subscription plans starting at KSh 1,500/month depending on the number of units managed." },
  { id: "find-home", question: "Can I use MogiRent to find a home?", answer: "Absolutely. MogiRent features a dedicated property marketplace where you can search for apartments, houses, and commercial spaces directly from verified landlords and managers." }
];

async function getFeaturedListings() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'; 
  
  try {
    const res = await fetch(`${apiUrl}/api/v1/marketplace/listings?limit=3`, {
      next: { revalidate: 60 } 
    });
    
    if (res.ok) {
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        return json.data;
      }
    }
  } catch (error) {
    console.error("Marketplace fetch error:", error);
  }

  // SMART FALLBACK
  return [
    {
      "id": "e82362c0-decb-40a9-9111-a02c06ca6bfd",
      "unit_number": "LMH2003",
      "property": { "name": "Lumumba Heights", "address": "Mwihoko 46" },
      "unit_type": "APARTMENT",
      "bedrooms": 2,
      "bathrooms": 1.0,
      "rent_amount": 22000.0,
      "images": [
        { "url": "https://res.cloudinary.com/dwgjssoyf/image/upload/v1788347905/mogirentos/units/e82362c0-decb-40a9-9111-a02c06ca6bfd/mf98irqjhelhmuycruo3.png" }
      ]
    },
    {
      "id": "df653341-f5b1-4f95-b5cb-fe31f1793279",
      "unit_number": "LMH1003",
      "property": { "name": "Lumumba Heights", "address": "Mwihoko 46" },
      "unit_type": "APARTMENT",
      "bedrooms": 1,
      "bathrooms": 1.0,
      "rent_amount": 15000.0,
      "images": [
        { "url": "https://res.cloudinary.com/dwgjssoyf/image/upload/v1788347557/mogirentos/units/df653341-f5b1-4f95-b5cb-fe31f1793279/bp35lkqlqj5ojte28anh.png" }
      ]
    },
    {
      "id": "7d0bb782-027e-48ab-9861-ffc73b6eb2d0",
      "unit_number": "BN2006",
      "property": { "name": "Gilgal Apartment", "address": "Mwihiko 46" },
      "unit_type": "APARTMENT",
      "bedrooms": 2,
      "bathrooms": 2.0,
      "rent_amount": 32000.0,
      "images": [
        { "url": "https://res.cloudinary.com/dwgjssoyf/image/upload/v1788348034/mogirentos/units/7d0bb782-027e-48ab-9861-ffc73b6eb2d0/qhb20eukbq7aaljl6jcc.png" }
      ]
    }
  ];
}

export default async function HomePage() {
  const listings = await getFeaturedListings();

  return (
    <>
      {/* 
        JSON-LD Scripts placed SAFELY outside the main flex wrapper.
        Using Next.js <Script> with unique IDs prevents hydration mismatch.
      */}
      <Script id="json-ld-org" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }} />
      <Script id="json-ld-web" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }} />

      <div className="flex min-h-screen flex-col bg-[#f6f8f9] font-sans selection:bg-[#1f8898]/30">
        
        <Navbar />

        <main className="flex-1">
          
          {/* --- 1. HERO SECTION --- */}
          <section className="relative min-h-[85vh] flex flex-col items-center justify-center pt-24 pb-20 px-6 lg:px-8 overflow-hidden">
            <div className="absolute inset-0 z-0 bg-[#0f172a]">
              <img 
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2000&auto=format&fit=crop" 
                alt="Premium Kenya Real Estate" 
                className="w-full h-full object-cover opacity-60 mix-blend-overlay"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/60 via-transparent to-[#f6f8f9]"></div>
            </div>

            <div className="relative z-10 w-full max-w-5xl mx-auto text-center mt-12 sm:mt-20">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6 leading-[1.05] drop-shadow-lg">
                Find your next home.<br className="hidden sm:block" />
                <span className="text-teal-300">Manage your properties.</span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-gray-200 font-medium leading-relaxed max-w-2xl mx-auto mb-12 drop-shadow-md">
                MogiRent makes renting simpler — helping house hunters discover available properties while giving landlords the tools to manage operations.
              </p>

              <div className="relative w-full max-w-4xl mx-auto mb-8">
                <HeroSearch />
              </div>

              <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm font-bold text-white hover:text-teal-300 transition-colors drop-shadow-md">
                Browse all available homes <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>

          {/* --- 2. TRENDING ON MOGIRENT --- */}
          <section className="py-20 px-6 lg:px-8 max-w-7xl mx-auto relative z-20 -mt-16">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
              <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Trending on MogiRent</h2>
                <p className="text-sm font-medium text-gray-500 mt-2">Highly-rated properties catching attention right now.</p>
              </div>
              <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm font-bold text-[#1f8898] hover:text-[#0f4952] transition-colors bg-white px-5 py-2.5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md">
                View Marketplace <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {listings.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-[2rem] border border-dashed border-gray-200 shadow-sm">
                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-black text-gray-900 mb-2">No trending properties</h3>
                <p className="text-sm text-gray-500 mb-6">Check the marketplace for the latest additions.</p>
                <Link href="/marketplace" className="bg-[#1f8898] text-white px-6 py-3 rounded-xl font-bold shadow-sm inline-flex">Explore Market</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {listings.map((listing: any) => (
                  <Link href={`/marketplace?id=${listing.id}`} key={listing.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-[#1f8898]/10 hover:-translate-y-1.5 transition-all duration-300 group flex flex-col relative">
                    
                    <FavoriteButton />

                    <div className="h-56 w-full relative bg-gray-100 overflow-hidden">
                      {listing.images?.[0]?.url ? (
                         <img src={listing.images[0].url} alt={listing.public_description || "Property"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                         <div className="w-full h-full flex items-center justify-center bg-gray-50"><Building2 className="w-12 h-12 text-gray-300" /></div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>

                      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 items-start">
                        <div className="bg-white/90 text-gray-900 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 backdrop-blur-md">
                          <LockKeyhole className="w-3 h-3 text-amber-500" /> Premium
                        </div>
                        {listing.rent_amount < 40000 && (
                          <div className="bg-rose-500 text-white px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 backdrop-blur-md">
                            <TrendingDown className="w-3 h-3" /> Trending
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col bg-white">
                      <h3 className="text-xl font-black text-gray-900 leading-tight mb-1 truncate">
                        <span>Unit {listing.unit_number}</span>
                        <span className="text-gray-300 font-normal mx-1.5">•</span>
                        <span className="text-[#1f8898]">{listing.property?.name || 'Property'}</span>
                      </h3>
                      
                      <p className="text-xs font-bold text-gray-500 flex items-center gap-1.5 mb-5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-[#1f8898]" /> {listing.property?.address || 'Location on request'}
                      </p>
                      
                      <div className="flex gap-3 mb-6 text-xs font-bold text-gray-700 flex-wrap">
                        <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                          <Building2 className="w-3.5 h-3.5 text-gray-400" /> {listing.unit_type?.replace('_', ' ') || 'APARTMENT'}
                        </div>
                        {listing.bedrooms && (
                          <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                            <BedDouble className="w-3.5 h-3.5 text-gray-400" /> {listing.bedrooms}
                          </div>
                        )}
                        {listing.bathrooms && (
                          <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                            <Bath className="w-3.5 h-3.5 text-gray-400" /> {listing.bathrooms}
                          </div>
                        )}
                      </div>

                      <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                        <div>
                          <p className="text-[9px] uppercase tracking-widest font-black text-gray-400 mb-0.5">Monthly Rent</p>
                          <h4 className="text-xl font-black text-[#1f8898] leading-none">KSh {Number(listing.rent_amount).toLocaleString()}</h4>
                        </div>
                        <div className="p-2 rounded-xl transition-all bg-gray-50 text-gray-400 hover:bg-[#1f8898] hover:text-white shadow-sm">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            
            <div className="flex justify-center mt-10 sm:hidden">
              <Link href="/marketplace" className="w-full flex items-center justify-center gap-2 bg-white px-6 py-3.5 rounded-xl border border-gray-200 text-gray-700 font-bold shadow-sm">
                View All Properties <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>

          {/* --- 3. HOUSE HUNTING (EDITORIAL SPLIT) --- */}
          <section className="py-24 bg-white border-y border-gray-100 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                
                {/* Left: Image Collage / Visual */}
                <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl order-2 lg:order-1 hidden md:block">
                  <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop" alt="House Hunting" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-8 left-8 right-8">
                    <h3 className="text-3xl font-black text-white mb-2 tracking-tight">Your next home starts here.</h3>
                    <p className="text-white/80 font-medium">Thousands of rental decisions start with finding the right property.</p>
                  </div>
                </div>

                {/* Right: Steps */}
                <div className="order-1 lg:order-2">
                  <span className="text-[10px] font-black text-[#1f8898] uppercase tracking-[0.2em] mb-4 inline-block">For House Hunters</span>
                  <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-10">House hunting, made simpler.</h2>
                  
                  <div className="space-y-8">
                    <div className="flex items-start gap-5">
                      <div className="w-12 h-12 bg-[#ebf3f5] rounded-xl flex items-center justify-center shrink-0 text-[#1f8898]"><Search className="w-6 h-6" /></div>
                      <div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">Search</h3>
                        <p className="text-gray-600 font-medium leading-relaxed">Find homes based on your preferred location, property type, and budget.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-5">
                      <div className="w-12 h-12 bg-[#ebf3f5] rounded-xl flex items-center justify-center shrink-0 text-[#1f8898]"><Eye className="w-6 h-6" /></div>
                      <div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">Discover</h3>
                        <p className="text-gray-600 font-medium leading-relaxed">Explore high-quality property photos, unit availability, and transparent rental details.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-5">
                      <div className="w-12 h-12 bg-[#ebf3f5] rounded-xl flex items-center justify-center shrink-0 text-[#1f8898]"><MessageCircle className="w-6 h-6" /></div>
                      <div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">Connect</h3>
                        <p className="text-gray-600 font-medium leading-relaxed">Get in touch with verified landlords and property managers directly through the platform.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-5">
                      <div className="w-12 h-12 bg-[#ebf3f5] rounded-xl flex items-center justify-center shrink-0 text-[#1f8898]"><KeyRound className="w-6 h-6" /></div>
                      <div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">Move Forward</h3>
                        <p className="text-gray-600 font-medium leading-relaxed">Choose a property that works for you and settle into your new home.</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* --- 4. THE BRIDGE DIAGRAM (TWO-SIDED PLATFORM) --- */}
          <section className="py-24 bg-[#0f172a] text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
            
            <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-16">One platform. Two connected experiences.</h2>
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 lg:gap-10">
                
                {/* House Hunters Node */}
                <div className="w-full md:w-1/3 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 text-center hover:bg-white/10 transition-colors">
                  <div className="w-16 h-16 bg-[#1f8898]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-teal-300 border border-[#1f8898]/30">
                    <Search className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black mb-3">House Hunters</h3>
                  <p className="text-teal-50/70 text-sm font-medium">Discover homes, view details, and contact property managers.</p>
                </div>

                {/* Connector */}
                <div className="hidden md:flex items-center justify-center">
                  <ArrowRight className="w-8 h-8 text-white/20" />
                </div>
                <div className="flex md:hidden items-center justify-center py-2">
                  <ArrowDown className="w-8 h-8 text-white/20" />
                </div>

                {/* Central Platform Node */}
                <div className="w-full md:w-1/3 bg-gradient-to-br from-[#1f8898] to-[#0f4952] rounded-3xl p-8 text-center shadow-2xl ring-4 ring-white/5 relative z-10 scale-105">
                  <Building2 className="w-12 h-12 text-white mx-auto mb-4" />
                  <h3 className="text-2xl font-black mb-2 tracking-tight">MogiRent</h3>
                  <p className="text-teal-200 text-[10px] font-black uppercase tracking-widest">Property Platform</p>
                </div>

                {/* Connector */}
                <div className="hidden md:flex items-center justify-center">
                  <ArrowRight className="w-8 h-8 text-white/20" />
                </div>
                <div className="flex md:hidden items-center justify-center py-2">
                  <ArrowDown className="w-8 h-8 text-white/20" />
                </div>

                {/* Managers Node */}
                <div className="w-full md:w-1/3 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 text-center hover:bg-white/10 transition-colors">
                  <div className="w-16 h-16 bg-[#1f8898]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-teal-300 border border-[#1f8898]/30">
                    <Users className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black mb-3">Owners & Managers</h3>
                  <p className="text-teal-50/70 text-sm font-medium">Manage units, track rent, and handle day-to-day operations.</p>
                </div>

              </div>
            </div>
          </section>

          {/* --- 5. PROPERTY MANAGEMENT SHOWCASE --- */}
          <section className="pt-24 pb-20 bg-[#f6f8f9]">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <div className="text-center mb-16 max-w-3xl mx-auto">
                <span className="text-[10px] font-black text-[#1f8898] uppercase tracking-[0.2em] mb-4 inline-block">Property Management</span>
                <h2 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight mb-6 leading-tight">For the people who manage property.</h2>
                <p className="text-base sm:text-lg text-gray-600 font-medium leading-relaxed">
                  MogiRent gives landlords and property managers one place to organise their properties, tenants, and rental operations.
                </p>
              </div>

              <DashboardSlideshow />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16 max-w-6xl mx-auto mt-16">
                <div>
                  <Building2 className="w-8 h-8 text-[#1f8898] mb-5" />
                  <h3 className="text-xl font-black text-gray-900 mb-3">Properties</h3>
                  <p className="text-sm font-medium text-gray-600 leading-relaxed">Organise properties and units. Maintain clear records of your entire portfolio in one structured workspace.</p>
                </div>
                <div>
                  <Users className="w-8 h-8 text-[#1f8898] mb-5" />
                  <h3 className="text-xl font-black text-gray-900 mb-3">Tenants</h3>
                  <p className="text-sm font-medium text-gray-600 leading-relaxed">Keep tenant and occupancy records organised. Know exactly who occupies which unit and view lease histories.</p>
                </div>
                <div>
                  <CreditCard className="w-8 h-8 text-[#1f8898] mb-5" />
                  <h3 className="text-xl font-black text-gray-900 mb-3">Rent & Collections</h3>
                  <p className="text-sm font-medium text-gray-600 leading-relaxed">Track rent and payment records. Generate invoices and maintain clear financial histories for every tenancy.</p>
                </div>
                <div>
                  <AlertTriangle className="w-8 h-8 text-[#1f8898] mb-5" />
                  <h3 className="text-xl font-black text-gray-900 mb-3">Arrears</h3>
                  <p className="text-sm font-medium text-gray-600 leading-relaxed">See outstanding balances instantly. Understand exactly who owes what and which accounts require attention.</p>
                </div>
                <div>
                  <Wrench className="w-8 h-8 text-[#1f8898] mb-5" />
                  <h3 className="text-xl font-black text-gray-900 mb-3">Maintenance</h3>
                  <p className="text-sm font-medium text-gray-600 leading-relaxed">Organise maintenance requests. Log issues, coordinate with vendors, and track repair status from start to finish.</p>
                </div>
                <div>
                  <BarChart3 className="w-8 h-8 text-[#1f8898] mb-5" />
                  <h3 className="text-xl font-black text-gray-900 mb-3">Reports</h3>
                  <p className="text-sm font-medium text-gray-600 leading-relaxed">Understand your rental operations. Export clear data on occupancy, arrears, and property performance.</p>
                </div>
              </div>

            </div>
          </section>

          {/* --- 6. BUILT FOR KENYA --- */}
          <section className="py-24 bg-[#0f172a] text-white">
            <div className="max-w-6xl mx-auto px-6 lg:px-8 grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-8 leading-tight">Built for Kenya.</h2>
                <p className="text-lg text-gray-300 font-medium leading-relaxed mb-6">
                  Rental operations are different everywhere. Western software often fails to understand local property realities.
                </p>
                <p className="text-lg text-gray-300 font-medium leading-relaxed mb-10">
                  MogiRent is designed around the workflows property owners and managers actually use — accommodating KSh billing, local tenancy structures, and multi-unit residential management.
                </p>
                <div className="flex gap-4">
                  <div className="bg-white/10 px-5 py-3 rounded-xl border border-white/10">
                    <span className="block text-[#4fd1c5] font-black text-xl">KSh</span>
                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mt-1 block">Local Currency</span>
                  </div>
                  <div className="bg-white/10 px-5 py-3 rounded-xl border border-white/10">
                    <Building2 className="w-6 h-6 text-[#4fd1c5]" />
                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mt-2 block">Multi-Unit</span>
                  </div>
                </div>
              </div>

              <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl border border-gray-800">
                <img 
                  src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=800&auto=format&fit=crop" 
                  alt="Nairobi Skyline" 
                  className="w-full h-full object-cover opacity-80"
                />
              </div>
            </div>
          </section>

          {/* --- 7. HOUSE HUNTER CTA --- */}
          <section className="py-16 bg-[#ebf3f5] border-y border-[#1f8898]/10 text-center">
            <div className="max-w-3xl mx-auto px-6">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-4">Still looking for a home?</h2>
              <p className="text-gray-600 font-medium mb-8">Browse available apartments, houses, and commercial spaces on MogiRent.</p>
              <Link href="/marketplace" className="inline-flex items-center justify-center gap-2 bg-[#1f8898] hover:bg-[#0f4952] text-white px-8 py-4 rounded-xl font-black text-sm transition-all shadow-md">
                Find a Home <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>

          {/* --- 8. PRICING PREVIEW --- */}
          <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-[10px] font-black text-[#1f8898] uppercase tracking-[0.2em] mb-4 inline-block">Pricing</h2>
                <h3 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-4">Simple, portfolio-based pricing.</h3>
                <p className="text-gray-600 font-medium">Start with the tools you need today and upgrade as your property portfolio grows.</p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[
                  { name: "Starter", price: "1,500", limit: "1 Property" },
                  { name: "Basic", price: "2,500", limit: "Up to 3 Properties" },
                  { name: "Standard", price: "4,500", limit: "Up to 5 Properties", popular: true },
                  { name: "Professional", price: "6,500", limit: "Unlimited" }
                ].map((plan, i) => (
                  <div key={i} className={`p-8 rounded-3xl border ${plan.popular ? 'bg-[#0f4952] border-[#0f4952] text-white shadow-xl lg:-translate-y-2 ring-4 ring-[#1f8898]/20' : 'bg-white border-gray-200 text-gray-900 shadow-sm hover:border-[#1f8898]/40 transition-colors'}`}>
                    <h4 className="font-black text-lg mb-4">{plan.name}</h4>
                    <div className="mb-6">
                      <span className={`text-xs font-bold ${plan.popular ? 'text-teal-200' : 'text-gray-400'}`}>KSh </span>
                      <span className="text-3xl font-black tracking-tight">{plan.price}</span>
                      <span className={`text-xs font-bold ${plan.popular ? 'text-teal-200/70' : 'text-gray-400'}`}>/mo</span>
                    </div>
                    <div className={`text-xs font-bold p-3 rounded-xl border ${plan.popular ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-50 border-gray-100 text-gray-700'}`}>
                      {plan.limit}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center">
                <Link href="/pricing" className="text-sm font-bold text-[#1f8898] hover:text-[#0f4952] transition-colors underline underline-offset-4">
                  View Full Pricing & Features
                </Link>
              </div>
            </div>
          </section>

          {/* --- 9. FAQ PREVIEW --- */}
          <section className="py-24 bg-[#f6f8f9] border-t border-gray-200/60">
            <div className="max-w-6xl mx-auto px-6 lg:px-8">
              <div className="grid lg:grid-cols-12 gap-12 items-start">
                <div className="lg:col-span-5">
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-4">Common Questions</h2>
                  <p className="text-gray-600 font-medium mb-8 leading-relaxed max-w-sm">
                    Have questions about how MogiRent connects house hunters with property managers?
                  </p>
                  <Link href="/faq" className="inline-flex items-center gap-2 text-sm font-bold text-[#1f8898] hover:text-[#0f4952] transition-colors bg-white px-6 py-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md">
                    Read our full FAQ <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="lg:col-span-7">
                  <HomeFaq faqs={previewFaqs} />
                </div>
              </div>
            </div>
          </section>

          {/* --- 10. FINAL DUAL CTA --- */}
          <section className="relative py-24 sm:py-32 overflow-hidden bg-[#0f172a]">
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000&auto=format&fit=crop" 
                alt="Modern Real Estate Architecture" 
                className="w-full h-full object-cover opacity-30 mix-blend-overlay grayscale"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f4952]/90 via-[#0f172a]/80 to-[#0f172a]/90"></div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-8 leading-tight drop-shadow-md">
                Find a home. Manage a property.<br/>One platform.
              </h2>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-10">
                <Link href="/marketplace" className="w-full sm:w-auto inline-flex items-center justify-center bg-white text-[#0f4952] hover:bg-gray-100 px-8 py-4 rounded-xl font-black text-sm transition-all shadow-xl active:scale-95">
                  Find a Home
                </Link>
                <Link href="/register" className="w-full sm:w-auto inline-flex items-center justify-center bg-[#1f8898] text-white hover:bg-[#156a77] border border-[#1f8898] px-8 py-4 rounded-xl font-black text-sm transition-all shadow-xl active:scale-95">
                  Manage Your Properties
                </Link>
              </div>
            </div>
          </section>

        </main>

        <Footer />
        
        <FloatingWhatsApp />
        
      </div>
    </>
  );
}