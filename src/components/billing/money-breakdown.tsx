import type { ReactNode } from 'react'
import { cn } from 'cn'

interface SummaryRow {
  label: string
  value: ReactNode
  /** Right-hand supporting note, e.g. a count of records. */
  hint?: string
  /** Renders the row as a total. */
  emphasis?: boolean
  tone?: 'default' | 'muted'
}

interface MoneyBreakdownProps {
  rows: SummaryRow[]
  className?: string
  /** Heading above the breakdown, e.g. "Payment position". */
  title?: string
  caption?: string
}

/**
 * Read-only money breakdown used by the invoice, claim and discharge detail
 * views. The prototype records demo figures only — it never takes a payment,
 * and no gateway, insurer or bank is contacted.
 */
export function MoneyBreakdown({ rows, className, title, caption }: MoneyBreakdownProps) {
  return (
    <div className={cn('rounded-xl border bg-card', className)}>
      {title ? (
        <p className="border-b px-4 py-2.5 text-sm font-semibold">{title}</p>
      ) : null}
      <dl className="divide-y">
        {rows.map((row) => (
          <div
            key={row.label}
            className={cn(
              'flex items-baseline justify-between gap-4 px-4 py-2.5',
              row.emphasis && 'bg-muted/40',
            )}
          >
            <dt
              className={cn(
                'text-sm',
                row.emphasis ? 'font-semibold' : 'text-muted-foreground',
                row.tone === 'muted' && 'text-muted-foreground/80',
              )}
            >
              {row.label}
              {row.hint ? <span className="ml-1.5 text-xs font-normal">{row.hint}</span> : null}
            </dt>
            <dd
              className={cn(
                'text-sm tabular-nums',
                row.emphasis ? 'font-semibold' : 'font-medium',
              )}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
      {caption ? (
        <p className="border-t px-4 py-2 text-xs text-muted-foreground">{caption}</p>
      ) : null}
    </div>
  )
}
