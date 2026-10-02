import type { ReactNode } from 'react'
import { cn } from 'cn'
import { Card } from '@/components/ui/card'

/**
 * Centered card that wraps auth forms. Pages compose CardHeader/Content
 * inside; the wrapper keeps every auth surface on the same canvas.
 */
export function AuthCard({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <Card className={cn('w-full max-w-md shadow-card', className)}>
      {children}
    </Card>
  )
}