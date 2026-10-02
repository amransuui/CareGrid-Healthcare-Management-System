import type { Bed, BedStatus, PendingAdmission } from '@/types/clinical'
import { patientsSeed } from '@/data/mock/patients'
import {
  WARDS,
  buildBedNumber,
  computeWardStats,
  demoEmptyBedStatus,
  hoursAgoIso,
  minutesAgoIso,
} from '@/data/mock/wards'
import type { WardService, WardSummary } from '@/services/wards'

const SIMULATED_LATENCY_MS = 350
const delay = (ms = SIMULATED_LATENCY_MS) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

const pendingAdmissionsSeed: PendingAdmission[] = [
  {
    patientId: 'P-2026-2001',
    fullName: 'Sakib Chowdhury',
    admissionDate: hoursAgoIso(1),
    attendingDoctor: 'Dr. Mahmudul Islam',
    assignedNurse: 'Shathi Rani',
  },
  {
    patientId: 'P-2026-2002',
    fullName: 'Farhana Karim',
    admissionDate: hoursAgoIso(3),
    attendingDoctor: 'Dr. Fahmida Yasmin',
    assignedNurse: 'Popy Rani',
  },
  {
    patientId: 'P-2026-2003',
    fullName: 'Jahangir Alam',
    admissionDate: hoursAgoIso(5),
    attendingDoctor: 'Dr. Salma Khatun',
    assignedNurse: 'Anjuman Ara',
  },
]

function buildBeds(): Bed[] {
  const occupiedByNumber = new Map(
    patientsSeed
      .filter((patient) => patient.status !== 'discharged' && patient.bed)
      .map((patient) => [patient.bed, patient.patientId]),
  )

  return WARDS.flatMap((ward, wardIndex) => {
    const beds: Bed[] = []
    for (let index = 1; index <= ward.bedCount; index += 1) {
      const number = buildBedNumber(ward.prefix, index)
      const patientId = occupiedByNumber.get(number)
      const status: BedStatus = patientId ? 'occupied' : demoEmptyBedStatus(index, ward.bedCount)
      beds.push({
        id: `${ward.id}:${number}`,
        number,
        ward: ward.name,
        status,
        ...(patientId ? { patientId } : {}),
        lastCleaned: patientId ? undefined : hoursAgoIso(5 + ((wardIndex + index) % 4) * 6),
        lastUpdated: minutesAgoIso(3 + index * 2),
      })
    }
    return beds
  })
}

let beds: Bed[] = buildBeds()

export const mockWardService: WardService = {
  async listWards() {
    await delay()
    return WARDS
  },
  async listBeds() {
    await delay()
    return beds
  },
  async getBed(bedId) {
    await delay(150)
    return beds.find((bed) => bed.id === bedId) ?? null
  },
  async summary() {
    await delay()
    const byWard: WardSummary['byWard'] = WARDS.map((ward) => ({
      ward,
      stats: computeWardStats(beds.filter((bed) => bed.ward === ward.name)),
    }))
    return { overall: computeWardStats(beds), byWard }
  },
  async pendingAdmissions() {
    await delay()
    return pendingAdmissionsSeed
  },
  async updateBedStatus(bedId, status) {
    await delay()
    const bed = beds.find((candidate) => candidate.id === bedId)
    if (!bed) throw new Error(`Bed ${bedId} not found`)
    const updated: Bed = {
      ...bed,
      status,
      ...(status === 'occupied' ? {} : { patientId: undefined }),
      lastUpdated: new Date().toISOString(),
    }
    beds = beds.map((candidate) => (candidate.id === bedId ? updated : candidate))
    return updated
  },
  async occupyBed(bedId, patientId) {
    await delay()
    const bed = beds.find((candidate) => candidate.id === bedId)
    if (!bed) throw new Error(`Bed ${bedId} not found`)
    const updated: Bed = {
      ...bed,
      status: 'occupied',
      patientId,
      lastUpdated: new Date().toISOString(),
    }
    beds = beds.map((candidate) => (candidate.id === bedId ? updated : candidate))
    return updated
  },
  async releaseBed(bedId) {
    await delay()
    const bed = beds.find((candidate) => candidate.id === bedId)
    if (!bed) throw new Error(`Bed ${bedId} not found`)
    const updated: Bed = {
      ...bed,
      status: 'available',
      patientId: undefined,
      lastUpdated: new Date().toISOString(),
    }
    beds = beds.map((candidate) => (candidate.id === bedId ? updated : candidate))
    return updated
  },
}