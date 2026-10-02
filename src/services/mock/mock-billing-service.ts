import {
  BILLING_INVOICES,
  INSURANCE_CLAIMS,
  INSURANCE_PROVIDERS,
} from '@/data/mock/billing'
import {
  CLAIM_TRANSITIONS,
  INVOICE_TRANSITIONS,
  invoiceGross,
  invoiceOutstanding,
} from '@/lib/billing'
import type { BillingService } from '@/services/billing'
import type {
  ClaimStatus,
  InsuranceClaim,
  Invoice,
  InvoiceStatus,
} from '@/types/billing'
import { INVOICE_STATUSES } from '@/types/billing'

/**
 * In-memory billing implementation backed by the fictional seed dataset.
 * Mutations apply to module state only and reset on reload — this is a demo
 * ledger, never a real financial record.
 */

const invoices: Invoice[] = BILLING_INVOICES.map((invoice) => ({
  ...invoice,
  lines: invoice.lines.map((entry) => ({ ...entry })),
}))

const claims: InsuranceClaim[] = INSURANCE_CLAIMS.map((claim) => ({
  ...claim,
  history: claim.history.map((event) => ({ ...event })),
}))

const nowIso = (): string => new Date().toISOString()

function startOfToday(): number {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

export const mockBillingService: BillingService = {
  async listInvoices() {
    return [...invoices].sort((a, b) => b.issuedAt.localeCompare(a.issuedAt))
  },

  async getInvoice(invoiceId) {
    const invoice = invoices.find((entry) => entry.invoiceId === invoiceId)
    return invoice ? { ...invoice, lines: invoice.lines.map((l) => ({ ...l })) } : null
  },

  async updateInvoiceStatus(invoiceId, status, actor) {
    const invoice = invoices.find((entry) => entry.invoiceId === invoiceId)
    if (!invoice) throw new Error('Invoice not found.')
    const allowed = INVOICE_TRANSITIONS[invoice.status]
    if (!allowed.includes(status)) {
      throw new Error(
        `Invoice ${invoiceId} is ${invoice.status.replace('_', ' ')} and cannot move to ${status.replace('_', ' ')}.`,
      )
    }
    if (status === 'paid' && invoiceOutstanding(invoice) > 0) {
      throw new Error('Record the outstanding amount before marking this invoice paid.')
    }
    if (status === 'partially_paid' && invoice.paidAmount <= 0) {
      throw new Error('Record a payment receipt before marking this invoice partially paid.')
    }
    const updated: Invoice = { ...invoice, status, preparedBy: invoice.preparedBy || actor }
    invoices.splice(invoices.indexOf(invoice), 1, updated)
    return updated
  },

  async getSummary() {
    const today = startOfToday()
    const openStatuses: InvoiceStatus[] = ['draft', 'pending', 'partially_paid']
    const byStatus = INVOICE_STATUSES.reduce(
      (acc, status) => {
        acc[status] = invoices.filter((invoice) => invoice.status === status).length
        return acc
      },
      {} as Record<InvoiceStatus, number>,
    )

    return {
      totalOutstanding: invoices
        .filter((invoice) => ['pending', 'partially_paid', 'paid'].includes(invoice.status))
        .reduce((sum, invoice) => sum + invoiceOutstanding(invoice), 0),
      paidToday: invoices
        .filter((invoice) => new Date(invoice.issuedAt).getTime() >= today)
        .reduce((sum, invoice) => sum + invoice.paidAmount, 0),
      pendingClaims: claims.filter(
        (claim) =>
          claim.status === 'submitted' ||
          claim.status === 'under_review' ||
          claim.status === 'approved',
      ).length,
      openInvoices: invoices.filter((invoice) => openStatuses.includes(invoice.status)).length,
      billedThisMonth: invoices
        .filter((invoice) => invoice.status !== 'cancelled')
        .reduce((sum, invoice) => sum + invoiceGross(invoice), 0),
      approvedThisMonth: claims
        .filter((claim) => claim.status === 'approved' || claim.status === 'paid')
        .reduce((sum, claim) => sum + claim.approvedAmount, 0),
      rejectedThisMonth: claims.filter((claim) => claim.status === 'rejected').length,
      byStatus,
    }
  },

  async listProviders() {
    return INSURANCE_PROVIDERS.map((provider) => ({ ...provider }))
  },

  async listClaims() {
    return [...claims].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  },

  async getClaim(claimId) {
    const claim = claims.find((entry) => entry.claimId === claimId)
    return claim ? { ...claim, history: claim.history.map((event) => ({ ...event })) } : null
  },

  async updateClaimStatus(claimId, status, note, actor) {
    const claim = claims.find((entry) => entry.claimId === claimId)
    if (!claim) throw new Error('Claim not found.')
    const allowed = CLAIM_TRANSITIONS[claim.status]
    if (!allowed.includes(status)) {
      throw new Error(
        `Claim ${claimId} is ${status.replace('_', ' ')} — that transition is not available.`,
      )
    }

    const updated: InsuranceClaim = {
      ...claim,
      status,
      updatedAt: nowIso(),
      approvedAmount: status === 'approved' ? claim.amount : claim.approvedAmount,
      rejectionReason: status === 'rejected' ? note : undefined,
      history: [
        ...claim.history,
        { at: nowIso(), status: status as ClaimStatus, note, actor },
      ],
    }
    claims.splice(claims.indexOf(claim), 1, updated)
    return updated
  },
}
