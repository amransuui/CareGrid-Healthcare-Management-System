import type { User, UserRole } from '@/types/auth'

/**
 * Human-readable labels for the auth role select and account display.
 * Fictional demo user accounts for the frontend-only authentication flow.
 * These are NOT real accounts and are never persisted to any backend.
 */
export const roleLabels: Record<UserRole, string> = {
  doctor: 'Doctor',
  nurse: 'Nurse',
  blood_bank_coordinator: 'Blood Bank Coordinator',
  pharmacist: 'Pharmacist',
  billing_officer: 'Billing Officer',
  patient_family: 'Patient / Family',
}

export const DEFAULT_DEMO_USER_EMAIL = 'shahid.hasan@caregrid.io'

/** Shared demo password for every fictional account (demo access only). */
export const DEMO_PASSWORD = 'Caregrid@2026'

export const demoUsers: User[] = [
  {
    id: 'usr_doc_001',
    fullName: 'Dr. Shahid Hasan',
    email: 'shahid.hasan@caregrid.io',
    phone: '+8801712345601',
    role: 'doctor',
  },
  {
    id: 'usr_nur_001',
    fullName: 'Ayesha Malik',
    email: 'ayesha.malik@caregrid.io',
    phone: '+8801812345602',
    role: 'nurse',
  },
  {
    id: 'usr_bld_001',
    fullName: 'Fatima Noor',
    email: 'fatima.noor@caregrid.io',
    phone: '+8801912345603',
    role: 'blood_bank_coordinator',
  },
  {
    id: 'usr_phr_001',
    fullName: 'Imran Chowdhury',
    email: 'imran.chowdhury@caregrid.io',
    phone: '+8801612345604',
    role: 'pharmacist',
  },
  {
    id: 'usr_bil_001',
    fullName: 'Rana Khan',
    email: 'rana.khan@caregrid.io',
    phone: '+8801512345605',
    role: 'billing_officer',
  },
  {
    id: 'usr_fam_001',
    fullName: 'Tanvir Ahmed',
    email: 'tanvir.ahmed@caregrid.io',
    phone: '+8801312345606',
    role: 'patient_family',
  },
]