/**
 * Organ care domain types: matching, waiting list, ischemia and living
 * donors. Free of UI and mock concerns so Spring Boot REST clients can
 * satisfy the same contracts later.
 */

export const ORGAN_TYPES = [
  'kidney',
  'liver',
  'heart',
  'lung',
  'pancreas',
] as const
export type OrganType = (typeof ORGAN_TYPES)[number]

export const ORGAN_TYPE_LABELS: Record<OrganType, string> = {
  kidney: 'Kidney',
  liver: 'Liver',
  heart: 'Heart',
  lung: 'Lung',
  pancreas: 'Pancreas',
}

export const URGENCY_LEVELS = ['urgent', 'high', 'standard'] as const
export type UrgencyLevel = (typeof URGENCY_LEVELS)[number]

export const URGENCY_LABELS: Record<UrgencyLevel, string> = {
  urgent: 'Urgent',
  high: 'High',
  standard: 'Standard',
}

export const MATCH_STATUSES = [
  'pending_review',
  'active',
  'offered',
  'accepted',
  'transplant_scheduled',
  'completed',
  'declined',
] as const
export type MatchStatus = (typeof MATCH_STATUSES)[number]

export const MATCH_STATUS_LABELS: Record<MatchStatus, string> = {
  pending_review: 'Pending review',
  active: 'Active',
  offered: 'Offered',
  accepted: 'Accepted',
  transplant_scheduled: 'Transplant scheduled',
  completed: 'Completed',
  declined: 'Declined',
}

export interface CompatibilityFactor {
  factor: string
  donorValue: string
  recipientValue: string
  compatible: boolean
}

export interface OrganMatch {
  matchId: string
  organ: OrganType
  recipientId: string
  recipientName: string
  recipientLocation: string
  donorId: string
  donorName: string
  donorLocation: string
  bloodGroup: string
  /** Engine-style compatibility score 0–100 (demo values). */
  compatibilityScore: number
  urgency: UrgencyLevel
  waitingTimeDays: number
  status: MatchStatus
  lastUpdated: string
  clinicalNotes: string
  factors: CompatibilityFactor[]
}

export const WAITLIST_PRIORITIES = ['urgent', 'high', 'medium'] as const
export type WaitlistPriority = (typeof WAITLIST_PRIORITIES)[number]

export const WAITLIST_PRIORITY_LABELS: Record<WaitlistPriority, string> = {
  urgent: 'Urgent',
  high: 'High',
  medium: 'Standard',
}

export const WAITLIST_STATUSES = [
  'listed',
  'active',
  'matched',
  'transplanted',
  'dormant',
] as const
export type WaitlistStatus = (typeof WAITLIST_STATUSES)[number]

export const WAITLIST_STATUS_LABELS: Record<WaitlistStatus, string> = {
  listed: 'Listed',
  active: 'Active',
  matched: 'Matched',
  transplanted: 'Transplanted',
  dormant: 'Dormant',
}

export interface WaitingListCandidate {
  position: number
  patientId: string
  patientName: string
  organ: OrganType
  bloodGroup: string
  priority: WaitlistPriority
  registeredAt: string
  status: WaitlistStatus
  lastReview: string
  notes?: string
}

export const ISCHEMIA_STATUSES = ['stable', 'active', 'critical', 'completed'] as const
export type IschemiaStatus = (typeof ISCHEMIA_STATUSES)[number]

export const ISCHEMIA_STATUS_LABELS: Record<IschemiaStatus, string> = {
  stable: 'Stable',
  active: 'Active',
  critical: 'Critical',
  completed: 'Completed',
}

export interface IschemiaCase {
  caseId: string
  organ: OrganType
  donor: string
  recipient: string
  startedAt: string
  /** Demo threshold count-down in minutes, not clinical guidance. */
  ischemicLimitMinutes: number
  status: IschemiaStatus
}

export const DONOR_EVALUATION_STATUSES = [
  'registered',
  'under_evaluation',
  'available',
  'matched',
  'deferred',
] as const
export type DonorEvaluationStatus = (typeof DONOR_EVALUATION_STATUSES)[number]

export const DONOR_EVALUATION_LABELS: Record<DonorEvaluationStatus, string> = {
  registered: 'Registered',
  under_evaluation: 'Under evaluation',
  available: 'Available',
  matched: 'Matched',
  deferred: 'Deferred',
}

/** Whether a donor can currently proceed toward donation. */
export const DONOR_AVAILABILITY = ['ready', 'pending', 'unavailable'] as const
export type DonorAvailability = (typeof DONOR_AVAILABILITY)[number]

export const DONOR_AVAILABILITY_LABELS: Record<DonorAvailability, string> = {
  ready: 'Ready',
  pending: 'Pending',
  unavailable: 'Unavailable',
}

export interface LivingDonor {
  donorId: string
  fullName: string
  age: number
  gender: string
  bloodGroup: string
  organ: OrganType
  /** Compatibility summary, e.g. "88%" or "Pending". */
  compatibility: string
  evaluationStatus: DonorEvaluationStatus
  /** Current ability to move toward donation (separate from evaluation stage). */
  availability: DonorAvailability
  lastScreening: string
  location: string
  phone: string
}