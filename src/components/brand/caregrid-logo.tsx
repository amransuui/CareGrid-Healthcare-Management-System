import { cn } from 'cn'
import { HeartPulse } from 'lucide-react'
import { siteConfig } from '@/config/site'

export function CareGridLogo({
  className,
}: {
  className?: string
}) {
  return (
    <span
      className={cn('inline-flex items-center gap-2 font-semibold', className)}
    >
      <HeartPulse
        className="size-6 text-primary"
        aria-hidden="true"
      />
      <span>{siteConfig.name}</span>
    </span>
  )
}