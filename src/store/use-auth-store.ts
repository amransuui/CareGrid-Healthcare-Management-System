import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthSession } from '@/types/auth'

/**
 * Lightweight client-side session state only. It persists the demo session
 * so a refresh preserves sign-in state, and nothing more. Server data —
 * patients, inventory, workflows — will live behind services and React Query,
 * never here.
 */

const STORAGE_KEY = 'caregrid-auth-session'

interface AuthState {
  session: AuthSession | null
  /** True once the persisted session has been rehydrated from storage. */
  hydrated: boolean
  setSession: (session: AuthSession | null) => void
  markHydrated: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      hydrated: false,
      setSession: (session) => set({ session }),
      markHydrated: () => set({ hydrated: true }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ session: state.session }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated()
      },
    },
  ),
)

export const sessionIsValid = (session: AuthSession | null): boolean => {
  if (!session?.expiresAt) return false
  return new Date(session.expiresAt).getTime() > Date.now()
}

/** Clears the persisted session (used by logout and expired-session guards). */
export const clearAuthSession = () => useAuthStore.getState().setSession(null)