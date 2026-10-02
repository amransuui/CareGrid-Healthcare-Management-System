import type { StatusTone } from '@/components/common/status-badge'
import { StatusBadge } from '@/components/common/status-badge'
import type { OrganMatchTask } from '@/types/dashboard'

const urgencyMeta: Record<
  OrganMatchTask['urgency'],
  { tone: StatusTone; label: string }
> = {
  critical: { tone: 'critical', label: 'Critical' },
  urgent: { tone: 'warning', label: 'Urgent' },
  standard: { tone: 'neutral', label: 'Standard' },
}

/** Active organ match activity snapshot with compatibility scores. */
export function OrganMatchingPanel({
  matches,
}: {
  matches: OrganMatchTask[]
}) {
  return (
    <ul className="divide-y divide-border">
      {matches.map((match) => (
        <li key={match.id} className="flex items-center gap-3 px-4 py-2.5">
          <div className="min-w-0">
            <p className="text-sm font-medium">
              {match.id} · {match.recipient}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {match.organ} · {match.blood}
            </p>
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <span
              className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-semibold tabular-nums"
              aria-label={`Compatibility score ${match.score}`}
            >
              {match.score}
            </span>
            <StatusBadge
              tone={urgencyMeta[match.urgency].tone}
              label={urgencyMeta[match.urgency].label}
              className="w-fit"
            />
          </div>
        </li>
      ))}
    </ul>
  )
}