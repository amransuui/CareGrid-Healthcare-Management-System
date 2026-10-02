import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'

interface TablePagerProps {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  /** Number of rows after filtering, before pagination. */
  total: number
  /** Noun used in the summary line, e.g. "invoices". */
  unitLabel: string
  pageSize?: number
  className?: string
}

/**
 * Shared pagination footer: result summary plus previous/next and numbered
 * pages. Every operational table uses it so paging looks and reads the same.
 */
export function TablePager({
  page,
  pageCount,
  onPageChange,
  total,
  unitLabel,
  pageSize,
  className,
}: TablePagerProps) {
  if (total === 0) return null
  const from = (page - 1) * (pageSize ?? 0) + 1
  const to = pageSize ? Math.min(total, page * pageSize) : total
  const windowSize = Math.min(pageCount, 7)
  const first = Math.max(1, Math.min(page - 3, pageCount - windowSize + 1))

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-between gap-3 sm:flex-row',
        className,
      )}
    >
      <p className="text-xs text-muted-foreground" aria-live="polite">
        Showing {from}–{to} of {total} {total === 1 ? unitLabel.replace(/s$/, '') : unitLabel}
      </p>
      <nav aria-label="Pagination" className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>
        <ul className="hidden items-center gap-1 sm:flex">
          {Array.from({ length: windowSize }, (_, index) => first + index).map((number) => (
            <li key={number}>
              <Button
                variant={number === page ? 'default' : 'ghost'}
                size="sm"
                className={cn('min-w-8 px-2 tabular-nums', number !== page && 'cursor-pointer')}
                aria-current={number === page ? 'page' : undefined}
                onClick={() => onPageChange(number)}
              >
                {number}
                <span className="sr-only">
                  {number === page ? ' (current page)' : `, page ${number}`}
                </span>
              </Button>
            </li>
          ))}
        </ul>
        <span className="px-1 text-xs text-muted-foreground tabular-nums sm:hidden">
          {page} / {pageCount}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight aria-hidden="true" className="size-4" />
        </Button>
      </nav>
    </div>
  )
}
