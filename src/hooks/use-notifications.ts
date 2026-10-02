import { useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { notificationService } from '@/services'
import { useNotificationStore } from '@/store/use-notification-store'
import type { UserRole } from '@/types/auth'
import type { NotificationItem } from '@/types/notifications'

interface UseNotificationsResult {
  notifications: NotificationItem[]
  unreadCount: number
  unreadIds: string[]
  isLoading: boolean
  isError: boolean
  refetch: () => void
  isRead: (id: string) => boolean
  markRead: (id: string) => void
  markUnread: (id: string) => void
  markAllRead: () => void
  resetAll: () => void
}

/**
 * Role-scoped notification feed plus read/unread actions. Both the topbar
 * popover and the full notification centre consume this, so the unread badge
 * and the page can never disagree.
 */
export function useNotifications(role: UserRole | undefined): UseNotificationsResult {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['notifications', role ?? 'guest'],
    queryFn: () => notificationService.listNotifications(role),
  })

  const readIds = useNotificationStore((state) => state.readIds)
  const storeMarkRead = useNotificationStore((state) => state.markRead)
  const storeMarkUnread = useNotificationStore((state) => state.markUnread)
  const storeMarkAllRead = useNotificationStore((state) => state.markAllRead)
  const storeResetAll = useNotificationStore((state) => state.resetAll)

  const notifications = useMemo(() => data ?? [], [data])

  const readSet = useMemo(() => new Set(readIds), [readIds])
  const unreadIds = useMemo(
    () => notifications.filter((item) => !readSet.has(item.id)).map((item) => item.id),
    [notifications, readSet],
  )

  const isRead = useCallback((id: string) => readSet.has(id), [readSet])
  const markRead = useCallback((id: string) => storeMarkRead(id), [storeMarkRead])
  const markUnread = useCallback((id: string) => storeMarkUnread(id), [storeMarkUnread])
  const markAllRead = useCallback(
    () => storeMarkAllRead(notifications.map((item) => item.id)),
    [notifications, storeMarkAllRead],
  )

  return {
    notifications,
    unreadCount: unreadIds.length,
    unreadIds,
    isLoading,
    isError,
    refetch: () => void refetch(),
    isRead,
    markRead,
    markUnread,
    markAllRead,
    resetAll: storeResetAll,
  }
}
