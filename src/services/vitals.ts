import type {
  RecordVitalsInput,
  VitalsPoint,
  VitalsReading,
} from '@/types/clinical'

/**
 * Vitals service contract. Read-only history is generated deterministically
 * by the mock; recordings are persisted in memory until the page reloads —
 * a Spring Boot implementation replaces both with REST + storage.
 */
export interface VitalsService {
  /** Latest reading per monitored patient, newest recorded first. */
  latestReadings(): Promise<VitalsReading[]>
  /** Latest reading for a single patient, if any. */
  getReading(patientId: string): Promise<VitalsReading | null>
  /** Time-series history (charts) for a patient's vitals over `days`. */
  historyFor(patientId: string, days?: number): Promise<VitalsPoint[]>
  /** Persist a new vitals reading for a patient. */
  record(input: RecordVitalsInput): Promise<VitalsReading>
}