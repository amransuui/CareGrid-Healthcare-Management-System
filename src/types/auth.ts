/**
 * Auth domain types. Kept free of UI and mock concerns so the Spring Boot
 * REST client can satisfy the same contracts later.
 */

export const USER_ROLES = [
  'doctor',
  'nurse',
  'blood_bank_coordinator',
  'pharmacist',
  'billing_officer',
  'patient_family',
] as const

export type UserRole = (typeof USER_ROLES)[number]

export interface User {
  id: string
  fullName: string
  email: string
  phone?: string
  role: UserRole
}

/** Lightweight demo session for the frontend-only auth flow. */
export interface AuthSession {
  token: string
  user: User
  issuedAt: string
  expiresAt: string
  remember: boolean
}

export interface LoginCredentials {
  email: string
  password: string
  remember: boolean
}

export interface RegisterData {
  fullName: string
  email: string
  phone: string
  role: UserRole
  password: string
}