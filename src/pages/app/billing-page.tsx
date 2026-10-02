import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowUpRight,
  BadgeCheck,
  CircleDollarSign,
  FileStack,
  FileWarning,
  Receipt,
  ShieldCheck,
} from 'lucide-react'
import { Container } from '@/components/common/container'
import { DemoNotice } from '@/components/common/demo-notice'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { KpiCard } from '@/components/common/kpi-card'
import { PageHeader } from '@/components/common/page-header'
import { PageSkeleton } from '@/components/common/page-skeleton'
import { StatusBadge } from '@/components/common/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BillingMixChart, OutstandingSplitChart } from '@/components/billing/billing-charts'
import { CLAIM_TONES, InvoiceStatusBadge } from '@/components/billing/billing-status-badges'
import { billingService } from '@/services'
import { useSession } from '@/hooks/use-auth'
import { roleLabels } from '@/data/mock/demo-users'
import { canManageBilling } from '@/lib/roles'
import { formatBdt, formatBdtCompact } from '@/lib/format'
import { invoiceOutstanding } from '@/lib/billing'
import {
  CLAIM_STATUS_LABELS,
  type ClaimStatus,
} from '@/types/billing'

/** Billing module landing: money owed, claim progress and the queues to work. */
export function BillingPage() {
  const session = useSession()
  const role = session?.user.role

  const summaryQuery = useQuery({
    queryKey: ['billing', 'summary'],
    queryFn: () => billingService.getSummary(),
  })
  const invoicesQuery = useQuery({
    queryKey: ['billing', 'invoices'],
    queryFn: () => billingService.listInvoices(),
  })
  const claimsQuery = useQuery({
    queryKey: ['billing', 'claims'],
    queryFn: () => billingService.listClaims(),
  })

  const summary = summaryQuery.data
  const invoices = useMemo(
    () =>
      [...(invoicesQuery.data ?? [])].sort(
        (a, b) => invoiceOutstanding(b) - invoiceOutstanding(a),
      ),
    [invoicesQuery.data],
  )
  const claims = useMemo(() => claimsQuery.data ?? [], [claimsQuery.data])

  const openInvoices = useMemo(
    () => invoices.filter((invoice) => invoice.status !== 'paid' && invoice.status !== 'cancelled'),
    [invoices],
  )
  const actionableClaims = useMemo(
    () =>
      claims.filter(
        (claim) => claim.status === 'submitted' || claim.status === 'under_review',
      ),
    [claims],
  )
  const rejectedClaims = useMemo(
    () => claims.filter((claim) => claim.status === 'rejected'),
    [claims],
  )

  if (summaryQuery.isLoading || invoicesQuery.isLoading || claimsQuery.isLoading) {
    return (
      <Container size="fluid" className="max-w-[90rem] space-y-6 py-6">
        <PageSkeleton kpis={4} />
      </Container>
    )
  }

  if (summaryQuery.isError || invoicesQuery.isError) {
    return (
      <Container size="fluid" className="max-w-[90rem] space-y-6 py-6">
        <ErrorState
          title="Could not load billing"
          description="The demo billing ledger could not be read. Please try again."
          onRetry={() => {
            void summaryQuery.refetch()
            void invoicesQuery.refetch()
          }}
        />
      </Container>
    )
  }

  return (
    <Container size="fluid" className="max-w-[90rem] space-y-6 py-6">
      <PageHeader
        title="Billing & insurance"
        description={
          role
            ? `Invoices, coverage and claims for the ${roleLabels[role]} workspace.`
            : 'Invoices, coverage and claims across the facility.'
        }
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/app/billing/invoices">
                <Receipt aria-hidden="true" className="size-4" />
                All invoices
              </Link>
            </Button>
            <Button asChild>
              <Link to="/app/billing/claims">
                <ShieldCheck aria-hidden="true" className="size-4" />
                Claims
              </Link>
            </Button>
          </>
        }
      />

      <DemoNotice
        tone="warning"
        title="Fictional financial demo"
        description="Every invoice, insurer, policy and claim below is invented for interface demonstration. No payment is taken, no insurer is contacted, and no figure here is a real financial or insurance record."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Outstanding"
          value={formatBdtCompact(summary?.totalOutstanding ?? 0)}
          context="Patient and payer balances still to collect"
          icon={CircleDollarSign}
          tone={summary && summary.totalOutstanding > 0 ? 'warning' : 'success'}
        />
        <KpiCard
          label="Received today"
          value={formatBdtCompact(summary?.paidToday ?? 0)}
          context="Payments recorded against invoices issued today"
          icon={BadgeCheck}
          tone="success"
        />
        <KpiCard
          label="Open invoices"
          value={summary?.openInvoices ?? 0}
          context="Draft, pending or partly paid"
          icon={FileStack}
          tone="info"
        />
        <KpiCard
          label="Claims in flight"
          value={summary?.pendingClaims ?? 0}
          context="Submitted, under review or approved"
          icon={ShieldCheck}
          tone="info"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <BillingMixChart invoices={invoices} className="lg:col-span-2" />
        <OutstandingSplitChart invoices={invoices} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
            <div>
              <CardTitle className="text-base">Largest outstanding balances</CardTitle>
              <p className="text-sm text-muted-foreground">
                Demo invoices ordered by the amount still owed.
              </p>
            </div>
            <Button asChild variant="ghost" size="sm" className="shrink-0">
              <Link to="/app/billing/invoices">
                View all
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {openInvoices.length === 0 ? (
              <EmptyState
                title="Nothing outstanding"
                description="Every demo invoice is settled."
                className="border-0 bg-transparent py-6"
              />
            ) : (
              <ul className="divide-y">
                {openInvoices.slice(0, 5).map((invoice) => (
                  <li key={invoice.invoiceId} className="py-2.5 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <Link
                        to={`/app/billing/invoices/${invoice.invoiceId}`}
                        className="text-sm font-medium underline-offset-4 hover:underline"
                      >
                        {invoice.invoiceId}
                      </Link>
                      <span className="text-sm text-muted-foreground">{invoice.patientName}</span>
                      <span className="ml-auto text-sm font-semibold tabular-nums">
                        {formatBdt(invoiceOutstanding(invoice))}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <InvoiceStatusBadge status={invoice.status} />
                      <span className="text-xs text-muted-foreground">
                        {invoice.ward} · {invoice.bed} · issued {invoice.periodEnd.slice(0, 10)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
            <div>
              <CardTitle className="text-base">Claims needing attention</CardTitle>
              <p className="text-sm text-muted-foreground">
                Submitted, under review and rejected demo claims.
              </p>
            </div>
            <Button asChild variant="ghost" size="sm" className="shrink-0">
              <Link to="/app/billing/claims">
                View all
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {actionableClaims.length === 0 && rejectedClaims.length === 0 ? (
              <EmptyState
                title="No open claims"
                description="Every demo claim has been settled."
                className="border-0 bg-transparent py-6"
              />
            ) : (
              <ul className="divide-y">
                {[...actionableClaims, ...rejectedClaims].slice(0, 5).map((claim) => (
                  <li key={claim.claimId} className="py-2.5 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <Link
                        to={`/app/billing/claims/${claim.claimId}`}
                        className="text-sm font-medium underline-offset-4 hover:underline"
                      >
                        {claim.claimId}
                      </Link>
                      <span className="text-sm text-muted-foreground">{claim.patientName}</span>
                      <span className="ml-auto text-sm font-semibold tabular-nums">
                        {formatBdt(claim.amount)}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <StatusBadge
                        tone={CLAIM_TONES[claim.status as ClaimStatus]}
                        label={CLAIM_STATUS_LABELS[claim.status]}
                      />
                      <span className="text-xs text-muted-foreground">{claim.providerName}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Billed (live invoices)"
          value={formatBdtCompact(summary?.billedThisMonth ?? 0)}
          context="Excludes drafts and cancelled invoices"
          icon={Receipt}
          tone="neutral"
        />
        <KpiCard
          label="Insurer approved"
          value={formatBdtCompact(summary?.approvedThisMonth ?? 0)}
          context="Approved and settled demo claims"
          icon={ShieldCheck}
          tone="success"
        />
        <KpiCard
          label="Rejected claims"
          value={summary?.rejectedThisMonth ?? 0}
          context="Fictional insurer decisions to review"
          icon={FileWarning}
          tone="critical"
        />
        <KpiCard
          label="Your access"
          value={canManageBilling(role) ? 'Full edit' : 'Read only'}
          context={
            canManageBilling(role)
              ? 'You can move invoices and claims through their workflow'
              : 'Workflow actions are limited to the billing office'
          }
          icon={BadgeCheck}
          tone={canManageBilling(role) ? 'info' : 'neutral'}
        />
      </div>
    </Container>
  )
}
