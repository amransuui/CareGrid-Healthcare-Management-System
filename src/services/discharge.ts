import type {
  DischargeCase,
  DischargeSummary,
  DocumentationStatus,
} from '@/types/discharge'

/**
 * Discharge service contract. Mirrors the REST endpoints the Spring Boot
 * backend will expose, so the mock can be replaced without touching the UI.
 */
export interface DischargeService {
  listCases(): Promise<DischargeCase[]>
  getCase(patientId: string): Promise<DischargeCase | null>
  getSummary(): Promise<DischargeSummary>
  setChecklistItem(
    patientId: string,
    itemId: string,
    completed: boolean,
    actor: string,
  ): Promise<DischargeCase>
  setDocumentationStatus(
    patientId: string,
    status: DocumentationStatus,
  ): Promise<DischargeCase>
  markDischarged(patientId: string, actor: string): Promise<DischargeCase>
  revertToPending(patientId: string, actor: string): Promise<DischargeCase>
}
