import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { cn } from 'cn'

interface VitalMetricProps {
  label: string
  value: number
  unit: string
  /** Previous reading used purely for a neutral direction comparison. */
  previous?: number
  /** Typical reference band shown as context, e.g. `60–100` (demo). */
  reference?: string
  className?: string
}

/**
 * Single clinical metric tile with a neutral trend comparison against the
 * previous reading. Direction is descriptive only (higher/lower) and never
 * renders a clinical judgement.
 */
export function VitalMetric({
  label,
  value,
  unit,
  previous,
  reference,
  className,
}: VitalMetricProps) {
  const delta = previous === undefined ? 0 : value - previous
  const direction =
    previous === undefined
      ? 'none'
      : Math.abs(delta) < 1e-9
        ? 'flat'
        : delta > 0
          ? 'up'
          : 'down'

  const TrendIcon =
    direction === 'up'
      ? ArrowUpRight
      : direction === 'down'
        ? ArrowDownRight
        : Minus

  const trendLabel =
    direction === 'up'
      ? `Higher than the previous reading`
      : direction === 'down'
        ? `Lower than the previous reading`
        : 'Same as the previous reading'

  return (
    <div className={cn('rounded-xl border bg-card p-3', className)}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">
        {value}
        <span className="ml-1 text-xs font-normal text-muted-foreground">{unit}</span>
      </p>
      {previous !== undefined ? (
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <TrendIcon
            aria-hidden="true"
            className={cn(
              'size-3.5',
              direction === 'none' ? 'text-muted-foreground/70' : '',
            )}
          />
          <span className="tabular-nums">{Math.abs(delta).toFixed(1)}</span>
          <span className="sr-only">{trendLabel}</span>
        </p>
      ) : null}
      {reference ? (
        <p className="mt-1 text-[11px] text-muted-foreground">Ref. {reference}</p>
      ) : null}
    </div>
  )
}