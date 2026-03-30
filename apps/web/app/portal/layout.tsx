// apps/web/app/portal/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Inter } from 'next/font/google';

// Import the brand new component!
import TenantSidebar from '@/components/TenantSidebar'; 

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function TenantPortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  
  // We keep the fetch here since Tenants don't use the landlord useUserStore
  const [tenantProfile, setTenantProfile] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portal/my-lease`, {
          credentials: 'include' 
        });
        
        // If the backend rejects the cookie, kick them to login
        if (res.status === 401 || res.status === 403) {
          router.push('/login');
          return;
        }

        if (res.ok) {
          const data = await res.json();
          setTenantProfile(data);
          setIsAuthorized(true); // Approve rendering
        }
      } catch (err) {
        console.error("Failed to load tenant profile");
        router.push('/login');
      }
    };

    fetchProfile();
  }, [router]);

  // Prevent rendering until security validates the cookie
  if (!isAuthorized) return <div className="min-h-screen bg-[#ebf3f5]"></div>;

  return (
    <div className={`flex flex-col md:flex-row h-screen bg-[#ebf3f5] overflow-hidden ${inter.variable} font-sans w-full`}>
      
      {/* Abstracted Sidebar Component */}
      <TenantSidebar profile={tenantProfile} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full relative bg-[#ebf3f5]">
        {children}
      </main>

    </div>
  );
}