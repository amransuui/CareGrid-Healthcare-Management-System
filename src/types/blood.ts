/**
 * Blood bank domain types: inventory, donors, requests and emergency SOS.
 * Free of UI and mock concerns so Spring Boot REST clients can satisfy the
 * same contracts later.
 */

export const BLOOD_GROUPS = ['O+', 'O−', 'A+', 'A−', 'B+', 'B−', 'AB+', 'AB−'] as const

export const BLOOD_COMPONENTS = ['whole_blood', 'rbc', 'platelets', 'plasma'] as const
export type BloodComponent = (typeof BLOOD_COMPONENTS)[number]

export const BLOOD_COMPONENT_LABELS: Record<BloodComponent, string> = {
  whole_blood: 'Whole blood',
  rbc: 'Red cells',
  platelets: 'Platelets',
  plasma: 'Plasma',
}

export const STOCK_STATUSES = ['safe', 'low', 'critical'] as const
export type StockStatus = (typeof STOCK_STATUSES)[number]

export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  safe: 'In stock',
  low: 'Low stock',
  critical: 'Critical',
}

export interface BloodInventoryItem {
  id: string
  bloodGroup: string
  component: BloodComponent
  units: number
  expiryDate: string
  lastUpdated: string
}

export const DONOR_STATUSES = [
  'eligible',
  'donated_recently',
  'deferred',
  'ineligible',
] as const
export type DonorStatus = (typeof DONOR_STATUSES)[number]

export const DONOR_STATUS_LABELS: Record<DonorStatus, string> = {
  eligible: 'Eligible',
  donated_recently: 'Recently donated',
  deferred: 'Temporarily unavailable',
  ineligible: 'Not eligible',
}

export const CONTACT_STATUSES = ['confirmed', 'pending', 'unavailable'] as const
export type ContactStatus = (typeof CONTACT_STATUSES)[number]

export const CONTACT_STATUS_LABELS: Record<ContactStatus, string> = {
  confirmed: 'Reachable',
  pending: 'Contact pending',
  unavailable: 'Unavailable',
}

export interface BloodDonor {
  donorId: string
  fullName: string
  age: number
  gender: string
  bloodGroup: string
  phone: string
  location: string
  /** ISO date of the most recent donation, if any. */
  lastDonation: string | null
  totalDonations: number
  lastScreening: string
  status: DonorStatus
  contact: ContactStatus
}

export const REQUEST_STATUSES = ['pending', 'processing', 'fulfilled', 'cancelled'] as const
export type BloodRequestStatus = (typeof REQUEST_STATUSES)[number]

export const REQUEST_STATUS_LABELS: Record<BloodRequestStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  fulfilled: 'Fulfilled',
  cancelled: 'Cancelled',
}

export const REQUEST_URGENCIES = ['critical', 'urgent', 'routine'] as const
export type RequestUrgency = (typeof REQUEST_URGENCIES)[number]

export const REQUEST_URGENCY_LABELS: Record<RequestUrgency, string> = {
  critical: 'Critical',
  urgent: 'Urgent',
  routine: 'Routine',
}

export interface BloodRequest {
  requestId: string
  hospital: string
  ward: string
  patientId: string
  patientName: string
  bloodGroup: string
  component: BloodComponent
  unitsRequested: number
  urgency: RequestUrgency
  requestedAt: string
  status: BloodRequestStatus
  coordinator: string
}

export const SOS_RESPONSE_STATUSES = [
  'awaiting',
  'broadcasting',
  'received',
  'fulfilled',
] as const
export type SosResponseStatus = (typeof SOS_RESPONSE_STATUSES)[number]

export const SOS_RESPONSE_LABELS: Record<SosResponseStatus, string> = {
  awaiting: 'Awaiting response',
  broadcasting: 'Broadcasting',
  received: 'Responses received',
  fulfilled: 'Fulfilled',
}

export const SOS_BROADCAST_STATUSES = ['not_started', 'broadcasting', 'completed'] as const
export type SosBroadcastStatus = (typeof SOS_BROADCAST_STATUSES)[number]

export const SOS_BROADCAST_LABELS: Record<SosBroadcastStatus, string> = {
  not_started: 'Not started',
  broadcasting: 'Broadcasting',
  completed: 'Broadcast done',
}

export type SosAction =
  | 'start_broadcast'
  | 'mark_donor'
  | 'mark_response'
  | 'fulfill'

export interface SosCase {
  sosId: string
  bloodGroup: string
  component: BloodComponent
  unitsRequired: number
  unitsSecured: number
  ward: string
  patientId: string
  patientName: string
  patientPriority: 'critical' | 'high'
  requestedAt: string
  responseStatus: SosResponseStatus
  broadcastStatus: SosBroadcastStatus
  coordinator: string
}