import { StatusBadge, type StatusTone } from '@/components/common/status-badge'
import {
  INVOICE_STATUS_LABELS,
  INSURANCE_COVERAGE_LABELS,
  type InsuranceCoverageStatus,
  type InvoiceStatus,
} from '@/types/billing'
import {
  DISCHARGE_BILLING_LABELS,
  DISCHARGE_STATUS_LABELS,
  DOCUMENTATION_STATUS_LABELS,
  type DischargeBillingStatus,
  type DischargeStatus,
  type DocumentationStatus,
} from '@/types/discharge'

/**
 * Status vocabulary for the financial modules. Kept in one place so a tone is
 * never redefined per page and always ships with a text label.
 */

const INVOICE_TONES: Record<InvoiceStatus, StatusTone> = {
  draft: 'neutral',
  pending: 'info',
  partially_paid: 'warning',
  paid: 'success',
  cancelled: 'neutral',
}

const COVERAGE_TONES: Record<InsuranceCoverageStatus, StatusTone> = {
  self_pay: 'neutral',
  pending: 'info',
  approved: 'success',
  partially_approved: 'warning',
  rejected: 'critical',
}

export const CLAIM_TONES = {
  draft: 'neutral',
  submitted: 'info',
  under_review: 'warning',
  approved: 'success',
  rejected: 'critical',
  paid: 'success',
} as const satisfies Record<string, StatusTone>

const DISCHARGE_TONES: Record<DischargeStatus, StatusTone> = {
  pending: 'info',
  ready: 'success',
  blocked: 'critical',
  discharged: 'neutral',
}

const DOCUMENTATION_TONES: Record<DocumentationStatus, StatusTone> = {
  not_started: 'neutral',
  in_progress: 'warning',
  complete: 'success',
}

const DISCHARGE_BILLING_TONES: Record<DischargeBillingStatus, StatusTone> = {
  clear: 'success',
  outstanding: 'warning',
  on_hold: 'critical',
}

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return <StatusBadge tone={INVOICE_TONES[status]} label={INVOICE_STATUS_LABELS[status]} />
}

export function CoverageStatusBadge({ status }: { status: InsuranceCoverageStatus }) {
  return (
    <StatusBadge tone={COVERAGE_TONES[status]} label={INSURANCE_COVERAGE_LABELS[status]} />
  )
}

export function DischargeStatusBadge({ status }: { status: DischargeStatus }) {
  return <StatusBadge tone={DISCHARGE_TONES[status]} label={DISCHARGE_STATUS_LABELS[status]} />
}

export function DocumentationStatusBadge({ status }: { status: DocumentationStatus }) {
  return (
    <StatusBadge tone={DOCUMENTATION_TONES[status]} label={DOCUMENTATION_STATUS_LABELS[status]} />
  )
}

export function DischargeBillingBadge({ status }: { status: DischargeBillingStatus }) {
  return (
    <StatusBadge
      tone={DISCHARGE_BILLING_TONES[status]}
      label={DISCHARGE_BILLING_LABELS[status]}
    />
  )
}
