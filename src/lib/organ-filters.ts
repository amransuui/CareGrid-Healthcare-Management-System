import type { MatchStatus, OrganType, UrgencyLevel } from '@/types/organ'

/**
 * Client-side filter state for the organ matching command center.
 * Mirrors the REST query params a Spring Boot endpoint would accept.
 */
export interface MatchFilterState {
  search: string
  organ: 'all' | OrganType
  bloodGroup: 'all' | string
  urgency: 'all' | UrgencyLevel
  status: 'all' | MatchStatus
  /** Minimum compatibility score; 0 means no floor. */
  minScore: number
}

export const EMPTY_MATCH_FILTERS: MatchFilterState = {
  search: '',
  organ: 'all',
  bloodGroup: 'all',
  urgency: 'all',
  status: 'all',
  minScore: 0,
}

export const COMPATIBILITY_FLOORS = [
  { value: 0, label: 'Any score' },
  { value: 60, label: '60% and above' },
  { value: 70, label: '70% and above' },
  { value: 80, label: '80% and above' },
  { value: 90, label: '90% and above' },
]