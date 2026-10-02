import { passwordRules } from '@/lib/validations/auth'

export type StrengthLevel = 'empty' | 'weak' | 'fair' | 'good' | 'strong'

export interface PasswordStrengthResult {
  passed: number
  level: StrengthLevel
  label: string
}

/** Evaluates a password against the live policy rules. */
export function getPasswordStrength(value: string): PasswordStrengthResult {
  if (!value) {
    return { passed: 0, level: 'empty', label: '' }
  }
  const passed = passwordRules.filter((rule) => rule.test(value)).length
  if (passed <= 2) return { passed, level: 'weak', label: 'Weak' }
  if (passed === 3) return { passed, level: 'fair', label: 'Fair' }
  if (passed === 4) return { passed, level: 'good', label: 'Good' }
  return { passed, level: 'strong', label: 'Strong' }
}