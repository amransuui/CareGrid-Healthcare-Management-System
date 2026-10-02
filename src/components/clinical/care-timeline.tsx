import { CircleCheck, CircleDot, HelpCircle, Loader } from 'lucide-react'
import { cn } from 'cn'
import { EmptyState } from '@/components/common/empty-state'
import {
  StatusBadge,
  type StatusTone,
} from '@/components/common/status-badge'
import type { CareEventStatus, CareTimelineEvent } from '@/types/clinical'
import { formatDateTime } from '@/lib/clinical'

const statusTone: Record<CareEventStatus, StatusTone> = {
  completed: 'success',
  in_progress: 'warning',
  pending: 'neutral',
  info: 'info',
}

const StatusIcon = ({ status }: { status: CareEventStatus }) => {
  if (status === 'completed') return <CircleCheck aria-hidden="true" className="size-4" />
  if (status === 'in_progress') return <Loader aria-hidden="true" className="size-4" />
  if (status === 'info') return <CircleDot aria-hidden="true" className="size-4" />
  return <HelpCircle aria-hidden="true" className="size-4" />
}

/** Chronological care timeline for a patient's admission. */
export function CareTimeline({ events }: { events: CareTimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <EmptyState
        title="No care events"
        description="Care events will appear as the admission progresses."
      />
    )
  }

  return (
    <ol className="relative space-y-5 border-l pl-5">
      {events.map((event) => (
        <li key={event.id} className="relative">
          <span
            className={cn(
              'absolute -left-[1.625rem] flex size-5 -translate-x-1/2 items-center justify-center rounded-full bg-primary/10',
            )}
            aria-hidden="true"
          >
            <StatusIcon status={event.status} />
          </span>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium">{event.event}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatDateTime(event.timestamp)} · {event.department}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Recorded by {event.author} · {event.authorRole}
              </p>
            </div>
            <StatusBadge
              tone={statusTone[event.status]}
              label={event.statusLabel}
              className="shrink-0"
            />
          </div>
        </li>
      ))}
    </ol>
  )
}