import { create } from 'zustand'

export type Theme = 'light' | 'dark' | 'system'

interface UiState {
  theme: Theme
  mobileNavOpen: boolean
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  openMobileNav: () => void
  closeMobileNav: () => void
}

const STORAGE_KEY = 'caregrid-theme'

function getInitialTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored
  }
  return 'system'
}

export const useUiStore = create<UiState>((set) => ({
  theme: getInitialTheme(),
  mobileNavOpen: false,

  setTheme: (theme) => {
    localStorage.setItem(STORAGE_KEY, theme)
    set({ theme })
  },

  toggleTheme: () =>
    set((state) => {
      const next =
        state.theme === 'dark'
          ? 'light'
          : state.theme === 'light'
            ? 'dark'
            : 'dark'
      localStorage.setItem(STORAGE_KEY, next)
      return { theme: next }
    }),

  openMobileNav: () => set({ mobileNavOpen: true }),
  closeMobileNav: () => set({ mobileNavOpen: false }),
}))