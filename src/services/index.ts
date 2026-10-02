/**
 * Service abstraction layer.
 *
 * Every feature reads/writes data through a service here. Services expose
 * REST-style methods (list / get / create / update / delete) and currently
 * resolve from realistic mock data. The Spring Boot swap-in only replaces the
 * implementation of each method with an HTTP client — the interface stays.
 *
 * Wiring is intentionally one line per domain: swap the imported mock for a
 * REST client and no component changes.
 */
export { ServiceError } from '@/services/service-error'
export {
  AuthServiceError,
  isAuthServiceError,
} from '@/services/auth'
export type { AuthService, AuthErrorCode } from '@/services/auth'
export type {
  DashboardService,
  DashboardOverview,
  ActivityEvent,
} from '@/services/dashboard'
export type { PatientService } from '@/services/patients'
export type { VitalsService } from '@/services/vitals'
export type { WardService, WardSummary } from '@/services/wards'
export type { OrganService, MatchDecision } from '@/services/organ'
export type { BloodService } from '@/services/blood'
export type { PharmacyService } from '@/services/pharmacy'
export type { FamilyService } from '@/services/family'
export type { BillingService } from '@/services/billing'
export type { DischargeService } from '@/services/discharge'
export type { NotificationService } from '@/services/notifications'
export type { SettingsService } from '@/services/settings'

import { mockAuthService } from '@/services/mock/mock-auth'
import type { AuthService } from '@/services/auth'
import { mockDashboardService } from '@/services/mock/mock-dashboard'
import type { DashboardService } from '@/services/dashboard'
import { mockPatientService } from '@/services/mock/mock-patient-service'
import type { PatientService } from '@/services/patients'
import { mockVitalsService } from '@/services/mock/mock-vitals-service'
import type { VitalsService } from '@/services/vitals'
import { mockWardService } from '@/services/mock/mock-ward-service'
import type { WardService } from '@/services/wards'
import { mockOrganService } from '@/services/mock/mock-organ-service'
import type { OrganService } from '@/services/organ'
import { mockBloodService } from '@/services/mock/mock-blood-service'
import type { BloodService } from '@/services/blood'
import { mockPharmacyService } from '@/services/mock/mock-pharmacy-service'
import type { PharmacyService } from '@/services/pharmacy'
import { mockFamilyService } from '@/services/mock/mock-family-service'
import type { FamilyService } from '@/services/family'
import { mockBillingService } from '@/services/mock/mock-billing-service'
import type { BillingService } from '@/services/billing'
import { mockDischargeService } from '@/services/mock/mock-discharge-service'
import type { DischargeService } from '@/services/discharge'
import { mockNotificationService } from '@/services/mock/mock-notification-service'
import type { NotificationService } from '@/services/notifications'
import { mockSettingsService } from '@/services/mock/mock-settings-service'
import type { SettingsService } from '@/services/settings'

export const authService: AuthService = mockAuthService

export const dashboardService: DashboardService = mockDashboardService

export const patientService: PatientService = mockPatientService

export const vitalsService: VitalsService = mockVitalsService

export const wardService: WardService = mockWardService

export const organService: OrganService = mockOrganService

export const bloodService: BloodService = mockBloodService

export const pharmacyService: PharmacyService = mockPharmacyService

export const familyService: FamilyService = mockFamilyService

export const notificationService: NotificationService = mockNotificationService

export const billingService: BillingService = mockBillingService

export const dischargeService: DischargeService = mockDischargeService

export const settingsService: SettingsService = mockSettingsService
