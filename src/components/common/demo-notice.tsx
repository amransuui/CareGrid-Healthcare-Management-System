import { Info } from 'lucide-react'
import { cn } from 'cn'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface DemoNoticeProps {
  title?: string
  description: string
  tone?: 'default' | 'warning'
  className?: string
}

/**
 * The single wording used to mark fictional demo data. Used anywhere a screen
 * could otherwise be mistaken for a real clinical, financial or dispatch
 * decision.
 */
export function DemoNotice({
  title = 'Demo data only',
  description,
  tone = 'default',
  className,
}: DemoNoticeProps) {
  return (
    <Alert
      className={cn(
        tone === 'warning' &&
          'border-amber-200 bg-amber-50/70 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200',
        className,
      )}
    >
      <Info aria-hidden="true" className="size-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  )
}
