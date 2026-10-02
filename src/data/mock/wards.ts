import type { Bed, BedStatus, Ward, WardStats } from '@/types/clinical'

/** Fictional wards. `bedCount` must match the bed generator in the service. */
export const WARDS: Ward[] = [
  {
    id: 'general',
    name: 'General Ward',
    prefix: 'GEN',
    bedCount: 26,
    department: 'General Medicine',
    floor: '1st floor',
    type: 'General',
  },
  {
    id: 'icu',
    name: 'ICU',
    prefix: 'ICU',
    bedCount: 8,
    department: 'Intensive Care',
    floor: '2nd floor',
    type: 'Intensive care',
  },
  {
    id: 'emergency',
    name: 'Emergency',
    prefix: 'EMG',
    bedCount: 6,
    department: 'Emergency Medicine',
    floor: 'Ground floor',
    type: 'Emergency',
  },
  {
    id: 'cardiology',
    name: 'Cardiology',
    prefix: 'CAR',
    bedCount: 12,
    department: 'Cardiology',
    floor: '3rd floor',
    type: 'Specialist',
  },
  {
    id: 'neurology',
    name: 'Neurology',
    prefix: 'NEU',
    bedCount: 10,
    department: 'Neurology',
    floor: '3rd floor',
    type: 'Specialist',
  },
]

/** Ward name to canonical bed id prefix. */
export const WARD_PREFIXES: Record<string, string> = Object.fromEntries(
  WARDS.map((ward) => [ward.name, ward.prefix]),
)

/** Ward name to canonical ward id (used to address beds cross-service). */
export const WARD_ID_BY_NAME: Record<string, string> = Object.fromEntries(
  WARDS.map((ward) => [ward.name, ward.id]),
)

export function buildBedNumber(prefix: string, index: number): string {
  return `${prefix}-${100 + index}`
}

export function computeWardStats(beds: Bed[]): WardStats {
  const counts = beds.reduce(
    (acc, bed) => {
      acc[bed.status] += 1
      return acc
    },
    { available: 0, occupied: 0, cleaning: 0, reserved: 0 } as Omit<WardStats, 'total'>,
  )
  return { total: beds.length, ...counts }
}

export function minutesAgoIso(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString()
}

export function hoursAgoIso(hours: number): string {
  return new Date(Date.now() - hours * 3_600_000).toISOString()
}

/** Bed housekeeping modifier applied to empty beds for demo variety. */
export function demoEmptyBedStatus(index: number, wardBedCount: number): BedStatus {
  if ((index + wardBedCount) % 13 === 0) return 'cleaning'
  if ((index + wardBedCount) % 19 === 0) return 'reserved'
  return 'available'
}