// apps/web/app/dashboard/layout.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';

// Make sure this path matches wherever your Sidebar component actually lives!
import Sidebar from '@/components/dashboard/Sidebar'; 

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { fetchProfile, isLoading } = useUserStore();

  useEffect(() => {
    fetchProfile();
  }, []);

  if (isLoading) {
    return <div className="min-h-screen bg-[#f8fafb]"></div>; 
  }

  return (
    // THE FIX: Added flex-col md:flex-row and w-full so it stacks correctly on mobile!
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-[#f8fafb] w-full">
       
       <Sidebar /> 

       <main className="flex-1 overflow-y-auto w-full relative">
          {children}
       </main>
    </div>
  );
}