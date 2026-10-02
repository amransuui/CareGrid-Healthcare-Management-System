import {
  BLOOD_DONORS,
  BLOOD_REQUESTS,
  SOS_CASES,
  buildBloodInventory,
} from '@/data/mock/blood'
import type {
  BloodInventoryItem,
  BloodRequest,
  SosCase,
} from '@/types/blood'
import type { BloodService } from '@/services/blood'

const SIMULATED_LATENCY_MS = 280
const delay = (ms = SIMULATED_LATENCY_MS) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

let inventory: BloodInventoryItem[] = buildBloodInventory()
let requests: BloodRequest[] = [...BLOOD_REQUESTS]
let sosCases: SosCase[] = [...SOS_CASES]

export const mockBloodService: BloodService = {
  async listInventory() {
    await delay()
    return [...inventory]
  },
  async listDonors() {
    await delay()
    return [...BLOOD_DONORS].sort(
      (a, b) => new Date(b.lastScreening).getTime() - new Date(a.lastScreening).getTime(),
    )
  },
  async getDonor(donorId) {
    await delay(120)
    return BLOOD_DONORS.find((donor) => donor.donorId === donorId) ?? null
  },
  async listRequests() {
    await delay()
    return [...requests].sort(
      (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime(),
    )
  },
  async updateRequestStatus(requestId, status) {
    await delay()
    const request = requests.find((entry) => entry.requestId === requestId)
    if (!request) throw new Error(`Unknown request ${requestId}`)
    request.status = status
    return { ...request }
  },
  async listSos() {
    await delay()
    return [...sosCases].sort(
      (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime(),
    )
  },
  async advanceSos(sosId, action) {
    await delay()
    const sos = sosCases.find((entry) => entry.sosId === sosId)
    if (!sos) throw new Error(`Unknown SOS case ${sosId}`)

    switch (action) {
      case 'start_broadcast': {
        if (sos.broadcastStatus === 'completed') {
          throw new Error('Broadcast already completed')
        }
        sos.broadcastStatus = 'broadcasting'
        sos.responseStatus = 'broadcasting'
        break
      }
      case 'mark_donor': {
        if (sos.unitsSecured < sos.unitsRequired) {
          sos.unitsSecured += 1
        }
        if (sos.unitsSecured >= sos.unitsRequired && sos.broadcastStatus === 'broadcasting') {
          sos.broadcastStatus = 'completed'
        }
        break
      }
      case 'mark_response': {
        if (sos.responseStatus !== 'broadcasting') {
          throw new Error('Start the broadcast before marking responses')
        }
        sos.responseStatus = 'received'
        break
      }
      case 'fulfill': {
        if (sos.unitsSecured <= 0) {
          throw new Error('No confirmed units to fulfil with')
        }
        sos.unitsSecured = sos.unitsRequired
        sos.responseStatus = 'fulfilled'
        sos.broadcastStatus = 'completed'
        break
      }
    }
    return { ...sos }
  },
}