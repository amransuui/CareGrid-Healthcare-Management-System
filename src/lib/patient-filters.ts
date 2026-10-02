export interface PatientFilterState {
  search: string
  status: 'all' | 'stable' | 'under_observation' | 'critical' | 'discharged'
  ward: 'all' | string
  department: 'all' | string
  bloodGroup: 'all' | string
}

export const EMPTY_PATIENT_FILTERS: PatientFilterState = {
  search: '',
  status: 'all',
  ward: 'all',
  department: 'all',
  bloodGroup: 'all',
}