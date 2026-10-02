import type {
  IschemiaCase,
  LivingDonor,
  MatchStatus,
  OrganMatch,
  WaitingListCandidate,
} from '@/types/organ'

/** Matches that can be submitted from a clinician-facing decision form. */
export type MatchDecision = 'accept' | 'decline'

/**
 * Organ care service contract. REST-style methods mirroring the future
 * Spring Boot endpoints; today they resolve from `@/data/mock/organ`.
 */
export interface OrganService {
  /** Active matching cases, newest first. */
  listMatches(): Promise<OrganMatch[]>
  /** A single match record, if found. */
  getMatch(matchId: string): Promise<OrganMatch | null>
  /** Record a transplant-team decision on an open match. */
  decideMatch(matchId: string, decision: MatchDecision, decidedBy: string): Promise<OrganMatch>
  /** National waiting list, ordered by position. */
  listWaitlist(): Promise<WaitingListCandidate[]>
  /** Simulated ischemia monitoring cases. */
  listIschemiaCases(): Promise<IschemiaCase[]>
  /** Living donor registry. */
  listDonors(): Promise<LivingDonor[]>
  /** Single living donor record. */
  getDonor(donorId: string): Promise<LivingDonor | null>
}

const DECIDABLE_STATUSES: MatchStatus[] = ['pending_review', 'active', 'offered']

/** Validates that a match is open for decisions, then applies the verdict. */
export function statusForDecision(status: MatchStatus, decision: MatchDecision): MatchStatus {
  if (!DECIDABLE_STATUSES.includes(status)) {
    throw new Error(`Match is ${status} and is not open for decisions.`)
  }
  if (decision === 'accept') return 'accepted'
  return 'declined'
}