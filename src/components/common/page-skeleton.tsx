import { cn } from 'cn'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface PageSkeletonProps {
  /** Number of KPI tiles in the leading row. */
  kpis?: number
  className?: string
}

/**
 * Canonical module-page loading state. Every operational page uses it so route
 * transitions feel like one product instead of a set of unrelated screens.
 */
export function PageSkeleton({ kpis = 4, className }: PageSkeletonProps) {
  return (
    <div
      className={cn('space-y-6', className)}
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading content…</span>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-9 w-40" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: kpis }, (_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-16 w-full rounded-xl" />
      <Card className="shadow-card">
        <div className="space-y-3 p-4">
          <Skeleton className="h-4 w-1/3" />
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      </Card>
    </div>
  )
}
