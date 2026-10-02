import { cn } from 'cn'
import { Skeleton } from '@/components/ui/skeleton'

interface LoadingStateProps {
  /** Number of skeleton rows to render. */
  rows?: number
  className?: string
}

/** Skeleton-based loading placeholder for panels and lists. */
export function LoadingState({ rows = 4, className }: LoadingStateProps) {
  return (
    <div className={cn('space-y-3', className)} aria-busy="true" aria-live="polite">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className={cn('space-y-2')}>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  )
}