import { BellRing } from 'lucide-react'
import { cn } from 'cn'
import { EmptyState } from '@/components/common/empty-state'
import { StatusBadge } from '@/components/common/status-badge'
import type { FamilyNotification } from '@/types/family'
import { notificationToneFor } from '@/lib/family'
import { formatDateTime } from '@/lib/clinical'

function NotificationItem({ notification }: { notification: FamilyNotification }) {
  return (
    <li className="flex gap-3 rounded-lg border p-3">
      <span
        aria-hidden="true"
        className={cn(
          'mt-1.5 size-2 shrink-0 rounded-full',
          notification.importance === 'critical' && 'bg-red-500',
          notification.importance === 'warning' && 'bg-amber-500',
          notification.importance === 'info' && 'bg-sky-500',
          notification.read && 'opacity-30',
        )}
      />
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium">{notification.title}</p>
          <StatusBadge
            tone={notificationToneFor(notification.importance)}
            label={notification.importance}
          />
        </div>
        <p className="text-sm text-muted-foreground">{notification.message}</p>
        <p className="text-xs text-muted-foreground/70">
          {formatDateTime(notification.createdAt)}
        </p>
      </div>
    </li>
  )
}

interface FamilyNotificationsProps {
  notifications: FamilyNotification[]
}

/** Family-facing notifications, ordered newest first. */
export function FamilyNotifications({ notifications }: FamilyNotificationsProps) {
  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={BellRing}
        title="No notifications"
        description="Updates for the family will appear here."
      />
    )
  }

  return (
    <ul className="space-y-2">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </ul>
  )
}