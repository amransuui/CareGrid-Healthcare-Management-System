import type { ReactNode } from 'react'
import { Search } from 'lucide-react'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface DataToolbarProps {
  /** Stable id so the search input gets a real, unique label. */
  searchId: string
  searchLabel: string
  searchPlaceholder: string
  value: string
  onValueChange: (value: string) => void
  /** Filter controls (usually shadcn `Select`s). */
  children?: ReactNode
  /** Shows the "Clear filters" affordance. */
  canReset?: boolean
  onReset?: () => void
  className?: string
}

/**
 * Single search + filter bar used by every operational table in the app so
 * spacing, hit targets and labelling stay identical across modules.
 */
export function DataToolbar({
  searchId,
  searchLabel,
  searchPlaceholder,
  value,
  onValueChange,
  children,
  canReset = false,
  onReset,
  className,
}: DataToolbarProps) {
  return (
    <div className={cn('flex flex-col gap-3 rounded-xl border bg-card p-3', className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <label htmlFor={searchId} className="sr-only">
            {searchLabel}
          </label>
          <Input
            id={searchId}
            type="search"
            value={value}
            onChange={(event) => onValueChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9"
          />
        </div>
        {canReset ? (
          <Button variant="ghost" size="sm" onClick={onReset} className="shrink-0 self-start sm:self-auto">
            Clear filters
          </Button>
        ) : null}
      </div>
      {children ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {children}
        </div>
      ) : null}
    </div>
  )
}
