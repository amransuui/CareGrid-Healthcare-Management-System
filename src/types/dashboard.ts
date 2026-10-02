import type { UserRole } from '@/types/auth'

/**
 * Application-domain types for the authenticated operations dashboard.
 * These are consumed by the dashboard service so the Spring Boot swap-in
 * only has to map REST responses onto the same shapes.
 */

export type Severity = 'critical' | 'warning' | 'info'

export type InventoryStatus = 'ok' | 'low' | 'critical'

export type KpiId =
  | 'totalPatients'
  | 'criticalPatients'
  | 'wardOccupancy'
  | 'bloodInventory'
  | 'organMatches'
  | 'prescriptionQueue'
  | 'pendingBilling'
  | 'emergencyRequests'

export interface DashboardKpi {
  id: KpiId
  label: string
  value: string
  context: string
  delta: string
}

export interface PatientFlowDay {
  day: string
  admitted: number
  discharged: number
}

export interface WardStat {
  ward: string
  occupied: number
  available: number
  cleaning: number
  reserved: number
}

export interface BloodGroupStock {
  group: string
  units: number
  expiring: number
  status: InventoryStatus
}

export interface PrescriptionTask {
  id: string
  patient: string
  medication: string
  priority: 'priority' | 'standard'
  status: 'awaiting_pharmacist' | 'safety_review' | 'ready'
  time: string
}

export interface OrganMatchTask {
  id: string
  recipient: string
  organ: string
  blood: string
  score: number
  urgency: 'critical' | 'urgent' | 'standard'
}

export interface DashboardAlert {
  id: string
  severity: Severity
  title: string
  detail: string
  venue: string
  time: string
}

/** Role-driven dashboard emphasis. Rendering only — not authorization. */
export interface RoleFocus {
  greeting: string
  kpiIds: KpiId[]
  focusPoints: { title: string; description: string }[]
}

export type RoleDashboardFocus = Record<UserRole, RoleFocus>

export interface DashboardOverview {
  kpis: DashboardKpi[]
  patientFlow: PatientFlowDay[]
  wardOccupancy: WardStat[]
  bloodInventory: BloodGroupStock[]
  prescriptionQueue: PrescriptionTask[]
  organMatches: OrganMatchTask[]
  alerts: DashboardAlert[]
}

export type ActivityStatus = 'done' | 'in_progress' | 'pending' | 'info'

export interface ActivityEvent {
  id: string
  time: string
  event: string
  department: string
  user: string
  roleLabel: string
  status: ActivityStatus
  statusLabel: string
}

export type QuickActionIcon =
  | 'user-plus'
  | 'activity'
  | 'arrow-right-left'
  | 'siren'
  | 'clipboard-plus'
  | 'receipt'

export type QuickActionId =
  | 'addPatient'
  | 'recordVitals'
  | 'bloodRequest'
  | 'emergencySos'
  | 'newPrescription'
  | 'createInvoice'

export interface QuickAction {
  id: QuickActionId
  label: string
  description: string
  href: string
  icon: QuickActionIcon
}