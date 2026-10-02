import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FileText, Receipt, Wallet } from 'lucide-react'
import { Container } from '@/components/common/container'
import { DataToolbar } from '@/components/common/data-toolbar'
import { DemoNotice } from '@/components/common/demo-notice'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { KpiCard } from '@/components/common/kpi-card'
import { PageHeader } from '@/components/common/page-header'
import { PageSkeleton } from '@/components/common/page-skeleton'
import { SortableHead } from '@/components/common/sortable-head'
import { TablePager } from '@/components/common/table-pager'
import { Button } from '@/components/ui/button'
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
import {
  CoverageStatusBadge,
  InvoiceStatusBadge,
} from '@/components/billing/billing-status-badges'
import { useListControls } from '@/hooks/use-list-controls'
import { billingService } from '@/services'
import { formatBdt, formatBdtCompact, formatPercent } from '@/lib/format'
import { invoiceCoveragePercent, invoiceGross, invoiceOutstanding } from '@/lib/billing'
import { matchesQuery } from '@/lib/table'
import {
  INVOICE_STATUSES,
  INVOICE_STATUS_LABELS,
  INSURANCE_COVERAGE_STATUSES,
  INSURANCE_COVERAGE_LABELS,
  type Invoice,
  type InvoiceStatus,
  type InsuranceCoverageStatus,
} from '@/types/billing'

const PAGE_SIZE = 8

