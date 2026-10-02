import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CheckCheck, Inbox, RotateCcw, Search } from 'lucide-react'
import { cn } from 'cn'
import { Container } from '@/components/common/container'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { KpiCard } from '@/components/common/kpi-card'
import { PageHeader } from '@/components/common/page-header'
import { PageSkeleton } from '@/components/common/page-skeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { NotificationList } from '@/components/notifications/notification-row'
import { useNotifications } from '@/hooks/use-notifications'
import { useSession } from '@/hooks/use-auth'
import { billingService } from '@/services'
import { roleLabels } from '@/data/mock/demo-users'
import { useListControls } from '@/hooks/use-list-controls'
import { matchesQuery } from '@/lib/table'
import {
  NOTIFICATION_MODULES,
  NOTIFICATION_MODULE_LABELS,
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_PRIORITY_LABELS,
  type NotificationItem,
} from '@/types/notifications'
import type { UserRole } from '@/types/auth'

type FilterTab = 'all' | 'unread' | (typeof NOTIFICATION_MODULES)[number]

/** Notification centre: module tabs, priority filter, search and read actions. */
export function NotificationsPage() {
  const session = useSession()
  const role = session?.user.role
  const navigate = useNavigate()
  const {
    notifications,
    unreadCount,
    isLoading,
    isError,
    refetch,
    isRead,
    markRead,
    markUnread,
    markAllRead,
    resetAll,
  } = useNotifications(role)

  const [tab, setTab] = useState<FilterTab>('all')
  const [priority, setPriority] = useState<string>('all')
  const [query, setQuery] = useState('')

  // Billing officers additionally get the unpaid-invoice figure so the
  // "Billing" tab has real context for their role.
  const { data: billingSummary } = useQuery({
    queryKey: ['billing', 'summary'],
    queryFn: () => billingService.getSummary(),
    enabled: role === 'billing_officer',
  })

  const visibleModules = useMemo(() => {
    const present = new Set(notifications.map((item) => item.module))
    return NOTIFICATION_MODULES.filter((module) => present.has(module))
  }, [notifications])

  const filtered = useMemo(
    () =>
      notifications.filter((item) => {
        if (tab === 'unread') {
          if (isRead(item.id)) return false
        } else if (tab !== 'all' && item.module !== tab) {
          return false
        }
        if (priority !== 'all' && item.priority !== priority) return false
        if (query.trim()) {
          return matchesQuery(
            `${item.title} ${item.description} ${item.type} ${NOTIFICATION_MODULE_LABELS[item.module]}`,
            query,
          )
        }
        return true
      }),
    [notifications, tab, priority, query, isRead],
  )

  const { rows, total, sort, setSort, page, pageCount, setPage } = useListControls<
    NotificationItem,
    'priority' | 'time'
  >({
    rows: filtered,
    accessors: {
      priority: (item) => NOTIFICATION_PRIORITIES.indexOf(item.priority),
      time: (item) => item.time,
    },
    initialSort: { key: 'time', direction: 'desc' },
    pageSize: 12,
  })

  const counts = useMemo(() => {
    const byModule: Record<string, number> = {}
    for (const item of notifications) {
      byModule[item.module] = (byModule[item.module] ?? 0) + 1
    }
    return byModule
  }, [notifications])

  const criticalCount = useMemo(
    () => notifications.filter((item) => item.priority === 'critical' && !isRead(item.id)).length,
    [notifications, isRead],
  )

  const handleToggleRead = useCallback(
    (item: NotificationItem) => {
      if (isRead(item.id)) markUnread(item.id)
      else markRead(item.id)
    },
    [isRead, markRead, markUnread],
  )

  const handleOpen = useCallback(
    (item: NotificationItem) => {
      if (item.href) navigate(item.href)
    },
    [navigate],
  )

  const hasActive = tab !== 'all' || priority !== 'all' || query.trim() !== ''

  return (
    <Container size="fluid" className="max-w-[90rem] space-y-6 py-6">
      <PageHeader
        title="Notifications"
        description={
          role
            ? `Priority updates for your ${roleLabels[role]} workspace. Demo feed only.`
            : 'Priority updates from every care module.'
        }
        actions={
          <>
            <Button
              variant="outline"
              onClick={markAllRead}
              disabled={unreadCount === 0}
            >
              <CheckCheck aria-hidden="true" className="size-4" />
              Mark all read
            </Button>
            <Button variant="ghost" onClick={resetAll} disabled={unreadCount === notifications.length}>
              <RotateCcw aria-hidden="true" className="size-4" />
              Mark all unread
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Unread"
          value={unreadCount}
          context="Waiting for your attention"
          icon={Inbox}
          tone="info"
        />
        <KpiCard
          label="Critical"
          value={criticalCount}
          context="Highest-priority unread items"
          icon={CheckCheck}
          tone="critical"
        />
        <KpiCard
          label="Visible to your role"
          value={notifications.length}
          context={role ? `Scoped to ${roleLabels[role]}` : 'All roles'}
          icon={Inbox}
          tone="neutral"
        />
        {role === 'billing_officer' ? (
          <KpiCard
            label="Outstanding"
            value={
              billingSummary
                ? `৳ ${Math.round(billingSummary.totalOutstanding).toLocaleString('en-US')}`
                : '—'
            }
            context="Across all open demo invoices"
            icon={Inbox}
            tone="warning"
          />
        ) : (
          <KpiCard
            label="Modules with updates"
            value={visibleModules.length}
            context="Care areas feeding this feed"
            icon={Inbox}
            tone="neutral"
          />
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border bg-card p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <label htmlFor="notification-search" className="sr-only">
              Search notifications by title, description or type
            </label>
            <Input
              id="notification-search"
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setPage(1)
              }}
              placeholder="Search notifications…"
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={priority}
              onValueChange={(value) => {
                setPriority(value)
                setPage(1)
              }}
            >
              <SelectTrigger aria-label="Filter by priority" className="w-full sm:w-44">
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                {NOTIFICATION_PRIORITIES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {NOTIFICATION_PRIORITY_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={`${sort.key}:${sort.direction}`}
              onValueChange={(value) => {
                const [key, direction] = value.split(':') as ['priority' | 'time', 'asc' | 'desc']
                setSort({ key, direction })
                setPage(1)
              }}
            >
              <SelectTrigger aria-label="Sort notifications" className="w-full sm:w-48">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="time:desc">Newest first</SelectItem>
                <SelectItem value="time:asc">Oldest first</SelectItem>
                <SelectItem value="priority:desc">Highest priority</SelectItem>
                <SelectItem value="priority:asc">Lowest priority</SelectItem>
              </SelectContent>
            </Select>
            {hasActive ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTab('all')
                  setPriority('all')
                  setQuery('')
                  setPage(1)
                }}
              >
                Clear
              </Button>
            ) : null}
          </div>
        </div>

        <Tabs value={tab} onValueChange={(value) => { setTab(value as FilterTab); setPage(1) }}>
          <TabsList className="flex-wrap" aria-label="Notification module filter">
            <TabsTrigger value="all">
              All
              <span className="ml-1.5 text-xs text-muted-foreground tabular-nums">
                {notifications.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              <span className="ml-1.5 text-xs text-muted-foreground tabular-nums">
                {unreadCount}
              </span>
            </TabsTrigger>
            {visibleModules.map((module) => (
              <TabsTrigger key={module} value={module}>
                {NOTIFICATION_MODULE_LABELS[module]}
                <span className="ml-1.5 text-xs text-muted-foreground tabular-nums">
                  {counts[module] ?? 0}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <PageSkeleton kpis={0} />
      ) : isError ? (
        <ErrorState
          title="Could not load notifications"
          description="The notification feed could not be read. Please try again."
          onRetry={refetch}
        />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No notifications match"
          description={
            hasActive
              ? 'Adjust the search or filters to see more notifications.'
              : 'New updates from the care modules will appear here.'
          }
        />
      ) : (
        <>
          <Card className="shadow-card">
            <CardContent className="p-0">
              <NotificationList
                notifications={rows}
                isRead={isRead}
                onToggleRead={handleToggleRead}
                onOpen={handleOpen}
              />
            </CardContent>
          </Card>

          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs text-muted-foreground" aria-live="polite">
              Showing {rows.length} of {total} matching notification{total === 1 ? '' : 's'}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className={cn('text-xs text-muted-foreground tabular-nums')}>
                {page} / {pageCount}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pageCount}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      <p className="text-xs text-muted-foreground">
        Notification content is fictional demo data. No push, SMS or email service is
        connected, and read state is stored only in this browser.
      </p>
    </Container>
  )
}

export type { UserRole }
