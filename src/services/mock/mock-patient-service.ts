import type {
  Patient,
} from '@/types/clinical'
import { patientsSeed } from '@/data/mock/patients'
import { WARD_ID_BY_NAME } from '@/data/mock/wards'
import { computeAge } from '@/lib/clinical'
import { mockWardService } from '@/services/mock/mock-ward-service'
import type { PatientService } from '@/services/patients'

const SIMULATED_LATENCY_MS = 360
const delay = (ms = SIMULATED_LATENCY_MS) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

let patients: Patient[] = structuredClone(patientsSeed)

function nextPatientId(): string {
  const max = patients.reduce((current, patient) => {
    const numeric = Number(patient.patientId.replace(/[^\d]/g, ''))
    return Number.isFinite(numeric) ? Math.max(current, numeric) : current
  }, 0)
  return `P-2026-${max + 1}`
}

function bedIdFor(ward: string, bed: string): string {
  const wardId = WARD_ID_BY_NAME[ward] ?? ward
  return bed ? `${wardId}:${bed}` : ''
}

export const mockPatientService: PatientService = {
  async list() {
    await delay()
    return patients
  },
  async get(patientId) {
    await delay(150)
    return patients.find((patient) => patient.patientId === patientId) ?? null
  },
  async create(input) {
    await delay()
    const patient: Patient = {
      ...input,
      patientId: input.patientId ?? nextPatientId(),
      age: computeAge(input.dateOfBirth),
      admissionDate: new Date().toISOString(),
      status: 'stable',
      medications: [],
      lastUpdated: new Date().toISOString(),
    }
    patients = [...patients, patient]

    if (patient.bed) {
      await mockWardService.occupyBed(bedIdFor(patient.ward, patient.bed), patient.patientId)
    }
    return patient
  },
  async update(input) {
    await delay()
    const target = patients.find((patient) => patient.patientId === input.patientId)
    if (!target) throw new Error(`Patient ${input.patientId} not found`)

    const previousBed = target.bed
    const nextBed = input.bed ?? previousBed
    const previousWard = target.ward
    const nextWard = input.ward ?? previousWard

    const updated: Patient = {
      ...target,
      ...input,
      patientId: target.patientId,
      age: input.dateOfBirth ? computeAge(input.dateOfBirth) : target.age,
      lastUpdated: new Date().toISOString(),
    }
    patients = patients.map((patient) =>
      patient.patientId === input.patientId ? updated : patient,
    )

    const bedChanged = previousBed !== nextBed || previousWard !== nextWard
    if (bedChanged) {
      if (previousBed) {
        await mockWardService.releaseBed(bedIdFor(previousWard, previousBed))
      }
      if (nextBed) {
        await mockWardService.occupyBed(bedIdFor(nextWard, nextBed), updated.patientId)
      }
    }
    return updated
  },
}