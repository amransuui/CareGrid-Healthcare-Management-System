import type { UserRole } from '@/types/auth'

/**
 * Settings domain types. Profile data is mirrored from the demo session;
 * preferences, security and application settings are frontend-only state.
 */

export const THEMES = ['light', 'dark', 'system'] as const
export type ThemePreference = (typeof THEMES)[number]

export const LANGUAGES = ['en-GB', 'bn-BD'] as const
export type LanguagePreference = (typeof LANGUAGES)[number]

export const DENSITIES = ['comfortable', 'compact'] as const
export type TableDensity = (typeof DENSITIES)[number]

export const NOTIFICATION_CHANNELS = [
  'clinical_alerts',
  'pharmacy_alerts',
  'blood_alerts',
  'billing_updates',
  'discharge_updates',
  'system_updates',
] as const

export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number]

export const NOTIFICATION_CHANNEL_LABELS: Record<NotificationChannel, string> = {
  clinical_alerts: 'Clinical escalations',
  pharmacy_alerts: 'Pharmacy & safety alerts',
  blood_alerts: 'Blood bank requests',
  billing_updates: 'Billing & claims updates',
  discharge_updates: 'Discharge coordination',
  system_updates: 'System and maintenance',
}

export const NOTIFICATION_DELIVERY = ['in_app', 'email', 'sms'] as const
export type NotificationDelivery = (typeof NOTIFICATION_DELIVERY)[number]

export const NOTIFICATION_DELIVERY_LABELS: Record<NotificationDelivery, string> = {
  in_app: 'In-app centre',
  email: 'Email digest',
  sms: 'SMS',
}

export interface UserPreferences {
  theme: ThemePreference
  language: LanguagePreference
  tableDensity: TableDensity
  /** Show a reduced set of columns in wide operational tables. */
  compactTables: boolean
  /** Confirm before a simulated state change in a clinical workflow. */
  confirmDestructiveActions: boolean
  channels: Record<NotificationChannel, boolean>
  delivery: Record<NotificationDelivery, boolean>
  /** Preferred clinical time format used across record views. */
  timeFormat: '24h' | '12h'
}

export interface SecurityPreferences {
  /** Ask again on sensitive screens (simulated). */
  requirePinForExport: boolean
  /** Auto-lock the demo workspace after a period of inactivity. */
  autoLockMinutes: 0 | 5 | 15 | 30
  notifyOnNewDevice: boolean
}

export interface ActiveSession {
  id: string
  device: string
  browser: string
  location: string
  lastActiveAt: string
  current: boolean
  ip: string
}

export interface SettingsSnapshot {
  preferences: UserPreferences
  security: SecurityPreferences
  sessions: ActiveSession[]
  /** ISO timestamp the demo session was issued. */
  sessionIssuedAt: string
  lastPasswordChangeAt: string
  /** Roles allowed to see staff-only settings panels. */
  staffOnlyPanels: UserRole[]
}

export interface ProfileUpdateInput {
  fullName: string
  email: string
  phone: string
  role: UserRole
}

export interface PasswordChangeInput {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}
