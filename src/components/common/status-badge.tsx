import { cn } from 'cn'

export type StatusTone = 'neutral' | 'success' | 'warning' | 'critical' | 'info'

const toneStyles: Record<StatusTone, string> = {
  neutral:
    'border-border bg-muted text-muted-foreground dark:border-border dark:bg-muted dark:text-muted-foreground',
  success:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400',
  warning:
    'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400',
  critical:
    'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400',
  info: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-400',
}

const dotStyles: Record<StatusTone, string> = {
  neutral: 'bg-slate-400',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  critical: 'bg-red-500',
  info: 'bg-sky-500',
}

interface StatusBadgeProps {
  /** Semantic status. Always paired with a text label for accessibility. */
  tone?: StatusTone
  label: string
  /** Show the leading tone indicator dot (defaults to true). */
  withDot?: boolean
  className?: string
}

/**
 * Semantic status pill. Communicates state through both color and an
 * explicit text label, never color alone.
 */
export function StatusBadge({
  tone = 'neutral',
  label,
  withDot = true,
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        toneStyles[tone],
        className,
      )}
    >
      {withDot ? (
        <span
          className={cn('size-1.5 shrink-0 rounded-full', dotStyles[tone])}
          aria-hidden="true"
        />
      ) : null}
      {label}
    </span>
  )
}