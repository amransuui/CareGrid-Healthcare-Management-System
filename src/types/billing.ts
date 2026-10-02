/**
 * Billing, insurance and claims domain types. Free of UI and mock concerns so
 * the Spring Boot REST client can satisfy the same contracts later.
 *
 * All monetary values in this module are Bangladeshi Taka (BDT) integers.
 * Nothing here represents a real payment, claim or insurer decision.
 */

export const INVOICE_STATUSES = [
  'draft',
  'pending',
  'partially_paid',
  'paid',
  'cancelled',
] as const

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number]

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  pending: 'Pending',
  partially_paid: 'Partially paid',
  paid: 'Paid',
  cancelled: 'Cancelled',
}

export const INVOICE_CATEGORIES = [
  'room',
  'medication',
  'procedure',
  'laboratory',
  'consumable',
  'service',
] as const

export type InvoiceCategory = (typeof INVOICE_CATEGORIES)[number]

export const INVOICE_CATEGORY_LABELS: Record<InvoiceCategory, string> = {
  room: 'Room / bed',
  medication: 'Medication',
  procedure: 'Procedure',
  laboratory: 'Laboratory',
  consumable: 'Consumable',
  service: 'Service',
}

export interface InvoiceLine {
  lineId: string
  description: string
  category: InvoiceCategory
  quantity: number
  /** BDT per unit. */
  unitPrice: number
}

export const INSURANCE_COVERAGE_STATUSES = [
  'self_pay',
  'pending',
  'approved',
  'partially_approved',
  'rejected',
] as const

export type InsuranceCoverageStatus = (typeof INSURANCE_COVERAGE_STATUSES)[number]

export const INSURANCE_COVERAGE_LABELS: Record<InsuranceCoverageStatus, string> = {
  self_pay: 'Self pay',
  pending: 'Pending',
  approved: 'Approved',
  partially_approved: 'Partially approved',
  rejected: 'Rejected',
}

export interface Invoice {
  invoiceId: string
  patientId: string
  patientName: string
  /** Admission this invoice is raised against. */
  admissionId: string
  admissionType: string
  ward: string
  bed: string
  periodStart: string
  periodEnd: string
  issuedAt: string
  status: InvoiceStatus
  lines: InvoiceLine[]
  /** BDT discount applied before insurance. */
  discount: number
  discountReason?: string
  insuranceProviderId?: string
  insuranceStatus: InsuranceCoverageStatus
  /** BDT the insurer has agreed to cover on this invoice. */
  insuranceCoveredAmount: number
  /** BDT received against this invoice. */
  paidAmount: number
  preparedBy: string
}

export const CLAIM_STATUSES = [
  'draft',
  'submitted',
  'under_review',
  'approved',
  'rejected',
  'paid',
] as const

export type ClaimStatus = (typeof CLAIM_STATUSES)[number]

export const CLAIM_STATUS_LABELS: Record<ClaimStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under review',
  approved: 'Approved',
  rejected: 'Rejected',
  paid: 'Paid',
}

export interface ClaimEvent {
  at: string
  status: ClaimStatus
  note: string
  /** Fictional actor label, e.g. "Billing office" or insurer name. */
  actor: string
}

export interface InsuranceClaim {
  claimId: string
  invoiceId: string
  patientId: string
  patientName: string
  providerId: string
  providerName: string
  /** BDT claimed. */
  amount: number
  /** BDT approved by the insurer (0 until approved). */
  approvedAmount: number
  submittedAt: string
  updatedAt: string
  status: ClaimStatus
  policyNumber: string
  /** Short reason for rejection, demo only. */
  rejectionReason?: string
  history: ClaimEvent[]
}

export interface InsuranceProvider {
  providerId: string
  name: string
  shortName: string
  contactPerson: string
  phone: string
  email: string
  /** Demo panel share, 0–100. */
  coverageRatio: number
  activePolicies: number
  claimsThisMonth: number
  /** Fictional average settlement turnaround in days. */
  avgSettlementDays: number
}

/** Aggregated figures for the billing dashboard KPI row. */
export interface BillingSummary {
  totalOutstanding: number
  paidToday: number
  pendingClaims: number
  openInvoices: number
  billedThisMonth: number
  approvedThisMonth: number
  rejectedThisMonth: number
  byStatus: Record<InvoiceStatus, number>
}
