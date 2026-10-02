import type { Patient, VitalsPoint, VitalsReading } from '@/types/clinical'
import { findPatientSeed, patientsSeed, NURSE_OPTIONS } from '@/data/mock/patients'

/**
 * Deterministic vitals generator. Produces realistic-looking but fictional
 * readings per patient. Charts carry the demo disclaimer — none of this is
 * real clinical data.
 */

function hashOf(input: string): number {
  let value = 0
  for (let index = 0; index < input.length; index += 1) {
    value = (value * 31 + input.charCodeAt(index)) | 0
  }
  return Math.abs(value)
}

function between(seedInput: string, min: number, max: number): number {
  const fraction = (hashOf(seedInput) % 1000) / 1000
  return min + (max - min) * fraction
}

function roundInt(input: string, min: number, max: number): number {
  return Math.round(between(input, min, max))
}

function roundOne(input: string, min: number, max: number): number {
  return Math.round(between(input, min, max) * 10) / 10
}

interface VitalsProfile {
  heartRate: number
  systolic: number
  diastolic: number
  temperature: number
  spo2: number
  respiratoryRate: number
}

function profileFor(patient: Patient): VitalsProfile {
  const salt = patient.patientId
  switch (patient.status) {
    case 'critical':
      return {
        heartRate: roundInt(`${salt}:hr`, 98, 118),
        systolic: roundInt(`${salt}:sys`, 88, 102),
        diastolic: roundInt(`${salt}:dia`, 52, 64),
        temperature: roundOne(`${salt}:temp`, 38.1, 39.4),
        spo2: roundInt(`${salt}:spo2`, 88, 92),
        respiratoryRate: roundInt(`${salt}:rr`, 22, 27),
      }
    case 'under_observation':
      return {
        heartRate: roundInt(`${salt}:hr`, 86, 106),
        systolic: roundInt(`${salt}:sys`, 98, 118),
        diastolic: roundInt(`${salt}:dia`, 60, 76),
        temperature: roundOne(`${salt}:temp`, 37.4, 38.4),
        spo2: roundInt(`${salt}:spo2`, 92, 95),
        respiratoryRate: roundInt(`${salt}:rr`, 17, 22),
      }
    default:
      return {
        heartRate: roundInt(`${salt}:hr`, 64, 90),
        systolic: roundInt(`${salt}:sys`, 104, 130),
        diastolic: roundInt(`${salt}:dia`, 66, 84),
        temperature: roundOne(`${salt}:temp`, 36.5, 37.7),
        spo2: roundInt(`${salt}:spo2`, 96, 99),
        respiratoryRate: roundInt(`${salt}:rr`, 14, 18),
      }
  }
}

function recordedByFor(patientId: string): string {
  return NURSE_OPTIONS[hashOf(patientId) % NURSE_OPTIONS.length]
}

/** Latest vitals for every non-discharged patient, recorded minutes ago. */
export function generateLatestReadings(): VitalsReading[] {
  const now = Date.now()
  return patientsSeed
    .filter((patient) => patient.status !== 'discharged')
    .map((patient) => {
      const profile = profileFor(patient)
      const minutesAgo = Math.round(between(`${patient.patientId}:when`, 4, 180))
      return {
        id: `VR-${patient.patientId}`,
        patientId: patient.patientId,
        recordedAt: new Date(now - minutesAgo * 60_000).toISOString(),
        ...profile,
        recordedBy: recordedByFor(patient.patientId),
        notes: undefined,
      }
    })
}

/**
 * Time-series preview for the vitals charts: `days` of history sampled every
 * few hours ending at the patient's latest reading, so recordings stay
 * visible regardless of the selected range.
 */
export function buildVitalsSeries(
  patient: Patient,
  latest: VitalsReading,
  days = 7,
): VitalsPoint[] {
  const base = profileFor(patient)
  const points: VitalsPoint[] = []
  const sampleCount = 56
  const windowMs = days * 24 * 3_600_000
  const samplingMs = windowMs / sampleCount
  const latestAt = new Date(latest.recordedAt).getTime()

  const wave = (offsetIndex: number, salt: string) =>
    Math.sin(offsetIndex / 6 + hashOf(salt) % 7) * 0.6

  for (let index = sampleCount - 1; index >= 0; index -= 1) {
    const t = latestAt - index * samplingMs
    const drift = (sampleCount - 1 - index) / (sampleCount - 1)
    const heartRate = Math.round(
      base.heartRate - (base.heartRate - latest.heartRate) * drift + wave(index, 'hr'),
    )
    const systolic = Math.round(
      base.systolic - (base.systolic - latest.systolic) * drift + wave(index, 'sys'),
    )
    const diastolic = Math.round(
      base.diastolic - (base.diastolic - latest.diastolic) * drift + wave(index, 'dia'),
    )
    const temperature =
      Math.round(
        (base.temperature - (base.temperature - latest.temperature) * drift +
          wave(index, 'temp') * 0.1) * 10,
      ) / 10
    const spo2 = Math.round(
      Math.min(99, Math.max(85, base.spo2 - (base.spo2 - latest.spo2) * drift + wave(index, 'spo2'))),
    )
    const respiratoryRate = Math.round(
      base.respiratoryRate -
        (base.respiratoryRate - latest.respiratoryRate) * drift +
        wave(index, 'rr'),
    )

    points.push({
      t,
      label: new Date(t).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
      heartRate,
      systolic,
      diastolic,
      temperature,
      spo2,
      respiratoryRate,
    })
  }

  points.push({
    t: latestAt,
    label: new Date(latestAt).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }),
    heartRate: latest.heartRate,
    systolic: latest.systolic,
    diastolic: latest.diastolic,
    temperature: latest.temperature,
    spo2: latest.spo2,
    respiratoryRate: latest.respiratoryRate,
  })

  return points
}

export function patientForReading(reading: VitalsReading): Patient | undefined {
  return findPatientSeed(reading.patientId)
}