import type { LucideIcon } from 'lucide-react'
import {
  BedDouble,
  CircleAlert,
  ClipboardPlus,
  Droplets,
  HeartPulse,
  ReceiptText,
  Siren,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react'
import { StatusBadge } from '@/components/common/status-badge'
import { Card } from '@/components/ui/card'
import type { DashboardKpi, KpiId } from '@/types/dashboard'
import { cn } from 'cn'

const kpiIcons: Record<KpiId, LucideIcon> = {
  totalPatients: Users,
  criticalPatients: CircleAlert,
  wardOccupancy: BedDouble,
  bloodInventory: Droplets,
  organMatches: HeartPulse,
  prescriptionQueue: ClipboardPlus,
  pendingBilling: ReceiptText,
  emergencyRequests: Siren,
}

interface StatCardProps {
  kpi: DashboardKpi
  /** Role-emphasized KPI surfaced by the demo role focus. */
  emphasized?: boolean
}

/** Operational KPI card. Values are clearly fictional demo data. */
export function StatCard({ kpi, emphasized = false }: StatCardProps) {
  const Icon = kpiIcons[kpi.id]
  const DeltaIcon = kpi.delta.startsWith('+')
    ? TrendingUp
    : kpi.delta.startsWith('−') || kpi.delta.startsWith('-')
      ? TrendingDown
      : null

  return (
    <Card
      className={cn(
        'shadow-card transition-shadow hover:shadow-md',
        emphasized && 'ring-1 ring-primary/25',
      )}
    >
      <div className="flex items-start justify-between gap-4 p-4">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium text-muted-foreground">
              {kpi.label}
            </p>
            {emphasized ? (
              <>
                <StatusBadge tone="info" label="Focus" />
                <span className="sr-only">Highlighted for your role</span>
              </>
            ) : null}
          </div>
          <p className="text-2xl font-semibold tracking-tight">{kpi.value}</p>
        </div>
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
          aria-hidden="true"
        >
          <Icon className="size-4" />
        </span>
      </div>
      <div className="flex items-center gap-1.5 border-t px-4 py-2 text-xs text-muted-foreground">
        <span className="truncate">{kpi.context}</span>
        <span className="ml-auto flex shrink-0 items-center gap-1">
          {DeltaIcon ? (
            <DeltaIcon className="size-3.5" aria-hidden="true" />
          ) : null}
          <span>{kpi.delta}</span>
        </span>
      </div>
    </Card>
  )
}