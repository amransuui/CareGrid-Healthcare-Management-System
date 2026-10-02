import { StatusBadge, type StatusTone } from '@/components/common/status-badge'
import {
  MEDICINE_STOCK_LABELS,
  PHARMACY_STATUS_LABELS,
  PRESCRIPTION_STATUS_LABELS,
  SAFETY_ALERT_SEVERITY_LABELS,
  SAFETY_ALERT_STATUS_LABELS,
  SAFETY_ALERT_TYPE_LABELS,
  WARNING_SEVERITY_LABELS,
  WARNING_TYPE_LABELS,
  type MedicineStockStatus,
  type PharmacyStatus,
  type PrescriptionStatus,
  type SafetyAlertSeverity,
  type SafetyAlertStatus,
  type SafetyAlertType,
  type WarningSeverity,
  type WarningType,
} from '@/types/pharmacy'

const prescriptionTones: Record<PrescriptionStatus, StatusTone> = {
  draft: 'neutral',
  active: 'info',
  sent: 'warning',
  dispensed: 'success',
  cancelled: 'neutral',
}

const pharmacyTones: Record<PharmacyStatus, StatusTone> = {
  not_started: 'neutral',
  preparing: 'warning',
  ready: 'info',
  dispensed: 'success',
}

const stockTones: Record<MedicineStockStatus, StatusTone> = {
  in_stock: 'success',
  low_stock: 'warning',
  out_of_stock: 'critical',
  expiring_soon: 'warning',
}

const severityTones: Record<WarningSeverity | SafetyAlertSeverity, StatusTone> = {
  high: 'critical',
  medium: 'warning',
  low: 'neutral',
}

const alertStatusTones: Record<SafetyAlertStatus, StatusTone> = {
  new: 'critical',
  reviewing: 'warning',
  resolved: 'success',
  dismissed: 'neutral',
}

const alertTypeTones: Record<SafetyAlertType, StatusTone> = {
  allergy: 'critical',
  interaction: 'warning',
  duplicate: 'neutral',
  low_stock: 'warning',
  expiring: 'info',
}

export function PrescriptionStatusBadge({ status }: { status: PrescriptionStatus }) {
  return <StatusBadge tone={prescriptionTones[status]} label={PRESCRIPTION_STATUS_LABELS[status]} />
}

export function PharmacyStatusBadge({ status }: { status: PharmacyStatus }) {
  return <StatusBadge tone={pharmacyTones[status]} label={PHARMACY_STATUS_LABELS[status]} />
}

export function MedicineStockBadge({ status }: { status: MedicineStockStatus }) {
  return <StatusBadge tone={stockTones[status]} label={MEDICINE_STOCK_LABELS[status]} />
}

export function WarningSeverityBadge({ severity }: { severity: WarningSeverity }) {
  return <StatusBadge tone={severityTones[severity]} label={WARNING_SEVERITY_LABELS[severity]} withDot={false} />
}

export function WarningTypeBadge({ type }: { type: WarningType }) {
  return <StatusBadge tone={alertTypeTones[type]} label={WARNING_TYPE_LABELS[type]} withDot={false} />
}

export function SafetyAlertSeverityBadge({ severity }: { severity: SafetyAlertSeverity }) {
  return <StatusBadge tone={severityTones[severity]} label={SAFETY_ALERT_SEVERITY_LABELS[severity]} withDot={false} />
}

export function SafetyAlertStatusBadge({ status }: { status: SafetyAlertStatus }) {
  return <StatusBadge tone={alertStatusTones[status]} label={SAFETY_ALERT_STATUS_LABELS[status]} />
}

export function SafetyAlertTypeBadge({ type }: { type: SafetyAlertType }) {
  return <StatusBadge tone={alertTypeTones[type]} label={SAFETY_ALERT_TYPE_LABELS[type]} withDot={false} />
}