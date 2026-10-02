import type {
  BillingSummary,
  ClaimStatus,
  InsuranceClaim,
  InsuranceProvider,
  Invoice,
  InvoiceStatus,
} from '@/types/billing'

/**
 * Billing, insurance and claims service contract. The methods mirror the
 * REST endpoints the Spring Boot backend will expose (list / get / create /
 * update), so swapping the mock for an HTTP client is mechanical.
 */
export interface BillingService {
  listInvoices(): Promise<Invoice[]>
  getInvoice(invoiceId: string): Promise<Invoice | null>
  updateInvoiceStatus(
    invoiceId: string,
    status: InvoiceStatus,
    actor: string,
  ): Promise<Invoice>
  getSummary(): Promise<BillingSummary>
  listProviders(): Promise<InsuranceProvider[]>
  listClaims(): Promise<InsuranceClaim[]>
  getClaim(claimId: string): Promise<InsuranceClaim | null>
  updateClaimStatus(
    claimId: string,
    status: ClaimStatus,
    note: string,
    actor: string,
  ): Promise<InsuranceClaim>
}
