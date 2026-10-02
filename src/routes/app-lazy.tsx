import { lazy } from 'react'
import { LoadingState } from '@/components/common/loading-state'

/**
 * Lazy route components for the authenticated section. Kept in their own
 * file so the route config stays clean and each page is code-split.
 */
export const DashboardPage = lazy(() =>
  import('@/pages/app/dashboard-page').then((module) => ({
    default: module.DashboardPage,
  })),
)
export const NotificationsPage = lazy(() =>
  import('@/pages/app/notifications-page').then((module) => ({
    default: module.NotificationsPage,
  })),
)
export const ModulePlaceholderPage = lazy(() =>
  import('@/pages/app/module-placeholder-page').then((module) => ({
    default: module.ModulePlaceholderPage,
  })),
)
export const PatientListPage = lazy(() =>
  import('@/pages/app/patients-page').then((module) => ({
    default: module.PatientListPage,
  })),
)
export const PatientDetailPage = lazy(() =>
  import('@/pages/app/patient-detail-page').then((module) => ({
    default: module.PatientDetailPage,
  })),
)
export const VitalsPage = lazy(() =>
  import('@/pages/app/vitals-page').then((module) => ({
    default: module.VitalsPage,
  })),
)
export const VitalsHistoryPage = lazy(() =>
  import('@/pages/app/vitals-history-page').then((module) => ({
    default: module.VitalsHistoryPage,
  })),
)
export const WardsPage = lazy(() =>
  import('@/pages/app/wards-page').then((module) => ({
    default: module.WardsPage,
  })),
)
export const FamilyPortalPage = lazy(() =>
  import('@/pages/app/family-portal-page').then((module) => ({
    default: module.FamilyPortalPage,
  })),
)
export const OrganMatchingPage = lazy(() =>
  import('@/pages/app/organ-matching-page').then((module) => ({
    default: module.OrganMatchingPage,
  })),
)
export const OrganWaitingListPage = lazy(() =>
  import('@/pages/app/organ-waiting-page').then((module) => ({
    default: module.OrganWaitingListPage,
  })),
)
export const OrganIschemiaPage = lazy(() =>
  import('@/pages/app/organ-ischemia-page').then((module) => ({
    default: module.OrganIschemiaPage,
  })),
)
export const OrganDonorsPage = lazy(() =>
  import('@/pages/app/organ-donors-page').then((module) => ({
    default: module.OrganDonorsPage,
  })),
)
export const BloodInventoryPage = lazy(() =>
  import('@/pages/app/blood-inventory-page').then((module) => ({
    default: module.BloodInventoryPage,
  })),
)
export const BloodDonorsPage = lazy(() =>
  import('@/pages/app/blood-donors-page').then((module) => ({
    default: module.BloodDonorsPage,
  })),
)
export const BloodRequestsPage = lazy(() =>
  import('@/pages/app/blood-requests-page').then((module) => ({
    default: module.BloodRequestsPage,
  })),
)
export const BloodSosPage = lazy(() =>
  import('@/pages/app/blood-sos-page').then((module) => ({
    default: module.BloodSosPage,
  })),
)
export const PharmacyPrescriptionsPage = lazy(() =>
  import('@/pages/app/pharmacy-prescriptions-page').then((module) => ({
    default: module.PharmacyPrescriptionsPage,
  })),
)
export const PharmacyPrescriptionDetailPage = lazy(() =>
  import('@/pages/app/pharmacy-prescription-detail-page').then((module) => ({
    default: module.PharmacyPrescriptionDetailPage,
  })),
)
export const PharmacyInventoryPage = lazy(() =>
  import('@/pages/app/pharmacy-inventory-page').then((module) => ({
    default: module.PharmacyInventoryPage,
  })),
)
export const PharmacyAlertsPage = lazy(() =>
  import('@/pages/app/pharmacy-alerts-page').then((module) => ({
    default: module.PharmacyAlertsPage,
  })),
)
export const PharmacyPage = lazy(() =>
  import('@/pages/app/pharmacy-page').then((module) => ({
    default: module.PharmacyPage,
  })),
)
export const BillingPage = lazy(() =>
  import('@/pages/app/billing-page').then((module) => ({
    default: module.BillingPage,
  })),
)
export const BillingInvoicesPage = lazy(() =>
  import('@/pages/app/billing-invoices-page').then((module) => ({
    default: module.BillingInvoicesPage,
  })),
)
export const BillingInvoiceDetailPage = lazy(() =>
  import('@/pages/app/billing-invoice-detail-page').then((module) => ({
    default: module.BillingInvoiceDetailPage,
  })),
)
export const BillingClaimsPage = lazy(() =>
  import('@/pages/app/billing-claims-page').then((module) => ({
    default: module.BillingClaimsPage,
  })),
)
export const BillingClaimDetailPage = lazy(() =>
  import('@/pages/app/billing-claim-detail-page').then((module) => ({
    default: module.BillingClaimDetailPage,
  })),
)
export const DischargePage = lazy(() =>
  import('@/pages/app/discharge-page').then((module) => ({
    default: module.DischargePage,
  })),
)
export const DischargeDetailPage = lazy(() =>
  import('@/pages/app/discharge-detail-page').then((module) => ({
    default: module.DischargeDetailPage,
  })),
)
export const SettingsPage = lazy(() =>
  import('@/pages/app/settings-page').then((module) => ({
    default: module.SettingsPage,
  })),
)

export function PageLoader() {
  return (
    <div className="mx-auto w-full max-w-[90rem] px-4 py-6 sm:px-6 lg:px-8">
      <LoadingState rows={8} />
    </div>
  )
}