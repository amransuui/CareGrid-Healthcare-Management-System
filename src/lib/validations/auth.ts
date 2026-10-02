import { z } from 'zod'
import { USER_ROLES } from '@/types/auth'

export interface PasswordRule {
  id: string
  label: string
  test: (value: string) => boolean
}

/**
 * Single source of truth for the password policy. Both the Zod schema and
 * the interactive password-strength/requirements components read from here.
 */
export const passwordRules: PasswordRule[] = [
  { id: 'length', label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { id: 'uppercase', label: 'One uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { id: 'lowercase', label: 'One lowercase letter', test: (v) => /[a-z]/.test(v) },
  { id: 'digit', label: 'One number', test: (v) => /[0-9]/.test(v) },
  { id: 'special', label: 'One special character', test: (v) => /[^A-Za-z0-9]/.test(v) },
]

export const loginSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be under 128 characters'),
  remember: z.boolean(),
})

export type LoginFields = z.infer<typeof loginSchema>

const PHONE_PATTERN = /^\+?[0-9][0-9\s-]{6,14}$/

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, 'Full name must be at least 3 characters')
    .max(80, 'Full name must be under 80 characters'),
  email: z.email('Enter a valid email address'),
  phone: z
    .string()
    .trim()
    .refine(
      (value) => PHONE_PATTERN.test(value),
      'Enter a valid phone number (7–15 digits, spaces or dashes allowed)',
    ),
  role: z.enum(USER_ROLES, 'Select your role'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .max(64, 'At most 64 characters')
    .refine(
      (value) => passwordRules.every((rule) => rule.test(value)),
      'Include a lowercase letter, an uppercase letter, a number and a special character',
    ),
  confirmPassword: z.string(),
  terms: z
    .boolean()
    .refine(
      (value) => value,
      'You must accept the terms and privacy policy to continue',
    ),
})

export type RegisterFields = z.infer<typeof registerSchema>

/**
 * Confirm-password check must run after refine()s above so the display type
 * carries the correct field. `superRefineHeader` is not supported, so the
 * global check attaches the message to `confirmPassword`.
 */
export const registerSchemaWithConfirm = registerSchema.superRefine(
  (values, ctx) => {
    if (values.password !== values.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'Passwords do not match',
      })
    }
  },
)

export const forgotPasswordSchema = z.object({
  email: z.email('Enter a valid email address'),
})

export type ForgotPasswordFields = z.infer<typeof forgotPasswordSchema>