import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Building2, CheckCircle2, FileWarning, ShieldCheck, Users } from 'lucide-react'
import { Container } from '@/components/common/container'
import { DataToolbar } from '@/components/common/data-toolbar'
import { DemoNotice } from '@/components/common/demo-notice'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { KpiCard } from '@/components/common/kpi-card'
import { PageHeader } from '@/components/common/page-header'
import { PageSkeleton } from '@/components/common/page-skeleton'
import { PanelHeader } from '@/components/common/panel-header'
import { SortableHead } from '@/components/common/sortable-head'
import { StatusBadge } from '@/components/common/status-badge'
import { TablePager } from '@/components/common/table-pager'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CLAIM_TONES } from '@/components/billing/billing-status-badges'
import { useListControls } from '@/hooks/use-list-controls'
import { billingService } from '@/services'
import { formatBdt, formatBdtCompact, formatPercent } from '@/lib/format'
import { claimSettlementPercent } from '@/lib/billing'
import { matchesQuery } from '@/lib/table'
import {
  CLAIM_STATUSES,
  CLAIM_STATUS_LABELS,
  type ClaimStatus,
  type InsuranceClaim,
} from '@/types/billing'

const PAGE_SIZE = 8

/** Insurance claim register plus the fictional provider panel. */
export function BillingClaimsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('all')
  const [provider, setProvider] = useState<string>('all')

  const claimsQuery = useQuery({
    queryKey: ['billing', 'claims'],
    queryFn: () => billingService.listClaims(),
  })
  const providersQuery = useQuery({
    queryKey: ['billing', 'providers'],
    queryFn: () => billingService.listProviders(),
  })

  const claims = useMemo(() => claimsQuery.data ?? [], [claimsQuery.data])
  const providers = providersQuery.data ?? []

  const filtered = useMemo(
    () =>
      claims.filter((claim) => {
        if (status !== 'all' && claim.status !== status) return false
        if (provider !== 'all' && claim.providerId !== provider) return false
        if (search.trim()) {
          return matchesQuery(
            `${claim.claimId} ${claim.invoiceId} ${claim.patientName} ${claim.patientId} ${claim.providerName} ${claim.policyNumber}`,
            search,
          )
        }
        return true
      }),
    [claims, status, provider, search],
  )

  const { rows, total, sort, onSort, page, pageCount, setPage } = useListControls<
    InsuranceClaim,
    'claim' | 'patient' | 'amount' | 'updated'
  >({
    rows: filtered,
    accessors: {
      claim: (claim) => claim.claimId,
      patient: (claim) => claim.patientName,
      amount: (claim) => claim.amount,
      updated: (claim) => claim.updatedAt,
    },
    initialSort: { key: 'updated', direction: 'desc' },
    pageSize: PAGE_SIZE,
  })

  const totals = useMemo(
    () => ({
      claimed: claims.reduce((sum, claim) => sum + claim.amount, 0),
      approved: claims.reduce((sum, claim) => sum + claim.approvedAmount, 0),
      inFlight: claims.filter(
        (claim) => claim.status === 'submitted' || claim.status === 'under_review',
      ).length,
      rejected: claims.filter((claim) => claim.status === 'rejected').length,
    }),
    [claims],
  )

  const hasFilters = search !== '' || status !== 'all' || provider !== 'all'

  if (claimsQuery.isLoading || providersQuery.isLoading) {
    return (
      <Container size="fluid" className="max-w-[90rem] space-y-6 py-6">
        <PageSkeleton kpis={4} />
      </Container>
    )
  }

  if (claimsQuery.isError) {
    return (
      <Container size="fluid" className="max-w-[90rem] space-y-6 py-6">
        <ErrorState
          title="Could not load claims"
          description="The demo claim register could not be read. Please try again."
          onRetry={() => void claimsQuery.refetch()}
        />
      </Container>
    )
  }

  return (
    <Container size="fluid" className="max-w-[90rem] space-y-6 py-6">
      <PageHeader
        title="Insurance claims"
        description="Fictional claim submissions and insurer decisions for demo invoices."
        actions={
          <Button asChild variant="outline">
            <Link to="/app/billing">Billing overview</Link>
          </Button>
        }
      />

      <DemoNotice
        tone="warning"
        title="No insurer is connected"
        description="Insurers, policies, panels and decisions below are invented. Nothing is submitted to or received from any real insurance company, and no claim here is a real document."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Claimed"
          value={formatBdtCompact(totals.claimed)}
          context="Total demo claim value"
          icon={ShieldCheck}
          tone="info"
        />
        <KpiCard
          label="Approved"
          value={formatBdtCompact(totals.approved)}
          context="Fictional insurer approvals"
          icon={CheckCircle2}
          tone="success"
        />
        <KpiCard
          label="In flight"
          value={totals.inFlight}
          context="Submitted or under review"
          icon={FileWarning}
          tone="warning"
        />
        <KpiCard
          label="Rejected"
          value={totals.rejected}
          context="Demo rejections to review"
          icon={FileWarning}
          tone="critical"
        />
      </div>

      <DataToolbar
        searchId="claim-search"
        searchLabel="Search claims by number, invoice, patient, insurer or policy"
        searchPlaceholder="Search claims…"
        value={search}
        onValueChange={(value) => {
          setSearch(value)
          setPage(1)
        }}
        canReset={hasFilters}
        onReset={() => {
          setSearch('')
          setStatus('all')
          setProvider('all')
          setPage(1)
        }}
      >
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value)
            setPage(1)
          }}
        >
          <SelectTrigger aria-label="Filter by claim status">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {CLAIM_STATUSES.map((value) => (
              <SelectItem key={value} value={value}>
                {CLAIM_STATUS_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={provider}
          onValueChange={(value) => {
            setProvider(value)
            setPage(1)
          }}
        >
          <SelectTrigger aria-label="Filter by insurer">
            <SelectValue placeholder="All insurers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All insurers</SelectItem>
            {providers.map((entry) => (
              <SelectItem key={entry.providerId} value={entry.providerId}>
                {entry.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </DataToolbar>

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="lg:col-span-3">
          {rows.length === 0 ? (
            <EmptyState
              title="No claims match"
              description={
                hasFilters
                  ? 'Adjust the search or filters to see more claims.'
                  : 'No demo claims have been raised yet.'
              }
            />
          ) : (
            <div className="overflow-hidden rounded-xl border bg-card">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableHead columnKey="claim" sort={sort} onSort={onSort}>
                        Claim
                      </SortableHead>
                      <SortableHead columnKey="patient" sort={sort} onSort={onSort}>
                        Patient
                      </SortableHead>
                      <TableHead>Insurer</TableHead>
                      <SortableHead columnKey="amount" sort={sort} onSort={onSort} numeric>
                        Claimed
                      </SortableHead>
                      <TableHead>Approved</TableHead>
                      <TableHead>Status</TableHead>
                      <SortableHead columnKey="updated" sort={sort} onSort={onSort}>
                        Updated
                      </SortableHead>
                      <TableHead className="text-right">Open</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((claim) => (
                      <TableRow key={claim.claimId}>
                        <TableCell>
                          <p className="text-sm font-medium">{claim.claimId}</p>
                          <p className="text-xs text-muted-foreground">{claim.invoiceId}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm font-medium">{claim.patientName}</p>
                          <p className="text-xs text-muted-foreground">{claim.patientId}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{claim.providerName}</p>
                          <p className="text-xs text-muted-foreground">{claim.policyNumber}</p>
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium tabular-nums">
                          {formatBdt(claim.amount)}
                        </TableCell>
                        <TableCell className="text-right text-sm tabular-nums">
                          {claim.approvedAmount > 0 ? (
                            <>
                              <span className="font-medium">{formatBdt(claim.approvedAmount)}</span>
                              <span className="block text-xs text-muted-foreground">
                                {formatPercent(claimSettlementPercent(claim))}
                              </span>
                            </>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <StatusBadge
                            tone={CLAIM_TONES[claim.status as ClaimStatus]}
                            label={CLAIM_STATUS_LABELS[claim.status]}
                          />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground tabular-nums">
                          {claim.updatedAt.slice(0, 10)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild size="sm" variant="outline">
                            <Link
                              to={`/app/billing/claims/${claim.claimId}`}
                              aria-label={`Open claim ${claim.claimId} for ${claim.patientName}`}
                            >
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <TablePager
            page={page}
            pageCount={pageCount}
            onPageChange={setPage}
            total={total}
            unitLabel="claims"
            pageSize={PAGE_SIZE}
            className="mt-4"
          />
        </div>

        <Card className="h-fit shadow-card">
          <CardContent className="space-y-4 p-4">
            <PanelHeader
              title="Fictional insurer panel"
              description="Demo providers and their invented claim behaviour."
            />
            {providers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No demo providers recorded.</p>
            ) : (
              <ul className="space-y-3">
                {providers.map((entry) => (
                  <li key={entry.providerId} className="rounded-lg border p-3">
                    <div className="flex items-start gap-2">
                      <Building2
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{entry.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {entry.shortName} · {entry.contactPerson}
                        </p>
                      </div>
                    </div>
                    <dl className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <dt className="text-muted-foreground">Panel share</dt>
                        <dd className="font-medium tabular-nums">
                          {formatPercent(entry.coverageRatio)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Active policies</dt>
                        <dd className="font-medium tabular-nums">{entry.activePolicies}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Claims this month</dt>
                        <dd className="font-medium tabular-nums">{entry.claimsThisMonth}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Avg settlement</dt>
                        <dd className="font-medium tabular-nums">
                          {entry.avgSettlementDays} days
                        </dd>
                      </div>
                    </dl>
                  </li>
                ))}
              </ul>
            )}
            <p className="flex items-start gap-2 text-xs text-muted-foreground">
              <Users aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
              Panel share, policy counts and turnaround times are invented for the demo and do
              not describe any real insurer.
            </p>
          </CardContent>
        </Card>
      </div>
    </Container>
  )
}
