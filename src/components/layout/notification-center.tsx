import { useCallback, useState } from 'react'
import { Bell } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { LoadingState } from '@/components/common/loading-state'
import { NotificationList } from '@/components/notifications/notification-row'
import { useNotifications } from '@/hooks/use-notifications'
import { useSession } from '@/hooks/use-auth'
import type { NotificationItem } from '@/types/notifications'

/**
 * Topbar notification bell: unread badge, a compact preview and links through
 * to the full notification centre. Shares data and read state with the centre
 * page through `useNotifications`.
 */
export function NotificationCenter() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const session = useSession()
  const { notifications, unreadCount, isLoading, isError, refetch, isRead, markRead, markUnread, markAllRead } =
    useNotifications(session?.user.role)

  const handleOpen = useCallback(
    (notification: NotificationItem) => {
      setOpen(false)
      if (notification.href) navigate(notification.href)
    },
    [navigate],
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={
            unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications, none unread'
          }
        >
          <Bell className="size-4.5" aria-hidden="true" />
          {unreadCount > 0 ? (
            <span className="absolute top-1.5 right-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-none font-semibold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[min(92vw,24rem)] p-0"
        aria-label="Notifications"
      >
        <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            disabled={unreadCount === 0}
            onClick={markAllRead}
          >
            Mark all read
          </Button>
        </div>
        <ScrollArea className="max-h-88">
          {isLoading ? (
            <div className="px-4 py-4">
              <LoadingState rows={3} />
            </div>
          ) : isError ? (
            <div className="p-4">
              <ErrorState onRetry={refetch} />
            </div>
          ) : notifications.length === 0 ? (
            <EmptyState
              title="You're all caught up"
              description="New notifications will appear here."
              className="border-0 bg-transparent py-10"
            />
          ) : (
            <NotificationList
              notifications={notifications}
              isRead={isRead}
              onToggleRead={(notification) =>
                isRead(notification.id) ? markUnread(notification.id) : markRead(notification.id)
              }
              onOpen={handleOpen}
              limit={5}
              compact
            />
          )}
        </ScrollArea>
        <div className="border-t px-4 py-2">
          <Button asChild variant="ghost" size="sm" className="h-8 w-full text-xs">
            <Link to="/app/notifications" onClick={() => setOpen(false)}>
              View all notifications
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
