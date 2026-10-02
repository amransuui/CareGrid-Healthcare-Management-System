import type { ReactNode } from 'react'
import { cn } from 'cn'

interface PreviewPanelProps {
  title: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

/**
 * Sub-panel used to organize product preview content.
 */
export function PreviewPanel({
  title,
  action,
  children,
  className,
}: PreviewPanelProps) {
  return (
    <div className={cn('rounded-lg border bg-muted/30 p-4', className)}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  )
}