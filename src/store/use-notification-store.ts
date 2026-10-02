import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Client-side read/unread state for demo notifications. This is purely a UI
 * convenience: it is not synced to any backend, and the real read receipts
 * will arrive with the Spring Boot notification API.
 */
interface NotificationUiState {
  readIds: string[]
  isRead: (id: string) => boolean
  markRead: (id: string) => void
  markUnread: (id: string) => void
  markAllRead: (ids: string[]) => void
  resetAll: () => void
}

export const useNotificationStore = create<NotificationUiState>()(
  persist(
    (set, get) => ({
      readIds: [],
      isRead: (id) => get().readIds.includes(id),
      markRead: (id) =>
        set((state) =>
          state.readIds.includes(id) ? state : { readIds: [...state.readIds, id] },
        ),
      markUnread: (id) =>
        set((state) => ({ readIds: state.readIds.filter((entry) => entry !== id) })),
      markAllRead: (ids) => set(() => ({ readIds: [...ids] })),
      resetAll: () => set(() => ({ readIds: [] })),
    }),
    {
      name: 'caregrid-notifications',
      partialize: (state) => ({ readIds: state.readIds }),
    },
  ),
)
