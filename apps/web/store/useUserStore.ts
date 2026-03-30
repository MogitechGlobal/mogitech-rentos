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
      // Notice we are using credentials: 'include' instead of looking for localStorage!
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/landlords/profile`, {
        credentials: 'include' 
      });
      
      if (res.ok) {
        const data = await res.json();
        const planTier = data?.subscription_plan || data?.landlord?.subscription_plan || 'FREE';
        set({ 
          profile: data, 
          isPremium: planTier === 'PREMIUM' || planTier === 'PRO',
          isLoading: false 
        });
      } else {
        // If the backend rejects the cookie (401), we stop loading
        set({ isLoading: false });
      }
    } catch (err) {
      console.error('Failed to load profile to global store', err);
      set({ isLoading: false });
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