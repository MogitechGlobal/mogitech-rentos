// apps/web/store/useUserStore.ts
import { create } from 'zustand';

interface UserState {
  profile: any;
  isPremium: boolean;
  isLoading: boolean;
  fetchProfile: () => Promise<void>;
  setProfile: (newProfile: any) => void;
  clearProfile: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  isPremium: false,
  isLoading: true,

  fetchProfile: async () => {
    // Only run on the client
    if (typeof window === 'undefined') return; 

    try {
      // 1. Ping the backend securely with HTTP-Only cookies
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/landlords/profile`, {
        credentials: 'include' 
      });
      
      // 2. Graceful Silent Exit for Guests (Handles the 401)
      if (res.status === 401 || res.status === 403) {
        set({ profile: null, isPremium: false, isLoading: false });
        return; 
      }
      
      // 3. Successful Login State
      if (res.ok) {
        const data = await res.json();
        const planTier = data?.subscription_plan || data?.landlord?.subscription_plan || 'FREE';
        
        set({ 
          profile: data, 
          isPremium: planTier === 'PREMIUM' || planTier === 'PRO',
          isLoading: false 
        });
      } else {
        set({ profile: null, isPremium: false, isLoading: false });
      }

    } catch (err) {
      // This will only log if your actual NestJS server is offline or blocked by CORS
      console.error('Network error while checking session. Is the backend running?', err);
      set({ profile: null, isPremium: false, isLoading: false });
    }
  },

  setProfile: (newProfile) => {
    const planTier = newProfile?.subscription_plan || newProfile?.landlord?.subscription_plan || 'FREE';
    set({ 
      profile: newProfile, 
      isPremium: planTier === 'PREMIUM' || planTier === 'PRO' 
    });
  },

  clearProfile: () => set({ profile: null, isPremium: false, isLoading: false })
}));