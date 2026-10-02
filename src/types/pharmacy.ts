/**
 * Pharmacy domain types: prescriptions, medication inventory and safety
 * alerts. Free of UI and mock concerns so Spring Boot REST clients can
 * satisfy the same contracts later.
 */

export const PRESCRIPTION_STATUSES = ['draft', 'active', 'sent', 'dispensed', 'cancelled'] as const
export type PrescriptionStatus = (typeof PRESCRIPTION_STATUSES)[number]

export const PRESCRIPTION_STATUS_LABELS: Record<PrescriptionStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  sent: 'Sent',
  dispensed: 'Dispensed',
  cancelled: 'Cancelled',
}

export const PHARMACY_STATUSES = ['not_started', 'preparing', 'ready', 'dispensed'] as const
export type PharmacyStatus = (typeof PHARMACY_STATUSES)[number]

export const PHARMACY_STATUS_LABELS: Record<PharmacyStatus, string> = {
  not_started: 'Not started',
  preparing: 'Preparing',
  ready: 'Ready for collection',
  dispensed: 'Dispensed',
}

export interface PrescriptionMedication {
  medication: string
  strength: string
  dosage: string
  frequency: string
  duration: string
  route: string
  instructions: string
  quantity: number
}

export const WARNING_TYPES = ['allergy', 'interaction', 'duplicate'] as const
export type WarningType = (typeof WARNING_TYPES)[number]

export const WARNING_TYPE_LABELS: Record<WarningType, string> = {
  allergy: 'Allergy warning',
  interaction: 'Interaction warning',
  duplicate: 'Duplicate medication',
}

export type WarningSeverity = 'high' | 'medium' | 'low'

export const WARNING_SEVERITY_LABELS: Record<WarningSeverity, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

export interface PrescriptionWarning {
  type: WarningType
  severity: WarningSeverity
  message: string
  /** Medication name this warning refers to, when tied to a line. */
  medication?: string
}

export interface Prescription {
  prescriptionId: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  createdAt: string
  diagnosis: string
  status: PrescriptionStatus
  pharmacyStatus: PharmacyStatus
  medications: PrescriptionMedication[]
  /** Simulated safety alerts for this prescription. */
  warnings: PrescriptionWarning[]
}

export interface NewPrescriptionInput {
  patientId: string
  diagnosis: string
  medications: PrescriptionMedication[]
}

export const MEDICINE_STOCK_STATUSES = ['in_stock', 'low_stock', 'out_of_stock', 'expiring_soon'] as const
export type MedicineStockStatus = (typeof MEDICINE_STOCK_STATUSES)[number]

export const MEDICINE_STOCK_LABELS: Record<MedicineStockStatus, string> = {
  in_stock: 'In stock',
  low_stock: 'Low stock',
  out_of_stock: 'Out of stock',
  expiring_soon: 'Expiring soon',
}

export interface PharmacyMedicine {
  medicineId: string
  name: string
  genericName: string
  strength: string
  category: string
  stock: number
  reorderLevel: number
  expiryDate: string
}

export const SAFETY_ALERT_TYPES = [
  'allergy',
  'interaction',
  'duplicate',
  'low_stock',
  'expiring',
] as const
export type SafetyAlertType = (typeof SAFETY_ALERT_TYPES)[number]

export const SAFETY_ALERT_TYPE_LABELS: Record<SafetyAlertType, string> = {
  allergy: 'Allergy',
  interaction: 'Drug interaction',
  duplicate: 'Duplicate medication',
  low_stock: 'Low pharmacy stock',
  expiring: 'Expiring medication',
}

export const SAFETY_ALERT_SEVERITIES = ['high', 'medium', 'low'] as const
export type SafetyAlertSeverity = (typeof SAFETY_ALERT_SEVERITIES)[number]

export const SAFETY_ALERT_SEVERITY_LABELS: Record<SafetyAlertSeverity, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

export const SAFETY_ALERT_STATUSES = ['new', 'reviewing', 'resolved', 'dismissed'] as const
export type SafetyAlertStatus = (typeof SAFETY_ALERT_STATUSES)[number]

export const SAFETY_ALERT_STATUS_LABELS: Record<SafetyAlertStatus, string> = {
  new: 'New',
  reviewing: 'Reviewing',
  resolved: 'Resolved',
  dismissed: 'Dismissed',
}

export interface SafetyAlert {
  alertId: string
  /** Patient name or medicine name the alert concerns. */
  subject: string
  /** Human-readable description for the alert detail view. */
  context: string
  patientId?: string
  medication?: string
  type: SafetyAlertType
  severity: SafetyAlertSeverity
  createdAt: string
  status: SafetyAlertStatus
  /** Role expected to action the alert, e.g. Pharmacist or Doctor. */
  assignedRole: string
}