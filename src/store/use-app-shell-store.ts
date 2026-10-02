import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppShellState {
  /** Desktop sidebar collapsed to icons-only. */
  sidebarCollapsed: boolean
  /** Mobile navigation drawer open state. */
  mobileNavOpen: boolean
  toggleSidebar: () => void
  setMobileNavOpen: (open: boolean) => void
}

export const useAppShellStore = create<AppShellState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileNavOpen: false,
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
    }),
    {
      name: 'caregrid-app-shell',
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    },
  ),
)