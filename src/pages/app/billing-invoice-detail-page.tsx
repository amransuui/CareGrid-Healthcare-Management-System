import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CheckCheck, Download, Lock, Printer, ShieldCheck, XCircle } from 'lucide-react'
import { Container } from '@/components/common/container'
import { DemoNotice } from '@/components/common/demo-notice'
import { DetailList } from '@/components/common/detail-list'
import { ErrorState } from '@/components/common/error-state'
import { PageHeader } from '@/components/common/page-header'
import { PageSkeleton } from '@/components/common/page-skeleton'
import { PanelHeader } from '@/components/common/panel-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MoneyBreakdown } from '@/components/billing/money-breakdown'
import {
  CoverageStatusBadge,
  InvoiceStatusBadge,
} from '@/components/billing/billing-status-badges'
import { useSession } from '@/hooks/use-auth'
import { billingService } from '@/services'
import { canManageBilling } from '@/lib/roles'
import { formatBdt, formatBdtPrecise, formatPercent } from '@/lib/format'
import {
  INVOICE_TRANSITIONS,
  invoiceCoveragePercent,
  invoiceGross,
  invoiceLineTotal,
  invoiceOutstanding,
  invoicePayable,
  invoiceSubtotal,
} from '@/lib/billing'
import {
  INVOICE_CATEGORY_LABELS,
  INVOICE_STATUS_LABELS,
  type InvoiceStatus,
} from '@/types/billing'

