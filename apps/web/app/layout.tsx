// apps/web/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import NextTopLoader from 'nextjs-toploader';
import { Toaster } from 'sonner';

// @ts-ignore: TS doesn't recognize CSS module imports, but Next.js handles it perfectly.
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: 'swap', // Ensures text remains visible while webfont loads
});

// --- Advanced SEO & Viewport Configuration ---
export const viewport: Viewport = {
  themeColor: '#1f8898',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://rentos.mogitechglobal.com'),
  title: {
    default: 'MogiRentOS | Smart Property Management Software',
    template: '%s | MogiRentOS'
  },
  description: 'The ultimate property management system for modern landlords. Automate rent collection, sync M-Pesa payments, manage tenants, and track maintenance effortlessly.',
  manifest: '/site.webmanifest',
  keywords: [
    'Property Management Software',
    'Rent Collection App',
    'Landlord ERP',
    'M-Pesa Rent Integration',
    'Tenant Management System',
    'Real Estate Software Kenya',
    'Property Maintenance Tracker',
    'MogiRentOS',
    'Mogitech Global'
  ],
  authors: [{ name: 'Mogitech Global Ltd', url: 'https://mogitechglobal.com' }],
  creator: 'Mogitech Global Ltd',
  publisher: 'Mogitech Global Ltd',
  applicationName: 'MogiRentOS',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // --- Open Graph (For beautiful WhatsApp, Facebook, and LinkedIn link previews) ---
  openGraph: {
    title: 'MogiRentOS | Smart Property Management Software',
    description: 'Automate your property portfolio with seamless rent collection, M-Pesa tracking, and tenant management.',
    url: 'https://rentos.mogitechglobal.com',
    siteName: 'MogiRentOS',
    images: [
      {
        url: '/og-image.jpg', // Create a 1200x630px image of your dashboard and place it in the public folder
        width: 1200,
        height: 630,
        alt: 'MogiRentOS Dashboard Preview',
      },
    ],
    locale: 'en_KE', // Optimized for the Kenyan locale, but works globally
    type: 'website',
  },
  // --- Twitter Cards ---
  twitter: {
    card: 'summary_large_image',
    title: 'MogiRentOS | Property Management Reimagined',
    description: 'Automate your rent collection and tenant management with MogiRentOS.',
    creator: '@MogitechGlobal', // Replace with your actual Twitter handle
    images: ['/og-image.jpg'],
  },
  // --- Search Engine Crawler Directives ---
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning is CRITICAL here to prevent browser extensions from crashing the Next.js hydration process
    <html lang="en" className={`${inter.variable} font-sans scroll-smooth`} suppressHydrationWarning>
      {/* - antialiased: Makes fonts render sharper and cleaner on Mac/iOS
          - bg-[#f8fafb]: A modern, ultra-light gray/blue base instead of stark white
          - selection: Global text highlight color matches the brand theme
          - min-h-screen & flex-col: Ensures footers always push to the bottom of the page
      */}
      <body className="bg-[#f8fafb] text-gray-900 antialiased selection:bg-[#1f8898]/30 selection:text-[#0f4952] min-h-screen flex flex-col">
        
        {/* 1. Global Navigation Progress Bar */}
        {/* Matches your MogiRentOS branding color (#1f8898) */}
        <NextTopLoader 
          color="#1f8898"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false} 
          easing="ease"
          speed={200}
          shadow="0 0 10px #1f8898,0 0 5px #1f8898"
        />

        {/* 2. Main Application Wrapper */}
        {/* flex-1 ensures the main content pushes any future footer to the bottom */}
        <main className="flex-1 flex flex-col relative">
          {children}
        </main>

        {/* 3. Global Toast Notifications */}
        {/* richColors automatically styles success as green, error as red, etc. */}
        <Toaster 
          position="top-right" 
          richColors 
          expand={false}
          toastOptions={{
            style: {
              fontFamily: 'var(--font-inter)',
            }
          }}
        />
        
      </body>
    </html>
  );
}