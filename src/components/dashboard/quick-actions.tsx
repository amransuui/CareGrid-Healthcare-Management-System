import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  ArrowRightLeft,
  ChevronRight,
  ClipboardPlus,
  ReceiptText,
  Siren,
  UserPlus,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { quickActions } from '@/data/mock/dashboard'
import type { QuickActionIcon } from '@/types/dashboard'
import { cn } from 'cn'

const actionIcons: Record<QuickActionIcon, LucideIcon> = {
  'user-plus': UserPlus,
  activity: Activity,
  'arrow-right-left': ArrowRightLeft,
  siren: Siren,
  'clipboard-plus': ClipboardPlus,
  receipt: ReceiptText,
}

/** Dashboard quick actions. Routes point at future module pages. */
export function QuickActions() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {quickActions.map((action) => {
        const Icon = actionIcons[action.icon]
        const sos = action.id === 'emergencySos'
        return (
          <Link
            key={action.id}
            to={action.href}
            className={cn(
              'group flex items-start gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
              sos && 'border-red-200 dark:border-red-500/30',
            )}
          >
            <span
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-lg',
                sos
                  ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                  : 'bg-primary/10 text-primary',
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium">{action.label}</span>
              <span className="block text-xs text-muted-foreground">
                {action.description}
              </span>
            </span>
            <ChevronRight
              className="mt-0.5 ml-auto size-4 shrink-0 text-muted-foreground transition-opacity group-hover:opacity-100 sm:opacity-0"
              aria-hidden="true"
            />
          </Link>
        )
      })}
    </div>
  )
}