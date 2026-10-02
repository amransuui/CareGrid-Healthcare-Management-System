import type {
  NewPrescriptionInput,
  PharmacyMedicine,
  Prescription,
  SafetyAlert,
  SafetyAlertStatus,
  PrescriptionStatus,
} from '@/types/pharmacy'

/**
 * Contract the Pharmacy UI depends on. A Spring Boot client can implement
 * the same methods backed by REST endpoints (list/get/create/update/delete).
 */
export interface PharmacyService {
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
}