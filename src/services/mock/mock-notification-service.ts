import { notificationsData } from '@/data/mock/notifications'
import { isVisibleToRole, type NotificationService } from '@/services/notifications'
import {
  NOTIFICATION_MODULES,
  type NotificationModule,
} from '@/types/notifications'

/** Read-only implementation: the notification feed never mutates in place. */
export const mockNotificationService: NotificationService = {
  async listNotifications(role) {
    return notificationsData
      .filter((notification) => isVisibleToRole(notification, role))
      .slice()
      .sort((a, b) => b.time.localeCompare(a.time))
  },

  async getCounters(role) {
    const visible = notificationsData.filter((notification) =>
      isVisibleToRole(notification, role),
    )
    const byModule = NOTIFICATION_MODULES.reduce(
      (acc, module) => {
        acc[module] = visible.filter((notification) => notification.module === module).length
        return acc
      },
      {} as Record<NotificationModule, number>,
    )
    return { total: visible.length, unread: 0, byModule }
  },
}
