import type { ReactNode } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from 'cn'

interface ChartCardProps {
  title: string
  description?: string
  action?: ReactNode
  /** Remove the default body padding (for list panels). */
  flush?: boolean
  className?: string
  children: ReactNode
}

/** Dashboard panel wrapper with a consistent header and optional action. */
export function ChartCard({
  title,
  description,
  action,
  flush = false,
  className,
  children,
}: ChartCardProps) {
  return (
    <Card className={cn('shadow-card', className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="min-w-0 space-y-1">
          <CardTitle className="text-base">{title}</CardTitle>
          {description ? (
            <CardDescription>{description}</CardDescription>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </CardHeader>
      <CardContent className={cn(flush && 'px-0 pb-0')}>
        {children}
      </CardContent>
    </Card>
  )
}