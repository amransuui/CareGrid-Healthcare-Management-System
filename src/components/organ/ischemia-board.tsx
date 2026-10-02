import { ArrowRight, HeartPulse } from 'lucide-react'
import { cn } from 'cn'
import { IschemiaStatusBadge, OrganTypeBadge } from '@/components/organ/organ-status-badge'
import type { IschemiaCase } from '@/types/organ'

const MINUTE_MS = 60_000

function formatClock(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return hours > 0 ? `${hours}h ${String(minutes).padStart(2, '0')}m` : `${minutes}m`
}

function caseProgress(case_: IschemiaCase, now: number) {
  if (case_.status === 'completed') {
    return { elapsedMinutes: case_.ischemicLimitMinutes, remainingMinutes: 0, ratio: 1 }
  }
  const elapsedMinutes = Math.min(
    Math.max(0, (now - new Date(case_.startedAt).getTime()) / MINUTE_MS),
    case_.ischemicLimitMinutes,
  )
  const remainingMinutes = Math.max(0, case_.ischemicLimitMinutes - elapsedMinutes)
  return { elapsedMinutes, remainingMinutes, ratio: elapsedMinutes / case_.ischemicLimitMinutes }
}

interface IschemiaBoardProps {
  cases: IschemiaCase[]
}

/** Simulated ischemia monitoring cards with timer-style indicators. */
export function IschemiaBoard({ cases }: IschemiaBoardProps) {
  const now = Date.now()

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {cases.map((case_) => {
        const { elapsedMinutes, remainingMinutes, ratio } = caseProgress(case_, now)
        const running = case_.status !== 'completed'
        const barTone =
          case_.status === 'completed'
            ? 'bg-muted-foreground/40'
            : case_.status === 'critical'
              ? 'bg-red-500'
              : case_.status === 'active'
                ? 'bg-amber-500'
                : 'bg-emerald-500'
        return (
          <article
            key={case_.caseId}
            className="rounded-xl border bg-card p-4 shadow-card"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <HeartPulse
                  aria-hidden="true"
                  className={cn(
                    'size-4',
                    case_.status === 'critical'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-primary',
                  )}
                />
                <span className="text-sm font-semibold">{case_.caseId}</span>
              </div>
              <IschemiaStatusBadge status={case_.status} />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <OrganTypeBadge organ={case_.organ} />
            </div>

            <p className="mt-3 flex items-center gap-1.5 text-sm">
              <span className="min-w-0 flex-1 truncate text-muted-foreground">{case_.donor}</span>
              <ArrowRight aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate font-medium">{case_.recipient}</span>
            </p>

            <div className="mt-4" role="timer" aria-label={`Elapsed time ${formatClock(elapsedMinutes)} of ${formatClock(case_.ischemicLimitMinutes)}`}>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted" role="presentation">
                <div
                  className={cn('h-full rounded-full transition-all', barTone)}
                  style={{ width: `${Math.round(ratio * 100)}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs tabular-nums">
                <span className="text-muted-foreground">
                  Started {new Date(case_.startedAt).toLocaleString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span className="font-medium text-muted-foreground">
                  Limit {formatClock(case_.ischemicLimitMinutes)}
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg border bg-muted/30 p-3 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Elapsed</p>
                <p className="text-sm font-semibold tabular-nums">
                  {formatClock(Math.round(elapsedMinutes))}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {running ? 'Remaining' : 'Outcome'}
                </p>
                <p
                  className={cn(
                    'text-sm font-semibold tabular-nums',
                    running && case_.status === 'critical' && 'text-red-600 dark:text-red-400',
                  )}
                >
                  {running ? formatClock(Math.round(remainingMinutes)) : 'Completed'}
                </p>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}