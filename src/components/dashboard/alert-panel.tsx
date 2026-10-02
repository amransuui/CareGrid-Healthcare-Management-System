import type { LucideIcon } from 'lucide-react'
import { CircleAlert, Info, TriangleAlert } from 'lucide-react'
import { StatusBadge } from '@/components/common/status-badge'
import type { DashboardAlert } from '@/types/dashboard'
import { cn } from 'cn'

const severityMeta: Record<
  DashboardAlert['severity'],
  { tone: 'critical' | 'warning' | 'info'; Icon: LucideIcon; label: string }
> = {
  critical: { tone: 'critical', Icon: CircleAlert, label: 'Critical' },
  warning: { tone: 'warning', Icon: TriangleAlert, label: 'Warning' },
  info: { tone: 'info', Icon: Info, label: 'Info' },
}

const iconBox: Record<DashboardAlert['severity'], string> = {
  critical: 'bg-red-500/10 text-red-600 dark:text-red-400',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  info: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
}

/** Prominent but controlled list of open operational alerts. */
export function AlertPanel({
  alerts,
  className,
}: {
  alerts: DashboardAlert[]
  className?: string
}) {
  return (
    <ul className={cn('divide-y divide-border', className)}>
      {alerts.map((alert) => {
        const meta = severityMeta[alert.severity]
        const Icon = meta.Icon
        return (
          <li key={alert.id} className="flex gap-3 px-4 py-3.5">
            <span
              className={cn(
                'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md',
                iconBox[alert.severity],
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{alert.title}</p>
                <StatusBadge
                  tone={meta.tone}
                  label={meta.label}
                  className="ml-auto shrink-0"
                />
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {alert.detail}
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {alert.venue} · {alert.time}
              </p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}