import type { ReactNode } from 'react'
import { cn } from 'cn'

export interface DetailItem {
  label: string
  value: ReactNode
  /** Render the value in a monospaced/figure style. */
  numeric?: boolean
  /** Span the full row on multi-column layouts. */
  full?: boolean
}

interface DetailListProps {
  items: DetailItem[]
  /** Columns at `sm` and above. */
  columns?: 1 | 2
  className?: string
}

/**
 * Key/value description grid used by every detail drawer and detail page so
 * label/value spacing and typography stay uniform across modules.
 */
export function DetailList({ items, columns = 2, className }: DetailListProps) {
  return (
    <dl
      className={cn(
        'grid gap-x-6 gap-y-3',
        columns === 2 ? 'sm:grid-cols-2' : 'grid-cols-1',
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.label} className={cn('min-w-0', item.full && 'sm:col-span-2')}>
          <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {item.label}
          </dt>
          <dd
            className={cn(
              'mt-0.5 text-sm font-medium break-words',
              item.numeric && 'tabular-nums',
            )}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
