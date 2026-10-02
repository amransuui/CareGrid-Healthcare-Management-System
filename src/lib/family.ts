import type { DischargeState, NotificationImportance } from '@/types/family'
import { DISCHARGE_STATES } from '@/types/family'
import type { StatusTone } from '@/components/common/status-badge'

/** Format an amount in the portal's currency (BDT). */
export function formatCurrency(amount: number, currency = 'BDT'): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
  return `${formatted} ${currency}`
}

export function isDischargeState(value: unknown): value is DischargeState {
  return (
    typeof value === 'string' &&
    (DISCHARGE_STATES as readonly string[]).includes(value)
  )
}

const dischargeTone: Record<DischargeState, StatusTone> = {
  not_started: 'neutral',
  in_progress: 'info',
  ready: 'warning',
  discharged: 'success',
}

export function dischargeToneFor(state: DischargeState): StatusTone {
  return dischargeTone[state]
}

const importanceTone: Record<NotificationImportance, StatusTone> = {
  info: 'info',
  warning: 'warning',
  critical: 'critical',
}

export function notificationToneFor(importance: NotificationImportance): StatusTone {
  return importanceTone[importance]
}