// apps/web/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import NextTopLoader from 'nextjs-toploader';
import { Toaster } from 'sonner';
import { Providers } from '@/components/Providers';
import Script from 'next/script';

// @ts-ignore: TS doesn't recognize CSS module imports, but Next.js handles it perfectly.
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#1f8898',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: true,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://rentos.mogitechglobal.com'),
  title: {
    default: 'MogiRentOS | Best Property Management Software in Kenya',
    template: '%s | MogiRentOS'
  },
  // INJECTED HIGH-INTENT KEYWORDS: "best property management software in Kenya", "automated rent collection", "M-Pesa Paybill", "cloud-based", "real estate ERP"
  description: 'The best property management software in Kenya. Automate rent collection, sync M-Pesa Paybill payments, Nairobi Rental Market Trends 2026, and manage tenant leases with our cloud-based real estate ERP system.',
  applicationName: 'MogiRentOS',
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',

  // META TAG FOR GOOGLE SEARCH CONSOLE OWNERSHIP VERIFICATION
  verification: {
    google: 'MW0JLto16rihwFyJUyJf66XpzNaTBPoSEO-P26j6ti4',
  },
  

  keywords: [
    // --- HIGH-INTENT (Ready to Buy) ---
    'best property management software in Kenya',
    'rental management system Nairobi',
    'automated rent collection software Kenya',
    'M-Pesa rent integration software',
    'real estate ERP system Africa',
    'tenant billing software Kenya',

    // --- MID-FUNNEL (Researching) ---
    'how to automate M-Pesa paybill reconciliation',
    'cloud-based landlord software',
    'tenant portal software for agencies',
    'Chama property management software',
    'digital lease agreement software Kenya',
    'maintenance tracking app for landlords',

    // --- BROAD / BRAND ---
    'PropTech solutions in Africa',
    'Property Management Software',
    'Landlord Software',
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

  alternates: {
    canonical: '/',
    languages: {
      'en-KE': '/en-KE',
      'en-US': '/en-US',
    },
  },

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

  openGraph: {
    title: 'MogiRentOS | Automated Rent Collection & Property ERP',
    description: 'Stop chasing rent. Automate your property portfolio with seamless M-Pesa tracking, digital leases, and tenant management in Kenya.',
    url: 'https://rentos.mogitechglobal.com',
    siteName: 'MogiRentOS ERP',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'MogiRentOS Property Management Dashboard Preview',
        type: 'image/jpeg',
      },
    ],
    locale: 'en_KE',
    alternateLocale: ['en_US', 'en_GB'],
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'MogiRentOS | Kenya\'s Top Real Estate ERP',
    description: 'Automate your rent collection and tenant management with MogiRentOS.',
    creator: '@MogitechGlobal',
    site: '@MogitechGlobal',
    images: {
      url: '/og-image.jpg',
      alt: 'MogiRentOS Dashboard',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} font-sans scroll-smooth`} suppressHydrationWarning>
      <head>
        {/* --- ADVANCED SEO: JSON-LD STRUCTURED DATA --- */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "MogiRentOS",
              "operatingSystem": "Web Application, Cloud-based",
              "applicationCategory": "BusinessApplication",
              // INJECTED KEYWORDS INTO SCHEMA DESCRIPTION
              "description": "The best rental management system in Nairobi. Smart property management and ERP software for landlords featuring automated rent collection, M-Pesa integration, and digital lease agreements.",
              "url": "https://rentos.mogitechglobal.com",
              "publisher": {
                "@type": "Organization",
                "name": "Mogitech Global Ltd",
                "url": "https://mogitechglobal.com"
              },
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "KES"
              }
            })
          }}
        />
      </head>
      <body className="bg-[#f8fafb] text-gray-900 antialiased selection:bg-[#1f8898]/30 selection:text-[#0f4952] min-h-screen flex flex-col">
        {/* --- 2. ADD GOOGLE ANALYTICS HERE --- */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=G-35VQPFF51H`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-35VQPFF51H');
            `,
          }}
        />
        {/* ---------------------------------- */}
        <Providers>
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

          <main className="flex-1 flex flex-col relative">
            {children}
          </main>

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