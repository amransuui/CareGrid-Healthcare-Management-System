import { CalendarClock } from 'lucide-react'
import { EmptyState } from '@/components/common/empty-state'
import { StatusBadge, type StatusTone } from '@/components/common/status-badge'
import type { UpcomingCareEvent } from '@/types/family'
import { UPCOMING_CARE_KIND_LABELS } from '@/types/family'
import { formatDateTime } from '@/lib/clinical'

const kindTone: Record<UpcomingCareEvent['kind'], StatusTone> = {
  consultation: 'info',
  procedure: 'critical',
  investigation: 'warning',
  review: 'neutral',
  follow_up: 'success',
}

/** Upcoming care events for a linked patient, plain-language for families. */
export function UpcomingCare({ events }: { events: UpcomingCareEvent[] }) {
  if (events.length === 0) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="Nothing scheduled yet"
        description="Planned care and appointments will appear here."
      />
    )
  }

  return (
    <ul className="space-y-2">
      {events.map((event) => (
        <li
          key={event.id}
          className="flex flex-col gap-1.5 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium">{event.title}</p>
            <p className="text-xs text-muted-foreground">
              {formatDateTime(event.scheduledAt)} · {event.department}
            </p>
          </div>
          <StatusBadge
            tone={kindTone[event.kind]}
            label={UPCOMING_CARE_KIND_LABELS[event.kind]}
            className="shrink-0"
          />
        </li>
      ))}
    </ul>
  )
}