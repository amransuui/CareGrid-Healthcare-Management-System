import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'
import { cn } from 'cn'
import { TableHead } from '@/components/ui/table'
import type { SortState } from '@/lib/table'

interface SortableHeadProps<K extends string = string> {
  columnKey: K
  sort: SortState<K>
  onSort: (key: K) => void
  children: string
  className?: string
  /** Numeric columns are right-aligned and read as figures. */
  numeric?: boolean
  /** Screen-reader friendly description of what sorting this column does. */
  label?: string
}

/**
 * Table header cell that doubles as a sort control. Sorting state is exposed
 * with `aria-sort` and the button carries an accessible name, so the current
 * order is never conveyed by the arrow icon alone.
 */
export function SortableHead<K extends string = string>({
  columnKey,
  sort,
  onSort,
  children,
  className,
  numeric = false,
  label,
}: SortableHeadProps<K>) {
  const active = sort.key === columnKey
  const ariaSort = active
    ? sort.direction === 'asc'
      ? 'ascending'
      : 'descending'
    : 'none'

  const Icon = active ? (sort.direction === 'asc' ? ArrowUp : ArrowDown) : ChevronsUpDown

  return (
    <TableHead
      aria-sort={ariaSort}
      className={cn(numeric && 'text-right', className)}
    >
      <button
        type="button"
        onClick={() => onSort(columnKey)}
        className={cn(
          'group -mx-1.5 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-semibold tracking-wide uppercase transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
          numeric && 'flex-row-reverse',
          active ? 'text-foreground' : 'text-muted-foreground',
        )}
        title={label ?? `Sort by ${children}`}
      >
        {children}
        <Icon className="size-3.5 shrink-0" aria-hidden="true" />
        <span className="sr-only">
          {active
            ? `sorted ${sort.direction === 'asc' ? 'ascending' : 'descending'}. Activate to reverse.`
            : 'not sorted. Activate to sort ascending.'}
        </span>
      </button>
    </TableHead>
  )
}
