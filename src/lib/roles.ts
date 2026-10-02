import type { UserRole } from '@/types/auth'

/**
 * Rendering-only role affordances. These gate which buttons/sections a demo
 * user sees; they are NOT an authorization mechanism — real RBAC arrives
 * with the Spring Boot backend.
 */

export function isClinician(role?: UserRole): boolean {
  return role === 'doctor' || role === 'nurse'
}

/** Caregiving roles — anyone a patient or family member considers "staff". */
export function isCareStaff(role?: UserRole): boolean {
  return isClinician(role)
}

/** Patient/family account — sees the simplified family portal, never staff controls. */
export function isPatientFamily(role?: UserRole): boolean {
  return role === 'patient_family'
}

/** Blood bank coordinator role — inventory, requests and SOS workflows. */
export function isBloodBankCoordinator(role?: UserRole): boolean {
  return role === 'blood_bank_coordinator'
}

/** Pharmacist role — dispensing and inventory management. */
export function isPharmacist(role?: UserRole): boolean {
  return role === 'pharmacist'
}

/** Billing officer role — invoices, payments, insurance and claims. */
export function isBillingOfficer(role?: UserRole): boolean {
  return role === 'billing_officer'
}

/** Any staff account. Patient/family accounts are the only non-staff role. */
export function isStaffRole(role?: UserRole): boolean {
  return Boolean(role) && !isPatientFamily(role)
}

/**
 * Can this role move an invoice or claim through its workflow? Billing actions
 * are limited to the billing office so a demo user cannot settle a bill from
 * the ward.
 */
export function canManageBilling(role?: UserRole): boolean {
  return isBillingOfficer(role)
}

/** Can this role release a patient, or only prepare the discharge paperwork? */
export function canCompleteDischarge(role?: UserRole): boolean {
  return isClinician(role)
}

/** Can this role prepare discharge paperwork and work the checklist? */
export function canCoordinateDischarge(role?: UserRole): boolean {
  return isStaffRole(role)
}

/**
 * Discharge checklists name the owning team in plain language ("Nurse",
 * "Billing officer"). This maps the signed-in role to the items it may close,
 * so a pharmacist cannot tick off a doctor's sign-off in the demo.
 */
const CHECKLIST_OWNER_ROLES: Record<string, UserRole> = {
  doctor: 'doctor',
  nurse: 'nurse',
  pharmacist: 'pharmacist',
  'billing officer': 'billing_officer',
}

export function canCloseChecklistItem(role: UserRole | undefined, ownerRole: string): boolean {
  if (!role) return false
  return CHECKLIST_OWNER_ROLES[ownerRole.trim().toLowerCase()] === role
}

/** Settings and profile areas are staff-only in this prototype. */
export function canManageOwnSettings(role?: UserRole): boolean {
  return isStaffRole(role)
}