/** Single demo invoice: line items, coverage, balance and workflow actions. */
export function BillingInvoiceDetailPage() {
  const { invoiceId = '' } = useParams()
  const session = useSession()
  const queryClient = useQueryClient()
  const [actionError, setActionError] = useState<string | null>(null)

  const { data: invoice, isLoading, isError, refetch } = useQuery({
    queryKey: ['billing', 'invoice', invoiceId],
    queryFn: () => billingService.getInvoice(invoiceId),
    enabled: invoiceId.length > 0,
  })

  const { data: claims } = useQuery({
    queryKey: ['billing', 'claims'],
    queryFn: () => billingService.listClaims(),
  })

  const { data: providers } = useQuery({
    queryKey: ['billing', 'providers'],
    queryFn: () => billingService.listProviders(),
  })

  const actor = session?.user.fullName ?? 'Billing office'
  const mayEdit = canManageBilling(session?.user.role)

  const statusMutation = useMutation({
    mutationFn: (next: InvoiceStatus) =>
      billingService.updateInvoiceStatus(invoiceId, next, actor),
    onSuccess: async () => {
      setActionError(null)
      await queryClient.invalidateQueries({ queryKey: ['billing'] })
    },
    onError: (error: unknown) => {
      setActionError(error instanceof Error ? error.message : 'That action is not available.')
    },
  })

  if (isLoading) {
    return (
      <Container size="fluid" className="max-w-[90rem] space-y-6 py-6">
        <PageSkeleton kpis={0} />
      </Container>
    )
  }

  if (isError || !invoice) {
    return (
      <Container size="fluid" className="max-w-[90rem] space-y-6 py-6">
        <ErrorState
          title="Invoice not found"
          description={`No demo invoice matches ${invoiceId}.`}
          onRetry={() => void refetch()}
        />
        <Button asChild variant="outline">
          <Link to="/app/billing/invoices">
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back to invoices
          </Link>
        </Button>
      </Container>
    )
  }

  const gross = invoiceGross(invoice)
  const payable = invoicePayable(invoice)
  const outstanding = invoiceOutstanding(invoice)
  const coveragePercent = invoiceCoveragePercent(invoice)
  const provider = providers?.find((entry) => entry.providerId === invoice.insuranceProviderId)
  const linkedClaims = (claims ?? []).filter((claim) => claim.invoiceId === invoice.invoiceId)
  const nextStatuses = INVOICE_TRANSITIONS[invoice.status]

  return (
    <Container size="fluid" className="max-w-[90rem] space-y-6 py-6">
      <PageHeader
        title={invoice.invoiceId}
        description={`${invoice.patientName} · ${invoice.admissionId} · ${invoice.admissionType} admission`}
        actions={
          <>
            <Button asChild variant="ghost">
              <Link to="/app/billing/invoices">
                <ArrowLeft aria-hidden="true" className="size-4" />
                Invoices
              </Link>
            </Button>
            <Button variant="outline" disabled title="Printing is not connected in this demo">
              <Printer aria-hidden="true" className="size-4" />
              Print
            </Button>
            <Button variant="outline" disabled title="PDF export is not connected in this demo">
              <Download aria-hidden="true" className="size-4" />
              PDF
            </Button>
          </>
        }
      />

      <DemoNotice
        tone="warning"
        description="Fictional demo invoice. Printing and PDF export are disabled, no payment is taken, and this document is not a real bill."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card className="shadow-card">
            <CardContent className="space-y-4 p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-2">
                <InvoiceStatusBadge status={invoice.status} />
                <CoverageStatusBadge status={invoice.insuranceStatus} />
                {invoice.insuranceCoveredAmount > 0 ? (
                  <span className="text-xs text-muted-foreground">
                    {formatBdt(invoice.insuranceCoveredAmount)} covered (
                    {formatPercent(coveragePercent)} of gross)
                  </span>
                ) : null}
              </div>

              <DetailList
                items={[
                  { label: 'Patient', value: `${invoice.patientName} (${invoice.patientId})` },
                  { label: 'Admission', value: invoice.admissionId },
                  { label: 'Ward / bed', value: `${invoice.ward} · ${invoice.bed}` },
                  { label: 'Admission type', value: invoice.admissionType },
                  {
                    label: 'Service period',
                    value: `${invoice.periodStart.slice(0, 10)} → ${invoice.periodEnd.slice(0, 10)}`,
                  },
                  { label: 'Issued', value: `${invoice.issuedAt.slice(0, 10)} ${invoice.issuedAt.slice(11, 16)}` },
                  { label: 'Prepared by', value: invoice.preparedBy },
                  {
                    label: 'Insurer',
                    value: provider
                      ? `${provider.name} (${provider.shortName})`
                      : invoice.insuranceStatus === 'self_pay'
                        ? 'Self pay — no policy'
                        : 'Provider not recorded',
                  },
                ]}
              />
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-0">
              <PanelHeader
                title="Charge lines"
                description={`${invoice.lines.length} line items on this demo invoice.`}
                className="border-b px-4 py-3"
              />
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.lines.map((line) => (
                      <TableRow key={line.lineId}>
                        <TableCell className="text-sm font-medium">{line.description}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {INVOICE_CATEGORY_LABELS[line.category]}
                        </TableCell>
                        <TableCell className="text-right text-sm tabular-nums">
                          {line.quantity}
                        </TableCell>
                        <TableCell className="text-right text-sm tabular-nums">
                          {formatBdtPrecise(line.unitPrice)}
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium tabular-nums">
                          {formatBdtPrecise(invoiceLineTotal(line.quantity, line.unitPrice))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {linkedClaims.length > 0 ? (
            <Card className="shadow-card">
              <CardContent className="p-4 sm:p-5">
                <PanelHeader
                  title="Linked insurance claims"
                  description="Claims raised against this invoice in the demo ledger."
                  className="mb-3"
                />
                <ul className="divide-y">
                  {linkedClaims.map((claim) => (
                    <li key={claim.claimId} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2">
                      <Link
                        to={`/app/billing/claims/${claim.claimId}`}
                        className="text-sm font-medium underline-offset-4 hover:underline"
                      >
                        {claim.claimId}
                      </Link>
                      <span className="text-sm text-muted-foreground">{claim.providerName}</span>
                      <span className="ml-auto text-sm font-medium tabular-nums">
                        {formatBdt(claim.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="space-y-4">
          <MoneyBreakdown
            title="Balance"
            rows={[
              { label: 'Subtotal', value: formatBdt(invoiceSubtotal(invoice)) },
              ...(invoice.discount > 0
                ? [
                    {
                      label: 'Discount',
                      hint: invoice.discountReason,
                      value: `− ${formatBdt(invoice.discount)}`,
                    },
                  ]
                : []),
              { label: 'Gross', value: formatBdt(gross), emphasis: true },
              {
                label: 'Insurance covered',
                value:
                  invoice.insuranceCoveredAmount > 0
                    ? `− ${formatBdt(invoice.insuranceCoveredAmount)}`
                    : formatBdt(0),
              },
              { label: 'Patient payable', value: formatBdt(payable) },
              { label: 'Received', value: formatBdt(invoice.paidAmount) },
              {
                label: 'Outstanding',
                value: formatBdt(outstanding),
                emphasis: true,
              },
            ]}
            caption="Demo arithmetic only. No payment gateway, insurer or bank interface is connected."
          />

          <Card className="shadow-card">
            <CardContent className="space-y-3 p-4">
              <PanelHeader
                title="Workflow"
                description={
                  mayEdit
                    ? 'Move this demo invoice to the next state.'
                    : 'Only the billing office can change invoice status in this prototype.'
                }
              />
              {actionError ? (
                <p role="alert" className="text-sm text-destructive">
                  {actionError}
                </p>
              ) : null}
              {invoice.status === 'paid' || invoice.status === 'cancelled' ? (
                <p className="text-sm text-muted-foreground">
                  This invoice is {INVOICE_STATUS_LABELS[invoice.status].toLowerCase()} and has no
                  further transitions.
                </p>
              ) : !mayEdit ? (
                <p className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Lock aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                  You are signed in as a non-billing role, so workflow actions are hidden.
                </p>
              ) : nextStatuses.length === 0 ? (
                <p className="text-sm text-muted-foreground">No transitions available.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {nextStatuses.map((next) => (
                    <Button
                      key={next}
                      variant={next === 'cancelled' ? 'outline' : 'default'}
                      disabled={statusMutation.isPending}
                      onClick={() => statusMutation.mutate(next)}
                    >
                      {next === 'paid' ? (
                        <CheckCheck aria-hidden="true" className="size-4" />
                      ) : next === 'cancelled' ? (
                        <XCircle aria-hidden="true" className="size-4" />
                      ) : null}
                      Mark {INVOICE_STATUS_LABELS[next].toLowerCase()}
                    </Button>
                  ))}
                </div>
              )}
              <Separator />
              <p className="text-xs text-muted-foreground">
                Moving a demo invoice does not record a real payment, cancel a real bill or notify an
                insurer.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4">
              <PanelHeader
                title="Coverage"
                description="Fictional insurer position for this admission."
                className="mb-3"
              />
              {provider ? (
                <DetailList
                  columns={1}
                  items={[
                    { label: 'Provider', value: provider.name },
                    { label: 'Claims contact', value: provider.contactPerson },
                    { label: 'Panel share', value: formatPercent(provider.coverageRatio) },
                    { label: 'Average settlement', value: `${provider.avgSettlementDays} days (demo)` },
                  ]}
                />
              ) : (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck aria-hidden="true" className="size-4" />
                  Self-pay admission — no insurer is attached to this demo invoice.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  )
}
