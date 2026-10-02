import type { ReactNode } from 'react'
import { cn } from 'cn'

interface PageHeaderProps {
  title: string
  description?: string
  /** Contextual actions rendered on the trailing edge. */
  actions?: ReactNode
  className?: string
}

/**
 * Page-level header for application pages: title, supporting text and
 * contextual actions. Used inside the app shell (Phase 3+).
 */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between',
        className,
      )}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  )
}