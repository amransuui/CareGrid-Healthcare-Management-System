import { PHARMACY_PRESCRIPTIONS, PHARMACY_MEDICINES, PHARMACY_ALERTS } from '@/data/mock/pharmacy'
import { findPatientSeed } from '@/data/mock/patients'
import { buildPrescriptionWarnings } from '@/lib/pharmacy'
import type {
  NewPrescriptionInput,
  PharmacyMedicine,
  Prescription,
  PrescriptionStatus,
  SafetyAlert,
  SafetyAlertStatus,
} from '@/types/pharmacy'

/**
 * In-memory pharmacy implementation backed by seed data. State resets on
 * page reload, mirroring how a read-only demo API behaves.
 */

const prescriptions: Prescription[] = PHARMACY_PRESCRIPTIONS.map((prescription) => ({
  ...prescription,
  medications: prescription.medications.map((medication) => ({ ...medication })),
  warnings: prescription.warnings.map((warning) => ({ ...warning })),
}))

const medicines: PharmacyMedicine[] = PHARMACY_MEDICINES.map((medicine) => ({ ...medicine }))

const alerts: SafetyAlert[] = PHARMACY_ALERTS.map((alert) => ({ ...alert }))

let nextPrescriptionNumber = 1182

const PRESCRIPTION_TRANSITIONS: Partial<Record<PrescriptionStatus, PrescriptionStatus[]>> = {
  draft: ['active', 'cancelled'],
  active: ['sent', 'cancelled'],
  sent: ['dispensed', 'cancelled'],
}

function generatePrescriptionId(): string {
  return `RX-2026-${nextPrescriptionNumber++}`
}

const nowIso = (): string => new Date().toISOString()

export const mockPharmacyService: {
  listPrescriptions(): Promise<Prescription[]>
  getPrescription(prescriptionId: string): Promise<Prescription | null>
  createPrescription(
    input: NewPrescriptionInput & { doctorId: string; doctorName: string },
  ): Promise<Prescription>
  updatePrescriptionStatus(
    prescriptionId: string,
    status: PrescriptionStatus,
    actionBy: string,
  ): Promise<Prescription>
  listMedicines(): Promise<PharmacyMedicine[]>
  listAlerts(): Promise<SafetyAlert[]>
  updateAlertStatus(alertId: string, status: SafetyAlertStatus): Promise<SafetyAlert>
} = {
  async listPrescriptions() {
    return [...prescriptions].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },

  async getPrescription(prescriptionId) {
    return prescriptions.find((prescription) => prescription.prescriptionId === prescriptionId) ?? null
  },

  async createPrescription(input) {
    const patient = findPatientSeed(input.patientId)
    const patientName = patient?.fullName ?? `Patient ${input.patientId}`

    const warnings = buildPrescriptionWarnings(input.medications, patient?.allergies ?? [])
    const prescription: Prescription = {
      prescriptionId: generatePrescriptionId(),
      patientId: input.patientId,
      patientName,
      doctorId: input.doctorId,
      doctorName: input.doctorName,
      createdAt: nowIso(),
      diagnosis: input.diagnosis,
      status: 'draft',
      pharmacyStatus: 'not_started',
      medications: input.medications.map((medication) => ({ ...medication })),
      warnings,
    }
    prescriptions.unshift(prescription)

    for (const warning of warnings) {
      alerts.unshift({
        alertId: `SA-${nextPrescriptionNumber}`,
        subject: patientName,
        patientId: input.patientId,
        medication: warning.medication,
        context: warning.message,
        type: warning.type,
        severity: warning.severity,
        createdAt: nowIso(),
        status: 'new',
        assignedRole: warning.type === 'interaction' ? 'Doctor' : 'Pharmacist',
      })
    }
    return prescription
  },

  async updatePrescriptionStatus(prescriptionId, status, actionBy) {
    const prescription = prescriptions.find((item) => item.prescriptionId === prescriptionId)
    if (!prescription) throw new Error('Prescription not found.')
    const allowed = PRESCRIPTION_TRANSITIONS[prescription.status] ?? []
    if (!allowed.includes(status)) {
      throw new Error(`Prescription is ${prescription.status} and cannot be changed to ${status}.`)
    }
    const updated: Prescription = { ...prescription, status }
    if (status === 'sent') updated.pharmacyStatus = 'preparing'
    else if (status === 'dispensed') updated.pharmacyStatus = 'dispensed'
    else updated.pharmacyStatus = 'not_started'
    prescriptions.splice(prescriptions.indexOf(prescription), 1, updated)
    void actionBy
    return updated
  },

  async listMedicines() {
    return medicines.map((medicine) => ({ ...medicine }))
  },

  async listAlerts() {
    return [...alerts].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },

  async updateAlertStatus(alertId, status) {
    const alert = alerts.find((item) => item.alertId === alertId)
    if (!alert) throw new Error('Alert not found.')
    const updated: SafetyAlert = { ...alert, status }
    alerts.splice(alerts.indexOf(alert), 1, updated)
    return updated
  },
}