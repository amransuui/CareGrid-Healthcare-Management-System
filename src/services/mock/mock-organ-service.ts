import {
  ISCHEMIA_CASES,
  LIVING_DONORS,
  MATCHES,
  WAITLIST,
} from '@/data/mock/organ'
import type { IschemiaCase, LivingDonor, OrganMatch } from '@/types/organ'
import {
  type MatchDecision,
  type OrganService,
  statusForDecision,
} from '@/services/organ'

const SIMULATED_LATENCY_MS = 280
const delay = (ms = SIMULATED_LATENCY_MS) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

let matches: OrganMatch[] = [...MATCHES]

export const mockOrganService: OrganService = {
  async listMatches() {
    await delay()
    return [...matches].sort(
      (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime(),
    )
  },
  async getMatch(matchId) {
    await delay(120)
    return matches.find((match) => match.matchId === matchId) ?? null
  },
  async decideMatch(matchId, decision: MatchDecision, decidedBy) {
    await delay()
    const match = matches.find((entry) => entry.matchId === matchId)
    if (!match) throw new Error(`Unknown match ${matchId}`)
    match.status = statusForDecision(match.status, decision)
    match.lastUpdated = new Date().toISOString()
    match.clinicalNotes += `\n[${new Date().toLocaleString('en-GB')}] ${decision === 'accept' ? 'Accepted' : 'Declined'} by ${decidedBy}.`
    return { ...match }
  },
  async listWaitlist() {
    await delay()
    return [...WAITLIST]
  },
  async listIschemiaCases(): Promise<IschemiaCase[]> {
    await delay()
    return [...ISCHEMIA_CASES]
  },
  async listDonors(): Promise<LivingDonor[]> {
    await delay()
    return [...LIVING_DONORS]
  },
  async getDonor(donorId) {
    await delay(120)
    return LIVING_DONORS.find((donor) => donor.donorId === donorId) ?? null
  },
}