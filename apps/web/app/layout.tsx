// apps/web/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import NextTopLoader from 'nextjs-toploader';
import { Toaster } from 'sonner';
import { Providers } from '@/components/Providers'; // <-- NEW: Imported Providers

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
  userScalable: true, // Accessibility best practice
};

export const metadata: Metadata = {
  metadataBase: new URL('https://rentos.mogitechglobal.com'),
  title: {
    default: 'MogiRentOS | Smart Property Management & ERP Software',
    template: '%s | MogiRentOS'
  },
  description: 'The ultimate cloud-based property management system for modern landlords and agencies. Automate rent collection, sync M-Pesa Paybill payments, manage tenant leases, and track maintenance effortlessly.',
  applicationName: 'MogiRentOS',
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  keywords: [
    // Core Product
    'Property Management Software',
    'Real Estate ERP',
    'Landlord Software',
    'Tenant Management System',
    'Property CRM',
    // Features & Capabilities
    'Automated Rent Collection',
    'M-Pesa Rent Integration',
    'M-Pesa Paybill Software',
    'Lease Management Software',
    'Property Maintenance Tracker',
    'Automated Invoicing for Landlords',
    'Real Estate Accounting Software',
    'Digital Rent Receipts',
    // Regional & Target Audience (Highly Competitive)
    'Real Estate Software Kenya',
    'Property Management System Nairobi',
    'Sacco Property Management',
    'Chama Real Estate Software',
    'African PropTech Solutions',
    // Branding
    'MogiRentOS',
    'Mogitech Global Ltd'
  ],
  authors: [{ name: 'Mogitech Global Ltd', url: 'https://mogitechglobal.com' }],
  creator: 'Mogitech Global Ltd',
  publisher: 'Mogitech Global Ltd',
  category: 'Business & Real Estate Software',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  
  // --- Canonical URLs (Prevents SEO penalties for duplicate content) ---
  alternates: {
    canonical: '/',
    languages: {
      'en-KE': '/en-KE',
      'en-US': '/en-US',
    },
  },

  // --- Search Engine Crawler Directives ---
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-icon.png',
  },
  manifest: '/site.webmanifest',

  // --- Open Graph (For beautiful WhatsApp, Facebook, and LinkedIn link previews) ---
  openGraph: {
    title: 'MogiRentOS | Smart Property Management Software',
    description: 'Automate your property portfolio with seamless rent collection, M-Pesa tracking, and tenant management.',
    url: 'https://rentos.mogitechglobal.com',
    siteName: 'MogiRentOS ERP',
    images: [
      {
        url: '/og-image.jpg', // Create a 1200x630px image of your dashboard and place it in the public folder
        width: 1200,
        height: 630,
        alt: 'MogiRentOS Dashboard Preview',
        type: 'image/jpeg',
      },
    ],
    locale: 'en_KE', 
    alternateLocale: ['en_US', 'en_GB'],
    type: 'website',
  },

  // --- Twitter Cards ---
  twitter: {
    card: 'summary_large_image',
    title: 'MogiRentOS | Property Management Reimagined',
    description: 'Automate your rent collection and tenant management with MogiRentOS.',
    creator: '@MogitechGlobal', // Replace with your actual Twitter handle
    site: '@MogitechGlobal',
    images: {
      url: '/og-image.jpg',
      alt: 'MogiRentOS Dashboard',
    },
  },

  // --- Apple Web App Meta ---
  appleWebApp: {
    title: 'MogiRentOS',
    statusBarStyle: 'black-translucent',
    capable: true,
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
      <body className="bg-[#f8fafb] text-gray-900 antialiased selection:bg-[#1f8898]/30 selection:text-[#0f4952] min-h-screen flex flex-col">
        
        {/* NEW: Wrapped everything in the NextAuth Providers */}
        <Providers>
          {/* 1. Global Navigation Progress Bar */}
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
          <main className="flex-1 flex flex-col relative">
            {children}
          </main>

          {/* 3. Global Toast Notifications */}
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
        </Providers>
        
      </body>
    </html>
  );
}