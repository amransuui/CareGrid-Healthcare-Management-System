import type { CareTimelineEvent, Patient, VitalsReading } from '@/types/clinical'

/**
 * Family portal domain types: the simplified, read-only view a patient's
 * relatives see. Free of UI and mock concerns so the Spring Boot REST
 * client can satisfy the same contracts later.
 */

export const UPCOMING_CARE_KINDS = [
  'consultation',
  'procedure',
  'investigation',
  'review',
  'follow_up',
] as const

export type UpcomingCareKind = (typeof UPCOMING_CARE_KINDS)[number]

export const UPCOMING_CARE_KIND_LABELS: Record<UpcomingCareKind, string> = {
  consultation: 'Consultation',
  procedure: 'Procedure',
  investigation: 'Investigation',
  review: 'Review',
  follow_up: 'Follow-up',
}

/** A patient a family account is linked to. */
export interface FamilyPatientLink {
  patientId: string
  patientName: string
  /** Relationship of the signed-in family member, e.g. "Son". */
  relationship: string
  /** When access to this record was granted to the family account. */
  accessGrantedAt: string
}

export interface UpcomingCareEvent {
  id: string
  title: string
  scheduledAt: string
  department: string
  kind: UpcomingCareKind
}

export interface BillingLine {
  label: string
  amount: number
}

/** Simplified billing snapshot for the family portal. */
export interface FamilyBillingSummary {
  totalCharged: number
  paidAmount: number
  outstandingAmount: number
  currency: string
  lastInvoiceAt: string
  items: BillingLine[]
}

export const DISCHARGE_STATES = [
  'not_started',
  'in_progress',
  'ready',
  'discharged',
] as const

export type DischargeState = (typeof DISCHARGE_STATES)[number]

export const DISCHARGE_STATE_LABELS: Record<DischargeState, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  ready: 'Ready for discharge',
  discharged: 'Discharged',
}

export interface FamilyDischargeStatus {
  state: DischargeState
  label: string
  description: string
  /** Earliest expected discharge date, when known. */
  estimatedAt?: string
}

export const NOTIFICATION_IMPORTANCE = ['info', 'warning', 'critical'] as const

export type NotificationImportance = (typeof NOTIFICATION_IMPORTANCE)[number]

export interface FamilyNotification {
  id: string
  title: string
  message: string
  createdAt: string
  importance: NotificationImportance
  read: boolean
}

export interface FamilyPortalSnapshot {
  patient: Patient
  link: FamilyPatientLink
  latestVitals: VitalsReading | null
  timeline: CareTimelineEvent[]
  upcoming: UpcomingCareEvent[]
  billing: FamilyBillingSummary
  discharge: FamilyDischargeStatus
  notifications: FamilyNotification[]
}