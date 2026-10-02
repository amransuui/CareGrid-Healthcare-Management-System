import type {
  BloodDonor,
  BloodInventoryItem,
  BloodRequest,
  BloodRequestStatus,
  SosAction,
  SosCase,
} from '@/types/blood'

/**
 * Blood bank service contract. REST-style methods mirroring the future
 * Spring Boot endpoints; today they resolve from `@/data/mock/blood`.
 */
export interface BloodService {
  /** Full blood-component inventory across the eight groups. */
  listInventory(): Promise<BloodInventoryItem[]>
  /** Donor registry, most recently screened first. */
  listDonors(): Promise<BloodDonor[]>
  /** A single donor record. */
  getDonor(donorId: string): Promise<BloodDonor | null>
  /** Blood requests, newest first. */
  listRequests(): Promise<BloodRequest[]>
  /** Move a request to a new status (frontend-only demo update). */
  updateRequestStatus(requestId: string, status: BloodRequestStatus): Promise<BloodRequest>
  /** Active emergency SOS cases. */
  listSos(): Promise<SosCase[]>
  /** Advance an SOS case through the demo workflow. */
  advanceSos(sosId: string, action: SosAction): Promise<SosCase>
}