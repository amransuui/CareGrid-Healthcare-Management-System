import type {
  NewPatientInput,
  Patient,
  PatientUpdateInput,
} from '@/types/clinical'

/**
 * Patient directory service contract. Mirrors a REST patient resource
 * (list / get / create / update) so a Spring Boot implementation can slot
 * in without touching the UI.
 */
export interface PatientService {
  list(): Promise<Patient[]>
  get(patientId: string): Promise<Patient | null>
  create(input: NewPatientInput): Promise<Patient>
  update(input: PatientUpdateInput): Promise<Patient>
}