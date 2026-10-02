import type { VitalsReading } from '@/types/clinical'
import { findPatientSeed } from '@/data/mock/patients'
import {
  buildVitalsSeries,
  generateLatestReadings,
} from '@/data/mock/vitals'
import type { VitalsService } from '@/services/vitals'

const SIMULATED_LATENCY_MS = 320
const delay = (ms = SIMULATED_LATENCY_MS) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

let readings: VitalsReading[] = generateLatestReadings()

function upsert(reading: VitalsReading): void {
  readings = [reading, ...readings.filter((entry) => entry.patientId !== reading.patientId)]
}

export const mockVitalsService: VitalsService = {
  async latestReadings() {
    await delay()
    return [...readings].sort(
      (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
    )
  },
  async getReading(patientId) {
    await delay(150)
    return readings.find((reading) => reading.patientId === patientId) ?? null
  },
  async historyFor(patientId, days = 7) {
    await delay()
    const patient = findPatientSeed(patientId)
    const latest = readings.find((reading) => reading.patientId === patientId)
    if (!patient || !latest) return []
    return buildVitalsSeries(patient, latest, days)
  },
  async record(input) {
    await delay()
    const reading: VitalsReading = {
      id: `VR-${input.patientId}-${Date.now().toString(36)}`,
      patientId: input.patientId,
      recordedAt: new Date().toISOString(),
      heartRate: input.heartRate,
      systolic: input.systolic,
      diastolic: input.diastolic,
      temperature: input.temperature,
      spo2: input.spo2,
      respiratoryRate: input.respiratoryRate,
      notes: input.notes?.trim() || undefined,
      recordedBy: input.recordedBy,
    }
    upsert(reading)
    return reading
  },
}