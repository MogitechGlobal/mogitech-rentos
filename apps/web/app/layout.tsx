// apps/web/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// --- Advanced SEO & Viewport Configuration ---
export const viewport: Viewport = {
  themeColor: '#1f8898',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://mogirentos.com'), // Change this to your actual production domain later
  title: {
    default: 'MogiRentOS | Smart Property Management Software',
    template: '%s | MogiRentOS'
  },
  description: 'The ultimate property management system for modern landlords. Automate rent collection, sync M-Pesa payments, manage tenants, and track maintenance effortlessly.',
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
    url: 'https://mogirentos.com',
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
    <html lang="en" className={`${inter.variable} font-sans`}>
      <body className="bg-[#ebf3f5] text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}