import type { LucideIcon } from 'lucide-react'
import { cn } from 'cn'
import { Card } from '@/components/ui/card'

export type KpiTone = 'neutral' | 'success' | 'warning' | 'critical' | 'info'

const iconTint: Record<KpiTone, string> = {
  neutral: 'bg-muted text-muted-foreground',
  success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  critical: 'bg-red-500/10 text-red-600 dark:text-red-400',
  info: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
}

interface KpiCardProps {
  label: string
  value: string | number
  context?: string
  icon: LucideIcon
  tone?: KpiTone
}

/** Small operational KPI card shared across business modules. */
export function KpiCard({ label, value, context, icon: Icon, tone = 'neutral' }: KpiCardProps) {
  return (
    <Card className="shadow-card">
      <div className="flex items-start justify-between gap-4 p-4">
        <div className="min-w-0 space-y-1">
          <p className="truncate text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
        </div>
        <span
          className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', iconTint[tone])}
          aria-hidden="true"
        >
          <Icon className="size-4" />
        </span>
      </div>
      {context ? (
        <p className="border-t px-4 py-2 text-xs text-muted-foreground">{context}</p>
      ) : null}
    </Card>
  )
}