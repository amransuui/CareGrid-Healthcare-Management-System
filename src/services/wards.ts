import type {
  Bed,
  BedStatus,
  PendingAdmission,
  Ward,
  WardStats,
} from '@/types/clinical'

export interface WardSummary {
  overall: WardStats
  byWard: Array<{ ward: Ward; stats: WardStats }>
}

/**
 * Ward / bed management service contract. Bed status transitions map to
 * REST-y `update` style endpoints so the Spring Boot swap stays mechanical.
 */
export interface WardService {
  listWards(): Promise<Ward[]>
  listBeds(): Promise<Bed[]>
  getBed(bedId: string): Promise<Bed | null>
  summary(): Promise<WardSummary>
  pendingAdmissions(): Promise<PendingAdmission[]>
  updateBedStatus(bedId: string, status: BedStatus): Promise<Bed>
  /** Mark a bed occupied by a patient (used by the patient service). */
  occupyBed(bedId: string, patientId: string): Promise<Bed>
  /** Free a bed when a patient is moved or discharged. */
  releaseBed(bedId: string): Promise<Bed>
}