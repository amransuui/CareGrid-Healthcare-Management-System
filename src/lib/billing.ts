import type { ClaimStatus, Invoice, InvoiceStatus } from '@/types/billing'

/**
 * Billing arithmetic and workflow rules. Kept pure and separate from the mock
 * dataset so the same helpers work against a Spring Boot REST response.
 */

export function invoiceSubtotal(invoice: Invoice): number {
  return invoice.lines.reduce(
    (sum, line) => sum + line.quantity * line.unitPrice,
    0,
  )
}

/** Subtotal after discount, before any insurance contribution. */
export function invoiceGross(invoice: Invoice): number {
  return Math.max(0, invoiceSubtotal(invoice) - invoice.discount)
}

/** Amount the patient is responsible for after insurance coverage. */
export function invoicePayable(invoice: Invoice): number {
  return Math.max(0, invoiceGross(invoice) - invoice.insuranceCoveredAmount)
}

export function invoiceOutstanding(invoice: Invoice): number {
  return Math.max(0, invoicePayable(invoice) - invoice.paidAmount)
}

/** Insurance share of the gross invoice, 0–100. */
export function invoiceCoveragePercent(invoice: Invoice): number {
  const gross = invoiceGross(invoice)
  if (gross <= 0) return 0
  return Math.min(100, Math.round((invoice.insuranceCoveredAmount / gross) * 100))
}

export function invoiceLineTotal(quantity: number, unitPrice: number): number {
  return quantity * unitPrice
}

export function categoryTotal(invoice: Invoice, category: Invoice['lines'][number]['category']): number {
  return invoice.lines
    .filter((line) => line.category === category)
    .reduce((sum, line) => sum + invoiceLineTotal(line.quantity, line.unitPrice), 0)
}

/** Allowed demo status moves. Enforced by the mock service, not the UI. */
export const INVOICE_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  draft: ['pending', 'cancelled'],
  pending: ['partially_paid', 'paid', 'cancelled'],
  partially_paid: ['paid', 'cancelled'],
  paid: [],
  cancelled: [],
}

export const CLAIM_TRANSITIONS: Record<ClaimStatus, ClaimStatus[]> = {
  draft: ['submitted', 'rejected'],
  submitted: ['under_review', 'approved', 'rejected'],
  under_review: ['approved', 'rejected'],
  approved: ['paid'],
  rejected: ['draft'],
  paid: [],
}

/** Share of a claim the demo insurer has settled, 0–100. */
export function claimSettlementPercent(claim: {
  amount: number
  approvedAmount: number
}): number {
  if (claim.amount <= 0) return 0
  return Math.min(100, Math.round((claim.approvedAmount / claim.amount) * 100))
}
