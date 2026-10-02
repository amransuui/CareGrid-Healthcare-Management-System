import type { PrescriptionMedication } from '@/types/pharmacy'

/**
 * Discharge domain types: readiness, documentation, checklist and the digital
 * discharge summary. Free of UI and mock concerns so the Spring Boot REST
 * client can satisfy the same contracts later.
 *
 * A discharge record in this prototype is a coordination aid only. It is not
 * a legal or clinical finalisation, and nothing here authorises leaving the
 * facility.
 */

export const DISCHARGE_STATUSES = ['pending', 'ready', 'blocked', 'discharged'] as const

export type DischargeStatus = (typeof DISCHARGE_STATUSES)[number]

export const DISCHARGE_STATUS_LABELS: Record<DischargeStatus, string> = {
  pending: 'Pending',
  ready: 'Ready for discharge',
  blocked: 'On hold',
  discharged: 'Discharged',
}

export const DOCUMENTATION_STATUSES = [
  'not_started',
  'in_progress',
  'complete',
] as const

export type DocumentationStatus = (typeof DOCUMENTATION_STATUSES)[number]

export const DOCUMENTATION_STATUS_LABELS: Record<DocumentationStatus, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  complete: 'Complete',
}

export const DISCHARGE_BILLING_STATUSES = ['clear', 'outstanding', 'on_hold'] as const

export type DischargeBillingStatus = (typeof DISCHARGE_BILLING_STATUSES)[number]

export const DISCHARGE_BILLING_LABELS: Record<DischargeBillingStatus, string> = {
  clear: 'Settled',
  outstanding: 'Outstanding',
  on_hold: 'On hold',
}

export interface DischargeProcedure {
  name: string
  performedAt: string
  performedBy: string
}

export interface DischargeFollowUp {
  id: string
  department: string
  scheduledAt: string
  instruction: string
}

export interface DischargeChecklistItem {
  id: string
  label: string
  /** Team responsible for closing the item. */
  ownerRole: string
  required: boolean
  completed: boolean
  completedBy?: string
  completedAt?: string
}

/**
 * Billing position for one admission, mirrored from the billing module.
 * `gross − insurance − paid − waived` always equals `outstanding`.
 */
export interface DischargeBillingSnapshot {
  invoiceId: string
  grossAmount: number
  /** BDT an insurer has agreed to cover on this admission. */
  insuranceCoveredAmount: number
  paidAmount: number
  /** BDT written off (cancelled or re-raised invoice). */
  waivedAmount: number
  outstandingAmount: number
  status: DischargeBillingStatus
}

export interface DischargeVitals {
  recordedAt: string
  heartRate: number
  systolic: number
  diastolic: number
  temperature: number
  spo2: number
  respiratoryRate: number
}

export interface DischargeCase {
  patientId: string
  patientName: string
  age: number
  gender: string
  admissionId: string
  admissionType: string
  ward: string
  bed: string
  attendingDoctor: string
  admittedAt: string
  plannedDischargeAt: string
  dischargedAt?: string
  primaryDiagnosis: string
  diagnoses: string[]
  procedures: DischargeProcedure[]
  medications: PrescriptionMedication[]
  followUps: DischargeFollowUp[]
  dischargeNotes: string
  vitalsAtDischarge: DischargeVitals
  billing: DischargeBillingSnapshot
  documentationStatus: DocumentationStatus
  dischargeStatus: DischargeStatus
  checklist: DischargeChecklistItem[]
  /** Outstanding coordination items (reports, referrals, equipment). */
  pendingItems: string[]
  summaryPreparedBy: string
}

/** Aggregated figures for the discharge dashboard KPI row. */
export interface DischargeSummary {
  pending: number
  ready: number
  dischargedToday: number
  documentationPending: number
  onHold: number
  requiredOutstanding: number
}
