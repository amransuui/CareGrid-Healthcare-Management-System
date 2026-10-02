import type { ReactNode } from 'react'
import { cn } from 'cn'
import { Container } from '@/components/common/container'

interface LandingSectionProps {
  id?: string
  'aria-label'?: string
  className?: string
  children: ReactNode
}

/**
 * Vertical rhythm wrapper for landing page sections.
 */
export function LandingSection({
  id,
  'aria-label': ariaLabel,
  className,
  children,
}: LandingSectionProps) {
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={cn('py-16 sm:py-20', className)}
    >
      <Container>{children}</Container>
    </section>
  )
}