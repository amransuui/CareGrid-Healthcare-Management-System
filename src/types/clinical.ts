/**
 * Clinical domain types: patients, vitals, wards/beds and care timeline.
 * Kept free of UI and mock concerns so Spring Boot REST clients can satisfy
 * the same contracts later.
 */

export const PATIENT_STATUSES = [
  'stable',
  'under_observation',
  'critical',
  'discharged',
] as const

export type PatientStatus = (typeof PATIENT_STATUSES)[number]

export const GENDERS = ['male', 'female', 'other'] as const
export type Gender = (typeof GENDERS)[number]

export const ADMISSION_TYPES = [
  'emergency',
  'elective',
  'transfer',
  'scheduled',
  'day_care',
] as const

export type AdmissionType = (typeof ADMISSION_TYPES)[number]

export const MEDICATION_STATUSES = ['active', 'on_hold', 'completed'] as const
export type MedicationStatus = (typeof MEDICATION_STATUSES)[number]

export interface PatientMedication {
  name: string
  dosage: string
  frequency: string
  route: string
  status: MedicationStatus
}

export interface Patient {
  patientId: string
  fullName: string
  age: number
  gender: Gender
  bloodGroup: string
  dateOfBirth: string
  phone: string
  emergencyContact: string
  admissionDate: string
  department: string
  ward: string
  bed: string
  attendingDoctor: string
  assignedNurse: string
  diagnosis: string
  status: PatientStatus
  allergies: string[]
  medications: PatientMedication[]
  admissionType: AdmissionType
  /** Free-text clinical summary recorded by the care team. */
  notes?: string
  lastUpdated: string
}

export const VITALS_METRICS = [
  'heartRate',
  'systolic',
  'diastolic',
  'temperature',
  'spo2',
  'respiratoryRate',
] as const

export type VitalsMetric = (typeof VITALS_METRICS)[number]

export interface VitalsReading {
  id: string
  patientId: string
  recordedAt: string
  heartRate: number
  systolic: number
  diastolic: number
  temperature: number
  spo2: number
  respiratoryRate: number
  notes?: string
  recordedBy: string
}

export const VITALS_LEVELS = ['steady', 'watch', 'critical'] as const
export type VitalsLevel = (typeof VITALS_LEVELS)[number]

export interface VitalsFlag {
  level: VitalsLevel
  label: string
}

/** Single timestamped point used by the vitals time-series charts. */
export interface VitalsPoint {
  t: number
  label: string
  heartRate: number
  systolic: number
  diastolic: number
  temperature: number
  spo2: number
  respiratoryRate: number
}

export const BED_STATUSES = ['available', 'occupied', 'cleaning', 'reserved'] as const
export type BedStatus = (typeof BED_STATUSES)[number]

export interface Ward {
  id: string
  name: string
  /** Room/bed prefix, e.g. `GEN` for the General Ward. */
  prefix: string
  bedCount: number
  /** Owning clinical department. */
  department: string
  /** Facility floor the ward is located on. */
  floor: string
  /** Care level / ward classification. */
  type: string
}

export interface Bed {
  id: string
  number: string
  ward: string
  status: BedStatus
  patientId?: string
  lastCleaned?: string
  lastUpdated: string
}

export interface PendingAdmission {
  patientId: string
  fullName: string
  admissionDate: string
  attendingDoctor: string
  assignedNurse: string
}

export interface WardStats {
  total: number
  occupied: number
  available: number
  cleaning: number
  reserved: number
}

export const CARE_EVENT_STATUSES = ['completed', 'in_progress', 'pending', 'info'] as const
export type CareEventStatus = (typeof CARE_EVENT_STATUSES)[number]

export interface CareTimelineEvent {
  id: string
  patientId: string
  timestamp: string
  event: string
  department: string
  author: string
  authorRole: string
  status: CareEventStatus
  statusLabel: string
}

/** Patient creation payload. `patientId` is optional — service assigns it. */
export interface NewPatientInput {
  patientId?: string
  fullName: string
  dateOfBirth: string
  gender: Gender
  bloodGroup: string
  phone: string
  emergencyContact: string
  department: string
  ward: string
  bed: string
  attendingDoctor: string
  assignedNurse: string
  admissionType: AdmissionType
  diagnosis: string
  allergies: string[]
}

export type PatientUpdateInput = Partial<NewPatientInput> & { patientId: string }

/** Vitals recording payload captured through the Record Vitals form. */
export interface RecordVitalsInput {
  patientId: string
  heartRate: number
  systolic: number
  diastolic: number
  temperature: number
  spo2: number
  respiratoryRate: number
  notes?: string
  recordedBy: string
}