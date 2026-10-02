import type { ReactNode } from 'react'
import { CircleAlert } from 'lucide-react'
import { cn } from 'cn'
import { Label } from '@/components/ui/label'

interface FormFieldProps {
  id: string
  label: string
  /** Error resolves to the control's `aria-describedby` — pass `${id}-error`. */
  error?: string
  /** Hint resolves to the control's `aria-describedby` — pass `${id}-hint`. */
  hint?: string
  required?: boolean
  children: ReactNode
  className?: string
}

/**
 * Label + control + hint/error block shared by auth and clinical forms.
 * Error and hint ids are deterministic (`${id}-error`, `${id}-hint`) so pages
 * wire `aria-describedby` on their controls without guessing.
 */
export function FormField({
  id,
  label,
  error,
  hint,
  required,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('grid gap-1.5', className)}>
      <Label htmlFor={id}>
        {label}
        {required ? (
          <span className="text-destructive" aria-hidden="true">
            {' '}
            *
          </span>
        ) : null}
      </Label>
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p
          id={`${id}-error`}
          className="flex items-start gap-1 text-xs font-medium text-destructive"
        >
          <CircleAlert
            className="mt-px size-3.5 shrink-0"
            aria-hidden="true"
          />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  )
}