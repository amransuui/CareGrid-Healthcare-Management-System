import { Check, Circle } from 'lucide-react'
import { cn } from 'cn'
import { passwordRules } from '@/lib/validations/auth'
import { getPasswordStrength } from '@/lib/auth-password'
import type { StrengthLevel } from '@/lib/auth-password'

const segmentStyles: Record<StrengthLevel, string> = {
  empty: 'bg-muted',
  weak: 'bg-red-500',
  fair: 'bg-amber-500',
  good: 'bg-sky-500',
  strong: 'bg-emerald-500',
}

const labelStyles: Record<StrengthLevel, string> = {
  empty: 'text-muted-foreground',
  weak: 'text-red-600 dark:text-red-400',
  fair: 'text-amber-600 dark:text-amber-400',
  good: 'text-sky-600 dark:text-sky-400',
  strong: 'text-emerald-600 dark:text-emerald-400',
}

interface PasswordStrengthProps {
  value: string
  className?: string
}

/**
 * Segmented strength meter. Communicates level through both color and an
 * explicit label, and is exposed as a meter to assistive technology.
 */
export function PasswordStrength({ value, className }: PasswordStrengthProps) {
  const { passed, level, label } = getPasswordStrength(value)

  return (
    <div className={cn('grid gap-2', className)}>
      <div
        role="meter"
        aria-valuemin={0}
        aria-valuemax={passwordRules.length}
        aria-valuenow={passed}
        aria-valuetext={label ? `${label} password` : undefined}
        className="flex gap-1"
      >
        {passwordRules.map((_, index) => (
          <span
            key={index}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors',
              level === 'empty'
                ? 'bg-muted'
                : index < passed
                  ? segmentStyles[level]
                  : 'bg-muted',
            )}
          />
        ))}
      </div>
      <p
        className={cn(
          'text-xs font-medium',
          labelStyles[level],
          level === 'empty' && 'font-normal',
        )}
      >
        {label ? `Password strength: ${label}` : 'Password strength will update as you type'}
      </p>
    </div>
  )
}

interface PasswordRequirementsProps {
  value: string
  className?: string
}

/**
 * Readable requirement checklist mirroring the live policy. Every met rule
 * is marked with an icon plus text — never color alone.
 */
export function PasswordRequirements({
  value,
  className,
}: PasswordRequirementsProps) {
  return (
    <ul className={cn('grid gap-1.5', className)}>
      {passwordRules.map((rule) => {
        const met = rule.test(value)
        return (
          <li
            key={rule.id}
            className="flex items-center gap-2 text-xs text-muted-foreground"
          >
            <span
              className={cn(
                'flex size-4 shrink-0 items-center justify-center rounded-full',
                met
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  : 'bg-muted text-muted-foreground',
              )}
              aria-hidden="true"
            >
              {met ? (
                <Check className="size-2.5" strokeWidth={3} />
              ) : (
                <Circle className="size-2.5" />
              )}
            </span>
            <span className={cn(met && 'text-foreground')}>{rule.label}</span>
          </li>
        )
      })}
    </ul>
  )
}