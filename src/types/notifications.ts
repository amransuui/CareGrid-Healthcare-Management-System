import type { UserRole } from '@/types/auth'

/**
 * Notification domain types. One module taxonomy is shared by the topbar
 * popover and the full notification centre so the two never drift apart.
 */

export const NOTIFICATION_MODULES = [
  'clinical',
  'operations',
  'billing',
  'pharmacy',
  'blood',
  'organ',
  'system',
] as const

export type NotificationModule = (typeof NOTIFICATION_MODULES)[number]

export const NOTIFICATION_MODULE_LABELS: Record<NotificationModule, string> = {
  clinical: 'Clinical',
  operations: 'Operations',
  billing: 'Billing',
  pharmacy: 'Pharmacy',
  blood: 'Blood bank',
  organ: 'Organ care',
  system: 'System',
}

export const NOTIFICATION_PRIORITIES = ['critical', 'high', 'normal', 'low'] as const

export type NotificationPriority = (typeof NOTIFICATION_PRIORITIES)[number]

export const NOTIFICATION_PRIORITY_LABELS: Record<NotificationPriority, string> = {
  critical: 'Critical',
  high: 'High',
  normal: 'Normal',
  low: 'Low',
}

/** Roles allowed to see a notification. Empty means every role. */
export type NotificationAudience = readonly UserRole[]

export interface NotificationItem {
  id: string
  module: NotificationModule
  /** Short event class, e.g. "Escalation", "Stock warning". */
  type: string
  title: string
  description: string
  /** ISO timestamp used for relative ("5m ago") formatting. */
  time: string
  priority: NotificationPriority
  /** Route opened when the notification is followed. */
  href?: string
  /** Roles this notification is addressed to. */
  audience: NotificationAudience
}

/** Counts used by the topbar badge and the notification-centre filter tabs. */
export interface NotificationCounters {
  total: number
  unread: number
  byModule: Record<NotificationModule, number>
}
