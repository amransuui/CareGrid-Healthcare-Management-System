import type { ReactNode } from 'react'
import { cn } from 'cn'

interface PreviewKpiProps {
  label: string
  value: string
  trend?: string
  icon?: ReactNode
  className?: string
}

/**
 * Compact metric used inside product previews.
 */
export function PreviewKpi({
  label,
  value,
  trend,
  icon,
  className,
}: PreviewKpiProps) {
  return (
    <div
      className={cn(
        'min-w-0 rounded-lg border bg-background p-3',
        className,
      )}
    >
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
      {trend ? (
        <p className="mt-0.5 text-xs text-muted-foreground">{trend}</p>
      ) : null}
    </div>
  )
}