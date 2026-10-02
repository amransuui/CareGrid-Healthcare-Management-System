import type { NotificationCounters, NotificationItem } from '@/types/notifications'
import type { UserRole } from '@/types/auth'

/**
 * Notification service contract. Role scoping happens server-side in the
 * future (the Spring Boot API only returns notifications the caller may see);
 * the mock performs the same filter locally.
 */
export interface NotificationService {
  listNotifications(role?: UserRole): Promise<NotificationItem[]>
  getCounters(role?: UserRole): Promise<NotificationCounters>
}

/** True when a notification is addressed to the given role. */
export function isVisibleToRole(
  notification: NotificationItem,
  role: UserRole | undefined,
): boolean {
  if (!notification.audience.length) return true
  if (!role) return false
  return notification.audience.includes(role)
}
