import type {
  ActiveSession,
  SecurityPreferences,
  SettingsSnapshot,
  UserPreferences,
} from '@/types/settings'

/**
 * Fictional settings demo data. Active sessions, password history and the
 * current role are invented; nothing here is connected to an identity
 * provider, and no credential is ever sent anywhere.
 */

const HOUR_MS = 3_600_000
const DAY_MS = 86_400_000

const hoursAgo = (hours: number): string =>
  new Date(Date.now() - hours * HOUR_MS).toISOString()
const daysAgo = (days: number): string =>
  new Date(Date.now() - days * DAY_MS).toISOString()

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  language: 'en-GB',
  tableDensity: 'comfortable',
  compactTables: false,
  confirmDestructiveActions: true,
  channels: {
    clinical_alerts: true,
    pharmacy_alerts: true,
    blood_alerts: true,
    billing_updates: true,
    discharge_updates: true,
    system_updates: false,
  },
  delivery: {
    in_app: true,
    email: true,
    sms: false,
  },
  timeFormat: '24h',
}

export const DEFAULT_SECURITY_PREFERENCES: SecurityPreferences = {
  requirePinForExport: false,
  autoLockMinutes: 15,
  notifyOnNewDevice: true,
}

export const DEMO_ACTIVE_SESSIONS: ActiveSession[] = [
  {
    id: 'ses-001',
    device: 'Desktop workstation',
    browser: 'Chrome 128 on Windows',
    location: 'Dhaka, Bangladesh',
    lastActiveAt: hoursAgo(0),
    current: true,
    ip: '203.0.113.24',
  },
  {
    id: 'ses-002',
    device: 'Ward tablet',
    browser: 'Safari 18 on iPadOS',
    location: 'Dhaka, Bangladesh',
    lastActiveAt: hoursAgo(3),
    current: false,
    ip: '203.0.113.88',
  },
  {
    id: 'ses-003',
    device: 'Mobile',
    browser: 'Chrome 128 on Android',
    location: 'Dhaka, Bangladesh',
    lastActiveAt: daysAgo(2),
    current: false,
    ip: '198.51.100.17',
  },
]

export function buildSettingsSnapshot(): SettingsSnapshot {
  return {
    preferences: { ...DEFAULT_PREFERENCES },
    security: { ...DEFAULT_SECURITY_PREFERENCES },
    sessions: DEMO_ACTIVE_SESSIONS.map((session) => ({ ...session })),
    sessionIssuedAt: hoursAgo(2),
    lastPasswordChangeAt: daysAgo(48),
    staffOnlyPanels: ['doctor', 'nurse', 'blood_bank_coordinator', 'pharmacist', 'billing_officer'],
  }
}
