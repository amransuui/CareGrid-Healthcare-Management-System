import type { FamilyPatientLink, FamilyPortalSnapshot } from '@/types/family'

/**
 * Family portal service contract. REST-style methods mirroring the future
 * Spring Boot endpoints; today they resolve from mock data.
 */
export interface FamilyService {
  /** Patients linked to the signed-in family account. */
  listLinkedPatients(): Promise<FamilyPatientLink[]>
  /** Full portal snapshot for a linked patient, if access exists. */
  overview(patientId: string): Promise<FamilyPortalSnapshot | null>
}