import type { ReactNode } from 'react'
import { cn } from 'cn'

interface PreviewFrameProps {
  label?: string
  children: ReactNode
  className?: string
}

/**
 * Framed "product window" used for marketing previews. Communicates clearly
 * that the content is a demo preview, not live data.
 */
export function PreviewFrame({
  label = 'CareGrid.io · Demo preview',
  children,
  className,
}: PreviewFrameProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border bg-card shadow-card',
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2 rounded-full bg-slate-300 dark:bg-slate-600" />
          <span className="size-2 rounded-full bg-slate-300 dark:bg-slate-600" />
          <span className="size-2 rounded-full bg-slate-300 dark:bg-slate-600" />
        </span>
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  )
}