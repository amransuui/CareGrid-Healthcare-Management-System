import { StatusBadge } from '@/components/common/status-badge'
import type { BloodGroupStock, InventoryStatus } from '@/types/dashboard'
import { cn } from 'cn'

const statusMeta: Record<
  InventoryStatus,
  { tone: 'critical' | 'warning' | 'success'; label: string; bar: string }
> = {
  critical: {
    tone: 'critical',
    label: 'Critical',
    bar: 'bg-red-500',
  },
  low: {
    tone: 'warning',
    label: 'Low',
    bar: 'bg-amber-500',
  },
  ok: {
    tone: 'success',
    label: 'In stock',
    bar: 'bg-emerald-500',
  },
}

/** Compact blood group inventory overview with stock-level bars. */
export function BloodInventoryPanel({
  groups,
}: {
  groups: BloodGroupStock[]
}) {
  const maxUnits = Math.max(...groups.map((group) => group.units))

  return (
    <ul className="space-y-3">
      {groups.map((group) => {
        const meta = statusMeta[group.status]
        return (
          <li key={group.group} className="flex items-center gap-3">
            <span className="w-12 shrink-0 text-sm font-semibold">
              {group.group}
            </span>
            <div
              className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted"
              role="img"
              aria-label={`${group.group} stock, ${group.units} units, ${meta.label}`}
            >
              <div
                className={cn('h-full rounded-full transition-all', meta.bar)}
                style={{
                  width: `${Math.max(6, Math.round((group.units / maxUnits) * 100))}%`,
                }}
              />
            </div>
            <span className="w-16 shrink-0 text-right text-sm text-muted-foreground tabular-nums">
              {group.units} u
            </span>
            <StatusBadge
              tone={meta.tone}
              label={meta.label}
              className="w-[5.5rem] justify-center"
            />
          </li>
        )
      })}
    </ul>
  )
}