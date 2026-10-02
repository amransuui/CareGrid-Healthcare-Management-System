import { cn } from 'cn'

interface SectionHeaderProps {
  kicker?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  className?: string
}

/**
 * Consistent section heading block for content sections
 * (used by landing and public pages).
 */
export function SectionHeader({
  kicker,
  title,
  description,
  align = 'left',
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2',
        align === 'center' && 'items-center text-center',
        className,
      )}
    >
      {kicker ? (
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">
          {kicker}
        </p>
      ) : null}
      <h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            'max-w-2xl text-muted-foreground',
            align === 'center' && 'mx-auto',
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  )
}