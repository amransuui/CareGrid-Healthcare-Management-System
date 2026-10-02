import type { Patient } from '@/types/clinical'
import type {
  FamilyDischargeStatus,
  FamilyPortalSnapshot,
} from '@/types/family'
import {
  BILLING_BY_PATIENT,
  EMPTY_BILLING,
  FAMILY_LINKS,
  NOTIFICATIONS_BY_PATIENT,
  UPCOMING_BY_PATIENT,
} from '@/data/mock/family'
import { buildCareTimeline } from '@/data/mock/clinical-events'
import { mockPatientService } from '@/services/mock/mock-patient-service'
import { mockVitalsService } from '@/services/mock/mock-vitals-service'
import type { FamilyService } from '@/services/family'

const SIMULATED_LATENCY_MS = 380
const delay = (ms = SIMULATED_LATENCY_MS) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

/** Derives the simplified discharge status from the patient record. */
function dischargeFor(patient: Patient): FamilyDischargeStatus {
  switch (patient.status) {
    case 'discharged':
      return {
        state: 'discharged',
        label: 'Discharged',
        description:
          'This admission is complete. The care team has shared follow-up instructions with the family.',
      }
    case 'stable':
      return {
        state: 'ready',
        label: 'Ready for discharge',
        description:
          'The care team is preparing discharge plans and confirming follow-up arrangements.',
        estimatedAt: addDaysIso(1),
      }
    case 'under_observation':
      return {
        state: 'in_progress',
        label: 'Under observation',
        description:
          'Still receiving hospital care. The team continues to monitor progress and will keep you informed.',
      }
    case 'critical':
      return {
        state: 'in_progress',
        label: 'Receiving intensive care',
        description:
          'Your family member is receiving intensive monitoring. The clinical team is available to speak with you.',
      }
  }
}

function addDaysIso(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  date.setHours(12, 0, 0, 0)
  return date.toISOString()
}

export const mockFamilyService: FamilyService = {
  async listLinkedPatients() {
    await delay(250)
    return FAMILY_LINKS
  },
  async overview(patientId) {
    await delay()
    const link = FAMILY_LINKS.find((entry) => entry.patientId === patientId)
    if (!link) return null

    const patient = await mockPatientService.get(patientId)
    if (!patient) return null

    const latestVitals = await mockVitalsService.getReading(patientId)
    const upcoming = UPCOMING_BY_PATIENT[patientId] ?? []

    const snapshot: FamilyPortalSnapshot = {
      patient,
      link,
      latestVitals,
      timeline: buildCareTimeline(patient),
      upcoming,
      billing: BILLING_BY_PATIENT[patientId] ?? {
        ...EMPTY_BILLING,
        totalCharged: 0,
        outstandingAmount: 0,
      },
      discharge: dischargeFor(patient),
      notifications: NOTIFICATIONS_BY_PATIENT[patientId] ?? [],
    }
    return snapshot
  },
}