import type {
  DischargeBillingSnapshot,
  DischargeCase,
  DischargeChecklistItem,
} from '@/types/discharge'

/**
 * Discharge readiness helpers. Pure functions so the same rules apply whether
 * the data comes from the demo ledger or a Spring Boot REST response.
 */

/** Recomputes the admission balance so the detail panel can never drift. */
export function dischargeBillingTotals(billing: DischargeBillingSnapshot): {
  grossAmount: number
  insuranceCoveredAmount: number
  paidAmount: number
  waivedAmount: number
  outstandingAmount: number
} {
  const outstanding = Math.max(
    0,
    billing.grossAmount -
      billing.insuranceCoveredAmount -
      billing.paidAmount -
      billing.waivedAmount,
  )
  return {
    grossAmount: billing.grossAmount,
    insuranceCoveredAmount: billing.insuranceCoveredAmount,
    paidAmount: billing.paidAmount,
    waivedAmount: billing.waivedAmount,
    outstandingAmount: outstanding,
  }
}

export function checklistProgress(checklist: DischargeChecklistItem[]): {
  completed: number
  total: number
  requiredTotal: number
  requiredCompleted: number
  percent: number
} {
  const required = checklist.filter((item) => item.required)
  const completed = checklist.filter((item) => item.completed).length
  const requiredCompleted = required.filter((item) => item.completed).length
  return {
    completed,
    total: checklist.length,
    requiredTotal: required.length,
    requiredCompleted,
    percent: checklist.length ? Math.round((completed / checklist.length) * 100) : 0,
  }
}

/** Required checklist items that are still open. */
export function openRequiredItems(checklist: DischargeChecklistItem[]): DischargeChecklistItem[] {
  return checklist.filter((item) => item.required && !item.completed)
}

/**
 * Coordination reasons a discharge cannot be released yet. Descriptive only —
 * this prototype does not make or authorise a clinical decision.
 */
export function dischargeBlockers(discharge: DischargeCase): string[] {
  const blockers: string[] = []
  if (discharge.documentationStatus !== 'complete') {
    blockers.push('Discharge documentation is not complete.')
  }
  const open = openRequiredItems(discharge.checklist)
  if (open.length) {
    blockers.push(
      `${open.length} required checklist item${open.length === 1 ? '' : 's'} still open: ${open
        .map((item) => item.label)
        .join(', ')}.`,
    )
  }
  if (discharge.billing.status !== 'clear') {
    blockers.push('Billing is not settled for this admission.')
  }
  if (discharge.pendingItems.length) {
    blockers.push(`${discharge.pendingItems.length} coordination item(s) outstanding.`)
  }
  return blockers
}

export function isDischargeReady(discharge: DischargeCase): boolean {
  return dischargeBlockers(discharge).length === 0
}

/** Sort key used by the discharge table so earliest planned date leads. */
export function plannedDischargeSortKey(discharge: DischargeCase): string {
  return discharge.plannedDischargeAt
}
