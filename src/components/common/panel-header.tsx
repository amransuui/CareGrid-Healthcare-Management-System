import type { ReactNode } from 'react'
import { cn } from 'cn'

interface PanelHeaderProps {
  title: string
  description?: string
  /** Right-aligned content such as a status badge or link. */
  actions?: ReactNode
  className?: string
}

/**
 * Compact heading block for a card or panel inside a page. The page-level
 * `PageHeader` and public `SectionHeader` are both visually heavier, so every
 * detail panel uses this instead of promoting its heading to an `h2`.
 */
export function PanelHeader({ title, description, actions, className }: PanelHeaderProps) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-3', className)}>
      <div className="min-w-0 space-y-0.5">
        <h3 className="text-sm font-semibold">{title}</h3>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  )
}
