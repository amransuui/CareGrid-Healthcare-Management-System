import {
  BedDouble,
  BellRing,
  ClipboardPlus,
  Droplets,
  HeartPulse,
  ReceiptText,
  Stethoscope,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { StatusBadge, type StatusTone } from '@/components/common/status-badge'
import {
  NOTIFICATION_MODULE_LABELS,
  NOTIFICATION_PRIORITY_LABELS,
  type NotificationModule,
  type NotificationPriority,
} from '@/types/notifications'

/**
 * Icon, label and tone vocabulary for the notification feed. Kept in one place
 * so the popover, the notification centre and any future email digest render
 * identical signals.
 */

export const NOTIFICATION_MODULE_ICONS: Record<NotificationModule, LucideIcon> = {
  clinical: Stethoscope,
  operations: BedDouble,
  billing: ReceiptText,
  pharmacy: ClipboardPlus,
  blood: Droplets,
  organ: HeartPulse,
  system: BellRing,
}

export const NOTIFICATION_PRIORITY_TONES: Record<NotificationPriority, StatusTone> = {
  critical: 'critical',
  high: 'warning',
  normal: 'info',
  low: 'neutral',
}

export function NotificationModuleBadge({ module }: { module: NotificationModule }) {
  return (
    <StatusBadge tone="neutral" label={NOTIFICATION_MODULE_LABELS[module]} withDot={false} />
  )
}

export function NotificationPriorityBadge({ priority }: { priority: NotificationPriority }) {
  return (
    <StatusBadge
      tone={NOTIFICATION_PRIORITY_TONES[priority]}
      label={NOTIFICATION_PRIORITY_LABELS[priority]}
      withDot={false}
    />
  )
}
