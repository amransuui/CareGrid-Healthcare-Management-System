import type { StatusTone } from '@/components/common/status-badge'
import { StatusBadge } from '@/components/common/status-badge'
import type { ActivityEvent, ActivityStatus } from '@/types/dashboard'
import { timeAgo } from '@/lib/time'
import { cn } from 'cn'

const statusTone: Record<ActivityStatus, StatusTone> = {
  done: 'success',
  in_progress: 'info',
  pending: 'warning',
  info: 'neutral',
}

/** Recent activity rows: time, event, department, user/role and status. */
export function ActivityTimeline({
  events,
  className,
}: {
  events: ActivityEvent[]
  className?: string
}) {
  return (
    <ul className={cn('divide-y divide-border', className)}>
      {events.map((event) => (
        <li
          key={event.id}
          className="flex flex-col gap-1 px-4 py-3 sm:grid sm:grid-cols-[6.5rem_minmax(0,1fr)_auto] sm:items-center sm:gap-4"
        >
          <time
            dateTime={event.time}
            className="text-xs text-muted-foreground"
          >
            {timeAgo(event.time)}
          </time>
          <div className="min-w-0">
            <p className="text-sm font-medium">{event.event}</p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {event.user} · {event.roleLabel} · {event.department}
            </p>
          </div>
          <StatusBadge
            tone={statusTone[event.status]}
            label={event.statusLabel}
            className="w-fit sm:justify-self-end"
          />
        </li>
      ))}
    </ul>
  )
}