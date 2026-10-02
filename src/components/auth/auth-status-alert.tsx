import type { ReactNode } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'

interface AuthStatusAlertProps {
  title: string
  children: ReactNode
  className?: string
}

/** Persistent form/server error block — icon + text, never color alone. */
export function AuthErrorAlert({
  title,
  children,
  className,
}: AuthStatusAlertProps) {
  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="size-4" aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  )
}

/** Success message block announced as status to screen readers. */
export function AuthSuccessAlert({
  title,
  children,
  className,
}: AuthStatusAlertProps) {
  return (
    <Alert role="status" className={className}>
      <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  )
}