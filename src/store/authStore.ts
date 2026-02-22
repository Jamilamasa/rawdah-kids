'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, Family } from '@/types';

interface AuthState {
  user: User | null;
  family: Family | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setSession: (data: { user: User; family: Family; access_token: string }) => void;
  clearSession: () => void;
  updateUser: (updates: Partial<User>) => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      family: null,
      accessToken: null,
      isAuthenticated: false,
      hasHydrated: false,
      setSession: ({ user, family, access_token }) =>
        set({ user, family, accessToken: access_token, isAuthenticated: true }),
      clearSession: () =>
        set({ user: null, family: null, accessToken: null, isAuthenticated: false }),
      updateUser: (updates) =>
        set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'rawdah-kids-auth',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
