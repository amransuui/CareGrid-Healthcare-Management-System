import type { BloodDonor, BloodInventoryItem, DonorStatus, StockStatus } from '@/types/blood'
import { DONATION_INTERVAL_DAYS } from '@/data/mock/blood'

/**
 * Blood bank business logic used by the frontend demo. These rules (like the
 * 56-day donation interval) are interface rules only — the real donor
 * eligibility engine will live in the Spring Boot backend.
 */

const EXPIRING_WINDOW_DAYS = 7
const DAY_MS = 86_400_000

export interface DonorEligibility {
  status: DonorStatus
  daysSinceDonation: number
  /** Days until the donation interval allows a new donation. 0 when allowed. */
  holdingDaysLeft: number
}

/** Days since the donor's last donation, or null when they never donated. */
export function daysSinceDonation(donor: BloodDonor, now = Date.now()): number | null {
  if (!donor.lastDonation) return null
  return Math.max(0, Math.floor((now - new Date(donor.lastDonation).getTime()) / DAY_MS))
}

/**
 * Evaluate the 56-day demo interval. Explicit `deferred`/`ineligible`
 * reasons always win; otherwise the interval decides eligibility.
 */
export function computeDonorEligibility(
  donor: BloodDonor,
  now = Date.now(),
): DonorEligibility {
  const since = daysSinceDonation(donor, now)
  const holdingDaysLeft = since === null ? 0 : Math.max(0, DONATION_INTERVAL_DAYS - since)

  if (donor.status === 'ineligible' || donor.status === 'deferred') {
    return { status: donor.status, daysSinceDonation: since ?? 0, holdingDaysLeft: 0 }
  }
  if (since !== null && since < DONATION_INTERVAL_DAYS) {
    return { status: 'donated_recently', daysSinceDonation: since, holdingDaysLeft }
  }
  return { status: 'eligible', daysSinceDonation: since ?? 0, holdingDaysLeft: 0 }
}

/** Demo per-unit stock band used for colouring the inventory matrix. */
export function stockStatusForUnits(units: number): StockStatus {
  if (units <= 3) return 'critical'
  if (units <= 6) return 'low'
  return 'safe'
}

export function daysUntilExpiry(item: BloodInventoryItem, now = Date.now()): number {
  return Math.max(0, Math.floor((new Date(item.expiryDate).getTime() - now) / DAY_MS))
}

/** True when the item expires within the demo "expiring soon" window. */
export function isExpiringSoon(item: BloodInventoryItem, now = Date.now()): boolean {
  return daysUntilExpiry(item, now) <= EXPIRING_WINDOW_DAYS
}

export const EXPIRING_WINDOW_LABEL = `${EXPIRING_WINDOW_DAYS} days`