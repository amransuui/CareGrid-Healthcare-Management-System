import { DISCHARGE_CASES } from '@/data/mock/discharge'
import { dischargeBlockers, openRequiredItems } from '@/lib/discharge'
import type { DischargeCase, DocumentationStatus } from '@/types/discharge'
import type { DischargeService } from '@/services/discharge'

/**
 * In-memory discharge implementation backed by the fictional seed dataset.
 * Checklist edits and status moves are demo coordination only: nothing here
 * authorises a patient to leave the facility.
 */

const cases: DischargeCase[] = DISCHARGE_CASES.map((entry) => ({
  ...entry,
  diagnoses: [...entry.diagnoses],
  procedures: entry.procedures.map((procedure) => ({ ...procedure })),
  medications: entry.medications.map((medication) => ({ ...medication })),
  followUps: entry.followUps.map((followUp) => ({ ...followUp })),
  checklist: entry.checklist.map((item) => ({ ...item })),
  pendingItems: [...entry.pendingItems],
  billing: { ...entry.billing },
  vitalsAtDischarge: { ...entry.vitalsAtDischarge },
}))

const nowIso = (): string => new Date().toISOString()

/** Deep copy so callers can never mutate the in-memory store. */
function cloneCase(entry: DischargeCase): DischargeCase {
  return {
    ...entry,
    diagnoses: [...entry.diagnoses],
    procedures: entry.procedures.map((item) => ({ ...item })),
    medications: entry.medications.map((item) => ({ ...item })),
    followUps: entry.followUps.map((item) => ({ ...item })),
    checklist: entry.checklist.map((item) => ({ ...item })),
    pendingItems: [...entry.pendingItems],
    billing: { ...entry.billing },
    vitalsAtDischarge: { ...entry.vitalsAtDischarge },
  }
}

function requireCase(patientId: string): DischargeCase {
  const entry = cases.find((item) => item.patientId === patientId)
  if (!entry) throw new Error('Discharge record not found.')
  return entry
}

/**
 * Swaps a mutated draft back into the in-memory list. The draft is a new
 * object, so it is matched on the stable business key rather than identity.
 */
function replace(updated: DischargeCase): DischargeCase {
  const index = cases.findIndex((item) => item.patientId === updated.patientId)
  if (index === -1) throw new Error('Discharge record not found.')
  cases[index] = updated
  return updated
}

/** Documentation is complete once every required checklist item is closed. */
function resolveDocumentationStatus(entry: DischargeCase): DocumentationStatus {
  if (openRequiredItems(entry.checklist).length > 0) {
    return entry.documentationStatus === 'complete' ? 'in_progress' : entry.documentationStatus
  }
  return 'complete'
}

export const mockDischargeService: DischargeService = {
  async listCases() {
    return cases
      .map(cloneCase)
      .sort((a, b) => a.plannedDischargeAt.localeCompare(b.plannedDischargeAt))
  },

  async getCase(patientId) {
    const entry = cases.find((item) => item.patientId === patientId)
    return entry ? cloneCase(entry) : null
  },

  async getSummary() {
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    const today = startOfToday.getTime()

    return {
      pending: cases.filter((entry) => entry.dischargeStatus === 'pending').length,
      ready: cases.filter((entry) => entry.dischargeStatus === 'ready').length,
      dischargedToday: cases.filter(
        (entry) =>
          entry.dischargedAt && new Date(entry.dischargedAt).getTime() >= today,
      ).length,
      documentationPending: cases.filter(
        (entry) => entry.documentationStatus !== 'complete',
      ).length,
      onHold: cases.filter((entry) => entry.dischargeStatus === 'blocked').length,
      requiredOutstanding: cases.reduce(
        (sum, entry) => sum + entry.billing.outstandingAmount,
        0,
      ),
    }
  },

  async setChecklistItem(patientId, itemId, completed, actor) {
    const entry = requireCase(patientId)
    if (entry.dischargeStatus === 'discharged') {
      throw new Error('This admission is already discharged — reopen coordination first.')
    }
    const checklist = entry.checklist.map((item) =>
      item.id === itemId
        ? {
            ...item,
            completed,
            completedBy: completed ? actor : undefined,
            completedAt: completed ? nowIso() : undefined,
          }
        : { ...item },
    )
    const draft = { ...entry, checklist }
    return replace({ ...draft, documentationStatus: resolveDocumentationStatus(draft) })
  },

  async setDocumentationStatus(patientId, status) {
    const entry = requireCase(patientId)
    if (entry.dischargeStatus === 'discharged') {
      throw new Error('Documentation cannot change after discharge.')
    }
    return replace({ ...entry, documentationStatus: status })
  },

  async markDischarged(patientId, actor) {
    const entry = requireCase(patientId)
    if (entry.dischargeStatus === 'discharged') {
      throw new Error('This admission is already marked as discharged.')
    }
    const blockers = dischargeBlockers(entry)
    if (blockers.length) {
      throw new Error(blockers[0])
    }
    void actor
    return replace({
      ...entry,
      dischargeStatus: 'discharged',
      dischargedAt: nowIso(),
      documentationStatus: 'complete',
    })
  },

  async revertToPending(patientId, actor) {
    const entry = requireCase(patientId)
    if (entry.dischargeStatus !== 'discharged') {
      throw new Error('Only a discharged admission can be reopened.')
    }
    const { dischargedAt: _dischargedAt, ...rest } = entry
    void actor
    return replace({ ...rest, dischargeStatus: 'pending' })
  },
}
