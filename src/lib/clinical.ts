import type { VitalsFlag } from '@/types/clinical'

/**
 * Clinical helpers shared across pages. Thresholds are intentionally simple,
 * flag-only ranges used to render the demo — see `VITALS_DISCLAIMER`.
 */

/** Shown wherever vitals are presented or charted. Never implied as medical advice. */
export const VITALS_DISCLAIMER =
  'Demo data for interface demonstration. Values should not be used for clinical decisions.'

export function computeAge(dateOfBirth: string): number {
  const birth = new Date(dateOfBirth)
  if (Number.isNaN(birth.getTime())) return 0
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const monthDiff = now.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age -= 1
  }
  return Math.max(age, 0)
}

export function formatDateTime(input: string | Date): string {
  const date = typeof input === 'string' ? new Date(input) : input
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDate(input: string | Date): string {
  const date = typeof input === 'string' ? new Date(input) : input
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Demo-only derangement flag for a vitals reading. Compares each metric
 * against a coarse reference band and reports the most urgent level.
 * Explicitly demo — see `VITALS_DISCLAIMER`.
 */
export function vitalsLevel(reading: {
  heartRate: number
  systolic: number
  diastolic: number
  temperature: number
  spo2: number
  respiratoryRate: number
}): VitalsFlag {
  const flags: Array<[VitalsFlag['level'], string]> = []

  if (reading.heartRate < 55 || reading.heartRate > 110) {
    flags.push(heartRateFlag(reading.heartRate))
  }
  if (reading.systolic < 90 || reading.systolic > 160) {
    flags.push(
      reading.systolic < 90
        ? ['critical', 'Blood pressure low']
        : ['watch', 'Blood pressure high'],
    )
  }
  if (reading.diastolic < 55 || reading.diastolic > 100) {
    flags.push(
      reading.diastolic < 55
        ? ['critical', 'Diastolic low']
        : ['watch', 'Diastolic high'],
    )
  }
  if (reading.temperature < 35.5 || reading.temperature > 38.5) {
    flags.push(
      reading.temperature > 38.5
        ? ['watch', 'Fever range']
        : ['watch', 'Temperature low'],
    )
  }
  if (reading.spo2 < 92) {
    flags.push(['critical', 'SpO2 low'])
  } else if (reading.spo2 < 95) {
    flags.push(['watch', 'SpO2 borderline'])
  }
  if (reading.respiratoryRate < 10 || reading.respiratoryRate > 24) {
    flags.push(['watch', 'Respiratory rate'])
  }

  if (flags.length === 0) {
    return { level: 'steady', label: 'Within typical range' }
  }
  const worst = flags.sort(
    (a, b) => levelRank[a[0]] - levelRank[b[0]],
  )[0]
  return { level: worst[0], label: worst[1] }
}

const levelRank: Record<VitalsFlag['level'], number> = {
  steady: 0,
  watch: 1,
  critical: 2,
}

function heartRateFlag(heartRate: number): [VitalsFlag['level'], string] {
  if (heartRate > 120) return ['critical', 'Heart rate high']
  if (heartRate > 110) return ['watch', 'Heart rate elevated']
  if (heartRate < 45) return ['critical', 'Heart rate low']
  return ['watch', 'Heart rate borderline']
}