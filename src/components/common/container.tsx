import type { ElementType, ReactNode } from 'react'
import { cn } from 'cn'

interface ContainerProps {
  as?: ElementType
  size?: 'default' | 'wide' | 'fluid'
  className?: string
  children: ReactNode
}

/**
 * Centered layout container with a consistent responsive gutter.
 * Sizes: `default` (max-w-6xl), `wide` (max-w-7xl), `fluid` (no max).
 */
export function Container({
  as: Comp = 'div',
  size = 'default',
  className,
  children,
}: ContainerProps) {
  return (
    <Comp
      className={cn(
        'mx-auto w-full px-4 sm:px-6 lg:px-8',
        size === 'default' && 'max-w-6xl',
        size === 'wide' && 'max-w-7xl',
        className,
      )}
    >
      {children}
    </Comp>
  )
}