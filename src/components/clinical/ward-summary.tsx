import type { ReactNode } from 'react'
import {
  BedDouble,
  CheckCircle2,
  Minus,
  Ban,
  Star,
  Sparkles,
} from 'lucide-react'
import type { WardSummary } from '@/services/wards'
import { cn } from 'cn'

interface WardSummaryProps {
  summary: WardSummary
}

/**
 * Bed occupancy summary: overall numbers plus a per-ward breakdown that also
 * surfaces each ward's department, floor and care type.
 */
export function WardSummary({ summary }: WardSummaryProps) {
  const overall = summary.overall
  const occupancy = overall.total
    ? Math.round((overall.occupied / overall.total) * 100)
    : 0

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <SummaryTile
          icon={<BedDouble aria-hidden="true" className="size-4" />}
          label="Total beds"
          value={String(overall.total)}
        />
        <SummaryTile
          icon={<CheckCircle2 aria-hidden="true" className="size-4" />}
          label="Occupied"
          value={String(overall.occupied)}
          tone="text-primary"
        />
        <SummaryTile
          icon={<Minus aria-hidden="true" className="size-4" />}
          label="Available"
          value={String(overall.available)}
          tone="text-emerald-600 dark:text-emerald-400"
        />
        <SummaryTile
          icon={<Sparkles aria-hidden="true" className="size-4" />}
          label="Cleaning"
          value={String(overall.cleaning)}
          tone="text-muted-foreground"
        />
        <SummaryTile
          icon={<Ban aria-hidden="true" className="size-4" />}
          label="Reserved"
          value={String(overall.reserved)}
          tone="text-muted-foreground"
        />
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="font-medium">Facility occupancy</span>
          <span className="tabular-nums text-muted-foreground">{occupancy}%</span>
        </div>
        <div
          className="h-2.5 overflow-hidden rounded-full bg-muted"
          role="img"
          aria-label={`${occupancy}% of beds occupied`}
        >
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${occupancy}%` }}
          />
        </div>
      </div>

      <ul className="divide-y divide-border rounded-xl border bg-card">
        {summary.byWard.map(({ ward, stats }) => {
          const wardOccupancy = stats.total
            ? Math.round((stats.occupied / stats.total) * 100)
            : 0
          return (
            <li
              key={ward.id}
              className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Star aria-hidden="true" className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-medium">{ward.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {ward.department} · {ward.floor} · {ward.type}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stats.occupied} occupied · {stats.available} free ·{' '}
                    {stats.cleaning} cleaning · {stats.reserved} reserved
                  </p>
                </div>
              </div>
              <div className="flex w-full items-center gap-2 sm:w-44">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn('h-full rounded-full transition-all', wardOccupancy >= 90 ? 'bg-destructive' : 'bg-primary')}
                    style={{ width: `${wardOccupancy}%` }}
                  />
                </div>
                <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
                  {wardOccupancy}%
                </span>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function SummaryTile({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode
  label: string
  value: string
  tone?: string
}) {
  return (
    <div className="rounded-xl border bg-card p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <p className={cn('mt-1 text-2xl font-semibold tabular-nums', tone)}>{value}</p>
    </div>
  )
}