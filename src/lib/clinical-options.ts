import { WARDS } from '@/data/mock/wards'

/** Ward display names — derived from the ward catalog, not duplicated. */
export const WARD_NAMES: string[] = WARDS.map((ward) => ward.name)

/** Readable labels for vitals metrics used by tables and charts. */
export const VITALS_METRIC_LABELS: Record<string, string> = {
  heartRate: 'Heart rate',
  systolic: 'Systolic',
  diastolic: 'Diastolic',
  temperature: 'Temperature',
  spo2: 'SpO₂',
  respiratoryRate: 'Respiratory rate',
}

export const VITALS_METRIC_UNITS: Record<string, string> = {
  heartRate: 'bpm',
  systolic: 'mmHg',
  diastolic: 'mmHg',
  temperature: '°C',
  spo2: '%',
  respiratoryRate: 'breaths/min',
}