/** Invoice register with search, status/coverage filters, sorting and paging. */
export function BillingInvoicesPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('all')
  const [coverage, setCoverage] = useState<string>('all')

  const { data: invoices, isLoading, isError, refetch } = useQuery({
    queryKey: ['billing', 'invoices'],
    queryFn: () => billingService.listInvoices(),
  })

  const all = useMemo(() => invoices ?? [], [invoices])

  const filtered = useMemo(
    () =>
      all.filter((invoice) => {
        if (status !== 'all' && invoice.status !== status) return false
        if (coverage !== 'all' && invoice.insuranceStatus !== coverage) return false
        if (search.trim()) {
          return matchesQuery(
            `${invoice.invoiceId} ${invoice.patientName} ${invoice.patientId} ${invoice.admissionId} ${invoice.ward} ${invoice.bed} ${invoice.preparedBy}`,
            search,
          )
        }
        return true
      }),
    [all, status, coverage, search],
  )

  const { rows, total, sort, onSort, page, pageCount, setPage } =
    useListControls<Invoice, 'invoice' | 'patient' | 'issued' | 'gross' | 'outstanding'>({
      rows: filtered,
      accessors: {
        invoice: (invoice) => invoice.invoiceId,
        patient: (invoice) => invoice.patientName,
        issued: (invoice) => invoice.issuedAt,
        gross: (invoice) => invoiceGross(invoice),
        outstanding: (invoice) => invoiceOutstanding(invoice),
      },
      initialSort: { key: 'issued', direction: 'desc' },
      pageSize: PAGE_SIZE,
    })

  const totals = useMemo(
    () => ({
      outstanding: all
        .filter((invoice) => invoice.status !== 'cancelled' && invoice.status !== 'draft')
        .reduce((sum, invoice) => sum + invoiceOutstanding(invoice), 0),
      paid: all.reduce((sum, invoice) => sum + invoice.paidAmount, 0),
      open: all.filter(
        (invoice) => invoice.status !== 'paid' && invoice.status !== 'cancelled',
      ).length,
    }),
    [all],
  )

  const hasFilters = search !== '' || status !== 'all' || coverage !== 'all'

  if (isLoading) {
    return (
      <Container size="fluid" className="max-w-[90rem] space-y-6 py-6">
        <PageSkeleton kpis={3} />
      </Container>
    )
  }

  if (isError) {
    return (
      <Container size="fluid" className="max-w-[90rem] space-y-6 py-6">
        <ErrorState
          title="Could not load invoices"
          description="The demo invoice register could not be read. Please try again."
          onRetry={() => void refetch()}
        />
      </Container>
    )
  }

  return (
    <Container size="fluid" className="max-w-[90rem] space-y-6 py-6">
      <PageHeader
        title="Invoices"
        description="Every demo invoice raised against an admission, with coverage and collection position."
        actions={
          <Button asChild variant="outline">
            <Link to="/app/billing">
              <Wallet aria-hidden="true" className="size-4" />
              Billing overview
            </Link>
          </Button>
        }
      />

      <DemoNotice description="Demo figures in Bangladeshi Taka. No payment is collected here and no billing system is connected." />

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          label="Outstanding"
          value={formatBdtCompact(totals.outstanding)}
          context="Across issued demo invoices"
          icon={Wallet}
          tone="warning"
        />
        <KpiCard
          label="Collected"
          value={formatBdtCompact(totals.paid)}
          context="Payments recorded in the demo ledger"
          icon={Receipt}
          tone="success"
        />
        <KpiCard
          label="Open invoices"
          value={totals.open}
          context="Not yet fully settled"
          icon={FileText}
          tone="info"
        />
      </div>

      <DataToolbar
        searchId="invoice-search"
        searchLabel="Search invoices by number, patient, admission or ward"
        searchPlaceholder="Search invoices…"
        value={search}
        onValueChange={(value) => {
          setSearch(value)
          setPage(1)
        }}
        canReset={hasFilters}
        onReset={() => {
          setSearch('')
          setStatus('all')
          setCoverage('all')
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
          <SelectTrigger aria-label="Filter by invoice status">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {INVOICE_STATUSES.map((value) => (
              <SelectItem key={value} value={value}>
                {INVOICE_STATUS_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={coverage}
          onValueChange={(value) => {
            setCoverage(value)
            setPage(1)
          }}
        >
          <SelectTrigger aria-label="Filter by insurance coverage">
            <SelectValue placeholder="All coverage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All coverage</SelectItem>
            {INSURANCE_COVERAGE_STATUSES.map((value) => (
              <SelectItem key={value} value={value}>
                {INSURANCE_COVERAGE_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </DataToolbar>

      {rows.length === 0 ? (
        <EmptyState
          title="No invoices match"
          description={
            hasFilters
              ? 'Adjust the search or filters to see more invoices.'
              : 'No demo invoices have been raised yet.'
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHead columnKey="invoice" sort={sort} onSort={onSort}>
                  Invoice
                </SortableHead>
                <SortableHead columnKey="patient" sort={sort} onSort={onSort}>
                  Patient
                </SortableHead>
                <SortableHead columnKey="issued" sort={sort} onSort={onSort}>
                  Issued
                </SortableHead>
                <SortableHead columnKey="gross" sort={sort} onSort={onSort} numeric>
                  Gross
                </SortableHead>
                <SortableHead columnKey="outstanding" sort={sort} onSort={onSort} numeric>
                  Outstanding
                </SortableHead>
                <TableHead>Status</TableHead>
                <TableHead>Coverage</TableHead>
                <TableHead className="text-right">Open</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((invoice) => (
                <TableRow key={invoice.invoiceId}>
                  <TableCell>
                    <p className="text-sm font-medium">{invoice.invoiceId}</p>
                    <p className="text-xs text-muted-foreground">{invoice.admissionId}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium">{invoice.patientName}</p>
                    <p className="text-xs text-muted-foreground">
                      {invoice.patientId} · {invoice.ward} {invoice.bed}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground tabular-nums">
                    {invoice.issuedAt.slice(0, 10)}
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium tabular-nums">
                    {formatBdt(invoiceGross(invoice))}
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium tabular-nums">
                    {formatBdt(invoiceOutstanding(invoice))}
                  </TableCell>
                  <TableCell>
                    <InvoiceStatusBadge status={invoice.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col items-start gap-1">
                      <CoverageStatusBadge status={invoice.insuranceStatus} />
                      {invoice.insuranceCoveredAmount > 0 ? (
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {formatBdt(invoice.insuranceCoveredAmount)} ·{' '}
                          {formatPercent(invoiceCoveragePercent(invoice))}
                        </span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link
                        to={`/app/billing/invoices/${invoice.invoiceId}`}
                        aria-label={`Open invoice ${invoice.invoiceId} for ${invoice.patientName}`}
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
      )}

      <TablePager
        page={page}
        pageCount={pageCount}
        onPageChange={setPage}
        total={total}
        unitLabel="invoices"
        pageSize={PAGE_SIZE}
      />

      <p className="text-xs text-muted-foreground">
        Status filters use the demo workflow only. Cancelled invoices carry no balance.
        {status !== 'all'
          ? ` Filtered by ${INVOICE_STATUS_LABELS[status as InvoiceStatus]}.`
          : ''}
        {coverage !== 'all'
          ? ` Coverage: ${INSURANCE_COVERAGE_LABELS[coverage as InsuranceCoverageStatus]}.`
          : ''}
      </p>
    </Container>
  )
}
