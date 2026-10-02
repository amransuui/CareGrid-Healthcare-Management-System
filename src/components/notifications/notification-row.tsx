import { useCallback } from 'react'
import { Bell } from 'lucide-react'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'
import {
  NOTIFICATION_MODULE_ICONS,
  NOTIFICATION_PRIORITY_TONES,
} from '@/components/notifications/notification-meta'
import { timeAgo } from '@/lib/time'
import type { NotificationItem } from '@/types/notifications'

interface NotificationRowProps {
  notification: NotificationItem
  read: boolean
  onToggleRead: (notification: NotificationItem) => void
  onOpen?: (notification: NotificationItem) => void
  /** Compact rows are used in the topbar popover. */
  compact?: boolean
}

/**
 * A single notification. Read state is conveyed by a labelled indicator as
 * well as a surface change, never by colour alone, and the whole row is a
 * button so it is reachable by keyboard.
 */
export function NotificationRow({
  notification,
  read,
  onToggleRead,
  onOpen,
  compact = false,
}: NotificationRowProps) {
  const Icon = NOTIFICATION_MODULE_ICONS[notification.module]
  const tone = NOTIFICATION_PRIORITY_TONES[notification.priority]

  const handleActivate = useCallback(() => {
    if (!read) onToggleRead(notification)
    onOpen?.(notification)
  }, [notification, onOpen, onToggleRead, read])

  return (
    <li
      className={cn(
        'group relative flex items-start gap-3 px-4 transition-colors',
        compact ? 'py-2.5' : 'py-3.5',
        read ? 'bg-card' : 'bg-muted/40',
      )}
    >
      <button
        type="button"
        onClick={handleActivate}
        className="flex min-w-0 flex-1 items-start gap-3 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span
          className={cn(
            'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md',
            tone === 'critical' && 'bg-red-500/10 text-red-600 dark:text-red-400',
            tone === 'warning' && 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
            tone === 'info' && 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
            tone === 'neutral' && 'bg-muted text-muted-foreground',
          )}
          aria-hidden="true"
        >
          <Icon className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-start gap-2">
            <span className={cn('text-sm', read ? 'font-medium' : 'font-semibold')}>
              {notification.title}
            </span>
            {!read ? (
              <>
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                <span className="sr-only">Unread</span>
              </>
            ) : (
              <span className="sr-only">Read</span>
            )}
          </span>
          <span
            className={cn(
              'mt-0.5 block text-muted-foreground',
              compact ? 'line-clamp-1 text-xs' : 'line-clamp-2 text-sm',
            )}
          >
            {notification.description}
          </span>
          <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span className="rounded border px-1.5 py-px font-medium text-foreground/80">
              {notification.type}
            </span>
            <time dateTime={notification.time}>{timeAgo(notification.time)}</time>
          </span>
        </span>
      </button>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 shrink-0 px-2 text-xs"
        onClick={() => onToggleRead(notification)}
        aria-label={read ? `Mark "${notification.title}" as unread` : `Mark "${notification.title}" as read`}
      >
        {read ? 'Unread' : 'Read'}
      </Button>
    </li>
  )
}

interface NotificationListProps {
  notifications: NotificationItem[]
  isRead: (id: string) => boolean
  onToggleRead: (notification: NotificationItem) => void
  onOpen?: (notification: NotificationItem) => void
  limit?: number
  compact?: boolean
}

/** Shared list body used by the topbar popover and the notification centre. */
export function NotificationList({
  notifications,
  isRead,
  onToggleRead,
  onOpen,
  limit,
  compact = false,
}: NotificationListProps) {
  const items = limit ? notifications.slice(0, limit) : notifications
  return (
    <ul className="divide-y divide-border">
      {items.map((notification) => (
        <NotificationRow
          key={notification.id}
          notification={notification}
          read={isRead(notification.id)}
          onToggleRead={onToggleRead}
          onOpen={onOpen}
          compact={compact}
        />
      ))}
    </ul>
  )
}

/** Popover-trigger icon shared by the topbar and the mobile header. */
export function NotificationBellIcon({ className }: { className?: string }) {
  return <Bell className={className} aria-hidden="true" />
}
